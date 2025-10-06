#!/bin/bash

set -ex

# Load environment variables
source .env


# Build contracts and extract USDCForwardingHook bytecode
forge build

TOKEN_A="0x2213414893259b0C48066Acd1763e7fbA97859E5" # VMF coin address

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




AMOUNT_VMF="1000000000000000000000"   # 1000 VMF in wei (assuming 18 decimals)
POOL="0x9C83A203133B65982F35D1B00E8283C9fb518cb1"  # SushiSwap VMF/USDC pool

DEPLOYED_FORWARDERS_FILE="deployed_forwarders.txt"
echo -n "" > "$DEPLOYED_FORWARDERS_FILE" # Clear file before writing

for CHARITY in "${charity_addresses[@]}"; do
    # Deploy ERC20Forwarded contract for this charity
    FORWARDER_DEPLOY_OUTPUT=$(forge create --broadcast --rpc-url "$BASE_RPC_URL" --private-key "$PRIVATE_KEY" src/ERC20Forwarded.sol:ERC20Forwarded --constructor-args "$CHARITY")
    FORWARDER=$(echo "$FORWARDER_DEPLOY_OUTPUT" | grep -oE 'Deployed to: (0x[a-fA-F0-9]{40})' | awk '{print $3}')
    echo "ERC20Forwarded deployed for $CHARITY at: $FORWARDER"

    # Save charity and forwarder address to file
    echo "$CHARITY $FORWARDER" >> "$DEPLOYED_FORWARDERS_FILE"

    # Fund the forwarder with 1000 VMF from deployer
    cast send $TOKEN_A "transfer(address,uint256)" "$FORWARDER" $AMOUNT_VMF --private-key "$PRIVATE_KEY"
    echo "Funded forwarder $FORWARDER for $CHARITY with $AMOUNT_VMF VMF"

    # Call sellVMF on the forwarder to create a sell order against the pool
    cast send "$FORWARDER" "sellVMF(address,address,uint256,address)" "$POOL" "$TOKEN_A" $AMOUNT_VMF "$CHARITY" --private-key "$PRIVATE_KEY"
    echo "Called sellVMF on $FORWARDER for $CHARITY against pool $POOL"
done

echo "Deployment and pool setup complete for all charities."
