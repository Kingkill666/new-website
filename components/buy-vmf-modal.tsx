"use client"

import type React from "react"

import { ethers } from "ethers"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, ChevronDown, ChevronUp, CheckCircle, Copy, Check, Minus, Plus, AlertCircle } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"

interface BuyVMFModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Charity {
  id: string
  name: string
  shortName: string
  address: string
  logo: string
}

interface CharityDistribution {
  charityId: string
  percentage: number
}

const charities: Charity[] = [
  {
    id: "holy-family",
    name: "Holy Family Village",
    shortName: "Holy Family Village",
    address: "0xB697C8b4bCaE454d9dee1E83f73327D7a63600a1",
    logo: "/images/charity-logos/holy-family-village-logo.png",
  },
  {
    id: "patriots-promise",
    name: "Patriots Promise",
    shortName: "Patriots Promise",
    address: "0x6456879a5073038b0E57ea8E498Cb0240e949fC3",
    logo: "/images/charity-logos/patriots-promise-logo.png",
  },
  {
    id: "victory-veterans",
    name: "Victory For Veterans",
    shortName: "Victory for Veterans",
    address: "0x700B53ff9a58Ee257F9A2EFda3a373D391028007",
    logo: "/images/charity-logos/victory-for-veterans-logo.jpeg",
  },
  {
    id: "veterans-need",
    name: "Veterans In Need Project",
    shortName: "Veterans In Need Project",
    address: "0xfB0EF51792c36Ae1fE6636603be199788819b67D",
    logo: "/images/charity-logos/veterans-in-need-logo.png",
  },
  {
    id: "honor-her",
    name: "Honor HER Foundation",
    shortName: "Honor HER Foundation",
    address: "0x10F01632DC709F7fA413A140739D8843b06235A1",
    logo: "/images/charity-logos/honor-her-logo.jpeg",
  },
  {
    id: "camp-cowboy",
    name: "Camp Cowboy",
    shortName: "Camp Cowboy",
    address: "0x5951A4160F73b8798D68e7177dF8af6a7902e725",
    logo: "/images/charity-logos/camp-cowboy-logo.png",
  },
]

const CONTRACT_ADDRESS = "0x46855ec900764Dc6c05155Af0eCe45DB004E814A"

