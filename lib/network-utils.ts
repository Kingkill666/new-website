// Network utilities for ensuring Base network connection
import { baseSepolia } from '@reown/appkit/networks'

export const BASE_CHAIN_ID = 84532
export const BASE_NETWORK = baseSepolia

// Base network configuration for manual addition
export const BASE_NETWORK_CONFIG = {
  chainId: '0x14a34', // 84532 in hex
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
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
    return 'Base Sepolia'
  }
  return `Chain ${chainId || 'Unknown'}`
}

/**
 * Switch to Base network - ALWAYS switches to Base
 */
export async function switchToBaseNetwork(): Promise<boolean> {
  if (!window.ethereum) {
    throw new Error('No wallet detected! Please install a Web3 wallet like MetaMask or Coinbase Wallet.')
  }

  try {
    console.log('🔄 VMF: Automatically switching to Base Sepolia network...')
    
    // Try to switch to Base network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BASE_NETWORK_CONFIG.chainId }],
    })
    
    console.log('✅ VMF: Successfully switched to Base Sepolia network')
    return true
    
  } catch (switchError: any) {
    console.log('⚠️ VMF: Switch failed, automatically adding Base Sepolia network...')
    
    if (switchError.code === 4902) {
      // Chain not added, try to add Base network
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [BASE_NETWORK_CONFIG],
        })
        
        console.log('✅ VMF: Successfully added Base Sepolia network')
        return true
        
      } catch (addError) {
        console.error('❌ VMF: Failed to add Base Sepolia network:', addError)
        throw new Error(
          'VMF requires Base Sepolia network. Failed to add Base Sepolia network to your wallet:\n\n' +
          'Network Name: Base Sepolia\n' +
          'RPC URL: https://sepolia.base.org\n' +
          'Chain ID: 84532\n' +
          'Currency Symbol: ETH\n' +
          'Block Explorer: https://sepolia.basescan.org\n\n' +
          'Please manually add Base Sepolia network to use VMF.'
        )
      }
    } else {
      console.error('❌ VMF: Failed to switch to Base Sepolia network:', switchError)
      throw new Error('VMF requires Base Sepolia network. Please manually switch to Base Sepolia in your wallet to use VMF.')
    }
  }
}

/**
 * Force switch to Base network on wallet connection
 */
export async function forceBaseNetwork(): Promise<void> {
  if (!window.ethereum) return
  
  try {
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
    const currentChainIdNumber = parseInt(currentChainId, 16)
    
    if (!isBaseNetwork(currentChainIdNumber)) {
      console.log('🔄 VMF: Wallet connected to wrong network, forcing switch to Base Sepolia...')
      await switchToBaseNetwork()
    }
  } catch (error) {
    console.warn('⚠️ VMF: Could not check/switch network:', error)
  }
}
