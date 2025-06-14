"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Heart,
  ArrowRight,
  Menu,
  X,
  Vote,
  Gavel,
  Scale,
  UserCheck,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  CheckCircle,
  TrendingUp,
  Zap,
  DollarSign,
  Eye,
  Wallet,
  Crown,
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const walletOptions = [
    {
      name: "Coinbase",
      logo: "/VMF-Start/images/coinbase-logo.png",
      id: "coinbase",
    },
    {
      name: "MetaMask",
      logo: "🦊",
      id: "metamask",
    },
    {
      name: "Phantom",
      logo: "👻",
      id: "phantom",
    },
    {
      name: "Rainbow",
      logo: "🌈",
      id: "rainbow",
    },
    {
      name: "Safe",
      logo: "🔒",
      id: "safe",
    },
  ]

  const socialLinks = [
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      url: "https://www.facebook.com/profile.php?id=61574041978891&mibextid=wwXIfr&mibextid=wwXIfr",
    },
    {
      name: "X",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      url: "https://x.com/VMFCoin",
    },
    {
      name: "Instagram",
      icon: <Instagram className="h-5 w-5" />,
      url: "https://www.instagram.com/vmfcoin?igsh=MTJtcjl3Ym1jbm9qMA%3D%3D&utm_source=qr",
    },
    { name: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, url: "https://www.linkedin.com/company/vmfcoin/" },
    {
      name: "Farcaster",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h16v2H4V4zm2 4h12v2H6V8zm1 4h10v2H7v-2zm2 4h6v2H9v-2zm3 4h2v2h-2v-2z" />
          <path d="M5 6v12h2V8h10v10h2V6H5z" />
          <rect x="7" y="10" width="10" height="6" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M8 12h8M8 14h8" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      ),
      url: "https://farcaster.xyz/vmfcoin",
    },
    {
      name: "BlueSky",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 600 530" fill="currentColor">
          <path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z" />
        </svg>
      ),
      url: "https://bsky.app/profile/vmfcoin.bsky.social",
    },
  ]

  const charities = [
    {
      name: "Holy Family Village",
      description: "Housing and support for veterans, low-income families, and homeless individuals.",
      logo: "/VMF-Start/images/charity-logos/holy-family-village-logo.png",
      website: "https://holyfamilyvillage.org",
      impact: "500+ Veterans Housed",
    },
    {
      name: "Camp Cowboy",
      description: "Equine therapy helping veterans overcome trauma and reconnect with life.",
      logo: "/VMF-Start/images/charity-logos/camp-cowboy-logo.png",
      website: "https://campcowboy.org",
      impact: "1,200+ Lives Changed",
    },
    {
      name: "Veterans In Need Project",
      description: "Emergency assistance for Arizona veterans facing immediate hardships.",
      logo: "/VMF-Start/images/charity-logos/veterans-in-need-logo.png",
      website: "https://veteransinneedproject.org",
      impact: "3,000+ Veterans Helped",
    },
    {
      name: "Honor HER Foundation",
      description: "Housing and services for homeless women veterans in Florida.",
      logo: "/VMF-Start/images/charity-logos/honor-her-logo.jpeg",
      website: "https://www.honorher.org/",
      impact: "200+ Women Housed",
    },
    {
      name: "Patriots Promise",
      description: "Permanent housing solutions and comprehensive veteran support services.",
      logo: "/VMF-Start/images/charity-logos/patriots-promise-logo.png",
      website: "https://patriotspromise.org",
      impact: "800+ Veterans Served",
    },
    {
      name: "Victory For Veterans",
      description: "Suicide prevention and mental health support for veterans and first responders.",
      logo: "/VMF-Start/images/charity-logos/victory-for-veterans-logo.jpeg",
      website: "https://victoryforveterans.org",
      impact: "24/7 Crisis Support",
    },
  ]

  const governanceFeatures = [
    {
      icon: <Vote className="h-8 w-8 text-white" />,
      title: "Proportional Voting",
      description: "Every token equals one vote - perfect mathematical fairness regardless of holding size",
      color: "bg-blue-600",
    },
    {
      icon: <UserCheck className="h-8 w-8 text-white" />,
      title: "Open Participation",
      description: "No minimum token threshold required - every community member has a voice",
      color: "bg-red-600",
    },
    {
      icon: <Gavel className="h-8 w-8 text-white" />,
      title: "Management Bodies",
      description: "Secretary Body, Executive Board, and Guardian Council ensure proper governance",
      color: "bg-slate-700",
    },
    {
      icon: <Scale className="h-8 w-8 text-white" />,
      title: "Fair Gas Costs",
      description: "VMF reimburses voting gas fees while proposers cover submission costs",
      color: "bg-purple-600",
    },
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const navHeight = 80
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - navHeight
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      })
    }
  }

  const connectWallet = async (walletId: string) => {
    setIsConnecting(true)
    try {
      let provider: any = null
      let accounts: string[] = []

      switch (walletId) {
        case "metamask":
          if (typeof window !== "undefined" && (window as any).ethereum) {
            provider = (window as any).ethereum
            accounts = await provider.request({ method: "eth_requestAccounts" })
            setConnectedWallet("MetaMask")
            setWalletAddress(accounts[0])
          } else {
            throw new Error("MetaMask not installed")
          }
          break

        case "coinbase":
          if (typeof window !== "undefined" && (window as any).ethereum?.isCoinbaseWallet) {
            provider = (window as any).ethereum
            accounts = await provider.request({ method: "eth_requestAccounts" })
            setConnectedWallet("Coinbase")
            setWalletAddress(accounts[0])
          } else {
            // Fallback to WalletLink/Coinbase Wallet SDK
            throw new Error("Coinbase Wallet not installed")
          }
          break

        case "phantom":
          if (typeof window !== "undefined" && (window as any).solana?.isPhantom) {
            const resp = await (window as any).solana.connect()
            setConnectedWallet("Phantom")
            setWalletAddress(resp.publicKey.toString())
          } else {
            throw new Error("Phantom Wallet not installed")
          }
          break

        case "rainbow":
          if (typeof window !== "undefined" && (window as any).ethereum?.isRainbow) {
            provider = (window as any).ethereum
            accounts = await provider.request({ method: "eth_requestAccounts" })
            setConnectedWallet("Rainbow")
            setWalletAddress(accounts[0])
          } else {
            throw new Error("Rainbow Wallet not installed")
          }
          break

        case "safe":
          // Safe wallet connection would typically require Safe Apps SDK
          throw new Error("Safe Wallet connection requires Safe Apps environment")

        default:
          throw new Error("Unsupported wallet")
      }

      setShowWalletOptions(false)
    } catch (error: any) {
      console.error("Wallet connection error:", error)
      alert(`Failed to connect ${walletId}: ${error.message}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setConnectedWallet(null)
    setWalletAddress(null)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Check for existing wallet connections on page load
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== "undefined") {
        // Check MetaMask
        if ((window as any).ethereum && (window as any).ethereum.selectedAddress) {
          setConnectedWallet("MetaMask")
          setWalletAddress((window as any).ethereum.selectedAddress)
        }
        // Check Phantom
        else if ((window as any).solana?.isConnected) {
          setConnectedWallet("Phantom")
          setWalletAddress((window as any).solana.publicKey?.toString())
        }
      }
    }

    checkWalletConnection()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      {/* Simplified Navigation */}
      <nav
        className="border-b border-border/10 bg-white/98 backdrop-blur-md sticky top-0 z-50 shadow-sm"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
                <img src="/VMF-Start/images/vmf-coin-logo.png" alt="VMF Coin Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-2xl font-bold text-blue-900">VMF</span>
                <p className="text-xs text-red-600 font-medium">Veterans & Military Families</p>
              </div>
            </div>

            {/* Simplified Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#how-it-works"
                className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection("how-it-works")
                }}
              >
                How It Works
              </a>
              <a
                href="#charities"
                className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection("charities")
                }}
              >
                Our Partners
              </a>
              <a
                href="#governance"
                className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection("governance")
                }}
              >
                Community
              </a>
              <div className="flex items-center space-x-3">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6">Buy VMF</Button>

                {/* Officers Club Button */}
                <Link href="/officers-club">
                  <Button
                    className="relative overflow-hidden text-white font-bold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(45deg, #3B82F6 0%, #EF4444 25%, #3B82F6 50%, #EF4444 75%, #3B82F6 100%)",
                      backgroundSize: "200% 200%",
                      animation: "gradient-shift 3s ease infinite",
                    }}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    <span className="relative z-10 font-extrabold tracking-wide">OFFICERS CLUB</span>
                  </Button>
                </Link>

                {/* Wallet Connection */}
                <div className="relative">
                  {connectedWallet ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">
                          {connectedWallet}: {walletAddress && formatAddress(walletAddress)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={disconnectWallet}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-50 font-semibold px-6"
                        onClick={() => setShowWalletOptions(!showWalletOptions)}
                        disabled={isConnecting}
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        {isConnecting ? "Connecting..." : "Connect"}
                      </Button>

                      {/* Wallet Options Dropdown */}
                      {showWalletOptions && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Connect Wallet</h3>
                            <p className="text-sm text-gray-600">Choose your preferred wallet</p>
                          </div>
                          {walletOptions.map((wallet) => (
                            <button
                              key={wallet.id}
                              onClick={() => connectWallet(wallet.id)}
                              disabled={isConnecting}
                              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                              {wallet.logo.startsWith("/") ? (
                                <img
                                  src={wallet.logo || "/placeholder.svg"}
                                  alt={`${wallet.name} logo`}
                                  className="w-6 h-6 rounded"
                                />
                              ) : (
                                <span className="text-2xl">{wallet.logo}</span>
                              )}
                              <span className="font-medium text-gray-900">{wallet.name}</span>
                              {isConnecting && (
                                <div className="ml-auto w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-100">
              <div className="flex flex-col space-y-3 pt-4">
                <a
                  href="#how-it-works"
                  className="text-slate-700 hover:text-blue-600 font-medium py-2"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("how-it-works")
                    setIsMenuOpen(false)
                  }}
                >
                  How It Works
                </a>
                <a
                  href="#charities"
                  className="text-slate-700 hover:text-blue-600 font-medium py-2"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("charities")
                    setIsMenuOpen(false)
                  }}
                >
                  Our Partners
                </a>
                <a
                  href="#governance"
                  className="text-slate-700 hover:text-blue-600 font-medium py-2"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("governance")
                    setIsMenuOpen(false)
                  }}
                >
                  Community
                </a>
                <div className="flex flex-col space-y-2 pt-2">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">Buy VMF</Button>

                  {/* Mobile Officers Club Button */}
                  <Link href="/officers-club">
                    <Button
                      className="w-full relative overflow-hidden text-white font-bold px-6 py-3 shadow-lg"
                      style={{
                        background:
                          "linear-gradient(45deg, #3B82F6 0%, #EF4444 25%, #3B82F6 50%, #EF4444 75%, #3B82F6 100%)",
                        backgroundSize: "200% 200%",
                        animation: "gradient-shift 3s ease infinite",
                      }}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      <span className="relative z-10 font-extrabold tracking-wide">OFFICERS CLUB</span>
                    </Button>
                  </Link>

                  {/* Mobile Wallet Connection */}
                  {connectedWallet ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">
                          {connectedWallet}: {walletAddress && formatAddress(walletAddress)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        onClick={disconnectWallet}
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Disconnect Wallet
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="border-red-600 text-red-600 w-full"
                        onClick={() => setShowWalletOptions(!showWalletOptions)}
                        disabled={isConnecting}
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        {isConnecting ? "Connecting..." : "Connect Wallet"}
                      </Button>

                      {/* Mobile Wallet Options */}
                      {showWalletOptions && (
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          {walletOptions.map((wallet) => (
                            <button
                              key={wallet.id}
                              onClick={() => connectWallet(wallet.id)}
                              disabled={isConnecting}
                              className="w-full flex items-center space-x-3 px-3 py-2 bg-white rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                              {wallet.logo.startsWith("/") ? (
                                <img
                                  src={wallet.logo || "/placeholder.svg"}
                                  alt={`${wallet.name} logo`}
                                  className="w-5 h-5 rounded"
                                />
                              ) : (
                                <span className="text-xl">{wallet.logo}</span>
                              )}
                              <span className="font-medium text-gray-900">{wallet.name}</span>
                              {isConnecting && (
                                <div className="ml-auto w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main id="main-content">
        {/* Modern Hero Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-red-50">
          <div className="absolute inset-0" aria-hidden="true">
            <img
              src="/VMF-Start/images/banner-vmf.jpg"
              alt=""
              className="w-full h-full object-cover"
              style={{ opacity: 0.42 }}
              role="presentation"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-white/95 to-red-50/90"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Column - Content */}
                <div className="text-center lg:text-left">
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                    <span className="text-blue-900">Honor.</span>
                    <br />
                    <span className="text-red-600">Support.</span>
                    <br />
                    <span className="text-slate-800">Empower.</span>
                  </h1>

                  <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Choose your charities. 100% of your donation reaches them with zero fees.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                    <Link href="/story">
                      <Button
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg"
                      >
                        Our Story
                      </Button>
                    </Link>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>100% Transparent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <span>Veteran Verified</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      <span>Zero Fees</span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Visual */}
                <div className="relative">
                  <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                    <div className="text-center mb-6">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
                        <img
                          src="/VMF-Start/images/baldy-og.png"
                          alt="Baldy OG - VMF Mascot"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">Token-Based Crowdfunding</h3>
                      <p className="text-slate-600">Every VMF purchase = Direct veteran support</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-slate-700 font-medium">Donation Efficiency</span>
                        <span className="text-2xl font-bold text-green-600">100%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-slate-700 font-medium">Platform Fees</span>
                        <span className="text-2xl font-bold text-blue-600">$0</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-slate-700 font-medium">Veterans Helped</span>
                        <span className="text-2xl font-bold text-red-600">5,700+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Modern Cards */}
        <section id="how-it-works" className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">How VMF Works</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Simple, transparent, and revolutionary. Here's how we're changing veteran support forever.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <DollarSign className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-800">1. Buy VMF Tokens</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Purchase VMF tokens through our secure platform. Every token bought triggers an automatic
                      donation.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-800">2. Instant Distribution</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Choose 1, 2, or 3 charities to support. 100% of your purchase goes directly to your selected
                      organizations.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Eye className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-800">3. Track Impact</h3>
                    <p className="text-slate-600 leading-relaxed">
                      See exactly where your money goes with full blockchain transparency and real-time impact tracking.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Key Benefits */}
              <div className="bg-gradient-to-r from-blue-600 to-red-600 rounded-3xl p-8 sm:p-12 text-white text-center">
                <h3 className="text-3xl font-bold mb-6">Why VMF is Different</h3>
                <div className="grid sm:grid-cols-3 gap-8">
                  <div>
                    <div className="text-4xl font-bold mb-2">0%</div>
                    <div className="text-blue-100">Platform Fees</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">100%</div>
                    <div className="text-blue-100">Your Choice, 100% Impact</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">24/7</div>
                    <div className="text-blue-100">Blockchain Tracking</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Charities - Modern Grid */}
        <section id="charities" className="py-16 sm:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">Our Trusted Partners</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Every VMF token purchase supports these verified organizations making real impact for veterans.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {charities.map((charity, index) => (
                  <Card
                    key={index}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div className="p-6 pb-4">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-md flex-shrink-0">
                            <img
                              src={charity.logo || "/placeholder.svg"}
                              alt={`${charity.name} logo`}
                              className="w-full h-full object-contain p-2"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-800 leading-tight">{charity.name}</h3>
                            <div className="text-sm text-green-600 font-semibold">{charity.impact}</div>
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">{charity.description}</p>
                      </div>
                      <div className="px-6 pb-6">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                          onClick={() => window.open(charity.website, "_blank")}
                        >
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* DAO Governance Section - Keep as is since Jesse liked it */}
        <section
          id="governance"
          className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <div
              className="w-full h-full bg-repeat"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <Badge className="bg-yellow-500/20 text-yellow-400 px-6 py-2 text-sm font-semibold border border-yellow-400/30 mb-6">
                  <Vote className="w-4 h-4 mr-2" />
                  DAO Governance
                </Badge>
                <h2 className="text-4xl sm:text-5xl font-bold mb-6">Community-Driven Decisions</h2>
                <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed mb-8">
                  Every VMF token holder has a voice in how we support veterans. Vote on funding, partnerships, and
                  platform improvements.
                </p>
                <Button
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 text-lg font-bold shadow-lg"
                  onClick={() => window.open("https://vmf-governance.vercel.app/", "_blank")}
                >
                  Join the DAO
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {governanceFeatures.map((feature, index) => (
                  <Card
                    key={index}
                    className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300"
                  >
                    <CardContent className="p-6 text-center">
                      <div
                        className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                      >
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-bold mb-3 text-white">{feature.title}</h3>
                      <p className="text-sm text-gray-300 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid sm:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-3">47</div>
                  <p className="text-lg text-gray-300">Community Proposals</p>
                </div>
                <div>
                  <div className="text-4xl sm:text-5xl font-bold text-blue-400 mb-3">2.8M</div>
                  <p className="text-lg text-gray-300">VMF Tokens Voted</p>
                </div>
                <div>
                  <div className="text-4xl sm:text-5xl font-bold text-red-400 mb-3">89%</div>
                  <p className="text-lg text-gray-300">Proposals Passed</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modern CTA Section */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">Ready to Make a Difference?</h2>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                Join thousands of supporters revolutionizing how we honor and support our veterans.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg font-semibold shadow-lg"
                >
                  Buy VMF Tokens
                  <TrendingUp className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white px-10 py-4 text-lg font-semibold"
                  onClick={() =>
                    window.open(
                      "mailto:vmf@vmfcoin.com?subject=VMF%20Inquiry&body=Hello%20VMF%20team,%0A%0AI'm%20interested%20in%20learning%20more%20about%20your%20platform.%0A%0ARegards,",
                    )
                  }
                >
                  Get in Touch
                  <Mail className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white" role="contentinfo">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  <img src="/VMF-Start/images/vmf-coin-logo.png" alt="VMF Coin Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-xl font-bold">Veterans & Military Families</span>
                </div>
              </div>
              <p className="text-gray-400 text-center md:text-left">Serving Those Who Served</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-2 mb-3">
                <Phone className="h-5 w-5 text-red-500" />
                <span className="font-bold text-red-500">VETERANS CRISIS LINE</span>
              </div>
              <p className="text-center text-gray-300 mb-1">
                Call <span className="font-bold">988</span> and Press <span className="font-bold">1</span>
              </p>
              <p className="text-center text-gray-300">
                or Text <span className="font-bold">838255</span>
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end">
              <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors"
                    aria-label={`Visit our ${social.name} page`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} Veterans & Military Families. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Click outside to close wallet options */}
      {showWalletOptions && <div className="fixed inset-0 z-40" onClick={() => setShowWalletOptions(false)} />}

      {/* CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  )
}

export default Index
