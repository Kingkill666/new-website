// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2 as console} from "forge-std/console2.sol";
import {VMF} from "../src/VMF.sol";

contract GrantAdminRole is Script {
    function run() external {
        address proxy = vm.envAddress("PROXY_ADDRESS");
        address admin = vm.envAddress("ADMIN_ADDRESS");
        vm.startBroadcast();
        VMF vmf = VMF(proxy);
    vmf.grantRoles(admin, vmf.ADMIN_ROLE());
        console.log("Granted ROLE_ADMIN to:", admin);
        vm.stopBroadcast();
    }
}

contract RevokeAdminRole is Script {
    function run() external {
        address proxy = vm.envAddress("PROXY_ADDRESS");
        address admin = vm.envAddress("ADMIN_ADDRESS");
        vm.startBroadcast();
        VMF vmf = VMF(proxy);
    vmf.revokeRoles(admin, vmf.ADMIN_ROLE());
        console.log("Revoked ROLE_ADMIN from:", admin);
        vm.stopBroadcast();
    }
}
