import { NextRequest, NextResponse } from 'next/server'
import { VMF_CONTRACT_ADDRESS } from '@/lib/vmf-contract'

const VMF_CONTRACT_LOWERCASE = VMF_CONTRACT_ADDRESS.toLowerCase()

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] Fetching VMF price from external sources...')
    
    // Try DexScreener with pool address first (most reliable)
    try {
      console.log('📡 [API] Trying DexScreener with pool address...')
      // DexScreener/Uniswap v3 pool address for VMF/USDC on Base
      const SUSHISWAP_POOL = '0xa471e375dd96b86acc3a263822a905f1d8e7f5d6857a9b03ee5dc276774ca33d'
      const DEXSCREENER_POOL_URL = `https://api.dexscreener.com/latest/dex/pairs/base/${SUSHISWAP_POOL}`
      
      const poolResponse = await fetch(DEXSCREENER_POOL_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('📡 [API] DexScreener pool response status:', poolResponse.status)
      
      if (poolResponse.ok) {
        const poolData = await poolResponse.json()
        console.log('📡 [API] DexScreener pool data:', JSON.stringify(poolData).substring(0, 300))
        
        if (poolData.pair && poolData.pair.priceUsd) {
          const price = parseFloat(poolData.pair.priceUsd)
          const liquidity = poolData.pair.liquidity?.usd || 0
          const volume24h = poolData.pair.volume?.h24 || 0
          
          console.log('📡 [API] Pool details:')
          console.log('  - Price:', price, 'USD')
          console.log('  - Liquidity:', liquidity, 'USD')
          console.log('  - 24h Volume:', volume24h, 'USD')
          console.log('  - DEX:', poolData.pair.dexId)
          
          if (price > 0) {
            console.log('✅ [API] DexScreener price fetched from pool:', price)
            return NextResponse.json({ 
              price, 
              source: `${poolData.pair.dexId} (Live)`,
              success: true,
              liquidity: liquidity,
              volume24h: volume24h
            })
          }
        }
      }
    } catch (poolError) {
      console.error('❌ [API] DexScreener pool lookup failed:', poolError)
    }
    
    // Fallback: Try DexScreener with token address
    try {
      console.log('📡 [API] Trying DexScreener with token address...')
      const VMF_CONTRACT = VMF_CONTRACT_ADDRESS
      const DEXSCREENER_TOKEN_URL = `https://api.dexscreener.com/latest/dex/tokens/${VMF_CONTRACT}`
      
      const response = await fetch(DEXSCREENER_TOKEN_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('📡 [API] DexScreener token response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.pairs && data.pairs.length > 0) {
          console.log('📡 [API] Found', data.pairs.length, 'pairs from token lookup')
          
          // Find the most liquid pair on Base
          const sortedPairs = data.pairs
            .filter((pair: any) => pair.chainId === 'base' && pair.priceUsd)
            .sort((a: any, b: any) => parseFloat(b.liquidity?.usd || '0') - parseFloat(a.liquidity?.usd || '0'))
          
          if (sortedPairs.length > 0) {
            const bestPair = sortedPairs[0]
            const price = parseFloat(bestPair.priceUsd)
            
            console.log('✅ [API] DexScreener price from token lookup:', price)
            return NextResponse.json({ 
              price, 
              source: `${bestPair.dexId} (Live)`,
              success: true 
            })
          }
        }
      }
    } catch (dexError) {
      console.error('❌ [API] DexScreener token lookup failed:', dexError)
    }
    
    // Try CoinGecko as fallback
    try {
      console.log('📡 Trying CoinGecko...')
      const COINGECKO_URL = `https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=${VMF_CONTRACT_ADDRESS}&vs_currencies=usd`
      
      const response = await fetch(COINGECKO_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const tokenData = data[VMF_CONTRACT_LOWERCASE]
        
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
      const VMF_CONTRACT = VMF_CONTRACT_ADDRESS
      const USDC_CONTRACT = '0x833589fCD6EDb6E08f4c7C32D4f71B54Bda02913' // USDC on Base
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
      const VMF_CONTRACT = VMF_CONTRACT_ADDRESS
      
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
    
    // All methods failed - use 1:1 ratio as default
    console.log('⚠️ [API] All price sources failed, using 1:1 default')
    return NextResponse.json({ 
      price: 1, 
      source: '1:1 Default',
      success: true  // Mark as success since 1:1 is the intended default
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
