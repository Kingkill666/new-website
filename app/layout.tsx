import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/components/wallet-provider"
import Head from "next/head"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VMF - Veterans & Military Families",
  description: "Supporting those who served through blockchain technology",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </Head>
      <body className={inter.className}>
        <WalletProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
