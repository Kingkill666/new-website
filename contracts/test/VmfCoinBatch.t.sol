// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console} from "forge-std/Test.sol";
import {VmfCoin} from "../src/VmfCoin.sol";
import {ERC20} from "solady/tokens/ERC20.sol";
import {LibClone} from "solady/utils/LibClone.sol";

// Mock USDC contract for testing
contract MockUSDC is ERC20 {
    function name() public pure override returns (string memory) {
        return "USD Coin";
    }
    
    function symbol() public pure override returns (string memory) {
        return "USDC";
    }
    
    function decimals() public pure override returns (uint8) {
        return 6;
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract VmfCoinBatchTest is Test {
    VmfCoin public vmfCoin;
    MockUSDC public usdc;
    
    address public owner;
    address public charity1;
    address public charity2;
    address public charity3;
    address public unauthorizedCharity;
    address public donor;
    address public charityReceiver;
    address public teamReceiver;
    
    uint256 constant INITIAL_DONATION_POOL = 1_000_000e18;
    uint256 constant DONATION_MULTIPLE_BPS = 10000; // 1:1 ratio
    
    event BatchDonation(address indexed donor, address indexed recipient, uint256 amount);
    
    function setUp() public {
        // Set up addresses
        owner = makeAddr("owner");
        charity1 = makeAddr("charity1");
        charity2 = makeAddr("charity2");
        charity3 = makeAddr("charity3");
        unauthorizedCharity = makeAddr("unauthorizedCharity");
        donor = makeAddr("donor");
        charityReceiver = makeAddr("charityReceiver");
        teamReceiver = makeAddr("teamReceiver");
        
        // Deploy mock USDC
        usdc = new MockUSDC();
        
        // Deploy VMF implementation (just like in deploy script)
        VmfCoin implementation = new VmfCoin();
        
        // Prepare the initialization data (just like in deploy script)
        bytes memory initData = abi.encodeWithSelector(
            VmfCoin.initialize.selector,
            address(usdc),
            payable(charityReceiver),
            payable(teamReceiver),
            owner // initial owner
        );
        
        // Deploy the ERC1967 proxy pointing to the implementation (just like in deploy script)
        address proxyAddress = LibClone.deployERC1967(address(implementation), initData);
        vmfCoin = VmfCoin(proxyAddress);
        
        // Explicitly call initialize to ensure proper setup (in case proxy init didn't work)
        try vmfCoin.initialize(
            address(usdc),
            payable(charityReceiver),
            payable(teamReceiver),
            owner
        ) {
            // Initialize succeeded
        } catch {
            // Initialize failed, which means it was already called during proxy deployment
            // This is expected behavior
        }
        
        // Verify the proxy is working (just like in deploy script)
        require(bytes(vmfCoin.name()).length > 0, "VMF: proxy not initialized correctly");
        require(vmfCoin.owner() == owner, "VMF: owner not set correctly");
        require(vmfCoin.minter() == owner, "VMF: minter not set correctly");
        require(vmfCoin.usdc() == address(usdc), "VMF: USDC address not set correctly");
        
        // Set up authorized charities
        vm.startPrank(owner);
        vmfCoin.addAllowedReceivers(payable(charity1));
        vmfCoin.addAllowedReceivers(payable(charity2));
        vmfCoin.addAllowedReceivers(payable(charity3));
        vm.stopPrank();
        
        // Mint USDC to donor
        usdc.mint(donor, 1_000_000e6); // 1M USDC
        
        // Approve VMF contract to spend donor's USDC
        vm.prank(donor);
        usdc.approve(address(vmfCoin), type(uint256).max);
    }
    
    function test_handleUSDCBatch_Success() public {
        // Prepare batch donation data
        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 100e6; // 100 USDC to charity1
        amounts[1] = 200e6; // 200 USDC to charity2
        amounts[2] = 50e6;  // 50 USDC to charity3
        
        address[] memory recipients = new address[](3);
        recipients[0] = charity1;
        recipients[1] = charity2;
        recipients[2] = charity3;
        
        uint256 totalUSDC = 350e6;
        uint256 expectedVMF = 350e18; // 1:1 ratio after normalization
        
        // Record initial balances
        uint256 initialDonorUSDC = usdc.balanceOf(donor);
        uint256 initialDonorVMF = vmfCoin.balanceOf(donor);
        uint256 initialDonationPool = vmfCoin.donationPool();
        
        // Execute batch donation
        vm.prank(donor);
        vmfCoin.handleUSDCBatch(amounts, recipients);
        
        // Verify USDC transfers
        assertEq(usdc.balanceOf(donor), initialDonorUSDC - totalUSDC, "Donor USDC balance incorrect");
        assertEq(usdc.balanceOf(charity1), 100e6, "Charity1 USDC balance incorrect");
        assertEq(usdc.balanceOf(charity2), 200e6, "Charity2 USDC balance incorrect");
        assertEq(usdc.balanceOf(charity3), 50e6, "Charity3 USDC balance incorrect");
        assertEq(usdc.balanceOf(address(vmfCoin)), 0, "VMF contract should not hold USDC");
        
        // Verify VMF minting
        assertEq(vmfCoin.balanceOf(donor), initialDonorVMF + expectedVMF, "Donor VMF balance incorrect");
        
        // Verify donation pool reduction
        assertEq(vmfCoin.donationPool(), initialDonationPool - expectedVMF, "Donation pool not updated correctly");
    }
    
    function test_handleUSDCBatch_EmitsEvents() public {
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100e6;
        amounts[1] = 200e6;
        
        address[] memory recipients = new address[](2);
        recipients[0] = charity1;
        recipients[1] = charity2;
        
        // Expect events
        vm.expectEmit(true, true, false, true);
        emit BatchDonation(donor, charity1, 100e6);
        vm.expectEmit(true, true, false, true);
        emit BatchDonation(donor, charity2, 200e6);
        
        vm.prank(donor);
        vmfCoin.handleUSDCBatch(amounts, recipients);
    }
    
    function test_handleUSDCBatch_RevertArrayLengthMismatch() public {
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100e6;
        amounts[1] = 200e6;
        
        address[] memory recipients = new address[](3);
        recipients[0] = charity1;
        recipients[1] = charity2;
        recipients[2] = charity3;
        
        vm.expectRevert("VMF: arrays length mismatch");
        vm.prank(donor);
        vmfCoin.handleUSDCBatch(amounts, recipients);
    }
    
    function test_handleUSDCBatch_RevertEmptyArrays() public {
        uint256[] memory amounts = new uint256[](0);
        address[] memory recipients = new address[](0);
        
        vm.expectRevert("VMF: empty arrays");
        vm.prank(donor);
        vmfCoin.handleUSDCBatch(amounts, recipients);
    }
    
    function test_handleUSDCBatch_RevertUnauthorizedRecipient() public {
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100e6;
        amounts[1] = 200e6;
        
        address[] memory recipients = new address[](2);
        recipients[0] = charity1;
        recipients[1] = unauthorizedCharity; // Not in allowed receivers
        
        vm.expectRevert("VMF: recipient not allowed");
        vm.prank(donor);
        vmfCoin.handleUSDCBatch(amounts, recipients);
    }
    
    function test_handleUSDCBatch_RevertZeroAmount() public {
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100e6;
        amounts[1] = 0; // Zero amount
        
        address[] memory recipients = new address[](2);
        recipients[0] = charity1;
        recipients[1] = charity2;
        
        vm.expectRevert("VMF: amount must be greater than zero");
        vm.prank(donor);
        vmfCoin.handleUSDCBatch(amounts, recipients);
    }
    
    function test_handleUSDCBatch_RevertExceedsDonationPool() public {
        // Set a very small donation pool
        vm.prank(owner);
        vmfCoin.updateDonationPool(100e18); // Only 100 VMF available
        
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 200e6; // This would require 200 VMF
        
        address[] memory recipients = new address[](1);
        recipients[0] = charity1;
        
        vm.expectRevert("VMF: total donations exceed pool limit");
        vm.prank(donor);
        vmfCoin.handleUSDCBatch(amounts, recipients);
    }
    
    function test_handleUSDCBatch_RevertInsufficientUSDCBalance() public {
        // Create a donor with insufficient USDC
        address poorDonor = makeAddr("poorDonor");
        usdc.mint(poorDonor, 50e6); // Only 50 USDC
        
        vm.prank(poorDonor);
        usdc.approve(address(vmfCoin), type(uint256).max);
        
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100e6; // Trying to donate 100 USDC
        
        address[] memory recipients = new address[](1);
        recipients[0] = charity1;
        
        vm.expectRevert(); // Should revert due to insufficient balance
        vm.prank(poorDonor);
        vmfCoin.handleUSDCBatch(amounts, recipients);
    }
    
    function test_handleUSDCBatch_RevertInsufficientUSDCAllowance() public {
        // Create a donor who hasn't approved enough USDC
        address stingyDonor = makeAddr("stingyDonor");
        usdc.mint(stingyDonor, 1000e6);
        
        vm.prank(stingyDonor);
        usdc.approve(address(vmfCoin), 50e6); // Only approve 50 USDC
        
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100e6; // Trying to donate 100 USDC
        
        address[] memory recipients = new address[](1);
        recipients[0] = charity1;
        
        vm.expectRevert(); // Should revert due to insufficient allowance
        vm.prank(stingyDonor);
        vmfCoin.handleUSDCBatch(amounts, recipients);
    }
    
    function test_handleUSDCBatch_SingleDonation() public {
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100e6;
        
        address[] memory recipients = new address[](1);
        recipients[0] = charity1;
        
        uint256 initialDonorUSDC = usdc.balanceOf(donor);
        uint256 initialDonorVMF = vmfCoin.balanceOf(donor);
        
        vm.prank(donor);
        vmfCoin.handleUSDCBatch(amounts, recipients);
        
        assertEq(usdc.balanceOf(donor), initialDonorUSDC - 100e6, "Donor USDC balance incorrect");
        assertEq(usdc.balanceOf(charity1), 100e6, "Charity USDC balance incorrect");
        assertEq(vmfCoin.balanceOf(donor), initialDonorVMF + 100e18, "Donor VMF balance incorrect");
    }
    
    function test_handleUSDCBatch_LargeBatch() public {
        // Test with 10 donations
        uint256[] memory amounts = new uint256[](10);
        address[] memory recipients = new address[](10);
        
        for (uint256 i = 0; i < 10; i++) {
            amounts[i] = (i + 1) * 10e6; // 10, 20, 30, ..., 100 USDC
            recipients[i] = (i % 3 == 0) ? charity1 : (i % 3 == 1) ? charity2 : charity3;
        }
        
        uint256 totalUSDC = 550e6; // Sum of 10 + 20 + ... + 100
        uint256 expectedVMF = 550e18;
        
        uint256 initialDonorUSDC = usdc.balanceOf(donor);
        uint256 initialDonorVMF = vmfCoin.balanceOf(donor);
        
        vm.prank(donor);
        vmfCoin.handleUSDCBatch(amounts, recipients);
        
        assertEq(usdc.balanceOf(donor), initialDonorUSDC - totalUSDC, "Donor USDC balance incorrect");
        assertEq(vmfCoin.balanceOf(donor), initialDonorVMF + expectedVMF, "Donor VMF balance incorrect");
    }
    
    function testFuzz_handleUSDCBatch(uint256 numDonations, uint256 baseAmount) public {
        // Limit inputs to reasonable ranges
        numDonations = bound(numDonations, 1, 20);
        baseAmount = bound(baseAmount, 1e6, 1000e6); // 1 to 1000 USDC
        
        // Ensure donor has enough USDC
        uint256 totalNeeded = numDonations * baseAmount;
        if (totalNeeded > usdc.balanceOf(donor)) {
            usdc.mint(donor, totalNeeded);
        }
        
        // Ensure donation pool has enough VMF
        uint256 totalVMFNeeded = (totalNeeded * 1e12 * DONATION_MULTIPLE_BPS) / 10000;
        if (totalVMFNeeded > vmfCoin.donationPool()) {
            vm.prank(owner);
            vmfCoin.updateDonationPool(totalVMFNeeded);
        }
        
        uint256[] memory amounts = new uint256[](numDonations);
        address[] memory recipients = new address[](numDonations);
        
        for (uint256 i = 0; i < numDonations; i++) {
            amounts[i] = baseAmount;
            recipients[i] = (i % 3 == 0) ? charity1 : (i % 3 == 1) ? charity2 : charity3;
        }
        
        uint256 initialDonorUSDC = usdc.balanceOf(donor);
        uint256 initialDonorVMF = vmfCoin.balanceOf(donor);
        
        vm.prank(donor);
        vmfCoin.handleUSDCBatch(amounts, recipients);
        
        assertEq(usdc.balanceOf(donor), initialDonorUSDC - totalNeeded, "Fuzz: Donor USDC balance incorrect");
        assertEq(vmfCoin.balanceOf(donor), initialDonorVMF + totalVMFNeeded, "Fuzz: Donor VMF balance incorrect");
    }
}
