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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          mentor_id: string
          notes: string | null
          start_time: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          mentor_id: string
          notes?: string | null
          start_time: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          mentor_id?: string
          notes?: string | null
          start_time?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          issued_at: string | null
          user_id: string
          verification_token: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          issued_at?: string | null
          user_id: string
          verification_token: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          issued_at?: string | null
          user_id?: string
          verification_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_channels: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_private: boolean | null
          is_public: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          is_public?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          channel_id: string
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "community_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          rating: number | null
          slug: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          rating?: number | null
          slug?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          rating?: number | null
          slug?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          end_time: string
          id: string
          location: string | null
          start_time: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          start_time: string
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          start_time?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          bias: string | null
          confidence_score: number | null
          created_at: string
          entry_date: string
          execution_quality: number | null
          id: string
          lesson_learned: string | null
          mistakes_made: string | null
          mood: string | null
          pair: string | null
          plan_for_next_session: string | null
          result_r: number | null
          rule_followed: boolean | null
          screenshot_url: string | null
          session: string | null
          setup_type: string | null
          strategy_used: string | null
          timeframe: string | null
          title: string
          trade_id: string | null
          updated_at: string
          user_id: string
          what_went_well: string | null
        }
        Insert: {
          bias?: string | null
          confidence_score?: number | null
          created_at?: string
          entry_date?: string
          execution_quality?: number | null
          id?: string
          lesson_learned?: string | null
          mistakes_made?: string | null
          mood?: string | null
          pair?: string | null
          plan_for_next_session?: string | null
          result_r?: number | null
          rule_followed?: boolean | null
          screenshot_url?: string | null
          session?: string | null
          setup_type?: string | null
          strategy_used?: string | null
          timeframe?: string | null
          title: string
          trade_id?: string | null
          updated_at?: string
          user_id: string
          what_went_well?: string | null
        }
        Update: {
          bias?: string | null
          confidence_score?: number | null
          created_at?: string
          entry_date?: string
          execution_quality?: number | null
          id?: string
          lesson_learned?: string | null
          mistakes_made?: string | null
          mood?: string | null
          pair?: string | null
          plan_for_next_session?: string | null
          result_r?: number | null
          rule_followed?: boolean | null
          screenshot_url?: string | null
          session?: string | null
          setup_type?: string | null
          strategy_used?: string | null
          timeframe?: string | null
          title?: string
          trade_id?: string | null
          updated_at?: string
          user_id?: string
          what_went_well?: string | null
        }
        Relationships: []
      }
      journal_entry_mistakes: {
        Row: {
          id: string
          journal_entry_id: string
          mistake_id: string
        }
        Insert: {
          id?: string
          journal_entry_id: string
          mistake_id: string
        }
        Update: {
          id?: string
          journal_entry_id?: string
          mistake_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_mistakes_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_mistakes_mistake_id_fkey"
            columns: ["mistake_id"]
            isOneToOne: false
            referencedRelation: "mistake_library"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entry_tags: {
        Row: {
          id: string
          journal_entry_id: string | null
          tag_id: string | null
        }
        Insert: {
          id?: string
          journal_entry_id?: string | null
          tag_id?: string | null
        }
        Update: {
          id?: string
          journal_entry_id?: string | null
          tag_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_tags_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "trade_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_published: boolean | null
          order_index: number
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_published?: boolean | null
          order_index?: number
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_published?: boolean | null
          order_index?: number
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          bio: string | null
          created_at: string | null
          expertise: string[] | null
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          expertise?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          expertise?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          channel: string
          content: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          channel?: string
          content: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      mistake_library: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          read: boolean | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      performance_reports: {
        Row: {
          avg_r: number | null
          best_trade: number | null
          created_at: string
          date_from: string | null
          date_to: string | null
          id: string
          report_data: Json
          report_type: string
          title: string
          total_r: number | null
          total_trades: number | null
          updated_at: string
          user_id: string
          win_rate: number | null
          worst_trade: number | null
        }
        Insert: {
          avg_r?: number | null
          best_trade?: number | null
          created_at?: string
          date_from?: string | null
          date_to?: string | null
          id?: string
          report_data?: Json
          report_type: string
          title: string
          total_r?: number | null
          total_trades?: number | null
          updated_at?: string
          user_id: string
          win_rate?: number | null
          worst_trade?: number | null
        }
        Update: {
          avg_r?: number | null
          best_trade?: number | null
          created_at?: string
          date_from?: string | null
          date_to?: string | null
          id?: string
          report_data?: Json
          report_type?: string
          title?: string
          total_r?: number | null
          total_trades?: number | null
          updated_at?: string
          user_id?: string
          win_rate?: number | null
          worst_trade?: number | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json
          id: string
          is_active: boolean | null
          name: string
          price_monthly: number
          price_yearly: number
          stripe_monthly_price_id: string | null
          stripe_yearly_price_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          name: string
          price_monthly: number
          price_yearly: number
          stripe_monthly_price_id?: string | null
          stripe_yearly_price_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          stripe_monthly_price_id?: string | null
          stripe_yearly_price_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          body: string
          created_at: string | null
          id: string
          tag: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          tag?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          tag?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          full_name: string | null
          has_ai_tools_access: boolean | null
          has_courses_access: boolean | null
          has_funding_access: boolean | null
          has_mentorship_access: boolean | null
          has_signals_access: boolean | null
          id: string
          location: string | null
          name: string
          role: string
          timezone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          has_ai_tools_access?: boolean | null
          has_courses_access?: boolean | null
          has_funding_access?: boolean | null
          has_mentorship_access?: boolean | null
          has_signals_access?: boolean | null
          id: string
          location?: string | null
          name: string
          role?: string
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          has_ai_tools_access?: boolean | null
          has_courses_access?: boolean | null
          has_funding_access?: boolean | null
          has_mentorship_access?: boolean | null
          has_signals_access?: boolean | null
          id?: string
          location?: string | null
          name?: string
          role?: string
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_rewards: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          id: string
          is_redeemed: boolean | null
          reward_type: string | null
          transaction_type: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_redeemed?: boolean | null
          reward_type?: string | null
          transaction_type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_redeemed?: boolean | null
          reward_type?: string | null
          transaction_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referred_id: string | null
          referrer_id: string | null
          reward_status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
          reward_status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
          reward_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      signals: {
        Row: {
          created_at: string | null
          created_by: string
          direction: string
          entry_price: number
          id: string
          notes: string | null
          risk_reward_ratio: number
          status: string
          stop_loss: number
          take_profit: number
          trading_pair: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          direction: string
          entry_price: number
          id?: string
          notes?: string | null
          risk_reward_ratio: number
          status?: string
          stop_loss: number
          take_profit: number
          trading_pair: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          direction?: string
          entry_price?: number
          id?: string
          notes?: string | null
          risk_reward_ratio?: number
          status?: string
          stop_loss?: number
          take_profit?: number
          trading_pair?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_annotations: {
        Row: {
          annotation_data: Json
          created_at: string | null
          id: string
          journal_entry_id: string
        }
        Insert: {
          annotation_data: Json
          created_at?: string | null
          id?: string
          journal_entry_id: string
        }
        Update: {
          annotation_data?: Json
          created_at?: string | null
          id?: string
          journal_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_annotations_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          payment_status: string | null
          service_key: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          payment_status?: string | null
          service_key: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          payment_status?: string | null
          service_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_services: {
        Row: {
          id: string
          is_unlocked: boolean | null
          service_key: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          is_unlocked?: boolean | null
          service_key: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          is_unlocked?: boolean | null
          service_key?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      rule_follow_analysis: {
        Row: {
          avg_r: number | null
          rule_followed: boolean | null
          total_r: number | null
          trades: number | null
          user_id: string | null
        }
        Relationships: []
      }
      session_performance: {
        Row: {
          avg_r: number | null
          session: string | null
          trades: number | null
          user_id: string | null
          win_rate: number | null
        }
        Relationships: []
      }
      setup_performance: {
        Row: {
          avg_r: number | null
          setup_type: string | null
          total_r: number | null
          trades: number | null
          user_id: string | null
        }
        Relationships: []
      }
      strategy_performance: {
        Row: {
          avg_r: number | null
          strategy_used: string | null
          trades: number | null
          user_id: string | null
          win_rate: number | null
        }
        Relationships: []
      }
      user_trade_stats: {
        Row: {
          avg_r: number | null
          best_trade: number | null
          total_r: number | null
          total_trades: number | null
          user_id: string | null
          win_rate: number | null
          worst_trade: number | null
        }
        Relationships: []
      }
      user_wallet_balance: {
        Row: {
          available_credits: number | null
          total_earned: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
