#!/bin/bash

# Ensure we use the latest Foundry from ~/.foundry/bin
export PATH="$HOME/.foundry/bin:$PATH"

# =============================================================================
# VMF Contract Verification Helper
# =============================================================================
# This script helps verify the current implementation address and manually
# verify contracts on BaseScan.
#
# USAGE:
#   ./verify-implementation.sh [NETWORK] [ACTION]
#
# NETWORK: mainnet | sepolia
# ACTION: check | verify
#
# EXAMPLES:
#   ./verify-implementation.sh sepolia check    # Check current implementation
#   ./verify-implementation.sh sepolia verify 0xIMPL_ADDRESS  # Verify contract
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
ACTION="${2:-check}"

# Set network-specific variables
case "$NETWORK" in
    mainnet)
        RPC_URL="$BASE_RPC_URL"
        CHAIN_NAME="base"
        BLOCKSCOUT_API_URL="https://base.blockscout.com/api"
        EXPLORER_URL="https://basescan.org"
        NETWORK_NAME="Base Mainnet"
        ;;
    sepolia)
        RPC_URL="$BASE_SEPOLIA_RPC_URL"
        CHAIN_NAME="base-sepolia"
        BLOCKSCOUT_API_URL="https://base-sepolia.blockscout.com/api"
        EXPLORER_URL="https://sepolia.basescan.org"
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

# EIP-1967 implementation storage slot
IMPL_SLOT="0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"

echo "==============================================="
echo "VMF Contract Verification Helper"
echo "==============================================="
echo "Network:      $NETWORK_NAME"
echo "Proxy:        $PROXY_ADDRESS"
echo "==============================================="
echo ""

case "$ACTION" in
    check)
        echo "Checking current implementation address..."
        echo ""
        
        # Get implementation address from storage
        IMPL_STORAGE=$(cast storage "$PROXY_ADDRESS" "$IMPL_SLOT" --rpc-url "$RPC_URL")
        IMPL_ADDRESS="0x${IMPL_STORAGE:26}"  # Remove leading zeros
        
        echo "✅ Current Implementation: $IMPL_ADDRESS"
        echo ""
        
        # Check if implementation has code
        CODE=$(cast code "$IMPL_ADDRESS" --rpc-url "$RPC_URL")
        if [ "$CODE" = "0x" ]; then
            echo "❌ WARNING: Implementation address has no code!"
        else
            CODE_SIZE=${#CODE}
            echo "✅ Implementation has bytecode (size: $CODE_SIZE bytes)"
        fi
        
        echo ""
        echo "View on explorer: $EXPLORER_URL/address/$IMPL_ADDRESS"
        echo ""
        
        # Check if verified
        echo "To verify this implementation, run:"
        echo "  ./verify-implementation.sh $NETWORK verify $IMPL_ADDRESS"
        ;;
        
    verify)
        IMPL_ADDRESS="${3}"
        
        if [ -z "$IMPL_ADDRESS" ]; then
            echo "ERROR: Implementation address required"
            echo "Usage: $0 $NETWORK verify <IMPLEMENTATION_ADDRESS>"
            exit 1
        fi
        
        if [ -z "$BASESCAN_API_KEY" ]; then
            echo "ERROR: BASESCAN_API_KEY not set in .env"
            exit 1
        fi
        
        echo "Verifying implementation: $IMPL_ADDRESS"
        echo "Chain: $CHAIN_NAME"
        echo ""
        
        # Try verification with latest Foundry (supports Etherscan v2 API)
        echo "Attempting verification with BaseScan (Etherscan v2 API)..."
        forge verify-contract "$IMPL_ADDRESS" src/VMF.sol:VMF \
            --chain "$CHAIN_NAME" \
            --etherscan-api-key "$BASESCAN_API_KEY" \
            --watch && {
                echo ""
                echo "✅ Contract verified successfully on BaseScan!"
                echo "View at: $EXPLORER_URL/address/$IMPL_ADDRESS#code"
                exit 0
            } || {
                echo ""
                echo "⚠️  BaseScan verification failed. Trying Blockscout..."
                
                forge verify-contract "$IMPL_ADDRESS" src/VMF.sol:VMF \
                    --verifier blockscout \
                    --verifier-url "$BLOCKSCOUT_API_URL" \
                    --chain-id "$([ "$NETWORK" = "mainnet" ] && echo 8453 || echo 84532)" \
                    --watch && {
                        echo ""
                        echo "✅ Contract verified successfully on Blockscout!"
                        echo "View at: https://$([ "$NETWORK" = "mainnet" ] && echo "base" || echo "base-sepolia").blockscout.com/address/$IMPL_ADDRESS"
                        exit 0
                    } || {
                        echo ""
                        echo "⚠️  Automatic verification failed on both explorers."
                        echo ""
                        echo "Manual verification options:"
                        echo ""
                        echo "1. Use BaseScan web interface:"
                        echo "   $EXPLORER_URL/verifyContract"
                        echo ""
                        echo "2. Use Blockscout web interface:"
                        echo "   https://$([ "$NETWORK" = "mainnet" ] && echo "base" || echo "base-sepolia").blockscout.com/address/$IMPL_ADDRESS?tab=contract_code"
                        echo ""
                        echo "3. Flatten and verify:"
                        echo "   forge flatten src/VMF.sol > VMF_flattened.sol"
                        echo ""
                        echo "4. Compiler settings:"
                        echo "   - Compiler: 0.8.23"
                        echo "   - Optimization: Yes, 200 runs"
                        echo "   - EVM Version: default"
                        echo ""
                        exit 1
                    }
            }
        ;;
        
    *)
        echo "ERROR: Invalid action '$ACTION'. Use 'check' or 'verify'"
        exit 1
        ;;
esac

echo "==============================================="
