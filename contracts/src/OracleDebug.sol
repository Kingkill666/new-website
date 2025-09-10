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

contract OracleDebug {
    IUniV4LikePool public immutable pool;
    address public immutable vmf;
    address public immutable usdc;

    constructor(address _pool, address _vmf, address _usdc) {
        pool = IUniV4LikePool(_pool);
        vmf = _vmf;
        usdc = _usdc;
    }

    function debugSlot0() external view returns (
        uint160 sqrtPriceX96,
        int24 tick,
        uint16 obsIndex,
        uint16 obsCardinality,
        uint16 obsCardinalityNext,
        uint8 feeProtocol,
        bool unlocked
    ) {
        return pool.slot0();
    }

    function debugTokens() external view returns (address token0, address token1) {
        return (pool.token0(), pool.token1());
    }

    function debugPriceCalculation() external view returns (
        uint256 sqrtPriceX96,
        uint256 ratioX192,
        uint256 numerator,
        uint256 denominator,
        uint256 priceE18,
        bool vmfIsToken0
    ) {
        (uint160 sqrtPriceX96Raw,,,,,,) = pool.slot0();
        sqrtPriceX96 = uint256(sqrtPriceX96Raw);
        
        address t0 = pool.token0();
        vmfIsToken0 = (t0 == vmf);
        
        ratioX192 = sqrtPriceX96 * sqrtPriceX96;
        
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
