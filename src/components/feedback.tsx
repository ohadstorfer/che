import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, usePathname } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { POSE } from '@/components/mascot';
import { useAuth } from '@/lib/auth';
import {
  type Attachment,
  type FeedbackMessage,
  MAX_IMAGES,
  feedbackAccess,
  feedbackContext,
  imageUrls,
  loadThread,
  markFeedbackRead,
  sendFeedback,
} from '@/lib/feedback';
import { listenForFeedbackPush } from '@/lib/feedback-push';
import { success, tap } from '@/lib/haptics';
import { captureCurrentScreen } from '@/lib/screen-capture';
import { clay, colors, font, pastel, press, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Feedback — a bubble over the whole app, and the chat it opens.
//
// The bubble floats over every screen (lessons, onboarding, the paywall) while
// the feedback switch is open to her (lib/feedback.ts). It can be dragged out
// of the way of whatever it covers, settles on the nearest side edge, and
// remembers where it was put. Pressing it photographs the screen first —
// with the bubble itself hidden for that frame — and then raises a sheet over
// where she is: her thread with the team, the screenshot already attached,
// and a box to say what happened. Closing it leaves her exactly where she was.
//
// A rosa dot on the bubble counts the team's replies she hasn't read; a push
// brings them too, and tapping that push opens the chat.
// ---------------------------------------------------------------------------

const SIZE = 52;
const EDGE = 10;
const SPOT_KEY = 'feedback-bubble-spot';
/** Where the bubble starts: the right edge, a little below the middle. */
const DEFAULT_SPOT = { right: true, at: 0.62 };
const POLL_MS = 60_000;
const SHEET_POLL_MS = 8_000;

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const DRAWER = Easing.bezier(0.32, 0.72, 0, 1);
const SETTLE = { damping: 22, stiffness: 260, mass: 0.8 };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function FeedbackLayer() {
  const { session } = useAuth();
  const pathname = usePathname();
  const [access, setAccess] = useState({ open: false, unread: 0 });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [shot, setShot] = useState<Attachment | null>(null);
  const [capturing, setCapturing] = useState(false);
  const busy = useRef(false);
  const userId = session?.user.id;

  const refresh = useCallback(() => {
    feedbackAccess().then(setAccess);
  }, []);

  // Whether she sees it changes with who she is, and with the switch.
  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    const t = setInterval(() => AppState.currentState === 'active' && refresh(), POLL_MS);
    return () => {
      sub.remove();
      clearInterval(t);
    };
  }, [refresh, userId]);

  const openSheet = useCallback(async (withScreenshot: boolean) => {
    if (busy.current) return;
    busy.current = true;
    tap();
    let captured: Attachment | null = null;
    if (withScreenshot) {
      setCapturing(true);
      // Long enough for the hidden bubble to reach the screen before it is photographed.
      await wait(60);
      captured = await captureCurrentScreen();
      setCapturing(false);
    }
    setShot(captured);
    setSheetOpen(true);
    busy.current = false;
  }, []);

  useEffect(
    () =>
      listenForFeedbackPush({
        opened: (d) => (d.feedback === 'reply' ? openSheet(false) : router.push(`/admin/feedback/${d.user}`)),
        received: refresh,
      }),
    [openSheet, refresh],
  );

  const close = useCallback(() => {
    setSheetOpen(false);
    refresh();
  }, [refresh]);
  const read = useCallback(() => setAccess((a) => (a.unread ? { ...a, unread: 0 } : a)), []);
  const pressBubble = useCallback(() => openSheet(true), [openSheet]);

  const visible = access.open && !pathname.startsWith('/admin') && !sheetOpen;

  return (
    <>
      <Bubble visible={visible} capturing={capturing} unread={access.unread} onPress={pressBubble} />
      <FeedbackSheet
        open={sheetOpen}
        screenshot={shot}
        route={pathname}
        onRead={read}
        onClose={close}
      />
    </>
  );
}

// --- the bubble -------------------------------------------------------------------

