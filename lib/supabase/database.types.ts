export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_chat_history: {
        Row: {
          context: Json | null
          created_at: string | null
          form_id: string | null
          id: string
          message: string
          model: string | null
          role: string
          tokens_used: number | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          form_id?: string | null
          id?: string
          message: string
          model?: string | null
          role: string
          tokens_used?: number | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          form_id?: string | null
          id?: string
          message?: string
          model?: string | null
          role?: string
          tokens_used?: number | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_history_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_history_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          created_at: string | null
          form_id: string
          id: string
          messages: Json
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          form_id: string
          id?: string
          messages?: Json
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          form_id?: string
          id?: string
          messages?: Json
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          rate_limit: number | null
          scopes: string[]
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          rate_limit?: number | null
          scopes?: string[]
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          rate_limit?: number | null
          scopes?: string[]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      food_items: {
        Row: {
          allergens: string[] | null
          category: string | null
          created_at: string | null
          day: string | null
          id: string
          ingredients: string[] | null
          is_active: boolean | null
          item_type: string | null
          last_printed_at: string | null
          meal: string | null
          menu_upload_id: string | null
          metadata: Json | null
          name: string
          print_count: number | null
          print_history: Json | null
          shelf_life_days: number
          source_type: string | null
          storage_method: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          allergens?: string[] | null
          category?: string | null
          created_at?: string | null
          day?: string | null
          id?: string
          ingredients?: string[] | null
          is_active?: boolean | null
          item_type?: string | null
          last_printed_at?: string | null
          meal?: string | null
          menu_upload_id?: string | null
          metadata?: Json | null
          name: string
          print_count?: number | null
          print_history?: Json | null
          shelf_life_days: number
          source_type?: string | null
          storage_method?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          allergens?: string[] | null
          category?: string | null
          created_at?: string | null
          day?: string | null
          id?: string
          ingredients?: string[] | null
          is_active?: boolean | null
          item_type?: string | null
          last_printed_at?: string | null
          meal?: string | null
          menu_upload_id?: string | null
          metadata?: Json | null
          name?: string
          print_count?: number | null
          print_history?: Json | null
          shelf_life_days?: number
          source_type?: string | null
          storage_method?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_items_menu_upload_id_fkey"
            columns: ["menu_upload_id"]
            isOneToOne: false
            referencedRelation: "menu_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_items_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      form_analytics: {
        Row: {
          avg_completion_time: number | null
          bounce_rate: number | null
          completion_rate: number | null
          created_at: string | null
          date: string
          drop_offs: number | null
          field_analytics: Json | null
          form_id: string
          id: string
          starts: number | null
          submissions: number | null
          views: number | null
        }
        Insert: {
          avg_completion_time?: number | null
          bounce_rate?: number | null
          completion_rate?: number | null
          created_at?: string | null
          date: string
          drop_offs?: number | null
          field_analytics?: Json | null
          form_id: string
          id?: string
          starts?: number | null
          submissions?: number | null
          views?: number | null
        }
        Update: {
          avg_completion_time?: number | null
          bounce_rate?: number | null
          completion_rate?: number | null
          created_at?: string | null
          date?: string
          drop_offs?: number | null
          field_analytics?: Json | null
          form_id?: string
          id?: string
          starts?: number | null
          submissions?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "form_analytics_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_distribution_settings: {
        Row: {
          access_type: string | null
          allowed_domains: string[] | null
          allowed_locations: Json | null
          created_at: string | null
          distribution_channels: Json | null
          end_date: string | null
          form_id: string
          id: string
          input_methods: Json | null
          max_submissions: number | null
          max_submissions_per_user: number | null
          password_hash: string | null
          recurring_pattern: Json | null
          schedule_type: string | null
          settings: Json | null
          start_date: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          access_type?: string | null
          allowed_domains?: string[] | null
          allowed_locations?: Json | null
          created_at?: string | null
          distribution_channels?: Json | null
          end_date?: string | null
          form_id: string
          id?: string
          input_methods?: Json | null
          max_submissions?: number | null
          max_submissions_per_user?: number | null
          password_hash?: string | null
          recurring_pattern?: Json | null
          schedule_type?: string | null
          settings?: Json | null
          start_date?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          access_type?: string | null
          allowed_domains?: string[] | null
          allowed_locations?: Json | null
          created_at?: string | null
          distribution_channels?: Json | null
          end_date?: string | null
          form_id?: string
          id?: string
          input_methods?: Json | null
          max_submissions?: number | null
          max_submissions_per_user?: number | null
          password_hash?: string | null
          recurring_pattern?: Json | null
          schedule_type?: string | null
          settings?: Json | null
          start_date?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_distribution_settings_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: true
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          data: Json
          device_type: string | null
          form_id: string
          form_version: number
          id: string
          metadata: Json | null
          referrer: string | null
          started_at: string | null
          status: string | null
          submitted_at: string | null
          submitter_email: string | null
          submitter_id: string | null
          submitter_ip: unknown
          submitter_user_agent: string | null
          time_to_complete: number | null
        }
        Insert: {
          data: Json
          device_type?: string | null
          form_id: string
          form_version: number
          id?: string
          metadata?: Json | null
          referrer?: string | null
          started_at?: string | null
          status?: string | null
          submitted_at?: string | null
          submitter_email?: string | null
          submitter_id?: string | null
          submitter_ip?: unknown
          submitter_user_agent?: string | null
          time_to_complete?: number | null
        }
        Update: {
          data?: Json
          device_type?: string | null
          form_id?: string
          form_version?: number
          id?: string
          metadata?: Json | null
          referrer?: string | null
          started_at?: string | null
          status?: string | null
          submitted_at?: string | null
          submitter_email?: string | null
          submitter_id?: string | null
          submitter_ip?: unknown
          submitter_user_agent?: string | null
          time_to_complete?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_versions: {
        Row: {
          change_summary: string | null
          created_at: string | null
          created_by: string
          form_id: string
          id: string
          schema: Json
          settings: Json | null
          theme: Json | null
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          created_at?: string | null
          created_by: string
          form_id: string
          id?: string
          schema: Json
          settings?: Json | null
          theme?: Json | null
          version_number: number
        }
        Update: {
          change_summary?: string | null
          created_at?: string | null
          created_by?: string
          form_id?: string
          id?: string
          schema?: Json
          settings?: Json | null
          theme?: Json | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_versions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string | null
          created_by: string
          current_version_id: string | null
          description: string | null
          id: string
          name: string
          published_at: string | null
          schema: Json
          settings: Json | null
          slug: string
          status: string | null
          submit_button_text: string | null
          theme: Json | null
          updated_at: string | null
          version: number | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          current_version_id?: string | null
          description?: string | null
          id?: string
          name: string
          published_at?: string | null
          schema?: Json
          settings?: Json | null
          slug: string
          status?: string | null
          submit_button_text?: string | null
          theme?: Json | null
          updated_at?: string | null
          version?: number | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          current_version_id?: string | null
          description?: string | null
          id?: string
          name?: string
          published_at?: string | null
          schema?: Json
          settings?: Json | null
          slug?: string
          status?: string | null
          submit_button_text?: string | null
          theme?: Json | null
          updated_at?: string | null
          version?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          allergen_type: string | null
          category: string | null
          created_at: string | null
          food_item_id: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          optimal_temp_max: number | null
          optimal_temp_min: number | null
          safety_notes: string | null
          shelf_life_days: number
          storage_method: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          allergen_type?: string | null
          category?: string | null
          created_at?: string | null
          food_item_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          optimal_temp_max?: number | null
          optimal_temp_min?: number | null
          safety_notes?: string | null
          shelf_life_days: number
          storage_method?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          allergen_type?: string | null
          category?: string | null
          created_at?: string | null
          food_item_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          optimal_temp_max?: number | null
          optimal_temp_min?: number | null
          safety_notes?: string | null
          shelf_life_days?: number
          storage_method?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "unified_food_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      master_ingredients: {
        Row: {
          aliases: string[] | null
          allergen_type: string | null
          canonical_name: string
          category: string
          created_at: string | null
          data_source: string | null
          id: string
          match_count: number | null
          metadata: Json | null
          name: string
          optimal_temp_max: number | null
          optimal_temp_min: number | null
          safety_notes: string | null
          shelf_life_frozen: number | null
          shelf_life_pantry: number | null
          shelf_life_refrigerated: number | null
          storage_method: string
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          aliases?: string[] | null
          allergen_type?: string | null
          canonical_name: string
          category: string
          created_at?: string | null
          data_source?: string | null
          id?: string
          match_count?: number | null
          metadata?: Json | null
          name: string
          optimal_temp_max?: number | null
          optimal_temp_min?: number | null
          safety_notes?: string | null
          shelf_life_frozen?: number | null
          shelf_life_pantry?: number | null
          shelf_life_refrigerated?: number | null
          storage_method: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          aliases?: string[] | null
          allergen_type?: string | null
          canonical_name?: string
          category?: string
          created_at?: string | null
          data_source?: string | null
          id?: string
          match_count?: number | null
          metadata?: Json | null
          name?: string
          optimal_temp_max?: number | null
          optimal_temp_min?: number | null
          safety_notes?: string | null
          shelf_life_frozen?: number | null
          shelf_life_pantry?: number | null
          shelf_life_refrigerated?: number | null
          storage_method?: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      menu_uploads: {
        Row: {
          analysis_duration: number | null
          analyzed_at: string | null
          created_at: string | null
          id: string
          image_size: number | null
          image_url: string
          items_found: number | null
          updated_at: string | null
          uploaded_by: string | null
          workspace_id: string | null
        }
        Insert: {
          analysis_duration?: number | null
          analyzed_at?: string | null
          created_at?: string | null
          id?: string
          image_size?: number | null
          image_url: string
          items_found?: number | null
          updated_at?: string | null
          uploaded_by?: string | null
          workspace_id?: string | null
        }
        Update: {
          analysis_duration?: number | null
          analyzed_at?: string | null
          created_at?: string | null
          id?: string
          image_size?: number | null
          image_url?: string
          items_found?: number | null
          updated_at?: string | null
          uploaded_by?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_uploads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      page_content: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      sensor_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          detected_at: string
          duration_minutes: number | null
          id: string
          notifications_sent: Json | null
          resolution_action: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          sensor_id: string
          severity: string
          started_at: string
          status: string | null
          temp_celsius: number
          temp_fahrenheit: number
          threshold_max: number | null
          threshold_min: number | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          alert_type?: string
          created_at?: string | null
          detected_at?: string
          duration_minutes?: number | null
          id?: string
          notifications_sent?: Json | null
          resolution_action?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          sensor_id: string
          severity: string
          started_at?: string
          status?: string | null
          temp_celsius: number
          temp_fahrenheit: number
          threshold_max?: number | null
          threshold_min?: number | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          detected_at?: string
          duration_minutes?: number | null
          id?: string
          notifications_sent?: Json | null
          resolution_action?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          sensor_id?: string
          severity?: string
          started_at?: string
          status?: string | null
          temp_celsius?: number
          temp_fahrenheit?: number
          threshold_max?: number | null
          threshold_min?: number | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sensor_alerts_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_readings: {
        Row: {
          id: string
          is_critical: boolean | null
          is_in_range: boolean
          raw_event: Json | null
          recorded_at: string
          sensor_id: string
          temperature_celsius: number
          temperature_fahrenheit: number
          workspace_id: string | null
        }
        Insert: {
          id?: string
          is_critical?: boolean | null
          is_in_range: boolean
          raw_event?: Json | null
          recorded_at?: string
          sensor_id: string
          temperature_celsius: number
          temperature_fahrenheit: number
          workspace_id?: string | null
        }
        Update: {
          id?: string
          is_critical?: boolean | null
          is_in_range?: boolean
          raw_event?: Json | null
          recorded_at?: string
          sensor_id?: string
          temperature_celsius?: number
          temperature_fahrenheit?: number
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_tasks: {
        Row: {
          alert_id: string
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_at: string | null
          id: string
          priority: string | null
          sensor_id: string
          started_at: string | null
          status: string | null
          task_type: string
          title: string
        }
        Insert: {
          alert_id: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          priority?: string | null
          sensor_id: string
          started_at?: string | null
          status?: string | null
          task_type: string
          title: string
        }
        Update: {
          alert_id?: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          priority?: string | null
          sensor_id?: string
          started_at?: string | null
          status?: string | null
          task_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensor_tasks_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "sensor_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_tasks_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      sensors: {
        Row: {
          alert_delay_minutes: number | null
          alert_recipients: Json | null
          battery_level: number | null
          created_at: string | null
          dt_device_id: string
          dt_project_id: string
          equipment_type: string
          id: string
          is_active: boolean | null
          last_reading_at: string | null
          location: string | null
          max_temp_celsius: number
          metadata: Json | null
          min_temp_celsius: number
          name: string
          signal_strength: number | null
          type: string
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          alert_delay_minutes?: number | null
          alert_recipients?: Json | null
          battery_level?: number | null
          created_at?: string | null
          dt_device_id: string
          dt_project_id: string
          equipment_type: string
          id?: string
          is_active?: boolean | null
          last_reading_at?: string | null
          location?: string | null
          max_temp_celsius: number
          metadata?: Json | null
          min_temp_celsius: number
          name: string
          signal_strength?: number | null
          type?: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          alert_delay_minutes?: number | null
          alert_recipients?: Json | null
          battery_level?: number | null
          created_at?: string | null
          dt_device_id?: string
          dt_project_id?: string
          equipment_type?: string
          id?: string
          is_active?: boolean | null
          last_reading_at?: string | null
          location?: string | null
          max_temp_celsius?: number
          metadata?: Json | null
          min_temp_celsius?: number
          name?: string
          signal_strength?: number | null
          type?: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sensors_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      simple_form_submissions: {
        Row: {
          ai_metadata: Json | null
          data: Json
          form_id: string
          id: string
          is_preview: boolean | null
          submitted_at: string | null
          workspace_id: string | null
        }
        Insert: {
          ai_metadata?: Json | null
          data: Json
          form_id: string
          id?: string
          is_preview?: boolean | null
          submitted_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          ai_metadata?: Json | null
          data?: Json
          form_id?: string
          id?: string
          is_preview?: boolean | null
          submitted_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simple_form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "simple_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simple_form_submissions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      simple_forms: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          schema: Json
          status: string | null
          thank_you_settings: Json | null
          title: string
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          schema: Json
          status?: string | null
          thank_you_settings?: Json | null
          title: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          schema?: Json
          status?: string | null
          thank_you_settings?: Json | null
          title?: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simple_forms_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      simple_submissions: {
        Row: {
          data: Json
          form_id: string
          id: string
          submitted_at: string | null
        }
        Insert: {
          data: Json
          form_id: string
          id?: string
          submitted_at?: string | null
        }
        Update: {
          data?: Json
          form_id?: string
          id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simple_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "simple_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_files: {
        Row: {
          field_id: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          is_public: boolean | null
          storage_bucket: string | null
          storage_path: string
          submission_id: string
          uploaded_at: string | null
          virus_scan_status: string | null
        }
        Insert: {
          field_id: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          is_public?: boolean | null
          storage_bucket?: string | null
          storage_path: string
          submission_id: string
          uploaded_at?: string | null
          virus_scan_status?: string | null
        }
        Update: {
          field_id?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          is_public?: boolean | null
          storage_bucket?: string | null
          storage_path?: string
          submission_id?: string
          uploaded_at?: string | null
          virus_scan_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submission_files_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          name: string
          preview_image_url: string | null
          schema: Json
          settings: Json | null
          tags: string[] | null
          theme: Json | null
          updated_at: string | null
          use_count: number | null
          workspace_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          name: string
          preview_image_url?: string | null
          schema: Json
          settings?: Json | null
          tags?: string[] | null
          theme?: Json | null
          updated_at?: string | null
          use_count?: number | null
          workspace_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          name?: string
          preview_image_url?: string | null
          schema?: Json
          settings?: Json | null
          tags?: string[] | null
          theme?: Json | null
          updated_at?: string | null
          use_count?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string | null
          created_by: string
          events: string[]
          form_id: string | null
          id: string
          is_active: boolean | null
          last_status: number | null
          last_triggered_at: string | null
          name: string
          retry_count: number | null
          secret: string
          url: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          events: string[]
          form_id?: string | null
          id?: string
          is_active?: boolean | null
          last_status?: number | null
          last_triggered_at?: string | null
          name: string
          retry_count?: number | null
          secret: string
          url: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          events?: string[]
          form_id?: string | null
          id?: string
          is_active?: boolean | null
          last_status?: number | null
          last_triggered_at?: string | null
          name?: string
          retry_count?: number | null
          secret?: string
          url?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhooks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          permissions: Json | null
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          permissions?: Json | null
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          permissions?: Json | null
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string
          plan: string | null
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id: string
          plan?: string | null
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          plan?: string | null
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      simple_form_stats: {
        Row: {
          form_id: string | null
          last_submission_at: string | null
          total_submissions: number | null
        }
        Relationships: [
          {
            foreignKeyName: "simple_form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "simple_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_food_library: {
        Row: {
          allergens: string[] | null
          category: string | null
          created_at: string | null
          id: string | null
          ingredients: string[] | null
          is_active: boolean | null
          item_type: string | null
          last_printed_at: string | null
          metadata: Json | null
          name: string | null
          print_count: number | null
          print_history: Json | null
          shelf_life_days: number | null
          source_type: string | null
          storage_method: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          allergens?: string[] | null
          category?: string | null
          created_at?: string | null
          id?: string | null
          ingredients?: string[] | null
          is_active?: boolean | null
          item_type?: string | null
          last_printed_at?: string | null
          metadata?: Json | null
          name?: string | null
          print_count?: number | null
          print_history?: Json | null
          shelf_life_days?: number | null
          source_type?: string | null
          storage_method?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          allergens?: string[] | null
          category?: string | null
          created_at?: string | null
          id?: string | null
          ingredients?: string[] | null
          is_active?: boolean | null
          item_type?: string | null
          last_printed_at?: string | null
          metadata?: Json | null
          name?: string | null
          print_count?: number | null
          print_history?: Json | null
          shelf_life_days?: number | null
          source_type?: string | null
          storage_method?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_items_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_workspace_members_with_users: {
        Args: { workspace_uuid: string }
        Returns: {
          email: string
          first_name: string
          id: string
          joined_at: string
          last_name: string
          role: string
          user_id: string
          workspace_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
