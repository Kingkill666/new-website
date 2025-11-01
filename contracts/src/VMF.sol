// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "solady/tokens/ERC20.sol";
import {SafeTransferLib} from "solady/utils/SafeTransferLib.sol";
import {EnumerableSetLib} from "solady/utils/EnumerableSetLib.sol";
import {FixedPointMathLib} from "solady/utils/FixedPointMathLib.sol";
import {OwnableRoles} from "solady/auth/OwnableRoles.sol";
import {Initializable} from "solady/utils/Initializable.sol";
import {UUPSUpgradeable} from "solady/utils/UUPSUpgradeable.sol";

interface IVMFPriceOracle {
    function spotPriceUSDCPerVMF() external view returns (uint256);
}

contract VMF is Initializable, UUPSUpgradeable, ERC20, OwnableRoles {
    using FixedPointMathLib for uint256;
    using SafeTransferLib for address;
    using EnumerableSetLib for EnumerableSetLib.AddressSet;

    address public minter; // Address allowed to mint
    address public usdc;   // Address of the USDC contract
    EnumerableSetLib.AddressSet private _allowedReceivers; // this is the list of charities

    // Roles: owner or address with these roles can update the respective values.
    uint256 internal constant ROLE_SET_CHARITY = _ROLE_0;
    uint256 internal constant ROLE_MINTER = _ROLE_1;
    uint256 internal constant ROLE_ADMIN = _ROLE_2; // can perform owner ops except upgrades
    function ADMIN_ROLE() external pure returns (uint256) { return ROLE_ADMIN; }

    uint256 public donationPool = 1_000_000e18; // running total amount of wei-tokens to be allocated to charity
    uint256 public donationMultipleBps = 10_000; // multiple of USDC amount to mint VMF tokens
    
    // Maximum total supply cap (in wei-tokens, 18 decimals). Zero means no cap.
    uint256 public cap;

    event CapChanged(uint256 oldCap, uint256 newCap);

    // Optional on-chain price oracle (Uniswap v4 pool wrapper) returning USDC per VMF scaled 1e18.
    address public priceOracle; // if set (!=0) overrides donationMultipleBps logic

    event PriceOracleSet(address indexed oracle);
    // Solady Initializable + UUPSUpgradeable provide initializer and upgrade utilities.

    // Upgrade locking
    bool private _upgradesDisabled;
    event UpgradesDisabled();

    /// @dev Initializer that replaces constructor for upgradeable deployments.
    function initialize(
        address _usdc,
        address initialOwner,
        uint256 initialCap
    ) public initializer {
        require(initialOwner != address(0), "VMF: must have an initial owner");
        require(_usdc != address(0), "VMF: must have a valid USDC address");

        minter = initialOwner;
        usdc = _usdc;

        // Set default values
        donationMultipleBps = 10_000;
        donationPool = 1_000_000e18;

        // Cap: default to 10,000,000 VMF if none provided (0)
        cap = initialCap;
        if (cap == 0) {
            cap = 10_000_000e18;
        }

        // Initialize OwnableRoles (solady)
        _initializeOwner(initialOwner);
    }

    function setPriceOracle(address newOracle) external onlyOwnerOrRoles(ROLE_ADMIN) {
        priceOracle = newOracle; // allow setting to zero to disable
        emit PriceOracleSet(newOracle);
    }

    /// @dev Authorize UUPS upgrades. Uses OwnableRoles internal guard.
    function _authorizeUpgrade(address) internal view override {
        // Prevent upgrades if they've been permanently disabled
        require(!_upgradesDisabled, "VMF: upgrades disabled");
        // Reverts if caller is not owner and does not have ROLE_ADMIN.
        _checkOwnerOrRoles(ROLE_ADMIN);
    }

    /// @notice Permanently disable upgrades. Irreversible.
    function disableUpgrades() external onlyOwner {
        _upgradesDisabled = true;
        emit UpgradesDisabled();
    }

    /// @notice Check whether upgrades have been disabled
    function upgradesDisabled() external view returns (bool) {
        return _upgradesDisabled;
    }

    /**
     * @dev Modifier to restrict access to the minter role.
     */
    modifier onlyMinter() {
        require(
            msg.sender == minter
                || msg.sender == owner()
                || hasAllRoles(msg.sender, ROLE_MINTER),
            "VMF: caller is not authorized to mint"
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
        // Enforce cap if set
        require(cap == 0 || totalSupply() + amount <= cap, "VMF: cap exceeded");
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
        // Enforce cap if set
        require(cap == 0 || totalSupply() + amount <= cap, "VMF: cap exceeded");
        _mint(to, amount);
        to.safeTransfer(sendTo, amount);
    }

    /// @notice Distribute VMF held by the contract treasury.
    function pay(address to, uint256 amount) external onlyOwnerOrRoles(ROLE_ADMIN) {
        require(to != address(0), "VMF: zero address");
        require(amount > 0, "VMF: amount must be greater than zero");
        _transfer(address(this), to, amount);
        emit TreasuryPayment(to, amount);
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

    event TreasuryPayment(address indexed to, uint256 amount);

    function updateDonationPool(uint256 setDonationPool) external onlyOwnerOrRoles(ROLE_ADMIN) {
        donationPool = setDonationPool;
        emit DonationPoolChanged(setDonationPool);
    }
    function updateDonationMultipleBps(uint256 newDonationMultipleBps) external onlyOwnerOrRoles(ROLE_ADMIN) {
        donationMultipleBps = newDonationMultipleBps;
        emit DonationMultipleBpsChanged(donationMultipleBps);
    }

    /// @notice Set or update the total supply cap. 0 means no cap.
    function setCap(uint256 newCap) external onlyOwnerOrRoles(ROLE_ADMIN) {
        // newCap must not be smaller than current total supply (unless zero means no cap allowed?)
    require(newCap == 0 || newCap >= totalSupply(), "VMF: new cap below total supply");
        uint256 old = cap;
        cap = newCap;
        emit CapChanged(old, newCap);
    }

    event DonationPoolChanged(uint256 setDonationPool);
    event DonationMultipleBpsChanged(uint256 setDonationMultipleBps);

    /**
     * @dev Function to accept USDC, distribute treasury-held tokens to the sender, and transfer USDC.
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
        require(balanceOf(address(this)) >= vmfMatching, "VMF: insufficient treasury balance");
        
        donationPool -= vmfMatching;
        _transfer(address(this), msg.sender, vmfMatching);

        // Transfer USDC to the specified address
        address(usdc).safeTransfer(to, amountUSDC);
        emit Donation(msg.sender, to, amountUSDC);
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

        require(totalVMFMatching > 0, "VMF: no VMF tokens to distribute");
        
        // Check total VMF matching against donation pool
        require(totalVMFMatching <= donationPool, "VMF: total donations exceed pool limit");
        require(balanceOf(address(this)) >= totalVMFMatching, "VMF: insufficient treasury balance");
        
        // Transfer total USDC from sender to this contract
        address(usdc).safeTransferFrom(msg.sender, address(this), totalUSDC);
        
        // Update donation pool and transfer total VMF tokens
        donationPool -= totalVMFMatching;
        _transfer(address(this), msg.sender, totalVMFMatching);
        
        // Transfer USDC to each recipient
        for (uint256 i = 0; i < recipients.length; i++) {
            address(usdc).safeTransfer(recipients[i], amounts[i]);
            emit BatchDonation(msg.sender, recipients[i], amounts[i]);
        }
        
        // Emit comprehensive transaction summary for wallet display
        emit BatchDonationComplete(msg.sender, totalUSDC, totalVMFMatching, recipients.length);
    }

    /// @dev Emitted when a batch donation is made
    event BatchDonation(address indexed donor, address indexed recipient, uint256 amount);
    
    /// @dev Emitted when a complete batch donation transaction is processed
    event BatchDonationComplete(
        address indexed donor, 
        uint256 totalUSDC, 
        uint256 totalVMFDistributed, 
        uint256 charityCount
    );
}
