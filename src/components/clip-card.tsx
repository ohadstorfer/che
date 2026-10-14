import { useVideoPlayer, type VideoSource, VideoView } from 'expo-video';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { clay, colors } from '@/lib/theme';

// ---------------------------------------------------------------------------
// ClipCard — one of the onboarding motion clips (che/social/src/onboarding),
// muted, in a sticker frame. It plays once and tells the screen, which only
// then shows its button; after that it keeps looping. Reduced motion, a clip
// that fails to load, or one that never ends all count as "ended", so the
// button can never stay hidden.
// ---------------------------------------------------------------------------

/** A call on a player that may already be released (its screen closed). */
const safely = (fn: () => void) => {
  try {
    fn();
  } catch {
    // released: nothing left to play or pause
  }
};

/** Longest a clip may hold the button back, in ms. */
const HOLD_MAX = 13000;

export function ClipCard({
  source,
  label,
  reduced,
  onEnded,
  onError,
}: {
  source: VideoSource;
  label: string;
  reduced: boolean;
  onEnded: () => void;
  onError?: () => void;
}) {
  const ended = useRef(onEnded);
  ended.current = onEnded;
  const failed = useRef(onError);
  failed.current = onError;

  const player = useVideoPlayer(source, (p) => {
    p.muted = true;
    p.loop = false;
    if (!reduced) p.play();
  });

  useEffect(() => {
    if (reduced) {
      ended.current();
      return;
    }
    const end = player.addListener('playToEnd', () => {
      ended.current();
      safely(() => {
        player.currentTime = 0;
        player.loop = true;
        player.play();
      });
    });
    const status = player.addListener('statusChange', ({ status: s }) => {
      if (s === 'error') {
        ended.current();
        failed.current?.();
      }
    });
    const t = setTimeout(() => ended.current(), HOLD_MAX);
    return () => {
      end.remove();
      status.remove();
      clearTimeout(t);
    };
  }, [player, reduced]);

  // Off screen it stops: a clip decoding under the next screen slows it down.
  // When the screen is closing, the player is released before this runs, and
  // touching a released player throws; it has stopped by then anyway.
  useFocusEffect(
    useCallback(() => {
      if (!reduced) safely(() => player.play());
      return () => safely(() => player.pause());
    }, [player, reduced]),
  );

  return (
    // The sticker shadow sits on the outer frame, the clipping on the inner one:
    // on iOS a shadow on a view that clips is clipped with it.
    <View style={styles.frame} accessible accessibilityRole="image" accessibilityLabel={label}>
      <View style={styles.clip}>
        <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} allowsPictureInPicture={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    maxWidth: 342,
    aspectRatio: 342 / 428,
    alignSelf: 'center',
    borderRadius: 34,
    backgroundColor: colors.bg,
    boxShadow: clay.surface,
  },
  clip: { flex: 1, borderRadius: 34, overflow: 'hidden' },
});
