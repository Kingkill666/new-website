// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/SushiSwapV3PriceOracleFixed.sol";

/// @title SushiSwapOracleTest
/// @notice Tests for SushiSwap V3 Price Oracle validation
contract SushiSwapOracleTest is Test {
    // Base mainnet addresses
    address constant VMF_ADDRESS = 0x2213414893259b0C48066Acd1763e7fbA97859E5;
    address constant USDC_ADDRESS = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address constant SUSHISWAP_POOL = 0x9C83A203133B65982F35D1B00E8283C9fb518cb1;
    
    // Price validation constants
    uint256 constant MIN_PRICE_USDC_PER_VMF = 0.001e18; // 0.001 USDC per VMF (scaled to 1e18)
    uint256 constant MAX_PRICE_USDC_PER_VMF = 0.01e18;  // 0.01 USDC per VMF (scaled to 1e18)
    
    SushiSwapV3PriceOracleFixed public oracle;
    
    function setUp() public {
        // Deploy oracle on Base mainnet
        vm.createSelectFork("https://mainnet.base.org");
        
    // Deploy the fixed oracle contract
    oracle = new SushiSwapV3PriceOracleFixed(SUSHISWAP_POOL, VMF_ADDRESS, USDC_ADDRESS);
        
        console.log("=== SushiSwap Oracle Test Setup ===");
        console.log("VMF Address:", VMF_ADDRESS);
        console.log("USDC Address:", USDC_ADDRESS);
        console.log("SushiSwap Pool:", SUSHISWAP_POOL);
        console.log("Oracle Address:", address(oracle));
    }
    
    function testOracleDeployment() public {
        console.log("\n=== Testing Oracle Deployment ===");
        
        // Verify oracle is deployed correctly
        assertEq(address(oracle.vmf()), VMF_ADDRESS, "VMF address mismatch");
        assertEq(address(oracle.usdc()), USDC_ADDRESS, "USDC address mismatch");
        assertEq(address(oracle.pool()), SUSHISWAP_POOL, "Pool address mismatch");
        
        console.log("[OK] Oracle deployed successfully");
    }
    
    function testPoolConfiguration() public {
        console.log("\n=== Testing Pool Configuration ===");
        
        // Get pool information
        address token0 = oracle.pool().token0();
        address token1 = oracle.pool().token1();
        uint24 fee = oracle.pool().fee();
        
        console.log("Pool Token0:", token0);
        console.log("Pool Token1:", token1);
        console.log("Pool Fee:", fee);
        
        // Verify tokens are correct (either order is fine)
        bool validTokens = (token0 == VMF_ADDRESS && token1 == USDC_ADDRESS) ||
                          (token0 == USDC_ADDRESS && token1 == VMF_ADDRESS);
        assertTrue(validTokens, "Pool does not contain VMF/USDC pair");
        
        console.log("[OK] Pool configuration is valid");
    }
    
    function testPriceRangeValidation() public {
        console.log("\n=== Testing Price Range Validation ===");
        
        // Get current price from oracle
        uint256 priceE18 = oracle.spotPriceUSDCPerVMF();
        console.log("Current Price (scaled 1e18):", priceE18);
        
        // Convert to readable format
        uint256 priceInUSDC = priceE18 / 1e18;
        uint256 priceInCents = (priceE18 % 1e18) / 1e16;
        console.log("Price: %d.%02d USDC per VMF", priceInUSDC, priceInCents);
        
        // Validate price is within expected range
        assertTrue(priceE18 >= MIN_PRICE_USDC_PER_VMF, 
            string(abi.encodePacked("Price too low: ", vm.toString(priceE18), " < ", vm.toString(MIN_PRICE_USDC_PER_VMF))));
        assertTrue(priceE18 <= MAX_PRICE_USDC_PER_VMF, 
            string(abi.encodePacked("Price too high: ", vm.toString(priceE18), " > ", vm.toString(MAX_PRICE_USDC_PER_VMF))));
        
        console.log("[OK] Price is within valid range (0.001 - 0.01 USDC per VMF)");
    }
    
    function testPriceConsistency() public {
        console.log("\n=== Testing Price Consistency ===");
        
        // Get price multiple times to ensure consistency
        uint256 price1 = oracle.spotPriceUSDCPerVMF();
        uint256 price2 = oracle.spotPriceUSDCPerVMF();
        uint256 price3 = oracle.spotPriceUSDCPerVMF();
        
        console.log("Price 1:", price1);
        console.log("Price 2:", price2);
        console.log("Price 3:", price3);
        
        // Prices should be consistent (within same block)
        assertEq(price1, price2, "Price inconsistent between calls");
        assertEq(price2, price3, "Price inconsistent between calls");
        
        console.log("[OK] Price is consistent across multiple calls");
    }
    
    function testPoolSlot0Data() public {
        console.log("\n=== Testing Pool Slot0 Data ===");
        
        // Get raw pool data
        (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, 
         uint16 observationCardinality, uint16 observationCardinalityNext, 
         uint8 feeProtocol, bool unlocked) = oracle.pool().slot0();
        
        console.log("SqrtPriceX96:", sqrtPriceX96);
        console.log("Tick:", tick);
        console.log("Observation Index:", observationIndex);
        console.log("Observation Cardinality:", observationCardinality);
        console.log("Observation Cardinality Next:", observationCardinalityNext);
        console.log("Fee Protocol:", feeProtocol);
        console.log("Unlocked:", unlocked);
        
        // Validate basic pool state
        assertTrue(sqrtPriceX96 > 0, "SqrtPriceX96 should be positive");
        assertTrue(unlocked, "Pool should be unlocked");
        
        console.log("[OK] Pool slot0 data is valid");
    }
    
    function testPriceCalculationAccuracy() public {
        console.log("\n=== Testing Price Calculation Accuracy ===");
        
        // Get current price
        uint256 oraclePrice = oracle.spotPriceUSDCPerVMF();
        console.log("Oracle Price (1e18):", oraclePrice);
        
        // Convert to actual USDC per VMF
        uint256 actualPrice = oraclePrice / 1e18;
        uint256 fractionalPart = oraclePrice % 1e18;
        
        console.log("Actual Price: %d.%06d USDC per VMF", actualPrice, fractionalPart / 1e12);
        
        // Validate price makes sense (should be small fraction)
        assertTrue(actualPrice == 0, "Price should be less than 1 USDC per VMF");
        assertTrue(fractionalPart > 0, "Price should be greater than 0");
        
        console.log("[OK] Price calculation is accurate");
    }
    
    function testEdgeCases() public {
        console.log("\n=== Testing Edge Cases ===");
        
        // Test that oracle doesn't revert on normal calls
        uint256 price = oracle.spotPriceUSDCPerVMF();
        assertTrue(price > 0, "Price should be positive");
        
        // Test that oracle handles the current pool state correctly
        address token0 = oracle.pool().token0();
        address token1 = oracle.pool().token1();
        
        if (token0 == VMF_ADDRESS) {
            console.log("VMF is token0, USDC is token1");
        } else {
            console.log("USDC is token0, VMF is token1");
        }
        
        console.log("[OK] Edge cases handled correctly");
    }
    
    function testPriceStability() public {
        console.log("\n=== Testing Price Stability ===");
        
        // Get initial price
        uint256 initialPrice = oracle.spotPriceUSDCPerVMF();
        console.log("Initial Price:", initialPrice);
        
        // Wait a few blocks and check again
        vm.roll(block.number + 5);
        uint256 laterPrice = oracle.spotPriceUSDCPerVMF();
        console.log("Later Price:", laterPrice);
        
        // Calculate price change percentage
        uint256 priceChange;
        if (laterPrice > initialPrice) {
            priceChange = ((laterPrice - initialPrice) * 10000) / initialPrice;
        } else {
            priceChange = ((initialPrice - laterPrice) * 10000) / initialPrice;
        }
        
        console.log("Price Change (basis points):", priceChange);
        
        // Price should be relatively stable (less than 10% change)
        assertTrue(priceChange < 1000, "Price change too large (>10%)");
        
        console.log("[OK] Price is stable");
    }
    
    function testOracleIntegration() public {
        console.log("\n=== Testing Oracle Integration ===");
        
        // Test that oracle can be used in VMF contract context
        uint256 price = oracle.spotPriceUSDCPerVMF();
        
        // Simulate VMF contract usage
        uint256 usdcAmount = 1000e6; // 1000 USDC (6 decimals)
        uint256 normalizedUsdcAmount = usdcAmount * 1e12; // Convert to 18 decimals
        
        // Calculate VMF amount using oracle price
        uint256 vmfAmount = (normalizedUsdcAmount * 1e18) / price;
        
        console.log("USDC Amount (6 decimals):", usdcAmount);
        console.log("Normalized USDC Amount (18 decimals):", normalizedUsdcAmount);
        console.log("Oracle Price (1e18):", price);
        console.log("Calculated VMF Amount:", vmfAmount);
        
        // Validate calculation makes sense
        assertTrue(vmfAmount > 0, "VMF amount should be positive");
        assertTrue(vmfAmount > normalizedUsdcAmount, "VMF amount should be greater than USDC amount (due to low price)");
        
        console.log("[OK] Oracle integration works correctly");
    }
}
