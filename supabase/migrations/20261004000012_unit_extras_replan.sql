-- ---------------------------------------------------------------------------
-- A unit's extra classes, re-planned (scripts/course/unit-extras.mjs wrote
-- this from the 2026-10-03 snapshot; src/lib/unit-extras.json says what they play):
--   slang    three Argentine words: none in section 1, then one unit of every two
--   culture  a culture class: about one unit in four, start to end
--   speak    a chat with Pancho about the unit: none in section 1, then every unit
--
-- Every unit named below ends up with exactly the classes planned for it, in
-- their place: slang a third of the way in, culture two thirds in, the chat
-- last, just before the unit check. A class that stays keeps its row, so what
-- a learner did on it stays hers. A class no longer planned is retired, never
-- deleted. A new one gets the id written here. Units not named are left alone.
-- Running this twice changes nothing the second time.
--
-- From the snapshot: 151 rows added, 197 retired, 211 moved, 217 already in place.
-- ---------------------------------------------------------------------------

create temp table unit_extras (
  slug text primary key,
  slang boolean not null, culture boolean not null, speak boolean not null,
  slang_id uuid not null, culture_id uuid not null, speak_id uuid not null
);
insert into unit_extras (slug, slang, culture, speak, slang_id, culture_id, speak_id) values
  ('un-cafe-por-favor', false, true, false, 'f7472904-3537-5293-83ff-00d3e335cba5'::uuid, '1ab03322-8121-5cd1-8108-dd002ed99033'::uuid, 'e4089f8a-ff03-55f3-b517-7cfabb530e9e'::uuid),
  ('otro-cafe', false, false, false, '33ce028d-1dbf-50fa-b135-8996fa0dab07'::uuid, '21eaa2b8-31e0-52fe-80e0-e97da5090bb0'::uuid, '72cac88f-46fd-5ce5-acca-096ff4dfdadf'::uuid),
  ('hola-che', false, true, false, 'ec2f4395-ff7c-5633-94ef-91d10c465ff6'::uuid, '9528258f-f4fd-5f6d-a5fe-d56a7c2cf753'::uuid, '9d7aaf0e-a76f-510a-853d-c5fc41ce5ea5'::uuid),
  ('buen-dia', false, false, false, '3c02082e-f150-5dae-a452-0137ce8528c5'::uuid, '6bc2a91d-16f1-5aff-81b2-27b1a6101bf8'::uuid, 'e15f5628-3f5b-5579-9ffe-ca2d37f03386'::uuid),
  ('vos-y-sos', false, true, false, '03cf04f3-31ea-5b8c-bacd-75ee158a7ec0'::uuid, '5eab0221-997b-5ad2-98fa-c5956d117986'::uuid, 'd01b0db5-43e3-530c-889c-34f9671993ef'::uuid),
  ('sos-turista', false, false, false, '3349a7b0-7354-5117-ba60-b66d5619e5be'::uuid, '88fd128c-8fa9-5466-9716-9439d2210dcf'::uuid, '07670b37-5d63-5969-a7b2-eabd6d67c6e0'::uuid),
  ('practica-hola', false, true, false, '9c888dba-6da9-5eba-b344-df81a8cd3b58'::uuid, '1cea0d6c-d06e-50bf-9c6b-7ac6ec39aa9b'::uuid, '04719dec-08f2-5fb0-b137-0ba44d8fddeb'::uuid),
  ('como-te-llamas', false, false, false, '06843918-b060-5e47-af0b-5727e2af0864'::uuid, '1f4dc5a2-7df1-56a2-bb37-4bf73634f844'::uuid, '38aa6e9e-174a-5982-930a-aaa02a8ff1a3'::uuid),
  ('encantado', false, false, false, '5cd5ad24-ff80-554b-b1b3-9616db921750'::uuid, '4b89c21f-0da8-5cbd-9c7b-ba90f088fecd'::uuid, '830b25af-4980-5468-9f35-1bfd59862bc2'::uuid),
  ('de-donde-sos', false, false, false, '6f4a89d9-2802-5607-8597-930794819cdf'::uuid, '531c23fe-bb78-5338-bf50-1288ea600160'::uuid, '680e04a4-feae-5eb3-b47f-39e951519692'::uuid),
  ('soy-de-zona-norte', false, true, false, 'c3d0727c-fce3-5117-a91c-3de8f5e73a6d'::uuid, 'edaff3c9-355c-5500-9cf0-19d1f1df04f9'::uuid, '08a4d905-34cf-5c3e-a0ab-123aa091a5bd'::uuid),
  ('el-y-ella', false, false, false, 'c210aea0-978e-5723-9c51-0d6036552cbc'::uuid, '70ab94c6-f531-58f7-ac92-1b3f38c667dc'::uuid, '29e817de-0ecb-54e0-bfc1-7675025dff41'::uuid),
  ('quien-es', false, false, false, 'c3e4127b-0024-50f1-8696-ba5ca87154ff'::uuid, 'a6a201b9-2a03-5744-9efb-dc0a686c856a'::uuid, '68a5e593-5bea-50fe-9a07-740938ebde57'::uuid),
  ('practica-quien-es', false, false, false, '88d23957-e449-57d1-aaaa-0768dee26e30'::uuid, '106b6efa-5874-5b94-8c34-45b63fb3066f'::uuid, '56169cdc-a9c6-5549-9710-ebdb5cd46657'::uuid),
  ('argentino-argentina', false, false, false, '6c0c8276-6109-59f2-9032-a64e8c8a2ca5'::uuid, '199e7762-f698-5698-b2ff-634439b6050f'::uuid, '8567ba21-12dc-5e29-906f-641a0f771230'::uuid),
  ('de-todos-lados', false, true, false, 'ce543955-ec3a-57ed-b91a-bec68913def3'::uuid, 'a7e0f28a-95cb-53cb-9ed5-5d79cd179ddd'::uuid, '3719d803-3967-5442-823a-169af24bd917'::uuid),
  ('la-familia', false, false, false, '81b98679-8c0f-580b-b3bd-b948cb9ed34c'::uuid, '12cc7f03-b455-51bb-96e6-7e9277fff20f'::uuid, '963c067d-ebf2-50aa-a405-5b7b115c5af6'::uuid),
  ('tios-y-primos', false, false, false, 'f5894878-db74-58d0-ad6b-976af332c777'::uuid, '48be6765-bf87-5f55-b37e-9468e6525347'::uuid, '176fdd82-d726-57e7-a30d-0ef4a0501f5a'::uuid),
  ('cuantos-anos-tenes', false, false, false, '282cc370-b098-5f50-b121-c2a3546a2a5c'::uuid, '899f5710-95a4-57f4-be71-123597a0aa51'::uuid, '2ced6bc0-8d0b-576f-b05d-55b0088ba4f0'::uuid),
  ('tengo-hambre', false, false, false, 'c7064ec6-b9fc-5e68-801c-87ef960273f8'::uuid, '5f645879-20a8-5d54-8bdc-ffef21ae7857'::uuid, '8ca7671c-545c-55ad-b5ca-d2cdf73a3d51'::uuid),
  ('practica-tengo-hambre', false, false, false, '06973be3-6570-520b-8130-042562378fd6'::uuid, '4066d0cc-6c51-5fe9-9d19-20175124bc00'::uuid, '0b3512ef-22e8-50b0-a179-50955ba1cb81'::uuid),
  ('alfajores-y-chicles', false, true, false, '61f2e4d0-8bc9-5e10-975d-07cfa2d39bf5'::uuid, '82f24575-3a4d-5162-8168-93ab64e99b8a'::uuid, 'cc22bf60-4570-589b-bb84-e0f336657c8f'::uuid),
  ('en-el-kiosco', false, false, false, '08b49b52-a818-5ad9-b1b7-33c7a0cc6acc'::uuid, 'faf820f2-1a31-5d4a-b861-5b0724d5e7b9'::uuid, 'd6bfc769-cd38-53ca-a7c0-ebcc86c14640'::uuid),
  ('cuanto-sale', false, false, false, '95363701-cf58-5766-88ee-9c794b3941e2'::uuid, 'd0cddd92-dbea-50cc-98cc-24ae5423522e'::uuid, 'b7260cca-182f-5eae-89e3-c0c1ffb8d84c'::uuid),
  ('la-gente', true, false, true, '63b0f2fd-1e86-53ba-87df-34c23102ccfc'::uuid, 'ae9f11e1-aa7f-53e0-98e3-20494109685f'::uuid, 'b92587f4-afbf-5771-a963-54273ba6000b'::uuid),
  ('altos-y-morochos', false, false, true, 'a919572f-abe5-5182-8081-421300df8fe6'::uuid, '1df098bb-f535-5918-ad60-15e513f05745'::uuid, '0c47aa11-590f-5b15-a857-3001170e68c2'::uuid),
  ('donde-esta', false, false, true, '126dfb50-e2e1-5322-9c0c-56a09821a3c1'::uuid, '1a55ef3a-6943-5362-9da8-6feb17a99420'::uuid, '2fada098-09f1-5a67-989e-fae025c43aa4'::uuid),
  ('donde-estan-las-llaves', true, false, true, '5c4166a9-8de9-5e48-aa54-ce102eadd530'::uuid, 'dd4b4580-ca1e-500d-b968-fbed3af7ae3f'::uuid, '90fbf14b-58e8-5930-97ec-30d9d5473fa2'::uuid),
  ('hay-un-kiosco', true, true, true, 'e856852b-82f2-52c0-a429-86218e0b0ca9'::uuid, 'a3370a1c-1fe4-5bd6-9dd3-49888d4fa77e'::uuid, '2ccf5f07-868a-5c85-a6d0-3874ac20ce7a'::uuid),
  ('hay-un-tren', false, true, true, 'c1b4d194-81e9-5c98-8a4a-074b4efbe507'::uuid, 'c8c1bbef-6c6c-5307-bbc0-0d0b715ea51a'::uuid, '36c6ea45-1b80-5855-b5c1-80b9fd39a29a'::uuid),
  ('practica-por-aca', false, false, true, '73dbcb18-98f6-5f58-9dc6-a3b3ca9a199a'::uuid, '862da4f6-83e9-5403-8458-21dc8e309805'::uuid, 'f09fc4c7-5cd3-5259-8490-249943a79067'::uuid),
  ('como-estas', true, false, true, '2b2f8d03-0cdf-5b5f-b4df-2cfed00abf96'::uuid, 'd70ffffc-4a52-51f4-93ee-f0aaf74c3616'::uuid, '9c3f5064-6e61-5556-8e33-fb2e322e8fd9'::uuid),
  ('esta-cerrado', true, false, true, '148c00a6-251c-5167-91e9-3acffdcc63ea'::uuid, '316a9329-4ed6-5638-8659-cc4aeda68585'::uuid, '0e4318a1-9cfe-528a-ac1b-6892bcb69fb9'::uuid),
  ('que-haces', false, false, true, '5acb84c7-f09a-5147-b6f0-9ec4d5e8ddc9'::uuid, '1b4d199d-194f-537a-b4d7-dad33aff7f63'::uuid, '11ee42e7-9659-5bdd-aae3-81963cb8ef26'::uuid),
  ('practico-castellano', false, false, true, '69be68ba-d439-516c-92ed-3eed98f00bbc'::uuid, 'c4623d76-ae3b-59d4-b4ec-a7cad379c870'::uuid, 'e3ce15f8-dbdb-55de-a969-35550d69c263'::uuid),
  ('mate-y-facturas', true, true, true, 'bbe815ab-cce3-5063-872d-eab069874006'::uuid, '7c19f9ee-ace4-56f7-91ed-a1508c703655'::uuid, 'f24fca41-3cf3-5fed-83f7-61c3248f8349'::uuid),
  ('nos-gustan-los-fideos', true, true, true, '11e572b1-0473-5e32-9f87-66f479b1f957'::uuid, '8cdddd8e-c9af-5ecf-9f62-9153c1ce49e6'::uuid, 'cf8f9434-09f3-57f9-bcba-be0749fec09f'::uuid),
  ('practica-nos-gusta', false, false, true, 'a7f3b88a-fe01-5313-9f3c-83faca0cc78c'::uuid, '8c8cf2dc-f423-57d8-a09a-5dfda16a0e33'::uuid, '04b91501-8198-5d66-aa7e-5edb8a2a54af'::uuid),
  ('me-traes-un-cafe', true, true, true, '1e2a5e41-906b-5fb9-bc1d-cc5257205bf8'::uuid, '3b663adb-8e18-5609-8ea7-0c134a2bb704'::uuid, '188720f2-c05f-535e-8436-5fa211654baf'::uuid),
  ('que-quieren-tomar', false, true, true, '964ccbb2-b906-5f82-bdc4-1a452b242ac1'::uuid, 'dd56b855-b0b4-5836-b16c-6df6c52a185d'::uuid, '35282f6b-60e7-5df6-956c-efe29ee91081'::uuid),
  ('facu-y-laburo', true, false, true, '96d34553-b98b-5e62-a6b6-833f88783486'::uuid, '8b279ca9-8802-5062-b41d-56f81b556ff8'::uuid, 'bc06be03-e3c1-5b8c-a09c-19bc51c94ee9'::uuid),
  ('es-enfermera', false, false, true, 'bd28a449-7461-54fe-b08f-cc9064ac08cf'::uuid, '56f9218f-3aac-5d2b-99d6-36a3d861430a'::uuid, '3a438f00-2cd8-5bad-bafc-7a1ce1495f88'::uuid),
  ('comes-vivis', true, true, true, '8a793d88-9aca-5510-9eed-80b3138f3954'::uuid, '755b8298-7ebd-50bd-8372-045759e8c20f'::uuid, '80fa528d-260b-5895-8d52-3b43bfcc7204'::uuid),
  ('vendo-diarios', false, true, true, '90662a2b-9c8f-5bf8-9486-dae788e716c9'::uuid, '3be09f9e-166d-58ea-a5dc-c36afa653043'::uuid, 'd8e81259-0304-5bd5-9158-828e93bf23fa'::uuid),
  ('practica-el-vecino', false, false, true, 'e61d447c-4f08-5b2a-b667-5aa9f2f074c7'::uuid, '1c80d1c2-e16c-5b97-af52-37482b6d3e5a'::uuid, '88f3c28b-89a9-5725-b1a9-4250a5b9309a'::uuid),
  ('mi-edificio', true, false, true, '71a2dac0-8b70-5f42-8d3f-ca2fe9a3a310'::uuid, '7c1a3ff9-40c0-559b-8d58-3e364950ab6e'::uuid, 'ea86756a-26af-5121-808a-8553c5871c41'::uuid),
  ('mi-casa', false, false, true, 'efb08b83-a007-5fd8-bbd9-602ad3647a24'::uuid, '07ce263c-0146-51da-8a29-4cdf5fc6f7be'::uuid, 'bd0b1d78-5ff6-55b7-a0d0-903a1786296d'::uuid),
  ('la-hora', true, true, true, '66320884-44c2-535e-81a7-dd3052d999f9'::uuid, '9c8cab93-71fd-567d-aec7-174678576390'::uuid, '3ae981a5-63f1-55dc-b8ea-286e2fd0b0d9'::uuid),
  ('a-que-hora-abre', false, false, true, '05a31c5f-e9fc-5652-b47a-e0a600744ac3'::uuid, '810b782a-71cb-5c78-8354-4398db824ca7'::uuid, 'fbbd2b99-f761-5fa9-9982-8014840ac03c'::uuid),
  ('tengo-una-reserva', false, false, true, 'a3d73411-312e-59cf-8096-5542f8e62acc'::uuid, '69f5abfd-f3bc-5e0e-8423-19daa03196d9'::uuid, 'e8813b1b-11c6-5ed4-a570-5eb9d9f1b0bb'::uuid),
  ('el-barrio', true, true, true, '252bc17b-8c72-58ce-bf3d-51aa4846be5c'::uuid, '512ee584-e8f3-582b-8413-4a6a85d2962e'::uuid, '930b8bfd-a9d2-5f16-be4c-645559a0d416'::uuid),
  ('a-la-vuelta', true, false, true, 'f54ae3ba-fbab-5ca1-b27d-d227ce5f9f1b'::uuid, 'bee50728-274e-5cc9-b6cc-fc1c2e3bff92'::uuid, '32b6fa24-b5aa-536b-abcd-5d393992f44d'::uuid),
  ('queres-podes-vas', false, false, true, '899cf689-ac4b-5ab5-af79-533d336ded43'::uuid, 'e089d394-27ce-587c-9fd6-1fd166ef80cf'::uuid, 'aa207acc-5164-575b-8644-496aea95e9a2'::uuid),
  ('preferis-salir', true, true, true, '89fe3e47-b3b0-56c3-9dbd-800d57b8232e'::uuid, 'cd8576e2-3454-57fc-a1af-fd2dc2c22fb4'::uuid, '31458c9c-a571-5b1f-901a-cff010ea63da'::uuid),
  ('practica-a-la-vuelta', false, false, true, 'bfaafaac-2ec4-5d4c-b700-5dcc225d801b'::uuid, 'cd34f069-00f3-5d79-b04e-65959947f6dc'::uuid, '65d120de-4caf-5ebd-bde5-f8328d2191e2'::uuid),
  ('dale-veni', true, false, true, '3bf387fb-669e-52af-ab7d-4038a465b335'::uuid, '6eaf5257-d30b-52a9-9b05-8b4ff08ce6cd'::uuid, '10a05b75-f308-5c42-95a3-402687736869'::uuid),
  ('segui-derecho', false, false, true, 'a583f52b-7397-574a-912a-ce9c8aa0423c'::uuid, 'cb6d050e-52dd-56c3-ad82-978564cffcbe'::uuid, 'e6fed605-2d1b-5622-beb6-15a5df1bab21'::uuid),
  ('tomar-el-bondi', true, true, true, 'eda66b1a-6d34-5e44-a100-2cd3a7cd2cc6'::uuid, 'ca5813bd-1e48-5d5d-aebe-c9ebd7c22656'::uuid, 'cd338150-48f1-5917-8318-dc531cab6ca7'::uuid),
  ('en-taxi', false, false, true, 'da56c734-52a5-5971-82ef-cc7057fc3c34'::uuid, 'e05e1462-a22a-5e8d-85ef-c27a17bca321'::uuid, '5b8006ca-9d63-599c-a804-e2cfda42fabf'::uuid),
  ('ayuda', true, true, true, '2b6b9fb2-9653-520a-8c4a-41b131be23cf'::uuid, '52a8f31f-d521-5fbb-945f-d84589a89acf'::uuid, '99226452-e706-5fad-815e-5c2aa91c36be'::uuid),
  ('ropa-y-colores', false, false, true, '9d43b86d-9589-5451-b929-4ceaa7517940'::uuid, '6cec091d-638c-5444-9374-65b3a9355b2e'::uuid, '564c6c4c-d61e-51f5-b940-abb434eb741c'::uuid),
  ('este-buzo', true, false, true, '3120b627-2f3b-5064-b52c-ab1ded3a1d10'::uuid, '5af2699d-67e2-50d2-921c-b6ef06c3476e'::uuid, 'bbed30e0-481f-5908-a920-430fe0415276'::uuid),
  ('me-cobras', false, true, true, '9d7187ea-e0d8-5e8d-a3a3-a97d3b0588ec'::uuid, 'f5d2585a-8199-54f0-8734-c562a08e369a'::uuid, 'be7eddc6-40b2-5389-9c50-dad590456cec'::uuid),
  ('debito-o-credito', true, false, true, '4d8d5801-f456-54df-8a10-b3a5d17e5c33'::uuid, '618d3641-5c76-5078-9247-b2abc19ddbb9'::uuid, '92fcb0bd-3075-5c85-80d9-884b5164972a'::uuid),
  ('practica-me-cobras', false, false, true, '6ba3f122-aa3f-5f4f-ab35-f1ef1e188fd7'::uuid, 'df51cf96-2f50-5b96-852a-20480beb95b9'::uuid, 'a542e55a-f2d1-54a7-8b4c-1864298c309b'::uuid),
  ('la-rutina', true, false, true, '07e26d12-331b-5a5a-9336-41485715b35e'::uuid, 'e31b1ff3-e8e5-5c76-92cc-81abf030f51a'::uuid, 'dd7ded1c-6698-551b-ab25-2d801da31b82'::uuid),
  ('me-despierto-temprano', false, false, true, 'bc5b5512-5465-5611-9e12-1af2cb4e4fb2'::uuid, '715717b1-0e02-5ea7-9116-e5361502e037'::uuid, 'feee292d-da79-5bb9-a15d-498e64e62584'::uuid),
  ('que-te-gusta-hacer', true, false, true, 'eec679cf-48db-5d68-ac88-b66ef15840e0'::uuid, '80e86ecb-5f9b-56a6-beea-241fc85e85ed'::uuid, '7249d7f1-e28a-5cb7-9201-5ed54880b981'::uuid),
  ('me-interesa', false, false, true, '3dbc7355-aba9-5d68-819b-3567baaa43c3'::uuid, '779490d8-3964-5a99-b9ff-cfc7b0ffe19c'::uuid, 'c233393e-e35f-5739-80e3-d7f6db6312e0'::uuid),
  ('pasame-tu-numero', true, true, true, 'ec4cfb29-fcb0-553c-9720-fd91aaf6d578'::uuid, '03f728d2-723a-5599-b85d-43303498423e'::uuid, '86620853-fcb0-5fc0-b258-3e8edbf88d8e'::uuid),
  ('clima', false, false, true, '70aac598-35ae-5baf-b27c-a636ef725c9a'::uuid, '44edc4f8-eac3-572e-8a06-e52b8a6b6cc5'::uuid, 'e4eee2f5-dd64-59d9-b2af-44bf4d89f633'::uuid),
  ('en-febrero', true, true, true, '6448d1f9-5db4-5f7b-9516-0035e7e817ab'::uuid, '7040869c-45fe-568b-84e3-a372769bced2'::uuid, '2e7556e9-ced1-59c4-a72b-c1d8123fdc80'::uuid),
  ('practica-el-clima', false, false, true, '0943810c-aab2-5cf1-b3ef-de0981c00dc6'::uuid, '1ee28d5d-c81d-5939-b228-a24a3717d56a'::uuid, '6aa4a6ed-7778-5a43-a37d-2545c169946f'::uuid),
  ('el-cumple', false, true, true, '2eb761bd-1287-5776-9efb-5da62a832c5e'::uuid, 'e69fd184-0a3a-5eb4-a940-656466531f08'::uuid, 'debadcb0-9006-5385-85a9-fc324931917a'::uuid),
  ('ahora-y-planes', true, false, true, 'bdef5ff7-a9d9-5382-ba6b-6069814c57ba'::uuid, '18d18e5b-001d-5391-ab85-c6bb30907678'::uuid, 'd8ff174e-d222-598d-8cd3-69306356543f'::uuid),
  ('ayer-labure', false, false, true, '5887f714-c6cc-5fae-a3fd-29a564adde3f'::uuid, 'cf1f5a61-9810-5a07-81fd-0c34f838657d'::uuid, '293afd64-9fc7-54c9-b330-05a9b9810b3a'::uuid),
  ('cenamos-afuera', true, false, true, '952d9438-b463-5bd9-86a6-bc53fae042a1'::uuid, 'c177eeba-eb7d-588f-a969-3bad9cc710e1'::uuid, '089056e5-059b-5ced-b6b5-1834fbc0d927'::uuid),
  ('comi-y-sali', false, true, true, '2cd50e7c-9103-559f-bdd1-cdb43d03dd9d'::uuid, 'bbcf3eaa-c30a-5994-afab-519d99389aab'::uuid, '1b2a292a-ee43-5a07-8d64-94d8dee13e87'::uuid),
  ('naci-en', true, false, true, 'f70d086f-261c-5f69-ab7e-a77c50b7f5bb'::uuid, '84ec7779-c71c-5ccc-b780-ebc5e32d8c2d'::uuid, 'c82fbb5d-476b-5511-96a3-03b4a96e4dfd'::uuid),
  ('fui-a-la-cancha', false, true, true, '3cd48198-4c08-5777-8d0f-9e670b9756e4'::uuid, '25e27394-fcd0-503e-98ce-2a10ae8e5b88'::uuid, '7bab347f-bf63-5a7c-ab08-4f17342ac5c5'::uuid),
  ('la-pasamos-barbaro', true, true, true, 'e65cab02-bf4b-550d-914d-30dbdf838a96'::uuid, '22764a55-e486-5d56-ad40-613afa56b45c'::uuid, '56e78926-b27a-5939-922b-ac557168acf2'::uuid),
  ('practica-como-estuvo', false, false, true, 'c1b55fc2-fa1f-59a6-9b61-e23c97a161d5'::uuid, '6fb3fc31-8332-5cb5-886d-36634d9dc86d'::uuid, '0a8d61b2-f3d3-556b-b3a8-075053126d9d'::uuid),
  ('el-finde', false, false, true, '6c8c424c-617e-5d96-9923-dc68eff2e589'::uuid, '050a6e99-3377-5888-9b01-414e1f730be7'::uuid, '6ca7e3fb-2a57-59d5-a42e-88b5c24bf2ad'::uuid),
  ('vinieron-todos', true, false, true, '82500c09-7e53-5c47-a2ab-7e0a8cecb138'::uuid, 'b51d1557-a28e-5569-a2d3-0ecad11f2211'::uuid, '75922465-6bf6-5522-b665-173e3469ab1e'::uuid),
  ('mas-alto-que', true, false, true, '48414719-ed42-5c60-a9ec-4955e9a17d6a'::uuid, '0db322d4-1fc7-5eab-bb9f-b8d70f78f7df'::uuid, '4802ece2-abf8-5053-b728-7fdd62f028a2'::uuid),
  ('el-mas-tranquilo', false, true, true, 'a1f2a232-d62d-55a4-8846-a3b303211f30'::uuid, 'dca25bff-5760-5503-85b4-ca761ec736a4'::uuid, 'c7dc81ac-b8dc-50b8-b1be-dd8b5dbe86e8'::uuid),
  ('me-duele', true, false, true, '6922c87e-530b-593e-ae3d-27af66b25612'::uuid, '4f019bcd-1158-54e1-a4df-98562ec29117'::uuid, 'ba144efe-173a-5234-85d3-1838ce3443fe'::uuid),
  ('me-dolio', false, false, true, '2f139e20-642e-572f-88e0-a6503179d6b6'::uuid, 'e742d517-f649-538a-abb3-a10a00835ce8'::uuid, '995ac63d-6bf6-58df-bd6e-428f170f8c38'::uuid),
  ('practica-quien-vino', true, false, true, '0239196a-a800-5807-ac62-05993d50b5c4'::uuid, '51d57f76-483f-5245-a9a0-319791e30f32'::uuid, '06dc9500-41f3-586b-befb-9816efcb11c6'::uuid),
  ('te-llamo', false, false, true, '972f5abf-ded8-558f-af15-0b88039a3026'::uuid, '106e1bd7-c5f6-5677-80a5-1d8f2f27258c'::uuid, 'ccce6c9c-2292-57f6-b18b-3261a40974dc'::uuid),
  ('te-llame', false, false, true, '6f431a60-9896-54d4-8401-216184dcd4bf'::uuid, '32958855-0029-5e9c-b6d4-acdd4d101bd3'::uuid, '8e6212a3-68d6-5323-9bdf-8d454b4db339'::uuid),
  ('las-tareas', true, true, true, 'c86ac4ac-83d0-5d81-a0d6-4e5bcf058f69'::uuid, '1e8c9ac3-c602-55e5-b542-b6c44bcd02ea'::uuid, 'b2fd4f84-f53e-5ee2-9c3e-4b673f325d5d'::uuid),
  ('quien-lavo', true, false, true, '93720c6b-dc4b-59df-9722-5b4af2aa58fc'::uuid, 'ee197509-530c-5beb-ba88-5d5d9c90fa52'::uuid, '3e105c18-3f3f-5b1e-afe7-88be46cfc40f'::uuid),
  ('de-viaje', false, false, true, '73a8bc39-8b05-5481-880e-49f6d053b955'::uuid, 'e2cf1173-74d4-53a6-8593-0074275e83b8'::uuid, '41d1c494-8611-5587-9bfb-3ede92d7aee4'::uuid),
  ('las-vacaciones', true, false, true, 'be3636f1-f846-5ee4-96de-a52d7db9fb8d'::uuid, '4703e470-8ac0-598b-8434-55deb9468a9d'::uuid, '329188f6-48d1-5164-ae09-aaf671a3bff9'::uuid),
  ('practica-las-vacaciones', false, false, true, '8c9617ac-16bb-5298-9b42-6b57c83dd337'::uuid, '035872b7-c3d2-5cfc-847c-4e7a63db50ad'::uuid, '5c0b9187-d8f8-58b5-a880-14cc134f108c'::uuid),
  ('menos-mal', false, false, true, 'c011ef17-25f6-5860-9420-52c34acbfbeb'::uuid, 'dee483b1-f101-50a5-bbf3-5874d9fca731'::uuid, '3a8321f4-13c2-5b1c-b157-a079e01d0ef7'::uuid),
  ('contame', false, false, true, '87346e9b-a157-59ad-a834-2078bf29a1a0'::uuid, 'bb22c0a7-2e0c-53a1-a9cf-556d5fc7f0d1'::uuid, '2dca605c-38a1-53da-8104-763abe887ece'::uuid),
  ('cuando-era-chico', true, true, true, '215736fb-39f0-5142-86ee-59b628014602'::uuid, '31ef5963-0e74-50df-b310-3ffa2d52ea2e'::uuid, 'a35d5af7-1b00-5dda-8d1a-1bc9b89e8f03'::uuid),
  ('en-la-primaria', true, false, true, '77a25949-94f6-5200-9754-5a07f61c6d6e'::uuid, 'df9bd68f-8ff5-5420-8ea6-220818378a39'::uuid, '5dfd66f3-73b7-54ba-80ec-aa5a4159e6f2'::uuid),
  ('siempre-jugabamos', false, false, true, 'a8147374-2aef-544f-8434-22bf727d0229'::uuid, 'eaf11917-88f9-5f53-afa9-6313cf39dcf9'::uuid, 'e5826b6c-3c84-59f8-b5fc-06ad3256545f'::uuid),
  ('me-encantaba', true, true, true, 'fde689b3-06d8-5fc6-9e62-b895220b3b77'::uuid, '821e8539-a3a2-56ee-892b-1e41f38d3164'::uuid, '161874eb-a858-5836-a2f6-a4db9d862546'::uuid),
  ('estaba-lloviendo', false, false, true, 'c08e29cd-555c-5b10-9800-b89b6fc56518'::uuid, 'a0ef1de0-ed4f-5d77-be6b-fd0bf961bbcc'::uuid, '5e033aee-b05d-56f5-9e74-896c59ceb3dd'::uuid),
  ('sono-el-timbre', true, false, true, '918d5ae4-362e-5d63-b5b1-396c129640f4'::uuid, 'a8fe8863-0df5-5143-ab21-1786f541bbda'::uuid, 'ec1de31c-1d2b-5b5b-a14b-05efb3dc1737'::uuid),
  ('practica-en-esa-epoca', false, false, true, 'f7a8699e-f139-5a2b-b4be-78ef129937a5'::uuid, 'c4b501f0-f34a-50c1-85d1-b4b05d2a06f3'::uuid, 'eb2c39a6-4678-56a6-bd06-55a9f111c6f6'::uuid),
  ('el-partido', true, false, true, '9d1733ba-4178-5104-8c83-088ebb719c69'::uuid, 'd5895a27-e55e-5377-8df4-fe54e088e954'::uuid, '031bdeaa-9d19-52e9-9c9c-af32d850f624'::uuid),
  ('la-final', false, true, true, '48d01461-3302-593d-8a3a-c7e2cc0895da'::uuid, '630f4731-8921-5d26-96d6-f64c3d335f9c'::uuid, 'd9e26c5d-a6a5-5b1b-be0d-7d5701408bf1'::uuid),
  ('de-que-cuadro-sos', true, true, true, '9b925007-d464-5232-9483-ccf4282301de'::uuid, '030039f3-c384-59df-9b96-6cd49a74aaec'::uuid, '038e9b9e-df82-533e-a990-1d5374047752'::uuid),
  ('socio-del-club', false, false, true, 'f78cb933-1815-5a2c-a8b5-7b4e2c9344ef'::uuid, '4ccd667b-d7bb-5ad9-b921-bf56242eb69f'::uuid, '196475cb-1200-50dc-b070-40da1920fe5a'::uuid),
  ('en-el-restaurante', true, false, true, '9fa92406-f3c9-5f05-9a04-9f2de5c6ab6c'::uuid, '29811b07-16d4-5990-b67a-6a1492fdcb92'::uuid, 'cccb1a9e-716f-591f-94e9-6557c8ee88b6'::uuid),
  ('una-grande-de-muzza', false, true, true, '60700cc3-9cfd-5dd9-aeb5-4eef69ad5054'::uuid, '9bc7c1a8-e007-5293-9e48-a1e935f8eec5'::uuid, '9fa81588-e71e-58a7-b248-545a0c828cd5'::uuid),
  ('la-parrilla', true, true, true, '6d264237-fc98-54ed-86ae-ccd3f4798df9'::uuid, 'ff32f016-26df-51dc-b3bb-414c94c3351b'::uuid, 'b3b27b02-6d81-5f9b-9c39-dd60637fe4ea'::uuid),
  ('la-parrillada', false, false, true, '90e001ac-1bd8-56cf-bbf3-9d9495283bed'::uuid, 'bf326344-cb93-5159-b257-df558071446b'::uuid, '88f0552e-afae-5fea-a551-e89a2b2799f0'::uuid),
  ('tipo-ocho', true, false, true, '86d8f569-7d88-51d9-8ab6-341decb38fa7'::uuid, '4265591c-6979-5248-8446-88b2701697c0'::uuid, 'cf6334e5-724b-5bdd-90bf-2c101ef7f77f'::uuid),
  ('llegue-tarde', false, false, true, '63750bfe-4404-5df2-b6b7-4cb1836853a8'::uuid, '30b1a529-fc73-5da9-bc4d-eb90686d16fc'::uuid, '2643d984-c73e-58ad-b56a-843f9748d7d4'::uuid),
  ('las-fiestas', true, true, true, '508fc255-c356-5ba6-bc61-c8db3307b5c5'::uuid, '9e12ef2f-5576-5098-986c-01135dbec83a'::uuid, '4423dfc4-b129-5464-b23e-4c550ecac640'::uuid),
  ('en-lo-de-la-abuela', false, false, true, 'e87a3553-4708-5b11-a97d-54272b7e6f9c'::uuid, '733e58ca-083a-5426-80ac-0c02f297d2df'::uuid, '4149a2ca-9597-51f8-9875-88e0c2d09e9b'::uuid),
  ('practica-la-sobremesa', false, false, true, '48e85abe-dde2-5758-a9a5-b4035e908579'::uuid, 'adc354f8-9f78-5a51-898e-487810666c10'::uuid, '116bdeb5-0a4f-524e-adaa-32da0df7445a'::uuid),
  ('me-puse-nervioso', true, false, true, '2c421619-23f9-596c-a7bd-8a3f483b6d42'::uuid, '576e572d-176f-595a-a423-c8f3ff51b422'::uuid, '0a64a52d-fe3e-556c-baf6-978a7b513235'::uuid),
  ('me-olvide', true, false, true, '5982ba44-1d1d-5169-b062-ddba72f4211e'::uuid, '8fa346f8-3ebe-5dc3-a8fc-7e5b5eb91fc0'::uuid, 'ce17d99d-26b2-552d-b221-1aa2ccfe1a05'::uuid),
  ('la-semana-que-viene', false, false, true, '12573a37-c1fb-5849-a946-947a1dda330a'::uuid, 'dac2a293-7b4b-527c-84c9-4b8ff0966ac3'::uuid, 'f1c97c00-6d37-567c-8af1-b95586af8f16'::uuid),
  ('voy-a-tener-que', false, false, true, 'cf6059ed-5df7-5b3a-bb33-c56fa2226f8c'::uuid, '4818e313-42d7-59cc-940f-f8d066f9c416'::uuid, '8cd9c803-15b9-535c-9919-7a021335927b'::uuid),
  ('recorrer-el-pais', true, true, true, '3e27470d-07f8-53cf-abdc-6489b6cf7ba7'::uuid, '0cb6369a-eaef-548b-bb84-9dba4bf77d9e'::uuid, 'df6ac071-40cc-5e8a-ab38-42531b12e531'::uuid),
  ('acampamos-en-el-sur', true, true, true, 'a54a13c3-bd60-58e7-8e8d-9b55e263a70a'::uuid, '489879a3-a760-5f8c-a9c5-9fde6c28ddd6'::uuid, 'fc9e65bc-075e-5831-9aa2-7a0f2dbe1684'::uuid),
  ('me-mude', false, false, true, '8a8c329a-50ee-51c3-a77b-1e109779e6cc'::uuid, '599bdcb6-5fb1-5ac5-9ed1-639b890aeb7b'::uuid, 'ee576b4f-42a6-50fc-915f-9e6e68c51ada'::uuid),
  ('el-depto-nuevo', true, false, true, '7974d33a-e008-5525-a28a-93ce7cfb4a81'::uuid, 'a16d98cb-13db-58e1-9746-e6bb6fc38a4b'::uuid, '5bc708fd-adc0-5f47-9677-5f7d7a3cdaab'::uuid),
  ('practica-antes-y-ahora', false, false, true, 'e4198eee-c061-56fd-9e5e-55e3fa2de3c4'::uuid, 'cd1374b1-6efb-53e1-ac74-8cbcd8db219c'::uuid, '084850fa-15c3-594b-9e72-fb6a74fbca28'::uuid),
  ('las-figuritas', true, true, true, '9e26dbe0-ef85-5ba1-ac93-e531d172ff39'::uuid, 'b5055b59-04d2-57ce-b2b4-db69f17b0004'::uuid, '535eb360-daff-55b2-9c37-c00428183bc8'::uuid),
  ('te-acordas', false, false, true, 'ee650732-62b3-5c1b-a786-f0c81e0dd597'::uuid, '99126db5-02b2-56f5-883d-99d3a232d33c'::uuid, '6826c9b7-bc22-58f0-a4ec-9596ed9047af'::uuid),
  ('me-haces-un-favor', true, false, true, '74f2f22d-3a5d-56e5-8e5a-45b4b81e9322'::uuid, '148fa244-34d9-5192-adb2-ca628b8425a3'::uuid, '5d0416e1-ec53-58bc-9159-1fe7f870c6ab'::uuid),
  ('me-das-una-mano', false, false, true, '601d8e49-922d-531f-af3a-abe34265b3b7'::uuid, '43f26f04-4a05-5d71-ac34-11f40dc5d66a'::uuid, 'ab077244-be98-56f7-a271-88699aa34adb'::uuid),
  ('un-ratito', true, false, true, '2286d7d3-3232-55cf-b02d-0caab9e64ec2'::uuid, '5bf831c7-bcfb-568d-b254-2e5b5d6ea9fd'::uuid, '8ae4e960-da02-5022-8339-e027f2780bdb'::uuid),
  ('hace-fresquito', false, true, true, 'f56442af-bf77-59a2-8ba6-7dd136b7104c'::uuid, '133ece25-569c-5724-8672-ee27c4e68783'::uuid, '564e8c1e-ff62-5d09-865b-50699ae203f9'::uuid),
  ('pasen-pasen', false, false, true, '61d3fae3-2a48-52c2-99f7-85fdba8aa570'::uuid, '5accf0d9-8648-5276-b08c-e8252ebc955e'::uuid, '7241cb19-9bd4-5423-bc08-5a947588f6db'::uuid),
  ('a-la-mesa', true, false, true, '1555b20f-aff4-5d63-8422-7a44f9ba068d'::uuid, 'abfb2be4-e564-549d-a2cc-90ec8fa05228'::uuid, 'a39e8e83-65b3-5623-a138-fd902fcab0b6'::uuid),
  ('hay-que', true, false, true, '61031faf-8549-5f04-8e2e-927f51c4ae39'::uuid, 'b81809fd-31d9-5630-8507-cb259e3b91ce'::uuid, '3e1c9be9-f21a-5d2a-bb7a-47befccb8023'::uuid),
  ('hay-que-sacar-turno', false, true, true, '59e05afd-6d1f-519a-88ba-a6d9f4612eb8'::uuid, '2786963d-dad3-5251-af94-5d5ea4fc0ad1'::uuid, 'b7cbc50d-d620-50d6-8e15-8416fc3638a8'::uuid),
  ('en-la-verduleria', true, false, true, '6d886152-2109-5f2f-903d-f8c123d6f833'::uuid, '807ad110-ef31-5a51-a3d6-d6617dff612a'::uuid, '75bb8d3e-1a9f-5c0c-8061-670eb9f1541b'::uuid),
  ('cien-gramos-de-jamon', false, false, true, '9c9afad0-5d7b-5cbf-bbac-54caa2e9cbf9'::uuid, '96e25e54-5b5e-51d9-abb7-6a557ca91841'::uuid, '8af71db3-4faf-5d7e-bd03-d65a7528d266'::uuid),
  ('practica-la-feria', true, false, true, '0235fb96-a9b8-5527-9cac-734610431d0b'::uuid, 'ea311335-1378-50cc-8d4e-b8731b1a3665'::uuid, '3c66e7dc-0bfd-5c92-a222-6f591aad5692'::uuid),
  ('el-celu', false, false, true, '85445271-79ee-5a47-b7fd-c8d1b2d5c592'::uuid, '4f0a020f-72c6-5a31-8dfc-d6627fc46ddb'::uuid, '3daf3de6-afa7-54c1-9722-4cdde8558bab'::uuid),
  ('no-tengo-senal', false, true, true, '433bc463-326a-5843-bba2-bc4f6fe74a07'::uuid, '1c3f5674-9cdc-556c-98c6-a893743a86d7'::uuid, '16836245-bd50-5860-b19e-2a74bcddfc4d'::uuid),
  ('me-robaron', true, false, true, '8023d540-16de-5b12-a7b1-67237ef0334d'::uuid, 'e3e4f236-ce30-5bd7-8056-e0d4dca341ce'::uuid, 'a59e0790-751a-5985-8264-c3f0ac4cd197'::uuid),
  ('me-afanaron', true, false, true, '8a000c2d-feeb-599d-ab30-092ca1b7d77b'::uuid, '89675771-3b4a-563b-8b53-1778c9251d45'::uuid, '4f27f53e-aa00-5447-9dc1-d9e1b444758e'::uuid),
  ('te-lo-devuelvo', false, false, true, 'd60da281-dbb1-5099-8db7-761aa946c920'::uuid, '8bcd88d4-9777-5099-b223-061d71b1e7c4'::uuid, '96ccf1d5-6621-5344-9fc6-874281cc40ea'::uuid),
  ('te-lo-presto', false, true, true, '8a182029-ab2e-519c-ad9a-e1d6b45a7752'::uuid, 'f673fe0e-1413-5c3e-b2de-46855c09b550'::uuid, 'd0a8de75-6779-5535-a39b-494e16ad7cec'::uuid),
  ('laburo-nuevo', true, false, true, 'd15efd61-6bdd-59fd-836c-879cce2df1e0'::uuid, '943e87f6-7208-5756-86b5-43fb96413930'::uuid, 'a71a9a42-3fd3-52c8-81a7-305d2cc2d841'::uuid),
  ('me-contrataron', true, false, true, '9429087a-de34-5cc0-849c-01167cf58f70'::uuid, '9b20c6f0-e542-5289-8b89-a9887f4b7438'::uuid, 'd530ad9d-7ffc-5148-9c1c-e1f5c53bbb6f'::uuid),
  ('practica-te-lo-presto', false, false, true, '070da918-1da1-52b1-a6ad-a2b231251e41'::uuid, '34c37fde-4302-5a2d-870d-2be1dc9b0b92'::uuid, '56ea994d-90b8-54d2-a3d0-9ae6c62018e4'::uuid),
  ('salir-con-alguien', false, false, true, '9ed0ed18-9cd5-5b71-9d87-bbc5ffe4a383'::uuid, '43694795-6eec-553f-bbe6-e5c9d2f14832'::uuid, 'cf5a5b9a-c017-5344-b451-fa9daf913544'::uuid),
  ('estamos-de-novios', true, true, true, '21341c48-b7bc-5d2c-8abd-844fa309a0ca'::uuid, '1c3b59c9-3504-56b2-8754-6d23f18882a0'::uuid, '48e75f98-e732-56b9-b414-e92778cc016f'::uuid),
  ('me-cae-bien', true, false, true, 'd35ec2b6-1c62-54d7-996b-8c513516b238'::uuid, '2f231f3a-ea2b-5ce9-b75b-46c8542201d6'::uuid, '6c89fffe-d3e3-51e4-a0be-4a06583b6d1f'::uuid),
  ('no-lo-aguanto', false, false, true, '117131f6-2072-56ee-84dc-c6b1da8b4de2'::uuid, 'd873aa6a-6584-50cc-ab1a-3df31d09a564'::uuid, 'bcaaed62-d6f1-5784-9fac-5479fe80ef03'::uuid),
  ('se-caso', true, false, true, '6df29bde-dda4-5464-8601-3068d90dd45d'::uuid, 'df80b59a-d1ad-5406-8f71-54ff3951bce2'::uuid, '34e32ef0-c879-5e5a-8823-9986bfc7cdf7'::uuid),
  ('se-recibio', false, false, true, '8e5aacf8-4a53-58f9-aa7f-1a0dc04227c4'::uuid, 'e8d355b8-1304-5d4f-97fe-8fc99af176db'::uuid, '9bf00aae-7c4a-54fa-84dd-d567dede018a'::uuid),
  ('donde-estara', true, true, true, 'fe88447c-6897-5d4e-8727-6642f2cca6ed'::uuid, 'd1a6c1e8-751f-5be4-b787-867f6dcaa5d5'::uuid, 'cf2481a3-6ab5-5eaf-a7d2-46204e0211bb'::uuid),
  ('quien-sera', false, false, true, '38160943-577b-5c10-acf6-4bdbd0e874a3'::uuid, '1e29d648-ade5-5ef5-a3b4-282991665a8a'::uuid, '115d36e9-33ae-541c-b7b2-0e7c2de6a28b'::uuid),
  ('me-siento-mal', true, false, true, '7dca8bca-7365-593c-a899-b13e04d96abb'::uuid, 'bf1c6906-99e5-5920-95db-91c92b605e71'::uuid, 'b28e0656-bbd4-5ed7-85c1-d217d1adf4d9'::uuid),
  ('como-se-siente', false, false, true, '60e88746-ec5b-5ffd-9fc6-94a8e0dc068e'::uuid, '41277ad1-8c44-5fd1-8ca9-edae92e38a7b'::uuid, 'e43b54b7-b6e6-5d24-bec5-2aaaae9ec16f'::uuid),
  ('practica-a-lo-mejor', false, false, true, '117ffa2b-2459-58f2-8a04-8afe75f0025d'::uuid, 'dc6623b8-cbc9-5a72-9c49-41f55147b937'::uuid, '8d89f8c1-c7b8-55ee-8fa4-1c4705a4df9e'::uuid),
  ('sos-un-genio', true, true, true, '96c4940b-304a-5e1f-bb0b-f42947fd6dfe'::uuid, 'cfb0fda4-af27-50e7-bb03-4c9ad9080aef'::uuid, '15dbe54d-cb07-53e2-b877-27a23286d272'::uuid),
  ('te-debo-una', true, false, true, '8e0d2758-b3d7-5e6c-babb-72402a95c1ca'::uuid, '546bc911-902c-5648-b106-b15253c6288f'::uuid, '10894496-754e-55be-9f66-337112bbb99f'::uuid),
  ('quien-ceba', false, true, true, '220ae886-f702-5ce7-8012-ad04a683f401'::uuid, '08cef463-04e5-5469-a0ab-e66b9d5f2548'::uuid, 'aae98d33-a515-5453-a087-01f718a8a254'::uuid),
  ('te-convido-un-mate', false, true, true, '2f4ca12c-8fed-5171-b019-a62759685a73'::uuid, '68f764ec-82df-5d57-87d5-3f3c33dbc0b7'::uuid, '894e5ef6-4263-533c-a884-eae9f9b82ffe'::uuid),
  ('quiero-que-vengas', true, false, true, '0f65ebb8-eeed-5dc8-85c2-e9f55ec63d0f'::uuid, 'e852792e-459a-522c-a87a-9abb2fb53b21'::uuid, '970df0a0-b696-56b7-8877-1c64544e0a20'::uuid),
  ('necesito-que-me-ayudes', false, false, true, '235cbe76-0dc9-5e48-83b6-e09b2cee9b4e'::uuid, '80181200-481b-5016-8afb-341b93f53e78'::uuid, '336f56ce-012e-5172-873e-a9a51a2e47b7'::uuid),
  ('que-te-vaya-bien', true, false, true, '243924f4-678e-5075-b344-fc893eeb07dc'::uuid, 'cb630725-6b01-5342-9164-26787a2d85cc'::uuid, 'f6998ac1-00b4-56b4-9b89-cfc5cd901c4c'::uuid),
  ('que-te-mejores', false, true, true, 'da2d3667-2d1d-5717-a75d-4b53db73f2ea'::uuid, 'a7766531-cc56-5873-9c6a-5fdcf97e70a0'::uuid, '2404d454-a052-5721-bb22-83efd24b015e'::uuid),
  ('cuando-llegues', true, false, true, '25d2e302-4c5b-58a2-8b25-23c1f67b2c0e'::uuid, 'b859dc24-f06f-567d-9b62-372d9a83a33c'::uuid, '42819ebd-28ed-50b8-a2f4-74552a6891f7'::uuid),
  ('cuando-vuelvas', false, false, true, '72ea413a-14bd-5887-9d02-4e2c5a4aa998'::uuid, 'c1318678-dae7-5247-a1be-d9a9f0d4f837'::uuid, 'cf3dc264-bb0d-5d60-bbe4-a4d6b984eddb'::uuid),
  ('practica-cuando-vuelvas', false, false, true, '45ef4688-5fa3-514a-8989-7d59a02d4099'::uuid, '61e94bdd-c8ff-5146-9bb6-746828af23a2'::uuid, 'dfa83a21-bdec-56ab-93b7-1729713ff8d9'::uuid),
  ('no-creo', true, false, true, '470084be-12ff-57e8-a95e-8ca3d7a05f39'::uuid, '10c0c245-6159-5e56-a099-8997f79e8063'::uuid, 'ae2b5952-bda7-5423-86cb-346adfab5fb2'::uuid),
  ('puede-ser-que', true, true, true, '5a8644e2-3bf0-53b4-8466-8ba978be5131'::uuid, '2e2c0581-f44d-51ff-b66e-0ec725d4d78f'::uuid, 'ac5fe653-7202-53fc-b729-7349b11caf30'::uuid),
  ('no-te-preocupes', false, false, true, 'a11f88ac-9517-58c3-96e8-1622d672c5c2'::uuid, '9ff74d4f-69d8-537d-86d7-db18b7a57aad'::uuid, '6afda048-ef47-5eb3-8d0d-3e87891b0922'::uuid),
  ('no-seas-asi', true, false, true, '0f01f86c-1859-5b38-ac10-cccf1a7b4d44'::uuid, 'e278f90a-c2fa-5d6e-a679-612d2af73b9b'::uuid, '98e8e698-d3ab-5045-bba0-e2d001230fe4'::uuid),
  ('te-recomiendo', false, false, true, 'fec6682b-ccf3-5ff7-b299-d1d3a9b4f3b0'::uuid, '937904fc-21a6-531a-9302-a42d488a3ca7'::uuid, 'f37390ce-c71e-5c13-a374-b5bdcb47e45f'::uuid),
  ('te-aconsejo', true, false, true, '10d49879-dd25-5b21-8f14-3858f8d0a4bf'::uuid, 'e8db1b17-8b11-56d7-a1e0-4facb7758cd6'::uuid, 'cbd2717b-07f5-511b-b391-04416222178c'::uuid),
  ('practica-te-aconsejo', false, true, true, '0295e097-72c7-5bda-b483-2baee81efe89'::uuid, '108279da-8e39-55ac-b889-1498e4aea365'::uuid, '0750c2e6-d448-5067-8f4e-70720f3a2ca4'::uuid),
  ('que-bueno', true, false, true, 'cf471e3c-fb9e-5a1a-94a2-590ac2964143'::uuid, 'e9f248c5-8c07-5bdc-9a02-dcaf54658662'::uuid, '4fe240e5-31af-52ce-8f8b-15b43bb23aa5'::uuid),
  ('me-preocupa', false, false, true, 'e286872f-a57b-59c6-b9b5-c58e12d1f90c'::uuid, '443d4c0e-81b0-5f93-9134-c165713d5e38'::uuid, 'cbb0fec5-adbf-5ad9-a7c6-b1dbf6c444af'::uuid),
  ('no-se', true, false, true, '04b85a32-62ee-53e2-b8f6-c3e548da9ab5'::uuid, 'd1a01b0b-fba5-55d0-ae45-8d4db6455c90'::uuid, 'c8a8e3f3-c788-53df-af3d-9a8aa0f6338b'::uuid),
  ('que-significa', false, false, true, 'be1562f7-eb60-5221-9f0b-4f4ae724e892'::uuid, '99bdfac8-2145-5505-8bd1-f7ab22f9b10b'::uuid, '414da6df-d946-5852-8a46-610251707ff8'::uuid),
  ('lunfardo', true, true, true, 'bd4bff84-bb43-5cfd-87e8-0a591cfc2939'::uuid, '71b38146-390d-5842-a3a2-eb3f4efd42d3'::uuid, '65bd561e-3f5f-516f-82b2-649d4e7d04e4'::uuid),
  ('es-un-afano', false, true, true, '3328e345-3584-5de2-bfb4-ec8031e1ed80'::uuid, 'dc92c56f-3ea6-5c9e-b5a8-560cc7acb4a4'::uuid, '24dcbdea-1ffd-5031-8e35-c906dc965bdd'::uuid),
  ('practica-es-un-afano', false, false, true, '71f8191e-54bb-5e49-a166-ba8fea5d863b'::uuid, 'aca1e35d-ea7e-5d75-89d1-ad7574551ed4'::uuid, '5a00caa8-0345-51b4-b5a6-0703ffc026db'::uuid),
  ('saludos-a-tu-vieja', true, true, true, 'f177dd6b-b3a1-5059-ab8b-bd94c3205fb6'::uuid, 'e4c5e4f5-144b-5901-87a0-34a2fa564934'::uuid, '2763ee66-ed4c-5850-91d9-a5acf1e73cc6'::uuid),
  ('cuidate', false, false, true, '5ef94a47-52f5-5842-8371-790137dccbba'::uuid, '692d5347-9d94-5b41-8f28-61ad856bcf26'::uuid, 'c80e50e7-bb29-5deb-b75f-79899e49d868'::uuid),
  ('yo-que-vos', true, false, true, '833d55f4-0dd0-5780-9087-69c79e6f676d'::uuid, 'ada33b3a-bbec-5280-be67-ed3f153bb8e6'::uuid, '87f7d353-2a66-5ad9-837d-c8a35b2ea1b5'::uuid),
  ('yo-en-tu-lugar', false, false, true, '1a0eb44c-b05a-5188-8b2f-13e1dfea8e66'::uuid, '9998b731-f60c-5f22-9548-85a7d667b3af'::uuid, '424805d4-ebd5-588b-986c-009783346914'::uuid),
  ('si-tuviera', true, false, true, '838fcbcd-413b-57c8-80df-68013cb9ae5d'::uuid, 'c14436c6-76ba-512e-a028-751a6bf57eb4'::uuid, '284e2779-7c27-5cf9-976f-1e4a7bf1d842'::uuid),
  ('si-ganara', false, false, true, '887789c3-e17d-541a-9aef-f8d11732c493'::uuid, 'e63aac3f-4c83-5644-b778-6c02c55fc918'::uuid, '1ed51820-d75e-5edf-96a5-4479c0bcab6f'::uuid),
  ('me-gustaria', false, true, true, '63ff0e55-1498-58a1-8f33-f97b78fab776'::uuid, '97e56dd3-0a38-5cda-b438-a7515288edd0'::uuid, '11dd2b6f-27d6-5f22-aa49-0f129e03eafd'::uuid),
  ('preferiria', true, false, true, '12cbb337-1629-5578-834a-8617b82ef711'::uuid, 'd70851fd-d435-5e04-b716-c0dfd856603f'::uuid, '993a9562-2d68-5f68-8419-cefbc30aa13b'::uuid),
  ('usted', true, false, true, 'da381119-b6ec-5b50-b661-d46e0934b9ac'::uuid, '1fb79dec-a0f6-5955-acf1-efe61315eea6'::uuid, '91ef2f54-b92a-56ed-a1b1-0427e2dd485e'::uuid),
  ('como-no-dona-rosa', false, false, true, 'e323c95b-6f22-5b1b-a77a-5b2d4827bb38'::uuid, 'c1138f69-7ac8-5769-a431-999f7418b6ed'::uuid, '5646ad26-7d3a-5ae1-84a8-69d716aefd6e'::uuid),
  ('practica-si-ganara', false, false, true, '6761f9cc-973f-507b-bf44-c8088f4885a7'::uuid, 'fe8ff9ea-fd9a-5011-a151-012c6b9a44c1'::uuid, 'b6c4c5b1-643a-5512-9d2a-98f9604329ca'::uuid),
  ('manejar-en-baires', true, false, true, 'face2219-d12a-564e-bd32-7fa780e64649'::uuid, 'd46e41c3-3e73-52f6-8fb0-cd0444335b77'::uuid, '1dd92647-7f9b-59f6-970b-722febfd04e0'::uuid),
  ('la-ruta', true, true, true, '20ab9907-a7f9-50b0-a18c-4daf9687f052'::uuid, '8c347726-be93-562b-88bc-e6d07f13045b'::uuid, 'e35ace3d-700e-5db4-ae89-3694eaa88992'::uuid),
  ('en-cuotas', false, true, true, '4d93578d-d218-54aa-a477-2eb4eecfebb9'::uuid, '5f50fdac-469b-56c3-9079-970f3a862582'::uuid, 'e595cf52-0168-5166-ba14-7e7f2438f9cb'::uuid),
  ('a-medias', true, false, true, 'bf79c00e-0a6a-51fd-8374-0473dba805bb'::uuid, '705279f7-f2ec-53a0-a20f-308eebdffbac'::uuid, '1e7d8824-9095-5417-b57a-94cd8c306b30'::uuid),
  ('dicen-que', false, false, true, '912b811e-634e-5b70-90ce-97d08ddaaeb7'::uuid, '6c94bc64-0dec-56d3-87cd-53dc0b5a2f79'::uuid, '4f00698f-24d0-58b7-95d5-b64d159a7c57'::uuid),
  ('me-contaron', true, false, true, '2c33e99c-a06d-5b14-a10e-398c2c96c7e5'::uuid, '3b64a2c2-e578-5171-b2d6-a50872e07a17'::uuid, 'fa01ac74-02d6-5704-beae-7a67e3182c71'::uuid),
  ('practica-a-medias', false, true, true, 'bd18209a-9a95-5267-b5ee-72eb38899196'::uuid, 'f87dda2e-488f-51bc-9523-a3fbbf5b4c17'::uuid, 'ebc0de34-5490-50c2-bb95-aabdba3cd9a4'::uuid),
  ('buena-onda', true, false, true, '3e0392ae-215b-526a-91ba-1f59904a0a45'::uuid, '61b55a51-6652-5786-884f-b6fb03f92df4'::uuid, '66f1a821-b805-5f82-af35-9591cbf549d0'::uuid),
  ('es-medio-vago', false, false, true, '0b8d702c-4c6f-5e43-a2b9-ec55f7355392'::uuid, '3bd0e279-b184-5a9e-be74-7de3076c7f5a'::uuid, '8f5a3066-d684-539b-b7ec-6fee075e8a42'::uuid),
  ('donde-queda', true, false, true, 'c3b66624-5971-5cae-bcff-b45f9f2f9b72'::uuid, '812d36ca-dbb1-595e-b846-5b7d2c117948'::uuid, 'ce4c6530-2716-5d77-9c7f-ac8e9f8bdaec'::uuid),
  ('zona-norte', false, true, true, '616bb32a-5e26-575d-b5cd-cf9b3bf0648d'::uuid, '67217c53-7e86-560d-a4bd-15b53d8a2389'::uuid, '9f7ce56e-bf20-5638-ae2f-1e9b49d1a4cf'::uuid),
  ('me-pregunto', false, false, true, '087cf791-f3aa-5cff-9ec7-a7f4574b76f9'::uuid, '806d2a1b-61d0-5c18-bdf0-6948c9a21a60'::uuid, '4550330f-02c0-5392-89d2-b3512b0cb12c'::uuid),
  ('me-dijo-que', true, false, true, '7db1725e-b29b-5409-bd21-83dd14d736ab'::uuid, 'd1165671-a69e-52b6-8303-501e42940a08'::uuid, '0cf67cf1-055a-51d8-abc2-779d7b141a53'::uuid),
  ('practica-me-dijo', false, false, true, '1a30499e-88d6-53ac-ba86-5d5dfc278b88'::uuid, '1d67affe-88af-5dfc-8471-671dd931e0c6'::uuid, '1307ed33-a06e-50cc-a452-f17a886c3258'::uuid),
  ('ponele', true, true, true, '274fad3b-04c0-57eb-9e66-8e3f52f0f823'::uuid, '3c991c67-1e71-5c6a-811b-573254288eda'::uuid, 'fe6deb20-63ff-5548-813c-ce7cc18ac46d'::uuid),
  ('por-las-dudas', false, false, true, 'ff6e55e3-662f-5cb7-8716-1fefa91d1566'::uuid, '10b7760d-61e5-5fc0-9e72-f53a3dc70c50'::uuid, '4750b771-850a-5ab8-b6d6-fb163e7d9adc'::uuid),
  ('se-me-cayo', false, false, true, 'd85d9edc-f73e-50ad-98ac-ac71d27b414f'::uuid, 'f9fa3fbd-4496-57f0-b183-c453696c751d'::uuid, '4d9a5060-abc9-5834-b863-5e32aba0fdac'::uuid),
  ('se-me-quemo', true, false, true, 'b2a6cc0b-640d-56db-82d3-20d389aeffa9'::uuid, '6bb90367-f0df-5829-a220-04c82232779a'::uuid, 'e9144437-b4ec-5550-9168-54029b3f4bf6'::uuid),
  ('para-que', false, true, true, '32d74b6c-a970-5865-8990-a0a375b6851c'::uuid, '05d60a8a-a2fe-5c72-8d2e-d8c130081dda'::uuid, 'a876eb91-6f46-5493-96fd-8cb5e0f1f882'::uuid),
  ('para-que-entres', true, false, true, 'c8024a2e-409f-54fe-bca7-a000be1aade2'::uuid, 'ab1af0d2-62fb-5342-a173-b99640f2d690'::uuid, '669055dc-d41c-5e9a-bf61-d7a5d03b56e1'::uuid),
  ('ya-habia', true, false, true, 'bf682467-9bf7-54b8-8b5f-a3bd0932bd2c'::uuid, '8c7d6c3a-bdf6-594e-95d5-ad5d9b5e63a9'::uuid, 'af63ac66-c2f2-5a3b-95a3-08681607a4d2'::uuid),
  ('nunca-habia', false, false, true, 'bb914605-2050-5211-a96e-68fcb834d5a3'::uuid, '1674ed9d-7017-527f-a86b-567b82bb86ba'::uuid, 'f9cf5285-12bd-5037-b235-abf627240a9b'::uuid),
  ('practica-nunca-habia', false, true, true, '1142a277-cc9f-55c5-a764-76141f69f324'::uuid, '51c87e9f-09b0-5be0-a19e-537165095ada'::uuid, 'a78eec3d-398d-5870-b7fb-256129a66e48'::uuid),
  ('no-anda', true, false, true, '6d1fc56e-289b-5821-9725-9afd28eecf2b'::uuid, '036b8c48-dce4-51a7-a497-4a24cf286d66'::uuid, 'd5e92ebb-4425-5c9f-8186-c25137fd79af'::uuid),
  ('el-tecnico', true, false, true, 'f0e4610a-23a1-5661-baf8-f8b7a70709d5'::uuid, 'ec08f946-e0ad-5391-ac22-95e5c40dfcd1'::uuid, 'b3461ee7-95f0-5f81-ba00-631835252625'::uuid),
  ('el-consorcio', false, false, true, '3a8e0945-66a7-596e-9132-c65e5820c167'::uuid, '8d715175-7ef7-5368-8168-6c478ed93f8d'::uuid, '7d3399b3-b296-5374-b774-011daad96bf7'::uuid),
  ('se-tapo-la-pileta', true, true, true, '8c1f5ebf-7a8d-5d89-9076-29e6442e1688'::uuid, '200c0057-09ff-5ebe-bad9-f154ac6a58d9'::uuid, '6d4102dc-6e3b-549e-9b95-2a9d5b5c6fa1'::uuid),
  ('de-acuerdo', false, false, true, 'e814d9a9-520a-5873-946e-ddc637a26709'::uuid, 'a4f7b9e4-f7ab-5b8d-ac25-b37355395fae'::uuid, '5fa52763-85eb-5aef-8df5-297664a8a7fa'::uuid),
  ('tenes-razon', true, false, true, '2b3526ee-34d8-59a4-8aa9-e917b9db8e36'::uuid, '58f2137f-2b75-587c-bc16-dcf037e0357a'::uuid, '305331b9-9a02-5c21-8193-5e723b80e1aa'::uuid),
  ('practica-tenes-razon', false, false, true, '9aeca4a8-46cb-57ca-9bf7-06a9a694d653'::uuid, '41342c9c-60f2-52ba-8db7-2641b881e541'::uuid, '5ae9aa5e-bd3f-5ec2-855f-aee68649f8e1'::uuid),
  ('el-cajero', true, true, true, '91a42cda-3a7d-50c9-9361-49e9a2eb536d'::uuid, 'a305f368-727c-5689-8a6a-49526a1c9bb5'::uuid, '8e967804-88aa-59dd-b33d-fcbfaa925df2'::uuid),
  ('pasame-el-alias', false, false, true, '7a101b80-9c79-5220-beed-def491543c5f'::uuid, 'fcce10b6-bfe2-5d54-9709-aa2d0bff785c'::uuid, 'bacad9ed-def5-5bf0-96f1-8f0c59b740c8'::uuid),
  ('que-susto', true, false, true, 'f4f8ebaf-54f8-5b2f-aa72-a80a4e56f20b'::uuid, '238545b3-ff81-5662-a166-91effdc76325'::uuid, 'b8c0e3b0-7c61-5605-8cca-50de988e2a33'::uuid),
  ('me-dan-asco', false, false, true, 'a67521ec-ec4c-58fc-9869-0cadbd3e3d5b'::uuid, '809b2662-c097-5b4f-a231-cca05f4ad677'::uuid, '34df23b6-0e33-5897-85fd-f4f966ff2ed8'::uuid),
  ('costumbres', true, true, true, 'c955bef7-14a0-57fc-a7e5-163d164fb8db'::uuid, '569a1f32-14a1-548a-aa00-ed3b95ca5b30'::uuid, '4f1fd78c-a1a0-5887-9666-9542f37b14b4'::uuid),
  ('se-aplaude-al-asador', false, true, true, 'c550b985-ffc5-51ec-8b2a-f56a9678843e'::uuid, '1bedbca4-2d1c-5f25-9ee3-1b0c7e241b78'::uuid, '988b55d4-10ac-54ed-add3-c8e608dc3307'::uuid),
  ('acabo-de', true, false, true, 'b1af073b-6745-526d-b218-af5f65d0b704'::uuid, '8466fefe-9fa9-57e0-8e60-57319e333b8f'::uuid, '4f31dd7c-efea-5578-bc27-d4cb76c6682f'::uuid),
  ('deje-de-fumar', false, false, true, '402d55e6-66d6-599f-b3de-c3b7e20cb6ca'::uuid, '8c1fc3d6-977f-5a5a-912f-52a0ba0ef4e3'::uuid, '50e4d716-eece-5cc4-893d-15c120dcd834'::uuid),
  ('practica-un-aplauso', false, true, true, '4a896f91-4c95-588e-8cf9-db87217245da'::uuid, 'a783f53a-eda5-5ed5-a566-2fd22cf542d4'::uuid, '9b4e2d89-429b-55c6-9d25-0b84e8267840'::uuid),
  ('no-sabes-lo-que-me-contaron', true, false, true, '7a0e0ee0-63bc-56fe-9f5f-fb1da845f9c2'::uuid, '23d9a482-8b60-52e4-9986-5f17a1524406'::uuid, 'e0c88ab2-da11-50b9-a2cf-e9aecdef9042'::uuid),
  ('viste-lo-que-paso', true, false, true, 'b35181ab-203b-5e99-9541-444524fcf241'::uuid, '2d97a80e-bbf0-5574-88d0-1dde0629fe9f'::uuid, 'c71c0747-8353-5f61-b003-bd9addd68644'::uuid),
  ('queria-que-vinieras', false, false, true, 'a5e03899-7cff-5202-a939-cc1b8691b2c5'::uuid, 'e7355a9e-c523-5e04-b2ca-8dc0cfe95b8a'::uuid, '45091d13-b403-5986-ab01-259366f9dc05'::uuid),
  ('mis-viejos-querian', true, true, true, '6e668187-50d4-522f-931e-e5272c41d0ac'::uuid, '35b93d43-a1df-5d7c-80d9-40e1286485e8'::uuid, '0dab8249-8ce9-5c81-ad12-bf8055068b4c'::uuid),
  ('aunque-llueva', false, false, true, '3df08107-a3c2-598d-aa5b-ef0ecfc669d1'::uuid, '98f72b5c-ab4b-5b17-b85b-cc55824cbc3e'::uuid, 'e75a5b24-35f0-5dc5-b2ee-1ff8b4f95532'::uuid),
  ('aunque-no-tenga-ganas', true, false, true, '0750bf7d-37af-5a98-8444-a25454ab2be0'::uuid, 'd9ea88bb-ec02-5c29-99ca-fd9f233dc99f'::uuid, '6e21ac1a-bd91-5356-b1e5-4fc03739d39b'::uuid),
  ('llevo-dos-anos', false, false, true, 'cc378fc7-1539-5af8-80f2-98a3f07af5fe'::uuid, '7ea45104-b35b-5ee3-98cb-8847990b0416'::uuid, '119b05a2-57ab-5779-9ca5-91ae94192c47'::uuid),
  ('llevo-un-ano-aprendiendo', true, true, true, 'e55bd1ab-f899-5233-a1ec-572bcc82a7b9'::uuid, '29a84136-b7f7-5efa-99be-3077e4548795'::uuid, '7ab53508-6dcd-5863-b2ca-8b1e67bab752'::uuid),
  ('practica-aunque-sea', false, false, true, '6f41a06e-a8fa-5df9-83c8-f4ea805f21f4'::uuid, '49cd57a3-e61b-57c4-89de-d01a61e72e74'::uuid, 'd35db985-bcd4-5e46-b876-729878cf703d'::uuid),
  ('como-si-nada', true, false, true, '76c122df-1a1c-52d4-ab05-b69ecb34cdec'::uuid, '02026bc0-6a70-5d21-b026-6f25d878382e'::uuid, '2ca9e705-3882-5384-8998-b916554cdfd9'::uuid),
  ('no-te-hagas-el-gil', false, false, true, '427ecb2e-7908-59d2-afa4-0ec154a5539e'::uuid, '21f82da9-e558-5f5f-a868-57db4f1c04a9'::uuid, '7f7e716e-e313-586b-9e0d-f0464a4372f0'::uuid),
  ('el-que-quieras', true, true, true, '24dc8cfd-cb09-5440-b5bb-b9e261463d8a'::uuid, 'bf4a4244-6b2b-537d-9fcc-1c867351e4f6'::uuid, 'e529deb3-1182-5cd1-bc8b-643d3f124c8f'::uuid),
  ('el-de-la-vidriera', false, false, true, '746f4b07-cf8e-5ada-907f-c3fbf1705678'::uuid, '406805b2-507c-5694-925a-98656de26a03'::uuid, 'e0e0608d-8c69-542a-9e72-db6783a166ac'::uuid),
  ('practica-a-la-mesa', true, false, true, '6993c790-803d-5edf-9f13-4681f556e034'::uuid, 'fb3f9702-2663-58a9-b358-03a47a7adf8e'::uuid, '854ba64f-a7f5-5ed3-ab0e-e7b6888ac04f'::uuid),
  ('si-hubiera-sabido', false, false, true, 'c5456331-3bb1-50d1-8711-7a4dd2de638f'::uuid, '204758eb-092d-5f64-8c43-60ee5f2358b7'::uuid, 'facbdfe0-4dcb-55ed-a3cf-ac3b1d2fd2e5'::uuid),
  ('si-hubieramos-salido', true, true, true, '5320e8e1-79ec-55e3-b04a-d83fc9c5cb8a'::uuid, 'af2f9197-ad56-5b81-927a-73c52be45e79'::uuid, 'ba837103-3b29-5b06-bcde-ff0e4c9fd3ac'::uuid),
  ('por-un-lado', false, false, true, '2f53225f-035f-51f7-9eba-d85dcf6b121e'::uuid, 'a01b34dc-79de-5d14-88e9-133970a542d7'::uuid, 'bb80f2bb-f5e3-5dfe-8a0a-ac0da5b802cc'::uuid),
  ('la-ventaja-es-que', true, false, true, 'b9150863-0b35-5b23-8642-cc6193fad410'::uuid, '900a8fe1-c8f3-57f0-bdaf-44a40a215ebc'::uuid, 'cc111e05-c534-5cd6-bf2b-9e247ca6a458'::uuid),
  ('el-tramite', false, false, true, '52c4bb51-737e-5ee8-8a5c-9b75b1932884'::uuid, '8340a7ec-1463-5f26-bd5e-6597a42252a2'::uuid, '69a9c74e-5017-572b-9dac-ddef9f95d25e'::uuid),
  ('migraciones', true, false, true, '9eeeca51-b932-5bfe-804f-5328d2ae04fb'::uuid, '3470efe2-6bc3-51ee-b537-78259d1f59f0'::uuid, '2eb54708-22d8-525e-a57d-74375be4b724'::uuid),
  ('practica-migraciones', false, false, true, '18b3b839-e391-5478-81a7-1e1023c98766'::uuid, 'feb65d81-74ee-5cf7-9901-163cc610cad4'::uuid, '772f74aa-f3a3-58f3-a4ea-0b2ddacde616'::uuid),
  ('te-doy-la-razon', true, false, true, '37c77cfe-01c6-583a-b19c-63b790ad9a28'::uuid, 'a1799e76-0abb-50d8-8071-d01048daa1c5'::uuid, '1d2b0594-96a3-58c3-a656-af063aee3fd7'::uuid),
  ('que-opinas', false, true, true, '5a710e3b-bdb2-58c5-8ba3-8fcf7f206666'::uuid, '926fd153-4d23-5ddf-b9b6-3c09e4de4f34'::uuid, '62ccb18a-b37b-5f1b-895c-215a2ee9309a'::uuid),
  ('un-depto-que-tenga', true, false, true, 'b809f9d7-b638-5926-ab9f-716c69256b2a'::uuid, 'fd65d1e4-339e-589a-877a-22aa5b38e8c3'::uuid, 'f29cac05-3f85-5746-a265-b48e92472796'::uuid),
  ('conoces-a-alguien-que', false, false, true, '5b2385db-6bf8-508e-ad11-89dd2b2894b7'::uuid, '9fb1ca63-d719-5661-94e6-347612cd5273'::uuid, '9a7a85e7-6fe6-568e-bbd0-6d696f1181d2'::uuid),
  ('me-da-bronca', true, false, true, 'dbaf0b35-5f21-51ef-b77f-fa1a84119da4'::uuid, '03e42f08-a8cc-5956-bb23-ac6760d212a9'::uuid, '57a37fab-caa2-5fca-b066-9573a4d36f06'::uuid),
  ('me-pone-nervioso-que', false, true, true, '8593af51-cf19-5ce2-a419-371cfc655479'::uuid, '58cda238-95a3-511a-a9b7-d614d3ec3705'::uuid, '794171fe-5e0f-5a6a-86c2-a2438beec0ee'::uuid),
  ('deberias', true, false, true, '04cde585-3191-5933-9cbd-7c13253df9c6'::uuid, 'fc159a55-d7e2-5fee-8faa-f990b7bc3696'::uuid, 'f5266aa5-8baf-57a2-bb7f-7534710aec2d'::uuid),
  ('deberias-tomarte-unos-dias', false, false, true, 'ce56301f-063b-5438-952b-691f18dbda28'::uuid, '774a1928-9d58-5dc1-8779-8765d3cec3f7'::uuid, '084d380c-dddf-5919-a82f-f8ebdc173e5a'::uuid),
  ('practica-alguien-que-sepa', true, false, true, '2cb0077c-25dc-5613-a406-f070b028245a'::uuid, 'd6b0c841-521c-5554-89ce-4c09b72096cf'::uuid, '6f876b67-13f0-56ee-866f-9ae43fd7f34a'::uuid),
  ('dijo-que-vendria', false, true, true, '5b2bfca5-d1d1-57bd-85f1-7df5d82e46bd'::uuid, '6ec9ecac-c65e-5d17-85ab-7838bfd67d4e'::uuid, '9195f804-f8be-5502-92c4-f5d4773ade4e'::uuid),
  ('dijo-que-pasaria', true, false, true, '91af303d-8b92-5ad2-adf1-75b742ff8ce1'::uuid, '384ac7b5-0de5-528e-ac29-989f21858ef9'::uuid, '85b91de4-b33c-53b5-a99e-11d3f14b6016'::uuid),
  ('a-menos-que', false, false, true, 'ef0402bf-a9ca-5ef5-b9ad-55bf7d4f422b'::uuid, '928c725d-c276-522c-83ed-4e78df963a07'::uuid, 'aa7a5c5b-63ac-55fb-a071-15665e429359'::uuid),
  ('con-tal-de-que', true, false, true, '047d7486-a77b-59f2-9044-67fb508ea1cc'::uuid, '7db94ebf-e63f-56a6-983d-46bacbb3c693'::uuid, 'f3eaed4b-e784-5bac-b68b-e19b7c65a529'::uuid),
  ('se-alquila', false, false, true, 'fdeb9e6b-1918-5b20-a81a-67fa701d686d'::uuid, '0b378861-efe4-53d7-9257-4df767ac9b38'::uuid, '43e2c9fd-83da-58b6-bcb9-037d4e625576'::uuid),
  ('se-aceptan-tarjetas', true, false, true, '48580b43-d617-5623-b6a3-d69c2262fc34'::uuid, '335ec5fd-b46f-5862-955a-ba921cc3b700'::uuid, '7f959ca9-e590-598c-a007-6cebd70b7b19'::uuid),
  ('practica-se-aceptan-tarjetas', false, false, true, 'ebdbf1ad-6c02-5508-9470-680a9ab31050'::uuid, '8035f3a9-ed4f-5d36-a178-d212e01b172d'::uuid, '675cf927-4b68-5087-8e0f-c142b5e0fed2'::uuid),
  ('todo-aumenta', true, false, true, '6e10f854-f1c9-503b-a68f-1f7452fcc2a2'::uuid, '59d25948-1443-5914-ae28-4c9a84ad2000'::uuid, '56e98970-ef55-5a49-9bda-cfec7d9053d7'::uuid),
  ('no-me-alcanza', false, true, true, 'd7e5d701-7489-59d3-81e4-71eedf908782'::uuid, '58bdb99b-3d59-5544-bf4c-9fc91bb97e0b'::uuid, '295a3143-f9a2-5278-a008-1baa04a9b9f1'::uuid),
  ('voy-entendiendo', false, false, true, 'acc1b89a-5a18-54f2-9697-a884e7169660'::uuid, 'c355cbb4-31a4-5ef9-bfaf-9c7a5f67153f'::uuid, '34bf8b19-518a-5430-ab6a-a26e67aa74b1'::uuid),
  ('ando-buscando', true, false, true, '76cdd9c9-755e-5e25-b0b1-3be01c936bba'::uuid, '996f1f7e-e142-5c62-865f-0de1497a148e'::uuid, '99cb4775-11f7-5812-87c5-f15e601ebdc4'::uuid),
  ('practica-no-lo-aguanto', true, false, true, 'ee6fa4aa-df0e-5234-a555-e7997fcc34a2'::uuid, 'c020fa65-9575-561b-bd8a-f0bb43f19f7f'::uuid, '2412cdcd-2b98-5ee0-bc8c-f06c21f9e152'::uuid),
  ('que-novedad', false, false, true, '95bdbb41-f0c8-5df1-aa1d-df1541eba3a6'::uuid, '13d33b81-68b7-5f83-a572-8cd098dab6c5'::uuid, '009c59c7-104b-56b9-b143-ee42341b0203'::uuid),
  ('ni-ahi', false, false, true, '567fe39a-9195-5699-8f11-cb4a24ff83d9'::uuid, '5a44e7a7-f183-5a6c-a8c4-a98d39989ae8'::uuid, '4a71ea13-b881-56d1-adb0-4b0389f7a188'::uuid),
  ('ese-chabon', true, false, true, '0f47cda0-f746-5ffb-87b7-5fbfe5fe55e2'::uuid, '67190af8-1924-5224-9978-ffce34689c7d'::uuid, '7c14a115-7c5e-58ad-8348-55e95d520742'::uuid),
  ('estoy-al-horno', true, false, true, 'bf8f0583-8d0d-57ec-9fce-077aabfe2fbe'::uuid, 'da0e4c0e-a6d3-5972-be17-3274514625e1'::uuid, '2ffa143c-0beb-57fe-bc52-f42f5f19c067'::uuid),
  ('puteadas', false, true, true, '66a3be24-064e-5a41-8abe-cdbf186ff93e'::uuid, '4b234591-5055-52a0-b8d3-f6bb95846efe'::uuid, 'afaf8ab4-f868-530c-a164-b408e84e2661'::uuid),
  ('me-estas-cargando', true, false, true, '54eb2f7e-2172-522f-b8bb-69761626e4ee'::uuid, '82731add-9a81-510e-9f64-9da7bfd93d73'::uuid, 'f301c92c-88de-5300-bb07-6dd9bec41928'::uuid),
  ('caiste', false, false, true, '09a9da82-6dd2-56d0-805b-0222e853370d'::uuid, 'e4e8314e-6a61-564c-8253-dfa2b382a4aa'::uuid, '2fcdc76b-18cf-5ad9-b1b0-660941246594'::uuid),
  ('me-pidio-que', true, false, true, 'ad7e5ec2-b183-525e-88f7-2170a69d286c'::uuid, '71476cf2-e075-559b-b81d-b784de003538'::uuid, '2c0999dc-1d65-54c7-8dc2-14a9b7eeee95'::uuid),
  ('me-encargo-que', false, false, true, '9a7e4c63-69fc-52c7-b4ee-c358f97cad4d'::uuid, 'afeee019-620d-5291-830f-6b1fe8e3ac3e'::uuid, '5d1d777b-9589-53c6-aa7f-8cfb1e78d74c'::uuid),
  ('me-pregunto-si', true, false, true, 'a44c101e-2ec4-5899-93ef-017e19284185'::uuid, '6c50d2ee-127e-570d-b4d3-52b1b4d61a83'::uuid, '6c993e3f-4382-5c4e-bc65-7149da23e049'::uuid),
  ('fijate-si-tienen', false, true, true, 'cb1e9bdf-b723-5399-adca-257e1067ffd9'::uuid, 'c5bae016-d9f6-58d3-96b1-1e734115bc2e'::uuid, '51a1093a-13f2-50f6-b7b0-e79616541bab'::uuid),
  ('practica-como-no', false, false, true, '8508fcfc-9952-5daa-827c-42061a96c038'::uuid, '02cfd538-2953-5114-97f3-f3e0a90d0762'::uuid, 'b50e4714-bd79-5fd9-903f-4ff19c546d9b'::uuid),
  ('cualquier-cosa-avisame', true, false, true, '6dabc05b-0be7-5aec-9a6a-ec4419f18385'::uuid, 'c6468c36-2bf3-5384-ae1c-d0fde4f7bbef'::uuid, '2e0ec634-ab59-5fce-adb3-a50084d02200'::uuid),
  ('te-reenvio-el-archivo', true, false, true, 'e382b9e6-1560-5836-8f0f-2b03ac02503c'::uuid, '2f6c21c3-b6e4-5b24-ae3e-f0142087870c'::uuid, '7f50cf08-f1a0-5d4d-9bc6-b038991f7c1d'::uuid),
  ('la-entrega', false, false, true, '87c0dbe3-f892-5abc-bc04-338c2c58cf57'::uuid, '0bbf7f5e-1e84-5e36-9c90-89c2b9ed0d9c'::uuid, '45ba21fe-ba38-5ab8-8a68-1e7ece618c22'::uuid),
  ('sobre-la-hora', true, false, true, '3ec37bd9-cca6-591d-a0bf-076d44d22eb8'::uuid, '41b119f5-0f47-5427-810c-f35ea52cf389'::uuid, '44383bf2-bb14-52c0-a4d0-0d3b6dd0fe87'::uuid),
  ('merezco-un-aumento', false, false, true, '93cf7420-b820-58d8-81d6-db22d8f4a21c'::uuid, '7102bd56-23e0-5c70-bd05-a4c4b669b9be'::uuid, 'f81d3b34-ad9a-5f54-8870-58300990dea4'::uuid),
  ('se-merece-el-ascenso', true, true, true, 'fde4f6ce-75b4-5d03-8e47-ca8bdce39e2f'::uuid, '78f466e4-b351-5540-a98d-9ea57263f31b'::uuid, '73b0f0ff-8eef-55de-a90c-7292028da785'::uuid),
  ('resulta-que', false, false, true, 'a017d219-9125-513c-91e1-2bbce12b3cca'::uuid, '0c04f496-6f22-5a97-9305-b7fa45fb5402'::uuid, 'c84b8fe2-bd88-510d-96f3-041df22006c3'::uuid),
  ('para-colmo', false, false, true, '14d00d19-aefe-5fcb-9d67-41109847b5c0'::uuid, 'e5db5dd9-6ff0-5f72-9932-077fc6528819'::uuid, '7d1da585-dae0-5af6-8b25-6450169956cc'::uuid),
  ('se-la-cree', true, false, true, '1e29b9f3-6f6c-55ea-9e8b-04120fa012ca'::uuid, 'fbb64872-d6ed-5b09-94ed-067020b83c7c'::uuid, '2759fe94-8889-5217-8552-e53f4e680d0b'::uuid),
  ('me-la-jugue', true, false, true, 'b3d05712-1d2c-5dfd-a724-4eaed334501f'::uuid, '1f2241fe-0acc-5763-bae5-6deb28fc7087'::uuid, 'd1546a83-6d94-5b6a-9a1d-8f10c7299e74'::uuid),
  ('practica-me-la-jugue', false, false, true, '96f890ee-4697-5348-b81e-b577601bfa04'::uuid, '4fd0aa95-76a9-526e-a13c-c039d95b29d8'::uuid, 'f6c5351a-8088-5f3d-9c8c-28ddba452e06'::uuid),
  ('cada-vez-mas', true, true, true, '003f51a2-65dd-5e7b-891b-ae3b29da823a'::uuid, 'cf80983c-fb84-5c1b-b28e-627182a6178c'::uuid, 'e90d84eb-13db-5ea5-a775-489ff61d7c26'::uuid),
  ('estas-cambiado', false, false, true, '3ad863d0-e353-5c8f-bf2f-28e2fd4742b5'::uuid, 'b4e5c9ed-2727-5df4-949b-b8f551fabf1b'::uuid, 'cfa7ebc5-ba59-54ac-bda5-c58b5eef324f'::uuid),
  ('estoy-podrido', true, false, true, '036f6496-355d-5d3f-b0a2-498b1784de88'::uuid, '93b399a4-a5fe-56ae-bdf9-3aa95647547c'::uuid, '3c9e1eb5-593f-5bb0-8caa-472ce162ab58'::uuid),
  ('me-pudri', false, false, true, '31347735-85b5-5da1-a208-38c48ac6e68f'::uuid, '239d3a3e-b4b5-5704-86b4-b8f57785ef3f'::uuid, '2689e7df-3f23-5e34-97ce-148445d4e808'::uuid),
  ('practica-me-pudri', true, false, true, '04a0b21c-90e6-5ee2-9360-26e76d4e1c0d'::uuid, '52de4769-1db1-5e89-a4be-e4850561435a'::uuid, '8b496a24-7df4-5de9-942c-073c260b0e21'::uuid),
  ('como-te-decia', false, false, true, '547b0304-2650-5f83-9b8e-3604b4b60d6e'::uuid, 'c49bf26a-bcf3-5423-a173-b701f1a57b4f'::uuid, 'd308f06f-7fac-5c52-89d9-2cfba643609d'::uuid),
  ('te-la-hago-corta', false, false, true, 'a0f557b3-0d06-5272-9250-b2d79a9a52f4'::uuid, '362abb75-d664-588d-a9de-27a62de7ebe0'::uuid, '580eeae1-e306-5d12-821a-3575a6f2a613'::uuid),
  ('hay-paro', true, true, true, '7f07f795-2a7f-5a60-a5a4-e5118ec0237f'::uuid, '95643cc7-f69e-557f-9de5-792a0e575b67'::uuid, '9194585b-eaad-5143-a394-9ddf2c68125d'::uuid),
  ('paro-docente', false, false, true, '626a432c-e5cf-5def-8305-e59d8a649c53'::uuid, '41dc4f4c-766f-5870-ba3a-0e73b22b7c1e'::uuid, '4723d8ce-53c8-5e19-abd1-08956babddd3'::uuid),
  ('fue-construido', true, true, true, '1873c89b-0c14-53d0-81c8-8fc42d855961'::uuid, '1eda6d06-fcda-550f-be5c-c2318cd28279'::uuid, '32233949-aaa4-57ab-8c01-bae36ae9f774'::uuid),
  ('fue-clausurado', false, false, true, 'b751cc5c-823a-51f3-a54f-f06ff441c295'::uuid, 'b8c33563-8ed3-5812-8abe-e42895b068d6'::uuid, 'ab3ef858-1394-5700-a436-f192c47bf3d2'::uuid),
  ('las-elecciones', true, true, true, '12ba754b-b5f0-51bb-856c-c54b6c93e385'::uuid, '1bf502ae-53d7-5226-a776-9551a0b99b74'::uuid, 'aac35d32-b209-5563-9936-d48e994b69c1'::uuid),
  ('el-cuarto-oscuro', false, false, true, 'ba739a11-4171-5e06-a460-685a8556bce7'::uuid, 'c27f5720-0824-566f-8a0c-c5e3c5874337'::uuid, 'ec36fb4a-e962-52a4-a453-c62d7120ac91'::uuid),
  ('practica-el-cuarto-oscuro', false, true, true, '6fd16193-6125-54c4-92d2-9ce98cebab64'::uuid, '5ed582b2-42c4-50fe-a2fa-d522ced378a7'::uuid, '1b61b002-fb71-584f-8ab2-fc05b567082c'::uuid),
  ('segun-el-diario', true, false, true, 'd3e714e1-900d-53ec-bfbd-ef0e7434f7ea'::uuid, 'a92517bd-cef8-5bde-9569-24c6d95f1829'::uuid, '814f9402-1fb6-5e8d-a9b0-83eb32d1f94d'::uuid),
  ('aparentemente', true, false, true, 'c6ef7205-5cda-56af-8b98-8bbfb8d38c06'::uuid, '7585f3cd-f35f-59f5-a936-7778b19aad0d'::uuid, '934a7355-082e-56ab-8388-d6ef443f2776'::uuid),
  ('practica-me-afanaron', false, false, true, 'bfa25363-8c06-56c0-b060-3f50a6d7cba6'::uuid, '6a89cdea-8114-5b81-ac0a-b88bf9e76e58'::uuid, '29b4fc75-9e04-5adc-b655-913ebd38a7ad'::uuid),
  ('el-tango', true, true, true, '4e750ca8-8dd2-5158-8ad2-8ef9f3f78645'::uuid, '6b51fd52-ffbf-56ed-a091-a66dc3d477b4'::uuid, '9ca89dcd-8ff3-535c-8101-2159729d7b6f'::uuid),
  ('tocas-la-guitarra', false, false, true, '8915a622-3902-5bd3-a825-3a12cef23ac8'::uuid, '597bff98-fcc0-57b4-90c8-99d7a0fab391'::uuid, 'feb5257c-492f-55a9-ae61-a5b67a7cfd61'::uuid),
  ('practica-la-parrillada', false, true, true, '5f50e0f1-aaad-57ed-bb74-7a1ee59b6a91'::uuid, '66158fd7-0926-5c0f-9aa3-b10ac9cf18ee'::uuid, '9b1081d7-fc7f-5c70-93f0-e9ca32339845'::uuid),
  ('lo-lindo-de-la-ciudad', true, false, true, '3423a8b0-2429-514b-a5c1-9ce82f6dd0ff'::uuid, '1e3a17ee-bc1f-5a2e-912e-4cc15e637115'::uuid, '5eb7ec01-7e25-5ac7-b19b-1b1455648708'::uuid),
  ('lo-bueno-de-vivir-aca', true, false, true, '0bd0dd8b-3df1-5acd-95a6-67ecfacc9883'::uuid, '6e797106-0e87-54c0-b9c9-4c9d0b46046f'::uuid, '3445464f-c9f7-5836-8e2d-2830344978af'::uuid),
  ('no-es-que', false, false, true, 'c19f496a-bfb6-52af-8ddd-906614d68faf'::uuid, '1b745c6e-f22d-5653-a58e-be00148a0bdd'::uuid, 'cfd99e89-e207-5f7d-95bb-d493c77d5ee5'::uuid),
  ('no-es-que-no-me-guste', false, false, true, '20aa1553-e024-52a7-9df5-7cc2fb91f1f5'::uuid, '34b485c3-e50e-56ba-ba67-454c3b3f2438'::uuid, '88f86408-b557-5dac-86b7-ef08dfca3582'::uuid),
  ('si-hubiera-ahorrado', true, false, true, '2ec30089-4006-5835-9037-540e8b5c32fb'::uuid, '14364d64-26a8-5685-90ce-83579ec727aa'::uuid, '9dd38ce9-19b2-524d-9101-f392c9ea41a1'::uuid),
  ('si-hubieras-estudiado', true, true, true, 'b20bfb96-a91f-5e83-bf53-2feba9c3488e'::uuid, 'a96dd400-e70d-5735-9610-a7c39cd4d441'::uuid, '6c6de59e-03bd-563b-bcb9-4770c6a2c9fa'::uuid),
  ('tendria-que-haber', false, false, true, 'bbb0f2dc-8fa1-591e-a9b6-fb8c5022c44a'::uuid, '914bdc56-5566-52d8-816b-00a26fb8068a'::uuid, 'c384e34d-666c-535c-94e7-672a638b4a5a'::uuid),
  ('me-hubiera-gustado', true, false, true, 'f0b285e0-59e8-592d-8eb1-f002b60adf47'::uuid, '3568bfa8-b37b-5a15-987a-42fd97504f39'::uuid, 'b9094396-dada-5c60-80be-d1484d88bf0d'::uuid),
  ('practica-me-hubiera-gustado', false, false, true, '62fdaa14-be65-5ad0-a600-19a91199de1b'::uuid, '582b1ad1-394f-5bc3-a55b-f72f1b74d446'::uuid, '4f0ab514-8558-5c5f-b09a-d6b14935016f'::uuid),
  ('lo-que-pasa-es-que', false, false, true, 'b88522ac-31bd-51d1-82b0-07df2980cbf8'::uuid, 'c7481e63-4c7d-5a6b-8bd6-e42fd64af05c'::uuid, '37d741cb-4ced-5333-8a44-21102a32f8ac'::uuid),
  ('lo-que-paso-fue-que', false, false, true, 'da847455-7a9e-5cfd-b93c-0c5331747242'::uuid, 'd1b009ae-0244-5406-a768-5d5a63710614'::uuid, '4a588202-1ed9-5bea-ba81-2dfccd60b8f2'::uuid),
  ('como-dice-el-dicho', true, true, true, '37ef3fca-a5e1-568c-9252-a3c492db8fac'::uuid, 'dd8a3ec8-de9c-52bf-9d04-64ffff26d5f6'::uuid, 'e699d76c-53a7-54a7-a044-99f935b9656c'::uuid),
  ('cada-loco-con-su-tema', true, false, true, '15146a7a-9ab4-53ea-8dda-26d1a347a2c8'::uuid, '7b1c83b2-b53a-5065-b56a-899ab29ca9d7'::uuid, '6ee264b7-3b33-5890-9ad6-402981f0fa00'::uuid),
  ('practica-cada-loco-con-su-tema', false, true, true, 'dee250da-8430-5e23-ae54-6555782cef39'::uuid, 'c54ce6f8-6f59-5150-a74b-10e7e9213889'::uuid, 'a8a4d63b-c436-561d-9825-8f8302266594'::uuid),
  ('me-hizo-reir', true, false, true, 'e03a962b-bb68-5d1f-8a05-917ef568cccb'::uuid, 'c84e2f35-505d-5d80-aad9-82f613e47061'::uuid, '8c299c2c-4a08-5a0b-b331-f8314f0d8343'::uuid),
  ('me-mori-de-risa', false, false, true, '74d0580f-7e33-5434-adff-2e6bd209846d'::uuid, '9cc7a240-a60e-5362-a151-c41b0c7d3789'::uuid, 'a7d14e54-82ff-5a42-814e-94680bc852ed'::uuid),
  ('cuanto-mas', true, false, true, '4b09d5c6-d222-5237-950c-2a295c5a6131'::uuid, 'e2d7b62e-7184-534e-936b-46dbe281b421'::uuid, 'b61b15a6-9c18-5465-a598-ebb2b361f38a'::uuid),
  ('cuanto-antes-lleguemos', false, false, true, '866c49a5-8aca-5bf9-97b1-92eec2e8d6d8'::uuid, '7ff6ec7b-09b2-5ad4-87f6-75189c2f41b2'::uuid, '5d7170e7-d8b1-51c7-ac8c-9b71cd503278'::uuid),
  ('practica-me-mori-de-risa', true, true, true, 'bfda7edb-0432-5726-833a-ba18e1b24d6d'::uuid, '651caff1-d4c4-5e49-b215-4dd1b88f73ad'::uuid, '15e738cd-884e-5957-98f7-064f1fe301c2'::uuid),
  ('sin-ofender', false, false, true, 'ea778c3c-7115-5cdb-83b4-61c49086bc6f'::uuid, '85741144-c416-5d00-8ac9-b31d01cad80a'::uuid, 'c7d2d619-c013-5baa-827b-49e9b6412e70'::uuid),
  ('no-te-lo-tomes-a-mal', false, false, true, '8715e558-1b12-55d0-90a8-8a9dc85b3703'::uuid, '3e30fd8e-b034-50d5-8dfa-8d0086c301e1'::uuid, '2fe626df-94c9-5c1e-8187-8ae960906529'::uuid),
  ('me-cayo-la-ficha', true, false, true, 'ede51655-66e9-5b93-9678-68e7109cfbfc'::uuid, 'c3e13453-196c-5a2c-8347-1333643d862a'::uuid, 'f1b5050a-df9e-5e52-9fa7-3a9304cd67c2'::uuid),
  ('me-hace-ruido', true, false, true, 'bb9b7dba-4347-5ee9-abae-771b8bcf4bf5'::uuid, 'dc00be59-720c-59b5-a79c-b31a21d7234e'::uuid, 'a6f68b25-933c-59a7-af6d-6d7d10bfd965'::uuid),
  ('practica-me-hace-ruido', false, false, true, '38e009a9-ae15-5681-8090-3a287ffb474c'::uuid, '0b107c65-9d9c-5a36-94a9-27ed3faab352'::uuid, '1fd1ff0e-8f94-5eb5-b008-1b3690a9ad72'::uuid),
  ('mis-abuelos-italianos', true, true, true, '675f88d3-1d4a-5608-bbb0-f7a136c5abc6'::uuid, 'a8d462e1-6aa4-5268-88a9-93f14d62ddec'::uuid, '2ae24589-49b0-5f53-aeb1-d75cc67fe753'::uuid),
  ('se-instalaron-en-la-boca', false, false, true, '8cd05c2c-3e31-59fd-943f-e624e8e1c71a'::uuid, 'b3bbf75d-e149-58ea-b6ec-1abf83e3e030'::uuid, 'df2d7f51-d37c-5925-a4f6-860d1edce9b0'::uuid),
  ('practica-se-instalaron', false, true, true, 'aa237f98-8324-57ea-ae14-05f892ab5d95'::uuid, 'e1e8fc3e-5db4-5872-a052-ee075ca4d71c'::uuid, '1a97dc0f-92d5-5c6e-9ee9-1e872255d664'::uuid),
  ('me-emocione', true, false, true, '854cfd08-dbe1-505b-ab12-e5b0d6dc9f67'::uuid, '03933dff-3c79-585f-a99c-d925c6b5a707'::uuid, '1422561c-d77a-574d-8c74-acd6e7a3b4b2'::uuid),
  ('se-emociono', true, false, true, 'df483aa8-1c76-59de-9051-7d0128c0c808'::uuid, 'f26f3602-2134-54c2-b4d3-7f224aec5a8a'::uuid, 'dc2282ec-1358-5510-9a1d-1ce35e56e8c6'::uuid),
  ('practica-se-emociono', false, false, true, 'd383ef00-83a3-5d0f-b4c7-8eef2cf0c8fb'::uuid, '8f3834bd-884c-58fe-9a6c-44bcfbad056f'::uuid, 'ab4e421d-4525-54c1-bb24-14206e162009'::uuid),
  ('gracias-por-todo', true, false, true, '51412665-adbb-5123-a57e-231a4e2205de'::uuid, '3de67c66-b8df-5c08-a394-f9e79fe691d2'::uuid, '5a6ce815-c2da-5d3d-b0a9-ed2f2238836d'::uuid),
  ('ya-sos-de-aca', false, false, true, '35f11b27-48c6-52a6-9422-0292ae4ac9f3'::uuid, '14fcd02d-1cee-5670-9110-a96088a19669'::uuid, 'e803f91c-3fde-56c3-b5b5-8dddbed58aab'::uuid);

