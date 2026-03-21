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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      chairs: {
        Row: {
          chair_index: number
          created_at: string
          id: string
          is_occupied: boolean
          mapped_order_id: string | null
          occupied_at: string | null
          table_id: string
        }
        Insert: {
          chair_index: number
          created_at?: string
          id?: string
          is_occupied?: boolean
          mapped_order_id?: string | null
          occupied_at?: string | null
          table_id: string
        }
        Update: {
          chair_index?: number
          created_at?: string
          id?: string
          is_occupied?: boolean
          mapped_order_id?: string | null
          occupied_at?: string | null
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chairs_mapped_order_id_fkey"
            columns: ["mapped_order_id"]
            isOneToOne: false
            referencedRelation: "queue_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chairs_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      floor_return_signals: {
        Row: {
          chair_id: string | null
          created_at: string
          floor: string
          id: string
          session_id: string
          table_id: string | null
        }
        Insert: {
          chair_id?: string | null
          created_at?: string
          floor: string
          id?: string
          session_id: string
          table_id?: string | null
        }
        Update: {
          chair_id?: string | null
          created_at?: string
          floor?: string
          id?: string
          session_id?: string
          table_id?: string | null
        }
        Relationships: []
      }
      queue_certificates: {
        Row: {
          browser_token: string | null
          created_at: string
          customer_name: string | null
          group_size: number
          id: string
          is_used: boolean
          order_id: string
          order_number: number
          secret_code: string
          session_id: string
        }
        Insert: {
          browser_token?: string | null
          created_at?: string
          customer_name?: string | null
          group_size: number
          id?: string
          is_used?: boolean
          order_id: string
          order_number: number
          secret_code: string
          session_id: string
        }
        Update: {
          browser_token?: string | null
          created_at?: string
          customer_name?: string | null
          group_size?: number
          id?: string
          is_used?: boolean
          order_id?: string
          order_number?: number
          secret_code?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_certificates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "queue_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_certificates_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_orders: {
        Row: {
          created_at: string
          custom_note: string | null
          group_size: number | null
          id: string
          notes: string[] | null
          order_number: number
          previous_group_size: number | null
          reached_table_at: string | null
          registered_at: string | null
          session_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_note?: string | null
          group_size?: number | null
          id?: string
          notes?: string[] | null
          order_number: number
          previous_group_size?: number | null
          reached_table_at?: string | null
          registered_at?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_note?: string | null
          group_size?: number | null
          id?: string
          notes?: string[] | null
          order_number?: number
          previous_group_size?: number | null
          reached_table_at?: string | null
          registered_at?: string | null
          session_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_orders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          column_position: number
          created_at: string
          expanded_size: number | null
          floor: string
          id: string
          is_expandable: boolean
          mapped_order_id: string | null
          occupied_at: string | null
          session_id: string | null
          status: string
          table_index: number
          table_type: string
        }
        Insert: {
          column_position: number
          created_at?: string
          expanded_size?: number | null
          floor: string
          id?: string
          is_expandable?: boolean
          mapped_order_id?: string | null
          occupied_at?: string | null
          session_id?: string | null
          status?: string
          table_index: number
          table_type: string
        }
        Update: {
          column_position?: number
          created_at?: string
          expanded_size?: number | null
          floor?: string
          id?: string
          is_expandable?: boolean
          mapped_order_id?: string | null
          occupied_at?: string | null
          session_id?: string | null
          status?: string
          table_index?: number
          table_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_tables_mapped_order_id_fkey"
            columns: ["mapped_order_id"]
            isOneToOne: false
            referencedRelation: "queue_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_tables_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          daily_notice: string | null
          id: string
          is_active: boolean
          session_type: string
          started_at: string
        }
        Insert: {
          daily_notice?: string | null
          id?: string
          is_active?: boolean
          session_type: string
          started_at?: string
        }
        Update: {
          daily_notice?: string | null
          id?: string
          is_active?: boolean
          session_type?: string
          started_at?: string
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
