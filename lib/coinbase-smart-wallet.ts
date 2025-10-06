// Coinbase Smart Wallet integration - Client-side only
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import { base } from 'viem/chains'

// Initialize the Coinbase Wallet SDK only on client-side
let coinbaseWallet: CoinbaseWalletSDK | null = null
let coinbaseSmartWalletProvider: any = null

// Initialize SDK only when needed and on client-side
function initializeCoinbaseWallet() {
  if (typeof window === 'undefined') return null
  
  if (!coinbaseWallet) {
    coinbaseWallet = new CoinbaseWalletSDK({
      appName: 'VMF - Veterans & Military Families',
      appLogoUrl: 'https://vmfcoin.com/favicon.png',
      darkMode: false
    })
    
    coinbaseSmartWalletProvider = coinbaseWallet.makeWeb3Provider({
      chain: base, // Use Base network for VMF
      options: 'smartWalletOnly' // This is key for the new embedded experience
    })
  }
  
  return coinbaseSmartWalletProvider
}

/**
 * Connect to Coinbase Smart Wallet
 * This provides a seamless, browser-native experience without app switching
 */
export async function connectCoinbaseSmartWallet(): Promise<string[]> {
  try {
    console.log('🔄 VMF: Connecting to Coinbase Smart Wallet...')
    
    const provider = initializeCoinbaseWallet()
    if (!provider) {
      throw new Error('Coinbase Smart Wallet not available on this platform')
    }
    
    // This triggers the pop-up for passkey sign-in
    const accounts = await provider.request({ 
      method: 'eth_requestAccounts' 
    }) as string[]
    
    console.log('✅ VMF: Connected with Coinbase Smart Wallet:', accounts[0])
    return accounts
    
  } catch (error) {
    console.error('❌ VMF: Could not connect to Coinbase Smart Wallet:', error)
    throw new Error('Failed to connect to Coinbase Smart Wallet. Please try again.')
  }
}

/**
 * Check if Coinbase Smart Wallet is available
 */
export function isCoinbaseSmartWalletAvailable(): boolean {
  return typeof window !== 'undefined' && !!initializeCoinbaseWallet()
}

/**
 * Get the Coinbase Smart Wallet provider for use with ethers.js
 */
export function getCoinbaseSmartWalletProvider() {
  return initializeCoinbaseWallet()
}