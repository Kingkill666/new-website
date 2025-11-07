// Wallet connection utilities and configurations
export interface WalletInfo {
  name: string
  icon: string
  color: string
  id: string
  description?: string
  mobile?: boolean
  deepLink?: string
  downloadUrl?: string
  universalLink?: string
  iconImage?: string // Add support for image icons
}

export const WALLETS: WalletInfo[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    color: "bg-orange-500 hover:bg-orange-600",
    description: "The most popular Web3 wallet",
    mobile: true,
    deepLink: "metamask://",
    universalLink: "https://metamask.app.link/",
    downloadUrl: "https://metamask.io/download/",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🪙",
    color: "bg-blue-600 hover:bg-blue-700",
    description: "Secure wallet from Coinbase",
    mobile: true,
    deepLink: "coinbasewallet://",
    universalLink: "https://wallet.coinbase.com/",
    downloadUrl: "https://wallet.coinbase.com/",
  },
  {
    id: "coinbaseSmart",
    name: "Coinbase Smart Wallet",
    icon: "🪙",
    color: "bg-blue-600 hover:bg-blue-700",
    description: "Smart wallet from Coinbase",
    mobile: true,
    deepLink: "coinbasewallet://",
    universalLink: "https://wallet.coinbase.com/",
    downloadUrl: "https://wallet.coinbase.com/",
  },
  {
    id: "trust",
    name: "Trust Wallet",
    icon: "🛡️",
    color: "bg-blue-600 hover:bg-blue-700",
    description: "Multi-chain wallet by Binance",
    mobile: true,
    deepLink: "trust://",
    universalLink: "https://link.trustwallet.com/",
    downloadUrl: "https://trustwallet.com/",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    icon: "🌈",
    color: "bg-[#7C3AED] hover:bg-[#6D28D9]",
    description: "Beautiful, simple, and secure",
    mobile: true,
    deepLink: "rainbow://",
    universalLink: "https://rnbwapp.com/",
    downloadUrl: "https://rainbow.me/",
  },
  {
    id: "phantom",
    name: "Phantom",
    icon: "👻",
    color: "bg-[#A855F7] hover:bg-[#9333EA]",
    description: "The friendly Solana wallet",
    mobile: true,
    deepLink: "phantom://",
    universalLink: "https://phantom.app/ul/",
    downloadUrl: "https://phantom.app/",
  },
]

// Base network configuration (defaulting to Base mainnet)
export const BASE_NETWORK = {
  chainId: 8453,
  chainName: "Base",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: [
    "https://mainnet.base.org",
    "https://base-mainnet.g.alchemy.com/v2/demo",
    "https://base.gateway.tenderly.co",
  ],
  blockExplorerUrls: ["https://basescan.org"],
}

// Base mainnet configuration
export const BASE_SEPOLIA_NETWORK = {
  chainId: 8453,
  chainName: "Base",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: [
    "https://mainnet.base.org",
    "https://base-mainnet.g.alchemy.com/v2/demo",
    "https://base.gateway.tenderly.co",
  ],
  blockExplorerUrls: ["https://basescan.org"],
}

