"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Wallet, ChevronDown, ChevronUp, ExternalLink, CheckCircle, Copy, Check } from "lucide-react"

interface BuyVMFModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Charity {
  id: string
  name: string
  shortName: string
}

const charities: Charity[] = [
  { id: "holy-family", name: "Holy Family Village", shortName: "Holy Family Village" },
  { id: "patriots-promise", name: "Patriots Promise", shortName: "Patriots Promise" },
  { id: "victory-veterans", name: "Victory For Veterans", shortName: "Victory for Veterans" },
  { id: "veterans-need", name: "Veterans In Need Project", shortName: "Veterans In Need Project" },
  { id: "honor-her", name: "Honor HER Foundation", shortName: "Honor HER Foundation" },
  { id: "camp-cowboy", name: "Camp Cowboy", shortName: "Camp Cowboy" },
]

export function BuyVMFModal({ isOpen, onClose }: BuyVMFModalProps) {
  const [currentStep, setCurrentStep] = useState<"buy" | "verify" | "success">("buy")
  const [amount, setAmount] = useState("")
  const [selectedCharities, setSelectedCharities] = useState<string[]>([])
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [isCharityDropdownOpen, setIsCharityDropdownOpen] = useState(false)
  const [selectedCharityForSuccess, setSelectedCharityForSuccess] = useState("")
  const [isConnectedWallet, setIsConnectedWallet] = useState(false)
  const [transactionHash] = useState("0x1234...5678")
  const [vmfAmount, setVmfAmount] = useState("")
  const [fees] = useState("20.0")
  const [charityPool] = useState("0.50")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (amount) {
      // Calculate VMF amount based on some conversion rate
      const vmf = (Number.parseFloat(amount) * 1000).toFixed(4)
      setVmfAmount(vmf)
    }
  }, [amount])

  const handleCharitySelect = (charityId: string) => {
    if (selectedCharities.includes(charityId)) {
      setSelectedCharities(selectedCharities.filter((id) => id !== charityId))
    } else if (selectedCharities.length < 3) {
      setSelectedCharities([...selectedCharities, charityId])
    }
  }

  const handleConnectWallet = () => {
    setIsConnectedWallet(true)
  }

  const handleBuyNext = () => {
    if (amount && selectedCharities.length > 0 && isConnectedWallet) {
      setCurrentStep("verify")
    }
  }

  const handleVerifyConfirm = () => {
    setSelectedCharityForSuccess(selectedCharities[0])
    setCurrentStep("success")
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
    setIsConnectedWallet(false)
    onClose()
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
                <Badge className="bg-red-100 text-red-600 border-red-200">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  NFT
                </Badge>
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
                {isConnectedWallet ? "Wallet Connected" : "Connect Wallet"}
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

              {/* Next Button */}
              <Button
                onClick={handleBuyNext}
                disabled={!amount || selectedCharities.length === 0 || !isConnectedWallet}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
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
                <span className="font-semibold">Base</span>
              </div>

              {/* Hash */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Hash:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm">{transactionHash}</span>
                  <Button variant="ghost" size="icon" onClick={handleCopyHash} className="h-6 w-6">
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              {/* Fees */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Fees:</span>
                <span className="font-semibold">${fees}</span>
              </div>

              {/* Charity Pool */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Charity Pool:</span>
                <span className="font-semibold">${charityPool}</span>
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
                    <p className="text-sm text-gray-600">Advanced options will be displayed here.</p>
                  </div>
                )}
              </div>

              {/* Charity Dropdown */}
              <div className="border border-gray-200 rounded-lg">
                <Button
                  variant="ghost"
                  onClick={() => setIsCharityDropdownOpen(!isCharityDropdownOpen)}
                  className="w-full justify-between p-3"
                >
                  <span className="font-medium">Charity</span>
                  {isCharityDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {isCharityDropdownOpen && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-2">
                      {selectedCharities.map((charityId) => {
                        const charity = charities.find((c) => c.id === charityId)
                        return (
                          <div key={charityId} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{charity?.name}</span>
                          </div>
                        )
                      })}
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
                >
                  Cancel
                </Button>
                <Button onClick={handleVerifyConfirm} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  Confirm
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

              {/* Charity Dropdown */}
              <div className="border border-gray-200 rounded-lg">
                <Button
                  variant="ghost"
                  onClick={() => setIsCharityDropdownOpen(!isCharityDropdownOpen)}
                  className="w-full justify-between p-3"
                >
                  <span className="font-medium">Charity</span>
                  {isCharityDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {isCharityDropdownOpen && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-2">
                      {selectedCharities.map((charityId) => {
                        const charity = charities.find((c) => c.id === charityId)
                        return (
                          <div key={charityId} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{charity?.name}</span>
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
                    <p className="text-sm text-gray-600">Transaction details and advanced options.</p>
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
                  Baldy
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
