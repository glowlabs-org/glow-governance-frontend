import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import { WagmiConfig, mainnet } from 'wagmi'
import Nav from '@/layout/Nav'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({})

import React from 'react'
import '@rainbow-me/rainbowkit/styles.css'

import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig } from 'wagmi'
import { goerli } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'

const { chains, publicClient } = configureChains(
  [goerli, mainnet],
  [publicProvider()]
)
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
    <WagmiConfig config={wagmiConfig}>
      <SessionProvider refetchInterval={0} session={pageProps.session}>
        {/* <RainbowKitSiweNextAuthProvider> */}
        <RainbowKitProvider chains={chains}>
          <Nav />
          <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </QueryClientProvider>
        </RainbowKitProvider>
        {/* </RainbowKitSiweNextAuthProvider> */}
      </SessionProvider>
    </WagmiConfig>
  )
}
