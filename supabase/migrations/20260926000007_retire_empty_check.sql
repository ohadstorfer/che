-- otro-cafe had two "Unit check" lessons: the section 8 seed re-added a draft one that publishing then made live, with no exercises (a lesson that is only its tip). Retire it.
update public.lessons set status = 'retired' where id = '5e49c895-0043-5b2c-911c-9c7bada67f1c' and not exists (select 1 from public.lesson_slots s where s.lesson_id = '5e49c895-0043-5b2c-911c-9c7bada67f1c');
