#!/bin/bash

# Fetch all VMF token holders from various sources
# Usage: ./fetch-all-holders.sh

VMF_CONTRACT="0x2213414893259b0c48066acd1763e7fba97859e5"
BASE_RPC_URL=${BASE_RPC_URL:-"https://mainnet.base.org"}
BASESCAN_API_KEY=${BASESCAN_API_KEY}

echo "Fetching all VMF token holders..."

# Method 1: Use BaseScan API to get all holders (if API key available)
if [ ! -z "$BASESCAN_API_KEY" ]; then
    echo "Using BaseScan API..."
    HOLDERS_FILE="holders_basescan.json"
    
    # Fetch token holders from BaseScan API (filter out zero address)
    curl -s "https://api.basescan.org/api?module=token&action=tokenholderlist&contractaddress=$VMF_CONTRACT&page=1&offset=10000&apikey=$BASESCAN_API_KEY" \
        | jq -r '.result[] | select(.TokenHolderAddress != "0x0000000000000000000000000000000000000000") | .TokenHolderAddress' > temp_holders.txt
    
    # Convert to JSON array
    echo "[" > $HOLDERS_FILE
    while IFS= read -r address; do
        if [ ! -z "$address" ] && [ "$address" != "null" ]; then
            echo "  \"$address\"," >> $HOLDERS_FILE
        fi
    done < temp_holders.txt
    
    # Remove trailing comma and close array
    sed -i '$ s/,$//' $HOLDERS_FILE
    echo "]" >> $HOLDERS_FILE
    
    rm temp_holders.txt
    echo "BaseScan holders saved to $HOLDERS_FILE"
else
    echo "BASESCAN_API_KEY not set, skipping BaseScan API method"
fi

# Method 2: Validate BaseScan results against current holders.json baseline
if [ -f "holders_basescan.json" ]; then
    echo "Comparing BaseScan results with current holders.json baseline..."
    
    # Find addresses in BaseScan but not in holders.json
    echo "New addresses found by BaseScan:"
    comm -23 <(jq -r '.[]' holders_basescan.json | sort) <(jq -r '.[]' holders.json | sort) || echo "None"
    
    # Find addresses in holders.json but not in BaseScan  
    echo "Addresses in holders.json missing from BaseScan:"
    comm -13 <(jq -r '.[]' holders_basescan.json | sort) <(jq -r '.[]' holders.json | sort) || echo "None"
    
    # Create merged list
    echo "Creating merged validated list..."
    TEMP_FILE=$(mktemp)
    jq -s '.[0] + .[1] | unique' holders.json holders_basescan.json > $TEMP_FILE
    mv $TEMP_FILE holders_merged.json
    echo "Merged list saved to holders_merged.json"
else
    echo "No BaseScan data to compare - using current holders.json as baseline"
fi

# Method 3: Use current holders.json as validation baseline
echo "Using current holders.json as validation baseline..."
CURRENT_HOLDERS=$(cat holders.json | jq -r '.[]' | wc -l)
echo "Baseline holders.json contains $CURRENT_HOLDERS addresses"

# Validate current holders.json baseline against on-chain balances
echo "Validating baseline holders.json against on-chain balances..."
VALIDATED_HOLDERS="holders_validated.json"
echo "[" > $VALIDATED_HOLDERS

FIRST=true
VALID_COUNT=0
INVALID_COUNT=0

while IFS= read -r address; do
    if [ ! -z "$address" ] && [ "$address" != "null" ]; then
        # Remove quotes from JSON
        clean_address=$(echo $address | tr -d '"' | tr -d ',')
        
        # Skip zero address (should already be filtered but double-check)
        if [ "$clean_address" != "0x0000000000000000000000000000000000000000" ] && [ ! -z "$clean_address" ]; then
            # Check balance (with retry logic)
            balance=""
            for retry in {1..3}; do
                balance=$(cast call $VMF_CONTRACT "balanceOf(address)(uint256)" $clean_address --rpc-url $BASE_RPC_URL 2>/dev/null || echo "0")
                if [ "$balance" != "0" ] && [ ! -z "$balance" ]; then
                    break
                fi
                sleep 1
            done
            
            if [ "$balance" != "0" ] && [ ! -z "$balance" ]; then
                if [ "$FIRST" = true ]; then
                    FIRST=false
                else
                    echo "," >> $VALIDATED_HOLDERS
                fi
                echo "  \"$clean_address\"" >> $VALIDATED_HOLDERS
                echo "✓ $clean_address has balance: $balance"
                ((VALID_COUNT++))
            else
                echo "✗ $clean_address has zero balance or RPC error"
                ((INVALID_COUNT++))
            fi
        fi
    fi
done < holders.json

echo "" >> $VALIDATED_HOLDERS
echo "]" >> $VALIDATED_HOLDERS

echo "Baseline validation complete!"
echo "Valid holders: $VALID_COUNT"
echo "Invalid/zero balance: $INVALID_COUNT"
echo "Results saved to $VALIDATED_HOLDERS"

# Summary and recommendations
cat << 'EOF'

=== HOLDER VALIDATION SUMMARY ===

This script uses holders.json as the validation baseline and compares it against:
1. BaseScan API results (if BASESCAN_API_KEY is set)
2. On-chain balance verification

FILES GENERATED:
- holders_basescan.json: Complete list from BaseScan API
- holders_merged.json: Combined baseline + BaseScan results  
- holders_validated.json: Only addresses with confirmed balances > 0

RECOMMENDATIONS:

1. FOR PRODUCTION MIGRATION:
   - Use holders_validated.json (confirmed balances only)
   - Review holders_merged.json for any new addresses from BaseScan
   - Implement claim mechanism for any missed holders

2. TO GET COMPLETE HOLDER LIST:
   - Set BASESCAN_API_KEY environment variable
   - Re-run this script to fetch comprehensive BaseScan data
   - Review comparison results for discrepancies

3. ALTERNATIVE INDEXER SERVICES:
   - Moralis: https://moralis.io/ (Web3 API)
   - Alchemy: https://www.alchemy.com/ (Token API)
   - Covalent: https://www.covalenthq.com/ (Token analytics)

EOF