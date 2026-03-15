
# Key Engineering Decisions Summary

## 🎯 Framework Choice: Vite + React + TypeScript

### ✅ Why This Stack?
1. **Vite** - Lightning-fast builds, minimal bundle (~40% smaller than Next.js)
2. **React 18** - Component model perfect for grid-based UI
3. **TypeScript** - Type safety for localStorage data integrity

### ❌ What We're NOT Using (and why):
- **Next.js/Gatsby**: Overkill for single-page localStorage app, adds SSR overhead
- **Tailwind CSS**: 50-100KB bundle bloat even with purging
- **Styled-Components**: Runtime overhead + 15KB
- **Redux/Zustand**: Context API sufficient for this scale

---

## 📦 Dependencies: Minimalist Approach

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0", 
    "date-fns": "^3.0.0"     // Only 2KB gzipped!
  }
}
```

**Total Production Bundle Target: < 50KB gzipped**

---

## 🗄️ Data Architecture

### Storage Structure:
```typescript
// LocalStorage Keys
{
  "habit-tracker-v1-habits": [...],
  "habit-tracker-v1-logs": { 
    "habitId": { "2024-03-15": true, "2024-03-16": false }
  },
  "habit-tracker-v1-settings": {...}
}
```

### Why This Structure?
- **O(1) log lookups**: Nested object instead of array iteration
- **Versioned keys**: Enable future migrations without data loss
- **Normalized data**: Habits and logs separate for scalability

---

## 🎨 Styling Strategy: CSS Modules + Variables

### Why CSS Modules?
- ✅ Scoped styles by default
- ✅ Zero runtime overhead
- ✅ No naming conflicts
- ✅ Smaller than CSS-in-JS

### Theme System:
```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #1a1a1a;
  /* ... */
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
  /* ... */
}
```

---

## 🧠 State Management: Context + useReducer

**Why NOT Redux/Zustand?**
- Simple state (habits, logs, settings)
- No async operations (localStorage is sync)
- Saves 20-30KB bundle size
- Context API + useReducer = sufficient

---

## 📊 Statistics Engine

### Streak Calculation:
```typescript
// Smart streak calculation that:
// 1. Respects scheduled days (Mon/Wed/Fri habit skips Tue/Thu)
// 2. Counts backwards from today
// 3. Breaks on explicitly marked "not done" days
```

### Completion Rates:
```typescript
// Weekly/Monthly rates calculated as:
// (completed_scheduled_days / total_scheduled_days) * 100
```

---

## 📁 Project Structure

```
src/
├── components/        # UI components (feature-based)
│   ├── Header/
│   ├── HabitsPanel/
│   ├── CalendarGrid/
│   ├── StatsPanel/
│   └── Modals/
├── context/          # Global state management
├── hooks/            # Custom React hooks
├── services/         # Business logic layer
│   ├── localStorage.ts
│   ├── statistics.ts
│   └── export.ts
├── types/            # TypeScript definitions
├── utils/            # Helper functions
└── styles/           # Global CSS
```

---

## 🎯 Design Principles

1. **Mobile-First**: Responsive from 320px to 4K
2. **Performance**: React.memo + useCallback for optimization
3. **Accessibility**: Semantic HTML, keyboard navigation
4. **Privacy**: Zero tracking, all data local
5. **Simplicity**: No feature bloat, does one thing well

---

## 📈 Performance Targets

| Metric | Target |
|--------|--------|
| Bundle Size | < 50KB gzipped |
| First Contentful Paint | < 0.8s |
| Time to Interactive | < 1.5s |
| Lighthouse Score | > 95 |
| Cell Toggle Response | < 16ms (60 FPS) |

---

## 🔄 Data Flow

```
User Click
    ↓
Component Event Handler
    ↓
Context Dispatch (useReducer action)
    ↓
State Update
    ↓
useEffect → LocalStorage Sync
    ↓
Re-render (optimized with React.memo)
```

---

## 🌓 Dark Mode Strategy

1. **System Preference Detection**: `prefers-color-scheme` media query
2. **User Override**: Persisted in localStorage
3. **CSS Variables**: Instant theme switching
4. **Smooth Transition**: 300ms ease animation

---

## 📤 CSV Export Format

```csv
Habit,2024-03-01,2024-03-02,2024-03-03,2024-03-04
Read 10 Pages,✓,✓,,✓
Learn French,✓,,✓,
50 Pushups,,✓,✓,
```

**Implementation:**
- Pure JavaScript (no libraries)
- Habits as rows, dates as columns (matches UI layout)
- Respects habit schedules (only shows scheduled days)
- Blob download with proper MIME type
- Filename: `habits-YYYY-MM-DD.csv`

---

## 🚀 Implementation Order

1. **Foundation**: Project setup, types, data models
2. **Data Layer**: LocalStorage service, state management
3. **Core UI**: Grid layout, basic components
4. **Interactions**: Habit logging, navigation
5. **Features**: Statistics, export, dark mode
6. **Polish**: Responsive, animations, optimization

---

## 🔮 Future-Proof Architecture

**Not in v1.0, but architecturally prepared:**
- Cloud sync (add API layer)
- Habit reordering (drag & drop)
- Charts/graphs (add charting library)
- Mobile apps (React Native code reuse)
- Collaborative tracking (WebSocket layer)

The component structure and data models support these without refactoring.

---

## 🎨 Design Inspiration Analysis

Based on the provided UI mockup:

1. **Layout**: Grid-based, 3-column (Habits | Calendar | Stats)
2. **Calendar**: Horizontal date scroll, ~14 days visible
3. **Color Coding**: Intensity-based (lighter = newer habit, darker = streak)
4. **Stats**: Current streak, longest streak, total count
5. **Minimalist**: No clutter, clean typography, subtle borders
6. **Today Indicator**: Circular highlight on current date

This architecture implements all these visual elements efficiently.
