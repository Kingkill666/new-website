import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { headers } from "next/headers" // Import headers function
import ContextProvider from "@/context" // Import AppKit ContextProvider

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
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </ContextProvider>
      </body>
    </html>
  )
}
