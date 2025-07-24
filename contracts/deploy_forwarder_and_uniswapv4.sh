#!/bin/bash

set -ex

# Load environment variables
source .env


# Build contracts and extract USDCForwardingHook bytecode
forge build

# Uniswap v4 PoolManager address for Base mainnet
SINGLETON="0x498581ff718922c3f8e6a244956af099b2652b2b"
TOKEN_A="0x2213414893259b0C48066Acd1763e7fbA97859E5" # VMF coin address
TOKEN_B="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"   # USDC address on Base mainnet
FEE=10000           # Initial fee (in basis points)

# List of charity addresses
charity_addresses=(
    "0x6456879a5073038b0E57ea8E498Cb0240e949fC3"
    "0x700B53ff9a58Ee257F9A2EFda3a373D391028007"
    "0xB697C8b4bCaE454d9dee1E83f73327D7a63600a1"
    "0x5951A4160F73b8798D68e7177dF8af6a7902e725"
    "0xfB0EF51792c36Ae1fE6636603be199788819b67D"
    "0x10F01632DC709F7fA413A140739D8843b06235A1"
    "0x0730d4dc43cf10A3Cd986FEE17f30cB0E75410e0"
    "0x043820c97771c570d830bb0e189778fdef5e6eeb"
    "0x097701F99CC7b0Ff816C2355faC104ADdC6e27B9"
)


for CHARITY in "${charity_addresses[@]}"; do
    # Deploy the hook contract for this charity using forge create
    HOOK_DEPLOY_OUTPUT=$(forge create --broadcast --rpc-url "$BASE_RPC_URL" --private-key "$PRIVATE_KEY" src/USDCForwardingHook.sol:USDCForwardingHook --constructor-args "$CHARITY" "$TOKEN_B")
    HOOK=$(echo "$HOOK_DEPLOY_OUTPUT" | grep -oE 'Deployed to: (0x[a-fA-F0-9]{40})' | awk '{print $3}')
    echo "USDCForwardingHook deployed for $CHARITY at: $HOOK"

    # Create the Uniswap v4 pool with the hook
    POOL_OUTPUT=$(cast send $SINGLETON "createPool(address,address,uint24,address)" $TOKEN_A $TOKEN_B $FEE "$HOOK" --private-key "$PRIVATE_KEY")
    POOL=$(echo "$POOL_OUTPUT" | grep -oE '0x[a-fA-F0-9]{40}' | head -n 1)
    echo "Uniswap v4 pool created for $CHARITY at: $POOL"

    # Fund the pool with initial liquidity (placeholder amounts)
    # Replace AMOUNT_VMF and AMOUNT_USDC with actual values
    AMOUNT_VMF="1000000000000000000"   # 1 VMF (example, in wei)
    AMOUNT_USDC="1000000"              # 1 USDC (example, in smallest unit)

    # Approve pool to spend tokens (if needed)
    cast send $TOKEN_A "approve(address,uint256)" $POOL $AMOUNT_VMF --private-key "$PRIVATE_KEY"
    cast send $TOKEN_B "approve(address,uint256)" $POOL $AMOUNT_USDC --private-key "$PRIVATE_KEY"

    # Provide liquidity to the pool (replace with correct function for Uniswap v4 pool)
    # This is a placeholder; update with the actual mint/addLiquidity call as needed
    echo "Funding pool $POOL for $CHARITY with $AMOUNT_VMF VMF and $AMOUNT_USDC USDC (update with correct function call)"
    # Example: cast send $POOL "mint(address,uint256,uint256)" $PRIVATE_KEY $AMOUNT_VMF $AMOUNT_USDC --private-key "$PRIVATE_KEY"
done

echo "Deployment and pool setup complete for all charities."
