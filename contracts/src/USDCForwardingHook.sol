// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract USDCForwardingHook {
    address public forwardTo;
    address public usdc;

    constructor(address _forwardTo, address _usdc) {
        forwardTo = _forwardTo;
        usdc = _usdc;
    }

    // Example Uniswap v4 hook callback (actual signature may differ)
    function afterSwap(address _tokenIn, address tokenOut, uint256 _amountIn, uint256 amountOut, address _recipient) external {
        // If USDC is received, forward it
        if (tokenOut == usdc && amountOut > 0) {
            IERC20(usdc).transfer(forwardTo, amountOut);
        }
    }
}
