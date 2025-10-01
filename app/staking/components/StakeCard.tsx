"use client"

import { useState, useEffect } from "react";
import { useRealTimeYield } from "../hooks/useRealTimeYield";
import { formatDuration } from "../utils/formatDuration";
import { formatUnits } from "viem";

interface StakeCardProps {
  stakeId: number;
  amount: bigint;
  startTime: number;
  initialLastYieldClaimAt: number;
  stakingPeriod: number;
  isProcessing?: boolean;
  onWithdrawYield: (stakeId: number) => Promise<void>;
  onWithdrawStake: (stakeId: number) => Promise<void>;
}

export const StakeCard: React.FC<StakeCardProps> = ({
  stakeId,
  amount,
  startTime,
  initialLastYieldClaimAt,
  stakingPeriod,
  onWithdrawYield,
  onWithdrawStake,
}) => {
  const [isProcessingYield, setIsProcessingYield] = useState(false);
  const [isProcessingStake, setIsProcessingStake] = useState(false);
  const [lastYieldClaimAt, setLastYieldClaimAt] = useState(
    initialLastYieldClaimAt
  );
  const [progress, setProgress] = useState(0);

  const currentYield = useRealTimeYield({
    stakedAmount: amount,
    lastYieldClaimAt,
    startTime,
  });

  const handleWithdrawYield = async () => {
    try {
      setIsProcessingYield(true);
      await onWithdrawYield(stakeId);
      setLastYieldClaimAt(Math.floor(Date.now() / 1000));
    } catch (error) {
      console.error("Error withdrawing yield:", error);
    } finally {
      setIsProcessingYield(false);
    }
  };

  const handleWithdrawStake = async () => {
    try {
      setIsProcessingStake(true);
      await onWithdrawStake(stakeId);
    } catch (error) {
      console.error("Error withdrawing stake:", error);
    } finally {
      setIsProcessingStake(false);
    }
  };

  // Time calculation
  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - startTime;
  const timeRemaining = Math.max(0, stakingPeriod - elapsed);
  const canWithdrawStake = timeRemaining === 0;

  // Update progress every second
  useEffect(() => {
    const updateProgress = () => {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - startTime;
      const newProgress = Math.min(100, (elapsed / stakingPeriod) * 100);
      setProgress(newProgress);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [startTime, stakingPeriod]);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-4 transition-transform hover:transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Stake #{stakeId}
        </h3>
        {(isProcessingYield || isProcessingStake) && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Staked Amount</p>
          <p className="text-lg font-semibold text-gray-900">
            {Number(formatUnits(amount, 18)).toLocaleString()} VMF
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Current Yield</p>
          <p className="text-lg font-semibold text-green-600">
            {currentYield} VMF
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Staking Progress</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progress === 100 ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Time Remaining: {formatDuration(timeRemaining)}</span>
            <span>{Math.floor(progress)}%</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleWithdrawYield}
          disabled={isProcessingYield || Number(currentYield) === 0}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {isProcessingYield ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            "Withdraw Yield"
          )}
        </button>
        <button
          onClick={handleWithdrawStake}
          disabled={isProcessingStake || !canWithdrawStake}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {isProcessingStake ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            "Withdraw Stake"
          )}
        </button>
      </div>
    </div>
  );
};
