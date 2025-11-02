# VMF Project - Quick Task Reference

**For Cursor AI Assistant**

This file provides quick task breakdowns for each phase. Reference `project_plan.md` for full details.

---

## 🎯 Current Focus: Phase 0 - Testing Infrastructure

### Immediate Next Tasks (Priority Order)

#### 1. Setup Vercel Preview Environment
**Assignee:** AI Assistant / Developer  
**Estimated Time:** 2-3 hours

**Steps:**
```bash
# 1. Configure Vercel project settings
# - Enable preview deployments in Vercel dashboard
# - Add Base Sepolia RPC URL to environment variables
# - Add Sepolia contract addresses

# 2. Update vercel.json
# - Add preview-specific build settings
# - Configure environment variable overrides

# 3. Test preview deployment
# - Create test PR
# - Verify preview URL generation
# - Test functionality on preview

# 4. Document access
# - Add preview URL pattern to README
# - Document env var requirements
```

**Files to modify:**
- `vercel.json`
- `.env.example`
- `README.md`

**Success criteria:**
- [ ] Preview deploys automatically on PR
- [ ] Sepolia contract address used in preview
- [ ] Environment variables properly loaded

---

#### 2. Deploy VMF to Base Sepolia
**Assignee:** AI Assistant / Developer  
**Estimated Time:** 1 hour

**Steps:**
```bash
# 1. Setup Sepolia environment
cd contracts
cp .env.example .env
# Add BASE_SEPOLIA_RPC_URL and PRIVATE_KEY

# 2. Deploy to Sepolia
./deploy.sh sepolia

# 3. Verify deployment
# - Check BaseScan Sepolia
# - Test proxy functions
# - Document address

# 4. Update frontend config
# Add Sepolia contract address to config
```

**Files to modify:**
- `contracts/.env`
- `config/index.tsx`
- `contracts/DEPLOYMENT.md`

**Success criteria:**
- [ ] Contract deployed to Sepolia
- [ ] Verified on BaseScan Sepolia
- [ ] Address documented

---

#### 3. Setup E2E Tests with Playwright
**Assignee:** AI Assistant / Developer  
**Estimated Time:** 4-6 hours

**Steps:**
```bash
# 1. Install Playwright
pnpm add -D @playwright/test

# 2. Initialize Playwright
npx playwright install

# 3. Create test structure
mkdir -p tests/e2e
touch tests/e2e/wallet-connection.spec.ts
touch tests/e2e/buy-vmf.spec.ts
touch tests/e2e/trading-chart.spec.ts

# 4. Configure Playwright
touch playwright.config.ts

# 5. Write core tests
# - Wallet connection flow
# - Buy VMF modal interaction
# - Token balance display
# - Chart rendering

# 6. Run tests locally
npx playwright test

# 7. Setup in CI/CD
# Create .github/workflows/e2e-tests.yml
```

**Files to create:**
- `tests/e2e/wallet-connection.spec.ts`
- `tests/e2e/buy-vmf.spec.ts`
- `tests/e2e/trading-chart.spec.ts`
- `tests/e2e/staking.spec.ts`
- `.github/workflows/e2e-tests.yml`

**Success criteria:**
- [ ] Playwright configured
- [ ] 5+ E2E tests written
- [ ] All tests passing locally
- [ ] Tests run in CI/CD

---

#### 4. Expand Solidity Contract Tests
**Assignee:** AI Assistant / Developer  
**Estimated Time:** 4-6 hours

**Steps:**
```bash
cd contracts

# 1. Review existing tests
ls -la test/

# 2. Add regression tests
# Create test files for:
# - Oracle price calculation
# - Charity donations
# - Holder migration
# - Proxy upgrades

# 3. Write test cases
forge test -vvv

# 4. Add fuzzing tests
# For critical functions

# 5. Check coverage
forge coverage

# Target: 80%+ coverage

# 6. Document test scenarios
```

**Test files to create/expand:**
- `contracts/test/VMF.t.sol` (expand)
- `contracts/test/Oracle.t.sol` (new)
- `contracts/test/Migration.t.sol` (new)
- `contracts/test/Charity.t.sol` (new)
- `contracts/test/fuzz/` (new directory)

