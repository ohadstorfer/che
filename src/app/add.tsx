import { Ionicons } from '@expo/vector-icons';
import { randomUUID } from 'expo-crypto';
import { Redirect } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Field, Panel, ScreenTitle } from '@/components/ui';
import { type ActiveRecording, canRecord, startRecording, uploadAudio } from '@/lib/audio';
import { useAuth } from '@/lib/auth';
import { goBack } from '@/lib/nav';
import { notifyEvent } from '@/lib/push';
import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/lib/theme';
import { useStatusBarColor } from '@/lib/status-bar-color';

/** What's being added. A "frase" is stored as an ordinary card — the practice
 *  session recognises it by the spaces in its transliteration and drills it
 *  with the sentence exercises. */
type Kind = 'word' | 'sentence';

const COPY: Record<Kind, { hebrew: string; translit: string; spanish: string; english: string }> = {
  word: {
    hebrew: 'שלום',
    translit: 'shalom',
    spanish: 'hola / paz',
    english: 'hello / peace',
  },
  sentence: {
    hebrew: 'אני אוהב אותך',
    translit: 'ani ohev otaj',
    spanish: 'te quiero',
    english: 'I love you',
  },
};

export default function Add() {
  // The gradient is inverted — pale at the top edge — so the strip above
  // matches `bg` here like everywhere else (iOS 26 freezes one strip colour
  // per session; every screen having a pale top is what makes it fit).
  useStatusBarColor(colors.bg);
  // Moving off the tab layout also moved this screen out from behind its auth
  // guard, so it carries its own.
  const { profile, session, loading } = useAuth();
  const [kind, setKind] = useState<Kind>('word');
  const [hebrew, setHebrew] = useState('');
  const [translit, setTranslit] = useState('');
  const [spanish, setSpanish] = useState('');
  const [english, setEnglish] = useState('');
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<{ blob: Blob; mime: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeRec = useRef<ActiveRecording | null>(null);

  const toggleRecording = async () => {
    if (recording) {
      const rec = activeRec.current;
      activeRec.current = null;
      setRecording(false);
      if (rec) setAudioBlob(await rec.stop());
    } else {
      try {
        activeRec.current = await startRecording();
        setAudioBlob(null);
        setRecording(true);
      } catch {
        setError('No se pudo acceder al micrófono.');
      }
    }
  };

  const playPreview = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob.blob);
    const audio = new window.Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    audio.play().catch(() => {});
  };

  const save = async () => {
    if (!profile) return;
    setBusy(true);
    setError(null);
    try {
      // `cards.id` is a Postgres uuid column, so this has to be a real UUID.
      // There is no `crypto` global on native, and the old fallback quietly
      // produced a non-UUID string that the insert rejected.
      const id = randomUUID();
      let audio_path: string | null = null;
      if (audioBlob) audio_path = await uploadAudio(id, audioBlob.blob, audioBlob.mime);

      const { error: err } = await supabase.from('cards').insert({
        id,
        hebrew: hebrew.trim(),
        translit: translit.trim(),
        spanish: spanish.trim(),
        english: english.trim() || null,
        audio_path,
        created_by: profile.id,
      });
      if (err) throw err;

      notifyEvent('new_words', { count: 1 });
      setSavedMsg(`«${translit.trim()}» guardada ✓`);
      setHebrew('');
      setTranslit('');
      setSpanish('');
      setEnglish('');
      setAudioBlob(null);
      setTimeout(() => setSavedMsg(null), 3000);
    } catch (err) {
      // Without this the real reason never leaves the device — a bad insert
      // and a dead network look identical from the message alone.
      console.warn('[add] save failed', err);
      setError('No se pudo guardar. Revisá la conexión e intentá de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  // The app tells words and sentences apart by the spaces in the
  // transliteration, so a one-word "frase" would quietly be drilled as a word.
  const looksLikeSentence = translit.trim().includes(' ');
  const mismatch =
    kind === 'sentence' && translit.trim() && !looksLikeSentence
      ? 'Una frase necesita al menos dos palabras en la pronunciación.'
      : kind === 'word' && looksLikeSentence
        ? 'Tiene espacios, así que se va a practicar como frase.'
        : null;

  const valid =
    hebrew.trim() && translit.trim() && spanish.trim() && !(kind === 'sentence' && !looksLikeSentence);

  if (!loading && !session) return <Redirect href="/login" />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={() => goBack('/words')} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
            <ScreenTitle>Agregar</ScreenTitle>
            {/* Balances the back arrow so the title stays optically centred. */}
            <View style={{ width: 24 }} />
          </View>

          {/* Words and sentences are the same kind of card, but they're
              practised differently, so the choice is made up front. */}
          <View style={styles.segment}>
            {(['word', 'sentence'] as const).map((k) => (
              <Pressable
                key={k}
                onPress={() => setKind(k)}
                style={({ pressed }) => [
                  styles.segmentItem,
                  kind === k && styles.segmentItemActive,
                  { transform: [{ scale: pressed ? 0.98 : 1 }] },
                ]}>
                <Text style={[styles.segmentText, kind === k && styles.segmentTextActive]}>
                  {k === 'word' ? 'Palabra' : 'Frase'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Panel style={{ gap: 16 }}>
            <Field
              label="Hebreo · עברית"
              value={hebrew}
              onChangeText={setHebrew}
              placeholder={COPY[kind].hebrew}
              multiline={kind === 'sentence'}
              style={{ textAlign: 'right', fontSize: 22 }}
            />
            <Field
              label="Pronunciación (translit)"
              value={translit}
              onChangeText={setTranslit}
              placeholder={COPY[kind].translit}
              autoCapitalize="none"
              multiline={kind === 'sentence'}
              hint={
                kind === 'sentence'
                  ? 'Las fichas de los ejercicios salen de estas palabras.'
                  : undefined
              }
            />
            <Field
              label="Español"
              value={spanish}
              onChangeText={setSpanish}
              placeholder={COPY[kind].spanish}
              multiline={kind === 'sentence'}
            />
            <Field
              label="Inglés (opcional)"
              value={english}
              onChangeText={setEnglish}
              placeholder={COPY[kind].english}
            />

            {/* Audio */}
            {canRecord ? (
              <View style={{ gap: 8 }}>
                <Text style={styles.audioLabel}>Audio (opcional)</Text>
                <View style={styles.audioRow}>
                  <Pressable
                    onPress={toggleRecording}
                    style={({ pressed }) => [
                      styles.recordButton,
                      recording && styles.recordingActive,
                      { transform: [{ scale: pressed ? 0.95 : 1 }] },
                    ]}>
                    <Ionicons
                      name={recording ? 'stop' : 'mic'}
                      size={22}
                      color={recording ? colors.onPrimary : colors.danger}
                    />
                    <Text style={[styles.recordText, recording && { color: colors.onPrimary }]}>
                      {recording ? 'Grabando… tocá para parar' : 'Grabar pronunciación'}
                    </Text>
                  </Pressable>
                  {audioBlob && !recording ? (
                    <Pressable
                      onPress={playPreview}
                      style={({ pressed }) => [
                        styles.playPreview,
                        { transform: [{ scale: pressed ? 0.95 : 1 }] },
                      ]}>
                      <Ionicons name="play" size={20} color={colors.primary} />
                    </Pressable>
                  ) : null}
                </View>
                {audioBlob && !recording ? (
                  <Text style={styles.audioReady}>Audio listo ✓</Text>
                ) : null}
              </View>
            ) : (
              <Text style={styles.audioHint}>
                La grabación de audio está disponible desde el navegador.
              </Text>
            )}
          </Panel>

          {mismatch ? <Text style={styles.mismatch}>{mismatch}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {savedMsg ? <Text style={styles.saved}>{savedMsg}</Text> : null}
          <Button title="Guardar" onPress={save} disabled={!valid || recording} loading={busy} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  audioLabel: { fontSize: 13, fontWeight: '600', color: colors.muted, letterSpacing: 0.2 },
  audioRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  recordButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    paddingVertical: 13,
  },
  recordingActive: { backgroundColor: colors.danger },
  recordText: { fontSize: 15, fontWeight: '600', color: colors.danger },
  playPreview: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: 13,
  },
  audioReady: { fontSize: 13, color: colors.success, fontWeight: '600' },
  audioHint: { fontSize: 13, color: colors.faint },
  segment: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center' },
  segmentItemActive: { backgroundColor: colors.card },
  segmentText: { fontSize: 15, fontWeight: '600', color: colors.muted },
  segmentTextActive: { color: colors.primaryDark },
  mismatch: { color: colors.accent, fontSize: 14, textAlign: 'center' },
  error: { color: colors.danger, fontSize: 14, textAlign: 'center' },
  saved: { color: colors.success, fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
