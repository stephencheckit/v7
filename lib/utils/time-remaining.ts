/**
 * Time Remaining Utilities
 * Calculate and format time remaining for scheduled work
 */

export interface TimeRemaining {
  totalMinutes: number;
  days: number;
  hours: number;
  minutes: number;
  isOverdue: boolean;
  display: string;
}

/**
 * Calculate time remaining until a deadline
 */
export function getTimeRemaining(dueAt: string | Date): TimeRemaining {
  const now = new Date();
  const due = new Date(dueAt);
  const diff = due.getTime() - now.getTime();
  
  const isOverdue = diff < 0;
  const absDiff = Math.abs(diff);
  
  const totalMinutes = Math.floor(absDiff / 60000);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const days = Math.floor(totalMinutes / 1440);
  
  return {
    totalMinutes,
    days,
    hours,
    minutes,
    isOverdue,
    display: formatTimeDisplay(days, hours, minutes, isOverdue)
  };
}

/**
 * Format time as "2d 3h", "45m", "OVERDUE: 2h 15m"
 */
function formatTimeDisplay(days: number, hours: number, minutes: number, isOverdue: boolean): string {
  const parts: string[] = [];
  
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes}m`);
  }
  
  const timeStr = parts.join(' ');
  
  return isOverdue ? `${timeStr} overdue` : timeStr;
}

/**
 * Get short time display (e.g., "2h 15m" or "45m")
 */
export function getShortTimeDisplay(dueAt: string | Date): string {
  const remaining = getTimeRemaining(dueAt);
  return remaining.display;
}

/**
 * Determine if an instance is overdue
 */
export function isOverdue(dueAt: string | Date): boolean {
  return new Date(dueAt) < new Date();
}

/**
 * Determine if an instance is due (scheduled_for has passed, but not overdue)
 */
export function isDue(scheduledFor: string | Date, dueAt: string | Date): boolean {
  const now = new Date();
  const scheduled = new Date(scheduledFor);
  const due = new Date(dueAt);
  
  return now >= scheduled && now < due;
}

/**
 * Determine if an instance is "up next" (due within the next hour)
 */
export function isUpNext(scheduledFor: string | Date, dueAt: string | Date): boolean {
  const now = new Date();
  const scheduled = new Date(scheduledFor);
  const due = new Date(dueAt);
  const oneHourFromNow = new Date(now.getTime() + 3600000); // 1 hour
  
  // Not yet due, but scheduled within the next hour
  return scheduled > now && scheduled <= oneHourFromNow && due > now;
}

/**
 * Get when an instance will be due (for "up next" items)
 */
export function getTimeUntilDue(scheduledFor: string | Date): string {
  const now = new Date();
  const scheduled = new Date(scheduledFor);
  const diff = scheduled.getTime() - now.getTime();
  
  if (diff < 0) return 'now';
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `in ${hours}h ${minutes % 60}m`;
  }
  return `in ${minutes}m`;
}

/**
 * Get color class based on urgency
 */
export function getUrgencyColor(dueAt: string | Date): 'red' | 'yellow' | 'green' {
  const remaining = getTimeRemaining(dueAt);
  
  if (remaining.isOverdue) return 'red';
  if (remaining.totalMinutes < 60) return 'yellow'; // Less than 1 hour
  return 'green';
}

