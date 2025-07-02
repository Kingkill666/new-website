// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {VmfCoin} from "../src/VmfCoin.sol";
import {LibClone} from "solady/utils/LibClone.sol";

contract DeployProxyScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get environment variables
        address usdcAddress = vm.envAddress("USDC_ADDRESS");
        address charityReceiver = vm.envAddress("CHARITY_RECEIVER");
        address teamReceiver = vm.envAddress("TEAM_RECEIVER");
        
        // Try to get existing implementation address, or deploy new one
        address implementationAddress;
        
        try vm.envAddress("IMPLEMENTATION_ADDRESS") returns (address impl) {
            implementationAddress = impl;
            console2.log("Using existing implementation at:", implementationAddress);
            
            // Verify the implementation is actually deployed
            uint256 codeSize;
            assembly { codeSize := extcodesize(impl) }
            require(codeSize > 0, "Implementation address has no code");
        } catch {
            console2.log("No existing implementation found, deploying new one...");
            implementationAddress = address(0);
        }
        
        vm.startBroadcast(deployerPrivateKey);
        
        console2.log("Deploying with deployer:", deployer);
        console2.log("USDC Address:", usdcAddress);
        console2.log("Charity Receiver:", charityReceiver);
        console2.log("Team Receiver:", teamReceiver);
        
        // Deploy implementation if not provided
        if (implementationAddress == address(0)) {
            VmfCoin implementation = new VmfCoin();
            implementationAddress = address(implementation);
            console2.log("New implementation deployed at:", implementationAddress);
        }
        
        // Prepare the initialization data
        bytes memory initData = abi.encodeWithSelector(
            VmfCoin.initialize.selector,
            usdcAddress,
            payable(charityReceiver),
            payable(teamReceiver),
            deployer // initial owner
        );
        
        // Deploy the ERC1967 proxy pointing to the implementation
        address proxy = LibClone.deployERC1967(implementationAddress, initData);
        console2.log("Proxy deployed at:", proxy);
        
        // Verify the proxy is working by calling a function
        VmfCoin vmfProxy = VmfCoin(proxy);
        console2.log("Token name:", vmfProxy.name());
        console2.log("Token symbol:", vmfProxy.symbol());
        console2.log("Owner:", vmfProxy.owner());
        console2.log("Minter:", vmfProxy.minter());
        
        vm.stopBroadcast();
        
        console2.log("==== Proxy Deployment Summary ====");
        console2.log("Implementation:", implementationAddress);
        console2.log("Proxy (main contract):", proxy);
        console2.log("Owner/Minter:", deployer);
        console2.log("");
        console2.log("To upgrade this proxy later, set:");
        console2.log("export PROXY_ADDRESS=", proxy);
        console2.log("export IMPLEMENTATION_ADDRESS=", implementationAddress);
    }
}
