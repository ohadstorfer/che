import { useEffect, useState } from 'react';

import { CheerScreen } from '@/components/lesson-cheer';
import { shouldOfferWidget, WidgetPromo } from '@/components/widget-promo';
import { dealStreak, type StreakDesign } from '@/lib/streak-deck';

// ---------------------------------------------------------------------------
// The reward for keeping the streak alive, at the end of a round. It is one of
// the cheer screens (lesson-cheer.tsx) in streak mode: an ordinary day deals
// one off a deck of thirty without repeats, a milestone day (3, 7, 30, 100,
// 365, 1000 …) always gets its own big one (lib/streak-deck.ts). It stays
// until "Let's go!". Now and then the home screen widget promo follows it
// (widget-promo.tsx); a given design (onboarding, the admin gallery) never.
// ---------------------------------------------------------------------------

export function StreakCelebration({
  streak,
  onDone,
  design,
  cta,
}: {
  /** The count before this round. Callers pass it; the screen shows only today's. */
  previous?: number;
  streak: number;
  onDone: () => void;
  /** A given screen instead of the deal, for the admin gallery. */
  design?: StreakDesign;
  /** The button, when not "Let’s go!" (onboarding's day 1 says Continue). */
  cta?: string;
}) {
  // Dealt once: a re-render must not swap the screen under her.
  const [dealt] = useState(() => design ?? dealStreak(streak));
  // Decided while the cheer plays, so "Let's go!" never waits on it.
  const [offer, setOffer] = useState(false);
  const [promo, setPromo] = useState(false);
  useEffect(() => {
    if (design) return;
    let live = true;
    void shouldOfferWidget(streak).then((yes) => live && setOffer(yes));
    return () => {
      live = false;
    };
  }, [design, streak]);

  if (promo) return <WidgetPromo streak={streak} source="streak" onDone={onDone} />;
  return (
    <CheerScreen
      design={dealt}
      count={streak}
      onDone={() => (offer ? setPromo(true) : onDone())}
      streak
      milestone={!!dealt.milestone}
      cta={cta}
    />
  );
}
