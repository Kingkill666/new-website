import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
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
    <Card
      sx={{
        mb: 2,
        background: "linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        borderRadius: "16px",
        overflow: "hidden",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "#1a237e",
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <span>Stake #{stakeId}</span>
          {(isProcessingYield || isProcessingStake) && (
            <CircularProgress size={20} thickness={4} sx={{ ml: 2 }} />
          )}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Staked Amount
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {Number(formatUnits(amount, 18)).toLocaleString()} VMF
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Current Yield
            </Typography>
            <Typography variant="h6" sx={{ color: "#4caf50", fontWeight: 600 }}>
              {currentYield} VMF
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Staking Progress
            </Typography>
            <Box sx={{ mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 1,
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: progress === 100 ? "#4caf50" : "#3f51b5",
                  },
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Time Remaining: {formatDuration(timeRemaining)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.floor(progress)}%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            "& button": {
              flex: 1,
              py: 1.5,
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              transition: "all 0.2s ease-in-out",
              "&:not(:disabled):hover": {
                transform: "translateY(-1px)",
              },
            },
          }}
        >
          <Button
            variant="contained"
            onClick={handleWithdrawYield}
            disabled={isProcessingYield || Number(currentYield) === 0}
            sx={{
              backgroundColor: "#4caf50",
              "&:hover": {
                backgroundColor: "#43a047",
              },
            }}
          >
            {isProcessingYield ? (
              <>
                <CircularProgress
                  size={20}
                  thickness={4}
                  sx={{ mr: 1, color: "white" }}
                />
                Processing...
              </>
            ) : (
              "Withdraw Yield"
            )}
          </Button>
          <Button
            variant="contained"
            onClick={handleWithdrawStake}
            disabled={isProcessingStake || !canWithdrawStake}
            sx={{
              backgroundColor: "#3f51b5",
              "&:hover": {
                backgroundColor: "#303f9f",
              },
            }}
          >
            {isProcessingStake ? (
              <>
                <CircularProgress
                  size={20}
                  thickness={4}
                  sx={{ mr: 1, color: "white" }}
                />
                Processing...
              </>
            ) : (
              "Withdraw Stake"
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
