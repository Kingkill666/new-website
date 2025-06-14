#!/bin/bash

# Install all wallet dependencies
npm install @coinbase/wallet-sdk@^4.0.3
npm install @rainbow-me/rainbowkit@^2.0.8
npm install @safe-global/safe-apps-sdk@^9.1.0
npm install @solana/wallet-adapter-base@^0.9.23
npm install @solana/wallet-adapter-phantom@^0.9.24
npm install @solana/wallet-adapter-react@^0.15.35
npm install @solana/wallet-adapter-react-ui@^0.9.35
npm install @solana/wallet-adapter-wallets@^0.19.32
npm install @solana/web3.js@^1.95.2
npm install @tanstack/react-query@^5.28.9
npm install @wagmi/core@^2.6.17
npm install ethers@^5.7.2
npm install viem@^2.9.20
npm install wagmi@^2.5.20

echo "All wallet dependencies installed successfully!"
echo "Run 'npm run dev' to start the development server"
