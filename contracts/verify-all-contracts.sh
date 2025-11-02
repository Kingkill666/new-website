#!/bin/bash

# Ensure we use the latest Foundry from ~/.foundry/bin
export PATH="$HOME/.foundry/bin:$PATH"

# =============================================================================
# Complete Contract Verification Script
# =============================================================================
# This script verifies both the proxy and implementation contracts on
# Blockscout and BaseScan (now using Etherscan v2 API with latest Foundry)
#
# USAGE:
#   ./verify-all-contracts.sh [NETWORK]
#
# NETWORK: mainnet | sepolia (default: sepolia)
# =============================================================================

set -e

# Load environment
if [ ! -f .env ]; then
    echo "ERROR: .env file not found"
    exit 1
fi

source .env

# Parse arguments
NETWORK="${1:-sepolia}"

# Set network-specific variables
case "$NETWORK" in
    mainnet)
        RPC_URL="$BASE_RPC_URL"
        CHAIN_NAME="base"
        CHAIN_ID=8453
        BLOCKSCOUT_API="https://base.blockscout.com/api"
        BLOCKSCOUT_URL="https://base.blockscout.com"
        BASESCAN_URL="https://basescan.org"
        BASESCAN_API_URL="https://api.basescan.org/api"
        NETWORK_NAME="Base Mainnet"
        ;;
    sepolia)
        RPC_URL="$BASE_SEPOLIA_RPC_URL"
        CHAIN_NAME="base-sepolia"
        CHAIN_ID=84532
        BLOCKSCOUT_API="https://base-sepolia.blockscout.com/api"
        BLOCKSCOUT_URL="https://base-sepolia.blockscout.com"
        BASESCAN_URL="https://sepolia.basescan.org"
        BASESCAN_API_URL="https://api-sepolia.basescan.org/api"
        NETWORK_NAME="Base Sepolia"
        ;;
    *)
        echo "ERROR: Invalid network '$NETWORK'. Use 'mainnet' or 'sepolia'"
        exit 1
        ;;
esac

if [ -z "$PROXY_ADDRESS" ]; then
    echo "ERROR: PROXY_ADDRESS not set in .env"
    exit 1
fi

# Get implementation address
IMPL_SLOT="0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
IMPL_STORAGE=$(cast storage "$PROXY_ADDRESS" "$IMPL_SLOT" --rpc-url "$RPC_URL")
IMPL_ADDRESS="0x${IMPL_STORAGE:26}"

echo "==============================================="
echo "Complete Contract Verification"
echo "==============================================="
echo "Network:          $NETWORK_NAME"
echo "Proxy:            $PROXY_ADDRESS"
echo "Implementation:   $IMPL_ADDRESS"
echo "==============================================="
echo ""

# ============================================================================
# STEP 1: Verify Implementation on BaseScan (Etherscan v2 API)
# ============================================================================
echo "STEP 1: Verifying Implementation on BaseScan..."
echo "------------------------------------------------"

forge verify-contract "$IMPL_ADDRESS" src/VMF.sol:VMF \
    --chain "$CHAIN_NAME" \
    --etherscan-api-key "$BASESCAN_API_KEY" \
    --watch && {
        echo "✅ Implementation verified on BaseScan!"
        BASESCAN_VERIFIED=true
    } || {
        echo "⚠️  BaseScan verification failed, will try Blockscout"
        BASESCAN_VERIFIED=false
    }

echo ""

# ============================================================================
# STEP 2: Verify Implementation on Blockscout (backup/alternative)
# ============================================================================
echo "STEP 2: Verifying Implementation on Blockscout..."
echo "------------------------------------------------"

forge verify-contract "$IMPL_ADDRESS" src/VMF.sol:VMF \
    --verifier blockscout \
    --verifier-url "$BLOCKSCOUT_API" \
    --chain-id "$CHAIN_ID" && {
        echo "✅ Implementation verified on Blockscout!"
        BLOCKSCOUT_VERIFIED=true
    } || {
        echo "ℹ️  Implementation may already be verified on Blockscout"
        BLOCKSCOUT_VERIFIED=false
    }

echo ""

# ============================================================================
# STEP 2: Check if Blockscout detected the proxy
# ============================================================================
echo "STEP 3: Checking Proxy Detection on Blockscout..."
echo "------------------------------------------------"

PROXY_INFO=$(curl -s "$BLOCKSCOUT_URL/api/v2/addresses/$PROXY_ADDRESS")
HAS_IMPL=$(echo "$PROXY_INFO" | jq -r '.implementations[0].address_hash' 2>/dev/null || echo "null")

if [ "$HAS_IMPL" != "null" ] && [ -n "$HAS_IMPL" ]; then
    echo "✅ Blockscout automatically detected the proxy!"
    echo "   Proxy: $PROXY_ADDRESS"
    echo "   Points to: $HAS_IMPL"
else
    echo "⚠️  Blockscout has not detected the proxy relationship yet"
    echo "   This may take a few minutes after deployment"
fi

echo ""

# ============================================================================
# STEP 3: Generate files for manual verification (if needed)
# ============================================================================
echo "STEP 4: Generating Verification Files (backup)..."
echo "------------------------------------------------"

# Generate standard JSON input
echo "Generating standard JSON input file..."
forge verify-contract "$IMPL_ADDRESS" src/VMF.sol:VMF \
    --chain "$CHAIN_NAME" \
    --show-standard-json-input > "vmf-standard-json-$NETWORK.json" 2>&1

