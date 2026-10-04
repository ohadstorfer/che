-- ---------------------------------------------------------------------------
-- Every live unit's lessons, in line with what it teaches now
-- (scripts/course/sync-lessons.mjs wrote this from the database):
--   teaching   a unit teaching n words has max(2, ceil(n / 3)) teaching lessons.
--              One short of that gets new ones after its last teaching lesson
--              (a draft it already has first). One with more is left alone,
--              unless it has more lessons than words: the last are retired.
--              Teaching lessons left in draft are retired.
--   checkpoint every `checkpoint` lesson becomes a `lesson`, "Lesson N": they
--              were teaching lessons drawn and graded as a test.
--   check      every unit ends on exactly one review, "Unit check".
--   order      ordinals 1..n: teaching, grammar practice, practice, with slang a
--              third of the way in, culture two thirds in, the chat last; the check.
--   learners   a lesson added to a unit she has finished counts as done.
--
-- Nothing is deleted and no id changes. The SQL works from the rows it finds;
-- the table below only says how many teaching lessons each unit wants (want),
-- how many it may keep (cap: as many as it has words) and which ids new rows
-- take. Units not named are left alone. Running it twice changes nothing.
--
-- From the plan: 63 teaching lessons added in 49 units (4 more published from draft),
-- 1 retired, 3 drafts retired, 59 checkpoint lessons converted, 15 unit checks added.
-- Then: npm run course:lessons -- --all
-- ---------------------------------------------------------------------------

