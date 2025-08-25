"use client"

import { Button } from "@/components/ui/button"
import { Check, Wallet } from "lucide-react"

interface WalletStatusProps {
  isConnected: boolean
  walletName?: string
  formattedAddress?: string | null
  onConnect: () => void
  onDisconnect: () => void
  customFontStyle: any
}

export function WalletStatus({
  isConnected,
  walletName,
  formattedAddress,
  onConnect,
  onDisconnect,
  customFontStyle,
}: WalletStatusProps) {
  if (!isConnected) {
    return (
      <Button
        variant="outline"
        className="w-full border-2 border-red-700 text-red-700 hover:bg-red-50 bg-transparent font-bold py-2"
        style={{
          ...customFontStyle,
          letterSpacing: "1px",
          fontSize: "1rem",
        }}
        onClick={onConnect}
      >
        <Wallet className="mr-2 h-5 w-5" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <div
        className="w-full bg-green-100 text-green-800 text-sm px-4 py-2 rounded-xl border-2 border-green-300 text-center"
        style={customFontStyle}
      >
        <Check className="inline mr-2 h-4 w-4" />
        Connected to {walletName}
      </div>
      <div
        className="w-full bg-gray-100 text-gray-700 text-xs px-4 py-1 rounded-lg text-center"
        style={customFontStyle}
      >
        {formattedAddress}
      </div>
      <Button
        variant="outline"
        className="w-full border-2 border-gray-400 text-gray-600 hover:bg-gray-50 bg-transparent font-bold py-1 text-sm"
        style={customFontStyle}
        onClick={() => {
          console.log("🔌 User clicked disconnect button")
          console.log("🔌 Calling onDisconnect function")
          onDisconnect()
          console.log("🔌 onDisconnect function called")
        }}
      >
        Disconnect & Refresh
      </Button>
    </div>
  )
} 