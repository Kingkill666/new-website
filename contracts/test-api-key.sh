#!/bin/bash

# Etherscan API Key Validation Script
# Tests if your API key works with the v2 multi-chain API

source .env

echo "=== Etherscan API Key Validation ==="
echo "Testing BASESCAN_API_KEY for v2 multi-chain API compatibility..."
echo ""

if [ -z "$BASESCAN_API_KEY" ]; then
    echo "❌ ERROR: BASESCAN_API_KEY is not set in .env file"
    echo ""
    echo "To fix this:"
    echo "1. Get an API key from: https://etherscan.io/apis"
    echo "2. Add to .env file: BASESCAN_API_KEY=your_key_here"
    exit 1
fi

echo "🔍 Testing API key: ${BASESCAN_API_KEY:0:8}...${BASESCAN_API_KEY: -4}"
echo ""

# Test Etherscan v2 multi-chain API
echo "Testing Etherscan v2 multi-chain API..."
V2_RESPONSE=$(curl -s "https://api.etherscan.io/v2/api?chainid=8453&module=account&action=balance&address=0x0000000000000000000000000000000000000000&tag=latest&apikey=$BASESCAN_API_KEY")

if echo "$V2_RESPONSE" | grep -q '"status":"1"'; then
    echo "✅ SUCCESS: Your API key works with Etherscan v2 multi-chain API"
    echo "   You can use this key for contract verification on Base"
elif echo "$V2_RESPONSE" | grep -q "Invalid API Key"; then
    echo "❌ ERROR: Invalid API key for Etherscan v2 API"
    echo ""
    echo "Your API key may be v1-only (deprecated). To fix:"
    echo "1. Go to https://etherscan.io/apis"
    echo "2. Generate a new API key (v2 multi-chain compatible)"
    echo "3. Update your .env file with the new key"
    exit 1
elif echo "$V2_RESPONSE" | grep -q "rate limit"; then
    echo "⚠️  WARNING: Rate limited, but API key appears valid"
    echo "   Try again in a few minutes"
else
    echo "⚠️  WARNING: Unexpected response from API"
    echo "   Response: $V2_RESPONSE"
    echo "   This might be a network issue. Try verification anyway."
fi

echo ""

# Test BaseScan API as alternative
echo "Testing BaseScan API (alternative method)..."
BASESCAN_RESPONSE=$(curl -s "https://api.basescan.org/api?module=account&action=balance&address=0x0000000000000000000000000000000000000000&tag=latest&apikey=$BASESCAN_API_KEY")

if echo "$BASESCAN_RESPONSE" | grep -q '"status":"1"'; then
    echo "✅ SUCCESS: Your API key also works with BaseScan API"
elif echo "$BASESCAN_RESPONSE" | grep -q "Invalid API Key"; then
    echo "❌ BaseScan API: Invalid key (Etherscan keys may not work here)"
    echo "   You can still use Etherscan v2 API for verification"
else
    echo "⚠️  BaseScan API: Unexpected response or network issue"
fi

echo ""
echo "=== Verification Commands ==="
echo ""
echo "✅ Use this command for contract verification:"
echo ""
echo "forge verify-contract \$CONTRACT_ADDRESS VMF \\"
echo "  --verifier etherscan \\"
echo "  --chain-id 8453 \\"
echo "  --verifier-url \"https://api.etherscan.io/api\" \\"
echo "  --etherscan-api-key \"\$BASESCAN_API_KEY\""
echo ""
echo "❌ DO NOT use deprecated v1 format:"
echo "forge verify-contract --chain base --etherscan-api-key \$KEY"
echo ""
echo "=== Key Information ==="
echo "• Etherscan v1 API was removed in late 2024"
echo "• All new API keys from etherscan.io support v2 multi-chain"  
echo "• Use --verifier-url to specify the correct endpoint"
echo "• BaseScan API may require separate key registration"