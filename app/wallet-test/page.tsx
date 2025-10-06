'use client'

import { useAccount, useBalance } from 'wagmi'

export default function WalletTestPage() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Wallet Connection Test
            </h1>
            
            <div className="space-y-6">
              {/* Wallet Connection Button */}
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
                <appkit-button />
              </div>
              
              {/* Connection Status */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
                <p className="text-sm text-gray-600">
                  Status: <span className={isConnected ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </p>
                {address && (
                  <p className="text-sm text-gray-600 mt-2">
                    Address: <span className="font-mono text-xs break-all">{address}</span>
                  </p>
                )}
              </div>
              
              {/* Balance Display */}
              {isConnected && balance && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Account Balance</h3>
                  <p className="text-sm text-gray-600">
                    Balance: <span className="font-semibold">{balance.formatted} {balance.symbol}</span>
                  </p>
                </div>
              )}
              
              {/* Instructions */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Click the "Connect" button above</li>
                  <li>Choose your preferred wallet from the modal</li>
                  <li>Follow the connection prompts</li>
                  <li>Once connected, your wallet info will appear below</li>
                </ol>
              </div>
              
              {/* Back to Home */}
              <div className="text-center">
                <a 
                  href="/" 
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
