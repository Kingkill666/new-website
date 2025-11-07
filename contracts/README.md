# VMF Contracts

This folder contains the VMF (Very Much Fun) token smart contract and deployment tooling for Base networks.

## What you likely want

- Fresh deployment (new proxy + implementation): see `DEPLOY_README.md`
  - Command: `./deploy.sh sepolia` or `./deploy.sh mainnet`
- Upgrade existing proxy: see `UPGRADE_README.md`
  - Command: `./upgrade.sh sepolia` or `./upgrade.sh mainnet`

Both scripts automatically verify the implementation on BaseScan (Etherscan v2) and attempt Blockscout as a fallback. They also print explorer links and cast commands to validate the ERC1967 implementation slot.

## Environment

Copy `.env.example` to `.env` and fill in values. At minimum you'll need:

```bash
PRIVATE_KEY=0x...
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=...
```

Optional helpers:

- `OLD_VMF_ADDRESS` – legacy proxy to compare balances when migrating
- `FACTORY_ADDRESS` – previously deployed `VMFCreate2Factory`

Notes:
- `PROXY_ADDRESS` in `.env` is only used by `upgrade.sh`.
- `deploy.sh` always deploys a fresh proxy and ignores `PROXY_ADDRESS`.

## Vanity Address Generation

Generate CREATE2 proxy addresses containing "1776" (e.g., `0x1776...` or `...1776`):

```bash
./generate_vanity_1776.sh mainnet start   # Address starting with 0x1776
./generate_vanity_1776.sh mainnet end     # Address ending with ...1776
```

For full documentation, see `VANITY_ADDRESS_GENERATION.md`.

## Other scripts

Operational scripts like `add_charity.sh`, `grant_roles.sh`, and holder utilities remain unchanged. See inline comments in each script for usage.

For detailed guidance, start with `DEPLOY_README.md` and `UPGRADE_README.md`.
For detailed guidance, start with `DEPLOY_README.md` and `UPGRADE_README.md`.
