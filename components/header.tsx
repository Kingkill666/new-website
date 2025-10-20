"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

interface HeaderProps {
  onBuyVMFClick?: () => void
}

export function Header({ onBuyVMFClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      action()
    }
  }

  return (
    <nav
      className={`border-b bg-white fixed top-0 left-0 right-0 z-50 shadow-lg transition-all duration-300 ${
        scrolled ? "border-gray-200 shadow-md" : "border-border/20"
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
              <Link href="/#how-it-works">
                <span
                  className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                  aria-label="Navigate to How It Works section"
                >
                  How It Works
                </span>
              </Link>
              <Link href="/#charities">
                <span
                  className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                  aria-label="Navigate to Our Partners section"
                >
                  Our Partners
                </span>
              </Link>
              <Link href="/#governance">
                <span
                  className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                  aria-label="Navigate to Community section"
                >
                  Community
                </span>
              </Link>
            </div>

            {/* Compact Action Buttons */}
            <div className="flex items-center space-x-3 min-w-0">
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
                onClick={onBuyVMFClick}
                aria-label="Buy VMF coins"
              >
                BUY VMF
              </Button>

              {/* Pizza Party Mini-app Button */}
              <a href="https://farcaster.xyz/miniapps/28-g7Plt7iqO/pizza-party" target="_blank" rel="noopener noreferrer">
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-1.5 text-xs shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  size="sm"
                  aria-label="Play Pizza Party Game"
                >
                  <span className="text-2xl mr-1">🍕</span>
                  <span className="relative z-10 font-extrabold tracking-wide text-sm">PLAY PIZZA PARTY</span>
                  <span className="text-2xl ml-1">🍕</span>
                </Button>
              </a>
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden mt-4 py-4 border-t border-gray-200 bg-white rounded-lg shadow-lg"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col space-y-2">
              <Link href="/#how-it-works">
                <span
                  className="text-slate-800 hover:text-blue-600 hover:bg-blue-50 font-semibold py-2 text-left text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 cursor-pointer"
                  role="menuitem"
                  aria-label="Navigate to How It Works section"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How It Works
                </span>
              </Link>
              <Link href="/#charities">
                <span
                  className="text-slate-800 hover:text-blue-600 hover:bg-blue-50 font-semibold py-2 text-left text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 cursor-pointer"
                  role="menuitem"
                  aria-label="Navigate to Our Partners section"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Our Partners
                </span>
              </Link>
              <Link href="/#governance">
                <span
                  className="text-slate-800 hover:text-blue-600 hover:bg-blue-50 font-semibold py-2 text-left text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 cursor-pointer"
                  role="menuitem"
                  aria-label="Navigate to Community section"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Community
                </span>
              </Link>

              {/* Mobile Action Buttons */}
              <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200">
                <Link href="/story">
                  <span
                    className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                    aria-label="Read our story"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Our Story
                  </span>
                </Link>
                <Link href="/socials">
                  <span
                    className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                    aria-label="Visit our Socials page"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Socials
                  </span>
                </Link>
                
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => {
                    if (onBuyVMFClick) {
                      onBuyVMFClick()
                    }
                    setIsMenuOpen(false)
                  }}
                  aria-label="Buy VMF coins"
                >
                  Buy VMF
                </Button>

                {/* Mobile Pizza Party Button */}
                <a href="https://farcaster.xyz/miniapps/28-g7Plt7iqO/pizza-party" target="_blank" rel="noopener noreferrer">
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    size="sm"
                    aria-label="Play Pizza Party Game"
                  >
                    <span className="text-3xl mr-2">🍕</span>
                    <span className="relative z-10 font-extrabold tracking-wide text-lg">PLAY PIZZA PARTY</span>
                    <span className="text-3xl ml-2">🍕</span>
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
