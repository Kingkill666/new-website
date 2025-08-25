"use client"

import { useCallback, useEffect, useState } from "react"
import { 
  requestWalletConnection, 
  connectMobileWallet, 
  isWalletInstalled, 
  getWalletDisplayName,
  isMobile,
  forceClearWalletState,
  getWalletProvider
} from "@/lib/wallet-config"
import { formatAddress } from "@/lib/wallet-config"

export const useWallet = () => {
  const [connection, setConnection] = useState<any>(null)
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Do NOT auto-connect from localStorage/sessionStorage on mount
  // Only connect when the user explicitly clicks a wallet button

  // Set up event listeners when connection changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("📱 Accounts changed:", accounts)
      if (accounts.length === 0) {
        // User disconnected
        setConnection(null)
        localStorage.removeItem("wallet_connection")
      } else if (connection && accounts[0] !== connection.address) {
        // User switched accounts
        setConnection({ ...connection, address: accounts[0] })
        localStorage.setItem("wallet_connection", JSON.stringify({ ...connection, address: accounts[0] }))
      }
    }

    const handleChainChanged = (chainId: string) => {
      console.log("🔄 Chain changed:", chainId)
      // Optionally handle chain changes
    }

    const handleConnect = (connectInfo: any) => {
      console.log("🔌 Wallet connected:", connectInfo)
    }

    const handleDisconnect = (error: any) => {
      console.log("🔌 Wallet disconnected:", error)
      setConnection(null)
      localStorage.removeItem("wallet_connection")
    }

    // Add event listeners
    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)
    window.ethereum.on("connect", handleConnect)
    window.ethereum.on("disconnect", handleDisconnect)

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
        window.ethereum.removeListener("connect", handleConnect)
        window.ethereum.removeListener("disconnect", handleDisconnect)
      }
    }
  }, [connection])

  const disconnect = useCallback(() => {
    console.log("🔌 Disconnecting wallet")
    
    // Clear connection state
    setConnection(null)
    setIsConnecting(null)
    setError(null)
    
    // Remove from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("wallet_connection")
      sessionStorage.removeItem("wallet_connection")
    }
    
    // Force clear wallet state for all providers
    const providers = [
      window.ethereum,
      window.coinbaseWalletExtension,
      window.phantom?.ethereum
    ].filter(Boolean)
    
    providers.forEach(async (provider) => {
      try {
        await forceClearWalletState(provider)
      } catch (error) {
        console.log("⚠️ Error clearing provider state:", error)
      }
    })
    
    // Remove event listeners if ethereum is available
    if (typeof window !== "undefined" && window.ethereum && window.ethereum.removeListener) {
      try {
        window.ethereum.removeListener("accountsChanged", () => {})
        window.ethereum.removeListener("chainChanged", () => {})
        window.ethereum.removeListener("connect", () => {})
        window.ethereum.removeListener("disconnect", () => {})
      } catch (error) {
        console.log("⚠️ Error removing event listeners:", error)
      }
    }

    console.log("✅ Wallet disconnected and state cleared")
  }, [])

  const connectWallet = useCallback(async (walletId: string) => {
    setIsConnecting(walletId)
    setError(null)

    console.log(`🎯 Attempting to connect to ${walletId}`)
    console.log(`📱 Mobile device: ${isMobile()}`)

    try {
      let result

      // Use mobile-specific connection for mobile devices
      if (isMobile()) {
        console.log("📱 Using mobile connection strategy...")
        result = await connectMobileWallet(walletId)
      } else {
        console.log("💻 Using desktop connection strategy...")

        // Force disconnect first to ensure popup appears
        console.log("🔌 Forcing disconnect before fresh connection...")
        disconnect()

        // For desktop, always try to connect - let the wallet extension handle the popup
        console.log(`🔌 Requesting connection to ${getWalletDisplayName(walletId)}`)
        result = await requestWalletConnection(walletId)
      }

      // Save connection
      setConnection(result)
      localStorage.setItem("wallet_connection", JSON.stringify(result))
      console.log("✅ Wallet connected successfully:", result)

    } catch (error) {
      console.error("❌ Wallet connection failed:", error)
      setError(error instanceof Error ? error.message : "Connection failed")
    } finally {
      setIsConnecting(null)
    }
  }, [disconnect])

  const formattedAddress = connection ? formatAddress(connection.address) : null

  return {
    connection,
    isConnecting,
    error,
    connectWallet,
    disconnect,
    isConnected: !!connection,
    formattedAddress,
    setError,
  }
}
