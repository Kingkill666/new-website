import { ethers } from "ethers";

// Contract addresses
const VMF_CONTRACT_ADDRESS = "0x2213414893259b0C48066Acd1763e7fbA97859E5";
const FIXED_PRICE_ORACLE_ADDRESS = "0x9444b5Cf6f89ab72C6173bF0dd13c7F7bec809D2";

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
    console.log("🔍 getVMFPriceFromOracle: Starting price fetch...");
    // First check if oracle is set
    const vmfContract = new ethers.Contract(VMF_CONTRACT_ADDRESS, VMF_ABI, provider);
    const oracleAddress = await vmfContract.priceOracle();
    console.log("📍 getVMFPriceFromOracle: Oracle address:", oracleAddress);
    
    if (oracleAddress === ethers.ZeroAddress) {
      console.log("⚠️ getVMFPriceFromOracle: No oracle set, using static multiple");
      // No oracle set, fall back to static multiple
      const donationMultipleBps = await vmfContract.donationMultipleBps();
      // Convert basis points to price (10000 bps = 1:1 ratio)
      const price = Number(donationMultipleBps) / 10000;
      console.log("💰 getVMFPriceFromOracle: Static price:", price);
      return price;
    }

    // Oracle is set, get price from oracle
    console.log("✅ getVMFPriceFromOracle: Oracle is set, fetching price...");
    const oracleContract = new ethers.Contract(oracleAddress, ORACLE_ABI, provider);
    const priceE18 = await oracleContract.spotPriceUSDCPerVMF();
    console.log("💰 getVMFPriceFromOracle: Raw price (E18):", priceE18.toString());
    
    // Convert from 1e18 scale to actual price
    const price = Number(ethers.formatEther(priceE18));
    console.log("💰 getVMFPriceFromOracle: Formatted price:", price);
    return price;
  } catch (error) {
    console.error("❌ getVMFPriceFromOracle: Error fetching VMF price from oracle:", error);
    // Fallback to 1:1 ratio if oracle fails
    console.log("⚠️ getVMFPriceFromOracle: Using fallback price of 1");
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
    console.log("🔍 Getting price info from oracle...");
    const vmfContract = new ethers.Contract(VMF_CONTRACT_ADDRESS, VMF_ABI, provider);
    const oracleAddress = await vmfContract.priceOracle();
    console.log("📍 Oracle address from VMF contract:", oracleAddress);
    
    if (oracleAddress === ethers.ZeroAddress) {
      console.log("⚠️ No oracle set, using static multiple");
      // No oracle set, using static multiple
      const donationMultipleBps = await vmfContract.donationMultipleBps();
      const price = Number(donationMultipleBps) / 10000;
      return { price, source: "Static Multiple" };
    }

    // Oracle is set, get price from oracle
    console.log("✅ Oracle is set, getting price from oracle contract");
    const oracleContract = new ethers.Contract(oracleAddress, ORACLE_ABI, provider);
    const priceE18 = await oracleContract.spotPriceUSDCPerVMF();
    const price = Number(ethers.formatEther(priceE18));
    console.log("💰 Oracle price (E18):", priceE18.toString());
    console.log("💰 Oracle price (formatted):", price);
    
    return { price, source: "Fixed Price Oracle" };
  } catch (error) {
    console.error("❌ Error getting price info:", error);
    return { price: 1, source: "Fallback" };
  }
}
