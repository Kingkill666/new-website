# VMF Contract Upgrade - Quick Reference

## ✅ Latest Upgrade Status

**Date:** November 2, 2025  
**Network:** Base Sepolia  
**Foundry Version:** 1.4.4-nightly (Etherscan v2 API support)

### Addresses
- **Proxy:** `0x8157B303a10609C50e332717D70E53B09ebdb045`
- **Implementation:** `0xB728e46f776859e35FD8f58A2731dd86BA24c923`
- **Transaction:** `0xb7f21ad5e4e53c8eab49071bdd8a30cc142e95fda856d772a8f6beb415c2e295`

### Verification Status
| Explorer | Status | Link |
|----------|--------|------|
| BaseScan | ✅ Verified | [View Code](https://sepolia.basescan.org/address/0xB728e46f776859e35FD8f58A2731dd86BA24c923#code) |
| Blockscout | ✅ Verified | [View Code](https://base-sepolia.blockscout.com/address/0xB728e46f776859e35FD8f58A2731dd86BA24c923) |
| Proxy Detection | ✅ Auto-detected | Both explorers detect proxy pattern |

---

## 🚀 One-Command Upgrade & Verification

The `upgrade.sh` script now does **everything automatically**:

```bash
# Upgrade on testnet (Base Sepolia)
./upgrade.sh sepolia

# Upgrade on mainnet (Base)
./upgrade.sh mainnet
```

### What It Does:
1. ✅ Deploys new implementation
2. ✅ Upgrades proxy to new implementation
3. ✅ **Verifies on BaseScan** (Etherscan v2 API)
4. ✅ **Verifies on Blockscout** (backup)
5. ✅ **Checks proxy detection** on both explorers
6. ✅ **Prints complete status** with links

**No additional verification steps needed!** 🎉

---

## Quick Commands

### Complete Upgrade + Verification
```bash
./upgrade.sh sepolia    # Does everything automatically
```

### Check Current Status
```bash
./verify-implementation.sh sepolia check
```

### Manual Verification (if needed)
```bash
./verify-implementation.sh sepolia verify 0xIMPLEMENTATION_ADDRESS
```

### Verify All Contracts
```bash
./verify-all-contracts.sh sepolia
```

---

## Important Notes

### Prerequisites

1. ✅ **Foundry 1.4.4+** (required for Etherscan v2 API)
   ```bash
   foundryup  # Upgrade to latest
   ```

2. ✅ `.env` file configured:
   - `PRIVATE_KEY=0x...` (must have 0x prefix)
   - `PROXY_ADDRESS=0x...`
   - `BASE_SEPOLIA_RPC_URL=...`
   - `BASE_RPC_URL=...`
   - `BASESCAN_API_KEY=...`

3. ✅ Wallet has permissions (owner or ADMIN_ROLE)

4. ✅ Sufficient ETH for gas

### What Happens During Upgrade

```
Step 1: Deploy new implementation
   ├─ Create new VMF contract
   └─ Call upgradeToAndCall() on proxy

Step 2: Verify on BaseScan
   ├─ Use Etherscan v2 API
   └─ Show source code + ABI

Step 3: Verify on Blockscout  
   ├─ Use Blockscout API
   └─ Backup verification

Step 4: Check proxy detection
   ├─ Verify explorers detect proxy pattern
   └─ Confirm implementation link

Step 5: Print complete status
   ├─ Verification status for both explorers
   ├─ Direct links to view contracts
   └─ Commands for manual verification if needed
```

### Success Criteria

Upgrade is **successful** when:
- ✅ New implementation deployed
- ✅ Proxy upgraded (storage slot updated)
- ✅ **At least one explorer verified** (preferably both)
- ✅ Proxy pattern detected by explorers

---

## Common Issues & Solutions

**Error: "missing hex prefix"**
- ✅ Add `0x` to the start of `PRIVATE_KEY` in `.env`

**Error: "VMF: upgrades disabled"**
- ❌ Upgrades permanently disabled - cannot upgrade

**Error: "caller is not authorized"**
- ❌ Wallet doesn't have permission to upgrade

**Verification succeeds on one explorer but fails on the other**
- ✅ **This is SUCCESS!** Only need verification on one explorer
- Both BaseScan and Blockscout are trusted explorers

**"deprecated V1 endpoint" error**
- ⚠️ Need Foundry 1.4.4+
- Run `foundryup` to upgrade

---

## File Reference

| File | Purpose |
|------|---------|
| **`upgrade.sh`** | 🎯 **All-in-one**: Upgrade + Verify on both explorers |
| `verify-implementation.sh` | Check/verify implementation manually |
| `verify-all-contracts.sh` | Complete verification workflow |
| `UPGRADE_README.md` | Comprehensive upgrade guide |
| `VERIFICATION_STATUS.md` | Current verification status |
| `.env` | Your configuration (not in git) |
| `.env.example` | Template for configuration |

---

## Output Example

When you run `./upgrade.sh sepolia`, you'll see:

```
===============================================
VMF Contract Upgrade Script
===============================================
Network:         Base Sepolia
Chain ID:        84532
Proxy Address:   0x8157B303a10609C50e332717D70E53B09ebdb045
===============================================

Starting upgrade process...

Step 1: Deploying new implementation and upgrading proxy...
[deployment output...]

Step 2: Verifying implementation on BaseScan and Blockscout...
✅ Implementation verified on BaseScan!
✅ Implementation verified on Blockscout!

Step 3: Checking proxy detection on explorers...
✅ Blockscout detected proxy → implementation link

================================================
VERIFICATION SUMMARY
================================================
✅ SUCCESS: Implementation verified on BOTH explorers!

Proxy verification:
   Proxy contracts don't need separate verification
   Explorers detect the proxy pattern and show the implementation ABI

===============================================
UPGRADE COMPLETE
===============================================
[complete status with links...]
```

---

## Support

For detailed information, see:
- `UPGRADE_README.md` - Full upgrade guide
- `VERIFICATION_STATUS.md` - Verification details
- Foundry docs: https://book.getfoundry.sh/

---

## File Reference

- `upgrade.sh` - Main upgrade script (supports mainnet/sepolia)
- `verify-implementation.sh` - Helper for checking and verifying
- `UPGRADE_README.md` - Comprehensive documentation
- `.env.example` - Environment variable template
- `.env` - Your actual configuration (not in git)

---

## Next Steps After Upgrade

1. Verify the implementation address:
   ```bash
   ./verify-implementation.sh sepolia check
   ```

2. Test contract functions:
   ```bash
   cast call $PROXY_ADDRESS "name()" --rpc-url $BASE_SEPOLIA_RPC_URL
   ```

3. Check if upgrade worked:
   ```bash
   cast storage $PROXY_ADDRESS \
     0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc \
     --rpc-url $BASE_SEPOLIA_RPC_URL
   ```

4. Verify on BaseScan (optional):
   ```bash
   ./verify-implementation.sh sepolia verify 0xNEW_IMPL_ADDRESS
   ```

---

## Support

For detailed information, see:
- `UPGRADE_README.md` - Full upgrade guide
- `CONTRACT_DEPLOYMENT.md` - Initial deployment info
- Foundry docs: https://book.getfoundry.sh/
