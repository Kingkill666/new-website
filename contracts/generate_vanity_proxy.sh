#!/bin/bash

# Script to generate a vanity proxy address starting or ending with 1776
# This uses CREATE2 to deterministically generate addresses

set -e

# Configuration
PATTERN_START="1776"
PATTERN_END="1776"
MAX_ATTEMPTS=1000000

echo "🔍 Searching for vanity proxy address..."
echo "   Looking for addresses starting with 0x1776... or ending with ...1776"
echo "   Maximum attempts: $MAX_ATTEMPTS"
echo ""

# Counter
attempt=0

# Function to generate and check address
generate_address() {
    local salt=$1
    
    # Use cast to compute CREATE2 address
    # You'll need to replace DEPLOYER_ADDRESS and INIT_CODE_HASH with actual values
    # For now, we'll use forge to generate random addresses and check them
    
    # Generate a random private key
    address=$(cast wallet new | grep "Address:" | awk '{print $2}')
    
    # Check if address starts with 1776 (case insensitive)
    if [[ ${address:2:4} == "1776" ]] || [[ ${address:2:4} == "1776" ]]; then
        echo "✅ FOUND! Address starting with 1776:"
        echo "   Address: $address"
        echo "   Salt: $salt"
        return 0
    fi
    
    # Check if address ends with 1776
    if [[ ${address: -4} == "1776" ]]; then
        echo "✅ FOUND! Address ending with 1776:"
        echo "   Address: $address"
        echo "   Salt: $salt"
        return 0
    fi
    
    return 1
}

# More efficient approach using CREATE2
echo "Starting vanity address generation..."
echo ""

found=false

for ((salt=0; salt<MAX_ATTEMPTS; salt++)); do
    # Show progress every 1000 attempts
    if ((salt % 1000 == 0)); then
        echo -ne "\rAttempts: $salt / $MAX_ATTEMPTS"
    fi
    
    # Convert salt to hex (32 bytes)
    salt_hex=$(printf "0x%064x" $salt)
    
    # For a more sophisticated approach, we'd use:
    # cast create2 --starts-with 1776 --case-sensitive
    # or
    # cast create2 --ends-with 1776
    
    # But let's use cast's built-in vanity generation
    if [[ $salt -eq 0 ]]; then
        # On first iteration, check if cast supports this
        if cast create2 --help | grep -q "starts-with"; then
            echo ""
            echo "Using cast's built-in vanity address generator..."
            echo ""
            
            # Try to find address starting with 1776
            echo "Searching for address starting with 1776..."
            result=$(cast create2 --starts-with 1776 --case-insensitive 2>/dev/null || true)
            
            if [[ -n "$result" ]]; then
                echo "✅ FOUND!"
                echo "$result"
                found=true
                break
            fi
            
            # Try to find address ending with 1776
            echo "Searching for address ending with 1776..."
            result=$(cast create2 --ends-with 1776 --case-insensitive 2>/dev/null || true)
            
            if [[ -n "$result" ]]; then
                echo "✅ FOUND!"
                echo "$result"
                found=true
                break
            fi
        fi
    fi
    
    # Fallback: generate random wallet and check
    wallet_output=$(cast wallet new 2>/dev/null)
    address=$(echo "$wallet_output" | grep "Address:" | awk '{print $2}')
    private_key=$(echo "$wallet_output" | grep "Private key:" | awk '{print $3}')
    
    # Convert address to lowercase for comparison
    address_lower=$(echo "$address" | tr '[:upper:]' '[:lower:]')
    
    # Check if starts with 1776 (after 0x)
    if [[ ${address_lower:2:4} == "1776" ]]; then
        echo ""
        echo "✅ FOUND! Address starting with 1776:"
        echo "   Address: $address"
        echo "   Private Key: $private_key"
        echo "   Attempts: $salt"
        found=true
        break
    fi
    
    # Check if ends with 1776
    if [[ ${address_lower: -4} == "1776" ]]; then
        echo ""
        echo "✅ FOUND! Address ending with 1776:"
        echo "   Address: $address"
        echo "   Private Key: $private_key"
        echo "   Attempts: $salt"
        found=true
        break
    fi
done

echo ""

if [[ "$found" == "false" ]]; then
    echo "❌ No vanity address found after $MAX_ATTEMPTS attempts"
    echo "   Try increasing MAX_ATTEMPTS or run the script again"
    exit 1
fi

echo ""
echo "⚠️  IMPORTANT: Save the private key securely!"
echo "⚠️  This is a randomly generated wallet, not a CREATE2 proxy address"
echo ""
echo "To generate a CREATE2 proxy address, you'll need:"
echo "1. The deployer address"
echo "2. The proxy initialization code"
echo "3. A salt value"
echo ""
echo "Then use: cast create2 --deployer <DEPLOYER> --init-code <INIT_CODE> --starts-with 1776"
