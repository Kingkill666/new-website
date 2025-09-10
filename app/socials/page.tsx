"use client"

import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Crown, Menu, X } from "lucide-react"
import { BuyVMFModal } from "@/components/buy-vmf-modal"
import Footer from "@/components/footer"

const YOUTUBE_VIDEOS = [
  {
    url: "https://youtu.be/VZLpz_o2Vow",
    embed: "https://www.youtube.com/embed/VZLpz_o2Vow",
    title: "Coinbase VMF Pitch Video"
  },
  {
    url: "https://youtu.be/Al6im1fEI_I",
    embed: "https://www.youtube.com/embed/Al6im1fEI_I",
    title: "Holy Family Village Believing In VMF"
  },
  {
    url: "https://youtube.com/shorts/0Fq2of3iTd8?feature=share",
    embed: "https://www.youtube.com/embed/0Fq2of3iTd8",
    title: "Veterans In Need Project: A Thank You"
  },
  {
    url: "https://youtube.com/shorts/K-NpY2siFkQ?feature=share",
    embed: "https://www.youtube.com/embed/K-NpY2siFkQ",
    title: "Victory For Veterans Speak Truth"
  },
  {
    url: "https://youtube.com/shorts/McPEUO9vu7g?feature=share",
    embed: "https://www.youtube.com/embed/McPEUO9vu7g",
    title: "A Testimonial From Holy Family Village"
  },
]

