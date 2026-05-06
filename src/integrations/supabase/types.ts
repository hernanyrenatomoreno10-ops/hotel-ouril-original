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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          check_in_date: string
          check_out_date: string
          created_at: string
          hotel_id: string
          hotel_name: string | null
          id: string
          nightly_rate: number | null
          room_name: string | null
          room_number: string | null
          user_id: string
        }
        Insert: {
          check_in_date?: string
          check_out_date?: string
          created_at?: string
          hotel_id: string
          hotel_name?: string | null
          id?: string
          nightly_rate?: number | null
          room_name?: string | null
          room_number?: string | null
          user_id: string
        }
        Update: {
          check_in_date?: string
          check_out_date?: string
          created_at?: string
          hotel_id?: string
          hotel_name?: string | null
          id?: string
          nightly_rate?: number | null
          room_name?: string | null
          room_number?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_reservations: {
        Row: {
          created_at: string
          experience_id: string | null
          hotel_id: string | null
          id: string
          place: string | null
          price_eur: number | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience_id?: string | null
          hotel_id?: string | null
          id?: string
          place?: string | null
          price_eur?: number | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience_id?: string | null
          hotel_id?: string | null
          id?: string
          place?: string | null
          price_eur?: number | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_reservations_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_reservations_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          created_at: string
          hotel_id: string | null
          id: string
          image_url: string | null
          is_internal: boolean | null
          place: string
          price_eur: number
          rating: number | null
          tag: string | null
          title: string
        }
        Insert: {
          created_at?: string
          hotel_id?: string | null
          id?: string
          image_url?: string | null
          is_internal?: boolean | null
          place: string
          price_eur?: number
          rating?: number | null
          tag?: string | null
          title: string
        }
        Update: {
          created_at?: string
          hotel_id?: string | null
          id?: string
          image_url?: string | null
          is_internal?: boolean | null
          place?: string
          price_eur?: number
          rating?: number | null
          tag?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      gastronomy_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          hotel_id: string | null
          id: string
          image_url: string | null
          name: string
          popular: boolean | null
          price_cve: number
          price_eur: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          hotel_id?: string | null
          id?: string
          image_url?: string | null
          name: string
          popular?: boolean | null
          price_cve: number
          price_eur: number
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          hotel_id?: string | null
          id?: string
          image_url?: string | null
          name?: string
          popular?: boolean | null
          price_cve?: number
          price_eur?: number
        }
        Relationships: [
          {
            foreignKeyName: "gastronomy_items_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      gastronomy_orders: {
        Row: {
          created_at: string
          hotel_id: string | null
          id: string
          item_id: string | null
          item_name: string
          price: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hotel_id?: string | null
          id?: string
          item_id?: string | null
          item_name: string
          price: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hotel_id?: string | null
          id?: string
          item_id?: string | null
          item_name?: string
          price?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gastronomy_orders_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastronomy_orders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "gastronomy_items"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          brand_color: string | null
          city: string
          country: string
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          slug: string
          tourist_tax_per_night: number | null
        }
        Insert: {
          brand_color?: string | null
          city: string
          country?: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          slug: string
          tourist_tax_per_night?: number | null
        }
        Update: {
          brand_color?: string | null
          city?: string
          country?: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          slug?: string
          tourist_tax_per_night?: number | null
        }
        Relationships: []
      }
      medical_appointments: {
        Row: {
          appointment_date: string
          created_at: string
          id: string
          specialty: string
          status: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          id?: string
          specialty: string
          status?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          id?: string
          specialty?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      room_settings: {
        Row: {
          ac_power: boolean | null
          blinds_level: number | null
          created_at: string
          id: string
          lights_level: number | null
          temperature: number | null
          user_id: string
        }
        Insert: {
          ac_power?: boolean | null
          blinds_level?: number | null
          created_at?: string
          id?: string
          lights_level?: number | null
          temperature?: number | null
          user_id: string
        }
        Update: {
          ac_power?: boolean | null
          blinds_level?: number | null
          created_at?: string
          id?: string
          lights_level?: number | null
          temperature?: number | null
          user_id?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          created_at: string
          description: string | null
          id: string
          service_type: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          service_type: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          service_type?: string
          status?: string
          user_id?: string
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
