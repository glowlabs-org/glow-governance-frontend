import { BigNumber } from 'ethers'
import { useContracts } from './useContracts'
import { useState } from 'react'

export const usePayProtocolFee = () => {
  const { minerPoolAndGCA, usdg } = useContracts()
  const [loading, setLoading] = useState(false)

  const payProtocolFee = async (amount: BigNumber) => {
    if (!minerPoolAndGCA) return
    if (!usdg) return
    setLoading(true)
    try {
      const allowance = await usdg.allowance(
        minerPoolAndGCA.address,
        minerPoolAndGCA.address
      )
      if (allowance.lt(amount)) {
        const tx = await usdg.approve(minerPoolAndGCA.address, amount)
        await tx.wait()
      }
      const tx = await minerPoolAndGCA.donateToUSDCMinerRewardsPool(amount)
      await tx.wait()
    } catch (e) {
    } finally {
      setLoading(false)
    }
  }

  return { payProtocolFee, loading }
}
