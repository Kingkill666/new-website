import { useState, useEffect } from "react";
import {
  readContract,
  simulateContract,
  writeContract,
  getAccount,
} from "@wagmi/core";
import { parseUnits } from "viem";
import {
  MOCK_TOKEN_ADDRESS,
  STAKING_CONTRACT_ADDRESS,
} from "../contracts/addresses";
import {
  MOCK_TOKEN_ABI,
  STAKING_ABI as STAKING_CONTRACT_ABI,
} from "../contracts/abis";
import { config } from "../wagmi";

// Helper function to format APR
const formatAPR = (apr: number): string => {
  if (apr < 0.01) {
    return apr.toFixed(4);
  }
  return apr.toFixed(2);
};

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  txHash: string;
  action: "mint" | "stake";
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  txHash,
  action,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {action === "mint"
              ? "Tokens Minted Successfully!"
              : "Tokens Staked Successfully!"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Your transaction has been confirmed.
          </p>
          <div className="bg-gray-50 rounded-md p-3 mb-4">
            <p className="text-xs text-gray-600 break-all">
              Transaction Hash: {txHash}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const StakingForm: React.FC = () => {
  const [mintAmount, setMintAmount] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakingPeriod, setStakingPeriod] = useState<string>("30"); // Default 30 days
  const [isMinting, setIsMinting] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [tokenBalance, setTokenBalance] = useState("0");
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    txHash: string;
    action: "mint" | "stake";
  }>({ isOpen: false, txHash: "", action: "mint" });

  const account = getAccount(config);
  const [currentAPR, setCurrentAPR] = useState<number>(7); // Start with base APR
  const BASE_APR = 7; // 7% base APR
  const APR_INCREMENT_PER_SECOND = 2.219685e-9;

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account.address) return;
      try {
        const data = await readContract(config, {
          abi: MOCK_TOKEN_ABI,
          address: MOCK_TOKEN_ADDRESS,
          functionName: "balanceOf",
          args: [account.address],
        });
        setTokenBalance((Number(data) / 1e18).toString());
      } catch (err) {
        console.error("Error fetching balance:", err);
        setTokenBalance("0");
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [account.address]);

  // Update APR every second
  useEffect(() => {
    const startTime = Date.now();
    const updateAPR = () => {
      const secondsElapsed = (Date.now() - startTime) / 1000;
      const incrementedAPR =
        BASE_APR + APR_INCREMENT_PER_SECOND * secondsElapsed;
      setCurrentAPR(incrementedAPR);
    };

    const interval = setInterval(updateAPR, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkAllowance = async (): Promise<boolean> => {
    if (!account.address) return false;
    try {
      const currentAllowance = await readContract(config, {
        address: MOCK_TOKEN_ADDRESS,
        abi: MOCK_TOKEN_ABI,
        functionName: "allowance",
        args: [account.address, STAKING_CONTRACT_ADDRESS],
      });
      return BigInt(currentAllowance) >= parseUnits(stakeAmount, 18);
    } catch (err) {
      console.error("Error checking allowance:", err);
      return false;
    }
  };

  const handleMint = async () => {
    if (!mintAmount || !account.address) return;
    setIsMinting(true);
    try {
      const { request } = await simulateContract(config, {
        address: MOCK_TOKEN_ADDRESS,
        abi: MOCK_TOKEN_ABI,
        functionName: "mint",
        args: [account.address, parseUnits(mintAmount, 18)],
      });

      const tx = await writeContract(config, request);
      setSuccessModal({
        isOpen: true,
        txHash: tx,
        action: "mint",
      });
      setMintAmount("");
    } catch (error) {
      console.error("Error minting:", error);
      alert(error instanceof Error ? error.message : "Failed to mint tokens");
    } finally {
      setIsMinting(false);
    }
  };

  const handleApprove = async (): Promise<boolean> => {
    try {
      const hasAllowance = await checkAllowance();
      if (hasAllowance) {
        console.log("Sufficient allowance exists, skipping approval");
        return true;
      }

      const { request } = await simulateContract(config, {
        address: MOCK_TOKEN_ADDRESS,
        abi: MOCK_TOKEN_ABI,
        functionName: "approve",
        args: [STAKING_CONTRACT_ADDRESS, parseUnits(stakeAmount, 18)],
      });

      const tx = await writeContract(config, request);
      console.log("Transaction hash:", tx);
      return true;
    } catch (error) {
      console.error("Error approving:", error);
      return false;
    }
  };

  const handleStake = async () => {
    if (!stakeAmount || !account.address) return;
    setIsStaking(true);

    try {
      // First handle approval if needed
      const approved = await handleApprove();
      if (!approved) {
        throw new Error("Approval failed");
      }

      // Add delay after approval to ensure transaction is processed
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay

      const stakingPeriodInSeconds =
        BigInt(stakingPeriod) * BigInt(24 * 60 * 60);
      const amountInWei = parseUnits(stakeAmount.toString(), 18);

      // First simulate to check for errors
      try {
        await simulateContract(config, {
          address: STAKING_CONTRACT_ADDRESS,
          abi: STAKING_CONTRACT_ABI,
          functionName: "stake",
          args: [amountInWei, Number(stakingPeriodInSeconds)],
        });
      } catch (error: any) {
        if (error.message.includes("VMFStaking__InvalidStakeAmount")) {
          throw new Error(
            "Invalid stake amount. Amount might be below minimum or above maximum allowed stake."
          );
        }
        throw error;
      }

      const { request } = await simulateContract(config, {
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: "stake",
        args: [amountInWei, Number(stakingPeriodInSeconds)],
      });

      const tx = await writeContract(config, request);
      setSuccessModal({
        isOpen: true,
        txHash: tx,
        action: "stake",
      });
      setStakeAmount("");
    } catch (error) {
      console.error("Error staking:", error);
      alert(error instanceof Error ? error.message : "Failed to stake tokens");
    } finally {
      setIsStaking(false);
    }
  };

  const handleStakingPeriodChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;
    setStakingPeriod(value);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        txHash={successModal.txHash}
        action={successModal.action}
      />

      {/* APR Display Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Current Staking APR</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Base APR:</span>
            <span className="font-semibold text-lg">{BASE_APR}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Current APR:</span>
            <span className="font-semibold text-lg text-green-600">
              {formatAPR(currentAPR)}%
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500 space-y-1">
            <div>
              APR increases by {(APR_INCREMENT_PER_SECOND * 86400).toFixed(6)}%
              per day
            </div>
            <div>
              APR increases by {APR_INCREMENT_PER_SECOND.toFixed(9)}% per second
            </div>
          </div>
        </div>
      </div>

      {/* Staking Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Stake VMF Tokens</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount to Stake
            </label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter amount to stake"
              disabled={isStaking}
            />
            <p className="mt-1 text-sm text-gray-500">
              Available to stake: {tokenBalance} VMF
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Staking Period
            </label>
            <select
              value={stakingPeriod}
              onChange={handleStakingPeriodChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isStaking}
            >
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
              <option value="90">90 Days</option>
            </select>
          </div>

          <button
            onClick={handleStake}
            disabled={
              isStaking ||
              !stakeAmount ||
              Number(tokenBalance) < Number(stakeAmount)
            }
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center"
          >
            {isStaking ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Staking...
              </>
            ) : (
              "Stake Tokens"
            )}
          </button>

          {Number(tokenBalance) < Number(stakeAmount) && stakeAmount && (
            <p className="text-red-500 text-sm">
              Insufficient balance. Please mint more tokens first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
