// Coinbase Smart Wallet integration
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import { base } from 'viem/chains'

// Initialize the Coinbase Wallet SDK
const coinbaseWallet = new CoinbaseWalletSDK({
  appName: 'VMF - Veterans & Military Families',
  appLogoUrl: 'https://vmfcoin.com/favicon.png',
  darkMode: false
})

// Create the provider that connects to the Smart Wallet
export const coinbaseSmartWalletProvider = coinbaseWallet.makeWeb3Provider({
  chain: base, // Use Base network for VMF
  options: 'smartWalletOnly' // This is key for the new embedded experience
})

/**
 * Connect to Coinbase Smart Wallet
 * This provides a seamless, browser-native experience without app switching
 */
export async function connectCoinbaseSmartWallet(): Promise<string[]> {
  try {
    console.log('🔄 VMF: Connecting to Coinbase Smart Wallet...')
    
    // This triggers the pop-up for passkey sign-in
    const accounts = await coinbaseSmartWalletProvider.request({ 
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
  return typeof window !== 'undefined' && !!coinbaseSmartWallet
}

/**
 * Get the Coinbase Smart Wallet provider for use with ethers.js
 */
export function getCoinbaseSmartWalletProvider() {
  return coinbaseSmartWalletProvider
}
