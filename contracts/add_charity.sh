#!/bin/bash

contract_address="0x5dA3a9Ca8db3ACdE5A64077AA1D7A2408c5DE24C"
charity_address="0xB697C8b4bCaE454d9dee1E83f73327D7a63600a1"

source .env
rpc_url=$BASE_RPC_URL

charity_address="0x6456879a5073038b0E57ea8E498Cb0240e949fC3"
cast send $contract_address "addAllowedReceivers(address)" $charity_address \
    --rpc-url $rpc_url --private-key "$PRIVATE_KEY"
charity_address="0x700B53ff9a58Ee257F9A2EFda3a373D391028007"
cast send $contract_address "addAllowedReceivers(address)" $charity_address \
    --rpc-url $rpc_url --private-key "$PRIVATE_KEY"
charity_address="0xB697C8b4bCaE454d9dee1E83f73327D7a63600a1"
cast send $contract_address "addAllowedReceivers(address)" $charity_address \
    --rpc-url $rpc_url --private-key "$PRIVATE_KEY"
charity_address="0x5951A4160F73b8798D68e7177dF8af6a7902e725"
cast send $contract_address "addAllowedReceivers(address)" $charity_address \
    --rpc-url $rpc_url --private-key "$PRIVATE_KEY"
charity_address="0xfB0EF51792c36Ae1fE6636603be199788819b67D"
cast send $contract_address "addAllowedReceivers(address)" $charity_address \
    --rpc-url $rpc_url --private-key "$PRIVATE_KEY"
charity_address="0x10F01632DC709F7fA413A140739D8843b06235A1"
cast send $contract_address "addAllowedReceivers(address)" $charity_address \
    --rpc-url $rpc_url --private-key "$PRIVATE_KEY"