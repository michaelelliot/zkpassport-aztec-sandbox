import {
  AccountWallet,
  CheatCodes,
  ExtendedNote,
  Fr,
  Note,
  PXE,
  computeMessageSecretHash,
  createPXEClient,
  getSandboxAccountsWallets,
  waitForSandbox,
  createDebugLogger,
  AztecAddress,
  Wallet,
  TxHash,
  TxStatus,
  CompleteAddress,
} from '@aztec/aztec.js'
import { jest } from '@jest/globals'
import { default as levelup } from 'levelup'
import { Pedersen, SparseTree, newTree } from '@aztec/merkle-tree'
import { TokenSimulator } from './helpers/token_simulator.ts'
import { createLevelDown, fmt, getContractAddress, getMembershipCapsule, getMembershipProof, getUpdateCapsule, getUpdateProof, updateContractAddress } from './helpers/utils.ts'
import { zkPassportTokenContract as TokenContract } from '../interfaces/zkPassportToken.ts'
import { SlowTreeContract } from '../interfaces/SlowTree.ts'
import { johnny_capsule_data, johnny_capsule_data_active_auth } from './fixtures/johnny.ts'

type CapsuleItemType = Fr[] | number[] | number | bigint[] | bigint
type CapsuleType = CapsuleItemType[]

const { PXE_URL = 'http://localhost:8080', ETHEREUM_HOST = 'http://localhost:8545' } = process.env
const logger = createDebugLogger('token')

// Transfer thresholds
const THRESHOLD_1 = 250n
const THRESHOLD_2 = 1_000n
const THRESHOLD_3 = 100_000n

// These keys are the index used for their respective storage in the slow update tree
const THRESHOLD_1_KEY = 9001n
const THRESHOLD_2_KEY = 9002n
const THRESHOLD_3_KEY = 9003n
const ALLOWED_CERT_PUBKEYS_MTREE_ROOT_KEY = 8001n
const ALLOWED_COUNTRIES_MTREE_ROOT_KEY = 8002n

const BLACKLIST_FLAG  = 1n
const MINTER_FLAG     = 2n
const ADMIN_FLAG      = 4n
const TIMEOUT         = 90_000

