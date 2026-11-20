import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { AdminScreen, Muted, RowLink, Section, adminStyles } from '@/components/admin';
import { RemoteScreen } from '@/components/remote-screen';
import { type ScreenRow, SLOTS, fetchAllScreens, validScreen } from '@/lib/remote-config';

// ---------------------------------------------------------------------------
// Staff preview of the custom onboarding screens (onboarding_screens), drafts
// included: each row with where it shows, to whom, and anything wrong with it
// (a broken row is never shown in onboarding). Tap one to see it full screen.
// posta://admin/screens?id=black-friday opens that one straight away.
// ---------------------------------------------------------------------------

type Row = ScreenRow & { published: boolean };

export default function ScreensAdmin() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <Preview key={id ?? ''} openId={id} />;
}

function Preview({ openId }: { openId?: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(openId ?? null);
  useEffect(() => {
    fetchAllScreens()
      .then(setRows)
      .catch((e) => setError(String(e?.message ?? e)));
  }, []);

  const showing = open ? rows?.find((r) => r.id === open) : null;
  if (showing && !validScreen(showing)) {
    return (
      <RemoteScreen
        content={showing.content}
        onNext={() => (openId ? router.back() : setOpen(null))}
        onPaywall={() => Alert.alert('Paywall', 'In onboarding this button goes straight to the paywall.', [{ text: 'OK', onPress: () => setOpen(null) }])}
      />
    );
  }

  const when = (r: Row) =>
    [r.starts_at ? `from ${r.starts_at.slice(0, 10)}` : null, r.ends_at ? `until ${r.ends_at.slice(0, 10)}` : null].filter(Boolean).join(' ');
  const who = (r: Row) => {
    const a = r.audience ?? {};
    return [
      a.levels?.length ? `levels ${a.levels.join('/')}` : null,
      a.whys?.length ? `why ${a.whys.join('/')}` : null,
      a.experiment ? `test ${a.experiment}:${a.variant}` : null,
    ]
      .filter(Boolean)
      .join(' · ');
  };

  return (
    <AdminScreen title="Onboarding screens" subtitle={rows ? `${rows.length} rows · ${rows.filter((r) => r.published).length} published` : 'Loading…'}>
      {error ? <Muted>Could not read onboarding_screens: {error}</Muted> : null}
      {SLOTS.map((slot) => (
        <Section key={slot} title={slot.replace('_', ' ')}>
          {(rows ?? [])
            .filter((r) => r.slot === slot)
            .map((r) => {
              const bad = validScreen(r);
              return (
                <RowLink key={r.id} onPress={bad ? undefined : () => setOpen(r.id)}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={adminStyles.cellEs}>
                      {r.id}
                      {r.published ? '' : ' (draft)'}
                    </Text>
                    <Muted>
                      {[`#${r.position}`, who(r) || 'everyone', when(r)].filter(Boolean).join(' · ')}
                      {bad ? ` · ⚠ ${bad}` : ''}
                    </Muted>
                  </View>
                </RowLink>
              );
            })}
        </Section>
      ))}
    </AdminScreen>
  );
}
