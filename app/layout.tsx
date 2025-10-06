import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/components/wallet-provider"
import Head from "next/head"
import { headers } from "next/headers" // Import headers function
import ContextProvider from "@/context" // Import AppKit ContextProvider

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VMF - Veterans & Military Families",
  description: "Supporting those who served through blockchain technology",
    generator: 'v0.dev'
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
      <Head>
        <link rel="icon" href="/images/vmf-logo-new-patriotic.png" type="image/png" />
      </Head>
      <body className={inter.className}>
        {/* Wrap children with ContextProvider, passing cookies */}
        <ContextProvider cookies={cookies}>
          <WalletProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
              {children}
            </ThemeProvider>
          </WalletProvider>
        </ContextProvider>
      </body>
    </html>
  )
}
