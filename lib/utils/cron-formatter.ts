/**
 * Convert cron expressions to human-readable text
 */

export function formatCronExpression(cron: string): string {
  try {
    const parts = cron.trim().split(/\s+/);
    
    if (parts.length < 5) {
      return cron; // Invalid, return as-is
    }
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    // Build readable string
    const timeParts: string[] = [];
    const dayParts: string[] = [];
    
    // Time
    if (hour === '*') {
      timeParts.push('every hour');
    } else {
      const hourNum = parseInt(hour);
      if (!isNaN(hourNum)) {
        const period = hourNum >= 12 ? 'PM' : 'AM';
        const displayHour = hourNum > 12 ? hourNum - 12 : (hourNum === 0 ? 12 : hourNum);
        const minuteStr = minute === '0' || minute === '00' ? '00' : minute;
        timeParts.push(`at ${displayHour}:${minuteStr.padStart(2, '0')} ${period}`);
      }
    }
    
    // Days
    if (dayOfWeek !== '*') {
      const days = dayOfWeek.split(',').map(d => {
        if (d.includes('-')) {
          const [start, end] = d.split('-');
          return `${getDayName(start)}-${getDayName(end)}`;
        }
        return getDayName(d);
      });
      
      if (days.length === 5 && dayOfWeek === '1-5') {
        dayParts.push('on weekdays');
      } else if (days.length === 2 && (dayOfWeek === '0,6' || dayOfWeek === '6,0')) {
        dayParts.push('on weekends');
      } else {
        dayParts.push(`on ${days.join(', ')}`);
      }
    } else if (dayOfMonth !== '*') {
      dayParts.push(`on day ${dayOfMonth} of the month`);
    } else {
      dayParts.push('every day');
    }
    
    return `${timeParts.join(' ')} ${dayParts.join(' ')}`.trim();
    
  } catch (error) {
    return cron; // On error, return original
  }
}

function getDayName(day: string): string {
  const days: Record<string, string> = {
    '0': 'Sunday',
    '1': 'Monday',
    '2': 'Tuesday',
    '3': 'Wednesday',
    '4': 'Thursday',
    '5': 'Friday',
    '6': 'Saturday',
    '7': 'Sunday', // Some systems use 7 for Sunday
  };
  
  return days[day] || day;
}

/**
 * Format recipient references to be user-friendly
 */
export function formatRecipient(recipient: string): string {
  if (recipient.startsWith('user:')) {
    return 'Current User';
  }
  if (recipient.startsWith('role:')) {
    const role = recipient.split(':')[1];
    return role.charAt(0).toUpperCase() + role.slice(1);
  }
  if (recipient.includes('@')) {
    return recipient; // Email address
  }
  return recipient;
}

/**
 * Format multiple recipients
 */
export function formatRecipients(recipients: string[]): string {
  if (!recipients || recipients.length === 0) {
    return 'No recipients';
  }
  
  if (recipients.length === 1) {
    return formatRecipient(recipients[0]);
  }
  
  const formatted = recipients.map(formatRecipient);
  
  if (formatted.length === 2) {
    return formatted.join(' and ');
  }
  
  return formatted.slice(0, -1).join(', ') + ', and ' + formatted[formatted.length - 1];
}

