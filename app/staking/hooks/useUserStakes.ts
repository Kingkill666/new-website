import { useQuery } from "@apollo/client";
import { useAccount } from "wagmi";
import { readContract } from "@wagmi/core";
import { GET_USER_STAKES } from "../graphql/queries";
import { STAKING_CONTRACT_ADDRESS } from "../contracts/addresses";
import { STAKING_ABI } from "../contracts/abis";
import { calculateCurrentYield } from "../utils/yieldCalculations";
import { useState, useEffect } from "react";
import { config } from "../wagmi";

interface StakeData {
  id: string;
  internal_id: string;
  stakedAmount: string;
  stakingPeriod: string;
  startTime: string;
  blockTimestamp: string;
  currentYield: bigint;
  lastYieldClaimAt: number;
}

export const useUserStakes = () => {
  const { address } = useAccount();
  const [processedStakes, setProcessedStakes] = useState<StakeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: subgraphData, loading: subgraphLoading } = useQuery(
    GET_USER_STAKES,
    {
      variables: { userAddress: address?.toLowerCase() },
      pollInterval: 5000,
      skip: !address,
    }
  );

  const fetchYieldData = async (stakeId: number) => {
    if (!address) return null;

    try {
      return await readContract(config, {
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: "getUserStakingInfo",
        args: [address, stakeId],
      });
    } catch (err) {
      console.error("Error fetching yield data:", err);
      return null;
    }
  };

  useEffect(() => {
    const processStakeData = async () => {
      if (!subgraphData?.stakes || subgraphLoading) {
        setIsLoading(true);
        return;
      }

      try {
        const processed = await Promise.all(
          subgraphData.stakes.map(async (stake: any) => {
            const contractData = await fetchYieldData(
              Number(stake.internal_id)
            );

            if (!contractData) {
              throw new Error(
                `Failed to fetch contract data for stake ${stake.internal_id}`
              );
            }

            return {
              ...stake,
              currentYield: calculateCurrentYield(
                Number(stake.startTime),
                Number(contractData.lastYieldClaimAt),
                BigInt(stake.stakedAmount)
              ),
              lastYieldClaimAt: Number(contractData.lastYieldClaimAt),
            };
          })
        );

        setProcessedStakes(processed);
        setError(null);
      } catch (err) {
        console.error("Error processing stake data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to process stake data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    processStakeData();
  }, [subgraphData, subgraphLoading, address]);

  return {
    stakes: processedStakes,
    isLoading: isLoading || subgraphLoading,
    error,
  };
};
