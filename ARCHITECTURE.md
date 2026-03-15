
# Daily Habit Tracker - Architecture Document

## Executive Summary

A lightweight, single-page daily habit tracker built with Vite + React + TypeScript. Data persists in localStorage with no backend dependencies. Target bundle size: <50KB gzipped.

---

## 1. Technology Stack & Rationale

### Core Framework: **Vite + React 18 + TypeScript**

**Why Vite over Next.js/Gatsby:**
- **Bundle Size**: Vite produces ~40% smaller production bundles
- **No SSR Overhead**: This app doesn't need server-side rendering
- **Build Speed**: 10-20x faster than webpack-based tools
- **Zero Config**: Minimal setup, immediate productivity

**Why React:**
- Component-based architecture matches the design perfectly
- Built-in hooks eliminate need for external state libraries
- Virtual DOM efficient for frequent habit logging updates
- Industry standard with excellent TypeScript support

**Why TypeScript:**
- Type safety prevents localStorage data corruption
- Better IDE autocomplete and refactoring
- Minimal runtime overhead (compiles to vanilla JS)
- Self-documenting code

### Package Manager: **pnpm**

**Rationale:**
- 3x faster than npm, 2x faster than yarn
- Disk space efficient with content-addressable storage
- Strict node_modules structure prevents phantom dependencies
- Workspace support for future scalability

### Dependencies (Minimal Approach)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "date-fns": "^3.0.0"
  }
}
```

**Why ONLY date-fns:**
- **2KB gzipped** vs Moment.js (70KB) or Day.js (7KB)
- Tree-shakeable: Only import functions you use
- Immutable and pure functions
- Excellent TypeScript support

**What we're AVOIDING:**
- ❌ Tailwind CSS: Adds ~50-100KB even with purging
- ❌ Styled-Components: Runtime overhead + 15KB bundle
- ❌ Redux/Zustand: Unnecessary for this scale
- ❌ React Router: Single page, no routing needed
- ❌ Axios: Fetch API is sufficient (no API calls anyway)

---

## 2. Data Architecture

### 2.1 Data Models

```typescript
// Core Types
interface Habit {
  id: string;              // UUID v4
  name: string;            // Max 50 chars
  color: string;           // Hex color (#rrggbb)
  frequency: 'daily' | 'custom';
  daysOfWeek: number[];    // [0-6] where 0=Sunday
  createdAt: string;       // ISO 8601 date
  order: number;           // Display order
}

interface Log {
  habitId: string;
  date: string;            // YYYY-MM-DD format
  completed: boolean;
  timestamp: number;       // Unix timestamp for audit
}

interface Settings {
  theme: 'light' | 'dark';
  weekStartsOn: 0 | 1;     // Sunday or Monday
  userName: string;
  showStats: boolean;
}

// Derived Types
interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCount: number;
  weeklyRate: number;      // Percentage
  monthlyRate: number;     // Percentage
}
```

### 2.2 LocalStorage Strategy

**Storage Keys:**
```typescript
const STORAGE_KEYS = {
  HABITS: 'habit-tracker-v1-habits',
  LOGS: 'habit-tracker-v1-logs',
  SETTINGS: 'habit-tracker-v1-settings',
  VERSION: 'habit-tracker-v1-version'
} as const;
```

**Version prefix** allows future migrations without data loss.

**Data Indexing Strategy:**

```typescript
// Logs stored as Map for O(1) lookups
type LogsMap = Record<string, Record<string, boolean>>;
// Structure: { "habitId": { "2024-03-15": true, "2024-03-16": false } }
```

**Rationale:**
- Nested object structure enables instant date lookups
- Avoids array iteration for checking if habit was logged
- Efficient for statistics calculations
- Easy to serialize/deserialize with JSON

### 2.3 Data Flow Architecture

```
User Action → Component Event
     ↓
Context Dispatch (useReducer)
     ↓
State Update + Side Effect
     ↓
LocalStorage Sync (useEffect)
     ↓
