"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Wallet, ChevronDown, ChevronUp, CheckCircle, Copy, Check, Minus, Plus } from "lucide-react"

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
    address: "0x1234567890123456789012345678901234567890",
    logo: "/images/charity-logos/holy-family-village-logo.png",
  },
  {
    id: "patriots-promise",
    name: "Patriots Promise",
    shortName: "Patriots Promise",
    address: "0x2345678901234567890123456789012345678901",
    logo: "/images/charity-logos/patriots-promise-logo.png",
  },
  {
    id: "victory-veterans",
    name: "Victory For Veterans",
    shortName: "Victory for Veterans",
    address: "0x3456789012345678901234567890123456789012",
    logo: "/images/charity-logos/victory-for-veterans-logo.jpeg",
  },
  {
    id: "veterans-need",
    name: "Veterans In Need Project",
    shortName: "Veterans In Need Project",
    address: "0x4567890123456789012345678901234567890123",
    logo: "/images/charity-logos/veterans-in-need-logo.png",
  },
  {
    id: "honor-her",
    name: "Honor HER Foundation",
    shortName: "Honor HER Foundation",
    address: "0x5678901234567890123456789012345678901234",
    logo: "/images/charity-logos/honor-her-logo.jpeg",
  },
  {
    id: "camp-cowboy",
    name: "Camp Cowboy",
    shortName: "Camp Cowboy",
    address: "0x6789012345678901234567890123456789012345",
    logo: "/images/charity-logos/camp-cowboy-logo.png",
  },
]

const CONTRACT_ADDRESS = "0xB775a3116342d4258b1182B5adC8765d6B61F7e4"
const CONTRACT_ABI = [
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
]

