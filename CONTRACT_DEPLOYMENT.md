# VMF — Deployment & Management Guide

This document explains how to deploy, upgrade, and operate the VMF contract in this repository. It's written for future maintainers or automated agents that will perform deployments and maintenance tasks using Foundry (forge) and the in-repo Solady utilities.

## Quick summary
- Contract: `contracts/src/VMF.sol` — Solady `ERC20` with UUPS upgradeability (`Initializable`, `UUPSUpgradeable`) and extra features: supply `cap`, donation handling via `handleUSDC`/`handleUSDCBatch`.
- Initializer: `initialize(address _usdc, address initialOwner, uint256 initialCap)`
- Access control: Solady `OwnableRoles` with role constants exposed in the contract (e.g. `ADMIN_ROLE()` returns the ROLE_ADMIN constant).

## Pre-flight checks
1. Run unit tests locally and fix any failures before deploying:

```bash
cd contracts
forge test -v
```

2. Confirm the intended USDC address and charity/team addresses are correct for the target network.
3. Ensure the deployer private key is available in an environment variable `PRIVATE_KEY` (used by the provided Foundry scripts).

## Environment variables used by repository scripts
- `PRIVATE_KEY` - EOA private key used for broadcast (foundry `vm` usage in scripts)
- `USDC_ADDRESS` - USDC token contract address used by VMF
- `OLD_VMF_ADDRESS` - optional old contract used by migration scripts

## Deploy options

There are two common approaches included in the repo:

A) Direct deployment of the implementation (no proxy). Good for development or if you don't want upgradeability.

- Script: `contracts/script/DirectDeploy.s.sol`
- Example: using Foundry to deploy directly (this script uses `vm` environment variables):

```bash
# from repo root
cd contracts
forge script script/DirectDeploy.s.sol:DirectDeployScript --broadcast --private-key $PRIVATE_KEY --rpc-url $RPC_URL
```

This will deploy the `VMF` contract and call `initialize(...)` on it (the script calls `vmf.initialize(...)` for direct deployments).

B) Deploy upgradeable (recommended if you want to support later upgrades)

- The repo includes usage of `LibClone.deployERC1967` (Solady) in tests and scripts to create an ERC-1967 proxy pointing to an implementation. The pattern is:
  1. Deploy implementation contract (VMF implementation).
  2. Build initializer calldata: `abi.encodeWithSelector(VMF.initialize.selector, usdc, owner, initialCap)`.
  3. Use `LibClone.deployERC1967(implementationAddress, initData)` to deploy a proxy that will call the initializer during deployment.

Example (foundry-style script or off-chain):

```js
// Pseudocode used by tests/scripts
VMF impl = new VMF();
bytes memory initData = abi.encodeWithSelector(
    VMF.initialize.selector,
    address(usdc),
    owner,
    initialCap
);
address proxy = LibClone.deployERC1967(address(impl), initData);
VMF vmf = VMF(proxy);

// If the deploy helper didn't call initialize for some reason, it's safe to try again:
try vmf.initialize(address(usdc), owner, initialCap) { } catch { }
```

## Initializer arguments explained
- `_usdc` (address): ERC20 USDC address used to accept donations.
- `initialOwner` (address): owner (and initial `minter`) for the contract.
- `initialCap` (uint256): initial total supply cap in 18 decimals; set `0` to disable cap.

## Basic operational commands (on-chain calls)

All calls below are executed as the admin/owner unless noted.

- Grant roles: `vmf.grantRoles(address user, uint256 roles)`
- Revoke roles: `vmf.revokeRoles(address user, uint256 roles)`
- Set supply cap: `vmf.setCap(uint256 newCap)` — `newCap == 0 || newCap >= totalSupply()`
- Mint: `vmf.mint(address to, uint256 amount)` (only minter or owner)
- Mint and send: `vmf.mintAndSend(address to, uint256 amount, address sendTo)`
- Add/remove allowed receivers (charities): `vmf.addAllowedReceivers(payable addr)` / `vmf.removeAllowedReceivers(payable addr)` (ROLE_SET_CHARITY | ROLE_ADMIN)
- Update donation pool: `vmf.updateDonationPool(uint256)` and `vmf.updateDonationMultipleBps(uint256)`
- Treasury payouts: `vmf.pay(address to, uint256 amount)` (ROLE_ADMIN)
- Set price oracle: `vmf.setPriceOracle(address)` (ROLE_ADMIN)

