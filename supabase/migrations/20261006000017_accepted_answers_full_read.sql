-- Accepted answers found by reading every published sentence of the course
-- (26,963 of them, 500 to a reader, each proposal judged again by a second
-- reader): Spanish the English prompt allows and the app refused. Two kinds:
-- a word in the written sentence that the English gives no cue for (an
-- article, a diminutive, a linking "que", "ya"), and idiomatic English whose
-- plainer Spanish is just as right ("¿Me podés llevar a casa?" beside
-- "¿Me llevás a casa?"). Every variant passed the sentence checks (vocabulary
-- taught by that unit, voseo, regional words) and was refused by the app's
-- grader before and accepted after.
--
-- Appended, never overwritten: a row whose text changed since, or that already
-- holds one of these answers, is left alone. note_en (20261006000015) says why
-- the written sentence reads the way it does; a note already there is kept.

update public.sentences set es_alt = es_alt || array['—¿Té y torta? —Café y torta, gracias.']::text[]
where id = '26709032-c057-5623-bbde-19b85cd0bfcd' and es = '—¿Un té y torta? —Un café y torta, gracias.' and en = '—Tea and cake? —Coffee and cake, thanks.'
  and not (es_alt && array['—¿Té y torta? —Café y torta, gracias.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Mal, Sofi? ¿Té?']::text[]
where id = '02ba3cf2-53fb-542a-8ffe-56bf94fcdb11' and es = '¿Mal, Sofi? ¿Un té?' and en = 'Not good, Sofi? Some tea?'
  and not (es_alt && array['¿Mal, Sofi? ¿Té?']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Té? —Sí, gracias.']::text[]
where id = 'a8194c57-fccc-5d91-ac23-63e4a6fada38' and es = '—¿Un té? —Sí, gracias.' and en = '—Tea? —Yes, thanks.'
  and not (es_alt && array['—¿Té? —Sí, gracias.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Pizza o un sándwich? —Pizza, joya.']::text[]
where id = 'df2b6855-2ea7-5f47-8e01-d24ffd16cf02' and es = '—¿Pizza o sándwich? —Pizza, joya.' and en = '—Pizza or a sandwich? —Pizza, perfect.'
  and not (es_alt && array['—¿Pizza o un sándwich? —Pizza, joya.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Una medialuna? —Claro, y otro café.']::text[]
where id = '2a812458-0972-5a70-bd79-28983a0a4050' and es = '—¿Medialuna? —Claro, y otro café.' and en = '—A medialuna? —Sure, and another coffee.'
  and not (es_alt && array['—¿Una medialuna? —Claro, y otro café.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Café y una medialuna?']::text[]
where id = '2f36e71f-6bf5-5723-81ca-06887e639a96' and es = '¿Café y medialuna?' and en = 'Coffee and a medialuna?'
  and not (es_alt && array['¿Café y una medialuna?']::text[]);

update public.sentences set es_alt = es_alt || array['No sé, ¿vos sabés?']::text[]
where id = '5338434c-adb9-5d81-8cce-c6f87a09be0f' and es = 'Yo no sé, ¿y vos?' and en = 'I don''t know, do you?'
  and not (es_alt && array['No sé, ¿vos sabés?']::text[]);

update public.sentences set es_alt = es_alt || array['Entiendo muy poco. ¿Me repetís más despacio?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favour with the plain present, “¿Me repetís?”, instead of “¿Podés…?”. It sounds friendly, not bossy.')
where id = '677fdf56-8f4f-597d-9911-6f260c8ca46c' and es = 'Entiendo poco. ¿Me repetís más despacio?' and en = 'I understand very little. Can you repeat that more slowly?'
  and not (es_alt && array['Entiendo muy poco. ¿Me repetís más despacio?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué? No entendí.']::text[], note_en = coalesce(note_en, 'When they didn''t catch something, Argentines usually ask “¿Cómo?”. “¿Qué?” is also right, but it can sound a bit blunt.')
where id = 'aaafa8a8-f0ed-56be-8cae-bfacb3def0fc' and es = '¿Cómo? No entendí.' and en = 'What? I didn''t understand.'
  and not (es_alt && array['¿Qué? No entendí.']::text[]);

update public.sentences set es_alt = es_alt || array['No entendí, perdón. Hablo muy poco castellano.']::text[]
where id = 'a67c3288-292d-5855-b174-2e078375f345' and es = 'No entendí, perdón. Hablo poco castellano.' and en = 'I didn''t understand, sorry. I speak very little Spanish.'
  and not (es_alt && array['No entendí, perdón. Hablo muy poco castellano.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Un amigo? No, un conocido.']::text[]
where id = '3c8c5cd3-3a24-5fd8-8e0c-3445f7fb0399' and es = '¿Amigo? No, un conocido.' and en = 'A friend? No, just an acquaintance.'
  and not (es_alt && array['¿Un amigo? No, un conocido.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Sos de acá? —Sí, zona norte.']::text[]
where id = '1287056b-359a-5bf3-b351-b6fd94617367' and es = '—¿Sos de acá? —Sí, de zona norte.' and en = '—Are you from here? —Yes, the northern suburbs.'
  and not (es_alt && array['—¿Sos de acá? —Sí, zona norte.']::text[]);

update public.sentences set es_alt = es_alt || array['—Mucho gusto. —Igualmente.', '—Mucho gusto. —Encantado.']::text[]
where id = 'bbe21c05-5fa6-5d32-bbab-3a6c1450ce51' and es = '—Mucho gusto. —Encantada.' and en = '—Nice to meet you. —Nice to meet you too.'
  and not (es_alt && array['—Mucho gusto. —Igualmente.', '—Mucho gusto. —Encantado.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Él es de Buenos Aires? —No, es de Córdoba.', '—¿Es de Buenos Aires? —No, es de Córdoba.']::text[], note_en = coalesce(note_en, '“Porteño” is the everyday word for someone from the city of Buenos Aires.')
where id = '7dfff30c-0232-520d-8c7e-dbb7faf7c0a4' and es = '—¿Él es porteño? —No, es de Córdoba.' and en = '—Is he from Buenos Aires? —No, he''s from Córdoba.'
  and not (es_alt && array['—¿Él es de Buenos Aires? —No, es de Córdoba.', '—¿Es de Buenos Aires? —No, es de Córdoba.']::text[]);

update public.sentences set es_alt = es_alt || array['¿De Buenos Aires? No, soy de La Plata.']::text[], note_en = coalesce(note_en, '“Porteño” or “porteña” is the everyday word for someone from the city of Buenos Aires.')
where id = '3e5a2698-32bf-5b63-82d9-931202d01494' and es = '¿Porteña? No, soy de La Plata.' and en = 'From Buenos Aires? No, I''m from La Plata.'
  and not (es_alt && array['¿De Buenos Aires? No, soy de La Plata.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Sos de Buenos Aires?']::text[], note_en = coalesce(note_en, '“Porteño” is the everyday word for someone from the city of Buenos Aires.')
where id = 'dff03412-4bad-5718-b0be-81a76fbb1b49' and es = '¿Sos porteño?' and en = 'Are you from Buenos Aires?'
  and not (es_alt && array['¿Sos de Buenos Aires?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Vos sos de Buenos Aires o de Córdoba?', '¿Sos de Buenos Aires o de Córdoba?']::text[], note_en = coalesce(note_en, '“Porteño” is the everyday word for someone from the city of Buenos Aires.')
where id = '6b5f2d24-040e-5e8a-a688-fdc21a173b26' and es = '¿Vos sos porteño o de Córdoba?' and en = 'Are you from Buenos Aires or from Córdoba?'
  and not (es_alt && array['¿Vos sos de Buenos Aires o de Córdoba?', '¿Sos de Buenos Aires o de Córdoba?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, Rocío, ¿vos sos de Buenos Aires?']::text[], note_en = coalesce(note_en, '“Porteña” is the everyday word for a woman from the city of Buenos Aires.')
where id = '209a65ad-400d-56c4-89df-4dce0f4211eb' and es = 'Che, Rocío, ¿vos sos porteña?' and en = 'Hey, Rocío, are you from Buenos Aires?'
  and not (es_alt && array['Che, Rocío, ¿vos sos de Buenos Aires?']::text[]);

update public.sentences set es_alt = es_alt || array['No soy de Buenos Aires, soy uruguayo.', 'No soy de Buenos Aires, soy uruguaya.']::text[], note_en = coalesce(note_en, '“Porteño” is the everyday word for someone from the city of Buenos Aires.')
where id = '24c9ce45-64c5-5b2c-874c-ec5b96bb6702' and es = 'No soy porteño, soy uruguayo.' and en = 'I''m not from Buenos Aires, I''m Uruguayan.'
  and not (es_alt && array['No soy de Buenos Aires, soy uruguayo.', 'No soy de Buenos Aires, soy uruguaya.']::text[]);

update public.sentences set es_alt = es_alt || array['Rocío es de acá, es de Buenos Aires.']::text[], note_en = coalesce(note_en, '“Porteña” is the everyday word for a woman from the city of Buenos Aires.')
where id = '7e8bf5f2-070c-5641-add2-d8a453d8e00e' and es = 'Rocío es de acá, es porteña.' and en = 'Rocío is from here, she''s from Buenos Aires.'
  and not (es_alt && array['Rocío es de acá, es de Buenos Aires.']::text[]);

update public.sentences set es_alt = es_alt || array['Rocío es de Buenos Aires, pero Juli es de Montevideo.']::text[], note_en = coalesce(note_en, '“Porteña” is the everyday word for a woman from the city of Buenos Aires.')
where id = '14554672-424b-556d-ab89-95f5d3a8a3ee' and es = 'Rocío es porteña, pero Juli es de Montevideo.' and en = 'Rocío is from Buenos Aires, but Juli is from Montevideo.'
  and not (es_alt && array['Rocío es de Buenos Aires, pero Juli es de Montevideo.']::text[]);

update public.sentences set es_alt = es_alt || array['Sofi no es turista, es de Buenos Aires.']::text[], note_en = coalesce(note_en, '“Porteña” is the everyday word for a woman from the city of Buenos Aires.')
where id = '1d37e616-197d-567b-b14b-a8e596c34e90' and es = 'Sofi no es turista, es porteña.' and en = 'Sofi isn''t a tourist, she''s from Buenos Aires.'
  and not (es_alt && array['Sofi no es turista, es de Buenos Aires.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿De dónde sos? —Soy de España.', '—¿De dónde sos? —De España.']::text[]
where id = '95cf44cc-a534-505f-9c63-2ef0651f3ca0' and es = '—¿De dónde sos? —Soy español.' and en = '—Where are you from? —I''m from Spain.'
  and not (es_alt && array['—¿De dónde sos? —Soy de España.', '—¿De dónde sos? —De España.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Es de acá? —No, es de España.']::text[]
where id = '3405d133-6e1a-51cc-8127-5016c25edad2' and es = '—¿Es de acá? —No, es española.' and en = '—Is she from here? —No, she''s from Spain.'
  and not (es_alt && array['—¿Es de acá? —No, es de España.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Quién es de España, Sofi o Belén?']::text[]
where id = '09f6bcd3-bdff-5833-83ee-5f8e6f265b3b' and es = '¿Quién es española, Sofi o Belén?' and en = 'Who''s from Spain, Sofi or Belén?'
  and not (es_alt && array['¿Quién es de España, Sofi o Belén?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Sos de España, posta?']::text[]
where id = '9ebda2fe-8455-5eb9-9127-53ef0b9212f9' and es = '¿Sos española, posta?' and en = 'You''re from Spain, for real?'
  and not (es_alt && array['¿Sos de España, posta?']::text[]);

update public.sentences set es_alt = es_alt || array['Ella es brasileña y yo soy uruguayo.', 'Ella es brasileña y yo soy uruguaya.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb: “y yo, uruguayo” means “and I''m Uruguayan” without saying “soy” again.')
where id = '2217045c-0a98-5f19-ac4b-4c5e2ea92044' and es = 'Ella es brasileña y yo, uruguayo.' and en = 'She''s Brazilian and I''m Uruguayan.'
  and not (es_alt && array['Ella es brasileña y yo soy uruguayo.', 'Ella es brasileña y yo soy uruguaya.']::text[]);

update public.sentences set es_alt = es_alt || array['Encantado, Juan. ¿Sos de España?']::text[]
where id = 'e837339e-3259-52c9-9bac-8d1cdb5e0618' and es = 'Encantado, Juan. ¿Sos español?' and en = 'Nice to meet you, Juan. Are you from Spain?'
  and not (es_alt && array['Encantado, Juan. ¿Sos de España?']::text[]);

update public.sentences set es_alt = es_alt || array['Mucho gusto, Ana. Yo también soy de España.', 'Mucho gusto, Ana. Yo soy de España también.']::text[]
where id = '8a902dc0-5850-5ea7-bb78-c4fd6a789c5d' and es = 'Mucho gusto, Ana. Yo también soy española.' and en = 'Nice to meet you, Ana. I''m from Spain too.'
  and not (es_alt && array['Mucho gusto, Ana. Yo también soy de España.', 'Mucho gusto, Ana. Yo soy de España también.']::text[]);

update public.sentences set es_alt = es_alt || array['No soy de acá, soy de España.']::text[]
where id = '22a197a6-a5aa-5fdf-a73e-177561b16f78' and es = 'No soy de acá, soy español.' and en = 'I''m not from here, I''m from Spain.'
  and not (es_alt && array['No soy de acá, soy de España.']::text[]);

update public.sentences set es_alt = es_alt || array['Yo tampoco soy de España.']::text[]
where id = 'b9fc08fb-7903-5964-bcfb-6c2a466f6e2b' and es = 'Yo tampoco soy español.' and en = 'I''m not from Spain either.'
  and not (es_alt && array['Yo tampoco soy de España.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hermana es de Buenos Aires.']::text[], note_en = coalesce(note_en, '“Porteña” is the everyday word for a woman from the city of Buenos Aires.')
where id = '3af5511d-711c-50c4-bcdf-cd47873c5b7b' and es = 'Mi hermana es porteña.' and en = 'My sister is from Buenos Aires.'
  and not (es_alt && array['Mi hermana es de Buenos Aires.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hijo se llama Pablo y mi hija se llama Rocío.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb: “y mi hija, Rocío” leaves out the second “se llama”.')
where id = '7fdf987b-eb1d-5ae3-bfa1-934057dec942' and es = 'Mi hijo se llama Pablo y mi hija, Rocío.' and en = 'My son''s name is Pablo, and my daughter''s is Rocío.'
  and not (es_alt && array['Mi hijo se llama Pablo y mi hija se llama Rocío.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi mamá es de Buenos Aires.']::text[], note_en = coalesce(note_en, '“Porteña” is the everyday word for a woman from the city of Buenos Aires.')
where id = 'dd4ca809-4efb-5373-92bf-3557f7b15d00' and es = 'Mi mamá es porteña.' and en = 'My mom is from Buenos Aires.'
  and not (es_alt && array['Mi mamá es de Buenos Aires.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi papá es de Buenos Aires.']::text[], note_en = coalesce(note_en, '“Porteño” is the everyday word for someone from the city of Buenos Aires.')
where id = '1f5d55fe-3527-5cb2-a084-def47cd19f25' and es = 'Mi papá es porteño.' and en = 'My dad is from Buenos Aires.'
  and not (es_alt && array['Mi papá es de Buenos Aires.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi perro también es de Buenos Aires.', 'Mi perro es de Buenos Aires también.']::text[], note_en = coalesce(note_en, '“Porteño” is the everyday word for someone from the city of Buenos Aires.')
where id = 'a74954f5-edf7-5b41-8bed-f5f278fcb845' and es = 'Mi perro también es porteño.' and en = 'My dog''s from Buenos Aires too.'
  and not (es_alt && array['Mi perro también es de Buenos Aires.', 'Mi perro es de Buenos Aires también.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi nieta no es de Buenos Aires, es de La Plata.']::text[], note_en = coalesce(note_en, '“Porteña” is the everyday word for a woman from the city of Buenos Aires.')
where id = '0601cde8-b07f-5c77-8b2e-5eeffb9b6021' and es = 'Mi nieta no es porteña, es de La Plata.' and en = 'My granddaughter isn''t from Buenos Aires, she''s from La Plata.'
  and not (es_alt && array['Mi nieta no es de Buenos Aires, es de La Plata.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi nieto es de Buenos Aires, pero mi nieta no.']::text[], note_en = coalesce(note_en, '“Porteño” is the everyday word for someone from the city of Buenos Aires.')
where id = '5195be61-aa54-5f85-bb2f-89d2bd9072b3' and es = 'Mi nieto es porteño, pero mi nieta no.' and en = 'My grandson is from Buenos Aires, but my granddaughter isn''t.'
  and not (es_alt && array['Mi nieto es de Buenos Aires, pero mi nieta no.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi primo es de Buenos Aires, pero yo no.']::text[], note_en = coalesce(note_en, '“Porteño” is the everyday word for someone from the city of Buenos Aires.')
where id = '13b77b00-5ca2-50c3-b7c5-1caef297f5c2' and es = 'Mi primo es porteño, pero yo no.' and en = 'My cousin is from Buenos Aires, but I''m not.'
  and not (es_alt && array['Mi primo es de Buenos Aires, pero yo no.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi sobrina se llama Juli y mi sobrino se llama Diego.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb: “y mi sobrino, Diego” leaves out the second “se llama”.')
where id = '39fb0a7c-4c39-59dc-802e-88ecf1c5e94c' and es = 'Mi sobrina se llama Juli y mi sobrino, Diego.' and en = 'My niece''s name is Juli and my nephew''s is Diego.'
  and not (es_alt && array['Mi sobrina se llama Juli y mi sobrino se llama Diego.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi tío no es de Buenos Aires, es de La Plata.']::text[], note_en = coalesce(note_en, '“Porteño” is the everyday word for someone from the city of Buenos Aires.')
where id = 'e2ef6a83-597e-5922-85d3-071300bc9768' and es = 'Mi tío no es porteño, es de La Plata.' and en = 'My uncle isn''t from Buenos Aires, he''s from La Plata.'
  and not (es_alt && array['Mi tío no es de Buenos Aires, es de La Plata.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi suegra es italiana y mi suegro es alemán.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = 'ac745ea0-69d4-574e-b8ba-e39699624c47' and es = 'Mi suegra es italiana y mi suegro, alemán.' and en = 'My mother-in-law is Italian and my father-in-law is German.'
  and not (es_alt && array['Mi suegra es italiana y mi suegro es alemán.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Mi hijo? Tiene un año, es un bebé.']::text[]
where id = '199d82d2-f23f-5b8d-98c5-952281adaaea' and es = '¿Mi hijo? Tiene uno, es un bebé.' and en = 'My son? He''s one, he''s a baby.'
  and not (es_alt && array['¿Mi hijo? Tiene un año, es un bebé.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tiene uno?']::text[]
where id = 'c32b8093-c70d-5c1d-822b-52fb085512f2' and es = '¿Tiene un año?' and en = 'Is he one?'
  and not (es_alt && array['¿Tiene uno?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Uno? No, mi gato tiene dos años.']::text[]
where id = '57c785a1-aae6-52b3-9d02-4924cb5f49e7' and es = '¿Uno? No, mi gato tiene dos.' and en = 'One? No, my cat is two.'
  and not (es_alt && array['¿Uno? No, mi gato tiene dos años.']::text[]);

update public.sentences set es_alt = es_alt || array['Juan no tiene mi edad, es un pibe.']::text[], note_en = coalesce(note_en, '“Es muy pibe” is literally “he''s very kid”: Argentines use “pibe” like an adjective to say someone is really young.')
where id = 'eb21a84f-c036-5854-b126-191add1d87c3' and es = 'Juan no tiene mi edad, es muy pibe.' and en = 'Juan isn''t my age, he''s just a kid.'
  and not (es_alt && array['Juan no tiene mi edad, es un pibe.']::text[]);

update public.sentences set es_alt = es_alt || array['Juli tiene uno.']::text[]
where id = '28027c5e-e95a-547b-95fd-ecfe2705f90d' and es = 'Juli tiene un año.' and en = 'Juli is one.'
  and not (es_alt && array['Juli tiene uno.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi gata tiene uno y mi perro tiene cuatro.', 'Mi gata tiene un año y mi perro, cuatro.', 'Mi gata tiene un año y mi perro tiene cuatro.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = '3dcb98ad-e4bf-5913-aac4-b92c9086cef1' and es = 'Mi gata tiene uno y mi perro, cuatro.' and en = 'My cat is one and my dog is four.'
  and not (es_alt && array['Mi gata tiene uno y mi perro tiene cuatro.', 'Mi gata tiene un año y mi perro, cuatro.', 'Mi gata tiene un año y mi perro tiene cuatro.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hijo tiene cuatro y mi perro tiene dos.', 'Mi hijo tiene cuatro años y mi perro, dos.', 'Mi hijo tiene cuatro años y mi perro tiene dos.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = 'e1fc05da-cca8-54a8-a593-7507ba3a092d' and es = 'Mi hijo tiene cuatro y mi perro, dos.' and en = 'My son is four and my dog is two.'
  and not (es_alt && array['Mi hijo tiene cuatro y mi perro tiene dos.', 'Mi hijo tiene cuatro años y mi perro, dos.', 'Mi hijo tiene cuatro años y mi perro tiene dos.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hijo tiene uno.']::text[]
where id = 'c30882ca-a8a4-53ef-a77d-8122a0c9f86b' and es = 'Mi hijo tiene un año.' and en = 'My son is one.'
  and not (es_alt && array['Mi hijo tiene uno.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi nieta tiene dos años y mi nieto tiene cuatro.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = 'af9a0d43-30e8-51ea-acd8-76f70caab479' and es = 'Mi nieta tiene dos años y mi nieto, cuatro.' and en = 'My granddaughter is two years old and my grandson is four.'
  and not (es_alt && array['Mi nieta tiene dos años y mi nieto tiene cuatro.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi nieto tiene cinco años y mi nieta tiene tres.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = '77dc0f48-5ecb-50c4-8cd9-d48b84f2271e' and es = 'Mi nieto tiene cinco años y mi nieta, tres.' and en = 'My grandson is five years old and my granddaughter is three.'
  and not (es_alt && array['Mi nieto tiene cinco años y mi nieta tiene tres.']::text[]);

update public.sentences set es_alt = es_alt || array['Sí, tiene uno.']::text[]
where id = 'b9951fab-fa12-59ca-adfb-e7c1fa9d46bb' and es = 'Sí, tiene un año.' and en = 'Yes, he''s one.'
  and not (es_alt && array['Sí, tiene uno.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cuántos años tiene, seis? —No, siete.']::text[], note_en = coalesce(note_en, 'In casual speech Argentines often drop “años” and just ask “¿Cuántos tiene?”.')
where id = '4f093fb3-c9a5-5bd3-bfb1-ab2352d4e550' and es = '—¿Cuántos tiene, seis? —No, siete.' and en = '—How old is he, six? —No, seven.'
  and not (es_alt && array['—¿Cuántos años tiene, seis? —No, siete.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Siete? No, mi sobrino tiene seis años.']::text[]
where id = 'e5b7241a-98c1-5da9-97ca-f4191c21a620' and es = '¿Siete? No, mi sobrino tiene seis.' and en = 'Seven? No, my nephew is six.'
  and not (es_alt && array['¿Siete? No, mi sobrino tiene seis años.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi gata tiene nueve años y mi perro tiene dos.', 'Mi gata tiene nueve y mi perro tiene dos.']::text[]
where id = 'f8c94a7f-877a-5031-8605-6ab40c86e424' and es = 'Mi gata tiene nueve años y mi perro, dos.' and en = 'My cat is nine and my dog is two.'
  and not (es_alt && array['Mi gata tiene nueve años y mi perro tiene dos.', 'Mi gata tiene nueve y mi perro tiene dos.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hija tiene cinco años y mi hijo tiene ocho.', 'Mi hija tiene cinco y mi hijo tiene ocho.']::text[]
where id = '4f975aa9-11c2-5ce1-8619-a55fcaf0b640' and es = 'Mi hija tiene cinco años y mi hijo, ocho.' and en = 'My daughter is five and my son is eight.'
  and not (es_alt && array['Mi hija tiene cinco años y mi hijo tiene ocho.', 'Mi hija tiene cinco y mi hijo tiene ocho.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hija tiene siete años y mi sobrina tiene diez.', 'Mi hija tiene siete y mi sobrina tiene diez.']::text[]
where id = '985f37c9-8a97-5230-a4ce-a3cb684e7ffb' and es = 'Mi hija tiene siete años y mi sobrina, diez.' and en = 'My daughter is seven and my niece is ten.'
  and not (es_alt && array['Mi hija tiene siete años y mi sobrina tiene diez.', 'Mi hija tiene siete y mi sobrina tiene diez.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi nieto tiene ocho años y mi nieta tiene cinco.', 'Mi nieto tiene ocho y mi nieta tiene cinco.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = '8590d3b6-1bb4-55d7-b98b-c84dc6705e6c' and es = 'Mi nieto tiene ocho años y mi nieta, cinco.' and en = 'My grandson is eight and my granddaughter is five.'
  and not (es_alt && array['Mi nieto tiene ocho años y mi nieta tiene cinco.', 'Mi nieto tiene ocho y mi nieta tiene cinco.']::text[]);

update public.sentences set es_alt = es_alt || array['No sé, tiene diez años o más.']::text[]
where id = '99a11a3e-6604-5cb6-b6be-ddd0a5f64a4a' and es = 'No sé, tiene diez o más.' and en = 'I don''t know, he''s ten or more.'
  and not (es_alt && array['No sé, tiene diez años o más.']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo siete años, tengo ocho.']::text[]
where id = '2abba2ab-7334-5e8b-9895-858543bb01d6' and es = 'No tengo siete, tengo ocho.' and en = 'I''m not seven, I''m eight.'
  and not (es_alt && array['No tengo siete años, tengo ocho.']::text[]);

update public.sentences set es_alt = es_alt || array['No, Belén tiene diez años, no nueve.']::text[]
where id = 'e43d7080-b91f-5aa2-9b9a-7b0cbb4183a8' and es = 'No, Belén tiene diez, no nueve.' and en = 'No, Belén is ten, not nine.'
  and not (es_alt && array['No, Belén tiene diez años, no nueve.']::text[]);

update public.sentences set es_alt = es_alt || array['No, Nico no tiene nueve años, tiene diez.']::text[]
where id = '940aeba6-691e-55a7-8b3b-caac2b5685cc' and es = 'No, Nico no tiene nueve, tiene diez.' and en = 'No, Nico isn''t nine, he''s ten.'
  and not (es_alt && array['No, Nico no tiene nueve años, tiene diez.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cuántos años tenés? —Tengo diecinueve y ella tiene veinte.', '—¿Cuántos años tenés? —Tengo diecinueve años y ella, veinte.', '—¿Cuántos años tenés? —Tengo diecinueve años y ella tiene veinte.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = '5ba58186-837a-5525-8c5f-f370847cc3a1' and es = '—¿Cuántos años tenés? —Tengo diecinueve y ella, veinte.' and en = '—How old are you? —I''m nineteen and she''s twenty.'
  and not (es_alt && array['—¿Cuántos años tenés? —Tengo diecinueve y ella tiene veinte.', '—¿Cuántos años tenés? —Tengo diecinueve años y ella, veinte.', '—¿Cuántos años tenés? —Tengo diecinueve años y ella tiene veinte.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cuántos años tenés? —Tengo diecinueve años.']::text[]
where id = '35ffdc40-c18b-53ea-a02e-7e190547faa5' and es = '—¿Cuántos años tenés? —Tengo diecinueve.' and en = '—How old are you? —I''m nineteen.'
  and not (es_alt && array['—¿Cuántos años tenés? —Tengo diecinueve años.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cuántos años tiene Cami? —Tiene once años.']::text[]
where id = 'b841c102-f0ed-5a84-be4f-8d591269032a' and es = '—¿Cuántos años tiene Cami? —Tiene once.' and en = '—How old is Cami? —She''s eleven.'
  and not (es_alt && array['—¿Cuántos años tiene Cami? —Tiene once años.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cuántos años tiene Martín? —Tiene veinte años.']::text[]
where id = '9d367b98-7028-5721-ab0a-389a37392a28' and es = '—¿Cuántos años tiene Martín? —Tiene veinte.' and en = '—How old is Martín? —He''s twenty.'
  and not (es_alt && array['—¿Cuántos años tiene Martín? —Tiene veinte años.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cuántos años tiene Mati? —Tiene veinte años.']::text[]
where id = '8a89e168-7388-5fee-b223-1932ded6d59f' and es = '—¿Cuántos años tiene Mati? —Tiene veinte.' and en = '—How old is Mati? —He''s twenty.'
  and not (es_alt && array['—¿Cuántos años tiene Mati? —Tiene veinte años.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Tenés dieciséis años? —No, más: dieciocho.']::text[]
where id = '594c88a1-2489-524c-bc82-7cd6f424ac48' and es = '—¿Tenés dieciséis? —No, más: dieciocho.' and en = '—Are you sixteen? —No, more: eighteen.'
  and not (es_alt && array['—¿Tenés dieciséis años? —No, más: dieciocho.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Tenés trece años? —No, doce, ¿y vos?']::text[]
where id = '1932faf5-245a-5906-a5d5-d23049c4636d' and es = '—¿Tenés trece? —No, doce, ¿y vos?' and en = '—Are you thirteen? —No, twelve, and you?'
  and not (es_alt && array['—¿Tenés trece años? —No, doce, ¿y vos?']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Tiene once años? —Once o doce, no sé.']::text[]
where id = '0e0e3087-734e-5e30-a149-e417b3036f84' and es = '—¿Tiene once? —Once o doce, no sé.' and en = '—Is he eleven? —Eleven or twelve, I don''t know.'
  and not (es_alt && array['—¿Tiene once años? —Once o doce, no sé.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Catorce? Yo tengo trece años.']::text[]
where id = '29195bfe-08a9-5552-a886-f4f15ce8c7d7' and es = '¿Catorce? Yo tengo trece.' and en = 'Fourteen? I''m thirteen.'
  and not (es_alt && array['¿Catorce? Yo tengo trece años.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dieciocho? No, Martín tiene diecisiete años.']::text[]
where id = 'a2d2f6a0-ea3e-577d-9a04-319b9eb098a3' and es = '¿Dieciocho? No, Martín tiene diecisiete.' and en = 'Eighteen? No, Martín is seventeen.'
  and not (es_alt && array['¿Dieciocho? No, Martín tiene diecisiete años.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés dieciséis años? Yo también.']::text[]
where id = '823337d0-3a1b-505b-9545-9593e2e9e185' and es = '¿Tenés dieciséis? Yo también.' and en = 'You''re sixteen? I am too.'
  and not (es_alt && array['¿Tenés dieciséis años? Yo también.']::text[]);

update public.sentences set es_alt = es_alt || array['Ana tiene diecisiete años.']::text[]
where id = '69296c5a-e5c6-5c89-9086-2bf344aed139' and es = 'Ana tiene diecisiete.' and en = 'Ana is seventeen.'
  and not (es_alt && array['Ana tiene diecisiete años.']::text[]);

update public.sentences set es_alt = es_alt || array['Cami tiene veinte años y mi hermano tiene diecinueve.', 'Cami tiene veinte y mi hermano tiene diecinueve.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = 'dfec00cc-c143-5a54-b35f-78177f33ccbf' and es = 'Cami tiene veinte años y mi hermano, diecinueve.' and en = 'Cami is twenty and my brother is nineteen.'
  and not (es_alt && array['Cami tiene veinte años y mi hermano tiene diecinueve.', 'Cami tiene veinte y mi hermano tiene diecinueve.']::text[]);

update public.sentences set es_alt = es_alt || array['Che, ¿Pablo tiene quince o dieciséis años?']::text[]
where id = '4e4a2b0e-bfa1-56d4-9556-5928dbae8b42' and es = 'Che, ¿Pablo tiene quince o dieciséis?' and en = 'Hey, is Pablo fifteen or sixteen?'
  and not (es_alt && array['Che, ¿Pablo tiene quince o dieciséis años?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, seis no, tengo dieciséis años.']::text[]
where id = '8f72feff-9a09-53d5-abb0-77c0b1d6d90e' and es = 'Che, seis no, tengo dieciséis.' and en = 'Hey, not six, I''m sixteen.'
  and not (es_alt && array['Che, seis no, tengo dieciséis años.']::text[]);

update public.sentences set es_alt = es_alt || array['Dieciocho, diecinueve… no sé cuántos años tiene.']::text[], note_en = coalesce(note_en, 'In casual speech Argentines often drop “años” and just say “cuántos tiene”.')
where id = '09007841-0d6b-5b55-925b-f2377d7c5954' and es = 'Dieciocho, diecinueve… no sé cuántos tiene.' and en = 'Eighteen, nineteen… I don''t know how old he is.'
  and not (es_alt && array['Dieciocho, diecinueve… no sé cuántos años tiene.']::text[]);

update public.sentences set es_alt = es_alt || array['Diego tiene diecinueve, ¿y Santi cuántos años tiene?', 'Diego tiene diecinueve años, ¿y Santi cuántos tiene?', 'Diego tiene diecinueve años, ¿y Santi cuántos años tiene?']::text[], note_en = coalesce(note_en, 'In casual speech Argentines often drop “años” and just ask “¿Cuántos tiene?”.')
where id = '85b6b447-3031-5943-8238-4dfbece038d9' and es = 'Diego tiene diecinueve, ¿y Santi cuántos tiene?' and en = 'Diego is nineteen, and how old is Santi?'
  and not (es_alt && array['Diego tiene diecinueve, ¿y Santi cuántos años tiene?', 'Diego tiene diecinueve años, ¿y Santi cuántos tiene?', 'Diego tiene diecinueve años, ¿y Santi cuántos años tiene?']::text[]);

update public.sentences set es_alt = es_alt || array['Diego tiene diecinueve años.']::text[]
where id = 'b9d89f24-0075-5960-906b-97bbebf867c9' and es = 'Diego tiene diecinueve.' and en = 'Diego is nineteen.'
  and not (es_alt && array['Diego tiene diecinueve años.']::text[]);

update public.sentences set es_alt = es_alt || array['Hola, soy Juli, tengo veinte años y soy estudiante.']::text[]
where id = '570f460c-4b8d-5a62-9266-ef9b300de774' and es = 'Hola, soy Juli, tengo veinte y soy estudiante.' and en = 'Hi, I''m Juli, I''m twenty and I''m a student.'
  and not (es_alt && array['Hola, soy Juli, tengo veinte años y soy estudiante.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hermana tiene dieciocho y yo tengo dieciséis.', 'Mi hermana tiene dieciocho años y yo, dieciséis.', 'Mi hermana tiene dieciocho años y yo tengo dieciséis.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = '9c1d0411-724d-5629-a891-4705ba505ff0' and es = 'Mi hermana tiene dieciocho y yo, dieciséis.' and en = 'My sister is eighteen and I''m sixteen.'
  and not (es_alt && array['Mi hermana tiene dieciocho y yo tengo dieciséis.', 'Mi hermana tiene dieciocho años y yo, dieciséis.', 'Mi hermana tiene dieciocho años y yo tengo dieciséis.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hija no tiene doce años, tiene trece.']::text[]
where id = '9b8c6c38-99fd-5427-b987-65790f15da5d' and es = 'Mi hija no tiene doce, tiene trece.' and en = 'My daughter isn''t twelve, she''s thirteen.'
  and not (es_alt && array['Mi hija no tiene doce años, tiene trece.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hija tiene doce años y mi hijo tiene nueve.', 'Mi hija tiene doce y mi hijo tiene nueve.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = '6e2ba356-614c-5041-9627-adf65aea2a34' and es = 'Mi hija tiene doce años y mi hijo, nueve.' and en = 'My daughter is twelve and my son is nine.'
  and not (es_alt && array['Mi hija tiene doce años y mi hijo tiene nueve.', 'Mi hija tiene doce y mi hijo tiene nueve.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hijo tiene catorce y mi hija tiene doce.', 'Mi hijo tiene catorce años y mi hija, doce.', 'Mi hijo tiene catorce años y mi hija tiene doce.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = 'e167bda2-09d3-5416-a1db-ce2da1331089' and es = 'Mi hijo tiene catorce y mi hija, doce.' and en = 'My son is fourteen and my daughter is twelve.'
  and not (es_alt && array['Mi hijo tiene catorce y mi hija tiene doce.', 'Mi hijo tiene catorce años y mi hija, doce.', 'Mi hijo tiene catorce años y mi hija tiene doce.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hijo tiene un año y yo tengo veinte.', 'Mi hijo tiene un año y yo tengo veinte años.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = 'd90472fa-ada9-5f08-9a2a-7328b9bf41e3' and es = 'Mi hijo tiene un año y yo, veinte.' and en = 'My son is one and I''m twenty.'
  and not (es_alt && array['Mi hijo tiene un año y yo tengo veinte.', 'Mi hijo tiene un año y yo tengo veinte años.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi novio tiene dieciocho años y yo tengo diecinueve.', 'Mi novio tiene dieciocho y yo tengo diecinueve.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = '2eacc53d-534b-5690-9125-521576332bf4' and es = 'Mi novio tiene dieciocho años y yo, diecinueve.' and en = 'My boyfriend is eighteen and I''m nineteen.'
  and not (es_alt && array['Mi novio tiene dieciocho años y yo tengo diecinueve.', 'Mi novio tiene dieciocho y yo tengo diecinueve.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi prima tiene cinco años y yo tengo quince.', 'Mi prima tiene cinco y yo tengo quince.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = '1b3edd07-fdb9-5986-9288-a74f0646cd12' and es = 'Mi prima tiene cinco años y yo, quince.' and en = 'My cousin is five and I''m fifteen.'
  and not (es_alt && array['Mi prima tiene cinco años y yo tengo quince.', 'Mi prima tiene cinco y yo tengo quince.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi prima tiene diecisiete y mi primo tiene veinte.', 'Mi prima tiene diecisiete años y mi primo, veinte.', 'Mi prima tiene diecisiete años y mi primo tiene veinte.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = '13b0e353-aabd-5155-856d-6ab5b05262b9' and es = 'Mi prima tiene diecisiete y mi primo, veinte.' and en = 'My cousin is seventeen and my other cousin is twenty.'
  and not (es_alt && array['Mi prima tiene diecisiete y mi primo tiene veinte.', 'Mi prima tiene diecisiete años y mi primo, veinte.', 'Mi prima tiene diecisiete años y mi primo tiene veinte.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi prima tiene trece y yo tengo catorce.', 'Mi prima tiene trece años y yo, catorce.', 'Mi prima tiene trece años y yo tengo catorce.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = '12f3b1c7-d829-5596-ada4-6c52ca3e2891' and es = 'Mi prima tiene trece y yo, catorce.' and en = 'My cousin is thirteen and I''m fourteen.'
  and not (es_alt && array['Mi prima tiene trece y yo tengo catorce.', 'Mi prima tiene trece años y yo, catorce.', 'Mi prima tiene trece años y yo tengo catorce.']::text[]);

update public.sentences set es_alt = es_alt || array['No soy turista, soy estudiante y tengo diecinueve años.']::text[]
where id = '19a773f1-63aa-5f37-b967-651df950e75e' and es = 'No soy turista, soy estudiante y tengo diecinueve.' and en = 'I''m not a tourist, I''m a student and I''m nineteen.'
  and not (es_alt && array['No soy turista, soy estudiante y tengo diecinueve años.']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo catorce años, tengo quince, abuela.']::text[]
where id = '1aaa6209-c546-5bd1-ac7a-cc8711ab0cd5' and es = 'No tengo catorce, tengo quince, abuela.' and en = 'I''m not fourteen, I''m fifteen, Grandma.'
  and not (es_alt && array['No tengo catorce años, tengo quince, abuela.']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo dieciocho años: una gaseosa, por favor.']::text[]
where id = 'f9e0fdb4-97fb-54c5-af97-764a1d63ed09' and es = 'No tengo dieciocho: una gaseosa, por favor.' and en = 'I''m not eighteen: a soda, please.'
  and not (es_alt && array['No tengo dieciocho años: una gaseosa, por favor.']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo veinte años, tengo más, gracias.']::text[]
where id = 'ee5a0c0e-5d01-55a4-9a17-0a045556c84d' and es = 'No tengo veinte, tengo más, gracias.' and en = 'I''m not twenty, I''m older, thanks.'
  and not (es_alt && array['No tengo veinte años, tengo más, gracias.']::text[]);

update public.sentences set es_alt = es_alt || array['No, mi hija no tiene once años, tiene doce.']::text[]
where id = '79f180bb-038e-5afc-9227-0b23823cf668' and es = 'No, mi hija no tiene once, tiene doce.' and en = 'No, my daughter isn''t eleven, she''s twelve.'
  and not (es_alt && array['No, mi hija no tiene once años, tiene doce.']::text[]);

update public.sentences set es_alt = es_alt || array['Pablo tiene dieciocho años.']::text[]
where id = '2b02fd4c-11ee-5e33-955a-b1fc32aefe4e' and es = 'Pablo tiene dieciocho.' and en = 'Pablo is eighteen.'
  and not (es_alt && array['Pablo tiene dieciocho años.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo dieciocho y mi cuñado tiene veinte.', 'Tengo dieciocho años y mi cuñado, veinte.', 'Tengo dieciocho años y mi cuñado tiene veinte.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = 'be8c00f1-585d-518a-870e-beb8b199f9df' and es = 'Tengo dieciocho y mi cuñado, veinte.' and en = 'I''m eighteen and my brother-in-law is twenty.'
  and not (es_alt && array['Tengo dieciocho y mi cuñado tiene veinte.', 'Tengo dieciocho años y mi cuñado, veinte.', 'Tengo dieciocho años y mi cuñado tiene veinte.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo diecisiete años, no soy un pibe.']::text[]
where id = 'c755b67d-7f48-576e-8516-8275f07eb3f9' and es = 'Tengo diecisiete, no soy un pibe.' and en = 'I''m seventeen, I''m not a kid.'
  and not (es_alt && array['Tengo diecisiete años, no soy un pibe.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo quince años y mi hermana tiene doce.', 'Tengo quince y mi hermana tiene doce.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = '0ee95beb-a7a4-5332-bdcb-f479154b9e03' and es = 'Tengo quince años y mi hermana, doce.' and en = 'I''m fifteen and my sister is twelve.'
  and not (es_alt && array['Tengo quince años y mi hermana tiene doce.', 'Tengo quince y mi hermana tiene doce.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo quince, ¿y vos cuántos años tenés?', 'Tengo quince años, ¿y vos cuántos tenés?', 'Tengo quince años, ¿y vos cuántos años tenés?']::text[], note_en = coalesce(note_en, 'In casual speech Argentines often drop “años” and just ask “¿Cuántos tenés?”.')
where id = '867352b3-9c89-56d9-835f-7a9c632ac207' and es = 'Tengo quince, ¿y vos cuántos tenés?' and en = 'I''m fifteen, and how old are you?'
  and not (es_alt && array['Tengo quince, ¿y vos cuántos años tenés?', 'Tengo quince años, ¿y vos cuántos tenés?', 'Tengo quince años, ¿y vos cuántos años tenés?']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo trece años, pero mi hermano tiene más.']::text[]
where id = 'c37f1e57-10cd-5f80-b934-6a44a50faa8a' and es = 'Tengo trece, pero mi hermano tiene más.' and en = 'I''m thirteen, but my brother is older.'
  and not (es_alt && array['Tengo trece años, pero mi hermano tiene más.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés veinticinco o veintiséis años?']::text[]
where id = 'eade6ef8-497e-594a-8ced-41db732599c1' and es = '¿Tenés veinticinco o veintiséis?' and en = 'Are you twenty-five or twenty-six?'
  and not (es_alt && array['¿Tenés veinticinco o veintiséis años?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés veinticinco años? Yo también.']::text[]
where id = '2c6c7416-ca45-5c52-8ddf-6ffe6396018b' and es = '¿Tenés veinticinco? Yo también.' and en = 'You''re twenty-five? I am too.'
  and not (es_alt && array['¿Tenés veinticinco años? Yo también.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Veintisiete? No, tengo treinta años.']::text[]
where id = 'c2e33169-60e3-56e7-8b65-f9123652e6d5' and es = '¿Veintisiete? No, tengo treinta.' and en = 'Twenty-seven? No, I''m thirty.'
  and not (es_alt && array['¿Veintisiete? No, tengo treinta años.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi cuñado tiene veintiocho años y mi hermana tiene treinta.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = 'afa62fd7-1f28-51be-9884-584a77216565' and es = 'Mi cuñado tiene veintiocho años y mi hermana, treinta.' and en = 'My brother-in-law is twenty-eight years old and my sister is thirty.'
  and not (es_alt && array['Mi cuñado tiene veintiocho años y mi hermana tiene treinta.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hermana tiene veintisiete años y yo también.']::text[]
where id = 'cac1e223-d908-5c6f-9ead-ef5ff88d413a' and es = 'Mi hermana tiene veintisiete y yo también.' and en = 'My sister is twenty-seven and so am I.'
  and not (es_alt && array['Mi hermana tiene veintisiete años y yo también.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hijo tiene veintitrés y mi hija tiene veinte.', 'Mi hijo tiene veintitrés años y mi hija, veinte.', 'Mi hijo tiene veintitrés años y mi hija tiene veinte.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = '5e843106-0877-541c-a6ad-17fdd1fbc2d3' and es = 'Mi hijo tiene veintitrés y mi hija, veinte.' and en = 'My son is twenty-three and my daughter is twenty.'
  and not (es_alt && array['Mi hijo tiene veintitrés y mi hija tiene veinte.', 'Mi hijo tiene veintitrés años y mi hija, veinte.', 'Mi hijo tiene veintitrés años y mi hija tiene veinte.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi novia tiene veintiuno y yo tengo veinte.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = '0e1f7e05-5375-5271-bba3-9e021452722e' and es = 'Mi novia tiene veintiuno y yo, veinte.' and en = 'My girlfriend is twenty-one and I''m twenty.'
  and not (es_alt && array['Mi novia tiene veintiuno y yo tengo veinte.']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo treinta años, tengo veintinueve.']::text[]
where id = 'cc42cd1d-c735-5f52-b7d2-16d1e6ece380' and es = 'No tengo treinta, tengo veintinueve.' and en = 'I''m not thirty, I''m twenty-nine.'
  and not (es_alt && array['No tengo treinta años, tengo veintinueve.']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo veinte años, tengo veintidós.']::text[]
where id = '2cbaeba8-eaeb-5bc5-aa9f-39b101474da8' and es = 'No tengo veinte, tengo veintidós.' and en = 'I''m not twenty, I''m twenty-two.'
  and not (es_alt && array['No tengo veinte años, tengo veintidós.']::text[]);

update public.sentences set es_alt = es_alt || array['No, mi hermano no tiene veintiséis años, tiene veintiocho.']::text[]
where id = 'f0a72ada-7f42-5810-a715-78eb746bac08' and es = 'No, mi hermano no tiene veintiséis, tiene veintiocho.' and en = 'No, my brother isn''t twenty-six, he''s twenty-eight.'
  and not (es_alt && array['No, mi hermano no tiene veintiséis años, tiene veintiocho.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo veintiséis años y mi mujer tiene veintiocho.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = '3b0d55ef-2ec7-59a8-ad72-8fd08b288f39' and es = 'Tengo veintiséis años y mi mujer, veintiocho.' and en = 'I''m twenty-six years old and my wife is twenty-eight.'
  and not (es_alt && array['Tengo veintiséis años y mi mujer tiene veintiocho.']::text[]);

update public.sentences set es_alt = es_alt || array['Veintiséis no, tengo veintisiete años.']::text[]
where id = 'fa37910a-e64b-5b9b-9e39-9aa70143edd6' and es = 'Veintiséis no, tengo veintisiete.' and en = 'Not twenty-six, I''m twenty-seven.'
  and not (es_alt && array['Veintiséis no, tengo veintisiete años.']::text[]);

update public.sentences set es_alt = es_alt || array['Yo tengo veintitrés años, ¿y vos?']::text[]
where id = '47e3ee27-e04e-5e35-8df4-3c6e1ac0607d' and es = 'Yo tengo veintitrés, ¿y vos?' and en = 'I''m twenty-three, and you?'
  and not (es_alt && array['Yo tengo veintitrés años, ¿y vos?']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Tenés cuarenta años? —No, cuarenta y uno.']::text[]
where id = '377e6e61-1646-513c-9f54-7e5d6069b6b3' and es = '—¿Tenés cuarenta? —No, cuarenta y uno.' and en = '—Are you forty? —No, forty-one.'
  and not (es_alt && array['—¿Tenés cuarenta años? —No, cuarenta y uno.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Tiene setenta años? —No, ochenta y uno.']::text[]
where id = '3bc6864e-1d1f-5b96-99d1-9c0a22a35060' and es = '—¿Tiene setenta? —No, ochenta y uno.' and en = '—Is he seventy? —No, eighty-one.'
  and not (es_alt && array['—¿Tiene setenta años? —No, ochenta y uno.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cien? No, tiene noventa y nueve años.']::text[]
where id = '2dfe7749-81d8-5e5c-9783-3a7534708268' and es = '¿Cien? No, tiene noventa y nueve.' and en = 'A hundred? No, she''s ninety-nine.'
  and not (es_alt && array['¿Cien? No, tiene noventa y nueve años.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuarenta? No, tengo treinta y nueve años.']::text[]
where id = 'e010c2e4-1335-5127-9979-ef0ec630c2ba' and es = '¿Cuarenta? No, tengo treinta y nueve.' and en = 'Forty? No, I''m thirty-nine.'
  and not (es_alt && array['¿Cuarenta? No, tengo treinta y nueve años.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuela no tiene sesenta años, tiene setenta.']::text[]
where id = '59641f58-0069-5ff4-b99f-dce0af891628' and es = 'Mi abuela no tiene sesenta, tiene setenta.' and en = 'My grandmother isn''t sixty, she''s seventy.'
  and not (es_alt && array['Mi abuela no tiene sesenta años, tiene setenta.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuelo tiene ochenta y dos y mi abuela tiene ochenta.', 'Mi abuelo tiene ochenta y dos años y mi abuela, ochenta.', 'Mi abuelo tiene ochenta y dos años y mi abuela tiene ochenta.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = '1b950c38-9324-5a66-9c07-bbb852a6764d' and es = 'Mi abuelo tiene ochenta y dos y mi abuela, ochenta.' and en = 'My grandfather is eighty-two and my grandmother is eighty.'
  and not (es_alt && array['Mi abuelo tiene ochenta y dos y mi abuela tiene ochenta.', 'Mi abuelo tiene ochenta y dos años y mi abuela, ochenta.', 'Mi abuelo tiene ochenta y dos años y mi abuela tiene ochenta.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi marido tiene cincuenta y yo tengo cuarenta y nueve.', 'Mi marido tiene cincuenta años y yo, cuarenta y nueve.', 'Mi marido tiene cincuenta años y yo tengo cuarenta y nueve.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb and just puts a comma where it would go.')
where id = '2cf91616-a324-5a48-903d-c78a031221b9' and es = 'Mi marido tiene cincuenta y yo, cuarenta y nueve.' and en = 'My husband is fifty and I''m forty-nine.'
  and not (es_alt && array['Mi marido tiene cincuenta y yo tengo cuarenta y nueve.', 'Mi marido tiene cincuenta años y yo, cuarenta y nueve.', 'Mi marido tiene cincuenta años y yo tengo cuarenta y nueve.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi mujer es francesa y yo soy alemán.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb when the meaning is clear: “y yo alemán”.')
where id = '82a504de-6814-568d-85b8-90d7a5b1ecca' and es = 'Mi mujer es francesa y yo alemán.' and en = 'My wife is French and I''m German.'
  and not (es_alt && array['Mi mujer es francesa y yo soy alemán.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi mujer tiene frío y yo tengo calor.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb when the meaning is clear: “y yo calor”.')
where id = '887daf27-9c10-567f-8556-b192bae5c053' and es = 'Mi mujer tiene frío y yo calor.' and en = 'My wife is cold and I''m hot.'
  and not (es_alt && array['Mi mujer tiene frío y yo tengo calor.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi novio tiene cuatro hermanos y yo tengo cero.']::text[], note_en = coalesce(note_en, 'Spanish often skips a verb it has just used: “y yo, cero” means “and I have zero”.')
where id = '109d0b5e-2e83-5d93-bd9e-ca1dc9e546d3' and es = 'Mi novio tiene cuatro hermanos y yo, cero.' and en = 'My boyfriend has four siblings and I have zero.'
  and not (es_alt && array['Mi novio tiene cuatro hermanos y yo tengo cero.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cuánto sale? —Cuatro mil pesos.']::text[], note_en = coalesce(note_en, '“Mango” is everyday Argentine slang for a peso.')
where id = '434876e5-7032-5829-8753-b6680cd3d490' and es = '—¿Cuánto sale? —Cuatro mil mangos.' and en = '—How much is it? —Four thousand pesos.'
  and not (es_alt && array['—¿Cuánto sale? —Cuatro mil pesos.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuántos pesos tenés?']::text[], note_en = coalesce(note_en, '“Mango” is everyday Argentine slang for a peso.')
where id = '3115641c-2f01-53db-98ef-a427e10af29f' and es = '¿Cuántos mangos tenés?' and en = 'How many pesos do you have?'
  and not (es_alt && array['¿Cuántos pesos tenés?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Pagás vos? Yo tampoco tengo un peso.']::text[], note_en = coalesce(note_en, '“Mango” is everyday Argentine slang for a peso. “No tengo un mango” means you''re broke.')
where id = '9ea9869c-37bb-55a6-a5b2-192505bc9327' and es = '¿Pagás vos? Yo tampoco tengo un mango.' and en = 'Are you paying? I don''t have a peso either.'
  and not (es_alt && array['¿Pagás vos? Yo tampoco tengo un peso.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés mil pesos?']::text[], note_en = coalesce(note_en, '“Mango” is everyday Argentine slang for a peso.')
where id = '1a54b6b2-bb15-5984-91bd-fe906a8122b2' and es = '¿Tenés mil mangos?' and en = 'Do you have a thousand pesos?'
  and not (es_alt && array['¿Tenés mil pesos?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tres mil pesos un café?', '¿Un café tres mil pesos?']::text[], note_en = coalesce(note_en, '“Mango” is everyday Argentine slang for a peso.')
where id = 'a5a4835b-6578-53b2-9465-ba6a509cf3c4' and es = '¿Tres mil mangos un café?' and en = 'Three thousand pesos for a coffee?'
  and not (es_alt && array['¿Tres mil pesos un café?', '¿Un café tres mil pesos?']::text[]);

update public.sentences set es_alt = es_alt || array['Ella paga mil pesos y él paga dos mil.']::text[], note_en = coalesce(note_en, 'Spanish often skips a verb it has just used: “y él, dos mil” means “and he''s paying two thousand”.')
where id = 'a57b07aa-c7aa-56dd-ab9c-e47ad96664a8' and es = 'Ella paga mil pesos y él, dos mil.' and en = 'She''s paying a thousand pesos and he''s paying two thousand.'
  and not (es_alt && array['Ella paga mil pesos y él paga dos mil.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi novia paga, yo no tengo un peso.', 'Paga mi novia, yo no tengo un peso.']::text[], note_en = coalesce(note_en, '“Mango” is everyday Argentine slang for a peso. “No tengo un mango” means you''re broke.')
where id = '39d8ef96-deae-559f-a6f0-893c07bcb4bd' and es = 'Mi novia paga, yo no tengo un mango.' and en = 'My girlfriend is paying, I don''t have a peso.'
  and not (es_alt && array['Mi novia paga, yo no tengo un peso.', 'Paga mi novia, yo no tengo un peso.']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo un peso, perdón.', 'Perdón, no tengo un peso.']::text[], note_en = coalesce(note_en, '“Mango” is everyday Argentine slang for a peso. “No tengo un mango” means you''re broke.')
where id = '9695cead-cbf1-5989-8516-4842b6d47aee' and es = 'No tengo un mango, perdón.' and en = 'I don''t have a peso, sorry.'
  and not (es_alt && array['No tengo un peso, perdón.', 'Perdón, no tengo un peso.']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo un peso, pero tengo tarjeta.']::text[], note_en = coalesce(note_en, '“Mango” is everyday Argentine slang for a peso. “No tengo un mango” means you''re broke.')
where id = 'a2db5f16-8483-52e6-96c2-659d18235479' and es = 'No tengo un mango, pero tengo tarjeta.' and en = 'I don''t have a peso, but I have a card.'
  and not (es_alt && array['No tengo un peso, pero tengo tarjeta.']::text[]);

update public.sentences set es_alt = es_alt || array['Pago yo, vos no tenés un peso.', 'Yo pago, vos no tenés un peso.']::text[], note_en = coalesce(note_en, '“Mango” is everyday Argentine slang for a peso. “No tenés un mango” means you''re broke.')
where id = 'dca53a2f-900f-53f5-adb3-681dfddb0ba6' and es = 'Pago yo, vos no tenés un mango.' and en = 'I''ll pay, you don''t have a peso.'
  and not (es_alt && array['Pago yo, vos no tenés un peso.', 'Yo pago, vos no tenés un peso.']::text[]);

update public.sentences set es_alt = es_alt || array['Sale tres mil pesos.']::text[], note_en = coalesce(note_en, '“Mango” is everyday Argentine slang for a peso.')
where id = '9aaadc6c-5224-52a9-8358-a7ea4d0a1b8f' and es = 'Sale tres mil mangos.' and en = 'It''s three thousand pesos.'
  and not (es_alt && array['Sale tres mil pesos.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Quinientos pesos un chicle? ¡Qué caro!']::text[], note_en = coalesce(note_en, '“Mango” is everyday Argentine slang for a peso.')
where id = '8599e5ca-4203-53da-a858-7d9a24bb7b8f' and es = '¿Quinientos mangos un chicle? ¡Qué caro!' and en = 'Five hundred pesos for a piece of gum? How expensive!'
  and not (es_alt && array['¿Quinientos pesos un chicle? ¡Qué caro!']::text[]);

update public.sentences set es_alt = es_alt || array['Ellas tienen sus gatos y nosotras tenemos nuestro perro.', 'Ellas tienen sus gatos y nosotros tenemos nuestro perro.']::text[], note_en = coalesce(note_en, 'Spanish often skips a verb it has just used: “y nosotras, nuestro perro” means “and we have our dog”.')
where id = '4d03294b-d1f8-55a3-b78a-d6c549f492dd' and es = 'Ellas tienen sus gatos y nosotras, nuestro perro.' and en = 'They have their cats and we have our dog.'
  and not (es_alt && array['Ellas tienen sus gatos y nosotras tenemos nuestro perro.', 'Ellas tienen sus gatos y nosotros tenemos nuestro perro.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Tu mamá es morocha? —No, es rubia.']::text[], note_en = coalesce(note_en, 'In a quick reply Spanish speakers often drop the verb: “No, rubia” is short for “No, es rubia”.')
where id = '0b1420e4-e409-5e04-a0e7-1289a7fe8270' and es = '—¿Tu mamá es morocha? —No, rubia.' and en = '—Does your mom have dark hair? —No, she''s blonde.'
  and not (es_alt && array['—¿Tu mamá es morocha? —No, es rubia.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cómo es su novio? —Lindo, pero no simpático.']::text[]
where id = '8293bb64-73cf-5f99-89be-389eca89da1e' and es = '—¿Cómo es su novio? —Lindo, pero no es simpático.' and en = '—What''s her boyfriend like? —Good-looking, but not friendly.'
  and not (es_alt && array['—¿Cómo es su novio? —Lindo, pero no simpático.']::text[]);

update public.sentences set es_alt = es_alt || array['Son mellizos, pero Fede es alto y Mati es petiso.']::text[], note_en = coalesce(note_en, 'Spanish often skips a verb it has just used: “y Mati petiso” means “and Mati is short”.')
where id = 'e0a20472-8739-50c9-9413-1d5eb52b3609' and es = 'Son mellizos, pero Fede es alto y Mati petiso.' and en = 'They''re twins, but Fede is tall and Mati is short.'
  and not (es_alt && array['Son mellizos, pero Fede es alto y Mati es petiso.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde está la computadora?']::text[], note_en = coalesce(note_en, '“Compu” is the everyday short form of “computadora”.')
where id = '27ec78d5-c9c4-5338-b403-f2da98e4b0d0' and es = '¿Dónde está la compu?' and en = 'Where''s the computer?'
  and not (es_alt && array['¿Dónde está la computadora?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés tu celu ahí?']::text[], note_en = coalesce(note_en, 'When it''s obvious whose thing it is, Argentines usually just say “el” or “la” where English says “your”.')
where id = 'a14e670a-63c6-57a2-b1fc-5f0a9f049b17' and es = '¿Tenés el celu ahí?' and en = 'Do you have your phone there?'
  and not (es_alt && array['¿Tenés tu celu ahí?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés la compu en tu mochila?']::text[], note_en = coalesce(note_en, 'When it''s obvious whose thing it is, Argentines usually just say “el” or “la” where English says “your”.')
where id = 'f5fd9733-a86e-5e25-a166-5348cde31938' and es = '¿Tenés la compu en la mochila?' and en = 'Do you have the laptop in your backpack?'
  and not (es_alt && array['¿Tenés la compu en tu mochila?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi computadora está en casa.']::text[], note_en = coalesce(note_en, '“Compu” is the everyday short form of “computadora”.')
where id = '96a98f53-797e-5b7c-b3d8-2406dae097fc' and es = 'Mi compu está en casa.' and en = 'My computer is at home.'
  and not (es_alt && array['Mi computadora está en casa.']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo mi billetera.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose thing it is, Argentines usually just say “el” or “la” where English says “my”.')
where id = '83711a0b-d4e1-537c-bfb7-94aff3dc2ab0' and es = 'No tengo la billetera.' and en = 'I don''t have my wallet.'
  and not (es_alt && array['No tengo mi billetera.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo mi billetera, pero no tengo efectivo.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose thing it is, Argentines usually just say “el” or “la” where English says “my”.')
where id = 'ab06ef3c-2fb9-5f71-be64-2249fd313400' and es = 'Tengo la billetera, pero no tengo efectivo.' and en = 'I have my wallet, but I don''t have any cash.'
  and not (es_alt && array['Tengo mi billetera, pero no tengo efectivo.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo mi compu y mi celu en mi mochila.', 'Tengo mi compu y mi celu en la mochila.', 'Tengo la compu y el celu en mi mochila.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose things they are, Argentines usually just say “el” or “la” where English says “my”.')
where id = 'e1e4f10b-5386-5466-9187-ad698fb96626' and es = 'Tengo la compu y el celu en la mochila.' and en = 'I have my laptop and my phone in my backpack.'
  and not (es_alt && array['Tengo mi compu y mi celu en mi mochila.', 'Tengo mi compu y mi celu en la mochila.', 'Tengo la compu y el celu en mi mochila.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo mi compu y mi celu en el auto.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose things they are, Argentines usually just say “el” or “la” where English says “my”.')
where id = '415ddddf-cade-5cbd-b2b5-6a4875bd291a' and es = 'Tengo la compu y el celu en el auto.' and en = 'I''ve got my laptop and my phone in the car.'
  and not (es_alt && array['Tengo mi compu y mi celu en el auto.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Un taxi? No, el subte está a una cuadra.']::text[]
where id = '5a702d35-8707-57d4-a389-aafeb1e279fc' and es = '¿Taxi? No, el subte está a una cuadra.' and en = 'A taxi? No, the subway is one block away.'
  and not (es_alt && array['¿Un taxi? No, el subte está a una cuadra.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo la línea A en la esquina de mi casa.']::text[], note_en = coalesce(note_en, 'Argentines often say just “casa” for “my house”: “cerca de casa”, “en la esquina de casa”.')
where id = '7facc420-5b1c-57f1-b052-1256a8c915c8' and es = 'Tengo la línea A en la esquina de casa.' and en = 'I''ve got the A line on the corner by my house.'
  and not (es_alt && array['Tengo la línea A en la esquina de mi casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Hay un hospital cerca de mi casa.']::text[], note_en = coalesce(note_en, 'Argentines often say just “casa” for “my house”: “cerca de casa” means near my place.')
where id = 'cb353778-0494-5395-aba1-9dd5199b1ffa' and es = 'Hay un hospital cerca de casa.' and en = 'There''s a hospital near my place.'
  and not (es_alt && array['Hay un hospital cerca de mi casa.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés agua en tu mochila?']::text[], note_en = coalesce(note_en, 'When it''s obvious whose thing it is, Argentines usually just say “el” or “la” where English says “your”.')
where id = '524f583f-f0e5-5836-a8fe-bf6b9b8e621e' and es = '¿Tenés agua en la mochila?' and en = 'Do you have water in your backpack?'
  and not (es_alt && array['¿Tenés agua en tu mochila?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, ¿dónde están mis llaves?']::text[], note_en = coalesce(note_en, 'Argentines often ask where something is with just “¿Y...?”: “¿Y mis llaves?”.')
where id = '7e91f425-1c41-5c76-a04c-2103103b5d3c' and es = 'Che, ¿y mis llaves?' and en = 'Hey, where are my keys?'
  and not (es_alt && array['Che, ¿dónde están mis llaves?']::text[]);

update public.sentences set es_alt = es_alt || array['La computadora está en la mochila.']::text[], note_en = coalesce(note_en, '“Compu” is the everyday short form of “computadora”.')
where id = '22b566b2-1ec7-58ce-8c89-ff22cb46fc15' and es = 'La compu está en la mochila.' and en = 'The computer is in the backpack.'
  and not (es_alt && array['La computadora está en la mochila.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi compu está arriba, pero mi celu está acá.', 'Mi computadora está arriba, pero el celu está acá.', 'Mi computadora está arriba, pero mi celu está acá.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose thing it is, Argentines usually just say “el” or “la” where English says “my”.')
where id = '1dfaf8ec-75a7-5db4-87fd-3bb032e393f9' and es = 'Mi compu está arriba, pero el celu está acá.' and en = 'My computer is upstairs, but my phone is here.'
  and not (es_alt && array['Mi compu está arriba, pero mi celu está acá.', 'Mi computadora está arriba, pero el celu está acá.', 'Mi computadora está arriba, pero mi celu está acá.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cómo estás? —Todo bien.']::text[], note_en = coalesce(note_en, '“Todo tranqui” is a relaxed, very Argentine way to say everything''s fine.')
where id = 'a621af69-75e5-50d5-aec4-3dbbdb4c544e' and es = '—¿Cómo estás? —Todo tranqui.' and en = '—How are you? —All good.'
  and not (es_alt && array['—¿Cómo estás? —Todo bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Acá todo bien, ¿y vos?']::text[], note_en = coalesce(note_en, '“Todo tranqui” is a relaxed, very Argentine way to say everything''s fine.')
where id = 'c0e20f7c-3e53-55ed-8116-ae65b05c1f2a' and es = 'Acá todo tranqui, ¿y vos?' and en = 'All good here, and you?'
  and not (es_alt && array['Acá todo bien, ¿y vos?']::text[]);

update public.sentences set es_alt = es_alt || array['Ana está muy triste, su abuelo está en el hospital.']::text[], note_en = coalesce(note_en, '“Hecho pelota” is a very Argentine way to say you''re wrecked: worn out or feeling down.')
where id = '47776719-3d9c-5891-9ab1-9f0573d32207' and es = 'Ana está hecha pelota, su abuelo está en el hospital.' and en = 'Ana is very sad, her grandfather is in the hospital.'
  and not (es_alt && array['Ana está muy triste, su abuelo está en el hospital.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy muy cansada, voy a casa.', 'Estoy muy cansado, voy a casa.']::text[], note_en = coalesce(note_en, '“Hecho pelota” is a very Argentine way to say you''re wrecked: worn out or feeling down.')
where id = '6f2b2937-9f5d-546d-9fc6-4660919d67ef' and es = 'Estoy hecha pelota, voy a casa.' and en = 'I''m really tired, I''m going home.'
  and not (es_alt && array['Estoy muy cansada, voy a casa.', 'Estoy muy cansado, voy a casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy muy cansado.', 'Estoy muy cansada.']::text[], note_en = coalesce(note_en, '“Hecho pelota” is a very Argentine way to say you''re wrecked: worn out or feeling down.')
where id = '662ac8fb-e2e8-5de9-91df-3db3adc9863f' and es = 'Estoy hecho pelota.' and en = 'I''m really tired.'
  and not (es_alt && array['Estoy muy cansado.', 'Estoy muy cansada.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi papá está muy cansado.']::text[], note_en = coalesce(note_en, '“Hecho pelota” is a very Argentine way to say you''re wrecked: worn out or feeling down.')
where id = '0f69bcb5-e602-5ea3-8a41-fce27aa08be8' and es = 'Mi papá está hecho pelota.' and en = 'My dad is really tired.'
  and not (es_alt && array['Mi papá está muy cansado.']::text[]);

update public.sentences set es_alt = es_alt || array['Sofi está muy cansada.']::text[], note_en = coalesce(note_en, '“Hecho pelota” is a very Argentine way to say you''re wrecked: worn out or feeling down.')
where id = '03ec73bd-c8e8-5cac-88f3-78ff762f0672' and es = 'Sofi está hecha pelota.' and en = 'Sofi is really tired.'
  and not (es_alt && array['Sofi está muy cansada.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy muy ocupado, no tengo tiempo.', 'Estoy muy ocupada, no tengo tiempo.']::text[], note_en = coalesce(note_en, '“Estar a mil” is an everyday Argentine way to say you''re swamped, like going at a thousand.')
where id = '54145763-23a0-5f45-bdb8-29249f6d2adc' and es = 'Estoy a mil, no tengo tiempo.' and en = 'I''m very busy, I don''t have time.'
  and not (es_alt && array['Estoy muy ocupado, no tengo tiempo.', 'Estoy muy ocupada, no tengo tiempo.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy muy ocupado.', 'Estoy muy ocupada.']::text[], note_en = coalesce(note_en, '“Estar a mil” is an everyday Argentine way to say you''re swamped, like going at a thousand.')
where id = 'c63bcb34-37ca-5a34-84dd-d39879db2f2a' and es = 'Estoy a mil.' and en = 'I''m very busy.'
  and not (es_alt && array['Estoy muy ocupado.', 'Estoy muy ocupada.']::text[]);

update public.sentences set es_alt = es_alt || array['—Juli, ¿estás lista? —Sí, vamos.', '—¿Estás lista, Juli? —Sí, vamos.']::text[], note_en = coalesce(note_en, '“Dale” is the all-purpose Argentine yes: OK, sure, let''s go.')
where id = '3581e6fc-f510-5dc7-a942-1fb339b9d13d' and es = '—Juli, ¿estás lista? —Sí, dale.' and en = '—Juli, are you ready? —Yes, let''s go.'
  and not (es_alt && array['—Juli, ¿estás lista? —Sí, vamos.', '—¿Estás lista, Juli? —Sí, vamos.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cómo andás, Fede? —Acá andamos.', '—¿Cómo va, Fede? —Acá andamos.']::text[], note_en = coalesce(note_en, '“¿Qué hacés?” literally asks what you''re doing, but Argentines use it as a casual hello, just like “How''s it going?”.')
where id = '4f13b843-d221-550f-b37b-e659b425c908' and es = '—¿Qué hacés, Fede? —Acá andamos.' and en = '—How''s it going, Fede? —Getting by.'
  and not (es_alt && array['—¿Cómo andás, Fede? —Acá andamos.', '—¿Cómo va, Fede? —Acá andamos.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cómo andás, Juan? —Bien, a mil.', '—¿Cómo va, Juan? —Bien, a mil.', '—¿Qué hacés, Juan? —Bien, muy ocupado.', '—¿Cómo andás, Juan? —Bien, muy ocupado.', '—¿Cómo va, Juan? —Bien, muy ocupado.']::text[], note_en = coalesce(note_en, '“¿Qué hacés?” is a casual Argentine hello, and “a mil” means you''re swamped.')
where id = 'b937084f-4938-54ff-93fd-df1583a3054c' and es = '—¿Qué hacés, Juan? —Bien, a mil.' and en = '—How''s it going, Juan? —Good, very busy.'
  and not (es_alt && array['—¿Cómo andás, Juan? —Bien, a mil.', '—¿Cómo va, Juan? —Bien, a mil.', '—¿Qué hacés, Juan? —Bien, muy ocupado.', '—¿Cómo andás, Juan? —Bien, muy ocupado.', '—¿Cómo va, Juan? —Bien, muy ocupado.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cómo andás? —Todo bien, ¿y vos?', '—¿Cómo va? —Todo bien, ¿y vos?']::text[], note_en = coalesce(note_en, '“¿Qué hacés?” literally asks what you''re doing, but Argentines use it as a casual hello, just like “How''s it going?”.')
where id = '27f77442-4653-54ee-969b-1e751d473bbd' and es = '—¿Qué hacés? —Todo bien, ¿y vos?' and en = '—How''s it going? —All good, and you?'
  and not (es_alt && array['—¿Cómo andás? —Todo bien, ¿y vos?', '—¿Cómo va? —Todo bien, ¿y vos?']::text[]);

update public.sentences set es_alt = es_alt || array['Buenas, ¿cómo andás?', 'Buenas, ¿cómo va?', 'Hola, ¿qué hacés?', 'Hola, ¿cómo andás?', 'Hola, ¿cómo va?']::text[], note_en = coalesce(note_en, '“¿Qué hacés?” literally asks what you''re doing, but Argentines use it as a casual hello, just like “How''s it going?”.')
where id = 'f1650328-6756-59e1-b69b-5753e796eb19' and es = 'Buenas, ¿qué hacés?' and en = 'Hi, how''s it going?'
  and not (es_alt && array['Buenas, ¿cómo andás?', 'Buenas, ¿cómo va?', 'Hola, ¿qué hacés?', 'Hola, ¿cómo andás?', 'Hola, ¿cómo va?']::text[]);

update public.sentences set es_alt = es_alt || array['Hola, ¿cómo andás?', 'Hola, ¿cómo va?']::text[], note_en = coalesce(note_en, '“¿Qué hacés?” literally asks what you''re doing, but Argentines use it as a casual hello, just like “How''s it going?”.')
where id = '33ae56d3-8b58-58de-a9a1-1156cacd2c81' and es = 'Hola, ¿qué hacés?' and en = 'Hi, how''s it going?'
  and not (es_alt && array['Hola, ¿cómo andás?', 'Hola, ¿cómo va?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué tomás?']::text[]
where id = '76e5191d-11a0-52ec-ac85-1ab0011c5e25' and es = '¿Qué toman?' and en = 'What are you having?'
  and not (es_alt && array['¿Qué tomás?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Hablo muy rápido? Perdón.', '¿Hablo demasiado rápido? Perdón.']::text[]
where id = '25d11f10-0940-59d5-b129-10b924f58ab2' and es = '¿Hablo rápido? Perdón.' and en = 'Am I talking too fast? Sorry.'
  and not (es_alt && array['¿Hablo muy rápido? Perdón.', '¿Hablo demasiado rápido? Perdón.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Buscás un profe? Mi vecina enseña castellano.', '¿Buscás una profe? Mi vecina enseña castellano.']::text[], note_en = coalesce(note_en, 'Spanish often uses the simple present where English says “-ing”.')
where id = 'a36ae254-2936-5814-b598-4b662d0e3dc3' and es = '¿Buscás profe? Mi vecina enseña castellano.' and en = 'Looking for a teacher? My neighbor teaches Spanish.'
  and not (es_alt && array['¿Buscás un profe? Mi vecina enseña castellano.', '¿Buscás una profe? Mi vecina enseña castellano.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Buscás un profe de castellano?']::text[], note_en = coalesce(note_en, 'Spanish often uses the simple present where English says “-ing”.')
where id = 'c4fb62b8-eb5b-509f-972d-4b0b0bb16b3c' and es = '¿Buscás una profe de castellano?' and en = 'Are you looking for a Spanish teacher?'
  and not (es_alt && array['¿Buscás un profe de castellano?']::text[]);

update public.sentences set es_alt = es_alt || array['Busco la palabra en mi celu.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my”, when it is obvious whose it is.')
where id = '07dbd63e-6996-5134-85aa-9253ba085ce3' and es = 'Busco la palabra en el celu.' and en = 'I look up the word on my phone.'
  and not (es_alt && array['Busco la palabra en mi celu.']::text[]);

update public.sentences set es_alt = es_alt || array['Pablo busca la palabra en su celu.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “his”, when it is obvious whose it is.')
where id = '5290fd7d-1653-5663-bace-e36e17f72206' and es = 'Pablo busca la palabra en el celu.' and en = 'Pablo looks up the word on his phone.'
  and not (es_alt && array['Pablo busca la palabra en su celu.']::text[]);

update public.sentences set es_alt = es_alt || array['Santi nunca pregunta, él busca en su celu.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “his”, when it is obvious whose it is.')
where id = '64b58b96-692b-5c66-93e0-d8825ffd831b' and es = 'Santi nunca pregunta, él busca en el celu.' and en = 'Santi never asks, he looks it up on his phone.'
  and not (es_alt && array['Santi nunca pregunta, él busca en su celu.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Qué rica milanesa!']::text[], note_en = coalesce(note_en, '“Milanga” is the affectionate, everyday nickname for a milanesa.')
where id = '8aab20ae-e9fa-5ad0-a9a1-35ba9a0553aa' and es = '¡Qué rica milanga!' and en = 'What a tasty milanesa!'
  and not (es_alt && array['¡Qué rica milanesa!']::text[]);

update public.sentences set es_alt = es_alt || array['A Ana no le gusta la milanesa, pero a mí sí.']::text[]
where id = 'fcdf26a8-8d98-5d49-a833-3e51324804f9' and es = 'A Ana no le gusta la milanesa, a mí sí.' and en = 'Ana doesn''t like milanesa, but I do.'
  and not (es_alt && array['A Ana no le gusta la milanesa, pero a mí sí.']::text[]);

update public.sentences set es_alt = es_alt || array['A mi novia le gustan los gatos, y a mí también.']::text[]
where id = '2f257961-286c-5a34-9b5f-cbbb53b7a2cf' and es = 'A mi novia le gustan los gatos, a mí también.' and en = 'My girlfriend likes cats, and me too.'
  and not (es_alt && array['A mi novia le gustan los gatos, y a mí también.']::text[]);

update public.sentences set es_alt = es_alt || array['La milanesa de mi vieja es muy rica.']::text[], note_en = coalesce(note_en, '“Milanga” is the affectionate, everyday nickname for a milanesa.')
where id = '1db61615-425c-5baf-9311-b9a3b6e01fbc' and es = 'La milanga de mi vieja es muy rica.' and en = 'My mom''s milanesa is very tasty.'
  and not (es_alt && array['La milanesa de mi vieja es muy rica.']::text[]);

update public.sentences set es_alt = es_alt || array['Un sándwich de milanesa, por favor.']::text[], note_en = coalesce(note_en, '“Milanga” is the affectionate, everyday nickname for a milanesa.')
where id = '6a5b7f94-8fce-5af2-8db3-a74a495a9976' and es = 'Un sándwich de milanga, por favor.' and en = 'A milanesa sandwich, please.'
  and not (es_alt && array['Un sándwich de milanesa, por favor.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Te gustan las verduras? —Más o menos.']::text[], note_en = coalesce(note_en, 'Argentines often say “la verdura” in the singular for vegetables in general.')
where id = '60d03702-a07c-5037-a2af-ae9eb971a198' and es = '—¿Te gusta la verdura? —Más o menos.' and en = '—Do you like vegetables? —So-so.'
  and not (es_alt && array['—¿Te gustan las verduras? —Más o menos.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Verduras? —No, gracias.']::text[], note_en = coalesce(note_en, 'Argentines often say “verdura” in the singular for vegetables in general.')
where id = '25bfa606-24cb-5ccd-8bae-082013202761' and es = '—¿Verdura? —No, gracias.' and en = '—Vegetables? —No, thanks.'
  and not (es_alt && array['—¿Verduras? —No, gracias.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te gusta la fruta?']::text[]
where id = 'bbaab669-39ae-5d09-bf8f-5bc5854e1d58' and es = '¿Te gustan las frutas?' and en = 'Do you like fruit?'
  and not (es_alt && array['¿Te gusta la fruta?']::text[]);

update public.sentences set es_alt = es_alt || array['A Cami no le gustan los huevos.']::text[]
where id = '10391725-3614-55ef-8c08-c463dd28d0cf' and es = 'A Cami no le gusta el huevo.' and en = 'Cami doesn''t like eggs.'
  and not (es_alt && array['A Cami no le gustan los huevos.']::text[]);

update public.sentences set es_alt = es_alt || array['A mis hermanos no les gustan nada las verduras.']::text[], note_en = coalesce(note_en, 'Argentines often say “la verdura” in the singular for vegetables in general.')
where id = '8609f3cc-a1d6-53b5-a67e-b2ac0fc9f3b4' and es = 'A mis hermanos no les gusta nada la verdura.' and en = 'My brothers don''t like vegetables at all.'
  and not (es_alt && array['A mis hermanos no les gustan nada las verduras.']::text[]);

update public.sentences set es_alt = es_alt || array['A nosotros nos gustan las verduras, pero a Juan no.', 'Nos gustan las verduras, pero a Juan no.']::text[], note_en = coalesce(note_en, 'Argentines often say “la verdura” in the singular for vegetables in general.')
where id = '5b5c2278-50b4-5865-a774-a7bbab45018c' and es = 'A nosotros nos gusta la verdura, pero a Juan no.' and en = 'We like vegetables, but Juan doesn''t.'
  and not (es_alt && array['A nosotros nos gustan las verduras, pero a Juan no.', 'Nos gustan las verduras, pero a Juan no.']::text[]);

update public.sentences set es_alt = es_alt || array['No me gustan las verduras.']::text[], note_en = coalesce(note_en, 'Argentines often say “la verdura” in the singular for vegetables in general.')
where id = '340a67ae-07ec-5a1b-b796-e559470d7059' and es = 'No me gusta la verdura.' and en = 'I don''t like vegetables.'
  and not (es_alt && array['No me gustan las verduras.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Practicás mucho? —No, practico muy poco porque laburo mucho.']::text[]
where id = '60fa8229-e96f-5d02-8080-4215cf18f223' and es = '—¿Practicás mucho? —No, practico poco porque laburo mucho.' and en = '—Do you practice a lot? —No, I practice very little because I work a lot.'
  and not (es_alt && array['—¿Practicás mucho? —No, practico muy poco porque laburo mucho.']::text[]);

update public.sentences set es_alt = es_alt || array['¡El pollo de tu vieja es rico!']::text[]
where id = '685ba609-0206-5953-b187-a82023c2f321' and es = '¡Qué rico el pollo de tu vieja!' and en = 'Your mom''s chicken is delicious!'
  and not (es_alt && array['¡El pollo de tu vieja es rico!']::text[]);

update public.sentences set es_alt = es_alt || array['Estudiamos en el café de la esquina.']::text[], note_en = coalesce(note_en, 'In Argentina a “bar” is often just a café where you sit down with a coffee.')
where id = '85cc8d0f-eaef-505b-9758-840f647e0d6f' and es = 'Estudiamos en el bar de la esquina.' and en = 'We study at the café on the corner.'
  and not (es_alt && array['Estudiamos en el café de la esquina.']::text[]);

update public.sentences set es_alt = es_alt || array['Nico no ayuda nada, está con su celu.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “his”, when it is obvious whose it is.')
where id = 'f6cfd43f-ade1-53f9-9a4a-403b274c8e27' and es = 'Nico no ayuda nada, está con el celu.' and en = 'Nico doesn''t help at all, he''s on his phone.'
  and not (es_alt && array['Nico no ayuda nada, está con su celu.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Hay sal en el arroz?']::text[]
where id = '4cbda113-cc80-5be7-999b-c9af4b01d7d5' and es = '¿El arroz tiene sal?' and en = 'Is there salt in the rice?'
  and not (es_alt && array['¿Hay sal en el arroz?']::text[]);

update public.sentences set es_alt = es_alt || array['El bar de la esquina tiene una picada rica.']::text[]
where id = 'c1a9a769-caf3-5654-a426-ce53f0e260ca' and es = 'En el bar de la esquina hay una picada rica.' and en = 'The bar on the corner has a tasty picada.'
  and not (es_alt && array['El bar de la esquina tiene una picada rica.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés clase hoy o estás libre?', '¿Hoy tenés clase o estás libre?']::text[], note_en = coalesce(note_en, '“Cursar” is the everyday Argentine verb for having or attending classes at university.')
where id = 'b91a66ab-c02d-5b0d-98dd-80a95a4129a3' and es = '¿Cursás hoy o estás libre?' and en = 'Do you have class today or are you free?'
  and not (es_alt && array['¿Tenés clase hoy o estás libre?', '¿Hoy tenés clase o estás libre?']::text[]);

update public.sentences set es_alt = es_alt || array['Hoy tengo que ir a clase.', 'Tengo que ir a clase hoy.']::text[], note_en = coalesce(note_en, '“Cursar” is the everyday Argentine verb for having or attending classes at university.')
where id = '538367a0-332f-5554-97f8-532b940a71f5' and es = 'Hoy tengo que cursar.' and en = 'I have to go to class today.'
  and not (es_alt && array['Hoy tengo que ir a clase.', 'Tengo que ir a clase hoy.']::text[]);

update public.sentences set es_alt = es_alt || array['Me gustan los profesores de mi facu.']::text[], note_en = coalesce(note_en, 'Spanish often says “la” where English says “my”, when it is obvious whose it is.')
where id = '19b34584-7727-5179-bfb4-eb9f6853a5ad' and es = 'Me gustan los profesores de la facu.' and en = 'I like the teachers at my college.'
  and not (es_alt && array['Me gustan los profesores de mi facu.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo que estudiar para mis clases de inglés.']::text[], note_en = coalesce(note_en, 'Spanish often says “las” where English says “my”, when it is obvious whose it is.')
where id = '5c50c03d-51b5-59e3-9b4f-35bfde8ed332' and es = 'Tengo que estudiar para las clases de inglés.' and en = 'I have to study for my English classes.'
  and not (es_alt && array['Tengo que estudiar para mis clases de inglés.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés una reunión?']::text[], note_en = coalesce(note_en, 'Argentines often drop "una" in "tener reunión". With "una" it is just as right.')
where id = '55bb6b73-273c-5c6f-9520-725e690fcd8b' and es = '¿Tenés reunión?' and en = 'Do you have a meeting?'
  and not (es_alt && array['¿Tenés una reunión?']::text[]);

update public.sentences set es_alt = es_alt || array['El jefe tiene una reunión con la abogada.']::text[], note_en = coalesce(note_en, 'Argentines often drop "una" in "tener reunión". With "una" it is just as right.')
where id = '170b5e6a-d518-59e3-9bf1-36eecfcca0a3' and es = 'El jefe tiene reunión con la abogada.' and en = 'The boss has a meeting with the lawyer.'
  and not (es_alt && array['El jefe tiene una reunión con la abogada.']::text[]);

update public.sentences set es_alt = es_alt || array['La empresa es brasileña.']::text[]
where id = 'fb4e9afc-b6c6-51be-84b6-fb6419ab8395' and es = 'La empresa es de Brasil.' and en = 'The company is Brazilian.'
  and not (es_alt && array['La empresa es brasileña.']::text[]);

update public.sentences set es_alt = es_alt || array['Laburo en una empresa en el centro.']::text[]
where id = '81f0f14b-8088-590a-b49a-97758e334244' and es = 'Laburo en una empresa del centro.' and en = 'I work at a company downtown.'
  and not (es_alt && array['Laburo en una empresa en el centro.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hermana es ingeniera en una empresa en Rosario.']::text[]
where id = 'c2f49ff7-ad97-5eb5-a77d-4b4e0da3cbed' and es = 'Mi hermana es ingeniera en una empresa de Rosario.' and en = 'My sister is an engineer at a company in Rosario.'
  and not (es_alt && array['Mi hermana es ingeniera en una empresa en Rosario.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi mamá es ingeniera y mi papá es periodista.']::text[], note_en = coalesce(note_en, 'Spanish can skip the second "es" and use a comma instead. Repeating "es" is just as right.')
where id = 'b052ef50-6c85-59e6-b9fb-a9518f6b40c1' and es = 'Mi mamá es ingeniera y mi papá, periodista.' and en = 'My mom is an engineer and my dad is a journalist.'
  and not (es_alt && array['Mi mamá es ingeniera y mi papá es periodista.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi marido es programador en una empresa canadiense.']::text[]
where id = 'd1836a2b-a037-52c9-8e90-0c14e3630b92' and es = 'Mi marido es programador en una empresa de Canadá.' and en = 'My husband is a programmer at a Canadian company.'
  and not (es_alt && array['Mi marido es programador en una empresa canadiense.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi tío es cocinero en un bar en el centro.']::text[]
where id = '73574ea2-d8f0-59cc-a9d8-ccdc495ca138' and es = 'Mi tío es cocinero en un bar del centro.' and en = 'My uncle is a cook at a bar downtown.'
  and not (es_alt && array['Mi tío es cocinero en un bar en el centro.']::text[]);

update public.sentences set es_alt = es_alt || array['Soy programadora y hoy tengo una reunión con mi jefa.', 'Soy programador y hoy tengo una reunión con mi jefa.']::text[], note_en = coalesce(note_en, 'Argentines often drop "una" in "tener reunión". With "una" it is just as right.')
where id = 'fd0c740a-6610-54e5-ba6d-67a9c6a08cfd' and es = 'Soy programadora y hoy tengo reunión con mi jefa.' and en = 'I''m a programmer and today I have a meeting with my boss.'
  and not (es_alt && array['Soy programadora y hoy tengo una reunión con mi jefa.', 'Soy programador y hoy tengo una reunión con mi jefa.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi tía es policía y mi tío es abogado.']::text[], note_en = coalesce(note_en, 'Spanish can skip the second "es" and use a comma instead. Repeating "es" is just as right.')
where id = '93933711-ba71-5d88-9833-eb9f6971ace5' and es = 'Mi tía es policía y mi tío, abogado.' and en = 'My aunt''s a police officer, and my uncle''s a lawyer.'
  and not (es_alt && array['Mi tía es policía y mi tío es abogado.']::text[]);

update public.sentences set es_alt = es_alt || array['Con el libro de la clase no aprendemos mucho.', 'No aprendemos mucho con el libro de la clase.']::text[], note_en = coalesce(note_en, 'Spanish often says "poco" where English says "not much".')
where id = '9c97fd2e-e1e7-5190-8853-35e5ab65a2b3' and es = 'Con el libro de la clase aprendemos poco.' and en = 'We don''t learn much from the class book.'
  and not (es_alt && array['Con el libro de la clase no aprendemos mucho.', 'No aprendemos mucho con el libro de la clase.']::text[]);

update public.sentences set es_alt = es_alt || array['Fede no habla mucho, pero aprende mucho.']::text[], note_en = coalesce(note_en, 'Spanish often says "poco" where English says "not much".')
where id = '4eb09488-ec0d-5bf2-a19b-07adb2dbe746' and es = 'Fede habla poco, pero aprende mucho.' and en = 'Fede doesn''t talk much, but he learns a lot.'
  and not (es_alt && array['Fede no habla mucho, pero aprende mucho.']::text[]);

update public.sentences set es_alt = es_alt || array['No leo mucho.']::text[], note_en = coalesce(note_en, 'Spanish often says "poco" where English says "not much".')
where id = '1e940460-95cb-553c-8247-c310ca3f98b8' and es = 'Leo poco.' and en = 'I don''t read much.'
  and not (es_alt && array['No leo mucho.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Por qué no está abierto el kiosco? ¿Está enfermo el señor?', '¿Por qué no está abierto el kiosco? ¿El señor está enfermo?']::text[]
where id = '8c1c0c66-8edc-50e4-ba7e-66c38d32a36d' and es = '¿Por qué no abre el kiosco? ¿Está enfermo el señor?' and en = 'Why isn''t the kiosco open? Is the man sick?'
  and not (es_alt && array['¿Por qué no está abierto el kiosco? ¿Está enfermo el señor?', '¿Por qué no está abierto el kiosco? ¿El señor está enfermo?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hermano y yo vendemos empanadas en la plaza.']::text[], note_en = coalesce(note_en, 'Argentines often say "Con mi hermano vendemos…" to mean "My brother and I sell…".')
where id = '8a864570-c63f-5ccb-8fc6-9a6d97eee6d4' and es = 'Con mi hermano vendemos empanadas en la plaza.' and en = 'My brother and I sell empanadas in the square.'
  and not (es_alt && array['Mi hermano y yo vendemos empanadas en la plaza.']::text[]);

update public.sentences set es_alt = es_alt || array['No vendo mucho porque no hay gente.']::text[], note_en = coalesce(note_en, 'Spanish often says "poco" where English says "not much".')
where id = '62f23c88-c782-54fe-bc38-b85a2b2e6c73' and es = 'Vendo poco porque no hay gente.' and en = 'I don''t sell much because there''s nobody around.'
  and not (es_alt && array['No vendo mucho porque no hay gente.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Compartís un departamento?']::text[], note_en = coalesce(note_en, 'In "compartir departamento" Argentines often leave out "un". With "un" it is just as right.')
where id = '8dc8025c-3bde-5190-9507-eae3663cfc17' and es = '¿Compartís departamento?' and en = 'Do you share an apartment?'
  and not (es_alt && array['¿Compartís un departamento?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Mati comparte un departamento con su novia?', '¿Mati comparte departamento con su novia?']::text[]
where id = '8687fc9a-1627-5bb6-b6f4-58e0ca33a2aa' and es = '¿Mati comparte el departamento con su novia?' and en = 'Does Mati share an apartment with his girlfriend?'
  and not (es_alt && array['¿Mati comparte un departamento con su novia?', '¿Mati comparte departamento con su novia?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Por qué no me escriben? ¿Está todo bien?']::text[], note_en = coalesce(note_en, '"¿Todo bien?" on its own is the everyday Argentine way to ask if everything is OK.')
where id = 'a804cf16-7a95-5750-ad14-9d2811fbf33a' and es = '¿Por qué no me escriben? ¿Todo bien?' and en = 'Why aren''t you guys writing to me? Is everything OK?'
  and not (es_alt && array['¿Por qué no me escriben? ¿Está todo bien?']::text[]);

update public.sentences set es_alt = es_alt || array['Ana y Diego comparten una oficina, pero no hablan.']::text[], note_en = coalesce(note_en, 'In "compartir oficina" Argentines often leave out "una". With "una" it is just as right.')
where id = '1f91a7fb-f298-540c-886b-b94d778a0918' and es = 'Ana y Diego comparten oficina, pero no hablan.' and en = 'Ana and Diego share an office, but they don''t talk.'
  and not (es_alt && array['Ana y Diego comparten una oficina, pero no hablan.']::text[]);

update public.sentences set es_alt = es_alt || array['Comparto un departamento con Santi.']::text[], note_en = coalesce(note_en, 'In "compartir departamento" Argentines often leave out "un". With "un" it is just as right.')
where id = '1cc63a69-bd3e-546d-8715-ce148de4a967' and es = 'Comparto departamento con Santi.' and en = 'I share an apartment with Santi.'
  and not (es_alt && array['Comparto un departamento con Santi.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Quieren una mesa afuera? —Sí, somos cuatro.']::text[], note_en = coalesce(note_en, 'In quick offers like "¿Quieren mesa?" Spanish often drops "una". With "una" it is just as right.')
where id = 'a87b6199-8ba4-5e9b-990a-df680dd6e870' and es = '—¿Quieren mesa afuera? —Sí, somos cuatro.' and en = '—Do you want a table outside? —Yes, there are four of us.'
  and not (es_alt && array['—¿Quieren una mesa afuera? —Sí, somos cuatro.']::text[]);

update public.sentences set es_alt = es_alt || array['¿El bar está abierto de noche?', '¿Está abierto el bar de noche?']::text[]
where id = '34a2763b-448b-59b0-a6e7-3d3d994ca4ea' and es = '¿El bar abre de noche?' and en = 'Is the bar open at night?'
  and not (es_alt && array['¿El bar está abierto de noche?', '¿Está abierto el bar de noche?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué tenés en la mochila?']::text[], note_en = coalesce(note_en, 'Spanish often uses "traer" for what you are carrying with you: "¿Qué traés?" is "What have you got on you?".')
where id = '786b8417-d9f1-5171-b049-cc05a816ffdb' and es = '¿Qué traés en la mochila?' and en = 'What have you got in your backpack?'
  and not (es_alt && array['¿Qué tenés en la mochila?']::text[]);

update public.sentences set es_alt = es_alt || array['Juan y yo compartimos la compu.']::text[], note_en = coalesce(note_en, 'Argentines often say "Con Juan compartimos…" to mean "Juan and I share…".')
where id = '56104cc6-7748-5e07-94a8-4bccaacf2bf6' and es = 'Con Juan compartimos la compu.' and en = 'Juan and I share the computer.'
  and not (es_alt && array['Juan y yo compartimos la compu.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hermano y yo vendemos alfajores en la facu.']::text[], note_en = coalesce(note_en, 'Argentines often say "Con mi hermano vendemos…" to mean "My brother and I sell…".')
where id = '0e9a6505-4eb1-5057-a933-a64399ba28a5' and es = 'Con mi hermano vendemos alfajores en la facu.' and en = 'My brother and I sell alfajores at college.'
  and not (es_alt && array['Mi hermano y yo vendemos alfajores en la facu.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi marido y yo vendemos fruta y verdura en la esquina.']::text[], note_en = coalesce(note_en, 'Argentines often say "Con mi marido vendemos…" to mean "My husband and I sell…".')
where id = 'f576fd0f-5c29-51d8-8ea8-9220bb435101' and es = 'Con mi marido vendemos fruta y verdura en la esquina.' and en = 'My husband and I sell fruit and vegetables on the corner.'
  and not (es_alt && array['Mi marido y yo vendemos fruta y verdura en la esquina.']::text[]);

update public.sentences set es_alt = es_alt || array['El negocio no está abierto porque Fede está enfermo.']::text[]
where id = 'a7f66458-0ae6-5ef0-8326-401a945b0538' and es = 'El negocio no abre porque Fede está enfermo.' and en = 'The store isn''t open because Fede is sick.'
  and not (es_alt && array['El negocio no está abierto porque Fede está enfermo.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hermana es enfermera y comparte un departamento con una médica.']::text[], note_en = coalesce(note_en, 'In "compartir departamento" Argentines often leave out "un". With "un" it is just as right.')
where id = '99db46d6-1e78-51ed-9459-60f697ad27ad' and es = 'Mi hermana es enfermera y comparte departamento con una médica.' and en = 'My sister is a nurse and shares an apartment with a doctor.'
  and not (es_alt && array['Mi hermana es enfermera y comparte un departamento con una médica.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Ascensor o escalera? —Escalera, estoy apurada.']::text[]
where id = 'e6a0c519-74cb-5460-b54d-291829f9e57b' and es = '—¿Ascensor o escalera? —Escalera, estoy apurado.' and en = '—Elevator or stairs? —Stairs, I''m in a hurry.'
  and not (es_alt && array['—¿Ascensor o escalera? —Escalera, estoy apurada.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cómo es el depto? —Bien, pero medio lejos.']::text[], note_en = coalesce(note_en, '“¿Qué onda…?” is the casual Argentine way to ask what something is like.')
where id = '81712979-ea86-58da-929d-805447f42554' and es = '—¿Qué onda el depto? —Bien, pero medio lejos.' and en = '—What''s the apartment like? —Good, but kind of far.'
  and not (es_alt && array['—¿Cómo es el depto? —Bien, pero medio lejos.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me traés algo de la heladera?']::text[], note_en = coalesce(note_en, 'Argentines usually ask for things with the plain present: “¿me traés…?” already sounds like “can you bring me…?”.')
where id = '4bb9292a-4fd6-5610-a9a0-32c6c7aa37d3' and es = '¿Me traés una cosa de la heladera?' and en = 'Can you bring me something from the fridge?'
  and not (es_alt && array['¿Me traés algo de la heladera?']::text[]);

update public.sentences set es_alt = es_alt || array['Diego, ¿cuántas sillas tenés en casa?']::text[]
where id = '361ad522-c0fe-5839-a3d4-ef71fa7f79b8' and es = 'Diego, ¿cuántas sillas tenés en tu casa?' and en = 'Diego, how many chairs do you have at home?'
  and not (es_alt && array['Diego, ¿cuántas sillas tenés en casa?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi viejo está en el sillón con su mate.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “his” when it is obvious whose thing it is.')
where id = '90aac8d0-56fe-533e-94ab-ad70524d9e57' and es = 'Mi viejo está en el sillón con el mate.' and en = 'My dad is on the couch with his mate.'
  and not (es_alt && array['Mi viejo está en el sillón con su mate.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Sesenta cuadras? Voy a tomar el subte.']::text[], note_en = coalesce(note_en, 'For something you decide on the spot, Argentines often use the plain present where English says “I''ll”.')
where id = '9ae7c192-1af8-5b8c-8a86-f372815b5d37' and es = '¿Sesenta cuadras? Tomo el subte.' and en = 'Sixty blocks? I''ll take the subway.'
  and not (es_alt && array['¿Sesenta cuadras? Voy a tomar el subte.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hermana y yo hablamos horas.']::text[], note_en = coalesce(note_en, 'Argentines often say “con mi hermana hablamos” to mean “my sister and I talk”: the “we” is already in the verb.')
where id = '6083f07d-c168-5aa3-ad42-ec724971fa57' and es = 'Con mi hermana hablamos horas.' and en = 'My sister and I talk for hours.'
  and not (es_alt && array['Mi hermana y yo hablamos horas.']::text[]);

update public.sentences set es_alt = es_alt || array['El domingo vamos a tomar mate.']::text[], note_en = coalesce(note_en, 'For plans, Argentines often use the plain present where English says “we''ll”.')
where id = 'c8fa5f63-9a44-5dd5-9a51-b73c460c77be' and es = 'El domingo tomamos mate.' and en = 'On Sunday we''ll have mate.'
  and not (es_alt && array['El domingo vamos a tomar mate.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Hace cuánto laburás acá? —Desde los veintiséis.', '—¿Hace cuánto que laburás acá? —Desde los veintiséis.']::text[]
where id = 'a43e5163-06ee-5f3f-ab2d-274c4efae317' and es = '—¿Desde cuándo laburás acá? —Desde los veintiséis.' and en = '—How long have you worked here? —Since I was twenty-six.'
  and not (es_alt && array['—¿Hace cuánto laburás acá? —Desde los veintiséis.', '—¿Hace cuánto que laburás acá? —Desde los veintiséis.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Hace cuánto vivís en Rosario?', '¿Hace cuánto que vivís en Rosario?']::text[]
where id = 'fe255407-8d18-5dea-8961-5c971e4f01e4' and es = '¿Desde cuándo vivís en Rosario?' and en = 'How long have you lived in Rosario?'
  and not (es_alt && array['¿Hace cuánto vivís en Rosario?', '¿Hace cuánto que vivís en Rosario?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hija tiene veintiocho años y nunca tiene un minuto libre.']::text[], note_en = coalesce(note_en, 'When talking about age, Argentines often drop “años” and just say the number.')
where id = 'ae2c14f0-82ec-5090-8a2b-730a5b9f0f6b' and es = 'Mi hija tiene veintiocho y nunca tiene un minuto libre.' and en = 'My daughter is twenty-eight and never has a free minute.'
  and not (es_alt && array['Mi hija tiene veintiocho años y nunca tiene un minuto libre.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés tu documento?']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “your” when it is obvious whose thing it is.')
where id = '48284166-5e91-5143-89b1-857c7a854e72' and es = '¿Tenés el documento?' and en = 'Do you have your ID?'
  and not (es_alt && array['¿Tenés tu documento?']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo mi pasaporte acá.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my” when it is obvious whose thing it is.')
where id = '8fc32c7c-977d-540c-a0fd-31ee30cee1d0' and es = 'No tengo el pasaporte acá.' and en = 'I don''t have my passport here.'
  and not (es_alt && array['No tengo mi pasaporte acá.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Hay un supermercado cerca? —Sí, en la esquina.']::text[], note_en = coalesce(note_en, 'Argentines usually shorten “supermercado” to “súper” in everyday talk.')
where id = 'f5af1cf4-31a5-5481-88bc-607c76bf7438' and es = '—¿Hay un súper cerca? —Sí, en la esquina.' and en = '—Is there a supermarket nearby? —Yes, on the corner.'
  and not (es_alt && array['—¿Hay un supermercado cerca? —Sí, en la esquina.']::text[]);

update public.sentences set es_alt = es_alt || array['El kiosco está enfrente.']::text[], note_en = coalesce(note_en, 'Argentines often say “la vereda de enfrente”, literally “the sidewalk across the way”, for the other side of the street. Plain “enfrente” means the same.')
where id = 'fe441f15-d30a-5c99-9625-800a270f8702' and es = 'El kiosco está en la vereda de enfrente.' and en = 'The kiosco is across the street.'
  and not (es_alt && array['El kiosco está enfrente.']::text[]);

update public.sentences set es_alt = es_alt || array['La farmacia está enfrente.']::text[], note_en = coalesce(note_en, 'Argentines often say “la vereda de enfrente”, literally “the sidewalk across the way”, for the other side of the street. Plain “enfrente” means the same.')
where id = '044ee8da-1439-5594-85d9-e11a70e2eb9c' and es = 'La farmacia está en la vereda de enfrente.' and en = 'The pharmacy is across the street.'
  and not (es_alt && array['La farmacia está enfrente.']::text[]);

update public.sentences set es_alt = es_alt || array['Che, el bar de enfrente tiene buena pinta.']::text[], note_en = coalesce(note_en, 'In Argentina “tiene pinta” on its own already means it looks good. “Tiene buena pinta” says the same thing.')
where id = '74122b04-3389-5713-834d-7300c750e577' and es = 'Che, el bar de enfrente tiene pinta.' and en = 'Hey, the bar across the street looks good.'
  and not (es_alt && array['Che, el bar de enfrente tiene buena pinta.']::text[]);

update public.sentences set es_alt = es_alt || array['La rotisería de la esquina tiene buena pinta.']::text[], note_en = coalesce(note_en, 'In Argentina “tiene pinta” on its own already means it looks good. “Tiene buena pinta” says the same thing.')
where id = '4043b751-bf9c-5c61-84cb-92fc71d916d1' and es = 'La rotisería de la esquina tiene pinta.' and en = 'The takeout shop on the corner looks good.'
  and not (es_alt && array['La rotisería de la esquina tiene buena pinta.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Querés salir a comer pizza el sábado?']::text[], note_en = coalesce(note_en, 'Argentines often suggest a plan with a plain “we” question: “¿Salimos?” works like “Want to go out?”.')
where id = 'ba1681d1-7c31-5b55-8889-faf33d22974b' and es = '¿Salimos a comer pizza el sábado?' and en = 'Want to go out for pizza on Saturday?'
  and not (es_alt && array['¿Querés salir a comer pizza el sábado?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Querés ir juntas a la fiesta de Diego?', '¿Querés ir juntos a la fiesta de Diego?']::text[], note_en = coalesce(note_en, 'Argentines often suggest a plan with a plain “we” question: “¿Vamos juntas?” works like “Want to go together?”.')
where id = 'b0e3d28f-433b-5ec1-b609-dc8249072fb4' and es = '¿Vamos juntas a la fiesta de Diego?' and en = 'Want to go to Diego''s party together?'
  and not (es_alt && array['¿Querés ir juntas a la fiesta de Diego?', '¿Querés ir juntos a la fiesta de Diego?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi novia prefiere el teatro y yo prefiero el cine.']::text[], note_en = coalesce(note_en, 'Spanish often skips a repeated verb: “y yo el cine” is understood as “and I prefer the movies”.')
where id = '86466bc1-acc6-5d02-8273-80589450f3e6' and es = 'Mi novia prefiere el teatro y yo el cine.' and en = 'My girlfriend prefers the theater and I prefer the movies.'
  and not (es_alt && array['Mi novia prefiere el teatro y yo prefiero el cine.']::text[]);

update public.sentences set es_alt = es_alt || array['Prefiero ir al cine, hoy estoy cansado.', 'Prefiero ir al cine, hoy estoy cansada.']::text[]
where id = '551daf68-38f1-5c8e-9cf2-30ea85280d03' and es = 'Prefiero el cine, hoy estoy cansado.' and en = 'I''d rather go to the movies, I''m tired today.'
  and not (es_alt && array['Prefiero ir al cine, hoy estoy cansado.', 'Prefiero ir al cine, hoy estoy cansada.']::text[]);

update public.sentences set es_alt = es_alt || array['Voy a Brasil y vuelvo en quince días.']::text[], note_en = coalesce(note_en, 'Argentines often say “quince días” (fifteen days) where English says “two weeks”. “Dos semanas” is fine too.')
where id = 'd511bf92-ebf8-5fdb-ace4-bca3676e6bcb' and es = 'Me voy a Brasil y vuelvo en quince días.' and en = 'I''m going to Brazil and coming back in two weeks.'
  and not (es_alt && array['Voy a Brasil y vuelvo en quince días.']::text[]);

update public.sentences set es_alt = es_alt || array['Si la fiesta empieza a las doce, prefiero ir al cine.']::text[]
where id = '2d85a1e8-cb17-5868-b77a-19085910188f' and es = 'Si la fiesta empieza a las doce, prefiero el cine.' and en = 'If the party starts at midnight, I''d rather go to the movies.'
  and not (es_alt && array['Si la fiesta empieza a las doce, prefiero ir al cine.']::text[]);

update public.sentences set es_alt = es_alt || array['Salgo a las seis, ¿me podés buscar en la esquina?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿Me buscás?” works like “Can you pick me up?”.')
where id = '617bc474-1e17-5f35-82fc-a91888c57be0' and es = 'Salgo a las seis, ¿me buscás en la esquina?' and en = 'I leave at six, can you pick me up on the corner?'
  and not (es_alt && array['Salgo a las seis, ¿me podés buscar en la esquina?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Podés venir a mi casa? Tengo unas cosas para vos.']::text[], note_en = coalesce(note_en, 'Argentines often say just “casa” for their own home: “vení a casa” means “come to my place”.')
where id = 'a257d7ca-ed82-534d-a14c-4b12b02384e3' and es = '¿Podés venir a casa? Tengo unas cosas para vos.' and en = 'Can you come to my house? I have some things for you.'
  and not (es_alt && array['¿Podés venir a mi casa? Tengo unas cosas para vos.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenemos que esperar unos diez minutos.']::text[], note_en = coalesce(note_en, '“Hay que” is an impersonal “one has to”. Argentines use it all the time where English says “we have to”.')
where id = '2f7f7051-b82d-5508-af9b-40c665565387' and es = 'Hay que esperar unos diez minutos.' and en = 'We have to wait about ten minutes.'
  and not (es_alt && array['Tenemos que esperar unos diez minutos.']::text[]);

update public.sentences set es_alt = es_alt || array['Sentate, te tengo que decir algo.']::text[], note_en = coalesce(note_en, 'This “que” is a casual “because”: Argentines often use it to link a command to its reason.')
where id = '8dbedffe-f743-5d0d-b97b-031c87770944' and es = 'Sentate, que te tengo que decir algo.' and en = 'Sit down, I have to tell you something.'
  and not (es_alt && array['Sentate, te tengo que decir algo.']::text[]);

update public.sentences set es_alt = es_alt || array['Vení unos días a nuestra casa, tenemos una pieza libre.']::text[], note_en = coalesce(note_en, '“Casa” with no “mi” or “nuestra” already means my or our home.')
where id = 'f98bba21-bdab-5344-bca5-fd6cd35743ed' and es = 'Vení unos días a casa, tenemos una pieza libre.' and en = 'Come to our house for a few days, we have a free bedroom.'
  and not (es_alt && array['Vení unos días a nuestra casa, tenemos una pieza libre.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Querés pasar por mi casa?']::text[], note_en = coalesce(note_en, '“Casa” with no “mi” already means my home.')
where id = '951150df-d2b7-59ed-803e-ff49e7fa62f5' and es = '¿Querés pasar por casa?' and en = 'Do you want to come by my place?'
  and not (es_alt && array['¿Querés pasar por mi casa?']::text[]);

update public.sentences set es_alt = es_alt || array['Escuchá, mañana no puedo ir a tu casa.']::text[], note_en = coalesce(note_en, '“Escuchame” (listen to me) is a very common way to get someone''s attention.')
where id = 'fe2933fb-c7b3-5b4f-82dc-31a8f2029c69' and es = 'Escuchame, mañana no puedo ir a tu casa.' and en = 'Listen, I can''t go to your house tomorrow.'
  and not (es_alt && array['Escuchá, mañana no puedo ir a tu casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Escuchá, por favor.']::text[], note_en = coalesce(note_en, '“Escuchame” (listen to me) is a very common way to get someone''s attention.')
where id = '334de3dc-a2a7-51e7-ab4b-49934c5829f9' and es = 'Escuchame, por favor.' and en = 'Listen, please.'
  and not (es_alt && array['Escuchá, por favor.']::text[]);

update public.sentences set es_alt = es_alt || array['Escuchá, tengo que hablar con vos.']::text[], note_en = coalesce(note_en, '“Escuchame” (listen to me) is a very common way to get someone''s attention.')
where id = '7aa24673-4c6a-5e07-b86b-d408eae3f76f' and es = 'Escuchame, tengo que hablar con vos.' and en = 'Listen, I have to talk to you.'
  and not (es_alt && array['Escuchá, tengo que hablar con vos.']::text[]);

update public.sentences set es_alt = es_alt || array['Podés pasar por mi casa mañana.']::text[], note_en = coalesce(note_en, '“Casa” with no “mi” already means my home.')
where id = '5a844507-25e9-5ffd-9deb-740b3a1b86d2' and es = 'Podés pasar por casa mañana.' and en = 'You can come by my house tomorrow.'
  and not (es_alt && array['Podés pasar por mi casa mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Sentate, tenemos que esperar un momento.']::text[], note_en = coalesce(note_en, '“Hay que” is an impersonal “one has to”. Argentines use it all the time where English says “we have to”.')
where id = '297c83ff-0f42-5e31-b33c-7580d402600b' and es = 'Sentate, hay que esperar un momento.' and en = 'Sit down, we have to wait a moment.'
  and not (es_alt && array['Sentate, tenemos que esperar un momento.']::text[]);

update public.sentences set es_alt = es_alt || array['Acá está la cuenta.', 'Acá tenés la cuenta.']::text[], note_en = coalesce(note_en, 'Argentines hand things over with “Tomá” (take), where English says “Here''s…”.')
where id = '912743f1-cd18-53ec-9676-00e01a9f5b75' and es = 'Tomá, la cuenta.' and en = 'Here''s the check.'
  and not (es_alt && array['Acá está la cuenta.', 'Acá tenés la cuenta.']::text[]);

update public.sentences set es_alt = es_alt || array['Acá está tu café.', 'Acá tenés tu café.']::text[], note_en = coalesce(note_en, 'Argentines hand things over with “Tomá” (take), where English says “Here''s…”.')
where id = '9acf549e-5193-588c-b7a8-1cf312faecb6' and es = 'Tomá, tu café.' and en = 'Here''s your coffee.'
  and not (es_alt && array['Acá está tu café.', 'Acá tenés tu café.']::text[]);

update public.sentences set es_alt = es_alt || array['¿La farmacia? Andá derecho, está en la esquina.']::text[], note_en = coalesce(note_en, '“Seguí derecho” (keep straight) and “andá derecho” (go straight) are both everyday directions.')
where id = 'e850028f-27c6-5c32-863b-8993114c2109' and es = '¿La farmacia? Seguí derecho, está en la esquina.' and en = 'The pharmacy? Go straight, it''s on the corner.'
  and not (es_alt && array['¿La farmacia? Andá derecho, está en la esquina.']::text[]);

update public.sentences set es_alt = es_alt || array['Seguí derecho hasta la avenida.']::text[]
where id = 'c7dc43f3-13b9-5683-9514-47f1d57557c6' and es = 'Andá derecho hasta la avenida.' and en = 'Go straight to the avenue.'
  and not (es_alt && array['Seguí derecho hasta la avenida.']::text[]);

update public.sentences set es_alt = es_alt || array['Seguí derecho, es cerca.']::text[]
where id = '65df2c42-de41-5f8d-8e09-5ac137dc8b45' and es = 'Andá derecho, es cerca.' and en = 'Go straight, it''s close.'
  and not (es_alt && array['Seguí derecho, es cerca.']::text[]);

update public.sentences set es_alt = es_alt || array['Cruzá la plaza y andá derecho.']::text[], note_en = coalesce(note_en, '“Seguí derecho” (keep straight) and “andá derecho” (go straight) are both everyday directions.')
where id = 'a2d3d897-30f8-5d68-83ec-1818718f3761' and es = 'Cruzá la plaza y seguí derecho.' and en = 'Cross the square and go straight.'
  and not (es_alt && array['Cruzá la plaza y andá derecho.']::text[]);

update public.sentences set es_alt = es_alt || array['Cruzá acá, Rocío.']::text[], note_en = coalesce(note_en, '“Por acá” means “this way” or “through here”; it sounds a little looser than plain “acá”.')
where id = '1423dc04-c314-5f5f-8756-fbc15dd3ffaf' and es = 'Cruzá por acá, Rocío.' and en = 'Cross here, Rocío.'
  and not (es_alt && array['Cruzá acá, Rocío.']::text[]);

update public.sentences set es_alt = es_alt || array['Necesito cruzar al otro lado de la calle.']::text[], note_en = coalesce(note_en, '“Vereda” is the sidewalk. Argentines say “la otra vereda” for the other side of the street.')
where id = 'cf3233d4-9de9-56b8-8cab-2d7578cf0315' and es = 'Necesito cruzar a la otra vereda.' and en = 'I need to cross to the other side of the street.'
  and not (es_alt && array['Necesito cruzar al otro lado de la calle.']::text[]);

update public.sentences set es_alt = es_alt || array['Andá derecho dos cuadras.']::text[], note_en = coalesce(note_en, '“Seguí derecho” (keep straight) and “andá derecho” (go straight) are both everyday directions.')
where id = '4546199d-605f-5b73-aff5-bbd441a2b051' and es = 'Seguí derecho dos cuadras.' and en = 'Go straight for two blocks.'
  and not (es_alt && array['Andá derecho dos cuadras.']::text[]);

update public.sentences set es_alt = es_alt || array['Andá derecho y doblá en la avenida.']::text[], note_en = coalesce(note_en, '“Seguí derecho” (keep straight) and “andá derecho” (go straight) are both everyday directions.')
where id = 'be7c689d-45de-529c-841e-59d1de4c389c' and es = 'Seguí derecho y doblá en la avenida.' and en = 'Go straight and turn at the avenue.'
  and not (es_alt && array['Andá derecho y doblá en la avenida.']::text[]);

update public.sentences set es_alt = es_alt || array['Decime la calle y el número.']::text[], note_en = coalesce(note_en, 'In Argentine addresses, “la altura” is the street number: how far along the street you are.')
where id = 'de310fd9-0a6f-5b86-94d7-aa2154577783' and es = 'Decime la calle y la altura.' and en = 'Tell me the street and the number.'
  and not (es_alt && array['Decime la calle y el número.']::text[]);

update public.sentences set es_alt = es_alt || array['—A Palermo, por favor. —No tenés saldo.']::text[], note_en = coalesce(note_en, 'On the bus you tell the driver how far you are going, so Argentines say “hasta” (as far as).')
where id = 'cf9fe465-b23b-5882-bf55-3ff14c0acadb' and es = '—Hasta Palermo, por favor. —No tenés saldo.' and en = '—To Palermo, please. —You have no balance.'
  and not (es_alt && array['—A Palermo, por favor. —No tenés saldo.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde cargás tu SUBE?']::text[], note_en = coalesce(note_en, 'Argentines usually say “la SUBE” with the article; whose it is is clear from context.')
where id = 'f2e85d02-efc5-5d87-9f16-9c4fdc0a3b1c' and es = '¿Dónde cargás la SUBE?' and en = 'Where do you load your SUBE?'
  and not (es_alt && array['¿Dónde cargás tu SUBE?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde puedo cargar mi SUBE?']::text[], note_en = coalesce(note_en, 'Argentines usually say “la SUBE” with the article; whose it is is clear from context.')
where id = 'ebeda9c3-37c8-542e-89d9-53bc72af7f5f' and es = '¿Dónde puedo cargar la SUBE?' and en = 'Where can I load my SUBE?'
  and not (es_alt && array['¿Dónde puedo cargar mi SUBE?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde puedo ver el saldo de mi SUBE?']::text[], note_en = coalesce(note_en, 'Argentines usually say “la SUBE” with the article; whose it is is clear from context.')
where id = '7896b42e-1d44-57f7-bd36-fd2757166f45' and es = '¿Dónde puedo ver el saldo de la SUBE?' and en = 'Where can I see the balance on my SUBE?'
  and not (es_alt && array['¿Dónde puedo ver el saldo de mi SUBE?']::text[]);

update public.sentences set es_alt = es_alt || array['¿El boleto es más caro si voy a Palermo?']::text[], note_en = coalesce(note_en, '“Hasta” (as far as) is natural here because the fare depends on how far you ride.')
where id = 'e2436c76-1caf-5803-b52b-7ff442b826c8' and es = '¿El boleto es más caro si voy hasta Palermo?' and en = 'Is the fare more expensive if I go to Palermo?'
  and not (es_alt && array['¿El boleto es más caro si voy a Palermo?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés cargar la SUBE, por favor?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿Me cargás…?” already means “Can you load…?”')
where id = '540322df-d258-516a-82a7-d82c6e9af405' and es = '¿Me cargás la SUBE, por favor?' and en = 'Can you load my SUBE, please?'
  and not (es_alt && array['¿Me podés cargar la SUBE, por favor?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Sabés dónde puedo cargar mi SUBE por acá?']::text[], note_en = coalesce(note_en, 'Argentines usually say “la SUBE” with the article; whose it is is clear from context.')
where id = 'aea8ff75-3673-5ead-8e22-d31e6eb515d6' and es = '¿Sabés dónde puedo cargar la SUBE por acá?' and en = 'Do you know where I can load my SUBE around here?'
  and not (es_alt && array['¿Sabés dónde puedo cargar mi SUBE por acá?']::text[]);

update public.sentences set es_alt = es_alt || array['Bajate en la próxima parada.']::text[], note_en = coalesce(note_en, 'On the bus or subte Argentines usually just say “la próxima”; the stop is understood.')
where id = 'ed255eeb-c8ff-5d0a-93b0-6e2ce8346b20' and es = 'Bajate en la próxima.' and en = 'Get off at the next stop.'
  and not (es_alt && array['Bajate en la próxima parada.']::text[]);

update public.sentences set es_alt = es_alt || array['Cargo mi celu y salgo.']::text[], note_en = coalesce(note_en, 'Argentines often say “el celu” with the article; whose it is is clear from context.')
where id = 'a54d8ce7-d198-5d09-89e6-193a19275b7e' and es = 'Cargo el celu y salgo.' and en = 'I''ll charge my phone and go out.'
  and not (es_alt && array['Cargo mi celu y salgo.']::text[]);

update public.sentences set es_alt = es_alt || array['El boleto es caro.']::text[], note_en = coalesce(note_en, '“Está caro” suggests the price feels high right now, which is how Argentines often talk about prices.')
where id = 'bbf9549b-2957-57bd-b1bf-26541a0347e1' and es = 'El boleto está caro.' and en = 'The fare is expensive.'
  and not (es_alt && array['El boleto es caro.']::text[]);

update public.sentences set es_alt = es_alt || array['En la próxima parada, por favor.']::text[], note_en = coalesce(note_en, 'On the bus or subte Argentines usually just say “la próxima”; the stop is understood.')
where id = '2c09d79c-ea2a-5080-87fa-925d9f22d450' and es = 'En la próxima, por favor.' and en = 'The next stop, please.'
  and not (es_alt && array['En la próxima parada, por favor.']::text[]);

update public.sentences set es_alt = es_alt || array['Esperame en la parada, cargo mi SUBE y vuelvo.']::text[], note_en = coalesce(note_en, 'Argentines usually say “la SUBE” with the article; whose it is is clear from context.')
where id = '9ec47c18-0145-5e59-8e2b-671aa2e82577' and es = 'Esperame en la parada, cargo la SUBE y vuelvo.' and en = 'Wait for me at the stop, I''ll load my SUBE and come back.'
  and not (es_alt && array['Esperame en la parada, cargo mi SUBE y vuelvo.']::text[]);

update public.sentences set es_alt = es_alt || array['Hoy cargo mi SUBE.']::text[], note_en = coalesce(note_en, 'Argentines usually say “la SUBE” with the article; whose it is is clear from context.')
where id = 'd77bc810-9282-5c47-bab1-157a8cd5c4ff' and es = 'Hoy cargo la SUBE.' and en = 'I''m loading my SUBE today.'
  and not (es_alt && array['Hoy cargo mi SUBE.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana cargo mi SUBE y voy al centro.']::text[], note_en = coalesce(note_en, 'Argentines usually say “la SUBE” with the article; whose it is is clear from context.')
where id = '2d3ec6d5-3a99-5eb2-8d00-33893af92f18' and es = 'Mañana cargo la SUBE y voy al centro.' and en = 'Tomorrow I''ll load my SUBE and go downtown.'
  and not (es_alt && array['Mañana cargo mi SUBE y voy al centro.']::text[]);

update public.sentences set es_alt = es_alt || array['Me bajo en la próxima parada.']::text[], note_en = coalesce(note_en, 'On the bus or subte Argentines usually just say “la próxima”; the stop is understood.')
where id = 'e1fdd9d8-08a2-5164-871c-aac76f8360ba' and es = 'Me bajo en la próxima.' and en = 'I''m getting off at the next stop.'
  and not (es_alt && array['Me bajo en la próxima parada.']::text[]);

update public.sentences set es_alt = es_alt || array['Me faltan doscientos pesos para cargar mi SUBE.']::text[], note_en = coalesce(note_en, 'Argentines usually say “la SUBE” with the article; whose it is is clear from context.')
where id = 'b99d82f7-ba37-5c04-a6c9-8dfd72fe8f13' and es = 'Me faltan doscientos pesos para cargar la SUBE.' and en = 'I need two hundred more pesos to load my SUBE.'
  and not (es_alt && array['Me faltan doscientos pesos para cargar mi SUBE.']::text[]);

update public.sentences set es_alt = es_alt || array['Necesito cargar mi SUBE.']::text[], note_en = coalesce(note_en, 'Argentines usually say “la SUBE” with the article; whose it is is clear from context.')
where id = 'ddb649be-574a-549a-8fe4-5738d712d268' and es = 'Necesito cargar la SUBE.' and en = 'I need to load my SUBE.'
  and not (es_alt && array['Necesito cargar mi SUBE.']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo saldo en mi SUBE.']::text[], note_en = coalesce(note_en, 'Argentines usually say “la SUBE” with the article; whose it is is clear from context.')
where id = '8b87a027-486f-5fa1-83eb-0578e7c27ebc' and es = 'No tengo saldo en la SUBE.' and en = 'I don''t have any balance on my SUBE.'
  and not (es_alt && array['No tengo saldo en mi SUBE.']::text[]);

update public.sentences set es_alt = es_alt || array['Pago el boleto con mi SUBE.']::text[], note_en = coalesce(note_en, 'Argentines usually say “la SUBE” with the article; whose it is is clear from context.')
where id = '60c4fb2f-1686-55bc-b0f8-9a93a3425557' and es = 'Pago el boleto con la SUBE.' and en = 'I pay the fare with my SUBE.'
  and not (es_alt && array['Pago el boleto con mi SUBE.']::text[]);

update public.sentences set es_alt = es_alt || array['Perdón, no tengo saldo, ¿me podés pagar el boleto hasta Palermo?', 'Perdón, no tengo saldo, ¿me pagás el boleto a Palermo?', 'Perdón, no tengo saldo, ¿me podés pagar el boleto a Palermo?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿Me pagás…?” already means “Can you pay…?”')
where id = 'b0b4b07d-e017-5b8a-88a5-2a641ca194e6' and es = 'Perdón, no tengo saldo, ¿me pagás el boleto hasta Palermo?' and en = 'Sorry, I have no balance, can you pay my fare to Palermo?'
  and not (es_alt && array['Perdón, no tengo saldo, ¿me podés pagar el boleto hasta Palermo?', 'Perdón, no tengo saldo, ¿me pagás el boleto a Palermo?', 'Perdón, no tengo saldo, ¿me podés pagar el boleto a Palermo?']::text[]);

update public.sentences set es_alt = es_alt || array['Quiero cargar mi celu.']::text[], note_en = coalesce(note_en, 'Argentines often say “el celu” with the article; whose it is is clear from context.')
where id = '9f360e8c-5823-58d0-9665-58415e25106e' and es = 'Quiero cargar el celu.' and en = 'I want to charge my phone.'
  and not (es_alt && array['Quiero cargar mi celu.']::text[]);

update public.sentences set es_alt = es_alt || array['Si cargás tu SUBE hoy, mañana salimos temprano.']::text[], note_en = coalesce(note_en, 'Argentines usually say “la SUBE” with the article; whose it is is clear from context.')
where id = '135e7b84-5d92-5252-beff-4133218a677f' and es = 'Si cargás la SUBE hoy, mañana salimos temprano.' and en = 'If you load your SUBE today, we''ll leave early tomorrow.'
  and not (es_alt && array['Si cargás tu SUBE hoy, mañana salimos temprano.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Podés abrir el baúl?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿Abrís…?” already means “Can you open…?”')
where id = '9e0bd553-99c4-5440-9ebc-3b3ca05b260d' and es = '¿Abrís el baúl?' and en = 'Can you open the trunk?'
  and not (es_alt && array['¿Podés abrir el baúl?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar a pedir un remis para mañana?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿Me ayudás…?” already means “Can you help me…?”')
where id = 'b9e773e2-5665-5f3d-bef1-b542cb22d40b' and es = '¿Me ayudás a pedir un remis para mañana?' and en = 'Can you help me order a hired car for tomorrow?'
  and not (es_alt && array['¿Me podés ayudar a pedir un remis para mañana?']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo la app en mi celu.']::text[], note_en = coalesce(note_en, 'Argentines often say “el celu” with the article; whose it is is clear from context.')
where id = '2ad184e5-3ea3-5062-884f-6de89fe5c744' and es = 'Tengo la app en el celu.' and en = 'I have the app on my phone.'
  and not (es_alt && array['Tengo la app en mi celu.']::text[]);

update public.sentences set es_alt = es_alt || array['Acá tenés diez mil y quedate con el vuelto.']::text[], note_en = coalesce(note_en, 'Argentines hand things over with “Tomá” (take), where English says “Here''s…”.')
where id = 'fa4cc2ff-532c-5b54-b927-66fb8d5ad1df' and es = 'Tomá diez mil y quedate con el vuelto.' and en = 'Here''s ten thousand, and keep the change.'
  and not (es_alt && array['Acá tenés diez mil y quedate con el vuelto.']::text[]);

update public.sentences set es_alt = es_alt || array['—Me robaron el celu. —¡Qué mala suerte!']::text[], note_en = coalesce(note_en, '“Mala leche” is casual Argentine for bad luck.')
where id = 'e6970cdb-6907-53ce-944f-3fbb75035c03' and es = '—Me robaron el celu. —¡Qué mala leche!' and en = '—They stole my phone. —What bad luck!'
  and not (es_alt && array['—Me robaron el celu. —¡Qué mala suerte!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Cuidado con el perro!']::text[], note_en = coalesce(note_en, '“Guarda” is a casual Argentine “watch out”, the same as “cuidado”.')
where id = 'cdeba24b-24e2-5360-94a5-8fb5f9853390' and es = '¡Guarda con el perro!' and en = 'Watch out for the dog!'
  and not (es_alt && array['¡Cuidado con el perro!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Qué mala suerte!']::text[], note_en = coalesce(note_en, '“Mala leche” is casual Argentine for bad luck.')
where id = '04b4f609-d075-5a8c-a514-1ed612806728' and es = '¡Qué mala leche!' and en = 'What bad luck!'
  and not (es_alt && array['¡Qué mala suerte!']::text[]);

update public.sentences set es_alt = es_alt || array['Disculpá, me perdí, ¿me podés ayudar?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿Me ayudás?” already means “Can you help me?”')
where id = '4098f4ca-7d2b-5314-9f5f-6fb8185c6414' and es = 'Disculpá, me perdí, ¿me ayudás?' and en = 'Excuse me, I got lost, can you help me?'
  and not (es_alt && array['Disculpá, me perdí, ¿me podés ayudar?']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy perdido, ¿me podés ayudar?', 'Estoy perdida, ¿me podés ayudar?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿Me ayudás?” already means “Can you help me?”')
where id = '4682ca9e-3ebe-50ef-aef9-a89dc8c0beb0' and es = 'Estoy perdido, ¿me ayudás?' and en = 'I''m lost, can you help me?'
  and not (es_alt && array['Estoy perdido, ¿me podés ayudar?', 'Estoy perdida, ¿me podés ayudar?']::text[]);

update public.sentences set es_alt = es_alt || array['Guarda con la puerta, está rota.', 'Cuidado con la puerta, que está rota.', 'Cuidado con la puerta, está rota.']::text[], note_en = coalesce(note_en, '“Guarda” is a casual “cuidado”, and the “que” is a casual “because” linking the warning to its reason.')
where id = '2d4c2134-0252-563b-892d-dd5316fcd811' and es = 'Guarda con la puerta, que está rota.' and en = 'Watch out for the door, it''s broken.'
  and not (es_alt && array['Guarda con la puerta, está rota.', 'Cuidado con la puerta, que está rota.', 'Cuidado con la puerta, está rota.']::text[]);

update public.sentences set es_alt = es_alt || array['Qué mala suerte, el ascensor está roto.']::text[], note_en = coalesce(note_en, '“Mala leche” is casual Argentine for bad luck.')
where id = '3527a53c-af78-5977-9ae5-37fa975a46b2' and es = 'Qué mala leche, el ascensor está roto.' and en = 'What bad luck, the elevator is broken.'
  and not (es_alt && array['Qué mala suerte, el ascensor está roto.']::text[]);

update public.sentences set es_alt = es_alt || array['Busco pantalones para el laburo.']::text[], note_en = coalesce(note_en, 'In Argentina one pair of pants is usually “un pantalón”, in the singular; “pantalones” works too.')
where id = 'b6f22fdb-d5db-597c-b8d1-21f80c0ad7d4' and es = 'Busco un pantalón para el laburo.' and en = 'I''m looking for pants for work.'
  and not (es_alt && array['Busco pantalones para el laburo.']::text[]);

update public.sentences set es_alt = es_alt || array['Voy al boliche con mi pantalón nuevo.']::text[], note_en = coalesce(note_en, 'In Argentina one pair of pants is usually “un pantalón”, and “el” often stands in for “my” when it is clear whose it is.')
where id = '6a351c51-bfc7-50dd-9cc4-9ed4b92761c3' and es = 'Voy al boliche con el pantalón nuevo.' and en = 'I''m going to the nightclub in my new pants.'
  and not (es_alt && array['Voy al boliche con mi pantalón nuevo.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Pantalones chicos para Fede? Es re alto.']::text[], note_en = coalesce(note_en, 'In Argentina one pair of pants is usually “un pantalón”, in the singular; “pantalones” works too.')
where id = 'bd6f13a2-fb11-5ffb-9072-f0f3f20ee1fd' and es = '¿Un pantalón chico para Fede? Es re alto.' and en = 'Small pants for Fede? He''s really tall.'
  and not (es_alt && array['¿Pantalones chicos para Fede? Es re alto.']::text[]);

update public.sentences set es_alt = es_alt || array['El boliche está re lleno.']::text[], note_en = coalesce(note_en, '“Recontra” is an even stronger “re”. Both are everyday Argentine intensifiers.')
where id = '37c69771-ae9d-5676-a3b5-631a03016b8c' and es = 'El boliche está recontra lleno.' and en = 'The nightclub is really full.'
  and not (es_alt && array['El boliche está re lleno.']::text[]);

update public.sentences set es_alt = es_alt || array['El depto es re lindo, pero queda lejos del centro.', 'El depto es recontra lindo, pero está lejos del centro.', 'El depto es re lindo, pero está lejos del centro.']::text[], note_en = coalesce(note_en, '“Recontra” is an even stronger “re”. And Argentines often use “queda” to say where a place is.')
where id = '7bc096f0-86d5-5fbd-bc5b-e586396f44c3' and es = 'El depto es recontra lindo, pero queda lejos del centro.' and en = 'The apartment is really nice, but it''s far from downtown.'
  and not (es_alt && array['El depto es re lindo, pero queda lejos del centro.', 'El depto es recontra lindo, pero está lejos del centro.', 'El depto es re lindo, pero está lejos del centro.']::text[]);

update public.sentences set es_alt = es_alt || array['Es re caro.']::text[], note_en = coalesce(note_en, '“Recontra” is an even stronger “re”. Both are everyday Argentine intensifiers.')
where id = '469436ad-1f4b-5e8e-9fe2-61a1618e992a' and es = 'Es recontra caro.' and en = 'It''s really expensive.'
  and not (es_alt && array['Es re caro.']::text[]);

update public.sentences set es_alt = es_alt || array['Esa remera es re fea.']::text[], note_en = coalesce(note_en, '“Recontra” is an even stronger “re”. Both are everyday Argentine intensifiers.')
where id = 'c52a39c8-f2f5-57c8-acbb-b3ced59805da' and es = 'Esa remera es recontra fea.' and en = 'That T-shirt is really ugly.'
  and not (es_alt && array['Esa remera es re fea.']::text[]);

update public.sentences set es_alt = es_alt || array['Ese chico tiene zapatillas re lindas.']::text[], note_en = coalesce(note_en, 'Spanish often adds “unas” here, a bit like “some really nice sneakers”.')
where id = 'caa65abe-5524-5b36-aaa4-9cd94cfeea8a' and es = 'Ese chico tiene unas zapatillas re lindas.' and en = 'That boy has really nice sneakers.'
  and not (es_alt && array['Ese chico tiene zapatillas re lindas.']::text[]);

update public.sentences set es_alt = es_alt || array['Esta mochila es demasiado chica para la facu.']::text[], note_en = coalesce(note_en, 'Argentines often say “muy” where English says “too”; “demasiado” is the literal word.')
where id = '5ccee2de-681b-50f8-8288-fce0d072c48e' and es = 'Esta mochila es muy chica para la facu.' and en = 'This backpack is too small for college.'
  and not (es_alt && array['Esta mochila es demasiado chica para la facu.']::text[]);

update public.sentences set es_alt = es_alt || array['Estas zapatillas son re lindas.']::text[], note_en = coalesce(note_en, '“Recontra” is an even stronger “re”. Both are everyday Argentine intensifiers.')
where id = '6d55d105-08a9-56b9-8e9b-898253d27b0b' and es = 'Estas zapatillas son recontra lindas.' and en = 'These sneakers are really nice.'
  and not (es_alt && array['Estas zapatillas son re lindas.']::text[]);

update public.sentences set es_alt = es_alt || array['Soy muy grande para ir al boliche.', 'Soy demasiado grande para ir al boliche.']::text[], note_en = coalesce(note_en, '“Ser grande para…” already means being too old for something, so no “too” is needed.')
where id = 'a15b3df3-84e3-54ed-a1f4-9e1b3f537862' and es = 'Soy grande para ir al boliche.' and en = 'I''m too old to go to the nightclub.'
  and not (es_alt && array['Soy muy grande para ir al boliche.', 'Soy demasiado grande para ir al boliche.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Esos pantalones azules son de Nico?']::text[], note_en = coalesce(note_en, 'In Argentina one pair of pants is usually “un pantalón”, in the singular; “pantalones” works too.')
where id = 'e5605b6d-7b08-5c31-a4a5-7c506fc46dc0' and es = '¿Ese pantalón azul es de Nico?' and en = 'Are those blue pants Nico''s?'
  and not (es_alt && array['¿Esos pantalones azules son de Nico?']::text[]);

update public.sentences set es_alt = es_alt || array['La puerta azul es de mi abuela.']::text[]
where id = 'a634577f-16cd-5ed6-8070-b17f26291517' and es = 'La puerta azul es la de mi abuela.' and en = 'The blue door is my grandmother''s.'
  and not (es_alt && array['La puerta azul es de mi abuela.']::text[]);

update public.sentences set es_alt = es_alt || array['La puerta negra es el baño.']::text[]
where id = 'd556271e-8e7d-524d-8247-456db1e44dde' and es = 'La puerta negra es la del baño.' and en = 'The black door is the bathroom.'
  and not (es_alt && array['La puerta negra es el baño.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana tengo una reunión, ¿dónde está mi pantalón negro?', 'Tengo una reunión mañana, ¿dónde está mi pantalón negro?']::text[], note_en = coalesce(note_en, 'Argentines often drop the “una” here: “tengo reunión”, like “tengo clase”.')
where id = '4a65fc25-f617-5101-ab40-eeaac35edadc' and es = 'Mañana tengo reunión, ¿dónde está mi pantalón negro?' and en = 'I have a meeting tomorrow, where are my black pants?'
  and not (es_alt && array['Mañana tengo una reunión, ¿dónde está mi pantalón negro?', 'Tengo una reunión mañana, ¿dónde está mi pantalón negro?']::text[]);

update public.sentences set es_alt = es_alt || array['Me gusta esa, la azul.']::text[]
where id = '7da99883-5654-569a-b47b-8a6e9f5e1d8f' and es = 'Me gusta ese, el azul.' and en = 'I like that one, the blue one.'
  and not (es_alt && array['Me gusta esa, la azul.']::text[]);

update public.sentences set es_alt = es_alt || array['Mirá, ¡qué lindo!', 'Mirá, ¡qué lindos!', 'Mirá, ¡qué linda!']::text[]
where id = '5536d954-27ba-52cc-8311-6651e30fb390' and es = 'Mirá, ¡qué lindas!' and en = 'Look, how nice!'
  and not (es_alt && array['Mirá, ¡qué lindo!', 'Mirá, ¡qué lindos!', 'Mirá, ¡qué linda!']::text[]);

update public.sentences set es_alt = es_alt || array['No me gustan las remeras rojas, pero esta me gusta.', 'No me gustan las remeras rojas, pero me gusta esta.']::text[], note_en = coalesce(note_en, 'In Spanish you don''t have to repeat “me gusta”: “esta sí” means “this one, yes”.')
where id = '92f351a9-d3bf-538c-9df8-3d516c46d70a' and es = 'No me gustan las remeras rojas, pero esta sí.' and en = 'I don''t like red T-shirts, but I like this one.'
  and not (es_alt && array['No me gustan las remeras rojas, pero esta me gusta.', 'No me gustan las remeras rojas, pero me gusta esta.']::text[]);

update public.sentences set es_alt = es_alt || array['Quiero el azul.']::text[]
where id = '2bd09aed-5b7d-549e-9373-a4b76821d501' and es = 'Quiero la azul.' and en = 'I want the blue one.'
  and not (es_alt && array['Quiero el azul.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Es rosa o rojo?']::text[]
where id = '9389e765-45fe-5358-a103-91944c7d9c05' and es = '¿Es rosa o roja?' and en = 'Is it pink or red?'
  and not (es_alt && array['¿Es rosa o rojo?']::text[]);

update public.sentences set es_alt = es_alt || array['¿El blanco es nuevo?', '¿Es nuevo el blanco?']::text[]
where id = 'feee2c5b-c9c5-5a5f-bf49-08d0617c7044' and es = '¿La blanca es nueva?' and en = 'Is the white one new?'
  and not (es_alt && array['¿El blanco es nuevo?', '¿Es nuevo el blanco?']::text[]);

update public.sentences set es_alt = es_alt || array['¿El blanco o el azul?']::text[]
where id = '04bea076-cf96-50e1-ac4f-ad1e41b3d05f' and es = '¿La blanca o la azul?' and en = 'The white one or the blue one?'
  and not (es_alt && array['¿El blanco o el azul?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Los blancos son grandes?', '¿Son grandes los blancos?']::text[]
where id = 'cb3b040e-1883-5fbc-8dc7-0ca3212901a5' and es = '¿Las blancas son grandes?' and en = 'Are the white ones big?'
  and not (es_alt && array['¿Los blancos son grandes?', '¿Son grandes los blancos?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Los blancos son más lindos que los celestes?', '¿Son más lindos los blancos que los celestes?']::text[]
where id = '7c80699b-7f31-5c5e-8adc-5038af1476a7' and es = '¿Las blancas son más lindas que las celestes?' and en = 'Are the white ones nicer than the light blue ones?'
  and not (es_alt && array['¿Los blancos son más lindos que los celestes?', '¿Son más lindos los blancos que los celestes?']::text[]);

update public.sentences set es_alt = es_alt || array['La blanca está rota.']::text[]
where id = '3a2083be-1fe2-544d-a009-e794eea01d1f' and es = 'El blanco está roto.' and en = 'The white one is torn.'
  and not (es_alt && array['La blanca está rota.']::text[]);

update public.sentences set es_alt = es_alt || array['Me gustan los rojos, pero Cami quiere los blancos.']::text[]
where id = 'c26bfd50-ea79-5f46-9154-26070a84a676' and es = 'Me gustan las rojas, pero Cami quiere las blancas.' and en = 'I like the red ones, but Cami wants the white ones.'
  and not (es_alt && array['Me gustan los rojos, pero Cami quiere los blancos.']::text[]);

update public.sentences set es_alt = es_alt || array['No es rojo, es naranja.']::text[]
where id = '9170d4bf-1ffa-5919-9933-cd6d6eafbff1' and es = 'No es roja, es naranja.' and en = 'It''s not red, it''s orange.'
  and not (es_alt && array['No es rojo, es naranja.']::text[]);

update public.sentences set es_alt = es_alt || array['Quiero la pieza del bebé en celeste.']::text[]
where id = 'c00dbfaa-adb9-5f61-804c-a9b4ae212b7b' and es = 'Quiero la pieza del bebé de color celeste.' and en = 'I want the baby''s bedroom in light blue.'
  and not (es_alt && array['Quiero la pieza del bebé en celeste.']::text[]);

update public.sentences set es_alt = es_alt || array['Quiero los verdes.']::text[]
where id = '08d4c7f8-7472-57e6-809a-3c78530da4b1' and es = 'Quiero las verdes.' and en = 'I want the green ones.'
  and not (es_alt && array['Quiero los verdes.']::text[]);

update public.sentences set es_alt = es_alt || array['Vivo en la casa con la puerta verde.']::text[], note_en = coalesce(note_en, 'To pick something out by a feature, Spanish usually uses “de”: la casa de la puerta verde.')
where id = '7aee5a7b-d3a5-5aef-93fa-4b2a9af105fc' and es = 'Vivo en la casa de la puerta verde.' and en = 'I live in the house with the green door.'
  and not (es_alt && array['Vivo en la casa con la puerta verde.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Querés la amarilla o la gris?']::text[]
where id = '1d5b19f7-c2a1-5607-9178-7209b573a94d' and es = '¿Querés el amarillo o el gris?' and en = 'Do you want the yellow one or the gray one?'
  and not (es_alt && array['¿Querés la amarilla o la gris?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Querés los amarillos?']::text[]
where id = 'a9f75b58-a587-5ff2-bb6a-8e2f9b9c41a7' and es = '¿Querés las amarillas?' and en = 'Do you want the yellow ones?'
  and not (es_alt && array['¿Querés los amarillos?']::text[]);

update public.sentences set es_alt = es_alt || array['Ese negocio tiene polleras re lindas.']::text[]
where id = '81e8e30b-f771-5248-8def-5d8d544511fc' and es = 'En ese negocio hay polleras re lindas.' and en = 'That store has really nice skirts.'
  and not (es_alt && array['Ese negocio tiene polleras re lindas.']::text[]);

update public.sentences set es_alt = es_alt || array['Mirá, tenés el zapato sucio.', 'Mirá, tu zapato está sucio.', 'Fijate, tu zapato está sucio.']::text[], note_en = coalesce(note_en, '“Fijate” is a very Argentine way to say “look” or “check”, and “tenés el zapato sucio” is how people usually put it.')
where id = '59b9f107-648c-518e-9204-4f21a219f4bf' and es = 'Fijate, tenés el zapato sucio.' and en = 'Look, your shoe is dirty.'
  and not (es_alt && array['Mirá, tenés el zapato sucio.', 'Mirá, tu zapato está sucio.', 'Fijate, tu zapato está sucio.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuál preferís, el amarillo o el gris?']::text[]
where id = 'bf49b8b9-b746-5c12-9e02-0fa382fb7a78' and es = '¿Cuál preferís, la amarilla o la gris?' and en = 'Which one do you prefer, the yellow one or the gray one?'
  and not (es_alt && array['¿Cuál preferís, el amarillo o el gris?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuál te gusta, este o ese?']::text[]
where id = '8483e41b-cce2-5c05-af93-fa06aa88f577' and es = '¿Cuál te gusta, esta o esa?' and en = 'Which one do you like, this one or that one?'
  and not (es_alt && array['¿Cuál te gusta, este o ese?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuáles preferís, los negros o los blancos?']::text[]
where id = '7eff3763-6dd1-5fd8-aa57-7d12703ce816' and es = '¿Cuáles preferís, las negras o las blancas?' and en = 'Which ones do you prefer, the black ones or the white ones?'
  and not (es_alt && array['¿Cuáles preferís, los negros o los blancos?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuáles son más cómodas, estas o esas?']::text[]
where id = 'ef28c44b-2326-5842-a8bf-d81b54ae525c' and es = '¿Cuáles son más cómodos, estos o esos?' and en = 'Which ones are more comfortable, these or those?'
  and not (es_alt && array['¿Cuáles son más cómodas, estas o esas?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés hacer factura a nombre de la empresa?', '¿Me podés hacer una factura a nombre de la empresa?', '¿Me hacés una factura a nombre de la empresa?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with a plain present-tense question: “¿Me hacés…?” already means “Can you…?”.')
where id = '5979c63a-f21a-5246-ad38-4d8d8dd99331' and es = '¿Me hacés factura a nombre de la empresa?' and en = 'Can you give me an invoice in the company''s name?'
  and not (es_alt && array['¿Me podés hacer factura a nombre de la empresa?', '¿Me podés hacer una factura a nombre de la empresa?', '¿Me hacés una factura a nombre de la empresa?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés hacer factura, por favor?', '¿Me podés hacer una factura, por favor?', '¿Me hacés una factura, por favor?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with a plain present-tense question: “¿Me hacés…?” already means “Can you…?”.')
where id = 'b4b1073f-a184-5c2a-b5fd-ed4da7d3a7da' and es = '¿Me hacés factura, por favor?' and en = 'Can you give me an invoice, please?'
  and not (es_alt && array['¿Me podés hacer factura, por favor?', '¿Me podés hacer una factura, por favor?', '¿Me hacés una factura, por favor?']::text[]);

update public.sentences set es_alt = es_alt || array['Dale, la llevo.']::text[]
where id = '4787e4a1-868a-5fec-b8f7-796fd4a19713' and es = 'Dale, lo llevo.' and en = 'OK, I''ll take it.'
  and not (es_alt && array['Dale, la llevo.']::text[]);

update public.sentences set es_alt = es_alt || array['Es re cómoda y está barata, la llevo.']::text[]
where id = 'e7b177b7-6ac9-5685-a328-1347676b0ad7' and es = 'Es re cómodo y está barato, lo llevo.' and en = 'It''s really comfortable and it''s cheap, I''ll take it.'
  and not (es_alt && array['Es re cómoda y está barata, la llevo.']::text[]);

update public.sentences set es_alt = es_alt || array['Estos pantalones son cómodos, pero son muy grandes.']::text[]
where id = '26970076-f6db-58f6-8398-68a8a679bc56' and es = 'Estos pantalones son cómodos, pero muy grandes.' and en = 'These pants are comfortable, but very big.'
  and not (es_alt && array['Estos pantalones son cómodos, pero son muy grandes.']::text[]);

update public.sentences set es_alt = es_alt || array['La llevo, ¿puedo pagar con tarjeta?']::text[]
where id = '6e4c0258-d3d3-5808-96c6-3273e05b41ff' and es = 'Lo llevo, ¿puedo pagar con tarjeta?' and en = 'I''ll take it, can I pay by card?'
  and not (es_alt && array['La llevo, ¿puedo pagar con tarjeta?']::text[]);

update public.sentences set es_alt = es_alt || array['Me gusta el gris, lo llevo.']::text[]
where id = 'c26d1a7b-03e4-5016-94c0-3c7252cd6a7d' and es = 'Me gusta la gris, la llevo.' and en = 'I like the gray one, I''ll take it.'
  and not (es_alt && array['Me gusta el gris, lo llevo.']::text[]);

update public.sentences set es_alt = es_alt || array['Me queda bien, la llevo.']::text[]
where id = '608abec7-08c0-5431-8076-dbc9c678a682' and es = 'Me queda bien, lo llevo.' and en = 'It fits me well, I''ll take it.'
  and not (es_alt && array['Me queda bien, la llevo.']::text[]);

update public.sentences set es_alt = es_alt || array['Me queda chica.']::text[]
where id = 'acc58fdc-a0b7-5779-ad3c-68871348ceb8' and es = 'Me queda chico.' and en = 'It''s too small for me.'
  and not (es_alt && array['Me queda chica.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuánto cobrás por hora?', '¿Cuánto cobrás por la hora?']::text[], note_en = coalesce(note_en, 'Argentines often skip the “por”: “¿Cuánto cobrás la hora?” is an everyday way to ask.')
where id = 'ef141d77-c6c4-5e3b-9806-57aadd309194' and es = '¿Cuánto cobrás la hora?' and en = 'How much do you charge per hour?'
  and not (es_alt && array['¿Cuánto cobrás por hora?', '¿Cuánto cobrás por la hora?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me cobrás con tarjeta o es solo efectivo?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with a plain present-tense question: “¿Me cobrás…?” already means “Can you charge me…?”.')
where id = 'cdfc6454-69e9-58d6-a2ae-b751c98e5518' and es = '¿Me cobrás con tarjeta o solo efectivo?' and en = 'Can you charge me by card, or is it cash only?'
  and not (es_alt && array['¿Me cobrás con tarjeta o es solo efectivo?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Puedo pagar, por favor?', '¿Te puedo pagar, por favor?']::text[], note_en = coalesce(note_en, '“¿Me cobrás?” is literally “Will you charge me?”: it''s the usual way to ask to pay in Argentina.')
where id = 'f30523e3-bf59-566e-9ca2-a76af2dc8c89' and es = '¿Me cobrás, por favor?' and en = 'Can I pay, please?'
  and not (es_alt && array['¿Puedo pagar, por favor?', '¿Te puedo pagar, por favor?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés hacer un descuento?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with a plain present-tense question: “¿Me hacés…?” already means “Can you…?”.')
where id = '072374a7-0aeb-5919-adb0-c96271c29ba6' and es = '¿Me hacés un descuento?' and en = 'Can you give me a discount?'
  and not (es_alt && array['¿Me podés hacer un descuento?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuánto sale esta campera?', '¿Cuánto cuesta esta campera?']::text[]
where id = '88815da1-bcef-5e68-8fbf-b1d5665409e0' and es = '¿Qué precio tiene esta campera?' and en = 'How much is this jacket?'
  and not (es_alt && array['¿Cuánto sale esta campera?', '¿Cuánto cuesta esta campera?']::text[]);

update public.sentences set es_alt = es_alt || array['¿A quién le pago acá?', '¿A quién pago acá?']::text[], note_en = coalesce(note_en, 'In a shop Argentines talk about who “cobra” (takes the payment), so this is literally “Who charges here?”.')
where id = '1d292043-a572-5f56-9911-5bc2244c0aa6' and es = '¿Quién cobra acá?' and en = 'Who do I pay here?'
  and not (es_alt && array['¿A quién le pago acá?', '¿A quién pago acá?']::text[]);

update public.sentences set es_alt = es_alt || array['Esa verdulería cobra mucho.', 'Esa verdulería cobra muy caro.']::text[], note_en = coalesce(note_en, '“Cobrar caro” is how Argentines say a place is pricey, and “re” turns it up: it charges a lot.')
where id = '852d0ded-13bb-574d-acf7-aaf3b765c1db' and es = 'Esa verdulería cobra re caro.' and en = 'That fruit and vegetable shop charges a lot.'
  and not (es_alt && array['Esa verdulería cobra mucho.', 'Esa verdulería cobra muy caro.']::text[]);

update public.sentences set es_alt = es_alt || array['Hay una oferta de alfajores.']::text[]
where id = 'f62407d9-ec47-5dfb-861e-54451c808f82' and es = 'Hay oferta de alfajores.' and en = 'There''s a deal on alfajores.'
  and not (es_alt && array['Hay una oferta de alfajores.']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo vuelto, ¿tenés billetes chicos?', 'No tengo cambio, ¿tenés billetes chicos?']::text[], note_en = coalesce(note_en, '“Vuelto” is the change you get back; “cambio” is small bills or coins to pay with.')
where id = 'f797b488-537f-57ac-890c-5e5434e5c9e4' and es = 'No tengo vuelto, ¿tenés cambio?' and en = 'I don''t have change. Do you have small bills?'
  and not (es_alt && array['No tengo vuelto, ¿tenés billetes chicos?', 'No tengo cambio, ¿tenés billetes chicos?']::text[]);

update public.sentences set es_alt = es_alt || array['Acá está tu vuelto.', 'Acá tenés tu vuelto.']::text[], note_en = coalesce(note_en, '“Tomá” (take) is what Argentines say when handing something over, like “here you go”.')
where id = 'a2bec026-358d-59b0-a4d6-948ea248257a' and es = 'Tomá tu vuelto.' and en = 'Here''s your change.'
  and not (es_alt && array['Acá está tu vuelto.', 'Acá tenés tu vuelto.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuánto sale el dólar hoy?']::text[], note_en = coalesce(note_en, 'For prices that change from day to day, like the dollar, Argentines ask “¿A cuánto está?”.')
where id = '5ec6e4f6-8fb8-5235-bf5b-d98aa5810c90' and es = '¿A cuánto está el dólar hoy?' and en = 'How much is the dollar today?'
  and not (es_alt && array['¿Cuánto sale el dólar hoy?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuánto es la cuota?', '¿Cuánto sale la cuota?']::text[]
where id = '888fcac9-0b14-5d0b-8081-99b89f7dddea' and es = '¿De cuánto es la cuota?' and en = 'How much is the installment?'
  and not (es_alt && array['¿Cuánto es la cuota?', '¿Cuánto sale la cuota?']::text[]);

update public.sentences set es_alt = es_alt || array['Esperá un momento, te transfiero desde el celu.']::text[], note_en = coalesce(note_en, 'Spanish speakers often link a request to its reason with a little “que”. It''s optional, but it makes the sentence flow.')
where id = '0b6ae9b5-b6c8-5a6f-bb5d-0a615d5c2896' and es = 'Esperá un momento que te transfiero desde el celu.' and en = 'Wait a moment, I''ll transfer it to you from my phone.'
  and not (es_alt && array['Esperá un momento, te transfiero desde el celu.']::text[]);

update public.sentences set es_alt = es_alt || array['Me queda una cuota.']::text[]
where id = '53a75f27-d106-5644-afbb-fa0d5ad484a2' and es = 'Me falta una cuota.' and en = 'I have one installment left.'
  and not (es_alt && array['Me queda una cuota.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Y mi vuelto? —Ah, perdón, acá tenés.', '—¿Y mi vuelto? —Ah, perdón, acá está.']::text[], note_en = coalesce(note_en, '“Tomá” (take) is what Argentines say when handing something over, like “here you go”.')
where id = 'd7cac8db-f8c3-5c26-b229-323a14b75653' and es = '—¿Y mi vuelto? —Ah, perdón, tomá.' and en = '—What about my change? —Oh, sorry, here.'
  and not (es_alt && array['—¿Y mi vuelto? —Ah, perdón, acá tenés.', '—¿Y mi vuelto? —Ah, perdón, acá está.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Bajate, Fede, es acá!']::text[], note_en = coalesce(note_en, 'Spanish speakers often link a command to its reason with a little “que”. It''s optional, but it makes the sentence flow.')
where id = '07a26642-f0ad-5779-8768-f902ff6c3a1f' and es = '¡Bajate, Fede, que es acá!' and en = 'Get off, Fede, it''s here!'
  and not (es_alt && array['¡Bajate, Fede, es acá!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuánto cuesta un taxi al centro?', '¿Cuánto cuesta un taxi hasta el centro?', '¿Cuánto cuesta el taxi al centro?']::text[]
where id = 'ea7b7f23-8075-5b02-9113-2ced60acce52' and es = '¿Cuánto cuesta el taxi hasta el centro?' and en = 'How much is a taxi downtown?'
  and not (es_alt && array['¿Cuánto cuesta un taxi al centro?', '¿Cuánto cuesta un taxi hasta el centro?', '¿Cuánto cuesta el taxi al centro?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Es más barato en efectivo?', '¿En efectivo es más barato?']::text[]
where id = '63e2e4df-7eed-5bf2-b7ba-70e676fc4f07' and es = '¿En efectivo cuesta menos?' and en = 'Is it cheaper in cash?'
  and not (es_alt && array['¿Es más barato en efectivo?', '¿En efectivo es más barato?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Puedo pagar, por favor?', '¿Te puedo pagar, por favor?']::text[], note_en = coalesce(note_en, '“¿Me cobrás?” is literally “Will you charge me?”: it''s the usual way to ask to pay in Argentina.')
where id = '4174f46c-047c-5ba2-a104-4cf81a839c76' and es = '¿Me cobrás, por favor?' and en = 'Can I pay, please?'
  and not (es_alt && array['¿Puedo pagar, por favor?', '¿Te puedo pagar, por favor?']::text[]);

update public.sentences set es_alt = es_alt || array['La pieza es chica, pero es cómoda.']::text[]
where id = 'c265ea5f-a0cd-5055-80a3-8d1a994c9406' and es = 'La pieza es chica, pero cómoda.' and en = 'The bedroom is small, but comfortable.'
  and not (es_alt && array['La pieza es chica, pero es cómoda.']::text[]);

update public.sentences set es_alt = es_alt || array['Profe, ¿cuánto cobrás por clase?', 'Profe, ¿cuánto cobrás por la clase?', 'Profe, ¿cuánto cobrás por una clase?']::text[], note_en = coalesce(note_en, 'Argentines often skip the “por”: “¿Cuánto cobrás la clase?” is an everyday way to ask.')
where id = 'f1dbd4a3-3f88-5197-8a50-4cdaceedaf96' and es = 'Profe, ¿cuánto cobrás la clase?' and en = 'Teacher, how much do you charge for a class?'
  and not (es_alt && array['Profe, ¿cuánto cobrás por clase?', 'Profe, ¿cuánto cobrás por la clase?', 'Profe, ¿cuánto cobrás por una clase?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi billetera está en mi mochila.']::text[]
where id = '3e368448-ddd5-56e2-8416-f3d5da2f6d02' and es = 'Tengo la billetera en la mochila.' and en = 'My wallet''s in my backpack.'
  and not (es_alt && array['Mi billetera está en mi mochila.']::text[]);

update public.sentences set es_alt = es_alt || array['Acá tenés tu vuelto.', 'Acá está tu vuelto.']::text[], note_en = coalesce(note_en, 'When handing something over, Argentines often just say “Tomá” (“take”), the way English says “here you go”.')
where id = '9381ba1d-915d-5af7-8480-1b1dec7f9ebb' and es = 'Tomá, tu vuelto.' and en = 'Here''s your change.'
  and not (es_alt && array['Acá tenés tu vuelto.', 'Acá está tu vuelto.']::text[]);

update public.sentences set es_alt = es_alt || array['Como afuera una vez por semana.']::text[]
where id = '64091258-f2f9-5d72-b6c3-02b18163fe4e' and es = 'Ceno afuera una vez por semana.' and en = 'I eat out once a week.'
  and not (es_alt && array['Como afuera una vez por semana.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te apurás? El taxi está abajo.']::text[], note_en = coalesce(note_en, 'After a request, Argentines often add “que” before the reason. It works like a quick “because”.')
where id = '242c9c33-369a-50d9-8754-7e9173729bf1' and es = '¿Te apurás, que el taxi está abajo?' and en = 'Can you hurry up? The taxi''s downstairs.'
  and not (es_alt && array['¿Te apurás? El taxi está abajo.']::text[]);

update public.sentences set es_alt = es_alt || array['Apurate, tu hermano se va sin vos.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add “que” before the reason. It works like a quick “because”.')
where id = '5705d6d0-0933-5cb0-b00c-4cf43f7526d8' and es = 'Apurate, que tu hermano se va sin vos.' and en = 'Hurry up, your brother is leaving without you.'
  and not (es_alt && array['Apurate, tu hermano se va sin vos.']::text[]);

update public.sentences set es_alt = es_alt || array['Esta noche nos acostamos temprano.', 'Nos acostamos temprano esta noche.']::text[], note_en = coalesce(note_en, 'Argentines often say “hoy” where English says “tonight”.')
where id = '2689333c-22b9-57b0-962e-f0516b4d67f1' and es = 'Hoy nos acostamos temprano.' and en = 'We''re going to bed early tonight.'
  and not (es_alt && array['Esta noche nos acostamos temprano.', 'Nos acostamos temprano esta noche.']::text[]);

update public.sentences set es_alt = es_alt || array['Me voy, mañana laburo temprano.']::text[], note_en = coalesce(note_en, 'Argentines often link a statement to its reason with a short “que”. It works like a quick “because”.')
where id = 'f108067b-ca70-56b6-b7f9-ac9486d232f9' and es = 'Me voy, que mañana laburo temprano.' and en = 'I''m leaving, I work early tomorrow.'
  and not (es_alt && array['Me voy, mañana laburo temprano.']::text[]);

update public.sentences set es_alt = es_alt || array['Ponete las pilas, el examen es mañana.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add “que” before the reason. It works like a quick “because”.')
where id = 'f4db373b-458e-5040-b5b0-0ca4a5c9a5a0' and es = 'Ponete las pilas, que el examen es mañana.' and en = 'Come on, get moving, the exam is tomorrow.'
  and not (es_alt && array['Ponete las pilas, el examen es mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Ponete las pilas, es tarde.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add “que” before the reason. It works like a quick “because”.')
where id = 'ac2517dc-e17c-53bb-84a6-2b716b34f8e2' and es = 'Ponete las pilas, que es tarde.' and en = 'Come on, get moving, it''s late.'
  and not (es_alt && array['Ponete las pilas, es tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['No duermo mucho.']::text[]
where id = '70cbef95-f42c-5624-9cd3-9c1bd5cf393e' and es = 'Duermo poco.' and en = 'I don''t sleep much.'
  and not (es_alt && array['No duermo mucho.']::text[]);

update public.sentences set es_alt = es_alt || array['Generalmente nos acostamos a las once, pero esta noche no.']::text[], note_en = coalesce(note_en, 'Argentines often say “hoy” where English says “tonight”.')
where id = '81588bee-aa11-5982-b3a8-75ea5fad6587' and es = 'Generalmente nos acostamos a las once, pero hoy no.' and en = 'We usually go to bed at eleven, but not tonight.'
  and not (es_alt && array['Generalmente nos acostamos a las once, pero esta noche no.']::text[]);

update public.sentences set es_alt = es_alt || array['Esta noche no salgo, mañana madrugo.', 'No salgo esta noche, mañana madrugo.']::text[], note_en = coalesce(note_en, 'Argentines often say “hoy” where English says “tonight”.')
where id = 'f7290778-1412-511b-b611-5968ec2fb6e4' and es = 'Hoy no salgo, mañana madrugo.' and en = 'I''m not going out tonight, I''m getting up early tomorrow.'
  and not (es_alt && array['Esta noche no salgo, mañana madrugo.', 'No salgo esta noche, mañana madrugo.']::text[]);

update public.sentences set es_alt = es_alt || array['Los sábados duermo hasta el mediodía.']::text[], note_en = coalesce(note_en, 'Argentines often just say “las doce” for noon; “el mediodía” is fine too.')
where id = 'df161f9f-9ef6-5eb0-94ad-92bcc1e29b5b' and es = 'Los sábados duermo hasta las doce.' and en = 'On Saturdays I sleep until noon.'
  and not (es_alt && array['Los sábados duermo hasta el mediodía.']::text[]);

update public.sentences set es_alt = es_alt || array['Cami y yo somos muy amigas y vamos al cine juntas.', 'Cami y yo somos muy amigos y vamos al cine juntos.']::text[], note_en = coalesce(note_en, 'Argentines often say “Con Cami somos…” to mean “Cami and I are…”. “Cami y yo somos…” is just as correct.')
where id = '8d5a7b87-8d33-5d56-806f-abc712bd89fe' and es = 'Con Cami somos muy amigas y vamos al cine juntas.' and en = 'Cami and I are very good friends and we go to the movies together.'
  and not (es_alt && array['Cami y yo somos muy amigas y vamos al cine juntas.', 'Cami y yo somos muy amigos y vamos al cine juntos.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿A ustedes les interesa el fútbol? —No, para nada.', '—¿Les interesa el fútbol? —No, para nada.']::text[]
where id = '3149f6fe-8802-5a54-af1d-b109d6e03c1d' and es = '—¿A ustedes les interesa el fútbol? —No, nada.' and en = '—Are you guys interested in soccer? —No, not at all.'
  and not (es_alt && array['—¿A ustedes les interesa el fútbol? —No, para nada.', '—¿Les interesa el fútbol? —No, para nada.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Querés ir al boliche? —No, odio bailar.']::text[], note_en = coalesce(note_en, 'Argentines often invite with a simple “¿Vamos…?”, which works like “want to go…?”.')
where id = '41067fd9-53bb-520b-9143-a7621ee66306' and es = '—¿Vamos al boliche? —No, odio bailar.' and en = '—Want to go to the nightclub? —No, I hate dancing.'
  and not (es_alt && array['—¿Querés ir al boliche? —No, odio bailar.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuándo vas a Brasil?', '¿Cuándo te vas a Brasil?']::text[]
where id = 'd969b8d0-704d-50bc-bba6-3f702560c251' and es = '¿Cuándo viajás a Brasil?' and en = 'When are you going to Brazil?'
  and not (es_alt && array['¿Cuándo vas a Brasil?', '¿Cuándo te vas a Brasil?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Viajás este finde? ¡Qué suerte!']::text[], note_en = coalesce(note_en, '“El finde” on its own usually means the coming weekend, so Argentines often skip “este”.')
where id = '1cf4b5b4-ebd4-59ed-8675-9463ea3e68c7' and es = '¿Viajás el finde? ¡Qué suerte!' and en = 'You''re traveling this weekend? Lucky you!'
  and not (es_alt && array['¿Viajás este finde? ¡Qué suerte!']::text[]);

update public.sentences set es_alt = es_alt || array['Belén canta re bien.']::text[]
where id = '0df94083-593e-54fc-9e8d-8129321973e9' and es = 'Belén canta muy bien.' and en = 'Belén sings really well.'
  and not (es_alt && array['Belén canta re bien.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés pasar el WhatsApp de la peluquería?']::text[], note_en = coalesce(note_en, 'Argentines usually ask with the plain present: “¿Me pasás…?” already means “can you give me…?”.')
where id = '77e49871-703b-51a6-a6c8-c1ffc6c406a3' and es = '¿Me pasás el WhatsApp de la peluquería?' and en = 'Can you give me the hair salon''s WhatsApp?'
  and not (es_alt && array['¿Me podés pasar el WhatsApp de la peluquería?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés pasar la dirección del bar por WhatsApp?']::text[], note_en = coalesce(note_en, 'Argentines usually ask with the plain present: “¿Me pasás…?” already means “can you send me…?”.')
where id = '39e96fa4-34f1-5135-8210-bf5b4021e7cb' and es = '¿Me pasás la dirección del bar por WhatsApp?' and en = 'Can you send me the bar''s address on WhatsApp?'
  and not (es_alt && array['¿Me podés pasar la dirección del bar por WhatsApp?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés pasar tu alias?']::text[], note_en = coalesce(note_en, 'Argentines usually ask with the plain present: “¿Me pasás…?” already means “can you give me…?”.')
where id = 'a4fa5375-128e-523e-ac96-d9d6c3a13a89' and es = '¿Me pasás tu alias?' and en = 'Can you give me your alias?'
  and not (es_alt && array['¿Me podés pasar tu alias?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés pasar tu número?']::text[], note_en = coalesce(note_en, 'Argentines usually ask with the plain present: “¿Me pasás…?” already means “can you give me…?”.')
where id = 'b71b06d3-8259-56a4-8f40-b4b3f6c9a0da' and es = '¿Me pasás tu número?' and en = 'Can you give me your number?'
  and not (es_alt && array['¿Me podés pasar tu número?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés pasar tu WhatsApp?']::text[], note_en = coalesce(note_en, 'Argentines usually ask with the plain present: “¿Me pasás…?” already means “can you give me…?”.')
where id = 'a9c5f6bb-2d10-5980-be1f-b91d2373b61d' and es = '¿Me pasás tu WhatsApp?' and en = 'Can you give me your WhatsApp?'
  and not (es_alt && array['¿Me podés pasar tu WhatsApp?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, ¿me podés pasar el número de Mica?']::text[], note_en = coalesce(note_en, 'Argentines usually ask with the plain present: “¿Me pasás…?” already means “can you give me…?”.')
where id = '87a8be4a-ab30-54d8-9831-bbd9f3c7972f' and es = 'Che, ¿me pasás el número de Mica?' and en = 'Hey, can you give me Mica''s number?'
  and not (es_alt && array['Che, ¿me podés pasar el número de Mica?']::text[]);

update public.sentences set es_alt = es_alt || array['Esperá, agendo tu número.']::text[], note_en = coalesce(note_en, 'Argentines often say “Esperá que…” before what they are about to do, like “hang on while I…”.')
where id = '0199f5d5-30c6-5c21-ae00-f0593546e222' and es = 'Esperá que agendo tu número.' and en = 'Wait, I''ll save your number.'
  and not (es_alt && array['Esperá, agendo tu número.']::text[]);

update public.sentences set es_alt = es_alt || array['Pasame tu alias y te transfiero la plata.']::text[], note_en = coalesce(note_en, 'Argentines usually just say “te transfiero”: the money is understood.')
where id = 'c05cb98e-db62-561c-a707-fd7d943ba1c8' and es = 'Pasame tu alias y te transfiero.' and en = 'Give me your alias and I''ll transfer you the money.'
  and not (es_alt && array['Pasame tu alias y te transfiero la plata.']::text[]);

update public.sentences set es_alt = es_alt || array['Seguime en tu auto, mi casa está cerca.', 'Seguime con tu auto, mi casa está cerca.', 'Seguime en el auto, mi casa está cerca.']::text[]
where id = 'bfb98e92-47cd-51b5-9567-5ef84ce8b3e3' and es = 'Seguime con el auto, mi casa está cerca.' and en = 'Follow me in your car, my house is close.'
  and not (es_alt && array['Seguime en tu auto, mi casa está cerca.', 'Seguime con tu auto, mi casa está cerca.', 'Seguime en el auto, mi casa está cerca.']::text[]);

update public.sentences set es_alt = es_alt || array['Te dejo mi número de teléfono, si necesitás algo me avisás.', 'Te dejo mi número, si necesitás algo me avisás.', 'Te dejo mi teléfono, si necesitás algo avisame.', 'Te dejo mi número de teléfono, si necesitás algo avisame.', 'Te dejo mi número, si necesitás algo avisame.']::text[], note_en = coalesce(note_en, 'In everyday speech “mi teléfono” often means the number, not the device.')
where id = '8b3a604c-f14b-5c1d-8dbd-f30490763956' and es = 'Te dejo mi teléfono, si necesitás algo me avisás.' and en = 'I''ll leave you my phone number; if you need anything, let me know.'
  and not (es_alt && array['Te dejo mi número de teléfono, si necesitás algo me avisás.', 'Te dejo mi número, si necesitás algo me avisás.', 'Te dejo mi teléfono, si necesitás algo avisame.', 'Te dejo mi número de teléfono, si necesitás algo avisame.', 'Te dejo mi número, si necesitás algo avisame.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés datos en tu celu?']::text[], note_en = coalesce(note_en, 'Spanish often uses “el” where English says “your” when it is obvious whose thing it is.')
where id = '9a37ae5f-98e9-5f84-81d0-c5489f24a1cc' and es = '¿Tenés datos en el celu?' and en = 'Do you have data on your phone?'
  and not (es_alt && array['¿Tenés datos en tu celu?']::text[]);

update public.sentences set es_alt = es_alt || array['Llueve desde esta mañana.']::text[]
where id = '23607ddc-a4aa-55ef-a4c4-5898e5997e91' and es = 'Llueve desde la mañana.' and en = 'It''s been raining since this morning.'
  and not (es_alt && array['Llueve desde esta mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Llueve mucho y mi paraguas está en la oficina.']::text[], note_en = coalesce(note_en, 'Spanish often uses “el” where English says “my” when it is obvious whose thing it is.')
where id = '78d71d27-b8fe-51d0-b6a8-3b9623f183e4' and es = 'Llueve mucho y el paraguas está en la oficina.' and en = 'It''s raining a lot and my umbrella is at the office.'
  and not (es_alt && array['Llueve mucho y mi paraguas está en la oficina.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo frío. ¿Me traés mi campera?']::text[], note_en = coalesce(note_en, 'Argentines often ask for things with a plain present question, “¿Me traés…?”, where English says “Can you…?”.')
where id = '4b8937a9-3862-5f41-9c75-9e29a1632ff2' and es = 'Tengo frío. ¿Me traés la campera?' and en = 'I''m cold. Can you bring me my jacket?'
  and not (es_alt && array['Tengo frío. ¿Me traés mi campera?']::text[]);

update public.sentences set es_alt = es_alt || array['En invierno no llueve mucho en Buenos Aires.', 'No llueve mucho en Buenos Aires en invierno.']::text[]
where id = 'a9f8cdc5-7a23-58c5-b7ea-29db01196915' and es = 'En invierno llueve poco en Buenos Aires.' and en = 'It doesn''t rain much in Buenos Aires in winter.'
  and not (es_alt && array['En invierno no llueve mucho en Buenos Aires.', 'No llueve mucho en Buenos Aires en invierno.']::text[]);

update public.sentences set es_alt = es_alt || array['En julio no llueve mucho, pero hace frío.']::text[]
where id = '3e492bf8-bfd7-5c6c-95b3-b208b62ead94' and es = 'En julio llueve poco, pero hace frío.' and en = 'In July it doesn''t rain much, but it''s cold.'
  and not (es_alt && array['En julio no llueve mucho, pero hace frío.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué mes es?']::text[], note_en = coalesce(note_en, 'Spanish often asks about dates with “estamos”: literally “what month are we in?”.')
where id = 'e542a036-123d-5123-91dc-3f5d66b23ef1' and es = '¿En qué mes estamos?' and en = 'What month is it?'
  and not (es_alt && array['¿Qué mes es?']::text[]);

update public.sentences set es_alt = es_alt || array['En marzo empiezo un laburo nuevo.', 'Empiezo un laburo nuevo en marzo.']::text[]
where id = 'c076804c-18ca-5459-98be-5fab052937b0' and es = 'En marzo empiezo en un laburo nuevo.' and en = 'I''m starting a new job in March.'
  and not (es_alt && array['En marzo empiezo un laburo nuevo.', 'Empiezo un laburo nuevo en marzo.']::text[]);

update public.sentences set es_alt = es_alt || array['Voy a Estados Unidos en junio.', 'En junio voy a Estados Unidos.']::text[], note_en = coalesce(note_en, '“Me voy” stresses that you are heading off and leaving where you are; plain “voy” works too.')
where id = '5080d018-ad2d-52f8-93ed-396c23cb2057' and es = 'Me voy a Estados Unidos en junio.' and en = 'I''m going to the United States in June.'
  and not (es_alt && array['Voy a Estados Unidos en junio.', 'En junio voy a Estados Unidos.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Un grado y salís sin campera?', '¿Hace un grado y salís sin campera?', '¿Hace un grado y vas sin campera?']::text[]
where id = '4dedd3f4-f483-507a-a69b-5b21bd8a65fa' and es = '¿Un grado y vas sin campera?' and en = 'It''s one degree and you''re going out without a jacket?'
  and not (es_alt && array['¿Un grado y salís sin campera?', '¿Hace un grado y salís sin campera?', '¿Hace un grado y vas sin campera?']::text[]);

update public.sentences set es_alt = es_alt || array['No duermo mucho y estoy siempre cansado.', 'No duermo mucho y estoy siempre cansada.', 'No duermo mucho y siempre estoy cansado.', 'No duermo mucho y siempre estoy cansada.']::text[]
where id = '2f1bcfd7-9653-5c30-99cd-9d078bf4b093' and es = 'Duermo poco y estoy siempre cansado.' and en = 'I don''t sleep much, and I''m always tired.'
  and not (es_alt && array['No duermo mucho y estoy siempre cansado.', 'No duermo mucho y estoy siempre cansada.', 'No duermo mucho y siempre estoy cansado.', 'No duermo mucho y siempre estoy cansada.']::text[]);

update public.sentences set es_alt = es_alt || array['En Córdoba hace diez grados menos.', 'Hace diez grados menos en Córdoba.']::text[]
where id = 'ac294da4-f067-5aab-ae91-f938f206a5ba' and es = 'En Córdoba hay diez grados menos.' and en = 'It''s ten degrees cooler in Córdoba.'
  and not (es_alt && array['En Córdoba hace diez grados menos.', 'Hace diez grados menos en Córdoba.']::text[]);

update public.sentences set es_alt = es_alt || array['Hace mucho calor, voy a la pileta.']::text[], note_en = coalesce(note_en, '“Me voy” stresses that you are heading off right now; plain “voy” works too.')
where id = '28e07dd9-1225-56d0-8af8-0b10e698a34d' and es = 'Hace mucho calor, me voy a la pileta.' and en = 'It''s really hot, I''m going to the pool.'
  and not (es_alt && array['Hace mucho calor, voy a la pileta.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana va a hacer dos grados, ¡qué frío!']::text[], note_en = coalesce(note_en, 'Argentines often use the plain present for the near future when a word like “mañana” already makes the time clear.')
where id = 'c3809d40-3c9b-5aa3-baf2-f6b61edc03ec' and es = 'Mañana hace dos grados, ¡qué frío!' and en = 'It''s going to be two degrees tomorrow. So cold!'
  and not (es_alt && array['Mañana va a hacer dos grados, ¡qué frío!']::text[]);

update public.sentences set es_alt = es_alt || array['Me encanta dormir la siesta en invierno.', 'En invierno me encanta dormir la siesta.']::text[]
where id = '59bde187-bac5-5a31-bf68-7a59540522af' and es = 'Me encanta la siesta en invierno.' and en = 'I love napping in winter.'
  and not (es_alt && array['Me encanta dormir la siesta en invierno.', 'En invierno me encanta dormir la siesta.']::text[]);

update public.sentences set es_alt = es_alt || array['Voy a Córdoba el viernes.', 'El viernes voy a Córdoba.']::text[], note_en = coalesce(note_en, '“Me voy” stresses that you are heading off and leaving where you are; plain “voy” works too.')
where id = 'aa3b49b2-177b-5db2-8e30-6977a569bb88' and es = 'Me voy a Córdoba el viernes.' and en = 'I''m going to Córdoba on Friday.'
  and not (es_alt && array['Voy a Córdoba el viernes.', 'El viernes voy a Córdoba.']::text[]);

update public.sentences set es_alt = es_alt || array['Voy al centro con Martín.']::text[], note_en = coalesce(note_en, '“Me voy” stresses that you are heading off right now; plain “voy” works too.')
where id = '3a1e305f-ff50-59ea-bf0e-bbf378d7e497' and es = 'Me voy al centro con Martín.' and en = 'I''m going downtown with Martín.'
  and not (es_alt && array['Voy al centro con Martín.']::text[]);

update public.sentences set es_alt = es_alt || array['Voy en taxi porque llueve.', 'Me tomo un taxi porque llueve.']::text[], note_en = coalesce(note_en, 'Argentines often say “me voy en taxi” (I''m going by taxi) where English says “I''m taking a taxi”.')
where id = 'e3f394de-8208-52be-a7ca-13c6b7252018' and es = 'Me voy en taxi porque llueve.' and en = 'I''m taking a taxi because it''s raining.'
  and not (es_alt && array['Voy en taxi porque llueve.', 'Me tomo un taxi porque llueve.']::text[]);

update public.sentences set es_alt = es_alt || array['Dame un segundo, estoy cocinando.', 'Esperame un segundo, estoy cocinando.']::text[], note_en = coalesce(note_en, '“Esperame” (wait for me) is the everyday Argentine way to say “hang on” or “give me a sec”.')
where id = '93f1844f-124c-553b-bc30-4aa0cc3e2ccb' and es = 'Esperame, estoy cocinando.' and en = 'Give me a sec, I''m cooking.'
  and not (es_alt && array['Dame un segundo, estoy cocinando.', 'Esperame un segundo, estoy cocinando.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenemos que preparar la fiesta.']::text[], note_en = coalesce(note_en, '“Hay que” means “it has to be done” without saying who; Argentines use it all the time where English says “we have to”.')
where id = '9ffe00f2-530e-5dde-97ff-f8528536e15c' and es = 'Hay que preparar la fiesta.' and en = 'We have to get the party ready.'
  and not (es_alt && array['Tenemos que preparar la fiesta.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hermano está jugando con su celu.', 'Mi hermano está jugando en el celu.', 'Mi hermano está jugando en su celu.']::text[], note_en = coalesce(note_en, 'Spanish often uses “el” where English says “his” when it is obvious whose thing it is.')
where id = '25a0a993-d41b-58ea-9418-85415342003e' and es = 'Mi hermano está jugando con el celu.' and en = 'My brother is playing on his phone.'
  and not (es_alt && array['Mi hermano está jugando con su celu.', 'Mi hermano está jugando en el celu.', 'Mi hermano está jugando en su celu.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Feliz cumpleaños!']::text[], note_en = coalesce(note_en, '“Cumple” is the everyday short form of “cumpleaños”; both are right.')
where id = '40fc6dad-cc76-56ad-925c-2d6b96c26489' and es = '¡Feliz cumple!' and en = 'Happy birthday!'
  and not (es_alt && array['¡Feliz cumpleaños!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuándo es tu cumpleaños?', '¿Cuándo es tu cumple?']::text[], note_en = coalesce(note_en, 'Argentines often talk about birthdays with the verb “cumplir años”, literally “to complete years”.')
where id = 'd94b3b2e-0cf9-5a3c-ba9f-0df3c9532a2e' and es = '¿Cuándo cumplís años?' and en = 'When is your birthday?'
  and not (es_alt && array['¿Cuándo es tu cumpleaños?', '¿Cuándo es tu cumple?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tu cumpleaños es en verano o en invierno?', '¿Tu cumple es en verano o en invierno?']::text[], note_en = coalesce(note_en, 'Argentines often talk about birthdays with the verb “cumplir años”, literally “to complete years”.')
where id = 'ce117093-091b-564c-a3d3-9a8429627861' and es = '¿Cumplís años en verano o en invierno?' and en = 'Is your birthday in summer or in winter?'
  and not (es_alt && array['¿Tu cumpleaños es en verano o en invierno?', '¿Tu cumple es en verano o en invierno?']::text[]);

update public.sentences set es_alt = es_alt || array['Tu cumpleaños es el domingo, ¿vas a hacer una fiesta?', 'Tu cumple es el domingo, ¿vas a hacer una fiesta?']::text[], note_en = coalesce(note_en, 'Argentines often talk about birthdays with the verb “cumplir años”, literally “to complete years”.')
where id = 'd079b3ac-dda0-5b33-9ee6-4bf75d9a44ed' and es = 'Cumplís años el domingo, ¿vas a hacer una fiesta?' and en = 'Your birthday is on Sunday, are you going to have a party?'
  and not (es_alt && array['Tu cumpleaños es el domingo, ¿vas a hacer una fiesta?', 'Tu cumple es el domingo, ¿vas a hacer una fiesta?']::text[]);

update public.sentences set es_alt = es_alt || array['Es un regalo, ¿tenés una bolsa?']::text[], note_en = coalesce(note_en, '“Es para regalo” is what Argentines say in a shop so the item gets gift-wrapped or bagged nicely.')
where id = 'af94659b-e70c-56fa-9521-803e44a26161' and es = 'Es para regalo, ¿tenés una bolsa?' and en = 'It''s a gift. Do you have a bag?'
  and not (es_alt && array['Es un regalo, ¿tenés una bolsa?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Ya llegás?', '¿Ya casi llegás?']::text[], note_en = coalesce(note_en, '“Estar llegando” is how Argentines say they are almost there: literally “to be arriving”.')
where id = '418dafde-6f69-534f-8247-f75bda1cf882' and es = '¿Estás llegando?' and en = 'Are you almost here?'
  and not (es_alt && array['¿Ya llegás?', '¿Ya casi llegás?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Estás llegando? Estamos todos en el bar.', '¿Ya casi llegás? Estamos todos en el bar.']::text[]
where id = 'b9730a13-46cc-5d06-b183-70540ba079df' and es = '¿Ya llegás? Estamos todos en el bar.' and en = 'Are you almost here? We''re all at the bar.'
  and not (es_alt && array['¿Estás llegando? Estamos todos en el bar.', '¿Ya casi llegás? Estamos todos en el bar.']::text[]);

update public.sentences set es_alt = es_alt || array['Ana está llegando con las facturas.', 'Ana ya casi llega con las facturas.']::text[], note_en = coalesce(note_en, '“Está llegando” already means “almost here”; the “ya” just adds a feeling of “any second now”.')
where id = '8d40aaa1-ec72-5d4c-ba4a-be89d50ebdb4' and es = 'Ana ya está llegando con las facturas.' and en = 'Ana''s almost here with the pastries.'
  and not (es_alt && array['Ana está llegando con las facturas.', 'Ana ya casi llega con las facturas.']::text[]);

update public.sentences set es_alt = es_alt || array['Casi no tengo datos en mi celu.']::text[], note_en = coalesce(note_en, 'Spanish often uses “el” where English says “my” when it is obvious whose thing it is.')
where id = '08a86c13-93b0-5baf-8071-81b0c21aadc2' and es = 'Casi no tengo datos en el celu.' and en = 'I have almost no data on my phone.'
  and not (es_alt && array['Casi no tengo datos en mi celu.']::text[]);

update public.sentences set es_alt = es_alt || array['Ya casi llego, esperame en la esquina.', 'Ya estoy llegando, esperame en la esquina.']::text[], note_en = coalesce(note_en, '“Estoy llegando” is how Argentines say “I''m almost there”: literally “I''m arriving”.')
where id = '27a5e851-1570-55c3-8744-9f0f8ef179b4' and es = 'Estoy llegando, esperame en la esquina.' and en = 'I''m almost there, wait for me on the corner.'
  and not (es_alt && array['Ya casi llego, esperame en la esquina.', 'Ya estoy llegando, esperame en la esquina.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy llegando, estoy a dos cuadras.', 'Ya estoy llegando, estoy a dos cuadras.']::text[]
where id = 'cd65aead-7b19-5648-b9d3-c2261d99e8e2' and es = 'Ya casi llego, estoy a dos cuadras.' and en = 'I''m almost there, I''m two blocks away.'
  and not (es_alt && array['Estoy llegando, estoy a dos cuadras.', 'Ya estoy llegando, estoy a dos cuadras.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Venís la próxima vez?']::text[], note_en = coalesce(note_en, 'Argentines often say just “la próxima” for “next time”; the “vez” is understood.')
where id = '14b7493e-81fa-5e60-8e69-693ef7788795' and es = '¿Venís la próxima?' and en = 'Are you coming next time?'
  and not (es_alt && array['¿Venís la próxima vez?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, voy a llegar tarde porque el bondi no viene.']::text[], note_en = coalesce(note_en, 'Argentines often use the plain present for something about to happen: “llego tarde” = “I''m going to be late”.')
where id = '5ade6903-d5b9-55e4-a554-4ddcb92e77a8' and es = 'Che, llego tarde porque el bondi no viene.' and en = 'Hey, I''m going to be late because the bus isn''t coming.'
  and not (es_alt && array['Che, voy a llegar tarde porque el bondi no viene.']::text[]);

update public.sentences set es_alt = es_alt || array['Esta semana no puedo, pero la próxima semana sí.', 'Esta semana no puedo, pero la semana que viene sí.']::text[]
where id = 'ec8bc9d9-7a99-52c7-873c-87254c00103d' and es = 'Esta semana no puedo, pero la próxima sí.' and en = 'I can''t this week, but next week I can.'
  and not (es_alt && array['Esta semana no puedo, pero la próxima semana sí.', 'Esta semana no puedo, pero la semana que viene sí.']::text[]);

update public.sentences set es_alt = es_alt || array['Ya casi llego, es la próxima parada.', 'Ya estoy llegando, es la próxima parada.']::text[], note_en = coalesce(note_en, '“Estoy llegando” is how Argentines say “I''m almost there”: literally “I''m arriving”.')
where id = 'e1691c78-4b8a-546d-9197-2ef79ce04c07' and es = 'Estoy llegando, es la próxima parada.' and en = 'I''m almost there, it''s the next stop.'
  and not (es_alt && array['Ya casi llego, es la próxima parada.', 'Ya estoy llegando, es la próxima parada.']::text[]);

update public.sentences set es_alt = es_alt || array['Hoy voy a llegar tarde.', 'Voy a llegar tarde hoy.']::text[], note_en = coalesce(note_en, 'Argentines often use the plain present for something about to happen: “llego tarde” = “I''m going to be late”.')
where id = 'd7a0aeab-fc58-52e0-a8b5-9a239ec7a722' and es = 'Hoy llego tarde.' and en = 'I''m going to be late today.'
  and not (es_alt && array['Hoy voy a llegar tarde.', 'Voy a llegar tarde hoy.']::text[]);

update public.sentences set es_alt = es_alt || array['Invito yo, pero la próxima vez pagás vos.']::text[], note_en = coalesce(note_en, 'Argentines often say just “la próxima” for “next time”; the “vez” is understood.')
where id = '0509018e-2f1d-5aee-9374-a96649bb66aa' and es = 'Invito yo, pero la próxima pagás vos.' and en = 'It''s on me, but next time you pay.'
  and not (es_alt && array['Invito yo, pero la próxima vez pagás vos.']::text[]);

update public.sentences set es_alt = es_alt || array['La próxima vez invito yo.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = 'd582cc6b-6ba7-536f-907c-7a46702ed7e9' and es = 'La próxima invito yo.' and en = 'Next time it''s on me.'
  and not (es_alt && array['La próxima vez invito yo.']::text[]);

update public.sentences set es_alt = es_alt || array['Boludo, ¿me podés pasar la dirección?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿me pasás…?” is as polite as “can you…?”.')
where id = '1cb3afcc-3ce2-5fde-acf4-29480b0ef01c' and es = 'Boludo, ¿me pasás la dirección?' and en = 'Dude, can you send me the address?'
  and not (es_alt && array['Boludo, ¿me podés pasar la dirección?']::text[]);

update public.sentences set es_alt = es_alt || array['Llevá el paraguas, llueve.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason: it works like a quick “because”.')
where id = '34583671-0249-50c8-ba26-7b4f1951127c' and es = 'Llevá el paraguas, que llueve.' and en = 'Take the umbrella, it''s raining.'
  and not (es_alt && array['Llevá el paraguas, llueve.']::text[]);

update public.sentences set es_alt = es_alt || array['Llevá una campera porque a la noche hace frío.']::text[], note_en = coalesce(note_en, 'Spanish often says “la campera” where English says “a jacket”: it''s understood to be your own.')
where id = '56d0d122-69c4-5f1c-bc86-2386fa0cba24' and es = 'Llevá la campera porque a la noche hace frío.' and en = 'Take a jacket because it gets cold at night.'
  and not (es_alt && array['Llevá una campera porque a la noche hace frío.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Le podés decir al mozo que falta un tenedor?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿le decís…?” is as polite as “can you tell…?”.')
where id = '79a6d61b-f7f4-50f3-89f3-e72157cf1318' and es = '¿Le decís al mozo que falta un tenedor?' and en = 'Can you tell the waiter that a fork is missing?'
  and not (es_alt && array['¿Le podés decir al mozo que falta un tenedor?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar a poner la mesa?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿me ayudás?” is as polite as “can you help me?”.')
where id = 'e5563667-8fd2-5123-ae31-44e6b8255819' and es = '¿Me ayudás a poner la mesa?' and en = 'Can you help me set the table?'
  and not (es_alt && array['¿Me podés ayudar a poner la mesa?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Podés poner algo de música para el asado?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿ponés…?” is as polite as “can you put on…?”.')
where id = '8d0aa662-8fe4-5d0f-a7ad-0dca7836ed2d' and es = '¿Ponés algo de música para el asado?' and en = 'Can you put on some music for the asado?'
  and not (es_alt && array['¿Podés poner algo de música para el asado?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Ponés la mesa? Ya está la comida.', '¿Ponés la mesa? La comida está lista.', '¿Podés poner la mesa? La comida está lista.', '¿Podés poner la mesa? Ya está la comida.']::text[], note_en = coalesce(note_en, 'Argentines often tack the reason onto a request with “que”, and “ya está la comida” is the everyday way to say the food is ready.')
where id = '1b14b60f-9164-518a-a03a-0905b54e0ce3' and es = '¿Ponés la mesa, que ya está la comida?' and en = 'Can you set the table? The food is ready.'
  and not (es_alt && array['¿Ponés la mesa? Ya está la comida.', '¿Ponés la mesa? La comida está lista.', '¿Podés poner la mesa? La comida está lista.', '¿Podés poner la mesa? Ya está la comida.']::text[]);

update public.sentences set es_alt = es_alt || array['Dicen que mañana va a hacer frío.', 'Dicen que va a hacer frío mañana.']::text[], note_en = coalesce(note_en, 'In everyday speech Argentines often use the present for something coming up soon: “mañana hace frío”.')
where id = '4bef9c49-44a0-5215-9d6c-f5932eb0d8f2' and es = 'Dicen que mañana hace frío.' and en = 'They say it''s going to be cold tomorrow.'
  and not (es_alt && array['Dicen que mañana va a hacer frío.', 'Dicen que va a hacer frío mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Santi está a cargo de la música.']::text[], note_en = coalesce(note_en, 'When organizing a get-together, “poner” means to provide or take care of something: “Santi pone la música”.')
where id = 'ffbc9ce4-f903-5fbd-9799-0670cb28f454' and es = 'Santi pone la música.' and en = 'Santi''s in charge of the music.'
  and not (es_alt && array['Santi está a cargo de la música.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuánto pagaste por las zapatillas?']::text[], note_en = coalesce(note_en, 'In Spanish you can “pagar” something directly, with no “por”.')
where id = 'bc270698-c771-5c8c-b8db-7b395e14683b' and es = '¿Cuánto pagaste las zapatillas?' and en = 'How much did you pay for the sneakers?'
  and not (es_alt && array['¿Cuánto pagaste por las zapatillas?']::text[]);

update public.sentences set es_alt = es_alt || array['Ana pagó el vino y yo pagué la carne.']::text[], note_en = coalesce(note_en, 'Spanish happily skips the repeated verb: “y yo la carne” already means “and I paid for the meat”.')
where id = '0dabac84-cf52-5b46-95ff-039d0e5baab5' and es = 'Ana pagó el vino y yo la carne.' and en = 'Ana paid for the wine and I paid for the meat.'
  and not (es_alt && array['Ana pagó el vino y yo pagué la carne.']::text[]);

update public.sentences set es_alt = es_alt || array['Cené temprano porque mañana me levanto muy temprano.', 'Cené temprano porque mañana me levanto re temprano.']::text[], note_en = coalesce(note_en, '“Madrugar” packs “to get up really early” into a single verb.')
where id = '80e95f78-1302-53c2-958b-05f4299562d3' and es = 'Cené temprano porque mañana madrugo.' and en = 'I had dinner early because I''m getting up really early tomorrow.'
  and not (es_alt && array['Cené temprano porque mañana me levanto muy temprano.', 'Cené temprano porque mañana me levanto re temprano.']::text[]);

update public.sentences set es_alt = es_alt || array['Belén y yo cenamos en la terraza.']::text[], note_en = coalesce(note_en, 'Argentines often say “con Belén cenamos” to mean “Belén and I had dinner”: the “we” already includes her.')
where id = 'ade24828-cc9f-536d-a917-de5e67e5644f' and es = 'Con Belén cenamos en la terraza.' and en = 'Belén and I had dinner on the terrace.'
  and not (es_alt && array['Belén y yo cenamos en la terraza.']::text[]);

update public.sentences set es_alt = es_alt || array['No pagué nada, pagó Nico.', 'No pagué nada, Nico pagó por mí.']::text[], note_en = coalesce(note_en, '“Invitar” in Argentina often means to treat someone: “invitó Nico” means Nico picked up the bill.')
where id = '00b75fbb-1bae-59fd-a3d9-11c0ffc62360' and es = 'No pagué nada, invitó Nico.' and en = 'I didn''t pay anything; Nico paid for me.'
  and not (es_alt && array['No pagué nada, pagó Nico.', 'No pagué nada, Nico pagó por mí.']::text[]);

update public.sentences set es_alt = es_alt || array['Caminé porque el bondi nunca llegó.', 'Caminé porque el bondi no llegó nunca.']::text[]
where id = '45e566fb-d5a3-54b1-aeb1-66dc5c6c4747' and es = 'Caminé porque el bondi no llegó.' and en = 'I walked because the bus never came.'
  and not (es_alt && array['Caminé porque el bondi nunca llegó.', 'Caminé porque el bondi no llegó nunca.']::text[]);

update public.sentences set es_alt = es_alt || array['Esperé en el bar, pero Cami nunca llegó.', 'Esperé en el bar, pero Cami no llegó nunca.']::text[]
where id = '732dc2cc-caf9-5946-8d36-ea70b1195b86' and es = 'Esperé en el bar, pero Cami no llegó.' and en = 'I waited at the bar, but Cami never showed up.'
  and not (es_alt && array['Esperé en el bar, pero Cami nunca llegó.', 'Esperé en el bar, pero Cami no llegó nunca.']::text[]);

update public.sentences set es_alt = es_alt || array['Estamos acá.']::text[]
where id = '0b47775c-53d3-50ed-beab-77a9b8cfb5b4' and es = 'Ya llegamos.' and en = 'We''re here.'
  and not (es_alt && array['Estamos acá.']::text[]);

update public.sentences set es_alt = es_alt || array['Los invitados llegaron.', 'Los invitados están acá.']::text[]
where id = '0d674c71-3761-581d-acd0-ca2adba8f1e4' and es = 'Ya llegaron los invitados.' and en = 'The guests are here.'
  and not (es_alt && array['Los invitados llegaron.', 'Los invitados están acá.']::text[]);

update public.sentences set es_alt = es_alt || array['Vos conocés Rosario, ¿sabés dónde puedo comer bien?']::text[], note_en = coalesce(note_en, '“Vos que conocés…” literally means “you, who know…”. It is a common way to lead into asking someone for a tip.')
where id = '6125549a-636b-529e-98f2-a122fdc3e21d' and es = 'Vos que conocés Rosario, ¿sabés dónde puedo comer bien?' and en = 'You know Rosario, do you know where I can eat well?'
  and not (es_alt && array['Vos conocés Rosario, ¿sabés dónde puedo comer bien?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te gusta la vida en la ciudad?']::text[], note_en = coalesce(note_en, 'Argentines call the city of Buenos Aires “Capital”, short for Capital Federal.')
where id = '4fed7051-2726-53b3-84ef-9ed11528de81' and es = '¿Te gusta la vida en Capital?' and en = 'Do you like life in the city?'
  and not (es_alt && array['¿Te gusta la vida en la ciudad?']::text[]);

update public.sentences set es_alt = es_alt || array['Ah, ahora entiendo.']::text[], note_en = coalesce(note_en, 'Argentines often use the past here: “ahora entendí” is like saying “I just got it”.')
where id = '4ef8b05c-d38d-59ff-80b3-c146d70a4a90' and es = 'Ah, ahora entendí.' and en = 'Oh, now I get it.'
  and not (es_alt && array['Ah, ahora entiendo.']::text[]);

update public.sentences set es_alt = es_alt || array['Esperame en el lugar de siempre.']::text[]
where id = 'ee5936e5-c8da-547a-8bca-9355275cc73c' and es = 'Esperame donde siempre.' and en = 'Wait for me in the usual place.'
  and not (es_alt && array['Esperame en el lugar de siempre.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Volviste tarde a casa anoche?', '¿Llegaste tarde a casa anoche?']::text[]
where id = '440d1fc0-7458-5f7a-9724-619a57127f68' and es = '¿Volviste tarde anoche?' and en = 'Did you get home late last night?'
  and not (es_alt && array['¿Volviste tarde a casa anoche?', '¿Llegaste tarde a casa anoche?']::text[]);

update public.sentences set es_alt = es_alt || array['Juli y yo fuimos a Montevideo.']::text[], note_en = coalesce(note_en, 'Argentines often say “Con Juli fuimos” (literally “with Juli we went”) to mean “Juli and I went”.')
where id = '65ed3f6c-3f9d-5053-ba4b-806400176226' and es = 'Con Juli fuimos a Montevideo.' and en = 'Juli and I went to Montevideo.'
  and not (es_alt && array['Juli y yo fuimos a Montevideo.']::text[]);

update public.sentences set es_alt = es_alt || array['El finde pasado fuimos a Rosario con mis viejos.']::text[], note_en = coalesce(note_en, 'With a past verb, “el finde” on its own already means last weekend.')
where id = 'be49ef94-d8e8-5232-9101-ec3e724141b9' and es = 'El finde fuimos a Rosario con mis viejos.' and en = 'Last weekend we went to Rosario with my parents.'
  and not (es_alt && array['El finde pasado fuimos a Rosario con mis viejos.']::text[]);

update public.sentences set es_alt = es_alt || array['El finde pasado estuve en Rosario.']::text[], note_en = coalesce(note_en, 'With a past verb, “el finde” on its own already means last weekend.')
where id = 'c5d4035a-0924-5c6b-821e-359a93242434' and es = 'El finde estuve en Rosario.' and en = 'Last weekend I was in Rosario.'
  and not (es_alt && array['El finde pasado estuve en Rosario.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuánto tiempo estuviste en Inglaterra?']::text[]
where id = '0ddb74f7-63bb-5d11-8995-a16858f7b161' and es = '¿Cuánto tiempo estuvieron en Inglaterra?' and en = 'How long were you in England?'
  and not (es_alt && array['¿Cuánto tiempo estuviste en Inglaterra?']::text[]);

update public.sentences set es_alt = es_alt || array['Nico y yo la pasamos increíble.']::text[], note_en = coalesce(note_en, 'Argentines often say “Con Nico la pasamos” (literally “with Nico we had”) to mean “Nico and I had”.')
where id = 'c01dc0fe-96ac-503a-88e9-59495cff1993' and es = 'Con Nico la pasamos increíble.' and en = 'Nico and I had an amazing time.'
  and not (es_alt && array['Nico y yo la pasamos increíble.']::text[]);

update public.sentences set es_alt = es_alt || array['Fuimos a ver una banda de Rosario, ¡estuvo increíble!', 'Fuimos a ver una banda de Rosario, ¡fue increíble!']::text[]
where id = '9f3b9b53-75a9-55fc-89b8-4a85ee8251d7' and es = 'Fuimos a ver una banda de Rosario, ¡increíble!' and en = 'We went to see a band from Rosario, it was amazing!'
  and not (es_alt && array['Fuimos a ver una banda de Rosario, ¡estuvo increíble!', 'Fuimos a ver una banda de Rosario, ¡fue increíble!']::text[]);

update public.sentences set es_alt = es_alt || array['Fuimos a ver una banda uruguaya.', 'Fuimos a ver a una banda uruguaya.']::text[]
where id = '35d48920-8c61-5161-8bdc-ee13deb4452d' and es = 'Fuimos al recital de una banda uruguaya.' and en = 'We went to see a Uruguayan band.'
  and not (es_alt && array['Fuimos a ver una banda uruguaya.', 'Fuimos a ver a una banda uruguaya.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Dónde naciste? —Nací en La Plata, pero vivo en la ciudad.']::text[], note_en = coalesce(note_en, 'Argentines call the city of Buenos Aires “Capital”, short for Capital Federal.')
where id = 'c44583c3-fcfa-5b83-89e6-26d6077091da' and es = '—¿Dónde naciste? —Nací en La Plata, pero vivo en Capital.' and en = '—Where were you born? —I was born in La Plata, but I live in the city.'
  and not (es_alt && array['—¿Dónde naciste? —Nací en La Plata, pero vivo en la ciudad.']::text[]);

update public.sentences set es_alt = es_alt || array['Ah, ahora entiendo.']::text[], note_en = coalesce(note_en, 'Argentines often use the past here: “ahora entendí” is like saying “I just got it”.')
where id = 'bc070d64-3aa0-5cf3-924a-bc0c7ec217be' and es = 'Ah, ahora entendí.' and en = 'Oh, now I get it.'
  and not (es_alt && array['Ah, ahora entiendo.']::text[]);

update public.sentences set es_alt = es_alt || array['Anoche pagué yo, así que hoy pagás vos.']::text[]
where id = 'e93c460b-2d9d-5233-b887-476b6f8b6c85' and es = 'Anoche pagué yo, hoy pagás vos.' and en = 'I paid last night, so today it''s on you.'
  and not (es_alt && array['Anoche pagué yo, así que hoy pagás vos.']::text[]);

update public.sentences set es_alt = es_alt || array['Anoche volví re tarde a casa.', 'Anoche llegué re tarde a casa.']::text[]
where id = '79683f78-ad8a-54f5-b56d-c9cc6c278c54' and es = 'Anoche volví re tarde.' and en = 'I got home really late last night.'
  and not (es_alt && array['Anoche volví re tarde a casa.', 'Anoche llegué re tarde a casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Ayer me compraste un café.']::text[], note_en = coalesce(note_en, '“Invitar” something to someone means to treat them to it: “te invito un café” is “coffee''s on me”.')
where id = '79723344-1974-5db0-9209-d5b672833e7b' and es = 'Ayer me invitaste un café.' and en = 'You bought me a coffee yesterday.'
  and not (es_alt && array['Ayer me compraste un café.']::text[]);

update public.sentences set es_alt = es_alt || array['Cenamos en la casa de mi abuela.']::text[], note_en = coalesce(note_en, 'Argentines also say “en lo de mi abuela” for “at my grandma''s”.')
where id = '2d708fcc-b2fb-578d-b1bc-0cbd35cf768f' and es = 'Cenamos en casa de mi abuela.' and en = 'We had dinner at my grandma''s.'
  and not (es_alt && array['Cenamos en la casa de mi abuela.']::text[]);

update public.sentences set es_alt = es_alt || array['Estuvimos en la casa de Diego mirando el partido.']::text[], note_en = coalesce(note_en, 'Argentines also say “en lo de Diego” for “at Diego''s”.')
where id = '8f881a24-26b6-57a3-8dd4-98f853f23d87' and es = 'Estuvimos en casa de Diego mirando el partido.' and en = 'We were at Diego''s watching the game.'
  and not (es_alt && array['Estuvimos en la casa de Diego mirando el partido.']::text[]);

update public.sentences set es_alt = es_alt || array['La cerveza la pagaste vos, ¿no?', 'Vos pagaste la cerveza, ¿no?']::text[], note_en = coalesce(note_en, '“Invitar” something means to treat someone to it, so “la invitaste vos” is “it was your treat”.')
where id = '56f0edc1-d603-54be-a638-705f74d87926' and es = 'La cerveza la invitaste vos, ¿no?' and en = 'You paid for the beer, right?'
  and not (es_alt && array['La cerveza la pagaste vos, ¿no?', 'Vos pagaste la cerveza, ¿no?']::text[]);

update public.sentences set es_alt = es_alt || array['Llegaron tarde porque el bondi nunca pasó.', 'Llegaron tarde porque el bondi nunca vino.']::text[]
where id = '8be844d1-a1a3-5005-96d5-a88a5dc371de' and es = 'Llegaron tarde porque el bondi no pasó.' and en = 'They got here late because the bus never came.'
  and not (es_alt && array['Llegaron tarde porque el bondi nunca pasó.', 'Llegaron tarde porque el bondi nunca vino.']::text[]);

update public.sentences set es_alt = es_alt || array['Nací en Uruguay, pero soy cien por ciento porteña.']::text[], note_en = coalesce(note_en, '“Re” is the all-purpose Argentine intensifier: “re porteña” is “totally porteña”.')
where id = '6849b089-1d14-5ad1-aefa-1b90a768dbd3' and es = 'Nací en Uruguay, pero soy re porteña.' and en = 'I was born in Uruguay, but I''m one hundred percent porteña.'
  and not (es_alt && array['Nací en Uruguay, pero soy cien por ciento porteña.']::text[]);

update public.sentences set es_alt = es_alt || array['Pagué dos mil pesos por el café.']::text[], note_en = coalesce(note_en, 'In everyday speech Argentines often skip the “por”: “pagué dos mil pesos el café”.')
where id = '7126cff2-08c1-595f-b307-6302efde65f2' and es = 'Pagué dos mil pesos el café.' and en = 'I paid two thousand pesos for the coffee.'
  and not (es_alt && array['Pagué dos mil pesos por el café.']::text[]);

update public.sentences set es_alt = es_alt || array['Al final hicimos el asado en casa de Lucía.']::text[], note_en = coalesce(note_en, 'Argentines also say “en lo de Lucía” for “at Lucía''s”.')
where id = 'dc24bae6-47bd-5740-b951-2cd565309205' and es = 'Al final hicimos el asado en la casa de Lucía.' and en = 'In the end we had the asado at Lucía''s house.'
  and not (es_alt && array['Al final hicimos el asado en casa de Lucía.']::text[]);

update public.sentences set es_alt = es_alt || array['Rocío y yo hicimos empanadas para el partido.']::text[], note_en = coalesce(note_en, 'Argentines often say “Con Rocío hicimos” (literally “with Rocío we made”) to mean “Rocío and I made”.')
where id = '92718bcc-a4d8-5064-bbc5-951a309c973f' and es = 'Con Rocío hicimos empanadas para el partido.' and en = 'Rocío and I made empanadas for the game.'
  and not (es_alt && array['Rocío y yo hicimos empanadas para el partido.']::text[]);

update public.sentences set es_alt = es_alt || array['Primero tomamos el bondi y después caminamos diez cuadras.']::text[]
where id = '0fda1180-9e78-57df-899b-2210c9d5105e' and es = 'Primero vinimos en bondi y después caminamos diez cuadras.' and en = 'First we took the bus and then we walked ten blocks.'
  and not (es_alt && array['Primero tomamos el bondi y después caminamos diez cuadras.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Pudieron dormir algo?']::text[]
where id = '2d2937be-35ca-56c6-be6b-0e4f4e57e56a' and es = '¿Pudieron dormir?' and en = 'Did you guys get any sleep?'
  and not (es_alt && array['¿Pudieron dormir algo?']::text[]);

update public.sentences set es_alt = es_alt || array['El café acá es buenísimo.', 'Acá el café es buenísimo.']::text[], note_en = coalesce(note_en, '“El café de acá” means “the coffee from around here”. Argentines say it both with and without “de”.')
where id = '0870d389-8650-5d03-bcaa-510ac74e48dd' and es = 'El café de acá es buenísimo.' and en = 'The coffee here is really good.'
  and not (es_alt && array['El café acá es buenísimo.', 'Acá el café es buenísimo.']::text[]);

update public.sentences set es_alt = es_alt || array['La carne acá está riquísima.']::text[], note_en = coalesce(note_en, '“La carne de acá” means “the meat from around here”. Argentines say it both with and without “de”.')
where id = '7b787c75-5397-5209-b6f1-8100ebc0bf65' and es = 'La carne de acá está riquísima.' and en = 'The meat here is delicious.'
  and not (es_alt && array['La carne acá está riquísima.']::text[]);

update public.sentences set es_alt = es_alt || array['Mis compañeros de la oficina son re buenos.']::text[], note_en = coalesce(note_en, 'Spanish often uses “los” where English says “my” when it is obvious whose they are.')
where id = '808883a2-94bd-5733-a97f-ecd15c684ac5' and es = 'Los compañeros de la oficina son re buenos.' and en = 'My coworkers at the office are really nice.'
  and not (es_alt && array['Mis compañeros de la oficina son re buenos.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Qué semana tan lenta!', '¡Qué semana lenta!']::text[], note_en = coalesce(note_en, 'In exclamations with “¡Qué…!”, “más” before the adjective just adds emphasis; it does not mean “more” here.')
where id = 'd406ff9e-2054-5491-bd9f-795cb82f001d' and es = '¡Qué semana más lenta!' and en = 'What a slow week!'
  and not (es_alt && array['¡Qué semana tan lenta!', '¡Qué semana lenta!']::text[]);

update public.sentences set es_alt = es_alt || array['Me duele la garganta.']::text[], note_en = coalesce(note_en, '“Estar mal de” plus a body part is a common everyday way to say that part is giving you trouble.')
where id = 'c231510c-c2e1-59e6-829e-b909ff372ac6' and es = 'Estoy mal de la garganta.' and en = 'I have a sore throat.'
  and not (es_alt && array['Me duele la garganta.']::text[]);

update public.sentences set es_alt = es_alt || array['Llegué tarde a mi turno.']::text[], note_en = coalesce(note_en, 'Spanish often uses “el” where English says “my” when it is obvious whose it is.')
where id = 'ab09f723-bf77-55b2-aae2-da5fb708a2b5' and es = 'Llegué tarde al turno.' and en = 'I was late for my appointment.'
  and not (es_alt && array['Llegué tarde a mi turno.']::text[]);

update public.sentences set es_alt = es_alt || array['No puedo ir, tengo un turno con el médico.']::text[], note_en = coalesce(note_en, 'Argentines often say “tengo turno” with no “un”; both ways are fine.')
where id = 'd5d93579-686b-57fb-9991-6a4a11e95241' and es = 'No puedo ir, tengo turno con el médico.' and en = 'I can''t go, I have an appointment with the doctor.'
  and not (es_alt && array['No puedo ir, tengo un turno con el médico.']::text[]);

update public.sentences set es_alt = es_alt || array['Quiero sacar un turno para mañana.']::text[], note_en = coalesce(note_en, 'Argentines often say “sacar turno” with no “un”; both ways are fine.')
where id = '6ec79c97-eedd-522d-8b2b-725da5d8f29c' and es = 'Quiero sacar turno para mañana.' and en = 'I want to make an appointment for tomorrow.'
  and not (es_alt && array['Quiero sacar un turno para mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo un turno con el médico.']::text[], note_en = coalesce(note_en, 'Argentines often say “tengo turno” with no “un”; both ways are fine.')
where id = '37861352-d686-5d14-8f63-a1328accb6e3' and es = 'Tengo turno con el médico.' and en = 'I have an appointment with the doctor.'
  and not (es_alt && array['Tengo un turno con el médico.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar con la mochila? Me duele el brazo.']::text[], note_en = coalesce(note_en, 'Argentines usually ask a favor with the plain present, “¿Me ayudás?”, where English says “Can you…?”.')
where id = '7bc6cc29-4462-5d77-9002-acdfcce59c31' and es = '¿Me ayudás con la mochila? Me duele el brazo.' and en = 'Can you help me with the backpack? My arm hurts.'
  and not (es_alt && array['¿Me podés ayudar con la mochila? Me duele el brazo.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés traer una pastilla y un vaso de agua?']::text[], note_en = coalesce(note_en, 'Argentines usually ask a favor with the plain present, “¿Me traés?”, where English says “Can you…?”.')
where id = 'f60672d9-a6a2-5a1f-a6b9-6f18f63d7e6f' and es = '¿Me traés una pastilla y un vaso de agua?' and en = 'Can you bring me a pill and a glass of water?'
  and not (es_alt && array['¿Me podés traer una pastilla y un vaso de agua?']::text[]);

update public.sentences set es_alt = es_alt || array['Ana, ¿tenés un resfrío?']::text[]
where id = '58fba697-6c67-5b20-b766-062593bf6a7b' and es = 'Ana, ¿estás resfriada?' and en = 'Ana, do you have a cold?'
  and not (es_alt && array['Ana, ¿tenés un resfrío?']::text[]);

update public.sentences set es_alt = es_alt || array['Tiene un resfrío y fiebre.', 'Tiene un resfrío y tiene fiebre.']::text[]
where id = '36ed0ec4-d9aa-5d09-be5a-a62394f22187' and es = 'Está resfriada y tiene fiebre.' and en = 'She has a cold and a fever.'
  and not (es_alt && array['Tiene un resfrío y fiebre.', 'Tiene un resfrío y tiene fiebre.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo un resfrío.']::text[]
where id = '03498826-3ed4-590f-88dc-c2807c2aec36' and es = 'Estoy resfriado.' and en = 'I have a cold.'
  and not (es_alt && array['Tengo un resfrío.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hijo está resfriado, ¿qué remedio puede tomar?']::text[]
where id = 'c650da31-dedf-517f-bb5f-b46014d75e0d' and es = 'Mi hijo tiene un resfrío, ¿qué remedio puede tomar?' and en = 'My son has a cold, what medicine can he take?'
  and not (es_alt && array['Mi hijo está resfriado, ¿qué remedio puede tomar?']::text[]);

update public.sentences set es_alt = es_alt || array['Mica tiene un resfrío.']::text[]
where id = '665dbc85-ba8f-57ba-a1b3-6a29444635a4' and es = 'Mica está resfriada.' and en = 'Mica has a cold.'
  and not (es_alt && array['Mica tiene un resfrío.']::text[]);

update public.sentences set es_alt = es_alt || array['Nico no vino a la facu porque tiene un resfrío.']::text[]
where id = '041bcb09-c1d2-57c0-a1bd-a369889d7200' and es = 'Nico no vino a la facu porque está resfriado.' and en = 'Nico didn''t come to college because he has a cold.'
  and not (es_alt && array['Nico no vino a la facu porque tiene un resfrío.']::text[]);

update public.sentences set es_alt = es_alt || array['Tomá una curita.']::text[]
where id = 'bbb1d0e1-bae1-5522-91f7-791756b6a092' and es = 'Tomá, acá tenés una curita.' and en = 'Here, have a Band-Aid.'
  and not (es_alt && array['Tomá una curita.']::text[]);

update public.sentences set es_alt = es_alt || array['Tomé una pastilla para la cabeza.']::text[]
where id = '3ff100c3-0f6a-5ceb-a345-02f9c04e9c49' and es = 'Tomé una pastilla para el dolor de cabeza.' and en = 'I took a pill for my headache.'
  and not (es_alt && array['Tomé una pastilla para la cabeza.']::text[]);

update public.sentences set es_alt = es_alt || array['Tomé una pastilla para el dolor de cabeza.']::text[], note_en = coalesce(note_en, 'Argentines often say a pill is “para la cabeza”, leaving out “el dolor de”.')
where id = 'ff33c66a-8399-577c-a54c-c92e8daf473c' and es = 'Tomé una pastilla para la cabeza.' and en = 'I took a pill for my headache.'
  and not (es_alt && array['Tomé una pastilla para el dolor de cabeza.']::text[]);

update public.sentences set es_alt = es_alt || array['Solo una curita y listo, no es nada.']::text[]
where id = 'a75f3f12-cc20-5633-82ad-876671e51c34' and es = 'Una curita y listo, no es nada.' and en = 'Just a Band-Aid and you''re good, it''s nothing.'
  and not (es_alt && array['Solo una curita y listo, no es nada.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés una pastilla para el dolor de cabeza?']::text[], note_en = coalesce(note_en, 'Argentines often say a pill is “para la cabeza”, leaving out “el dolor de”.')
where id = 'ae959d5b-135c-534e-8979-8d81a9fbe194' and es = '¿Tenés una pastilla para la cabeza?' and en = 'Do you have a pill for a headache?'
  and not (es_alt && array['¿Tenés una pastilla para el dolor de cabeza?']::text[]);

update public.sentences set es_alt = es_alt || array['Anoche tuve dolor de cabeza.', 'Tuve dolor de cabeza anoche.']::text[]
where id = '912b756d-0321-5817-b049-885a1e397dcc' and es = 'Anoche me dolió la cabeza.' and en = 'I had a headache last night.'
  and not (es_alt && array['Anoche tuve dolor de cabeza.', 'Tuve dolor de cabeza anoche.']::text[]);

update public.sentences set es_alt = es_alt || array['El inglés no es tan difícil como el español.']::text[], note_en = coalesce(note_en, 'Argentines usually call the language “castellano”; “español” is understood and correct too.')
where id = '2bcb4fc4-9215-538d-a75f-af04703350df' and es = 'El inglés no es tan difícil como el castellano.' and en = 'English isn''t as hard as Spanish.'
  and not (es_alt && array['El inglés no es tan difícil como el español.']::text[]);

update public.sentences set es_alt = es_alt || array['Este pueblo es más tranquilo que la ciudad.']::text[], note_en = coalesce(note_en, '“La Capital” is how Argentines refer to the city of Buenos Aires.')
where id = 'c1b63bc4-93db-5371-baed-7f015d14fe77' and es = 'Este pueblo es más tranquilo que la Capital.' and en = 'This town is quieter than the city.'
  and not (es_alt && array['Este pueblo es más tranquilo que la ciudad.']::text[]);

update public.sentences set es_alt = es_alt || array['Tuve un resfrío, pero ya estoy bien.']::text[]
where id = 'a7d40fe2-1329-5408-b8d2-06db4d5a06f1' and es = 'Estuve resfriado, pero ya estoy bien.' and en = 'I had a cold, but I''m fine now.'
  and not (es_alt && array['Tuve un resfrío, pero ya estoy bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana tengo un turno para la rodilla.', 'Tengo un turno para la rodilla mañana.']::text[], note_en = coalesce(note_en, 'Argentines often say “tengo turno” with no “un”; both ways are fine.')
where id = '54214439-70ce-5131-b2cd-b1ef8f8cdc19' and es = 'Mañana tengo turno para la rodilla.' and en = 'I have an appointment for my knee tomorrow.'
  and not (es_alt && array['Mañana tengo un turno para la rodilla.', 'Tengo un turno para la rodilla mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Quise pagar la cuenta, pero Juan ya pagó.', 'Quise pagar yo, pero Juan ya pagó.']::text[], note_en = coalesce(note_en, '“Invitar” can mean to treat someone: “invito yo” is “it''s on me”.')
where id = '120a8bd3-9c85-5e7a-9ec8-cb41b3d03ae2' and es = 'Quise invitar yo, pero Juan ya pagó.' and en = 'I wanted to pay the bill, but Juan already paid.'
  and not (es_alt && array['Quise pagar la cuenta, pero Juan ya pagó.', 'Quise pagar yo, pero Juan ya pagó.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Le podés dar agua al perro?']::text[], note_en = coalesce(note_en, 'Argentines usually ask a favor with the plain present, “¿Le das?”, where English says “Can you…?”.')
where id = '63890de2-d3f7-5741-86cd-5e349887e01d' and es = '¿Le das agua al perro?' and en = 'Can you give the dog water?'
  and not (es_alt && array['¿Le podés dar agua al perro?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés dar más azúcar?']::text[], note_en = coalesce(note_en, 'Argentines usually ask for things with the plain present, “¿Me das?”, where English says “Can you…?”.')
where id = 'e06f069c-0659-578e-b77b-b88447e61ebb' and es = '¿Me das más azúcar?' and en = 'Can you give me more sugar?'
  and not (es_alt && array['¿Me podés dar más azúcar?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés dar un vaso de agua?']::text[], note_en = coalesce(note_en, 'Argentines usually ask for things with the plain present, “¿Me das?”, where English says “Can you…?”.')
where id = 'c1846d34-74a9-5323-93a5-76763a22ba44' and es = '¿Me das un vaso de agua?' and en = 'Can you give me a glass of water?'
  and not (es_alt && array['¿Me podés dar un vaso de agua?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te puedo dar una mano?']::text[], note_en = coalesce(note_en, 'Argentines often offer help with the plain present: “¿Te doy una mano?”.')
where id = 'c99069a3-7fe0-5c4d-b5c2-66b4bae1edd4' and es = '¿Te doy una mano?' and en = 'Can I give you a hand?'
  and not (es_alt && array['¿Te puedo dar una mano?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, ¿me podés buscar en la parada a las ocho?']::text[], note_en = coalesce(note_en, 'Argentines usually ask a favor with the plain present, “¿Me buscás?”, where English says “Can you…?”.')
where id = '5c34cc99-e7a5-5055-b034-a56fddda0bcd' and es = 'Che, ¿me buscás en la parada a las ocho?' and en = 'Hey, can you pick me up at the bus stop at eight?'
  and not (es_alt && array['Che, ¿me podés buscar en la parada a las ocho?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, ¿me podés dar una mano con las sillas?']::text[], note_en = coalesce(note_en, 'Argentines usually ask a favor with the plain present, “¿Me das una mano?”, where English says “Can you…?”.')
where id = 'b1d51755-6db7-580d-85d0-114ec47e7ca5' and es = 'Che, ¿me das una mano con las sillas?' and en = 'Hey, can you give me a hand with the chairs?'
  and not (es_alt && array['Che, ¿me podés dar una mano con las sillas?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, llamame, tengo algo para vos.']::text[], note_en = coalesce(note_en, 'Argentines often hook the reason onto a command with a little “que”: it works like a quick “because”.')
where id = 'f8fef558-bb61-508b-b78e-956a889bb1de' and es = 'Che, llamame que tengo algo para vos.' and en = 'Hey, call me, I''ve got something for you.'
  and not (es_alt && array['Che, llamame, tengo algo para vos.']::text[]);

update public.sentences set es_alt = es_alt || array['Dame la tarjeta, el mozo está esperando.']::text[], note_en = coalesce(note_en, 'Argentines often hook the reason onto a command with a little “que”: it works like a quick “because”.')
where id = 'a66c8b19-c3a0-5ed0-9de3-f1c8ab2ab542' and es = 'Dame la tarjeta, que el mozo está esperando.' and en = 'Give me the card, the waiter is waiting.'
  and not (es_alt && array['Dame la tarjeta, el mozo está esperando.']::text[]);

update public.sentences set es_alt = es_alt || array['Te llamé porque no recibí tu mensaje.']::text[], note_en = coalesce(note_en, 'Argentines often say a message “no me llegó” (it didn''t reach me) instead of “no lo recibí”.')
where id = 'f0d2b243-d761-523a-8802-74a9981e1b3c' and es = 'Te llamé porque no me llegó tu mensaje.' and en = 'I called you because I didn''t get your message.'
  and not (es_alt && array['Te llamé porque no recibí tu mensaje.']::text[]);

update public.sentences set es_alt = es_alt || array['Te mandé la dirección, ¿la recibiste?']::text[], note_en = coalesce(note_en, 'Argentines often ask “¿te llegó?” (did it reach you?) instead of “¿lo recibiste?”.')
where id = 'cfff4eaf-07c3-5bd6-96bd-636c12e7e150' and es = 'Te mandé la dirección, ¿te llegó?' and en = 'I sent you the address, did you get it?'
  and not (es_alt && array['Te mandé la dirección, ¿la recibiste?']::text[]);

update public.sentences set es_alt = es_alt || array['Lo llamé al médico y me dio un turno para mañana.', 'Llamé al médico y me dio un turno para mañana.']::text[], note_en = coalesce(note_en, 'Argentines often say “dar turno” with no “un”; both ways are fine.')
where id = 'b634a300-ed0c-5b2c-9bf7-a663ff9a61b6' and es = 'Lo llamé al médico y me dio turno para mañana.' and en = 'I called the doctor and he gave me an appointment for tomorrow.'
  and not (es_alt && array['Lo llamé al médico y me dio un turno para mañana.', 'Llamé al médico y me dio un turno para mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana buscame temprano, tengo examen.', 'Buscame mañana temprano, tengo examen.']::text[], note_en = coalesce(note_en, 'Argentines often hook the reason onto a command with a little “que”: it works like a quick “because”.')
where id = 'a248c6ab-c7fb-52c2-b47d-467c783acc6d' and es = 'Mañana buscame temprano, que tengo examen.' and en = 'Pick me up early tomorrow, I have an exam.'
  and not (es_alt && array['Mañana buscame temprano, tengo examen.', 'Buscame mañana temprano, tengo examen.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me explicás cómo sacar un turno?']::text[], note_en = coalesce(note_en, 'Argentines usually ask a favor with the plain present, “¿Me explicás?”, where English says “Can you…?”.')
where id = '40d82a3d-45e8-5ce4-9cc7-9b9641f50c47' and es = '¿Me explicás cómo sacar turno?' and en = 'Can you explain to me how to make an appointment?'
  and not (es_alt && array['¿Me explicás cómo sacar un turno?']::text[]);

update public.sentences set es_alt = es_alt || array['Explicame bien, porque no entendí nada.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often use a short “que” in place of “porque”.')
where id = '5ca00f3d-e707-5e3b-8794-e627e707926d' and es = 'Explicame bien, que no entendí nada.' and en = 'Explain it properly, because I didn''t understand anything.'
  and not (es_alt && array['Explicame bien, porque no entendí nada.']::text[]);

update public.sentences set es_alt = es_alt || array['Ni idea, pero creo que es mañana.']::text[], note_en = coalesce(note_en, '“Para mí que…” is a very common, casual way to say “I think…” or “I reckon…”.')
where id = '61d42893-fa9f-5667-b3bd-6f4d58e5c79f' and es = 'Ni idea, pero para mí que es mañana.' and en = 'No idea, but I think it''s tomorrow.'
  and not (es_alt && array['Ni idea, pero creo que es mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['No entendí tu mensaje, ¿me podés llamar?']::text[], note_en = coalesce(note_en, 'Argentines usually ask a favor with the plain present, “¿Me llamás?”, where English says “Can you…?”.')
where id = 'd571540d-ed86-51cb-bcf8-1d371dbc7b0e' and es = 'No entendí tu mensaje, ¿me llamás?' and en = 'I didn''t understand your message, can you call me?'
  and not (es_alt && array['No entendí tu mensaje, ¿me podés llamar?']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo ni idea.']::text[]
where id = '194c10d2-dbfe-5756-b940-015f649f0bff' and es = 'No tengo idea.' and en = 'I have no idea.'
  and not (es_alt && array['No tengo ni idea.']::text[]);

update public.sentences set es_alt = es_alt || array['Tranqui, sabemos cómo llegar.']::text[], note_en = coalesce(note_en, '“Saber” + verb already means “know how to”, so the “cómo” is optional here.')
where id = '866b3534-947d-560a-b345-55cfc94bc786' and es = 'Tranqui, sabemos llegar.' and en = 'Relax, we know how to get there.'
  and not (es_alt && array['Tranqui, sabemos cómo llegar.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Lavás los platos hoy?', '¿Hoy lavás los platos?']::text[], note_en = coalesce(note_en, 'At home, Argentines often say just “lavar” for doing the dishes: everyone knows what''s being washed.')
where id = '6c01b9f1-d88d-5657-bcf5-3ca6018a1bd6' and es = '¿Vos lavás hoy?' and en = 'Are you doing the dishes today?'
  and not (es_alt && array['¿Lavás los platos hoy?', '¿Hoy lavás los platos?']::text[]);

update public.sentences set es_alt = es_alt || array['Dale, yo lavo los platos, pero mañana te toca a vos.', 'Dale, lavo los platos yo, pero mañana te toca a vos.', 'Dale, lavo los platos, pero mañana te toca a vos.']::text[], note_en = coalesce(note_en, 'At home, Argentines often say just “lavar” for doing the dishes: everyone knows what''s being washed.')
where id = '31983064-8eed-5b4c-ac29-122eca2741db' and es = 'Dale, lavo yo, pero mañana te toca a vos.' and en = 'OK, I''ll do the dishes, but tomorrow it''s your turn.'
  and not (es_alt && array['Dale, yo lavo los platos, pero mañana te toca a vos.', 'Dale, lavo los platos yo, pero mañana te toca a vos.', 'Dale, lavo los platos, pero mañana te toca a vos.']::text[]);

update public.sentences set es_alt = es_alt || array['Después del asado tenemos que lavar muchos platos.', 'Tenemos que lavar muchos platos después del asado.']::text[], note_en = coalesce(note_en, 'Argentines often use the impersonal “hay que” for “we have to”: the job needs doing, without pointing at anyone.')
where id = 'c8bf0a9b-25a3-5ff5-a8d3-df682aaa2382' and es = 'Después del asado hay que lavar muchos platos.' and en = 'After the asado we have to wash a lot of dishes.'
  and not (es_alt && array['Después del asado tenemos que lavar muchos platos.', 'Tenemos que lavar muchos platos después del asado.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenemos que lavar la ropa blanca.']::text[], note_en = coalesce(note_en, 'Argentines often use the impersonal “hay que” for “we need to”: the job needs doing, without pointing at anyone.')
where id = 'be7cd177-3b7d-5cef-a522-e414d4175c72' and es = 'Hay que lavar la ropa blanca.' and en = 'We need to wash the white clothes.'
  and not (es_alt && array['Tenemos que lavar la ropa blanca.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenemos que sacar al perro.']::text[], note_en = coalesce(note_en, 'Argentines often use the impersonal “hay que” for “we need to”: the job needs doing, without pointing at anyone.')
where id = '5258648b-c819-5ff3-9487-c3d19e01ea8a' and es = 'Hay que sacar al perro.' and en = 'We need to take the dog out.'
  and not (es_alt && array['Tenemos que sacar al perro.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenemos que limpiar la heladera.']::text[], note_en = coalesce(note_en, 'Argentines often use the impersonal “hay que” for “we need to”: the job needs doing, without pointing at anyone.')
where id = '74b66e7d-e7e9-50c4-a3ce-0e92508ec41c' and es = 'Hay que limpiar la heladera.' and en = 'We need to clean the fridge.'
  and not (es_alt && array['Tenemos que limpiar la heladera.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenemos que ordenar el living.']::text[], note_en = coalesce(note_en, 'Argentines often use the impersonal “hay que” for “we need to”: the job needs doing, without pointing at anyone.')
where id = '8bece1fd-5650-5df1-90a6-6283bca3acd3' and es = 'Hay que ordenar el living.' and en = 'We need to tidy the living room.'
  and not (es_alt && array['Tenemos que ordenar el living.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana viene mi abuela, tenemos que limpiar la casa.', 'Viene mi abuela mañana, tenemos que limpiar la casa.']::text[], note_en = coalesce(note_en, 'Argentines often use the impersonal “hay que” for “we have to”: the job needs doing, without pointing at anyone.')
where id = '7d08acf5-9613-57db-9cee-4aab15f4821b' and es = 'Mañana viene mi abuela, hay que limpiar la casa.' and en = 'My grandmother is coming tomorrow, we have to clean the house.'
  and not (es_alt && array['Mañana viene mi abuela, tenemos que limpiar la casa.', 'Viene mi abuela mañana, tenemos que limpiar la casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Vos limpiás el baño y yo limpio la cocina.']::text[], note_en = coalesce(note_en, 'Spanish happily skips a repeated verb: “y yo la cocina” already means “and I''ll clean the kitchen”.')
where id = '175aba6d-b9f1-544e-aa47-3b71bd42fac3' and es = 'Vos limpiás el baño y yo la cocina.' and en = 'You clean the bathroom and I''ll clean the kitchen.'
  and not (es_alt && array['Vos limpiás el baño y yo limpio la cocina.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tuviste que laburar el domingo?', '¿Tuviste que trabajar el domingo?']::text[], note_en = coalesce(note_en, '“Te tocó” means it fell to you, like a shift or a chore you didn''t choose. Argentines use it a lot for work and turns.')
where id = '9620380d-438e-58a7-99a7-859588954153' and es = '¿Te tocó laburar el domingo?' and en = 'Did you have to work on Sunday?'
  and not (es_alt && array['¿Tuviste que laburar el domingo?', '¿Tuviste que trabajar el domingo?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Y quién lavó los vasos?']::text[], note_en = coalesce(note_en, 'In conversation Argentines often name the topic first (“¿Y los vasos...?”) and then ask about it.')
where id = '2428dcb9-b316-5642-a391-c202c68a4436' and es = '¿Y los vasos, quién los lavó?' and en = 'And who washed the glasses?'
  and not (es_alt && array['¿Y quién lavó los vasos?']::text[]);

update public.sentences set es_alt = es_alt || array['No hay agua, ¿entonces cómo lavaste los platos?', 'No hay agua, ¿y cómo lavaste los platos?']::text[]
where id = '5b058e0d-3678-5e7d-888c-7a06809d66ce' and es = 'No hay agua, ¿cómo lavaste los platos?' and en = 'There''s no water, so how did you do the dishes?'
  and not (es_alt && array['No hay agua, ¿entonces cómo lavaste los platos?', 'No hay agua, ¿y cómo lavaste los platos?']::text[]);

update public.sentences set es_alt = es_alt || array['Ordené mi pieza y ahora no encuentro nada.']::text[], note_en = coalesce(note_en, 'Spanish often says “la” where English says “my” when it''s obvious whose it is.')
where id = '1be93724-254b-537e-b3ff-d3be0c63197a' and es = 'Ordené la pieza y ahora no encuentro nada.' and en = 'I tidied my room and now I can''t find anything.'
  and not (es_alt && array['Ordené mi pieza y ahora no encuentro nada.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar a barrer?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿Me ayudás?” already sounds like “Can you help me?”.')
where id = '5ac55549-8c3b-5eb7-acad-389e8abce9ca' and es = '¿Me ayudás a barrer?' and en = 'Can you help me sweep?'
  and not (es_alt && array['¿Me podés ayudar a barrer?']::text[]);

update public.sentences set es_alt = es_alt || array['Tenemos que barrer la vereda.']::text[], note_en = coalesce(note_en, 'Argentines often use the impersonal “hay que” for “we have to”: the job needs doing, without pointing at anyone.')
where id = '8d9ca741-7fd7-5aea-829e-e5e53b99f965' and es = 'Hay que barrer la vereda.' and en = 'We have to sweep the sidewalk.'
  and not (es_alt && array['Tenemos que barrer la vereda.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cómo llego al aeropuerto?']::text[]
where id = '692d7c59-6153-5bb8-b7df-7e0c46902cde' and es = '¿Cómo voy al aeropuerto?' and en = 'How do I get to the airport?'
  and not (es_alt && array['¿Cómo llego al aeropuerto?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Con quién fuiste?']::text[], note_en = coalesce(note_en, 'For trips, Argentines often say “irse” (me fui, te fuiste): it adds the feeling of going away.')
where id = '910275d5-6f6c-54cd-ba0f-15a19ab9ec71' and es = '¿Con quién te fuiste?' and en = 'Who did you go with?'
  and not (es_alt && array['¿Con quién fuiste?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Hiciste tu valija?']::text[], note_en = coalesce(note_en, 'Spanish often says “la” where English says “your” when it''s obvious whose it is.')
where id = 'd5e9a871-911b-5c6b-81c8-79b136db099b' and es = '¿Hiciste la valija?' and en = 'Did you pack your suitcase?'
  and not (es_alt && array['¿Hiciste tu valija?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés buscar en el aeropuerto?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿Me buscás?” already sounds like “Can you pick me up?”.')
where id = '4bf23e21-ef99-5b6d-930b-1a2e9b289a36' and es = '¿Me buscás en el aeropuerto?' and en = 'Can you pick me up at the airport?'
  and not (es_alt && array['¿Me podés buscar en el aeropuerto?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Fuiste a Mar del Plata con este frío?', '¿Con este frío fuiste a Mar del Plata?']::text[], note_en = coalesce(note_en, 'For trips, Argentines often say “irse” (me fui, te fuiste): it adds the feeling of going away.')
where id = '55f1c808-678a-5c11-b025-39c6c1f69538' and es = '¿Te fuiste a Mar del Plata con este frío?' and en = 'You went to Mar del Plata in this cold?'
  and not (es_alt && array['¿Fuiste a Mar del Plata con este frío?', '¿Con este frío fuiste a Mar del Plata?']::text[]);

update public.sentences set es_alt = es_alt || array['En julio fui a Bariloche con mis viejos.', 'Fui a Bariloche con mis viejos en julio.']::text[], note_en = coalesce(note_en, 'For trips, Argentines often say “irse” (me fui, te fuiste): it adds the feeling of going away.')
where id = '9a1a21fb-3db3-54ba-bc81-4bd252a74501' and es = 'En julio me fui a Bariloche con mis viejos.' and en = 'In July I went to Bariloche with my parents.'
  and not (es_alt && array['En julio fui a Bariloche con mis viejos.', 'Fui a Bariloche con mis viejos en julio.']::text[]);

update public.sentences set es_alt = es_alt || array['Fui sin valija, con una mochila chica.']::text[], note_en = coalesce(note_en, 'For trips, Argentines often say “irse” (me fui, te fuiste): it adds the feeling of going away.')
where id = '46718cae-98a2-55d2-b45d-3b5b81970f76' and es = 'Me fui sin valija, con una mochila chica.' and en = 'I went without a suitcase, with a small backpack.'
  and not (es_alt && array['Fui sin valija, con una mochila chica.']::text[]);

update public.sentences set es_alt = es_alt || array['Fui una semana a Mendoza.', 'Fui a Mendoza una semana.']::text[], note_en = coalesce(note_en, 'For trips, Argentines often say “irse” (me fui, te fuiste): it adds the feeling of going away.')
where id = '6e92c0ac-9118-509e-b79c-72b9a2be8fe8' and es = 'Me fui una semana a Mendoza.' and en = 'I went to Mendoza for a week.'
  and not (es_alt && array['Fui una semana a Mendoza.', 'Fui a Mendoza una semana.']::text[]);

update public.sentences set es_alt = es_alt || array['Todavía no hice mi valija.']::text[], note_en = coalesce(note_en, 'Spanish often says “la” where English says “my” when it''s obvious whose it is.')
where id = 'd31cc215-16e0-5c9a-ae59-87e734fc25be' and es = 'Todavía no hice la valija.' and en = 'I still haven''t packed my suitcase.'
  and not (es_alt && array['Todavía no hice mi valija.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me buscás en la terminal?', '¿Me pasás a buscar en la terminal?']::text[], note_en = coalesce(note_en, '“Pasar a buscar” is the everyday Argentine way to say you''ll swing by and pick someone up.')
where id = '691223ce-3bac-5173-b9c4-cd4ad043606e' and es = '¿Me pasás a buscar por la terminal?' and en = 'Will you pick me up at the bus station?'
  and not (es_alt && array['¿Me buscás en la terminal?', '¿Me pasás a buscar en la terminal?']::text[]);

update public.sentences set es_alt = es_alt || array['Nico y yo alquilamos un depto lindísimo en Bariloche.']::text[], note_en = coalesce(note_en, 'Argentines often say “Con Nico alquilamos...” to mean “Nico and I”: the “we” in the verb already includes the speaker.')
where id = '8eff741c-afc0-5eca-96b3-458757548364' and es = 'Con Nico alquilamos un depto lindísimo en Bariloche.' and en = 'Nico and I rented a gorgeous apartment in Bariloche.'
  and not (es_alt && array['Nico y yo alquilamos un depto lindísimo en Bariloche.']::text[]);

update public.sentences set es_alt = es_alt || array['Mis viejos fueron al río y yo fui a la playa.']::text[], note_en = coalesce(note_en, 'Spanish happily skips a repeated verb: “y yo a la playa” already means “and I went to the beach”.')
where id = '60e8991b-fbdc-571d-bd4d-0d32566e48d6' and es = 'Mis viejos fueron al río y yo a la playa.' and en = 'My parents went to the river and I went to the beach.'
  and not (es_alt && array['Mis viejos fueron al río y yo fui a la playa.']::text[]);

update public.sentences set es_alt = es_alt || array['Si te metés al mar, dejame tu celu.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “your” when it''s obvious whose it is.')
where id = '479c3480-2b0c-5632-89ae-339128c02bc0' and es = 'Si te metés al mar, dejame el celu.' and en = 'If you go in the sea, leave your phone with me.'
  and not (es_alt && array['Si te metés al mar, dejame tu celu.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Estuviste en las sierras de Córdoba?', '¿Fuiste a las sierras de Córdoba?']::text[], note_en = coalesce(note_en, 'Argentines use “conocer” for places: “¿Conocés Córdoba?” means “Have you been to Córdoba?”.')
where id = '42ec0b5a-173e-5991-8dd5-0dfd28c020b9' and es = '¿Conocés las sierras de Córdoba?' and en = 'Have you been to the hills in Córdoba?'
  and not (es_alt && array['¿Estuviste en las sierras de Córdoba?', '¿Fuiste a las sierras de Córdoba?']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Recibiste la foto? —Sí, la recibí.']::text[], note_en = coalesce(note_en, 'For messages and photos, Argentines usually say “me llegó” (it reached me) rather than “I received it”.')
where id = '502edbda-9b25-5fd4-8332-cba703472237' and es = '—¿Te llegó la foto? —Sí, me llegó.' and en = '—Did you get the photo? —Yes, I got it.'
  and not (es_alt && array['—¿Recibiste la foto? —Sí, la recibí.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Alquilamos un auto o tomamos el micro?', '¿Alquilamos un auto o tomamos un micro?']::text[]
where id = '7e62aa15-c374-55cf-a566-75bd768d3b10' and es = '¿Alquilamos un auto o vamos en micro?' and en = 'Should we rent a car or take the bus?'
  and not (es_alt && array['¿Alquilamos un auto o tomamos el micro?', '¿Alquilamos un auto o tomamos un micro?']::text[]);

update public.sentences set es_alt = es_alt || array['¿No lo recibiste? Te lo mandé anoche.']::text[], note_en = coalesce(note_en, 'For messages and photos, Argentines usually say “me llegó” (it reached me) rather than “I received it”.')
where id = 'dd7b997b-16ec-5da3-a19f-cee8a652db73' and es = '¿No te llegó? Te lo mandé anoche.' and en = 'Didn''t you get it? I sent it to you last night.'
  and not (es_alt && array['¿No lo recibiste? Te lo mandé anoche.']::text[]);

update public.sentences set es_alt = es_alt || array['Busqué mi pasaporte una hora y está en la valija.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my” when it''s obvious whose it is.')
where id = '28a67d44-b179-5010-bdc3-4dd6cb03cc5d' and es = 'Busqué el pasaporte una hora y está en la valija.' and en = 'I looked for my passport for an hour and it''s in the suitcase.'
  and not (es_alt && array['Busqué mi pasaporte una hora y está en la valija.']::text[]);

update public.sentences set es_alt = es_alt || array['Mica y yo nadamos los sábados.', 'Los sábados Mica y yo nadamos.']::text[], note_en = coalesce(note_en, 'Argentines often say “Con Mica nadamos...” to mean “Mica and I”: the “we” in the verb already includes the speaker.')
where id = '1d1e6303-c58e-537d-b9f8-609ba5407593' and es = 'Con Mica nadamos los sábados.' and en = 'Mica and I swim on Saturdays.'
  and not (es_alt && array['Mica y yo nadamos los sábados.', 'Los sábados Mica y yo nadamos.']::text[]);

update public.sentences set es_alt = es_alt || array['Pablo y yo alquilamos un depto.']::text[], note_en = coalesce(note_en, 'Argentines often say “Con Pablo alquilamos...” to mean “Pablo and I”: the “we” in the verb already includes the speaker.')
where id = '728fabe4-ddcc-55f5-999c-f64c1095435a' and es = 'Con Pablo alquilamos un depto.' and en = 'Pablo and I rented an apartment.'
  and not (es_alt && array['Pablo y yo alquilamos un depto.']::text[]);

update public.sentences set es_alt = es_alt || array['Rocío y yo fuimos a Bariloche en julio.', 'En julio Rocío y yo fuimos a Bariloche.']::text[], note_en = coalesce(note_en, 'Argentines often say “Con Rocío fuimos...” to mean “Rocío and I”: the “we” in the verb already includes the speaker.')
where id = '50b0ba8e-e007-5218-866a-17ae7d75ba62' and es = 'Con Rocío fuimos a Bariloche en julio.' and en = 'Rocío and I went to Bariloche in July.'
  and not (es_alt && array['Rocío y yo fuimos a Bariloche en julio.', 'En julio Rocío y yo fuimos a Bariloche.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi papá y yo fuimos al partido.']::text[], note_en = coalesce(note_en, 'Argentines often say “fuimos con mi papá” to mean “my dad and I went”: the “we” already includes the speaker.')
where id = '2b7edbd2-bd07-57aa-9089-9c4de871deed' and es = 'Fuimos al partido con mi papá.' and en = 'My dad and I went to the game.'
  and not (es_alt && array['Mi papá y yo fuimos al partido.']::text[]);

update public.sentences set es_alt = es_alt || array['Tomamos el micro a Mendoza.']::text[]
where id = '5560f907-b8d0-5f3b-a18e-5941ecb17f40' and es = 'Fuimos en micro a Mendoza.' and en = 'We took the bus to Mendoza.'
  and not (es_alt && array['Tomamos el micro a Mendoza.']::text[]);

update public.sentences set es_alt = es_alt || array['Lavé mi mochila, pero todavía está sucia.']::text[], note_en = coalesce(note_en, 'Spanish often uses “la” where English says “my”, when it is obvious whose thing it is.')
where id = 'a8f1e2cb-9222-56c0-b2fe-7d6c680c4a17' and es = 'Lavé la mochila, pero todavía está sucia.' and en = 'I washed my backpack, but it''s still dirty.'
  and not (es_alt && array['Lavé mi mochila, pero todavía está sucia.']::text[]);

update public.sentences set es_alt = es_alt || array['Llovió el sábado, así que la fiesta fue adentro.', 'El sábado llovió, así que la fiesta fue adentro.']::text[]
where id = 'd2ba3c63-c871-513e-9b0c-54a30134da82' and es = 'Llovió el sábado y la fiesta fue adentro.' and en = 'It rained on Saturday, so the party was inside.'
  and not (es_alt && array['Llovió el sábado, así que la fiesta fue adentro.', 'El sábado llovió, así que la fiesta fue adentro.']::text[]);

update public.sentences set es_alt = es_alt || array['Recibí un mensaje de Sofi.']::text[], note_en = coalesce(note_en, 'For messages and mail, Argentines very often say “me llegó” (it reached me) instead of “recibí”.')
where id = 'c76bfa2a-e879-5b03-9e1a-afb5d1df0e43' and es = 'Me llegó un mensaje de Sofi.' and en = 'I got a message from Sofi.'
  and not (es_alt && array['Recibí un mensaje de Sofi.']::text[]);

update public.sentences set es_alt = es_alt || array['No recibí tu mail.']::text[], note_en = coalesce(note_en, 'For messages and mail, Argentines very often say “me llegó” (it reached me) instead of “recibí”.')
where id = '7f9fed7d-5a1f-58d9-87d2-4cc0aa17a262' and es = 'No me llegó tu mail.' and en = 'I didn''t get your email.'
  and not (es_alt && array['No recibí tu mail.']::text[]);

update public.sentences set es_alt = es_alt || array['Perdí mi celu y lo busqué en el bondi.']::text[], note_en = coalesce(note_en, 'Spanish often uses “el” where English says “my”, when it is obvious whose thing it is.')
where id = '0c914d81-e68f-5d4f-8d83-18c2673fe2e8' and es = 'Perdí el celu y lo busqué en el bondi.' and en = 'I lost my phone and looked for it on the bus.'
  and not (es_alt && array['Perdí mi celu y lo busqué en el bondi.']::text[]);

update public.sentences set es_alt = es_alt || array['Te mandé los pasajes, ¿recibiste el mail?']::text[], note_en = coalesce(note_en, 'For messages and mail, Argentines very often say “te llegó” (did it reach you) instead of “recibiste”.')
where id = '6ab260d9-21d1-5e6d-8d37-471fe4355bcb' and es = 'Te mandé los pasajes, ¿te llegó el mail?' and en = 'I sent you the tickets, did you get the email?'
  and not (es_alt && array['Te mandé los pasajes, ¿recibiste el mail?']::text[]);

update public.sentences set es_alt = es_alt || array['Todavía no recibí el audio que mandaste.', 'No recibí todavía el audio que mandaste.']::text[], note_en = coalesce(note_en, 'For messages and mail, Argentines very often say “me llegó” (it reached me) instead of “recibí”.')
where id = '07914da2-3a8b-5c64-ab57-3f2005a9d807' and es = 'Todavía no me llegó el audio que mandaste.' and en = 'I still haven''t gotten the voice message you sent.'
  and not (es_alt && array['Todavía no recibí el audio que mandaste.', 'No recibí todavía el audio que mandaste.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Y qué te pasó en el viaje?']::text[], note_en = coalesce(note_en, 'The “a vos” adds emphasis, like “and what about YOU?”. The sentence is complete without it.')
where id = '7aa64cbe-3892-592f-aa54-bffd8f647298' and es = '¿Y a vos qué te pasó en el viaje?' and en = 'And what happened to you on the trip?'
  and not (es_alt && array['¿Y qué te pasó en el viaje?']::text[]);

update public.sentences set es_alt = es_alt || array['Me contó una vecina.', 'Una vecina me contó.']::text[]
where id = '603f93b0-6999-5add-b69b-da3163f31ad8' and es = 'Me lo contó una vecina.' and en = 'A neighbor told me.'
  and not (es_alt && array['Me contó una vecina.', 'Una vecina me contó.']::text[]);

update public.sentences set es_alt = es_alt || array['Perdí mi celu en la playa, así que volví.']::text[], note_en = coalesce(note_en, 'Spanish often uses “el” where English says “my”, when it is obvious whose thing it is.')
where id = '87be6032-048a-5b54-a794-fc9162ecb4f8' and es = 'Perdí el celu en la playa, así que volví.' and en = 'I lost my phone at the beach, so I went back.'
  and not (es_alt && array['Perdí mi celu en la playa, así que volví.']::text[]);

update public.sentences set es_alt = es_alt || array['—Perdí mi vuelo. —No te puedo creer, ¿y qué hiciste?']::text[], note_en = coalesce(note_en, '“¡No te puedo creer!” is the classic Argentine reaction to surprising news. “No lo puedo creer” means the same.')
where id = '5c1b0938-dbc2-5bb8-8568-f8414c6c6e16' and es = '—Perdí el vuelo. —No te puedo creer, ¿y qué hiciste?' and en = '—I missed my flight. —I can''t believe it, and what did you do?'
  and not (es_alt && array['—Perdí mi vuelo. —No te puedo creer, ¿y qué hiciste?']::text[]);

update public.sentences set es_alt = es_alt || array['¡Menos mal que estás acá!']::text[], note_en = coalesce(note_en, 'When someone shows up, Argentines usually say “llegaste” (you arrived) where English says “you''re here”.')
where id = '8c0df7e1-f19f-54c5-9b57-ce6c1e86541a' and es = '¡Menos mal que llegaste!' and en = 'Thank goodness you''re here!'
  and not (es_alt && array['¡Menos mal que estás acá!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Por fin estás acá!']::text[], note_en = coalesce(note_en, 'When someone shows up, Argentines usually say “llegaste” (you arrived) where English says “you''re here”.')
where id = 'e715b5af-5f15-58a5-b663-821d6b15081d' and es = '¡Por fin llegaste!' and en = 'You''re finally here!'
  and not (es_alt && array['¡Por fin estás acá!']::text[]);

update public.sentences set es_alt = es_alt || array['Perdí mis llaves en el bar, pero el mozo las vio, menos mal.']::text[], note_en = coalesce(note_en, 'Spanish often uses “las” where English says “my”, when it is obvious whose thing it is.')
where id = '795cc930-907c-5965-a580-75561cb89254' and es = 'Perdí las llaves en el bar, pero el mozo las vio, menos mal.' and en = 'I lost my keys in the bar, but the waiter saw them, thank goodness.'
  and not (es_alt && array['Perdí mis llaves en el bar, pero el mozo las vio, menos mal.']::text[]);

update public.sentences set es_alt = es_alt || array['Uy, perdón, llego tarde.']::text[], note_en = coalesce(note_en, 'Once you have walked in, Spanish says “llegué tarde” (I arrived late) where English says “I''m late”.')
where id = '3ba29241-61a1-57da-af07-c46224560c69' and es = 'Uy, perdón, llegué tarde.' and en = 'Oh no, sorry, I''m late.'
  and not (es_alt && array['Uy, perdón, llego tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Estuve dos horas en la guardia, ¡qué garrón!']::text[], note_en = coalesce(note_en, '“¡Un garrón!” and “¡Qué garrón!” are both everyday ways to say something was a real pain.')
where id = '9b02cd01-c624-5545-80d2-5c6b7e31637b' and es = 'Estuve dos horas en la guardia, ¡un garrón!' and en = 'I was in the ER for two hours, how annoying!'
  and not (es_alt && array['Estuve dos horas en la guardia, ¡qué garrón!']::text[]);

update public.sentences set es_alt = es_alt || array['Mis hermanos y yo nos reímos de todo.']::text[], note_en = coalesce(note_en, 'Argentines often say “con mis hermanos nos reímos” to mean “my siblings and I laugh”: the “we” already includes the speaker.')
where id = '3473a276-0b15-57da-a8dc-8a47f07e9f6f' and es = 'Con mis hermanos nos reímos de todo.' and en = 'My siblings and I laugh at everything.'
  and not (es_alt && array['Mis hermanos y yo nos reímos de todo.']::text[]);

update public.sentences set es_alt = es_alt || array['¿A qué escuela ibas?']::text[]
where id = '90553cd9-727c-58d7-ba2b-56a43b74c0f5' and es = '¿A qué colegio ibas?' and en = 'What school did you go to?'
  and not (es_alt && array['¿A qué escuela ibas?']::text[]);

update public.sentences set es_alt = es_alt || array['¿A qué colegio ibas?']::text[]
where id = 'f2ce2670-9b0b-560e-b7dc-5364f4b16bdf' and es = '¿A qué escuela ibas?' and en = 'What school did you go to?'
  and not (es_alt && array['¿A qué colegio ibas?']::text[]);

update public.sentences set es_alt = es_alt || array['Martín y yo éramos compañeros en el colegio.', 'En el colegio, Martín y yo éramos compañeros.']::text[], note_en = coalesce(note_en, 'Argentines often say “con Martín éramos” to mean “Martín and I were”: the “we” already includes the speaker.')
where id = 'b4e4aa1b-3ed6-5415-b925-b0c27e3bafa3' and es = 'Con Martín éramos compañeros en el colegio.' and en = 'Martín and I were classmates at school.'
  and not (es_alt && array['Martín y yo éramos compañeros en el colegio.', 'En el colegio, Martín y yo éramos compañeros.']::text[]);

update public.sentences set es_alt = es_alt || array['Los domingos íbamos a la casa de mis abuelos.', 'Íbamos a la casa de mis abuelos los domingos.']::text[], note_en = coalesce(note_en, '“Lo de” plus a person means their place: “lo de mis abuelos” is my grandparents'' house.')
where id = 'c49d4e78-c290-5325-a53f-086f980b5d25' and es = 'Los domingos íbamos a lo de mis abuelos.' and en = 'On Sundays we used to go to my grandparents'' place.'
  and not (es_alt && array['Los domingos íbamos a la casa de mis abuelos.', 'Íbamos a la casa de mis abuelos los domingos.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde fuiste a la primaria?']::text[], note_en = coalesce(note_en, 'In Argentina you “do” a school stage: “hacer la primaria”, “hacer la secundaria”.')
where id = '65e6bcf5-a888-5b9b-952f-79f7ba33bf9a' and es = '¿Dónde hiciste la primaria?' and en = 'Where did you go to elementary school?'
  and not (es_alt && array['¿Dónde fuiste a la primaria?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Por qué no querías hacer tu tarea?']::text[], note_en = coalesce(note_en, 'Spanish often uses “la” where English says “your”, when it is obvious whose thing it is.')
where id = 'e8232499-9e39-5af9-bb72-4657c1b15513' and es = '¿Por qué no querías hacer la tarea?' and en = 'Why didn''t you want to do your homework?'
  and not (es_alt && array['¿Por qué no querías hacer tu tarea?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tu maestra era de Buenos Aires?']::text[], note_en = coalesce(note_en, 'A “porteño” or “porteña” is someone from the city of Buenos Aires.')
where id = 'ab2e4bbd-4750-50f3-b318-9a0a634031e3' and es = '¿Tu maestra era porteña?' and en = 'Was your teacher from Buenos Aires?'
  and not (es_alt && array['¿Tu maestra era de Buenos Aires?']::text[]);

update public.sentences set es_alt = es_alt || array['Hola, quería una docena de empanadas.']::text[], note_en = coalesce(note_en, '“Buenas” is a casual hello that works at any time of day, very common when you walk into a shop.')
where id = 'e4828615-90e4-57f9-a615-5eab400dc8f5' and es = 'Buenas, quería una docena de empanadas.' and en = 'Hi, I''d like a dozen empanadas.'
  and not (es_alt && array['Hola, quería una docena de empanadas.']::text[]);

update public.sentences set es_alt = es_alt || array['Cami y yo somos amigas desde la primaria.', 'Cami y yo somos amigos desde la primaria.']::text[], note_en = coalesce(note_en, 'Argentines often say “con Cami somos” to mean “Cami and I are”: the “we” already includes the speaker.')
where id = 'd6fb8e43-8b6d-57f7-a99a-728f444b79fa' and es = 'Con Cami somos amigas desde la primaria.' and en = 'Cami and I have been friends since elementary school.'
  and not (es_alt && array['Cami y yo somos amigas desde la primaria.', 'Cami y yo somos amigos desde la primaria.']::text[]);

update public.sentences set es_alt = es_alt || array['Sin mi guardapolvo no podía ir a la escuela.', 'Sin el guardapolvo no podía ir a la escuela.']::text[], note_en = coalesce(note_en, 'Spanish often leaves out “my” when it is obvious whose thing it is.')
where id = '29a7c443-51f4-5461-b6ec-46a7bb8bb4e6' and es = 'Sin guardapolvo no podía ir a la escuela.' and en = 'Without my smock I couldn''t go to school.'
  and not (es_alt && array['Sin mi guardapolvo no podía ir a la escuela.', 'Sin el guardapolvo no podía ir a la escuela.']::text[]);

update public.sentences set es_alt = es_alt || array['Mis compañeros y yo teníamos un equipo de fútbol.']::text[], note_en = coalesce(note_en, 'Argentines often say “con mis compañeros teníamos” to mean “my classmates and I had”: the “we” already includes the speaker.')
where id = '62682f32-e096-5395-bc8c-1bc7bb2d7764' and es = 'Con mis compañeros teníamos un equipo de fútbol.' and en = 'My classmates and I had a soccer team.'
  and not (es_alt && array['Mis compañeros y yo teníamos un equipo de fútbol.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando iba a la secundaria, vivíamos en Córdoba.']::text[]
where id = 'c5dafa95-db7b-5fd6-8576-b88a908d458e' and es = 'En la secundaria vivíamos en Córdoba.' and en = 'When I was in high school, we lived in Córdoba.'
  and not (es_alt && array['Cuando iba a la secundaria, vivíamos en Córdoba.']::text[]);

update public.sentences set es_alt = es_alt || array['Vivían a dos cuadras de nuestra casa.']::text[], note_en = coalesce(note_en, '“Casa” with no article means the speaker''s own home: “de casa” is “from my/our house”.')
where id = 'd72bba5a-48dd-506f-8117-18111476e463' and es = 'Vivían a dos cuadras de casa.' and en = 'They lived two blocks from our house.'
  and not (es_alt && array['Vivían a dos cuadras de nuestra casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuela y yo tomábamos el té cada domingo.', 'Cada domingo mi abuela y yo tomábamos el té.']::text[], note_en = coalesce(note_en, 'Argentines often say “con mi abuela tomábamos” to mean “my grandma and I had”: the “we” already includes the speaker.')
where id = '159bc678-3103-53ac-b97d-a79a48460db3' and es = 'Con mi abuela tomábamos el té cada domingo.' and en = 'My grandma and I had tea every Sunday.'
  and not (es_alt && array['Mi abuela y yo tomábamos el té cada domingo.', 'Cada domingo mi abuela y yo tomábamos el té.']::text[]);

update public.sentences set es_alt = es_alt || array['Mis compañeros de la facu y yo salíamos cada jueves.', 'Cada jueves mis compañeros de la facu y yo salíamos.']::text[], note_en = coalesce(note_en, 'Argentines often say “con mis compañeros salíamos” to mean “my classmates and I went out”: the “we” already includes the speaker.')
where id = 'cee572a6-9256-565d-88ca-0327e644bc88' and es = 'Con mis compañeros de la facu salíamos cada jueves.' and en = 'My college classmates and I went out every Thursday.'
  and not (es_alt && array['Mis compañeros de la facu y yo salíamos cada jueves.', 'Cada jueves mis compañeros de la facu y yo salíamos.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué dibujitos veía tu hermano?']::text[], note_en = coalesce(note_en, 'Argentines call cartoons “dibujitos”, short for “dibujos animados”.')
where id = '4ddf857b-c0cd-5193-806e-f9af553ad54b' and es = '¿Qué dibujitos miraba tu hermano?' and en = 'What cartoons did your brother watch?'
  and not (es_alt && array['¿Qué dibujitos veía tu hermano?']::text[]);

update public.sentences set es_alt = es_alt || array['Antes no me gustaban las verduras, pero ahora sí.']::text[]
where id = '726eabdd-1829-589b-97fd-71f9d83fed83' and es = 'Antes no me gustaban las verduras, ahora sí.' and en = 'I didn''t use to like vegetables, but now I do.'
  and not (es_alt && array['Antes no me gustaban las verduras, pero ahora sí.']::text[]);

update public.sentences set es_alt = es_alt || array['Casi nunca veía a mi papá.']::text[], note_en = coalesce(note_en, '“Casi no” covers both “barely” and “hardly ever”.')
where id = 'e22d38fa-dd6b-53ed-928c-45eae632deb4' and es = 'Casi no veía a mi papá.' and en = 'I hardly ever saw my dad.'
  and not (es_alt && array['Casi nunca veía a mi papá.']::text[]);

update public.sentences set es_alt = es_alt || array['De chicos íbamos al río con nuestras bicis.']::text[], note_en = coalesce(note_en, 'Spanish often says “las” where English says “our” when it is obvious whose things they are.')
where id = 'd5aca3fd-d71e-5c27-9c28-dd000479058d' and es = 'De chicos íbamos al río con las bicis.' and en = 'As kids we used to go to the river with our bikes.'
  and not (es_alt && array['De chicos íbamos al río con nuestras bicis.']::text[]);

update public.sentences set es_alt = es_alt || array['Después de la escuela, mi hermana y yo mirábamos dibujitos.']::text[], note_en = coalesce(note_en, 'Argentines often say “mirábamos con mi hermana” to mean “my sister and I watched”.')
where id = '1b160164-7447-59fa-aff4-825c0d8cc294' and es = 'Después de la escuela, mirábamos dibujitos con mi hermana.' and en = 'After school, my sister and I watched cartoons.'
  and not (es_alt && array['Después de la escuela, mi hermana y yo mirábamos dibujitos.']::text[]);

update public.sentences set es_alt = es_alt || array['Antes, los chicos jugaban afuera con sus bicis.']::text[], note_en = coalesce(note_en, 'Spanish often says “las” where English says “their” when it is obvious whose things they are.')
where id = '623d467c-df8b-5629-aa3a-79a10e37b5c2' and es = 'Antes, los chicos jugaban afuera con las bicis.' and en = 'Kids used to play outside with their bikes.'
  and not (es_alt && array['Antes, los chicos jugaban afuera con sus bicis.']::text[]);

update public.sentences set es_alt = es_alt || array['Pasábamos los domingos en la casa de mi abuela.', 'Pasábamos los domingos en casa de mi abuela.']::text[], note_en = coalesce(note_en, '“En lo de” plus a person means at that person''s place. You''ll hear it all the time.')
where id = '1ad69677-1ebd-5dff-bc84-22ee0bf500b1' and es = 'Pasábamos los domingos en lo de mi abuela.' and en = 'We spent Sundays at my grandma''s.'
  and not (es_alt && array['Pasábamos los domingos en la casa de mi abuela.', 'Pasábamos los domingos en casa de mi abuela.']::text[]);

update public.sentences set es_alt = es_alt || array['Fuimos a la playa, pero hacía mucho frío.']::text[], note_en = coalesce(note_en, '“Un frío bárbaro” is a very Argentine way to say it was really cold. “Bárbaro” here means tremendous.')
where id = 'dcf4e06a-56c3-573e-9ae6-a547215b3a74' and es = 'Fuimos a la playa, pero hacía un frío bárbaro.' and en = 'We went to the beach, but it was really cold.'
  and not (es_alt && array['Fuimos a la playa, pero hacía mucho frío.']::text[]);

update public.sentences set es_alt = es_alt || array['Hacía mucho calor y no había nadie en la calle.']::text[], note_en = coalesce(note_en, '“Un calor bárbaro” is a very Argentine way to say it was really hot. “Bárbaro” here means tremendous.')
where id = '1bdfca89-7d0d-5e51-952c-2c3da2014eb8' and es = 'Hacía un calor bárbaro y no había nadie en la calle.' and en = 'It was really hot and there was nobody in the street.'
  and not (es_alt && array['Hacía mucho calor y no había nadie en la calle.']::text[]);

update public.sentences set es_alt = es_alt || array['Hacía mucho frío.']::text[], note_en = coalesce(note_en, '“Un frío bárbaro” is a very Argentine way to say it was really cold. “Bárbaro” here means tremendous.')
where id = '229e17cd-863e-57aa-a950-8105f6373565' and es = 'Hacía un frío bárbaro.' and en = 'It was really cold.'
  and not (es_alt && array['Hacía mucho frío.']::text[]);

update public.sentences set es_alt = es_alt || array['La playa estaba llena porque hacía mucho calor.']::text[], note_en = coalesce(note_en, '“Un calor bárbaro” is a very Argentine way to say it was really hot. “Bárbaro” here means tremendous.')
where id = '45f5519e-7ff9-52b1-a022-b509dfdc52dc' and es = 'La playa estaba llena porque hacía un calor bárbaro.' and en = 'The beach was full because it was really hot.'
  and not (es_alt && array['La playa estaba llena porque hacía mucho calor.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Estabas en el bondi? —No, estaba caminando.']::text[], note_en = coalesce(note_en, '“Ir caminando” means going somewhere on foot, so “iba caminando” is the natural reply here.')
where id = '9b76e2fb-c6ee-52a7-82c9-485568072bbf' and es = '—¿Estabas en el bondi? —No, iba caminando.' and en = '—Were you on the bus? —No, I was walking.'
  and not (es_alt && array['—¿Estabas en el bondi? —No, estaba caminando.']::text[]);

update public.sentences set es_alt = es_alt || array['Belén cocinaba re bien.', 'Belén era re buena cocinera.']::text[], note_en = coalesce(note_en, 'Argentines say someone “cocina rico” (cooks tasty) to mean they are a good cook.')
where id = '29ef0326-bb36-58fd-9d22-7d557593e251' and es = 'Belén cocinaba re rico.' and en = 'Belén was a really good cook.'
  and not (es_alt && array['Belén cocinaba re bien.', 'Belén era re buena cocinera.']::text[]);

update public.sentences set es_alt = es_alt || array['Por la tormenta, el barrio estuvo sin luz dos días.']::text[], note_en = coalesce(note_en, '“Con” can mean “because of” here: with the storm, the power went.')
where id = 'c8625477-75ac-5339-bc2b-16d0126e6252' and es = 'Con la tormenta, el barrio estuvo sin luz dos días.' and en = 'Because of the storm, the neighborhood was without power for two days.'
  and not (es_alt && array['Por la tormenta, el barrio estuvo sin luz dos días.']::text[]);

update public.sentences set es_alt = es_alt || array['Estaba cocinando tranquilo cuando el vecino empezó a hacer ruido.', 'Estaba cocinando tranquila cuando el vecino empezó a hacer ruido.']::text[]
where id = '038043cc-f59f-52d1-8083-865bfa82321a' and es = 'Estaba cocinando tranquilo cuando empezó el ruido del vecino.' and en = 'I was cooking in peace when the neighbor started making noise.'
  and not (es_alt && array['Estaba cocinando tranquilo cuando el vecino empezó a hacer ruido.', 'Estaba cocinando tranquila cuando el vecino empezó a hacer ruido.']::text[]);

update public.sentences set es_alt = es_alt || array['Estaba durmiendo cuando sonó mi celu.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my” when it is obvious whose thing it is.')
where id = 'c272a1fb-48e2-55dd-93f9-2b3aaa8c2be6' and es = 'Estaba durmiendo cuando sonó el celu.' and en = 'I was asleep when my phone rang.'
  and not (es_alt && array['Estaba durmiendo cuando sonó mi celu.']::text[]);

update public.sentences set es_alt = es_alt || array['Sonó mi despertador, pero seguí durmiendo.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my” when it is obvious whose thing it is.')
where id = 'f85e6831-85e5-5412-9101-e8bc72866763' and es = 'Sonó el despertador, pero seguí durmiendo.' and en = 'My alarm went off, but I kept sleeping.'
  and not (es_alt && array['Sonó mi despertador, pero seguí durmiendo.']::text[]);

update public.sentences set es_alt = es_alt || array['Sonó el timbre, ¿podés ir?']::text[], note_en = coalesce(note_en, '“¿Vas vos?” (are you going?) is a casual way to ask someone to get the door.')
where id = '95a7994e-5deb-5baf-9e8b-3e19f5c0a138' and es = 'Sonó el timbre, ¿vas vos?' and en = 'The doorbell rang, can you get it?'
  and not (es_alt && array['Sonó el timbre, ¿podés ir?']::text[]);

update public.sentences set es_alt = es_alt || array['¿No sonó tu despertador?']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “your” when it is obvious whose thing it is.')
where id = 'c1c290e2-6cf0-5ab9-aeb8-ad1cedf93d21' and es = '¿No sonó el despertador?' and en = 'Didn''t your alarm go off?'
  and not (es_alt && array['¿No sonó tu despertador?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Por qué no tomamos un taxi?']::text[]
where id = '1f3d216c-a716-59b7-9604-715d6f2c7c19' and es = '¿Por qué no fuimos en taxi?' and en = 'Why didn''t we take a taxi?'
  and not (es_alt && array['¿Por qué no tomamos un taxi?']::text[]);

update public.sentences set es_alt = es_alt || array['Busqué mis llaves y estaban en mi mochila.', 'Busqué mis llaves y estaban en la mochila.', 'Busqué las llaves y estaban en mi mochila.']::text[], note_en = coalesce(note_en, 'Spanish often says “las” or “la” where English says “my” when it is obvious whose things they are.')
where id = 'b44d2b7c-d58f-55cd-9134-c1abc1f728b9' and es = 'Busqué las llaves y estaban en la mochila.' and en = 'I looked for my keys and they were in my backpack.'
  and not (es_alt && array['Busqué mis llaves y estaban en mi mochila.', 'Busqué mis llaves y estaban en la mochila.', 'Busqué las llaves y estaban en mi mochila.']::text[]);

update public.sentences set es_alt = es_alt || array['Casi nunca la veía.']::text[], note_en = coalesce(note_en, '“Casi no” covers both “barely” and “hardly ever”.')
where id = '6872ddaa-af58-512e-9e00-de03f567f6f8' and es = 'Casi no la veía.' and en = 'I hardly ever saw her.'
  and not (es_alt && array['Casi nunca la veía.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando volvía de Bariloche, perdí mi valija.']::text[], note_en = coalesce(note_en, 'Spanish often says “la” where English says “my” when it is obvious whose thing it is.')
where id = 'c50b79b3-15a9-50ca-a709-5d1fcad31798' and es = 'Cuando volvía de Bariloche, perdí la valija.' and en = 'On my way back from Bariloche, I lost my suitcase.'
  and not (es_alt && array['Cuando volvía de Bariloche, perdí mi valija.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi despertador no sonó y llegué tarde.', 'No sonó mi despertador y llegué tarde.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my” when it is obvious whose thing it is.')
where id = 'c17d9f1a-eb2e-528f-81b1-cb7f20b7fd10' and es = 'El despertador no sonó y llegué tarde.' and en = 'My alarm didn''t go off and I was late.'
  and not (es_alt && array['Mi despertador no sonó y llegué tarde.', 'No sonó mi despertador y llegué tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Estaba en la ducha cuando sonó mi celu.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my” when it is obvious whose thing it is.')
where id = 'b49c0a80-729e-574b-9895-a8cc204bac42' and es = 'Estaba en la ducha cuando sonó el celu.' and en = 'I was in the shower when my phone rang.'
  and not (es_alt && array['Estaba en la ducha cuando sonó mi celu.']::text[]);

update public.sentences set es_alt = es_alt || array['Estaba tan cansada que no podía más.', 'Estaba tan cansado que no podía más.']::text[]
where id = '9f86e8f7-439b-5561-bf5d-a2e09852d1b7' and es = 'Estaba re cansada, no podía más.' and en = 'I was so tired I couldn''t go on.'
  and not (es_alt && array['Estaba tan cansada que no podía más.', 'Estaba tan cansado que no podía más.']::text[]);

update public.sentences set es_alt = es_alt || array['Estábamos en clase y sonó el celu del profe.']::text[], note_en = coalesce(note_en, '“Le sonó el celu” is how Argentines say someone''s phone went off: literally, the phone rang on him.')
where id = '013c2008-698e-584c-91e8-74099fd540a0' and es = 'Estábamos en clase y le sonó el celu al profe.' and en = 'We were in class and the teacher''s phone went off.'
  and not (es_alt && array['Estábamos en clase y sonó el celu del profe.']::text[]);

update public.sentences set es_alt = es_alt || array['Volví ayer de Mendoza.', 'Ayer volví de Mendoza.']::text[]
where id = '8835ca94-f482-551c-8a14-c704ceb3d72f' and es = 'Llegué ayer de Mendoza.' and en = 'I got back from Mendoza yesterday.'
  and not (es_alt && array['Volví ayer de Mendoza.', 'Ayer volví de Mendoza.']::text[]);

update public.sentences set es_alt = es_alt || array['Sonó mi celu.', 'Sonó el celu.']::text[], note_en = coalesce(note_en, '“Me sonó el celu” is the everyday way to say your phone rang: literally, the phone rang on me.')
where id = '3d2edd68-f089-5b08-b35f-0d57d7a52249' and es = 'Me sonó el celu.' and en = 'My phone rang.'
  and not (es_alt && array['Sonó mi celu.', 'Sonó el celu.']::text[]);

update public.sentences set es_alt = es_alt || array['Sin mis anteojos no podía leer.', 'No podía leer sin mis anteojos.']::text[]
where id = 'a2b6f180-f292-56bc-968e-2de79edbf1fd' and es = 'Sin anteojos no podía leer.' and en = 'I couldn''t read without my glasses.'
  and not (es_alt && array['Sin mis anteojos no podía leer.', 'No podía leer sin mis anteojos.']::text[]);

update public.sentences set es_alt = es_alt || array['No tenían más medialunas.']::text[], note_en = coalesce(note_en, '“Ya no tenían” means they no longer had any: a very common way to say a place has run out of something.')
where id = 'df70d6ef-1086-5263-bc28-a540621a6ee4' and es = 'Ya no tenían medialunas.' and en = 'They were out of medialunas.'
  and not (es_alt && array['No tenían más medialunas.']::text[]);

update public.sentences set es_alt = es_alt || array['Ganamos el partido y después nos juntamos en mi casa.']::text[], note_en = coalesce(note_en, '“En casa” on its own usually means at my place.')
where id = 'f400425d-97bf-5376-b4d3-1a51b9389078' and es = 'Ganamos el partido y después nos juntamos en casa.' and en = 'We won the game and afterwards got together at my place.'
  and not (es_alt && array['Ganamos el partido y después nos juntamos en mi casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Pablo juega los jueves con sus compañeros del laburo.']::text[], note_en = coalesce(note_en, 'Spanish often says “los” where English says “his” when it is obvious whose they are.')
where id = '70911c64-bdf6-529b-b2a8-db421098c6a9' and es = 'Pablo juega los jueves con los compañeros del laburo.' and en = 'Pablo plays on Thursdays with his coworkers.'
  and not (es_alt && array['Pablo juega los jueves con sus compañeros del laburo.']::text[]);

update public.sentences set es_alt = es_alt || array['Si juega la selección, nos juntamos en mi casa.']::text[], note_en = coalesce(note_en, '“En casa” on its own usually means at my place.')
where id = '4d5ef4cc-5c9e-5c99-9b58-71e0321dbbf0' and es = 'Si juega la selección, nos juntamos en casa.' and en = 'If the national team plays, we''ll get together at my place.'
  and not (es_alt && array['Si juega la selección, nos juntamos en mi casa.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Venís al bar con tu camiseta?']::text[], note_en = coalesce(note_en, 'Spanish often says “la” where English says “your” when it is obvious whose thing it is.')
where id = 'b2046155-44fb-5ff1-a473-80ae2cfd3da2' and es = '¿Venís al bar con la camiseta?' and en = 'Are you coming to the bar with your jersey?'
  and not (es_alt && array['¿Venís al bar con tu camiseta?']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Quién jugó de arquero ayer? —Nico, porque Diego estaba enfermo.']::text[], note_en = coalesce(note_en, '“Atajar” means to save a shot, and it is also how Argentines say someone played in goal.')
where id = '4e19d342-c9c8-5363-b752-f073d90bee9a' and es = '—¿Quién atajó ayer? —Nico, porque Diego estaba enfermo.' and en = '—Who played in goal yesterday? —Nico, because Diego was sick.'
  and not (es_alt && array['—¿Quién jugó de arquero ayer? —Nico, porque Diego estaba enfermo.']::text[]);

update public.sentences set es_alt = es_alt || array['Creo que no fue penal.']::text[], note_en = coalesce(note_en, '“Para mí” is the everyday way to give your opinion: “for me, it wasn''t a penalty.”')
where id = 'e4bd2478-e5a6-5500-b8b3-4de579705a5c' and es = 'Para mí no fue penal.' and en = 'I don''t think it was a penalty.'
  and not (es_alt && array['Creo que no fue penal.']::text[]);

update public.sentences set es_alt = es_alt || array['Si empatamos, vamos a penales.']::text[]
where id = '8546eef2-c91d-5790-9780-c5a3ea898271' and es = 'Si empatamos, hay penales.' and en = 'If we tie, it goes to penalties.'
  and not (es_alt && array['Si empatamos, vamos a penales.']::text[]);

update public.sentences set es_alt = es_alt || array['¿De qué club sos hincha?']::text[], note_en = coalesce(note_en, 'Argentines ask what club you “are”: “ser de” a club means being a fan of it.')
where id = 'a3ee8180-e765-5269-bc00-984956dbaff9' and es = '¿De qué club sos?' and en = 'What club do you support?'
  and not (es_alt && array['¿De qué club sos hincha?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde está el club?']::text[], note_en = coalesce(note_en, '“Quedar” is the everyday verb for where a place is located.')
where id = '9ce2f496-7208-5cd0-8a9a-af86acc00d97' and es = '¿Dónde queda el club?' and en = 'Where''s the club?'
  and not (es_alt && array['¿Dónde está el club?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi novia es hincha de otro cuadro.', 'Mi novia hincha por otro cuadro.']::text[], note_en = coalesce(note_en, 'In Argentina you say you "are of" a team: "ser de" a club is the everyday way to say you support it.')
where id = '63f5c012-48c5-520d-b128-db5b2081077d' and es = 'Mi novia es de otro cuadro.' and en = 'My girlfriend supports another team.'
  and not (es_alt && array['Mi novia es hincha de otro cuadro.', 'Mi novia hincha por otro cuadro.']::text[]);

update public.sentences set es_alt = es_alt || array['Soy hincha de Independiente, el cuadro de mi abuelo.', 'Hincho por Independiente, el cuadro de mi abuelo.']::text[], note_en = coalesce(note_en, 'In Argentina you say you "are of" a team: "ser de" a club is the everyday way to say you support it.')
where id = '0e104044-bafe-591e-9bd3-021476ea8092' and es = 'Soy de Independiente, el cuadro de mi abuelo.' and en = 'I support Independiente, my grandfather''s team.'
  and not (es_alt && array['Soy hincha de Independiente, el cuadro de mi abuelo.', 'Hincho por Independiente, el cuadro de mi abuelo.']::text[]);

update public.sentences set es_alt = es_alt || array['Soy hincha del club de mi barrio.', 'Hincho por el club de mi barrio.']::text[], note_en = coalesce(note_en, 'In Argentina you say you "are of" a team: "ser de" a club is the everyday way to say you support it.')
where id = '11781d0e-7bdf-5362-8e07-f21dbecc268d' and es = 'Soy del club de mi barrio.' and en = 'I support my neighborhood club.'
  and not (es_alt && array['Soy hincha del club de mi barrio.', 'Hincho por el club de mi barrio.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi viejo es socio desde que era chico.']::text[], note_en = coalesce(note_en, '"Desde chico" is the short everyday way to say "since he was a kid".')
where id = '28bca59e-93ab-5c9a-adb3-6e5e79a29805' and es = 'Mi viejo es socio desde chico.' and en = 'My dad has been a member since he was a kid.'
  and not (es_alt && array['Mi viejo es socio desde que era chico.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi viejo todavía tiene la camiseta de toda la vida.']::text[]
where id = '0c20c366-84b5-508a-b7ab-3a3e5abcefe7' and es = 'Mi viejo tiene la camiseta de toda la vida.' and en = 'My dad still has the jersey he''s had forever.'
  and not (es_alt && array['Mi viejo todavía tiene la camiseta de toda la vida.']::text[]);

update public.sentences set es_alt = es_alt || array['Esta noche cenamos muzza.', 'Cenamos muzza esta noche.']::text[], note_en = coalesce(note_en, 'Since "cenar" already means dinner, Argentines often just say "hoy" where English says "tonight".')
where id = '01045d2e-f9a9-58e6-a5c5-412dfd2d3911' and es = 'Hoy cenamos muzza.' and en = 'We''re having mozzarella pizza for dinner tonight.'
  and not (es_alt && array['Esta noche cenamos muzza.', 'Cenamos muzza esta noche.']::text[]);

update public.sentences set es_alt = es_alt || array['Reservé una mesa afuera porque hace calor.', 'Reservé mesa afuera porque hace calor.']::text[], note_en = coalesce(note_en, '"Reservar" on its own already means booking a table, so the word "mesa" is often left out.')
where id = '48466eba-4225-5f27-8c7d-c7bf3d548e8d' and es = 'Reservé afuera porque hace calor.' and en = 'I booked a table outside because it''s hot.'
  and not (es_alt && array['Reservé una mesa afuera porque hace calor.', 'Reservé mesa afuera porque hace calor.']::text[]);

update public.sentences set es_alt = es_alt || array['Nico quiere reservar una mesa en un bar tranquilo para su cumple.', 'Nico quiere reservar mesa en un bar tranquilo para su cumple.']::text[], note_en = coalesce(note_en, '"Reservar" on its own already means booking a table, so the word "mesa" is often left out.')
where id = 'e2819b98-6d08-58d3-bd4c-2227d1d4551d' and es = 'Nico quiere reservar en un bar tranquilo para su cumple.' and en = 'Nico wants to book a table at a quiet bar for his birthday.'
  and not (es_alt && array['Nico quiere reservar una mesa en un bar tranquilo para su cumple.', 'Nico quiere reservar mesa en un bar tranquilo para su cumple.']::text[]);

update public.sentences set es_alt = es_alt || array['Sin nada picante, por favor, es para los chicos.', 'Nada picante, por favor, es para los chicos.']::text[], note_en = coalesce(note_en, 'Argentines often slip in a little "que" to give the reason for a request: it works like a soft "because".')
where id = '015b3bcf-6a81-5a1c-963b-b4bf549a1955' and es = 'Sin nada picante, por favor, que es para los chicos.' and en = 'Nothing spicy, please, it''s for the kids.'
  and not (es_alt && array['Sin nada picante, por favor, es para los chicos.', 'Nada picante, por favor, es para los chicos.']::text[]);

update public.sentences set es_alt = es_alt || array['Primero las achuras, y después el vacío.', 'Primero las achuras y después de eso el vacío.']::text[]
where id = '371e1b9c-431d-52fd-998e-2b0892cfbbb9' and es = 'Primero las achuras, después el vacío.' and en = 'First the organ meats, and after that the flank steak.'
  and not (es_alt && array['Primero las achuras, y después el vacío.', 'Primero las achuras y después de eso el vacío.']::text[]);

update public.sentences set es_alt = es_alt || array['Los chinchulines que hace mi viejo son lo mejor.']::text[]
where id = 'eb7dcc69-7f26-5588-9299-aa9404e2acfd' and es = 'Los chinchulines de mi viejo son lo mejor.' and en = 'The grilled intestines my dad makes are the best.'
  and not (es_alt && array['Los chinchulines que hace mi viejo son lo mejor.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenemos que pagar el cubierto?']::text[], note_en = coalesce(note_en, '"Hay que" is the impersonal "one has to": Argentines use it all the time where English says "we have to".')
where id = '1f361edc-eb74-5712-9b41-60ac08e775f6' and es = '¿Hay que pagar el cubierto?' and en = 'Do we have to pay the cover charge?'
  and not (es_alt && array['¿Tenemos que pagar el cubierto?']::text[]);

update public.sentences set es_alt = es_alt || array['Tenemos que comprar leña.', 'Necesitamos comprar leña.']::text[], note_en = coalesce(note_en, '"Hay que" is the impersonal "one has to": Argentines use it all the time where English says "we need to".')
where id = 'e6aa79b5-7d23-5506-b3c5-4d8c3c795c1c' and es = 'Hay que comprar leña.' and en = 'We need to buy firewood.'
  and not (es_alt && array['Tenemos que comprar leña.', 'Necesitamos comprar leña.']::text[]);

update public.sentences set es_alt = es_alt || array['Entonces, ¿cómo quedamos? Yo salgo en un rato.']::text[]
where id = '478934b8-1657-509a-a0f0-86db8d7a14fc' and es = '¿Cómo quedamos? Yo salgo en un rato.' and en = 'So what''s the plan? I''m leaving in a while.'
  and not (es_alt && array['Entonces, ¿cómo quedamos? Yo salgo en un rato.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Por qué no esperás adentro? Hace frío.']::text[], note_en = coalesce(note_en, 'Argentines often slip in a little "que" to give the reason for a suggestion: it works like a soft "because".')
where id = '45f2c0ea-2557-521a-a424-49b3064b0307' and es = '¿Por qué no esperás adentro, que hace frío?' and en = 'Why don''t you wait inside? It''s cold.'
  and not (es_alt && array['¿Por qué no esperás adentro? Hace frío.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuánto tardás en llegar de casa a la oficina?', '¿Cuánto tardás en ir de casa a la oficina?']::text[]
where id = '2f647d97-7be4-506e-95e3-bc004ca283fe' and es = '¿Cuánto tardás de casa a la oficina?' and en = 'How long does it take you to get from home to the office?'
  and not (es_alt && array['¿Cuánto tardás en llegar de casa a la oficina?', '¿Cuánto tardás en ir de casa a la oficina?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Les dijiste a los pibes que ya salgo?']::text[]
where id = '4ca79d80-d008-526a-925f-dda6f89f066a' and es = '¿Les avisaste a los pibes que ya salgo?' and en = 'Did you tell the guys I''m leaving right away?'
  and not (es_alt && array['¿Les dijiste a los pibes que ya salgo?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Les dijiste a tus viejos que llegás tarde?', '¿Les dijiste a tus viejos que vas a llegar tarde?']::text[]
where id = 'da56e0fd-ca27-51ae-a642-9bb67a715889' and es = '¿Les avisaste a tus viejos que llegás tarde?' and en = 'Did you tell your parents you''ll be late?'
  and not (es_alt && array['¿Les dijiste a tus viejos que llegás tarde?', '¿Les dijiste a tus viejos que vas a llegar tarde?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Nico dijo a qué hora llega?']::text[]
where id = 'c9ca852d-d3eb-5998-a83c-3f27ff4f0410' and es = '¿Nico avisó a qué hora llega?' and en = 'Did Nico say what time he''s getting here?'
  and not (es_alt && array['¿Nico dijo a qué hora llega?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Por qué no me lo dijiste?', '¿Por qué no me dijiste?']::text[], note_en = coalesce(note_en, '“Avisar” is the everyday Argentine verb for giving someone a heads-up; “decir” works here too.')
where id = 'e215a70f-8806-52e3-86d8-41e3a68ae61b' and es = '¿Por qué no me avisaste?' and en = 'Why didn''t you tell me?'
  and not (es_alt && array['¿Por qué no me lo dijiste?', '¿Por qué no me dijiste?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tu novio te avisó que llega en diez?', '¿Te avisó tu novio que llega en diez?']::text[], note_en = coalesce(note_en, 'With “avisar” Argentines often leave out who was told when it''s obvious; adding “te” is just as right.')
where id = 'f04d8748-2cc7-5d5c-afb1-662ce170415a' and es = '¿Tu novio avisó que llega en diez?' and en = 'Did your boyfriend let you know he''ll be here in ten?'
  and not (es_alt && array['¿Tu novio te avisó que llega en diez?', '¿Te avisó tu novio que llega en diez?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Y a Ana no le dijiste?', '¿Y no le dijiste a Ana?']::text[], note_en = coalesce(note_en, '“Avisar” is the everyday Argentine verb for giving someone a heads-up; “decir” works here too.')
where id = '6d0324e5-5b61-5937-ae9b-830270329800' and es = '¿Y a Ana no le avisaste?' and en = 'And you didn''t tell Ana?'
  and not (es_alt && array['¿Y a Ana no le dijiste?', '¿Y no le dijiste a Ana?']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy en camino, ya les avisé.']::text[], note_en = coalesce(note_en, 'With “avisar” Argentines often leave out who was told when it''s obvious; adding “les” is just as right.')
where id = '099bfab1-e9df-5901-9076-e9e1c0caa6a8' and es = 'Estoy en camino, ya avisé.' and en = 'I''m on my way, I already let them know.'
  and not (es_alt && array['Estoy en camino, ya les avisé.']::text[]);

update public.sentences set es_alt = es_alt || array['Lucía llegó tarde porque estaba en una reunión.']::text[], note_en = coalesce(note_en, '“Tardar” means to take a long time, and Argentines use it all the time for someone who is late.')
where id = '3e1b5726-3b42-5de7-b114-eb690fbdc234' and es = 'Lucía tardó porque estaba en una reunión.' and en = 'Lucía was late because she was in a meeting.'
  and not (es_alt && array['Lucía llegó tarde porque estaba en una reunión.']::text[]);

update public.sentences set es_alt = es_alt || array['Mati siempre llega tarde, así que quedamos más temprano.', 'Mati llega siempre tarde, así que quedamos más temprano.']::text[], note_en = coalesce(note_en, '“Tardar” means to take a long time, and Argentines use it all the time for someone who is late.')
where id = '572d6e24-d905-544d-b97f-180ca4d43388' and es = 'Mati siempre tarda, así que quedamos más temprano.' and en = 'Mati is always late, so we set an earlier time.'
  and not (es_alt && array['Mati siempre llega tarde, así que quedamos más temprano.', 'Mati llega siempre tarde, así que quedamos más temprano.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hermana nos avisó que se le hizo tarde.', 'Mi hermana avisó que llega tarde.', 'Mi hermana nos avisó que llega tarde.']::text[], note_en = coalesce(note_en, 'With “avisar” Argentines often leave out who was told when it''s obvious; adding “nos” is just as right.')
where id = '029dca48-46b4-56f7-920e-3dc8e871cd31' and es = 'Mi hermana avisó que se le hizo tarde.' and en = 'My sister let us know she''s running late.'
  and not (es_alt && array['Mi hermana nos avisó que se le hizo tarde.', 'Mi hermana avisó que llega tarde.', 'Mi hermana nos avisó que llega tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Nadie me avisó y esperé media hora en la esquina.']::text[], note_en = coalesce(note_en, 'With “avisar” Argentines often leave out who was told when it''s obvious; adding “me” is just as right.')
where id = '39ecbcb5-8065-5168-9b6d-df77b7628fb2' and es = 'Nadie avisó y esperé media hora en la esquina.' and en = 'Nobody let me know and I waited half an hour on the corner.'
  and not (es_alt && array['Nadie me avisó y esperé media hora en la esquina.']::text[]);

update public.sentences set es_alt = es_alt || array['Nico nos avisó que está en camino.']::text[], note_en = coalesce(note_en, 'With “avisar” Argentines often leave out who was told when it''s obvious; adding “nos” is just as right.')
where id = '4c1a6fc0-a7c9-5998-9461-0236c7fe26c3' and es = 'Nico avisó que está en camino.' and en = 'Nico let us know he''s on his way.'
  and not (es_alt && array['Nico nos avisó que está en camino.']::text[]);

update public.sentences set es_alt = es_alt || array['No le avisé a nadie, se me hizo tarde.']::text[], note_en = coalesce(note_en, '“No avisé” on its own already means you didn''t let anyone know.')
where id = '9f220939-40d5-5b93-ac4b-6e0d24797b53' and es = 'No avisé, se me hizo tarde.' and en = 'I didn''t let anyone know, I lost track of time.'
  and not (es_alt && array['No le avisé a nadie, se me hizo tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Nunca tardás, ¿qué pasó?', 'Nunca llegás tarde, ¿qué te pasó?', 'Nunca llegás tarde, ¿qué pasó?']::text[], note_en = coalesce(note_en, '“¿Qué te pasó?” (what happened to you?) is how Argentines usually ask someone what went wrong.')
where id = 'e8c921e7-7b75-505b-b5f0-aa8a3b9c92a3' and es = 'Nunca tardás, ¿qué te pasó?' and en = 'You''re never late. What happened?'
  and not (es_alt && array['Nunca tardás, ¿qué pasó?', 'Nunca llegás tarde, ¿qué te pasó?', 'Nunca llegás tarde, ¿qué pasó?']::text[]);

update public.sentences set es_alt = es_alt || array['Llego tarde, ¿me esperás diez minutos?']::text[], note_en = coalesce(note_en, '“Se me hizo tarde” (it got late on me) is a very common way to say you''re running late.')
where id = '5e4597d8-8ce9-54db-8580-6fc2edb5aec6' and es = 'Se me hizo tarde, ¿me esperás diez minutos?' and en = 'I''m running late, will you wait ten minutes for me?'
  and not (es_alt && array['Llego tarde, ¿me esperás diez minutos?']::text[]);

update public.sentences set es_alt = es_alt || array['Ya le dije a la jefa que llego tarde.']::text[], note_en = coalesce(note_en, '“Avisar” is the everyday Argentine verb for giving someone a heads-up; “decir” works here too.')
where id = '7e2b5e38-8e34-5005-8823-4afbc71729a2' and es = 'Ya le avisé a la jefa que llego tarde.' and en = 'I already told the boss I''m running late.'
  and not (es_alt && array['Ya le dije a la jefa que llego tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuándo confirmás?']::text[], note_en = coalesce(note_en, 'Argentines usually say who gets the confirmation: “¿me confirmás?” is the natural way to ask someone to get back to you.')
where id = 'c9184efe-0262-5ff0-9352-84996bd28187' and es = '¿Cuándo me confirmás?' and en = 'When will you confirm?'
  and not (es_alt && array['¿Cuándo confirmás?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Confirmás la hora?']::text[], note_en = coalesce(note_en, 'Argentines often ask for things with a plain present-tense question: “¿Me confirmás…?” sounds as polite as “can you…?”.')
where id = '8eec9cc6-6616-5c17-bd87-e57bff982bf2' and es = '¿Me confirmás la hora?' and en = 'Can you confirm the time?'
  and not (es_alt && array['¿Confirmás la hora?']::text[]);

update public.sentences set es_alt = es_alt || array['Les avisé en el grupo que estoy llegando.', 'En el grupo les avisé que estoy llegando.']::text[], note_en = coalesce(note_en, 'With “avisar” Argentines often leave out who was told when it''s obvious; adding “les” is just as right.')
where id = '5ae84d49-dc92-5a1c-87a4-2ed27a71aba1' and es = 'Avisé en el grupo que estoy llegando.' and en = 'I let them know in the group chat that I''m almost there.'
  and not (es_alt && array['Les avisé en el grupo que estoy llegando.', 'En el grupo les avisé que estoy llegando.']::text[]);

update public.sentences set es_alt = es_alt || array['Hablo con Mati y confirmo.']::text[], note_en = coalesce(note_en, 'Argentines usually say who gets the confirmation: “te confirmo” is the natural way to say “I''ll get back to you”.')
where id = 'ef102050-d126-5f47-b985-1ef437a4169f' and es = 'Hablo con Mati y te confirmo.' and en = 'I''ll talk to Mati and confirm.'
  and not (es_alt && array['Hablo con Mati y confirmo.']::text[]);

update public.sentences set es_alt = es_alt || array['No encontré mi SUBE y salí tarde.', 'No encontré mi tarjeta SUBE y salí tarde.']::text[], note_en = coalesce(note_en, 'Spanish often says “la” instead of “mi” when it''s obvious whose thing it is.')
where id = '10c13e43-0a91-5058-a831-1cb23597a2ca' and es = 'No encontré la SUBE y salí tarde.' and en = 'I couldn''t find my SUBE card and I left late.'
  and not (es_alt && array['No encontré mi SUBE y salí tarde.', 'No encontré mi tarjeta SUBE y salí tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Te aviso en el grupo si llego tarde.']::text[], note_en = coalesce(note_en, '“Por el grupo” means through the group chat; “en el grupo” is just as common.')
where id = '6761c47b-97dc-5db3-93ae-cb183c2f4cd5' and es = 'Te aviso por el grupo si llego tarde.' and en = 'I''ll let you know in the group chat if I''m running late.'
  and not (es_alt && array['Te aviso en el grupo si llego tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Confirmo en un rato.', 'En un rato confirmo.']::text[], note_en = coalesce(note_en, 'Argentines usually say who gets the confirmation: “te confirmo” is the natural way to say “I''ll get back to you”.')
where id = 'f2da1fd1-8835-5634-8de2-cd101f91091f' and es = 'Te confirmo en un rato.' and en = 'I''ll confirm in a bit.'
  and not (es_alt && array['Confirmo en un rato.', 'En un rato confirmo.']::text[]);

update public.sentences set es_alt = es_alt || array['De chica comía ñoquis en la casa de mi abuela.']::text[]
where id = 'f472b3b6-259d-5dd7-bd64-a587f81f7281' and es = 'De chico comía ñoquis en la casa de mi abuela.' and en = 'As a kid I used to eat gnocchi at my grandmother''s house.'
  and not (es_alt && array['De chica comía ñoquis en la casa de mi abuela.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Todavía tenés el arbolito de Navidad? —Sí, hasta Reyes.']::text[], note_en = coalesce(note_en, 'Argentines usually call the Christmas tree just “el arbolito”, the little tree. “Árbol de Navidad” is correct too.')
where id = '9ddf6b3d-fa9c-5899-8b17-42bba012ef78' and es = '—¿Todavía tenés el arbolito? —Sí, hasta Reyes.' and en = '—Do you still have your Christmas tree up? —Yes, until Three Kings'' Day.'
  and not (es_alt && array['—¿Todavía tenés el arbolito de Navidad? —Sí, hasta Reyes.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuándo vas a armar el arbolito de Navidad?']::text[], note_en = coalesce(note_en, 'Argentines usually call the Christmas tree just “el arbolito”, the little tree. “Árbol de Navidad” is correct too.')
where id = '3eb64d8e-b39f-510c-8383-5846fa379a88' and es = '¿Cuándo vas a armar el arbolito?' and en = 'When are you going to put up the Christmas tree?'
  and not (es_alt && array['¿Cuándo vas a armar el arbolito de Navidad?']::text[]);

update public.sentences set es_alt = es_alt || array['¿El arbolito de Navidad? Lo armábamos con mi primo.']::text[], note_en = coalesce(note_en, 'Argentines usually call the Christmas tree just “el arbolito”, the little tree. “Árbol de Navidad” is correct too.')
where id = '761f25f3-efd2-5e48-b540-f44cd69b5301' and es = '¿El arbolito? Lo armábamos con mi primo.' and en = 'The Christmas tree? My cousin and I used to put it up.'
  and not (es_alt && array['¿El arbolito de Navidad? Lo armábamos con mi primo.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me ayudás a armar el arbolito de Navidad?']::text[], note_en = coalesce(note_en, 'Argentines usually call the Christmas tree just “el arbolito”, the little tree. “Árbol de Navidad” is correct too.')
where id = 'abb7b27a-9821-5221-a350-35014c5fbe56' and es = '¿Me ayudás a armar el arbolito?' and en = 'Can you help me put up the Christmas tree?'
  and not (es_alt && array['¿Me ayudás a armar el arbolito de Navidad?']::text[]);

update public.sentences set es_alt = es_alt || array['Nos juntábamos más.']::text[], note_en = coalesce(note_en, '“Antes” (before) often goes with this past tense to stress that things used to be different.')
where id = 'dbe69b97-2a62-5720-bc41-8699bbe77815' and es = 'Antes nos juntábamos más.' and en = 'We used to get together more often.'
  and not (es_alt && array['Nos juntábamos más.']::text[]);

update public.sentences set es_alt = es_alt || array['Compré un arbolito de Navidad nuevo.']::text[], note_en = coalesce(note_en, 'Argentines usually call the Christmas tree just “el arbolito”, the little tree. “Árbol de Navidad” is correct too.')
where id = 'f7eb99de-070a-5d31-a63a-9dd40fbcb1dc' and es = 'Compré un arbolito nuevo.' and en = 'I bought a new Christmas tree.'
  and not (es_alt && array['Compré un arbolito de Navidad nuevo.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando era chico, mi tarea era armar la picada.', 'Cuando era chica, mi tarea era armar la picada.', 'De chica, mi tarea era armar la picada.']::text[], note_en = coalesce(note_en, '“De chico” is a short, very common way to say “when I was a kid”.')
where id = '0cbb8700-77f1-59ec-a3ee-70958564158d' and es = 'De chico, mi tarea era armar la picada.' and en = 'When I was a kid, my job was putting together the picada.'
  and not (es_alt && array['Cuando era chico, mi tarea era armar la picada.', 'Cuando era chica, mi tarea era armar la picada.', 'De chica, mi tarea era armar la picada.']::text[]);

update public.sentences set es_alt = es_alt || array['En diciembre armábamos el arbolito de Navidad.']::text[], note_en = coalesce(note_en, 'Argentines usually call the Christmas tree just “el arbolito”, the little tree. “Árbol de Navidad” is correct too.')
where id = '09e2001b-dbc9-5701-b66b-7a4a55909211' and es = 'En diciembre armábamos el arbolito.' and en = 'In December we used to put up the Christmas tree.'
  and not (es_alt && array['En diciembre armábamos el arbolito de Navidad.']::text[]);

update public.sentences set es_alt = es_alt || array['Era costumbre armar el arbolito de Navidad en lo de la abuela.']::text[], note_en = coalesce(note_en, 'Argentines usually call the Christmas tree just “el arbolito”, the little tree. “Árbol de Navidad” is correct too.')
where id = 'a1f1329c-9d5d-5792-b292-705355c89cda' and es = 'Era costumbre armar el arbolito en lo de la abuela.' and en = 'It was our custom to put up the Christmas tree at Grandma''s.'
  and not (es_alt && array['Era costumbre armar el arbolito de Navidad en lo de la abuela.']::text[]);

update public.sentences set es_alt = es_alt || array['Este año no tenemos arbolito de Navidad.']::text[], note_en = coalesce(note_en, 'Argentines usually call the Christmas tree just “el arbolito”, the little tree. “Árbol de Navidad” is correct too.')
where id = '053651fc-533e-547a-96ad-f362f5a71ea8' and es = 'Este año no tenemos arbolito.' and en = 'We don''t have a Christmas tree this year.'
  and not (es_alt && array['Este año no tenemos arbolito de Navidad.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Te dije que hacía frío!']::text[], note_en = coalesce(note_en, '“Avisar” is the everyday Argentine verb for giving someone a heads-up; “decir” works here too.')
where id = '3b5fe1f5-d62e-518a-bb2c-b5ae74cca93f' and es = '¡Te avisé que hacía frío!' and en = 'I told you it was cold!'
  and not (es_alt && array['¡Te dije que hacía frío!']::text[]);

update public.sentences set es_alt = es_alt || array['¿A quién le dijiste?']::text[], note_en = coalesce(note_en, '“Avisar” is the everyday Argentine verb for giving someone a heads-up; “decir” works here too.')
where id = 'a2edef14-b5ac-524b-bdbe-c9ffb5e2e2ee' and es = '¿A quién le avisaste?' and en = 'Who did you tell?'
  and not (es_alt && array['¿A quién le dijiste?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Les dijiste a los chicos dónde nos encontramos?', '¿A los chicos les dijiste dónde nos encontramos?']::text[], note_en = coalesce(note_en, '“Avisar” is the everyday Argentine verb for giving someone a heads-up; “decir” works here too.')
where id = '3c0c2f37-0330-568c-a7b9-c747280019fe' and es = '¿Les avisaste a los chicos dónde nos encontramos?' and en = 'Did you tell the guys where we''re meeting?'
  and not (es_alt && array['¿Les dijiste a los chicos dónde nos encontramos?', '¿A los chicos les dijiste dónde nos encontramos?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Por qué no me lo dijiste?', '¿Por qué no me dijiste?']::text[], note_en = coalesce(note_en, '“Avisar” is the everyday Argentine verb for giving someone a heads-up; “decir” works here too.')
where id = '626286ed-6b52-5991-a16c-f776f2aae887' and es = '¿Por qué no me avisaste?' and en = 'Why didn''t you tell me?'
  and not (es_alt && array['¿Por qué no me lo dijiste?', '¿Por qué no me dijiste?']::text[]);

update public.sentences set es_alt = es_alt || array['Anoche Diego pagó la picada.', 'Diego pagó la picada anoche.']::text[], note_en = coalesce(note_en, 'In Argentina “invitar” something means to treat people to it: whoever “invita” pays.')
where id = 'd511ff0f-780b-5634-a6eb-0a2dab6ce0da' and es = 'Anoche Diego invitó la picada.' and en = 'Last night Diego paid for the picada.'
  and not (es_alt && array['Anoche Diego pagó la picada.', 'Diego pagó la picada anoche.']::text[]);

update public.sentences set es_alt = es_alt || array['Nos juntábamos los viernes.', 'Los viernes nos juntábamos.']::text[], note_en = coalesce(note_en, '“Antes” (before) often goes with this past tense to stress that things used to be different.')
where id = '5354f414-0344-504f-aa8d-90035f7bae3f' and es = 'Antes nos juntábamos los viernes.' and en = 'We used to get together on Fridays.'
  and not (es_alt && array['Nos juntábamos los viernes.', 'Los viernes nos juntábamos.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando era chico, festejábamos mi cumple en el patio.', 'Cuando era chica, festejábamos mi cumple en el patio.', 'De chica festejábamos mi cumple en el patio.']::text[], note_en = coalesce(note_en, '“De chico” is a short, very common way to say “when I was a kid”.')
where id = 'c119fa8b-1bea-5f03-a1c2-118d3f25d494' and es = 'De chico festejábamos mi cumple en el patio.' and en = 'When I was a kid, we used to celebrate my birthday in the backyard.'
  and not (es_alt && array['Cuando era chico, festejábamos mi cumple en el patio.', 'Cuando era chica, festejábamos mi cumple en el patio.', 'De chica festejábamos mi cumple en el patio.']::text[]);

update public.sentences set es_alt = es_alt || array['Llegaste tarde y no le avisaste a nadie.']::text[], note_en = coalesce(note_en, '“No avisaste” on its own already means you didn''t let anyone know.')
where id = 'c9423e7d-9bc9-55c1-90d2-30319c24de81' and es = 'Llegaste tarde y no avisaste.' and en = 'You got here late and didn''t let anyone know.'
  and not (es_alt && array['Llegaste tarde y no le avisaste a nadie.']::text[]);

update public.sentences set es_alt = es_alt || array['Menos mal que me dijiste que el subte no andaba.', 'Menos mal que me dijiste que no andaba el subte.']::text[], note_en = coalesce(note_en, '“Avisar” is the everyday Argentine verb for giving someone a heads-up; “decir” works here too.')
where id = '43c4296e-f51a-5bf9-b359-c2b44694ec04' and es = 'Menos mal que me avisaste que el subte no andaba.' and en = 'Good thing you told me the subway wasn''t running.'
  and not (es_alt && array['Menos mal que me dijiste que el subte no andaba.', 'Menos mal que me dijiste que no andaba el subte.']::text[]);

update public.sentences set es_alt = es_alt || array['No encontré mi celu.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” instead of “mi” when it''s obvious whose thing it is.')
where id = '3bd3173c-3ffc-5f1b-898b-1ae7c98634d9' and es = 'No encontré el celu.' and en = 'I couldn''t find my phone.'
  and not (es_alt && array['No encontré mi celu.']::text[]);

update public.sentences set es_alt = es_alt || array['No hay luz y ya le dije al encargado.']::text[], note_en = coalesce(note_en, '“Avisar” is the everyday Argentine verb for giving someone a heads-up; “decir” works here too.')
where id = 'a2ffdda4-08a8-5da9-ba27-0020b4717a34' and es = 'No hay luz y ya le avisé al encargado.' and en = 'The power''s out and I already told the building caretaker.'
  and not (es_alt && array['No hay luz y ya le dije al encargado.']::text[]);

update public.sentences set es_alt = es_alt || array['Nunca dijiste que eras vegetariana.', 'Nunca dijiste que eras vegetariano.']::text[], note_en = coalesce(note_en, '“Avisar” is the everyday Argentine verb for giving someone a heads-up; “decir” works here too.')
where id = 'd4f2a771-2faa-5372-9f6a-3fb12a832abf' and es = 'Nunca avisaste que eras vegetariana.' and en = 'You never said you were vegetarian.'
  and not (es_alt && array['Nunca dijiste que eras vegetariana.', 'Nunca dijiste que eras vegetariano.']::text[]);

update public.sentences set es_alt = es_alt || array['Pagué el taxi con mi tarjeta.', 'Pagué el taxi con la tarjeta.']::text[], note_en = coalesce(note_en, '“Pagar con tarjeta” (to pay by card) is the set way to say it, with no “my” needed.')
where id = '229ab820-c630-5501-9bf8-5dbb0017cbc6' and es = 'Pagué el taxi con tarjeta.' and en = 'I paid for the taxi with my card.'
  and not (es_alt && array['Pagué el taxi con mi tarjeta.', 'Pagué el taxi con la tarjeta.']::text[]);

update public.sentences set es_alt = es_alt || array['Pagué en efectivo porque no andaba mi tarjeta.', 'Pagué en efectivo porque mi tarjeta no andaba.']::text[], note_en = coalesce(note_en, 'Spanish often says “la” instead of “mi” when it''s obvious whose thing it is.')
where id = '45b950a7-f4c2-5dfe-b3a4-922a1c5b1107' and es = 'Pagué en efectivo porque no andaba la tarjeta.' and en = 'I paid cash because my card wasn''t working.'
  and not (es_alt && array['Pagué en efectivo porque no andaba mi tarjeta.', 'Pagué en efectivo porque mi tarjeta no andaba.']::text[]);

update public.sentences set es_alt = es_alt || array['Te dije ayer.', 'Te lo dije ayer.']::text[], note_en = coalesce(note_en, '“Avisar” is the everyday Argentine verb for giving someone a heads-up; “decir” works here too.')
where id = 'a6fba56e-78f9-5db9-93ff-98b4f34bfc20' and es = 'Te avisé ayer.' and en = 'I told you yesterday.'
  and not (es_alt && array['Te dije ayer.', 'Te lo dije ayer.']::text[]);

update public.sentences set es_alt = es_alt || array['Ya le dije a mi hermana.', 'A mi hermana ya le dije.']::text[], note_en = coalesce(note_en, '“Avisar” is the everyday Argentine verb for giving someone a heads-up; “decir” works here too.')
where id = 'f9bc5597-7fed-5de1-8770-80c852e9d60a' and es = 'Ya le avisé a mi hermana.' and en = 'I already told my sister.'
  and not (es_alt && array['Ya le dije a mi hermana.', 'A mi hermana ya le dije.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Te enojaste? —No, me puse un poco celoso.']::text[]
where id = 'b5894986-ec33-5f57-883f-b94527bcb255' and es = '—¿Te enojaste? —No, me puse un poco celosa.' and en = '—Did you get angry? —No, I got a little jealous.'
  and not (es_alt && array['—¿Te enojaste? —No, me puse un poco celoso.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Qué contenta te pusiste!']::text[]
where id = 'd796c423-4626-56c6-bc7a-b7692e9f0be5' and es = '¡Qué contento te pusiste!' and en = 'You were so happy!'
  and not (es_alt && array['¡Qué contenta te pusiste!']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando viste a tu jefe te pusiste nerviosa, ¿no?', 'Te pusiste nerviosa cuando viste a tu jefe, ¿no?']::text[]
where id = 'c36dea78-36b0-5898-ae71-f7f9ad6094b4' and es = 'Cuando viste a tu jefe te pusiste nervioso, ¿no?' and en = 'When you saw your boss you got nervous, didn''t you?'
  and not (es_alt && array['Cuando viste a tu jefe te pusiste nerviosa, ¿no?', 'Te pusiste nerviosa cuando viste a tu jefe, ¿no?']::text[]);

update public.sentences set es_alt = es_alt || array['Me puse re contenta con tu mensaje.']::text[]
where id = '75cdedb7-82fe-51e8-8c6b-8f0c7256575e' and es = 'Me puse re contento con tu mensaje.' and en = 'I was so happy about your message.'
  and not (es_alt && array['Me puse re contenta con tu mensaje.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te olvidaste tus llaves?']::text[], note_en = coalesce(note_en, 'Spanish often says “las” instead of “tus” when it''s obvious whose thing it is.')
where id = 'ca43190c-82a8-5de9-8049-b23108ad058a' and es = '¿Te olvidaste las llaves?' and en = 'Did you forget your keys?'
  and not (es_alt && array['¿Te olvidaste tus llaves?']::text[]);

update public.sentences set es_alt = es_alt || array['Estaba tan apurada que me olvidé mi billetera.', 'Estaba tan apurado que me olvidé mi billetera.']::text[], note_en = coalesce(note_en, 'Spanish often says “la” instead of “mi” when it''s obvious whose thing it is.')
where id = 'b1e69583-0fcb-5208-abd3-70cfd400bc34' and es = 'Estaba tan apurada que me olvidé la billetera.' and en = 'I was in such a hurry that I forgot my wallet.'
  and not (es_alt && array['Estaba tan apurada que me olvidé mi billetera.', 'Estaba tan apurado que me olvidé mi billetera.']::text[]);

update public.sentences set es_alt = es_alt || array['Me olvidé mi celu.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” instead of “mi” when it''s obvious whose thing it is.')
where id = '2aa10694-944b-518f-bd40-15807785a8ab' and es = 'Me olvidé el celu.' and en = 'I forgot my phone.'
  and not (es_alt && array['Me olvidé mi celu.']::text[]);

update public.sentences set es_alt = es_alt || array['Me olvidé mis llaves en casa.']::text[], note_en = coalesce(note_en, 'Spanish often says “las” instead of “mis” when it''s obvious whose thing it is.')
where id = '0be3a657-fb4c-53c3-9939-e75e98165724' and es = 'Me olvidé las llaves en casa.' and en = 'I left my keys at home.'
  and not (es_alt && array['Me olvidé mis llaves en casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hermano se olvidó su mochila.']::text[], note_en = coalesce(note_en, 'Spanish often says “la” instead of “su” when it''s obvious whose thing it is.')
where id = '27a80fc9-ea40-5f72-9893-e33545e077bb' and es = 'Mi hermano se olvidó la mochila.' and en = 'My brother forgot his backpack.'
  and not (es_alt && array['Mi hermano se olvidó su mochila.']::text[]);

update public.sentences set es_alt = es_alt || array['Mica se olvidó de que hoy era feriado.']::text[], note_en = coalesce(note_en, 'In everyday speech Argentines often drop the “de” in “olvidarse de que”. Both are fine.')
where id = 'cce9214d-e130-5a91-aeb5-e47b1dfdd65b' and es = 'Mica se olvidó que hoy era feriado.' and en = 'Mica forgot that today was a holiday.'
  and not (es_alt && array['Mica se olvidó de que hoy era feriado.']::text[]);

update public.sentences set es_alt = es_alt || array['Te olvidaste tu paraguas en el bar.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” instead of “tu” when it''s obvious whose thing it is.')
where id = 'a46564fb-45c2-5534-ba1e-9a9d174585b5' and es = 'Te olvidaste el paraguas en el bar.' and en = 'You forgot your umbrella at the bar.'
  and not (es_alt && array['Te olvidaste tu paraguas en el bar.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Por qué estás colorada? —Me dio vergüenza.']::text[]
where id = '471af026-cb9e-5757-a18e-7e4d72cbe961' and es = '—¿Por qué estás colorado? —Me dio vergüenza.' and en = '—Why are you red? —I felt embarrassed.'
  and not (es_alt && array['—¿Por qué estás colorada? —Me dio vergüenza.']::text[]);

update public.sentences set es_alt = es_alt || array['Me olvidé de pagar la cuenta y me puse colorado.']::text[]
where id = '9012184b-95df-5df7-9252-d602c60ab5d2' and es = 'Me olvidé de pagar la cuenta y me puse colorada.' and en = 'I forgot to pay the check and turned red.'
  and not (es_alt && array['Me olvidé de pagar la cuenta y me puse colorado.']::text[]);

update public.sentences set es_alt = es_alt || array['Me olvidé del nombre de su novia y me puse colorada.']::text[]
where id = '7626ac74-7050-5e17-9444-db9dad2f014f' and es = 'Me olvidé del nombre de su novia y me puse colorado.' and en = 'I forgot his girlfriend''s name and turned red.'
  and not (es_alt && array['Me olvidé del nombre de su novia y me puse colorada.']::text[]);

update public.sentences set es_alt = es_alt || array['El mes que viene mis viejos y yo viajamos a Uruguay.', 'Mis viejos y yo viajamos a Uruguay el mes que viene.']::text[], note_en = coalesce(note_en, 'Argentines often say “viajamos con mis viejos” to mean “my parents and I are traveling”: the “we” already includes the speaker.')
where id = 'c36f9b77-62c1-5bbf-b129-ecc3361616fa' and es = 'El mes que viene viajamos a Uruguay con mis viejos.' and en = 'Next month my parents and I are traveling to Uruguay.'
  and not (es_alt && array['El mes que viene mis viejos y yo viajamos a Uruguay.', 'Mis viejos y yo viajamos a Uruguay el mes que viene.']::text[]);

update public.sentences set es_alt = es_alt || array['Hoy no tengo ganas de hacer nada.', 'No tengo ganas de hacer nada hoy.']::text[]
where id = '9029f590-c19b-523c-b06b-93eec7d7a410' and es = 'Hoy no tengo ganas de nada.' and en = 'I don''t feel like doing anything today.'
  and not (es_alt && array['Hoy no tengo ganas de hacer nada.', 'No tengo ganas de hacer nada hoy.']::text[]);

update public.sentences set es_alt = es_alt || array['Mica y yo queremos juntar plata para un auto.']::text[], note_en = coalesce(note_en, 'Argentines often say “Con Mica queremos…” to mean “Mica and I want…”: the “we” already includes the speaker.')
where id = 'b0ec04bb-ead4-51d1-bc0d-38ce6ff80a79' and es = 'Con Mica queremos juntar plata para un auto.' and en = 'Mica and I want to save up for a car.'
  and not (es_alt && array['Mica y yo queremos juntar plata para un auto.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Fuiste a las cataratas?', '¿Estuviste en las cataratas?', '¿Conocés las cataratas del Iguazú?']::text[], note_en = coalesce(note_en, 'Argentines use “conocer” for places: “¿Conocés…?” means “Have you been to…?”. And “las cataratas” on its own usually means Iguazú Falls.')
where id = '16fb3d75-ced2-547a-bd23-177523c82ee2' and es = '¿Conocés las cataratas?' and en = 'Have you been to Iguazú Falls?'
  and not (es_alt && array['¿Fuiste a las cataratas?', '¿Estuviste en las cataratas?', '¿Conocés las cataratas del Iguazú?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuántas horas son en micro hasta las cataratas del Iguazú?', '¿Cuántas horas son en micro hasta las cataratas de Iguazú?']::text[], note_en = coalesce(note_en, 'In Argentina “las cataratas” on its own usually means Iguazú Falls.')
where id = 'e94adf7c-1a95-504b-93c3-6afcd93906bd' and es = '¿Cuántas horas son en micro hasta las cataratas?' and en = 'How many hours is it by bus to Iguazú Falls?'
  and not (es_alt && array['¿Cuántas horas son en micro hasta las cataratas del Iguazú?', '¿Cuántas horas son en micro hasta las cataratas de Iguazú?']::text[]);

update public.sentences set es_alt = es_alt || array['Hay mucha gente en las cataratas del Iguazú.', 'Hay mucha gente en las cataratas de Iguazú.']::text[], note_en = coalesce(note_en, 'In Argentina “las cataratas” on its own usually means Iguazú Falls.')
where id = 'eee57de1-44ea-58fc-8d58-b4022864c9a2' and es = 'Hay mucha gente en las cataratas.' and en = 'There are a lot of people at Iguazú Falls.'
  and not (es_alt && array['Hay mucha gente en las cataratas del Iguazú.', 'Hay mucha gente en las cataratas de Iguazú.']::text[]);

update public.sentences set es_alt = es_alt || array['Queremos recorrer el norte y ver las cataratas.']::text[], note_en = coalesce(note_en, 'Argentines use “conocer” for seeing a place for the first time.')
where id = 'f64db5f8-dede-56fa-8e2f-a076d6d27831' and es = 'Queremos recorrer el norte y conocer las cataratas.' and en = 'We want to travel around the north and see the waterfalls.'
  and not (es_alt && array['Queremos recorrer el norte y ver las cataratas.']::text[]);

update public.sentences set es_alt = es_alt || array['Quiero viajar a Salta y a las cataratas del Iguazú.', 'Quiero viajar a Salta y a las cataratas de Iguazú.']::text[], note_en = coalesce(note_en, 'In Argentina “las cataratas” on its own usually means Iguazú Falls.')
where id = '2d78765c-99b4-551e-b661-6e4487daf46c' and es = 'Quiero viajar a Salta y a las cataratas.' and en = 'I want to travel to Salta and to Iguazú Falls.'
  and not (es_alt && array['Quiero viajar a Salta y a las cataratas del Iguazú.', 'Quiero viajar a Salta y a las cataratas de Iguazú.']::text[]);

update public.sentences set es_alt = es_alt || array['Sí, fui a las cataratas del Iguazú.', 'Sí, fui a las cataratas de Iguazú.']::text[], note_en = coalesce(note_en, 'In Argentina “las cataratas” on its own usually means Iguazú Falls.')
where id = '6732d835-4a25-55f7-8439-8179380c7ef5' and es = 'Sí, fui a las cataratas.' and en = 'Yes, I went to Iguazú Falls.'
  and not (es_alt && array['Sí, fui a las cataratas del Iguazú.', 'Sí, fui a las cataratas de Iguazú.']::text[]);

update public.sentences set es_alt = es_alt || array['Fui mochilero un año.']::text[]
where id = '78786eda-4dbf-5e9a-9504-13db5008735d' and es = 'Fui mochilera un año.' and en = 'I was a backpacker for a year.'
  and not (es_alt && array['Fui mochilero un año.']::text[]);

update public.sentences set es_alt = es_alt || array['Un mochilero nos contó que el lago estaba cerca.']::text[]
where id = 'c8932644-348f-508a-a7fa-17a7fc151e9a' and es = 'Una mochilera nos contó que el lago estaba cerca.' and en = 'A backpacker told us the lake was close.'
  and not (es_alt && array['Un mochilero nos contó que el lago estaba cerca.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Fuiste a este valle?', '¿Estuviste en este valle?']::text[], note_en = coalesce(note_en, 'Argentines use “conocer” for places: “¿Conocés…?” means “Have you been to…?”.')
where id = '78e21253-4e5a-5d95-950d-12e29392c588' and es = '¿Conocés este valle?' and en = 'Have you been to this valley?'
  and not (es_alt && array['¿Fuiste a este valle?', '¿Estuviste en este valle?']::text[]);

update public.sentences set es_alt = es_alt || array['Juan y yo nos mudamos a una casa con patio.']::text[], note_en = coalesce(note_en, 'Argentines often say “Con Juan nos mudamos…” to mean “Juan and I moved…”: the “we” already includes the speaker.')
where id = '137db4e3-39aa-5c99-acb2-8c05ff8ef6d7' and es = 'Con Juan nos mudamos a una casa con patio.' and en = 'Juan and I moved to a house with a yard.'
  and not (es_alt && array['Juan y yo nos mudamos a una casa con patio.']::text[]);

update public.sentences set es_alt = es_alt || array['Conocí a mi vecino en la panadería de la esquina.']::text[]
where id = '30bae693-baad-51c5-bbf3-0cb885a7b92c' and es = 'Conocí a mi vecina en la panadería de la esquina.' and en = 'I met my neighbor at the bakery on the corner.'
  and not (es_alt && array['Conocí a mi vecino en la panadería de la esquina.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando era chico, nos mudamos a Montevideo.', 'Cuando era chica, nos mudamos a Montevideo.', 'De chica nos mudamos a Montevideo.']::text[], note_en = coalesce(note_en, '“De chico” / “de chica” is the short everyday way to say “when I was a kid”.')
where id = '48905013-06c2-58f7-a48f-38c5f43a6e71' and es = 'De chico nos mudamos a Montevideo.' and en = 'When I was a kid, we moved to Montevideo.'
  and not (es_alt && array['Cuando era chico, nos mudamos a Montevideo.', 'Cuando era chica, nos mudamos a Montevideo.', 'De chica nos mudamos a Montevideo.']::text[]);

update public.sentences set es_alt = es_alt || array['El sábado me mudo, ¿me prestás tu auto?']::text[], note_en = coalesce(note_en, 'Argentines often ask for a favor with the plain present: “¿Me prestás…?” already means “Can you lend me…?”.')
where id = 'ecddb85d-0a75-5432-8f52-56e261dffde6' and es = 'El sábado me mudo, ¿me prestás el auto?' and en = 'I''m moving on Saturday, can you lend me your car?'
  and not (es_alt && array['El sábado me mudo, ¿me prestás tu auto?']::text[]);

update public.sentences set es_alt = es_alt || array['Hola, vecino, ¿todo bien?']::text[]
where id = '9465b947-68ae-5ec7-98c9-0cd357534ef2' and es = 'Hola, vecina, ¿todo bien?' and en = 'Hi, neighbor, all good?'
  and not (es_alt && array['Hola, vecino, ¿todo bien?']::text[]);

update public.sentences set es_alt = es_alt || array['El vecino de al lado es médico.']::text[]
where id = '90df5fb5-257b-5ed2-953c-32e6ca4ada99' and es = 'La vecina de al lado es médica.' and en = 'The neighbor next door is a doctor.'
  and not (es_alt && array['El vecino de al lado es médico.']::text[]);

update public.sentences set es_alt = es_alt || array['El vecino de enfrente es re copado.']::text[]
where id = '5bd7c217-d1d8-5200-812f-482a3eaa1d58' and es = 'La vecina de enfrente es re copada.' and en = 'The neighbor across the street is really cool.'
  and not (es_alt && array['El vecino de enfrente es re copado.']::text[]);

update public.sentences set es_alt = es_alt || array['Me mudo solo, por fin.', 'Por fin me mudo solo.']::text[]
where id = 'a934f374-d652-5005-9578-86108a582e16' and es = 'Me mudo sola, por fin.' and en = 'I''m moving alone, finally.'
  and not (es_alt && array['Me mudo solo, por fin.', 'Por fin me mudo solo.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi vecino se mudó.']::text[]
where id = 'fb20c659-2924-5176-bf7e-17c0a48ade53' and es = 'Mi vecina se mudó.' and en = 'My neighbor moved.'
  and not (es_alt && array['Mi vecino se mudó.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar a pintar?']::text[], note_en = coalesce(note_en, 'Argentines often ask for a favor with the plain present: “¿Me ayudás…?” already means “Can you help me…?”.')
where id = '9aa7e008-3a0d-5d31-b82c-e204ee63b938' and es = '¿Me ayudás a pintar?' and en = 'Can you help me paint?'
  and not (es_alt && array['¿Me podés ayudar a pintar?']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando alquilaba con amigos, extrañaba tener mi propia pieza.', 'Cuando alquilaba con amigos, extrañaba tener mi pieza propia.']::text[]
where id = 'b53909fa-3f96-5149-980f-55592ed7c298' and es = 'Cuando alquilaba con amigos, extrañaba tener mi pieza.' and en = 'When I rented with friends, I missed having my own room.'
  and not (es_alt && array['Cuando alquilaba con amigos, extrañaba tener mi propia pieza.', 'Cuando alquilaba con amigos, extrañaba tener mi pieza propia.']::text[]);

update public.sentences set es_alt = es_alt || array['Extrañaba el balcón de mi depto viejo.']::text[]
where id = 'c85aef15-b6b0-56d9-905d-c7d757b7a70f' and es = 'Extrañaba el balcón del depto viejo.' and en = 'I missed the balcony at my old apartment.'
  and not (es_alt && array['Extrañaba el balcón de mi depto viejo.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi primo alquilaba en el centro.']::text[]
where id = '58525189-6894-5db1-8abf-0199b0ba461c' and es = 'Mi prima alquilaba en el centro.' and en = 'My cousin rented downtown.'
  and not (es_alt && array['Mi primo alquilaba en el centro.']::text[]);

update public.sentences set es_alt = es_alt || array['El alquiler es carísimo.']::text[], note_en = coalesce(note_en, '“Está carísimo” stresses how expensive it is right now; “es carísimo” is also correct.')
where id = '9ed28f10-467e-545d-9f50-b4b98c4150c2' and es = 'El alquiler está carísimo.' and en = 'Rent is super expensive.'
  and not (es_alt && array['El alquiler es carísimo.']::text[]);

update public.sentences set es_alt = es_alt || array['A los quince me enamoré de un compañero.', 'Me enamoré de un compañero a los quince.']::text[]
where id = '3e5c8834-f29f-5549-9180-bb23500ca0ef' and es = 'A los quince me enamoré de una compañera.' and en = 'At fifteen I fell in love with a classmate.'
  and not (es_alt && array['A los quince me enamoré de un compañero.', 'Me enamoré de un compañero a los quince.']::text[]);

update public.sentences set es_alt = es_alt || array['Mica y yo nos pusimos a juntar plata para el viaje.']::text[], note_en = coalesce(note_en, 'Argentines often say “Con Mica nos pusimos…” to mean “Mica and I started…”: the “we” already includes the speaker.')
where id = '55cc55cd-8083-5f2a-81da-dc675954e7a9' and es = 'Con Mica nos pusimos a juntar plata para el viaje.' and en = 'Mica and I started saving up for the trip.'
  and not (es_alt && array['Mica y yo nos pusimos a juntar plata para el viaje.']::text[]);

update public.sentences set es_alt = es_alt || array['De chico quería vivir cerca del mar, y algún día voy a mudarme.', 'De chico quería vivir cerca del mar, y voy a mudarme algún día.']::text[]
where id = '545d5aff-4c68-577d-a637-c6690aebd3e0' and es = 'De chica quería vivir cerca del mar, y algún día voy a mudarme.' and en = 'As a kid I wanted to live near the sea, and some day I''m going to move.'
  and not (es_alt && array['De chico quería vivir cerca del mar, y algún día voy a mudarme.', 'De chico quería vivir cerca del mar, y voy a mudarme algún día.']::text[]);

update public.sentences set es_alt = es_alt || array['De chico vivía a dos cuadras del mar.']::text[]
where id = '274a5cfc-a152-5939-9f9a-0bf1f7cddea6' and es = 'De chica vivía a dos cuadras del mar.' and en = 'As a kid I lived two blocks from the ocean.'
  and not (es_alt && array['De chico vivía a dos cuadras del mar.']::text[]);

update public.sentences set es_alt = es_alt || array['Tomé el bondi porque llovía.', 'Me tomé el bondi porque llovía.']::text[]
where id = 'b83f9700-5a2f-5ca1-9fba-c438222e05dd' and es = 'Fui en bondi porque llovía.' and en = 'I took the bus because it was raining.'
  and not (es_alt && array['Tomé el bondi porque llovía.', 'Me tomé el bondi porque llovía.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuelo vino de Italia y algún día quiero ver su pueblo.', 'Mi abuelo vino de Italia y quiero ver su pueblo algún día.']::text[], note_en = coalesce(note_en, 'Argentines use “conocer” for seeing a place for the first time.')
where id = 'b6ff813b-72fd-5dc6-b10b-b79ff0cb02a9' and es = 'Mi abuelo vino de Italia y algún día quiero conocer su pueblo.' and en = 'My grandfather came from Italy and some day I want to see his town.'
  and not (es_alt && array['Mi abuelo vino de Italia y algún día quiero ver su pueblo.', 'Mi abuelo vino de Italia y quiero ver su pueblo algún día.']::text[]);

update public.sentences set es_alt = es_alt || array['Vivía con dos amigos, se mudaron y ahora voy a alquilar solo.']::text[]
where id = '40436cfc-1911-5e25-9ea1-8fec47605c70' and es = 'Vivía con dos amigos, se mudaron y ahora voy a alquilar sola.' and en = 'I lived with two friends, they moved out, and now I''m going to rent on my own.'
  and not (es_alt && array['Vivía con dos amigos, se mudaron y ahora voy a alquilar solo.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué te parece a las nueve?']::text[], note_en = coalesce(note_en, '“¿Te parece…?” is a very common Argentine way to suggest a time or a plan.')
where id = '6a6d6157-da68-51f3-ba76-0109c8a27448' and es = '¿Te parece a las nueve?' and en = 'How about at nine?'
  and not (es_alt && array['¿Qué te parece a las nueve?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Creés que Santi está enojado conmigo?', '¿Pensás que Santi está enojado conmigo?']::text[]
where id = 'e4bfa99f-3ab2-5e32-85bf-d5a129f7239e' and es = '¿Te parece que Santi está enojado conmigo?' and en = 'Do you think Santi''s angry with me?'
  and not (es_alt && array['¿Creés que Santi está enojado conmigo?', '¿Pensás que Santi está enojado conmigo?']::text[]);

update public.sentences set es_alt = es_alt || array['El centro me queda lejos, pero tomo el subte.', 'El centro me queda lejos, pero me tomo el subte.']::text[]
where id = 'fa006a47-795e-5e15-86e2-694aa3789f27' and es = 'El centro me queda lejos, pero voy en subte.' and en = 'Downtown is far for me, but I take the subway.'
  and not (es_alt && array['El centro me queda lejos, pero tomo el subte.', 'El centro me queda lejos, pero me tomo el subte.']::text[]);

update public.sentences set es_alt = es_alt || array['La facu queda cerca de mi casa.', 'La facu está cerca de mi casa.']::text[], note_en = coalesce(note_en, '“Me queda cerca” is an everyday way to say something is close to where you are or live.')
where id = 'b6b70640-f0ed-5fd5-b61b-d0ec9b90638d' and es = 'La facu me queda cerca.' and en = 'College is close to my place.'
  and not (es_alt && array['La facu queda cerca de mi casa.', 'La facu está cerca de mi casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Almagro está al lado de Caballito.']::text[], note_en = coalesce(note_en, 'For where a place is, Argentines often use “queda” instead of “está”. Both are right.')
where id = 'ce685091-1997-535a-84d1-732d689c17d4' and es = 'Almagro queda al lado de Caballito.' and en = 'Almagro is next to Caballito.'
  and not (es_alt && array['Almagro está al lado de Caballito.']::text[]);

update public.sentences set es_alt = es_alt || array['No conozco muy bien zona sur.', 'No conozco mucho zona sur.']::text[]
where id = '025cc4e3-6794-5fb5-875a-12e7956b2a66' and es = 'Conozco poco zona sur.' and en = 'I don''t know the southern suburbs very well.'
  and not (es_alt && array['No conozco muy bien zona sur.', 'No conozco mucho zona sur.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Me olvidé de que vivías acá!', '¡Me olvidé que vivías acá!']::text[], note_en = coalesce(note_en, 'Argentines often say “no me acordaba” (I didn''t remember) where English says “I forgot”.')
where id = '49d3ebdf-a2af-5c2f-a9f3-a23d35bbca78' and es = '¡No me acordaba de que vivías acá!' and en = 'I forgot you lived here!'
  and not (es_alt && array['¡Me olvidé de que vivías acá!', '¡Me olvidé que vivías acá!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te acordás de su nombre?', '¿Te acordás de cómo se llama?']::text[]
where id = '39b520b4-610d-520b-adb3-7da94863b598' and es = '¿Te acordás cómo se llama?' and en = 'Do you remember his name?'
  and not (es_alt && array['¿Te acordás de su nombre?', '¿Te acordás de cómo se llama?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, me olvidé de que hoy era el partido.', 'Che, me olvidé que hoy era el partido.']::text[], note_en = coalesce(note_en, 'Argentines often say “no me acordaba” (I didn''t remember) where English says “I forgot”.')
where id = 'ae725888-d97d-5082-8c4e-ad82968ba979' and es = 'Che, no me acordaba de que hoy era el partido.' and en = 'Hey, I forgot the game was today.'
  and not (es_alt && array['Che, me olvidé de que hoy era el partido.', 'Che, me olvidé que hoy era el partido.']::text[]);

update public.sentences set es_alt = es_alt || array['Belén y yo todavía nos acordamos de ese viaje.']::text[], note_en = coalesce(note_en, 'Argentines often say “con Belén” plus a “we” verb to mean “Belén and I”.')
where id = '150c9b88-dcb8-5d39-9dc0-8c883c021309' and es = 'Con Belén todavía nos acordamos de ese viaje.' and en = 'Belén and I still remember that trip.'
  and not (es_alt && array['Belén y yo todavía nos acordamos de ese viaje.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando era chico no teníamos compu.', 'Cuando era chica no teníamos compu.', 'No teníamos compu cuando era chico.', 'No teníamos compu cuando era chica.']::text[]
where id = '5dcf4180-d6d2-5580-b464-163b1b63c1c0' and es = 'En mi infancia no teníamos compu.' and en = 'We didn''t have a computer when I was a kid.'
  and not (es_alt && array['Cuando era chico no teníamos compu.', 'Cuando era chica no teníamos compu.', 'No teníamos compu cuando era chico.', 'No teníamos compu cuando era chica.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi viejo todavía tiene el álbum de cuando era chico.', 'Mi viejo todavía tiene su álbum de cuando era chico.']::text[]
where id = '0ff15def-1fb7-520c-bc01-d8cd9f9e18aa' and es = 'Mi viejo todavía tiene el álbum de su infancia.' and en = 'My dad still has his sticker album from when he was a kid.'
  and not (es_alt && array['Mi viejo todavía tiene el álbum de cuando era chico.', 'Mi viejo todavía tiene su álbum de cuando era chico.']::text[]);

update public.sentences set es_alt = es_alt || array['Pensamos mucho en vos.']::text[], note_en = coalesce(note_en, '“Acordarse de alguien” is a warm way to say someone comes to mind.')
where id = '772d8b4c-88c1-55ad-a668-12868f3e0034' and es = 'Nos acordamos mucho de vos.' and en = 'We think about you a lot.'
  and not (es_alt && array['Pensamos mucho en vos.']::text[]);

update public.sentences set es_alt = es_alt || array['No veíamos mucho a los abuelos porque vivían lejos.', 'No veíamos mucho a nuestros abuelos porque vivían lejos.']::text[]
where id = '09cc6fe8-0712-50ab-8846-c1a51aacd107' and es = 'Veíamos poco a los abuelos porque vivían lejos.' and en = 'We didn''t see our grandparents much because they lived far away.'
  and not (es_alt && array['No veíamos mucho a los abuelos porque vivían lejos.', 'No veíamos mucho a nuestros abuelos porque vivían lejos.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Ah, ahora me acuerdo!']::text[], note_en = coalesce(note_en, 'When something suddenly comes back to you, Argentines often say “me acordé” (it just came to me).')
where id = 'e15c606c-eb6f-5c50-ba4b-393d50e96562' and es = '¡Ah, ahora me acordé!' and en = 'Oh, now I remember!'
  and not (es_alt && array['¡Ah, ahora me acuerdo!']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Me podés ayudar? —¡Obvio!']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '13f35539-ca1f-5cc6-9d5b-8c03a0ce7af4' and es = '—¿Me ayudás? —¡Obvio!' and en = '—Can you help me? —Of course!'
  and not (es_alt && array['—¿Me podés ayudar? —¡Obvio!']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Me podés hacer un favor? —¡Obvio!']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '2937ac36-f148-56b9-bd52-e7868b1fd72a' and es = '—¿Me hacés un favor? —¡Obvio!' and en = '—Can you do me a favor? —Of course!'
  and not (es_alt && array['—¿Me podés hacer un favor? —¡Obvio!']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Me podés hacer un favor? —Ahora no puedo, estoy laburando.']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = 'cbebe0fe-5ec5-5ae6-9303-1990f90e2bc5' and es = '—¿Me hacés un favor? —Ahora no puedo, estoy laburando.' and en = '—Can you do me a favor? —I can''t right now, I''m working.'
  and not (es_alt && array['—¿Me podés hacer un favor? —Ahora no puedo, estoy laburando.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Te puedo ayudar? —No, gracias.']::text[], note_en = coalesce(note_en, '“¿Te ayudo?” is the quick, natural way Argentines offer help.')
where id = 'f2be2124-7eb2-5fe6-96ad-08a878cd1b7b' and es = '—¿Te ayudo? —No, gracias.' and en = '—Can I help you? —No, thanks.'
  and not (es_alt && array['—¿Te puedo ayudar? —No, gracias.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar a cocinar?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = 'e0d7e7fe-d5f5-502e-b01f-245ee6492655' and es = '¿Me ayudás a cocinar?' and en = 'Can you help me cook?'
  and not (es_alt && array['¿Me podés ayudar a cocinar?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar a ordenar el living antes de la juntada?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '0022bed0-05dc-5c3d-9810-edf0e4d85390' and es = '¿Me ayudás a ordenar el living antes de la juntada?' and en = 'Can you help me tidy the living room before the get-together?'
  and not (es_alt && array['¿Me podés ayudar a ordenar el living antes de la juntada?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar con la tarea?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '3a643dcc-8237-5625-930b-23b8fc2ddbeb' and es = '¿Me ayudás con la tarea?' and en = 'Can you help me with the homework?'
  and not (es_alt && array['¿Me podés ayudar con la tarea?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar con las cajas?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = 'd1ce2e4c-4172-5eac-a749-234db87debd2' and es = '¿Me ayudás con las cajas?' and en = 'Can you help me with the boxes?'
  and not (es_alt && array['¿Me podés ayudar con las cajas?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés hacer el favor de llegar puntual una vez?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = 'c7cf2fbc-ed96-5585-b9f2-f64b76c43791' and es = '¿Me hacés el favor de llegar puntual una vez?' and en = 'Can you do me the favor of arriving on time for once?'
  and not (es_alt && array['¿Me podés hacer el favor de llegar puntual una vez?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés hacer un favor y me pasás la sal?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = 'f1f8568f-fa53-5deb-b7a7-d5dda8a36902' and es = '¿Me hacés un favor y me pasás la sal?' and en = 'Can you do me a favor and pass me the salt?'
  and not (es_alt && array['¿Me podés hacer un favor y me pasás la sal?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés hacer un favor?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '2dc99f45-ab38-511d-b066-c85b47f8194d' and es = '¿Me hacés un favor?' and en = 'Can you do me a favor?'
  and not (es_alt && array['¿Me podés hacer un favor?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés pasar el agua?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '7c0487e3-0304-5385-a338-57a51e7d2ffe' and es = '¿Me pasás el agua?' and en = 'Can you pass me the water?'
  and not (es_alt && array['¿Me podés pasar el agua?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés pasar el cargador, porfa?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = 'fd42f69c-25cb-5adc-9acd-04ec4fe01908' and es = '¿Me pasás el cargador, porfa?' and en = 'Can you pass me the charger, please?'
  and not (es_alt && array['¿Me podés pasar el cargador, porfa?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés pasar el pan?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '718950b7-e433-5ee0-b130-51c6d5564485' and es = '¿Me pasás el pan?' and en = 'Can you pass me the bread?'
  and not (es_alt && array['¿Me podés pasar el pan?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés pasar la sal?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '3553f659-8f7b-59a6-9b2b-1fb314d138d6' and es = '¿Me pasás la sal?' and en = 'Can you pass me the salt?'
  and not (es_alt && array['¿Me podés pasar la sal?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés pasar las papas fritas?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '77b45ffa-1289-5eec-9d26-c99efd5ba148' and es = '¿Me pasás las papas fritas?' and en = 'Can you pass me the fries?'
  and not (es_alt && array['¿Me podés pasar las papas fritas?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés pasar un vaso?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '98527a46-da58-557b-9e11-26d2faf06c8f' and es = '¿Me pasás un vaso?' and en = 'Can you pass me a glass?'
  and not (es_alt && array['¿Me podés pasar un vaso?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Podés traer pan para el asado?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '6d342b4b-6f79-5542-beda-420875a9cea2' and es = '¿Traés pan para el asado?' and en = 'Can you bring bread for the asado?'
  and not (es_alt && array['¿Podés traer pan para el asado?']::text[]);

update public.sentences set es_alt = es_alt || array['Alcanzame el cargador, está al lado tuyo.']::text[], note_en = coalesce(note_en, 'Argentines often link a request to its reason with a little “que”, something like “because”.')
where id = '6d2d9fe7-a52c-5e79-9e90-0260ff51f429' and es = 'Alcanzame el cargador, que está al lado tuyo.' and en = 'Hand me the charger, it''s right next to you.'
  and not (es_alt && array['Alcanzame el cargador, está al lado tuyo.']::text[]);

update public.sentences set es_alt = es_alt || array['Alcanzame el celu, me llama mi jefa.']::text[], note_en = coalesce(note_en, 'Argentines often link a request to its reason with a little “que”, something like “because”.')
where id = '615c6fee-38c6-5163-a046-cd6cd3faf0e0' and es = 'Alcanzame el celu, que me llama mi jefa.' and en = 'Hand me my cell phone, my boss is calling me.'
  and not (es_alt && array['Alcanzame el celu, me llama mi jefa.']::text[]);

update public.sentences set es_alt = es_alt || array['Alcanzame la billetera, pago yo.']::text[], note_en = coalesce(note_en, 'Argentines often link a request to its reason with a little “que”, something like “because”.')
where id = '3bc36e6d-8ab2-54c7-ac48-d9087b0d4e68' and es = 'Alcanzame la billetera, que pago yo.' and en = 'Hand me my wallet, I''m paying.'
  and not (es_alt && array['Alcanzame la billetera, pago yo.']::text[]);

update public.sentences set es_alt = es_alt || array['Ana, ¿me podés pasar el azúcar para el café?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = 'fac2d181-aa6b-5eee-9ea9-a0e12478a957' and es = 'Ana, ¿me pasás el azúcar para el café?' and en = 'Ana, can you pass me the sugar for the coffee?'
  and not (es_alt && array['Ana, ¿me podés pasar el azúcar para el café?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, ¿me podés ayudar un momento?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '8193e052-282d-5265-8f21-aeb3f073bdd3' and es = 'Che, ¿me ayudás un momento?' and en = 'Hey, can you help me for a moment?'
  and not (es_alt && array['Che, ¿me podés ayudar un momento?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, ¿me podés pasar el mate?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '1605cd56-57af-5d6f-811a-923db89fac2d' and es = 'Che, ¿me pasás el mate?' and en = 'Hey, can you pass me the mate?'
  and not (es_alt && array['Che, ¿me podés pasar el mate?']::text[]);

update public.sentences set es_alt = es_alt || array['Claro.', 'Por supuesto.']::text[], note_en = coalesce(note_en, '“Claro que sí” is “claro” with extra enthusiasm; both mean “of course”.')
where id = 'b343025f-e79f-58f0-adb3-79c4ab9948d0' and es = 'Claro que sí.' and en = 'Of course.'
  and not (es_alt && array['Claro.', 'Por supuesto.']::text[]);

update public.sentences set es_alt = es_alt || array['Pasame el azúcar, el café está amargo.']::text[], note_en = coalesce(note_en, 'Argentines often link a request to its reason with a little “que”, something like “because”.')
where id = 'a7fbca1b-bcfd-53da-ab16-5df825b1825a' and es = 'Pasame el azúcar, que el café está amargo.' and en = 'Pass me the sugar, the coffee is bitter.'
  and not (es_alt && array['Pasame el azúcar, el café está amargo.']::text[]);

update public.sentences set es_alt = es_alt || array['Pasame la mochila, porfa, me voy.', 'Pasame mi mochila, porfa, me voy.']::text[], note_en = coalesce(note_en, 'Argentines often link a request to its reason with a little “que”, something like “because”.')
where id = 'ed09275e-5131-51fd-b288-7dcda802e049' and es = 'Pasame la mochila, porfa, que me voy.' and en = 'Pass me my backpack, please, I''m leaving.'
  and not (es_alt && array['Pasame la mochila, porfa, me voy.', 'Pasame mi mochila, porfa, me voy.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Me podés llevar al médico? —Sí, obvio.']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '4ebb211f-4cb5-5e23-8b89-fb0d30e8358a' and es = '—¿Me llevás al médico? —Sí, obvio.' and en = '—Can you take me to the doctor? —Yes, of course.'
  and not (es_alt && array['—¿Me podés llevar al médico? —Sí, obvio.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés dar una mano con las compras del súper?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '949e28a3-f7df-5a0c-90ba-989027858298' and es = '¿Me das una mano con las compras del súper?' and en = 'Can you give me a hand with the groceries from the supermarket?'
  and not (es_alt && array['¿Me podés dar una mano con las compras del súper?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés llevar a casa?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = 'fd5b609b-7057-5e08-b9c4-3e65dc7d6be7' and es = '¿Me llevás a casa?' and en = 'Can you give me a ride home?'
  and not (es_alt && array['¿Me podés llevar a casa?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés llevar al centro?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '6153ff37-da2d-5c21-a02e-ea23b9db9533' and es = '¿Me llevás al centro?' and en = 'Can you take me downtown?'
  and not (es_alt && array['¿Me podés llevar al centro?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés traer pan de paso?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '208a8c82-e2a8-5a95-bda4-cc9e4bfd9dc9' and es = '¿Me traés pan de paso?' and en = 'Can you bring me some bread on your way?'
  and not (es_alt && array['¿Me podés traer pan de paso?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Nos podés llevar a la estación?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '981b4424-c926-5ac6-a91f-d36d6cc41f09' and es = '¿Nos llevás a la estación?' and en = 'Can you take us to the station?'
  and not (es_alt && array['¿Nos podés llevar a la estación?']::text[]);

update public.sentences set es_alt = es_alt || array['Dame una mano con las cajas, llegó el flete.']::text[], note_en = coalesce(note_en, 'Argentines often link a request to its reason with a little “que”, something like “because”.')
where id = 'ed5a88b0-bec6-5ef5-8a13-38bd824cea55' and es = 'Dame una mano con las cajas, que llegó el flete.' and en = 'Give me a hand with the boxes, the moving truck has arrived.'
  and not (es_alt && array['Dame una mano con las cajas, llegó el flete.']::text[]);

update public.sentences set es_alt = es_alt || array['De paso, ¿podés sacar la basura?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '838ea61c-6fcc-5210-9df1-256391b2bdc1' and es = 'De paso, ¿sacás la basura?' and en = 'While you''re at it, can you take out the trash?'
  and not (es_alt && array['De paso, ¿podés sacar la basura?']::text[]);

update public.sentences set es_alt = es_alt || array['Dejame en la esquina y de ahí camino.', 'Dejame en la esquina y camino de ahí.']::text[]
where id = '4f919e4b-85cd-52eb-960e-1c51b372f38b' and es = 'Llevame hasta la esquina y de ahí camino.' and en = 'Drop me off at the corner and I''ll walk from there.'
  and not (es_alt && array['Dejame en la esquina y de ahí camino.', 'Dejame en la esquina y camino de ahí.']::text[]);

update public.sentences set es_alt = es_alt || array['Papá, ¿nos podés llevar a la facu?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '8f8261e0-824d-55a7-8e8f-97f1aca7d552' and es = 'Papá, ¿nos llevás a la facu?' and en = 'Dad, can you take us to college?'
  and not (es_alt && array['Papá, ¿nos podés llevar a la facu?']::text[]);

update public.sentences set es_alt = es_alt || array['Perdimos el último bondi, ¿nos podés llevar a casa?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = 'd8a4c8a2-69b3-5615-89e0-8b3940fc18e8' and es = 'Perdimos el último bondi, ¿nos llevás a casa?' and en = 'We missed the last bus, can you take us home?'
  and not (es_alt && array['Perdimos el último bondi, ¿nos podés llevar a casa?']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo el auto roto, ¿me podés llevar al laburo?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '34a8af2b-705b-598e-86d4-2220522378b4' and es = 'Tengo el auto roto, ¿me llevás al laburo?' and en = 'My car''s broken down, can you give me a ride to work?'
  and not (es_alt && array['Tengo el auto roto, ¿me podés llevar al laburo?']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Me podés regar la planta? —Sí, ¿dónde está?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '94f9fe89-8f3d-5ce0-ad04-800b728ce694' and es = '—¿Me regás la planta? —Sí, ¿dónde está?' and en = '—Can you water the plant for me? —Yes, where is it?'
  and not (es_alt && array['—¿Me podés regar la planta? —Sí, ¿dónde está?']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Me podés regar las plantas? —Dale, ¿cuándo te vas?', '—¿Podés regar mis plantas? —Dale, ¿cuándo te vas?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = 'dc136538-b79d-56d3-872e-6609058009c5' and es = '—¿Me regás las plantas? —Dale, ¿cuándo te vas?' and en = '—Can you water my plants? —Sure, when are you leaving?'
  and not (es_alt && array['—¿Me podés regar las plantas? —Dale, ¿cuándo te vas?', '—¿Podés regar mis plantas? —Dale, ¿cuándo te vas?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenemos que regar hoy?', '¿Hoy tenemos que regar?']::text[], note_en = coalesce(note_en, '“Hay que” means something needs doing, without saying who does it. Argentines use it all the time.')
where id = 'd79003f4-1164-577d-b2ed-fa104d5721d7' and es = '¿Hay que regar hoy?' and en = 'Do we need to water today?'
  and not (es_alt && array['¿Tenemos que regar hoy?', '¿Hoy tenemos que regar?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar a regar las plantas del patio?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = 'e1c09504-615e-51b8-b73d-ff00e0398b31' and es = '¿Me ayudás a regar las plantas del patio?' and en = 'Can you help me water the plants on the patio?'
  and not (es_alt && array['¿Me podés ayudar a regar las plantas del patio?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar a subir el colchón?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '1448723b-0b8e-58b8-8865-0d24c620fd45' and es = '¿Me ayudás a subir el colchón?' and en = 'Can you help me carry the mattress up?'
  and not (es_alt && array['¿Me podés ayudar a subir el colchón?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar a subir las cajas?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '54f7820c-26f1-5453-a3c2-70965363e1eb' and es = '¿Me ayudás a subir las cajas?' and en = 'Can you help me carry the boxes up?'
  and not (es_alt && array['¿Me podés ayudar a subir las cajas?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés dar una mano para subir el sillón?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = 'ed1cbcf0-cc05-5fb7-b72a-28a561e9f1b0' and es = '¿Me das una mano para subir el sillón?' and en = 'Can you give me a hand carrying the couch up?'
  and not (es_alt && array['¿Me podés dar una mano para subir el sillón?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés llevar la planta hasta el auto?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = 'ba91c57d-7189-51e3-abba-d31930e70bc1' and es = '¿Me llevás la planta hasta el auto?' and en = 'Can you take the plant to the car for me?'
  and not (es_alt && array['¿Me podés llevar la planta hasta el auto?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés regar las plantas?', '¿Podés regar mis plantas?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = 'a416077a-6625-5eb6-a2fd-f544ef886d1a' and es = '¿Me regás las plantas?' and en = 'Can you water my plants?'
  and not (es_alt && array['¿Me podés regar las plantas?', '¿Podés regar mis plantas?']::text[]);

update public.sentences set es_alt = es_alt || array['De paso, ¿me podés comprar algo para las plantas?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = 'f0f0f777-9f7f-54bc-a1d9-dbac366ff981' and es = 'De paso, ¿me comprás algo para las plantas?' and en = 'While you''re at it, can you buy me something for the plants?'
  and not (es_alt && array['De paso, ¿me podés comprar algo para las plantas?']::text[]);

update public.sentences set es_alt = es_alt || array['Hay tormenta, ¿me podés ayudar a entrar las plantas?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '833e6fff-50ef-5523-8e7c-69111e0c6799' and es = 'Hay tormenta, ¿me ayudás a entrar las plantas?' and en = 'There''s a storm, can you help me bring the plants in?'
  and not (es_alt && array['Hay tormenta, ¿me podés ayudar a entrar las plantas?']::text[]);

update public.sentences set es_alt = es_alt || array['Me voy el finde, ¿me podés regar las plantas?', 'Me voy el finde, ¿podés regar mis plantas?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = 'afb8e965-0b43-5fd2-b53b-7afe9e338e91' and es = 'Me voy el finde, ¿me regás las plantas?' and en = 'I''m away this weekend, can you water my plants?'
  and not (es_alt && array['Me voy el finde, ¿me podés regar las plantas?', 'Me voy el finde, ¿podés regar mis plantas?']::text[]);

update public.sentences set es_alt = es_alt || array['Prendé la tele, empieza el partido.']::text[], note_en = coalesce(note_en, 'Argentines often link a request to its reason with a little “que”, something like “because”.')
where id = '5b21854d-9b32-5b97-972b-97b12738ecfe' and es = 'Prendé la tele, que empieza el partido.' and en = 'Turn on the TV, the game''s starting.'
  and not (es_alt && array['Prendé la tele, empieza el partido.']::text[]);

update public.sentences set es_alt = es_alt || array['Santi, ¿me podés regar la planta del balcón?', 'Santi, ¿podés regar la planta del balcón?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '1744b919-88ef-55c3-a439-6ec685e35a5c' and es = 'Santi, ¿me regás la planta del balcón?' and en = 'Santi, can you water the plant on the balcony?'
  and not (es_alt && array['Santi, ¿me podés regar la planta del balcón?', 'Santi, ¿podés regar la planta del balcón?']::text[]);

update public.sentences set es_alt = es_alt || array['¡Qué chico!']::text[], note_en = coalesce(note_en, '“Chiquito” is the everyday, affectionate form of “chico” (small); both are right.')
where id = '7bee0b1a-6ed6-5555-943f-a344a477f521' and es = '¡Qué chiquito!' and en = 'How small!'
  and not (es_alt && array['¡Qué chico!']::text[]);

update public.sentences set es_alt = es_alt || array['¿La pieza es chica?', '¿Es chica la pieza?']::text[], note_en = coalesce(note_en, '“Chiquito” is the everyday, affectionate form of “chico” (small); both are right.')
where id = '4b5d6366-00d1-5004-b973-86e3c4b867c6' and es = '¿La pieza es chiquita?' and en = 'Is the bedroom small?'
  and not (es_alt && array['¿La pieza es chica?', '¿Es chica la pieza?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me esperás un rato?', '¿Me podés esperar un ratito?', '¿Me podés esperar un rato?']::text[], note_en = coalesce(note_en, '“Un ratito” makes the wait sound short and the request softer.')
where id = '70b5a0d7-483f-5388-bcea-f416b725291b' and es = '¿Me esperás un ratito?' and en = 'Can you wait for me for a bit?'
  and not (es_alt && array['¿Me esperás un rato?', '¿Me podés esperar un ratito?', '¿Me podés esperar un rato?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Podés hablar más despacio?']::text[], note_en = coalesce(note_en, '“Despacito” is “despacio” said gently; it makes the request sound kinder.')
where id = 'a5c690ed-c951-5a25-8582-f55251f4c95b' and es = '¿Podés hablar más despacito?' and en = 'Can you speak more slowly?'
  and not (es_alt && array['¿Podés hablar más despacio?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Podés hablar un rato o estás ocupado?', '¿Podés hablar un rato o estás ocupada?']::text[], note_en = coalesce(note_en, '“Un ratito” makes it sound like you won''t take much of their time.')
where id = '416ff929-10dd-5e17-ae82-1d8ac77c479f' and es = '¿Podés hablar un ratito o estás ocupado?' and en = 'Can you talk for a bit, or are you busy?'
  and not (es_alt && array['¿Podés hablar un rato o estás ocupado?', '¿Podés hablar un rato o estás ocupada?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Por qué compraste un auto tan chico?']::text[], note_en = coalesce(note_en, '“Chiquito” is the everyday, affectionate form of “chico” (small); both are right.')
where id = 'c86b0a53-849c-567b-8c23-50eae60e77d8' and es = '¿Por qué compraste un auto tan chiquito?' and en = 'Why did you buy such a small car?'
  and not (es_alt && array['¿Por qué compraste un auto tan chico?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Por qué compraste una valija tan chica?']::text[], note_en = coalesce(note_en, '“Chiquito” is the everyday, affectionate form of “chico” (small); both are right.')
where id = 'e3f38378-e4e1-597e-ad99-27d68d50a993' and es = '¿Por qué compraste una valija tan chiquita?' and en = 'Why did you buy such a small suitcase?'
  and not (es_alt && array['¿Por qué compraste una valija tan chica?']::text[]);

update public.sentences set es_alt = es_alt || array['Andá despacito, hay mucha gente en la calle.']::text[], note_en = coalesce(note_en, 'Argentines often link a request to its reason with a little “que”, something like “because”.')
where id = '6b58f201-73c8-5b2c-96ba-d45429f57f7c' and es = 'Andá despacito, que hay mucha gente en la calle.' and en = 'Go nice and slow, there are a lot of people in the street.'
  and not (es_alt && array['Andá despacito, hay mucha gente en la calle.']::text[]);

update public.sentences set es_alt = es_alt || array['Che, ¿tenés un minuto?']::text[], note_en = coalesce(note_en, '“¿Tenés un ratito?” is a friendly way to ask for a moment of someone''s time.')
where id = 'a04fba7b-f5c1-5e4d-a671-d6d4e01e29ce' and es = 'Che, ¿tenés un ratito?' and en = 'Hey, do you have a minute?'
  and not (es_alt && array['Che, ¿tenés un minuto?']::text[]);

update public.sentences set es_alt = es_alt || array['Despacito, no entiendo nada.']::text[], note_en = coalesce(note_en, 'Argentines often link a request to its reason with a little “que”, something like “because”.')
where id = '09199780-ad64-5d48-b516-2f3d5f00577e' and es = 'Despacito, que no entiendo nada.' and en = 'Nice and slow, I don''t understand anything.'
  and not (es_alt && array['Despacito, no entiendo nada.']::text[]);

update public.sentences set es_alt = es_alt || array['El baño es re chico.']::text[], note_en = coalesce(note_en, '“Chiquito” is the everyday, affectionate form of “chico” (small); both are right.')
where id = '8380db24-3481-51d6-8ce6-39a911a4e937' and es = 'El baño es re chiquito.' and en = 'The bathroom is really small.'
  and not (es_alt && array['El baño es re chico.']::text[]);

update public.sentences set es_alt = es_alt || array['Es chico, pero para mí está bárbaro.', 'Es chico, pero está bárbaro para mí.']::text[], note_en = coalesce(note_en, '“Chiquito” is the everyday, affectionate form of “chico” (small); both are right.')
where id = 'e6906529-b08a-5397-b5a1-612ead9eecb1' and es = 'Es chiquito, pero para mí está bárbaro.' and en = 'It''s small, but for me it''s great.'
  and not (es_alt && array['Es chico, pero para mí está bárbaro.', 'Es chico, pero está bárbaro para mí.']::text[]);

update public.sentences set es_alt = es_alt || array['Esperá un rato, por favor.', 'Esperá un poco, por favor.']::text[], note_en = coalesce(note_en, '“Un ratito” makes the wait sound short and the request softer.')
where id = 'fa79026d-a605-5f1a-9613-2836689e4b43' and es = 'Esperá un ratito, por favor.' and en = 'Wait a bit, please.'
  and not (es_alt && array['Esperá un rato, por favor.', 'Esperá un poco, por favor.']::text[]);

update public.sentences set es_alt = es_alt || array['Hablá despacito, el bebé está durmiendo.']::text[], note_en = coalesce(note_en, 'In Argentina “hablar despacito” often means speaking quietly, not just slowly. The little “que” links the request to its reason.')
where id = 'd32f4073-8e6e-5573-84ad-e7f5b9c6f091' and es = 'Hablá despacito, que el bebé está durmiendo.' and en = 'Speak quietly, the baby is sleeping.'
  and not (es_alt && array['Hablá despacito, el bebé está durmiendo.']::text[]);

update public.sentences set es_alt = es_alt || array['La cocina es chica.']::text[], note_en = coalesce(note_en, '“Chiquito” is the everyday, affectionate form of “chico” (small); both are right.')
where id = '036e9ead-190a-52c1-af08-05a63506a825' and es = 'La cocina es chiquita.' and en = 'The kitchen is small.'
  and not (es_alt && array['La cocina es chica.']::text[]);

update public.sentences set es_alt = es_alt || array['La parada del bondi está cerca, a dos cuadras.']::text[], note_en = coalesce(note_en, '“Cerquita” is “cerca” with a reassuring touch: really close, no big deal.')
where id = 'e7b37180-15d6-5e46-9a89-285c5c4fd284' and es = 'La parada del bondi está cerquita, a dos cuadras.' and en = 'The bus stop is close by, two blocks away.'
  and not (es_alt && array['La parada del bondi está cerca, a dos cuadras.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi casa es chica, pero linda.']::text[], note_en = coalesce(note_en, '“Chiquito” is the everyday, affectionate form of “chico” (small); both are right.')
where id = '7c90c6a9-a6ac-55b3-8a64-45cdf886a8d8' and es = 'Mi casa es chiquita, pero linda.' and en = 'My house is small, but nice.'
  and not (es_alt && array['Mi casa es chica, pero linda.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi casa está cerca del subte.']::text[], note_en = coalesce(note_en, '“Cerquita” is “cerca” with a reassuring touch: really close.')
where id = '4abddea0-deb3-55a0-8bdb-c632971d789e' and es = 'Mi casa está cerquita del subte.' and en = 'My house is close to the subway.'
  and not (es_alt && array['Mi casa está cerca del subte.']::text[]);

update public.sentences set es_alt = es_alt || array['Mica vive en una casa chica cerca de la plaza.']::text[], note_en = coalesce(note_en, '“Chiquito” is the everyday, affectionate form of “chico” (small); both are right.')
where id = 'b79ea52c-4a8d-5ed0-af85-e9b1965f555e' and es = 'Mica vive en una casa chiquita cerca de la plaza.' and en = 'Mica lives in a small house near the square.'
  and not (es_alt && array['Mica vive en una casa chica cerca de la plaza.']::text[]);

update public.sentences set es_alt = es_alt || array['Pasá despacio, están durmiendo.']::text[], note_en = coalesce(note_en, '“Despacito” here means gently, without making noise.')
where id = '11cdc8fe-26f1-5380-b697-dad9c1fca18e' and es = 'Pasá despacito, están durmiendo.' and en = 'Come in quietly, they''re sleeping.'
  and not (es_alt && array['Pasá despacio, están durmiendo.']::text[]);

update public.sentences set es_alt = es_alt || array['Quiero una mesa chica para el balcón.']::text[], note_en = coalesce(note_en, '“Chiquito” is the everyday, affectionate form of “chico” (small); both are right.')
where id = '8597a9c8-ab88-5342-9eac-356567c1cbad' and es = 'Quiero una mesa chiquita para el balcón.' and en = 'I want a small table for the balcony.'
  and not (es_alt && array['Quiero una mesa chica para el balcón.']::text[]);

update public.sentences set es_alt = es_alt || array['Sentate un rato, ya vengo.']::text[], note_en = coalesce(note_en, '“Un ratito” is a short while, said in a friendly way.')
where id = '594c3789-afa2-583b-95cc-4b27698ca3a2' and es = 'Sentate un ratito, ya vengo.' and en = 'Sit down for a bit, I''ll be right back.'
  and not (es_alt && array['Sentate un rato, ya vengo.']::text[]);

update public.sentences set es_alt = es_alt || array['Si el departamento está cerca del laburo, lo alquilo.']::text[], note_en = coalesce(note_en, '“Cerquita” is “cerca” with a little emphasis: really close.')
where id = '14dcd584-79f5-5ed3-b611-7b4f38a173f4' and es = 'Si el departamento está cerquita del laburo, lo alquilo.' and en = 'If the apartment is close to work, I''ll rent it.'
  and not (es_alt && array['Si el departamento está cerca del laburo, lo alquilo.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo un perro chico.']::text[], note_en = coalesce(note_en, '“Chiquito” is the everyday, affectionate form of “chico” (small); both are right.')
where id = '506094df-77f3-591b-a52d-f09977098c39' and es = 'Tengo un perro chiquito.' and en = 'I have a small dog.'
  and not (es_alt && array['Tengo un perro chico.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo un problemita, ¿lo hablamos con un café?', 'Tengo un problemita, ¿lo podemos hablar con un café?', 'Tengo un problemita, ¿lo podemos hablar con un cafecito?']::text[], note_en = coalesce(note_en, 'A “cafecito” is just a coffee, said with warmth.')
where id = '4852bff7-fac9-528d-be6d-a83b755a40ed' and es = 'Tengo un problemita, ¿lo hablamos con un cafecito?' and en = 'I have a little problem, can we talk about it over a coffee?'
  and not (es_alt && array['Tengo un problemita, ¿lo hablamos con un café?', 'Tengo un problemita, ¿lo podemos hablar con un café?', 'Tengo un problemita, ¿lo podemos hablar con un cafecito?']::text[]);

update public.sentences set es_alt = es_alt || array['Tomá despacito, está caliente.']::text[], note_en = coalesce(note_en, 'Argentines often link a request to its reason with a little “que”, something like “because”.')
where id = 'ae942a90-1cb1-585c-86d3-560c43cafdf5' and es = 'Tomá despacito, que está caliente.' and en = 'Drink it nice and slow, it''s hot.'
  and not (es_alt && array['Tomá despacito, está caliente.']::text[]);

update public.sentences set es_alt = es_alt || array['Un momento, por favor.']::text[], note_en = coalesce(note_en, '“Un ratito” is a friendly way to ask someone to hold on a moment.')
where id = 'f14f82f8-80ae-5714-87a1-2ae54e6d7088' and es = 'Un ratito, por favor.' and en = 'Just a moment, please.'
  and not (es_alt && array['Un momento, por favor.']::text[]);

update public.sentences set es_alt = es_alt || array['Una preguntita, ¿tenés un momento?', 'Una preguntita, ¿tenés un minuto?']::text[], note_en = coalesce(note_en, '“¿Tenés un ratito?” is a friendly way to ask for a moment of someone''s time.')
where id = '307634e1-9df9-5c5f-9ffb-904873a86cb2' and es = 'Una preguntita, ¿tenés un ratito?' and en = 'A quick question, do you have a moment?'
  and not (es_alt && array['Una preguntita, ¿tenés un momento?', 'Una preguntita, ¿tenés un minuto?']::text[]);

update public.sentences set es_alt = es_alt || array['Una preguntita: ¿dónde tomo un café por acá?', 'Una preguntita: ¿dónde puedo tomar un café por acá?', 'Una preguntita: ¿dónde puedo tomar un cafecito por acá?']::text[], note_en = coalesce(note_en, 'A “cafecito” is just a coffee, said with warmth.')
where id = '3d2feb09-f198-5f5f-981a-9aaace19f45f' and es = 'Una preguntita: ¿dónde tomo un cafecito por acá?' and en = 'A quick question: where can I get a coffee around here?'
  and not (es_alt && array['Una preguntita: ¿dónde tomo un café por acá?', 'Una preguntita: ¿dónde puedo tomar un café por acá?', 'Una preguntita: ¿dónde puedo tomar un cafecito por acá?']::text[]);

update public.sentences set es_alt = es_alt || array['Vivimos cerca, pero nunca nos vemos.']::text[], note_en = coalesce(note_en, '“Cerquita” is “cerca” with a little emphasis: really close.')
where id = '41707dc4-c917-51e8-bc49-90c4faa5e377' and es = 'Vivimos cerquita, pero nunca nos vemos.' and en = 'We live close by, but we never see each other.'
  and not (es_alt && array['Vivimos cerca, pero nunca nos vemos.']::text[]);

update public.sentences set es_alt = es_alt || array['Vivo acá cerca.']::text[], note_en = coalesce(note_en, '“Acá cerquita” is a very common way to say something is just around the corner.')
where id = 'e36e3c44-363a-5186-9b1b-2c80cd794c3f' and es = 'Vivo acá cerquita.' and en = 'I live here, close by.'
  and not (es_alt && array['Vivo acá cerca.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Qué lindo sol!']::text[], note_en = coalesce(note_en, '“Solcito” is the pleasant, gentle sun you enjoy sitting in.')
where id = '293a9c83-031e-5509-9448-02bb29ec5286' and es = '¡Qué lindo solcito!' and en = 'What nice sunshine!'
  and not (es_alt && array['¡Qué lindo sol!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me ayudás con unas cosas?', '¿Me podés ayudar con unas cositas?', '¿Me podés ayudar con unas cosas?']::text[], note_en = coalesce(note_en, '“Unas cositas” makes the favor sound small and easy to say yes to.')
where id = 'fe85fb82-78dd-5181-a685-c85198767683' and es = '¿Me ayudás con unas cositas?' and en = 'Can you help me with a few things?'
  and not (es_alt && array['¿Me ayudás con unas cosas?', '¿Me podés ayudar con unas cositas?', '¿Me podés ayudar con unas cosas?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar con una cosita en la cocina?']::text[], note_en = coalesce(note_en, 'In Argentina a plain present question is the everyday way to ask “can you…?”.')
where id = '2f18f6e1-e203-56ad-8b8f-f8fae230e102' and es = '¿Me ayudás con una cosita en la cocina?' and en = 'Can you help me with a little thing in the kitchen?'
  and not (es_alt && array['¿Me podés ayudar con una cosita en la cocina?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Vamos afuera? Hay un sol re lindo.', '¿Vamos afuera? El sol está re lindo.']::text[], note_en = coalesce(note_en, '“Solcito” is the pleasant, gentle sun you enjoy sitting in.')
where id = '63e3abcf-885e-54a2-a261-d417e059479a' and es = '¿Vamos afuera? Hay un solcito re lindo.' and en = 'Should we go outside? The sunshine is really nice.'
  and not (es_alt && array['¿Vamos afuera? Hay un sol re lindo.', '¿Vamos afuera? El sol está re lindo.']::text[]);

update public.sentences set es_alt = es_alt || array['Besitos, nos vemos mañana.']::text[], note_en = coalesce(note_en, 'Argentines often sign off with “besito” or “besitos”; it''s an affectionate goodbye among friends and family.')
where id = '698152bb-d859-5e22-9b6e-ba7349eb76bb' and es = 'Besito, nos vemos mañana.' and en = 'Kisses, see you tomorrow.'
  and not (es_alt && array['Besitos, nos vemos mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Con este calor, ¿no querés tomar un helado?']::text[], note_en = coalesce(note_en, '“Calorcito” is pleasant warmth, the kind you enjoy, while “calor” can be any heat.')
where id = '7cb8860a-790e-506f-b41b-3f5612a8a976' and es = 'Con este calorcito, ¿no querés tomar un helado?' and en = 'With this warm weather, don''t you want some ice cream?'
  and not (es_alt && array['Con este calor, ¿no querés tomar un helado?']::text[]);

update public.sentences set es_alt = es_alt || array['Hace fresquito, pero hay sol.']::text[], note_en = coalesce(note_en, 'Argentines use a lot of diminutives for the weather: “fresquito” is a light chill and “solcito” a pleasant bit of sun.')
where id = '6e954e03-59bc-5f06-bfac-c041ddf3a5be' and es = 'Hace fresquito, pero hay solcito.' and en = 'It''s chilly, but there''s some sunshine.'
  and not (es_alt && array['Hace fresquito, pero hay sol.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Estás igual!']::text[], note_en = coalesce(note_en, '“Igualito” is “igual” with emphasis and affection: exactly the same.')
where id = '189abb29-12b8-5db9-a320-2a89f1c78e10' and es = '¡Estás igualita!' and en = 'You look exactly the same!'
  and not (es_alt && array['¡Estás igual!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tan temprano?']::text[], note_en = coalesce(note_en, '“Tempranito” is “temprano” with a bit of feeling: nice and early, or really early.')
where id = 'a98ec3c9-55b6-51fd-ac2a-52f167d3c89a' and es = '¿Tan tempranito?' and en = 'That early?'
  and not (es_alt && array['¿Tan temprano?']::text[]);

update public.sentences set es_alt = es_alt || array['Compré una remera igual a la de Juan.']::text[], note_en = coalesce(note_en, '“Igualito” is “igual” with emphasis: exactly the same.')
where id = '0e1245e5-2e48-50ad-bacd-f40f6d614f8d' and es = 'Compré una remera igualita a la de Juan.' and en = 'I bought a T-shirt just like Juan''s.'
  and not (es_alt && array['Compré una remera igual a la de Juan.']::text[]);

update public.sentences set es_alt = es_alt || array['Con esos anteojos estás igual a tu viejo.']::text[], note_en = coalesce(note_en, '“Igualito” is “igual” with emphasis and affection: the spitting image.')
where id = 'fbba5aaf-aff4-501f-bf41-97210d825e79' and es = 'Con esos anteojos estás igualito a tu viejo.' and en = 'With those glasses, you look just like your dad.'
  and not (es_alt && array['Con esos anteojos estás igual a tu viejo.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando era chico, era igual a mi abuelo.', 'Cuando era chico, era igualito a mi abuelo.', 'Cuando era chica, era igual a mi abuelo.', 'Cuando era chica, era igualita a mi abuelo.']::text[], note_en = coalesce(note_en, '“Chiquito” and “igualito” are the warm everyday versions of “chico” and “igual”.')
where id = '916b218b-c42f-5ba6-ae63-c31d805550fb' and es = 'Cuando era chiquito, era igualito a mi abuelo.' and en = 'When I was little, I looked just like my grandpa.'
  and not (es_alt && array['Cuando era chico, era igual a mi abuelo.', 'Cuando era chico, era igualito a mi abuelo.', 'Cuando era chica, era igual a mi abuelo.', 'Cuando era chica, era igualita a mi abuelo.']::text[]);

update public.sentences set es_alt = es_alt || array['Desayuno rápido y salgo para la oficina.']::text[], note_en = coalesce(note_en, '“Rapidito” is “rápido” said lightly: it won''t take long.')
where id = '0b5632c9-0d77-59e2-8ae1-27ab4bccc4bb' and es = 'Desayuno rapidito y salgo para la oficina.' and en = 'I''ll have a quick breakfast and head to the office.'
  and not (es_alt && array['Desayuno rápido y salgo para la oficina.']::text[]);

update public.sentences set es_alt = es_alt || array['Es igual a Ana.']::text[], note_en = coalesce(note_en, '“Igualito” is “igual” with emphasis and affection: the spitting image.')
where id = '79139414-cd5f-5e6f-b595-cb4d7074fc63' and es = 'Es igualita a Ana.' and en = 'She looks just like Ana.'
  and not (es_alt && array['Es igual a Ana.']::text[]);

update public.sentences set es_alt = es_alt || array['Este flan es igual al de mi mamá.']::text[], note_en = coalesce(note_en, '“Igualito” is “igual” with emphasis: exactly the same.')
where id = 'e0ae36a8-8dd4-51f9-bd13-35df3c423320' and es = 'Este flan es igualito al de mi mamá.' and en = 'This flan is just like my mom''s.'
  and not (es_alt && array['Este flan es igual al de mi mamá.']::text[]);

update public.sentences set es_alt = es_alt || array['Igual a su abuelo.']::text[], note_en = coalesce(note_en, '“Igualito” is “igual” with emphasis and affection: the spitting image.')
where id = '5a3471d2-4857-5b31-b948-515c2d4fc0a6' and es = 'Igualito a su abuelo.' and en = 'Just like his grandpa.'
  and not (es_alt && array['Igual a su abuelo.']::text[]);

update public.sentences set es_alt = es_alt || array['Sos igual a tu mamá.']::text[], note_en = coalesce(note_en, '“Igualito” is “igual” with emphasis and affection: the spitting image.')
where id = '418bf8ae-8894-5b30-925b-d63c1125c3a1' and es = 'Sos igualita a tu mamá.' and en = 'You look just like your mom.'
  and not (es_alt && array['Sos igual a tu mamá.']::text[]);

update public.sentences set es_alt = es_alt || array['Tomá la leche, está calentita.']::text[], note_en = coalesce(note_en, 'Argentines often link a request to its reason with a little “que”, something like “because”.')
where id = 'a91cce49-aff3-533d-aa29-f1df6e114198' and es = 'Tomá la leche, que está calentita.' and en = 'Drink your milk, it''s nice and warm.'
  and not (es_alt && array['Tomá la leche, está calentita.']::text[]);

update public.sentences set es_alt = es_alt || array['Tu perro es igual al de mi abuela.']::text[], note_en = coalesce(note_en, '“Igualito” is “igual” with emphasis: exactly the same.')
where id = '120545d1-da26-5a23-adda-ddd619d3a48a' and es = 'Tu perro es igualito al de mi abuela.' and en = 'Your dog is just like my grandmother''s.'
  and not (es_alt && array['Tu perro es igual al de mi abuela.']::text[]);

update public.sentences set es_alt = es_alt || array['Un café rápido y salimos.']::text[], note_en = coalesce(note_en, '“Rapidito” is “rápido” said lightly: it won''t take long.')
where id = 'f07033e6-d9b4-5963-8700-ee4c775aed98' and es = 'Un café rapidito y salimos.' and en = 'A quick coffee and we''ll go.'
  and not (es_alt && array['Un café rápido y salimos.']::text[]);

update public.sentences set es_alt = es_alt || array['Vuelvo rápido.']::text[], note_en = coalesce(note_en, 'Argentines love the diminutive: “rapidito” is just “rápido” said in a lighter, friendlier way.')
where id = 'f68c0bcd-f6f3-53d9-91a5-677ec932ac9c' and es = 'Vuelvo rapidito.' and en = 'I''ll be back real quick.'
  and not (es_alt && array['Vuelvo rápido.']::text[]);

update public.sentences set es_alt = es_alt || array['Chicos, esperen un momento, estoy hablando con mi mamá.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = '58c915fe-11be-5409-b768-5742fca97627' and es = 'Chicos, esperen un momento, que estoy hablando con mi mamá.' and en = 'Guys, wait a moment, I''m talking to my mom.'
  and not (es_alt && array['Chicos, esperen un momento, estoy hablando con mi mamá.']::text[]);

update public.sentences set es_alt = es_alt || array['Pasen al balcón, hay un sol bárbaro.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = '0184e444-851c-5a13-91c0-00e698508b71' and es = 'Pasen al balcón, que hay un sol bárbaro.' and en = 'Go out on the balcony, it''s really sunny.'
  and not (es_alt && array['Pasen al balcón, hay un sol bárbaro.']::text[]);

update public.sentences set es_alt = es_alt || array['Pasen, mi mamá hizo empanadas para todos.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = '09b678c8-04c3-52f7-b127-00a170588d18' and es = 'Pasen, que mi mamá hizo empanadas para todos.' and en = 'Come in, my mom made empanadas for everyone.'
  and not (es_alt && array['Pasen, mi mamá hizo empanadas para todos.']::text[]);

update public.sentences set es_alt = es_alt || array['Pónganse cómodos, hay mate y facturas para todos.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = '9de18d2e-1ad6-572b-a0fe-4b3f2d40d912' and es = 'Pónganse cómodos, que hay mate y facturas para todos.' and en = 'Make yourselves comfortable, there''s mate and pastries for everyone.'
  and not (es_alt && array['Pónganse cómodos, hay mate y facturas para todos.']::text[]);

update public.sentences set es_alt = es_alt || array['Pónganse cómodos, Juan llega en un rato.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = '725ca512-a253-5a5f-935c-7cd7779926bb' and es = 'Pónganse cómodos, que Juan llega en un rato.' and en = 'Make yourselves comfortable, Juan''s getting here in a bit.'
  and not (es_alt && array['Pónganse cómodos, Juan llega en un rato.']::text[]);

update public.sentences set es_alt = es_alt || array['Pónganse la campera, hace frío.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = '36fab0c7-04ea-54b1-85e0-d6e8fbe67261' and es = 'Pónganse la campera, que hace frío.' and en = 'Put your jackets on, it''s cold.'
  and not (es_alt && array['Pónganse la campera, hace frío.']::text[]);

update public.sentences set es_alt = es_alt || array['Quédense a comer, mi vieja hizo un asado riquísimo.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. And “quedarse a comer” covers any meal.')
where id = 'e4c9a6a1-4d6d-5357-bf13-e229d8df2414' and es = 'Quédense a comer, que mi vieja hizo un asado riquísimo.' and en = 'Stay for lunch, my mom made a delicious asado.'
  and not (es_alt && array['Quédense a comer, mi vieja hizo un asado riquísimo.']::text[]);

update public.sentences set es_alt = es_alt || array['Quédense un rato más, es temprano.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = '02703534-6b99-57b2-acf6-50f5fdab2d35' and es = 'Quédense un rato más, que es temprano.' and en = 'Stay a while longer, it''s early.'
  and not (es_alt && array['Quédense un rato más, es temprano.']::text[]);

update public.sentences set es_alt = es_alt || array['Quédense, hago más café.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = '84830348-ad74-5e4b-8cf3-6fe3a409d1d8' and es = 'Quédense, que hago más café.' and en = 'Stay, I''ll make more coffee.'
  and not (es_alt && array['Quédense, hago más café.']::text[]);

update public.sentences set es_alt = es_alt || array['Quédense, llueve.', 'Quédense, está lloviendo.', 'Quédense, que está lloviendo.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = '9c8ce71f-8e94-555d-87d0-33064cb12267' and es = 'Quédense, que llueve.' and en = 'Stay, it''s raining.'
  and not (es_alt && array['Quédense, llueve.', 'Quédense, está lloviendo.', 'Quédense, que está lloviendo.']::text[]);

update public.sentences set es_alt = es_alt || array['Siéntense, mi mamá hizo un flan riquísimo.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = '9d9a61c4-cf76-5585-8530-45d3acc4b80e' and es = 'Siéntense, que mi mamá hizo un flan riquísimo.' and en = 'Sit down, my mom made a delicious flan.'
  and not (es_alt && array['Siéntense, mi mamá hizo un flan riquísimo.']::text[]);

update public.sentences set es_alt = es_alt || array['Traigan una campera, a la noche hace frío.', 'Traigan una campera, hace frío a la noche.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = 'ffdf2812-e3d4-55fd-818d-67b638ae7b7d' and es = 'Traigan una campera, que a la noche hace frío.' and en = 'Bring a jacket, it gets cold at night.'
  and not (es_alt && array['Traigan una campera, a la noche hace frío.', 'Traigan una campera, hace frío a la noche.']::text[]);

update public.sentences set es_alt = es_alt || array['Vengan a mi casa el sábado.', 'Vengan el sábado a mi casa.']::text[], note_en = coalesce(note_en, '“A casa” with no “mi” already means “to my place” when you''re the one inviting.')
where id = '80861c33-1021-5667-87d5-d8fbb834b139' and es = 'Vengan a casa el sábado.' and en = 'Come over to my place on Saturday.'
  and not (es_alt && array['Vengan a mi casa el sábado.', 'Vengan el sábado a mi casa.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Vengan a la mesa, chicos!', '¡Chicos, vengan a la mesa!']::text[], note_en = coalesce(note_en, '“¡A la mesa!” is the classic call to come and eat, with no verb needed.')
where id = '365fbbae-4023-5df8-80b7-6ec49a42f2ea' and es = '¡A la mesa, chicos!' and en = 'Come to the table, guys!'
  and not (es_alt && array['¡Vengan a la mesa, chicos!', '¡Chicos, vengan a la mesa!']::text[]);

update public.sentences set es_alt = es_alt || array['¡A la mesa, ya está la comida!', '¡Vengan a la mesa, que ya está la comida!', '¡Vengan a la mesa, ya está la comida!']::text[], note_en = coalesce(note_en, '“¡A la mesa!” is the classic call to come and eat, and the little “que” introduces the reason, like a soft “because”.')
where id = 'bcea0a6c-f671-53e8-b56b-68a3ac96004a' and es = '¡A la mesa, que ya está la comida!' and en = 'Come to the table, the food''s ready!'
  and not (es_alt && array['¡A la mesa, ya está la comida!', '¡Vengan a la mesa, que ya está la comida!', '¡Vengan a la mesa, ya está la comida!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Puedo agarrar la última empanada?']::text[], note_en = coalesce(note_en, '“¿Me dejás...?” (will you let me?) is a common, friendly way to ask permission.')
where id = '270947b2-5f32-56e2-8cc3-c844c28ef9d0' and es = '¿Me dejás agarrar la última empanada?' and en = 'Can I grab the last empanada?'
  and not (es_alt && array['¿Puedo agarrar la última empanada?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Puedo agarrar un poco de torta?', '¿Puedo comer un poco de torta?']::text[], note_en = coalesce(note_en, '“¿Me dejás...?” (will you let me?) is a common, friendly way to ask permission.')
where id = '99129622-0e2d-5d7e-b8ce-c69a565dab1a' and es = '¿Me dejás agarrar un poco de torta?' and en = 'Can I have a little cake?'
  and not (es_alt && array['¿Puedo agarrar un poco de torta?', '¿Puedo comer un poco de torta?']::text[]);

update public.sentences set es_alt = es_alt || array['Coman, coman, yo ya comí.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = 'e9303185-b931-56a1-aa02-6ccf82016c54' and es = 'Coman, coman, que yo ya comí.' and en = 'Eat, eat, I already ate.'
  and not (es_alt && array['Coman, coman, yo ya comí.']::text[]);

update public.sentences set es_alt = es_alt || array['Fede y Ana, coman, ya nos vamos.', 'Fede, Ana, coman, que ya nos vamos.', 'Fede, Ana, coman, ya nos vamos.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = 'e800dd4b-f7fb-52ca-9456-9eaeee1baee7' and es = 'Fede y Ana, coman, que ya nos vamos.' and en = 'Fede, Ana, eat up, we''re leaving soon.'
  and not (es_alt && array['Fede y Ana, coman, ya nos vamos.', 'Fede, Ana, coman, que ya nos vamos.', 'Fede, Ana, coman, ya nos vamos.']::text[]);

update public.sentences set es_alt = es_alt || array['Vengan a la mesa, por favor.', 'Por favor, vengan a la mesa.']::text[], note_en = coalesce(note_en, 'Hosts say “pasen” to invite people to move along to a room or the table.')
where id = '8b3467a3-46b0-5adc-98c7-ab13304a40c3' and es = 'Pasen a la mesa, por favor.' and en = 'Come to the table, please.'
  and not (es_alt && array['Vengan a la mesa, por favor.', 'Por favor, vengan a la mesa.']::text[]);

update public.sentences set es_alt = es_alt || array['Sírvanse algo de tomar, ya llega la pizza.', 'Sírvanse algo de tomar, la pizza ya llega.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = 'd419702a-a66a-5d80-ae39-aa81bdbc8029' and es = 'Sírvanse algo de tomar, que ya llega la pizza.' and en = 'Help yourselves to something to drink, the pizza''s almost here.'
  and not (es_alt && array['Sírvanse algo de tomar, ya llega la pizza.', 'Sírvanse algo de tomar, la pizza ya llega.']::text[]);

update public.sentences set es_alt = es_alt || array['Tomen agua, hace calor.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = '30b50099-6e7e-5db5-8adf-e3c030ac5d5c' and es = 'Tomen agua, que hace calor.' and en = 'Drink some water, it''s hot.'
  and not (es_alt && array['Tomen agua, hace calor.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Ayudo en algo? —No, siéntense.']::text[], note_en = coalesce(note_en, '“Vayan” + “-ndo” is a gentle way to tell people to get started on something while the rest gets ready.')
where id = '445fe226-02d3-5e28-a1f4-827850d280e0' and es = '—¿Ayudo en algo? —No, vayan sentándose.' and en = '—Can I help with something? —No, go ahead and sit down.'
  and not (es_alt && array['—¿Ayudo en algo? —No, siéntense.']::text[]);

update public.sentences set es_alt = es_alt || array['—Permiso. —Pasen, están en su casa.']::text[], note_en = coalesce(note_en, '“Vayan” + “-ndo” is a gentle way to tell people to get started on something while the rest gets ready.')
where id = 'cbb5a959-0a0a-5b40-a915-1fdf66ab442b' and es = '—Permiso. —Vayan pasando, están en su casa.' and en = '—Excuse me. —Come on in, make yourselves at home.'
  and not (es_alt && array['—Permiso. —Pasen, están en su casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Apúrense, la abuela ya está en la mesa.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = 'd46d78dd-ef71-5271-8217-597f1484e73a' and es = 'Apúrense, que la abuela ya está en la mesa.' and en = 'Hurry up, Grandma''s already at the table.'
  and not (es_alt && array['Apúrense, la abuela ya está en la mesa.']::text[]);

update public.sentences set es_alt = es_alt || array['Apúrense, llegamos tarde.', 'Apúrense, que vamos a llegar tarde.', 'Apúrense, vamos a llegar tarde.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, and they often use the present (“llegamos”) for something about to happen.')
where id = 'fbac0740-1d3d-5330-bcce-8688817fb703' and es = 'Apúrense, que llegamos tarde.' and en = 'Hurry up, we''re going to be late.'
  and not (es_alt && array['Apúrense, llegamos tarde.', 'Apúrense, que vamos a llegar tarde.', 'Apúrense, vamos a llegar tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Dejen de mirar la tele y vengan a comer.']::text[]
where id = 'a47ee1c5-5dbb-5d27-baa4-1d4152179922' and es = 'Dejen la tele y vengan a comer.' and en = 'Stop watching TV and come eat.'
  and not (es_alt && array['Dejen de mirar la tele y vengan a comer.']::text[]);

update public.sentences set es_alt = es_alt || array['Dejen lugar para el postre, hice flan.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = '8cbfd766-e59c-5dfa-bfa6-dc7d22fd0355' and es = 'Dejen lugar para el postre, que hice flan.' and en = 'Leave room for dessert, I made flan.'
  and not (es_alt && array['Dejen lugar para el postre, hice flan.']::text[]);

update public.sentences set es_alt = es_alt || array['Hagan lugar en el medio, traigo el asado.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = 'c4586638-904d-57fc-9767-4795781753ee' and es = 'Hagan lugar en el medio, que traigo el asado.' and en = 'Make room in the middle, I''m bringing the asado.'
  and not (es_alt && array['Hagan lugar en el medio, traigo el asado.']::text[]);

update public.sentences set es_alt = es_alt || array['Hagan lugar, somos doce y hay diez sillas.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = '9938205f-b672-53cc-882c-dd4b247adeaa' and es = 'Hagan lugar, que somos doce y hay diez sillas.' and en = 'Make room, there are twelve of us and there are ten chairs.'
  and not (es_alt && array['Hagan lugar, somos doce y hay diez sillas.']::text[]);

update public.sentences set es_alt = es_alt || array['Hagan mate, yo traigo las facturas.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to link the next part, like a soft “because”. The sentence works without it too.')
where id = 'f0d33f60-8a9d-586d-8d40-460ae8d4f1c9' and es = 'Hagan mate, que yo traigo las facturas.' and en = 'Make some mate, I''ll bring the pastries.'
  and not (es_alt && array['Hagan mate, yo traigo las facturas.']::text[]);

update public.sentences set es_alt = es_alt || array['Los que tienen hambre, siéntense.']::text[], note_en = coalesce(note_en, '“Vayan” + “-ndo” is a gentle way to tell people to get started on something while the rest gets ready.')
where id = 'dcf6bd34-79c0-56bd-a079-f5dada8cb9c2' and es = 'Los que tienen hambre, vayan sentándose.' and en = 'Those of you who are hungry, go ahead and sit down.'
  and not (es_alt && array['Los que tienen hambre, siéntense.']::text[]);

update public.sentences set es_alt = es_alt || array['No vayan sin paraguas, llueve.', 'No vayan sin paraguas, está lloviendo.', 'No vayan sin paraguas, que está lloviendo.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = '4140d6cd-cd33-578a-ac27-173f0662470f' and es = 'No vayan sin paraguas, que llueve.' and en = 'Don''t go without an umbrella, it''s raining.'
  and not (es_alt && array['No vayan sin paraguas, llueve.', 'No vayan sin paraguas, está lloviendo.', 'No vayan sin paraguas, que está lloviendo.']::text[]);

update public.sentences set es_alt = es_alt || array['Vayan a comprar pan, no hay.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = '0a66c626-3814-5e37-a579-177af84d6e13' and es = 'Vayan a comprar pan, que no hay.' and en = 'Go buy some bread, we''re out.'
  and not (es_alt && array['Vayan a comprar pan, no hay.']::text[]);

update public.sentences set es_alt = es_alt || array['Pasen a la cocina y agarren un plato.']::text[], note_en = coalesce(note_en, '“Vayan” + “-ndo” is a gentle way to tell people to get started on something while the rest gets ready.')
where id = 'f617d1d3-cf9b-5318-9b96-e269f512a8da' and es = 'Vayan pasando a la cocina y agarren un plato.' and en = 'Go on through to the kitchen and grab a plate.'
  and not (es_alt && array['Pasen a la cocina y agarren un plato.']::text[]);

update public.sentences set es_alt = es_alt || array['Siéntense, la abuela va al lado de la ventana.']::text[], note_en = coalesce(note_en, '“Vayan” + “-ndo” is a gentle way to tell people to get started on something while the rest gets ready.')
where id = 'df9a468b-c660-5cfe-a148-5b543942f458' and es = 'Vayan sentándose, la abuela va al lado de la ventana.' and en = 'Go ahead and sit down, Grandma goes next to the window.'
  and not (es_alt && array['Siéntense, la abuela va al lado de la ventana.']::text[]);

update public.sentences set es_alt = es_alt || array['Vayan tomando algo, la carne tarda.', 'Tomen algo, que la carne tarda.', 'Tomen algo, la carne tarda.']::text[], note_en = coalesce(note_en, '“Vayan” + “-ndo” gently tells people to get started, and the little “que” introduces the reason, like a soft “because”.')
where id = '45ce46a3-007a-5be2-b1d0-53ed347e468d' and es = 'Vayan tomando algo, que la carne tarda.' and en = 'Go ahead and have something to drink, the meat takes a while.'
  and not (es_alt && array['Vayan tomando algo, la carne tarda.', 'Tomen algo, que la carne tarda.', 'Tomen algo, la carne tarda.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué tenemos que traer al asado, vino o carne?']::text[], note_en = coalesce(note_en, '“Hay que” says something has to be done without saying by whom. Argentines use it all the time where English says “we have to” or “you have to”.')
where id = 'b323f1a9-34ff-5e20-9046-c7c093c66588' and es = '¿Qué hay que traer al asado, vino o carne?' and en = 'What do we have to bring to the asado, wine or meat?'
  and not (es_alt && array['¿Qué tenemos que traer al asado, vino o carne?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, tenemos que sacar la basura.']::text[], note_en = coalesce(note_en, '“Hay que” says something has to be done without saying by whom. Argentines use it all the time where English says “we have to” or “you have to”.')
where id = '61d7f20c-f5e5-5e3b-98a3-846ce38ac167' and es = 'Che, hay que sacar la basura.' and en = 'Hey, we have to take out the trash.'
  and not (es_alt && array['Che, tenemos que sacar la basura.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenés que llegar temprano.']::text[], note_en = coalesce(note_en, '“Hay que” says something has to be done without saying by whom. Argentines use it all the time where English says “we have to” or “you have to”.')
where id = '04e666d6-bd71-582d-836c-47c48fd4ab49' and es = 'Hay que llegar temprano.' and en = 'You have to arrive early.'
  and not (es_alt && array['Tenés que llegar temprano.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenés que sacar turno.']::text[], note_en = coalesce(note_en, '“Hay que” says something has to be done without saying by whom. Argentines use it all the time where English says “we have to” or “you have to”.')
where id = '1cab5260-f566-5533-894b-91f88410b636' and es = 'Hay que sacar turno.' and en = 'You have to book an appointment.'
  and not (es_alt && array['Tenés que sacar turno.']::text[]);

update public.sentences set es_alt = es_alt || array['Para el trámite tenés que ir al banco.', 'Tenés que ir al banco para el trámite.']::text[], note_en = coalesce(note_en, '“Hay que” says something has to be done without saying by whom. Argentines use it all the time where English says “we have to” or “you have to”.')
where id = 'd5df89e7-94fb-5e0a-bd0a-28ca4a880fc4' and es = 'Para el trámite hay que ir al banco.' and en = 'For the paperwork you have to go to the bank.'
  and not (es_alt && array['Para el trámite tenés que ir al banco.', 'Tenés que ir al banco para el trámite.']::text[]);

update public.sentences set es_alt = es_alt || array['Sí, tenemos que ir.']::text[], note_en = coalesce(note_en, '“Hay que” says something has to be done without saying by whom. Argentines use it all the time where English says “we have to” or “you have to”.')
where id = 'b47f6843-1464-535c-8705-9ff5e6297b30' and es = 'Sí, hay que ir.' and en = 'Yes, we have to go.'
  and not (es_alt && array['Sí, tenemos que ir.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Necesito llevar efectivo? —Sí, conviene.', '—¿Tengo que llevar efectivo? —Sí, conviene.']::text[], note_en = coalesce(note_en, '“Hace falta” means “it''s necessary” without naming who needs it. It''s a very common way to ask if you need to do something.')
where id = 'eb35ac92-6140-5829-9991-651c2abfa315' and es = '—¿Hace falta llevar efectivo? —Sí, conviene.' and en = '—Do I need to bring cash? —Yes, it''s a good idea.'
  and not (es_alt && array['—¿Necesito llevar efectivo? —Sí, conviene.', '—¿Tengo que llevar efectivo? —Sí, conviene.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuántas fotocopias quieren?']::text[], note_en = coalesce(note_en, 'For paperwork, Argentines say “piden” (they ask for) for whatever an office requires.')
where id = '444ed087-7e20-59fb-a153-25387025ffb7' and es = '¿Cuántas fotocopias piden?' and en = 'How many photocopies do they want?'
  and not (es_alt && array['¿Cuántas fotocopias quieren?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde puedo hacer una fotocopia?']::text[], note_en = coalesce(note_en, 'In Argentina you usually “sacar” a photocopy, the same verb as in “sacar turno” or “sacar una foto”.')
where id = '4bc16651-4666-58c4-a769-e0180f20dae4' and es = '¿Dónde puedo sacar una fotocopia?' and en = 'Where can I make a photocopy?'
  and not (es_alt && array['¿Dónde puedo hacer una fotocopia?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenemos que ir?', '¿Hay que ir?']::text[]
where id = 'f2cc88ed-9a9e-54f4-ad3e-fda0cccb70d2' and es = '¿Es obligatorio ir?' and en = 'Do we have to go?'
  and not (es_alt && array['¿Tenemos que ir?', '¿Hay que ir?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Necesito ir al banco para ese trámite?', '¿Tengo que ir al banco para ese trámite?', '¿Para ese trámite tengo que ir al banco?']::text[], note_en = coalesce(note_en, '“Hace falta” means “it''s necessary” without naming who needs it. It''s a very common way to ask if you need to do something.')
where id = '94cb4ec7-a528-5f76-9144-d28479570116' and es = '¿Hace falta ir al banco para ese trámite?' and en = 'Do I need to go to the bank for that paperwork?'
  and not (es_alt && array['¿Necesito ir al banco para ese trámite?', '¿Tengo que ir al banco para ese trámite?', '¿Para ese trámite tengo que ir al banco?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Necesitás turno?']::text[], note_en = coalesce(note_en, '“Hace falta” means “it''s necessary” without naming who needs it. It''s a very common way to ask if you need something.')
where id = 'a503ecaa-b7b0-51e3-9ac5-8221b50b05f6' and es = '¿Hace falta turno?' and en = 'Do you need an appointment?'
  and not (es_alt && array['¿Necesitás turno?']::text[]);

update public.sentences set es_alt = es_alt || array['Acá no necesitás turno.', 'Acá no hace falta turno.', 'No necesitás turno acá.']::text[], note_en = coalesce(note_en, 'For paperwork, Argentines say “piden” (they ask for) for whatever an office requires.')
where id = '47f9534d-d879-5ca0-a5d4-37c13ddd26ea' and es = 'Acá no piden turno.' and en = 'You don''t need an appointment here.'
  and not (es_alt && array['Acá no necesitás turno.', 'Acá no hace falta turno.', 'No necesitás turno acá.']::text[]);

update public.sentences set es_alt = es_alt || array['Firmá rápido, cierran.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” to give the reason, like a soft “because”. The sentence works without it too.')
where id = '215420c3-42b1-5a34-bb69-ba7f12fa450a' and es = 'Firmá rápido, que cierran.' and en = 'Sign quickly, they''re closing.'
  and not (es_alt && array['Firmá rápido, cierran.']::text[]);

update public.sentences set es_alt = es_alt || array['Necesitamos más hielo.']::text[], note_en = coalesce(note_en, '“Hace falta” means “it''s needed” without naming who needs it.')
where id = 'fa47abe8-a5b8-5852-b216-73729f3b7e41' and es = 'Hace falta más hielo.' and en = 'We need more ice.'
  and not (es_alt && array['Necesitamos más hielo.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenés que completar la dirección.']::text[], note_en = coalesce(note_en, '“Hay que” says something has to be done without saying by whom. Argentines use it all the time where English says “we have to” or “you have to”.')
where id = 'c185ac1e-19f7-52ba-8a8a-2b4729bdc96e' and es = 'Hay que completar la dirección.' and en = 'You have to fill in the address.'
  and not (es_alt && array['Tenés que completar la dirección.']::text[]);

update public.sentences set es_alt = es_alt || array['Hice fotocopias para todos.']::text[], note_en = coalesce(note_en, 'In Argentina you usually “sacar” a photocopy, the same verb as in “sacar turno” or “sacar una foto”.')
where id = 'cc004ceb-32ff-5d2a-8ed2-e9824de07d01' and es = 'Saqué fotocopias para todos.' and en = 'I made copies for everyone.'
  and not (es_alt && array['Hice fotocopias para todos.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenés que firmar.']::text[], note_en = coalesce(note_en, '“Hay que” says something has to be done without saying by whom. Argentines use it all the time where English says “we have to” or “you have to”.')
where id = '172b50d8-3a97-5cf1-8c0b-2cadcf9e1882' and es = 'Hay que firmar.' and en = 'You have to sign.'
  and not (es_alt && array['Tenés que firmar.']::text[]);

update public.sentences set es_alt = es_alt || array['No pude sacar plata porque la tarjeta estaba vencida.']::text[]
where id = '45566b21-ac28-5d42-8a8d-a91189228aad' and es = 'No pude sacar plata porque tenía la tarjeta vencida.' and en = 'I couldn''t get cash because my card was expired.'
  and not (es_alt && array['No pude sacar plata porque la tarjeta estaba vencida.']::text[]);

update public.sentences set es_alt = es_alt || array['No pude viajar porque mi pasaporte estaba vencido.', 'No pude viajar porque el pasaporte estaba vencido.']::text[], note_en = coalesce(note_en, 'Argentines often say “tengo el pasaporte vencido” (I have the passport expired) instead of “mi pasaporte está vencido”.')
where id = '2043fb24-acd6-592c-8299-3186224460db' and es = 'No pude viajar porque tenía el pasaporte vencido.' and en = 'I couldn''t travel because my passport was expired.'
  and not (es_alt && array['No pude viajar porque mi pasaporte estaba vencido.', 'No pude viajar porque el pasaporte estaba vencido.']::text[]);

update public.sentences set es_alt = es_alt || array['Para renovar el DNI, tenés que sacar turno.', 'Tenés que sacar turno para renovar el DNI.']::text[], note_en = coalesce(note_en, '“Hay que” says something has to be done without saying by whom. Argentines use it all the time where English says “we have to” or “you have to”.')
where id = 'ef28cb36-6837-5227-9842-15ae4f522e51' and es = 'Para renovar el DNI, hay que sacar turno.' and en = 'To renew your ID, you have to book an appointment.'
  and not (es_alt && array['Para renovar el DNI, tenés que sacar turno.', 'Tenés que sacar turno para renovar el DNI.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi tarjeta está vencida.']::text[], note_en = coalesce(note_en, 'Argentines often say “tengo la tarjeta vencida” (I have the card expired) instead of “mi tarjeta está vencida”.')
where id = 'a44f956f-090d-56fc-aba9-6766a364f79b' and es = 'Tengo la tarjeta vencida.' and en = 'My card is expired.'
  and not (es_alt && array['Mi tarjeta está vencida.']::text[]);

update public.sentences set es_alt = es_alt || array['¿A qué hora abren mañana?', '¿Mañana a qué hora abren?']::text[], note_en = coalesce(note_en, 'For offices and shops, Argentines ask when they “atienden” (serve the public), not only when they “abren”.')
where id = 'b91195d4-d131-5876-b745-5af78cbb0d29' and es = '¿A qué hora atienden mañana?' and en = 'What time are they open tomorrow?'
  and not (es_alt && array['¿A qué hora abren mañana?', '¿Mañana a qué hora abren?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde puedo hacer una consulta?']::text[], note_en = coalesce(note_en, 'Argentines often ask with the plain present (“¿Dónde hago...?”) where English says “Where can I...?”.')
where id = '2bdcaab8-170c-578e-aac1-a8e4c52b3837' and es = '¿Dónde hago una consulta?' and en = 'Where can I ask a question?'
  and not (es_alt && array['¿Dónde puedo hacer una consulta?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde tenés que presentar esto?']::text[], note_en = coalesce(note_en, '“Hay que” says something has to be done without saying by whom. Argentines use it all the time where English says “we have to” or “you have to”.')
where id = '623ab89c-c89a-538d-baf0-c06f23b80e7b' and es = '¿Dónde hay que presentar esto?' and en = 'Where do you have to submit this?'
  and not (es_alt && array['¿Dónde tenés que presentar esto?']::text[]);

update public.sentences set es_alt = es_alt || array['Ana me mandó los requisitos para la residencia.']::text[], note_en = coalesce(note_en, '“Pasar” is the everyday verb for passing information along: “pasame la dirección”, “te paso el contacto”.')
where id = '6b777abd-6f84-5c57-b453-c7d56eae869c' and es = 'Ana me pasó los requisitos para la residencia.' and en = 'Ana sent me the requirements for residency.'
  and not (es_alt && array['Ana me mandó los requisitos para la residencia.']::text[]);

update public.sentences set es_alt = es_alt || array['Andá a la ventanilla dos.']::text[], note_en = coalesce(note_en, 'At a counter, staff say “pasá” to send you on to the next window.')
where id = '01ce970a-7131-56b1-ade9-4e1e5593644d' and es = 'Pasá a la ventanilla dos.' and en = 'Go to window two.'
  and not (es_alt && array['Andá a la ventanilla dos.']::text[]);

update public.sentences set es_alt = es_alt || array['Quieren el original del pasaporte.']::text[], note_en = coalesce(note_en, 'For paperwork, Argentines say “piden” (they ask for) for whatever an office requires.')
where id = 'd6e373f5-338b-5108-a7e7-ce94728ca3d7' and es = 'Piden el original del pasaporte.' and en = 'They want the original passport.'
  and not (es_alt && array['Quieren el original del pasaporte.']::text[]);

update public.sentences set es_alt = es_alt || array['Presenté todo en Migraciones y ahora tengo que esperar.', 'En Migraciones presenté todo y ahora tengo que esperar.']::text[], note_en = coalesce(note_en, '“Hay que” says something has to be done without saying by whom. Argentines use it all the time where English says “I have to” or “you have to”.')
where id = 'a139f18d-17ca-5e88-9d7d-1c8b9529ed51' and es = 'Presenté todo en Migraciones y ahora hay que esperar.' and en = 'I submitted everything at the immigration office and now I have to wait.'
  and not (es_alt && array['Presenté todo en Migraciones y ahora tengo que esperar.', 'En Migraciones presenté todo y ahora tengo que esperar.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Por qué no se puede estacionar en esta calle?']::text[]
where id = '9bb187cc-9125-5772-b295-a85e283e557c' and es = '¿Por qué está prohibido estacionar en esta calle?' and en = 'Why is parking not allowed on this street?'
  and not (es_alt && array['¿Por qué no se puede estacionar en esta calle?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Podés fumar acá?', '¿Acá podés fumar?']::text[], note_en = coalesce(note_en, '“Se puede” asks whether something is allowed in general, without pointing at anyone.')
where id = '29c60b73-3a59-5e80-a626-f66147c8eaa2' and es = '¿Se puede fumar acá?' and en = 'Can you smoke here?'
  and not (es_alt && array['¿Podés fumar acá?', '¿Acá podés fumar?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Podés tener una mascota en el depto?', '¿En el depto podés tener una mascota?']::text[], note_en = coalesce(note_en, '“Se puede” asks whether something is allowed in general, without pointing at anyone.')
where id = '306f4cfd-251d-528d-9619-dd30f85c655f' and es = '¿Se puede tener una mascota en el depto?' and en = 'Can you have a pet in the apartment?'
  and not (es_alt && array['¿Podés tener una mascota en el depto?', '¿En el depto podés tener una mascota?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Puedo ver el depto hoy?', '¿Puedo ver hoy el depto?', '¿Hoy puedo ver el depto?']::text[], note_en = coalesce(note_en, '“¿Se puede...?” is a polite, impersonal way to ask whether something is possible, often used where English says “Can I...?”.')
where id = '60a20e86-7da1-521c-8587-3eb9564f44bf' and es = '¿Se puede ver el depto hoy?' and en = 'Can I see the apartment today?'
  and not (es_alt && array['¿Puedo ver el depto hoy?', '¿Puedo ver hoy el depto?', '¿Hoy puedo ver el depto?']::text[]);

update public.sentences set es_alt = es_alt || array['Acá no podés estacionar.', 'No podés estacionar acá.']::text[], note_en = coalesce(note_en, '“No se puede” says something isn''t allowed in general, without pointing at anyone.')
where id = '58a3d043-fe7e-58e8-b391-c3493dbeca75' and es = 'Acá no se puede estacionar.' and en = 'You can''t park here.'
  and not (es_alt && array['Acá no podés estacionar.', 'No podés estacionar acá.']::text[]);

update public.sentences set es_alt = es_alt || array['En el subte no se puede comer.', 'No se puede comer en el subte.']::text[]
where id = 'f71952a5-687a-560c-b1f7-7e1bfb243558' and es = 'En el subte está prohibido comer.' and en = 'Eating isn''t allowed on the subway.'
  and not (es_alt && array['En el subte no se puede comer.', 'No se puede comer en el subte.']::text[]);

update public.sentences set es_alt = es_alt || array['En este edificio no podés fumar.', 'No podés fumar en este edificio.']::text[], note_en = coalesce(note_en, '“No se puede” says something isn''t allowed in general, without pointing at anyone.')
where id = '4cf7c45a-f7a4-528b-b18e-816b39bd8d98' and es = 'En este edificio no se puede fumar.' and en = 'You can''t smoke in this building.'
  and not (es_alt && array['En este edificio no podés fumar.', 'No podés fumar en este edificio.']::text[]);

update public.sentences set es_alt = es_alt || array['Adentro no se permiten mascotas, pero afuera sí.']::text[], note_en = coalesce(note_en, 'In a quick contrast like this, Spanish often skips the “pero” and lets the comma do the work.')
where id = '8fd21424-d9c8-5bef-b6cf-3892fe7ec260' and es = 'Adentro no se permiten mascotas, afuera sí.' and en = 'Pets aren''t allowed inside, but they are outside.'
  and not (es_alt && array['Adentro no se permiten mascotas, pero afuera sí.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿A cuánto están los tomates? —Tres mil el kilo.']::text[], note_en = coalesce(note_en, 'The answer echoes the “a” of “¿A cuánto están?”. You can also just say the price.')
where id = '4d029d42-d850-53db-90f6-21c0332f316e' and es = '—¿A cuánto están los tomates? —A tres mil el kilo.' and en = '—How much are the tomatoes? —Three thousand a kilo.'
  and not (es_alt && array['—¿A cuánto están los tomates? —Tres mil el kilo.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me das un cuarto de kilo de jamón cocido en fetas?']::text[], note_en = coalesce(note_en, 'At the shop Argentines just say “un cuarto”: everyone understands it means a quarter of a kilo.')
where id = '6c80b232-3b84-58d8-ba47-1560a8a54df0' and es = '¿Me das un cuarto de jamón cocido en fetas?' and en = 'Can you give me a quarter kilo of cooked ham in slices?'
  and not (es_alt && array['¿Me das un cuarto de kilo de jamón cocido en fetas?']::text[]);

update public.sentences set es_alt = es_alt || array['Dame cien gramos de jamón crudo.']::text[], note_en = coalesce(note_en, 'At the deli Argentines often say just “crudo” or “cocido” and leave out “jamón”.')
where id = '13dd5aba-ea0a-5092-855e-5af81ab5d042' and es = 'Dame cien gramos de crudo.' and en = 'Give me a hundred grams of cured ham.'
  and not (es_alt && array['Dame cien gramos de jamón crudo.']::text[]);

update public.sentences set es_alt = es_alt || array['Dame doscientos gramos de jamón cocido y nada más.']::text[], note_en = coalesce(note_en, 'At the deli Argentines often say just “cocido” or “crudo” and leave out “jamón”.')
where id = 'edde8047-54bf-5f2c-a5db-91349a8c0166' and es = 'Dame doscientos gramos de cocido y nada más.' and en = 'Give me two hundred grams of cooked ham and that''s all.'
  and not (es_alt && array['Dame doscientos gramos de jamón cocido y nada más.']::text[]);

update public.sentences set es_alt = es_alt || array['En la fiambrería pedí un cuarto de kilo de jamón cocido.', 'Pedí un cuarto de kilo de jamón cocido en la fiambrería.']::text[], note_en = coalesce(note_en, 'At the shop Argentines just say “un cuarto”: everyone understands it means a quarter of a kilo.')
where id = 'dca2e53d-307a-5db2-bffa-7db427c6841b' and es = 'En la fiambrería pedí un cuarto de jamón cocido.' and en = 'At the deli I ordered a quarter kilo of cooked ham.'
  and not (es_alt && array['En la fiambrería pedí un cuarto de kilo de jamón cocido.', 'Pedí un cuarto de kilo de jamón cocido en la fiambrería.']::text[]);

update public.sentences set es_alt = es_alt || array['Es un cuarto de kilo, no falta un gramo.']::text[], note_en = coalesce(note_en, 'At the shop Argentines just say “un cuarto”: everyone understands it means a quarter of a kilo.')
where id = '482966a0-20c5-5e1c-b3f5-91c0418eab5a' and es = 'Es un cuarto, no falta un gramo.' and en = 'It''s a quarter kilo, not one gram less.'
  and not (es_alt && array['Es un cuarto de kilo, no falta un gramo.']::text[]);

update public.sentences set es_alt = es_alt || array['Hoy no hay jamón crudo.', 'No hay jamón crudo hoy.']::text[], note_en = coalesce(note_en, 'At the deli Argentines often say just “crudo” or “cocido” and leave out “jamón”.')
where id = 'cfc2265c-1329-5328-a055-ad40bc3cb556' and es = 'Hoy no hay crudo.' and en = 'There''s no cured ham today.'
  and not (es_alt && array['Hoy no hay jamón crudo.', 'No hay jamón crudo hoy.']::text[]);

update public.sentences set es_alt = es_alt || array['Quiero un cuarto de kilo de jamón crudo.']::text[], note_en = coalesce(note_en, 'At the shop Argentines just say “un cuarto”: everyone understands it means a quarter of a kilo.')
where id = '02a4507e-60a0-543c-9636-7b97b85a63fe' and es = 'Quiero un cuarto de jamón crudo.' and en = 'I want a quarter kilo of cured ham.'
  and not (es_alt && array['Quiero un cuarto de kilo de jamón crudo.']::text[]);

update public.sentences set es_alt = es_alt || array['Un cuarto de kilo de queso, por favor.', 'Por favor, un cuarto de kilo de queso.']::text[], note_en = coalesce(note_en, 'At the shop Argentines just say “un cuarto”: everyone understands it means a quarter of a kilo.')
where id = '85b3da2b-6c2c-5915-ba5b-a83f72e640de' and es = 'Un cuarto de queso, por favor.' and en = 'A quarter kilo of cheese, please.'
  and not (es_alt && array['Un cuarto de kilo de queso, por favor.', 'Por favor, un cuarto de kilo de queso.']::text[]);

update public.sentences set es_alt = es_alt || array['Un cuarto de kilo son doscientos cincuenta gramos.']::text[], note_en = coalesce(note_en, 'At the shop Argentines just say “un cuarto”: everyone understands it means a quarter of a kilo.')
where id = '806514f5-1cdb-5f97-9c8a-7023cdd94898' and es = 'Un cuarto son doscientos cincuenta gramos.' and en = 'A quarter kilo is two hundred fifty grams.'
  and not (es_alt && array['Un cuarto de kilo son doscientos cincuenta gramos.']::text[]);

update public.sentences set es_alt = es_alt || array['Esta palta está demasiado madura, dame otra.']::text[], note_en = coalesce(note_en, 'In everyday speech “muy” often does the job of “too”: the context makes it clear it''s more than you want.')
where id = 'a33a52af-753d-5564-a6b9-12a906593012' and es = 'Esta palta está muy madura, dame otra.' and en = 'This avocado is too ripe, give me another one.'
  and not (es_alt && array['Esta palta está demasiado madura, dame otra.']::text[]);

update public.sentences set es_alt = es_alt || array['Completá esto rápido, cierran a las seis.', 'Completá esto rápido, porque cierran a las seis.']::text[], note_en = coalesce(note_en, 'After an order, a little “que” often introduces the reason, like a quick “because”.')
where id = '66cfb55c-7ba2-5f37-a389-7e904d4d6923' and es = 'Completá esto rápido, que cierran a las seis.' and en = 'Fill this out quickly, they close at six.'
  and not (es_alt && array['Completá esto rápido, cierran a las seis.', 'Completá esto rápido, porque cierran a las seis.']::text[]);

update public.sentences set es_alt = es_alt || array['Ahora te mando la contraseña.', 'Te mando la contraseña ahora.']::text[], note_en = coalesce(note_en, 'Argentines say “ahí te mando” or “ahí voy” for something they are doing right away.')
where id = '66e27966-e459-579b-8ef3-5bd600543c0a' and es = 'Ahí te mando la contraseña.' and en = 'I''m sending you the password now.'
  and not (es_alt && array['Ahora te mando la contraseña.', 'Te mando la contraseña ahora.']::text[]);

update public.sentences set es_alt = es_alt || array['Pasame tu número y te llamo.', 'Dame tu número y te llamo.']::text[], note_en = coalesce(note_en, 'Argentines often say “tu celular” to mean your mobile number.')
where id = '5d7d054b-f76f-5843-9fad-41e430832655' and es = 'Pasame tu celular y te llamo.' and en = 'Give me your number and I''ll call you.'
  and not (es_alt && array['Pasame tu número y te llamo.', 'Dame tu número y te llamo.']::text[]);

update public.sentences set es_alt = es_alt || array['Casi no te escucho, ¿me llamás después?']::text[], note_en = coalesce(note_en, 'On a bad line Argentines usually say “te escucho re mal”: literally “I hear you really badly”.')
where id = '43750148-d2c9-510a-ba53-e39f4ca28898' and es = 'Te escucho re mal, ¿me llamás después?' and en = 'I can barely hear you, can you call me later?'
  and not (es_alt && array['Casi no te escucho, ¿me llamás después?']::text[]);

update public.sentences set es_alt = es_alt || array['El café de la esquina tiene wifi gratis.']::text[], note_en = coalesce(note_en, 'In Argentina the corner “bar” is often the place where you sit down for a coffee, so it covers what English calls a café.')
where id = '59e21b7c-95a1-54c9-b635-12ba4be19eec' and es = 'El bar de la esquina tiene wifi gratis.' and en = 'The café on the corner has free wifi.'
  and not (es_alt && array['El café de la esquina tiene wifi gratis.']::text[]);

update public.sentences set es_alt = es_alt || array['Necesito limpiar la pantalla.']::text[]
where id = '4a93a317-3f51-5a39-89e7-d27a304c3455' and es = 'Tengo que limpiar la pantalla.' and en = 'I need to clean the screen.'
  and not (es_alt && array['Necesito limpiar la pantalla.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenés que hacer la denuncia en la comisaría.']::text[], note_en = coalesce(note_en, '“Hay que” is the general “you have to”, meaning anyone has to. Argentines use it all the time for rules and procedures.')
where id = 'd0fa8914-b588-59be-92ab-8d1824d325d3' and es = 'Hay que hacer la denuncia en la comisaría.' and en = 'You have to file the report at the police station.'
  and not (es_alt && array['Tenés que hacer la denuncia en la comisaría.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenés que llamar a la policía.']::text[], note_en = coalesce(note_en, '“Hay que” is the general “you have to”, meaning someone has to do it, not necessarily you.')
where id = '278053db-45f3-5711-bf85-4a8c30246f9e' and es = 'Hay que llamar a la policía.' and en = 'You have to call the police.'
  and not (es_alt && array['Tenés que llamar a la policía.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te robaron? ¡Qué mala suerte!']::text[], note_en = coalesce(note_en, '“Qué garrón” is what Argentines say when something is a real drag or a stroke of bad luck.')
where id = 'b853ecbf-778b-518a-af7f-fca6bba56c01' and es = '¿Te robaron? ¡Qué garrón!' and en = 'You got robbed? What bad luck!'
  and not (es_alt && array['¿Te robaron? ¡Qué mala suerte!']::text[]);

update public.sentences set es_alt = es_alt || array['Dice que es tu sobrino: es una estafa.']::text[], note_en = coalesce(note_en, '“El cuento del tío” is the classic Argentine name for a con where someone tricks you with a made-up story.')
where id = 'd4a6e8cc-951f-5fed-83e1-a4ceecef399e' and es = 'Dice que es tu sobrino: es el cuento del tío.' and en = 'He says he''s your nephew: it''s a scam.'
  and not (es_alt && array['Dice que es tu sobrino: es una estafa.']::text[]);

update public.sentences set es_alt = es_alt || array['Es una estafa.']::text[], note_en = coalesce(note_en, '“El cuento del tío” is the classic Argentine name for a con where someone tricks you with a made-up story.')
where id = '8ea29f02-4bbd-54b9-b501-febf3059ac95' and es = 'Es el cuento del tío.' and en = 'It''s a scam.'
  and not (es_alt && array['Es una estafa.']::text[]);

update public.sentences set es_alt = es_alt || array['Me estafaron.']::text[], note_en = coalesce(note_en, '“El cuento del tío” is the classic Argentine name for a con where someone tricks you with a made-up story.')
where id = 'be24e3f8-eee0-538d-abb5-49cf8d44f65e' and es = 'Me hicieron el cuento del tío.' and en = 'They scammed me.'
  and not (es_alt && array['Me estafaron.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué le diste a Cami para su cumpleaños?']::text[], note_en = coalesce(note_en, '“Regalar” means to give something as a present, so it is the natural verb for birthdays.')
where id = '67debca9-1f32-594c-858c-e2cd708332eb' and es = '¿Qué le regalaste a Cami para su cumpleaños?' and en = 'What did you give Cami for her birthday?'
  and not (es_alt && array['¿Qué le diste a Cami para su cumpleaños?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué le diste?']::text[], note_en = coalesce(note_en, '“Regalar” means to give something as a present.')
where id = '2af64175-408f-5050-a4d5-d0f1c29461d9' and es = '¿Qué le regalaste?' and en = 'What did you give him?'
  and not (es_alt && array['¿Qué le diste?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué les diste?']::text[], note_en = coalesce(note_en, '“Regalar” means to give something as a present.')
where id = '26bc45b9-240a-5d48-ad3e-65f79a8be76e' and es = '¿Qué les regalaste?' and en = 'What did you give them?'
  and not (es_alt && array['¿Qué les diste?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué me diste?']::text[], note_en = coalesce(note_en, '“Regalar” means to give something as a present.')
where id = '9d759267-6fe2-59ee-bcf0-fd78f54deedf' and es = '¿Qué me regalaste?' and en = 'What did you give me?'
  and not (es_alt && array['¿Qué me diste?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Se lo diste a Sofi?']::text[], note_en = coalesce(note_en, '“Regalar” means to give something as a present.')
where id = '9fa2b7b0-796d-5e8d-a8ee-c675d1d43cf4' and es = '¿Se lo regalaste a Sofi?' and en = 'Did you give it to Sofi?'
  and not (es_alt && array['¿Se lo diste a Sofi?']::text[]);

update public.sentences set es_alt = es_alt || array['Le di un libro.']::text[], note_en = coalesce(note_en, '“Regalar” means to give something as a present.')
where id = 'a103d50e-e98f-5796-8b10-6b0e3aa151e4' and es = 'Le regalé un libro.' and en = 'I gave him a book.'
  and not (es_alt && array['Le di un libro.']::text[]);

update public.sentences set es_alt = es_alt || array['Le di un vino a Mati.', 'Le regalé una botella de vino a Mati.', 'Le di una botella de vino a Mati.']::text[], note_en = coalesce(note_en, '“Regalar” means to give something as a present. And “un vino” on its own already means a bottle of wine.')
where id = '53250aa6-dcf2-5f5c-b4ef-29c8bd4afda4' and es = 'Le regalé un vino a Mati.' and en = 'I gave Mati a bottle of wine.'
  and not (es_alt && array['Le di un vino a Mati.', 'Le regalé una botella de vino a Mati.', 'Le di una botella de vino a Mati.']::text[]);

update public.sentences set es_alt = es_alt || array['Me encanta la campera que me diste.']::text[], note_en = coalesce(note_en, '“Regalar” means to give something as a present.')
where id = '3dfdc081-6477-59a5-a6fe-b4980242db7e' and es = 'Me encanta la campera que me regalaste.' and en = 'I love the jacket you gave me.'
  and not (es_alt && array['Me encanta la campera que me diste.']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo la campera, se la di a Mica.']::text[], note_en = coalesce(note_en, '“Regalar” means to give something away as a present, for keeps.')
where id = '867531b4-b69f-5e4c-a441-1a34bdc5399c' and es = 'No tengo la campera, se la regalé a Mica.' and en = 'I don''t have the jacket, I gave it to Mica.'
  and not (es_alt && array['No tengo la campera, se la di a Mica.']::text[]);

update public.sentences set es_alt = es_alt || array['Para su cumpleaños le di una remera azul.']::text[], note_en = coalesce(note_en, '“Regalar” means to give something as a present, so it is the natural verb for birthdays.')
where id = '99b272f5-fa41-53c0-aa3d-c21ad07418ff' and es = 'Para su cumpleaños le regalé una remera azul.' and en = 'For his birthday I gave him a blue T-shirt.'
  and not (es_alt && array['Para su cumpleaños le di una remera azul.']::text[]);

update public.sentences set es_alt = es_alt || array['Se los di.']::text[], note_en = coalesce(note_en, '“Regalar” means to give something as a present.')
where id = '0e037c9d-2cf7-5b32-9730-0007cb096e86' and es = 'Se los regalé.' and en = 'I gave them to her.'
  and not (es_alt && array['Se los di.']::text[]);

update public.sentences set es_alt = es_alt || array['Te lo di.']::text[], note_en = coalesce(note_en, '“Regalar” means to give something as a present.')
where id = 'f028750e-952f-5291-94b8-a806b6641def' and es = 'Te lo regalé.' and en = 'I gave it to you.'
  and not (es_alt && array['Te lo di.']::text[]);

update public.sentences set es_alt = es_alt || array['Me tengo que ir, que llegó mi jefe; decímelo después.', 'Me tengo que ir, que recién llegó mi jefe; decímelo después.', 'Me tengo que ir, llegó mi jefe; decímelo después.', 'Me tengo que ir, recién llegó mi jefe; decímelo después.']::text[], note_en = coalesce(note_en, '“Te dejo” (literally “I leave you”) is a very common way to wrap up a call or chat in Argentina.')
where id = 'a2237548-1f8f-5de7-b23f-b935edc8ffd5' and es = 'Te dejo, que llegó mi jefe; decímelo después.' and en = 'I have to go, my boss just arrived; tell me later.'
  and not (es_alt && array['Me tengo que ir, que llegó mi jefe; decímelo después.', 'Me tengo que ir, que recién llegó mi jefe; decímelo después.', 'Me tengo que ir, llegó mi jefe; decímelo después.', 'Me tengo que ir, recién llegó mi jefe; decímelo después.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me prestás tu taladro?']::text[], note_en = coalesce(note_en, 'Spanish asks “will you lend me” where English says “can I borrow”, and usually says “el” instead of “tu” when it is obvious whose thing it is.')
where id = '77df7290-971b-5f6f-b28d-4b973aaf78bf' and es = '¿Me prestás el taladro?' and en = 'Can I borrow your drill?'
  and not (es_alt && array['¿Me prestás tu taladro?']::text[]);

update public.sentences set es_alt = es_alt || array['Guardame una porción, ya vuelvo.']::text[], note_en = coalesce(note_en, 'Argentines say “ya vengo” (literally “I''m coming now”) to mean “I''ll be right back”.')
where id = 'bbb877d9-a610-5ed2-a84b-180d5d152ae9' and es = 'Guardame una porción, ya vengo.' and en = 'Save me a slice, I''ll be right back.'
  and not (es_alt && array['Guardame una porción, ya vuelvo.']::text[]);

update public.sentences set es_alt = es_alt || array['Te doy mi número.']::text[], note_en = coalesce(note_en, 'Argentines use “pasar” for handing over information: a number, an address, a password.')
where id = 'a53f2244-4f8b-53dd-a17a-92991b0b8721' and es = 'Te paso mi número.' and en = 'I''ll give you my number.'
  and not (es_alt && array['Te doy mi número.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué horario tenés?', '¿En qué horario trabajás?', '¿En qué horario laburás?']::text[], note_en = coalesce(note_en, 'Argentines say “hacer” a schedule: “¿Qué horario hacés?”')
where id = 'c9b99230-aaca-5055-82da-7dd5da6486e5' and es = '¿Qué horario hacés?' and en = 'What hours do you work?'
  and not (es_alt && array['¿Qué horario tenés?', '¿En qué horario trabajás?', '¿En qué horario laburás?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuál es tu horario?']::text[]
where id = '90068494-cec9-542a-b67f-242087b8c688' and es = '¿Qué horario tenés?' and en = 'What''s your schedule?'
  and not (es_alt && array['¿Cuál es tu horario?']::text[]);

update public.sentences set es_alt = es_alt || array['El sueldo es muy bueno, pero el horario es malo.', 'El sueldo es re bueno, pero el horario es malo.']::text[], note_en = coalesce(note_en, 'The ending “-ísimo” is a common way to say “really” or “very”: buenísimo = really good.')
where id = '30f3a7d4-0333-546d-820d-6c0a025d2f5c' and es = 'El sueldo es buenísimo, pero el horario es malo.' and en = 'The pay is really good, but the schedule is bad.'
  and not (es_alt && array['El sueldo es muy bueno, pero el horario es malo.', 'El sueldo es re bueno, pero el horario es malo.']::text[]);

update public.sentences set es_alt = es_alt || array['Renuncié y ahora trabajo desde casa para otra empresa.', 'Renuncié y ahora laburo desde casa para otra empresa.']::text[], note_en = coalesce(note_en, 'In Argentina people say “hacer home office” for working from home, borrowing the English words.')
where id = '731c96e8-19f2-5e7a-9ce3-ceadefa89c0e' and es = 'Renuncié y ahora hago home office para otra empresa.' and en = 'I quit and now I work from home for another company.'
  and not (es_alt && array['Renuncié y ahora trabajo desde casa para otra empresa.', 'Renuncié y ahora laburo desde casa para otra empresa.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar con el currículum?', '¿Me podés ayudar con mi currículum?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿Me ayudás?” already means “Can you help me?”.')
where id = 'cd14e2ae-0d97-5a1b-919f-36e163ec4378' and es = '¿Me ayudás con el currículum?' and en = 'Can you help me with my résumé?'
  and not (es_alt && array['¿Me podés ayudar con el currículum?', '¿Me podés ayudar con mi currículum?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés pasar tu currículum?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿Me pasás…?” already means “Can you send me…?”.')
where id = 'ac178f35-7157-5760-b8eb-c778f0a8590b' and es = '¿Me pasás tu currículum?' and en = 'Can you send me your résumé?'
  and not (es_alt && array['¿Me podés pasar tu currículum?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi licencia empieza mañana.', 'Mañana empieza mi licencia.']::text[]
where id = '7a2461f6-47f7-5406-9b86-1f8b9ee83f9f' and es = 'Mañana empiezo la licencia.' and en = 'My leave starts tomorrow.'
  and not (es_alt && array['Mi licencia empieza mañana.', 'Mañana empieza mi licencia.']::text[]);

update public.sentences set es_alt = es_alt || array['El bar estaba lleno.']::text[]
where id = 'a7ecad3b-62d6-5bf1-a634-a750bc0351c1' and es = 'El bar estaba lleno de gente.' and en = 'The bar was packed.'
  and not (es_alt && array['El bar estaba lleno.']::text[]);

update public.sentences set es_alt = es_alt || array['Esperé una hora y no vino.']::text[], note_en = coalesce(note_en, '“Quedarse” + a verb in -ando shows you were left there doing something: “me quedé esperando” is “I was left waiting”.')
where id = '5bf24f47-4052-5532-b976-ab38b8b1535c' and es = 'Me quedé esperando una hora y no vino.' and en = 'I waited for an hour and he never showed up.'
  and not (es_alt && array['Esperé una hora y no vino.']::text[]);

update public.sentences set es_alt = es_alt || array['No conseguí un taxi.']::text[], note_en = coalesce(note_en, '“No conseguí” on its own already means you tried and couldn''t get it.')
where id = 'f6b8123a-c25e-5f77-bc09-75eb8439c85c' and es = 'No conseguí taxi.' and en = 'I couldn''t get a taxi.'
  and not (es_alt && array['No conseguí un taxi.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenés que cruzar la calle.']::text[], note_en = coalesce(note_en, '“Hay que” is the impersonal “you have to”: it doesn''t point at anyone in particular.')
where id = '3845982e-c9f0-5a5d-9681-f17627ee91d5' and es = 'Hay que cruzar la calle.' and en = 'You have to cross the street.'
  and not (es_alt && array['Tenés que cruzar la calle.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana temprano tenemos que manejar hasta Rosario.', 'Tenemos que manejar hasta Rosario mañana temprano.']::text[], note_en = coalesce(note_en, '“Hay que” is impersonal: it says something has to be done without naming who.')
where id = 'a47378e4-b6ff-5e33-bc46-809bcad31f43' and es = 'Mañana temprano hay que manejar hasta Rosario.' and en = 'Early tomorrow we have to drive to Rosario.'
  and not (es_alt && array['Mañana temprano tenemos que manejar hasta Rosario.', 'Tenemos que manejar hasta Rosario mañana temprano.']::text[]);

update public.sentences set es_alt = es_alt || array['Poné la mochila en el auto.']::text[]
where id = '2393bb8f-ff1b-5946-98e8-026cdcf22f51' and es = 'Cargá la mochila en el auto.' and en = 'Put the backpack in the car.'
  and not (es_alt && array['Poné la mochila en el auto.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando llueve, cuesta frenar.', 'Cuesta frenar cuando llueve.']::text[]
where id = '6b890c99-12bb-50e6-a5b5-06741b14128b' and es = 'Si llueve, cuesta frenar.' and en = 'When it rains, it''s hard to brake.'
  and not (es_alt && array['Cuando llueve, cuesta frenar.', 'Cuesta frenar cuando llueve.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Hay alguien ahí?']::text[]
where id = '8d0cf655-ddca-5556-a405-66307848ae5f' and es = '¿Hay alguien?' and en = 'Is anyone there?'
  and not (es_alt && array['¿Hay alguien ahí?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tu pareja es de Buenos Aires?']::text[], note_en = coalesce(note_en, 'People from the city of Buenos Aires are called “porteños”.')
where id = '71d1d321-dba5-5b9c-b605-b1f188648801' and es = '¿Tu pareja es porteña?' and en = 'Is your partner from Buenos Aires?'
  and not (es_alt && array['¿Tu pareja es de Buenos Aires?']::text[]);

update public.sentences set es_alt = es_alt || array['Esta es mi pareja.']::text[]
where id = 'eed881e1-37fb-54d6-b5d8-3d16f3e08a6d' and es = 'Es mi pareja.' and en = 'This is my partner.'
  and not (es_alt && array['Esta es mi pareja.']::text[]);

update public.sentences set es_alt = es_alt || array['No hay nadie acá.', 'Acá no hay nadie.']::text[]
where id = '67b83d64-47d4-59e7-ba86-3d59eef40a3e' and es = 'No hay nadie.' and en = 'There''s nobody here.'
  and not (es_alt && array['No hay nadie acá.', 'Acá no hay nadie.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi amor, ¿me pasás la sal?', 'Amor, ¿me podés pasar la sal?', 'Mi amor, ¿me podés pasar la sal?']::text[], note_en = coalesce(note_en, 'Couples say plain “amor” just as often as “mi amor”, and a favor is usually asked with the plain present: “¿Me pasás…?”.')
where id = '3b576b4d-3490-50fb-9fd1-eef61ae5318f' and es = 'Amor, ¿me pasás la sal?' and en = 'My love, can you pass me the salt?'
  and not (es_alt && array['Mi amor, ¿me pasás la sal?', 'Amor, ¿me podés pasar la sal?', 'Mi amor, ¿me podés pasar la sal?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi amor, llego tarde: tengo una reunión a las ocho.']::text[]
where id = 'e7170b91-ff20-55df-9487-143360461132' and es = 'Amor, llego tarde: tengo una reunión a las ocho.' and en = 'My love, I''ll be late: I have a meeting at eight.'
  and not (es_alt && array['Mi amor, llego tarde: tengo una reunión a las ocho.']::text[]);

update public.sentences set es_alt = es_alt || array['Te extraño, mi amor.', 'Mi amor, te extraño.']::text[]
where id = 'b3cc2487-b829-5109-a866-bc0147de309a' and es = 'Te extraño, amor.' and en = 'I miss you, my love.'
  and not (es_alt && array['Te extraño, mi amor.', 'Mi amor, te extraño.']::text[]);

update public.sentences set es_alt = es_alt || array['Dale un beso a tu mamá de mi parte.', 'Dale un beso a tu mamá.']::text[], note_en = coalesce(note_en, 'Argentines send greetings with just “Un beso a…”: the “give” and “for me” are understood.')
where id = '8db40691-a41c-5a08-b07f-f768d3439767' and es = 'Un beso a tu mamá.' and en = 'Give your mom a kiss for me.'
  and not (es_alt && array['Dale un beso a tu mamá de mi parte.', 'Dale un beso a tu mamá.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué te parece tu suegra?', '¿Qué pensás de tu suegra?']::text[], note_en = coalesce(note_en, '“Caer bien” or “caer mal” is the everyday way to say you like or dislike someone, so “¿Cómo te cae?” asks what you think of a person.')
where id = 'e36259a7-bca1-5e80-ae90-1a57d71dabc7' and es = '¿Cómo te cae tu suegra?' and en = 'What do you think of your mother-in-law?'
  and not (es_alt && array['¿Qué te parece tu suegra?', '¿Qué pensás de tu suegra?']::text[]);

update public.sentences set es_alt = es_alt || array['Lo conocí ayer y me cayó re bien.', 'Lo conocí ayer y me cayó muy bien.']::text[], note_en = coalesce(note_en, '“Bárbaro” means “great” in Argentina, so “me cayó bárbaro” is the same as “me cayó re bien”.')
where id = '11b6c643-c4d9-5f3b-be57-65b33bad2d71' and es = 'Lo conocí ayer y me cayó bárbaro.' and en = 'I met him yesterday and I really liked him.'
  and not (es_alt && array['Lo conocí ayer y me cayó re bien.', 'Lo conocí ayer y me cayó muy bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Los pibes de la facu me caen re bien.', 'Los pibes de la facu me caen muy bien.']::text[], note_en = coalesce(note_en, '“Bárbaro” means “great” in Argentina, so “me caen bárbaro” is the same as “me caen re bien”.')
where id = '188c8a1d-2b78-5a28-8a77-6d43d3b3235d' and es = 'Los pibes de la facu me caen bárbaro.' and en = 'I really like the guys from college.'
  and not (es_alt && array['Los pibes de la facu me caen re bien.', 'Los pibes de la facu me caen muy bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi suegro me cayó re bien.', 'Mi suegro me cayó muy bien.']::text[], note_en = coalesce(note_en, '“Bárbaro” means “great” in Argentina, so “me cayó bárbaro” is the same as “me cayó re bien”.')
where id = '743d4a59-b824-575b-8fb9-92e8a0276792' and es = 'Mi suegro me cayó bárbaro.' and en = 'I really liked my father-in-law.'
  and not (es_alt && array['Mi suegro me cayó re bien.', 'Mi suegro me cayó muy bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi vecino me cae re bien.', 'Mi vecino me cae muy bien.']::text[], note_en = coalesce(note_en, '“Bárbaro” means “great” in Argentina, so “me cae bárbaro” is the same as “me cae re bien”.')
where id = '43e2d4f6-2e48-57ff-a25d-0a37eb90a7c1' and es = 'Mi vecino me cae bárbaro.' and en = 'I really like my neighbor.'
  and not (es_alt && array['Mi vecino me cae re bien.', 'Mi vecino me cae muy bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Santi me cayó re bien.', 'Santi me cayó muy bien.']::text[], note_en = coalesce(note_en, '“Bárbaro” means “great” in Argentina, so “me cayó bárbaro” is the same as “me cayó re bien”.')
where id = '7f0f222e-8ad4-5b53-9d63-6fa0392f5eac' and es = 'Santi me cayó bárbaro.' and en = 'I really liked Santi.'
  and not (es_alt && array['Santi me cayó re bien.', 'Santi me cayó muy bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Tus hermanas me caen re bien.', 'Tus hermanas me caen muy bien.']::text[], note_en = coalesce(note_en, '“Bárbaro” means “great” in Argentina, so “me caen bárbaro” is the same as “me caen re bien”.')
where id = '6df4f977-5915-5cb2-8fe9-71a845500123' and es = 'Tus hermanas me caen bárbaro.' and en = 'I really like your sisters.'
  and not (es_alt && array['Tus hermanas me caen re bien.', 'Tus hermanas me caen muy bien.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué piensa tu vieja de tu novio?']::text[], note_en = coalesce(note_en, '“Caer bien” or “caer mal” is the everyday way to say you like or dislike someone, so “¿Cómo le cae?” asks what someone thinks of a person.')
where id = 'aafc5458-01b0-5ff0-a230-2443e8350ed9' and es = '¿Cómo le cae tu novio a tu vieja?' and en = 'What does your mom think of your boyfriend?'
  and not (es_alt && array['¿Qué piensa tu vieja de tu novio?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué pensás de tus compañeros?']::text[], note_en = coalesce(note_en, '“Caer bien” or “caer mal” is the everyday way to say you like or dislike someone, so “¿Cómo te caen?” asks what you think of people.')
where id = 'c107bbeb-3694-54ae-a758-7efbbeea60dc' and es = '¿Cómo te caen tus compañeros?' and en = 'What do you think of your coworkers?'
  and not (es_alt && array['¿Qué pensás de tus compañeros?']::text[]);

update public.sentences set es_alt = es_alt || array['¿El vecino nuevo? Nos cae re bien.', '¿El vecino nuevo? Nos cae muy bien.']::text[], note_en = coalesce(note_en, '"Caer bárbaro" is a very Argentine way to say you really like someone: "bárbaro" here means "great".')
where id = 'c0694ec2-1358-5d7e-8cd0-ea233dc2e18a' and es = '¿El vecino nuevo? Nos cae bárbaro.' and en = 'The new neighbor? We really like him.'
  and not (es_alt && array['¿El vecino nuevo? Nos cae re bien.', '¿El vecino nuevo? Nos cae muy bien.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Por qué no se llevan bien Juli y Santi?', '¿Por qué Juli y Santi no se llevan bien?']::text[]
where id = '9aa95f8a-208f-5a71-a95a-0f53e38ffa87' and es = '¿Por qué se llevan tan mal Juli y Santi?' and en = 'Why don''t Juli and Santi get along?'
  and not (es_alt && array['¿Por qué no se llevan bien Juli y Santi?', '¿Por qué Juli y Santi no se llevan bien?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Por qué no te llevás bien con tu hermano?']::text[]
where id = '7dda08a3-dfbd-5711-a2d0-b263da323241' and es = '¿Por qué te llevás tan mal con tu hermano?' and en = 'Why don''t you get along with your brother?'
  and not (es_alt && array['¿Por qué no te llevás bien con tu hermano?']::text[]);

update public.sentences set es_alt = es_alt || array['A mi jefe no le cae bien nadie.', 'A mi jefe nadie le cae bien.']::text[]
where id = '07c8fb83-849c-534f-9f72-22ba9908b000' and es = 'A mi jefe le cae mal todo el mundo.' and en = 'My boss doesn''t like anybody.'
  and not (es_alt && array['A mi jefe no le cae bien nadie.', 'A mi jefe nadie le cae bien.']::text[]);

update public.sentences set es_alt = es_alt || array['A Mica no le cayó bien.', 'No le cayó bien a Mica.']::text[]
where id = '8b65e6d1-b912-551f-a4ce-2596085759e4' and es = 'A Mica le cayó mal.' and en = 'Mica didn''t like him.'
  and not (es_alt && array['A Mica no le cayó bien.', 'No le cayó bien a Mica.']::text[]);

update public.sentences set es_alt = es_alt || array['A mis compañeros no les cae bien el jefe nuevo.', 'El jefe nuevo no les cae bien a mis compañeros.']::text[]
where id = '29beb692-3e94-5043-8ba9-3baa00a8585c' and es = 'A mis compañeros les cae mal el jefe nuevo.' and en = 'My coworkers don''t like the new boss.'
  and not (es_alt && array['A mis compañeros no les cae bien el jefe nuevo.', 'El jefe nuevo no les cae bien a mis compañeros.']::text[]);

update public.sentences set es_alt = es_alt || array['Juli y yo nos hicimos amigas.', 'Juli y yo nos hicimos amigos.']::text[], note_en = coalesce(note_en, 'Argentines often say "Con Juli nos hicimos..." to mean "Juli and I...": the "we" already includes Juli.')
where id = 'c39c6856-0bc3-5586-8568-e7fb091452a6' and es = 'Con Juli nos hicimos amigas.' and en = 'Juli and I became friends.'
  and not (es_alt && array['Juli y yo nos hicimos amigas.', 'Juli y yo nos hicimos amigos.']::text[]);

update public.sentences set es_alt = es_alt || array['Mati y yo somos amigos de toda la vida.', 'Con Mati somos amigos de toda la vida.']::text[]
where id = 'aab65c34-81bb-58cf-8fd7-f268dce0a81f' and es = 'Con Mati tengo una amistad de toda la vida.' and en = 'Mati and I have been friends our whole lives.'
  and not (es_alt && array['Mati y yo somos amigos de toda la vida.', 'Con Mati somos amigos de toda la vida.']::text[]);

update public.sentences set es_alt = es_alt || array['Belén y Nico tienen una química increíble.']::text[]
where id = '00f07231-628a-56a7-90f3-858dc38b2e2e' and es = 'Entre Belén y Nico hay una química increíble.' and en = 'Belén and Nico have amazing chemistry.'
  and not (es_alt && array['Belén y Nico tienen una química increíble.']::text[]);

update public.sentences set es_alt = es_alt || array['Mis hermanos no te caen bien, ¿no?', 'No te caen bien mis hermanos, ¿no?']::text[]
where id = 'bd4f4411-4ef2-56cd-b64d-9c15c5f4632c' and es = 'Mis hermanos te caen mal, ¿no?' and en = 'You don''t like my brothers, do you?'
  and not (es_alt && array['Mis hermanos no te caen bien, ¿no?', 'No te caen bien mis hermanos, ¿no?']::text[]);

update public.sentences set es_alt = es_alt || array['No te llevás bien con Santi, ¿no?']::text[]
where id = 'ded7e3c2-606a-5d4b-aa30-7cfd96c62e00' and es = 'Te llevás mal con Santi, ¿no?' and en = 'You don''t get along with Santi, right?'
  and not (es_alt && array['No te llevás bien con Santi, ¿no?']::text[]);

update public.sentences set es_alt = es_alt || array['¡Qué falsa es!', '¡Es tan falsa!', '¡Es re falsa!']::text[], note_en = coalesce(note_en, 'Argentines love "¡Qué ... que ...!" for exclamations. The second "que" is optional and just adds punch.')
where id = '6e893308-1e9e-5188-9f63-075d9d3d78bc' and es = '¡Qué falsa que es!' and en = 'She''s so fake!'
  and not (es_alt && array['¡Qué falsa es!', '¡Es tan falsa!', '¡Es re falsa!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Qué hipócrita sos!', '¡Sos tan hipócrita!']::text[], note_en = coalesce(note_en, 'Argentines love "¡Qué ... que ...!" for exclamations. The second "que" is optional and just adds punch.')
where id = 'bb65b56b-f10a-55ee-b3bc-60061d79956a' and es = '¡Qué hipócrita que sos!' and en = 'You''re such a hypocrite!'
  and not (es_alt && array['¡Qué hipócrita sos!', '¡Sos tan hipócrita!']::text[]);

update public.sentences set es_alt = es_alt || array['A mi cuñado no lo aguanto, es falso.', 'No aguanto a mi cuñado, es falso.', 'No lo aguanto a mi cuñado, es falso.']::text[], note_en = coalesce(note_en, 'Argentines often say "es un falso", turning the adjective into a noun: it sounds stronger, like calling him "a fake".')
where id = '05be1cc3-ab09-5102-b8dd-c632c7633acf' and es = 'A mi cuñado no lo aguanto, es un falso.' and en = 'I can''t stand my brother-in-law, he''s fake.'
  and not (es_alt && array['A mi cuñado no lo aguanto, es falso.', 'No aguanto a mi cuñado, es falso.', 'No lo aguanto a mi cuñado, es falso.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi ex era falsa.', 'Mi ex era falso.']::text[], note_en = coalesce(note_en, 'Argentines often say "es una falsa", turning the adjective into a noun: it sounds stronger, like calling her "a fake".')
where id = 'c66b9c93-ed2d-5e01-82e2-7b89460aca55' and es = 'Mi ex era una falsa.' and en = 'My ex was fake.'
  and not (es_alt && array['Mi ex era falsa.', 'Mi ex era falso.']::text[]);

update public.sentences set es_alt = es_alt || array['Nico es falso.']::text[], note_en = coalesce(note_en, 'Argentines often say "es un falso", turning the adjective into a noun: it sounds stronger, like calling him "a fake".')
where id = '59ecfe53-e74a-558a-8d5d-4c8c9dab9d4f' and es = 'Nico es un falso.' and en = 'Nico is fake.'
  and not (es_alt && array['Nico es falso.']::text[]);

update public.sentences set es_alt = es_alt || array['No me cae bien, pero lo respeto.']::text[]
where id = '60ef7e03-73d3-5d78-9a63-c2f1691cc068' and es = 'No me cae bien, pero le tengo respeto.' and en = 'I don''t like him, but I respect him.'
  and not (es_alt && array['No me cae bien, pero lo respeto.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuándo vuelve Cami de su luna de miel?', '¿Cami cuándo vuelve de su luna de miel?']::text[]
where id = 'fa927879-ad03-534f-81c0-028b4ceea9fd' and es = '¿Cuándo vuelve Cami de la luna de miel?' and en = 'When is Cami coming back from her honeymoon?'
  and not (es_alt && array['¿Cuándo vuelve Cami de su luna de miel?', '¿Cami cuándo vuelve de su luna de miel?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hermana es la madrina del casamiento.', 'Mi hermana es la madrina en el casamiento.']::text[]
where id = 'ebbbbf1a-35df-5f84-abf7-6e3531e3e03e' and es = 'Mi hermana es la madrina de casamiento.' and en = 'My sister is the madrina at the wedding.'
  and not (es_alt && array['Mi hermana es la madrina del casamiento.', 'Mi hermana es la madrina en el casamiento.']::text[]);

update public.sentences set es_alt = es_alt || array['Solo un casamiento por civil, nada más.']::text[]
where id = '9786c53b-0607-549b-a5b9-f03cbea0ccab' and es = 'Un casamiento por civil, nada más.' and en = 'Just a civil wedding, nothing else.'
  and not (es_alt && array['Solo un casamiento por civil, nada más.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Viene Diego? —Capaz que no, está re ocupado.', '—¿Diego viene? —Capaz que no, está re ocupado.', '—¿Viene Diego? —Capaz no, está re ocupado.']::text[], note_en = coalesce(note_en, 'The future "vendrá" in a question is a guess out loud, like "I wonder if Diego''s coming".')
where id = '77c4ec74-3078-5406-88fd-7c050bad2fe3' and es = '—¿Vendrá Diego? —Capaz que no, está re ocupado.' and en = '—Is Diego coming? —Maybe not, he''s really busy.'
  and not (es_alt && array['—¿Viene Diego? —Capaz que no, está re ocupado.', '—¿Diego viene? —Capaz que no, está re ocupado.', '—¿Viene Diego? —Capaz no, está re ocupado.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés hacer una receta, por favor?']::text[], note_en = coalesce(note_en, 'Argentines often ask for things with the plain present, "¿Me hacés...?", where English says "Can you...?".')
where id = 'c4fd2003-de23-5805-9d6f-e5bb5f067fcd' and es = '¿Me hacés una receta, por favor?' and en = 'Can you write me a prescription, please?'
  and not (es_alt && array['¿Me podés hacer una receta, por favor?']::text[]);

update public.sentences set es_alt = es_alt || array['Tomé una pastilla.']::text[], note_en = coalesce(note_en, 'Argentines often add "me" with eating and drinking verbs (me tomé, me comí). It sounds more personal, but the meaning is the same.')
where id = '35cbc618-4617-58f1-bf0b-cc00d5c97311' and es = 'Me tomé una pastilla.' and en = 'I took a pill.'
  and not (es_alt && array['Tomé una pastilla.']::text[]);

update public.sentences set es_alt = es_alt || array['Mejorate, el sábado es el asado.', 'Mejorate, el asado es el sábado.']::text[], note_en = coalesce(note_en, 'This "que" means something like "because": Argentines often use it after a command to give the reason.')
where id = 'e0290586-f51b-5e9b-bc3d-1e76982531b1' and es = 'Mejorate, que el sábado es el asado.' and en = 'Get well soon, the asado is on Saturday.'
  and not (es_alt && array['Mejorate, el sábado es el asado.', 'Mejorate, el asado es el sábado.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cada cuánto tomo el jarabe?', '¿Cada cuánto tomo el jarabe para la tos?']::text[]
where id = 'dfd62370-302d-5859-9a43-1372ef95c68a' and es = '¿Cada cuántas horas tomo el jarabe?' and en = 'How often do I take the cough syrup?'
  and not (es_alt && array['¿Cada cuánto tomo el jarabe?', '¿Cada cuánto tomo el jarabe para la tos?']::text[]);

update public.sentences set es_alt = es_alt || array['Con mi prepaga conseguí turno enseguida.', 'Conseguí turno enseguida con mi prepaga.']::text[]
where id = '2ec3b1c8-4158-5610-9062-618a7f06752a' and es = 'Con la prepaga conseguí turno enseguida.' and en = 'With my private plan, I got an appointment right away.'
  and not (es_alt && array['Con mi prepaga conseguí turno enseguida.', 'Conseguí turno enseguida con mi prepaga.']::text[]);

update public.sentences set es_alt = es_alt || array['Después de la gripe estaba re cansado.', 'Después de la gripe estaba re cansada.', 'Estaba re cansado después de la gripe.']::text[], note_en = coalesce(note_en, '"Quedarse" + adjective describes how something left you: the flu left me really tired.')
where id = '3731d48c-24fe-5a0d-918e-e49e226016db' and es = 'Después de la gripe me quedé re cansado.' and en = 'I was really tired after the flu.'
  and not (es_alt && array['Después de la gripe estaba re cansado.', 'Después de la gripe estaba re cansada.', 'Estaba re cansado después de la gripe.']::text[]);

update public.sentences set es_alt = es_alt || array['La prepaga es re cara.']::text[], note_en = coalesce(note_en, 'With prices, Argentines often say "está caro": it points at how expensive something is right now.')
where id = 'b6a2c73a-0c30-5c53-a1f5-a1b76659ec65' and es = 'La prepaga está re cara.' and en = 'Private health insurance is really expensive.'
  and not (es_alt && array['La prepaga es re cara.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuelo se siente bien, pero no toma su remedio.']::text[]
where id = '4137a786-673f-594e-afd6-7a3c9fa2cd32' and es = 'Mi abuelo se siente bien, pero no toma el remedio.' and en = 'My grandfather feels fine, but he doesn''t take his medicine.'
  and not (es_alt && array['Mi abuelo se siente bien, pero no toma su remedio.']::text[]);

update public.sentences set es_alt = es_alt || array['No podés comer antes del análisis de sangre.', 'Antes del análisis de sangre no podés comer.', 'No se puede comer antes del análisis de sangre.']::text[]
where id = 'f4721a8e-8170-5dcd-bddc-3d5073554766' and es = 'Para el análisis de sangre hay que ir sin comer.' and en = 'You can''t eat before the blood test.'
  and not (es_alt && array['No podés comer antes del análisis de sangre.', 'Antes del análisis de sangre no podés comer.', 'No se puede comer antes del análisis de sangre.']::text[]);

update public.sentences set es_alt = es_alt || array['No necesitás turno para la vacuna de la gripe.', 'Para la vacuna de la gripe no necesitás turno.']::text[]
where id = 'd9077cb8-8557-51a8-8c54-4b9e24f7f9ec' and es = 'Para la vacuna de la gripe no hace falta turno.' and en = 'You don''t need an appointment for the flu shot.'
  and not (es_alt && array['No necesitás turno para la vacuna de la gripe.', 'Para la vacuna de la gripe no necesitás turno.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Se separaron? —Supongo que sí, ya no viven juntos.']::text[]
where id = '105eb7ab-e8da-5c36-9b7b-55862ad72163' and es = '—¿Se separaron? —Supongo, ya no viven juntos.' and en = '—Did they split up? —I guess so, they don''t live together anymore.'
  and not (es_alt && array['—¿Se separaron? —Supongo que sí, ya no viven juntos.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Vendrá con su ex o con el novio nuevo?']::text[]
where id = '442473da-c379-59d6-8120-a15f0c59ad46' and es = '¿Vendrá con el ex o con el novio nuevo?' and en = 'I wonder if she''s coming with her ex or with the new boyfriend.'
  and not (es_alt && array['¿Vendrá con su ex o con el novio nuevo?']::text[]);

update public.sentences set es_alt = es_alt || array['Ana probablemente está en el subte, no tiene señal.', 'Probablemente Ana está en el subte, no tiene señal.', 'Ana debe estar en el subte, no tiene señal.']::text[], note_en = coalesce(note_en, 'Argentines often use the future tense to guess about the present: "estará" means "she''s probably".')
where id = '946c3058-7e51-5036-86af-8f534f7abcf8' and es = 'Ana estará en el subte, no tiene señal.' and en = 'Ana''s probably on the subway; she has no signal.'
  and not (es_alt && array['Ana probablemente está en el subte, no tiene señal.', 'Probablemente Ana está en el subte, no tiene señal.', 'Ana debe estar en el subte, no tiene señal.']::text[]);

update public.sentences set es_alt = es_alt || array['Con este dolor de panza no puedo comer nada.', 'No puedo comer nada con este dolor de panza.']::text[]
where id = 'ae80b6d0-4f08-5ec9-b7d8-02ce5e1a3411' and es = 'Con este dolor de panza no como nada.' and en = 'I can''t eat a thing with this stomachache.'
  and not (es_alt && array['Con este dolor de panza no puedo comer nada.', 'No puedo comer nada con este dolor de panza.']::text[]);

update public.sentences set es_alt = es_alt || array['El bondi debe estar lleno a esta hora.', 'A esta hora el bondi debe estar lleno.']::text[], note_en = coalesce(note_en, 'Argentines often use the future tense to guess about the present: "estará lleno" means "it must be packed".')
where id = '00e12dc6-cf22-54fa-9acb-4dc232ab25a1' and es = 'El bondi estará lleno a esta hora.' and en = 'The bus must be packed at this hour.'
  and not (es_alt && array['El bondi debe estar lleno a esta hora.', 'A esta hora el bondi debe estar lleno.']::text[]);

update public.sentences set es_alt = es_alt || array['Probablemente está en el laburo.', 'Debe estar en el laburo.']::text[], note_en = coalesce(note_en, 'Argentines often use the future tense to guess about the present: "estará" means "he''s probably".')
where id = '1f4eab88-4bd8-5008-950d-2660e83980c9' and es = 'Estará en el laburo.' and en = 'He''s probably at work.'
  and not (es_alt && array['Probablemente está en el laburo.', 'Debe estar en el laburo.']::text[]);

update public.sentences set es_alt = es_alt || array['Debe estar enojada conmigo.']::text[], note_en = coalesce(note_en, 'Argentines often use the future tense to guess about the present: "estará" means "she must be".')
where id = '9dae9efd-2df0-5b73-991e-89a827266546' and es = 'Estará enojada conmigo.' and en = 'She must be mad at me.'
  and not (es_alt && array['Debe estar enojada conmigo.']::text[]);

update public.sentences set es_alt = es_alt || array['Debe hacer dos años que se separaron.']::text[], note_en = coalesce(note_en, 'Argentines often use the future tense to guess: "hará dos años" means "it must be two years".')
where id = '1e5d545a-350c-5184-b6b0-8df0a7c85192' and es = 'Hará dos años que se separaron.' and en = 'It must be two years since they split up.'
  and not (es_alt && array['Debe hacer dos años que se separaron.']::text[]);

update public.sentences set es_alt = es_alt || array['Le dejo mis llaves a Fede porque confío en él.', 'A Fede le dejo mis llaves porque confío en él.']::text[]
where id = '1b9a87f7-d386-584d-8ac7-f26a41bbac6f' and es = 'Le dejo las llaves a Fede porque confío en él.' and en = 'I leave my keys with Fede because I trust him.'
  and not (es_alt && array['Le dejo mis llaves a Fede porque confío en él.', 'A Fede le dejo mis llaves porque confío en él.']::text[]);

update public.sentences set es_alt = es_alt || array['Mis abuelos se pelean porque él no toma su remedio.']::text[]
where id = '0494ee64-d6ce-58cb-a1cf-a01b7beecfd0' and es = 'Mis abuelos se pelean porque él no toma el remedio.' and en = 'My grandparents fight because he doesn''t take his medicine.'
  and not (es_alt && array['Mis abuelos se pelean porque él no toma su remedio.']::text[]);

update public.sentences set es_alt = es_alt || array['Me duele la cabeza.']::text[]
where id = 'a0f4cfa5-a127-5fda-8883-3fa0088858ea' and es = 'Tengo dolor de cabeza.' and en = 'I have a headache.'
  and not (es_alt && array['Me duele la cabeza.']::text[]);

update public.sentences set es_alt = es_alt || array['Le duele el oído y tiene fiebre.']::text[]
where id = '6ddccf9b-7d0b-5433-ba69-4967089ac5c1' and es = 'Tiene dolor de oído y fiebre.' and en = 'He has an earache and a fever.'
  and not (es_alt && array['Le duele el oído y tiene fiebre.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Sos un genio! Gracias por la ayuda.']::text[], note_en = coalesce(note_en, 'Argentines love the exclamation “¡Qué genio!”: it means the same as “sos un genio”.')
where id = '1356042c-843b-5378-8c37-665c30db6921' and es = '¡Qué genio! Gracias por la ayuda.' and en = 'You''re a genius! Thanks for the help.'
  and not (es_alt && array['¡Sos un genio! Gracias por la ayuda.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Es verdad que Pablo fue a Bariloche con Lucía?']::text[], note_en = coalesce(note_en, '“Se fue” stresses that he left for there; plain “fue” is also right.')
where id = 'ca24c4ab-b394-530f-bef8-1326e1ef6158' and es = '¿Es verdad que Pablo se fue a Bariloche con Lucía?' and en = 'Is it true Pablo went to Bariloche with Lucía?'
  and not (es_alt && array['¿Es verdad que Pablo fue a Bariloche con Lucía?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, gracias por el flete, me salvaste.', 'Che, gracias por lo del flete, me salvaste.']::text[], note_en = coalesce(note_en, '“Te agradezco…” means “I thank you for…”; it says the same as “gracias por…”.')
where id = 'cce106ce-1a92-530e-bbeb-fd1349a2db88' and es = 'Che, te agradezco lo del flete, me salvaste.' and en = 'Hey, thanks for the moving truck, you saved me.'
  and not (es_alt && array['Che, gracias por el flete, me salvaste.', 'Che, gracias por lo del flete, me salvaste.']::text[]);

update public.sentences set es_alt = es_alt || array['Muchas gracias por venir.']::text[]
where id = '0325f747-812f-5828-af55-014ea7bdeaff' and es = 'Gracias de verdad por venir.' and en = 'Thank you so much for coming.'
  and not (es_alt && array['Muchas gracias por venir.']::text[]);

update public.sentences set es_alt = es_alt || array['Gracias, fuiste re amable con mi vieja.']::text[]
where id = 'ddfb8afc-4674-54e5-a8ea-8c16ff373731' and es = 'Gracias, fuiste muy amable con mi vieja.' and en = 'Thanks, you were really kind to my mom.'
  and not (es_alt && array['Gracias, fuiste re amable con mi vieja.']::text[]);

update public.sentences set es_alt = es_alt || array['Ni hablar, para eso están los amigos.']::text[], note_en = coalesce(note_en, '“Para eso estamos” literally means “that''s what we''re here for”.')
where id = '264b73f9-5172-5dd6-a39c-8056942af86c' and es = 'Ni hablar, para eso estamos.' and en = 'Don''t mention it, that''s what friends are for.'
  and not (es_alt && array['Ni hablar, para eso están los amigos.']::text[]);

update public.sentences set es_alt = es_alt || array['Muchas gracias por el regalo, es lindísimo.']::text[], note_en = coalesce(note_en, '“Te agradezco…” means “I thank you for…”; it says the same as “gracias por…”.')
where id = '6b0907eb-09ad-514e-a554-d0163f2ac9f1' and es = 'Te agradezco el regalo, es lindísimo.' and en = 'Thanks so much for the present, it''s gorgeous.'
  and not (es_alt && array['Muchas gracias por el regalo, es lindísimo.']::text[]);

update public.sentences set es_alt = es_alt || array['Gracias por la ayuda.']::text[], note_en = coalesce(note_en, '“Te agradezco…” means “I thank you for…”; it says the same as “gracias por…”.')
where id = '8fa367fe-37cc-5989-867b-fddecc43c0d8' and es = 'Te agradezco la ayuda.' and en = 'Thanks for the help.'
  and not (es_alt && array['Gracias por la ayuda.']::text[]);

update public.sentences set es_alt = es_alt || array['Te pasaste con la comida, muchas gracias.']::text[]
where id = 'e479221f-8522-5059-866d-fd8cc6391d08' and es = 'Te pasaste con la comida, gracias de verdad.' and en = 'You did an amazing job with the food, thank you so much.'
  and not (es_alt && array['Te pasaste con la comida, muchas gracias.']::text[]);

update public.sentences set es_alt = es_alt || array['—Hoy pago yo otra vez. —¡Gracias, te debo una!']::text[], note_en = coalesce(note_en, '“Invito yo” is the usual Argentine way to say “it''s on me”.')
where id = 'afdb2516-ee45-577a-89f8-c7c894667b27' and es = '—Hoy invito yo otra vez. —¡Gracias, te debo una!' and en = '—I''m paying again today. —Thanks, I owe you one!'
  and not (es_alt && array['—Hoy pago yo otra vez. —¡Gracias, te debo una!']::text[]);

update public.sentences set es_alt = es_alt || array['No pasa nada, la próxima vez invito yo.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = 'fad8ce46-5f59-54e4-9510-34a5d747aa23' and es = 'No pasa nada, la próxima invito yo.' and en = 'No worries, next time it''s on me.'
  and not (es_alt && array['No pasa nada, la próxima vez invito yo.']::text[]);

update public.sentences set es_alt = es_alt || array['¡El mozo es re mala onda!']::text[]
where id = '6970828c-1e09-5a29-ac2b-7da8839c3d78' and es = '¡Qué mala onda el mozo!' and en = 'The waiter''s so rude!'
  and not (es_alt && array['¡El mozo es re mala onda!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Sos re pesado!', '¡Sos tan pesado!']::text[]
where id = '69c05d16-f33a-5faa-981c-40bc245096a3' and es = '¡Qué pesado que sos!' and en = 'You''re so annoying!'
  and not (es_alt && array['¡Sos re pesado!', '¡Sos tan pesado!']::text[]);

update public.sentences set es_alt = es_alt || array['Belén, ¡sos re pesada!', 'Belén, ¡sos tan pesada!']::text[]
where id = '789e06b9-8f53-5cec-a6cd-26bbca1cfcce' and es = 'Belén, ¡qué pesada que sos!' and en = 'Belén, you''re so annoying!'
  and not (es_alt && array['Belén, ¡sos re pesada!', 'Belén, ¡sos tan pesada!']::text[]);

update public.sentences set es_alt = es_alt || array['Cami es re divertida.']::text[]
where id = '1e7c433a-c0e4-5f01-a6ad-cc5ed06952e5' and es = 'Cami es muy divertida.' and en = 'Cami''s really fun.'
  and not (es_alt && array['Cami es re divertida.']::text[]);

update public.sentences set es_alt = es_alt || array['Me parece simpático, pero no lo conozco muy bien.']::text[]
where id = '820ca4f3-26ef-504f-ae4d-12d86394d791' and es = 'Me parece simpático, pero no lo conozco mucho.' and en = 'He seems friendly, but I don''t know him very well.'
  and not (es_alt && array['Me parece simpático, pero no lo conozco muy bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuelo es re divertido.']::text[]
where id = '92981889-46fe-58fe-ab59-dcf0e8c5f54c' and es = 'Mi abuelo es muy divertido.' and en = 'My grandpa is really fun.'
  and not (es_alt && array['Mi abuelo es re divertido.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi jefa es divertida y re buena onda.']::text[]
where id = '5bc0274b-a045-5191-a116-b96e7b6524af' and es = 'Mi jefa es divertida y muy buena onda.' and en = 'My boss is fun and really nice.'
  and not (es_alt && array['Mi jefa es divertida y re buena onda.']::text[]);

update public.sentences set es_alt = es_alt || array['Tu amiga es re buena onda, pagó todo ella.', 'Tu amiga es re buena onda, pagó todo.']::text[]
where id = '5289968a-6a94-5ed4-ac34-5ae3f51883a1' and es = 'Qué buena onda tu amiga, pagó todo ella.' and en = 'Your friend is so nice, she paid for everything.'
  and not (es_alt && array['Tu amiga es re buena onda, pagó todo ella.', 'Tu amiga es re buena onda, pagó todo.']::text[]);

update public.sentences set es_alt = es_alt || array['Es re pesado, me llamó cinco veces hoy.', 'Es tan pesado, me llamó cinco veces hoy.']::text[]
where id = '6d01a8f3-f884-51af-bf74-9a2fa4b77beb' and es = 'Qué pesado, me llamó cinco veces hoy.' and en = 'He''s so annoying, he called me five times today.'
  and not (es_alt && array['Es re pesado, me llamó cinco veces hoy.', 'Es tan pesado, me llamó cinco veces hoy.']::text[]);

update public.sentences set es_alt = es_alt || array['Santi es tímido, pero con sus amigos habla un montón.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose they are, Argentines often say “los amigos” instead of “sus amigos”.')
where id = 'd925e4fd-de6c-5213-ae83-c9a35724fa79' and es = 'Santi es tímido, pero con los amigos habla un montón.' and en = 'Santi''s shy, but with his friends he talks a lot.'
  and not (es_alt && array['Santi es tímido, pero con sus amigos habla un montón.']::text[]);

update public.sentences set es_alt = es_alt || array['Sofi es re simpática.']::text[]
where id = '65cb7ba3-7ccf-571c-9be3-129d73984ea3' and es = 'Sofi es muy simpática.' and en = 'Sofi is really friendly.'
  and not (es_alt && array['Sofi es re simpática.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tu compañera es vaga o solo está ocupada?']::text[]
where id = 'ee42dfe1-f41e-520f-a021-b92522fbc320' and es = '¿Tu compañera es vaga o está ocupada?' and en = 'Is your coworker lazy or just busy?'
  and not (es_alt && array['¿Tu compañera es vaga o solo está ocupada?']::text[]);

update public.sentences set es_alt = es_alt || array['Cami estudia y labura: es re trabajadora.']::text[], note_en = coalesce(note_en, 'In casual speech Argentines often drop the “es” and just say “re trabajadora”.')
where id = '0f48eb55-95a0-59f7-9881-4a6aedbcc079' and es = 'Cami estudia y labura: re trabajadora.' and en = 'Cami studies and works, she''s really hard-working.'
  and not (es_alt && array['Cami estudia y labura: es re trabajadora.']::text[]);

update public.sentences set es_alt = es_alt || array['Diego es serio, pero es buena onda.']::text[]
where id = '40c0da3d-55c0-5e4c-a135-51b748161248' and es = 'Diego es serio, pero buena onda.' and en = 'Diego is serious, but he''s nice.'
  and not (es_alt && array['Diego es serio, pero es buena onda.']::text[]);

update public.sentences set es_alt = es_alt || array['Es generosa con todos menos con su hermana.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose sister it is, Argentines often say “la hermana” instead of “su hermana”.')
where id = '6640d215-deed-5231-b68d-0cd93ac61729' and es = 'Es generosa con todos menos con la hermana.' and en = 'She''s generous with everyone except her sister.'
  and not (es_alt && array['Es generosa con todos menos con su hermana.']::text[]);

update public.sentences set es_alt = es_alt || array['No es egoísta, es re copado: siempre comparte su auto.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose car it is, Argentines often say “el auto” instead of “su auto”.')
where id = '9af9f522-892c-59c9-a002-a39c9335a8e2' and es = 'No es egoísta, es re copado: siempre comparte el auto.' and en = 'He''s not selfish, he''s really cool: he always shares his car.'
  and not (es_alt && array['No es egoísta, es re copado: siempre comparte su auto.']::text[]);

update public.sentences set es_alt = es_alt || array['No es vaga, tiene mucho laburo.']::text[], note_en = coalesce(note_en, '“Estar con mucho laburo” is a very common way to say you''re swamped right now.')
where id = 'ccae0812-5fd8-541a-b8ea-2af39afc49b2' and es = 'No es vaga, está con mucho laburo.' and en = 'She''s not lazy, she has a lot of work.'
  and not (es_alt && array['No es vaga, tiene mucho laburo.']::text[]);

update public.sentences set es_alt = es_alt || array['Trabajás mucho; tenés que descansar un poco.', 'Laburás mucho; tenés que descansar un poco.', 'Laburás un montón; tenés que descansar un poco.', 'Trabajás tanto; tenés que descansar un poco.']::text[]
where id = 'f0186add-7a37-58c0-925d-23ed282dd404' and es = 'Sos muy trabajadora; tenés que descansar un poco.' and en = 'You work so hard; you need to get some rest.'
  and not (es_alt && array['Trabajás mucho; tenés que descansar un poco.', 'Laburás mucho; tenés que descansar un poco.', 'Laburás un montón; tenés que descansar un poco.', 'Trabajás tanto; tenés que descansar un poco.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Y la novia de Pablo? —Es macanuda.']::text[], note_en = coalesce(note_en, 'In a quick reply Argentines often answer with just the adjective.')
where id = 'c993a48a-3bef-5b40-bebd-dc5775564bda' and es = '—¿Y la novia de Pablo? —Macanuda.' and en = '—And Pablo''s girlfriend? —She''s great.'
  and not (es_alt && array['—¿Y la novia de Pablo? —Es macanuda.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Callada? Dale un mate y no para de hablar.']::text[]
where id = 'bf9086e0-cecd-5aec-af7a-b215915f7e37' and es = '¿Callada? Con un mate en la mano, no para de hablar.' and en = 'Quiet? Give her a mate and she won''t stop talking.'
  and not (es_alt && array['¿Callada? Dale un mate y no para de hablar.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Pensás que soy tonta?', '¿Te pensás que soy tonta?']::text[]
where id = 'fde0215c-ca2c-5043-b434-da8ac29e8002' and es = '¿Me tomás por tonta?' and en = 'Do you think I''m dumb?'
  and not (es_alt && array['¿Pensás que soy tonta?', '¿Te pensás que soy tonta?']::text[]);

update public.sentences set es_alt = es_alt || array['Es callada, como su papá.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose dad it is, Argentines often say “el papá” instead of “su papá”.')
where id = '6d107908-2ae4-563f-a57d-a1198b9c8a9f' and es = 'Es callada, como el papá.' and en = 'She''s quiet, like her dad.'
  and not (es_alt && array['Es callada, como su papá.']::text[]);

update public.sentences set es_alt = es_alt || array['Te vi distraída en clase, ¿está todo bien?']::text[], note_en = coalesce(note_en, '“Te vi distraída” literally means “I saw you distracted”: a very common way to say someone seemed a certain way.')
where id = '25cd77c1-be5c-5738-bf51-c145fc82eb40' and es = 'Te vi distraída en clase, ¿todo bien?' and en = 'You seemed distracted in class, is everything OK?'
  and not (es_alt && array['Te vi distraída en clase, ¿está todo bien?']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Otra ronda? —No, gracias, estuvo re rico.']::text[]
where id = '8b7985f6-7fd4-5ac3-8d99-7cf47406cfc0' and es = '—¿Otra ronda? —No, gracias, estuvo muy rico.' and en = '—Another round? —No, thanks, it was really tasty.'
  and not (es_alt && array['—¿Otra ronda? —No, gracias, estuvo re rico.']::text[]);

update public.sentences set es_alt = es_alt || array['Gracias, no tomo más, cebás re rico.']::text[]
where id = 'bd811230-80c9-51e7-aa05-d9c927f99d93' and es = 'Gracias, no tomo más, cebás muy rico.' and en = 'Thanks, I''m not having any more, you pour a really tasty mate.'
  and not (es_alt && array['Gracias, no tomo más, cebás re rico.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenés que lavar la bombilla con agua caliente.']::text[], note_en = coalesce(note_en, '“Hay que” is the general “you have to”, about anyone, not you in particular.')
where id = '473c48b3-25df-5892-a0a0-5b544bef13ca' and es = 'Hay que lavar la bombilla con agua caliente.' and en = 'You have to wash the mate straw with hot water.'
  and not (es_alt && array['Tenés que lavar la bombilla con agua caliente.']::text[]);

update public.sentences set es_alt = es_alt || array['La bombilla está sucia, ¿la podés lavar?']::text[], note_en = coalesce(note_en, 'Argentines very often ask for things with a plain present: “¿la lavás?” works like “can you wash it?”.')
where id = '9a39715d-8c38-59ce-b80b-ac203c323cb2' and es = 'La bombilla está sucia, ¿la lavás?' and en = 'The mate straw is dirty, can you wash it?'
  and not (es_alt && array['La bombilla está sucia, ¿la podés lavar?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés que hervir el agua?']::text[], note_en = coalesce(note_en, '“Hay que” is the general “you have to”, about anyone, not you in particular.')
where id = 'd6fc061e-44a6-5317-807a-4095f4670797' and es = '¿Hay que hervir el agua?' and en = 'Do you have to boil the water?'
  and not (es_alt && array['¿Tenés que hervir el agua?']::text[]);

update public.sentences set es_alt = es_alt || array['Calentá agua, mi tía quiere tomar unos mates.']::text[], note_en = coalesce(note_en, 'After an order, Argentines often add “que” before the reason: it works like a quick “because”.')
where id = 'ac5dc4cf-1525-5b69-9041-103a484f8262' and es = 'Calentá agua, que mi tía quiere tomar unos mates.' and en = 'Heat some water, my aunt wants to have some mate.'
  and not (es_alt && array['Calentá agua, mi tía quiere tomar unos mates.']::text[]);

update public.sentences set es_alt = es_alt || array['Calentá agua, viene Rocío.']::text[], note_en = coalesce(note_en, 'After an order, Argentines often add “que” before the reason: it works like a quick “because”.')
where id = '81e4447e-8203-50b3-bcea-2d4a8cbdd999' and es = 'Calentá agua, que viene Rocío.' and en = 'Heat some water, Rocío''s coming.'
  and not (es_alt && array['Calentá agua, viene Rocío.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando hierve, ya es demasiado tarde.']::text[]
where id = '94b7a2bd-895b-520f-8e28-5f58cab93cea' and es = 'Cuando hierve, ya es tarde.' and en = 'When it boils, it''s already too late.'
  and not (es_alt && array['Cuando hierve, ya es demasiado tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenemos que calentar el agua.']::text[], note_en = coalesce(note_en, '“Hay que” means it has to be done, without saying by whom; Argentines use it all the time for “we have to”.')
where id = '8dcd68a4-b676-5638-89f6-60ecba4a4b47' and es = 'Hay que calentar el agua.' and en = 'We have to heat the water.'
  and not (es_alt && array['Tenemos que calentar el agua.']::text[]);

update public.sentences set es_alt = es_alt || array['Voy a calentar más agua, el agua del termo está fría.']::text[], note_en = coalesce(note_en, 'Spanish avoids repeating “agua”: “la del termo” means “the one in the thermos”.')
where id = '1e3fd934-5e7c-58c2-a8c3-9f857243e609' and es = 'Voy a calentar más agua, la del termo está fría.' and en = 'I''m going to heat more water, the water in the thermos is cold.'
  and not (es_alt && array['Voy a calentar más agua, el agua del termo está fría.']::text[]);

update public.sentences set es_alt = es_alt || array['Calentá el agua, traje bizcochitos.']::text[], note_en = coalesce(note_en, 'After an order, Argentines often add “que” before the reason: it works like a quick “because”.')
where id = '11c17a40-590d-5bcf-9dee-124cca29d1d5' and es = 'Calentá el agua, que traje bizcochitos.' and en = 'Heat the water, I brought bizcochitos.'
  and not (es_alt && array['Calentá el agua, traje bizcochitos.']::text[]);

update public.sentences set es_alt = es_alt || array['Como buena matera, Cami sabe cebar re bien.']::text[]
where id = 'eb602a3c-6d7c-5a6a-9f79-1146b27855ef' and es = 'Como buena matera, Cami sabe cebar muy bien.' and en = 'Like a true mate lover, Cami knows how to pour really well.'
  and not (es_alt && array['Como buena matera, Cami sabe cebar re bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Dame un mate y te cuento todo.']::text[], note_en = coalesce(note_en, '“Convidar” means to share food or drink with someone; Argentines use it all the time, and it sounds friendlier than “dame”.')
where id = '5222be5e-0c74-50fb-b3a4-2e8faf0146e9' and es = 'Convidame un mate y te cuento todo.' and en = 'Give me a mate and I''ll tell you everything.'
  and not (es_alt && array['Dame un mate y te cuento todo.']::text[]);

update public.sentences set es_alt = es_alt || array['Dame un mate.']::text[], note_en = coalesce(note_en, '“Convidar” means to share food or drink with someone; Argentines use it all the time, and it sounds friendlier than “dame”.')
where id = '16fc15fc-8896-5ca2-9a70-3326868fad69' and es = 'Convidame un mate.' and en = 'Give me a mate.'
  and not (es_alt && array['Dame un mate.']::text[]);

update public.sentences set es_alt = es_alt || array['Dame un poco, por favor.']::text[], note_en = coalesce(note_en, '“Convidar” means to share food or drink with someone; Argentines use it all the time, and it sounds friendlier than “dame”.')
where id = '8a35662d-8371-50c6-afc2-03e0fdb664fd' and es = 'Convidame un poco, por favor.' and en = 'Give me a little, please.'
  and not (es_alt && array['Dame un poco, por favor.']::text[]);

update public.sentences set es_alt = es_alt || array['Dale, dame un poco.', 'Dale, dame.']::text[], note_en = coalesce(note_en, '“Convidar” means to share food or drink with someone; Argentines use it all the time, and it sounds friendlier than “dame”.')
where id = '572c4549-b73a-5ff0-880e-f3320b353627' and es = 'Dale, convidame.' and en = 'Come on, give me some.'
  and not (es_alt && array['Dale, dame un poco.', 'Dale, dame.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hermana es matera y ceba re bien.']::text[]
where id = 'e520313b-4fdd-5dcb-a2c2-823493d9fbd1' and es = 'Mi hermana es matera y ceba muy bien.' and en = 'My sister loves mate and pours really well.'
  and not (es_alt && array['Mi hermana es matera y ceba re bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi vecino es tan matero que siempre está con su termo.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose it is, Argentines often say “el termo” instead of “su termo”.')
where id = 'c74280e8-279f-52a2-b625-84aed5eb3915' and es = 'Mi vecino es tan matero que siempre está con el termo.' and en = 'My neighbor loves mate so much he always has his thermos with him.'
  and not (es_alt && array['Mi vecino es tan matero que siempre está con su termo.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Querés hacer la tarea juntos?']::text[]
where id = 'ca6eb741-7910-5cdf-b138-9cf0ecf3efc3' and es = '¿Querés que hagamos la tarea juntos?' and en = 'Do you want to do the homework together?'
  and not (es_alt && array['¿Querés hacer la tarea juntos?']::text[]);

update public.sentences set es_alt = es_alt || array['Necesito que me mandes tu ubicación, no encuentro la casa.']::text[]
where id = '9b13d62e-0d54-5d84-a153-a191a83b0a68' and es = 'Necesito que me mandes la ubicación, no encuentro la casa.' and en = 'I need you to send me your location, I can''t find the house.'
  and not (es_alt && array['Necesito que me mandes tu ubicación, no encuentro la casa.']::text[]);

update public.sentences set es_alt = es_alt || array['No necesitás poner la mesa, ya está.']::text[], note_en = coalesce(note_en, '“No hace falta que…” is the most common way to say “you don''t need to…”; “no necesitás…” is also correct.')
where id = '8c26b33f-a649-56c8-bc80-c817d826d87c' and es = 'No hace falta que pongas la mesa, ya está.' and en = 'You don''t need to set the table, it''s already done.'
  and not (es_alt && array['No necesitás poner la mesa, ya está.']::text[]);

update public.sentences set es_alt = es_alt || array['—Chau, ¡espero que te vaya bien! —Gracias, después te cuento cómo me fue.', '—Chau, ¡ojalá que te vaya bien! —Gracias, después te cuento cómo me fue.']::text[], note_en = coalesce(note_en, 'Good wishes are usually said with a bare “que” + subjunctive: “¡Que te vaya bien!”.')
where id = '4c57099d-217c-56f8-9ab1-05588c4a33cd' and es = '—Chau, ¡que te vaya bien! —Gracias, después te cuento cómo me fue.' and en = '—Bye, hope it goes well! —Thanks, afterwards I''ll tell you how it went.'
  and not (es_alt && array['—Chau, ¡espero que te vaya bien! —Gracias, después te cuento cómo me fue.', '—Chau, ¡ojalá que te vaya bien! —Gracias, después te cuento cómo me fue.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Que tengas buen viaje, Pablo!']::text[]
where id = '8c77b448-4d8f-5c33-8bed-5d62762f825f' and es = '¡Buen viaje, Pablo!' and en = 'Have a good trip, Pablo!'
  and not (es_alt && array['¡Que tengas buen viaje, Pablo!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Que tengas buen viaje, y que te vaya bien!']::text[]
where id = 'e0567b0a-d83f-5f9d-8fcd-410265861f2f' and es = '¡Buen viaje, y que te vaya bien!' and en = 'Have a good trip, and hope it goes well!'
  and not (es_alt && array['¡Que tengas buen viaje, y que te vaya bien!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Suerte, Mati!']::text[]
where id = '1314ff6d-2cba-5ba3-b157-428b1279f5fc' and es = '¡Buena suerte, Mati!' and en = 'Good luck, Mati!'
  and not (es_alt && array['¡Suerte, Mati!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Espero que te vaya bien en la entrevista!', '¡Ojalá que te vaya bien en la entrevista!']::text[], note_en = coalesce(note_en, 'Good wishes are usually said with a bare “que” + subjunctive: “¡Que te vaya bien!”.')
where id = 'bd2d917b-0359-5148-92cc-d6ef66e3fb1f' and es = '¡Que te vaya bien en la entrevista!' and en = 'Hope it goes well at the interview!'
  and not (es_alt && array['¡Espero que te vaya bien en la entrevista!', '¡Ojalá que te vaya bien en la entrevista!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Buen finde, Ana!']::text[]
where id = 'a0329053-bb81-5559-841f-2d857c64590e' and es = '¡Que tengas buen finde, Ana!' and en = 'Have a good weekend, Ana!'
  and not (es_alt && array['¡Buen finde, Ana!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Buen viaje a Mendoza!']::text[]
where id = '23b277ae-aa85-5069-b480-8e0d0d0fffc2' and es = '¡Que tengas buen viaje a Mendoza!' and en = 'Have a good trip to Mendoza!'
  and not (es_alt && array['¡Buen viaje a Mendoza!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Buen viaje!']::text[]
where id = '41bfaca4-5a44-58ba-baf2-049c69f674c9' and es = '¡Que tengas buen viaje!' and en = 'Have a good trip!'
  and not (es_alt && array['¡Buen viaje!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Suerte!', '¡Buena suerte!']::text[]
where id = '7602398f-bbf7-52de-ac34-908133f6fec5' and es = '¡Que tengas suerte!' and en = 'Good luck!'
  and not (es_alt && array['¡Suerte!', '¡Buena suerte!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Buena suerte en el examen!']::text[], note_en = coalesce(note_en, 'Argentines usually just say “¡Suerte!”; “¡Buena suerte!” is fine too.')
where id = 'eda9521c-c0fd-5ffa-ac20-32d4cb637bdd' and es = '¡Suerte en el examen!' and en = 'Good luck on the exam!'
  and not (es_alt && array['¡Buena suerte en el examen!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Buena suerte mañana!']::text[], note_en = coalesce(note_en, 'Argentines usually just say “¡Suerte!”; “¡Buena suerte!” is fine too.')
where id = '65972047-303a-540d-94ed-036437b22661' and es = '¡Suerte mañana!' and en = 'Good luck tomorrow!'
  and not (es_alt && array['¡Buena suerte mañana!']::text[]);

update public.sentences set es_alt = es_alt || array['Que tengas buen finde, y que te vaya bien el lunes.']::text[]
where id = '9f878c71-d734-5858-b157-75a5914e0c87' and es = 'Buen finde, y que te vaya bien el lunes.' and en = 'Have a good weekend, and hope it goes well on Monday.'
  and not (es_alt && array['Que tengas buen finde, y que te vaya bien el lunes.']::text[]);

update public.sentences set es_alt = es_alt || array['Bueno, me voy, espero que te vaya bien.', 'Bueno, me voy, ojalá que te vaya bien.']::text[], note_en = coalesce(note_en, 'Good wishes are usually said with a bare “que” + subjunctive: “¡Que te vaya bien!”.')
where id = 'e0312f48-fb5c-5ecb-9c8b-ed3a9a138d98' and es = 'Bueno, me voy, que te vaya bien.' and en = 'OK, I''m leaving, hope it goes well.'
  and not (es_alt && array['Bueno, me voy, espero que te vaya bien.', 'Bueno, me voy, ojalá que te vaya bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Hace calor, ojalá llueva.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = '8aaf2084-f8e4-5fb4-9a28-2db2cf243cae' and es = 'Hace calor, ojalá que llueva.' and en = 'It''s hot, I hope it rains.'
  and not (es_alt && array['Hace calor, ojalá llueva.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá el examen salga bien.', 'Ojalá salga bien el examen.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = 'ee5b33d6-aae1-53c1-8994-46ca94685573' and es = 'Ojalá que el examen salga bien.' and en = 'I hope the exam goes well.'
  and not (es_alt && array['Ojalá el examen salga bien.', 'Ojalá salga bien el examen.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá llueva.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = '11605de9-1a72-5bd1-8f6d-95863e37062b' and es = 'Ojalá que llueva.' and en = 'I hope it rains.'
  and not (es_alt && array['Ojalá llueva.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá mañana salga el sol.', 'Ojalá salga el sol mañana.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = '55003762-2b19-51eb-840e-ca29816e3e7c' and es = 'Ojalá que mañana salga el sol.' and en = 'I hope the sun comes out tomorrow.'
  and not (es_alt && array['Ojalá mañana salga el sol.', 'Ojalá salga el sol mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá no llueva el sábado.', 'Ojalá el sábado no llueva.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = '197c682d-6b06-5bb8-833b-241151e7665b' and es = 'Ojalá que no llueva el sábado.' and en = 'I hope it doesn''t rain on Saturday.'
  and not (es_alt && array['Ojalá no llueva el sábado.', 'Ojalá el sábado no llueva.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá no llueva, porque vamos a la playa.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = '215a7095-514b-54b1-9dc7-2669e5af22b0' and es = 'Ojalá que no llueva, porque vamos a la playa.' and en = 'I hope it doesn''t rain, because we''re going to the beach.'
  and not (es_alt && array['Ojalá no llueva, porque vamos a la playa.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá no tengas fiebre.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = '99ff96c1-ba77-5481-ace2-0c6e11b3959a' and es = 'Ojalá que no tengas fiebre.' and en = 'I hope you don''t have a fever.'
  and not (es_alt && array['Ojalá no tengas fiebre.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que venga Sofi.', 'Ojalá que Sofi venga.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = 'a22434a7-4b8c-5445-8fc4-f1b1ce2a2749' and es = 'Ojalá venga Sofi.' and en = 'I hope Sofi comes.'
  and not (es_alt && array['Ojalá que venga Sofi.', 'Ojalá que Sofi venga.']::text[]);

update public.sentences set es_alt = es_alt || array['Espero que te vaya bien, después contame cómo te fue.', 'Ojalá que te vaya bien, después contame cómo te fue.']::text[], note_en = coalesce(note_en, 'Good wishes are usually said with a bare “que” + subjunctive: “¡Que te vaya bien!”.')
where id = '6e0bc5b7-d9b8-5b0f-981c-23291ead82be' and es = 'Que te vaya bien, después contame cómo te fue.' and en = 'Hope it goes well, tell me later how it went.'
  and not (es_alt && array['Espero que te vaya bien, después contame cómo te fue.', 'Ojalá que te vaya bien, después contame cómo te fue.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Suerte con el laburo nuevo!', '¡Buena suerte con el laburo nuevo!', '¡Mucha suerte con el laburo nuevo!']::text[], note_en = coalesce(note_en, 'Argentines often wish “¡Éxitos!” where English says “good luck”, especially for exams, work and new projects.')
where id = 'b96e57ea-86d9-520d-9c52-5205f320d85f' and es = '¡Mucho éxito con el laburo nuevo!' and en = 'Good luck with the new job!'
  and not (es_alt && array['¡Suerte con el laburo nuevo!', '¡Buena suerte con el laburo nuevo!', '¡Mucha suerte con el laburo nuevo!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Mucha suerte mañana!']::text[], note_en = coalesce(note_en, 'Argentines often wish “¡Éxitos!” where English says “good luck”, especially for exams, work and new projects.')
where id = 'b73c0918-3792-5efd-a9b3-4ce3688381f0' and es = '¡Mucho éxito mañana!' and en = 'Best of luck tomorrow!'
  and not (es_alt && array['¡Mucha suerte mañana!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Mejorate, abuela!', '¡Abuela, mejorate!']::text[]
where id = 'cf79f4b0-331e-564d-94bc-5aff598d4c6e' and es = '¡Que te mejores, abuela!' and en = 'Get well soon, Grandma!'
  and not (es_alt && array['¡Mejorate, abuela!', '¡Abuela, mejorate!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Vas a la cancha? ¡Ojalá que ganemos!', '¿Vas a la cancha? ¡Ojalá ganemos!']::text[], note_en = coalesce(note_en, 'A bare “¡Que…!” + subjunctive is a quick way to voice a wish.')
where id = '71c70845-128d-57b3-a19e-28e220cb0603' and es = '¿Vas a la cancha? ¡Que ganemos!' and en = 'Are you going to the stadium? Here''s hoping we win!'
  and not (es_alt && array['¿Vas a la cancha? ¡Ojalá que ganemos!', '¿Vas a la cancha? ¡Ojalá ganemos!']::text[]);

update public.sentences set es_alt = es_alt || array['Ana, ¡feliz cumpleaños y que la pases bárbaro!', '¡Feliz cumpleaños, Ana, y que la pases bárbaro!']::text[], note_en = coalesce(note_en, '“Que los cumplas feliz” comes from the birthday song and is a common way to say happy birthday in Argentina.')
where id = 'd785c9e7-bd21-50be-94dc-36b0d9a30622' and es = 'Ana, ¡que los cumplas feliz y la pases bárbaro!' and en = 'Happy birthday, Ana, have a great time!'
  and not (es_alt && array['Ana, ¡feliz cumpleaños y que la pases bárbaro!', '¡Feliz cumpleaños, Ana, y que la pases bárbaro!']::text[]);

update public.sentences set es_alt = es_alt || array['Suerte en el parcial, después me contás.', 'Buena suerte en el parcial, después me contás.']::text[], note_en = coalesce(note_en, 'Argentines often wish “¡Éxitos!” where English says “good luck”, especially for exams, work and new projects.')
where id = '5c9187e2-a07a-5ad4-a10a-7ca8ed022a76' and es = 'Éxitos en el parcial, después me contás.' and en = 'Good luck on the midterm, tell me afterwards.'
  and not (es_alt && array['Suerte en el parcial, después me contás.', 'Buena suerte en el parcial, después me contás.']::text[]);

update public.sentences set es_alt = es_alt || array['Juego el sábado, ¡ojalá ganemos!']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = '35c3ae53-8788-56a2-afef-c00313a705d0' and es = 'Juego el sábado, ¡ojalá que ganemos!' and en = 'I''ve got a game on Saturday, I hope we win!'
  and not (es_alt && array['Juego el sábado, ¡ojalá ganemos!']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana empezás, ¡suerte!', 'Mañana empezás, ¡buena suerte!']::text[], note_en = coalesce(note_en, 'Argentines often wish “¡Éxitos!” where English says “good luck”, especially for exams, work and new projects.')
where id = '5e26f38a-a46c-56ee-aa3b-4cf95707bf8a' and es = 'Mañana empezás, ¡éxitos!' and en = 'You start tomorrow, good luck!'
  and not (es_alt && array['Mañana empezás, ¡suerte!', 'Mañana empezás, ¡buena suerte!']::text[]);

update public.sentences set es_alt = es_alt || array['Mati, ¡suerte con la mudanza del sábado!', 'Mati, ¡buena suerte con la mudanza del sábado!']::text[], note_en = coalesce(note_en, 'Argentines often wish “¡Éxitos!” where English says “good luck”, especially for exams, work and new projects.')
where id = 'aa2a116e-d5ef-51b5-b982-87f4632357d8' and es = 'Mati, ¡éxitos con la mudanza del sábado!' and en = 'Mati, good luck with Saturday''s move!'
  and not (es_alt && array['Mati, ¡suerte con la mudanza del sábado!', 'Mati, ¡buena suerte con la mudanza del sábado!']::text[]);

update public.sentences set es_alt = es_alt || array['Mica, ¡suerte en el parcial!', 'Mica, ¡buena suerte en el parcial!']::text[], note_en = coalesce(note_en, '“Que te vaya bien” is a very common way to wish someone luck.')
where id = '07a85ea2-8acf-582d-9257-3c29844fe27f' and es = 'Mica, ¡que te vaya bien en el parcial!' and en = 'Mica, good luck on your midterm!'
  and not (es_alt && array['Mica, ¡suerte en el parcial!', 'Mica, ¡buena suerte en el parcial!']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá ganemos, mi viejo está re nervioso.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = 'ae1e4adf-48e9-5380-bae4-c9a6e3e19795' and es = 'Ojalá que ganemos, mi viejo está re nervioso.' and en = 'I hope we win, my dad is really nervous.'
  and not (es_alt && array['Ojalá ganemos, mi viejo está re nervioso.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá no llueva, así podemos disfrutar la playa.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = 'f6fbb779-a251-55e9-a087-5f24ec8711a4' and es = 'Ojalá que no llueva, así podemos disfrutar la playa.' and en = 'I hope it doesn''t rain, so we can enjoy the beach.'
  and not (es_alt && array['Ojalá no llueva, así podemos disfrutar la playa.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá te salga bien el parcial.', 'Ojalá el parcial te salga bien.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = 'ef59bcc7-b4e7-5705-858e-4aa1d83c78ba' and es = 'Ojalá que te salga bien el parcial.' and en = 'I hope your midterm goes well.'
  and not (es_alt && array['Ojalá te salga bien el parcial.', 'Ojalá el parcial te salga bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Quedate en casa y mejorate.']::text[]
where id = '29212cd4-3259-5ecf-9de5-520ca9800ac1' and es = 'Quedate en casa y que te mejores.' and en = 'Stay home and get well soon.'
  and not (es_alt && array['Quedate en casa y mejorate.']::text[]);

update public.sentences set es_alt = es_alt || array['Belén, cuando vuelvas del laburo, ¿podés comprar pan?', 'Belén, ¿podés comprar pan cuando vuelvas del laburo?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favour with a plain present-tense question: “¿Comprás pan?” means “Can you buy bread?”.')
where id = 'f758411f-db08-5810-871b-49fe1fba91a1' and es = 'Belén, cuando vuelvas del laburo, ¿comprás pan?' and en = 'Belén, when you get back from work, can you buy some bread?'
  and not (es_alt && array['Belén, cuando vuelvas del laburo, ¿podés comprar pan?', 'Belén, ¿podés comprar pan cuando vuelvas del laburo?']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando empiece el verano, vamos a la costa.', 'Vamos a la costa cuando empiece el verano.']::text[], note_en = coalesce(note_en, '“Nos vamos” adds a feeling of heading off; plain “vamos” is just as correct.')
where id = '73f6d800-8f54-5b7d-81e6-46914da87eed' and es = 'Cuando empiece el verano, nos vamos a la costa.' and en = 'When summer starts, we''re going to the coast.'
  and not (es_alt && array['Cuando empiece el verano, vamos a la costa.', 'Vamos a la costa cuando empiece el verano.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando quieras venir a mi casa, avisame.', 'Avisame cuando quieras venir a mi casa.']::text[], note_en = coalesce(note_en, 'Argentines often say just “a casa” to mean “to my place”.')
where id = '2e97fdbc-704d-5e5c-bde9-fabdfcb59ced' and es = 'Cuando quieras venir a casa, avisame.' and en = 'Whenever you want to come to my house, let me know.'
  and not (es_alt && array['Cuando quieras venir a mi casa, avisame.', 'Avisame cuando quieras venir a mi casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenemos que ordenar antes de que vuelva la dueña.', 'Antes de que vuelva la dueña tenemos que ordenar.']::text[], note_en = coalesce(note_en, '“Hay que” is an impersonal “it has to be done”, used a lot where English says “we have to”.')
where id = '1361e4bc-2e66-5e18-9321-7534ea00f8d1' and es = 'Hay que ordenar antes de que vuelva la dueña.' and en = 'We have to tidy up before the landlady comes back.'
  and not (es_alt && array['Tenemos que ordenar antes de que vuelva la dueña.', 'Antes de que vuelva la dueña tenemos que ordenar.']::text[]);

update public.sentences set es_alt = es_alt || array['Salimos a comer cuando quieras, pago yo.', 'Salimos a comer cuando quieras, yo pago.']::text[], note_en = coalesce(note_en, '“Invito yo” is how Argentines usually say “it''s on me”.')
where id = '86ba7b00-228b-57ce-946d-c4b575fd47a0' and es = 'Salimos a comer cuando quieras, invito yo.' and en = 'We''ll go out to eat whenever you want, I''m paying.'
  and not (es_alt && array['Salimos a comer cuando quieras, pago yo.', 'Salimos a comer cuando quieras, yo pago.']::text[]);

update public.sentences set es_alt = es_alt || array['Te presto mi bici hasta que tengas una.']::text[]
where id = 'dd39e89e-cef3-5166-91cd-674195d28992' and es = 'Te dejo mi bici hasta que tengas una.' and en = 'I''ll lend you my bike until you get one.'
  and not (es_alt && array['Te presto mi bici hasta que tengas una.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Necesito llevar algo?', '¿Tengo que llevar algo?']::text[], note_en = coalesce(note_en, '“¿Hace falta…?” asks whether something is really needed; “¿Tengo que…?” and “¿Necesito…?” are also correct.')
where id = '2b0376cf-a315-5428-a5cd-31302313d2cb' and es = '¿Hace falta llevar algo?' and en = 'Do I need to bring anything?'
  and not (es_alt && array['¿Necesito llevar algo?', '¿Tengo que llevar algo?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tengo que ir?']::text[], note_en = coalesce(note_en, '“¿Hace falta que…?” asks whether something is really needed; “¿Tengo que…?” is also correct.')
where id = 'cbc5f8e3-809f-5ebc-a58d-86e93d8e4bec' and es = '¿Hace falta que vaya?' and en = 'Do I need to go?'
  and not (es_alt && array['¿Tengo que ir?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Necesitás plata para el viaje?']::text[], note_en = coalesce(note_en, '“Hacer falta” is a very common way to say something is needed; “necesitar” is also correct.')
where id = '47ecc21d-04d9-5a1e-a9c7-5aa47e9028b2' and es = '¿Te hace falta plata para el viaje?' and en = 'Do you need money for the trip?'
  and not (es_alt && array['¿Necesitás plata para el viaje?']::text[]);

update public.sentences set es_alt = es_alt || array['Chau, Cami, mejorate.']::text[]
where id = '3612c7a1-2e65-55a4-b0f7-1dfb9809c4a8' and es = 'Chau, Cami, que te mejores.' and en = 'Bye, Cami, feel better.'
  and not (es_alt && array['Chau, Cami, mejorate.']::text[]);

update public.sentences set es_alt = es_alt || array['Descansá mucho y mejorate.']::text[]
where id = 'c871ebaa-94f4-5840-a0b9-4c12655c5f9f' and es = 'Descansá mucho y que te mejores.' and en = 'Get plenty of rest and feel better.'
  and not (es_alt && array['Descansá mucho y mejorate.']::text[]);

update public.sentences set es_alt = es_alt || array['Necesitamos más pan.']::text[], note_en = coalesce(note_en, '“Hacer falta” is a very common way to say something is needed; “necesitar” is also correct.')
where id = 'b02af1b2-17a6-5004-99dc-d04c1876bee4' and es = 'Hace falta más pan.' and en = 'We need more bread.'
  and not (es_alt && array['Necesitamos más pan.']::text[]);

update public.sentences set es_alt = es_alt || array['No necesitamos hacer nada.']::text[], note_en = coalesce(note_en, '“No hace falta que…” is the most common way to say “we don''t need to…”; “no necesitamos…” is also correct.')
where id = '7905b1d6-cb75-56f2-b4c5-562d216d70d6' and es = 'No hace falta que hagamos nada.' and en = 'We don''t need to do anything.'
  and not (es_alt && array['No necesitamos hacer nada.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que ganemos, porque si no, quedamos afuera.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = '40da44f2-1ab2-5068-83f8-a3ebd6bcd28c' and es = 'Ojalá ganemos, porque si no, quedamos afuera.' and en = 'I hope we win, because if not, we''re out.'
  and not (es_alt && array['Ojalá que ganemos, porque si no, quedamos afuera.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que hagamos el viaje este año.', 'Ojalá que este año hagamos el viaje.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = '936ca64f-9e87-58ca-ab16-80af729c3a90' and es = 'Ojalá hagamos el viaje este año.' and en = 'I hope we take the trip this year.'
  and not (es_alt && array['Ojalá que hagamos el viaje este año.', 'Ojalá que este año hagamos el viaje.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que mamá no sepa nada.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = '0d443a15-2f85-5bd5-bba5-69b4b36e4dba' and es = 'Ojalá mamá no sepa nada.' and en = 'I hope Mom doesn''t know anything.'
  and not (es_alt && array['Ojalá que mamá no sepa nada.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que no llueva hasta que termine el partido.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = '96372951-6e20-57e5-8f8a-215e999fe663' and es = 'Ojalá no llueva hasta que termine el partido.' and en = 'I hope it doesn''t rain until the game ends.'
  and not (es_alt && array['Ojalá que no llueva hasta que termine el partido.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que no llueva, quiero que hagamos la fiesta afuera.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = '718cf9a7-18c2-5269-beea-c2def3a98bcc' and es = 'Ojalá no llueva, quiero que hagamos la fiesta afuera.' and en = 'I hope it doesn''t rain, I want us to have the party outside.'
  and not (es_alt && array['Ojalá que no llueva, quiero que hagamos la fiesta afuera.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que puedas venir, necesito que me ayudes a pintar.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = 'ac457d50-567c-5556-80c2-98066ea57023' and es = 'Ojalá puedas venir, necesito que me ayudes a pintar.' and en = 'I hope you can come, I need you to help me paint.'
  and not (es_alt && array['Ojalá que puedas venir, necesito que me ayudes a pintar.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que vuelvas pronto.']::text[], note_en = coalesce(note_en, '“Ojalá” works with or without “que”; Argentines use both all the time.')
where id = '8db2d048-6335-5f7e-933f-f53536e94602' and es = 'Ojalá vuelvas pronto.' and en = 'I hope you come back soon.'
  and not (es_alt && array['Ojalá que vuelvas pronto.']::text[]);

update public.sentences set es_alt = es_alt || array['Necesitamos carbón para el asado.', 'Para el asado necesitamos carbón.']::text[], note_en = coalesce(note_en, '“Hacer falta” is a very common way to say something is needed; “necesitar” is also correct.')
where id = 'afff0ee8-5da6-5f2d-86c2-f871282da7ca' and es = 'Para el asado hace falta carbón.' and en = 'We need charcoal for the asado.'
  and not (es_alt && array['Necesitamos carbón para el asado.', 'Para el asado necesitamos carbón.']::text[]);

update public.sentences set es_alt = es_alt || array['Si la necesitás, te presto la plata.', 'Te presto la plata si la necesitás.']::text[], note_en = coalesce(note_en, '“Si hace falta” literally means “if it''s needed”; it is often used where English says “if you need it”.')
where id = 'e81b313f-eee3-5e5c-862b-cd0eb3a64645' and es = 'Si hace falta, te presto la plata.' and en = 'If you need it, I''ll lend you the money.'
  and not (es_alt && array['Si la necesitás, te presto la plata.', 'Te presto la plata si la necesitás.']::text[]);

update public.sentences set es_alt = es_alt || array['Necesitás dormir, estás re cansado.']::text[], note_en = coalesce(note_en, '“Hacer falta” is a very common way to say something is needed; “necesitar” is also correct.')
where id = 'f502341d-759e-51f3-bf58-d74c889e7136' and es = 'Te hace falta dormir, estás re cansado.' and en = 'You need some sleep, you''re really tired.'
  and not (es_alt && array['Necesitás dormir, estás re cansado.']::text[]);

update public.sentences set es_alt = es_alt || array['No creo que haya mucha gente hoy.', 'Hoy no creo que haya mucha gente.']::text[]
where id = 'e1863c40-d5fb-5694-a573-5ef245476646' and es = 'No me parece que haya mucha gente hoy.' and en = 'I don''t think there are a lot of people today.'
  and not (es_alt && array['No creo que haya mucha gente hoy.', 'Hoy no creo que haya mucha gente.']::text[]);

update public.sentences set es_alt = es_alt || array['No te preocupes, Fede, yo lavo los platos.', 'Fede, no te preocupes, yo lavo los platos.']::text[], note_en = coalesce(note_en, '“No te hagas problema” is a very Argentine way of saying “don''t worry about it”.')
where id = '48a7610c-7f81-52c1-953d-45ce5e2703d0' and es = 'No te hagas problema, Fede, yo lavo los platos.' and en = 'Don''t worry about it, Fede, I''ll wash the dishes.'
  and not (es_alt && array['No te preocupes, Fede, yo lavo los platos.', 'Fede, no te preocupes, yo lavo los platos.']::text[]);

update public.sentences set es_alt = es_alt || array['No te preocupes, lo hago yo.', 'No te preocupes, yo lo hago.']::text[], note_en = coalesce(note_en, '“No te hagas problema” is a very Argentine way of saying “don''t worry about it”.')
where id = '52344989-9877-5e80-ab9e-176b69349ff4' and es = 'No te hagas problema, lo hago yo.' and en = 'Don''t worry about it, I''ll do it.'
  and not (es_alt && array['No te preocupes, lo hago yo.', 'No te preocupes, yo lo hago.']::text[]);

update public.sentences set es_alt = es_alt || array['No te preocupes, mañana te devuelvo la plata.', 'No te preocupes, te devuelvo la plata mañana.']::text[], note_en = coalesce(note_en, '“No te hagas problema” is a very Argentine way of saying “don''t worry about it”.')
where id = 'd3ef4957-d42c-5fe7-b746-bba4ab62c848' and es = 'No te hagas problema, mañana te devuelvo la plata.' and en = 'Don''t worry about it, I''ll give you back the money tomorrow.'
  and not (es_alt && array['No te preocupes, mañana te devuelvo la plata.', 'No te preocupes, te devuelvo la plata mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['No te preocupes, nos vemos el próximo finde.']::text[], note_en = coalesce(note_en, '“No te hagas problema” is a very Argentine way of saying “don''t worry about it”.')
where id = 'fcdf6f86-ffd8-5e8a-bc16-a0cafa0c2eac' and es = 'No te hagas problema, nos vemos el próximo finde.' and en = 'Don''t worry about it, see you next weekend.'
  and not (es_alt && array['No te preocupes, nos vemos el próximo finde.']::text[]);

update public.sentences set es_alt = es_alt || array['No te preocupes, yo te aviso.', 'No te preocupes, te aviso.']::text[], note_en = coalesce(note_en, '“No te hagas problema” is a very Argentine way of saying “don''t worry about it”.')
where id = '95ba6605-a27b-5c3c-9752-ae9e158c5266' and es = 'No te hagas problema, yo te aviso.' and en = 'Don''t worry about it, I''ll let you know.'
  and not (es_alt && array['No te preocupes, yo te aviso.', 'No te preocupes, te aviso.']::text[]);

update public.sentences set es_alt = es_alt || array['No te preocupes.']::text[], note_en = coalesce(note_en, '“No te hagas problema” is a very Argentine way of saying “don''t worry about it”.')
where id = '7725f1c2-46ff-58a0-9799-724f0cca4d1e' and es = 'No te hagas problema.' and en = 'Don''t worry about it.'
  and not (es_alt && array['No te preocupes.']::text[]);

update public.sentences set es_alt = es_alt || array['No te olvides de la SUBE.']::text[], note_en = coalesce(note_en, 'In everyday speech Argentines often drop the “de” after “olvidarse”; both versions are fine.')
where id = '28e218f4-831b-5982-bf33-9ce88722523e' and es = 'No te olvides la SUBE.' and en = 'Don''t forget your SUBE card.'
  and not (es_alt && array['No te olvides de la SUBE.']::text[]);

update public.sentences set es_alt = es_alt || array['Dale, contame, no seas mala.', 'Dale, contame, no seas malo.']::text[]
where id = '3f9306f3-4562-503b-b136-2370c77af5ff' and es = 'Contame, no seas mala.' and en = 'Come on, tell me, don''t be mean.'
  and not (es_alt && array['Dale, contame, no seas mala.', 'Dale, contame, no seas malo.']::text[]);

update public.sentences set es_alt = es_alt || array['No seas tan celoso, Mati, es solo una amiga.']::text[]
where id = 'ebf5c82e-f97e-5d12-848c-f4af08b703a8' and es = 'No seas tan celoso, Mati, es una amiga.' and en = 'Don''t be so jealous, Mati, she''s just a friend.'
  and not (es_alt && array['No seas tan celoso, Mati, es solo una amiga.']::text[]);

update public.sentences set es_alt = es_alt || array['No te pongas triste, nos vemos este finde.']::text[], note_en = coalesce(note_en, 'Argentines usually say just “el finde” for the coming weekend; “este finde” is fine too.')
where id = '907b5da7-e65e-5b6a-8d73-a99fa0d9d28c' and es = 'No te pongas triste, nos vemos el finde.' and en = 'Don''t be sad, we''ll see each other this weekend.'
  and not (es_alt && array['No te pongas triste, nos vemos este finde.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenés que probar el asado.']::text[], note_en = coalesce(note_en, '“Hay que” is the impersonal “you have to”: it means one has to, anyone should.')
where id = 'ec5906a5-348e-559f-a389-461ca25cacf0' and es = 'Hay que probar el asado.' and en = 'You have to try the asado.'
  and not (es_alt && array['Tenés que probar el asado.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Cuidado con la mochila!']::text[]
where id = '4da8afa2-b88c-5b35-bd50-21ea9e7a4437' and es = '¡Ojo con la mochila!' and en = 'Watch out for your backpack!'
  and not (es_alt && array['¡Cuidado con la mochila!']::text[]);

update public.sentences set es_alt = es_alt || array['Conviene buscar el precio en internet antes de comprar.']::text[]
where id = '1445d88f-72d8-5675-ad4e-363673ad9049' and es = 'Conviene que busques el precio en internet antes de comprar.' and en = 'It''s best to look up the price on the internet before you buy.'
  and not (es_alt && array['Conviene buscar el precio en internet antes de comprar.']::text[]);

update public.sentences set es_alt = es_alt || array['Conviene buscar un depto cerca del subte.']::text[]
where id = '7aac68fb-9171-58ee-831b-f2db246c6f2e' and es = 'Conviene que busques un depto cerca del subte.' and en = 'It''s best to look for an apartment near the subway.'
  and not (es_alt && array['Conviene buscar un depto cerca del subte.']::text[]);

update public.sentences set es_alt = es_alt || array['Conviene buscar un gimnasio cerca de casa.']::text[]
where id = '72c70938-8cd9-5f82-94b5-e44314f44f3f' and es = 'Conviene que busques un gimnasio cerca de casa.' and en = 'It''s best to look for a gym near home.'
  and not (es_alt && array['Conviene buscar un gimnasio cerca de casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Conviene reservar los pasajes con tiempo.']::text[]
where id = '74bfd98f-b595-5a48-a394-bb23c3814f4f' and es = 'Conviene que reserves los pasajes con tiempo.' and en = 'It''s best to book your tickets well ahead.'
  and not (es_alt && array['Conviene reservar los pasajes con tiempo.']::text[]);

update public.sentences set es_alt = es_alt || array['Cruzá con cuidado, viene un bondi.']::text[], note_en = coalesce(note_en, 'In Spanish a little “que” often goes before the reason for a warning or an order. It works like a quick “because”.')
where id = '5f026127-7333-5b5b-acd2-91b67bfe0464' and es = 'Cruzá con cuidado, que viene un bondi.' and en = 'Cross carefully, there''s a bus coming.'
  and not (es_alt && array['Cruzá con cuidado, viene un bondi.']::text[]);

update public.sentences set es_alt = es_alt || array['De noche, es mejor tomar un remis.', 'Es mejor tomar un remis de noche.']::text[]
where id = 'ddc0363c-d16b-5b7f-8592-d52903cc1706' and es = 'De noche, es mejor que tomes un remis.' and en = 'At night, it''s better to take a hired car.'
  and not (es_alt && array['De noche, es mejor tomar un remis.', 'Es mejor tomar un remis de noche.']::text[]);

update public.sentences set es_alt = es_alt || array['Desde el aeropuerto es mejor tomar un micro.', 'Es mejor tomar un micro desde el aeropuerto.']::text[]
where id = 'ffd63377-73a6-5cae-966e-61116bf59bbc' and es = 'Desde el aeropuerto es mejor que tomes un micro.' and en = 'From the airport, it''s better to take a shuttle bus.'
  and not (es_alt && array['Desde el aeropuerto es mejor tomar un micro.', 'Es mejor tomar un micro desde el aeropuerto.']::text[]);

update public.sentences set es_alt = es_alt || array['En la feria conviene llevar billetes chicos.', 'Conviene llevar billetes chicos en la feria.']::text[]
where id = 'ca037663-cafe-5167-9931-8da8ee47a731' and es = 'En la feria conviene que lleves billetes chicos.' and en = 'At the market, it''s best to bring small bills.'
  and not (es_alt && array['En la feria conviene llevar billetes chicos.', 'Conviene llevar billetes chicos en la feria.']::text[]);

update public.sentences set es_alt = es_alt || array['Es mejor cambiar plata en el centro.']::text[]
where id = 'da4b1c40-cc1f-548e-8680-aea19aeb56e5' and es = 'Es mejor que cambies plata en el centro.' and en = 'It''s better to change money downtown.'
  and not (es_alt && array['Es mejor cambiar plata en el centro.']::text[]);

update public.sentences set es_alt = es_alt || array['Es mejor llevar la billetera adentro de la campera.']::text[]
where id = '2c4a8863-b5be-5c82-9455-df79c22ef81c' and es = 'Es mejor que lleves la billetera adentro de la campera.' and en = 'It''s better to keep your wallet inside your jacket.'
  and not (es_alt && array['Es mejor llevar la billetera adentro de la campera.']::text[]);

update public.sentences set es_alt = es_alt || array['Hay tormenta, no salgamos.', 'No salgamos, hay tormenta.']::text[], note_en = coalesce(note_en, '“Mejor” here works like “we''d better”: it makes the suggestion sound softer, more like friendly advice.')
where id = 'e332098a-9081-5283-abb0-01d6638d7807' and es = 'Hay tormenta, mejor no salgamos.' and en = 'There''s a storm, let''s not go out.'
  and not (es_alt && array['Hay tormenta, no salgamos.', 'No salgamos, hay tormenta.']::text[]);

update public.sentences set es_alt = es_alt || array['Los sábados está lleno, conviene reservar.', 'Está lleno los sábados, conviene reservar.']::text[]
where id = '78137925-84f7-59e3-a4a9-3e4c51b56fe1' and es = 'Los sábados está lleno, conviene que reserves.' and en = 'It''s packed on Saturdays, so it''s best to book.'
  and not (es_alt && array['Los sábados está lleno, conviene reservar.', 'Está lleno los sábados, conviene reservar.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuidado con el celu acá.']::text[]
where id = '6bc3877d-a485-53a3-82ec-d0a3bf117cef' and es = 'Ojo con el celu acá.' and en = 'Careful with your phone here.'
  and not (es_alt && array['Cuidado con el celu acá.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuidado, los domingos está todo cerrado.', 'Cuidado, está todo cerrado los domingos.']::text[]
where id = '27363213-b5c0-54ee-a99c-a185ec2a7be7' and es = 'Ojo, los domingos está todo cerrado.' and en = 'Careful, everything is closed on Sundays.'
  and not (es_alt && array['Cuidado, los domingos está todo cerrado.', 'Cuidado, está todo cerrado los domingos.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuidado, no tomes ese tren.']::text[]
where id = 'a1d2c2f9-cb69-5983-96b1-7bb436147e4d' and es = 'Ojo, no tomes ese tren.' and en = 'Careful, don''t take that train.'
  and not (es_alt && array['Cuidado, no tomes ese tren.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuidado, que a esa hora no hay subte.', 'Cuidado, a esa hora no hay subte.', 'Cuidado, no hay subte a esa hora.']::text[]
where id = '20655b35-b581-5127-8a62-44cb0f9d43ea' and es = 'Ojo, que a esa hora no hay subte.' and en = 'Careful, there''s no subway at that hour.'
  and not (es_alt && array['Cuidado, que a esa hora no hay subte.', 'Cuidado, a esa hora no hay subte.', 'Cuidado, no hay subte a esa hora.']::text[]);

update public.sentences set es_alt = es_alt || array['Para ir al centro, conviene tomar el subte.', 'Conviene tomar el subte para ir al centro.']::text[]
where id = '3cdd2bd8-a1d5-5824-88e0-1e53eb990fc5' and es = 'Para ir al centro, conviene que tomes el subte.' and en = 'To get downtown, it''s best to take the subway.'
  and not (es_alt && array['Para ir al centro, conviene tomar el subte.', 'Conviene tomar el subte para ir al centro.']::text[]);

update public.sentences set es_alt = es_alt || array['Salgamos ya, cierra el banco.']::text[], note_en = coalesce(note_en, 'In Spanish a little “que” often goes before the reason for a suggestion. It works like a quick “because”.')
where id = '30709337-3d89-52be-bb18-ae4a486fb122' and es = 'Salgamos ya, que cierra el banco.' and en = 'Let''s leave now, the bank is closing.'
  and not (es_alt && array['Salgamos ya, cierra el banco.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Querés salir a comer?']::text[]
where id = 'fdbfdc0a-aada-5063-a4c7-d6d53b021eb9' and es = '¿Querés que salgamos a comer?' and en = 'Do you want to go out to eat?'
  and not (es_alt && array['¿Querés salir a comer?']::text[]);

update public.sentences set es_alt = es_alt || array['Ana, no dejes la bici afuera, está lloviendo.', 'Ana, no dejes afuera la bici, está lloviendo.']::text[]
where id = '37ebbe40-feb2-5b31-8c76-f2fea7a3b34f' and es = 'Ana, no dejes la bici afuera, llueve.' and en = 'Ana, don''t leave the bike outside, it''s raining.'
  and not (es_alt && array['Ana, no dejes la bici afuera, está lloviendo.', 'Ana, no dejes afuera la bici, está lloviendo.']::text[]);

update public.sentences set es_alt = es_alt || array['Capaz que nos vemos el finde.', 'Capaz nos vemos este finde.', 'Capaz que nos vemos este finde.']::text[], note_en = coalesce(note_en, '“Capaz” and “capaz que” both mean maybe, and Argentines use them interchangeably.')
where id = '7e346e25-367e-5055-a312-07d55f18de4f' and es = 'Capaz nos vemos el finde.' and en = 'Maybe we''ll see each other this weekend.'
  and not (es_alt && array['Capaz que nos vemos el finde.', 'Capaz nos vemos este finde.', 'Capaz que nos vemos este finde.']::text[]);

update public.sentences set es_alt = es_alt || array['Capaz que voy mañana.', 'Mañana capaz que voy.']::text[], note_en = coalesce(note_en, '“Capaz” and “capaz que” both mean maybe, and Argentines use them interchangeably.')
where id = '66219a72-35ea-5cc6-af6c-8c34c07b038f' and es = 'Capaz voy mañana.' and en = 'Maybe I''ll go tomorrow.'
  and not (es_alt && array['Capaz que voy mañana.', 'Mañana capaz que voy.']::text[]);

update public.sentences set es_alt = es_alt || array['Es mejor que lleves una campera.']::text[], note_en = coalesce(note_en, 'With things you wear or carry, Spanish often drops “un/una”: “llevá campera”.')
where id = '47142e61-0ead-5a3f-8d9b-438cfd9a1c2c' and es = 'Es mejor que lleves campera.' and en = 'You''d better bring a jacket.'
  and not (es_alt && array['Es mejor que lleves una campera.']::text[]);

update public.sentences set es_alt = es_alt || array['Es un secreto, no le cuentes a Diego.', 'Es un secreto, a Diego no le cuentes.']::text[]
where id = '36816df9-97d6-5402-968e-f55a81bc041c' and es = 'Es un secreto, no se lo cuentes a Diego.' and en = 'It''s a secret, don''t tell Diego.'
  and not (es_alt && array['Es un secreto, no le cuentes a Diego.', 'Es un secreto, a Diego no le cuentes.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que estén en casa.']::text[], note_en = coalesce(note_en, '“Ojalá” and “ojalá que” mean the same thing; both are used all the time.')
where id = '54063761-4b3d-5d5f-80cf-9e28329b4540' and es = 'Ojalá estén en casa.' and en = 'I hope they''re home.'
  and not (es_alt && array['Ojalá que estén en casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que seas muy feliz en la casa nueva.']::text[], note_en = coalesce(note_en, '“Ojalá” and “ojalá que” mean the same thing; both are used all the time.')
where id = '803d05bf-d41c-58e1-b2b6-292312426280' and es = 'Ojalá seas muy feliz en la casa nueva.' and en = 'I hope you''re really happy in the new house.'
  and not (es_alt && array['Ojalá que seas muy feliz en la casa nueva.']::text[]);

update public.sentences set es_alt = es_alt || array['Te aconsejo que lleves un paraguas.']::text[], note_en = coalesce(note_en, 'With things you wear or carry, Spanish often drops “un/una”: “llevá paraguas”.')
where id = 'beba423d-50e7-565c-ab20-945f1500c756' and es = 'Te aconsejo que lleves paraguas.' and en = 'I''d advise you to bring an umbrella.'
  and not (es_alt && array['Te aconsejo que lleves un paraguas.']::text[]);

update public.sentences set es_alt = es_alt || array['—Tengo una entrevista mañana. —¡Qué bueno!', '—Mañana tengo una entrevista. —¡Qué bueno!']::text[], note_en = coalesce(note_en, 'Argentines often drop “una” with appointments: “tengo entrevista”, “tengo turno”, “tengo clase”.')
where id = 'a53fb50c-6428-5dcd-8905-80e99dbee1b3' and es = '—Tengo entrevista mañana. —¡Qué bueno!' and en = '—I have an interview tomorrow. —That''s great!'
  and not (es_alt && array['—Tengo una entrevista mañana. —¡Qué bueno!', '—Mañana tengo una entrevista. —¡Qué bueno!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Me alegro que estés en Buenos Aires!']::text[], note_en = coalesce(note_en, 'In everyday speech Argentines often drop the “de” and say “me alegro que…”. Both are heard.')
where id = 'f838b985-970e-573e-b637-c9e888495121' and es = '¡Me alegro de que estés en Buenos Aires!' and en = 'I''m glad that you''re in Buenos Aires!'
  and not (es_alt && array['¡Me alegro que estés en Buenos Aires!']::text[]);

update public.sentences set es_alt = es_alt || array['Che, me alegro un montón de que vengas al asado.']::text[], note_en = coalesce(note_en, 'In everyday speech Argentines often drop the “de” and say “me alegro que…”. “Me alegro de que…” is just as right.')
where id = '4ebd2d56-e1a6-5186-a568-cd785c688374' and es = 'Che, me alegro un montón que vengas al asado.' and en = 'Hey, I''m really glad that you''re coming to the asado.'
  and not (es_alt && array['Che, me alegro un montón de que vengas al asado.']::text[]);

update public.sentences set es_alt = es_alt || array['Me alegro de que tu abuela esté mejor.']::text[], note_en = coalesce(note_en, 'In everyday speech Argentines often drop the “de” and say “me alegro que…”. “Me alegro de que…” is just as right.')
where id = 'be7d8707-a2b1-502a-a548-599043d671dd' and es = 'Me alegro que tu abuela esté mejor.' and en = 'I''m glad that your grandmother is better.'
  and not (es_alt && array['Me alegro de que tu abuela esté mejor.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cami todavía no llegó? Me preocupa.', '¿Cami no llegó todavía? Me preocupa.']::text[]
where id = '8110a2b3-0553-5462-9865-b4785d663409' and es = '¿Cami no llegó? Me preocupa.' and en = 'Cami isn''t here yet? That worries me.'
  and not (es_alt && array['¿Cami todavía no llegó? Me preocupa.', '¿Cami no llegó todavía? Me preocupa.']::text[]);

update public.sentences set es_alt = es_alt || array['Me alegro de que conozcas gente nueva.']::text[], note_en = coalesce(note_en, 'In everyday speech Argentines often drop the “de” and say “me alegro que…”. “Me alegro de que…” is just as right.')
where id = '73eed564-ff9b-505e-8fe4-1eef204b4413' and es = 'Me alegro que conozcas gente nueva.' and en = 'I''m glad you''re meeting new people.'
  and not (es_alt && array['Me alegro de que conozcas gente nueva.']::text[]);

update public.sentences set es_alt = es_alt || array['Me alegro de que estemos todos bien.']::text[], note_en = coalesce(note_en, 'In everyday speech Argentines often drop the “de” and say “me alegro que…”. “Me alegro de que…” is just as right.')
where id = '42bbc47a-1ede-5473-8560-e351d95ef7e5' and es = 'Me alegro que estemos todos bien.' and en = 'I''m glad we''re all doing well.'
  and not (es_alt && array['Me alegro de que estemos todos bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Qué lástima que tengas que trabajar el día de tu cumple.']::text[]
where id = 'b4b04ccf-c8b2-5a64-a5be-e12c90dd74fb' and es = 'Qué lástima que trabajes el día de tu cumple.' and en = 'What a shame you have to work on your birthday.'
  and not (es_alt && array['Qué lástima que tengas que trabajar el día de tu cumple.']::text[]);

update public.sentences set es_alt = es_alt || array['Ya sabía.']::text[]
where id = '28491daa-b7f6-53c0-b59d-97e46264d3a6' and es = 'Ya lo sabía.' and en = 'I already knew.'
  and not (es_alt && array['Ya sabía.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Vamos a Mar del Plata este finde? —¡De una!', '—¿Este finde vamos a Mar del Plata? —¡De una!']::text[], note_en = coalesce(note_en, 'Argentines usually say just “el finde” for the coming weekend; “este finde” is fine too.')
where id = '08932b8f-c085-55c3-b780-c62b701266c9' and es = '—¿Vamos a Mar del Plata el finde? —¡De una!' and en = '—Should we go to Mar del Plata this weekend? —Sure!'
  and not (es_alt && array['—¿Vamos a Mar del Plata este finde? —¡De una!', '—¿Este finde vamos a Mar del Plata? —¡De una!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés que garpar para entrar?']::text[], note_en = coalesce(note_en, '“Hay que” is the impersonal “you have to”: it asks whether anyone has to pay, not you in particular.')
where id = 'b9327507-c71a-538d-9f78-8bffbff69d97' and es = '¿Hay que garpar para entrar?' and en = 'Do you have to pay to get in?'
  and not (es_alt && array['¿Tenés que garpar para entrar?']::text[]);

update public.sentences set es_alt = es_alt || array['Hoy te toca garpar.', 'Te toca garpar hoy.']::text[], note_en = coalesce(note_en, 'The extra “a vos” just adds emphasis: your turn, not mine.')
where id = '82d4c0a7-94f8-55bf-9c88-554ff909e817' and es = 'Hoy te toca garpar a vos.' and en = 'Today it''s your turn to pay.'
  and not (es_alt && array['Hoy te toca garpar.', 'Te toca garpar hoy.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Hacemos un asado este finde? —De una, llevo el vino.', '—¿Este finde hacemos un asado? —De una, llevo el vino.']::text[], note_en = coalesce(note_en, 'Argentines usually say just “el finde” for the coming weekend; “este finde” is fine too.')
where id = '6067e17f-e4af-579f-b009-c62b987423eb' and es = '—¿Hacemos un asado el finde? —De una, llevo el vino.' and en = '—Should we have an asado this weekend? —Sure, I''ll bring the wine.'
  and not (es_alt && array['—¿Hacemos un asado este finde? —De una, llevo el vino.', '—¿Este finde hacemos un asado? —De una, llevo el vino.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Qué suerte, no está lloviendo!', '¡No está lloviendo, qué suerte!']::text[]
where id = '8747cc70-d4fc-5087-b2ce-417b82c720be' and es = '¡Qué suerte, no llueve!' and en = 'Lucky it''s not raining!'
  and not (es_alt && array['¡Qué suerte, no está lloviendo!', '¡No está lloviendo, qué suerte!']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo ganas de cocinar, morfamos afuera.']::text[], note_en = coalesce(note_en, '“Me da fiaca” is the very Argentine way to say you can''t be bothered; “no tengo ganas” says the same thing plainly.')
where id = '783e1f77-58cb-52e3-b48a-6d0f42b07733' and es = 'Me da fiaca cocinar, morfamos afuera.' and en = 'I don''t feel like cooking, we''ll eat out.'
  and not (es_alt && array['No tengo ganas de cocinar, morfamos afuera.']::text[]);

update public.sentences set es_alt = es_alt || array['No creo que sea un afano, vale la pena.', 'No me parece que sea un afano, vale la pena.']::text[], note_en = coalesce(note_en, 'Argentines often give an opinion with “para mí” instead of “creo que”.')
where id = '8e15f9bd-d349-5464-8257-8ec3921b23ae' and es = 'Para mí no es un afano, vale la pena.' and en = 'I don''t think it''s way too expensive, it''s worth it.'
  and not (es_alt && array['No creo que sea un afano, vale la pena.', 'No me parece que sea un afano, vale la pena.']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo ganas de ir al banco hoy.', 'Me da fiaca ir al banco hoy.']::text[], note_en = coalesce(note_en, '“Qué fiaca” is the very Argentine way to say you can''t be bothered; “no tengo ganas” says the same thing plainly.')
where id = 'e83f4b74-0622-57d3-8a69-c7b8afa68440' and es = 'Qué fiaca ir al banco hoy.' and en = 'I don''t feel like going to the bank today.'
  and not (es_alt && array['No tengo ganas de ir al banco hoy.', 'Me da fiaca ir al banco hoy.']::text[]);

update public.sentences set es_alt = es_alt || array['Repetime dónde nos encontramos, me olvidé.']::text[], note_en = coalesce(note_en, 'Argentines often tack a reason on with a little “que”, meaning “because”. It is optional.')
where id = '882cf961-9650-53a0-9d44-b03002430e25' and es = 'Repetime dónde nos encontramos, que me olvidé.' and en = 'Tell me again where we''re meeting, I forgot.'
  and not (es_alt && array['Repetime dónde nos encontramos, me olvidé.']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo ganas, ¿pedimos delivery?']::text[], note_en = coalesce(note_en, '“Tengo fiaca” is the very Argentine way to say you can''t be bothered; “no tengo ganas” says the same thing plainly.')
where id = 'baa92fd4-b74c-5d3c-992e-4baa67f88335' and es = 'Tengo fiaca, ¿pedimos delivery?' and en = 'I don''t feel like it, should we order delivery?'
  and not (es_alt && array['No tengo ganas, ¿pedimos delivery?']::text[]);

update public.sentences set es_alt = es_alt || array['Chau, mandale saludos a tu hermana.', 'Chau, mandale un saludo a tu hermana.']::text[]
where id = '24f594d1-10df-5deb-a3fc-e4c6364d909a' and es = 'Chau, saludos a tu hermana.' and en = 'Bye, say hi to your sister.'
  and not (es_alt && array['Chau, mandale saludos a tu hermana.', 'Chau, mandale un saludo a tu hermana.']::text[]);

update public.sentences set es_alt = es_alt || array['Escribime apenas llegues, es tarde.']::text[], note_en = coalesce(note_en, 'Argentines often tack a reason on with a little “que”, meaning “because”. It is optional.')
where id = '3a7ba0e8-0206-5a8d-8ccd-b3373dc22a05' and es = 'Escribime apenas llegues, que es tarde.' and en = 'Text me as soon as you get there, it''s late.'
  and not (es_alt && array['Escribime apenas llegues, es tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuela te mandó saludos.']::text[]
where id = 'dd52442e-54a9-5b43-b179-3617fe815ab1' and es = 'Mi abuela te mandó un saludo.' and en = 'My grandma says hi.'
  and not (es_alt && array['Mi abuela te mandó saludos.']::text[]);

update public.sentences set es_alt = es_alt || array['No sigas comiendo, hay postre.']::text[], note_en = coalesce(note_en, 'Argentines often tack a reason on with a little “que”, meaning “because”. It is optional.')
where id = 'd0e36d65-9b33-5bdc-abc2-a0618fdd4d7b' and es = 'No sigas comiendo, que hay postre.' and en = 'Don''t keep eating, there''s dessert.'
  and not (es_alt && array['No sigas comiendo, hay postre.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá duermas mejor esta noche.', 'Espero que duermas mejor esta noche.', 'Espero que duermas mejor hoy.']::text[], note_en = coalesce(note_en, '“Hoy” here simply means tonight; “esta noche” is just as correct.')
where id = '116720eb-2319-5d88-bb9a-a83af0ac6b1f' and es = 'Ojalá duermas mejor hoy.' and en = 'I hope you sleep better tonight.'
  and not (es_alt && array['Ojalá duermas mejor esta noche.', 'Espero que duermas mejor esta noche.', 'Espero que duermas mejor hoy.']::text[]);

update public.sentences set es_alt = es_alt || array['Mandale saludos a Rocío y nos vemos el sábado.', 'Mandale un saludo a Rocío y nos vemos el sábado.']::text[]
where id = 'a9934dec-ed66-5c88-b724-4575e044da9a' and es = 'Saludos a Rocío y nos vemos el sábado.' and en = 'Say hi to Rocío, and see you Saturday.'
  and not (es_alt && array['Mandale saludos a Rocío y nos vemos el sábado.', 'Mandale un saludo a Rocío y nos vemos el sábado.']::text[]);

update public.sentences set es_alt = es_alt || array['Mandale un saludo a tu vieja.', 'Mandale saludos a tu vieja.', 'Saludos a tu vieja.']::text[]
where id = '4505ba14-ee3c-5690-959d-f46c66bbb03a' and es = 'Un saludo a tu vieja.' and en = 'Say hi to your mom for me.'
  and not (es_alt && array['Mandale un saludo a tu vieja.', 'Mandale saludos a tu vieja.', 'Saludos a tu vieja.']::text[]);

update public.sentences set es_alt = es_alt || array['Un abrazo, cuidate y nos hablamos.']::text[], note_en = coalesce(note_en, 'Argentines usually sign off with a single “abrazo” where English says “hugs”.')
where id = '690af734-ef8e-5b42-8cc2-207dfe0998ff' and es = 'Abrazo, cuidate y nos hablamos.' and en = 'Hugs, take care, and we''ll talk soon.'
  and not (es_alt && array['Un abrazo, cuidate y nos hablamos.']::text[]);

update public.sentences set es_alt = es_alt || array['Buen finde, que la pases lindo, ¡un abrazo!']::text[], note_en = coalesce(note_en, 'Argentines usually sign off with a single “abrazo” where English says “hugs”.')
where id = '9263b9ed-5d57-5428-9dc0-5fc805a5858d' and es = 'Buen finde, que la pases lindo, ¡abrazo!' and en = 'Have a good weekend, have a great time, hugs!'
  and not (es_alt && array['Buen finde, que la pases lindo, ¡un abrazo!']::text[]);

update public.sentences set es_alt = es_alt || array['Bueno, un abrazo.']::text[], note_en = coalesce(note_en, 'Argentines usually sign off with a single “abrazo” where English says “hugs”.')
where id = '8a9b743f-15ea-5b30-9527-c775b3b19ba7' and es = 'Bueno, abrazo.' and en = 'OK, hugs.'
  and not (es_alt && array['Bueno, un abrazo.']::text[]);

update public.sentences set es_alt = es_alt || array['Bueno, me acuesto, besos.']::text[], note_en = coalesce(note_en, 'Argentines usually sign off with “un beso”, in the singular, where English says “kisses”.')
where id = 'fa81676f-f111-5a76-8b16-d4294448a6b4' and es = 'Bueno, me acuesto, un beso.' and en = 'Well, I''m going to bed, kisses.'
  and not (es_alt && array['Bueno, me acuesto, besos.']::text[]);

update public.sentences set es_alt = es_alt || array['Bueno, nos hablamos, espero que te vaya bien en la entrevista.', 'Bueno, nos hablamos, ojalá te vaya bien en la entrevista.']::text[], note_en = coalesce(note_en, 'A wish can start with just “que…”: “que te vaya bien” already means “hope it goes well”.')
where id = '902a57ca-b357-5da7-b4fb-eb7052498540' and es = 'Bueno, nos hablamos, que te vaya bien en la entrevista.' and en = 'OK, talk soon, hope it goes well at the interview.'
  and not (es_alt && array['Bueno, nos hablamos, espero que te vaya bien en la entrevista.', 'Bueno, nos hablamos, ojalá te vaya bien en la entrevista.']::text[]);

update public.sentences set es_alt = es_alt || array['Chau, besos.']::text[], note_en = coalesce(note_en, 'Argentines usually sign off with “un beso”, in the singular, where English says “kisses”.')
where id = 'f9b1e7a9-902a-5f44-a6ef-d2067ff0ce28' and es = 'Chau, un beso.' and en = 'Bye, kisses.'
  and not (es_alt && array['Chau, besos.']::text[]);

update public.sentences set es_alt = es_alt || array['Dale, besos.', 'Dale, un beso.']::text[], note_en = coalesce(note_en, 'Argentines usually sign off with “beso”, in the singular, where English says “kisses”.')
where id = '54e0b4c6-4ced-5548-82c1-25167236e457' and es = 'Dale, beso.' and en = 'OK, kisses.'
  and not (es_alt && array['Dale, besos.', 'Dale, un beso.']::text[]);

update public.sentences set es_alt = es_alt || array['Es tarde, avisame cuando llegues. ¡Un abrazo!']::text[], note_en = coalesce(note_en, 'Argentines usually sign off with a single “abrazo” where English says “hugs”.')
where id = '9426f13a-28a4-512c-adcc-95a158819a8b' and es = 'Es tarde, avisame cuando llegues. ¡Abrazo!' and en = 'It''s late, let me know when you get there. Hugs!'
  and not (es_alt && array['Es tarde, avisame cuando llegues. ¡Un abrazo!']::text[]);

update public.sentences set es_alt = es_alt || array['Es tarde, que duermas bien.']::text[], note_en = coalesce(note_en, '“Que descanses” (literally “rest well”) is the usual Argentine good-night wish.')
where id = 'e36e7a68-1b65-505e-8f02-22143afe276c' and es = 'Es tarde, que descanses.' and en = 'It''s late, sleep well.'
  and not (es_alt && array['Es tarde, que duermas bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana laburás temprano, que duermas bien.']::text[], note_en = coalesce(note_en, '“Que descanses” (literally “rest well”) is the usual Argentine good-night wish.')
where id = 'e03719ea-230f-59d7-b25b-2b0af244623d' and es = 'Mañana laburás temprano, que descanses.' and en = 'You work early tomorrow, sleep well.'
  and not (es_alt && array['Mañana laburás temprano, que duermas bien.']::text[]);

update public.sentences set es_alt = es_alt || array['No te preocupes por el examen, que duermas bien.']::text[], note_en = coalesce(note_en, '“Que descanses” (literally “rest well”) is the usual Argentine good-night wish.')
where id = 'e5bfec7c-30ea-56b7-b5e8-f8b59b19701c' and es = 'No te preocupes por el examen, que descanses.' and en = 'Don''t worry about the exam, sleep well.'
  and not (es_alt && array['No te preocupes por el examen, que duermas bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Nos hablamos mañana, besos y que descanses.', 'Nos hablamos mañana, un beso y que duermas bien.', 'Nos hablamos mañana, besos y que duermas bien.']::text[], note_en = coalesce(note_en, 'Argentines usually sign off with “un beso”, in the singular, and “que descanses” is the usual good-night wish.')
where id = 'e55baaa2-f6a6-5311-a62f-ff13ea4af0d4' and es = 'Nos hablamos mañana, un beso y que descanses.' and en = 'We''ll talk tomorrow, kisses, and sleep well.'
  and not (es_alt && array['Nos hablamos mañana, besos y que descanses.', 'Nos hablamos mañana, un beso y que duermas bien.', 'Nos hablamos mañana, besos y que duermas bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Nos vemos el sábado, un abrazo.']::text[], note_en = coalesce(note_en, 'Argentines usually sign off with a single “abrazo” where English says “hugs”.')
where id = '3cc54be6-ed68-5674-a68c-4ead07d77496' and es = 'Nos vemos el sábado, abrazo.' and en = 'See you on Saturday, hugs.'
  and not (es_alt && array['Nos vemos el sábado, un abrazo.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que duermas bien esta noche.', 'Espero que descanses bien esta noche.', 'Espero que duermas bien esta noche.']::text[]
where id = '40f282c3-3829-5647-8206-1b7bc4700661' and es = 'Ojalá que descanses bien esta noche.' and en = 'I hope you sleep well tonight.'
  and not (es_alt && array['Ojalá que duermas bien esta noche.', 'Espero que descanses bien esta noche.', 'Espero que duermas bien esta noche.']::text[]);

update public.sentences set es_alt = es_alt || array['Tomá el remedio y que duermas bien.']::text[], note_en = coalesce(note_en, '“Que descanses” (literally “rest well”) is the usual Argentine good-night wish.')
where id = '2b4d0460-f17f-50c7-a511-9fd6de851f39' and es = 'Tomá el remedio y que descanses.' and en = 'Take the medicine and sleep well.'
  and not (es_alt && array['Tomá el remedio y que duermas bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Un beso para tu mamá.']::text[]
where id = '23cabdae-d858-547b-b3f0-c3d0d262cfeb' and es = 'Un beso a tu mamá.' and en = 'A kiss for your mom.'
  and not (es_alt && array['Un beso para tu mamá.']::text[]);

update public.sentences set es_alt = es_alt || array['Che, en tu lugar, compraría las zapatillas negras.']::text[], note_en = coalesce(note_en, '“Yo que vos” is the short everyday way to say “si yo fuera vos”.')
where id = '67bfd3fc-1fe2-5b71-bdd0-c84d1052b19f' and es = 'Che, yo que vos, compraría las zapatillas negras.' and en = 'Hey, if I were you, I''d buy the black sneakers.'
  and not (es_alt && array['Che, en tu lugar, compraría las zapatillas negras.']::text[]);

update public.sentences set es_alt = es_alt || array['En tu lugar, compraría la campera.']::text[], note_en = coalesce(note_en, '“Yo que vos” is the short everyday way to say “si yo fuera vos”.')
where id = '16a4a51b-78c8-5e16-bd13-17b2b7400735' and es = 'Yo que vos, compraría la campera.' and en = 'If I were you, I''d buy the jacket.'
  and not (es_alt && array['En tu lugar, compraría la campera.']::text[]);

update public.sentences set es_alt = es_alt || array['En tu lugar, esperaría un rato.']::text[], note_en = coalesce(note_en, '“Yo que vos” is the short everyday way to say “si yo fuera vos”.')
where id = '40c9888e-ab77-56f7-8984-3a3f7b2994b0' and es = 'Yo que vos, esperaría un rato.' and en = 'If I were you, I''d wait a while.'
  and not (es_alt && array['En tu lugar, esperaría un rato.']::text[]);

update public.sentences set es_alt = es_alt || array['En tu lugar, iría a la farmacia ahora.']::text[], note_en = coalesce(note_en, '“Yo que vos” is the short everyday way to say “si yo fuera vos”.')
where id = '78194867-deb4-5547-8a8c-21e8160f92d1' and es = 'Yo que vos, iría a la farmacia ahora.' and en = 'If I were you, I''d go to the pharmacy now.'
  and not (es_alt && array['En tu lugar, iría a la farmacia ahora.']::text[]);

update public.sentences set es_alt = es_alt || array['En tu lugar, iría a la guardia hoy.']::text[], note_en = coalesce(note_en, '“Yo que vos” is the short everyday way to say “si yo fuera vos”.')
where id = '81f81535-7abb-584e-8a7b-bf73071b5e8f' and es = 'Yo que vos, iría a la guardia hoy.' and en = 'If I were you, I''d go to the ER today.'
  and not (es_alt && array['En tu lugar, iría a la guardia hoy.']::text[]);

update public.sentences set es_alt = es_alt || array['En tu lugar, iría al médico.']::text[], note_en = coalesce(note_en, '“Yo que vos” is the short everyday way to say “si yo fuera vos”.')
where id = 'c11653d9-5e65-5a1d-aa5a-7f8e66c9d04e' and es = 'Yo que vos, iría al médico.' and en = 'If I were you, I''d go to the doctor.'
  and not (es_alt && array['En tu lugar, iría al médico.']::text[]);

update public.sentences set es_alt = es_alt || array['En tu lugar, iría.']::text[], note_en = coalesce(note_en, '“Yo que vos” is the short everyday way to say “si yo fuera vos”.')
where id = 'f4edc267-221b-5d76-b838-f6c3759ef2fd' and es = 'Yo que vos, iría.' and en = 'If I were you, I''d go.'
  and not (es_alt && array['En tu lugar, iría.']::text[]);

update public.sentences set es_alt = es_alt || array['En tu lugar, lo haría mañana.']::text[], note_en = coalesce(note_en, '“Yo que vos” is the short everyday way to say “si yo fuera vos”.')
where id = '61775cdc-abeb-5f13-a05f-d4c9b62e931d' and es = 'Yo que vos, lo haría mañana.' and en = 'If I were you, I''d do it tomorrow.'
  and not (es_alt && array['En tu lugar, lo haría mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Con esa fiebre, yo que vos iría a la guardia.']::text[], note_en = coalesce(note_en, '“En tu lugar” (in your place) is a common way to say “if I were you”.')
where id = '6c729822-12b6-50cf-a6f5-80158a35ed95' and es = 'Con esa fiebre, en tu lugar iría a la guardia.' and en = 'With that fever, if I were you I''d go to the ER.'
  and not (es_alt && array['Con esa fiebre, yo que vos iría a la guardia.']::text[]);

update public.sentences set es_alt = es_alt || array['Yo que vos, no esperaría más.']::text[], note_en = coalesce(note_en, '“En tu lugar” (in your place) is a common way to say “if I were you”.')
where id = 'e3c49583-5c72-580c-8c3a-e96cf35533fe' and es = 'En tu lugar, ya no esperaría más.' and en = 'If I were you, I wouldn''t wait any longer.'
  and not (es_alt && array['Yo que vos, no esperaría más.']::text[]);

update public.sentences set es_alt = es_alt || array['Mati, yo que vos, tendría cuidado.']::text[], note_en = coalesce(note_en, '“En tu lugar” (in your place) is a common way to say “if I were you”.')
where id = '84843922-07ff-5854-a964-ee2479d9293c' and es = 'Mati, en tu lugar tendría cuidado.' and en = 'Mati, if I were you, I''d be careful.'
  and not (es_alt && array['Mati, yo que vos, tendría cuidado.']::text[]);

update public.sentences set es_alt = es_alt || array['En tu lugar, buscaría a Juan y le hablaría.']::text[], note_en = coalesce(note_en, '“Yo que vos” is the short everyday way to say “si yo fuera vos”.')
where id = '66532ae9-532d-54d6-abe1-a93c0596ccf7' and es = 'Yo que vos, buscaría a Juan y le hablaría.' and en = 'If I were you, I''d find Juan and talk to him.'
  and not (es_alt && array['En tu lugar, buscaría a Juan y le hablaría.']::text[]);

update public.sentences set es_alt = es_alt || array['En tu lugar, hablaría con ella.']::text[], note_en = coalesce(note_en, '“Yo que vos” is the short everyday way to say “si yo fuera vos”.')
where id = 'b87e63ed-3e39-5fe8-8ad5-8db0cab5d63d' and es = 'Yo que vos, hablaría con ella.' and en = 'If I were you, I''d talk to her.'
  and not (es_alt && array['En tu lugar, hablaría con ella.']::text[]);

update public.sentences set es_alt = es_alt || array['En tu lugar, no saldría hoy.']::text[], note_en = coalesce(note_en, '“Yo que vos” is the short everyday way to say “si yo fuera vos”.')
where id = '87754435-cdb6-57ca-9c5a-ff319ced5344' and es = 'Yo que vos, no saldría hoy.' and en = 'If I were you, I wouldn''t go out today.'
  and not (es_alt && array['En tu lugar, no saldría hoy.']::text[]);

update public.sentences set es_alt = es_alt || array['Yo saldría ya, se hace tarde.']::text[], note_en = coalesce(note_en, 'Argentines often tack a reason on with a little “que”, meaning “because”. It is optional.')
where id = 'fa3afb74-57f5-5a49-b97c-2613a70cc4c7' and es = 'Yo saldría ya, que se hace tarde.' and en = 'I''d leave now, it''s getting late.'
  and not (es_alt && array['Yo saldría ya, se hace tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Vos creés que soy millonaria?', '¿Vos pensás que soy millonaria?']::text[], note_en = coalesce(note_en, 'The extra “te” in “te creés” adds a tone of disbelief, like “do you seriously think…?”. Plain “creés” is also correct.')
where id = '0a9a3ee7-4ba0-5015-9923-89ca2cbf6967' and es = '¿Vos te creés que soy millonaria?' and en = 'Do you think I''m a millionaire?'
  and not (es_alt && array['¿Vos creés que soy millonaria?', '¿Vos pensás que soy millonaria?']::text[]);

update public.sentences set es_alt = es_alt || array['¿A tus viejos les molestaría si fuera?']::text[], note_en = coalesce(note_en, 'In everyday speech Argentines often use the plain present after “si” here.')
where id = 'a1d8fec0-f891-5689-b484-a620251bb1d9' and es = '¿A tus viejos les molestaría si voy?' and en = 'Would your parents mind if I came?'
  and not (es_alt && array['¿A tus viejos les molestaría si fuera?']::text[]);

update public.sentences set es_alt = es_alt || array['Si no es molestia, ¿me podés esperar cinco minutos?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿me esperás?” already sounds polite.')
where id = '090e5aa1-c999-5f13-bd15-1142addac67f' and es = 'Si no es molestia, ¿me esperás cinco minutos?' and en = 'If it''s no trouble, can you wait five minutes for me?'
  and not (es_alt && array['Si no es molestia, ¿me podés esperar cinco minutos?']::text[]);

update public.sentences set es_alt = es_alt || array['Perdón que te moleste, ¿hay una farmacia por acá?']::text[]
where id = '9a149c8d-0050-5445-8c16-e15e519fd678' and es = 'Disculpá que te moleste, ¿hay una farmacia por acá?' and en = 'Sorry to bother you, is there a pharmacy around here?'
  and not (es_alt && array['Perdón que te moleste, ¿hay una farmacia por acá?']::text[]);

update public.sentences set es_alt = es_alt || array['Perdón que te moleste, señora, ¿me cuidás el lugar?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿me cuidás…?” already sounds polite.')
where id = '8a55315c-659e-5ead-a9f1-e86b88e77522' and es = 'Disculpá que te moleste, señora, ¿me cuidás el lugar?' and en = 'Sorry to bother you, ma''am, can you save my place?'
  and not (es_alt && array['Perdón que te moleste, señora, ¿me cuidás el lugar?']::text[]);

update public.sentences set es_alt = es_alt || array['Perdón, me olvidé de traer tu cargador.']::text[]
where id = '88709808-ec97-5447-bdd5-f211a0548682' and es = 'Disculpá, me olvidé de traer tu cargador.' and en = 'Sorry, I forgot to bring your charger.'
  and not (es_alt && array['Perdón, me olvidé de traer tu cargador.']::text[]);

update public.sentences set es_alt = es_alt || array['Perdón, no sé.']::text[]
where id = '9cd68a11-760a-5512-b376-d0a1c27d4704' and es = 'Disculpá, no sé.' and en = 'Sorry, I don''t know.'
  and not (es_alt && array['Perdón, no sé.']::text[]);

update public.sentences set es_alt = es_alt || array['Perdón, Sofi, hoy no puedo.']::text[]
where id = '23bc4416-cc5d-5171-a679-3a4f910e2798' and es = 'Disculpá, Sofi, hoy no puedo.' and en = 'Sorry, Sofi, I can''t today.'
  and not (es_alt && array['Perdón, Sofi, hoy no puedo.']::text[]);

update public.sentences set es_alt = es_alt || array['Perdón por la molestia, quería saber si hay lugar.', 'Disculpá la molestia, quería saber si hay lugar.']::text[]
where id = '16972b34-0e27-52f7-a2ad-1efd7e3182d6' and es = 'Disculpame la molestia, quería saber si hay lugar.' and en = 'Sorry for the trouble, I wanted to know if there''s room.'
  and not (es_alt && array['Perdón por la molestia, quería saber si hay lugar.', 'Disculpá la molestia, quería saber si hay lugar.']::text[]);

update public.sentences set es_alt = es_alt || array['Disculpame, ¿me podrías sacar una foto con mis amigos?', 'Disculpame, ¿me podés sacar una foto con mis amigos?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with the plain present: “¿me sacás…?” already sounds polite.')
where id = '4bb04e81-2daf-50b9-ba57-8be552270938' and es = 'Disculpame, ¿me sacás una foto con mis amigos?' and en = 'Excuse me, could you take a picture of me with my friends?'
  and not (es_alt && array['Disculpame, ¿me podrías sacar una foto con mis amigos?', 'Disculpame, ¿me podés sacar una foto con mis amigos?']::text[]);

update public.sentences set es_alt = es_alt || array['Prestame diez mil pesos, no me alcanza.']::text[], note_en = coalesce(note_en, 'Argentines often link a request to its reason with a little “que”, like a soft “because”.')
where id = 'be16afe0-19d9-5e9a-81dc-fdb558a0af12' and es = 'Prestame diez mil pesos, que no me alcanza.' and en = 'Lend me ten thousand pesos, I don''t have enough.'
  and not (es_alt && array['Prestame diez mil pesos, no me alcanza.']::text[]);

update public.sentences set es_alt = es_alt || array['Quisiera cambiar mi turno.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my”, when it is obvious whose it is.')
where id = 'c5134efb-dfa8-5703-a0cd-fa2538f93ea6' and es = 'Quisiera cambiar el turno.' and en = 'I''d like to change my appointment.'
  and not (es_alt && array['Quisiera cambiar mi turno.']::text[]);

update public.sentences set es_alt = es_alt || array['Señora, ¿no tendrás saldo en tu SUBE? Te lo pago.']::text[], note_en = coalesce(note_en, 'Spanish often says “la” where English says “your”, when it is obvious whose it is.')
where id = 'de95d07c-53b9-50b7-8a92-141287f58c06' and es = 'Señora, ¿no tendrás saldo en la SUBE? Te lo pago.' and en = 'Ma''am, do you happen to have credit on your SUBE? I''ll pay you for it.'
  and not (es_alt && array['Señora, ¿no tendrás saldo en tu SUBE? Te lo pago.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Me cuidás mis plantas? —Cómo no, doña Rosa.']::text[], note_en = coalesce(note_en, 'The “me” already shows whose plants they are, so Spanish just says “las plantas”.')
where id = 'd0326d54-8662-522c-a0d7-eccaa73a8d83' and es = '—¿Me cuidás las plantas? —Cómo no, doña Rosa.' and en = '—Can you look after my plants? —Of course, Doña Rosa.'
  and not (es_alt && array['—¿Me cuidás mis plantas? —Cómo no, doña Rosa.']::text[]);

update public.sentences set es_alt = es_alt || array['Tendrías que cargar tu celu antes de salir.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “your”, when it is obvious whose it is.')
where id = '5830bebe-a1d9-5b53-bc50-fa302edc47fb' and es = 'Tendrías que cargar el celu antes de salir.' and en = 'You should charge your phone before you go out.'
  and not (es_alt && array['Tendrías que cargar tu celu antes de salir.']::text[]);

update public.sentences set es_alt = es_alt || array['Ahorro poco porque mi sueldo no me alcanza.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my”, when it is obvious whose it is.')
where id = '91794c5f-5f59-5587-a715-762bc853cf64' and es = 'Ahorro poco porque el sueldo no me alcanza.' and en = 'I don''t save much because my salary isn''t enough.'
  and not (es_alt && array['Ahorro poco porque mi sueldo no me alcanza.']::text[]);

update public.sentences set es_alt = es_alt || array['Gasté todo mi sueldo.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my”, when it is obvious whose it is.')
where id = '0c310222-08ba-5d02-81ce-be3fcc229c9e' and es = 'Gasté todo el sueldo.' and en = 'I spent my whole salary.'
  and not (es_alt && array['Gasté todo mi sueldo.']::text[]);

update public.sentences set es_alt = es_alt || array['Ya gasté todo mi sueldo.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my”, when it is obvious whose it is.')
where id = 'e12c73ef-5f5c-5ec0-8324-10b03d02df4b' and es = 'Ya gasté todo el sueldo.' and en = 'I already spent my whole salary.'
  and not (es_alt && array['Ya gasté todo mi sueldo.']::text[]);

update public.sentences set es_alt = es_alt || array['Nunca uso mi tarjeta de crédito.']::text[], note_en = coalesce(note_en, 'Spanish often says “la” where English says “my”, when it is obvious whose it is.')
where id = '8c59c6a1-e293-5e31-855a-f5c0ca99c4ec' and es = 'Nunca uso la tarjeta de crédito.' and en = 'I never use my credit card.'
  and not (es_alt && array['Nunca uso mi tarjeta de crédito.']::text[]);

update public.sentences set es_alt = es_alt || array['Todavía no cobré mi aguinaldo.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my”, when it is obvious whose it is.')
where id = '60bda28b-9f95-5475-bae5-cccff69c3e04' and es = 'Todavía no cobré el aguinaldo.' and en = 'I haven''t gotten my bonus yet.'
  and not (es_alt && array['Todavía no cobré mi aguinaldo.']::text[]);

update public.sentences set es_alt = es_alt || array['No te olvides de tu paraguas porque va a llover.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “your”, when it is obvious whose it is.')
where id = '90dbe34c-c0ad-56f5-84b4-64d05dd17807' and es = 'No te olvides del paraguas porque va a llover.' and en = 'Don''t forget your umbrella, because it''s going to rain.'
  and not (es_alt && array['No te olvides de tu paraguas porque va a llover.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te alcanza tu sueldo para vivir solo?', '¿Tu sueldo te alcanza para vivir solo?']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “your”, when it is obvious whose it is.')
where id = '2a2abd8a-1389-50a6-89ff-18c7557e97b3' and es = '¿Te alcanza el sueldo para vivir solo?' and en = 'Is your salary enough to live on your own?'
  and not (es_alt && array['¿Te alcanza tu sueldo para vivir solo?', '¿Tu sueldo te alcanza para vivir solo?']::text[]);

update public.sentences set es_alt = es_alt || array['Cobré mi aguinaldo y me compré una campera.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my”, when it is obvious whose it is.')
where id = '631f12d7-2804-5e5f-8c12-9f25b76f86a9' and es = 'Cobré el aguinaldo y me compré una campera.' and en = 'I got my bonus and bought myself a jacket.'
  and not (es_alt && array['Cobré mi aguinaldo y me compré una campera.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Quién trabaja hoy?']::text[], note_en = coalesce(note_en, '“Atender” means serving customers or seeing patients, so this asks who is on duty today.')
where id = '2adbee0c-b6cb-5d36-bdfd-5dacc6af06b7' and es = '¿Quién atiende hoy?' and en = 'Who''s working today?'
  and not (es_alt && array['¿Quién trabaja hoy?']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Vamos en auto? —Preferiría tomar el subte, hay mucho tránsito.', '—¿Vamos en auto? —Preferiría ir en subte, hay mucho tránsito.']::text[]
where id = '39d5473e-becf-5723-8fdc-6f7de6d15e5a' and es = '—¿Vamos en auto? —Preferiría el subte, hay mucho tránsito.' and en = '—Should we go by car? —I''d rather take the subway, there''s a lot of traffic.'
  and not (es_alt && array['—¿Vamos en auto? —Preferiría tomar el subte, hay mucho tránsito.', '—¿Vamos en auto? —Preferiría ir en subte, hay mucho tránsito.']::text[]);

update public.sentences set es_alt = es_alt || array['Preferiría tomar un café.']::text[]
where id = 'e66a5021-ba1d-53d4-ad20-1df59525e2be' and es = 'Preferiría un café.' and en = 'I''d rather have a coffee.'
  and not (es_alt && array['Preferiría tomar un café.']::text[]);

update public.sentences set es_alt = es_alt || array['No tendrías que comprar ahora, está carísimo.']::text[], note_en = coalesce(note_en, '“No te conviene” means it''s not a good move for you. It''s a very common way to give advice.')
where id = '4047b0fe-cf57-543e-8de8-39f9b2f6ec8f' and es = 'No te conviene comprar ahora, está carísimo.' and en = 'You shouldn''t buy now, it''s super expensive.'
  and not (es_alt && array['No tendrías que comprar ahora, está carísimo.']::text[]);

update public.sentences set es_alt = es_alt || array['Podríamos compartir un taxi al centro.']::text[]
where id = '48405add-1f7e-511c-a602-833d7c735c02' and es = 'Podríamos compartir un taxi hasta el centro.' and en = 'We could share a cab downtown.'
  and not (es_alt && array['Podríamos compartir un taxi al centro.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi celu estaba sin batería, perdón.', 'El celu estaba sin batería, perdón.']::text[]
where id = '0572b39c-9d1c-5e8a-bd1d-58811ffd7f2e' and es = 'Tenía el celu sin batería, perdón.' and en = 'My phone was dead, sorry.'
  and not (es_alt && array['Mi celu estaba sin batería, perdón.', 'El celu estaba sin batería, perdón.']::text[]);

update public.sentences set es_alt = es_alt || array['¿De cuánto es tu cuota?', '¿Cuánto es tu cuota?', '¿De cuánto es la cuota?']::text[]
where id = '4f637053-6288-59b1-a97b-73ed14f6b18b' and es = '¿Cuánto pagás de cuota?' and en = 'How much is your installment?'
  and not (es_alt && array['¿De cuánto es tu cuota?', '¿Cuánto es tu cuota?', '¿De cuánto es la cuota?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuela guarda dólares en casa.']::text[]
where id = '5f4a581b-83a8-5a15-84e9-da498934c5c3' and es = 'Mi abuela tiene dólares en casa.' and en = 'My grandmother keeps dollars at home.'
  and not (es_alt && array['Mi abuela guarda dólares en casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Gasto toda mi plata en el súper.', 'Gasto toda la plata en el súper.']::text[], note_en = coalesce(note_en, '“Se me va la plata” means the money just slips away from me. It''s a very common way to complain about spending.')
where id = '5fb7e1e7-2414-5c99-b6ea-30ab5e7f787b' and es = 'Toda la plata se me va en el súper.' and en = 'I spend all my money at the supermarket.'
  and not (es_alt && array['Gasto toda mi plata en el súper.', 'Gasto toda la plata en el súper.']::text[]);

update public.sentences set es_alt = es_alt || array['Lucía y yo siempre vamos a medias.']::text[], note_en = coalesce(note_en, 'Argentines often say “con Lucía vamos” to mean “Lucía and I go”.')
where id = 'd463f747-c8fa-54c1-9f1a-f4302fc97502' and es = 'Con Lucía siempre vamos a medias.' and en = 'Lucía and I always split everything.'
  and not (es_alt && array['Lucía y yo siempre vamos a medias.']::text[]);

update public.sentences set es_alt = es_alt || array['Pablo y yo vamos a medias en la nafta.']::text[], note_en = coalesce(note_en, 'Argentines often say “con Pablo vamos” to mean “Pablo and I go”.')
where id = '88c267b4-13df-5741-a6d8-f4417e889175' and es = 'Con Pablo vamos a medias en la nafta.' and en = 'Pablo and I split the gas.'
  and not (es_alt && array['Pablo y yo vamos a medias en la nafta.']::text[]);

update public.sentences set es_alt = es_alt || array['Martín le debe dos millones al banco.']::text[]
where id = '674d5912-a967-5d6b-9fcc-cf48b01e24ef' and es = 'Martín tiene una deuda de dos millones con el banco.' and en = 'Martín owes the bank two million.'
  and not (es_alt && array['Martín le debe dos millones al banco.']::text[]);

update public.sentences set es_alt = es_alt || array['La plata está en la caja de ahorro.']::text[]
where id = '47d0fb36-66f0-5bd4-bd1c-0d802b2ca20e' and es = 'Tengo la plata en la caja de ahorro.' and en = 'The money''s in my savings account.'
  and not (es_alt && array['La plata está en la caja de ahorro.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde leíste eso?']::text[]
where id = '13a51c8f-b8fd-5697-8c61-c8774236d6b4' and es = '¿Dónde lo leíste?' and en = 'Where did you read that?'
  and not (es_alt && array['¿Dónde leíste eso?']::text[]);

update public.sentences set es_alt = es_alt || array['Dicen que se separaron, pero no es verdad.']::text[], note_en = coalesce(note_en, '“Es mentira” is the everyday way to say something isn''t true. It doesn''t have to mean someone lied on purpose.')
where id = 'c6b767fa-2869-5e50-bd0e-bb35139e22f0' and es = 'Dicen que se separaron, pero es mentira.' and en = 'People say they broke up, but it''s not true.'
  and not (es_alt && array['Dicen que se separaron, pero no es verdad.']::text[]);

update public.sentences set es_alt = es_alt || array['No es verdad, no renuncié.']::text[], note_en = coalesce(note_en, '“Es mentira” is the everyday way to say something isn''t true. It doesn''t have to mean someone lied on purpose.')
where id = '1e107b64-c480-5e88-81fd-77579ec2ae5c' and es = 'Es mentira, no renuncié.' and en = 'That''s not true, I didn''t quit.'
  and not (es_alt && array['No es verdad, no renuncié.']::text[]);

update public.sentences set es_alt = es_alt || array['Lo de la multa no es verdad.']::text[], note_en = coalesce(note_en, '“Es mentira” is the everyday way to say something isn''t true. It doesn''t have to mean someone lied on purpose.')
where id = 'ad75ad2e-7262-5d5a-981f-b7048010b40f' and es = 'Lo de la multa es mentira.' and en = 'That thing about the ticket isn''t true.'
  and not (es_alt && array['Lo de la multa no es verdad.']::text[]);

update public.sentences set es_alt = es_alt || array['Lo del feriado no es verdad.']::text[], note_en = coalesce(note_en, '“Es mentira” is the everyday way to say something isn''t true. It doesn''t have to mean someone lied on purpose.')
where id = '64745b7a-d1ce-588a-8b11-0673faa7de79' and es = 'Lo del feriado es mentira.' and en = 'That thing about the holiday isn''t true.'
  and not (es_alt && array['Lo del feriado no es verdad.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde leyó eso tu vieja? No es verdad.', '¿Dónde leyó eso tu vieja? No es cierto.']::text[], note_en = coalesce(note_en, '“Es mentira” is the everyday way to say something isn''t true. It doesn''t have to mean someone lied on purpose.')
where id = '97d65a12-3ac8-5ca3-9823-ecaf35d8726b' and es = '¿Dónde leyó eso tu vieja? Es mentira.' and en = 'Where did your mom read that? It''s not true.'
  and not (es_alt && array['¿Dónde leyó eso tu vieja? No es verdad.', '¿Dónde leyó eso tu vieja? No es cierto.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuánto pagan?']::text[]
where id = 'b9dd8bcf-b71e-583d-9368-db81d1095d71' and es = '¿Cuánto es el sueldo?' and en = 'How much does it pay?'
  and not (es_alt && array['¿Cuánto pagan?']::text[]);

update public.sentences set es_alt = es_alt || array['Si pagás en efectivo, tenés un diez por ciento de descuento.']::text[]
where id = '8f03c350-ffc6-5b01-89e0-172dae12a9f4' and es = 'En efectivo tenés un diez por ciento de descuento.' and en = 'If you pay in cash, you get a ten percent discount.'
  and not (es_alt && array['Si pagás en efectivo, tenés un diez por ciento de descuento.']::text[]);

update public.sentences set es_alt = es_alt || array['Estaba mirando el celu y choqué.']::text[], note_en = coalesce(note_en, '“Iba mirando” shows you were doing it while on the move. “Estaba mirando” is just as correct.')
where id = '1c52191b-f5f4-5a2a-b2ff-4fbfb1cbf13c' and es = 'Iba mirando el celu y choqué.' and en = 'I was looking at my phone and crashed.'
  and not (es_alt && array['Estaba mirando el celu y choqué.']::text[]);

update public.sentences set es_alt = es_alt || array['Me dijeron que ese restaurante es carísimo.']::text[], note_en = coalesce(note_en, 'For “I heard…”, Argentines very often say “me contaron” or “me dijeron”: literally “they told me”.')
where id = '51e580d3-4bff-556f-8952-2e2a3279adeb' and es = 'Me contaron que ese restaurante es carísimo.' and en = 'I heard that restaurant is super expensive.'
  and not (es_alt && array['Me dijeron que ese restaurante es carísimo.']::text[]);

update public.sentences set es_alt = es_alt || array['Me llegó una multa por estacionar mal.']::text[]
where id = '2c0138c3-41b5-52e3-b6c8-00ce589c20cb' and es = 'Me hicieron una multa por estacionar mal.' and en = 'I got a ticket for parking illegally.'
  and not (es_alt && array['Me llegó una multa por estacionar mal.']::text[]);

update public.sentences set es_alt = es_alt || array['Me hicieron una multa.']::text[]
where id = '1e4f356c-0afc-58a1-a38a-7e80765e34b5' and es = 'Me llegó una multa.' and en = 'I got a ticket.'
  and not (es_alt && array['Me hicieron una multa.']::text[]);

update public.sentences set es_alt = es_alt || array['Alguien del laburo me lo contó.', 'Alguien en el laburo me lo contó.', 'Alguien del laburo me contó.']::text[], note_en = coalesce(note_en, 'Spanish often uses a plain “they” form (“me lo contaron”) where English says “someone told me”.')
where id = '0d65d348-b7be-53d0-ba54-8f4275736774' and es = 'Me lo contaron en el laburo.' and en = 'Someone at work told me.'
  and not (es_alt && array['Alguien del laburo me lo contó.', 'Alguien en el laburo me lo contó.', 'Alguien del laburo me contó.']::text[]);

update public.sentences set es_alt = es_alt || array['Nadie me contó nada, ¿qué pasó?', 'Nadie me dijo nada, ¿qué pasó?']::text[]
where id = 'bb1d615a-f68b-5727-abe6-690028763c6a' and es = 'No me contaron nada, ¿qué pasó?' and en = 'Nobody told me anything. What happened?'
  and not (es_alt && array['Nadie me contó nada, ¿qué pasó?', 'Nadie me dijo nada, ¿qué pasó?']::text[]);

update public.sentences set es_alt = es_alt || array['¡Cuánto crecieron tus hijos!', '¡Tus hijos crecieron tanto!']::text[]
where id = 'c7f7c061-a3c1-5b16-ae8b-2836a21d8725' and es = '¡Cómo crecieron tus hijos!' and en = 'Your kids have grown so much!'
  and not (es_alt && array['¡Cuánto crecieron tus hijos!', '¡Tus hijos crecieron tanto!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Mirá cómo creciste!', '¡Mirá cuánto creciste!']::text[]
where id = '501a585d-f7c2-54b3-b9c1-df2c591b6ab3' and es = '¡Cómo creciste!' and en = 'Look how much you''ve grown!'
  and not (es_alt && array['¡Mirá cómo creciste!', '¡Mirá cuánto creciste!']::text[]);

update public.sentences set es_alt = es_alt || array['¡Qué distinto estás!', '¡Qué cambiada estás!']::text[]
where id = '6ae06503-d11a-5413-9229-29179b56d13b' and es = '¡Qué cambiado estás!' and en = 'You look so different!'
  and not (es_alt && array['¡Qué distinto estás!', '¡Qué cambiada estás!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Estoy distinta o estoy igual?', '¿Estoy distinto o estoy igual?', '¿Estoy distinta o igual?', '¿Estoy distinto o igual?']::text[]
where id = 'c9aeb495-921c-5679-8b01-debcb486cc5f' and es = '¿Estoy cambiada o estoy igual?' and en = 'Do I look different or the same?'
  and not (es_alt && array['¿Estoy distinta o estoy igual?', '¿Estoy distinto o estoy igual?', '¿Estoy distinta o igual?', '¿Estoy distinto o igual?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te parece que estoy distinto desde que soy papá?']::text[]
where id = '0e40826d-7983-5f2d-83ad-dd951f143085' and es = '¿Te parece que estoy cambiado desde que soy papá?' and en = 'Do you think I''m different since I became a dad?'
  and not (es_alt && array['¿Te parece que estoy distinto desde que soy papá?']::text[]);

update public.sentences set es_alt = es_alt || array['El barrio está muy distinto.']::text[]
where id = '589ea523-2a68-56cb-a824-330e50afe63f' and es = 'El barrio está muy cambiado.' and en = 'The neighborhood is very different.'
  and not (es_alt && array['El barrio está muy distinto.']::text[]);

update public.sentences set es_alt = es_alt || array['La ciudad cambió mucho, ¿no?', 'La ciudad cambió un montón, ¿no?']::text[]
where id = '5f71ddc9-4672-5566-93d3-4f09a7b671e0' and es = 'La ciudad está muy cambiada, ¿no?' and en = 'The city has really changed, hasn''t it?'
  and not (es_alt && array['La ciudad cambió mucho, ¿no?', 'La ciudad cambió un montón, ¿no?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi vieja cambió, ahora sale un montón.']::text[]
where id = 'ff62397d-1950-5637-8a51-e2248a8c73a8' and es = 'Mi vieja está cambiada, ahora sale un montón.' and en = 'My mom has changed, now she goes out a lot.'
  and not (es_alt && array['Mi vieja cambió, ahora sale un montón.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi viejo está distinto desde que se jubiló.']::text[]
where id = '7f55b709-0759-5ae2-97e1-6ea0d266dcde' and es = 'Mi viejo está cambiado desde que se jubiló.' and en = 'My dad is different since he retired.'
  and not (es_alt && array['Mi viejo está distinto desde que se jubiló.']::text[]);

update public.sentences set es_alt = es_alt || array['La estación ahora está moderna, pero el tren sigue igual.', 'Ahora la estación está moderna, pero el tren sigue igual.']::text[]
where id = 'c05b531e-4e7b-5002-89af-383e54c070f8' and es = 'La estación está moderna, pero el tren sigue igual.' and en = 'The station looks modern now, but the train is the same as ever.'
  and not (es_alt && array['La estación ahora está moderna, pero el tren sigue igual.', 'Ahora la estación está moderna, pero el tren sigue igual.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuelo es re moderno, hasta tiene celu.', 'Mi abuelo es re moderno, tiene hasta celu.']::text[], note_en = coalesce(note_en, 'Tacking “y todo” onto the end is a common spoken way to say “even”: “tiene celu y todo”.')
where id = '875d8f56-ea4b-5789-b1b5-7db8a0e23c87' and es = 'Mi abuelo es re moderno, tiene celu y todo.' and en = 'My grandpa is super modern, he even has a cell phone.'
  and not (es_alt && array['Mi abuelo es re moderno, hasta tiene celu.', 'Mi abuelo es re moderno, tiene hasta celu.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuelo me dijo lo mismo: la ciudad cambió mucho.', 'Mi abuelo me dijo lo mismo: la ciudad cambió un montón.', 'Mi abuelo me dijo lo mismo: la ciudad está muy cambiada.']::text[]
where id = '10a8aec5-703f-56a6-8f95-88a79f8b156b' and es = 'Mi abuelo me dijo lo mismo: la ciudad está cambiada.' and en = 'My grandfather told me the same thing: the city has changed a lot.'
  and not (es_alt && array['Mi abuelo me dijo lo mismo: la ciudad cambió mucho.', 'Mi abuelo me dijo lo mismo: la ciudad cambió un montón.', 'Mi abuelo me dijo lo mismo: la ciudad está muy cambiada.']::text[]);

update public.sentences set es_alt = es_alt || array['Con esta inflación, no puedo ahorrar nada.']::text[]
where id = 'fe97cdcb-0247-5940-9b84-b22dfcf20da3' and es = 'Con esta inflación, no ahorro nada.' and en = 'With this inflation, I can''t save anything.'
  and not (es_alt && array['Con esta inflación, no puedo ahorrar nada.']::text[]);

update public.sentences set es_alt = es_alt || array['Me cobraron más por pagar con tarjeta.', 'Me cobraron más caro por pagar con tarjeta.']::text[]
where id = '50ff21fe-3889-5375-a66b-995a9de31d1e' and es = 'Con tarjeta me cobraron más caro.' and en = 'They charged me more for paying by card.'
  and not (es_alt && array['Me cobraron más por pagar con tarjeta.', 'Me cobraron más caro por pagar con tarjeta.']::text[]);

update public.sentences set es_alt = es_alt || array['El precio del pasaje a Bariloche subió mucho.']::text[], note_en = coalesce(note_en, 'In everyday speech people usually just say the thing itself went up (“subió el pasaje”), without mentioning “el precio”.')
where id = 'c5e34abd-4960-5afe-873f-20967363c586' and es = 'El pasaje a Bariloche subió mucho.' and en = 'The price of the ticket to Bariloche went up a lot.'
  and not (es_alt && array['El precio del pasaje a Bariloche subió mucho.']::text[]);

update public.sentences set es_alt = es_alt || array['Los precios de los pasajes están por las nubes este verano.']::text[]
where id = 'b122ed84-71df-596e-b291-d59ff3a5d44b' and es = 'Los pasajes están por las nubes este verano.' and en = 'Ticket prices are sky-high this summer.'
  and not (es_alt && array['Los precios de los pasajes están por las nubes este verano.']::text[]);

update public.sentences set es_alt = es_alt || array['Los precios de los pasajes suben en verano.']::text[]
where id = 'e27df283-13a9-5933-bace-2218037b232d' and es = 'Los pasajes suben en verano.' and en = 'Ticket prices go up in summer.'
  and not (es_alt && array['Los precios de los pasajes suben en verano.']::text[]);

update public.sentences set es_alt = es_alt || array['Los precios suben y mi sueldo no.']::text[]
where id = '85a84fe2-48bd-56d6-90a1-3a6013352959' and es = 'Los precios suben y el sueldo no.' and en = 'Prices go up and my salary doesn''t.'
  and not (es_alt && array['Los precios suben y mi sueldo no.']::text[]);

update public.sentences set es_alt = es_alt || array['Me cobraron un ojo de la cara.']::text[]
where id = '2ecd701e-4e90-56e0-979e-88112d38114e' and es = 'Me cobraron carísimo.' and en = 'They charged me a fortune.'
  and not (es_alt && array['Me cobraron un ojo de la cara.']::text[]);

update public.sentences set es_alt = es_alt || array['Necesito un aumento.']::text[]
where id = '7c19d9a9-3d78-56db-aa01-8c8b377e6148' and es = 'Necesito un aumento de sueldo.' and en = 'I need a raise.'
  and not (es_alt && array['Necesito un aumento.']::text[]);

update public.sentences set es_alt = es_alt || array['Todo aumenta, menos mi sueldo.']::text[]
where id = 'd4c0fc46-0439-50e9-b890-f66e51935800' and es = 'Todo aumenta, menos el sueldo.' and en = 'Everything goes up except my salary.'
  and not (es_alt && array['Todo aumenta, menos mi sueldo.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuánto te vino el gas?', '¿Cuánto te vino la factura del gas?', '¿Cuánto te vino la cuenta del gas?']::text[]
where id = '85ec31ff-29e2-5837-a1fd-58f9fdb1782a' and es = '¿Cuánto te vino de gas?' and en = 'How much was your gas bill?'
  and not (es_alt && array['¿Cuánto te vino el gas?', '¿Cuánto te vino la factura del gas?', '¿Cuánto te vino la cuenta del gas?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me prestás plata para el boleto?']::text[], note_en = coalesce(note_en, 'Argentines often leave “plata” out: “¿me prestás para…?” already means lending money.')
where id = '608d173f-5aec-5b70-b89c-8917b86ba1bb' and es = '¿Me prestás para el boleto?' and en = 'Can you lend me money for the fare?'
  and not (es_alt && array['¿Me prestás plata para el boleto?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Pagaste la cuenta del gas?', '¿Pagaste la factura del gas?']::text[]
where id = 'e66fd07d-c412-5475-873a-e945ce86a437' and es = '¿Pagaste el gas?' and en = 'Did you pay the gas bill?'
  and not (es_alt && array['¿Pagaste la cuenta del gas?', '¿Pagaste la factura del gas?']::text[]);

update public.sentences set es_alt = es_alt || array['Por suerte, Cami consiguió un aumento.']::text[]
where id = '6213083f-d7d3-5e21-8c74-eba6fbd45c8c' and es = 'A Cami le aumentaron el sueldo, por suerte.' and en = 'Luckily, Cami got a raise.'
  and not (es_alt && array['Por suerte, Cami consiguió un aumento.']::text[]);

update public.sentences set es_alt = es_alt || array['Cerrá la ventana, el gas está carísimo.']::text[], note_en = coalesce(note_en, 'After an order, Spanish speakers often add a little “que” to give the reason. It works like a quick “because”.')
where id = 'b33104d6-2612-5f4c-b3be-3235b90c84a0' and es = 'Cerrá la ventana, que el gas está carísimo.' and en = 'Close the window, gas is super expensive.'
  and not (es_alt && array['Cerrá la ventana, el gas está carísimo.']::text[]);

update public.sentences set es_alt = es_alt || array['Con estas tarifas, ¿quién puede llegar a fin de mes?']::text[]
where id = '51001851-333a-5064-8e0c-ac273986ba22' and es = 'Con estas tarifas, ¿quién llega a fin de mes?' and en = 'With these rates, who can make ends meet?'
  and not (es_alt && array['Con estas tarifas, ¿quién puede llegar a fin de mes?']::text[]);

update public.sentences set es_alt = es_alt || array['Las tarifas aumentaron y ahora no me alcanza.']::text[]
where id = '5c8fa33b-9b05-5432-8460-f8b2ff0edd36' and es = 'Las tarifas aumentaron y ya no me alcanza.' and en = 'The rates went up and now I don''t have enough.'
  and not (es_alt && array['Las tarifas aumentaron y ahora no me alcanza.']::text[]);

update public.sentences set es_alt = es_alt || array['Los precios de las verduras bajaron un poco.']::text[]
where id = 'a8ba0167-2bcb-50cc-9200-c96f5d7186ab' and es = 'Las verduras bajaron un poco.' and en = 'Vegetable prices went down a little.'
  and not (es_alt && array['Los precios de las verduras bajaron un poco.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te alcanzó la plata para pagar la cuenta del gas?', '¿Te alcanzó la plata para pagar la factura del gas?']::text[]
where id = '3e0ac84e-9fc4-5b57-b49a-3c41cb7a02b6' and es = '¿Te alcanzó la plata para pagar el gas?' and en = 'Did you have enough money to pay the gas bill?'
  and not (es_alt && array['¿Te alcanzó la plata para pagar la cuenta del gas?', '¿Te alcanzó la plata para pagar la factura del gas?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Y quién paga los gastos del viaje?']::text[]
where id = '9b64396d-bef6-5585-b8c4-1e1df79fcdb4' and es = '¿Y los gastos del viaje quién los paga?' and en = 'And who''s paying for the trip expenses?'
  and not (es_alt && array['¿Y quién paga los gastos del viaje?']::text[]);

update public.sentences set es_alt = es_alt || array['Con todos estos gastos, no puedo ahorrar nada.']::text[]
where id = 'a4330e2e-fb25-5b25-9d85-311425cdf6ae' and es = 'Con todos estos gastos, no ahorro nada.' and en = 'With all these expenses, I can''t save anything.'
  and not (es_alt && array['Con todos estos gastos, no puedo ahorrar nada.']::text[]);

update public.sentences set es_alt = es_alt || array['Es difícil llegar a fin de mes.']::text[], note_en = coalesce(note_en, '“Cuesta” + verb is a very common way to say something is hard to do.')
where id = '12499437-f22b-5214-813a-4ffd0071b3bd' and es = 'Cuesta llegar a fin de mes.' and en = 'It''s hard to make ends meet.'
  and not (es_alt && array['Es difícil llegar a fin de mes.']::text[]);

update public.sentences set es_alt = es_alt || array['Este mes mi sueldo no me alcanzó para los servicios.', 'Este mes mi sueldo no alcanzó para los servicios.']::text[]
where id = '2645883b-83ad-5a62-a42e-75877444cc8c' and es = 'Este mes el sueldo no me alcanzó para los servicios.' and en = 'This month my salary wasn''t enough for the utilities.'
  and not (es_alt && array['Este mes mi sueldo no me alcanzó para los servicios.', 'Este mes mi sueldo no alcanzó para los servicios.']::text[]);

update public.sentences set es_alt = es_alt || array['La médica me dijo que no hace falta.']::text[]
where id = '8f89910d-cd7e-56ef-aa50-6721c36799e1' and es = 'La médica me contestó que no hace falta.' and en = 'The doctor told me there''s no need.'
  and not (es_alt && array['La médica me dijo que no hace falta.']::text[]);

update public.sentences set es_alt = es_alt || array['Le dije a Juli que no puedo ir al cine.']::text[]
where id = '6bb65fde-4e7d-547c-b9c9-6d07a9e7f3de' and es = 'Le contesté a Juli que no puedo ir al cine.' and en = 'I told Juli I can''t go to the movies.'
  and not (es_alt && array['Le dije a Juli que no puedo ir al cine.']::text[]);

update public.sentences set es_alt = es_alt || array['Le dije que estábamos hablando de vos.']::text[]
where id = 'ba2f2888-c2c0-545d-a491-55befdc9b24e' and es = 'Le contesté que estábamos hablando de vos.' and en = 'I told him we were talking about you.'
  and not (es_alt && array['Le dije que estábamos hablando de vos.']::text[]);

update public.sentences set es_alt = es_alt || array['Le dije que queríamos pagar con tarjeta.']::text[]
where id = '1181ba08-7e51-577a-a5bd-a6688b037198' and es = 'Le contesté que queríamos pagar con tarjeta.' and en = 'I told him we wanted to pay by card.'
  and not (es_alt && array['Le dije que queríamos pagar con tarjeta.']::text[]);

update public.sentences set es_alt = es_alt || array['Le pregunté si venía y dijo que no sabía.', 'Le pregunté si venía y me dijo que no sabía.']::text[]
where id = '3f180ddd-8ca3-5836-a520-945d6e931c0c' and es = 'Le pregunté si venía y contestó que no sabía.' and en = 'I asked him if he was coming and he said he didn''t know.'
  and not (es_alt && array['Le pregunté si venía y dijo que no sabía.', 'Le pregunté si venía y me dijo que no sabía.']::text[]);

update public.sentences set es_alt = es_alt || array['Me dijo que estaba ocupada.']::text[]
where id = 'e6081c0b-8c5f-5479-9ada-d7d9efc02a2d' and es = 'Me contestó que estaba ocupada.' and en = 'She told me she was busy.'
  and not (es_alt && array['Me dijo que estaba ocupada.']::text[]);

update public.sentences set es_alt = es_alt || array['Me dijo que no podía.']::text[]
where id = '715e47b5-5272-5732-aa21-8ed168597c77' and es = 'Me contestó que no podía.' and en = 'He told me he couldn''t.'
  and not (es_alt && array['Me dijo que no podía.']::text[]);

update public.sentences set es_alt = es_alt || array['Me dijo que venía más tarde.']::text[]
where id = '85fee7db-e66f-5ac1-9d26-94cd390f6e74' and es = 'Me contestó que venía más tarde.' and en = 'He told me he was coming later.'
  and not (es_alt && array['Me dijo que venía más tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi papá me iba a buscar a la escuela.']::text[]
where id = '433eb1eb-a486-5bc9-9bb1-9f54c580a652' and es = 'Mi papá me venía a buscar a la escuela.' and en = 'My dad used to pick me up from school.'
  and not (es_alt && array['Mi papá me iba a buscar a la escuela.']::text[]);

update public.sentences set es_alt = es_alt || array['Mica estaba conmigo en el subte.']::text[], note_en = coalesce(note_en, '“Venir” is used for travelling along with someone: “venía conmigo” is “she was riding with me”.')
where id = 'a1f98b27-8280-5f39-8069-e209c5584480' and es = 'Mica venía conmigo en el subte.' and en = 'Mica was with me on the subway.'
  and not (es_alt && array['Mica estaba conmigo en el subte.']::text[]);

update public.sentences set es_alt = es_alt || array['Nico dijo que tenía mucho laburo.']::text[]
where id = 'b80725e4-6f2c-59f7-b784-aa44e5a7be75' and es = 'Nico contestó que tenía mucho laburo.' and en = 'Nico said he had a lot of work.'
  and not (es_alt && array['Nico dijo que tenía mucho laburo.']::text[]);

update public.sentences set es_alt = es_alt || array['Sofi me dijo que venía con el novio.', 'Sofi me dijo que venía con su novio.', 'Sofi me contestó que venía con su novio.']::text[]
where id = '2a34ec23-6c28-565a-8f25-159af183994c' and es = 'Sofi me contestó que venía con el novio.' and en = 'Sofi told me she was coming with her boyfriend.'
  and not (es_alt && array['Sofi me dijo que venía con el novio.', 'Sofi me dijo que venía con su novio.', 'Sofi me contestó que venía con su novio.']::text[]);

update public.sentences set es_alt = es_alt || array['Belén me juró que no le dijo a nadie.', 'Belén me juró que no se lo contó a nadie.', 'Belén me juró que no se lo dijo a nadie.']::text[]
where id = '024b4da7-fdda-5e8a-96e5-31dd68a30d08' and es = 'Belén me juró que no le contó nada a nadie.' and en = 'Belén swore to me she didn''t tell anyone.'
  and not (es_alt && array['Belén me juró que no le dijo a nadie.', 'Belén me juró que no se lo contó a nadie.', 'Belén me juró que no se lo dijo a nadie.']::text[]);

update public.sentences set es_alt = es_alt || array['Hablé con la profe y me explicó todo.']::text[], note_en = coalesce(note_en, '“Charlar” is a friendly, everyday word for having a talk. “Hablar” works too.')
where id = 'a6c65637-771f-599d-9ae8-fbbbd61e8408' and es = 'Charlé con la profe y me explicó todo.' and en = 'I talked to the teacher and she explained everything.'
  and not (es_alt && array['Hablé con la profe y me explicó todo.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando Mati te invitó, ¿qué le dijiste?', '¿Qué le dijiste cuando Mati te invitó?']::text[]
where id = 'c0a25941-14c1-5356-bde8-11a96e50c2db' and es = 'Cuando Mati te invitó, ¿qué le contestaste?' and en = 'When Mati invited you, what did you say to him?'
  and not (es_alt && array['Cuando Mati te invitó, ¿qué le dijiste?', '¿Qué le dijiste cuando Mati te invitó?']::text[]);

update public.sentences set es_alt = es_alt || array['Nunca hablé con tu vecino.']::text[]
where id = '294be2e1-ae70-5b77-af39-3895c802343c' and es = 'Nunca charlé con tu vecino.' and en = 'I''ve never talked to your neighbor.'
  and not (es_alt && array['Nunca hablé con tu vecino.']::text[]);

update public.sentences set es_alt = es_alt || array['Ya hablé con el jefe.']::text[]
where id = '33065e5b-0ed8-50ed-a289-6d547e643cfc' and es = 'Ya charlé con el jefe.' and en = 'I already talked to the boss.'
  and not (es_alt && array['Ya hablé con el jefe.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Con quién estabas hablando en el tren?']::text[], note_en = coalesce(note_en, '“Venir” + -ando describes something you were doing on the way. “Estabas hablando” is just as correct.')
where id = '310275e4-9d49-5b67-a5b5-96b99ab7f5b3' and es = '¿Con quién venías hablando en el tren?' and en = 'Who were you talking to on the train?'
  and not (es_alt && array['¿Con quién estabas hablando en el tren?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué línea de subte te queda más cerca?']::text[], note_en = coalesce(note_en, 'In Buenos Aires people often just say “qué subte” to mean which line.')
where id = '45f8f8c9-424d-54e6-a56f-af8e436d261d' and es = '¿Qué subte te queda más cerca?' and en = 'Which subway line is closest to you?'
  and not (es_alt && array['¿Qué línea de subte te queda más cerca?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Sabés dónde están San Telmo y La Boca?']::text[], note_en = coalesce(note_en, 'Argentines often use “quedar” for where a place is located; “estar” is right too.')
where id = '03ccf2ce-0b57-5c2a-9ab4-64657c7caffa' and es = '¿Sabés dónde quedan San Telmo y La Boca?' and en = 'Do you know where San Telmo and La Boca are?'
  and not (es_alt && array['¿Sabés dónde están San Telmo y La Boca?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Sabés si esos bares están cerca del parque?']::text[], note_en = coalesce(note_en, 'Argentines often use “quedar” for where a place is located; “estar” is right too.')
where id = 'c6b5a1ed-e918-5508-b09e-78667bab84a6' and es = '¿Sabés si esos bares quedan cerca del parque?' and en = 'Do you know if those bars are near the park?'
  and not (es_alt && array['¿Sabés si esos bares están cerca del parque?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Creés que es inseguro andar en bici de noche?', '¿Pensás que es inseguro andar en bici de noche?']::text[], note_en = coalesce(note_en, '“¿Te parece…?” is the everyday way to ask for someone''s opinion.')
where id = '6cb0014a-d9ac-5833-9c5a-e704a38047bf' and es = '¿Te parece inseguro andar en bici de noche?' and en = 'Do you think it''s unsafe to ride a bike at night?'
  and not (es_alt && array['¿Creés que es inseguro andar en bici de noche?', '¿Pensás que es inseguro andar en bici de noche?']::text[]);

update public.sentences set es_alt = es_alt || array['El encargado explicó dónde va la basura.']::text[], note_en = coalesce(note_en, 'Spanish usually says who got the explanation: “nos explicó” is “explained to us”.')
where id = '538a420d-8841-5b49-b55f-4d71d6154e97' and es = 'El encargado nos explicó dónde va la basura.' and en = 'The building caretaker explained where the trash goes.'
  and not (es_alt && array['El encargado explicó dónde va la basura.']::text[]);

update public.sentences set es_alt = es_alt || array['Juli explicó por qué se pelearon.']::text[], note_en = coalesce(note_en, 'Spanish usually says who got the explanation: “me explicó” is “explained to me”.')
where id = 'f729250f-577e-5992-975e-b71211c7b009' and es = 'Juli me explicó por qué se pelearon.' and en = 'Juli explained why they had a fight.'
  and not (es_alt && array['Juli explicó por qué se pelearon.']::text[]);

update public.sentences set es_alt = es_alt || array['La médica explicó cómo tomar el remedio.']::text[], note_en = coalesce(note_en, 'Spanish usually says who got the explanation: “me explicó” is “explained to me”.')
where id = 'ba30442c-96c7-5450-b57e-acbabd6d2a77' and es = 'La médica me explicó cómo tomar el remedio.' and en = 'The doctor explained how to take the medicine.'
  and not (es_alt && array['La médica explicó cómo tomar el remedio.']::text[]);

update public.sentences set es_alt = es_alt || array['Las dos escuelas de mis hijos están en el centro.']::text[], note_en = coalesce(note_en, 'Argentines often use “quedar” for where a place is located; “estar” is right too.')
where id = '43f8aa07-bbea-5db7-8c09-de10d6eb658e' and es = 'Las dos escuelas de mis hijos quedan en el centro.' and en = 'My children''s two schools are downtown.'
  and not (es_alt && array['Las dos escuelas de mis hijos están en el centro.']::text[]);

update public.sentences set es_alt = es_alt || array['Explicó que su suegra es callada, no mala onda.']::text[], note_en = coalesce(note_en, 'Spanish usually says who got the explanation: “me explicó” is “explained to me”.')
where id = '2dfe31e6-3f21-5e53-afa7-fabf98b0b852' and es = 'Me explicó que su suegra es callada, no mala onda.' and en = 'He explained that his mother-in-law is quiet, not unfriendly.'
  and not (es_alt && array['Explicó que su suegra es callada, no mala onda.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿A qué hora? —Digamos a las ocho.']::text[], note_en = coalesce(note_en, '“Ponele” is the very Argentine way to say “let''s say”; “digamos” works too.')
where id = '95eed0b8-808a-5b1a-979e-8f56c1d593ee' and es = '—¿A qué hora? —Ponele a las ocho.' and en = '—What time? —Let''s say eight.'
  and not (es_alt && array['—¿A qué hora? —Digamos a las ocho.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cuántos invitados hay? —Digamos veinte.']::text[], note_en = coalesce(note_en, '“Ponele” is the very Argentine way to say “let''s say”; “digamos” works too.')
where id = 'c142708f-e7e4-5c75-86fc-e5d7fb34658b' and es = '—¿Cuántos invitados hay? —Ponele veinte.' and en = '—How many guests are there? —Say twenty.'
  and not (es_alt && array['—¿Cuántos invitados hay? —Digamos veinte.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Dónde está Pablo? —No sé.']::text[], note_en = coalesce(note_en, '“Qué sé yo” is a casual, shruggy “I don''t know”, a bit like “how should I know”.')
where id = 'a9a41b10-05c0-5a84-ba16-8b0ea9331b43' and es = '—¿Dónde está Pablo? —Qué sé yo.' and en = '—Where''s Pablo? —I don''t know.'
  and not (es_alt && array['—¿Dónde está Pablo? —No sé.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Nos juntamos el jueves? —No puedo, estoy re ocupado.', '—¿Nos juntamos el jueves? —No puedo, estoy re ocupada.']::text[], note_en = coalesce(note_en, '“Estar a full” is how Argentines say they are swamped.')
where id = 'c396a78c-fddc-5c90-84c6-00a17a8932a4' and es = '—¿Nos juntamos el jueves? —No puedo, estoy a full.' and en = '—Should we get together on Thursday? —I can''t, I''m really busy.'
  and not (es_alt && array['—¿Nos juntamos el jueves? —No puedo, estoy re ocupado.', '—¿Nos juntamos el jueves? —No puedo, estoy re ocupada.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Te acordás de Belén? —¡Claro, éramos vecinos!', '—¿Te acordás de Belén? —¡Obvio, éramos vecinos!', '—¿Te acordás de Belén? —¡Por supuesto, éramos vecinos!']::text[], note_en = coalesce(note_en, '“¡Más vale!” is an emphatic Argentine “of course!”.')
where id = 'cd1e9985-4a03-51af-af12-4d5869ae6614' and es = '—¿Te acordás de Belén? —¡Más vale, éramos vecinos!' and en = '—Do you remember Belén? —Of course, we were neighbors!'
  and not (es_alt && array['—¿Te acordás de Belén? —¡Claro, éramos vecinos!', '—¿Te acordás de Belén? —¡Obvio, éramos vecinos!', '—¿Te acordás de Belén? —¡Por supuesto, éramos vecinos!']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Venís al asado? —¡Claro!', '—¿Venís al asado? —¡Obvio!', '—¿Venís al asado? —¡Por supuesto!']::text[], note_en = coalesce(note_en, '“¡Más vale!” is an emphatic Argentine “of course!”.')
where id = '996ce954-bd97-5853-8a2e-4450f2238fbc' and es = '—¿Venís al asado? —¡Más vale!' and en = '—Are you coming to the asado? —Of course!'
  and not (es_alt && array['—¿Venís al asado? —¡Claro!', '—¿Venís al asado? —¡Obvio!', '—¿Venís al asado? —¡Por supuesto!']::text[]);

update public.sentences set es_alt = es_alt || array['El depto es medio chico, pero re lindo.', 'El depto es medio chico, pero es re lindo.']::text[], note_en = coalesce(note_en, 'Dropping in “digamos” softens what you just said, like “sort of”.')
where id = 'c63aad6b-db7c-50a4-a0a7-ebe8742a3ace' and es = 'El depto es chico, digamos, pero re lindo.' and en = 'The apartment''s sort of small, but it''s really nice.'
  and not (es_alt && array['El depto es medio chico, pero re lindo.', 'El depto es medio chico, pero es re lindo.']::text[]);

update public.sentences set es_alt = es_alt || array['Estuve re ocupado toda la semana, necesito dormir.', 'Estuve re ocupada toda la semana, necesito dormir.']::text[], note_en = coalesce(note_en, '“Estar a full” is how Argentines say they are swamped.')
where id = 'd653c672-0b05-5473-815a-b174cfd244d2' and es = 'Estuve a full toda la semana, necesito dormir.' and en = 'I was really busy all week, I need to sleep.'
  and not (es_alt && array['Estuve re ocupado toda la semana, necesito dormir.', 'Estuve re ocupada toda la semana, necesito dormir.']::text[]);

update public.sentences set es_alt = es_alt || array['Llego en veinte minutos más o menos.']::text[], note_en = coalesce(note_en, 'A “ponele” tacked on the end makes a number approximate, like “or so”.')
where id = '5538437f-ed11-51e3-b8a4-b58d9f87600d' and es = 'Llego en veinte minutos, ponele.' and en = 'I''ll be there in twenty minutes or so.'
  and not (es_alt && array['Llego en veinte minutos más o menos.']::text[]);

update public.sentences set es_alt = es_alt || array['Mati dijo que venía a las nueve, pero quién sabe.']::text[], note_en = coalesce(note_en, '“Qué sé yo” is a casual shrug in words: “who knows”, “how should I know”.')
where id = '4b1a1f19-ad5b-59df-9f90-da526fd43445' and es = 'Mati dijo que venía a las nueve, pero qué sé yo.' and en = 'Mati said he''d be here at nine, but who knows.'
  and not (es_alt && array['Mati dijo que venía a las nueve, pero quién sabe.']::text[]);

update public.sentences set es_alt = es_alt || array['Perdimos el partido, pero bueno, es fútbol.']::text[], note_en = coalesce(note_en, '“Bah” here shrugs something off, like “oh well”.')
where id = '208277b0-d582-50eb-972a-a62d89c8fe31' and es = 'Perdimos el partido, pero bah, es fútbol.' and en = 'We lost the game, but oh well, it''s soccer.'
  and not (es_alt && array['Perdimos el partido, pero bueno, es fútbol.']::text[]);

update public.sentences set es_alt = es_alt || array['No sé, capaz que viene más tarde.']::text[], note_en = coalesce(note_en, '“Qué sé yo” is a casual, shruggy “I don''t know”.')
where id = 'bcb4e383-e11f-5748-b2a2-0eb28f40a910' and es = 'Qué sé yo, capaz que viene más tarde.' and en = 'I don''t know, maybe she''ll come later.'
  and not (es_alt && array['No sé, capaz que viene más tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Si querés, podemos compartir una milanesa.', 'Podemos compartir una milanesa, si querés.']::text[], note_en = coalesce(note_en, 'Argentines often make an offer with the plain present, with no “poder”.')
where id = 'ee71552d-c334-554c-8516-649d4c381a0f' and es = 'Si querés, compartimos una milanesa.' and en = 'We can share a milanesa if you like.'
  and not (es_alt && array['Si querés, podemos compartir una milanesa.', 'Podemos compartir una milanesa, si querés.']::text[]);

update public.sentences set es_alt = es_alt || array['Si querés, después de clase te puedo llevar a tu casa.', 'Si querés, te puedo llevar a tu casa después de clase.']::text[], note_en = coalesce(note_en, 'Argentines often make an offer with the plain present, with no “poder”.')
where id = 'bf62b0d6-c9f5-5553-9ff0-5c07dd5c05b4' and es = 'Si querés, después de clase te llevo a tu casa.' and en = 'I can drive you home after class if you like.'
  and not (es_alt && array['Si querés, después de clase te puedo llevar a tu casa.', 'Si querés, te puedo llevar a tu casa después de clase.']::text[]);

update public.sentences set es_alt = es_alt || array['Si querés, mañana podemos juntarnos a tomar unos mates.', 'Si querés, mañana nos podemos juntar a tomar unos mates.']::text[], note_en = coalesce(note_en, 'Argentines often make an offer with the plain present, with no “poder”.')
where id = '529cde51-c6e2-53c5-a2de-a9ead31a8dc7' and es = 'Si querés, mañana nos juntamos a tomar unos mates.' and en = 'If you like, we can get together for some mate tomorrow.'
  and not (es_alt && array['Si querés, mañana podemos juntarnos a tomar unos mates.', 'Si querés, mañana nos podemos juntar a tomar unos mates.']::text[]);

update public.sentences set es_alt = es_alt || array['Si querés, puedo manejar.', 'Si querés, puedo manejar yo.', 'Puedo manejar, si querés.']::text[], note_en = coalesce(note_en, 'Argentines often make an offer with the plain present, with no “poder”.')
where id = '69a2b6ff-ccd1-5007-b4a5-ff508baff07b' and es = 'Si querés, manejo yo.' and en = 'I can drive if you like.'
  and not (es_alt && array['Si querés, puedo manejar.', 'Si querés, puedo manejar yo.', 'Puedo manejar, si querés.']::text[]);

update public.sentences set es_alt = es_alt || array['Si querés, te puedo pasar a buscar a las ocho.']::text[], note_en = coalesce(note_en, 'Argentines often make an offer with the plain present, with no “poder”.')
where id = 'f8d0a12d-347a-53dc-a606-08f74c602c37' and es = 'Si querés, te paso a buscar a las ocho.' and en = 'I can pick you up at eight if you like.'
  and not (es_alt && array['Si querés, te puedo pasar a buscar a las ocho.']::text[]);

update public.sentences set es_alt = es_alt || array['Somos cinco, bueno, seis con Diego.']::text[], note_en = coalesce(note_en, '“Bah” is how Argentines correct themselves mid-sentence.')
where id = '0e457230-ef59-5e10-b336-80b3d2a8c49a' and es = 'Somos cinco, bah, seis con Diego.' and en = 'There are five of us, well, six with Diego.'
  and not (es_alt && array['Somos cinco, bueno, seis con Diego.']::text[]);

update public.sentences set es_alt = es_alt || array['Son las ocho, bueno, casi.']::text[], note_en = coalesce(note_en, '“Bah” is how Argentines correct themselves mid-sentence.')
where id = 'c8562b51-e522-560d-8a36-f6fabc4eb201' and es = 'Son las ocho, bah, casi.' and en = 'It''s eight, well, almost.'
  and not (es_alt && array['Son las ocho, bueno, casi.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Viste mi celu? Lo perdí.']::text[], note_en = coalesce(note_en, 'Argentines often say “se me perdió”, as if the thing got lost on you by accident.')
where id = '37726907-23ea-5640-b259-e10c80ffef93' and es = '¿Viste mi celu? Se me perdió.' and en = 'Have you seen my phone? I lost it.'
  and not (es_alt && array['¿Viste mi celu? Lo perdí.']::text[]);

update public.sentences set es_alt = es_alt || array['Che, rompí un vaso.']::text[], note_en = coalesce(note_en, '“Se me rompió” presents it as an accident: the glass broke on you.')
where id = '47d8cd0f-56be-55bd-9df3-90a50d85e573' and es = 'Che, se me rompió un vaso.' and en = 'Hey, I broke a glass.'
  and not (es_alt && array['Che, rompí un vaso.']::text[]);

update public.sentences set es_alt = es_alt || array['Creo que lo perdí en el taxi.', 'Creo que la perdí en el taxi.']::text[], note_en = coalesce(note_en, 'Argentines often say “se me perdió”, as if the thing got lost on you by accident.')
where id = 'beb89f55-50d2-5ffd-9899-4e060ed4ca87' and es = 'Creo que se me perdió en el taxi.' and en = 'I think I lost it in the taxi.'
  and not (es_alt && array['Creo que lo perdí en el taxi.', 'Creo que la perdí en el taxi.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana es el cumple de Mica y me olvidé de comprar el regalo.']::text[], note_en = coalesce(note_en, '“Se me pasó” is a soft way to say you forgot: it slipped your mind.')
where id = '27476556-26dd-5810-8722-89aab4a88d6c' and es = 'Mañana es el cumple de Mica y se me pasó comprar el regalo.' and en = 'Tomorrow is Mica''s birthday and I forgot to buy the present.'
  and not (es_alt && array['Mañana es el cumple de Mica y me olvidé de comprar el regalo.']::text[]);

update public.sentences set es_alt = es_alt || array['No, me olvidé.']::text[], note_en = coalesce(note_en, '“Se me pasó” is a soft way to say you forgot: it slipped your mind.')
where id = '4530d7d1-c9bd-5961-9c1c-da4aee5d4d7b' and es = 'No, se me pasó.' and en = 'No, I forgot.'
  and not (es_alt && array['No, me olvidé.']::text[]);

update public.sentences set es_alt = es_alt || array['Me olvidé de cargar la SUBE.']::text[], note_en = coalesce(note_en, '“Se me pasó” is a soft way to say you forgot: it slipped your mind.')
where id = '34745776-58fc-589f-9665-3f2c93875afe' and es = 'Se me pasó cargar la SUBE.' and en = 'I forgot to put money on my SUBE.'
  and not (es_alt && array['Me olvidé de cargar la SUBE.']::text[]);

update public.sentences set es_alt = es_alt || array['Me olvidé de tomar el remedio.']::text[], note_en = coalesce(note_en, '“Se me pasó” is a soft way to say you forgot: it slipped your mind.')
where id = '4e78d1f8-db0f-50fe-aa0d-a18b7a54d539' and es = 'Se me pasó tomar el remedio.' and en = 'I forgot to take my medicine.'
  and not (es_alt && array['Me olvidé de tomar el remedio.']::text[]);

update public.sentences set es_alt = es_alt || array['Me olvidé de traer el cargador.']::text[], note_en = coalesce(note_en, '“Se me pasó” is a soft way to say you forgot: it slipped your mind.')
where id = '63dd02f6-1005-53c3-b8b8-b9debc9de672' and es = 'Se me pasó traer el cargador.' and en = 'I forgot to bring my charger.'
  and not (es_alt && array['Me olvidé de traer el cargador.']::text[]);

update public.sentences set es_alt = es_alt || array['Me olvidé de traer el paraguas y está lloviendo.']::text[], note_en = coalesce(note_en, '“Se me pasó” is a soft way to say you forgot: it slipped your mind.')
where id = 'b7af383a-9086-5ffc-b606-d1875c89f98b' and es = 'Se me pasó traer el paraguas y está lloviendo.' and en = 'I forgot to bring my umbrella and it''s raining.'
  and not (es_alt && array['Me olvidé de traer el paraguas y está lloviendo.']::text[]);

update public.sentences set es_alt = es_alt || array['Me olvidé de tu cumpleaños.']::text[], note_en = coalesce(note_en, '“Se me pasó” is a soft way to say you forgot: it slipped your mind.')
where id = 'b87bc3fb-c93e-5da4-a45b-aa21090f2c14' and es = 'Se me pasó tu cumpleaños.' and en = 'I forgot your birthday.'
  and not (es_alt && array['Me olvidé de tu cumpleaños.']::text[]);

update public.sentences set es_alt = es_alt || array['Perdí el regalo de Juli.']::text[], note_en = coalesce(note_en, 'Argentines often say “se me perdió”, as if the thing got lost on you by accident.')
where id = 'd9283f9d-c55c-57b7-86e9-be5ad687ce23' and es = 'Se me perdió el regalo de Juli.' and en = 'I lost Juli''s present.'
  and not (es_alt && array['Perdí el regalo de Juli.']::text[]);

update public.sentences set es_alt = es_alt || array['Perdí la campera.', 'Perdí mi campera.']::text[], note_en = coalesce(note_en, 'Argentines often say “se me perdió”, as if the thing got lost on you by accident.')
where id = '5d1e3893-c8f0-52cc-a43a-7d32bee29d92' and es = 'Se me perdió la campera.' and en = 'I lost my jacket.'
  and not (es_alt && array['Perdí la campera.', 'Perdí mi campera.']::text[]);

update public.sentences set es_alt = es_alt || array['Perdí la llave del auto.']::text[], note_en = coalesce(note_en, 'Argentines often say “se me perdió”, as if the thing got lost on you by accident.')
where id = '8cec01aa-1b83-5cd6-b121-7ec330767a35' and es = 'Se me perdió la llave del auto.' and en = 'I lost the car key.'
  and not (es_alt && array['Perdí la llave del auto.']::text[]);

update public.sentences set es_alt = es_alt || array['Perdí la SUBE en el subte.', 'Perdí mi SUBE en el subte.']::text[], note_en = coalesce(note_en, 'Argentines often say “se me perdió”, as if the thing got lost on you by accident.')
where id = 'f583cf54-f4ad-57d8-80bf-9358fab3b0b8' and es = 'Se me perdió la SUBE en el subte.' and en = 'I lost my SUBE on the subway.'
  and not (es_alt && array['Perdí la SUBE en el subte.', 'Perdí mi SUBE en el subte.']::text[]);

update public.sentences set es_alt = es_alt || array['Perdí la valija en el aeropuerto.', 'Perdí mi valija en el aeropuerto.']::text[], note_en = coalesce(note_en, 'Argentines often say “se me perdió”, as if the thing got lost on you by accident.')
where id = 'e4b24981-4c9d-5444-bba7-b47a241cd006' and es = 'Se me perdió la valija en el aeropuerto.' and en = 'I lost my suitcase at the airport.'
  and not (es_alt && array['Perdí la valija en el aeropuerto.', 'Perdí mi valija en el aeropuerto.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cómo te fue en la entrevista? —Fue un desastre.']::text[], note_en = coalesce(note_en, 'In a quick reply Argentines often skip the verb and just say “Un desastre”.')
where id = 'ab30c3aa-095f-514e-8261-0f8c418ab6ca' and es = '—¿Cómo te fue en la entrevista? —Un desastre.' and en = '—How did the interview go? —It was a disaster.'
  and not (es_alt && array['—¿Cómo te fue en la entrevista? —Fue un desastre.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me prestás plata? Me quedé sin efectivo.']::text[], note_en = coalesce(note_en, '“Se me acabó” and “me quedé sin” both mean you ran out of something.')
where id = 'ed2f4e8f-12b7-5465-aba4-ca1d332fc630' and es = '¿Me prestás plata? Se me acabó el efectivo.' and en = 'Can you lend me some money? I ran out of cash.'
  and not (es_alt && array['¿Me prestás plata? Me quedé sin efectivo.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Otra vez te olvidaste?', '¿Te olvidaste otra vez?']::text[], note_en = coalesce(note_en, '“Se te pasó” is a soft way to say someone forgot: it slipped their mind.')
where id = 'db7aecc4-642d-50f8-87ee-37dbf14ce446' and es = '¿Otra vez se te pasó?' and en = 'You forgot again?'
  and not (es_alt && array['¿Otra vez te olvidaste?', '¿Te olvidaste otra vez?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te olvidaste del cumple de Belén?']::text[], note_en = coalesce(note_en, '“Se te pasó” is a soft way to say someone forgot: it slipped their mind.')
where id = '27551a58-d1bf-524b-8a54-f48a8dbd26fa' and es = '¿Se te pasó el cumple de Belén?' and en = 'Did you forget Belén''s birthday?'
  and not (es_alt && array['¿Te olvidaste del cumple de Belén?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te olvidaste de que hoy cenamos en lo de Santi?', '¿Te olvidaste que hoy cenamos en lo de Santi?']::text[], note_en = coalesce(note_en, '“Se te pasó” is a soft way to say someone forgot: it slipped their mind.')
where id = '2af99cb5-4fc8-5471-92a1-48fa080d71b1' and es = '¿Se te pasó que hoy cenamos en lo de Santi?' and en = 'Did you forget we''re having dinner at Santi''s tonight?'
  and not (es_alt && array['¿Te olvidaste de que hoy cenamos en lo de Santi?', '¿Te olvidaste que hoy cenamos en lo de Santi?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, te olvidaste de pedir el vuelto.']::text[], note_en = coalesce(note_en, '“Se te pasó” is a soft way to say someone forgot: it slipped their mind.')
where id = '42a8d0b4-8b7a-5b94-aaf2-60c6551a88fc' and es = 'Che, se te pasó pedir el vuelto.' and en = 'Hey, you forgot to ask for your change.'
  and not (es_alt && array['Che, te olvidaste de pedir el vuelto.']::text[]);

update public.sentences set es_alt = es_alt || array['Me quedé sin tiempo en el examen.']::text[], note_en = coalesce(note_en, '“Se me acabó” and “me quedé sin” both mean you ran out of something.')
where id = '64885577-c0da-5abc-9692-41c4857f1f68' and es = 'Se me acabó el tiempo en el examen.' and en = 'I ran out of time on the exam.'
  and not (es_alt && array['Me quedé sin tiempo en el examen.']::text[]);

update public.sentences set es_alt = es_alt || array['Se me quemaron los huevos, así que comimos pan con queso.']::text[], note_en = coalesce(note_en, 'Spanish often links cause and result with a plain “y” where English says “so”.')
where id = '0e9e4cc6-db14-512a-8511-cf66442966ba' and es = 'Se me quemaron los huevos y comimos pan con queso.' and en = 'I burned the eggs, so we had bread and cheese.'
  and not (es_alt && array['Se me quemaron los huevos, así que comimos pan con queso.']::text[]);

update public.sentences set es_alt = es_alt || array['Se me quemó el asado, así que pedimos pizza.']::text[], note_en = coalesce(note_en, 'Spanish often links cause and result with a plain “y” where English says “so”.')
where id = 'fffd4ece-5610-58e8-81c4-d82e9e39b1c9' and es = 'Se me quemó el asado y pedimos pizza.' and en = 'I burned the asado, so we ordered pizza.'
  and not (es_alt && array['Se me quemó el asado, así que pedimos pizza.']::text[]);

update public.sentences set es_alt = es_alt || array['Nos quedamos sin carbón a mitad del asado.']::text[], note_en = coalesce(note_en, '“Se nos acabó” and “nos quedamos sin” both mean we ran out of something.')
where id = '20d9290c-03bf-5b70-a00a-b26aca0022f8' and es = 'Se nos acabó el carbón a mitad del asado.' and en = 'We ran out of charcoal halfway through the asado.'
  and not (es_alt && array['Nos quedamos sin carbón a mitad del asado.']::text[]);

update public.sentences set es_alt = es_alt || array['Nos quedamos sin tiempo, chicos.', 'Chicos, nos quedamos sin tiempo.']::text[], note_en = coalesce(note_en, '“Se nos acabó” and “nos quedamos sin” both mean we ran out of something.')
where id = '68d904e5-823b-53e9-b659-dddeb57ef6ac' and es = 'Se nos acabó el tiempo, chicos.' and en = 'We''re out of time, guys.'
  and not (es_alt && array['Nos quedamos sin tiempo, chicos.', 'Chicos, nos quedamos sin tiempo.']::text[]);

update public.sentences set es_alt = es_alt || array['Nos quedamos sin cerveza antes de las once.']::text[], note_en = coalesce(note_en, '“Se nos acabó” and “nos quedamos sin” both mean we ran out of something.')
where id = '93b037af-1a38-5b93-8b5e-7ef6ec3cc2f2' and es = 'Se nos acabó la cerveza antes de las once.' and en = 'We ran out of beer before eleven.'
  and not (es_alt && array['Nos quedamos sin cerveza antes de las once.']::text[]);

update public.sentences set es_alt = es_alt || array['Nos quedamos sin plata en Bariloche.']::text[], note_en = coalesce(note_en, '“Se nos acabó” and “nos quedamos sin” both mean we ran out of something.')
where id = 'd6a2e3e2-f3c1-5d68-b0ad-3c65b521e71c' and es = 'Se nos acabó la plata en Bariloche.' and en = 'We ran out of money in Bariloche.'
  and not (es_alt && array['Nos quedamos sin plata en Bariloche.']::text[]);

update public.sentences set es_alt = es_alt || array['Llevá una campera para que no tengas frío.']::text[], note_en = coalesce(note_en, 'Spanish often says “la campera” where English says “a jacket”, meaning your own one.')
where id = '86ffa294-eddc-5188-8449-1d009e5e89f4' and es = 'Llevá la campera para que no tengas frío.' and en = 'Take a jacket so you don''t get cold.'
  and not (es_alt && array['Llevá una campera para que no tengas frío.']::text[]);

update public.sentences set es_alt = es_alt || array['Lo hago para que no te preocupes.']::text[], note_en = coalesce(note_en, '“Para que estés tranquila” (so you can be at ease) is a warm, common way to say “so you don''t worry”.')
where id = 'bea3e6f2-7314-5b98-812f-80ad90931592' and es = 'Lo hago para que estés tranquila.' and en = 'I''m doing it so you don''t worry.'
  and not (es_alt && array['Lo hago para que no te preocupes.']::text[]);

update public.sentences set es_alt = es_alt || array['Mandame la ubicación para que sepa dónde está.']::text[], note_en = coalesce(note_en, 'Argentines often use “quedar” for where a place is located; “estar” is right too.')
where id = 'e8c2b3e9-719d-5954-adb2-9758373194ca' and es = 'Mandame la ubicación para que sepa dónde queda.' and en = 'Send me the location so I know where it is.'
  and not (es_alt && array['Mandame la ubicación para que sepa dónde está.']::text[]);

update public.sentences set es_alt = es_alt || array['Quiero terminar antes de que sea demasiado tarde.', 'Quiero terminar antes de que sea muy tarde.']::text[], note_en = coalesce(note_en, 'In Spanish “antes de que sea tarde” already carries the idea of “too late”.')
where id = '744c650c-a60c-5d92-874f-574b02f13673' and es = 'Quiero terminar antes de que sea tarde.' and en = 'I want to finish before it''s too late.'
  and not (es_alt && array['Quiero terminar antes de que sea demasiado tarde.', 'Quiero terminar antes de que sea muy tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Te mando la ubicación para que sepas dónde está.']::text[], note_en = coalesce(note_en, 'Argentines often use “quedar” for where a place is located; “estar” is right too.')
where id = 'becf050b-c7b9-56ea-8b35-49d1bfc73887' and es = 'Te mando la ubicación para que sepas dónde queda.' and en = 'I''ll send you the location so you know where it is.'
  and not (es_alt && array['Te mando la ubicación para que sepas dónde está.']::text[]);

update public.sentences set es_alt = es_alt || array['Acá está el contrato, para que lo leas antes de firmar.', 'Acá tenés el contrato, para que lo leas antes de firmar.']::text[], note_en = coalesce(note_en, 'Argentines say “tomá” when handing something over, like “here you go”.')
where id = 'fdc18b99-64f4-595f-9d92-1788d68be8fa' and es = 'Tomá el contrato, para que lo leas antes de firmar.' and en = 'Here''s the contract, so you can read it before signing.'
  and not (es_alt && array['Acá está el contrato, para que lo leas antes de firmar.', 'Acá tenés el contrato, para que lo leas antes de firmar.']::text[]);

update public.sentences set es_alt = es_alt || array['Antes de entrar, fijate dónde está el gato.', 'Fijate dónde está el gato antes de entrar.']::text[]
where id = '1a322c0b-810f-59f7-9baf-ba9cbc876178' and es = 'Antes de que entres, fijate dónde está el gato.' and en = 'Before you go in, check where the cat is.'
  and not (es_alt && array['Antes de entrar, fijate dónde está el gato.', 'Fijate dónde está el gato antes de entrar.']::text[]);

update public.sentences set es_alt = es_alt || array['Antes de regar, poné un trapo en el piso.', 'Poné un trapo en el piso antes de regar.']::text[]
where id = '56caf51c-c72f-5e26-b429-dace90c02dbb' and es = 'Antes de que riegues, poné un trapo en el piso.' and en = 'Before you water, put a rag on the floor.'
  and not (es_alt && array['Antes de regar, poné un trapo en el piso.', 'Poné un trapo en el piso antes de regar.']::text[]);

update public.sentences set es_alt = es_alt || array['Es mejor regar a la noche.']::text[]
where id = '141249e1-4132-582e-a67e-6ae3e12fc64c' and es = 'Es mejor que riegues a la noche.' and en = 'It''s better to water at night.'
  and not (es_alt && array['Es mejor regar a la noche.']::text[]);

update public.sentences set es_alt = es_alt || array['Viene el del gas, te aviso para que abras la puerta.', 'Viene el del gas, te aviso para que le abras.']::text[], note_en = coalesce(note_en, 'Argentines just say “abrir” for opening the door to someone; “la puerta” is understood.')
where id = '09831ce6-5ea2-52a9-b9c4-f556c5a0c2b6' and es = 'Viene el del gas, te aviso para que abras.' and en = 'The gas guy is coming; I''ll let you know so you can open the door.'
  and not (es_alt && array['Viene el del gas, te aviso para que abras la puerta.', 'Viene el del gas, te aviso para que le abras.']::text[]);

update public.sentences set es_alt = es_alt || array['¡No dejes que se escape el gato!', '¡No dejes que el gato se escape!']::text[], note_en = coalesce(note_en, '“¡Que no…!” plus subjunctive is a quick way to say “don''t let that happen!”.')
where id = '1a01359b-0190-5308-b2d9-40eb288e003a' and es = '¡Que no se escape el gato!' and en = 'Don''t let the cat get out!'
  and not (es_alt && array['¡No dejes que se escape el gato!', '¡No dejes que el gato se escape!']::text[]);

update public.sentences set es_alt = es_alt || array['Nunca viene si no la llamo.', 'Nunca viene a menos que la llame.']::text[]
where id = '60ab4c26-decf-543b-8551-95ac4ab27ff0' and es = 'Nunca viene sin que la llame.' and en = 'She never comes over unless I call her.'
  and not (es_alt && array['Nunca viene si no la llamo.', 'Nunca viene a menos que la llame.']::text[]);

update public.sentences set es_alt = es_alt || array['No dejes que te vea la vecina.', 'No dejes que la vecina te vea.']::text[], note_en = coalesce(note_en, '“Que no…” plus subjunctive is a quick way to say “don''t let that happen”.')
where id = 'c1523789-843b-54eb-8fa9-46c348e611ce' and es = 'Que no te vea la vecina.' and en = 'Don''t let the neighbor see you.'
  and not (es_alt && array['No dejes que te vea la vecina.', 'No dejes que la vecina te vea.']::text[]);

update public.sentences set es_alt = es_alt || array['Por favor, cerrá las persianas a la noche.', 'Cerrá las persianas a la noche, por favor.']::text[], note_en = coalesce(note_en, '“Te pido que…” is a polite, slightly firmer way to ask for something, like “please”.')
where id = 'f3b58417-d835-5e54-b651-c0f11597cd4f' and es = 'Te pido que cierres las persianas a la noche.' and en = 'Please close the blinds at night.'
  and not (es_alt && array['Por favor, cerrá las persianas a la noche.', 'Cerrá las persianas a la noche, por favor.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Habías escuchado esta banda antes?', '¿Habías escuchado antes esta banda?']::text[], note_en = coalesce(note_en, 'Here “ya” carries the idea of “before”; “antes” at the end works too.')
where id = 'e2476154-d02b-5c6e-af68-c9dfd6ecaa39' and es = '¿Ya habías escuchado esta banda?' and en = 'Had you heard this band before?'
  and not (es_alt && array['¿Habías escuchado esta banda antes?', '¿Habías escuchado antes esta banda?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Lo habías probado antes?']::text[], note_en = coalesce(note_en, 'Here “ya” carries the idea of “before”; “antes” at the end works too.')
where id = '763d425f-41ce-50cb-b025-8da41821cf20' and es = '¿Ya lo habías probado?' and en = 'Had you tried it before?'
  and not (es_alt && array['¿Lo habías probado antes?']::text[]);

update public.sentences set es_alt = es_alt || array['Nunca le había escrito a mi jefe antes.', 'Nunca antes le había escrito a mi jefe.']::text[], note_en = coalesce(note_en, 'Spanish doesn''t need “antes” here: “nunca había…” already says “never before”.')
where id = '7fe72f90-5b6d-5d72-acaa-9a8f868f45a2' and es = 'Nunca le había escrito a mi jefe.' and en = 'I''d never written to my boss before.'
  and not (es_alt && array['Nunca le había escrito a mi jefe antes.', 'Nunca antes le había escrito a mi jefe.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Esto está bien?', '¿Está bien esto?']::text[]
where id = 'cab49f29-83a8-596d-add6-61a2f700e701' and es = '¿Así está bien?' and en = 'Is this OK?'
  and not (es_alt && array['¿Esto está bien?', '¿Está bien esto?']::text[]);

update public.sentences set es_alt = es_alt || array['¿En serio nunca habías probado un choripán?']::text[]
where id = '1c07d338-7c03-580f-985e-28bc35d901e9' and es = '¿En serio nunca habías probado el choripán?' and en = 'Seriously, you''d never had a choripán?'
  and not (es_alt && array['¿En serio nunca habías probado un choripán?']::text[]);

update public.sentences set es_alt = es_alt || array['Ana tomaba el colectivo para ir a la facu.', 'Ana se tomaba el colectivo para ir a la facu.']::text[]
where id = '9058c9b5-91d8-5981-aef4-47972feeba60' and es = 'Ana iba a la facu en colectivo.' and en = 'Ana used to take the bus to college.'
  and not (es_alt && array['Ana tomaba el colectivo para ir a la facu.', 'Ana se tomaba el colectivo para ir a la facu.']::text[]);

update public.sentences set es_alt = es_alt || array['Con este calor, es mejor regar a la noche.', 'Es mejor regar a la noche con este calor.']::text[]
where id = '9c368965-97b9-55a5-9216-86582f4d8d9f' and es = 'Con este calor, es mejor que riegues a la noche.' and en = 'In this heat, it''s better to water at night.'
  and not (es_alt && array['Con este calor, es mejor regar a la noche.', 'Es mejor regar a la noche con este calor.']::text[]);

update public.sentences set es_alt = es_alt || array['La culpa es de Nico, llegó tarde.', 'Es culpa de Nico, llegó tarde.', 'Es culpa de Nico, que llegó tarde.']::text[]
where id = '1a52cc58-3632-556a-9d46-b3355af51702' and es = 'La culpa es de Nico, que llegó tarde.' and en = 'It''s Nico''s fault; he was late.'
  and not (es_alt && array['La culpa es de Nico, llegó tarde.', 'Es culpa de Nico, llegó tarde.', 'Es culpa de Nico, que llegó tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Llamame antes de entrar a la reunión.', 'Antes de entrar a la reunión, llamame.']::text[]
where id = '7441aae1-1c05-5570-a89d-7d60f7087bb4' and es = 'Llamame antes de que entres a la reunión.' and en = 'Call me before you go into the meeting.'
  and not (es_alt && array['Llamame antes de entrar a la reunión.', 'Antes de entrar a la reunión, llamame.']::text[]);

update public.sentences set es_alt = es_alt || array['Llegamos tarde por el subte.', 'Por el subte llegamos tarde.']::text[], note_en = coalesce(note_en, '“Por culpa de” is “because of” with the blame built in: you use it when something caused a bad result.')
where id = 'd0e7f20b-0c5f-5018-baf6-f8c8c8c89213' and es = 'Llegamos tarde por culpa del subte.' and en = 'We were late because of the subway.'
  and not (es_alt && array['Llegamos tarde por el subte.', 'Por el subte llegamos tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Dejé el paraguas en el colectivo.', 'Me dejé el paraguas en el colectivo.']::text[]
where id = '74c3360e-1bf1-5d75-8951-cb498826371f' and es = 'Me olvidé el paraguas en el colectivo.' and en = 'I left my umbrella on the bus.'
  and not (es_alt && array['Dejé el paraguas en el colectivo.', 'Me dejé el paraguas en el colectivo.']::text[]);

update public.sentences set es_alt = es_alt || array['Me olvidé la torta y me olvidé de comprar hielo.']::text[], note_en = coalesce(note_en, '“Se me pasó” is a very common way to say something slipped your mind.')
where id = '2c619877-5a61-58b8-8f59-1cbcd399b6ce' and es = 'Me olvidé la torta y se me pasó comprar hielo.' and en = 'I forgot the cake and I forgot to buy ice.'
  and not (es_alt && array['Me olvidé la torta y me olvidé de comprar hielo.']::text[]);

update public.sentences set es_alt = es_alt || array['No es culpa de nadie, tranqui.', 'Tranqui, no es culpa de nadie.']::text[]
where id = '306dda4d-0f1a-52a0-b88d-224fb9b4561d' and es = 'Nadie tiene la culpa, tranqui.' and en = 'It''s nobody''s fault, relax.'
  and not (es_alt && array['No es culpa de nadie, tranqui.', 'Tranqui, no es culpa de nadie.']::text[]);

update public.sentences set es_alt = es_alt || array['No me voy hasta que llegues.', 'Hasta que llegues no me voy.']::text[]
where id = '7e066980-716a-598a-b32b-64490ab207b7' and es = 'No me voy hasta que vengas.' and en = 'I''m not leaving until you get here.'
  and not (es_alt && array['No me voy hasta que llegues.', 'Hasta que llegues no me voy.']::text[]);

update public.sentences set es_alt = es_alt || array['No pasa un día sin que me llame mi mamá.', 'No pasa un día sin que mi mamá me llame.']::text[], note_en = coalesce(note_en, '“Mi vieja” is an affectionate, everyday way to say “my mom” in Argentina.')
where id = '1996cae4-a264-52e5-9bfe-756d4793ebeb' and es = 'No pasa un día sin que me llame mi vieja.' and en = 'Not a day goes by without my mom calling me.'
  and not (es_alt && array['No pasa un día sin que me llame mi mamá.', 'No pasa un día sin que mi mamá me llame.']::text[]);

update public.sentences set es_alt = es_alt || array['Nunca había visto a Sofi tan contenta.']::text[]
where id = '85ce46ee-ea8f-587a-9e46-7a4e49d3ef45' and es = 'Nunca había visto a Sofi así de contenta.' and en = 'I''d never seen Sofi this happy.'
  and not (es_alt && array['Nunca había visto a Sofi tan contenta.']::text[]);

update public.sentences set es_alt = es_alt || array['Espero que vengas al cumple.', 'Ojalá vengas a la fiesta.', 'Espero que vengas a la fiesta.']::text[], note_en = coalesce(note_en, '“Ojalá” is an everyday way to say “I hope”, and “cumple” is the birthday party itself.')
where id = '20fb7c22-79f4-593f-b775-e314eb33572d' and es = 'Ojalá vengas al cumple.' and en = 'I hope you come to the party.'
  and not (es_alt && array['Espero que vengas al cumple.', 'Ojalá vengas a la fiesta.', 'Espero que vengas a la fiesta.']::text[]);

update public.sentences set es_alt = es_alt || array['Perdimos el colectivo por vos.', 'Por vos perdimos el colectivo.']::text[], note_en = coalesce(note_en, '“Por tu culpa” is “because of you” with the blame built in.')
where id = 'f2510013-137f-5ccb-9e50-67dfdf5750b9' and es = 'Por tu culpa perdimos el colectivo.' and en = 'We missed the bus because of you.'
  and not (es_alt && array['Perdimos el colectivo por vos.', 'Por vos perdimos el colectivo.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde voy a comprar una pila a esta hora?']::text[]
where id = '33b71783-3cb9-59ce-b284-23e41e2da0ab' and es = '¿Dónde compro una pila a esta hora?' and en = 'Where am I going to buy a battery at this hour?'
  and not (es_alt && array['¿Dónde voy a comprar una pila a esta hora?']::text[]);

update public.sentences set es_alt = es_alt || array['Las pilas están bien, el problema es el control.', 'Las pilas están bien, el control es el problema.']::text[]
where id = 'b506926d-8b6e-5736-9a83-066cb589ce35' and es = 'Las pilas funcionan, el problema es el control.' and en = 'The batteries are fine, the problem is the remote.'
  and not (es_alt && array['Las pilas están bien, el problema es el control.', 'Las pilas están bien, el control es el problema.']::text[]);

update public.sentences set es_alt = es_alt || array['Las redes no funcionan desde esta mañana.', 'Desde esta mañana no funcionan las redes.']::text[]
where id = '1a1b9c5b-d05d-596b-b437-a62820b6acbf' and es = 'Las redes no funcionan desde la mañana.' and en = 'Social media''s been down since this morning.'
  and not (es_alt && array['Las redes no funcionan desde esta mañana.', 'Desde esta mañana no funcionan las redes.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi papá paga las expensas del departamento.']::text[], note_en = coalesce(note_en, '“Mi viejo” is an affectionate, everyday way to say “my dad” in Argentina.')
where id = 'b359d385-320b-5714-846a-31125680a568' and es = 'Mi viejo paga las expensas del departamento.' and en = 'My dad pays the building fees for the apartment.'
  and not (es_alt && array['Mi papá paga las expensas del departamento.']::text[]);

update public.sentences set es_alt = es_alt || array['La canilla de la cocina gotea, ¿podés llamar al plomero?', 'Gotea la canilla de la cocina, ¿podés llamar al plomero?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with just the present tense: “¿llamás al plomero?” already means “can you call?”.')
where id = '748cc4af-7307-5f68-b877-db0c099ffbb0' and es = 'La canilla de la cocina gotea, ¿llamás al plomero?' and en = 'The kitchen faucet is dripping, can you call the plumber?'
  and not (es_alt && array['La canilla de la cocina gotea, ¿podés llamar al plomero?', 'Gotea la canilla de la cocina, ¿podés llamar al plomero?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Mañana va a llover? —Puede ser.', '¿Va a llover mañana? —Puede ser.']::text[]
where id = 'cbebf694-578b-5cfd-896c-a8e03a466d19' and es = '¿Mañana llueve? —Puede ser.' and en = 'Is it going to rain tomorrow? —Maybe.'
  and not (es_alt && array['¿Mañana va a llover? —Puede ser.', '¿Va a llover mañana? —Puede ser.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Entendés lo que quiero decir? —En parte.', '¿Entendés lo que digo? —En parte.']::text[]
where id = 'da1682f6-0237-50ff-a199-7544118eb7f5' and es = '¿Me entendés? —En parte.' and en = 'Do you get what I mean? —Partly.'
  and not (es_alt && array['¿Entendés lo que quiero decir? —En parte.', '¿Entendés lo que digo? —En parte.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Y cuál es tu opinión?']::text[]
where id = '61fda233-04f6-5d30-8559-8ede778768eb' and es = '¿Y tu opinión?' and en = 'And what''s your opinion?'
  and not (es_alt && array['¿Y cuál es tu opinión?']::text[]);

update public.sentences set es_alt = es_alt || array['Mi papá siempre tiene una opinión.']::text[], note_en = coalesce(note_en, '“Mi viejo” is an affectionate, everyday way to say “my dad” in Argentina.')
where id = '1978754f-9ee8-5f13-8236-f073b1679183' and es = 'Mi viejo siempre tiene una opinión.' and en = 'My dad always has an opinion.'
  and not (es_alt && array['Mi papá siempre tiene una opinión.']::text[]);

update public.sentences set es_alt = es_alt || array['Para nada, no te preocupes.']::text[], note_en = coalesce(note_en, '“Tranqui” is the short, friendly way Argentines say “relax” or “don''t worry”.')
where id = 'c6970224-69e7-5f8a-ace4-66a88c225596' and es = 'Para nada, tranqui.' and en = 'Not at all, don''t worry.'
  and not (es_alt && array['Para nada, no te preocupes.']::text[]);

update public.sentences set es_alt = es_alt || array['No toques ese tema con mi papá.', 'Con mi papá no toques ese tema.']::text[], note_en = coalesce(note_en, '“Mi viejo” is an affectionate, everyday way to say “my dad” in Argentina.')
where id = 'e393c8dc-ea50-5b76-ae41-c12f287de56e' and es = 'No toques ese tema con mi viejo.' and en = 'Don''t bring up that subject with my dad.'
  and not (es_alt && array['No toques ese tema con mi papá.', 'Con mi papá no toques ese tema.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy totalmente de acuerdo.']::text[], note_en = coalesce(note_en, 'In conversation Argentines often drop the “estoy” and just say “Totalmente de acuerdo”.')
where id = '4d1d3f48-9aab-5969-bdaf-e93e7f7174f3' and es = 'Totalmente de acuerdo.' and en = 'I totally agree.'
  and not (es_alt && array['Estoy totalmente de acuerdo.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Carísimo? No exageres, creo que está bien.', '¿Carísimo? No exageres, me parece que está bien.']::text[], note_en = coalesce(note_en, '“Para mí” (literally “for me”) is a very common way to give your opinion.')
where id = '46ed15b9-192d-5b12-a1b9-9cf635d3ab71' and es = '¿Carísimo? No exageres, para mí está bien.' and en = 'Super expensive? Don''t exaggerate, I think it''s fine.'
  and not (es_alt && array['¿Carísimo? No exageres, creo que está bien.', '¿Carísimo? No exageres, me parece que está bien.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dije eso? Para nada, entendiste mal.']::text[], note_en = coalesce(note_en, '“Nada que ver” (literally “nothing to do with it”) is how Argentines say “not at all, that''s way off”.')
where id = '5f704258-1bf1-56cf-9b51-93f25720b6de' and es = '¿Dije eso? Nada que ver, entendiste mal.' and en = 'Did I say that? Not at all, you misunderstood.'
  and not (es_alt && array['¿Dije eso? Para nada, entendiste mal.']::text[]);

update public.sentences set es_alt = es_alt || array['Martín y yo tuvimos una discusión por el alquiler.']::text[], note_en = coalesce(note_en, 'Argentines often say “Con Martín tuvimos…” to mean “Martín and I had…”.')
where id = 'd13d1224-2752-5bf1-848d-7010fc8df567' and es = 'Con Martín tuvimos una discusión por el alquiler.' and en = 'Martín and I had an argument about the rent.'
  and not (es_alt && array['Martín y yo tuvimos una discusión por el alquiler.']::text[]);

update public.sentences set es_alt = es_alt || array['Para nada, estás equivocada.', 'Para nada, estás equivocado.']::text[], note_en = coalesce(note_en, '“Nada que ver” (literally “nothing to do with it”) is how Argentines say “not at all, that''s way off”.')
where id = '114e024c-b582-50b3-a043-a7b35644bfc6' and es = 'Nada que ver, estás equivocada.' and en = 'Not at all, you''re wrong.'
  and not (es_alt && array['Para nada, estás equivocada.', 'Para nada, estás equivocado.']::text[]);

update public.sentences set es_alt = es_alt || array['No, para nada.']::text[], note_en = coalesce(note_en, '“Nada que ver” (literally “nothing to do with it”) is how Argentines say “not at all, that''s way off”.')
where id = '02da170a-3ac6-5b08-a56a-e6b8fb51206c' and es = 'No, nada que ver.' and en = 'No, not at all.'
  and not (es_alt && array['No, para nada.']::text[]);

update public.sentences set es_alt = es_alt || array['Creo que la que está equivocada es tu mamá.', 'Me parece que la que está equivocada es tu mamá.']::text[], note_en = coalesce(note_en, '“Para mí” (literally “for me”) is a very common way to give your opinion.')
where id = '8b3f119a-2f9b-5491-aec5-20a1bd23c2fb' and es = 'Para mí, la que está equivocada es tu mamá.' and en = 'I think the one who''s wrong is your mom.'
  and not (es_alt && array['Creo que la que está equivocada es tu mamá.', 'Me parece que la que está equivocada es tu mamá.']::text[]);

update public.sentences set es_alt = es_alt || array['En mi opinión, mi jefe está equivocado en este tema.']::text[], note_en = coalesce(note_en, '“Para mí” (literally “for me”) is a very common way to give your opinion.')
where id = 'c1055bb1-c3bf-5a06-84c0-f52a3b0869a5' and es = 'Para mí, mi jefe está equivocado en este tema.' and en = 'In my opinion, my boss is wrong on this issue.'
  and not (es_alt && array['En mi opinión, mi jefe está equivocado en este tema.']::text[]);

update public.sentences set es_alt = es_alt || array['¿De qué equipo sos hincha?']::text[], note_en = coalesce(note_en, 'In Argentina you don''t just support a team, you “are” of it: “¿De qué equipo sos?”.')
where id = '8b3e1ae3-a763-560d-930e-8996204eadcf' and es = '¿De qué equipo sos?' and en = 'Which team do you support?'
  and not (es_alt && array['¿De qué equipo sos hincha?']::text[]);

update public.sentences set es_alt = es_alt || array['Pienso lo mismo que vos.']::text[]
where id = 'ed510459-c1dd-5c10-94ab-74eb2813d4c5' and es = 'Opino lo mismo que vos.' and en = 'I think the same as you.'
  and not (es_alt && array['Pienso lo mismo que vos.']::text[]);

update public.sentences set es_alt = es_alt || array['Creo que el árbitro estuvo mal.', 'Pienso que el árbitro estuvo mal.']::text[]
where id = '73e8c4e8-8b73-5847-8f82-4e8ba5974ed4' and es = 'Opino que el árbitro estuvo mal.' and en = 'I think the referee was bad.'
  and not (es_alt && array['Creo que el árbitro estuvo mal.', 'Pienso que el árbitro estuvo mal.']::text[]);

update public.sentences set es_alt = es_alt || array['Creo que el arquero fue el mejor.', 'Pienso que el arquero fue el mejor.']::text[]
where id = 'b899347f-7538-5601-8c7a-efb752b31b1c' and es = 'Opino que el arquero fue el mejor.' and en = 'I think the goalkeeper was the best.'
  and not (es_alt && array['Creo que el arquero fue el mejor.', 'Pienso que el arquero fue el mejor.']::text[]);

update public.sentences set es_alt = es_alt || array['Creo que exagerás, pero bueno.', 'Me parece que exagerás, pero bueno.', 'Pienso que exagerás, pero bueno.']::text[], note_en = coalesce(note_en, '“Para mí” at the start of a sentence is a very common Argentine way to say “I think”.')
where id = 'e76eb64b-160d-5690-8609-e43527cacd7d' and es = 'Para mí exagerás, pero bueno.' and en = 'I think you''re exaggerating, but whatever.'
  and not (es_alt && array['Creo que exagerás, pero bueno.', 'Me parece que exagerás, pero bueno.', 'Pienso que exagerás, pero bueno.']::text[]);

update public.sentences set es_alt = es_alt || array['Pienso lo mismo.']::text[]
where id = '97124d59-68de-55ec-aa12-5056b29bf640' and es = 'Yo opino lo mismo.' and en = 'I think the same thing.'
  and not (es_alt && array['Pienso lo mismo.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde puse mi tarjeta?']::text[], note_en = coalesce(note_en, 'When it''s obvious whose thing it is, Spanish usually says “la” where English says “my”.')
where id = '97a50477-9969-52db-a03d-0a793265cc0d' and es = '¿Dónde puse la tarjeta?' and en = 'Where did I put my card?'
  and not (es_alt && array['¿Dónde puse mi tarjeta?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Recibiste la transferencia?']::text[], note_en = coalesce(note_en, 'For money and messages, Argentines very often say “¿te llegó?” (did it reach you?) instead of “did you receive it?”.')
where id = '440970b5-7e0e-5c93-8437-cd837f6a23ea' and es = '¿Te llegó la transferencia?' and en = 'Did you get the transfer?'
  and not (es_alt && array['¿Recibiste la transferencia?']::text[]);

update public.sentences set es_alt = es_alt || array['Fijate tu saldo antes de comprar.', 'Antes de comprar, fijate tu saldo.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose thing it is, Spanish usually says “el” where English says “your”.')
where id = '34121411-2f5d-596e-b841-866b7e401072' and es = 'Fijate el saldo antes de comprar.' and en = 'Check your balance before you buy.'
  and not (es_alt && array['Fijate tu saldo antes de comprar.', 'Antes de comprar, fijate tu saldo.']::text[]);

update public.sentences set es_alt = es_alt || array['No hay comisión por la transferencia.']::text[]
where id = '3452ebeb-305e-5239-82c2-3ceeae193ec1' and es = 'La transferencia no tiene comisión.' and en = 'There''s no fee for the transfer.'
  and not (es_alt && array['No hay comisión por la transferencia.']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo saldo en mi SUBE.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose thing it is, Spanish usually says “la” where English says “my”.')
where id = '852630ad-9c07-57ca-9a21-329e6fbc3c20' and es = 'No tengo saldo en la SUBE.' and en = 'I have no credit on my SUBE.'
  and not (es_alt && array['No tengo saldo en mi SUBE.']::text[]);

update public.sentences set es_alt = es_alt || array['Saqué efectivo del cajero.']::text[], note_en = coalesce(note_en, '“Plata” is the everyday Argentine word for money, and “sacar plata” is how people say getting cash out.')
where id = '5cd24099-30e7-5721-8ee4-c1bae4cbd69b' and es = 'Saqué plata del cajero.' and en = 'I got cash from the ATM.'
  and not (es_alt && array['Saqué efectivo del cajero.']::text[]);

update public.sentences set es_alt = es_alt || array['Saqué efectivo para el taxi.']::text[], note_en = coalesce(note_en, '“Plata” is the everyday Argentine word for money, and “sacar plata” is how people say getting cash out.')
where id = 'eb214042-8a99-55c0-bbcb-bdc15da76403' and es = 'Saqué plata para el taxi.' and en = 'I got cash for the taxi.'
  and not (es_alt && array['Saqué efectivo para el taxi.']::text[]);

update public.sentences set es_alt = es_alt || array['Saqué efectivo, pero ya gasté casi todo.']::text[], note_en = coalesce(note_en, '“Plata” is the everyday Argentine word for money, and “sacar plata” is how people say getting cash out.')
where id = '444edbf0-626f-5d11-a7f9-6c383bc5a704' and es = 'Saqué plata, pero ya gasté casi todo.' and en = 'I took out cash, but I''ve already spent almost all of it.'
  and not (es_alt && array['Saqué efectivo, pero ya gasté casi todo.']::text[]);

update public.sentences set es_alt = es_alt || array['Se me venció la tarjeta, ¿podés pagar vos?', 'Se me venció la tarjeta, ¿podés pagar?']::text[], note_en = coalesce(note_en, 'Argentines often ask for things with a plain present-tense question; it already sounds polite, no “podés” needed.')
where id = 'b7bf23a2-1e27-58f8-9bac-0d5b05353818' and es = 'Se me venció la tarjeta, ¿pagás vos?' and en = 'My card expired, can you pay?'
  and not (es_alt && array['Se me venció la tarjeta, ¿podés pagar vos?', 'Se me venció la tarjeta, ¿podés pagar?']::text[]);

update public.sentences set es_alt = es_alt || array['Transferime por Mercado Pago, es más rápido.']::text[], note_en = coalesce(note_en, 'After a request, Argentines often add a little “que” to give the reason. It works like a soft “because”.')
where id = '58e91546-47b7-57e1-9ff7-afb0ece02608' and es = 'Transferime por Mercado Pago, que es más rápido.' and en = 'Transfer it to me through Mercado Pago, it''s faster.'
  and not (es_alt && array['Transferime por Mercado Pago, es más rápido.']::text[]);

update public.sentences set es_alt = es_alt || array['Vi mi saldo y me asusté.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose thing it is, Spanish usually says “el” where English says “my”.')
where id = '7af331c7-a20e-52cf-a5f5-84f30207804a' and es = 'Vi el saldo y me asusté.' and en = 'I saw my balance and got scared.'
  and not (es_alt && array['Vi mi saldo y me asusté.']::text[]);

update public.sentences set es_alt = es_alt || array['Voy al cajero a sacar efectivo.']::text[], note_en = coalesce(note_en, '“Plata” is the everyday Argentine word for money, and “sacar plata” is how people say getting cash out.')
where id = '91d98539-b98a-5c67-b6cb-d2f871632ced' and es = 'Voy al cajero a sacar plata.' and en = 'I''m going to the ATM to get cash.'
  and not (es_alt && array['Voy al cajero a sacar efectivo.']::text[]);

update public.sentences set es_alt = es_alt || array['Con ese ruido me asusté.', 'Me asusté con ese ruido.']::text[], note_en = coalesce(note_en, '“Pegarse un susto” is a very common, colloquial Argentine way to say you got a fright.')
where id = '1800f14d-36b5-5cb5-ab1c-f02b6e63a22e' and es = 'Con ese ruido me pegué un susto.' and en = 'I got scared with that noise.'
  and not (es_alt && array['Con ese ruido me asusté.', 'Me asusté con ese ruido.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando vi al perro en la puerta, me asusté.', 'Me asusté cuando vi al perro en la puerta.']::text[]
where id = 'c4c1e714-ea3f-597b-afad-9dbde09de3a7' and es = 'Cuando vi al perro en la puerta, me dio miedo.' and en = 'When I saw the dog at the door, I got scared.'
  and not (es_alt && array['Cuando vi al perro en la puerta, me asusté.', 'Me asusté cuando vi al perro en la puerta.']::text[]);

update public.sentences set es_alt = es_alt || array['Escuché un ruido, pero era solo Santi con las llaves.', 'Escuché un ruido, pero era Santi con sus llaves.', 'Escuché un ruido, pero era solo Santi con sus llaves.']::text[]
where id = '0018b194-7659-5d13-9171-9b49cec8cd3f' and es = 'Escuché un ruido, pero era Santi con las llaves.' and en = 'I heard a noise, but it was just Santi with his keys.'
  and not (es_alt && array['Escuché un ruido, pero era solo Santi con las llaves.', 'Escuché un ruido, pero era Santi con sus llaves.', 'Escuché un ruido, pero era solo Santi con sus llaves.']::text[]);

update public.sentences set es_alt = es_alt || array['Me dio tanto miedo que corrí a mi pieza.', 'Me asusté tanto que corrí a la pieza.', 'Me asusté tanto que corrí a mi pieza.']::text[]
where id = 'ad1b2cad-4fe6-585f-ab35-0cac4106b1fa' and es = 'Me dio tanto miedo que corrí a la pieza.' and en = 'I got so scared that I ran to my room.'
  and not (es_alt && array['Me dio tanto miedo que corrí a mi pieza.', 'Me asusté tanto que corrí a la pieza.', 'Me asusté tanto que corrí a mi pieza.']::text[]);

update public.sentences set es_alt = es_alt || array['Me asusté cuando sonó el timbre.', 'Cuando sonó el timbre me asusté.']::text[], note_en = coalesce(note_en, '“Pegarse un susto” is a very common, colloquial Argentine way to say you got a fright.')
where id = 'b7f14820-aea2-5930-a20d-21991c0c55c9' and es = 'Me pegué un susto cuando sonó el timbre.' and en = 'I got scared when the doorbell rang.'
  and not (es_alt && array['Me asusté cuando sonó el timbre.', 'Cuando sonó el timbre me asusté.']::text[]);

update public.sentences set es_alt = es_alt || array['Se cortó la luz y me asusté.']::text[]
where id = '334a8eff-6d81-56b3-aa02-82683811bc3f' and es = 'Se cortó la luz y me dio miedo.' and en = 'The power went out and I got scared.'
  and not (es_alt && array['Se cortó la luz y me asusté.']::text[]);

update public.sentences set es_alt = es_alt || array['Uy, me asusté.']::text[], note_en = coalesce(note_en, '“Pegarse un susto” is a very common, colloquial Argentine way to say you got a fright.')
where id = '23377d98-2eab-5cdf-ae57-fd554b083c96' and es = 'Uy, me pegué un susto.' and en = 'Whoa, I got scared.'
  and not (es_alt && array['Uy, me asusté.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Qué pasó? —Solo una cucaracha.']::text[], note_en = coalesce(note_en, 'Tacking “nada más” on the end is a very natural way to say “just” or “that''s all”.')
where id = '6ce9c2fc-ca96-5316-a16a-8d1ad0f0f6ca' and es = '—¿Qué pasó? —Una cucaracha, nada más.' and en = '—What happened? —Just a cockroach.'
  and not (es_alt && array['—¿Qué pasó? —Solo una cucaracha.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Querés bailar? —No, me da vergüenza.']::text[], note_en = coalesce(note_en, 'Argentines often invite with “¿Vamos a…?” (shall we…?) instead of asking “do you want to…?”.')
where id = '4bc59d8f-5d8d-59fd-b3d1-7931314da4b7' and es = '—¿Vamos a bailar? —No, me da vergüenza.' and en = '—Want to dance? —No, I''m too embarrassed.'
  and not (es_alt && array['—¿Querés bailar? —No, me da vergüenza.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Te asustaste? —Sí, salté de mi silla.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose thing it is, Spanish usually says “la” where English says “my”.')
where id = '68eff3bd-4a57-5904-9db8-b8fe82256350' and es = '—¿Te asustaste? —Sí, salté de la silla.' and en = '—Did you get scared? —Yeah, I jumped out of my chair.'
  and not (es_alt && array['—¿Te asustaste? —Sí, salté de mi silla.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Cuidado, se te vuela la gorra!']::text[], note_en = coalesce(note_en, 'After a warning like “¡Cuidado!”, Argentines often add a little “que” before the reason. It works like a soft “because”.')
where id = '75ecaa1b-ee26-5f5f-acda-29f60d1f2749' and es = '¡Cuidado, que se te vuela la gorra!' and en = 'Careful, your cap is going to blow away!'
  and not (es_alt && array['¡Cuidado, se te vuela la gorra!']::text[]);

update public.sentences set es_alt = es_alt || array['Con la ojota no, me da asco.']::text[], note_en = coalesce(note_en, 'That little “que” introduces the reason, like a soft “because”. It''s very common in everyday speech.')
where id = '4e07eb51-5219-5910-8464-2e940e522dde' and es = 'Con la ojota no, que me da asco.' and en = 'Not with the flip-flop, it grosses me out.'
  and not (es_alt && array['Con la ojota no, me da asco.']::text[]);

update public.sentences set es_alt = es_alt || array['La maté con mi ojota.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose thing it is, Spanish usually says “la” where English says “my”.')
where id = '812a435a-5eff-5a17-8424-c7e133ca5a8d' and es = 'La maté con la ojota.' and en = 'I killed it with my flip-flop.'
  and not (es_alt && array['La maté con mi ojota.']::text[]);

update public.sentences set es_alt = es_alt || array['Salté de mi silla y a todos les dio risa.']::text[]
where id = '3ea0dddb-b05b-56ef-8980-d72aede41dfd' and es = 'Salté de la silla y a todos les dio risa.' and en = 'I jumped out of my chair and everyone laughed.'
  and not (es_alt && array['Salté de mi silla y a todos les dio risa.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo mis ojotas cerca por las dudas.', 'Por las dudas tengo mis ojotas cerca.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose thing it is, Spanish usually says “las” where English says “my”.')
where id = '6d9170ec-587c-56cd-8a4e-7ab8a799f8fb' and es = 'Tengo las ojotas cerca por las dudas.' and en = 'I keep my flip-flops close just in case.'
  and not (es_alt && array['Tengo mis ojotas cerca por las dudas.', 'Por las dudas tengo mis ojotas cerca.']::text[]);

update public.sentences set es_alt = es_alt || array['En Buenos Aires es normal salir a las dos de la mañana.', 'Salir a las dos de la mañana es normal en Buenos Aires.']::text[]
where id = '4b105a46-1962-5635-bb84-fb4356623608' and es = 'En Buenos Aires es normal salir a las dos.' and en = 'In Buenos Aires it''s normal to go out at two in the morning.'
  and not (es_alt && array['En Buenos Aires es normal salir a las dos de la mañana.', 'Salir a las dos de la mañana es normal en Buenos Aires.']::text[]);

update public.sentences set es_alt = es_alt || array['Fui al asado sin llevar nada, ¿soy maleducada?', 'Fui al asado sin llevar nada, ¿soy un maleducado?', 'Fui al asado sin llevar nada, ¿soy maleducado?']::text[], note_en = coalesce(note_en, 'Saying “soy una maleducada” (with “una”) makes it sound like “I''m such a rude person”. It''s a bit more expressive than the plain adjective.')
where id = '80b4c0eb-9c03-5877-b012-76f065667c2d' and es = 'Fui al asado sin llevar nada, ¿soy una maleducada?' and en = 'I went to the asado without bringing anything, am I rude?'
  and not (es_alt && array['Fui al asado sin llevar nada, ¿soy maleducada?', 'Fui al asado sin llevar nada, ¿soy un maleducado?', 'Fui al asado sin llevar nada, ¿soy maleducado?']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Y Mati? —Hablé con él de nuevo ayer.', '—¿Y Mati? —Ayer hablé con él de nuevo.', '—¿Y Mati? —Hablé con él otra vez ayer.', '—¿Y Mati? —Ayer hablé con él otra vez.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you did something again.')
where id = '9c95ed08-0a60-5429-ba15-4609ddfcb904' and es = '—¿Y Mati? —Volví a hablar con él ayer.' and en = '—What about Mati? —I talked to him again yesterday.'
  and not (es_alt && array['—¿Y Mati? —Hablé con él de nuevo ayer.', '—¿Y Mati? —Ayer hablé con él de nuevo.', '—¿Y Mati? —Hablé con él otra vez ayer.', '—¿Y Mati? —Ayer hablé con él otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Recién compraste ese auto?', '¿Compraste ese auto recién?']::text[], note_en = coalesce(note_en, 'In Argentina, “recién” with the past tense is the everyday way to say “just”; “acabar de” is correct too.')
where id = '3caa9bb1-9cc9-5090-9426-a749134b0ae9' and es = '¿Acabás de comprar ese auto?' and en = 'Did you just buy that car?'
  and not (es_alt && array['¿Recién compraste ese auto?', '¿Compraste ese auto recién?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuándo te veo de nuevo?', '¿Cuándo te veo otra vez?', '¿Cuándo te voy a ver de nuevo?', '¿Cuándo te voy a ver otra vez?']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you do something again.')
where id = '39003d95-318a-57c0-a1b0-0e129573f8fa' and es = '¿Cuándo te vuelvo a ver?' and en = 'When will I see you again?'
  and not (es_alt && array['¿Cuándo te veo de nuevo?', '¿Cuándo te veo otra vez?', '¿Cuándo te voy a ver de nuevo?', '¿Cuándo te voy a ver otra vez?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Llamo de nuevo?', '¿Llamo otra vez?']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you do something again.')
where id = 'cc570dc9-820a-5d28-b856-7af6a8df3805' and es = '¿Vuelvo a llamar?' and en = 'Should I call again?'
  and not (es_alt && array['¿Llamo de nuevo?', '¿Llamo otra vez?']::text[]);

update public.sentences set es_alt = es_alt || array['Recién llovió.', 'Llovió recién.']::text[], note_en = coalesce(note_en, 'In Argentina, “recién” with the past tense is the everyday way to say “just”; “acabar de” is correct too.')
where id = '26d9bf82-31e4-5f80-a842-35bfc4939922' and es = 'Acaba de llover.' and en = 'It just rained.'
  and not (es_alt && array['Recién llovió.', 'Llovió recién.']::text[]);

update public.sentences set es_alt = es_alt || array['Recién comimos.', 'Comimos recién.']::text[], note_en = coalesce(note_en, 'In Argentina, “recién” with the past tense is the everyday way to say “just”; “acabar de” is correct too.')
where id = '81b3080e-c637-56aa-95a4-ad8632d4b1b6' and es = 'Acabamos de comer.' and en = 'We just ate.'
  and not (es_alt && array['Recién comimos.', 'Comimos recién.']::text[]);

update public.sentences set es_alt = es_alt || array['Recién llegamos a casa.', 'Llegamos a casa recién.']::text[], note_en = coalesce(note_en, 'In Argentina, “recién” with the past tense is the everyday way to say “just”; “acabar de” is correct too.')
where id = 'fd13f3ac-51fe-5413-9858-a86583f5949a' and es = 'Acabamos de llegar a casa.' and en = 'We just got home.'
  and not (es_alt && array['Recién llegamos a casa.', 'Llegamos a casa recién.']::text[]);

update public.sentences set es_alt = es_alt || array['Recién salimos.', 'Salimos recién.']::text[], note_en = coalesce(note_en, 'In Argentina, “recién” with the past tense is the everyday way to say “just”; “acabar de” is correct too.')
where id = '181af91c-5865-5bfc-8853-bffe2ee4173b' and es = 'Acabamos de salir.' and en = 'We just left.'
  and not (es_alt && array['Recién salimos.', 'Salimos recién.']::text[]);

update public.sentences set es_alt = es_alt || array['Recién vimos a Fede.', 'Vimos a Fede recién.']::text[], note_en = coalesce(note_en, 'In Argentina, “recién” with the past tense is the everyday way to say “just”; “acabar de” is correct too.')
where id = '68167a56-4d7f-54af-acb4-74d90845170c' and es = 'Acabamos de ver a Fede.' and en = 'We just saw Fede.'
  and not (es_alt && array['Recién vimos a Fede.', 'Vimos a Fede recién.']::text[]);

update public.sentences set es_alt = es_alt || array['Recién salieron.', 'Salieron recién.']::text[], note_en = coalesce(note_en, 'In Argentina, “recién” with the past tense is the everyday way to say “just”; “acabar de” is correct too.')
where id = 'add657ad-d9bc-5701-9ddc-94ff9ded84e9' and es = 'Acaban de salir.' and en = 'They just left.'
  and not (es_alt && array['Recién salieron.', 'Salieron recién.']::text[]);

update public.sentences set es_alt = es_alt || array['Recién llegaste, ¿ya te vas?', 'Recién llegás, ¿ya te vas?', 'Llegaste recién, ¿ya te vas?']::text[], note_en = coalesce(note_en, 'In Argentina, “recién” is the everyday way to say “just”; “acabar de” is correct too.')
where id = '1aa96d53-5530-5a59-a143-bac56b0d4f08' and es = 'Acabás de llegar, ¿ya te vas?' and en = 'You just got here, are you leaving already?'
  and not (es_alt && array['Recién llegaste, ¿ya te vas?', 'Recién llegás, ¿ya te vas?', 'Llegaste recién, ¿ya te vas?']::text[]);

update public.sentences set es_alt = es_alt || array['Recién llegué.', 'Llegué recién.', 'Recién llego.']::text[], note_en = coalesce(note_en, 'In Argentina, “recién” is the everyday way to say “just”; “acabar de” is correct too.')
where id = 'aeb556b4-3fe5-5fe4-ba6b-3861ac2bcd49' and es = 'Acabo de llegar.' and en = 'I just arrived.'
  and not (es_alt && array['Recién llegué.', 'Llegué recién.', 'Recién llego.']::text[]);

update public.sentences set es_alt = es_alt || array['Recién volví del súper.', 'Volví del súper recién.']::text[], note_en = coalesce(note_en, 'In Argentina, “recién” with the past tense is the everyday way to say “just”; “acabar de” is correct too.')
where id = '58da6fd6-a559-50fb-9c18-388e1bf14eeb' and es = 'Acabo de volver del súper.' and en = 'I just came back from the supermarket.'
  and not (es_alt && array['Recién volví del súper.', 'Volví del súper recién.']::text[]);

update public.sentences set es_alt = es_alt || array['Anoche dormí mal de nuevo.', 'Anoche dormí mal otra vez.', 'Dormí mal de nuevo anoche.', 'Dormí mal otra vez anoche.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you did something again.')
where id = '15cfefdf-f9f7-52d4-8a5f-16ebf269ff15' and es = 'Anoche volví a dormir mal.' and en = 'I slept badly again last night.'
  and not (es_alt && array['Anoche dormí mal de nuevo.', 'Anoche dormí mal otra vez.', 'Dormí mal de nuevo anoche.', 'Dormí mal otra vez anoche.']::text[]);

update public.sentences set es_alt = es_alt || array['Ayer vi a Rocío de nuevo.', 'Vi a Rocío de nuevo ayer.', 'Ayer vi a Rocío otra vez.', 'Vi a Rocío otra vez ayer.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you did something again.')
where id = '5cffd887-2857-5959-84e4-6f9eebcec6ef' and es = 'Ayer volví a ver a Rocío.' and en = 'I saw Rocío again yesterday.'
  and not (es_alt && array['Ayer vi a Rocío de nuevo.', 'Vi a Rocío de nuevo ayer.', 'Ayer vi a Rocío otra vez.', 'Vi a Rocío otra vez ayer.']::text[]);

update public.sentences set es_alt = es_alt || array['Che, recién tomaste un café, ¿y querés otro?', 'Che, tomaste un café recién, ¿y querés otro?']::text[], note_en = coalesce(note_en, 'In Argentina, “recién” with the past tense is the everyday way to say “just”; “acabar de” is correct too.')
where id = '081b11c9-f749-5126-8061-ffc4566ae443' and es = 'Che, acabás de tomar un café, ¿y querés otro?' and en = 'Hey, you just had a coffee, and you want another?'
  and not (es_alt && array['Che, recién tomaste un café, ¿y querés otro?', 'Che, tomaste un café recién, ¿y querés otro?']::text[]);

update public.sentences set es_alt = es_alt || array['Juan recién llegó.', 'Recién llegó Juan.', 'Juan llegó recién.']::text[], note_en = coalesce(note_en, 'In Argentina, “recién” with the past tense is the everyday way to say “just”; “acabar de” is correct too.')
where id = 'a15ba2f6-6354-5f35-a607-382cb379933c' and es = 'Juan acaba de llegar.' and en = 'Juan just arrived.'
  and not (es_alt && array['Juan recién llegó.', 'Recién llegó Juan.', 'Juan llegó recién.']::text[]);

update public.sentences set es_alt = es_alt || array['Los chicos recién comieron.', 'Los chicos comieron recién.']::text[], note_en = coalesce(note_en, 'In Argentina, “recién” with the past tense is the everyday way to say “just”; “acabar de” is correct too.')
where id = 'dfc424e4-0697-5dfd-a856-56506c06c685' and es = 'Los chicos acaban de comer.' and en = 'The kids just ate.'
  and not (es_alt && array['Los chicos recién comieron.', 'Los chicos comieron recién.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana estudio de nuevo.', 'Mañana estudio otra vez.', 'Estudio de nuevo mañana.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you do something again.')
where id = 'c60c9edb-fe8b-5e4e-9a52-4e77c28979e7' and es = 'Mañana vuelvo a estudiar.' and en = 'I''m studying again tomorrow.'
  and not (es_alt && array['Mañana estudio de nuevo.', 'Mañana estudio otra vez.', 'Estudio de nuevo mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana pido turno de nuevo.', 'Mañana pido turno otra vez.', 'Mañana voy a pedir turno de nuevo.', 'Mañana voy a pedir turno otra vez.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you do something again.')
where id = 'd197aa6c-9bb4-577a-ac6f-e3882c1761bd' and es = 'Mañana vuelvo a pedir turno.' and en = 'Tomorrow I''ll ask for an appointment again.'
  and not (es_alt && array['Mañana pido turno de nuevo.', 'Mañana pido turno otra vez.', 'Mañana voy a pedir turno de nuevo.', 'Mañana voy a pedir turno otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana pruebo de nuevo.', 'Mañana pruebo otra vez.', 'Pruebo de nuevo mañana.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you do something again.')
where id = 'eb76d1e3-ad19-5470-ad22-b9eac7189054' and es = 'Mañana vuelvo a probar.' and en = 'I''ll try again tomorrow.'
  and not (es_alt && array['Mañana pruebo de nuevo.', 'Mañana pruebo otra vez.', 'Pruebo de nuevo mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Generalmente no toman café.']::text[], note_en = coalesce(note_en, '“Soler” + verb is a compact way to say you usually do something.')
where id = '43487d44-2f51-5cd8-9d07-cf963d137021' and es = 'No suelen tomar café.' and en = 'They don''t usually drink coffee.'
  and not (es_alt && array['Generalmente no toman café.']::text[]);

update public.sentences set es_alt = es_alt || array['Generalmente no cocino.']::text[], note_en = coalesce(note_en, '“Soler” + verb is a compact way to say you usually do something.')
where id = 'a04b0396-9479-520f-8839-eb0018cd4431' and es = 'No suelo cocinar.' and en = 'I don''t usually cook.'
  and not (es_alt && array['Generalmente no cocino.']::text[]);

update public.sentences set es_alt = es_alt || array['Pablo generalmente llega tarde.', 'Generalmente Pablo llega tarde.']::text[], note_en = coalesce(note_en, '“Soler” + verb is a compact way to say you usually do something.')
where id = '402f1e2b-e766-57c4-9810-20befb163e47' and es = 'Pablo suele llegar tarde.' and en = 'Pablo usually arrives late.'
  and not (es_alt && array['Pablo generalmente llega tarde.', 'Generalmente Pablo llega tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Generalmente comemos tarde.']::text[], note_en = coalesce(note_en, '“Soler” + verb is a compact way to say you usually do something.')
where id = 'd49ae189-4545-5b32-a8ce-1d323147a33b' and es = 'Solemos comer tarde.' and en = 'We usually eat late.'
  and not (es_alt && array['Generalmente comemos tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Generalmente salimos los viernes.']::text[], note_en = coalesce(note_en, '“Soler” + verb is a compact way to say you usually do something.')
where id = 'c1d46251-d8d8-595c-a625-80d2c167b3a6' and es = 'Solemos salir los viernes.' and en = 'We usually go out on Fridays.'
  and not (es_alt && array['Generalmente salimos los viernes.']::text[]);

update public.sentences set es_alt = es_alt || array['Generalmente tomamos mate a la tarde.']::text[], note_en = coalesce(note_en, '“Soler” + verb is a compact way to say you usually do something.')
where id = 'b0fc2fb0-870d-55f3-8447-99b0b543830e' and es = 'Solemos tomar mate a la tarde.' and en = 'We usually drink mate in the afternoon.'
  and not (es_alt && array['Generalmente tomamos mate a la tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Generalmente voy en subte.']::text[], note_en = coalesce(note_en, '“Soler” + verb is a compact way to say you usually do something.')
where id = '3d80d834-311b-5947-a02c-e94a147b2e94' and es = 'Suelo ir en subte.' and en = 'I usually go by subway.'
  and not (es_alt && array['Generalmente voy en subte.']::text[]);

update public.sentences set es_alt = es_alt || array['Generalmente leo mucho.']::text[], note_en = coalesce(note_en, '“Soler” + verb is a compact way to say you usually do something.')
where id = '9b1354e6-8f72-5182-b106-17fc0bf9c74a' and es = 'Suelo leer mucho.' and en = 'I usually read a lot.'
  and not (es_alt && array['Generalmente leo mucho.']::text[]);

update public.sentences set es_alt = es_alt || array['Si no anda, cargo el celu de nuevo.', 'Si no anda, cargo el celu otra vez.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you do something again.')
where id = '22f06569-301a-50da-9214-939a22916db5' and es = 'Si no anda, vuelvo a cargar el celu.' and en = 'If it doesn''t work, I''ll charge the phone again.'
  and not (es_alt && array['Si no anda, cargo el celu de nuevo.', 'Si no anda, cargo el celu otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Te prometo que no llego tarde de nuevo.', 'Te prometo que no llego tarde otra vez.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you do something again.')
where id = 'a478b918-8a49-5bd9-aadc-459620b0d76c' and es = 'Te prometo que no vuelvo a llegar tarde.' and en = 'I promise I won''t be late again.'
  and not (es_alt && array['Te prometo que no llego tarde de nuevo.', 'Te prometo que no llego tarde otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Cociné ñoquis para mis viejos de nuevo.', 'Cociné ñoquis de nuevo para mis viejos.', 'Cociné ñoquis para mis viejos otra vez.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you did something again.')
where id = '51b04a28-72a3-5fee-8478-ec21444390af' and es = 'Volví a cocinar ñoquis para mis viejos.' and en = 'I cooked gnocchi for my parents again.'
  and not (es_alt && array['Cociné ñoquis para mis viejos de nuevo.', 'Cociné ñoquis de nuevo para mis viejos.', 'Cociné ñoquis para mis viejos otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Empecé a fumar de nuevo.', 'Empecé a fumar otra vez.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you did something again.')
where id = 'ba890f30-f348-54b4-90f2-14e8c37225bc' and es = 'Volví a fumar.' and en = 'I started smoking again.'
  and not (es_alt && array['Empecé a fumar de nuevo.', 'Empecé a fumar otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Empecé a jugar al fútbol de nuevo.', 'Empecé a jugar al fútbol otra vez.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you did something again.')
where id = '9fd56933-e64d-583f-999e-42623c80ca92' and es = 'Volví a jugar al fútbol.' and en = 'I started playing soccer again.'
  and not (es_alt && array['Empecé a jugar al fútbol de nuevo.', 'Empecé a jugar al fútbol otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Llamé a Belén de nuevo.', 'Llamé a Belén otra vez.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you did something again.')
where id = 'd7d2c5bd-324f-5148-89e1-c660bc89ce80' and es = 'Volví a llamar a Belén.' and en = 'I called Belén again.'
  and not (es_alt && array['Llamé a Belén de nuevo.', 'Llamé a Belén otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Llamé de nuevo.', 'Llamé otra vez.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you did something again.')
where id = 'b63d2073-9e97-5142-8e95-873aa65e473f' and es = 'Volví a llamar.' and en = 'I called again.'
  and not (es_alt && array['Llamé de nuevo.', 'Llamé otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Vi esa película de nuevo anoche.', 'Anoche vi esa película de nuevo.', 'Vi esa película otra vez anoche.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you did something again.')
where id = 'a6f92cd5-8596-53dd-88c2-3aea33534432' and es = 'Volví a ver esa película anoche.' and en = 'I watched that movie again last night.'
  and not (es_alt && array['Vi esa película de nuevo anoche.', 'Anoche vi esa película de nuevo.', 'Vi esa película otra vez anoche.']::text[]);

update public.sentences set es_alt = es_alt || array['Pruebo de nuevo.', 'Pruebo otra vez.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you do something again.')
where id = '1e9c38e9-4854-5284-8885-06da5b9a3519' and es = 'Vuelvo a probar.' and en = 'I''ll try again.'
  and not (es_alt && array['Pruebo de nuevo.', 'Pruebo otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Yo que vos, no pido el flan de nuevo.', 'Yo que vos, no pido el flan otra vez.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you do something again.')
where id = '28d45b6f-54d9-5a19-8be7-f065d9864bd5' and es = 'Yo que vos, no vuelvo a pedir el flan.' and en = 'If I were you, I wouldn''t order the flan again.'
  and not (es_alt && array['Yo que vos, no pido el flan de nuevo.', 'Yo que vos, no pido el flan otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés dar un pucho?']::text[], note_en = coalesce(note_en, 'Argentines often ask for things with the plain present: “¿Me das…?” is a friendly “can you give me…?”.')
where id = '89486f95-59e8-54bf-b8c9-f3e3d9432d4f' and es = '¿Me das un pucho?' and en = 'Can you give me a cigarette?'
  and not (es_alt && array['¿Me podés dar un pucho?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Llovió de nuevo?', '¿Llovió otra vez?']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say something happened again.')
where id = 'b88eaf96-e648-5653-8fa2-e3c0b95d22a2' and es = '¿Volvió a llover?' and en = 'Did it rain again?'
  and not (es_alt && array['¿Llovió de nuevo?', '¿Llovió otra vez?']::text[]);

update public.sentences set es_alt = es_alt || array['Belén empezó a fumar de nuevo.', 'Belén empezó a fumar otra vez.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say someone did something again.')
where id = 'd0dac273-1bb9-5b5a-8dc1-682d4ce78acb' and es = 'Belén volvió a fumar.' and en = 'Belén started smoking again.'
  and not (es_alt && array['Belén empezó a fumar de nuevo.', 'Belén empezó a fumar otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Dejé de mirar mi celu antes de dormir.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my” when it''s obvious whose thing it is.')
where id = 'caab6a19-3f7d-53a7-9ac6-6e8a0ae28a3d' and es = 'Dejé de mirar el celu antes de dormir.' and en = 'I stopped looking at my phone before bed.'
  and not (es_alt && array['Dejé de mirar mi celu antes de dormir.']::text[]);

update public.sentences set es_alt = es_alt || array['Este año festejamos Navidad en casa de nuevo.', 'Este año festejamos Navidad en casa otra vez.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you did something again.')
where id = '3b28ee5c-f39e-5e9e-81fb-c1080093b626' and es = 'Este año volvimos a festejar Navidad en casa.' and en = 'This year we celebrated Christmas at home again.'
  and not (es_alt && array['Este año festejamos Navidad en casa de nuevo.', 'Este año festejamos Navidad en casa otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['No fumo mucho.']::text[]
where id = '015eb558-1aea-58a9-908a-2c1a263efe9f' and es = 'Fumo poco.' and en = 'I don''t smoke much.'
  and not (es_alt && array['No fumo mucho.']::text[]);

update public.sentences set es_alt = es_alt || array['Fumo un pucho con mi café de la mañana.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my” when it''s obvious whose thing it is.')
where id = 'd2272df3-2055-5e36-a24c-357fc43a085e' and es = 'Fumo un pucho con el café de la mañana.' and en = 'I smoke a cigarette with my morning coffee.'
  and not (es_alt && array['Fumo un pucho con mi café de la mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Le dije que no, pero llamó de nuevo.', 'Le dije que no, pero llamó otra vez.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say someone did something again.')
where id = 'cd793e8d-6ac4-5e76-bac2-7d979df577c8' and es = 'Le dije que no, pero volvió a llamar.' and en = 'I told her no, but she called again.'
  and not (es_alt && array['Le dije que no, pero llamó de nuevo.', 'Le dije que no, pero llamó otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Llegué a casa y empecé a laburar.']::text[], note_en = coalesce(note_en, '“Ponerse a” + verb means to get started on something, often right then and there.')
where id = 'a3b4d507-0f54-52cc-a9c4-88ed7eb20fcd' and es = 'Llegué a casa y me puse a laburar.' and en = 'I got home and started working.'
  and not (es_alt && array['Llegué a casa y empecé a laburar.']::text[]);

update public.sentences set es_alt = es_alt || array['Empecé a cocinar.']::text[], note_en = coalesce(note_en, '“Ponerse a” + verb means to get started on something, often right then and there.')
where id = '206653cb-173c-51df-80ad-db38ef5efcd2' and es = 'Me puse a cocinar.' and en = 'I started cooking.'
  and not (es_alt && array['Empecé a cocinar.']::text[]);

update public.sentences set es_alt = es_alt || array['Empecé a estudiar.']::text[], note_en = coalesce(note_en, '“Ponerse a” + verb means to get started on something, often right then and there.')
where id = 'c169ddda-4d78-5574-9f35-df9700ccc822' and es = 'Me puse a estudiar.' and en = 'I started studying.'
  and not (es_alt && array['Empecé a estudiar.']::text[]);

update public.sentences set es_alt = es_alt || array['Empecé a ordenar la pieza.', 'Me puse a ordenar mi pieza.', 'Empecé a ordenar mi pieza.']::text[], note_en = coalesce(note_en, '“Ponerse a” + verb means to get started on something, often right then and there.')
where id = '6cc09a0a-870a-5a4d-9ecf-4eafb350ed0c' and es = 'Me puse a ordenar la pieza.' and en = 'I started tidying up my room.'
  and not (es_alt && array['Empecé a ordenar la pieza.', 'Me puse a ordenar mi pieza.', 'Empecé a ordenar mi pieza.']::text[]);

update public.sentences set es_alt = es_alt || array['Salimos de nuevo.', 'Salimos otra vez.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you did something again.')
where id = 'f5eb293a-95f6-506c-b17d-5fec9ecd6c3d' and es = 'Volvimos a salir.' and en = 'We went out again.'
  and not (es_alt && array['Salimos de nuevo.', 'Salimos otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Vimos la película de nuevo.', 'Vimos la película otra vez.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you did something again.')
where id = '48cc7fd1-6da1-559e-a993-736bd51a1963' and es = 'Volvimos a ver la película.' and en = 'We watched the movie again.'
  and not (es_alt && array['Vimos la película de nuevo.', 'Vimos la película otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Empezó a fumar de nuevo: ayer compró dos paquetes de puchos.', 'Empezó a fumar otra vez: ayer compró dos paquetes de puchos.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say someone did something again.')
where id = 'b21fb18f-060c-54ef-9307-c9bddc0f5201' and es = 'Volvió a fumar: ayer compró dos paquetes de puchos.' and en = 'He started smoking again: yesterday he bought two packs of cigarettes.'
  and not (es_alt && array['Empezó a fumar de nuevo: ayer compró dos paquetes de puchos.', 'Empezó a fumar otra vez: ayer compró dos paquetes de puchos.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés pasar tu alias?']::text[], note_en = coalesce(note_en, 'Argentines often ask for things with the plain present: “¿Me pasás…?” is a friendly “can you send me…?”.')
where id = 'ad414494-ecf8-55cf-b9c0-773f16a170b2' and es = '¿Me pasás tu alias?' and en = 'Can you send me your alias?'
  and not (es_alt && array['¿Me podés pasar tu alias?']::text[]);

update public.sentences set es_alt = es_alt || array['Anoche maté tres cucarachas con mi ojota.']::text[], note_en = coalesce(note_en, 'Spanish often says “la” where English says “my” when it''s obvious whose thing it is.')
where id = '3b63de90-677f-55bc-9b0e-1755c6993042' and es = 'Anoche maté tres cucarachas con la ojota.' and en = 'Last night I killed three cockroaches with my flip-flop.'
  and not (es_alt && array['Anoche maté tres cucarachas con mi ojota.']::text[]);

update public.sentences set es_alt = es_alt || array['Diego nunca trae nada y come más que nadie.']::text[], note_en = coalesce(note_en, '“Como nadie” means “like nobody else”: a common way to say someone outdoes everyone.')
where id = '0bf7d839-4511-5d89-a61a-ea850321bd92' and es = 'Diego nunca trae nada y come como nadie.' and en = 'Diego never brings anything and eats more than anyone.'
  and not (es_alt && array['Diego nunca trae nada y come más que nadie.']::text[]);

update public.sentences set es_alt = es_alt || array['El bebé aplaude cuando su mamá canta.']::text[], note_en = coalesce(note_en, 'Spanish often says “la mamá” where English says “his mom” when it''s clear whose mom it is.')
where id = 'd8ff103f-dfca-556c-83b0-a0e5eec07260' and es = 'El bebé aplaude cuando la mamá canta.' and en = 'The baby claps when his mom sings.'
  and not (es_alt && array['El bebé aplaude cuando su mamá canta.']::text[]);

update public.sentences set es_alt = es_alt || array['Lucía piensa que sos maleducado.', 'Lucía piensa que sos maleducada.']::text[], note_en = coalesce(note_en, 'Saying “sos un maleducado” turns the adjective into a label, and it hits a bit harder than plain “sos maleducado”.')
where id = '6ba7f220-e88f-5329-a246-410ce9ca63e1' and es = 'Lucía piensa que sos un maleducado.' and en = 'Lucía thinks you''re rude.'
  and not (es_alt && array['Lucía piensa que sos maleducado.', 'Lucía piensa que sos maleducada.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Querés ver lo que compré?']::text[], note_en = coalesce(note_en, '“Chusmear” also means to have a nosy little look at something, not only to gossip.')
where id = 'e8abc715-5f2e-57e5-8f5d-d053ac043c73' and es = '¿Querés chusmear lo que compré?' and en = 'Do you want to see what I bought?'
  and not (es_alt && array['¿Querés ver lo que compré?']::text[]);

update public.sentences set es_alt = es_alt || array['Callate, ahí viene Cami.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add “que” before the reason: it works like a quick “because”.')
where id = '591cc252-2112-5419-9b6e-f7d9ddaf51af' and es = 'Callate, que ahí viene Cami.' and en = 'Be quiet, here comes Cami.'
  and not (es_alt && array['Callate, ahí viene Cami.']::text[]);

update public.sentences set es_alt = es_alt || array['Callate, vos tampoco sabés nada.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add “que” before the reason: it works like a quick “because”.')
where id = '5c426819-9644-5acd-a615-56669f15d287' and es = 'Callate, que vos tampoco sabés nada.' and en = 'Be quiet, you don''t know anything either.'
  and not (es_alt && array['Callate, vos tampoco sabés nada.']::text[]);

update public.sentences set es_alt = es_alt || array['Che, no es por chusmear, pero ¿te enteraste de lo que pasó?', 'Che, no es por chusmear, pero ¿escuchaste lo que pasó?']::text[], note_en = coalesce(note_en, 'Argentines say “¿viste lo que pasó?” even for news you only heard about.')
where id = '251f25ac-7b21-51ce-8c97-d4f12dfcf293' and es = 'Che, no es por chusmear, pero ¿viste lo que pasó?' and en = 'Hey, not to gossip, but did you hear what happened?'
  and not (es_alt && array['Che, no es por chusmear, pero ¿te enteraste de lo que pasó?', 'Che, no es por chusmear, pero ¿escuchaste lo que pasó?']::text[]);

update public.sentences set es_alt = es_alt || array['Fui a ver la casa nueva de Cami.']::text[], note_en = coalesce(note_en, '“Chusmear” also means to have a nosy little look at something, not only to gossip.')
where id = 'a30dbd4b-6acd-51ca-9216-c585bd398907' and es = 'Fui a chusmear la casa nueva de Cami.' and en = 'I went to check out Cami''s new house.'
  and not (es_alt && array['Fui a ver la casa nueva de Cami.']::text[]);

update public.sentences set es_alt = es_alt || array['No vas a creer lo que me contaron.']::text[], note_en = coalesce(note_en, '“No sabés…” is a classic Argentine way to kick off a juicy story.')
where id = '81e4846b-47bf-5b50-bd0c-992123c7d664' and es = 'No sabés lo que me contaron.' and en = 'You won''t believe what they told me.'
  and not (es_alt && array['No vas a creer lo que me contaron.']::text[]);

update public.sentences set es_alt = es_alt || array['Vine a mirar.', 'Vine a ver.']::text[], note_en = coalesce(note_en, '“Chusmear” also means to have a nosy little look at something, not only to gossip.')
where id = '612a7bbe-810e-5336-8efe-de047cc41765' and es = 'Vine a chusmear.' and en = 'I came to have a look.'
  and not (es_alt && array['Vine a mirar.', 'Vine a ver.']::text[]);

update public.sentences set es_alt = es_alt || array['Empecé mi carrera en marzo.']::text[], note_en = coalesce(note_en, 'Spanish often says “la” where English says “my” when it''s obvious whose thing it is.')
where id = 'da2bdb1d-2432-5278-9f52-b8c57de1032e' and es = 'Empecé la carrera en marzo.' and en = 'I started my degree in March.'
  and not (es_alt && array['Empecé mi carrera en marzo.']::text[]);

update public.sentences set es_alt = es_alt || array['Aunque cueste mucho esfuerzo, termino mi carrera igual.']::text[], note_en = coalesce(note_en, 'Spanish often says “la” where English says “my” when it''s obvious whose thing it is.')
where id = '9bffbc53-d1a8-5cc2-a02b-54c375013dc1' and es = 'Aunque cueste mucho esfuerzo, termino la carrera igual.' and en = 'Even if it takes a lot of effort, I''m finishing my degree anyway.'
  and not (es_alt && array['Aunque cueste mucho esfuerzo, termino mi carrera igual.']::text[]);

update public.sentences set es_alt = es_alt || array['Aunque sea difícil, hay que ir.']::text[], note_en = coalesce(note_en, '“Costar” is the everyday way to say something is hard: “me cuesta” = “it''s hard for me”.')
where id = '10b76769-7c94-5b21-a8e0-e9d2b1fe7013' and es = 'Aunque cueste, hay que ir.' and en = 'Even if it''s hard, we have to go.'
  and not (es_alt && array['Aunque sea difícil, hay que ir.']::text[]);

update public.sentences set es_alt = es_alt || array['Aunque sea difícil, vale la pena.']::text[], note_en = coalesce(note_en, '“Costar” is the everyday way to say something is hard: “me cuesta” = “it''s hard for me”.')
where id = 'a176d83d-e4a4-5d7d-a10b-a55e5e244867' and es = 'Aunque cueste, vale la pena.' and en = 'Even if it''s hard, it''s worth it.'
  and not (es_alt && array['Aunque sea difícil, vale la pena.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi celu está medio roto, pero todavía anda.', 'Mi celu está medio roto, pero todavía funciona.']::text[], note_en = coalesce(note_en, '“Servir” means something is still usable or does the job.')
where id = '36fd7722-aea0-5dca-89fd-cedd84b405c2' and es = 'Mi celu está medio roto, pero todavía sirve.' and en = 'My phone is kind of broken, but it still works.'
  and not (es_alt && array['Mi celu está medio roto, pero todavía anda.', 'Mi celu está medio roto, pero todavía funciona.']::text[]);

update public.sentences set es_alt = es_alt || array['Aunque tenga sueño, entreno antes del laburo.']::text[]
where id = '097b5674-a57d-5f4b-867f-efb19c6f500e' and es = 'Aunque me dé sueño, entreno antes del laburo.' and en = 'Even if I''m sleepy, I work out before work.'
  and not (es_alt && array['Aunque tenga sueño, entreno antes del laburo.']::text[]);

update public.sentences set es_alt = es_alt || array['Hago ejercicio todos los días, aunque sea media hora.', 'Hago ejercicio todos los días, aunque sea solo media hora.']::text[]
where id = 'd76fbd61-17f1-5327-aa25-6459ebb59aae' and es = 'Hago ejercicio aunque sea media hora por día.' and en = 'I exercise every day, even if it''s only half an hour.'
  and not (es_alt && array['Hago ejercicio todos los días, aunque sea media hora.', 'Hago ejercicio todos los días, aunque sea solo media hora.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana empiezo mi dieta.', 'Empiezo mi dieta mañana.']::text[], note_en = coalesce(note_en, 'Spanish often says “la” where English says “my” when it''s obvious whose thing it is.')
where id = 'e00fa3b4-2127-5301-a416-356300de5afe' and es = 'Mañana empiezo la dieta.' and en = 'I''m starting my diet tomorrow.'
  and not (es_alt && array['Mañana empiezo mi dieta.', 'Empiezo mi dieta mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['No necesito entrenar todos los días.']::text[], note_en = coalesce(note_en, '“No hace falta que…” is a very common way to say something isn''t necessary.')
where id = '6b8e7c21-270c-5677-a40d-85c67f060ea0' and es = 'No hace falta que entrene todos los días.' and en = 'I don''t need to train every day.'
  and not (es_alt && array['No necesito entrenar todos los días.']::text[]);

update public.sentences set es_alt = es_alt || array['No tenía ganas, pero así y todo hice mi rutina.']::text[], note_en = coalesce(note_en, 'Spanish often says “la” where English says “my” when it''s obvious whose thing it is.')
where id = 'ebaafbbe-2fb6-5781-9576-b50e5cf29346' and es = 'No tenía ganas, pero así y todo hice la rutina.' and en = 'I didn''t feel like it, but even so I did my routine.'
  and not (es_alt && array['No tenía ganas, pero así y todo hice mi rutina.']::text[]);

update public.sentences set es_alt = es_alt || array['Si entreno a la noche, después no puedo dormir.']::text[]
where id = '566b6d67-84d7-5539-b45b-905f88c8f126' and es = 'Si entreno a la noche, después no duermo.' and en = 'If I work out at night, I can''t sleep afterward.'
  and not (es_alt && array['Si entreno a la noche, después no puedo dormir.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cómo va tu inglés, vas mejorando?']::text[], note_en = coalesce(note_en, 'Argentines often say “el inglés” where English says “your English”: it is clear from context whose it is.')
where id = '55223e25-98cb-5ec7-a6d7-d101af262b7d' and es = '¿Cómo va el inglés, vas mejorando?' and en = 'How''s your English going, are you getting better?'
  and not (es_alt && array['¿Cómo va tu inglés, vas mejorando?']::text[]);

update public.sentences set es_alt = es_alt || array['Martín está buscando un regalo para Belén.']::text[], note_en = coalesce(note_en, '“Andar” + -ndo is like “estar” + -ndo, but suggests he has been going around doing it for a while.')
where id = '2ab28ba4-3a21-5a2a-a4e5-2037644079a5' and es = 'Martín anda buscando un regalo para Belén.' and en = 'Martín is looking for a gift for Belén.'
  and not (es_alt && array['Martín está buscando un regalo para Belén.']::text[]);

update public.sentences set es_alt = es_alt || array['Pablo está mejorando mucho desde que empezó a practicar con Mica.']::text[]
where id = 'f560242c-38ee-507e-87f2-288f696fbd15' and es = 'Pablo está mejorando mucho desde que practica con Mica.' and en = 'Pablo has been improving a lot since he started practicing with Mica.'
  and not (es_alt && array['Pablo está mejorando mucho desde que empezó a practicar con Mica.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy tratando de mejorar mi castellano.']::text[]
where id = 'e0740f62-13bb-5f10-8a2c-b33b4083af40' and es = 'Trato de mejorar mi castellano.' and en = 'I''m trying to improve my Spanish.'
  and not (es_alt && array['Estoy tratando de mejorar mi castellano.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cómo va tu inglés? —Bien, sigo practicando.', '—¿Cómo va el inglés? —Bien, sigo practicando.']::text[], note_en = coalesce(note_en, '“Ese inglés” is a friendly, familiar way of asking about something you both know about; “tu inglés” is just as correct.')
where id = '040fad7a-6376-5fc3-a9a9-0ee032e3c697' and es = '—¿Cómo va ese inglés? —Bien, sigo practicando.' and en = '—How''s your English going? —Good, I''m still practicing.'
  and not (es_alt && array['—¿Cómo va tu inglés? —Bien, sigo practicando.', '—¿Cómo va el inglés? —Bien, sigo practicando.']::text[]);

update public.sentences set es_alt = es_alt || array['A pesar de lo que dice la gente, el subte anda bien.']::text[], note_en = coalesce(note_en, 'Spanish often uses a plain “they” verb (dicen) for “people say”, with no word for “people”.')
where id = 'e15fa6fe-e0dd-5bad-ae07-7fd1b91f2bf6' and es = 'A pesar de lo que dicen, el subte anda bien.' and en = 'Despite what people say, the subway works fine.'
  and not (es_alt && array['A pesar de lo que dice la gente, el subte anda bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Aunque es caro, el restaurante siempre está lleno.', 'Aunque sea caro, el restaurante siempre está lleno.']::text[]
where id = '23e86379-9f61-58ac-ac29-3e99beada363' and es = 'A pesar de ser caro, el restaurante siempre está lleno.' and en = 'Even though it''s expensive, the restaurant is always packed.'
  and not (es_alt && array['Aunque es caro, el restaurante siempre está lleno.', 'Aunque sea caro, el restaurante siempre está lleno.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando esté más barato, lo compro.', 'Cuando sea más barato, lo compro.']::text[]
where id = '072b850e-c239-5385-991b-21b0ad449b5e' and es = 'Cuando cueste menos, lo compro.' and en = 'When it''s cheaper, I''ll buy it.'
  and not (es_alt && array['Cuando esté más barato, lo compro.', 'Cuando sea más barato, lo compro.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuelo quería que fuera a la facultad.', 'Mi abuelo quería que fuera a la facu.', 'Mi abuelo quería que fuera a la universidad.']::text[], note_en = coalesce(note_en, '“Estudiar una carrera” is how Argentines usually talk about getting a university degree.')
where id = 'b2845d9d-9be0-5477-af33-bd7f88e7dd9b' and es = 'Mi abuelo quería que estudiara una carrera.' and en = 'My grandpa wanted me to go to college.'
  and not (es_alt && array['Mi abuelo quería que fuera a la facultad.', 'Mi abuelo quería que fuera a la facu.', 'Mi abuelo quería que fuera a la universidad.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi jefa me dejó salir antes.', 'Mi jefa me dejó salir temprano.']::text[]
where id = '5331dacd-8a3d-5dcc-8983-944107df3362' and es = 'Mi jefa me dio permiso para salir antes.' and en = 'My boss let me leave early.'
  and not (es_alt && array['Mi jefa me dejó salir antes.', 'Mi jefa me dejó salir temprano.']::text[]);

update public.sentences set es_alt = es_alt || array['Por más que ahorro, nunca me alcanza.']::text[]
where id = '92a2ecf3-e008-58e9-8eb9-e54a79eb0507' and es = 'Por más que ahorro, no me alcanza.' and en = 'No matter how much I save, it''s never enough.'
  and not (es_alt && array['Por más que ahorro, nunca me alcanza.']::text[]);

update public.sentences set es_alt = es_alt || array['Aunque me digas que no, voy a ir.']::text[], note_en = coalesce(note_en, '“Por más que” is a stronger “even if”, closer to “no matter how much”.')
where id = '14402890-edae-5183-b6d7-5bf43b8e89dd' and es = 'Por más que me digas que no, voy a ir.' and en = 'Even if you tell me no, I''m going.'
  and not (es_alt && array['Aunque me digas que no, voy a ir.']::text[]);

update public.sentences set es_alt = es_alt || array['Aunque nos cuesta, seguimos yendo al gimnasio.']::text[], note_en = coalesce(note_en, '“Por más que” is a stronger “even though”, closer to “no matter how much”.')
where id = 'ea62371a-033e-5628-8fe7-cdd174ca953a' and es = 'Por más que nos cuesta, seguimos yendo al gimnasio.' and en = 'Even though it is hard for us, we keep going to the gym.'
  and not (es_alt && array['Aunque nos cuesta, seguimos yendo al gimnasio.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy estudiando inglés de nuevo, aunque sea una hora por semana.', 'Estoy estudiando inglés otra vez, aunque sea una hora por semana.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is the everyday way to say you are doing something again.')
where id = '7aacb5fc-24f3-5848-969e-6869940b6e71' and es = 'Volví a estudiar inglés, aunque sea una hora por semana.' and en = 'I am studying English again, even if it is just one hour a week.'
  and not (es_alt && array['Estoy estudiando inglés de nuevo, aunque sea una hora por semana.', 'Estoy estudiando inglés otra vez, aunque sea una hora por semana.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Qué vivo sos!']::text[], note_en = coalesce(note_en, 'In spoken exclamations Argentines often slip in an extra “que” (¡Qué vivo que sos!). It adds emphasis and is optional.')
where id = 'cf4da094-d517-5b5f-b4db-056ee7d89acb' and es = '¡Qué vivo que sos!' and en = 'You''re so clever!'
  and not (es_alt && array['¡Qué vivo sos!']::text[]);

update public.sentences set es_alt = es_alt || array['Se hace el apurado para no tener que hacer la fila.']::text[]
where id = '7a7a0b59-b4e0-5662-9c7a-c8a7c123534d' and es = 'Se hace el apurado para no hacer la fila.' and en = 'He pretends to be in a hurry so he does not have to stand in line.'
  and not (es_alt && array['Se hace el apurado para no tener que hacer la fila.']::text[]);

update public.sentences set es_alt = es_alt || array['Se hizo la enferma para no tener que ir a la reunión.']::text[]
where id = '151da555-db9f-51b4-b9af-5575785114af' and es = 'Se hizo la enferma para no ir a la reunión.' and en = 'She pretended to be sick so she would not have to go to the meeting.'
  and not (es_alt && array['Se hizo la enferma para no tener que ir a la reunión.']::text[]);

update public.sentences set es_alt = es_alt || array['Me hice el enfermo para no tener que ir.', 'Me hice la enferma para no tener que ir.', 'Me hice la enferma para no ir.']::text[]
where id = '13f75827-5872-5dbf-83a8-bc709e4f9547' and es = 'Me hice el enfermo para no ir.' and en = 'I pretended to be sick so I wouldn''t have to go.'
  and not (es_alt && array['Me hice el enfermo para no tener que ir.', 'Me hice la enferma para no tener que ir.', 'Me hice la enferma para no ir.']::text[]);

update public.sentences set es_alt = es_alt || array['No te hagas el canchero conmigo, te conozco.']::text[], note_en = coalesce(note_en, 'After a command, a little “que” often introduces the reason, like a soft “because”. It is optional.')
where id = '50865892-2dc1-57d5-abe9-691ab0aa7f48' and es = 'No te hagas el canchero conmigo, que te conozco.' and en = 'Don''t act all cool with me, I know you.'
  and not (es_alt && array['No te hagas el canchero conmigo, te conozco.']::text[]);

update public.sentences set es_alt = es_alt || array['Te podés hacer el distraído todo lo que quieras, pero me debés plata.']::text[]
where id = 'e61844b3-48d4-53a0-b464-082959c71771' and es = 'Te hacés el distraído, pero me debés plata.' and en = 'You can play dumb all you want, but you owe me money.'
  and not (es_alt && array['Te podés hacer el distraído todo lo que quieras, pero me debés plata.']::text[]);

update public.sentences set es_alt = es_alt || array['Te creés muy vivo.', 'Te creés re vivo.']::text[], note_en = coalesce(note_en, '“Hacerse el vivo” is the set Argentine phrase for acting like you''re smarter than everyone else.')
where id = '35f16120-3d50-5046-ac5a-fb8c726de079' and es = 'Te hacés el vivo.' and en = 'You think you''re so clever.'
  and not (es_alt && array['Te creés muy vivo.', 'Te creés re vivo.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué llaves? ¿Las llaves de casa?']::text[], note_en = coalesce(note_en, 'Spanish usually avoids repeating the noun: “las de casa” means “the house ones”.')
where id = 'c84b7ed3-b4c7-5ac2-818c-32e218e7e4c4' and es = '¿Qué llaves? ¿Las de casa?' and en = 'Which keys? The house keys?'
  and not (es_alt && array['¿Qué llaves? ¿Las llaves de casa?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Quién es la chica de rojo?']::text[], note_en = coalesce(note_en, 'Spanish often drops the noun here: “la de rojo” is literally “the one in red”.')
where id = '71343e35-f116-5978-b96d-4345aad08bc0' and es = '¿Quién es la de rojo?' and en = 'Who''s the girl in red?'
  and not (es_alt && array['¿Quién es la chica de rojo?']::text[]);

update public.sentences set es_alt = es_alt || array['El chico de rojo es mi hermano.', 'El pibe de rojo es mi hermano.']::text[], note_en = coalesce(note_en, 'Spanish often drops the noun here: “el de rojo” is literally “the one in red”.')
where id = '8e4e7780-051a-52c5-bd81-8a6e0f3b6692' and es = 'El de rojo es mi hermano.' and en = 'The guy in red is my brother.'
  and not (es_alt && array['El chico de rojo es mi hermano.', 'El pibe de rojo es mi hermano.']::text[]);

update public.sentences set es_alt = es_alt || array['La gente de Córdoba habla re distinto.']::text[], note_en = coalesce(note_en, '“Los de” + a place is a common way to say “people from” there.')
where id = 'dc051178-add4-5cc1-835b-6dc27097ca74' and es = 'Los de Córdoba hablan re distinto.' and en = 'People from Córdoba speak really differently.'
  and not (es_alt && array['La gente de Córdoba habla re distinto.']::text[]);

update public.sentences set es_alt = es_alt || array['Me pruebo la campera y después vamos.']::text[]
where id = 'ae71139b-ac65-5463-9f05-0442ccf46525' and es = 'Me pruebo la campera y vamos.' and en = 'I''ll try on the jacket and then we''ll go.'
  and not (es_alt && array['Me pruebo la campera y después vamos.']::text[]);

update public.sentences set es_alt = es_alt || array['Mis zapatillas son las blancas; las de Santi son las negras.']::text[], note_en = coalesce(note_en, 'Spanish can skip a repeated verb and use a comma instead; saying “son” again is just as correct.')
where id = '62a92b66-b8ba-5e1d-8945-78588db0cb2d' and es = 'Mis zapatillas son las blancas; las de Santi, las negras.' and en = 'My sneakers are the white ones; Santi''s are the black ones.'
  and not (es_alt && array['Mis zapatillas son las blancas; las de Santi son las negras.']::text[]);

update public.sentences set es_alt = es_alt || array['Pueden ir al probador todas las veces que quieran.']::text[]
where id = 'a606ffcc-fbe5-56ab-a36d-8df4c137bed4' and es = 'Pueden ir al probador las veces que quieran.' and en = 'You can go to the fitting room as many times as you want.'
  and not (es_alt && array['Pueden ir al probador todas las veces que quieran.']::text[]);

update public.sentences set es_alt = es_alt || array['Agarren un taxi, es tarde.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add “que” to give the reason: it works like a quick “because”.')
where id = '19b43fcb-2a58-558a-ad74-ff2c3751c305' and es = 'Agarren un taxi, que es tarde.' and en = 'Grab a cab, it''s late.'
  and not (es_alt && array['Agarren un taxi, es tarde.']::text[]);

update public.sentences set es_alt = es_alt || array['Agarren un vaso, traje cerveza.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add “que” to give the reason: it works like a quick “because”.')
where id = '71c43573-29d3-5b9e-a3e8-89a5e73e7601' and es = 'Agarren un vaso, que traje cerveza.' and en = 'Grab a glass, I brought beer.'
  and not (es_alt && array['Agarren un vaso, traje cerveza.']::text[]);

update public.sentences set es_alt = es_alt || array['Chicos, agarren sus cosas, nos vamos.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add “que” to give the reason: it works like a quick “because”.')
where id = '31436a7c-c320-5a42-96d1-23f9aac12a2c' and es = 'Chicos, agarren sus cosas que nos vamos.' and en = 'Guys, grab your stuff, we''re leaving.'
  and not (es_alt && array['Chicos, agarren sus cosas, nos vamos.']::text[]);

update public.sentences set es_alt = es_alt || array['Chicos, no se olviden de la tarea.', 'Chicos, no se olviden de su tarea.']::text[], note_en = coalesce(note_en, 'In everyday speech Argentines often drop the “de” after “olvidarse”; with “de” it is just as correct.')
where id = '10bf36c0-d48a-5d3e-9b89-a71d1232d8e7' and es = 'Chicos, no se olviden la tarea.' and en = 'Kids, don''t forget your homework.'
  and not (es_alt && array['Chicos, no se olviden de la tarea.', 'Chicos, no se olviden de su tarea.']::text[]);

update public.sentences set es_alt = es_alt || array['Chicos, siéntense, ya empieza.']::text[]
where id = 'b58f74ab-43b6-58ef-86bc-5d714128fb20' and es = 'Chicos, siéntense, que ya empieza.' and en = 'Guys, sit down, it''s starting.'
  and not (es_alt && array['Chicos, siéntense, ya empieza.']::text[]);

update public.sentences set es_alt = es_alt || array['Coman despacio, tenemos tiempo.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add “que” to give the reason: it works like a quick “because”.')
where id = '15d1ba28-e312-5a47-973c-79abde122b98' and es = 'Coman despacio, que tenemos tiempo.' and en = 'Eat slowly, we have time.'
  and not (es_alt && array['Coman despacio, tenemos tiempo.']::text[]);

update public.sentences set es_alt = es_alt || array['Coman, chicos, hay más.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add “que” to give the reason: it works like a quick “because”.')
where id = '96aa8288-736c-5983-acc2-16694de914b3' and es = 'Coman, chicos, que hay más.' and en = 'Eat up, guys, there''s more.'
  and not (es_alt && array['Coman, chicos, hay más.']::text[]);

update public.sentences set es_alt = es_alt || array['Hacé lo que quieras, pero después no digas que no te avisé.']::text[]
where id = '35d0c9d3-76ae-5563-97cb-a46f84143a8b' and es = 'Como quieras, pero después no digas que no te avisé.' and en = 'Do what you want, but later don''t say I didn''t warn you.'
  and not (es_alt && array['Hacé lo que quieras, pero después no digas que no te avisé.']::text[]);

update public.sentences set es_alt = es_alt || array['No coman todo el flan, es para Rocío.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add “que” to give the reason: it works like a quick “because”.')
where id = '3c59ea00-508c-5326-b5d5-67d0e130d91e' and es = 'No coman todo el flan, que es para Rocío.' and en = 'Don''t eat all the flan, it''s for Rocío.'
  and not (es_alt && array['No coman todo el flan, es para Rocío.']::text[]);

update public.sentences set es_alt = es_alt || array['Podés pagar como quieras, efectivo o tarjeta.']::text[]
where id = '2a3894a4-05bd-549a-89df-847d3313b91f' and es = 'Pagás como quieras, efectivo o tarjeta.' and en = 'You can pay however you want, cash or card.'
  and not (es_alt && array['Podés pagar como quieras, efectivo o tarjeta.']::text[]);

update public.sentences set es_alt = es_alt || array['Pasen y sírvanse, la picada está en la mesa.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add “que” to give the reason: it works like a quick “because”.')
where id = '0fdee7da-ed50-5d6d-ac6f-ec3dcb40979a' and es = 'Pasen y sírvanse, que la picada está en la mesa.' and en = 'Come in and help yourselves, the picada is on the table.'
  and not (es_alt && array['Pasen y sírvanse, la picada está en la mesa.']::text[]);

update public.sentences set es_alt = es_alt || array['Prueben por lo menos un poco.', 'Por lo menos prueben un poco.']::text[], note_en = coalesce(note_en, '“Aunque sea” is a very common Argentine way to say “at least”.')
where id = 'e806e7c2-f56a-5cbc-96f9-f89fc86e5955' and es = 'Prueben aunque sea un poco.' and en = 'At least try a little.'
  and not (es_alt && array['Prueben por lo menos un poco.', 'Por lo menos prueben un poco.']::text[]);

update public.sentences set es_alt = es_alt || array['Siéntense acá, hay más lugar.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add “que” to give the reason: it works like a quick “because”.')
where id = 'fc1556e9-1c8c-5346-a557-fec6df6aa79f' and es = 'Siéntense acá, que hay más lugar.' and en = 'Sit here, there''s more room.'
  and not (es_alt && array['Siéntense acá, hay más lugar.']::text[]);

update public.sentences set es_alt = es_alt || array['Siéntense, les tengo una noticia.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add “que” to give the reason: it works like a quick “because”.')
where id = '79ba316d-b90a-54c2-9023-81125d78c07e' and es = 'Siéntense, que les tengo una noticia.' and en = 'Sit down, I have some news for you.'
  and not (es_alt && array['Siéntense, les tengo una noticia.']::text[]);

update public.sentences set es_alt = es_alt || array['Sírvanse primero, son los invitados.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add “que” to give the reason: it works like a quick “because”.')
where id = 'bf7f302d-a9e3-508f-824f-939b6908585f' and es = 'Sírvanse primero, que son los invitados.' and en = 'Help yourselves first, you''re the guests.'
  and not (es_alt && array['Sírvanse primero, son los invitados.']::text[]);

update public.sentences set es_alt = es_alt || array['Fue solo mala suerte.', 'Solo fue mala suerte.']::text[], note_en = coalesce(note_en, 'Tagging “nada más” on the end is a very common way to say “just” or “that''s all”.')
where id = '27ff42e2-de1d-53a9-bfab-bcd3daefca52' and es = 'Fue mala suerte, nada más.' and en = 'It was just bad luck.'
  and not (es_alt && array['Fue solo mala suerte.', 'Solo fue mala suerte.']::text[]);

update public.sentences set es_alt = es_alt || array['Hubiéramos salido antes.']::text[], note_en = coalesce(note_en, '“Hubiéramos…” on its own is a very common Argentine way to say “we should have…”. “Tendríamos que haber…” is just as correct.')
where id = 'ca63a0e1-0e78-5ec9-8c7b-5ef87d223b3a' and es = 'Hubiéramos salido más temprano.' and en = 'We should have left earlier.'
  and not (es_alt && array['Hubiéramos salido antes.']::text[]);

update public.sentences set es_alt = es_alt || array['Si hubiera traído mi cargador, te hubiera llamado.', 'Te hubiera llamado si hubiera traído mi cargador.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my” when it is obvious whose thing it is.')
where id = '5b350fde-73b1-51ca-8e6b-ff14cce71335' and es = 'Si hubiera traído el cargador, te hubiera llamado.' and en = 'If I had brought my charger, I would have called you.'
  and not (es_alt && array['Si hubiera traído mi cargador, te hubiera llamado.', 'Te hubiera llamado si hubiera traído mi cargador.']::text[]);

update public.sentences set es_alt = es_alt || array['El sueldo me convence, pero el horario no.', 'Me convence el sueldo, pero el horario no.']::text[]
where id = '9a61f03b-82db-5059-8892-c317b13f7bfd' and es = 'El sueldo me convence, el horario no.' and en = 'I''m happy with the salary, but not the schedule.'
  and not (es_alt && array['El sueldo me convence, pero el horario no.', 'Me convence el sueldo, pero el horario no.']::text[]);

update public.sentences set es_alt = es_alt || array['Este depto es caro, pero ese es barato.']::text[], note_en = coalesce(note_en, '“En cambio” sets two things against each other, like “whereas”. A plain “pero” works too.')
where id = '569ed57d-f877-56db-8020-a88e17e8d05e' and es = 'Este depto es caro; ese, en cambio, es barato.' and en = 'This apartment is expensive, but that one is cheap.'
  and not (es_alt && array['Este depto es caro, pero ese es barato.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hermano es alto, pero yo soy petiso.', 'Mi hermano es alto, pero yo soy petisa.']::text[], note_en = coalesce(note_en, '“En cambio” sets two things against each other, like “whereas”. A plain “pero” works too.')
where id = '8a9dbadf-a8c1-5ed4-8ae3-bc37f163a109' and es = 'Mi hermano es alto; yo, en cambio, soy petiso.' and en = 'My brother is tall, but I''m short.'
  and not (es_alt && array['Mi hermano es alto, pero yo soy petiso.', 'Mi hermano es alto, pero yo soy petisa.']::text[]);

update public.sentences set es_alt = es_alt || array['Pablo siempre llega tarde, pero Juli no.', 'Pablo llega siempre tarde, pero Juli no.']::text[], note_en = coalesce(note_en, '“En cambio” sets two things against each other, like “whereas”. A plain “pero” works too.')
where id = '5cd7b5d9-3980-5a05-8898-90824b3f2330' and es = 'Pablo siempre llega tarde; Juli, en cambio, no.' and en = 'Pablo always arrives late, but Juli doesn''t.'
  and not (es_alt && array['Pablo siempre llega tarde, pero Juli no.', 'Pablo llega siempre tarde, pero Juli no.']::text[]);

update public.sentences set es_alt = es_alt || array['Palermo es caro, pero San Telmo no.']::text[], note_en = coalesce(note_en, '“En cambio” sets two things against each other, like “whereas”. A plain “pero” works too.')
where id = '72f693bc-e662-5be7-94cb-48a832b91f9e' and es = 'Palermo es caro; San Telmo, en cambio, no.' and en = 'Palermo is expensive, but San Telmo isn''t.'
  and not (es_alt && array['Palermo es caro, pero San Telmo no.']::text[]);

update public.sentences set es_alt = es_alt || array['Vos sos argentino, pero yo no.', 'Vos sos argentina, pero yo no.']::text[], note_en = coalesce(note_en, '“En cambio” sets two things against each other, like “whereas”. A plain “pero” works too.')
where id = '05ca8939-e196-55c8-8ad3-609d7fbbc472' and es = 'Vos sos argentino; yo, en cambio, no.' and en = 'You''re Argentinian, but I''m not.'
  and not (es_alt && array['Vos sos argentino, pero yo no.', 'Vos sos argentina, pero yo no.']::text[]);

update public.sentences set es_alt = es_alt || array['Yo laburo, pero vos estudiás.']::text[], note_en = coalesce(note_en, '“En cambio” sets two things against each other, like “whereas”. A plain “pero” works too.')
where id = '1dd5e1b0-935c-533c-9d29-9c6c0ed5565a' and es = 'Yo laburo; vos, en cambio, estudiás.' and en = 'I work, but you study.'
  and not (es_alt && array['Yo laburo, pero vos estudiás.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué desventaja ves?']::text[], note_en = coalesce(note_en, 'The “le” points back to the thing you are talking about: literally “what downside do you see in it?”.')
where id = 'ffd6b994-71c6-5b83-85f7-8a857108894c' and es = '¿Qué desventaja le ves?' and en = 'What downside do you see?'
  and not (es_alt && array['¿Qué desventaja ves?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuál es la ventaja?']::text[]
where id = 'ea35d435-d4b6-59d5-8230-39a291fb7cd0' and es = '¿Qué ventaja tiene?' and en = 'What''s the advantage?'
  and not (es_alt && array['¿Cuál es la ventaja?']::text[]);

update public.sentences set es_alt = es_alt || array['Tendrías que reservar.', 'Tendrías que hacer una reserva.']::text[], note_en = coalesce(note_en, '“Te conviene” is a very common way to give friendly advice: literally “it''s in your interest to…”.')
where id = 'ad05ed4e-2333-53f8-b43a-b4e059029539' and es = 'Te conviene reservar.' and en = 'You should make a reservation.'
  and not (es_alt && array['Tendrías que reservar.', 'Tendrías que hacer una reserva.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Hubiéramos tomado un taxi!']::text[], note_en = coalesce(note_en, '“¡Hubiéramos…!” on its own is a very common Argentine way to say “we should have…”. “Tendríamos que haber…” is just as correct.')
where id = '8039f847-4975-5dca-a535-4fab972808d0' and es = '¡Hubiéramos ido en taxi!' and en = 'We should have taken a taxi!'
  and not (es_alt && array['¡Hubiéramos tomado un taxi!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde puedo hacer una consulta?']::text[]
where id = '3d246f06-a6ed-5a39-a7df-68d6bd41b4b7' and es = '¿Dónde hago una consulta?' and en = 'Where can I ask a question?'
  and not (es_alt && array['¿Dónde puedo hacer una consulta?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés turno o es solo una consulta?']::text[]
where id = '927d3dd2-422f-5af1-8915-abe55625b93a' and es = '¿Tenés turno o es una consulta?' and en = 'Do you have an appointment, or is it just a question?'
  and not (es_alt && array['¿Tenés turno o es solo una consulta?']::text[]);

update public.sentences set es_alt = es_alt || array['Acá te atienden rápido, pero allá no.']::text[], note_en = coalesce(note_en, '“En cambio” sets two things against each other, like “whereas”. A plain “pero” works too.')
where id = '65e3fb78-593f-5850-8a05-defcd7c1bfa0' and es = 'Acá te atienden rápido; allá, en cambio, no.' and en = 'Here they see you fast, but over there they don''t.'
  and not (es_alt && array['Acá te atienden rápido, pero allá no.']::text[]);

update public.sentences set es_alt = es_alt || array['Ayer llovió, pero hoy hay sol.']::text[], note_en = coalesce(note_en, '“En cambio” sets two things against each other, like “whereas”. A plain “pero” works too.')
where id = '5009d76f-8e15-5658-969a-8b56f1602b80' and es = 'Ayer llovió; hoy, en cambio, hay sol.' and en = 'Yesterday it rained, but today it''s sunny.'
  and not (es_alt && array['Ayer llovió, pero hoy hay sol.']::text[]);

update public.sentences set es_alt = es_alt || array['Cami cocinó y también lavó los platos.', 'Cami cocinó y lavó los platos también.']::text[]
where id = '5e9f870a-5805-5f9d-987b-e2ae0326331b' and es = 'Cami cocinó y además lavó los platos.' and en = 'Cami cooked and did the dishes too.'
  and not (es_alt && array['Cami cocinó y también lavó los platos.', 'Cami cocinó y lavó los platos también.']::text[]);

update public.sentences set es_alt = es_alt || array['Che, ¿tendría que renovar el pasaporte ahora?']::text[], note_en = coalesce(note_en, '“¿Me conviene…?” is a very common way to ask for advice: literally “is it in my interest to…?”.')
where id = '6720c9ff-75a5-5946-903b-e4f0041f2ff1' and es = 'Che, ¿me conviene renovar el pasaporte ahora?' and en = 'Hey, should I renew my passport now?'
  and not (es_alt && array['Che, ¿tendría que renovar el pasaporte ahora?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, perdí mi vuelo.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my” when it is obvious whose thing it is.')
where id = '1e2735cc-ab63-5d87-8681-4e699e31fc4f' and es = 'Che, perdí el vuelo.' and en = 'Hey, I missed my flight.'
  and not (es_alt && array['Che, perdí mi vuelo.']::text[]);

update public.sentences set es_alt = es_alt || array['Con la mala suerte que tengo, seguro va a llover.', 'Con mi mala suerte, seguro llueve.', 'Con mi mala suerte, seguro va a llover.']::text[]
where id = '2bff68b9-c720-52cb-b070-a773c1a491e8' and es = 'Con la mala suerte que tengo, seguro llueve.' and en = 'With my bad luck, it''s definitely going to rain.'
  and not (es_alt && array['Con la mala suerte que tengo, seguro va a llover.', 'Con mi mala suerte, seguro llueve.', 'Con mi mala suerte, seguro va a llover.']::text[]);

update public.sentences set es_alt = es_alt || array['El colectivo tarda, pero el subte es rápido.', 'El colectivo es lento, pero el subte es rápido.']::text[], note_en = coalesce(note_en, '“En cambio” sets two things against each other, like “whereas”. A plain “pero” works too.')
where id = '9ecb0c6f-62f5-5e9a-ae6c-b8ac72b32c2c' and es = 'El colectivo tarda; el subte, en cambio, es rápido.' and en = 'The bus is slow, but the subway is fast.'
  and not (es_alt && array['El colectivo tarda, pero el subte es rápido.', 'El colectivo es lento, pero el subte es rápido.']::text[]);

update public.sentences set es_alt = es_alt || array['El DNI demoró una semana, pero el pasaporte demoró un mes.', 'El DNI demoró una semana, pero el pasaporte, un mes.']::text[], note_en = coalesce(note_en, '“En cambio” sets two things against each other, like “whereas”. A plain “pero” works too.')
where id = '454f2f70-d981-58b0-853d-12314e6b59e4' and es = 'El DNI demoró una semana; el pasaporte, en cambio, un mes.' and en = 'The ID took a week, but the passport took a month.'
  and not (es_alt && array['El DNI demoró una semana, pero el pasaporte demoró un mes.', 'El DNI demoró una semana, pero el pasaporte, un mes.']::text[]);

update public.sentences set es_alt = es_alt || array['El vuelo llegó a horario, pero la valija no.']::text[], note_en = coalesce(note_en, '“En cambio” sets two things against each other, like “whereas”. A plain “pero” works too.')
where id = 'ea097837-1e25-58e9-adc2-9156f514ef75' and es = 'El vuelo llegó a horario; la valija, en cambio, no.' and en = 'The flight arrived on schedule, but the suitcase didn''t.'
  and not (es_alt && array['El vuelo llegó a horario, pero la valija no.']::text[]);

update public.sentences set es_alt = es_alt || array['Fue una pérdida de tiempo.']::text[]
where id = '1f366f2e-4043-5ccf-b3e6-496e7fd052b2' and es = 'Fue tiempo perdido.' and en = 'It was a waste of time.'
  and not (es_alt && array['Fue una pérdida de tiempo.']::text[]);

update public.sentences set es_alt = es_alt || array['Hay muchos requisitos para la residencia.', 'Hay un montón de requisitos para la residencia.']::text[]
where id = 'e79b6fff-6ac0-5cf4-8679-2c399e9ff4c9' and es = 'Los requisitos para la residencia son muchos.' and en = 'There are a lot of requirements for residency.'
  and not (es_alt && array['Hay muchos requisitos para la residencia.', 'Hay un montón de requisitos para la residencia.']::text[]);

update public.sentences set es_alt = es_alt || array['Me conviene renovar ya: mi DNI está casi vencido.']::text[], note_en = coalesce(note_en, 'Argentines often say “tengo el DNI vencido” (“I have the ID expired”) where English says “my ID is expired”.')
where id = 'bdcaf956-2431-5d95-8f1b-4540d7088b1e' and es = 'Me conviene renovar ya: tengo el DNI casi vencido.' and en = 'I had better renew now: my DNI is almost expired.'
  and not (es_alt && array['Me conviene renovar ya: mi DNI está casi vencido.']::text[]);

update public.sentences set es_alt = es_alt || array['Me gusta el invierno, pero a Diego no.']::text[], note_en = coalesce(note_en, '“En cambio” sets two things against each other, like “whereas”. A plain “pero” works too.')
where id = '6b70b5c2-c9b6-5982-a46e-911ddc6fec9c' and es = 'Me gusta el invierno; a Diego, en cambio, no.' and en = 'I like winter, but Diego doesn''t.'
  and not (es_alt && array['Me gusta el invierno, pero a Diego no.']::text[]);

update public.sentences set es_alt = es_alt || array['Mis viejos son de Córdoba, pero yo soy porteño.', 'Mis viejos son de Córdoba, pero yo soy porteña.', 'Mis viejos son de Córdoba, pero yo soy de Buenos Aires.']::text[], note_en = coalesce(note_en, '“En cambio” sets two things against each other, like “whereas”. A plain “pero” works too.')
where id = 'f3ed0caa-2cf4-5161-89c1-fc2c79d7f639' and es = 'Mis viejos son de Córdoba; yo, en cambio, soy porteño.' and en = 'My parents are from Córdoba, but I''m from Buenos Aires.'
  and not (es_alt && array['Mis viejos son de Córdoba, pero yo soy porteño.', 'Mis viejos son de Córdoba, pero yo soy porteña.', 'Mis viejos son de Córdoba, pero yo soy de Buenos Aires.']::text[]);

update public.sentences set es_alt = es_alt || array['No me dejaron subir: mi pasaporte estaba vencido.']::text[], note_en = coalesce(note_en, 'Argentines often say “tenía el pasaporte vencido” (“I had the passport expired”) where English says “my passport was expired”.')
where id = '5b61609b-d797-5672-bc2c-437f3ab486c0' and es = 'No me dejaron subir: tenía el pasaporte vencido.' and en = 'They didn''t let me board: my passport was expired.'
  and not (es_alt && array['No me dejaron subir: mi pasaporte estaba vencido.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá hubiera traído mi paraguas.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my” when it is obvious whose thing it is.')
where id = 'bdb6fd6a-867e-5fc3-a971-2611dc77e297' and es = 'Ojalá hubiera traído el paraguas.' and en = 'I wish I had brought my umbrella.'
  and not (es_alt && array['Ojalá hubiera traído mi paraguas.']::text[]);

update public.sentences set es_alt = es_alt || array['Perdí mi vuelo, qué mala suerte.', 'Qué mala suerte, perdí mi vuelo.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my” when it is obvious whose thing it is.')
where id = 'a12fbffc-5674-51c6-8fa7-cf54a7863517' and es = 'Perdí el vuelo, qué mala suerte.' and en = 'I missed my flight. Such bad luck.'
  and not (es_alt && array['Perdí mi vuelo, qué mala suerte.', 'Qué mala suerte, perdí mi vuelo.']::text[]);

update public.sentences set es_alt = es_alt || array['Por lo menos tengo mi DNI.', 'Tengo mi DNI, por lo menos.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my” when it is obvious whose thing it is.')
where id = '65dd7662-1acb-5032-9954-df9c0d7efbe7' and es = 'Por lo menos tengo el DNI.' and en = 'At least I have my ID.'
  and not (es_alt && array['Por lo menos tengo mi DNI.', 'Tengo mi DNI, por lo menos.']::text[]);

update public.sentences set es_alt = es_alt || array['Qué mala suerte: perdí mi DNI y además se me venció el pasaporte.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my” when it is obvious whose thing it is.')
where id = 'c560fdad-f516-54e0-b9b8-34383a328400' and es = 'Qué mala suerte: perdí el DNI y además se me venció el pasaporte.' and en = 'What bad luck: I lost my DNI and besides, my passport expired.'
  and not (es_alt && array['Qué mala suerte: perdí mi DNI y además se me venció el pasaporte.']::text[]);

update public.sentences set es_alt = es_alt || array['Sin mi celu, estaba perdido.', 'Sin mi celu, estaba perdida.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” where English says “my” when it is obvious whose thing it is.')
where id = '8213e198-2541-51ee-aa9c-b4ad9bafc436' and es = 'Sin el celu, estaba perdido.' and en = 'Without my phone, I was lost.'
  and not (es_alt && array['Sin mi celu, estaba perdido.', 'Sin mi celu, estaba perdida.']::text[]);

update public.sentences set es_alt = es_alt || array['Vos estudiás, pero yo laburo.']::text[], note_en = coalesce(note_en, '“En cambio” sets two things against each other, like “whereas”. A plain “pero” works too.')
where id = '54ba73e5-be46-5026-b7bb-95c48f50f0f5' and es = 'Vos estudiás; yo, en cambio, laburo.' and en = 'You study, but I work.'
  and not (es_alt && array['Vos estudiás, pero yo laburo.']::text[]);

update public.sentences set es_alt = es_alt || array['Bueno, a ver, tenés razón en eso.', 'Bueno, a ver, en eso tenés razón.']::text[], note_en = coalesce(note_en, '“Te doy la razón” is how you concede a point: roughly “I grant that you''re right”. “Tenés razón” says nearly the same thing.')
where id = '12cf79e7-bbc9-5c5b-a956-b980a0bce5b8' and es = 'Bueno, a ver, te doy la razón en eso.' and en = 'Well, let''s see, you''re right about that.'
  and not (es_alt && array['Bueno, a ver, tenés razón en eso.', 'Bueno, a ver, en eso tenés razón.']::text[]);

update public.sentences set es_alt = es_alt || array['Bueno, tenés razón.']::text[], note_en = coalesce(note_en, '“Te doy la razón” is how you concede a point: roughly “I grant that you''re right”. “Tenés razón” says nearly the same thing.')
where id = '06b82bfa-c1db-535e-863b-953327398677' and es = 'Bueno, te doy la razón.' and en = 'OK, you''re right.'
  and not (es_alt && array['Bueno, tenés razón.']::text[]);

update public.sentences set es_alt = es_alt || array['En eso tenés razón.', 'Tenés razón en eso.']::text[], note_en = coalesce(note_en, '“Te doy la razón” is how you concede a point: roughly “I grant that you''re right”. “Tenés razón” says nearly the same thing.')
where id = '3072b36d-32bb-502b-9176-29de9c4fb06d' and es = 'En eso te doy la razón.' and en = 'You''re right about that.'
  and not (es_alt && array['En eso tenés razón.', 'Tenés razón en eso.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy de acuerdo con vos en todo, menos en eso.', 'Coincido con vos en todo, menos en eso.']::text[], note_en = coalesce(note_en, '“Te doy la razón” is how you concede a point to someone: roughly “I grant that you''re right”.')
where id = '5f168edc-0013-5051-a278-318c1b03eaf9' and es = 'Te doy la razón en todo, menos en eso.' and en = 'I agree with you on everything except that.'
  and not (es_alt && array['Estoy de acuerdo con vos en todo, menos en eso.', 'Coincido con vos en todo, menos en eso.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenés razón, pero igual voy.']::text[], note_en = coalesce(note_en, '“Te doy la razón” is a way of conceding: literally “I give you the reason”, meaning “I admit you''re right”. “Tenés razón” works too.')
where id = '117216ff-e4e9-5fc0-bec2-5ad8a54952d5' and es = 'Te doy la razón, pero igual voy.' and en = 'You''re right, but I''m going anyway.'
  and not (es_alt && array['Tenés razón, pero igual voy.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenés razón, pero ojo con lo que decís.']::text[], note_en = coalesce(note_en, '“Te doy la razón” is a way of conceding: literally “I give you the reason”, meaning “I admit you''re right”. “Tenés razón” works too.')
where id = '5e5e426b-baf5-5f57-aa88-fdb7bb807cba' and es = 'Te doy la razón, pero ojo con lo que decís.' and en = 'You''re right, but be careful with what you say.'
  and not (es_alt && array['Tenés razón, pero ojo con lo que decís.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Qué exagerada sos!']::text[]
where id = 'c0b6e9b2-23e6-5bed-ad6c-6358eb1c56ba' and es = '¡Qué exagerado sos!' and en = 'You''re so dramatic!'
  and not (es_alt && array['¡Qué exagerada sos!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dos horas de fila? ¡Exagerada!']::text[], note_en = coalesce(note_en, 'In Spanish it''s very common to just call the person “¡Exagerado!” instead of saying “you''re exaggerating”.')
where id = '406501f8-c3cf-5e1b-bc30-eefcc7892ce2' and es = '¿Dos horas de fila? ¡Exagerado!' and en = 'Two hours in line? You''re exaggerating!'
  and not (es_alt && array['¿Dos horas de fila? ¡Exagerada!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Exagerado? Me dolió un montón.']::text[]
where id = '181496c0-15ee-54e2-bcf3-16b6ae725018' and es = '¿Exagerada? Me dolió un montón.' and en = 'Dramatic? It hurt a lot!'
  and not (es_alt && array['¿Exagerado? Me dolió un montón.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Estás de mi lado o no?']::text[]
where id = '6ebb2373-9816-5469-b2df-58345fdf63c5' and es = '¿Me defendés o no?' and en = 'Are you on my side or not?'
  and not (es_alt && array['¿Estás de mi lado o no?']::text[]);

update public.sentences set es_alt = es_alt || array['Anoche Diego y yo discutimos hasta tarde.', 'Diego y yo discutimos hasta tarde anoche.']::text[], note_en = coalesce(note_en, 'Argentines often say “discutimos con Diego” to mean “Diego and I argued”: the “we” already includes the speaker.')
where id = 'a67ec330-c1b6-5224-aadd-ac08f1f7c6b8' and es = 'Anoche discutimos hasta tarde con Diego.' and en = 'Diego and I argued until late last night.'
  and not (es_alt && array['Anoche Diego y yo discutimos hasta tarde.', 'Diego y yo discutimos hasta tarde anoche.']::text[]);

update public.sentences set es_alt = es_alt || array['Depende de tu punto de vista.']::text[]
where id = 'c7a4e04d-8842-5561-94a2-b329b5842008' and es = 'Depende del punto de vista.' and en = 'It depends on your point of view.'
  and not (es_alt && array['Depende de tu punto de vista.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuelo es re cabeza dura.', 'Mi abuelo es tan cabeza dura.']::text[], note_en = coalesce(note_en, 'Argentines often call someone “un cabeza dura”, a hard-head, rather than describing them as stubborn.')
where id = '3db099fe-7bd8-5c67-8d56-8691975be288' and es = 'Mi abuelo es un cabeza dura.' and en = 'My grandpa is so stubborn.'
  and not (es_alt && array['Mi abuelo es re cabeza dura.', 'Mi abuelo es tan cabeza dura.']::text[]);

update public.sentences set es_alt = es_alt || array['Mica, sos re exagerada.', 'Mica, sos tan exagerada.']::text[], note_en = coalesce(note_en, 'Saying “sos una exagerada” turns the adjective into a label, which is a very common way to tease someone.')
where id = 'ed57bb03-57a5-5f03-8840-bfd34e4426c1' and es = 'Mica, sos una exagerada.' and en = 'Mica, you''re so dramatic.'
  and not (es_alt && array['Mica, sos re exagerada.', 'Mica, sos tan exagerada.']::text[]);

update public.sentences set es_alt = es_alt || array['No es para tanto, no seas tan exagerada.', 'No es para tanto, no seas exagerada.', 'No es para tanto, no seas tan exagerado.', 'No es para tanto, exagerado.']::text[], note_en = coalesce(note_en, 'Spanish speakers often just tack “exagerada” on the end, calling the person dramatic instead of telling them not to be.')
where id = '263f46f3-fda0-5b4d-882e-f483e500da6a' and es = 'No es para tanto, exagerada.' and en = 'It''s not that big a deal, don''t be so dramatic.'
  and not (es_alt && array['No es para tanto, no seas tan exagerada.', 'No es para tanto, no seas exagerada.', 'No es para tanto, no seas tan exagerado.', 'No es para tanto, exagerado.']::text[]);

update public.sentences set es_alt = es_alt || array['No seas tan exagerado.', 'No seas tan exagerada.']::text[]
where id = '0919ae44-cbf2-58b0-a0e2-7dbaa600f09b' and es = 'No seas exagerado.' and en = 'Don''t be so dramatic.'
  and not (es_alt && array['No seas tan exagerado.', 'No seas tan exagerada.']::text[]);

update public.sentences set es_alt = es_alt || array['Sos re cabeza dura.', 'Sos tan cabeza dura.', 'Sos una cabeza dura.']::text[], note_en = coalesce(note_en, 'Argentines often call someone “un cabeza dura”, a hard-head, rather than describing them as stubborn.')
where id = '5bf1e16a-3540-569e-9190-8cf79618e74c' and es = 'Sos un cabeza dura.' and en = 'You''re so stubborn.'
  and not (es_alt && array['Sos re cabeza dura.', 'Sos tan cabeza dura.', 'Sos una cabeza dura.']::text[]);

update public.sentences set es_alt = es_alt || array['¿El dueño acepta mascotas?']::text[]
where id = '8f408655-c257-52fc-b7e8-2cd857778a36' and es = '¿La dueña acepta mascotas?' and en = 'Does the landlord allow pets?'
  and not (es_alt && array['¿El dueño acepta mascotas?']::text[]);

update public.sentences set es_alt = es_alt || array['El dueño acepta efectivo.']::text[]
where id = '0c494913-aeeb-5b59-b39e-e34260638be5' and es = 'La dueña acepta efectivo.' and en = 'The landlord accepts cash.'
  and not (es_alt && array['El dueño acepta efectivo.']::text[]);

update public.sentences set es_alt = es_alt || array['El dueño dijo que el contrato es por dos años.']::text[]
where id = '45577097-7376-5d8c-ab90-1e204a731215' and es = 'La dueña dijo que el contrato es por dos años.' and en = 'The landlord said the lease is for two years.'
  and not (es_alt && array['El dueño dijo que el contrato es por dos años.']::text[]);

update public.sentences set es_alt = es_alt || array['No tengo garantía, pero sí tengo un seguro de caución.', 'No tengo garantía, pero tengo un seguro de caución.']::text[], note_en = coalesce(note_en, 'Spanish can skip the repeated verb here: “pero sí” on its own already means “but I do have”.')
where id = '69dd667e-eb64-5902-8350-6cf9ce26ca44' and es = 'No tengo garantía, pero sí un seguro de caución.' and en = 'I don''t have a guarantor, but I do have rent guarantee insurance.'
  and not (es_alt && array['No tengo garantía, pero sí tengo un seguro de caución.', 'No tengo garantía, pero tengo un seguro de caución.']::text[]);

update public.sentences set es_alt = es_alt || array['Si el dueño acepta mascotas, alquilo el depto.', 'Alquilo el depto si el dueño acepta mascotas.']::text[]
where id = 'c9026b33-7647-53cd-a946-5d259a039f99' and es = 'Si la dueña acepta mascotas, alquilo el depto.' and en = 'If the landlord allows pets, I''ll rent the apartment.'
  and not (es_alt && array['Si el dueño acepta mascotas, alquilo el depto.', 'Alquilo el depto si el dueño acepta mascotas.']::text[]);

update public.sentences set es_alt = es_alt || array['¿No hay ningún vecino que tenga un taladro?']::text[]
where id = 'e250f6fc-6763-581a-8bd3-4928e67bb397' and es = '¿No hay ninguna vecina que tenga un taladro?' and en = 'Isn''t there a single neighbor who has a drill?'
  and not (es_alt && array['¿No hay ningún vecino que tenga un taladro?']::text[]);

update public.sentences set es_alt = es_alt || array['¿No tenés ningún amigo que sepa cocinar?']::text[]
where id = 'd43f78be-d72e-5c6d-a02f-661b81992180' and es = '¿No tenés ninguna amiga que sepa cocinar?' and en = 'Don''t you have a single friend who knows how to cook?'
  and not (es_alt && array['¿No tenés ningún amigo que sepa cocinar?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés algún amigo que sepa de plantas?']::text[]
where id = 'b7f434bd-d13d-59ca-9e98-93c586392428' and es = '¿Tenés alguna amiga que sepa de plantas?' and en = 'Do you have a friend who knows about plants?'
  and not (es_alt && array['¿Tenés algún amigo que sepa de plantas?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés algún amigo soltero?']::text[]
where id = '48bef2ba-cf4a-55a0-8fa7-8ccf611c0057' and es = '¿Tenés alguna amiga soltera?' and en = 'Do you have a friend who''s single?'
  and not (es_alt && array['¿Tenés algún amigo soltero?']::text[]);

update public.sentences set es_alt = es_alt || array['Busco un contador ordenado que no cobre tanto.']::text[]
where id = 'e27f46d2-546b-5da6-b299-92f1d698e0fc' and es = 'Busco una contadora ordenada que no cobre tanto.' and en = 'I''m looking for an organized accountant who doesn''t charge so much.'
  and not (es_alt && array['Busco un contador ordenado que no cobre tanto.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuela necesita un médico que hable despacio.']::text[]
where id = '5fbbc7c0-7be1-577e-a4ac-f3122c85ded2' and es = 'Mi abuela necesita una médica que hable despacio.' and en = 'My grandmother needs a doctor who speaks slowly.'
  and not (es_alt && array['Mi abuela necesita un médico que hable despacio.']::text[]);

update public.sentences set es_alt = es_alt || array['Me da bronca que el profe no avise antes.']::text[]
where id = 'ccaa56a0-f3e7-51bc-96f5-5de4a24def1f' and es = 'Me da bronca que la profe no avise antes.' and en = 'It makes me mad that the teacher doesn''t let us know beforehand.'
  and not (es_alt && array['Me da bronca que el profe no avise antes.']::text[]);

update public.sentences set es_alt = es_alt || array['No quiero que me vean enferma.']::text[]
where id = '58c57c16-0c9e-5739-a6d5-19087bad5ac5' and es = 'No quiero que me vean enfermo.' and en = 'I don''t want them to see me sick.'
  and not (es_alt && array['No quiero que me vean enferma.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Qué colgada que sos!', '¡Qué colgada sos!', 'Sos re colgado.', 'Sos re colgada.']::text[]
where id = '95bc98f6-e93b-5115-9b74-0eb2410c4c60' and es = '¡Qué colgado que sos!' and en = 'You''re so forgetful!'
  and not (es_alt && array['¡Qué colgada que sos!', '¡Qué colgada sos!', 'Sos re colgado.', 'Sos re colgada.']::text[]);

update public.sentences set es_alt = es_alt || array['Ana me clavó el visto, ¿creés que está enojada?', 'Ana me clavó el visto, ¿te parece que está enojada?']::text[], note_en = coalesce(note_en, 'The future tense is used here to wonder out loud: “¿estará enojada?” means “I wonder if she''s angry”, with no need for “do you think”.')
where id = 'a99cdb5f-2712-50df-addc-0be9089a65e6' and es = 'Ana me clavó el visto, ¿estará enojada?' and en = 'Ana read my message and didn''t answer, do you think she''s angry?'
  and not (es_alt && array['Ana me clavó el visto, ¿creés que está enojada?', 'Ana me clavó el visto, ¿te parece que está enojada?']::text[]);

update public.sentences set es_alt = es_alt || array['El examen me pone nervioso.']::text[]
where id = '040cf2c9-ce83-506d-aa2f-9ad7b8296a1c' and es = 'El examen me pone nerviosa.' and en = 'The exam is making me nervous.'
  and not (es_alt && array['El examen me pone nervioso.']::text[]);

update public.sentences set es_alt = es_alt || array['Manejar de noche me pone nervioso.', 'Me pone nervioso manejar de noche.']::text[]
where id = '5d6831b0-e496-562a-8d4e-a536f8aac0cc' and es = 'Manejar de noche me pone nerviosa.' and en = 'Driving at night makes me nervous.'
  and not (es_alt && array['Manejar de noche me pone nervioso.', 'Me pone nervioso manejar de noche.']::text[]);

update public.sentences set es_alt = es_alt || array['Me alegra que Cami y vos sean amigos otra vez.', 'Me alegra que vos y Cami sean amigos otra vez.']::text[]
where id = '70679dca-429d-5095-8d89-c39a88347c73' and es = 'Me alegra que Cami y vos sean amigas otra vez.' and en = 'I am happy that you and Cami are friends again.'
  and not (es_alt && array['Me alegra que Cami y vos sean amigos otra vez.', 'Me alegra que vos y Cami sean amigos otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Me dan celos tus amigos.', 'Tus amigos me dan celos.']::text[]
where id = 'aa94d576-f223-5595-976e-8b0e89e84c8e' and es = 'Me dan celos tus amigas.' and en = 'Your friends make me jealous.'
  and not (es_alt && array['Me dan celos tus amigos.', 'Tus amigos me dan celos.']::text[]);

update public.sentences set es_alt = es_alt || array['Me enoja que mi compañero llegue tarde y el jefe no vea nada.']::text[]
where id = '4c1db43e-809f-51cf-a665-904e3a40b588' and es = 'Me enoja que mi compañera llegue tarde y el jefe no vea nada.' and en = 'It makes me angry that my coworker gets in late and the boss does not see anything.'
  and not (es_alt && array['Me enoja que mi compañero llegue tarde y el jefe no vea nada.']::text[]);

update public.sentences set es_alt = es_alt || array['Me molesta que el profe cancele tanto.']::text[]
where id = 'bf681c10-8e29-592a-aa97-292ff4b77242' and es = 'Me molesta que la profe cancele tanto.' and en = 'It bothers me that the teacher cancels so much.'
  and not (es_alt && array['Me molesta que el profe cancele tanto.']::text[]);

update public.sentences set es_alt = es_alt || array['Me pone contenta que mi hermano por fin tenga laburo en blanco.', 'Me pone contenta que por fin mi hermano tenga laburo en blanco.']::text[]
where id = 'cb457e2f-4d72-5e5a-b474-9210894968be' and es = 'Me pone contento que mi hermano por fin tenga laburo en blanco.' and en = 'It makes me happy that my brother finally has a job on the books.'
  and not (es_alt && array['Me pone contenta que mi hermano por fin tenga laburo en blanco.', 'Me pone contenta que por fin mi hermano tenga laburo en blanco.']::text[]);

update public.sentences set es_alt = es_alt || array['Me pone nervioso que todo sea a último momento.']::text[]
where id = '405ff1f2-cc6c-55f0-9b6f-51e30a9079fc' and es = 'Me pone nerviosa que todo sea a último momento.' and en = 'It makes me nervous that it''s all last minute.'
  and not (es_alt && array['Me pone nervioso que todo sea a último momento.']::text[]);

update public.sentences set es_alt = es_alt || array['Uy, qué colgado, me olvidé.', 'Uy, me olvidé, qué colgado.']::text[]
where id = '9a62f693-eab8-5800-af27-72535a26bddc' and es = 'Uy, qué colgada, me olvidé.' and en = 'Oops, I''m so forgetful, I forgot.'
  and not (es_alt && array['Uy, qué colgado, me olvidé.', 'Uy, me olvidé, qué colgado.']::text[]);

update public.sentences set es_alt = es_alt || array['Tendrías que hablar con tu jefe: laburás todos los domingos.']::text[]
where id = 'de342c55-80d8-5508-92d8-df52e1e41652' and es = 'Tendrías que hablar con tu jefa: laburás todos los domingos.' and en = 'You should talk to your boss: you work every Sunday.'
  and not (es_alt && array['Tendrías que hablar con tu jefe: laburás todos los domingos.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Quemada? Obvio, hace un año que no te tomás vacaciones.', '¿Quemada? Y, obvio, hace un año que no te tomás vacaciones.']::text[]
where id = '2798f3d2-8b26-5545-8020-a5fb0aef9b0e' and es = '¿Quemado? Y, obvio, hace un año que no te tomás vacaciones.' and en = 'Burned out? Of course, you haven''t taken a vacation in a year.'
  and not (es_alt && array['¿Quemada? Obvio, hace un año que no te tomás vacaciones.', '¿Quemada? Y, obvio, hace un año que no te tomás vacaciones.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tu jefe quiere que te tomes las vacaciones en julio?']::text[]
where id = '2073fe2a-9572-50d2-ab06-0923fca2eec7' and es = '¿Tu jefa quiere que te tomes las vacaciones en julio?' and en = 'Does your boss want you to take your vacation in July?'
  and not (es_alt && array['¿Tu jefe quiere que te tomes las vacaciones en julio?']::text[]);

update public.sentences set es_alt = es_alt || array['Si seguís así, vas a terminar quemado.', 'Vas a terminar quemado si seguís así.']::text[]
where id = '30d4a6ba-0fa5-5157-9dd1-78210fb58479' and es = 'Si seguís así, vas a terminar quemada.' and en = 'If you keep this up, you''re going to end up burned out.'
  and not (es_alt && array['Si seguís así, vas a terminar quemado.', 'Vas a terminar quemado si seguís así.']::text[]);

update public.sentences set es_alt = es_alt || array['Te veo estresado, ¿querés un mate?']::text[]
where id = '0ed5d038-460e-5177-9f97-b583c20a9da7' and es = 'Te veo estresada, ¿querés un mate?' and en = 'You look stressed, want some mate?'
  and not (es_alt && array['Te veo estresado, ¿querés un mate?']::text[]);

update public.sentences set es_alt = es_alt || array['Te veo quemada, ¿por qué no te tomás el viernes?']::text[]
where id = '40996b60-90e8-547d-9d36-4c813719b426' and es = 'Te veo quemado, ¿por qué no te tomás el viernes?' and en = 'You look burned out, why don''t you take Friday off?'
  and not (es_alt && array['Te veo quemada, ¿por qué no te tomás el viernes?']::text[]);

update public.sentences set es_alt = es_alt || array['Gracias por ser sincera conmigo.']::text[]
where id = '4b8e850b-e368-5464-bef4-729faefff126' and es = 'Gracias por ser sincero conmigo.' and en = 'Thanks for being honest with me.'
  and not (es_alt && array['Gracias por ser sincera conmigo.']::text[]);

update public.sentences set es_alt = es_alt || array['Hacé lo que dice el médico.']::text[], note_en = coalesce(note_en, '“Hacerle caso a alguien” is the everyday way to say you follow someone''s advice or do as they say.')
where id = '59380328-f6c4-5fa4-8cfc-8fcebc3c55b5' and es = 'Hacele caso al médico.' and en = 'Do what the doctor says.'
  and not (es_alt && array['Hacé lo que dice el médico.']::text[]);

update public.sentences set es_alt = es_alt || array['Para ser sincero, estás muy estresada.', 'Para ser sincero, estás muy estresado.']::text[]
where id = '025d59ae-cb70-5fe3-8c54-aceabd842913' and es = 'Para ser sincera, estás muy estresada.' and en = 'To be honest, you''re very stressed.'
  and not (es_alt && array['Para ser sincero, estás muy estresada.', 'Para ser sincero, estás muy estresado.']::text[]);

update public.sentences set es_alt = es_alt || array['Sé sincera conmigo.']::text[]
where id = '8beb9e00-9fd2-53c1-919b-4e11554ed169' and es = 'Sé sincero conmigo.' and en = 'Be honest with me.'
  and not (es_alt && array['Sé sincera conmigo.']::text[]);

update public.sentences set es_alt = es_alt || array['Si querés que sea sincera, estás re quemada.', 'Si querés que sea sincera, estás re quemado.']::text[]
where id = '74a45b05-4b8a-5f44-b587-270a6882d5cc' and es = 'Si querés que sea sincero, estás re quemada.' and en = 'If you want me to be honest, you''re totally burned out.'
  and not (es_alt && array['Si querés que sea sincera, estás re quemada.', 'Si querés que sea sincera, estás re quemado.']::text[]);

update public.sentences set es_alt = es_alt || array['Si venís conmigo, lo hago.', 'Lo hago si venís conmigo.']::text[], note_en = coalesce(note_en, '“Animarse” means working up the nerve to do something, so “me animo” is “I''ll dare to do it”.')
where id = 'f4187cf4-e3e2-50fd-b576-48658724256d' and es = 'Si venís conmigo, me animo.' and en = 'If you come with me, I''ll do it.'
  and not (es_alt && array['Si venís conmigo, lo hago.', 'Lo hago si venís conmigo.']::text[]);

update public.sentences set es_alt = es_alt || array['Solo no me animo, ¿me acompañás?']::text[], note_en = coalesce(note_en, '“No me animo” means “I don''t dare” or “I don''t have the nerve”: a softer way of saying you can''t face doing it alone.')
where id = 'f70d3e64-a947-58c0-a186-814f071ca4f4' and es = 'Sola no me animo, ¿me acompañás?' and en = 'I can''t do it alone, will you come with me?'
  and not (es_alt && array['Solo no me animo, ¿me acompañás?']::text[]);

update public.sentences set es_alt = es_alt || array['Después de los exámenes estaba quemada.']::text[]
where id = '42141d73-cdfb-59e6-a144-4f9806fbaab3' and es = 'Después de los exámenes estaba quemado.' and en = 'After the exams, I was burned out.'
  and not (es_alt && array['Después de los exámenes estaba quemada.']::text[]);

update public.sentences set es_alt = es_alt || array['El tránsito me pone nerviosa.', 'Me pone nerviosa el tránsito.']::text[]
where id = 'f2ad78c6-28e8-5158-a7ed-1e36948ece0d' and es = 'El tránsito me pone nervioso.' and en = 'Traffic stresses me out.'
  and not (es_alt && array['El tránsito me pone nerviosa.', 'Me pone nerviosa el tránsito.']::text[]);

update public.sentences set es_alt = es_alt || array['Le dejé las llaves a Sofi porque confío en ella.', 'A Sofi le dejé las llaves porque confío en ella.']::text[], note_en = coalesce(note_en, '“Ser de confianza” is the everyday way to say someone can be trusted.')
where id = '027c864f-d4c6-5697-acbb-06f2a9aaed71' and es = 'Le dejé las llaves a Sofi porque es de confianza.' and en = 'I left the keys with Sofi because I trust her.'
  and not (es_alt && array['Le dejé las llaves a Sofi porque confío en ella.', 'A Sofi le dejé las llaves porque confío en ella.']::text[]);

update public.sentences set es_alt = es_alt || array['Me pone celoso que hable tanto con su ex.']::text[]
where id = '2b4c7b7b-6ca9-5b51-8944-f46f6958221c' and es = 'Me pone celosa que hable tanto con su ex.' and en = 'It makes me jealous that he talks to his ex so much.'
  and not (es_alt && array['Me pone celoso que hable tanto con su ex.']::text[]);

update public.sentences set es_alt = es_alt || array['Me pone contento que por fin tengas a alguien que te ayude.']::text[]
where id = '3521a5ad-cbe6-5add-91af-234819710d1f' and es = 'Me pone contenta que por fin tengas a alguien que te ayude.' and en = 'It makes me happy that you finally have someone who helps you.'
  and not (es_alt && array['Me pone contento que por fin tengas a alguien que te ayude.']::text[]);

update public.sentences set es_alt = es_alt || array['Me pone contento que vengas.']::text[]
where id = '4fc4888d-8f31-5c9a-881c-152689c52c0f' and es = 'Me pone contenta que vengas.' and en = 'I''m happy you''re coming.'
  and not (es_alt && array['Me pone contento que vengas.']::text[]);

update public.sentences set es_alt = es_alt || array['Me pone nerviosa que en la oficina no haya nadie que sepa inglés.', 'Me pone nerviosa que no haya nadie en la oficina que sepa inglés.']::text[]
where id = '16ef0297-130e-5b24-9ca4-1f6eabfe1338' and es = 'Me pone nervioso que en la oficina no haya nadie que sepa inglés.' and en = 'It makes me nervous that there is nobody at the office who knows English.'
  and not (es_alt && array['Me pone nerviosa que en la oficina no haya nadie que sepa inglés.', 'Me pone nerviosa que no haya nadie en la oficina que sepa inglés.']::text[]);

update public.sentences set es_alt = es_alt || array['Me pone re nerviosa hablar con mi jefe.', 'Hablar con mi jefe me pone re nerviosa.']::text[]
where id = '42d2fa39-3f60-5be5-a8e5-ac19ad6161c4' and es = 'Me pone re nervioso hablar con mi jefe.' and en = 'Talking to my boss makes me really nervous.'
  and not (es_alt && array['Me pone re nerviosa hablar con mi jefe.', 'Hablar con mi jefe me pone re nerviosa.']::text[]);

update public.sentences set es_alt = es_alt || array['Si llegamos un poco tarde, me da igual.']::text[]
where id = '93a686c2-9da4-5773-b7c3-6f5b0e704439' and es = 'Si llegamos un rato tarde, me da igual.' and en = 'If we get there a little late, I don''t care.'
  and not (es_alt && array['Si llegamos un poco tarde, me da igual.']::text[]);

update public.sentences set es_alt = es_alt || array['Si necesitás un favor, avisame.']::text[], note_en = coalesce(note_en, '“Algún favor” is closer to “any favor at all”; it sounds a bit more open than “un favor”.')
where id = '34103286-ac40-55fb-b7da-988ad807dc8b' and es = 'Si necesitás algún favor, avisame.' and en = 'If you need a favor, let me know.'
  and not (es_alt && array['Si necesitás un favor, avisame.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana vengo, lo prometo.']::text[], note_en = coalesce(note_en, 'Spanish usually says who the promise is for: “te lo prometo” is literally “I promise it to you”.')
where id = 'adaee2f0-bddd-59d1-bd63-2c8e4a534303' and es = 'Mañana vengo, te lo prometo.' and en = 'I''ll come tomorrow, I promise.'
  and not (es_alt && array['Mañana vengo, lo prometo.']::text[]);

update public.sentences set es_alt = es_alt || array['Lo prometo.']::text[], note_en = coalesce(note_en, 'Spanish usually says who the promise is for: “te lo prometo” is literally “I promise it to you”.')
where id = '1638d86b-bd37-5800-95c1-29e2df02c06a' and es = 'Te lo prometo.' and en = 'I promise.'
  and not (es_alt && array['Lo prometo.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Otra vez te dio una excusa el plomero?']::text[], note_en = coalesce(note_en, 'Argentines often say “poner una excusa” (literally “to put an excuse”); “dar una excusa” works too.')
where id = '1ec8a594-096e-522f-8781-c3663644cd71' and es = '¿Otra vez te puso una excusa el plomero?' and en = 'Did the plumber give you an excuse again?'
  and not (es_alt && array['¿Otra vez te dio una excusa el plomero?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué excusa te dio?']::text[], note_en = coalesce(note_en, 'Argentines often say “poner una excusa” (literally “to put an excuse”); “dar una excusa” works too.')
where id = 'efc62f84-0c09-5eb5-9a53-c03d8ab66667' and es = '¿Qué excusa te puso?' and en = 'What excuse did he give you?'
  and not (es_alt && array['¿Qué excusa te dio?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te dio otra excusa? Es una mentirosa.']::text[], note_en = coalesce(note_en, 'Argentines often say “poner una excusa” (literally “to put an excuse”); “dar una excusa” works too.')
where id = 'a0f4011b-573b-524c-9c73-a73194cadb4a' and es = '¿Te puso otra excusa? Es una mentirosa.' and en = 'She gave you another excuse? She''s a liar.'
  and not (es_alt && array['¿Te dio otra excusa? Es una mentirosa.']::text[]);

update public.sentences set es_alt = es_alt || array['Dijo que iba a pasar y después me dio una excusa.']::text[], note_en = coalesce(note_en, 'Argentines often say “poner una excusa” (literally “to put an excuse”); “dar una excusa” works too.')
where id = '5ed27363-18e0-5684-bd50-7ab11054cdb4' and es = 'Dijo que iba a pasar y después me puso una excusa.' and en = 'He said he''d come by, and then he gave me an excuse.'
  and not (es_alt && array['Dijo que iba a pasar y después me dio una excusa.']::text[]);

update public.sentences set es_alt = es_alt || array['El técnico me dio otra excusa.']::text[], note_en = coalesce(note_en, 'Argentines often say “poner una excusa” (literally “to put an excuse”); “dar una excusa” works too.')
where id = '2ddf6eac-7caa-5d56-a0aa-eb57d9b89409' and es = 'El técnico me puso otra excusa.' and en = 'The technician gave me another excuse.'
  and not (es_alt && array['El técnico me dio otra excusa.']::text[]);

update public.sentences set es_alt = es_alt || array['Me dio una excusa.']::text[], note_en = coalesce(note_en, 'Argentines often say “poner una excusa” (literally “to put an excuse”); “dar una excusa” works too.')
where id = '25fddbf5-2384-52f2-ac18-7d0b75db1dee' and es = 'Me puso una excusa.' and en = 'He gave me an excuse.'
  and not (es_alt && array['Me dio una excusa.']::text[]);

update public.sentences set es_alt = es_alt || array['Mandé un mail y no recibí respuesta.']::text[], note_en = coalesce(note_en, '“Cero respuesta” is a casual, punchy way to say you heard nothing back.')
where id = 'd2cf7b20-d9de-5b8a-a75e-953bf2c4bec2' and es = 'Mandé un mail y cero respuesta.' and en = 'I sent an email and got no reply.'
  and not (es_alt && array['Mandé un mail y no recibí respuesta.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuidado con Pablo, es medio mentiroso.']::text[], note_en = coalesce(note_en, '“Ojo” (literally “eye”) is the everyday Argentine way to say “careful” or “watch out”.')
where id = '5eafa184-3bb7-52f7-9a67-f83bcb813e85' and es = 'Ojo con Pablo, es medio mentiroso.' and en = 'Watch out for Pablo, he''s kind of a liar.'
  and not (es_alt && array['Cuidado con Pablo, es medio mentiroso.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Es mucho pedir que me prestes tu auto?']::text[], note_en = coalesce(note_en, 'Spanish often says “el auto” where English says “your car”, because it is already clear whose it is.')
where id = 'ce2137e3-f745-5f5a-8411-b46572604f6a' and es = '¿Es mucho pedir que me prestes el auto?' and en = 'Is it too much to ask to borrow your car?'
  and not (es_alt && array['¿Es mucho pedir que me prestes tu auto?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Querés que te preste mi campera?']::text[], note_en = coalesce(note_en, 'Spanish often says “la campera” where English says “my jacket”, because it is already clear whose it is.')
where id = '836d87d8-45b2-5ad0-a5cc-f2b3cf36dd9d' and es = '¿Querés que te preste la campera?' and en = 'Do you want to borrow my jacket?'
  and not (es_alt && array['¿Querés que te preste mi campera?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Comiste el paquete entero?']::text[], note_en = coalesce(note_en, 'The extra “te” in “te comiste” stresses that you ate the whole thing up; it is very common with eating and drinking.')
where id = '05640111-d01b-5817-9056-cb4fc0d2576c' and es = '¿Te comiste el paquete entero?' and en = 'Did you eat the whole pack?'
  and not (es_alt && array['¿Comiste el paquete entero?']::text[]);

update public.sentences set es_alt = es_alt || array['Ojo, no lo rompas.']::text[]
where id = '233dedf5-e91e-5d09-81e8-58295109d2a1' and es = 'Cuidado, no lo rompas.' and en = 'Careful, don''t break it.'
  and not (es_alt && array['Ojo, no lo rompas.']::text[]);

update public.sentences set es_alt = es_alt || array['Leí la carta entera y no sé qué pedir.', 'Leí toda la carta y no sé qué pedir.']::text[], note_en = coalesce(note_en, 'The extra “me” in “me leí” stresses that you read the whole thing, start to finish.')
where id = 'd324de10-e6d6-5031-b900-d3da592461d5' and es = 'Me leí la carta entera y no sé qué pedir.' and en = 'I read the whole menu and I don''t know what to order.'
  and not (es_alt && array['Leí la carta entera y no sé qué pedir.', 'Leí toda la carta y no sé qué pedir.']::text[]);

update public.sentences set es_alt = es_alt || array['No creo que Martín te preste su auto.']::text[], note_en = coalesce(note_en, 'Spanish often says “el auto” where English says “his car”, because it is already clear whose it is.')
where id = 'fddd1de9-2ab7-52a2-be28-b53ad212a78e' and es = 'No creo que Martín te preste el auto.' and en = 'I don''t think Martín will lend you his car.'
  and not (es_alt && array['No creo que Martín te preste su auto.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuidado, no manejes rápido.']::text[], note_en = coalesce(note_en, '“Ojo” (literally “eye”) is the everyday Argentine way to say “careful”.')
where id = '4cb8206d-554d-5a91-9b61-6f083aa73c09' and es = 'Ojo, no manejes rápido.' and en = 'Careful, don''t drive fast.'
  and not (es_alt && array['Cuidado, no manejes rápido.']::text[]);

update public.sentences set es_alt = es_alt || array['Pará a cargar, el tanque está casi vacío.', 'Pará a cargar nafta, el tanque está casi vacío.']::text[]
where id = '0a0f0bc6-acc6-5a23-a5e1-3d670ab5cd38' and es = 'Pará a cargar, el tanque está casi en cero.' and en = 'Stop for gas, the tank''s almost empty.'
  and not (es_alt && array['Pará a cargar, el tanque está casi vacío.', 'Pará a cargar nafta, el tanque está casi vacío.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Acá hacen llaves?']::text[], note_en = coalesce(note_en, 'Shops and signs often use the impersonal “se”: “se hacen llaves” is literally “keys are made”.')
where id = 'c557dd71-04bf-5d5e-86b6-ff077f3a4381' and es = '¿Acá se hacen llaves?' and en = 'Do you cut keys here?'
  and not (es_alt && array['¿Acá hacen llaves?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Sabés si ese restaurante acepta tarjetas?']::text[], note_en = coalesce(note_en, 'Shops and signs often use the impersonal “se”: “se aceptan tarjetas” is literally “cards are accepted”.')
where id = '5c85aefe-5ac6-54dc-940f-7b4f7198d2df' and es = '¿Sabés si en ese restaurante se aceptan tarjetas?' and en = 'Do you know if that restaurant takes cards?'
  and not (es_alt && array['¿Sabés si ese restaurante acepta tarjetas?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Y qué excusa te dio esta vez?']::text[], note_en = coalesce(note_en, '“¿Y ahora qué…?” is a common way to say “so what is it this time?”.')
where id = 'a6c14980-b482-5adc-bde0-ae528df15a15' and es = '¿Y ahora qué excusa te dio?' and en = 'So what excuse did he give you this time?'
  and not (es_alt && array['¿Y qué excusa te dio esta vez?']::text[]);

update public.sentences set es_alt = es_alt || array['El kiosco no acepta tarjetas.']::text[], note_en = coalesce(note_en, 'Shops and signs often use the impersonal “se”: “no se aceptan tarjetas” is literally “cards are not accepted”.')
where id = '470c6a75-636a-5b6a-b4b8-68dddff33f42' and es = 'En el kiosco no se aceptan tarjetas.' and en = 'The kiosco doesn''t take cards.'
  and not (es_alt && array['El kiosco no acepta tarjetas.']::text[]);

update public.sentences set es_alt = es_alt || array['En ese local no hacen envíos, hay que ir.', 'Ese local no hace envíos, hay que ir.']::text[], note_en = coalesce(note_en, 'Shops and signs often use the impersonal “se”: “se hacen envíos” is literally “deliveries are made”.')
where id = '23a019d6-743d-5d76-b455-488b3d6ff5a8' and es = 'En ese local no se hacen envíos, hay que ir.' and en = 'That store doesn''t deliver, you have to go in person.'
  and not (es_alt && array['En ese local no hacen envíos, hay que ir.', 'Ese local no hace envíos, hay que ir.']::text[]);

update public.sentences set es_alt = es_alt || array['Llevá el auto, pero por favor no choques como la otra vez.']::text[], note_en = coalesce(note_en, '“Te pido que…” (literally “I ask you to…”) is a common way to say a firm “please”.')
where id = 'adff0ac6-9843-52ab-bb8d-94de0f6e8d33' and es = 'Llevá el auto, pero te pido que no choques como la otra vez.' and en = 'Take the car, but please don''t crash it like last time.'
  and not (es_alt && array['Llevá el auto, pero por favor no choques como la otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Hacemos envíos.']::text[], note_en = coalesce(note_en, 'Shops and signs often use the impersonal “se”: “se hacen envíos” is literally “deliveries are made”.')
where id = '133b4a57-cfc5-5105-9945-7445d3323434' and es = 'Se hacen envíos.' and en = 'We deliver.'
  and not (es_alt && array['Hacemos envíos.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Entendés algo?']::text[], note_en = coalesce(note_en, 'Argentines often use “estar + -ando/-iendo” for what is happening right now, even where English uses the simple present.')
where id = 'bcf1c293-3205-595e-b3aa-8e24ad7fb7bd' and es = '¿Estás entendiendo algo?' and en = 'Do you understand anything?'
  and not (es_alt && array['¿Entendés algo?']::text[]);

update public.sentences set es_alt = es_alt || array['No entiendo nada.']::text[], note_en = coalesce(note_en, 'Argentines often use “estar + -ando/-iendo” for what is happening right now, even where English uses the simple present.')
where id = '0111c2ce-b060-5629-b3e9-4379c7c3e8a7' and es = 'No estoy entendiendo nada.' and en = 'I don''t understand anything.'
  and not (es_alt && array['No entiendo nada.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Estás cansada? Te veo medio mal.', '¿Estás cansado? Te veo medio mal.']::text[], note_en = coalesce(note_en, 'Argentines love “andar” for how someone has been lately: “¿andás cansada?” is like “have you been tired these days?”.')
where id = '1a6b3e3a-3f46-50bb-b6ed-c03cbcff0a65' and es = '¿Andás cansada? Te veo medio mal.' and en = 'Are you tired? You look kind of off.'
  and not (es_alt && array['¿Estás cansada? Te veo medio mal.', '¿Estás cansado? Te veo medio mal.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Estás estudiando para el parcial?']::text[], note_en = coalesce(note_en, '“Andar + -ando/-iendo” is a casual Argentine way to talk about what someone is up to these days.')
where id = '2f4d89e3-a6c4-547b-8639-0674ae540b5f' and es = '¿Andás estudiando para el parcial?' and en = 'Are you studying for the midterm?'
  and not (es_alt && array['¿Estás estudiando para el parcial?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué estás haciendo por acá?', '¿Qué hacés por acá?']::text[], note_en = coalesce(note_en, '“¿Qué andás haciendo?” is a relaxed, friendly way to ask what someone is up to.')
where id = '9568e9dd-f0e9-5396-96d2-40ed76e7beb0' and es = '¿Qué andás haciendo por acá?' and en = 'What are you doing around here?'
  and not (es_alt && array['¿Qué estás haciendo por acá?', '¿Qué hacés por acá?']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy buscando un regalo para Mica, ¿alguna idea?']::text[], note_en = coalesce(note_en, '“Andar + -ando/-iendo” is a casual Argentine way to say what you have been up to lately.')
where id = '1d10412b-f1ac-56c2-84c2-c15ba7eced50' and es = 'Ando buscando un regalo para Mica, ¿alguna idea?' and en = 'I''ve been looking for a present for Mica, any ideas?'
  and not (es_alt && array['Estoy buscando un regalo para Mica, ¿alguna idea?']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy laburando mucho, por eso no te llamé.']::text[], note_en = coalesce(note_en, '“Andar + -ando/-iendo” is a casual Argentine way to say what you have been up to lately.')
where id = '0fb6f843-fa74-5190-bab7-3818f2c72f6e' and es = 'Ando laburando mucho, por eso no te llamé.' and en = 'I''ve been working a lot, that''s why I didn''t call you.'
  and not (es_alt && array['Estoy laburando mucho, por eso no te llamé.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy pensando en anotarme en el gimnasio.']::text[], note_en = coalesce(note_en, '“Andar + -ando/-iendo” is a casual Argentine way to say what you have been up to lately.')
where id = '18e11cbd-8ad6-5a4a-a6c0-9271a0f946f8' and es = 'Ando pensando en anotarme en el gimnasio.' and en = 'I''ve been thinking about signing up at the gym.'
  and not (es_alt && array['Estoy pensando en anotarme en el gimnasio.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy pensando en mudarme.']::text[], note_en = coalesce(note_en, '“Andar + -ando/-iendo” is a casual Argentine way to say what you have been up to lately.')
where id = '563598ea-6994-50c1-895b-66ea7782160f' and es = 'Ando pensando en mudarme.' and en = 'I''ve been thinking about moving.'
  and not (es_alt && array['Estoy pensando en mudarme.']::text[]);

update public.sentences set es_alt = es_alt || array['Hace meses que estoy buscando un depto en Palermo.', 'Hace meses que busco un depto en Palermo.']::text[], note_en = coalesce(note_en, '“Andar + -ando/-iendo” is a casual Argentine way to say what you have been up to lately.')
where id = 'f1af8bc9-504b-5361-b496-3d8a40374817' and es = 'Hace meses que ando buscando un depto en Palermo.' and en = 'I''ve been looking for an apartment in Palermo for months.'
  and not (es_alt && array['Hace meses que estoy buscando un depto en Palermo.', 'Hace meses que busco un depto en Palermo.']::text[]);

update public.sentences set es_alt = es_alt || array['Cuidado, estás por salir sin llaves.']::text[], note_en = coalesce(note_en, '“Ojo” (literally “eye”) is the everyday Argentine way to say “careful”.')
where id = '4dbafcb3-2795-5b23-ba03-c73e50a2f96d' and es = 'Ojo, estás por salir sin llaves.' and en = 'Careful, you''re about to leave without your keys.'
  and not (es_alt && array['Cuidado, estás por salir sin llaves.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy terminando, esperame.', 'Ya casi termino, esperame.']::text[], note_en = coalesce(note_en, '“Ya” here adds a feeling of “any second now”; Argentines use it a lot to reassure someone who is waiting.')
where id = 'cb46d17e-b74e-5b40-bc21-4d36bb00ed4c' and es = 'Ya estoy terminando, esperame.' and en = 'I''m almost done, wait for me.'
  and not (es_alt && array['Estoy terminando, esperame.', 'Ya casi termino, esperame.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Cómo estás de plata? —Mal, no llego a fin de mes.']::text[], note_en = coalesce(note_en, 'Argentines love “andar” for how things are going lately: “¿cómo andás de plata?”.')
where id = 'd9d12f18-730c-566f-9f49-16f3b06a3b16' and es = '—¿Cómo andás de plata? —Mal, no llego a fin de mes.' and en = '—How are you doing for money? —Badly, I''m not making it to the end of the month.'
  and not (es_alt && array['—¿Cómo estás de plata? —Mal, no llego a fin de mes.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Vamos a comer afuera? —Este mes no me alcanza, tengo muchos gastos.', '—¿Vamos a comer afuera? —Este mes no me alcanza, estoy con muchos gastos.']::text[], note_en = coalesce(note_en, '“Andar con” is a casual way to say what you are dealing with these days.')
where id = 'e231c99a-2da7-57d6-92c8-0008172320f6' and es = '—¿Vamos a comer afuera? —Este mes no me alcanza, ando con muchos gastos.' and en = '—Should we eat out? —I don''t have enough this month, I''ve had a lot of expenses.'
  and not (es_alt && array['—¿Vamos a comer afuera? —Este mes no me alcanza, tengo muchos gastos.', '—¿Vamos a comer afuera? —Este mes no me alcanza, estoy con muchos gastos.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés el auto hoy?', '¿Estás con el auto hoy?']::text[], note_en = coalesce(note_en, '“Andar con auto” means to be getting around by car; it is how Argentines ask if you have the car with you.')
where id = '4cb94f76-7428-5059-b581-69f9c56aae4b' and es = '¿Andás con auto hoy?' and en = 'Do you have the car today?'
  and not (es_alt && array['¿Tenés el auto hoy?', '¿Estás con el auto hoy?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Estás sin plata? Pago yo, y me devolvés cuando puedas.', '¿No tenés plata? Pago yo, y me devolvés cuando puedas.']::text[], note_en = coalesce(note_en, '“Andar sin plata” is the casual Argentine way to say you are short on money these days.')
where id = 'fa280c65-dda0-5856-b9bb-79c61848a75e' and es = '¿Andás sin plata? Pago yo, y me devolvés cuando puedas.' and en = 'Are you out of money? I''ll pay, and you pay me back when you can.'
  and not (es_alt && array['¿Estás sin plata? Pago yo, y me devolvés cuando puedas.', '¿No tenés plata? Pago yo, y me devolvés cuando puedas.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy cocinando en casa y así llego a fin de mes.']::text[], note_en = coalesce(note_en, '“Andar + -ando/-iendo” is a casual Argentine way to say what you have been up to lately.')
where id = '0a26ce25-337e-5e81-a1dc-7c0db1596ef8' and es = 'Ando cocinando en casa y así llego a fin de mes.' and en = 'I''ve been cooking at home and that''s how I make it to the end of the month.'
  and not (es_alt && array['Estoy cocinando en casa y así llego a fin de mes.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy enojada con el banco: me cobraron una comisión por nada.', 'Estoy enojado con el banco: me cobraron una comisión por nada.']::text[], note_en = coalesce(note_en, 'Argentines love “andar” for how you have been feeling lately: “ando enojada”.')
where id = '481c099c-dd08-5fbb-b7bc-503bc175e21f' and es = 'Ando enojada con el banco: me cobraron una comisión por nada.' and en = 'I''ve been mad at the bank: they charged me a fee for nothing.'
  and not (es_alt && array['Estoy enojada con el banco: me cobraron una comisión por nada.', 'Estoy enojado con el banco: me cobraron una comisión por nada.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy haciendo cuentas: entre tarifas y alquiler se me va el sueldo.']::text[], note_en = coalesce(note_en, '“Andar + -ando/-iendo” is a casual Argentine way to say what you have been up to lately.')
where id = '1f3e08e2-3225-581b-bd90-1173ed390a92' and es = 'Ando haciendo cuentas: entre tarifas y alquiler se me va el sueldo.' and en = 'I''ve been doing the math: between utility rates and rent, my salary is gone.'
  and not (es_alt && array['Estoy haciendo cuentas: entre tarifas y alquiler se me va el sueldo.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy haciendo delivery de noche para llegar a fin de mes.']::text[], note_en = coalesce(note_en, '“Andar + -ando/-iendo” is a casual Argentine way to say what you have been up to lately.')
where id = 'a4b34223-3b84-5029-88eb-a7386e3abc70' and es = 'Ando haciendo delivery de noche para llegar a fin de mes.' and en = 'I''ve been doing deliveries at night to make ends meet.'
  and not (es_alt && array['Estoy haciendo delivery de noche para llegar a fin de mes.']::text[]);

update public.sentences set es_alt = es_alt || array['Estamos por ir al cine, ¿querés venir?']::text[], note_en = coalesce(note_en, 'Argentines often invite with just the verb: “¿venís?” already means “want to come?”.')
where id = '3e6f5044-1682-50d4-a2f0-f2ee6b1979be' and es = 'Estamos por ir al cine, ¿venís?' and en = 'We''re about to go to the movies, want to come?'
  and not (es_alt && array['Estamos por ir al cine, ¿querés venir?']::text[]);

update public.sentences set es_alt = es_alt || array['Justo te estaba por llamar.']::text[]
where id = '80ebb1fa-5555-50cb-919e-ed58408561bc' and es = 'Justo te iba a llamar.' and en = 'I was just about to call you.'
  and not (es_alt && array['Justo te estaba por llamar.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Podés traer unas birras?']::text[], note_en = coalesce(note_en, 'Argentines often ask for a favor with the plain present: “¿Traés…?” works like “Can you bring…?”.')
where id = '3738accf-9fb1-56df-aaa4-37b719eb0227' and es = '¿Traés unas birras?' and en = 'Can you bring some beers?'
  and not (es_alt && array['¿Podés traer unas birras?']::text[]);

update public.sentences set es_alt = es_alt || array['Con este calor, ¿querés ir por unas birras?']::text[]
where id = '343b44f3-afeb-5476-8cc1-620957adfe80' and es = 'Con este calor, ¿vamos por unas birras?' and en = 'In this heat, want to go get some beers?'
  and not (es_alt && array['Con este calor, ¿querés ir por unas birras?']::text[]);

update public.sentences set es_alt = es_alt || array['Voy a traer birra para el asado.']::text[], note_en = coalesce(note_en, 'Argentines often use the present tense for an offer or a near plan: “Traigo birra” means “I''ll bring beer”.')
where id = 'b7269789-2a71-57d6-86c1-93b5db934fc3' and es = 'Traigo birra para el asado.' and en = 'I''ll bring beer for the asado.'
  and not (es_alt && array['Voy a traer birra para el asado.']::text[]);

update public.sentences set es_alt = es_alt || array['Me robaron, así que llamé a la cana.']::text[]
where id = '5d7d30d3-d9e0-5ea3-bd33-2e34a06481d0' and es = 'Me robaron, llamé a la cana.' and en = 'I got robbed, so I called the cops.'
  and not (es_alt && array['Me robaron, así que llamé a la cana.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo miedo, ¿venís conmigo?', 'Tengo miedo, ¿me acompañás?']::text[]
where id = 'c82f9da7-2633-517c-b464-ca59fecf7c0c' and es = 'Tengo miedo, ¿me hacés la gamba?' and en = 'I''m scared, will you come with me?'
  and not (es_alt && array['Tengo miedo, ¿venís conmigo?', 'Tengo miedo, ¿me acompañás?']::text[]);

update public.sentences set es_alt = es_alt || array['Voy a hablar con el dueño, ¿venís conmigo?', 'Voy a hablar con el dueño, ¿me acompañás?']::text[]
where id = '680b0bfe-9894-5f01-b0a5-03b747c9ec00' and es = 'Voy a hablar con el dueño, ¿me hacés la gamba?' and en = 'I''m going to talk to the landlord, will you come with me?'
  and not (es_alt && array['Voy a hablar con el dueño, ¿venís conmigo?', 'Voy a hablar con el dueño, ¿me acompañás?']::text[]);

update public.sentences set es_alt = es_alt || array['No me digas hijo de puta.']::text[], note_en = coalesce(note_en, 'Starting with “A mí” adds emphasis, like “don''t you call ME that”.')
where id = 'afb7e6f5-0f9a-508a-984b-9816967a13ac' and es = 'A mí no me digas hijo de puta.' and en = 'Don''t you call me a son of a bitch.'
  and not (es_alt && array['No me digas hijo de puta.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuela siempre hace comida de más.']::text[]
where id = '998b4822-fe72-58f6-a885-bec0c3b3e61f' and es = 'Mi abuela siempre está exagerando con la comida.' and en = 'My grandma always makes too much food.'
  and not (es_alt && array['Mi abuela siempre hace comida de más.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Quién habla?', '¿Quién llama?']::text[], note_en = coalesce(note_en, '“¿De parte de quién?” is the polite phone formula, literally “on whose behalf?”.')
where id = 'f7fb800b-93e9-52b0-b19a-dd1f8af8b803' and es = '¿De parte de quién?' and en = 'Who''s calling?'
  and not (es_alt && array['¿Quién habla?', '¿Quién llama?']::text[]);

update public.sentences set es_alt = es_alt || array['No te olvides del pan.']::text[]
where id = 'de6de06f-474c-5145-8f1b-1c8b25299cb1' and es = 'Acordate del pan.' and en = 'Don''t forget the bread.'
  and not (es_alt && array['No te olvides del pan.']::text[]);

update public.sentences set es_alt = es_alt || array['El profe les pidió que trajeran su DNI.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” or “la” where English says “my” or “their”, when it is obvious whose thing it is.')
where id = '41ca94eb-9615-54f6-a419-f61d9848e6a7' and es = 'El profe les pidió que trajeran el DNI.' and en = 'The teacher asked them to bring their ID.'
  and not (es_alt && array['El profe les pidió que trajeran su DNI.']::text[]);

update public.sentences set es_alt = es_alt || array['El profe me pidió que apagara mi celu.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” or “la” where English says “my”, when it is obvious whose thing it is.')
where id = '0786fa5d-77bc-58f7-9942-0399a9e70444' and es = 'El profe me pidió que apagara el celu.' and en = 'The teacher asked me to turn off my phone.'
  and not (es_alt && array['El profe me pidió que apagara mi celu.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenemos que encargar el hielo.']::text[], note_en = coalesce(note_en, '“Hay que” says something needs doing without naming who. Argentines use it all the time where English says “we have to”.')
where id = 'b9cf12ee-c0ef-590c-bf10-e17ac8d9fd2e' and es = 'Hay que encargar el hielo.' and en = 'We have to order the ice.'
  and not (es_alt && array['Tenemos que encargar el hielo.']::text[]);

update public.sentences set es_alt = es_alt || array['Mica me pidió que llamara.']::text[], note_en = coalesce(note_en, '“De parte de” means “on behalf of”. It is the usual way to say who sent you when you call or drop by.')
where id = '6041145b-ea5c-59f4-9ab1-0e156c50ad81' and es = 'Llamo de parte de Mica.' and en = 'Mica asked me to call.'
  and not (es_alt && array['Mica me pidió que llamara.']::text[]);

update public.sentences set es_alt = es_alt || array['Portate bien, viene la abuela.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” before the reason. It works like a quick “because”.')
where id = '08bf277a-56db-5c50-a3b6-28a1ea070140' and es = 'Portate bien, que viene la abuela.' and en = 'Behave, Grandma''s coming.'
  and not (es_alt && array['Portate bien, viene la abuela.']::text[]);

update public.sentences set es_alt = es_alt || array['Te traje un regalo de mis viejos.']::text[], note_en = coalesce(note_en, '“De parte de” means “on behalf of”. It makes clear the gift is sent by them.')
where id = 'b57da0a8-ff01-5a8e-abd1-d52de46fa222' and es = 'Te traje un regalo de parte de mis viejos.' and en = 'I brought you a gift from my parents.'
  and not (es_alt && array['Te traje un regalo de mis viejos.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar a averiguar cuándo llega el micro?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with a plain present-tense question. “¿Me ayudás?” already means “Can you help me?”.')
where id = '92c8d220-b7e6-5167-82ec-777dd19591b2' and es = '¿Me ayudás a averiguar cuándo llega el micro?' and en = 'Can you help me find out when the bus arrives?'
  and not (es_alt && array['¿Me podés ayudar a averiguar cuándo llega el micro?']::text[]);

update public.sentences set es_alt = es_alt || array['A ver si está abierto hoy.', 'A ver si está abierta hoy.']::text[]
where id = '72f86604-40a9-5059-a1a2-ffe88221ab7c' and es = 'A ver si abre hoy.' and en = 'Let''s see if it''s open today.'
  and not (es_alt && array['A ver si está abierto hoy.', 'A ver si está abierta hoy.']::text[]);

update public.sentences set es_alt = es_alt || array['Deberíamos ir al cine este finde.']::text[], note_en = coalesce(note_en, '“A ver si…” is literally “let''s see if…”. Argentines use it to float a plan, the way English says “we should…”.')
where id = '2d2d913f-55fe-508e-a157-dcfc89a6cdc6' and es = 'A ver si este finde vamos al cine.' and en = 'We should go to the movies this weekend.'
  and not (es_alt && array['Deberíamos ir al cine este finde.']::text[]);

update public.sentences set es_alt = es_alt || array['Espero que llegues temprano mañana.', 'Ojalá llegues temprano mañana.']::text[], note_en = coalesce(note_en, '“A ver si…” is literally “let''s see if…”. Said to someone about what they should do, it is a gentle nudge, like “I hope you…”.')
where id = 'c1c0a085-b35e-5171-a7b4-4a86112385e7' and es = 'A ver si llegás temprano mañana.' and en = 'I hope you get here early tomorrow.'
  and not (es_alt && array['Espero que llegues temprano mañana.', 'Ojalá llegues temprano mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Averiguá si está abierto hoy.', 'Averiguá si está abierta hoy.']::text[]
where id = 'c88fefdd-d54c-59d8-be83-8cefb6cc6545' and es = 'Averiguá si abre hoy.' and en = 'Find out if it''s open today.'
  and not (es_alt && array['Averiguá si está abierto hoy.', 'Averiguá si está abierta hoy.']::text[]);

update public.sentences set es_alt = es_alt || array['Averiguá si tenés que sacar turno.']::text[], note_en = coalesce(note_en, '“Hay que” says something needs doing without naming who. It often stands in for a general “you have to”.')
where id = '745811f3-a51d-5413-b669-031aa2e653a1' and es = 'Averiguá si hay que sacar turno.' and en = 'Find out if you have to get an appointment.'
  and not (es_alt && array['Averiguá si tenés que sacar turno.']::text[]);

update public.sentences set es_alt = es_alt || array['Averiguá si la farmacia está abierta el domingo.']::text[]
where id = '45d48359-5550-5eae-ad81-c7f676af16c8' and es = 'Averiguá si la farmacia abre el domingo.' and en = 'Find out if the pharmacy is open on Sunday.'
  and not (es_alt && array['Averiguá si la farmacia está abierta el domingo.']::text[]);

update public.sentences set es_alt = es_alt || array['Che, ¿sabés si el kiosco está abierto de noche?']::text[]
where id = 'a37c70d3-1e53-5056-b700-256462826ab3' and es = 'Che, ¿sabés si el kiosco abre de noche?' and en = 'Hey, do you know if the kiosco is open at night?'
  and not (es_alt && array['Che, ¿sabés si el kiosco está abierto de noche?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, deberíamos tomar un café esta semana.']::text[], note_en = coalesce(note_en, '“A ver si…” is literally “let''s see if…”. Argentines use it to float a plan, the way English says “we should…”.')
where id = 'c06dd429-a751-56fb-be70-0f319ef53ca0' and es = 'Che, a ver si tomamos un café esta semana.' and en = 'Hey, we should have a coffee this week.'
  and not (es_alt && array['Che, deberíamos tomar un café esta semana.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenemos que averiguar.']::text[], note_en = coalesce(note_en, '“Hay que” says something needs doing without naming who. Argentines use it all the time where English says “we have to”.')
where id = 'ae93b2b0-9b08-5a68-a074-3c6dff1ccd2f' and es = 'Hay que averiguar.' and en = 'We have to find out.'
  and not (es_alt && array['Tenemos que averiguar.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo que averiguar qué papeles necesito para mi DNI.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” or “la” where English says “my”, when it is obvious whose thing it is.')
where id = '1060b027-0d63-5b92-9ca8-9c734c573ba6' and es = 'Tengo que averiguar qué papeles necesito para el DNI.' and en = 'I have to find out what papers I need for my ID.'
  and not (es_alt && array['Tengo que averiguar qué papeles necesito para mi DNI.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenemos que chequear todo otra vez?']::text[], note_en = coalesce(note_en, '“Hace falta” means “it''s necessary”. It asks whether something needs doing without naming who.')
where id = '19221b58-38a5-54a0-b843-f693606e815c' and es = '¿Hace falta chequear todo otra vez?' and en = 'Do we need to check everything again?'
  and not (es_alt && array['¿Tenemos que chequear todo otra vez?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tienen este talle en stock?', '¿Tenés este talle en stock?']::text[]
where id = '7fc1e867-e3ab-577f-9401-0da36a5eed13' and es = '¿Hay stock de este talle?' and en = 'Do you have this size in stock?'
  and not (es_alt && array['¿Tienen este talle en stock?', '¿Tenés este talle en stock?']::text[]);

update public.sentences set es_alt = es_alt || array['Chequeá tu vuelto.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” or “la” where English says “your”, when it is obvious whose thing it is.')
where id = '0cbb7d10-1935-5cfd-84f2-cb260d2c6cf2' and es = 'Chequeá el vuelto.' and en = 'Check your change.'
  and not (es_alt && array['Chequeá tu vuelto.']::text[]);

update public.sentences set es_alt = es_alt || array['Chequeá si tenés tu SUBE.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” or “la” where English says “your”, when it is obvious whose thing it is.')
where id = '0147cfc7-ad08-5c41-9d17-10eda2cec87a' and es = 'Chequeá si tenés la SUBE.' and en = 'Check if you have your SUBE card.'
  and not (es_alt && array['Chequeá si tenés tu SUBE.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenés que consultar en la ventanilla.']::text[], note_en = coalesce(note_en, '“Hay que” says something needs doing without naming who. It often stands in for a general “you have to”.')
where id = '5c439868-0331-5007-8e56-d73d86187fd5' and es = 'Hay que consultar en la ventanilla.' and en = 'You have to ask at the counter.'
  and not (es_alt && array['Tenés que consultar en la ventanilla.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenés que ir en persona.']::text[], note_en = coalesce(note_en, '“Hay que” says something needs doing without naming who. It often stands in for a general “you have to”.')
where id = '6e6828ec-3a56-5663-8f0d-7fb96601cedc' and es = 'Hay que ir en persona.' and en = 'You have to go in person.'
  and not (es_alt && array['Tenés que ir en persona.']::text[]);

update public.sentences set es_alt = es_alt || array['Preguntale al mozo si tienen pizza.']::text[]
where id = 'ac36fcf2-6027-5363-9262-8a722f6e627e' and es = 'Preguntale al mozo si hay pizza.' and en = 'Ask the waiter if they have pizza.'
  and not (es_alt && array['Preguntale al mozo si tienen pizza.']::text[]);

update public.sentences set es_alt = es_alt || array['Preguntale si el auto está disponible este finde.']::text[], note_en = coalesce(note_en, '“El finde” on its own usually means the coming weekend, so Argentines often skip “este”.')
where id = 'ba731b19-9d4e-593d-9742-eed9ded5c394' and es = 'Preguntale si el auto está disponible el finde.' and en = 'Ask him if the car is available this weekend.'
  and not (es_alt && array['Preguntale si el auto está disponible este finde.']::text[]);

update public.sentences set es_alt = es_alt || array['Sí, todavía está disponible.']::text[], note_en = coalesce(note_en, '“Seguir” plus an adjective is a very common way to say something is still the case.')
where id = '3efbb007-f7f9-5201-90ba-f7609a5c95e1' and es = 'Sí, sigue disponible.' and en = 'Yes, it''s still available.'
  and not (es_alt && array['Sí, todavía está disponible.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo que chequear mi mail.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” or “la” where English says “my”, when it is obvious whose thing it is.')
where id = '100adf11-7cfd-5e4f-8263-708af56beb28' and es = 'Tengo que chequear el mail.' and en = 'I have to check my email.'
  and not (es_alt && array['Tengo que chequear mi mail.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Me podés pasar la sal? —Cómo no, acá tenés.']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with a plain present-tense question. “¿Me pasás…?” already means “Can you pass me…?”.')
where id = '16fc8d3b-3c67-5722-918b-fd3a003a2070' and es = '—¿Me pasás la sal? —Cómo no, acá tenés.' and en = '—Can you pass me the salt? —Of course, here you go.'
  and not (es_alt && array['—¿Me podés pasar la sal? —Cómo no, acá tenés.']::text[]);

update public.sentences set es_alt = es_alt || array['¿La llave? Me fijo en mi mochila.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” or “la” where English says “my”, when it is obvious whose thing it is.')
where id = 'e86a45f9-05c3-5f79-b15d-8b77333f16ad' and es = '¿La llave? Me fijo en la mochila.' and en = 'The key? I''ll check my backpack.'
  and not (es_alt && array['¿La llave? Me fijo en mi mochila.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te puedo dar una mano con la valija?']::text[], note_en = coalesce(note_en, 'Argentines often offer help with a plain present-tense question. “¿Te doy una mano?” already means “Can I give you a hand?”.')
where id = '25e920e4-09ed-533e-bed1-d1ff4a5dc3a9' and es = '¿Te doy una mano con la valija?' and en = 'Can I give you a hand with the suitcase?'
  and not (es_alt && array['¿Te puedo dar una mano con la valija?']::text[]);

update public.sentences set es_alt = es_alt || array['A mis viejos les pidieron que trajeran su DNI.', 'Les pidieron a mis viejos que trajeran su DNI.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” or “la” where English says “their”, when it is obvious whose thing it is.')
where id = '19855d92-c0e8-53b2-85df-96d2956fb642' and es = 'A mis viejos les pidieron que trajeran el DNI.' and en = 'They asked my parents to bring their ID.'
  and not (es_alt && array['A mis viejos les pidieron que trajeran su DNI.', 'Les pidieron a mis viejos que trajeran su DNI.']::text[]);

update public.sentences set es_alt = es_alt || array['Averigüé y el depto todavía está disponible.']::text[], note_en = coalesce(note_en, '“Seguir” plus an adjective is a very common way to say something is still the case.')
where id = '87d1ab8f-b67b-5794-b02b-7caf4c0174f9' and es = 'Averigüé y el depto sigue disponible.' and en = 'I checked and the apartment is still available.'
  and not (es_alt && array['Averigüé y el depto todavía está disponible.']::text[]);

update public.sentences set es_alt = es_alt || array['Don José es jubilado, pero todavía labura.', 'Don José es jubilado, pero todavía está laburando.']::text[], note_en = coalesce(note_en, '“Seguir” plus a verb ending in -ando/-iendo is the usual way to say someone is still doing something.')
where id = '9b9798b7-bb44-5f0b-a16a-42897f981c73' and es = 'Don José es jubilado, pero sigue laburando.' and en = 'Don José is retired, but he''s still working.'
  and not (es_alt && array['Don José es jubilado, pero todavía labura.', 'Don José es jubilado, pero todavía está laburando.']::text[]);

update public.sentences set es_alt = es_alt || array['Portate bien con el profe, es re estricto.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” before the reason. It works like a quick “because”.')
where id = 'eba0ae09-1110-5c1b-b1f8-3819ca32682a' and es = 'Portate bien con el profe, que es re estricto.' and en = 'Behave with the teacher, he''s really strict.'
  and not (es_alt && array['Portate bien con el profe, es re estricto.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Dónde dejo mi CV?']::text[], note_en = coalesce(note_en, 'Spanish often says “el” or “la” where English says “my”, when it is obvious whose thing it is.')
where id = '9011480d-550e-5875-9543-4a2a74c88523' and es = '¿Dónde dejo el CV?' and en = 'Where do I leave my CV?'
  and not (es_alt && array['¿Dónde dejo mi CV?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Enviás el contrato a la inmobiliaria hoy?', '¿Hoy enviás el contrato a la inmobiliaria?']::text[], note_en = coalesce(note_en, 'Argentines usually add a “le” that points ahead to the person or place receiving something. It sounds natural, but the sentence is right without it.')
where id = 'c6e3a39a-ef2c-5ff3-bb06-0373280d60cd' and es = '¿Le enviás el contrato a la inmobiliaria hoy?' and en = 'Are you sending the contract to the real estate agency today?'
  and not (es_alt && array['¿Enviás el contrato a la inmobiliaria hoy?', '¿Hoy enviás el contrato a la inmobiliaria?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Adjunto el contrato o el formulario?']::text[], note_en = coalesce(note_en, 'Argentines often say who the attachment is for: “te adjunto” is “I''m attaching (for you)”. It is also right without “te”.')
where id = '452c81ed-89a8-58ba-85bd-b010e2ea0c30' and es = '¿Te adjunto el contrato o el formulario?' and en = 'Should I attach the contract or the form?'
  and not (es_alt && array['¿Adjunto el contrato o el formulario?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Te adjunto mi DNI?', '¿Adjunto mi DNI?']::text[], note_en = coalesce(note_en, 'Spanish often says “el” or “la” where English says “my”, when it is obvious whose thing it is.')
where id = '5a358179-9217-5385-98dd-af4a3334ce0a' and es = '¿Te adjunto el DNI?' and en = 'Should I attach my ID?'
  and not (es_alt && array['¿Te adjunto mi DNI?', '¿Adjunto mi DNI?']::text[]);

update public.sentences set es_alt = es_alt || array['Adjunté mi DNI y el contrato para la inmobiliaria.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” or “la” where English says “my”, when it is obvious whose thing it is.')
where id = '65cbdd85-9439-5401-9af6-ab91ae742d03' and es = 'Adjunté el DNI y el contrato para la inmobiliaria.' and en = 'I attached my ID and the contract for the real estate agency.'
  and not (es_alt && array['Adjunté mi DNI y el contrato para la inmobiliaria.']::text[]);

update public.sentences set es_alt = es_alt || array['Ayer adjunté los papeles del depto.', 'Adjunté los papeles del depto ayer.']::text[], note_en = coalesce(note_en, 'Argentines often say who the attachment is for: “te adjunté” is “I attached (for you)”. It is also right without “te”.')
where id = '42a7ac76-fb91-554c-a9fa-754ca7f8fec4' and es = 'Ayer te adjunté los papeles del depto.' and en = 'Yesterday I attached the documents for the apartment.'
  and not (es_alt && array['Ayer adjunté los papeles del depto.', 'Adjunté los papeles del depto ayer.']::text[]);

update public.sentences set es_alt = es_alt || array['Cualquier cosa, llamame a mi celular.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” or “la” where English says “my”, when it is obvious whose thing it is.')
where id = '03420824-08de-5035-996e-c586af13c6d1' and es = 'Cualquier cosa, llamame al celular.' and en = 'If anything comes up, call me on my cell phone.'
  and not (es_alt && array['Cualquier cosa, llamame a mi celular.']::text[]);

update public.sentences set es_alt = es_alt || array['Cualquier cosa, me escribís a mi mail del laburo.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” or “la” where English says “my”, when it is obvious whose thing it is.')
where id = '6e7d2f50-623d-5901-8e4a-1131d4d77968' and es = 'Cualquier cosa, me escribís al mail del laburo.' and en = 'If anything comes up, write to me at my work email.'
  and not (es_alt && array['Cualquier cosa, me escribís a mi mail del laburo.']::text[]);

update public.sentences set es_alt = es_alt || array['Dejé mi CV en tres bares de Palermo.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” or “la” where English says “my”, when it is obvious whose thing it is.')
where id = '179c17c5-cd7c-59f0-baac-4833f07482d3' and es = 'Dejé el CV en tres bares de Palermo.' and en = 'I left my CV at three bars in Palermo.'
  and not (es_alt && array['Dejé mi CV en tres bares de Palermo.']::text[]);

update public.sentences set es_alt = es_alt || array['Estimado Carlos, adjunto el contrato.']::text[], note_en = coalesce(note_en, 'Argentines often say who the attachment is for: “te adjunto” is “I''m attaching (for you)”. It is also right without “te”.')
where id = 'bb81bbf7-4039-5585-a60f-187e54578eaa' and es = 'Estimado Carlos, te adjunto el contrato.' and en = 'Dear Carlos, I''m attaching the contract.'
  and not (es_alt && array['Estimado Carlos, adjunto el contrato.']::text[]);

update public.sentences set es_alt = es_alt || array['Hola, Diego: adjunto el comprobante de la transferencia.']::text[], note_en = coalesce(note_en, 'Argentines often say who the attachment is for: “te adjunto” is “I''m attaching (for you)”. It is also right without “te”.')
where id = '2d7347e8-8d12-5192-97dc-4646b73e390f' and es = 'Hola, Diego: te adjunto el comprobante de la transferencia.' and en = 'Hi, Diego: I''m attaching the receipt for the transfer.'
  and not (es_alt && array['Hola, Diego: adjunto el comprobante de la transferencia.']::text[]);

update public.sentences set es_alt = es_alt || array['Hola, Nico: ¿me podés pasar el contrato? Desde ya, gracias.']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with a plain present-tense question. “¿Me pasás…?” already means “Can you send me…?”.')
where id = 'e9b2a653-b2f7-59dd-ba6e-da6c9ebe058e' and es = 'Hola, Nico: ¿me pasás el contrato? Desde ya, gracias.' and en = 'Hi, Nico: can you send me the contract? Thanks in advance.'
  and not (es_alt && array['Hola, Nico: ¿me podés pasar el contrato? Desde ya, gracias.']::text[]);

update public.sentences set es_alt = es_alt || array['Perdón por la demora: adjunto la reserva del hotel.']::text[], note_en = coalesce(note_en, 'Argentines often say who the attachment is for: “te adjunto” is “I''m attaching (for you)”. It is also right without “te”.')
where id = '3af7a513-825e-5b05-bf1d-dfa524f45497' and es = 'Perdón por la demora: te adjunto la reserva del hotel.' and en = 'Sorry for the delay: I''m attaching the hotel reservation.'
  and not (es_alt && array['Perdón por la demora: adjunto la reserva del hotel.']::text[]);

update public.sentences set es_alt = es_alt || array['Adjunto el contrato, pero todavía no lo firmé.', 'Adjunto el contrato, pero no lo firmé todavía.']::text[], note_en = coalesce(note_en, 'Argentines often say who the attachment is for: “te adjunto” is “I''m attaching (for you)”. It is also right without “te”.')
where id = 'e929fca8-dba7-5824-a909-7290e5fba093' and es = 'Te adjunto el contrato, pero todavía no lo firmé.' and en = 'I''m attaching the contract, but I still haven''t signed it.'
  and not (es_alt && array['Adjunto el contrato, pero todavía no lo firmé.', 'Adjunto el contrato, pero no lo firmé todavía.']::text[]);

update public.sentences set es_alt = es_alt || array['Adjunto mi CV y quedo atenta. Un saludo, Cami.']::text[], note_en = coalesce(note_en, 'Argentines often say who the attachment is for: “te adjunto” is “I''m attaching (for you)”. It is also right without “te”.')
where id = '65847205-d9e3-56fd-ae8f-d5cc13dbc7f2' and es = 'Te adjunto mi CV y quedo atenta. Un saludo, Cami.' and en = 'I''m attaching my résumé and I look forward to your reply. Regards, Cami.'
  and not (es_alt && array['Adjunto mi CV y quedo atenta. Un saludo, Cami.']::text[]);

update public.sentences set es_alt = es_alt || array['Acá está el link.']::text[], note_en = coalesce(note_en, '“Acá tenés” is literally “here you have”. It is what Argentines say when handing something over.')
where id = '211d97e3-28d0-516b-85a9-42171e48e0ee' and es = 'Acá tenés el link.' and en = 'Here''s the link.'
  and not (es_alt && array['Acá está el link.']::text[]);

update public.sentences set es_alt = es_alt || array['Tenemos que cambiar el asunto.']::text[], note_en = coalesce(note_en, '“Hay que” says something needs doing without naming who. Argentines use it all the time where English says “we need to”.')
where id = '5f2e5f07-823d-5f96-8945-ee8598c18559' and es = 'Hay que cambiar el asunto.' and en = 'We need to change the subject line.'
  and not (es_alt && array['Tenemos que cambiar el asunto.']::text[]);

update public.sentences set es_alt = es_alt || array['Juli, reenviame el mail de ayer, lo borré.']::text[], note_en = coalesce(note_en, 'After a command, Argentines often add a little “que” before the reason. It works like a quick “because”.')
where id = 'ed8d07b3-fda0-5def-b676-6f6c0eae4cd7' and es = 'Juli, reenviame el mail de ayer, que lo borré.' and en = 'Juli, forward me yesterday''s email, I deleted it.'
  and not (es_alt && array['Juli, reenviame el mail de ayer, lo borré.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar a revisar los archivos?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with a plain present-tense question. “¿Me ayudás?” already means “Can you help me?”.')
where id = 'db5ef926-79ef-5409-b571-b80699917374' and es = '¿Me ayudás a revisar los archivos?' and en = 'Can you help me go through the files?'
  and not (es_alt && array['¿Me podés ayudar a revisar los archivos?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, ¿me podés sacar una duda?']::text[], note_en = coalesce(note_en, 'Argentines often ask a favor with a plain present-tense question. “¿Me sacás una duda?” already means “Can you clear something up for me?”.')
where id = 'a1ee1445-af69-5b9d-a638-ac00648a617a' and es = 'Che, ¿me sacás una duda?' and en = 'Hey, can you answer a question for me?'
  and not (es_alt && array['Che, ¿me podés sacar una duda?']::text[]);

update public.sentences set es_alt = es_alt || array['La transferencia todavía está pendiente.']::text[], note_en = coalesce(note_en, '“Seguir” plus an adjective is a very common way to say something is still the case.')
where id = 'ba04a4e3-c594-531b-bf4f-d40b1bb4928c' and es = 'La transferencia sigue pendiente.' and en = 'The transfer is still pending.'
  and not (es_alt && array['La transferencia todavía está pendiente.']::text[]);

update public.sentences set es_alt = es_alt || array['Revisá tu mail, por favor.', 'Por favor, revisá tu mail.']::text[], note_en = coalesce(note_en, 'Spanish often says “el” or “la” where English says “your”, when it is obvious whose thing it is.')
where id = 'd6758973-ce76-5a44-859b-cd2a04214bb4' and es = 'Revisá el mail, por favor.' and en = 'Check your email, please.'
  and not (es_alt && array['Revisá tu mail, por favor.', 'Por favor, revisá tu mail.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo que revisar mis mails.']::text[], note_en = coalesce(note_en, 'Spanish often says “el”, “la”, “los” or “las” where English says “my”, when it is obvious whose thing it is.')
where id = 'c5db9258-b9cd-5975-9476-7c0d3a1837e3' and es = 'Tengo que revisar los mails.' and en = 'I have to go through my emails.'
  and not (es_alt && array['Tengo que revisar mis mails.']::text[]);

update public.sentences set es_alt = es_alt || array['El jefe dijo que tenemos que entregar mañana temprano.', 'El jefe dijo que mañana temprano tenemos que entregar.']::text[], note_en = coalesce(note_en, '“Hay que” says something needs doing without naming who. Argentines use it all the time where English says “we have to”.')
where id = 'bdc091f9-af43-56db-9a1a-c8c72627da1c' and es = 'El jefe dijo que hay que entregar mañana temprano.' and en = 'The boss said we have to deliver early tomorrow.'
  and not (es_alt && array['El jefe dijo que tenemos que entregar mañana temprano.', 'El jefe dijo que mañana temprano tenemos que entregar.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana tenemos que entregar.', 'Tenemos que entregar mañana.']::text[], note_en = coalesce(note_en, '“Hay que” says something needs doing without naming who. Argentines use it all the time where English says “we have to”.')
where id = '558c0d8f-140b-5cb0-b92d-30ce2aef89ed' and es = 'Mañana hay que entregar.' and en = 'We have to deliver tomorrow.'
  and not (es_alt && array['Mañana tenemos que entregar.', 'Tenemos que entregar mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Si todavía estamos atrasados, el cliente va a cancelar el pedido.']::text[], note_en = coalesce(note_en, '“Seguir” plus an adjective is a very common way to say something is still the case.')
where id = 'd98173fa-3c87-54b3-83c6-3414dc5e7750' and es = 'Si seguimos atrasados, el cliente va a cancelar el pedido.' and en = 'If we''re still behind schedule, the client is going to cancel the order.'
  and not (es_alt && array['Si todavía estamos atrasados, el cliente va a cancelar el pedido.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana no estoy, así que te las vas a tener que arreglar solo.']::text[], note_en = coalesce(note_en, 'In everyday speech the plain present often tells someone what they will have to do: “te las arreglás solo” already means “you''ll have to manage on your own”.')
where id = '5c757953-8d95-5bab-b12e-450a4cc42712' and es = 'Mañana no estoy, así que te las arreglás solo.' and en = 'I''m not around tomorrow, so you''ll have to manage on your own.'
  and not (es_alt && array['Mañana no estoy, así que te las vas a tener que arreglar solo.']::text[]);

update public.sentences set es_alt = es_alt || array['Dejame descansar un rato, no doy más.']::text[], note_en = coalesce(note_en, 'After a request, Argentines often add a little “que” to give the reason: it works like a quick “because”.')
where id = 'ba5f6eb9-742d-5b0a-bcfa-a0b9838f6613' and es = 'Dejame descansar un rato, que no doy más.' and en = 'Let me rest a while, I''m exhausted.'
  and not (es_alt && array['Dejame descansar un rato, no doy más.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cambiaste de celular?', '¿Te compraste un celular nuevo?']::text[], note_en = coalesce(note_en, 'Argentines say “cambiar el celular” (literally “change the phone”) for getting a new one.')
where id = '3c618ee4-d982-5972-91a9-a1a04ccfb31b' and es = '¿Cambiaste el celular?' and en = 'Did you get a new phone?'
  and not (es_alt && array['¿Cambiaste de celular?', '¿Te compraste un celular nuevo?']::text[]);

update public.sentences set es_alt = es_alt || array['¿En serio Pablo empezó a fumar otra vez?', '¿En serio Pablo empezó a fumar de nuevo?']::text[], note_en = coalesce(note_en, '“Volver a” + verb is the everyday way to say someone did something again.')
where id = 'f0a5776a-0b1e-5170-8785-d5f7d7bf692e' and es = '¿En serio Pablo volvió a fumar?' and en = 'Did Pablo really start smoking again?'
  and not (es_alt && array['¿En serio Pablo empezó a fumar otra vez?', '¿En serio Pablo empezó a fumar de nuevo?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Empezó a llover otra vez?', '¿Empezó a llover de nuevo?']::text[], note_en = coalesce(note_en, '“Volver a” + verb is the everyday way to say something happened again.')
where id = '99ed6383-f1d9-51ea-a0db-b452a27777e9' and es = '¿Volvió a llover?' and en = 'Did it start raining again?'
  and not (es_alt && array['¿Empezó a llover otra vez?', '¿Empezó a llover de nuevo?']::text[]);

update public.sentences set es_alt = es_alt || array['El vecino hizo ruido otra vez anoche.', 'Anoche el vecino hizo ruido otra vez.', 'El vecino hizo ruido de nuevo anoche.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is the everyday way to say someone did something again.')
where id = '071c0f15-bf17-574d-bfb0-b1f06a615e81' and es = 'El vecino volvió a hacer ruido anoche.' and en = 'The neighbor made noise again last night.'
  and not (es_alt && array['El vecino hizo ruido otra vez anoche.', 'Anoche el vecino hizo ruido otra vez.', 'El vecino hizo ruido de nuevo anoche.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi hermano llamó otra vez.', 'Mi hermano llamó de nuevo.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is the everyday way to say someone did something again.')
where id = 'ca40c374-e39f-5dec-bc6a-ae5bbf7ff012' and es = 'Mi hermano volvió a llamar.' and en = 'My brother called again.'
  and not (es_alt && array['Mi hermano llamó otra vez.', 'Mi hermano llamó de nuevo.']::text[]);

update public.sentences set es_alt = es_alt || array['La nafta subió otra vez.', 'Subió la nafta otra vez.', 'La nafta subió de nuevo.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is the everyday way to say something happened again.')
where id = '31c98f60-90c5-50a7-80cc-2e6ee64e8fd4' and es = 'Volvió a subir la nafta.' and en = 'Gas went up again.'
  and not (es_alt && array['La nafta subió otra vez.', 'Subió la nafta otra vez.', 'La nafta subió de nuevo.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Es largo? —No, es una historia muy corta.']::text[], note_en = coalesce(note_en, 'Argentines love the -ito/-ita ending: “cortita” means nice and short, and sounds warmer than “muy corta”.')
where id = '913164ff-3733-589c-8854-0f804528aee7' and es = '—¿Es largo? —No, es una historia cortita.' and en = '—Is it long? —No, it''s a very short story.'
  and not (es_alt && array['—¿Es largo? —No, es una historia muy corta.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Se fue Sofi? —Bueno, que se vaya.']::text[], note_en = coalesce(note_en, '“Y bueno” is the Argentine shrug: it shows you accept something you can''t change.')
where id = '2d0aa03f-b5f9-54c8-8eb1-d848f150c0db' and es = '—¿Se fue Sofi? —Y bueno, que se vaya.' and en = '—Sofi left? —Well, let her go.'
  and not (es_alt && array['—¿Se fue Sofi? —Bueno, que se vaya.']::text[]);

update public.sentences set es_alt = es_alt || array['Llueve. Bueno, nos quedamos.']::text[], note_en = coalesce(note_en, '“Y bueno” is the Argentine shrug: it shows you accept something you can''t change.')
where id = '3463ffdd-aa1b-5083-b46e-164fe4b5f00c' and es = 'Llueve. Y bueno, nos quedamos.' and en = 'It''s raining. Oh well, we''ll stay in.'
  and not (es_alt && array['Llueve. Bueno, nos quedamos.']::text[]);

update public.sentences set es_alt = es_alt || array['Bueno, el feriado fue corto, pero la pasamos bien.']::text[], note_en = coalesce(note_en, '“Y bueno” is the Argentine shrug: it shows you accept something you can''t change.')
where id = '9ed6fb7b-636e-507e-8cb1-dee8e35081f2' and es = 'Y bueno, el feriado fue corto, pero la pasamos bien.' and en = 'Oh well, the holiday was short, but we had a good time.'
  and not (es_alt && array['Bueno, el feriado fue corto, pero la pasamos bien.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cuál es la estación de subte más cercana?']::text[], note_en = coalesce(note_en, 'In everyday speech Argentines often say “que queda más cerca” instead of “más cercana”. Both are right.')
where id = 'ee0f8148-70d8-549d-831f-5f1bfffd9218' and es = '¿Cuál es la estación de subte que queda más cerca?' and en = 'Which is the closest subway station?'
  and not (es_alt && array['¿Cuál es la estación de subte más cercana?']::text[]);

update public.sentences set es_alt = es_alt || array['Con el paro de subte, la parada más cercana está llena.']::text[], note_en = coalesce(note_en, 'In everyday speech Argentines often say “que queda más cerca” instead of “más cercana”. Both are right.')
where id = 'f79bbf7d-0743-5dbb-8dd7-f952ee62f602' and es = 'Con el paro de subte, la parada que queda más cerca está llena.' and en = 'With the subway strike, the closest bus stop is full.'
  and not (es_alt && array['Con el paro de subte, la parada más cercana está llena.']::text[]);

update public.sentences set es_alt = es_alt || array['El gremio docente anunció un paro.']::text[], note_en = coalesce(note_en, '“Medida de fuerza” is the more formal phrase you hear on the news for a strike; in conversation people just say “paro”.')
where id = '06f250a9-8179-5270-8d9c-c48228db95d7' and es = 'El gremio docente anunció una medida de fuerza.' and en = 'The teachers'' union announced a strike.'
  and not (es_alt && array['El gremio docente anunció un paro.']::text[]);

update public.sentences set es_alt = es_alt || array['En la tele dicen que mañana sigue el paro.', 'En la tele dicen que el paro sigue mañana.']::text[], note_en = coalesce(note_en, '“Medida de fuerza” is the more formal phrase you hear on the news for a strike; in conversation people just say “paro”.')
where id = '14c3a8e7-705e-5a51-b85d-2e4bd6d1da12' and es = 'En la tele dicen que mañana sigue la medida de fuerza.' and en = 'On TV they say the strike continues tomorrow.'
  and not (es_alt && array['En la tele dicen que mañana sigue el paro.', 'En la tele dicen que el paro sigue mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Escuché en la radio que hay paro.', 'Escuché en la radio que hay un paro.']::text[], note_en = coalesce(note_en, '“Medida de fuerza” is the more formal phrase you hear on the news for a strike; in conversation people just say “paro”.')
where id = 'e95272bb-4d6c-5ea2-9f88-43567de0fe77' and es = 'Escuché en la radio que hay medida de fuerza.' and en = 'I heard on the radio that there''s a strike.'
  and not (es_alt && array['Escuché en la radio que hay paro.', 'Escuché en la radio que hay un paro.']::text[]);

update public.sentences set es_alt = es_alt || array['Leí en el diario que el lunes empieza el paro.', 'Leí en el diario que el paro empieza el lunes.']::text[], note_en = coalesce(note_en, '“Medida de fuerza” is the more formal phrase you hear on the news for a strike; in conversation people just say “paro”.')
where id = '59d16331-fee1-5543-a774-fe2e5bba12c9' and es = 'Leí en el diario que el lunes empieza la medida de fuerza.' and en = 'I read in the newspaper that the strike starts Monday.'
  and not (es_alt && array['Leí en el diario que el lunes empieza el paro.', 'Leí en el diario que el paro empieza el lunes.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Vas caminando?']::text[]
where id = '7c642afd-e186-512a-94cb-81743aa72657' and es = '¿Vas a pie?' and en = 'Are you walking?'
  and not (es_alt && array['¿Vas caminando?']::text[]);

update public.sentences set es_alt = es_alt || array['Anoche suspendieron el servicio por un paro.', 'Suspendieron el servicio anoche por un paro.']::text[], note_en = coalesce(note_en, '“Medida de fuerza” is the more formal phrase you hear on the news for a strike; in conversation people just say “paro”.')
where id = '9dfe55fb-ecd7-508b-999c-30cee5f90b82' and es = 'Anoche suspendieron el servicio por una medida de fuerza.' and en = 'Last night they suspended the service because of a strike.'
  and not (es_alt && array['Anoche suspendieron el servicio por un paro.', 'Suspendieron el servicio anoche por un paro.']::text[]);

update public.sentences set es_alt = es_alt || array['Ayer hubo paro de colectiveros y fui caminando.']::text[]
where id = 'fbe33dd9-a0e3-565f-bdee-027f7eba3fb1' and es = 'Ayer hubo paro de colectiveros y fui a pie.' and en = 'Yesterday there was a bus strike and I walked.'
  and not (es_alt && array['Ayer hubo paro de colectiveros y fui caminando.']::text[]);

update public.sentences set es_alt = es_alt || array['Con los desvíos, prefiero ir caminando al laburo.', 'Con los desvíos, prefiero ir al laburo caminando.']::text[]
where id = 'df18289b-0310-5290-9ef7-fdee1d2a9a8f' and es = 'Con los desvíos, prefiero ir a pie al laburo.' and en = 'With the detours, I''d rather walk to work.'
  and not (es_alt && array['Con los desvíos, prefiero ir caminando al laburo.', 'Con los desvíos, prefiero ir al laburo caminando.']::text[]);

update public.sentences set es_alt = es_alt || array['La marcha está suspendida, pero la avenida todavía está cortada.']::text[], note_en = coalesce(note_en, '“Sigue cortada” is literally “continues closed”: Spanish often uses “seguir” where English says “is still”.')
where id = '9f2338cf-1ff2-52eb-8ab1-8bc87def7d6a' and es = 'La marcha está suspendida, pero la avenida sigue cortada.' and en = 'The march is called off, but the avenue is still closed.'
  and not (es_alt && array['La marcha está suspendida, pero la avenida todavía está cortada.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Sigue la obra?']::text[], note_en = coalesce(note_en, '“Seguir” already means “to still be going”; adding “todavía” just underlines it.')
where id = '08b7239e-60a0-54de-865b-3eb62a127a29' and es = '¿Todavía sigue la obra?' and en = 'Is the construction still going on?'
  and not (es_alt && array['¿Sigue la obra?']::text[]);

update public.sentences set es_alt = es_alt || array['El restaurante de Pablo fue elegido como el mejor de la ciudad.']::text[]
where id = 'a4126377-52ac-518d-adcc-5749df42c184' and es = 'El restaurante de Pablo fue elegido el mejor de la ciudad.' and en = 'Pablo''s restaurant was chosen as the best in the city.'
  and not (es_alt && array['El restaurante de Pablo fue elegido como el mejor de la ciudad.']::text[]);

update public.sentences set es_alt = es_alt || array['La pizzería fue elegida como la mejor del barrio.']::text[]
where id = '807d76ef-2e5f-57fd-b178-2b8a010a0726' and es = 'La pizzería fue elegida la mejor del barrio.' and en = 'The pizza place was chosen as the best in the neighborhood.'
  and not (es_alt && array['La pizzería fue elegida como la mejor del barrio.']::text[]);

update public.sentences set es_alt = es_alt || array['Leí que Buenos Aires fue elegida como la mejor ciudad del año.']::text[]
where id = '559691fb-e80e-5d35-91f9-5d10d01ecbfb' and es = 'Leí que Buenos Aires fue elegida la mejor ciudad del año.' and en = 'I read that Buenos Aires was chosen as the best city of the year.'
  and not (es_alt && array['Leí que Buenos Aires fue elegida como la mejor ciudad del año.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Hay algún herido?', '¿Hay alguien herido?']::text[]
where id = 'ba2b44d8-1500-5b5b-8e11-fba6ec2c2e35' and es = '¿Hay heridos?' and en = 'Is anyone injured?'
  and not (es_alt && array['¿Hay algún herido?', '¿Hay alguien herido?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Hubo heridos?']::text[]
where id = 'd8109e5d-35dc-5956-ad10-af934ed336e5' and es = '¿Hubo algún herido?' and en = 'Was anyone injured?'
  and not (es_alt && array['¿Hubo heridos?']::text[]);

update public.sentences set es_alt = es_alt || array['Dos chicos fueron rescatados del río.']::text[], note_en = coalesce(note_en, '“Pibes” is the very Argentine, informal word for kids; “chicos” is just as common.')
where id = '8bf41954-5f79-53d9-97ca-fedefebe845c' and es = 'Dos pibes fueron rescatados del río.' and en = 'Two kids were rescued from the river.'
  and not (es_alt && array['Dos chicos fueron rescatados del río.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuelo fue trasladado a otro hospital.']::text[], note_en = coalesce(note_en, 'Inside the family, Argentines often say “el abuelo” instead of “mi abuelo”.')
where id = 'b2268759-12fe-52c8-ae3d-f06eec86d9ab' and es = 'El abuelo fue trasladado a otro hospital.' and en = 'My grandfather was moved to another hospital.'
  and not (es_alt && array['Mi abuelo fue trasladado a otro hospital.']::text[]);

update public.sentences set es_alt = es_alt || array['No hubo heridos.']::text[]
where id = 'a7d8f2f3-5d7c-5722-84b9-0a9e0f9a5afa' and es = 'No hubo ningún herido.' and en = 'Nobody was injured.'
  and not (es_alt && array['No hubo heridos.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Sabés por quién votó tu papá? —Ni idea.']::text[], note_en = coalesce(note_en, 'In Argentina you can “votar a” someone or “votar por” someone; both are everyday.')
where id = '78bdca97-4ed2-51fc-9f6f-9210d7464ffa' and es = '—¿Sabés a quién votó tu papá? —Ni idea.' and en = '—Do you know who your dad voted for? —No idea.'
  and not (es_alt && array['—¿Sabés por quién votó tu papá? —Ni idea.']::text[]);

update public.sentences set es_alt = es_alt || array['¿A quién votás?']::text[], note_en = coalesce(note_en, 'In Argentina you can “votar a” someone or “votar por” someone; both are everyday.')
where id = '67a249a1-79aa-5c40-b197-354c3cfa5f3e' and es = '¿Por quién votás?' and en = 'Who are you voting for?'
  and not (es_alt && array['¿A quién votás?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Votás a la mañana o después del almuerzo?']::text[], note_en = coalesce(note_en, '“Después de comer” in the daytime usually means after lunch.')
where id = '53c956c9-90a3-5419-b023-3efc5954f516' and es = '¿Votás a la mañana o después de comer?' and en = 'Are you voting in the morning or after lunch?'
  and not (es_alt && array['¿Votás a la mañana o después del almuerzo?']::text[]);

update public.sentences set es_alt = es_alt || array['El domingo voté y fui a comer un asado.']::text[], note_en = coalesce(note_en, '“Me fui” adds the feel of heading off somewhere; plain “fui” is fine too.')
where id = 'b382a278-896c-5513-8f97-e435bc9bf38d' and es = 'El domingo voté y me fui a comer un asado.' and en = 'On Sunday I voted and went to eat an asado.'
  and not (es_alt && array['El domingo voté y fui a comer un asado.']::text[]);

update public.sentences set es_alt = es_alt || array['En Argentina votar es obligatorio.', 'En Argentina es obligatorio votar.']::text[]
where id = 'a86a3493-051b-57e4-b561-a7746992ba4f' and es = 'En Argentina el voto es obligatorio.' and en = 'In Argentina voting is mandatory.'
  and not (es_alt && array['En Argentina votar es obligatorio.', 'En Argentina es obligatorio votar.']::text[]);

update public.sentences set es_alt = es_alt || array['Para mi abuela, votar es muy importante.', 'Para mi abuela es muy importante votar.']::text[]
where id = '3020d126-e3ae-5e3f-a361-6f0e8974f32f' and es = 'Para mi abuela, el voto es muy importante.' and en = 'For my grandmother, voting is very important.'
  and not (es_alt && array['Para mi abuela, votar es muy importante.', 'Para mi abuela es muy importante votar.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Votaste por la presidenta? —Sí, obvio.']::text[], note_en = coalesce(note_en, 'In Argentina you can “votar a” someone or “votar por” someone; both are everyday.')
where id = 'e39365ac-adcf-5c97-bf6b-49ae49cfff7c' and es = '—¿Votaste a la presidenta? —Sí, obvio.' and en = '—Did you vote for the president? —Yes, of course.'
  and not (es_alt && array['—¿Votaste por la presidenta? —Sí, obvio.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Por quién votaste para presidente?']::text[], note_en = coalesce(note_en, 'In Argentina you can “votar a” someone or “votar por” someone; both are everyday.')
where id = 'e86394a4-9d7f-55aa-906d-131701ec8e33' and es = '¿A quién votaste para presidente?' and en = 'Who did you vote for as president?'
  and not (es_alt && array['¿Por quién votaste para presidente?']::text[]);

update public.sentences set es_alt = es_alt || array['Hablé con el candidato en la esquina de mi casa.']::text[], note_en = coalesce(note_en, 'Argentines often say just “casa”, without “mi”, for their own home.')
where id = '4f267091-9f68-5e38-8264-a0edec8428aa' and es = 'Hablé con el candidato en la esquina de casa.' and en = 'I talked to the candidate on the corner by my house.'
  and not (es_alt && array['Hablé con el candidato en la esquina de mi casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Los resultados en Córdoba fueron una sorpresa.']::text[]
where id = 'f0352414-4410-5c1b-9ea9-5434a0230232' and es = 'Los resultados de Córdoba fueron una sorpresa.' and en = 'The results in Córdoba were a big surprise.'
  and not (es_alt && array['Los resultados en Córdoba fueron una sorpresa.']::text[]);

update public.sentences set es_alt = es_alt || array['Voté por otro candidato.']::text[], note_en = coalesce(note_en, 'In Argentina you can “votar a” someone or “votar por” someone; both are everyday.')
where id = 'd1fe66d0-d227-561e-b7ac-8a40be800ed7' and es = 'Voté a otro candidato.' and en = 'I voted for another candidate.'
  and not (es_alt && array['Voté por otro candidato.']::text[]);

update public.sentences set es_alt = es_alt || array['¿El subte y el tren funcionan durante el paro?']::text[], note_en = coalesce(note_en, '“Con el paro” (“with the strike”) is the casual way to say “while the strike is on”.')
where id = 'de906744-7fec-517c-baf9-60d999cd21fa' and es = '¿El subte y el tren funcionan con el paro?' and en = 'Are the subway and the train running during the strike?'
  and not (es_alt && array['¿El subte y el tren funcionan durante el paro?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Fuiste caminando hasta la facu?']::text[]
where id = 'eb0c795f-9ce4-594b-857a-3146fa78e844' and es = '¿Fuiste a pie hasta la facu?' and en = 'Did you walk all the way to college?'
  and not (es_alt && array['¿Fuiste caminando hasta la facu?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Hubo algún herido en el accidente?']::text[]
where id = '6f4b20c8-1544-59d6-b6b0-666f1e5ebecb' and es = '¿Hubo heridos en el accidente?' and en = 'Was anyone hurt in the accident?'
  and not (es_alt && array['¿Hubo algún herido en el accidente?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tu vuelo todavía está demorado?']::text[], note_en = coalesce(note_en, '“Sigue demorado” is a very common way to say “is still delayed”.')
where id = '63bb681e-85d9-58b7-bfe8-814a750cb9d6' and es = '¿Tu vuelo sigue demorado?' and en = 'Is your flight still delayed?'
  and not (es_alt && array['¿Tu vuelo todavía está demorado?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Vamos caminando?']::text[]
where id = 'e0fffbbe-6800-5184-a8b2-703536db7b03' and es = '¿Vamos a pie?' and en = 'Should we walk?'
  and not (es_alt && array['¿Vamos caminando?']::text[]);

update public.sentences set es_alt = es_alt || array['Con un sueldo de docente no llegás a fin de mes.']::text[]
where id = '7b42d7c4-3d5d-5057-9c61-1ba753afb8ff' and es = 'Con un sueldo docente no llegás a fin de mes.' and en = 'On a teacher''s salary, you don''t make it to the end of the month.'
  and not (es_alt && array['Con un sueldo de docente no llegás a fin de mes.']::text[]);

update public.sentences set es_alt = es_alt || array['El tren está demorado.']::text[], note_en = coalesce(note_en, '“Viene demorado” pictures the train on its way but behind schedule.')
where id = 'c86d8321-499d-58f0-86fb-446cfd028e25' and es = 'El tren viene demorado.' and en = 'The train is running late.'
  and not (es_alt && array['El tren está demorado.']::text[]);

update public.sentences set es_alt = es_alt || array['Está cerca, podemos ir caminando.']::text[]
where id = '6b9bc7e1-c93b-5709-a2d5-11414b8551f1' and es = 'Está cerca, podemos ir a pie.' and en = 'It''s close, we can walk.'
  and not (es_alt && array['Está cerca, podemos ir caminando.']::text[]);

update public.sentences set es_alt = es_alt || array['Fuimos caminando hasta el centro.', 'Caminamos hasta el centro.', 'Fuimos a pie al centro.']::text[]
where id = '4a958961-1757-58f6-bfe6-4938ad7c198a' and es = 'Fuimos a pie hasta el centro.' and en = 'We walked downtown.'
  and not (es_alt && array['Fuimos caminando hasta el centro.', 'Caminamos hasta el centro.', 'Fuimos a pie al centro.']::text[]);

update public.sentences set es_alt = es_alt || array['No hay subte, voy caminando.']::text[]
where id = '4a34463f-b923-5a5b-bc4c-aaaf3d55a17d' and es = 'No hay subte, voy a pie.' and en = 'There''s no subway, I''m walking.'
  and not (es_alt && array['No hay subte, voy caminando.']::text[]);

update public.sentences set es_alt = es_alt || array['Por el apagón, el subte no funciona.', 'El subte no funciona por el apagón.']::text[], note_en = coalesce(note_en, '“Andar” is the everyday Argentine verb for something working or running; “funcionar” is just as correct.')
where id = 'a2a046be-2aeb-57c5-b388-d1c6c0e08b22' and es = 'Por el apagón, el subte no anda.' and en = 'The subway isn''t running because of the blackout.'
  and not (es_alt && array['Por el apagón, el subte no funciona.', 'El subte no funciona por el apagón.']::text[]);

update public.sentences set es_alt = es_alt || array['Son veinte cuadras, pero prefiero ir caminando.']::text[]
where id = 'c3de6c10-1b04-5c4f-86ed-5a7bd1f6f394' and es = 'Son veinte cuadras, pero prefiero ir a pie.' and en = 'It''s twenty blocks, but I''d rather walk.'
  and not (es_alt && array['Son veinte cuadras, pero prefiero ir caminando.']::text[]);

update public.sentences set es_alt = es_alt || array['Está demorado por el tránsito.']::text[]
where id = '5c724d77-70e8-57cd-a8f7-7edea6ffdcd3' and es = 'Viene demorado por el tránsito.' and en = 'He''s running late because of traffic.'
  and not (es_alt && array['Está demorado por el tránsito.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿El subte funciona? —Al parecer, no.']::text[]
where id = '56b60c2b-eb39-5558-9ebb-0b4222ce55c9' and es = '—¿El subte funciona? —Aparentemente, no.' and en = '—Is the subway running? —Apparently not.'
  and not (es_alt && array['—¿El subte funciona? —Al parecer, no.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Viste el noticiero anoche?', '¿Anoche viste el noticiero?']::text[]
where id = '510c2b05-09ba-5620-803d-7f83a3b698c4' and es = '¿Viste el noticiero de anoche?' and en = 'Did you see the news last night?'
  and not (es_alt && array['¿Viste el noticiero anoche?', '¿Anoche viste el noticiero?']::text[]);

update public.sentences set es_alt = es_alt || array['Aparentemente, el subte no funciona.']::text[]
where id = '3d346a27-05db-551a-9210-4a75fe40f71e' and es = 'Al parecer, el subte no funciona.' and en = 'Apparently, the subway isn''t working.'
  and not (es_alt && array['Aparentemente, el subte no funciona.']::text[]);

update public.sentences set es_alt = es_alt || array['Aparentemente, hubo un apagón.']::text[]
where id = '8c068af0-3a55-581f-9ed9-ca1f758adf91' and es = 'Al parecer, hubo un apagón.' and en = 'Apparently, there was a blackout.'
  and not (es_alt && array['Aparentemente, hubo un apagón.']::text[]);

update public.sentences set es_alt = es_alt || array['Aparentemente, la avenida está cortada hasta el lunes.']::text[]
where id = 'f1f23f25-f21b-5fb7-9f5d-32c27772ac73' and es = 'Al parecer, la avenida está cortada hasta el lunes.' and en = 'Apparently, the avenue is closed until Monday.'
  and not (es_alt && array['Aparentemente, la avenida está cortada hasta el lunes.']::text[]);

update public.sentences set es_alt = es_alt || array['Aparentemente, levantaron el paro.']::text[]
where id = '97b8f508-38a2-52cd-985b-9d54af256f56' and es = 'Al parecer, levantaron el paro.' and en = 'Apparently, they ended the strike.'
  and not (es_alt && array['Aparentemente, levantaron el paro.']::text[]);

update public.sentences set es_alt = es_alt || array['Aparentemente, nadie sabe lo que pasó anoche.']::text[]
where id = '54d99860-28eb-580f-b672-8fed28053c12' and es = 'Al parecer, nadie sabe lo que pasó anoche.' and en = 'Apparently, nobody knows what happened last night.'
  and not (es_alt && array['Aparentemente, nadie sabe lo que pasó anoche.']::text[]);

update public.sentences set es_alt = es_alt || array['Aparentemente, se inauguró la estación nueva.']::text[]
where id = 'a9f010e6-ec5d-5b23-844b-321c542e57e9' and es = 'Al parecer, se inauguró la estación nueva.' and en = 'Apparently, the new station was opened.'
  and not (es_alt && array['Aparentemente, se inauguró la estación nueva.']::text[]);

update public.sentences set es_alt = es_alt || array['Aparentemente, suspendieron las clases en toda la provincia.']::text[]
where id = '4eead4ee-7057-5bc3-be14-c49668017212' and es = 'Al parecer, suspendieron las clases en toda la provincia.' and en = 'Apparently, they canceled classes in the whole province.'
  and not (es_alt && array['Aparentemente, suspendieron las clases en toda la provincia.']::text[]);

update public.sentences set es_alt = es_alt || array['Al parecer es verdad.']::text[]
where id = 'e5c413fd-77dd-5131-a405-932b9fd23377' and es = 'Aparentemente es verdad.' and en = 'Apparently it''s true.'
  and not (es_alt && array['Al parecer es verdad.']::text[]);

update public.sentences set es_alt = es_alt || array['Al parecer, el precio subió otra vez.']::text[]
where id = '73c0ee06-fdaa-535e-ad40-6e631df57b51' and es = 'Aparentemente, el precio subió otra vez.' and en = 'Apparently, the price went up again.'
  and not (es_alt && array['Al parecer, el precio subió otra vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Al parecer, el subte está cerrado.']::text[]
where id = '3865f604-0b2a-5b4c-9f12-711332b8a073' and es = 'Aparentemente, el subte está cerrado.' and en = 'Apparently, the subway is closed.'
  and not (es_alt && array['Al parecer, el subte está cerrado.']::text[]);

update public.sentences set es_alt = es_alt || array['Al parecer, Juan renunció.']::text[]
where id = 'b370f7ad-8e3a-543e-822f-72fabe9e9255' and es = 'Aparentemente, Juan renunció.' and en = 'Apparently, Juan quit.'
  and not (es_alt && array['Al parecer, Juan renunció.']::text[]);

update public.sentences set es_alt = es_alt || array['Al parecer, la pérdida viene del departamento de arriba.']::text[]
where id = '23f3e2e1-6311-5fac-b863-ff95865746c9' and es = 'Aparentemente, la pérdida viene del departamento de arriba.' and en = 'Apparently, the leak is coming from the apartment upstairs.'
  and not (es_alt && array['Al parecer, la pérdida viene del departamento de arriba.']::text[]);

update public.sentences set es_alt = es_alt || array['Al parecer, nadie vino.']::text[]
where id = '6ceacc3d-d06c-59d1-bf90-853355a342ed' and es = 'Aparentemente, nadie vino.' and en = 'Apparently, nobody came.'
  and not (es_alt && array['Al parecer, nadie vino.']::text[]);

update public.sentences set es_alt = es_alt || array['Che, parece que hay paro.']::text[], note_en = coalesce(note_en, '“Se ve que” is a very common Argentine way to say you''re inferring something from what you can see.')
where id = 'fe8b2df2-e701-57dc-8664-82b827921002' and es = 'Che, se ve que hay paro.' and en = 'Hey, looks like there''s a strike.'
  and not (es_alt && array['Che, parece que hay paro.']::text[]);

update public.sentences set es_alt = es_alt || array['El colectivo no viene; parece que hay paro.']::text[], note_en = coalesce(note_en, '“Se ve que” is a very common Argentine way to say you''re inferring something from what you can see.')
where id = '5cf55a3d-d5b9-58c2-b4c1-2d12a561ec67' and es = 'El colectivo no viene; se ve que hay paro.' and en = 'The bus isn''t coming; looks like there''s a strike.'
  and not (es_alt && array['El colectivo no viene; parece que hay paro.']::text[]);

update public.sentences set es_alt = es_alt || array['Parece que el calefón no anda.', 'Se ve que el calefón no funciona.', 'Parece que el calefón no funciona.']::text[], note_en = coalesce(note_en, '“Se ve que” is a very common Argentine way to say you''re inferring something from what you can see.')
where id = '44aeb9dd-fed8-5b19-bec3-6fe3626519c7' and es = 'Se ve que el calefón no anda.' and en = 'It looks like the water heater isn''t working.'
  and not (es_alt && array['Parece que el calefón no anda.', 'Se ve que el calefón no funciona.', 'Parece que el calefón no funciona.']::text[]);

update public.sentences set es_alt = es_alt || array['Debe estar cansado.', 'Debe de estar cansado.']::text[], note_en = coalesce(note_en, '“Se ve que” is a very common Argentine way to say you''re inferring something from what you can see.')
where id = 'c3f96780-8b5b-522c-be57-c6e01cc9dc1a' and es = 'Se ve que está cansado.' and en = 'He must be tired.'
  and not (es_alt && array['Debe estar cansado.', 'Debe de estar cansado.']::text[]);

update public.sentences set es_alt = es_alt || array['Parece que llegó.']::text[], note_en = coalesce(note_en, '“Se ve que” is a very common Argentine way to say you''re inferring something from what you can see.')
where id = 'd88ea041-8177-5f32-b0f4-4b3979d9e229' and es = 'Se ve que llegó.' and en = 'Looks like he''s here.'
  and not (es_alt && array['Parece que llegó.']::text[]);

update public.sentences set es_alt = es_alt || array['Parece que llovió.']::text[], note_en = coalesce(note_en, '“Se ve que” is a very common Argentine way to say you''re inferring something from what you can see.')
where id = '260d9b5a-cb0b-5a49-97df-8df4e77e3999' and es = 'Se ve que llovió.' and en = 'It must have rained.'
  and not (es_alt && array['Parece que llovió.']::text[]);

update public.sentences set es_alt = es_alt || array['Parece que no hay luz.']::text[], note_en = coalesce(note_en, '“Se ve que” is a very common Argentine way to say you''re inferring something from what you can see.')
where id = '288ee4e4-b995-597e-847c-4491e008f390' and es = 'Se ve que no hay luz.' and en = 'Looks like there''s no power.'
  and not (es_alt && array['Parece que no hay luz.']::text[]);

update public.sentences set es_alt = es_alt || array['Según mi jefe, mañana laburamos desde casa.']::text[], note_en = coalesce(note_en, 'Argentines borrowed “home office” from English: “hay home office” means it''s a work-from-home day.')
where id = '64009184-1b97-5cd2-9107-3894038a0a74' and es = 'Según mi jefe, mañana hay home office.' and en = 'According to my boss, we''re working from home tomorrow.'
  and not (es_alt && array['Según mi jefe, mañana laburamos desde casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Uy, parece que está cerrado.']::text[], note_en = coalesce(note_en, '“Se ve que” is a very common Argentine way to say you''re inferring something from what you can see.')
where id = '0390c040-7df0-56ce-93a2-0c14326b0127' and es = 'Uy, se ve que está cerrado.' and en = 'Oh no, looks like it''s closed.'
  and not (es_alt && array['Uy, parece que está cerrado.']::text[]);

update public.sentences set es_alt = es_alt || array['Vinieron juntos a la fiesta; parece que están saliendo.']::text[], note_en = coalesce(note_en, '“Se ve que” is a very common Argentine way to say you''re inferring something from what you can see.')
where id = 'c85b04b5-4c57-5bb6-be3f-ebdef1b3fbff' and es = 'Vinieron juntos a la fiesta; se ve que están saliendo.' and en = 'They came to the party together; it looks like they''re dating.'
  and not (es_alt && array['Vinieron juntos a la fiesta; parece que están saliendo.']::text[]);

update public.sentences set es_alt = es_alt || array['Aparentemente es mentira, así que es mejor no compartirlo.', 'Al parecer es mentira, así que mejor no compartirlo.', 'Al parecer es mentira, así que es mejor no compartirlo.']::text[], note_en = coalesce(note_en, 'In speech Argentines often drop the “es”: “mejor no compartirlo” = it''s better not to share it.')
where id = '0e4a188d-7bc3-5380-92e8-ba984483980c' and es = 'Aparentemente es mentira, así que mejor no compartirlo.' and en = 'Apparently it''s a lie, so it''s better not to share it.'
  and not (es_alt && array['Aparentemente es mentira, así que es mejor no compartirlo.', 'Al parecer es mentira, así que mejor no compartirlo.', 'Al parecer es mentira, así que es mejor no compartirlo.']::text[]);

update public.sentences set es_alt = es_alt || array['Al parecer, esa cadena es de hace años.']::text[]
where id = '01ce2816-2b8b-5e99-a97a-6ae2f0f3dd25' and es = 'Aparentemente, esa cadena es de hace años.' and en = 'Apparently, that chain message is years old.'
  and not (es_alt && array['Al parecer, esa cadena es de hace años.']::text[]);

update public.sentences set es_alt = es_alt || array['Al parecer, lo del paro es verso.']::text[]
where id = 'd1708fd8-dfa7-5b08-8c04-deac82630d58' and es = 'Aparentemente, lo del paro es verso.' and en = 'Apparently, the strike thing is made up.'
  and not (es_alt && array['Al parecer, lo del paro es verso.']::text[]);

update public.sentences set es_alt = es_alt || array['Cada uno tiene su propia versión.', 'Todos tienen su propia versión.']::text[]
where id = '337f8b6d-985b-5f0b-bb0b-8a082849b7b7' and es = 'Cada uno tiene su versión.' and en = 'Everyone has their own version.'
  and not (es_alt && array['Cada uno tiene su propia versión.', 'Todos tienen su propia versión.']::text[]);

update public.sentences set es_alt = es_alt || array['Dijo que estaba enfermo, pero aparentemente era verso.', 'Dijo que estaba enfermo, pero al parecer era verso.']::text[], note_en = coalesce(note_en, '“Por lo visto” is another common way to say “apparently”, literally “from what''s been seen”.')
where id = '20253c7f-f9a1-5e3e-886f-b7662a1690f3' and es = 'Dijo que estaba enfermo, pero por lo visto era verso.' and en = 'He said he was sick, but apparently it was made up.'
  and not (es_alt && array['Dijo que estaba enfermo, pero aparentemente era verso.', 'Dijo que estaba enfermo, pero al parecer era verso.']::text[]);

update public.sentences set es_alt = es_alt || array['El diario lo desmintió anoche.', 'Anoche el diario lo desmintió.']::text[], note_en = coalesce(note_en, 'Argentines say both “anoche” and “ayer a la noche” for last night.')
where id = '31a4428c-bfcc-5a62-9b31-3a5be88dbd83' and es = 'El diario lo desmintió ayer a la noche.' and en = 'The paper denied it last night.'
  and not (es_alt && array['El diario lo desmintió anoche.', 'Anoche el diario lo desmintió.']::text[]);

update public.sentences set es_alt = es_alt || array['Ya dijeron que esa cadena es falsa.']::text[]
where id = '7c33b44b-b436-5dd0-b908-49297bbc28d0' and es = 'Ya desmintieron esa cadena.' and en = 'They already said that chain message is false.'
  and not (es_alt && array['Ya dijeron que esa cadena es falsa.']::text[]);

update public.sentences set es_alt = es_alt || array['Bloqueá tu cuenta del banco.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose thing it is, Spanish usually just says “la” instead of “tu”.')
where id = 'a18ecc18-53fc-5b21-bf01-b1d6f8946ea9' and es = 'Bloqueá la cuenta del banco.' and en = 'Freeze your bank account.'
  and not (es_alt && array['Bloqueá tu cuenta del banco.']::text[]);

update public.sentences set es_alt = es_alt || array['Voy a llamar al gasista.']::text[], note_en = coalesce(note_en, 'For an on-the-spot offer or decision, Argentines often use the plain present: “Llamo” = “I''ll call”.')
where id = '131914a4-fe1f-5158-a19f-b0883ea92d89' and es = 'Llamo al gasista.' and en = 'I''ll call the gas fitter.'
  and not (es_alt && array['Voy a llamar al gasista.']::text[]);

update public.sentences set es_alt = es_alt || array['Por lo visto, el ascensor no va a andar hasta el lunes.']::text[]
where id = '8bfc2ad6-cc24-5433-a35f-fc2051b74fd5' and es = 'Por lo visto, el ascensor no anda hasta el lunes.' and en = 'It seems the elevator won''t work until Monday.'
  and not (es_alt && array['Por lo visto, el ascensor no va a andar hasta el lunes.']::text[]);

update public.sentences set es_alt = es_alt || array['Según el pronóstico, va a llover.']::text[]
where id = '4778d534-dde5-597e-8617-bfa25642a0bb' and es = 'Según el pronóstico, llueve.' and en = 'According to the forecast, it''s going to rain.'
  and not (es_alt && array['Según el pronóstico, va a llover.']::text[]);

update public.sentences set es_alt = es_alt || array['Si te robaron, bloqueá tu tarjeta.']::text[], note_en = coalesce(note_en, 'When it''s obvious whose thing it is, Spanish usually just says “la” instead of “tu”.')
where id = '9f6502ea-17c3-5ca0-83a8-c4f47ba9bc87' and es = 'Si te robaron, bloqueá la tarjeta.' and en = 'If you got robbed, block your card.'
  and not (es_alt && array['Si te robaron, bloqueá tu tarjeta.']::text[]);

update public.sentences set es_alt = es_alt || array['Hay mucha nostalgia en la letra.']::text[]
where id = '9b0bbce7-25fc-5437-a36a-374b86a43fce' and es = 'La letra tiene mucha nostalgia.' and en = 'There''s a lot of nostalgia in the lyrics.'
  and not (es_alt && array['Hay mucha nostalgia en la letra.']::text[]);

update public.sentences set es_alt = es_alt || array['Sé toda la letra de este tango.']::text[], note_en = coalesce(note_en, '“Saberse” something means knowing it by heart; the “me” adds that feeling, but the sentence works without it.')
where id = 'd54f70de-5627-59c3-8de4-31612adc99a1' and es = 'Me sé toda la letra de este tango.' and en = 'I know all the lyrics to this tango.'
  and not (es_alt && array['Sé toda la letra de este tango.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Querés bailar cuando empiece la orquesta?']::text[], note_en = coalesce(note_en, 'Argentines often invite with a plain “we” question: “¿Bailamos?” is literally “Shall we dance?”.')
where id = '04b2ed2a-4d84-5801-ae76-ecc786153a95' and es = '¿Bailamos cuando empiece la orquesta?' and en = 'Want to dance when the orchestra starts?'
  and not (es_alt && array['¿Querés bailar cuando empiece la orquesta?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Querés bailar otra?']::text[], note_en = coalesce(note_en, 'Argentines often invite with a plain “we” question: “¿Bailamos?” is literally “Shall we dance?”.')
where id = '291d727f-f2bb-518a-97be-1c8af76bc4ed' and es = '¿Bailamos otra?' and en = 'Want to dance another one?'
  and not (es_alt && array['¿Querés bailar otra?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, ¿querés bailar?']::text[], note_en = coalesce(note_en, 'Argentines often invite with a plain “we” question: “¿Bailamos?” is literally “Shall we dance?”.')
where id = 'd8063a81-2135-53ac-b694-bd6c56d705a3' and es = 'Che, ¿bailamos?' and en = 'Hey, want to dance?'
  and not (es_alt && array['Che, ¿querés bailar?']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando era chico, la cumbia era la música de mi barrio.', 'Cuando era chica, la cumbia era la música de mi barrio.']::text[], note_en = coalesce(note_en, '“De chico” is the short everyday way to say “cuando era chico”.')
where id = '17f56e2f-d7b6-59db-82de-2d95537f79b8' and es = 'De chico, la cumbia era la música de mi barrio.' and en = 'When I was a kid, cumbia was the music of my neighborhood.'
  and not (es_alt && array['Cuando era chico, la cumbia era la música de mi barrio.', 'Cuando era chica, la cumbia era la música de mi barrio.']::text[]);

update public.sentences set es_alt = es_alt || array['Juan nunca sale de la pista.']::text[]
where id = '86e5196c-0f94-50b9-b6bd-793701d5385a' and es = 'Juan no sale de la pista.' and en = 'Juan never leaves the dance floor.'
  and not (es_alt && array['Juan nunca sale de la pista.']::text[]);

update public.sentences set es_alt = es_alt || array['La pista está llena, pero ¿querés bailar igual?']::text[], note_en = coalesce(note_en, 'Argentines often invite with a plain “we” question: “¿Bailamos?” is literally “Shall we dance?”.')
where id = 'ae0e0db9-6dc5-5a85-8486-c9f3a0e58200' and es = 'La pista está llena, pero ¿bailamos igual?' and en = 'The dance floor is full, but want to dance anyway?'
  and not (es_alt && array['La pista está llena, pero ¿querés bailar igual?']::text[]);

update public.sentences set es_alt = es_alt || array['Los domingos en lo de mi abuela siempre sonaba folclore.', 'Los domingos en lo de mi abuela sonaba siempre folclore.']::text[]
where id = '85bba6b3-4c8a-5974-848b-0e4cc69cd072' and es = 'Los domingos en lo de mi abuela sonaba folclore.' and en = 'On Sundays at my grandma''s, there was always folk music playing.'
  and not (es_alt && array['Los domingos en lo de mi abuela siempre sonaba folclore.', 'Los domingos en lo de mi abuela sonaba siempre folclore.']::text[]);

update public.sentences set es_alt = es_alt || array['¿De qué cuadro sos hincha?']::text[], note_en = coalesce(note_en, 'In Argentina you “are” your team: “¿De qué cuadro sos?” is the usual way to ask.')
where id = '3043cac5-fcf9-5957-b2ca-55877f7b12fd' and es = '¿De qué cuadro sos?' and en = 'What team do you support?'
  and not (es_alt && array['¿De qué cuadro sos hincha?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Esa es tu guitarra?']::text[]
where id = '3d63d61e-8277-5dd2-94ce-3dc488eea2f6' and es = '¿Es tu guitarra?' and en = 'Is that your guitar?'
  and not (es_alt && array['¿Esa es tu guitarra?']::text[]);

update public.sentences set es_alt = es_alt || array['Cuando metió ese golazo, toda la hinchada gritó.']::text[]
where id = 'bba78f63-d11e-5775-b5b0-585af70a7dbc' and es = 'Cuando metió el golazo, toda la hinchada gritó.' and en = 'When he scored that great goal, all the fans shouted.'
  and not (es_alt && array['Cuando metió ese golazo, toda la hinchada gritó.']::text[]);

update public.sentences set es_alt = es_alt || array['Llevá la guitarra al asado, porque mi tío quiere cantar folclore.']::text[], note_en = coalesce(note_en, 'After an order or request, Spanish often gives the reason with a short “que” instead of “porque”.')
where id = 'c0e079e3-7728-5109-b402-f8bcda51cde9' and es = 'Llevá la guitarra al asado, que mi tío quiere cantar folclore.' and en = 'Bring the guitar to the asado, because my uncle wants to sing folk music.'
  and not (es_alt && array['Llevá la guitarra al asado, porque mi tío quiere cantar folclore.']::text[]);

update public.sentences set es_alt = es_alt || array['Voy a poner rock nacional.']::text[], note_en = coalesce(note_en, 'For an on-the-spot offer or decision, Argentines often use the plain present: “Pongo” = “I''ll put on”.')
where id = '020b9718-aa4d-581e-ac99-2b6c46db07d4' and es = 'Pongo rock nacional.' and en = 'I''ll put on some Argentine rock.'
  and not (es_alt && array['Voy a poner rock nacional.']::text[]);

update public.sentences set es_alt = es_alt || array['Me quedé sin chimichurri.']::text[]
where id = '8ba08689-b8d5-5063-b2cb-953647d7dcff' and es = 'Se me acabó el chimichurri.' and en = 'I ran out of chimichurri.'
  and not (es_alt && array['Me quedé sin chimichurri.']::text[]);

update public.sentences set es_alt = es_alt || array['Se rompió mi guitarra.', 'Mi guitarra se rompió.']::text[], note_en = coalesce(note_en, '“Se me rompió” shows it happened to you; Spanish often prefers this over saying “mi guitarra”.')
where id = '62c74dd1-ceee-5c56-bf0d-4def25ad21d0' and es = 'Se me rompió la guitarra.' and en = 'My guitar broke.'
  and not (es_alt && array['Se rompió mi guitarra.', 'Mi guitarra se rompió.']::text[]);

update public.sentences set es_alt = es_alt || array['Nos quedamos sin entraña, pero queda vacío.']::text[]
where id = 'a7cf4d74-9745-5c8e-86a2-08e96a8e8144' and es = 'Se nos acabó la entraña, pero queda vacío.' and en = 'We ran out of skirt steak, but there''s flank steak left.'
  and not (es_alt && array['Nos quedamos sin entraña, pero queda vacío.']::text[]);

update public.sentences set es_alt = es_alt || array['Con el costo de vida de acá, no puedo ahorrar.', 'Con el costo de vida acá, no puedo ahorrar.']::text[]
where id = 'aa7f47a0-b7eb-57df-9b81-55257cbf203e' and es = 'Con el costo de vida que hay acá, no puedo ahorrar.' and en = 'With the cost of living here, I can''t save.'
  and not (es_alt && array['Con el costo de vida de acá, no puedo ahorrar.', 'Con el costo de vida acá, no puedo ahorrar.']::text[]);

update public.sentences set es_alt = es_alt || array['Gano menos, pero tengo mejor calidad de vida.', 'Gano menos, pero tengo una mejor calidad de vida.']::text[]
where id = '7f97ec55-927d-5df9-b984-bb69015f9f18' and es = 'Gano menos, pero tengo más calidad de vida.' and en = 'I earn less, but I have a better quality of life.'
  and not (es_alt && array['Gano menos, pero tengo mejor calidad de vida.', 'Gano menos, pero tengo una mejor calidad de vida.']::text[]);

update public.sentences set es_alt = es_alt || array['Quiero mejor calidad de vida.', 'Quiero una mejor calidad de vida.']::text[]
where id = '5dd49c37-6fb4-565d-bcd3-56d0e7b61383' and es = 'Quiero más calidad de vida.' and en = 'I want a better quality of life.'
  and not (es_alt && array['Quiero mejor calidad de vida.', 'Quiero una mejor calidad de vida.']::text[]);

update public.sentences set es_alt = es_alt || array['Todavía vivo con mis viejos por el costo de vida.', 'Todavía estoy viviendo con mis viejos por el costo de vida.']::text[]
where id = '4f615875-a4c2-56f1-96e1-13cf19b6167b' and es = 'Sigo viviendo con mis viejos por el costo de vida.' and en = 'I''m still living with my parents because of the cost of living.'
  and not (es_alt && array['Todavía vivo con mis viejos por el costo de vida.', 'Todavía estoy viviendo con mis viejos por el costo de vida.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo planes.']::text[], note_en = coalesce(note_en, '“Tengo un compromiso” is a common polite way to say you already have something on, without giving details.')
where id = '470621ef-4071-5054-94cf-22172366ed8d' and es = 'Tengo un compromiso.' and en = 'I have plans.'
  and not (es_alt && array['Tengo planes.']::text[]);

update public.sentences set es_alt = es_alt || array['¡La próxima vez voy!', '¡Voy la próxima vez!']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = '475f855d-2b86-587f-bbdd-457d3a517a72' and es = '¡La próxima voy!' and en = 'I''ll go next time!'
  and not (es_alt && array['¡La próxima vez voy!', '¡Voy la próxima vez!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Recibiste la invitación al cumple de Juli?']::text[]
where id = 'c56fcf1e-bea7-5fbc-8aca-8494f5b9688c' and es = '¿Te llegó la invitación al cumple de Juli?' and en = 'Did you get the invitation to Juli''s birthday?'
  and not (es_alt && array['¿Recibiste la invitación al cumple de Juli?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Qué te parece si vamos otro día?', '¿Y si vamos otro día?']::text[]
where id = 'e01f7a68-afd8-5e94-83f1-c6e24d1d7d91' and es = '¿Te parece si vamos otro día?' and en = 'How about we go another day?'
  and not (es_alt && array['¿Qué te parece si vamos otro día?', '¿Y si vamos otro día?']::text[]);

update public.sentences set es_alt = es_alt || array['Dale, la próxima vez.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = 'e4cf9390-4bd3-5eb2-9f96-6e11e8253bc5' and es = 'Dale, la próxima.' and en = 'Sure, next time.'
  and not (es_alt && array['Dale, la próxima vez.']::text[]);

update public.sentences set es_alt = es_alt || array['Esta vez no llego, pero la próxima vez la hacemos en mi casa.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = '82d7dd55-49a2-5e1a-8e00-e3a786d43a50' and es = 'Esta vez no llego, pero la próxima la hacemos en mi casa.' and en = 'This time I can''t make it, but next time we''ll do it at my house.'
  and not (es_alt && array['Esta vez no llego, pero la próxima vez la hacemos en mi casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Este finde no creo que podamos, ¿la próxima vez?', 'No creo que podamos este finde, ¿la próxima vez?']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = 'f4b6f37f-41b0-56f5-ba6d-78f7dfb24441' and es = 'Este finde no creo que podamos, ¿la próxima?' and en = 'I don''t think we can this weekend, next time?'
  and not (es_alt && array['Este finde no creo que podamos, ¿la próxima vez?', 'No creo que podamos este finde, ¿la próxima vez?']::text[]);

update public.sentences set es_alt = es_alt || array['Gracias por invitarme, me encantaría, pero mañana me levanto temprano.']::text[], note_en = coalesce(note_en, '“Madrugar” packs “get up early” into one verb.')
where id = 'a50dbef9-1600-5ce8-bb06-b929d42d01f2' and es = 'Gracias por invitarme, me encantaría, pero mañana madrugo.' and en = 'Thanks for inviting me, I would love to, but tomorrow I get up early.'
  and not (es_alt && array['Gracias por invitarme, me encantaría, pero mañana me levanto temprano.']::text[]);

update public.sentences set es_alt = es_alt || array['Gracias por invitarme; no es que no quiera, es que no tengo un mango.', 'Gracias por invitarme; no es que no quiera, es que no tengo un peso.']::text[]
where id = '92fc710b-deeb-509a-9c44-ac13f0663df6' and es = 'Gracias por invitarme; no es que no quiera, es que estoy sin un mango.' and en = 'Thanks for inviting me; it''s not that I don''t want to, it''s that I don''t have a peso.'
  and not (es_alt && array['Gracias por invitarme; no es que no quiera, es que no tengo un mango.', 'Gracias por invitarme; no es que no quiera, es que no tengo un peso.']::text[]);

update public.sentences set es_alt = es_alt || array['Gracias, pero tengo gripe; otro día voy y llevo algo rico.']::text[]
where id = '768bfc1f-816e-549b-b955-457d76acd9bf' and es = 'Gracias, pero estoy engripada; otro día voy y llevo algo rico.' and en = 'Thanks, but I have the flu; some other day I''ll go and bring something tasty.'
  and not (es_alt && array['Gracias, pero tengo gripe; otro día voy y llevo algo rico.']::text[]);

update public.sentences set es_alt = es_alt || array['Hoy no puedo, pero la próxima vez vengo con Belén.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = 'bfc2e9ea-23f2-5d5f-acb9-8ecc709852ee' and es = 'Hoy no puedo, pero la próxima vengo con Belén.' and en = 'I can''t today, but next time I''ll come with Belén.'
  and not (es_alt && array['Hoy no puedo, pero la próxima vez vengo con Belén.']::text[]);

update public.sentences set es_alt = es_alt || array['Hoy salgo muy tarde del laburo, ¿podemos tomar el café otro día?']::text[], note_en = coalesce(note_en, 'A plain present-tense question like “¿tomamos...?” is a very common way to suggest something.')
where id = 'adaaf513-2b37-5898-b6f0-69c90b22ae79' and es = 'Hoy salgo muy tarde del laburo, ¿tomamos el café otro día?' and en = 'Today I leave work very late, can we have the coffee some other day?'
  and not (es_alt && array['Hoy salgo muy tarde del laburo, ¿podemos tomar el café otro día?']::text[]);

update public.sentences set es_alt = es_alt || array['La próxima vez seguro que voy.', 'La próxima vez seguro voy.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = 'cb0713a4-0067-555f-a2f0-a11834d3c0ab' and es = 'La próxima seguro que voy.' and en = 'Next time I''ll definitely go.'
  and not (es_alt && array['La próxima vez seguro que voy.', 'La próxima vez seguro voy.']::text[]);

update public.sentences set es_alt = es_alt || array['La próxima vez vamos, no es que no queramos.', 'Vamos la próxima vez, no es que no queramos.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = 'e8fbbb0e-82d8-509c-8d2b-86f9846fe2ca' and es = 'La próxima vamos, no es que no queramos.' and en = 'We''ll go next time, it''s not that we don''t want to.'
  and not (es_alt && array['La próxima vez vamos, no es que no queramos.', 'Vamos la próxima vez, no es que no queramos.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo miedo de quedar mal.']::text[]
where id = '78f4c142-8041-5966-a407-ad3a643c5b2f' and es = 'Me da miedo quedar mal.' and en = 'I''m afraid of looking bad.'
  and not (es_alt && array['Tengo miedo de quedar mal.']::text[]);

update public.sentences set es_alt = es_alt || array['Me encantaría, pero ese día no puedo: la próxima vez voy.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = '6326aa33-ae79-5c43-97a8-db0da664b31f' and es = 'Me encantaría, pero ese día no puedo: la próxima voy.' and en = 'I would love to, but that day I can''t: next time I''ll go.'
  and not (es_alt && array['Me encantaría, pero ese día no puedo: la próxima vez voy.']::text[]);

update public.sentences set es_alt = es_alt || array['Me perdí tu cumple por el laburo; la próxima vez llevo la torta.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = '526a0238-8e8e-5de3-ac8d-c9591f855b7e' and es = 'Me perdí tu cumple por el laburo; la próxima llevo la torta.' and en = 'I missed your birthday because of work; next time I''ll bring the cake.'
  and not (es_alt && array['Me perdí tu cumple por el laburo; la próxima vez llevo la torta.']::text[]);

update public.sentences set es_alt = es_alt || array['Muchas gracias por la invitación, de verdad.']::text[], note_en = coalesce(note_en, '“Mil gracias” (a thousand thanks) is a warm, everyday way to say thanks so much.')
where id = 'a37aed27-c7b9-5e58-84a6-507b3087a5d6' and es = 'Mil gracias por la invitación, de verdad.' and en = 'Thanks so much for the invitation, really.'
  and not (es_alt && array['Muchas gracias por la invitación, de verdad.']::text[]);

update public.sentences set es_alt = es_alt || array['Si digo que no otra vez, quedo mal.', 'Si digo que no de nuevo, quedo mal.']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you do something again.')
where id = '2d77cf97-969e-5407-9bba-3c8b3271e835' and es = 'Si vuelvo a decir que no, quedo mal.' and en = 'If I say no again, I''ll look bad.'
  and not (es_alt && array['Si digo que no otra vez, quedo mal.', 'Si digo que no de nuevo, quedo mal.']::text[]);

update public.sentences set es_alt = es_alt || array['Gracias por la invitación, pero ya tengo planes.']::text[]
where id = 'cc0fe7ab-0709-5ae7-b088-8151c611b8aa' and es = 'Te agradezco la invitación, pero ya tengo planes.' and en = 'Thanks for the invitation, but I already have plans.'
  and not (es_alt && array['Gracias por la invitación, pero ya tengo planes.']::text[]);

update public.sentences set es_alt = es_alt || array['Tengo otro compromiso, ¿podemos ir otro día?']::text[], note_en = coalesce(note_en, '“Tengo un compromiso” is a common polite way to say you already have something on, without giving details.')
where id = '083d1bad-87e6-526f-a064-179c3f6b9020' and es = 'Tengo otro compromiso, ¿vamos otro día?' and en = 'I have other plans, can we go another day?'
  and not (es_alt && array['Tengo otro compromiso, ¿podemos ir otro día?']::text[]);

update public.sentences set es_alt = es_alt || array['Si fuera vos, no lo hubiera vendido.', 'Si yo fuera vos, no lo hubiera vendido.']::text[], note_en = coalesce(note_en, '“Yo que vos” is the short, everyday way Argentines say “if I were you”.')
where id = '1f160724-389b-5f6f-9f61-79342c54a6c2' and es = 'Yo que vos no lo hubiera vendido.' and en = 'If I were you, I wouldn''t have sold it.'
  and not (es_alt && array['Si fuera vos, no lo hubiera vendido.', 'Si yo fuera vos, no lo hubiera vendido.']::text[]);

update public.sentences set es_alt = es_alt || array['Si nos hubieras avisado, habría comida para vos.', 'Habría comida para vos si nos hubieras avisado.']::text[], note_en = coalesce(note_en, '“Avisar” often goes without saying who gets told; it is understood from context.')
where id = '8a1e0bcb-da99-5a54-a9aa-edb9546b2dd5' and es = 'Si hubieras avisado, habría comida para vos.' and en = 'If you had told us, there would be food for you.'
  and not (es_alt && array['Si nos hubieras avisado, habría comida para vos.', 'Habría comida para vos si nos hubieras avisado.']::text[]);

update public.sentences set es_alt = es_alt || array['Si hubieras visto el mail, sabrías a qué hora empieza.']::text[]
where id = 'c39eba42-9c18-5c86-8542-efac768364ce' and es = 'Si hubieras visto el mail, sabrías a qué hora es.' and en = 'If you had seen the email, you''d know what time it starts.'
  and not (es_alt && array['Si hubieras visto el mail, sabrías a qué hora empieza.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Compraste los pasajes? —No, cambié de idea.', '—¿Compraste los pasajes? —No, cambié de opinión.']::text[], note_en = coalesce(note_en, '“Arrepentirse” also means backing out of something you were going to do.')
where id = '19bc9c01-38f1-5c7e-9fbe-17ef9d5b7abf' and es = '—¿Compraste los pasajes? —No, me arrepentí.' and en = '—Did you buy the tickets? —No, I changed my mind.'
  and not (es_alt && array['—¿Compraste los pasajes? —No, cambié de idea.', '—¿Compraste los pasajes? —No, cambié de opinión.']::text[]);

update public.sentences set es_alt = es_alt || array['Al final cambié de idea.', 'Al final cambié de opinión.']::text[], note_en = coalesce(note_en, '“Arrepentirse” also means backing out of something you were going to do.')
where id = '8552df4f-3390-5b65-9273-b615c36b5a05' and es = 'Al final me arrepentí.' and en = 'In the end, I changed my mind.'
  and not (es_alt && array['Al final cambié de idea.', 'Al final cambié de opinión.']::text[]);

update public.sentences set es_alt = es_alt || array['Cambié de idea a tiempo.', 'Cambié de opinión a tiempo.']::text[], note_en = coalesce(note_en, '“Arrepentirse” also means backing out of something you were going to do.')
where id = 'cb04a441-34a1-52db-a5fa-faaeec70a056' and es = 'Me arrepentí a tiempo.' and en = 'I changed my mind in time.'
  and not (es_alt && array['Cambié de idea a tiempo.', 'Cambié de opinión a tiempo.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Metí la pata otra vez!', '¡Metí la pata de nuevo!']::text[], note_en = coalesce(note_en, '“Volver a” + verb is a very common way to say you did something again.')
where id = '7d4245aa-39a5-5325-907a-8838ad9054f9' and es = '¡Volví a meter la pata!' and en = 'I messed up again!'
  and not (es_alt && array['¡Metí la pata otra vez!', '¡Metí la pata de nuevo!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Perdiste el vuelo por el paro? ¡Qué lástima!']::text[], note_en = coalesce(note_en, '“¡Qué macana!” is a very Argentine way to say “what a shame” or “what a pain”.')
where id = '1c77132d-f90d-5dcf-95ea-7874ff47b3bf' and es = '¿Perdiste el vuelo por el paro? ¡Qué macana!' and en = 'You missed the flight because of the strike? What a shame!'
  and not (es_alt && array['¿Perdiste el vuelo por el paro? ¡Qué lástima!']::text[]);

update public.sentences set es_alt = es_alt || array['Recién metí la pata.']::text[]
where id = '1e29efe1-26ea-5fd4-85ab-59240ace3c9f' and es = 'Acabo de meter la pata.' and en = 'I just messed up.'
  and not (es_alt && array['Recién metí la pata.']::text[]);

update public.sentences set es_alt = es_alt || array['Al final, Rocío cambió de idea.', 'Al final, Rocío cambió de opinión.']::text[], note_en = coalesce(note_en, '“Arrepentirse” also means backing out of something you were going to do.')
where id = '960bd1a0-3345-5b1e-99a2-a7f3677f7cef' and es = 'Al final, Rocío se arrepintió.' and en = 'In the end, Rocío changed her mind.'
  and not (es_alt && array['Al final, Rocío cambió de idea.', 'Al final, Rocío cambió de opinión.']::text[]);

update public.sentences set es_alt = es_alt || array['Juan cambió de idea.', 'Juan cambió de opinión.']::text[], note_en = coalesce(note_en, '“Arrepentirse” also means backing out of something you were going to do.')
where id = 'ba90411a-d5e8-5546-988a-b50298aebe73' and es = 'Juan se arrepintió.' and en = 'Juan changed his mind.'
  and not (es_alt && array['Juan cambió de idea.', 'Juan cambió de opinión.']::text[]);

update public.sentences set es_alt = es_alt || array['Qué lástima que llueva justo el día del asado.']::text[], note_en = coalesce(note_en, '“¡Qué macana!” is a very Argentine way to say “what a shame” or “what a pain”.')
where id = 'ef370198-207a-5480-8a69-5c54afc5d52a' and es = 'Qué macana que llueva justo el día del asado.' and en = 'What a shame that it''s raining right on the day of the asado.'
  and not (es_alt && array['Qué lástima que llueva justo el día del asado.']::text[]);

update public.sentences set es_alt = es_alt || array['Ustedes nos tendrían que haber avisado.']::text[], note_en = coalesce(note_en, '“Avisar” often goes without saying who gets told; it is understood from context.')
where id = '3d97e77e-f735-5b25-bf80-976b31aae5bd' and es = 'Ustedes tendrían que haber avisado.' and en = 'You all should have let us know.'
  and not (es_alt && array['Ustedes nos tendrían que haber avisado.']::text[]);

update public.sentences set es_alt = es_alt || array['Lo sé, metí la pata.']::text[], note_en = coalesce(note_en, 'Argentines usually say “ya sé” for “I know”; the “ya” does not mean “already” here.')
where id = 'cd169576-4039-5c7f-b353-c4f83e7b5b70' and es = 'Ya sé, metí la pata.' and en = 'I know, I messed up.'
  and not (es_alt && array['Lo sé, metí la pata.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Viene Santi? —Ojalá que sí.', '—¿Viene Santi? —Espero que sí.']::text[], note_en = coalesce(note_en, 'A bare “Ojalá” is a complete answer: it means “I hope so”.')
where id = '49aaaa76-7050-5b71-b5c1-62215c68f692' and es = '—¿Viene Santi? —Ojalá.' and en = '—Is Santi coming? —I hope so.'
  and not (es_alt && array['—¿Viene Santi? —Ojalá que sí.', '—¿Viene Santi? —Espero que sí.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Tendrías que haber visto el partido!']::text[], note_en = coalesce(note_en, '“¡Hubieras...!” on its own is a very common way to say “you should have...”.')
where id = 'd516ae6a-44fa-5801-b289-3eb30b2df53c' and es = '¡Hubieras visto el partido!' and en = 'You should have seen the game!'
  and not (es_alt && array['¡Tendrías que haber visto el partido!']::text[]);

update public.sentences set es_alt = es_alt || array['¿La próxima vez venís con Cami?', '¿Venís con Cami la próxima vez?']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = 'b00aa868-fff9-5a33-8e44-b1187c01eb76' and es = '¿La próxima venís con Cami?' and en = 'Will you come with Cami next time?'
  and not (es_alt && array['¿La próxima vez venís con Cami?', '¿Venís con Cami la próxima vez?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tenés planes el sábado?', '¿Tenés algún plan el sábado?']::text[]
where id = '31901af6-97c8-5646-ad98-3789a16a0f89' and es = '¿Tenés algún compromiso el sábado?' and en = 'Do you have any plans on Saturday?'
  and not (es_alt && array['¿Tenés planes el sábado?', '¿Tenés algún plan el sábado?']::text[]);

update public.sentences set es_alt = es_alt || array['Che, me hubieras avisado.', 'Che, tendrías que haber avisado.', 'Che, me tendrías que haber avisado.']::text[], note_en = coalesce(note_en, '“¡Hubieras...!” on its own is a very common way to say “you should have...”.')
where id = 'e66ca419-15de-5f4f-b133-19b5aee26501' and es = 'Che, hubieras avisado.' and en = 'Hey, you should have told me.'
  and not (es_alt && array['Che, me hubieras avisado.', 'Che, tendrías que haber avisado.', 'Che, me tendrías que haber avisado.']::text[]);

update public.sentences set es_alt = es_alt || array['Fue un error decir que no, la próxima vez voy.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = 'b0f18be6-dce1-5405-b441-20094631d724' and es = 'Fue un error decir que no, la próxima voy.' and en = 'It was a mistake to say no, next time I''ll go.'
  and not (es_alt && array['Fue un error decir que no, la próxima vez voy.']::text[]);

update public.sentences set es_alt = es_alt || array['La próxima vez avisame antes.', 'Avisame antes la próxima vez.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = '17e4f5ab-b25b-520d-a02f-5231f3183840' and es = 'La próxima avisame antes.' and en = 'Next time let me know beforehand.'
  and not (es_alt && array['La próxima vez avisame antes.', 'Avisame antes la próxima vez.']::text[]);

update public.sentences set es_alt = es_alt || array['La próxima vez te aviso.', 'Te aviso la próxima vez.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = 'ad006616-4a74-54fc-ba20-f962515012f5' and es = 'La próxima te aviso.' and en = 'Next time I''ll let you know.'
  and not (es_alt && array['La próxima vez te aviso.', 'Te aviso la próxima vez.']::text[]);

update public.sentences set es_alt = es_alt || array['La próxima vez tenemos que reservar antes.', 'Tenemos que reservar antes la próxima vez.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = '5fa10ab2-7045-5f63-a190-cb2da3ae0a16' and es = 'La próxima tenemos que reservar antes.' and en = 'Next time we have to book ahead.'
  and not (es_alt && array['La próxima vez tenemos que reservar antes.', 'Tenemos que reservar antes la próxima vez.']::text[]);

update public.sentences set es_alt = es_alt || array['La próxima vez voy, posta.', 'Posta, la próxima vez voy.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = 'f65819c1-3325-56a2-833f-85bcd08585e9' and es = 'La próxima voy, posta.' and en = 'Next time I''ll go, for real.'
  and not (es_alt && array['La próxima vez voy, posta.', 'Posta, la próxima vez voy.']::text[]);

update public.sentences set es_alt = es_alt || array['Me arrepiento de no haber ido; la próxima vez voy aunque llueva.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = 'a1112493-72c7-5bc6-9253-96aebf5b9b69' and es = 'Me arrepiento de no haber ido; la próxima voy aunque llueva.' and en = 'I regret not having gone; next time I''ll go even if it rains.'
  and not (es_alt && array['Me arrepiento de no haber ido; la próxima vez voy aunque llueva.']::text[]);

update public.sentences set es_alt = es_alt || array['Me encantaría, pero ya tengo planes.']::text[], note_en = coalesce(note_en, '“Tengo un compromiso” is a common polite way to say you already have something on, without giving details.')
where id = '1640d675-ee5b-5125-8122-b6084f2b60cf' and es = 'Me encantaría, pero ya tengo un compromiso.' and en = 'I''d love to, but I already have plans.'
  and not (es_alt && array['Me encantaría, pero ya tengo planes.']::text[]);

update public.sentences set es_alt = es_alt || array['Recibí la invitación.']::text[]
where id = '4cf1d092-75fb-5197-9ee5-8ce04e926261' and es = 'Me llegó la invitación.' and en = 'I got the invitation.'
  and not (es_alt && array['Recibí la invitación.']::text[]);

update public.sentences set es_alt = es_alt || array['Metí la pata con el regalo; la próxima vez le pregunto a tu hermana.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = '2346a4cc-3862-506a-9414-ddc16335a4bd' and es = 'Metí la pata con el regalo; la próxima le pregunto a tu hermana.' and en = 'I messed up with the gift; next time I''ll ask your sister.'
  and not (es_alt && array['Metí la pata con el regalo; la próxima vez le pregunto a tu hermana.']::text[]);

update public.sentences set es_alt = es_alt || array['Muchas gracias por la invitación, pero no puedo.']::text[], note_en = coalesce(note_en, '“Mil gracias” (a thousand thanks) is a warm, everyday way to say thanks so much.')
where id = '153eb32e-7884-5732-84f2-297fb3b2e66e' and es = 'Mil gracias por la invitación, pero no puedo.' and en = 'Thanks so much for the invitation, but I can''t.'
  and not (es_alt && array['Muchas gracias por la invitación, pero no puedo.']::text[]);

update public.sentences set es_alt = es_alt || array['No recibí ninguna invitación.']::text[]
where id = '113a5526-6c85-5274-b22c-171b00066576' and es = 'No me llegó ninguna invitación.' and en = 'I didn''t get any invitation.'
  and not (es_alt && array['No recibí ninguna invitación.']::text[]);

update public.sentences set es_alt = es_alt || array['No pude ir al asado, pero la próxima vez voy seguro.', 'No pude ir al asado, pero la próxima vez seguro voy.']::text[], note_en = coalesce(note_en, 'Argentines often shorten “la próxima vez” to just “la próxima”.')
where id = 'ad760e73-b1a7-52d9-b6e4-8a53c2d9bf13' and es = 'No pude ir al asado, pero la próxima voy seguro.' and en = 'I couldn''t go to the asado, but next time I''ll definitely go.'
  and not (es_alt && array['No pude ir al asado, pero la próxima vez voy seguro.', 'No pude ir al asado, pero la próxima vez seguro voy.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que le caiga bien a tu mamá.']::text[]
where id = '4e1d9f44-46d8-5947-8c64-4e20ecdaf049' and es = 'Ojalá le caiga bien a tu mamá.' and en = 'I hope your mom likes him.'
  and not (es_alt && array['Ojalá que le caiga bien a tu mamá.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que le interese la propuesta.']::text[]
where id = 'c7247726-a378-5fd0-9272-b2cf1bcb2c5c' and es = 'Ojalá le interese la propuesta.' and en = 'I hope he''s interested in the proposal.'
  and not (es_alt && array['Ojalá que le interese la propuesta.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que no te caiga mal el asado.']::text[]
where id = '9560a222-f914-5a05-be5b-84f058ce2141' and es = 'Ojalá no te caiga mal el asado.' and en = 'I hope the asado doesn''t upset your stomach.'
  and not (es_alt && array['Ojalá que no te caiga mal el asado.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que Santi no se olvide.']::text[]
where id = '8c69ff9d-aaee-510c-859f-b1bb3407cc49' and es = 'Ojalá Santi no se olvide.' and en = 'I hope Santi doesn''t forget.'
  and not (es_alt && array['Ojalá que Santi no se olvide.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que te caiga bien Mati.']::text[]
where id = '8d644247-3d74-5c31-a661-14d36f86ad11' and es = 'Ojalá te caiga bien Mati.' and en = 'I hope you like Mati.'
  and not (es_alt && array['Ojalá que te caiga bien Mati.']::text[]);

update public.sentences set es_alt = es_alt || array['Ojalá que te interese.']::text[]
where id = '758e2acf-ad13-5e75-aced-1a5fff30eec6' and es = 'Ojalá te interese.' and en = 'I hope it interests you.'
  and not (es_alt && array['Ojalá que te interese.']::text[]);

update public.sentences set es_alt = es_alt || array['Si no tuviera esos planes, iría con vos.', 'Iría con vos si no tuviera esos planes.']::text[]
where id = 'ea3b3d8d-2c10-58ed-a07a-c57a72d3906a' and es = 'Si no tuviera ese compromiso, iría con vos.' and en = 'If I didn''t have those plans, I''d go with you.'
  and not (es_alt && array['Si no tuviera esos planes, iría con vos.', 'Iría con vos si no tuviera esos planes.']::text[]);

update public.sentences set es_alt = es_alt || array['Les tendría que haber avisado antes; ahora voy a quedar mal con tu familia.']::text[], note_en = coalesce(note_en, '“Avisar” often goes without saying who gets told; it is understood from context.')
where id = '30a13b42-c2c1-5e8d-be63-00c58c311cb5' and es = 'Tendría que haber avisado antes; ahora voy a quedar mal con tu familia.' and en = 'I should have let them know earlier; now I''m going to look bad to your family.'
  and not (es_alt && array['Les tendría que haber avisado antes; ahora voy a quedar mal con tu familia.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Esta noche vas a la casa de tu novia?', '¿Vas a la casa de tu novia esta noche?']::text[], note_en = coalesce(note_en, '“Lo de” + a person is the everyday Argentine way to say “so-and-so''s place”.')
where id = '2d6959aa-e63c-50ae-953c-d744027edefc' and es = '¿Esta noche vas a lo de tu novia?' and en = 'Are you going to your girlfriend''s place tonight?'
  and not (es_alt && array['¿Esta noche vas a la casa de tu novia?', '¿Vas a la casa de tu novia esta noche?']::text[]);

update public.sentences set es_alt = es_alt || array['Bueno, lo que importa es que llegaste.']::text[]
where id = '2ac3de12-216b-53eb-8f8a-1dec4d6e6add' and es = 'Bueno, lo importante es que llegaste.' and en = 'Well, what matters is that you got here.'
  and not (es_alt && array['Bueno, lo que importa es que llegaste.']::text[]);

update public.sentences set es_alt = es_alt || array['Eso es lo que importa.']::text[]
where id = 'dae129fc-42f2-5db1-8350-507138f51255' and es = 'Eso es lo importante.' and en = 'That''s what matters.'
  and not (es_alt && array['Eso es lo que importa.']::text[]);

update public.sentences set es_alt = es_alt || array['Lo que pasó anoche me molesta un poco.', 'Me molesta un poco lo que pasó anoche.']::text[], note_en = coalesce(note_en, '“Lo de anoche” is a quick way to point at “that thing from last night” without spelling it out.')
where id = 'd8cd7811-5793-547e-9cf7-0755a5e086b5' and es = 'Lo de anoche me molesta un poco.' and en = 'What happened last night bothers me a little.'
  and not (es_alt && array['Lo que pasó anoche me molesta un poco.', 'Me molesta un poco lo que pasó anoche.']::text[]);

update public.sentences set es_alt = es_alt || array['Lo que importa es la familia.']::text[]
where id = '4ac9f904-67b0-50af-8941-2339dcd0e126' and es = 'Lo importante es la familia.' and en = 'What matters is family.'
  and not (es_alt && array['Lo que importa es la familia.']::text[]);

update public.sentences set es_alt = es_alt || array['Lo que importa es que estás bien.']::text[]
where id = 'd708b14e-c5f1-55da-8d29-f475f7f55309' and es = 'Lo importante es que estás bien.' and en = 'What matters is that you''re fine.'
  and not (es_alt && array['Lo que importa es que estás bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Lo que importa es que ganamos.']::text[]
where id = '5f13567a-e769-5a81-9f75-b845454b9e3f' and es = 'Lo importante es que ganamos.' and en = 'What matters is that we won.'
  and not (es_alt && array['Lo que importa es que ganamos.']::text[]);

update public.sentences set es_alt = es_alt || array['Lo que importa es que la pases bien en Mendoza.']::text[]
where id = '5dd8f326-c194-5e1b-8d32-423aec625255' and es = 'Lo importante es que la pases bien en Mendoza.' and en = 'What matters is that you have a good time in Mendoza.'
  and not (es_alt && array['Lo que importa es que la pases bien en Mendoza.']::text[]);

update public.sentences set es_alt = es_alt || array['Lo que importa no es la plata.']::text[]
where id = '56a69d95-5408-5567-acf0-056dc86c1dc6' and es = 'Lo importante no es la plata.' and en = 'What matters isn''t the money.'
  and not (es_alt && array['Lo que importa no es la plata.']::text[]);

update public.sentences set es_alt = es_alt || array['Lo que pasa es que me voy a la casa de mis viejos.']::text[], note_en = coalesce(note_en, '“Lo de” + a person is the everyday Argentine way to say “so-and-so''s place”.')
where id = 'a45bf412-925c-545c-baf3-591c192440e6' and es = 'Lo que pasa es que me voy a lo de mis viejos.' and en = 'The thing is, I''m leaving for my parents'' place.'
  and not (es_alt && array['Lo que pasa es que me voy a la casa de mis viejos.']::text[]);

update public.sentences set es_alt = es_alt || array['No ganamos, pero lo que importa es que jugamos bien.']::text[]
where id = 'db0998b6-b72b-5faa-99a9-ecf9fde929bc' and es = 'No ganamos, pero lo importante es que jugamos bien.' and en = 'We didn''t win, but what matters is that we played well.'
  and not (es_alt && array['No ganamos, pero lo que importa es que jugamos bien.']::text[]);

update public.sentences set es_alt = es_alt || array['Vamos a la casa de Mica.']::text[], note_en = coalesce(note_en, '“Lo de” + a person is the everyday Argentine way to say “so-and-so''s place”.')
where id = 'e178a921-d575-5a3d-baae-0754a66634a4' and es = 'Vamos a lo de Mica.' and en = 'Let''s go to Mica''s place.'
  and not (es_alt && array['Vamos a la casa de Mica.']::text[]);

update public.sentences set es_alt = es_alt || array['Vengo de la casa de mi hermana.']::text[], note_en = coalesce(note_en, '“Lo de” + a person is the everyday Argentine way to say “so-and-so''s place”.')
where id = '5c37c82e-23ee-51a9-85c6-2ff1d6f41b9b' and es = 'Vengo de lo de mi hermana.' and en = 'I''m coming from my sister''s place.'
  and not (es_alt && array['Vengo de la casa de mi hermana.']::text[]);

update public.sentences set es_alt = es_alt || array['—¿Otra multa? —Bueno, no hay dos sin tres.']::text[], note_en = coalesce(note_en, 'Argentines often start a reply with a drawn-out “Y,” where English says “Well,”: it sounds resigned, like “what did you expect?”.')
where id = '3f727d71-88ac-512d-beac-3c3f3acebf7a' and es = '—¿Otra multa? —Y, no hay dos sin tres.' and en = '—Another ticket? —Well, there''s always a third time.'
  and not (es_alt && array['—¿Otra multa? —Bueno, no hay dos sin tres.']::text[]);

update public.sentences set es_alt = es_alt || array['—No me gusta reclamar. —Bueno, el que no llora no mama.']::text[], note_en = coalesce(note_en, 'Argentines often start a reply with a drawn-out “Y,” where English says “Well,”: it sounds resigned, like “what did you expect?”.')
where id = 'f43da7ac-7555-5bfb-b64f-55804667fdc4' and es = '—No me gusta reclamar. —Y, el que no llora no mama.' and en = '—I don''t like complaining. —Well, if you don''t ask, you don''t get.'
  and not (es_alt && array['—No me gusta reclamar. —Bueno, el que no llora no mama.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Hablando del rey de Roma! Pasá, que hace fresco.']::text[], note_en = coalesce(note_en, '“Fresquito” is the diminutive of “fresco”. Argentines love it for weather: it makes the cold sound mild and almost cozy.')
where id = '27de6e9d-0215-5cdc-a175-235ea1e5dbe0' and es = '¡Hablando del rey de Roma! Pasá, que hace fresquito.' and en = 'We were just talking about you! Come in, it''s chilly out.'
  and not (es_alt && array['¡Hablando del rey de Roma! Pasá, que hace fresco.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Qué lindo sol!']::text[], note_en = coalesce(note_en, '“Solcito” is “sol” with an affectionate diminutive: the nice, gentle sun you want to sit in.')
where id = '83f3c27f-70a5-50e5-9929-5f31840ff83f' and es = '¡Qué lindo solcito!' and en = 'What lovely sunshine!'
  and not (es_alt && array['¡Qué lindo sol!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Hace fresco afuera?', '¿Afuera hace fresco?']::text[], note_en = coalesce(note_en, '“Fresquito” is the diminutive of “fresco”. Argentines love it for weather: it makes the cold sound mild and almost cozy.')
where id = '95313a69-9d8d-5107-8ea2-3d18757a732e' and es = '¿Hace fresquito afuera?' and en = 'Is it chilly outside?'
  and not (es_alt && array['¿Hace fresco afuera?', '¿Afuera hace fresco?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Helado con este fresco? Cada loco con su tema.']::text[], note_en = coalesce(note_en, '“Fresquito” is the diminutive of “fresco”. Argentines love it for weather: it makes the cold sound mild and almost cozy.')
where id = '39ae778f-fa30-5ef4-84d3-46df3907ae5d' and es = '¿Helado con este fresquito? Cada loco con su tema.' and en = 'Ice cream in this chilly weather? To each their own.'
  and not (es_alt && array['¿Helado con este fresco? Cada loco con su tema.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Tan temprano?']::text[], note_en = coalesce(note_en, '“Tempranito” is “temprano” with a diminutive. Argentines use it all the time for “nice and early”.')
where id = '39b6ca6a-5b7e-54b1-9862-c16512865be1' and es = '¿Tan tempranito?' and en = 'That early?'
  and not (es_alt && array['¿Tan temprano?']::text[]);

update public.sentences set es_alt = es_alt || array['A la mañana temprano hace fresco, así que llevá campera.', 'A la mañana temprano hace fresquito, así que llevá campera.', 'A la mañana tempranito hace fresco, así que llevá campera.']::text[], note_en = coalesce(note_en, '“Tempranito” and “fresquito” are the diminutives of “temprano” and “fresco”. Argentines use them a lot; they make things sound softer.')
where id = '4353f47b-6547-54f6-baee-601957894f76' and es = 'A la mañana tempranito hace fresquito, así que llevá campera.' and en = 'Early in the morning it''s chilly, so take a jacket.'
  and not (es_alt && array['A la mañana temprano hace fresco, así que llevá campera.', 'A la mañana temprano hace fresquito, así que llevá campera.', 'A la mañana tempranito hace fresco, así que llevá campera.']::text[]);

update public.sentences set es_alt = es_alt || array['Cerrá la ventana, que hace fresco.']::text[], note_en = coalesce(note_en, '“Fresquito” is the diminutive of “fresco”. Argentines love it for weather: it makes the cold sound mild and almost cozy.')
where id = 'c39e5043-e8db-53fb-a6b0-d0e8fa01b745' and es = 'Cerrá la ventana, que hace fresquito.' and en = 'Close the window, it''s chilly.'
  and not (es_alt && array['Cerrá la ventana, que hace fresco.']::text[]);

update public.sentences set es_alt = es_alt || array['Con este fresco, quiero algo caliente.', 'Con este fresquito, quiero algo caliente.', 'Con este fresco, quiero algo calentito.']::text[], note_en = coalesce(note_en, '“Fresquito” and “calentito” are the diminutives of “fresco” and “caliente”. Argentines use them a lot; they sound cozy.')
where id = 'b92df38f-2a77-5c46-bbdf-e7e0274479b5' and es = 'Con este fresquito, quiero algo calentito.' and en = 'With this chill, I want something warm.'
  and not (es_alt && array['Con este fresco, quiero algo caliente.', 'Con este fresquito, quiero algo caliente.', 'Con este fresco, quiero algo calentito.']::text[]);

update public.sentences set es_alt = es_alt || array['Hace fresco, pero hay sol.', 'Hace fresquito, pero hay sol.', 'Hace fresco, pero hay solcito.']::text[], note_en = coalesce(note_en, '“Fresquito” and “solcito” are the diminutives of “fresco” and “sol”. Argentines use them a lot when talking about the weather.')
where id = '83036019-6cee-5555-8ce6-8297bc3693bf' and es = 'Hace fresquito, pero hay solcito.' and en = 'It''s chilly, but the sun''s out.'
  and not (es_alt && array['Hace fresco, pero hay sol.', 'Hace fresquito, pero hay sol.', 'Hace fresco, pero hay solcito.']::text[]);

update public.sentences set es_alt = es_alt || array['Hacemos lo que sea, pero salgamos un toque al sol.']::text[], note_en = coalesce(note_en, '“Solcito” is “sol” with an affectionate diminutive: the nice, gentle sun you want to sit in.')
where id = '34101a83-c5a7-50ee-ae94-8d72c385996b' and es = 'Hacemos lo que sea, pero salgamos un toque al solcito.' and en = 'We''ll do whatever, but let''s go out in the sun for a bit.'
  and not (es_alt && array['Hacemos lo que sea, pero salgamos un toque al sol.']::text[]);

update public.sentences set es_alt = es_alt || array['Lo que pasó fue que hacía fresco y no salimos.']::text[], note_en = coalesce(note_en, '“Fresquito” is the diminutive of “fresco”. Argentines love it for weather: it makes the cold sound mild and almost cozy.')
where id = 'cdcd4464-56c1-50dc-9711-06d883e7d7df' and es = 'Lo que pasó fue que hacía fresquito y no salimos.' and en = 'What happened was it was chilly and we didn''t go out.'
  and not (es_alt && array['Lo que pasó fue que hacía fresco y no salimos.']::text[]);

update public.sentences set es_alt = es_alt || array['Te quejás del fresco, pero en el fondo te gusta.']::text[], note_en = coalesce(note_en, '“Fresquito” is the diminutive of “fresco”. Argentines love it for weather: it makes the cold sound mild and almost cozy.')
where id = '82d163a7-3bde-5e8a-8eb9-58c2c29ca711' and es = 'Te quejás del fresquito, pero en el fondo te gusta.' and en = 'You complain about the chilly weather, but deep down you like it.'
  and not (es_alt && array['Te quejás del fresco, pero en el fondo te gusta.']::text[]);

update public.sentences set es_alt = es_alt || array['Tomá el café ahora, que está caliente.', 'Tomá ahora el café, que está caliente.']::text[], note_en = coalesce(note_en, '“Calentito” is “caliente” with a diminutive: it means nice and warm, and sounds cozy and caring.')
where id = '5543bc88-c4bb-5791-be4b-72eba23a1a00' and es = 'Tomá el café ahora, que está calentito.' and en = 'Drink the coffee now, while it''s hot.'
  and not (es_alt && array['Tomá el café ahora, que está caliente.', 'Tomá ahora el café, que está caliente.']::text[]);

update public.sentences set es_alt = es_alt || array['A medida que la conozco, Mica me cae mejor.', 'A medida que conozco a Mica, me cae mejor.']::text[], note_en = coalesce(note_en, '“Ir” + a verb ending in -ndo (“la voy conociendo”) shows something happening little by little.')
where id = 'b348d75f-8acc-5234-aeb8-9a87b7e63183' and es = 'A medida que la voy conociendo, Mica me cae mejor.' and en = 'As I get to know Mica, I like her better.'
  and not (es_alt && array['A medida que la conozco, Mica me cae mejor.', 'A medida que conozco a Mica, me cae mejor.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Me podés ayudar?']::text[], note_en = coalesce(note_en, '“Hacer la gamba” is casual Argentine slang for helping a friend out or keeping them company.')
where id = 'a521f6fb-cfa7-5292-8809-3d660e72ad8f' and es = '¿Me podés hacer la gamba?' and en = 'Can you help me?'
  and not (es_alt && array['¿Me podés ayudar?']::text[]);

update public.sentences set es_alt = es_alt || array['El sueldo no rinde como antes.', 'Mi sueldo no rinde como antes.']::text[], note_en = coalesce(note_en, '“Ya no” means “not anymore”. It underlines that things have changed, but the sentence works without “ya” too.')
where id = '1dc43bed-671e-5de7-8c19-4a725a7523f5' and es = 'El sueldo ya no rinde como antes.' and en = 'My salary doesn''t go as far as it used to.'
  and not (es_alt && array['El sueldo no rinde como antes.', 'Mi sueldo no rinde como antes.']::text[]);

update public.sentences set es_alt = es_alt || array['La plata es un tema delicado en mi familia.']::text[]
where id = '6835f23d-135d-59ed-a15e-40cf620a10cf' and es = 'El tema de la plata es delicado en mi familia.' and en = 'Money is a sensitive subject in my family.'
  and not (es_alt && array['La plata es un tema delicado en mi familia.']::text[]);

update public.sentences set es_alt = es_alt || array['Hablar de su ex es un tema delicado.']::text[]
where id = '4075ed16-1b9c-514b-9b16-a053669ea372' and es = 'Hablar de su ex es delicado.' and en = 'Talking about her ex is a sensitive subject.'
  and not (es_alt && array['Hablar de su ex es un tema delicado.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Está lavado? Voy a poner yerba nueva.']::text[], note_en = coalesce(note_en, 'For something you are about to do, Argentines often use the plain present ("pongo") where English says "I''ll".')
where id = 'aa21b31d-1362-50bf-b131-162d86ac8fc8' and es = '¿Está lavado? Pongo yerba nueva.' and en = 'Is it washed out? I''ll put in fresh yerba.'
  and not (es_alt && array['¿Está lavado? Voy a poner yerba nueva.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Querés un alfajor?']::text[], note_en = coalesce(note_en, 'Argentines offer food and drink with “¿Te convido…?”: it means “can I share some of mine with you?”.')
where id = 'd72604d0-53bb-5a13-a706-49baadcf7a95' and es = '¿Te convido un alfajor?' and en = 'Want an alfajor?'
  and not (es_alt && array['¿Querés un alfajor?']::text[]);

update public.sentences set es_alt = es_alt || array['¿Querés? Está recién hecho.']::text[], note_en = coalesce(note_en, 'Argentines offer food and drink with “¿Te convido?”: it means “can I share some of mine with you?”.')
where id = '193e03a9-e65e-5a49-9ed7-bb4fd9d8f863' and es = '¿Te convido? Está recién hecho.' and en = 'Want some? It''s freshly made.'
  and not (es_alt && array['¿Querés? Está recién hecho.']::text[]);

update public.sentences set es_alt = es_alt || array['Che, calentá la pava, ya llegó Pablo.', 'Che, calentá la pava, llegó Pablo.']::text[], note_en = coalesce(note_en, 'After an order, Argentines often add “que” to give the reason: it works like a quick “because”.')
where id = 'e9bee031-190b-5398-bd14-1318c0868ad8' and es = 'Che, calentá la pava que ya llegó Pablo.' and en = 'Hey, heat up the kettle, Pablo is here.'
  and not (es_alt && array['Che, calentá la pava, ya llegó Pablo.', 'Che, calentá la pava, llegó Pablo.']::text[]);

update public.sentences set es_alt = es_alt || array['De chico, mi merienda era leche con galletitas.']::text[]
where id = 'e70d452a-0c5a-57ca-a904-a275cc697582' and es = 'De chico, la merienda era leche con galletitas.' and en = 'As a kid, my afternoon snack was milk and cookies.'
  and not (es_alt && array['De chico, mi merienda era leche con galletitas.']::text[]);

update public.sentences set es_alt = es_alt || array['El dueño del bar es español.']::text[], note_en = coalesce(note_en, 'In Argentina Spaniards are often called “gallegos”, because so many immigrants came from Galicia.')
where id = '44c00967-f3a5-5a47-b8f2-e74f6cff4fca' and es = 'El dueño del bar es gallego.' and en = 'The owner of the bar is Spanish.'
  and not (es_alt && array['El dueño del bar es español.']::text[]);

update public.sentences set es_alt = es_alt || array['El español del almacén es re buena onda.']::text[], note_en = coalesce(note_en, 'In Argentina Spaniards are often called “gallegos”, because so many immigrants came from Galicia.')
where id = '9214ccc4-2f23-58af-a088-c41dd1e000db' and es = 'El gallego del almacén es re buena onda.' and en = 'The Spanish guy at the corner store is really nice.'
  and not (es_alt && array['El español del almacén es re buena onda.']::text[]);

update public.sentences set es_alt = es_alt || array['Vinieron en barco y se instalaron en Rosario.']::text[]
where id = '365172f8-9d27-5ad4-9e65-01b436f8e1eb' and es = 'Llegaron en barco y se instalaron en Rosario.' and en = 'They came by ship and settled in Rosario.'
  and not (es_alt && array['Vinieron en barco y se instalaron en Rosario.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuela española tenía la pava siempre en el fuego.', 'Mi abuela española siempre tenía la pava en el fuego.']::text[], note_en = coalesce(note_en, 'In Argentina Spaniards are often called “gallegos”, because so many immigrants came from Galicia.')
where id = '9984273a-8735-58be-8e97-15a9dfe426b4' and es = 'Mi abuela gallega tenía la pava siempre en el fuego.' and en = 'My Spanish grandmother always had the kettle on the fire.'
  and not (es_alt && array['Mi abuela española tenía la pava siempre en el fuego.', 'Mi abuela española siempre tenía la pava en el fuego.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuelo era español y mi abuela, italiana.', 'Mi abuelo era español y mi abuela era italiana.', 'Mi abuelo era gallego y mi abuela era italiana.']::text[], note_en = coalesce(note_en, 'In Argentina Spaniards are often called “gallegos”, because so many immigrants came from Galicia.')
where id = 'da714943-e3c2-5a5f-8712-160d1214a306' and es = 'Mi abuelo era gallego y mi abuela, italiana.' and en = 'My grandfather was Spanish and my grandmother was Italian.'
  and not (es_alt && array['Mi abuelo era español y mi abuela, italiana.', 'Mi abuelo era español y mi abuela era italiana.', 'Mi abuelo era gallego y mi abuela era italiana.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi vecino es español.']::text[], note_en = coalesce(note_en, 'In Argentina Spaniards are often called “gallegos”, because so many immigrants came from Galicia.')
where id = '227930c7-ac48-5397-a8cf-ded3b251b879' and es = 'Mi vecino es gallego.' and en = 'My neighbor is Spanish.'
  and not (es_alt && array['Mi vecino es español.']::text[]);

update public.sentences set es_alt = es_alt || array['Poné la pava, traje facturas para la merienda.']::text[], note_en = coalesce(note_en, 'After an order, Argentines often add “que” to give the reason: it works like a quick “because”.')
where id = 'a6b21f7d-ef9b-52bd-8ea2-d8b94c509079' and es = 'Poné la pava, que traje facturas para la merienda.' and en = 'Put the kettle on, I brought pastries for the afternoon snack.'
  and not (es_alt && array['Poné la pava, traje facturas para la merienda.']::text[]);

update public.sentences set es_alt = es_alt || array['Tomá una factura.']::text[], note_en = coalesce(note_en, '“Te convido” is the Argentine way to offer someone some of what you have.')
where id = '93f2af62-f4e2-5141-b168-0d331936cd24' and es = 'Te convido una factura.' and en = 'Have a pastry.'
  and not (es_alt && array['Tomá una factura.']::text[]);

update public.sentences set es_alt = es_alt || array['Tomá, pero está medio lavado.']::text[], note_en = coalesce(note_en, '“Te convido” is the Argentine way to offer someone some of what you have.')
where id = '49690580-82b8-5aa9-bf4e-5b0e25d6a36b' and es = 'Te convido, pero está medio lavado.' and en = 'Have some, but it''s a bit weak.'
  and not (es_alt && array['Tomá, pero está medio lavado.']::text[]);

update public.sentences set es_alt = es_alt || array['Estoy orgullosa porque hablé en español toda la reunión.', 'Estoy orgulloso porque hablé en español toda la reunión.', 'Estoy orgullosa porque hablé español toda la reunión.', 'Estoy orgulloso porque hablé español toda la reunión.']::text[], note_en = coalesce(note_en, 'Argentines often call the language “castellano”, though “español” is just as correct.')
where id = 'dee20cf4-0ec5-5d3b-87bc-0910f71a1bc0' and es = 'Estoy orgullosa porque hablé en castellano toda la reunión.' and en = 'I''m proud because I spoke Spanish the whole meeting.'
  and not (es_alt && array['Estoy orgullosa porque hablé en español toda la reunión.', 'Estoy orgulloso porque hablé en español toda la reunión.', 'Estoy orgullosa porque hablé español toda la reunión.', 'Estoy orgulloso porque hablé español toda la reunión.']::text[]);

update public.sentences set es_alt = es_alt || array['Mi abuelo español siempre estuvo agradecido con este país.']::text[], note_en = coalesce(note_en, 'In Argentina Spaniards are often called “gallegos”, because so many immigrants came from Galicia.')
where id = '79b20c90-972f-53b5-9a49-5a31a65a3111' and es = 'Mi abuelo gallego siempre estuvo agradecido con este país.' and en = 'My Spanish grandfather was always grateful to this country.'
  and not (es_alt && array['Mi abuelo español siempre estuvo agradecido con este país.']::text[]);

update public.sentences set es_alt = es_alt || array['Me da orgullo.']::text[]
where id = 'c5f227dd-aeaa-547e-846d-502ff76987fe' and es = 'Es un orgullo para mí.' and en = 'It makes me proud.'
  and not (es_alt && array['Me da orgullo.']::text[]);

update public.sentences set es_alt = es_alt || array['Lo dijo de corazón y todos nos emocionamos.']::text[]
where id = '1867aacb-eeb4-5472-bc18-b33786ca1a4d' and es = 'Lo dijo con el corazón y todos nos emocionamos.' and en = 'He said it from the heart and we all got emotional.'
  and not (es_alt && array['Lo dijo de corazón y todos nos emocionamos.']::text[]);

update public.sentences set es_alt = es_alt || array['Nos emocionamos todos con el discurso de nuestra abuela.', 'Todos nos emocionamos con el discurso de nuestra abuela.']::text[], note_en = coalesce(note_en, 'Within the family, Argentines usually say “la abuela” rather than “nuestra abuela”.')
where id = 'cff2afb5-899e-5add-93ff-3c88f0a30a5e' and es = 'Nos emocionamos todos con el discurso de la abuela.' and en = 'We all got emotional at our grandmother''s speech.'
  and not (es_alt && array['Nos emocionamos todos con el discurso de nuestra abuela.', 'Todos nos emocionamos con el discurso de nuestra abuela.']::text[]);

update public.sentences set es_alt = es_alt || array['¿Está listo tu discurso?', '¿Tu discurso está listo?']::text[]
where id = '40d14404-e1d7-51c3-b6b7-fd8286b867b9' and es = '¿Tenés listo el discurso?' and en = 'Is your speech ready?'
  and not (es_alt && array['¿Está listo tu discurso?', '¿Tu discurso está listo?']::text[]);

update public.sentences set es_alt = es_alt || array['Dale un abrazo a tu vieja de mi parte.', 'Dale un abrazo de mi parte a tu vieja.', 'Mandale un abrazo a tu vieja de mi parte.']::text[], note_en = coalesce(note_en, '“Mandale un abrazo” (send a hug) is the everyday way to pass on your affection to someone.')
where id = '1ecfc4cf-304f-59e3-ba0f-06fa2401a471' and es = 'Mandale un abrazo a tu vieja.' and en = 'Give your mom a hug from me.'
  and not (es_alt && array['Dale un abrazo a tu vieja de mi parte.', 'Dale un abrazo de mi parte a tu vieja.', 'Mandale un abrazo a tu vieja de mi parte.']::text[]);

update public.sentences set es_alt = es_alt || array['Me habló de corazón y nos emocionamos los dos.']::text[]
where id = '3244ee0b-129e-535b-82d7-68f74d269857' and es = 'Me habló con el corazón y nos emocionamos los dos.' and en = 'He spoke to me from the heart and we both got emotional.'
  and not (es_alt && array['Me habló de corazón y nos emocionamos los dos.']::text[]);

update public.sentences set es_alt = es_alt || array['Se ofendió, pero tiene buen corazón: se le va a pasar.', 'Se ofendió, pero tiene buen corazón: ya se le va a pasar.']::text[]
where id = 'c5550c0f-4c16-5986-ba6b-787c695de449' and es = 'Se ofendió, pero tiene buen corazón: ya se le pasa.' and en = 'He took offense, but he has a good heart: he''ll get over it.'
  and not (es_alt && array['Se ofendió, pero tiene buen corazón: se le va a pasar.', 'Se ofendió, pero tiene buen corazón: ya se le va a pasar.']::text[]);

update public.sentences set es_alt = es_alt || array['Se ofendió porque le dijimos petiso.']::text[], note_en = coalesce(note_en, '“Picarse” is a casual way to say someone got annoyed or offended.')
where id = '53bcc56e-7133-582e-8605-141f84bbb290' and es = 'Se picó porque le dijimos petiso.' and en = 'He got offended because we called him Shorty.'
  and not (es_alt && array['Se ofendió porque le dijimos petiso.']::text[]);

update public.sentences set es_alt = es_alt || array['Te quiero con todo mi corazón.', 'Te quiero con todo el corazón.']::text[]
where id = '5daa0b8e-e500-5d97-9dfe-bda2a568efd3' and es = 'Te quiero de corazón.' and en = 'I love you with all my heart.'
  and not (es_alt && array['Te quiero con todo mi corazón.', 'Te quiero con todo el corazón.']::text[]);

update public.sentences set es_alt = es_alt || array['Después de un año, ya me siento como en casa.']::text[]
where id = 'ed8b1b8e-e6e9-5b95-840f-a581f69b809d' and es = 'Después de un año, ya estoy como en casa.' and en = 'After a year, I already feel at home.'
  and not (es_alt && array['Después de un año, ya me siento como en casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Me adapté, y ahora la que me extraña es mi mamá.']::text[]
where id = 'c2442713-ed45-5ed2-b1c0-727d2ca7b020' and es = 'Me adapté, y ahora la que extraña es mi mamá.' and en = 'I adapted, and now the one who misses me is my mom.'
  and not (es_alt && array['Me adapté, y ahora la que me extraña es mi mamá.']::text[]);

update public.sentences set es_alt = es_alt || array['Me costó aprender español.', 'Aprender español me costó.']::text[], note_en = coalesce(note_en, 'Argentines often call the language “castellano”, though “español” is just as correct.')
where id = '20a7e6ab-3a58-5ec6-b667-94e3a768fc73' and es = 'Me costó aprender castellano.' and en = 'Learning Spanish was hard for me.'
  and not (es_alt && array['Me costó aprender español.', 'Aprender español me costó.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Qué linda fiesta de despedida!']::text[], note_en = coalesce(note_en, '“Despedida” on its own already means a farewell party.')
where id = 'ee217a0e-8e4c-5c99-a5f1-63233b0c893f' and es = '¡Qué linda despedida!' and en = 'What a nice farewell party!'
  and not (es_alt && array['¡Qué linda fiesta de despedida!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Venís a la fiesta de despedida?']::text[], note_en = coalesce(note_en, '“Despedida” on its own already means a farewell party.')
where id = '43bf88b6-6260-5243-984b-68f038229df2' and es = '¿Venís a la despedida?' and en = 'Are you coming to the farewell party?'
  and not (es_alt && array['¿Venís a la fiesta de despedida?']::text[]);

update public.sentences set es_alt = es_alt || array['Brindemos: gracias a ustedes, me siento como en casa.']::text[]
where id = '1171dacd-36b4-525e-a242-d0c3600b55bd' and es = 'Brindemos: gracias a ustedes, estoy como en casa.' and en = 'Let''s toast: thanks to you all, I''m right at home.'
  and not (es_alt && array['Brindemos: gracias a ustedes, me siento como en casa.']::text[]);

update public.sentences set es_alt = es_alt || array['Brindo por mis compañeros, porque los voy a extrañar.']::text[], note_en = coalesce(note_en, 'In everyday speech a short “que” often stands in for “porque”.')
where id = 'f7a05563-6325-5b4d-b391-7380660c8909' and es = 'Brindo por mis compañeros, que los voy a extrañar.' and en = 'I toast to my coworkers, because I''m going to miss them.'
  and not (es_alt && array['Brindo por mis compañeros, porque los voy a extrañar.']::text[]);

update public.sentences set es_alt = es_alt || array['En mi fiesta de despedida hubo un brindis y yo lloré.', 'En mi fiesta de despedida hubo un brindis y lloré.']::text[], note_en = coalesce(note_en, '“Despedida” on its own already means a farewell party.')
where id = 'e8d915d0-af03-599e-a3de-13d67160ed5d' and es = 'En mi despedida hubo un brindis y yo lloré.' and en = 'At my farewell party there was a toast and I cried.'
  and not (es_alt && array['En mi fiesta de despedida hubo un brindis y yo lloré.', 'En mi fiesta de despedida hubo un brindis y lloré.']::text[]);

update public.sentences set es_alt = es_alt || array['Hagamos una fiesta de despedida chica, sin discurso.']::text[], note_en = coalesce(note_en, '“Despedida” on its own already means a farewell party.')
where id = '804e5b88-9ebe-59e3-a95a-d6c380249fa2' and es = 'Hagamos una despedida chica, sin discurso.' and en = 'Let''s have a small farewell party, with no speech.'
  and not (es_alt && array['Hagamos una fiesta de despedida chica, sin discurso.']::text[]);

update public.sentences set es_alt = es_alt || array['La despedida es en mi casa.', 'La fiesta de despedida es en casa.', 'La fiesta de despedida es en mi casa.']::text[], note_en = coalesce(note_en, '“En casa” with no “mi” usually means “at my place”, and “despedida” alone already means a farewell party.')
where id = '3fd08374-51ad-55bf-ab5d-6fee04922ed1' and es = 'La despedida es en casa.' and en = 'The farewell party is at my place.'
  and not (es_alt && array['La despedida es en mi casa.', 'La fiesta de despedida es en casa.', 'La fiesta de despedida es en mi casa.']::text[]);

update public.sentences set es_alt = es_alt || array['La fiesta de despedida fue larga: nadie quería decir chau.']::text[], note_en = coalesce(note_en, '“Despedida” on its own already means a farewell party.')
where id = '6c41ff2a-417d-54f5-9f30-22ce9b68e260' and es = 'La despedida fue larga: nadie quería decir chau.' and en = 'The farewell party was long: nobody wanted to say bye.'
  and not (es_alt && array['La fiesta de despedida fue larga: nadie quería decir chau.']::text[]);

update public.sentences set es_alt = es_alt || array['Mañana es mi fiesta de despedida.', 'Mi fiesta de despedida es mañana.']::text[], note_en = coalesce(note_en, '“Despedida” on its own already means a farewell party.')
where id = '3ce46737-9408-5587-ad9f-f0798994255f' and es = 'Mañana es mi despedida.' and en = 'Tomorrow is my farewell party.'
  and not (es_alt && array['Mañana es mi fiesta de despedida.', 'Mi fiesta de despedida es mañana.']::text[]);

update public.sentences set es_alt = es_alt || array['Me despido acá, estoy apurado.', 'Me despido acá, estoy apurada.']::text[], note_en = coalesce(note_en, 'In everyday speech a short “que” often introduces the reason, like a quick “because”.')
where id = '5fb2e0e6-db08-57bb-a2ca-bb11ae36ba5b' and es = 'Me despido acá, que estoy apurado.' and en = 'I''ll say goodbye here, I''m in a hurry.'
  and not (es_alt && array['Me despido acá, estoy apurado.', 'Me despido acá, estoy apurada.']::text[]);

update public.sentences set es_alt = es_alt || array['¡Lograste pedir en español!']::text[], note_en = coalesce(note_en, 'Argentines often call the language “castellano”, though “español” is just as correct.')
where id = 'c336d91b-67b1-5a2f-8fdf-e4b89db5d024' and es = '¡Lograste pedir en castellano!' and en = 'You managed to order in Spanish!'
  and not (es_alt && array['¡Lograste pedir en español!']::text[]);

update public.sentences set es_alt = es_alt || array['¿Cómo lograste ese acento?', '¿Cómo lograste tener ese acento?']::text[], note_en = coalesce(note_en, '“¿Cómo hiciste para…?” is the everyday way to ask how someone pulled something off.')
where id = '6e149ea8-afdc-5eca-9b9a-8091d0639498' and es = '¿Cómo hiciste para lograr ese acento?' and en = 'How did you manage to get that accent?'
  and not (es_alt && array['¿Cómo lograste ese acento?', '¿Cómo lograste tener ese acento?']::text[]);

update public.sentences set es_alt = es_alt || array['Logré hablar por teléfono en español.', 'Logré hablar en español por teléfono.']::text[], note_en = coalesce(note_en, 'Argentines often call the language “castellano”, though “español” is just as correct.')
where id = '74056d21-5083-5416-a097-db139226c14a' and es = 'Logré hablar por teléfono en castellano.' and en = 'I managed to talk on the phone in Spanish.'
  and not (es_alt && array['Logré hablar por teléfono en español.', 'Logré hablar en español por teléfono.']::text[]);
