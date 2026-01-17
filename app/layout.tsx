import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { headers } from "next/headers" // Import headers function
import ContextProvider from "@/context" // Import AppKit ContextProvider
import { FarcasterProvider } from "@/components/farcaster-provider"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vmfcoin.com"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "VMF - Veterans & Military Families",
  description: "Supporting those who served through blockchain technology",
  generator: "v0.dev",
  icons: {
    icon: "/images/vmf-logo-new-patriotic.png",
  },
  // Farcaster Frame metadata
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://i.postimg.cc/rsbzz1n3/star_exact_embedded.jpg",
    "fc:frame:button:1": "Open mini app",
    "fc:frame:button:1:action": "launch_frame",
    "fc:frame:button:1:target": SITE_URL,
    "of:version": "vNext",
    "of:accepts:farcaster": "vNext",
    "of:image": "https://i.postimg.cc/rsbzz1n3/star_exact_embedded.jpg",
  },
  openGraph: {
    title: "VMF - Support Veterans Direct",
    description: "ALL donations go directly to verified veteran charities. Buy VMF, we match, you pick the charities.",
    images: ["https://i.postimg.cc/rsbzz1n3/star_exact_embedded.jpg"],
    type: "website",
  },
}

// ATTENTION!!! RootLayout must be an async function to use headers() 
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Retrieve cookies from request headers on the server
  const headersObj = await headers() // IMPORTANT: await the headers() call
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap children with ContextProvider, passing cookies */}
        <ContextProvider cookies={cookies}>
          <FarcasterProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
              {children}
            </ThemeProvider>
          </FarcasterProvider>
        </ContextProvider>
      </body>
    </html>
  )
}
