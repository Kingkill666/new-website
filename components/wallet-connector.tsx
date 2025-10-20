"use client"

import { useEffect, useMemo, useState } from "react"
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
import {
  WALLETS,
  getWalletDisplayName,
  isWalletInstalled,
} from "@/lib/wallet-config"
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

  useEffect(() => {
    if (isConnected) {
      setOpen(false)
    }
  }, [isConnected])

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setError(null)
    }
    setOpen(value)
  }

  const availableWallets = useMemo(() => WALLETS, [])

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
              : "Choose a wallet provider to connect with VMF."}
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
                setOpen(false)
              }}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {availableWallets.map((wallet) => {
              const installed =
                typeof window !== "undefined"
                  ? isWalletInstalled(wallet.id)
                  : false
              const connecting = isConnecting === wallet.id

              return (
                <Button
                  key={wallet.id}
                  variant="outline"
                  className="flex w-full items-center justify-between border border-gray-200 bg-white text-left"
                  disabled={connecting}
                  onClick={async () => {
                    await connectWallet(wallet.id)
                  }}
                >
                  <span className="flex items-center gap-3">
                    {wallet.icon && (
                      <span className="text-lg" aria-hidden="true">
                        {wallet.icon}
                      </span>
                    )}
                    <span className="font-medium">{wallet.name}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {connecting
                      ? "Connecting..."
                      : installed
                        ? "Installed"
                        : "External"}
                  </span>
                </Button>
              )
            })}
            <p className="text-xs text-muted-foreground">
              Don&apos;t see your wallet? Make sure the extension or mobile app
              is installed and unlocked, then try again.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export const getWalletName = getWalletDisplayName
