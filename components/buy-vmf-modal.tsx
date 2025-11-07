"use client"

import type React from "react"

import { ethers } from "ethers"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, ChevronDown, ChevronUp, CheckCircle, Copy, Check, Minus, Plus, AlertCircle } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
import { formatAddress } from "@/lib/wallet-config"
import { VMF_CONTRACT_ADDRESS } from "@/lib/vmf-contract"
import { BASE_CHAIN_ID } from "@/lib/network-utils"
import { DialogFooter } from "@/components/ui/dialog"
import { calculateVMFAmount, getPriceInfo, getPriceInfoNoProvider, testContractOracle } from "@/lib/oracle-utils"
import axios from "axios"
import { useAppKit } from "@reown/appkit/react"
// Porto SDK will be imported dynamically when needed to avoid SSR/bundler issues

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

const CONTRACT_ADDRESS = VMF_CONTRACT_ADDRESS
const DEFAULT_USDC_ADDRESS = "0x833589fCD6EDb6E08f4c7C32D4f71B54Bda02913"
const DEFAULT_BASE_RPC = process.env.NEXT_PUBLIC_BASE_RPC || "https://mainnet.base.org"
const USDC_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_USDC || DEFAULT_USDC_ADDRESS
const BATCH_TRANSFER_CONTRACT =
  process.env.NEXT_PUBLIC_BATCH_TRANSFER || CONTRACT_ADDRESS
const VMF_DISTRIBUTOR_CONTRACT = process.env.NEXT_PUBLIC_VMF_DISTRIBUTOR || ""
const HAS_DEDICATED_TWO_STEP_FLOW =
  Boolean(process.env.NEXT_PUBLIC_BATCH_TRANSFER) &&
  Boolean(process.env.NEXT_PUBLIC_VMF_DISTRIBUTOR)
const VMF_DELIVERY_SIGNATURES = [
  "deliverVMF(address,uint256)",
  "distributeVMF(address,uint256)",
  "sendVMF(address,uint256)",
  "mint(address,uint256)",
]


// Add the 4 extra charities for the DONATE modal
const allCharities = [
  ...charities,
  {
    id: "magicians-on-mission",
    name: "Magicians On Mission",
    shortName: "Magicians On Mission",
    address: "0x0730d4dc43cf10A3Cd986FEE17f30cB0E75410e0",
    logo: "/images/charity-logos/Magicians-On-Mission.png",
  },
  {
    id: "april-forces",
    name: "April Forces",
    shortName: "April Forces",
    address: "0x043820c97771c570d830bb0e189778fdef5e6eeb",
    logo: "/images/charity-logos/April-Forces-logo.png",
  },
  {
    id: "little-patriots-embraced",
    name: "Little Patriots Embraced",
    shortName: "Little Patriots Embraced",
    address: "0x097701F99CC7b0Ff816C2355faC104ADdC6e27B9",
    logo: "/images/charity-logos/Little-Patriots-Embraced-logo.png",
  },
]

// Fix charityDescriptions keys to match allCharities IDs
const charityDescriptions: Record<string, string> = {
  "holy-family": "Provides Housing and Medical.",
  "patriots-promise": "Free Housing For Veterans.",
  "victory-veterans": "Mental Health For Veterans.",
  "veterans-need": "Emergency Assistance Provider.",
  "honor-her": "Homeless Women Support.",
  "camp-cowboy": "Equine Therapy For Veterans.",
  "magicians-on-mission": "Entertainment Thru Magic",
  "april-forces": "Support For Veterans And Their Families.",
  "little-patriots-embraced": "Supporting Military Children.",
}

