import { useState, useEffect, useRef } from 'react';
import { Id } from '../convex/_generated/dataModel';
import { ScheduleItem } from '../types';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { TIMER_INTERVALS } from '../constants/intervals';
import { parseTime } from '../utils/timeUtils';

/**
 * Timer Manager Hook
 *
 * Centralizes all timer-related logic that was previously scattered across App.tsx.
 * Manages local timer countdown, batch duration updates, and visibility sync.
 *
 * @param schedule - Array of schedule items
 * @param runningTimer - Currently running timer from Convex
 * @param stopTimer - Convex mutation to stop timer
 * @param now - Current time (updated every 10s)
 * @returns Timer state and durations
 */
export const useTimerManager = (
  schedule: ScheduleItem[] | undefined,
  runningTimer: ScheduleItem | null,
  stopTimer: (id: Id<"scheduleItems">) => Promise<void>,
  now: Date
) => {
  // Local timer state: maps task ID to remaining seconds
  const [timers, setTimers] = useState<Record<string, number>>({});

  // Track running task for UI updates
  const [runningTaskId, setRunningTaskId] = useState<Id<"scheduleItems"> | null>(null);

  // Batch duration updates to reduce server calls
  const batchUpdateDurations = useMutation(api.scheduleItems.batchUpdateDurations);
  const pendingDurationsRef = useRef<Record<string, number>>({});

  // ============================================================================
  // SYNC RUNNING TIMER FROM CONVEX
  // ============================================================================

  useEffect(() => {
    if (runningTimer && runningTimer._id) {
      console.log('📱 Found running timer in Convex:', runningTimer);
      setRunningTaskId(runningTimer._id);
    } else {
      console.log('🔄 No running timer found in Convex');
      setRunningTaskId(null);
    }
  }, [runningTimer]);

  // ============================================================================
  // TIMER COUNTDOWN (runs every 1 second)
  // ============================================================================

  useEffect(() => {
    if (!runningTaskId) return;

    // Check if timer is paused
    if (runningTimer?.isPaused) return;

    const interval = setInterval(() => {
      setTimers(prev => {
        const newTimers = { ...prev };
        const idKey = runningTaskId as string;

        if (newTimers[idKey] > 0) {
          newTimers[idKey] -= 1;

          // Queue update locally; will batch-flush later
          pendingDurationsRef.current[idKey] = newTimers[idKey];
        } else {
          // Timer finished
          console.log('⏰ Timer finished for task id:', runningTaskId);
          stopTimer(runningTaskId)
            .catch(err => console.error('❌ Failed to stop timer:', err));
        }

        return newTimers;
      });
    }, TIMER_INTERVALS.TIMER_TICK);

    return () => clearInterval(interval);
  }, [runningTaskId, runningTimer, stopTimer]);

  // ============================================================================
  // BATCH DURATION UPDATES (every 30 seconds)
  // ============================================================================

  useEffect(() => {
    const interval = setInterval(() => {
      const payload = Object.entries(pendingDurationsRef.current).map(
        ([id, remainingDuration]) => ({
          id: id as unknown as Id<"scheduleItems">,
          remainingDuration
        })
      );

      if (payload.length > 0) {
        console.log(`🔄 Batching ${payload.length} duration update(s) to server`);
        batchUpdateDurations({ updates: payload })
          .catch((err: unknown) => console.error('❌ Batch duration update failed', err));
        pendingDurationsRef.current = {};
      }
    }, TIMER_INTERVALS.DURATION_BATCH);

    return () => clearInterval(interval);
  }, [batchUpdateDurations]);

  // ============================================================================
  // VISIBILITY SYNC (prevent drift when tab is hidden)
  // ============================================================================

  useEffect(() => {
    const syncOnVisibility = () => {
      if (document.visibilityState === 'visible' && runningTimer && runningTimer._id) {
        console.log('👁️ Tab visible - syncing timer from server');
        const idKey = runningTimer._id as string;
        setTimers(prev => ({
          ...prev,
          [idKey]: Math.floor(runningTimer.remainingDuration ?? 0)
        }));
      }
    };

    window.addEventListener('visibilitychange', syncOnVisibility);
    return () => window.removeEventListener('visibilitychange', syncOnVisibility);
  }, [runningTimer]);

  // ============================================================================
  // INITIALIZE TIMER DURATIONS (when schedule changes)
  // ============================================================================

  useEffect(() => {
    if (!schedule) return;

    const newTimers: Record<string, number> = {};

    schedule.forEach(item => {
      if (item.remainingDuration !== undefined && item._id) {
        // Use remaining duration from Convex
        newTimers[item._id as string] = item.remainingDuration;
      } else if (item.start && item.end) {
        // Calculate duration from start/end times when they exist
        const { hours: startH, minutes: startM } = parseTime(item.start);
        const { hours: endH, minutes: endM } = parseTime(item.end);
        const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        if (item._id) {
          newTimers[item._id as string] = Math.max(0, durationMinutes) * 60; // Convert to seconds
        }
      }
    });

    // Only update if there are actual changes
    setTimers(prev => {
      const hasChanges = Object.keys(newTimers).some(key =>
        !prev[key] || prev[key] !== newTimers[key]
      ) || Object.keys(prev).some(key => !newTimers[key]);

      return hasChanges ? newTimers : prev;
    });
  }, [schedule]);

  // ============================================================================
  // RECALCULATE REMAINING TIME FOR FIXED TASKS (every 10s via 'now' prop)
  // ============================================================================

  useEffect(() => {
    if (!schedule || schedule.length === 0) return;

    const updated: Record<string, number> = {};

    schedule.forEach(item => {
      // Skip timeless and flexible tasks
      if (item.isTimeless || item.isFlexible) return;

      // Skip currently running task – its timer is already live
      if (runningTaskId && item._id === runningTaskId) return;

      if (!item.start || !item.end) return;

      const { hours: sH, minutes: sM } = parseTime(item.start);
      const { hours: eH, minutes: eM } = parseTime(item.end);

      const startDate = new Date(now);
      startDate.setHours(sH, sM, 0, 0);
      const endDate = new Date(now);
      endDate.setHours(eH, eM, 0, 0);

      let remainingSec: number;

      if (now < startDate) {
        // Task hasn't started yet – full duration remaining
        remainingSec = Math.max(0, (endDate.getTime() - startDate.getTime()) / 1000);
      } else if (now > endDate) {
        // Task window has passed
        remainingSec = 0;
      } else {
        // Currently in-progress (but timer not explicitly started)
        remainingSec = Math.max(0, (endDate.getTime() - now.getTime()) / 1000);
      }

      if (item._id) {
        updated[item._id as string] = Math.floor(remainingSec);
      }
    });

    if (Object.keys(updated).length > 0) {
      setTimers(prev => ({ ...prev, ...updated }));
    }
  }, [now, schedule, runningTaskId]);

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    timers,
    runningTaskId
  };
};
