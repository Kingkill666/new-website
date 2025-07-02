#!/bin/bash
set -ex

source .env

echo "Deploying implementation only..."
echo "This will deploy just the implementation contract."
echo "Use this when you want to deploy a new implementation for upgrading."
echo ""

# Deploy implementation only
forge script script/DeployImplementation.s.sol:DeployImplementationScript \
    --rpc-url "$BASE_RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --verify \
    --etherscan-api-key "$BASESCAN_API_KEY"
