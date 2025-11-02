#!/bin/bash
set -e

# Ensure we use the latest Foundry from ~/.foundry/bin
export PATH="$HOME/.foundry/bin:$PATH"

# =============================================================================
# VMF Contract Upgrade & Verification Script
# =============================================================================
# This script performs a complete upgrade workflow:
#   1. Deploys new implementation contract
#   2. Upgrades the UUPS proxy to point to new implementation
#   3. Verifies implementation on BaseScan (Etherscan v2 API)
#   4. Verifies implementation on Blockscout (alternative)
#   5. Checks proxy detection on both explorers
#   6. Provides complete verification status
# 
# USAGE:
#   ./upgrade.sh [NETWORK]
#
# NETWORK (optional):
#   - mainnet (default) - Upgrades on Base mainnet
#   - sepolia           - Upgrades on Base Sepolia testnet
#
# PREREQUISITES:
#   1. Foundry 1.4.4 or later (for Etherscan v2 API support)
#      Run: foundryup
#
#   2. .env file must contain:
#      - PRIVATE_KEY (with 0x prefix)
#      - PROXY_ADDRESS (the proxy contract to upgrade)
#      - BASE_RPC_URL (for mainnet)
#      - BASE_SEPOLIA_RPC_URL (for testnet)
#      - BASESCAN_API_KEY
#
#   3. The private key must correspond to the proxy owner or admin role
#   4. Sufficient ETH for gas fees
#
# EXAMPLES:
#   ./upgrade.sh                  # Upgrade on mainnet
#   ./upgrade.sh sepolia          # Upgrade on Base Sepolia
#   ./upgrade.sh mainnet          # Upgrade on mainnet (explicit)
#
# OUTPUT:
#   - Deployment transaction hashes
#   - New implementation address
#   - Verification status on both BaseScan and Blockscout
#   - Proxy detection status
#   - Links to view contracts on both explorers
#
# =============================================================================

# Load environment variables
if [ ! -f .env ]; then
    echo "ERROR: .env file not found"
    exit 1
fi

source .env

# Validate required environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "ERROR: PRIVATE_KEY is not set in .env file"
    exit 1
fi

if [ -z "$PROXY_ADDRESS" ]; then
    echo "ERROR: PROXY_ADDRESS is not set in .env file"
    exit 1
fi

if [ -z "$BASESCAN_API_KEY" ]; then
    echo "ERROR: BASESCAN_API_KEY is not set in .env file"
    exit 1
fi

# Determine network (default to mainnet)
NETWORK="${1:-mainnet}"

# Set network-specific variables
case "$NETWORK" in
    mainnet)
        RPC_URL="$BASE_RPC_URL"
        CHAIN_ID=8453
        EXPLORER_URL="https://basescan.org"
        BLOCKSCOUT_API_URL="https://base.blockscout.com/api"
        NETWORK_NAME="Base Mainnet"
        ;;
    sepolia)
        RPC_URL="$BASE_SEPOLIA_RPC_URL"
        CHAIN_ID=84532
        EXPLORER_URL="https://sepolia.basescan.org"
        BLOCKSCOUT_API_URL="https://base-sepolia.blockscout.com/api"
        NETWORK_NAME="Base Sepolia"
        ;;
    *)
        echo "ERROR: Invalid network '$NETWORK'. Use 'mainnet' or 'sepolia'"
        exit 1
        ;;
esac

# Validate RPC URL
if [ -z "$RPC_URL" ]; then
    echo "ERROR: RPC_URL not set for network '$NETWORK'"
    exit 1
fi

echo "==============================================="
echo "VMF Contract Upgrade Script"
echo "==============================================="
echo "Network:         $NETWORK_NAME"
echo "Chain ID:        $CHAIN_ID"
echo "Proxy Address:   $PROXY_ADDRESS"
echo "RPC URL:         $RPC_URL"
echo "==============================================="
echo ""

# Confirm before proceeding on mainnet
if [ "$NETWORK" = "mainnet" ]; then
    echo "⚠️  WARNING: You are about to upgrade on MAINNET!"
    read -p "Are you sure you want to continue? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "Upgrade cancelled."
        exit 0
    fi
    echo ""
fi

