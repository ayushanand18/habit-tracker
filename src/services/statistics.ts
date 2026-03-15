
import { format, subDays, startOfWeek, startOfMonth, addDays } from 'date-fns';
import { Habit, LogsMap, HabitStats } from '../types';

// Calculate current streak for a habit
export function calculateCurrentStreak(
  habit: Habit,
  logs: LogsMap
): number {
  const habitLogs = logs[habit.id] || {};
  const today = new Date();
  let streak = 0;
  let currentDate = today;

  while (true) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayOfWeek = currentDate.getDay();

    // Check if this date is in the future
    if (currentDate > today) break;

    // Check if this day is scheduled for the habit
    if (habit.daysOfWeek.includes(dayOfWeek)) {
      if (habitLogs[dateStr] === true) {
        streak++;
      } else if (habitLogs[dateStr] === false || habitLogs[dateStr] === undefined) {
        // Explicitly marked as not done or not logged
        // Only break if this is not today (allow today to be incomplete)
        if (format(currentDate, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd')) {
          break;
        }
      }
    }
    // If not a scheduled day, continue checking

    // Move to previous day
    currentDate = subDays(currentDate, 1);

    // Safety check: don't go back more than 365 days
    if (Math.abs(currentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) > 365) {
      break;
    }
  }

  return streak;
}

// Calculate longest streak for a habit
export function calculateLongestStreak(
  habit: Habit,
  logs: LogsMap
): number {
  const habitLogs = logs[habit.id] || {};
  const today = new Date();
  const startDate = subDays(today, 365); // Check last year

  let longestStreak = 0;
  let currentStreak = 0;
  let currentDate = startDate;

  while (currentDate <= today) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayOfWeek = currentDate.getDay();

    // Check if this day is scheduled for the habit
    if (habit.daysOfWeek.includes(dayOfWeek)) {
      if (habitLogs[dateStr] === true) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else if (habitLogs[dateStr] === false || (habitLogs[dateStr] === undefined && currentDate < today)) {
        currentStreak = 0;
      }
    }

    currentDate = addDays(currentDate, 1);
  }

  return longestStreak;
}

// Calculate total completion count
export function calculateTotalCount(
  habit: Habit,
  logs: LogsMap
): number {
  const habitLogs = logs[habit.id] || {};
  return Object.values(habitLogs).filter(completed => completed === true).length;
}

// Calculate completion rate for a period
export function calculateCompletionRate(
  habit: Habit,
  logs: LogsMap,
  period: 'week' | 'month'
): number {
  const habitLogs = logs[habit.id] || {};
  const today = new Date();
  const startDate = period === 'week' 
    ? startOfWeek(today, { weekStartsOn: 1 }) // Monday
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

  return scheduledDays > 0 ? Math.round((completedDays / scheduledDays) * 100) : 0;
}

// Calculate all statistics for a habit
export function calculateHabitStats(
  habit: Habit,
  logs: LogsMap
): HabitStats {
  return {
    habitId: habit.id,
    currentStreak: calculateCurrentStreak(habit, logs),
    longestStreak: calculateLongestStreak(habit, logs),
    totalCount: calculateTotalCount(habit, logs),
    weeklyRate: calculateCompletionRate(habit, logs, 'week'),
    monthlyRate: calculateCompletionRate(habit, logs, 'month'),
  };
}

// Calculate statistics for all habits
export function calculateAllStats(
  habits: Habit[],
  logs: LogsMap
): Record<string, HabitStats> {
  const stats: Record<string, HabitStats> = {};
  
  habits.forEach(habit => {
    stats[habit.id] = calculateHabitStats(habit, logs);
  });

  return stats;
}
