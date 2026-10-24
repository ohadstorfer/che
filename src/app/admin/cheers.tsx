import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type Cheer, LessonCheer } from '@/components/lesson-cheer';
import { LessonComplete } from '@/components/lesson-complete';
import { PerfectLesson } from '@/components/perfect-lesson';
import { Button } from '@/components/ui';
import { CHEERS } from '@/lib/cheer-deck';
import { colors, font } from '@/lib/theme';

// ---------------------------------------------------------------------------
// Every cheer screen in the deck, one at a time, and the two end screens —
// for looking them over without playing a lesson to five in a row.
// ---------------------------------------------------------------------------

const RUNS = { run: 5, back: 5, big: 10 } as const;

export default function CheerGallery() {
  const [at, setAt] = useState(0);
  const [cheer, setCheer] = useState<Cheer | null>(null);
  const [all, setAll] = useState(false);
  const [end, setEnd] = useState<'perfect' | 'complete' | 'complete-perfect' | null>(null);
  const c = CHEERS[at];
  const play = (i: number) => {
    setAt(i);
    setCheer({ design: CHEERS[i], count: RUNS[CHEERS[i].when], id: Date.now() });
  };

  if (end === 'perfect') return <PerfectLesson onNext={() => setEnd(null)} />;
  if (end) {
    return (
      <SafeAreaView style={styles.safe}>
        <LessonComplete
          streak={4}
          stats={{ accuracy: end === 'complete-perfect' ? 100 : 86, seconds: 154, words: 12, newWords: 3 }}
          onNext={() => setEnd(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        <Text style={styles.title}>
          Cheer {at + 1} / {CHEERS.length}
        </Text>
        <Text style={styles.meta}>
          {c.when} · {c.scene} · {c.deco} · {c.layout} · {c.tint} · {c.art}
        </Text>
        <Text style={styles.meta}>{[c.title, c.line, c.words?.join(' ')].filter(Boolean).join(' — ')}</Text>
        <View style={styles.row}>
          {(['run', 'back', 'big'] as const).map((w) => (
            <Pressable key={w} style={styles.step} onPress={() => setAt(CHEERS.findIndex((x) => x.when === w))}>
              <Text style={styles.stepText}>{w}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.row}>
          <Pressable style={styles.step} onPress={() => play((at + CHEERS.length - 1) % CHEERS.length)}>
            <Text style={styles.stepText}>‹ Prev</Text>
          </Pressable>
          <Pressable style={styles.step} onPress={() => play(at)}>
            <Text style={styles.stepText}>Play</Text>
          </Pressable>
          <Pressable style={styles.step} onPress={() => play((at + 1) % CHEERS.length)}>
            <Text style={styles.stepText}>Next ›</Text>
          </Pressable>
        </View>
        <Button
          title="Play all from here"
          variant="secondary"
          onPress={() => {
            setAll(true);
            play(at);
          }}
        />
        <Button title="Perfect lesson" variant="secondary" onPress={() => setEnd('perfect')} />
        <Button title="Lesson complete" variant="secondary" onPress={() => setEnd('complete')} />
        <Button title="Lesson complete (perfect)" variant="secondary" onPress={() => setEnd('complete-perfect')} />
      </View>
      <LessonCheer
        cheer={cheer}
        onDone={() => {
          setCheer(null);
          // Playing them all: the next one a beat after this one goes.
          if (all && at + 1 < CHEERS.length) setTimeout(() => play(at + 1), 250);
          else setAll(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { flex: 1, padding: 24, gap: 12, justifyContent: 'center' },
  title: { ...font.display[900], fontSize: 28, color: colors.ink },
  meta: { ...font.body[600], fontSize: 14, color: colors.muted },
  row: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  step: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: colors.card, alignItems: 'center', borderWidth: 2, borderColor: colors.ink },
  stepText: { ...font.body[800], fontSize: 16, color: colors.ink },
});
