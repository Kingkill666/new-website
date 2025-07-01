"use client"
import { useState } from "react"

export default function OfficersClubRoom() {
  const [showOnlyBar, setShowOnlyBar] = useState(false)

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-black"
      style={{
        backgroundImage: "url(/images/secret-officers-club.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay for darkening the image, only if overlays are visible */}
      {!showOnlyBar && <div className="absolute inset-0 bg-black/60" />}

      {/* Overlay content, hidden after button click */}
      {!showOnlyBar && (
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-yellow-300 drop-shadow-lg mb-6">Welcome to the Officers Club Bar</h1>
          <p className="text-lg sm:text-2xl text-white/90 font-medium drop-shadow mb-8 max-w-2xl">
            Grab a seat, enjoy the camaraderie, and celebrate with fellow members. This is your exclusive space to relax, connect, and unwind. Cheers to you!
          </p>
          <button
            className="inline-block bg-yellow-400/90 text-black font-bold px-8 py-3 rounded-2xl text-xl shadow-lg mt-4 transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            onClick={() => setShowOnlyBar(true)}
          >
            Members Only
          </button>
        </div>
      )}

      {/* Interactive hotspots, only after Members Only is clicked */}
      {showOnlyBar && (
        <>
          {/* Slot Machine - improved border shape and effect */}
          <div
            className="absolute z-20 group"
            style={{ left: '1.5%', bottom: '10%', width: '11%', height: '60%' }}
          >
            <div className="w-full h-full transition-all duration-200 group-hover:border-8 group-hover:border-white group-hover:shadow-[0_0_32px_8px_rgba(255,255,255,0.7)] rounded-[32px]" style={{ border: '4px solid transparent' }} />
          </div>
          {/* Jukebox - improved border shape and effect */}
          <div
            className="absolute z-20 group"
            style={{ right: '3.5%', bottom: '10%', width: '12%', height: '48%' }}
          >
            <div className="w-full h-full transition-all duration-200 group-hover:border-8 group-hover:border-white group-hover:shadow-[0_0_32px_8px_rgba(255,255,255,0.7)] rounded-[40px]" style={{ border: '4px solid transparent' }} />
          </div>
          {/* TV - improved border shape and effect (adjusted position and size) */}
          <div
            className="absolute z-30 group"
            style={{ left: '54%', top: '3%', width: '23%', height: '22%', transform: 'rotate(-6deg)' }}
          >
            <div className="w-full h-full transition-all duration-200 group-hover:border-8 group-hover:border-white group-hover:shadow-[0_0_32px_8px_rgba(255,255,255,0.7)] rounded-[48px]" style={{ border: '4px solid transparent' }} />
          </div>
          {/* Bartender */}
          <div
            className="absolute z-20 group"
            style={{ left: '38%', bottom: '23%', width: '13%', height: '32%' }}
          >
            <div className="w-full h-full transition-all duration-200 group-hover:border-4 group-hover:border-white rounded-full" />
          </div>
        </>
      )}
    </div>
  )
} 