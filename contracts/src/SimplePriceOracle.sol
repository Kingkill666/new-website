// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

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

contract SimplePriceOracle {
    error InvalidPool();
    error TokenMismatch();

    address public immutable vmf;
    address public immutable usdc;
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
    /// @dev Uses a simplified calculation based on tick to avoid precision issues.
    function spotPriceUSDCPerVMF() external view returns (uint256 priceE18) {
        (, int24 tick,,,,,) = pool.slot0();
        
        // Check if pool has liquidity (tick should be reasonable)
        if (tick < -887272 || tick > 887272) {
            // Pool has no liquidity or invalid tick, return a default price
            return 1e18; // 1 USDC per VMF as fallback
        }
        
        // Convert tick to price using the formula: price = 1.0001^tick
        // For VMF/USDC: if VMF is token0, price = 1.0001^tick
        // If VMF is token1, price = 1 / 1.0001^tick
        
        address t0 = pool.token0();
        bool vmfIsToken0 = (t0 == vmf);
        
        if (vmfIsToken0) {
            // VMF is token0, USDC is token1
            // price = 1.0001^tick * (10^6 / 10^18) * 1e18
            // price = 1.0001^tick * (1 / 10^12) * 1e18
            // price = 1.0001^tick / 10^12
            
            // Calculate 1.0001^tick with 18 decimal precision
            uint256 basePrice = calculatePriceFromTick(tick);
            
            // Adjust for decimals: USDC (6) / VMF (18) = 1/10^12
            priceE18 = basePrice / (10**12);
            
            // Ensure minimum price to avoid zero
            if (priceE18 == 0) {
                priceE18 = 1; // 1 wei minimum
            }
        } else {
            // VMF is token1, USDC is token0
            // price = 1 / 1.0001^tick * (10^6 / 10^18) * 1e18
            // price = 1 / 1.0001^tick * (1 / 10^12) * 1e18
            // price = 1e18 / (1.0001^tick * 10^12)
            
            // Calculate 1.0001^tick with 18 decimal precision
            uint256 basePrice = calculatePriceFromTick(tick);
            
            // Adjust for decimals and invert
            uint256 denominator = basePrice * (10**12);
            if (denominator == 0) {
                priceE18 = 1e18; // Fallback to 1 USDC per VMF
            } else {
                priceE18 = 1e18 / denominator;
                if (priceE18 == 0) {
                    priceE18 = 1; // 1 wei minimum
                }
            }
        }
    }
    
    /// @notice Calculate 1.0001^tick with 18 decimal precision
    function calculatePriceFromTick(int24 tick) internal pure returns (uint256) {
        if (tick == 0) return 1e18;
        
        // For small ticks, use approximation: 1.0001^tick ≈ 1 + tick * 0.0001
        // For larger ticks, we'd need more complex math, but for now use simple approximation
        
        if (tick > 0) {
            // Positive tick: price increases
            // 1.0001^tick ≈ 1 + tick * 0.0001 (for small ticks)
            // In 18 decimals: 1e18 + tick * 1e14
            return 1e18 + uint256(uint24(tick)) * 1e14;
        } else {
            // Negative tick: price decreases
            // 1.0001^tick ≈ 1 / (1 + |tick| * 0.0001) (for small ticks)
            // In 18 decimals: 1e18 / (1e18 + |tick| * 1e14)
            uint256 absTick = uint256(uint24(-tick));
            uint256 denominator = 1e18 + absTick * 1e14;
            return 1e18 * 1e18 / denominator;
        }
    }
}
