
// Core data models
export interface Habit {
  id: string;
  name: string;
  color: string;
  frequency: 'daily' | 'custom';
  daysOfWeek: number[]; // 0-6 where 0=Sunday
  createdAt: string;
  order: number;
}

export interface Log {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  timestamp: number;
}

export interface Settings {
  theme: 'light' | 'dark';
  weekStartsOn: 0 | 1; // Sunday or Monday
  userName: string;
}

// Derived types
export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCount: number;
  weeklyRate: number;
  monthlyRate: number;
}

// Storage structure
export type LogsMap = Record<string, Record<string, boolean>>;
// Structure: { "habitId": { "2024-03-15": true, "2024-03-16": false } }

// App state
export interface AppState {
  habits: Habit[];
  logs: LogsMap;
  settings: Settings;
}

// Actions
export type AppAction =
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'REORDER_HABITS'; payload: Habit[] }
  | { type: 'TOGGLE_LOG'; payload: { habitId: string; date: string } }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_USER_NAME'; payload: string }
  | { type: 'HYDRATE'; payload: AppState };

// Storage keys
export const STORAGE_KEYS = {
  HABITS: 'habit-tracker-v1-habits',
  LOGS: 'habit-tracker-v1-logs',
  SETTINGS: 'habit-tracker-v1-settings',
} as const;
