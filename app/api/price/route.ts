import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] Fetching VMF price from external sources...')
    
    // Try DexScreener first
    try {
      console.log('📡 [API] Trying DexScreener...')
      const DEXSCREENER_URL = `https://api.dexscreener.com/latest/dex/tokens/0x2213414893259b0C48066Acd1763e7fbA97859E5`
      
      const response = await fetch(DEXSCREENER_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('📡 [API] DexScreener response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📡 [API] DexScreener data:', JSON.stringify(data).substring(0, 200))
        
        if (data.pairs && data.pairs.length > 0) {
          console.log('📡 [API] Found', data.pairs.length, 'pairs')
          
          // Find the most liquid pair (highest liquidity)
          const sortedPairs = data.pairs
            .filter((pair: any) => pair.chainId === 'base' && pair.priceUsd)
            .sort((a: any, b: any) => parseFloat(b.liquidity?.usd || '0') - parseFloat(a.liquidity?.usd || '0'))
          
          console.log('📡 [API] Filtered to', sortedPairs.length, 'Base pairs')
          
          if (sortedPairs.length > 0) {
            const bestPair = sortedPairs[0]
            const price = parseFloat(bestPair.priceUsd)
            
            console.log('📡 [API] Best pair:', bestPair.dexId, 'Price:', price)
            
            if (price > 0) {
              console.log('✅ [API] DexScreener price fetched:', price)
              return NextResponse.json({ 
                price, 
                source: `DexScreener (${bestPair.dexId})`,
                success: true 
              })
            }
          }
        } else {
          console.log('⚠️ [API] No pairs found in DexScreener response')
        }
      } else {
        console.log('⚠️ [API] DexScreener request failed with status:', response.status)
      }
    } catch (dexError) {
      console.error('❌ [API] DexScreener failed:', dexError)
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
    
    // Try Uniswap V4 on Base directly
    try {
      console.log('📡 [API] Trying Uniswap V4 on Base...')
      const VMF_CONTRACT = '0x2213414893259b0C48066Acd1763e7fbA97859E5'
      const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // USDC on Base
      const UNISWAP_V3_QUOTER = '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a' // Quoter V2 on Base
      
      // Uniswap V3 uses a quoter contract to get price quotes
      // We'll quote swapping 1 USDC for VMF to get the price
      const oneUSDC = '1000000' // 1 USDC (6 decimals)
      const fee = 3000 // 0.3% fee tier (most common)
      
      // Encode the quoteExactInputSingle call
      // function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96)
      const quoteData = '0xf7729d43' + // quoteExactInputSingle selector
        USDC_CONTRACT.slice(2).padStart(64, '0') + // tokenIn (USDC)
        VMF_CONTRACT.slice(2).padStart(64, '0') + // tokenOut (VMF)
        fee.toString(16).padStart(64, '0') + // fee
        parseInt(oneUSDC).toString(16).padStart(64, '0') + // amountIn
        '0'.padStart(64, '0') // sqrtPriceLimitX96 (0 = no limit)
      
      const quoteResponse = await fetch('https://mainnet.base.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: UNISWAP_V3_QUOTER,
            data: quoteData
          }, 'latest'],
          id: 1
        })
      })
      
      const quoteResult = await quoteResponse.json()
      console.log('📡 [API] Uniswap quote response:', quoteResult)
      
      if (quoteResult.result && !quoteResult.error) {
        // Parse the result (amountOut is the first return value)
        const amountOut = BigInt(quoteResult.result)
        const vmfAmount = Number(amountOut) / 1e18 // VMF has 18 decimals
        const price = 1 / vmfAmount // Price in USDC per VMF
        
        console.log('📡 [API] Uniswap quote:', vmfAmount, 'VMF for 1 USDC')
        console.log('✅ [API] Uniswap V3 price:', price, 'USDC per VMF')
        
        if (price > 0 && price < 1000000) { // Sanity check
          return NextResponse.json({ 
            price, 
            source: 'Uniswap V3 (Base)',
            success: true 
          })
        }
      } else if (quoteResult.error) {
        console.log('⚠️ [API] Uniswap quote error:', quoteResult.error.message)
      }
    } catch (uniswapError) {
      console.error('❌ [API] Uniswap V3 failed:', uniswapError)
    }
    
    // Try static multiple from contract as fallback
    try {
      console.log('📡 [API] Trying static multiple from contract...')
      const VMF_CONTRACT = '0x2213414893259b0C48066Acd1763e7fbA97859E5'
      
      // Get donationMultipleBps
      const multipleResponse = await fetch('https://mainnet.base.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: VMF_CONTRACT,
            data: '0x95e3b085' // donationMultipleBps() selector
          }, 'latest'],
          id: 3
        })
      })
      
      const multipleData = await multipleResponse.json()
      console.log('📡 [API] Multiple response:', multipleData)
      
      if (multipleData.result && !multipleData.error) {
        const multipleBps = Number(BigInt(multipleData.result))
        const price = multipleBps / 10000
        console.log('✅ [API] Static multiple price:', price)
        
        if (price > 0) {
          return NextResponse.json({ 
            price, 
            source: 'VMF Static Multiple',
            success: true 
          })
        }
      }
    } catch (contractError) {
      console.error('❌ [API] Static multiple failed:', contractError)
    }
    
    // All methods failed
    console.log('❌ [API] All price sources failed, using fallback')
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
