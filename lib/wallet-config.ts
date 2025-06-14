"use client"

// Simple wallet detection without external dependencies
export const detectWallets = () => {
  if (typeof window === "undefined") return {}

  const ethereum = (window as any).ethereum
  const solana = (window as any).solana

  return {
    metamask: ethereum?.isMetaMask,
    coinbase: ethereum?.isCoinbaseWallet || ethereum?.selectedProvider?.isCoinbaseWallet,
    rainbow: ethereum?.isRainbow,
    phantom: solana?.isPhantom,
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
      default:
        return ethereum
    }
  }

  // Single provider case
  return ethereum
}

// Network configurations
export const SUPPORTED_NETWORKS = {
  ethereum: {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  sepolia: {
    chainId: "0xaa36a7",
    chainName: "Sepolia Testnet",
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia.infura.io/v3/"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  base: {
    chainId: "0x2105",
    chainName: "Base",
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
  },
  baseSepolia: {
    chainId: "0x14a34",
    chainName: "Base Sepolia",
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
  },
}
