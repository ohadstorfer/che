-- Two tester notes, 2026-10-25 (owner's call), both in un-cafe-por-favor:
-- 1. "Jugo, café y una medialuna, por favor." mixed bare nouns with "una" and
--    ran long. Now "Un jugo, un café y una medialuna." — "por favor" keeps 14
--    sentences in the unit. The old clip no longer matches, so the row loses
--    its audio and voice (listen drills fall back to building) until re-recorded.
-- 2. "Mate, gracias." was glossed "Some mate, thanks." — now "Mate, thanks."
-- Same sentence ids, so lesson slots stay as they are.

update public.sentences set
  es = 'Un jugo, un café y una medialuna.',
  en = 'A juice, a coffee and a medialuna.',
  tokens = '[
    {"gloss":"a","surface":"Un","form_ids":["060197a5-9154-5a14-ac6d-8a8ffa3e9f6b"]},
    {"gloss":"juice","surface":"jugo,","form_ids":["6c053054-70c4-56ce-9300-fe4fa796b45a"]},
    {"gloss":"a","surface":"un","form_ids":["060197a5-9154-5a14-ac6d-8a8ffa3e9f6b"]},
    {"gloss":"coffee","surface":"café","form_ids":["c7bf2819-57df-5873-99e0-553951291a4f"]},
    {"gloss":"and","surface":"y","form_ids":["f8d95e85-1f78-5547-b970-1ce34d4f9883"]},
    {"gloss":"a","surface":"una","form_ids":["deb6b73d-0a96-5cdb-bc6f-dfa02f562b0d"]},
    {"gloss":"medialuna","surface":"medialuna.","form_ids":["61df6d82-e066-542f-b158-5524f130294e"]}
  ]'::jsonb,
  audio_path = null,
  voice_id = null
where id = 'cb774465-1f2d-5662-a37c-391df730d458' and es = 'Jugo, café y una medialuna, por favor.';

update public.sentences set en = 'Mate, thanks.', en_alt = '{}'
where id = '0c8271a3-b5bb-5505-8e46-c5c500bfe202' and en = 'Some mate, thanks.';
