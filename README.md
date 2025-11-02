# VMF Coin

*ERC-20 token with donation mechanics and role-based controls*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/vmf-coin/v0-show-code-in-ui)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/SbHYLh7hsIH)
[![E2E Tests](https://github.com/Kingkill666/new-website/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/Kingkill666/new-website/actions/workflows/e2e-tests.yml)
[![Lint](https://github.com/Kingkill666/new-website/actions/workflows/lint.yml/badge.svg)](https://github.com/Kingkill666/new-website/actions/workflows/lint.yml)

## Overview

VMF is an ERC-20 token with built-in donation mechanics and role-based administration.

## Smart Contract Deployment

Contracts and scripts live in the `contracts/` folder. Start with these docs:

- Fresh deployment (UUPS proxy + implementation): `contracts/DEPLOY_README.md`
- Upgrade existing proxy: `contracts/UPGRADE_README.md`

Quick commands:

```bash
# Fresh deploy to Base Sepolia
cd contracts
./deploy.sh sepolia

# Upgrade existing proxy on Base Sepolia
./upgrade.sh sepolia
```

## Contract Features

- **ERC-20 Token**: Standard token with name "VMF" and symbol "VMF"
- **Donation Mechanics**: Accept USDC donations and mint VMF tokens
- **Role-based Access**: Admin roles for operational management
- **Price Oracle Integration**: Optional on-chain price oracle support

## Environment Setup

Create `.env` file in the `contracts/` directory:

```bash
PRIVATE_KEY=your_private_key
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

## Wallet Integration

This project supports multiple wallet connection methods for optimal user experience:

### Coinbase Smart Wallet (Recommended)
- **No app installation required** - Works directly in mobile browsers
- **Passkey authentication** - Secure, biometric login
- **Cross-device synchronization** - Access wallet from any device
- **Gasless transactions** - Sponsored transactions where supported
- **Seamless UX** - Native browser experience without app switching

### Other Wallets
- MetaMask, Trust Wallet, Rainbow, and other WalletConnect-compatible wallets
- Automatic network switching to Base
- Mobile-optimized connection flows

### Technical Implementation
- Uses `@wagmi/connectors` with `coinbaseWallet` connector
- Configured with `preference: 'smartWalletOnly'` for embedded experience
- Integrated with Reown AppKit for unified wallet management

## Testing

This project includes comprehensive end-to-end tests using Playwright to ensure the buy modal and wallet functionality work correctly.

### Running Tests Locally

```bash
# Run all tests (requires dev server to be running)
npm run test

# Run end-to-end tests (starts dev server automatically)
npm run test:e2e

# Run tests with visual UI
npm run test:ui

# Run tests in browser (headed mode)
npm run test:headed
```

### CI/CD

Tests automatically run on GitHub Actions for:
- All pushes to `main` and `prod` branches
- All pull requests targeting these branches

Test results and failure artifacts are automatically uploaded for review.

For detailed testing documentation, see [`TESTING.md`](./TESTING.md).

## Agent Operations

For detailed operational procedures, see `contracts/AGENT_README.md`:
- Role management and admin operations
- Contract configuration and parameters
- Oracle integration
- Donation pool management
