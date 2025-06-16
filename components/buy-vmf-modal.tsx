"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { X, ChevronDown, ChevronUp, CheckCircle, Copy, Check, Minus, Plus, AlertCircle } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"

interface BuyVMFModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Charity {
  name: string
  address: string
  percentage: number
  description: string
  image: string
}

interface CharityDistribution {
  charityId: string
  percentage: number
}

const charities: Charity[] = [
  {
    name: "Patriots Promise",
    address: "0x6456879a5073038b0E57ea8E498Cb0240e949fC3",
    percentage: 16.67,
    description: "Supporting veterans and their families",
    image: "/charities/patriots-promise.png",
  },
  {
    name: "Victory For Veterans",
    address: "0x700B53ff9a58Ee257F9A2EFda3a373D391028007",
    percentage: 16.67,
    description: "Empowering veterans through support and resources",
    image: "/charities/victory-veterans.png",
  },
  {
    name: "Holy Family Village",
    address: "0xB697C8b4bCaE454d9dee1E83f73327D7a63600a1",
    percentage: 16.67,
    description: "Providing housing and support for veterans",
    image: "/charities/holy-family.png",
  },
  {
    name: "Camp Cowboy",
    address: "0x5951A4160F73b8798D68e7177dF8af6a7902e725",
    percentage: 16.67,
    description: "Supporting veterans through outdoor activities",
    image: "/charities/camp-cowboy.png",
  },
  {
    name: "Veterans In Need Project",
    address: "0xfB0EF51792c36Ae1fE6636603be199788819b67D",
    percentage: 16.67,
    description: "Helping veterans in need with essential resources",
    image: "/charities/veterans-need.png",
  },
  {
    name: "Honor HER Foundation",
    address: "0x10F01632DC709F7fA413A140739D8843b06235A1",
    percentage: 16.65,
    description: "Supporting female veterans and their families",
    image: "/charities/honor-her.png",
  }
]

const CONTRACT_ADDRESS = "0x46855ec900764Dc6c05155Af0eCe45DB004E814A"

