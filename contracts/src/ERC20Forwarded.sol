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
    /**
     * @notice (Deprecated) Perform a swap sending output directly to a provided recipient.
     * Prefer using sellAndForward which enforces forwarding to the configured destination.
     */
    function sellVMF(
        address pool,
        address vmfToken,
        uint256 amountVMF,
        address recipient
    ) external {
        IERC20(vmfToken).approve(pool, amountVMF);
        int256 amountSpecified = -int256(amountVMF); // negative for exact input sell
        IUniswapV4Pool(pool).swap(recipient, amountSpecified, 0, "");
        emit LegacySellExecuted(vmfToken, recipient, amountVMF);
    }

    /**
     * @notice Swap VMF for the paired token in the pool and immediately forward any balances
     *         of the configured tokensToForward list to the destination address.
     * @dev Assumes tokensToForward contains the output token (e.g., USDC). Safe even if list
     *      contains vmfToken; vmfToken spent amount is approved and no residual (or residual is forwarded).
     * @param pool The Uniswap v4 pool address.
     * @param vmfToken The address of the VMF token being sold.
     * @param amountVMF The exact amount of VMF input.
     */
    function sellAndForward(
        address pool,
        address vmfToken,
        uint256 amountVMF
    ) external {
        // Pull VMF from caller then approve pool (optional: rely on allowance if already transferred in)
        // Caller must have approved this contract for amountVMF beforehand.
        // We intentionally do not transferFrom here to keep original pattern minimal; add if desired.
        IERC20(vmfToken).approve(pool, amountVMF);

        int256 amountSpecified = -int256(amountVMF); // exact input sell
        // Receive output into this contract so we can forward atomically.
        IUniswapV4Pool(pool).swap(address(this), amountSpecified, 0, "");

        // Forward any balances of tokens in tokensToForward list.
        _forwardConfiguredTokens();
        emit AutoForwardSell(vmfToken, amountVMF);
    }

    /**
     * @dev Internal helper to iterate and forward token balances.
     */
    function _forwardConfiguredTokens() internal {
        for (uint256 i = 0; i < tokensToForward.length; i++) {
            address token = tokensToForward[i];
            uint256 bal = IERC20(token).balanceOf(address(this));
            if (bal > 0) {
                token.safeTransfer(destination, bal);
                emit TokensForwarded(token, bal);
            }
        }
    }
    using SafeTransferLib for address;

    address public destination;

    address[] public tokensToForward;

    event TokensForwarded(address indexed token, uint256 amount);
    event AutoForwardSell(address indexed vmfToken, uint256 amountIn);
    event LegacySellExecuted(address indexed vmfToken, address indexed recipient, uint256 amountIn);
    event AutoForwardSellFromSender(address indexed vmfToken, address indexed sender, uint256 amountIn);

    function setTokensToForward(address[] calldata tokens) external {
        // Add access control as needed
        tokensToForward = tokens;
    }

    constructor(address _destination) {
        destination = _destination;
    }

    /**
     * @notice Convenience wrapper that pulls VMF from the caller (requires allowance), performs the swap and forwards proceeds.
     * @dev Caller must have approved this contract to spend amountVMF of vmfToken prior to calling.
     */
    function sellAndForwardFromSender(
        address pool,
        address vmfToken,
        uint256 amountVMF
    ) external {
        // Pull tokens in
        vmfToken.safeTransferFrom(msg.sender, address(this), amountVMF);
        // Approve pool
        IERC20(vmfToken).approve(pool, amountVMF);
        // Swap with this contract as recipient
        IUniswapV4Pool(pool).swap(address(this), -int256(amountVMF), 0, "");
        // Forward proceeds
        _forwardConfiguredTokens();
        emit AutoForwardSellFromSender(vmfToken, msg.sender, amountVMF);
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
