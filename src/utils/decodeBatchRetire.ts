import { ethers } from 'ethers'

export const decodeBatchRetire = (data: string) => {
  const decoder = new ethers.utils.AbiCoder()
  const tupleArry = '(address,uint)[]'
  const decoded = decoder.decode([tupleArry], data)
  return decoded as { address: `0x${string}`; amount: ethers.BigNumber }[]
}
