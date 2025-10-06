#!/bin/bash
# Script to update holders.json with current token holders

cd "$(dirname "$0")"
source .env

CONTRACT_ADDRESS="0x2213414893259b0c48066acd1763e7fba97859e5"
RPC_URL="https://mainnet.base.org"

echo "=== VMF Token Holder Update ==="
echo "Contract: $CONTRACT_ADDRESS"
echo "Network: Base Mainnet"
echo ""

# Current holders from holders.json
current_holders=(
  "0xf521a4fe5910b4fb4a14c9546c2837d33bec455d"
  "0x6ece9b29610fdd909155c154cacffee7d6273bac"
  "0x59cee22ee277133d153612b3122f6e867445dbb7"
  "0x195b4ca4568ea0051551d8e96502ce2a36269576"
  "0xf8bcf76357a358d225dcd431a7238052ce206249"
  "0x12e31f706010ae0996a2d8247c432d9102e3c871"
  "0x557c7cb60e536c437ac96b361539257b0e2c35c5"
  "0x1db4286a9a7637f8347fc53b71daa9235c129b41"
  "0xaf32ca0c109318a36aa2e10f38611d5b64b72a03"
  "0xffde42d40175b3b9349dfb384439dcb811691e09"
  "0x81759dbf79eadb24b1bfe197a833fa89179b0cbd"
  "0x24344de334423fe32044bcd2aac9db832f6eeac7"
  "0x92cb926a465164c522198208fb963f0e63a89d15"
  "0x5d64d14d2cf4fe5fe4e65b1c7e3d11e18d493091"
  "0xad541da7f18a5151411ed8f83c4727a9f45ea3b2"
  "0x86924c37a93734e8611eb081238928a9d18a63c0"
  "0xcfd59c0f530db36eea8ccbfe744f01fe3556925e"
  "0xa120bf97a89d7fa0927e76c093169fa7cfaca3bb"
  "0xf00000003d31d4ab730a8e269ae547f8f76996ba"
  "0xc073c7acf73f0de6981ae4bbd8832c875d70b459"
  "0x4f82e73edb06d29ff62c91ec8f5ff06571bdeb29"
  "0x9cb8d9bae84830b7f5f11ee5048c04a80b8514ba"
  "0x471f5a59a463daaa7d619573901111275c559489"
  "0xe5b89fa771049df021dcf3817bfc756bb2f85f96"
  "0xec6c1427a9308c47624899cb3454bd34a424fa8f"
  "0x382ffce2287252f930e1c8dc9328dac5bf282ba1"
  "0xad01c20d5886137e056775af56915de824c8fce5"
  "0x00000009e70d153a81f4c972dd123c4b71b7441c"
  "0xf85e95bef8f2de7782b0936ca3480c41a4b6c59b"
  "0x006004d6c39590d39310a0d34181e15d9ade3902"
  "0xa71f09bb63fe0e420d9740e46e28f0057fba68f8"
  "0x03e8254fde84a8601c97c8682fd525db4494dfb6"
  "0x498581ff718922c3f8e6a244956af099b2652b2b"
  "0x9f4e276675f50c271d1c8e202479dabccb69ced0"
  "0x6e4141d33021b52c91c28608403db4a0ffb50ec6"
)

valid_holders=()
invalid_count=0

echo "Checking ${#current_holders[@]} holders..."

for holder in "${current_holders[@]}"; do
  if [ -n "$holder" ]; then
    balance=$(cast call $CONTRACT_ADDRESS "balanceOf(address)(uint256)" $holder --rpc-url $RPC_URL 2>/dev/null)
    
    if [ $? -eq 0 ] && [ "$balance" != "0" ] && [ -n "$balance" ]; then
      valid_holders+=("\"$holder\"")
      echo "✓ $holder: $balance"
    else
      echo "✗ $holder: 0 or error"
      ((invalid_count++))
    fi
    
    # Add small delay to avoid rate limiting
    sleep 0.1
  fi
done

echo ""
echo "Results:"
echo "- Valid holders: ${#valid_holders[@]}"
echo "- Invalid/Zero balance: $invalid_count"
echo ""

# Generate new holders.json
echo "Updating holders.json..."
cat > holders.json << EOF
[
  "0x0000000000000000000000000000000000000000",
$(IFS=,; echo "  ${valid_holders[*]}")
]
EOF

echo "✅ holders.json updated with ${#valid_holders[@]} valid holders"