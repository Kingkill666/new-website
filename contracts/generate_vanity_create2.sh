#!/bin/bash

# Script to generate a vanity CREATE2 proxy address starting or ending with 1776
# Uses Foundry's cast create2 command for deterministic address generation

set -e

echo "🔍 Generating vanity CREATE2 address with 1776..."
echo ""

# Check if we have the necessary tools
if ! command -v cast &> /dev/null; then
    echo "❌ Error: 'cast' command not found. Please install Foundry."
    exit 1
fi

# You need to provide these values based on your proxy contract
# Default values (replace with your actual values)
DEPLOYER_ADDRESS="${DEPLOYER_ADDRESS:-0x4e59b44847b379578588920cA78FbF26c0B4956C}" # CREATE2 factory
INIT_CODE_FILE="${INIT_CODE_FILE:-}"

echo "Configuration:"
echo "  Deployer: $DEPLOYER_ADDRESS"
echo "  Pattern: Starting OR ending with 1776"
echo ""

# Method 1: Using cast's built-in vanity generator
echo "Method 1: Using cast create2 vanity generator"
echo "=========================================="
echo ""

# Try to find address starting with 1776
echo "Searching for address starting with 0x1776..."
echo "(This may take several minutes depending on hardware)"
echo ""

# Use cast create2 with vanity options
# Note: --starts-with expects the pattern WITHOUT 0x prefix
cast create2 \
    --starts-with 1776 \
    --case-insensitive \
    --deployer "$DEPLOYER_ADDRESS" 2>&1 || {
    echo ""
    echo "Trying to find address ending with 1776..."
    cast create2 \
        --ends-with 1776 \
        --case-insensitive \
        --deployer "$DEPLOYER_ADDRESS"
}

echo ""
echo "✅ Vanity address generation complete!"
echo ""
echo "To deploy the proxy with this salt:"
echo "1. Note the salt value from above"
echo "2. Use it in your deployment script with CREATE2"
echo "3. The address will be deterministic based on:"
echo "   - Deployer address: $DEPLOYER_ADDRESS"
echo "   - Init code hash"
echo "   - Salt value"
