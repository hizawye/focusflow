/**
 * Default Values and Configurations
 *
 * Centralized default values for task creation, time slots, and UI configurations.
 * This ensures consistency across the application.
 */

export const DEFAULT_TASK = {
  /** Default title for new tasks */
  TITLE: 'New Task',

  /** Default icon for tasks */
  ICON: '📋',

  /** Default color for tasks */
  COLOR: '#3b82f6',
} as const;

export const DEFAULT_TIME_SLOT = {
  /** Default start time for tasks without specific time */
  START: '23:59',

  /** Default end time for tasks without specific time */
  END: '23:59',
} as const;

export const DEFAULT_FLEXIBLE_TIME = {
  /** Default earliest start time for flexible tasks */
  EARLIEST_START: '06:00',

  /** Default latest end time for flexible tasks */
  LATEST_END: '23:00',

  /** Default duration for flexible tasks (in minutes) */
  DURATION: 60,
} as const;

export const DEFAULT_TIMER = {
  /** Default remaining duration when not specified (in seconds) */
  REMAINING_DURATION: 0,

  /** Default total elapsed time (in seconds) */
  TOTAL_ELAPSED: 0,
} as const;

export const DEFAULT_PREFERRED_TIME_SLOTS = ['morning', 'afternoon', 'evening'] as const;

/**
 * Type for preferred time slots
 */
export type PreferredTimeSlot = typeof DEFAULT_PREFERRED_TIME_SLOTS[number];
