-- Practice before the next unit leans on it (docs/course/roadmap.md): every
-- unit of sections 4–9 gets two practice lessons between its teaching lessons
-- and its unit check (`practice: 2` in section-N.yaml; lessons.mjs plans them).
-- Lesson ids follow the ordinal, so the old last lesson — the unit check —
-- becomes a teaching or practice lesson and the check moves to the new end.
-- `npm run course:lessons -- <slug>` then rebuilds each unit's slots.

begin;

update public.lessons set kind = 'practice', title_en = 'Practice' where id = '18953cf0-33f1-52dc-ba99-4715dbd8cb27';  -- ayer-labure 9: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = 'b0819e6f-7ba2-5f64-b4a1-549f810eb159';  -- comi-y-sali 7: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '7eb7c404-7eee-58ad-a3c1-d90232ff3a0c';  -- fui-a-la-cancha 6: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '4db65264-f02b-5294-8ab4-f207caa2a032';  -- el-finde 7: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '7b6f7a40-3a4a-5619-a60a-aee61aa2d37d';  -- mas-alto-que 7: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '65b074a7-c467-5b69-a74f-ef678e6c9643';  -- me-duele 9: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '37348bf6-8fb8-5c5e-8c26-7cb971bc8f1d';  -- te-llamo 8: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = 'e493daac-248a-56a3-b382-01ab6ad5b399';  -- las-tareas 9: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '05b8efd6-369a-55c0-9f04-8576650e123f';  -- de-viaje 7: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '24449c9c-66b5-5586-96ba-68f400faaab7';  -- cuando-era-chico 6: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = 'a3ae1231-1bb9-5e91-9a0c-316d67d971c4';  -- siempre-jugabamos 5: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = 'be512035-bab4-5806-9c08-5684d8f3b0c6';  -- estaba-lloviendo 5: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '46510165-3d09-5e9e-9b8a-cb65046d0bd1';  -- en-el-restaurante 6: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '4c1cadd2-aec5-5b41-8810-90d04d4bdc87';  -- tipo-ocho 5: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = 'cee2c6dc-2915-5ea8-bede-d816d0b4e489';  -- las-fiestas 5: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = 'af934dc4-a7d8-5e27-96ba-9cb68987ba43';  -- me-puse-nervioso 6: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '1e610c91-b5ca-57a1-b50c-f437b613a767';  -- la-semana-que-viene 4: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = 'ced22105-4403-5814-8696-f7a428c69f97';  -- me-mude 6: review → practice
update public.lessons set kind = 'lesson', title_en = 'Lesson 6' where id = 'd50b67f9-a223-5539-9da9-87e6c0be10c5';  -- me-haces-un-favor 6: review → lesson
update public.lessons set kind = 'lesson', title_en = 'Lesson 5' where id = 'dd337569-dfbc-5d44-99b7-94f5f4b9332d';  -- hay-que 5: review → lesson
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '012c9fc3-3e7f-5c46-a94d-0b8076ecf306';  -- en-la-verduleria 7: review → practice
update public.lessons set kind = 'lesson', title_en = 'Lesson 6' where id = 'b2620035-d5f5-5cc3-bd68-f5b771b3f3e7';  -- el-celu 6: review → lesson
update public.lessons set kind = 'lesson', title_en = 'Lesson 5' where id = 'e97f6ae4-d30a-5bac-ae61-3ba7ccbc8938';  -- te-lo-devuelvo 5: review → lesson
update public.lessons set kind = 'lesson', title_en = 'Lesson 5' where id = 'c3ef472b-fade-5191-8d72-ac99b2fd063d';  -- laburo-nuevo 5: review → lesson
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '7b650abd-5c21-5368-a340-9d83318863de';  -- salir-con-alguien 5: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = 'fea9e5d8-7856-523e-9609-ab8eb5f7ca69';  -- donde-estara 4: review → practice
update public.lessons set kind = 'lesson', title_en = 'Lesson 5' where id = 'f1d1f10e-9e57-5880-aff6-9f29ad9fc944';  -- me-siento-mal 5: review → lesson
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '24bc3c5d-f4a6-52cc-a3c9-6d7f7fb5842e';  -- quiero-que-vengas 5: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '0535cddb-d1d6-5150-bf9d-9a2ebf58313d';  -- que-te-vaya-bien 4: review → practice
update public.lessons set kind = 'lesson', title_en = 'Lesson 5' where id = 'c70f4e78-0d73-5e1d-af1e-26533a6d33f2';  -- cuando-llegues 5: review → lesson
update public.lessons set kind = 'practice', title_en = 'Practice' where id = 'f3b14057-baf2-5a03-80fe-f6139266d0c7';  -- no-creo 5: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '80244e69-27d4-537b-af44-989e123990be';  -- no-te-preocupes 4: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '147e90a9-ce86-5c47-8a20-188f7e58f14f';  -- te-recomiendo 5: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '4445164f-eb35-50b7-9807-c0c12a9bfb19';  -- que-bueno 4: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '2e5b595c-b6c2-57df-9211-e5e025933cb9';  -- no-se 5: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '789020d1-5992-5fba-a99a-7f05520fd0b4';  -- lunfardo 4: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '6be83562-88c3-5921-9927-2b637bfc31fc';  -- yo-que-vos 4: review → practice
update public.lessons set kind = 'lesson', title_en = 'Lesson 4' where id = 'ce022c3d-9779-585e-8424-0574021ddd4d';  -- si-tuviera 4: review → lesson
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '086fd2b3-923e-5813-a8e6-692d82f80687';  -- me-gustaria 4: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '80fa7e45-9dcf-59c5-9fe1-03f554da8c08';  -- manejar-en-baires 6: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = 'a6dc6c23-04fd-54d4-a6fc-1e55879e4fa0';  -- en-cuotas 6: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '86e065f6-6ebe-5392-9841-580baccfd790';  -- dicen-que 5: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '4bab1c10-1c5f-5905-af63-b977008635e2';  -- buena-onda 5: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '8884e531-1d3f-5cd3-9e4d-458aad668da6';  -- donde-queda 3: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '0a65fc18-4fbd-527f-96bd-7a87f473b0a0';  -- me-pregunto 4: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '59ed1783-ef9c-5c50-8cdb-114faebce45d';  -- se-me-cayo 5: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '0a4e9471-76fe-5a83-abcf-533503a42367';  -- para-que 4: review → practice
update public.lessons set kind = 'practice', title_en = 'Practice' where id = '2af58932-a549-5a38-be9c-06fe61f5f13c';  -- ya-habia 5: review → practice
update public.lessons set kind = 'lesson', title_en = 'Lesson 5' where id = '3c31b176-db31-5fea-856a-05f742ba65b1';  -- el-partido 5: review → lesson
update public.lessons set kind = 'practice', title_en = 'Practice' where id = 'af0be2d5-a98c-5e07-bc05-28c25b9ae32b';  -- no-anda 4: review → practice
update public.lessons set kind = 'lesson', title_en = 'Lesson 3' where id = 'ce997e52-9bba-5467-bc5a-6b684aeeb98d';  -- de-acuerdo 3: review → lesson
update public.lessons set kind = 'lesson', title_en = 'Lesson 4' where id = '4a6ed9e3-90a1-559b-b6dd-c53fde3d3fdc';  -- el-cajero 4: review → lesson
update public.lessons set kind = 'lesson', title_en = 'Lesson 4' where id = '4374935e-293e-5a87-8148-999e5a0ebfda';  -- que-susto 4: review → lesson
update public.lessons set kind = 'practice', title_en = 'Practice' where id = 'b9831063-e0c3-572a-9481-5d7f06629a5b';  -- costumbres 4: review → practice

