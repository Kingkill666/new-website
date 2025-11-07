#!/bin/bash
set -e

# Grant all roles to the specified address
ADDRESS="0xAf3fDfAb4CA3182Dc58B6E81a4a2D89FdE0214cD"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/vmf-addresses.sh"
CONTRACT="$VMF_ADDRESS"

echo "Granting all roles to: $ADDRESS"
echo "Contract: $CONTRACT"
echo ""

# Grant ROLE_SET_CHARITY (1)
echo "Granting ROLE_SET_CHARITY (1)..."
cast send $CONTRACT "grantRoles(address,uint256)" "$ADDRESS" "1" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL"

# Grant ROLE_MINTER (2)
echo "Granting ROLE_MINTER (2)..."
cast send $CONTRACT "grantRoles(address,uint256)" "$ADDRESS" "2" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL"

# Grant ROLE_ADMIN (4)
echo "Granting ROLE_ADMIN (4)..."
cast send $CONTRACT "grantRoles(address,uint256)" "$ADDRESS" "4" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL"

echo ""
echo "All roles granted successfully!"
echo "Total roles: 1+2+4 = 7"
