
import { useState, useCallback, useMemo } from 'react';
import { format, addDays, subDays, startOfDay, isSameDay } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { HabitCell } from './HabitCell';
import styles from './CalendarGrid.module.css';

export function CalendarGrid() {
  const { state, dispatch } = useApp();
  const [startDate, setStartDate] = useState(() => subDays(new Date(), 6));
  
  const today = startOfDay(new Date());
  const daysToShow = 14;

  // Generate array of dates to display
  const dates = useMemo(() => {
    const result: Date[] = [];
    for (let i = 0; i < daysToShow; i++) {
      result.push(addDays(startDate, i));
    }
    return result;
  }, [startDate, daysToShow]);

  const handlePrevious = () => {
    setStartDate(prev => subDays(prev, 7));
  };

  const handleNext = () => {
    setStartDate(prev => addDays(prev, 7));
  };

  const handleToday = () => {
    setStartDate(subDays(new Date(), 6));
  };

  const handleToggle = useCallback((habitId: string, date: string) => {
    dispatch({ type: 'TOGGLE_LOG', payload: { habitId, date } });
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <button
          className={styles.navButton}
          onClick={handlePrevious}
          aria-label="Previous week"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        
        <button
          className={styles.todayButton}
          onClick={handleToday}
        >
          Today
        </button>
        
        <button
          className={styles.navButton}
          onClick={handleNext}
          aria-label="Next week"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className={styles.grid}>
        {/* Date headers */}
        <div className={styles.dateHeaders}>
          <div className={styles.habitNameHeader}></div>
          {dates.map(date => {
            const isToday = isSameDay(date, today);
            return (
              <div
                key={date.toISOString()}
                className={`${styles.dateHeader} ${isToday ? styles.todayHeader : ''}`}
              >
                <div className={styles.dateMonth}>{format(date, 'MMM')}</div>
                <div className={styles.dateDay}>{format(date, 'd')}</div>
                <div className={styles.dateDayName}>{format(date, 'EEE')}</div>
              </div>
            );
          })}
        </div>

        {/* Habit rows */}
        <div className={styles.habitRows}>
          {state.habits.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No habits yet. Add your first habit to get started!</p>
            </div>
          ) : (
            state.habits.map(habit => (
              <div key={habit.id} className={styles.habitRow}>
                <div className={styles.habitName}>
                  <div
                    className={styles.habitColorDot}
                    style={{ backgroundColor: habit.color }}
                  />
                  <span>{habit.name}</span>
                </div>
                
                <div className={styles.habitCells}>
                  {dates.map(date => {
                    const dayOfWeek = date.getDay();
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isScheduled = habit.daysOfWeek.includes(dayOfWeek);
                    const habitLogs = state.logs[habit.id] || {};
                    const isCompleted = habitLogs[dateStr] === true;
                    const isToday = isSameDay(date, today);

                    return (
                      <HabitCell
                        key={dateStr}
                        habitId={habit.id}
                        habitColor={habit.color}
                        date={date}
                        isCompleted={isCompleted}
                        isScheduled={isScheduled}
                        isToday={isToday}
                        onToggle={handleToggle}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
