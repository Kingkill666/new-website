// Calculate real price from SushiSwap pool data with proper precision
const sqrtPriceX96 = BigInt("7809721790214165641922");
const Q96 = BigInt(2) ** BigInt(96);

console.log("SqrtPriceX96:", sqrtPriceX96.toString());
console.log("Q96:", Q96.toString());

// For VMF/USDC pool where VMF is token0 and USDC is token1:
// sqrtPriceX96 represents sqrt(price) * 2^96 where price = token1/token0
// So price = (sqrtPriceX96 / 2^96)^2

// Calculate price = (sqrtPriceX96^2) / (2^96)^2
// But we need to handle the decimals properly

// VMF has 18 decimals, USDC has 6 decimals
// So the price should be: (USDC_amount * 10^18) / (VMF_amount * 10^6)
// Which simplifies to: (USDC_amount / VMF_amount) * 10^12

// Let's calculate this step by step with proper precision
console.log("\n=== Precise Calculation ===");

// First, let's use a different approach
// We'll calculate the price using the fact that:
// price = (sqrtPriceX96 / 2^96)^2
// But we need to be careful about the decimal scaling

// Convert sqrtPriceX96 to a decimal representation
const sqrtPriceX96Decimal = Number(sqrtPriceX96) / Number(Q96);
console.log("SqrtPriceX96 as decimal:", sqrtPriceX96Decimal);

// Calculate the price
const price = sqrtPriceX96Decimal * sqrtPriceX96Decimal;
console.log("Price (before decimal scaling):", price);

// Now we need to scale this properly
// The price represents USDC per VMF, but we need to account for decimals
// VMF: 18 decimals, USDC: 6 decimals
// So we need to multiply by 10^12 to get the right scale

const priceScaled = price * Math.pow(10, 12);
console.log("Price scaled by 10^12:", priceScaled);

// Convert to the final price in USDC per VMF
const finalPrice = priceScaled / Math.pow(10, 18);
console.log("Final price (USDC per VMF):", finalPrice);

// Let's also try using the tick-based calculation
console.log("\n=== Tick-based Calculation ===");

// Get the tick from the slot0 data
// The tick is the second value in slot0
const tick = -322666; // From our previous call
console.log("Tick:", tick);

// Price = 1.0001^tick
// But we need to be careful about the sign and scaling
const priceFromTick = Math.pow(1.0001, tick);
console.log("Price from tick (1.0001^tick):", priceFromTick);

// This gives us the price in the pool's native units
// We need to scale it properly for USDC per VMF
const priceFromTickScaled = priceFromTick * Math.pow(10, 12);
const finalPriceFromTick = priceFromTickScaled / Math.pow(10, 18);
console.log("Final price from tick (USDC per VMF):", finalPriceFromTick);

// Let's also check what DexScreener might be showing
console.log("\n=== DexScreener Comparison ===");
console.log("Our oracle price: 0.081162 USDC per VMF");
console.log("Calculated price (sqrtPriceX96):", finalPrice);
console.log("Calculated price (tick):", finalPriceFromTick);

// The issue might be that our oracle is using a different calculation method
// Let's see what the actual pool reserves are
console.log("\n=== Pool Reserves Check ===");
console.log("We should check the actual token reserves in the pool to see the real price");

// Let's also try a different approach - using the fact that
// price = (reserve1 / reserve0) * (decimals0 / decimals1)
// But we need to get the actual reserves first
