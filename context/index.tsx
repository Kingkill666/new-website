// context/index.tsx
'use client'

import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, cookieToInitialState, type Config } from 'wagmi'
import { createAppKit } from '@reown/appkit/react'
// Import config, networks, projectId, and wagmiAdapter from your config file
import { config, networks, projectId, wagmiAdapter } from '@/config'
// Import the default network separately if needed
import { base } from '@reown/appkit/networks'

const queryClient = new QueryClient()

const metadata = {
  name: 'VMF - Veterans & Military Families',
  description: 'Supporting those who served through blockchain technology',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://vmfcoin.com',
  icons: ['https://vmfcoin.com/favicon.png'],
}

// Initialize AppKit *outside* the component render cycle
// Add a check for projectId for type safety, although config throws error already.
if (!projectId) {
  console.error("AppKit Initialization Error: Project ID is missing.");
  // Optionally throw an error or render fallback UI
} else {
  createAppKit({
    adapters: [wagmiAdapter],
    // Project ID is required and already checked above
    projectId: projectId,
    // Pass networks directly (type is now correctly inferred from config)
    networks: networks,
    defaultNetwork: base, // Base network for VMF - REQUIRED
    metadata,
    features: { 
      analytics: true,
      email: false, // Disable email features
      socials: [], // Disable social login features
    },
  })
}

export default function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode
  cookies: string | null // Cookies from server for hydration
}) {
  // Calculate initial state for Wagmi SSR hydration
  const initialState = cookieToInitialState(config as Config, cookies)

  return (
    // Cast config as Config for WagmiProvider
    <WagmiProvider config={config as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
