import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Field, Panel } from '@/components/ui';
import {
  type ActiveRecording,
  canRecord,
  playAudio,
  startRecording,
  uploadAudio,
} from '@/lib/audio';
import { goBack } from '@/lib/nav';
import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/lib/theme';
import { useStatusBarColor } from '@/lib/status-bar-color';
import type { Card } from '@/lib/types';

export default function CardDetail() {
  // The gradient is inverted — pale at the top edge — so the strip above
  // matches `bg` here like everywhere else (iOS 26 freezes one strip colour
  // per session; every screen having a pale top is what makes it fit).
  useStatusBarColor(colors.bg);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [card, setCard] = useState<Card | null>(null);
  const [hebrew, setHebrew] = useState('');
  const [translit, setTranslit] = useState('');
  const [spanish, setSpanish] = useState('');
  const [english, setEnglish] = useState('');
  const [recording, setRecording] = useState(false);
  const [newAudio, setNewAudio] = useState<{ blob: Blob; mime: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRec = useRef<ActiveRecording | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        const c = data as Card;
        setCard(c);
        setHebrew(c.hebrew);
        setTranslit(c.translit);
        setSpanish(c.spanish);
        setEnglish(c.english ?? '');
      });
  }, [id]);

  const toggleRecording = async () => {
    if (recording) {
      const rec = activeRec.current;
      activeRec.current = null;
      setRecording(false);
      if (rec) setNewAudio(await rec.stop());
    } else {
      try {
        setError(null);
        activeRec.current = await startRecording();
        setNewAudio(null);
        setRecording(true);
      } catch (err) {
        // Silently doing nothing here is what made a refused microphone look
        // like a dead button.
        setError(
          err instanceof Error && err.name === 'NotAllowedError'
            ? 'El navegador no dio permiso para el micrófono.'
            : 'No se pudo acceder al micrófono.',
        );
      }
    }
  };

  const save = async () => {
    if (!card) return;
    setBusy(true);
    try {
      let audio_path = card.audio_path;
      if (newAudio) audio_path = await uploadAudio(card.id, newAudio.blob, newAudio.mime);
      await supabase
        .from('cards')
        .update({
          hebrew: hebrew.trim(),
          translit: translit.trim(),
          spanish: spanish.trim(),
          english: english.trim() || null,
          audio_path,
        })
        .eq('id', card.id);
      goBack('/words');
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    const doDelete = async () => {
      if (!card) return;
      if (card.audio_path) await supabase.storage.from('audio').remove([card.audio_path]);
      await supabase.from('cards').delete().eq('id', card.id);
      goBack('/words');
    };
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm('¿Eliminar esta tarjeta? Se pierde también su progreso.')) doDelete();
    } else {
      Alert.alert('Eliminar', '¿Eliminar esta tarjeta? Se pierde también su progreso.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  if (!card) return <SafeAreaView style={styles.safe} />;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={() => goBack('/words')} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
            <Text style={styles.headerTitle}>Editar tarjeta</Text>
            <Pressable onPress={remove} hitSlop={12}>
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </Pressable>
          </View>

          <Panel style={{ gap: 16 }}>
            <Field
              label="Hebreo · עברית"
              value={hebrew}
              onChangeText={setHebrew}
              style={{ textAlign: 'right', fontSize: 22 }}
            />
            <Field
              label="Pronunciación (translit)"
              value={translit}
              onChangeText={setTranslit}
              autoCapitalize="none"
            />
            <Field label="Español" value={spanish} onChangeText={setSpanish} />
            <Field label="Inglés (opcional)" value={english} onChangeText={setEnglish} />

            <View style={{ gap: 8 }}>
              <Text style={styles.audioLabel}>Audio</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {card.audio_path && !newAudio ? (
                  <Pressable
                    onPress={() => playAudio(card.audio_path!)}
                    style={({ pressed }) => [
                      styles.audioButton,
                      { transform: [{ scale: pressed ? 0.95 : 1 }] },
                    ]}>
                    <Ionicons name="play" size={18} color={colors.primary} />
                    <Text style={styles.audioButtonText}>Escuchar</Text>
                  </Pressable>
                ) : null}
                {canRecord ? (
                  <Pressable
                    onPress={toggleRecording}
                    style={({ pressed }) => [
                      styles.audioButton,
                      recording && { backgroundColor: colors.danger },
                      { transform: [{ scale: pressed ? 0.95 : 1 }] },
                    ]}>
                    <Ionicons
                      name={recording ? 'stop' : 'mic'}
                      size={18}
                      color={recording ? colors.onPrimary : colors.primary}
                    />
                    <Text style={[styles.audioButtonText, recording && { color: colors.onPrimary }]}>
                      {recording ? 'Parar' : newAudio || card.audio_path ? 'Regrabar' : 'Grabar'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
              {newAudio ? <Text style={styles.audioReady}>Audio nuevo listo ✓</Text> : null}
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
          </Panel>

          <Button
            title="Guardar cambios"
            onPress={save}
            loading={busy}
            disabled={!hebrew.trim() || !translit.trim() || !spanish.trim() || recording}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.ink },
  audioLabel: { fontSize: 13, fontWeight: '600', color: colors.muted, letterSpacing: 0.2 },
  error: { color: colors.danger, fontSize: 14 },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  audioButtonText: { fontSize: 14, fontWeight: '600', color: colors.primaryDark },
  audioReady: { fontSize: 13, color: colors.success, fontWeight: '600' },
});
