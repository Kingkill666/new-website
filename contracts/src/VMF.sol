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

    bool public taxEnabled = false; // Global tax enable/disable switch - disabled by default

    // Roles: owner or address with these roles can update the respective BPS values.
    uint256 internal constant ROLE_SET_TAX = _ROLE_0;
    uint256 internal constant ROLE_SET_CHARITY = _ROLE_1;
    uint256 internal constant ROLE_MINTER = _ROLE_2;
    uint256 internal constant ROLE_ADMIN = _ROLE_3; // can perform owner ops except upgrades
    function ADMIN_ROLE() external pure returns (uint256) { return ROLE_ADMIN; }

    uint256 public donationPool = 1_000_000e18; // running total amount of wei-tokens to be allocated to charity
    uint256 donationMultipleBps = 10_000; // multiple of USDC amount to mint VMF tokens

    // Optional on-chain price oracle (Uniswap v4 pool wrapper) returning USDC per VMF scaled 1e18.
    address public priceOracle; // if set (!=0) overrides donationMultipleBps logic
    // One-way fuse to permanently disable upgrades while keeping contract ownership for ops.
    bool public upgradesDisabled;

    event PriceOracleSet(address indexed oracle);
    event UpgradesDisabled();

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
        taxEnabled = false; // Tax disabled by default
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
    event TaxEnabledChanged(bool enabled);

    function setPriceOracle(address newOracle) external onlyOwnerOrRoles(ROLE_ADMIN) {
        priceOracle = newOracle; // allow setting to zero to disable
        emit PriceOracleSet(newOracle);
    }

    /// @notice Enable or disable tax collection globally
    /// @dev Restricted to owner only. When disabled, all transfers act like normal ERC20
    function setTaxEnabled(bool enabled) external onlyOwnerOrRoles(ROLE_ADMIN) {
        taxEnabled = enabled;
        emit TaxEnabledChanged(enabled);
    }

    // Simple tax implementation - override transfer functions directly
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        return _transferWithTax(msg.sender, to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        return _transferWithTax(from, to, amount);
    }

    function _transferWithTax(address from, address to, uint256 amount) internal returns (bool) {
        // Skip tax for mint/burn, if tax is globally disabled, or if either party is tax exempt
        if (from == address(0) || to == address(0) || !taxEnabled ||
            _taxExempt.contains(from) || _taxExempt.contains(to)) {
            _transfer(from, to, amount);
            return true;
        }

        // Calculate taxes
        uint256 teamTax = (amount * teamRateBps) / 10_000;
        uint256 charityTax = (amount * charityRateBps) / 10_000;
        uint256 totalTax = teamTax + charityTax;
        
        if (totalTax == 0) {
            _transfer(from, to, amount);
            return true;
        }

        // Transfer net amount to recipient
        uint256 netAmount = amount - totalTax;
        _transfer(from, to, netAmount);
        
        // Transfer taxes to respective receivers
        if (teamTax > 0) {
            _transfer(from, teamReceiver, teamTax);
        }
        if (charityTax > 0) {
            _transfer(from, charityReceiver, charityTax);
        }
        
        return true;
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

    // Allow ADMIN_ROLE to manage roles alongside owner.
    function grantRoles(address user, uint256 roles)
        public
        payable
        virtual
        override
        onlyOwnerOrRoles(ROLE_ADMIN)
    {
        _grantRoles(user, roles);
    }

    function revokeRoles(address user, uint256 roles)
        public
        payable
        virtual
        override
        onlyOwnerOrRoles(ROLE_ADMIN)
    {
        _removeRoles(user, roles);
    }

    /// @dev Permanently disable upgrades (one-way fuse). Owner remains for operational controls.
    function disableUpgrades() external onlyOwner {
        require(!upgradesDisabled, "VMF: upgrades already disabled");
        upgradesDisabled = true;
        emit UpgradesDisabled();
    }

    /// @dev Authorizes an upgrade to a new implementation.
    /// Only the owner can authorize upgrades and only if upgrades are not disabled.
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        require(!upgradesDisabled, "VMF: upgrades disabled");
    }

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

    function setTeamAddress(address payable newTeam) external onlyOwnerOrRoles(ROLE_SET_TAX | ROLE_ADMIN) {
        require(
            newTeam != address(0),
            "VMF: new team is the zero address"
        );
        teamReceiver = newTeam;
        emit TeamChanged(teamReceiver);
    }

    event TeamChanged(address newTeam);
    
    function setCharityPoolAddress(address payable newPool) external onlyOwnerOrRoles(ROLE_SET_TAX | ROLE_ADMIN) {
        require(
            newPool!= address(0),
            "VMF: new pool is the zero address"
        );
        charityReceiver = newPool;
        emit CharityPoolAddressChanged(newPool);
    }

    event CharityPoolAddressChanged(address newPool);
    
    function addAllowedReceivers(address payable newCharity) external onlyOwnerOrRoles(ROLE_SET_CHARITY | ROLE_ADMIN) {
        require(
            newCharity != address(0),
            "VMF: new receiver is the zero address"
        );
        _allowedReceivers.add(newCharity);
        emit ReceiverAdded(newCharity);
    }

    function removeAllowedReceivers(address payable oldCharity) external onlyOwnerOrRoles(ROLE_SET_CHARITY | ROLE_ADMIN) {
        _allowedReceivers.remove(oldCharity);
        emit ReceiverRemoved(oldCharity);
    }

    event ReceiverRemoved(address newPool);
    event ReceiverAdded(address newPool);

    function addAllowedTaxExempt(address payable newTaxExempt) external onlyOwnerOrRoles(ROLE_SET_TAX | ROLE_ADMIN) {
        require(
            newTaxExempt != address(0),
            "VMF: new tax exempt is the zero address"
        );
        _taxExempt.add(newTaxExempt);
        emit TaxExemptAdded(newTaxExempt);
    }

    function removeAllowedTaxExempt(address payable oldTaxExempt) external onlyOwnerOrRoles(ROLE_SET_TAX | ROLE_ADMIN) {
        _taxExempt.remove(oldTaxExempt);
        emit TaxExemptRemoved(oldTaxExempt);
    }

    event TaxExemptRemoved(address newPool);
    event TaxExemptAdded(address newPool);

    function updateDonationPool(uint256 setDonationPool) external onlyOwnerOrRoles(ROLE_SET_TAX | ROLE_ADMIN) {
        donationPool = setDonationPool;
        emit DonationPoolChanged(setDonationPool);
    }
    function updateDonationMultipleBps(uint256 newDonationMultipleBps) external onlyOwnerOrRoles(ROLE_SET_TAX | ROLE_ADMIN) {
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

