import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ImageRequireSource } from 'react-native';
import { FlexWidget, ImageWidget, OverlapWidget, SvgWidget, TextWidget, type WidgetInfo } from 'react-native-android-widget';

import { widgetDay, type WidgetDay, type WidgetMoment, type WidgetRow, type WidgetWord, wordOf } from '@/lib/widget-day';

// ---------------------------------------------------------------------------
// The Android home screen widget, 2x2 and 4x2 (docs/widgets-spec.md). The same
// widget as the iPhone's (targets/widget/PostaWidget.swift), drawn with
// react-native-android-widget's primitives: no React Native views, no hooks.
//
// Measurements are the mockups', drawn 392 units tall; `u` is one of those
// units on this phone, so one layout serves whatever size the launcher gives.
// ---------------------------------------------------------------------------

export const WIDGET_ROW_KEY = 'widget-streak';
export const WIDGET_NAMES = ['PostaSmall', 'PostaMedium'] as const;

const INK = '#3A2A20';
const DISPLAY = 'Gabarito_900Black';
const BODY = 'Figtree_700Bold';
const BODY_HEAVY = 'Figtree_800ExtraBold';

const FLAME =
  'M50 4 C58 22 80 36 84 66 C88 96 70 116 50 116 C30 116 12 100 14 74 C16 56 28 48 32 34 C36 46 40 52 44 54 C42 36 44 20 50 4 Z';