function Bubble({
  visible,
  capturing,
  unread,
  onPress,
}: {
  visible: boolean;
  capturing: boolean;
  unread: number;
  onPress: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const minY = insets.top + 8;
  const maxY = height - insets.bottom - SIZE - 12;
  const leftX = EDGE;
  const rightX = width - SIZE - EDGE;

  const [spot, setSpot] = useState<typeof DEFAULT_SPOT | null>(null);
  const x = useSharedValue(rightX);
  const y = useSharedValue(minY + (maxY - minY) * DEFAULT_SPOT.at);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const shown = useSharedValue(0);
  const pressed = useSharedValue(0);
  const lifted = useSharedValue(0);

  useEffect(() => {
    AsyncStorage.getItem(SPOT_KEY)
      .then((s) => setSpot(s ? { ...DEFAULT_SPOT, ...JSON.parse(s) } : DEFAULT_SPOT))
      .catch(() => setSpot(DEFAULT_SPOT));
  }, []);

  // Placed from where it was left, again whenever the window changes size.
  useEffect(() => {
    if (!spot) return;
    x.set(spot.right ? rightX : leftX);
    y.set(minY + (maxY - minY) * spot.at);
  }, [spot, leftX, rightX, minY, maxY, x, y]);

  // Hidden at once for a screenshot (it mustn't be in the picture); otherwise
  // it fades in and out, never popping from nothing.
  useEffect(() => {
    if (capturing) shown.set(0);
    else shown.set(withTiming(visible && spot ? 1 : 0, { duration: visible ? 220 : 140, easing: EASE_OUT }));
  }, [visible, capturing, spot, shown]);

  const save = useCallback(
    (right: boolean, top: number) => {
      const at = maxY > minY ? Math.min(1, Math.max(0, (top - minY) / (maxY - minY))) : DEFAULT_SPOT.at;
      AsyncStorage.setItem(SPOT_KEY, JSON.stringify({ right, at })).catch(() => {});
    },
    [minY, maxY],
  );

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .minDistance(6)
      .maxPointers(1)
      .onStart(() => {
        'worklet';
        startX.set(x.get());
        startY.set(y.get());
        lifted.set(withTiming(1, { duration: 120, easing: EASE_OUT }));
      })
      .onUpdate((e) => {
        'worklet';
        x.set(startX.get() + e.translationX);
        // Past the top or bottom it follows with friction instead of stopping dead.
        const to = startY.get() + e.translationY;
        y.set(to < minY ? minY - (minY - to) * 0.25 : to > maxY ? maxY + (to - maxY) * 0.25 : to);
      })
      .onEnd((e) => {
        'worklet';
        // A flick carries it: where it is heading decides the side, not only where it was let go.
        const right = x.get() + e.velocityX * 0.12 + SIZE / 2 > width / 2;
        const top = Math.min(maxY, Math.max(minY, y.get() + e.velocityY * 0.06));
        x.set(withSpring(right ? rightX : leftX, { ...SETTLE, velocity: e.velocityX }));
        y.set(withSpring(top, { ...SETTLE, velocity: e.velocityY }));
        scheduleOnRN(save, right, top);
      })
      .onFinalize(() => {
        'worklet';
        lifted.set(withTiming(0, { duration: 160, easing: EASE_OUT }));
      });
    const press_ = Gesture.Tap()
      .maxDuration(500)
      .onBegin(() => {
        'worklet';
        pressed.set(withTiming(1, { duration: press.duration, easing: EASE_OUT }));
      })
      .onFinalize(() => {
        'worklet';
        pressed.set(withTiming(0, { duration: press.duration, easing: EASE_OUT }));
      })
      .onEnd((_e, ok) => {
        'worklet';
        if (ok) scheduleOnRN(onPress);
      });
    return Gesture.Race(pan, press_);
  }, [width, minY, maxY, leftX, rightX, save, onPress, x, y, startX, startY, lifted, pressed]);

  const style = useAnimatedStyle(() => ({
    opacity: shown.get(),
    transform: [
      { translateX: x.get() },
      { translateY: y.get() },
      // Pressing pushes it in; dragging lifts it off the page; arriving it grows from 0.9.
      { scale: (0.9 + 0.1 * shown.get()) * (1 - 0.06 * pressed.get() + 0.08 * lifted.get()) },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        pointerEvents={visible && !capturing ? 'auto' : 'none'}
        accessibilityRole="button"
        accessibilityLabel={unread ? `Feedback, ${unread} new ${unread === 1 ? 'reply' : 'replies'}` : 'Send feedback'}
        style={[styles.bubble, style]}>
        {/* The face carries the outline; the dot is its sibling so iOS doesn't paint the outline across it. */}
        <View style={styles.bubbleFace}>
          <Ionicons name="chatbubble-ellipses" size={24} color={colors.ink} />
        </View>
        {unread > 0 ? (
          <View style={styles.dot}>
            <Text style={styles.dotText}>{unread > 9 ? '9+' : unread}</Text>
          </View>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

// --- the sheet --------------------------------------------------------------------

interface Outgoing {
  key: string;
  body: string;
  attachments: Attachment[];
  state: 'sending' | 'failed';
  error?: string;
}

function FeedbackSheet({
  open,
  screenshot,
  route,
  onRead,
  onClose,
}: {
  open: boolean;
  screenshot: Attachment | null;
  route: string;
  onRead: () => void;
  onClose: () => void;
}) {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const reduced = useReducedMotion();
  const sheetH = Math.min(screenH * 0.9, 820);

  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<FeedbackMessage[] | null>(null);
  const [urls, setUrls] = useState<Map<string, string>>(new Map());
  const [outbox, setOutbox] = useState<Outgoing[]>([]);
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [viewing, setViewing] = useState<string | null>(null);
  const scroll = useRef<ScrollView>(null);
  const routeAtOpen = useRef(route);
  /** Team replies seen so far; more than this means there is something to mark read. */
  const repliesSeen = useRef(-1);
  const userId = session?.user.id;

  const progress = useSharedValue(0);
  const drag = useSharedValue(0);
  // The keyboard, followed frame by frame: the sheet stands on it and gives
  // up height from the top, so the header stays on screen. (A
  // KeyboardAvoidingView inside the Modal lifted it twice on iOS.)
  const keyboard = useAnimatedKeyboard();
  const top = insets.top + 12;
  const keyboardStyle = useAnimatedStyle(() => {
    const kb = keyboard.height.get();
    return { height: Math.min(sheetH, screenH - top - kb), marginBottom: kb };
  });
  const composerStyle = useAnimatedStyle(() => ({
    paddingBottom: 12 + Math.max(0, insets.bottom - keyboard.height.get()),
  }));

  // In with the drawer curve; out faster, since closing is the app answering.
  useEffect(() => {
    if (open) {
      setMounted(true);
      routeAtOpen.current = route;
      repliesSeen.current = -1;
      setAttachments(screenshot ? [screenshot] : []);
      drag.set(0);
      progress.set(withTiming(1, { duration: 340, easing: DRAWER }));
      return;
    }
    progress.set(withTiming(0, { duration: 220, easing: EASE_OUT }));
    const t = setTimeout(() => {
      setMounted(false);
      setViewing(null);
    }, 240);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const load = useCallback(async () => {
    if (!userId) return setMessages([]);
    try {
      const list = await loadThread(userId);
      setMessages(list);
      const paths = list.flatMap((m) => m.images);
      if (paths.length) setUrls(await imageUrls(paths));
      const replies = list.filter((m) => m.from_staff).length;
      if (replies > Math.max(0, repliesSeen.current)) {
        await markFeedbackRead();
        onRead();
      }
      repliesSeen.current = replies;
    } catch {
      setMessages((m) => m ?? []);
    }
  }, [userId, onRead]);

  useEffect(() => {
    if (!open) return;
    load();
    const t = setInterval(load, SHEET_POLL_MS);
    return () => clearInterval(t);
  }, [open, load]);

  const send = useCallback(
    async (item: Outgoing) => {
      setOutbox((o) => [...o.filter((x) => x.key !== item.key), { ...item, state: 'sending', error: undefined }]);
      try {
        const saved = await sendFeedback(item.body, item.attachments, feedbackContext(routeAtOpen.current));
        success();
        setMessages((m) => [...(m ?? []), saved]);
        // The photo she just sent is on this phone already: show it from there.
        setUrls((u) => {
          const next = new Map(u);
          saved.images.forEach((p, i) => item.attachments[i] && next.set(p, item.attachments[i].uri));
          return next;
        });
        setOutbox((o) => o.filter((x) => x.key !== item.key));
      } catch (e) {
        setOutbox((o) =>
          o.map((x) => (x.key === item.key ? { ...x, state: 'failed', error: (e as Error).message } : x)),
        );
      }
    },
    [],
  );

  const submit = () => {
    const body = draft.trim();
    if (!body && attachments.length === 0) return;
    setDraft('');
    setAttachments([]);
    void send({ key: `${Date.now()}`, body, attachments, state: 'sending' });
  };

  const addPhotos = async () => {
    const room = MAX_IMAGES - attachments.length;
    if (room <= 0) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: room > 1,
      selectionLimit: room,
      quality: 0.7,
    });
    if (res.canceled) return;
    setAttachments((a) =>
      [...a, ...res.assets.map((x) => ({ uri: x.uri, width: x.width || 9, height: x.height || 16 }))].slice(0, MAX_IMAGES),
    );
  };

  // The header drags the sheet down; a flick is enough, no distance needed.
  const dismiss = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((e) => {
          'worklet';
          drag.set(e.translationY > 0 ? e.translationY : e.translationY * 0.15);
        })
        .onEnd((e) => {
          'worklet';
          if (e.translationY > 120 || e.velocityY > 900) scheduleOnRN(onClose);
          else drag.set(withSpring(0, SETTLE));
        }),
    [drag, onClose],
  );

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));
  const sheetStyle = useAnimatedStyle(() =>
    reduced
      ? { opacity: progress.get(), transform: [{ translateY: Math.max(0, drag.get()) }] }
      : { transform: [{ translateY: (1 - progress.get()) * sheetH + drag.get() }] },
  );

  if (!mounted) return null;

  const empty = messages !== null && messages.length === 0 && outbox.length === 0;
  const canSend = draft.trim().length > 0 || attachments.length > 0;

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => (viewing ? setViewing(null) : onClose())}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close feedback" />
        </Animated.View>
        <View style={[styles.dock, { paddingTop: top }]} pointerEvents="box-none">
          <Animated.View style={[styles.sheet, keyboardStyle, sheetStyle]}>
            <GestureDetector gesture={dismiss}>
              <View style={styles.head}>
                <View style={styles.grabber} />
                <View style={styles.headRow}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.title}>Feedback</Text>
                    <Text style={styles.subtitle}>Bugs, ideas, anything. We read every message.</Text>
                  </View>
                  <Pressable
                    onPress={onClose}
                    hitSlop={8}
                    accessibilityLabel="Close"
                    style={({ pressed }) => [styles.close, { transform: [{ scale: pressed ? press.scale : 1 }] }]}>
                    <Ionicons name="close" size={20} color={colors.ink} />
                  </Pressable>
                </View>
              </View>
            </GestureDetector>

            <ScrollView
              ref={scroll}
              style={{ flex: 1 }}
              contentContainerStyle={[styles.thread, empty && { flex: 1, justifyContent: 'center' }]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: messages !== null })}>
              {messages === null ? null : empty ? (
                <View style={styles.empty}>
                  <Image source={POSE.wave} style={styles.emptyArt} contentFit="contain" />
                  <Text style={styles.emptyTitle}>Something off? Tell us.</Text>
                  <Text style={styles.emptyText}>
                    {screenshot
                      ? 'A screenshot of the screen you were on is already attached. Say what happened, and we’ll reply right here.'
                      : 'Say what happened or what you’d change, and we’ll reply right here.'}
                  </Text>
                </View>
              ) : (
                <>
                  {messages.map((m, i) => (
                    <Message
                      key={m.id}
                      mine={!m.from_staff}
                      body={m.body}
                      images={m.images.map((p) => urls.get(p) ?? null)}
                      firstOfRun={i === 0 || messages[i - 1].from_staff !== m.from_staff}
                      footer={i === messages.length - 1 || messages[i + 1].from_staff !== m.from_staff ? when(m.created_at) : null}
                      onImage={setViewing}
                    />
                  ))}
                  {outbox.map((o) => (
                    <Message
                      key={o.key}
                      mine
                      body={o.body}
                      images={o.attachments.map((a) => a.uri)}
                      firstOfRun={false}
                      footer={o.state === 'sending' ? 'Sending…' : null}
                      failed={o.state === 'failed' ? { error: o.error, retry: () => send(o) } : undefined}
                      onImage={setViewing}
                    />
                  ))}
                </>
              )}
            </ScrollView>

            <Animated.View style={[styles.composer, composerStyle]}>
              {attachments.length ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.attachments}>
                  {attachments.map((a, i) => (
                    <View key={a.uri}>
                      <Pressable onPress={() => setViewing(a.uri)} accessibilityLabel="See attachment">
                        <Image source={{ uri: a.uri }} style={styles.thumb} contentFit="cover" />
                      </Pressable>
                      <Pressable
                        onPress={() => setAttachments((list) => list.filter((_, j) => j !== i))}
                        hitSlop={10}
                        accessibilityLabel="Remove attachment"
                        style={styles.unattach}>
                        <Ionicons name="close" size={12} color={colors.onPrimary} />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              ) : null}
              <View style={styles.inputRow}>
                <Pressable
                  onPress={addPhotos}
                  disabled={attachments.length >= MAX_IMAGES}
                  hitSlop={6}
                  accessibilityLabel="Attach a photo"
                  style={({ pressed }) => [
                    styles.iconButton,
                    attachments.length >= MAX_IMAGES && { opacity: 0.4 },
                    { transform: [{ scale: pressed ? press.scale : 1 }] },
                  ]}>
                  <Ionicons name="image-outline" size={22} color={colors.ink} />
                </Pressable>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="What happened?"
                  placeholderTextColor={colors.faint}
                  multiline
                  maxLength={4000}
                  style={styles.input}
                />
                <Pressable
                  onPress={submit}
                  disabled={!canSend}
                  accessibilityLabel="Send"
                  style={({ pressed }) => [
                    styles.send,
                    !canSend && styles.sendOff,
                    { transform: [{ scale: pressed && canSend ? press.scale : 1 }] },
                  ]}>
                  <Ionicons name="arrow-up" size={20} color={canSend ? colors.onPrimary : colors.faint} />
                </Pressable>
              </View>
            </Animated.View>
          </Animated.View>
        </View>

        {viewing ? <Lightbox uri={viewing} onClose={() => setViewing(null)} /> : null}
      </GestureHandlerRootView>
    </Modal>
  );
}

