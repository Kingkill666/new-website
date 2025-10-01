import { formatUnits, parseUnits } from "viem";

const APR_RATE_PER_SECOND = 2.219685e-9;

export const calculateCurrentYield = (
  startTime: number,
  lastYieldClaimAt: number,
  stakedAmount: bigint
): bigint => {
  const currentTime = Math.floor(Date.now() / 1000);
  const timeElapsed = currentTime - lastYieldClaimAt;
  console.log("Time elapsed since last yield claim:", timeElapsed);

  // Convert stakedAmount to regular number removing 18 decimals
  const stakedAmountInUnits = Number(formatUnits(stakedAmount, 18));

  // Calculate yield
  const yieldRate = APR_RATE_PER_SECOND * timeElapsed;
  console.log("Yield rate elapsed:", yieldRate);
  const yieldAmount = stakedAmountInUnits * yieldRate;

  // Convert back to BigInt with 18 decimals
  return parseUnits(yieldAmount.toFixed(18), 18);
};