UI Re-render (optimized with React.memo)
```

---

## 3. Component Architecture

### 3.1 Component Tree

```
App (Theme Provider)
├── AppContext.Provider (Global State)
│   ├── Header
│   │   ├── Logo
│   │   ├── UserInfo
│   │   └── ThemeToggle
│   │
│   ├── MainGrid (CSS Grid Layout)
│   │   ├── HabitsPanel
│   │   │   ├── HabitsList
│   │   │   │   └── HabitItem (x N)
│   │   │   └── AddHabitButton
│   │   │
│   │   ├── CalendarGrid
│   │   │   ├── DateHeader
│   │   │   │   ├── NavigateButton (Previous)
│   │   │   │   ├── DateColumns (x 14)
│   │   │   │   └── NavigateButton (Next)
│   │   │   │
│   │   │   └── HabitsGrid
│   │   │       └── HabitRow (x N)
│   │   │           └── HabitCell (x 14)
│   │   │
│   │   └── StatsPanel
│   │       ├── ExportButton
│   │       └── HabitStatsList
│   │           └── HabitStat (x N)
│   │
│   └── Modals (Portal)
│       ├── AddHabitModal
│       └── EditHabitModal
```

### 3.2 Component Responsibilities

**App:**
- Initialize theme from localStorage/system preference
- Provide global context
- Handle modal state

**HabitsPanel:**
- Display habit list (left sidebar)
- Handle habit ordering (drag & drop in v2)
- Add new habit button

**CalendarGrid:**
- Display 14-day scrolling window
- Navigate previous/next dates
- Render habit cells in grid layout
- Highlight today's date

**HabitCell:**
- Display completion status (color intensity)
- Handle click to toggle completion
- Show tooltip on hover (optional)
- Memoized to prevent unnecessary re-renders

**StatsPanel:**
- Calculate and display streaks
- Show completion percentages
- Export button

### 3.3 Performance Optimizations

**1. React.memo for HabitCell:**
```typescript
export const HabitCell = React.memo(({ habitId, date, isCompleted, onToggle }) => {
  // Only re-renders if props change
}, (prevProps, nextProps) => {
  return prevProps.isCompleted === nextProps.isCompleted;
});
```

**2. useCallback for event handlers:**
```typescript
const handleToggle = useCallback((habitId: string, date: string) => {
  dispatch({ type: 'TOGGLE_LOG', payload: { habitId, date } });
}, [dispatch]);
```

**3. useMemo for expensive calculations:**
```typescript
const habitStats = useMemo(() => {
  return calculateStats(habits, logs);
}, [habits, logs]);
```

---

## 4. State Management

### 4.1 Context + useReducer Pattern

**Why NOT Redux/Zustand:**
- App state is simple (habits, logs, settings)
- No async actions (localStorage is synchronous)
- Context API + useReducer sufficient for this scale
- Saves ~20-30KB in bundle size

### 4.2 Reducer Actions

```typescript
type Action =
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'REORDER_HABITS'; payload: string[] }
  | { type: 'TOGGLE_LOG'; payload: { habitId: string; date: string } }
  | { type: 'BULK_IMPORT'; payload: { habits: Habit[]; logs: Log[] } }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'HYDRATE'; payload: AppState };
```

### 4.3 LocalStorage Sync

```typescript
// Auto-sync on state changes
useEffect(() => {
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(state.habits));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(state.logs));
}, [state.habits, state.logs]);

// Hydrate on mount
useEffect(() => {
  const savedHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
  const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
  
  if (savedHabits && savedLogs) {
    dispatch({
      type: 'HYDRATE',
      payload: {
        habits: JSON.parse(savedHabits),
        logs: JSON.parse(savedLogs)
      }
    });
  }
}, []);
```

---

## 5. Styling Architecture

### 5.1 CSS Modules + CSS Variables

**Why CSS Modules:**
- Scoped styles by default
- No naming conflicts
- Zero runtime overhead
- Smaller than CSS-in-JS solutions

**Why CSS Variables:**
- Native browser support
- Easy theme switching
- No JS execution for style changes
- Smooth transitions

### 5.2 Theme System

```css
/* Global CSS Variables */
:root {
  /* Light Theme Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  
  /* Habit Colors */
  --color-green: #4ade80;
  --color-blue: #60a5fa;
  --color-yellow: #fbbf24;
  --color-orange: #fb923c;
  --color-red: #f87171;
  
  /* Layout */
  --header-height: 64px;
  --sidebar-width: 200px;
  --cell-size: 40px;
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --border-color: #404040;
}
```

### 5.3 Color Intensity System

**Habit completion visualization:**
```typescript
// Color intensity based on completion streak
const getIntensity = (streak: number): number => {
  if (streak === 0) return 0.1;  // Very light
  if (streak <= 3) return 0.3;   // Light
  if (streak <= 7) return 0.5;   // Medium
  if (streak <= 14) return 0.7;  // Dark
  return 0.9;                     // Very dark
};

