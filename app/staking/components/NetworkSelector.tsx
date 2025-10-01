"use client"

import React from "react";
import { useChainId } from "wagmi";
import { base } from "wagmi/chains";

export const NetworkSelector: React.FC = () => {
  const chainId = useChainId();

  const getChainName = () => {
    if (chainId === base.id) return "Base Mainnet";
    return "Unsupported Network";
  };

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-md">
      <div
        className={`w-2 h-2 rounded-full ${
          chainId === base.id ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-sm font-medium text-gray-700">
        {getChainName()}
      </span>
    </div>
  );
};
