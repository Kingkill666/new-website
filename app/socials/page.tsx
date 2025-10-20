"use client"

import { Header } from "@/components/header"
import { useState } from "react"
import { BuyVMFModal } from "@/components/buy-vmf-modal"

export default function SocialsPage() {
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Navigation Header */}
      <Header onBuyVMFClick={() => setIsBuyModalOpen(true)} />
      
      <BuyVMFModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />
      
      <main className="pt-24">
        {/* American flag banner */}
        <section className="relative py-20 sm:py-28 overflow-hidden">
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-white to-blue-600 opacity-90"></div>
          </div>
          <div className="relative container mx-auto px-4 text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              VMF Social Hub
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto mb-8 drop-shadow-md">
              Stay connected with our community, latest updates, and join the conversation supporting veterans and military families.
            </p>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Coming Soon</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're building an amazing social hub for our community. Stay tuned for updates!
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
