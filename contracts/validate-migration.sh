#!/bin/bash

# Migration Validation Script
# Validates that all holders from old VMF contract have been migrated 1:1 to new contract

set -e

# Contract addresses
OLD_VMF="0x2213414893259b0c48066acd1763e7fba97859e5"
NEW_VMF="0x0861e0e7af39CAF42D60b2cC43196c445173BeaC"
BASE_RPC_URL=${BASE_RPC_URL:-"https://mainnet.base.org"}

echo "=== VMF Migration Validation ==="
echo "Old Contract: $OLD_VMF"
echo "New Contract: $NEW_VMF"
echo "RPC Endpoint: $BASE_RPC_URL"
echo ""

# Validate contracts exist and are VMF tokens
echo "🔍 Validating contract addresses..."

OLD_NAME=$(cast call $OLD_VMF "name()" --rpc-url $BASE_RPC_URL 2>/dev/null || echo "ERROR")
NEW_NAME=$(cast call $NEW_VMF "name()" --rpc-url $BASE_RPC_URL 2>/dev/null || echo "ERROR")

if [ "$OLD_NAME" = "ERROR" ] || [ "$NEW_NAME" = "ERROR" ]; then
    echo "❌ Error: Could not connect to one or both contracts"
    echo "   Old contract name: $OLD_NAME"
    echo "   New contract name: $NEW_NAME"
    exit 1
fi

echo "✅ Old contract name: $OLD_NAME"
echo "✅ New contract name: $NEW_NAME"
echo ""

# Check total supplies
echo "📊 Comparing total supplies..."
OLD_SUPPLY=$(cast call $OLD_VMF "totalSupply()" --rpc-url $BASE_RPC_URL)
NEW_SUPPLY=$(cast call $NEW_VMF "totalSupply()" --rpc-url $BASE_RPC_URL)

echo "Old total supply: $OLD_SUPPLY"
echo "New total supply: $NEW_SUPPLY"

if [ "$OLD_SUPPLY" = "$NEW_SUPPLY" ]; then
    echo "✅ Total supplies match perfectly!"
else
    echo "❌ WARNING: Total supplies do not match!"
    echo "   Difference: $((NEW_SUPPLY - OLD_SUPPLY))"
fi
echo ""

# Validate each holder in holders.json
echo "👥 Validating individual holder balances..."
echo "Using holders from holders.json..."

VALIDATION_RESULTS="migration_validation_results.json"
echo "{" > $VALIDATION_RESULTS
echo '  "summary": {' >> $VALIDATION_RESULTS
echo '    "old_contract": "'$OLD_VMF'",' >> $VALIDATION_RESULTS
echo '    "new_contract": "'$NEW_VMF'",' >> $VALIDATION_RESULTS
echo '    "validation_time": "'$(date -Iseconds)'",' >> $VALIDATION_RESULTS
echo '    "old_total_supply": "'$OLD_SUPPLY'",' >> $VALIDATION_RESULTS
echo '    "new_total_supply": "'$NEW_SUPPLY'"' >> $VALIDATION_RESULTS
echo '  },' >> $VALIDATION_RESULTS
echo '  "holders": [' >> $VALIDATION_RESULTS

TOTAL_HOLDERS=0
MIGRATED_HOLDERS=0
PERFECT_MATCHES=0
MISMATCHES=0
TOTAL_OLD_BALANCE=0
TOTAL_NEW_BALANCE=0
FIRST_ENTRY=true

