import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// ---------------------------------------------------------------------------
// LoadingVideo — the wait while a lesson is built, spent looking at something
// rather than at a spinner. One clip per mount, picked at random.
//
// The clips ship as animated WebP with a transparent background rather than as
// video: the source MP4s are painted on a flat colour, and an opaque square of
// it can only ever sit on the page as a tile. Keyed out, the illustration
// stands on the gradient itself.
//
// To add another: run `python3 scripts/cutout-clip.py <video.mp4> <name>` and
// add it here with its runtime in ms — that is how long the lesson waits for it.
// ---------------------------------------------------------------------------
const CLIPS = [{ source: require('@/assets/videos/shakshuka-loading.webp'), runtime: 6000 }];

export function LoadingVideo({
  size = 240,
  onPlayedThrough,
}: {
  size?: number;
  /** Fired once the clip has run start to finish. */
  onPlayedThrough?: () => void;
}) {
  const [clip] = useState(() => CLIPS[Math.floor(Math.random() * CLIPS.length)]);

  const spent = useRef(false);
  const done = useCallback(() => {
    if (spent.current) return;
    spent.current = true;
    onPlayedThrough?.();
  }, [onPlayedThrough]);

  useEffect(() => {
    const t = setTimeout(done, clip.runtime);
    // Nothing is held back for an animation someone asked not to see.
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce) done();
    });
    return () => clearTimeout(t);
  }, [clip, done]);

  return (
    <Image
      source={clip.source}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessible={false}
    />
  );
}
