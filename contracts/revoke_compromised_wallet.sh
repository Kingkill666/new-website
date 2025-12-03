#!/bin/bash
set -e

# Script to revoke all permissions from compromised wallet
# Wallet: 0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d

COMPROMISED_WALLET="0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/vmf-addresses.sh"
VMF_CONTRACT="$VMF_ADDRESS"

echo "🚨 REVOKING ALL PERMISSIONS FROM COMPROMISED WALLET 🚨"
echo "Wallet: $COMPROMISED_WALLET"
echo "Contract: $VMF_CONTRACT"
echo ""

# Check if wallet has any roles first
echo "Checking current roles for compromised wallet..."
cast call $VMF_CONTRACT "hasAllRoles(address,uint256)" "$COMPROMISED_WALLET" "15" --rpc-url "$BASE_RPC_URL" || echo "No roles found or contract call failed"

echo ""
echo "Revoking all roles from compromised wallet..."

# Revoke ROLE_SET_TAX (1)
echo "Revoking ROLE_SET_TAX (1)..."
cast send $VMF_CONTRACT "revokeRoles(address,uint256)" "$COMPROMISED_WALLET" "1" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL" || echo "Failed to revoke ROLE_SET_TAX"

# Revoke ROLE_SET_CHARITY (2)  
echo "Revoking ROLE_SET_CHARITY (2)..."
cast send $VMF_CONTRACT "revokeRoles(address,uint256)" "$COMPROMISED_WALLET" "2" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL" || echo "Failed to revoke ROLE_SET_CHARITY"

# Revoke ROLE_ADMIN (8)
echo "Revoking ROLE_ADMIN (8)..."
cast send $VMF_CONTRACT "revokeRoles(address,uint256)" "$COMPROMISED_WALLET" "8" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL" || echo "Failed to revoke ROLE_ADMIN"

# Note: ROLE_MINTER has been removed from the contract
# Note: Blacklist functionality has been removed from the contract

echo ""
echo "✅ All roles revoked!"
echo "⚠️  IMPORTANT: Check and update any critical addresses if necessary!"