create temp table sync_plan (slug text primary key, want int, cap int, new_ids uuid[] not null, review_id uuid not null);
insert into sync_plan (slug, want, cap, new_ids, review_id) values
  ('un-cafe-por-favor', 3, 8, array['e97fa818-c79a-5cc8-adb1-4b6b7793e86e', '8a350f75-412a-54d3-bda9-f113955d34c7']::uuid[], 'f529300c-449e-57eb-bff6-15985a7b43be'::uuid),
  ('otro-cafe', 5, 15, array['e2cafda3-1538-5bb7-a64a-aa7fdc2afe9f', '385d204f-e16d-5fa5-8142-24b791d58305', '6fb46e8e-e242-5cea-9c95-a421b6f6393a']::uuid[], 'a2f895e6-8b34-5de7-9a8f-ab1892afaed5'::uuid),
  ('hola-che', 5, 14, array['408fca82-2c1d-5495-905e-68df0fbf3808', '74569a76-8545-5a14-85f9-7b9b1ec3a21d']::uuid[], '075e85a1-b864-5d35-8c4c-54c3b1576a77'::uuid),
  ('buen-dia', 4, 10, array['fde2f34d-b8dd-5a9e-8d48-5a7ddbbba4ec', 'a8e407c4-817c-5ed1-9ae5-4c9b4fe3da10']::uuid[], '89fd6d8a-f933-5ecf-9ab9-d7c2df4dd7d4'::uuid),
  ('vos-y-sos', 2, 2, array['d560e316-8158-53c7-9f48-c99625a7c44d', '344d8a10-7f4a-53cc-bd8a-ce42a33fdebb']::uuid[], '42794794-4853-5efa-841e-ab97075b3264'::uuid),
  ('sos-turista', 4, 12, array['1780a325-e30a-54e4-96e1-ae7cb64d8bfd', '6c12b699-b534-5856-bbc4-abb8f66f9776']::uuid[], 'f912e6d8-8323-5c1a-aa0e-bba81c2a4186'::uuid),
  ('practica-hola', null, null, '{}'::uuid[], '1e6ef9a2-c6e8-5af1-ba35-d517518f44f6'::uuid),
  ('como-te-llamas', 2, 4, array['d7e86544-35c6-567a-904f-14c23609c393', '9240fa05-dd2f-54e2-b98a-6d408ae75154']::uuid[], '7f77271f-5921-5048-8d84-a95e90fe90b5'::uuid),
  ('encantado', 8, 23, array['9003bfdd-8f49-5f41-a830-f2da2c71df61', '64c1a14b-6806-57eb-ad14-b5c21613d595', '22d5e3f5-a6de-56f0-8265-07692d880a3d', 'c44e8ba6-1dd0-5803-b8de-f3a373811b2b', 'e872d927-c242-5793-b9a4-39f17ece3412', '3f86e92c-59ce-5597-af91-9993b384edf4']::uuid[], 'ee79bcff-9763-52b9-805c-323606cb6f34'::uuid),
  ('de-donde-sos', 2, 2, array['5d64e63e-f027-527f-b5f8-0993ac12bcfe', '6ea1967f-7f14-5c33-8ca5-d40cef3e85e6']::uuid[], '87e05c49-558c-5067-929a-40f98950915d'::uuid),
  ('soy-de-zona-norte', 3, 9, array['be9317a3-ec9f-5e70-b16b-5e696bbea697', '50dec432-4b85-52cd-a4fb-d8cacec20035']::uuid[], '758457fc-9810-5051-bd87-f756b8b5022b'::uuid),
  ('el-y-ella', 2, 5, array['0d1a0d6c-d5b8-5d5d-b72a-fe664dd289e5', 'd3222750-1b0d-5b07-9300-deb47132969f']::uuid[], 'f43d9e3c-68eb-583e-b589-3b6e8d956f91'::uuid),
  ('quien-es', 5, 13, array['c327585f-2548-530c-8887-7173982f0cc2', '606dfddc-91fd-55ad-943e-f45adff0ab56']::uuid[], '6022c2f3-1b83-5f29-bfc4-b411133d390a'::uuid),
  ('practica-quien-es', null, null, '{}'::uuid[], 'd6ddc56d-8a70-5b7e-afa3-b7f2062758cb'::uuid),
  ('argentino-argentina', 4, 10, array['19ace2e0-44c8-5c87-8112-571541340c98', 'ab407fb5-d412-57e0-aed5-5ba87c6af0ec']::uuid[], '2c88a7a8-fc16-5d48-8a0a-d01edb87f222'::uuid),
  ('de-todos-lados', 8, 22, array['3d549283-cc0b-5026-85d6-b0fb1e8d7c93', '60cf7c94-2f8f-5f59-a7cc-4d5cbb44955b']::uuid[], '40be0c5c-ac68-5699-a1cf-8cf869ba5054'::uuid),
  ('la-familia', 5, 14, array['d70d6269-ab5b-5d53-bb7f-a90dae8e07ff', '850b27d9-99ef-56f7-8a7b-91c2f97729ea']::uuid[], 'd2d36985-b9fb-5ac5-8b8c-cd4811a46bd5'::uuid),
  ('tios-y-primos', 6, 17, array['e46cf2cf-745f-5bc5-9d36-d9f2c6d289ed', 'a31f9386-6457-56af-9083-ab9cfee8470d']::uuid[], '25fc57a3-56bc-5faf-86ec-58b21581da54'::uuid),
  ('cuantos-anos-tenes', 9, 27, array['5d091ccb-4752-5924-a396-d887cf09e550', '9d5a3cde-dc49-57b6-af3a-59412e73aa3b']::uuid[], '4eaccfd3-d7c5-58a1-a397-dbc5efceb9b3'::uuid),
  ('tengo-hambre', 3, 9, array['1572cfb6-72a1-5b99-9dda-3c2f3d99cee2', '5897edec-2db0-5b9b-820d-737322804b9b']::uuid[], 'a914fb9d-c41b-5301-8ef7-56889f7fc5d0'::uuid),
  ('practica-tengo-hambre', null, null, '{}'::uuid[], '15e0e8f2-2a89-5ca7-af26-5b03c31f786c'::uuid),
  ('alfajores-y-chicles', 6, 17, array['341b54d7-c67c-5fa9-be1c-e7b5822c6ebd', '1725ead5-3f59-5bff-8655-9aad80673288']::uuid[], '5ec28797-b7cf-508c-8c99-883e8c61eebc'::uuid),
  ('en-el-kiosco', 4, 11, array['3ae7ced5-bd4d-5d37-9449-94dbce373c65', '61527154-cee3-5a35-935a-c59615c9d0b0']::uuid[], '0f85134e-9157-5ec9-a7be-02adc9956cb8'::uuid),
  ('cuanto-sale', 12, 34, array['ae343671-c32c-528a-b504-9bd197de4f4c', '36201c18-082c-5bd0-98cf-869925ad5d19', '2ac89703-0d98-55cf-8ab3-cf0a02b4f60d', 'f38c9dc5-f0bd-5797-8484-d9fe18964391']::uuid[], '19509e91-68f3-5f7f-b382-7dda6a9f30c6'::uuid),
  ('la-gente', 3, 9, array['8ecbb56a-3f57-54c3-8bfb-ba1664c3f1ac', 'ba1ff947-50c3-5ffb-8c42-e24679e327da']::uuid[], '4771bfc2-1c34-5a11-847f-a5411d51591d'::uuid),
  ('altos-y-morochos', 12, 34, array['16cc1d61-ea9f-53f8-8d02-bdc8608df66d', '6cacb397-3f85-5a47-af13-6aa344ae9bd2']::uuid[], '5913f9f4-8d93-5dcf-bf62-83ef79f2e134'::uuid),
  ('donde-esta', 3, 7, array['f12865bf-dba6-5e16-9583-d2b25ab00e70', 'baa2b7ba-8720-56b2-aaee-c12daffa4934']::uuid[], '320e3c8b-52f2-55dc-b4ef-639db7658928'::uuid),
  ('donde-estan-las-llaves', 5, 13, array['6a6172bd-3be2-5c40-84d5-09acfabbc43e', '084939f4-8a8d-58b2-9776-21bbabbfb986']::uuid[], '214ec96d-5d82-5ee4-b87d-b15f489bc4b0'::uuid),
  ('hay-un-kiosco', 3, 9, array['bc0bbd6a-d150-5820-b179-b6db0f7b926f', '5d4cff92-da34-5fb4-a0da-774f36b5a6f4']::uuid[], 'c910186d-a6a5-5cf6-8981-36eab0d7aa7d'::uuid),
  ('hay-un-tren', 4, 11, array['2cec6e9b-780a-567a-812d-d12d5f1f5353', 'aedb1037-0d56-59bd-8d1b-ece4f5727677']::uuid[], '5890c4ba-b518-5a9b-a23a-c6fad1e9b856'::uuid),
  ('practica-por-aca', null, null, '{}'::uuid[], 'e305ffc4-0a4a-5b4a-843a-e9481f9dfa45'::uuid),
  ('como-estas', 9, 27, array['652e321d-fd71-5b72-bd4f-6e0119247612', 'bbaea887-c68d-5bba-afdf-e88c31868696']::uuid[], 'e24e0d1d-6428-5b15-a19c-90fce10b1477'::uuid),
  ('esta-cerrado', 9, 27, array['9734d4f0-c72e-50be-947e-acb6bf2a1160', 'ffa5ccd9-aa90-5d47-89fd-1f4a0caccae3']::uuid[], 'c6f4f500-5832-5d8f-a299-70ca13eb2175'::uuid),
  ('que-haces', 11, 31, array['048867a7-561a-554a-8fe3-b54d6b6e31c7', '8397572e-e324-53d8-94f0-340c9e11a890']::uuid[], '75eff695-0b38-50ae-953b-999e04c9d2e0'::uuid),
  ('practico-castellano', 12, 36, array['34e060f6-e2fd-51cf-995b-59f648a2c4da', 'f751caca-6d00-58d4-9a53-e1daa7044eb3', 'b5f9cf74-a5f1-524b-9894-c8b74a02fd4c']::uuid[], 'f5e932be-2d07-5807-886c-9e4554c015dd'::uuid),
  ('mate-y-facturas', 4, 12, array['586c998d-82ff-5ef6-80a0-23c7bdc26570', '94b5c4e9-fbde-5711-b232-0954e5973c94']::uuid[], '9c0e7d49-507a-5670-9ea6-e2f3eaeea10c'::uuid),
  ('nos-gustan-los-fideos', 4, 12, array['91643f16-ac0c-5a9d-ae3d-f3de148b8b01', 'cf19337b-cdd7-55b6-b179-b5932a025a34']::uuid[], '467ff9be-209b-5e32-91ad-0625a77aecdf'::uuid),
  ('practica-nos-gusta', null, null, '{}'::uuid[], '82c05224-6c36-54e4-a660-d6538325bf3a'::uuid),
  ('me-traes-un-cafe', 3, 9, array['9d624d61-059c-56f5-82fe-24e48b5a58e8', '33041ca6-e8eb-5869-831e-03d6542ca6e2']::uuid[], 'b7bc93e2-54a1-585d-98d0-2ef7c31c51fd'::uuid),
  ('que-quieren-tomar', 5, 13, array['e9a2e7bb-9cda-5654-b3d1-6d6959e29478', '98da6dff-09ba-5d33-8b88-ace2555e9b18']::uuid[], 'c288cc37-3ecc-542d-88d9-4af2afd187ca'::uuid),
  ('facu-y-laburo', 9, 27, array['2b418c90-a7e0-57b8-b120-8628957844df', 'c9f1e228-0047-5e56-8377-792b45b338d1']::uuid[], 'c0c76f6e-b7db-5130-a054-fac5238cd57a'::uuid),
  ('es-enfermera', 8, 23, array['c601a565-cfdf-587b-910e-a28622d1caba', 'debe070e-6515-597f-80ed-f22afd70ecd1']::uuid[], '44b7b4b1-fe25-5a81-91fb-c2bf66507450'::uuid),
  ('comes-vivis', 9, 27, array['4671e4b8-181d-5e12-8b7e-6cd862935a17', '15bda4da-8808-5f35-ae1a-15d2df5a4038']::uuid[], 'f8985c29-2b9f-5975-9ca6-e33d199802a2'::uuid),
  ('vendo-diarios', 10, 29, array['97703b52-a780-550d-8296-06c462f9970a', '3a5bf352-bc83-5a88-a8df-bd3db1e05adb']::uuid[], '80078b8c-960a-5fa2-baa7-8ae3ec69de22'::uuid),
  ('practica-el-vecino', null, null, '{}'::uuid[], '1206a6b3-4188-5a48-8e8e-b7ad87f30967'::uuid),
  ('mi-edificio', 6, 18, array['ec986cb2-ec7a-54b1-8131-0b730f969c5a', '55d972da-7134-5dfa-b9ed-72acbd482477', '9f53446d-c3c1-5e3f-b8d2-eb1636b6cb3a', '4482ec90-528f-5a52-a5e6-7897153e1c80']::uuid[], 'cd0cb74a-386b-595a-8e60-51754dfb19d9'::uuid),
  ('mi-casa', 8, 23, array['90cb095f-1caa-53b5-8c58-274bbeedddf9', 'ec642cf6-596d-5ee6-938d-d7dc3d071a7a']::uuid[], '2dc14d58-5264-5bb9-a3ef-dec0296adc05'::uuid),
  ('la-hora', 12, 34, array['8341f24f-5fd7-53f6-831b-4be2528ef176', 'b1b56fcc-87ba-5732-990f-da6a4bae2283']::uuid[], '571d3443-21c4-52c8-9cf6-d0ad98014841'::uuid),
  ('a-que-hora-abre', 5, 13, array['b2778448-136b-597e-8483-96b8cd4bc9b2', '5f4f4a86-e845-5509-aa4f-875748ff0b93']::uuid[], '7d8cb04a-b392-59c9-91a6-b8f982bc50c6'::uuid),
  ('tengo-una-reserva', 6, 16, array['9f375caf-bb9b-5ba6-ad23-bdb436b4c7eb', '2b867217-63e0-582a-8317-463e63bacbbc']::uuid[], 'd4d28e86-448f-5dcb-90c8-10457075fd9d'::uuid),
  ('el-barrio', 5, 14, array['6031e86e-e8a6-5df2-900d-57eb770a9d21', '39d4432e-7920-55c4-aa84-c9565430199b']::uuid[], 'a073df44-5700-5ff7-a1b6-6cdf77241f19'::uuid),
  ('a-la-vuelta', 4, 10, array['1c6bc2c9-cf30-5774-a5a7-f5367deb48e0', 'eca1b5a1-e850-5c50-8d3d-69c29fcfe82b']::uuid[], '442a6998-dcb7-542e-aa38-41bdfab0564d'::uuid),
  ('queres-podes-vas', 11, 32, array['519edb3f-a28a-5555-8694-396ea1cd2f5c', 'f8277459-f093-578b-ac17-08cedbc63979', '4290d675-1b80-5500-ac1f-c2f70400c47d', '3b0d2c8c-70cc-5762-961d-da3cd5e3c4db', 'f2c64dba-4954-51da-82b0-87b195b667e6']::uuid[], '0a13f030-ca47-59cb-bb93-86c5cf20131c'::uuid),
  ('preferis-salir', 9, 26, array['88991cf3-df3a-5ec9-9065-aaf83cb349b5', '94dfc8f8-61c5-543a-ba2b-a5121a0ec209', '05809da3-38c6-5098-881f-25809098fbb9', '26c752d4-740f-53bd-95f5-724024ea1370']::uuid[], '99f4fee7-38ef-5be7-a999-f91b8a6f5ea2'::uuid),
  ('practica-a-la-vuelta', null, null, '{}'::uuid[], 'b9cd3b35-a54a-5d09-8bea-8f3ad27ae9cd'::uuid),
  ('dale-veni', 8, 22, array['3398414e-8b8b-5441-bf65-185969ce6502', '701bd9c6-d021-5216-b887-01043c8d7092', '1e953af1-1fd3-5805-8bdb-be5e0bc1247b', 'a9e372ba-c78b-5f25-b4e6-95dbb7a0871a', 'fe47af11-af22-5888-84cb-7f541a0251c6']::uuid[], '43332f43-3a3b-593c-b3b8-2f1d8fa5f4c6'::uuid),
  ('segui-derecho', 6, 17, array['48f49864-a13c-574f-bd2c-a96ac6b798ac', 'fc189d22-68a9-56f9-93d1-7f8a14d88229', '7edec8e0-1dda-5faa-98cf-85da43571535']::uuid[], 'ad784ef9-72cf-5199-8084-98171bc2a94a'::uuid),
  ('tomar-el-bondi', 5, 13, array['b1b0c5b6-a538-5174-a768-bf3d0b4d8038', '9184cd91-cea0-5547-9184-d02f3e451028']::uuid[], 'd2b66c02-f1fc-56a7-83ab-5100536855a4'::uuid),
  ('en-taxi', 4, 10, array['9708a744-7023-56e8-ae6c-c7ee73727907', 'b454ecd9-0235-5885-8189-722c217c408d']::uuid[], '54b1ddbb-c557-59be-bcc4-811833b662e2'::uuid),
  ('ayuda', 4, 11, array['8465a842-ea10-5eb4-9176-ed0f5a6372cf', '96354513-1ff7-5fa5-875f-356fdd062b63']::uuid[], 'bdc0718f-5080-51a7-ba5f-f4e15878234d'::uuid),
  ('ropa-y-colores', 16, 47, array['d1e60b8e-4703-5d08-af18-6fe4c8a1b125', 'ede5ba7c-7bcf-53d1-a074-a954a9375cde']::uuid[], '4e1d218e-8d8f-52cc-8583-978b60ee3979'::uuid),
  ('este-buzo', 10, 29, array['4feb964a-f48e-5333-ad8d-023b921285c9', 'a0239402-eac4-58b9-b8b8-8254fa9c25aa', 'dd1781a2-a53f-5017-992d-784644010972', '54e7b8d4-918c-5c19-9edb-abffcbd7dd49']::uuid[], 'b8cec90e-67ef-54cd-bc9b-a39136f775de'::uuid),
  ('me-cobras', 5, 14, array['edf46494-6c9d-5e31-916e-4903885181a4', '046af28f-718a-5765-aea1-fb4520ce202b']::uuid[], '04c4a116-3cab-542f-955d-8943dd77f04f'::uuid),
  ('debito-o-credito', 5, 14, array['c8ce4812-c743-566e-bd8a-59856717d71c', 'cc39fcfd-064d-5c09-885f-46818d377ead']::uuid[], '29ae734b-f445-5b1a-8de4-c4e64ed0f3ef'::uuid),
  ('practica-me-cobras', null, null, '{}'::uuid[], '3900d442-eb47-5ab6-a5c2-368040236050'::uuid),
  ('la-rutina', 9, 26, array['28953672-5973-5021-80db-90ffd0612414', '76d0f4c4-ddae-573d-b600-b942596ff6a0', '946312ca-8bd3-5dd7-b7fd-cef329ab885a']::uuid[], 'd4ab38ae-a743-5955-93d0-93e5f84e5983'::uuid),
  ('me-despierto-temprano', 9, 25, array['ed723d47-bd2e-5f2f-90f7-5b60ce7da1c9', '9cc6a6ea-da75-5602-ba0e-eac1ba1fcd92', '81c6947a-a1fa-547f-91f7-29a62a45f1f0', '8c0cd270-014f-5a83-846a-80b50b64361f']::uuid[], 'e3e0fd20-d70d-5fd8-8d69-df4ed3481e2a'::uuid),
  ('que-te-gusta-hacer', 9, 25, array['dcb01ead-f459-552d-afdc-c0d6a7128cd3', 'cede81ab-4fbf-5261-b6dd-b53a87f0e093', '1ef9168e-d1d9-5f1d-a4b8-7bf33fdeb5a2']::uuid[], '30a66d17-7415-5f94-aff8-b7dd4bd8b066'::uuid),
  ('me-interesa', 6, 16, array['9a8a6f5f-c1ef-54be-a681-24bac753fa32', '760bf683-5d02-57c3-9e9f-df397d3a4280']::uuid[], '704cb8e7-3d4a-5f0f-9cad-3a953b709a4e'::uuid),
  ('pasame-tu-numero', 4, 11, array['f7f6cdf3-18dc-58e3-88d3-8c612c800163', 'cb2de533-18c5-584e-ae1f-781b5ae7e3b0']::uuid[], '8a3d7eaa-5a9e-53cd-b401-94a6d0970830'::uuid),
  ('clima', 5, 13, array['fae0d159-096f-5058-ab24-a49361b48b56', 'df7727be-ec25-5ec3-ae04-29fdc88ed74e']::uuid[], '67ae2388-de83-5d21-a858-a2acc659cfc9'::uuid),
  ('en-febrero', 7, 20, array['59dc6d2c-d7ad-59bc-90dd-6595f5ee9bfc', 'b3ba0c23-f27a-523b-ac39-2b9c7a492910', '5f135e64-4bb8-5b6c-b8d6-a598441e87d0']::uuid[], '41d9e52b-10c1-5eeb-bdfc-f723ae0c5cd0'::uuid),
  ('practica-el-clima', null, null, '{}'::uuid[], '32208073-6833-555f-b27b-ece8edcd6168'::uuid),
  ('el-cumple', 8, 23, array['6b059391-279b-56a0-b422-92e82f109f21', 'f21361d5-b4df-5670-9a90-a7a2f54f1e23', '1c424994-1c82-57c9-aecd-2f905bd966c1']::uuid[], '6e4cbe05-c301-5e8d-a1c5-2cbeb2d5885a'::uuid),
  ('ahora-y-planes', 11, 32, array['19c83c56-5a60-5059-ac14-50d5e3d32cb2', 'a23a5832-413e-564c-aa36-8d7f2a0cae08']::uuid[], 'd3cab237-50ad-5e65-acb8-6b8519d302b0'::uuid),
  ('ayer-labure', 8, 22, array['96a509d0-8df2-5cc4-aa09-a3576f408697', '4aa18fab-3977-5764-9c44-dad1b04eb99f']::uuid[], '841700f3-0b5c-5e38-9e90-2213a759dac4'::uuid),
  ('cenamos-afuera', 8, 23, array['c6ea5738-0263-554f-acb9-422c15b95c26', '84be763d-cb1e-5a49-a420-1c2e1ccd0fe6']::uuid[], 'ae7547fe-5c00-598f-9ed2-5214e1cc7f84'::uuid),
  ('comi-y-sali', 6, 18, array['1ecd7c30-d7ea-5278-ac12-3980289467e3', 'c86dd20b-46df-5c5c-b6cc-76b95f6e9f2f']::uuid[], '7ef6fc0d-9bf7-54e0-ad28-e3329c93d88e'::uuid),
  ('naci-en', 7, 19, array['e4355a05-2ade-5448-8388-076d8ee0cd7f', 'b55bae44-0b1d-5ef7-b949-345cb5661d4d', '78ba3ac5-752a-580f-a29f-8b39699f8ec0']::uuid[], 'eab52d36-c0df-565f-b252-fc6ea8ec4b09'::uuid),
  ('fui-a-la-cancha', 5, 14, array['75e3610d-fcc7-54b7-b166-00594e7a2f99', 'abc1fc78-51ca-5e54-bd74-02fd42c22ac1']::uuid[], '31908827-dbb4-55fc-ab9d-6b8743829cbb'::uuid),
  ('la-pasamos-barbaro', 6, 17, array['c4703ae6-5e82-5a80-8879-749c2e5befe2', '4b603307-19de-5369-9d98-718b95672bc1']::uuid[], '4a0b36ff-c559-5b0b-af88-0aecc1e0c15a'::uuid),
  ('practica-como-estuvo', null, null, '{}'::uuid[], 'd8c46aaa-a51c-5d66-a70d-5b6dbc2e150a'::uuid),
  ('el-finde', 6, 18, array['5512461c-ae33-5cd4-b5f1-36f88dc059d6', 'a3ebc4a2-a323-57a1-b8d0-18eabf323ee2']::uuid[], '652891cb-7f6d-5ee3-b38d-29753573e2da'::uuid),
  ('vinieron-todos', 7, 21, array['b8d368ba-7046-5d95-b0be-e98ad64b5346', 'c3435f03-092c-50ac-a3da-1067190260a9']::uuid[], 'c61e9d03-f5aa-5c3c-b7f3-319c5815972b'::uuid),
  ('mas-alto-que', 4, 12, array['e3240970-147b-592a-8bcb-b22dbfc4b623', '876b9cfe-f070-5989-9866-3b0b547458a2']::uuid[], 'd5123adb-60d9-5130-9687-14a398b67b37'::uuid),
  ('el-mas-tranquilo', 5, 15, array['962da091-782c-5ad2-9059-7ca5d1f50088', 'bf7a485b-a36d-5d7c-8425-6fa26610cd47']::uuid[], '6e153821-a864-5e57-9352-9df9340f2723'::uuid),
  ('me-duele', 8, 24, array['1d9b9efa-e39a-5443-8ccf-cc79fb01a914', 'bd615aac-8c43-5297-9a11-c7d3cfad33e0']::uuid[], 'a029e83b-e717-5914-8f75-52b8bde7a6f0'::uuid),
  ('me-dolio', 7, 20, array['0b9dca54-a01b-51f8-b8e9-9d9b2dbf651c', 'a71f5ef7-6594-5d36-bd20-5d5fd7796016', 'd74ae9d6-ddb9-5581-9887-03b03c5bccf1']::uuid[], '5fa56d14-23f6-5335-9d91-f1ff1cfffd7d'::uuid),
  ('practica-quien-vino', null, null, '{}'::uuid[], 'c6460211-901a-5380-bc10-be9416483f4b'::uuid),
  ('te-llamo', 6, 17, array['f2dd71e7-4dd1-5257-a1ae-81d09a332546', 'be689555-c2ef-54a4-83d6-67da62021703']::uuid[], '534883b0-3ef3-5c42-bdb5-eb3cc907ed67'::uuid),
  ('te-llame', 7, 21, array['fd82f8a3-eb56-56a0-b40f-9c1e7aa8856b', '074eeb02-ef9f-5c68-9aa9-7b55b7ddb587']::uuid[], '9dea8a47-4052-5cad-959d-6263773d301b'::uuid),
  ('las-tareas', 7, 20, array['f3f8b44e-1642-5d4c-a52c-4d73b2a567b7', '8d57f303-c043-5bce-9137-286653305fc0']::uuid[], '621ab970-7b6c-5e47-bc73-2162de1ff363'::uuid),
  ('quien-lavo', 8, 23, array['5cbad03b-5f7d-578e-841b-1fbf601c64d4', 'a1eabbe1-8171-5b39-b044-dea1c816418e']::uuid[], 'b6a5adde-984f-5ad7-bbd9-b785fbedcf1c'::uuid),
  ('de-viaje', 5, 15, array['c11d27a3-9a98-5658-8481-1b7b7adf8945', 'db399589-45d5-516a-b28a-93ea5b166c30']::uuid[], '0615a3f4-9889-5ff3-8635-8dea7aa03526'::uuid),
  ('las-vacaciones', 5, 15, array['e8650f7a-5191-5028-80c4-d26eb7c87335', '2925b90a-70dc-5534-8530-c86816e83932']::uuid[], '4183f6f7-c4b8-5a09-89ca-c8e0f23882d8'::uuid),
  ('practica-las-vacaciones', null, null, '{}'::uuid[], 'fb7ebb32-f9c4-5bd1-b149-69386bab3693'::uuid),
  ('menos-mal', 5, 13, array['953f3bba-109f-5b3c-ad34-1a3a67cf97c8', 'cd9f7fc9-167e-51ca-ab61-d636241759b4']::uuid[], '78e73eef-77b9-5deb-b88b-81e652a5614d'::uuid),
  ('contame', 3, 9, array['033621ff-2049-522b-8acd-d1a6559816ca', '94317dcd-2101-5426-af17-906a62361ecc']::uuid[], '5b73f9a6-ab8d-50f6-b4f2-3a2afe02eaae'::uuid),
  ('cuando-era-chico', 5, 14, array['d660bcbb-e811-5a47-b90a-bbcc9803b7c8', '648c891f-18a6-5656-ac87-2124a2af98be']::uuid[], '93c7a3f6-084b-5831-bab3-dc3aa14e4dfd'::uuid),
  ('en-la-primaria', 6, 17, array['28442183-c7e7-55bf-bdcc-5894bf7b0466', 'b2a448eb-3579-564a-be43-e338716aaead']::uuid[], '92dc4a11-5ecc-5c5a-8739-0dc6ff0fba16'::uuid),
  ('siempre-jugabamos', 4, 10, array['674cd331-953d-5c3a-8ab5-667999f97da0', '4653006d-42cd-5b11-b8d6-a3a2e30044de']::uuid[], '9aba792b-056c-59ce-955b-705daa5aad50'::uuid),
  ('me-encantaba', 6, 18, array['878e5bd0-d105-5c9d-95bc-31c6acd2c02d', 'b4afb9e1-215a-525e-b359-07d376c67c41']::uuid[], 'a8c7253e-092b-524e-bb5d-9adb196b3229'::uuid),
  ('estaba-lloviendo', 3, 8, array['d0377476-3943-53dc-9af0-2f2fdbd44ee1', '118949af-e16a-50f1-bdfb-ec3da3ae9e62']::uuid[], '14ce30df-46fc-533e-8251-6ba8321b1e32'::uuid),
  ('sono-el-timbre', 5, 15, array['fe4acfcc-cf4e-5d40-b6d7-ba52a2a1877b', '1c9b2a16-ea4a-50e9-b983-801510241f86']::uuid[], '9c3ff51e-2d8f-5e29-b45d-88fcb9370e64'::uuid),
  ('practica-en-esa-epoca', null, null, '{}'::uuid[], '524fc421-05d8-5817-96c9-93adaf7dd1d7'::uuid),
  ('el-partido', 4, 10, array['e19f8fe1-3f1e-57cb-987d-866d396652ac', '98383f67-4746-52f5-9947-10ba12471b48']::uuid[], 'faf707c5-c66b-590e-ba2a-1428ad71948c'::uuid),
  ('la-final', 6, 18, array['4be8d1af-7004-5899-b879-7188000a28d5', '898ee07b-e217-5dd4-910e-e2583ef2c510', '9f5c764c-8e11-55cd-8333-3e1a8cd0a141']::uuid[], '190e51b3-935a-5283-938e-802c3732cd37'::uuid),
  ('de-que-cuadro-sos', 2, 6, array['6ce4f737-3a0d-5865-a2d7-c8167a4750b6', '892dc05d-9d62-582e-8096-418e639c3096']::uuid[], '66e29921-1a4d-568d-8997-ce9b470a220f'::uuid),
  ('socio-del-club', 7, 19, array['0e542f2d-b8cf-5903-a60f-4141835bdb6a', '726c0e2e-b2f5-5bcc-9272-0cd7c724b95a', 'f3ee8136-4f25-5df8-87fe-2bcd2029831d']::uuid[], '5ec1a9a3-332e-5352-8dc5-d6d9b3a66ed3'::uuid),
  ('en-el-restaurante', 5, 13, array['47df15bf-4268-50e9-b484-1cf1cbbc0cab', 'a2da0ffc-37fb-5f1a-8633-82c8b29f0bd6']::uuid[], 'e66601b5-d920-5c9d-b342-c335b4ce0eb0'::uuid),
  ('una-grande-de-muzza', 6, 17, array['346e2ed1-568a-51bd-a04e-7c132841a3f5', 'dabbfcdb-d862-5308-aba3-3ba1164a915b']::uuid[], '7fa5c59d-876f-5ca8-b6b3-e2ef8d42a1f5'::uuid),
  ('la-parrilla', 3, 7, array['32b87eb3-a74b-54ee-9337-34848d421ae3', '9e113fed-e842-5989-9065-9eccc5c6d737']::uuid[], '62dcb6fc-628f-52b1-be95-4805564035b9'::uuid),
  ('la-parrillada', 5, 14, array['cd60a0ec-9b8e-5789-8cb2-0b1861fe460e', 'adc7b779-8aa2-5d04-ad3f-2f72873d1dc9', '7eefec5e-f09e-5b8d-9648-5c4d4f7cb3b6']::uuid[], 'c286ea3c-9c27-5af5-aea0-7fd785d4dfd4'::uuid),
  ('tipo-ocho', 2, 6, array['7d20fd14-98e1-5197-8b81-545c52f0f488', '8f0430c8-fb4e-5433-95a3-05a94ea4eabb']::uuid[], '10c08a3c-9fff-524c-b653-da78db3725e8'::uuid),
  ('llegue-tarde', 6, 17, array['e8d29ef7-4201-5675-b296-23c7c68f0965', '8fdf9815-9084-5942-920c-56181a6e762e', 'b7710a1c-8934-573f-872d-dbbcaad4570a']::uuid[], '4418450d-d923-5214-b661-23fffea5e7d9'::uuid),
  ('las-fiestas', 4, 10, array['b6861e48-80b8-5347-ba47-17d442d988c5', '0792795f-3a1f-5289-a38d-279c8024092a']::uuid[], '0996a2d3-021f-56bc-aa0e-c9beaf6acc2a'::uuid),
  ('en-lo-de-la-abuela', 4, 11, array['45b692a1-de42-5542-9cbb-a558cb6f3388', '6ad327ef-6d4b-525a-ae88-c31a43565328']::uuid[], '0bb5bcf7-6947-5c47-a54f-3a25eaf93e42'::uuid),
  ('practica-la-sobremesa', null, null, '{}'::uuid[], 'b01bef2e-78c0-55ee-9997-10d0a5304ede'::uuid),
  ('me-puse-nervioso', 6, 16, array['15077ead-52e6-5412-9fb3-54a481fed704', '295edf5d-4b78-5717-975a-127b3d067982', 'b24242ae-f765-54e6-abbf-5d6c9f7a3014']::uuid[], 'ce04d5b9-bf31-59e5-b01b-5fd39457295c'::uuid),
  ('me-olvide', 6, 16, array['8af2e55d-7d00-5f5c-9afe-0d0173994fa1', 'd0db2737-760e-590f-ab12-3e27781f6f29', 'b406a13b-12fa-579a-9005-bcbbd7693f0b', '28a5be6c-aff2-5cef-a629-541cd0dfa7e8']::uuid[], 'ec800c61-365e-5d1c-8b90-35fff29ba257'::uuid),
  ('la-semana-que-viene', 2, 6, array['890a247c-ac51-59df-94cd-b99f90b49671', 'bb72d181-c25b-5c05-98d4-2df1c804aa32']::uuid[], '7c43e5ad-2889-53d2-b9fe-cf583cd985ae'::uuid),
  ('voy-a-tener-que', 3, 9, array['88592673-3438-57d4-8577-84a91f3e2714', '963c666b-7550-5cb3-ab93-91645f632461']::uuid[], '4507ed47-4060-51cd-b7e2-38ae3f5de2a1'::uuid),
  ('recorrer-el-pais', 2, 5, array['397ca411-50a0-50f0-9aa7-0cd8c92aa976', '96742c72-5ecc-5579-b5f8-66a84ea627ad']::uuid[], '8328533d-abdf-52f4-b200-b853f9cb363e'::uuid),
  ('acampamos-en-el-sur', 6, 17, array['6d04edad-03a1-5622-b0f2-70d0afe1c82b', 'a847de2b-df2c-59ee-a09b-d442055b6e78']::uuid[], '4d0bf846-a09b-5a6c-aa00-6d14f6c09a98'::uuid),
  ('me-mude', 3, 8, array['8b01feea-5545-57dc-b9ec-31ae009b2bd3', '8920773d-acd7-53c4-a43a-60abd7ca0284']::uuid[], '2a35ab16-339e-5bad-9b86-6b02c180333c'::uuid),
  ('el-depto-nuevo', 7, 20, array['5baf7a10-72a0-502a-9454-77d95f81368d', 'b785be53-1b6f-5979-83bd-5ccf91b04e28', 'b495a4d8-e941-5455-afb2-9e3a1dca8671', '45f26856-a0a3-5422-9bec-bc6865c993d6']::uuid[], '8261606b-2d16-5471-8aa0-672175231871'::uuid),
  ('practica-antes-y-ahora', null, null, '{}'::uuid[], '57250e0e-3c81-50ce-b9f4-02b59e53b8d2'::uuid),
  ('las-figuritas', 4, 11, array['0fb9b84b-130a-5739-9c13-aac6c5f4b0a8', '82a7fa11-c330-5b67-9284-4dcc9b1f447d']::uuid[], 'f843031f-c39c-5a45-8cc5-d5a3420d1e73'::uuid),
  ('te-acordas', 3, 8, array['80bf96be-ece1-5239-9a19-36f99c301918', 'd097547c-f35a-5834-969f-f11a89d72f3f']::uuid[], '51f44607-4b7e-5aec-b89e-7dfee0531258'::uuid),
  ('me-haces-un-favor', 2, 6, array['8cfa33a6-c90d-5b3e-ba03-48fe7d8658aa', '521de846-79ea-52a7-9b33-870ce9f6d982']::uuid[], '88b79172-0337-5c78-adcf-500dbcf64307'::uuid),
  ('me-das-una-mano', 6, 16, array['ca037961-c927-5818-9459-c614d2622947', '4a7bf35a-74d1-577e-abe1-148c7159d1f8', 'ed618e93-eaf5-5a18-9ebf-28e982a729f5']::uuid[], '271ac1dc-c9ea-5f97-8ca0-9ad6e230b70b'::uuid),
  ('un-ratito', 3, 9, array['7e44b59c-7d50-5a46-ab0a-66e91cdba883', '378e175d-1590-58ec-9d79-eda8c0c6d896']::uuid[], 'aefc7f2a-98c8-58d9-b40f-0388bf38535c'::uuid),
  ('hace-fresquito', 7, 19, array['60bc8a5f-e9c4-5f97-b21d-2cbd2530fee4', '506d6a6d-aa0a-5690-9b2c-33ea9dbe3137', '8bb814e3-a907-5919-b3e1-3bc5a48f7736']::uuid[], '344f100a-5374-5bdb-8e67-74d1ecf01cef'::uuid),
  ('pasen-pasen', 3, 9, array['949f1e3b-e019-5830-b2ac-0ba7fa07d009', '9879fdb6-3635-5ed5-99ae-1fb6fb30887e']::uuid[], '80795648-12da-5d30-95af-0dba7feaf549'::uuid),
  ('a-la-mesa', 5, 14, array['97b8f48d-d6cb-5a8d-aa72-bac4a9b11565', '56094a72-d893-5d86-a5dd-5015a1d26724']::uuid[], '2891fe13-2fa1-51df-a214-6e99a71e3177'::uuid),
  ('hay-que', 2, 6, array['dcbfc1a3-b114-5bb9-a667-d54f67289929', '6e0d649a-0321-56af-85ca-f2eef8bf3619']::uuid[], 'efaa45dd-6e3f-588f-953d-769f2325ad1e'::uuid),
  ('hay-que-sacar-turno', 6, 16, array['08880a9c-64b9-5229-80c7-6c0a052bf089', '65948f04-208d-5730-a2f3-9f4409e9c233']::uuid[], '32a624fb-4ca2-50ac-817f-ffedc31b0ae3'::uuid),
  ('en-la-verduleria', 5, 15, array['535e2de9-d48f-5994-88e5-bee9a992de9a', '9bba4884-9b50-5b53-95e0-4e949cb88888']::uuid[], '25083f69-b517-5f8e-9415-98c93566586f'::uuid),
  ('cien-gramos-de-jamon', 9, 27, array['192cdae3-1670-59c7-88c4-61496e6cff8c', 'f77a45c2-e8d0-52f2-86de-bb457e34b5ef', '0243609b-3817-525c-99e9-a91530984bd2']::uuid[], '3091c850-9e79-5b65-8fc3-3b29e8bf607e'::uuid),
  ('practica-la-feria', null, null, '{}'::uuid[], 'ceb028a6-f10a-5365-9d49-ad7065743914'::uuid),
  ('el-celu', 4, 11, array['227e0a6e-c5e3-5356-ad53-8d1af9004e7b', '9c553758-8e4f-5eb2-8167-5c90f106efa7']::uuid[], 'ebc0cc2a-8301-51ba-b6f2-39f6eb5deb13'::uuid),
  ('no-tengo-senal', 5, 13, array['b582386a-6afc-5013-94aa-d41fe52874db', '7fffeb5f-f760-53b2-a0b2-68512b71ff35', '04fd6aad-f560-5886-a549-6025ffd8e406']::uuid[], '6dcf94d5-443a-550f-b0ca-522655401a7e'::uuid),
  ('me-robaron', 3, 7, array['cbf5c136-00e3-53e1-a77c-4f11271c4491', '5ee18336-368c-5ba3-a69a-f8887c865083']::uuid[], '2c11d42d-d5b8-56a5-80e9-5313d054aaf8'::uuid),
  ('me-afanaron', 6, 16, array['c3cbc01e-ccbb-5c66-907f-3ce6170663de', '67372ea6-bdee-5ffe-8d82-f6bb0a1b80e8']::uuid[], '833bc15b-c8bc-5aa0-8912-447c092cb37f'::uuid),
  ('te-lo-devuelvo', 5, 15, array['90baf6a0-0c61-57f1-8fe8-95342baa38d1', '6ca8ecb3-8714-559e-b957-c05448778129']::uuid[], '203c4d4c-0383-55eb-b798-cb948189030e'::uuid),
  ('te-lo-presto', 4, 11, array['b0970d62-7bb0-5d7d-952b-8b85c5cff7b5', 'd125f1c8-94cc-5b78-8859-ea4fa5258150']::uuid[], 'c8e01b9c-5d1f-52ae-81f3-57d4bd4d3287'::uuid),
  ('laburo-nuevo', 5, 13, array['032dcdba-cc09-5dd7-8b64-0d1bee756d9f', '42fb1b59-a759-53de-86cd-fd1897d654bc']::uuid[], '00e2925f-6d25-5163-bb8c-e1df538ee3f0'::uuid),
  ('me-contrataron', 4, 12, array['ddaa54f3-2ec2-582a-8afa-65d5d4f46f15', '905a2ab5-7b37-54fd-ada8-c89624c01093']::uuid[], 'a4fca5c5-4169-5e77-9cbe-bd91562b40d8'::uuid),
  ('practica-te-lo-presto', null, null, '{}'::uuid[], '5e767733-3d7e-546a-ab23-6873880381a5'::uuid),
  ('salir-con-alguien', 4, 10, array['4398d992-caaa-5b87-8301-f220aa78470d', '9a21d1d6-36c5-51bf-b1f8-90368a822400']::uuid[], '92d8370e-efe9-5e34-8f97-e0529a6714b2'::uuid),
  ('estamos-de-novios', 5, 13, array['97738063-c932-56a1-bc0e-e46feb7922cb', '124b487d-6c90-531d-9d25-c949b64156bd']::uuid[], '48bc6175-5962-5ccc-a7ba-731df2f09d83'::uuid),
  ('me-cae-bien', 2, 6, array['d016e0ae-5cfd-588a-82a1-9a870ddad695', '87b8446e-8c66-573e-b06d-2bef1c6f87ff']::uuid[], '573d7402-91d0-5fd0-aa37-252f32f46a1e'::uuid),
  ('no-lo-aguanto', 6, 17, array['bb051866-e862-54a9-8b6e-6713f8455f97', 'ed89b6db-8809-552a-8e68-f6bb34cdaaf7']::uuid[], '31a86967-94c0-5e72-a7c8-81be886390bf'::uuid),
  ('se-caso', 2, 4, array['0389996d-b7c7-5232-bd51-cb0e19712430', '34146182-ab08-556e-8009-aab1807cec06']::uuid[], 'e4466723-3c07-5013-9e6f-2a1d7c558d62'::uuid),
  ('se-recibio', 6, 16, array['696cf482-e8dc-509b-a8e5-4eb51704faa2', '0c6bd970-41c2-5609-87c1-a7d9a4b16b86', 'ab5e80df-806d-502b-ba04-76d86d327994']::uuid[], '2f87d5a3-bb27-575d-ae31-ebbf2a3f1e92'::uuid),
  ('donde-estara', 3, 9, array['94387422-44aa-576a-af9e-d90619839e0d', 'acfb7509-ec6d-581b-aaf4-ed991e4dc3ac']::uuid[], '668d6658-30ff-5b66-b412-8b2fab31bf5b'::uuid),
  ('quien-sera', 5, 13, array['d0b0fd5f-9cd0-52c6-9250-0190dfc92422', '155bb9e3-c783-5626-9706-2351a1b75fb8', '8a3922df-febc-5be0-a2ee-a9ef9c2cfa41']::uuid[], 'fb05c55f-418f-5690-b1c1-3d085fe60550'::uuid),
  ('me-siento-mal', 3, 9, array['58eca0c8-7b4e-568e-b464-0e19ebf4d1bc', '783cba0f-9315-53f8-9c0e-8053d5c9fac3']::uuid[], 'bd0429e7-85d7-5705-a87a-016d703a6bcb'::uuid),
  ('como-se-siente', 4, 11, array['d5938202-d067-5818-a6c8-225eb35e6b25', 'c19db573-26b1-507e-bd7d-0cfd0666f7ca']::uuid[], '7da4f96f-0297-5405-8b84-919117c635c7'::uuid),
  ('practica-a-lo-mejor', null, null, '{}'::uuid[], '14f930f7-6890-59c8-be5d-945d641e4670'::uuid),
  ('sos-un-genio', 4, 10, array['469eab4a-9651-5815-96af-c9dfcf5adae2', '069d96dd-0caa-5229-8381-f276d52df1d3']::uuid[], '9982be58-f349-5653-90c3-98632168905e'::uuid),
  ('te-debo-una', 2, 6, array['85cc3a49-770a-516e-b2cd-e8bad4ee28cd', '903b06cd-61f3-5663-89f2-ba5b50fd069f']::uuid[], '035ceba6-9a05-5fa1-a0cf-147aa003142f'::uuid),
  ('quien-ceba', 3, 7, array['98afe63b-0bd8-5a39-84ab-f528f096c6d3', '61f71896-ddcc-5218-a493-de9dfbd616c4']::uuid[], 'b20a789d-73b7-55e4-9617-f0cc75d8f635'::uuid),
  ('te-convido-un-mate', 6, 17, array['2c974126-d2bb-5a30-adaf-8cf8cc065b05', '2d9f218d-aa38-5c56-b05c-056efc18fdc8', '5684c34f-0599-5267-8cae-66e6c16ea472']::uuid[], 'afa69fb3-dcfa-53f3-96d7-7f16097b47c9'::uuid),
  ('quiero-que-vengas', 4, 10, array['59c2026a-6682-509f-aea3-fb79d34ce114', 'b5279353-a84f-5c2a-9330-7a11b7148dc1']::uuid[], '4018a878-5da1-5e8f-b9fb-2a042195636e'::uuid),
  ('necesito-que-me-ayudes', 4, 11, array['9c6aa06f-544e-542c-b0e7-5c5081672461', '2e67ce94-167e-5556-9c92-fd90026828ee']::uuid[], '9a78aa67-9317-5a82-a5a6-574586ba740d'::uuid),
  ('que-te-vaya-bien', 2, 6, array['25213c2c-a2f2-5b13-a083-9ab91a27cd95', '15a68a44-6972-50a3-9341-4ba7abe56d41']::uuid[], 'ec8ed693-396c-5c08-9882-e2c50bed4e09'::uuid),
  ('que-te-mejores', 4, 10, array['4e98762d-9d7a-56fe-b4c1-b5cb8b608139', 'b326c68c-e938-5f12-9846-a63a43e0de39']::uuid[], 'f8f902b9-92de-5693-8dd8-0627f2fd9d04'::uuid),
  ('cuando-llegues', 4, 11, array['b1fc9cc5-8b7f-5f4e-b8c9-ecc2d67d1824', '23b9bed4-1b06-573d-b256-190ccbde3316']::uuid[], '2baf978a-e299-5e6f-b32e-ef50f9b38630'::uuid),
  ('cuando-vuelvas', 4, 11, array['5eb49908-f028-5531-a2d5-f0750ce1d62e', 'cf2f9ea8-55e8-54c7-89d3-3f4fc6e1241c']::uuid[], '3f7fcd52-79bb-560e-8751-323e526c4181'::uuid),
  ('practica-cuando-vuelvas', null, null, '{}'::uuid[], '18053c60-2ecf-52b1-b87a-6f0d9d0ec6db'::uuid),
  ('no-creo', 3, 9, array['702e8d66-2015-59be-8413-4e229cf8adfd', '9d8ef3b2-cf54-58ed-804c-a0f9154f317c']::uuid[], '2dbc2316-5a2a-5c40-9840-059f4d5f751e'::uuid),
  ('puede-ser-que', 4, 10, array['aff3ae2a-4844-54c4-8c46-6e5ce57d115f', '1151c376-cfd2-5fec-b2b9-47d708395b67']::uuid[], '743b0a6e-640d-5952-a080-4ba5219acdce'::uuid),
  ('no-te-preocupes', 2, 5, array['96d9390b-3b98-51f3-b090-bac4d160f764', 'fb537a3e-95c7-5ccd-997d-4c42682cc769']::uuid[], '70902f53-c469-5d33-8531-6bbd8569b15b'::uuid),
  ('no-seas-asi', 4, 10, array['ad77a442-c7d9-5d50-89d5-c237745f063b', '4f6f08fd-6b50-50b9-b379-3c4c0f382c42']::uuid[], '5e8c16ee-d465-5e78-9e3c-4b342f88b02e'::uuid),
  ('te-recomiendo', 3, 8, array['9cf88151-12c1-505d-bd25-f47fd0ae7462', '1aefc57e-fba0-59cc-be57-cc55614c3c67']::uuid[], '0f9ae2e9-08f4-5e37-888b-2ca0e29fc50b'::uuid),
  ('te-aconsejo', 4, 12, array['41bce274-c6fc-5ee5-9e36-b4e536ba9379', 'c815a8b9-3771-5b12-b545-16730b8e4bb2', 'f027a177-2136-5c49-b26e-a1c0a33105a9']::uuid[], 'c2dbf852-7e1c-5bad-8529-084d57880ea8'::uuid),
  ('practica-te-aconsejo', null, null, '{}'::uuid[], '2c667d6c-9aad-5299-8a4b-36858763def1'::uuid),
  ('que-bueno', 4, 10, array['78f53afd-2977-56dd-ad94-106f17c79114', '2bd7dc93-c732-5b0c-98f6-723af4312fb6', '90cf3099-681e-58bc-a53a-dae307302888']::uuid[], '0e954418-8c2b-58d9-98f7-cdb9ef6a87e9'::uuid),
  ('me-preocupa', 3, 8, array['25479b42-aff0-585c-8774-d1467a9c6419', '85a3d3b2-04dc-5d6a-9012-175312dac5cf']::uuid[], 'aeeb77f0-26ad-5a76-a5d2-28a2459d0a70'::uuid),
  ('no-se', 2, 4, array['42ce589d-9beb-5d63-9d44-623de526a1f6', '18b52adf-1cbd-5f21-97b6-d9cfb7535df3']::uuid[], '0f0f62d6-7ff3-5b7f-9a97-d179914f59f7'::uuid),
  ('que-significa', 3, 9, array['d2d04cb6-c300-5dde-b630-33d992d9e8f2', 'e949294d-665b-5c72-aa7c-a201be9717a3']::uuid[], '5da736cb-1194-5f2f-aabe-c781f37116c9'::uuid),
  ('lunfardo', 3, 9, array['12ea1eff-1fa8-5a35-9762-a2edb4bd2ac4', 'a9c234f2-31eb-5213-94b1-e0cf4dabad1d']::uuid[], 'c0ffeadc-7263-59aa-82a9-684d4ec360f5'::uuid),
  ('es-un-afano', 4, 12, array['f08f0153-6e7d-58de-867c-957b529d5719', '284de6e8-2844-58e4-8d5c-af7786ba3453']::uuid[], '5bb2d819-0d8c-5b30-babf-ef5d81ae1e5a'::uuid),
  ('practica-es-un-afano', null, null, '{}'::uuid[], '86858922-19f5-5784-9a0c-69b372847255'::uuid),
  ('saludos-a-tu-vieja', 3, 8, array['ce38578e-db79-575a-b0d9-7d71edc0cac2', 'cf3e9671-7f4a-5ef8-b4e3-94542e99da1b']::uuid[], 'af246a6e-85b6-52a2-b36d-02f13427fc80'::uuid),
  ('cuidate', 2, 5, array['e3ec4375-1b54-5d1f-8b4e-287c7be24ec1', 'cca51820-5383-5b53-a093-683d5207a532']::uuid[], 'f6dff497-638c-53f2-b960-41ed6e159af3'::uuid),
  ('yo-que-vos', 3, 9, array['6fb4ca65-18ea-54e8-88ff-13b59df5995b', 'd8a839c7-7ca4-5c93-a969-ed7ed0f8ef18']::uuid[], '4447bf53-94eb-5adb-93b4-506bb19ecbf2'::uuid),
  ('yo-en-tu-lugar', 4, 10, array['cd435f66-c5db-54e0-8c4d-ac6d2d9ae6b1', 'a5961322-146b-5334-9f3b-cd9e0ffe595e']::uuid[], '405627f5-dad7-5abc-a357-819a893c52c8'::uuid),
  ('si-tuviera', 3, 8, array['b489aeb8-aa81-5800-b5fc-061e414a9d59', '0d08036a-09eb-5935-88ed-08b25eaa3761']::uuid[], '3e39420c-d2a2-512f-bbdd-f61c647f79e9'::uuid),
  ('si-ganara', 5, 14, array['5a9e15e4-0e80-5b29-979c-42393f817bcd', '56f51e36-b39d-5b5d-a487-74cfecf837b2']::uuid[], 'cd863f2b-f8aa-5f5f-9750-0104214aae79'::uuid),
  ('me-gustaria', 2, 5, array['61f2c61c-48bc-5133-b33d-4f52115cb3f8', 'a22312f0-a0c6-5990-9465-10c50aaa6077']::uuid[], 'f232942c-faeb-57fc-b338-df90da0d38ab'::uuid),
  ('preferiria', 3, 9, array['1efb56e9-5568-5948-9221-5200776df85d', '9e6988bc-a6d7-5c98-8d5e-dfa24214a263']::uuid[], '2dba52c3-eac9-59bd-965c-73281a9a818c'::uuid),
  ('usted', 3, 7, array['85599869-b867-5483-8e73-9daa80820268', '6f132171-1837-5b25-bc88-bbeaf81d0c43']::uuid[], '14e3ce04-1aa9-57ee-9113-2fe786c69a28'::uuid),
  ('como-no-dona-rosa', 6, 16, array['2530cacd-83ff-508c-80e6-e628edcbe0d3', '80a2ed7e-fdaa-5b6f-ab80-aee2ca55092f']::uuid[], 'c09969a0-e806-5650-ba6c-2f4e7e2f5d18'::uuid),
  ('practica-si-ganara', null, null, '{}'::uuid[], 'dad83e56-fe6f-5171-895e-20643a803f10'::uuid),
  ('manejar-en-baires', 3, 8, array['c0342244-9952-566a-b8b1-a90b1f96468c', '9fa6fae7-9921-5ea7-9ea4-76d4083f6f59']::uuid[], '03b03c90-88d3-50f2-8a3b-26f3ec9f6583'::uuid),
  ('la-ruta', 6, 17, array['a03dacbc-a1d3-5579-af0f-2364947bd8c3', '81f717f2-48ac-5462-a5c4-a853071ed12e']::uuid[], '1d028588-6e65-545e-adb3-e1f4cd7a2c0e'::uuid),
  ('en-cuotas', 2, 4, array['e615660a-e7d3-531a-9ab5-97c673c7472e', '593869f9-a76a-5f6a-8c28-e9d12f5fb254']::uuid[], '16e8b390-53cb-55a1-8796-2ad129ac7f23'::uuid),
  ('a-medias', 4, 10, array['99248567-d458-5b12-8181-4fb335af255b', '17c0ce9f-a93a-58ce-878c-1830b5005ddb']::uuid[], 'e13b5c10-f0f3-58d4-8eb3-f637fb98ac19'::uuid),
  ('dicen-que', 2, 5, array['a3b7428b-7202-5c37-9f6a-5ea99a79972d', 'cbabc31e-ebce-5819-b82e-c8bebcb3ea6d']::uuid[], '0ea36390-326d-5973-8a57-04b090f6dea0'::uuid),
  ('me-contaron', 5, 15, array['37ebcdb2-cb69-5227-b68b-623077fc5cef', 'ab7c200f-8a85-5063-80e7-d8ed09932c4a']::uuid[], 'fe6f1dd3-3955-51d7-b3c8-a4fd0d400f4b'::uuid),
  ('practica-a-medias', null, null, '{}'::uuid[], '2fcf05ae-0e3a-5cf3-a733-e4ed798f42de'::uuid),
  ('buena-onda', 2, 6, array['d9e48f2f-0cf2-51ce-9997-cd500a4ebc6f', '323b2a8c-9b35-5c2d-9cd2-ead9304f2f3f']::uuid[], '63e1777d-ee1d-5603-ba68-940a78581f6f'::uuid),
  ('es-medio-vago', 8, 22, array['0d513c38-d634-587f-86c4-65148fe4e6b9', '81d83ce3-9375-5a14-997e-8f6ef734923b']::uuid[], '23535316-d511-5f10-8cfd-88b2bdcb25d2'::uuid),
  ('donde-queda', 2, 6, array['4e28aa94-834a-5d13-b7d2-6766562d5a23', 'b9b49595-998c-5d30-b1b7-e12d884ee969']::uuid[], 'da6cf969-edf2-5061-9457-4053edaa5028'::uuid),
  ('zona-norte', 3, 9, array['9d31f29c-b1e2-5be3-80cc-2d67a92cbfc6', 'bfa5db1b-5bbf-5081-ba7f-92ba281bd688']::uuid[], '734703e4-e771-5d7f-a24e-4e8093a693fe'::uuid),
  ('me-pregunto', 2, 6, array['e8efd496-4fa2-5101-a55e-5b72c39ba866', '833b765a-7238-5b48-8dbd-1d6b78ce235a']::uuid[], 'd54aa2dc-aa2e-5804-8543-3d06de8e979c'::uuid),
  ('me-dijo-que', 4, 10, array['2aa12d22-5cd1-51e3-a63b-7e066e963593', '92a3c8ba-57e1-5d8d-9ca5-5dce86b1932c']::uuid[], '034a9130-0b2e-5b99-8168-a0c18c46920f'::uuid),
  ('practica-me-dijo', null, null, '{}'::uuid[], '745e2a22-e410-508f-8489-36ec24124d48'::uuid),
  ('ponele', 3, 9, array['90877745-874a-59d7-9956-efe7a2515c03', 'd3838481-f020-5029-b422-27f9d48ab81c']::uuid[], '1d549e86-d03a-519d-9331-cf8e7579a918'::uuid),
  ('por-las-dudas', 2, 5, array['8e7bb1f4-57ad-5114-a4e4-2f7279367edd', '299d53f5-7840-5fbe-ab4f-5c048188614f']::uuid[], 'ae228017-77ac-5655-8e9a-c2968257fc43'::uuid),
  ('se-me-cayo', 3, 7, array['0a9cb4d8-72ff-5520-8aba-a841b49910b9', 'de6f524e-ffa2-5141-8759-419e85f7db87']::uuid[], '1e885f49-aa09-5097-8407-c949eaee9d89'::uuid),
  ('se-me-quemo', 5, 13, array['fd375091-b8cf-525d-a840-bcc67744f94d', 'f272c63d-697b-5b62-aa19-2b3895ed7e0f']::uuid[], '3d4e91b0-029a-5bdb-97af-0bbf6189961d'::uuid),
  ('para-que', 2, 5, array['f42f624f-1c57-5333-bb3c-f976c5b20f99', '68ea3cbe-249f-53f0-8f24-c79b54dad2ba']::uuid[], 'd1319eb8-4863-57f3-9256-64b9136de860'::uuid),
  ('para-que-entres', 6, 16, array['4e2f049d-cee5-5657-9b5e-c5af7f8b1267', 'a85a54d5-8cd3-565c-b68b-7111184cc4c7', 'a09e39f7-3f2b-589e-ab83-588225ddfe0c', '619cb298-1bf7-5ce9-bfd1-c65bc35c593a']::uuid[], 'fd458c40-891e-5adb-9835-e72c0be12325'::uuid),
  ('ya-habia', 4, 10, array['54f13c06-b591-5d1d-aa7c-547bcd7df597', 'f0eb0d66-92fb-5479-a759-ddd6e30f893f']::uuid[], '7b9b94f8-ac02-59e3-aeb0-5f2761d9d76b'::uuid),
  ('nunca-habia', 4, 11, array['0734e742-a5a1-519c-bbcf-76072b5d1b0f', '1f482753-4946-51c9-ad35-5198bc5de005']::uuid[], '879a4e02-105b-5aeb-b631-19e3d00c8a72'::uuid),
  ('practica-nunca-habia', null, null, '{}'::uuid[], 'd927c282-29f5-51b6-98b3-6fb34d65c6d1'::uuid),
  ('no-anda', 3, 7, array['ae5ba816-1b0c-57f2-a76c-766e2c344d5e', '393d71c3-637d-5a81-acd8-e0833b614985']::uuid[], 'b7413ccf-9b74-55d5-b332-24356943cf95'::uuid),
  ('el-tecnico', 6, 17, array['7641bbd1-3daa-5422-b966-4a0d17d9b500', 'f8dcf6cb-f7b9-50e5-8bd2-0caf80a74379', '22107051-07e2-5c1c-9bb1-4b73a3587029']::uuid[], '8bcb615e-f5f2-5eac-8863-49c20aa2b51c'::uuid),
  ('el-consorcio', 2, 4, array['c9707d09-b19d-5f2a-a860-d04c80ae4b56', '1509a2da-0f39-55f4-96b4-b30cdcabab6e']::uuid[], 'fd06765f-2b54-53cf-97ef-3d4a3d297ca9'::uuid),
  ('se-tapo-la-pileta', 4, 12, array['4e8881b7-18c1-5ba9-a93a-37b5d7de661d', 'a96d7d67-c696-5f6e-ab03-4d1e6a44e0a5']::uuid[], 'f754af37-5f72-59f8-9b2e-64b7299e0cba'::uuid),
  ('de-acuerdo', 2, 5, array['b9469210-85f7-5420-8fa0-e738d3ad4a41', 'db9fb8d6-b38b-5572-8521-70b1919b163e']::uuid[], 'a1b3a9ad-7d8f-5345-92d3-5bd8e45f5695'::uuid),
  ('tenes-razon', 5, 15, array['3d1fcb08-a0c6-54c5-9ed3-b70779d7ca71', '5ac40196-3b6d-5fd4-9d05-41ee8610876d', '56a8697e-9eae-53c4-bcec-acc864c853f5']::uuid[], '2c39aea3-add4-50ba-a224-7ada1f83fe2c'::uuid),
  ('practica-tenes-razon', null, null, '{}'::uuid[], '27b5c81c-22fa-5434-a4a0-4763ea4a551f'::uuid),
  ('el-cajero', 2, 4, array['07dd3bbe-f011-5b25-bdbb-975c1a70511d', 'eab0bb18-6e48-507b-ab32-2bdc49444412']::uuid[], '5f1febeb-b69b-5a16-89c0-154fb9544769'::uuid),
  ('pasame-el-alias', 3, 9, array['dbf0ff9b-3b25-5c17-b2d2-6568411c8431', '9b99b8b5-9b79-53e3-a919-e65fd0c40599']::uuid[], '080f18e0-fb84-5cdd-905e-8d86995abf0b'::uuid),
  ('que-susto', 4, 12, array['92c73b4c-db7b-5ca5-b871-f6b2bb258609', '7d1eaa14-7ff5-5e95-b662-265a304a6a66']::uuid[], 'd3c7a66d-7ed6-547c-a90a-2d3b87b568d7'::uuid),
  ('me-dan-asco', 8, 22, array['c5ee29ad-bd81-5874-ad0d-8c6223c0fad0', 'bfd953e0-f55e-5027-9136-8255d72ebf28', '6aa5fa5f-a7cb-5fab-84a9-a4708f1b59dc', '1294de5b-935d-5330-90ba-3180cb903cdb']::uuid[], '5145cc1e-3db3-5f3e-9b18-e05936c61963'::uuid),
  ('costumbres', 3, 8, array['556d045c-323c-5f91-bb65-4f251d8f6ef2', '0eecaf91-e1ea-5859-81ca-7d9a6474364b']::uuid[], 'f377857a-8b38-5d24-8cc7-0c0bff2af7d5'::uuid),
  ('se-aplaude-al-asador', 5, 14, array['668b20ae-2f2b-5676-a799-865e3e3c6136', '19177349-05dd-5789-9114-85b96b60f5b4']::uuid[], 'e53295a5-821c-5dd1-960c-b0f36d5bd32f'::uuid),
  ('acabo-de', 3, 7, array['a67ed1d3-b2a2-5220-ac3b-b457e4a5687a', 'b3c48772-28fa-5ced-a48d-b3b2ff062abe']::uuid[], 'aa21c244-a8ff-54e5-a458-fab4723216c3'::uuid),
  ('deje-de-fumar', 6, 17, array['74f03613-2afb-5971-9e79-d7b78d1f6cc0', '4781204d-9932-5756-bd83-5fb04fcea6a7']::uuid[], '59ddd645-25cb-5810-96ba-d67f3928dd1a'::uuid),
  ('practica-un-aplauso', null, null, '{}'::uuid[], 'd4c456bc-af4d-5e0d-87e7-17bd4b48f8ae'::uuid),
  ('no-sabes-lo-que-me-contaron', 5, 13, array['7aab10fb-f23c-5bd5-b136-f7452d1dc81d', 'a831245a-83af-5525-aea6-4282ab9af9ab', '22cea18f-2fd2-5049-9467-9e1157460093']::uuid[], '057f2528-37b9-5acc-841b-a1366d65bf2e'::uuid),
  ('viste-lo-que-paso', 2, 5, array['291643db-030b-5c55-9a76-6c6a283de90c', '66d63655-5bde-5b78-91d3-09e18267ca27']::uuid[], '73e7f82c-ab96-5ed7-a94a-c81031036038'::uuid),
  ('queria-que-vinieras', 3, 8, array['9fa03886-8935-5e1c-a654-19e3bfc0685f', '225c5501-5309-5a5a-9ac6-d693627e6290']::uuid[], '947ec37b-9bc9-5afe-b994-c4fd52390791'::uuid),
  ('mis-viejos-querian', 5, 15, array['acfb8b81-0cd6-5c6a-b0f6-88d8fbe7c96e', 'ecb58986-e1b6-5878-961c-1a348e643a01']::uuid[], '001eca1e-c99c-54ea-8450-e013a0265461'::uuid),
  ('aunque-llueva', 3, 8, array['ed58f518-c7e8-5e3f-a76b-d2cd23290a50', 'cfcb0667-877a-5f5a-8348-42e7007a7947']::uuid[], '85cdd211-8262-5028-ab5f-e0d482c01756'::uuid),
  ('aunque-no-tenga-ganas', 5, 13, array['34d88033-d01f-5dcf-a5a7-2afc9a735ca2', '627c82a6-5cf7-5c0d-83d2-654067fc5196']::uuid[], 'a43953ff-8e15-5c3d-8e7a-3916aa2b47c2'::uuid),
  ('llevo-dos-anos', 4, 10, array['128a5d7f-2b1b-51ba-81ed-4b16ddd8c569', '95fb1b24-b04c-5760-82fd-652d8248cbc8']::uuid[], '1f917883-798f-53ce-9312-f9ee2bf2121d'::uuid),
  ('llevo-un-ano-aprendiendo', 5, 15, array['6d10e6a4-7df6-5894-9222-d65338e46852', '1766df03-67f8-5fe6-958e-fa53cc14b6cf']::uuid[], '4bcfcb85-dc49-584d-96bc-408ffde3810f'::uuid),
  ('practica-aunque-sea', null, null, '{}'::uuid[], '6c170a10-3f77-550b-a558-03e9916aced4'::uuid),
  ('como-si-nada', 4, 11, array['75adec83-0ede-508b-ba6b-648ec1472723', '11e0f4e8-beea-5606-98eb-f8ed6f588c96']::uuid[], 'eb1b738d-eabd-5b37-a0be-78e92fd1d824'::uuid),
  ('no-te-hagas-el-gil', 5, 15, array['4104b807-6e72-5409-a1bf-80c2cc9c6379', 'b5415a24-a320-5554-a6b9-dc5237e582fc']::uuid[], 'ee2e9111-0349-5ede-be40-d7fff2e2e7b2'::uuid),
  ('el-que-quieras', 3, 8, array['f50f87b4-4e93-5dc7-bda9-b63f8ef6eff4', '6dd0f673-6d08-5b88-94af-772064a77648']::uuid[], '3cac0bc9-f997-5876-a9ae-f235af6bce13'::uuid),
  ('el-de-la-vidriera', 5, 15, array['ecea8f84-b255-5abe-988b-d6c5cc636092', 'a052cb50-9d7d-5aed-b96e-97ddacc18dbc']::uuid[], '4403a6c9-e547-5a39-b7dd-524f9c882902'::uuid),
  ('practica-a-la-mesa', null, null, '{}'::uuid[], '3292d4ca-aa2e-579a-92a0-a217ac1e9f14'::uuid),
  ('si-hubiera-sabido', 3, 7, array['43927ab3-c502-511a-b502-f51678fd5136', 'd17f15d0-3324-5315-ae1c-e1a32f8c8d14']::uuid[], '2c0c2ed2-0ff1-5707-95bc-793183571414'::uuid),
  ('si-hubieramos-salido', 4, 11, array['f7a017c8-6304-5ece-b029-885c58430f50', '17630b0d-4fbd-53a2-9036-4573e361c697']::uuid[], 'f8772d08-855b-5e01-8803-37a5fa936cbe'::uuid),
  ('por-un-lado', 3, 7, array['35bc4cc9-bc02-58bb-b570-c84bb9f49c7d', 'd32ef89f-80b9-5b13-b13f-9c343cc9d665']::uuid[], 'eda956cb-deaf-5d2d-8d26-cef9e8821f85'::uuid),
  ('la-ventaja-es-que', 4, 11, array['2cba39f0-795d-5dd3-ae10-50dce6d440a1', 'babbc01a-d24e-5d50-b389-cccdd717a973']::uuid[], 'd2f12461-7726-55c0-a944-c6862f843063'::uuid),
  ('el-tramite', 4, 10, array['b7157f37-bbe0-5435-b51c-6771f6fab119', '51d66a62-d19b-54ee-aa61-d7cd18f1df84']::uuid[], '4e4ba967-316c-5633-888e-f946980c7a65'::uuid),
  ('migraciones', 6, 18, array['e7dd2c63-3d02-5038-8770-d48e735e3009', '83b4d055-4134-579b-a89a-138dec658971', '81cdda94-6510-55cd-bb05-e326d8200d0a']::uuid[], 'eacbb9e6-67c8-5e0d-a586-d0644569c747'::uuid),
  ('practica-migraciones', null, null, '{}'::uuid[], '362e3e9e-6696-57a1-989a-a43a8ed915c1'::uuid),
  ('te-doy-la-razon', 5, 14, array['2f92bf03-d341-502d-8a63-e88a5df23003', 'ed992da4-6d4e-5cfa-8e42-00a846d672de']::uuid[], '279c1fc2-6bd6-5c04-bfc0-8b3e1535bfec'::uuid),
  ('que-opinas', 2, 5, array['4fb5c11f-e972-5395-b746-029432f47557', '99ff7cd0-9ed0-590f-b3ec-c628e671c886']::uuid[], '29592365-0610-5b10-a6de-8498dff6f9c9'::uuid),
  ('un-depto-que-tenga', 4, 10, array['b18c2e0a-21f1-504b-bd82-814a66ae355d', '7832cc1d-1ac5-5ef3-91ad-ca1e233c443f']::uuid[], 'bb1f4e7f-285f-5416-af46-80c2325bb684'::uuid),
  ('conoces-a-alguien-que', 5, 13, array['be718e24-040d-558d-8be4-c81b41d7a82d', 'f26eb51a-f0b3-5f81-8c25-ef99389fcb11']::uuid[], '314f6bd2-b3bf-5bf4-af02-9ef8e3158391'::uuid),
  ('me-da-bronca', 2, 4, array['f1c71856-66e6-5ca2-ab5e-4e7be8aa9580', '416eb06d-73f9-5a43-b8f0-6778988d1aa0']::uuid[], 'b11008af-3115-5687-85d7-38c29cb97fe4'::uuid),
  ('me-pone-nervioso-que', 5, 14, array['4f7a1836-753c-5ab1-8b65-5df458fd55c6', 'cf46575a-1a1d-5ccc-8be4-f05a671ae2c8']::uuid[], 'ec286fa5-b80d-5556-90d4-7712fddc4b55'::uuid),
  ('deberias', 3, 7, array['958ceadc-2eed-57fc-b7ed-c6cd8db914b7', 'e29654ac-ff4a-5405-bb26-79093f3a8703']::uuid[], 'e0a9e765-77b3-5b8c-8fab-bc722c941c38'::uuid),
  ('deberias-tomarte-unos-dias', 6, 18, array['01f146ac-3393-563b-9945-1b7834d4cc73', '1a5f42bb-1104-52f8-a4c4-482688a7ebec']::uuid[], '75af2473-9ac6-5df9-9061-93d2437151c0'::uuid),
  ('practica-alguien-que-sepa', null, null, '{}'::uuid[], 'af688255-36e6-5d73-9ab6-081b6996fdd3'::uuid),
  ('dijo-que-vendria', 4, 10, array['b9deaa2b-7095-532e-8227-72c299128ba5', '3c87fe85-5c68-54e2-b077-292d264a18a2', 'e0a8e2f2-77d3-5e87-b7cd-a183b3dde023']::uuid[], '3944dd4c-c2f8-59fb-917b-03c3bea221eb'::uuid),
  ('dijo-que-pasaria', 5, 14, array['af35b3aa-d8ae-5f46-865f-cd95f0264935', '97c84434-3e15-5319-9a3c-f0d1dfc3c5a6', 'e5730283-d753-552e-8b4f-7cdca109025d']::uuid[], '425256cc-2e26-5890-998c-121b1fe47c86'::uuid),
  ('a-menos-que', 2, 5, array['05680da5-9bc4-5fc5-b624-dfd6a36e9c53', '9f3b4884-27d8-5c2f-8d36-5bb8bd3c71f1']::uuid[], '2b0306c8-2345-5be3-a169-4858d4a7d20d'::uuid),
  ('con-tal-de-que', 5, 14, array['0ef0661f-48b3-5cc0-8b3d-7307300fbf35', 'b26ebc38-1411-5891-b9c8-b4518bf7f438']::uuid[], 'd25b3a9e-d734-55c3-877d-eb124ecd02f9'::uuid),
  ('se-alquila', 3, 7, array['1d6902cd-4235-52fd-a600-9774900a421c', 'dcf35321-dd73-5d9b-aa5c-8eadbb7faeaa']::uuid[], '32481a6b-f1b3-5c50-a53e-71f51e7267a6'::uuid),
  ('se-aceptan-tarjetas', 5, 15, array['77649b53-503b-5d5c-a266-b64a4e33a38f', '1c9d7e6c-8adc-5875-b4ff-6a9a95f70dbb']::uuid[], 'a8d0303c-e564-509c-b0d3-253d00ca09ad'::uuid),
  ('practica-se-aceptan-tarjetas', null, null, '{}'::uuid[], '6714e94a-0e8c-5e5c-9363-2e56871de2c8'::uuid),
  ('todo-aumenta', 4, 10, array['d6c61301-a3f4-5b13-bc38-f0fd6db4a8cd', '75294831-9615-522d-9a75-369996a6a0a0']::uuid[], 'e622038d-483a-5555-80da-881c9c6f34b5'::uuid),
  ('no-me-alcanza', 6, 17, array['9249a2a7-5957-5353-900d-5a268531dd85', 'd3f75ebc-5d04-5095-a28e-15e519c75847']::uuid[], '08b0bcf1-d7e5-5624-b775-efccd6e4efa2'::uuid),
  ('voy-entendiendo', 2, 6, array['34672a30-2fdf-53b0-bc2e-145c450ead15', '3d0b310c-155f-5710-89a0-9fca41e1459d']::uuid[], '2acb783e-9f2a-56eb-99bc-4dbb97835896'::uuid),
  ('ando-buscando', 5, 14, array['8ace3042-5edf-5262-ae47-367bcfc75ec8', 'd112ff33-e650-5fb2-abf6-ff6567f6adc4']::uuid[], '5454dfd1-7835-580e-b1fa-92b2475b9625'::uuid),
  ('practica-no-lo-aguanto', null, null, '{}'::uuid[], 'e7b6d630-e54c-5a46-a3b6-fa4a64aa0d68'::uuid),
  ('que-novedad', 4, 10, array['547e9561-aa32-544c-b805-53e95de80b13', '5e417193-2b48-53d1-9c70-5ade228209fb']::uuid[], '147a45bf-6f37-598e-9738-5fb0bddb344f'::uuid),
  ('ni-ahi', 2, 5, array['70fd7140-7f15-53f7-a677-bcc83a740fe5', '33a962e6-2602-5349-b305-0d29ed69fb09']::uuid[], '151a4a56-0b03-51c2-ae5b-f455f077cded'::uuid),
  ('ese-chabon', 3, 9, array['c96bfd74-7100-5bd4-927a-ebe670e3bfdb', 'fa32306a-26f6-5aa0-9fe0-3e8a4d1f5de1']::uuid[], 'ba53c9d9-d21d-5fa2-8bfb-dcd74df200a7'::uuid),
  ('estoy-al-horno', 5, 15, array['783627b4-8a5a-5b09-a09c-ebdaf3dc91f6', '5b397ed1-9c68-5269-bfd8-f8b0f37d49a6']::uuid[], '27ef64e7-61a7-5d97-9c01-fdb08d36c484'::uuid),
  ('puteadas', 5, 14, array['59b3b4f4-1986-50c3-9118-731a8391d946', '9e9405ef-f8f4-5576-8bd3-c81f2032c548']::uuid[], 'ba14bf19-94cc-54d5-bcec-fb3eb593bece'::uuid),
  ('me-estas-cargando', 2, 6, array['619aa1a9-2a5c-50b8-809b-2f11ae9a0500', '9fed22b5-c0f4-5180-8abc-b57b351e1183']::uuid[], '813d0c53-4622-53ee-9852-f944799d9c62'::uuid),
  ('caiste', 5, 15, array['18c86e71-bafd-525f-8ff4-d9ac5f0db0d2', 'eb0d74ae-513a-5a1b-bcb4-5aa4ff114a2d', '6ea566b8-742b-567c-8d22-31d91c679c4a']::uuid[], '71d22d11-cbe4-5498-adb0-dd6c3f38aaa7'::uuid),
  ('me-pidio-que', 4, 10, array['967c1a6e-8270-522a-a6ff-51a38e6fb67e', '5ba39675-8f1a-5716-a7a7-7182c364c7c4']::uuid[], '41e47d39-41cd-54b1-b418-bcbff6a86f8d'::uuid),
  ('me-encargo-que', 4, 12, array['442fdac2-3041-57bf-a5ff-03e8118bdcf8', 'ab1688d2-8bbe-5014-8c75-050ab445c4f0']::uuid[], '8e147f48-f18b-5914-ac16-0344c236ef74'::uuid),
  ('me-pregunto-si', 2, 6, array['878ad1bb-49fe-5c94-be37-9b07beba45d4', 'c8a908b0-e9df-57d5-8949-c1546fa6cf95']::uuid[], 'd432d0fe-37c7-5d86-913a-3fc034803e70'::uuid),
  ('fijate-si-tienen', 5, 13, array['e111221c-8ace-5606-8652-03602e95bd3c', '6969a88c-bbe8-5964-9033-1f38314f34db']::uuid[], '8600cf0a-e630-5ea9-a8fa-44e63657ae37'::uuid),
  ('practica-como-no', null, null, '{}'::uuid[], 'd309b386-de06-572b-8f72-8dc3ebebc0e4'::uuid),
  ('cualquier-cosa-avisame', 4, 11, array['00782bd2-d2a4-5995-a568-83a437e616bd', '25dd4020-9327-5371-b65d-0d07b760c452']::uuid[], 'ef8ebd68-9966-5f51-a96a-c2b6cc7fb836'::uuid),
  ('te-reenvio-el-archivo', 6, 17, array['fe6723b0-f88b-5ad7-b59f-887d20f84197', 'b420087a-e47b-5b58-abbf-ceccb778ec94']::uuid[], '068558ce-3817-599e-b756-ab7befa2dac7'::uuid),
  ('la-entrega', 3, 8, array['1e325eb7-1278-5e63-8a42-a9847250cc52', '4518ff08-7f2b-5703-abe9-c2e4eb69e493']::uuid[], '3f6c4ed4-eb6b-57ec-8309-06bf0661fce5'::uuid),
  ('sobre-la-hora', 5, 15, array['ce9050b6-c729-5683-bb9d-f30cc5486b2f', '89323655-f99f-5b3a-9900-1759d3cf78f7']::uuid[], '2243acce-3feb-53c7-9dbc-d46a7f1cbf19'::uuid),
  ('merezco-un-aumento', 3, 9, array['549e61e4-acb5-557d-a067-c4d4a83c8981', '2711dc5a-6861-521b-9871-a8297c722277']::uuid[], 'faaae38d-a8b2-565f-acf5-249cb8fdd937'::uuid),
  ('se-merece-el-ascenso', 5, 14, array['b919ad38-0c83-5a0e-9371-1aaa86bb8237', '43475bc8-4aea-586e-95ac-789ef1df05ac']::uuid[], '6851238e-4746-5990-894d-d0a37c35cb32'::uuid),
  ('resulta-que', 2, 5, array['727b0db2-2509-5be3-b80b-fdb1e10c29c8', '559ba867-5282-5650-8ee2-17a3889f7ccd']::uuid[], 'b6f94702-50a2-5dee-99d8-71b941868216'::uuid),
  ('para-colmo', 4, 12, array['6374fecb-d5fa-52d3-9c57-ef79f7091d32', '19873c24-c243-50ea-9784-21db88cd6e9c']::uuid[], '0c74c24c-0a18-53cd-99a3-9ec78d644182'::uuid),
  ('se-la-cree', 2, 6, array['968cc86f-5d70-5317-b5fe-5138bd138eee', '6d6051e2-2fbb-59c4-97ef-c162907ccfdb']::uuid[], '413e69cc-b896-5ad8-b93b-1aae5a0834a6'::uuid),
  ('me-la-jugue', 6, 17, array['d3718c6f-0b26-52a7-984b-651b2fbe951c', '20384670-4a37-5177-b391-ce52cb225e2d', 'd57be10b-aac9-5c9c-8a00-01276992bd07']::uuid[], '687a9fc8-ea43-561b-a3de-3f19427d246f'::uuid),
  ('practica-me-la-jugue', null, null, '{}'::uuid[], 'c96fab45-a655-5cea-9133-461993d1f530'::uuid),
  ('cada-vez-mas', 2, 6, array['ba86e930-8cc0-5d19-a348-a6eb21b44fa3', 'b542f1a5-937f-5c56-a7e0-d51de0140239']::uuid[], 'b479284b-3c2c-5bb9-b2fb-cd6d5bb2c07b'::uuid),
  ('estas-cambiado', 7, 19, array['dfdf77d1-f01f-58b9-bb9a-4deaa52772ff', 'a5bd6ae7-c75b-59aa-a672-207c65670a9c']::uuid[], '44aba44b-5207-5c47-89a3-20f5c79d018a'::uuid),
  ('estoy-podrido', 3, 7, array['60234725-78dd-5967-af85-2e5a93254774', '516df127-78f3-561a-bb81-e4d9061e20b9']::uuid[], 'c0ee90e6-2d2a-580e-b395-2a49a4e23cac'::uuid),
  ('me-pudri', 4, 12, array['ea1292cf-3f93-58e8-a740-6c81f660b103', 'abd455a0-9963-55d3-bab9-93817cead3b2']::uuid[], '8591f698-49d8-598c-8c0b-bd83bbde44be'::uuid),
  ('practica-me-pudri', null, null, '{}'::uuid[], '9d09cbcc-eae2-54c3-b517-200dea359096'::uuid),
  ('como-te-decia', 5, 13, array['a63698aa-3df3-5fc2-85fd-9242b7e28d40', 'e031a274-288c-51d8-b72c-c29546d099d6']::uuid[], '50ccac4d-0807-58d4-9d42-4ffbe1a298ae'::uuid),
  ('te-la-hago-corta', 2, 5, array['2f135629-8ae7-5d1c-897d-4c4bd1186f1c', '1cc8d387-de73-56ac-a531-118571733c76']::uuid[], '0ceebf5e-33ac-51eb-81b6-0a53b6dde9c8'::uuid),
  ('hay-paro', 3, 7, array['00f7b6d9-ea3c-5b74-8f28-14f73423324e', 'bafd4d69-f9bd-5977-a258-38d0f7aa31e9']::uuid[], 'b572da9a-af47-5e7b-81e0-d7a39e98f6c7'::uuid),
  ('paro-docente', 7, 21, array['4e9a2912-edaa-5d02-9aa6-6252c451d7f2', 'fc7ee5b2-bed2-5999-8caf-65661969b43a']::uuid[], 'f1dffc49-cef7-57af-b2f7-0da296e2cc68'::uuid),
  ('fue-construido', 3, 9, array['5e00a170-469d-59e4-ac96-2e321e47c8a3', 'aaeca724-12cb-5c3d-aeac-1f74a9cac808']::uuid[], 'e1aaa55b-0533-5469-92bf-df4e9c1d18f9'::uuid),
  ('fue-clausurado', 6, 17, array['144bb849-1366-5bad-8867-14826571d242', 'f56459bf-7f80-5375-a4c5-2f5ecb15cfb9']::uuid[], '4ab51058-de56-576e-8092-8b0026bf39be'::uuid),
  ('las-elecciones', 4, 10, array['f37e2586-3012-5349-b46f-01310d6861a2', '30556475-60a1-5325-aca4-024072710f15']::uuid[], 'daa465cc-db0b-5914-ba9a-1eeb088241cf'::uuid),
  ('el-cuarto-oscuro', 6, 16, array['595514fb-bad9-52ab-9250-0dc91e5f3e8c', '81ac3b74-0c97-5ede-b245-530e03785d26']::uuid[], 'b4484418-91c6-5fd5-8e4b-fcac602845ac'::uuid),
  ('practica-el-cuarto-oscuro', null, null, '{}'::uuid[], '17585547-d7d3-566f-bfef-145e53ce168f'::uuid),
  ('segun-el-diario', 2, 6, array['535d66c3-c2b1-575f-b1bb-b67ffa77f214', 'c1576fbf-414e-51e9-8c97-b65a8aba4aba']::uuid[], '7f01ca7b-8bed-58fe-991e-85be5dd9c005'::uuid),
  ('aparentemente', 5, 13, array['eb68ed8d-6099-5700-8135-4d78d14fe42d', 'f10f199d-31a4-591d-aca8-e13f59c6d8b3', '8f15a878-73cf-5b75-8cee-d88405989c89']::uuid[], '70a6650b-0765-5f05-96aa-d927f94bada5'::uuid),
  ('practica-me-afanaron', null, null, '{}'::uuid[], 'bc1df86d-34be-5efc-aea2-e591a8ebaaa4'::uuid),
  ('el-tango', 2, 5, array['5655fc9f-8ee7-5e37-9275-13352a6929fe', 'df1dc037-d29b-5993-8a8e-f4c27e3bf145']::uuid[], 'a7495f8e-64f2-5c02-b7b6-0817bd8d2446'::uuid),
  ('tocas-la-guitarra', 5, 13, array['9c71fff5-d482-5620-91ea-cc12145e8a76', '38ba5970-bf2b-59ec-8788-80f3a4285d48']::uuid[], '733cd5a2-d7e1-50b6-b0b8-9e4a1679bad5'::uuid),
  ('practica-la-parrillada', null, null, '{}'::uuid[], '754f404f-4829-595f-9a9b-1acbfc5c8d6b'::uuid),
  ('lo-lindo-de-la-ciudad', 5, 13, array['c7bf04ba-e0ea-5f2b-aee0-bffdd9f264b8', 'bc0c85e9-944f-5360-99c7-d8bf0442aba9', 'f8532de1-2d67-5760-8063-92c47e0b7e22']::uuid[], 'ec78a4cb-895b-53ca-9be5-30511da18da5'::uuid),
  ('lo-bueno-de-vivir-aca', 2, 5, array['fc6706ec-88dc-588c-9b61-ed6b65bceeb3', '9ece7c20-4b00-5c7f-9940-23c6500f32ee']::uuid[], '98201724-33ea-5e3d-b53f-a6a689d35c34'::uuid),
  ('no-es-que', 2, 4, array['f7721226-582b-51e6-b7ac-a8aea27d41af', 'f52ae593-014d-5484-99e5-4fbdb2e0ce11']::uuid[], 'd238a1ff-b82f-505e-b978-2a75a7eaffa5'::uuid),
  ('no-es-que-no-me-guste', 5, 15, array['d9c8368f-efdf-5a55-b856-3e6e1cbe32ce', '7307feb8-0ad8-5208-b90b-2d5ffbce511a']::uuid[], '75c3175e-614e-5281-85da-d05d142098ff'::uuid),
  ('si-hubiera-ahorrado', 2, 5, array['158de780-d363-517a-b4b6-14d7ed79043f', '005226f6-095a-5d42-8566-f7c3cedf1133']::uuid[], 'b4774a28-2772-562d-ae58-b21c0eff1d07'::uuid),
  ('si-hubieras-estudiado', 5, 13, array['697dc947-3553-5a53-8035-d616249f5828', '5c4468bd-da10-52dc-ba5d-23489408d5f8']::uuid[], '9c0c38ad-c79f-5ebc-9e88-5a5cf5da8a7f'::uuid),
  ('tendria-que-haber', 3, 9, array['de5dc135-c482-55f1-8bf2-7f479aaa4039', '726a552e-b5ab-5166-9206-7724eb09f531']::uuid[], '23e7a551-3af9-5196-81d6-c85962c1024d'::uuid),
  ('me-hubiera-gustado', 5, 14, array['433133fe-6da9-535c-8dc5-a9f148797c64', 'e3a7ed86-5bb5-53ff-a310-2a4bd2247d9e']::uuid[], 'ca6f664d-d6ab-5d30-83f7-1e0c077374b2'::uuid),
  ('practica-me-hubiera-gustado', null, null, '{}'::uuid[], 'c1887b5c-c778-50e5-9a6f-72e652f04d93'::uuid),
  ('lo-que-pasa-es-que', 2, 5, array['02f0d2a7-64dd-5c05-9059-b71b94f77f12', '25a0b94d-34c2-52c9-9e2d-9c5a56678bce']::uuid[], 'aad59ed5-ef8e-5704-be75-2993e5423bc4'::uuid),
  ('lo-que-paso-fue-que', 4, 12, array['53d099ed-2889-524e-9244-68bf2ad2bf6a', 'd5f7d7ac-79ab-5cfc-94b9-750cf23dee0f']::uuid[], '83b5c7f1-71c5-5932-aea0-aa3710c8684f'::uuid),
  ('como-dice-el-dicho', 2, 6, array['124017e2-1dd1-5170-b9bc-87af6ccd5c47', 'fa9366c4-c0b3-552c-9aae-8cfbdf106045']::uuid[], '27741f8f-77af-54c7-914a-276cf2d58114'::uuid),
  ('cada-loco-con-su-tema', 4, 11, array['fabf6709-3000-5210-b3e0-75386f326868', '57d78235-59d0-5331-a72a-14829a212478']::uuid[], 'b2176f55-2545-5335-a151-508997505c83'::uuid),
  ('practica-cada-loco-con-su-tema', null, null, '{}'::uuid[], '595320a7-9ac0-5031-b87a-e0a0ec3a4931'::uuid),
  ('me-hizo-reir', 3, 9, array['cb244ddc-1627-5906-a0dd-684df1dd8718', '1554207d-1846-5c53-9dc2-3e7690657428']::uuid[], 'd93fec8d-7989-535d-836e-2a36db6a8b94'::uuid),
  ('me-mori-de-risa', 5, 15, array['955c16c7-402c-51a3-865e-a7d95c3bcbe5', 'd94b1a62-7619-55d8-8355-a6f86c1689df']::uuid[], '757d5d0d-64b6-5c32-a9f5-70fc1c063aa4'::uuid),
  ('cuanto-mas', 2, 4, array['b760dd06-6075-5b05-a563-e7c1b370ae16', 'c720719a-a185-5b63-82ac-a216c85b7260']::uuid[], 'f9e64179-37b8-5992-bb8e-ffffa0c365a1'::uuid),
  ('cuanto-antes-lleguemos', 4, 11, array['2fca3a10-22fc-5341-8085-18978ee09aac', '4ade5c6b-d750-567c-acea-e5542c325288']::uuid[], '4c032021-4c51-551d-b520-323a7a9c7d3a'::uuid),
  ('practica-me-mori-de-risa', null, null, '{}'::uuid[], '4c82177f-44a0-58dc-8a84-e1a4765feab6'::uuid),
  ('sin-ofender', 3, 9, array['4ce66870-83e3-51f6-bf2d-ae2bf562084e', '04e096fa-5303-5496-a03c-bf10fd1c8e00']::uuid[], '4307d60b-cb38-5782-90b8-9896a8e13ec5'::uuid),
  ('no-te-lo-tomes-a-mal', 2, 6, array['3bfcb9cb-d1d3-5803-b3b9-82fb052d4e03', 'fa59b274-0748-5b61-968a-738c1c35d43d']::uuid[], 'ddb39ae4-7aad-5210-b667-046e55637d83'::uuid),
  ('me-cayo-la-ficha', 2, 6, array['8fab619c-537e-530b-ac37-541a500b77a1', 'd5068f13-f6e9-57ce-bc43-292971abc10e']::uuid[], 'f0e4a2f4-1187-586c-9e85-35a7b7c8713f'::uuid),
  ('me-hace-ruido', 4, 10, array['08116bfe-380c-5753-9605-a0d24da44fcd', 'cadb697e-ee79-5421-adf2-fd73164ff7a3', 'c5309507-df36-5cc3-89da-b6f4b7299222']::uuid[], '21345139-a11d-56c2-90c1-8289e2f7dc72'::uuid),
  ('practica-me-hace-ruido', null, null, '{}'::uuid[], '689390f0-1dcf-51ca-b780-be4a6e5de49f'::uuid),
  ('mis-abuelos-italianos', 3, 8, array['258c1b02-2b13-53fd-8cdb-dd6f863da54c', 'a7e53cf1-76cc-5642-bc2b-667712f35b16']::uuid[], '6712edfa-4eed-5161-8e3d-2c05c8f381d0'::uuid),
  ('se-instalaron-en-la-boca', 5, 15, array['6e3b8afa-62ca-5c03-b0df-2f3c6d447057', 'adcdeac9-3636-5ab3-8888-81e7db974100']::uuid[], 'a38045fc-f469-5d58-a2f2-2580dfbfdf1e'::uuid),
  ('practica-se-instalaron', null, null, '{}'::uuid[], 'deef5a9c-4a8c-55be-bf81-85b504bb3586'::uuid),
  ('me-emocione', 3, 7, array['36be7a88-416f-593c-b0d8-5e2dac56ed52', '55d04726-9bde-5376-9cf5-7ff6b831d3a9']::uuid[], '981876d0-66e9-5759-8326-2da855cfdd28'::uuid),
  ('se-emociono', 5, 13, array['c95fe954-1ac0-51c2-ba6d-798b5b816a21', '2ef858b1-b96a-5e6a-9542-db39568b03ff']::uuid[], '215e82a3-6270-568c-8f36-2fd033d2e9fd'::uuid),
  ('practica-se-emociono', null, null, '{}'::uuid[], 'ecd1fdb8-4fa9-5060-a42b-20cc7680383f'::uuid),
  ('gracias-por-todo', 5, 14, array['1e09780d-bda5-5bdb-8dc9-58b3a0bedfc3', '4204320a-8072-5e64-a440-8776d331d837', 'bce11c9b-ba07-53d4-a542-4cd2abbaefc0']::uuid[], '72754450-bc68-580e-b30d-69b6d6ff5df4'::uuid),
  ('ya-sos-de-aca', 2, 5, array['fabe28c8-e957-574e-8c51-e890a2f546cd', 'ec43f6dd-de70-50bf-b4b0-57e66df14d6a']::uuid[], 'bf07aa30-6e4f-59fc-91c3-4f080929d858'::uuid);