**Success criteria:**
- [ ] 80%+ test coverage
- [ ] Regression tests for known issues
- [ ] Fuzzing tests added
- [ ] All tests passing

---

## 🔜 Phase 1: Vanity Address & Deployment

### Task 1.1: Generate Vanity Address ✅ COMPLETE
**Status:** ✅ Done  
**Result:** 
- Start: `0x1776f2fcA2854C511Db2948BF306473d4CAc3a22`
- End: `0x59Fd7Ea20648a9dF6a4CF21770c6CA520D941776`

---

### Task 1.2: Test CREATE2 Deployment on Sepolia
**Estimated Time:** 1-2 hours

**Steps:**
```bash
cd contracts

# 1. Add CREATE2 salt to .env
echo "CREATE2_SALT=0xedd7a89b15c498ae9ef154ae6903221d600dcd738586d6ede86b771c0930a02b" >> .env

# 2. Modify deploy.sh to use CREATE2
# (May need to update deployment script)

# 3. Test on Sepolia
./deploy.sh sepolia

# 4. Verify address matches predicted
# Should be: 0x1776f2fcA2854C511Db2948BF306473d4CAc3a22

# 5. Test all proxy functions
cast call <address> "..." --rpc-url $BASE_SEPOLIA_RPC_URL
```

**Success criteria:**
- [ ] Deployed to predicted vanity address on Sepolia
- [ ] All functions working
- [ ] Proxy upgrade works

---

### Task 1.3: Deploy to Base Mainnet
**Estimated Time:** 2-3 hours  
**⚠️ CAUTION: Real money, double-check everything**

**Pre-deployment checklist:**
- [ ] All Sepolia tests passed
- [ ] Sufficient ETH for gas
- [ ] .env configured correctly
- [ ] CREATE2 salt verified
- [ ] Deployment script reviewed
- [ ] Backup plan documented

**Steps:**
```bash
cd contracts

# 1. Final verification
./generate_vanity_1776.sh mainnet start
# Confirm salt and address

# 2. Deploy to mainnet
./deploy.sh mainnet

# 3. Verify immediately
# Check BaseScan and Blockscout

# 4. Test basic functions
# - Check owner
# - Test proxy
# - Verify implementation

# 5. Update frontend
# Update contract address in config

# 6. Announce to community
```

**Success criteria:**
- [ ] Deployed to 0x1776... address
- [ ] Verified on BaseScan
- [ ] All admin functions work
- [ ] Frontend updated

---

## 📤 Phase 2: Holder Migration

### Task 2.1: Export Holder Data
**Estimated Time:** 2-3 hours

**Steps:**
```bash
cd contracts

# 1. Use existing export script
./fetch-all-holders.sh

# 2. Review exported data
cat export-tokenholders-for-contract-0x2213414893259b0c48066acd1763e7fba97859e5.csv

# 3. Validate data
# - Check total supply
# - Verify holder count
# - Identify any anomalies

# 4. Create snapshot at specific block
# Document block number and timestamp

# 5. Save validated data
cp holders.json holders_snapshot_$(date +%Y%m%d).json
```

**Success criteria:**
- [ ] All holders exported
- [ ] Data validated
- [ ] Snapshot created with block number
- [ ] Total supply matches

---

### Task 2.2: Test Airdrop on Sepolia
**Estimated Time:** 3-4 hours

**Steps:**
```bash
cd contracts

# 1. Create test holder list
# Use 10-20 test addresses

# 2. Review migrate-holders.sh
cat migrate-holders.sh

# 3. Test migration script
./migrate-holders.sh sepolia test_holders.json

# 4. Verify results
# - Check all addresses received tokens
# - Verify balances correct
# - Check gas costs

# 5. Test edge cases
# - Contract addresses
# - Zero balance addresses
# - Maximum batch size
```

**Success criteria:**
- [ ] Test migration successful
- [ ] Gas costs calculated
- [ ] Edge cases handled
- [ ] Script optimized

---

