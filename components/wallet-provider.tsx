"use client"

import type { ReactNode } from "react"

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  // Simplified provider - no external dependencies
  return <>{children}</>
}
