import React from "react";
import { WalletConnect } from "./WalletConnect";
import { NetworkSelector } from "./NetworkSelector";
import { getAccount } from "@wagmi/core";
import { config } from "../wagmi";

export const Header: React.FC = () => {
  const account = getAccount(config);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">VMF Staking</h1>
          </div>
          <div className="flex items-center space-x-4">
            {account.address && <NetworkSelector />}
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
};
