
import { format, addDays } from 'date-fns';
import { Habit, LogsMap } from '../types';

// Export habits data to CSV format
export function exportToCSV(
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
    const row = [escapeCSVField(habit.name)];
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

// Escape CSV field if it contains special characters
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

// Download CSV file
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    // Feature detection for download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Export current month data
export function exportCurrentMonth(habits: Habit[], logs: LogsMap): void {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const csvContent = exportToCSV(habits, logs, startDate, endDate);
  const filename = `habits-${format(today, 'yyyy-MM')}.csv`;
  
  downloadCSV(csvContent, filename);
}

// Export custom date range
export function exportDateRange(
  habits: Habit[],
  logs: LogsMap,
  startDate: Date,
  endDate: Date
): void {
  const csvContent = exportToCSV(habits, logs, startDate, endDate);
  const filename = `habits-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.csv`;
  
  downloadCSV(csvContent, filename);
}
