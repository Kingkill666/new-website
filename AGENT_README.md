# Agent Runbook

## Overview

Goal: Avoid proxy honeypot flags while preserving operational control.

Paths:
- Preferred: Disable upgrades (keep owner). Then delegate daily ops to `ADMIN_ROLE`.
- Alternative: Burn owner on proxy (fully renounce). Not recommended if you need owner actions.

TL;DR (copy-paste)
```bash
# 0) Set env
export PROXY_ADDRESS=0x2213414893259b0c48066acd1763e7fba97859e5
export ADMIN_ADDRESS=0xYourAdminAddress
source .env  # must provide BASE_RPC_URL, PRIVATE_KEY, BASESCAN_API_KEY

# 1) If needed, upgrade proxy to latest implementation
forge script contracts/script/Upgrade.s.sol:UpgradeScript \
  --rpc-url "$BASE_RPC_URL" --private-key "$PRIVATE_KEY" --broadcast -vvvv

# 2) Permanently disable upgrades but keep ownership (preferred)
./contracts/disable-upgrades.sh

# 3) Grant admin role for day-to-day ops
forge script contracts/script/AdminRoles.s.sol:GrantAdminRole \
  --rpc-url "$BASE_RPC_URL" --private-key "$PRIVATE_KEY" --broadcast -vvvv

# 4) Verify
cast call --rpc-url "$BASE_RPC_URL" $PROXY_ADDRESS 'upgradesDisabled()(bool)'
cast call --rpc-url "$BASE_RPC_URL" $PROXY_ADDRESS 'owner()(address)'
cast call --rpc-url "$BASE_RPC_URL" $PROXY_ADDRESS 'rolesOf(address)(uint256)' $ADMIN_ADDRESS
```

Before you start
- Network: Base mainnet (env: `BASE_RPC_URL`, `PRIVATE_KEY`, `BASESCAN_API_KEY`).
- Set `PROXY_ADDRESS` to the live VMF proxy.
- If the proxy was deployed earlier, upgrade first to an implementation that includes:
  - `upgradesDisabled()`, `disableUpgrades()`
  - `ADMIN_ROLE()` and expanded role gates

Check if upgrade is needed
```bash
# If this fails (method not found), you must upgrade first
cast call --rpc-url "$BASE_RPC_URL" $PROXY_ADDRESS 'upgradesDisabled()(bool)' || echo "Needs upgrade"
```

Upgrade to latest VMF (if needed)
```bash
# Option A: existing helper script
export PROXY_ADDRESS=0x... # your proxy
./contracts/upgrade.sh

# Option B: direct Forge script
forge script contracts/script/Upgrade.s.sol:UpgradeScript \
  --rpc-url "$BASE_RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  --verify \
  --verifier etherscan \
  --chain-id 8453 \
  --verifier-url "https://api.etherscan.io/api" \
  --etherscan-api-key "$BASESCAN_API_KEY" \
  -vvvv

# ⚠️ IMPORTANT: If verification fails with "Invalid API Key" or "Not Found"
# The old Etherscan v1 endpoint has been REMOVED. Use the commands above with 
# --verifier-url "https://api.etherscan.io/api" for v2 multi-chain API

# Verify post-upgrade
cast call --rpc-url "$BASE_RPC_URL" $PROXY_ADDRESS 'owner()(address)'
cast call --rpc-url "$BASE_RPC_URL" $PROXY_ADDRESS 'name()(string)'
```

Base mainnet example
```bash
# Known VMF proxy (Base):
export PROXY_ADDRESS=0x2213414893259b0c48066acd1763e7fba97859e5

# Check current owner and upgrade fuse
cast call --rpc-url "$BASE_RPC_URL" $PROXY_ADDRESS 'owner()(address)'
cast call --rpc-url "$BASE_RPC_URL" $PROXY_ADDRESS 'upgradesDisabled()(bool)'

# Check price oracle and price (if set)
cast call --rpc-url "$BASE_RPC_URL" $PROXY_ADDRESS 'priceOracle()(address)'
ORACLE=$(cast call --rpc-url "$BASE_RPC_URL" $PROXY_ADDRESS 'priceOracle()(address)')
cast call --rpc-url "$BASE_RPC_URL" $ORACLE 'spotPriceUSDCPerVMF()(uint256)'
```

## Disable Upgrades (Keep Owner) — Preferred

Purpose: Permanently disable upgrades via one-way fuse while keeping contract ownership for operations. This avoids proxy honeypot flags without losing admin features like roles or tax toggles.

Prerequisites
- Base RPC and keys in `.env`: `BASE_RPC_URL`, `PRIVATE_KEY`, `BASESCAN_API_KEY`.
- Proxy address of the deployed VMF contract.

Quick Run
```bash
# Set the proxy address (example: VMF on Base mainnet)
export PROXY_ADDRESS=0x2213414893259b0c48066acd1763e7fba97859e5

# Ensure .env contains BASE_RPC_URL, PRIVATE_KEY, BASESCAN_API_KEY
./contracts/disable-upgrades.sh
```

Direct Forge Command
```bash
export PROXY_ADDRESS=0x2213414893259b0c48066acd1763e7fba97859e5
forge script contracts/script/DisableUpgrades.s.sol:DisableUpgradesScript \
  --rpc-url "$BASE_RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  --verify \
  --etherscan-api-key "$BASESCAN_API_KEY" \
  -vvvv
```

