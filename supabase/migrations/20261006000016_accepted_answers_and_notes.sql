-- Accepted answers the English prompt allows and the app refused, found by
-- screening every published sentence for Spanish words the English gives no
-- cue for (token glosses against the English, plus detectors for ya, mismo,
-- diminutives, openers, clitic doubling, subject pronouns the rules miss,
-- "tener ... años") and read one by one. Each variant passed the sentence
-- checks (vocabulary taught by that unit, voseo, regional words) and the app's
-- own grader before it was written here.
--
-- Appended, never overwritten: a row whose text changed since, or that already
-- holds one of these answers, is left alone. Where the written sentence has a
-- word worth explaining, note_en says why (20261006000015); one wording per
-- phenomenon.

-- The sentence the report was about got its answers in 20261006000014.
update public.sentences set note_en = 'Argentines often put a “No,” before “de nada”: it waves the thanks away and sounds softer.'
where id = 'c257800c-a57b-5466-ad35-3a60d4702d51' and es = 'No, de nada, todo bien.';

update public.sentences set es_alt = es_alt || array['Llegamos.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '0b47775c-53d3-50ed-beab-77a9b8cfb5b4' and es = 'Ya llegamos.' and en = 'We''re here.'
  and not (es_alt && array['Llegamos.']::text[]);

update public.sentences set es_alt = es_alt || array['Llegaron los invitados.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '0d674c71-3761-581d-acd0-ca2adba8f1e4' and es = 'Ya llegaron los invitados.' and en = 'The guests are here.'
  and not (es_alt && array['Llegaron los invitados.']::text[]);

update public.sentences set es_alt = es_alt || array['Te transferí todo, no te debo nada.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '0dbaafa1-808a-5c65-9cf2-6d4ec6c8ccb2' and es = 'Ya te transferí todo, no te debo nada.' and en = 'I''ve transferred you everything, I don''t owe you anything.'
  and not (es_alt && array['Te transferí todo, no te debo nada.']::text[]);

update public.sentences set es_alt = es_alt || array['Chicos, bienvenidos, les traigo algo para tomar.', 'Bienvenidos, chicos, les traigo algo para tomar.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '1f56b84a-2c24-5095-80d1-5a890fe900e0' and es = 'Chicos, bienvenidos, ya les traigo algo para tomar.' and en = 'Guys, welcome, I''ll bring you something to drink.'
  and not (es_alt && array['Chicos, bienvenidos, les traigo algo para tomar.', 'Bienvenidos, chicos, les traigo algo para tomar.']::text[]);

update public.sentences set es_alt = es_alt || array['Sé que perdiste, pero ¿la pasaste bien?', 'Sé que vos perdiste, pero ¿la pasaste bien?']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '1fb83944-d822-54cf-9450-b08c86dbd3c2' and es = 'Ya sé que perdiste, pero ¿la pasaste bien?' and en = 'I know you lost, but did you have a good time?'
  and not (es_alt && array['Sé que perdiste, pero ¿la pasaste bien?', 'Sé que vos perdiste, pero ¿la pasaste bien?']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo el pan, ¿necesitás algo más?', 'Tengo el pan, ¿vos necesitás algo más?']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '28e0afa0-7b8f-5aae-ba8c-e45c18dbc73e' and es = 'Ya tengo el pan, ¿necesitás algo más?' and en = 'I''ve got the bread, do you need anything else?'
  and not (es_alt && array['Tengo el pan, ¿necesitás algo más?', 'Tengo el pan, ¿vos necesitás algo más?']::text[]);

update public.sentences set es_alt = es_alt || array['Cargá las cosas, que salimos.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '29437582-5293-555b-9fb1-e2e33bed6922' and es = 'Cargá las cosas, que ya salimos.' and en = 'Load up the stuff, we''re heading out.'
  and not (es_alt && array['Cargá las cosas, que salimos.']::text[]);

update public.sentences set es_alt = es_alt || array['Salieron los resultados.', 'Los resultados salieron.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '38853ae9-cf09-5314-8fc0-6c780bc855f4' and es = 'Ya salieron los resultados.' and en = 'The results are out.'
  and not (es_alt && array['Salieron los resultados.', 'Los resultados salieron.']::text[]);

update public.sentences set es_alt = es_alt || array['Sé que te cae mal, pero es mi amigo.', 'Sé que te cae mal, pero él es mi amigo.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '4cd61132-b932-5a9a-a95e-854091bd4c56' and es = 'Ya sé que te cae mal, pero es mi amigo.' and en = 'I know you don''t like him, but he''s my friend.'
  and not (es_alt && array['Sé que te cae mal, pero es mi amigo.', 'Sé que te cae mal, pero él es mi amigo.']::text[]);

update public.sentences set es_alt = es_alt || array['Llegué, estoy en la esquina.', 'Llegué, yo estoy en la esquina.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '50a92144-8e85-5060-a431-2c4c61b01efa' and es = 'Ya llegué, estoy en la esquina.' and en = 'I''m here, I''m at the corner.'
  and not (es_alt && array['Llegué, estoy en la esquina.', 'Llegué, yo estoy en la esquina.']::text[]);

update public.sentences set es_alt = es_alt || array['Es tarde, apagá la compu y andá a dormir.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '57d73097-2a18-5214-b79f-9056e2b306cd' and es = 'Ya es tarde, apagá la compu y andá a dormir.' and en = 'It''s late, turn off the computer and go to bed.'
  and not (es_alt && array['Es tarde, apagá la compu y andá a dormir.']::text[]);

update public.sentences set es_alt = es_alt || array['Esperen, voy.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '691682fb-dd6c-567e-b16f-aea5d69e2c35' and es = 'Esperen, ya voy.' and en = 'Wait, I''m coming.'
  and not (es_alt && array['Esperen, voy.']::text[]);

update public.sentences set es_alt = es_alt || array['Va a aparecer.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '6f3e0942-f41b-504a-a22f-a6bebf22fed6' and es = 'Ya va a aparecer.' and en = 'It''ll turn up.'
  and not (es_alt && array['Va a aparecer.']::text[]);

update public.sentences set es_alt = es_alt || array['Volví.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '74999073-a8be-53a1-ab05-93103f6e7bae' and es = 'Ya volví.' and en = 'I''m back.'
  and not (es_alt && array['Volví.']::text[]);

update public.sentences set es_alt = es_alt || array['Volví.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '76971e2a-8dc7-599b-b7ee-81f240aa4d34' and es = 'Ya volví.' and en = 'I''m back.'
  and not (es_alt && array['Volví.']::text[]);

update public.sentences set es_alt = es_alt || array['Apagá el auto, llegamos.', 'Llegamos, apagá el auto.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '7d950651-c09e-5678-a7cc-7118bd884e8e' and es = 'Apagá el auto, ya llegamos.' and en = 'Turn off the car, we''re here.'
  and not (es_alt && array['Apagá el auto, llegamos.', 'Llegamos, apagá el auto.']::text[]);

update public.sentences set es_alt = es_alt || array['Ni que fuera gil, sé que mentiste.', 'Ni que fuera gil, sé que vos mentiste.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '7e173a0e-66e7-575a-b988-7671367c98d4' and es = 'Ni que fuera gil, ya sé que mentiste.' and en = 'What am I, stupid? I know you lied.'
  and not (es_alt && array['Ni que fuera gil, sé que mentiste.', 'Ni que fuera gil, sé que vos mentiste.']::text[]);

update public.sentences set es_alt = es_alt || array['Sé que te arrepentís, pero te lo perdiste y no hay otra fecha.', 'Sé que vos te arrepentís, pero te lo perdiste y no hay otra fecha.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '8c94b87a-144f-5a51-8e22-f5b19f17d2b6' and es = 'Ya sé que te arrepentís, pero te lo perdiste y no hay otra fecha.' and en = 'I know that you regret it, but you missed out and there is no other date.'
  and not (es_alt && array['Sé que te arrepentís, pero te lo perdiste y no hay otra fecha.', 'Sé que vos te arrepentís, pero te lo perdiste y no hay otra fecha.']::text[]);

update public.sentences set es_alt = es_alt || array['Un toque, voy.', 'Voy, un toque.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '917f5574-1270-5fd9-949c-bfe24f9ecd12' and es = 'Un toque, ya voy.' and en = 'One sec, I''m coming.'
  and not (es_alt && array['Un toque, voy.', 'Voy, un toque.']::text[]);

update public.sentences set es_alt = es_alt || array['Sé que no tenés ganas, pero insisto.', 'Sé que no tenés ganas, pero yo insisto.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = 'ad2a05cf-1e9c-5158-9cd1-7888eceeb1d7' and es = 'Ya sé que no tenés ganas, pero insisto.' and en = 'I know you don''t feel like it, but I insist.'
  and not (es_alt && array['Sé que no tenés ganas, pero insisto.', 'Sé que no tenés ganas, pero yo insisto.']::text[]);

update public.sentences set es_alt = es_alt || array['Chicos, siéntense, que empieza.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = 'b58f74ab-43b6-58ef-86bc-5d714128fb20' and es = 'Chicos, siéntense, que ya empieza.' and en = 'Guys, sit down, it''s starting.'
  and not (es_alt && array['Chicos, siéntense, que empieza.']::text[]);

update public.sentences set es_alt = es_alt || array['Juli, no te vayas, viene la torta.', 'No te vayas, Juli, viene la torta.', 'Juli, no te vayas, la torta viene.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = 'b7c643b4-68c3-531b-97c3-0a9fe93de4a9' and es = 'Juli, no te vayas, ya viene la torta.' and en = 'Juli, don''t go, the cake''s coming.'
  and not (es_alt && array['Juli, no te vayas, viene la torta.', 'No te vayas, Juli, viene la torta.', 'Juli, no te vayas, la torta viene.']::text[]);

update public.sentences set es_alt = es_alt || array['Pasó lo difícil.', 'Lo difícil pasó.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = 'bf69a964-f0da-53c7-a83e-1dd06460169e' and es = 'Ya pasó lo difícil.' and en = 'The hard part is over.'
  and not (es_alt && array['Pasó lo difícil.', 'Lo difícil pasó.']::text[]);

update public.sentences set es_alt = es_alt || array['Se ofendió, pero tiene buen corazón: se le pasa.', 'Él se ofendió, pero tiene buen corazón: se le pasa.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = 'c5550c0f-4c16-5986-ba6b-787c695de449' and es = 'Se ofendió, pero tiene buen corazón: ya se le pasa.' and en = 'He took offense, but he has a good heart: he''ll get over it.'
  and not (es_alt && array['Se ofendió, pero tiene buen corazón: se le pasa.', 'Él se ofendió, pero tiene buen corazón: se le pasa.']::text[]);

update public.sentences set es_alt = es_alt || array['Casi llego, estoy a dos cuadras.', 'Casi llego, yo estoy a dos cuadras.', 'Estoy a dos cuadras, casi llego.', 'Yo estoy a dos cuadras, casi llego.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = 'cd65aead-7b19-5648-b9d3-c2261d99e8e2' and es = 'Ya casi llego, estoy a dos cuadras.' and en = 'I''m almost there, I''m two blocks away.'
  and not (es_alt && array['Casi llego, estoy a dos cuadras.', 'Casi llego, yo estoy a dos cuadras.', 'Estoy a dos cuadras, casi llego.', 'Yo estoy a dos cuadras, casi llego.']::text[]);

update public.sentences set es_alt = es_alt || array['Voy.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = 'd672f223-a414-5fd1-83f9-e311afe4d55c' and es = 'Ya voy.' and en = 'Coming!'
  and not (es_alt && array['Voy.']::text[]);

update public.sentences set es_alt = es_alt || array['Lo sospechaba.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = 'da28b30a-7dad-5e65-bb43-636afdb4e4c5' and es = 'Ya lo sospechaba.' and en = 'I had a feeling.'
  and not (es_alt && array['Lo sospechaba.']::text[]);

update public.sentences set es_alt = es_alt || array['Esa tradición se perdió.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = 'e3db8620-21e3-5ff2-84b7-fa8be74e0f34' and es = 'Esa tradición ya se perdió.' and en = 'That tradition has died out.'
  and not (es_alt && array['Esa tradición se perdió.']::text[]);

update public.sentences set es_alt = es_alt || array['Andá yendo, voy.', 'Voy, andá yendo.', 'Vayan yendo, voy.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = 'fbc2e693-c673-535e-9f24-af0a7c3fdb2b' and es = 'Andá yendo, ya voy.' and en = 'Go on ahead, I''m coming.'
  and not (es_alt && array['Andá yendo, voy.', 'Voy, andá yendo.', 'Vayan yendo, voy.']::text[]);

update public.sentences set es_alt = es_alt || array['Acabamos de reclamar otra vez: el ascensor sigue roto y me harté.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '24aa80a7-ef0a-5756-b219-cdc66d6ab86f' and es = 'Acabamos de reclamar otra vez: el ascensor sigue roto y ya me harté.' and en = 'We just complained again: the elevator is still broken and I''ve had enough.'
  and not (es_alt && array['Acabamos de reclamar otra vez: el ascensor sigue roto y me harté.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Hay algo pendiente o nos vamos?']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '6ae6924f-6f71-57ee-b829-1695f5096408' and es = '¿Hay algo pendiente o ya nos vamos?' and en = 'Is anything still pending, or are we leaving?'
  and not (es_alt && array['¿Hay algo pendiente o nos vamos?']::text[]);

update public.sentences set es_alt = es_alt || array['A esta altura me acostumbré al ritmo.']::text[], note_en = 'Spanish often adds “ya” where English says nothing. It means the thing just happened or is about to, like “already” or “right now”. The sentence is right without it too.'
where id = '77c6a06d-edcb-56f5-854b-bbb73c2954f3' and es = 'A esta altura ya me acostumbré al ritmo.' and en = 'By now I''ve gotten used to the pace.'
  and not (es_alt && array['A esta altura me acostumbré al ritmo.']::text[]);

update public.sentences set es_alt = es_alt || array['Con ese sueldo, yo dejaría el laburo mañana.', 'Con ese sueldo, dejaría el laburo mañana.']::text[], note_en = '“Mismo” after hoy, mañana or ahora means “this very”: “hoy mismo” is “this very day”. It adds urgency, and it can be left out.'
where id = '27427ca4-855b-5807-ba5e-f116992d132d' and es = 'Con ese sueldo, yo dejaría el laburo mañana mismo.' and en = 'With that salary, I''d quit my job tomorrow.'
  and not (es_alt && array['Con ese sueldo, yo dejaría el laburo mañana.', 'Con ese sueldo, dejaría el laburo mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Yo en tu lugar, pediría un turno hoy.', 'En tu lugar, yo pediría un turno hoy.', 'En tu lugar, pediría un turno hoy.']::text[], note_en = '“Mismo” after hoy, mañana or ahora means “this very”: “hoy mismo” is “this very day”. It adds urgency, and it can be left out.'
where id = '4da24cb2-9107-5a96-9857-1d3ecf72cbbc' and es = 'Yo en tu lugar, pediría un turno hoy mismo.' and en = 'If I were you, I''d ask for an appointment today.'
  and not (es_alt && array['Yo en tu lugar, pediría un turno hoy.', 'En tu lugar, yo pediría un turno hoy.', 'En tu lugar, pediría un turno hoy.']::text[]);

update public.sentences set es_alt = es_alt || array['El encargado me pidió que sacara la bici de la escalera hoy.', 'El encargado me pidió que sacara hoy la bici de la escalera.', 'El encargado me pidió que hoy sacara la bici de la escalera.']::text[], note_en = '“Mismo” after hoy, mañana or ahora means “this very”: “hoy mismo” is “this very day”. It adds urgency, and it can be left out.'
where id = 'ef085dc2-8219-5254-9e38-27883f26d5d6' and es = 'El encargado me pidió que sacara la bici de la escalera hoy mismo.' and en = 'The building manager asked me to take the bike out of the stairway today.'
  and not (es_alt && array['El encargado me pidió que sacara la bici de la escalera hoy.', 'El encargado me pidió que sacara hoy la bici de la escalera.', 'El encargado me pidió que hoy sacara la bici de la escalera.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Por qué te llevás mal con tu hermano?']::text[]
where id = '7dda08a3-dfbd-5711-a2d0-b263da323241' and es = '¿Por qué te llevás tan mal con tu hermano?' and en = 'Why don''t you get along with your brother?'
  and not (es_alt && array['¿Por qué te llevás mal con tu hermano?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Por qué se llevan mal Juli y Santi?', '¿Por qué Juli y Santi se llevan mal?', '¿Juli y Santi por qué se llevan mal?']::text[]
where id = '9aa95f8a-208f-5a71-a95a-0f53e38ffa87' and es = '¿Por qué se llevan tan mal Juli y Santi?' and en = 'Why don''t Juli and Santi get along?'
  and not (es_alt && array['¿Por qué se llevan mal Juli y Santi?', '¿Por qué Juli y Santi se llevan mal?', '¿Juli y Santi por qué se llevan mal?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Quemado? Obvio, hace un año que no te tomás vacaciones.']::text[], note_en = 'Argentines often open an answer with “Y,” when it seems obvious, like “well, of course”.'
where id = '2798f3d2-8b26-5545-8020-a5fb0aef9b0e' and es = '¿Quemado? Y, obvio, hace un año que no te tomás vacaciones.' and en = 'Burned out? Of course, you haven''t taken a vacation in a year.'
  and not (es_alt && array['¿Quemado? Obvio, hace un año que no te tomás vacaciones.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Vergüenza de qué? Hablás re bien.', '¿Vergüenza de qué? Vos hablás re bien.']::text[], note_en = 'Here “si” is not “if”. Opening a reply with it pushes back a little, like “but…!” in English.'
where id = '8f5b0860-8b1c-5635-9e77-bd0a37bfd314' and es = '¿Vergüenza de qué? Si hablás re bien.' and en = 'Embarrassed about what? You speak really well.'
  and not (es_alt && array['¿Vergüenza de qué? Hablás re bien.', '¿Vergüenza de qué? Vos hablás re bien.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Se picó? Pero era en joda.', '¿Él se picó? Pero era en joda.']::text[], note_en = 'Here “si” is not “if”. Opening a reply with it pushes back a little, like “but…!” in English.'
where id = 'b2ec728a-eb80-543d-8d57-533750d4c075' and es = '¿Se picó? Pero si era en joda.' and en = 'It got heated? But it was a joke.'
  and not (es_alt && array['¿Se picó? Pero era en joda.', '¿Él se picó? Pero era en joda.']::text[]);

update public.sentences set es_alt = es_alt || array['Ahora te escucho.']::text[], note_en = '“Ahora sí” means “now, at last”: the “sí” adds emphasis and can be left out.'
where id = 'f86a731f-8f42-533b-8763-06cab70adb80' and es = 'Ahora sí te escucho.' and en = 'Now I can hear you.'
  and not (es_alt && array['Ahora te escucho.']::text[]);

update public.sentences set es_alt = es_alt || array['Primero borrá la app, después descargá la nueva.']::text[]
where id = 'efbf0788-ee45-544e-b039-5b8b5b10bf1f' and es = 'Primero borrá la app y después descargá la nueva.' and en = 'First delete the app, then download the new one.'
  and not (es_alt && array['Primero borrá la app, después descargá la nueva.']::text[]);

update public.sentences set es_alt = es_alt || array['Engordé; sin embargo, sigo comiendo facturas.', 'Yo engordé; sin embargo, sigo comiendo facturas.']::text[]
where id = 'fe3d78a8-0cf1-54b6-ac0a-2f07004827e4' and es = 'Engordé y, sin embargo, sigo comiendo facturas.' and en = 'I put on weight; however, I keep eating pastries.'
  and not (es_alt && array['Engordé; sin embargo, sigo comiendo facturas.', 'Yo engordé; sin embargo, sigo comiendo facturas.']::text[]);

update public.sentences set es_alt = es_alt || array['Belén me juró que no le contó a nadie.']::text[]
where id = '024b4da7-fdda-5e8a-96e5-31dd68a30d08' and es = 'Belén me juró que no le contó nada a nadie.' and en = 'Belén swore to me she didn''t tell anyone.'
  and not (es_alt && array['Belén me juró que no le contó a nadie.']::text[]);

update public.sentences set es_alt = es_alt || array['No le digo a nadie.', 'A nadie le digo.']::text[]
where id = 'eea17800-ef39-5b77-be72-313137aa848e' and es = 'No le digo nada a nadie.' and en = 'I won''t tell anyone.'
  and not (es_alt && array['No le digo a nadie.', 'A nadie le digo.']::text[]);

update public.sentences set es_alt = es_alt || array['—El mate amargo no es rico. —Me gusta.']::text[], note_en = '“A mí”, “a vos” or “a nosotros” repeats the me, te or nos for emphasis or contrast, like “as for me”. The sentence is complete without it.'
where id = '110dcf99-0dd5-5d20-ac1f-370504c8b06e' and es = '—El mate amargo no es rico. —A mí me gusta.' and en = '—Bitter mate isn''t tasty. —I like it.'
  and not (es_alt && array['—El mate amargo no es rico. —Me gusta.']::text[]);

update public.sentences set es_alt = es_alt || array['Qué hipócrita, me dijo otra cosa.']::text[], note_en = '“A mí”, “a vos” or “a nosotros” repeats the me, te or nos for emphasis or contrast, like “as for me”. The sentence is complete without it.'
where id = '1a0abd05-4a38-5aca-a0b0-afdef7b74451' and es = 'Qué hipócrita, a mí me dijo otra cosa.' and en = 'What a hypocrite, he told me something else.'
  and not (es_alt && array['Qué hipócrita, me dijo otra cosa.']::text[]);

update public.sentences set es_alt = es_alt || array['Comprá el color que prefieras, me da igual.', 'Comprá el color que vos prefieras, me da igual.']::text[], note_en = '“A mí”, “a vos” or “a nosotros” repeats the me, te or nos for emphasis or contrast, like “as for me”. The sentence is complete without it.'
where id = '1c2b7c07-c5a7-5dac-9aea-e0bf28ba07ef' and es = 'Comprá el color que prefieras, a mí me da igual.' and en = 'Buy whatever color you prefer, it''s all the same to me.'
  and not (es_alt && array['Comprá el color que prefieras, me da igual.', 'Comprá el color que vos prefieras, me da igual.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te da risa? Me da asco.']::text[], note_en = '“A mí”, “a vos” or “a nosotros” repeats the me, te or nos for emphasis or contrast, like “as for me”. The sentence is complete without it.'
where id = '32846ba1-d0ca-54af-baf1-3db4e0734ab0' and es = '¿Te da risa? A mí me da asco.' and en = 'You think it''s funny? It grosses me out.'
  and not (es_alt && array['¿Te da risa? Me da asco.']::text[]);

update public.sentences set es_alt = es_alt || array['Dicen que es tonto, pero me parece tímido.', 'Dicen que él es tonto, pero me parece tímido.']::text[], note_en = '“A mí”, “a vos” or “a nosotros” repeats the me, te or nos for emphasis or contrast, like “as for me”. The sentence is complete without it.'
where id = '47a4f159-7df7-5959-b953-910cc5f89c13' and es = 'Dicen que es tonto, pero a mí me parece tímido.' and en = 'They say he''s dumb, but to me he seems shy.'
  and not (es_alt && array['Dicen que es tonto, pero me parece tímido.', 'Dicen que él es tonto, pero me parece tímido.']::text[]);

update public.sentences set es_alt = es_alt || array['No me chamuyás.']::text[], note_en = '“A mí”, “a vos” or “a nosotros” repeats the me, te or nos for emphasis or contrast, like “as for me”. The sentence is complete without it.'
where id = '7367af42-1afa-5559-88bc-69ec55264f3d' and es = 'A mí no me chamuyás.' and en = 'You can''t sweet-talk me.'
  and not (es_alt && array['No me chamuyás.']::text[]);

update public.sentences set es_alt = es_alt || array['Como quieras, me da igual.', 'Me da igual, como quieras.']::text[], note_en = '“A mí”, “a vos” or “a nosotros” repeats the me, te or nos for emphasis or contrast, like “as for me”. The sentence is complete without it.'
where id = 'afe38b2d-6f26-5822-81d5-821f1f95dfa1' and es = 'Como quieras, a mí me da igual.' and en = 'Whatever you want, I don''t mind.'
  and not (es_alt && array['Como quieras, me da igual.', 'Me da igual, como quieras.']::text[]);

update public.sentences set es_alt = es_alt || array['Sí, también me da cosa.', 'Sí, me da cosa también.']::text[], note_en = '“A mí”, “a vos” or “a nosotros” repeats the me, te or nos for emphasis or contrast, like “as for me”. The sentence is complete without it.'
where id = 'bfda637c-8c4a-5264-a58c-fce2a970c8ed' and es = 'Sí, a mí también me da cosa.' and en = 'Yes, it makes me uneasy too.'
  and not (es_alt && array['Sí, también me da cosa.', 'Sí, me da cosa también.']::text[]);

update public.sentences set es_alt = es_alt || array['Nos gusta mucho la fruta.']::text[], note_en = '“A mí”, “a vos” or “a nosotros” repeats the me, te or nos for emphasis or contrast, like “as for me”. The sentence is complete without it.'
where id = '1dd3ea9e-c219-5e4b-b2b0-221e53ce9e11' and es = 'A nosotras nos gusta mucho la fruta.' and en = 'We like fruit a lot.'
  and not (es_alt && array['Nos gusta mucho la fruta.']::text[]);

update public.sentences set es_alt = es_alt || array['Nos gusta el pollo, pero a ellos no.']::text[], note_en = '“A mí”, “a vos” or “a nosotros” repeats the me, te or nos for emphasis or contrast, like “as for me”. The sentence is complete without it.'
where id = '2adbf171-7264-5bb3-b01d-d7eff099d0ad' and es = 'A nosotros nos gusta el pollo, pero a ellos no.' and en = 'We like chicken, but they don''t.'
  and not (es_alt && array['Nos gusta el pollo, pero a ellos no.']::text[]);

update public.sentences set es_alt = es_alt || array['Nos gustan los huevos, a Cami no.']::text[], note_en = '“A mí”, “a vos” or “a nosotros” repeats the me, te or nos for emphasis or contrast, like “as for me”. The sentence is complete without it.'
where id = '765cafad-a59b-5d9f-8166-97b65494cafc' and es = 'A nosotros nos gustan los huevos, a Cami no.' and en = 'We like eggs; Cami doesn''t.'
  and not (es_alt && array['Nos gustan los huevos, a Cami no.']::text[]);

update public.sentences set es_alt = es_alt || array['No nos gusta la ensalada.']::text[], note_en = '“A mí”, “a vos” or “a nosotros” repeats the me, te or nos for emphasis or contrast, like “as for me”. The sentence is complete without it.'
where id = 'a78fd1e1-021b-57d5-92d0-e010129d0710' and es = 'A nosotros no nos gusta la ensalada.' and en = 'We don''t like salad.'
  and not (es_alt && array['No nos gusta la ensalada.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te echaron también?', '¿También te echaron?']::text[], note_en = '“A mí”, “a vos” or “a nosotros” repeats the me, te or nos for emphasis or contrast, like “as for me”. The sentence is complete without it.'
where id = '2fa1e861-3cac-52c7-99a5-b2f3e7cf3f1e' and es = '¿Te echaron a vos también?' and en = 'Did they fire you too?'
  and not (es_alt && array['¿Te echaron también?', '¿También te echaron?']::text[]);

update public.sentences set es_alt = es_alt || array['Te encanta el fútbol, a mí no.']::text[], note_en = '“A mí”, “a vos” or “a nosotros” repeats the me, te or nos for emphasis or contrast, like “as for me”. The sentence is complete without it.'
where id = '6a252d1e-d8b5-571b-a73e-5571c4871c70' and es = 'A vos te encanta el fútbol, a mí no.' and en = 'You love soccer, I don''t.'
  and not (es_alt && array['Te encanta el fútbol, a mí no.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te gusta? Cada loco con su tema.']::text[], note_en = '“A mí”, “a vos” or “a nosotros” repeats the me, te or nos for emphasis or contrast, like “as for me”. The sentence is complete without it.'
where id = 'dfbd3fc6-5f6f-55cd-9d2c-4562e32e1642' and es = '¿A vos te gusta? Cada loco con su tema.' and en = 'You like it? To each their own.'
  and not (es_alt && array['¿Te gusta? Cada loco con su tema.']::text[]);

update public.sentences set es_alt = es_alt || array['Si te parece bien, a mí me da igual.', 'Si a vos te parece bien, me da igual.', 'Si te parece bien, me da igual.']::text[], note_en = '“A mí”, “a vos” or “a nosotros” repeats the me, te or nos for emphasis or contrast, like “as for me”. The sentence is complete without it.'
where id = '9414cea1-edad-5699-8319-ff2f15345a01' and es = 'Si a vos te parece bien, a mí me da igual.' and en = 'If it''s fine with you, it''s all the same to me.'
  and not (es_alt && array['Si te parece bien, a mí me da igual.', 'Si a vos te parece bien, me da igual.', 'Si te parece bien, me da igual.']::text[]);

update public.sentences set es_alt = es_alt || array['Llamo al técnico, no sé arreglar el aire.', 'No sé arreglar el aire, llamo al técnico.']::text[]
where id = '143363ab-9881-5b3f-afbd-fb583e049602' and es = 'Llamo al técnico, yo no sé arreglar el aire.' and en = 'I''m calling the repairman, I don''t know how to fix the air conditioning.'
  and not (es_alt && array['Llamo al técnico, no sé arreglar el aire.', 'No sé arreglar el aire, llamo al técnico.']::text[]);

update public.sentences set es_alt = es_alt || array['—No bailo. —Yo tampoco.']::text[]
where id = '1f39bb8d-78f9-5962-942b-09176123b0af' and es = '—Yo no bailo. —Yo tampoco.' and en = '—I don''t dance. —Me neither.'
  and not (es_alt && array['—No bailo. —Yo tampoco.']::text[]);

update public.sentences set es_alt = es_alt || array['No voy, pero ¿vos irías con Ana?', 'No voy, pero ¿irías con Ana?']::text[]
where id = '4a7070b1-a03c-512b-820e-e711c6908a6c' and es = 'Yo no voy, pero ¿vos irías con Ana?' and en = 'I''m not going, but would you go with Ana?'
  and not (es_alt && array['No voy, pero ¿vos irías con Ana?', 'No voy, pero ¿irías con Ana?']::text[]);

update public.sentences set es_alt = es_alt || array['No sé, ¿y vos?']::text[]
where id = '5338434c-adb9-5d81-8cce-c6f87a09be0f' and es = 'Yo no sé, ¿y vos?' and en = 'I don''t know, do you?'
  and not (es_alt && array['No sé, ¿y vos?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Y no me merezco nada?']::text[]
where id = '5fb352f5-5a3c-533e-a28f-1381f8e50505' and es = '¿Y yo no me merezco nada?' and en = 'And I don''t deserve anything?'
  and not (es_alt && array['¿Y no me merezco nada?']::text[]);

update public.sentences set es_alt = es_alt || array['La presidenta habló, pero no la escuché.']::text[]
where id = '6a517d41-07d3-535d-89b2-e207963bdad3' and es = 'La presidenta habló, pero yo no la escuché.' and en = 'The president spoke, but I didn''t hear her.'
  and not (es_alt && array['La presidenta habló, pero no la escuché.']::text[]);

update public.sentences set es_alt = es_alt || array['No pregunté nada.']::text[]
where id = '7d0ecdc6-2d42-568d-8732-b3369cc8d691' and es = 'Yo no pregunté nada.' and en = 'I didn''t ask anything.'
  and not (es_alt && array['No pregunté nada.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Pedís vos? No hablo bien castellano.', '¿Vos pedís? No hablo bien castellano.', '¿Pedís? No hablo bien castellano.']::text[]
where id = 'ea296d1b-3d91-52c9-901b-935d28287400' and es = '¿Pedís vos? Yo no hablo bien castellano.' and en = 'Will you order? I don''t speak Spanish well.'
  and not (es_alt && array['¿Pedís vos? No hablo bien castellano.', '¿Vos pedís? No hablo bien castellano.', '¿Pedís? No hablo bien castellano.']::text[]);

update public.sentences set es_alt = es_alt || array['No ahorro, gasto.']::text[]
where id = 'f6133ae8-541e-5921-98aa-912f5f443561' and es = 'Yo no ahorro, gasto.' and en = 'I don''t save, I spend.'
  and not (es_alt && array['No ahorro, gasto.']::text[]);

update public.sentences set es_alt = es_alt || array['Hubiera dicho que sí.']::text[]
where id = '3a8d4335-77c5-5a7a-8ff5-d15aa50c9c4e' and es = 'Yo hubiera dicho que sí.' and en = 'I would have said yes.'
  and not (es_alt && array['Hubiera dicho que sí.']::text[]);

update public.sentences set es_alt = es_alt || array['Viajaría en avión, no en micro.']::text[]
where id = '6561a18f-b36b-527c-a19c-6fdc53790da3' and es = 'Yo viajaría en avión, no en micro.' and en = 'I''d travel by plane, not by bus.'
  and not (es_alt && array['Viajaría en avión, no en micro.']::text[]);

update public.sentences set es_alt = es_alt || array['¿La tele? La pondría en el living.']::text[]
where id = '9817f2f9-17f0-5542-9cdf-a8e078e779d7' and es = '¿La tele? Yo la pondría en el living.' and en = 'The TV? I''d put it in the living room.'
  and not (es_alt && array['¿La tele? La pondría en el living.']::text[]);

update public.sentences set es_alt = es_alt || array['Te hubiera avisado antes.']::text[]
where id = 'b5347cc4-de51-5aa7-888b-1799ba3ebff7' and es = 'Yo te hubiera avisado antes.' and en = 'I would have let you know sooner.'
  and not (es_alt && array['Te hubiera avisado antes.']::text[]);

update public.sentences set es_alt = es_alt || array['Caminaba por el parque.']::text[]
where id = 'bc627a6a-04f8-5bf3-bdbe-82b83889ef78' and es = 'Yo caminaba por el parque.' and en = 'I was walking through the park.'
  and not (es_alt && array['Caminaba por el parque.']::text[]);

update public.sentences set es_alt = es_alt || array['Hubiera pensado lo mismo.']::text[]
where id = 'e1c0487d-ef13-5077-85d7-be8c237fe706' and es = 'Yo hubiera pensado lo mismo.' and en = 'I would have thought the same.'
  and not (es_alt && array['Hubiera pensado lo mismo.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenía un montón de repetidas, ¿te acordás?', 'Tenía un montón de repetidas, ¿vos te acordás?']::text[]
where id = 'ffa4b6ea-53c0-5b3c-959b-d00fbc8a684a' and es = 'Yo tenía un montón de repetidas, ¿te acordás?' and en = 'I had a ton of doubles, remember?'
  and not (es_alt && array['Tenía un montón de repetidas, ¿te acordás?', 'Tenía un montón de repetidas, ¿vos te acordás?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi padrino falleció cuando tenía quince años.', 'Cuando tenía quince años, falleció mi padrino.', 'Cuando tenía quince años, mi padrino falleció.', 'Falleció mi padrino cuando tenía quince años.']::text[]
where id = 'bba0f962-c39a-5f4e-ad2a-a09e36cade39' and es = 'Mi padrino falleció cuando yo tenía quince años.' and en = 'My godfather passed away when I was fifteen years old.'
  and not (es_alt && array['Mi padrino falleció cuando tenía quince años.', 'Cuando tenía quince años, falleció mi padrino.', 'Cuando tenía quince años, mi padrino falleció.', 'Falleció mi padrino cuando tenía quince años.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuelo se murió cuando tenía diez años.', 'Cuando tenía diez años, se murió mi abuelo.', 'Cuando tenía diez años, mi abuelo se murió.', 'Se murió mi abuelo cuando tenía diez años.']::text[]
where id = 'e7e543ff-f9d3-5926-a926-7f2576b91b5f' and es = 'Mi abuelo se murió cuando yo tenía diez años.' and en = 'My grandfather died when I was ten years old.'
  and not (es_alt && array['Mi abuelo se murió cuando tenía diez años.', 'Cuando tenía diez años, se murió mi abuelo.', 'Cuando tenía diez años, mi abuelo se murió.', 'Se murió mi abuelo cuando tenía diez años.']::text[]);

update public.sentences set es_alt = es_alt || array['No fui yo, no rompí nada.']::text[]
where id = '4927ff22-c0da-58e8-a857-0f442395a383' and es = 'No fui yo, yo no rompí nada.' and en = 'It wasn''t me, I didn''t break anything.'
  and not (es_alt && array['No fui yo, no rompí nada.']::text[]);

update public.sentences set es_alt = es_alt || array['No sabemos nada, hablá con Nico.']::text[]
where id = '0fc1b179-61ab-5bd7-b4fb-e777e8b24232' and es = 'Nosotros no sabemos nada, hablá con Nico.' and en = 'We don''t know anything, talk to Nico.'
  and not (es_alt && array['No sabemos nada, hablá con Nico.']::text[]);

update public.sentences set es_alt = es_alt || array['No es argentina, es inglesa.']::text[]
where id = '1f4a4204-36f7-5d65-8851-c85a5e32fc2b' and es = 'Ella no es argentina, es inglesa.' and en = 'She isn''t Argentinian, she''s English.'
  and not (es_alt && array['No es argentina, es inglesa.']::text[]);

update public.sentences set es_alt = es_alt || array['No dijo nada.']::text[]
where id = '64495a7e-6e9c-5f12-8657-22d2fc2a1d59' and es = 'Ella no dijo nada.' and en = 'She didn''t say anything.'
  and not (es_alt && array['No dijo nada.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Callate! ¿Y no sospechaba nada?']::text[]
where id = 'a053131b-7df8-551b-b80d-d67d97dcc20c' and es = '¡Callate! ¿Y ella no sospechaba nada?' and en = 'No way! And she didn''t suspect a thing?'
  and not (es_alt && array['¡Callate! ¿Y no sospechaba nada?']::text[]);

update public.sentences set es_alt = es_alt || array['No es mi hija, es mi sobrina.']::text[]
where id = 'df628549-aba7-5d58-91dd-59f7b6abaea0' and es = 'Ella no es mi hija, es mi sobrina.' and en = 'She''s not my daughter, she''s my niece.'
  and not (es_alt && array['No es mi hija, es mi sobrina.']::text[]);

update public.sentences set es_alt = es_alt || array['No, no sos Juan.']::text[]
where id = '26a95d56-aed9-5b06-b8c3-97cb398f5f17' and es = 'No, vos no sos Juan.' and en = 'No, you''re not Juan.'
  and not (es_alt && array['No, no sos Juan.']::text[]);

update public.sentences set es_alt = es_alt || array['Estábamos esperando y no venías más.']::text[]
where id = '6c493ba8-1dbb-591f-af08-65f1db0649ed' and es = 'Estábamos esperando y vos no venías más.' and en = 'We were waiting and you were taking forever.'
  and not (es_alt && array['Estábamos esperando y no venías más.']::text[]);

update public.sentences set es_alt = es_alt || array['Che, ¿no tenías un perro negro?', '¿No tenías un perro negro?']::text[]
where id = '9acfb82c-162b-5e3c-8c41-e03f05ef1173' and es = 'Che, ¿vos no tenías un perro negro?' and en = 'Hey, didn''t you have a black dog?'
  and not (es_alt && array['Che, ¿no tenías un perro negro?', '¿No tenías un perro negro?']::text[]);

update public.sentences set es_alt = es_alt || array['No es mi novio, es mi marido.']::text[]
where id = '3dba52d2-3e51-500d-bc7f-219247ac11ff' and es = 'Él no es mi novio, es mi marido.' and en = 'He''s not my boyfriend, he''s my husband.'
  and not (es_alt && array['No es mi novio, es mi marido.']::text[]);

update public.sentences set es_alt = es_alt || array['No es un amigo, es un conocido.']::text[]
where id = 'f007d534-a51c-572f-8977-6df920475fcc' and es = 'Él no es un amigo, es un conocido.' and en = 'He''s not a friend, he''s an acquaintance.'
  and not (es_alt && array['No es un amigo, es un conocido.']::text[]);

update public.sentences set es_alt = es_alt || array['No fueron.']::text[]
where id = '44e178de-41c9-5517-b570-3f90a334101a' and es = 'Ellas no fueron.' and en = 'They didn''t go.'
  and not (es_alt && array['No fueron.']::text[]);

update public.sentences set es_alt = es_alt || array['En invierno, el sol de la tarde es lo mejor.', 'El sol de la tarde es lo mejor en invierno.']::text[], note_en = 'The ending -ito or -ita makes a word smaller or warmer: “cafecito” is a friendly “café”. Argentines use it all the time, and the plain word is right too.'
where id = '12a976f3-72ce-5704-a9df-7231179ab4ae' and es = 'En invierno, el solcito de la tarde es lo mejor.' and en = 'In winter, the afternoon sun is the best thing.'
  and not (es_alt && array['En invierno, el sol de la tarde es lo mejor.', 'El sol de la tarde es lo mejor en invierno.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Querés un té caliente antes de salir?', '¿Vos querés un té caliente antes de salir?', '¿Antes de salir querés un té caliente?']::text[], note_en = 'The ending -ito or -ita makes a word smaller or warmer: “cafecito” is a friendly “café”. Argentines use it all the time, and the plain word is right too.'
where id = '1bbdf71d-7455-5383-8c49-7e1ba7307c5c' and es = '¿Querés un té calentito antes de salir?' and en = 'Do you want a hot tea before going out?'
  and not (es_alt && array['¿Querés un té caliente antes de salir?', '¿Vos querés un té caliente antes de salir?', '¿Antes de salir querés un té caliente?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Hay sol hoy?', '¿Hoy hay sol?']::text[], note_en = 'The ending -ito or -ita makes a word smaller or warmer: “cafecito” is a friendly “café”. Argentines use it all the time, and the plain word is right too.'
where id = '7ab91847-e2bc-5302-b55e-260be89257af' and es = '¿Hay solcito hoy?' and en = 'Is it sunny today?'
  and not (es_alt && array['¿Hay sol hoy?', '¿Hoy hay sol?']::text[]);

update public.sentences set es_alt = es_alt || array['Con el frío que hace, un café viene bárbaro.', 'Con el frío que hace, viene bárbaro un café.', 'Un café viene bárbaro con el frío que hace.']::text[], note_en = 'The ending -ito or -ita makes a word smaller or warmer: “cafecito” is a friendly “café”. Argentines use it all the time, and the plain word is right too.'
where id = '91923303-502a-5f9c-bf03-6d0f0d4e53a6' and es = 'Con el frío que hace, un cafecito viene bárbaro.' and en = 'With how cold it is, a coffee would be great.'
  and not (es_alt && array['Con el frío que hace, un café viene bárbaro.', 'Con el frío que hace, viene bárbaro un café.', 'Un café viene bárbaro con el frío que hace.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés tiempo para un café?', '¿Vos tenés tiempo para un café?']::text[], note_en = 'The ending -ito or -ita makes a word smaller or warmer: “cafecito” is a friendly “café”. Argentines use it all the time, and the plain word is right too.'
where id = '9d97dadf-c4d6-50ab-8352-f732010d18c6' and es = '¿Tenés tiempo para un cafecito?' and en = 'Do you have time for a coffee?'
  and not (es_alt && array['¿Tenés tiempo para un café?', '¿Vos tenés tiempo para un café?']::text[]);

update public.sentences set es_alt = es_alt || array['Salió el sol.']::text[], note_en = 'The ending -ito or -ita makes a word smaller or warmer: “cafecito” is a friendly “café”. Argentines use it all the time, and the plain word is right too.'
where id = 'a9ac1cac-8598-5ad1-ad96-a00b52b8a529' and es = 'Salió el solcito.' and en = 'The sun came out.'
  and not (es_alt && array['Salió el sol.']::text[]);

update public.sentences set es_alt = es_alt || array['El gato está al sol.']::text[], note_en = 'The ending -ito or -ita makes a word smaller or warmer: “cafecito” is a friendly “café”. Argentines use it all the time, and the plain word is right too.'
where id = 'aff25827-7f76-5ed4-9362-e63f4f37e46e' and es = 'El gato está al solcito.' and en = 'The cat is out in the sun.'
  and not (es_alt && array['El gato está al sol.']::text[]);

update public.sentences set es_alt = es_alt || array['Te invito un café.', 'Yo te invito un café.']::text[], note_en = 'The ending -ito or -ita makes a word smaller or warmer: “cafecito” is a friendly “café”. Argentines use it all the time, and the plain word is right too.'
where id = 'ca12c535-1347-55eb-b764-1b64cf7852de' and es = 'Te invito un cafecito.' and en = 'I''ll buy you a coffee.'
  and not (es_alt && array['Te invito un café.', 'Yo te invito un café.']::text[]);

update public.sentences set es_alt = es_alt || array['Me encanta este fresco.', 'Este fresco me encanta.']::text[], note_en = 'The ending -ito or -ita makes a word smaller or warmer: “cafecito” is a friendly “café”. Argentines use it all the time, and the plain word is right too.'
where id = 'dc7313b0-cd22-566a-b23b-1614c948c0fb' and es = 'Me encanta este fresquito.' and en = 'I love this crisp weather.'
  and not (es_alt && array['Me encanta este fresco.', 'Este fresco me encanta.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuela siempre me esperaba con un chocolate caliente.', 'Mi abuela me esperaba siempre con un chocolate caliente.']::text[], note_en = 'The ending -ito or -ita makes a word smaller or warmer: “cafecito” is a friendly “café”. Argentines use it all the time, and the plain word is right too.'
where id = 'dd687d08-0daf-53e5-b648-fb04b9db5c42' and es = 'Mi abuela siempre me esperaba con un chocolate calentito.' and en = 'My grandma always waited for me with a hot chocolate.'
  and not (es_alt && array['Mi abuela siempre me esperaba con un chocolate caliente.', 'Mi abuela me esperaba siempre con un chocolate caliente.']::text[]);

update public.sentences set es_alt = es_alt || array['Salió el sol.', 'El sol salió.']::text[], note_en = 'The ending -ito or -ita makes a word smaller or warmer: “cafecito” is a friendly “café”. Argentines use it all the time, and the plain word is right too.'
where id = 'ea86495d-d2a3-5b90-99ad-fd3977f60a75' and es = 'Salió el solcito.' and en = 'The sun came out.'
  and not (es_alt && array['Salió el sol.', 'El sol salió.']::text[]);

update public.sentences set es_alt = es_alt || array['Con este sol, ¿salimos al balcón?']::text[], note_en = 'The ending -ito or -ita makes a word smaller or warmer: “cafecito” is a friendly “café”. Argentines use it all the time, and the plain word is right too.'
where id = 'f2dec255-5d8c-5506-ae42-71549ad9a42c' and es = 'Con este solcito, ¿salimos al balcón?' and en = 'With this sunshine, should we go out on the balcony?'
  and not (es_alt && array['Con este sol, ¿salimos al balcón?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Un café, vecina?', 'Vecina, ¿un café?']::text[], note_en = 'The ending -ito or -ita makes a word smaller or warmer: “cafecito” is a friendly “café”. Argentines use it all the time, and the plain word is right too.'
where id = 'f5c00693-8ac4-5894-8cc1-10910602c761' and es = '¿Un cafecito, vecina?' and en = 'A coffee, neighbor?'
  and not (es_alt && array['¿Un café, vecina?', 'Vecina, ¿un café?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hermano tiene once.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '01431a00-cb7d-52fe-ad69-646ea4d49471' and es = 'Mi hermano tiene once años.' and en = 'My brother is eleven.'
  and not (es_alt && array['Mi hermano tiene once.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cami tiene seis?']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '06fcdfe0-3bb6-54f2-91a3-d1074a12d095' and es = 'Che, ¿Cami tiene seis años?' and en = 'Hey, is Cami six?'
  and not (es_alt && array['¿Cami tiene seis?']::text[]);

update public.sentences set es_alt = es_alt || array['Conseguí laburo a los cuarenta: más vale tarde que nunca.', 'Yo conseguí laburo a los cuarenta: más vale tarde que nunca.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '0a051b4a-45bb-53c5-9cd1-55f27c8349b9' and es = 'Conseguí laburo a los cuarenta años: más vale tarde que nunca.' and en = 'I got a job at forty: better late than never.'
  and not (es_alt && array['Conseguí laburo a los cuarenta: más vale tarde que nunca.', 'Yo conseguí laburo a los cuarenta: más vale tarde que nunca.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuela vino de Uruguay cuando tenía veinte.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '0c4dc385-8d6f-5bae-b9f9-4849c9330b7c' and es = 'Mi abuela vino de Uruguay cuando tenía veinte años.' and en = 'My grandma came from Uruguay when she was twenty.'
  and not (es_alt && array['Mi abuela vino de Uruguay cuando tenía veinte.']::text[]);

update public.sentences set es_alt = es_alt || array['Belén es mi tía, pero tiene veinte.', 'Belén es mi tía, pero ella tiene veinte.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '0d8c5d7b-c0a5-5566-bb09-4d385b9adad8' and es = 'Belén es mi tía, pero tiene veinte años.' and en = 'Belén is my aunt, but she''s twenty.'
  and not (es_alt && array['Belén es mi tía, pero tiene veinte.', 'Belén es mi tía, pero ella tiene veinte.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuelo aprendió a bailar a los setenta.', 'A los setenta mi abuelo aprendió a bailar.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '0db12df3-7e20-5166-bda5-16a728a5f276' and es = 'Mi abuelo aprendió a bailar a los setenta años.' and en = 'My grandfather learned to dance at seventy.'
  and not (es_alt && array['Mi abuelo aprendió a bailar a los setenta.', 'A los setenta mi abuelo aprendió a bailar.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hija tiene quince.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '10a14177-faae-5267-aaef-0ae07458e726' and es = 'Mi hija tiene quince años.' and en = 'My daughter is fifteen.'
  and not (es_alt && array['Mi hija tiene quince.']::text[]);

update public.sentences set es_alt = es_alt || array['Si tuviera veinte otra vez, iría más al boliche.', 'Iría más al boliche si tuviera veinte otra vez.', 'Si tuviera veinte otra vez, iría al boliche más.', 'Si tuviera otra vez veinte, iría más al boliche.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '11f4612c-8fcc-5057-b006-cddb5646c6f6' and es = 'Si tuviera veinte años otra vez, iría más al boliche.' and en = 'If I were twenty again, I''d go to the nightclub more.'
  and not (es_alt && array['Si tuviera veinte otra vez, iría más al boliche.', 'Iría más al boliche si tuviera veinte otra vez.', 'Si tuviera veinte otra vez, iría al boliche más.', 'Si tuviera otra vez veinte, iría más al boliche.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi sobrina tiene once.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '13782222-c883-5832-85ac-6cabb7949bda' and es = 'Mi sobrina tiene once años.' and en = 'My niece is eleven.'
  and not (es_alt && array['Mi sobrina tiene once.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuelo es grande, tiene noventa.', 'Mi abuelo es grande, él tiene noventa.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '167123d3-8615-5697-a599-55d6918fc0de' and es = 'Mi abuelo es grande, tiene noventa años.' and en = 'My grandfather is old, he''s ninety.'
  and not (es_alt && array['Mi abuelo es grande, tiene noventa.', 'Mi abuelo es grande, él tiene noventa.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Tiene diez? —No, nueve.', '—¿Él tiene diez? —No, nueve.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '1795bd35-2238-5cf4-b572-ae41e8dc8689' and es = '—¿Tiene diez años? —No, nueve.' and en = '—Is he ten? —No, nine.'
  and not (es_alt && array['—¿Tiene diez? —No, nueve.', '—¿Él tiene diez? —No, nueve.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Vos tenés dieciocho? —Sí, claro.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '1ebc4d17-5f4e-53de-a041-8cf1cb852433' and es = '—¿Tenés dieciocho años? —Sí, claro.' and en = '—Are you eighteen? —Yes, of course.'
  and not (es_alt && array['—¿Vos tenés dieciocho? —Sí, claro.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hijo tiene dos.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '2006a25f-58e0-510d-bbb9-f865d4252383' and es = 'Mi hijo tiene dos años.' and en = 'My son is two.'
  and not (es_alt && array['Mi hijo tiene dos.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Mi sobrino? Es alto, tiene quince.', '¿Mi sobrino? Es alto, él tiene quince.', '¿Mi sobrino? Él es alto, tiene quince.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '2053b7ef-25e3-566c-8f23-d1f4b4d34b8e' and es = '¿Mi sobrino? Es alto, tiene quince años.' and en = 'My nephew? He''s tall, he''s fifteen.'
  and not (es_alt && array['¿Mi sobrino? Es alto, tiene quince.', '¿Mi sobrino? Es alto, él tiene quince.', '¿Mi sobrino? Él es alto, tiene quince.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi prima tiene diecisiete, ella es estudiante.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '21e36a27-aa20-5d13-afe0-5958ad202386' and es = 'Mi prima tiene diecisiete años, es estudiante.' and en = 'My cousin is seventeen, she''s a student.'
  and not (es_alt && array['Mi prima tiene diecisiete, ella es estudiante.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hijo ya tiene casi diez.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '24a03b13-88e3-52c1-ac9e-da8e93fa93d6' and es = 'Mi hijo ya tiene casi diez años.' and en = 'My son is almost ten already.'
  and not (es_alt && array['Mi hijo ya tiene casi diez.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando tenías veinte, ¿dónde vivías?', 'Cuando vos tenías veinte, ¿dónde vivías?', '¿Dónde vivías cuando tenías veinte?', '¿Dónde vivías cuando vos tenías veinte?']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '289772ff-8fe3-5cb0-9dd5-7238957caf15' and es = 'Cuando tenías veinte años, ¿dónde vivías?' and en = 'When you were twenty, where did you live?'
  and not (es_alt && array['Cuando tenías veinte, ¿dónde vivías?', 'Cuando vos tenías veinte, ¿dónde vivías?', '¿Dónde vivías cuando tenías veinte?', '¿Dónde vivías cuando vos tenías veinte?']::text[]);

update public.sentences set es_alt = es_alt || array['Los mellizos tienen doce.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '2c36d998-d178-5052-8547-af8557a29f7a' and es = 'Los mellizos tienen doce años.' and en = 'The twins are twelve.'
  and not (es_alt && array['Los mellizos tienen doce.']::text[]);

update public.sentences set es_alt = es_alt || array['Nosotras tenemos veinte y Mica tiene dieciocho.', 'Tenemos veinte y Mica tiene dieciocho.', 'Nosotras tenemos veinte y Mica dieciocho.', 'Tenemos veinte y Mica dieciocho.', 'Nosotros tenemos veinte y Mica tiene dieciocho.', 'Nosotros tenemos veinte y Mica dieciocho.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '2f04d3eb-cec2-591d-8e1f-cc2ac35bf7fa' and es = 'Nosotras tenemos veinte años y Mica tiene dieciocho.' and en = 'We''re twenty and Mica is eighteen.'
  and not (es_alt && array['Nosotras tenemos veinte y Mica tiene dieciocho.', 'Tenemos veinte y Mica tiene dieciocho.', 'Nosotras tenemos veinte y Mica dieciocho.', 'Tenemos veinte y Mica dieciocho.', 'Nosotros tenemos veinte y Mica tiene dieciocho.', 'Nosotros tenemos veinte y Mica dieciocho.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy cansado porque mi hijo tiene dos.', 'Yo estoy cansado porque mi hijo tiene dos.', 'Estoy cansada porque mi hijo tiene dos.', 'Yo estoy cansada porque mi hijo tiene dos.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '2fdc15fa-c786-5bf0-ab36-981ff4423c3a' and es = 'Estoy cansado porque mi hijo tiene dos años.' and en = 'I''m tired because my son is two.'
  and not (es_alt && array['Estoy cansado porque mi hijo tiene dos.', 'Yo estoy cansado porque mi hijo tiene dos.', 'Estoy cansada porque mi hijo tiene dos.', 'Yo estoy cansada porque mi hijo tiene dos.']::text[]);

update public.sentences set es_alt = es_alt || array['Belén tiene trece y ella es de Rosario.', 'Belén es de Rosario y ella tiene trece.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '3faa16bb-b5d1-5f05-84d9-a161f9a3f41a' and es = 'Belén tiene trece años y es de Rosario.' and en = 'Belén is thirteen and she''s from Rosario.'
  and not (es_alt && array['Belén tiene trece y ella es de Rosario.', 'Belén es de Rosario y ella tiene trece.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi novio tiene veinte.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '405694dc-77a9-5617-b8f3-07ce00fe4c5b' and es = 'Mi novio tiene veinte años.' and en = 'My boyfriend is twenty.'
  and not (es_alt && array['Mi novio tiene veinte.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi sobrino tiene doce.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '4819026b-a656-5541-9594-555421476596' and es = 'Mi sobrino tiene doce años.' and en = 'My nephew is twelve.'
  and not (es_alt && array['Mi sobrino tiene doce.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tiene cinco?']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '48e9d300-babe-526a-b4c7-bc9d5fd9bcf5' and es = '¿Tiene cinco años?' and en = 'Is he five?'
  and not (es_alt && array['¿Tiene cinco?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hija tiene cinco y mi hijo, ocho.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '4f975aa9-11c2-5ce1-8619-a55fcaf0b640' and es = 'Mi hija tiene cinco años y mi hijo, ocho.' and en = 'My daughter is five and my son is eight.'
  and not (es_alt && array['Mi hija tiene cinco y mi hijo, ocho.']::text[]);

update public.sentences set es_alt = es_alt || array['Ellos tienen veinte y su hermana tiene doce.', 'Tienen veinte y su hermana tiene doce.', 'Ellos tienen veinte y su hermana doce.', 'Tienen veinte y su hermana doce.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '56f1b37f-e603-50e2-9522-8ea308c48a91' and es = 'Ellos tienen veinte años y su hermana tiene doce.' and en = 'They''re twenty and their sister is twelve.'
  and not (es_alt && array['Ellos tienen veinte y su hermana tiene doce.', 'Tienen veinte y su hermana tiene doce.', 'Ellos tienen veinte y su hermana doce.', 'Tienen veinte y su hermana doce.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando tenía ocho, iba a la escuela solo.', 'Iba a la escuela solo cuando tenía ocho.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '57073bd6-fa86-592b-8b2e-e544196772f1' and es = 'Cuando tenía ocho años, iba a la escuela solo.' and en = 'When I was eight, I used to go to school on my own.'
  and not (es_alt && array['Cuando tenía ocho, iba a la escuela solo.', 'Iba a la escuela solo cuando tenía ocho.']::text[]);

update public.sentences set es_alt = es_alt || array['Sí, señora, yo tengo diecisiete.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '57f86ebd-bd7d-58a3-9ec3-79f941675203' and es = 'Sí, señora, tengo diecisiete años.' and en = 'Yes, ma''am, I''m seventeen.'
  and not (es_alt && array['Sí, señora, yo tengo diecisiete.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi perro tiene cuatro.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '592af985-4a22-50de-8016-ecdf04eea034' and es = 'Mi perro tiene cuatro años.' and en = 'My dog is four.'
  and not (es_alt && array['Mi perro tiene cuatro.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Diego tiene diez?', '¿Tiene diez Diego?']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '5e3fa2f4-6139-50f4-a064-addb46785602' and es = '¿Diego tiene diez años?' and en = 'Is Diego ten?'
  and not (es_alt && array['¿Diego tiene diez?', '¿Tiene diez Diego?']::text[]);

update public.sentences set es_alt = es_alt || array['Si mi abuelo viviera, tendría cien.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '5f9a7b9e-13c3-5a63-b755-f8e739ffe9ab' and es = 'Si mi abuelo viviera, tendría cien años.' and en = 'If my grandpa were alive, he''d be a hundred.'
  and not (es_alt && array['Si mi abuelo viviera, tendría cien.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando tenías diez, ¿dónde vivías?', 'Cuando vos tenías diez, ¿dónde vivías?', '¿Dónde vivías cuando tenías diez?', '¿Dónde vivías cuando vos tenías diez?']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '636ac911-ad8a-540f-b717-aab5742880bb' and es = 'Cuando tenías diez años, ¿dónde vivías?' and en = 'When you were ten, where did you live?'
  and not (es_alt && array['Cuando tenías diez, ¿dónde vivías?', 'Cuando vos tenías diez, ¿dónde vivías?', '¿Dónde vivías cuando tenías diez?', '¿Dónde vivías cuando vos tenías diez?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hija tiene diez.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '6bc9605d-e266-5018-ace5-35482fda3c41' and es = 'Mi hija tiene diez años.' and en = 'My daughter is ten.'
  and not (es_alt && array['Mi hija tiene diez.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Belén tiene siete?', '¿Tiene siete Belén?']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '73447b92-d791-55f9-9b55-0341032146e7' and es = '¿Belén tiene siete años?' and en = 'Is Belén seven?'
  and not (es_alt && array['¿Belén tiene siete?', '¿Tiene siete Belén?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Vos tenés diecisiete o dieciocho?']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '736a0d8a-25e9-57c2-93bc-7259aefc02c2' and es = '¿Tenés diecisiete o dieciocho años?' and en = 'Are you seventeen or eighteen?'
  and not (es_alt && array['¿Vos tenés diecisiete o dieciocho?']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Quién vino primero? —Mi bisabuelo, con quince.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '77d23c11-5691-5b70-a8b9-d477352326bf' and es = '—¿Quién vino primero? —Mi bisabuelo, con quince años.' and en = '—Who came first? —My great-grandfather, at fifteen.'
  and not (es_alt && array['—¿Quién vino primero? —Mi bisabuelo, con quince.']::text[]);

update public.sentences set es_alt = es_alt || array['Juli y yo tenemos veinte.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '79497f43-bde9-5e0f-a5bd-f7cd0567109b' and es = 'Juli y yo tenemos veinte años.' and en = 'Juli and I are twenty.'
  and not (es_alt && array['Juli y yo tenemos veinte.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo catorce y mi hermano tiene diez.', 'Yo tengo catorce y mi hermano tiene diez.', 'Tengo catorce y mi hermano diez.', 'Yo tengo catorce y mi hermano diez.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '7e3eed90-c2d6-597e-88ce-18956b136d6b' and es = 'Tengo catorce años y mi hermano tiene diez.' and en = 'I''m fourteen and my brother is ten.'
  and not (es_alt && array['Tengo catorce y mi hermano tiene diez.', 'Yo tengo catorce y mi hermano tiene diez.', 'Tengo catorce y mi hermano diez.', 'Yo tengo catorce y mi hermano diez.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi sobrino tiene nueve y sabe inglés.', 'Mi sobrino tiene nueve y él sabe inglés.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '7f8e65aa-2ecb-5e2b-803c-ff38526db221' and es = 'Mi sobrino tiene nueve años y sabe inglés.' and en = 'My nephew is nine and he knows English.'
  and not (es_alt && array['Mi sobrino tiene nueve y sabe inglés.', 'Mi sobrino tiene nueve y él sabe inglés.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cómo eras cuando tenías quince?', '¿Cómo eras cuando vos tenías quince?', 'Cuando tenías quince, ¿cómo eras?', 'Cuando vos tenías quince, ¿cómo eras?']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '835e42bc-2d14-53d6-8d64-a5a08c8044dc' and es = '¿Cómo eras cuando tenías quince años?' and en = 'What were you like when you were fifteen?'
  and not (es_alt && array['¿Cómo eras cuando tenías quince?', '¿Cómo eras cuando vos tenías quince?', 'Cuando tenías quince, ¿cómo eras?', 'Cuando vos tenías quince, ¿cómo eras?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hijo tiene dieciocho y es estudiante.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '851b2840-fbb6-504a-98d3-fd24b03d0f7d' and es = 'Mi hijo tiene dieciocho años y es estudiante.' and en = 'My son is eighteen and he''s a student.'
  and not (es_alt && array['Mi hijo tiene dieciocho y es estudiante.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando tenía doce vivía en Montevideo.', 'Vivía en Montevideo cuando tenía doce.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '872ae5cf-c476-5e87-8a78-757036510018' and es = 'Cuando tenía doce años vivía en Montevideo.' and en = 'When I was twelve I lived in Montevideo.'
  and not (es_alt && array['Cuando tenía doce vivía en Montevideo.', 'Vivía en Montevideo cuando tenía doce.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hijo tiene seis.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '894d798e-5999-579b-9978-ddc3dfe0d0d6' and es = 'Mi hijo tiene seis años.' and en = 'My son is six.'
  and not (es_alt && array['Mi hijo tiene seis.']::text[]);

update public.sentences set es_alt = es_alt || array['Ella es Juli y tiene doce.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '8a18ed64-2bfd-5213-82b1-68bdcc10dcba' and es = 'Ella es Juli y tiene doce años.' and en = 'She''s Juli and she''s twelve.'
  and not (es_alt && array['Ella es Juli y tiene doce.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Vos tenés tres? —No, cuatro.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '94cd4a75-65f8-517a-90ab-e912cf9e774a' and es = '—¿Tenés tres años? —No, cuatro.' and en = '—Are you three? —No, four.'
  and not (es_alt && array['—¿Vos tenés tres? —No, cuatro.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo catorce y soy porteña.', 'Tengo catorce y yo soy porteña.', 'Yo tengo catorce y soy porteña.', 'Tengo catorce y soy porteño.', 'Yo tengo catorce y soy porteño.', 'Tengo catorce y yo soy porteño.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '959dbbb4-4ef1-5811-87d5-cbbd63ec1b75' and es = 'Tengo catorce años y soy porteña.' and en = 'I''m fourteen and I''m from Buenos Aires.'
  and not (es_alt && array['Tengo catorce y soy porteña.', 'Tengo catorce y yo soy porteña.', 'Yo tengo catorce y soy porteña.', 'Tengo catorce y soy porteño.', 'Yo tengo catorce y soy porteño.', 'Tengo catorce y yo soy porteño.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hija tiene tres.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '985c07cb-b8c5-5119-9399-836e8c3abbd4' and es = 'Mi hija tiene tres años.' and en = 'My daughter is three.'
  and not (es_alt && array['Mi hija tiene tres.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hija tiene siete y mi sobrina, diez.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '985f37c9-8a97-5230-a4ce-a3cb684e7ffb' and es = 'Mi hija tiene siete años y mi sobrina, diez.' and en = 'My daughter is seven and my niece is ten.'
  and not (es_alt && array['Mi hija tiene siete y mi sobrina, diez.']::text[]);

update public.sentences set es_alt = es_alt || array['Yo tengo doce, no soy un bebé.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = '9c529ad5-49c0-5c1d-aae9-03128dc2b1d4' and es = 'Tengo doce años, no soy un bebé.' and en = 'I''m twelve, I''m not a baby.'
  and not (es_alt && array['Yo tengo doce, no soy un bebé.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi novia tiene dieciocho.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = 'a417eac8-0a5f-58c3-8b2d-6e0e174efa84' and es = 'Mi novia tiene dieciocho años.' and en = 'My girlfriend is eighteen.'
  and not (es_alt && array['Mi novia tiene dieciocho.']::text[]);

update public.sentences set es_alt = es_alt || array['Cumplo veinticinco.', 'Yo cumplo veinticinco.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = 'aa318041-aaf7-569f-a0a0-631954a27fab' and es = 'Cumplo veinticinco años.' and en = 'I''m turning twenty-five.'
  and not (es_alt && array['Cumplo veinticinco.', 'Yo cumplo veinticinco.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi perro tiene quince.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = 'ae2d590a-ff2e-5433-a32f-25b892f7eb6a' and es = 'Mi perro tiene quince años.' and en = 'My dog is fifteen.'
  and not (es_alt && array['Mi perro tiene quince.']::text[]);

update public.sentences set es_alt = es_alt || array['Che, ¿vos también tenés veinte?', '¿Vos también tenés veinte?', 'Che, ¿vos tenés veinte también?', 'Che, ¿tenés veinte también?', '¿Vos tenés veinte también?', '¿Tenés veinte también?']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = 'b8d87254-214d-57ef-8bd0-6549cdf303ed' and es = 'Che, ¿vos también tenés veinte años?' and en = 'Hey, are you twenty too?'
  and not (es_alt && array['Che, ¿vos también tenés veinte?', '¿Vos también tenés veinte?', 'Che, ¿vos tenés veinte también?', 'Che, ¿tenés veinte también?', '¿Vos tenés veinte también?', '¿Tenés veinte también?']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando vi el mar por primera vez, tenía cinco.', 'Cuando yo vi el mar por primera vez, tenía cinco.', 'Tenía cinco cuando vi el mar por primera vez.', 'Cuando vi por primera vez el mar, tenía cinco.', 'Tenía cinco cuando yo vi el mar por primera vez.', 'Cuando yo vi por primera vez el mar, tenía cinco.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = 'b9a0d316-9674-56fa-acc9-2896ad719d82' and es = 'Cuando vi el mar por primera vez, tenía cinco años.' and en = 'I was five when I saw the ocean for the first time.'
  and not (es_alt && array['Cuando vi el mar por primera vez, tenía cinco.', 'Cuando yo vi el mar por primera vez, tenía cinco.', 'Tenía cinco cuando vi el mar por primera vez.', 'Cuando vi por primera vez el mar, tenía cinco.', 'Tenía cinco cuando yo vi el mar por primera vez.', 'Cuando yo vi por primera vez el mar, tenía cinco.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo dieciséis y yo soy de Montevideo.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = 'c5efb613-3df1-567d-a1a6-b217bf9e4d87' and es = 'Tengo dieciséis años y soy de Montevideo.' and en = 'I''m sixteen and I''m from Montevideo.'
  and not (es_alt && array['Tengo dieciséis y yo soy de Montevideo.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tiene ocho?']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = 'c76a3fac-a157-5fce-a926-bb63b572f4fd' and es = '¿Tiene ocho años?' and en = 'Is she eight?'
  and not (es_alt && array['¿Tiene ocho?']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando llegué a Buenos Aires, tenía veinte.', 'Cuando yo llegué a Buenos Aires, tenía veinte.', 'Tenía veinte cuando llegué a Buenos Aires.', 'Tenía veinte cuando yo llegué a Buenos Aires.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = 'ca1bf590-a0cd-59df-98f7-c193f6b4dd41' and es = 'Cuando llegué a Buenos Aires, tenía veinte años.' and en = 'When I got to Buenos Aires, I was twenty.'
  and not (es_alt && array['Cuando llegué a Buenos Aires, tenía veinte.', 'Cuando yo llegué a Buenos Aires, tenía veinte.', 'Tenía veinte cuando llegué a Buenos Aires.', 'Tenía veinte cuando yo llegué a Buenos Aires.']::text[]);

update public.sentences set es_alt = es_alt || array['Soy joven, tengo diecinueve.', 'Soy joven, yo tengo diecinueve.', 'Yo soy joven, tengo diecinueve.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = 'e2691c0c-1aab-528f-ba2a-953a64c66091' and es = 'Soy joven, tengo diecinueve años.' and en = 'I''m young, I''m nineteen.'
  and not (es_alt && array['Soy joven, tengo diecinueve.', 'Soy joven, yo tengo diecinueve.', 'Yo soy joven, tengo diecinueve.']::text[]);

update public.sentences set es_alt = es_alt || array['El arquero de mi equipo tiene cuarenta.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = 'eb574c25-face-550b-8860-d108b63732bc' and es = 'El arquero de mi equipo tiene cuarenta años.' and en = 'My team''s goalkeeper is forty.'
  and not (es_alt && array['El arquero de mi equipo tiene cuarenta.']::text[]);

update public.sentences set es_alt = es_alt || array['Él tiene doce.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = 'efe7e59c-f973-5ca5-8c33-e63f1ec285eb' and es = 'Tiene doce años.' and en = 'He''s twelve.'
  and not (es_alt && array['Él tiene doce.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando tenía quince, me enamoré de mi mejor amigo.', 'Me enamoré de mi mejor amigo cuando tenía quince.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = 'f2f32e68-c26b-5242-b809-e4d6275d8353' and es = 'Cuando tenía quince años, me enamoré de mi mejor amigo.' and en = 'When I was fifteen, I fell in love with my best friend.'
  and not (es_alt && array['Cuando tenía quince, me enamoré de mi mejor amigo.', 'Me enamoré de mi mejor amigo cuando tenía quince.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hija es chica, tiene tres.', 'Mi hija es chica, ella tiene tres.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = 'f5b55504-eb33-58dd-ba75-05102d315585' and es = 'Mi hija es chica, tiene tres años.' and en = 'My daughter is little, she''s three.'
  and not (es_alt && array['Mi hija es chica, tiene tres.', 'Mi hija es chica, ella tiene tres.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hijo tiene cinco y nunca vio el mar.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = 'f6bbe5a0-993f-5f4d-9007-eb27080ec1f3' and es = 'Mi hijo tiene cinco años y nunca vio el mar.' and en = 'My son is five and has never seen the sea.'
  and not (es_alt && array['Mi hijo tiene cinco y nunca vio el mar.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi gata tiene nueve y mi perro, dos.']::text[], note_en = 'Spanish says “tener … años”, to have years. When it is clear you mean age, people often leave “años” out.'
where id = 'f8c94a7f-877a-5031-8605-6ab40c86e424' and es = 'Mi gata tiene nueve años y mi perro, dos.' and en = 'My cat is nine and my dog is two.'
  and not (es_alt && array['Mi gata tiene nueve y mi perro, dos.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde está mi pantalón?', '¿Dónde están mis pantalones?']::text[], note_en = '“¿Y…?” (“And…?”) is a short, everyday way to ask where something is or how it is going.'
where id = '00089420-0c2d-5137-9e32-520715cdae88' and es = '¿Y mi pantalón?' and en = 'Where are my pants?'
  and not (es_alt && array['¿Dónde está mi pantalón?', '¿Dónde están mis pantalones?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde está tu campera?']::text[], note_en = '“¿Y…?” (“And…?”) is a short, everyday way to ask where something is or how it is going.'
where id = '2a5192bd-d984-511c-935e-81d9fbdc7a08' and es = '¿Y tu campera?' and en = 'Where''s your jacket?'
  and not (es_alt && array['¿Dónde está tu campera?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde está mi beso?']::text[], note_en = '“¿Y…?” (“And…?”) is a short, everyday way to ask where something is or how it is going.'
where id = '4cb6970f-1ac1-5757-ae08-a9f56a563f2e' and es = '¿Y mi beso?' and en = 'Where''s my kiss?'
  and not (es_alt && array['¿Dónde está mi beso?']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cómo está la rodilla? —Mucho mejor, gracias.', '—¿Cómo va la rodilla? —Mucho mejor, gracias.']::text[], note_en = '“¿Y…?” (“And…?”) is a short, everyday way to ask where something is or how it is going.'
where id = 'a617b1d4-8329-5f9e-b364-65d4dd33a501' and es = '—¿Y la rodilla? —Mucho mejor, gracias.' and en = '—How''s the knee? —Much better, thanks.'
  and not (es_alt && array['—¿Cómo está la rodilla? —Mucho mejor, gracias.', '—¿Cómo va la rodilla? —Mucho mejor, gracias.']::text[]);

update public.sentences set es_alt = es_alt || array['Che, Cami, ¿vos sos chilena o uruguaya?', 'Che, Cami, ¿sos chilena o uruguaya?', 'Che, Cami, ¿sos chilena o vos uruguaya?', 'Cami, ¿vos sos chilena o uruguaya?', 'Cami, ¿sos chilena o uruguaya?', 'Cami, ¿sos chilena o vos uruguaya?']::text[]
where id = '042fb59b-e735-5971-9066-8f7e69dd5b73' and es = 'Che, Cami, ¿vos sos chilena o sos uruguaya?' and en = 'Hey, Cami, are you Chilean or Uruguayan?'
  and not (es_alt && array['Che, Cami, ¿vos sos chilena o uruguaya?', 'Che, Cami, ¿sos chilena o uruguaya?', 'Che, Cami, ¿sos chilena o vos uruguaya?', 'Cami, ¿vos sos chilena o uruguaya?', 'Cami, ¿sos chilena o uruguaya?', 'Cami, ¿sos chilena o vos uruguaya?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, ¿vos sos inglés o de acá?', 'Che, ¿sos inglés o de acá?', 'Che, ¿sos inglés o vos de acá?', '¿Vos sos inglés o de acá?', '¿Sos inglés o de acá?', '¿Sos inglés o vos de acá?', 'Che, ¿vos sos inglesa o de acá?', 'Che, ¿sos inglesa o de acá?', '¿Vos sos inglesa o de acá?', '¿Sos inglesa o de acá?', 'Che, ¿sos inglesa o vos de acá?', '¿Sos inglesa o vos de acá?']::text[]
where id = '97653940-e283-5567-8cd0-687aab42b92e' and es = 'Che, ¿vos sos inglés o sos de acá?' and en = 'Hey, are you English or from here?'
  and not (es_alt && array['Che, ¿vos sos inglés o de acá?', 'Che, ¿sos inglés o de acá?', 'Che, ¿sos inglés o vos de acá?', '¿Vos sos inglés o de acá?', '¿Sos inglés o de acá?', '¿Sos inglés o vos de acá?', 'Che, ¿vos sos inglesa o de acá?', 'Che, ¿sos inglesa o de acá?', '¿Vos sos inglesa o de acá?', '¿Sos inglesa o de acá?', 'Che, ¿sos inglesa o vos de acá?', '¿Sos inglesa o vos de acá?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Estoy cambiada o igual?', '¿Estoy cambiada o yo igual?', '¿Yo estoy cambiada o igual?', '¿Estoy cambiado o igual?', '¿Yo estoy cambiado o igual?', '¿Estoy cambiado o yo igual?']::text[]
where id = 'c9aeb495-921c-5679-8b01-debcb486cc5f' and es = '¿Estoy cambiada o estoy igual?' and en = 'Do I look different or the same?'
  and not (es_alt && array['¿Estoy cambiada o igual?', '¿Estoy cambiada o yo igual?', '¿Yo estoy cambiada o igual?', '¿Estoy cambiado o igual?', '¿Yo estoy cambiado o igual?', '¿Estoy cambiado o yo igual?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Quién es de acá y quién de afuera?']::text[]
where id = 'e7cd0f3d-f35f-5a6b-aa9a-1c37fb16aae3' and es = '¿Quién es de acá y quién es de afuera?' and en = 'Who''s from here and who''s from out of town?'
  and not (es_alt && array['¿Quién es de acá y quién de afuera?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Quién es de acá y quién de afuera?']::text[]
where id = 'e8c24cea-827b-5739-a816-f4c4b7359948' and es = '¿Quién es de acá y quién es de afuera?' and en = 'Who''s from here and who''s from out of town?'
  and not (es_alt && array['¿Quién es de acá y quién de afuera?']::text[]);

update public.sentences set es_alt = es_alt || array['Quiero un perro.', 'Yo quiero un perro.']::text[]
where id = 'ef192dba-e72b-5eda-ab76-7230c7a50743' and es = 'Quiero tener un perro.' and en = 'I want a dog.'
  and not (es_alt && array['Quiero un perro.', 'Yo quiero un perro.']::text[]);

update public.sentences set es_alt = es_alt || array['Algún día quiero una casa con patio.', 'Quiero una casa con patio algún día.', 'Yo quiero una casa con patio algún día.']::text[]
where id = 'b09fc543-d932-5c64-bfc6-8331a5c723ad' and es = 'Algún día quiero tener una casa con patio.' and en = 'Someday I want a house with a yard.'
  and not (es_alt && array['Algún día quiero una casa con patio.', 'Quiero una casa con patio algún día.', 'Yo quiero una casa con patio algún día.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi billetera está en la mochila.']::text[], note_en = 'Spanish often says “tengo…” (I have) where English says “my … is”.'
where id = '3e368448-ddd5-56e2-8416-f3d5da2f6d02' and es = 'Tengo la billetera en la mochila.' and en = 'My wallet''s in my backpack.'
  and not (es_alt && array['Mi billetera está en la mochila.']::text[]);

update public.sentences set es_alt = es_alt || array['La plata está en mi caja de ahorro.']::text[], note_en = 'Spanish often says “tengo…” (I have) where English says “my … is”.'
where id = '47d0fb36-66f0-5bd4-bd1c-0d802b2ca20e' and es = 'Tengo la plata en la caja de ahorro.' and en = 'The money''s in my savings account.'
  and not (es_alt && array['La plata está en mi caja de ahorro.']::text[]);

update public.sentences set es_alt = es_alt || array['No te llamé porque mi celu está roto.']::text[], note_en = 'Spanish often says “tengo…” (I have) where English says “my … is”.'
where id = '4f053332-66ef-562a-ab05-3a0b04b11bc6' and es = 'No te llamé porque tengo el celu roto.' and en = 'I didn''t call you because my phone''s broken.'
  and not (es_alt && array['No te llamé porque mi celu está roto.']::text[]);

update public.sentences set es_alt = es_alt || array['No pude sacar plata porque mi tarjeta estaba vencida.']::text[], note_en = 'Spanish often says “tengo…” (I have) where English says “my … is”.'
where id = '45566b21-ac28-5d42-8a8d-a91189228aad' and es = 'No pude sacar plata porque tenía la tarjeta vencida.' and en = 'I couldn''t get cash because my card was expired.'
  and not (es_alt && array['No pude sacar plata porque mi tarjeta estaba vencida.']::text[]);

update public.sentences set es_alt = es_alt || array['Me encanta esta zona porque todo está cerca.']::text[], note_en = 'Spanish often says “tengo…” (I have) where English says “my … is”.'
where id = 'd51e5d00-ff1d-55a1-a58a-e0ac4861b69b' and es = 'Me encanta esta zona porque tengo todo cerca.' and en = 'I love this area because everything''s close by.'
  and not (es_alt && array['Me encanta esta zona porque todo está cerca.']::text[]);

update public.sentences set es_alt = es_alt || array['¡La medialuna está rica!']::text[], note_en = 'Spanish exclaims with “¡Qué rico…!”, literally “How tasty…!”'
where id = '24fc73b3-6ae4-5c9e-82b2-fe1d2d359b78' and es = '¡Qué rica la medialuna!' and en = 'The medialuna is delicious!'
  and not (es_alt && array['¡La medialuna está rica!']::text[]);

update public.sentences set es_alt = es_alt || array['¡La torta está rica, doña Ana!']::text[], note_en = 'Spanish exclaims with “¡Qué rico…!”, literally “How tasty…!”'
where id = '503162bc-c805-5e61-a860-e7dc727e4c77' and es = '¡Qué rica la torta, doña Ana!' and en = 'The cake is delicious, Doña Ana!'
  and not (es_alt && array['¡La torta está rica, doña Ana!']::text[]);

update public.sentences set es_alt = es_alt || array['¡El pollo de tu vieja está rico!']::text[], note_en = 'Spanish exclaims with “¡Qué rico…!”, literally “How tasty…!”'
where id = '685ba609-0206-5953-b187-a82023c2f321' and es = '¡Qué rico el pollo de tu vieja!' and en = 'Your mom''s chicken is delicious!'
  and not (es_alt && array['¡El pollo de tu vieja está rico!']::text[]);
