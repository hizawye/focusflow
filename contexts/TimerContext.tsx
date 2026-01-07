import React, { createContext, useContext, ReactNode } from 'react';
import { Id } from '../convex/_generated/dataModel';
import { ScheduleItem } from '../types';
import { useTimerFromConvex } from '../hooks/useTimerFromConvex';
import { useTimerManager } from '../hooks/useTimerManager';

/**
 * Timer Context Type
 *
 * Provides timer state and control functions throughout the component tree.
 */
interface TimerContextType {
  // Timer state from useTimerManager
  timers: Record<string, number>;
  runningTaskId: Id<"scheduleItems"> | null;

  // Timer from Convex
  runningTimer: ScheduleItem | null;
  isTimerLoading: boolean;

  // Timer control functions from Convex
  startTimer: (id: Id<"scheduleItems">) => Promise<void>;
  stopTimer: (id: Id<"scheduleItems">) => Promise<void>;
  pauseTimer: (id: Id<"scheduleItems">) => Promise<void>;
  resumeTimer: (id: Id<"scheduleItems">) => Promise<void>;
  updateTimerDuration: (id: Id<"scheduleItems">, duration: number) => Promise<void>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

/**
 * Timer Provider Props
 */
interface TimerProviderProps {
  children: ReactNode;
  schedule: ScheduleItem[] | undefined;
  date: string;
  now: Date;
}

/**
 * Timer Context Provider
 *
 * Wraps the application to provide timer state and control functions.
 * Centralizes all timer logic that was previously in App.tsx.
 *
 * @example
 * <TimerProvider schedule={schedule} date={today} now={now}>
 *   <App />
 * </TimerProvider>
 */
export const TimerProvider: React.FC<TimerProviderProps> = ({
  children,
  schedule,
  date,
  now
}) => {
  // Get timer from Convex
  const {
    runningTimer,
    startTimer: convexStartTimer,
    stopTimer: convexStopTimer,
    pauseTimer: convexPauseTimer,
    resumeTimer: convexResumeTimer,
    updateTimerDuration: convexUpdateTimerDuration,
    isLoading: isTimerLoading
  } = useTimerFromConvex(date);

  // Wrap timer functions to convert Promise<null> to Promise<void>
  const startTimer = async (id: Id<"scheduleItems">) => {
    await convexStartTimer(id);
  };

  const stopTimer = async (id: Id<"scheduleItems">) => {
    await convexStopTimer(id);
  };

  const pauseTimer = async (id: Id<"scheduleItems">) => {
    await convexPauseTimer(id);
  };

  const resumeTimer = async (id: Id<"scheduleItems">) => {
    await convexResumeTimer(id);
  };

  const updateTimerDuration = async (id: Id<"scheduleItems">, duration: number) => {
    await convexUpdateTimerDuration(id, duration);
  };

  // Manage local timer state
  const { timers, runningTaskId } = useTimerManager(
    schedule,
    runningTimer ?? null,
    stopTimer,
    now
  );

  const value: TimerContextType = {
    timers,
    runningTaskId,
    runningTimer: runningTimer ?? null,
    isTimerLoading,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    updateTimerDuration
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};

/**
 * Custom hook to use Timer Context
 *
 * Provides easy access to timer state and control functions.
 *
 * @throws Error if used outside TimerProvider
 *
 * @example
 * const { timers, runningTaskId, startTimer, stopTimer } = useTimer();
 */
export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);

  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }

  return context;
};
