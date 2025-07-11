import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { ScheduleItem } from "../types";
import { DEFAULT_SCHEDULE } from "../constants";

/**
 * FocusFlow Convex Schedule Hook
 * 
 * This hook provides all schedule-related functionality using Convex as the backend.
 * It handles CRUD operations, data synchronization, and import/export features.
 * 
 * @param date - The date for which to fetch/manage schedule items (YYYY-MM-DD format)
 * @returns Object containing schedule data and mutation functions
 */
export const useScheduleFromConvex = (date: string) => {
  const { user } = useUser();
  const userId = user?.id;

  // Query to fetch schedule items from Convex
  const scheduleItems = useQuery(api.scheduleItems.getScheduleItems, 
    userId ? { userId, date } : "skip"
  );

  // Mutation hooks for schedule operations
  const createScheduleItem = useMutation(api.scheduleItems.createScheduleItem);
  const updateScheduleItem = useMutation(api.scheduleItems.updateScheduleItem);
  const deleteScheduleItem = useMutation(api.scheduleItems.deleteScheduleItem);
  const setScheduleItems = useMutation(api.scheduleItems.setScheduleItems);

  /**
   * Add a new schedule item to the database
   * @param item - The schedule item to add (without _id)
   * @returns Promise that resolves to the created item's ID
   */
  const addScheduleItem = async (item: Omit<ScheduleItem, '_id'>) => {
    if (!userId) {
      throw new Error("User must be authenticated to add schedule items");
    }
    
    console.log('🔄 Adding schedule item:', item.title);
    try {
      const result = await createScheduleItem({
        userId: userId,
        date,
        title: item.title,
        start: item.start,
        end: item.end,
        remainingDuration: item.remainingDuration,
        isRunning: item.isRunning,
        isPaused: item.isPaused,
        pausedAt: item.pausedAt,
        startedAt: item.startedAt,
        totalElapsed: item.totalElapsed,
        icon: item.icon,
        color: item.color,
        manualStatus: item.manualStatus,
      });
      console.log('✅ Successfully added schedule item:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding schedule item:', error);
      throw error;
    }
  };

  /**
   * Update an existing schedule item
   * @param id - The ID of the item to update
   * @param updates - Partial updates to apply
   * @returns Promise that resolves when update is complete
   */
  const updateItem = async (id: Id<"scheduleItems">, updates: Partial<ScheduleItem>) => {
    console.log('🔄 Updating schedule item:', id, updates);
    try {
      const result = await updateScheduleItem({ id, ...updates });
      console.log('✅ Successfully updated schedule item');
      return result;
    } catch (error) {
      console.error('❌ Error updating schedule item:', error);
      throw error;
    }
  };

  /**
   * Delete a schedule item from the database
   * @param id - The ID of the item to delete
   * @returns Promise that resolves when deletion is complete
   */
  const deleteItem = async (id: Id<"scheduleItems">) => {
    console.log('🔄 Deleting schedule item:', id);
    try {
      const result = await deleteScheduleItem({ id });
      console.log('✅ Successfully deleted schedule item');
      return result;
    } catch (error) {
      console.error('❌ Error deleting schedule item:', error);
      throw error;
    }
  };

  /**
   * Replace all schedule items for the current date with new items
   * Used for importing schedules or clearing and setting new data
   * @param items - Array of schedule items to set
   * @returns Promise that resolves when all items are set
   */
  const setAllItems = async (items: Omit<ScheduleItem, '_id'>[]) => {
    if (!userId) {
      throw new Error("User must be authenticated to set schedule items");
    }
    
    console.log('🔄 Setting all schedule items:', items.length, 'items');
    try {
      const result = await setScheduleItems({
        userId: userId,
        date,
        items: items.map(item => ({
          title: item.title,
          start: item.start,
          end: item.end,
          remainingDuration: item.remainingDuration,
          isRunning: item.isRunning,
          isPaused: item.isPaused,
          pausedAt: item.pausedAt,
          startedAt: item.startedAt,
          totalElapsed: item.totalElapsed,
          icon: item.icon,
          color: item.color,
          manualStatus: item.manualStatus,
        })),
      });
      console.log('✅ Successfully set all schedule items');
      return result;
    } catch (error) {
      console.error('❌ Error setting schedule items:', error);
      throw error;
    }
  };

  /**
   * Export current schedule as JSON
   * @returns JSON string of the current schedule
   */
  const exportSchedule = () => {
    console.log('📤 Exporting schedule for date:', date);
    try {
      const exportData = {
        date,
        items: convertedItems,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      console.log('✅ Schedule exported successfully');
      return jsonString;
    } catch (error) {
      console.error('❌ Error exporting schedule:', error);
      throw error;
    }
  };

  /**
   * Import schedule from JSON string
   * @param jsonString - JSON string containing schedule data
   * @returns Promise that resolves when import is complete
   */
  const importSchedule = async (jsonString: string) => {
    console.log('📥 Importing schedule from JSON');
    try {
      const importData = JSON.parse(jsonString);
      
      // Validate the import data structure
      if (!importData.items || !Array.isArray(importData.items)) {
        throw new Error('Invalid import data: missing items array');
      }

      // Convert items to the expected format
      const itemsToImport = importData.items.map((item: any) => ({
        title: item.title || '',
        start: item.start || '',
        end: item.end || '',
        remainingDuration: item.remainingDuration,
        isRunning: item.isRunning || false,
        icon: item.icon,
        color: item.color,
        manualStatus: item.manualStatus
      }));

      await setAllItems(itemsToImport);
      console.log('✅ Schedule imported successfully:', itemsToImport.length, 'items');
      return itemsToImport;
    } catch (error) {
      console.error('❌ Error importing schedule:', error);
      throw error;
    }
  };

  /**
   * Clear all schedule items for the current date
   * @returns Promise that resolves when clearing is complete
   */
  const clearSchedule = async () => {
    console.log('🧹 Clearing schedule for date:', date);
    try {
      await setAllItems([]);
      console.log('✅ Schedule cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing schedule:', error);
      throw error;
    }
  };

  /**
   * Load the default schedule for new users
   * @returns Promise that resolves when default schedule is loaded
   */
  const loadDefaultSchedule = async () => {
    console.log('📋 Loading default schedule');
    try {
      await setAllItems(DEFAULT_SCHEDULE);
      console.log('✅ Default schedule loaded successfully');
    } catch (error) {
      console.error('❌ Error loading default schedule:', error);
      throw error;
    }
  };

  // Convert Convex data to the format expected by the app
  const convertedItems: ScheduleItem[] = scheduleItems?.map(item => ({
    _id: item._id, // Include the Convex ID
    title: item.title,
    start: item.start,
    end: item.end,
    remainingDuration: item.remainingDuration,
    isRunning: item.isRunning,
    isPaused: item.isPaused,
    pausedAt: item.pausedAt,
    startedAt: item.startedAt,
    totalElapsed: item.totalElapsed,
    subtasks: item.subtasks,
    icon: item.icon,
    color: item.color,
    manualStatus: item.manualStatus,
  })) || [];

  return {
    scheduleItems: convertedItems,
    addScheduleItem,
    updateItem,
    deleteItem,
    setAllItems,
    exportSchedule,
    importSchedule,
    clearSchedule,
    loadDefaultSchedule,
    isLoading: scheduleItems === undefined,
  };
};

/**
 * FocusFlow Convex Completion Status Hook
 * 
 * This hook manages task completion status using Convex as the backend.
 * It provides functions to track which tasks are completed.
 * 
 * @param date - The date for which to fetch/manage completion status (YYYY-MM-DD format)
 * @returns Object containing completion status and mutation functions
 */
export const useCompletionStatusFromConvex = (date: string) => {
  const { user } = useUser();
  const userId = user?.id;

  const completionStatus = useQuery(api.completionStatus.getCompletionStatus, 
    userId ? { userId, date } : "skip"
  );

  const setCompletionStatus = useMutation(api.completionStatus.setCompletionStatus);
  const toggleCompletionStatus = useMutation(api.completionStatus.toggleCompletionStatus);

  /**
   * Set completion status for a specific schedule item
   * @param scheduleItemId - The ID of the schedule item
   * @param completed - Whether the item is completed
   * @returns Promise that resolves when status is set
   */
  const setStatus = async (scheduleItemId: Id<"scheduleItems">, completed: boolean) => {
    if (!userId) {
      throw new Error("User must be authenticated to set completion status");
    }
    
    console.log('🔄 Setting completion status:', scheduleItemId, completed);
    try {
      const result = await setCompletionStatus({
        userId: userId,
        scheduleItemId,
        completed,
        date,
      });
      console.log('✅ Completion status set successfully');
      return result;
    } catch (error) {
      console.error('❌ Error setting completion status:', error);
      throw error;
    }
  };

  /**
   * Toggle completion status for a specific schedule item
   * @param scheduleItemId - The ID of the schedule item
   * @returns Promise that resolves when status is toggled
   */
  const toggleStatus = async (scheduleItemId: Id<"scheduleItems">) => {
    if (!userId) {
      throw new Error("User must be authenticated to toggle completion status");
    }
    
    console.log('🔄 Toggling completion status:', scheduleItemId);
    try {
      const result = await toggleCompletionStatus({
        userId: userId,
        scheduleItemId,
        date,
      });
      console.log('✅ Completion status toggled successfully');
      return result;
    } catch (error) {
      console.error('❌ Error toggling completion status:', error);
      throw error;
    }
  };

  return {
    completionStatus: completionStatus || {},
    setStatus,
    toggleStatus,
    isLoading: completionStatus === undefined,
  };
};

/**
 * FocusFlow Convex Subtasks Hook
 * 
 * This hook manages subtasks for schedule items using Convex as the backend.
 * It provides CRUD operations for subtasks and their completion status.
 * 
 * @param scheduleItemId - The ID of the schedule item that owns the subtasks
 * @returns Object containing subtasks and mutation functions
 */
export const useSubtasksFromConvex = (scheduleItemId: Id<"scheduleItems">) => {
  const subtasks = useQuery(api.subtasks.getSubtasks, { scheduleItemId });

  const createSubtask = useMutation(api.subtasks.createSubtask);
  const updateSubtask = useMutation(api.subtasks.updateSubtask);
  const deleteSubtask = useMutation(api.subtasks.deleteSubtask);
  const toggleSubtaskCompletion = useMutation(api.subtasks.toggleSubtaskCompletion);

  /**
   * Add a new subtask to a schedule item
   * @param text - The text content of the subtask
   * @returns Promise that resolves to the created subtask's ID
   */
  const addSubtask = async (text: string) => {
    console.log('🔄 Adding subtask:', text);
    try {
      const result = await createSubtask({
        scheduleItemId,
        text,
        completed: false,
      });
      console.log('✅ Subtask added successfully');
      return result;
    } catch (error) {
      console.error('❌ Error adding subtask:', error);
      throw error;
    }
  };

  /**
   * Update the text content of a subtask
   * @param id - The ID of the subtask to update
   * @param text - The new text content
   * @returns Promise that resolves when update is complete
   */
  const updateSubtaskText = async (id: Id<"subtasks">, text: string) => {
    console.log('🔄 Updating subtask text:', id);
    try {
      const result = await updateSubtask({ id, text });
      console.log('✅ Subtask updated successfully');
      return result;
    } catch (error) {
      console.error('❌ Error updating subtask:', error);
      throw error;
    }
  };

  /**
   * Delete a subtask
   * @param id - The ID of the subtask to delete
   * @returns Promise that resolves when deletion is complete
   */
  const deleteSubtaskById = async (id: Id<"subtasks">) => {
    console.log('🔄 Deleting subtask:', id);
    try {
      const result = await deleteSubtask({ id });
      console.log('✅ Subtask deleted successfully');
      return result;
    } catch (error) {
      console.error('❌ Error deleting subtask:', error);
      throw error;
    }
  };

  /**
   * Toggle the completion status of a subtask
   * @param id - The ID of the subtask to toggle
   * @returns Promise that resolves when toggle is complete
   */
  const toggleSubtask = async (id: Id<"subtasks">) => {
    console.log('🔄 Toggling subtask completion:', id);
    try {
      const result = await toggleSubtaskCompletion({ id });
      console.log('✅ Subtask toggled successfully');
      return result;
    } catch (error) {
      console.error('❌ Error toggling subtask:', error);
      throw error;
    }
  };

  return {
    subtasks: subtasks || [],
    addSubtask,
    updateSubtaskText,
    deleteSubtaskById,
    toggleSubtask,
    isLoading: subtasks === undefined,
  };
};
