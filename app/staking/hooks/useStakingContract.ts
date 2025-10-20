import {
  getAccount,
  readContract,
  simulateContract,
  writeContract,
} from "@wagmi/core";
import {
  STAKING_CONTRACT_ADDRESS,
  MOCK_TOKEN_ADDRESS,
} from "../contracts/addresses";
import { STAKING_ABI, MOCK_TOKEN_ABI } from "../contracts/abis";
import { config } from "../wagmi";

export function useStakingContract() {
  const account = getAccount(config);

  // Read functions
  const getMinimumStakeCap = async () => {
    try {
      return await readContract(config, {
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: "minimumStakeCap",
      });
    } catch (error) {
      console.error("Error fetching minimum stake cap:", error);
      throw error;
    }
  };

  const getMaximumStakeCap = async () => {
    try {
      return await readContract(config, {
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: "maximumStakeCap",
      });
    } catch (error) {
      console.error("Error fetching maximum stake cap:", error);
      throw error;
    }
  };

  const getTokenBalance = async () => {
    if (!account.address) return BigInt(0);
    try {
      return await readContract(config, {
        address: MOCK_TOKEN_ADDRESS,
        abi: MOCK_TOKEN_ABI,
        functionName: "balanceOf",
        args: [account.address],
      });
    } catch (error) {
      console.error("Error fetching token balance:", error);
      throw error;
    }
  };

  // Write functions
  const stake = async (amount: bigint, stakingPeriod: number) => {
    if (!account.address) throw new Error("No account connected");
    try {
      const { request } = await simulateContract(config, {
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: "stake",
        args: [amount, stakingPeriod],
      });
      return await writeContract(config, request);
    } catch (error: any) {
      if (error.message.includes("VMFStaking__InvalidStakeAmount")) {
        throw new Error(
          "Invalid stake amount. Amount might be below minimum or above maximum allowed stake."
        );
      }
      console.error("Error staking:", error);
      throw error;
    }
  };

  const stakeBatch = async (amounts: bigint[], stakingPeriods: number[]) => {
    if (!account.address) throw new Error("No account connected");
    try {
      const { request } = await simulateContract(config, {
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: "stakeBatch",
        args: [amounts, stakingPeriods],
      });
      return await writeContract(config, request);
    } catch (error) {
      console.error("Error batch staking:", error);
      throw error;
    }
  };

  const withdraw = async (stakeId: number, amount: bigint) => {
    if (!account.address) throw new Error("No account connected");
    try {
      const { request } = await simulateContract(config, {
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: "withdraw",
        args: [stakeId, amount],
      });
      return await writeContract(config, request);
    } catch (error) {
      console.error("Error withdrawing:", error);
      throw error;
    }
  };

  const withdrawAll = async (stakeId: number) => {
    if (!account.address) throw new Error("No account connected");
    try {
      const { request } = await simulateContract(config, {
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: "withdrawAll",
        args: [stakeId],
      });
      return await writeContract(config, request);
    } catch (error) {
      console.error("Error withdrawing all:", error);
      throw error;
    }
  };

  const withdrawYield = async (stakeId: number) => {
    if (!account.address) throw new Error("No account connected");
    try {
      const { request } = await simulateContract(config, {
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: "withdrawYield",
        args: [stakeId],
      });
      return await writeContract(config, request);
    } catch (error) {
      console.error("Error withdrawing yield:", error);
      throw error;
    }
  };

  const mintTokens = async (amount: bigint) => {
    if (!account.address) throw new Error("No account connected");
    try {
      const { request } = await simulateContract(config, {
        address: MOCK_TOKEN_ADDRESS,
        abi: MOCK_TOKEN_ABI,
        functionName: "mint",
        args: [account.address, amount],
      });
      return await writeContract(config, request);
    } catch (error) {
      console.error("Error minting tokens:", error);
      throw error;
    }
  };

  const approveTokens = async (amount: bigint) => {
    if (!account.address) throw new Error("No account connected");
    try {
      const { request } = await simulateContract(config, {
        address: MOCK_TOKEN_ADDRESS,
        abi: MOCK_TOKEN_ABI,
        functionName: "approve",
        args: [STAKING_CONTRACT_ADDRESS, amount],
      });
      return await writeContract(config, request);
    } catch (error) {
      console.error("Error approving tokens:", error);
      throw error;
    }
  };

  return {
    // Read functions
    getMinimumStakeCap,
    getMaximumStakeCap,
    getTokenBalance,

    // Write functions
    stake,
    stakeBatch,
    withdraw,
    withdrawAll,
    withdrawYield,
    mintTokens,
    approveTokens,
  };
}
