import { Metadata } from "next"
import BaldyNFTsPageContent from "./page-content"

const NFT_IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_NFT_IMAGE_BASE_URL ||
  "https://vmfcoin.com/images/nfts"

export const metadata: Metadata = {
  title: "Baldy NFTs - VMF Veterans & Military Families",
  description: "Explore the exclusive Baldy NFT collection supporting Veterans & Military Families through blockchain technology",
  openGraph: {
    title: "Baldy NFTs - VMF Veterans & Military Families",
    description: "Explore the exclusive Baldy NFT collection supporting Veterans & Military Families through blockchain technology",
    images: [`${NFT_IMAGE_BASE_URL}/1.png`],
  },
}

export default function BaldyNFTsPage() {
  return <BaldyNFTsPageContent />
}
