// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VMF} from "../src/VMF.sol";

contract VMFAdminTest is Test {
    VMF internal vmf;

    address internal owner = address(this);
    address internal usdc = address(0x1234);
    address internal charity = address(0xCA71);
    address internal team = address(0x7EAA);

    address internal admin;
    address internal user1;
    address internal user2;

    // Mirror OwnableRoles bit layout used by VMF
    uint256 constant ROLE_SET_TAX = 1 << 0;      // _ROLE_0
    uint256 constant ROLE_SET_CHARITY = 1 << 1;  // _ROLE_1
    uint256 constant ROLE_MINTER = 1 << 2;       // _ROLE_2

    function setUp() public {
        vmf = new VMF();
        vmf.initialize(usdc, payable(charity), payable(team), owner);
        admin = makeAddr("admin");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
    }

    function _unauthorizedSelector() internal pure returns (bytes4) {
        // solady Ownable/OwnableRoles Unauthorized() selector
        return bytes4(keccak256("Unauthorized()"));
    }

    function test_AdminCanGrantAndRevokeRoles() public {
        uint256 ADMIN_ROLE = vmf.ADMIN_ROLE();

        // Owner grants admin role to admin address
        vmf.grantRoles(admin, ADMIN_ROLE);
        assertTrue(vmf.hasAllRoles(admin, ADMIN_ROLE), "admin should have ADMIN_ROLE");

        // Admin grants ROLE_SET_TAX to user1
        vm.prank(admin);
        vmf.grantRoles(user1, ROLE_SET_TAX);
        assertTrue(vmf.hasAllRoles(user1, ROLE_SET_TAX), "user1 should have ROLE_SET_TAX");

        // Admin revokes ROLE_SET_TAX from user1
        vm.prank(admin);
        vmf.revokeRoles(user1, ROLE_SET_TAX);
        assertFalse(vmf.hasAnyRole(user1, ROLE_SET_TAX), "user1 role should be revoked");
    }

    function test_AdminCannotTransferOwnershipOrDisableUpgrades() public {
        uint256 ADMIN_ROLE = vmf.ADMIN_ROLE();
        vmf.grantRoles(admin, ADMIN_ROLE);

        // Admin cannot transfer ownership (onlyOwner)
        vm.prank(admin);
        vm.expectRevert(_unauthorizedSelector());
        vmf.transferOwnership(user2);

        // Admin cannot call disableUpgrades (onlyOwner)
        vm.prank(admin);
        vm.expectRevert(_unauthorizedSelector());
        vmf.disableUpgrades();
    }

    function test_AdminCanUseAdminGatedSetters() public {
        uint256 ADMIN_ROLE = vmf.ADMIN_ROLE();
        vmf.grantRoles(admin, ADMIN_ROLE);

        // setPriceOracle (onlyOwnerOrRoles(ROLE_ADMIN))
    address newOracle = makeAddr("oracle");
        vm.prank(admin);
        vmf.setPriceOracle(newOracle);
        assertEq(vmf.priceOracle(), newOracle, "oracle should be updated by admin");

        // setTaxEnabled (onlyOwnerOrRoles(ROLE_ADMIN))
        vm.prank(admin);
        vmf.setTaxEnabled(true);
        assertTrue(vmf.taxEnabled(), "admin should enable tax");

        // setTeamAddress and setCharityPoolAddress (| ROLE_ADMIN)
        address payable newTeam = payable(address(0x7EA7));
        address payable newCharity = payable(address(0xC4A7));

        vm.prank(admin);
        vmf.setTeamAddress(newTeam);
        assertEq(vmf.teamReceiver(), newTeam, "team address updated by admin");

        vm.prank(admin);
        vmf.setCharityPoolAddress(newCharity);
        assertEq(vmf.charityReceiver(), newCharity, "charity address updated by admin");
    }

    function test_AdminCanSelfGrantTaxRoleAndSetRates() public {
        uint256 ADMIN_ROLE = vmf.ADMIN_ROLE();
        vmf.grantRoles(admin, ADMIN_ROLE);

        // Admin self-grants ROLE_SET_TAX
        vm.prank(admin);
        vmf.grantRoles(admin, ROLE_SET_TAX);
        assertTrue(vmf.hasAllRoles(admin, ROLE_SET_TAX), "admin should hold ROLE_SET_TAX");

        // With ROLE_SET_TAX, admin can set rates and we validate via transfer behavior
        vm.prank(admin);
        vmf.setTeamRateBps(10);      // 0.10%
        vm.prank(admin);
        vmf.setCharityRateBps(20);   // 0.20%

        // Enable tax (admin has ROLE_ADMIN)
        vm.prank(admin);
        vmf.setTaxEnabled(true);

        // Mint to user1 and transfer to user2 to observe taxes
        vmf.mint(user1, 1000 ether);

        uint256 amount = 100 ether;
        // Expected taxes: team 0.1% = 0.1, charity 0.2% = 0.2
        uint256 expectedTeam = (amount * 10) / 10_000;      // 0.1 ether
        uint256 expectedCharity = (amount * 20) / 10_000;   // 0.2 ether
        uint256 expectedNet = amount - expectedTeam - expectedCharity;

        vm.prank(user1);
        vmf.transfer(user2, amount);

        assertEq(vmf.balanceOf(user2), expectedNet, "recipient receives net after tax");
        assertEq(vmf.balanceOf(team), expectedTeam, "team receives team tax");
        assertEq(vmf.balanceOf(charity), expectedCharity, "charity receives charity tax");
    }

    function test_AdminManagesRolesAfterOwnerRenounce() public {
        uint256 ADMIN_ROLE = vmf.ADMIN_ROLE();

        // Give admin role first
        vmf.grantRoles(admin, ADMIN_ROLE);

        // Owner renounces ownership
        vmf.renounceOwnership();
        assertEq(vmf.owner(), address(0), "owner should be zero after renounce");

        // Admin should still be able to manage roles
        vm.prank(admin);
        vmf.grantRoles(user2, ROLE_SET_CHARITY);
        assertTrue(vmf.hasAllRoles(user2, ROLE_SET_CHARITY), "user2 should get ROLE_SET_CHARITY");

        vm.prank(admin);
        vmf.revokeRoles(user2, ROLE_SET_CHARITY);
        assertFalse(vmf.hasAnyRole(user2, ROLE_SET_CHARITY), "user2 ROLE_SET_CHARITY revoked");
    }

    function test_TwoStepOwnershipHandover_Success() public {
        // Prepare a new owner
        address newOwner = makeAddr("newOwner");

        // New owner requests handover (anyone can request their own)
        vm.prank(newOwner);
        vmf.requestOwnershipHandover();
        assertGt(vmf.ownershipHandoverExpiresAt(newOwner), 0, "handover should be scheduled");

        // Current owner completes handover to newOwner
        vmf.completeOwnershipHandover(newOwner);
        assertEq(vmf.owner(), newOwner, "ownership transferred to newOwner");

        // Previous owner is no longer authorized
        vm.expectRevert(_unauthorizedSelector());
        vmf.transferOwnership(owner);
    }

    function test_TwoStepOwnershipHandover_Cancel() public {
        address candidate = makeAddr("candidate");
        vm.prank(candidate);
        vmf.requestOwnershipHandover();
        assertGt(vmf.ownershipHandoverExpiresAt(candidate), 0, "handover exists");

        vm.prank(candidate);
        vmf.cancelOwnershipHandover();
        assertEq(vmf.ownershipHandoverExpiresAt(candidate), 0, "handover canceled");

        // Completing now should revert: NoHandoverRequest
        vm.expectRevert();
        vmf.completeOwnershipHandover(candidate);
    }

    function test_TwoStepOwnershipHandover_Expiry() public {
        address candidate = makeAddr("expiryCandidate");
        vm.prank(candidate);
        vmf.requestOwnershipHandover();
        uint256 expiry = vmf.ownershipHandoverExpiresAt(candidate);
        assertGt(expiry, 0, "handover exists");

        // Warp past the 48h window (Ownable default)
        vm.warp(expiry + 1);
        vm.expectRevert();
        vmf.completeOwnershipHandover(candidate);
    }

    function test_AdminRolePersistsThroughHandover() public {
        uint256 ADMIN_ROLE = vmf.ADMIN_ROLE();
        vmf.grantRoles(admin, ADMIN_ROLE);

        // Handover to user1
        vm.prank(user1);
        vmf.requestOwnershipHandover();
        vmf.completeOwnershipHandover(user1);
        assertEq(vmf.owner(), user1, "user1 now owner");

        // Admin still has ADMIN_ROLE and can call admin-gated functions
        vm.prank(admin);
        vmf.setTaxEnabled(true);
        assertTrue(vmf.taxEnabled(), "admin still effective after handover");

        // Admin still cannot transfer ownership
        vm.prank(admin);
        vm.expectRevert(_unauthorizedSelector());
        vmf.transferOwnership(owner);
    }
}
