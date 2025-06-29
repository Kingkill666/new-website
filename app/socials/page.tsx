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
  const [tweetsError, setTweetsError] = useState(false)

  // Header state
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    async function fetchTweets() {
      setTweetsLoading(true)
      setTweetsError(false)
      try {
        const rssUrl = "https://rss.app/feeds/khdaR6MEQVTzTpeO.xml"
        const res = await fetch(rssUrl)
        const text = await res.text()
        const parser = new window.DOMParser()
        const xml = parser.parseFromString(text, "text/xml")
        const items = Array.from(xml.querySelectorAll("item")).slice(0, 6)
        const tweetsParsed = items.map(item => ({
          title: item.querySelector("title")?.textContent,
          link: item.querySelector("link")?.textContent,
          pubDate: item.querySelector("pubDate")?.textContent,
          description: item.querySelector("description")?.textContent,
        }))
        setTweets(tweetsParsed)
      } catch (e) {
        setTweetsError(true)
      } finally {
        setTweetsLoading(false)
      }
    }
    fetchTweets()
  }, [])

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
              <div className="flex items-center space-x-1 min-w-0">
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
              {YOUTUBE_VIDEOS.map((video, i) => (
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
            {tweetsLoading ? (
              <div className="text-center text-blue-600">Loading latest posts...</div>
            ) : tweetsError ? (
              <div className="text-center text-red-600">Could not load X feed. <a href='https://x.com/VMFCoin' target='_blank' rel='noopener noreferrer' className='underline'>View on X</a></div>
            ) : (
              <div className="relative">
                <div className="grid md:grid-cols-3 gap-8 mb-8 relative z-10">
                  {tweets.map((tweet, i) => (
                    <a
                      key={tweet.link || i}
                      href={tweet.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white/90 backdrop-blur-xl rounded-2xl border-2 border-blue-200 shadow-2xl hover:scale-105 hover:shadow-blue-400/40 transition-all duration-300 p-6 group ring-2 ring-transparent hover:ring-blue-400/60 focus:ring-blue-500/80 focus:z-20"
                      style={{ boxShadow: '0 8px 32px 0 rgba(30,58,138,0.10), 0 1.5px 12px 0 rgba(255,0,0,0.08)' }}
                    >
                      <div
                        className="text-base mb-4 group-hover:text-blue-900 transition-colors duration-200 font-medium fun-tweet-text"
                        style={{
                          fontFamily: 'Quicksand, Nunito, Fredoka, Arial, sans-serif',
                          fontSize: '1rem',
                          color: '#334155',
                          textShadow: '0 1.5px 6px #e0e7ef',
                          lineHeight: 1.5,
                          letterSpacing: '0.01em',
                          borderRadius: '0.5rem',
                          padding: '0.1em 0',
                        }}
                        dangerouslySetInnerHTML={{ __html: tweet.description || tweet.title }}
                      />
                      <div className="text-xs text-blue-500 font-bold group-hover:text-blue-700 transition-colors duration-200 mt-2" style={{ fontFamily: 'Montserrat, Poppins, Arial, sans-serif', letterSpacing: '0.03em' }}>{tweet.pubDate ? new Date(tweet.pubDate).toLocaleString() : ""}</div>
                    </a>
                  ))}
                </div>
                {/* Shooting Stars CSS */}
                <style jsx>{`
                  #shooting-stars-bg {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    pointer-events: none;
                  }
                  @keyframes shooting-star {
                    0% {
                      opacity: 0;
                      transform: translateY(0) translateX(0) scaleX(0.5) scaleY(1);
                    }
                    10% {
                      opacity: 1;
                    }
                    100% {
                      opacity: 0;
                      transform: translateY(300px) translateX(600px) scaleX(1.2) scaleY(0.7);
                    }
                  }
                  .shooting-star {
                    position: absolute;
                    width: 2px;
                    height: 80px;
                    background: linear-gradient(180deg, #fff 0%, #fff8 60%, transparent 100%);
                    border-radius: 999px;
                    opacity: 0;
                    filter: blur(0.5px);
                    pointer-events: none;
                    animation: shooting-star 2.5s linear infinite;
                  }
                  .star1 { left: 10%; top: 10%; animation-delay: 0s; }
                  .star2 { left: 30%; top: 20%; animation-delay: 0.8s; }
                  .star3 { left: 60%; top: 5%; animation-delay: 1.2s; }
                  .star4 { left: 80%; top: 15%; animation-delay: 1.7s; }
                  .star5 { left: 50%; top: 25%; animation-delay: 2.1s; }
                  .star6 { left: 20%; top: 30%; animation-delay: 1.5s; }
                `}</style>
              </div>
            )}
            <div className="flex flex-col items-center">
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