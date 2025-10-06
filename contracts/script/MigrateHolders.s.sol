// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {VMF} from "../src/VMF.sol";
import {IERC20} from "solady/tokens/ERC20.sol";

contract MigrateHoldersScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        address oldContract = vm.envAddress("OLD_VMF_ADDRESS");
        address newContract = vm.envAddress("NEW_VMF_ADDRESS");
        
        console2.log("=== Token Holder Migration ===");
        console2.log("Old Contract:", oldContract);
        console2.log("New Contract:", newContract);
        
        vm.startBroadcast(deployerPrivateKey);
        
        VMF newVmf = VMF(newContract);
        IERC20 oldVmf = IERC20(oldContract);
        
        // Load holders from JSON file
        string memory holdersJson = vm.readFile("./holders.json");
        
        // Hardcoded holders array (can be made dynamic with additional tooling)
        address[] memory holders = _getKnownHolders();
        
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
    
    function _getKnownHolders() internal pure returns (address[] memory) {
        address[] memory holders = new address[](36);
        holders[0] = 0x0000000000000000000000000000000000000000;
        holders[1] = 0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d;
        holders[2] = 0x6ece9b29610fdd909155c154cacffee7d6273bac;
        holders[3] = 0x59cee22ee277133d153612b3122f6e867445dbb7;
        holders[4] = 0x195b4ca4568ea0051551d8e96502ce2a36269576;
        holders[5] = 0xf8bcf76357a358d225dcd431a7238052ce206249;
        holders[6] = 0x12e31f706010ae0996a2d8247c432d9102e3c871;
        holders[7] = 0x557c7cb60e536c437ac96b361539257b0e2c35c5;
        holders[8] = 0x1db4286a9a7637f8347fc53b71daa9235c129b41;
        holders[9] = 0xaf32ca0c109318a36aa2e10f38611d5b64b72a03;
        holders[10] = 0xffde42d40175b3b9349dfb384439dcb811691e09;
        holders[11] = 0x81759dbf79eadb24b1bfe197a833fa89179b0cbd;
        holders[12] = 0x24344de334423fe32044bcd2aac9db832f6eeac7;
        holders[13] = 0x92cb926a465164c522198208fb963f0e63a89d15;
        holders[14] = 0x5d64d14d2cf4fe5fe4e65b1c7e3d11e18d493091;
        holders[15] = 0xad541da7f18a5151411ed8f83c4727a9f45ea3b2;
        holders[16] = 0x86924c37a93734e8611eb081238928a9d18a63c0;
        holders[17] = 0xcfd59c0f530db36eea8ccbfe744f01fe3556925e;
        holders[18] = 0xa120bf97a89d7fa0927e76c093169fa7cfaca3bb;
        holders[19] = 0xf00000003d31d4ab730a8e269ae547f8f76996ba;
        holders[20] = 0xc073c7acf73f0de6981ae4bbd8832c875d70b459;
        holders[21] = 0x4f82e73edb06d29ff62c91ec8f5ff06571bdeb29;
        holders[22] = 0x9cb8d9bae84830b7f5f11ee5048c04a80b8514ba;
        holders[23] = 0x471f5a59a463daaa7d619573901111275c559489;
        holders[24] = 0xe5b89fa771049df021dcf3817bfc756bb2f85f96;
        holders[25] = 0xec6c1427a9308c47624899cb3454bd34a424fa8f;
        holders[26] = 0x382ffce2287252f930e1c8dc9328dac5bf282ba1;
        holders[27] = 0xad01c20d5886137e056775af56915de824c8fce5;
        holders[28] = 0x00000009e70d153a81f4c972dd123c4b71b7441c;
        holders[29] = 0xf85e95bef8f2de7782b0936ca3480c41a4b6c59b;
        holders[30] = 0x006004d6c39590d39310a0d34181e15d9ade3902;
        holders[31] = 0xa71f09bb63fe0e420d9740e46e28f0057fba68f8;
        holders[32] = 0x03e8254fde84a8601c97c8682fd525db4494dfb6;
        holders[33] = 0x498581ff718922c3f8e6a244956af099b2652b2b;
        holders[34] = 0x9f4e276675f50c271d1c8e2019dabccb69ced0;
        holders[35] = 0x6e4141d33021b52c91c28608403db4a0ffb50ec6;
        
        return holders;
    }
}