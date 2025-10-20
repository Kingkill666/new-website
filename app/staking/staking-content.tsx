"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/hooks/useWallet"
import { WalletConnector } from "@/components/wallet-connector"
import { AlertCircle, CheckCircle, TrendingUp, Lock } from "lucide-react"

export default function StakingContent() {
  const [stakeAmount, setStakeAmount] = useState("")
  const [stakingPeriod, setStakingPeriod] = useState("30") // days
  const [vmfBalance, setVmfBalance] = useState(0)
  const [isCheckingBalance, setIsCheckingBalance] = useState(false)
  const [isStaking, setIsStaking] = useState(false)
  const [stakedAmount, setStakedAmount] = useState(0)
  const [stakeHistory, setStakeHistory] = useState<any[]>([])
  
  const wallet = useWallet()

  // VMF Token Contract Address on Base
  const VMF_TOKEN_ADDRESS = "0x2213414893259b0C48066Acd1763e7fbA97859E5"

  // Check VMF balance
  const checkVMFBalance = async () => {
    if (!wallet.isConnected || !wallet.connection?.address) {
      setVmfBalance(0)
      return
    }

    try {
      setIsCheckingBalance(true)
      console.log("🔍 Checking VMF balance for staking page...")
      
      // Direct RPC call to Base mainnet
      const rpcResponse = await fetch("https://mainnet.base.org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{
            to: VMF_TOKEN_ADDRESS,
            data: "0x70a08231" + "000000000000000000000000" + wallet.connection.address.slice(2)
          }, "latest"],
          id: 1
        })
      })
      
      const rpcData = await rpcResponse.json()
      
      if (rpcData.result && rpcData.result !== "0x") {
        const balance = parseFloat(BigInt(rpcData.result).toString()) / Math.pow(10, 18)
        console.log("✅ VMF balance for staking:", balance)
        setVmfBalance(balance)
      } else {
        setVmfBalance(0)
      }
      
    } catch (error) {
      console.error("❌ Balance check failed:", error)
      setVmfBalance(0)
    } finally {
      setIsCheckingBalance(false)
    }
  }

  // Check balance when wallet connects
  useEffect(() => {
    if (wallet.isConnected && wallet.connection?.address) {
      checkVMFBalance()
    } else {
      setVmfBalance(0)
    }
  }, [wallet.isConnected, wallet.connection?.address])

  // Calculate estimated rewards
  const calculateRewards = (amount: number, period: number) => {
    const annualRate = 0.12 // 12% APY
    const dailyRate = annualRate / 365
    const totalReward = amount * dailyRate * period
    return totalReward
  }

  const estimatedRewards = stakeAmount ? calculateRewards(parseFloat(stakeAmount), parseInt(stakingPeriod)) : 0

  // Handle staking
  const handleStake = async () => {
    if (!wallet.isConnected) {
      alert("Please connect your wallet first")
      return
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert("Please enter a valid stake amount")
      return
    }

    if (parseFloat(stakeAmount) > vmfBalance) {
      alert("Insufficient VMF balance")
      return
    }

    try {
      setIsStaking(true)
      console.log("🚀 Starting staking process...")
      
      // TODO: Implement actual staking contract interaction
      // For now, simulate staking
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newStake = {
        id: Date.now(),
        amount: parseFloat(stakeAmount),
        period: parseInt(stakingPeriod),
        startDate: new Date().toISOString(),
        estimatedReward: estimatedRewards,
        status: "active"
      }
      
      setStakeHistory(prev => [newStake, ...prev])
      setStakedAmount(prev => prev + parseFloat(stakeAmount))
      setStakeAmount("")
      
      console.log("✅ Staking completed successfully")
      alert(`Successfully staked ${stakeAmount} VMF for ${stakingPeriod} days!`)
      
    } catch (error) {
      console.error("❌ Staking failed:", error)
      alert("Staking failed. Please try again.")
    } finally {
      setIsStaking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center space-x-2">
                <img
                  src="/images/vmf-logo-new.png"
                  alt="VMF Logo"
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold text-gray-900">VMF Staking</span>
              </a>
            </div>
            <WalletConnector showBalance={true} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Stake Your VMF Tokens
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Earn rewards by staking your VMF tokens. Help support veterans while growing your holdings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Staking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <span>Stake VMF Tokens</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!wallet.isConnected ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Connect your wallet to start staking VMF tokens
                    </p>
                    <WalletConnector size="lg" />
                  </div>
                ) : (
                  <>
                    {/* Balance Display */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 font-medium">Available VMF Balance:</span>
                        <span className="text-blue-900 font-bold text-lg">
                          {isCheckingBalance ? "Checking..." : `${vmfBalance.toFixed(2)} VMF`}
                        </span>
                      </div>
                    </div>

                    {/* Stake Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="stakeAmount">Amount to Stake</Label>
                      <Input
                        id="stakeAmount"
                        type="number"
                        placeholder="Enter VMF amount"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    {/* Staking Period */}
                    <div className="space-y-2">
                      <Label htmlFor="stakingPeriod">Staking Period (Days)</Label>
                      <select
                        id="stakingPeriod"
                        value={stakingPeriod}
                        onChange={(e) => setStakingPeriod(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="7">7 days (5% APY)</option>
                        <option value="30">30 days (8% APY)</option>
                        <option value="90">90 days (12% APY)</option>
                        <option value="180">180 days (15% APY)</option>
                        <option value="365">365 days (20% APY)</option>
                      </select>
                    </div>

                    {/* Estimated Rewards */}
                    {stakeAmount && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-green-700 font-medium">Estimated Rewards</span>
                        </div>
                        <div className="text-green-900 font-bold text-lg">
                          {estimatedRewards.toFixed(2)} VMF
                        </div>
                        <div className="text-green-700 text-sm">
                          Over {stakingPeriod} days
                        </div>
                      </div>
                    )}

                    {/* Stake Button */}
                    <Button
                      onClick={handleStake}
                      disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                    >
                      {isStaking ? "Staking..." : "Stake VMF"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Staking Info & History */}
          <div className="space-y-6">
            {/* Staking Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Staking Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Staked:</span>
                  <span className="font-semibold">{stakedAmount.toFixed(2)} VMF</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Stakes:</span>
                  <span className="font-semibold">{stakeHistory.filter(s => s.status === "active").length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Rewards Earned:</span>
                  <span className="font-semibold text-green-600">
                    {stakeHistory.reduce((sum, stake) => sum + (stake.estimatedReward || 0), 0).toFixed(2)} VMF
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Staking History */}
            <Card>
              <CardHeader>
                <CardTitle>Staking History</CardTitle>
              </CardHeader>
              <CardContent>
                {stakeHistory.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No staking history yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stakeHistory.map((stake) => (
                      <div key={stake.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{stake.amount} VMF</div>
                            <div className="text-sm text-gray-600">
                              {stake.period} days
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(stake.startDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm px-2 py-1 rounded ${
                              stake.status === "active" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {stake.status}
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              +{stake.estimatedReward.toFixed(2)} VMF
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Staking Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Why Stake VMF?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Earn Rewards</div>
                    <div className="text-sm text-gray-600">Get up to 20% APY on your VMF tokens</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Support Veterans</div>
                    <div className="text-sm text-gray-600">Your staked tokens help fund veteran charities</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Flexible Terms</div>
                    <div className="text-sm text-gray-600">Choose from 7 days to 1 year staking periods</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
