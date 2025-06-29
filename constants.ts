// Default schedule for first-time users only. Do NOT import this for live schedule state.
// The actual schedule is stored in localStorage and managed in App.tsx.
import { ScheduleItem } from './types.ts';

export const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { title: "Morning Focus", start: "08:00", end: "10:00" },
  { title: "Break", start: "10:00", end: "10:30" },
  { title: "Deep Work", start: "10:30", end: "12:30" },
  { title: "Lunch", start: "12:30", end: "13:30" },
  { title: "Afternoon Session", start: "13:30", end: "15:30" },
  { title: "Wrap Up", start: "15:30", end: "16:00" }
];