describe('zkPassport Aztec Sandbox Prototype', () => {
  jest.setTimeout(TIMEOUT)

  let wallets: AccountWallet[]
  let accounts: CompleteAddress[]
  let asset: TokenContract
  let slowUpdateTreeSimulator: SparseTree
  let cheatCodes: CheatCodes
  let pxe: PXE

  const addPendingShieldNoteToPXE = async (accountIndex: number, amount: bigint, secretHash: Fr, txHash: TxHash) => {
    const storageSlot = new Fr(5) // The storage slot of `pending_shields` is 5.
    const note = new Note([new Fr(amount), secretHash])
    const extendedNote = new ExtendedNote(note, accounts[accountIndex].address, asset.address, storageSlot, txHash)
    await wallets[accountIndex].addNote(extendedNote)
  }

  const updateSlowTree = async (tree: SparseTree, wallet: Wallet, index: bigint, value: bigint) => {
    await wallet.addCapsule(getUpdateCapsule(await getUpdateProof(slowUpdateTreeSimulator, value, index)))
    await tree.updateLeaf(new Fr(value).toBuffer(), index)
  }

  const setThreshold1 = async (threshold: bigint) => {
    await updateSlowTree(slowUpdateTreeSimulator, wallets[0], THRESHOLD_1_KEY, threshold)
    await asset.methods.set_threshold_1(threshold).send().wait()
    logger(`Set threshold1 to ${fmt(threshold)}`)
    // Progress to next "epoch"
    await cheatCodes.aztec.warp((await cheatCodes.eth.timestamp()) + 200)
    await slowUpdateTreeSimulator.commit()
  }
  const setThreshold2 = async (threshold: bigint) => {
    await updateSlowTree(slowUpdateTreeSimulator, wallets[0], THRESHOLD_2_KEY, threshold)
    await asset.methods.set_threshold_2(threshold).send().wait()
    logger(`Set threshold2 to ${fmt(threshold)}`)
    // Progress to next "epoch"
    await cheatCodes.aztec.warp((await cheatCodes.eth.timestamp()) + 200)
    await slowUpdateTreeSimulator.commit()
  }
  const setThreshold3 = async (threshold: bigint) => {
    await updateSlowTree(slowUpdateTreeSimulator, wallets[0], THRESHOLD_3_KEY, threshold)
    await asset.methods.set_threshold_3(threshold).send().wait()
    logger(`Set threshold3 to ${fmt(threshold)}`)
    // Progress to next "epoch"
    await cheatCodes.aztec.warp((await cheatCodes.eth.timestamp()) + 200)
    await slowUpdateTreeSimulator.commit()
  }

  const setAllowedCountriesMerkleRoot = async (root: bigint) => {
    await updateSlowTree(slowUpdateTreeSimulator, wallets[0], ALLOWED_COUNTRIES_MTREE_ROOT_KEY, root)
    await asset.methods.set_allowed_countries_mtree_root(root).send().wait()
    logger(`Set allowed_countries_mtree_root to ${root}`)
    // Progress to next "epoch"
    await cheatCodes.aztec.warp((await cheatCodes.eth.timestamp()) + 200)
    await slowUpdateTreeSimulator.commit()
  }

  const setAllowedCertPubKeysMerkleRoot = async (root: bigint) => {
    await updateSlowTree(slowUpdateTreeSimulator, wallets[0], ALLOWED_CERT_PUBKEYS_MTREE_ROOT_KEY, root)
    await asset.methods.set_allowed_cert_pubkeys_mtree_root(root).send().wait()
    logger(`Set allowed_cert_pubkeys_mtree_root to ${root}`)
    // Progress to next "epoch"
    await cheatCodes.aztec.warp((await cheatCodes.eth.timestamp()) + 200)
    await slowUpdateTreeSimulator.commit()
  }

  const addCapsules = async (wallet: AccountWallet, capsules: CapsuleType) => {
    for (let i = capsules.length - 1; i >= 0; i--) {
      const capsuleItem = capsules[i]
      let capsuleToAdd: Fr[]
      if (Array.isArray(capsuleItem)) {
        capsuleToAdd = capsuleItem.map(item => {
          if (typeof item === 'number' || typeof item === 'bigint') {
            return new Fr(item)
          } else return item
        })
      } else {
        if (typeof capsuleItem === 'number' || typeof capsuleItem === 'bigint') {
          capsuleToAdd = [new Fr(capsuleItem)]
        } else capsuleToAdd = [capsuleItem]
      }
      await wallet.addCapsule(capsuleToAdd)
    }
  }

  beforeAll(async () => {
    pxe = createPXEClient(PXE_URL)
    await waitForSandbox(pxe)
    cheatCodes = CheatCodes.create(ETHEREUM_HOST, pxe)
    const depth = 254
    slowUpdateTreeSimulator = await newTree(SparseTree, levelup(createLevelDown('./cache/slow_tree')), new Pedersen(), 'test', depth)
    // slowUpdateTreeSimulator = await newTree(SparseTree, levelup(createMemDown()), new Pedersen(), 'test', depth)
  })

  let slowTreeAddress = getContractAddress('slowTree')
  let tokenAddress = getContractAddress('token')

  describe('Token contract', () => {
    let alice: AccountWallet
    let bob: AccountWallet
    let token: TokenContract
    let slowTree: SlowTreeContract
    let tokenSim: TokenSimulator

    beforeAll(async () => {
      accounts = await pxe.getRegisteredAccounts()
      wallets = await getSandboxAccountsWallets(pxe)
      alice = wallets[0]
      bob = wallets[0]
      logger(`Loaded Alice's account at ${alice.getAddress().toShortString()}`)
      logger(`Loaded Bob's account at ${bob.getAddress().toShortString()}`)

      if (slowTreeAddress) {
        slowTree = await SlowTreeContract.at(AztecAddress.fromString(slowTreeAddress), alice)
        logger(`Using existing SlowTree contract at address ${slowTree.address}`)
      }
      if (tokenAddress) {
        token = await TokenContract.at(AztecAddress.fromString(tokenAddress), alice)
        logger(`Using existing Token contract at address ${token.address}`)
        asset = token
      }
      if (!slowTreeAddress) {
        slowTree = await SlowTreeContract.deploy(wallets[0]).send().deployed()
        logger(`Contract SlowTree successfully deployed at address ${slowTree.address}`)
        updateContractAddress('slowTree', slowTree.address)

        if (!tokenAddress) {
          const deployTx = TokenContract.deploy(wallets[0], accounts[0], slowTree.address).send({})
          const receipt = await deployTx.wait()
          token = receipt.contract
          asset = receipt.contract
          logger(`Contract Token successfully deployed at address ${token.address}`)
          updateContractAddress('token', token.address)

          // Add the note
          const note = new Note([slowTree.address.toField()])
          const storageSlot = new Fr(7)
          for (const wallet of wallets) {
            const extendedNote = new ExtendedNote(
              note,
              wallet.getCompleteAddress().address,
              asset.address,
              storageSlot,
              receipt.txHash,
            )
            await wallet.addNote(extendedNote)
          }
          // account[0] is set as admin and minter initially
          await updateSlowTree(slowUpdateTreeSimulator, wallets[0], accounts[0].address.toBigInt(), ADMIN_FLAG + MINTER_FLAG)
          await asset.methods.init_slow_tree(accounts[0].address).send().wait()
          logger('SlowTree initialised')
          // Progress to next "epoch"
          const time = await cheatCodes.eth.timestamp()
          await cheatCodes.aztec.warp(time + 200)
          await slowUpdateTreeSimulator.commit()

          const roleLeaf = await slowTree.methods.un_read_leaf_at(asset.address, accounts[0].address).view()
          expect(roleLeaf['next_change']).toBeGreaterThan(0n)
          expect(roleLeaf['before']).toEqual(0n)
          expect(roleLeaf['after']).toEqual(ADMIN_FLAG + MINTER_FLAG)
        }
      }
      tokenSim = new TokenSimulator(
        token as any,
        logger,
        accounts.map(a => a.address),
      )
    }, 60_000)

    describe('Thresholds', () => {
      describe('Set thresholds', () => {
        it(`sets threshold1 to ${fmt(THRESHOLD_1)}`, async () => {
          const threshold1 = THRESHOLD_1
          await setThreshold1(threshold1)
          const leafValue = await slowTree.methods.un_read_leaf_at(asset.address, AztecAddress.fromBigInt(THRESHOLD_1_KEY)).view()
          expect(leafValue['after']).toEqual(threshold1)
        })
        it(`sets threshold2 to ${fmt(THRESHOLD_2)}`, async () => {
          const threshold2 = THRESHOLD_2
          await setThreshold2(threshold2)
          const leafValue = await slowTree.methods.un_read_leaf_at(asset.address, AztecAddress.fromBigInt(THRESHOLD_2_KEY)).view()
          expect(leafValue['after']).toEqual(threshold2)
        })
        it(`sets threshold3 to ${fmt(THRESHOLD_3)}`, async () => {
          const threshold3 = THRESHOLD_3
          await setThreshold3(threshold3)
          const leafValue = await slowTree.methods.un_read_leaf_at(asset.address, AztecAddress.fromBigInt(THRESHOLD_3_KEY)).view()
          expect(leafValue['after']).toEqual(threshold3)
        })
      })

      describe('Get thresholds', () => {
        it(`checks threshold1 is ${fmt(THRESHOLD_1)}`, async () => {
          const threshold1 = await asset.methods.threshold_limit_1().view()
          expect(threshold1).toEqual(THRESHOLD_1)
        })
        it(`checks threshold2 is ${fmt(THRESHOLD_2)}`, async () => {
          const threshold2 = await asset.methods.threshold_limit_2().view()
          expect(threshold2).toEqual(THRESHOLD_2)
        })
        it(`checks threshold3 is ${fmt(THRESHOLD_3)}`, async () => {
          const threshold3 = await asset.methods.threshold_limit_3().view()
          expect(threshold3).toEqual(THRESHOLD_3)
        })
      })
    })

    describe('Merkle trees', () => {
      it('set allowed countries merkle root', async () => {
        const root = 0x0dd9d5b6db78ee2e4e93254bb7707af58f75bf50706c7ea9ba904c8a9fe506e5n
        await setAllowedCountriesMerkleRoot(root)
        const leafValue = await slowTree.methods.un_read_leaf_at(asset.address, AztecAddress.fromBigInt(ALLOWED_COUNTRIES_MTREE_ROOT_KEY)).view()
        expect(leafValue['after']).toEqual(root)
      })
      it('set allowed certificate public keys merkle root', async () => {
        const root = 0x1281be6251b0c14f70d42165ee9a26c45685b9a151e0e79336191bb8fb560b19n
        await setAllowedCertPubKeysMerkleRoot(root)
        const leafValue = await slowTree.methods.un_read_leaf_at(asset.address, AztecAddress.fromBigInt(ALLOWED_CERT_PUBKEYS_MTREE_ROOT_KEY)).view()
        expect(leafValue['after']).toEqual(root)
      })
    })

    describe('Verify passport', () => {
      it('verify passport with proof of country', async () => {
        await addCapsules(wallets[0], johnny_capsule_data)
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, ALLOWED_COUNTRIES_MTREE_ROOT_KEY, true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, ALLOWED_CERT_PUBKEYS_MTREE_ROOT_KEY, true)))
        const tx = asset.methods.verify_passport(false).send()
        const receipt = await tx.wait()
        expect(receipt.status).toBe(TxStatus.MINED)
      })

      it('verify passport with proof of country and active auth', async () => {
        await addCapsules(wallets[0], johnny_capsule_data_active_auth)
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, ALLOWED_COUNTRIES_MTREE_ROOT_KEY, true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, ALLOWED_CERT_PUBKEYS_MTREE_ROOT_KEY, true)))
        const tx = asset.methods.verify_passport(true).send()
        const receipt = await tx.wait()
        expect(receipt.status).toBe(TxStatus.MINED)
      })
    })

    describe('Mint and reedem tokens', () => {
      const secret = Fr.random()
      const mintAmount = 1_000_000n
      let secretHash: Fr
      let txHash: TxHash

      beforeAll(() => {
        secretHash = computeMessageSecretHash(secret)
      })

      it('mints 1_000_000 tokens to pending shield', async () => {
        const tx = asset.methods.mint_private(mintAmount, secretHash).send()
        const receipt = await tx.wait()
        expect(receipt.status).toBe(TxStatus.MINED)
        tokenSim.mintPrivate(mintAmount)
        txHash = receipt.txHash
      })

      it('redeems 1_000_000 from pending shield', async () => {
        await addPendingShieldNoteToPXE(0, mintAmount, secretHash, txHash)
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[0].address.toBigInt(), true)))
        const txClaim = asset.methods.redeem_shield(accounts[0].address, mintAmount, secret).send()
        const receiptClaim = await txClaim.wait({ debug: true })
        expect(receiptClaim.status).toBe(TxStatus.MINED)
        tokenSim.redeemShield(accounts[0].address, mintAmount)
        // 1 note should be created containing `mintAmount` of tokens
        const { visibleNotes } = receiptClaim.debugInfo!
        expect(visibleNotes.length).toBe(1)
        expect(visibleNotes[0].note.items[0].toBigInt()).toBe(mintAmount)
      })
    })

    describe('Token transfers', () => {
      it('sets threshold1 to 250', async () => {
        const threshold1 = 250n
        await setThreshold1(threshold1)
        const leafValue = await slowTree.methods.un_read_leaf_at(asset.address, AztecAddress.fromBigInt(THRESHOLD_1_KEY)).view()
        expect(leafValue['after']).toEqual(threshold1)
      })

      it('checks threshold1 is 250', async () => {
        const threshold = await asset.methods.threshold_limit_1().view()
        expect(threshold).toEqual(250n)
      })

      it('successfully transfers 249 tokens (without verification)', async () => {
        const balance = await asset.methods.balance_of_private(accounts[0].address).view()
        logger(`Balance: ${balance}`)
        const amount = 249n
        logger(`Transferring ${amount} tokens...`)

        // Note: Capsules are REVERSE ORDER to how they're consumed in a function!
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[1].address.toBigInt(), true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[0].address.toBigInt(), true)))
        // Note: THRESHOLD_1_KEY is index of threshold_1 storage in slowtree
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, THRESHOLD_1_KEY, true)))

        const tx = asset.methods.transfer(accounts[0].address, accounts[1].address, amount, 0).send()
        const receipt = await tx.wait()
        expect(receipt.status).toBe(TxStatus.MINED)
        tokenSim.transferPrivate(accounts[0].address, accounts[1].address, amount)
      })

      it('fails to transfer 250 tokens (without verification)', async () => {
        const amount = 250n
        logger(`Transferring ${amount} tokens...`)

        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[1].address.toBigInt(), true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[0].address.toBigInt(), true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, THRESHOLD_1_KEY, true)))

        const call = asset.methods.transfer(accounts[0].address, accounts[1].address, amount, 0)
        await expect(call.simulate()).rejects.toThrowError(/Threshold amount exceeded/)
      })

      it('successfully transfers 250 tokens (with country verification)', async () => {
        const balance = await asset.methods.balance_of_private(accounts[0].address).view()
        logger(`Balance: ${balance}`)
        const amount = 500n
        logger(`Transferring ${amount} tokens...`)

        await addCapsules(wallets[0], johnny_capsule_data)
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, ALLOWED_COUNTRIES_MTREE_ROOT_KEY, true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, ALLOWED_CERT_PUBKEYS_MTREE_ROOT_KEY, true)))
        // Note: Capsules are REVERSE ORDER to how they're consumed in a function!
        // await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[1].address.toBigInt(), true)))
        // await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[0].address.toBigInt(), true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, THRESHOLD_2_KEY, true)))

        const tx = asset.methods.transfer_up_to_threshold_2(accounts[0].address, accounts[1].address, amount, 0).send()
        const receipt = await tx.wait()
        expect(receipt.status).toBe(TxStatus.MINED)
        tokenSim.transferPrivate(accounts[0].address, accounts[1].address, amount)
      })

      it('fails to transfer 50_000 tokens (with country verification)', async () => {
        const amount = 50_000n
        logger(`Transferring ${amount} tokens...`)

        await addCapsules(wallets[0], johnny_capsule_data)
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, ALLOWED_COUNTRIES_MTREE_ROOT_KEY, true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, ALLOWED_CERT_PUBKEYS_MTREE_ROOT_KEY, true)))
        // await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[1].address.toBigInt(), true)))
        // await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[0].address.toBigInt(), true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, THRESHOLD_2_KEY, true)))

        const call = asset.methods.transfer_up_to_threshold_2(accounts[0].address, accounts[1].address, amount, 0)
        await expect(call.simulate()).rejects.toThrowError(/Threshold amount exceeded/)
      })

      it('successfully transfers 50_000 tokens (with country verification and active auth)', async () => {
        const balance = await asset.methods.balance_of_private(accounts[0].address).view()
        logger(`Balance: ${balance}`)
        const amount = 50_000n
        logger(`Transferring ${amount} tokens...`)

        await addCapsules(wallets[0], johnny_capsule_data_active_auth)
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, ALLOWED_COUNTRIES_MTREE_ROOT_KEY, true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, ALLOWED_CERT_PUBKEYS_MTREE_ROOT_KEY, true)))
        // await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[1].address.toBigInt(), true)))
        // await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[0].address.toBigInt(), true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, THRESHOLD_3_KEY, true)))

        const tx = asset.methods.transfer_up_to_threshold_3(accounts[0].address, accounts[1].address, amount, 0).send()
        const receipt = await tx.wait()
        expect(receipt.status).toBe(TxStatus.MINED)
        tokenSim.transferPrivate(accounts[0].address, accounts[1].address, amount)
      })

      it('sets threshold1 to 500', async () => {
        const threshold1 = 500n
        await setThreshold1(threshold1)
        const leafValue = await slowTree.methods.un_read_leaf_at(asset.address, AztecAddress.fromBigInt(THRESHOLD_1_KEY)).view()
        expect(leafValue['after']).toEqual(threshold1)
      })

      it('successfully transfers 250 tokens (without verification)', async () => {
        const amount = 250n
        logger(`Transferring ${amount} tokens...`)
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[1].address.toBigInt(), true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[0].address.toBigInt(), true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, THRESHOLD_1_KEY, true)))

        const tx = asset.methods.transfer(accounts[0].address, accounts[1].address, amount, 0).send()
        const receipt = await tx.wait()
        expect(receipt.status).toBe(TxStatus.MINED)
        tokenSim.transferPrivate(accounts[0].address, accounts[1].address, amount)
      })
    })
  })
})
