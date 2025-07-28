"use client"

import type React from "react"

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
  Crown,
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { BuyVMFModal } from "@/components/buy-vmf-modal"
import CharityGrid from "@/components/charity-grid"
import Footer from "@/components/footer"
import TradingChart from "@/components/trading-chart"
import SimpleTest from "@/components/simple-test"
import MinimalTest from "@/components/minimal-test"

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll for navigation styling
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setScrolled(scrollPosition > 50) // Reduced threshold for earlier transition
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && !(event.target as Element).closest("nav")) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [isMenuOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isBuyModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isBuyModalOpen])

  const socialLinks = [
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      url: "https://www.facebook.com/profile.php?id=61574041978891&mibextid=wwXIfr&mibextid=wwXIfr",
    },
    {
      name: "X (formerly Twitter)",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      url: "https://www.linkedin.com/company/vmfcoin/",
    },
    {
      name: "Farcaster",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
        <svg className="h-5 w-5" viewBox="0 0 600 530" fill="currentColor" aria-hidden="true">
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
      logo: "/images/charity-logos/holy-family-village-logo.png",
      website: "https://holyfamilyvillage.org",
      impact: "500+ Veterans Housed",
    },
    {
      name: "Camp Cowboy",
      description: "Equine therapy helping veterans overcome trauma and reconnect with life.",
      logo: "/images/charity-logos/camp-cowboy-logo.png",
      website: "https://campcowboy.org",
      impact: "1,200+ Lives Changed",
    },
    {
      name: "Veterans In Need Project",
      description: "Emergency assistance for Arizona veterans facing immediate hardships.",
      logo: "/images/charity-logos/veterans-in-need-logo.png",
      website: "https://veteransinneedproject.org",
      impact: "3,000+ Veterans Helped",
    },
    {
      name: "Honor HER Foundation",
      description: "Housing and services for homeless women veterans in Florida.",
      logo: "/images/charity-logos/honor-her-logo.jpeg",
      website: "https://www.honorher.org/",
      impact: "200+ Women Housed",
    },
    {
      name: "Patriots Promise",
      description: "Permanent housing solutions and comprehensive veteran support services.",
      logo: "/images/charity-logos/patriots-promise-logo.png",
      website: "https://www.patriots-promise.com/",
      impact: "800+ Veterans Served",
    },
    {
      name: "Victory For Veterans",
      description: "Suicide prevention and mental health support for veterans and first responders.",
      logo: "/images/charity-logos/victory-for-veterans-logo.jpeg",
      website: "https://victoryforveterans.org",
      impact: "24/7 Crisis Support",
    },
  ]

  const governanceFeatures = [
    {
      icon: <Vote className="h-8 w-8 text-white" />,
      title: "Proportional Voting",
      description: "Every coin equals one vote - perfect mathematical fairness regardless of holding size.",
      color: "bg-blue-600",
    },
    {
      icon: <UserCheck className="h-8 w-8 text-white" />,
      title: "Open Participation",
      description: "No minimum coin threshold required - every community member has a voice.",
      color: "bg-red-600",
    },
    {
      icon: <Gavel className="h-8 w-8 text-white" />,
      title: "Community Decisions",
      description: "Everyone can make proposals and vote, ensuring we stay true to mission.",
      color: "bg-slate-700",
    },
    {
      icon: <Scale className="h-8 w-8 text-white" />,
      title: "Vote, Be Heard",
      description: "VMF pays all voting fees for you. Your voice matters. We need your support and voice.",
      color: "bg-purple-600",
    },
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const navHeight = 80 // Increased for fixed header
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - navHeight
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      })
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      action()
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Compact Professional Navigation with High Contrast - FIXED FLOATING HEADER */}
      <nav
        className={`border-b backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-lg transition-all duration-300 ${
          scrolled ? "bg-white/98 border-gray-200 shadow-md" : "bg-white/95 border-border/20"
        }`}
        role="navigation"
        aria-label="Main navigation"
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}
      >
        <div className="container mx-auto px-2 sm:px-4 py-2 overflow-x-hidden">
          <div className="flex items-center justify-between min-w-0">
            {/* Compact Logo Section */}
            <Link href="/" aria-label="Go to home page">
              <div className="flex items-center space-x-3 cursor-pointer">
              <div className="h-16 w-16">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/New%20VMF%20Logo-HJjs5zLNzX1i3UA7BdYWX0EPUg7eWR.png"
                  alt="VMF Logo - Patriotic star with red and white stripes"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-black tracking-tight leading-none">VMF</span>
                  <span className="text-xl font-bold text-red-600 tracking-wide uppercase leading-none">
                    VETERANS & MILITARY FAMILIES
                </span>
              </div>
              </div>
            </Link>

            {/* Compact Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 min-w-0">
              <div className="flex items-center space-x-1 min-w-0">
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  onKeyDown={(e) => handleKeyDown(e, () => scrollToSection("how-it-works"))}
                  className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50"
                  aria-label="Navigate to How It Works section"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection("charities")}
                  onKeyDown={(e) => handleKeyDown(e, () => scrollToSection("charities"))}
                  className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50"
                  aria-label="Navigate to Our Partners section"
                >
                  Our Partners
                </button>
                <button
                  onClick={() => scrollToSection("governance")}
                  onKeyDown={(e) => handleKeyDown(e, () => scrollToSection("governance"))}
                  className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50"
                  aria-label="Navigate to Community section"
                >
                  Community
                </button>
              </div>

              {/* Compact Action Buttons */}
              <div className="flex items-center space-x-1 min-w-0">
                <Link href="/story">
                  <span
                    className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                    aria-label="Read our story"
                  >
                    Our Story
                  </span>
                </Link>
                <Link href="/socials">
                  <span
                    className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                    aria-label="Visit our Socials page"
                  >
                    Socials
                  </span>
                </Link>
                <Button
                  size="sm"
                  className="relative overflow-hidden text-white font-bold px-8 py-3 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  style={{
                    background:
                      "linear-gradient(45deg, #3B82F6 0%, #EF4444 25%, #3B82F6 50%, #EF4444 75%, #3B82F6 100%)",
                    backgroundSize: "200% 200%",
                    animation: "gradient-shift 3s ease infinite",
                  }}
                  onClick={() => setIsBuyModalOpen(true)}
                  aria-label="Buy VMF coins"
                >
                  BUY VMF
                </Button>

                {/* Compact Officers Club Button */}
                <Link href="/officers-club">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-1.5 text-xs shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    size="sm"
                    aria-label="Access Officers Club"
                  >
                    <Crown className="h-3 w-3 mr-1" aria-hidden="true" />
                    <span className="relative z-10 font-extrabold tracking-wide">OFFICERS CLUB</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-controls="mobile-menu"
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-slate-800 hover:bg-gray-100"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Compact Mobile Menu */}
          {isMenuOpen && (
            <div
              id="mobile-menu"
              className="lg:hidden mt-4 pb-4 border-t border-gray-200"
              role="menu"
              aria-label="Mobile navigation menu"
            >
              <div className="flex flex-col space-y-2 pt-4">
                <button
                  onClick={() => {
                    scrollToSection("how-it-works")
                    setIsMenuOpen(false)
                  }}
                  onKeyDown={(e) =>
                    handleKeyDown(e, () => {
                      scrollToSection("how-it-works")
                      setIsMenuOpen(false)
                    })
                  }
                  className="text-slate-800 hover:text-blue-600 hover:bg-blue-50 font-semibold py-2 text-left text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3"
                  role="menuitem"
                  aria-label="Navigate to How It Works section"
                >
                  How It Works
                </button>
                <button
                  onClick={() => {
                    scrollToSection("charities")
                    setIsMenuOpen(false)
                  }}
                  onKeyDown={(e) =>
                    handleKeyDown(e, () => {
                      scrollToSection("charities")
                      setIsMenuOpen(false)
                    })
                  }
                  className="text-slate-800 hover:text-blue-600 hover:bg-blue-50 font-semibold py-2 text-left text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3"
                  role="menuitem"
                  aria-label="Navigate to Our Partners section"
                >
                  Our Partners
                </button>
                <button
                  onClick={() => {
                    scrollToSection("governance")
                    setIsMenuOpen(false)
                  }}
                  onKeyDown={(e) =>
                    handleKeyDown(e, () => {
                      scrollToSection("governance")
                      setIsMenuOpen(false)
                    })
                  }
                  className="text-slate-800 hover:text-blue-600 hover:bg-blue-50 font-semibold py-2 text-left text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3"
                  role="menuitem"
                  aria-label="Navigate to Community section"
                >
                  Community
                </button>

                {/* Mobile Action Buttons */}
                <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200">
                  <Link href="/story">
                    <span
                      className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      aria-label="Read our story"
                    >
                      Our Story
                    </span>
                  </Link>
                  <Link href="/socials">
                    <span
                      className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      aria-label="Visit our Socials page"
                    >
                      Socials
                    </span>
                  </Link>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => {
                      setIsBuyModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    aria-label="Buy VMF coins"
                  >
                    Buy VMF
                  </Button>

                  {/* Mobile Officers Club Button */}
                  <Link href="/officers-club">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      size="sm"
                      aria-label="Access Officers Club"
                    >
                      <Crown className="h-4 w-4 mr-2" aria-hidden="true" />
                      <span className="relative z-10 font-extrabold tracking-wide">OFFICERS CLUB</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main id="main-content" className="pt-20">
        {/* Enhanced Hero Section - REVERTED TO ORIGINAL SIZES */}
        <section
          className="relative py-10 sm:py-20 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-red-50"
          aria-labelledby="hero-heading"
        >
          <div className="absolute inset-0" aria-hidden="true">
            <img
              src="/images/banner-vmf.jpg"
              alt=""
              className="w-full h-full object-cover"
              style={{ opacity: 0.6 }}
              role="presentation"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/90 to-red-50/80"></div>
          </div>

          <div className="container mx-auto px-2 sm:px-4 lg:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center overflow-x-hidden">
                {/* Left Column - Content - Responsive Sizing */}
                <div className="text-center lg:text-left">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-8 shadow-lg">
                    <h1 id="hero-heading" className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight break-words max-w-full">
                      <span className="text-red-600 whitespace-nowrap">Direct Dollars.</span>
                      <span className="text-blue-900 text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl block">100% Donation</span>
                      <span className="text-blue-900 text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl block">For Veterans.</span>
                    </h1>

                    <p className="text-[20px] font-bold text-black mb-6 leading-snug max-w-full mx-auto lg:mx-0 text-center lg:text-left break-words">
                      You buy. We match. You pick the charities.<br />
                      Empowering change, one transaction at a time.<br />
                      With VMF, your purchase supports Veterans.
                    </p>

                    <div className="flex justify-center mb-8">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-14 py-2 sm:px-16 sm:py-4 text-base sm:text-lg font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => setIsBuyModalOpen(true)}
                        aria-label="Buy VMF coins to support veterans"
                      >
                        Buy VMF
                      </Button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" aria-hidden="true" />
                        <span>100% Transparent</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" aria-hidden="true" />
                        <span>Veteran Verified</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" aria-hidden="true" />
                        <span>Instant Support</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Visual */}
                <div className="relative mt-8 lg:mt-0">
                  <div className="!border-0 bg-white rounded-3xl p-4 sm:p-8">
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 rounded-2xl overflow-hidden shadow-lg">
                        <img
                          src="/images/baldy-og.png"
                          alt="Baldy OG - VMF Mascot"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h2 className="text-lg sm:text-2xl font-bold text-slate-800 mb-1 sm:mb-2">Global Crowdfund for Veterans</h2>
                      <span className="block text-blue-800 bg-blue-100 rounded px-2 py-1 text-xs sm:text-base font-medium w-fit mx-auto mb-2 sm:mb-4">
                        Instant Donations. Instant Money.
                      </span>
                    </div>

                    <div className="space-y-2 sm:space-y-4" role="list" aria-label="Platform statistics">
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-green-50 rounded-lg" role="listitem">
                        <span className="text-slate-700 font-medium text-xs sm:text-base">Donation Efficiency</span>
                        <span className="text-xl sm:text-2xl font-bold text-green-600" aria-label="100 percent efficiency">
                          100%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded-lg" role="listitem">
                        <span className="text-slate-700 font-medium text-xs sm:text-base">Amount Given</span>
                        <span className="text-xl sm:text-2xl font-bold text-blue-600" aria-label="Amount given">
                          $5,400+
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 sm:p-3 bg-red-50 rounded-lg" role="listitem">
                        <span className="text-slate-700 font-medium text-xs sm:text-base">Veterans Helped</span>
                        <span className="text-xl sm:text-2xl font-bold text-red-600" aria-label="5,900 plus veterans helped">
                          5,900+
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced How It Works Section */}
        <section id="how-it-works" className="py-16 sm:py-20 bg-white" aria-labelledby="how-it-works-heading">
          <div className="container mx-auto px-2 sm:px-4 lg:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 id="how-it-works-heading" className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                  How VMF Works
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  VMF offers our platform for free to our partners. We give money to our Veterans and ask for nothing in
                  return.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-16" role="list" aria-label="How VMF works steps">
                <Card
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group focus-within:ring-2 focus-within:ring-blue-500"
                  role="listitem"
                >
                  <CardContent className="p-8 text-center">
                    <div
                      className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                      aria-hidden="true"
                    >
                      <DollarSign className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-800">1. Buy VMF Coins</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Purchase VMF coins through our secure platform. VMF matches your purchase with USDC donations.
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group focus-within:ring-2 focus-within:ring-blue-500"
                  role="listitem"
                >
                  <CardContent className="p-8 text-center">
                    <div
                      className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                      aria-hidden="true"
                    >
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-800">2. Instant Distribution</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Choose up to 3 charities to support. Our partnered charities receive 100% of their donations
                      directly.
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group focus-within:ring-2 focus-within:ring-blue-500"
                  role="listitem"
                >
                  <CardContent className="p-8 text-center">
                    <div
                      className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"
                      aria-hidden="true"
                    >
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
                <div className="grid sm:grid-cols-3 gap-8" role="list" aria-label="VMF benefits">
                  <div role="listitem">
                    <div className="text-4xl font-bold mb-2" aria-label="Zero percent. No Donation Fees. No More Middle Man Taking A Cut.">
                      0%
                    </div>
                    <div className="text-blue-100">
                      No Donation Fees.<br />
                      No More Middle Man.<br />
                      No Bureaucracy.
                    </div>
                  </div>
                  <div role="listitem">
                    <div className="text-4xl font-bold mb-2" aria-label="One hundred percent. Your Donation Goes Directly To Our Partnered Charities.">
                      100%
                    </div>
                    <div className="text-blue-100">
                      Your Donation
                      <br />
                      Goes Directly To Our
                      <br />
                      Partnered Charities.
                    </div>
                  </div>
                  <div role="listitem">
                    <div className="text-4xl font-bold mb-2" aria-label="24/7. All Transactions. All Donations. Traceable and Transparent.">
                      24/7
                    </div>
                    <div className="text-blue-100">
                      All Transactions.
                      <br />
                      All Donations.
                      <br />
                      Traceable and Transparent.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trading Chart Section */}
        <section className="py-16 sm:py-20 bg-white" aria-labelledby="trading-chart-heading">
          <div className="container mx-auto px-2 sm:px-4 lg:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                              <h2 id="trading-chart-heading" className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                VMF Coin Trading
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Track VMF coin performance and trading activity in real-time. See how your investment supports veterans.
              </p>
              </div>
              <TradingChart tokenAddress="0x2213414893259b0c48066acd1763e7fba97859e5" />
            </div>
          </div>
        </section>

        {/* Enhanced Partner Charities Section */}
        <section id="charities" className="pt-4 pb-16 sm:pt-6 sm:pb-20 bg-gray-50" aria-labelledby="charities-heading">
          <div className="container mx-auto px-2 sm:px-4 lg:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 id="charities-heading" className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                  Our Trusted Partners
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Every VMF coin purchase supports our verified organizations, putting $$$ into their hands, direct and
                  instantly.
                </p>
              </div>

              <CharityGrid />
            </div>
          </div>
        </section>

        {/* Enhanced DAO Governance Section */}
        <section
          id="governance"
          className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white relative overflow-hidden"
          aria-labelledby="governance-heading"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
            <div
              className="w-full h-full bg-repeat"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>

          <div className="container mx-auto px-2 sm:px-4 lg:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <Badge className="bg-yellow-500/20 text-yellow-400 px-6 py-3 text-sm font-semibold border border-yellow-400/30 mb-6">
                  <div className="flex items-center">
                    <Vote className="w-4 h-4 mr-3" aria-hidden="true" />
                    <div className="text-center">
                      <div>DAO Governance</div>
                      <div className="text-xs font-normal -mt-1">Coming Soon</div>
                    </div>
                  </div>
                </Badge>
                <h2 id="governance-heading" className="text-4xl sm:text-5xl font-bold mb-6">
                  Community-Driven Decisions
                </h2>
                <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed mb-8">
                  When you hold VMF, you have a voice in how we support veterans. Vote on funding, partnerships, and
                  platform improvements.
                </p>

                <a
                  href="https://vmf-governance.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 text-lg font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-md transition-colors duration-200"
                  aria-label="Join VMF Voice, Your Voice Matters. Opens in new tab"
                >
                  <div className="text-center">
                    <div>Join VMF Voice</div>
                    <div className="text-sm font-normal -mt-1">Make Proposals And Vote.</div>
                  </div>
                  <ArrowRight className="ml-4 h-8 w-8" aria-hidden="true" />
                </a>
              </div>

              <div
                className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                role="list"
                aria-label="Governance features"
              >
                {governanceFeatures.map((feature, index) => (
                  <Card
                    key={index}
                    className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300 focus-within:ring-2 focus-within:ring-yellow-500"
                    role="listitem"
                  >
                    <CardContent className="p-6 text-center">
                      <div
                        className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                        aria-hidden="true"
                      >
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-bold mb-3 text-white">{feature.title}</h3>
                      <p className="text-sm text-gray-300 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid sm:grid-cols-3 gap-8 text-center" role="list" aria-label="DAO statistics">
                <div role="listitem">
                  <div
                    className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-3"
                    aria-label="Community proposals: data pending"
                  >
                    -
                  </div>
                  <p className="text-lg text-gray-300">Community Proposals</p>
                </div>
                <div role="listitem">
                  <div
                    className="text-4xl sm:text-5xl font-bold text-blue-400 mb-3"
                    aria-label="VMF Coins Voted: data pending"
                  >
                    -
                  </div>
                  <p className="text-lg text-gray-300">VMF Coins Voted</p>
                </div>
                <div role="listitem">
                  <div
                    className="text-4xl sm:text-5xl font-bold text-red-400 mb-3"
                    aria-label="Proposals Passed: data pending"
                  >
                    -
                  </div>
                  <p className="text-lg text-gray-300">Proposals Passed</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-16 sm:py-20 bg-white" aria-labelledby="cta-heading">
          <div className="container mx-auto px-2 sm:px-4 lg:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 id="cta-heading" className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                Ready to Make a Difference?
              </h2>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                Join thousands of supporters worldwide and honor our veterans. We Want You!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => setIsBuyModalOpen(true)}
                  aria-label="Buy VMF coins to support veterans"
                >
                  Buy VMF Coins
                  <TrendingUp className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white px-10 py-4 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                  onClick={() =>
                    window.open(
                      "mailto:vmf@vmfcoin.com?subject=VMF%20Inquiry&body=Hello%20VMF%20team,%0A%0AI'm%20interested%20in%20learning%20more%20about%20your%20platform.%0A%0ARegards,",
                    )
                  }
                  aria-label="Send email to VMF team"
                >
                  Get in Touch
                  <Mail className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <Footer />

      {/* Enhanced Buy VMF Modal */}
      <BuyVMFModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />

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
