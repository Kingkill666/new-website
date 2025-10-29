#!/bin/bash
set -ex

# Set environment variables for the deployment script
export USDC_ADDRESS="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"  # base mainnet
# export USDC_ADDRESS="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"  # L1 sepolia
# export USDC_ADDRESS="0x036CbD53842c5426634e7929541eC2318f3dCF7e"  # base sepolia

# COMPROMISED WALLET REMOVED - UPDATE WITH NEW ADDRESSES
export CHARITY_RECEIVER="0x0000000000000000000000000000000000000000"  # REPLACE WITH NEW CHARITY ADDRESS
export TEAM_RECEIVER="0x0000000000000000000000000000000000000000"      # REPLACE WITH NEW TEAM ADDRESS

# Optional: Set this to migrate from existing VMF contract
export OLD_VMF_ADDRESS="0x2213414893259b0c48066acd1763e7fba97859e5"

source .env

echo "=== VMF Coin Direct Deployment ==="
echo "This script deploys VMF directly without a proxy:"
echo "• No upgrade functionality"
echo "• Immutable contract" 
echo "• Clean deployment for honeypot scanners"

if [ -n "$OLD_VMF_ADDRESS" ]; then
    echo "• Will migrate existing holders from: $OLD_VMF_ADDRESS"
else
    echo "• Fresh deployment (no migration)"
fi
echo ""

# Use direct deployment 
forge script script/DirectDeploy.s.sol:DirectDeployScript \
    --rpc-url "$BASE_RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --verify \
    --etherscan-api-key "$BASESCAN_API_KEY"

echo ""
echo "=== Direct Deployment Complete ==="
echo "• VMF contract deployed directly (no proxy)"
echo "• No upgrade functionality - immutable contract"
echo "• Should pass honeypot scanners automatically"

if [ -n "$OLD_VMF_ADDRESS" ]; then
    echo "• Existing token holders have been migrated"
    echo "• Users now have balances in the new contract"
fi