export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface ScheduleItem {
  title: string;
  start: string;
  end: string;
  subtasks?: SubTask[];
  icon?: string; // e.g. 'brain', 'coffee', etc.
  color?: string; // e.g. 'blue', 'green', etc.
}

export interface CompletionStatus {
  [key: string]: boolean;
}

export type View = 'schedule' | 'stats' | 'settings';
