// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {VMF} from "../src/VMF.sol";

/**
 * @title TestVMF
 * @notice Test-only contract that exposes minting functionality for testing purposes.
 * This contract should NEVER be deployed to mainnet.
 */
contract TestVMF is VMF {
    /**
     * @dev Test-only mint function. Exposes internal _mint for testing.
     * @param to The address to receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function testMint(address to, uint256 amount) external {
        // Enforce cap if set
        require(cap == 0 || totalSupply() + amount <= cap, "VMF: cap exceeded");
        _mint(to, amount);
    }
}

