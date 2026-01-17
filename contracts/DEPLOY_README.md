# VMF Fresh Deployment Guide

This guide covers deploying a brand new VMF UUPS proxy + implementation on Base networks, and verifying sources on both BaseScan and Blockscout.

## Prerequisites

- Foundry 1.4.4+ (for Etherscan v2 verification)
- .env in `contracts/` with:
  - PRIVATE_KEY (0x-prefixed)
  - BASE_RPC_URL (Base mainnet)
  - BASE_SEPOLIA_RPC_URL (Base Sepolia)
  - BASESCAN_API_KEY
- Some ETH on the target network for the deployer wallet
  - Base Sepolia faucet: https://www.alchemy.com/faucets/base-sepolia

Optional overrides:
- USDC_ADDRESS (defaults are prefilled per network in the script)

## One-command fresh deploy

Deploy to Base Sepolia:

```
./deploy.sh sepolia
```

Deploy to Base mainnet (will ask for confirmation):

```
./deploy.sh mainnet
```

What it does:
- Deploys a new VMF implementation
- Deploys a new ERC1967 proxy pointing at the implementation
- Ensures the proxy is initialized (owner/minter/usdc/cap)
- Mints initial 10M VMF to the proxy treasury
- Verifies the implementation on BaseScan (v2) and Blockscout
- Checks proxy detection on explorers
- Prints a complete summary with links

## Outputs

At the end, you’ll see:

- Implementation address and links
- Proxy address and links
- Verification status on both explorers
- Cast command to read the ERC1967 implementation slot

Example validation command:

```
cast storage <PROXY_ADDRESS> \
  0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc \
  --rpc-url <RPC_URL>
```

## Notes

- The script warns if the deployer wallet has low balance to avoid failed broadcasts.
- For upgrades of an existing proxy, use `./upgrade.sh sepolia`.
- Proxy contracts don’t require separate source verification—explorers detect the proxy pattern and show the implementation ABI.
