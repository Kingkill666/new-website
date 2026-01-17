# VMF Project Roadmap & Implementation Plan

**Project:** VMF Token Migration & Launch  
**Owner:** @Kingkill666  
**Last Updated:** 2025-11-02  
**Status:** Phase 0 - Preparation

---

## 🎯 Project Overview

Migrate VMF token from legacy contract (0x22...) to new vanity address (0x1776...) on Base mainnet with comprehensive testing, LP setup, and holder migration.

---

## 📋 High-Level Phases

### Phase 0: Testing Infrastructure ✅ In Progress
Setup comprehensive end-to-end testing on Base Sepolia testnet with automated CI/CD.

### Phase 1: Vanity Address & Deployment 🔜 Next
Generate and deploy VMF to patriotic vanity address (0x1776...).

### Phase 2: Token Migration 📅 Planned
Airdrop new tokens to all legacy holders from old contract.

### Phase 3: Liquidity & Oracle 📅 Planned
Create SushiSwap LP with contract oracle for price feeds.

### Phase 4: Quality Assurance 📅 Planned
Establish manual testing procedures for VMFcoin.com frontend.

---

## 🔍 Detailed Task Breakdown

### ✅ Phase 0: Testing Infrastructure (Base Sepolia)

**Goal:** Setup robust testing pipeline before mainnet deployment

#### Subtasks:

1. **Vercel Preview Environment**
   - [ ] Configure Vercel preview deployments for PRs
   - [ ] Setup environment variables for Base Sepolia
   - [ ] Enable automatic preview URL generation
   - [ ] Document preview environment access

2. **E2E Tests on Base Sepolia**
   - [ ] Deploy VMF contract to Base Sepolia testnet
   - [ ] Configure Playwright/Cypress for E2E testing
   - [ ] Write E2E tests for core user flows:
     - [ ] Wallet connection
     - [ ] Token balance display
     - [ ] Buy VMF modal functionality
     - [ ] Trading chart integration
     - [ ] Staking interface
   - [ ] Setup GitHub Actions for automated E2E tests
   - [ ] Configure test failure notifications

3. **Solidity Contract Tests**
   - [ ] Write Foundry tests for core contract functions
   - [ ] Add regression tests for known issues:
     - [ ] Oracle price calculation
     - [ ] Charity donation mechanism
     - [ ] Holder migration logic
     - [ ] Proxy upgrade patterns
   - [ ] Setup coverage reporting (target: 80%+)
   - [ ] Add fuzzing tests for critical functions
   - [ ] Document test scenarios and edge cases

4. **CI/CD Pipeline**
   - [ ] GitHub Actions workflow for contract tests
   - [ ] GitHub Actions workflow for E2E tests
   - [ ] Automated deployment to Sepolia on push
   - [ ] Coverage reports to PR comments
   - [ ] Block merge if tests fail

**Dependencies:** None  
**Estimated Time:** 1-2 weeks  
**Priority:** HIGH  
**Status:** In Progress

**Files to Create/Modify:**
- `.github/workflows/sepolia-deploy.yml`
- `.github/workflows/e2e-tests.yml`
- `tests/e2e/` (new directory)
- `contracts/test/` (expand existing)
- `vercel.json` (update)

---

### 🎯 Phase 1: Vanity Address & Deployment (Base Mainnet)

**Goal:** Deploy VMF to memorable vanity address (0x1776...)

#### Subtasks:

1. **Generate Vanity Address** ✅ COMPLETE
   - [x] Create vanity address generation script
   - [x] Document usage for AI assistants
   - [x] Test on mainnet configuration
   - [x] Generate address starting with 0x1776

2. **Verify Vanity Address**
   - [ ] Confirm salt and address match
   - [ ] Test CREATE2 deployment on Sepolia first
   - [ ] Verify init code hash is correct
   - [ ] Document deployment parameters

3. **Mainnet Deployment**
   - [ ] Review deployment script (`deploy.sh`)
   - [ ] Add CREATE2 salt to `.env`
   - [ ] Dry run deployment on Sepolia
   - [ ] Deploy to Base mainnet with vanity address
   - [ ] Verify contract on BaseScan
   - [ ] Verify contract on Blockscout
   - [ ] Test all proxy functions post-deployment

