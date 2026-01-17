# Documentation Index for AI Assistants

This directory contains scripts and documentation for the VMF smart contracts project.

## For Cursor/Copilot/Claude: Quick Start

### Generate a Vanity Address with "1776"

**Command:**
```bash
cd /home/colinbellmore/Documents/mikes-website/contracts
./generate_vanity_1776.sh mainnet start
```

**What it does:** Generates a CREATE2 proxy address starting with `0x1776...`

**Output:** Address and salt printed to console + saved to `vanity_address_1776.txt`

---

## Documentation Files

### 1. **VANITY_ADDRESS_GENERATION.md** 📘
**Purpose:** Complete guide to vanity address generation  
**Read this:** For comprehensive understanding of CREATE2, security, troubleshooting  
**Sections:**
- How it works (CREATE2 explanation)
- Script usage and parameters
- Performance metrics
- Security considerations
- Integration with deployment
- Troubleshooting guide

### 2. **VANITY_QUICK_START.md** ⚡
**Purpose:** Quick reference card  
**Read this:** For fast lookup of commands and syntax  
**Contains:**
- Command examples
- Expected output
- Next steps after generation

### 3. **README.md** 📖
**Purpose:** Main contracts directory README  
**Read this:** For overview of entire contracts directory  
**Updated with:** Link to vanity address generation section

### 4. **.cursorrules** 🤖
**Purpose:** Cursor-specific configuration  
**Read this:** Automatically loaded by Cursor IDE  
**Contains:**
- Project context
- Common tasks
- Environment variables
- Code style guidelines

### 5. **generate_vanity_1776.sh** 📜
**Purpose:** Main vanity address generation script  
**Read this:** Extensive inline comments and documentation headers  
**Special section:** AI Assistant Instructions at top of file

---

## Quick Command Reference

### Generate Vanity Address
```bash
# Start with 0x1776...
./generate_vanity_1776.sh mainnet start

# End with ...1776
./generate_vanity_1776.sh mainnet end

# Use defaults (mainnet, start)
./generate_vanity_1776.sh
```

### View Results
```bash
# View generated address details
cat vanity_address_1776.txt

# View script help
./generate_vanity_1776.sh --help
```

### Deploy with Vanity Address
```bash
# Add salt to .env
echo "CREATE2_SALT=0x..." >> .env

# Deploy (implementation depends on your deployment script)
./deploy.sh mainnet
```

---

## File Locations

All files in: `/home/colinbellmore/Documents/mikes-website/contracts/`

```
contracts/
├── generate_vanity_1776.sh          # Main script
├── generate_vanity_create2.sh       # Alternative script
├── generate_vanity_proxy.sh         # Fallback script
├── VANITY_ADDRESS_GENERATION.md     # Full guide
├── VANITY_QUICK_START.md           # Quick reference
├── AI_DOCUMENTATION_INDEX.md        # This file
├── .cursorrules                     # Cursor config
└── vanity_address_1776.txt         # Generated output (created after run)
```

---

## For AI Assistants: Response Templates

### When User Asks: "Generate a vanity address"

```
I'll generate a vanity address starting with 0x1776 for you.

[Run: ./generate_vanity_1776.sh mainnet start]

✅ Generated vanity address:
   Address: 0x1776...
   Salt: 0x...

The details have been saved to vanity_address_1776.txt.

Would you like me to:
1. Generate another with a different pattern?
2. Help you integrate this into your deployment?
3. Add the salt to your .env file?
```

### When User Asks: "How do I use the vanity address?"

```
To use the generated vanity address:

1. Save the salt to your .env file:
   CREATE2_SALT=0x[the_generated_salt]

2. Modify your deployment to use CREATE2 with this salt

3. The contract will deploy to the vanity address deterministically

See VANITY_ADDRESS_GENERATION.md for detailed integration steps.
```

### When User Reports an Error

```
Let me check the error. Common issues:

1. Missing Foundry: Install with `curl -L https://foundry.paradigm.xyz | bash && foundryup`
2. Wrong directory: Make sure you're in the contracts/ directory
3. Permission error: Run `chmod +x generate_vanity_1776.sh`

See VANITY_ADDRESS_GENERATION.md > Troubleshooting section for more help.
```

---

## Testing Status

✅ **Tested and Working** (as of 2025-11-02)

**Test Results:**
- ✅ Starting with 1776: Generated in 19ms
  - Address: `0x1776f2fcA2854C511Db2948BF306473d4CAc3a22`
- ✅ Ending with 1776: Generated in 20ms  
  - Address: `0x59Fd7Ea20648a9dF6a4CF21770c6CA520D941776`

**Platform:** Linux (Ubuntu/Debian)  
**Foundry:** Nightly build (working)  
**Performance:** Excellent (~20ms avg)

---

## Integration Points

### With deploy.sh
The vanity address can be used by:
1. Generating salt with `generate_vanity_1776.sh`
2. Adding salt to `.env` as `CREATE2_SALT`
3. Modifying deployment to use CREATE2 factory
4. Deploying with the salt to get vanity address

### With upgrade.sh
Not applicable - vanity addresses are for initial deployment only

### With other scripts
The generated address can be used as `PROXY_ADDRESS` in any script that references the proxy

---

## Additional Resources

### External Documentation
- [EIP-1014: CREATE2](https://eips.ethereum.org/EIPS/eip-1014)
- [Foundry Book - CREATE2](https://book.getfoundry.sh/reference/forge/forge-create#create2)
- [CREATE2 Factory Contract](https://etherscan.io/address/0x4e59b44847b379578588920cA78FbF26c0B4956C)

### Internal Documentation
- `DEPLOY_README.md` - Deployment guide
- `UPGRADE_README.md` - Upgrade guide
- `README.md` - Main contracts README

---

## Maintenance Notes

### Last Updated
2025-11-02

### Version
1.0.0

### Contributors
- Script created and tested successfully
- Documentation comprehensive
- AI assistant instructions included

### Future Enhancements
- [ ] Support for other patterns (e.g., 0xDEAD, 0xBEEF)
- [ ] Integration directly into deploy.sh
- [ ] GUI/Web interface for generation
- [ ] Support for longer patterns (more hex digits)

---

## Contact & Support

For issues or questions:
1. Check troubleshooting in VANITY_ADDRESS_GENERATION.md
2. Verify Foundry installation: `cast --version`
3. Review error messages in console output
4. Check that you're in the correct directory

---

**End of AI Documentation Index**