export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export const isIOS = (): boolean => {
  if (typeof window === "undefined") return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export const isAndroid = (): boolean => {
  if (typeof window === "undefined") return false
  return /Android/.test(navigator.userAgent)
}

export const isFarcaster = (): boolean => {
  if (typeof window === "undefined") return false
  return window.location.hostname.includes('farcaster')
}

export const isInWalletBrowser = (): string | null => {
  if (typeof window === "undefined") return null

  const userAgent = navigator.userAgent.toLowerCase()
  
  if (userAgent.includes('metamask')) return 'metamask'
  if (userAgent.includes('coinbase')) return 'coinbase'
  if (userAgent.includes('trust')) return 'trust'
  if (userAgent.includes('rainbow')) return 'rainbow'
  if (userAgent.includes('phantom')) return 'phantom'
  
  return null
}

export interface WalletConnection {
  address: string
  chainId: number
  walletName: string
  balance?: string
}

export const formatAddress = (address: string): string => {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const getCurrentPageUrl = (): string => {
  if (typeof window === "undefined") return ""
  return window.location.href
}

export const connectMobileWallet = async (walletId: string): Promise<any> => {
  const wallet = WALLETS.find(w => w.id === walletId)
  if (!wallet) throw new Error(`Unknown wallet: ${walletId}`)

  console.log(`📱 Attempting mobile connection to ${wallet.name}`)

  // Check if we're already in the wallet's browser
  const currentWallet = isInWalletBrowser()
  if (currentWallet === walletId) {
    console.log(`📱 Already in ${wallet.name} browser, requesting connection`)
    return await requestWalletConnection(walletId)
  }

  // For mobile, try to use the wallet's built-in browser if available
  if (window.ethereum) {
    console.log("📱 Using available mobile provider")
    return await requestWalletConnection(walletId)
  }

  // If no ethereum provider available, provide instructions
  const currentUrl = getCurrentPageUrl()
  const instructions = `To connect your ${wallet.name}:

1. Copy this URL: ${currentUrl}
2. Open your ${wallet.name} app
3. Go to the browser/dApp section
4. Paste the URL and visit this page
5. Try connecting again`

  throw new Error(instructions)
}

export const getWalletProvider = (walletId: string): any => {
  if (typeof window === "undefined") return null;

  // If multiple providers are present, search for the correct one
  const providers = (window.ethereum?.providers || [window.ethereum]).filter(Boolean);

  switch (walletId) {
      case "metamask":
      return providers.find((p: any) => p.isMetaMask);
      case "coinbase":
      case "coinbaseSmart":
      // Coinbase Wallet extension
      if (window.coinbaseWalletExtension) return window.coinbaseWalletExtension;
      return providers.find((p: any) => p.isCoinbaseWallet);
    case "phantom":
      if (window.phantom?.ethereum) return window.phantom.ethereum;
      return providers.find((p: any) => p.isPhantom);
      case "rainbow":
      return providers.find((p: any) => p.isRainbow);
    case "trust":
      return providers.find((p: any) => p.isTrust);
      default:
      return window.ethereum;
  }
};

export const getAllProviders = (): any[] => {
  if (typeof window === "undefined") return []

  const providers: any[] = []

  // Check for multiple providers
  if (window.ethereum?.providers) {
    providers.push(...window.ethereum.providers)
  } else if (window.ethereum) {
    providers.push(window.ethereum)
  }

  // Check for individual wallet extensions
  if (window.coinbaseWalletExtension) {
    providers.push(window.coinbaseWalletExtension)
  }

  if (window.phantom?.ethereum) {
    providers.push(window.phantom.ethereum)
  }

  return providers
}

// Add a function to completely clear wallet state
export const forceClearWalletState = async (provider: any): Promise<void> => {
  if (!provider) return

  console.log("🧹 Force clearing all wallet state...")
  
  try {
    // Try to disconnect using wallet_disconnect if available
    try {
      await provider.request({ method: 'wallet_disconnect' })
      console.log("✅ Wallet disconnect method called")
    } catch (error) {
      console.log("⚠️ Wallet disconnect method not available")
    }

    // Clear any cached accounts
    try {
      await provider.request({ method: 'eth_accounts' })
    } catch (error) {
      console.log("✅ Cleared cached accounts")
    }

    // Try to revoke permissions if available
    try {
      await provider.request({ 
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }]
      })
      console.log("✅ Permissions revoked")
    } catch (error) {
      console.log("⚠️ Permission revocation not available")
    }

  } catch (error) {
    console.log("⚠️ Error clearing wallet state:", error)
  }
}