-- Lessons new to the road: done already for whoever finished their unit (below).
create temp table sync_fresh (lesson_id uuid primary key);
create temp table sync_converted (lesson_id uuid primary key);

-- Checkpoint lessons are teaching lessons, wherever they are. The published
-- ones are numbered with their unit's other lessons, below.
with converted as (
  update public.lessons
  set kind = 'lesson', title_en = regexp_replace(title_en, '^Checkpoint ', 'Lesson ')
  where kind = 'checkpoint'
  returning id
)
insert into sync_converted select id from converted;

do $$
declare
  u record;
  r record;
  keeper record;
  teach uuid[];
  added uuid[];
  nid uuid;
  have int;
  chk uuid;
  first uuid[];
  body uuid[];
  seq uuid[];
  now_ids uuid[];
  now_ordinals int[];
  last_teaching int;
  m int;
  a int;
  b int;
  i int;
  top int;
begin
  for u in
    select un.id, sp.*
    from sync_plan sp
    join public.units un on un.slug = sp.slug
    join public.sections s on s.id = un.section_id
    where un.status = 'published'
    order by s.ordinal, un.ordinal
  loop
    added := '{}';
    if u.want is not null then
      select coalesce(array_agg(id order by ordinal), '{}') into teach
      from public.lessons where unit_id = u.id and status = 'published' and kind = 'lesson';
      have := coalesce(array_length(teach, 1), 0);

      if have < u.want then
        -- A draft teaching lesson the unit already has, before a new row.
        for r in
          select id from public.lessons
          where unit_id = u.id and status = 'draft' and kind = 'lesson'
          order by ordinal limit u.want - have
        loop
          update public.lessons set status = 'published' where id = r.id;
          added := added || r.id;
        end loop;
        foreach nid in array u.new_ids loop
          exit when have + coalesce(array_length(added, 1), 0) >= u.want;
          continue when exists (select 1 from public.lessons where id = nid);
          -- Below zero until the unit is renumbered: (unit_id, ordinal) is unique.
          insert into public.lessons (id, unit_id, ordinal, title_en, kind, status)
          values (nid, u.id, -1000 - coalesce(array_length(added, 1), 0), 'Lesson', 'lesson', 'published');
          added := added || nid;
        end loop;
        if have + coalesce(array_length(added, 1), 0) < u.want then
          raise exception 'sync-lessons: unit % wants % teaching lessons and the plan has too few ids for it. Run course:sync-lessons again.', u.slug, u.want;
        end if;
        insert into sync_fresh select unnest(added) on conflict do nothing;
      elsif have > u.cap then
        -- More lessons than words: the last would teach nothing.
        update public.lessons set status = 'retired' where id = any (teach[u.cap + 1:have]);
        teach := teach[1:u.cap];
      end if;

      -- A teaching lesson left in draft would be handed words nobody sees.
      update public.lessons set status = 'retired' where unit_id = u.id and status = 'draft' and kind = 'lesson';

      teach := teach || added;
      for i in 1 .. coalesce(array_length(teach, 1), 0) loop
        update public.lessons set title_en = 'Lesson ' || i
        where id = teach[i] and title_en ~ '^(Lesson|Checkpoint)( [0-9]+)?$' and title_en <> 'Lesson ' || i;
      end loop;
    end if;

    -- The unit check: exactly one, the last on the road.
    select id into chk from public.lessons
    where unit_id = u.id and status = 'published' and kind = 'review'
    order by ordinal desc limit 1;
    if chk is null then
      select l.id into keeper from public.lessons l
      where l.unit_id = u.id and l.kind = 'review'
      order by (l.id = u.review_id) desc, (l.status = 'draft') desc, l.ordinal
      limit 1;
      if keeper.id is null then
        insert into public.lessons (id, unit_id, ordinal, title_en, kind, status)
        values (u.review_id, u.id, -900, 'Unit check', 'review', 'published');
        chk := u.review_id;
      else
        update public.lessons set status = 'published' where id = keeper.id;
        chk := keeper.id;
      end if;
      insert into sync_fresh values (chk) on conflict do nothing;
    else
      update public.lessons set status = 'retired'
      where unit_id = u.id and status = 'published' and kind = 'review' and id <> chk;
    end if;
    update public.lessons set title_en = 'Unit check' where id = chk and title_en is distinct from 'Unit check';

    -- The road order. What the unit teaches first, stories where they were and
    -- the new lessons after the last teaching one; grammar practice; practice.
    select coalesce(array_agg(id order by ordinal), '{}') into first
    from public.lessons
    where unit_id = u.id and status = 'published' and id <> all (added)
      and kind not in ('practice', 'review', 'speak', 'slang', 'culture');
    select coalesce(max(t.n), 0) into last_teaching
    from unnest(first) with ordinality as t(id, n)
    join public.lessons l on l.id = t.id and l.kind = 'lesson';
    first := first[1:last_teaching] || added || first[last_teaching + 1:coalesce(array_length(first, 1), 0)];
    select first || coalesce(array_agg(id order by (title_en = 'Grammar practice') desc, ordinal), '{}') into body
    from public.lessons where unit_id = u.id and status = 'published' and kind = 'practice';

    -- The extras, where unit-extras.mjs places them.
    m := coalesce(array_length(body, 1), 0);
    a := greatest(1, round(m / 3.0)::int);
    b := greatest(a, round(2 * m / 3.0)::int);
    seq := body[1:a]
      || (select coalesce(array_agg(id order by ordinal), '{}') from public.lessons where unit_id = u.id and status = 'published' and kind = 'slang')
      || body[a + 1:b]
      || (select coalesce(array_agg(id order by ordinal), '{}') from public.lessons where unit_id = u.id and status = 'published' and kind = 'culture')
      || body[b + 1:m]
      || (select coalesce(array_agg(id order by ordinal), '{}') from public.lessons where unit_id = u.id and status = 'published' and kind = 'speak')
      || chk;

    -- Retired and draft lessons low enough to collide go past the end.
    select greatest(31000, coalesce(max(ordinal), 0)) into top
    from public.lessons where unit_id = u.id and ordinal >= 1000;
    update public.lessons l set ordinal = top + p.n
    from (
      select id, row_number() over (order by ordinal) as n
      from public.lessons where unit_id = u.id and status <> 'published' and ordinal < 1000
    ) p
    where l.id = p.id;

    -- Already in order: leave the unit's rows untouched.
    select coalesce(array_agg(id order by ordinal), '{}'), coalesce(array_agg(ordinal::int order by ordinal), '{}')
    into now_ids, now_ordinals
    from public.lessons where unit_id = u.id and status = 'published';
    continue when now_ids = seq and now_ordinals = (select coalesce(array_agg(g), '{}') from generate_series(1, coalesce(array_length(seq, 1), 0)) g);

    -- Out of the way first: (unit_id, ordinal) is unique at every step.
    update public.lessons l set ordinal = -5000 - p.n
    from (
      select id, row_number() over (order by ordinal) as n
      from public.lessons where unit_id = u.id and status = 'published'
    ) p
    where l.id = p.id;
    for i in 1 .. array_length(seq, 1) loop
      update public.lessons set ordinal = i where id = seq[i];
    end loop;
  end loop;
