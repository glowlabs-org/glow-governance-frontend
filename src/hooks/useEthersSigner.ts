import React from 'react'

import { type WalletClient, useWalletClient } from 'wagmi'
import { Signer, providers } from 'ethers'

export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account.address) as Signer
  return signer
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId })
  const [signer, setSigner] = React.useState<Signer>()
  React.useEffect(() => {
    if (walletClient) {
      setSigner(walletClientToSigner(walletClient))
    }
  }, [walletClient])

  return { signer }
}
