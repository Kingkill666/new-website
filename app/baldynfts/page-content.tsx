"use client"

import { useEffect, useState } from "react"

import { Header } from "@/components/header"
import { BuyVMFModal } from "@/components/buy-vmf-modal"

import NFTGallery from "./nft-gallery"

export default function BaldyNFTsPageContent() {
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isBuyModalOpen ? "hidden" : "unset"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isBuyModalOpen])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      <Header onBuyVMFClick={() => setIsBuyModalOpen(true)} />

      <BuyVMFModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />

      <div className="bg-gradient-to-r from-red-600 to-blue-600 text-white py-16 pt-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Baldy NFTs</h1>
          <p className="text-xl mb-6 max-w-3xl mx-auto">
            Exclusive NFT collection supporting Veterans & Military Families.
            Each unique Baldy NFT represents our commitment to those who served.
          </p>
          <div className="flex justify-center space-x-8 text-lg">
            <div className="text-center">
              <div className="text-3xl font-bold">30</div>
              <div className="text-sm opacity-90">Total NFTs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">6</div>
              <div className="text-sm opacity-90">Unique Traits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">Base</div>
              <div className="text-sm opacity-90">Blockchain</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <NFTGallery />
      </div>

      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Support Our Veterans</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Every Baldy NFT purchase directly supports Veterans & Military Families.
            Join our community and make a difference.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Learn About VMF
            </a>
            <a
              href="https://vmfcoin.com/staking"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Stake VMF Tokens
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
