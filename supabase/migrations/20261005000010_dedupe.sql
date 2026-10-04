-- Exact duplicate sentences inside one unit (left by the merges): one of each pair leaves, from the bigger group.
update public.sentences set status = 'retired', updated_at = now() where id = '033197d1-386d-5aff-969c-53e79b312063' and status = 'published'; -- ¿Hablás castellano?
update public.sentences set status = 'retired', updated_at = now() where id = '066e3eea-d845-523b-9d64-eb08672fe47c' and status = 'published'; -- Acabamos de llegar a casa.
update public.sentences set status = 'retired', updated_at = now() where id = '0a1c4499-df40-55ff-b74c-5ca22ebb0d06' and status = 'published'; -- Los domingos solemos hacer asado.
update public.sentences set status = 'retired', updated_at = now() where id = '4adb4096-454c-5a34-8796-c37e400a2ad2' and status = 'published'; -- Volví a fumar.
update public.sentences set status = 'retired', updated_at = now() where id = '4b6150a6-3452-52d4-8ed0-1e729baad043' and status = 'published'; -- ¿Entendés?
update public.sentences set status = 'retired', updated_at = now() where id = '5298fed8-0146-5f81-9b06-563bd1f2b522' and status = 'published'; -- ¿Me entendés?
update public.sentences set status = 'retired', updated_at = now() where id = '63ed039e-2838-5aa0-b6be-66270fe9250c' and status = 'published'; -- Solemos salir los viernes.
update public.sentences set status = 'retired', updated_at = now() where id = '6768b9f3-ea7e-5866-b120-87bafed1bc67' and status = 'published'; -- ¿Hablás inglés?
update public.sentences set status = 'retired', updated_at = now() where id = 'b11a4c3f-2738-5bb0-a120-b8a54dbf3199' and status = 'published'; -- ¿Hablás inglés?
update public.sentences set status = 'retired', updated_at = now() where id = '6de9be58-9fd7-5067-8154-af3b159d9bde' and status = 'published'; -- ¿Hace cuánto vivís acá?
update public.sentences set status = 'retired', updated_at = now() where id = 'a795a878-046b-5217-b0a6-90afda846f4e' and status = 'published'; -- Volví a estudiar después de diez años.
delete from public.lesson_slots where sentence_id in (select id from public.sentences where status = 'retired');