### Task 2.3: Execute Mainnet Airdrop
**Estimated Time:** 4-6 hours  
**⚠️ CRITICAL: Triple-check everything**

**Pre-execution checklist:**
- [ ] Holder data validated
- [ ] Test airdrop successful on Sepolia
- [ ] Gas prices reasonable
- [ ] Sufficient ETH for all airdrops
- [ ] Community notified
- [ ] Rollback plan documented

**Steps:**
```bash
cd contracts

# 1. Final holder validation
# Review snapshot one more time

# 2. Execute in batches
./migrate-holders.sh mainnet holders_snapshot.json

# 3. Monitor progress
# Watch for failed transactions

# 4. Handle failures
# Retry individually if needed

# 5. Verify completion
# Check all holders received tokens

# 6. Announce completion
```

**Success criteria:**
- [ ] 100% of holders migrated
- [ ] No balance discrepancies
- [ ] <1% failed transactions
- [ ] Community informed

---

## 💧 Phase 3: Liquidity & Oracle

### Task 3.1: Deploy Oracle
**Estimated Time:** 2-3 hours

**Steps:**
```bash
cd contracts

# 1. Review oracle contracts
cat src/SushiswapOracle.sol

# 2. Test on Sepolia
./deploy_sushiswap_oracle.sh sepolia

# 3. Deploy to mainnet
./deploy_sushiswap_oracle.sh mainnet

# 4. Verify oracle
# Check price feeds

# 5. Document address
```

**Success criteria:**
- [ ] Oracle deployed
- [ ] Price feeds accurate
- [ ] Security parameters set

---

### Task 3.2: Create SushiSwap LP
**Estimated Time:** 2-3 hours

**Steps:**
```bash
# 1. Calculate initial liquidity
# Determine VMF amount and ETH amount

# 2. Approve tokens
# Approve VMF and ETH for SushiSwap router

# 3. Create LP
# Use SushiSwap interface or script

# 4. Add liquidity
# Execute transaction

# 5. Lock LP tokens (if required)

# 6. Document LP address
```

**Success criteria:**
- [ ] LP created successfully
- [ ] Initial liquidity added
- [ ] LP address documented

---

## 🧪 Phase 4: Manual Testing

### Task 4.1: Create Test Plan
**Estimated Time:** 4-6 hours

**Steps:**
```bash
# 1. Create test documentation
touch MANUAL_TESTING_GUIDE.md
touch TEST_CASES.md

# 2. Document all test scenarios
# List every feature and edge case

# 3. Create test templates
# For bug reports and test results

# 4. Setup test environment
# List required accounts, tokens, etc.
```

**Success criteria:**
- [ ] Comprehensive test cases documented
- [ ] Test templates created
- [ ] Test environment ready

---

### Task 4.2: Execute Manual Tests
**Estimated Time:** 6-8 hours

**Steps:**
```bash
# 1. Test all major features
# - Wallet connection
# - Token display
# - Buy VMF
# - Trading chart
# - Staking
# - Social links

# 2. Test on all browsers
# - Chrome, Firefox, Safari, Edge
# - Mobile browsers

# 3. Document results
# Use test result templates

# 4. File bug reports
# For any issues found

# 5. Retest after fixes
```

**Success criteria:**
- [ ] All features tested
- [ ] All browsers tested
- [ ] Bugs documented and fixed
- [ ] Regression tests passed

---

## 🤖 Quick Commands for AI Assistants

```bash
# View current phase
cat .cursor/tasks.md | grep "Current Focus"

# List immediate next tasks
cat .cursor/tasks.md | grep -A 20 "Immediate Next Tasks"

# Check Phase 0 status
grep "\[ \]" .cursor/tasks.md | grep -A 1 "Phase 0"

# Mark task complete (manually edit and change [ ] to [x])
```

---

## 📋 Daily Standup Template

**What was completed yesterday:**
- [ ] Task 1
- [ ] Task 2

**What will be done today:**
- [ ] Task 3
- [ ] Task 4

**Blockers:**
- None / List blockers

---

**Last Updated:** 2025-11-02  
**Next Task:** Setup Vercel Preview Environment
