"use client"

export default function OfficersClubRoom() {
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
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-yellow-300 drop-shadow-lg mb-6">Welcome to the Officers Club Bar</h1>
        <p className="text-lg sm:text-2xl text-white/90 font-medium drop-shadow mb-8 max-w-2xl">
          Grab a seat, enjoy the camaraderie, and celebrate with fellow members. This is your exclusive space to relax, connect, and unwind. Cheers to you!
        </p>
        <span className="inline-block bg-yellow-400/90 text-black font-bold px-8 py-3 rounded-2xl text-xl shadow-lg mt-4">
          Members Only
        </span>
      </div>
    </div>
  )
} 