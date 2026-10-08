import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type RecordedClip, startRecording } from '@/lib/audio';
import { type Band, BANDS, type DiffPart, type DiloStatus, LEVEL_NAMES, LEVEL_NOTES, newTurnId, transcribe } from '@/lib/hablar';
import { tomasArt } from '@/lib/hablar-art';
import { checkClip, MAX_RECORD_MS, stopAll } from '@/lib/hablar-audio';
import { clay, colors, font, gradients, pastel, press, radius } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Pieces shared by the Hablar screens: Pancho's avatar, the pill buttons under
// each message, the bottom sheet, the level chip, the big mic, the rosa
// start button.
// ---------------------------------------------------------------------------

/** The dimmed page behind a sheet: warm ink, not black. */
const SCRIM = 'rgba(58, 42, 32, 0.38)';
/** The soft white disc the mic sits in on a rosa button. */
const ON_ROSA_DISC = 'rgba(255, 255, 255, 0.2)';

export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

export const webPress =
  Platform.OS === 'web'
    ? ({ transitionProperty: 'transform', transitionDuration: `${press.duration}ms`, transitionTimingFunction: EASE_OUT } as unknown as ViewStyle)
    : undefined;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}

// --- Pancho -------------------------------------------------------------------

/** Pancho is the waving capybara, cropped to head and shoulders in a manteca clay circle. */
export function PanchoAvatar({ size = 34 }: { size?: number }) {
  return (
    <View
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      accessibilityLabel="Pancho">
      <Image
        source={tomasArt}
        style={{ width: size * 0.95, height: size * 1.35, marginTop: size * 0.08 }}
        contentFit="contain"
        accessible={false}
      />
    </View>
  );
}

// --- rosa ---------------------------------------------------------------------

/** The rosa action's face: a top-to-bottom gradient filling its (rounded) parent. */
export function RosaFill({ round }: { round: number }) {
  return (
    <LinearGradient
      colors={gradients.deep}
      style={[StyleSheet.absoluteFill, { borderRadius: round }]}
      pointerEvents="none"
    />
  );
}

/** The big rosa pill with a mic disc — "Start talking" and its siblings. */
export function StartButton({
  label,
  onPress,
  icon = 'microphone',
  busy,
  disabled,
  accessibilityState,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName | null;
  busy?: boolean;
  disabled?: boolean;
  accessibilityState?: { busy?: boolean };
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      style={({ pressed }) => [
        styles.start,
        disabled && { opacity: 0.7 },
        { transform: [{ scale: pressed ? press.scale : 1 }] },
        webPress,
      ]}>
      <RosaFill round={32} />
      {busy ? (
        <View style={styles.startDisc}>
          <ActivityIndicator color={colors.onPrimary} />
        </View>
      ) : icon ? (
        <View style={styles.startDisc}>
          <MaterialCommunityIcons name={icon} size={22} color={colors.onPrimary} />
        </View>
      ) : null}
      <Text style={styles.startText}>{label}</Text>
    </Pressable>
  );
}

// --- pill buttons under a message ------------------------------------------------

export function Pill({
  icon,
  label,
  onPress,
  active,
  busy,
  badge,
  accessibilityLabel,
  tone = 'light',
}: {
  icon: IconName;
  label?: string;
  onPress: () => void;
  active?: boolean;
  busy?: boolean;
  /** `error` → orange "!", `ok` → small check, `pending` → a quiet dot while grading. */
  badge?: 'error' | 'ok' | 'pending';
  accessibilityLabel: string;
  tone?: 'light' | 'soft';
}) {
  const fg = active ? colors.onPrimary : tone === 'soft' ? colors.primaryDark : colors.ink;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.pill,
        tone === 'soft' && { backgroundColor: colors.primarySoft, boxShadow: 'none' },
        active && { backgroundColor: colors.primary, boxShadow: clay.button },
        { transform: [{ scale: pressed ? 0.94 : 1 }] },
        webPress,
      ]}>
      {busy ? <ActivityIndicator size="small" color={fg} /> : <MaterialCommunityIcons name={icon} size={17} color={fg} />}
      {label ? <Text style={[styles.pillText, { color: fg }]}>{label}</Text> : null}
      {badge ? (
        <View
          style={[
            styles.badge,
            badge === 'ok' && { backgroundColor: colors.success },
            badge === 'pending' && styles.badgePending,
          ]}>
          {badge === 'error' ? <Text style={styles.badgeText}>!</Text> : null}
          {badge === 'ok' ? <MaterialCommunityIcons name="check" size={10} color={colors.onPrimary} /> : null}
        </View>
      ) : null}
    </Pressable>
  );
}

