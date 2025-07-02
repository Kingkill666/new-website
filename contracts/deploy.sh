#!/bin/bash
set -ex
# mainnet
usdc_address="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
# L1 sepolia
#usdc_address="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
# base sepolia
#usdc_address="0x036CbD53842c5426634e7929541eC2318f3dCF7e"

initCharityAddress="0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d"
initTeamAddress="0xf521a4fE5910b4fb4A14C9546C2837D33bEc455d"
source .env
rpc_url=$BASE_RPC_URL
forge create --broadcast --rpc-url "$rpc_url" --private-key "$PRIVATE_KEY" \
    src/VmfCoin.sol:VmfCoin --constructor-args $usdc_address $initCharityAddress $initTeamAddress
