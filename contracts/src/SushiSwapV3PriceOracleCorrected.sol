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

/// @notice Interface for ERC20 tokens
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

/// @title SushiSwapV3PriceOracleCorrected
/// @notice Corrected price oracle that reads actual price from SushiSwap V3 pool reserves
/// @dev Uses pool reserves to calculate the real USDC per VMF price
contract SushiSwapV3PriceOracleCorrected {
    error InvalidPool();
    error TokenMismatch();
    error PriceCalculationFailed();

    address public immutable vmf;
    address public immutable usdc;
    ISushiSwapV3Pool public immutable pool;
    IERC20 public immutable vmfToken;
    IERC20 public immutable usdcToken;

    // Scale factor for returned price (1e18). Result = USDC (6 decimals) per 1 VMF (18 decimals) scaled to 1e18.
    uint256 public constant PRICE_SCALE = 1e18;
    
    // Constants for tick-based price calculation
    int24 public constant MIN_TICK = -887272;
    int24 public constant MAX_TICK = 887272;
    uint160 public constant MIN_SQRT_RATIO = 4295128739;
    uint160 public constant MAX_SQRT_RATIO = 1461446703485210103287273052203988822378723970342;

    constructor(address _pool, address _vmf, address _usdc) {
        require(_pool != address(0) && _vmf != address(0) && _usdc != address(0), "zero");
        pool = ISushiSwapV3Pool(_pool);
        vmf = _vmf;
        usdc = _usdc;
        vmfToken = IERC20(_vmf);
        usdcToken = IERC20(_usdc);
        
        // Basic sanity: pool tokens must match (in either order)
        address t0 = pool.token0();
        address t1 = pool.token1();
        bool matchForward = (t0 == _vmf && t1 == _usdc);
        bool matchReverse = (t0 == _usdc && t1 == _vmf);
        if (!matchForward && !matchReverse) revert TokenMismatch();
    }

    /// @notice Returns the current spot price as USDC per VMF, scaled to 1e18.
    /// @dev Uses actual pool reserves to calculate the real price
    function spotPriceUSDCPerVMF() external view returns (uint256 priceE18) {
        // Get the actual token balances in the pool
        uint256 vmfBalance = vmfToken.balanceOf(address(pool));
        uint256 usdcBalance = usdcToken.balanceOf(address(pool));
        
        // Ensure we have some liquidity
        if (vmfBalance == 0 || usdcBalance == 0) {
            return 0;
        }
        
        // Determine token orientation
        address t0 = pool.token0();
        address t1 = pool.token1();
        
        uint256 price;
        if (t0 == vmf && t1 == usdc) {
            // VMF is token0, USDC is token1
            // Price = USDC balance / VMF balance
            // But we need to account for decimals: VMF (18), USDC (6)
            // So we need to scale by 10^12
            price = (usdcBalance * 1e12) / vmfBalance;
        } else if (t0 == usdc && t1 == vmf) {
            // USDC is token0, VMF is token1
            // Price = USDC balance / VMF balance
            // But we need to account for decimals: VMF (18), USDC (6)
            // So we need to scale by 10^12
            price = (usdcBalance * 1e12) / vmfBalance;
        } else {
            revert TokenMismatch();
        }
        
        // Validate price is reasonable (between 0.001 and 0.1 USDC per VMF)
        if (price < 0.001e18 || price > 0.1e18) {
            revert PriceCalculationFailed();
        }
        
        return price;
    }
    
    /// @notice Get pool information for debugging
    function getPoolInfo() external view returns (
        address token0,
        address token1,
        uint24 fee,
        uint160 sqrtPriceX96,
        int24 tick,
        bool unlocked,
        uint256 vmfBalance,
        uint256 usdcBalance
    ) {
        token0 = pool.token0();
        token1 = pool.token1();
        fee = pool.fee();
        (sqrtPriceX96, tick,,,,, unlocked) = pool.slot0();
        vmfBalance = vmfToken.balanceOf(address(pool));
        usdcBalance = usdcToken.balanceOf(address(pool));
    }
    
    /// @notice Get current price information
    function getCurrentPriceInfo() external view returns (
        uint160 sqrtPriceX96,
        int24 tick,
        uint256 priceE18,
        bool isValid,
        uint256 vmfBalance,
        uint256 usdcBalance
    ) {
        (sqrtPriceX96, tick,,,,,) = pool.slot0();
        vmfBalance = vmfToken.balanceOf(address(pool));
        usdcBalance = usdcToken.balanceOf(address(pool));
        
        try this.spotPriceUSDCPerVMF() returns (uint256 price) {
            priceE18 = price;
            isValid = price > 0 && price >= 0.001e18 && price <= 0.1e18;
        } catch {
            priceE18 = 0;
            isValid = false;
        }
    }
    
    /// @notice Validate that the oracle is working correctly
    function validateOracle() external view returns (bool isValid, string memory reason) {
        try this.spotPriceUSDCPerVMF() returns (uint256 price) {
            if (price == 0) {
                return (false, "Price is zero");
            }
            if (price < 0.001e18) {
                return (false, "Price too low");
            }
            if (price > 0.1e18) {
                return (false, "Price too high");
            }
            return (true, "Oracle is valid");
        } catch Error(string memory error) {
            return (false, error);
        } catch {
            return (false, "Unknown error");
        }
    }
    
    /// @notice Get detailed pool information for debugging
    function getDetailedPoolInfo() external view returns (
        address token0,
        address token1,
        uint24 fee,
        uint160 sqrtPriceX96,
        int24 tick,
        bool unlocked,
        uint256 vmfBalance,
        uint256 usdcBalance,
        uint256 priceE18,
        string memory priceDescription
    ) {
        token0 = pool.token0();
        token1 = pool.token1();
        fee = pool.fee();
        (sqrtPriceX96, tick,,,,, unlocked) = pool.slot0();
        vmfBalance = vmfToken.balanceOf(address(pool));
        usdcBalance = usdcToken.balanceOf(address(pool));
        
        try this.spotPriceUSDCPerVMF() returns (uint256 price) {
            priceE18 = price;
            // Convert to readable format
            uint256 priceInUSDC = price / 1e18;
            uint256 priceInCents = (price % 1e18) / 1e16;
            priceDescription = string(abi.encodePacked(
                "Price: ",
                _uint2str(priceInUSDC),
                ".",
                _uint2str(priceInCents),
                " USDC per VMF"
            ));
        } catch {
            priceE18 = 0;
            priceDescription = "Price calculation failed";
        }
    }
    
    /// @notice Convert uint to string (helper function)
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
