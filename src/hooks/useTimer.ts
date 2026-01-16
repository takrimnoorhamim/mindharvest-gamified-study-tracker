
// ============================================
// FILE 1: src/hooks/useTimer.ts
// ============================================

import { useState, useEffect, useRef } from 'react';
import { TimerState } from '../types';

interface UseTimerProps {
  initialSeconds: number;
  onComplete: () => void;
  autoStart?: boolean;
}

export const useTimer = ({ 
  initialSeconds, 
  onComplete, 
  autoStart = false 
}: UseTimerProps) => {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start timer
  const start = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  // Pause timer
  const pause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  // Resume timer
  const resume = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  // Reset timer
  const reset = (newSeconds?: number) => {
    setIsRunning(false);
    setIsPaused(false);
    setRemainingSeconds(newSeconds ?? initialSeconds);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Skip to end
  const skip = () => {
    setRemainingSeconds(0);
    setIsRunning(false);
    onComplete();
  };

  // Main timer effect
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remainingSeconds, onComplete]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress percentage
  const getProgress = (): number => {
    return ((initialSeconds - remainingSeconds) / initialSeconds) * 100;
  };

  return {
    remainingSeconds,
    isRunning,
    isPaused,
    formattedTime: formatTime(remainingSeconds),
    progress: getProgress(),
    start,
    pause,
    resume,
    reset,
    skip,
  };
};