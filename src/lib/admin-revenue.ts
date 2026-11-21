import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// The revenue dashboard's numbers (src/app/admin/revenue.tsx), from the
// admin_revenue function (supabase/migrations/20261120000010_admin_revenue.sql):
// in US dollars, sandbox and testers left out, admins only.
// ---------------------------------------------------------------------------

export interface RevenueDay {
  day: string;
  revenue: number;
  refunds: number;
  trials: number;
  new_payers: number;
  renewals: number;
  cancellations: number;
}

export interface RevenueEventRow {
  at: string;
  event: string;
  store: string | null;
  product_id: string | null;
  amount: number | null;
  currency: string | null;
  usd: number | null;
  from_trial: boolean;
  who: string;
}

export interface Revenue {
  days: number;
  generated_at: string;
  mrr: number;
  active_subs: number;
  active_trials: number;
  cancelling: number;
  by_plan: Partial<Record<'monthly' | 'yearly', number>>;
  by_store: Partial<Record<'APP_STORE' | 'PLAY_STORE', number>>;
  trials_by_store?: Partial<Record<'APP_STORE' | 'PLAY_STORE', number>>;
  revenue: number;
  refunds: number;
  revenue_all_time: number;
  counts: Record<
    | 'trial_started' | 'first_payment' | 'from_trial' | 'resubscribed' | 'renewed' | 'cancelled'
    | 'uncancelled' | 'billing_issue' | 'expired' | 'refunded' | 'winback',
    number
  >;
  trial_conversion: { started: number; converted: number; running: number };
  paywall: { shown: number; checkout: number };
  daily: RevenueDay[];
  unconverted: string[];
  recent: RevenueEventRow[];
}

export async function loadRevenue(days: number): Promise<Revenue> {
  const { data, error } = await supabase.rpc('admin_revenue', { p_days: days });
  if (error) throw new Error(error.message);
  return data as Revenue;
}

/** $1,234 — cents only under $100, where they still matter. */
export function usd(n: number | null | undefined): string {
  if (n == null) return '—';
  const cents = Math.abs(n) < 100;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 })}`;
}

export const pct = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : '—');
