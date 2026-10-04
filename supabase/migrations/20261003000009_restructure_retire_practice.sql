-- Course restructure, step 1 (2026-10-03, approved by the owner): honest level labels and one practice unit per block.
-- 36 practice-only units leave the course (the second unit of each back-to-back pair stays); their lessons, tips and
-- sentences go with them. Sections get the labels and names of docs/course/proposed-map-2026-10-03.md.

update public.units set status = 'retired', ordinal = 3200, course_order = 3200 where id = 'da566530-f509-5133-b265-9183e82e99e2' and status = 'published'; -- practica-que-hiciste
update public.units set status = 'retired', ordinal = 3201, course_order = 3201 where id = 'ca8f891d-0d08-51d6-84de-10ce90c0245f' and status = 'published'; -- practica-el-finde
update public.units set status = 'retired', ordinal = 3202, course_order = 3202 where id = '8531d298-54ee-59f6-9973-5e4562177f2e' and status = 'published'; -- practica-el-viaje
update public.units set status = 'retired', ordinal = 3203, course_order = 3203 where id = 'a0a421e1-d5be-5c04-a905-e4bd5424aa57' and status = 'published'; -- practica-de-chico
update public.units set status = 'retired', ordinal = 3204, course_order = 3204 where id = 'b38bd9a1-f0a8-5fe1-9aa1-0e8260930af6' and status = 'published'; -- practica-la-juntada
update public.units set status = 'retired', ordinal = 3205, course_order = 3205 where id = '2a6a2955-3702-5c32-a348-a1d2c591bdf2' and status = 'published'; -- practica-me-mude
update public.units set status = 'retired', ordinal = 3206, course_order = 3206 where id = '6cbcbdaf-a420-507d-844b-34d87b2822f2' and status = 'published'; -- practica-los-mandados
update public.units set status = 'retired', ordinal = 3207, course_order = 3207 where id = '05dc3d96-dc93-54a8-9eec-ca5cc9baff16' and status = 'published'; -- practica-el-laburo
update public.units set status = 'retired', ordinal = 3208, course_order = 3208 where id = '1c4eaeb1-2bcc-5b49-889e-bfd0ac2ed088' and status = 'published'; -- practica-capaz
update public.units set status = 'retired', ordinal = 3209, course_order = 3209 where id = 'ef00ab7c-09e9-5c6b-8389-aa83a371e3d1' and status = 'published'; -- practica-ojala
update public.units set status = 'retired', ordinal = 3210, course_order = 3210 where id = 'a46178fb-2c93-503a-b057-1838974c2a73' and status = 'published'; -- practica-te-recomiendo
update public.units set status = 'retired', ordinal = 3211, course_order = 3211 where id = 'a53cea7e-02aa-56f7-a3b8-de1dca112674' and status = 'published'; -- practica-que-bueno
update public.units set status = 'retired', ordinal = 3212, course_order = 3212 where id = 'ce05c318-270e-5388-9073-3793ff249013' and status = 'published'; -- practica-yo-que-vos
update public.units set status = 'retired', ordinal = 3213, course_order = 3213 where id = 'a895f900-29bb-56a3-8161-0d08826cfe48' and status = 'published'; -- practica-la-guita
update public.units set status = 'retired', ordinal = 3214, course_order = 3214 where id = '3e9f1f79-1601-518d-ad4c-5540cd98f35b' and status = 'published'; -- practica-quien-dijo
update public.units set status = 'retired', ordinal = 3215, course_order = 3215 where id = 'a64eb13a-e442-5199-bf7e-cbdf6e56de26' and status = 'published'; -- practica-se-me-olvido
update public.units set status = 'retired', ordinal = 3216, course_order = 3216 where id = '080920e1-dfcc-555f-94e8-0864285aa5e7' and status = 'published'; -- practica-depende
update public.units set status = 'retired', ordinal = 3217, course_order = 3217 where id = 'f1ba775f-ad41-52d5-ae7c-9ee7834def48' and status = 'published'; -- practica-que-susto
update public.units set status = 'retired', ordinal = 3218, course_order = 3218 where id = '518b71b2-b596-542b-9566-2ef65e7af724' and status = 'published'; -- practica-llevo-un-rato
update public.units set status = 'retired', ordinal = 3219, course_order = 3219 where id = '696d87b3-3675-5b84-ae2f-61e5be334c9a' and status = 'published'; -- practica-como-si
update public.units set status = 'retired', ordinal = 3220, course_order = 3220 where id = '29bb2939-3d2a-50ef-b526-0e4e6c65ed68' and status = 'published'; -- practica-el-tramite
update public.units set status = 'retired', ordinal = 3221, course_order = 3221 where id = '248f8041-e91e-501f-92e4-301a84aab1d9' and status = 'published'; -- practica-me-da-igual
update public.units set status = 'retired', ordinal = 3222, course_order = 3222 where id = 'caff1c3a-1951-5288-a7b5-c4e6b51a503a' and status = 'published'; -- practica-se-alquila
update public.units set status = 'retired', ordinal = 3223, course_order = 3223 where id = 'c934a093-7470-526c-b293-904cab8a522d' and status = 'published'; -- practica-me-cae-bien
update public.units set status = 'retired', ordinal = 3224, course_order = 3224 where id = 'da717e1e-25b4-54db-a4c6-524cdb07bcfe' and status = 'published'; -- practica-me-pidio
update public.units set status = 'retired', ordinal = 3225, course_order = 3225 where id = '94eb1988-d122-5fbd-be20-4599d41df698' and status = 'published'; -- practica-resulta-que
update public.units set status = 'retired', ordinal = 3226, course_order = 3226 where id = '3c841aec-551f-5e12-a246-f16e72a12923' and status = 'published'; -- practica-no-doy-mas
update public.units set status = 'retired', ordinal = 3227, course_order = 3227 where id = '7743587b-284d-5f25-8f96-38e8f9443429' and status = 'published'; -- practica-hay-paro
update public.units set status = 'retired', ordinal = 3228, course_order = 3228 where id = 'b11e93f9-0410-5c63-9d47-ce8b7e4ebfb9' and status = 'published'; -- practica-me-robaron
update public.units set status = 'retired', ordinal = 3229, course_order = 3229 where id = 'edefc2b5-24ef-5037-9435-816e34d18aaa' and status = 'published'; -- practica-la-parrilla
update public.units set status = 'retired', ordinal = 3230, course_order = 3230 where id = '8391605b-e3f5-521c-811d-c849d7eef95f' and status = 'published'; -- practica-no-es-que
update public.units set status = 'retired', ordinal = 3231, course_order = 3231 where id = '5ee78c4c-97f9-5e3c-a458-2aff27520c2e' and status = 'published'; -- practica-lo-que-pasa
update public.units set status = 'retired', ordinal = 3232, course_order = 3232 where id = '544808fd-b59f-580e-b0be-6f789ba2a11c' and status = 'published'; -- practica-cuanto-mas
update public.units set status = 'retired', ordinal = 3233, course_order = 3233 where id = '908f70c9-72c3-5244-b3c8-db86021008ed' and status = 'published'; -- practica-la-entrega
update public.units set status = 'retired', ordinal = 3234, course_order = 3234 where id = 'a5e76c4c-fdd3-5652-89d4-4d7a8341eae7' and status = 'published'; -- practica-quien-ceba
update public.units set status = 'retired', ordinal = 3235, course_order = 3235 where id = 'f6864f2a-0faf-53cf-a8b4-9e35f6661b10' and status = 'published'; -- practica-me-emocione
update public.lessons set status = 'retired' where unit_id in ('da566530-f509-5133-b265-9183e82e99e2', 'ca8f891d-0d08-51d6-84de-10ce90c0245f', '8531d298-54ee-59f6-9973-5e4562177f2e', 'a0a421e1-d5be-5c04-a905-e4bd5424aa57', 'b38bd9a1-f0a8-5fe1-9aa1-0e8260930af6', '2a6a2955-3702-5c32-a348-a1d2c591bdf2', '6cbcbdaf-a420-507d-844b-34d87b2822f2', '05dc3d96-dc93-54a8-9eec-ca5cc9baff16', '1c4eaeb1-2bcc-5b49-889e-bfd0ac2ed088', 'ef00ab7c-09e9-5c6b-8389-aa83a371e3d1', 'a46178fb-2c93-503a-b057-1838974c2a73', 'a53cea7e-02aa-56f7-a3b8-de1dca112674', 'ce05c318-270e-5388-9073-3793ff249013', 'a895f900-29bb-56a3-8161-0d08826cfe48', '3e9f1f79-1601-518d-ad4c-5540cd98f35b', 'a64eb13a-e442-5199-bf7e-cbdf6e56de26', '080920e1-dfcc-555f-94e8-0864285aa5e7', 'f1ba775f-ad41-52d5-ae7c-9ee7834def48', '518b71b2-b596-542b-9566-2ef65e7af724', '696d87b3-3675-5b84-ae2f-61e5be334c9a', '29bb2939-3d2a-50ef-b526-0e4e6c65ed68', '248f8041-e91e-501f-92e4-301a84aab1d9', 'caff1c3a-1951-5288-a7b5-c4e6b51a503a', 'c934a093-7470-526c-b293-904cab8a522d', 'da717e1e-25b4-54db-a4c6-524cdb07bcfe', '94eb1988-d122-5fbd-be20-4599d41df698', '3c841aec-551f-5e12-a246-f16e72a12923', '7743587b-284d-5f25-8f96-38e8f9443429', 'b11e93f9-0410-5c63-9d47-ce8b7e4ebfb9', 'edefc2b5-24ef-5037-9435-816e34d18aaa', '8391605b-e3f5-521c-811d-c849d7eef95f', '5ee78c4c-97f9-5e3c-a458-2aff27520c2e', '544808fd-b59f-580e-b0be-6f789ba2a11c', '908f70c9-72c3-5244-b3c8-db86021008ed', 'a5e76c4c-fdd3-5652-89d4-4d7a8341eae7', 'f6864f2a-0faf-53cf-a8b4-9e35f6661b10') and status <> 'retired';
update public.tips set status = 'retired' where unit_id in ('da566530-f509-5133-b265-9183e82e99e2', 'ca8f891d-0d08-51d6-84de-10ce90c0245f', '8531d298-54ee-59f6-9973-5e4562177f2e', 'a0a421e1-d5be-5c04-a905-e4bd5424aa57', 'b38bd9a1-f0a8-5fe1-9aa1-0e8260930af6', '2a6a2955-3702-5c32-a348-a1d2c591bdf2', '6cbcbdaf-a420-507d-844b-34d87b2822f2', '05dc3d96-dc93-54a8-9eec-ca5cc9baff16', '1c4eaeb1-2bcc-5b49-889e-bfd0ac2ed088', 'ef00ab7c-09e9-5c6b-8389-aa83a371e3d1', 'a46178fb-2c93-503a-b057-1838974c2a73', 'a53cea7e-02aa-56f7-a3b8-de1dca112674', 'ce05c318-270e-5388-9073-3793ff249013', 'a895f900-29bb-56a3-8161-0d08826cfe48', '3e9f1f79-1601-518d-ad4c-5540cd98f35b', 'a64eb13a-e442-5199-bf7e-cbdf6e56de26', '080920e1-dfcc-555f-94e8-0864285aa5e7', 'f1ba775f-ad41-52d5-ae7c-9ee7834def48', '518b71b2-b596-542b-9566-2ef65e7af724', '696d87b3-3675-5b84-ae2f-61e5be334c9a', '29bb2939-3d2a-50ef-b526-0e4e6c65ed68', '248f8041-e91e-501f-92e4-301a84aab1d9', 'caff1c3a-1951-5288-a7b5-c4e6b51a503a', 'c934a093-7470-526c-b293-904cab8a522d', 'da717e1e-25b4-54db-a4c6-524cdb07bcfe', '94eb1988-d122-5fbd-be20-4599d41df698', '3c841aec-551f-5e12-a246-f16e72a12923', '7743587b-284d-5f25-8f96-38e8f9443429', 'b11e93f9-0410-5c63-9d47-ce8b7e4ebfb9', 'edefc2b5-24ef-5037-9435-816e34d18aaa', '8391605b-e3f5-521c-811d-c849d7eef95f', '5ee78c4c-97f9-5e3c-a458-2aff27520c2e', '544808fd-b59f-580e-b0be-6f789ba2a11c', '908f70c9-72c3-5244-b3c8-db86021008ed', 'a5e76c4c-fdd3-5652-89d4-4d7a8341eae7', 'f6864f2a-0faf-53cf-a8b4-9e35f6661b10') and status <> 'retired';
update public.sentences set status = 'retired' where unit_id in ('da566530-f509-5133-b265-9183e82e99e2', 'ca8f891d-0d08-51d6-84de-10ce90c0245f', '8531d298-54ee-59f6-9973-5e4562177f2e', 'a0a421e1-d5be-5c04-a905-e4bd5424aa57', 'b38bd9a1-f0a8-5fe1-9aa1-0e8260930af6', '2a6a2955-3702-5c32-a348-a1d2c591bdf2', '6cbcbdaf-a420-507d-844b-34d87b2822f2', '05dc3d96-dc93-54a8-9eec-ca5cc9baff16', '1c4eaeb1-2bcc-5b49-889e-bfd0ac2ed088', 'ef00ab7c-09e9-5c6b-8389-aa83a371e3d1', 'a46178fb-2c93-503a-b057-1838974c2a73', 'a53cea7e-02aa-56f7-a3b8-de1dca112674', 'ce05c318-270e-5388-9073-3793ff249013', 'a895f900-29bb-56a3-8161-0d08826cfe48', '3e9f1f79-1601-518d-ad4c-5540cd98f35b', 'a64eb13a-e442-5199-bf7e-cbdf6e56de26', '080920e1-dfcc-555f-94e8-0864285aa5e7', 'f1ba775f-ad41-52d5-ae7c-9ee7834def48', '518b71b2-b596-542b-9566-2ef65e7af724', '696d87b3-3675-5b84-ae2f-61e5be334c9a', '29bb2939-3d2a-50ef-b526-0e4e6c65ed68', '248f8041-e91e-501f-92e4-301a84aab1d9', 'caff1c3a-1951-5288-a7b5-c4e6b51a503a', 'c934a093-7470-526c-b293-904cab8a522d', 'da717e1e-25b4-54db-a4c6-524cdb07bcfe', '94eb1988-d122-5fbd-be20-4599d41df698', '3c841aec-551f-5e12-a246-f16e72a12923', '7743587b-284d-5f25-8f96-38e8f9443429', 'b11e93f9-0410-5c63-9d47-ce8b7e4ebfb9', 'edefc2b5-24ef-5037-9435-816e34d18aaa', '8391605b-e3f5-521c-811d-c849d7eef95f', '5ee78c4c-97f9-5e3c-a458-2aff27520c2e', '544808fd-b59f-580e-b0be-6f789ba2a11c', '908f70c9-72c3-5244-b3c8-db86021008ed', 'a5e76c4c-fdd3-5652-89d4-4d7a8341eae7', 'f6864f2a-0faf-53cf-a8b4-9e35f6661b10') and status = 'published';
update public.forms set unit_id = '8fd78797-231c-5920-8d41-337bed37a7a9' where id = '39a21e80-b73e-56ec-a663-be11fb10653d'; -- demora (bound) moves to practica-me-la-jugue

