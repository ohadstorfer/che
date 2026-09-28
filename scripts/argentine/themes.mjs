// The themes Argentine vocabulary is grouped by (docs/argentine/words.yaml).
// A theme with more words than one pack holds is dealt into several packs
// ("Food & drink 1", "Food & drink 2") by build.mjs.

export const THEMES = [
  { slug: 'charla', title: 'Everyday talk', emoji: '💬', about: 'Fillers, reactions and the little words every conversation runs on.' },
  { slug: 'gente', title: 'People', emoji: '🧑', about: 'Kids, friends, cops, posh people and everyone in between.' },
  { slug: 'plata', title: 'Money & work', emoji: '💸', about: 'Cash, jobs, prices and getting by.' },
  { slug: 'comida', title: 'Food & drink', emoji: '🥩', about: 'What Argentines eat and drink, and what they call it.' },
  { slug: 'ciudad', title: 'City & getting around', emoji: '🚌', about: 'Buses, the subte, shops and the street.' },
  { slug: 'casa', title: 'Home & clothes', emoji: '🏠', about: 'Things around the house and what you wear.' },
  { slug: 'cuerpo', title: 'Body & looks', emoji: '🦵', about: 'Body parts and how people look.' },
  { slug: 'animo', title: 'Moods & feelings', emoji: '😮‍💨', about: 'Being bored, tired, fed up or thrilled.' },
  { slug: 'verbos', title: 'Everyday verbs', emoji: '🏃', about: 'The verbs Argentines use instead of the textbook ones.' },
  { slug: 'noche', title: 'Going out', emoji: '🪩', about: 'Parties, bars, nights out and the morning after.' },
  { slug: 'futbol', title: 'Football', emoji: '⚽', about: 'The words of the stands and the pitch.' },
  { slug: 'politica', title: 'Politics & society', emoji: '🏛️', about: 'Parties, protests and the country in the news.' },
  { slug: 'campo', title: 'Countryside & gauchos', emoji: '🐎', about: 'The pampa, the gaucho and life outside the city.' },
  { slug: 'lunfardo', title: 'Classic lunfardo', emoji: '🎩', about: 'Tango-era slang that is still understood today.' },
  { slug: 'vesre', title: 'Vesre', emoji: '🔁', about: 'Words said backwards: feca, jermu, toga.' },
  { slug: 'expresiones', title: 'Expressions', emoji: '🗯️', about: 'Idioms and set phrases.' },
  { slug: 'puteadas', title: 'Puteadas', emoji: '🔞', about: 'Insults, swearing and rude words. Adults only.', vulgar: true },
];

export const THEME_SLUGS = THEMES.map((t) => t.slug);

/** How many words a pack holds before its theme is split. */
export const PACK_SIZE = 5;

export const POS = ['noun', 'verb', 'adj', 'adv', 'intj', 'phrase'];
