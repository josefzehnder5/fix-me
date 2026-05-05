export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      booking_requests: {
        Row: {
          created_at: string;
          customer_email: string | null;
          customer_name: string;
          customer_phone: string;
          deposit_amount_cop: number;
          deposit_percent: number | null;
          id: string;
          number_of_people: number;
          paid_amount_cop: number | null;
          payment_status: string | null;
          status: string;
          tour_date: string;
          tour_id: string;
          total_amount_cop: number | null;
          wompi_transaction_id: string | null;
        };
        Insert: {
          created_at?: string;
          customer_email?: string | null;
          customer_name: string;
          customer_phone: string;
          deposit_amount_cop: number;
          deposit_percent?: number | null;
          id?: string;
          number_of_people: number;
          paid_amount_cop?: number | null;
          payment_status?: string | null;
          status?: string;
          tour_date: string;
          tour_id: string;
          total_amount_cop?: number | null;
          wompi_transaction_id?: string | null;
        };
        Update: {
          created_at?: string;
          customer_email?: string | null;
          customer_name?: string;
          customer_phone?: string;
          deposit_amount_cop?: number;
          deposit_percent?: number | null;
          id?: string;
          number_of_people?: number;
          paid_amount_cop?: number | null;
          payment_status?: string | null;
          status?: string;
          tour_date?: string;
          tour_id?: string;
          total_amount_cop?: number | null;
          wompi_transaction_id?: string | null;
        };
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: string;
          user_id?: string;
        };
      };
      wompi_events: {
        Row: {
          created_at: string;
          event_data: Json | null;
          event_type: string;
          id: string;
          signature: string | null;
        };
        Insert: {
          created_at?: string;
          event_data?: Json | null;
          event_type: string;
          id?: string;
          signature?: string | null;
        };
        Update: {
          created_at?: string;
          event_data?: Json | null;
          event_type?: string;
          id?: string;
          signature?: string | null;
        };
      };
      tours: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          duration: string | null;
          location: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          duration?: string | null;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          duration?: string | null;
          location?: string | null;
          created_at?: string;
        };
      };
      tour_prices: {
        Row: {
          id: string;
          tour_id: string;
          price_display: string;
          price_cop: number;
          nights: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tour_id: string;
          price_display: string;
          price_cop: number;
          nights?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tour_id?: string;
          price_display?: string;
          price_cop?: number;
          nights?: number | null;
          created_at?: string;
        };
      };
      tour_photos: {
        Row: {
          id: string;
          tour_id: string;
          photo_url: string;
          caption: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tour_id: string;
          photo_url: string;
          caption?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tour_id?: string;
          photo_url?: string;
          caption?: string | null;
          display_order?: number;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
      }
