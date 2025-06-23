"use client"

import { ethers } from "ethers"
import { useState, useEffect, useCallback } from "react"
import { detectWallets, getSpecificProvider, SUPPORTED_NETWORKS, connectCoinbaseSmartWallet } from "@/lib/wallet-config"
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";

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
  usdcBalance: string | null
  chainId: number | null
  isConnecting: boolean
  error: string | null
  provider: any | null
}

export const WALLET_OPTIONS: WalletInfo[] = [
  { name: "MetaMask", logo: "🦊", id: "metamask" },
  { name: "Coinbase Extension", logo: "/images/coinbase-logo.png", id: "coinbase" },
  { name: "Coinbase Smart Wallet", logo: "/images/coinbase-logo.png", id: "coinbaseSmart" },
  { name: "Rainbow", logo: "🌈", id: "rainbow" },
]

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    walletType: null,
    balance: null,
    usdcBalance: null,
    chainId: null,
    isConnecting: false,
    error: null,
    provider: null,
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
        case "coinbaseSmart":
          // Coinbase Smart Wallet is always available, no installation check needed
          break
      }

      let provider: any
      let address: string

      // Handle Coinbase Smart Wallet separately
      if (walletId === "coinbaseSmart") {
        const smartWalletResult = await connectCoinbaseSmartWallet()
        if (!smartWalletResult) {
          throw new Error("Failed to connect to Coinbase Smart Wallet")
        }
        provider = smartWalletResult.provider
        address = smartWalletResult.address
      } else {
        provider = getSpecificProvider(walletId)
        if (!provider) {
          throw new Error(`${walletId} provider not found`)
        }

        // Request account access
        const accounts = await provider.request({ method: "eth_requestAccounts" })

        if (accounts.length === 0) {
          throw new Error("No accounts found")
        }

        address = accounts[0]
      }

      // Get chain ID
      const chainId = await provider.request({ method: "eth_chainId" })

      // Get balances
      let balance = "0.0000"
      console.log("Fetching balance for address:", address)
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
      
      // Get USDC Balance
      const usdcContractAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
      console.log("(wallet) Fetching USDC balance for address:", address, usdcContractAddress)
      const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
      ];
      const ethProvider = new ethers.BrowserProvider(provider);
      const network = await ethProvider.getNetwork();

      // Base Mainnet chainId is 8453 (decimal) or 0x2105 (hex)
      const BASE_MAINNET_CHAIN_ID = 8453;
      if (network.chainId !== BigInt(BASE_MAINNET_CHAIN_ID)) {
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x2105" }],
          });
          // Refresh provider/network after switching
          const updatedNetwork = await ethProvider.getNetwork();
          if (updatedNetwork.chainId !== BigInt(BASE_MAINNET_CHAIN_ID)) {
            throw new Error(`Failed to switch to Base Mainnet. ${updatedNetwork.chainId} ${BASE_MAINNET_CHAIN_ID}`);
          }
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Chain not added, try to add Base Mainnet
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0x2105",
                chainName: "Base Mainnet",
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }
  
      const usdcContract = new ethers.Contract(usdcContractAddress, erc20Abi, ethProvider);

      const rawUsdcBalance = await usdcContract.balanceOf(address);
      console.log(`The (raw) USDC balance is: ${rawUsdcBalance}`);

      // Format the balance using the 6 decimals for USDC
      const usdcFormattedBalance = ethers.formatUnits(rawUsdcBalance, 6);

      console.log(`The USDC balance is: ${usdcFormattedBalance}`);
      console.log("ADDRSS", address)

      setWalletState({
        isConnected: true,
        address,
        walletType: walletId === "coinbaseSmart" ? "Coinbase Smart Wallet" : walletId.charAt(0).toUpperCase() + walletId.slice(1),
        balance,
        usdcBalance: usdcFormattedBalance,
        chainId: Number.parseInt(chainId, 16),
        isConnecting: false,
        error: null,
        provider,
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

  // Utility to detect mobile
  const isMobile = () => {
    if (typeof navigator === "undefined") return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  // Main connect function
  const connectWallet = useCallback(
    async (walletId: string) => {
      if (walletId === "coinbaseSmart" && isMobile()) {
        // WalletConnect v1 for Coinbase Wallet deep link
        const connector = new WalletConnect({
          bridge: "https://bridge.walletconnect.org",
        });
        if (!connector.connected) {
          await connector.createSession();
        }
        const uri = connector.uri;
        // Open Coinbase Wallet app with WalletConnect URI
        window.location.href = `https://go.cb-w.com/walletlink?uri=${encodeURIComponent(uri)}`;
        return;
      }
      // Only allow Coinbase Smart Wallet on mobile
      if (isMobile() && walletId !== "coinbaseSmart") {
        alert("Only Coinbase Smart Wallet is supported on mobile.");
        return;
      }
      await connectEthereumWallet(walletId);
    },
    [connectEthereumWallet],
  );

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      // Reset state
      setWalletState({
        isConnected: false,
        address: null,
        walletType: null,
        balance: null,
        usdcBalance: null,
        chainId: null,
        isConnecting: false,
        error: null,
        provider: null,
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
        console.log("Switching network to:", networkKey, network.chainId)
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
        if (error.code === 4902 || error.code === -32603) {
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
              : wallet.id === "coinbaseSmart"
                ? detected.coinbaseSmart || true // Coinbase Smart Wallet might not be detectable
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
