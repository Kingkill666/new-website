// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {VMF} from "../src/VMF.sol";
import {IERC20} from "solady/tokens/ERC20.sol";

contract DirectDeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get environment variables
        address usdcAddress = vm.envAddress("USDC_ADDRESS");
        address charityReceiver = vm.envAddress("CHARITY_RECEIVER");
        address teamReceiver = vm.envAddress("TEAM_RECEIVER");
        
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
        console2.log("Charity Receiver:", charityReceiver);
        console2.log("Team Receiver:", teamReceiver);
        
        // Deploy VMF contract directly
        VMF vmf = new VMF(
            usdcAddress,
            payable(charityReceiver),
            payable(teamReceiver),
            deployer // initial owner
        );
        
        address vmfAddress = address(vmf);
        console2.log("VMF deployed at:", vmfAddress);
        
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
        console2.log("Minter:", vmf.minter());
        console2.log("Total Supply:", vmf.totalSupply());

        vm.stopBroadcast();
        
        console2.log("==== Direct Deployment Summary ====");
        console2.log("VMF Contract:", vmfAddress);
        console2.log("Owner/Minter:", deployer);
        if (shouldMigrate) {
            console2.log("Migration completed from:", oldContract);
        }
        console2.log("");
        console2.log("Save this address for future operations:");
        console2.log("export VMF_ADDRESS=", vmfAddress);
    }
    
    function _migrateTokenHolders(VMF newVmf, address oldContract) internal {
        // Read holders from the JSON file
        string memory holdersJson = vm.readFile("./holders.json");
        
        // Parse the JSON array (manual parsing since Solidity doesn't have built-in JSON)
        // For now, we'll use a simpler approach with known addresses
        // Updated to include all 50 current holders (zero address filtered out)
        address[] memory holders = new address[](50);
        holders[0] = 0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d;
        holders[1] = 0x00000009e70d153a81f4c972dd123c4b71b7441c;
        holders[2] = 0x006004d6c39590d39310a0d34181e15d9ade3902;
        holders[3] = 0x03e8254fde84a8601c97c8682fd525db4494dfb6;
        holders[4] = 0x1111111254eeb25477b68fb85ed929f73a960582;
        holders[5] = 0x12e31f706010ae0996a2d8247c432d9102e3c871;
        holders[6] = 0x195b4ca4568ea0051551d8e96502ce2a36269576;
        holders[7] = 0x1db4286a9a7637f8347fc53b71daa9235c129b41;
        holders[8] = 0x1f98431c8ad98523631ae4a59f267346ea31f984;
        holders[9] = 0x24344de334423fe32044bcd2aac9db832f6eeac7;
        holders[10] = 0x382ffce2287252f930e1c8dc9328dac5bf282ba1;
        holders[11] = 0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad;
        holders[12] = 0x471f5a59a463daaa7d619573901111275c559489;
        holders[13] = 0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24;
        holders[14] = 0x498581ff718922c3f8e6a244956af099b2652b2b;
        holders[15] = 0x4f82e73edb06d29ff62c91ec8f5ff06571bdeb29;
        holders[16] = 0x557c7cb60e536c437ac96b361539257b0e2c35c5;
        holders[17] = 0x5777d92f208679db4b9778590fa3cab3ac9e2168;
        holders[18] = 0x59cee22ee277133d153612b3122f6e867445dbb7;
        holders[19] = 0x5d64d14d2cf4fe5fe4e65b1c7e3d11e18d493091;
        holders[20] = 0x6131b5fae19ea4f9d964eac0408e4408b66337b5;
        holders[21] = 0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45;
        holders[22] = 0x6e4141d33021b52c91c28608403db4a0ffb50ec6;
        holders[23] = 0x6ece9b29610fdd909155c154cacffee7d6273bac;
        holders[24] = 0x74de5d4fcbf63e00296fd95d33236b9794016631;
        holders[25] = 0x7a250d5630b4cf539739df2c5dacb4c659f2488d;
        holders[26] = 0x81759dbf79eadb24b1bfe197a833fa89179b0cbd;
        holders[27] = 0x86924c37a93734e8611eb081238928a9d18a63c0;
        holders[28] = 0x881d40237659c251811cec9c364ef91dc08d300c;
        holders[29] = 0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640;
        holders[30] = 0x92cb926a465164c522198208fb963f0e63a89d15;
        holders[31] = 0x9cb8d9bae84830b7f5f11ee5048c04a80b8514ba;
        holders[32] = 0x9f4e276675f50c271d1c8e202479dabccb69ced0;
        holders[33] = 0xa0b86a33e6a4b0e3b893e6217e9c673b8de82b5e;
        holders[34] = 0xa120bf97a89d7fa0927e76c093169fa7cfaca3bb;
        holders[35] = 0xa69babef1ca67a37ffaf7a485dfff3382056e78c;
        holders[36] = 0xa71f09bb63fe0e420d9740e46e28f0057fba68f8;
        holders[37] = 0xad01c20d5886137e056775af56915de824c8fce5;
        holders[38] = 0xad541da7f18a5151411ed8f83c4727a9f45ea3b2;
        holders[39] = 0xaf32ca0c109318a36aa2e10f38611d5b64b72a03;
        holders[40] = 0xc073c7acf73f0de6981ae4bbd8832c875d70b459;
        holders[41] = 0xcfd59c0f530db36eea8ccbfe744f01fe3556925e;
        holders[42] = 0xdf13d712d58EF7F7Abd4D29B398d503262ba4AC0;
        holders[43] = 0xe592427a0aece92de3edee1f18e0157c05861564;
        holders[44] = 0xe5b89fa771049df021dcf3817bfc756bb2f85f96;
        holders[45] = 0xec6c1427a9308c47624899cb3454bd34a424fa8f;
        holders[46] = 0xf00000003d31d4ab730a8e269ae547f8f76996ba;
        holders[47] = 0xf85e95bef8f2de7782b0936ca3480c41a4b6c59b;
        holders[48] = 0xf8bcf76357a358d225dcd431a7238052ce206249;
        holders[49] = 0xffde42d40175b3b9349dfb384439dcb811691e09;
        
        IERC20 oldVmf = IERC20(oldContract);
        uint256 migratedCount = 0;
        uint256 totalMigrated = 0;
        
        console2.log("Migrating token holders...");
        
        for (uint256 i = 0; i < holders.length; i++) {
            address holder = holders[i];
            
            // Get balance from old contract
            uint256 balance = oldVmf.balanceOf(holder);
            
            if (balance > 0) {
                // Mint equivalent tokens in new contract
                newVmf.mint(holder, balance);
                migratedCount++;
                totalMigrated += balance;
                
                console2.log("Migrated:", holder, "Balance:", balance);
            }
        }
        
        console2.log("Migration complete!");
        console2.log("Holders migrated:", migratedCount);
        console2.log("Total tokens migrated:", totalMigrated);
    }
}