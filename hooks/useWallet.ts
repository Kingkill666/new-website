"use client"

import { useState, useEffect, useCallback } from "react"
import { detectWallets, getSpecificProvider, SUPPORTED_NETWORKS } from "@/lib/wallet-config"

export interface WalletInfo {
  name: string
  logo: string
  id: string
  installed?: boolean
}

export interface WalletState {
  isConnected: boolean
  address: string | null
  walletType: string | null
  balance: string | null
  chainId: number | null
  isConnecting: boolean
  error: string | null
}

export const WALLET_OPTIONS: WalletInfo[] = [
  { name: "MetaMask", logo: "🦊", id: "metamask" },
  { name: "Coinbase", logo: "/images/coinbase-logo.png", id: "coinbase" },
  { name: "Rainbow", logo: "🌈", id: "rainbow" },
  { name: "Phantom", logo: "👻", id: "phantom" },
]

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    walletType: null,
    balance: null,
    chainId: null,
    isConnecting: false,
    error: null,
  })

  const formatAddress = useCallback((address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [])

  const formatBalance = useCallback((balance: string) => {
    const num = Number.parseFloat(balance)
    return num.toFixed(4)
  }, [])

  // Connect to Ethereum wallets
  const connectEthereumWallet = useCallback(async (walletId: string) => {
    try {
      setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }))

      const detectedWallets = detectWallets()

      // Check if wallet is installed
      switch (walletId) {
        case "metamask":
          if (!detectedWallets.metamask) {
            throw new Error("MetaMask not installed. Please install MetaMask extension.")
          }
          break
        case "coinbase":
          if (!detectedWallets.coinbase) {
            throw new Error("Coinbase Wallet not installed. Please install Coinbase Wallet extension.")
          }
          break
      }

      const provider = getSpecificProvider(walletId)
      if (!provider) {
        throw new Error(`${walletId} provider not found`)
      }

      // Request account access
      const accounts = await provider.request({ method: "eth_requestAccounts" })

      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      const address = accounts[0]

      // Get chain ID
      const chainId = await provider.request({ method: "eth_chainId" })

      // Get balance
      let balance = "0.0000"
      try {
        const balanceWei = await provider.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        })
        // Convert from wei to ETH (simplified)
        const balanceEth = Number.parseInt(balanceWei, 16) / Math.pow(10, 18)
        balance = balanceEth.toFixed(4)
      } catch (balanceError) {
        console.warn("Could not fetch balance:", balanceError)
      }

      setWalletState({
        isConnected: true,
        address,
        walletType: walletId.charAt(0).toUpperCase() + walletId.slice(1),
        balance,
        chainId: Number.parseInt(chainId, 16),
        isConnecting: false,
        error: null,
      })

      // Store connection info
      localStorage.setItem(
        "vmf_connected_wallet",
        JSON.stringify({
          walletType: walletId,
          address,
          timestamp: Date.now(),
        }),
      )
    } catch (error: any) {
      console.error("Ethereum wallet connection error:", error)
      setWalletState((prev) => ({
        ...prev,
        error: error.message || `Failed to connect ${walletId}`,
        isConnecting: false,
      }))

      if (error.code === 4001) {
        alert("Connection rejected by user")
      } else if (error.code === -32002) {
        alert("Connection request already pending. Please check your wallet.")
      } else {
        alert(error.message || `Failed to connect ${walletId}`)
      }
    }
  }, [])

  // Connect to Phantom wallet
  const connectPhantomWallet = useCallback(async () => {
    try {
      setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }))

      if (typeof window === "undefined" || !(window as any).solana?.isPhantom) {
        throw new Error("Phantom Wallet not installed. Please install Phantom extension.")
      }

      const phantom = (window as any).solana
      const response = await phantom.connect()

      if (response.publicKey) {
        const address = response.publicKey.toString()

        setWalletState({
          isConnected: true,
          address,
          walletType: "Phantom",
          balance: "0.0000", // Simplified
          chainId: null,
          isConnecting: false,
          error: null,
        })

        localStorage.setItem(
          "vmf_connected_wallet",
          JSON.stringify({
            walletType: "phantom",
            address,
            timestamp: Date.now(),
          }),
        )
      }
    } catch (error: any) {
      console.error("Phantom wallet connection error:", error)
      setWalletState((prev) => ({
        ...prev,
        error: error.message || "Failed to connect Phantom",
        isConnecting: false,
      }))
      alert(error.message || "Failed to connect Phantom")
    }
  }, [])

  // Main connect function
  const connectWallet = useCallback(
    async (walletId: string) => {
      if (walletId === "phantom") {
        await connectPhantomWallet()
      } else {
        await connectEthereumWallet(walletId)
      }
    },
    [connectEthereumWallet, connectPhantomWallet],
  )

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      // Disconnect Solana wallet
      if (walletState.walletType === "Phantom" && (window as any).solana?.isPhantom) {
        try {
          await (window as any).solana.disconnect()
        } catch (error) {
          console.warn("Error disconnecting Phantom:", error)
        }
      }

      // Reset state
      setWalletState({
        isConnected: false,
        address: null,
        walletType: null,
        balance: null,
        chainId: null,
        isConnecting: false,
        error: null,
      })

      // Clear storage
      localStorage.removeItem("vmf_connected_wallet")
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
    }
  }, [walletState.walletType])

  // Switch network
  const switchNetwork = useCallback(
    async (networkKey: keyof typeof SUPPORTED_NETWORKS) => {
      try {
        const network = SUPPORTED_NETWORKS[networkKey]
        const provider = getSpecificProvider(walletState.walletType?.toLowerCase() || "")

        if (!provider) return false

        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: network.chainId }],
        })

        // Update chain ID in state
        setWalletState((prev) => ({
          ...prev,
          chainId: Number.parseInt(network.chainId, 16),
        }))

        return true
      } catch (error: any) {
        console.error("Failed to switch network:", error)

        // If network doesn't exist, try to add it
        if (error.code === 4902) {
          return await addNetwork(networkKey)
        }

        return false
      }
    },
    [walletState.walletType],
  )

  // Add network to wallet
  const addNetwork = useCallback(
    async (networkKey: keyof typeof SUPPORTED_NETWORKS) => {
      try {
        const network = SUPPORTED_NETWORKS[networkKey]
        const provider = getSpecificProvider(walletState.walletType?.toLowerCase() || "")

        if (!provider) return false

        await provider.request({
          method: "wallet_addEthereumChain",
          params: [network],
        })

        return true
      } catch (error) {
        console.error("Failed to add network:", error)
        return false
      }
    },
    [walletState.walletType],
  )

  // Check for existing connections on mount
  useEffect(() => {
    const checkExistingConnections = async () => {
      try {
        const stored = localStorage.getItem("vmf_connected_wallet")
        if (!stored) return

        const { walletType, timestamp } = JSON.parse(stored)

        // Check if connection is recent (within 24 hours)
        if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem("vmf_connected_wallet")
          return
        }

        // Check Phantom connection
        if (walletType === "phantom" && (window as any).solana?.isPhantom) {
          const phantom = (window as any).solana
          if (phantom.isConnected) {
            try {
              const publicKey = phantom.publicKey?.toString()
              if (publicKey) {
                setWalletState({
                  isConnected: true,
                  address: publicKey,
                  walletType: "Phantom",
                  balance: "0.0000",
                  chainId: null,
                  isConnecting: false,
                  error: null,
                })
              }
            } catch (error) {
              console.warn("Error checking Phantom connection:", error)
            }
          }
        }

        // Check Ethereum wallet connections
        if (walletType !== "phantom") {
          const provider = getSpecificProvider(walletType)
          if (provider) {
            try {
              const accounts = await provider.request({ method: "eth_accounts" })
              if (accounts.length > 0) {
                const address = accounts[0]
                const chainId = await provider.request({ method: "eth_chainId" })

                setWalletState({
                  isConnected: true,
                  address,
                  walletType: walletType.charAt(0).toUpperCase() + walletType.slice(1),
                  balance: "0.0000",
                  chainId: Number.parseInt(chainId, 16),
                  isConnecting: false,
                  error: null,
                })
              }
            } catch (error) {
              console.warn("Error checking Ethereum connection:", error)
            }
          }
        }
      } catch (error) {
        console.error("Error checking existing connections:", error)
        localStorage.removeItem("vmf_connected_wallet")
      }
    }

    const timer = setTimeout(checkExistingConnections, 500)
    return () => clearTimeout(timer)
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        setWalletState((prev) => ({
          ...prev,
          address: accounts[0],
        }))
      }
    }

    const handleChainChanged = (chainId: string) => {
      setWalletState((prev) => ({
        ...prev,
        chainId: Number.parseInt(chainId, 16),
      }))
    }

    // Ethereum events
    if ((window as any).ethereum) {
      ;(window as any).ethereum.on("accountsChanged", handleAccountsChanged)
      ;(window as any).ethereum.on("chainChanged", handleChainChanged)
    }

    // Phantom events
    if ((window as any).solana?.isPhantom) {
      ;(window as any).solana.on("accountChanged", (publicKey: any) => {
        if (!publicKey) {
          disconnectWallet()
        } else {
          setWalletState((prev) => ({
            ...prev,
            address: publicKey.toString(),
          }))
        }
      })
    }

    return () => {
      if ((window as any).ethereum?.removeListener) {
        ;(window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged)
        ;(window as any).ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [disconnectWallet])

  // Get available wallets with installation status
  const getAvailableWallets = useCallback(() => {
    const detected = detectWallets()
    return WALLET_OPTIONS.map((wallet) => ({
      ...wallet,
      installed:
        wallet.id === "phantom"
          ? detected.phantom
          : wallet.id === "metamask"
            ? detected.metamask
            : wallet.id === "coinbase"
              ? detected.coinbase
              : wallet.id === "rainbow"
                ? detected.rainbow || true // Rainbow might not be detectable
                : false,
    }))
  }, [])

  return {
    walletState,
    isConnecting: walletState.isConnecting,
    connectWallet,
    disconnectWallet,
    formatAddress,
    switchNetwork,
    addNetwork,
    getAvailableWallets,
    chainId: walletState.chainId,
    error: walletState.error,
  }
}