// Add a function to force wallet unlock and prevent auto-connection
export const forceWalletUnlock = async (provider: any): Promise<void> => {
  if (!provider) return

  console.log("🔓 Forcing wallet unlock...")
  
  try {
    // Try to get accounts - this should trigger unlock if wallet is locked
    const accounts = await provider.request({ method: 'eth_accounts' }) as string[]
    
    if (accounts.length === 0) {
      console.log("🔒 Wallet is locked, requesting unlock...")
      // Try to request accounts which should trigger unlock popup
      await provider.request({ method: 'eth_requestAccounts' })
    } else {
      console.log("✅ Wallet is already unlocked")
    }
  } catch (error) {
    console.log("⚠️ Error forcing wallet unlock:", error)
  }
}

export const requestWalletConnection = async (walletId: string): Promise<any> => {
  console.log(`🎯 Requesting connection to ${walletId}`)

  try {
    const provider = getWalletProvider(walletId);

    if (!provider) {
      throw new Error(`No wallet detected. Please install ${getWalletDisplayName(walletId)} or another wallet extension.`);
    }

    // Force clear all wallet state first
    console.log(`🔌 Force clearing wallet state before connection...`);
    await forceClearWalletState(provider);

    // Force wallet unlock to prevent auto-connection
    console.log(`🔓 Forcing wallet unlock...`);
    await forceWalletUnlock(provider);

    let accounts: string[] = [];

    if (walletId === "coinbase" || walletId === "coinbaseSmart") {
      // Use special Coinbase function to force fresh connection
      console.log("🟠 Using enhanced Coinbase connection method...")
      
      // Additional step: Clear localStorage and sessionStorage for Coinbase
      if (typeof window !== "undefined") {
        console.log("🧹 Clearing Coinbase-related storage...")
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('coinbase') || key.includes('Coinbase') || key.includes('COINBASE'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
          console.log(`🗑️ Removed localStorage key: ${key}`)
        })
        
        // Clear sessionStorage too
        const sessionKeysToRemove = []
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && (key.includes('coinbase') || key.includes('Coinbase') || key.includes('COINBASE'))) {
            sessionKeysToRemove.push(key)
          }
        }
        sessionKeysToRemove.forEach(key => {
          sessionStorage.removeItem(key)
          console.log(`🗑️ Removed sessionStorage key: ${key}`)
        })
      }
      
      // Try a more direct approach for Coinbase
      console.log("🟠 Trying direct Coinbase connection...")
      
      // First, try to get accounts directly
      let accounts: string[] = []
      try {
        accounts = await provider.request({ method: 'eth_accounts' }) as string[]
        console.log(`📋 Found ${accounts.length} cached accounts`)
      } catch (error) {
        console.log("⚠️ Could not get cached accounts")
      }
      
      // If we have accounts, try to force a signature request first
      if (accounts.length > 0) {
        const message = `Sign to connect to VMF: ${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        try {
          console.log("🔐 Requesting signature to confirm connection...")
          await provider.request({
            method: 'personal_sign',
            params: [message, accounts[0]]
          });
          console.log("✅ Signature confirmed, connection established")
          
          // Return the connection with the existing accounts
          const connection = {
            address: accounts[0],
            chainId: BASE_NETWORK.chainId,
            walletName: getWalletDisplayName(walletId),
          }
          return connection
        } catch (error: any) {
          console.log('❌ User cancelled signature request. Trying fresh connection...')
          // Continue to fresh connection attempt
        }
      }
      
      // If no accounts or signature failed, try the enhanced connection method
      accounts = await forceCoinbaseFreshConnection(provider);
      
      // Always trigger a personal_sign after connection to ensure popup
      if (accounts.length > 0) {
        const message = `Sign to connect to VMF: ${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        try {
          console.log("🔐 Requesting signature to confirm connection...")
          await provider.request({
            method: 'personal_sign',
            params: [message, accounts[0]]
          });
          console.log("✅ Signature confirmed, connection established")
        } catch (error: any) {
          // User cancelled signature, treat as not connected
          console.log('❌ User cancelled signature request. Disconnecting.');
          throw new Error('Signature request cancelled. Wallet not connected.');
        }
      }
      
      // If all methods failed, try one last fallback approach
      if (accounts.length === 0) {
        console.log("🔄 Trying fallback Coinbase connection method...")
        
        // Try to use a different approach - request permissions first
        try {
          await provider.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
          
          accounts = await provider.request({ method: 'eth_accounts' }) as string[]
          console.log(`✅ Fallback method got ${accounts.length} accounts`)
        } catch (error) {
          console.log("❌ Fallback method also failed:", error)
          throw new Error("Failed to connect to Coinbase Wallet. Please try refreshing the page and trying again.")
        }
      }
    } else {
      // MetaMask and others: use wallet_requestPermissions
      try {
        await provider.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }]
        });
        console.log("✅ Revoked existing permissions");
      } catch (error) {
        console.log("⚠️ Could not revoke permissions, proceeding...");
      }

      const permissions = await provider.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }]
      }) as any[];

      if (!permissions || permissions.length === 0) {
        throw new Error("No permissions granted. Please approve the connection request.");
      }

      accounts = await provider.request({ method: "eth_accounts" }) as string[];
    }
    
    if (accounts.length === 0) {
      throw new Error("No accounts found. Please unlock your wallet.");
    }

    // Get chain ID
    const chainId = await provider.request({ method: 'eth_chainId' }) as string
    const chainIdNumber = parseInt(chainId, 16)

    console.log(`✅ Connected to ${getWalletDisplayName(walletId)}: ${accounts[0]} on chain ${chainIdNumber}`)

    // Ensure we're on the correct network (Base for testing)
    let finalChainId = chainIdNumber
    if (chainIdNumber !== BASE_NETWORK.chainId) {
      console.log(`🔄 Switching to ${BASE_NETWORK.chainName} (current: ${chainIdNumber})`)
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${BASE_NETWORK.chainId.toString(16)}` }],
        })
        console.log(`✅ Switched to ${BASE_NETWORK.chainName}`)
        finalChainId = BASE_NETWORK.chainId
        
        // Wait a moment for the network switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          // Chain not added, add it
          console.log(`➕ Adding ${BASE_NETWORK.chainName} to wallet`)
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${BASE_NETWORK.chainId.toString(16)}`,
              chainName: BASE_NETWORK.chainName,
              nativeCurrency: BASE_NETWORK.nativeCurrency,
              rpcUrls: BASE_NETWORK.rpcUrls,
              blockExplorerUrls: BASE_NETWORK.blockExplorerUrls,
            }],
          })
          console.log(`✅ Added ${BASE_NETWORK.chainName}`)
          finalChainId = BASE_NETWORK.chainId
          
          // Wait a moment for the network addition to complete
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else if (switchError.code === 4001) {
          // User rejected the network switch
          console.log('⚠️ User rejected network switch')
          throw new Error(`Please switch to ${BASE_NETWORK.chainName} in your ${getWalletDisplayName(walletId)} to use VMF`)
        } else {
          console.error('❌ Failed to switch network:', switchError)
          throw new Error(`Please switch to ${BASE_NETWORK.chainName} in your ${getWalletDisplayName(walletId)}`)
        }
      }
      
      // Verify the network switch was successful
      const newChainId = await provider.request({ method: 'eth_chainId' }) as string
      const newChainIdNumber = parseInt(newChainId, 16)
      console.log(`🔍 Network after switch: ${newChainIdNumber}`)
      finalChainId = newChainIdNumber
    } else {
      console.log(`✅ Already on ${BASE_NETWORK.chainName}`)
    }

    const connection = {
      address: accounts[0],
      chainId: finalChainId,
      walletName: getWalletDisplayName(walletId),
    }

    console.log(`✅ Successfully connected to ${walletId}:`, connection)
    return connection

  } catch (error: any) {
    console.error(`❌ Connection to ${walletId} failed:`, error)
    
    // Provide specific error messages
    if (error.code === 4001) {
      throw new Error(`Connection to ${getWalletDisplayName(walletId)} was rejected. Please try again.`)
    } else if (error.code === -32002) {
      throw new Error(`Connection request to ${getWalletDisplayName(walletId)} is pending. Please check your wallet.`)
    } else if (error.code === 4902) {
      throw new Error(`Base network not found in ${getWalletDisplayName(walletId)}. Please add it manually.`)
    } else {
      throw new Error(`Failed to connect to ${getWalletDisplayName(walletId)}: ${error.message || "Unknown error"}`)
    }
  }
}

