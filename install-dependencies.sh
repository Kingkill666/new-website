#!/bin/bash

echo "Installing simplified wallet dependencies..."

# Remove problematic packages first
npm uninstall @solana/wallet-adapter-base @solana/wallet-adapter-phantom @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js @safe-global/safe-apps-sdk

# Install core wagmi and wallet dependencies
npm install @coinbase/wallet-sdk@^3.9.3
npm install @tanstack/react-query@^5.28.9
npm install @wagmi/core@^2.6.17
npm install ethers@^6.13.2
npm install viem@^2.9.20
npm install wagmi@^2.5.20

echo "Simplified wallet dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env.local"
echo "2. Add your NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID (optional)"
echo "3. Run 'npm run dev' to start the development server"
echo ""
echo "Note: Phantom wallet support is simplified to avoid EventEmitter2 conflicts"
