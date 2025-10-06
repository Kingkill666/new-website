#!/bin/bash
set -ex

# Set the proxy address that you want to upgrade
# You'll need to set this after initial deployment
export PROXY_ADDRESS="0x2213414893259b0C48066Acd1763e7fbA97859E5"

source .env

echo "=== Contract Upgrade Script ==="
echo "This script upgrades the VMF contract and verifies the new implementation using Etherscan v2 API"
echo ""

# Validate API key
echo "Validating Etherscan v2 API key..."
if [ -z "$BASESCAN_API_KEY" ]; then
    echo "ERROR: BASESCAN_API_KEY is not set in .env file"
    exit 1
fi

echo "Upgrading VMF contract with built-in verification..."
# Upgrade the VMF contract with built-in v2 API verification
forge script script/Upgrade.s.sol:UpgradeScript \
    --rpc-url "$BASE_RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --verify \
    --chain-id 8453 \
    --etherscan-api-key "$BASESCAN_API_KEY"

echo ""
echo "=== Upgrade and Verification Complete ==="
echo "Proxy address: $PROXY_ADDRESS"
echo ""
echo "Check the transaction logs above for the new implementation address."
echo "You can view the verified contracts at: https://basescan.org/"
