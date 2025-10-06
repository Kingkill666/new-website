#!/bin/bash
set -e

# Grant all roles to the specified address
ADDRESS="0xAf3fDfAb4CA3182Dc58B6E81a4a2D89FdE0214cD"
CONTRACT="0x2213414893259b0C48066Acd1763e7fbA97859E5"

echo "Granting all roles to: $ADDRESS"
echo "Contract: $CONTRACT"
echo ""

# Grant ROLE_SET_TAX (1)
echo "Granting ROLE_SET_TAX (1)..."
cast send $CONTRACT "grantRoles(address,uint256)" "$ADDRESS" "1" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL"

# Grant ROLE_SET_CHARITY (2)  
echo "Granting ROLE_SET_CHARITY (2)..."
cast send $CONTRACT "grantRoles(address,uint256)" "$ADDRESS" "2" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL"

# Grant ROLE_MINTER (4)
echo "Granting ROLE_MINTER (4)..."
cast send $CONTRACT "grantRoles(address,uint256)" "$ADDRESS" "4" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL"

# Grant ROLE_ADMIN (8)
echo "Granting ROLE_ADMIN (8)..."
cast send $CONTRACT "grantRoles(address,uint256)" "$ADDRESS" "8" --private-key "$PRIVATE_KEY" --rpc-url "$BASE_RPC_URL"

echo ""
echo "All roles granted successfully!"
echo "Total roles: 1+2+4+8 = 15"
