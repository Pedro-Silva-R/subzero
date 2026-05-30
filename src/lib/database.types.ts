// ============================================================
// database.types.ts — Tipos generados manualmente basados en
// el esquema de Supabase de Sus_App (Fase de Desarrollo).
// Cuando se active la CLI de Supabase en producción, este
// archivo puede regenerarse con:
//   pnpm supabase gen types typescript --project-id <id>
// ============================================================

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
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          is_active: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: string;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          amount: number;
          currency: string;
          cycle: string;
          status: string;
          next_charge_date: string | null;
          signup_date: string;
          payment_method_id: string | null;
          is_trial: boolean;
          trial_end_date: string | null;
          shared_with: string[];
          payment_notes: string | null;
          notes: string | null;
          price_history: PriceHistoryEntry[];
          payment_history: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category?: string;
          amount: number;
          currency?: string;
          cycle?: string;
          status?: string;
          next_charge_date?: string | null;
          signup_date?: string;
          payment_method_id?: string | null;
          is_trial?: boolean;
          trial_end_date?: string | null;
          shared_with?: string[];
          payment_notes?: string | null;
          notes?: string | null;
          price_history?: PriceHistoryEntry[];
          payment_history?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string;
          amount?: number;
          currency?: string;
          cycle?: string;
          status?: string;
          next_charge_date?: string | null;
          signup_date?: string;
          payment_method_id?: string | null;
          is_trial?: boolean;
          trial_end_date?: string | null;
          shared_with?: string[];
          payment_notes?: string | null;
          notes?: string | null;
          price_history?: PriceHistoryEntry[];
          payment_history?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ── Tipos auxiliares ──────────────────────────────────────────

/** Entrada de historial de precios almacenada en JSONB */
export interface PriceHistoryEntry {
  date: string;    // ISO: 'YYYY-MM-DD'
  amount: number;
  currency: string;
}

/** Alias convenientes para los tipos de fila (Row) */
export type DbPaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
export type DbSubscription  = Database['public']['Tables']['subscriptions']['Row'];

/** Tipos de inserción */
export type DbPaymentMethodInsert = Database['public']['Tables']['payment_methods']['Insert'];
export type DbSubscriptionInsert  = Database['public']['Tables']['subscriptions']['Insert'];

/** Tipos de actualización */
export type DbPaymentMethodUpdate = Database['public']['Tables']['payment_methods']['Update'];
export type DbSubscriptionUpdate  = Database['public']['Tables']['subscriptions']['Update'];
