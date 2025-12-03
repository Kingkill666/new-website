#!/bin/bash
set -e

# EMERGENCY SCRIPT: Revoke all permissions from compromised wallet
# Wallet: 0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d
# 
# This script will:
# 1. Revoke all roles from the compromised wallet
# 2. Check current receiver addresses
# 3. Provide instructions for updating receivers
# 
# Note: Blacklist functionality has been removed from the contract

COMPROMISED_WALLET="0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/vmf-addresses.sh"
VMF_CONTRACT="$VMF_ADDRESS"

echo "🚨 EMERGENCY: REVOKING ALL PERMISSIONS FROM COMPROMISED WALLET 🚨"
echo "Wallet: $COMPROMISED_WALLET"
echo "Contract: $VMF_CONTRACT"
echo ""

# Check if we have the required environment variables
if [ -z "$PRIVATE_KEY" ] || [ -z "$BASE_RPC_URL" ]; then
    echo "❌ ERROR: Missing required environment variables!"
    echo "Please set PRIVATE_KEY and BASE_RPC_URL"
    echo "Example:"
    echo "export PRIVATE_KEY=\"0x...\""
    echo "export BASE_RPC_URL=\"https://sepolia.base.org\""
    exit 1
fi

echo "✅ Environment variables set"
echo ""

# Check current roles
echo "🔍 Checking current roles for compromised wallet..."
ROLE_CHECK=$(cast call $VMF_CONTRACT "hasAllRoles(address,uint256)" "$COMPROMISED_WALLET" "15" --rpc-url "$BASE_RPC_URL" 2>/dev/null || echo "false")
echo "Has roles: $ROLE_CHECK"

# Note: Blacklist functionality has been removed from the contract

echo ""
# Note: charityReceiver, teamReceiver, and minter have been removed from the contract
# Check allowed receivers instead
echo "🔍 Checking current contract state..."

echo ""
echo "🚨 STARTING REVOCATION PROCESS..."

# Revoke all roles
echo ""
echo "1️⃣ Revoking all roles from compromised wallet..."

# Revoke ROLE_SET_TAX (1)
echo "   Revoking ROLE_SET_TAX (1)..."
if cast send $VMF_CONTRACT "revokeRoles(address,uint256)" "$COMPROMISED_WALLET" "1" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL" --gas-limit 100000 2>/dev/null; then
    echo "   ✅ ROLE_SET_TAX revoked"
else
    echo "   ⚠️  Failed to revoke ROLE_SET_TAX (may not have had this role)"
fi

# Revoke ROLE_SET_CHARITY (2)  
echo "   Revoking ROLE_SET_CHARITY (2)..."
if cast send $VMF_CONTRACT "revokeRoles(address,uint256)" "$COMPROMISED_WALLET" "2" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL" --gas-limit 100000 2>/dev/null; then
    echo "   ✅ ROLE_SET_CHARITY revoked"
else
    echo "   ⚠️  Failed to revoke ROLE_SET_CHARITY (may not have had this role)"
fi

# Note: ROLE_MINTER has been removed from the contract

# Revoke ROLE_ADMIN (8)
echo "   Revoking ROLE_ADMIN (8)..."
if cast send $VMF_CONTRACT "revokeRoles(address,uint256)" "$COMPROMISED_WALLET" "8" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL" --gas-limit 100000 2>/dev/null; then
    echo "   ✅ ROLE_ADMIN revoked"
else
    echo "   ⚠️  Failed to revoke ROLE_ADMIN (may not have had this role)"
fi

# Note: Blacklist functionality has been removed from the contract

echo ""
echo "🔍 Verifying revocation..."
FINAL_ROLE_CHECK=$(cast call $VMF_CONTRACT "hasAllRoles(address,uint256)" "$COMPROMISED_WALLET" "15" --rpc-url "$BASE_RPC_URL" 2>/dev/null || echo "false")

echo "Final role check: $FINAL_ROLE_CHECK"

echo ""
echo "✅ REVOCATION COMPLETE!"
echo ""
echo "⚠️  CRITICAL NEXT STEPS:"
echo "1. Remove compromised wallet from allowed receivers list if present"
echo "2. Monitor for any suspicious activity"
echo "3. Consider transferring any remaining funds from the compromised wallet"
echo ""
echo "🔒 Security measures taken:"
echo "   - All roles revoked from compromised wallet"
echo "   - Note: Blacklist functionality has been removed from the contract"
echo "   - Deployment scripts updated to remove compromised addresses"
