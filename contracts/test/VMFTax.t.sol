// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VMF} from "../src/VMF.sol";

contract VMFTaxTest is Test {
    VMF internal vmf;

    address internal owner = address(this);
    address internal usdc = address(0x1234);
    address internal charity = address(0xCA71); // charity receiver
    address internal team = address(0x7EAA);    // team receiver

    address internal alice = address(0xA11CE);
    address internal bob   = address(0xB0B);
    address internal carol = address(0xCA101);

    uint256 constant INITIAL_MINT = 1_000_000 ether;

    function setUp() public {
        vmf = new VMF();
        vmf.initialize(usdc, payable(charity), payable(team), owner);
        // Make sure owner is allowed to mint (owner == minter after initialize)
        vmf.mint(alice, INITIAL_MINT);
    }

    function _tax(uint256 amount, uint16 bps) internal pure returns (uint256) {
        return amount * bps / 10_000; // basis points helper
    }

    function test_TaxAppliedBasic() public {
        uint256 amount = 1_000 ether;
        uint8 teamBps = 200;    // 2%
        uint8 charityBps = 200; // 2%
        
        // Set tax rates before transfer
        vmf.setTeamRateBps(teamBps);
        vmf.setCharityRateBps(charityBps);
        
        uint256 expectedTeam = _tax(amount, teamBps);
        uint256 expectedCharity = _tax(amount, charityBps);
        uint256 expectedRecipient = amount - expectedTeam - expectedCharity;

        vm.prank(alice);
        vmf.transfer(bob, amount);

        assertEq(vmf.balanceOf(bob), expectedRecipient, "recipient should receive net amount");
        assertEq(vmf.balanceOf(team), expectedTeam, "team should receive team tax");
        assertEq(vmf.balanceOf(charity), expectedCharity, "charity should receive charity tax");
        assertEq(vmf.balanceOf(alice), INITIAL_MINT - amount, "alice balance deducted");
    }

    function test_TaxExemptSender() public {
        // Add alice as exempt
        vmf.addAllowedTaxExempt(payable(alice));
        uint256 amount = 5_000 ether;

        vm.prank(alice);
        vmf.transfer(bob, amount);

        assertEq(vmf.balanceOf(bob), amount, "full amount to recipient when sender exempt");
        assertEq(vmf.balanceOf(team), 0, "no team tax when exempt");
        assertEq(vmf.balanceOf(charity), 0, "no charity tax when exempt");
    }

    function test_TaxExemptRecipient() public {
        // Add bob as exempt recipient (not sender)
        vmf.addAllowedTaxExempt(payable(bob));
        uint256 amount = 2_500 ether;

        vm.prank(alice);
        vmf.transfer(bob, amount);

        assertEq(vmf.balanceOf(bob), amount, "full amount to exempt recipient");
        assertEq(vmf.balanceOf(team), 0, "no team tax when recipient exempt");
        assertEq(vmf.balanceOf(charity), 0, "no charity tax when recipient exempt");
    }

    function test_RoundingSmallAmounts() public {
        // Transfer a small amount to see floor rounding behavior
        uint256 amount = 37; // 37 wei
        vm.prank(alice);
        vmf.transfer(bob, amount);
        // Each tax: floor(37 * 200 / 10000) = floor(7.4) = 7? Wait: 37*200=7400/10000=0 (integer math) -> 0
        // Because integer division floors, both taxes will be 0 and entire amount should go to recipient.
        assertEq(vmf.balanceOf(bob), amount, "all to recipient when taxes round to zero");
        assertEq(vmf.balanceOf(team), 0, "team zero");
        assertEq(vmf.balanceOf(charity), 0, "charity zero");
    }

    function test_MultipleTransfersAccumulateTaxes() public {
        uint8 teamBps = 200;    // 2%
        uint8 charityBps = 200; // 2%
        
        // Set tax rates before transfers
        vmf.setTeamRateBps(teamBps);
        vmf.setCharityRateBps(charityBps);
        
        uint256 amount1 = 10_000 ether; // expected tax each side 200 bps => 200 ether
        uint256 amount2 = 20_000 ether; // expected each side 400 ether

        vm.prank(alice);
        vmf.transfer(bob, amount1);
        vm.prank(alice);
        vmf.transfer(carol, amount2);

        uint256 expectedTeam = _tax(amount1, 200) + _tax(amount2, 200);
        uint256 expectedCharity = expectedTeam; // same bps

        assertEq(vmf.balanceOf(team), expectedTeam, "team accumulative tax");
        assertEq(vmf.balanceOf(charity), expectedCharity, "charity accumulative tax");
    }
}
