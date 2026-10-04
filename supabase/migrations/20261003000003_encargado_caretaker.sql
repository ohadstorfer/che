-- Word meaning review, round 3 (2026-10-03): one English word for `encargado`.
-- The course said "super" (US slang), "building super", "building manager" and
-- "caretaker" for the same person. The encargado cleans, takes out the trash and
-- fixes small things; the manager is la administración. Plain English: "building caretaker".
update public.sentences
set en = regexp_replace(en, '\m(building super|building manager|super)\M', 'building caretaker', 'gi')
where status = 'published' and es ~* 'encargad[oa]' and en ~* '\m(super|building manager)\M';

update public.sentences s
set tokens = (
  select jsonb_agg(
    case when t->>'surface' ~* 'encargad' and t->>'gloss' is not null
      then jsonb_set(t, '{gloss}', to_jsonb(regexp_replace(t->>'gloss', '\m(building super|building manager|super|caretaker)\M', 'building caretaker', 'i')))
      else t end
    order by ord)
  from jsonb_array_elements(s.tokens) with ordinality x(t, ord))
where status = 'published'
  and exists (select 1 from jsonb_array_elements(s.tokens) t where t->>'surface' ~* 'encargad' and t->>'gloss' ~* '\m(super|building manager|caretaker)\M' and t->>'gloss' !~* 'building caretaker');

update public.lemmas set gloss_en = 'building caretaker' where lemma = 'encargado' and gloss_en = 'building super, caretaker';