// Apply as CSS opacity or rgba alpha
```

---

## 6. Statistics Calculation Engine

### 6.1 Streak Calculation Algorithm

```typescript
function calculateCurrentStreak(habitId: string, logs: LogsMap): number {
  const habitLogs = logs[habitId] || {};
  const today = format(new Date(), 'yyyy-MM-dd');
  
  let streak = 0;
  let currentDate = new Date();
  
  while (true) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    // Stop if we've gone past today
    if (dateStr > today) break;
    
    // Check if habit was logged on this date
    if (habitLogs[dateStr] === true) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else if (habitLogs[dateStr] === false) {
      // Explicitly marked as not done
      break;
    } else {
      // No entry for this date, could be a scheduled off day
      // Check if this date was scheduled for this habit
      const dayOfWeek = currentDate.getDay();
      if (!habit.daysOfWeek.includes(dayOfWeek)) {
        // This was an off day, continue streak
        currentDate = subDays(currentDate, 1);
      } else {
        // This was a scheduled day but not logged, break streak
        break;
      }
    }
  }
  
  return streak;
}
```

### 6.2 Completion Rate Calculation

```typescript
function calculateCompletionRate(
  habitId: string,
  habit: Habit,
  logs: LogsMap,
  period: 'week' | 'month'
): number {
  const habitLogs = logs[habitId] || {};
  const today = new Date();
  const startDate = period === 'week' 
    ? startOfWeek(today)
    : startOfMonth(today);
  
  let scheduledDays = 0;
  let completedDays = 0;
  
  let currentDate = startDate;
  while (currentDate <= today) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    // Check if this day is scheduled for the habit
    if (habit.daysOfWeek.includes(dayOfWeek)) {
      scheduledDays++;
      if (habitLogs[dateStr] === true) {
        completedDays++;
      }
    }
    
    currentDate = addDays(currentDate, 1);
  }
  
  return scheduledDays > 0 ? (completedDays / scheduledDays) * 100 : 0;
}
```

---

## 7. CSV Export Implementation

### 7.1 Export Format

```csv
Habit,2024-03-01,2024-03-02,2024-03-03,2024-03-04,2024-03-05
Read 10 Pages,✓,✓,,,✓
Learn French,✓,,✓,,
50 Pushups,,✓,✓,✓,
Play Guitar,✓,✓,✓,,✓
```

### 7.2 Export Algorithm

```typescript
function exportToCSV(
  habits: Habit[],
  logs: LogsMap,
  startDate: Date,
  endDate: Date
): string {
  // Generate date columns
  const dateColumns: string[] = [];
  let currentDate = startDate;
  while (currentDate <= endDate) {
    dateColumns.push(format(currentDate, 'yyyy-MM-dd'));
    currentDate = addDays(currentDate, 1);
  }
  
  // CSV Header: Habit | Date1 | Date2 | Date3 ...
  const headers = ['Habit', ...dateColumns];
  const rows = [headers.join(',')];
  
  // Generate row for each habit
  for (const habit of habits) {
    const row = [habit.name];
    const habitLogs = logs[habit.id] || {};
    
    // For each date column, check if habit was completed
    for (const dateStr of dateColumns) {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();
      
      // Check if this day is scheduled for the habit
      if (habit.daysOfWeek.includes(dayOfWeek)) {
        row.push(habitLogs[dateStr] === true ? '✓' : '');
      } else {
        // Not scheduled, leave empty
        row.push('');
      }
    }
    
    rows.push(row.join(','));
  }
  
  return rows.join('\n');
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
```

---

## 8. Project Structure

```
habit-tracker/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.module.css
│   │   │   └── ThemeToggle.tsx
│   │   ├── HabitsPanel/
│   │   │   ├── HabitsPanel.tsx
│   │   │   ├── HabitsPanel.module.css
│   │   │   ├── HabitItem.tsx
│   │   │   └── AddHabitButton.tsx
│   │   ├── CalendarGrid/
│   │   │   ├── CalendarGrid.tsx
│   │   │   ├── CalendarGrid.module.css
│   │   │   ├── DateHeader.tsx
│   │   │   ├── HabitRow.tsx
│   │   │   └── HabitCell.tsx
│   │   ├── StatsPanel/
│   │   │   ├── StatsPanel.tsx
│   │   │   ├── StatsPanel.module.css
│   │   │   └── HabitStats.tsx
│   │   └── Modals/
│   │       ├── AddHabitModal.tsx
│   │       └── Modal.module.css
│   ├── context/
│   │   ├── AppContext.tsx
│   │   └── AppReducer.ts
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   └── useTheme.ts
│   ├── services/
│   │   ├── localStorage.ts
│   │   ├── statistics.ts
│   │   └── export.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── dateHelpers.ts
│   │   └── colorHelpers.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── variables.css
│   ├── App.tsx
│   ├── App.module.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 9. Responsive Design Strategy

### 9.1 Breakpoints

```css
/* Mobile First Approach */
:root {
  --breakpoint-mobile: 768px;
  --breakpoint-tablet: 1024px;
  --breakpoint-desktop: 1440px;
}
```

### 9.2 Layout Adaptations

**Desktop (>1024px):**
- 14 days visible in calendar
- Full sidebar panels visible
- Grid layout: Sidebar | Calendar | Stats

**Tablet (768-1024px):**
- 10 days visible in calendar
- Collapsible stats panel
- Grid layout: Sidebar | Calendar | (Toggle Stats)

**Mobile (<768px):**
- 7 days visible in calendar
- Bottom sheet for habits list
- Stack layout: Calendar on top, controls at bottom
- Swipe gestures for navigation

---

## 10. Dark Mode Implementation

### 10.1 System Preference Detection

```typescript
function getInitialTheme(): 'light' | 'dark' {
  // 1. Check localStorage first (user preference)
  const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (saved) {
    const settings = JSON.parse(saved);
    if (settings.theme) return settings.theme;
  }
  
  // 2. Check system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  // 3. Default to light
  return 'light';
}
```

### 10.2 Theme Toggle Animation

```css
* {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

---

## 11. Future Enhancements (v2.0)

**Not included in v1.0 but architecturally prepared for:**

1. **Cloud Sync**: Backend API for multi-device sync
2. **Habit Ordering**: Drag & drop to reorder habits
3. **Custom Frequencies**: "Every 2 days", "3x per week", etc.
4. **Notes**: Add notes to daily logs
5. **Habit Groups**: Categories/tags for habits
6. **Advanced Stats**: Charts, trends, heatmaps
7. **Reminders**: Browser notifications (with permission)
8. **Data Import**: Import from CSV
9. **Habit Templates**: Pre-defined habit suggestions
10. **Habit Archiving**: Archive completed/old habits

---

## 12. Testing Strategy

### 12.1 Manual Testing Checklist

- [ ] Add habit with daily frequency
- [ ] Add habit with custom days (e.g., Mon/Wed/Fri)
- [ ] Toggle habit completion for today
- [ ] Toggle habit completion for past dates
- [ ] Navigate calendar forward/backward
- [ ] Verify streaks calculate correctly
- [ ] Verify completion rates calculate correctly
- [ ] Export CSV and verify data
- [ ] Switch to dark mode and verify styles
- [ ] Reload page and verify data persists
- [ ] Test responsive design on mobile
- [ ] Test with 10+ habits
- [ ] Test with 3+ months of data

### 12.2 Edge Cases to Test

- [ ] First-time user (no localStorage data)
- [ ] Corrupted localStorage data
- [ ] localStorage quota exceeded
- [ ] Habit scheduled for specific days, check off-days don't break streak
- [ ] Export with zero data
- [ ] Export with single habit
- [ ] Same habit name as another
- [ ] Very long habit names (>50 chars)
- [ ] Browser back button (should do nothing)
- [ ] Multiple browser tabs open simultaneously

---

## 13. Performance Targets

**Bundle Size:**
- Main JS bundle: < 40KB gzipped
- Main CSS bundle: < 5KB gzipped
- Total initial load: < 50KB gzipped

**Performance Metrics:**
- First Contentful Paint: < 0.8s
- Time to Interactive: < 1.5s
- Lighthouse Score: > 95

**Runtime Performance:**
- Habit cell toggle response: < 16ms (60 FPS)
- Calendar navigation: < 100ms
- Statistics calculation: < 50ms
- Export generation: < 200ms

---

## 14. Browser Compatibility

**Target Support:**
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions

**Required Features:**
- CSS Grid & Flexbox
- CSS Variables
- LocalStorage API
- ES2020 features (optional chaining, nullish coalescing)
- Date API

**No Polyfills Needed**: All target browsers support these features natively.

---

## 15. Security & Privacy

**Data Privacy:**
- All data stored locally (no server transmission)
- No analytics/tracking scripts
- No external API calls
- No cookies used

**XSS Prevention:**
- React's built-in XSS protection (escaped by default)
- No `dangerouslySetInnerHTML` usage
- Strict TypeScript types

**Data Integrity:**
- Versioned localStorage keys for migration safety
- JSON schema validation on hydration
- Backup mechanism (export CSV as backup)

---

## Conclusion

This architecture prioritizes **simplicity, performance, and user privacy** while delivering a feature-complete habit tracking experience. The minimalist technology stack ensures fast load times, small bundle size, and maintainable code.

The modular component structure and typed data models make future enhancements straightforward without requiring architectural changes.
