import { readContract } from "@wagmi/core";
import { STAKING_CONTRACT_ADDRESS } from "../contracts/addresses";
import { STAKING_ABI } from "../contracts/abis";

interface YieldCacheEntry {
  lastYieldClaimAt: number;
  lastUpdated: number;
}

class YieldCache {
  private cache: Map<string, YieldCacheEntry> = new Map();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private generateKey(address: string, stakeId: number): string {
    return `${address}-${stakeId}`;
  }

  async getLastYieldClaimAt(address: string, stakeId: number): Promise<number> {
    const key = this.generateKey(address, stakeId);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.lastUpdated < this.CACHE_DURATION) {
      return cached.lastYieldClaimAt;
    }

    try {
      // Fetch fresh data
      const stakingInfo = await readContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: "getUserStakingInfo",
        args: [address, stakeId],
      });

      const lastYieldClaimAt = Number(stakingInfo.lastYieldClaimAt);

      // Update cache
      this.cache.set(key, {
        lastYieldClaimAt,
        lastUpdated: Date.now(),
      });

      return lastYieldClaimAt;
    } catch (error) {
      console.error("Error fetching lastYieldClaimAt:", error);
      // Return cached value if available, even if expired
      return cached?.lastYieldClaimAt ?? 0;
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

export const yieldCache = new YieldCache();
