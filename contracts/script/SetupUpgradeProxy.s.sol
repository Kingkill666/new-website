// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {UpgradeProxy} from "../src/UpgradeProxy.sol";
import {VMF} from "../src/VMF.sol";

/**
 * @dev Setup script to:
 * 1. Deploy UpgradeProxy
 * 2. Transfer VMF ownership to UpgradeProxy
 * 3. Then UpgradeProxy can call upgrade()
 */
contract SetupUpgradeProxyScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address proxyAddress = vm.envAddress("PROXY_ADDRESS");
        address caller = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        console2.log("Setting up UpgradeProxy...");
        console2.log("Current owner:", caller);
        console2.log("VMF address:", proxyAddress);

        // Deploy the upgrade proxy contract
        UpgradeProxy upgradeProxy = new UpgradeProxy(proxyAddress, caller);
        console2.log("UpgradeProxy deployed at:", address(upgradeProxy));

        // Transfer ownership of VMF to the upgrade proxy
        console2.log("");
        console2.log("Transferring VMF ownership to UpgradeProxy...");
        VMF vmf = VMF(proxyAddress);
        vmf.transferOwnership(address(upgradeProxy));

        console2.log("Ownership transferred!");
        console2.log("");
        console2.log("Next steps:");
        console2.log("1. Deploy new VMF implementation");
        console2.log("2. Call: UpgradeProxy.upgrade(newImplementationAddress)");

        vm.stopBroadcast();
    }
}
