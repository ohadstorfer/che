-- Cortado leaves the course. It was one of the first words taught (unit 1,
-- "Un café, por favor") but is a niche café order, and a word whose English is
-- itself gets almost no exercises. It stays in culture cards and Hablar.
-- Only the form `cortado` goes: `cortada` ("la calle está cortada") shares the
-- lemma and stays. Lesson slots are rebuilt after this with course:lessons.

update public.sentences s set status = 'retired'
where s.status <> 'retired' and (
  s.target_form_id = '495df4cb-c037-5679-aa48-1c6b79f02ad6'
  or exists (select 1 from jsonb_array_elements(s.tokens) t, jsonb_array_elements_text(t->'form_ids') x
             where x::uuid = '495df4cb-c037-5679-aa48-1c6b79f02ad6')
);

update public.forms set status = 'retired' where id = '495df4cb-c037-5679-aa48-1c6b79f02ad6';
