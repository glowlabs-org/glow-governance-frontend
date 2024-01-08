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
  const fetchBalances = async () => {
    if (!address) return
    if (!gcc) return
    if (!glow) return
    if (!governance) return
    if (!usdg) return
    if (!usdc) return
    const glowBalance = await glow.balanceOf(address)
    const gccBalance = await gcc.balanceOf(address)
    const nominationBalance = await governance.nominationsOf(address)
    const usdgBalance = await usdg.balanceOf(address)
    const usdcBalance = await usdc.balanceOf(address)
    setGlowBalance(ethers.utils.formatEther(glowBalance) || '0')
    setGCCBalance(ethers.utils.formatEther(gccBalance) || '0')
    setNominationBalance(ethers.utils.formatUnits(nominationBalance, 12) || '0')
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
  }
}

export const useBalances = () => {
  return React.useContext(BalancesContext)
}