Important: role-restricted functions use Solady `OwnableRoles` semantics. Use `vmf.ADMIN_ROLE()` (or the constants in the contract) when granting roles.


## Upgrade process (UUPS)

1. Prepare and audit the new implementation contract (same ABI where possible; don't remove storage variables).
2. Compile and deploy the new implementation contract (non-proxy) on target network.
3. From the owner (or someone with the upgrade authority per `_authorizeUpgrade`), call `vmf.upgradeTo(newImplementationAddress)` on the proxy (the proxy delegates to the implementation and executes the UUPS upgrade). Example:

```js
// From owner EOA
VMF vmf = VMF(proxyAddress);
vmf.upgradeTo(newImplAddress);
```

4. Verify new behavior, run full test suite on a staging network, and perform post-upgrade checks.

Notes:
- `_authorizeUpgrade` checks that upgrades are not disabled and that the caller is owner or has `ROLE_ADMIN`. The contract also exposes `disableUpgrades()` which is irreversible and can be called by owner only.
- Before performing an upgrade in production, ensure backups and test cases pass on a staging fork of mainnet.

## Disabling upgrades (irreversible)
- `vmf.disableUpgrades()` permanently prevents future upgrades; the function emits `UpgradesDisabled()` and sets an internal flag.
- Only the owner can call this function (not ROLE_ADMIN). Use with extreme caution.

## Cap behavior notes
- Cap enforcement revert message: `VMF: cap exceeded`.

## Scripts and holder lists maintenance note
- The repo contains scripts that previously had raw EIP-55 address literals which caused Solidity compilation to reject them when checksums mismatched. To avoid that, some scripts now use `address(bytes20(hex"..."))` casts or should load holders from a JSON file.
- Recommended: move large holder arrays to `scripts/data/holders.json` and update the scripts to read the JSON file at runtime (Foundry `vm.readFile(...)` or an off-chain preprocessor). This keeps script files small and easier to maintain.

## Running tests and single test files
Run the whole test suite (recommended before any deploy):

```bash
cd contracts
forge test -v
```

Run a single test file:

```bash
forge test --match-path test/VMFCapBlacklist.t.sol -v
```

Run a single test within a test file (Foundry):

```bash
forge test --match-test test_mint_respects_cap -vv
```

## Recommended pre-deploy checklist
1. All unit tests pass locally (`forge test`).
2. Run static analysis and linters if applicable (e.g., `slither`, `solhint`).
3. Run tests against a fork of mainnet with the same constructor/initializer parameters and with forked contracts (USDC) if you rely on real addresses.
4. Have at least two trusted signers review upgrade step and backup plan.

## Example (full deploy + simple post-check)

```bash
# Export required environment variables
export PRIVATE_KEY="..."
export RPC_URL="https://..."
export USDC_ADDRESS="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"  # example

# Deploy using the provided script (DirectDeploy) which calls initialize on the implementation
cd contracts
forge script script/DirectDeploy.s.sol:DirectDeployScript --broadcast --private-key $PRIVATE_KEY --rpc-url $RPC_URL

# After deploy, verify owner/minter and basic state via an interactive tool or etherscan
```

## Troubleshooting
- If `forge test` fails due to scripts with bad address literals, convert them to hex casts or move addresses to an external JSON file.
- If upgradeTo reverts: ensure caller is owner or has `ROLE_ADMIN` (per `_authorizeUpgrade`) and that upgrades are not disabled.

## Contact & follow-ups
- If you modify storage layout in upgrades, follow the standard storage compatibility rules. If in doubt, prefer adding new variables at the end of the contract storage.
- Suggestion: create a `scripts/README.md` describing how to manage the `holders.json` file and the recommended workflow for large migrations.

---
Document created automatically by the agent on Oct 28, 2025. Keep this file up to date when changing the `VMF` initializer or role semantics.
