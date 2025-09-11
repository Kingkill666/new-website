// Debug the price calculation from pool reserves
const vmfBalance = BigInt("296857903781153301925846");
const usdcBalance = BigInt("1958671671");

console.log("VMF Balance (wei):", vmfBalance.toString());
console.log("USDC Balance (wei):", usdcBalance.toString());

// Calculate price = (USDC balance * 1e12) / VMF balance
// This accounts for VMF (18 decimals) and USDC (6 decimals)
const price = (usdcBalance * BigInt("1000000000000")) / vmfBalance;

console.log("Calculated price (wei):", price.toString());

// Convert to readable format
const priceInUSDC = Number(price) / Math.pow(10, 18);
console.log("Price in USDC per VMF:", priceInUSDC);

// Check if it's within our validation range
const minPrice = 0.001e18; // 0.001 USDC per VMF
const maxPrice = 0.1e18;   // 0.1 USDC per VMF

console.log("Min price (wei):", minPrice.toString());
console.log("Max price (wei):", maxPrice.toString());
console.log("Calculated price (wei):", price.toString());

console.log("Is price >= min?", price >= BigInt(minPrice.toString()));
console.log("Is price <= max?", price <= BigInt(maxPrice.toString()));

// The issue is that our calculated price is 0.006598 USDC per VMF
// But our validation range is 0.001 to 0.1 USDC per VMF
// So 0.006598 should be valid, but there might be a precision issue

// Let's check the exact calculation
const priceExact = (usdcBalance * BigInt("1000000000000")) / vmfBalance;
console.log("Exact price calculation:", priceExact.toString());

// Convert to number for comparison
const priceNumber = Number(priceExact);
console.log("Price as number:", priceNumber);
console.log("Price in USDC:", priceNumber / Math.pow(10, 18));

// Check against our validation constants
const minPriceBigInt = BigInt("1000000000000000"); // 0.001e18
const maxPriceBigInt = BigInt("100000000000000000"); // 0.1e18

console.log("Min price BigInt:", minPriceBigInt.toString());
console.log("Max price BigInt:", maxPriceBigInt.toString());
console.log("Calculated price BigInt:", priceExact.toString());

console.log("Is price >= min (BigInt)?", priceExact >= minPriceBigInt);
console.log("Is price <= max (BigInt)?", priceExact <= maxPriceBigInt);