Verification
```bash
cast call --rpc-url "$BASE_RPC_URL" $PROXY_ADDRESS 'upgradesDisabled()(bool)'
cast call --rpc-url "$BASE_RPC_URL" $PROXY_ADDRESS 'owner()(address)'
```

Important Notes
- Irreversible: Once disabled, upgrades are blocked forever.
- Ownership is retained for operational controls (roles, tax, minter, etc.).
- VMF enforces this in `_authorizeUpgrade` with `require(!upgradesDisabled)`.

## Admin Role (Owner Replacement for Ops)

Purpose: Delegate day-to-day owner operations to a role while keeping upgrades owner-only. Admin can change tax settings, price oracle, team/charity addresses, allowed receivers, tax-exempts, donation pool/multiple, etc.

Grant Admin
```bash
export PROXY_ADDRESS=0x2213414893259b0c48066acd1763e7fba97859e5
export ADMIN_ADDRESS=0xYourAdminAddress
forge script contracts/script/AdminRoles.s.sol:GrantAdminRole \
  --rpc-url "$BASE_RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  -vvvv
```

Revoke Admin
```bash
export PROXY_ADDRESS=0x2213414893259b0c48066acd1763e7fba97859e5
export ADMIN_ADDRESS=0xYourAdminAddress
forge script contracts/script/AdminRoles.s.sol:RevokeAdminRole \
  --rpc-url "$BASE_RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  -vvvv
```

Notes
- Admin can now grant/revoke roles in VMF (owner or `ADMIN_ROLE`).
- Admin cannot upgrade or disable/enable the upgrade fuse — those remain owner-only.
- You can combine `ROLE_ADMIN` with other roles as needed (e.g., `ROLE_SET_TAX`).

Alternative using cast (no script)
```bash
# Get the admin role bitmask from the contract
ADMIN_ROLE=$(cast call --rpc-url "$BASE_RPC_URL" $PROXY_ADDRESS 'ADMIN_ROLE()(uint256)')

# Grant admin
cast send --rpc-url "$BASE_RPC_URL" --private-key "$PRIVATE_KEY" \
  $PROXY_ADDRESS 'grantRoles(address,uint256)' $ADMIN_ADDRESS $ADMIN_ROLE -vvvv

# Verify roles bitmask (non-zero indicates some role(s) set)
cast call --rpc-url "$BASE_RPC_URL" $PROXY_ADDRESS 'rolesOf(address)(uint256)' $ADMIN_ADDRESS

# As admin, grant another role (example: ROLE_SET_TAX)
ROLE_SET_TAX=$(cast call --rpc-url "$BASE_RPC_URL" $PROXY_ADDRESS 'rolesOf(address)(uint256)' 0x0000000000000000000000000000000000000000 >/dev/null 2>&1; echo $((1<<0)))
cast send --rpc-url "$BASE_RPC_URL" --private-key "$PRIVATE_KEY" \
  $PROXY_ADDRESS 'grantRoles(address,uint256)' 0xAnotherAddress $ROLE_SET_TAX -vvvv
```

Function reference for ops (admin-capable)
- setPriceOracle(address): `cast send $PROXY 'setPriceOracle(address)' 0xOracle`
- setTaxEnabled(bool): `cast send $PROXY 'setTaxEnabled(bool)' true`
- setTeamAddress(address): `cast send $PROXY 'setTeamAddress(address)' 0xTeam`
- setCharityPoolAddress(address): `cast send $PROXY 'setCharityPoolAddress(address)' 0xCharity`
- addAllowedReceivers(address): `cast send $PROXY 'addAllowedReceivers(address)' 0xCharity`
- removeAllowedReceivers(address): `cast send $PROXY 'removeAllowedReceivers(address)' 0xCharity`
- addAllowedTaxExempt(address): `cast send $PROXY 'addAllowedTaxExempt(address)' 0xUser`
- removeAllowedTaxExempt(address): `cast send $PROXY 'removeAllowedTaxExempt(address)' 0xUser`
- updateDonationPool(uint256): `cast send $PROXY 'updateDonationPool(uint256)' 1000000000000000000000000`
- updateDonationMultipleBps(uint256): `cast send $PROXY 'updateDonationMultipleBps(uint256)' 10000`

Owner-only (not admin)
- disableUpgrades(): `cast send $PROXY 'disableUpgrades()'`
- Upgrades via UpgradeScript (UUPS): `forge script ...:UpgradeScript --broadcast`

## Burn Proxy Owner (UUPS) — Alternative

Purpose: Permanently renounce ownership on the VMF UUPS proxy, which disables upgrades and removes ownership. Use only if you intend to give up all owner actions.

Quick Run
```bash
export PROXY_ADDRESS=0x2213414893259b0c48066acd1763e7fba97859e5
./contracts/burn-proxy-owner.sh
```

Direct Forge Command
```bash
export PROXY_ADDRESS=0x2213414893259b0c48066acd1763e7fba97859e5
forge script contracts/script/BurnProxyOwner.s.sol:BurnProxyOwnerScript \
  --rpc-url "$BASE_RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  --verify \
  --etherscan-api-key "$BASESCAN_API_KEY" \
  -vvvv
```

Important Notes
- Irreversible: Upgrades disabled and ownership removed.
- Ensure no further upgrades or admin actions are needed before renouncing.
- Run from the current owner’s key; otherwise the transaction will revert.
