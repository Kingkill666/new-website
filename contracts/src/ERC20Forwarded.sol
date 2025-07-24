interface IUniswapV4Pool {
    function swap(
        address recipient,
        int256 amountSpecified,
        uint160 sqrtPriceLimitX96,
        bytes calldata data
    ) external returns (int256 amount0, int256 amount1);
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {SafeTransferLib} from "solady/utils/SafeTransferLib.sol";


interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IUniswapV4Singleton {
    function createPool(address tokenA, address tokenB, uint24 fee, address hook) external returns (address pool);
    function addLiquidity(
        address pool,
        uint256 amountA,
        uint256 amountB,
        address to
    ) external returns (uint256 liquidity);
}

contract ERC20Forwarded {
    // Swap VMF for USDC in a Uniswap v4 pool
    function sellVMF(
        address pool,
        address vmfToken,
        uint256 amountVMF,
        address recipient
    ) external {
        // Approve pool to spend VMF
        IERC20(vmfToken).approve(pool, amountVMF);
        // Uniswap v4 swap: amountSpecified is negative for sell (exact input)
        // sqrtPriceLimitX96: set to 0 for no limit
        // data: empty for simple swap
        int256 amountSpecified = -int256(amountVMF); // negative for sell
        uint160 sqrtPriceLimitX96 = 0;
        bytes memory data = "";
        IUniswapV4Pool(pool).swap(recipient, amountSpecified, sqrtPriceLimitX96, data);
        emit TokensForwarded(vmfToken, amountVMF);
    }
    using SafeTransferLib for address;

    address public destination;

    address[] public tokensToForward;

    event TokensForwarded(address indexed token, uint256 amount);

    function setTokensToForward(address[] calldata tokens) external {
        // Add access control as needed
        tokensToForward = tokens;
    }

    constructor(address _destination) {
        destination = _destination;
    }


    // Forward all tokens in the list to the destination
    function forwardAll() external {
        for (uint256 i = 0; i < tokensToForward.length; i++) {
            address token = tokensToForward[i];
            uint256 balance = IERC20(token).balanceOf(address(this));
            if (balance > 0) {
                token.safeTransfer(destination, balance);
                emit TokensForwarded(token, balance);
            }
        }
    }

    // Approve Uniswap v4 singleton to spend tokens
    function approveSingleton(address token, address singleton, uint256 amount) external {
        IERC20(token).approve(singleton, amount);
    }

    // Create a new Uniswap v4 pool
    function createPool(
        address singleton,
        address tokenA,
        address tokenB,
        uint24 fee,
        address hook
    ) external returns (address pool) {
        pool = IUniswapV4Singleton(singleton).createPool(tokenA, tokenB, fee, hook);
    }

    // Add liquidity to Uniswap v4 pool
    function addLiquidityV4(
        address singleton,
        address pool,
        uint256 amountA,
        uint256 amountB,
        address to
    ) external returns (uint256 liquidity) {
        liquidity = IUniswapV4Singleton(singleton).addLiquidity(pool, amountA, amountB, to);
    }

    // Forward a single token (manual trigger)
    function forward(address token) external {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to forward");
        token.safeTransfer(destination, balance);
        emit TokensForwarded(token, balance);
    }

    function setDestination(address _destination) external {
        // Add access control as needed
        destination = _destination;
    }
}
