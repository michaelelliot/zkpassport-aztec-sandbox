mod capsule;
mod types;
mod interfaces;
mod utils;
mod actions;
mod globals;

contract zkPassportToken {
    use crate::globals::{
        THRESHOLD_1_KEY,
        THRESHOLD_2_KEY,
        THRESHOLD_3_KEY,
        ALLOWED_CERT_PUBKEYS_MTREE_ROOT_KEY,
        ALLOWED_COUNTRIES_MTREE_ROOT_KEY,
    };

    use crate::actions;
    use crate::utils::{ arr_copy_field_to_u8, pop_capsule_u8_array, pop_capsule_u16_array, pop_capsule_single, pop_capsule_field_array };
    use crate::capsule::pop_capsule;
    use dep::zkpassport::verify_zkpassport_country;

    use dep::aztec::oracle::debug_log::{ debug_log, debug_log_format };
    use dep::std::option::Option;
    use dep::safe_math::SafeU120;
    use dep::aztec::{
        note::{
            note_getter_options::NoteGetterOptions,
            note_header::NoteHeader,
            utils as note_utils,
        },
        context::{ PrivateContext, PublicContext, Context },
        hash::{ compute_secret_hash },
        state_vars::{ map::Map, public_state::PublicState, set::Set, immutable_singleton::ImmutableSingleton },
        types::type_serialization::{
            field_serialization::{ FieldSerializationMethods, FIELD_SERIALIZED_LEN },
            bool_serialization::{ BoolSerializationMethods, BOOL_SERIALIZED_LEN },
            aztec_address_serialization::{ AztecAddressSerializationMethods, AZTEC_ADDRESS_SERIALIZED_LEN },
        },
        types::address::{ AztecAddress },
        selector::compute_selector,
    };
    use dep::field_note::field_note::{ FieldNote, FieldNoteMethods, FIELD_NOTE_LEN };
    use dep::authwit::{
        auth::{
            assert_current_call_valid_authwit,
            assert_current_call_valid_authwit_public,
        },
    };
    use crate::types::{
        transparent_note::{ TransparentNote, TransparentNoteMethods, TRANSPARENT_NOTE_LEN },
        token_note::{ TokenNote, TokenNoteMethods, TOKEN_NOTE_LEN },
        balances_map::{ BalancesMap },
        safe_u120_serialization::{ SafeU120SerializationMethods, SAFE_U120_SERIALIZED_LEN },
        roles::UserFlags,
    };
    use crate::interfaces::SlowMap;

    struct Storage {
        admin: PublicState<AztecAddress, AZTEC_ADDRESS_SERIALIZED_LEN>,
        balances: BalancesMap,
        total_supply: PublicState<SafeU120, SAFE_U120_SERIALIZED_LEN>,
        pending_shields: Set<TransparentNote, TRANSPARENT_NOTE_LEN>,
        public_balances: Map<PublicState<SafeU120, SAFE_U120_SERIALIZED_LEN>>,
        slow_update: ImmutableSingleton<FieldNote, FIELD_NOTE_LEN>,
        public_slow_update: PublicState<AztecAddress, AZTEC_ADDRESS_SERIALIZED_LEN>,
        threshold_limit_1: PublicState<SafeU120, SAFE_U120_SERIALIZED_LEN>,
        threshold_limit_2: PublicState<SafeU120, SAFE_U120_SERIALIZED_LEN>,
        threshold_limit_3: PublicState<SafeU120, SAFE_U120_SERIALIZED_LEN>,
        allowed_countries_mtree_root: PublicState<Field, FIELD_SERIALIZED_LEN>,
        allowed_cert_pubkeys_mtree_root: PublicState<Field, FIELD_SERIALIZED_LEN>,
    }

    impl Storage {
        fn init(context: Context) -> pub Self {
            Storage {
                admin: PublicState::new(
                    context,
                    1,
                    AztecAddressSerializationMethods,
                ),
                balances: BalancesMap::new(context, 3),
                total_supply: PublicState::new(
                    context,
                    4,
                    SafeU120SerializationMethods,
                ),
                pending_shields: Set::new(context, 5, TransparentNoteMethods),
                public_balances: Map::new(
                    context,
                    6,
                    |context, slot| {
                        PublicState::new(
                            context,
                            slot,
                            SafeU120SerializationMethods,
                        )
                    },
                ),
                slow_update: ImmutableSingleton::new(context, 7, FieldNoteMethods),
                public_slow_update: PublicState::new(
                    context,
                    8,
                    AztecAddressSerializationMethods,
                ),
                threshold_limit_1: PublicState::new(
                    context,
                    9,
                    SafeU120SerializationMethods,
                ),
                threshold_limit_2: PublicState::new(
                    context,
                    10,
                    SafeU120SerializationMethods,
                ),
                threshold_limit_3: PublicState::new(
                    context,
                    11,
                    SafeU120SerializationMethods,
                ),
                allowed_countries_mtree_root: PublicState::new(
                    context,
                    12,
                    FieldSerializationMethods,
                ),
                allowed_cert_pubkeys_mtree_root: PublicState::new(
                    context,
                    13,
                    FieldSerializationMethods,
                ),
            }
        }
    }

    #[aztec(private)]
    fn constructor(admin: AztecAddress, slow_updates_contract: AztecAddress) {
        let mut slow_note = FieldNote::new(slow_updates_contract.address);
        storage.slow_update.initialize(&mut slow_note, Option::none(), false);
        let selector = compute_selector("_initialize((Field),(Field))");
        context.call_public_function(
            context.this_address(),
            selector,
            [admin.address, slow_updates_contract.address]
        );
    }

    // Only to be called from init_slow_tree
    #[aztec(public)]
    internal fn _init_slow_tree(caller: AztecAddress) {
        assert(storage.admin.read().eq(caller), "caller is not admin");
    }
    #[aztec(private)]
    fn init_slow_tree(user: AztecAddress) {
        let roles = UserFlags { is_admin: true, is_minter: true, is_blacklisted: false }.get_value() as Field;
        let slow = SlowMap::at(AztecAddress::new(storage.slow_update.get_note().value));
        slow.update_at_private(&mut context, user.address, roles);
        context.call_public_function(context.this_address(), compute_selector("_init_slow_tree((Field))"), [context.msg_sender()]);
    }

    #[aztec(public)]
    internal fn _initialize(new_admin: AztecAddress, slow_updates_contract: AztecAddress) {
        assert(new_admin.address != 0, "invalid admin");
        storage.admin.write(new_admin);
        storage.public_slow_update.write(slow_updates_contract);
        SlowMap::at(slow_updates_contract).initialize(context);
    }

    #[aztec(private)]
    fn update_roles(user: AztecAddress, roles: Field) {
        let slow = SlowMap::at(AztecAddress::new(storage.slow_update.get_note().value));
        let caller_roles = UserFlags::new(slow.read_at(&mut context, context.msg_sender()) as u120);
        assert(caller_roles.is_admin, "caller is not admin");
        slow.update_at_private(&mut context, user.address, roles);
    }

    // Only to be called from set_allowed_countries_mtree_root
    #[aztec(public)]
    internal fn _set_allowed_countries_mtree_root(root: Field) {
        debug_log_format("_set_allowed_countries_mtree_root (public): {0}", [root]);
        storage.allowed_countries_mtree_root.write(root);
    }
    #[aztec(private)]
    fn set_allowed_countries_mtree_root(root: Field) {
        debug_log_format("set_allowed_countries_mtree_root: {0}", [root as Field]);
        let slow = SlowMap::at(AztecAddress::new(storage.slow_update.get_note().value));
        slow.update_at_private(&mut context, ALLOWED_COUNTRIES_MTREE_ROOT_KEY, root);
        let selector = compute_selector("_set_allowed_countries_mtree_root(Field)");
        context.call_public_function(context.this_address(), selector, [root]);
    }

    // Only to be called from set_allowed_cert_pubkeys_mtree_root
    #[aztec(public)]
    internal fn _set_allowed_cert_pubkeys_mtree_root(root: Field) {
        debug_log_format("_set_allowed_cert_pubkeys_mtree_root (public): {0}", [root]);
        storage.allowed_cert_pubkeys_mtree_root.write(root);
    }
    #[aztec(private)]
    fn set_allowed_cert_pubkeys_mtree_root(root: Field) {
        debug_log_format("set_allowed_cert_pubkeys_mtree_root: {0}", [root as Field]);
        let slow = SlowMap::at(AztecAddress::new(storage.slow_update.get_note().value));
        slow.update_at_private(&mut context, ALLOWED_CERT_PUBKEYS_MTREE_ROOT_KEY, root);
        let selector = compute_selector("_set_allowed_cert_pubkeys_mtree_root(Field)");
        context.call_public_function(context.this_address(), selector, [root]);
    }

    // Only to be called from set_threshold_1
    #[aztec(public)]
    internal fn _set_threshold_1(threshold: Field) {
        debug_log_format("_set_threshold_1 (public): {0}", [threshold]);
        storage.threshold_limit_1.write(SafeU120::new(threshold));
    }
    #[aztec(private)]
    fn set_threshold_1(threshold: Field) {
        debug_log_format("set_threshold_1: {0}", [threshold as Field]);
        let slow = SlowMap::at(AztecAddress::new(storage.slow_update.get_note().value));
        slow.update_at_private(&mut context, THRESHOLD_1_KEY, threshold);
        let selector = compute_selector("_set_threshold_1(Field)");
        context.call_public_function(context.this_address(), selector, [threshold]);
    }

    // Only to be called from set_threshold_2
    #[aztec(public)]
    internal fn _set_threshold_2(threshold: Field) {
        debug_log_format("_set_threshold_2 (public): {0}", [threshold]);
        storage.threshold_limit_2.write(SafeU120::new(threshold));
    }
    #[aztec(private)]
    fn set_threshold_2(threshold: Field) {
        debug_log_format("set_threshold_2: {0}", [threshold as Field]);
        let slow = SlowMap::at(AztecAddress::new(storage.slow_update.get_note().value));
        slow.update_at_private(&mut context, THRESHOLD_2_KEY, threshold);
        let selector = compute_selector("_set_threshold_2(Field)");
        context.call_public_function(context.this_address(), selector, [threshold]);
    }

    // Only to be called from set_threshold_3
    #[aztec(public)]
    internal fn _set_threshold_3(threshold: Field) {
        debug_log_format("_set_threshold_3 (public): {0}", [threshold]);
        storage.threshold_limit_3.write(SafeU120::new(threshold));
    }
    #[aztec(private)]
    fn set_threshold_3(threshold: Field) {
        debug_log_format("set_threshold_3: {0}", [threshold as Field]);
        let slow = SlowMap::at(AztecAddress::new(storage.slow_update.get_note().value));
        slow.update_at_private(&mut context, THRESHOLD_3_KEY, threshold);
        let selector = compute_selector("_set_threshold_3(Field)");
        context.call_public_function(context.this_address(), selector, [threshold]);
    }

    #[aztec(private)]
    fn verify_passport(active_auth: bool) {
        let slow = SlowMap::at(AztecAddress::new(storage.slow_update.get_note().value));
        let allowed_cert_pubkeys_mtree_root = slow.read_at(&mut context, ALLOWED_CERT_PUBKEYS_MTREE_ROOT_KEY) as Field;
        debug_log_format("verify_passport() allowed_cert_pubkeys_mtree_root={0}", [allowed_cert_pubkeys_mtree_root]);
        let allowed_countries_mtree_root = slow.read_at(&mut context, ALLOWED_COUNTRIES_MTREE_ROOT_KEY) as Field;
        debug_log_format("verify_passport() allowed_countries_mtree_root={0}", [allowed_countries_mtree_root]);

        actions::verify_passport(context, allowed_cert_pubkeys_mtree_root, allowed_countries_mtree_root, active_auth);
    }

    // #[aztec(public)]
    // fn mint_public(to: AztecAddress, amount: Field) {
    //     let slow = SlowMap::at(storage.public_slow_update.read());
    //     let to_roles = UserFlags::new(slow.read_at_pub(context, to.address) as u120);
    //     assert(!to_roles.is_blacklisted, "Blacklisted: Recipient");

    //     let caller_roles = UserFlags::new(slow.read_at_pub(context, context.msg_sender()) as u120);
    //     assert(caller_roles.is_minter, "caller is not minter");

    //     let amount = SafeU120::new(amount);
    //     let new_balance = storage.public_balances.at(to.address).read().add(amount);
    //     let supply = storage.total_supply.read().add(amount);

    //     storage.public_balances.at(to.address).write(new_balance);
    //     storage.total_supply.write(supply);
    // }

    #[aztec(public)]
    fn mint_private(amount: Field, secret_hash: Field) {
        let slow = SlowMap::at(storage.public_slow_update.read());
        let caller_roles = UserFlags::new(slow.read_at_pub(context, context.msg_sender()) as u120);
        assert(caller_roles.is_minter, "caller is not minter");

        let pending_shields = storage.pending_shields;
        let mut note = TransparentNote::new(amount, secret_hash);
        let supply = storage.total_supply.read().add(SafeU120::new(amount));

        storage.total_supply.write(supply);
        pending_shields.insert_from_public(&mut note);
    }

    #[aztec(public)]
    fn shield(from: AztecAddress, amount: Field, secret_hash: Field, nonce: Field) {
        let slow = SlowMap::at(storage.public_slow_update.read());
        let from_roles = UserFlags::new(slow.read_at_pub(context, from.address) as u120);
        assert(!from_roles.is_blacklisted, "Blacklisted: Sender");

        if (from.address != context.msg_sender()) {
            // The redeem is only spendable once, so we need to ensure that you cannot insert multiple shields from the same message.
            assert_current_call_valid_authwit_public(&mut context, from);
        } else {
            assert(nonce == 0, "invalid nonce");
        }

        let amount = SafeU120::new(amount);
        let from_balance = storage.public_balances.at(from.address).read().sub(amount);

        let pending_shields = storage.pending_shields;
        let mut note = TransparentNote::new(amount.value as Field, secret_hash);

        storage.public_balances.at(from.address).write(from_balance);
        pending_shields.insert_from_public(&mut note);
    }

    #[aztec(public)]
    fn transfer_public(from: AztecAddress, to: AztecAddress, amount: Field, nonce: Field) {
        let slow = SlowMap::at(storage.public_slow_update.read());
        let from_roles = UserFlags::new(slow.read_at_pub(context, from.address) as u120);
        assert(!from_roles.is_blacklisted, "Blacklisted: Sender");
        let to_roles = UserFlags::new(slow.read_at_pub(context, to.address) as u120);
        assert(!to_roles.is_blacklisted, "Blacklisted: Recipient");

        if (from.address != context.msg_sender()) {
            assert_current_call_valid_authwit_public(&mut context, from);
        } else {
            assert(nonce == 0, "invalid nonce");
        }

        let amount = SafeU120::new(amount);
        let from_balance = storage.public_balances.at(from.address).read().sub(amount);
        storage.public_balances.at(from.address).write(from_balance);

        let to_balance = storage.public_balances.at(to.address).read().add(amount);
        storage.public_balances.at(to.address).write(to_balance);
    }

    // #[aztec(public)]
    // fn burn_public(from: AztecAddress, amount: Field, nonce: Field) {
    //     let slow = SlowMap::at(storage.public_slow_update.read());
    //     let from_roles = UserFlags::new(slow.read_at_pub(context, from.address) as u120);
    //     assert(!from_roles.is_blacklisted, "Blacklisted: Sender");

    //     if (from.address != context.msg_sender()) {
    //         assert_current_call_valid_authwit_public(&mut context, from);
    //     } else {
    //         assert(nonce == 0, "invalid nonce");
    //     }

    //     let amount = SafeU120::new(amount);
    //     let from_balance = storage.public_balances.at(from.address).read().sub(amount);
    //     storage.public_balances.at(from.address).write(from_balance);

    //     let new_supply = storage.total_supply.read().sub(amount);
    //     storage.total_supply.write(new_supply);
    // }

    #[aztec(private)]
    fn redeem_shield(to: AztecAddress, amount: Field, secret: Field) {
        let slow = SlowMap::at(AztecAddress::new(storage.slow_update.get_note().value));
        let to_roles = UserFlags::new(slow.read_at(&mut context, to.address) as u120);
        assert(!to_roles.is_blacklisted, "Blacklisted: Recipient");

        let pending_shields = storage.pending_shields;
        let secret_hash = compute_secret_hash(secret);
        // Get 1 note (set_limit(1)) which has amount stored in field with index 0 (select(0, amount)) and secret_hash
        // stored in field with index 1 (select(1, secret_hash)).
        let options = NoteGetterOptions::new().select(0, amount).select(1, secret_hash).set_limit(1);
        let notes = pending_shields.get_notes(options);
        let note = notes[0].unwrap_unchecked();
        // Remove the note from the pending shields set
        pending_shields.remove(note);

        // Add the token note to user's balances set
        storage.balances.at(to).add(SafeU120::new(amount));
    }

    // #[aztec(private)]
    // fn unshield(from: AztecAddress, to: AztecAddress, amount: Field, nonce: Field) {
    //     let slow = SlowMap::at(AztecAddress::new(storage.slow_update.get_note().value));
    //     let from_roles = UserFlags::new(slow.read_at(&mut context, from.address) as u120);
    //     assert(!from_roles.is_blacklisted, "Blacklisted: Sender");
    //     let to_roles = UserFlags::new(slow.read_at(&mut context, to.address) as u120);
    //     assert(!to_roles.is_blacklisted, "Blacklisted: Recipient");

    //     if (from.address != context.msg_sender()) {
    //         assert_current_call_valid_authwit(&mut context, from);
    //     } else {
    //         assert(nonce == 0, "invalid nonce");
    //     }

    //     storage.balances.at(from).sub(SafeU120::new(amount));

    //     let selector = compute_selector("_increase_public_balance((Field),Field)");
    //     context.call_public_function(context.this_address(), selector, [to.address, amount]);
    // }

    #[aztec(private)]
    fn transfer(from: AztecAddress, to: AztecAddress, amount: Field, nonce: Field) {
        let slow = SlowMap::at(AztecAddress::new(storage.slow_update.get_note().value));
        let threshold_1 = slow.read_at(&mut context, THRESHOLD_1_KEY) as u120;
        debug_log_format("threshold_1 (transfer): {0}", [threshold_1 as Field]);

        let slow = SlowMap::at(AztecAddress::new(storage.slow_update.get_note().value));
        let from_roles = UserFlags::new(slow.read_at(&mut context, from.address) as u120);
        assert(!from_roles.is_blacklisted, "Blacklisted: Sender");
        let to_roles = UserFlags::new(slow.read_at(&mut context, to.address) as u120);
        assert(!to_roles.is_blacklisted, "Blacklisted: Recipient");

        if (from.address != context.msg_sender()) {
            assert_current_call_valid_authwit(&mut context, from);
        } else {
            assert(nonce == 0, "invalid nonce");
        }

        assert(amount as u120 < threshold_1 as u120, "Threshold amount exceeded!");

        let amount = SafeU120::new(amount);
        storage.balances.at(from).sub(amount);
        storage.balances.at(to).add(amount);
    }

    #[aztec(private)]
    fn transfer_up_to_threshold_2(
        from: AztecAddress,
        to: AztecAddress,
        amount: Field,
        nonce: Field)
    {
        let slow = SlowMap::at(AztecAddress::new(storage.slow_update.get_note().value));
        let threshold_2 = slow.read_at(&mut context, THRESHOLD_2_KEY) as u120;
        debug_log_format("transfer_up_to_threshold_2() threshold_2={0} amount={1}", [threshold_2 as Field, amount]);

        // let from_roles = UserFlags::new(slow.read_at(&mut context, from.address) as u120);
        // assert(!from_roles.is_blacklisted, "Blacklisted: Sender");
        // let to_roles = UserFlags::new(slow.read_at(&mut context, to.address) as u120);
        // assert(!to_roles.is_blacklisted, "Blacklisted: Recipient");
        // if (from.address != context.msg_sender()) {
        //     assert_current_call_valid_authwit(&mut context, from);
        // } else {
        //     assert(nonce == 0, "invalid nonce");
        // }

        assert(amount as u120 < threshold_2 as u120, "Threshold amount exceeded!");

        let allowed_cert_pubkeys_mtree_root = slow.read_at(&mut context, ALLOWED_CERT_PUBKEYS_MTREE_ROOT_KEY) as Field;
        debug_log_format("verify_passport() allowed_cert_pubkeys_mtree_root={0}", [allowed_cert_pubkeys_mtree_root]);
        let allowed_countries_mtree_root = slow.read_at(&mut context, ALLOWED_COUNTRIES_MTREE_ROOT_KEY) as Field;
        debug_log_format("verify_passport() allowed_countries_mtree_root={0}", [allowed_countries_mtree_root]);

        // Verify zkPassport with country verification
        actions::verify_passport(context, allowed_cert_pubkeys_mtree_root, allowed_countries_mtree_root, false);

        let amount = SafeU120::new(amount);
        storage.balances.at(from).sub(amount);
        storage.balances.at(to).add(amount);
    }

    #[aztec(private)]
    fn transfer_up_to_threshold_3(
        from: AztecAddress,
        to: AztecAddress,
        amount: Field,
        nonce: Field)
    {
        let slow = SlowMap::at(AztecAddress::new(storage.slow_update.get_note().value));
        let threshold_3 = slow.read_at(&mut context, THRESHOLD_3_KEY) as u120;
        debug_log_format("transfer_up_to_threshold_3() threshold_3={0} amount={1}", [threshold_3 as Field, amount]);

        // let from_roles = UserFlags::new(slow.read_at(&mut context, from.address) as u120);
        // assert(!from_roles.is_blacklisted, "Blacklisted: Sender");
        // let to_roles = UserFlags::new(slow.read_at(&mut context, to.address) as u120);
        // assert(!to_roles.is_blacklisted, "Blacklisted: Recipient");
        // if (from.address != context.msg_sender()) {
        //     assert_current_call_valid_authwit(&mut context, from);
        // } else {
        //     assert(nonce == 0, "invalid nonce");
        // }

        assert(amount as u120 < threshold_3 as u120, "Threshold amount exceeded!");

        let allowed_cert_pubkeys_mtree_root = slow.read_at(&mut context, ALLOWED_CERT_PUBKEYS_MTREE_ROOT_KEY) as Field;
        debug_log_format("verify_passport() allowed_cert_pubkeys_mtree_root={0}", [allowed_cert_pubkeys_mtree_root]);
        let allowed_countries_mtree_root = slow.read_at(&mut context, ALLOWED_COUNTRIES_MTREE_ROOT_KEY) as Field;
        debug_log_format("verify_passport() allowed_countries_mtree_root={0}", [allowed_countries_mtree_root]);

        // Verify zkPassport with country verification and active auth
        actions::verify_passport(context, allowed_cert_pubkeys_mtree_root, allowed_countries_mtree_root, true);

        let amount = SafeU120::new(amount);
        storage.balances.at(from).sub(amount);
        storage.balances.at(to).add(amount);
    }

    // #[aztec(private)]
    // fn burn(from: AztecAddress, amount: Field, nonce: Field) {
    //     let slow = SlowMap::at(AztecAddress::new(storage.slow_update.get_note().value));
    //     let from_roles = UserFlags::new(slow.read_at(&mut context, from.address) as u120);
    //     assert(!from_roles.is_blacklisted, "Blacklisted: Sender");

    //     if (from.address != context.msg_sender()) {
    //         assert_current_call_valid_authwit(&mut context, from);
    //     } else {
    //         assert(nonce == 0, "invalid nonce");
    //     }

    //     storage.balances.at(from).sub(SafeU120::new(amount));

    //     let selector = compute_selector("_reduce_total_supply(Field)");
    //     context.call_public_function(context.this_address(), selector, [amount]);
    // }

    /// Internal ///

    #[aztec(public)]
    internal fn _increase_public_balance(to: AztecAddress, amount: Field) {
        let new_balance = storage.public_balances.at(to.address).read().add(SafeU120::new(amount));
        storage.public_balances.at(to.address).write(new_balance);
    }

    #[aztec(public)]
    internal fn _reduce_total_supply(amount: Field) {
        // Only to be called from burn.
        let new_supply = storage.total_supply.read().sub(SafeU120::new(amount));
        storage.total_supply.write(new_supply);
    }

    /// Unconstrained ///

    unconstrained fn threshold_limit_1() -> u120 {
        storage.threshold_limit_1.read().value
    }
    unconstrained fn threshold_limit_2() -> u120 {
        storage.threshold_limit_2.read().value
    }
    unconstrained fn threshold_limit_3() -> u120 {
        storage.threshold_limit_3.read().value
    }
    unconstrained fn total_supply() -> u120 {
        storage.total_supply.read().value
    }
    unconstrained fn balance_of_private(owner: AztecAddress) -> u120 {
        storage.balances.at(owner).balance_of().value
    }
    unconstrained fn balance_of_public(owner: AztecAddress) -> u120 {
        storage.public_balances.at(owner.address).read().value
    }

    // Below this point is the stuff of nightmares.
    // This should ideally not be required. What do we do if vastly different types of preimages?

    // Computes note hash and nullifier.
    // Note 1: Needs to be defined by every contract producing logs.
    // Note 2: Having it in all the contracts gives us the ability to compute the note hash and nullifier differently for different kind of notes.
    unconstrained fn compute_note_hash_and_nullifier(
        contract_address: Field,
        nonce: Field,
        storage_slot: Field,
        preimage: [Field; TOKEN_NOTE_LEN]
    ) -> [Field; 4] {
        let note_header = NoteHeader::new(contract_address, nonce, storage_slot);
        if (storage_slot == 5) {
            note_utils::compute_note_hash_and_nullifier(TransparentNoteMethods, note_header, preimage)
        } else if (storage_slot == 7) {
            note_utils::compute_note_hash_and_nullifier(FieldNoteMethods, note_header, preimage)
        } else {
            note_utils::compute_note_hash_and_nullifier(TokenNoteMethods, note_header, preimage)
        }
    }
}
