-- Which of the course's proper nouns are people, and which people.
--
-- A sentence that introduces its speaker by name says who is speaking, and the
-- recording has to agree: "Soy Martín" cannot come out in Malena's voice. The
-- rule reads the token after `soy` / `me llamo` and takes its gender, so the
-- name has to carry one — and the names were the only part of the lexicon that
-- did not (adjectives, nouns, determiners and pronouns all already do).
--
-- Place names are left alone on purpose. `gender` here means the gender of a
-- person who could be speaking, and Argentina is not speaking. Giving a country
-- its grammatical gender would make it look like a candidate to the same rule.
update public.forms f
   set features = f.features || jsonb_build_object('gender', v.gender)
  from (values ('Juan', 'm'), ('Martín', 'm'), ('Lucía', 'f'), ('Sofi', 'f')) as v(form, gender),
       public.lemmas l
 where l.id = f.lemma_id
   and l.pos = 'propn'
   and f.form = v.form;
