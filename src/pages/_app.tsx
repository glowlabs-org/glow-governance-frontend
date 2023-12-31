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

const { chains, publicClient } = configureChains(
  [goerli, mainnet],
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
    <WagmiConfig config={wagmiConfig}>
      <SessionProvider refetchInterval={0} session={pageProps.session}>
        {/* <RainbowKitSiweNextAuthProvider> */}
        <RainbowKitProvider chains={chains}>
          <BalancesProvider>
            <Nav />
            <QueryClientProvider client={queryClient}>
              <Component {...pageProps} />
              {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            </QueryClientProvider>
          </BalancesProvider>
        </RainbowKitProvider>
        {/* </RainbowKitSiweNextAuthProvider> */}
      </SessionProvider>
    </WagmiConfig>
  )
}
