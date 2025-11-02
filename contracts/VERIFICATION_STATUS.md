# Contract Verification Status - VMF Token

## ✅ VERIFIED ON BOTH EXPLORERS

**Upgrade Date:** November 2, 2025  
**Foundry Version:** 1.4.4-nightly (with Etherscan v2 API support)

### Addresses
- **Proxy (UUPS):** `0x8157B303a10609C50e332717D70E53B09ebdb045`
- **Implementation:** `0xB728e46f776859e35FD8f58A2731dd86BA24c923`

### Verification Status

| Explorer | Status | Verification Method | Link |
|----------|--------|---------------------|------|
| **BaseScan** | ✅ **VERIFIED** | Foundry + Etherscan v2 API | [View Contract](https://sepolia.basescan.org/address/0xB728e46f776859e35FD8f58A2731dd86BA24c923#code) |
| **Blockscout** | ✅ **VERIFIED** | Foundry + Blockscout API | [View Contract](https://base-sepolia.blockscout.com/address/0xB728e46f776859e35FD8f58A2731dd86BA24c923) |

### Contract Details

```json
{
  "name": "VMF",
  "compiler_version": "v0.8.23+commit.f704f362",
  "optimization_enabled": true,
  "optimization_runs": 200,
  "evm_version": "default",
  "is_verified": true
}
```

### Verification Method

**Latest Foundry with Etherscan v2 API Support:**

The contracts were verified using **Foundry 1.4.4-nightly** which now supports Etherscan's v2 API:

```bash
# BaseScan verification (Etherscan v2 API)
forge verify-contract 0xB728e46f776859e35FD8f58A2731dd86BA24c923 \
  src/VMF.sol:VMF \
  --chain base-sepolia \
  --etherscan-api-key $BASESCAN_API_KEY \
  --watch

# Blockscout verification (alternative)
forge verify-contract 0xB728e46f776859e35FD8f58A2731dd86BA24c923 \
  src/VMF.sol:VMF \
  --verifier blockscout \
  --verifier-url https://base-sepolia.blockscout.com/api \
  --chain-id 84532
```

### Important: Foundry Upgrade Required

To verify contracts, you must use **Foundry 1.4.4 or later**:

```bash
# Upgrade Foundry
foundryup

# Verify version (should be 1.4.4 or later)
forge --version
```

Older versions of Foundry will fail with "deprecated V1 endpoint" errors when trying to verify on BaseScan.

## Verifying the Upgrade

### Check Implementation Address

```bash
# Get the current implementation from proxy storage
cast storage 0x8157B303a10609C50e332717D70E53B09ebdb045 \
  0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc \
  --rpc-url https://sepolia.base.org
```

**Expected Output:** `0x000000000000000000000000b728e46f776859e35fd8f58a2731dd86ba24c923`

### Test Contract Functions

```bash
# Check contract name
cast call 0x8157B303a10609C50e332717D70E53B09ebdb045 \
  "name()(string)" \
  --rpc-url https://sepolia.base.org

# Output: "VMF"

# Check if upgrades are enabled
cast call 0x8157B303a10609C50e332717D70E53B09ebdb045 \
  "upgradesDisabled()(bool)" \
  --rpc-url https://sepolia.base.org

# Output: false (upgrades still possible)

# Check price oracle (new feature)
cast call 0x8157B303a10609C50e332717D70E53B09ebdb045 \
  "priceOracle()(address)" \
  --rpc-url https://sepolia.base.org

# Output: 0x0000000000000000000000000000000000002710 (or actual oracle if set)
```

### Verify on Blockscout API

```bash
curl -s "https://base-sepolia.blockscout.com/api/v2/smart-contracts/0xB728e46f776859e35FD8f58A2731dd86BA24c923" | jq
```

**Expected Response:**
```json
{
  "is_verified": true,
  "name": "VMF",
  "compiler_version": "v0.8.23+commit.f704f362",
  "optimization_enabled": true,
  ...
}
```

## Reading Verified Source Code

You can read the full verified source code on Blockscout:

1. Visit: https://base-sepolia.blockscout.com/address/0xB728e46f776859e35FD8f58A2731dd86BA24c923
2. Click on "Contract" tab
3. View:
   - ✅ Source code
   - ✅ ABI
   - ✅ Constructor arguments
   - ✅ Compiler settings

## For Future Upgrades

The `upgrade.sh` script now automatically:
1. Deploys new implementation
2. Upgrades the proxy
3. **Verifies on Blockscout** (primary)
4. Falls back to BaseScan if needed (may fail, not critical)

**Upgrade is considered successful if Blockscout verification succeeds.**

## Mainnet Deployment

When deploying to Base Mainnet:

```bash
./upgrade.sh mainnet
```

The script will use:
- Blockscout API: `https://base.blockscout.com/api`
- Chain ID: `8453`
- Same verification process

## Summary

✅ **Contract is fully verified and functional**
- Implementation deployed and verified on Blockscout
- Proxy upgraded successfully
- All contract functions working
- Source code publicly viewable
- ABI available for interaction

🔗 **Primary Explorer:** https://base-sepolia.blockscout.com/address/0xB728e46f776859e35FD8f58A2731dd86BA24c923

---

*Last Updated: November 2, 2025*
