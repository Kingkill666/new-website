# VMF Token Contract Deployment

This repository contains the VMF (Very Much Fun) token smart contract and deployment infrastructure for Base blockchain.

## Overview

VMF is a tax-enabled ERC20 token with donation mechanics and role-based access control. This version has been updated to use **direct deployment** instead of proxy patterns for cleaner deployments and better honeypot scanner compatibility.

### Key Features
- ERC20 token with tax mechanism
- Role-based permissions (Admin, Tax Setter, Charity Setter, Minter)
- Charity donation system
- Direct deployment (no proxies)
- Token holder migration from previous deployments

## Current Deployment

- **Current VMF (Proxy):** `0x2213414893259b0c48066acd1763e7fba97859e5`
- **Chain:** Base Mainnet (Chain ID: 8453)
- **Total Supply:** ~6.073e25 VMF
- **Owner Balance:** ~1.151e25 VMF

## Quick Start for Agents

### Environment Setup
```bash
# Required environment variables
export PRIVATE_KEY="your_private_key_here"
export BASE_RPC_URL="https://mainnet.base.org"
export BASESCAN_API_KEY="your_basescan_api_key"  # Optional but recommended

# Optional: Set old contract for migration
export OLD_VMF_ADDRESS="0x2213414893259b0c48066acd1763e7fba97859e5"
```

### Direct Deployment (New VMF)
```bash
# Deploy new VMF contract (without migration)
./deploy-direct.sh

# Deploy new VMF and migrate all holders
OLD_VMF_ADDRESS=0x2213414893259b0c48066acd1763e7fba97859e5 ./deploy-direct.sh
```

### Migration Only (Existing Contract)
```bash
# Migrate holders to existing new contract
export NEW_VMF_ADDRESS="your_new_contract_address"
./migrate-holders.sh
```

## Token Holder Discovery

**⚠️ IMPORTANT:** The biggest challenge with migration is ensuring ALL token holders are discovered and migrated.

### Current Holder Detection Methods

1. **Static List (`holders.json`):** Contains 51 known addresses including:
   - Original deployer and early holders
   - DEX routers (Uniswap V2/V3, 1inch)
   - Bridge contracts and DeFi protocols
   - **Known limitation:** May miss holders who acquired tokens through trades

2. **Recently Added:** `0xdf13d712d58EF7F7Abd4D29B398d503262ba4AC0` (~1.037e22 VMF)

### Comprehensive Holder Discovery

For complete holder discovery, use blockchain indexers:

#### Method 1: BaseScan API (Recommended)
```bash
# Set API key and run comprehensive scan
export BASESCAN_API_KEY="your_api_key"
./fetch-all-holders.sh
```

#### Method 2: Third-Party Indexers
- **Moralis:** Web3 API with token holders endpoint
- **Alchemy:** Token API with comprehensive holder data  
- **Covalent:** Token analytics and holder information
- **Dune Analytics:** Custom queries for holder discovery

#### Method 3: On-Chain Event Scanning
```bash
# Scan Transfer events (when RPC is stable)
cast logs --from-block 16000000 --to-block latest \
  --address 0x2213414893259b0c48066acd1763e7fba97859e5 \
  "Transfer(address indexed,address indexed,uint256)" \
  --rpc-url https://mainnet.base.org
```

### Migration Safety Best Practices

1. **Use Multiple Discovery Methods:** Combine static lists with API data
2. **Implement Claim Mechanism:** Allow missed holders to claim tokens post-migration
3. **Grace Period:** Announce migration with sufficient notice
4. **Validation:** Verify total supply matches between old and new contracts

## Script Reference

| Script | Purpose | Requirements |
|--------|---------|--------------|
| `deploy-direct.sh` | Deploy new VMF with optional migration | PRIVATE_KEY, BASE_RPC_URL |
| `migrate-holders.sh` | Migrate holders to existing contract | NEW_VMF_ADDRESS |
| `update-holders.sh` | Update holders.json with latest balances | BASE_RPC_URL |
| `fetch-all-holders.sh` | Comprehensive holder discovery | BASESCAN_API_KEY (optional) |
| `test-api-key.sh` | Validate Etherscan v2 API key compatibility | BASESCAN_API_KEY |

## Contract Architecture

### VMF.sol (Direct Deployment)
- **Inheritance:** ERC20, SafeTransferLib, OwnableRoles
- **Removed:** UUPSUpgradeable, proxy patterns
- **Constructor:** Direct initialization with all parameters
- **Roles:** Admin (8), Tax Setter (1), Charity Setter (2), Minter (4)

