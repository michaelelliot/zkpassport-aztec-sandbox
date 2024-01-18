import fs from 'fs'
import path from 'path'
import { Fr, AztecAddress } from '@aztec/aztec.js'
import { type LevelDown, default as leveldown } from 'leveldown'
import { type MemDown, default as memdown } from 'memdown'
import { SparseTree } from '@aztec/merkle-tree'
export const createMemDown = () => (memdown as any)() as MemDown<any, any>
export const createLevelDown = (path: string) => (leveldown as any)(path) as LevelDown

const __filename = new URL(import.meta.url).pathname
const __dirname = path.dirname(__filename)
const ADDRESSES_FILE = '../../../cache/addresses.json'

export function updateContractAddress(name: string, address: string | AztecAddress): void {
  const filePath = path.resolve(__dirname, ADDRESSES_FILE)
  try {
    const fileData = fs.readFileSync(filePath, 'utf-8')
    const addresses = JSON.parse(fileData)
    addresses[name] = address.toString()
    fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2), 'utf-8')
  } catch (error) {
    const addresses = { [name]: address.toString() }
    fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2), 'utf-8')
  }
}

export function getContractAddress(name: string): string | undefined {
  try {
    const filePath = path.resolve(__dirname, ADDRESSES_FILE)
    const fileData = fs.readFileSync(filePath, 'utf-8')
    const addresses = JSON.parse(fileData)
    const contractAddress = addresses[name]
    return contractAddress !== undefined ? contractAddress : undefined
  } catch (error) {
    return undefined
  }
}

export const getMembershipProof = async (tree: SparseTree, index: bigint, includeUncommitted: boolean) => {
  return {
    index,
    value: Fr.fromBuffer((await tree.getLeafValue(index, includeUncommitted))!),
    sibling_path: (await tree.getSiblingPath(index, includeUncommitted)).toFieldArray(),
  }
}

export const getMembershipCapsule = (proof: { index: bigint; value: Fr; sibling_path: Fr[] }) => {
  return [new Fr(proof.index), proof.value, ...proof.sibling_path]
}

export const getUpdateProof = async (tree: SparseTree, newValue: bigint, index: bigint) => {
  const beforeProof = await getMembershipProof(tree, index, false)
  const afterProof = await getMembershipProof(tree, index, true)
  return {
    index,
    new_value: newValue,
    before: { value: beforeProof.value, sibling_path: beforeProof.sibling_path },
    after: { value: afterProof.value, sibling_path: afterProof.sibling_path },
  }
}

export const getUpdateCapsule = (proof: {
  index: bigint
  new_value: bigint
  before: { value: Fr; sibling_path: Fr[] }
  after: { value: Fr; sibling_path: Fr[] }
}) => {
  return [
    new Fr(proof.index),
    new Fr(proof.new_value),
    proof.before.value,
    ...proof.before.sibling_path,
    proof.after.value,
    ...proof.after.sibling_path,
  ]
}

export const fmt = (num: number | bigint) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '_')
}
