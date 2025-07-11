import { Id } from "./convex/_generated/dataModel";

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface ScheduleItem {
  _id?: Id<"scheduleItems">; // Convex ID for the item
  title: string;
  start?: string; // Optional for non-timed tasks
  end?: string;   // Optional for non-timed tasks
  
  // Flexible scheduling properties
  isFlexible?: boolean; // If true, task can be scheduled flexibly
  isTimeless?: boolean; // If true, task has no specific time (just a todo)
  duration?: number; // Duration in minutes for flexible tasks
  preferredTimeSlots?: string[]; // Preferred time slots like ['morning', 'afternoon', 'evening']
  earliestStart?: string; // Earliest possible start time for flexible tasks
  latestEnd?: string; // Latest possible end time for flexible tasks
  
  // Suggested times for flexible tasks (computed)
  suggestedStart?: string; // AI-suggested start time for flexible tasks
  suggestedEnd?: string; // AI-suggested end time for flexible tasks
  
  remainingDuration?: number;
  isRunning?: boolean;
  isPaused?: boolean;
  pausedAt?: number; // timestamp when paused
  startedAt?: number; // timestamp when timer started
  totalElapsed?: number; // total elapsed time in seconds
  subtasks?: SubTask[];
  icon?: string; // e.g. 'brain', 'coffee', etc.
  color?: string; // e.g. 'blue', 'green', etc.
  manualStatus?: 'done' | 'missed'; // User can manually mark as done/missed
}

export interface CompletionStatus {
  [key: string]: boolean;
}

export type View = 'schedule' | 'stats' | 'settings';
