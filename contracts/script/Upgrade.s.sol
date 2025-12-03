// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {VMF} from "../src/VMF.sol";
import {UpgradeInitiator} from "../src/UpgradeInitiator.sol";

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

        // Try to call upgrade() function first (for new implementations that have it)
        (bool upgradeSuccess, ) = proxyAddress.call(
            abi.encodeWithSignature("upgrade(address,bytes)", address(newImplementation), "")
        );

        if (upgradeSuccess) {
            console2.log("Upgrade completed via upgrade() function");
        } else {
            // Use UpgradeInitiator to perform upgrade via storage manipulation
            console2.log("Deploying UpgradeInitiator contract...");
            UpgradeInitiator initiator = new UpgradeInitiator();
            console2.log("UpgradeInitiator deployed at:", address(initiator));

            // Call initiator to perform upgrade
            console2.log("Calling initiator.upgrade()...");
            initiator.upgrade(proxyAddress, address(newImplementation));
            console2.log("Upgrade completed via UpgradeInitiator");
        }

        vm.stopBroadcast();

        console2.log("==== Upgrade Summary ====");
        console2.log("Contract address:", proxyAddress);
        console2.log("New implementation:", address(newImplementation));
    }
}
