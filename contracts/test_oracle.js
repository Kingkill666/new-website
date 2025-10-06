const { ethers } = require('ethers');

// Contract addresses
const VMF_CONTRACT_ADDRESS = "0x2213414893259b0C48066Acd1763e7fbA97859E5";
const FIXED_PRICE_ORACLE_ADDRESS = "0x9444b5Cf6f89ab72C6173bF0dd13c7F7bec809D2";

// Oracle ABI
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
  }
];

async function testOracle() {
  try {
    // Connect to Base mainnet
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    
    console.log('Testing Fixed Price Oracle...');
    console.log('Oracle Address:', FIXED_PRICE_ORACLE_ADDRESS);
    
    // Create oracle contract instance
    const oracleContract = new ethers.Contract(FIXED_PRICE_ORACLE_ADDRESS, ORACLE_ABI, provider);
    
    // Get the price
    const priceE18 = await oracleContract.spotPriceUSDCPerVMF();
    const price = Number(ethers.formatEther(priceE18));
    
    console.log('Raw price (E18):', priceE18.toString());
    console.log('Price (USDC per VMF):', price);
    console.log('Expected price from SushiSwap: ~0.010 USDC per VMF');
    
    if (price > 0.005 && price < 0.020) {
      console.log('✅ Price looks correct!');
    } else {
      console.log('❌ Price seems incorrect');
    }
    
  } catch (error) {
    console.error('Error testing oracle:', error);
  }
}

testOracle();
