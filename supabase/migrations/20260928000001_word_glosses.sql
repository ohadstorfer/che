-- Word glosses (docs/course/audit-2026-09-27.md §7).
--
-- A form with no gloss of its own shows its lemma's, which is wrong for a
-- plural: `piernas` read "leg" on its card, its tiles and when tapped, and
-- could not be told apart from `pierna`. Each plural gets its own; the
-- uncountable ones ("news", "pants") too, so the validator's new
-- glossInherited warning stays quiet for them.
--
-- The 185 conjugated verbs the audit found glossed "to …" are all bound
-- (`recomiendo` inside `te recomiendo`): never a card, a tile or an option,
-- and their chunks carry the conjugated gloss. The one place they showed was
-- a free homograph's token ("llamo a mis abuelos" tagged llamarse too), which
-- the tokenizer now resolves to the free form; see course:retokenize.

-- 1. Plurals
update public.forms set gloss_en = 'vegetables' where id = '326c57e2-f4d9-5a9f-87d1-ad423cc0bde4'; -- verduras (was "vegetables")
update public.forms set gloss_en = 'buildings' where id = 'fcb72357-6864-5e0e-9afe-ac278ef734df'; -- edificios (was "building")
update public.forms set gloss_en = 'rooms' where id = 'c0ea5123-a887-5d75-8459-5587b701425f'; -- ambientes (was "room")
update public.forms set gloss_en = 'pants' where id = '149e9264-67e1-548d-8a91-c17f5f19cf03'; -- pantalones (was "pants")
update public.forms set gloss_en = 'pesos' where id = 'c57ea064-75b6-5923-9be8-7c27a343b5fb'; -- pesos (was "peso")
update public.forms set gloss_en = 'prices' where id = 'aba249a8-d12e-58e8-a51e-515f4825ec1e'; -- precios (was "price")
update public.forms set gloss_en = 'times (occasions)' where id = '7d56001e-9a72-578f-9640-9ee9d17b4399'; -- veces (was "time (occasion)")
update public.forms set gloss_en = 'months' where id = '14cc4fd9-560b-5efa-afdd-bf3d835ae3f4'; -- meses (was "month")
update public.forms set gloss_en = 'legs' where id = '48e9ee28-f64f-5907-a3c8-c6ef5388f8d9'; -- piernas (was "leg")
update public.forms set gloss_en = 'hills, low mountains' where id = '5ad93cdc-6611-5423-905e-f44d3e451cab'; -- sierras (was "hills, low mountains")
update public.forms set gloss_en = 'bikes' where id = 'd856ae5d-3b61-50ec-ab97-824de3f650e0'; -- bicis (was "bike")
update public.forms set gloss_en = 'clients, customers' where id = '659a0bcc-97e4-5024-bd19-8ded16b24755'; -- clientes (was "client, customer")
update public.forms set gloss_en = 'news' where id = '9afcc53b-4d43-5688-a6d7-363cdb205ae8'; -- noticias (was "news")
update public.forms set gloss_en = 'cups, mugs' where id = '37aff161-e02a-5a1f-9b0a-2db471e613c4'; -- tazas (was "cup, mug")
update public.forms set gloss_en = 'roller blinds, shutters' where id = '15352c5e-bffd-527c-ba66-fd09d0a23547'; -- persianas (was "roller blind, shutter")
update public.forms set gloss_en = 'penalties (kicks)' where id = '6688cd49-a798-51d9-af4c-319b9571dd53'; -- penales (was "penalty (kick)")
update public.forms set gloss_en = 'champions' where id = 'e104c15a-85b9-510b-ada6-3bda422aa140'; -- campeones (was "champion")
update public.forms set gloss_en = 'batteries (AA)' where id = '116834da-5e7a-5deb-8754-e5d7ba1823e7'; -- pilas (was "battery (AA)")
update public.forms set gloss_en = 'cockroaches' where id = '91f4a1a9-8e64-5ccc-a14b-487fdfd77dc2'; -- cucarachas (was "cockroach")
update public.forms set gloss_en = 'spiders' where id = '0bf8ec64-75dd-53c4-a9c8-bfc2d4d08cae'; -- arañas (was "spider")
update public.forms set gloss_en = 'bugs, creepy-crawlies' where id = '4dc356ea-32fa-5575-9f6e-3e68e1012453'; -- bichos (was "bug, creepy-crawly")
update public.forms set gloss_en = 'flip-flops' where id = '23b149f3-c746-5aaa-8e30-cb438661663a'; -- ojotas (was "flip-flop")
update public.forms set gloss_en = 'gossip' where id = 'e4148294-91a9-5b08-b0e4-97f767466561'; -- chismes (was "piece of gossip")
update public.forms set gloss_en = 'the ones that, the ones who' where id = 'a1bd5482-0bc8-5d2b-859c-187453eb79a7'; -- los que (was "the one that, the one who")
update public.forms set gloss_en = 'the ones that, the ones who' where id = 'e8dcb91c-8902-536f-be18-3fd9c110092d'; -- las que (was "the one that, the one who")
update public.forms set gloss_en = 'the ones (in, from, with)' where id = 'debeb6c5-9da0-5be8-9be5-bfc84afc65d1'; -- los de (was "the one (in, from, with)")
update public.forms set gloss_en = 'the ones (in, from, with)' where id = '5a3b76d4-3b17-5be8-b5ff-eb395be850c8'; -- las de (was "the one (in, from, with)")
update public.forms set gloss_en = 'colors' where id = '6b2dbdc0-407e-5c39-adde-98352fd5f7a0'; -- colores (was "color")
update public.forms set gloss_en = 'papers, documents' where id = '1f68a041-4e08-5eb9-ac0a-cbf746968b07'; -- papeles (was "paper, document")
update public.forms set gloss_en = 'requirements' where id = '94f5bac2-b522-5fc7-81d9-ae92f4ab326c'; -- requisitos (was "requirement")
update public.forms set gloss_en = 'pets' where id = '806a7bc8-23ef-58ad-aeff-460417c9901d'; -- mascotas (was "pet")
update public.forms set gloss_en = 'cards' where id = '766f2668-db14-5523-8d93-d8b8e84a5d0d'; -- tarjetas (was "card")
update public.forms set gloss_en = 'deliveries, shipping' where id = '0bc0dd38-4cb4-5df9-a2e7-d8c0a9b150e4'; -- envíos (was "delivery, shipping")
update public.forms set gloss_en = 'rates, utility charges' where id = '9eab304a-1944-5ecf-84d1-868e85ae7435'; -- tarifas (was "rate, utility charge")
update public.forms set gloss_en = 'expenses' where id = 'c0db2f12-e695-5abf-9c25-10c045f1b436'; -- gastos (was "expense")
update public.forms set gloss_en = 'utilities, services' where id = '8d9b81da-3ed1-5c74-823d-ee9b4e8c1c90'; -- servicios (was "utility, service")
update public.forms set gloss_en = 'retirees, pensioners' where id = '011d6891-ba11-5e6f-aaad-745130c19f56'; -- jubilados (was "retiree, pensioner")
update public.forms set gloss_en = 'files' where id = 'c022bada-ded7-5de6-9a35-5275447416e9'; -- archivos (was "file")
update public.forms set gloss_en = 'doubts; questions' where id = '7948ab75-8875-5736-82aa-d7cfc3b6ecfb'; -- dudas (was "doubt; question")
update public.forms set gloss_en = 'cigarettes, smokes' where id = '6556788f-7b21-52ac-b2b1-98629dd5f230'; -- puchos (was "cigarette, smoke")
update public.forms set gloss_en = 'tower blocks, high-rises' where id = '1bbe659a-2a8a-5713-932b-66e3811f28e1'; -- torres (was "tower block, high-rise")
update public.forms set gloss_en = 'teachers, educators' where id = '56761612-b9e6-5e0f-92c8-b76fbebd3584'; -- docentes (was "teacher, educator")
update public.forms set gloss_en = 'bus drivers' where id = '4974591e-1da1-5b62-bef7-becc99d516ec'; -- colectiveros (was "bus driver")
update public.forms set gloss_en = 'detours, diversions' where id = '52bf8cf4-e7fc-58ff-b749-786b8f8eb68b'; -- desvíos (was "detour, diversion")
update public.forms set gloss_en = 'injured people, the wounded' where id = '299e140f-4b60-599f-a8ae-be0e21fbc647'; -- heridos (was "injured person")
update public.forms set gloss_en = 'firefighters' where id = '3f61b2cd-5db4-5797-a29f-00c46ba42821'; -- bomberos (was "firefighter")
update public.forms set gloss_en = 'elections' where id = 'bb1919a8-41ea-5104-9716-4dd9eeee5f4a'; -- elecciones (was "election")
update public.forms set gloss_en = 'polls, surveys' where id = 'f510cf19-b2db-5d2b-9506-5ff2d53fb431'; -- encuestas (was "poll, survey")
update public.forms set gloss_en = 'results' where id = '5fac1d07-4bd0-501d-aa94-950e07176f42'; -- resultados (was "result")
update public.forms set gloss_en = 'headlines' where id = '309625a9-5801-5aa3-8637-4c34fa1c6bb2'; -- titulares (was "headline")
update public.forms set gloss_en = 'thieves' where id = '3b6c4109-b8df-57ab-aa0c-4d03bc04e683'; -- chorros (was "thief")
update public.forms set gloss_en = 'cameras' where id = '902fd556-ebc0-524e-b91c-0e13d2741ded'; -- cámaras (was "camera")
update public.forms set gloss_en = 'pipes' where id = '7d211319-f596-5970-88a6-01b692a11682'; -- caños (was "pipe")
update public.forms set gloss_en = 'terrace chants' where id = 'b7e79f66-57a0-59b2-a964-b3fd3b704fd1'; -- cantitos (was "terrace chant")
update public.forms set gloss_en = 'flags, banners' where id = '17391e88-869c-5b14-a9c3-9dac048fd5e7'; -- banderas (was "flag, banner")
update public.forms set gloss_en = 'players' where id = '4bace0ba-081e-59fc-80d5-4ab55eea7a60'; -- jugadores (was "player")
update public.forms set gloss_en = 'little things' where id = '0069afdb-4403-55a3-8871-7d18987064af'; -- cositas (was "little thing")
update public.forms set gloss_en = 'little kisses' where id = '1fdece19-3616-5abe-a519-e5bd9302c979'; -- besitos (was "a little kiss")
update public.forms set gloss_en = 'beers' where id = '55d27ef2-a9d7-54a0-9299-aa80786e41f4'; -- birras (was "beer")
update public.forms set gloss_en = 'tears (crying)' where id = '99e4859e-151a-5abb-8b37-8ae82e4030b8'; -- lágrimas (was "tear (crying)")
update public.forms set gloss_en = 'conditions, terms' where id = 'b530386e-a8e3-5e35-9ade-acf09aaa1676'; -- condiciones (was "condition, term")
update public.forms set gloss_en = 'responsibilities' where id = '04f2f1c7-f0d2-5b8f-9351-d69fbef47d36'; -- responsabilidades (was "responsibility")
update public.forms set gloss_en = 'targets, aims' where id = '2cec2af0-9133-56ca-8938-fe1c2440b758'; -- objetivos (was "target, aim")
update public.forms set gloss_en = 'backpackers' where id = 'a10efa62-6dbc-51a2-8950-3c43fe6313dd'; -- mochileros (was "backpacker")
update public.forms set gloss_en = 'lakes' where id = 'd51a23fc-c991-50bc-a1a4-3e02b01c50b7'; -- lagos (was "lake")
update public.forms set gloss_en = 'kilometers' where id = '47bfaaaa-8285-54b6-ba4f-867a50ad560d'; -- kilómetros (was "kilometer")
update public.forms set gloss_en = 'small savory crackers' where id = 'c1e89448-c6b9-57f8-a2a9-c48aca009fbc'; -- bizcochitos (was "small savory cracker")
update public.forms set gloss_en = 'immigrants' where id = 'b51cf790-0556-5306-ae8e-d1526d217dd6'; -- inmigrantes (was "immigrant")
update public.forms set gloss_en = 'roots' where id = '3013856f-acb5-59a1-baae-15227f0f7dbf'; -- raíces (was "root")
update public.forms set gloss_en = 'jokes' where id = '2c9616ee-1b05-5dc7-9114-0675d09a8cbf'; -- chistes (was "joke")

-- 2. Senses the gloss was missing
-- "¡Sos una amarga!" is "You're such a killjoy!" in four sentences.
update public.lemmas set gloss_en = 'bitter; killjoy'
where id = '727aeb29-64fe-5b54-96a5-1c79413f61b7'; -- amargo (was "bitter")

-- In Buenos Aires a garantía is above all a property title put up for your
-- lease; the English of its sentences says "guarantor", which stays a sense.
update public.lemmas set
  gloss_en = 'guarantee, guarantor (for a lease)',
  gloss_note_en = 'usually a property title a relative or friend puts up for your lease; the person is the garante'
where id = '558d23e7-e98d-50f5-be3f-720f09e7cf8f'; -- garantía (was "guarantor (for a lease)")
