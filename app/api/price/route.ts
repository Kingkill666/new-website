import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching VMF price from external sources...')
    
    // Try DexScreener first
    try {
      console.log('📡 Trying DexScreener...')
      const DEXSCREENER_URL = `https://api.dexscreener.com/latest/dex/tokens/0x2213414893259b0C48066Acd1763e7fbA97859E5`
      
      const response = await fetch(DEXSCREENER_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.pairs && data.pairs.length > 0) {
          // Find the most liquid pair (highest liquidity)
          const sortedPairs = data.pairs
            .filter((pair: any) => pair.chainId === 'base' && pair.priceUsd)
            .sort((a: any, b: any) => parseFloat(b.liquidity?.usd || '0') - parseFloat(a.liquidity?.usd || '0'))
          
          if (sortedPairs.length > 0) {
            const bestPair = sortedPairs[0]
            const price = parseFloat(bestPair.priceUsd)
            
            if (price > 0) {
              console.log('✅ DexScreener price fetched:', price)
              return NextResponse.json({ 
                price, 
                source: `DexScreener (${bestPair.dexId})`,
                success: true 
              })
            }
          }
        }
      }
    } catch (dexError) {
      console.warn('⚠️ DexScreener failed:', dexError)
    }
    
    // Try CoinGecko as fallback
    try {
      console.log('📡 Trying CoinGecko...')
      const COINGECKO_URL = `https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=0x2213414893259b0C48066Acd1763e7fbA97859E5&vs_currencies=usd`
      
      const response = await fetch(COINGECKO_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const tokenData = data['0x2213414893259b0c48066acd1763e7fba97859e5']
        
        if (tokenData && tokenData.usd && tokenData.usd > 0) {
          console.log('✅ CoinGecko price fetched:', tokenData.usd)
          return NextResponse.json({ 
            price: tokenData.usd, 
            source: 'CoinGecko',
            success: true 
          })
        }
      }
    } catch (cgError) {
      console.warn('⚠️ CoinGecko failed:', cgError)
    }
    
    // All methods failed
    console.log('❌ All external price sources failed')
    return NextResponse.json({ 
      price: 1, 
      source: 'Fallback',
      success: false 
    })
    
  } catch (error) {
    console.error('❌ Error in price API:', error)
    return NextResponse.json({ 
      price: 1, 
      source: 'Fallback',
      success: false,
      error: 'Internal server error'
    })
  }
}
