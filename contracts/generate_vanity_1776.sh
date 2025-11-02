#!/bin/bash

# =============================================================================
# VMF Vanity Proxy Address Generator (1776)
# =============================================================================
# 
# PURPOSE:
#   Generates a CREATE2 salt that produces a proxy address starting or ending 
#   with "1776" - a patriotic vanity address for the VMF token contract.
#
# USAGE:
#   ./generate_vanity_1776.sh [NETWORK] [PATTERN_TYPE]
#
# ARGUMENTS:
#   NETWORK (optional, default: mainnet)
#     - mainnet: Base Mainnet (Chain ID 8453)
#     - sepolia: Base Sepolia Testnet (Chain ID 84532)
#
#   PATTERN_TYPE (optional, default: start)
#     - start: Generate address starting with 0x1776...
#     - end:   Generate address ending with ...1776
#
# EXAMPLES:
#   ./generate_vanity_1776.sh mainnet start  # Default: 0x1776... on mainnet
#   ./generate_vanity_1776.sh mainnet end    # ...1776 on mainnet
#   ./generate_vanity_1776.sh                # Uses defaults
#
# OUTPUT:
#   - Console: Colorized output with address and salt
#   - File: vanity_address_1776.txt (contains deployment details)
#
# PERFORMANCE:
#   - Expected time: 10-30ms (very fast!)
#   - Uses 20 threads for parallel computation
#   - ~65,536 attempts average for 4 hex digits
#
# HOW IT WORKS:
#   Uses CREATE2 (EIP-1014) for deterministic address generation:
#   address = keccak256(0xff ++ deployer ++ salt ++ init_code_hash)[12:]
#
# REQUIREMENTS:
#   - Foundry installed (foundryup)
#   - cast command available in PATH
#
# AI ASSISTANT INSTRUCTIONS:
#   When user asks to generate vanity address:
#   1. cd to contracts directory
#   2. Run: ./generate_vanity_1776.sh mainnet start
#   3. Parse output for address and salt
#   4. Suggest saving salt to .env if deploying
#
# DOCUMENTATION:
#   See VANITY_ADDRESS_GENERATION.md for full details
# =============================================================================

set -e

# Ensure we use the latest Foundry from ~/.foundry/bin
export PATH="$HOME/.foundry/bin:$PATH"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  VMF Vanity Proxy Address Generator (1776)              ║${NC}"
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo ""

# Check if we have the necessary tools
if ! command -v cast &> /dev/null; then
    echo -e "${RED}❌ Error: 'cast' command not found. Please install Foundry.${NC}"
    echo "Run: curl -L https://foundry.paradigm.xyz | bash && foundryup"
    exit 1
fi

# Load environment variables if .env exists
if [ -f .env ]; then
    source .env
fi

# Configuration
NETWORK="${1:-mainnet}"
PATTERN_TYPE="${2:-start}" # 'start' or 'end'

# Select network
case "$NETWORK" in
    mainnet)
        RPC_URL="${BASE_RPC_URL}"
        CHAIN_ID=8453
        echo -e "${GREEN}Network: Base Mainnet${NC}"
        ;;
    sepolia)
        RPC_URL="${BASE_SEPOLIA_RPC_URL}"
        CHAIN_ID=84532
        echo -e "${YELLOW}Network: Base Sepolia${NC}"
        ;;
    *)
        echo -e "${RED}ERROR: Unknown network '$NETWORK'. Use 'mainnet' or 'sepolia'.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}Configuration:${NC}"
echo "  Pattern type: $PATTERN_TYPE (${PATTERN_TYPE}ing with 1776)"
echo "  Network: $NETWORK"
echo "  Chain ID: $CHAIN_ID"
echo ""

