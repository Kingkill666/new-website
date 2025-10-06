#!/bin/bash
set -ex

# Set environment variables for the deployment script
export USDC_ADDRESS="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"  # base mainnet
# export USDC_ADDRESS="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"  # L1 sepolia
# export USDC_ADDRESS="0x036CbD53842c5426634e7929541eC2318f3dCF7e"  # base sepolia

export CHARITY_RECEIVER="0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d"
export TEAM_RECEIVER="0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d"

# Optional: Uncomment and set these if you want to reuse existing contracts
export PROXY_ADDRESS="0x2213414893259b0c48066acd1763e7fba97859e5"
#export IMPLEMENTATION_ADDRESS="0x..."  # If implementation already exists

source .env

echo "=== VMF Coin Smart Deployment ==="
echo "This script intelligently handles deployment:"
echo "• Checks if proxy already exists"
echo "• Reuses existing implementation if available"
echo "• Only deploys what's needed"
echo ""

# Use smart deployment by default
forge script script/SmartDeploy.s.sol:SmartDeployScript \
    --rpc-url "$BASE_RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --verify \
    --etherscan-api-key "$BASESCAN_API_KEY"

echo ""
echo "=== Available Scripts ==="
echo "• ./deploy.sh              - Smart deployment (recommended)"
echo "• ./upgrade.sh             - Upgrade existing proxy"