end;
$$;

-- A checkpoint lesson finished below the pass score was held as not passed.
-- As a lesson, finishing it is all there is to it.
update public.lesson_progress set passed = true
where not passed and lesson_id in (select lesson_id from sync_converted);

-- A learner already past a unit keeps her place: its new lessons count as
-- done (as grammar-seed.mjs does it). Past it means she passed the check it
-- already had, or she has gone on to a later unit and left nothing of this one
-- undone — progress further down the road alone is not enough, a learner can
-- have some in a unit that was moved later (20260930000003).
insert into public.lesson_progress (user_id, lesson_id, score, attempts, passed, passed_by)
select x.user_id, n.id, null::smallint, 0::smallint, true, 'placement'
from sync_fresh f
join public.lessons n on n.id = f.lesson_id and n.status = 'published'
join public.units nu on nu.id = n.unit_id
join public.sections ns on ns.id = nu.section_id
cross join (select distinct user_id from public.lesson_progress) x
where exists (
    select 1
    from public.lesson_progress p
    join public.lessons pl on pl.id = p.lesson_id
    where p.user_id = x.user_id and p.passed
      and pl.unit_id = n.unit_id and pl.kind = 'review' and pl.status = 'published'
      and pl.id not in (select lesson_id from sync_fresh)
  )
  or (
    exists (
      select 1
      from public.lesson_progress p
      join public.lessons pl on pl.id = p.lesson_id and pl.status = 'published'
      join public.units pu on pu.id = pl.unit_id and pu.status = 'published'
      join public.sections ps on ps.id = pu.section_id
      where p.user_id = x.user_id and p.passed
        and pl.kind not in ('speak', 'slang', 'culture', 'story')
        and (ps.ordinal, pu.ordinal) > (ns.ordinal, nu.ordinal)
    )
    and not exists (
      select 1
      from public.lessons o
      where o.unit_id = n.unit_id and o.status = 'published'
        and o.kind not in ('speak', 'slang', 'culture', 'story')
        and o.id not in (select lesson_id from sync_fresh)
        and not exists (
          select 1 from public.lesson_progress p
          where p.user_id = x.user_id and p.lesson_id = o.id and p.passed
        )
    )
  )
on conflict (user_id, lesson_id) do nothing;

drop table sync_plan;
drop table sync_fresh;
drop table sync_converted;
