-- "cuántas" moves from unit 9 ("¿Cuántos años tenés?") to unit 10 ("En el kiosco").
--
-- Unit 9's only plural noun is "años", which is masculine, so the feminine
-- "cuántas" had nothing in the course to agree with. Every sentence the writer
-- could build on it was elliptical — "¿Vos cuántas tenés?", with the referent
-- merely implied — and the judge rejected all twelve, leaving the word
-- introduced and never said. Unit 10 teaches empanadas, facturas, medialunas
-- and hermanas, and "¿Cuántas empanadas?" is the question that unit exists for.
--
-- The lemma stays whole and shared: "cuánto" now has one form taught in unit 9
-- and another in unit 10, which the outline allows because a unit belongs to a
-- form, not to its lemma. A form's id is derived from lemma and spelling only
-- (scripts/course/lib/ids.mjs), so this row keeps its id.
begin;

-- Unit 9 closes the gap first, while the word is still standing in it — read
-- its position after the move and you read the new one.
update public.forms f
   set position = f.position - 1
  from public.units u,
       (select position from public.forms where form = 'cuántas') as gap
 where u.id = f.unit_id and u.slug = 'cuantos-anos-tenes' and f.position > gap.position;

-- Room at the front of unit 10: the question comes before what it counts.
update public.forms f
   set position = f.position + 1
  from public.units u
 where u.id = f.unit_id and u.slug = 'en-el-kiosco';

update public.forms
   set unit_id = (select id from public.units where slug = 'en-el-kiosco'),
       position = 1
 where id = (select f.id
               from public.forms f
               join public.lemmas l on l.id = f.lemma_id
              where f.form = 'cuántas' and l.pos = 'adj');

commit;
