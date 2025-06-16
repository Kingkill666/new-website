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
import { useState } from "react"
import { useRouter } from "next/navigation"
import { WalletConnector } from "@/components/wallet-connector"
import { BuyVMFModal } from "@/components/buy-vmf-modal"

const OfficersClubPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)

  const handleBackToHome = () => {
    router.push("/")
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 100)
  }

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
      {/* Starry Background */}

      {/* Navigation */}
      <nav className="border-b border-border/20 bg-slate-800/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center space-x-3" aria-label="Scroll to top of page">
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/New%20VMF%20Logo-HJjs5zLNzX1i3UA7BdYWX0EPUg7eWR.png" alt="VMF Logo - Patriotic star with red and white stripes" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-white">VMF</span>
                <p className="text-xs text-red-400 hidden sm:block">Veterans & Military Families</p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6"
                onClick={() => setIsBuyModalOpen(true)}
              >
                Buy VMF
              </Button>

              <Button
                variant="outline"
                className="flex items-center space-x-2 border-white/20 text-black bg-white/80 hover:bg-white"
                onClick={handleBackToHome}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:bg-white/10"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-700">
              <div className="flex flex-col space-y-3 pt-4">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  onClick={() => setIsBuyModalOpen(true)}
                >
                  Buy VMF
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-black bg-white/80 hover:bg-white"
                  onClick={() => {
                    handleBackToHome()
                    setIsMenuOpen(false)
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>
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
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-8 py-4 text-lg font-bold shadow-lg"
                >
                  <Dice6 className="mr-2 h-5 w-5" />
                  Enter the Club
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/30 text-black bg-white/80 hover:bg-white px-8 py-4 text-lg font-semibold"
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  View Leaderboard
                </Button>
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
                  <div className="overflow-hidden rounded-2xl shadow-lg" style={{ maxHeight: "500px" }}>
                    <img
                      src="/images/secret-officers-club.jpeg"
                      alt="Secret Officers Club interior"
                      className="w-full object-cover object-top"
                      style={{ marginTop: "-150px" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-slate-900">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
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

              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white px-8 py-4 text-lg font-bold shadow-lg"
                  onClick={handleBackToHome}
                >
                  Back to Main Site
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden">
                  <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/New%20VMF%20Logo-HJjs5zLNzX1i3UA7BdYWX0EPUg7eWR.png" alt="VMF Logo - Patriotic star with red and white stripes" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-xl font-bold">Officers Club</span>
                  <p className="text-xs text-yellow-400">VMF Community Hub</p>
                </div>
              </div>
              <p className="text-gray-400 text-center md:text-left">Where Veterans Connect & Play</p>
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
              <h4 className="text-lg font-semibold mb-4">Connect With VMF</h4>
              <div className="flex space-x-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61574041978891&mibextid=wwXIfr&mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://x.com/VMFCoin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/vmfcoin?igsh=MTJtcjl3Ym1jbm9qMA%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/company/vmfcoin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://farcaster.xyz/vmfcoin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h16v2H4V4zm2 4h12v2H6V8zm1 4h10v2H7v-2zm2 4h6v2H9v-2zm3 4h2v2h-2v-2z" />
                    <path d="M5 6v12h2V8h10v10h2V6H5z" />
                    <rect x="7" y="10" width="10" height="6" fill="none" stroke="currentColor" strokeWidth="1" />
                    <path d="M8 12h8M8 14h8" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </a>
                <a
                  href="https://bsky.app/profile/vmfcoin.bsky.social"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 600 530" fill="currentColor">
                    <path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z" />
                  </svg>
                </a>
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

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes twinkle {
          0% { opacity: 0.4; }
          100% { opacity: 0.8; }
        }
      `}</style>

      {/* Click outside to close wallet options */}
      {/* Buy VMF Modal */}
      <BuyVMFModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />
    </div>
  )
}

export default OfficersClubPage