// --- bottom sheet ---------------------------------------------------------------

/**
 * Slides up on the iOS drawer curve and leaves faster than it came (exits are
 * the system responding, entrances are the user deciding). Stays mounted
 * through its exit so the slide-down is actually seen.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(open);
  const [height, setHeight] = useState(420);
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.timing(t, {
        toValue: 1,
        duration: 320,
        easing: Easing.bezier(0.32, 0.72, 0, 1),
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      Animated.timing(t, {
        toValue: 0,
        duration: 200,
        easing: Easing.bezier(0.23, 1, 0.32, 1),
        useNativeDriver: true,
      }).start(({ finished }) => finished && setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted) return null;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: t }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Cerrar" />
      </Animated.View>
      <View style={styles.sheetDock} pointerEvents="box-none">
        <Animated.View
          onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
          style={[
            styles.sheet,
            { paddingBottom: 20 + insets.bottom },
            reduced
              ? { opacity: t }
              : { transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }] },
          ]}>
          <View style={styles.grabber} />
          {title ? <Text style={styles.sheetTitle}>{title}</Text> : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

// --- the strike-through diff ---------------------------------------------------

export function Diff({ parts, size = 19 }: { parts: DiffPart[]; size?: number }) {
  return (
    <Text style={{ ...font.body[600], fontSize: size, lineHeight: size * 1.4, color: colors.ink }}>
      {parts.map((p, i) => (
        <Text
          key={i}
          style={
            p.kind === 'removed'
              ? styles.removed
              : p.kind === 'added'
                ? styles.added
                : undefined
          }>
          {i > 0 ? ' ' : ''}
          {p.text}
        </Text>
      ))}
    </Text>
  );
}

// --- levels -------------------------------------------------------------------
// Four named steps, Beginner → Local. The A1–B2 codes stay in the data;
// learners only ever see the names.

/**
 * The level picker on the brief: easier / harder around the level's name, a
 * dot per level, and one line on how Pancho talks there. `available` skips
 * levels a scenario isn't written at.
 */
export function LevelChip({
  value,
  onChange,
  available = BANDS,
}: {
  value: Band;
  onChange: (v: Band) => void;
  available?: Band[];
}) {
  const at = BANDS.indexOf(value);
  const easier = BANDS.slice(0, at).reverse().find((b) => available.includes(b));
  const harder = BANDS.slice(at + 1).find((b) => available.includes(b));
  return (
    <View style={styles.stepper}>
      <View style={styles.stepperRow}>
        <StepArrow dir="back" target={easier} onChange={onChange} />
        <View
          style={styles.stepperMid}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={`Level: ${LEVEL_NAMES[value]}`}
          accessibilityValue={{ text: LEVEL_NOTES[value] }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => {
            const to = e.nativeEvent.actionName === 'increment' ? harder : easier;
            if (to) onChange(to);
          }}>
          <Text style={styles.stepperName}>{LEVEL_NAMES[value]}</Text>
          <View style={styles.levelDots}>
            {BANDS.map((b, i) => (
              <View
                key={b}
                style={[styles.levelDot, i < at && styles.dotPast, i === at && styles.dotOn, !available.includes(b) && { opacity: 0.35 }]}
              />
            ))}
          </View>
        </View>
        <StepArrow dir="forward" target={harder} onChange={onChange} />
      </View>
      <Text style={styles.stepperNote}>{LEVEL_NOTES[value]}</Text>
    </View>
  );
}

/**
 * The level picker as tabs: all four levels in view, one tap to pick, and one
 * line under them on how Pancho talks there. Levels a scenario isn't written
 * at stay in the row but can't be picked.
 */
