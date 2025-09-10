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
    function fee() external view returns (uint24);
}

/// @title SushiSwapV3PriceOracle
/// @notice Reads spot price for a VMF/USDC pair from a SushiSwap V3 pool
/// @dev This provides accurate pricing from SushiSwap V3 pools
contract SushiSwapV3PriceOracle {
    error InvalidPool();
    error TokenMismatch();

    address public immutable vmf;
    address public immutable usdc; // 6 decimals assumed
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
    /// @dev If VMF is token1, we invert the raw price.
    function spotPriceUSDCPerVMF() external view returns (uint256 priceE18) {
        (uint160 sqrtPriceX96,,,,,,) = pool.slot0();
        
        // Ensure sqrtPriceX96 is not zero to avoid division by zero
        if (sqrtPriceX96 == 0) {
            return 0;
        }
        
        // price token1 per token0 = (sqrtPriceX96^2 / 2^192)
        // Determine orientation and normalize decimals (VMF 18, USDC 6).
        address t0 = pool.token0();
        address t1 = pool.token1();
        
        if (t0 == vmf && t1 == usdc) {
            // VMF is token0, USDC is token1
            // price = (sqrtPriceX96^2 / 2^192) * (10^6 / 10^18) = (sqrtPriceX96^2 / 2^192) / 10^12
            // To get USDC per VMF, we need to invert: 1 / price
            // Final: 10^12 * 2^192 / sqrtPriceX96^2
            // Use fixed point arithmetic to avoid overflow
            uint256 numerator = PRICE_SCALE * 1e12 * (1 << 192);
            uint256 denominator = uint256(sqrtPriceX96) * uint256(sqrtPriceX96);
            if (denominator == 0) return 0;
            priceE18 = numerator / denominator;
        } else if (t0 == usdc && t1 == vmf) {
            // USDC is token0, VMF is token1
            // price = (sqrtPriceX96^2 / 2^192) * (10^18 / 10^6) = (sqrtPriceX96^2 / 2^192) * 10^12
            // This gives us VMF per USDC, so we need to invert to get USDC per VMF
            // Use fixed point arithmetic to avoid overflow
            uint256 numerator = PRICE_SCALE * 1e12 * (1 << 192);
            uint256 denominator = uint256(sqrtPriceX96) * uint256(sqrtPriceX96);
            if (denominator == 0) return 0;
            priceE18 = numerator / denominator;
        } else {
            revert TokenMismatch();
        }
    }
}
