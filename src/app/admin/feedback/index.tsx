import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AdminScreen, Muted, RowLink, Section, SmallButton, adminStyles } from '@/components/admin';
import {
  type FeedbackMode,
  type FeedbackPerson,
  type InboxThread,
  findPeople,
  loadFeedbackMode,
  loadInbox,
  personLabel,
  setFeedbackMode,
  setTester,
} from '@/lib/feedback';
import { colors, font, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Feedback from testers (migration 20261014000002): every thread, newest
// first, with what is unread; the switch for who sees the bubble; and the
// testers who keep it once the switch says "testers only".
// ---------------------------------------------------------------------------

const MODES: { mode: FeedbackMode; label: string; hint: string }[] = [
  { mode: 'everyone', label: 'Everyone', hint: 'Every user sees the bubble, before signing in too. Whoever writes becomes a tester.' },
  { mode: 'testers', label: 'Testers only', hint: 'Only the people below see it. For after the store launch.' },
  { mode: 'off', label: 'Off', hint: 'Nobody sees the bubble. Threads stay here.' },
];

const POLL_MS = 15_000;

export default function AdminFeedback() {
  const [threads, setThreads] = useState<InboxThread[] | null>(null);
  const [mode, setMode] = useState<FeedbackMode | null>(null);
  const [testers, setTesters] = useState<FeedbackPerson[] | null>(null);
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<FeedbackPerson[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    loadInbox().then(setThreads).catch((e) => setError(e.message));
    loadFeedbackMode().then(setMode);
    findPeople().then(setTesters).catch(() => setTesters([]));
  }, []);
  useFocusEffect(
    useCallback(() => {
      load();
      const t = setInterval(() => loadInbox().then(setThreads).catch(() => {}), POLL_MS);
      return () => clearInterval(t);
    }, [load]),
  );

  // Search as she types, a beat after the last key.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return setFound(null);
    const t = setTimeout(() => findPeople(q).then(setFound).catch((e) => setError(e.message)), 250);
    return () => clearTimeout(t);
  }, [query]);

  const changeMode = async (m: FeedbackMode) => {
    const before = mode;
    setMode(m);
    try {
      await setFeedbackMode(m);
    } catch (e) {
      setMode(before);
      setError((e as Error).message);
    }
  };

  const toggleTester = async (p: FeedbackPerson, on: boolean) => {
    try {
      await setTester(p.user_id, on);
      setFound((f) => f?.map((x) => (x.user_id === p.user_id ? { ...x, tester: on ? 'admin' : null } : x)) ?? null);
      findPeople().then(setTesters);
      loadInbox().then(setThreads);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const unread = threads?.reduce((n, t) => n + t.unread, 0) ?? 0;

  return (
    <AdminScreen
      title="Feedback"
      back="/account"
      subtitle={threads ? `${threads.length} conversations · ${unread} unread` : 'Loading…'}>
      {error ? <Text style={{ color: colors.dangerInk }}>{error}</Text> : null}

      <Section title="Inbox">
        {!threads ? (
          <Muted>Loading…</Muted>
        ) : threads.length === 0 ? (
          <Muted>No messages yet. They show up here as soon as a tester sends one from the bubble.</Muted>
        ) : (
          <View style={{ gap: 6 }}>
            {threads.map((t) => (
              <RowLink key={t.user_id} onPress={() => router.push(`/admin/feedback/${t.user_id}`)}>
                <View style={[adminStyles.cellGrow, { gap: 2, minWidth: 220 }]}>
                  <View style={adminStyles.wrap}>
                    <Text style={[adminStyles.cellEs, t.unread > 0 && { color: colors.primaryDark }]}>{personLabel(t)}</Text>
                    {t.anonymous ? <Tag label="guest" /> : null}
                    {!t.tester ? <Tag label="not a tester" /> : null}
                  </View>
                  <Text style={adminStyles.cellEn} numberOfLines={1}>
                    {t.last_from_staff ? 'You: ' : ''}
                    {t.preview}
                  </Text>
                </View>
                <Muted>{ago(t.last_message_at)}</Muted>
                {t.unread > 0 ? (
                  <View style={styles.unread}>
                    <Text style={styles.unreadText}>{t.unread}</Text>
                  </View>
                ) : null}
              </RowLink>
            ))}
          </View>
        )}
      </Section>

      <Section title="Who sees the bubble">
        <View style={adminStyles.wrap}>
          {MODES.map((m) => (
            <SmallButton
              key={m.mode}
              label={m.label}
              tone={mode === m.mode ? 'primary' : 'default'}
              onPress={() => changeMode(m.mode)}
            />
          ))}
        </View>
        <Muted>{MODES.find((m) => m.mode === mode)?.hint ?? ' '}</Muted>
      </Section>

      <Section title={`Testers${testers ? ` · ${testers.length}` : ''}`}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Add a tester: search by email, name or user id"
          placeholderTextColor={colors.faint}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.search}
        />
        {found ? (
          found.length === 0 ? (
            <Muted>Nobody matches.</Muted>
          ) : (
            <View style={{ gap: 6 }}>
              {found.map((p) => (
                <Person key={p.user_id} p={p} onToggle={toggleTester} />
              ))}
            </View>
          )
        ) : !testers ? (
          <Muted>Loading…</Muted>
        ) : testers.length === 0 ? (
          <Muted>No testers yet. Anyone who writes while the bubble is open to everyone is added automatically.</Muted>
        ) : (
          <View style={{ gap: 6 }}>
            {testers.map((p) => (
              <Person key={p.user_id} p={p} onToggle={toggleTester} />
            ))}
          </View>
        )}
      </Section>
    </AdminScreen>
  );
}

function Person({ p, onToggle }: { p: FeedbackPerson; onToggle: (p: FeedbackPerson, on: boolean) => void }) {
  return (
    <RowLink>
      <View style={[adminStyles.cellGrow, { gap: 2, minWidth: 200 }]}>
        <Text style={adminStyles.cellEs}>{personLabel(p)}</Text>
        <Text style={adminStyles.cellEn}>
          {[p.name && p.email ? p.email : null, p.anonymous ? 'guest' : null, p.tester ? `tester (${p.tester === 'auto' ? 'from the round' : 'added by hand'})` : null]
            .filter(Boolean)
            .join(' · ') || p.user_id}
        </Text>
      </View>
      {p.tester ? (
        <SmallButton label="Remove" icon="close" tone="danger" onPress={() => onToggle(p, false)} />
      ) : (
        <SmallButton label="Make tester" icon="add" tone="primary" onPress={() => onToggle(p, true)} />
      )}
    </RowLink>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

function ago(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return 'now';
  if (min < 60) return `${min}m`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h`;
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  unread: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  unreadText: { ...font.body[800], fontSize: 12, color: colors.onPrimary },
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: 'rgba(58, 42, 32, 0.06)' },
  tagText: { ...font.body[700], fontSize: 11, color: colors.muted },
  search: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
    ...font.body[600],
    color: colors.ink,
  },
});
