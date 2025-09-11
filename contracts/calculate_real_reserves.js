// Calculate real price from actual pool reserves
const vmfBalance = BigInt("0x000000000000000000000000000000000000000000003edcb2ff6c606c050fd6");
const usdcBalance = BigInt("0x0000000000000000000000000000000000000000000000000000000074bef537");

console.log("VMF Balance (wei):", vmfBalance.toString());
console.log("USDC Balance (wei):", usdcBalance.toString());

// Convert to readable amounts
const vmfAmount = Number(vmfBalance) / Math.pow(10, 18);
const usdcAmount = Number(usdcBalance) / Math.pow(10, 6);

console.log("VMF Amount:", vmfAmount);
console.log("USDC Amount:", usdcAmount);

// Calculate price = USDC / VMF
const price = usdcAmount / vmfAmount;
console.log("Real Price (USDC per VMF):", price);

// This should match what DexScreener shows
console.log("\n=== Comparison ===");
console.log("Our oracle price: 0.081162 USDC per VMF");
console.log("Real price from reserves:", price);
console.log("Difference:", Math.abs(0.081162 - price));
console.log("Difference percentage:", (Math.abs(0.081162 - price) / price) * 100, "%");

// Let's also check if this matches the sqrtPriceX96 calculation
console.log("\n=== SqrtPriceX96 Validation ===");
const sqrtPriceX96 = BigInt("7809721790214165641922");
const Q96 = BigInt(2) ** BigInt(96);

// Calculate price from sqrtPriceX96
const sqrtPriceX96Decimal = Number(sqrtPriceX96) / Number(Q96);
const priceFromSqrt = sqrtPriceX96Decimal * sqrtPriceX96Decimal;

// Scale properly for VMF (18 decimals) and USDC (6 decimals)
const priceFromSqrtScaled = priceFromSqrt * Math.pow(10, 12);
const finalPriceFromSqrt = priceFromSqrtScaled / Math.pow(10, 18);

console.log("Price from sqrtPriceX96:", finalPriceFromSqrt);
console.log("Real price from reserves:", price);

// The issue is that our oracle calculation is wrong
// We need to fix the oracle to use the correct calculation
