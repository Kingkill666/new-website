// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

/**
 * @dev Minimal executor to call upgradeToAndCall through delegatecall context
 */
contract UpgradeExecutor {
    function execute(address target, address newImpl, bytes calldata data) external {
        // This call will be made on the target, creating the proper delegatecall context
        (bool success, bytes memory result) = target.call(
            abi.encodeWithSignature("upgradeToAndCall(address,bytes)", newImpl, data)
        );
        require(success, string(result));
    }
}

contract UpgradeExecutorScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address proxyAddress = vm.envAddress("PROXY_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        console2.log("Deploying UpgradeExecutor...");
        UpgradeExecutor executor = new UpgradeExecutor();
        console2.log("UpgradeExecutor deployed at:", address(executor));

        // Deploy new implementation
        address newImpl = vm.envAddress("NEW_IMPL");
        console2.log("New implementation:", newImpl);

        // Execute upgrade through executor
        console2.log("Executing upgrade...");
        executor.execute(proxyAddress, newImpl, "");

        console2.log("Upgrade executed successfully");

        vm.stopBroadcast();
    }
}