export function BuyVMFModal({ isOpen, onClose }: BuyVMFModalProps) {
  const [currentStep, setCurrentStep] = useState<"buy" | "verify" | "success">("buy")
  const [amount, setAmount] = useState("")
  const [selectedCharities, setSelectedCharities] = useState<string[]>([])
  const [charityDistributions, setCharityDistributions] = useState<CharityDistribution[]>([])
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [isCharityDropdownOpen, setIsCharityDropdownOpen] = useState(false)
  const { walletState, connectWallet, formatAddress, switchNetwork} = useWallet()
  const [transactionHash, setTransactionHash] = useState("")
  const [vmfAmount, setVmfAmount] = useState("")
  const [fees] = useState("20.0")
  const [charityPool, setCharityPool] = useState("0.00")
  const [copied, setCopied] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [needsNetworkSwitch, setNeedsNetworkSwitch] = [false, (value: boolean) => {}] as const

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen) {
      // Focus the modal when it opens
      const modal = document.querySelector('[role="dialog"]') as HTMLElement
      if (modal) {
        modal.focus()
      }
    }
  }, [isOpen])

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }

      if (e.key === "Tab") {
        const modal = document.querySelector('[role="dialog"]')
        if (!modal) return

        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
      } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (amount) {
      const vmf = (Number.parseFloat(amount) * 1000).toFixed(4)
      setVmfAmount(vmf)
      setCharityPool(amount)
    }
  }, [amount])

  useEffect(() => {
    if (walletState.isConnected) {
      setNeedsNetworkSwitch(walletState.chainId !== 8453)
    }
  }, [walletState.chainId, walletState.isConnected, walletState.walletType])

  useEffect(() => {
    if (selectedCharities.length > 0) {
      const equalPercentage = Math.floor(100 / selectedCharities.length)
      const remainder = 100 - equalPercentage * selectedCharities.length

      const newDistributions = selectedCharities.map((charityId, index) => ({
          charityId,
          percentage: index === 0 ? equalPercentage + remainder : equalPercentage,
        }))

      setCharityDistributions(newDistributions)
    } else {
      setCharityDistributions([])
    }
  }, [selectedCharities])

  const handleCharitySelect = (charityId: string) => {
    if (selectedCharities.includes(charityId)) {
      setSelectedCharities(selectedCharities.filter((id) => id !== charityId))
    } else if (selectedCharities.length < 3) {
      setSelectedCharities([...selectedCharities, charityId])
    }
  }

  const updateCharityPercentage = (charityId: string, newPercentage: number) => {
    const updatedDistributions = charityDistributions.map((dist) =>
      dist.charityId === charityId ? { ...dist, percentage: newPercentage } : dist,
    )

    const total = updatedDistributions.reduce((sum, dist) => sum + dist.percentage, 0)
    if (total <= 100) {
      setCharityDistributions(updatedDistributions)
    }
  }

  const getTotalPercentage = () => {
    return charityDistributions.reduce((sum, dist) => sum + dist.percentage, 0)
  }

  const getCharityAmount = (percentage: number) => {
    if (!amount) return "0.00"
    return ((Number.parseFloat(amount) * percentage) / 100).toFixed(2)
  }

  const handleNetworkSwitch = async () => {
    const success = await switchNetwork("base")
    if (success) {
      setNeedsNetworkSwitch(false)
    }
  }

  const handleBuyNext = () => {
    if (amount && selectedCharities.length > 0 && walletState.isConnected && getTotalPercentage() === 100) {
      if (needsNetworkSwitch) {
        alert("Please switch to the correct network to continue")
        return
      }
      if(!walletState.usdcBalance) {
        alert("No USDC")
        return
      }
      if(walletState.usdcBalance && Number(amount) > Number(walletState.usdcBalance)) {
        alert(`cannot buy more than your USDC balance ${walletState.usdcBalance}, ${amount}`)
        return
      }
      setCurrentStep("verify")
    }
  }

  const executeSmartContract = async () => {
    if (!walletState.isConnected || !amount) {
      alert("Smart contract execution requires a connected wallet")
      return false
    }

    try {
      setIsProcessing(true)
      
      // Get the provider from the wallet state
      const provider = new ethers.BrowserProvider(walletState.provider)
      const signer = await provider.getSigner()
      
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        [
          {
            type: "function",
            name: "handleUSDC",
            inputs: [
              { name: "amountUSDC", type: "uint256", internalType: "uint256" },
              { name: "to", type: "address", internalType: "address" },
            ],
            outputs: [],
            stateMutability: "nonpayable",
          },
        ],
        signer
      )
      
      // For each charity, send their share
      let lastTxHash = ""
      for (const dist of charityDistributions) {
        const charity = charities.find((c) => c.id === dist.charityId)
        if (!charity) continue
        // Calculate USDC amount (assuming 6 decimals for USDC)
        const usdcAmount = ethers.parseUnits(
          ((Number(amount) * dist.percentage) / 100).toFixed(2),
          6
        )
        const usdcContractAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
        const erc20Abi = [
          "function balanceOf(address owner) view returns (uint256)",
          "function approve(address spender, uint256 amount) external returns (bool)"
        ];
        const usdcContract = new ethers.Contract(usdcContractAddress, erc20Abi, signer);
        const approveTx = await usdcContract.approve(CONTRACT_ADDRESS, usdcAmount);
        await approveTx.wait();

        const tx = await contract.handleUSDC(usdcAmount, charity.address)
        lastTxHash = tx.hash
        await tx.wait()
      }
      setTransactionHash(lastTxHash)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return true
    } catch (error: any) {
      console.error("Smart contract execution failed:", error)
      alert(`Transaction failed: ${error.message || "Unknown error"}`)
      return false
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVerifyConfirm = async () => {
    if (needsNetworkSwitch) {
      alert("Please switch to the correct network first")
      return
    }

    const success = await executeSmartContract()
    if (success) {
      setCurrentStep("success")
    }
  }

  const handleCopyHash = () => {
    navigator.clipboard.writeText(transactionHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setCurrentStep("buy")
    setAmount("")
    setSelectedCharities([])
    setCharityDistributions([])
    setTransactionHash("")
    onClose()
  }

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      action()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto focus:outline-none"
        tabIndex={-1}
      >
        {/* Buy Step */}
        {currentStep === "buy" && (
          <Card className="border-0 shadow-none">
            <CardHeader className="relative pb-4">
              <div className="flex items-center justify-between">
                <CardTitle id="modal-title" className="text-2xl font-bold text-center flex-1">
                  BUY VMF
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleClose}
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div id="modal-description" className="sr-only">
                Purchase VMF coins and select charities to support veterans and military families
              </div>

              {!walletState.isConnected ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" role="alert">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    <span className="font-medium text-blue-800">Connect Your Wallet</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Please connect your Coinbase Smart Wallet to continue with the purchase.
                  </p>
            <Button
              onClick={() => connectWallet("coinbaseSmart")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Connect Coinbase Smart Wallet"
            >
              Connect Coinbase Smart Wallet
            </Button>
          </div>
              ) : (
                <>
                  {/* Connected Wallet Display */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4" role="status" aria-live="polite">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                      <span className="font-medium text-green-800">
                        {walletState.walletType}: {formatAddress(walletState.address!)}
                      </span>
                    </div>
                    {walletState.balance && (
                      
                      <p className="text-sm text-green-700 mt-1">
                        Balance: {walletState.balance} ETH
                      </p>
                    )}
                    {walletState.usdcBalance && (
                      <p className="text-sm text-green-700 mt-1">
                        ${walletState.usdcBalance}
                      </p>)}
                  </div>

                  {/* USDC Balance Warning */}
                  {(!walletState.usdcBalance || Number(walletState.usdcBalance) === 0) && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4" role="alert">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" aria-hidden="true" />
                        <span className="font-medium text-orange-800">No USDC Balance</span>
                      </div>
                      <p className="text-sm text-orange-700 mb-3">
                        You need USDC to purchase VMF coins. Get USDC directly on Base network.
                      </p>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          onClick={() => window.open("https://coinbase.com/buy/usdc", "_blank")}
                          className="w-full text-orange-700 border-orange-300 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                          aria-label="Buy USDC on Coinbase, opens in new tab"
                        >
                          Buy USDC on Coinbase
                        </Button>
                      </div>
              </div>
            )}

                  {/* Network Warning for Ethereum wallets */}
                  {walletState.walletType !== "Phantom" && needsNetworkSwitch && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4" role="alert">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" aria-hidden="true" />
                        <span className="font-medium text-yellow-800">Wrong Network</span>
                      </div>
                      <p className="text-sm text-yellow-700 mb-3">Please switch to the correct network to continue.</p>
                      <Button
                        onClick={handleNetworkSwitch}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                        aria-label="Switch to new network"
                      >
                        Switch Network
                      </Button>
              </div>
                  )}

                  {/* Phantom Wallet Warning */}
                  {walletState.walletType === "Phantom" && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4" role="alert">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" aria-hidden="true" />
                        <span className="font-medium text-orange-800">Solana Wallet Detected</span>
                      </div>
                      <p className="text-sm text-orange-700">
                        Smart contract execution requires an Ethereum wallet. Please connect MetaMask, Coinbase, or
                        Rainbow wallet.
                      </p>
                    </div>
                  )}
                </>
            )}

            {/* Amount Input */}
            <div>
                <label htmlFor="amount-input" className="block text-sm font-medium text-gray-700 mb-2">
                  AMOUNT $
              </label>
                <input
                  id="amount-input"
                  type="number"
                  value={amount}
                  max={walletState.usdcBalance || ""}
                  min="0"
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg"
                  aria-describedby="amount-description"
                />
                <div id="amount-description" className="sr-only">
                  Enter the dollar amount you want to spend on VMF coins
                </div>
            </div>

              {/* Description */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 leading-relaxed">
                  When you buy VMF, you get to donate an equal amount of USDC to our partnered charities{" "}
                  <span className="font-bold">for FREE!</span>
                </p>
              </div>

            {/* Charity Selection */}
              <fieldset>
                <legend className="text-lg font-semibold mb-3">Pick Up To 3 Charities</legend>
                <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="charity-selection">
                {charities.map((charity) => (
                  <Button
                      key={charity.id}
                      variant={selectedCharities.includes(charity.id) ? "default" : "outline"}
                    size="sm"
                      onClick={() => handleCharitySelect(charity.id)}
                      onKeyDown={(e) => handleKeyDown(e, () => handleCharitySelect(charity.id))}
                    className={`text-xs p-2 h-auto whitespace-normal focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        selectedCharities.includes(charity.id)
                        ? "bg-blue-600 text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                      disabled={!selectedCharities.includes(charity.id) && selectedCharities.length >= 3}
                      aria-pressed={selectedCharities.includes(charity.id)}
                      aria-label={`${selectedCharities.includes(charity.id) ? "Deselect" : "Select"} ${charity.shortName}`}
                    >
                      {charity.shortName}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2" aria-live="polite">
                  Selected: {selectedCharities.length}/3
                </p>
              </fieldset>

              {/* Charity Distribution */}
              {selectedCharities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Distribute Your Donation</h3>
                  <div className="space-y-3" role="list" aria-label="Charity distribution settings">
                    {charityDistributions.map((distribution) => {
                      const charity = charities.find((c) => c.id === distribution.charityId)
                      return (
                        <div key={distribution.charityId} className="bg-gray-50 p-3 rounded-lg" role="listitem">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <img
                                src={charity?.logo || "/placeholder.svg"}
                                alt=""
                                className="w-6 h-6 rounded object-contain"
                                aria-hidden="true"
                              />
                              <span className="text-sm font-medium">{charity?.shortName}</span>
                            </div>
                            <span
                              className="text-sm font-bold text-green-600"
                              aria-label={`${charity?.shortName} will receive $${getCharityAmount(distribution.percentage)}`}
                            >
                              ${getCharityAmount(distribution.percentage)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              onClick={() =>
                                updateCharityPercentage(
                                  distribution.charityId,
                                  Math.max(0, distribution.percentage - 5),
                                )
                              }
                              aria-label={`Decrease ${charity?.shortName} percentage by 5%`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div
                              className="flex-1 bg-white rounded px-2 py-1 text-center text-sm font-medium"
                              aria-label={`${charity?.shortName} receives ${distribution.percentage} percent`}
                            >
                              {distribution.percentage}%
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              onClick={() =>
                                updateCharityPercentage(
                                  distribution.charityId,
                                  Math.min(100, distribution.percentage + 5),
                                )
                              }
                              aria-label={`Increase ${charity?.shortName} percentage by 5%`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg" role="status" aria-live="polite">
                    <div className="flex justify-between text-sm">
                      <span>Total Distribution:</span>
                      <span className={`font-bold ${getTotalPercentage() === 100 ? "text-green-600" : "text-red-600"}`}>
                        {getTotalPercentage()}%
                      </span>
                    </div>
                    {getTotalPercentage() !== 100 && (
                      <p className="text-xs text-red-600 mt-1" role="alert">
                        Distribution must equal 100% to continue
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Next Button */}
              <Button
                onClick={handleBuyNext}
                disabled={
                  !amount ||
                  selectedCharities.length === 0 ||
                  !walletState.isConnected ||
                  getTotalPercentage() !== 100 ||
                  walletState.walletType === "Phantom" ||
                  needsNetworkSwitch
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Continue to verification step"
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Verify Step */}
        {currentStep === "verify" && (
          <Card className="border-0 shadow-none">
            <CardHeader className="relative pb-4">
              <CardTitle id="modal-title" className="text-2xl font-bold text-center">
                Verify
                <br />
                VMF Purchase
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleClose}
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* VMF Amount - Centered */}
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">VMF</label>
                  <div
                    className="text-2xl font-bold text-gray-900"
                    aria-label={`You will receive ${vmfAmount} VMF coins`}
                  >
                    {vmfAmount}
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div role="list" aria-label="Transaction details">
                <div className="flex justify-between items-center py-2 border-b border-gray-200" role="listitem">
                  <span className="font-medium text-gray-700">Amount:</span>
                  <span className="font-semibold">${amount}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200" role="listitem">
                  <span className="font-medium text-gray-700">Network:</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200" role="listitem">
                  <span className="font-medium text-gray-700">Contract:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs">{formatAddress(CONTRACT_ADDRESS)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigator.clipboard.writeText(CONTRACT_ADDRESS)}
                      className="h-6 w-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="Copy contract address to clipboard"
                    >
                      <Copy className="h-3 w-3" />
                  </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200" role="listitem">
                  <span className="font-medium text-gray-700">Gas Fees (Est.):</span>
                  <span className="font-semibold">${fees}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200" role="listitem">
                  <span className="font-medium text-gray-700">Charity Pool:</span>
                  <span className="font-semibold">${charityPool}</span>
                </div>
              </div>

              {/* Charity Distribution Details */}
              <div className="border border-gray-200 rounded-lg">
                <Button
                  variant="ghost"
                  onClick={() => setIsCharityDropdownOpen(!isCharityDropdownOpen)}
                  className="w-full justify-between p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-expanded={isCharityDropdownOpen}
                  aria-controls="charity-distribution-details"
                  aria-label="Toggle charity distribution details"
                >
                  <span className="font-medium">Charity Distribution</span>
                  {isCharityDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {isCharityDropdownOpen && (
                  <div id="charity-distribution-details" className="p-3 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-2" role="list" aria-label="Charity distribution breakdown">
                      {charityDistributions.map((distribution) => {
                        const charity = charities.find((c) => c.id === distribution.charityId)
                        return (
                          <div
                            key={distribution.charityId}
                            className="flex justify-between items-center"
                            role="listitem"
                          >
                            <div className="flex items-center space-x-2">
                              <img
                                src={charity?.logo || "/placeholder.svg"}
                                alt=""
                                className="w-4 h-4 rounded object-contain"
                                aria-hidden="true"
                              />
                              <span className="text-sm">{charity?.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">${getCharityAmount(distribution.percentage)}</div>
                              <div className="text-xs text-gray-500">{distribution.percentage}%</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
            </div>

              {/* Advanced Dropdown */}
              <div className="border border-gray-200 rounded-lg">
                <Button
                  variant="ghost"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="w-full justify-between p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-expanded={isAdvancedOpen}
                  aria-controls="advanced-details"
                  aria-label="Toggle advanced transaction details"
                >
                  <span className="font-medium">Advanced</span>
                  {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {isAdvancedOpen && (
                  <div id="advanced-details" className="p-3 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-2 text-xs" role="list" aria-label="Advanced transaction details">
                      <div className="flex justify-between" role="listitem">
                        <span>Contract Address:</span>
                        <span className="font-mono">{formatAddress(CONTRACT_ADDRESS)}</span>
                      </div>
                      <div className="flex justify-between" role="listitem">
                        <span>Function:</span>
                        <span className="font-mono">handleUSDC</span>
                      </div>
                      <div className="flex justify-between" role="listitem">
                        <span>Connected Wallet:</span>
                        <span className="font-mono">{formatAddress(walletState.address!)}</span>
                      </div>
                      <div className="flex justify-between" role="listitem">
                        <span>Chain ID:</span>
                        <span className="font-mono">{walletState.chainId}</span>
                      </div>
                    </div>
                  </div>
                )}
            </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("buy")}
                  className="flex-1 border-black text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  disabled={isProcessing}
                  aria-label="Go back to purchase step"
                >
                  Cancel
                </Button>
            <Button
                  onClick={handleVerifyConfirm}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={isProcessing || needsNetworkSwitch}
                  aria-label={isProcessing ? "Processing transaction" : "Confirm and execute transaction"}
                >
                  {isProcessing ? "Processing..." : "Confirm"}
            </Button>
          </div>
            </CardContent>
          </Card>
        )}

        {/* Success Step */}
      {currentStep === "success" && (
          <Card className="border-0 shadow-none">
            <CardHeader className="relative pb-4">
              <CardTitle id="modal-title" className="text-2xl font-bold text-center text-green-600">
                Success!
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleClose}
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Success Details */}
              <div role="list" aria-label="Transaction success details">
                <div className="flex justify-between items-center py-2 border-b border-gray-200" role="listitem">
                  <span className="font-medium text-gray-700">VMF Total Amount:</span>
                  <span className="font-semibold">{vmfAmount}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200" role="listitem">
                  <span className="font-medium text-gray-700">Amount:</span>
                  <span className="font-semibold">${amount}</span>
                </div>

          {transactionHash && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200" role="listitem">
                    <span className="font-medium text-gray-700">Transaction:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">{formatAddress(transactionHash)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyHash}
                        className="h-6 w-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={copied ? "Transaction hash copied" : "Copy transaction hash"}
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Charity Distribution */}
              <div className="border border-gray-200 rounded-lg">
                <Button
                  variant="ghost"
                  onClick={() => setIsCharityDropdownOpen(!isCharityDropdownOpen)}
                  className="w-full justify-between p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-expanded={isCharityDropdownOpen}
                  aria-controls="success-charity-distribution"
                  aria-label="Toggle charity distribution details"
                >
                  <span className="font-medium">Charity Distribution</span>
                  {isCharityDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {isCharityDropdownOpen && (
                  <div id="success-charity-distribution" className="p-3 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-2" role="list" aria-label="Successful charity distributions">
                      {charityDistributions.map((distribution) => {
                        const charity = charities.find((c) => c.id === distribution.charityId)
                        return (
                          <div
                            key={distribution.charityId}
                            className="flex justify-between items-center"
                            role="listitem"
                          >
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" aria-label="Successfully donated" />
                              <img
                                src={charity?.logo || "/placeholder.svg"}
                                alt=""
                                className="w-4 h-4 rounded object-contain"
                                aria-hidden="true"
                              />
                              <span className="text-sm">{charity?.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-green-600">
                                ${getCharityAmount(distribution.percentage)}
                              </div>
                              <div className="text-xs text-gray-500">{distribution.percentage}%</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Dropdown */}
              <div className="border border-gray-200 rounded-lg">
                <Button
                  variant="ghost"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="w-full justify-between p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-expanded={isAdvancedOpen}
                  aria-controls="success-advanced-details"
                  aria-label="Toggle advanced transaction details"
                >
                  <span className="font-medium">Advanced</span>
                  {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {isAdvancedOpen && (
                  <div id="success-advanced-details" className="p-3 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-2 text-xs" role="list" aria-label="Advanced transaction details">
                      <div className="flex justify-between" role="listitem">
                        <span>Network:</span>
                      </div>
                      <div className="flex justify-between" role="listitem">
                        <span>Contract:</span>
                        <span className="font-mono">{formatAddress(CONTRACT_ADDRESS)}</span>
                      </div>
                      {transactionHash && (
                        <div className="flex justify-between" role="listitem">
                          <span>Tx Hash:</span>
                          <span className="font-mono">{formatAddress(transactionHash)}</span>
                        </div>
                      )}
                    </div>
        </div>
      )}
              </div>

              {/* Baldy NFT Button */}
              <div className="text-center">
                <Button
                  variant="outline"
                  className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                  onClick={() => window.open("#", "_blank")}
                  aria-label="View Baldy NFT, opens in new tab"
                >
                  <div
                    className="w-6 h-6 rounded-full bg-yellow-400 mr-2 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="text-xs font-bold">B</span>
                  </div>
                  Baldy NFT
                </Button>
              </div>

              {/* Thank You Message */}
              <div className="bg-green-50 p-4 rounded-lg text-center" role="status" aria-live="polite">
                <p className="text-sm text-green-800 leading-relaxed">
                  <span className="font-bold">VMF</span> Thanks you for your support and donation to help our partnered
                  charities <span className="font-bold">HODL</span>
                </p>
              </div>

              {/* Close Button */}
              <Button
                onClick={handleClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Complete transaction and close modal"
              >
                Complete
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
