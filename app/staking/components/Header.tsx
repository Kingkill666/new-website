"use client"

import React from "react";
import { WalletConnect } from "./WalletConnect";
import { NetworkSelector } from "./NetworkSelector";
import { getAccount } from "@wagmi/core";
import { config } from "../wagmi";
import Link from "next/link";

export const Header: React.FC = () => {
  const account = getAccount(config);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                src="/images/vmf-logo-new.png"
                alt="VMF Logo"
                className="w-8 h-8 mr-3"
              />
              <h1 className="text-xl font-bold text-gray-900">VMF Staking</h1>
            </Link>
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
