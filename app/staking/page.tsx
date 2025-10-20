import { Metadata } from "next"
import StakingApp from "./staking-app"

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
  return <StakingApp />
}