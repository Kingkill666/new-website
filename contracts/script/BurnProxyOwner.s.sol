// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2 as console} from "forge-std/console2.sol";

import {VMF} from "../src/VMF.sol";

/// @notice Forge script to renounce ownership on a UUPS proxy of VMF to disable upgrades.
/// Usage:
///   PROXY_ADDRESS=0x... forge script script/BurnProxyOwner.s.sol:BurnProxyOwnerScript \
///     --rpc-url $BASE_RPC_URL --private-key $PRIVATE_KEY --broadcast \
///     --verify --etherscan-api-key $BASESCAN_API_KEY
contract BurnProxyOwnerScript is Script {
    function run() external {
        address proxy = vm.envAddress("PROXY_ADDRESS");

        vm.startBroadcast();

        VMF vmf = VMF(payable(proxy));
        address prevOwner = vmf.owner();
        console.log("Current owner:", prevOwner);

        // Renounce ownership on the proxy storage via delegatecall to implementation.
        vmf.renounceOwnership();

        address newOwner = vmf.owner();
        console.log("New owner:", newOwner);

        vm.stopBroadcast();

        require(newOwner == address(0), "Owner not renounced (non-zero)");
    }
}
