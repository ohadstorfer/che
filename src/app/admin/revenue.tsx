import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import { AdminScreen, Muted, Section, SmallButton, adminStyles } from '@/components/admin';
import { type Revenue, type RevenueDay, loadRevenue, pct, usd } from '@/lib/admin-revenue';
import { useAuth } from '@/lib/auth';
import { clay, colors, font, pastel, press, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Money, the way RevenueCat showed it: MRR and who is paying now, revenue per
// day, trials and how many pay, who is leaving, and the latest word from the
// stores. Read from our own tables (admin_revenue), in US dollars; sandbox
// purchases and testers never count. Admins only — reviewers see a note.
// ---------------------------------------------------------------------------

const RANGES = [7, 30, 90, 365] as const;
type Metric = 'revenue' | 'trials' | 'new_payers';
const METRICS: { key: Metric; label: string }[] = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'trials', label: 'Trials' },
  { key: 'new_payers', label: 'New payers' },
];

const EVENT_LABEL: Record<string, string> = {
  trial_started: 'Trial started',
  first_payment: 'First payment',
  subscription_resubscribed: 'Resubscribed',
  subscription_renewed: 'Renewed',
  subscription_cancelled: 'Cancelled',
  subscription_uncancelled: 'Uncancelled',
  billing_issue: 'Billing issue',
  subscription_expired: 'Expired',
  subscription_refunded: 'Refunded',
  winback_redeemed: 'Win-back',
};
const BAD = new Set(['subscription_cancelled', 'billing_issue', 'subscription_expired', 'subscription_refunded']);
const PAID = new Set(['first_payment', 'subscription_resubscribed', 'subscription_renewed']);

