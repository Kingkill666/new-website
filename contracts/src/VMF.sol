// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "solady/tokens/ERC20.sol";
import {SafeTransferLib} from "solady/utils/SafeTransferLib.sol";
import {EnumerableSetLib} from "solady/utils/EnumerableSetLib.sol";
import {FixedPointMathLib} from "solady/utils/FixedPointMathLib.sol";
import {UUPSUpgradeable} from "solady/utils/UUPSUpgradeable.sol";
import {OwnableRoles} from "solady/auth/OwnableRoles.sol";
interface IVMFPriceOracle {
    function spotPriceUSDCPerVMF() external view returns (uint256);
}


contract VMF is ERC20, UUPSUpgradeable, OwnableRoles {
    using FixedPointMathLib for uint256;
    using SafeTransferLib for address;
    using EnumerableSetLib for EnumerableSetLib.AddressSet;

    address public minter; // Address allowed to mint
    address public usdc;   // Address of the USDC contract
    EnumerableSetLib.AddressSet private _allowedReceivers; // this is the list of charities
    EnumerableSetLib.AddressSet private _taxExempt; // this is the list of owners

    address payable public charityReceiver; // where the DAO-charity allocation goes
    uint8 charityRateBps = 0; // amount of tax to be taken from each transaction, in basis points (bps)

    address payable public teamReceiver; // where the team allocation goes
    uint8 teamRateBps = 0; // amount of tax to be taken from each transaction, in basis points (bps)

    // Roles: owner or address with these roles can update the respective BPS values.
    uint256 internal constant ROLE_SET_TAX = _ROLE_0;
    uint256 internal constant ROLE_SET_CHARITY = _ROLE_1;
    uint256 internal constant ROLE_MINTER = _ROLE_2;

    uint256 public donationPool = 1_000_000e18; // running total amount of wei-tokens to be allocated to charity
    uint256 donationMultipleBps = 10_000; // multiple of USDC amount to mint VMF tokens

    // Optional on-chain price oracle (Uniswap v4 pool wrapper) returning USDC per VMF scaled 1e18.
    address public priceOracle; // if set (!=0) overrides donationMultipleBps logic

    event PriceOracleSet(address indexed oracle);

    /// @dev Initializes the contract. Can only be called once.
    function initialize(
        address _usdc,
        address payable initCharityReceiver,
        address payable initTeamReceiver,
        address initialOwner
    ) external {
        // Ensure this can only be called once
        require(minter == address(0), "VMF: already initialized");
        require(initialOwner != address(0), "VMF: must have an initial owner");
        require(_usdc != address(0), "VMF: must have a valid USDC address");

        minter = initialOwner;
        usdc = _usdc;
        charityReceiver = initCharityReceiver;
        teamReceiver = initTeamReceiver;

        // when working with a proxy, we want to set the storage locations again
        _setDefaults();
        
        // Initialize Ownable
        _initializeOwner(initialOwner);
    }
    
    function _setDefaults() internal {
        charityRateBps = 0;
        teamRateBps = 0;
        donationMultipleBps = 10_000;
        donationPool = 1_000_000e18;
    }

    /// @notice Update the charity tax rate in basis points.
    /// @dev Restricted to owner or holders of ROLE_SET_TAX_RATE.
    /// Note: Stored as uint8, valid range 0-255 (i.e. up to 2.55%).
    function setCharityRateBps(uint8 newRate) external onlyOwnerOrRoles(ROLE_SET_TAX) {
        uint8 old = charityRateBps;
        charityRateBps = newRate;
        emit CharityRateBpsChanged(old, newRate);
    }

    /// @notice Update the team tax rate in basis points.
    /// @dev Restricted to owner or holders of ROLE_SET_TAX.
    /// Note: Stored as uint8, valid range 0-255 (i.e. up to 2.55%).
    function setTeamRateBps(uint8 newRate) external onlyOwnerOrRoles(ROLE_SET_TAX) {
        uint8 old = teamRateBps;
        teamRateBps = newRate;
        emit TeamRateBpsChanged(old, newRate);
    }

    event CharityRateBpsChanged(uint8 oldRate, uint8 newRate);
    event TeamRateBpsChanged(uint8 oldRate, uint8 newRate);

    function setPriceOracle(address newOracle) external onlyOwner {
        priceOracle = newOracle; // allow setting to zero to disable
        emit PriceOracleSet(newOracle);
    }

    // Pending tax context for the current transfer being processed.
    uint256 private _pendingTeam;
    uint256 private _pendingCharity;
    address private _pendingTo;
    bool private _taxActive;

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        if (from == address(0) || to == address(0) || amount == 0) return; // mint/burn/zero
        if (_taxExempt.contains(from) || _taxExempt.contains(to)) return;   // exempt path
        uint256 teamAmount = (amount * teamRateBps) / 10_000;
        uint256 charityAmount = (amount * charityRateBps) / 10_000;
        if (teamAmount + charityAmount == 0) return;
        _pendingTeam = teamAmount;
        _pendingCharity = charityAmount;
        _pendingTo = to;
        _taxActive = true;
    }

    function _afterTokenTransfer(address, address to, uint256) internal override {
        if (!_taxActive || to != _pendingTo) return;
        _taxActive = false;
        uint256 teamAmount = _pendingTeam;
        uint256 charityAmount = _pendingCharity;
        _pendingTeam = 0; _pendingCharity = 0; _pendingTo = address(0);
        if (teamAmount + charityAmount == 0) return;
        uint256 totalTax = teamAmount + charityAmount;
        // Direct storage manipulation per Solady ERC20 layout.
        // balance slot seed 0x87a211a2.
        address recipient = to;
        address charity = charityReceiver;
        address team = teamReceiver;
        uint256 TRANSFER_SIG = 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef;
        assembly {
            mstore(0x0c, 0x87a211a2)
            mstore(0x00, recipient)
            let rSlot := keccak256(0x0c, 0x20)
            let rBal := sload(rSlot)
            if lt(rBal, totalTax) { revert(0,0) }
            sstore(rSlot, sub(rBal, totalTax))
            // charity add
            mstore(0x00, charity)
            let cSlot := keccak256(0x0c, 0x20)
            sstore(cSlot, add(sload(cSlot), charityAmount))
            // team add
            mstore(0x00, team)
            let tSlot := keccak256(0x0c, 0x20)
            sstore(tSlot, add(sload(tSlot), teamAmount))
            // events
            if charityAmount { mstore(0x20, charityAmount) log3(0x20,0x20,TRANSFER_SIG, recipient, charity) }
            if teamAmount { mstore(0x20, teamAmount) log3(0x20,0x20,TRANSFER_SIG, recipient, team) }
        }
    }

    /**
     * @dev Modifier to restrict access to the minter role.
     */
    modifier onlyMinter() {
        require(
            msg.sender == minter || msg.sender == owner(),
            "VMF: caller is not the minter or owner"
        );
        _;
    }

    /// @dev Authorizes an upgrade to a new implementation.
    /// Only the owner can authorize upgrades.
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function name() public view virtual override returns (string memory) {
        return "VMF";
    }
    function symbol() public view virtual override returns (string memory) {
        return "VMF";
    }
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    /**
     * @dev Mints new tokens to a specified address.
     * @param to The address to receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }

    /**
     * @dev Mints new tokens to a specified address and sends to a specific address.
     * @param to The address to receive the minted tokens.
     * @param amount The amount of tokens to mint.
     * @param sendTo The address to send the minted tokens to.
     */
    function mintAndSend(
        address to,
        uint256 amount,
        address sendTo
    ) external onlyMinter {
        _mint(to, amount);
        to.safeTransfer(sendTo, amount);
    }


    /**
     * @dev Sets a new minter.
     * @param newMinter The address of the new minter.
     */
    function setMinter(address newMinter) external onlyOwnerOrRoles(ROLE_MINTER) {
        require(
            newMinter != address(0),
            "VMF: new minter is the zero address"
        );
        minter = newMinter;
        emit MinterChanged(newMinter);
    }
    
    event MinterChanged(address newMinter);

    function setTeamAddress(address payable newTeam) external onlyOwnerOrRoles(ROLE_SET_TAX) {
        require(
            newTeam != address(0),
            "VMF: new team is the zero address"
        );
        teamReceiver = newTeam;
        emit TeamChanged(teamReceiver);
    }

    event TeamChanged(address newTeam);
    
    function setCharityPoolAddress(address payable newPool) external onlyOwnerOrRoles(ROLE_SET_TAX) {
        require(
            newPool!= address(0),
            "VMF: new pool is the zero address"
        );
        charityReceiver = newPool;
        emit CharityPoolAddressChanged(newPool);
    }

    event CharityPoolAddressChanged(address newPool);
    
    function addAllowedReceivers(address payable newCharity) external onlyOwnerOrRoles(ROLE_SET_CHARITY) {
        require(
            newCharity != address(0),
            "VMF: new receiver is the zero address"
        );
        _allowedReceivers.add(newCharity);
        emit ReceiverAdded(newCharity);
    }

    function removeAllowedReceivers(address payable oldCharity) external onlyOwnerOrRoles(ROLE_SET_CHARITY) {
        _allowedReceivers.remove(oldCharity);
        emit ReceiverRemoved(oldCharity);
    }

    event ReceiverRemoved(address newPool);
    event ReceiverAdded(address newPool);

    function addAllowedTaxExempt(address payable newTaxExempt) external onlyOwnerOrRoles(ROLE_SET_TAX) {
        require(
            newTaxExempt != address(0),
            "VMF: new tax exempt is the zero address"
        );
        _taxExempt.add(newTaxExempt);
        emit TaxExemptAdded(newTaxExempt);
    }

    function removeAllowedTaxExempt(address payable oldTaxExempt) external onlyOwnerOrRoles(ROLE_SET_TAX) {
        _taxExempt.remove(oldTaxExempt);
        emit TaxExemptRemoved(oldTaxExempt);
    }

    event TaxExemptRemoved(address newPool);
    event TaxExemptAdded(address newPool);

    function updateDonationPool(uint256 setDonationPool) external onlyOwnerOrRoles(ROLE_SET_TAX) {
        donationPool = setDonationPool;
        emit DonationPoolChanged(setDonationPool);
    }
    function updateDonationMultipleBps(uint256 newDonationMultipleBps) external onlyOwnerOrRoles(ROLE_SET_TAX) {
        donationMultipleBps = newDonationMultipleBps;
        emit DonationMultipleBpsChanged(donationMultipleBps);
    }

    event DonationPoolChanged(uint256 setDonationPool);
    event DonationMultipleBpsChanged(uint256 setDonationMultipleBps);

    /**
     * @dev Function to accept USDC, mint tokens to the sender, and transfer USDC.
     * @param amountUSDC The amount of USDC to accept.
     * @param to The address to send the USDC to.
     */
    function handleUSDC(uint256 amountUSDC, address to) external {
        require(_allowedReceivers.contains(to), "VMF: to is not an allowed receiver");
        require(amountUSDC > 0, "VMF: amountUSDC must be greater than zero");

        // Transfer USDC from sender to this contract (no allowance check needed as this is a safeTransferFrom)
        address(usdc).safeTransferFrom(msg.sender, address(this), amountUSDC);

        uint256 normalizedUsdcAmount = amountUSDC * (10**12); // 6 -> 18 decimals
        uint256 vmfMatching;
        if (priceOracle != address(0)) {
            uint256 price = IVMFPriceOracle(priceOracle).spotPriceUSDCPerVMF(); // USDC per 1 VMF scaled 1e18
            require(price > 0, "VMF: bad price");
            // amountUSDC (18d) * 1e18 / price => VMF amount (18d)
            vmfMatching = (normalizedUsdcAmount * 1e18) / price;
        } else {
            uint256 donationMultiple = donationMultipleBps / 10000; // integer division bps -> multiplier
            vmfMatching = normalizedUsdcAmount * donationMultiple;
        }
        require(vmfMatching <= donationPool, "VMF: donation exceeds pool limit");
        
        donationPool -= vmfMatching;
        _mint(msg.sender, vmfMatching);

        // Transfer USDC to the specified address
        address(usdc).safeTransfer(to, amountUSDC);
    }

    /// @dev Emitted when a batch donation is made
    event Donation(address indexed donor, address indexed recipient, uint256 amount);

    /**
     * @dev Batch function to handle multiple USDC donations in a single transaction.
     * @param amounts Array of USDC amounts to donate.
     * @param recipients Array of addresses to receive the USDC donations.
     */
    function handleUSDCBatch(uint256[] calldata amounts, address[] calldata recipients) external {
        require(amounts.length == recipients.length, "VMF: arrays length mismatch");
        require(amounts.length > 0, "VMF: empty arrays");
        
        uint256 totalUSDC = 0;
        uint256 totalVMFMatching = 0;
        
        // Validate all recipients and calculate totals
        for (uint256 i = 0; i < recipients.length; i++) {
            require(_allowedReceivers.contains(recipients[i]), "VMF: recipient not allowed");
            require(amounts[i] > 0, "VMF: amount must be greater than zero");
            
            totalUSDC += amounts[i];
            
            uint256 normalizedAmount = amounts[i] * (10**12); // 6 -> 18
            uint256 vmfMatching;
            if (priceOracle != address(0)) {
                uint256 price = IVMFPriceOracle(priceOracle).spotPriceUSDCPerVMF();
                require(price > 0, "VMF: bad price");
                vmfMatching = (normalizedAmount * 1e18) / price;
            } else {
                uint256 donationMultiple = FixedPointMathLib.divUp(donationMultipleBps, 10_000);
                vmfMatching = normalizedAmount * donationMultiple;
            }
            totalVMFMatching += vmfMatching;
        }

        require(totalVMFMatching > 0, "VMF: no VMF tokens to mint");
        
        // Check total VMF matching against donation pool
        require(totalVMFMatching <= donationPool, "VMF: total donations exceed pool limit");
        
        // Transfer total USDC from sender to this contract
        address(usdc).safeTransferFrom(msg.sender, address(this), totalUSDC);
        
        // Update donation pool and mint total VMF tokens
        donationPool -= totalVMFMatching;
        _mint(msg.sender, totalVMFMatching);
        
        // Transfer USDC to each recipient
        for (uint256 i = 0; i < recipients.length; i++) {
            address(usdc).safeTransfer(recipients[i], amounts[i]);
            emit BatchDonation(msg.sender, recipients[i], amounts[i]);
        }
    }

    /// @dev Emitted when a batch donation is made
    event BatchDonation(address indexed donor, address indexed recipient, uint256 amount);
}
