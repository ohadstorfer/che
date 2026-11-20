// Writes the migration that copies the local first class (components/first-class.tsx
// + src/lib/first-class.json) into first_classes as row "default", so the
// database version starts out identical and is edited from there.
//   node scripts/first-class/seed-db.mjs > supabase/migrations/<stamp>_first_classes.sql
import fs from 'node:fs';

const fx = JSON.parse(fs.readFileSync(new URL('../../src/lib/first-class.json', import.meta.url)));
const ID = {
  medialuna: '61df6d82-e066-542f-b158-5524f130294e',
  che: '91232a84-b055-5e03-8ed2-651c79f5b376',
  querés: '94890c85-b399-59cf-bb96-6552de128c40',
  medialunas: '362f3213-c426-54c2-9702-c788da937db5',
  cheQuerésMedialunas: '2e1e0e3c-0847-520b-b36f-af53f7070321',
  medialunaGracias: 'c2268e3e-a367-5746-bba2-28619fa7f2b7',
  algoMás: 'be99423e-6489-5a9f-878f-500251f4e8a3',
  querésUnCafé: '299d346b-881a-5ef3-a8e1-b3ca97fb52cf',
  o: '14804e3f-6f0e-51a1-b7ec-b7ff9af2b23c',
};
const forms = fx.forms.map((f) =>
  f.id === ID.medialuna
    ? { ...f, gloss_en: 'Argentine pastry', meaning_en: 'A common Argentine pastry. Not a croissant, though it looks like one.', gloss_note_en: null }
    : f.id === ID.medialunas
      ? { ...f, gloss_en: 'Argentine pastries', meaning_en: 'Common Argentine pastries. Not croissants, though they look like them.', gloss_note_en: null }
      : f,
);
const byId = new Map(forms.map((f) => [f.id, f]));
const withChe = fx.sentences.find((s) => s.id === ID.cheQuerésMedialunas);
const build = {
  ...withChe,
  id: 'fc-queres-medialunas',
  es: '¿Querés medialunas?',
  en: 'Do you want medialunas?',
  es_alt: ['¿Vos querés medialunas?'],
  en_alt: ['Would you like medialunas?', 'Want some medialunas?', 'Do you want some medialunas?'],
  target_form_id: ID.querés,
  tokens: withChe.tokens
    .filter((t) => !t.form_ids.includes(ID.che))
    .map((t, i) => (i === 0 ? { ...t, surface: t.surface.replace(/\p{Ll}/u, (c) => c.toLocaleUpperCase('es')) } : t)),
  audio_path: null,
};
const own = new Set([ID.che, ID.querés, ID.medialunas, ID.o].map((id) => byId.get(id).lemma_id));
const spare = forms.filter((f) => !own.has(f.lemma_id)).map((f) => f.id);

const content = {
  screens: [
    { id: 'medialuna', type: 'new_word', form_id: ID.medialuna, sentence_id: ID.medialunaGracias, choice_sentence_ids: [ID.medialunaGracias, ID.algoMás, ID.querésUnCafé] },
    {
      id: 'build', type: 'pick_picture', levels: ['none', 'basics'], prompt: 'What is Pancho offering you?', sentence_id: build.id,
      options: [
        { id: 'right', label: 'Medialunas', lemma_id: 'aa5883af-95bf-5b63-a33a-9dc346c549ca', correct: true },
        { id: 'pizza', label: 'Pizza', lemma_id: '6ddd50e0-dea7-59da-b239-b1ab69cf7824' },
        { id: 'helado', label: 'Ice cream', lemma_id: '33c92145-598a-56f6-ab96-f3b6584caf1d' },
        { id: 'jugo', label: 'Orange juice', lemma_id: '6d2c0df3-c171-5f0e-a6f9-1c6b55dde303' },
      ],
    },
    { id: 'build', type: 'build', levels: ['learning', 'spanish', 'conversational'], sentence_id: build.id, spare_form_ids: spare },
    {
      id: 'slang', type: 'slang',
      words: [{ id: 're', example: { es: '¡La medialuna está re rica!', en: 'The medialuna is really tasty!', audio: 'argentine/d2aff656364e13ce0f76.mp3' }, gap: 're' }],
      decoys: ['celu', 'cumple', 'finde'],
    },
    { id: 'culture-intro', type: 'culture_intro' },
    {
      id: 'asado', type: 'culture_card', chip: 'More than a barbecue', art: { section: 'asado', index: 0 }, bg: 'butter', section: 'asado', class: 'el-ritual',
      text: 'An **asado** is grilled meat, sure. But mostly it’s an excuse to spend the whole day together. **¿Hacemos un asado?** really means: want to hang out?',
    },
  ],
  done_line: 'Medialuna, re, asado. Three words in, many more to go.',
  forms,
  sentences: [...fx.sentences, build],
};
const json = JSON.stringify(content).replaceAll("'", "''");
process.stdout.write(`-- The first class, editable from the dashboard with no app update (2026-11-19).
--
--   app_config first_class_source: "local" (default) plays the class built into
--   the app; "db" plays a row of first_classes. On "local" the app reads only
--   that one row of app_config.
--
--   first_classes: one row per version of the class. levels = which onboarding
--   levels get it (none, basics, learning, spanish, conversational); empty =
--   everyone without a row of their own. Only published rows are read.
--   content's shape: supabase/first-class-README.md (and DbContent in
--   src/lib/first-class-script.ts). Row "default" is a copy of the local class,
--   made by scripts/first-class/seed-db.mjs, to edit from.
--
-- Read with the anon key: onboarding may run before there is an account.

create table if not exists public.first_classes (
  id text primary key,
  levels text[] not null default '{}',
  published boolean not null default false,
  note text,
  content jsonb not null,
  updated_at timestamptz not null default now(),
  constraint first_classes_levels check (levels <@ array['none','basics','learning','spanish','conversational']::text[])
);

alter table public.first_classes enable row level security;
drop policy if exists "first_classes: anyone reads published" on public.first_classes;
create policy "first_classes: anyone reads published" on public.first_classes
  for select to anon, authenticated using (published or public.is_staff());

create or replace function public.first_classes_touch() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists first_classes_touch on public.first_classes;
create trigger first_classes_touch before update on public.first_classes
  for each row execute function public.first_classes_touch();

insert into public.app_config (key, value)
values ('first_class_source', '"local"'::jsonb)
on conflict (key) do nothing;

insert into public.first_classes (id, levels, published, note, content)
values ('default', '{}', true, 'Copy of the class built into the app (2026-11-19).', '${json}'::jsonb)
on conflict (id) do nothing;
`);