function Message({
  mine,
  body,
  images,
  firstOfRun,
  footer,
  failed,
  onImage,
}: {
  mine: boolean;
  body: string;
  /** A URL per image; null while it is still being signed. */
  images: (string | null)[];
  firstOfRun: boolean;
  footer: string | null;
  failed?: { error?: string; retry: () => void };
  onImage: (uri: string) => void;
}) {
  return (
    <View style={[styles.message, mine ? styles.mine : styles.theirs, firstOfRun && { marginTop: 10 }]}>
      {!mine && firstOfRun ? <Text style={styles.from}>Posta team</Text> : null}
      {images.length ? (
        <View style={[styles.images, mine && { justifyContent: 'flex-end' }]}>
          {images.map((uri, i) =>
            uri ? (
              <Pressable key={i} onPress={() => onImage(uri)} accessibilityLabel="Open image">
                <Image source={{ uri }} style={styles.shot} contentFit="cover" transition={150} />
              </Pressable>
            ) : (
              <View key={i} style={[styles.shot, { backgroundColor: colors.stone }]} />
            ),
          )}
        </View>
      ) : null}
      {body ? (
        <View style={[styles.textBubble, mine ? styles.textMine : styles.textTheirs]}>
          <Text selectable style={[styles.text, mine && { color: colors.onPrimary }]}>
            {body}
          </Text>
        </View>
      ) : null}
      {failed ? (
        <Pressable onPress={failed.retry} hitSlop={6}>
          <Text style={[styles.meta, { color: colors.dangerInk }]}>
            Didn’t send{failed.error ? ` (${failed.error})` : ''}. Tap to try again.
          </Text>
        </Pressable>
      ) : footer ? (
        <Text style={styles.meta}>{footer}</Text>
      ) : null}
    </View>
  );
}

