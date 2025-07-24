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