export function LevelTabs({
  value,
  onChange,
  available = BANDS,
}: {
  value: Band;
  onChange: (v: Band) => void;
  available?: Band[];
}) {
  return (
    <View style={styles.tabsWrap}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {BANDS.map((b) => {
          const on = b === value;
          const open = available.includes(b);
          return (
            <Pressable
              key={b}
              onPress={() => open && onChange(b)}
              disabled={!open}
              accessibilityRole="tab"
              accessibilityState={{ selected: on, disabled: !open }}
              style={({ pressed }) => [
                styles.tab,
                on && styles.tabOn,
                { transform: [{ scale: pressed ? press.scale : 1 }] },
                webPress,
              ]}>
              <Text
                style={[styles.tabText, on && styles.tabTextOn, !open && { opacity: 0.35 }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}>
                {LEVEL_NAMES[b]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.tabsNote}>{LEVEL_NOTES[value]}</Text>
    </View>
  );
}

function StepArrow({
  dir,
  target,
  onChange,
}: {
  dir: 'back' | 'forward';
  target: Band | undefined;
  onChange: (v: Band) => void;
}) {
  return (
    <Pressable
      onPress={() => target && onChange(target)}
      disabled={!target}
      accessibilityRole="button"
      accessibilityLabel={dir === 'back' ? 'Easier' : 'Harder'}
      accessibilityState={{ disabled: !target }}
      style={({ pressed }) => [
        styles.stepArrow,
        !target && styles.stepArrowOff,
        { transform: [{ scale: pressed ? press.scale : 1 }] },
        webPress,
      ]}>
      <Ionicons name={dir === 'back' ? 'chevron-back' : 'chevron-forward'} size={22} color={target ? colors.ink : colors.faint} />
    </Pressable>
  );
}

// --- mic ------------------------------------------------------------------------

export function MicButton({
  recording,
  busy,
  disabled,
  onPress,
  size = 76,
}: {
  recording: boolean;
  busy?: boolean;
  disabled?: boolean;
  onPress: () => void;
  size?: number;
}) {
  const reduced = useReducedMotion();
  const ring = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!recording || reduced) {
      ring.stopAnimation();
      ring.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(ring, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [recording, reduced, ring]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {recording ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
              transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) }],
            },
          ]}
        />
      ) : null}
      <Pressable
        onPress={onPress}
        disabled={disabled || busy}
        accessibilityRole="button"
        accessibilityLabel={recording ? 'Enviar' : 'Grabar'}
        style={({ pressed }) => [
          styles.mic,
          { width: size, height: size, borderRadius: size / 2 },
          recording && { backgroundColor: colors.accent },
          (disabled || busy) && { opacity: 0.45 },
          { transform: [{ scale: pressed ? 0.94 : 1 }] },
          webPress,
        ]}>
        {recording ? null : <RosaFill round={size / 2} />}
        {busy ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : recording ? (
          <MaterialCommunityIcons name="arrow-up" size={size * 0.4} color={colors.onPrimary} />
        ) : (
          <MaterialCommunityIcons name="microphone" size={size * 0.42} color={colors.onPrimary} />
        )}
      </Pressable>
    </View>
  );
}

// --- Decilo: say the better version again ------------------------------------------

const DILO_TEXT: Record<DiloStatus, string> = {
  ok: '¡Bien dicho!',
  almost: 'Casi. Probá otra vez.',
  again: 'Otra vez: escuchá bien la frase.',
};

/**
 * Tap to record, tap to stop; the server compares what it heard with
 * `target` (no Claude call) and answers ok / almost / again. Never blocks the
 * chat — it's practice on the side.
 */
export function DiloButton({ sessionId, target }: { sessionId: string; target: string }) {
  const [state, setState] = useState<'idle' | 'recording' | 'checking'>('idle');
  const [result, setResult] = useState<DiloStatus | 'unheard' | 'error' | null>(null);
  const rec = useRef<{ stop: () => Promise<RecordedClip>; cancel: () => void; at: number; timer?: ReturnType<typeof setTimeout> } | null>(null);

  useEffect(() => () => rec.current?.cancel(), []);

  const stop = async () => {
    const r = rec.current;
    if (!r) return;
    rec.current = null;
    clearTimeout(r.timer);
    setState('checking');
    try {
      const clip = await r.stop();
      if ((await checkClip(clip, Date.now() - r.at)) !== 'ok') {
        setResult('unheard');
        return setState('idle');
      }
      const res = await transcribe({ clip, session_id: sessionId, turn_id: newTurnId(), purpose: 'dilo', target });
      const st = res.status;
      setResult(!res.text ? 'unheard' : st === 'ok' || st === 'almost' ? st : 'again');
    } catch {
      setResult('error');
    }
    setState('idle');
  };

  const toggle = async () => {
    if (state === 'recording') return stop();
    stopAll();
    setResult(null);
    try {
      const r = await startRecording();
      rec.current = { ...r, at: Date.now(), timer: setTimeout(() => void stop(), MAX_RECORD_MS) };
      setState('recording');
    } catch {
      setResult('error');
    }
  };

  const tone =
    result === 'ok' ? colors.success : result === 'almost' ? colors.accent : result ? colors.dangerInk : colors.muted;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Pressable
        onPress={toggle}
        disabled={state === 'checking'}
        accessibilityRole="button"
        accessibilityLabel={state === 'recording' ? 'Parar' : 'Decilo'}
        style={({ pressed }) => [
          styles.dilo,
          state === 'recording' && { backgroundColor: colors.accent },
          { transform: [{ scale: pressed ? press.scale : 1 }] },
          webPress,
        ]}>
        {state === 'recording' ? null : <RosaFill round={22} />}
        {state === 'checking' ? (
          <ActivityIndicator size="small" color={colors.onPrimary} />
        ) : (
          <MaterialCommunityIcons name={state === 'recording' ? 'stop' : 'microphone'} size={18} color={colors.onPrimary} />
        )}
        <Text style={styles.diloText}>{state === 'recording' ? 'Parar' : 'Decilo'}</Text>
      </Pressable>
      {result ? (
        <Text style={[styles.diloResult, { color: tone }]}>
          {result === 'unheard' ? 'No te escuché.' : result === 'error' ? 'No funcionó. Probá de nuevo.' : DILO_TEXT[result]}
        </Text>
      ) : null}
    </View>
  );
}

