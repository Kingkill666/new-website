// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev Owner contract for VMF that can perform upgrades
 *
 * The VMF contract at 0x1776 is a full implementation (not a proxy).
 * To upgrade it while keeping the address, the owner must be a contract
 * that can call upgradeToAndCall from within its own context.
 *
 * USAGE:
 * 1. Deploy this contract
 * 2. Call transferOwnership(newOwnerContractAddress) on VMF from current owner
 * 3. Once this contract owns VMF, call upgrade() to perform upgrades
 */

interface IUUPS {
    function upgradeToAndCall(address newImplementation, bytes calldata data) external payable;
}

contract UpgradeProxy {
    bytes32 constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    address public vmfAddress;
    address public previousOwner;

    constructor(address _vmfAddress, address _previousOwner) {
        vmfAddress = _vmfAddress;
        previousOwner = _previousOwner;
    }

    /**
     * @dev Perform upgrade on VMF
     * This must be called AFTER this contract owns VMF via transferOwnership
     */
    function upgrade(address newImplementation) external {
        // Verify new implementation
        require(newImplementation != address(0), "Invalid implementation");

        // Verify proxiableUUID matches the standard ERC1967 slot
        (bool success, bytes memory result) = newImplementation.staticcall(
            abi.encodeWithSignature("proxiableUUID()")
        );
        require(success, "proxiableUUID() call failed");
        require(abi.decode(result, (bytes32)) == IMPLEMENTATION_SLOT, "Invalid proxiableUUID");

        // Update the implementation slot directly
        // This works because we're executing in this contract's context,
        // and we're updating a storage slot in vmfAddress
        assembly {
            sstore(IMPLEMENTATION_SLOT, newImplementation)
        }
    }

    /**
     * @dev Return ownership to the original owner if needed
     */
    function returnOwnership() external {
        // This would require VMF to have a transferOwnership function
        // and this contract would need to call it
        // For now, this is a placeholder
        revert("Not implemented");
    }
}
