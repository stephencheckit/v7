// TypeScript types for Summary Reports feature

export interface SummaryReport {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  date_range_start: string;
  date_range_end: string;
  cadence_ids: string[];
  form_ids: string[]; // Regular form submissions
  filter_config: FilterConfig;
  schedule_type: 'manual' | 'one_time' | 'recurring';
  schedule_config?: ScheduleConfig;
  status: 'draft' | 'generating' | 'completed' | 'failed' | 'scheduled';
  ai_content: AIContent;
  metrics: SummaryMetrics;
  chart_data?: any;
  recipients: string[];
  notify_users: boolean;
  parent_summary_id?: string;
  user_commentary?: string;
  generated_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AIContent {
  executive_summary: string;
  insights: Insight[];
  recommendations: string[];
}

export interface Insight {
  category: string;
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high';
  data?: any;
}

export interface SummaryMetrics {
  total_instances: number;
  completed: number;
  missed: number;
  in_progress: number;
  pending: number;
  completion_rate: number;
  by_cadence: CadenceMetric[];
}

export interface CadenceMetric {
  cadence_id?: string; // Optional for regular forms
  form_id?: string; // For regular forms
  cadence_name?: string;
  form_name?: string; // For regular forms
  total: number;
  completed: number;
  missed: number;
  completion_rate: number;
  avg_completion_time_minutes?: number;
}

export interface FilterConfig {
  status_filter?: ('completed' | 'missed' | 'pending' | 'in_progress' | 'ready')[];
  specific_days?: string[];
  cadence_filter?: string[]; // For derivative summaries
}

export interface ScheduleConfig {
  frequency?: 'daily' | 'weekly' | 'monthly';
  day_of_week?: number; // 0-6 for weekly
  day_of_month?: number; // 1-31 for monthly
  time?: string; // HH:mm format
  timezone?: string;
  scheduled_at?: string; // ISO timestamp for one-time
}

export interface SummaryWithCadences extends SummaryReport {
  cadences?: Array<{
    id: string;
    name: string;
    form: {
      title: string;
    };
  }>;
  created_by_user?: {
    email: string;
    full_name?: string;
  };
  parent_summary?: {
    id: string;
    name: string;
  };
}

// For Create Summary wizard steps
export interface CreateSummaryFormData {
  name: string;
  description?: string;
  date_range_start: string;
  date_range_end: string;
  source_type: 'cadences' | 'forms' | 'both'; // New field
  cadence_ids: string[];
  form_ids: string[]; // New field
  filter_config: FilterConfig;
  schedule_type: 'manual' | 'one_time' | 'recurring';
  schedule_config?: ScheduleConfig;
  recipients: string[];
  notify_users: boolean;
  generate_now: boolean; // If true, generate immediately after creation
}

// For derivative summaries
export interface DerivativeSummaryRequest {
  parent_summary_id: string;
  user_commentary?: string;
  filter_config?: FilterConfig;
  name?: string;
}

