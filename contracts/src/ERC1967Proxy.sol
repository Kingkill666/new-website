// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev This is a standard ERC1967 Proxy deployed by Solady's LibClone.deployERC1967
 * The actual bytecode is minimal and follows the ERC1967 standard.
 * 
 * Proxy Address: 0x8157B303a10609C50e332717D70E53B09ebdb045
 * Implementation: 0xB728e46f776859e35FD8f58A2731dd86BA24c923
 */

/**
 * @dev Minimal ERC1967 proxy bytecode deployed by Solady LibClone
 * 
 * This proxy delegates all calls to the implementation address stored at:
 * bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
 * = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc
 */
contract ERC1967Proxy {
    /**
     * @dev Storage slot with the address of the current implementation.
     * This is the keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1.
     */
    bytes32 internal constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    /**
     * @dev Delegates the current call to the address returned by `_implementation()`.
     * 
     * This function does not return to its internal call site, it will return directly to the external caller.
     */
    fallback() external payable {
        _delegate(_implementation());
    }

    /**
     * @dev Fallback function that delegates calls to the address returned by `_implementation()`. 
     * Will run if call data is empty.
     */
    receive() external payable {
        _delegate(_implementation());
    }

    /**
     * @dev Returns the current implementation address.
     */
    function _implementation() internal view returns (address impl) {
        bytes32 slot = _IMPLEMENTATION_SLOT;
        assembly {
            impl := sload(slot)
        }
    }

    /**
     * @dev Delegates the current call to `implementation`.
     * 
     * This function does not return to its internal call site, it will return directly to the external caller.
     */
    function _delegate(address implementation) internal {
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}
