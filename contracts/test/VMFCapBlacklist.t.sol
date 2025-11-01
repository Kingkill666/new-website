// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VMF} from "../src/VMF.sol";
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

contract VMFCapBlacklistTest is Test {
    VMF public vmf;
    MockUSDC public usdc;

    address public owner;
    address public charityReceiver;

    address public alice;
    address public donor;
    function setUp() public {
        owner = address(this);
        charityReceiver = makeAddr("charityReceiver");
        alice = makeAddr("alice");
        donor = makeAddr("donor");

        usdc = new MockUSDC();

        VMF implementation = new VMF();

        // Set an initial cap large enough by default for tests that don't override
        uint256 initialCap = type(uint256).max;

        bytes memory initData = abi.encodeWithSelector(
            VMF.initialize.selector,
            address(usdc),
            owner,
            initialCap
        );

        address proxy = LibClone.deployERC1967(address(implementation), initData);
        vmf = VMF(proxy);

        // Ensure initialization (safe in case deployERC1967 didn't call it)
        try vmf.initialize(address(usdc), owner, initialCap) {
        } catch {}

        // Mint some VMF to owner so transfers can be made
        vmf.mint(owner, 1_000_000 ether);
    }

    function test_mint_respects_cap() public {
        // Deploy with small cap
        uint256 smallCap = 1_000 ether;

        VMF impl = new VMF();
        bytes memory initData = abi.encodeWithSelector(
            VMF.initialize.selector,
            address(usdc),
            owner,
            smallCap
        );
        address proxy = LibClone.deployERC1967(address(impl), initData);
        VMF v = VMF(proxy);

    // Ensure initialization was applied to proxy (safe-guard)
    try v.initialize(address(usdc), owner, smallCap) {} catch {}

        // Owner (this) is minter. Mint within cap
        v.mint(alice, 900 ether);
        assertEq(v.totalSupply(), 900 ether);

        // Mint that would exceed cap should revert
        vm.expectRevert(bytes("VMF: cap exceeded"));
        v.mint(alice, 200 ether);
    }

    function test_handleUSDC_respects_cap() public {
        // Setup with cap 100 VMF
        uint256 capAmount = 100 ether;
        VMF impl = new VMF();
        bytes memory initData = abi.encodeWithSelector(
            VMF.initialize.selector,
            address(usdc),
            owner,
            capAmount
        );
        address proxy = LibClone.deployERC1967(address(impl), initData);
        VMF v = VMF(proxy);

        // Make sure v is initialized
        try v.initialize(address(usdc), owner, capAmount) {} catch {}


        // Mint donor USDC and approve
        usdc.mint(donor, 1_000_000e6);
        vm.prank(donor);
        usdc.approve(address(v), type(uint256).max);

        // Add allowed receiver
        vm.prank(owner);
        v.addAllowedReceivers(payable(charityReceiver));

        // Donating 200 USDC would normalize to 200e18 -> would try to mint 200 VMF, exceeding cap 100
        vm.prank(donor);
        vm.expectRevert(bytes("VMF: cap exceeded"));
        v.handleUSDC(200e6, charityReceiver);
    }

}
