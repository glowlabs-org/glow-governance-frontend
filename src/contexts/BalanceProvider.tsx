import React, { createContext, useEffect } from 'react'
import { useContracts } from '@/hooks/useContracts'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import { useBalancesCore } from '@/hooks/useBalances'

export const BalancesContext = createContext({
  fetchBalances: () => {},
  glowBalance: '',
  usdgBalance: '',
  gccBalance: '',
  usdcBalance: '',
  nominationBalance: '',
})

export const BalancesProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const balances = useBalancesCore()
  return (
    <BalancesContext.Provider value={balances}>
      {children}
    </BalancesContext.Provider>
  )
}
