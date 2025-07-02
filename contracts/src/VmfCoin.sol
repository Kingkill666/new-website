// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "solady/tokens/ERC20.sol";
import {SafeTransferLib} from "solady/utils/SafeTransferLib.sol";
import {EnumerableSetLib} from "solady/utils/EnumerableSetLib.sol";
import {FixedPointMathLib} from "solady/utils/FixedPointMathLib.sol";
import {UUPSUpgradeable} from "solady/utils/UUPSUpgradeable.sol";
import {Ownable} from "solady/auth/Ownable.sol";


contract VmfCoin is ERC20, UUPSUpgradeable, Ownable {
    using FixedPointMathLib for uint256;
    using SafeTransferLib for address;
    using EnumerableSetLib for EnumerableSetLib.AddressSet;

    address public minter; // Address allowed to mint
    address public usdc;   // Address of the USDC contract
    EnumerableSetLib.AddressSet private _allowedReceivers; // this is the list of charities
    EnumerableSetLib.AddressSet private _taxExempt; // this is the list of owners

    address payable public charityReceiver; // where the DAO-charity allocation goes
    uint8 charityRateBps = 33; // amount of tax to

    address payable public teamReceiver; // where the team allocation goes
    uint8 teamRateBps = 10; // amount of tax to be taken from each transaction, in basis points (bps)

    uint256 public donationPool = 1_000_000e18; // running total amount of wei-tokens to be allocated to charity
    uint256 donationMultipleBps = 10000; // multiple of USDC amount to mint VMF tokens

    /// @dev Initializes the contract. Can only be called once.
    function initialize(
        address _usdc,
        address payable initCharityReceiver,
        address payable initTeamReceiver,
        address initialOwner
    ) external {
        // Ensure this can only be called once
        require(minter == address(0), "VMF: already initialized");
        
        minter = initialOwner;
        usdc = _usdc;
        charityReceiver = initCharityReceiver;
        teamReceiver = initTeamReceiver;
        
        // Initialize Ownable
        _initializeOwner(initialOwner);
    }

    /**
     * @dev Override the _transfer function to implement the tax.
     */
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override {
        
        // if tax exempt, full transfer
        if(_taxExempt.contains(sender) || _taxExempt.contains(recipient)) {
            super._transfer(sender, recipient, amount);
            return;
        }

        // Calculate the tax amount.
        uint256 teamAmount = amount.mulWad(teamRateBps).divWad(10000);
        uint256 charityAmount = amount.mulWad(charityRateBps).divWad(10000);
        uint256 amountAfterCharity = amount.saturatingSub(charityAmount);
        uint256 amountAfterTeam = amountAfterCharity.saturatingSub(teamAmount);

        // Perform the transfer after deducting the tax.
        super._transfer(sender, recipient, amountAfterTeam);

        super._transfer(sender, charityReceiver, charityAmount);
        super._transfer(sender, teamReceiver, charityAmount);
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
        return "VMFCoin";
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
    function setMinter(address newMinter) external onlyOwner {
        require(
            newMinter != address(0),
            "VMF: new minter is the zero address"
        );
        minter = newMinter;
        emit MinterChanged(newMinter);
    }
    
    event MinterChanged(address newMinter);

    function setTeamAddress(address payable newTeam) external onlyOwner {
        require(
            newTeam != address(0),
            "VMF: new team is the zero address"
        );
        teamReceiver = newTeam;
        emit TeamChanged(teamReceiver);
    }

    event TeamChanged(address newTeam);
    
    function setCharityPoolAddress(address payable newPool) external onlyOwner {
        require(
            newPool!= address(0),
            "VMF: new pool is the zero address"
        );
        charityReceiver = newPool;
        emit CharityPoolChanged(newPool);
    }

    event CharityPoolChanged(address newPool);
    
    function setCharityBps(uint8 newCharityBps)external onlyOwner {
        charityRateBps = newCharityBps;
        emit CharityRateChanged(newCharityBps);
    }

    event CharityRateChanged(uint8 newCharityBps);

    function setTeamBps(uint8 newTeamBps)external onlyOwner {
        teamRateBps = newTeamBps;
        emit TeamRateChanged(newTeamBps);
    }

    event TeamRateChanged(uint8 newTeamBps);
    
    function addAllowedReceivers(address payable newCharity) external onlyOwner {
        require(
            newCharity != address(0),
            "VMF: new receiver is the zero address"
        );
        _allowedReceivers.add(newCharity);
        emit ReceiverAdded(newCharity);
    }

    function removeAllowedReceivers(address payable oldCharity) external onlyOwner {
        _allowedReceivers.remove(oldCharity);
        emit ReceiverRemoved(oldCharity);
    }

    event ReceiverRemoved(address newPool);
    event ReceiverAdded(address newPool);

    function addAllowedTaxExempt(address payable newTaxExempt) external onlyOwner {
        require(
            newTaxExempt != address(0),
            "VMF: new tax exempt is the zero address"
        );
        _taxExempt.add(newTaxExempt);
        emit TaxExemptAdded(newTaxExempt);
    }

    function removeAllowedTaxExempt(address payable oldTaxExempt) external onlyOwner {
        _taxExempt.remove(oldTaxExempt);
        emit TaxExemptRemoved(oldTaxExempt);
    }

    event TaxExemptRemoved(address newPool);
    event TaxExemptAdded(address newPool);

    function updateDonationPool(uint256 setDonationPool) external onlyOwner {
        donationPool = setDonationPool;
        emit DonationPoolChanged(setDonationPool);
    }
    function updateDonationMultipleBps(uint256 newDonationMultipleBps) external onlyOwner {
        donationMultipleBps = newDonationMultipleBps;
        emit DonationPoolChanged(donationMultipleBps);
    }

    event DonationPoolChanged(uint256 setDonationPool);

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

        uint256 normalizedUsdcAmount = amountUSDC * (10**12);

        uint256 vmfMatching = normalizedUsdcAmount * donationMultipleBps / 10000;
        require(vmfMatching <= donationPool, "VMF: donation exceeds pool limit");
        
        donationPool -= vmfMatching;
        _mint(msg.sender, vmfMatching);

        // Transfer USDC to the specified address
        address(usdc).safeTransfer(to, amountUSDC);
    }

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
            
            uint256 normalizedAmount = amounts[i] * (10**12);
            uint256 vmfMatching = normalizedAmount * donationMultipleBps / 10000;
            totalVMFMatching += vmfMatching;
        }
        
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