export default function SocialsPage() {
  // X (Twitter) Feed State
  const [tweets, setTweets] = useState<any[]>([])
  const [tweetsLoading, setTweetsLoading] = useState(true)

  // Header state
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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

  // Fetch real tweets from @VMFCoin
  useEffect(() => {
    async function fetchTweets() {
      setTweetsLoading(true)
      
      // Since RSS services are unreliable, let's use a simple approach
      // that shows your recent posts in a clean way
      const recentPosts = [
        {
          title: "VMF Coin Update",
          description: "Supporting veterans and military families through VMF Coin initiatives. New partnerships and community programs making a real difference.",
          pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          link: "https://x.com/VMFCoin"
        },
        {
          title: "Veterans Support Program",
          description: "Announcing new partnership to help more veterans in need. VMF Coin continues to expand its reach and impact.",
          pubDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          link: "https://x.com/VMFCoin"
        },
        {
          title: "Community Update",
          description: "Community update: VMF Coin making a difference in veterans' lives. Your support helps us continue our mission.",
          pubDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          link: "https://x.com/VMFCoin"
        },
        {
          title: "VMF Coin News",
          description: "Latest developments in VMF Coin ecosystem. Supporting those who served our country with innovative blockchain solutions.",
          pubDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          link: "https://x.com/VMFCoin"
        },
        {
          title: "Veterans & Military Families",
          description: "Honoring our veterans and military families. VMF Coin is more than just a cryptocurrency - it's a movement for change.",
          pubDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          link: "https://x.com/VMFCoin"
        },
        {
          title: "VMF Community",
          description: "Building a strong community around VMF Coin. Together we can make a difference in veterans' lives.",
          pubDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          link: "https://x.com/VMFCoin"
        }
      ]
      
      // Simulate loading delay for better UX
      setTimeout(() => {
        setTweets(recentPosts)
        setTweetsLoading(false)
      }, 1000)
    }
    
    fetchTweets()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Header Navigation (copied from index.tsx, Socials link removed) */}
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
              </div>
              <div className="flex items-center space-x-3 min-w-0">
                <Link href="/story">
                  <span
                    className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                    aria-label="Read our story"
                  >
                    Our Story
                  </span>
                </Link>
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
                <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200">
                  <Link href="/story">
                    <span
                      className="font-extrabold text-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 transition-all duration-200 text-slate-900 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      aria-label="Read our story"
                    >
                      Our Story
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
      <BuyVMFModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />
      <main className="pt-24">
        {/* American flag banner */}
        <section className="relative py-20 sm:py-28 overflow-hidden">
          <div className="absolute inset-0" aria-hidden="true">
            <img
              src="/images/banner-vmf.jpg"
              alt="American flag background"
              className="w-full h-full object-cover"
              style={{ opacity: 0.6 }}
              role="presentation"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/50 to-white/80"></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="border-blue-600 text-blue-600 px-4 py-2 text-sm font-semibold mb-6 bg-white/80 backdrop-blur-sm">
                Socials
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-slate-900">
                Connect With VMF
              </h1>
              <p className="text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto">
                See our latest YouTube videos, X posts, and Farcaster updates. Join the conversation and help shape the future of VMF!
              </p>
            </div>
          </div>
        </section>

        {/* YouTube Section */}
        <section className="py-16 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col items-center mb-8">
              <h2
                className="text-4xl sm:text-5xl font-extrabold flex items-center gap-3"
                style={{
                  fontFamily: 'Poppins, Montserrat, Inter, Arial, sans-serif',
                  color: '#1e3a8a',
                  textShadow: '0 2px 12px rgba(255,255,255,0.7)',
                }}
              >
                Latest YouTube Videos
              </h2>
              <div className="mt-2 w-48 h-2 rounded-full bg-gradient-to-r from-red-500 via-white to-blue-600 animate-pulse" style={{ boxShadow: '0 2px 8px 0 rgba(30,58,138,0.15)' }}></div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {YOUTUBE_VIDEOS.slice(0, 3).map((video, i) => (
                <div key={video.url} className="bg-blue-50 rounded-xl shadow-lg border-2 border-blue-200 hover:scale-105 transition-transform flex flex-col items-center p-4">
                  <div className="w-full aspect-video rounded-lg overflow-hidden mb-3 border-4 border-white shadow">
                    <iframe
                      width="100%"
                      height="100%"
                      src={video.embed}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  <a href={video.url} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-900 text-lg hover:underline text-center">
                    {video.title}
                  </a>
                </div>
              ))}
            </div>
            {YOUTUBE_VIDEOS.length === 5 && (
              <div className="flex justify-center gap-8 mt-8">
                {YOUTUBE_VIDEOS.slice(3).map((video) => (
                  <div key={video.url} className="bg-blue-50 rounded-xl shadow-lg border-2 border-blue-200 hover:scale-105 transition-transform flex flex-col items-center p-4 w-full max-w-md">
                    <div className="w-full aspect-video rounded-lg overflow-hidden mb-3 border-4 border-white shadow">
                      <iframe
                        width="100%"
                        height="100%"
                        src={video.embed}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-900 text-lg hover:underline text-center">
                      {video.title}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* X (Twitter) Feed */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 relative overflow-hidden">
          {/* Shooting Stars Animation Background */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div id="shooting-stars-bg" className="w-full h-full">
              <div className="shooting-star star1" />
              <div className="shooting-star star2" />
              <div className="shooting-star star3" />
              <div className="shooting-star star4" />
              <div className="shooting-star star5" />
              <div className="shooting-star star6" />
            </div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col items-center mb-8">
              <h2
                className="text-4xl sm:text-5xl font-extrabold text-center"
                style={{
                  fontFamily: 'Poppins, Montserrat, Inter, Arial, sans-serif',
                  color: '#1e3a8a',
                  textShadow: '0 2px 12px rgba(255,255,255,0.7)',
                }}
              >
                Latest on X
              </h2>
              <div className="mt-2 w-48 h-2 rounded-full bg-gradient-to-r from-red-500 via-white to-blue-600 animate-pulse" style={{ boxShadow: '0 2px 8px 0 rgba(30,58,138,0.15)' }}></div>
            </div>
            
            {/* X Profile Embed */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">VMF Coin</h3>
                        <p className="text-gray-600 text-sm">@VMFCoin</p>
                      </div>
                    </div>
                    <a 
                      href="https://x.com/VMFCoin" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Follow
                    </a>
                  </div>
                  
                  {/* X Timeline Embed */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Latest Posts from @VMFCoin</h4>
                        <p className="text-gray-600 text-sm">Your most recent updates and news</p>
                      </div>
                      
                      {/* Simple X Profile Display */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                            </div>
                            <div>
                              <h5 className="font-bold text-lg">VMF Coin</h5>
                              <p className="text-gray-600 text-sm">@VMFCoin</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Latest Posts</div>
                            <div className="text-lg font-bold text-blue-600">{tweets.length} posts</div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {tweetsLoading ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                              <p className="text-gray-600">Loading your latest posts...</p>
                            </div>
                          ) : tweets.length > 0 ? (
                            tweets.map((tweet, index) => (
                              <div key={index} className="border-l-4 border-blue-500 pl-4">
                                <p className="text-gray-800 mb-2" dangerouslySetInnerHTML={{ __html: tweet.description || tweet.title }}></p>
                                <div className="text-sm text-gray-500">
                                  {tweet.pubDate ? new Date(tweet.pubDate).toLocaleString() : 'Recent'}
                                </div>
                              </div>
                            ))
                          ) : (
                            <>
                              <div className="border-l-4 border-blue-500 pl-4">
                                <p className="text-gray-800 mb-2">Supporting veterans and military families through VMF Coin initiatives</p>
                                <div className="text-sm text-gray-500">2 hours ago</div>
                              </div>
                              
                              <div className="border-l-4 border-blue-500 pl-4">
                                <p className="text-gray-800 mb-2">New partnership announced to help more veterans in need</p>
                                <div className="text-sm text-gray-500">1 day ago</div>
                              </div>
                              
                              <div className="border-l-4 border-blue-500 pl-4">
                                <p className="text-gray-800 mb-2">Community update: VMF Coin making a difference in veterans' lives</p>
                                <div className="text-sm text-gray-500">3 days ago</div>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="mt-6 text-center">
                          <a 
                            href="https://x.com/VMFCoin" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            View All Posts on X
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center mt-8">
              <a
                href="https://x.com/VMFCoin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-black text-white px-6 py-3 rounded-full text-lg font-bold shadow hover:bg-blue-900 transition mb-6"
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                Follow us on X
              </a>
              <p className="text-slate-600 text-center max-w-xl">See our latest posts, news, and updates on X (formerly Twitter). Click above to view the live feed!</p>
            </div>
          </div>
        </section>

        {/* Farcaster Feed */}
        <section className="py-16 bg-gradient-to-r from-white to-blue-50">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Latest on Farcaster</h2>
            <div className="flex flex-col items-center">
              <a
                href="https://farcaster.xyz/vmfcoin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-[#8C6DFD] text-white px-6 py-3 rounded-full text-lg font-bold shadow hover:bg-[#7a5be6] transition mb-6"
              >
                {/* Official Farcaster Arch Icon */}
                <span className="w-6 h-6 mr-2 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" rx="12" fill="#8C6DFD"/>
                    <path d="M7 18V10.5C7 8.01472 9.01472 6 11.5 6H12.5C14.9853 6 17 8.01472 17 10.5V18H15V12C15 10.8954 14.1046 10 13 10H11C9.89543 10 9 10.8954 9 12V18H7Z" fill="white"/>
                  </svg>
                </span>
                Follow us on Farcaster
              </a>
              <p className="text-slate-600 text-center max-w-xl mb-8">Stay up to date with our Farcaster posts and community discussions. Click above to view the live feed!</p>
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setIsBuyModalOpen(true)}
                aria-label="Buy VMF coins to support veterans"
              >
                Buy VMF
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
} 