# Wallet Flow Replacement Plan

> **Status**: Planning only — no code has been changed.  
> **Goal**: Capture everything we need to remember while we design a brand-new wallet connection flow that will eventually replace the existing implementation.

---

## 1. Why We’re Replacing the Current Flow
- The current stack mixes our own `useWallet` hook, custom `WalletConnector`, and Reown/AppKit adapters. This makes the UX inconsistent across the Buy VMF modal, staking page, and any future surfaces.
- Lifecycle handling is fragile: the hook manually clears providers, listens to events, and rewrites local storage. Maintaining this alongside AppKit’s internal state machines is error‑prone.
- Coinbase Smart Wallet is bolted on in multiple places (custom buttons in `BuyVMFModal`, AppKit context, manual provider detection). We want a single orchestrator for every wallet, including MetaMask, Trust, Rainbow, etc.
- Mobile flows rely on bespoke deep-link instructions. We want a first-class mobile experience (QR codes, native linking, email/SMS handoff) managed by one library.
- Testing is complicated because Playwright has to look for multiple selectors (`appkit-button`, `[data-testid="wallet-button"]`, `.wallet-connect`, etc.). A consolidated flow simplifies E2E coverage.

---

## 2. Snapshot of Today’s Architecture (Keep For Reference)
| Area | File / Module | Notes |
| --- | --- | --- |
| Wallet state hook | `hooks/useWallet.ts` | Manages connection, storage, provider listeners, manual Coinbase handling. |
| UI surface | `components/wallet-connector.tsx` | Button + modal that enumerates `WALLETS` from `lib/wallet-config.ts`. |
| Buy modal | `components/buy-vmf-modal.tsx` | Duplicates wallet buttons, also calls `useAppKit` for Coinbase Smart Wallet. |
| App-wide provider | `context/index.tsx` + `config/index.tsx` | Initializes Reown AppKit + Wagmi adapter (Coinbase-only connector). Wrapped in `ContextProvider` inside `app/layout.tsx`. |
| Wallet metadata | `lib/wallet-config.ts` | Stores wallet list, connection helpers, provider selection heuristics, Base network IDs, etc. |
| Contract touchpoints | `components/buy-vmf-modal.tsx`, `app/staking/staking-content.tsx` | Both rely on `useWallet` for address/chain info and to gate actions like `switchToBaseNetwork`. |

Keep this table handy so we know exactly what needs to be removed or rewritten later.

---

## 3. Requirements For The New Flow
1. **Single Source of Truth**: One provider (likely AppKit + Wagmi) should own connection state, chain switching, and session persistence. No duplicate hooks.
2. **Composable UI**: Provide reusable primitives (e.g., `<WalletButton />`, `<WalletStatus />`, `<NetworkGuard />`) so every page can share the same UX.
3. **Mobile-First**: Native deep links, QR codes, and passkey support should be handled by the provider, not manual instructions.
4. **Network Safety**: Auto-switch to Base (mainnet + Sepolia) with clear fallbacks and user guidance.
5. **Testability**: Deterministic data-testid values for all wallet CTAs to keep Playwright specs stable.
6. **Backwards Compatibility**: During migration we may temporarily run both systems. Plan feature flags or environment toggles so we can roll out gradually.

---

## 4. Proposed Replacement Flow (High-Level)
1. **Adopt AppKit-Only Or Wagmi v2 Stack**  
   - Configure all desired wallets (Coinbase Smart Wallet, WalletConnect v2, MetaMask, Rainbow, Trust, Phantom where relevant) inside `config/index.tsx`.  
   - Remove `lib/wallet-config.ts` connection helpers once the new stack exposes equivalent APIs.

2. **Context Provider Revamp**  
   - Replace the bespoke `useWallet` hook with Wagmi/AppKit hooks (`useAccount`, `useConnect`, `useDisconnect`, `useChainId`).  
   - Create a thin wrapper hook (`useWalletBridge`) solely for formatting addresses and exposing Base-specific helpers (e.g., `ensureBase()`).

3. **Shared Wallet UI Kit**  
   - Build a `WalletCTA` component that simply calls `openAppKit()` (or Wagmi’s connect modal) and reflects connection state.  
   - Update `WalletConnector`, Buy modal, staking page, and any future surfaces to import from this kit instead of rolling their own buttons.

4. **Network Guardrail Layer**  
   - Centralize Base network enforcement (e.g., `<BaseNetworkGuard> children </BaseNetworkGuard>`).  
   - When the chain is wrong, show a consistent overlay + action to switch networks using Wagmi/AppKit’s helpers.

5. **Telemetry + Error Handling**  
   - Capture connection attempts, failures, and chain switches via a logging utility (could back into existing analytics).  
   - Surface actionable messages (e.g., “Install MetaMask” vs. generic “Connection failed”).

6. **Testing + Rollout**  
   - Add Playwright fixtures that mock the new modal or use AppKit’s testing harness.  
   - Ship behind a feature flag or environment variable, then remove legacy code once stable.

---

## 5. Migration Checklist (To Execute Later)
1. Freeze current wallet code (no more patches except critical fixes).  
2. Prototype the new AppKit-only flow in isolation (Storybook or hidden route).  
3. Replace `useWallet` consumers one-by-one (Buy modal → staking → global header).  
4. Remove obsolete modules: `lib/wallet-config.ts`, manual provider detection, local storage hacks.  
5. Update docs/tests to reflect the simplified flow.  
6. Clean up dependencies (drop unused wallets libs, tighten wagmi/appkit versions).  
7. Monitor analytics + support channels for regressions before deleting legacy feature flag.

---

## 6. Outstanding Questions
1. **Wallet Coverage**: Do we still need bespoke Farcaster / Phantom flows, or will WalletConnect/AppKit cover those?  
2. **Gas Sponsorship**: Does the new flow need to integrate Coinbase Paymaster or any other gasless provider?  
3. **Networks**: Are we staying on Base Sepolia for tests + Base mainnet in production, or do we need multi-network support?  
4. **Analytics**: Which events must we emit to measure conversion (e.g., connect started, modal closed, connect success/fail)?  
5. **Compliance**: Any regional restrictions or KYC flows tied to specific wallet types?

Document answers here as soon as decisions are made.

---

## 7. Next Steps (Action Items For Future Work)
- [ ] Finalize scope: confirm the list of wallets + chains the new flow must support.  
- [ ] Decide on implementation detail (pure AppKit modal vs. custom UI on top of Wagmi).  
- [ ] Draft wireframes for the universal wallet modal / CTA state.  
- [ ] Spike implementation in a feature branch and validate against Base testnet.  
- [ ] Update E2E tests to lock in the new selectors and behaviours.  
- [ ] Communicate rollout plan to stakeholders (founder, marketing, support).

Keep this document up to date as we answer questions and start building. Until then: **no code changes — planning only.**
