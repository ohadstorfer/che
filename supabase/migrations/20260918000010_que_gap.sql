-- Closes the hole "qué" left behind in unit 4 (20260918000009).
--
-- Positions are what the outline YAML and the database are compared on
-- (course:parity), and what orders a unit's words in its lessons. Taking a word
-- out of the middle leaves a gap, so everything after it moves down one.
update public.forms f
   set position = f.position - 1
  from public.units u
 where u.id = f.unit_id and u.slug = 'como-te-llamas' and f.position > 6;
