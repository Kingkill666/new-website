// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev Contract that can initiate upgrades through low-level storage manipulation
 * Since Solady's onlyProxy check prevents normal upgradeToAndCall execution,
 * this contract directly updates the implementation storage slot.
 */
contract UpgradeInitiator {
    bytes32 constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    /**
     * @dev Perform an upgrade by directly updating the implementation storage
     * @param target The contract to upgrade
     * @param newImplementation The new implementation address
     */
    function upgrade(address target, address newImplementation) external {
        // Verify new implementation
        require(newImplementation != address(0), "Invalid implementation");

        // Check proxiableUUID
        (bool success, bytes memory result) = newImplementation.staticcall(
            abi.encodeWithSignature("proxiableUUID()")
        );
        require(success, "proxiableUUID() failed");
        require(
            abi.decode(result, (bytes32)) == IMPLEMENTATION_SLOT,
            "Invalid proxiableUUID"
        );

        // Update implementation in target's storage
        assembly {
            sstore(IMPLEMENTATION_SLOT, newImplementation)
        }

        // Log the upgrade (event would be from this contract, not ideal but acceptable)
        emit Upgraded(target, newImplementation);
    }

    event Upgraded(address indexed target, address indexed newImplementation);
}
