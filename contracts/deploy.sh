#!/bin/bash
set -e

# Ensure we use the latest Foundry from ~/.foundry/bin
export PATH="$HOME/.foundry/bin:$PATH"

# =============================================================================
# VMF Fresh Deploy & Verification Script
# =============================================================================
# This script deploys a brand new ERC1967 proxy + VMF implementation and
# verifies the implementation on BaseScan (Etherscan v2) and Blockscout.
# It also checks that explorers detect the proxy pattern and prints links.
#
# USAGE:
#   ./deploy.sh [NETWORK]
#
# NETWORK (optional):
#   - mainnet (default) - Deploy on Base mainnet
#   - sepolia           - Deploy on Base Sepolia testnet
#
# PREREQUISITES:
#   1. Foundry 1.4.4 or later (for Etherscan v2 API support)
#      Run: foundryup
#   2. .env must contain: PRIVATE_KEY, BASE_RPC_URL, BASE_SEPOLIA_RPC_URL, BASESCAN_API_KEY
#   3. Sufficient ETH for gas on the target network
#
# NOTES:
#   - This script always deploys FRESH even if PROXY_ADDRESS is set in .env.
#   - USDC address is selected per-network below; override by exporting USDC_ADDRESS.
# =============================================================================

if [ ! -f .env ]; then
    echo "ERROR: .env file not found in $(pwd)" >&2
    exit 1
fi

source .env

if [ -z "$PRIVATE_KEY" ]; then
    echo "ERROR: PRIVATE_KEY is not set in .env" >&2
    exit 1
fi

if [ -z "$BASESCAN_API_KEY" ]; then
    echo "ERROR: BASESCAN_API_KEY is not set in .env" >&2
    exit 1
fi

NETWORK="${1:-mainnet}"

case "$NETWORK" in
    mainnet)
        RPC_URL="$BASE_RPC_URL"
        CHAIN_ID=8453
        EXPLORER_URL="https://basescan.org"
        BLOCKSCOUT_API_URL="https://base.blockscout.com/api"
        NETWORK_NAME="Base Mainnet"
        DEFAULT_USDC="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
        ;;
    sepolia)
        RPC_URL="$BASE_SEPOLIA_RPC_URL"
        CHAIN_ID=84532
        EXPLORER_URL="https://sepolia.basescan.org"
        BLOCKSCOUT_API_URL="https://base-sepolia.blockscout.com/api"
        NETWORK_NAME="Base Sepolia"
        DEFAULT_USDC="0x036CbD53842c5426634e7929541eC2318f3dCF7e" # Base Sepolia USDC
        ;;
    *)
        echo "ERROR: Invalid network '$NETWORK'. Use 'mainnet' or 'sepolia'" >&2
        exit 1
        ;;
esac

if [ -z "$RPC_URL" ]; then
    echo "ERROR: RPC_URL not configured for network '$NETWORK'" >&2
    exit 1
fi

# Choose USDC address: env override or sensible default per network
USDC_ADDRESS="${USDC_ADDRESS:-$DEFAULT_USDC}"

echo "==============================================="
echo "VMF Fresh Deploy Script"
echo "==============================================="
echo "Network:         $NETWORK_NAME"
echo "Chain ID:        $CHAIN_ID"
echo "RPC URL:         $RPC_URL"
echo "USDC Address:    $USDC_ADDRESS"
echo "==============================================="
echo ""

# Optional: Pre-flight balance check to avoid failed broadcasts
if command -v cast >/dev/null 2>&1; then
    DEPLOYER=$(cast wallet address --private-key "$PRIVATE_KEY" 2>/dev/null || true)
    if [ -n "$DEPLOYER" ]; then
        BAL_WEI=$(cast balance "$DEPLOYER" --rpc-url "$RPC_URL" 2>/dev/null || echo 0)
        # Require at least ~0.00001 ETH on testnet/mainnet to be safe
        MIN_WEI=10000000000000 # 0.00001 ETH
        if [ "$BAL_WEI" -lt "$MIN_WEI" ]; then
            echo "⚠️  Deployer has low balance on $NETWORK_NAME: $BAL_WEI wei ($DEPLOYER)"
            echo "   Please fund this address and re-run to broadcast successfully."
            echo "   Faucet (Base Sepolia): https://www.alchemy.com/faucets/base-sepolia"
            echo ""
        fi
    fi
fi

# Confirm before deploying on mainnet
if [ "$NETWORK" = "mainnet" ]; then
    echo "⚠️  WARNING: You are about to DEPLOY on MAINNET!"
    read -p "Are you sure you want to continue? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "Deployment cancelled."
        exit 0
    fi
    echo ""
fi

echo "Starting fresh deployment..."
echo "(Forcing fresh: ignoring any PROXY_ADDRESS / IMPLEMENTATION_ADDRESS in .env)"
echo ""

# Run the SmartDeploy script but force a fresh deployment by unsetting these
# and providing USDC via env.
export USDC_ADDRESS
set -x
PROXY_ADDRESS=0x0000000000000000000000000000000000000000 IMPLEMENTATION_ADDRESS=0x0000000000000000000000000000000000000000 \
    forge script script/SmartDeploy.s.sol:SmartDeployScript \
        --rpc-url "$RPC_URL" \
        --private-key "$PRIVATE_KEY" \
        --broadcast \
        --chain-id "$CHAIN_ID" \
        --verify \
        --etherscan-api-key "$BASESCAN_API_KEY" 2>&1 | tee /tmp/vmf_deploy.log
set +x

