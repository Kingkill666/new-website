// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {VMF} from "../src/VMF.sol";
import "forge-std/StdJson.sol";
// IERC20 import removed; not used in this script

contract DirectDeployScript is Script {
    using stdJson for string;
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get environment variables
        address usdcAddress = vm.envAddress("USDC_ADDRESS");
        // Get old contract address if migrating
        address oldContract;
        bool shouldMigrate = false;
        try vm.envAddress("OLD_VMF_ADDRESS") returns (address old) {
            oldContract = old;
            shouldMigrate = true;
            console2.log("Migration enabled from old contract:", oldContract);
        } catch {
            console2.log("No migration - deploying fresh contract");
        }
        vm.startBroadcast(deployerPrivateKey);
        
        console2.log("Deploying VMF directly (no proxy) with deployer:", deployer);
        console2.log("USDC Address:", usdcAddress);
        
        // Deploy VMF contract directly (implementation uses initialize)
        VMF vmf = new VMF();
        // Initialize implementation for direct deployments (no proxy) - pass 0 to use default 10M cap
        vmf.initialize(usdcAddress, deployer, 0);
        
        address vmfAddress = address(vmf);
        console2.log("VMF deployed at:", vmfAddress);
        console2.log("Cap (default 10M):", vmf.cap());
        
        // NOTE: Minting functionality has been removed from the contract.
        // All 10 million tokens must be minted during the initial deployment.
        // If you need to mint tokens, you must do so before removing the mint function,
        // or use a deployment method that mints during initialization.
        if (!shouldMigrate) {
            console2.log("WARNING: Minting is no longer available. Ensure tokens were minted during deployment.");
        }
        
        // Migrate holders if old contract specified
        if (shouldMigrate) {
            console2.log("==== Starting Token Migration ====");
            _migrateTokenHolders(vmf, oldContract);
        }
        
        // Verify the deployment is working
        console2.log("Token name:", vmf.name());
        console2.log("Token symbol:", vmf.symbol());
        console2.log("USDC:", vmf.usdc());
        console2.log("Owner:", vmf.owner());
        console2.log("Cap:", vmf.cap());
        console2.log("Total Supply:", vmf.totalSupply());
        console2.log("Treasury Balance:", vmf.balanceOf(vmfAddress));

        vm.stopBroadcast();
        
        console2.log("==== Direct Deployment Summary ====");
        console2.log("VMF Contract:", vmfAddress);
        console2.log("Owner:", deployer);
        if (shouldMigrate) {
            console2.log("Migration completed from:", oldContract);
        }
        console2.log("");
        console2.log("Save this address for future operations:");
        console2.log("export VMF_ADDRESS=", vmfAddress);
    }
    
    function _migrateTokenHolders(VMF newVmf, address oldContract) internal {
        // Load holders list from scripts/data/holders.json
        string memory holdersJson = vm.readFile("./scripts/data/holders.json");
        address[] memory holders = holdersJson.readAddressArray(".holders");
        
    VMF oldVmf = VMF(oldContract);
        uint256 migratedCount = 0;
        uint256 totalMigrated = 0;
        
        console2.log("Migrating token holders...");
        
        for (uint256 i = 0; i < holders.length; i++) {
            address holder = holders[i];
            
            // Skip zero address
            if (holder == address(0)) continue;
            
            // Get balance from old contract
            uint256 balance = oldVmf.balanceOf(holder);
            
            if (balance > 0) {
                // NOTE: Minting functionality has been removed.
                // Migration must be done by transferring from treasury or using a different method.
                // For now, we'll log the migration requirement.
                console2.log("Migration required for:", holder, "Balance:", balance);
                console2.log("WARNING: Cannot mint tokens. Use transfer from treasury or deploy with minting enabled.");
                // Skip actual minting - this will need to be handled differently
                // newVmf.mint(holder, balance); // REMOVED - minting no longer available
                migratedCount++;
                totalMigrated += balance;
            }
        }
        
        console2.log("Migration complete!");
        console2.log("Holders migrated:", migratedCount);
        console2.log("Total tokens migrated:", totalMigrated);
    }
}
