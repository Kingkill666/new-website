// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2 as console} from "forge-std/console2.sol";

import {VMF} from "../src/VMF.sol";

/// @notice Forge script to permanently disable upgrades on the VMF UUPS proxy
contract DisableUpgradesScript is Script {
    function run() external {
        address proxy = vm.envAddress("PROXY_ADDRESS");

        vm.startBroadcast();

        VMF vmf = VMF(payable(proxy));
        console.log("Upgrades currently disabled:", vmf.upgradesDisabled());
        vmf.disableUpgrades();
        console.log("Upgrades now disabled:", vmf.upgradesDisabled());

        vm.stopBroadcast();
    }
}
