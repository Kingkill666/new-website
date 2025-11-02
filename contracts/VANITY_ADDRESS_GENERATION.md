# Vanity Address Generation Guide

## Overview

This repository includes scripts to generate vanity CREATE2 proxy addresses containing the pattern "1776". These addresses are deterministic and can be pre-calculated before deployment.

## Scripts Available

### Primary Script: `generate_vanity_1776.sh`

**Location:** `/contracts/generate_vanity_1776.sh`

**Purpose:** Generate a CREATE2 proxy address that either starts with `0x1776...` or ends with `...1776`.

**Usage:**
```bash
cd contracts
./generate_vanity_1776.sh [NETWORK] [PATTERN_TYPE]
```

**Parameters:**
- `NETWORK` (optional, default: `mainnet`):
  - `mainnet` - Base Mainnet
  - `sepolia` - Base Sepolia Testnet
- `PATTERN_TYPE` (optional, default: `start`):
  - `start` - Find address starting with `0x1776...`
  - `end` - Find address ending with `...1776`

**Examples:**
```bash
# Find address starting with 0x1776 on mainnet
./generate_vanity_1776.sh mainnet start

# Find address ending with 1776 on mainnet
./generate_vanity_1776.sh mainnet end

# Use defaults (mainnet, starting with 1776)
./generate_vanity_1776.sh
```

### Alternative Scripts

- `generate_vanity_create2.sh` - Simplified CREATE2 vanity generator
- `generate_vanity_proxy.sh` - Fallback random wallet generator (not recommended for proxies)

## How It Works

### CREATE2 Deterministic Addresses

The script uses CREATE2 (EIP-1014) to generate deterministic addresses based on:
1. **Deployer Address:** `0x4e59b44847b379578588920cA78FbF26c0B4956C` (Standard CREATE2 Factory)
2. **Salt:** A random 32-byte value (this is what we iterate through)
3. **Init Code Hash:** Hash of the proxy bytecode

**Formula:**
```
address = keccak256(0xff ++ deployer_address ++ salt ++ keccak256(init_code))[12:]
```

### Performance

- **Expected attempts:** ~65,536 for 4 hex digits (1776)
- **Actual time:** Usually 10-30ms on modern hardware
- **Threads:** Uses 20 threads for parallel computation

## Output

### Console Output

The script provides colorized output showing:
- Configuration (network, pattern type)
- Progress indication
- Success message with address and salt
- Next steps for deployment

### Generated Files

**File:** `vanity_address_1776.txt`

Contains:
- Generated address
- Salt value (needed for deployment)
- Deployer address
- Init code hash
- Example deployment command
- Timestamp

## Example Successful Run

```bash
$ ./generate_vanity_1776.sh mainnet start

╔══════════════════════════════════════════════════════════╗
║  VMF Vanity Proxy Address Generator (1776)              ║
╔══════════════════════════════════════════════════════════╗

Network: Base Mainnet

Configuration:
  Pattern type: start (starting with 1776)
  Network: mainnet
  Chain ID: 8453

🔍 Searching for vanity address...
Expected attempts for 0x1776...: ~65,536 (4 hex digits)

Searching for address starting with 0x1776...

╔══════════════════════════════════════════════════════════╗
║  ✅ VANITY ADDRESS FOUND!                                ║
╚══════════════════════════════════════════════════════════╝

Address: 0x1776f2fcA2854C511Db2948BF306473d4CAc3a22
Salt: 0xedd7a89b15c498ae9ef154ae6903221d600dcd738586d6ede86b771c0930a02b

Results saved to: vanity_address_1776.txt
```

## Using the Generated Address

### Step 1: Save the Salt

Add the generated salt to your `.env` file:

```bash
CREATE2_SALT=0xedd7a89b15c498ae9ef154ae6903221d600dcd738586d6ede86b771c0930a02b
```

### Step 2: Deploy with CREATE2

Use the salt in your deployment script to deploy to the vanity address. The address will be deterministic.

