# VMF Wallet & Purchase Flow — **AI Memory Spec** (DO NOT CHANGE UI)

> **Purpose:** Lock the intended wallet connection + transaction flow for “Buy VMF” without changing any existing UI *except* the **first connect wallet modal** (we remove it and use **Reown WalletKit** instead).
> Everything else—Amount, Donate, Verify, Success—**must look identical** to the current UI.

---

## 0) Ground Rules

* **Do not change** any UI or copy for these modals:
  **Amount → Donate → Verify VMF Purchase → Success**
* Only change the **first step**: when a user clicks **BUY VMF**, open **Reown WalletKit** directly (no custom “Connect Your Wallet” first modal).
* **Chain:** Base **mainnet** only (`chainId = 8453`).
* **Payment token:** USDC (Base canonical) — `0x833589fCD6EDb6E08f4c7C32D4f71B54Bda02913`
* **Token received:** VMF — `0xa3e82aDf6bD3207a1D2470ed7Ad742596Ee81776`
* **Wallet options (Reown WalletKit):** Coinbase (Base), MetaMask, Farcaster, Rainbow, Other WalletConnect.
* After wallet connection, immediately open the **Amount** modal, then continue unchanged.

---

## 1) High-Level User Journey

1. **BUY VMF click** ➞ **Reown WalletKit pops**

   * Base network preselected.
   * Wallets: Coinbase (Base), MetaMask, Farcaster, Rainbow, Other.
   * User signs connection.

2. **Connected** ➞ show **Amount** modal (unchanged UI)

   * User inputs donation amount ($USDC).

3. **Continue** ➞ show **Donate** modal (unchanged UI)

   * User selects 1–3 charities.
   * If 2–3 chosen, donation is evenly split.

4. **Continue** ➞ show **Verify VMF Purchase** modal (unchanged UI)

   * Network: Base.
   * Payment: USDC.
   * Contract: VMF `0xa3e82aDf6bD3207a1D2470ed7Ad742596Ee81776`
   * 1 confirmation → batch USDC to charities.
   * 1 confirmation → receive VMF.
   * (Two confirmations total.)

5. **Confirm** ➞ Success modal appears (unchanged UI)

---

## 2) State Machine

```
IDLE
 └── on CLICK_BUY → OPEN_WALLETKIT

OPEN_WALLETKIT
 ├── restrict to chainId=8453
 ├── wallets: Coinbase, MetaMask, Farcaster, Rainbow, Others
 ├── on CONNECT_SUCCESS(address, chainId=8453) → AMOUNT_MODAL
 └── on CLOSE / FAIL → IDLE

AMOUNT_MODAL
 ├── user enters donationUsd
 ├── on CONTINUE → DONATE_MODAL
 └── on CANCEL → IDLE

DONATE_MODAL
 ├── user selects 1–3 charities
 ├── compute equal split
 ├── on CONTINUE → VERIFY_MODAL
 └── on BACK → AMOUNT_MODAL

VERIFY_MODAL
 ├── show Base + USDC + VMF + charities
 ├── on CONFIRM → TX_SEQUENCE
 └── on BACK → DONATE_MODAL

TX_SEQUENCE
 ├── Step 1: batch transfer USDC to charities
 ├── Step 2: send VMF to user
 ├── on SUCCESS → SUCCESS_MODAL
 └── on FAIL → VERIFY_MODAL (with error)

SUCCESS_MODAL
 ├── show tx hashes
 └── on CLOSE → IDLE
```

---

## 3) Technical Requirements

### 3.1 Reown WalletKit

* Trigger WalletKit immediately on **BUY VMF**.
* Force **Base chain** (8453).
* Wallets shown: Coinbase (Base), MetaMask, Farcaster, Rainbow, Others.
* On connect → skip old connect modal, open Amount modal.

### 3.2 Oracle Display (unchanged)

* Keep “Current VMF Price” and update intervals.
* Keep “1:1 Default” or “SushiSwap V3 Oracle” depending on mode.

### 3.3 Charity Logic (unchanged)

* 1–3 max.
* Equal split when multiple selected.

### 3.4 Transaction Model (two confirmations total)

1. **USDC batch transfer** (1 tx):

   * Transfer to 1–3 charities.
   * One confirmation only.
2. **VMF delivery** (1 tx):

   * Mint or transfer to buyer.
   * One confirmation only.

> Total: **2 wallet confirmations only.**

---

## 4) Data & Math

| Token | Address                                      | Decimals |
| ----- | -------------------------------------------- | -------- |
| USDC  | `0x833589fCD6EDb6E08f4c7C32D4f71B54Bda02913` | 6        |
| VMF   | `0xa3e82aDf6bD3207a1D2470ed7Ad742596Ee81776` | 18       |

**Splits:**

* 1 charity → 100%
* 2 charities → 50/50
* 3 charities → 33.3333% each
  (remainder goes to first charity)

**VMF received:**
`vmfOut = donationUsd / oraclePrice`
or 1:1 if fixed mode.

---

## 5) Contracts & ENV Variables

```
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_USDC=0x833589fCD6EDb6E08f4c7C32D4f71B54Bda02913
NEXT_PUBLIC_VMF_TOKEN=0xa3e82aDf6bD3207a1D2470ed7Ad742596Ee81776
NEXT_PUBLIC_BATCH_TRANSFER=0x...(if used)
NEXT_PUBLIC_VMF_DISTRIBUTOR=0x...(if used)
NEXT_PUBLIC_BASE_RPC=https://...
```

---

## 6) Analytics / Telemetry Events

* `walletkit_opened`
* `wallet_connected`
* `amount_entered`
* `charities_selected`
* `verify_shown`
* `tx_usdc_batch_submitted`
* `tx_usdc_batch_confirmed`
* `tx_vmf_delivery_submitted`
* `tx_vmf_delivery_confirmed`
* `purchase_success`

---

## 7) QA Checklist

✅ BUY VMF opens **Reown WalletKit**, no old modal
✅ Base-only enforced (chainId=8453)
✅ Amount / Donate / Verify / Success unchanged visually
✅ Two confirmations total (USDC batch → VMF delivery)
✅ Batch handles up to 3 charities
✅ Errors resurface properly
✅ Success shows tx hashes

---

## 8) Shared Data Contracts

* **Charity addresses** loaded from `charities.json` (frontend or backend).
* **BatchTransfer** emits `DonationBatchCompleted(charities[], amounts[])`.
* **VMF delivery** emits `VMFDelivered(to, amount, txHash)`.

---

## 9) Summary

| Step | User Action    | Backend Action         | Tx Count | Notes           |
| ---- | -------------- | ---------------------- | -------- | --------------- |
| 1    | Click BUY VMF  | Opens Reown WalletKit  | 0        | Base only       |
| 2    | Connect Wallet | Connection signed      | 0        | no custom modal |
| 3    | Enter Amount   | Oracle fetch or static | 0        | UI unchanged    |
| 4    | Pick Charities | Compute split          | 0        | UI unchanged    |
| 5    | Confirm        | Batch USDC + VMF       | 2        | Main logic      |
| 6    | Success        | Show results           | 0        | End flow        |

---

### ✅ Final Summary

* **Chain:** Base (8453)
* **Payment token:** USDC (`0x833589fC...2913`)
* **Token received:** VMF (`0xa3e82aDf6bD3207a1D2470ed7Ad742596Ee81776`)
* **Wallet UI:** Reown WalletKit only
* **Modals unchanged:** Amount → Donate → Verify → Success
* **Confirmations:** Exactly two (batch USDC + VMF delivery)
* **UI styling:** identical to current production design

---
