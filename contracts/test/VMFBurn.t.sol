// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VMF} from "../src/VMF.sol";
import {TestVMF} from "./TestVMF.sol";
import {ERC20} from "solady/tokens/ERC20.sol";
import {LibClone} from "solady/utils/LibClone.sol";

contract MockUSDC is ERC20 {
    function name() public pure override returns (string memory) { return "USD Coin"; }
    function symbol() public pure override returns (string memory) { return "USDC"; }
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract VMFBurnTest is Test {
    VMF public vmf;
    MockUSDC public usdc;

    address public owner;
    address public charityReceiver;
    address public teamReceiver;
    address public alice;
    address public bob;
    address public spender;

    function setUp() public {
        owner = address(this);
        charityReceiver = makeAddr("charityReceiver");
        teamReceiver = makeAddr("teamReceiver");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        spender = makeAddr("spender");

        usdc = new MockUSDC();

        TestVMF implementation = new TestVMF();
        uint256 initialCap = type(uint256).max;
        bytes memory initData = abi.encodeWithSelector(
            VMF.initialize.selector,
            address(usdc),
            owner,
            initialCap
        );
        address proxy = LibClone.deployERC1967(address(implementation), initData);
        vmf = VMF(proxy);
        // safe-init
        try vmf.initialize(address(usdc), owner, initialCap) {}
        catch {}

        // mint some tokens to alice and bob using test helper
        TestVMF(proxy).testMint(alice, 1_000 ether);
        TestVMF(proxy).testMint(bob, 500 ether);
    }

    function test_burn_reduces_balance_and_supply() public {
        uint256 aliceBalanceBefore = vmf.balanceOf(alice);
        uint256 totalBefore = vmf.totalSupply();

        vm.prank(alice);
        vmf.burn(100 ether);

        assertEq(vmf.balanceOf(alice), aliceBalanceBefore - 100 ether);
        assertEq(vmf.totalSupply(), totalBefore - 100 ether);
    }

    // Note: Blacklist functionality has been removed from the contract.
    // This test is no longer applicable.
    // function test_burn_reverts_if_blacklisted() public {
    //     // Blacklist functionality removed
    // }

    function test_burnFrom_respects_allowance_and_blacklist() public {
        // bob approves spender
        vm.prank(bob);
        vmf.approve(spender, 200 ether);

        // spender burns from bob
        vm.prank(spender);
        vmf.burnFrom(bob, 150 ether);

        assertEq(vmf.balanceOf(bob), 500 ether - 150 ether);

        // check remaining allowance was reduced
        // solady ERC20 stores allowance; call allowance
        assertEq(vmf.allowance(bob, spender), 50 ether);

        // Note: Blacklist functionality has been removed from the contract.
        // The following blacklist test is no longer applicable.
        // // Now blacklist bob and ensure burnFrom reverts
        // vm.prank(owner);
        // vmf.addToBlacklist(bob);
        // vm.prank(spender);
        // vm.expectRevert(bytes("VMF: blacklisted address"));
        // vmf.burnFrom(bob, 1 ether);
    }
}
