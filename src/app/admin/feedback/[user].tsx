import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { KeyboardChatScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import type Reanimated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { clay, colors, font, pastel, press, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// One tester's thread: everything she sent, with the screenshots and where she
// was, and the box to answer her. Opening it marks it read; she gets the
// reply as a push and as a dot on her bubble.
// ---------------------------------------------------------------------------

const POLL_MS = 10_000;
/** Same sender within this long → one run: one timestamp under the last bubble. */
const RUN_MS = 5 * 60_000;

export default function AdminFeedbackThread() {
  const { user } = useLocalSearchParams<{ user: string }>();
  const [who, setWho] = useState<FeedbackPerson | null>(null);
  const [messages, setMessages] = useState<FeedbackMessage[] | null>(null);
  const [urls, setUrls] = useState<Map<string, string>>(new Map());
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const scroll = useRef<Reanimated.ScrollView>(null);
  // Follow new messages only while the end is in view; reading older ones,
  // a poll or a reply must not yank the thread down.
  const atEnd = useRef(true);
  const firstFill = useRef(true);

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
      atEnd.current = true; // your own message always scrolls into view
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const canSend = !sending && !!draft.trim();

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
      detail
      fill
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
      <KeyboardChatScrollView
        ref={scroll}
        style={{ flex: 1 }}
        contentContainerStyle={styles.thread}
        offset={insets.bottom}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        onEndVisible={(v) => {
          atEnd.current = v;
        }}
        onContentSizeChange={() => {
          if (!messages?.length) return;
          if (firstFill.current || atEnd.current) scroll.current?.scrollToEnd({ animated: !firstFill.current });
          firstFill.current = false;
        }}>
        {!messages ? (
          <Muted>Loading…</Muted>
        ) : (
          messages.map((m, i) => {
            const prev = messages[i - 1];
            const next = messages[i + 1];
            const newDay = !prev || dayKey(prev.created_at) !== dayKey(m.created_at);
            const endsRun =
              !next ||
              next.from_staff !== m.from_staff ||
              +new Date(next.created_at) - +new Date(m.created_at) > RUN_MS ||
              dayKey(next.created_at) !== dayKey(m.created_at);
            const startsRun = newDay || !prev || prev.from_staff !== m.from_staff;
            return (
              <View key={m.id}>
                {newDay ? <Text style={styles.day}>{dayLabel(m.created_at)}</Text> : null}
                <View style={[styles.message, m.from_staff ? styles.mine : styles.theirs, startsRun && { marginTop: 10 }]}>
                  {m.images.length ? (
                    <View style={adminStyles.wrap}>
                      {m.images.map((p) => {
                        const url = urls.get(p);
                        return (
                          <Pressable key={p} onPress={() => url && setViewing(url)} accessibilityLabel="Open screenshot">
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
                  {endsRun || m.context ? (
                    <Text style={[styles.meta, m.from_staff && { textAlign: 'right' }]}>
                      {[endsRun ? timeLabel(m.created_at) : null, m.context ? describe(m.context) : null].filter(Boolean).join(' · ')}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </KeyboardChatScrollView>

      {/* Rides the keyboard; its safe-area padding tucks under it when open. */}
      <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
        <View style={[styles.composer, { paddingBottom: 10 + insets.bottom }]}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.inputRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Reply…"
              placeholderTextColor={colors.faint}
              multiline
              maxLength={4000}
              style={styles.input}
            />
            <Pressable
              onPress={reply}
              disabled={!canSend}
              accessibilityRole="button"
              accessibilityLabel="Send"
              style={({ pressed }) => [
                styles.send,
                !canSend && styles.sendOff,
                { transform: [{ scale: pressed && canSend ? press.scale : 1 }] },
              ]}>
              <Ionicons name="arrow-up" size={20} color={canSend ? colors.onPrimary : colors.faint} />
            </Pressable>
          </View>
        </View>
      </KeyboardStickyView>
      <ShotViewer url={viewing} onClose={() => setViewing(null)} />
    </AdminScreen>
  );
}

const dayKey = (iso: string) => new Date(iso).toDateString();

/** "Today", "Yesterday", "Tue 4 Nov". */
function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
}

const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** "/practice · v1.0.0 · iPhone 15 · iOS 18.2" */
function describe(c: FeedbackContext) {
  return [c.route, c.app ? `v${c.app}` : null, c.device, c.os ?? c.platform, c.screen].filter(Boolean).join(' · ');
}

/** A screenshot full screen, in the app: pinch to zoom (iOS), tap or ✕ to close. */
function ShotViewer({ url, onClose }: { url: string | null; onClose: () => void }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={!!url} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.viewer}>
        <ScrollView
          maximumZoomScale={4}
          minimumZoomScale={1}
          centerContent
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ width, height }}>
          <Pressable onPress={onClose} style={{ width, height }} accessibilityLabel="Close screenshot">
            {url ? <Image source={{ uri: url }} style={{ width, height }} contentFit="contain" /> : null}
          </Pressable>
        </ScrollView>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={({ pressed }) => [styles.close, { top: insets.top + 8 }, pressed && { transform: [{ scale: 0.94 }] }]}>
          <MaterialCommunityIcons name="close" size={22} color="#fff" />
        </Pressable>
      </View>
    </Modal>
  );
}

/** The thumbnail in the shape of her screen ("435×725"), so cover crops nothing. */
function shotShape(c: FeedbackContext | null) {
  const [w, h] = (c?.screen ?? '').split('×').map(Number);
  return w > 0 && h > 0 ? { height: undefined, aspectRatio: w / h } : null;
}

const styles = StyleSheet.create({
  thread: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 4, maxWidth: 760, width: '100%', alignSelf: 'center' },
  day: { ...font.body[600], fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 18, marginBottom: 4 },
  message: { maxWidth: '82%', gap: 4 },
  mine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  shot: { width: 150, height: 325, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  viewer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.94)' },
  close: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 5 },
  bubbleTheirs: { backgroundColor: pastel.butter, borderBottomLeftRadius: 5 },
  text: { ...font.body[600], fontSize: 15, lineHeight: 21, color: colors.ink },
  meta: { fontSize: 12, color: colors.muted },
  composer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  error: { fontSize: 13, color: colors.dangerInk, paddingHorizontal: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: 760, width: '100%', alignSelf: 'center' },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 140,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    boxShadow: clay.flat,
    fontSize: 15,
    ...font.body[600],
    color: colors.ink,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    boxShadow: clay.chip,
  },
  sendOff: { backgroundColor: colors.stone, boxShadow: 'none' },
});
