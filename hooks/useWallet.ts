"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from "wagmi"
import { detectWallets, SUPPORTED_NETWORKS } from "@/lib/wallet-config"

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
  {
    name: "MetaMask",
    logo: "🦊",
    id: "metamask",
  },
  {
    name: "Coinbase",
    logo: "/images/coinbase-logo.png",
    id: "coinbase",
  },
  {
    name: "Rainbow",
    logo: "🌈",
    id: "rainbow",
  },
  {
    name: "Phantom",
    logo: "👻",
    id: "phantom",
  },
  {
    name: "Safe",
    logo: "/images/avatar-safe.png",
    id: "safe",
  },
]

export function useWallet() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { data: balance } = useBalance({ address })

  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    walletType: null,
    balance: null,
    chainId: null,
    isConnecting: false,
    error: null,
  })

  const [solanaWallet, setSolanaWallet] = useState<{
    connected: boolean
    address: string | null
    balance: string | null
  }>({
    connected: false,
    address: null,
    balance: null,
  })

  const formatAddress = useCallback((address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [])

  const formatBalance = useCallback((balance: bigint | null, decimals = 18) => {
    if (!balance) return "0.0000"
    const divisor = BigInt(10 ** decimals)
    const quotient = balance / divisor
    const remainder = balance % divisor
    const fractional = Number(remainder) / Number(divisor)
    return (Number(quotient) + fractional).toFixed(4)
  }, [])

  // Connect to Ethereum wallets using Wagmi
  const connectEthereumWallet = useCallback(
    async (walletId: string) => {
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
          case "rainbow":
            // Rainbow uses WalletConnect, so we don't need specific detection
            break
          case "safe":
            if (!detectedWallets.safe) {
              throw new Error("Safe Wallet not available. Please use within Safe Apps or install Safe extension.")
            }
            break
        }

        // Find the appropriate connector
        let connector
        switch (walletId) {
          case "metamask":
            connector = connectors.find((c) => c.id === "metaMask")
            break
          case "coinbase":
            connector = connectors.find((c) => c.id === "coinbaseWallet")
            break
          case "rainbow":
            // Rainbow uses WalletConnect
            connector = connectors.find((c) => c.id === "walletConnect")
            break
          case "safe":
            connector = connectors.find((c) => c.id === "safe")
            break
        }

        if (!connector) {
          throw new Error(`${walletId} connector not found`)
        }

        await connect({ connector })

        // Store connection info
        localStorage.setItem(
          "vmf_connected_wallet",
          JSON.stringify({
            walletType: walletId,
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

        // Show user-friendly error
        if (error.code === 4001) {
          alert("Connection rejected by user")
        } else if (error.code === -32002) {
          alert("Connection request already pending. Please check your wallet.")
        } else {
          alert(error.message || `Failed to connect ${walletId}`)
        }
      }
    },
    [connect, connectors],
  )

  // Connect to Solana wallets (Phantom)
  const connectSolanaWallet = useCallback(async () => {
    try {
      setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }))

      if (typeof window === "undefined" || !(window as any).solana?.isPhantom) {
        throw new Error("Phantom Wallet not installed. Please install Phantom extension.")
      }

      const phantom = (window as any).solana
      const response = await phantom.connect()

      if (response.publicKey) {
        const address = response.publicKey.toString()

        // Get Solana balance
        try {
          const connection = new (await import("@solana/web3.js")).Connection("https://api.mainnet-beta.solana.com")
          const balance = await connection.getBalance(response.publicKey)
          const solBalance = (balance / 1e9).toFixed(4) // Convert lamports to SOL

          setSolanaWallet({
            connected: true,
            address,
            balance: solBalance,
          })
        } catch (balanceError) {
          console.warn("Could not fetch Solana balance:", balanceError)
          setSolanaWallet({
            connected: true,
            address,
            balance: "0.0000",
          })
        }

        setWalletState((prev) => ({
          ...prev,
          isConnected: true,
          address,
          walletType: "Phantom",
          balance: null, // Solana balance handled separately
          chainId: null,
          isConnecting: false,
          error: null,
        }))

        // Store connection info
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
      console.error("Solana wallet connection error:", error)
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
        await connectSolanaWallet()
      } else {
        await connectEthereumWallet(walletId)
      }
    },
    [connectEthereumWallet, connectSolanaWallet],
  )

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      // Disconnect Ethereum wallets
      if (isConnected) {
        disconnect()
      }

      // Disconnect Solana wallet
      if (solanaWallet.connected && (window as any).solana?.isPhantom) {
        try {
          await (window as any).solana.disconnect()
        } catch (error) {
          console.warn("Error disconnecting Phantom:", error)
        }
      }

      // Reset states
      setWalletState({
        isConnected: false,
        address: null,
        walletType: null,
        balance: null,
        chainId: null,
        isConnecting: false,
        error: null,
      })

      setSolanaWallet({
        connected: false,
        address: null,
        balance: null,
      })

      // Clear storage
      localStorage.removeItem("vmf_connected_wallet")
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
    }
  }, [isConnected, disconnect, solanaWallet.connected])

  // Switch network
  const switchNetwork = useCallback(
    async (networkKey: keyof typeof SUPPORTED_NETWORKS) => {
      try {
        const network = SUPPORTED_NETWORKS[networkKey]
        await switchChain({ chainId: Number.parseInt(network.chainId, 16) })
        return true
      } catch (error) {
        console.error("Failed to switch network:", error)
        return false
      }
    },
    [switchChain],
  )

  // Add network to wallet
  const addNetwork = useCallback(async (networkKey: keyof typeof SUPPORTED_NETWORKS) => {
    try {
      const network = SUPPORTED_NETWORKS[networkKey]

      if (typeof window !== "undefined" && (window as any).ethereum) {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [network],
        })
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to add network:", error)
      return false
    }
  }, [])

  // Update wallet state when Wagmi state changes
  useEffect(() => {
    if (isConnected && address) {
      const storedWallet = localStorage.getItem("vmf_connected_wallet")
      let walletType = "Unknown"

      if (storedWallet) {
        try {
          const parsed = JSON.parse(storedWallet)
          walletType = parsed.walletType || "Unknown"
        } catch (error) {
          console.warn("Error parsing stored wallet info:", error)
        }
      }

      setWalletState((prev) => ({
        ...prev,
        isConnected: true,
        address,
        walletType: walletType.charAt(0).toUpperCase() + walletType.slice(1),
        balance: balance ? formatBalance(balance.value, balance.decimals) : null,
        chainId: chainId || null,
        isConnecting: false,
        error: null,
      }))
    } else if (!isConnected && !solanaWallet.connected) {
      setWalletState((prev) => ({
        ...prev,
        isConnected: false,
        address: null,
        walletType: null,
        balance: null,
        chainId: null,
        isConnecting: isPending,
        error: null,
      }))
    }
  }, [isConnected, address, balance, chainId, isPending, formatBalance, solanaWallet.connected])

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
                setSolanaWallet({
                  connected: true,
                  address: publicKey,
                  balance: "0.0000", // Will be updated by effect
                })
                setWalletState((prev) => ({
                  ...prev,
                  isConnected: true,
                  address: publicKey,
                  walletType: "Phantom",
                  balance: null,
                  chainId: null,
                }))
              }
            } catch (error) {
              console.warn("Error checking Phantom connection:", error)
            }
          }
        }
      } catch (error) {
        console.error("Error checking existing connections:", error)
        localStorage.removeItem("vmf_connected_wallet")
      }
    }

    // Add a small delay to ensure window objects are loaded
    const timer = setTimeout(checkExistingConnections, 500)
    return () => clearTimeout(timer)
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      }
    }

    const handleChainChanged = () => {
      // Reload page on chain change to avoid issues
      window.location.reload()
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
                ? true
                : // Rainbow might not be detectable
                  wallet.id === "safe"
                  ? detected.safe
                  : false,
    }))
  }, [])

  return {
    walletState: solanaWallet.connected
      ? {
          ...walletState,
          isConnected: true,
          address: solanaWallet.address,
          walletType: "Phantom",
          balance: solanaWallet.balance,
        }
      : walletState,
    isConnecting: walletState.isConnecting || isPending,
    connectWallet,
    disconnectWallet,
    formatAddress,
    switchNetwork,
    addNetwork,
    getAvailableWallets,
    // Expose additional utilities
    chainId: walletState.chainId,
    error: walletState.error,
  }
}
