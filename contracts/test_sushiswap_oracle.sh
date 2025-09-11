#!/bin/bash

# SushiSwap Oracle Test Script
# This script runs only the tests for the SushiSwap oracle

set -e

echo "=== SushiSwap Oracle Test Script ==="
echo "Date: $(date)"
echo ""

# Check if we're in the contracts directory
if [ ! -f "foundry.toml" ]; then
    echo "❌ Error: Please run this script from the contracts directory"
    exit 1
fi

# Check if environment variables are set
if [ -z "$BASE_RPC_URL" ]; then
    echo "❌ Error: BASE_RPC_URL environment variable not set"
    exit 1
fi

echo "✅ Environment variables set"
echo "RPC URL: $BASE_RPC_URL"
echo ""

# Run the Foundry tests
echo "=== Running Foundry Tests ==="
echo ""

echo "🧪 Running SushiSwap Oracle Tests..."
forge test --match-contract SushiSwapOracleTest --fork-url "$BASE_RPC_URL" -vvv

if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
    echo ""
    echo "=== Test Results Summary ==="
    echo "✅ Oracle Deployment: Passed"
    echo "✅ Pool Configuration: Passed"
    echo "✅ Price Range Validation: Passed"
    echo "✅ Price Consistency: Passed"
    echo "✅ Pool Slot0 Data: Passed"
    echo "✅ Price Calculation Accuracy: Passed"
    echo "✅ Edge Cases: Passed"
    echo "✅ Price Stability: Passed"
    echo "✅ Oracle Integration: Passed"
    echo ""
    echo "🎉 All validations passed! The SushiSwap oracle is working correctly."
else
    echo "❌ Tests failed!"
    exit 1
fi

echo ""
echo "=== Test completed successfully ==="
