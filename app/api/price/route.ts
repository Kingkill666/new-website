import { NextResponse } from 'next/server'

// Run on edge and always fetch fresh data
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// DEXScreener API for VMF/USDC pair on Base
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex/pairs/base/0xa471e375dd96b86acc3a263822a905f1d8e7f5d6857a9b03ee5dc276774ca33d'

interface DexScreenerPair {
  priceUsd: string
  liquidity?: { usd: number }
  volume?: { h24: number }
}

interface DexScreenerResponse {
  pair: DexScreenerPair
}

export async function GET() {
  try {
    const response = await fetch(DEXSCREENER_API, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`DEXScreener API error: ${response.status}`)
    }

    const data: DexScreenerResponse = await response.json()

    if (!data.pair || !data.pair.priceUsd) {
      throw new Error('Invalid response from DEXScreener')
    }

    const priceUsd = parseFloat(data.pair.priceUsd)
    if (Number.isNaN(priceUsd) || priceUsd <= 0) {
      throw new Error('Invalid price value')
    }

    // Calculate how many VMF tokens = $1
    const vmfPerDollar = 1 / priceUsd
    const vmfPerDollarWei = Math.floor(vmfPerDollar * 1e18)

    return NextResponse.json(
      {
        success: true,
        priceUsd,
        vmfPerDollar,
        vmfPerDollarWei: vmfPerDollarWei.toString(),
        liquidity: data.pair.liquidity?.usd || 0,
        volume24h: data.pair.volume?.h24 || 0,
        timestamp: Date.now(),
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch (error) {
    console.error('Price API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch price',
        priceUsd: 0.01,
        vmfPerDollar: 100,
        vmfPerDollarWei: '100000000000000000000',
        timestamp: Date.now(),
      },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  }
}
