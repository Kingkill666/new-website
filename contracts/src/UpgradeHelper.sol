// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev Helper contract to perform UUPS upgrades
 * Owner calls this contract with the implementation address,
 * and this contract then calls upgradeToAndCall on the proxy.
 */
interface IUUPS {
    function upgradeToAndCall(address newImplementation, bytes calldata data) external payable;
}

contract UpgradeHelper {
    /**
     * @dev Perform an upgrade on a UUPS contract
     * @param target The UUPS contract address
     * @param newImplementation The new implementation address
     * @param data Optional data for initialization
     */
    function upgrade(
        address target,
        address newImplementation,
        bytes calldata data
    ) external {
        IUUPS(target).upgradeToAndCall(newImplementation, data);
    }
}
