# Uniswap v4 Pool Deployment and Hook Integration

## Overview
This project initially automated the deployment of Uniswap v4 pools on Base mainnet for a set of charity addresses, using a custom USDCForwardingHook contract. However, the current goal is to enable sell orders for VMF without requiring USDC liquidity or pool creation. The workflow is being updated to focus on direct sell orders, so users do not need to supply USDC.

## Steps Performed
1. **Environment Setup**
   - Loads environment variables from `.env`.
   - Builds contracts using Foundry (`forge build`).

2. **Hook Deployment**
   - For each charity address, deploys a `USDCForwardingHook` contract with the charity and USDC addresses as constructor arguments.

3. **Sell Order Workflow (Preferred)**
   - Instead of creating pools and supplying USDC, the preferred workflow is to create sell orders for VMF directly against a known pool or contract, without needing to provide USDC liquidity.
   - This avoids the need to fund pools and allows users to sell VMF for USDC as needed.

## Next Steps
- To create sell orders for VMF, interact with the relevant contract or pool using its swap function (e.g., via `cast send`).
- You do not need to supply USDC or create a new pool for this workflow—just use the existing pool address if available.
- Hooks will process tokens during swaps according to their logic.

## Notes
- Pool addresses are printed during deployment for reference, but pool creation is not required for direct sell orders.
- The script is located at `contracts/deploy_forwarder_and_uniswapv4.sh` (legacy pool deployment).
- For direct sell orders, focus on swap interactions and avoid pool creation/liquidity provision.

---

For future agents: This file summarizes the deployment and setup process. To continue, use the known pool addresses and interact with the pool contracts for swaps/sell orders.
