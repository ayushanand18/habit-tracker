
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AddHabitModal } from '../Modals/AddHabitModal';
import styles from './HabitsPanel.module.css';

export function HabitsPanel() {
  const { state, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (habitId: string) => {
    if (window.confirm('Are you sure you want to delete this habit? All logs will be deleted.')) {
      dispatch({ type: 'DELETE_HABIT', payload: habitId });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Habits</h2>
        <button
          className={styles.addButton}
          onClick={() => setIsModalOpen(true)}
          title="Add new habit"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <div className={styles.habitsList}>
        {state.habits.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No habits yet</p>
            <button
              className={styles.emptyStateButton}
              onClick={() => setIsModalOpen(true)}
            >
              Add your first habit
            </button>
          </div>
        ) : (
          state.habits.map(habit => (
            <div key={habit.id} className={styles.habitItem}>
              <div className={styles.habitInfo}>
                <div
                  className={styles.habitColor}
                  style={{ backgroundColor: habit.color }}
                />
                <div className={styles.habitDetails}>
                  <div className={styles.habitName}>{habit.name}</div>
                  <div className={styles.habitFrequency}>
                    {habit.frequency === 'daily' ? 'Daily' : 
                      habit.daysOfWeek.length === 7 ? 'Daily' :
                      habit.daysOfWeek.length === 1 ? '1 day/week' :
                      `${habit.daysOfWeek.length} days/week`
                    }
                  </div>
                </div>
              </div>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(habit.id)}
                title="Delete habit"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <AddHabitModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
