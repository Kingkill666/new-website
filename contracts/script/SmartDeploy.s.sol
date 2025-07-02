// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {VmfCoin} from "../src/VmfCoin.sol";
import {LibClone} from "solady/utils/LibClone.sol";

contract SmartDeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get environment variables
        address usdcAddress = vm.envAddress("USDC_ADDRESS");
        address charityReceiver = vm.envAddress("CHARITY_RECEIVER");
        address teamReceiver = vm.envAddress("TEAM_RECEIVER");
        
        // Check if proxy already exists
        address existingProxy;
        bool proxyExists = false;
        
        try vm.envAddress("PROXY_ADDRESS") returns (address proxy) {
            existingProxy = proxy;
            
            // Verify the proxy is actually deployed and functional
            uint256 codeSize;
            assembly { codeSize := extcodesize(proxy) }
            
            if (codeSize > 0) {
                try VmfCoin(proxy).name() returns (string memory) {
                    proxyExists = true;
                    console2.log("Existing proxy found at:", proxy);
                } catch {
                    console2.log("Proxy address has code but is not functional, deploying new proxy");
                }
            } else {
                console2.log("Proxy address has no code, deploying new proxy");
            }
        } catch {
            console2.log("No existing proxy address provided, deploying new proxy");
        }
        
        if (proxyExists) {
            console2.log("==== Existing Deployment Found ====");
            console2.log("Proxy address:", existingProxy);
            VmfCoin vmfProxy = VmfCoin(existingProxy);
            console2.log("Token name:", vmfProxy.name());
            console2.log("Token symbol:", vmfProxy.symbol());
            console2.log("Owner:", vmfProxy.owner());
            console2.log("Minter:", vmfProxy.minter());
            console2.log("");
            console2.log("To upgrade this proxy, run: ./upgrade.sh");
            return;
        }
        
        // Deploy new proxy
        vm.startBroadcast(deployerPrivateKey);
        
        console2.log("Deploying new proxy with deployer:", deployer);
        console2.log("USDC Address:", usdcAddress);
        console2.log("Charity Receiver:", charityReceiver);
        console2.log("Team Receiver:", teamReceiver);
        
        // Check if we have an existing implementation to reuse
        address implementationAddress;
        try vm.envAddress("IMPLEMENTATION_ADDRESS") returns (address impl) {
            uint256 codeSize;
            assembly { codeSize := extcodesize(impl) }
            if (codeSize > 0) {
                implementationAddress = impl;
                console2.log("Using existing implementation at:", implementationAddress);
            }
        } catch {}
        
        // Deploy implementation if not provided or invalid
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
        address localProxy = LibClone.deployERC1967(implementationAddress, initData);
        console2.log("Proxy deployed at:", localProxy);
        
        // Verify the proxy is working
        VmfCoin localVmfProxy = VmfCoin(localProxy);
        console2.log("Token name:", localVmfProxy.name());
        console2.log("Token symbol:", localVmfProxy.symbol());
        console2.log("Owner:", localVmfProxy.owner());
        console2.log("Minter:", localVmfProxy.minter());

        vm.stopBroadcast();
        
        console2.log("==== New Deployment Summary ====");
        console2.log("Implementation:", implementationAddress);
        console2.log("Proxy (main contract):", localProxy);
        console2.log("Owner/Minter:", deployer);
        console2.log("");
        console2.log("Save these addresses for future operations:");
        console2.log("export PROXY_ADDRESS=", localProxy);
        console2.log("export IMPLEMENTATION_ADDRESS=", implementationAddress);
    }
}
