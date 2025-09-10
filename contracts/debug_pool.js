const { ethers } = require('ethers');

// Pool and token addresses
const SUSHISWAP_V3_POOL = "0x9C83A203133B65982F35D1B00E8283C9fb518cb1";
const VMF_ADDRESS = "0x2213414893259b0C48066Acd1763e7fbA97859E5";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// Pool ABI
const POOL_ABI = [
  {
    "inputs": [],
    "name": "slot0",
    "outputs": [
      {
        "internalType": "uint160",
        "name": "sqrtPriceX96",
        "type": "uint160"
      },
      {
        "internalType": "int24",
        "name": "tick",
        "type": "int24"
      },
      {
        "internalType": "uint16",
        "name": "observationIndex",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "observationCardinality",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "observationCardinalityNext",
        "type": "uint16"
      },
      {
        "internalType": "uint8",
        "name": "feeProtocol",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "unlocked",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token0",
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
    "name": "token1",
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
    "name": "fee",
    "outputs": [
      {
        "internalType": "uint24",
        "name": "",
        "type": "uint24"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

async function debugPool() {
  try {
    // Connect to Base mainnet
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    
    console.log('Debugging SushiSwap V3 Pool...');
    console.log('Pool Address:', SUSHISWAP_V3_POOL);
    console.log('VMF Address:', VMF_ADDRESS);
    console.log('USDC Address:', USDC_ADDRESS);
    
    // Create pool contract instance
    const poolContract = new ethers.Contract(SUSHISWAP_V3_POOL, POOL_ABI, provider);
    
    // Get pool info
    const token0 = await poolContract.token0();
    const token1 = await poolContract.token1();
    const fee = await poolContract.fee();
    const slot0 = await poolContract.slot0();
    
    console.log('\n=== Pool Information ===');
    console.log('Token0:', token0);
    console.log('Token1:', token1);
    console.log('Fee:', fee);
    console.log('sqrtPriceX96:', slot0.sqrtPriceX96.toString());
    console.log('tick:', slot0.tick.toString());
    
    // Determine token order
    const isVMFToken0 = token0.toLowerCase() === VMF_ADDRESS.toLowerCase();
    const isUSDCToken0 = token0.toLowerCase() === USDC_ADDRESS.toLowerCase();
    const isVMFToken1 = token1.toLowerCase() === VMF_ADDRESS.toLowerCase();
    const isUSDCToken1 = token1.toLowerCase() === USDC_ADDRESS.toLowerCase();
    
    console.log('\n=== Token Order Analysis ===');
    console.log('Is VMF token0?', isVMFToken0);
    console.log('Is USDC token0?', isUSDCToken0);
    console.log('Is VMF token1?', isVMFToken1);
    console.log('Is USDC token1?', isUSDCToken1);
    
    if (isVMFToken0 && isUSDCToken1) {
      console.log('✅ VMF is token0, USDC is token1');
    } else if (isUSDCToken0 && isVMFToken1) {
      console.log('✅ USDC is token0, VMF is token1');
    } else {
      console.log('❌ Token order mismatch!');
    }
    
    // Calculate price manually
    const sqrtPriceX96 = slot0.sqrtPriceX96;
    if (sqrtPriceX96 > 0) {
      // price = (sqrtPriceX96^2 / 2^192)
      const price = (BigInt(sqrtPriceX96) * BigInt(sqrtPriceX96)) >> 192n;
      console.log('\n=== Price Calculation ===');
      console.log('Raw price (token1 per token0):', price.toString());
      
      if (isVMFToken0 && isUSDCToken1) {
        // VMF is token0, USDC is token1
        // price = USDC per VMF (but with wrong decimals)
        // Need to adjust for decimals: USDC (6) / VMF (18) = divide by 10^12
        const adjustedPrice = Number(price) / 1e12;
        console.log('Adjusted price (USDC per VMF):', adjustedPrice);
        console.log('Expected: ~0.010 USDC per VMF');
      } else if (isUSDCToken0 && isVMFToken1) {
        // USDC is token0, VMF is token1
        // price = VMF per USDC (but with wrong decimals)
        // Need to adjust for decimals: VMF (18) / USDC (6) = multiply by 10^12
        const adjustedPrice = Number(price) / 1e12;
        console.log('Adjusted price (VMF per USDC):', adjustedPrice);
        console.log('Inverted (USDC per VMF):', 1 / adjustedPrice);
        console.log('Expected: ~0.010 USDC per VMF');
      }
    } else {
      console.log('❌ sqrtPriceX96 is zero!');
    }
    
  } catch (error) {
    console.error('Error debugging pool:', error);
  }
}

debugPool();
