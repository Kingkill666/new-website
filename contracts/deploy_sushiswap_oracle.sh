#!/bin/bash
set -ex

# Load environment variables
source .env

# Contract addresses
VMF_ADDRESS="0x2213414893259b0C48066Acd1763e7fbA97859E5"  # VMF token address
USDC_ADDRESS="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"  # USDC token address
SUSHISWAP_V3_POOL="0x9C83A203133B65982F35D1B00E8283C9fb518cb1"  # SushiSwap V3 VMF/USDC pool

echo "=== Deploying SushiSwap V3 Price Oracle ==="
echo "VMF Address: $VMF_ADDRESS"
echo "USDC Address: $USDC_ADDRESS"
echo "SushiSwap V3 Pool: $SUSHISWAP_V3_POOL"
echo ""

# Deploy the SushiSwap V3 price oracle
ORACLE_DEPLOY_OUTPUT=$(forge create --broadcast --rpc-url "$BASE_RPC_URL" --private-key "$PRIVATE_KEY" src/SushiSwapV3PriceOracle.sol:SushiSwapV3PriceOracle --constructor-args "$SUSHISWAP_V3_POOL" "$VMF_ADDRESS" "$USDC_ADDRESS")
ORACLE_ADDRESS=$(echo "$ORACLE_DEPLOY_OUTPUT" | grep -oE 'Deployed to: (0x[a-fA-F0-9]{40})' | awk '{print $3}')

echo "SushiSwap V3 Oracle deployed at: $ORACLE_ADDRESS"

# Set the oracle in the VMF contract
echo "Setting SushiSwap V3 oracle in VMF contract..."
cast send "$VMF_ADDRESS" "setPriceOracle(address)" "$ORACLE_ADDRESS" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL"

echo ""
echo "=== SushiSwap V3 Oracle Setup Complete ==="
echo "Oracle Address: $ORACLE_ADDRESS"
echo "VMF Contract: $VMF_ADDRESS"
echo "SushiSwap V3 Pool: $SUSHISWAP_V3_POOL"
echo ""
echo "Save these addresses:"
echo "export SUSHISWAP_V3_ORACLE_ADDRESS=$ORACLE_ADDRESS"
echo "export SUSHISWAP_V3_POOL=$SUSHISWAP_V3_POOL"
