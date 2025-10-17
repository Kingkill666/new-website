"use client"

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'
import { base } from '@reown/appkit/networks'
import { useCallback, useEffect, useState } from "react"
import { formatAddress } from "@/lib/wallet-config"

export interface PrivyWalletState {
  isConnected: boolean
  address: string | null
  chainId: number | null
  walletType: string
  balance?: string
  isConnecting: boolean
  error: string | null
}

export const usePrivyWallet = () => {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const { address, chainId, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get the primary wallet (first connected wallet)
  const primaryWallet = wallets.find(wallet => wallet.walletClientType === 'privy') || wallets[0]

  // Determine wallet type
  const getWalletType = useCallback(() => {
    if (!primaryWallet) return 'Unknown'
    
    switch (primaryWallet.walletClientType) {
      case 'privy':
        return 'Privy Embedded'
      case 'metamask':
        return 'MetaMask'
      case 'coinbase_wallet':
        return 'Coinbase Wallet'
      case 'wallet_connect':
        return 'WalletConnect'
      case 'rainbow':
        return 'Rainbow'
      case 'trust':
        return 'Trust Wallet'
      default:
        return primaryWallet.walletClientType || 'Unknown'
    }
  }, [primaryWallet])

  // Connect wallet using Privy
  const connectWallet = useCallback(async (walletId?: string) => {
    setIsConnecting(true)
    setError(null)
    
    try {
      console.log('🔌 Connecting with Privy...')
      
      if (!ready) {
        throw new Error('Privy is not ready yet')
      }

      if (authenticated) {
        console.log('✅ Already authenticated with Privy')
        return
      }

      // Login with Privy - this will show the modal with all available options
      await login()
      console.log('✅ Privy login successful')
      
    } catch (error) {
      console.error('❌ Privy connection failed:', error)
      setError(error instanceof Error ? error.message : 'Connection failed')
      throw error
    } finally {
      setIsConnecting(false)
    }
  }, [ready, authenticated, login])

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      console.log('🔌 Disconnecting from Privy...')
      await logout()
      console.log('✅ Disconnected from Privy')
    } catch (error) {
      console.error('❌ Disconnect failed:', error)
      setError(error instanceof Error ? error.message : 'Disconnect failed')
    }
  }, [logout])

  // Switch to Base network
  const switchToBase = useCallback(async () => {
    try {
      if (switchChain) {
        await switchChain({ chainId: base.id })
        console.log('✅ Switched to Base network')
      }
    } catch (error) {
      console.error('❌ Network switch failed:', error)
      setError(error instanceof Error ? error.message : 'Network switch failed')
    }
  }, [switchChain])

  // Get available wallets (for compatibility with existing system)
  const getAvailableWallets = useCallback(() => {
    return [
      {
        id: 'privy',
        name: 'Connect Wallet',
        logo: '🔗',
        installed: true,
        description: 'Connect with any wallet or create a new one'
      }
    ]
  }, [])

  // Check if on correct network
  const isOnCorrectNetwork = chainId === base.id
  const needsNetworkSwitch = isConnected && !isOnCorrectNetwork

  // Format address
  const formatWalletAddress = useCallback((addr: string) => {
    return formatAddress(addr)
  }, [])

  // Get wallet state
  const walletState: PrivyWalletState = {
    isConnected: isConnected && authenticated,
    address: address || null,
    chainId: chainId || null,
    walletType: getWalletType(),
    isConnecting,
    error
  }

  return {
    // State
    walletState,
    isConnecting,
    error,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchToBase,
    
    // Utilities
    getAvailableWallets,
    formatAddress: formatWalletAddress,
    isOnCorrectNetwork,
    needsNetworkSwitch,
    
    // Privy specific
    ready,
    authenticated,
    user,
    wallets,
    primaryWallet,
    
    // Network actions
    switchNetwork: switchToBase,
    addNetwork: switchToBase, // Privy handles network addition automatically
  }
}
