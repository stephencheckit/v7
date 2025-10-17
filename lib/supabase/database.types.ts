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
          submitter_ip: unknown | null
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
          submitter_ip?: unknown | null
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
          submitter_ip?: unknown | null
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
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

