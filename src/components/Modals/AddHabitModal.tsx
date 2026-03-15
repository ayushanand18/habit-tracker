
import { useState, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { Habit } from '../../types';
import styles from './Modal.module.css';

interface AddHabitModalProps {
  onClose: () => void;
}

const COLORS = [
  { name: 'Green', value: '#4ade80' },
  { name: 'Blue', value: '#60a5fa' },
  { name: 'Yellow', value: '#fbbf24' },
  { name: 'Orange', value: '#fb923c' },
  { name: 'Red', value: '#f87171' },
  { name: 'Purple', value: '#a78bfa' },
];

const DAYS = [
  { name: 'Sun', value: 0 },
  { name: 'Mon', value: 1 },
  { name: 'Tue', value: 2 },
  { name: 'Wed', value: 3 },
  { name: 'Thu', value: 4 },
  { name: 'Fri', value: 5 },
  { name: 'Sat', value: 6 },
];

export function AddHabitModal({ onClose }: AddHabitModalProps) {
  const { state, dispatch } = useApp();
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0].value);
  const [frequency, setFrequency] = useState<'daily' | 'custom'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (name.trim() === '') {
      alert('Please enter a habit name');
      return;
    }

    if (frequency === 'custom' && selectedDays.length === 0) {
      alert('Please select at least one day');
      return;
    }

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      frequency,
      daysOfWeek: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : selectedDays,
      createdAt: new Date().toISOString(),
      order: state.habits.length,
    };

    dispatch({ type: 'ADD_HABIT', payload: newHabit });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add New Habit</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label htmlFor="habit-name" className={styles.label}>
              Habit Name
            </label>
            <input
              id="habit-name"
              type="text"
              className={styles.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Read 10 pages"
              maxLength={50}
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Color</label>
            <div className={styles.colorGrid}>
              {COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  className={`${styles.colorOption} ${color === c.value ? styles.colorSelected : ''}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setColor(c.value)}
                  aria-label={c.name}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Frequency</label>
            <div className={styles.frequencyOptions}>
              <button
                type="button"
                className={`${styles.frequencyButton} ${frequency === 'daily' ? styles.active : ''}`}
                onClick={() => {
                  setFrequency('daily');
                  setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
                }}
              >
                Every Day
              </button>
              <button
                type="button"
                className={`${styles.frequencyButton} ${frequency === 'custom' ? styles.active : ''}`}
                onClick={() => setFrequency('custom')}
              >
                Custom Days
              </button>
            </div>
          </div>

          {frequency === 'custom' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Select Days</label>
              <div className={styles.daysGrid}>
                {DAYS.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    className={`${styles.dayButton} ${selectedDays.includes(day.value) ? styles.daySelected : ''}`}
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
            >
              Add Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
