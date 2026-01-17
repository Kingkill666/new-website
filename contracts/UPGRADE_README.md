# VMF Contract Upgrade Guide

This guide explains how to upgrade the VMF UUPS proxy contract to a new implementation.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Upgrade Process](#upgrade-process)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## Overview

The VMF contract uses the UUPS (Universal Upgradeable Proxy Standard) pattern, which allows the implementation to be upgraded while preserving the proxy address and all storage state.

### Key Addresses

**Base Sepolia (Testnet):**
- Proxy: `0x8157B303a10609C50e332717D70E53B09ebdb045`
- Latest Implementation: `0xB728e46f776859e35FD8f58A2731dd86BA24c923` (deployed Nov 2, 2025)

**Base Mainnet:**
- Proxy: `0x2213414893259b0C48066Acd1763e7fbA97859E5`

## Prerequisites

### 1. Environment Setup

Create or update your `.env` file with the following variables:

```bash
# Private key (MUST have 0x prefix)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Proxy address to upgrade
PROXY_ADDRESS=0x8157B303a10609C50e332717D70E53B09ebdb045

# RPC URLs
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# BaseScan API key for contract verification
BASESCAN_API_KEY=YOUR_BASESCAN_API_KEY
```

**Important:** The private key MUST start with `0x` prefix or the script will fail.

### 2. Foundry Version

**You must use Foundry 1.4.4 or later** for Etherscan v2 API verification to work:

```bash
# Check current version
forge --version

# Upgrade to latest (if needed)
foundryup

# Verify you have 1.4.4 or later
forge --version
# Should show: forge Version: 1.4.4-nightly or higher
```

Older versions of Foundry will fail with "deprecated V1 endpoint" errors.

### 3. Permissions

The wallet corresponding to `PRIVATE_KEY` must be either:
- The proxy contract owner, OR
- An address with the `ADMIN_ROLE` (role `_ROLE_2`)

### 4. Gas Fees

Ensure the wallet has sufficient ETH:
- Base Sepolia: ~0.003 ETH (very cheap)
- Base Mainnet: ~0.005-0.01 ETH (depends on gas prices)

## Upgrade Process

### Quick Start

```bash
# Upgrade on Base Sepolia (testnet)
./upgrade.sh sepolia

# Upgrade on Base Mainnet
./upgrade.sh mainnet
# or simply:
./upgrade.sh
```

### Step-by-Step

1. **Update Contract Code** (if needed)
   
   Make your changes to `src/VMF.sol` and test thoroughly.

2. **Test Locally**
   
   ```bash
   forge test
   forge build
   ```

3. **Run Upgrade on Testnet First**
   
   ```bash
   ./upgrade.sh sepolia
   ```
   
   This will:
   - Deploy a new implementation contract
   - Call `upgradeToAndCall()` on the proxy
   - Attempt to verify the contract on BaseScan
   - Print the new implementation address

4. **Verify the Upgrade**
   
   Check that the proxy now points to the new implementation:
   
   ```bash
   # For Base Sepolia
   cast storage 0x8157B303a10609C50e332717D70E53B09ebdb045 \
     0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc \
     --rpc-url https://sepolia.base.org
   
   # For Base Mainnet
   cast storage 0x2213414893259b0C48066Acd1763e7fbA97859E5 \
     0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc \
     --rpc-url https://mainnet.base.org
   ```
   
   The returned address (after removing leading zeros) should match your new implementation.

5. **Test Contract Functions**
   
   Interact with the proxy using the new implementation to ensure everything works:
   
   ```bash
   # Check name
   cast call 0x8157B303a10609C50e332717D70E53B09ebdb045 "name()" --rpc-url https://sepolia.base.org
   
   # Check if upgrades are disabled
   cast call 0x8157B303a10609C50e332717D70E53B09ebdb045 "upgradesDisabled()" --rpc-url https://sepolia.base.org
   ```

6. **Deploy to Mainnet**
   
   Once satisfied with testnet results:
   
   ```bash
   ./upgrade.sh mainnet
   ```
   
   The script will prompt for confirmation before proceeding.

## Verification

### Automatic Verification with Latest Foundry

The upgrade script now uses **Foundry 1.4.4+** which supports Etherscan v2 API, enabling automatic verification on both explorers:

**Verification happens automatically in two steps:**

1. **Primary**: BaseScan verification (Etherscan v2 API) ✅
2. **Backup**: Blockscout verification (alternative) ✅

The contract is considered **successfully upgraded and verified** when verification succeeds on at least one explorer (preferably BaseScan).

### Viewing Verified Contracts

**BaseScan (Primary Explorer):**
- Base Sepolia: https://sepolia.basescan.org/address/YOUR_ADDRESS#code
- Base Mainnet: https://basescan.org/address/YOUR_ADDRESS#code

**Blockscout (Alternative Explorer):**
- Base Sepolia: https://base-sepolia.blockscout.com/address/YOUR_ADDRESS
- Base Mainnet: https://base.blockscout.com/address/YOUR_ADDRESS

Both explorers are valid and widely used.

### Manual Verification (If Needed)

If automatic verification fails for both explorers, verify manually:

#### Option 1: Using Forge with BaseScan (Recommended)

**Requires Foundry 1.4.4 or later:**

```bash
# Get the new implementation address from the upgrade logs or storage
IMPL_ADDRESS=0xNEW_IMPLEMENTATION_ADDRESS

# Verify on Base Sepolia
forge verify-contract $IMPL_ADDRESS src/VMF.sol:VMF \
  --chain base-sepolia \
  --etherscan-api-key $BASESCAN_API_KEY \
  --watch

# Verify on Base Mainnet
forge verify-contract $IMPL_ADDRESS src/VMF.sol:VMF \
  --chain base \
  --etherscan-api-key $BASESCAN_API_KEY \
  --watch
```

#### Option 2: Using Forge with Blockscout

```bash
# Get the new implementation address from the upgrade logs or storage
IMPL_ADDRESS=0xNEW_IMPLEMENTATION_ADDRESS

# Verify on Base Sepolia (Blockscout)
forge verify-contract $IMPL_ADDRESS src/VMF.sol:VMF \
  --verifier blockscout \
  --verifier-url https://base-sepolia.blockscout.com/api \
  --chain-id 84532

# Verify on Base Mainnet (Blockscout)
forge verify-contract $IMPL_ADDRESS src/VMF.sol:VMF \
  --verifier blockscout \
  --verifier-url https://base.blockscout.com/api \
  --chain-id 8453
```

#### Option 2: Using Forge with BaseScan

```bash
# Verify on Base Sepolia (may fail with v1 API deprecation)
forge verify-contract $IMPL_ADDRESS src/VMF.sol:VMF \
  --chain base-sepolia \
  --etherscan-api-key $BASESCAN_API_KEY

# Verify on Base Mainnet
forge verify-contract $IMPL_ADDRESS src/VMF.sol:VMF \
  --chain base \
  --etherscan-api-key $BASESCAN_API_KEY
```

#### Option 3: Using Blockscout Web Interface (Easiest)

1. Go to Blockscout:
   - Base Sepolia: https://base-sepolia.blockscout.com/
   - Base Mainnet: https://base.blockscout.com/
2. Search for your implementation address
3. Click "Verify & Publish"
4. Select "Via flattened source code" or "Via standard JSON input"
5. Upload your contract code
6. Set compiler version to `0.8.23`
7. Set optimization to `Yes` with `200` runs
8. Submit for verification

#### Option 4: Using BaseScan Web Interface

1. Go to BaseScan:
   - Base Sepolia: https://sepolia.basescan.org/verifyContract
   - Base Mainnet: https://basescan.org/verifyContract
2. Enter the new implementation address
3. Select "Solidity (Single file)" or "Solidity (Standard JSON Input)"
4. Upload the flattened contract or standard JSON
5. Set compiler version to `0.8.23`
6. Set optimization to `200` runs
7. Submit for verification

Note: BaseScan may show "deprecated v1 API" errors. Use Blockscout instead.

#### Option 5: Flatten and Verify

### Verifying the Upgrade

To confirm the proxy is using the new implementation:

```bash
# Read the implementation slot
cast storage <PROXY_ADDRESS> \
  0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc \
  --rpc-url <RPC_URL>
```

The storage slot `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc` is the EIP-1967 standard slot for implementation addresses.

## Troubleshooting

### Error: "vm.envUint: failed parsing $PRIVATE_KEY as type `uint256`: missing hex prefix"

**Solution:** Add `0x` prefix to your `PRIVATE_KEY` in `.env`:

```bash
# Wrong
PRIVATE_KEY=452f42a2d66ca34424c3da75d49267c43b39f9ed92c3aa091f8348e30360c1c2

# Correct
PRIVATE_KEY=0x452f42a2d66ca34424c3da75d49267c43b39f9ed92c3aa091f8348e30360c1c2
```

### Error: "VMF: upgrades disabled"

The contract owner has permanently disabled upgrades using the `disableUpgrades()` function. This is irreversible and no further upgrades are possible.

### Error: "caller is not authorized"

The wallet does not have permission to upgrade the contract. Ensure:
1. You're using the correct private key
2. The address is either the owner or has `ADMIN_ROLE`

Check roles:

```bash
# Check if address has ADMIN role (4)
cast call <PROXY_ADDRESS> "hasAllRoles(address,uint256)" <YOUR_ADDRESS> 4 --rpc-url <RPC_URL>
```

### Verification Fails with "deprecated V1 endpoint"

This is a known issue with BaseScan's API. The contract upgrade itself succeeds, but verification fails. Use manual verification methods instead.

### Compilation Errors about Missing Files

Clean the build cache:

```bash
forge clean
forge build
```

## Security Considerations

### Before Upgrading

1. **Test Thoroughly**: Always test on testnet first
2. **Storage Layout**: Ensure new implementation doesn't break storage layout
3. **Audit Changes**: Review all code changes carefully
4. **Backup Plan**: Prepare contingency plans if upgrade fails

### Storage Layout Rules

When upgrading, you MUST follow these rules to avoid storage corruption:

✅ **Safe:**
- Adding new state variables at the end
- Adding new functions
- Modifying function implementations
- Adding events

❌ **Dangerous:**
- Reordering existing state variables
- Changing state variable types
- Removing state variables
- Inserting variables before existing ones

### Disabling Upgrades

Once the contract is stable and battle-tested, you can permanently disable upgrades:

```bash
# This is IRREVERSIBLE - use with caution
cast send <PROXY_ADDRESS> "disableUpgrades()" \
  --private-key $PRIVATE_KEY \
  --rpc-url <RPC_URL>
```

This provides additional security by removing the upgrade capability entirely.

### Multi-Sig Recommendation

For production deployments, consider:
1. Using a multi-sig wallet as the owner
2. Requiring multiple signatures for upgrades
3. Implementing a timelock for upgrades
4. Having an upgrade governance process

## Additional Resources

- [UUPS Pattern Documentation](https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable)
- [EIP-1967: Proxy Storage Slots](https://eips.ethereum.org/EIPS/eip-1967)
- [Foundry Book](https://book.getfoundry.sh/)
- [BaseScan API Docs](https://docs.basescan.org/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review upgrade transaction logs
3. Test on sepolia first
4. Reach out to the development team
