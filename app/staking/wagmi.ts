import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

// Get WalletConnect Project ID from environment variable
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "b1647c589ac18a28722c490d2f840895";

export const config = createConfig(
  getDefaultConfig({
    // Your dApp's info
    appName: "VMF Staking DApp",
    appDescription: "VMF Token Staking Platform",

    // WalletConnect configuration
    walletConnectProjectId,

    // Chains configuration - using Base mainnet instead of testnet
    chains: [base],
    transports: {
      [base.id]: http("https://mainnet.base.org"),
    },
  })
);
