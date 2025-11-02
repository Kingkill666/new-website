#!/bin/bash
set -ex

# Set environment variables for the deployment script
export USDC_ADDRESS="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"  # base mainnet
# export USDC_ADDRESS="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"  # L1 sepolia
# export USDC_ADDRESS="0x036CbD53842c5426634e7929541eC2318f3dCF7e"  # base sepolia

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/vmf-addresses.sh"
# export IMPLEMENTATION_ADDRESS="0x..."  # If implementation already exists

source .env

echo "Starting smart deployment..."
echo "This script will:"
echo "1. Check if a proxy already exists (if PROXY_ADDRESS is set)"
echo "2. If no proxy exists, deploy a new one"
echo "3. Reuse existing implementation if available (if IMPLEMENTATION_ADDRESS is set)"
echo "4. Deploy new implementation if needed"
echo ""

# Deploy using smart deployment script
forge script script/SmartDeploy.s.sol:SmartDeployScript \
    --rpc-url "$BASE_RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --verify \
    --etherscan-api-key "$BASESCAN_API_KEY"
