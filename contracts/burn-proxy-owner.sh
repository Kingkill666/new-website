#!/bin/bash
set -euo pipefail

# Usage: PROXY_ADDRESS=0x... ./contracts/burn-proxy-owner.sh

if [[ -z "${PROXY_ADDRESS:-}" ]]; then
  echo "PROXY_ADDRESS env var is required" >&2
  exit 1
fi

source .env

echo "Renouncing ownership on proxy ${PROXY_ADDRESS}..."

forge script script/BurnProxyOwner.s.sol:BurnProxyOwnerScript \
  --rpc-url "${BASE_RPC_URL}" \
  --private-key "${PRIVATE_KEY}" \
  --broadcast \
  --verify \
  --etherscan-api-key "${BASESCAN_API_KEY}" \
  -vvvv

echo "Done. Verify owner is address(0) on Basescan."
