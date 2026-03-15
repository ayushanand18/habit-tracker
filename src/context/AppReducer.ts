
import { AppState, AppAction } from '../types';
import { saveHabits, saveLogs, saveSettings } from '../services/localStorage';

export function appReducer(state: AppState, action: AppAction): AppState {
  let newState: AppState;
  
  switch (action.type) {
    case 'ADD_HABIT':
      newState = {
        ...state,
        habits: [...state.habits, action.payload],
      };
      break;

    case 'UPDATE_HABIT':
      newState = {
        ...state,
        habits: state.habits.map(habit =>
          habit.id === action.payload.id ? action.payload : habit
        ),
      };
      break;

    case 'DELETE_HABIT': {
      const newLogs = { ...state.logs };
      delete newLogs[action.payload];
      newState = {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload),
        logs: newLogs,
      };
      break;
    }

    case 'REORDER_HABITS':
      newState = {
        ...state,
        habits: action.payload,
      };
      break;

    case 'TOGGLE_LOG': {
      const { habitId, date } = action.payload;
      const habitLogs = state.logs[habitId] || {};
      const currentValue = habitLogs[date];
      
      newState = {
        ...state,
        logs: {
          ...state.logs,
          [habitId]: {
            ...habitLogs,
            [date]: currentValue === true ? false : true,
          },
        },
      };
      break;
    }

    case 'SET_THEME':
      newState = {
        ...state,
        settings: {
          ...state.settings,
          theme: action.payload,
        },
      };
      break;

    case 'SET_USER_NAME':
      newState = {
        ...state,
        settings: {
          ...state.settings,
          userName: action.payload,
        },
      };
      break;

    case 'HYDRATE':
      return action.payload; // Don't save on hydrate

    default:
      return state;
  }
  
  // Save to localStorage after state update (except for HYDRATE)
  saveHabits(newState.habits);
  saveLogs(newState.logs);
  saveSettings(newState.settings);
  
  return newState;
}
