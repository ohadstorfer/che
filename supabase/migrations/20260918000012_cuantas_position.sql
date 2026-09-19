-- Puts "cuántas" where the outline actually lists it (20260918000011).
--
-- That migration pushed it to the front of unit 10, ahead of everything. The
-- YAML reads better and disagreed: the possessives and the shop come first, and
-- the question about how many comes after the things there are many of. This is
-- what course:parity compares, so the two have to say the same thing.
begin;

update public.forms f
   set position = f.position - 1
  from public.units u
 where u.id = f.unit_id and u.slug = 'en-el-kiosco' and f.position between 2 and 5;

update public.forms
   set position = 5
 where id = (select f.id
               from public.forms f
               join public.lemmas l on l.id = f.lemma_id
              where f.form = 'cuántas' and l.pos = 'adj');

commit;
