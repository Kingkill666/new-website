// Coinbase Smart Wallet integration - Modern approach using wagmi connectors
// This integrates with the AppKit/Reown wallet system for seamless mobile experience

import { coinbaseWallet } from '@wagmi/connectors'

// Coinbase Smart Wallet connector configuration
export const coinbaseSmartWalletConnector = coinbaseWallet({
  appName: 'VMF - Veterans & Military Families',
  appLogoUrl: 'https://vmfcoin.com/favicon.png',
  preference: 'smartWalletOnly', // This enables the embedded wallet experience without app requirements
})

/**
 * Check if Coinbase Smart Wallet is available on this device/browser
 * Smart Wallet works on all modern browsers without requiring wallet apps
 */
export function isCoinbaseSmartWalletAvailable(): boolean {
  // Coinbase Smart Wallet is available on all modern browsers
  // It provides an embedded experience that doesn't require external apps
  return typeof window !== 'undefined' &&
         !!(window.navigator?.userAgent) &&
         // Check for basic browser capabilities
         !!(window.crypto?.subtle)
}

/**
 * Get Coinbase Smart Wallet connector for manual connection
 * This is used when you want to connect directly without the AppKit modal
 */
export function getCoinbaseSmartWalletConnector() {
  return coinbaseSmartWalletConnector
}

/**
 * Coinbase Smart Wallet benefits:
 * - Works on mobile without requiring wallet app installation
 * - Provides passkey-based authentication
 * - Seamless browser-native experience
 * - Automatic gasless transactions where supported
 * - Cross-device wallet synchronization
 */