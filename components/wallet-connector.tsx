"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useWallet } from "@/hooks/useWallet"
import { getWalletDisplayName } from "@/lib/wallet-config"
import { cn } from "@/lib/utils"

type WalletConnectorProps = {
  size?: "sm" | "default" | "lg"
  showBalance?: boolean
  className?: string
  buttonVariant?: "default" | "outline" | "secondary" | "ghost"
}

export const WalletConnector = ({
  size = "default",
  showBalance = false,
  className,
  buttonVariant = "default",
}: WalletConnectorProps) => {
  const [open, setOpen] = useState(false)
  const {
    connection,
    formattedAddress,
    isConnected,
    isConnecting,
    connectWallet,
    disconnect,
    error,
    setError,
  } = useWallet()
  const [hasPrompted, setHasPrompted] = useState(false)

  useEffect(() => {
    if (isConnected) {
      setOpen(false)
      setHasPrompted(false)
    }
  }, [isConnected])

  useEffect(() => {
    if (!open) {
      setHasPrompted(false)
      setError(null)
      return
    }

    if (!isConnected && !hasPrompted) {
      setHasPrompted(true)
      connectWallet().catch(() => {
        setHasPrompted(false)
      })
    }
  }, [connectWallet, hasPrompted, isConnected, open, setError])

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setError(null)
      setHasPrompted(false)
    }
    setOpen(value)
  }

  const primaryLabel = isConnected
    ? formattedAddress || connection?.address
    : "Connect Wallet"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={isConnected ? "outline" : buttonVariant}
          size={size}
          className={cn("font-semibold", className)}
        >
          {primaryLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isConnected ? "Wallet Connected" : "Connect your wallet"}
          </DialogTitle>
          <DialogDescription>
            {isConnected
              ? "You can manage your wallet connection below."
              : "Reown WalletKit opens automatically so you can choose any supported wallet."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {isConnected ? (
          <div className="space-y-4 rounded-lg border border-gray-200 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Connected with</p>
              <p className="font-medium">
                {connection?.walletName || "Wallet"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-mono text-sm">
                {connection?.address || "Unknown"}
              </p>
            </div>
            {showBalance && connection?.balance && (
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="font-medium">{connection.balance}</p>
              </div>
            )}
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                disconnect()
                setHasPrompted(false)
                setOpen(false)
              }}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              Reown WalletKit opens automatically so you can select Coinbase, MetaMask, Farcaster, Rainbow, or any WalletConnect-compatible wallet. If you closed it, relaunch the secure modal below.
            </div>
            <Button
              variant="outline"
              className="w-full border border-gray-200 bg-white text-left font-semibold"
              disabled={Boolean(isConnecting)}
              onClick={() => connectWallet()}
            >
              {isConnecting ? "Connecting..." : "Open Reown WalletKit"}
            </Button>
            <p className="text-xs text-muted-foreground">
              WalletKit handles discovery, deep links, and network switching on Base. Once connected, you&apos;ll see your wallet details here.
            </p>
          </div>
      )}
      </DialogContent>
    </Dialog>
  )
}

export const getWalletName = getWalletDisplayName