-- Sections: slugs are unique, so step through a free name first.
update public.sections set slug = 'tmp-' || id where id = 7;
update public.sections set slug = 'tmp-' || id where id = 8;
update public.sections set slug = 'tmp-' || id where id = 9;
update public.sections set slug = 'tmp-' || id where id = 10;
update public.sections set slug = 'tmp-' || id where id = 11;
update public.sections set slug = 'tmp-' || id where id = 12;
update public.sections set slug = 'tmp-' || id where id = 13;
update public.sections set slug = 'tmp-' || id where id = 14;
update public.sections set slug = 'tmp-' || id where id = 15;
update public.sections set slug = 'real-life', title_en = 'Real life', cefr = 'A2.4' where id = 7;
update public.sections set slug = 'wishes-and-advice', title_en = 'Wishes and advice', cefr = 'B1.1' where id = 8;
update public.sections set slug = 'if-i-were-you', title_en = 'If I were you', cefr = 'B1.2' where id = 9;
update public.sections set slug = 'stories-and-opinions', title_en = 'Stories and opinions', cefr = 'B1.3' where id = 10;
update public.sections set slug = 'making-your-case', title_en = 'Making your case', cefr = 'B2.1' where id = 11;
update public.sections set slug = 'between-the-lines', title_en = 'Between the lines', cefr = 'B2.2' where id = 12;
update public.sections set slug = 'in-other-words', title_en = 'In other words', cefr = 'B2.3' where id = 13;
update public.sections set slug = 'news-and-the-street', title_en = 'The news and the street', cefr = 'B2.4' where id = 14;
update public.sections set slug = 'like-a-local', title_en = 'Like a local', cefr = 'B2.5' where id = 15;

update public.units set summary_en = 'Un choripán, por favor' where slug = 'la-parrilla';
update public.units set summary_en = 'Dejé de fumar hace un año' where slug = 'deje-de-fumar';
