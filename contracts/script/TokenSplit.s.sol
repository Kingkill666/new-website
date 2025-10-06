// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "solady/tokens/ERC20.sol";

/**
 * @title TokenSplitScript
 * @author Your Name
 * @notice This script performs a 100-to-1 token split by minting new tokens to existing holders.
 * It reads a list of holder addresses from a JSON file and mints 99x their current balance to each.
 *
 * PRE-REQUISITES:
 * 1. Your token contract MUST have a public `mint(address to, uint256 amount)` function.
 * 2. The wallet executing this script MUST have the necessary permissions to call `mint`.
 * 3. You must have a `holders.json` file in the root of your Foundry project.
 * This file should contain a single JSON array of holder addresses.
 * You can generate this file using the 'CSV to JSON Array Converter' tool.
 *
 * HOW TO RUN:
 * forge script script/TokenSplit.s.sol:TokenSplitScript --rpc-url <YOUR_RPC_URL> --private-key <YOUR_PRIVATE_KEY> --broadcast
 */
contract TokenSplitScript is Script {

    // The address of your ERC20 token contract.
    // IMPORTANT: Replace this with your actual token address before running.
    address public tokenContractAddress = 0x2213414893259b0C48066Acd1763e7fbA97859E5;

    // The path to the JSON file containing the holder addresses.
    string public constant HOLDERS_FILE = "holders.json";

    function run() external {
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
    }
}

// Minimal ERC20 interface needed for the script.
// Your actual token contract must have these functions.
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function mint(address to, uint256 amount) external;
}
