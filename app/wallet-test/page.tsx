"use client"

import { WalletConnector } from "@/components/wallet-connector"
import { usePrivyWallet } from "@/hooks/usePrivyWallet"
import { useWallet } from "@/hooks/useWallet"
import { isMobile } from "@/lib/wallet-config"

export default function WalletTestPage() {
  const isMobileDevice = isMobile()
  const privyWallet = usePrivyWallet()
  const regularWallet = useWallet()
  
  const wallet = isMobileDevice ? privyWallet : regularWallet

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Wallet Connection Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Device Information</h2>
          <div className="space-y-2">
            <p><strong>Device Type:</strong> {isMobileDevice ? 'Mobile' : 'Desktop'}</p>
            <p><strong>Wallet System:</strong> {isMobileDevice ? 'Privy' : 'Regular'}</p>
            <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Status</h2>
          <div className="space-y-2">
            <p><strong>Connected:</strong> {wallet.walletState.isConnected ? 'Yes' : 'No'}</p>
            <p><strong>Address:</strong> {wallet.walletState.address || 'Not connected'}</p>
            <p><strong>Chain ID:</strong> {wallet.walletState.chainId || 'Not connected'}</p>
            <p><strong>Wallet Type:</strong> {wallet.walletState.walletType}</p>
            <p><strong>Connecting:</strong> {wallet.isConnecting ? 'Yes' : 'No'}</p>
            {wallet.error && (
              <p><strong>Error:</strong> <span className="text-red-600">{wallet.error}</span></p>
            )}
          </div>
        </div>

        {isMobileDevice && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Privy Information</h2>
            <div className="space-y-2">
              <p><strong>Ready:</strong> {privyWallet.ready ? 'Yes' : 'No'}</p>
              <p><strong>Authenticated:</strong> {privyWallet.authenticated ? 'Yes' : 'No'}</p>
              <p><strong>User ID:</strong> {privyWallet.user?.id || 'Not authenticated'}</p>
              <p><strong>Wallets Count:</strong> {privyWallet.wallets.length}</p>
              {privyWallet.primaryWallet && (
                <div>
                  <p><strong>Primary Wallet:</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>• Type: {privyWallet.primaryWallet.walletClientType}</li>
                    <li>• Address: {privyWallet.primaryWallet.address}</li>
                    <li>• Chain: {privyWallet.primaryWallet.chainId}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Connector</h2>
          <WalletConnector 
            showBalance={true}
            showChainId={true}
            onInsufficientVMF={(balance) => {
              alert(`Insufficient VMF balance: ${balance}`)
            }}
          />
        </div>
      </div>
    </div>
  )
}