-- Classes new to the road, or moved earlier in their unit: done already for
-- whoever is past them (below).
create temp table extras_fresh (lesson_id uuid primary key);

do $$
declare
  u record;
  k record;
  body uuid[];
  checks uuid[];
  seq uuid[];
  now_ids uuid[];
  now_ordinals int[];
  placed uuid[];
  keeper record;
  was_after int;
  m int;
  a int;
  b int;
  i int;
  top int;
begin
  for u in
    select un.id, ex.*
    from unit_extras ex
    join public.units un on un.slug = ex.slug
    where un.status = 'published'
      and exists (
        select 1 from public.lessons l
        where l.unit_id = un.id and l.status = 'published' and l.kind not in ('speak', 'slang', 'culture')
      )
  loop
    select coalesce(array_agg(id order by ordinal), '{}') into body
    from public.lessons
    where unit_id = u.id and status = 'published' and kind not in ('review', 'speak', 'slang', 'culture');
    select coalesce(array_agg(id order by ordinal), '{}') into checks
    from public.lessons where unit_id = u.id and status = 'published' and kind = 'review';
    m := coalesce(array_length(body, 1), 0);
    a := greatest(1, round(m / 3.0)::int);
    b := greatest(a, round(2 * m / 3.0)::int);

    placed := array[null, null, null]::uuid[];
    for k in
      select * from (values
        (1, 'slang', 'Slang', u.slang, u.slang_id, a),
        (2, 'culture', 'Culture', u.culture, u.culture_id, b),
        (3, 'speak', 'Speaking', u.speak, u.speak_id, m)
      ) as t(n, kind, title, wanted, new_id, after)
    loop
      -- The row to keep: the one on the road; failing that, one retired earlier.
      select l.id, l.status, l.ordinal into keeper
      from public.lessons l
      where l.unit_id = u.id and l.kind = k.kind
      order by (l.status = 'published') desc, (l.id = k.new_id) desc, l.ordinal
      limit 1;

      if k.wanted then
        if keeper.id is null then
          -- Below zero until the unit is renumbered: (unit_id, ordinal) is unique.
          insert into public.lessons (id, unit_id, ordinal, title_en, kind, status)
          values (k.new_id, u.id, -1000 - k.n, k.title, k.kind, 'published');
          insert into extras_fresh values (k.new_id) on conflict do nothing;
          placed[k.n] := k.new_id;
        else
          if keeper.status <> 'published' then
            update public.lessons set status = 'published', title_en = k.title where id = keeper.id;
            insert into extras_fresh values (keeper.id) on conflict do nothing;
          else
            select count(*) into was_after
            from public.lessons
            where unit_id = u.id and status = 'published' and ordinal < keeper.ordinal
              and kind not in ('review', 'speak', 'slang', 'culture');
            if k.after < was_after then
              insert into extras_fresh values (keeper.id) on conflict do nothing;
            end if;
            update public.lessons set title_en = k.title where id = keeper.id and title_en is distinct from k.title;
          end if;
          placed[k.n] := keeper.id;
        end if;
      end if;

      update public.lessons set status = 'retired'
      where unit_id = u.id and kind = k.kind and status = 'published' and id is distinct from placed[k.n];
    end loop;

    seq := body[1:a]
      || case when placed[1] is null then '{}'::uuid[] else array[placed[1]] end
      || body[a + 1:b]
      || case when placed[2] is null then '{}'::uuid[] else array[placed[2]] end
      || body[b + 1:m]
      || case when placed[3] is null then '{}'::uuid[] else array[placed[3]] end
      || checks;

    -- Retired and draft lessons low enough to collide go past the end.
    select greatest(31000, coalesce(max(ordinal), 0)) into top
    from public.lessons where unit_id = u.id and ordinal >= 1000;
    update public.lessons l set ordinal = top + p.n
    from (
      select id, row_number() over (order by ordinal) as n
      from public.lessons where unit_id = u.id and status <> 'published' and ordinal < 1000
    ) p
    where l.id = p.id;

    -- Already as planned: leave the unit's rows untouched.
    select coalesce(array_agg(id order by ordinal), '{}'), coalesce(array_agg(ordinal::int order by ordinal), '{}')
    into now_ids, now_ordinals
    from public.lessons where unit_id = u.id and status = 'published';
    continue when now_ids = seq and now_ordinals = (select coalesce(array_agg(g), '{}') from generate_series(1, coalesce(array_length(seq, 1), 0)) g);

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

