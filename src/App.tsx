
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header/Header';
import { HabitsPanel } from './components/HabitsPanel/HabitsPanel';
import { CalendarGrid } from './components/CalendarGrid/CalendarGrid';
import { StatsPanel } from './components/StatsPanel/StatsPanel';
import styles from './App.module.css';

function App() {
  return (
    <AppProvider>
      <div className={styles.app}>
        <Header />
        <div className={styles.main}>
          <HabitsPanel />
          <CalendarGrid />
          <StatsPanel />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
