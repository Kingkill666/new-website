import { gql } from "@apollo/client";

export const GET_USER_STAKES = gql`
  query GetUserStakes($userAddress: Bytes!) {
    stakes(where: { user: $userAddress }) {
      id
      internal_id
      user
      stakedAmount
      stakingPeriod
      startTime
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_USER_YIELD_WITHDRAWALS = gql`
  query GetUserYieldWithdrawals($userAddress: Bytes!) {
    stakeYieldWithdraws(where: { user: $userAddress }) {
      id
      internal_id
      stakedAmount
      yieldWithdrawalAmount
      stakingPeriod
      startTime
      endTime
    }
  }
`;
