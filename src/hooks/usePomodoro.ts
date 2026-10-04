import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettingsStore } from '../lib/stores/settingsStore';

type PomodoroPhase = 'work' | 'break' | 'idle';

interface PomodoroState {
  phase: PomodoroPhase;
  timeLeft: number; // seconds
  isRunning: boolean;
  completedPomodoros: number;
}

interface UsePomodoroReturn extends PomodoroState {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
}

export function usePomodoro(onBreakStart?: () => void, onBreakEnd?: () => void): UsePomodoroReturn {
  const { pomodoro } = useSettingsStore();
  const [state, setState] = useState<PomodoroState>({
    phase: 'idle',
    timeLeft: pomodoro.workDuration * 60,
    isRunning: false,
    completedPomodoros: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onBreakStartRef = useRef(onBreakStart);
  const onBreakEndRef = useRef(onBreakEnd);

  // Keep refs updated
  useEffect(() => {
    onBreakStartRef.current = onBreakStart;
    onBreakEndRef.current = onBreakEnd;
  }, [onBreakStart, onBreakEnd]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.timeLeft <= 1) {
          // Time's up
          if (prev.phase === 'work') {
            // Transition to break
            onBreakStartRef.current?.();
            return {
              ...prev,
              phase: 'break',
              timeLeft: pomodoro.breakDuration * 60,
              completedPomodoros: prev.completedPomodoros + 1,
            };
          } else if (prev.phase === 'break') {
            // Break ended
            onBreakEndRef.current?.();
            return {
              ...prev,
              phase: 'work',
              timeLeft: pomodoro.workDuration * 60,
              isRunning: false,
            };
          }
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, [clearTimer, pomodoro]);

  const start = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: prev.phase === 'idle' ? 'work' : prev.phase,
      timeLeft: prev.phase === 'idle' ? pomodoro.workDuration * 60 : prev.timeLeft,
      isRunning: true,
    }));
    startTimer();
  }, [startTimer, pomodoro]);

  const pause = useCallback(() => {
    clearTimer();
    setState((prev) => ({ ...prev, isRunning: false }));
  }, [clearTimer]);

  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true }));
    startTimer();
  }, [startTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setState({
      phase: 'idle',
      timeLeft: pomodoro.workDuration * 60,
      isRunning: false,
      completedPomodoros: 0,
    });
  }, [clearTimer, pomodoro]);

  const skip = useCallback(() => {
    clearTimer();
    setState((prev) => {
      if (prev.phase === 'work') {
        onBreakStartRef.current?.();
        return {
          ...prev,
          phase: 'break',
          timeLeft: pomodoro.breakDuration * 60,
          completedPomodoros: prev.completedPomodoros + 1,
        };
      } else if (prev.phase === 'break') {
        onBreakEndRef.current?.();
        return {
          ...prev,
          phase: 'work',
          timeLeft: pomodoro.workDuration * 60,
          isRunning: false,
        };
      }
      return prev;
    });
  }, [clearTimer, pomodoro]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    ...state,
    start,
    pause,
    resume,
    reset,
    skip,
  };
}
