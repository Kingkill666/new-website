// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VMF} from "../src/VMF.sol";

contract VMFAdminTest is Test {
    VMF internal vmf;

    address internal owner = address(this);
    address internal usdc = address(0x1234);

    address internal admin;
    address internal user1;
    address internal user2;

    // Mirror OwnableRoles bit layout used by VMF
    uint256 constant ROLE_SET_CHARITY = 1 << 0; // _ROLE_0
    // Note: ROLE_MINTER has been removed from the contract

    function setUp() public {
        vmf = new VMF();
        vmf.initialize(usdc, owner, 0);
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

        // Admin grants ROLE_SET_CHARITY to user1
        vm.prank(admin);
        vmf.grantRoles(user1, ROLE_SET_CHARITY);
        assertTrue(vmf.hasAllRoles(user1, ROLE_SET_CHARITY), "user1 should have ROLE_SET_CHARITY");

        // Admin revokes ROLE_SET_CHARITY from user1
        vm.prank(admin);
        vmf.revokeRoles(user1, ROLE_SET_CHARITY);
        assertFalse(vmf.hasAnyRole(user1, ROLE_SET_CHARITY), "user1 role should be revoked");
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

        // updateDonationPool (onlyOwnerOrRoles(ROLE_ADMIN))
        uint256 newDonationPool = 500e18;
        vm.prank(admin);
        vmf.updateDonationPool(newDonationPool);
        assertEq(vmf.donationPool(), newDonationPool, "donation pool updated by admin");

        // updateDonationMultipleBps (onlyOwnerOrRoles(ROLE_ADMIN))
        uint256 newMultiple = 8_000;
        vm.prank(admin);
        vmf.updateDonationMultipleBps(newMultiple);
        assertEq(vmf.donationMultipleBps(), newMultiple, "donation multiple updated by admin");

    }

    // Note: Minting functionality has been removed from the contract.
    // This test is no longer applicable as tokens cannot be minted after deployment.
    // function test_AdminCanSelfGrantMinterAndMint() public {
    //     // Minting removed - test disabled
    // }

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

        // Owner grants admin role to admin address
        vmf.grantRoles(admin, ADMIN_ROLE);

        // Owner initiates handover to admin
        vm.prank(admin);
        vmf.requestOwnershipHandover();
        vmf.completeOwnershipHandover(admin);
        assertEq(vmf.owner(), admin, "ownership should transfer to admin");

        // Previous owner (this contract) should no longer be able to grant roles
        vm.expectRevert(_unauthorizedSelector());
        vmf.grantRoles(user1, ROLE_SET_CHARITY);

        // New owner (admin) can still manage roles
        vm.prank(admin);
        vmf.grantRoles(user1, ROLE_SET_CHARITY);
        assertTrue(vmf.hasAllRoles(user1, ROLE_SET_CHARITY), "user1 should receive ROLE_SET_CHARITY");
    }
}
