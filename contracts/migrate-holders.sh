#!/bin/bash
set -ex

# Migration script for token holders
export OLD_VMF_ADDRESS="0x2213414893259b0c48066acd1763e7fba97859e5"  # The existing proxy address
export NEW_VMF_ADDRESS=""  # Set this after deploying the new contract

if [ -z "$NEW_VMF_ADDRESS" ]; then
    echo "Error: NEW_VMF_ADDRESS must be set"
    echo "Deploy the new contract first using ./deploy-direct.sh"
    exit 1
fi

source .env

echo "=== VMF Token Migration ==="
echo "Old contract: $OLD_VMF_ADDRESS"
echo "New contract: $NEW_VMF_ADDRESS"
echo ""
echo "This will copy all token balances from the old contract to the new contract"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

forge script script/MigrateHolders.s.sol:MigrateHoldersScript \
    --rpc-url "$BASE_RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    -vv

echo ""
echo "=== Migration Complete ==="
echo "All token holders have been migrated to the new contract"