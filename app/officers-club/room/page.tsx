"use client"
import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useWallet } from "@/hooks/useWallet"
import { WalletConnector } from "@/components/wallet-connector"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function OfficersClubRoom() {
  const [showOnlyBar, setShowOnlyBar] = useState(false)
  const [vmfBalance, setVmfBalance] = useState<number>(0)
  const [isCheckingBalance, setIsCheckingBalance] = useState(false)
  const { walletState } = useWallet()

  // VMF Token Contract Address on Base
  const VMF_TOKEN_ADDRESS = "0x2213414893259b0c48066acd1763e7fba97859e5"
  const REQUIRED_VMF_BALANCE = 10

  // ERC20 ABI for balance checking
  const erc20Abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ]

  const checkVMFBalance = async () => {
    console.log("=== Starting VMF Balance Check ===")
    console.log("Wallet connected:", walletState.isConnected)
    console.log("Wallet address:", walletState.address)
    console.log("Provider exists:", !!walletState.provider)
    
    if (!walletState.isConnected || !walletState.address || !walletState.provider) {
      console.log("❌ Wallet not connected or missing provider")
      setVmfBalance(0)
      return
    }

    try {
      setIsCheckingBalance(true)
      console.log("✅ Wallet connected, checking VMF balance for address:", walletState.address)
      
      // Use the provider directly from walletState
      const provider = walletState.provider
      
      // Check if we're on Base network (chainId 8453)
      const chainId = await provider.request({ method: "eth_chainId" })
      console.log("🌐 Current network chainId:", chainId)
      
      if (chainId !== "0x2105") {
        console.log("⚠️ Not on Base network, attempting to switch...")
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x2105" }], // Base mainnet
          })
          console.log("✅ Successfully switched to Base network")
          // Wait a moment for the network switch to complete
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Chain not added, try to add Base Mainnet
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0x2105",
                chainName: "Base Mainnet",
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              }],
            })
            console.log("✅ Successfully added Base network")
            // Wait a moment for the network addition to complete
            await new Promise(resolve => setTimeout(resolve, 1000))
          } else {
            throw switchError
          }
        }
      }
      
      console.log("📋 Creating VMF contract instance...")
      
      // Use a simpler approach with direct provider calls
      const balanceOfData = "0x70a08231" + "000000000000000000000000" + walletState.address.slice(2)
      const decimalsData = "0x313ce567"
      
      console.log("🔍 Calling balanceOf for VMF contract...")
      const balanceResult = await provider.request({
        method: "eth_call",
        params: [{
          to: VMF_TOKEN_ADDRESS,
          data: balanceOfData
        }, "latest"]
      })
      
      console.log("💰 Raw balance result:", balanceResult)
      
      const decimalsResult = await provider.request({
        method: "eth_call",
        params: [{
          to: VMF_TOKEN_ADDRESS,
          data: decimalsData
        }, "latest"]
      })
      
      console.log("🔢 Decimals result:", decimalsResult)
      
      // Parse the results
      const balance = BigInt(balanceResult)
      const decimals = parseInt(decimalsResult.slice(-2), 16)
      
      console.log("💰 Parsed balance:", balance.toString())
      console.log("🔢 Parsed decimals:", decimals)
      
      const formattedBalance = parseFloat((balance / BigInt(10 ** decimals)).toString())
      console.log("✅ Formatted VMF balance:", formattedBalance)
      
      setVmfBalance(formattedBalance)
      console.log("=== VMF Balance Check Complete ===")
    } catch (error) {
      console.error("❌ Error checking VMF balance:", error)
      console.log("🔄 Trying fallback method...")
      
      // Fallback: Use public RPC endpoint
      try {
        const response = await fetch("https://mainnet.base.org", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [{
              to: VMF_TOKEN_ADDRESS,
              data: "0x70a08231" + "000000000000000000000000" + walletState.address.slice(2)
            }, "latest"],
            id: 1
          })
        })
        
        const data = await response.json()
        console.log("🔄 Fallback response:", data)
        
        if (data.result) {
          const balance = BigInt(data.result)
          const formattedBalance = parseFloat((balance / BigInt(10 ** 18)).toString())
          console.log("✅ Fallback VMF balance:", formattedBalance)
          setVmfBalance(formattedBalance)
        } else {
          console.error("❌ Fallback also failed")
          setVmfBalance(0)
        }
      } catch (fallbackError) {
        console.error("❌ Fallback method also failed:", fallbackError)
        setVmfBalance(0)
      }
    } finally {
      setIsCheckingBalance(false)
    }
  }

  // Check balance when wallet connects or address changes
  useEffect(() => {
    console.log("useEffect triggered - isConnected:", walletState.isConnected, "address:", walletState.address)
    if (walletState.isConnected && walletState.address) {
      console.log("Wallet connected, automatically checking VMF balance...")
      // Check balance immediately when wallet connects
      checkBalanceWithAPI()
      // Also check again after a delay to ensure it works
      setTimeout(() => {
        console.log("🔄 Delayed balance check...")
        checkBalanceWithAPI()
      }, 2000)
    } else {
      // Reset balance when wallet disconnects
      setVmfBalance(0)
    }
  }, [walletState.isConnected, walletState.address])

  const handleEnterClub = () => {
    if (vmfBalance >= REQUIRED_VMF_BALANCE) {
      setShowOnlyBar(true)
    }
  }

  const hasEnoughVMF = vmfBalance >= REQUIRED_VMF_BALANCE

  // Force refresh balance function
  const forceRefreshBalance = async () => {
    console.log("Force refreshing VMF balance...")
    await checkVMFBalance()
  }

  // Test function to verify balance checking works
  const testBalanceCheck = async () => {
    console.log("🧪 Testing balance check with known address...")
    const testAddress = "0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d"
    console.log("Test address:", testAddress)
    
    try {
      const rpcResponse = await fetch("https://mainnet.base.org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{
            to: VMF_TOKEN_ADDRESS,
            data: "0x70a08231" + "000000000000000000000000" + testAddress.slice(2)
          }, "latest"],
          id: 1
        })
      })
      
      const rpcData = await rpcResponse.json()
      console.log("🧪 Test RPC response:", rpcData)
      
      if (rpcData.result && rpcData.result !== "0x") {
        const balance = parseFloat(BigInt(rpcData.result).toString()) / Math.pow(10, 18)
        console.log("🧪 Test VMF balance:", balance)
        return balance
      }
    } catch (error) {
      console.error("🧪 Test failed:", error)
    }
    return 0
  }

  // Simple and reliable balance check
  const checkBalanceWithAPI = async () => {
    if (!walletState.address) return
    
    try {
      setIsCheckingBalance(true)
      console.log("🔍 Checking VMF balance for address:", walletState.address)
      
      // Direct RPC call to Base mainnet
      const rpcResponse = await fetch("https://mainnet.base.org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{
            to: VMF_TOKEN_ADDRESS,
            data: "0x70a08231" + "000000000000000000000000" + walletState.address.slice(2)
          }, "latest"],
          id: 1
        })
      })
      
      const rpcData = await rpcResponse.json()
      console.log("📊 RPC response:", rpcData)
      
      if (rpcData.result && rpcData.result !== "0x") {
        const balance = parseFloat(BigInt(rpcData.result).toString()) / Math.pow(10, 18)
        console.log("✅ VMF balance from RPC:", balance)
        setVmfBalance(balance)
      } else {
        console.error("❌ RPC call failed or returned invalid result")
        setVmfBalance(0)
      }
      
    } catch (error) {
      console.error("❌ Balance check failed:", error)
      setVmfBalance(0)
    } finally {
      setIsCheckingBalance(false)
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-black"
      style={{
        backgroundImage: "url(/images/secret-officers-club.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* VMF Logo in top-left corner */}
      <a
        href="/"
        className="absolute top-4 left-4 z-50"
        aria-label="Go to VMF homepage"
        style={{ display: 'inline-block' }}
      >
        <img
          src="/images/vmf-logo-new.png"
          alt="VMF Logo"
          className="w-14 h-14 md:w-20 md:h-20 drop-shadow-lg hover:scale-105 transition-transform rounded-full bg-white/80 p-1"
        />
      </a>

      {/* Overlay for darkening the image, only if overlays are visible */}
      {!showOnlyBar && <div className="absolute inset-0 bg-black/60" />}

      {/* Overlay content, hidden after button click */}
      {!showOnlyBar && (
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-yellow-300 drop-shadow-lg mb-6">Welcome to the Officers Club Bar</h1>
        <p className="text-lg sm:text-2xl text-white/90 font-medium drop-shadow mb-4 max-w-2xl">
          Grab a seat, enjoy the camaraderie, and celebrate with fellow members. This is your exclusive space to relax, connect, and unwind. Cheers to you!
        </p>

        

        
        {/* Wallet Connection Section */}
        <div className="mb-6">
          <div className="mb-4">
            <WalletConnector />
          </div>
          
          {/* Manual Balance Check Button */}
          {walletState.isConnected && (
            <div className="mb-4">
              <button
                onClick={checkBalanceWithAPI}
                disabled={isCheckingBalance}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isCheckingBalance ? "Checking VMF Balance..." : "Check VMF Balance Now"}
              </button>
            </div>
          )}
          
          {walletState.isConnected && (
            <div className="mb-4">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white font-medium">Wallet Connected</span>
              </div>
              <div className="text-white/80 text-sm mb-2">
                Address: {walletState.address}
              </div>
              <div className="text-white/80 text-sm mb-2">
                VMF Balance: {isCheckingBalance ? "Checking..." : `${vmfBalance.toFixed(2)} VMF`}
              </div>
              <div className="text-white/80 text-sm mb-2">
                Status: {hasEnoughVMF ? "✅ Eligible to Enter" : "❌ Need 10+ VMF"}
              </div>
            </div>
          )}
        </div>

        {/* Members Only Button */}
        <button
          className={`inline-block font-bold px-8 py-3 rounded-2xl text-xl shadow-lg mt-4 transition focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
            walletState.isConnected && hasEnoughVMF
              ? "bg-yellow-400/90 text-black hover:bg-yellow-300"
              : "bg-gray-500/70 text-gray-300 cursor-not-allowed"
          }`}
          onClick={handleEnterClub}
          disabled={!walletState.isConnected || !hasEnoughVMF}
        >
          {!walletState.isConnected 
            ? "Members Only" 
            : isCheckingBalance
              ? "Checking VMF Balance..."
              : !hasEnoughVMF 
                ? `Need ${REQUIRED_VMF_BALANCE} VMF (You have ${vmfBalance.toFixed(2)})` 
                : "Enter Officers Club"
          }
        </button>

        {/* Warning Message */}
        {walletState.isConnected && !hasEnoughVMF && (
          <div className="mt-4 flex items-center justify-center space-x-2 bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-3 max-w-md">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-300 text-sm">
              You need at least {REQUIRED_VMF_BALANCE} VMF tokens to enter the Officers Club
            </p>
          </div>
        )}

        {!walletState.isConnected && (
          <div className="mt-4 flex items-center justify-center space-x-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-4 py-3 max-w-md">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="text-yellow-300 text-sm">
              <p>Connect your wallet to check if you have enough VMF tokens to enter. User must own 10 VMF to enter.</p>
            </div>
          </div>
        )}

        {/* Debug Info - Remove this after fixing */}
        {walletState.isConnected && (
          <div className="mt-4 bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 max-w-md text-xs text-gray-300">
            <p>Debug Info:</p>
            <p>Connected: {walletState.isConnected ? "Yes" : "No"}</p>
            <p>Address: {walletState.address}</p>
            <p>Chain ID: {walletState.chainId}</p>
            <p>VMF Balance: {vmfBalance}</p>
            <p>Has Enough VMF: {hasEnoughVMF ? "Yes" : "No"}</p>
            <p>Required: {REQUIRED_VMF_BALANCE}</p>
            <p>Button Status: {walletState.isConnected && hasEnoughVMF ? "Should be clickable" : "Not clickable"}</p>
            <button 
              onClick={checkBalanceWithAPI}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
            >
              Force Check Balance
            </button>
            <button 
              onClick={testBalanceCheck}
              className="mt-2 ml-2 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
            >
              Test Known Address
            </button>
          </div>
        )}
        </div>
      )}

      {/* Interactive hotspots, only after Members Only is clicked */}
      {showOnlyBar && (
        <>
          {/* Slot Machine - improved border shape and effect */}
          <div
            className="absolute z-20 group"
            style={{ left: '1.5%', bottom: '10%', width: '11%', height: '60%' }}
          >
            <div className="w-full h-full transition-all duration-200 group-hover:border-8 group-hover:border-white group-hover:shadow-[0_0_32px_8px_rgba(255,255,255,0.7)] rounded-[32px]" style={{ border: '4px solid transparent' }} />
          </div>
          {/* Jukebox - improved border shape and effect */}
          <div
            className="absolute z-20 group"
            style={{ right: '3.5%', bottom: '10%', width: '12%', height: '48%' }}
          >
            <div className="w-full h-full transition-all duration-200 group-hover:border-8 group-hover:border-white group-hover:shadow-[0_0_32px_8px_rgba(255,255,255,0.7)] rounded-[40px]" style={{ border: '4px solid transparent' }} />
          </div>
          {/* TV - improved border shape and effect (adjusted position and size) */}
          <div
            className="absolute z-30 group"
            style={{ left: '54%', top: '3%', width: '23%', height: '22%', transform: 'rotate(-6deg)' }}
          >
            <div className="w-full h-full transition-all duration-200 group-hover:border-8 group-hover:border-white group-hover:shadow-[0_0_32px_8px_rgba(255,255,255,0.7)] rounded-[48px]" style={{ border: '4px solid transparent' }} />
      </div>
        </>
      )}
    </div>
  )
} 