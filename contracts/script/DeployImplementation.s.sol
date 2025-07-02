// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {VmfCoin} from "../src/VmfCoin.sol";

contract DeployImplementationScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        console2.log("Deploying implementation with deployer:", deployer);
        
        // Deploy the implementation contract
        VmfCoin implementation = new VmfCoin();
        console2.log("Implementation deployed at:", address(implementation));
        
        vm.stopBroadcast();
        
        console2.log("==== Implementation Deployment Summary ====");
        console2.log("Implementation:", address(implementation));
        console2.log("");
        console2.log("To deploy a proxy using this implementation, set:");
        console2.log("export IMPLEMENTATION_ADDRESS=", address(implementation));
        console2.log("Then run: ./deploy-proxy.sh");
    }
}
