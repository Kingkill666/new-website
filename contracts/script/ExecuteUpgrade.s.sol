// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {VMF} from "../src/VMF.sol";
import {UpgradeProxy} from "../src/UpgradeProxy.sol";

/**
 * @dev Execute the actual upgrade
 * Deploys new VMF implementation and tells UpgradeProxy to upgrade to it
 */
contract ExecuteUpgradeScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address proxyAddress = vm.envAddress("PROXY_ADDRESS");
        address upgradeProxyAddress = 0x5827e1c6A8d910C069C44f758da220a3fE774A65;

        vm.startBroadcast(deployerPrivateKey);

        console2.log("Deploying new VMF implementation...");
        VMF newImplementation = new VMF();
        console2.log("New implementation deployed at:", address(newImplementation));

        console2.log("");
        console2.log("Calling UpgradeProxy.upgrade()...");
        UpgradeProxy(upgradeProxyAddress).upgrade(address(newImplementation));
        console2.log("Upgrade completed!");

        vm.stopBroadcast();

        console2.log("");
        console2.log("==== Upgrade Summary ====");
        console2.log("VMF address:", proxyAddress);
        console2.log("New implementation:", address(newImplementation));
        console2.log("UpgradeProxy:", upgradeProxyAddress);
    }
}
