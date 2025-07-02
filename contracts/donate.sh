#!/bin/bash
set -ex

contract_address="0x70Ff52ff9AA492390fFE09dc1521dcA76fE28811"
charity_address="0xB697C8b4bCaE454d9dee1E83f73327D7a63600a1"
source .env
rpc_url="localhost:8485"
# $1 (6 decimals)
amount=1000000
# L1 sepolia
usdc_address="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"

cast send $usdc_address \
  "approve(address,uint256)" \
  $contract_address \
  $amount \
  --private-key "$PRIVATE_KEY" \
  --rpc-url $rpc_url
cast send $contract_address "handleUSDC(uint256,address)" $amount $charity_address \
    --rpc-url $rpc_url --private-key "$PRIVATE_KEY"
