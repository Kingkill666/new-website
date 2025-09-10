// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @notice Minimal interfaces for a Uniswap v3/v4-style pool (slot0 + token addresses).
/// @dev Adjust if actual v4 pool ABIs differ once finalized.
interface IUniV4LikePool {
    function slot0() external view returns (
        uint160 sqrtPriceX96,
        int24 tick,
        uint16 obsIndex,
        uint16 obsCardinality,
        uint16 obsCardinalityNext,
        uint8 feeProtocol,
        bool unlocked
    );
    function token0() external view returns (address);
    function token1() external view returns (address);
}

/// @title UniswapV4PriceOracle
/// @notice Reads spot (or optionally TWAP) price for a VMF/USDC pair from a Uniswap v4-like pool.
/// @dev This provides a quick way to replace a static donationMultiple with a dynamic on-chain price.
///      WARNING: Spot prices are manipulable within a single transaction (MEV / flash loans). For
///      production critical value decisions, use a TWAP (observation-based) or an external oracle.
contract UniswapV4PriceOracle {
    error InvalidPool();
    error TokenMismatch();

    address public immutable vmf;
    address public immutable usdc; // 6 decimals assumed
    IUniV4LikePool public immutable pool;

    // Scale factor for returned price (1e18). Result = USDC (6 decimals) per 1 VMF (18 decimals) scaled to 1e18.
    uint256 public constant PRICE_SCALE = 1e18;

    constructor(address _pool, address _vmf, address _usdc) {
        require(_pool != address(0) && _vmf != address(0) && _usdc != address(0), "zero");
        pool = IUniV4LikePool(_pool);
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
        // price token1 per token0 = (sqrtPriceX96^2 / 2^192)
        // Determine orientation and normalize decimals (VMF 18, USDC 6).
        address t0 = pool.token0();
        bool vmfIsToken0 = (t0 == vmf);
        uint256 sqrtP = uint256(sqrtPriceX96);
        uint256 ratioX192 = (sqrtP * sqrtP); // up to 160*2=320 bits fits in 512; 0.8.x auto wrap unchecked? use unchecked.
        // Q96 * Q96 => Q192 fixed point.
        // priceToken1PerToken0 (raw 1e0 scale) = ratioX192 / 2^192
        // We'll compute with 1e18 scaling while adjusting decimals.
        // Base formula: price(USDC per VMF) =
        //   if vmfIsToken0: (ratioX192 / 2^192) * (10^USDC_DECIMALS / 10^VMF_DECIMALS)
        //   else: (1 / (ratioX192 / 2^192)) * (10^USDC_DECIMALS / 10^VMF_DECIMALS)
        // We incorporate 1e18 scaling.
        uint256 numerator;
        uint256 denominator;
        if (vmfIsToken0) {
            // VMF is token0, USDC is token1
            // price = (ratioX192 / 2^192) * (10^6 / 10^18) * 1e18
            // price = (ratioX192 / 2^192) * (1 / 10^12) * 1e18
            // price = (ratioX192 * 1e18) / (2^192 * 10^12)
            numerator = ratioX192 * 1e18;
            denominator = (1 << 192) * (10**12); // 2^192 * 10^12
            priceE18 = numerator / denominator;
        } else {
            // VMF is token1, USDC is token0
            // price = (2^192 / ratioX192) * (10^6 / 10^18) * 1e18
            // price = (2^192 / ratioX192) * (1 / 10^12) * 1e18
            // price = (2^192 * 1e18) / (ratioX192 * 10^12)
            numerator = (1 << 192) * 1e18;
            denominator = ratioX192 * (10**12); // ratioX192 * 10^12
            priceE18 = numerator / denominator;
        }
    }
}
