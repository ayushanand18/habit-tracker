
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction } from '../types';
import { appReducer } from './AppReducer';
import { loadAppState, saveHabits, saveLogs, saveSettings } from '../services/localStorage';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Function to get initial state (lazy initialization)
function getInitialState(): AppState {
  return loadAppState();
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Use lazy initialization by calling getInitialState() directly
  const [state, dispatch] = useReducer(appReducer, getInitialState());

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
  }, [state.settings.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the app context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