const CONTRACT_ABI = [
  {
    type: "function",
    name: "buyVMF",
    inputs: [
      { name: "amountUSDC", type: "uint256", internalType: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "distributeToCharity",
    inputs: [
      { name: "charityAddress", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  }
]

type TransactionStatus = "pending" | "success" | "error"

export function BuyVMFModal({ isOpen, onClose }: BuyVMFModalProps) {
  const [amount, setAmount] = useState("")
  const [selectedCharities, setSelectedCharities] = useState<string[]>([])
  const [charityDistributions, setCharityDistributions] = useState<Array<{ charityId: string; percentage: number }>>([])
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>("pending")
  const [transactionHash, setTransactionHash] = useState<string>("")
  const [transactionError, setTransactionError] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [estimatedGasFees, setEstimatedGasFees] = useState("0.00")
  const { walletState, connectWallet, formatAddress, switchNetwork } = useWallet()

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
    if (selectedCharities.length > 0) {
      const equalPercentage = Math.floor(100 / selectedCharities.length)
      const remainder = 100 - equalPercentage * selectedCharities.length
      setCharityDistributions(
        selectedCharities.map((charityId, index) => ({
          charityId,
          percentage: index === 0 ? equalPercentage + remainder : equalPercentage,
        }))
      )
    } else {
      setCharityDistributions([])
    }
  }, [selectedCharities])

  const handleCharitySelect = (charityName: string) => {
    setSelectedCharities((prev) => {
      if (prev.includes(charityName)) {
        return prev.filter((id) => id !== charityName)
      }
      if (prev.length < 3) {
        return [...prev, charityName]
      }
      return prev
    })

    setCharityDistributions((prev) => {
      if (prev.some((dist) => dist.charityId === charityName)) {
        return prev.filter((dist) => dist.charityId !== charityName)
      }
      if (prev.length < 3) {
        return [...prev, { charityId: charityName, percentage: 100 / (prev.length + 1) }]
      }
      return prev
    })
  }

  const getCharityAmount = (percentage: number) => {
    return ((Number(amount) * percentage) / 100).toFixed(2)
  }

  const executeSmartContract = async () => {
    if (!walletState.isConnected) {
      alert("Please connect your wallet first")
      return
    }

    if (!amount) {
      alert("Please enter an amount")
      return
    }

    try {
      setTransactionStatus("pending")
      setTransactionHash("")
      setTransactionError(null)

      const provider = walletState.provider
      if (!provider) {
        throw new Error("No provider available")
      }

      const signer = await new ethers.BrowserProvider(provider).getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      // Prepare all transactions
      const transactions = []
      
      // Add USDC approval transaction
      const usdcContract = new ethers.Contract(
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC contract address
        ["function approve(address spender, uint256 amount) returns (bool)"],
        signer
      )
      
      const usdcAmount = ethers.parseUnits(amount.toString(), 6) // USDC has 6 decimals
      transactions.push({
        to: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        data: usdcContract.interface.encodeFunctionData("approve", [CONTRACT_ADDRESS, usdcAmount])
      })

      // Add VMF purchase transaction
      transactions.push({
        to: CONTRACT_ADDRESS,
        data: contract.interface.encodeFunctionData("buyVMF", [usdcAmount])
      })

      // Add charity distribution transactions
      for (const distribution of charityDistributions) {
        const distributionAmount = ethers.parseUnits(
          (Number(amount) * (distribution.percentage / 100)).toFixed(6),
          6
        )
        transactions.push({
          to: CONTRACT_ADDRESS,
          data: contract.interface.encodeFunctionData("distributeToCharity", [
            distribution.charityId,
            distributionAmount
          ])
        })
      }

      // Execute batch transaction
      const tx: unknown = await provider.request({
        method: "wallet_sendCalls",
        params: [transactions]
      })

      if (typeof tx === "string") {
        setTransactionHash(tx)
        setTransactionStatus("success")
        setAmount("")
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 5000)
      } else {
        throw new Error("Invalid transaction response")
      }
    } catch (error: any) {
      console.error("Transaction error:", error)
      setTransactionError(error.message || "Transaction failed")
      setTransactionStatus("error")
    }
  }

  const handleClose = () => {
    onClose()
    setAmount("")
    setSelectedCharities([])
    setCharityDistributions([])
    setTransactionStatus("pending")
    setTransactionHash("")
    setTransactionError(null)
    setShowSuccessMessage(false)
  }

  useEffect(() => {
    const estimateGas = async () => {
      if (!walletState.isConnected || !amount) {
        setEstimatedGasFees("0.00")
        return
      }

      try {
        const provider = walletState.provider
        if (!provider) return

        const ethProvider = new ethers.BrowserProvider(provider)
        const signerForEstimation = await ethProvider.getSigner()

        const gasPrice = (await ethProvider.getFeeData()).gasPrice

        if (!gasPrice) {
          console.warn("Could not fetch gas price, using fallback.")
          setEstimatedGasFees("N/A")
          return
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerForEstimation)

        let totalGasLimit = BigInt(0)

        // Estimate gas for USDC approval
        const usdcContract = new ethers.Contract(
          "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC contract address
          ["function approve(address spender, uint256 amount) returns (bool)"],
          signerForEstimation
        )
        const usdcAmount = ethers.parseUnits(amount.toString(), 6)
        try {
          const approveGas = await usdcContract.approve.estimateGas(
            CONTRACT_ADDRESS,
            usdcAmount
          )
          totalGasLimit += approveGas
        } catch (error) {
          console.error("Error estimating USDC approval gas:", error)
          totalGasLimit += BigInt(50000)
        }

        // Estimate gas for VMF purchase
        try {
          const buyVMFGas = await contract.buyVMF.estimateGas(usdcAmount)
          totalGasLimit += buyVMFGas
        } catch (error) {
          console.error("Error estimating buyVMF gas:", error)
          totalGasLimit += BigInt(100000)
        }

        // Estimate gas for charity distributions
        for (const distribution of charityDistributions) {
          const distributionAmount = ethers.parseUnits(
            (Number(amount) * (distribution.percentage / 100)).toFixed(6),
            6
          )
          try {
            const distributeGas = await contract.distributeToCharity.estimateGas(
              distribution.charityId,
              distributionAmount
            )
            totalGasLimit += distributeGas
          } catch (error) {
            console.error("Error estimating charity distribution gas:", error)
            totalGasLimit += BigInt(80000)
          }
        }

        // Add a buffer for the batch transaction overhead
        totalGasLimit = totalGasLimit * BigInt(120) / BigInt(100)

        const estimatedEth = ethers.formatEther(totalGasLimit * gasPrice)
        setEstimatedGasFees(Number(estimatedEth).toFixed(4))

      } catch (error) {
        console.error("Failed to estimate gas:", error)
        setEstimatedGasFees("N/A")
      }
    }

    estimateGas()
  }, [walletState.isConnected, amount, charityDistributions])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buy VMF</DialogTitle>
          <DialogDescription>
            Purchase VMF tokens and support our partnered charities
          </DialogDescription>
        </DialogHeader>

        {/* Transaction Status */}
        {transactionStatus === "pending" && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Processing transaction...</span>
          </div>
        )}

        {transactionStatus === "error" && (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-600">{transactionError}</p>
          </div>
        )}

        {transactionStatus === "success" && (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-600">Transaction successful!</p>
            {transactionHash && (
              <a
                href={`https://basescan.org/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View on BaseScan
              </a>
            )}
          </div>
        )}

        {/* Buy Step */}
        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (USDC)
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="amount"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Charity Selection */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Charities (Up to 3)
            </h3>
            <div className="flex flex-wrap gap-2">
              {charities.map((charity) => (
                <Button
                  key={charity.name}
                  variant={selectedCharities.includes(charity.name) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCharitySelect(charity.name)}
                  className={`text-xs p-2 h-auto whitespace-normal focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    selectedCharities.includes(charity.name)
                      ? "bg-blue-600 text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  disabled={!selectedCharities.includes(charity.name) && selectedCharities.length >= 3}
                  aria-pressed={selectedCharities.includes(charity.name)}
                  aria-label={`${selectedCharities.includes(charity.name) ? "Deselect" : "Select"} ${charity.name}`}
                >
                  {charity.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Charity Distribution */}
          {selectedCharities.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Charity Distribution
              </h3>
              <div className="space-y-4">
                {charityDistributions.map((distribution) => {
                  const charity = charities.find((c) => c.name === distribution.charityId)
                  return (
                    <div
                      key={distribution.charityId}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={charity?.image || "/placeholder.svg"}
                          alt={`${charity?.name} logo`}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{charity?.name}</p>
                          <p className="text-sm text-gray-500">
                            {charity?.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {distribution.percentage}%
                        </p>
                        <p className="text-sm text-gray-500">
                          {getCharityAmount(distribution.percentage)} USDC
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Estimated Gas Fees */}
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>Estimated Gas Fees:</span>
            <span>{estimatedGasFees !== "N/A" ? `$${estimatedGasFees}` : "N/A"}</span>
          </div>

          {/* Buy Button */}
          <Button
            onClick={executeSmartContract}
            disabled={!amount || selectedCharities.length === 0 || transactionStatus === "pending"}
            className="w-full"
          >
            Buy VMF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
