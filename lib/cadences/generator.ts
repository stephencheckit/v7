import { RRule } from 'rrule';
import { FormCadence, FormInstance, ScheduleConfig } from '@/lib/types/cadence';
import { createClient } from '@/lib/supabase/server';
import { addHours, parseISO, formatISO } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Generate form instances for a cadence
 * looking ahead by specified hours
 */
export async function generateInstancesForCadence(
  cadence: FormCadence,
  lookAheadHours: number = 336 // 14 days by default (2 weeks)
): Promise<FormInstance[]> {
  const { schedule_config, workspace_id, form_id, id: cadence_id, name } = cadence;
  
  if (schedule_config.type !== 'recurring') {
    console.log(`Skipping non-recurring cadence: ${cadence_id}`);
    return [];
  }

  const instances: FormInstance[] = [];
  // Start from beginning of today to include today's instances
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const lookAheadUntil = addHours(now, lookAheadHours);

  // Get next occurrences based on schedule
  const occurrences = calculateNextOccurrences(schedule_config, now, lookAheadUntil);

  console.log(`📅 Cadence ${name}: Found ${occurrences.length} occurrences in next ${lookAheadHours}h`);

  const supabase = await createClient();

  for (const occurrence of occurrences) {
    // Check if instance already exists for this time slot
    const exists = await checkInstanceExists(supabase, cadence_id, occurrence);
    
    if (!exists) {
      const instance = await createInstance(
        supabase,
        cadence,
        occurrence
      );
      
      if (instance) {
        instances.push(instance);
      }
    }
  }

  console.log(`✅ Created ${instances.length} new instances for cadence: ${name}`);
  return instances;
}

/**
 * Calculate next occurrences based on schedule config
 * Returns Date objects in UTC that represent the correct moment in the user's timezone
 * 
 * IMPORTANT: We store times in UTC, but the input time is in the user's local timezone
 * Example: User in EST enters "9:00 AM" -> we store as "2:00 PM UTC" (9am + 5 hours)
 */
function calculateNextOccurrences(
  config: ScheduleConfig,
  startDate: Date,
  endDate: Date
): Date[] {
  const { pattern, time, timezone, days_of_week } = config;
  
  // Parse time (HH:mm) - this is the LOCAL time in the user's timezone
  const [hours, minutes] = time.split(':').map(Number);
  
  // Build RRule to generate date occurrences (dates only, ignore time for now)
  const dtstart = new Date(startDate);
  dtstart.setHours(0, 0, 0, 0);
  
  const until = new Date(endDate);
  until.setHours(23, 59, 59, 999);

  let rule: RRule;
  
  switch (pattern) {
    case 'daily':
      rule = new RRule({
        freq: RRule.DAILY,
        dtstart,
        until,
        ...(days_of_week.length < 7 && { byweekday: days_of_week.map(d => d - 1) })
      });
      break;
      
    case 'weekly':
      rule = new RRule({
        freq: RRule.WEEKLY,
        dtstart,
        until,
        byweekday: days_of_week.map(d => d - 1)
      });
      break;
      
    case 'monthly':
      rule = new RRule({
        freq: RRule.MONTHLY,
        dtstart,
        until,
        bymonthday: [1]
      });
      break;
      
    case 'quarterly':
      rule = new RRule({
        freq: RRule.MONTHLY,
        interval: 3,
        dtstart,
        until,
        bymonthday: [1]
      });
      break;
      
    default:
      throw new Error(`Unsupported pattern: ${pattern}`);
  }

  // Get all date occurrences (without specific times)
  const dateOccurrences = rule.between(dtstart, until, true);
  
  // For each date, create a proper UTC timestamp for the specified local time
  const occurrences = dateOccurrences.map(date => {
    // Get the date components
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Create an ISO 8601 string representing the LOCAL time in the user's timezone
    // Format: YYYY-MM-DDTHH:mm:ss (no timezone indicator, treated as local to the specified timezone)
    const localTimeStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    
    // Parse this as a date object (treated as being in the specified timezone)
    // Then convert it to UTC using fromZonedTime
    const utcDate = fromZonedTime(localTimeStr, timezone);
    
    return utcDate;
  });
  
  return occurrences;
}

/**
 * Check if an instance already exists for this cadence + time
 */
async function checkInstanceExists(
  supabase: any,
  cadence_id: string,
  scheduled_for: Date
): Promise<boolean> {
  // Look for instances within 1 minute of scheduled time
  const startWindow = addHours(scheduled_for, -0.017); // -1 min
  const endWindow = addHours(scheduled_for, 0.017); // +1 min
  
  const { data, error } = await supabase
    .from('form_instances')
    .select('id')
    .eq('cadence_id', cadence_id)
    .gte('scheduled_for', startWindow.toISOString())
    .lte('scheduled_for', endWindow.toISOString())
    .limit(1);

  if (error) {
    console.error('Error checking instance exists:', error);
    return false;
  }

  return data && data.length > 0;
}

/**
 * Create a new form instance
 */
async function createInstance(
  supabase: any,
  cadence: FormCadence,
  scheduled_for: Date
): Promise<FormInstance | null> {
  const { schedule_config, assigned_to, workspace_id, form_id, id: cadence_id, name } = cadence;
  
  // Calculate due_at based on completion window
  const due_at = addHours(scheduled_for, schedule_config.completion_window_hours);
  
  // Generate instance name
  const instance_name = `${name} - ${formatISO(scheduled_for, { representation: 'date' })}`;

  const instanceData = {
    workspace_id,
    cadence_id,
    form_id,
    instance_name,
    scheduled_for: scheduled_for.toISOString(),
    due_at: due_at.toISOString(),
    status: 'pending',
    assigned_to,
    metadata: {
      generated_at: new Date().toISOString(),
      timezone: schedule_config.timezone
    }
  };

  const { data, error } = await supabase
    .from('form_instances')
    .insert(instanceData)
    .select()
    .single();

  if (error) {
    console.error('Error creating instance:', error);
    return null;
  }

  console.log(`✅ Created instance: ${instance_name}`);
  return data;
}

/**
 * Update instance statuses based on current time
 */
export async function updateInstanceStatuses(): Promise<void> {
  const supabase = await createClient();
  const now = new Date();

  // Update pending → ready (scheduled_for has passed)
  const { data: pendingInstances, error: pendingError } = await supabase
    .from('form_instances')
    .update({ status: 'ready' })
    .eq('status', 'pending')
    .lte('scheduled_for', now.toISOString())
    .select();

  if (pendingError) {
    console.error('Error updating pending instances:', pendingError);
  } else {
    console.log(`✅ Updated ${pendingInstances?.length || 0} pending → ready`);
  }

  // Update ready/in_progress → missed (due_at has passed)
  const { data: missedInstances, error: missedError } = await supabase
    .from('form_instances')
    .update({ status: 'missed' })
    .in('status', ['ready', 'in_progress'])
    .lt('due_at', now.toISOString())
    .select();

  if (missedError) {
    console.error('Error updating missed instances:', missedError);
  } else {
    console.log(`✅ Updated ${missedInstances?.length || 0} ready/in_progress → missed`);
  }
}

