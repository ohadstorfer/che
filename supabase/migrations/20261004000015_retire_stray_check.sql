-- A draft "Unit check" left parked at ordinal 31001 in practico-castellano; the unit has its real check at 16.
update public.lessons set status = 'retired' where status = 'draft' and kind = 'review' and ordinal = 31001
  and unit_id = (select id from public.units where slug = 'practico-castellano');
