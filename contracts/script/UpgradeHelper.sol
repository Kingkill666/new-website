// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev Helper contract to perform UUPS upgrades.
 * This contract acts as a bridge to call upgradeToAndCall on a UUPS proxy.
 */
interface IUUPSUpgradeable {
    function upgradeToAndCall(address newImplementation, bytes calldata data) external payable;
}

contract UpgradeHelper {
    /**
     * @dev Perform an upgrade on a UUPS contract.
     * @param target The address of the UUPS contract to upgrade
     * @param newImplementation The address of the new implementation
     * @param data Optional data to pass to the new implementation
     */
    function performUpgrade(
        address target,
        address newImplementation,
        bytes calldata data
    ) external {
        IUUPSUpgradeable(target).upgradeToAndCall(newImplementation, data);
    }
}
