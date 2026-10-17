import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AdminScreen, Muted, SmallButton, adminStyles } from '@/components/admin';
import {
  type FeedbackContext,
  type FeedbackMessage,
  type FeedbackPerson,
  findPeople,
  imageUrls,
  loadThread,
  markThreadRead,
  personLabel,
  sendReply,
  setTester,
} from '@/lib/feedback';
import { colors, font, pastel, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// One tester's thread: everything she sent, with the screenshots and where she
// was, and the box to answer her. Opening it marks it read; she gets the
// reply as a push and as a dot on her bubble.
// ---------------------------------------------------------------------------

const POLL_MS = 10_000;

export default function AdminFeedbackThread() {
  const { user } = useLocalSearchParams<{ user: string }>();
  const [who, setWho] = useState<FeedbackPerson | null>(null);
  const [messages, setMessages] = useState<FeedbackMessage[] | null>(null);
  const [urls, setUrls] = useState<Map<string, string>>(new Map());
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const list = await loadThread(user);
      setMessages(list);
      const paths = list.flatMap((m) => m.images);
      if (paths.length) setUrls(await imageUrls(paths));
      await markThreadRead(user);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user) findPeople(user).then((p) => setWho(p[0] ?? null)).catch(() => {});
      load();
      const t = setInterval(load, POLL_MS);
      return () => clearInterval(t);
    }, [user, load]),
  );

  const reply = async () => {
    if (!user || !draft.trim()) return;
    setSending(true);
    setError(null);
    try {
      const saved = await sendReply(user, draft);
      setMessages((m) => [...(m ?? []), saved]);
      setDraft('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const toggleTester = async () => {
    if (!who) return;
    try {
      await setTester(who.user_id, !who.tester);
      setWho({ ...who, tester: who.tester ? null : 'admin' });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <AdminScreen
      title={who ? personLabel(who) : 'Feedback'}
      subtitle={[who?.name && who.email ? who.email : null, who?.anonymous ? 'guest (no account yet)' : null, user]
        .filter(Boolean)
        .join(' · ')}
      back="/admin/feedback"
      actions={
        who ? (
          <SmallButton
            label={who.tester ? 'Tester · remove' : 'Make tester'}
            icon={who.tester ? 'close' : 'add'}
            tone={who.tester ? 'default' : 'primary'}
            onPress={toggleTester}
          />
        ) : null
      }>
      {!messages ? (
        <Muted>Loading…</Muted>
      ) : (
        <View style={{ gap: 14 }}>
          {messages.map((m) => (
            <View key={m.id} style={[styles.message, m.from_staff ? styles.mine : styles.theirs]}>
              {m.images.length ? (
                <View style={adminStyles.wrap}>
                  {m.images.map((p) => {
                    const url = urls.get(p);
                    return (
                      <Pressable key={p} onPress={() => url && Linking.openURL(url)} accessibilityLabel="Open screenshot">
                        {url ? (
                          <Image source={{ uri: url }} style={[styles.shot, shotShape(m.context)]} contentFit="cover" />
                        ) : (
                          <View style={[styles.shot, shotShape(m.context), { backgroundColor: colors.stone }]} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
              {m.body ? (
                <View style={[styles.bubble, m.from_staff ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text selectable style={[styles.text, m.from_staff && { color: colors.onPrimary }]}>
                    {m.body}
                  </Text>
                </View>
              ) : null}
              <Text style={styles.meta}>
                {new Date(m.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                {m.context ? ` · ${describe(m.context)}` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Reply…"
          placeholderTextColor={colors.faint}
          multiline
          maxLength={4000}
          style={styles.input}
        />
        <SmallButton label={sending ? 'Sending…' : 'Send'} icon="send" tone="primary" disabled={sending || !draft.trim()} onPress={reply} />
      </View>
      {error ? <Text style={{ color: colors.dangerInk }}>{error}</Text> : null}
    </AdminScreen>
  );
}

/** "/practice · v1.0.0 · iPhone 15 · iOS 18.2" */
function describe(c: FeedbackContext) {
  return [c.route, c.app ? `v${c.app}` : null, c.device, c.os ?? c.platform, c.screen].filter(Boolean).join(' · ');
}

/** The thumbnail in the shape of her screen ("435×725"), so cover crops nothing. */
function shotShape(c: FeedbackContext | null) {
  const [w, h] = (c?.screen ?? '').split('×').map(Number);
  return w > 0 && h > 0 ? { height: undefined, aspectRatio: w / h } : null;
}

const styles = StyleSheet.create({
  message: { maxWidth: 640, gap: 6 },
  mine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  shot: { width: 150, height: 325, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 5 },
  bubbleTheirs: { backgroundColor: pastel.butter, borderBottomLeftRadius: 5 },
  text: { ...font.body[600], fontSize: 15, lineHeight: 21, color: colors.ink },
  meta: { fontSize: 12, color: colors.muted },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 200,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    ...font.body[600],
    color: colors.ink,
  },
});
