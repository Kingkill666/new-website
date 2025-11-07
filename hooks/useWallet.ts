"use client"

import { useCallback, useMemo, useState } from "react"
import { useAccount, useDisconnect } from "wagmi"
import { useAppKit } from "@reown/appkit/react"
import { formatAddress } from "@/lib/wallet-config"

type WalletConnection = {
  address: `0x${string}`
  chainId?: number
  walletName?: string
}

export const useWallet = () => {
  const { address, chainId, connector, isConnected, isConnecting: accountIsConnecting } = useAccount()
  const { disconnect } = useDisconnect()
  const { open, close } = useAppKit()

  const [error, setError] = useState<string | null>(null)
  const [pendingWalletId, setPendingWalletId] = useState<string | null>(null)

  const connection: WalletConnection | null = useMemo(() => {
    if (!address) return null
    return {
      address,
      chainId: chainId ?? undefined,
      walletName: connector?.name,
    }
  }, [address, chainId, connector?.name])

  const connectWallet = useCallback(
    async (walletId?: string) => {
      setError(null)
      setPendingWalletId(walletId ?? "reown")
      try {
        await open({ view: "Connect" })
      } catch (err) {
        console.error("❌ Failed to open AppKit wallet selector:", err)
        const message = err instanceof Error ? err.message : "Failed to open wallet selector"
        setError(message)
        throw err
      } finally {
        setPendingWalletId(null)
      }
    },
    [open],
  )

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect()
      await close()
    } catch (err) {
      console.error("❌ Failed to disconnect wallet:", err)
    } finally {
      setPendingWalletId(null)
      setError(null)
    }
  }, [disconnect, close])

  const formattedAddress = connection?.address ? formatAddress(connection.address) : null

  return {
    connection,
    isConnected,
    isConnecting: pendingWalletId ?? (accountIsConnecting ? "reown" : null),
    connectWallet,
    disconnect: disconnectWallet,
    formattedAddress,
    error,
    setError,
  }
}
