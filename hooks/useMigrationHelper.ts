import { useScheduleFromConvex, useCompletionStatusFromConvex } from './useConvexSchedule';
import { ScheduleItem } from '../types';

/**
 * Hook to migrate data from localStorage to Convex
 * This is a one-time migration utility
 */
export const useMigrationHelper = () => {
  const today = new Date().toISOString().split('T')[0];
  const { setAllItems } = useScheduleFromConvex(today);
  const { setStatus } = useCompletionStatusFromConvex(today);

  const migrateFromLocalStorage = async () => {
    try {
      // Get schedule data from localStorage
      const scheduleData = localStorage.getItem('schedule');
      if (scheduleData) {
        const schedule: ScheduleItem[] = JSON.parse(scheduleData);
        await setAllItems(schedule);
        console.log('Successfully migrated schedule data to Convex');
      }

      // Get completion status from localStorage
      const completionData = localStorage.getItem('completion-status');
      if (completionData) {
        const completionStatus: { [key: string]: boolean } = JSON.parse(completionData);
        
        // Note: This would need to be adapted since we need scheduleItemId from Convex
        // For now, we'll just log what we found
        console.log('Found completion status data:', completionStatus);
        console.log('Manual migration of completion status may be needed');
      }

      // Get other app data
      const viewData = localStorage.getItem('app-view');
      if (viewData) {
        console.log('Found app view data:', viewData);
      }

    } catch (error) {
      console.error('Error migrating data:', error);
    }
  };

  const clearLocalStorageData = () => {
    // Clear the data after successful migration
    localStorage.removeItem('schedule');
    localStorage.removeItem('completion-status');
    console.log('Cleared localStorage data');
  };

  return {
    migrateFromLocalStorage,
    clearLocalStorageData,
  };
};
