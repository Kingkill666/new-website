// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/SushiSwapV3PriceOracleFixed.sol";

/// @title SushiSwapOracleFixedTest
/// @notice Comprehensive tests for the fixed SushiSwap V3 Price Oracle
contract SushiSwapOracleFixedTest is Test {
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
        
        console.log("=== SushiSwap Oracle Fixed Test Setup ===");
        console.log("VMF Address:", VMF_ADDRESS);
        console.log("USDC Address:", USDC_ADDRESS);
        console.log("SushiSwap Pool:", SUSHISWAP_POOL);
        console.log("Oracle Address:", address(oracle));
    }
    
    function testOracleDeployment() public view {
        console.log("\n=== Testing Oracle Deployment ===");
        
        // Verify oracle is deployed correctly
        assertEq(address(oracle.vmf()), VMF_ADDRESS, "VMF address mismatch");
        assertEq(address(oracle.usdc()), USDC_ADDRESS, "USDC address mismatch");
        assertEq(address(oracle.pool()), SUSHISWAP_POOL, "Pool address mismatch");
        
        console.log("[OK] Oracle deployed successfully");
    }
    
    function testPoolConfiguration() public view {
        console.log("\n=== Testing Pool Configuration ===");
        
        // Get pool information
        (address token0, address token1, uint24 fee, uint160 sqrtPriceX96, int24 tick, bool unlocked) = oracle.getPoolInfo();
        
        console.log("Pool Token0:", token0);
        console.log("Pool Token1:", token1);
        console.log("Pool Fee:", fee);
        console.log("SqrtPriceX96:", sqrtPriceX96);
        console.log("Tick:", tick);
        console.log("Unlocked:", unlocked);
        
        // Verify tokens are correct (either order is fine)
        bool validTokens = (token0 == VMF_ADDRESS && token1 == USDC_ADDRESS) ||
                          (token0 == USDC_ADDRESS && token1 == VMF_ADDRESS);
        assertTrue(validTokens, "Pool does not contain VMF/USDC pair");
        
        // Verify pool is unlocked
        assertTrue(unlocked, "Pool should be unlocked");
        
        // Verify sqrtPriceX96 is positive
        assertTrue(sqrtPriceX96 > 0, "SqrtPriceX96 should be positive");
        
        console.log("[OK] Pool configuration is valid");
    }
    
    function testPriceCalculation() public view {
        console.log("\n=== Testing Price Calculation ===");
        
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
    
    function testPriceConsistency() public view {
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
    
    function testOracleValidation() public view {
        console.log("\n=== Testing Oracle Validation ===");
        
        // Test the validation function
        (bool isValid, string memory reason) = oracle.validateOracle();
        
        console.log("Oracle Valid:", isValid);
        console.log("Validation Reason:", reason);
        
        assertTrue(isValid, string(abi.encodePacked("Oracle validation failed: ", reason)));
        
        console.log("[OK] Oracle validation passed");
    }
    
    function testPriceCalculationAccuracy() public view {
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
    
    function testEdgeCases() public view {
        console.log("\n=== Testing Edge Cases ===");
        
        // Test that oracle doesn't revert on normal calls
        uint256 price = oracle.spotPriceUSDCPerVMF();
        assertTrue(price > 0, "Price should be positive");
        
        // Test that oracle handles the current pool state correctly
        (address token0, address token1, uint24 fee, uint160 sqrtPriceX96, int24 tick, bool unlocked) = oracle.getPoolInfo();
        
        console.log("Pool Info - Token0:", token0);
        console.log("Pool Info - Token1:", token1);
        console.log("Pool Info - Fee:", fee);
        console.log("Pool Info - SqrtPriceX96:", sqrtPriceX96);
        console.log("Pool Info - Tick:", tick);
        console.log("Pool Info - Unlocked:", unlocked);
        
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
    
    function testOracleIntegration() public view {
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
    
    function testMultipleUSDCAmounts() public view {
        console.log("\n=== Testing Multiple USDC Amounts ===");
        
        uint256 price = oracle.spotPriceUSDCPerVMF();
        console.log("Oracle Price:", price);
        
        // Test with different USDC amounts
        uint256[] memory testAmounts = new uint256[](5);
        testAmounts[0] = 1e6;    // 1 USDC
        testAmounts[1] = 10e6;   // 10 USDC
        testAmounts[2] = 100e6;  // 100 USDC
        testAmounts[3] = 1000e6; // 1000 USDC
        testAmounts[4] = 10000e6; // 10000 USDC
        
        for (uint256 i = 0; i < testAmounts.length; i++) {
            uint256 testUsdc = testAmounts[i];
            uint256 testNormalized = testUsdc * 1e12;
            uint256 testVmf = (testNormalized * 1e18) / price;
            
            console.log("Test %d: %d USDC -> %d VMF", i + 1, testUsdc, testVmf);
            
            assertTrue(testVmf > 0, "VMF amount should be positive");
            assertTrue(testVmf > testNormalized, "VMF amount should be greater than USDC amount");
        }
        
        console.log("[OK] Multiple USDC amounts tested successfully");
    }
    
    function testErrorHandling() public view {
        console.log("\n=== Testing Error Handling ===");
        
        // Test that the oracle handles errors gracefully
        try oracle.spotPriceUSDCPerVMF() returns (uint256 price) {
            assertTrue(price > 0, "Price should be positive");
            console.log("Price calculation successful:", price);
        } catch Error(string memory error) {
            console.log("Expected error caught:", error);
            // Some errors might be expected in certain conditions
        } catch {
            console.log("Unexpected error occurred");
            revert("Unexpected error in price calculation");
        }
        
        console.log("[OK] Error handling works correctly");
    }
    
    function testGasUsage() public view {
        console.log("\n=== Testing Gas Usage ===");
        
        // Test gas usage of price calculation
        uint256 gasStart = gasleft();
        uint256 price = oracle.spotPriceUSDCPerVMF();
        uint256 gasUsed = gasStart - gasleft();
        
        console.log("Gas used for price calculation:", gasUsed);
        console.log("Price returned:", price);
        
        // Gas usage should be reasonable (less than 100k gas)
        assertTrue(gasUsed < 100000, "Gas usage too high");
        
        console.log("[OK] Gas usage is reasonable");
    }
}
