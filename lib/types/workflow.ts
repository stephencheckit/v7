export type WorkflowTriggerType =
    | 'sensor_temp_exceeds'
    | 'sensor_temp_below'
    | 'form_overdue'
    | 'form_submitted'
    | 'form_missed'
    | 'schedule';

export interface SensorTriggerConfig {
    sensor_id: string;
    threshold: number;
    unit: 'F' | 'C';
    duration_minutes: number;
}

export interface FormTriggerConfig {
    form_id: string;
    overdue_minutes?: number;
}

export interface ScheduleTriggerConfig {
    cron: string;
    timezone: string;
}

export type TriggerConfig = SensorTriggerConfig | FormTriggerConfig | ScheduleTriggerConfig;

export interface EmailAction {
    type: 'email';
    config: {
        recipients: string[]; // 'user:uuid' or 'role:manager'
        subject: string;
        message: string;
    };
}

export interface SMSAction {
    type: 'sms';
    config: {
        recipients: string[];
        message: string;
    };
}

export interface SlackAction {
    type: 'slack';
    config: {
        channel: string; // e.g., '#kitchen-alerts'
        message: string;
        mention?: string; // e.g., 'on-call-manager' (without @)
    };
}

export interface CreateTaskAction {
    type: 'create_task';
    config: {
        form_id: string;
        assign_to: string;
        due_minutes: number;
        priority: 'low' | 'medium' | 'high';
    };
}

export type WorkflowAction = EmailAction | SMSAction | SlackAction | CreateTaskAction;

export interface Workflow {
    id: string;
    workspace_id: string;
    name: string;
    description?: string;
    trigger_type: WorkflowTriggerType;
    trigger_config: TriggerConfig;
    actions: WorkflowAction[];
    is_active: boolean;
    triggered_count: number;
    last_triggered_at?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface WorkflowExecution {
    id: string;
    workflow_id: string;
    trigger_data: any;
    actions_executed: any[];
    status: 'completed' | 'failed' | 'partial';
    error_log?: any;
    executed_at: string;
}

