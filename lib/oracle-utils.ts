import { ethers } from "ethers";

// Contract addresses
const VMF_CONTRACT_ADDRESS = "0x2213414893259b0C48066Acd1763e7fbA97859E5";
const ORACLE_ADDRESS = "0x9859647d142F79736CF562E0F6B4218b24A90D35";

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
    // First check if oracle is set
    const vmfContract = new ethers.Contract(VMF_CONTRACT_ADDRESS, VMF_ABI, provider);
    const oracleAddress = await vmfContract.priceOracle();
    
    if (oracleAddress === ethers.ZeroAddress) {
      // No oracle set, fall back to static multiple
      const donationMultipleBps = await vmfContract.donationMultipleBps();
      // Convert basis points to price (10000 bps = 1:1 ratio)
      return Number(donationMultipleBps) / 10000;
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
 * Calculate VMF amount based on USDC amount and current oracle price
 * @param usdcAmount - Amount in USDC (as number)
 * @param provider - Ethers provider instance
 * @returns Promise<number> - VMF amount to receive
 */
export async function calculateVMFAmount(usdcAmount: number, provider: ethers.Provider): Promise<number> {
  try {
    const pricePerVMF = await getVMFPriceFromOracle(provider);
    
    if (pricePerVMF <= 0) {
      throw new Error("Invalid price from oracle");
    }
    
    // Calculate: USDC amount / price per VMF = VMF amount
    return usdcAmount / pricePerVMF;
  } catch (error) {
    console.error("Error calculating VMF amount:", error);
    // Fallback to 1:1 ratio
    return usdcAmount;
  }
}

/**
 * Get price information for display
 * @param provider - Ethers provider instance
 * @returns Promise<{price: number, source: string}> - Price and source info
 */
export async function getPriceInfo(provider: ethers.Provider): Promise<{price: number, source: string}> {
  try {
    const vmfContract = new ethers.Contract(VMF_CONTRACT_ADDRESS, VMF_ABI, provider);
    const oracleAddress = await vmfContract.priceOracle();
    
    if (oracleAddress === ethers.ZeroAddress) {
      // No oracle set, using static multiple
      const donationMultipleBps = await vmfContract.donationMultipleBps();
      const price = Number(donationMultipleBps) / 10000;
      return { price, source: "Static Multiple" };
    }

    // Oracle is set, get price from oracle
    const oracleContract = new ethers.Contract(oracleAddress, ORACLE_ABI, provider);
    const priceE18 = await oracleContract.spotPriceUSDCPerVMF();
    const price = Number(ethers.formatEther(priceE18));
    
    return { price, source: "SushiSwap Oracle" };
  } catch (error) {
    console.error("Error getting price info:", error);
    return { price: 1, source: "Fallback" };
  }
}
