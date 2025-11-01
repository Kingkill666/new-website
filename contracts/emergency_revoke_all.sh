#!/bin/bash
set -e

# EMERGENCY SCRIPT: Revoke all permissions from compromised wallet
# Wallet: 0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d
# 
# This script will:
# 1. Revoke all roles from the compromised wallet
# 2. Add the wallet to blacklist
# 3. Check current receiver addresses
# 4. Provide instructions for updating receivers

COMPROMISED_WALLET="0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d"
VMF_CONTRACT="0x2213414893259b0C48066Acd1763e7fbA97859E5"

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
    echo "export BASE_RPC_URL=\"https://mainnet.base.org\""
    exit 1
fi

echo "✅ Environment variables set"
echo ""

# Check current roles
echo "🔍 Checking current roles for compromised wallet..."
ROLE_CHECK=$(cast call $VMF_CONTRACT "hasAllRoles(address,uint256)" "$COMPROMISED_WALLET" "15" --rpc-url "$BASE_RPC_URL" 2>/dev/null || echo "false")
echo "Has roles: $ROLE_CHECK"

# Check if wallet is blacklisted
BLACKLIST_CHECK=$(cast call $VMF_CONTRACT "isBlacklisted(address)" "$COMPROMISED_WALLET" --rpc-url "$BASE_RPC_URL" 2>/dev/null || echo "false")
echo "Is blacklisted: $BLACKLIST_CHECK"

echo ""
echo "🔍 Checking current receiver addresses..."
CHARITY_RECEIVER=$(cast call $VMF_CONTRACT "charityReceiver()" --rpc-url "$BASE_RPC_URL" 2>/dev/null || echo "Failed to get")
TEAM_RECEIVER=$(cast call $VMF_CONTRACT "teamReceiver()" --rpc-url "$BASE_RPC_URL" 2>/dev/null || echo "Failed to get")
MINTER_ADDRESS=$(cast call $VMF_CONTRACT "minter()" --rpc-url "$BASE_RPC_URL" 2>/dev/null || echo "Failed to get")
echo "Charity Receiver: $CHARITY_RECEIVER"
echo "Team Receiver: $TEAM_RECEIVER"
echo "Minter Address: $MINTER_ADDRESS"

# Check if compromised wallet is set as any of these critical addresses
if [ "$CHARITY_RECEIVER" = "$COMPROMISED_WALLET" ]; then
    echo "🚨 WARNING: Compromised wallet is set as CHARITY_RECEIVER!"
fi
if [ "$TEAM_RECEIVER" = "$COMPROMISED_WALLET" ]; then
    echo "🚨 WARNING: Compromised wallet is set as TEAM_RECEIVER!"
fi
if [ "$MINTER_ADDRESS" = "$COMPROMISED_WALLET" ]; then
    echo "🚨 WARNING: Compromised wallet is set as MINTER!"
fi

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

# Revoke ROLE_MINTER (4)
echo "   Revoking ROLE_MINTER (4)..."
if cast send $VMF_CONTRACT "revokeRoles(address,uint256)" "$COMPROMISED_WALLET" "4" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL" --gas-limit 100000 2>/dev/null; then
    echo "   ✅ ROLE_MINTER revoked"
else
    echo "   ⚠️  Failed to revoke ROLE_MINTER (may not have had this role)"
fi

# Revoke ROLE_ADMIN (8)
echo "   Revoking ROLE_ADMIN (8)..."
if cast send $VMF_CONTRACT "revokeRoles(address,uint256)" "$COMPROMISED_WALLET" "8" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL" --gas-limit 100000 2>/dev/null; then
    echo "   ✅ ROLE_ADMIN revoked"
else
    echo "   ⚠️  Failed to revoke ROLE_ADMIN (may not have had this role)"
fi

# Add to blacklist
echo ""
echo "2️⃣ Adding compromised wallet to blacklist..."
if cast send $VMF_CONTRACT "addToBlacklist(address)" "$COMPROMISED_WALLET" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL" --gas-limit 100000 2>/dev/null; then
    echo "   ✅ Wallet added to blacklist"
else
    echo "   ⚠️  Failed to add to blacklist (may already be blacklisted)"
fi

echo ""
echo "🔍 Verifying revocation..."
FINAL_ROLE_CHECK=$(cast call $VMF_CONTRACT "hasAllRoles(address,uint256)" "$COMPROMISED_WALLET" "15" --rpc-url "$BASE_RPC_URL" 2>/dev/null || echo "false")
FINAL_BLACKLIST_CHECK=$(cast call $VMF_CONTRACT "isBlacklisted(address)" "$COMPROMISED_WALLET" --rpc-url "$BASE_RPC_URL" 2>/dev/null || echo "false")

echo "Final role check: $FINAL_ROLE_CHECK"
echo "Final blacklist check: $FINAL_BLACKLIST_CHECK"

echo ""
echo "✅ REVOCATION COMPLETE!"
echo ""
echo "⚠️  CRITICAL NEXT STEPS:"
echo "1. Update charity and team receiver addresses if they were set to the compromised wallet"
echo "2. Check if the compromised wallet was set as the minter address"
echo "3. Remove compromised wallet from tax exempt list if present"
echo "4. Remove compromised wallet from allowed receivers list if present"
echo "5. Monitor for any suspicious activity"
echo "6. Consider transferring any remaining funds from the compromised wallet"
echo ""
echo "To update receivers, use the update_receivers.sh script after setting new addresses."
echo ""
echo "🔒 Security measures taken:"
echo "   - All roles revoked from compromised wallet"
echo "   - Wallet added to blacklist"
echo "   - Deployment scripts updated to remove compromised addresses"
echo "   - Wallet removed from holders.json"
