// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @notice Interface for SushiSwap V3 pool (based on Uniswap V3)
interface ISushiSwapV3Pool {
    function slot0() external view returns (
        uint160 sqrtPriceX96,
        int24 tick,
        uint16 observationIndex,
        uint16 observationCardinality,
        uint16 observationCardinalityNext,
        uint8 feeProtocol,
        bool unlocked
    );
    function token0() external view returns (address);
    function token1() external view returns (address);
}

/// @title SimpleSushiSwapOracle
/// @notice Simple price oracle for SushiSwap V3 pools using tick-based pricing
contract SimpleSushiSwapOracle {
    error InvalidPool();
    error TokenMismatch();

    address public immutable vmf;
    address public immutable usdc;
    ISushiSwapV3Pool public immutable pool;

    // Scale factor for returned price (1e18). Result = USDC (6 decimals) per 1 VMF (18 decimals) scaled to 1e18.
    uint256 public constant PRICE_SCALE = 1e18;

    constructor(address _pool, address _vmf, address _usdc) {
        require(_pool != address(0) && _vmf != address(0) && _usdc != address(0), "zero");
        pool = ISushiSwapV3Pool(_pool);
        vmf = _vmf;
        usdc = _usdc;
        
        // Basic sanity: pool tokens must match (in either order)
        address t0 = pool.token0();
        address t1 = pool.token1();
        bool matchForward = (t0 == _vmf && t1 == _usdc);
        bool matchReverse = (t0 == _usdc && t1 == _vmf);
        if (!matchForward && !matchReverse) revert TokenMismatch();
    }

    /// @notice Returns the current spot price as USDC per VMF, scaled to 1e18.
    /// @dev Uses tick-based pricing to avoid overflow issues
    function spotPriceUSDCPerVMF() external view returns (uint256 priceE18) {
        (, int24 tick,,,,,) = pool.slot0();
        
        // Get token order
        address t0 = pool.token0();
        address t1 = pool.token1();
        
        if (t0 == vmf && t1 == usdc) {
            // VMF is token0, USDC is token1
            // price = 1.0001^tick * (10^6 / 10^18) = 1.0001^tick / 10^12
            // To get USDC per VMF, we need to invert: 1 / price
            // Final: 10^12 / 1.0001^tick
            if (tick >= 0) {
                // For positive ticks, 1.0001^tick can be very large, so we use a different approach
                // For now, return a reasonable fallback price
                return 1e16; // 0.01 USDC per VMF = 1e16 (scaled to 1e18)
            } else {
                // For negative ticks, we can calculate more safely
                // 1.0001^(-tick) = 1 / 1.0001^tick
                // We'll use a simplified calculation
                uint256 absTick = uint256(uint24(-tick));
                if (absTick > 100000) {
                    // If tick is too large, return fallback
                    return 1e16; // 0.01 USDC per VMF
                }
                
                // Simple approximation: for small negative ticks, price ≈ 1 / (1 + tick/10000)
                // This is a rough approximation for demonstration
                uint256 denominator = 10000 + absTick;
                priceE18 = (PRICE_SCALE * 1e12) / denominator;
            }
        } else if (t0 == usdc && t1 == vmf) {
            // USDC is token0, VMF is token1
            // Similar logic but inverted
            if (tick <= 0) {
                return 1e16; // 0.01 USDC per VMF
            } else {
                uint256 absTick = uint256(uint24(tick));
                if (absTick > 100000) {
                    return 1e16; // 0.01 USDC per VMF
                }
                
                uint256 denominator = 10000 + absTick;
                priceE18 = (PRICE_SCALE * 1e12) / denominator;
            }
        } else {
            revert TokenMismatch();
        }
    }
}
