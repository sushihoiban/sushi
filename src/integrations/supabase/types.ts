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
      app_settings: {
        Row: {
          key: string
          value: string | null
        }
        Insert: {
          key: string
          value?: string | null
        }
        Update: {
          key?: string
          value?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          created_at: string
          customer_id: string | null
          group_id: string
          id: string
          party_size: number
          table_id: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          created_at?: string
          customer_id?: string | null
          group_id?: string
          id?: string
          party_size: number
          table_id: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          created_at?: string
          customer_id?: string | null
          group_id?: string
          id?: string
          party_size?: number
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          status: Database["public"]["Enums"]["customer_status"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          full_name: string | null
          id: string
          language: string
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          full_name?: string | null
          id: string
          language?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          full_name?: string | null
          id?: string
          language?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      restaurant_tables: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          seats: number
          table_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          seats: number
          table_number: number
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          seats?: number
          table_number?: number
        }
        Relationships: []
      }
      user_favorite_dishes: {
        Row: {
          created_at: string
          id: number
          menu_item_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          menu_item_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          menu_item_id?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_customer: {
        Args: {
          p_first_name: string
          p_last_name: string
          p_phone: string
          p_status: Database["public"]["Enums"]["customer_status"]
        }
        Returns: undefined
      }
      cancel_booking_group: { Args: { p_group_id: string }; Returns: undefined }
      check_customer_exists: {
        Args: { p_phone_number: string }
        Returns: boolean
      }
      create_booking_for_party: {
        Args: {
          p_booking_date: string
          p_booking_time: string
          p_customer_phone: string
          p_first_name: string
          p_last_name: string
          p_party_size: number
          p_table_ids: string[]
        }
        Returns: string
      }
      create_booking_with_customer: {
        Args: {
          p_booking_date: string
          p_booking_time: string
          p_create_customer?: boolean
          p_customer_name: string
          p_customer_phone: string
          p_party_size: number
          p_table_ids: string[]
          p_user_id?: string
        }
        Returns: {
          created_booking_id: string
        }[]
      }
      filter_customers: {
        Args: { booking_status_filter: string; name_filter: string }
        Returns: Database["public"]["CompositeTypes"]["customer_details"][]
        SetofOptions: {
          from: "*"
          to: "customer_details"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_admin_bookings: {
        Args: never
        Returns: Database["public"]["CompositeTypes"]["admin_booking_row"][]
        SetofOptions: {
          from: "*"
          to: "admin_booking_row"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_available_tables: {
        Args: {
          p_booking_date: string
          p_booking_time: string
          p_party_size: number
        }
        Returns: {
          created_at: string
          id: string
          is_available: boolean
          seats: number
          table_number: number
        }[]
        SetofOptions: {
          from: "*"
          to: "restaurant_tables"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_my_role: { Args: never; Returns: string }
      get_user_email_by_id: { Args: { p_user_id: string }; Returns: string }
      update_booking_group: {
        Args: {
          p_booking_date: string
          p_booking_time: string
          p_customer_name: string
          p_customer_phone: string
          p_group_id_to_cancel: string
          p_new_party_size: number
          p_new_table_ids: string[]
        }
        Returns: string
      }
      update_customer_details: {
        Args: {
          p_customer_id: string
          p_first_name: string
          p_last_name: string
          p_phone: string
        }
        Returns: undefined
      }
    }
    Enums: {
      customer_status: "regular" | "vip"
    }
    CompositeTypes: {
      admin_booking_row: {
        id: string | null
        booking_date: string | null
        booking_time: string | null
        party_size: number | null
        group_id: string | null
        customer_name: string | null
        customer_phone: string | null
        tables: string | null
      }
      customer_details: {
        id: string | null
        first_name: string | null
        last_name: string | null
        phone: string | null
        status: Database["public"]["Enums"]["customer_status"] | null
        user_id: string | null
        email: string | null
      }
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
    Enums: {
      customer_status: ["regular", "vip"],
    },
  },
} as const