export const openWalletInstallPage = (walletId: string): void => {
  const wallet = WALLETS.find(w => w.id === walletId)
  if (!wallet || !wallet.downloadUrl) {
    console.error(`No download URL found for ${walletId}`)
    return
  }

  console.log(`📱 Opening download page for ${wallet.name}: ${wallet.downloadUrl}`)
  window.open(wallet.downloadUrl, '_blank')
}

export const isWalletInstalled = (walletId: string): boolean => {
  if (typeof window === "undefined") return false
  
  // Check if we're in the wallet's browser
  const currentWallet = isInWalletBrowser()
  if (currentWallet === walletId) return true
  
  // Use the new getWalletProvider function to check if the wallet is available
  const provider = getWalletProvider(walletId)
  return provider !== null && provider !== undefined
}

export const getWalletDisplayName = (walletId: string): string => {
  const wallet = WALLETS.find(w => w.id === walletId)
  return wallet ? wallet.name : walletId
}

export const handleMobileViewport = (): void => {
  if (typeof window === "undefined") return
  
  // Set viewport height for mobile browsers
  const setVH = () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }
  
  setVH()
  window.addEventListener('resize', setVH)
  window.addEventListener('orientationchange', setVH)
}

export const initMobileOptimizations = (): void => {
  if (typeof window === "undefined") return
  
  // Handle mobile viewport
  handleMobileViewport()
  
  // Add mobile-specific CSS
  const style = document.createElement('style')
  style.textContent = `
    @media (max-width: 768px) {
      body {
        overflow-x: hidden;
        position: fixed;
        width: 100%;
        height: 100vh;
        height: calc(var(--vh, 1vh) * 100);
      }
    }
  `
  document.head.appendChild(style)
}