const DONATION_BATCH_ABI = [
  {
    type: "function",
    name: "handleUSDCBatch",
    inputs: [
      { name: "amounts", type: "uint256[]", internalType: "uint256[]" },
      { name: "recipients", type: "address[]", internalType: "address[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
]

export function BuyVMFModal({ isOpen, onClose }: BuyVMFModalProps) {
  const [currentStep, setCurrentStep] = useState<"buy" | "donate" | "verify" | "success">("buy")
  const [amount, setAmount] = useState("")
  const [selectedCharities, setSelectedCharities] = useState<string[]>([])
  const [charityDistributions, setCharityDistributions] = useState<CharityDistribution[]>([])
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [isCharityDropdownOpen, setIsCharityDropdownOpen] = useState(false)
  const { connection, isConnected, disconnect, formattedAddress } = useWallet()
  const { open: openAppKit } = useAppKit()
  const [transactionHash, setTransactionHash] = useState("")
  const [donationTxHash, setDonationTxHash] = useState("")
  const [vmfAmount, setVmfAmount] = useState("")
  const [fees, setFees] = useState<string | null>(null)
  const [isEstimatingGas, setIsEstimatingGas] = useState(false)
  const [charityPool, setCharityPool] = useState("0.00")
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [needsNetworkSwitch, setNeedsNetworkSwitch] = useState(false)
  const [isOnBaseNetwork, setIsOnBaseNetwork] = useState(false)
  const [priceInfo, setPriceInfo] = useState<{price: number, source: string} | null>(null)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [hasPromptedConnect, setHasPromptedConnect] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || process.env.NODE_ENV === "production") {
      return
    }

    const debugApi = {
      setStep: (step: typeof currentStep) => setCurrentStep(step),
      setHashes: (hashes: { donationTx?: string; vmfTx?: string }) => {
        if (typeof hashes.donationTx === "string") {
          setDonationTxHash(hashes.donationTx)
        }
        if (typeof hashes.vmfTx === "string") {
          setTransactionHash(hashes.vmfTx)
        }
      },
      reset: () => {
        setDonationTxHash("")
        setTransactionHash("")
      },
    }

    ;(window as typeof window & { __VMF_BUY_MODAL_DEBUG__?: typeof debugApi }).__VMF_BUY_MODAL_DEBUG__ = debugApi

    return () => {
      if (
        (window as typeof window & { __VMF_BUY_MODAL_DEBUG__?: typeof debugApi }).__VMF_BUY_MODAL_DEBUG__ ===
        debugApi
      ) {
        delete (window as typeof window & { __VMF_BUY_MODAL_DEBUG__?: typeof debugApi }).__VMF_BUY_MODAL_DEBUG__
      }
    }
  }, [])

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

  // Prompt Reown WalletKit as soon as the modal opens
  useEffect(() => {
    if (!isOpen) {
      setHasPromptedConnect(false)
      return
    }

    if (!isConnected && !hasPromptedConnect) {
      setHasPromptedConnect(true)
      openAppKit({ view: "Connect" }).catch(() => {
        // Allow retries if the user dismisses the modal without connecting
        setHasPromptedConnect(false)
      })
    }
  }, [hasPromptedConnect, isConnected, isOpen, openAppKit])

  // Check network status
  useEffect(() => {
    const checkNetworkStatus = () => {
      if (isConnected && connection?.chainId === BASE_CHAIN_ID) {
        setIsOnBaseNetwork(true)
        setNeedsNetworkSwitch(false)
      } else if (isConnected && connection?.chainId !== BASE_CHAIN_ID) {
        setIsOnBaseNetwork(false)
        setNeedsNetworkSwitch(true)
      } else {
        setIsOnBaseNetwork(false)
        setNeedsNetworkSwitch(false)
      }
    }

    checkNetworkStatus()
  }, [isConnected, connection?.chainId])

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

  // Load price info with 10-second polling
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    async function loadPriceInfo() {
      console.log("🔄 Loading price info...");
      setIsLoadingPrice(true)
      try {
        let info;
        if (isConnected) {
          const provider = new ethers.JsonRpcProvider(DEFAULT_BASE_RPC)
          info = await getPriceInfo(provider)
          console.log("✅ Got price from RPC provider:", info)
        } else {
          info = await getPriceInfoNoProvider()
          console.log("✅ Got price from external sources:", info)
        }
        setPriceInfo(info)
      } catch (error) {
        console.error("❌ Failed to load price info:", error)
        setPriceInfo({ price: 1, source: "Fallback" })
      } finally {
        setIsLoadingPrice(false)
      }
    }

    // Load immediately
    loadPriceInfo()

    // Set up polling every 10 seconds
    intervalId = setInterval(loadPriceInfo, 10000)

    // Cleanup interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isConnected, connection?.chainId])

  // Function to switch to Base network
  const switchToBaseNetwork = async () => {
    if (!window.ethereum) {
      alert("❌ No wallet detected! Please install a Web3 wallet like MetaMask or Coinbase Wallet.");
      return;
    }

    try {
      console.log("🔄 Attempting to switch to Base network...");
      
      // Try to switch to Base network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2105" }],
      });
      console.log("✅ Successfully switched to Base network");
      
      // Show success message
      alert("✅ Successfully switched to Base network! You can now use VMF features.");
      
    } catch (switchError: any) {
      console.log("⚠️ Switch failed, trying to add Base network...");
      
      if (switchError.code === 4902) {
        // Chain not added, try to add Base
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x2105",
              chainName: "Base",
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://mainnet.base.org"],
              blockExplorerUrls: ["https://basescan.org"],
            }],
          });
          console.log("✅ Successfully added Base network");
          alert("✅ Successfully added Base network! You can now use VMF features.");
        } catch (addError) {
          console.error("❌ Failed to add Base network:", addError);
          alert("❌ Failed to add Base network. Please manually add it to your wallet:\n\nNetwork Name: Base\nRPC URL: https://mainnet.base.org\nChain ID: 8453\nCurrency Symbol: ETH\nBlock Explorer: https://basescan.org");
        }
      } else {
        console.error("❌ Failed to switch to Base network:", switchError);
        alert("❌ Failed to switch to Base network. Please manually switch to Base in your wallet to use VMF features.");
      }
    }
  }

  // Calculate VMF amount based on current price (Uniswap or oracle)
  useEffect(() => {
    if (!amount || !priceInfo) {
      setVmfAmount("0")
      return
    }

    let cancelled = false

    async function recompute() {
      try {
        if (priceInfo.price > 0) {
          const provider = new ethers.JsonRpcProvider(DEFAULT_BASE_RPC)
          const nextAmount = await calculateVMFAmount(Number(amount), provider)
          if (!cancelled) {
            setVmfAmount(nextAmount.toFixed(4))
          }
        } else if (!cancelled) {
          setVmfAmount(Number(amount).toFixed(4))
        }
        if (!cancelled) {
          setCharityPool(amount)
        }
      } catch (error) {
        console.error("Failed to calculate VMF amount:", error)
        if (!cancelled) {
          const fallback =
            priceInfo?.price && priceInfo.price > 0 ? Number(amount) / priceInfo.price : Number(amount)
          setVmfAmount(fallback.toFixed(4))
          setCharityPool(amount)
        }
      }
    }

    recompute()
    return () => {
      cancelled = true
    }
  }, [amount, priceInfo])

  useEffect(() => {
    if (isConnected && connection) {
      setNeedsNetworkSwitch(connection.chainId !== BASE_CHAIN_ID)
    }
  }, [connection?.chainId, isConnected])

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

  // Estimate gas fees using public RPC data only (avoids wallet popups)
  useEffect(() => {
    const readyForEstimate = isConnected && amount && Number(amount) > 0 && charityDistributions.length > 0
    if (!readyForEstimate) {
      setFees(null)
      return
    }

    let cancelled = false
    async function estimateGasViaRpc() {
      setIsEstimatingGas(true)
      try {
        const provider = new ethers.JsonRpcProvider(DEFAULT_BASE_RPC)
        const feeData = await provider.getFeeData()
        if (!feeData.maxFeePerGas && !feeData.gasPrice) {
          setFees(null)
          return
        }

        const baseGasPriceWei = feeData.maxFeePerGas ?? feeData.gasPrice!
        const { data } = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
        const ethUsd = data?.ethereum?.usd ?? 3500

        const assumedUnits = 350000n // rough fallback for approval + batch tx
        const feeEth = Number(ethers.formatEther(baseGasPriceWei * assumedUnits))
        const feeUsd = (feeEth * ethUsd).toFixed(2)

        if (!cancelled) {
          setFees(feeUsd)
        }
      } catch (error) {
        console.warn("Gas estimate placeholder failed:", error)
        if (!cancelled) {
          setFees(null)
        }
      } finally {
        if (!cancelled) {
          setIsEstimatingGas(false)
        }
      }
    }

    estimateGasViaRpc()

    return () => {
      cancelled = true
    }
  }, [isConnected, amount, charityDistributions.length])

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
    // For now, we'll just show an alert since the simplified wallet hook doesn't support network switching
    alert("Please switch to the Base network in your wallet")
    setNeedsNetworkSwitch(false)
  }

  const handleBuyNext = async () => {
    if (amount && selectedCharities.length > 0 && isConnected && getTotalPercentage() === 100) {
      if (needsNetworkSwitch) {
        alert("Please switch to the correct network to continue")
        return
      }
      
      // CRITICAL: Verify we're on Base before proceeding
      console.log("🔍 Initial network check - wallet chainId:", connection?.chainId)
      
      if (!connection || connection.chainId !== BASE_CHAIN_ID) {
        const currentChain = connection?.chainId || 'unknown'
        console.error("❌ Wrong network detected:", currentChain)
        alert(`❌ WRONG NETWORK! You are on chain ${currentChain}. Please switch to Base (chainId ${BASE_CHAIN_ID}) to continue.`)
        return
      }
      
      console.log(`✅ Network verified: Base (${BASE_CHAIN_ID})`)
      
      // For now, skip USDC balance check since we don't have it in the new wallet system
      setCurrentStep("verify")
    }
  }

  const executeSmartContract = async () => {
    if (!isConnected || !connection?.address) {
      alert("Smart contract execution requires a connected wallet")
      return false
    }

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount before continuing.")
      return false
    }

    if (selectedCharities.length === 0) {
      alert("Please select at least one charity.")
      return false
    }

    if (getTotalPercentage() !== 100) {
      alert("Please ensure the charity allocations add up to 100%.")
      return false
    }

    setIsProcessing(true)
    setDonationTxHash("")
    setTransactionHash("")
    setCopiedHash(null)

    try {
      if (!window.ethereum) {
        alert("Please install MetaMask or another Web3 wallet to continue.")
        return false
      }

      console.log("🔍 Transaction network check - wallet chainId:", connection?.chainId)
      if (!connection || connection.chainId !== BASE_CHAIN_ID) {
        const currentChain = connection?.chainId || "unknown"
        console.error("❌ Wrong network detected:", currentChain)
        alert(`❌ WRONG NETWORK! You are on chain ${currentChain}. Please switch to Base (chainId ${BASE_CHAIN_ID}) before making any transactions.`)
        return false
      }
      console.log(`✅ Network verified: Base (${BASE_CHAIN_ID})`)

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const signerAddress = await signer.getAddress()
      const recipientAddress = connection.address
      const donationContractAddress = HAS_DEDICATED_TWO_STEP_FLOW ? BATCH_TRANSFER_CONTRACT : CONTRACT_ADDRESS

      const amounts = charityDistributions.map((dist) =>
        ethers.parseUnits(((Number(amount) * dist.percentage) / 100).toFixed(2), 6),
      )
      const resolvedRecipients = charityDistributions.map((dist) => {
        const charity = allCharities.find((c) => c.id === dist.charityId)
        return charity?.address ?? null
      })

      if (resolvedRecipients.some((addr) => !addr)) {
        alert("One or more selected charities are invalid.")
        return false
      }

      const recipients = resolvedRecipients.filter(Boolean) as string[]
      const totalUSDC = amounts.reduce((a, b) => a + b, 0n)
      if (totalUSDC === 0n) {
        alert("Donation amount must be greater than zero.")
        return false
      }

      const expectedVmfDeliveryAmountWei = (() => {
        const parsedVmf = parseFloat(vmfAmount || "0")
        if (Number.isFinite(parsedVmf) && parsedVmf > 0) {
          return ethers.parseUnits(parsedVmf.toFixed(18), 18)
        }
        const donationUsd = Number.parseFloat(amount)
        const price = priceInfo?.price && priceInfo.price > 0 ? priceInfo.price : 1
        const fallbackVmf = donationUsd / price
        if (!Number.isFinite(fallbackVmf) || fallbackVmf <= 0) {
          return 0n
        }
        return ethers.parseUnits(fallbackVmf.toFixed(18), 18)
      })()

      let vmfDeliveryCallData: string | null = null
      if (HAS_DEDICATED_TWO_STEP_FLOW) {
        if (!VMF_DISTRIBUTOR_CONTRACT) {
          throw new Error("VMF distributor contract is not configured.")
        }
        if (expectedVmfDeliveryAmountWei <= 0n) {
          throw new Error("Calculated VMF delivery amount is zero. Please enter a valid donation amount.")
        }
        const deliveryInterface = new ethers.Interface(VMF_DELIVERY_SIGNATURES.map((fn) => `function ${fn}`))
        let preparedCall: string | null = null
        for (const signature of VMF_DELIVERY_SIGNATURES) {
          const methodName = signature.slice(0, signature.indexOf("("))
          const data = deliveryInterface.encodeFunctionData(methodName, [recipientAddress, expectedVmfDeliveryAmountWei])
          try {
            await provider.call({ to: VMF_DISTRIBUTOR_CONTRACT, data, from: signerAddress })
            preparedCall = data
            break
          } catch (error) {
            console.log(`⚠️ VMF delivery method ${methodName} not available`, error)
            continue
          }
        }
        if (!preparedCall) {
          throw new Error("VMF distributor contract does not support any known delivery methods.")
        }
        vmfDeliveryCallData = preparedCall
      }

      const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)",
      ]
      const usdcContract = new ethers.Contract(USDC_TOKEN_ADDRESS, erc20Abi, signer)
      const approveTx = await usdcContract.approve(donationContractAddress, totalUSDC)
      await approveTx.wait()
      console.log("✅ USDC approval confirmed")

      const donationContract = new ethers.Contract(donationContractAddress, DONATION_BATCH_ABI, signer)
      const donationTx = await donationContract.handleUSDCBatch(amounts, recipients)
      setDonationTxHash(donationTx.hash)
      await donationTx.wait()
      console.log("✅ USDC batch transfer confirmed:", donationTx.hash)

      if (!HAS_DEDICATED_TWO_STEP_FLOW) {
        setTransactionHash(donationTx.hash)
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return true
      }

      if (!vmfDeliveryCallData || !VMF_DISTRIBUTOR_CONTRACT) {
        throw new Error("VMF distributor call data is missing.")
      }

      const vmfDeliveryTx = await signer.sendTransaction({
        to: VMF_DISTRIBUTOR_CONTRACT,
        data: vmfDeliveryCallData,
      })
      setTransactionHash(vmfDeliveryTx.hash)
      await vmfDeliveryTx.wait()
      console.log("✅ VMF delivery confirmed:", vmfDeliveryTx.hash)

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

    // CRITICAL: Double-check network before final transaction
    console.log("🔍 Checking network - wallet chainId:", connection?.chainId)
    
    // Use wallet connection state instead of creating new provider
    if (!connection || connection.chainId !== BASE_CHAIN_ID) {
      const currentChain = connection?.chainId || 'unknown'
      console.error("❌ Wrong network detected:", currentChain)
      alert(`❌ WRONG NETWORK! You are on chain ${currentChain}. Please switch to Base (chainId ${BASE_CHAIN_ID}) before confirming the transaction.`)
      return
    }
    
    console.log(`✅ Final network verification: Base (${BASE_CHAIN_ID})`)

    const success = await executeSmartContract()
    if (success) {
      setCurrentStep("success")
    }
  }

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
    setCopiedHash(hash)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  const handleWalletDisconnect = async () => {
    await disconnect()
    setHasPromptedConnect(false)
    setDonationTxHash("")
    setTransactionHash("")
    setCopiedHash(null)
  }

  const handleClose = () => {
    setCurrentStep("buy")
    setAmount("")
    setSelectedCharities([])
    setCharityDistributions([])
    setTransactionHash("")
    setDonationTxHash("")
    setCopiedHash(null)
    setHasPromptedConnect(false)
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
            <CardContent className="space-y-6 relative">
              <div id="modal-description" className="sr-only">
                Purchase VMF coins and select charities to support veterans and military families
              </div>

              {/* Network blocking overlay - only show when connected but not on Base */}
              {isConnected && !isOnBaseNetwork && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 rounded-lg flex items-center justify-center">
                  <div className="text-center p-6 bg-red-50 border-2 border-red-200 rounded-lg max-w-md">
                    <div className="mb-4">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                      <h3 className="text-lg font-bold text-red-800 mb-2">Wrong Network!</h3>
                      <p className="text-sm text-red-700 mb-4">
                        VMF requires the Base network to function properly.
                        <br />
                        Current network: ChainId {connection?.chainId}
                        <br />
                        Required: Base (ChainId {BASE_CHAIN_ID})
                      </p>
                    </div>
                    <Button
                      onClick={switchToBaseNetwork}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg"
                    >
                      🔄 Switch to Base Network
                    </Button>
                    <p className="text-xs text-red-600 mt-2">
                      This will automatically add Base to your wallet if needed.
                    </p>
                  </div>
                </div>
              )}

              {!isConnected ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" role="alert">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    <span className="font-medium text-blue-800">Connect Your Wallet</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Reown WalletKit opens automatically so you can pick Coinbase, MetaMask, Farcaster, Rainbow, or any WalletConnect wallet.
                    If you closed it, relaunch the secure WalletKit below.
                  </p>
                  <Button
                    onClick={() => openAppKit({ view: "Connect" })}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                    aria-label="Open Reown WalletKit"
                  >
                    <img src="/images/coinbase-logo.png" alt="Reown" className="h-6 w-6" />
                    Open Reown WalletKit
                  </Button>
                </div>
              ) : (
                <>
                  {/* Connected Wallet Display */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 relative" role="status" aria-live="polite">
                    {/* Disconnect X button (for all wallets) */}
                    <button
                      onClick={handleWalletDisconnect}
                      className="absolute top-3 right-3 rounded-full p-1 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400"
                      aria-label="Disconnect wallet"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="9" stroke="#16a34a" strokeWidth="2" fill="white" />
                        <path d="M7 7l6 6M13 7l-6 6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                      <span className="font-medium text-green-800">
                        {connection?.walletName}: {formattedAddress}
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      USDC Balance: Check your wallet
                    </p>
                  </div>

                  {/* USDC Balance Warning */}
                  {false && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4" role="alert">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" aria-hidden="true" />
                        <span className="font-medium text-orange-800">No USDC Balance</span>
                      </div>
                      <p className="text-sm text-orange-700 mb-3">
                        You need USDC to purchase VMF coins. Get USDC directly on Base.
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
              {needsNetworkSwitch && (
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
                  max=""
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

              {/* Price Information */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-green-800">Current VMF Price</p>
                      {!isLoadingPrice && priceInfo && priceInfo.source.includes('Live') && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          <span className="text-xs">Live</span>
                        </span>
                      )}
                    </div>
                    {isLoadingPrice ? (
                      <p className="text-xs text-green-600">Updating price...</p>
                    ) : priceInfo ? (
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-green-700">
                          ${priceInfo.price.toFixed(6)} USDC
                        </p>
                        <p className="text-xs text-green-600">
                          {priceInfo.source} • Updates every 10s
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-green-600">Price unavailable</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-800 mb-1">You'll Receive</p>
                    <p className="text-2xl font-bold text-green-700">
                      {isLoadingPrice ? "..." : vmfAmount}
                    </p>
                    <p className="text-xs text-green-600 mt-1">VMF</p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      + ${amount} USDC donated to charities
                    </p>
                  </div>
                </div>
                
              </div>

              {/* Description */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-800 leading-relaxed">
                  When you buy VMF, you get to donate an equal amount of USDC to our partnered charities!
                </p>
              </div>

              {/* Continue Button to go to DONATE modal */}
              <Button
                onClick={() => setCurrentStep("donate")}
                disabled={!isConnected || !amount || Number(amount) <= 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold disabled:opacity-50"
              >
                Continue
              </Button>

            </CardContent>
          </Card>
        )}

        {/* Donate Step */}
        {currentStep === "donate" && (
          <Card className="border-0 shadow-none flex flex-col h-[80vh]">
            <CardHeader className="relative pb-4">
              <div className="flex items-center justify-between">
                <CardTitle id="modal-title" className="text-2xl font-bold text-center flex-1">
                  DONATE
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
            <div className="flex-1 overflow-y-auto px-6">
              <div className="mb-4 text-center">
                <h2 className="text-xl font-bold mb-2">Pick Up To 3 Trusted And Verified Partnered Charities</h2>
              </div>
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {allCharities.map((charity) => {
                    const selected = selectedCharities.includes(charity.id);
                    return (
                      <button
                        key={charity.id}
                        onClick={() => handleCharitySelect(charity.id)}
                        disabled={!selected && selectedCharities.length >= 3}
                        className={`flex flex-col items-center border rounded-lg p-3 transition-colors w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${selected ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                        aria-pressed={selected}
                        aria-label={`${selected ? "Deselect" : "Select"} ${charity.shortName}`}
                      >
                        <img src={charity.logo} alt="" className="w-10 h-10 rounded object-contain mb-2" />
                        <div className="text-xs text-gray-500 text-center mb-1 min-h-[2.2em]">{charityDescriptions[charity.id]}</div>
                        <div className="font-semibold text-base text-center">{charity.shortName}</div>
                      </button>
                    );
                  })}
                </div>
                {/* Visual Breakdown of Distribution */}
                {selectedCharities.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-2">
                    <h3 className="text-base font-semibold mb-2 text-center">Your Donation Breakdown</h3>
                    <div className="space-y-2">
                      {selectedCharities.map((charityId) => {
                        const charity = allCharities.find((c) => c.id === charityId);
                        const percent = Math.floor(100 / selectedCharities.length) + (selectedCharities[0] === charityId ? 100 % selectedCharities.length : 0);
                        const amountPer = amount ? ((Number(amount) * percent) / 100).toFixed(2) : null;
                        return (
                          <div key={charityId} className="flex items-center justify-between bg-white rounded p-2 shadow-sm">
                            <div className="flex items-center gap-2">
                              <img src={charity?.logo} alt={charity?.shortName} className="w-7 h-7 rounded object-contain" />
                              <span className="font-medium text-sm">{charity?.shortName}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-blue-700 text-sm">{percent}%</span>
                              {amount && (
                                <span className="block text-xs text-gray-600">${amountPer}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Sticky Footer for selection count and continue button */}
            <div className="sticky bottom-0 left-0 right-0 bg-white pt-2 pb-4 px-6 z-10">
              <div className="flex flex-col gap-2">
                <div className="text-xs text-gray-500 mb-1">Selected: {selectedCharities.length}/3</div>
                <Button
                  onClick={() => setCurrentStep("verify")}
                  disabled={selectedCharities.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold disabled:opacity-50"
                >
                  Continue
                </Button>
              </div>
            </div>
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
                  {priceInfo && (
                    <div className="mt-2 text-xs text-gray-500">
                      Based on {priceInfo.source} price: ${priceInfo.price.toFixed(6)} USDC per VMF
                    </div>
                  )}
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
                  <span className="flex items-center gap-2 font-semibold">
                    <img src="/images/base-logo-in-blue.png" alt="Base Logo" width={24} height={24} className="object-cover" />
                    Base
                  </span>
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
                        const charity = allCharities.find((c) => c.id === distribution.charityId)
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
                        <span className="font-mono">handleUSDCBatch</span>
                      </div>
                      <div className="flex justify-between" role="listitem">
                        <span>Connected Wallet:</span>
                        <span className="font-mono">{formattedAddress}</span>
                      </div>
                      <div className="flex justify-between" role="listitem">
                        <span>Chain ID:</span>
                        <span className="font-mono">{connection?.chainId || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between" role="listitem">
                        <span>Gas Fees (Est.):</span>
                        <span className="font-mono">{isEstimatingGas ? "Estimating..." : fees ? `$${fees}` : "-"}</span>
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
                  <span className="font-medium text-gray-700">Total USDC Spent:</span>
                  <span className="font-semibold">${amount}</span>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg my-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">Transaction Breakdown:</p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div className="flex justify-between">
                      <span>VMF Tokens Received:</span>
                      <span className="font-medium">{vmfAmount} VMF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>USDC Donated to Charities:</span>
                      <span className="font-medium">${amount} USDC</span>
                    </div>
                    <div className="text-xs text-blue-600 mt-2 pt-2 border-t border-blue-200">
                      <strong>Note:</strong> Your wallet may show the VMF token value (~${(parseFloat(vmfAmount) * (priceInfo?.price || 1)).toFixed(2)}), 
                      but you actually spent ${amount} USDC total.
                    </div>
                  </div>
                </div>

                {donationTxHash && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200" role="listitem">
                    <span className="font-medium text-gray-700">USDC Donation Tx:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">{formatAddress(donationTxHash)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyHash(donationTxHash)}
                        className="h-6 w-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={copiedHash === donationTxHash ? "Transaction hash copied" : "Copy donation transaction hash"}
                      >
                        {copiedHash === donationTxHash ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                )}

                {transactionHash && (!donationTxHash || transactionHash !== donationTxHash) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200" role="listitem">
                    <span className="font-medium text-gray-700">VMF Delivery Tx:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">{formatAddress(transactionHash)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyHash(transactionHash)}
                        className="h-6 w-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={copiedHash === transactionHash ? "Transaction hash copied" : "Copy VMF transaction hash"}
                      >
                        {copiedHash === transactionHash ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
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
                        const charity = allCharities.find((c) => c.id === distribution.charityId)
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
                        <span>Base</span>
                      </div>
                      <div className="flex justify-between" role="listitem">
                        <span>Contract:</span>
                        <span className="font-mono">{formatAddress(CONTRACT_ADDRESS)}</span>
                      </div>
                      {donationTxHash && (
                        <div className="flex justify-between" role="listitem">
                          <span>USDC Tx:</span>
                          <span className="font-mono">{formatAddress(donationTxHash)}</span>
                        </div>
                      )}
                      {transactionHash && (!donationTxHash || transactionHash !== donationTxHash) && (
                        <div className="flex justify-between" role="listitem">
                          <span>VMF Tx:</span>
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
                  onClick={() => window.open("https://opensea.io/collection/original-vmfc-baldy-mascot", "_blank")}
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