while IFS= read -r address; do
    # Clean address (remove quotes and commas)
    clean_address=$(echo "$address" | tr -d '",' | xargs)
    
    # Skip empty lines and malformed addresses
    if [ -z "$clean_address" ] || [ "${#clean_address}" -ne 42 ] || [[ ! "$clean_address" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
        continue
    fi
    
    echo -n "Checking $clean_address... "
    
    # Get balances from both contracts
    old_balance=$(cast call $OLD_VMF "balanceOf(address)" $clean_address --rpc-url $BASE_RPC_URL 2>/dev/null || echo "0")
    new_balance=$(cast call $NEW_VMF "balanceOf(address)" $clean_address --rpc-url $BASE_RPC_URL 2>/dev/null || echo "0")
    
    TOTAL_HOLDERS=$((TOTAL_HOLDERS + 1))
    TOTAL_OLD_BALANCE=$((TOTAL_OLD_BALANCE + old_balance))
    TOTAL_NEW_BALANCE=$((TOTAL_NEW_BALANCE + new_balance))
    
    # Determine status
    status="unknown"
    if [ "$old_balance" = "0" ] && [ "$new_balance" = "0" ]; then
        status="no_balance"
        echo "No balance in either contract"
    elif [ "$old_balance" = "0" ] && [ "$new_balance" != "0" ]; then
        status="new_only"
        echo "❓ New balance only: $new_balance"
        MIGRATED_HOLDERS=$((MIGRATED_HOLDERS + 1))
    elif [ "$old_balance" != "0" ] && [ "$new_balance" = "0" ]; then
        status="not_migrated"
        echo "❌ NOT MIGRATED - Old balance: $old_balance, New balance: 0"
        MISMATCHES=$((MISMATCHES + 1))
    elif [ "$old_balance" = "$new_balance" ]; then
        status="perfect_match"
        echo "✅ Perfect match: $old_balance"
        MIGRATED_HOLDERS=$((MIGRATED_HOLDERS + 1))
        PERFECT_MATCHES=$((PERFECT_MATCHES + 1))
    else
        status="mismatch"
        echo "❌ MISMATCH - Old: $old_balance, New: $new_balance"
        MIGRATED_HOLDERS=$((MIGRATED_HOLDERS + 1))
        MISMATCHES=$((MISMATCHES + 1))
    fi
    
    # Add to JSON results
    if [ "$FIRST_ENTRY" = true ]; then
        FIRST_ENTRY=false
    else
        echo "," >> $VALIDATION_RESULTS
    fi
    
    echo "    {" >> $VALIDATION_RESULTS
    echo "      \"address\": \"$clean_address\"," >> $VALIDATION_RESULTS
    echo "      \"old_balance\": \"$old_balance\"," >> $VALIDATION_RESULTS
    echo "      \"new_balance\": \"$new_balance\"," >> $VALIDATION_RESULTS
    echo "      \"status\": \"$status\"" >> $VALIDATION_RESULTS
    echo "    }" >> $VALIDATION_RESULTS
    
done < holders.json

# Close JSON
echo "" >> $VALIDATION_RESULTS
echo "  ]" >> $VALIDATION_RESULTS
echo "}" >> $VALIDATION_RESULTS

echo ""
echo "=== MIGRATION VALIDATION SUMMARY ==="
echo "📋 Total addresses checked: $TOTAL_HOLDERS"
echo "✅ Addresses with migrations: $MIGRATED_HOLDERS"
echo "🎯 Perfect 1:1 matches: $PERFECT_MATCHES"
echo "❌ Mismatches found: $MISMATCHES"
echo ""
echo "💰 Balance totals:"
echo "   Old contract total from checked addresses: $TOTAL_OLD_BALANCE"
echo "   New contract total from checked addresses: $TOTAL_NEW_BALANCE"
echo "   Balance difference: $((TOTAL_NEW_BALANCE - TOTAL_OLD_BALANCE))"
echo ""

# Calculate success rate
if [ $TOTAL_HOLDERS -gt 0 ]; then
    SUCCESS_RATE=$(( (PERFECT_MATCHES * 100) / TOTAL_HOLDERS ))
    echo "📊 Migration success rate: $SUCCESS_RATE% ($PERFECT_MATCHES/$TOTAL_HOLDERS perfect matches)"
else
    echo "📊 No holders found to validate"
fi

echo ""
echo "📁 Detailed results saved to: $VALIDATION_RESULTS"

# Final assessment
if [ $MISMATCHES -eq 0 ] && [ $PERFECT_MATCHES -gt 0 ]; then
    echo ""
    echo "🎉 MIGRATION VALIDATION: SUCCESS"
    echo "   All holders with balances have been perfectly migrated 1:1"
    exit 0
elif [ $MISMATCHES -eq 0 ] && [ $PERFECT_MATCHES -eq 0 ]; then
    echo ""
    echo "⚠️  MIGRATION VALIDATION: NO ACTIVE HOLDERS"
    echo "   No addresses found with balances to migrate"
    exit 0
else
    echo ""
    echo "❌ MIGRATION VALIDATION: ISSUES FOUND"
    echo "   $MISMATCHES addresses have migration issues"
    echo "   Check the detailed results for specifics"
    exit 1
fi