export const ensureBaseNetwork = async (provider?: any): Promise<void> => {
  const targetChainId = BASE_NETWORK.chainId
  
  try {
    const chainId = await provider.request({ method: 'eth_chainId' })
    const currentChainId = parseInt(chainId, 16)
    
    if (currentChainId !== targetChainId) {
      console.log(`🔄 Switching to Base network (${targetChainId})`)
      
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
    }
  } catch (error: any) {
    if (error.code === 4902) {
      // Chain not added, add it
      console.log(`➕ Adding Base network to wallet`)
      
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [BASE_NETWORK],
      })
    } else {
    throw error
    }
  }
}

export const ensureBaseSepoliaNetwork = async (provider?: any): Promise<void> => {
  const targetChainId = BASE_SEPOLIA_NETWORK.chainId
  
  try {
    const chainId = await provider.request({ method: 'eth_chainId' })
    const currentChainId = parseInt(chainId, 16)
    
    if (currentChainId !== targetChainId) {
      console.log(`🔄 Switching to Base network (${targetChainId})`)
      
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
    }
  } catch (error: any) {
    if (error.code === 4902) {
      // Chain not added, add it
      console.log(`➕ Adding Base network to wallet`)
      
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [BASE_SEPOLIA_NETWORK],
      })
    } else {
      throw error
    }
  }
}

