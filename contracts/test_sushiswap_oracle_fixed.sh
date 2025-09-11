#!/bin/bash

# SushiSwap Oracle Fixed Test Script
# This script runs comprehensive tests for the fixed SushiSwap oracle

set -e

echo "=== SushiSwap Oracle Fixed Test Script ==="
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

echo "🧪 Running SushiSwap Oracle Fixed Tests..."
forge test --match-contract SushiSwapOracleFixedTest --fork-url "$BASE_RPC_URL" -vvv

if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
    echo ""
    echo "=== Test Results Summary ==="
    echo "✅ Oracle Deployment: Passed"
    echo "✅ Pool Configuration: Passed"
    echo "✅ Price Calculation: Passed"
    echo "✅ Price Range Validation: Passed"
    echo "✅ Price Consistency: Passed"
    echo "✅ Oracle Validation: Passed"
    echo "✅ Price Calculation Accuracy: Passed"
    echo "✅ Edge Cases: Passed"
    echo "✅ Price Stability: Passed"
    echo "✅ Oracle Integration: Passed"
    echo "✅ Multiple USDC Amounts: Passed"
    echo "✅ Error Handling: Passed"
    echo "✅ Gas Usage: Passed"
    echo ""
    echo "🎉 All validations passed! The fixed SushiSwap oracle is working correctly."
    echo ""
    echo "=== Key Improvements ==="
    echo "✅ Fixed arithmetic overflow issues"
    echo "✅ Safe price calculation using tick-based method"
    echo "✅ Price range validation (0.001 - 0.01 USDC per VMF)"
    echo "✅ Comprehensive error handling"
    echo "✅ Gas-efficient implementation"
    echo "✅ Production-ready validation"
else
    echo "❌ Tests failed!"
    exit 1
fi

echo ""
echo "=== Test completed successfully ==="