function Lightbox({ uri, onClose }: { uri: string; onClose: () => void }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withTiming(1, { duration: 180, easing: EASE_OUT }));
  }, [t]);
  const style = useAnimatedStyle(() => ({ opacity: t.get(), transform: [{ scale: 0.96 + 0.04 * t.get() }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.lightbox]}>
      <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close image">
        <Animated.View style={[{ flex: 1 }, style]}>
          <Image source={{ uri }} style={{ flex: 1 }} contentFit="contain" />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/** "14:05" today, "Mon 14:05" this week, "Oct 3" before. */
function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === now.toDateString()) return time;
  if (now.getTime() - d.getTime() < 6 * 86_400_000) return `${d.toLocaleDateString([], { weekday: 'short' })} ${time}`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1000,
    width: SIZE,
    height: SIZE,
  },
  bubbleFace: {
    flex: 1,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastel.butter,
    boxShadow: clay.float,
  },
  dot: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    boxShadow: clay.chip,
  },
  dotText: { ...font.body[800], fontSize: 12, lineHeight: 14, color: colors.onPrimary },

  scrim: { backgroundColor: 'rgba(58, 42, 32, 0.38)' },
  dock: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '100%',
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    boxShadow: clay.float,
    overflow: 'hidden',
  },
  head: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12, gap: 10 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { ...font.display[900], fontSize: 24, letterSpacing: -0.3, color: colors.ink },
  subtitle: { ...font.body[600], fontSize: 14, color: colors.muted },
  close: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    boxShadow: clay.chip,
  },

  thread: { paddingHorizontal: 16, paddingBottom: 12, gap: 4 },
  empty: { alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingBottom: 24 },
  emptyArt: { width: 120, height: 120 },
  emptyTitle: { ...font.display[900], fontSize: 20, color: colors.ink, textAlign: 'center' },
  emptyText: { ...font.body[600], fontSize: 15, lineHeight: 21, color: colors.muted, textAlign: 'center' },

  message: { maxWidth: '82%', gap: 4 },
  mine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  from: { ...font.body[800], fontSize: 12, color: colors.muted, marginLeft: 4 },
  images: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  shot: { width: 96, height: 208, borderRadius: radius.sm, boxShadow: clay.flat },
  textBubble: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18 },
  textMine: { backgroundColor: colors.primary, borderBottomRightRadius: 6 },
  textTheirs: { backgroundColor: pastel.butter, borderBottomLeftRadius: 6 },
  text: { ...font.body[600], fontSize: 15, lineHeight: 21, color: colors.ink },
  meta: { ...font.body[600], fontSize: 11, color: colors.muted, marginHorizontal: 4 },

  composer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  attachments: { gap: 10, paddingHorizontal: 4, paddingTop: 6 },
  thumb: { width: 48, height: 84, borderRadius: 10, boxShadow: clay.flat },
  unattach: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    boxShadow: clay.flat,
    ...font.body[600],
    fontSize: 15,
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

  lightbox: { backgroundColor: 'rgba(30, 22, 16, 0.92)', paddingVertical: 48, paddingHorizontal: 12 },
});
