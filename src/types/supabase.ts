export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          profession_id: string | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          profession_id?: string | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          profession_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_profession_id_fkey"
            columns: ["profession_id"]
            isOneToOne: false
            referencedRelation: "professions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contributors: {
        Row: {
          contact_id: string | null
          created_at: string | null
          email: string | null
          id: string
          invite_expires_at: string | null
          invite_status: string | null
          invite_token: string | null
          name: string
          profession_id: string | null
          project_id: string
          role: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          invite_expires_at?: string | null
          invite_status?: string | null
          invite_token?: string | null
          name: string
          profession_id?: string | null
          project_id: string
          role?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          invite_expires_at?: string | null
          invite_status?: string | null
          invite_token?: string | null
          name?: string
          profession_id?: string | null
          project_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contributors_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributors_profession_id_fkey"
            columns: ["profession_id"]
            isOneToOne: false
            referencedRelation: "professions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_contributors: {
        Row: {
          contributor_id: string
          created_at: string | null
          document_id: string
          id: string
          request_type: string
        }
        Insert: {
          contributor_id: string
          created_at?: string | null
          document_id: string
          id?: string
          request_type?: string
        }
        Update: {
          contributor_id?: string
          created_at?: string | null
          document_id?: string
          id?: string
          request_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_contributors_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_contributors_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          created_at: string | null
          document_id: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          version: number
        }
        Insert: {
          created_at?: string | null
          document_id: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          version: number
        }
        Update: {
          created_at?: string | null
          document_id?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          audience: string | null
          content: string | null
          created_at: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          name: string
          pro_message: string | null
          project_id: string
          status: string | null
          type: string
          updated_at: string | null
          validation_token: string | null
          version: number | null
        }
        Insert: {
          audience?: string | null
          content?: string | null
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          name: string
          pro_message?: string | null
          project_id: string
          status?: string | null
          type: string
          updated_at?: string | null
          validation_token?: string | null
          version?: number | null
        }
        Update: {
          audience?: string | null
          content?: string | null
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          name?: string
          pro_message?: string | null
          project_id?: string
          status?: string | null
          type?: string
          updated_at?: string | null
          validation_token?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          author_name: string
          author_role: string
          content: string
          created_at: string | null
          document_id: string
          id: string
        }
        Insert: {
          author_name: string
          author_role: string
          content: string
          created_at?: string | null
          document_id: string
          id?: string
        }
        Update: {
          author_name?: string
          author_role?: string
          content?: string
          created_at?: string | null
          document_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          link: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professions: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          label: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          label: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          label?: string
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          branding_enabled: boolean
          company_name: string | null
          created_at: string | null
          demo_project_id: string | null
          email: string
          full_name: string | null
          id: string
          logo_url: string | null
          notif_email_approved: boolean | null
          notif_email_frequency: string | null
          notif_email_message: boolean | null
          notif_email_rejected: boolean | null
          notif_email_task: boolean | null
          notif_inapp_enabled: boolean | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          phone: string | null
          profession_id: string | null
          updated_at: string | null
        }
        Insert: {
          branding_enabled?: boolean
          company_name?: string | null
          created_at?: string | null
          demo_project_id?: string | null
          email: string
          full_name?: string | null
          id: string
          logo_url?: string | null
          notif_email_approved?: boolean | null
          notif_email_frequency?: string | null
          notif_email_message?: boolean | null
          notif_email_rejected?: boolean | null
          notif_email_task?: boolean | null
          notif_inapp_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          profession_id?: string | null
          updated_at?: string | null
        }
        Update: {
          branding_enabled?: boolean
          company_name?: string | null
          created_at?: string | null
          demo_project_id?: string | null
          email?: string
          full_name?: string | null
          id?: string
          logo_url?: string | null
          notif_email_approved?: boolean | null
          notif_email_frequency?: string | null
          notif_email_message?: boolean | null
          notif_email_rejected?: boolean | null
          notif_email_task?: boolean | null
          notif_inapp_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          profession_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_demo_project_id_fkey"
            columns: ["demo_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_profession_id_fkey"
            columns: ["profession_id"]
            isOneToOne: false
            referencedRelation: "professions"
            referencedColumns: ["id"]
          },
        ]
      }
      project_messages: {
        Row: {
          author_name: string
          author_role: string
          content: string
          created_at: string | null
          id: string
          project_id: string
        }
        Insert: {
          author_name: string
          author_role: string
          content: string
          created_at?: string | null
          id?: string
          project_id: string
        }
        Update: {
          author_name?: string
          author_role?: string
          content?: string
          created_at?: string | null
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          budget_range: string | null
          client_email: string | null
          client_name: string | null
          constraints: string | null
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string
          name: string
          phase: string | null
          profession_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          work_type: string | null
        }
        Insert: {
          address?: string | null
          budget_range?: string | null
          client_email?: string | null
          client_name?: string | null
          constraints?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          phase?: string | null
          profession_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          work_type?: string | null
        }
        Update: {
          address?: string | null
          budget_range?: string | null
          client_email?: string | null
          client_name?: string | null
          constraints?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          phase?: string | null
          profession_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_profession_id_fkey"
            columns: ["profession_id"]
            isOneToOne: false
            referencedRelation: "professions"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          author_name: string
          author_role: string
          content: string
          created_at: string | null
          id: string
          task_id: string
        }
        Insert: {
          author_name: string
          author_role: string
          content: string
          created_at?: string | null
          id?: string
          task_id: string
        }
        Update: {
          author_name?: string
          author_role?: string
          content?: string
          created_at?: string | null
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          approved_by: string | null
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          project_id: string
          status: string | null
          suggested_by: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          project_id: string
          status?: string | null
          suggested_by?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string
          status?: string | null
          suggested_by?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      validations: {
        Row: {
          approved_at: string | null
          client_email: string | null
          client_name: string | null
          comment: string | null
          created_at: string | null
          document_id: string
          id: string
          status: string | null
        }
        Insert: {
          approved_at?: string | null
          client_email?: string | null
          client_name?: string | null
          comment?: string | null
          created_at?: string | null
          document_id: string
          id?: string
          status?: string | null
        }
        Update: {
          approved_at?: string | null
          client_email?: string | null
          client_name?: string | null
          comment?: string | null
          created_at?: string | null
          document_id?: string
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "validations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          profession: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          profession?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          profession?: string | null
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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
