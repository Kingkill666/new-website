#!/bin/bash
set -ex

# Contract verification script
# This verifies already deployed contracts without redeploying them

source .env

# Set the addresses of contracts you want to verify
export PROXY_ADDRESS="0x2213414893259b0C48066Acd1763e7fbA97859E5"

# You'll need to set the implementation address after upgrade
# Check the upgrade transaction or logs to get this address
export IMPLEMENTATION_ADDRESS=0x6D4C02b6D00A4f7dfad6F554eD59e8CB976FB069

echo "=== Contract Verification Script ==="
echo "This script verifies already deployed contracts on Base"
echo ""

# Try multiple API validation methods
echo "Validating API key for multi-chain verification..."
if [ -z "$BASESCAN_API_KEY" ]; then
    echo "ERROR: BASESCAN_API_KEY is not set in .env file"
    exit 1
fi

# Test with Etherscan v2 multi-chain API first
echo "Testing Etherscan v2 multi-chain API..."
API_TEST_V2=$(curl -s "https://api.etherscan.io/v2/api?chainid=8453&module=account&action=balance&address=0x0000000000000000000000000000000000000000&tag=latest&apikey=$BASESCAN_API_KEY")
if echo "$API_TEST_V2" | grep -q '"status":"1"'; then
    echo "✓ Etherscan v2 multi-chain API key is valid"
    USE_V2_API=true
elif echo "$API_TEST_V2" | grep -q "Invalid API Key"; then
    echo "⚠ Etherscan v2 API key invalid, trying Basescan direct API..."
    USE_V2_API=false
    
    # Fallback to Basescan direct API
    API_TEST=$(curl -s "https://api.basescan.org/api?module=account&action=balance&address=0x0000000000000000000000000000000000000000&tag=latest&apikey=$BASESCAN_API_KEY")
    if echo "$API_TEST" | grep -q "Invalid API Key"; then
        echo "ERROR: API key invalid for both Etherscan v2 and Basescan direct APIs"
        echo "Please get a valid API key from:"
        echo "- Etherscan (multi-chain): https://etherscan.io/apis"
        echo "- Basescan (Base only): https://basescan.org/myapikey"
        exit 1
    elif echo "$API_TEST" | grep -q "result"; then
        echo "✓ Basescan direct API key is valid"
        USE_V2_API=false
    fi
else
    echo "WARNING: Could not validate API key (network issue?)"
    echo "Proceeding with v2 API..."
    USE_V2_API=true
fi
echo ""

if [ -z "$IMPLEMENTATION_ADDRESS" ]; then
    echo "Getting implementation address from proxy..."
    IMPLEMENTATION_ADDRESS=$(cast call $PROXY_ADDRESS "implementation()" --rpc-url "$BASE_RPC_URL" | cast parse-bytes32-string)
    echo "Found implementation at: $IMPLEMENTATION_ADDRESS"
fi

echo "Verifying VMF implementation contract..."
echo "Implementation address: $IMPLEMENTATION_ADDRESS"
echo ""

# Use the appropriate verification method based on API validation

if [ "$USE_V2_API" = true ]; then
    echo "Using Etherscan v2 multi-chain API for verification..."
    # Use Etherscan v2 multi-chain API with proper chain ID
    forge verify-contract \
        $IMPLEMENTATION_ADDRESS \
        src/VMF.sol:VMF \
        --verifier etherscan \
        --chain-id 8453 \
        --verifier-url "https://api.etherscan.io/api" \
        --etherscan-api-key "$BASESCAN_API_KEY" \
        --watch
else
    echo "Using Basescan direct API for verification..."
    # Use Basescan direct API with basescan.org endpoint
    forge verify-contract \
        $IMPLEMENTATION_ADDRESS \
        src/VMF.sol:VMF \
        --verifier etherscan \
        --chain-id 8453 \
        --verifier-url "https://api.basescan.org/api" \
        --etherscan-api-key "$BASESCAN_API_KEY" \
        --watch
fi

echo ""
echo "=== Verification Complete ==="
echo "Implementation verified at: $IMPLEMENTATION_ADDRESS"
echo "Proxy address: $PROXY_ADDRESS"
echo ""
echo "You can view the verified contract at:"
echo "https://basescan.org/address/$IMPLEMENTATION_ADDRESS"
echo "https://basescan.org/address/$PROXY_ADDRESS"
