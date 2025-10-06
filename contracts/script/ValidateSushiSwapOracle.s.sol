// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/SushiSwapV3PriceOracle.sol";

/// @title ValidateSushiSwapOracle
/// @notice Validation script for existing SushiSwap V3 Price Oracle
contract ValidateSushiSwapOracle is Script {
    // Base mainnet addresses
    address constant VMF_ADDRESS = 0x2213414893259b0C48066Acd1763e7fbA97859E5;
    address constant USDC_ADDRESS = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address constant SUSHISWAP_POOL = 0x9C83A203133B65982F35D1B00E8283C9fb518cb1;
    
    // Price validation constants
    uint256 constant MIN_PRICE_USDC_PER_VMF = 0.001e18; // 0.001 USDC per VMF (scaled to 1e18)
    uint256 constant MAX_PRICE_USDC_PER_VMF = 0.01e18;  // 0.01 USDC per VMF (scaled to 1e18)
    
    function run() external view {
        console.log("=== SushiSwap Oracle Validation Script ===");
        console.log("Network:", block.chainid);
        console.log("VMF Address:", VMF_ADDRESS);
        console.log("USDC Address:", USDC_ADDRESS);
        console.log("SushiSwap Pool:", SUSHISWAP_POOL);
        
        // Validate we're on Base mainnet
        require(block.chainid == 8453, "Must be on Base mainnet (chainId 8453)");
        
        // Get oracle address from environment or use a default
        address oracleAddress = vm.envOr("ORACLE_ADDRESS", address(0));
        if (oracleAddress == address(0)) {
            console.log("Please set ORACLE_ADDRESS environment variable");
            return;
        }
        
        console.log("Oracle Address:", oracleAddress);
        
        // Validate the oracle
        validateOracle(oracleAddress);
        
        console.log("\n=== Validation Complete ===");
        console.log("[OK] All validations passed!");
    }
    
    function validateOracle(address oracleAddress) internal view {
        SushiSwapV3PriceOracle oracle = SushiSwapV3PriceOracle(oracleAddress);
        
        console.log("\n=== Validating Oracle Configuration ===");
        
        // Validate constructor parameters
        address vmf = address(oracle.vmf());
        address usdc = address(oracle.usdc());
        address pool = address(oracle.pool());
        
        console.log("Oracle VMF:", vmf);
        console.log("Oracle USDC:", usdc);
        console.log("Oracle Pool:", pool);
        
        require(vmf == VMF_ADDRESS, "VMF address mismatch");
        require(usdc == USDC_ADDRESS, "USDC address mismatch");
        require(pool == SUSHISWAP_POOL, "Pool address mismatch");
        
        console.log("[OK] Constructor parameters validated");
        
        // Validate pool configuration
        console.log("\n=== Validating Pool Configuration ===");
        
        address token0 = oracle.pool().token0();
        address token1 = oracle.pool().token1();
        uint24 fee = oracle.pool().fee();
        
        console.log("Pool Token0:", token0);
        console.log("Pool Token1:", token1);
        console.log("Pool Fee:", fee);
        
        // Verify tokens are correct (either order is fine)
        bool validTokens = (token0 == VMF_ADDRESS && token1 == USDC_ADDRESS) ||
                          (token0 == USDC_ADDRESS && token1 == VMF_ADDRESS);
        require(validTokens, "Pool does not contain VMF/USDC pair");
        
        console.log("[OK] Pool configuration validated");
        
        // Validate price range
        console.log("\n=== Validating Price Range ===");
        
        uint256 priceE18 = oracle.spotPriceUSDCPerVMF();
        console.log("Current Price (scaled 1e18):", priceE18);
        
        // Convert to readable format
        uint256 priceInUSDC = priceE18 / 1e18;
        uint256 priceInCents = (priceE18 % 1e18) / 1e16;
        console.log("Price: %d.%02d USDC per VMF", priceInUSDC, priceInCents);
        
        require(priceE18 >= MIN_PRICE_USDC_PER_VMF, "Price too low (< 0.001 USDC per VMF)");
        require(priceE18 <= MAX_PRICE_USDC_PER_VMF, "Price too high (> 0.01 USDC per VMF)");
        
        console.log("[OK] Price is within valid range (0.001 - 0.01 USDC per VMF)");
        
        // Validate pool state
        console.log("\n=== Validating Pool State ===");
        
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
        
        require(sqrtPriceX96 > 0, "SqrtPriceX96 should be positive");
        require(unlocked, "Pool should be unlocked");
        
        console.log("[OK] Pool state validated");
        
        // Test price consistency
        console.log("\n=== Testing Price Consistency ===");
        
        uint256 price1 = oracle.spotPriceUSDCPerVMF();
        uint256 price2 = oracle.spotPriceUSDCPerVMF();
        uint256 price3 = oracle.spotPriceUSDCPerVMF();
        
        console.log("Price 1:", price1);
        console.log("Price 2:", price2);
        console.log("Price 3:", price3);
        
        require(price1 == price2, "Price should be consistent between calls");
        require(price2 == price3, "Price should be consistent between calls");
        
        console.log("[OK] Price consistency validated");
        
        // Test integration scenario
        console.log("\n=== Testing Integration Scenario ===");
        
        uint256 usdcAmount = 1000e6; // 1000 USDC (6 decimals)
        uint256 normalizedUsdcAmount = usdcAmount * 1e12; // Convert to 18 decimals
        uint256 vmfAmount = (normalizedUsdcAmount * 1e18) / priceE18;
        
        console.log("Integration Test:");
        console.log("  USDC Amount (6 decimals):", usdcAmount);
        console.log("  Normalized USDC Amount (18 decimals):", normalizedUsdcAmount);
        console.log("  Oracle Price (1e18):", priceE18);
        console.log("  Calculated VMF Amount:", vmfAmount);
        
        require(vmfAmount > 0, "VMF amount should be positive");
        require(vmfAmount > normalizedUsdcAmount, "VMF amount should be greater than USDC amount");
        
        console.log("[OK] Integration test passed");
        
        // Test edge cases
        console.log("\n=== Testing Edge Cases ===");
        
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
            uint256 testVmf = (testNormalized * 1e18) / priceE18;
            
            console.log("Test %d: %d USDC -> %d VMF", i + 1, testUsdc, testVmf);
            
            require(testVmf > 0, "VMF amount should be positive");
            require(testVmf > testNormalized, "VMF amount should be greater than USDC amount");
        }
        
        console.log("[OK] Edge cases validated");
    }
}
