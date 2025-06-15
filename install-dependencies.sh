#!/bin/bash

echo "Installing minimal dependencies (no wallet libraries)..."

# Remove any existing wallet dependencies
npm uninstall @coinbase/wallet-sdk @safe-global/safe-apps-sdk @solana/wallet-adapter-base @solana/wallet-adapter-phantom @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js @tanstack/react-query @wagmi/core ethers viem wagmi

echo "All wallet dependencies removed successfully!"
echo ""
echo "The app now uses native browser wallet APIs only."
echo "Run 'npm run dev' to start the development server"
