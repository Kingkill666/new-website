import { Metadata } from "next"
import StakingApp from "./staking-app"
import { Header } from "@/components/header"

export const metadata: Metadata = {
  title: "VMF Staking - Veterans & Military Families",
  description: "Stake your VMF tokens and earn rewards while supporting veterans and military families",
  openGraph: {
    title: "VMF Staking - Veterans & Military Families",
    description: "Stake your VMF tokens and earn rewards while supporting veterans and military families",
    images: ["/images/vmf-logo-new.png"],
  },
}

export default function StakingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <Header />
      
      {/* Staking App with top padding to account for fixed header */}
      <div className="pt-20">
        <StakingApp />
      </div>
    </div>
  )
}