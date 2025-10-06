#!/bin/bash
set -ex

# Set environment variables for the deployment script
export USDC_ADDRESS="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"  # base mainnet
# export USDC_ADDRESS="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"  # L1 sepolia
# export USDC_ADDRESS="0x036CbD53842c5426634e7929541eC2318f3dCF7e"  # base sepolia

export CHARITY_RECEIVER="0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d"
export TEAM_RECEIVER="0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d"

# Optional: Set this if you want to reuse an existing implementation
# export IMPLEMENTATION_ADDRESS="0x..."

source .env

echo "Deploying new proxy..."
echo "This will create a new proxy contract."
echo "Set IMPLEMENTATION_ADDRESS to reuse an existing implementation."
echo ""

# Deploy proxy using the proxy deployment script
forge script script/DeployProxy.s.sol:DeployProxyScript \
    --rpc-url "$BASE_RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --verify \
    --etherscan-api-key "$BASESCAN_API_KEY"
