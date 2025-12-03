// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "solady/tokens/ERC20.sol";
import "../src/addresses/VMFAddresses.sol";

/**
 * @title TokenSplitScript
 * @author Your Name
 * @notice DEPRECATED: This script is no longer functional as minting has been removed from the VMF contract.
 * 
 * This script was designed to perform a 100-to-1 token split by minting new tokens to existing holders.
 * However, the VMF contract no longer supports minting after deployment.
 * 
 * If you need to perform a token split, you must:
 * 1. Use a contract version that still has minting enabled, OR
 * 2. Transfer tokens from the treasury to holders instead of minting, OR
 * 3. Deploy a new contract with the split already applied
 *
 * PRE-REQUISITES (NO LONGER APPLICABLE):
 * 1. Your token contract MUST have a public `mint(address to, uint256 amount)` function. ❌ REMOVED
 * 2. The wallet executing this script MUST have the necessary permissions to call `mint`. ❌ REMOVED
 * 3. You must have a `holders.json` file in the root of your Foundry project.
 *
 * HOW TO RUN:
 * ⚠️ DO NOT RUN - This script will fail as minting is no longer available.
 * forge script script/TokenSplit.s.sol:TokenSplitScript --rpc-url <YOUR_RPC_URL> --private-key <YOUR_PRIVATE_KEY> --broadcast
 */
contract TokenSplitScript is Script {

    // The address of your ERC20 token contract.
    // IMPORTANT: Replace this with your actual token address before running.
    address public tokenContractAddress = VMFAddresses.PROXY;

    // The path to the JSON file containing the holder addresses.
    string public constant HOLDERS_FILE = "holders.json";

    function run() external {
        // DEPRECATED: Minting has been removed from the VMF contract.
        // This script will revert if executed.
        console.log("ERROR: This script is deprecated. Minting functionality has been removed from VMF.");
        console.log("The VMF contract no longer supports minting after deployment.");
        console.log("All 10 million tokens were minted during initial deployment.");
        console.log("To perform a token split, you must use a different approach.");
        revert("TokenSplitScript: Minting no longer available. Script deprecated.");
        
        // OLD CODE (commented out for reference):
        /*
        // Load the array of holder addresses from the JSON file.
        string memory json = vm.readFile(HOLDERS_FILE);
        address[] memory holders = vm.parseJsonAddressArray(json, "$");

        console.log("Loaded %d holder addresses from %s", holders.length, HOLDERS_FILE);
        require(holders.length > 0, "No holders found in JSON file.");

        // Create an interface to interact with the token contract.
        IERC20 token = IERC20(tokenContractAddress);

        // Start broadcasting transactions. This means subsequent calls will be sent to the network.
        vm.startBroadcast();

        // Loop through each holder to calculate and mint new tokens.
        for (uint8 i = 0; i < holders.length; i++) {
            address holder = holders[i];
            console.log("Checking tokens of holder %s", holder);
            uint256 currentBalance = token.balanceOf(holder);
            console.log(
                    "Checking tokens of holder %s (current balance: %d)",
                    holder,
                    currentBalance
                );

            if (currentBalance > 0) {
                // To achieve a 100x balance, we need to mint 99x the current balance.
                // (currentBalance * 1) + (currentBalance * 99) = currentBalance * 100
                uint256 amountToMint = currentBalance * 99;

                console.log(
                    "Minting %d tokens to holder %s (current balance: %d)",
                    amountToMint,
                    holder,
                    currentBalance
                );

                // Execute the mint transaction.
                token.mint(holder, amountToMint);
            } else {
                console.log("Skipping holder %s with zero balance.", holder);
            }
        }

        // Stop broadcasting transactions.
        vm.stopBroadcast();

        console.log("Script finished successfully!");
        */
    }
}

// Minimal ERC20 interface needed for the script.
// NOTE: The mint function is no longer available in VMF contract.
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    // function mint(address to, uint256 amount) external; // REMOVED - no longer available
}
