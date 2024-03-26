import { ethers } from 'ethers'

export const farmPubKeyToId = (pubKey: number[]) => {
  const str = ethers.utils.hexlify(pubKey)
  return str
}
