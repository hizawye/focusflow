
export interface ScheduleItem {
  title: string;
  start: string;
  end: string;
}

export interface CompletionStatus {
  [key: string]: boolean;
}

export type View = 'schedule' | 'stats' | 'settings';