echo "Starting upgrade process..."
echo ""

# Run the upgrade script with automatic verification
# Using latest Foundry with Etherscan v2 API support
echo "Step 1: Deploying new implementation and upgrading proxy..."
set -x
forge script script/Upgrade.s.sol:UpgradeScript \
    --rpc-url "$RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --chain-id "$CHAIN_ID"
set +x

# Extract the new implementation address from the broadcast log
BROADCAST_DIR="broadcast/Upgrade.s.sol/$CHAIN_ID"
LATEST_RUN=$(ls -t "$BROADCAST_DIR"/run-*.json 2>/dev/null | head -1)

if [ -f "$LATEST_RUN" ]; then
    # Extract implementation address from the deployment transaction
    NEW_IMPL=$(jq -r '.transactions[] | select(.transactionType == "CREATE") | .contractAddress' "$LATEST_RUN" | head -1)
    
    if [ -n "$NEW_IMPL" ] && [ "$NEW_IMPL" != "null" ]; then
        echo ""
        echo "Step 2: Verifying implementation on BaseScan and Blockscout..."
        echo "New implementation address: $NEW_IMPL"
        echo ""
        
        BASESCAN_VERIFIED=false
        BLOCKSCOUT_VERIFIED=false
        
        # Verify on BaseScan (primary - Etherscan v2 API)
        echo "Verifying implementation on BaseScan..."
        forge verify-contract "$NEW_IMPL" src/VMF.sol:VMF \
            --chain-id "$CHAIN_ID" \
            --etherscan-api-key "$BASESCAN_API_KEY" \
            --watch 2>&1 | tee /tmp/basescan_verify.log
        
        if grep -q "Contract successfully verified" /tmp/basescan_verify.log || \
           grep -q "already verified" /tmp/basescan_verify.log; then
            echo "✅ Implementation verified on BaseScan!"
            BASESCAN_VERIFIED=true
        else
            echo "⚠️  BaseScan verification failed"
        fi
        
        echo ""
        
        # Verify on Blockscout (alternative)
        echo "Verifying implementation on Blockscout..."
        forge verify-contract "$NEW_IMPL" src/VMF.sol:VMF \
            --verifier blockscout \
            --verifier-url "$BLOCKSCOUT_API_URL" \
            --chain-id "$CHAIN_ID" 2>&1 | tee /tmp/blockscout_verify.log
        
        if grep -q "Contract successfully verified" /tmp/blockscout_verify.log || \
           grep -q "already verified" /tmp/blockscout_verify.log; then
            echo "✅ Implementation verified on Blockscout!"
            BLOCKSCOUT_VERIFIED=true
        else
            echo "ℹ️  Blockscout verification skipped or already verified"
        fi
        
        echo ""
        
        # Step 3: Verify proxy detection
        echo "Step 3: Checking proxy detection on explorers..."
        echo "------------------------------------------------"
        
        # Check if Blockscout detected the proxy
        sleep 3  # Give explorers time to index
        PROXY_INFO=$(curl -s "https://$([ "$NETWORK" = "mainnet" ] && echo "base" || echo "base-sepolia").blockscout.com/api/v2/addresses/$PROXY_ADDRESS" 2>/dev/null || echo "{}")
        HAS_IMPL=$(echo "$PROXY_INFO" | jq -r '.implementations[0].address_hash' 2>/dev/null || echo "null")
        
        if [ "$HAS_IMPL" != "null" ] && [ -n "$HAS_IMPL" ] && [ "$HAS_IMPL" != "" ]; then
            echo "✅ Blockscout detected proxy → implementation link"
            echo "   Proxy: $PROXY_ADDRESS"
            echo "   Implementation: $HAS_IMPL"
        else
            echo "ℹ️  Proxy detection pending (may take a few minutes)"
        fi
        
        echo ""
        
        # Check BaseScan proxy detection (via their frontend)
        echo "ℹ️  BaseScan proxy detection:"
        echo "   Check manually at: $EXPLORER_URL/address/$PROXY_ADDRESS#code"
        echo "   (BaseScan may take a few minutes to detect the proxy pattern)"
        
        echo ""
        echo "================================================"
        echo "VERIFICATION SUMMARY"
        echo "================================================"
        
        if [ "$BASESCAN_VERIFIED" = true ] && [ "$BLOCKSCOUT_VERIFIED" = true ]; then
            echo "✅ SUCCESS: Implementation verified on BOTH explorers!"
        elif [ "$BASESCAN_VERIFIED" = true ] || [ "$BLOCKSCOUT_VERIFIED" = true ]; then
            echo "✅ SUCCESS: Implementation verified on at least one explorer"
            [ "$BASESCAN_VERIFIED" = true ] && echo "   ✅ BaseScan: Verified"
            [ "$BLOCKSCOUT_VERIFIED" = true ] && echo "   ✅ Blockscout: Verified"
        else
            echo "⚠️  WARNING: Automatic verification failed"
            echo "   You can verify manually using:"
            echo "   ./verify-implementation.sh $NETWORK verify $NEW_IMPL"
        fi
        
        echo ""
        echo "Proxy verification:"
        echo "   Proxy contracts don't need separate verification"
        echo "   Explorers detect the proxy pattern and show the implementation ABI"
        
    else
        echo "⚠️  Could not extract implementation address from broadcast logs"
    fi
