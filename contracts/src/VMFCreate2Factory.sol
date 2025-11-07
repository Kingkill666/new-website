// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VMFCreate2Factory
 * @notice Minimal helper that lets the VMF owner deploy contracts with CREATE2 without prefunding the universal deployer.
 *         The caller pays gas directly, and any attached value is forwardable to the new contract during deployment.
 */
contract VMFCreate2Factory {
    event Deployed(bytes32 indexed salt, address deployed);

    /**
     * @notice Deploy `bytecode` deterministically with CREATE2 using `salt`.
     * @dev Reverts if the deployment fails (including when contract already exists at the derived address).
     * @param salt The CREATE2 salt to use (usually found via off-chain brute force).
     * @param bytecode The creation bytecode of the contract being deployed.
     * @return deployed The address of the deployed contract.
     */
    function deploy(bytes32 salt, bytes calldata bytecode) external payable returns (address deployed) {
        assembly {
            let encodedSize := bytecode.length
            let dataPtr := mload(0x40)

            calldatacopy(dataPtr, bytecode.offset, encodedSize)

            deployed := create2(callvalue(), dataPtr, encodedSize, salt)

            if iszero(deployed) {
                revert(0, 0)
            }

            mstore(0x40, and(add(add(dataPtr, encodedSize), 0x1f), not(0x1f)))
        }

        emit Deployed(salt, deployed);
    }
}