4. **Post-Deployment Verification**
   - [ ] Confirm proxy pattern detected on explorers
   - [ ] Test upgrade mechanism
   - [ ] Verify admin roles and permissions
   - [ ] Document deployed addresses
   - [ ] Update website with new contract address

**Dependencies:** Phase 0 (recommended)  
**Estimated Time:** 2-3 days  
**Priority:** HIGH  
**Status:** Ready to start

**Files to Create/Modify:**
- `contracts/.env` (add CREATE2_SALT)
- `contracts/deployed_addresses.json` (new)
- `config/index.tsx` (update contract address)
- `DEPLOYMENT.md` (update)

**Generated Vanity Addresses:**
- Start: `0x1776f2fcA2854C511Db2948BF306473d4CAc3a22`
- End: `0x59Fd7Ea20648a9dF6a4CF21770c6CA520D941776`

---

### 📤 Phase 2: Holder Migration & Airdrop

**Goal:** Migrate all holders from legacy VMF (0x22...) to new VMF (0x1776...)

#### Subtasks:

1. **Holder Data Preparation**
   - [ ] Export all holders from legacy contract (0x22...)
   - [ ] Validate holder addresses and balances
   - [ ] Calculate total supply to migrate
   - [ ] Identify any blacklisted/excluded addresses
   - [ ] Generate migration snapshot at specific block
   - [ ] Save snapshot with block number and timestamp

2. **Airdrop Smart Contract**
   - [ ] Review existing `migrate-holders.sh` script
   - [ ] Test migration on Sepolia with sample addresses
   - [ ] Implement batch airdrop function (gas optimization)
   - [ ] Add merkle proof verification (optional)
   - [ ] Test with various holder counts
   - [ ] Calculate gas costs for full migration

3. **Airdrop Execution**
   - [ ] Announce migration to community (X, Discord)
   - [ ] Set migration deadline
   - [ ] Execute batch airdrops
   - [ ] Monitor for failed transactions
   - [ ] Retry failed airdrops
   - [ ] Verify all holders received tokens
   - [ ] Handle edge cases (contracts, etc.)

4. **Migration Verification**
   - [ ] Compare old vs new holder balances
   - [ ] Verify total supply matches
   - [ ] Check for any missed holders
   - [ ] Update holder list on website
   - [ ] Announce completion to community

**Dependencies:** Phase 1 (must be complete)  
**Estimated Time:** 1 week  
**Priority:** HIGH  
**Status:** Not started

**Files to Create/Modify:**
- `contracts/scripts/migrate_holders.ts` (new)
- `contracts/holders_snapshot.json` (new)
- `contracts/migration_results.json` (new)
- `MIGRATION_GUIDE.md` (new)

**Resources:**
- Legacy contract: `0x22...` (to be specified)
- Holder export: `contracts/export-tokenholders-for-contract-0x2213414893259b0c48066acd1763e7fba97859e5.csv`
- Migration script: `contracts/migrate-holders.sh`

---

### 💧 Phase 3: Liquidity Pool & Oracle Setup

**Goal:** Establish SushiSwap LP with reliable oracle for price feeds

#### Subtasks:

1. **Oracle Deployment**
   - [ ] Review oracle contract code
   - [ ] Test oracle on Sepolia
   - [ ] Deploy oracle to Base mainnet
   - [ ] Verify oracle contract
   - [ ] Test price feed accuracy
   - [ ] Document oracle address

2. **SushiSwap Pool Creation**
   - [ ] Determine initial liquidity amounts (VMF/ETH)
   - [ ] Calculate optimal price point
   - [ ] Approve tokens for LP
   - [ ] Create LP on SushiSwap
   - [ ] Add initial liquidity
   - [ ] Lock LP tokens (if required)
   - [ ] Document LP address and parameters

3. **Oracle Integration**
   - [ ] Connect oracle to LP
   - [ ] Configure oracle update frequency
   - [ ] Test oracle price updates
   - [ ] Verify oracle security parameters
   - [ ] Setup oracle monitoring
   - [ ] Document oracle usage

4. **LP Monitoring Setup**
   - [ ] Setup LP metrics dashboard
   - [ ] Monitor liquidity depth
   - [ ] Track price stability
   - [ ] Alert system for large swaps
   - [ ] Document LP management procedures

**Dependencies:** Phase 2 (recommended)  
**Estimated Time:** 3-5 days  
**Priority:** MEDIUM  
**Status:** Not started

