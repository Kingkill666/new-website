// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {VMF} from "../src/VMF.sol";
import "forge-std/StdJson.sol";
// IERC20 import removed; not needed for script compilation

contract MigrateHoldersScript is Script {
    using stdJson for string;
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        address oldContract = vm.envAddress("OLD_VMF_ADDRESS");
        address newContract = vm.envAddress("NEW_VMF_ADDRESS");
        
        console2.log("=== Token Holder Migration ===");
        console2.log("Old Contract:", oldContract);
        console2.log("New Contract:", newContract);
        
        vm.startBroadcast(deployerPrivateKey);
        
        VMF newVmf = VMF(newContract);
    VMF oldVmf = VMF(oldContract);
        
    // Load holders from JSON file
    string memory holdersJson = vm.readFile("./scripts/data/holders.json");
    address[] memory holders = holdersJson.readAddressArray(".holders");
        
        uint256 migratedCount = 0;
        uint256 totalMigrated = 0;
        
        console2.log("Starting migration for", holders.length, "addresses...");
        
        for (uint256 i = 0; i < holders.length; i++) {
            address holder = holders[i];
            
            // Skip zero address
            if (holder == address(0)) continue;
            
            // Get balance from old contract
            uint256 balance = oldVmf.balanceOf(holder);
            
            if (balance > 0) {
                // Check if already migrated
                uint256 newBalance = newVmf.balanceOf(holder);
                if (newBalance >= balance) {
                    console2.log("Already migrated:", holder, "Balance:", balance);
                    continue;
                }
                
                // Mint equivalent tokens in new contract
                newVmf.mint(holder, balance);
                migratedCount++;
                totalMigrated += balance;
                
                console2.log("Migrated:", holder, "Balance:", balance);
            }
        }
        
        vm.stopBroadcast();
        
        console2.log("=== Migration Complete ===");
        console2.log("Holders migrated:", migratedCount);
        console2.log("Total tokens migrated:", totalMigrated);
        console2.log("New total supply:", newVmf.totalSupply());
    }
    
    
}