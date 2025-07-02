# VMF Coin Deployment Guide

## Overview

The VMF Coin contract is now upgradeable using Solady's UUPS (Universal Upgradeable Proxy Standard) pattern. This allows you to upgrade the contract logic while preserving the state and address.

## Available Deployment Scripts

### 1. Smart Deployment (Recommended)
```bash
./deploy.sh
```
**What it does:**
- Checks if a proxy already exists (using `PROXY_ADDRESS` environment variable)
- If proxy exists and is functional, shows current status
- If no proxy exists, deploys a new one
- Reuses existing implementation if `IMPLEMENTATION_ADDRESS` is set
- Deploys new implementation if needed
- Provides clear feedback on what was deployed

### 2. Upgrade Existing Proxy
```bash
./upgrade.sh
```
**What it does:**
- Requires `PROXY_ADDRESS` to be set
- Deploys a new implementation
- Upgrades the existing proxy to use the new implementation

## Environment Variables

### Required for all deployments:
```bash
# In your .env file
PRIVATE_KEY="your_private_key"
BASE_RPC_URL="https://mainnet.base.org"  # or your preferred RPC
BASESCAN_API_KEY="your_basescan_api_key"
```

### Set in deployment scripts:
```bash
USDC_ADDRESS="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"  # Base mainnet USDC
CHARITY_RECEIVER="0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d"
TEAM_RECEIVER="0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d"
```

### Optional (for advanced usage):
```bash
export PROXY_ADDRESS="0x..."           # Address of existing proxy
export IMPLEMENTATION_ADDRESS="0x..."  # Address of existing implementation
```

## Deployment Workflows

### First-time Deployment
1. Set up your `.env` file with required variables
2. Run `./deploy.sh`
3. Save the proxy address from the output
4. The proxy address is your main contract address that users interact with

### Upgrading an Existing Contract
1. Set the proxy address: `export PROXY_ADDRESS="0x..."`
2. Run `./upgrade.sh`
3. The proxy address stays the same, but now uses new implementation logic

### Deploying to Different Networks
1. Update `USDC_ADDRESS` in the deployment script for your target network:
   - **Base mainnet**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
   - **L1 Sepolia**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
   - **Base Sepolia**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
2. Update `BASE_RPC_URL` in your `.env` file
3. Run your chosen deployment script

## Key Features

### Upgradeable Architecture
- **Proxy Pattern**: Users interact with a proxy that delegates to an implementation
- **State Preservation**: All state remains in the proxy during upgrades
- **Access Control**: Only the owner can authorize upgrades

### Security Features
- **Owner-only upgrades**: Only the contract owner can upgrade
- **Initialization protection**: Contract can only be initialized once
- **Implementation validation**: Ensures new implementations are compatible

### Gas Optimization
- **Solady libraries**: Uses gas-optimized Solady contracts
- **Minimal proxy overhead**: ERC1967 standard proxy pattern

## Contract Addresses Structure

After deployment, you'll have:
1. **Implementation Contract**: Contains the actual contract logic (can be upgraded)
2. **Proxy Contract**: The main contract address users interact with (never changes)

Always use the **proxy address** as your main contract address in your frontend and integrations.

## Troubleshooting

### Common Issues:
1. **"Implementation address has no code"**: The provided implementation address is invalid
2. **"Proxy address has no code"**: The provided proxy address is invalid
3. **"Already initialized"**: Trying to initialize an already initialized contract

### Recovery:
- If deployment fails, check your environment variables
- If you lose track of addresses, check the transaction logs on Basescan
- You can always deploy a fresh proxy if needed

## Example Usage

```bash
# First deployment
./deploy.sh
# Output: Proxy deployed at: 0xABC123...

# Later upgrade
export PROXY_ADDRESS="0xABC123..."
./upgrade.sh
# Contract logic updated, same address
```
