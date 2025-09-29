# VMF Coin

*ERC-20 token with donation mechanics and tax features*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/vmf-coin/v0-show-code-in-ui)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/SbHYLh7hsIH)

## Overview

VMF is an ERC-20 token with built-in donation mechanics, optional transfer taxes, and role-based administration.

## Smart Contract Deployment

### Direct Deployment (Recommended)

For a clean, immutable deployment that passes honeypot scanners:

```bash
cd contracts
./deploy-direct.sh
```

This deploys the VMF contract without proxy functionality:
- ✅ No upgrade capability (immutable)
- ✅ Clean for honeypot scanners
- ✅ Direct ERC-20 deployment
- ✅ Role-based administration

### Token Migration

To migrate existing holders from an old contract to a new one:

1. **Deploy New Contract**: First deploy the new contract:
   ```bash
   cd contracts
   ./deploy-direct.sh
   ```

2. **Set Migration Variables**: Update the migration script with addresses:
   ```bash
   # Edit migrate-holders.sh
   export OLD_VMF_ADDRESS="0x2213414893259b0c48066acd1763e7fba97859e5"  # existing contract
   export NEW_VMF_ADDRESS="0x..."  # newly deployed contract
   ```

3. **Run Migration**: Copy all token balances to new contract:
   ```bash
   ./migrate-holders.sh
   ```

The migration process:
- Reads all known holder addresses from `holders.json`
- Checks balances in the old contract
- Mints equivalent tokens in the new contract
- Preserves all existing balances and ownership

### Legacy Proxy Deployment

For upgradeable contracts (may trigger honeypot flags):

```bash
cd contracts
./deploy.sh
```

This uses the UUPS proxy pattern with upgrade capabilities.

## Contract Features

- **ERC-20 Token**: Standard token with name "VMF" and symbol "VMF"
- **Donation Mechanics**: Accept USDC donations and mint VMF tokens
- **Optional Transfer Tax**: Configurable tax on transfers (disabled by default)
- **Role-based Access**: Admin roles for operational management
- **Price Oracle Integration**: Optional on-chain price oracle support

## Environment Setup

Create `.env` file in the `contracts/` directory:

```bash
PRIVATE_KEY=your_private_key
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

## Web App Deployment

Your project is live at:

**[https://vercel.com/vmf-coin/v0-show-code-in-ui](https://vercel.com/vmf-coin/v0-show-code-in-ui)**

To run locally:
```bash
npm run dev
```

## Agent Operations

For detailed operational procedures, see `contracts/AGENT_README.md`:
- Role management and admin operations
- Contract configuration and parameters
- Oracle integration
- Tax and donation pool management
