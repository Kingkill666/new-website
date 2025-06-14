"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, ExternalLink, AlertCircle, CheckCircle } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"

interface WalletConnectorProps {
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "ghost"
  className?: string
  showBalance?: boolean
  showChainId?: boolean
}

export function WalletConnector({
  size = "default",
  variant = "outline",
  className = "",
  showBalance = false,
  showChainId = false,
}: WalletConnectorProps) {
  const {
    walletState,
    isConnecting,
    connectWallet,
    disconnectWallet,
    formatAddress,
    getAvailableWallets,
    switchNetwork,
    addNetwork,
    error,
  } = useWallet()

  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const [showNetworkOptions, setShowNetworkOptions] = useState(false)

  const availableWallets = getAvailableWallets()

  const handleWalletConnect = async (walletId: string) => {
    await connectWallet(walletId)
    setShowWalletOptions(false)
  }

  const handleNetworkSwitch = async (network: string) => {
    const success = await switchNetwork(network as any)
    if (!success) {
      // Try to add the network if switching failed
      await addNetwork(network as any)
    }
    setShowNetworkOptions(false)
  }

  const getChainName = (chainId: number | null) => {
    switch (chainId) {
      case 1:
        return "Ethereum"
      case 11155111:
        return "Sepolia"
      case 8453:
        return "Base"
      case 84532:
        return "Base Sepolia"
      default:
        return "Unknown"
    }
  }

  const getInstallUrl = (walletId: string) => {
    switch (walletId) {
      case "metamask":
        return "https://metamask.io/download/"
      case "coinbase":
        return "https://www.coinbase.com/wallet"
      case "rainbow":
        return "https://rainbow.me/"
      case "phantom":
        return "https://phantom.app/"
      case "safe":
        return "https://safe.global/"
      default:
        return "#"
    }
  }

  if (walletState.isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="text-sm">
            <div className="font-medium text-green-700 flex items-center space-x-1">
              <span>
                {walletState.walletType}: {formatAddress(walletState.address!)}
              </span>
              {showChainId && walletState.chainId && (
                <span className="text-xs bg-green-100 px-1 rounded">{getChainName(walletState.chainId)}</span>
              )}
            </div>
            {showBalance && walletState.balance && (
              <div className="text-xs text-green-600">
                {walletState.balance} {walletState.walletType === "Phantom" ? "SOL" : "ETH"}
              </div>
            )}
          </div>
        </div>

        {/* Network Switch Button for Ethereum wallets */}
        {walletState.walletType !== "Phantom" && (
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNetworkOptions(!showNetworkOptions)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Network
            </Button>

            {showNetworkOptions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Switch Network</h3>
                </div>
                {[
                  { key: "ethereum", name: "Ethereum Mainnet" },
                  { key: "sepolia", name: "Sepolia Testnet" },
                  { key: "base", name: "Base" },
                  { key: "baseSepolia", name: "Base Sepolia" },
                ].map((network) => (
                  <button
                    key={network.key}
                    onClick={() => handleNetworkSwitch(network.key)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    {network.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

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

      {/* Error Display */}
      {error && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-red-50 border border-red-200 rounded-lg p-3 z-50">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Wallet Options Dropdown */}
      {showWalletOptions && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Connect Wallet</h3>
            <p className="text-sm text-gray-600">Choose your preferred wallet</p>
          </div>

          {availableWallets.map((wallet) => (
            <div key={wallet.id} className="relative">
              <button
                onClick={() =>
                  wallet.installed ? handleWalletConnect(wallet.id) : window.open(getInstallUrl(wallet.id), "_blank")
                }
                disabled={isConnecting}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  {wallet.logo.startsWith("/") ? (
                    <img
                      src={wallet.logo || "/placeholder.svg"}
                      alt={`${wallet.name} logo`}
                      className="w-6 h-6 rounded"
                    />
                  ) : (
                    <span className="text-2xl">{wallet.logo}</span>
                  )}
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{wallet.name}</div>
                    {!wallet.installed && <div className="text-xs text-gray-500">Not installed</div>}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {wallet.installed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  )}
                  {isConnecting && (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              </button>
            </div>
          ))}

          <div className="px-4 py-2 border-t border-gray-100 mt-2">
            <p className="text-xs text-gray-500">
              New to crypto wallets?
              <a
                href="https://ethereum.org/en/wallets/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                Learn more
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {(showWalletOptions || showNetworkOptions) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowWalletOptions(false)
            setShowNetworkOptions(false)
          }}
        />
      )}
    </div>
  )
}
