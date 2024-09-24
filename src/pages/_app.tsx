import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import Nav from '@/layout/Nav'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BalancesProvider } from '@/contexts/BalanceProvider'
import React from 'react'
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { createConfig, http, WagmiConfig, WagmiProvider } from 'wagmi'
import { goerli, mainnet } from 'wagmi/chains'
import Head from 'next/head'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
// import {argentWallet}

const { wallets } = getDefaultWallets({
  appName: 'Glow Governance',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || '',
})

const connectors = connectorsForWallets(
  [
    ...wallets,
    // {
    //   groupName: 'Other',
    //   wallets: [
    //     argentWallet({ projectId, chains }),
    //     trustWallet({ projectId, chains }),
    //     ledgerWallet({ projectId, chains }),
    //   ],
    // },
  ],
  {
    appName: 'Glow Governance',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || '',
  }
)

const config = createConfig({
  chains: [mainnet],
  ssr: true,
  connectors: connectors,
  // connectors: [
  //   walletConnect({
  //     projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || '',
  //   }),
  //   metaMask(),
  //   coinbaseWallet(),
  // ],
  transports: {
    [mainnet.id]: http(mainnet.rpcUrls.default.http[0]),
  },
})

export default function App({
  Component,
  pageProps,
}: AppProps<{
  session: Session
}>) {
  const [hasMounted, setHasMounted] = React.useState(false)
  const queryClient = new QueryClient({})
  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null //TODO: remove on deployments
  return (
    <>
      <Head>
        <title>Glow Governance</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <SessionProvider refetchInterval={0} session={pageProps.session}>
            {/* <RainbowKitSiweNextAuthProvider> */}
            <div className="bg-white">
              <div className="bg-[#f3f1e8] w-[93vw] min-h-screen mx-auto rounded-lg my-2">
                <RainbowKitProvider>
                  <BalancesProvider>
                    <Nav />
                    <Component {...pageProps} />
                    {/* <ReactQueryDevtools initialIsOpen={false} /> */}
                  </BalancesProvider>
                </RainbowKitProvider>
              </div>
            </div>
            {/* </RainbowKitSiweNextAuthProvider> */}
          </SessionProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </>
  )
}