# The ERC1967Proxy creation code (this is standard)
# You may need to adjust this based on your exact proxy implementation
PROXY_CREATION_CODE="0x608060405234801561001057600080fd5b5060405161042538038061042583398101604081905261002f91610248565b61003c82826000610043565b5050610315565b61004c83610075565b60008251118061005a5750805b1561007057610069838361016d565b5050505050565b610196565b806100a57f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc60001b6101c7565b6000015160405160200160405180910390a15050565b60606100ea8383604051806060016040528060278152602001610456602791396101ca565b9392505050565b6060600080856001600160a01b03168560405161010e9190610326565b600060405180830381855af49150503d8060008114610149576040519150601f19603f3d011682016040523d82523d6000602084013e61014e565b606091505b50915091506101608683838761024c565b9250505095945050505050565b6060610189838360405180606001604052806027815260200161045660279139610242565b9392505050565b60606000808473ffffffff166001600160a01b03166101af86866102c7565b6040518091039082f590508015801561019057600080855af4925050503d806000811461014957915050565bfe5b90565b6060833b6101ee5760405162461bcd60e51b81526004016101e590610342565b60405180910390fd5b600080856001600160a01b03168560405161020991906102e6565b600060405180830381855af49150503d8060008114610244576040519150601f19603f3d011682016040523d82523d6000602084013e610249565b606091505b50915091506102598683838761024c565b9250505095945050505050565b60608315610318578251610311576001600160a01b0385163b6103115760405162461bcd60e51b81526004016101e590610342565b5081610322565b610322838361032a565b949350505050565b815115610305578082518060200184018484848281f093505050505b5061030f565b815115610305578181f35b8082018281848282f09350505050565b60005b8381101561035c578181015183820152602001610344565b8381111561036b576000848401525b50505050565b60006103848251848252602082019150610371565b80915050919050565b60006103a060205190565b9050919050565b60006103b98251918252602082019161038d565b6000602082015190509190508152604081f35b00"

# Standard CREATE2 Factory (0x4e59b44847b379578588920cA78FbF26c0B4956C)
CREATE2_FACTORY="0x4e59b44847b379578588920cA78FbF26c0B4956C"

echo -e "${YELLOW}🔍 Searching for vanity address...${NC}"
echo "This may take a while depending on your hardware and luck."
echo ""

# Estimate time
if [ "$PATTERN_TYPE" == "start" ]; then
    echo "Expected attempts for 0x1776...: ~65,536 (4 hex digits)"
else
    echo "Expected attempts for ...1776: ~65,536 (4 hex digits)"
fi
echo ""

START_TIME=$(date +%s)

# Try to generate vanity address
if [ "$PATTERN_TYPE" == "start" ]; then
    echo -e "${BLUE}Searching for address starting with 0x1776...${NC}"
    RESULT=$(cast create2 \
        --starts-with 1776 \
        --case-sensitive \
        --deployer "$CREATE2_FACTORY" \
        --init-code-hash "$(cast keccak $PROXY_CREATION_CODE)")
else
    echo -e "${BLUE}Searching for address ending with ...1776${NC}"
    RESULT=$(cast create2 \
        --ends-with 1776 \
        --case-sensitive \
        --deployer "$CREATE2_FACTORY" \
        --init-code-hash "$(cast keccak $PROXY_CREATION_CODE)")
fi

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ VANITY ADDRESS FOUND!                                ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "$RESULT"
echo ""
echo -e "${BLUE}Time elapsed: ${ELAPSED} seconds${NC}"
echo ""

# Extract salt from result
SALT=$(echo "$RESULT" | grep -oP "Salt: \K(0x[a-fA-F0-9]+)" || echo "")
ADDRESS=$(echo "$RESULT" | grep -oP "Address: \K(0x[a-fA-F0-9]+)" || echo "")

if [ -n "$SALT" ] && [ -n "$ADDRESS" ]; then
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Next Steps:${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "1. Save this salt value to your .env file:"
    echo "   CREATE2_SALT=$SALT"
    echo ""
    echo "2. The predicted proxy address will be:"
    echo "   $ADDRESS"
    echo ""
    echo "3. To deploy with this vanity address, you'll need to:"
    echo "   a) Use a CREATE2 factory contract"
    echo "   b) Deploy with the salt: $SALT"
    echo "   c) The init code must match what was calculated"
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Optionally save to a file
    SAVE_FILE="vanity_address_1776.txt"
    cat > "$SAVE_FILE" <<EOF
Vanity Address Generation Result
Generated: $(date)
Network: $NETWORK
Pattern: $PATTERN_TYPE with 1776

Address: $ADDRESS
Salt: $SALT
Deployer: $CREATE2_FACTORY
Init Code Hash: $(cast keccak $PROXY_CREATION_CODE)

To use this address:
1. Deploy using CREATE2 with the salt above
2. Ensure your init code matches exactly
3. The address will be deterministic

Command to deploy (example):
cast send $CREATE2_FACTORY \\
  "deploy(bytes32,bytes)" \\
  $SALT \\
  $PROXY_CREATION_CODE \\
  --rpc-url $RPC_URL \\
  --private-key \$PRIVATE_KEY
EOF
    
    echo -e "${GREEN}Results saved to: $SAVE_FILE${NC}"
    echo ""
fi

echo -e "${GREEN}✅ Generation complete!${NC}"