### Deployment Process
1. Deploy VMF contract with constructor parameters
2. Set initial roles (deployer gets all roles)
3. Optionally migrate token holders from old contract
4. Verify deployment on BaseScan

## Development

### Build and Test
```bash
forge build
forge test
```

### Local Development
```bash
# Start local node
anvil

# Deploy to local
./deploy-direct.sh
```

### Verification

**⚠️ CRITICAL: Etherscan v1 API Deprecated**
The old Etherscan v1 endpoint has been removed. You MUST use the v2 multi-chain API.

```bash
# ❌ DEPRECATED - This will fail:
# forge verify-contract --etherscan-api-key $API_KEY --chain base

# ✅ CORRECT - Use Etherscan v2 multi-chain API:
forge verify-contract <address> VMF \
  --verifier etherscan \
  --chain-id 8453 \
  --verifier-url "https://api.etherscan.io/api" \
  --etherscan-api-key "$BASESCAN_API_KEY" \
  --constructor-args $(cast abi-encode "constructor(address,address)" $USDC_ADDRESS $INITIAL_OWNER)

# Alternative: Use BaseScan directly (also works)
forge verify-contract <address> VMF \
  --verifier etherscan \
  --verifier-url "https://api.basescan.org/api" \
  --etherscan-api-key "$BASESCAN_API_KEY" \
  --constructor-args $(cast abi-encode "constructor(address,address)" $USDC_ADDRESS $INITIAL_OWNER)
```

## Troubleshooting

### Common Issues

1. **RPC Errors:** Base RPC can be unstable, use multiple endpoints
2. **Holder Discovery:** Static lists miss traders, use indexer APIs  
3. **Migration Failures:** Check gas limits and nonce management
4. **Verification Issues:** 
   - **CRITICAL:** Etherscan v1 API deprecated - use v2 multi-chain API
   - Ensure exact constructor parameters
   - Use `--verifier-url "https://api.etherscan.io/api"` for Etherscan v2
   - Alternative: Use BaseScan API directly with `--verifier-url "https://api.basescan.org/api"`
   - If you get "Invalid API Key" errors, your key may be v1-only (get new v2 key)

### Debugging Commands
```bash
# Check contract state
cast call $VMF_ADDRESS "totalSupply()" --rpc-url $BASE_RPC_URL
cast call $VMF_ADDRESS "owner()" --rpc-url $BASE_RPC_URL

# Check holder balance
cast call $VMF_ADDRESS "balanceOf(address)" $HOLDER_ADDRESS --rpc-url $BASE_RPC_URL

# Monitor transactions
cast tx $TX_HASH --rpc-url $BASE_RPC_URL
```

## Additional Features

### Charity Management
```bash
# Add new charity (requires ROLE_SET_CHARITY)
./add_charity.sh
```

### Tax Configuration  
```bash
# Update tax rates (requires ROLE_SET_TAX)
cast send $VMF_ADDRESS "setTaxRate(uint256)" $NEW_RATE \
  --private-key $PRIVATE_KEY \
  --rpc-url $BASE_RPC_URL
```

## Verification Guide

### Etherscan v1 API Deprecation Notice

**🚨 BREAKING CHANGE:** Etherscan removed their v1 API endpoint in late 2024. All verification must now use the v2 multi-chain API.

### Symptoms of Using Deprecated v1 Endpoint:
- `Invalid API Key provided` errors
- `Not Found` responses during verification
- Verification hanging indefinitely

### Solution: Use v2 Multi-Chain API

**Method 1: Etherscan v2 Multi-Chain (Recommended)**
```bash
forge verify-contract $CONTRACT_ADDRESS VMF \
  --verifier etherscan \
  --chain-id 8453 \
  --verifier-url "https://api.etherscan.io/api" \
  --etherscan-api-key "$BASESCAN_API_KEY"
```

**Method 2: BaseScan Direct (Alternative)**
```bash  
forge verify-contract $CONTRACT_ADDRESS VMF \
  --verifier etherscan \
  --verifier-url "https://api.basescan.org/api" \
  --etherscan-api-key "$BASESCAN_API_KEY"
```

### API Key Requirements:
- Must be generated from [etherscan.io/apis](https://etherscan.io/apis)
- v2 multi-chain API keys work for all EVM chains
- Old v1-only keys will not work

### Testing Your API Key:
```bash
# Test v2 API compatibility
curl -s "https://api.etherscan.io/v2/api?chainid=8453&module=account&action=balance&address=0x0000000000000000000000000000000000000000&tag=latest&apikey=$BASESCAN_API_KEY"
```

If you get `Invalid API Key` error, generate a new key from etherscan.io