export default function AdminRevenue() {
  const { profile } = useAuth();
  const [days, setDays] = useState<number>(30);
  const [metric, setMetric] = useState<Metric>('revenue');
  const [data, setData] = useState<Revenue | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((d: number) => {
    setError(null);
    loadRevenue(d).then(setData, (e: Error) => setError(e.message));
  }, []);

  useFocusEffect(useCallback(() => load(days), [load, days]));

  if (profile?.role !== 'admin') {
    return (
      <AdminScreen title="Revenue">
        <Muted>Revenue is for admins only.</Muted>
      </AdminScreen>
    );
  }

  const c = data?.counts;
  const conv = data?.trial_conversion;
  const decided = conv ? conv.started - conv.running : 0;

  return (
    <AdminScreen
      title="Revenue"
      subtitle={data ? `USD · real purchases · ${time(data.generated_at)}` : error ? 'Could not load' : 'Loading…'}
      actions={<SmallButton label="Refresh" icon="refresh-outline" onPress={() => load(days)} />}>
      <View style={[styles.segment, { alignSelf: 'flex-start' }]}>
        {RANGES.map((r) => (
          <Chip key={r} label={r === 365 ? '1 year' : `${r} days`} active={days === r} onPress={() => setDays(r)} />
        ))}
      </View>
      {error ? <Muted>{error}</Muted> : null}

      <Section title="Now">
        <View style={styles.tiles}>
          <Tile label="MRR" value={data ? usd(data.mrr) : '…'} hint={data ? `${usd(data.mrr * 12)} a year` : undefined} big />
          <Tile
            label="Active subscribers"
            value={data ? String(data.active_subs) : '…'}
            hint={data ? `${data.by_plan.yearly ?? 0} yearly · ${data.by_plan.monthly ?? 0} monthly` : undefined}
          />
          <Tile
            label="Active trials"
            value={data ? String(data.active_trials) : '…'}
            hint={data ? `Play ${data.by_store.PLAY_STORE ?? 0} · iOS ${data.by_store.APP_STORE ?? 0} in all` : undefined}
          />
          <Tile
            label="Cancelling"
            value={data ? String(data.cancelling) : '…'}
            hint="auto-renew off"
            tone={data && data.cancelling > 0 ? 'bad' : undefined}
          />
        </View>
      </Section>

      <Section title={`Last ${days === 365 ? 'year' : `${days} days`}`}>
        <View style={styles.tiles}>
          <Tile label="Revenue" value={data ? usd(data.revenue) : '…'} hint={data ? `all time ${usd(data.revenue_all_time)}` : undefined} />
          <Tile
            label="Trial → paid"
            value={conv ? pct(conv.converted, decided) : '…'}
            hint={conv ? `${conv.converted} of ${decided} ended trials${conv.running ? ` · ${conv.running} still in trial` : ''}` : undefined}
          />
          <Tile
            label="Paywall → checkout"
            value={data ? pct(data.paywall.checkout, data.paywall.shown) : '…'}
            hint={data ? `${data.paywall.checkout} of ${data.paywall.shown} who saw it` : undefined}
          />
          <Tile
            label="Refunds"
            value={data ? usd(data.refunds) : '…'}
            hint={c ? `${c.refunded} refunded` : undefined}
            tone={data && data.refunds > 0 ? 'bad' : undefined}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.segment}>
              {METRICS.map((m) => (
                <Chip key={m.key} label={m.label} active={metric === m.key} onPress={() => setMetric(m.key)} />
              ))}
            </View>
            {data ? <Text style={styles.chartTotal}>{chartTotal(data.daily, metric)}</Text> : null}
          </View>
          {data ? <Bars days={data.daily} metric={metric} /> : <View style={{ height: CHART_H }} />}
        </View>

        {c ? (
          <View style={styles.counts}>
            <Count label="Trials started" n={c.trial_started} />
            <Count label="First payments" n={c.first_payment} hint={c.from_trial ? `${c.from_trial} from a trial` : undefined} />
            <Count label="Renewals" n={c.renewed} />
            <Count label="Resubscribed" n={c.resubscribed} />
            <Count label="Win-backs" n={c.winback} />
            <Count label="Cancelled" n={c.cancelled} bad hint={c.uncancelled ? `${c.uncancelled} turned it back on` : undefined} />
            <Count label="Billing issues" n={c.billing_issue} bad />
            <Count label="Expired" n={c.expired} bad />
          </View>
        ) : null}
        {data && data.unconverted.length ? (
          <Muted>No exchange rate for {data.unconverted.join(', ')}: those charges count as $0. Add them to app_config.usd_rates.</Muted>
        ) : null}
      </Section>

      <Section title="Latest from the stores">
        {!data ? (
          <Muted>Loading…</Muted>
        ) : data.recent.length === 0 ? (
          <Muted>No real purchases yet.</Muted>
        ) : (
          <View style={styles.table}>
            {data.recent.map((r, i) => (
              <View key={`${r.at}-${i}`} style={[styles.tr, i > 0 && styles.trLine]}>
                <Text style={[styles.when]}>{when(r.at)}</Text>
                <View style={[styles.dot, { backgroundColor: BAD.has(r.event) ? colors.danger : PAID.has(r.event) ? colors.success : colors.faint }]} />
                <View style={[adminStyles.cellGrow, { minWidth: 160 }]}>
                  <Text style={styles.ev}>
                    {EVENT_LABEL[r.event] ?? r.event}
                    {r.from_trial ? ' · after trial' : ''}
                  </Text>
                  <Text style={styles.sub} numberOfLines={1}>
                    {r.who} · {plan(r.product_id)} · {r.store === 'apple' ? 'App Store' : r.store === 'google' ? 'Play' : r.store ?? ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.money, r.event === 'subscription_refunded' && { color: colors.dangerInk }]}>
                    {PAID.has(r.event) || r.event === 'subscription_refunded' ? `${r.event === 'subscription_refunded' ? '−' : ''}${usd(r.usd)}` : ''}
                  </Text>
                  {r.currency && r.currency !== 'USD' && r.amount ? (
                    <Text style={styles.sub}>
                      {r.amount} {r.currency}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </Section>

      <Muted>
        MRR counts each paying subscriber at their last charge (a yearly one ÷ 12), or the list price when no charge is on record. Apple
        amounts include tax and Play's are the base price. Neither has the store's 15% taken off.
      </Muted>
    </AdminScreen>
  );
}

// ---------------------------------------------------------------------------

function Tile({ label, value, hint, big, tone }: { label: string; value: string; hint?: string; big?: boolean; tone?: 'bad' }) {
  return (
    <View style={[styles.tile, big && styles.tileBig]}>
      <Text style={adminStyles.label}>{label}</Text>
      <Text style={[styles.value, big && styles.valueBig, tone === 'bad' && { color: colors.dangerInk }]}>{value}</Text>
      {hint ? <Text style={styles.sub}>{hint}</Text> : null}
    </View>
  );
}

function Count({ label, n, hint, bad }: { label: string; n: number; hint?: string; bad?: boolean }) {
  return (
    <View style={styles.count}>
      <Text style={[styles.countN, bad && n > 0 && { color: colors.dangerInk }]}>{n}</Text>
      <Text style={styles.sub}>{label}</Text>
      {hint ? <Text style={[styles.sub, { color: colors.faint }]}>{hint}</Text> : null}
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, { transform: [{ scale: pressed ? press.scale : 1 }] }]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const CHART_H = 160;

function Bars({ days, metric }: { days: RevenueDay[]; metric: Metric }) {
  const { width: screen } = useWindowDimensions();
  const [w, setW] = useState(Math.min(screen - 80, 1000));
  const values = days.map((d) => Number(d[metric]) || 0);
  const max = Math.max(...values, metric === 'revenue' ? 1 : 1);
  const gap = days.length > 60 ? 1 : 3;
  const bw = Math.max(1, (w - gap * (days.length - 1)) / days.length);
  const first = days[0]?.day;
  const last = days[days.length - 1]?.day;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Svg width={w} height={CHART_H}>
        <Line x1={0} x2={w} y1={CHART_H - 0.5} y2={CHART_H - 0.5} stroke={colors.border} strokeWidth={1} />
        {values.map((v, i) =>
          v > 0 ? (
            <Rect
              key={i}
              x={i * (bw + gap)}
              y={CHART_H - 1 - Math.max(2, (v / max) * (CHART_H - 12))}
              width={bw}
              height={Math.max(2, (v / max) * (CHART_H - 12))}
              rx={Math.min(3, bw / 2)}
              fill={metric === 'revenue' ? colors.primary : metric === 'trials' ? colors.accent : colors.success}
            />
          ) : null,
        )}
      </Svg>
      <View style={styles.axis}>
        <Text style={styles.sub}>{first ? short(first) : ''}</Text>
        <Text style={styles.sub}>
          max {metric === 'revenue' ? usd(max) : max} a day
        </Text>
        <Text style={styles.sub}>{last ? short(last) : ''}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------

function chartTotal(days: RevenueDay[], metric: Metric) {
  const total = days.reduce((n, d) => n + (Number(d[metric]) || 0), 0);
  return metric === 'revenue' ? usd(total) : String(total);
}

const plan = (id: string | null) =>
  id === 'posta_premium_monthly' ? 'monthly' : id === 'posta_premium_annual_offer' ? 'yearly (offer)' : id === 'posta_premium_annual' ? 'yearly' : id ?? '';

const short = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const time = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

function when(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  tile: {
    flexGrow: 1,
    flexBasis: 150,
    gap: 4,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    boxShadow: clay.surface,
  },
  tileBig: { backgroundColor: pastel.sage },
  value: { ...font.display[800], fontSize: 28, color: colors.ink, letterSpacing: -0.4, fontVariant: ['tabular-nums'] },
  valueBig: { color: colors.onPastel },
  sub: { fontSize: 13, color: colors.muted, fontVariant: ['tabular-nums'] },
  card: { gap: 14, padding: 16, marginTop: 4, backgroundColor: colors.card, borderRadius: radius.lg, boxShadow: clay.surface },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  chartTotal: { ...font.display[800], fontSize: 20, color: colors.ink, fontVariant: ['tabular-nums'] },
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  segment: { flexDirection: 'row', gap: 4, padding: 4, backgroundColor: colors.stone, borderRadius: radius.pill },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  chipActive: { backgroundColor: colors.primary, boxShadow: clay.chip },
  chipText: { fontSize: 13, ...font.body[700], color: colors.muted },
  chipTextActive: { color: colors.onPrimary },
  counts: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  count: { flexGrow: 1, flexBasis: 120, gap: 2, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: colors.card, borderRadius: radius.md, boxShadow: clay.chip },
  countN: { ...font.display[800], fontSize: 20, color: colors.ink, fontVariant: ['tabular-nums'] },
  table: { backgroundColor: colors.card, borderRadius: radius.lg, boxShadow: clay.surface, paddingHorizontal: 16 },
  tr: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, flexWrap: 'wrap' },
  trLine: { borderTopWidth: 1.5, borderTopColor: colors.border },
  when: { fontSize: 13, color: colors.muted, width: 104, fontVariant: ['tabular-nums'] },
  dot: { width: 8, height: 8, borderRadius: 4 },
  ev: { fontSize: 15, ...font.body[700], color: colors.ink },
  money: { fontSize: 15, ...font.body[700], color: colors.ink, fontVariant: ['tabular-nums'] },
});
