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

Notes:
- `PROXY_ADDRESS` in `.env` is only used by `upgrade.sh`.
- `deploy.sh` always deploys a fresh proxy and ignores `PROXY_ADDRESS`.

## Other scripts

Operational scripts like `add_charity.sh`, `grant_roles.sh`, and holder utilities remain unchanged. See inline comments in each script for usage.

For detailed guidance, start with `DEPLOY_README.md` and `UPGRADE_README.md`.
