# Uniswap v4 Pool Deployment and Hook Integration

## Overview
This project now automates the following workflow for a set of charity addresses:
1. Deploys an `ERC20Forwarded` contract for each charity.
2. Funds each forwarder contract with VMF tokens from the deployer.
3. Each forwarder places a sell order for VMF against a known Uniswap v4 pool.
4. The deployed forwarder addresses are saved to `deployed_forwarders.txt` for later sweeping.

## Steps Performed
1. **Environment Setup**
   - Loads environment variables from `.env`.
   - Builds contracts using Foundry (`forge build`).

2. **Forwarder Deployment**
   - For each charity address, deploys an `ERC20Forwarded` contract with the charity address as the destination.

3. **Funding Forwarders**
   - Transfers 1000 VMF from the deployer to each deployed forwarder contract.

4. **Placing Sell Orders**
   - Each forwarder contract calls its `sellVMF` method to place a sell order for 1000 VMF against the known Uniswap v4 pool.

5. **Saving Forwarder Addresses**
   - The script saves each charity and deployed forwarder address to `deployed_forwarders.txt` for later use.

## Next Steps
- To sweep any remaining tokens from the forwarders to their charities, use the `sweep_forwarders.sh` script. This script reads `deployed_forwarders.txt` and calls `forwardAll()` on each forwarder contract.
- No need to supply USDC or create new pools; use the existing pool address for sell orders.

## Notes
- The main deployment script is `contracts/deploy_forwarder_and_uniswapv4.sh`.
- Deployed forwarder addresses are saved in `deployed_forwarders.txt` for use by the sweep script.
- The sweep script is `contracts/sweep_forwarders.sh`.
- Ensure the forwarder contract has enough ETH for gas to execute swaps and sweeps.

---

For future agents: This file summarizes the deployment and setup process. To continue, use the known pool addresses and interact with the pool contracts for swaps/sell orders.
