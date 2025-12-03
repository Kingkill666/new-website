// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {VMF} from "../src/VMF.sol";

/**
 * @dev Manual upgrade script that uses the new upgrade() function
 * This assumes the implementation has been upgraded to v2 with the upgrade() function
 */
contract ManualUpgradeScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address proxyAddress = vm.envAddress("PROXY_ADDRESS");

        address caller = vm.addr(deployerPrivateKey);
        console2.log("Caller:", caller);
        console2.log("Target:", proxyAddress);

        // Just broadcast the upgrade call - don't simulate
        vm.broadcast(deployerPrivateKey);

        // Call upgrade directly
        (bool success, bytes memory result) = proxyAddress.call(
            abi.encodeWithSignature("upgrade(address,bytes)", vm.envAddress("NEW_IMPL"), "")
        );

        require(success, string(result));
        console2.log("Upgrade transaction sent");
    }
}
