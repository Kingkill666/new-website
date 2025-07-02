#!/bin/bash
set -ex

# Set the proxy address that you want to upgrade
# You'll need to set this after initial deployment
export PROXY_ADDRESS="YOUR_PROXY_ADDRESS_HERE"

source .env

# Upgrade the VMF contract to a new implementation
forge script script/Upgrade.s.sol:UpgradeScript \
    --rpc-url "$BASE_RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --verify \
    --etherscan-api-key "$BASESCAN_API_KEY"
