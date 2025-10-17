"use client"

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { isMobile } from '@/lib/wallet-config'

export function PrivyDebug() {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const isMobileDevice = isMobile()

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">Privy Debug Info</h3>
      <div className="text-xs space-y-1">
        <div><strong>Device:</strong> {isMobileDevice ? 'Mobile' : 'Desktop'}</div>
        <div><strong>Privy Ready:</strong> {ready ? 'Yes' : 'No'}</div>
        <div><strong>Authenticated:</strong> {authenticated ? 'Yes' : 'No'}</div>
        <div><strong>User ID:</strong> {user?.id || 'None'}</div>
        <div><strong>Wallets:</strong> {wallets.length}</div>
        {wallets.length > 0 && (
          <div>
            <strong>Wallet Types:</strong>
            <ul className="ml-2">
              {wallets.map((wallet, index) => (
                <li key={index}>• {wallet.walletClientType}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {!authenticated && (
        <button
          onClick={() => login()}
          className="mt-2 w-full bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700"
        >
          Test Privy Login
        </button>
      )}
      {authenticated && (
        <button
          onClick={() => logout()}
          className="mt-2 w-full bg-red-600 text-white text-xs py-1 px-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      )}
    </div>
  )
}

