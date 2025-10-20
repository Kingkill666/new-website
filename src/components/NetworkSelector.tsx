import React from "react";
import { useChainId } from "wagmi";
import { baseSepolia } from "wagmi/chains";

export const NetworkSelector: React.FC = () => {
  const chainId = useChainId();

  const getChainName = () => {
    if (chainId === baseSepolia.id) return "Base Sepolia";
    return "Unsupported Network";
  };

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-md">
      <div
        className={`w-2 h-2 rounded-full ${
          chainId === baseSepolia.id ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-sm font-medium text-gray-700">
        {getChainName()}
      </span>
    </div>
  );
};
