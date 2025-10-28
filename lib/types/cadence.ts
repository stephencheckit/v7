// Cadence & Instance Types

export type SchedulePattern = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
export type ScheduleType = 'recurring' | 'one_time' | 'event_based';

export interface ScheduleConfig {
  type: ScheduleType;
  pattern: SchedulePattern;
  time: string; // "HH:mm" format
  timezone: string; // IANA timezone
  days_of_week: number[]; // 1=Monday, 7=Sunday
  completion_window_hours: number;
  start_date?: string; // ISO date
  end_date?: string | null; // ISO date or null for infinite
}

export interface TriggerConfig {
  type: 'sensor_threshold' | 'missed_forms' | 'manual';
  conditions: Record<string, any>;
}

export interface NotificationRecipient {
  type: 'email' | 'sms' | 'user_id';
  value: string;
}

export interface NotificationConfig {
  recipients: NotificationRecipient[];
  notify_on_ready: boolean;
  notify_on_missed: boolean;
  reminder_minutes_before_deadline: number[];
}

export interface FormCadence {
  id: string;
  workspace_id: string;
  form_id: string;
  name: string;
  description?: string;
  schedule_config: ScheduleConfig;
  trigger_config?: TriggerConfig;
  notification_config: NotificationConfig;
  assigned_to: string[]; // user IDs
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type InstanceStatus = 
  | 'pending'
  | 'ready'
  | 'in_progress'
  | 'completed'
  | 'missed'
  | 'skipped';

export interface FormInstance {
  id: string;
  workspace_id: string;
  cadence_id?: string;
  form_id: string;
  instance_name: string;
  scheduled_for: string; // ISO timestamp
  due_at: string; // ISO timestamp
  status: InstanceStatus;
  submission_id?: string;
  started_at?: string;
  completed_at?: string;
  completed_by?: string;
  assigned_to: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface InstanceWithDetails extends FormInstance {
  cadence_name?: string;
  form_title?: string;
  workspace_name?: string;
  hours_until_due?: number;
}

export type NotificationType = 'ready' | 'reminder' | 'missed' | 'escalation';
export type NotificationChannel = 'email' | 'sms' | 'in_app' | 'webhook';
export type NotificationStatus = 'sent' | 'delivered' | 'failed' | 'bounced';

export interface InstanceNotification {
  id: string;
  instance_id: string;
  notification_type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  sent_at: string;
  status: NotificationStatus;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
}

// Calendar event type (for UI)
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: InstanceStatus;
  formId: string;
  instanceId: string;
  cadenceId?: string;
  resource?: any; // For additional data
}

