"use client"

import type { ReactNode } from "react"
import { PrivyProvider, WagmiProvider, QueryClientProvider, queryClient, privyConfig, wagmiConfig } from "@/lib/privy-config"

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <PrivyProvider
      appId={privyConfig.appId}
      config={privyConfig.config}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}
