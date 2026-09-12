// Hand-rolled types for the Supabase schema in supabase/migrations/.
// Regenerate with `npx supabase gen types typescript --project-id qbzjaseetusewxnfgpes > types/db.ts`
// once the Supabase CLI is logged in.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
        };
        Update: {
          display_name?: string | null;
        };
        Relationships: [];
      };
      streaks: {
        Row: {
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_practice_date: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_practice_date?: string | null;
        };
        Update: {
          current_streak?: number;
          longest_streak?: number;
          last_practice_date?: string | null;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          topic: string | null;
          prompt: string;
          data: Json;
          last_correct: number | null;
          last_total: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          topic?: string | null;
          prompt: string;
          data: Json;
          last_correct?: number | null;
          last_total?: number | null;
        };
        Update: {
          topic?: string | null;
          last_correct?: number | null;
          last_total?: number | null;
        };
        Relationships: [];
      };
      partner_links: {
        Row: {
          user_id: string;
          partner_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          partner_id: string;
        };
        Update: {
          partner_id?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          expo_push_token: string;
          platform: "ios" | "android" | "web";
          reminder_time: string;
          timezone: string;
          notifications_enabled: boolean;
          last_sent_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          expo_push_token: string;
          platform: "ios" | "android" | "web";
          reminder_time?: string;
          timezone?: string;
          notifications_enabled?: boolean;
        };
        Update: {
          expo_push_token?: string;
          reminder_time?: string;
          timezone?: string;
          notifications_enabled?: boolean;
        };
        Relationships: [];
      };
    };
    Functions: {
      bump_streak: {
        Args: { p_today: string };
        Returns: {
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_practice_date: string | null;
          updated_at: string;
        };
      };
      sync_partner_reminder: {
        Args: { p_reminder_time: string; p_enabled: boolean };
        Returns: number;
      };
    };
    Views: Record<string, never>;
    Enums: Record<string, never>;
  };
}
