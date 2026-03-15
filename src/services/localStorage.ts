
import { Habit, LogsMap, Settings, AppState, STORAGE_KEYS } from '../types';

// Default settings
const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  weekStartsOn: 1, // Monday
  userName: 'User',
};

// Get initial theme from system preference
function getSystemTheme(): 'light' | 'dark' {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

// Save habits to localStorage
export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (error) {
    console.error('Failed to save habits:', error);
  }
}

// Load habits from localStorage
export function loadHabits(): Habit[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load habits:', error);
  }
  return [];
}

// Save logs to localStorage
export function saveLogs(logs: LogsMap): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (error) {
    console.error('Failed to save logs:', error);
  }
}

// Load logs from localStorage
export function loadLogs(): LogsMap {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load logs:', error);
  }
  return {};
}

// Save settings to localStorage
export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

// Load settings from localStorage
export function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  // Return default settings with system theme
  return {
    ...DEFAULT_SETTINGS,
    theme: getSystemTheme(),
  };
}

// Load all data from localStorage
export function loadAppState(): AppState {
  return {
    habits: loadHabits(),
    logs: loadLogs(),
    settings: loadSettings(),
  };
}

// Clear all app data
export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}
