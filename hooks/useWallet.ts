"use client"

import { useState, useEffect, useCallback } from "react"

export interface WalletInfo {
  name: string
  logo: string
  id: string
}

export interface WalletState {
  isConnected: boolean
  address: string | null
  walletType: string | null
  balance: string | null
}

export const WALLET_OPTIONS: WalletInfo[] = [
  {
    name: "Coinbase",
    logo: "/images/coinbase-logo.png",
    id: "coinbase",
  },
  {
    name: "MetaMask",
    logo: "🦊",
    id: "metamask",
  },
  {
    name: "Phantom",
    logo: "👻",
    id: "phantom",
  },
  {
    name: "Rainbow",
    logo: "🌈",
    id: "rainbow",
  },
  {
    name: "Safe",
    logo: "/images/avatar-safe.png",
    id: "safe",
  },
]

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    walletType: null,
    balance: null,
  })
  const [isConnecting, setIsConnecting] = useState(false)

  const formatAddress = useCallback((address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [])

  const getBalance = useCallback(async (address: string, provider: any) => {
    try {
      const balance = await provider.getBalance(address)
      const ethBalance = (window as any).ethers?.utils?.formatEther(balance) || "0"
      return Number.parseFloat(ethBalance).toFixed(4)
    } catch (error) {
      console.error("Failed to get balance:", error)
      return "0.0000"
    }
  }, [])

  const connectWallet = useCallback(
    async (walletId: string) => {
      setIsConnecting(true)
      try {
        let provider: any = null
        let accounts: string[] = []
        let walletName = ""

        switch (walletId) {
          case "metamask":
            if (typeof window !== "undefined" && (window as any).ethereum?.isMetaMask) {
              provider = (window as any).ethereum
              accounts = await provider.request({ method: "eth_requestAccounts" })
              walletName = "MetaMask"
            } else {
              throw new Error("MetaMask not installed. Please install MetaMask extension.")
            }
            break

          case "coinbase":
            if (typeof window !== "undefined") {
              // Check for Coinbase Wallet extension
              if ((window as any).ethereum?.isCoinbaseWallet) {
                provider = (window as any).ethereum
                accounts = await provider.request({ method: "eth_requestAccounts" })
                walletName = "Coinbase"
              }
              // Check for multiple providers
              else if ((window as any).ethereum?.providers) {
                const coinbaseProvider = (window as any).ethereum.providers.find((p: any) => p.isCoinbaseWallet)
                if (coinbaseProvider) {
                  provider = coinbaseProvider
                  accounts = await provider.request({ method: "eth_requestAccounts" })
                  walletName = "Coinbase"
                } else {
                  throw new Error("Coinbase Wallet not found. Please install Coinbase Wallet.")
                }
              } else {
                throw new Error("Coinbase Wallet not installed. Please install Coinbase Wallet extension.")
              }
            }
            break

          case "phantom":
            if (typeof window !== "undefined" && (window as any).solana?.isPhantom) {
              const resp = await (window as any).solana.connect()
              setWalletState({
                isConnected: true,
                address: resp.publicKey.toString(),
                walletType: "Phantom",
                balance: null, // Solana balance would need different handling
              })
              return
            } else {
              throw new Error("Phantom Wallet not installed. Please install Phantom extension.")
            }

          case "rainbow":
            if (typeof window !== "undefined") {
              // Rainbow can be detected through ethereum provider
              if ((window as any).ethereum?.isRainbow) {
                provider = (window as any).ethereum
                accounts = await provider.request({ method: "eth_requestAccounts" })
                walletName = "Rainbow"
              }
              // Check for multiple providers
              else if ((window as any).ethereum?.providers) {
                const rainbowProvider = (window as any).ethereum.providers.find((p: any) => p.isRainbow)
                if (rainbowProvider) {
                  provider = rainbowProvider
                  accounts = await provider.request({ method: "eth_requestAccounts" })
                  walletName = "Rainbow"
                } else {
                  // Fallback to generic ethereum provider if Rainbow not specifically detected
                  provider = (window as any).ethereum
                  accounts = await provider.request({ method: "eth_requestAccounts" })
                  walletName = "Rainbow"
                }
              } else if ((window as any).ethereum) {
                provider = (window as any).ethereum
                accounts = await provider.request({ method: "eth_requestAccounts" })
                walletName = "Rainbow"
              } else {
                throw new Error("Rainbow Wallet not found. Please install Rainbow extension.")
              }
            }
            break

          case "safe":
            // Safe wallet connection requires Safe Apps SDK
            if (typeof window !== "undefined" && (window as any).SafeAppsSDK) {
              // This would require Safe Apps SDK integration
              throw new Error("Safe Wallet connection requires Safe Apps environment. Please use this app within Safe.")
            } else {
              // Fallback for Safe wallet browser extension if available
              if ((window as any).ethereum) {
                provider = (window as any).ethereum
                accounts = await provider.request({ method: "eth_requestAccounts" })
                walletName = "Safe"
              } else {
                throw new Error("Safe Wallet not available. Please use within Safe Apps or install Safe extension.")
              }
            }
            break

          default:
            throw new Error("Unsupported wallet")
        }

        if (provider && accounts.length > 0) {
          // Get balance for Ethereum-based wallets
          let balance = "0.0000"
          try {
            if ((window as any).ethers) {
              const ethersProvider = new (window as any).ethers.providers.Web3Provider(provider)
              balance = await getBalance(accounts[0], ethersProvider)
            }
          } catch (error) {
            console.warn("Could not fetch balance:", error)
          }

          setWalletState({
            isConnected: true,
            address: accounts[0],
            walletType: walletName,
            balance,
          })

          // Store connection info in localStorage
          localStorage.setItem(
            "connectedWallet",
            JSON.stringify({
              walletType: walletName,
              address: accounts[0],
              walletId,
            }),
          )
        }
      } catch (error: any) {
        console.error("Wallet connection error:", error)

        // Provide user-friendly error messages
        let errorMessage = error.message
        if (error.code === 4001) {
          errorMessage = "Connection rejected by user"
        } else if (error.code === -32002) {
          errorMessage = "Connection request already pending. Please check your wallet."
        }

        alert(`Failed to connect ${walletId}: ${errorMessage}`)
      } finally {
        setIsConnecting(false)
      }
    },
    [getBalance],
  )

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      walletType: null,
      balance: null,
    })
    localStorage.removeItem("connectedWallet")
  }, [])

  const switchNetwork = useCallback(
    async (chainId: string) => {
      if (!walletState.isConnected || walletState.walletType === "Phantom") return false

      try {
        if ((window as any).ethereum) {
          await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId }],
          })
          return true
        }
      } catch (error: any) {
        if (error.code === 4902) {
          // Chain not added to wallet
          console.error("Chain not added to wallet")
        }
        console.error("Failed to switch network:", error)
        return false
      }
      return false
    },
    [walletState],
  )

  // Check for existing connections on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        const stored = localStorage.getItem("connectedWallet")
        if (stored) {
          const { walletType, address, walletId } = JSON.parse(stored)

          // Verify the connection is still valid
          if (walletId === "phantom" && (window as any).solana?.isConnected) {
            setWalletState({
              isConnected: true,
              address,
              walletType,
              balance: null,
            })
          } else if ((window as any).ethereum && walletId !== "phantom") {
            const accounts = await (window as any).ethereum.request({ method: "eth_accounts" })
            if (accounts.length > 0 && accounts[0].toLowerCase() === address.toLowerCase()) {
              let balance = "0.0000"
              try {
                if ((window as any).ethers) {
                  const provider = new (window as any).ethers.providers.Web3Provider((window as any).ethereum)
                  balance = await getBalance(accounts[0], provider)
                }
              } catch (error) {
                console.warn("Could not fetch balance:", error)
              }

              setWalletState({
                isConnected: true,
                address: accounts[0],
                walletType,
                balance,
              })
            } else {
              // Connection no longer valid
              localStorage.removeItem("connectedWallet")
            }
          }
        }
      } catch (error) {
        console.error("Error checking existing connection:", error)
        localStorage.removeItem("connectedWallet")
      }
    }

    // Add a small delay to ensure window objects are loaded
    const timer = setTimeout(checkExistingConnection, 100)
    return () => clearTimeout(timer)
  }, [getBalance])

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else if (walletState.isConnected && accounts[0] !== walletState.address) {
          // Account changed, update state
          setWalletState((prev) => ({
            ...prev,
            address: accounts[0],
          }))

          // Update localStorage
          const stored = localStorage.getItem("connectedWallet")
          if (stored) {
            const data = JSON.parse(stored)
            localStorage.setItem(
              "connectedWallet",
              JSON.stringify({
                ...data,
                address: accounts[0],
              }),
            )
          }
        }
      }

      const handleChainChanged = () => {
        // Reload the page when chain changes to avoid issues
        window.location.reload()
      }
      ;(window as any).ethereum.on("accountsChanged", handleAccountsChanged)
      ;(window as any).ethereum.on("chainChanged", handleChainChanged)

      return () => {
        if ((window as any).ethereum.removeListener) {
          ;(window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged)
          ;(window as any).ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [walletState.isConnected, walletState.address, disconnectWallet])

  return {
    walletState,
    isConnecting,
    connectWallet,
    disconnectWallet,
    formatAddress,
    switchNetwork,
  }
}
