import React, { createContext, useEffect } from 'react'
import { useContracts } from '@/hooks/useContracts'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import { BalancesContext } from '@/contexts/BalanceProvider'

export const useBalancesCore = () => {
  const { address } = useAccount()
  const { glow, gcc, governance, usdg, usdc } = useContracts()
  const [glowBalance, setGlowBalance] = useState<string>('')
  const [gccBalance, setGCCBalance] = useState<string>('')
  const [nominationBalance, setNominationBalance] = useState<string>('')
  const [usdgBalance, setUSDGBalance] = useState<string>('')
  const [usdcBalance, setUSDCBalance] = useState<string>('')
  const [impactPowerBalance, setImpactPowerBalance] = useState<string>('')
  const fetchBalances = async () => {
    if (!address) return
    if (!gcc) return
    if (!glow) return
    if (!governance) return
    if (!usdg) return
    if (!usdc) return
    const glowBalancePromise = glow.balanceOf(address)
    const gccBalancePromise = gcc.balanceOf(address)
    const nominationBalancePromise = governance.nominationsOf(address)
    const usdgBalancePromise = usdg.balanceOf(address)
    const usdcBalancePromise = usdc.balanceOf(address)
    const impactPowerBalancePromise = gcc.totalImpactPowerEarned(address)

    const [
      glowBalance,
      gccBalance,
      nominationBalance,
      usdgBalance,
      usdcBalance,
      impactPowerBalance,
    ] = await Promise.all([
      glowBalancePromise,
      gccBalancePromise,
      nominationBalancePromise,
      usdgBalancePromise,
      usdcBalancePromise,
      impactPowerBalancePromise,
    ])
    setGlowBalance(ethers.utils.formatEther(glowBalance) || '0')
    setGCCBalance(ethers.utils.formatEther(gccBalance) || '0')
    setNominationBalance(ethers.utils.formatUnits(nominationBalance, 12) || '0')
    setImpactPowerBalance(
      ethers.utils.formatUnits(impactPowerBalance, 12) || '0'
    )
    setUSDGBalance(ethers.utils.formatUnits(usdgBalance, '6') || '0')
    setUSDCBalance(ethers.utils.formatUnits(usdcBalance, '6') || '0')
  }
  useEffect(() => {
    fetchBalances()
  }, [address])

  useEffect(() => {
    fetchBalances()
  }, [glow, gcc, governance])
  return {
    fetchBalances,
    glowBalance,
    usdgBalance,
    gccBalance,
    usdcBalance,
    nominationBalance,
    totalImpactPowerEarned: impactPowerBalance,
  }
}

export const useBalances = () => {
  return React.useContext(BalancesContext)
}
