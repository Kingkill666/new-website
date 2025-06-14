"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useWallet, WALLET_OPTIONS } from "@/hooks/useWallet"

interface WalletConnectorProps {
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "ghost"
  className?: string
  showBalance?: boolean
}

export function WalletConnector({
  size = "default",
  variant = "outline",
  className = "",
  showBalance = false,
}: WalletConnectorProps) {
  const { walletState, isConnecting, connectWallet, disconnectWallet, formatAddress } = useWallet()
  const [showWalletOptions, setShowWalletOptions] = useState(false)

  if (walletState.isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="text-sm">
            <div className="font-medium text-green-700">
              {walletState.walletType}: {formatAddress(walletState.address!)}
            </div>
            {showBalance && walletState.balance && (
              <div className="text-xs text-green-600">{walletState.balance} ETH</div>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size={size}
          onClick={disconnectWallet}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        className={`border-red-600 text-red-600 hover:bg-red-50 font-semibold ${className}`}
        onClick={() => setShowWalletOptions(!showWalletOptions)}
        disabled={isConnecting}
      >
        <Wallet className="h-4 w-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect"}
      </Button>

      {/* Wallet Options Dropdown */}
      {showWalletOptions && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Connect Wallet</h3>
            <p className="text-sm text-gray-600">Choose your preferred wallet</p>
          </div>
          {WALLET_OPTIONS.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => {
                connectWallet(wallet.id)
                setShowWalletOptions(false)
              }}
              disabled={isConnecting}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {wallet.logo.startsWith("/") ? (
                <img src={wallet.logo || "/placeholder.svg"} alt={`${wallet.name} logo`} className="w-6 h-6 rounded" />
              ) : (
                <span className="text-2xl">{wallet.logo}</span>
              )}
              <span className="font-medium text-gray-900">{wallet.name}</span>
              {isConnecting && (
                <div className="ml-auto w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {showWalletOptions && <div className="fixed inset-0 z-40" onClick={() => setShowWalletOptions(false)} />}
    </div>
  )
}
