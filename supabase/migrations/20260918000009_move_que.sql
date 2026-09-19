-- "qué" moves from unit 4 ("¿Cómo te llamás?") to unit 15 ("¿Qué hacés?").
--
-- In unit 4 the course has no verb for "qué" to question, so every sentence it
-- can appear in is a bare "¿Qué?" asking for a repeat — which reads as curt in
-- Buenos Aires. "¿Cómo?" is the neutral way to ask that, and unit 4 teaches it.
-- Unit 15 is named for the question it could not ask: it taught "hacés" without
-- "qué". This gives it back.
--
-- A form's id is derived from its lemma and spelling, never its unit
-- (scripts/course/lib/ids.mjs), so the row keeps its id and nothing that points
-- at it has to move. Both units are drafts with no sentences, so no published
-- content depends on the old placement.
begin;

-- Room at the front of unit 15's hacer block, so "qué" is taught beside it.
update public.forms f
   set position = f.position + 1
  from public.units u
 where u.id = f.unit_id and u.slug = 'que-haces' and f.position >= 27;

update public.forms
   set unit_id = (select id from public.units where slug = 'que-haces'),
       position = 27
 where id = (select f.id
               from public.forms f
               join public.lemmas l on l.id = f.lemma_id
              where f.form = 'qué' and l.pos = 'pron');

commit;
