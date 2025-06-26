"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Heart,
  Target,
  Shield,
  Mail,
  ArrowRight,
  Quote,
  Clock,
  ChevronRight,
  Phone,
  Facebook,
  Instagram,
  Linkedin,
  Menu,
  X,
  Crown,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { WalletConnector } from "@/components/wallet-connector"
import { BuyVMFModal } from "@/components/buy-vmf-modal"

const StoryPage = () => {
  const [activeTab, setActiveTab] = useState("vision")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)

  const router = useRouter()

  // Michael Gray - Founder & CEO
  const michaelGray = {
      name: "Michael Gray",
      role: "Founder & CEO",
    bio: `I'm Michael Gray, a proud husband and father of two incredible kids. While I am not a Veteran myself, I come from a family of service members and hold the utmost respect for those who serve. My commitment to supporting Veterans drives my work with the VMF Coin Project 2025, where I aim to provide meaningful resources and support.

By day, I'm a grip in Hollywood (Local 80), where integrity and honesty are non-negotiable. Working unsupervised on film sets has instilled in me a steadfast commitment to doing the right thing, a principle that guides every aspect of my life. Beyond the set, I'm passionate about technology, with a decade of experience in the crypto space, which inspired the creation of VMF Coin.

When I'm not working, you'll find me camping with my family in our rooftop tent, exploring nature, or soaking in hot springs—having visited over 150 with my kids. I also help run the Ultimate Hot Springs Guide website. My family's love for adventure and my dedication to integrity fuel everything I do, from supporting Veterans to pursuing projects with purpose.`,
      image: "/images/michael-gray.png",
      linkedin: "https://x.com/VMFCoin",
  }

  const milestones = [
    {
      year: "Jan 2025",
      title: "The Vision",
      description:
        "Michael Gray recognized the inefficiencies in traditional charity donation systems and envisioned a blockchain solution.",
    },
    {
      year: "Feb 2025",
      title: "Foundation Built",
      description:
        "VMF was officially founded with the core principle of 100% donation transparency and zero fees for veteran charities.",
    },
    {
      year: "April 2025",
      title: "Partner Network",
      description: "Established partnerships with six verified veteran support organizations across the United States.",
    },
    {
      year: "May 2025",
      title: "Community Growth",
      description: "Building a strong community of supporters committed to honoring those who served our country.",
    },
    {
      year: "June 2025",
      title: "Base Batch Build Success",
      description:
        "VMF placed 2nd in the prestigious Base batch Build competition, validating our innovative approach to veteran support through blockchain technology.",
      link: "https://x.com/VMFCoin/status/1930890256888590525",
    },
    {
      year: "June 15th 2025",
      title: "VMF Launches on Base",
      description: "VMF went live on Base and the system works. Charities receive 100% of their donations and donors receive VMF.",
    },
  ]

  const values = [
    {
      title: "Honor",
      description:
        "We honor the sacrifice of our veterans by ensuring their support systems receive the full benefit of every donation, without compromise.",
      icon: <Heart className="h-6 w-6 text-white" />,
      color: "bg-red-600",
    },
    {
      title: "Transparency",
      description:
        "Every transaction is recorded on the blockchain, providing complete visibility into how donations are distributed and used.",
      icon: <Shield className="h-6 w-6 text-white" />,
      color: "bg-blue-600",
    },
    {
      title: "Impact",
      description:
        "We measure success not by profits, but by the real difference we make in the lives of veterans and their families.",
      icon: <Target className="h-6 w-6 text-white" />,
      color: "bg-slate-700",
    },
  ]

  const quotes = [
    {
      text: "I couldn't stand by and watch as bureaucracy and fees reduced the impact of people's generosity.",
      author: "Michael Gray, Founder",
    },
    {
      text: "Every veteran deserves to know their sacrifice is honored not just in words, but in actions. VMF is our action.",
      author: "Michael Gray, Founder",
    },
  ]

  const handleBackToHome = () => {
    router.push("/")
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 100)
  }

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== "undefined") {
        // Removed wallet connection check
      }
    }

    checkWalletConnection()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      {/* Modern Navigation */}
      <nav
        className="border-b border-border/20 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
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
            <div className="hidden md:flex items-center space-x-4">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6"
                onClick={() => setIsBuyModalOpen(true)}
              >
                Buy VMF
              </Button>

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

              <Button
                variant="outline"
                className="flex items-center space-x-2"
                aria-label="Go back to home page"
                onClick={handleBackToHome}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back to Home</span>
              </Button>
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
                <div className="flex flex-col space-y-2">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => setIsBuyModalOpen(true)}
                  >
                    Buy VMF
                  </Button>

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
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main id="main-content">
        {/* Hero Section with Parallax Effect */}
        <section className="relative py-20 sm:py-28 overflow-hidden">
          {/* American Flag Image Background */}
          <div className="absolute inset-0" aria-hidden="true">
            <img
              src="/images/banner-vmf.jpg"
              alt=""
              className="w-full h-full object-cover"
              style={{ opacity: 0.6 }}
              role="presentation"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/50 to-white/80"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <Badge
                  variant="outline"
                  className="border-red-600 text-red-600 px-4 py-2 text-sm font-semibold mb-6 bg-white/80 backdrop-blur-sm"
                  role="img"
                  aria-label="Our Story section"
                >
                  <Heart className="w-4 h-4 mr-2" aria-hidden="true" />
                  Our Story
                </Badge>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                  <span className="text-slate-900">Why VMF</span>
                  <span className="block text-blue-600 mt-2">Matters to Us</span>
                </h1>

                <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm">
                  <p className="text-xl text-slate-700 leading-relaxed">
                    Every great mission starts with a personal story. Here's ours—and why we're committed to
                    revolutionizing how we support those who served our country.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Navigation Tabs */}
        <section className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex overflow-x-auto scrollbar-hide space-x-8 py-4">
              <button
                onClick={() => setActiveTab("vision")}
                className={`flex items-center whitespace-nowrap px-1 py-2 border-b-2 font-medium text-lg transition-colors ${
                  activeTab === "vision"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Our Vision
              </button>
              <button
                onClick={() => setActiveTab("values")}
                className={`flex items-center whitespace-nowrap px-1 py-2 border-b-2 font-medium text-lg transition-colors ${
                  activeTab === "values"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Our Values
              </button>
              <button
                onClick={() => setActiveTab("journey")}
                className={`flex items-center whitespace-nowrap px-1 py-2 border-b-2 font-medium text-lg transition-colors ${
                  activeTab === "journey"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Our Journey
              </button>
              <button
                onClick={() => setActiveTab("memorial")}
                className={`flex items-center whitespace-nowrap px-1 py-2 border-b-2 font-medium text-lg transition-colors ${
                  activeTab === "memorial"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                In Memoriam
              </button>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        {activeTab === "vision" && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                  <div>
                    <div className="mb-8">
                      <div className="inline-flex items-center mb-4">
                        <div className="h-px w-12 bg-blue-600"></div>
                        <span className="text-blue-600 font-semibold mx-3">OUR VISION</span>
                      </div>
                      <h2 className="text-4xl font-bold text-slate-900 mb-6">The Vision Behind VMF</h2>

                      <div className="max-w-3xl mx-auto text-left mb-16">
                        <p className="text-lg mb-6 text-left">
                          One evening, while watching a military documentary and studying crypto charts, I was struck by the idea of combining these two worlds to address a critical issue: traditional donation platforms taking fees from funds meant for Veterans.
                        </p>
                        <div className="flex justify-center my-10">
                          <blockquote
                            className="bg-slate-50 border-l-4 border-blue-700 px-8 py-6 rounded-2xl shadow-lg font-serif text-xl text-slate-800 leading-tight tracking-tight max-w-2xl mx-auto relative text-center"
                            style={{ fontFamily: 'Merriweather, serif', lineHeight: '1.25', letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '1.5rem' }}
                          >
                            <span>"It really upset me watching bureaucracy and fees reduce the impact of people's donations."</span>
                            <span className="block text-base text-slate-600 font-semibold mt-4" style={{ fontFamily: 'Merriweather, serif', fontWeight: 500, letterSpacing: '-0.01em' }}>— Michael reflects</span>
                          </blockquote>
                        </div>
                        <p className="text-lg mb-6 text-left">
                          This sparked the creation of VMF, leveraging blockchain technology to ensure 100% of donations reach veteran charities with complete transparency and zero fees. Our vision is to build a transparent, efficient platform that rewards generosity and invites non-tech-savvy individuals to confidently engage with cryptocurrency, making donations easy and approachable. VMF is dedicated to maximizing support for Veterans and their families, ensuring every dollar makes a meaningful impact.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-8">
                      <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Our Promise</h3>
                        <p className="text-slate-600">100% of donations reach veteran charities, with zero fees.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 shadow-lg">
                      <div className="text-center mb-8">
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden bg-white shadow-lg">
                          <img
                            src={michaelGray.image}
                            alt="Michael Gray, Founder and CEO of VMF"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-1">{michaelGray.name}</h3>
                        <p className="text-blue-600 font-semibold mb-4">{michaelGray.role}</p>
                      </div>

                      <div className="prose prose-lg text-slate-700 max-w-none mx-auto mb-6 whitespace-pre-line">
                        {michaelGray.bio}
                        </div>

                        <div className="flex justify-center space-x-4 pt-4">
                        <a href="mailto:vmf@vmfcoin.com" aria-label="Email VMF">
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
                            Contact
                          </Button>
                        </a>
                          <a
                          href={michaelGray.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Follow VMF on X, opens in new tab"
                          >
                            <Button variant="outline" size="sm">
                              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                              X
                            </Button>
                          </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Values Section */}
        {activeTab === "values" && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center mb-4">
                    <div className="h-px w-12 bg-blue-600"></div>
                    <span className="text-blue-600 font-semibold mx-3">OUR VALUES</span>
                    <div className="h-px w-12 bg-blue-600"></div>
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 mb-6">What Drives Us</h2>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                    Our values aren't just words on a wall—they're the foundation of everything we do.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {values.map((value, index) => (
                    <div key={index} className="group">
                      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div
                          className={`w-16 h-16 ${value.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                        >
                          {value.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">{value.title}</h3>
                        <p className="text-slate-600 leading-relaxed">{value.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-16 bg-gradient-to-r from-blue-600 to-red-600 rounded-2xl p-10 text-white">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-6 md:mb-0 md:mr-10">
                      <h3 className="text-3xl font-bold mb-4">Our Commitment</h3>
                      <p className="text-white/90 text-lg leading-relaxed max-w-xl">
                        We're committed to revolutionizing how charitable giving works for veterans. Through blockchain
                        technology, we ensure complete transparency, zero fees, and direct impact for those who served
                        our country.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button
                        size="lg"
                        className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-bold"
                        onClick={() => window.open("https://vmf-governance.vercel.app/", "_blank")}
                      >
                        Join Our Mission
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Journey Section */}
        {activeTab === "journey" && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center mb-4">
                    <div className="h-px w-12 bg-blue-600"></div>
                    <span className="text-blue-600 font-semibold mx-3">OUR JOURNEY</span>
                    <div className="h-px w-12 bg-blue-600"></div>
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 mb-6">From Concept to Community</h2>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                    Here's how VMF has grown from an idea into a movement changing veteran support forever.
                  </p>
                </div>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-100"></div>

                  <div className="space-y-24">
                    {milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className={`relative flex items-center ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
                      >
                        {/* Timeline dot */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-blue-600 border-4 border-white shadow-lg"></div>

                        {/* Content card */}
                        <div className={`w-5/12 ${index % 2 === 0 ? "pr-12" : "pl-12"}`}>
                          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                            <Badge className="bg-blue-100 text-blue-800 mb-4 font-semibold">
                              <Clock className="h-4 w-4 mr-2" />
                              {milestone.year}
                            </Badge>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">{milestone.title}</h3>
                            <p className="text-slate-600 mb-4">{milestone.description}</p>
                            {milestone.link && (
                              <a
                                href={milestone.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                              >
                                View Announcement
                                <ArrowRight className="ml-1 h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-24 text-center">
                  <h3 className="text-3xl font-bold text-slate-900 mb-6">Where We're Headed</h3>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
                    Our journey is just beginning. With your support, we'll continue to expand our impact and transform
                    how we honor and support our veterans.
                  </p>
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
                    onClick={() => window.open("https://vmf-governance.vercel.app/", "_blank")}
                  >
                    Join Our Community
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* In Memoriam Section */}
        {activeTab === "memorial" && (
          <section className="py-16 relative overflow-hidden">
            {/* American Flag Background with Gradient Overlay */}
            <div className="absolute inset-0" aria-hidden="true">
              <img
                src="/images/banner-vmf.jpg"
                alt=""
                className="w-full h-full object-cover"
                style={{ opacity: 0.6 }}
                role="presentation"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-blue-900/70 to-slate-900/80"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="text-center mb-16">
                  <div className="inline-flex items-center justify-center mb-6">
                    <div
                      className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent w-24"
                      aria-hidden="true"
                    ></div>
                    <Badge
                      variant="outline"
                      className="border-white/40 text-white px-6 py-2 text-sm font-semibold mx-4 bg-white/5 backdrop-blur-sm"
                      role="img"
                      aria-label="In Memoriam section"
                    >
                      <Heart className="w-4 h-4 mr-2" aria-hidden="true" />
                      In Memoriam
                    </Badge>
                    <div
                      className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent w-24"
                      aria-hidden="true"
                    ></div>
                  </div>
                  <h2
                    id="memorial-heading"
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                  >
                    Honoring Those Who
                    <span className="block bg-gradient-to-r from-red-300 via-white to-blue-300 bg-clip-text text-transparent">
                      Came Before
                    </span>
                  </h2>
                  <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light">
                    VMF stands on the shoulders of heroes who paved the way. We honor their memory, their service, and
                    their lasting impact on our mission to support veterans and military families.
                  </p>
                </header>

                {/* Memorial Cards */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-16" role="list">
                  {/* Donald Rose Memorial */}
                  <article className="group" role="listitem">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
                      <div className="text-center">
                        {/* Photo with elegant frame */}
                        <div className="relative mb-8">
                          <div className="w-64 h-80 mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30 group-hover:border-white/50 transition-all duration-500">
                            <img
                              src="/images/memorial/donald-rose.jpeg"
                              alt="Donald Rose with his mother upon return from being a prisoner of war in Japan, 1953"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                          {/* Decorative corner elements */}
                          <div
                            className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-white/40"
                            aria-hidden="true"
                          ></div>
                          <div
                            className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-white/40"
                            aria-hidden="true"
                          ></div>
                          <div
                            className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-white/40"
                            aria-hidden="true"
                          ></div>
                          <div
                            className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-white/40"
                            aria-hidden="true"
                          ></div>
                        </div>

                        {/* Name and Title */}
                        <div className="mb-6">
                          <h3 className="text-3xl font-bold text-white mb-2 tracking-wide">Donald Rose</h3>
                          <div className="flex items-center justify-center space-x-2 mb-4">
                            <div
                              className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent w-16"
                              aria-hidden="true"
                            ></div>
                            <p className="text-blue-200 font-semibold text-lg px-4 py-1 bg-blue-500/20 rounded-full border border-blue-300/30">
                              Beloved Grandpa & POW Hero
                            </p>
                            <div
                              className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent w-16"
                              aria-hidden="true"
                            ></div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="text-white/90 leading-relaxed space-y-4 text-lg">
                          <p>
                            Donald Rose served his country with honor and distinction, embodying the values of duty,
                            courage, and sacrifice that inspire VMF's mission today.
                          </p>
                          <p>
                            His dedication to family and service continues to guide our commitment to ensuring every
                            veteran receives the support and recognition they deserve.
                          </p>
                          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                            <blockquote className="italic text-blue-200 font-medium">
                              "His legacy lives on in every donation that reaches a veteran in need."
                            </blockquote>
                          </div>
                        </div>

                        {/* Memorial footer */}
                        <div className="mt-8 pt-6 border-t border-white/20">
                          <p className="text-white/60 font-medium tracking-wider uppercase text-sm">
                            Forever in our hearts
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>

                  {/* Don Gray Memorial */}
                  <article className="group" role="listitem">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
                      <div className="text-center">
                        {/* Photo with elegant frame */}
                        <div className="relative mb-8">
                          <div className="w-64 h-80 mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30 group-hover:border-white/50 transition-all duration-500">
                            <img
                              src="/images/memorial/donald-j-gray-navy.jpeg"
                              alt="Donald J. Gray in United States Navy uniform"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                          {/* Decorative corner elements */}
                          <div
                            className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-white/40"
                            aria-hidden="true"
                          ></div>
                          <div
                            className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-white/40"
                            aria-hidden="true"
                          ></div>
                          <div
                            className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-white/40"
                            aria-hidden="true"
                          ></div>
                          <div
                            className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-white/40"
                            aria-hidden="true"
                          ></div>
                        </div>

                        {/* Name and Title */}
                        <div className="mb-6">
                          <h3 className="text-3xl font-bold text-white mb-2 tracking-wide">Don Gray</h3>
                          <div className="flex items-center justify-center space-x-2 mb-4">
                            <div
                              className="h-px bg-gradient-to-r from-transparent via-red-300 to-transparent w-16"
                              aria-hidden="true"
                            ></div>
                            <p className="text-red-200 font-semibold text-lg px-4 py-1 bg-red-500/20 rounded-full border border-red-300/30">
                              Cherished Grandpa & Veteran
                            </p>
                            <div
                              className="h-px bg-gradient-to-r from-transparent via-red-300 to-transparent w-16"
                              aria-hidden="true"
                            ></div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="text-white/90 leading-relaxed space-y-4 text-lg">
                          <p>
                            Don Gray's unwavering commitment to family and community laid the foundation for the values
                            that drive VMF's mission to support our nation's heroes.
                          </p>
                          <p>
                            His spirit of service and compassion for others continues to inspire our work in
                            revolutionizing charitable giving for veterans and military families.
                          </p>
                          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                            <blockquote className="italic text-red-200 font-medium">
                              "His memory fuels our passion to honor those who served."
                            </blockquote>
                          </div>
                        </div>

                        {/* Memorial footer */}
                        <div className="mt-8 pt-6 border-t border-white/20">
                          <p className="text-white/60 font-medium tracking-wider uppercase text-sm">
                            Always remembered
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>

                {/* Memorial Quote */}
                <div className="text-center mb-16">
                  <div className="max-w-5xl mx-auto">
                    <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/20 shadow-2xl">
                      <div className="mb-6">
                        <div
                          className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                          aria-hidden="true"
                        >
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                          </svg>
                        </div>
                      </div>
                      <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-light italic text-white mb-8 leading-relaxed">
                        "We carry forward their legacy of service, ensuring that their sacrifice and the sacrifice of
                        all veterans is never forgotten. Every VMF Coin purchased honors their memory and supports
                        those who continue to serve."
                      </blockquote>
                      <cite className="text-yellow-300 font-semibold text-xl">— The VMF Family</cite>
                    </div>
                  </div>
                </div>

                {/* Legacy Values */}
                <div className="text-center">
                  <h3 className="text-3xl sm:text-4xl font-bold text-white mb-12">Their Legacy Lives On</h3>
                  <div className="grid sm:grid-cols-3 gap-8 lg:gap-12" role="list">
                    <div className="group text-center" role="listitem">
                      <div className="relative mb-6">
                        <div
                          className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300"
                          aria-hidden="true"
                        >
                          <Shield className="h-10 w-10 text-white" />
                        </div>
                        <div
                          className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"
                          aria-hidden="true"
                        ></div>
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-4">Service</h4>
                      <p className="text-white/80 leading-relaxed">
                        Their dedication to serving others guides our mission to serve veterans and military families.
                      </p>
                    </div>
                    <div className="group text-center" role="listitem">
                      <div className="relative mb-6">
                        <div
                          className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300"
                          aria-hidden="true"
                        >
                          <Heart className="h-10 w-10 text-white" />
                        </div>
                        <div
                          className="absolute inset-0 bg-red-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"
                          aria-hidden="true"
                        ></div>
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-4">Family</h4>
                      <p className="text-white/80 leading-relaxed">
                        Their love for family inspires our commitment to supporting military families everywhere.
                      </p>
                    </div>
                    <div className="group text-center" role="listitem">
                      <div className="relative mb-6">
                        <div
                          className="w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300"
                          aria-hidden="true"
                        >
                          <Target className="h-10 w-10 text-white" />
                        </div>
                        <div
                          className="absolute inset-0 bg-slate-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"
                          aria-hidden="true"
                        ></div>
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-4">Purpose</h4>
                      <p className="text-white/80 leading-relaxed">
                        Their sense of purpose drives our determination to make a meaningful difference.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-red-50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">Join Our Mission</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                VMF is more than a Coin—it's a community of people who believe our veterans deserve better. Join us in
                revolutionizing how we support those who served.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold"
                  onClick={() => setIsBuyModalOpen(true)}
                  aria-label="Purchase VMF Coins"
                >
                  Buy VMF Coins
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 text-lg font-semibold"
                  aria-label="Learn more about VMF"
                  onClick={handleBackToHome}
                >
                  Back to Home
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
                  <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/New%20VMF%20Logo-HJjs5zLNzX1i3UA7BdYWX0EPUg7eWR.png" alt="VMF Logo - Patriotic star with red and white stripes" className="w-full h-full object-contain" />
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
                Call <a href="tel:988" className="font-bold underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded hover:text-red-400">988</a> and Press <span className="font-bold">1</span>
              </p>
              <p className="text-center text-gray-300">
                or Text <a href="sms:838255" className="font-bold underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded hover:text-red-400">838255</a>
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end">
              <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61574041978891&mibextid=wwXIfr&mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors"
                  aria-label="Visit our Facebook page"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://x.com/VMFCoin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors"
                  aria-label="Visit our X page"
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
                  aria-label="Visit our Instagram page"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/company/vmfcoin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors"
                  aria-label="Visit our LinkedIn page"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://farcaster.xyz/vmfcoin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors"
                  aria-label="Visit our Farcaster page"
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
                  aria-label="Visit our BlueSky page"
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
      {/* Click outside to close wallet options */}
      {/* Buy VMF Modal */}
      <BuyVMFModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />
    </div>
  )
}

export default StoryPage
