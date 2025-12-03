// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {VMF} from "../src/VMF.sol";

contract UpgradeScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address proxyAddress = vm.envAddress("PROXY_ADDRESS");
        address caller = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        console2.log("Upgrading at:", proxyAddress);
        console2.log("Caller address:", caller);

        // Deploy new implementation
        VMF newImplementation = new VMF();
        console2.log("New implementation deployed at:", address(newImplementation));

        // Get the contract instance
        VMF contract_ = VMF(proxyAddress);

        // Verify owner
        address owner = contract_.owner();
        console2.log("Contract owner:", owner);
        require(caller == owner, "Caller must be contract owner");

        // Try to call upgrade() function (for new implementations that have it)
        (bool upgradeSuccess, ) = proxyAddress.call(
            abi.encodeWithSignature("upgrade(address,bytes)", address(newImplementation), "")
        );

        if (!upgradeSuccess) {
            // Fallback: Call upgradeToAndCall directly
            // This will work because we're calling it on the proxy contract itself
            // and the proxy forwards the call via delegatecall to the implementation
            (bool success, bytes memory result) = proxyAddress.call(
                abi.encodeWithSignature("upgradeToAndCall(address,bytes)", address(newImplementation), "")
            );

            require(success, string(result));
            console2.log("Upgrade completed via upgradeToAndCall");
        } else {
            console2.log("Upgrade completed via upgrade() function");
        }

        vm.stopBroadcast();

        console2.log("==== Upgrade Summary ====");
        console2.log("Contract address:", proxyAddress);
        console2.log("New implementation:", address(newImplementation));
    }
}
