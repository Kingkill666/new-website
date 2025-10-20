import { useState } from "react";
import { simulateContract, writeContract, getAccount } from "@wagmi/core";
import { STAKING_CONTRACT_ADDRESS } from "../contracts/addresses";
import { STAKING_ABI } from "../contracts/abis";
import { config } from "../wagmi";
import { useUserStakes } from "../hooks/useUserStakes";
import { StakeCard } from "./StakeCard";

export const StakesList: React.FC = () => {
  const [activeStakeId, setActiveStakeId] = useState<number | null>(null);
  const { stakes, isLoading, error } = useUserStakes();
  const account = getAccount(config);

  const handleWithdrawYield = async (stakeId: number) => {
    if (!account.address || activeStakeId !== null) return;
    setActiveStakeId(stakeId);
    try {
      const { request } = await simulateContract(config, {
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: "withdrawYield",
        args: [stakeId],
      });

      const tx = await writeContract(config, request);
      console.log("Yield withdrawal transaction:", tx);
    } catch (error) {
      console.error("Error withdrawing yield:", error);
      alert(
        error instanceof Error ? error.message : "Failed to withdraw yield"
      );
    } finally {
      setActiveStakeId(null);
    }
  };

  const handleWithdrawStake = async (stakeId: number) => {
    if (!account.address || activeStakeId !== null) return;
    setActiveStakeId(stakeId);
    try {
      const stake = stakes.find((s) => Number(s.internal_id) === stakeId);
      if (!stake) {
        throw new Error("Stake not found");
      }

      const { request } = await simulateContract(config, {
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: "withdraw",
        args: [stakeId, BigInt(stake.stakedAmount)],
      });

      const tx = await writeContract(config, request);
      console.log("Stake withdrawal transaction:", tx);
    } catch (error) {
      console.error("Error withdrawing stake:", error);
      alert(
        error instanceof Error ? error.message : "Failed to withdraw stake"
      );
    } finally {
      setActiveStakeId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-600">Loading stakes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (stakes.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-600">No active stakes found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Your Stakes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stakes.map((stake) => (
          <StakeCard
            key={stake.id}
            stakeId={Number(stake.internal_id)}
            amount={BigInt(stake.stakedAmount)}
            startTime={Number(stake.startTime)}
            initialLastYieldClaimAt={stake.lastYieldClaimAt}
            stakingPeriod={Number(stake.stakingPeriod)}
            isProcessing={activeStakeId === Number(stake.internal_id)}
            onWithdrawYield={() =>
              handleWithdrawYield(Number(stake.internal_id))
            }
            onWithdrawStake={() =>
              handleWithdrawStake(Number(stake.internal_id))
            }
          />
        ))}
      </div>
    </div>
  );
};
