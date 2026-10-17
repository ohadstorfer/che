import { useVideoPlayer, type VideoSource, VideoView } from 'expo-video';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
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

  // Sized to the space it is given, both ways: on a short screen (a OnePlus at
  // 435×725) a full-width card is taller than its slot and covers the title.
  const [space, setSpace] = useState<{ width: number; height: number } | null>(null);
  const width = space ? Math.min(space.width, MAX_WIDTH, space.height * RATIO) : undefined;

  return (
    <View style={styles.space} onLayout={(e) => setSpace(e.nativeEvent.layout)}>
      {/* The sticker shadow sits on the outer frame, the clipping on the inner
          one: on iOS a shadow on a view that clips is clipped with it. */}
      <View style={[styles.frame, width != null && { width }]} accessible accessibilityRole="image" accessibilityLabel={label}>
        <View style={styles.clip}>
          {/* A TextureView, not Android's default SurfaceView: it keeps to the
              rounded corners, and the feedback screenshot can see it (a
              SurfaceView comes out as a black box). */}
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
            allowsPictureInPicture={false}
            surfaceType="textureView"
          />
        </View>
      </View>
    </View>
  );
}

const MAX_WIDTH = 342;
const RATIO = 342 / 428;

const styles = StyleSheet.create({
  space: { flex: 1, justifyContent: 'center' },
  frame: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    aspectRatio: RATIO,
    alignSelf: 'center',
    borderRadius: 34,
    backgroundColor: colors.bg,
    boxShadow: clay.surface,
  },
  clip: { flex: 1, borderRadius: 34, overflow: 'hidden' },
});
