
import React from 'react';
import { format } from 'date-fns';
import styles from './HabitCell.module.css';

interface HabitCellProps {
  habitId: string;
  habitColor: string;
  date: Date;
  isCompleted: boolean;
  isScheduled: boolean;
  isToday: boolean;
  onToggle: (habitId: string, date: string) => void;
}

export const HabitCell = React.memo(function HabitCell({
  habitId,
  habitColor,
  date,
  isCompleted,
  isScheduled,
  isToday,
  onToggle,
}: HabitCellProps) {
  const dateStr = format(date, 'yyyy-MM-dd');

  const handleClick = () => {
    if (isScheduled) {
      onToggle(habitId, dateStr);
    }
  };

  const getCellClassName = () => {
    const classes = [styles.cell];
    
    if (isToday) {
      classes.push(styles.today);
    }
    
    if (!isScheduled) {
      classes.push(styles.notScheduled);
      return classes.join(' ');
    }
    
    if (isCompleted) {
      classes.push(styles.completed);
    } else {
      classes.push(styles.incomplete);
    }
    
    return classes.join(' ');
  };

  return (
    <button
      className={getCellClassName()}
      onClick={handleClick}
      disabled={!isScheduled}
      style={{
        '--habit-color': habitColor,
      } as React.CSSProperties}
      aria-label={`${isCompleted ? 'Completed' : 'Not completed'} on ${format(date, 'MMM d')}`}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.isCompleted === nextProps.isCompleted &&
    prevProps.isScheduled === nextProps.isScheduled &&
    prevProps.isToday === nextProps.isToday
  );
});
