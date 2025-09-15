#!/bin/bash
set -euo pipefail

# Usage: PROXY_ADDRESS=0x... ./contracts/disable-upgrades.sh

if [[ -z "${PROXY_ADDRESS:-}" ]]; then
  echo "PROXY_ADDRESS env var is required" >&2
  exit 1
fi

source .env

echo "Disabling upgrades on proxy ${PROXY_ADDRESS}..."

forge script script/DisableUpgrades.s.sol:DisableUpgradesScript \
  --rpc-url "${BASE_RPC_URL}" \
  --private-key "${PRIVATE_KEY}" \
  --broadcast \
  --verify \
  --etherscan-api-key "${BASESCAN_API_KEY}" \
  -vvvv

echo "Done. Verify upgradesDisabled==true and owner is unchanged."
