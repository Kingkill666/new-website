// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {VMF} from "../src/VMF.sol";

contract UpgradeScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address proxyAddress = vm.envAddress("PROXY_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        console2.log("Upgrading proxy at:", proxyAddress);
        
        // Deploy new implementation
        VMF newImplementation = new VMF();
        console2.log("New implementation deployed at:", address(newImplementation));
        
        // Get the proxy instance
        VMF proxy = VMF(proxyAddress);
        
        // Upgrade to new implementation
        proxy.upgradeToAndCall(address(newImplementation), "");
        console2.log("Upgrade completed successfully");
        
        vm.stopBroadcast();
        
        console2.log("==== Upgrade Summary ====");
        console2.log("Proxy address:", proxyAddress);
        console2.log("New implementation:", address(newImplementation));
    }
}
