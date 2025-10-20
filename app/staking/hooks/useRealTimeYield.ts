import { useState, useEffect } from "react";
import { formatUnits } from "viem";

// APR is 10% per year
const APR = 0.07;
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
const APR_RATE_PER_SECOND = APR / SECONDS_PER_YEAR;

interface UseRealTimeYieldProps {
  stakedAmount: bigint;
  lastYieldClaimAt: number;
  startTime: number;
}

export const useRealTimeYield = ({
  stakedAmount,
  lastYieldClaimAt,
  startTime,
}: UseRealTimeYieldProps): string => {
  const [currentYield, setCurrentYield] = useState("0.000000");

  useEffect(() => {
    const calculateYield = () => {
      const now = Math.floor(Date.now() / 1000);
      const elapsedTime = now - Math.max(lastYieldClaimAt, startTime);

      if (elapsedTime <= 0) {
        setCurrentYield("0.000000");
        return;
      }

      // Convert stakedAmount from wei to regular units
      const stakedAmountInUnits = Number(formatUnits(stakedAmount, 18));

      // Calculate yield
      const yieldAmount =
        stakedAmountInUnits * APR_RATE_PER_SECOND * elapsedTime;

      // Format to 6 decimal places
      setCurrentYield(yieldAmount.toFixed(6));
    };

    // Initial calculation
    calculateYield();

    // Update every second
    const interval = setInterval(calculateYield, 1000);
    return () => clearInterval(interval);
  }, [stakedAmount, lastYieldClaimAt, startTime]);

  return currentYield;
};
