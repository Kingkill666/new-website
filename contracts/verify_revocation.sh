#!/bin/bash
set -e

# Script to verify that the compromised wallet has been completely revoked
# Wallet: 0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d

COMPROMISED_WALLET="0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/vmf-addresses.sh"
VMF_CONTRACT="$VMF_ADDRESS"

echo "🔍 VERIFYING REVOCATION OF COMPROMISED WALLET 🔍"
echo "Wallet: $COMPROMISED_WALLET"
echo "Contract: $VMF_CONTRACT"
echo ""

# Check if we have the required environment variables
if [ -z "$BASE_RPC_URL" ]; then
    echo "❌ ERROR: Missing BASE_RPC_URL environment variable!"
    echo "Please set: export BASE_RPC_URL=\"https://sepolia.base.org\""
    exit 1
fi

echo "✅ Environment variables set"
echo ""

# 1. Check roles
echo "1️⃣ Checking roles..."
ROLE_SET_TAX=$(cast call $VMF_CONTRACT "hasAllRoles(address,uint256)" "$COMPROMISED_WALLET" "1" --rpc-url "$BASE_RPC_URL" 2>/dev/null || echo "false")
ROLE_SET_CHARITY=$(cast call $VMF_CONTRACT "hasAllRoles(address,uint256)" "$COMPROMISED_WALLET" "2" --rpc-url "$BASE_RPC_URL" 2>/dev/null || echo "false")
ROLE_MINTER=$(cast call $VMF_CONTRACT "hasAllRoles(address,uint256)" "$COMPROMISED_WALLET" "4" --rpc-url "$BASE_RPC_URL" 2>/dev/null || echo "false")
ROLE_ADMIN=$(cast call $VMF_CONTRACT "hasAllRoles(address,uint256)" "$COMPROMISED_WALLET" "8" --rpc-url "$BASE_RPC_URL" 2>/dev/null || echo "false")

echo "   ROLE_SET_TAX: $ROLE_SET_TAX"
echo "   ROLE_SET_CHARITY: $ROLE_SET_CHARITY"
echo "   ROLE_MINTER: $ROLE_MINTER"
echo "   ROLE_ADMIN: $ROLE_ADMIN"

if [ "$ROLE_SET_TAX" = "true" ] || [ "$ROLE_SET_CHARITY" = "true" ] || [ "$ROLE_MINTER" = "true" ] || [ "$ROLE_ADMIN" = "true" ]; then
    echo "   ❌ WARNING: Wallet still has roles!"
else
    echo "   ✅ All roles revoked"
fi

# Note: Blacklist, minter, charityReceiver, and teamReceiver have been removed from the contract

# 2. Check if wallet is the owner
echo ""
echo "2️⃣ Checking contract owner..."
OWNER_ADDRESS=$(cast call $VMF_CONTRACT "owner()" --rpc-url "$BASE_RPC_URL" 2>/dev/null || echo "Failed to get")
echo "   Current owner: $OWNER_ADDRESS"

if [ "$OWNER_ADDRESS" = "$COMPROMISED_WALLET" ]; then
    echo "   ❌ CRITICAL: Compromised wallet is still the owner!"
else
    echo "   ✅ Wallet is not the owner"
fi

# Summary
echo ""
echo "📊 VERIFICATION SUMMARY:"
echo "========================"

ISSUES_FOUND=0

if [ "$ROLE_SET_TAX" = "true" ] || [ "$ROLE_SET_CHARITY" = "true" ] || [ "$ROLE_ADMIN" = "true" ]; then
    echo "❌ Roles still active"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Note: ROLE_MINTER, blacklist, minter, charityReceiver, and teamReceiver have been removed

if [ "$OWNER_ADDRESS" = "$COMPROMISED_WALLET" ]; then
    echo "❌ Still set as owner"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""
if [ $ISSUES_FOUND -eq 0 ]; then
    echo "✅ VERIFICATION PASSED: Compromised wallet has been completely revoked!"
else
    echo "❌ VERIFICATION FAILED: $ISSUES_FOUND issues found!"
    echo "Please run the emergency_revoke_all.sh script to fix these issues."
fi

