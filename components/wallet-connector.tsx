"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const availableWallets = getAvailableWallets()

  // Ensure component is mounted (for SSR compatibility)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate dropdown position with better viewport handling
  const calculatePosition = useCallback(() => {
    if (buttonRef.current && typeof window !== "undefined") {
      const rect = buttonRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const dropdownWidth = 320
      const dropdownHeight = 400 // Approximate height

      let top = rect.bottom + 8 // 8px gap below button
      let left = rect.right - dropdownWidth // Align to right edge of button

      // Adjust if dropdown would go off the right edge
      if (left + dropdownWidth > viewportWidth - 10) {
        left = viewportWidth - dropdownWidth - 10
      }

      // Adjust if dropdown would go off the left edge
      if (left < 10) {
        left = 10
      }

      // Adjust if dropdown would go off the bottom edge
      if (top + dropdownHeight > viewportHeight - 10) {
        top = rect.top - dropdownHeight - 8 // Show above button instead
      }

      // Ensure it doesn't go off the top
      if (top < 10) {
        top = 10
      }

      setDropdownPosition({ top, left })
    }
  }, [])

  // Update position when dropdown opens or window changes
  useEffect(() => {
    if (showWalletOptions && mounted) {
      calculatePosition()

      const handleScroll = () => calculatePosition()
      const handleResize = () => calculatePosition()

      window.addEventListener("scroll", handleScroll, { passive: true })
      window.addEventListener("resize", handleResize, { passive: true })

      return () => {
        window.removeEventListener("scroll", handleScroll)
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [showWalletOptions, mounted, calculatePosition])

  // Handle clicks outside dropdown
  useEffect(() => {
    if (!showWalletOptions || !mounted) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element

      // Don't close if clicking on the button
      if (buttonRef.current?.contains(target)) {
        return
      }

      // Don't close if clicking inside the dropdown
      const dropdown = document.getElementById("wallet-dropdown-portal")
      if (dropdown?.contains(target)) {
        return
      }

      setShowWalletOptions(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowWalletOptions(false)
        setShowNetworkOptions(false)
      }
    }

    // Use capture phase to ensure we catch the event before other handlers
    document.addEventListener("mousedown", handleClickOutside, true)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [showWalletOptions, mounted])

  const handleWalletConnect = async (walletId: string) => {
    await connectWallet(walletId)
    setShowWalletOptions(false)
  }

  const handleNetworkSwitch = async (network: string) => {
    const success = await switchNetwork(network as any)
    if (!success) {
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

  // Render dropdown portal
  const renderDropdown = () => {
    if (!mounted || !showWalletOptions || typeof window === "undefined") {
      return null
    }

    const dropdown = (
      <div
        id="wallet-dropdown-portal"
        className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 py-3 max-h-96 overflow-y-auto"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: "320px",
          zIndex: 999999, // Very high z-index
          maxWidth: "90vw",
        }}
      >
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">Connect Wallet</h3>
          <p className="text-sm text-gray-600 mt-1">Choose your preferred wallet to connect</p>
        </div>

        <div className="py-2">
          {availableWallets.map((wallet) => (
            <div key={wallet.id} className="relative">
              <button
                onClick={() =>
                  wallet.installed ? handleWalletConnect(wallet.id) : window.open(getInstallUrl(wallet.id), "_blank")
                }
                disabled={isConnecting}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors disabled:opacity-50 border-b border-gray-50 last:border-b-0"
              >
                <div className="flex items-center space-x-4">
                  {/* Wallet Icon */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {wallet.logo.startsWith("/") ? (
                      <img
                        src={wallet.logo || "/placeholder.svg"}
                        alt={`${wallet.name} logo`}
                        className="w-8 h-8 rounded object-contain"
                      />
                    ) : (
                      <span className="text-2xl">{wallet.logo}</span>
                    )}
                  </div>

                  {/* Wallet Info */}
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 text-base">{wallet.name}</div>
                    <div className="text-sm text-gray-500">
                      {wallet.installed ? "Ready to connect" : "Not installed - Click to install"}
                    </div>
                  </div>
                </div>

                {/* Status Icons */}
                <div className="flex items-center space-x-2">
                  {wallet.installed ? (
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">Installed</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">Install</span>
                    </div>
                  )}
                  {isConnecting && (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 leading-relaxed">
            New to crypto wallets?{" "}
            <a
              href="https://ethereum.org/en/wallets/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Learn more about wallets
            </a>
          </p>
        </div>
      </div>
    )

    return createPortal(dropdown, document.body)
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
              <>
                <div className="fixed inset-0 z-[999998]" onClick={() => setShowNetworkOptions(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[999999]">
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
              </>
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
    <>
      <div className="relative">
        <Button
          ref={buttonRef}
          variant={variant}
          size={size}
          className={`border-red-600 text-red-600 hover:bg-red-50 font-semibold ${className}`}
          onClick={() => setShowWalletOptions(!showWalletOptions)}
          disabled={isConnecting}
        >
          <Wallet className="h-4 w-4 mr-2" />
          {isConnecting ? "Connecting..." : "Connect"}
        </Button>
      </div>

      {/* Render dropdown using portal */}
      {renderDropdown()}

      {/* Background overlay when dropdown is open */}
      {showWalletOptions && mounted && (
        <>
          {createPortal(
            <div
              className="fixed inset-0 bg-black/10 backdrop-blur-[1px]"
              style={{ zIndex: 999998 }}
              onClick={() => setShowWalletOptions(false)}
            />,
            document.body,
          )}
        </>
      )}
    </>
  )
}
