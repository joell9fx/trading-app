export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price_monthly: number
          price_yearly: number
          features: Json
          stripe_monthly_price_id: string | null
          stripe_yearly_price_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price_monthly: number
          price_yearly: number
          features: Json
          stripe_monthly_price_id?: string | null
          stripe_yearly_price_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price_monthly?: number
          price_yearly?: number
          features?: Json
          stripe_monthly_price_id?: string | null
          stripe_yearly_price_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          slug: string
          thumbnail_url: string | null
          duration_minutes: number
          difficulty: string
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          slug: string
          thumbnail_url?: string | null
          duration_minutes: number
          difficulty: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          slug?: string
          thumbnail_url?: string | null
          duration_minutes?: number
          difficulty?: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          content: string | null
          video_url: string | null
          duration_minutes: number
          order_index: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          content?: string | null
          video_url?: string | null
          duration_minutes: number
          order_index: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          content?: string | null
          video_url?: string | null
          duration_minutes?: number
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          course_id: string
          issued_at: string
          verification_token: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          issued_at: string
          verification_token: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          issued_at?: string
          verification_token?: string
          created_at?: string
        }
      }
      mentors: {
        Row: {
          id: string
          user_id: string
          bio: string
          expertise: string[]
          hourly_rate: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio: string
          expertise: string[]
          hourly_rate: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bio?: string
          expertise?: string[]
          hourly_rate?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          mentor_id: string
          user_id: string
          start_time: string
          end_time: string
          status: string
          notes: string | null
          stripe_payment_intent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          user_id: string
          start_time: string
          end_time: string
          status?: string
          notes?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          user_id?: string
          start_time?: string
          end_time?: string
          status?: string
          notes?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      community_channels: {
        Row: {
          id: string
          name: string
          description: string | null
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      community_posts: {
        Row: {
          id: string
          channel_id: string
          user_id: string
          title: string
          content: string
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          user_id: string
          title: string
          content: string
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          channel_id?: string
          user_id?: string
          title?: string
          content?: string
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
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
  }
}