**Files to Create/Modify:**
- `contracts/deploy_oracle.sh` (exists, review)
- `contracts/LP_DEPLOYMENT.md` (new)
- `contracts/oracle_config.json` (new)
- `app/api/price/` (update oracle endpoint)

**Existing Resources:**
- `contracts/deploy_sushiswap_oracle.sh`
- `contracts/SUSHISWAP_ORACLE_ANALYSIS.md`
- `contracts/SUSHISWAP_ORACLE_FIXED_SUMMARY.md`

---

### 🧪 Phase 4: Manual Testing & QA Process

**Goal:** Establish comprehensive manual testing procedures for VMFcoin.com

#### Subtasks:

1. **Test Plan Creation**
   - [ ] Define test scenarios for all features
   - [ ] Create test case templates
   - [ ] Identify critical user paths
   - [ ] Document expected vs actual results format
   - [ ] Setup test environment requirements

2. **Feature Test Cases**
   - [ ] Wallet Connection Tests
     - [ ] MetaMask connection
     - [ ] WalletConnect integration
     - [ ] Coinbase Wallet
     - [ ] Wrong network detection
     - [ ] Disconnect functionality
   - [ ] Token Display Tests
     - [ ] Balance accuracy
     - [ ] Price display
     - [ ] Market cap calculation
     - [ ] Holder count
   - [ ] Buy VMF Modal Tests
     - [ ] Modal open/close
     - [ ] Input validation
     - [ ] Slippage settings
     - [ ] Transaction confirmation
     - [ ] Error handling
   - [ ] Trading Chart Tests
     - [ ] Chart loads correctly
     - [ ] Real-time updates
     - [ ] Timeframe selection
     - [ ] Technical indicators
   - [ ] Staking Interface Tests
     - [ ] Stake functionality
     - [ ] Unstake functionality
     - [ ] Rewards calculation
     - [ ] APY display
   - [ ] Social Links Tests
     - [ ] X/Twitter feed integration
     - [ ] External links work
     - [ ] Social icons display

3. **Cross-Browser Testing**
   - [ ] Chrome (latest)
   - [ ] Firefox (latest)
   - [ ] Safari (latest)
   - [ ] Edge (latest)
   - [ ] Mobile browsers (iOS Safari, Chrome)

4. **Performance Testing**
   - [ ] Page load times
   - [ ] Transaction confirmation speed
   - [ ] API response times
   - [ ] Chart rendering performance
   - [ ] Mobile performance

5. **Test Documentation**
   - [ ] Create test execution checklist
   - [ ] Document bug reporting process
   - [ ] Setup regression test schedule
   - [ ] Create test result templates
   - [ ] Document known issues/limitations

**Dependencies:** Phase 3 (for production environment)  
**Estimated Time:** 1 week  
**Priority:** MEDIUM  
**Status:** Not started

**Files to Create:**
- `MANUAL_TESTING_GUIDE.md`
- `TEST_CASES.md`
- `test-results/manual/` (directory)
- `BUG_REPORT_TEMPLATE.md`
- `REGRESSION_TEST_CHECKLIST.md`

---

## 🗓️ Timeline & Milestones

### Week 1-2: Testing Infrastructure
- ✅ Complete Vercel preview setup
- ✅ Deploy to Base Sepolia
- ✅ Setup E2E tests
- ✅ Contract regression tests
- ✅ CI/CD pipeline

### Week 3: Deployment
- ✅ Generate vanity address
- ✅ Test on Sepolia
- ✅ Deploy to mainnet
- ✅ Verify contracts

### Week 4: Migration
- ✅ Export holder data
- ✅ Test airdrop
- ✅ Execute migration
- ✅ Verify results

### Week 5: Liquidity
- ✅ Deploy oracle
- ✅ Create LP
- ✅ Setup monitoring
- ✅ Verify integration

### Week 6: QA
- ✅ Manual testing
- ✅ Documentation
- ✅ Bug fixes
- ✅ Production ready

**Target Launch:** Mid-December 2025

---

## 🚨 Risks & Mitigation

### High Priority Risks

1. **Smart Contract Bugs**
   - Risk: Critical vulnerability in deployed contract
   - Mitigation: Extensive testing on Sepolia, audit review, bug bounty
   - Fallback: Proxy upgrade mechanism, emergency pause

