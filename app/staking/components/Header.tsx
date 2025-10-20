import React from "react";
import { WalletConnect } from "./WalletConnect";
import { NetworkSelector } from "./NetworkSelector";
import { useAccount } from "wagmi";

export const Header: React.FC = () => {
  const { address } = useAccount();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">VMF Staking</h1>
          </div>
          <div className="flex items-center space-x-4">
            {address && <NetworkSelector />}
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
};
