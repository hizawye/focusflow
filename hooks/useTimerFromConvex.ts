import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

/**
 * FocusFlow Timer Management Hook
 * 
 * This hook provides timer-specific functionality using Convex as the backend.
 * It handles timer start, stop, pause, resume operations with persistence.
 * 
 * @param date - The date for which to manage timers (YYYY-MM-DD format)
 * @returns Object containing timer state and control functions
 */
export const useTimerFromConvex = (date: string) => {
  const { user } = useUser();
  const userId = user?.id;

  // Query to get currently running timer
  const runningTimer = useQuery(api.scheduleItems.getRunningTimer, 
    userId ? { userId, date } : "skip"
  );

  // Timer mutation hooks
  const startTimerMutation = useMutation(api.scheduleItems.startTimer);
  const stopTimerMutation = useMutation(api.scheduleItems.stopTimer);
  const pauseTimerMutation = useMutation(api.scheduleItems.pauseTimer);
  const resumeTimerMutation = useMutation(api.scheduleItems.resumeTimer);
  const updateTimerDurationMutation = useMutation(api.scheduleItems.updateTimerDuration);

  /**
   * Start a timer for a specific schedule item
   * This will stop any other running timers and start the new one
   * @param id - The ID of the schedule item to start timer for
   * @returns Promise that resolves when timer is started
   */
  const startTimer = async (id: Id<"scheduleItems">) => {
    if (!userId) {
      throw new Error("User must be authenticated to start timer");
    }
    
    console.log('🟢 Starting timer for schedule item:', id);
    try {
      const result = await startTimerMutation({
        id,
        userId: userId,
        date,
      });
      console.log('✅ Timer started successfully with result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error starting timer:', error);
      throw error;
    }
  };

  /**
   * Stop a timer for a specific schedule item
   * @param id - The ID of the schedule item to stop timer for
   * @returns Promise that resolves when timer is stopped
   */
  const stopTimer = async (id: Id<"scheduleItems">) => {
    console.log('🔴 Stopping timer for schedule item:', id);
    try {
      await stopTimerMutation({ id });
      console.log('✅ Timer stopped successfully');
    } catch (error) {
      console.error('❌ Error stopping timer:', error);
      throw error;
    }
  };

  /**
   * Pause a timer for a specific schedule item
   * @param id - The ID of the schedule item to pause timer for
   * @returns Promise that resolves when timer is paused
   */
  const pauseTimer = async (id: Id<"scheduleItems">) => {
    console.log('⏸️ Pausing timer for schedule item:', id);
    try {
      await pauseTimerMutation({ id });
      console.log('✅ Timer paused successfully');
    } catch (error) {
      console.error('❌ Error pausing timer:', error);
      throw error;
    }
  };

  /**
   * Resume a paused timer for a specific schedule item
   * @param id - The ID of the schedule item to resume timer for
   * @returns Promise that resolves when timer is resumed
   */
  const resumeTimer = async (id: Id<"scheduleItems">) => {
    console.log('▶️ Resuming timer for schedule item:', id);
    try {
      await resumeTimerMutation({ id });
      console.log('✅ Timer resumed successfully');
    } catch (error) {
      console.error('❌ Error resuming timer:', error);
      throw error;
    }
  };

  /**
   * Update the remaining duration of a timer in real-time
   * @param id - The ID of the schedule item to update
   * @param remainingDuration - The new remaining duration in seconds
   * @returns Promise that resolves when duration is updated
   */
  const updateTimerDuration = async (id: Id<"scheduleItems">, remainingDuration: number) => {
    try {
      await updateTimerDurationMutation({ id, remainingDuration });
    } catch (error) {
      console.error('❌ Error updating timer duration:', error);
      throw error;
    }
  };

  return {
    runningTimer,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    updateTimerDuration,
    isLoading: runningTimer === undefined,
  };
};