2. **Migration Failures**
   - Risk: Failed airdrops, incorrect balances
   - Mitigation: Batch testing, dry runs, snapshot verification
   - Fallback: Manual recovery process, support system

3. **Oracle Manipulation**
   - Risk: Price oracle attack, incorrect prices
   - Mitigation: Multiple oracle sources, TWAP, security parameters
   - Fallback: Manual oracle override, circuit breakers

### Medium Priority Risks

4. **Gas Price Spikes**
   - Risk: High costs for migration/deployment
   - Mitigation: Monitor gas prices, schedule during low activity
   - Fallback: Batch operations, time-delay execution

5. **Low Liquidity**
   - Risk: Insufficient LP depth causes high slippage
   - Mitigation: Adequate initial liquidity, incentives
   - Fallback: Additional LP injection, trading limits

6. **Frontend Bugs**
   - Risk: Website issues prevent user access
   - Mitigation: Comprehensive testing, staged rollout
   - Fallback: Quick rollback, fallback UI

---

## 🔗 Dependencies & Prerequisites

### External Dependencies
- ✅ Foundry (installed and updated)
- ✅ Vercel account and configuration
- ✅ Base mainnet RPC access
- ✅ BaseScan API key
- [ ] Sufficient ETH for gas (mainnet)
- [ ] Sufficient ETH for testing (Sepolia)
- [ ] SushiSwap deployment addresses

### Internal Dependencies
- ✅ VMF contract code (audited)
- ✅ Proxy pattern implementation
- ✅ Website codebase
- ✅ Deployment scripts
- [ ] Holder data export
- [ ] Marketing materials

---

## 📊 Success Metrics

### Phase 0 (Testing)
- [ ] 100% of E2E tests passing
- [ ] 80%+ contract test coverage
- [ ] CI/CD pipeline <5 min execution
- [ ] Zero critical bugs in Sepolia

### Phase 1 (Deployment)
- [ ] Vanity address deployed successfully
- [ ] Contract verified on explorers
- [ ] All admin functions working
- [ ] Zero deployment issues

### Phase 2 (Migration)
- [ ] 100% of holders migrated
- [ ] Zero balance discrepancies
- [ ] <1% failed transactions
- [ ] Community satisfaction >90%

### Phase 3 (Liquidity)
- [ ] LP depth >$X (TBD)
- [ ] Oracle price <1% deviation
- [ ] Zero oracle failures
- [ ] Trading volume >$X/day

### Phase 4 (QA)
- [ ] Zero critical bugs found
- [ ] <5 medium priority bugs
- [ ] 100% test cases documented
- [ ] All major browsers supported

---

## 🤖 AI Assistant Instructions

### For Cursor/Copilot/Claude

When working on these phases:

1. **Always check this file first** to understand current phase and priorities
2. **Update status** when completing tasks (change [ ] to [x])
3. **Reference phase numbers** in commit messages and PRs
4. **Create sub-tasks** as issues/todos when breaking down work
5. **Document decisions** in relevant phase sections
6. **Update timelines** if blockers are encountered

### Quick Commands

```bash
# Check current phase status
cat .cursor/project_plan.md | grep "Status:"

# View specific phase
cat .cursor/project_plan.md | sed -n '/Phase 0:/,/^---/p'

# Update task completion
# (Manually edit file and change [ ] to [x])
```

---

## 📝 Change Log

### 2025-11-02
- Created comprehensive project plan
- Defined 6 phases with detailed subtasks
- Added vanity address generation (Phase 1.1) ✅
- Documented generated vanity addresses
- Established timeline and milestones
- Added risk assessment and mitigation strategies

---

## 📞 Contacts & Resources

**Project Lead:** @Kingkill666  
**Repository:** https://github.com/Kingkill666/new-website  
**Branch:** prod (production), main (development)

**Documentation:**
- Deployment: `contracts/DEPLOY_README.md`
- Upgrades: `contracts/UPGRADE_README.md`
- Vanity Address: `contracts/VANITY_ADDRESS_GENERATION.md`
- Testing: `TESTING.md`

**Networks:**
- Base Mainnet: Chain ID 8453
- Base Sepolia: Chain ID 84532

---

**Last Updated:** 2025-11-02  
**Next Review:** Weekly or upon phase completion
