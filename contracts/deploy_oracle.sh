#!/bin/bash
set -ex

# Load environment variables
source .env

# Contract addresses
VMF_ADDRESS="0x2213414893259b0C48066Acd1763e7fbA97859E5"  # VMF token address
USDC_ADDRESS="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"  # USDC token address
SUSHISWAP_POOL="0x9C83A203133B65982F35D1B00E8283C9fb518cb1"  # SushiSwap VMF/USDC pool

echo "=== Deploying UniswapV4PriceOracle ==="
echo "VMF Address: $VMF_ADDRESS"
echo "USDC Address: $USDC_ADDRESS"
echo "SushiSwap Pool: $SUSHISWAP_POOL"
echo ""

# Deploy the price oracle
ORACLE_DEPLOY_OUTPUT=$(forge create --broadcast --rpc-url "$BASE_RPC_URL" --private-key "$PRIVATE_KEY" src/UniswapV4PriceOracle.sol:UniswapV4PriceOracle --constructor-args "$SUSHISWAP_POOL" "$VMF_ADDRESS" "$USDC_ADDRESS")
ORACLE_ADDRESS=$(echo "$ORACLE_DEPLOY_OUTPUT" | grep -oE 'Deployed to: (0x[a-fA-F0-9]{40})' | awk '{print $3}')

echo "Oracle deployed at: $ORACLE_ADDRESS"

# Set the oracle in the VMF contract
echo "Setting oracle in VMF contract..."
cast send "$VMF_ADDRESS" "setPriceOracle(address)" "$ORACLE_ADDRESS" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL"

echo ""
echo "=== Oracle Setup Complete ==="
echo "Oracle Address: $ORACLE_ADDRESS"
echo "VMF Contract: $VMF_ADDRESS"
echo "SushiSwap Pool: $SUSHISWAP_POOL"
echo ""
echo "Save these addresses:"
echo "export ORACLE_ADDRESS=$ORACLE_ADDRESS"
echo "export SUSHISWAP_POOL=$SUSHISWAP_POOL"