**Manual deployment example:**
```bash
cast send 0x4e59b44847b379578588920cA78FbF26c0B4956C \
  "deploy(bytes32,bytes)" \
  $CREATE2_SALT \
  $PROXY_INIT_CODE \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

### Step 3: Verify

The deployed proxy will have the vanity address you generated. This is deterministic and will always be the same as long as:
- Same deployer address
- Same salt
- Same init code

## Prerequisites

### Required Tools

1. **Foundry** (with `cast` command)
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Bash shell** (Linux/macOS)

3. **Environment variables** (optional, in `.env`):
   - `BASE_RPC_URL` - For mainnet
   - `BASE_SEPOLIA_RPC_URL` - For testnet

### Checking Installation

```bash
# Verify cast is installed
cast --version

# Test the script
cd contracts
./generate_vanity_1776.sh mainnet start
```

## Troubleshooting

### Error: "cast command not found"

**Solution:** Install Foundry
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Error: "unexpected argument '--case-insensitive' found"

**Solution:** This was fixed in the script. The correct flag is `--case-sensitive`. Make sure you have the latest version of the script.

### Script runs but takes too long

**Note:** For 4 hex digits (1776), it should be very fast (10-30ms). If it's taking longer, there may be an issue with your Foundry installation or hardware.

### Address doesn't match expected pattern

**Verify:** Check that you're looking at the right part of the address:
- Starting pattern: Check characters 3-6 (after `0x`)
- Ending pattern: Check last 4 characters

## Technical Details

### CREATE2 Factory

**Address:** `0x4e59b44847b379578588920cA78FbF26c0B4956C`

This is a standard CREATE2 factory contract available on most EVM chains. It allows deterministic deployment of contracts.

### Proxy Init Code

The script uses standard ERC1967 proxy bytecode. The exact bytecode is stored in the `PROXY_CREATION_CODE` variable in the script.

### Hash Function

The address generation uses `keccak256` hashing, which is the standard Ethereum hash function.

## Security Considerations

### Salt Storage

- The salt value is not sensitive (it's public on-chain after deployment)
- However, store it securely to ensure you can reproduce the deployment if needed

### Private Keys

- **Never** include private keys in the generated files
- The script generates addresses, not private keys (for CREATE2 deployment)
- Only the deployer who has the correct init code and uses the CREATE2 factory can deploy to the vanity address

### Verification

After deployment:
1. Verify the deployed address matches the predicted address
2. Verify the contract bytecode on a block explorer
3. Ensure the proxy is initialized correctly

## Integration with Deployment Scripts

### Example: Modifying deploy.sh

To integrate vanity address generation into your deployment workflow:

```bash
# 1. Generate vanity address (if not already done)
if [ -z "$CREATE2_SALT" ]; then
    echo "Generating vanity address..."
    ./generate_vanity_1776.sh mainnet start
    echo "Add the generated salt to your .env file"
    exit 1
fi

# 2. Use the salt in your deployment
forge create \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --create2-salt $CREATE2_SALT \
    YourContract
```

## AI Assistant Instructions

### For Cursor/Copilot/Claude

When asked to generate a vanity address:

1. **Run the script:**
   ```bash
   cd contracts
   ./generate_vanity_1776.sh mainnet start
   ```

2. **Save the output:** The salt and address will be displayed and saved to `vanity_address_1776.txt`

3. **Update .env:** Add the salt to the environment file if deploying

4. **Verify:** Check that the address matches the expected pattern

### Common Commands

```bash
# Generate address starting with 1776
cd contracts && ./generate_vanity_1776.sh mainnet start

# Generate address ending with 1776
cd contracts && ./generate_vanity_1776.sh mainnet end

# View last generated address
cat contracts/vanity_address_1776.txt

# Make script executable (if needed)
chmod +x contracts/generate_vanity_1776.sh
```

## Additional Resources

- [EIP-1014: CREATE2](https://eips.ethereum.org/EIPS/eip-1014)
- [Foundry Book - CREATE2](https://book.getfoundry.sh/reference/forge/forge-create#create2)
- [CREATE2 Factory Contract](https://etherscan.io/address/0x4e59b44847b379578588920cA78FbF26c0B4956C)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify Foundry installation: `cast --version`
3. Review the script output for error messages
4. Check that `.env` file has correct RPC URLs (if needed)
