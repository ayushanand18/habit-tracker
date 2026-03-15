
import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateAllStats } from '../../services/statistics';
import { exportCurrentMonth } from '../../services/export';
import styles from './StatsPanel.module.css';

export function StatsPanel() {
  const { state } = useApp();

  const stats = useMemo(() => {
    return calculateAllStats(state.habits, state.logs);
  }, [state.habits, state.logs]);

  const handleExport = () => {
    exportCurrentMonth(state.habits, state.logs);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Statistics</h2>
        <button
          className={styles.exportButton}
          onClick={handleExport}
          disabled={state.habits.length === 0}
          title="Export current month to CSV"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className={styles.statsList}>
        {state.habits.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Add habits to see statistics</p>
          </div>
        ) : (
          state.habits.map(habit => {
            const habitStats = stats[habit.id];
            if (!habitStats) return null;

            return (
              <div key={habit.id} className={styles.habitStat}>
                <div className={styles.habitHeader}>
                  <div
                    className={styles.habitColor}
                    style={{ backgroundColor: habit.color }}
                  />
                  <span className={styles.habitName}>{habit.name}</span>
                </div>

                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <div className={styles.statLabel}>Current</div>
                    <div className={styles.statValue}>
                      <div className={styles.streakBadge}>
                        {habitStats.currentStreak}
                      </div>
                    </div>
                  </div>

                  <div className={styles.statItem}>
                    <div className={styles.statLabel}>Longest</div>
                    <div className={styles.statValue}>
                      <div className={styles.streakBadge}>
                        {habitStats.longestStreak}
                      </div>
                    </div>
                  </div>

                  <div className={styles.statItem}>
                    <div className={styles.statLabel}>Total</div>
                    <div className={styles.statValue}>{habitStats.totalCount}</div>
                  </div>
                </div>

                <div className={styles.completionRates}>
                  <div className={styles.rateItem}>
                    <span className={styles.rateLabel}>Week</span>
                    <div className={styles.rateBar}>
                      <div
                        className={styles.rateProgress}
                        style={{
                          width: `${habitStats.weeklyRate}%`,
                          backgroundColor: habit.color,
                        }}
                      />
                    </div>
                    <span className={styles.rateValue}>{habitStats.weeklyRate}%</span>
                  </div>

                  <div className={styles.rateItem}>
                    <span className={styles.rateLabel}>Month</span>
                    <div className={styles.rateBar}>
                      <div
                        className={styles.rateProgress}
                        style={{
                          width: `${habitStats.monthlyRate}%`,
                          backgroundColor: habit.color,
                        }}
                      />
                    </div>
                    <span className={styles.rateValue}>{habitStats.monthlyRate}%</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
