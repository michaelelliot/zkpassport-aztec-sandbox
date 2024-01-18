mod utils;
mod interfaces;
mod globals;

use dep::zkpassport::{ verify_zkpassport_country, verify_zkpassport_country_active_auth };
use dep::aztec::oracle::debug_log::{ debug_log, debug_log_format };
use dep::aztec::types::address::AztecAddress;
use dep::aztec::context::{ PrivateContext, PublicContext, Context };

use crate::globals::{
    THRESHOLD_1_KEY,
    THRESHOLD_2_KEY,
    THRESHOLD_3_KEY,
    ALLOWED_CERT_PUBKEYS_MTREE_ROOT_KEY,
    ALLOWED_COUNTRIES_MTREE_ROOT_KEY,
};
use crate::utils::{
    arr_copy_field_to_u8,
    pop_capsule_u8_array,
    pop_capsule_u16_array,
    pop_capsule_single,
    pop_capsule_field_array
};
use crate::interfaces::SlowMap;

pub fn verify_passport(
    context: PrivateContext,
    allowed_cert_pubkeys_mtree_root: Field,
    allowed_countries_mtree_root: Field,
    active_auth: bool) -> Field
{
    let name: [u8; 39] = pop_capsule_u8_array();
    let nationality: [u8; 3] = pop_capsule_u8_array();
    let expiry: [u8; 6] = pop_capsule_u8_array();

    let current_date_fields: [u16; 4] = pop_capsule_u16_array();
    let current_year: u16 = current_date_fields[0];
    let current_month: u16 = current_date_fields[1];
    let current_day: u16 = current_date_fields[2];
    let pivot_year: u16 = current_date_fields[3];

    let dg1: [u8; 93] = pop_capsule_u8_array();
    let dg15: [u8; 512] = pop_capsule_u8_array();
    let dg15_len: u16 = pop_capsule_single() as u16;

    let signed_hashes: [u8; 256] = pop_capsule_u8_array();
    let signed_hashes_len: u16 = pop_capsule_single() as u16;
    let signed_hashes_dg1_hash_offset: u16 = pop_capsule_single() as u16;
    let signed_hashes_dg15_hash_offset: u16 = pop_capsule_single() as u16;

    let signed_attributes: [u8; 256] = pop_capsule_u8_array();
    let signed_attributes_len: u16 = pop_capsule_single() as u16;
    let signed_attributes_signed_hashes_hash_offset: u16 = pop_capsule_single() as u16;
    let sig_decrypted_signed_attributes_hash_offset: u16 = pop_capsule_single() as u16;

    let sod_sig: [u8; 256] = pop_capsule_u8_array();
    let sod_pubkey: [u8; 256] = pop_capsule_u8_array();
    let sod_final_e: [u8; 256] = pop_capsule_u8_array();
    let sod_sig_quotient: [u8; 256] = pop_capsule_u8_array();

    let mut active_auth_dg15_pubkey_offset: u16 = 0;
    let mut active_auth_sig: [u8; 128] = [0; 128];
    let mut active_auth_final_e: [u8; 128] = [0; 128];
    let mut active_auth_sig_quotient: [u8; 128] = [0; 128];
    let mut active_auth_challenge: [u8; 8] = [0; 8];

    if (active_auth) {
        active_auth_dg15_pubkey_offset = pop_capsule_single() as u16;
        active_auth_sig = pop_capsule_u8_array();
        active_auth_final_e = pop_capsule_u8_array();
        active_auth_sig_quotient = pop_capsule_u8_array();
        active_auth_challenge = pop_capsule_u8_array();
    }

    let mut cert_pubkeys_mtree_root: Field = pop_capsule_single();
    if (allowed_cert_pubkeys_mtree_root != 0) {
        debug_log("verify_passport() *** allowed_cert_pubkeys_mtree_root is set, using as merkle root");
        cert_pubkeys_mtree_root = allowed_cert_pubkeys_mtree_root;
    }
    let cert_pubkeys_mtree_index: Field = pop_capsule_single();
    let cert_pubkeys_mtree_hashpath: [Field; 8] = pop_capsule_field_array();

    let mut countries_mtree_root: Field = pop_capsule_single();
    if (allowed_countries_mtree_root != 0) {
        debug_log("verify_passport() *** allowed_countries_mtree_root is set, using as merkle root");
        countries_mtree_root = allowed_countries_mtree_root;
    }
    let countries_mtree_index: Field = pop_capsule_single();
    let countries_mtree_hashpath: [Field; 8] = pop_capsule_field_array();

    let mut anon_id: Field = 0;
    if (!active_auth) {
        debug_log("Verifying passport...");
        anon_id = verify_zkpassport_country(
            dg1,
            name,
            nationality,
            expiry,
            current_year,
            current_month,
            current_day,
            pivot_year,
            sod_sig,
            sod_pubkey,
            sod_final_e,
            sod_sig_quotient,
            dg15,
            dg15_len,
            signed_hashes,
            signed_hashes_len,
            signed_hashes_dg1_hash_offset,
            signed_hashes_dg15_hash_offset,
            signed_attributes,
            signed_attributes_len,
            signed_attributes_signed_hashes_hash_offset,
            sig_decrypted_signed_attributes_hash_offset,
            cert_pubkeys_mtree_root,
            cert_pubkeys_mtree_index,
            cert_pubkeys_mtree_hashpath,
            countries_mtree_root,
            countries_mtree_index,
            countries_mtree_hashpath,
        );
    } else {
        debug_log("Verifying passport (with ActiveAuth)...");
        anon_id = verify_zkpassport_country_active_auth(
            dg1,
            name,
            nationality,
            expiry,
            current_year,
            current_month,
            current_day,
            pivot_year,
            active_auth_challenge,
            sod_sig,
            sod_pubkey,
            sod_final_e,
            sod_sig_quotient,
            dg15,
            dg15_len,
            signed_hashes,
            signed_hashes_len,
            signed_hashes_dg1_hash_offset,
            signed_hashes_dg15_hash_offset,
            signed_attributes,
            signed_attributes_len,
            signed_attributes_signed_hashes_hash_offset,
            sig_decrypted_signed_attributes_hash_offset,
            active_auth_dg15_pubkey_offset,
            active_auth_sig,
            active_auth_final_e,
            active_auth_sig_quotient,
            cert_pubkeys_mtree_root,
            cert_pubkeys_mtree_index,
            cert_pubkeys_mtree_hashpath,
            countries_mtree_root,
            countries_mtree_index,
            countries_mtree_hashpath,
        );
    }
    debug_log("Verified passport!");
    anon_id
}