else
    echo "⚠️  Could not find broadcast logs at $BROADCAST_DIR"
fi

echo ""
echo "==============================================="
echo "UPGRADE COMPLETE"
echo "==============================================="
echo "Network:         $NETWORK_NAME"
echo "Proxy address:   $PROXY_ADDRESS"
echo ""
if [ -n "$NEW_IMPL" ] && [ "$NEW_IMPL" != "null" ]; then
    echo "New implementation: $NEW_IMPL"
    echo ""
    echo "═══════════════════════════════════════════"
    echo "VERIFICATION STATUS"
    echo "═══════════════════════════════════════════"
    echo ""
    echo "Implementation Contract:"
    [ "$BASESCAN_VERIFIED" = true ] && echo "  ✅ BaseScan:   Verified" || echo "  ⚠️  BaseScan:   Not verified"
    [ "$BLOCKSCOUT_VERIFIED" = true ] && echo "  ✅ Blockscout: Verified" || echo "  ⚠️  Blockscout: Not verified"
    echo ""
    echo "Proxy Contract:"
    echo "  ℹ️  Auto-detected by explorers (no separate verification needed)"
    echo ""
    echo "═══════════════════════════════════════════"
    echo "VIEW ON EXPLORERS"
    echo "═══════════════════════════════════════════"
    echo ""
    echo "Implementation:"
    echo "  BaseScan:   $EXPLORER_URL/address/$NEW_IMPL#code"
    echo "  Blockscout: https://$([ "$NETWORK" = "mainnet" ] && echo "base" || echo "base-sepolia").blockscout.com/address/$NEW_IMPL"
    echo ""
    echo "Proxy:"
    echo "  BaseScan:   $EXPLORER_URL/address/$PROXY_ADDRESS#code"
    echo "  Blockscout: https://$([ "$NETWORK" = "mainnet" ] && echo "base" || echo "base-sepolia").blockscout.com/address/$PROXY_ADDRESS"
    echo ""
    echo "═══════════════════════════════════════════"
    echo "VERIFICATION COMMANDS"
    echo "═══════════════════════════════════════════"
    echo ""
    echo "Verify implementation storage slot:"
    echo "  cast storage $PROXY_ADDRESS \\"
    echo "    0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc \\"
    echo "    --rpc-url $RPC_URL"
    echo ""
    echo "Manual verification (if needed):"
    echo "  ./verify-implementation.sh $NETWORK verify $NEW_IMPL"
else
    echo "Check the transaction logs above for the new implementation address."
    echo ""
    echo "To verify the new implementation address:"
    echo "  cast storage $PROXY_ADDRESS \\"
    echo "    0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc \\"
    echo "    --rpc-url $RPC_URL"
    echo ""
    echo "View proxy on explorers:"
    echo "  BaseScan:   $EXPLORER_URL/address/$PROXY_ADDRESS"
    echo "  Blockscout: https://$([ "$NETWORK" = "mainnet" ] && echo "base" || echo "base-sepolia").blockscout.com/address/$PROXY_ADDRESS"
fi
echo "==============================================="
