// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {VmfCoin} from "../src/VmfCoin.sol";
import {LibClone} from "solady/utils/LibClone.sol";

contract DeployUpgradeableScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get environment variables
        address usdcAddress = vm.envAddress("USDC_ADDRESS");
        address charityReceiver = vm.envAddress("CHARITY_RECEIVER");
        address teamReceiver = vm.envAddress("TEAM_RECEIVER");
        
        vm.startBroadcast(deployerPrivateKey);
        
        console2.log("Deploying with deployer:", deployer);
        console2.log("USDC Address:", usdcAddress);
        console2.log("Charity Receiver:", charityReceiver);
        console2.log("Team Receiver:", teamReceiver);
        
        // Deploy the implementation contract
        VmfCoin implementation = new VmfCoin();
        console2.log("Implementation deployed at:", address(implementation));
        
        // Prepare the initialization data
        bytes memory initData = abi.encodeWithSelector(
            VmfCoin.initialize.selector,
            usdcAddress,
            payable(charityReceiver),
            payable(teamReceiver),
            deployer // initial owner
        );
        
        // Deploy the ERC1967 proxy pointing to the implementation
        address proxy = LibClone.deployERC1967(address(implementation), initData);
        console2.log("Proxy deployed at:", proxy);
        
        // Verify the proxy is working by calling a function
        VmfCoin vmfProxy = VmfCoin(proxy);
        console2.log("Token name:", vmfProxy.name());
        console2.log("Token symbol:", vmfProxy.symbol());
        console2.log("Owner:", vmfProxy.owner());
        console2.log("Minter:", vmfProxy.minter());
        
        vm.stopBroadcast();
        
        console2.log("==== Deployment Summary ====");
        console2.log("Implementation:", address(implementation));
        console2.log("Proxy (main contract):", proxy);
        console2.log("Owner/Minter:", deployer);
    }
}