// Add a function specifically for Coinbase Wallet to force fresh connection
export const forceCoinbaseFreshConnection = async (provider: any): Promise<string[]> => {
  console.log("🟠 Forcing fresh Coinbase Wallet connection...")
  
  try {
    // Step 1: Try to disconnect completely first
    console.log("🔌 Step 1: Attempting complete disconnect...")
    try {
      await provider.request({ method: 'wallet_disconnect' })
      console.log("✅ Disconnected from Coinbase")
    } catch (error) {
      console.log("⚠️ Could not disconnect, proceeding...")
    }

    // Step 2: Clear any cached accounts
    console.log("🧹 Step 2: Clearing cached accounts...")
    try {
      await provider.request({ method: 'eth_accounts' })
    } catch (error) {
      console.log("✅ Cleared cached accounts")
    }

    // Step 3: Try to revoke permissions
    console.log("🚫 Step 3: Revoking permissions...")
    try {
      await provider.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }]
      })
      console.log("✅ Permissions revoked")
    } catch (error) {
      console.log("⚠️ Could not revoke permissions, proceeding...")
    }

    // Step 4: Force chain switches to break cached connection
    console.log("🔄 Step 4: Force chain switches to break cache...")
    
    // Try multiple chain switches to force fresh connection
    const chainsToTry = [
      { chainId: '0x1', name: 'Ethereum Mainnet' },
      { chainId: '0x89', name: 'Polygon' },
      { chainId: '0xa', name: 'Optimism' },
      { chainId: '0xa4b1', name: 'Arbitrum' }
    ]

    for (const chain of chainsToTry) {
      try {
        console.log(`🔄 Trying to switch to ${chain.name}...`)
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chain.chainId }]
        })
        console.log(`✅ Switched to ${chain.name}`)
        // Small delay to ensure the switch takes effect
        await new Promise(resolve => setTimeout(resolve, 500))
        break
      } catch (error) {
        console.log(`⚠️ Could not switch to ${chain.name}, trying next...`)
      }
    }

    // Step 5: Now switch back to Base
    console.log(`🔄 Step 5: Switching back to ${BASE_NETWORK.chainName}...`)
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BASE_NETWORK.chainId.toString(16)}` }]
      })
      console.log(`✅ Switched back to ${BASE_NETWORK.chainName}`)
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Chain not added, add it
        console.log(`➕ Adding ${BASE_NETWORK.chainName} to Coinbase`)
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${BASE_NETWORK.chainId.toString(16)}`,
            chainName: BASE_NETWORK.chainName,
            nativeCurrency: BASE_NETWORK.nativeCurrency,
            rpcUrls: BASE_NETWORK.rpcUrls,
            blockExplorerUrls: BASE_NETWORK.blockExplorerUrls,
          }],
        })
        console.log(`✅ Added ${BASE_NETWORK.chainName} to Coinbase`)
      }
    }

    // Step 6: Use a more direct approach - try personal_sign first
    console.log("🔌 Step 6: Using direct personal_sign approach...")
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const message = `Connect to VMF: ${uniqueId}`
    
    // Try to get accounts first
    let accounts: string[] = []
    try {
      accounts = await provider.request({ method: 'eth_accounts' }) as string[]
      console.log(`📋 Found ${accounts.length} cached accounts`)
    } catch (error) {
      console.log("⚠️ Could not get cached accounts")
    }
    
    // If we have accounts, try to force a signature request
    if (accounts.length > 0) {
      try {
        console.log("🔐 Forcing signature request to break cache...")
        await provider.request({
          method: 'personal_sign',
          params: [message, accounts[0]]
        })
        console.log("✅ Signature request successful")
        return accounts
      } catch (error) {
        console.log("⚠️ Signature request failed, trying fresh account request...")
      }
    }

    // Step 7: If all else fails, try a completely fresh account request
    console.log("🔌 Step 7: Requesting completely fresh accounts...")
    try {
      accounts = await provider.request({ 
        method: 'eth_requestAccounts'
      }) as string[]
      
      console.log(`✅ Fresh Coinbase connection result: ${accounts.length} accounts`)
      
      if (accounts.length === 0) {
        throw new Error("No accounts returned. Please unlock your Coinbase Wallet.")
      }
      
      return accounts
    } catch (error) {
      console.error("❌ All Coinbase connection methods failed:", error)
      throw error
    }
    
  } catch (error) {
    console.error("❌ Coinbase connection failed:", error)
    throw error
  }
}
