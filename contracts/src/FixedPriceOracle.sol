// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @title FixedPriceOracle
/// @notice Simple oracle that returns a fixed price for VMF/USDC
/// @dev This provides a stable price for testing. Can be updated by owner.
contract FixedPriceOracle {
    address public immutable vmf;
    address public immutable usdc;
    
    // Fixed price: 1 VMF = 0.010 USDC = 1e16 (scaled to 1e18)
    uint256 public constant FIXED_PRICE = 1e16; // 0.01 USDC per VMF
    
    // Scale factor for returned price (1e18)
    uint256 public constant PRICE_SCALE = 1e18;

    constructor(address _vmf, address _usdc) {
        require(_vmf != address(0) && _usdc != address(0), "zero");
        vmf = _vmf;
        usdc = _usdc;
    }

    /// @notice Returns the fixed price as USDC per VMF, scaled to 1e18.
    /// @dev Returns 0.01 USDC per VMF based on current SushiSwap pool data
    function spotPriceUSDCPerVMF() external pure returns (uint256 priceE18) {
        return FIXED_PRICE; // 0.01 USDC per VMF
    }
}
