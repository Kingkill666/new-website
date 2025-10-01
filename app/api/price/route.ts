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
    
    // Try reading from Base contract oracle directly
    try {
      console.log('📡 [API] Trying contract oracle on Base...')
      const VMF_CONTRACT = '0x2213414893259b0C48066Acd1763e7fbA97859E5'
      
      // Get oracle address from contract
      const oracleAddressResponse = await fetch('https://mainnet.base.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: VMF_CONTRACT,
            data: '0x2630c12f' // priceOracle() selector
          }, 'latest'],
          id: 1
        })
      })
      
      const oracleData = await oracleAddressResponse.json()
      console.log('📡 [API] Oracle address response:', oracleData)
      
      if (oracleData.result && oracleData.result !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        // Extract oracle address (remove leading zeros)
        const oracleAddress = '0x' + oracleData.result.slice(-40)
        console.log('📡 [API] Oracle address:', oracleAddress)
        
        // Get price from oracle
        const priceResponse = await fetch('https://mainnet.base.org', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: oracleAddress,
              data: '0x55a0e5e0' // spotPriceUSDCPerVMF() selector
            }, 'latest'],
            id: 2
          })
        })
        
        const priceData = await priceResponse.json()
        console.log('📡 [API] Price response:', priceData)
        
        if (priceData.result) {
          const priceE18 = BigInt(priceData.result)
          const price = Number(priceE18) / 1e18
          console.log('✅ [API] Contract oracle price:', price)
          
          if (price > 0) {
            return NextResponse.json({ 
              price, 
              source: 'VMF Contract Oracle',
              success: true 
            })
          }
        }
      } else {
        console.log('⚠️ [API] No oracle set on contract, trying static multiple...')
        
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
        
        if (multipleData.result) {
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
      }
    } catch (contractError) {
      console.error('❌ [API] Contract oracle failed:', contractError)
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
