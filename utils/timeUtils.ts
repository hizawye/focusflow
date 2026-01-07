/**
 * Time Utility Functions
 *
 * Centralized time parsing, calculation, and formatting utilities.
 * Eliminates code duplication throughout the application.
 */

/**
 * Parse HH:MM time string into hours and minutes
 * @param timeStr - Time string in HH:MM format
 * @returns Object with hours and minutes as numbers
 * @example
 * parseTime('14:30') // { hours: 14, minutes: 30 }
 */
export const parseTime = (timeStr: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
};

/**
 * Calculate duration between start and end times in seconds
 * @param start - Start time in HH:MM format
 * @param end - End time in HH:MM format
 * @returns Duration in seconds
 * @example
 * calculateDuration('09:00', '10:30') // 5400 (90 minutes * 60 seconds)
 */
export const calculateDuration = (start: string, end: string): number => {
  const startTime = parseTime(start);
  const endTime = parseTime(end);
  const durationMinutes = (endTime.hours * 60 + endTime.minutes) -
                          (startTime.hours * 60 + startTime.minutes);
  return Math.max(0, durationMinutes) * 60; // Convert to seconds
};

/**
 * Calculate remaining time for a fixed task based on current time
 * @param now - Current date/time
 * @param start - Task start time in HH:MM format
 * @param end - Task end time in HH:MM format
 * @returns Remaining time in seconds
 * @example
 * // If current time is 09:30 and task is 09:00-10:00
 * calculateRemainingTime(new Date(), '09:00', '10:00') // 1800 (30 minutes remaining)
 */
export const calculateRemainingTime = (
  now: Date,
  start: string,
  end: string
): number => {
  const { hours: sH, minutes: sM } = parseTime(start);
  const { hours: eH, minutes: eM } = parseTime(end);

  const startDate = new Date(now);
  startDate.setHours(sH, sM, 0, 0);
  const endDate = new Date(now);
  endDate.setHours(eH, eM, 0, 0);

  if (now < startDate) {
    // Task hasn't started yet – full duration remaining
    return Math.max(0, (endDate.getTime() - startDate.getTime()) / 1000);
  } else if (now > endDate) {
    // Task window has passed
    return 0;
  } else {
    // Currently in-progress
    return Math.max(0, (endDate.getTime() - now.getTime()) / 1000);
  }
};

/**
 * Format seconds into human-readable time (HH:MM:SS or MM:SS)
 * @param seconds - Total seconds
 * @param includeHours - Whether to always include hours (default: auto)
 * @returns Formatted time string
 * @example
 * formatTime(3661) // '1:01:01'
 * formatTime(125) // '2:05'
 */
export const formatTime = (seconds: number, includeHours: boolean = false): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0 || includeHours) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Convert minutes to seconds
 * @param minutes - Number of minutes
 * @returns Number of seconds
 */
export const minutesToSeconds = (minutes: number): number => {
  return minutes * 60;
};

/**
 * Convert seconds to minutes
 * @param seconds - Number of seconds
 * @returns Number of minutes (rounded down)
 */
export const secondsToMinutes = (seconds: number): number => {
  return Math.floor(seconds / 60);
};

/**
 * Check if a task is currently active based on its start/end times
 * @param now - Current date/time
 * @param start - Task start time in HH:MM format
 * @param end - Task end time in HH:MM format
 * @returns true if task is currently active
 */
export const isTaskActive = (now: Date, start: string, end: string): boolean => {
  const { hours: sH, minutes: sM } = parseTime(start);
  const { hours: eH, minutes: eM } = parseTime(end);

  const startDate = new Date(now);
  startDate.setHours(sH, sM, 0, 0);
  const endDate = new Date(now);
  endDate.setHours(eH, eM, 0, 0);

  return now >= startDate && now <= endDate;
};

/**
 * Create a Date object from today with specified time
 * @param timeStr - Time in HH:MM format
 * @returns Date object for today at specified time
 */
export const createDateWithTime = (timeStr: string): Date => {
  const { hours, minutes } = parseTime(timeStr);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};
