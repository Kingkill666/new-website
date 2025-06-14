"use client"

import { createConfig, http } from "wagmi"
import { mainnet, sepolia, base, baseSepolia } from "wagmi/chains"
import { coinbaseWallet, metaMask, rainbow, safe } from "wagmi/connectors"

// Wagmi configuration for Ethereum wallets
export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, base, baseSepolia],
  connectors: [
    metaMask({
      dappMetadata: {
        name: "VMF - Veterans & Military Families",
        url: "https://vmfcoin.com",
        iconUrl: "/images/vmf-coin-logo.png",
      },
    }),
    coinbaseWallet({
      appName: "VMF - Veterans & Military Families",
      appLogoUrl: "/images/vmf-coin-logo.png",
      darkMode: false,
      headlessMode: true,
    }),
    rainbow({
      appName: "VMF - Veterans & Military Families",
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "default-project-id",
    }),
    safe({
      allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
      debug: false,
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})

// Solana wallet configuration
export const solanaWallets = ["phantom", "solflare", "torus", "ledger", "sollet"]

// Network configurations
export const SUPPORTED_NETWORKS = {
  ethereum: {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  sepolia: {
    chainId: "0xaa36a7",
    chainName: "Sepolia Testnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.infura.io/v3/"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  base: {
    chainId: "0x2105",
    chainName: "Base",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
  },
  baseSepolia: {
    chainId: "0x14a34",
    chainName: "Base Sepolia",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
  },
}

// Wallet detection utilities
export const detectWallets = () => {
  if (typeof window === "undefined") return {}

  const ethereum = (window as any).ethereum
  const solana = (window as any).solana

  return {
    metamask: ethereum?.isMetaMask,
    coinbase: ethereum?.isCoinbaseWallet || ethereum?.selectedProvider?.isCoinbaseWallet,
    rainbow: ethereum?.isRainbow,
    phantom: solana?.isPhantom,
    safe: ethereum?.isSafe || (window as any).SafeAppsSDK,
    // Check for multiple providers
    multipleProviders: ethereum?.providers?.length > 1,
    providers: ethereum?.providers || [],
  }
}

// Get specific provider from multiple providers
export const getSpecificProvider = (walletType: string) => {
  if (typeof window === "undefined") return null

  const ethereum = (window as any).ethereum

  if (!ethereum) return null

  // If there are multiple providers, find the specific one
  if (ethereum.providers && ethereum.providers.length > 1) {
    switch (walletType) {
      case "metamask":
        return ethereum.providers.find((p: any) => p.isMetaMask && !p.isCoinbaseWallet)
      case "coinbase":
        return ethereum.providers.find((p: any) => p.isCoinbaseWallet)
      case "rainbow":
        return ethereum.providers.find((p: any) => p.isRainbow)
      case "safe":
        return ethereum.providers.find((p: any) => p.isSafe)
      default:
        return ethereum
    }
  }

  // Single provider case
  return ethereum
}
