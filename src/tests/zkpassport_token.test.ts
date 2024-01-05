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
import { createLevelDown, getContractAddress, getMembershipCapsule, getMembershipProof, getUpdateCapsule, getUpdateProof, updateContractAddress } from './helpers/utils.ts'
// @ts-ignore
import { zkPassportTokenContract as TokenContract } from '../interfaces/zkPassportToken.ts'
// @ts-ignore
import { SlowTreeContract } from '../interfaces/SlowTree.ts'

const { PXE_URL = 'http://localhost:8080', ETHEREUM_HOST = 'http://localhost:8545' } = process.env
const logger = createDebugLogger('token')

const THRESHOLD_1_KEY = 9001n
const THRESHOLD_2_KEY = 9002n
const THRESHOLD_3_KEY = 9003n
const BLACKLIST_FLAG  = 1n
const MINTER_FLAG     = 2n
const ADMIN_FLAG      = 4n
const TIMEOUT         = 90_000

describe('zkPassport Aztec Sandbox', () => {
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
    logger(`Set threshold1 to ${threshold}`)
    // Progress to next "epoch"
    await cheatCodes.aztec.warp((await cheatCodes.eth.timestamp()) + 200)
    await slowUpdateTreeSimulator.commit()
  }
  const setThreshold2 = async (threshold: bigint) => {
    await updateSlowTree(slowUpdateTreeSimulator, wallets[0], THRESHOLD_2_KEY, threshold)
    await asset.methods.set_threshold_2(threshold).send().wait()
    logger(`Set threshold2 to ${threshold}`)
    // Progress to next "epoch"
    await cheatCodes.aztec.warp((await cheatCodes.eth.timestamp()) + 200)
    await slowUpdateTreeSimulator.commit()
  }
  const setThreshold3 = async (threshold: bigint) => {
    await updateSlowTree(slowUpdateTreeSimulator, wallets[0], THRESHOLD_3_KEY, threshold)
    await asset.methods.set_threshold_3(threshold).send().wait()
    logger(`Set threshold3 to ${threshold}`)
    // Progress to next "epoch"
    await cheatCodes.aztec.warp((await cheatCodes.eth.timestamp()) + 200)
    await slowUpdateTreeSimulator.commit()
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

  describe('token contract', () => {
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

    describe.only('register_passport', () => {
      it('register_passport', async () => {
        const tx = asset.methods.register_passport(1234n, 5678n).send()
        const receipt = await tx.wait()
        expect(receipt.status).toBe(TxStatus.MINED)
      })
      it('check_passport', async () => {
        // const tx = asset.methods.check_passport(accounts[0].address).send()
        const tx = asset.methods.check_passport().send()
        const receipt = await tx.wait()
        expect(receipt.status).toBe(TxStatus.MINED)
      })
    })

    describe('thresholds', () => {
      describe('set thresholds', () => {
        it('sets threshold1 to 250', async () => {
          const threshold1 = 250n
          await setThreshold1(threshold1)
          const leafValue = await slowTree.methods
            .un_read_leaf_at(asset.address, AztecAddress.fromBigInt(THRESHOLD_1_KEY))
            .view()
          expect(leafValue['after']).toEqual(threshold1)
        })
        it('sets threshold2 to 1_000', async () => {
          const threshold2 = 1_000n
          await setThreshold2(threshold2)
          const leafValue = await slowTree.methods
            .un_read_leaf_at(asset.address, AztecAddress.fromBigInt(THRESHOLD_2_KEY))
            .view()
          expect(leafValue['after']).toEqual(threshold2)
        })
        it('sets threshold3 to 100_000', async () => {
          const threshold3 = 100_000n
          await setThreshold3(threshold3)
          const leafValue = await slowTree.methods
            .un_read_leaf_at(asset.address, AztecAddress.fromBigInt(THRESHOLD_3_KEY))
            .view()
          expect(leafValue['after']).toEqual(threshold3)
        })
      })

      describe('check thresholds', () => {
        it('checks thresholds are correct', async () => {
          const threshold1 = await asset.methods.threshold_limit_1().view()
          logger(`threshold1: ${threshold1}`)
          const threshold2 = await asset.methods.threshold_limit_2().view()
          logger(`threshold2: ${threshold2}`)
          const threshold3 = await asset.methods.threshold_limit_3().view()
          logger(`threshold3: ${threshold3}`)
        })
      })
    })

    describe('updatable transfer threshold using slow tree', () => {
      const secret = Fr.random()
      const mintAmount = 10_000n
      let secretHash: Fr
      let txHash: TxHash

      beforeAll(() => {
        secretHash = computeMessageSecretHash(secret)
      })

      it('mints 10_000 tokens to pending shield', async () => {
        const tx = asset.methods.mint_private(mintAmount, secretHash).send()
        const receipt = await tx.wait()
        expect(receipt.status).toBe(TxStatus.MINED)
        tokenSim.mintPrivate(mintAmount)
        txHash = receipt.txHash
      }, 60_000)

      it('redeems pending shield', async () => {
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
      }, 60_000)

      it('sets threshold1 to 250', async () => {
        const threshold1 = 250n
        await setThreshold1(threshold1)
        const leafValue = await slowTree.methods
          .un_read_leaf_at(asset.address, AztecAddress.fromBigInt(THRESHOLD_1_KEY))
          .view()
        expect(leafValue['after']).toEqual(threshold1)
      }, 60_000)

      it('checks threshold1 is 250', async () => {
        const threshold = await asset.methods.threshold_limit_1().view()
        expect(threshold).toEqual(250n)
      })

      it('successfully transfers 249 tokens', async () => {
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
      }, 60_000)

      it('fails to transfer 250 tokens', async () => {
        const amount = 250n
        logger(`Transferring ${amount} tokens...`)
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[1].address.toBigInt(), true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[0].address.toBigInt(), true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, THRESHOLD_1_KEY, true)))

        const call = asset.methods.transfer(accounts[0].address, accounts[1].address, amount, 0)
        await expect(call.simulate()).rejects.toThrowError(/Threshold amount exceeded/)
      }, 60_000)

      it('sets threshold1 to 500', async () => {
        const threshold1 = 500n
        await setThreshold1(threshold1)
        const leafValue = await slowTree.methods
          .un_read_leaf_at(asset.address, AztecAddress.fromBigInt(THRESHOLD_1_KEY))
          .view()
        expect(leafValue['after']).toEqual(threshold1)
      }, 60_000)

      it('now successfully transfers 250 tokens', async () => {
        const amount = 250n
        logger(`Transferring ${amount} tokens...`)
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[1].address.toBigInt(), true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[0].address.toBigInt(), true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, THRESHOLD_1_KEY, true)))

        const tx = asset.methods.transfer(accounts[0].address, accounts[1].address, amount, 0).send()
        const receipt = await tx.wait()
        expect(receipt.status).toBe(TxStatus.MINED)
        tokenSim.transferPrivate(accounts[0].address, accounts[1].address, amount)
      }, 60_000)
    })

    describe('transfer up to threshold2', () => {
      it('successfully transfers 500 tokens', async () => {
        const balance = await asset.methods.balance_of_private(accounts[0].address).view()
        logger(`Balance: ${balance}`)

        const amount = 500n
        logger(`Transferring ${amount} tokens...`)

        // Note: Capsules are REVERSE ORDER to how they're consumed in a function!
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[1].address.toBigInt(), true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[0].address.toBigInt(), true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, THRESHOLD_2_KEY, true)))

        const tx = asset.methods.transfer_up_to_threshold_2(accounts[0].address, accounts[1].address, amount, 0).send()
        const receipt = await tx.wait()
        expect(receipt.status).toBe(TxStatus.MINED)
        // tokenSim.transferPrivate(accounts[0].address, accounts[1].address, amount)
      }, 60_000)

      it('fails to transfer 5_000 tokens', async () => {
        const amount = 5_000n
        logger(`Transferring ${amount} tokens...`)
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[1].address.toBigInt(), true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, accounts[0].address.toBigInt(), true)))
        await wallets[0].addCapsule(getMembershipCapsule(await getMembershipProof(slowUpdateTreeSimulator, THRESHOLD_2_KEY, true)))

        const call = asset.methods.transfer_up_to_threshold_2(accounts[0].address, accounts[1].address, amount, 0)
        await expect(call.simulate()).rejects.toThrowError(/Threshold amount exceeded/)
      })
    })
    
  })
})