// --- "Pancho está pensando…" ------------------------------------------------------

export function ThinkingDots() {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(t, { toValue: 3, duration: 1200, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [t]);
  return (
    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity: t.interpolate({
                inputRange: [0, i, i + 0.5, i + 1, 3],
                outputRange: [0.3, 0.3, 1, 0.3, 0.3],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { backgroundColor: pastel.butter, alignItems: 'center', overflow: 'hidden', boxShadow: clay.surface },

  start: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    boxShadow: clay.button,
  },
  startDisc: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ON_ROSA_DISC,
    boxShadow: 'none',
  },
  startText: { ...font.body[800], fontSize: 18, color: colors.onPrimary },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  pillText: { ...font.body[700], fontSize: 13 },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.bg,
  },
  badgePending: { backgroundColor: colors.border, minWidth: 10, height: 10, top: -3, right: -3 },
  badgeText: { ...font.body[800], color: colors.onPrimary, fontSize: 10, lineHeight: 12 },

  backdrop: { backgroundColor: SCRIM },
  sheetDock: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 14,
    boxShadow: clay.float,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.trough, marginBottom: 4 },
  sheetTitle: { ...font.body[800], fontSize: 13, color: colors.muted },

  removed: { textDecorationLine: 'line-through', color: colors.dangerInk, backgroundColor: colors.dangerSoft },
  added: { ...font.body[800], color: colors.success, backgroundColor: colors.successSoft },

  // The level tabs: a sunken well with the picked level raised out of it.
  tabsWrap: { gap: 10 },
  tabs: { flexDirection: 'row', padding: 4, borderRadius: radius.pill, backgroundColor: colors.trough, boxShadow: clay.trough },
  tab: { flex: 1, height: 42, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabOn: { backgroundColor: colors.card, boxShadow: clay.surface },
  tabText: { ...font.body[800], fontSize: 13, color: colors.muted },
  tabTextOn: { color: colors.ink },
  tabsNote: { ...font.body[600], fontSize: 15, lineHeight: 21, color: colors.muted },

  // The level stepper: round clay arrows either side of the name.
  stepper: { gap: 10 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepperMid: { flex: 1, alignItems: 'center', gap: 7 },
  stepperName: { ...font.display[800], fontSize: 24, lineHeight: 28, letterSpacing: -0.3, color: colors.ink },
  stepperNote: { ...font.body[600], fontSize: 14, lineHeight: 19, color: colors.muted, textAlign: 'center' },
  stepArrow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    boxShadow: clay.surface,
  },
  stepArrowOff: { backgroundColor: 'transparent', boxShadow: clay.flat },
  levelDots: { flexDirection: 'row', gap: 5 },
  levelDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.trough },
  /** Levels below hers: rosa, faded — the way she came. */
  dotPast: { backgroundColor: 'rgba(180, 74, 96, 0.4)' },
  dotOn: { width: 22, backgroundColor: colors.primary },

  ring: { position: 'absolute', backgroundColor: colors.accent },
  mic: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', boxShadow: clay.button },

  dilo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    boxShadow: clay.button,
  },
  diloText: { ...font.body[800], fontSize: 15, color: colors.onPrimary },
  diloResult: { ...font.body[700], flex: 1, fontSize: 14 },

  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.muted },
});