# Try to extract addresses from script output first (most reliable for proxy)
IMPLEMENTATION_ADDRESS=$(grep -Eo "New implementation deployed at: (0x[a-fA-F0-9]{40})" /tmp/vmf_deploy.log | awk '{print $5}' | tail -1)
PROXY_ADDRESS=$(grep -Eo "Proxy deployed at: (0x[a-fA-F0-9]{40})" /tmp/vmf_deploy.log | awk '{print $4}' | tail -1)

# Fallback: read implementation from broadcast JSON
if [ -z "$IMPLEMENTATION_ADDRESS" ]; then
    BROADCAST_DIR="broadcast/SmartDeploy.s.sol/$CHAIN_ID"
    LATEST_RUN=$(ls -t "$BROADCAST_DIR"/run-*.json 2>/dev/null | head -1)
    if [ -f "$LATEST_RUN" ]; then
        IMPLEMENTATION_ADDRESS=$(jq -r '.transactions[] | select(.transactionType == "CREATE") | .contractAddress' "$LATEST_RUN" | head -1)
    fi
fi

echo ""
echo "Deployment addresses:"
echo "  Implementation: ${IMPLEMENTATION_ADDRESS:-<unknown>}"
echo "  Proxy:          ${PROXY_ADDRESS:-<unknown>}"
echo ""

if [ -z "$IMPLEMENTATION_ADDRESS" ] || [ -z "$PROXY_ADDRESS" ]; then
    echo "⚠️  Could not extract all addresses. Check /tmp/vmf_deploy.log for details." >&2
fi

# Verify implementation on BaseScan and Blockscout
BASESCAN_VERIFIED=false
BLOCKSCOUT_VERIFIED=false

if [ -n "$IMPLEMENTATION_ADDRESS" ]; then
    echo "Step 2: Verifying implementation on explorers..."
    echo "Verifying on BaseScan..."
    forge verify-contract "$IMPLEMENTATION_ADDRESS" src/VMF.sol:VMF \
        --chain-id "$CHAIN_ID" \
        --etherscan-api-key "$BASESCAN_API_KEY" \
        --watch 2>&1 | tee /tmp/basescan_verify.log
    if grep -q "Contract successfully verified" /tmp/basescan_verify.log || \
         grep -q "already verified" /tmp/basescan_verify.log; then
        BASESCAN_VERIFIED=true
    fi

    echo "Verifying on Blockscout..."
    forge verify-contract "$IMPLEMENTATION_ADDRESS" src/VMF.sol:VMF \
        --verifier blockscout \
        --verifier-url "$BLOCKSCOUT_API_URL" \
        --chain-id "$CHAIN_ID" 2>&1 | tee /tmp/blockscout_verify.log
    if grep -q "Contract successfully verified" /tmp/blockscout_verify.log || \
         grep -q "already verified" /tmp/blockscout_verify.log; then
        BLOCKSCOUT_VERIFIED=true
    fi
else
    echo "Skipping verification: implementation address unknown."
fi

echo ""
echo "Step 3: Checking proxy detection on explorers..."
if [ -n "$PROXY_ADDRESS" ]; then
    sleep 3
    PROXY_INFO=$(curl -s "${BLOCKSCOUT_API_URL/v2\/addresses/api}v2/addresses/$PROXY_ADDRESS" 2>/dev/null || echo "{}")
    HAS_IMPL=$(echo "$PROXY_INFO" | jq -r '.implementations[0].address_hash' 2>/dev/null || echo "null")
    if [ "$HAS_IMPL" != "null" ] && [ -n "$HAS_IMPL" ]; then
        echo "✅ Blockscout detected proxy → implementation"
        echo "   Proxy: $PROXY_ADDRESS"
        echo "   Impl:  $HAS_IMPL"
    else
        echo "ℹ️  Blockscout proxy detection pending (may take a few minutes)"
    fi
    echo "ℹ️  BaseScan proxy view: $EXPLORER_URL/address/$PROXY_ADDRESS#code"
fi

echo ""
echo "================================================"
echo "DEPLOYMENT SUMMARY"
echo "================================================"
echo "Network:            $NETWORK_NAME"
echo "Implementation:     ${IMPLEMENTATION_ADDRESS:-<unknown>}"
echo "Proxy:              ${PROXY_ADDRESS:-<unknown>}"
echo ""
echo "Verification:"
echo "  BaseScan:   $([ "$BASESCAN_VERIFIED" = true ] && echo "✅ Verified" || echo "⚠️  Not verified")"
echo "  Blockscout: $([ "$BLOCKSCOUT_VERIFIED" = true ] && echo "✅ Verified" || echo "⚠️  Not verified")"
echo ""
echo "Explorer Links:"
echo "  Implementation:"
echo "    BaseScan:   $EXPLORER_URL/address/${IMPLEMENTATION_ADDRESS:-0x}/#code"
echo "    Blockscout: https://${NETWORK/mainnet/base}/${NETWORK/sepolia/base-sepolia}.blockscout.com/address/${IMPLEMENTATION_ADDRESS:-0x}"
echo "  Proxy:"
echo "    BaseScan:   $EXPLORER_URL/address/${PROXY_ADDRESS:-0x}#code"
echo "    Blockscout: https://${NETWORK/mainnet/base}/${NETWORK/sepolia/base-sepolia}.blockscout.com/address/${PROXY_ADDRESS:-0x}"
echo ""
if [ -n "$PROXY_ADDRESS" ]; then
    echo "Validate implementation slot via cast:"
    echo "  cast storage $PROXY_ADDRESS \\
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc \\
        --rpc-url $RPC_URL"
fi
echo ""
echo "To use this deployment in future commands, export:"
echo "  export PROXY_ADDRESS=$PROXY_ADDRESS"
echo "  export IMPLEMENTATION_ADDRESS=$IMPLEMENTATION_ADDRESS"
echo "================================================"
