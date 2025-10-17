"use client"

import { isMobile } from '@/lib/wallet-config'
import { usePrivy, useWallets } from '@privy-io/react-auth'

export default function TestMobilePage() {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const isMobileDevice = isMobile()
  
  // Force mobile detection for testing
  const forceMobile = true

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Mobile & Privy Test</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Device Detection</h2>
            <p><strong>Is Mobile:</strong> {isMobileDevice ? 'Yes' : 'No'}</p>
            <p><strong>Force Mobile (for testing):</strong> {forceMobile ? 'Yes' : 'No'}</p>
            <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Privy Status</h2>
            <p><strong>Ready:</strong> {ready ? 'Yes' : 'No'}</p>
            <p><strong>Authenticated:</strong> {authenticated ? 'Yes' : 'No'}</p>
            <p><strong>User ID:</strong> {user?.id || 'None'}</p>
            <p><strong>Wallets Count:</strong> {wallets.length}</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Wallet Details</h2>
            {wallets.length > 0 ? (
              <div>
                {wallets.map((wallet, index) => (
                  <div key={index} className="mb-2">
                    <p><strong>Wallet {index + 1}:</strong></p>
                    <p>• Type: {wallet.walletClientType}</p>
                    <p>• Address: {wallet.address}</p>
                    <p>• Chain: {wallet.chainId}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No wallets connected</p>
            )}
          </div>

          <div className="flex space-x-4">
            {!authenticated ? (
              <button
                onClick={() => login()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Test Privy Login
              </button>
            ) : (
              <button
                onClick={() => logout()}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
