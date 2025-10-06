// Network utilities for ensuring Base network connection
import { base } from '@reown/appkit/networks'

export const BASE_CHAIN_ID = 8453
export const BASE_NETWORK = base

// Base network configuration for manual addition
export const BASE_NETWORK_CONFIG = {
  chainId: '0x2105', // 8453 in hex
  chainName: 'Base',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org'],
}

/**
 * Check if the current chain ID is Base network
 */
export function isBaseNetwork(chainId?: number): boolean {
  return chainId === BASE_CHAIN_ID
}

/**
 * Get user-friendly network name
 */
export function getNetworkName(chainId?: number): string {
  if (isBaseNetwork(chainId)) {
    return 'Base'
  }
  return `Chain ${chainId || 'Unknown'}`
}

/**
 * Get instructions for manually switching to Base network
 */
export function getBaseNetworkInstructions(): string {
  return (
    'Please manually switch to Base network in your wallet:\n\n' +
    'Network Name: Base\n' +
    'RPC URL: https://mainnet.base.org\n' +
    'Chain ID: 8453\n' +
    'Currency Symbol: ETH\n' +
    'Block Explorer: https://basescan.org\n\n' +
    'VMF only works on Base network.'
  )
}
