// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/SushiSwapV3PriceOracle.sol";

/// @title DeploySushiSwapOracle
/// @notice Deployment script for SushiSwap V3 Price Oracle with validation
contract DeploySushiSwapOracle is Script {
    // Base mainnet addresses
    address constant VMF_ADDRESS = 0x2213414893259b0C48066Acd1763e7fbA97859E5;
    address constant USDC_ADDRESS = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address constant SUSHISWAP_POOL = 0x9C83A203133B65982F35D1B00E8283C9fb518cb1;
    
    // Price validation constants
    uint256 constant MIN_PRICE_USDC_PER_VMF = 0.001e18; // 0.001 USDC per VMF (scaled to 1e18)
    uint256 constant MAX_PRICE_USDC_PER_VMF = 0.01e18;  // 0.01 USDC per VMF (scaled to 1e18)
    
    function run() external {
        console.log("=== SushiSwap Oracle Deployment Script ===");
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
        
        // Deploy the oracle
        console.log("\n=== Deploying SushiSwap Oracle ===");
        SushiSwapV3PriceOracle oracle = new SushiSwapV3PriceOracle(
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
        console.log("2. Set the oracle in the VMF contract using setPriceOracle()");
        console.log("3. Test the oracle integration");
    }
    
    function validateOracleDeployment(address oracleAddress) internal view {
        SushiSwapV3PriceOracle oracle = SushiSwapV3PriceOracle(oracleAddress);
        
        // Validate constructor parameters
        require(address(oracle.vmf()) == VMF_ADDRESS, "VMF address mismatch");
        require(address(oracle.usdc()) == USDC_ADDRESS, "USDC address mismatch");
        require(address(oracle.pool()) == SUSHISWAP_POOL, "Pool address mismatch");
        
        console.log("[OK] Constructor parameters validated");
        
        // Validate pool configuration
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
        
        // Validate price is within expected range
        uint256 priceE18 = oracle.spotPriceUSDCPerVMF();
        console.log("Current Price (scaled 1e18):", priceE18);
        
        // Convert to readable format
        uint256 priceInUSDC = priceE18 / 1e18;
        uint256 priceInCents = (priceE18 % 1e18) / 1e16;
        console.log("Price: %d.%02d USDC per VMF", priceInUSDC, priceInCents);
        
        require(priceE18 >= MIN_PRICE_USDC_PER_VMF, "Price too low");
        require(priceE18 <= MAX_PRICE_USDC_PER_VMF, "Price too high");
        
        console.log("[OK] Price is within valid range (0.001 - 0.01 USDC per VMF)");
        
        // Validate pool state
        (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, 
         uint16 observationCardinality, uint16 observationCardinalityNext, 
         uint8 feeProtocol, bool unlocked) = oracle.pool().slot0();
        
        require(sqrtPriceX96 > 0, "SqrtPriceX96 should be positive");
        require(unlocked, "Pool should be unlocked");
        
        console.log("[OK] Pool state validated");
        
        // Test price consistency
        uint256 price1 = oracle.spotPriceUSDCPerVMF();
        uint256 price2 = oracle.spotPriceUSDCPerVMF();
        require(price1 == price2, "Price should be consistent");
        
        console.log("[OK] Price consistency validated");
        
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
    }
}
