"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Trophy,
  Users,
  Gamepad2,
  Music,
  Coffee,
  Phone,
  Facebook,
  Instagram,
  Linkedin,
  Crown,
  Zap,
  Dice6,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { WalletConnector } from "@/components/wallet-connector"
import { BuyVMFModal } from "@/components/buy-vmf-modal"
import Footer from "@/components/footer"

const OfficersClubPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

  const clubFeatures = [
    {
      icon: <Gamepad2 className="h-8 w-8 text-white" />,
      title: "Gaming Lounge",
      description: "Classic arcade games and modern entertainment for all ranks",
      color: "bg-blue-600",
    },
    {
      icon: <Music className="h-8 w-8 text-white" />,
      title: "Jukebox Classics",
      description: "Military anthems, classic rock, and patriotic favorites",
      color: "bg-red-600",
    },
    {
      icon: <Coffee className="h-8 w-8 text-white" />,
      title: "Officers' Bar",
      description: "Premium beverages and camaraderie in a distinguished setting",
      color: "bg-slate-700",
    },
    {
      icon: <Users className="h-8 w-8 text-white" />,
      title: "Community Hub",
      description: "Connect with fellow veterans and military families",
      color: "bg-green-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 relative">
      {/* Header Navigation (copied from index.tsx, Back to Home button removed, Socials link added, white bg) */}
      <nav
        className={`border-b backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-lg transition-all duration-300 bg-white`}
        role="navigation"
        aria-label="Main navigation"
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}
      >
        <div className="container mx-auto px-2 sm:px-4 py-2 overflow-x-hidden">
          <div className="flex items-center justify-between min-w-0">
            {/* Logo Section */}
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
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 min-w-0">
              <div className="flex items-center space-x-1 min-w-0">
                <a
                  href="/#how-it-works"
                  className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                  aria-label="Navigate to How It Works section"
                >
                  How It Works
                </a>
                <a
                  href="/#charities"
                  className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                  aria-label="Navigate to Our Partners section"
                >
                  Our Partners
                </a>
                <a
                  href="/#governance"
                  className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                  aria-label="Navigate to Community section"
                >
                  Community
                </a>
                <Link href="/socials">
                  <span
                    className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                    aria-label="Visit our Socials page"
                  >
                    Socials
                  </span>
                </Link>
                <Link href="/story">
                  <span
                    className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                    aria-label="Visit our Story page"
                  >
                    Our Story
                  </span>
                </Link>
              </div>
              <div className="flex items-center space-x-1 min-w-0">
              <Button
                  size="sm"
                  className="relative overflow-hidden text-white font-bold px-8 py-3 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 animate-gradient-shift"
                  style={{
                    background:
                      "linear-gradient(45deg, #3B82F6 0%, #EF4444 25%, #3B82F6 50%, #EF4444 75%, #3B82F6 100%)",
                    backgroundSize: "200% 200%",
                  }}
                onClick={() => setIsBuyModalOpen(true)}
                  aria-label="Buy VMF coins"
              >
                  BUY VMF
              </Button>
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
              className="lg:hidden mt-4 pb-4 border-t border-gray-200"
              role="menu"
              aria-label="Mobile navigation menu"
            >
              <div className="flex flex-col space-y-2 pt-4">
                <a
                  href="/#how-it-works"
                  className="text-slate-800 hover:text-blue-600 hover:bg-blue-50 font-semibold py-2 text-left text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3"
                  role="menuitem"
                  aria-label="Navigate to How It Works section"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How It Works
                </a>
                <a
                  href="/#charities"
                  className="text-slate-800 hover:text-blue-600 hover:bg-blue-50 font-semibold py-2 text-left text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3"
                  role="menuitem"
                  aria-label="Navigate to Our Partners section"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Our Partners
                </a>
                <a
                  href="/#governance"
                  className="text-slate-800 hover:text-blue-600 hover:bg-blue-50 font-semibold py-2 text-left text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3"
                  role="menuitem"
                  aria-label="Navigate to Community section"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Community
                </a>
                <Link href="/socials">
                  <span
                    className="text-slate-800 hover:text-blue-600 hover:bg-blue-50 font-semibold py-2 text-left text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 cursor-pointer"
                    role="menuitem"
                    aria-label="Visit our Socials page"
                    onClick={() => setIsMenuOpen(false)}
                >
                    Socials
                  </span>
                </Link>
                <Link href="/story">
                  <span
                    className="text-slate-800 hover:text-blue-600 hover:bg-blue-50 font-semibold py-2 text-left text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 cursor-pointer"
                    role="menuitem"
                    aria-label="Visit our Story page"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Our Story
                  </span>
                </Link>
                <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200">
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
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <BuyVMFModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
          {/* Twinkling Stars Background */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div
              className="w-full h-full opacity-60"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M12 12l1 1-1 1-1-1zm8 8l1 1-1 1-1-1zm16 16l1 1-1 1-1-1zm24 24l1 1-1 1-1-1zm32 32l1 1-1 1-1-1zm8-72l1 1-1 1-1-1zm16-16l1 1-1 1-1-1zm24-8l1 1-1 1-1-1zm32 8l1 1-1 1-1-1zm-72 72l1 1-1 1-1-1zm72-72l1 1-1 1-1-1zm-72 0l1 1-1 1-1-1zm0 72l1 1-1 1-1-1z'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: "100px 100px",
                animation: "twinkle 3s ease-in-out infinite alternate",
              }}
            ></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge
                variant="outline"
                className="border-yellow-400/50 text-yellow-400 px-6 py-2 text-sm font-semibold mb-6 bg-yellow-400/10 backdrop-blur-sm"
              >
                <Crown className="w-4 h-4 mr-2" />
                Coming Soon
              </Badge>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-white">
                <span className="bg-gradient-to-r from-yellow-400 via-red-400 to-blue-400 bg-clip-text text-transparent">
                  Welcome to the
                </span>
                <span className="block text-white mt-2">Officers Club</span>
              </h1>

              <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-3xl mx-auto">
                An exclusive gathering place for VMF community members. Enjoy games, music, and camaraderie in our
                distinguished virtual officers club.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/officers-club/room">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-8 py-4 text-lg font-bold shadow-lg"
                >
                  <Dice6 className="mr-2 h-5 w-5" />
                  Enter the Club
                </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/30 text-black bg-white/80 hover:bg-white px-8 py-4 text-lg font-semibold"
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  View Leaderboard
                </Button>
              </div>

              {/* Club Amenities */}
              <div className="mt-16">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-white mb-6">Club Amenities</h2>
                  <p className="text-xl text-white/70 max-w-3xl mx-auto">
                    Everything you need for a great time with fellow service members.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {clubFeatures.map((feature, index) => (
                    <Card
                      key={index}
                      className="bg-slate-800/50 border-white/10 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300 group"
                    >
                      <CardContent className="p-6 text-center">
                        <div
                          className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                        >
                          {feature.icon}
                        </div>
                        <h3 className="text-lg font-bold mb-3 text-white">{feature.title}</h3>
                        <p className="text-sm text-white/70 leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Club Image */}
        <section className="py-16 bg-slate-800">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-6">Step Inside</h2>
                <p className="text-xl text-white/70 max-w-3xl mx-auto">
                  Experience the atmosphere of a classic military officers club.
                </p>
              </div>
              <div className="relative group">
                <div className="relative bg-slate-700/50 backdrop-blur-sm rounded-3xl p-4 border border-white/10 shadow-2xl">
                  <div className="overflow-hidden rounded-2xl shadow-lg w-full h-[700px]">
                    <img
                      src="/images/secret-officers-club.jpeg"
                      alt="Secret Officers Club interior"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: 'center 70%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Coming Soon */}
        <section className="py-16 bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="bg-yellow-400/90 text-yellow-800 px-6 py-2 text-sm font-semibold mb-6">
                  <Zap className="w-4 h-4 mr-2" />
                  Coming Soon
                </Badge>
                <h2 className="text-4xl font-bold text-white mb-6">More Features on the Way</h2>
                <p className="text-xl text-white/90 mb-10 leading-relaxed">
                  We're constantly adding new features to make the Officers Club the ultimate destination.
                </p>
              </div>

              {/* Upcoming Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">Tournament Mode</h3>
                    <p className="text-white/80 leading-relaxed">
                      Compete in weekly tournaments with exclusive VMF rewards and bragging rights.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">Private Rooms</h3>
                    <p className="text-white/80 leading-relaxed">
                      Create exclusive gaming rooms for your unit, family, or close military friends.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">VIP Lounge</h3>
                    <p className="text-white/80 leading-relaxed">
                      Exclusive access for top VMF holders with premium games and special perks.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes twinkle {
          0% { opacity: 0.4; }
          100% { opacity: 0.8; }
        }
        @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient-shift { animation: gradient-shift 3s ease infinite; }
      `}</style>
    </div>
  )
}

export default OfficersClubPage
