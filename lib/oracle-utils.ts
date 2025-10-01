import { ethers } from "ethers";

// Contract addresses
const VMF_CONTRACT_ADDRESS = "0x2213414893259b0C48066Acd1763e7fbA97859E5";
const FIXED_PRICE_ORACLE_ADDRESS = "0x9444b5Cf6f89ab72C6173bF0dd13c7F7bec809D2";
const SUSHISWAP_ORACLE_ADDRESS = "0xB660c01d6502091555731cD1B3E04fdfDBF83944"; // Accurate SushiSwap oracle

// Oracle ABI for reading price
const ORACLE_ABI = [
  {
    "inputs": [],
    "name": "spotPriceUSDCPerVMF",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "priceE18",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "validateOracle",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isValid",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// VMF Contract ABI for reading oracle address
const VMF_ABI = [
  {
    "inputs": [],
    "name": "priceOracle",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "donationMultipleBps",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

/**
 * Get the current VMF price from the oracle
 * @param provider - Ethers provider instance
 * @returns Promise<number> - Price in USDC per VMF (scaled to 1e18)
 */
export async function getVMFPriceFromOracle(provider: ethers.Provider): Promise<number> {
  try {
    console.log("🔍 Testing VMF contract call...");
    console.log("📍 Contract address:", VMF_CONTRACT_ADDRESS);
    
    // Check network - MUST be Base mainnet (chainId 8453)
    const network = await provider.getNetwork();
    console.log("🌐 Provider network:", network);
    
    if (network.chainId !== BigInt(8453)) {
      console.error("❌ Wrong network! Expected Base mainnet (8453), got:", network.chainId);
      throw new Error(`Wrong network. Expected Base mainnet (8453), got ${network.chainId}. Please switch to Base mainnet.`);
    }
    
    console.log("✅ Network verified: Base mainnet");
    
    // First check if oracle is set
    const vmfContract = new ethers.Contract(VMF_CONTRACT_ADDRESS, VMF_ABI, provider);
    console.log("📋 Contract instance created");
    
    // Test with raw call first
    try {
      const rawResult = await provider.call({
        to: VMF_CONTRACT_ADDRESS,
        data: "0x2630c12f" // priceOracle() selector
      });
      console.log("🔧 Raw call result:", rawResult);
    } catch (rawError) {
      console.error("❌ Raw call failed:", rawError);
    }
    
    // Test contract method call with detailed error handling
    let oracleAddress;
    try {
      oracleAddress = await vmfContract.priceOracle();
      console.log("📍 Oracle address from contract call:", oracleAddress);
    } catch (contractError) {
      console.error("❌ Contract method call failed:", contractError);
      console.error("❌ Error details:", {
        message: contractError.message,
        code: contractError.code,
        data: contractError.data
      });
      throw contractError;
    }
    
    if (oracleAddress === ethers.ZeroAddress) {
      console.log("⚠️ No oracle set, using fallback price");
      // No oracle set, fall back to static multiple
      try {
        const donationMultipleBps = await vmfContract.donationMultipleBps();
        // Convert basis points to price (10000 bps = 1:1 ratio)
        return Number(donationMultipleBps) / 10000;
      } catch (error) {
        console.log("⚠️ donationMultipleBps not available, using 1:1 fallback");
        return 1; // 1:1 fallback
      }
    }

    // Oracle is set, get price from oracle
    const oracleContract = new ethers.Contract(oracleAddress, ORACLE_ABI, provider);
    const priceE18 = await oracleContract.spotPriceUSDCPerVMF();
    
    // Convert from 1e18 scale to actual price
    return Number(ethers.formatEther(priceE18));
  } catch (error) {
    console.error("Error fetching VMF price from oracle:", error);
    // Fallback to 1:1 ratio if oracle fails
    return 1;
  }
}

/**
 * Calculate VMF amount based on USDC amount and current price (Uniswap or oracle)
 * @param usdcAmount - Amount in USDC (as number)
 * @param provider - Ethers provider instance
 * @returns Promise<number> - VMF amount to receive
 */
export async function calculateVMFAmount(usdcAmount: number, provider: ethers.Provider): Promise<number> {
  try {
    // Get price info (tries Uniswap first, then falls back to oracle)
    const priceInfo = await getPriceInfo(provider);
    
    if (priceInfo.price <= 0) {
      throw new Error("Invalid price from price source");
    }
    
    // Calculate: USDC amount / price per VMF = VMF amount
    return usdcAmount / priceInfo.price;
  } catch (error) {
    console.error("Error calculating VMF amount:", error);
    // Fallback to 1:1 ratio
    return usdcAmount;
  }
}

/**
 * Fetch real-time VMF price from multiple sources (DexScreener, CoinGecko, etc.)
 * @returns Promise<{price: number, source: string}> - Price and source info
 */
export async function getUniswapPrice(): Promise<{price: number, source: string}> {
  try {
    console.log("🔍 Fetching VMF price from multiple sources...");
    
    // Try DexScreener first
    try {
      console.log("📡 Trying DexScreener...");
      const DEXSCREENER_URL = `https://api.dexscreener.com/latest/dex/tokens/${VMF_CONTRACT_ADDRESS}`;
      
      const response = await fetch(DEXSCREENER_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.pairs && data.pairs.length > 0) {
          // Find the most liquid pair (highest liquidity)
          const sortedPairs = data.pairs
            .filter((pair: any) => pair.chainId === 'base' && pair.priceUsd)
            .sort((a: any, b: any) => parseFloat(b.liquidity?.usd || '0') - parseFloat(a.liquidity?.usd || '0'));
          
          if (sortedPairs.length > 0) {
            const bestPair = sortedPairs[0];
            const price = parseFloat(bestPair.priceUsd);
            
            if (price > 0) {
              console.log("✅ DexScreener price fetched:", price);
              console.log("📍 Best pair:", bestPair.dexId, bestPair.baseToken.symbol, "/", bestPair.quoteToken.symbol);
              
              return { 
                price, 
                source: `DexScreener (${bestPair.dexId})` 
              };
            }
          }
        }
      }
    } catch (dexError) {
      console.warn("⚠️ DexScreener failed:", dexError);
    }
    
    // Try CoinGecko as fallback
    try {
      console.log("📡 Trying CoinGecko...");
      const COINGECKO_URL = `https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=${VMF_CONTRACT_ADDRESS}&vs_currencies=usd`;
      
      const response = await fetch(COINGECKO_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const tokenData = data[VMF_CONTRACT_ADDRESS.toLowerCase()];
        
        if (tokenData && tokenData.usd && tokenData.usd > 0) {
          console.log("✅ CoinGecko price fetched:", tokenData.usd);
          return { 
            price: tokenData.usd, 
            source: "CoinGecko" 
          };
        }
      }
    } catch (cgError) {
      console.warn("⚠️ CoinGecko failed:", cgError);
    }
    
    // Try direct Uniswap V3 subgraph (newer endpoint)
    try {
      console.log("📡 Trying Uniswap V3 subgraph...");
      const UNISWAP_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
      
      const query = `
        query GetTokenPrice($tokenId: String!) {
          token(id: $tokenId) {
            id
            symbol
            name
            decimals
            derivedETH
          }
          bundle(id: "1") {
            ethPriceUSD
          }
        }
      `;
      
      const variables = {
        tokenId: VMF_CONTRACT_ADDRESS.toLowerCase()
      };
      
      const response = await fetch(UNISWAP_GRAPH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (!data.errors && data.data?.token && data.data?.bundle) {
          const token = data.data.token;
          const bundle = data.data.bundle;
          
          const priceInETH = parseFloat(token.derivedETH);
          const ethPriceUSD = parseFloat(bundle.ethPriceUSD);
          
          if (priceInETH > 0 && ethPriceUSD > 0) {
            const price = priceInETH * ethPriceUSD;
            console.log("✅ Uniswap V3 price fetched:", price);
            return { 
              price, 
              source: "Uniswap V3" 
            };
          }
        }
      }
    } catch (uniError) {
      console.warn("⚠️ Uniswap V3 failed:", uniError);
    }
    
    // All methods failed
    throw new Error("All price sources failed");
    
  } catch (error) {
    console.error("❌ Error fetching price from all sources:", error);
    throw error;
  }
}

/**
 * Get price information for display without provider (external sources only)
 * @returns Promise<{price: number, source: string}> - Price and source info
 */
export async function getPriceInfoNoProvider(): Promise<{price: number, source: string}> {
  try {
    // Try to get price from external sources
    const externalPrice = await getUniswapPrice();
    console.log("✅ Using external price:", externalPrice);
    return externalPrice;
  } catch (error) {
    console.error("Error getting price info (no provider):", error);
    return { price: 1, source: "Fallback" };
  }
}

/**
 * Get price information for display - prioritizes contract oracle, then external sources
 * @param provider - Ethers provider instance
 * @returns Promise<{price: number, source: string}> - Price and source info
 */
export async function getPriceInfo(provider: ethers.Provider): Promise<{price: number, source: string}> {
  try {
    // First try to get price from contract oracle (most reliable for VMF)
    try {
      // Check network - MUST be Base mainnet (chainId 8453)
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(8453)) {
        throw new Error(`Wrong network. Expected Base mainnet (8453), got ${network.chainId}. Please switch to Base mainnet.`);
      }
      
      const vmfContract = new ethers.Contract(VMF_CONTRACT_ADDRESS, VMF_ABI, provider);
      
      let oracleAddress;
      try {
        oracleAddress = await vmfContract.priceOracle();
        console.log("📍 Oracle address from getPriceInfo:", oracleAddress);
      } catch (contractError) {
        console.error("❌ Contract method call failed in getPriceInfo:", contractError);
        throw contractError;
      }
      
      if (oracleAddress !== ethers.ZeroAddress) {
        // Oracle is set, get price from oracle
        const oracleContract = new ethers.Contract(oracleAddress, ORACLE_ABI, provider);
        const priceE18 = await oracleContract.spotPriceUSDCPerVMF();
        const price = Number(ethers.formatEther(priceE18));
        
        // Determine oracle source based on address
        let source = "Unknown Oracle";
        if (oracleAddress.toLowerCase() === FIXED_PRICE_ORACLE_ADDRESS.toLowerCase()) {
          source = "Fixed Price Oracle";
        } else if (oracleAddress.toLowerCase() === SUSHISWAP_ORACLE_ADDRESS.toLowerCase()) {
          source = "SushiSwap V3 Oracle";
        } else {
          source = `Oracle (${oracleAddress.slice(0, 6)}...)`;
        }
        
        console.log("✅ Contract oracle price fetched:", price);
        return { price, source };
      } else {
        // No oracle set, using static multiple
        const donationMultipleBps = await vmfContract.donationMultipleBps();
        const price = Number(donationMultipleBps) / 10000;
        console.log("✅ Static multiple price fetched:", price);
        return { price, source: "Static Multiple" };
      }
    } catch (oracleError) {
      console.warn("⚠️ Contract oracle failed, trying external sources:", oracleError);
    }
    
    // Fallback to external price sources
    try {
      const externalPrice = await getUniswapPrice();
      console.log("✅ External price fetched:", externalPrice);
      return externalPrice;
    } catch (externalError) {
      console.warn("⚠️ External price sources failed:", externalError);
    }
    
    // Ultimate fallback
    console.log("⚠️ All price sources failed, using fallback");
    return { price: 1, source: "Fallback" };
    
  } catch (error) {
    console.error("Error getting price info:", error);
    return { price: 1, source: "Fallback" };
  }
}

/**
 * Get detailed oracle information including validation status
 * @param provider - Ethers provider instance
 * @returns Promise<{oracleAddress: string, price: number, source: string, isValid: boolean, reason: string}> - Detailed oracle info
 */
export async function getOracleInfo(provider: ethers.Provider): Promise<{
  oracleAddress: string;
  price: number;
  source: string;
  isValid: boolean;
  reason: string;
}> {
  try {
    // Check network - MUST be Base mainnet (chainId 8453)
    const network = await provider.getNetwork();
    if (network.chainId !== BigInt(8453)) {
      throw new Error(`Wrong network. Expected Base mainnet (8453), got ${network.chainId}. Please switch to Base mainnet.`);
    }
    
    const vmfContract = new ethers.Contract(VMF_CONTRACT_ADDRESS, VMF_ABI, provider);
    const oracleAddress = await vmfContract.priceOracle();
    
    if (oracleAddress === ethers.ZeroAddress) {
      return {
        oracleAddress: "0x0000000000000000000000000000000000000000",
        price: 1,
        source: "No Oracle Set",
        isValid: false,
        reason: "No oracle configured"
      };
    }

    // Get price from oracle
    const oracleContract = new ethers.Contract(oracleAddress, ORACLE_ABI, provider);
    const priceE18 = await oracleContract.spotPriceUSDCPerVMF();
    const price = Number(ethers.formatEther(priceE18));
    
    // Determine oracle source based on address
    let source = "Unknown Oracle";
    if (oracleAddress.toLowerCase() === FIXED_PRICE_ORACLE_ADDRESS.toLowerCase()) {
      source = "Fixed Price Oracle";
    } else if (oracleAddress.toLowerCase() === SUSHISWAP_ORACLE_ADDRESS.toLowerCase()) {
      source = "SushiSwap V3 Oracle";
    } else {
      source = `Oracle (${oracleAddress.slice(0, 6)}...)`;
    }
    
    // Try to validate oracle (if it has validation function)
    let isValid = true;
    let reason = "Oracle is valid";
    
    try {
      const [isValidResult, reasonResult] = await oracleContract.validateOracle();
      isValid = isValidResult;
      reason = reasonResult;
    } catch (validationError) {
      // Oracle doesn't have validation function, assume it's valid if we got a price
      isValid = price > 0;
      reason = isValid ? "Oracle working (no validation function)" : "Oracle returned invalid price";
    }
    
    return {
      oracleAddress,
      price,
      source,
      isValid,
      reason
    };
  } catch (error) {
    console.error("Error getting oracle info:", error);
    return {
      oracleAddress: "0x0000000000000000000000000000000000000000",
      price: 1,
      source: "Error",
      isValid: false,
      reason: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