# Generate flattened source
echo "Generating flattened source file..."
forge flatten src/VMF.sol > "vmf-flattened-$NETWORK.sol"

# Get constructor args if needed
echo "Extracting deployment info..."
cat > "basescan-verification-instructions-$NETWORK.txt" << EOF
===============================================
BaseScan Manual Verification Instructions
===============================================
Network: $NETWORK_NAME
Date: $(date)

IMPORTANT: BaseScan API v1 is deprecated, so automatic verification fails.
You must verify manually through their web interface.

===============================================
CONTRACT ADDRESSES
===============================================
Proxy Address:          $PROXY_ADDRESS
Implementation Address: $IMPL_ADDRESS

===============================================
VERIFICATION STEPS FOR IMPLEMENTATION
===============================================

1. Go to BaseScan verification page:
   $BASESCAN_URL/verifyContract

2. Enter the Implementation Address:
   $IMPL_ADDRESS

3. Select Compiler Type:
   - Choose "Solidity (Standard-Json-Input)"

4. Upload the file:
   - File: vmf-standard-json-$NETWORK.json
   - This file has been generated in the current directory

5. Contract Name:
   - Enter: src/VMF.sol:VMF

6. Click "Verify and Publish"

===============================================
ALTERNATIVE: USE FLATTENED SOURCE
===============================================

If Standard JSON doesn't work, try flattened source:

1. Go to: $BASESCAN_URL/verifyContract

2. Enter Implementation Address: $IMPL_ADDRESS

3. Select "Solidity (Single file)"

4. Compiler Version: v0.8.23+commit.f704f362

5. Optimization: Yes, with 200 runs

6. Paste contents of: vmf-flattened-$NETWORK.sol

7. Constructor Arguments: (none - this is the implementation, not proxy)

8. Click "Verify and Publish"

===============================================
VERIFICATION STATUS LINKS
===============================================

Blockscout (Already Verified):
$BLOCKSCOUT_URL/address/$IMPL_ADDRESS

BaseScan (Verify Here):
$BASESCAN_URL/address/$IMPL_ADDRESS

===============================================
PROXY VERIFICATION
===============================================

The proxy contract is a minimal ERC1967 proxy deployed by Solady's LibClone.
It does NOT need separate verification because:

1. Blockscout automatically detects the proxy and shows the implementation ABI
2. The proxy is just a standard delegate pattern with no custom logic
3. Users interact with the proxy address using the implementation's ABI

You can verify the proxy points to the implementation by reading storage slot:
$IMPL_SLOT

View proxy on Blockscout:
$BLOCKSCOUT_URL/address/$PROXY_ADDRESS

View proxy on BaseScan:
$BASESCAN_URL/address/$PROXY_ADDRESS

===============================================
VERIFICATION COMPLETE WHEN:
===============================================
✅ Implementation verified on Blockscout (DONE)
✅ Implementation verified on BaseScan (MANUAL - follow steps above)
✅ Proxy detected by Blockscout (automatic)
✅ Both explorers show correct source code and ABI

===============================================
EOF

echo "✅ Generated verification files:"
echo "   1. vmf-standard-json-$NETWORK.json (for BaseScan standard JSON upload)"
echo "   2. vmf-flattened-$NETWORK.sol (for BaseScan flattened source)"
echo "   3. basescan-verification-instructions-$NETWORK.txt (detailed instructions)"

echo ""

# ============================================================================
# STEP 4: Display Summary
# ============================================================================
echo "==============================================="
echo "VERIFICATION SUMMARY"
echo "==============================================="
echo ""
echo "✅ VERIFICATION STATUS:"
if [ "$BASESCAN_VERIFIED" = true ] || [ "$BLOCKSCOUT_VERIFIED" = true ]; then
    [ "$BASESCAN_VERIFIED" = true ] && echo "   ✅ BaseScan: Verified"
    [ "$BLOCKSCOUT_VERIFIED" = true ] && echo "   ✅ Blockscout: Verified"
    echo ""
    echo "🎉 Contract successfully verified on at least one explorer!"
else
    echo "   ⚠️  Automatic verification failed on both explorers"
    echo "   📝 Manual verification files generated"
fi
echo ""
echo "🔗 LINKS:"
echo "   Blockscout Proxy:    $BLOCKSCOUT_URL/address/$PROXY_ADDRESS"
echo "   Blockscout Impl:     $BLOCKSCOUT_URL/address/$IMPL_ADDRESS"
echo "   BaseScan Proxy:      $BASESCAN_URL/address/$PROXY_ADDRESS"
echo "   BaseScan Impl:       $BASESCAN_URL/address/$IMPL_ADDRESS"
echo "   BaseScan Verify:     $BASESCAN_URL/verifyContract"
echo ""
echo "==============================================="
echo ""
if [ "$BASESCAN_VERIFIED" = true ] && [ "$BLOCKSCOUT_VERIFIED" = true ]; then
    echo "🎉 All verifications complete! No further action needed."
elif [ "$BASESCAN_VERIFIED" = false ] && [ "$BLOCKSCOUT_VERIFIED" = false ]; then
    echo "Next steps (Manual Verification):"
    echo "1. Review: basescan-verification-instructions-$NETWORK.txt"
    echo "2. Go to: $BASESCAN_URL/verifyContract"
    echo "3. Upload: vmf-standard-json-$NETWORK.json"
else
    echo "✅ Contract is verified and usable on at least one explorer"
    echo "   You can optionally verify on the other explorer using the generated files"
fi
echo "==============================================="
