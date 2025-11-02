#!/bin/bash
set -e

# Script to update charity and team receiver addresses
# Replace the compromised wallet with new secure addresses

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/vmf-addresses.sh"
VMF_CONTRACT="$VMF_ADDRESS"

# NEW ADDRESSES - REPLACE THESE WITH YOUR SECURE ADDRESSES
NEW_CHARITY_RECEIVER="0x0000000000000000000000000000000000000000"  # REPLACE WITH NEW CHARITY ADDRESS
NEW_TEAM_RECEIVER="0x0000000000000000000000000000000000000000"      # REPLACE WITH NEW TEAM ADDRESS

echo "🔄 UPDATING RECEIVER ADDRESSES 🔄"
echo "Contract: $VMF_CONTRACT"
echo "New Charity Receiver: $NEW_CHARITY_RECEIVER"
echo "New Team Receiver: $NEW_TEAM_RECEIVER"
echo ""

# Check current receivers
echo "Current receivers:"
cast call $VMF_CONTRACT "charityReceiver()" --rpc-url "$BASE_RPC_URL" || echo "Failed to get charity receiver"
cast call $VMF_CONTRACT "teamReceiver()" --rpc-url "$BASE_RPC_URL" || echo "Failed to get team receiver"

echo ""
echo "⚠️  WARNING: Please update NEW_CHARITY_RECEIVER and NEW_TEAM_RECEIVER in this script first!"
echo "⚠️  Current values are placeholder addresses (0x0000...)"

# Uncomment these lines after updating the addresses above:
# echo "Updating charity receiver..."
# cast send $VMF_CONTRACT "setCharityPoolAddress(address)" "$NEW_CHARITY_RECEIVER" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL"

# echo "Updating team receiver..."
# cast send $VMF_CONTRACT "setTeamPoolAddress(address)" "$NEW_TEAM_RECEIVER" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL"

echo ""
echo "✅ Script ready - update addresses and uncomment the send commands!"

