// Calculate real price from SushiSwap pool data
const sqrtPriceX96 = BigInt("7809721790214165641922");
const Q96 = BigInt(2) ** BigInt(96);

console.log("SqrtPriceX96:", sqrtPriceX96.toString());
console.log("Q96:", Q96.toString());

// Calculate price = (sqrtPriceX96 / 2^96)^2
// But we need to be careful about precision

// For VMF/USDC pool where VMF is token0 and USDC is token1:
// sqrtPriceX96 represents sqrt(price) * 2^96 where price = token1/token0
// So price = (sqrtPriceX96 / 2^96)^2

// Convert to a more manageable number first
const sqrtPrice = Number(sqrtPriceX96) / Number(Q96);
console.log("SqrtPrice (as number):", sqrtPrice);

// Calculate price = sqrtPrice^2
const price = sqrtPrice * sqrtPrice;
console.log("Price (token1/token0):", price);

// Since VMF is token0 and USDC is token1, this gives us USDC per VMF
// But we need to account for decimals:
// VMF has 18 decimals, USDC has 6 decimals
// So we need to multiply by 10^(18-6) = 10^12 to get the right scale

const priceScaled = price * Math.pow(10, 12);
console.log("Price scaled (USDC per VMF, 18 decimals):", priceScaled);

// Convert to actual USDC per VMF
const priceInUSDC = priceScaled / Math.pow(10, 18);
console.log("Price in USDC per VMF:", priceInUSDC);

// Let's also try a different approach using BigInt for precision
console.log("\n=== BigInt Calculation ===");

// Calculate price using BigInt for better precision
// price = (sqrtPriceX96^2) / (2^96)^2
const sqrtPriceX96Squared = sqrtPriceX96 * sqrtPriceX96;
const Q96Squared = Q96 * Q96;

console.log("SqrtPriceX96^2:", sqrtPriceX96Squared.toString());
console.log("Q96^2:", Q96Squared.toString());

// Calculate price = sqrtPriceX96^2 / Q96^2
const priceBigInt = sqrtPriceX96Squared / Q96Squared;
console.log("Price (BigInt):", priceBigInt.toString());

// Convert to number and scale
const priceNumber = Number(priceBigInt);
const priceScaledBigInt = priceNumber * Math.pow(10, 12);
const priceInUSDCBigInt = priceScaledBigInt / Math.pow(10, 18);

console.log("Price in USDC per VMF (BigInt):", priceInUSDCBigInt);

// Let's also check what our oracle is returning
console.log("\n=== Oracle Comparison ===");
const oraclePrice = 81162457231202398; // From our oracle
const oraclePriceInUSDC = oraclePrice / Math.pow(10, 18);
console.log("Oracle price (wei):", oraclePrice);
console.log("Oracle price (USDC per VMF):", oraclePriceInUSDC);

// Calculate the difference
const difference = Math.abs(priceInUSDCBigInt - oraclePriceInUSDC);
console.log("Difference:", difference);
console.log("Difference percentage:", (difference / priceInUSDCBigInt) * 100, "%");