export function BuyVMFModal({ isOpen, onClose }: BuyVMFModalProps) {
  const [currentStep, setCurrentStep] = useState<"buy" | "verify" | "success">("buy")
  const [amount, setAmount] = useState("")
  const [selectedCharities, setSelectedCharities] = useState<string[]>([])
  const [charityDistributions, setCharityDistributions] = useState<CharityDistribution[]>([])
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [isCharityDropdownOpen, setIsCharityDropdownOpen] = useState(false)
  const [isConnectedWallet, setIsConnectedWallet] = useState(false)
  const [connectedAddress, setConnectedAddress] = useState("")
  const [transactionHash, setTransactionHash] = useState("")
  const [vmfAmount, setVmfAmount] = useState("")
  const [fees] = useState("20.0")
  const [charityPool, setCharityPool] = useState("0.00")
  const [copied, setCopied] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (amount) {
      // Calculate VMF amount based on some conversion rate
      const vmf = (Number.parseFloat(amount) * 1000).toFixed(4)
      setVmfAmount(vmf)
      setCharityPool(amount)
    }
  }, [amount])

  // Auto-distribute equally when charities are selected
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

    // Ensure total doesn't exceed 100%
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

  const handleConnectWallet = async () => {
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        })
        setConnectedAddress(accounts[0])
        setIsConnectedWallet(true)
      } else {
        alert("Please install MetaMask to connect your wallet")
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      alert("Failed to connect wallet")
    }
  }

  const handleBuyNext = () => {
    if (amount && selectedCharities.length > 0 && isConnectedWallet && getTotalPercentage() === 100) {
      setCurrentStep("verify")
    }
  }

  const executeSmartContract = async () => {
    if (!isConnectedWallet || !amount) return false

    try {
      setIsProcessing(true)

      // Get the Web3 provider
      const provider = new (window as any).ethers.providers.Web3Provider((window as any).ethereum)
      const signer = provider.getSigner()

      // Create contract instance
      const contract = new (window as any).ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      // Convert amount to Wei (assuming USDC has 6 decimals)
      const amountInWei = (window as any).ethers.utils.parseUnits(amount, 6)

      // Execute transactions for each charity
      const transactions = []
      for (const distribution of charityDistributions) {
        const charity = charities.find((c) => c.id === distribution.charityId)
        if (charity && distribution.percentage > 0) {
          const charityAmount = (window as any).ethers.utils.parseUnits(getCharityAmount(distribution.percentage), 6)

          const tx = await contract.handleUSDC(charityAmount, charity.address)
          transactions.push(tx)
        }
      }

      // Wait for the first transaction to get hash
      if (transactions.length > 0) {
        setTransactionHash(transactions[0].hash)

        // Wait for all transactions to be mined
        await Promise.all(transactions.map((tx) => tx.wait()))
      }

      return true
    } catch (error) {
      console.error("Smart contract execution failed:", error)
      alert("Transaction failed. Please try again.")
      return false
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVerifyConfirm = async () => {
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
    setIsConnectedWallet(false)
    setConnectedAddress("")
    setTransactionHash("")
    onClose()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Buy Step */}
        {currentStep === "buy" && (
          <Card className="border-0 shadow-none">
            <CardHeader className="relative pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-center flex-1">BUY VMF</CardTitle>
              </div>
              <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connect Wallet */}
              <Button
                onClick={handleConnectWallet}
                className={`w-full py-3 text-lg font-semibold ${
                  isConnectedWallet
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <Wallet className="h-5 w-5 mr-2" />
                {isConnectedWallet ? `Connected: ${formatAddress(connectedAddress)}` : "Connect Wallet"}
              </Button>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AMOUNT $</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>

              {/* Description */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 leading-relaxed">
                  When you buy VMF, you get to donate an equal amount of USDC to our partnered charities{" "}
                  <span className="font-bold">for FREE!</span>
                </p>
              </div>

              {/* Charity Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Pick Up To 3 Charities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {charities.map((charity) => (
                    <Button
                      key={charity.id}
                      variant={selectedCharities.includes(charity.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCharitySelect(charity.id)}
                      className={`text-xs p-2 h-auto whitespace-normal ${
                        selectedCharities.includes(charity.id)
                          ? "bg-blue-600 text-white"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      disabled={!selectedCharities.includes(charity.id) && selectedCharities.length >= 3}
                    >
                      {charity.shortName}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Selected: {selectedCharities.length}/3</p>
              </div>

              {/* Charity Distribution */}
              {selectedCharities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Distribute Your Donation</h3>
                  <div className="space-y-3">
                    {charityDistributions.map((distribution) => {
                      const charity = charities.find((c) => c.id === distribution.charityId)
                      return (
                        <div key={distribution.charityId} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <img
                                src={charity?.logo || "/placeholder.svg"}
                                alt={charity?.name}
                                className="w-6 h-6 rounded object-contain"
                              />
                              <span className="text-sm font-medium">{charity?.shortName}</span>
                            </div>
                            <span className="text-sm font-bold text-green-600">
                              ${getCharityAmount(distribution.percentage)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                updateCharityPercentage(
                                  distribution.charityId,
                                  Math.max(0, distribution.percentage - 5),
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="flex-1 bg-white rounded px-2 py-1 text-center text-sm font-medium">
                              {distribution.percentage}%
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                updateCharityPercentage(
                                  distribution.charityId,
                                  Math.min(100, distribution.percentage + 5),
                                )
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Total Distribution:</span>
                      <span className={`font-bold ${getTotalPercentage() === 100 ? "text-green-600" : "text-red-600"}`}>
                        {getTotalPercentage()}%
                      </span>
                    </div>
                    {getTotalPercentage() !== 100 && (
                      <p className="text-xs text-red-600 mt-1">Distribution must equal 100% to continue</p>
                    )}
                  </div>
                </div>
              )}

              {/* Next Button */}
              <Button
                onClick={handleBuyNext}
                disabled={
                  !amount || selectedCharities.length === 0 || !isConnectedWallet || getTotalPercentage() !== 100
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold disabled:opacity-50"
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
              <CardTitle className="text-2xl font-bold text-center">
                Verify
                <br />
                VMF Purchase
              </CardTitle>
              <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* VMF Amount - Centered */}
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">VMF</label>
                  <div className="text-2xl font-bold text-gray-900">{vmfAmount}</div>
                </div>
              </div>

              {/* Amount */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Amount:</span>
                <span className="font-semibold">${amount}</span>
              </div>

              {/* Network */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Network:</span>
                <span className="font-semibold">Ethereum Sepolia</span>
              </div>

              {/* Contract Address */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Contract:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs">{formatAddress(CONTRACT_ADDRESS)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(CONTRACT_ADDRESS)}
                    className="h-6 w-6"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Fees */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Gas Fees (Est.):</span>
                <span className="font-semibold">${fees}</span>
              </div>

              {/* Charity Pool */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Charity Pool:</span>
                <span className="font-semibold">${charityPool}</span>
              </div>

              {/* Charity Distribution Details */}
              <div className="border border-gray-200 rounded-lg">
                <Button
                  variant="ghost"
                  onClick={() => setIsCharityDropdownOpen(!isCharityDropdownOpen)}
                  className="w-full justify-between p-3"
                >
                  <span className="font-medium">Charity Distribution</span>
                  {isCharityDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {isCharityDropdownOpen && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-2">
                      {charityDistributions.map((distribution) => {
                        const charity = charities.find((c) => c.id === distribution.charityId)
                        return (
                          <div key={distribution.charityId} className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <img
                                src={charity?.logo || "/placeholder.svg"}
                                alt={charity?.name}
                                className="w-4 h-4 rounded object-contain"
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
                  className="w-full justify-between p-3"
                >
                  <span className="font-medium">Advanced</span>
                  {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {isAdvancedOpen && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Contract Address:</span>
                        <span className="font-mono">{formatAddress(CONTRACT_ADDRESS)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Function:</span>
                        <span className="font-mono">handleUSDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Connected Wallet:</span>
                        <span className="font-mono">{formatAddress(connectedAddress)}</span>
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
                  className="flex-1 border-black text-black hover:bg-gray-50"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerifyConfirm}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isProcessing}
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
              <CardTitle className="text-2xl font-bold text-center text-green-600">Success!</CardTitle>
              <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* VMF Total Amount */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">VMF Total Amount:</span>
                <span className="font-semibold">{vmfAmount}</span>
              </div>

              {/* Amount */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Amount:</span>
                <span className="font-semibold">${amount}</span>
              </div>

              {/* Transaction Hash */}
              {transactionHash && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Transaction:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">{formatAddress(transactionHash)}</span>
                    <Button variant="ghost" size="icon" onClick={handleCopyHash} className="h-6 w-6">
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              )}

              {/* Charity Distribution */}
              <div className="border border-gray-200 rounded-lg">
                <Button
                  variant="ghost"
                  onClick={() => setIsCharityDropdownOpen(!isCharityDropdownOpen)}
                  className="w-full justify-between p-3"
                >
                  <span className="font-medium">Charity Distribution</span>
                  {isCharityDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {isCharityDropdownOpen && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-2">
                      {charityDistributions.map((distribution) => {
                        const charity = charities.find((c) => c.id === distribution.charityId)
                        return (
                          <div key={distribution.charityId} className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <img
                                src={charity?.logo || "/placeholder.svg"}
                                alt={charity?.name}
                                className="w-4 h-4 rounded object-contain"
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
                  className="w-full justify-between p-3"
                >
                  <span className="font-medium">Advanced</span>
                  {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {isAdvancedOpen && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Network:</span>
                        <span>Ethereum Sepolia</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contract:</span>
                        <span className="font-mono">{formatAddress(CONTRACT_ADDRESS)}</span>
                      </div>
                      {transactionHash && (
                        <div className="flex justify-between">
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
                  className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
                  onClick={() => window.open("#", "_blank")}
                >
                  <div className="w-6 h-6 rounded-full bg-yellow-400 mr-2 flex items-center justify-center">
                    <span className="text-xs font-bold">B</span>
                  </div>
                  Baldy NFT
                </Button>
              </div>

              {/* Thank You Message */}
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-green-800 leading-relaxed">
                  <span className="font-bold">VMF</span> Thanks you for your support and donation to help our partnered
                  charities <span className="font-bold">HODL</span>
                </p>
              </div>

              {/* Close Button */}
              <Button
                onClick={handleClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
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