-- Done already for whoever is past it, so nobody is sent back down the road:
-- a fresh class counts as done for a learner if it sits before the first of
-- the course's own lessons she hasn't finished (as in 20260930000003; the
-- hidden stories are nobody's to finish, so they don't hold the line).
with road as (
  select l.id, l.kind, row_number() over (order by s.ordinal, u.ordinal, l.ordinal) as pos
  from public.lessons l
  join public.units u on u.id = l.unit_id and u.status = 'published'
  join public.sections s on s.id = u.section_id and s.status = 'published'
  where l.status = 'published'
),
learners as (select distinct user_id from public.lesson_progress),
frontier as (
  select lr.user_id, (
    select min(r.pos) from road r
    where r.kind not in ('speak', 'slang', 'culture', 'story')
      and not exists (select 1 from public.lesson_progress p where p.user_id = lr.user_id and p.lesson_id = r.id)
  ) as pos
  from learners lr
)
insert into public.lesson_progress (user_id, lesson_id, score, attempts, passed, passed_by)
select f.user_id, r.id, null::smallint, 0::smallint, true, 'placement'
from frontier f
join road r on r.id in (select lesson_id from extras_fresh) and (f.pos is null or r.pos < f.pos)
on conflict (user_id, lesson_id) do nothing;

drop table unit_extras;
drop table extras_fresh;
