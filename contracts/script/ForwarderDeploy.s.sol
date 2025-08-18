// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {ERC20Forwarded} from "../src/ERC20Forwarded.sol";

/**
 * @title ForwarderDeployScript
 * @notice Deploys the ERC20Forwarded contract and optionally preconfigures destination + tokensToForward.
 *
 * Env Vars:
 *  PRIVATE_KEY           - Deployer key
 *  FORWARD_DESTINATION   - Address that should receive forwarded tokens
 *  TOKENS_TO_FORWARD     - Comma-separated list of token addresses (e.g. 0xTokenA,0xTokenB)
 */
contract ForwarderDeployScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address destination = vm.envAddress("FORWARD_DESTINATION");

        // Parse optional tokens list
        string memory raw = vm.envOr("TOKENS_TO_FORWARD", string(""));
        address[] memory tokenList = _parseAddresses(raw);

        vm.startBroadcast(pk);
        ERC20Forwarded forwarder = new ERC20Forwarded(destination);
        console2.log("Forwarder deployed at:", address(forwarder));
        console2.log("Destination:", destination);

        if (tokenList.length > 0) {
            forwarder.setTokensToForward(tokenList);
            console2.log("Configured tokensToForward length:", tokenList.length);
        } else {
            console2.log("No tokens configured yet (TOKENS_TO_FORWARD empty)");
        }

        vm.stopBroadcast();
    }

    function _parseAddresses(string memory csv) internal pure returns (address[] memory) {
        bytes memory b = bytes(csv);
        if (b.length == 0) return new address[](0);
        // Count commas
        uint256 count = 1;
        for (uint256 i; i < b.length; i++) if (b[i] == ",") count++;
        address[] memory addrs = new address[](count);
        uint256 idx;
        uint256 start;
        for (uint256 i; i <= b.length; i++) {
            if (i == b.length || b[i] == ",") {
                uint256 len = i - start;
                bytes memory slice = new bytes(len);
                for (uint256 j; j < len; j++) slice[j] = b[start + j];
                addrs[idx] = _parseAddress(string(slice));
                idx++;
                start = i + 1;
            }
        }
        return addrs;
    }

    function _parseAddress(string memory s) internal pure returns (address a) {
        bytes memory b = bytes(s);
        require(b.length == 42, "bad addr len");
        uint160 result;
        for (uint256 i = 2; i < 42; i += 2) {
            result <<= 8;
            result |= uint8(_fromHexChar(uint8(b[i])))*16 + uint8(_fromHexChar(uint8(b[i+1])));
        }
        return address(result);
    }

    function _fromHexChar(uint8 c) internal pure returns (uint8) {
        if (bytes1(c) >= '0' && bytes1(c) <= '9') return c - uint8(bytes1('0'));
        if (bytes1(c) >= 'a' && bytes1(c) <= 'f') return 10 + c - uint8(bytes1('a'));
        if (bytes1(c) >= 'A' && bytes1(c) <= 'F') return 10 + c - uint8(bytes1('A'));
        revert("invalid hex");
    }
}
