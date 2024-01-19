import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import { WagmiConfig, mainnet } from 'wagmi'
import Nav from '@/layout/Nav'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BalancesProvider } from '@/contexts/BalanceProvider'
import React from 'react'
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig } from 'wagmi'
import { goerli } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import Head from 'next/head'

const { chains, publicClient } = configureChains(
  [mainnet, goerli],
  [publicProvider()]
)
const queryClient = new QueryClient({})
const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

export default function App({
  Component,
  pageProps,
}: AppProps<{
  session: Session
}>) {
  const [hasMounted, setHasMounted] = React.useState(false)

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null //TODO: remove on deployments
  return (
    <>
      <Head>
        <title>Glow Governance</title>
      </Head>
      <WagmiConfig config={wagmiConfig}>
        <SessionProvider refetchInterval={0} session={pageProps.session}>
          {/* <RainbowKitSiweNextAuthProvider> */}
          <div className="bg-white">
            <div className="bg-[#f3f1e8] w-[93vw] mx-auto rounded-lg my-2">
              <RainbowKitProvider chains={chains}>
                <BalancesProvider>
                  <Nav />
                  <QueryClientProvider client={queryClient}>
                    <Component {...pageProps} />
                    {/* <ReactQueryDevtools initialIsOpen={false} /> */}
                  </QueryClientProvider>
                </BalancesProvider>
              </RainbowKitProvider>
            </div>
          </div>
          {/* </RainbowKitSiweNextAuthProvider> */}
        </SessionProvider>
      </WagmiConfig>
    </>
  )
}
