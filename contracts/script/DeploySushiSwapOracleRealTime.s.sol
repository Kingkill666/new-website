// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/SushiSwapV3PriceOracleRealTime.sol";

/// @title DeploySushiSwapOracleRealTime
/// @notice Deployment script for the real-time SushiSwap V3 Price Oracle
contract DeploySushiSwapOracleRealTime is Script {
    // Base mainnet addresses
    address constant VMF_ADDRESS = 0x2213414893259b0C48066Acd1763e7fbA97859E5;
    address constant USDC_ADDRESS = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address constant SUSHISWAP_POOL = 0x9C83A203133B65982F35D1B00E8283C9fb518cb1;
    
    // Price validation constants
    uint256 constant MIN_PRICE_USDC_PER_VMF = 0.001e18; // 0.001 USDC per VMF (scaled to 1e18)
    uint256 constant MAX_PRICE_USDC_PER_VMF = 0.1e18;   // 0.1 USDC per VMF (scaled to 1e18)
    
    function run() external {
        console.log("=== SushiSwap Oracle Real-Time Deployment Script ===");
        console.log("Network:", block.chainid);
        console.log("VMF Address:", VMF_ADDRESS);
        console.log("USDC Address:", USDC_ADDRESS);
        console.log("SushiSwap Pool:", SUSHISWAP_POOL);
        
        // Validate we're on Base mainnet
        require(block.chainid == 8453, "Must be on Base mainnet (chainId 8453)");
        
        // Get deployer private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        console.log("Deployer:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the real-time oracle
        console.log("\n=== Deploying Real-Time SushiSwap Oracle ===");
        SushiSwapV3PriceOracleRealTime oracle = new SushiSwapV3PriceOracleRealTime(
            SUSHISWAP_POOL,
            VMF_ADDRESS,
            USDC_ADDRESS
        );
        
        console.log("Oracle deployed at:", address(oracle));
        
        vm.stopBroadcast();
        
        // Validate deployment
        console.log("\n=== Validating Deployment ===");
        validateOracleDeployment(address(oracle));
        
        console.log("\n=== Deployment Complete ===");
        console.log("Oracle Address:", address(oracle));
        console.log("Next steps:");
        console.log("1. Verify the oracle contract on BaseScan");
        console.log("2. Test the oracle with real-time price calculation");
        console.log("3. Set the oracle in the VMF contract using setPriceOracle()");
        console.log("4. Test the oracle integration with DexScreener data");
    }
    
    function validateOracleDeployment(address oracleAddress) internal view {
        SushiSwapV3PriceOracleRealTime oracle = SushiSwapV3PriceOracleRealTime(oracleAddress);
        
        // Validate constructor parameters
        require(address(oracle.vmf()) == VMF_ADDRESS, "VMF address mismatch");
        require(address(oracle.usdc()) == USDC_ADDRESS, "USDC address mismatch");
        require(address(oracle.pool()) == SUSHISWAP_POOL, "Pool address mismatch");
        
        console.log("[OK] Constructor parameters validated");
        
        // Validate pool configuration
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
        require(validTokens, "Pool does not contain VMF/USDC pair");
        
        console.log("[OK] Pool configuration validated");
        
        // Validate real-time price calculation
        uint256 priceE18 = oracle.spotPriceUSDCPerVMF();
        console.log("Current Price (scaled 1e18):", priceE18);
        
        // Convert to readable format
        uint256 priceInUSDC = priceE18 / 1e18;
        uint256 priceInCents = (priceE18 % 1e18) / 1e16;
        console.log("Price: %d.%02d USDC per VMF", priceInUSDC, priceInCents);
        
        require(priceE18 >= MIN_PRICE_USDC_PER_VMF, "Price too low");
        require(priceE18 <= MAX_PRICE_USDC_PER_VMF, "Price too high");
        
        console.log("[OK] Price is within valid range (0.001 - 0.1 USDC per VMF)");
        
        // Validate pool state
        require(sqrtPriceX96 > 0, "SqrtPriceX96 should be positive");
        require(unlocked, "Pool should be unlocked");
        
        console.log("[OK] Pool state validated");
        
        // Test price consistency
        uint256 price1 = oracle.spotPriceUSDCPerVMF();
        uint256 price2 = oracle.spotPriceUSDCPerVMF();
        require(price1 == price2, "Price should be consistent");
        
        console.log("[OK] Price consistency validated");
        
        // Test oracle validation function
        (bool isValid, string memory reason) = oracle.validateOracle();
        require(isValid, string(abi.encodePacked("Oracle validation failed: ", reason)));
        
        console.log("[OK] Oracle validation function passed");
        
        // Test current price info
        (uint160 currentSqrtPriceX96, int24 currentTick, uint256 currentPriceE18, bool currentIsValid) = oracle.getCurrentPriceInfo();
        console.log("Current Price Info:");
        console.log("  SqrtPriceX96:", currentSqrtPriceX96);
        console.log("  Tick:", currentTick);
        console.log("  Price:", currentPriceE18);
        console.log("  Valid:", currentIsValid);
        
        require(currentIsValid, "Current price info should be valid");
        
        console.log("[OK] Current price info validated");
        
        // Test integration scenario
        uint256 usdcAmount = 1000e6; // 1000 USDC (6 decimals)
        uint256 normalizedUsdcAmount = usdcAmount * 1e12; // Convert to 18 decimals
        uint256 vmfAmount = (normalizedUsdcAmount * 1e18) / priceE18;
        
        console.log("Integration Test:");
        console.log("  USDC Amount:", usdcAmount);
        console.log("  VMF Amount:", vmfAmount);
        
        require(vmfAmount > 0, "VMF amount should be positive");
        require(vmfAmount > normalizedUsdcAmount, "VMF amount should be greater than USDC amount");
        
        console.log("[OK] Integration test passed");
        
        // Test multiple USDC amounts
        uint256[] memory testAmounts = new uint256[](3);
        testAmounts[0] = 1e6;    // 1 USDC
        testAmounts[1] = 100e6;  // 100 USDC
        testAmounts[2] = 1000e6; // 1000 USDC
        
        for (uint256 i = 0; i < testAmounts.length; i++) {
            uint256 testUsdc = testAmounts[i];
            uint256 testNormalized = testUsdc * 1e12;
            uint256 testVmf = (testNormalized * 1e18) / priceE18;
            
            require(testVmf > 0, "VMF amount should be positive");
            require(testVmf > testNormalized, "VMF amount should be greater than USDC amount");
        }
        
        console.log("[OK] Multiple USDC amounts test passed");
    }
}
