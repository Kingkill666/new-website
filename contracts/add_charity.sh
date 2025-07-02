#!/bin/bash
set -ex

# Contract configuration
contract_address="0x2213414893259b0C48066Acd1763e7fbA97859E5"

# Load environment variables
source .env
rpc_url=$BASE_RPC_URL

# Array of charity addresses to add as allowed receivers
charity_addresses=(
    "0x6456879a5073038b0E57ea8E498Cb0240e949fC3" # Patriots Promise
    "0x700B53ff9a58Ee257F9A2EFda3a373D391028007" # Victory For Veterans
    "0xB697C8b4bCaE454d9dee1E83f73327D7a63600a1" # Holy Family Village
    "0x5951A4160F73b8798D68e7177dF8af6a7902e725" # Camp Cowboy
    "0xfB0EF51792c36Ae1fE6636603be199788819b67D" # Veterans In Need Project
    "0x10F01632DC709F7fA413A140739D8843b06235A1" # Honor HER Foundation
    "0x0730d4dc43cf10A3Cd986FEE17f30cB0E75410e0" # Magicians On Mission
    "0x043820c97771c570d830bb0e189778fdef5e6eeb" # April Forces
)

# Function to add a charity address as an allowed receiver
add_charity_receiver() {
    local charity_address=$1
    echo "Adding charity address: $charity_address"
    
    if cast send $contract_address "addAllowedReceivers(address)" "$charity_address" \
        --rpc-url "$rpc_url" --private-key "$PRIVATE_KEY"; then
        echo "✅ Successfully added: $charity_address"
    else
        echo "❌ Failed to add: $charity_address"
    fi
}

# Loop through all charity addresses and add them
echo "Starting to add charity addresses as allowed receivers..."
for address in "${charity_addresses[@]}"; do
    add_charity_receiver "$address"
done

echo "Finished adding all charity addresses."