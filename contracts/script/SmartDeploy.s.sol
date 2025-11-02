// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {VMF} from "../src/VMF.sol";
import {LibClone} from "solady/utils/LibClone.sol";

contract SmartDeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get environment variables
        address usdcAddress = vm.envAddress("USDC_ADDRESS");
        
        // Check if proxy already exists
        address existingProxy;
        bool proxyExists = false;
        
        try vm.envAddress("PROXY_ADDRESS") returns (address proxy) {
            existingProxy = proxy;
            
            // Verify the proxy is actually deployed and functional
            uint256 codeSize;
            assembly { codeSize := extcodesize(proxy) }
            
            if (codeSize > 0) {
                try VMF(proxy).name() returns (string memory) {
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
            VMF vmfProxy = VMF(existingProxy);
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
        uint256 mintAmount = 10_000_000 ether; // Amount to mint to treasury

        // Prepare the initialization data (pass 0 to use default 10M cap)
        bytes memory initData = abi.encodeWithSelector(
            VMF.initialize.selector,
            usdcAddress,
            deployer, // initial owner
            0 // 0 means use default cap (10M)
        );
        
        // Deploy implementation if not provided or invalid
        if (implementationAddress == address(0)) {
            VMF implementation = new VMF();
            implementationAddress = address(implementation);
            console2.log("New implementation deployed at:", implementationAddress);
        }
        
        // Deploy the ERC1967 proxy pointing to the implementation
        address localProxy = LibClone.deployERC1967(implementationAddress, initData);
        console2.log("Proxy deployed at:", localProxy);

        // Ensure initialization (in case deployERC1967 did not call it)
        // This is safe due to the `initializer` modifier reverting on second call.
        try VMF(localProxy).initialize(usdcAddress, deployer, 0) {
            // initialized explicitly
        } catch {
            // already initialized via initData or other means
        }

        // Verify the proxy is working
        VMF localVmf = VMF(localProxy);
        console2.log("Token name:", localVmf.name());
        console2.log("Token symbol:", localVmf.symbol());
        console2.log("USDC:", localVmf.usdc());
        console2.log("Owner:", localVmf.owner());
        console2.log("Minter:", localVmf.minter());
        console2.log("Cap:", localVmf.cap());
        if (localVmf.totalSupply() == 0) {
            console2.log("Minting initial 10M VMF supply into the contract treasury...");
            localVmf.mint(localProxy, mintAmount);
        } else {
            console2.log("Total supply already initialized, skipping mint.");
        }
        console2.log("Total Supply:", localVmf.totalSupply());
        console2.log("Treasury Balance:", localVmf.balanceOf(localProxy));

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
