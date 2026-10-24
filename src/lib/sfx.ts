import { success, warn } from '@/lib/haptics';

// ---------------------------------------------------------------------------
// The two sounds of a checked answer — a bright rising pair for right, a soft
// falling pair for wrong — and the tap on the hand that goes with each. Half of
// what makes an answer feel answered is hearing it land.
//
// They play on players of their own, apart from the lesson's voice
// (audio.ts), so a word that starts right after the chime isn't cut off by it
// and the chime never cuts the word. Both are loaded once, on first use, and
// rewound on every play. Synthesized for the app (assets/audio/sfx), not
// recorded.
// ---------------------------------------------------------------------------

const SOURCES = {
  correct: require('@/assets/audio/sfx/correct.wav'),
  wrong: require('@/assets/audio/sfx/wrong.wav'),
} as const;

type Sound = keyof typeof SOURCES;

/** Under the voice: a chime is a confirmation, not the content. */
const VOLUME = 0.55;

type Player = { seekTo: (s: number) => Promise<void>; play: () => void; volume: number };
const players = new Map<Sound, Promise<Player | null>>();

function playerFor(sound: Sound): Promise<Player | null> {
  let p = players.get(sound);
  if (!p) {
    p = import('expo-audio')
      .then(({ createAudioPlayer }) => {
        // Kept active for the same reason as the voice's players: a pause must
        // not switch the session off under a recording that follows.
        const player = createAudioPlayer(SOURCES[sound], { keepAudioSessionActive: true });
        player.volume = VOLUME;
        return player as unknown as Player;
      })
      .catch(() => null);
    players.set(sound, p);
  }
  return p;
}

/** Loads both sounds, so the first answer of a class isn't the one that waits. */
export function warmSfx() {
  void playerFor('correct');
  void playerFor('wrong');
}

function play(sound: Sound) {
  void playerFor(sound).then((player) => {
    if (!player) return;
    // Rewound first: a player that has finished once stays at its end.
    void player
      .seekTo(0)
      .catch(() => {})
      .then(() => player.play());
  });
}

/** A checked answer: the chime and the tap, together. */
export function answerFeedback(correct: boolean) {
  // The web gets the chime alone: it has no motor for the tap (haptics.ts).
  if (correct) success();
  else warn();
  play(correct ? 'correct' : 'wrong');
}
