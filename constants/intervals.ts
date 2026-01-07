/**
 * Timer and Update Intervals
 *
 * Centralized constants for all time-based intervals in the application.
 * This prevents magic numbers and makes timing adjustments easier.
 */

export const TIMER_INTERVALS = {
  /** Update current time display every 10 seconds */
  NOW_UPDATE: 10_000,

  /** Timer countdown tick every 1 second */
  TIMER_TICK: 1_000,

  /** Batch duration updates to server every 30 seconds */
  DURATION_BATCH: 30_000,

  /** Auto-dismiss toast notifications after 5 seconds */
  TOAST_DISMISS: 5_000,
} as const;

/**
 * Responsive Design Breakpoints
 */
export const BREAKPOINTS = {
  /** Mobile/tablet breakpoint in pixels */
  MOBILE: 768,

  /** Tablet/desktop breakpoint in pixels */
  TABLET: 1024,
} as const;

/**
 * UI Layout Constants
 */
export const LAYOUT = {
  /** Header height in pixels */
  HEADER_HEIGHT: 80,

  /** Mobile footer spacer height */
  MOBILE_FOOTER_SPACER: 24,

  /** Timeline marker offset */
  TIMELINE_MARKER_OFFSET: 10,
} as const;