const flameSvg = (fill: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -6 116 132"><path d="${FLAME}" fill="${fill}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/></svg>`;
const SNOW_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="none" stroke="#3E7FAE" stroke-width="3.4" stroke-linecap="round"><path d="M15 3v24M4.6 9l20.8 12M25.4 9L4.6 21"/></svg>';

interface Art {
  source: ImageRequireSource;
  /** Width over height. */
  ratio: number;
}

const POSES = {
  waving: { source: require('../../assets/images/capybara/widget-saludando.png'), ratio: 257 / 384 },
  sideEye: { source: require('../../assets/images/capybara/capybara-sideeye-figure.png'), ratio: 426 / 520 },
  sad: { source: require('../../assets/images/capybara/capybara-sad-figure.png'), ratio: 321 / 460 },
  begging: { source: require('../../assets/images/capybara/capybara-begging-figure.png'), ratio: 257 / 475 },
  crying: { source: require('../../assets/images/capybara/capybara-crying-figure.png'), ratio: 376 / 463 },
  collapsed: { source: require('../../assets/images/capybara/capybara-collapsed-figure.png'), ratio: 367 / 435 },
  goal: { source: require('../../assets/images/capybara/widget-futbol-gol.png'), ratio: 312 / 384 },
} satisfies Record<string, Art>;

/** Each scene twice: whole for the wide widget, its right-hand square for the small one. */
const SCENES = {
  morning: [require('../../assets/images/widget/scene-morning-small.png'), require('../../assets/images/widget/scene-morning.png')],
  afternoon: [require('../../assets/images/widget/scene-afternoon-small.png'), require('../../assets/images/widget/scene-afternoon.png')],
  sunset: [require('../../assets/images/widget/scene-sunset-small.png'), require('../../assets/images/widget/scene-sunset.png')],
  dusk: [require('../../assets/images/widget/scene-dusk-small.png'), require('../../assets/images/widget/scene-dusk.png')],
  fire: [require('../../assets/images/widget/scene-fire-small.png'), require('../../assets/images/widget/scene-fire.png')],
  night: [require('../../assets/images/widget/scene-night-small.png'), require('../../assets/images/widget/scene-night.png')],
  goal: [require('../../assets/images/widget/scene-goal-small.png'), require('../../assets/images/widget/scene-goal.png')],
  ice: [require('../../assets/images/widget/scene-ice-small.png'), require('../../assets/images/widget/scene-ice.png')],
  thaw: [require('../../assets/images/widget/scene-thaw-small.png'), require('../../assets/images/widget/scene-thaw.png')],
} satisfies Record<string, [ImageRequireSource, ImageRequireSource]>;

/** Where Pancho stands: his height, and how far in from the right and bottom edges. */
type Stand = [height: number, right: number, bottom: number];

interface Look {
  scene: keyof typeof SCENES;
  pose: keyof typeof POSES;
  small: Stand;
  medium: Stand;
  /** The nudge, short for the small widget and fuller for the wide one. */
  line?: [small: string, medium: string];
  /** A night scene: light type. */
  dark?: boolean;
}

function lookOf(day: WidgetDay): Look {
  const looks: Record<WidgetMoment, Look> = {
    word: { scene: 'morning', pose: 'waving', small: [205, 8, -26], medium: [366, 94, -40] },
    sideEye: { scene: 'afternoon', pose: 'sideEye', small: [235, 21, -20], medium: [360, 50, -10], line: ['So… nothing?', 'So… no practice today?'] },
    sad: { scene: 'sunset', pose: 'sad', small: [236, 26, -10], medium: [354, 76, -8], line: ['Still waiting.', 'Still waiting…'] },
    begging: { scene: 'dusk', pose: 'begging', small: [236, 42, -10], medium: [360, 106, -8], line: ['Please?', 'Please?\nJust 2 minutes.'] },
    crying: { scene: 'fire', pose: 'crying', small: [238, 18, -10], medium: [360, 58, -8], line: ['You’re killing me!', 'You’re killing me!'] },
    lastHour: {
      scene: 'night',
      pose: 'collapsed',
      small: [226, 34, 4],
      medium: [322, 64, 24],
      line: ['Bye, streak.', `Bye-bye,\n${day.count}-day streak.`],
      dark: true,
    },
    practiced: { scene: 'goal', pose: 'goal', small: [268, 68, -46], medium: [428, 50, -80], line: ['Goooal!', 'Goooal! See you tomorrow.'] },
    frozen: { scene: 'ice', pose: 'sad', small: [172, 58, 28], medium: [302, 110, 34], line: ['I’m frozen!', 'Your streak froze.'], dark: true },
    recovering: { scene: 'thaw', pose: 'begging', small: [236, 42, -10], medium: [360, 106, -8], line: ['One more!', 'One more saves it.'] },
    fresh: { scene: 'morning', pose: 'waving', small: [250, 34, -26], medium: [366, 94, -40], line: ['Shall we?', 'Shall we? Just 2 minutes.'] },
  };
  return looks[day.moment];
}

/** The header's streak sticker: a pill with an ink outline and a hard shadow, slapped on a little crooked. */
function Chip({ day, u }: { day: WidgetDay; u: number }) {
  const icy = day.lost != null;
  const lit = day.moment === 'practiced';
  const outline = day.moment === 'frozen' ? '#121A22' : day.moment === 'lastHour' ? '#1F1611' : INK;
  const face = day.moment === 'frozen' ? '#DFEFFA' : lit ? '#FFE08A' : '#FFF9F3';
  const showsCount = !icy || day.moment === 'recovering';
  const lost = day.lost != null ? String(day.lost) : '';
  const count = showsCount ? String(day.count) : '';

  // The shadow is a second pill underneath, so the pill's width has to be known up front.
  const digit = 17 * u;
  const width = (12 + 28 + 6 + 20) * u + (lost.length + count.length) * digit + (lost && count ? 8 * u : 0);
  const height = 58 * u;
  const pill = { width, height, borderRadius: height / 2 } as const;
  const text = { fontFamily: DISPLAY, fontSize: 28 * u, color: INK } as const;

  return (
    <OverlapWidget style={{ width: width + 6 * u, height: height + 8 * u, rotation: -3 }}>
      <FlexWidget style={{ ...pill, marginLeft: 4 * u, marginTop: 6 * u, backgroundColor: outline }} />
      <FlexWidget
        style={{
          ...pill,
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 12 * u,
          backgroundColor: face,
          borderWidth: 4 * u,
          borderColor: outline,
        }}>
        <SvgWidget svg={icy ? SNOW_SVG : flameSvg(lit ? '#FF8A5B' : '#D9CBBB')} style={{ width: 28 * u, height: 32 * u, marginRight: 6 * u }} />
        {lost ? (
          <OverlapWidget style={{ marginRight: count ? 8 * u : 0 }}>
            <TextWidget text={lost} style={{ ...text, color: day.moment === 'frozen' ? INK : '#7A6556' }} />
            <FlexWidget style={{ width: lost.length * digit, height: 36 * u, justifyContent: 'center' }}>
              <FlexWidget style={{ width: 'match_parent', height: 3 * u, backgroundColor: INK }} />
            </FlexWidget>
          </OverlapWidget>
        ) : null}
        {count ? <TextWidget text={count} style={text} /> : null}
      </FlexWidget>
    </OverlapWidget>
  );
}

function Words({ word, wide, u }: { word: WidgetWord; wide: boolean; u: number }) {
  const width = (wide ? 400 : 290) * u;
  return (
    <FlexWidget style={{ flexDirection: 'column', marginTop: 12 * u }}>
      <TextWidget
        text="WORD OF THE DAY"
        style={{ fontFamily: BODY_HEAVY, fontSize: (wide ? 19 : 17) * u, letterSpacing: 0.08, color: '#4E4038' }}
      />
      <TextWidget
        text={word.es.charAt(0).toLocaleUpperCase('es') + word.es.slice(1)}
        maxLines={1}
        style={{ width, fontFamily: DISPLAY, fontSize: (wide ? 68 : 54) * u, adjustsFontSizeToFit: true, color: INK }}
      />
      <TextWidget
        text={word.en}
        maxLines={wide ? 1 : 2}
        style={{ width: (wide ? 400 : 180) * u, fontFamily: BODY, fontSize: (wide ? 28 : 26) * u, color: '#6B5647' }}
      />
      {wide ? (
        <TextWidget
          text={`“${word.ex}”`}
          maxLines={2}
          style={{ width, marginTop: 22 * u, fontFamily: BODY, fontSize: 25 * u, color: INK }}
        />
      ) : null}
    </FlexWidget>
  );
}

export function PostaWidget({ info, day, word }: { info: WidgetInfo; day: WidgetDay; word: WidgetWord }) {
  const wide = info.widgetName === 'PostaMedium';
  const u = Math.min(info.height / 392, info.width / (wide ? 716 : 344));
  const look = lookOf(day);
  const pose = POSES[look.pose];
  const [height, right, bottom] = wide ? look.medium : look.small;
  const showsWord = day.moment === 'word';
  const block = wide ? { width: 294 * u, height: 336 * u, right: 68 * u } : { width: 180 * u, height: 196 * u, right: 28 * u };

  return (
    <OverlapWidget
      style={{ width: 'match_parent', height: 'match_parent', borderRadius: 28, overflow: 'hidden', backgroundColor: look.dark ? '#243240' : '#F7EFE6' }}
      clickAction="OPEN_URI"
      clickActionData={{ uri: showsWord ? `posta://word-of-day?id=${encodeURIComponent(word.id)}` : 'posta://home' }}
      accessibilityLabel={showsWord ? `Word of the day: ${word.es}, ${word.en}` : (look.line?.[1] ?? 'Posta')}>
      <ImageWidget image={SCENES[look.scene][wide ? 1 : 0]} imageWidth={info.width} imageHeight={info.height} resizeMode="cover" />

      <FlexWidget style={{ width: 'match_parent', height: 'match_parent', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
        <ImageWidget
          image={pose.source}
          imageWidth={height * pose.ratio * u}
          imageHeight={height * u}
          style={{ marginRight: right * u, marginBottom: bottom * u }}
        />
      </FlexWidget>

      {day.moment === 'frozen' ? (
        <FlexWidget style={{ width: 'match_parent', height: 'match_parent', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
          <FlexWidget
            style={{
              width: block.width,
              height: block.height,
              marginRight: block.right,
              marginBottom: 18 * u,
              borderRadius: block.width * 0.18,
              borderWidth: 4 * u,
              borderColor: '#121A22',
              backgroundColor: 'rgba(169, 214, 245, 0.55)',
            }}
          />
        </FlexWidget>
      ) : null}

      <FlexWidget style={{ flexDirection: 'column', paddingLeft: (wide ? 30 : 26) * u, paddingTop: 26 * u }}>
        <Chip day={day} u={u} />
        {showsWord ? (
          <Words word={word} wide={wide} u={u} />
        ) : (
          <TextWidget
            text={look.line?.[wide ? 1 : 0] ?? ''}
            maxLines={wide ? 2 : 1}
            style={{
              width: (wide ? 380 : 300) * u,
              marginTop: (wide ? 36 : 18) * u,
              fontFamily: DISPLAY,
              fontSize: (wide ? 50 : 38) * u,
              adjustsFontSizeToFit: !wide,
              color: look.dark ? '#DFEFFA' : INK,
            }}
          />
        )}
      </FlexWidget>
    </OverlapWidget>
  );
}

/** Her row as the app last left it, and what this moment makes of it. */
export async function renderPostaWidget(info: WidgetInfo) {
  let row: WidgetRow | null = null;
  try {
    const saved = await AsyncStorage.getItem(WIDGET_ROW_KEY);
    row = saved ? (JSON.parse(saved) as WidgetRow) : null;
  } catch {
    // No row to read: the widget shows the word of the day and an empty chip.
  }
  const now = new Date();
  return <PostaWidget info={info} day={widgetDay(row, now)} word={wordOf(now)} />;
}