insert into public.lessons (id, unit_id, ordinal, title_en, kind, status) values
  ('e7681552-22bd-5470-a549-85630ab157d7', '2fa4826d-6276-5a6f-b7a5-e3c2e6dc4f2d', 10, 'Practice', 'practice', 'published'),
  ('3f1e586d-6ffd-509a-a1c5-a58e1610d24f', '2fa4826d-6276-5a6f-b7a5-e3c2e6dc4f2d', 11, 'Unit check', 'review', 'published'),
  ('11ccc516-966c-51cb-b3c5-b5eb9d990276', 'b60b2d1f-25dc-5ada-9b93-a0afe7bd9a37', 8, 'Practice', 'practice', 'published'),
  ('0b0c56c1-5e57-534c-b139-8f221a967f9c', 'b60b2d1f-25dc-5ada-9b93-a0afe7bd9a37', 9, 'Unit check', 'review', 'published'),
  ('36a285c4-082a-5a63-ae5e-86292b7c0e6f', 'e89d1870-c4d1-5692-923d-5e357ae8218e', 7, 'Practice', 'practice', 'published'),
  ('609b1123-9021-5d21-a072-9be74bf1360b', 'e89d1870-c4d1-5692-923d-5e357ae8218e', 8, 'Unit check', 'review', 'published'),
  ('94e08a36-a103-5dc8-bbc3-deef1351c20a', 'f42f6608-6d16-5d0a-bd3f-896cd5fb4d07', 8, 'Practice', 'practice', 'published'),
  ('cbb4fd35-fcc4-5bbe-a174-158e94cb8513', 'f42f6608-6d16-5d0a-bd3f-896cd5fb4d07', 9, 'Unit check', 'review', 'published'),
  ('af151f9f-25ff-5244-b6c5-0240e00cfb98', 'fd0afb5a-c86b-5339-b28f-31f5431f400a', 8, 'Practice', 'practice', 'published'),
  ('c6c993ec-17b2-5eb6-9d8a-5d2a2e7bfe66', 'fd0afb5a-c86b-5339-b28f-31f5431f400a', 9, 'Unit check', 'review', 'published'),
  ('15a492e2-78a5-59b2-9747-5781fe481a9c', '14b391bd-5db8-50a4-a988-428361e7752a', 10, 'Practice', 'practice', 'published'),
  ('ae2f969e-b091-5f5b-8982-30004bacc49a', '14b391bd-5db8-50a4-a988-428361e7752a', 11, 'Unit check', 'review', 'published'),
  ('0ab87afa-2279-54bd-8d79-f659c4244766', '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', 9, 'Practice', 'practice', 'published'),
  ('cc5abbec-ec33-53f1-a1c8-158cac4740cd', '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', 10, 'Unit check', 'review', 'published'),
  ('dccbc838-f97a-5c92-be40-fe06c24e2a3f', 'c72176ae-a8de-5a47-9b37-cf9bdf84de08', 10, 'Practice', 'practice', 'published'),
  ('92513632-31b3-5c9a-b872-6fe8470f5048', 'c72176ae-a8de-5a47-9b37-cf9bdf84de08', 11, 'Unit check', 'review', 'published'),
  ('7cf5f61c-8b51-599d-b6f6-02c15a54c356', '7c33a900-8b22-5a9e-a34e-7c274e6a21b0', 8, 'Practice', 'practice', 'published'),
  ('3407ed06-597c-5903-a4f1-7fb185396761', '7c33a900-8b22-5a9e-a34e-7c274e6a21b0', 9, 'Unit check', 'review', 'published'),
  ('7ffee0ab-95d9-5aa4-83eb-2602f1e4bf47', '07ff3e13-7b95-55ab-aab7-ac48151e0d8c', 5, 'Practice', 'practice', 'published'),
  ('b5a63186-4ced-509a-b59e-4ef2fa7c0de1', '07ff3e13-7b95-55ab-aab7-ac48151e0d8c', 6, 'Practice', 'practice', 'published'),
  ('327c0a8c-6853-5438-8e93-9c67b8138535', '8f8a4c97-4077-5352-b040-a22de57f1b7e', 7, 'Practice', 'practice', 'published'),
  ('53a43f66-5270-5aa8-83b0-47f0a334c486', '8f8a4c97-4077-5352-b040-a22de57f1b7e', 8, 'Unit check', 'review', 'published'),
  ('97cdf9f6-72be-557a-b3b9-ce78cb1d21bb', '38114afb-c035-5ae5-956f-723c4f408a0d', 6, 'Practice', 'practice', 'published'),
  ('7190c4f9-3889-582e-a4b2-360f68b3c925', '38114afb-c035-5ae5-956f-723c4f408a0d', 7, 'Unit check', 'review', 'published'),
  ('3b1f693c-5ef9-54d8-9556-767ab916e480', '520a3c73-f830-5ea8-bb7f-36b6b5a53614', 6, 'Practice', 'practice', 'published'),
  ('6a363c61-bc01-5b3c-9dcc-31851393202a', '520a3c73-f830-5ea8-bb7f-36b6b5a53614', 7, 'Unit check', 'review', 'published'),
  ('9ca7541f-3b03-5efb-89e6-6b954c88854f', '28d6c921-dae2-50d2-b6a0-a5e2423428a6', 7, 'Practice', 'practice', 'published'),
  ('9109e02a-d924-5fee-90ce-998b08bedc69', '28d6c921-dae2-50d2-b6a0-a5e2423428a6', 8, 'Unit check', 'review', 'published'),
  ('3e17a53c-a60a-5283-aaff-978ce888e80d', 'f901adf3-4ac4-5208-8cac-9261ab754144', 6, 'Practice', 'practice', 'published'),
  ('b1112117-e873-5e94-a7c4-527e17759353', 'f901adf3-4ac4-5208-8cac-9261ab754144', 7, 'Unit check', 'review', 'published'),
  ('040bb626-f914-5cbf-920e-e4a6dd6c43fa', '364e1a73-f26c-5d78-9757-4d096939ebda', 6, 'Practice', 'practice', 'published'),
  ('5ed1aab3-5339-5de6-bb05-67beaf308e25', '364e1a73-f26c-5d78-9757-4d096939ebda', 7, 'Unit check', 'review', 'published'),
  ('39906684-1b5e-5302-8c5f-36de12c6ddc3', 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', 7, 'Practice', 'practice', 'published'),
  ('218743bc-71b7-5b7a-8d27-2dbd247cae63', 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', 8, 'Unit check', 'review', 'published'),
  ('d9d9e10b-e17e-5823-bcf3-4c883eca2a14', '2902c53a-0143-5823-b423-fd9fe3dc2295', 5, 'Practice', 'practice', 'published'),
  ('1d33414c-e435-54f6-b7f0-cec4bfbeee23', '2902c53a-0143-5823-b423-fd9fe3dc2295', 6, 'Unit check', 'review', 'published'),
  ('a6d53630-ae4f-576c-96bb-742546bd70dc', 'f2432d21-cbd5-5f7f-aec5-c958b3d7f626', 7, 'Practice', 'practice', 'published'),
  ('72c08dce-fa77-5188-9092-535cde8ff99c', 'f2432d21-cbd5-5f7f-aec5-c958b3d7f626', 8, 'Unit check', 'review', 'published'),
  ('47004f44-c5c1-54a5-8b10-bbf40431da34', 'b2e41f0e-04f0-5a3b-94eb-850cd2d57575', 4, 'Practice', 'practice', 'published'),
  ('d4d9cb97-a4b5-5ac1-808b-ce0daf94682a', 'b2e41f0e-04f0-5a3b-94eb-850cd2d57575', 5, 'Practice', 'practice', 'published'),
  ('7a649f35-ece5-568d-bf0b-724beab3f402', 'dc485e04-124e-516d-9061-98a2d00f4d57', 7, 'Practice', 'practice', 'published'),
  ('c82128d2-959b-5180-b20c-a2ae64c19ec5', 'dc485e04-124e-516d-9061-98a2d00f4d57', 8, 'Practice', 'practice', 'published'),
  ('b4da6d11-61ff-533d-b119-3d3159449b41', 'dc485e04-124e-516d-9061-98a2d00f4d57', 9, 'Unit check', 'review', 'published'),
  ('93dcd629-8365-5576-b1fa-156e66aa751b', 'afdaff40-37c8-56af-ae39-78f1ed48e97e', 6, 'Practice', 'practice', 'published'),
  ('c48abf82-f72b-5fa3-ac39-81575ea5e3b3', 'afdaff40-37c8-56af-ae39-78f1ed48e97e', 7, 'Practice', 'practice', 'published'),
  ('68d2f167-d214-5257-854b-89f36c707846', 'afdaff40-37c8-56af-ae39-78f1ed48e97e', 8, 'Unit check', 'review', 'published'),
  ('7de802d1-394e-5d3c-a45b-9ba36fe01ff3', 'e7976a3a-80b3-505d-abc8-858bd6a92a90', 8, 'Practice', 'practice', 'published'),
  ('5548b971-2422-5d12-8fe2-c947f8ac837b', 'e7976a3a-80b3-505d-abc8-858bd6a92a90', 9, 'Unit check', 'review', 'published'),
  ('65fc7d91-f8a1-5159-83f3-c983c81c1dbf', 'a921ed27-35b4-5222-9699-d8dd343c1f79', 7, 'Lesson 7', 'lesson', 'published'),
  ('1ef15b05-8261-5115-9f31-ffdb7a32ce3c', 'a921ed27-35b4-5222-9699-d8dd343c1f79', 8, 'Practice', 'practice', 'published'),
  ('fb4551ca-6726-5bf7-9835-490aed9b5e85', 'a921ed27-35b4-5222-9699-d8dd343c1f79', 9, 'Practice', 'practice', 'published'),
  ('146d3237-1c35-53ca-8c52-447b43559a6e', 'a921ed27-35b4-5222-9699-d8dd343c1f79', 10, 'Unit check', 'review', 'published'),
  ('6433f27d-4e93-53ac-8a8f-f92125740c52', '776b15fe-c6a5-5aae-8876-404d392e0546', 6, 'Lesson 6', 'lesson', 'published'),
  ('f64662ef-3ca3-5973-bcc6-699c8bd4902b', '776b15fe-c6a5-5aae-8876-404d392e0546', 7, 'Practice', 'practice', 'published'),
  ('3c93762c-07d2-558d-a826-3731a58cd9ca', '776b15fe-c6a5-5aae-8876-404d392e0546', 8, 'Practice', 'practice', 'published'),
  ('24f4103d-5fbd-5100-b9b6-bcfe0e26f2ed', '776b15fe-c6a5-5aae-8876-404d392e0546', 9, 'Unit check', 'review', 'published'),
  ('e9cf98e1-89e1-5bbd-bae6-56e73ce44e40', 'd585de30-5927-5cbf-a88a-fc998547f793', 6, 'Lesson 6', 'lesson', 'published'),
  ('52b32e7e-82a2-56a3-b521-003628d87a6f', 'd585de30-5927-5cbf-a88a-fc998547f793', 7, 'Practice', 'practice', 'published'),
  ('3ff3d2a7-9314-5eec-a95d-4f57b4cc3d45', 'd585de30-5927-5cbf-a88a-fc998547f793', 8, 'Practice', 'practice', 'published'),
  ('13f01921-b928-51c6-bb7d-0ee2ec84da48', 'd585de30-5927-5cbf-a88a-fc998547f793', 9, 'Unit check', 'review', 'published'),
  ('4c25daec-9a9b-5cb2-a2e3-1c264aa333ad', '770b6d5f-bd8c-5c17-a05f-4721faaa1706', 6, 'Practice', 'practice', 'published'),
  ('71afbdf6-ad5d-58a3-ac4c-501c43f572d4', '770b6d5f-bd8c-5c17-a05f-4721faaa1706', 7, 'Unit check', 'review', 'published'),
  ('7faaccf9-1823-5c8f-b486-cabf1766e1b9', '3dd370c2-01fe-54ba-95fc-3c5ef1637eb0', 5, 'Practice', 'practice', 'published'),
  ('52369e6b-5204-5268-bf18-364f8012bc5d', '3dd370c2-01fe-54ba-95fc-3c5ef1637eb0', 6, 'Unit check', 'review', 'published'),
  ('e8312547-adfa-5518-ac3a-e3a44576de14', '5ec6a727-4a91-5545-9e35-7f858d66ced1', 6, 'Practice', 'practice', 'published'),
  ('a3790806-3596-5f06-b013-fb55ce95b65e', '5ec6a727-4a91-5545-9e35-7f858d66ced1', 7, 'Practice', 'practice', 'published'),
  ('dda8dd49-10d2-5429-81b4-32af30a1155f', '5ec6a727-4a91-5545-9e35-7f858d66ced1', 8, 'Unit check', 'review', 'published'),
  ('81e1b99f-8e56-5329-a824-8bd7ecb3f9d8', '6ec21cf5-83ce-55f4-a07c-355a8fb995bb', 4, 'Checkpoint 4', 'checkpoint', 'published'),
  ('df49710b-f05a-5f49-9818-6fd206ff23a9', '6ec21cf5-83ce-55f4-a07c-355a8fb995bb', 5, 'Practice', 'practice', 'published'),
  ('df5485ae-f9db-59ef-ba7a-aaa8b94ff265', '6ec21cf5-83ce-55f4-a07c-355a8fb995bb', 6, 'Practice', 'practice', 'published'),
  ('56cd38e1-5e58-5aeb-b874-7850ab07141d', '74698b58-c87a-5870-a6dd-a6652b6da393', 6, 'Practice', 'practice', 'published'),
  ('1d70fa53-ddbb-52bf-b289-7df56b14363a', '74698b58-c87a-5870-a6dd-a6652b6da393', 7, 'Unit check', 'review', 'published'),
  ('b0690dae-ee57-5926-b77d-333149b6f56f', '186b6b78-c334-5c53-9675-d7e5ca16b5b4', 5, 'Practice', 'practice', 'published'),
  ('6368e771-317e-5e99-8c54-89f1a2724a2c', '186b6b78-c334-5c53-9675-d7e5ca16b5b4', 6, 'Unit check', 'review', 'published'),
  ('aef705cb-f2c6-5366-8638-92e5a57cb84c', '5f6c9abe-859a-5d19-853a-7dc6bcce9c99', 6, 'Lesson 6', 'lesson', 'published'),
  ('4f280b5b-f20d-58cd-9be0-fee784d4f34c', '5f6c9abe-859a-5d19-853a-7dc6bcce9c99', 7, 'Practice', 'practice', 'published'),
  ('2d88255d-4ef7-535e-b5f2-84f4b2bb470d', '5f6c9abe-859a-5d19-853a-7dc6bcce9c99', 8, 'Practice', 'practice', 'published'),
  ('fef7e7f1-b72e-5d15-8ed1-93255e53dcdc', '5f6c9abe-859a-5d19-853a-7dc6bcce9c99', 9, 'Unit check', 'review', 'published'),
  ('8b5e5faa-5fc8-5fed-89fc-101dfc1f14d4', '8c4c452e-c6f6-5f26-a9a5-ded2342f7c9f', 6, 'Practice', 'practice', 'published'),
  ('3642fc2c-334d-5e5b-94cf-3e4568bd4c09', '8c4c452e-c6f6-5f26-a9a5-ded2342f7c9f', 7, 'Unit check', 'review', 'published'),
  ('51fc8bd6-137f-5bd0-962a-c991c14b7ff8', '52c51646-b698-5749-ae7b-d554ab2e0240', 5, 'Practice', 'practice', 'published'),
  ('197b62be-9bdf-5d92-9275-adbf9480b9b6', '52c51646-b698-5749-ae7b-d554ab2e0240', 6, 'Unit check', 'review', 'published'),
  ('3dd66333-c503-5181-95af-ed3c4985713e', '063d369c-847e-57b8-8451-b9c4049a1d9e', 6, 'Practice', 'practice', 'published'),
  ('78aeea75-5125-5488-b3f2-d47a6e65492b', '063d369c-847e-57b8-8451-b9c4049a1d9e', 7, 'Unit check', 'review', 'published'),
  ('70bebaf4-b998-5a97-90ab-863b509b1c9c', '36b953db-b59d-5c37-8572-47afd0081c48', 5, 'Practice', 'practice', 'published'),
  ('cb387d29-83cb-5e8b-a3e2-6d20932ca189', '36b953db-b59d-5c37-8572-47afd0081c48', 6, 'Unit check', 'review', 'published'),
  ('3680dfaf-ec4d-569d-96f9-4a2ce2cc7d3c', 'e21ddcb1-102b-5c87-a018-55c861cdbe47', 6, 'Practice', 'practice', 'published'),
  ('822885c7-7746-5081-bdb9-3f81cd87a06d', 'e21ddcb1-102b-5c87-a018-55c861cdbe47', 7, 'Unit check', 'review', 'published'),
  ('07aa17aa-5dce-5fc4-b6e4-29f7836b1069', '39867eb4-c78d-5533-9fa6-0c4b2813b9c0', 5, 'Practice', 'practice', 'published'),
  ('1204dedc-18bc-5c35-aa5f-9343adb9f936', '39867eb4-c78d-5533-9fa6-0c4b2813b9c0', 6, 'Unit check', 'review', 'published'),
  ('d968160b-967f-5b56-a0d2-39510c007753', '20b6357e-6e5d-58e3-814d-c7acd27bedc2', 4, 'Practice', 'practice', 'published'),
  ('92031a71-9d11-5436-8d68-a4d24f633ec6', '20b6357e-6e5d-58e3-814d-c7acd27bedc2', 5, 'Practice', 'practice', 'published'),
  ('4dd63858-d357-5ee6-8cf6-13b947c2849e', '465d788e-db67-5a57-8f4e-96306374e29c', 5, 'Practice', 'practice', 'published'),
  ('2fa7de20-c164-5331-a216-14594ed496c8', '465d788e-db67-5a57-8f4e-96306374e29c', 6, 'Unit check', 'review', 'published'),
  ('797a74fd-6aa9-5d6e-b15a-550aa1cc6cd8', 'ce343377-a0c2-5201-9ff4-824789e73e89', 5, 'Practice', 'practice', 'published'),
  ('e9e72485-1d19-5e00-83ac-af3e3b8cf0b7', 'ce343377-a0c2-5201-9ff4-824789e73e89', 6, 'Practice', 'practice', 'published'),
  ('34c1ff0d-202d-5779-a894-db0213214cf7', 'ce343377-a0c2-5201-9ff4-824789e73e89', 7, 'Unit check', 'review', 'published'),
  ('036a0b77-d0b6-5b52-8056-ad6823cd1b21', '41b8c894-067c-540c-88b8-1a334f63f9e2', 5, 'Practice', 'practice', 'published'),
  ('4b005b92-64ea-5aa3-93a2-c47648337b74', '41b8c894-067c-540c-88b8-1a334f63f9e2', 6, 'Unit check', 'review', 'published'),
  ('55dc5387-e56b-52b3-afda-86a09741bb8f', 'a973933b-ccb4-5f7d-9210-9a063ab4ed00', 7, 'Practice', 'practice', 'published'),
  ('8961c6d5-171f-5559-b29a-781a26691fba', 'a973933b-ccb4-5f7d-9210-9a063ab4ed00', 8, 'Unit check', 'review', 'published'),
  ('2a578515-255b-5a32-bb02-1de2037784a0', '72e14160-96c0-535c-9819-8ab194bd82cc', 7, 'Practice', 'practice', 'published'),
  ('dcc737f7-3c0f-54df-965a-e4eb060997c7', '72e14160-96c0-535c-9819-8ab194bd82cc', 8, 'Unit check', 'review', 'published'),
  ('91f0ba16-53cc-5965-b102-77411f9cdb62', '2fb39a77-4405-52e0-83ee-a83f56d744ad', 6, 'Practice', 'practice', 'published'),
  ('8ae2e09a-663d-5142-a0ed-70065bc2ba45', '2fb39a77-4405-52e0-83ee-a83f56d744ad', 7, 'Unit check', 'review', 'published'),
  ('384e826b-b298-5a5a-b2c2-a334fc26a1b4', 'fa24b60d-3716-5754-bf36-9f5a6843d7bb', 6, 'Practice', 'practice', 'published'),
  ('1b84f981-0458-5d73-ad0d-2ef7afdfe71a', 'fa24b60d-3716-5754-bf36-9f5a6843d7bb', 7, 'Unit check', 'review', 'published'),
  ('459f20b9-064c-54c3-bfc7-f02822dffe82', '754cc69f-e7cf-5e64-ba22-2679bc1f609e', 4, 'Practice', 'practice', 'published'),
  ('f3ccd131-1795-575b-b709-91da74eeda86', '754cc69f-e7cf-5e64-ba22-2679bc1f609e', 5, 'Unit check', 'review', 'published'),
  ('140c933c-abd7-5011-a414-4dacd93dfefc', 'aa46af4e-1c1b-50ae-b8c1-03167cabaecc', 5, 'Practice', 'practice', 'published'),
  ('14352238-9614-597a-8048-b85ed65f4ecb', 'aa46af4e-1c1b-50ae-b8c1-03167cabaecc', 6, 'Unit check', 'review', 'published'),
  ('ca06def8-c968-55cc-b94e-4663cb515470', '02735212-fad9-5b44-97cb-061657aaad7f', 4, 'Practice', 'practice', 'published'),
  ('972c85a2-c831-5585-b179-9c97252fc95a', '02735212-fad9-5b44-97cb-061657aaad7f', 5, 'Practice', 'practice', 'published'),
  ('c5f43740-f908-5d40-942b-1a1c5e9dff6c', 'ae52684a-c28b-5318-92e0-5d1cc5ac5cf1', 6, 'Practice', 'practice', 'published'),
  ('0f1f5685-4f2e-5aae-b047-704582d7e1c8', 'ae52684a-c28b-5318-92e0-5d1cc5ac5cf1', 7, 'Unit check', 'review', 'published'),
  ('5887c923-0151-5f00-8c01-2c87b74d8257', '6dc81d68-66ed-5adc-a6d9-ebdfac00662e', 5, 'Practice', 'practice', 'published'),
  ('701071c8-11a6-5c06-b701-a299b28ebf0e', '6dc81d68-66ed-5adc-a6d9-ebdfac00662e', 6, 'Unit check', 'review', 'published'),
  ('0adb9077-99ac-53f3-8a37-6bf401b2d315', 'c640ea33-8098-56b9-85a3-15f539f2ece2', 6, 'Practice', 'practice', 'published'),
  ('785e8979-ecb9-56c5-bacd-5d0614fbd3ee', 'c640ea33-8098-56b9-85a3-15f539f2ece2', 7, 'Unit check', 'review', 'published'),
  ('b365bb25-d2ca-50a2-a5dd-ce88fc6e4b73', '7354baf3-9248-50f2-a9bc-c31acadd98fa', 6, 'Practice', 'practice', 'published'),
  ('774f2d5f-5677-5bf4-9e52-4c0462fe4010', '7354baf3-9248-50f2-a9bc-c31acadd98fa', 7, 'Practice', 'practice', 'published'),
  ('26cff940-3c7b-598d-b4a0-84db7393e4c5', '7354baf3-9248-50f2-a9bc-c31acadd98fa', 8, 'Unit check', 'review', 'published'),
  ('a73c66fc-3f16-5aea-9d67-7336b0a9e5e5', '98bdf26a-6fb0-57ec-80b0-092e57969285', 5, 'Practice', 'practice', 'published'),
  ('c3acdd50-81cd-5e64-9165-6c40735bd3e2', '98bdf26a-6fb0-57ec-80b0-092e57969285', 6, 'Unit check', 'review', 'published'),
  ('f647f30b-ff31-5455-9a8c-a60a10ea144e', '5fa3a1dc-bfbe-5b52-a8fb-880e0f0b7173', 4, 'Practice', 'practice', 'published'),
  ('d1e5ffad-c151-5cd7-8e63-f752587925a9', '5fa3a1dc-bfbe-5b52-a8fb-880e0f0b7173', 5, 'Practice', 'practice', 'published'),
  ('d1cc4397-8855-53c0-af7a-68ee9818e940', '5fa3a1dc-bfbe-5b52-a8fb-880e0f0b7173', 6, 'Unit check', 'review', 'published'),
  ('21477296-3af9-559f-a4a3-f5b8290db9e8', '577ff67b-76f7-513b-adca-5871bbb950dc', 5, 'Practice', 'practice', 'published'),
  ('a913bbb3-5360-5ec1-8120-fb29dd6a2bf8', '577ff67b-76f7-513b-adca-5871bbb950dc', 6, 'Practice', 'practice', 'published'),
  ('71c207d8-960b-57e2-901a-ac740d0cee53', '577ff67b-76f7-513b-adca-5871bbb950dc', 7, 'Unit check', 'review', 'published'),
  ('f2fc0ec4-5584-5cb3-8120-059eb2c71556', '20eecfc9-6b84-54ae-aedc-1c389863baf9', 5, 'Practice', 'practice', 'published'),
  ('e7d3bdeb-9945-5523-82de-eb7ee1b7d59b', '20eecfc9-6b84-54ae-aedc-1c389863baf9', 6, 'Practice', 'practice', 'published'),
  ('5d1291dd-19cc-50e3-818e-8ce39706c970', '20eecfc9-6b84-54ae-aedc-1c389863baf9', 7, 'Unit check', 'review', 'published'),
  ('7bdd77cc-6b65-5c01-9cec-0660ed6e1551', 'd7e9f660-01d8-5d0f-9136-9a85a20fc33b', 5, 'Practice', 'practice', 'published'),
  ('db90f627-a91c-579e-8736-c2ee7f02e686', 'd7e9f660-01d8-5d0f-9136-9a85a20fc33b', 6, 'Unit check', 'review', 'published'),
  ('6b6aa46e-4a47-55f2-a6f0-dab524763297', '0b94d24b-0ce7-5a34-a580-2ef059801e5e', 4, 'Checkpoint 4', 'checkpoint', 'published'),
  ('035bbe23-7100-5975-840f-b61c0d523908', '0b94d24b-0ce7-5a34-a580-2ef059801e5e', 5, 'Practice', 'practice', 'published'),
  ('62bce7aa-a664-56b2-947f-05cc019a9e8e', '0b94d24b-0ce7-5a34-a580-2ef059801e5e', 6, 'Practice', 'practice', 'published')
on conflict (id) do nothing;

commit;
