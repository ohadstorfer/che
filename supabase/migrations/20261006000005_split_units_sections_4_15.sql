-- ---------------------------------------------------------------------------
-- Units too big for the fixed shape are split (scripts/course/split-units.mjs,
-- from docs/course/splits.yaml): 76 units become 149.
-- The first part keeps the unit: its id, its lessons, what a learner did in it.
-- Each later part is a new unit right after it, with the words named for it,
-- the sentences that use those words (3225 move), and its tips.
-- 615 forms move. Nothing is deleted.
-- Then: course:sync-lessons (the new units' lessons), course:extras, course:lessons -- --all.
-- ---------------------------------------------------------------------------

create temporary table reorder_units (id uuid, section_id smallint, ordinal smallint, course_order smallint, old_order smallint) on commit drop;
insert into reorder_units values
  ('694523fc-5d19-5d81-8e08-6083c35d7d25'::uuid, 4, 3, 126, 125),
  ('5df117af-d5e0-5b71-8caa-6806c47bdff1'::uuid, 4, 4, 127, 126),
  ('59190ff0-c3f5-5d61-bd69-5db02edca9fd'::uuid, 4, 6, 129, 127),
  ('2fa4826d-6276-5a6f-b7a5-e3c2e6dc4f2d'::uuid, 4, 7, 130, 128),
  ('6575b91f-226c-5859-990c-345608df8e59'::uuid, 4, 9, 132, 129),
  ('b60b2d1f-25dc-5ada-9b93-a0afe7bd9a37'::uuid, 4, 11, 134, 130),
  ('de1b383d-ef2a-56ab-b9e0-5c76ea55a644'::uuid, 4, 13, 136, 131),
  ('e89d1870-c4d1-5692-923d-5e357ae8218e'::uuid, 4, 15, 138, 132),
  ('470a7647-d7f6-51fe-aa77-1f96cda7ef58'::uuid, 4, 17, 140, 133),
  ('c2f6a80b-fb62-5345-93bf-172376f29688'::uuid, 4, 19, 142, 134),
  ('f42f6608-6d16-5d0a-bd3f-896cd5fb4d07'::uuid, 4, 20, 143, 135),
  ('59418fb1-6973-57d9-a75d-e4e21f004b8f'::uuid, 4, 22, 145, 136),
  ('fd0afb5a-c86b-5339-b28f-31f5431f400a'::uuid, 4, 24, 147, 137),
  ('fa694c27-06c1-5cf3-b5c7-d369f495abbf'::uuid, 4, 25, 148, 138),
  ('14b391bd-5db8-50a4-a988-428361e7752a'::uuid, 4, 26, 149, 139),
  ('8a2211a4-bc2b-5df6-bfd3-ed761ce08c9a'::uuid, 4, 28, 151, 140),
  ('06235159-d29d-5425-954f-4a61a73fe1f4'::uuid, 4, 30, 153, 141),
  ('9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d'::uuid, 4, 31, 154, 142),
  ('77e7e28f-74ef-5a8f-b15f-5a5589d48684'::uuid, 4, 32, 155, 143),
  ('e21ddcb1-102b-5c87-a018-55c861cdbe47'::uuid, 4, 34, 157, 144),
  ('c72176ae-a8de-5a47-9b37-cf9bdf84de08'::uuid, 4, 35, 158, 145),
  ('51c29d65-4514-5131-bc0a-f7a48158b1db'::uuid, 4, 37, 160, 146),
  ('7c33a900-8b22-5a9e-a34e-7c274e6a21b0'::uuid, 4, 39, 162, 147),
  ('76cdfd4e-984e-51cf-b109-bac7fe371aa2'::uuid, 4, 41, 164, 148),
  ('4147926b-4f4c-5a4e-83c2-d3a82772d8e7'::uuid, 4, 43, 166, 149),
  ('89b3ea96-dbbd-5f0a-8651-0308bd27297d'::uuid, 5, 1, 167, 150),
  ('07ff3e13-7b95-55ab-aab7-ac48151e0d8c'::uuid, 5, 3, 169, 151),
  ('8f8a4c97-4077-5352-b040-a22de57f1b7e'::uuid, 5, 5, 171, 152),
  ('dae6ceff-5881-5f5c-a218-3a6317889caf'::uuid, 5, 6, 172, 153),
  ('38114afb-c035-5ae5-956f-723c4f408a0d'::uuid, 5, 8, 174, 154),
  ('018363b6-528d-5464-8f6a-575ede7fb4d4'::uuid, 5, 9, 175, 155),
  ('520a3c73-f830-5ea8-bb7f-36b6b5a53614'::uuid, 5, 11, 177, 156),
  ('a6cc868d-fbe9-5af4-94d5-1396172806b6'::uuid, 5, 12, 178, 157),
  ('3daf878e-35b0-55b7-8541-2ed16c89f822'::uuid, 5, 13, 179, 158),
  ('7354baf3-9248-50f2-a9bc-c31acadd98fa'::uuid, 5, 14, 180, 159),
  ('102a20da-507c-5cab-8d54-b9dc250aebb6'::uuid, 5, 15, 181, 160),
  ('78c71bbd-ead2-54c0-8b92-98f45101f849'::uuid, 5, 17, 183, 161),
  ('28d6c921-dae2-50d2-b6a0-a5e2423428a6'::uuid, 5, 19, 185, 162),
  ('42aaa1de-ab7b-5276-9032-91bff95ed818'::uuid, 5, 21, 187, 163),
  ('ccf7b1e1-a499-5013-99b2-4830d04fca71'::uuid, 5, 23, 189, 164),
  ('02841028-7fa9-5c47-9159-c4b47cc15cc1'::uuid, 5, 24, 190, 165),
  ('f901adf3-4ac4-5208-8cac-9261ab754144'::uuid, 5, 26, 192, 166),
  ('08e5edec-37ff-59c8-942b-b0fcd4fe251b'::uuid, 5, 27, 193, 167),
  ('364e1a73-f26c-5d78-9757-4d096939ebda'::uuid, 5, 29, 195, 168),
  ('9c4215a1-3276-5ea1-9982-970e15e17072'::uuid, 5, 30, 196, 169),
  ('3f5edc68-b41a-525a-8c80-1dd31a54500b'::uuid, 5, 31, 197, 170),
  ('a6c406c0-0103-5fcc-9871-5e1bc85a3833'::uuid, 5, 32, 198, 171),
  ('da8af0c4-83d8-570d-a76d-ba9f8a8d4161'::uuid, 5, 34, 200, 172),
  ('2902c53a-0143-5823-b423-fd9fe3dc2295'::uuid, 6, 1, 202, 173),
  ('6d5e1fa5-986d-5b45-a406-035e7c99c15c'::uuid, 6, 3, 204, 174),
  ('ad17a937-2fe2-519e-9f42-86f123c7e38c'::uuid, 6, 4, 205, 175),
  ('f2432d21-cbd5-5f7f-aec5-c958b3d7f626'::uuid, 6, 6, 207, 176),
  ('e4a7439f-a626-5e82-abaf-06bc10e30be8'::uuid, 6, 7, 208, 177),
  ('ab5b06cb-0463-5884-9c6f-bc21a5b345d8'::uuid, 6, 9, 210, 178),
  ('754cc69f-e7cf-5e64-ba22-2679bc1f609e'::uuid, 6, 10, 211, 179),
  ('4e77d43e-13ea-5b40-9c1e-dafbe4fd7210'::uuid, 6, 11, 212, 180),
  ('d738540e-3203-5d07-9f0f-01184e8346b0'::uuid, 6, 12, 213, 181),
  ('b2e41f0e-04f0-5a3b-94eb-850cd2d57575'::uuid, 6, 13, 214, 182),
  ('dc485e04-124e-516d-9061-98a2d00f4d57'::uuid, 6, 14, 215, 183),
  ('1bb1664d-4c74-5dfd-9001-ae7f0fd897f8'::uuid, 6, 15, 216, 184),
  ('35edaab3-b8c0-58db-8415-f52edb278a7e'::uuid, 6, 17, 218, 185),
  ('827ff70d-4671-51f6-a0aa-745cfebd058a'::uuid, 6, 18, 219, 186),
  ('c7b4cc13-41a1-57bf-b8f9-9c5a2ef4fb1b'::uuid, 6, 20, 221, 187),
  ('796fb7f5-7211-54d8-83dc-d15338978f46'::uuid, 6, 21, 222, 188),
  ('afdaff40-37c8-56af-ae39-78f1ed48e97e'::uuid, 6, 23, 224, 189),
  ('c0772c39-c5d2-5576-a853-6b67b734fca4'::uuid, 6, 24, 225, 190),
  ('53eebe4b-3a77-563a-84b1-b0ae2a42641c'::uuid, 6, 25, 226, 191),
  ('de1cac02-1435-56ef-9682-17ea2bc59bc4'::uuid, 6, 26, 227, 192),
  ('30394d47-559d-52eb-9c24-d6a8bbaeba36'::uuid, 6, 28, 229, 193),
  ('59c95af3-6785-5037-9294-f36861623e46'::uuid, 6, 29, 230, 194),
  ('e7976a3a-80b3-505d-abc8-858bd6a92a90'::uuid, 6, 31, 232, 195),
  ('3ea35fe7-87c2-5bc5-a138-ed2124298174'::uuid, 6, 32, 233, 196),
  ('3714140a-6ac1-56cd-a67b-a1c55a28970b'::uuid, 6, 34, 235, 197),
  ('a921ed27-35b4-5222-9699-d8dd343c1f79'::uuid, 7, 1, 236, 198),
  ('533e4252-0503-516b-9b3f-fcc7fad29ce1'::uuid, 7, 2, 237, 199),
  ('7768d3dd-52a9-55e1-be73-c2b2153fdb64'::uuid, 7, 3, 238, 200),
  ('e38a0b51-167e-583b-a179-5eafde3573f0'::uuid, 7, 4, 239, 201),
  ('776b15fe-c6a5-5aae-8876-404d392e0546'::uuid, 7, 6, 241, 202),
  ('c7ff7e62-3fed-5f39-9dbd-9ed081d41b0c'::uuid, 7, 7, 242, 203),
  ('d585de30-5927-5cbf-a88a-fc998547f793'::uuid, 7, 8, 243, 204),
  ('d674935a-006a-5328-9d83-767165ba5c5a'::uuid, 7, 9, 244, 205),
  ('3aec2726-7aa4-581b-ab9a-b36725c94e5c'::uuid, 7, 10, 245, 206),
  ('a973933b-ccb4-5f7d-9210-9a063ab4ed00'::uuid, 7, 11, 246, 207),
  ('ed66a36e-5a88-56f2-a2c7-3fdf72291b4e'::uuid, 7, 12, 247, 208),
  ('770b6d5f-bd8c-5c17-a05f-4721faaa1706'::uuid, 7, 14, 249, 209),
  ('672335a3-bca5-50a9-a61e-0d2d70bcd3c2'::uuid, 7, 15, 250, 210),
  ('48134c2e-dbea-5e66-9343-0b82457b9fc1'::uuid, 7, 17, 252, 211),
  ('22f748c4-e86a-57f2-8dfc-09a4885d1d24'::uuid, 7, 18, 253, 212),
  ('35da2974-7119-59d7-bdf3-d14bdf042064'::uuid, 7, 20, 255, 213),
  ('06821d8b-7d2f-5276-b374-2844bb3b99d6'::uuid, 7, 21, 256, 214),
  ('3dd370c2-01fe-54ba-95fc-3c5ef1637eb0'::uuid, 7, 22, 257, 215),
  ('5ec6a727-4a91-5545-9e35-7f858d66ced1'::uuid, 7, 24, 259, 216),
  ('1a2ffa4b-843c-5a51-a395-8402da85268f'::uuid, 7, 25, 260, 217),
  ('2dc6362b-360e-5e66-9d76-2c5e8662af80'::uuid, 7, 26, 261, 218),
  ('7a4e0aad-1065-50e6-bfec-a76b27e0ed9a'::uuid, 7, 27, 262, 219),
  ('6ec21cf5-83ce-55f4-a07c-355a8fb995bb'::uuid, 7, 28, 263, 220),
  ('fa24b60d-3716-5754-bf36-9f5a6843d7bb'::uuid, 7, 29, 264, 221),
  ('a56af3ac-cade-5ff7-bdce-38285c0c74e8'::uuid, 7, 30, 265, 222),
  ('5572cf90-36cf-55e2-824b-80f995d2d968'::uuid, 7, 32, 267, 223),
  ('da7656d3-0e9b-597b-ac1d-493e481b96f5'::uuid, 7, 33, 268, 224),
  ('74698b58-c87a-5870-a6dd-a6652b6da393'::uuid, 8, 1, 270, 225),
  ('26521f59-c2c1-5009-ac6b-a7a2e20a4244'::uuid, 8, 2, 271, 226),
  ('186b6b78-c334-5c53-9675-d7e5ca16b5b4'::uuid, 8, 3, 272, 227),
  ('1c051416-1a0d-564f-bb98-d523f047c49e'::uuid, 8, 4, 273, 228),
  ('5f6c9abe-859a-5d19-853a-7dc6bcce9c99'::uuid, 8, 5, 274, 229),
  ('54074d45-5916-5f81-b9e2-24977fe7b3b0'::uuid, 8, 6, 275, 230),
  ('f93505a1-733d-5810-85e8-c9d6ead98847'::uuid, 8, 7, 276, 231),
  ('8c4c452e-c6f6-5f26-a9a5-ded2342f7c9f'::uuid, 8, 8, 277, 232),
  ('5f67ad55-d966-5850-bf7c-244e5934bef7'::uuid, 8, 9, 278, 233),
  ('52c51646-b698-5749-ae7b-d554ab2e0240'::uuid, 8, 10, 279, 234),
  ('a52f663a-3fe2-5627-a250-4d1da0344831'::uuid, 8, 11, 280, 235),
  ('063d369c-847e-57b8-8451-b9c4049a1d9e'::uuid, 8, 12, 281, 236),
  ('d7a7375d-a258-5d7a-ae1c-44811ac8b58d'::uuid, 8, 13, 282, 237),
  ('ea336760-e828-5137-b3c0-b527db54dc8f'::uuid, 8, 14, 283, 238),
  ('36b953db-b59d-5c37-8572-47afd0081c48'::uuid, 8, 15, 284, 239),
  ('166d8cfb-d95b-581c-aaa6-c1689dc3d072'::uuid, 8, 16, 285, 240),
  ('644dde8f-bffc-57c9-b92e-ec8b078e378c'::uuid, 8, 17, 286, 241),
  ('39867eb4-c78d-5533-9fa6-0c4b2813b9c0'::uuid, 8, 18, 287, 242),
  ('41ef8c3c-f27f-547c-8272-9823215b809f'::uuid, 8, 19, 288, 243),
  ('c0b981e8-bc40-5a7f-a5cd-1aeb1aeedf2f'::uuid, 8, 20, 289, 244),
  ('7709eac2-d5bb-5169-aee7-0ed05c8b866e'::uuid, 8, 21, 290, 245),
  ('20b6357e-6e5d-58e3-814d-c7acd27bedc2'::uuid, 8, 22, 291, 246),
  ('465d788e-db67-5a57-8f4e-96306374e29c'::uuid, 9, 1, 292, 247),
  ('4090ef74-4ded-5132-9a43-cb791fd75c1f'::uuid, 9, 2, 293, 248),
  ('ce343377-a0c2-5201-9ff4-824789e73e89'::uuid, 9, 3, 294, 249),
  ('22657b95-75bd-59a7-a1f7-c21e5df3a6a5'::uuid, 9, 4, 295, 250),
  ('41b8c894-067c-540c-88b8-1a334f63f9e2'::uuid, 9, 5, 296, 251),
  ('7713400b-1007-558d-b717-ac7b02078eed'::uuid, 9, 6, 297, 252),
  ('f71fcde3-a7e0-5429-864a-cef0a28a9a3f'::uuid, 9, 7, 298, 253),
  ('e46f81c7-cdca-5d51-8738-55a0efa5a020'::uuid, 9, 8, 299, 254),
  ('54b42859-ce39-5f29-baa3-7a9aaff0d480'::uuid, 9, 10, 301, 255),
  ('72e14160-96c0-535c-9819-8ab194bd82cc'::uuid, 9, 11, 302, 256),
  ('97d7588e-37ef-5171-9640-6d51b0ac06ba'::uuid, 9, 12, 303, 257),
  ('2fb39a77-4405-52e0-83ee-a83f56d744ad'::uuid, 9, 13, 304, 258),
  ('4093ca08-4709-5a01-b09b-4fd1624d96cf'::uuid, 9, 14, 305, 259),
  ('949c47b5-e244-52bc-9153-03f632f3e5b8'::uuid, 9, 15, 306, 260),
  ('b27a8863-2d09-52bd-992f-2a73710c019d'::uuid, 9, 16, 307, 261),
  ('6aa47fcd-c4fb-5d93-9c82-3c5580df654a'::uuid, 9, 17, 308, 262),
  ('7f76ec46-2ddd-507d-8073-89a5df445d05'::uuid, 9, 19, 310, 263),
  ('654d7d9b-03de-5cfe-a0f2-0124a144bfcf'::uuid, 9, 20, 311, 264),
  ('aa46af4e-1c1b-50ae-b8c1-03167cabaecc'::uuid, 9, 22, 313, 265),
  ('ce25b1d0-ee42-5039-a068-263c69e918ce'::uuid, 9, 23, 314, 266),
  ('b2645ccd-6674-5c14-b607-432b9778545a'::uuid, 9, 24, 315, 267),
  ('ad8fbd77-4b75-55d5-9322-1d952fd8511c'::uuid, 9, 25, 316, 268),
  ('ae52684a-c28b-5318-92e0-5d1cc5ac5cf1'::uuid, 10, 1, 317, 269),
  ('cf3f5063-9758-597c-a509-2476bd48db2d'::uuid, 10, 2, 318, 270),
  ('6dc81d68-66ed-5adc-a6d9-ebdfac00662e'::uuid, 10, 3, 319, 271),
  ('e27cb9dd-52ff-5eed-8b6b-7f5680e6ae7f'::uuid, 10, 4, 320, 272),
  ('c640ea33-8098-56b9-85a3-15f539f2ece2'::uuid, 10, 6, 322, 273),
  ('24068540-4ffd-5c2c-86cb-1c89c0f669d6'::uuid, 10, 7, 323, 274),
  ('2fd57a10-eb7b-5c55-9f86-fd2716e2ed87'::uuid, 10, 8, 324, 275),
  ('98bdf26a-6fb0-57ec-80b0-092e57969285'::uuid, 10, 9, 325, 276),
  ('d7488f2f-ab30-530b-a0f2-9b26a8cb04ad'::uuid, 10, 10, 326, 277),
  ('0549fd4c-6be5-5e51-a1f6-4520eabebe83'::uuid, 10, 12, 328, 278),
  ('6a58e148-25f1-55f5-9568-c47c2c011c1e'::uuid, 10, 13, 329, 279),
  ('5fa3a1dc-bfbe-5b52-a8fb-880e0f0b7173'::uuid, 10, 14, 330, 280),
  ('35957a48-3965-592b-a5e7-2adfd23edfc0'::uuid, 10, 15, 331, 281),
  ('a5ca9719-6dfc-5ebe-8ce3-339422b185b5'::uuid, 10, 17, 333, 282),
  ('577ff67b-76f7-513b-adca-5871bbb950dc'::uuid, 10, 18, 334, 283),
  ('20eecfc9-6b84-54ae-aedc-1c389863baf9'::uuid, 10, 19, 335, 284),
  ('36036d7c-a216-5b60-a76c-a59bf988487b'::uuid, 10, 20, 336, 285),
  ('d7e9f660-01d8-5d0f-9136-9a85a20fc33b'::uuid, 10, 22, 338, 286),
  ('4cba4d7d-a414-57c7-9ed9-cbf8046345e2'::uuid, 10, 23, 339, 287),
  ('17f201ba-038f-5447-a92b-ea8274de3421'::uuid, 10, 24, 340, 288),
  ('a3c55aeb-a257-5eb2-ac90-fc258b138c7e'::uuid, 10, 25, 341, 289),
  ('4092e026-b5b7-5725-9f9e-564fc956c0e4'::uuid, 10, 26, 342, 290),
  ('7da0178d-42ee-5e98-aece-77ffbb45dd2d'::uuid, 10, 27, 343, 291),
  ('59b48665-2d47-587e-b406-84d2800c4161'::uuid, 11, 1, 345, 292),
  ('68cbb710-d119-5f34-a613-de8835c78c69'::uuid, 11, 2, 346, 293),
  ('21206ba6-6522-5849-be52-419e7d6d1007'::uuid, 11, 3, 347, 294),
  ('345642d1-7c5d-58fc-936d-78082196d9c0'::uuid, 11, 4, 348, 295),
  ('dd303fe0-52c5-5e61-97ae-1903616e625c'::uuid, 11, 5, 349, 296),
  ('558006ff-a18d-5fc9-ae98-edf66c5a28dc'::uuid, 11, 6, 350, 297),
  ('ea7df981-3c2b-53d4-96e1-cee2e5d5bd8e'::uuid, 11, 7, 351, 298),
  ('e31d82b3-e9e2-52bc-bd88-e52c7b53a764'::uuid, 11, 8, 352, 299),
  ('e3ba7db9-0794-5f78-95a6-dbd6a3e616be'::uuid, 11, 9, 353, 300),
  ('b3d7d4fe-8ba0-58f9-8d0e-38b9aaf3707f'::uuid, 11, 10, 354, 301),
  ('68c86280-614b-5223-b263-aed0f05b7b3c'::uuid, 11, 11, 355, 302),
  ('79cfb639-7996-5ed9-85ae-f73c0cf69e58'::uuid, 11, 12, 356, 303),
  ('aaafb4dd-18af-5b10-be4f-33a46f2cba0e'::uuid, 11, 13, 357, 304),
  ('d2d1e75f-f8c3-5507-9e3a-6019ac0c40a0'::uuid, 11, 14, 358, 305),
  ('9cd92c11-142e-5820-ac05-2ba0eb3f623c'::uuid, 11, 15, 359, 306),
  ('eedc812b-9def-5602-bd94-b8fc7ba8e7b6'::uuid, 11, 16, 360, 307),
  ('4a9c7846-0bb3-5a60-94df-2f6897d2a8dc'::uuid, 11, 17, 361, 308),
  ('4356c8d2-a33c-5a38-8b20-f4ac90387e6f'::uuid, 11, 18, 362, 309),
  ('c9686bb1-fe4a-58d4-b91f-601bade129fa'::uuid, 11, 20, 364, 310),
  ('1c8ca38f-494c-5a2e-bfa5-7e72e5d84a3e'::uuid, 11, 21, 365, 311),
  ('fc31544c-c615-5722-9494-5a728b6cf9be'::uuid, 12, 1, 366, 312),
  ('8ec0010d-66b0-5b69-aadb-eca273e4ae43'::uuid, 12, 2, 367, 313),
  ('731a6e56-3586-5647-a6ab-12df3dec98b6'::uuid, 12, 3, 368, 314),
  ('504b4319-d4ab-5b42-870b-fea27ef57652'::uuid, 12, 4, 369, 315),
  ('c1f2d5a6-e52b-5745-80dc-1ef79ac0846a'::uuid, 12, 6, 371, 316),
  ('0323848f-596e-579a-a7dd-1904e93c1f32'::uuid, 12, 7, 372, 317),
  ('73fd97d5-bdd1-55a6-889b-4ba0e1f184ca'::uuid, 12, 8, 373, 318),
  ('109ff419-4504-54fc-a4e6-0f7e45175049'::uuid, 12, 9, 374, 319),
  ('54b1d14e-7e6a-5640-a4f9-881b68a6d24f'::uuid, 12, 10, 375, 320),
  ('bcdc9d4e-84a9-5981-aa9d-14009abf363a'::uuid, 12, 11, 376, 321),
  ('c5abd659-9dd6-54e9-9e4f-6e906e375953'::uuid, 12, 12, 377, 322),
  ('74e55bc5-1757-5c97-bd67-5353fb4b592e'::uuid, 12, 13, 378, 323),
  ('80bd27a8-6356-5caa-9a38-661a03999602'::uuid, 12, 14, 379, 324),
  ('6c74bbe5-52cb-545d-bcf5-384fc0d1138b'::uuid, 12, 15, 380, 325),
  ('0e125e12-ab8c-5bfd-8a5d-6ae28790e249'::uuid, 12, 16, 381, 326),
  ('e0efacaf-93a3-521c-850d-fda4909c6796'::uuid, 12, 17, 382, 327),
  ('9f441bef-17a2-535a-a539-79a16389ad10'::uuid, 12, 18, 383, 328),
  ('4aaf79fa-f71f-5712-8a98-5facae7b4221'::uuid, 12, 20, 385, 329),
  ('cc075128-b483-5ba0-a24a-485bd1dc71fa'::uuid, 12, 22, 387, 330),
  ('08db04c7-6430-585e-8d87-f26f0376c7ad'::uuid, 12, 23, 388, 331),
  ('8a547039-7fc7-5382-9c3a-9b48a4102289'::uuid, 13, 1, 389, 332),
  ('06d1371f-27e8-5be1-a3df-a530cc9eefe3'::uuid, 13, 2, 390, 333),
  ('d8c13ac1-8ec0-5db3-adbe-39834eed0ff9'::uuid, 13, 3, 391, 334),
  ('c03bcd83-1ed7-5fb6-a4e9-dae2cd690f4b'::uuid, 13, 4, 392, 335),
  ('8615c579-1ee7-516d-8329-85243ee4db53'::uuid, 13, 5, 393, 336),
  ('68a6baaa-9e78-5479-aa65-63d51bc89b74'::uuid, 13, 6, 394, 337),
  ('38987042-d239-57ac-9bcf-58be792a8609'::uuid, 13, 7, 395, 338),
  ('e3884c35-d0b6-5d6d-9e7f-b4b1308c5981'::uuid, 13, 9, 397, 339),
  ('a9fb512f-6297-573c-8d34-be942749040d'::uuid, 13, 10, 398, 340),
  ('80d9fccd-c824-5946-8cce-04ecc42e570d'::uuid, 13, 12, 400, 341),
  ('112b1b4f-7388-538e-9734-dab36a241ad2'::uuid, 13, 13, 401, 342),
  ('9236841b-51b6-5a51-a400-9cf40915ec4e'::uuid, 13, 14, 402, 343),
  ('1e64d895-153a-5af6-b41e-45c6b9da78d4'::uuid, 13, 15, 403, 344),
  ('c64cedd2-5987-5859-b94d-77231e8c5eaa'::uuid, 13, 16, 404, 345),
  ('685c49ba-32f9-5e23-acab-d8552fdf4a20'::uuid, 13, 17, 405, 346),
  ('8fd78797-231c-5920-8d41-337bed37a7a9'::uuid, 13, 19, 407, 347),
  ('f89dd37e-bd2f-5d8b-baac-6f770fe4838c'::uuid, 13, 20, 408, 348),
  ('4f79112a-7e16-5786-a09f-c3f47eec42c1'::uuid, 13, 21, 409, 349),
  ('06acaaed-73cd-553d-a457-b534da4c99d0'::uuid, 13, 23, 411, 350),
  ('976c0600-48a2-5a5a-9ddb-85af02f42f69'::uuid, 13, 24, 412, 351),
  ('05427875-acf1-52fc-b7b9-15150a0edca2'::uuid, 13, 25, 413, 352),
  ('4619994d-18cb-57a3-aa86-ef5fd9551f1b'::uuid, 14, 1, 414, 353),
  ('00142c01-014f-53a8-b11d-1cf2bf832643'::uuid, 14, 2, 415, 354),
  ('f46f9df0-afdf-5c8c-95be-a4b002904a9d'::uuid, 14, 4, 417, 355),
  ('f02fa743-710e-5e6c-880b-e826a6c0056a'::uuid, 14, 5, 418, 356),
  ('38d68ef5-9223-5ff2-8954-88f3a9cc0ef3'::uuid, 14, 7, 420, 357),
  ('498e2179-7921-5c4c-8aa0-add0a77bf455'::uuid, 14, 9, 422, 358),
  ('d7836b8d-78b8-51ae-8e41-57e6f2d5de34'::uuid, 14, 10, 423, 359),
  ('e4860d3e-3ee3-5fc4-8b35-41209dd58a5e'::uuid, 14, 12, 425, 360),
  ('b612f887-6567-5b36-b3d8-71b680908d0e'::uuid, 14, 13, 426, 361),
  ('85347a66-3161-5a8d-9251-44225d44ad33'::uuid, 14, 14, 427, 362),
  ('013dc4ab-e838-53ac-ac0a-48d708431761'::uuid, 14, 15, 428, 363),
  ('c18ed3f6-ae4d-50fd-b360-6d7e7d73144c'::uuid, 14, 16, 429, 364),
  ('74a94584-d79a-55af-920c-e6fa1c59b5ad'::uuid, 14, 18, 431, 365),
  ('5c5f55d2-b389-5e93-94b9-3eb2897e1055'::uuid, 14, 19, 432, 366),
  ('d1ef9d43-816d-571d-a8ba-4ba76a09ba2d'::uuid, 14, 21, 434, 367),
  ('f925644a-c585-5773-8af3-f9a36c4cd2b0'::uuid, 14, 23, 436, 368),
  ('52f4c57b-461b-5689-bc83-625e8445b0b2'::uuid, 14, 24, 437, 369),
  ('8096e043-1d54-5521-ac96-7cdb39c6e872'::uuid, 14, 26, 439, 370),
  ('1a2a791f-b759-5930-8cdd-2829e879ce31'::uuid, 14, 27, 440, 371),
  ('28506229-594f-503e-80d4-5a3a1085320a'::uuid, 14, 28, 441, 372),
  ('4023fc2a-56e8-5980-bada-adc3306da091'::uuid, 15, 1, 443, 373),
  ('e3d036c1-9bf7-582a-8fdc-04202411acae'::uuid, 15, 2, 444, 374),
  ('aca6a7bd-05eb-5bcb-a0c0-02cd6ba77040'::uuid, 15, 3, 445, 375),
  ('24efab50-024b-519e-9029-d2d7f4a05a09'::uuid, 15, 4, 446, 376),
  ('31b7857e-57f3-5f7b-bcef-b36286ed3425'::uuid, 15, 5, 447, 377),
  ('1c04f11a-4feb-5b1d-956b-3661bab59c15'::uuid, 15, 7, 449, 378),
  ('d750cc27-0380-5a63-ae57-c94ac17315e5'::uuid, 15, 8, 450, 379),
  ('7957b305-bc76-56e8-b615-86768419c16d'::uuid, 15, 9, 451, 380),
  ('a36e5278-67e4-5dc0-b0ec-7e8440a51419'::uuid, 15, 10, 452, 381),
  ('58c98ce0-5227-5f11-bf08-49d656a7808b'::uuid, 15, 11, 453, 382),
  ('f1fe8414-a662-5131-9e76-a258572724ea'::uuid, 15, 12, 454, 383),
  ('d8bc6075-554e-5b94-9a5b-df5e1686741a'::uuid, 15, 13, 455, 384),
  ('512c0d0a-584d-5403-9bcf-d9c74d8ceb43'::uuid, 15, 14, 456, 385),
  ('cf4d6a07-a4c5-5761-9bad-5a84df508105'::uuid, 15, 15, 457, 386),
  ('0dacd2e3-2a45-5ad7-a13d-42f6b718c484'::uuid, 15, 16, 458, 387),
  ('7213df53-3f20-5649-8b69-0dacbe10f0d7'::uuid, 15, 18, 460, 388),
  ('a25229c0-af37-50d8-86db-83c809276632'::uuid, 15, 19, 461, 389),
  ('132415fc-1b04-527c-a000-1361223954c5'::uuid, 15, 20, 462, 390),
  ('5ebbe531-b8e4-58e6-9eb8-b9340f28458c'::uuid, 15, 21, 463, 391),
  ('6da6ead7-b546-54e5-b84f-a16a56ef3f2a'::uuid, 15, 22, 464, 392),
  ('c1be6404-2a36-51f7-8d0f-43b1a6d26250'::uuid, 15, 24, 466, 393);

-- Through a free range first: ordinals and course places are unique.
update public.units u set ordinal = 20000 + r.course_order, course_order = 20000 + r.course_order from reorder_units r where u.id = r.id;
update public.units u set section_id = r.section_id, ordinal = r.ordinal, course_order = r.course_order from reorder_units r where u.id = r.id;

-- A placement or jump test is remembered as a course place: the same unit's
-- new place, and for a unit that was split, its last part.
update public.profiles p set placed_through = coalesce((
  select m.course_order from (values
    (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10), (11, 11), (12, 12), (13, 13), (14, 14), (15, 15), (16, 16), (17, 17), (18, 18), (19, 19), (20, 20), (21, 21), (22, 22), (23, 23), (24, 24), (25, 25), (26, 26), (27, 27), (28, 28), (29, 29), (30, 30), (31, 31), (32, 32), (33, 33), (34, 34), (35, 35), (36, 36), (37, 37), (38, 38), (39, 39), (40, 40), (41, 41), (42, 42), (43, 43), (44, 44), (45, 45), (46, 46), (47, 47), (48, 48), (49, 49), (50, 50), (51, 51), (52, 52), (53, 53), (54, 54), (55, 55), (56, 56), (57, 57), (58, 58), (59, 59), (60, 60), (61, 61), (62, 62), (63, 63), (64, 64), (65, 65), (66, 66), (67, 67), (68, 68), (69, 69), (70, 70), (71, 71), (72, 72), (73, 73), (74, 74), (75, 75), (76, 76), (77, 77), (78, 78), (79, 79), (80, 80), (81, 81), (82, 82), (83, 83), (84, 84), (85, 85), (86, 86), (87, 87), (88, 88), (89, 89), (90, 90), (91, 91), (92, 92), (93, 93), (94, 94), (95, 95), (96, 96), (97, 97), (98, 98), (99, 99), (100, 100), (101, 101), (102, 102), (103, 103), (104, 104), (105, 105), (106, 106), (107, 107), (108, 108), (109, 109), (110, 110), (111, 111), (112, 112), (113, 113), (114, 114), (115, 115), (116, 116), (117, 117), (118, 118), (119, 119), (120, 120), (121, 121), (122, 122), (123, 123), (124, 125), (125, 126), (126, 128), (127, 129), (128, 131), (129, 133), (130, 135), (131, 137), (132, 139), (133, 141), (134, 142), (135, 144), (136, 146), (137, 147), (138, 148), (139, 150), (140, 152), (141, 153), (142, 154), (143, 156), (144, 157), (145, 159), (146, 161), (147, 163), (148, 165), (149, 166), (150, 168), (151, 170), (152, 171), (153, 173), (154, 174), (155, 176), (156, 177), (157, 178), (158, 179), (159, 180), (160, 182), (161, 184), (162, 186), (163, 188), (164, 189), (165, 191), (166, 192), (167, 194), (168, 195), (169, 196), (170, 197), (171, 199), (172, 201), (173, 203), (174, 204), (175, 206), (176, 207), (177, 209), (178, 210), (179, 211), (180, 212), (181, 213), (182, 214), (183, 215), (184, 217), (185, 218), (186, 220), (187, 221), (188, 223), (189, 224), (190, 225), (191, 226), (192, 228), (193, 229), (194, 231), (195, 232), (196, 234), (197, 235), (198, 236), (199, 237), (200, 238), (201, 240), (202, 241), (203, 242), (204, 243), (205, 244), (206, 245), (207, 246), (208, 248), (209, 249), (210, 251), (211, 252), (212, 254), (213, 255), (214, 256), (215, 258), (216, 259), (217, 260), (218, 261), (219, 262), (220, 263), (221, 264), (222, 266), (223, 267), (224, 269), (225, 270), (226, 271), (227, 272), (228, 273), (229, 274), (230, 275), (231, 276), (232, 277), (233, 278), (234, 279), (235, 280), (236, 281), (237, 282), (238, 283), (239, 284), (240, 285), (241, 286), (242, 287), (243, 288), (244, 289), (245, 290), (246, 291), (247, 292), (248, 293), (249, 294), (250, 295), (251, 296), (252, 297), (253, 298), (254, 300), (255, 301), (256, 302), (257, 303), (258, 304), (259, 305), (260, 306), (261, 307), (262, 309), (263, 310), (264, 312), (265, 313), (266, 314), (267, 315), (268, 316), (269, 317), (270, 318), (271, 319), (272, 321), (273, 322), (274, 323), (275, 324), (276, 325), (277, 327), (278, 328), (279, 329), (280, 330), (281, 332), (282, 333), (283, 334), (284, 335), (285, 337), (286, 338), (287, 339), (288, 340), (289, 341), (290, 342), (291, 344), (292, 345), (293, 346), (294, 347), (295, 348), (296, 349), (297, 350), (298, 351), (299, 352), (300, 353), (301, 354), (302, 355), (303, 356), (304, 357), (305, 358), (306, 359), (307, 360), (308, 361), (309, 363), (310, 364), (311, 365), (312, 366), (313, 367), (314, 368), (315, 370), (316, 371), (317, 372), (318, 373), (319, 374), (320, 375), (321, 376), (322, 377), (323, 378), (324, 379), (325, 380), (326, 381), (327, 382), (328, 384), (329, 386), (330, 387), (331, 388), (332, 389), (333, 390), (334, 391), (335, 392), (336, 393), (337, 394), (338, 396), (339, 397), (340, 399), (341, 400), (342, 401), (343, 402), (344, 403), (345, 404), (346, 406), (347, 407), (348, 408), (349, 410), (350, 411), (351, 412), (352, 413), (353, 414), (354, 416), (355, 417), (356, 419), (357, 421), (358, 422), (359, 424), (360, 425), (361, 426), (362, 427), (363, 428), (364, 430), (365, 431), (366, 433), (367, 435), (368, 436), (369, 438), (370, 439), (371, 440), (372, 442), (373, 443), (374, 444), (375, 445), (376, 446), (377, 448), (378, 449), (379, 450), (380, 451), (381, 452), (382, 453), (383, 454), (384, 455), (385, 456), (386, 457), (387, 459), (388, 460), (389, 461), (390, 462), (391, 463), (392, 465), (393, 466)
  ) as m (old_order, course_order)
  where m.old_order <= p.placed_through order by m.old_order desc limit 1
), 0)
where p.placed_through > 0;

-- The new units, in the places just made for them.
insert into public.units (id, section_id, ordinal, course_order, slug, title_en, summary_en, grammar_focus, register_max, review_form_ids, status) values
  ('c93cfb91-1999-5ddc-ae0a-d287aead0387', 4, 2, 125, 'feliz-cumple', 'Get ready for a birthday', 'Estoy organizando el cumple de Sofi', array['estar.gerundio', 'ir-a.infinitivo', 'la-semana-que-viene', 'registro.informal']::text[], 'informal', '{}'::uuid[], 'published'),
  ('970c94d1-9c0d-5331-af38-1e86500b3785', 4, 5, 128, 'que-llevo-al-asado', 'Say what you''re bringing to the asado', '¿Qué llevo al asado?', array['estar.gerundio', 'ir-a.infinitivo', 'la-semana-que-viene', 'registro.informal']::text[], 'lunfardo', '{}'::uuid[], 'published'),
  ('2f7aa645-511f-5d3e-a5be-60718073855b', 4, 8, 131, 'que-paso-anoche', 'Say when you got here and what happened', '¿Qué pasó anoche?', array['preterito.ar.singular', 'tiempo.ayer-anoche-pasado']::text[], 'informal', '{}'::uuid[], 'published'),
  ('7ab31e4d-0a0d-59ee-8ddd-37f134125559', 4, 10, 133, 'llegaron-tarde', 'Say what everyone did last night', 'Llegaron tarde y cocinó Juan', array['preterito.ar.singular', 'tiempo.ayer-anoche-pasado', 'preterito.ar.plural']::text[], 'informal', '{}'::uuid[], 'published'),
  ('4339fcb1-e369-5b13-b02e-5fc8aba66faa', 4, 12, 135, 'conoci-a-alguien', 'Say who you met and what you learned', 'Conocí a Sofi en Rosario', array['preterito.er-ir.singular', 'preterito.nosotros', 'recien']::text[], 'informal', '{}'::uuid[], 'published'),
  ('38d98dfc-861b-52c5-9860-6ebfdc84030c', 4, 14, 137, 'volvi-a-buenos-aires', 'Say who came back and what they learned', 'Volví a Buenos Aires', array['preterito.er-ir.singular', 'preterito.nosotros', 'recien', 'preterito.er-ir.plural']::text[], 'informal', '{}'::uuid[], 'published'),
  ('a02f1b80-0f65-5bff-b455-5fdb8fcf8b69', 4, 16, 139, 'como-estuvo', 'Say how it was and how long ago', '¿Cómo estuvo el recital?', array['preterito.ir-ser', 'preterito.estar-tener', 'como-te-fue']::text[], 'informal', '{}'::uuid[], 'published'),
  ('ac1ced97-0076-53e1-a86b-ae529417c1fe', 4, 18, 141, 'ganamos-el-partido', 'Say who won and who lost', 'Ganamos el partido', array['preterito.ir-ser', 'preterito.estar-tener', 'como-te-fue', 'pasarla']::text[], 'informal', '{}'::uuid[], 'published'),
  ('cfcde81a-b612-585f-b796-a507c7368e7f', 4, 21, 144, 'no-pude-ir', 'Say what you said and why you couldn''t make it', 'Dije que sí, pero al final no pude ir', array['preterito.hacer-ver-decir', 'preterito.venir-poder', 'relato.primero-entonces']::text[], 'informal', '{}'::uuid[], 'published'),
  ('db9cdddc-6247-5d4c-bc24-76ea6745586c', 4, 23, 146, 'no-pudieron', 'Say what people tried, said and couldn''t do', 'Quise ir, pero no pude', array['preterito.hacer-ver-decir', 'preterito.venir-poder', 'relato.primero-entonces', 'preterito.traer-querer']::text[], 'informal', '{}'::uuid[], 'published'),
  ('a5af608a-c55e-5cdb-924e-e84a5a480dbc', 4, 27, 150, 'saco-turno', 'Get help when you''re sick', 'Tengo fiebre y estoy engripado', array['doler.me-duele', 'cuerpo', 'salud.turno-guardia']::text[], 'informal', '{}'::uuid[], 'published'),
  ('210abf76-96da-5b9c-ab0a-08711b636352', 4, 29, 152, 'una-pastilla', 'Get something for it at the pharmacy', 'Tomé una pastilla para el resfrío', array['doler.me-duele', 'cuerpo', 'salud.turno-guardia', 'doler.me-dolio']::text[], 'informal', '{}'::uuid[], 'published'),
  ('84453bec-650d-5eca-aed2-53342b715463', 4, 33, 156, 'te-di-la-llave', 'Say what you gave, lent and showed', 'Te di la llave ayer', array['pronombres.objeto-directo', 'pronombres.objeto-indirecto', 'imperativo.vos.clitico', 'pronombres.preterito']::text[], 'informal', '{}'::uuid[], 'published'),
  ('640530cd-87e4-520c-878f-bbe49fba8b80', 4, 36, 159, 'limpio-y-ordeno', 'Say what you clean and tidy at home', 'Hoy limpio el baño y hago las compras', array['tareas.de-la-casa', 'me-toca']::text[], 'informal', '{}'::uuid[], 'published'),
  ('3162d1fe-1cae-5208-8e3c-6b43f92afa1a', 4, 38, 161, 'barri-y-planche', 'Talk about sweeping, ironing and the mess', 'Barrí la cocina con la escoba', array['tareas.de-la-casa', 'me-toca', 'preterito.tareas']::text[], 'informal', '{}'::uuid[], 'published'),
  ('47b6f982-414d-5137-99af-16c1bc6ab98a', 4, 40, 163, 'ida-y-vuelta', 'Buy your ticket for the trip', 'Un pasaje ida y vuelta, por favor', array['viajes', 'preterito.viajar']::text[], 'informal', '{}'::uuid[], 'published'),
  ('6f41c0fe-60e8-529e-b60e-534814ef5fa4', 4, 42, 165, 'paseamos-por-las-sierras', 'Tell about a trip to the hills and the countryside', 'Paseamos por las sierras', array['viajes', 'preterito.viajar', 'preterito.nosotros']::text[], 'informal', '{}'::uuid[], 'published'),
  ('644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b', 5, 2, 168, 'no-te-puedo-creer', 'React to someone''s story', '¡No te puedo creer! ¿En serio?', array['repaso.preterito', 'relato.conectores']::text[], 'informal', '{}'::uuid[], 'published'),
  ('5a553dfd-4003-54c5-9002-d04699ce22aa', 5, 4, 170, 'que-garron', 'Say if it was funny or a pain', '¡Qué garrón! Igual nos reímos un montón', array['repaso.preterito', 'relato.conectores']::text[], 'informal', '{}'::uuid[], 'published'),
  ('2f4c4edb-9f6b-5165-a6a0-30d33f4d6701', 5, 7, 173, 'en-esa-epoca', 'Say how life was back then', 'En esa época vivíamos todos juntos', array['imperfecto.ser-tener-vivir-ir', 'cuando', 'de-chico', 'imperfecto.plural']::text[], 'informal', '{}'::uuid[], 'published'),
  ('246ba33f-6f02-5d75-9dc2-8106eb2741e3', 5, 10, 176, 'jugaban-a-la-pelota', 'Say what kids used to play', 'Los pibes jugaban a la pelota en la plaza', array['imperfecto.regular', 'habitos.pasado', 'a-veces', 'antes-ahora']::text[], 'informal', '{}'::uuid[], 'published'),
  ('ee392b39-67ab-5776-a398-cd9c0cd89e32', 5, 16, 182, 'por-penales', 'Talk about the goals and the penalties', '¡El arquero atajó el penal!', array['deportes', 'preterito.ganar-perder', 'preterito.plural']::text[], 'informal', '{}'::uuid[], 'published'),
  ('f88d36ba-5cbd-50ac-9ddc-11361bed7829', 5, 18, 184, 'soy-socio-del-club', 'Talk about going to the stadium', 'Soy socia del club de toda la vida', array['futbol.hinchada', 'hinchar']::text[], 'informal', '{}'::uuid[], 'published'),
  ('02a059c1-fa00-5333-b357-ff42075fd5fe', 5, 20, 186, 'con-gas-o-sin-gas', 'Order drinks, share a dish and leave a tip', 'Un agua sin gas y un vino tinto, por favor', array['pedir.pres-pret', 'restaurante']::text[], 'informal', '{}'::uuid[], 'published'),
  ('81635abd-7a97-5ef3-bcdc-e189da206c40', 5, 22, 188, 'soy-vegetariana', 'Say what you can and can''t eat', 'Soy vegetariana. ¿La provoleta es picante?', array['pedir.pres-pret', 'restaurante']::text[], 'informal', '{}'::uuid[], 'published'),
  ('384ac86b-c136-5718-a7fb-c0ff8ed702bd', 5, 25, 191, 'bien-cocido', 'Say how you want it cooked', 'Bien cocido y con chimichurri, por favor', array['comida.parrilla']::text[], 'informal', '{}'::uuid[], 'published'),
  ('4e59b5b3-960b-5567-9961-d1d9db7bab8e', 5, 28, 194, 'confirmo-en-el-grupo', 'Set up a meeting and be on time', '¿Confirmás en el grupo? Y sean puntuales', array['encontrarse', 'avisar', 'tipo', 'tardar']::text[], 'informal', '{}'::uuid[], 'published'),
  ('26a9643e-948c-5e98-8425-f79e4b7a7a04', 5, 33, 199, 'me-dio-verguenza', 'Say what scared or embarrassed you', 'Me asusté y me dio mucha vergüenza', array['ponerse.pret', 'pronominales.pret']::text[], 'informal', '{}'::uuid[], 'published'),
  ('4eb79153-aa33-555b-9ae7-64893b72fd1c', 5, 35, 201, 'me-senti-re-mal', 'Say how it made you feel', 'Me sentí re mal y me puse colorada', array['ponerse.pret', 'pronominales.pret']::text[], 'informal', '{}'::uuid[], 'published'),
  ('0c101080-c7a6-5fc7-94b1-ef8cf29978c5', 6, 2, 203, 'algun-dia', 'Talk about plans for later on', 'Algún día me voy a mudar al sur', array['ir-a-infinitivo', 'pensar-tener-ganas', 'que-viene', 'voy-a-tener-que']::text[], 'informal', '{}'::uuid[], 'published'),
  ('55fe7979-1541-598d-af16-798fa8d54c6a', 6, 5, 206, 'la-cordillera', 'Describe the mountains and valleys', 'Hay nieve en la cordillera', array['viaje.argentina']::text[], 'informal', '{}'::uuid[], 'published'),
  ('b693c321-29bd-5b35-939f-d3c0e7563f9d', 6, 8, 209, 'el-contrato-de-alquiler', 'Deal with the rental paperwork', 'El contrato, el depósito y la garantía', array['mudarse.pret', 'extrañar', 'vecinos']::text[], 'informal', '{}'::uuid[], 'published'),
  ('48525155-fe71-5ae9-9765-59b334e7b26a', 6, 16, 217, 'me-regas-las-plantas', 'Ask someone to look after your place', '¿Me regás las plantas?', array['pedidos.me-pasas', 'condicional.podrias']::text[], 'informal', '{}'::uuid[], 'published'),
  ('ebc1fcfe-c54e-5b88-817e-a2b31ef1b182', 6, 19, 220, 'esta-calentito', 'Soften how and when with -ito', 'El café está calentito', array['diminutivo']::text[], 'informal', '{}'::uuid[], 'published'),
  ('a8ac41b7-330b-5382-8570-9842da64c60d', 6, 22, 223, 'no-se-olviden', 'Hurry a group along', 'Apúrense y no se olviden de nada', array['imperativo.ustedes', 'hospitalidad', 'imperativo.ustedes.negativo']::text[], 'informal', '{}'::uuid[], 'published'),
  ('e395759a-dbaa-5616-b61b-f18953a1efab', 6, 27, 228, 'la-precaria', 'Get your residency papers together', '¿Cuánto demora la precaria?', array['tramites', 'vencido']::text[], 'informal', '{}'::uuid[], 'published'),
  ('25c8daf3-d19e-5247-b76d-d24a3eeff7a8', 6, 30, 231, 'se-prohibe', 'Read what''s allowed and what''s not', 'No se permiten mascotas', array['se-pasiva', 'carteles']::text[], 'informal', '{}'::uuid[], 'published'),
  ('9dec35e1-a048-5b67-87a0-e936bf8e7e86', 6, 33, 234, 'estan-maduras', 'Buy fruit and vegetables at the feria', '¿Las paltas están maduras?', array['cantidades.kilo-docena', 'precio.cuanto-esta']::text[], 'informal', '{}'::uuid[], 'published'),
  ('f51f4b46-97c3-5fad-84a0-ee1f1be7194b', 7, 5, 240, 'me-estafaron', 'Say you got scammed', 'Me estafaron con un billete trucho', array['robar', 'seguridad']::text[], 'lunfardo', '{}'::uuid[], 'published'),
  ('69989cdd-e5b7-598a-a64d-5ebd14d824a6', 7, 13, 248, 'tenes-registro', 'Talk about crashes, fines and papers', '¿Tenés registro?', array['ciudad.transito', 'manejar']::text[], 'informal', '{}'::uuid[], 'published'),
  ('b14d8094-379f-5aa2-a965-be325d0ed1c1', 7, 16, 251, 'se-separaron', 'Talk about fights and break-ups', 'Se pelean todo el tiempo', array['relaciones', 'alguien-nadie', 'reciprocos.nos-peleamos']::text[], 'informal', '{}'::uuid[], 'published'),
  ('26d94980-1d61-5f48-98cf-710bf2083082', 7, 19, 254, 'es-insoportable', 'Say who you can''t stand', 'A mi cuñado no lo aguanto', array['caer-bien', 'llevarse', 'caer-bien.personas']::text[], 'informal', '{}'::uuid[], 'published'),
  ('721f018f-d12b-5bca-a357-d4801ad7c418', 7, 23, 258, 'capaz-a-lo-mejor', 'Make a guess', 'Capaz está en el laburo', array['futuro.conjetura', 'futuro.ser-estar-tener', 'futuro.irregulares']::text[], 'informal', '{}'::uuid[], 'published'),
  ('33439d32-5b7f-512a-a1b9-5a120bb5657c', 7, 31, 266, 'medio-agrandado', 'Describe someone''s quirks', 'Es macanudo, pero medio distraído', array['personalidad', 'ser-buena-onda']::text[], 'informal', '{}'::uuid[], 'published'),
  ('735dd55a-837f-5e16-b47f-e365c31146e9', 7, 34, 269, 'convidame-uno', 'Offer and share a mate', '¿Te convido un mate?', array['cultura.mate']::text[], 'informal', '{}'::uuid[], 'published'),
  ('718a023f-b694-530f-bc51-7f9655440ea2', 9, 9, 300, 'te-doy-una-mano', 'Offer an older neighbor a hand', 'Dejá, don José, te doy una mano', array['cortesia', 'imperativo.vos']::text[], 'informal', '{}'::uuid[], 'published'),
  ('4535637a-5874-5100-96b3-53834cfc40c6', 9, 18, 309, 'ya-no-es-lo-mismo', 'Say how the neighborhood changed', 'El barrio ya no es lo mismo', array['cambio.antes-ahora', 'cada-vez-mas']::text[], 'informal', '{}'::uuid[], 'published'),
  ('a087036f-18a5-5494-ab25-471c5a6dbdb7', 9, 21, 312, 'no-llego-a-fin-de-mes', 'Say the money doesn''t stretch', 'No llego a fin de mes', array['plata.inflacion', 'subir-bajar']::text[], 'informal', '{}'::uuid[], 'published'),
  ('3bacc45b-3c97-5202-9e1f-0ce034b2f3f1', 10, 5, 321, 'sin-que-se-escape', 'Warn a friend about the cat and the alarm', 'Cerrá sin que se escape el gato', array['subjuntivo.para-que', 'subjuntivo.antes-de-que', 'subjuntivo.sin-que']::text[], 'informal', '{}'::uuid[], 'published'),
  ('98d84c1e-a66b-5142-a19f-c466e738f085', 10, 11, 327, 'me-lo-podes-arreglar', 'Get something fixed', '¿Me lo podés arreglar?', array['quejas', 'andar.funcionar']::text[], 'informal', '{}'::uuid[], 'published'),
  ('3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3', 10, 16, 332, 'nada-que-ver', 'Disagree with a friend', 'Nada que ver, estás equivocado', array['acuerdo-desacuerdo', 'opinion']::text[], 'informal', '{}'::uuid[], 'published'),
  ('e372208c-dd62-5207-9c0b-afb1d03958c8', 10, 21, 337, 'me-pico-un-mosquito', 'Tell the story of a bug in the house', 'Grité, pegué un salto y la maté', array['miedo', 'relato.susto']::text[], 'informal', '{}'::uuid[], 'published'),
  ('c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b', 10, 28, 344, 'le-metio-los-cuernos', 'Tell who cheated on whom', 'Le metió los cuernos a escondidas', array['chisme', 'lo-que', 'repaso.b1']::text[], 'informal', '{}'::uuid[], 'published'),
  ('5dc775c3-bcd1-5435-86f2-b35bc56a96d2', 11, 19, 363, 'no-seas-cabeza-dura', 'Stand your ground in an argument', 'No seas cabeza dura', array['debate', 'repaso.b2']::text[], 'informal', '{}'::uuid[], 'published'),
  ('38f956d4-9a07-526c-988f-92fc1d00e486', 12, 5, 370, 'animate', 'Push a friend to face a problem', '¡Animate! Tenés que encarar el tema', array['deber.condicional', 'estaria-bueno', 'deber.condicional.personas']::text[], 'informal', '{}'::uuid[], 'published'),
  ('b9000e5f-e036-5865-a339-d473b7b47e36', 12, 19, 384, 'es-re-rata', 'Label people like the barrio does', 'Ese chabón es re rata', array['lunfardo', 'registro']::text[], 'lunfardo', '{}'::uuid[], 'published'),
  ('0566378c-49c7-5587-b615-3ca410b2b6de', 12, 21, 386, 'no-rompas', 'Understand the insults', '¡No rompas las bolas, pelotudo!', array['registro', 'puteadas']::text[], 'vulgar', '{}'::uuid[], 'published'),
  ('d6a21171-e193-5291-aa1b-0b50fd50bc0f', 13, 8, 396, 'alguna-duda', 'Follow up on a work email', 'Si tenés alguna duda, avisame', array['registro.escrito', 'mail']::text[], 'informal', '{}'::uuid[], 'published'),
  ('40956104-607c-5e0d-b967-446b478843e7', 13, 11, 399, 'postergaron-la-fecha', 'Move a deadline', 'Postergaron la fecha: entregamos el lunes', array['laburo.proyecto']::text[], 'informal', '{}'::uuid[], 'published'),
  ('48ea187a-3f2e-5b93-a8ec-1bec5b4926a6', 13, 18, 406, 'te-las-arreglas', 'Say how you cope, porteño style', 'Tranqui, vos te las arreglás solo', array['clitico.la-idiomatico', 'registro.informal']::text[], 'informal', '{}'::uuid[], 'published'),
  ('3615fe3b-41b9-55ea-a3ec-0232504bccf9', 13, 22, 410, 'siempre-reniego', 'Complain about what wears you down', 'Siempre reniego con el bondi: ¡qué estrés!', array['estar.harto', 'queja']::text[], 'informal', '{}'::uuid[], 'published'),
  ('6541e0d7-65ec-5bd1-8e0b-b56f654e875c', 14, 3, 416, 'con-normalidad', 'Find out what is still running', 'Levantaron el paro: todo funciona con normalidad', array['ciudad.paro', 'funcionar']::text[], 'informal', '{}'::uuid[], 'published'),
  ('7b211507-68d1-54e4-94d7-a59303701477', 14, 6, 419, 'hubo-un-incendio', 'Follow an emergency in the news', 'Los heridos fueron trasladados al hospital', array['voz-pasiva.ser', 'noticias']::text[], 'informal', '{}'::uuid[], 'published'),
  ('7c097208-fa5b-5234-94cf-6a12dbc2625c', 14, 8, 421, 'mi-candidata-gano', 'Follow the election results', 'Mi candidata ganó y ahora es presidenta', array['votar', 'politica.sin-politica']::text[], 'informal', '{}'::uuid[], 'published'),
  ('938640f0-639b-5230-971f-936f57632aa0', 14, 11, 424, 'rumor-o-verso', 'Tell a rumor from the real story', '¿Es verdad o es un rumor?', array['fuentes', 'rumor']::text[], 'informal', '{}'::uuid[], 'published'),
  ('182789d0-2599-55ab-8391-4d0c4eccd8e3', 14, 17, 430, 'tiene-sus-cosas', 'Weigh up life in the city', 'Buenos Aires tiene sus cosas, pero yo la quiero', array['lo.adjetivo', 'repaso.c1']::text[], 'informal', '{}'::uuid[], 'published'),
  ('4a02b83c-2619-593d-8fd6-44d5ffb8aa03', 14, 20, 433, 'gracias-por-invitarme', 'Turn down an invitation', 'Gracias por invitarme, pero la próxima voy', array['no-es-que.subjuntivo', 'es-que']::text[], 'informal', '{}'::uuid[], 'published'),
  ('869bb49b-d5fb-55dd-a7e4-f840be1b718f', 14, 22, 435, 'a-esta-altura', 'Say what would be true now', 'A esta altura ya estaríamos en Bariloche', array['condicional.mixto', 'pluscuamperfecto.subjuntivo']::text[], 'informal', '{}'::uuid[], 'published'),
  ('2813d7bf-8139-5e36-9d9f-22302486095d', 14, 25, 438, 'te-lo-perdiste', 'Talk about a missed chance', 'Dejé pasar la oportunidad', array['tendria-que-haber', 'arrepentirse']::text[], 'informal', '{}'::uuid[], 'published'),
  ('5b825335-3059-5af0-96da-761444a1c762', 14, 29, 442, 'lo-mio-lo-tuyo', 'Say what''s yours and what''s fair', 'Yo pago lo mío y vos lo tuyo', array['lo.nominalizacion']::text[], 'informal', '{}'::uuid[], 'published'),
  ('2ea0b499-ca22-51ca-b2ad-d83cb12dacc4', 15, 6, 448, 'me-hizo-sentir', 'Say what moved you to tears', '¿Lloraste con esa escena?', array['hacer.causativo', 'reirse']::text[], 'informal', '{}'::uuid[], 'published'),
  ('15f713ad-4869-53c5-a12a-cbdb4b67bfe2', 15, 17, 459, 'mis-raices', 'Trace your family''s roots', 'Mis abuelos eran gallegos y mantuvieron el idioma', array['historia.inmigracion']::text[], 'informal', '{}'::uuid[], 'published'),
  ('f69a6745-ce7f-5305-aab2-d98304a3b500', 15, 23, 465, 'que-andes-bien', 'Say goodbye like a porteño', 'Fue un placer: seguimos en contacto', array['despedida', 'repaso.c1']::text[], 'informal', '{}'::uuid[], 'published')
on conflict (id) do nothing;

-- el-cumple → el-cumple · feliz-cumple
update public.units set title_en = 'Say what you''re doing right now', summary_en = 'Estoy preparando la comida' where id = '43405ea2-1cec-5d90-bb61-d884ee8359bb';
update public.forms set unit_id = '43405ea2-1cec-5d90-bb61-d884ee8359bb', position = 3 where id = '783a3e6e-355a-5804-9a2b-4f9457646715'; -- cocinando
update public.forms set unit_id = '43405ea2-1cec-5d90-bb61-d884ee8359bb', position = 4 where id = '51c9d91a-d145-5679-89ea-7e9659112104'; -- jugando
update public.forms set unit_id = '43405ea2-1cec-5d90-bb61-d884ee8359bb', position = 5 where id = '2970ebef-0729-54a4-9f15-8e313c6ea633'; -- leyendo
update public.forms set unit_id = '43405ea2-1cec-5d90-bb61-d884ee8359bb', position = 6 where id = '4c766145-8837-5164-b7cd-e614e5ec4f10'; -- escribiendo
update public.forms set unit_id = '43405ea2-1cec-5d90-bb61-d884ee8359bb', position = 7 where id = 'c2ae69c8-3240-55dc-af67-99164e838e13'; -- durmiendo
update public.forms set unit_id = '43405ea2-1cec-5d90-bb61-d884ee8359bb', position = 8 where id = 'd6ea40f1-da00-55e5-9a16-330f87926b40'; -- hablando
update public.forms set unit_id = '43405ea2-1cec-5d90-bb61-d884ee8359bb', position = 9 where id = 'c67f417f-f5af-5269-bf26-87dc9ca781e5'; -- tele
update public.forms set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387', position = 1 where id = '08df0a9d-dba4-5b7c-a1f3-5de5dadfc24e'; -- cumpleaños
update public.forms set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387', position = 2 where id = '7b189100-f9ab-5fb8-87c6-db19bbc3d8a9'; -- cumple
update public.forms set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387', position = 3 where id = 'bc07b739-956a-54d6-b4fb-fece0fa006eb'; -- cumplo
update public.forms set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387', position = 4 where id = '4515fe0f-c9f2-5ed5-90a0-ba37afa9fe07'; -- cumplís
update public.forms set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387', position = 5 where id = '71edb428-87cd-57ba-9d7b-295e695cd837'; -- organizar
update public.forms set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387', position = 6 where id = 'e8edbf2d-ae2a-5707-8962-365b30eb70b1'; -- organizando
update public.forms set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387', position = 7 where id = 'b476e2c3-78dc-59cd-a9b2-8f78ba650df3'; -- invitado
update public.forms set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387', position = 8 where id = 'c9c3ed32-dfbb-5e9e-aae5-679137681097'; -- invitada
update public.forms set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387', position = 9 where id = '24158ace-91e1-5cdc-8e99-1b009cbf9838'; -- invitados
update public.forms set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387', position = 10 where id = 'e7bfaf01-f53c-5c5e-85e3-f63a2121fc30'; -- regalo
update public.forms set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387', position = 11 where id = '036a1e8e-f996-51da-90c8-2ec1f649f34e'; -- regalos
update public.forms set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387', position = 12 where id = 'a5d20439-95a9-517d-b0bb-d7ac2113430a'; -- plan
update public.forms set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387', position = 13 where id = '19bbbd0f-d14e-5d5b-9570-5b7f5f1f495e'; -- planes
update public.forms set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387', position = 14 where id = '5c3071cb-ad38-591d-a578-9e5e830a62f0'; -- pasado mañana
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'ae2fdeca-2c0b-57b1-80a4-6d6b671592a0';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '767b4823-92d5-501d-a034-3025a0d9e952';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'e77e859f-38fe-5218-8c15-94842e9f114e';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '7cb5563e-ed23-5fd3-8c81-f3437a6588aa';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '40fc6dad-cc76-56ad-925c-2d6b96c26489';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '7a0514b7-d840-55c9-9795-f673a5bd48c5';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '24893c70-a49c-556a-8e8d-362e1ede78cc';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '80179322-d6f5-5f0a-8c24-e753528016a2';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '4f80542f-ffee-58ad-adb9-9a27d0380222';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'bec73eec-fe93-5ac6-86a9-4ea244a301e0';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '4bc9acda-b6f8-5de7-9f94-3f6f7bf485e0';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '3b0b6ca5-8aee-5686-b3a0-f187bbc0816e';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '1de615db-ab2e-5d52-80c8-e712b7863748';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'caf3f96e-5f06-5dc2-9dce-062e88e083d2';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '741c0d05-3fca-536a-b37f-f8a41374112b';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '8d1d0ec5-3034-5951-a8f5-951960f9f01e';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '8e469a6c-467d-5c67-b53f-d9497b2328b2';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '8f4057fc-337d-5d11-b4b4-25f01f664948';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '9fc64e9f-dbab-5d33-a104-b50645d6ae54';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'c1902b80-2966-51af-a945-dd5c6ddb0eae';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'a0ad1d50-7ad1-5d29-8d2d-e2cd2e2c408b';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '6dadc52d-0c1d-58f5-b02c-471f4d4cf707';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '21c2e808-610a-5e84-96f3-a01671a7e05c';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '0c31deab-3b2c-5396-ac62-d3fbb7dae6ed';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '800729b7-626f-50e6-b5b4-195cce813fc9';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '442cb7f1-fef5-5676-ac50-36a1db2a66fe';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '88ee3a31-21a4-5a76-a683-74e9535afaea';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'f51d476b-9ee8-5183-a393-ea99d944708b';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '7f193351-4622-5547-93d8-2b9af7399aed';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '9e7554c3-fabf-5d77-9d8d-fbad3002a701';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '9971a410-2a38-5c3e-bd3c-08645044294f';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '69c72949-3a5e-504a-aab9-80c11477a75e';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '646cfda6-a73d-5757-9a69-11340f38723f';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'c89eca7d-1c7b-554a-b8f6-e4a218485404';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '586d2a80-4b37-551d-9adb-321d4325557e';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'c50feb95-28d3-5ad9-80e3-af7d7ae78263';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '1b8a16f5-6d67-5bd3-9a75-de931ac07cbc';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '058bc279-8f82-536f-aa75-4c64aff1ef24';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '9814ae7e-39c4-5182-863e-08cdd10b7600';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '53878728-d7c4-54e7-bf38-b1d4fb26a637';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'dde95dfd-0ce5-5b03-b28f-7edeb2679784';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'd94b3b2e-0cf9-5a3c-ba9f-0df3c9532a2e';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '246f34dd-a323-57a3-8da8-b50a35db0838';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'd079b3ac-dda0-5b33-9ee6-4bf75d9a44ed';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'aa318041-aaf7-569f-a0a0-631954a27fab';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'dffb842f-b617-5374-b522-45bdf8212116';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '2f9f820b-7a56-5129-8d2d-3bd2bfad96c9';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'a20656cc-c4ac-563f-9f91-95ad93f243cc';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '0d938614-481e-52cb-b0e5-34d322d47532';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '05ea18a9-c15f-52b6-bc37-0c656a9e8dc0';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '8bf9a52e-2cd3-559a-bc6e-73f2765a5e65';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'af94659b-e70c-56fa-9521-803e44a26161';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'ce117093-091b-564c-a3d3-9a8429627861';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'c336e781-254e-5e3b-94f3-834616ce5fda';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '2d4d1c0e-3378-5fe1-9e14-a9db8769d8de';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'b0798517-0043-58ca-a222-334f2658628c';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '8bcda3a8-870f-5353-af58-50301733ebcb';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '8d5c7b93-004f-5a92-8a88-ff95fd57f7c5';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'aebc9d24-29c0-5b7f-b384-7b9984a662f1';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'c3985829-c777-53e9-a199-4d7e6087327b';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '75717cc8-82e7-5480-84da-7140ae751512';
update public.sentences set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '3b7c92ea-ff2a-5918-a254-3316a8d30c1b';
update public.tips set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = '9bbe1671-a5b2-58f1-8923-ddd7c5e66973'; -- El cumple
update public.tips set unit_id = 'c93cfb91-1999-5ddc-ae0a-d287aead0387' where id = 'd848ca5a-83f6-5ef0-82e0-4395a0511149'; -- Voy a + verb

-- ahora-y-planes → ahora-y-planes · que-llevo-al-asado
update public.units set title_en = 'Make plans with friends', summary_en = '¿Venís a la juntada?' where id = '5df117af-d5e0-5b71-8caa-6806c47bdff1';
update public.forms set unit_id = '5df117af-d5e0-5b71-8caa-6806c47bdff1', position = 1 where id = '73583d11-89af-596d-9cbe-b51a9b585c28'; -- vengo
update public.forms set unit_id = '5df117af-d5e0-5b71-8caa-6806c47bdff1', position = 2 where id = 'ddd5ae60-b031-57ca-87cf-e43edc743f49'; -- venís
update public.forms set unit_id = '5df117af-d5e0-5b71-8caa-6806c47bdff1', position = 3 where id = 'f11f102a-9ca8-5dec-9993-b6e82f58f819'; -- viene
update public.forms set unit_id = '5df117af-d5e0-5b71-8caa-6806c47bdff1', position = 4 where id = '52062bb6-a496-5d71-8350-f815d639a8d7'; -- quedamos
update public.forms set unit_id = '5df117af-d5e0-5b71-8caa-6806c47bdff1', position = 5 where id = '01171912-d4de-56ab-b0cc-aea39d0603f0'; -- invitar
update public.forms set unit_id = '5df117af-d5e0-5b71-8caa-6806c47bdff1', position = 6 where id = '09c8b764-1aa6-5175-a2cf-00fcb378e1b0'; -- invito
update public.forms set unit_id = '5df117af-d5e0-5b71-8caa-6806c47bdff1', position = 7 where id = '76c99d99-9c20-5cfd-80a3-e965d15d3fa0'; -- juntada
update public.forms set unit_id = '5df117af-d5e0-5b71-8caa-6806c47bdff1', position = 8 where id = '88e0943f-927d-5c90-865e-1472f15e3f11'; -- asado
update public.forms set unit_id = '5df117af-d5e0-5b71-8caa-6806c47bdff1', position = 9 where id = '31f86311-f0c2-5d44-ba1b-ac84407224dc'; -- próximo
update public.forms set unit_id = '5df117af-d5e0-5b71-8caa-6806c47bdff1', position = 10 where id = '27105d20-e055-538d-b706-c4fb6012ff1c'; -- copado
update public.forms set unit_id = '5df117af-d5e0-5b71-8caa-6806c47bdff1', position = 11 where id = 'a89c09b1-bf2d-5d48-a6c0-825fd71dd2a2'; -- copada
update public.forms set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785', position = 1 where id = '9151df2a-a4c4-5215-9db6-616ca8b106bb'; -- llevar
update public.forms set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785', position = 2 where id = 'ef2b5fe8-1c05-5f5f-bb87-77466fb59db5'; -- llevo
update public.forms set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785', position = 3 where id = 'aefd6c07-fb77-5c5e-ae9e-30fe58c30dac'; -- llevá
update public.forms set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785', position = 4 where id = '05cb4f17-664b-50ec-8c1a-1987b99d353d'; -- traer
update public.forms set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785', position = 5 where id = '993ddb9d-01d8-5aff-81f5-6cfa17981999'; -- traigo
update public.forms set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785', position = 6 where id = '5d2d46e0-9bf4-5f91-a45a-e5bed80d3e08'; -- vino
update public.forms set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785', position = 7 where id = '8fec0864-7dac-51f4-80a7-28d29c377185'; -- viste
update public.forms set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785', position = 8 where id = '85827145-4d8a-59be-b421-80809ca99a03'; -- quilombo
update public.forms set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785', position = 9 where id = '0ea5de9c-4f7b-5579-ba7e-2cdcd1491329'; -- boludo
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '6933d9c5-5797-5cb7-b3e5-8b3967888027';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'e15aa0c4-25a0-5cc5-958b-e746a31a0898';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '289af9dc-e497-5e85-b46f-ed4b41dde206';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'f432cff7-8d2d-5322-bc76-ff1274fa620c';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '6eb2c5b5-2d2b-567c-9c74-e3df78edc0ff';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '7423f9d0-9477-5915-9542-b83ce2a78e45';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'bf2235b9-f07c-57a5-a9a2-d7e2925963a2';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'ba78eddc-2586-5e9a-88c9-48aeb6e0893d';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '870e38b1-7661-5ad5-bc65-65f2edeca76f';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'fa868dfb-d290-5b12-b81f-6f9e03c891ef';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'ab5f003f-e339-56c9-b5f5-44ecb4a32373';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'cb96a099-a48c-50ff-a4ad-eb1fbc2acaad';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '34583671-0249-50c8-ba26-7b4f1951127c';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '47625579-020c-5f3b-a3c8-28063fa720f5';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '7785d743-66cb-55cb-8105-c51f10236b90';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '6a4bb630-8afe-5f3a-8f4b-a1b4b846660c';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '77d2c515-4d47-5b18-8fcb-44c0ee3dc20d';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '26547d26-f055-581c-9928-fda720940183';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '29023746-62c2-54e3-bb92-574c4980769b';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '5cf17596-8933-51f2-9def-6cbccd557918';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '2371220e-6ea9-5171-b86f-34d83e6d5b51';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'f220ca17-f14d-5bbd-a3d3-07ca0239d1a6';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '95738d35-b6fa-559b-af5f-38250fd57f63';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '544274bc-4f41-534b-961b-85b614e36ad0';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'df1f6a57-cb1c-526d-8a68-54875bc70403';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '53aa738c-5505-566e-b60d-edaa55949f8d';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '45703077-8ac0-5a8d-bf50-056294bd6016';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '485ec68e-6ba2-5b11-9bd2-8d18bde75c54';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'e259250d-8e01-5392-98ff-5e2a803711be';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'b8de3631-aa1f-56e6-adb8-2b23eacf9807';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'c737e90f-9d29-546d-aecc-05e81e899d91';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '1cb3afcc-3ce2-5fde-acf4-29480b0ef01c';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'b18010ac-4f1d-5a64-953d-5acd6acdd6e0';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '250e2c35-7bdb-583c-87f0-92eae039e5c9';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '8b442f05-e583-5269-9989-903f23b7c3c5';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '08eb0c01-56f1-568b-8f3b-2bf2182ecdd8';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '4657ddb6-3831-5f39-b068-2e11eef7cbbb';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '56d0d122-69c4-5f1c-bc86-2386fa0cba24';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '5f26b888-8419-52a3-83e7-c93d4e804b7c';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '67ada6e2-7b8b-5922-bce0-4ac5316a9446';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'a12aadd0-aec2-58be-b28d-493d00bda8c3';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'e6a5cf3f-94e6-51ad-8d46-072804b44111';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'bd0f4ce1-28a9-525e-adfc-f4e82bb68bdf';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '85efe392-0f55-5452-ac31-760667af1459';
update public.sentences set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'b354341d-25a7-5d6a-bf25-ad7670664e99';
update public.tips set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = 'd5a4acc0-9d64-5970-8f68-5d4ed9936d96'; -- Llevar or traer
update public.tips set unit_id = '970c94d1-9c0d-5331-af38-1e86500b3785' where id = '01e1a3a8-575e-5121-9fc4-7dd8f47262c1'; -- Boludo and quilombo

-- ayer-labure → ayer-labure · que-paso-anoche
update public.forms set unit_id = '2fa4826d-6276-5a6f-b7a5-e3c2e6dc4f2d', position = 4 where id = '69aca2df-3fd3-5a0f-832e-67272c867fc5'; -- ayer
update public.forms set unit_id = '2fa4826d-6276-5a6f-b7a5-e3c2e6dc4f2d', position = 5 where id = '9f8ede2c-1d02-5219-a6fb-09242b9a0e2a'; -- estudié
update public.forms set unit_id = '2fa4826d-6276-5a6f-b7a5-e3c2e6dc4f2d', position = 6 where id = '643ab260-4b68-5aa7-b5d4-508d101eb8cc'; -- estudiaste
update public.forms set unit_id = '2fa4826d-6276-5a6f-b7a5-e3c2e6dc4f2d', position = 7 where id = '2312440d-bd50-50e0-b34b-39633fc0bf35'; -- estudió
update public.forms set unit_id = '2fa4826d-6276-5a6f-b7a5-e3c2e6dc4f2d', position = 8 where id = '55cfb02c-5297-5f38-8724-e08ae46a69f4'; -- hablé
update public.forms set unit_id = '2fa4826d-6276-5a6f-b7a5-e3c2e6dc4f2d', position = 9 where id = '48a19f37-bf47-5f3d-853f-2dabc2414c5c'; -- hablaste
update public.forms set unit_id = '2fa4826d-6276-5a6f-b7a5-e3c2e6dc4f2d', position = 10 where id = 'de39ed61-a701-5390-8373-f7deb024180a'; -- habló
update public.forms set unit_id = '2fa4826d-6276-5a6f-b7a5-e3c2e6dc4f2d', position = 11 where id = 'f52f5375-2665-57b3-a575-4f1fcf431856'; -- anoche
update public.forms set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b', position = 1 where id = '729e36a7-a3d7-5082-980b-81e467af4154'; -- llegué
update public.forms set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b', position = 2 where id = '18578532-7202-5817-a8c7-e06596fed183'; -- llegaste
update public.forms set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b', position = 3 where id = '27b949c1-ea08-5a56-9e5e-316a3ff68875'; -- llegó
update public.forms set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b', position = 4 where id = '012549d9-822f-5590-9cda-b9ef6f32d7b1'; -- tomé
update public.forms set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b', position = 5 where id = '991e541d-9c40-52b7-a18a-f345f920e01f'; -- tomaste
update public.forms set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b', position = 6 where id = 'ac6ff6a2-222a-5f15-9049-2a0a3d2fe40d'; -- compré
update public.forms set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b', position = 7 where id = '206dfcd2-5887-5b34-8522-61de6d59c44c'; -- compraste
update public.forms set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b', position = 8 where id = '80f4c50a-4f93-59dc-b81e-76611fa93433'; -- compró
update public.forms set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b', position = 9 where id = '80f8fab0-dc2d-50e5-acfe-a2f30032768d'; -- pasó
update public.forms set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b', position = 10 where id = 'd91ea7c0-dd70-5fa6-aa21-71396b17b3f5'; -- pasado
update public.forms set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b', position = 11 where id = '08599405-b6bd-5e1f-ae79-85a808b1dbd7'; -- pasada
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'b0deabfc-1706-502f-8df0-4d2b7ad65432';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '5296024f-5dff-5c10-9273-bb1bec8b6665';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'ebb8b355-073a-5604-8473-87f363441799';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '37a21aeb-885f-5e15-9ce4-1af7032984ec';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'e4090784-14f9-5670-943d-2670fccc8338';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'a1e4dec2-d859-5d0f-98b3-a2332ed02a19';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '9275250f-3967-5b6e-8237-fd4acae0820a';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '980d7623-c3c8-5915-9774-882a2c5c03f0';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '03aa8889-f28c-589e-a872-d826977da878';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '696464e9-4e53-5c40-bac2-20977bf17ada';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'f1b0461e-5cd6-5522-ba24-f5028254effb';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'baf497d6-8937-5566-a4d2-42d330997345';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '75376b81-bf70-5e68-a676-66a16a6e6154';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'e1ff6e71-8fe9-535b-a948-077e05e3eb9e';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '8ee20619-bacd-5074-a396-074fa4c4d3da';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '562d3794-5a36-5325-b1cc-0acd53f56df1';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '9ae36c22-b03f-5541-b780-d512dc837acd';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '42b3a693-57df-5f49-a41c-b5dedf922f53';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'c06a0153-2d82-586b-b234-6f9d68b27f68';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'b4c698c4-e26f-5379-a2eb-fec617c12e5f';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '1742db15-c95d-57da-adae-2c404fcc2006';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '26f858b5-3869-584b-809a-cba19db96b7e';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'cc2fc2d5-a8a8-55dd-b66f-aed682a776b8';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'acf4e144-549b-5f23-a116-82f6c2fd668a';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'cb75aafa-766f-5d05-a5ff-7df679ac790e';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'da487a31-77ad-57fa-88f8-372acd395955';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'a0e382da-cfb2-55c6-b2da-739fdfb3ef41';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '99016fc7-4a7d-57ac-942e-d579f54cbab5';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '49331ffa-1209-56d2-9c56-a7db70de50c6';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'e855e59d-b0d8-563a-b1ba-44b041d1440c';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'eb0f44fb-466d-588e-bf45-a02bdb8c5351';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '24819a13-0d42-5904-94bb-16f5e83c9354';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '1c12ea6c-add1-5231-89df-11ac66a0996b';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'a42b5847-5c86-5316-b295-fe82322acbac';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'a304867b-2abf-5fb0-953b-777e758162f4';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '035f5b4c-2d88-5ee8-ad72-1dfec373e2c4';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'f31b9e86-089e-5023-8788-53d317a12707';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'e15e3821-1467-5888-9c5d-b591e0a51c89';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'bda05d06-a70d-5cbf-9762-5d588f8402fe';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '4404e692-37a5-5289-9f59-6e2c493a44b1';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'a0fb4611-78e2-59d5-a02e-bb708a1d8d5a';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '57d1b252-a46d-52ba-80e4-85df82f17980';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'c499af40-4bcc-5022-bb11-108e68ef85ca';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '0a8965ac-edb8-5fb4-8203-d7e7b1776050';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '3ae024ac-7ac6-5ad1-800d-4b7d2deec2b0';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '171fb58a-a5c7-54d6-949c-82daca897b08';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'e7ce3733-748a-58b8-a524-7cb67ae9e09e';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'a876625c-f47d-51fd-8659-acd4a7accff4';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '6a0f39ec-f075-5612-bd04-01221904b55f';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'ac671c7a-0a66-5209-a587-99d388457cac';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'c440c4cb-cc4b-5049-8410-be3821109bd0';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '96a64da0-ac8b-53c7-a67b-593015ad8dd5';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'd24f1afe-9ec4-5a4d-9411-9bf24aa4d8f5';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '19164cf9-4939-585c-a417-061552345295';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '0419de04-1ca6-5978-a614-a3bc31643b19';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '54c1ff65-f451-56ea-990c-f139daed0a74';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'c8f153b1-a6ce-584e-ae72-dad7f85a0143';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'c38abeb9-de21-5fa9-8506-6ce955e7ff46';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '119b6403-4090-532f-9fdb-fca25cffcf4a';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '298795b5-43a2-5f86-af3d-4935a73744c8';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'b2289a47-4111-5c30-a984-ff605d180c83';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '5ad811b4-6d51-51aa-a567-ad1659efd000';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '50a92144-8e85-5060-a431-2c4c61b01efa';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'd6113725-607f-58f1-8468-b43ff4282566';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'ceca25cb-df29-5ac4-bf58-9f47482e2f48';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '4d1d0b7f-ad5f-578e-a7e7-dc9f3bef205f';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'fab30add-1f3d-5f1e-bd28-264573b2c69e';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '2a2472ba-b52b-57d3-a16d-de43614e0ce3';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'e9d78f69-a95f-58b0-b000-c7df5630afb2';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '5ed42d8a-6618-5db4-ba7b-c7f3900b426a';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '991f133e-4d3d-50f0-9642-5c35052f4f19';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '4feac047-6498-5e65-a73e-a728a4a29fb3';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'ca7b429a-05cd-5134-a8d6-fae2f79295fb';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '381c3def-23d6-5475-bd70-dd1188c0bc46';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '3fbcb330-5eca-547e-9cbf-e337c6487ae2';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '8bb76173-ffd8-56a7-8500-068ab961813b';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '97cf0a07-92df-5abc-8bd2-1448d9588bbd';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '4f7793aa-c9ae-5ecf-b7b1-364242c25f4d';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'c0878662-2015-53fc-806d-b793ceb091ec';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'c3a3bf70-247e-5543-b200-e2fdbec2c3ef';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'e34e8f1c-70a5-57a8-88b0-a2813dc83876';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '3d404311-713d-5db9-ad65-b147b1c7dbd4';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '763180c1-9640-5221-8630-521e897f7434';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '8322275f-9b9a-5a39-8a60-f05c7fc352a3';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '8b5de4a8-d8b9-5738-8dfb-76bb20f1e2a1';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '8f46cd21-57b4-5201-ac0b-fabbc3f5539e';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'e0512f45-787a-5a9c-9f49-7ea31146a857';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'e44b8b0a-cc28-55fa-b75f-5a5a3c7bfad1';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'f373201b-cae1-5e0b-a774-c235e397fbb3';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '7cf4341a-b576-5374-9969-dd8920d5b55e';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '3b335831-bd09-5e13-8f6a-89f85826de1d';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'be5f911c-263e-57c5-a733-446ca87597b6';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'd8018223-caeb-5761-abae-0aea6e41731b';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '0597cfb6-21e8-54b6-a9b4-47ff5c59713a';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'd87749f2-d853-59ae-817e-06e4bf37725f';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'ca2da3aa-e3e7-53c2-9b17-6633fcaae3f3';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '72871a97-63b2-5aa3-956f-3f391c0d138a';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'a45f31d2-136f-5edf-b7d8-accfa928d171';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'ca1172c5-83dd-5adb-bbfa-7a8678367224';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '88e34976-cbe6-55ea-aed8-c003e3418d95';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '033fc831-fc16-5ccc-8258-52a0defb1d90';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = '40affe6e-899b-53dd-bbf5-2be4a1430a43';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'be76280d-98fb-57fa-9183-cdff297c4296';
update public.sentences set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'f239900c-cf4c-5440-a12c-9e0ce0f0d4db';
update public.tips set unit_id = '2f7aa645-511f-5d3e-a5be-60718073855b' where id = 'bd066d7e-c2a1-50d3-8b02-143dea692406'; -- Hace = ago

-- cenamos-afuera → cenamos-afuera · llegaron-tarde
update public.units set title_en = 'Say who paid for dinner', summary_en = 'Anoche cenamos afuera' where id = '6575b91f-226c-5859-990c-345608df8e59';
update public.forms set unit_id = '6575b91f-226c-5859-990c-345608df8e59', position = 10 where id = '1b9dd475-1bc6-52e5-9acd-a50ea2a425fe'; -- gasté
update public.forms set unit_id = '6575b91f-226c-5859-990c-345608df8e59', position = 11 where id = 'cf3246ee-6d70-5d08-acb6-7ad1922194a1'; -- gastaste
update public.forms set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559', position = 1 where id = '6d06538a-c9a6-53c9-8086-a54152f75654'; -- cociné
update public.forms set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559', position = 2 where id = '07625729-2fc2-5554-88b7-b9b44aa74b04'; -- cocinaste
update public.forms set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559', position = 3 where id = '78648acd-f0ad-5cd1-89ca-a858b896c568'; -- cocinó
update public.forms set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559', position = 4 where id = '7ec0ee0f-22aa-5168-b95c-6a6dda727bc9'; -- esperé
update public.forms set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559', position = 5 where id = '147c1743-160d-557e-b5c3-969f7b549d5f'; -- esperaste
update public.forms set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559', position = 6 where id = '9bf3162a-9fa7-54a9-8de8-34a1c6df3d2d'; -- llegamos
update public.forms set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559', position = 7 where id = 'da7a714f-aee4-5608-8c39-a0034b8fde66'; -- llegaron
update public.forms set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559', position = 8 where id = '30a1c777-2c58-5a9d-93b6-892251c540e1'; -- tomó
update public.forms set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559', position = 9 where id = '36e1b4d0-1cf7-5ee5-8a2d-840f713a31e2'; -- tomaron
update public.forms set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559', position = 10 where id = '8fd0e170-e6d7-555e-a622-4587f0f26a73'; -- hablaron
update public.forms set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559', position = 11 where id = 'ae0a2927-3315-54dd-a83d-98333ec12d1e'; -- caminé
update public.forms set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559', position = 12 where id = 'd3b81bf4-f87d-53af-b164-9d118b8a5e0a'; -- caminamos
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = 'd999bcc2-8f49-5080-a53a-d500673f54f0';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '1d079faf-9f1f-5938-8d35-9a0183a1b83f';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '2c1df8f5-7f06-5a08-b10c-ebba56a954e8';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '8c4b128e-e179-52ac-9c31-3739ebbb8da4';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '38e2931b-bf3a-5b30-866d-681c6d78b737';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '6aa5f6c5-406b-5d51-9688-ab0e081cad25';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '7427ca4e-d073-5291-9a3c-8f525abec484';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = 'f71b57d3-6a33-54d1-a7b6-507dc229baf4';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = 'f1d59a89-fba6-5e64-acf4-6175d23bde46';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = 'edc77c99-31aa-58bc-b5a8-bc0a6ae18e44';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '4b9d82f4-0028-5223-bb42-953d05c938a1';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = 'bb85032a-0989-503b-ab15-71a63aaa61f0';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = 'eb2d60ca-8853-5fe3-8537-607240dac452';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '2c4ec20a-11f2-57a4-9718-a156433fb8cf';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '0f2a3a52-82c2-58c2-bfa9-f187fd599f2c';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '50428e9a-fec2-5d93-9005-6154179fefb7';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '671773e6-9264-56b2-a94c-04f5a16e12d7';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '29e3eb56-dec3-5c1d-90f2-e6616b4cc402';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '4db97254-86ff-503e-8ba9-7bea52e6fc30';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '32091cf0-8653-5f66-aef1-9ecbd9bb7405';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = 'a2363330-dcac-5a7f-bb4f-44d8c4805b8c';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '4f73c2f4-7131-51ff-afbd-60adc2862036';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '0f535f13-049d-5214-9342-4978a915b75b';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '8b3040d0-4828-5dac-b7ce-39288e91b625';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '1621a6c2-d7f1-52c7-97bf-215b9e9d331d';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = 'dede38db-3db1-52b5-a5e1-f225fe1790c9';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '625a92e5-878d-5fac-b8c3-e86827b4138e';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '86b5f4dc-6176-5952-8eb8-a218cd3e4748';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '2c476b5c-2436-5ab7-9269-e44765c4bacc';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '53f3aa36-5a27-5ef0-9e91-807c229f9a87';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = 'd6e4b0fc-20c3-5158-9aa3-fb838b0b2170';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = 'ce02660f-7069-505a-aef9-18d61c7808f4';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '45e566fb-d5a3-54b1-aeb1-66dc5c6c4747';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '3dc1da74-46b5-5ced-a3c4-b406ea79bb85';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '58799685-3599-5c44-a6b8-af77d333ff9a';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '732dc2cc-caf9-5946-8d36-ea70b1195b86';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = 'df120861-4400-5a83-8f54-bf6869c40a25';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = 'cce4bf75-f41b-5a77-9e46-359b76be35d2';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = 'fae8c373-8519-5bec-9489-da34f256639e';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '7aefdc7f-1c7a-5a2e-b2be-233e79ed8840';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = 'f5f500c3-ecc1-5b68-808c-df3b088744ae';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '0b47775c-53d3-50ed-beab-77a9b8cfb5b4';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '0d674c71-3761-581d-acd0-ca2adba8f1e4';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '9e42ca86-9a0e-5d84-a6f5-732c8739ed7c';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '1a282792-35d1-542c-be8d-67814b377159';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '3d2e249e-06bd-5e89-a477-1ed0b889f4cf';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '43aba5c4-8456-5d0f-89b2-fc1ac12bebf0';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '80cf65b1-9884-52a4-9631-387a0f8a9dda';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '05f837a2-1aab-5c55-b6ae-f690b3c21539';
update public.sentences set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = 'd4d2b6b5-e9ee-55e7-94d6-d47bf1212c45';
update public.tips set unit_id = '7ab31e4d-0a0d-59ee-8ddd-37f134125559' where id = '7e1f82d2-cee5-5c5a-b728-6c4040631839'; -- The -ar past for everyone

-- comi-y-sali → comi-y-sali · conoci-a-alguien
update public.forms set unit_id = 'b60b2d1f-25dc-5ada-9b93-a0afe7bd9a37', position = 8 where id = '9431c6ad-a28d-5cff-bee3-633d2945cdd8'; -- recién
update public.forms set unit_id = 'b60b2d1f-25dc-5ada-9b93-a0afe7bd9a37', position = 9 where id = '0cdd335e-99f2-5593-a1ea-ca0ffb15864a'; -- me levanté
update public.forms set unit_id = 'b60b2d1f-25dc-5ada-9b93-a0afe7bd9a37', position = 10 where id = '28ccbf8f-37e5-5c8f-b25f-a7b6e94007af'; -- levanté
update public.forms set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa', position = 1 where id = 'ee416ee4-dfa5-56ce-9649-634e9411d7d1'; -- conozco
update public.forms set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa', position = 2 where id = '1cef621a-b696-512b-b222-036a48b7b5cb'; -- conocés
update public.forms set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa', position = 3 where id = 'f5645b2f-459b-52aa-b8a1-60f8870626fb'; -- conocí
update public.forms set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa', position = 4 where id = '6e4dd65f-9f2a-53b0-af6e-c2e45abefe1c'; -- conociste
update public.forms set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa', position = 5 where id = 'b50dcf31-cb33-5ce5-b70f-f08de2f7a680'; -- conocer
update public.forms set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa', position = 6 where id = '4bd5a139-adad-54eb-82aa-5bbc7c8a7105'; -- viví
update public.forms set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa', position = 7 where id = 'bf1c0d2b-f2f0-588b-a6b0-c15c45af9172'; -- aprendí
update public.forms set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa', position = 8 where id = '5d583e28-01e6-5238-8da1-038791005ddf'; -- escribí
update public.forms set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa', position = 9 where id = '01143c51-b257-5ae2-8675-5ecd9bfc411a'; -- escribiste
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '45ae25e3-dec7-5d6d-88e8-ca20015a58f2';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '0f6ee147-7a8e-51ae-9bd6-f390f14cd06c';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'bcc36ef0-b43e-506c-ae1a-60201d64042a';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '06526319-de24-557b-9e71-815bab114f01';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '667b6b82-6d32-5fe7-9b15-46437b43be9d';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '881218e8-36f6-51ed-a69c-c418117fe07f';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '8dfb5984-17a1-51d7-9369-b01d4fac1bbe';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '5e353fbb-ad5f-5bf5-9701-9e0e8492a6c1';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '74fad313-c1cb-5c60-967c-1396da1c9302';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'e1405cd8-3b9e-5d4f-a05e-1e8fefe6dbcb';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'df7daac5-ebb8-5a2c-bd5d-05be6ed855d3';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '747bcb2a-a3fd-5a78-9333-893ad7aecc7d';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'dd85521a-0efd-57ab-9a96-4e3c1640ba4d';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'b988e765-c9ad-58ad-b670-86a2405da343';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'ac8b6fa9-7ba0-5e3a-bf51-6673d4cfd5f6';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '7f764f07-65f3-53a6-9b36-257f4e62b99f';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '26ef8016-45b4-5ad0-8b66-27f612c4ed72';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '1a6836f7-d9c4-5b9c-afbd-64659dcbd958';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'a89f964f-1330-5b78-b709-c8390cecc157';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '17a4e87d-fdc6-5cc9-b19b-0ff138d58a03';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '42dbe025-0d45-5e85-9481-b111ffc908ee';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'b2c313f4-2eed-5ca3-8d7b-b80f79c00eeb';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '4faf1e22-d978-5582-875d-949b8e6094ef';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '148c7df9-9490-5208-ae56-eb6cef90486f';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'fce3f122-6339-53bd-b5f1-14077e5bcee5';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'b765e3b2-7634-54de-b27b-2f2a5185ffc2';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'a8728824-87e3-544a-adc4-44a8411c7401';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '8c0269b6-4721-5543-aa94-18e637bd9ff2';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'adefd834-b6f2-55ac-a913-53a928da24ae';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '16048300-0308-581b-8129-13b659559996';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'ea295b07-a766-52f0-88f5-f0e1b49f7b79';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '7896feb3-0861-5e39-8575-eb7ae37e53b4';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'a577ed39-7031-5d72-8c65-37431d95e071';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'dddc6983-9aa1-56c2-acdd-342b03936753';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'e8f1f8df-8e08-5918-ae54-474640017c44';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'ed7d45f3-5283-5abf-b861-753c11b1e719';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'f154eae1-563c-5b7f-94a5-475cba988d9d';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'e811e879-2f4e-535a-b09b-e292a3ffcc29';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'febeda8c-ee9d-57c0-9ba8-585481ae1ccc';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'c8274ac7-a84b-5159-bacb-6d91e9b9a21b';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '1081c3b7-cfc9-5ba0-a7bb-f05c42724b4f';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'd5d33e5d-09df-5d48-93c4-edd416fa80a4';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '698ba21e-f18a-5bce-860a-22a4a20dd8eb';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '2dcbf0d4-47d8-54c5-984e-7397dd37843b';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '44048236-1d85-56ba-bf53-f306100eafee';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '82f8ea17-72ad-5d3d-96df-5bc5a8300673';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'dc90201a-a8f5-5652-a3e8-62810990b108';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '1b8840ae-ef91-521b-b981-2dd22882c663';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'eee74aca-8321-5985-8a9e-5e1c506d681b';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '6412bcf1-8318-5d3f-811b-37df8a2f9f09';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'a154a9d6-26f8-52b6-bd5d-7eef5b293295';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'a4c0f455-86c5-56b5-8f01-1b216021f0b9';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '807ea5b9-6fe9-51c3-9d4e-82cd94330d2c';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '0613a09c-80ed-567a-a726-8f2aa03b3206';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '2b3c848e-665a-5451-89f6-cf691b184f75';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '8864da07-21c0-57eb-9481-5343f09da801';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '61c8f054-f555-5385-b750-396133444ca7';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'de0d7435-e6e6-5636-ad8e-b97de8af4a0f';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '81f20dd4-4ce7-5067-a395-7f807b969cb1';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = 'd18f5618-b52a-5e86-bcd0-168742b75eb9';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '21eae7f0-cf71-5484-a58c-56f87a062a3d';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '83722372-65c8-5c34-b629-02171e50d776';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '26b13bf0-1bde-54eb-8f6a-eaf625d83687';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '5c3fea9a-5a49-557c-9e9b-d27ad97ca41e';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '371dd2d4-2af9-5add-8a30-8f5aed22b59a';
update public.sentences set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '6125549a-636b-529e-98f2-a122fdc3e21d';
update public.tips set unit_id = '4339fcb1-e369-5b13-b02e-5fc8aba66faa' where id = '79ace8ff-909b-5e0d-b36a-2af4213f3056'; -- Conocer, saber

-- naci-en → naci-en · volvi-a-buenos-aires
update public.forms set unit_id = 'de1b383d-ef2a-56ab-b9e0-5c76ea55a644', position = 4 where id = '3cd04aa8-13fb-5165-a227-6530d12ac43a'; -- me crié
update public.forms set unit_id = 'de1b383d-ef2a-56ab-b9e0-5c76ea55a644', position = 5 where id = 'e66bc2b8-2284-587e-b2e6-c655a50a7d09'; -- te criaste
update public.forms set unit_id = 'de1b383d-ef2a-56ab-b9e0-5c76ea55a644', position = 6 where id = 'b495ea17-4cbf-53c3-b471-20829fb09631'; -- viviste
update public.forms set unit_id = 'de1b383d-ef2a-56ab-b9e0-5c76ea55a644', position = 7 where id = '09fe3cc4-f3ba-5cc2-b7d1-92ef071447db'; -- vivió
update public.forms set unit_id = 'de1b383d-ef2a-56ab-b9e0-5c76ea55a644', position = 8 where id = 'f02bdf4b-48f7-5494-b1b4-0de9845ef9fa'; -- vivieron
update public.forms set unit_id = 'de1b383d-ef2a-56ab-b9e0-5c76ea55a644', position = 9 where id = '19f53923-4f45-5162-ba1f-38857f0925fc'; -- vida
update public.forms set unit_id = 'de1b383d-ef2a-56ab-b9e0-5c76ea55a644', position = 10 where id = '03a67e5f-b2fb-5231-a3d6-bdf3f5dd0f78'; -- donde
update public.forms set unit_id = 'de1b383d-ef2a-56ab-b9e0-5c76ea55a644', position = 11 where id = 'de5e1a8b-06b5-5a20-9df1-b07882c764ab'; -- crié
update public.forms set unit_id = 'de1b383d-ef2a-56ab-b9e0-5c76ea55a644', position = 12 where id = '6e11413a-e3a2-5fd8-8206-f4b021d3da94'; -- criaste
update public.forms set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c', position = 1 where id = '72673162-f903-5d16-a535-80b2469aa7ad'; -- volví
update public.forms set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c', position = 2 where id = '584d8b32-32ff-5b5b-b57a-f027fdd8af3a'; -- volviste
update public.forms set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c', position = 3 where id = '2c1278fc-bb8c-5534-9a9e-750cc0b1f889'; -- volvió
update public.forms set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c', position = 4 where id = '8fbe9a4f-44c7-55fa-90d9-328eb2856fa9'; -- aprendiste
update public.forms set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c', position = 5 where id = '0bcc0cd7-c78f-5e43-abb4-3e739e8b4d5f'; -- aprendió
update public.forms set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c', position = 6 where id = '96c85856-2172-523b-ae6a-bbd14069cd58'; -- entendiste
update public.forms set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c', position = 7 where id = '2d7dc6b2-74b0-509a-9f0d-c53244af5cab'; -- conoció
update public.forms set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c', position = 8 where id = '003bb759-922a-50ba-95b9-babf6f10b06b'; -- salieron
update public.forms set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c', position = 9 where id = '7c9d9554-1c2e-50e3-a1d5-15920947e17b'; -- comieron
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '152a53d7-3950-550e-b9c2-753495286ea8';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '010f243f-cfea-58bb-b75c-4ccf5c855d48';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '9e7e2f41-1481-5f5a-9390-ec082a8223fb';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '2665ccf4-878f-50ff-a2b3-2a12a8e2aae4';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '3ca25390-d755-501d-824d-d3dba1677591';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = 'cca45a62-44eb-5589-9f80-36ae18af2c60';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '900cf8f3-a9a5-54b4-bd9b-c527bf36d708';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '440d1fc0-7458-5f7a-9724-619a57127f68';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '54b79aed-715a-5653-a3d0-9ef0e092735f';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = 'f09977b4-08e4-5d70-8416-628f6ddf499a';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '0db12df3-7e20-5166-bda5-16a728a5f276';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = 'faa34397-eeca-524f-9d8e-faa2daa69441';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = 'c3764a7d-1abe-58a6-be3d-1a7f857bb665';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '88ba9042-458f-588b-b983-ced102cb250a';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = 'fae1b527-6bec-52ce-88be-cec3867e6e61';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '9397e3a8-6d4c-586f-b869-9bada4667922';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '6cf4caf4-2cfe-55c7-a981-0281db201b4a';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '1b73e8af-9a39-5a53-bb99-ee2ff720612e';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = 'fbc7720e-3986-5e3a-b3f1-8bfb3cca3818';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '1ff94c17-57dd-5d9f-8b8a-2908985e1f1e';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '039d44bb-64d1-588f-a24d-92bf9d55a83c';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = 'e379c3ba-8ce4-5790-a2d9-e5ce32e8f6b0';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '8bcb09ad-ae77-58dc-b1ac-a52a1e20a8ae';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = 'bedfdacc-005b-59b1-8aae-d57dbf41959e';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '060d046c-02f2-5271-a715-0a82a261f2f7';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = 'bdc578b3-0fc2-58ef-a46f-5cdf2e782933';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '02c2308b-87f1-5e5f-8941-7e4eb67e2a87';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '97aedb9f-4ffa-5e2f-a3bf-a75a32e59402';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '0f5a9a95-acb6-5169-bcff-2d95e29e6500';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = 'cd8a9a2a-8594-51c3-a2d8-2fb96797f9e7';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = 'e18d271b-1931-5f42-bd2d-23c6b480324a';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '76971e2a-8dc7-599b-b7ee-81f240aa4d34';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = 'bfe9f84e-9117-5090-bba7-5f301aac3d08';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = 'f84acb5e-4a16-5561-9fc6-7aac6f5237f5';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '3918fb5e-9b32-5d45-a781-cb3e6c50d396';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '90399815-cd83-556d-96b1-8c47898c76fe';
update public.sentences set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = '2e6e2a14-95a7-5725-8f72-132f4b224ad0';
update public.tips set unit_id = '38d98dfc-861b-52c5-9860-6ebfdc84030c' where id = 'faac1c21-798a-562a-8e8f-a3985f710228'; -- -er and -ir, every person

-- fui-a-la-cancha → fui-a-la-cancha · como-estuvo
update public.units set title_en = 'Say where you went and how it went', summary_en = '¿Cómo te fue?' where id = 'e89d1870-c4d1-5692-923d-5e357ae8218e';
update public.forms set unit_id = 'e89d1870-c4d1-5692-923d-5e357ae8218e', position = 7 where id = 'e9027347-8030-5339-8e88-84c4872fbb10'; -- partido
update public.forms set unit_id = 'e89d1870-c4d1-5692-923d-5e357ae8218e', position = 8 where id = '3b8b6221-5e7d-59e1-b6e3-868351a678c0'; -- recital
update public.forms set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69', position = 1 where id = '9e1a0abb-b386-593e-92f3-a369923bcf39'; -- estuve
update public.forms set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69', position = 2 where id = 'b5e08ff3-dfcc-54af-97c2-d29ff33c8ddc'; -- estuviste
update public.forms set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69', position = 3 where id = 'a3c730d9-e62c-54ba-95f3-f96bacada9a3'; -- estuvo
update public.forms set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69', position = 4 where id = '6aeda9bd-9e43-52e7-99c7-be3e450ce46b'; -- tuve
update public.forms set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69', position = 5 where id = 'bc4d8f67-1cc1-5835-9952-31bfa9fa9b9f'; -- tuviste
update public.forms set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69', position = 6 where id = '09adb7ab-4555-593f-a98d-a2bb7bae53e8'; -- tuvo
update public.forms set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69', position = 7 where id = '11b803d1-b113-5f22-bec8-cf6bb2138420'; -- hace cuánto
update public.forms set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69', position = 8 where id = 'e97d5208-f449-5970-955a-522c208b80d6'; -- hace mucho
update public.forms set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69', position = 9 where id = '36123aa8-158f-55a7-91f9-421c8a1ddfd4'; -- hace poco
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '9131eec7-93fc-5fe5-ad9f-817d0e861ca4';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'f0d42ac2-217d-560e-b472-fbd9fd1fefc1';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '38a6f4ea-ee55-517f-8b94-f8fc6a2d8ebd';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'e5d82a5c-69aa-5c26-ab93-a4b27fd483bb';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '30cfa906-79eb-50a9-bbe4-7c50daab887a';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '6d0d4a0a-7020-597d-90bb-fe6b6eeee8c0';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'f8e14007-2711-568f-9db7-88872c2f1bd4';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '1647da0a-6dc0-5a0f-abc1-492b118265ad';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '22fbb204-b1fc-5e12-9ab0-f0fb86207243';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '403d15aa-f79b-5ee3-898e-90d8969bfd4f';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'ac62ad2a-1ad1-5351-b04e-232597790228';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'b950ea61-74a8-5b5f-9364-f4a36920f5d2';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'ca838f37-5924-503f-93bb-bb8104035538';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '0800d56d-e082-5da1-ac4b-a7bcbd9514fb';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '2eb04c54-831b-5da9-a12b-f4c3523bb1d5';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '7a6c5853-d0a0-5b8f-9ef8-e20c19a57227';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '8b82eb45-340f-5225-b49d-a1b043b9dcc7';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'c5d4035a-0924-5c6b-821e-359a93242434';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'cb4b5d35-fa0e-5d5c-a758-c4a40be8df04';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'a821a4f3-fbb9-5e98-97a3-fb84e86ffec4';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '109730c7-80cd-51ed-9cf3-2e107497f670';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'e4fc08b1-a27b-5625-a04c-7e0c395a766f';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'bf4050b5-1edd-58db-8cd5-ba3e57918084';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '7bb2bc3e-197b-5ebf-ad6e-cc62508dffab';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'b4e80930-98b7-5b6a-82c7-46bf86822931';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'c638eaa8-5535-520b-bc68-e939d1c25e28';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'e5287910-2faf-565a-9d7d-c202a38c8752';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '0ddc8485-0596-59fe-8f55-aa0ddd7cb9d2';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '58610e69-234c-50f0-ab87-4be63ca40383';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'a217f2e6-6fec-5702-b12c-79b17760922e';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '28cb8dda-a248-541d-ad3f-3ba5e2cc5cbb';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'cae486e8-eb83-5cc0-99ed-dc412a81bd0e';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'd83d6903-93f5-543b-ab46-171b2f752264';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'a140da81-ef0d-5aed-a7e7-8e4238d677e0';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'faa24700-ba03-5e40-9fb6-cf18eb32d530';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '182aee97-8d2e-5015-9936-e47d5f001d2c';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '52103ef4-f450-55b6-afa3-e4982f8d3e42';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'b4b4b10a-18df-52e2-aedc-46bca72a655e';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '14c32c6c-1c4f-5309-affd-2e6b4e5d545a';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '1662390b-64cf-53a0-8ee5-574f8cac1802';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '0b71d25c-7695-509b-a888-bfdedba180cd';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '19eef4b6-2b48-5717-b95e-9ef112930049';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '1a420735-0fa7-515b-90b7-b8b37ae14506';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '2523e18d-fed8-5773-b239-12aa6c132499';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '625bade3-9c4c-5d32-9b11-f4b2bba340f3';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '97193312-5f11-5007-ae0d-738d43d3ae8b';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'decaabbb-b414-53e9-9e96-e3e031e57cb7';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '8488141b-bc5e-59d0-a012-3b92c252b615';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '85ab2b60-98db-5a44-9f35-0f4049878826';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '8acb9f09-8216-5ee5-8ed8-12548bd3a636';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'a905cd52-7374-5582-a3d2-2558f4ad1259';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'd7be7acc-6c54-5a5e-bc85-8c985eebdbd1';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'fe57da27-1dff-5bde-baac-185f66f2ead0';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'a00f98d5-8cac-5ecd-ad2f-5f6e69a91fa4';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '9f5df6b4-ece5-57db-aea7-b60e8cd74157';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '60932bcd-9479-5e76-bb85-941b97bd391a';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '7bcca4eb-c4ff-513c-a003-13f1ebe96b4e';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '85772430-970d-5b41-aa52-667a3440d9e3';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'db0c3ca4-ac7b-5a36-88da-418ae93c2548';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '804fa9d0-641e-5ed9-949d-9a2ca658d87b';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '941746ad-a7a2-527d-86b2-f99cf8a751b3';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'a97d5be8-7e7a-517a-879e-dd3d81a11085';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'b0d8913a-b839-518c-903a-28b5ff92a48b';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '26d2b63e-377e-5586-8ba6-732c1a28c788';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '8dff135b-8fc8-56f0-a42f-095e30fd76e9';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'e0c7de97-5b2f-53a2-95bf-c45a3b8a0fe5';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'cf1623eb-3996-55a1-b7f5-baa04c148a4d';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'ebff490a-6db0-50c3-9286-2c1160543ab8';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '315005a1-65ca-5df2-9003-7b7369d9e970';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '40b1def4-5146-58f3-8ee1-a576fd9d2705';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '73b5db02-b817-5e65-8e46-524e5a11d7d9';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '93908894-92bd-5c49-95ff-8c14f78e7798';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '0978f96b-f3e2-53eb-a29e-56ac74559848';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '896d516b-62f0-532d-885c-542b2b608533';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'f149404c-e62d-5337-8deb-bcb5631164c3';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '07efcce6-b176-54bc-8acc-596c05554da7';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '90314bd6-2632-596e-8c82-28baccc3ed71';
update public.sentences set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = 'e83b17b1-cf91-5b56-80db-00f7c5cd8564';
update public.tips set unit_id = 'a02f1b80-0f65-5bff-b455-5fdb8fcf8b69' where id = '9ff25831-7e96-5f7b-b336-2efe4c58e6d1'; -- ¿Cómo estuvo?

-- la-pasamos-barbaro → la-pasamos-barbaro · ganamos-el-partido
update public.units set title_en = 'Say what a great time you had', summary_en = 'La pasamos bárbaro' where id = '470a7647-d7f6-51fe-aa77-1f96cda7ef58';
update public.forms set unit_id = '470a7647-d7f6-51fe-aa77-1f96cda7ef58', position = 1 where id = 'a9435e03-27d4-5e2f-b229-d44dbc6c593e'; -- la pasé
update public.forms set unit_id = '470a7647-d7f6-51fe-aa77-1f96cda7ef58', position = 2 where id = 'a1805c70-bc5a-51ae-839e-b4b31b074eae'; -- la pasaste
update public.forms set unit_id = '470a7647-d7f6-51fe-aa77-1f96cda7ef58', position = 3 where id = '47e39856-aeb8-58a4-b63d-e9ea9c93d87c'; -- la pasamos
update public.forms set unit_id = '470a7647-d7f6-51fe-aa77-1f96cda7ef58', position = 4 where id = '6450c5bf-0a83-50ba-8db4-4d39c4319319'; -- estuvimos
update public.forms set unit_id = '470a7647-d7f6-51fe-aa77-1f96cda7ef58', position = 5 where id = '862a30cf-170d-5a5c-8b28-7443e4d4b079'; -- estuvieron
update public.forms set unit_id = '470a7647-d7f6-51fe-aa77-1f96cda7ef58', position = 6 where id = 'a729c3b1-ac34-5e8e-bbc3-80ac9ea7e198'; -- tuvimos
update public.forms set unit_id = '470a7647-d7f6-51fe-aa77-1f96cda7ef58', position = 7 where id = 'b0e271e8-1ae1-548d-a687-c26dc7abf8c7'; -- tuvieron
update public.forms set unit_id = '470a7647-d7f6-51fe-aa77-1f96cda7ef58', position = 8 where id = 'e931e65a-c3a8-5efb-86be-5b9a30c127f7'; -- banda
update public.forms set unit_id = '470a7647-d7f6-51fe-aa77-1f96cda7ef58', position = 9 where id = '228ba1d7-ec0d-5278-970f-f36d9fd9bdb1'; -- increíble
update public.forms set unit_id = '470a7647-d7f6-51fe-aa77-1f96cda7ef58', position = 10 where id = 'c209eeac-bafa-5c7a-9949-a8940ec98527'; -- pasé
update public.forms set unit_id = '470a7647-d7f6-51fe-aa77-1f96cda7ef58', position = 11 where id = '9591c0ef-247e-517e-b7d7-5e290afc0b80'; -- pasaste
update public.forms set unit_id = '470a7647-d7f6-51fe-aa77-1f96cda7ef58', position = 12 where id = '5e8479ed-49b0-56d4-8716-64b56ce146b5'; -- pasamos
update public.forms set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe', position = 1 where id = 'e1f51f0f-b105-58c9-8b03-acdb300e9152'; -- equipo
update public.forms set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe', position = 2 where id = '5e58e81c-8ecf-5cac-8921-801363bf2032'; -- ganamos
update public.forms set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe', position = 3 where id = '37c328ac-ef69-547e-a3cf-6e56f3d6447c'; -- ganó
update public.forms set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe', position = 4 where id = '8ea4f486-c2c1-579e-8a4d-f37ddb04330d'; -- perdí
update public.forms set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe', position = 5 where id = 'd8e690ec-3422-5f14-86a1-55d28ccd0a7a'; -- perdiste
update public.forms set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe', position = 6 where id = 'e261c9d9-86ad-5acd-acdb-1e586f97023b'; -- perdimos
update public.forms set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe', position = 7 where id = '96d33d35-e1ca-5b54-88f2-2391d4f96c04'; -- divertido
update public.forms set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe', position = 8 where id = '44a13255-088a-5b34-b9ed-77e895ee6b21'; -- divertida
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = 'f90a0d75-d3a7-5878-957c-55fd8b7626f6';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '3b0f5fac-9833-510e-9cf1-ce08b0192d68';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '1fb83944-d822-54cf-9450-b08c86dbd3c2';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '1780d4a8-c156-5911-8e93-76063a6cad20';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '68a7bac3-20a6-5691-92e0-813b97a3241c';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '103f416e-5e6b-5883-a7e6-63f991ba9bd5';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = 'aab2651f-f9e9-5dfe-9ca3-92a6d2704aab';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '474655a5-3d0b-5404-806e-44465bfd6cf2';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = 'fa70287d-6423-5ba7-9c34-62c21ebc4c64';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '5c2bd926-c16b-54c6-a0d7-56e4ef2e680b';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = 'b1bdac4c-de12-5650-8135-8e7987b70afc';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '6c88ac63-b7f3-5854-bc50-2b7fab5a1fb1';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = 'fe76d419-8abe-5df3-a8a0-a4e18aabd5e3';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = 'b0655832-65fd-5d74-b895-06dabca49c52';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '36024759-b068-5042-bf54-ece2dcbbc531';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = 'e8058432-98ef-5c51-85ae-e6646db484ab';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '29b41c22-608b-52b5-b55c-f5279b0a7be9';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '3d9902e3-c34e-5cc7-b00a-1c96c3304b39';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '1149ba7d-4131-5ced-8c5f-857133d61110';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '4699e075-3b5a-5ba9-b925-c5b9a6e54793';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '23f9745c-3d36-58dc-9618-b36540e44578';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '4115acb3-244f-53d5-894e-570efba1d9c4';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '4ead02a9-4458-545f-a0b0-87b7f8afbd46';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '4f9acba7-038c-5e70-8aa3-7829e3fa6c5a';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '50529865-7f44-5899-84c4-782cc2984f20';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '0ee9420c-08b4-56ea-b341-cfc5aa6ad1be';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '6d3927ba-77ff-518a-b812-d42bbed7d524';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = 'b284a53d-dca5-5356-b395-036fb4642a52';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '1e69fcc4-e1bb-5438-ba36-5cc673b8192c';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '69f6ac59-3420-5d47-8395-28171076b3ff';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '2d06f07b-a406-5bce-a116-f7f36953a62a';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '5d5dcc87-43ab-5c6e-81df-8cd5398be1a4';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = 'f69e781f-f009-5c4f-bf6f-340de2075b9b';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '95a85bd5-9483-59e0-aa12-9236211cbff6';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '150ee84f-3dc8-53f3-8f9b-89cf0a3c17a1';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '6f2290ff-b602-5a80-9cf5-dfd5adea5ecb';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = '744ecc89-0604-55b9-9480-fa6f631e4095';
update public.sentences set unit_id = 'ac1ced97-0076-53e1-a86b-ae529417c1fe' where id = 'f54cd997-7bb0-513c-b290-3c6e37112773';
insert into public.tips (id, unit_id, title_en, body_md, status) values ('09e2149a-d3e7-5a6d-a3ef-53623654ad25', 'ac1ced97-0076-53e1-a86b-ae529417c1fe', 'Ganamos, perdimos', '**Ganamos** is both *we win* and *we won*; the rest of the sentence tells you which: *Ayer ganamos el partido*. With **perder** the two are different: *perdemos* is *we lose* and **perdimos** is *we lost*.', 'published') on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, unit_id = excluded.unit_id, status = excluded.status;

-- el-finde → el-finde · no-pude-ir
update public.forms set unit_id = 'f42f6608-6d16-5d0a-bd3f-896cd5fb4d07', position = 9 where id = '00bee754-d7c6-53a5-8899-773839181cd0'; -- primero
update public.forms set unit_id = 'f42f6608-6d16-5d0a-bd3f-896cd5fb4d07', position = 10 where id = 'afdbf4e5-cb9a-5e9e-bfe7-e8b17731be9c'; -- entonces
update public.forms set unit_id = 'f42f6608-6d16-5d0a-bd3f-896cd5fb4d07', position = 11 where id = '913aad45-67da-55ee-89af-625d8b7a3771'; -- al final
update public.forms set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f', position = 1 where id = '68f3dd58-bc48-521e-a96c-5eea6ecccf5c'; -- dije
update public.forms set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f', position = 2 where id = '3f00771f-71f1-5126-8d8f-8b206bd9cc34'; -- dijiste
update public.forms set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f', position = 3 where id = '113b72fc-5a86-5d14-b85a-d00a74b7ac10'; -- dijo
update public.forms set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f', position = 4 where id = 'c5a306f3-bc85-5dc0-9ecc-33f464c13c7c'; -- vine
update public.forms set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f', position = 5 where id = '434ee4bf-1ecd-5423-9c2e-1a5fd06aee33'; -- viniste
update public.forms set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f', position = 6 where id = '1a394b03-4a02-55c8-b665-690c59edbaea'; -- pude
update public.forms set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f', position = 7 where id = '7d77abad-0af6-5afd-b4b6-6a2c251f3fa7'; -- pudiste
update public.forms set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f', position = 8 where id = '51b896e6-d898-5a2e-92d5-2d909bbf9bdc'; -- leí
update public.forms set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f', position = 9 where id = '7c06be01-4eaf-5210-b58a-0bad3d33d784'; -- leíste
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'a429645a-cef3-577a-84d8-394590f53a09';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '2979d5d1-9a62-5bb2-994a-a0d62824395a';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '141771c7-9da8-5b91-b681-ae94890915ab';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '4d1af822-4f67-5924-aad9-02cb003c7b8f';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'ce8eaf2a-bbd6-59f9-ba12-0e7ab8b76e65';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '62e00371-0f3a-5962-a47f-51a502ddcbfd';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '2bae4714-4c6b-5510-b82e-c92c9aee4c5c';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '67c127fd-d568-5101-9cda-c617ab7800e1';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'a16ded0c-b125-52d4-9c39-7c894d8ca2a3';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '732e536d-572e-5ffe-9ba8-289645ff509d';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '8e92e5aa-1d1b-55ba-aaac-5a04f3b3f7ce';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '5e78d0fe-d557-5974-91d9-43440a4b5b65';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'f260fb00-3406-5089-a679-209fedee41dc';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '4f6ce495-3e02-50b0-b273-d0083a5492d2';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '41b4bbfc-f0f1-5c23-ae26-7f54312a6366';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '0a0788ca-9498-5220-afaf-3ae2afac8680';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '338fefca-3276-53c9-a108-429419c7f8ec';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'cdaf3dc8-ed1e-5e47-aee5-63202eb50c27';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'fd8757e3-08f5-535f-98c7-eec7016e5594';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'f31b36c7-2e4b-54a2-ac20-57e500704ce6';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '7deff4f4-e9f5-5a57-bb64-cffc5c0febf7';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'c3a2d2d4-fdc6-5dfa-8916-1a53f2746862';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '64495a7e-6e9c-5f12-8657-22d2fc2a1d59';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'f7af5130-59a8-5161-a0c4-7fce3f5e147e';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '8ce789a5-8d52-5740-b795-afcd03f7169c';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '8df09a83-a5d7-5a37-8f7e-5cb7fc972d28';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '5a33c440-02bc-58d8-9f01-712ec7c3e102';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'a78a41ec-7ecd-5cdb-8844-20a0932ceefe';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'b5940e46-1a27-5709-83f5-b294913df832';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '9cce971e-1afd-5f7f-b84b-12f2dbe92517';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '3be8f312-5e15-54fb-a561-288880d93644';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '98d4878e-dfd3-540e-9bce-7f75ec7a4316';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '473c0f84-ea36-57a4-9363-24b477620633';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '8cb8c8d3-6d3a-5947-b7a3-9cb776b85f0a';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '9f5bd1d6-2068-508e-94fb-9fe4bae9907b';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '460f6062-a742-59d5-980d-434678a79549';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'ff068a2b-bcb1-5f79-b7e5-e897b5dbede6';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '05ffda33-3bd7-5bc8-b276-8f33e0266eb7';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '3d9b9225-a578-524f-b2e4-49d8637b858d';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '64bf1cfb-4e15-5847-a730-8d36f6cc8a0a';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '8f790001-a213-5972-b7bd-09c44bdc32d2';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '935069e4-8ebf-5029-9426-678f9732f8cc';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'c1ca79b9-6220-5a72-b95b-0c17a27499d1';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'd514eaec-8bdd-54f4-8e0e-3a5adb4d1cf8';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'bb3f580e-66a5-5ee7-aed0-fa1a9b4d98f1';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'ed943e7c-9554-54a1-bc28-0df025aaeb42';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '4a9bfbca-ca7f-50be-9009-6f8d23e37355';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '0414c497-8a01-5cff-8fba-1b1f9cbbd320';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '4e1300c0-713e-59ef-a7c9-5a1dd6ed7c1f';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '995f4312-ca45-5112-b941-61fac9aba16f';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '52d391f1-f14d-5a92-a872-29a748c9d9ff';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '42b74cbd-a569-55cc-94b9-6faa61a5ef17';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'a292130e-b4f7-56c0-849d-e5352f7cd978';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'ed5782b9-fcee-56bf-956c-b0a5ed41c123';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '0d323397-7609-5540-a9a5-cddf4ada8ef7';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'a0ecec19-0aa3-5a1d-9eef-744229534950';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '8feabd6c-cc12-5a48-9c21-42fa374ccc10';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'b89d67ba-e849-54c7-8e64-c71dda04264c';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'ee3b2b60-1689-5bc1-8500-0865a65d605a';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = '9e6f9c45-a5c6-5510-b475-1b4ddf21bebc';
update public.sentences set unit_id = 'cfcde81a-b612-585f-b796-a507c7368e7f' where id = 'bf7e5912-2745-531e-bf22-5c0ba52dccb9';
insert into public.tips (id, unit_id, title_en, body_md, status) values ('146ce785-b82f-5bf1-9450-7e1c902d98ba', 'cfcde81a-b612-585f-b796-a507c7368e7f', 'No pude', '**No pude** means you wanted to or tried, and it did not happen: *No pude ir al asado*. **Dije**, **vine** and **pude** have no accent, but **leer** is regular and keeps it: *leí, leíste*.', 'published') on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, unit_id = excluded.unit_id, status = excluded.status;

-- vinieron-todos → vinieron-todos · no-pudieron
update public.forms set unit_id = '59418fb1-6973-57d9-a75d-e4e21f004b8f', position = 1 where id = '7dbdf667-8abc-5797-bb32-4c0edb648afa'; -- vino
update public.forms set unit_id = '59418fb1-6973-57d9-a75d-e4e21f004b8f', position = 2 where id = 'd319a7d4-cfc9-5192-b396-938e0c740307'; -- vinimos
update public.forms set unit_id = '59418fb1-6973-57d9-a75d-e4e21f004b8f', position = 3 where id = '746c0d9f-e3ce-577d-a8f7-cb5debc2e272'; -- vinieron
update public.forms set unit_id = '59418fb1-6973-57d9-a75d-e4e21f004b8f', position = 4 where id = '464e8999-d3e6-5198-ab4b-53de69f944a7'; -- traje
update public.forms set unit_id = '59418fb1-6973-57d9-a75d-e4e21f004b8f', position = 5 where id = 'f6dd6d1e-d531-58a3-8b1a-44b8d1ec2125'; -- trajiste
update public.forms set unit_id = '59418fb1-6973-57d9-a75d-e4e21f004b8f', position = 6 where id = 'c12c5f6b-fb02-55e9-b629-b4a990f4989b'; -- trajo
update public.forms set unit_id = '59418fb1-6973-57d9-a75d-e4e21f004b8f', position = 7 where id = '4eb57f3a-e952-59dc-92f3-828dfeb96a68'; -- trajeron
update public.forms set unit_id = '59418fb1-6973-57d9-a75d-e4e21f004b8f', position = 8 where id = '7a672f20-c860-5508-91d4-558166acfc52'; -- postre
update public.forms set unit_id = '59418fb1-6973-57d9-a75d-e4e21f004b8f', position = 9 where id = '85ed114f-e42a-5d78-82bc-514f22fe19d6'; -- carbón
update public.forms set unit_id = '59418fb1-6973-57d9-a75d-e4e21f004b8f', position = 10 where id = '01a64e00-d967-54df-a3a9-e2bdfd6f7608'; -- nadie
update public.forms set unit_id = '59418fb1-6973-57d9-a75d-e4e21f004b8f', position = 11 where id = '27be1cf0-040a-5443-bae5-bc6980165f0f'; -- alguien
update public.forms set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c', position = 1 where id = 'a4e0c87a-4d16-5122-a9ae-3ef9c5cf3008'; -- quise
update public.forms set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c', position = 2 where id = 'dd38df79-60b1-5bc0-995e-54d9bdcf33c4'; -- quisiste
update public.forms set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c', position = 3 where id = 'd72ac36d-3b36-5e54-b3c7-77b78f97a7f8'; -- quiso
update public.forms set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c', position = 4 where id = '16e42fe4-601d-5214-9f3a-33b82410b7dd'; -- pudo
update public.forms set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c', position = 5 where id = 'cd91c9d3-c8ab-54ac-a674-660079f83d5e'; -- pudimos
update public.forms set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c', position = 6 where id = '75007e00-9119-5b8d-a1aa-bc82e812d2fa'; -- pudieron
update public.forms set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c', position = 7 where id = '13cdd3e6-b5d0-5371-96dc-0a375834da4a'; -- dijimos
update public.forms set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c', position = 8 where id = '95dba94d-6ef0-5d02-b23a-09eff9700728'; -- dijeron
update public.forms set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c', position = 9 where id = '84cbe74c-7ee2-5f05-bf62-5d68cfce1e21'; -- hicieron
update public.forms set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c', position = 10 where id = '74d16e58-ac78-5300-afe5-0151e42a45aa'; -- vieron
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '3a8505b5-90d6-5827-84ce-bb3680bf85e7';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '7e87fc76-94f9-5276-a0cc-570286d67554';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '2325052d-ea13-5aad-9918-aed8cd3013e9';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '64d1807e-ae52-5123-b79d-deb35a460319';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '3dae9915-1d1b-56a3-91a6-b67cc6735ef4';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '9653a542-78fe-5f87-b1c1-ef23a1e61aaa';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '9508b668-734e-59f5-9b7f-86e0e9efb55c';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '0f9ff06b-2692-58f2-8b40-e2a23203ee7f';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'ce5c58ee-dce5-51cd-9ee6-edc58b92e60f';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '90ae7e97-b8c2-5426-a0cd-6a53df530e1f';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '050f7d33-b8be-5eba-8bc2-a75d237032c3';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '570642a1-cf0a-525a-9c39-bb79999bf85c';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '2c68859f-4edf-5f89-bf67-8879dd7fb640';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '57eee48f-7f8b-5c0c-9433-c53ab084b0ad';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '6685c179-a6c3-548f-a07d-c1565d68f56f';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '816534d3-b6f2-5a10-bf82-68dd0d45062a';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '8cee741b-1a12-5bc3-937a-7d071077f13d';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'fba86df2-0db0-5361-a944-54f3d12b4ed0';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '5e8c7733-edce-5e13-be66-e97717c3105a';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'ba80dddc-d74d-560e-8dfd-0fe2e2f6703b';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '7a020644-14e6-5484-93b8-334ccf66a853';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '9a284b4c-119d-56e9-81e2-645768e0d8cd';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '275c4a85-be75-50a6-b67e-8649074dfc9e';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '980aa603-174d-5974-807a-4d040001c6f5';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '99788a83-0892-5e52-b4c0-634c45d1a272';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '96c12f4e-f86f-52bd-a8f6-1f01e175597e';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '2d2937be-35ca-56c6-be6b-0e4f4e57e56a';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'd90b6b05-d72d-525f-9070-1f6f590919a4';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '0ce7a47e-0f30-5b50-9275-a157ea4999cf';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '72be3fe0-71f9-5484-942c-07916de52ff9';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '9cf2b54e-d437-573a-be41-66ba8c0c7907';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'f8913a2d-be61-5bc8-8fa2-b766ab092145';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '8bf7cb8c-2230-5044-b2d2-4c5f02179471';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '4999f172-191d-5a78-a400-6a2ccf104732';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '0da0ab5d-3407-50a1-80a5-1cd45bc4ce50';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'b8b919f1-487a-57e7-8bc4-954332c9f3f7';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '31c83736-0521-5a18-976b-6a3298ddf878';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'ddbfee36-d7e4-5309-80ef-b39fd8848258';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'f2cb2df3-7b63-5210-904e-cc9616493e45';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'ece148c8-71d2-5ff0-ab42-372d1f261902';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'd5abbd0b-ea69-51e4-95e4-427ff949f947';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '8e3d2fb5-62d8-5eb5-9484-169cdc9037de';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '1a98bbd6-60d1-500c-8004-2f0826d35161';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '218f997e-b228-5ace-a59b-e99ef76c2416';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'c5000436-80e9-53f3-8802-ec68980e3771';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'a07f34dd-62ff-5f66-a5b5-7882af245858';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'b1c8c5b8-8528-570a-acea-cc83e0b8ed86';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '70d7182e-ac03-53aa-9b12-b7148ef3a28a';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '464ce63e-7c68-59cd-bb0a-2a98cdcb7d12';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'c2f46bf0-b440-5161-9d4a-1f47ccbd0db0';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '6f01632d-23e6-5a8c-b035-472151c2b988';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'd98a4ce3-ad8d-559c-9b31-20cf4a74749d';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'a00ba396-5e4e-502f-8fe3-76ad6b133ee5';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '710e96fb-54a4-5605-85c9-55a8d2893ffe';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '82caa5f8-6860-5278-b13f-bbb08212b748';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '156c9b90-200a-544f-88a6-2517ef4b19bb';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'cf8b3c06-9d0b-5673-b63c-634779446983';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '14bd2ab8-4fa5-56ba-b63b-dca8ae05dea3';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '7d2709c2-203b-5f4c-8c15-a70f9353c99a';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '77d18cdb-aeab-5aa8-9421-43b1390efc1c';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'd768339b-59ef-5e05-8273-d69155c8e5bc';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '9609fb5f-5a27-5bae-9842-1c8a11a97228';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '2ad61f9c-85ed-50a5-9b38-f06a78cad28a';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '9d9ece07-c144-5bfd-994f-9e5b5dea19f0';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'be137544-4a6b-5a82-922f-1ef26cc758c2';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '3f87efef-7368-5a3a-83bc-62a85770e155';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'beea3b3b-4234-5563-8b4c-d1c1397de656';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'd81f8420-4410-5f79-b8e6-abb45c107f03';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '6994a093-7dbb-5578-97d5-083003ea1d71';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '44de36a7-c2e1-51c5-9b92-54a9df7fc843';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = 'baf87ad8-6b47-53b7-96bf-528c9e9290a5';
update public.sentences set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '73dfa9ab-3852-5b3c-b4e0-02d551c264b7';
update public.tips set unit_id = 'db9cdddc-6247-5d4c-bc24-76ea6745586c' where id = '717a288c-7ce1-5678-95a9-fb667c3542bc'; -- More of the irregular past

-- me-duele → me-duele · saco-turno
update public.forms set unit_id = '14b391bd-5db8-50a4-a988-428361e7752a', position = 5 where id = '3c9a1cf0-ce12-52f4-a62b-ab8d157a4c6a'; -- cabeza
update public.forms set unit_id = '14b391bd-5db8-50a4-a988-428361e7752a', position = 6 where id = '37c6cdae-76b0-57b7-b2e5-462b8a686518'; -- panza
update public.forms set unit_id = '14b391bd-5db8-50a4-a988-428361e7752a', position = 7 where id = '51d01495-2a18-5986-8d03-f46f9abd177d'; -- espalda
update public.forms set unit_id = '14b391bd-5db8-50a4-a988-428361e7752a', position = 8 where id = '38d051be-6f22-55ea-88ce-f59f392991f0'; -- garganta
update public.forms set unit_id = '14b391bd-5db8-50a4-a988-428361e7752a', position = 9 where id = 'e125d1ce-214d-5ae5-8669-47aeaacd17da'; -- pierna
update public.forms set unit_id = '14b391bd-5db8-50a4-a988-428361e7752a', position = 10 where id = '48e9ee28-f64f-5907-a3c8-c6ef5388f8d9'; -- piernas
update public.forms set unit_id = '14b391bd-5db8-50a4-a988-428361e7752a', position = 11 where id = '60d95979-bb81-517b-aa81-94719dcc2a06'; -- pie
update public.forms set unit_id = '14b391bd-5db8-50a4-a988-428361e7752a', position = 12 where id = '046f62ec-5db7-57f9-8227-452420b9cd8d'; -- pies
update public.forms set unit_id = '14b391bd-5db8-50a4-a988-428361e7752a', position = 13 where id = '26c08243-9063-53fa-ad3b-06bfe4f33c24'; -- mano
update public.forms set unit_id = '14b391bd-5db8-50a4-a988-428361e7752a', position = 14 where id = '22e825c2-9859-58a0-a70e-859dc62f91aa'; -- duele
update public.forms set unit_id = '14b391bd-5db8-50a4-a988-428361e7752a', position = 15 where id = '8539bcfa-aa4d-515e-9ca8-3d01e5123f41'; -- duelen
update public.forms set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc', position = 1 where id = 'c265f348-3392-5209-9097-995e3c7b3dad'; -- muela
update public.forms set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc', position = 2 where id = 'c9782951-5bdf-549e-9bc0-3d5720bf5cf4'; -- fiebre
update public.forms set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc', position = 3 where id = '26955ee0-d991-5532-ad67-759319aaf9a8'; -- engripado
update public.forms set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc', position = 4 where id = '8072c5d8-fc8d-5695-9817-d5a64ebc5b86'; -- engripada
update public.forms set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc', position = 5 where id = '33091f37-2d26-5acb-8a29-b4899de5a5e7'; -- remedio
update public.forms set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc', position = 6 where id = '41c92746-fbd6-5146-91e2-335aa85dd04a'; -- descansar
update public.forms set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc', position = 7 where id = '925927ae-6b03-510b-8ef4-0c5d9fc86d74'; -- descansá
update public.forms set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc', position = 8 where id = '83136b7f-7a92-51d9-9e72-4ef242da7664'; -- turno
update public.forms set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc', position = 9 where id = '112f6ab2-1f30-5357-8aa0-24b821cc86ff'; -- turnos
update public.forms set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc', position = 10 where id = 'eda809df-4d19-5259-a84a-7947923c94d1'; -- sacar
update public.forms set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc', position = 11 where id = 'ed5d253e-de24-5e7e-9c83-591a76b30fa1'; -- guardia
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '893004de-1d5a-50c8-925a-e44d86c43536';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '6403e8a7-2392-5536-8afa-fa9b21d3ecd6';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'bac005d6-fe89-5c68-977a-32904f835444';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '18aa53bd-fbca-57e2-b5f0-fc65c93a27df';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'e12dd9ab-15ec-5698-a522-06bf9de6d10d';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '22192604-fd10-56ae-8128-9fdf9bfd2104';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'edaf505e-d3de-5d05-b1ed-b91b96c0b983';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '2a402ef2-4502-5b5e-bb97-c6067b341379';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '5ec3cd9d-ac06-5f16-b466-b880cab6d2a9';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'ff6c1772-2115-5525-9638-cf3b25f8ad65';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '898c07c4-67cc-54f6-a234-2172774fe1a8';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'dad534f3-548c-5ca7-b315-249b1f67e60d';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '74f3aa93-fd80-55be-a086-88236da6a494';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'a90d12fb-1df2-5927-ae77-caf0b638b900';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '7696268f-4acb-5ec0-beb4-7816139848a0';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '11176a47-44d2-5aa4-a1b4-2d06bded6fec';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '06929d53-a44d-597e-83c3-be8049d834c8';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '24c2aa94-2cf9-5ae0-ad48-0879ae02d0ac';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'c09418a0-5691-5464-89af-05073b5319a4';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'eba7d3b6-8681-5390-960c-9f310ed60b67';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '1db7eef0-44db-5dc3-8a2a-0d44ecf563b4';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '0f30e32a-f5c2-5346-9e55-73c7eaa9a60a';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'd5d93579-686b-57fb-9991-6a4a11e95241';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '9c7b0016-9d03-5d63-b623-9bcc95ba4065';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '1adbf364-97e7-500b-85ba-ef400a6308c4';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '87a81988-5f3c-56ed-b9b2-675599feda89';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '37861352-d686-5d14-8f63-a1328accb6e3';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'e76ea5ec-83da-5bf5-ac87-ea42af3b8bc2';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'c41d5828-79f7-5b82-aadd-ad4d6631b7e2';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '47213c82-fd3b-53ce-b367-0b54e69aa603';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '5016e4c1-45de-5500-bdca-c424d7c554b8';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'a69b708a-7307-561a-9b0c-341a4de68bcb';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '4d8e5a4c-f88f-5ae2-9999-9a386aa76350';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'a2ab1164-b988-5437-8c84-2f5229130ec7';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'd2bb7508-33de-599e-aa20-15c87c2eecd0';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'ab09f723-bf77-55b2-aae2-da5fb708a2b5';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '3c875950-d7b0-51be-a6ce-5a1a8f305d57';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'a5f7b561-8735-52cc-92db-0ccd140f4c64';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '472882ea-9056-5ae0-bee5-4147d51f73a1';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '06f952a3-2d9d-57ac-97ae-0218618e40ec';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'ebecf9cc-c6f3-546b-bc63-d7d596451472';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'a675d642-3cd6-53d5-9717-dbb2174c15d9';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '7788c194-0338-5896-8393-036ead200b11';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '744d9ff8-230e-5482-8998-394eaf800272';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'abe91157-89f9-568b-9943-0e3ea12b4396';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '6b60a6ab-787f-54e3-bc22-f004fb06fbba';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '0d2e984e-7136-54bc-b157-eb8bb578c92f';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '24816876-6f75-59e9-9642-5561ab83370e';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '2d5c8ac0-aa4b-570c-9e8e-bdc973de9b5d';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '60979a55-8d58-5ec6-99b5-a2c4f1d61139';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'fca9efc2-623a-52a4-be93-44784c92b81a';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '5969f1fa-4210-590f-812f-5abc91a55f59';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'd509a6f1-2467-5f2e-8e08-e8c9e3492269';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '946366a1-58e1-5798-b65d-dc5711a926ff';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '900f01f3-fb8a-5887-9193-e03d8d892d27';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'cc4223a2-6b33-5798-886b-a36628a62556';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '6a1288e6-9b71-5ced-bb51-96465f142a9b';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '192da793-3987-516b-88eb-91d393c9a8c2';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'b956157d-5b4f-5654-a91f-0f2e05dea0fd';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '2340e962-8617-5c05-9376-f3f2d5fc1876';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'e6ddba97-8def-5f40-a201-a033f2e9744b';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '99cdd20e-fe53-5a8c-b47a-5cfd4edfa230';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'dee6d58d-582f-508d-9d04-584db147a115';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '9735fde4-afad-5176-b16e-f5ed4c026519';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'a2af2188-2095-5fba-bdbc-f95375812350';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '6ec79c97-eedd-522d-8b2b-725da5d8f29c';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '119cbe08-0167-5257-a82a-0f59ff7e88c6';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'cbb72086-70fe-5618-9a7a-f8c9b2f81f58';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '2f2a0e7d-41eb-5036-8419-6505a6f5c6cd';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '585bdad3-cf8c-578b-8714-496245edd2a2';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'b3207db2-bd69-51ea-98ff-7c248658aea0';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'de13c3eb-455e-5b68-8ad3-067ef41dbb5f';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'f6c5097e-6d23-5060-86d2-8bc4b6bf28b0';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'db6eae16-c922-5b15-8098-1a38fec1efe4';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'b3bae65d-7666-5dc3-a5c6-87a2595ddeef';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'd97d38a9-41ec-58df-87c3-94a39bc8e749';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '20107084-e989-560b-8598-4a9a12596186';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '31b593f6-be5d-55e9-a296-cf64cb4f45cc';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '8250b2b5-8c50-50fa-8977-ee6c85d549ea';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '9d6ff251-98df-5522-a8b3-ec1b1c592a16';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'dd419d4b-db98-5e0c-b995-2da309162e62';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '23b30969-014f-5178-aad2-cdbed8f78b20';
update public.sentences set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = '1fc407fa-6775-583b-a659-e1f7531085ad';
update public.tips set unit_id = 'a5af608a-c55e-5cdb-924e-e84a5a480dbc' where id = 'd389c9c5-149a-57c8-b192-f1851fa1b7df'; -- At the doctor's

-- me-dolio → me-dolio · una-pastilla
update public.units set title_en = 'Say what hurt', summary_en = 'Ayer me dolió la panza' where id = '8a2211a4-bc2b-5df6-bfd3-ed761ce08c9a';
update public.forms set unit_id = '8a2211a4-bc2b-5df6-bfd3-ed761ce08c9a', position = 5 where id = '1f60e085-1f6d-5ef4-9b52-af7c612c291a'; -- brazo
update public.forms set unit_id = '8a2211a4-bc2b-5df6-bfd3-ed761ce08c9a', position = 6 where id = '88a05277-2442-5dff-a5aa-92dae81144e6'; -- rodilla
update public.forms set unit_id = '8a2211a4-bc2b-5df6-bfd3-ed761ce08c9a', position = 7 where id = '3f4229d0-b844-5087-8505-e0a3f596bab8'; -- dedo
update public.forms set unit_id = '8a2211a4-bc2b-5df6-bfd3-ed761ce08c9a', position = 8 where id = 'd1980b9d-3732-5dcd-aba9-b2310b51c765'; -- quebrado
update public.forms set unit_id = '8a2211a4-bc2b-5df6-bfd3-ed761ce08c9a', position = 12 where id = 'bea271c6-3c07-5dea-a7dd-b46e0f137a46'; -- dolor
update public.forms set unit_id = '8a2211a4-bc2b-5df6-bfd3-ed761ce08c9a', position = 13 where id = 'fc630413-378c-5a16-a050-aa6131a02094'; -- dolió
update public.forms set unit_id = '8a2211a4-bc2b-5df6-bfd3-ed761ce08c9a', position = 14 where id = 'cb6ec2cc-d479-506e-a932-baaa8a023da0'; -- dolieron
update public.forms set unit_id = '8a2211a4-bc2b-5df6-bfd3-ed761ce08c9a', position = 15 where id = 'b963170a-59a0-55df-bf3d-bed6910883b5'; -- lastimé
update public.forms set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352', position = 1 where id = '65848f93-df44-5f7c-9a37-f272b89f3df9'; -- me lastimé
update public.forms set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352', position = 2 where id = '26146c83-97ee-516f-a533-c4355c438173'; -- curita
update public.forms set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352', position = 3 where id = '3979014c-19b9-560b-8903-04c11a06ecc6'; -- pastilla
update public.forms set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352', position = 4 where id = 'fe87763c-325f-5891-b900-7c79097a506b'; -- pastillas
update public.forms set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352', position = 5 where id = '908dcc14-348c-5e30-ad63-1a49e0b1943f'; -- resfriado
update public.forms set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352', position = 6 where id = 'b2fea2ca-4cd7-5475-82ad-483b5c998bc8'; -- resfriada
update public.forms set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352', position = 7 where id = '823c8fe9-6d2c-5da9-ad67-721ae6b5989a'; -- resfrío
update public.forms set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352', position = 8 where id = 'be8ea673-9a58-572e-aca7-ba4010d237ad'; -- alergia
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = 'c9043f39-d4c5-5cbe-bfb1-265dbf238915';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = 'a1a13964-2924-5b48-9c99-5338cb663ef4';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '79a20173-5c0a-57f5-ba6c-c1bcd31f1fa8';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '7ba25138-ad65-522d-b726-34008ee3f9dc';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '806c337d-548d-5062-8b71-969114eca867';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = 'fb2f19a0-5686-5b80-990b-c01a8bce0940';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '2bba7cae-69a6-519c-ba45-a4be5fe2beab';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = 'd7680e3c-5f7b-56ab-bf0e-b794c6c0f35f';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '665dbc85-ba8f-57ba-a1b3-6a29444635a4';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = 'bbb1d0e1-bae1-5522-91f7-791756b6a092';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '2d84cb80-cd07-57e9-b92b-3159f17d2db9';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '36ed0ec4-d9aa-5d09-be5a-a62394f22187';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '03498826-3ed4-590f-88dc-c2807c2aec36';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '1195a01d-672b-55a2-af81-6cf3a94e9e22';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '84d92e26-bbb0-5512-8595-9363cad0408b';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '57b7dd87-d2e5-5452-8953-64e4610e43a3';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '2187338a-2775-5dd2-bfb8-99684bba921a';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '50d96d77-0de6-5d07-b6ff-f1313ead08ad';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '760a4b99-3734-5378-b469-04edc1be987f';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '42368ce9-265f-5638-97c0-44923ac555aa';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = 'ff33c66a-8399-577c-a54c-c92e8daf473c';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = 'a75f3f12-cc20-5633-82ad-876671e51c34';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '32fe1c9c-1610-5939-9f0b-87e36faec8a6';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '07a1176e-28bb-5a31-888a-3cd5fcb56977';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '9d3091f6-c541-574c-b8fd-720a3cdc9183';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '4c551591-3d82-5b34-a492-a778cb33f0c2';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = 'fb599c3f-aab2-5ad9-bf43-868623fafd0c';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = 'c650da31-dedf-517f-bb5f-b46014d75e0d';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = 'a0892e15-0bdf-576a-a813-d02e5b060a5d';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '71e755eb-33fd-5ef8-b62d-ad730dffad03';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '3ff100c3-0f6a-5ceb-a345-02f9c04e9c49';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '041bcb09-c1d2-57c0-a1bd-a369889d7200';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = 'f3884094-5bcc-5ed4-9f47-3f7e1374c825';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = 'f60672d9-a6a2-5a1f-a6b9-6f18f63d7e6f';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = 'f7dfd2f2-3be4-5d16-96c2-ff3115b3327a';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '58fba697-6c67-5b20-b766-062593bf6a7b';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '3a2e3720-339c-5338-94e3-8867434ca7fb';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '2a9ab43f-9ec9-53bf-aed4-a5b5180522db';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = 'e6bd1ab4-930d-56d9-8461-86ee45e4b7c2';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '6d473f6d-37da-50e9-9691-e31487906d88';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '5a3ae689-0b8c-58c5-af3d-3f3828cbed12';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = 'b59aa274-d64d-50aa-877d-8243bbbe06f6';
update public.sentences set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = '0ad77caf-0726-55cc-8f2a-1e6be8e2ed00';
update public.tips set unit_id = '210abf76-96da-5b9c-ab0a-08711b636352' where id = 'be9c362e-6f84-5899-8e49-6046ba3c3cf3'; -- At the farmacia

-- te-llamo → te-llamo
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 1 where id = '926532fe-1930-5fed-9eeb-104f14a0d8f1'; -- llamo
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 2 where id = '7122213f-274b-58fa-bedb-5cae70fd8c88'; -- llamás
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 3 where id = 'bd2667ff-84fb-57d4-b9d0-b65c819f4aa8'; -- llama
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 4 where id = '454192d4-9ddf-529b-9842-37997c8f4f8d'; -- llamar
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 5 where id = 'fb5871f9-9c34-5331-bf88-8c028baed5b2'; -- mandás
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 6 where id = '24484073-86a1-5f8a-a7cd-ea0ccd8699bb'; -- dar
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 7 where id = '37824a78-f821-5ad1-bd8c-a59e13435b82'; -- doy
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 8 where id = 'e057e89e-3024-5bdb-ba47-9dfef6ad3b2d'; -- das
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 9 where id = '5231b2ab-bcbb-50ae-a5e4-bdcb47c641bf'; -- da
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 10 where id = '3db5415a-0bd5-50bc-a081-f4e24d1efa94'; -- prestás
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 11 where id = 'e4dafda1-13c2-526d-8faa-e1eaa2cf64fb'; -- prestame
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 12 where id = 'c7508e65-2907-57b8-8063-83e4c4e298d3'; -- paso a buscar
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 13 where id = '1e030cdf-e481-5b31-8578-66d526a5a15d'; -- pasás a buscar
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 14 where id = '442efcf4-8249-5667-b30f-1c055a610103'; -- pasame a buscar
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 15 where id = '078ee89f-16a5-556e-806f-a67a9890429c'; -- encuentro
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 16 where id = '5123c0f2-31c7-5ca1-a841-f87d47c913bb'; -- encontrás
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 17 where id = '89b17f31-167e-56b8-aaf8-99d944d7a475'; -- lo
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 18 where id = 'dfa47ecf-a246-5612-8a97-61edafd4f2f8'; -- la
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 19 where id = '5e83e9c1-c49f-55f3-b068-268cf7fe54b2'; -- los
update public.forms set unit_id = '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', position = 20 where id = '3eec4afe-08ab-5d40-ba25-588819c5c420'; -- las

-- te-llame → te-llame · te-di-la-llave
update public.forms set unit_id = '77e7e28f-74ef-5a8f-b15f-5a5589d48684', position = 7 where id = 'cbb7c696-5a2c-5ae6-b3a0-41835284d7bb'; -- recibí
update public.forms set unit_id = '77e7e28f-74ef-5a8f-b15f-5a5589d48684', position = 8 where id = '07c276b4-2a1a-53db-a687-0f9fc51051ed'; -- recibiste
update public.forms set unit_id = '77e7e28f-74ef-5a8f-b15f-5a5589d48684', position = 9 where id = '6a06bdc3-1f92-5bbc-887d-4d739fa1d87f'; -- foto
update public.forms set unit_id = '77e7e28f-74ef-5a8f-b15f-5a5589d48684', position = 10 where id = '97682d2b-9fbd-5234-878a-aa76644c87a3'; -- fotos
update public.forms set unit_id = '77e7e28f-74ef-5a8f-b15f-5a5589d48684', position = 11 where id = '7e47d4c4-c4d7-541e-933e-519e3739bf18'; -- video
update public.forms set unit_id = '84453bec-650d-5eca-aed2-53342b715463', position = 1 where id = '5f2d3d50-f501-5bee-b087-813a410afe63'; -- di
update public.forms set unit_id = '84453bec-650d-5eca-aed2-53342b715463', position = 2 where id = '2d770600-67ac-5e24-b79f-f8313631959b'; -- diste
update public.forms set unit_id = '84453bec-650d-5eca-aed2-53342b715463', position = 3 where id = 'fa465a67-fe08-5d4b-b994-13821123be48'; -- dio
update public.forms set unit_id = '84453bec-650d-5eca-aed2-53342b715463', position = 4 where id = '3db87cc8-44e9-5883-90ec-585eca84e1de'; -- presté
update public.forms set unit_id = '84453bec-650d-5eca-aed2-53342b715463', position = 5 where id = '4903157a-23ff-5b39-9963-9674c5d26828'; -- prestaste
update public.forms set unit_id = '84453bec-650d-5eca-aed2-53342b715463', position = 6 where id = '65e1b04a-4156-5dd4-be67-04161f048a75'; -- busqué
update public.forms set unit_id = '84453bec-650d-5eca-aed2-53342b715463', position = 7 where id = 'cd2e786f-abe2-562c-9bef-a4a7cec59a00'; -- buscaste
update public.forms set unit_id = '84453bec-650d-5eca-aed2-53342b715463', position = 8 where id = '41d5f2c4-6fad-5278-91c8-20f942ddfb5f'; -- buscame
update public.forms set unit_id = '84453bec-650d-5eca-aed2-53342b715463', position = 9 where id = '5888e19e-1ab5-52f3-99ab-50a66c353c6f'; -- mostrame
update public.forms set unit_id = '84453bec-650d-5eca-aed2-53342b715463', position = 10 where id = 'ccb4f221-97c7-52e6-a838-e0975d957b16'; -- mostré
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '4a2ed374-8365-50f6-ad11-ce350599dd83';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '6dc7c4ca-f166-5734-b989-ac79cf612e01';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'b634a300-ed0c-5b2c-9bf7-a663ff9a61b6';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '36e117af-79a5-5fa1-a53e-6c7687ae6af2';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '23dda142-76bc-5939-94c6-4d1d62cbdd2a';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '1eb163e6-e762-57ed-8185-219a43851a3e';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'ae7084fd-f3d0-5617-ab8d-1c9df7eadd16';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'b8e34863-211f-5819-99e9-12124336a8ff';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '5c3bc40e-9073-5728-8850-a7a81ceebfb2';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '0d7dc23e-9fc5-5964-ae65-d3dd6eb36e63';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'a971c8da-56d3-5e50-8193-8c6dd4ef0a2e';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '806635bf-961f-5127-aae8-8b4b8fd700b2';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '2ff64876-c602-5ac3-84b4-e033245e9dfc';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'bd96f9c4-e929-5902-b470-962460d1bdae';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '2613c3d0-5915-5571-ad5a-b123b88d72cf';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '5631c3dc-2e2b-5155-beab-5b6e5f61517f';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'fa781560-402e-5d18-9728-7553d7a3dd44';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '2be9d2dc-1015-5e0a-9d49-215ee9af9093';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '9f1e8668-6a53-56cd-b7f2-4ed98979e235';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'af62a1d2-258d-549a-ac18-8ed61fae367d';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'bed3e7fb-76a2-5e94-9562-640a82644844';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'ea592ce5-0e2b-562d-8541-d2494f1c3988';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'f472741e-b06d-5282-951b-1137ec29339b';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '9cf03811-eda3-5322-9ac3-3f4f6b156b3f';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'e6860d0f-acd5-552e-8e0e-f4eca016b484';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '8114d374-08ae-5adc-8424-df6cc03e1cde';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '2fb01232-c431-55b9-8aee-05b62c8c3384';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '80be26ed-7507-539e-a5ae-bfee1794706a';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'd186a585-0ba9-50a4-8c63-843d648632a0';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '7ffd223d-ba51-5789-96b9-2184803a3b01';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '54139736-ff77-5288-ae8f-92484de79ed0';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '79153b36-55e5-5f77-b9fc-c46d8a2a9332';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '43cde912-3c90-56fb-a755-2609a7b850b2';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '9a250b0f-8443-546d-ace8-b66618e53993';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '7ef872af-da58-5999-9ef6-6dd3a4bdcf93';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '9b61b7c2-866a-5d6a-95ad-d43b00af953e';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'f44eb196-0e84-5e55-8ad8-490f45d6163f';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'd9a94370-b5ba-5858-9c19-f41432e70465';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'afdc0b3c-13d7-5623-ab2f-73b5c441cfed';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '0c945a8c-d37e-514b-8603-fdd175454eb0';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'a8bd743e-2071-52e3-915c-86e608930d86';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'a248c6ab-c7fb-52c2-b47d-467c783acc6d';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '0d52a1f7-cff8-55be-ac0e-932e32ebd098';
update public.sentences set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = 'd3ecb395-6ac6-50e0-a807-938264b70416';
update public.tips set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '7fd0a81b-3973-5a9c-8a43-62a122aa7461'; -- Di, busqué
update public.tips set unit_id = '84453bec-650d-5eca-aed2-53342b715463' where id = '89462fe8-f55c-5371-aa23-378aa233d61a'; -- Le di la llave a Sofi

-- las-tareas → las-tareas · limpio-y-ordeno
update public.forms set unit_id = 'c72176ae-a8de-5a47-9b37-cf9bdf84de08', position = 1 where id = '4b63c62f-85e0-5b56-a4ce-c35eb516690a'; -- lavo
update public.forms set unit_id = 'c72176ae-a8de-5a47-9b37-cf9bdf84de08', position = 2 where id = '6bc5d1cb-5266-5b2c-8a07-dfdc2f9aa15e'; -- lavás
update public.forms set unit_id = 'c72176ae-a8de-5a47-9b37-cf9bdf84de08', position = 3 where id = '5645fadc-eabf-55dc-a13a-2cc9425d00ef'; -- lavar
update public.forms set unit_id = 'c72176ae-a8de-5a47-9b37-cf9bdf84de08', position = 4 where id = '640d6017-a7cb-531a-96b6-ffca1f16da8c'; -- platos
update public.forms set unit_id = 'c72176ae-a8de-5a47-9b37-cf9bdf84de08', position = 5 where id = 'b25a48eb-b050-5c18-ad12-ffe465917d59'; -- saco
update public.forms set unit_id = 'c72176ae-a8de-5a47-9b37-cf9bdf84de08', position = 6 where id = 'dbc2fcb4-1d52-5d2e-867c-ef1d71ea8097'; -- sacás
update public.forms set unit_id = 'c72176ae-a8de-5a47-9b37-cf9bdf84de08', position = 7 where id = '7447e117-fd92-5a5f-8c56-39600c48cf5c'; -- basura
update public.forms set unit_id = 'c72176ae-a8de-5a47-9b37-cf9bdf84de08', position = 8 where id = '984fab9f-358c-59e2-b68d-0d5424bf2cce'; -- me toca
update public.forms set unit_id = 'c72176ae-a8de-5a47-9b37-cf9bdf84de08', position = 9 where id = 'a648ba67-40aa-568d-a02b-cb1f4dc5d041'; -- te toca
update public.forms set unit_id = 'c72176ae-a8de-5a47-9b37-cf9bdf84de08', position = 10 where id = '56c3a942-4781-5a50-9d6c-c6540f24b5bd'; -- le toca
update public.forms set unit_id = 'c72176ae-a8de-5a47-9b37-cf9bdf84de08', position = 11 where id = 'f153835c-2320-5aca-b3da-5f2cfbc6f426'; -- toca
update public.forms set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80', position = 1 where id = 'e6c15d68-8ed4-5ffd-9b44-46e616d97712'; -- limpio
update public.forms set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80', position = 2 where id = '3a852cc7-bfea-5e3e-a3da-f1273809e44e'; -- limpiás
update public.forms set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80', position = 3 where id = '1d6fe6d1-fb6c-5966-9728-a0546176dfe6'; -- limpiar
update public.forms set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80', position = 4 where id = '41e001b2-8f15-513e-9f99-5264f0e04351'; -- limpio
update public.forms set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80', position = 5 where id = '279af075-19a7-5809-9697-0088efac04d0'; -- limpia
update public.forms set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80', position = 6 where id = 'adc6d2b9-2656-5a6c-bb18-19ceaa3ccc79'; -- ordeno
update public.forms set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80', position = 7 where id = 'b4d5fdb1-75e6-5685-8270-8351ea23daee'; -- ordenar
update public.forms set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80', position = 8 where id = '0b978e0d-38e0-54cd-b780-ac7aa4cfdcb8'; -- compras
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '0ee6d679-91bf-5e80-8088-21471a371640';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'e702401f-c906-52fd-9891-dcd8fb254563';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'f3b6a8d5-3af7-52db-b3ef-7c4c19983aa4';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'cc315458-4e48-5727-8a3f-f520980529e0';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'b2e3e0b7-4b3d-5aa0-9d1d-d5b14103f115';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'fc08c70d-b57e-5e36-b505-d91fadf20590';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '19d5c812-0ac1-54d1-9747-a75f00e818e8';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'd955d657-87fc-52d9-a133-8a47b8ecff39';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '46c1bd28-155f-5a82-9811-ef042519c58c';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'da03417f-038b-5a26-8082-12b1c0d3bd98';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '1fb5ecae-92e5-53f2-b5b0-9c1330f54282';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '4500e896-40a2-5a82-ba38-020ffc8f6acc';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '7afa19f9-483a-5ddd-8c92-4bd6acf89ca9';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'fd32e47b-7494-5912-a478-90e65f88dc71';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'ccf060a3-40b1-580a-8fe1-12942905c9b7';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'a1fdb8a7-4b61-514d-b8d4-d3923ce389f9';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '7d08acf5-9613-57db-9cee-4aab15f4821b';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'acaec801-c080-5147-9df9-492bfe0284c3';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '7493e4bc-3088-5167-8c30-fc3ec1d75100';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '8c211406-481b-5bda-a0ac-8c3452472a03';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '424d60a9-6652-5c1d-83a1-4fd2009efb4f';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'b4f1031d-f2c7-5ecc-9c99-f619a16b1caf';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'b8c0632b-8890-557a-840c-a4e812df7107';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '59573ac1-2adc-5344-9b4e-89529b43836c';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '774e165c-3935-5b46-b0b6-b2ba24b52beb';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '992e8e2a-d824-5f9c-a3ed-28ce50707edd';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '4bce4a61-12ab-51db-a5ec-ab32fe0773e5';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '74b66e7d-e7e9-50c4-a3ce-0e92508ec41c';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '8bece1fd-5650-5df1-90a6-6283bca3acd3';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'ef92de27-4896-5977-859d-4bbac33a9e1b';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '0021c4b6-aadb-58b8-881a-406a562492dd';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'd4a554fa-efc7-52b7-b67d-87c5214393aa';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'aeb4178d-566d-5c0a-a467-0568ba45131c';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'c654cb8a-c5a7-5287-a319-2f6b016fa698';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'e884b899-336a-5245-8f01-a2cdc292d96b';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '1880bbf5-4da4-5565-ad47-1102d3fc9eae';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '28849e67-912f-54ac-a125-c499929a1c87';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '17ef22c9-fa41-59c9-ae0b-63c729ecd378';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'b2b79250-fa77-53a6-b8cd-a580eb8ebf95';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '2d2a0bbb-3381-52ed-a4e5-2366fa6d56fa';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '5faf4cfb-07aa-54de-bf6f-8969f404b7f2';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '0c89d0e0-acac-5e30-8039-28dfd17b579a';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '0c1ce680-409f-5691-8011-8cb1d66b0a3f';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '513e0910-3302-5e7c-b93d-6a9aeff73f3e';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '175aba6d-b9f1-544e-aa47-3b71bd42fac3';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'c24885e2-c16b-5f9d-a84e-00fe5edbc38e';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '38f1a3fa-de7f-5e9f-821e-dbfe941ea126';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '392b9a56-8599-5a12-a701-358539b591b1';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '24986ec1-22a8-5b27-8e6f-5d6527f11b83';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '4dfc1b58-0dfe-5f0a-93b6-1ad26b150985';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'f84adb5b-3c41-5b04-8d85-269cd24a05e9';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'd64088c7-a335-55f7-9545-5c6934ca8a4b';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '8eeb3a17-b26d-5186-aaa6-9e4de6a559ad';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'eff404a4-2f3d-53ff-826a-a606268d87b4';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '4055b081-d91c-5cd5-93cf-8f435712b3c1';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'a550a695-13ee-5316-89df-6789e368195c';
update public.sentences set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '608ef084-3619-568d-a489-3871b65fccf3';
update public.tips set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = 'f43aa982-0fdb-5614-8cae-b7495273b35c'; -- Limpio, limpia
update public.tips set unit_id = '640530cd-87e4-520c-878f-bbe49fba8b80' where id = '8f8bb283-35a4-5157-9b3c-f50aae639ff9'; -- Las compras

-- quien-lavo → quien-lavo · barri-y-planche
update public.forms set unit_id = '51c29d65-4514-5131-bc0a-f7a48158b1db', position = 12 where id = 'ea5ba3e8-367d-5e59-8646-57134483a522'; -- me tocó
update public.forms set unit_id = '51c29d65-4514-5131-bc0a-f7a48158b1db', position = 13 where id = '5eb3dd88-543d-5e54-bb80-23c45b20e10a'; -- te tocó
update public.forms set unit_id = '51c29d65-4514-5131-bc0a-f7a48158b1db', position = 14 where id = '6a186608-8050-550d-8a0d-29c80d101cb5'; -- le tocó
update public.forms set unit_id = '51c29d65-4514-5131-bc0a-f7a48158b1db', position = 15 where id = 'cd271878-5976-5edb-b4f5-eb3d9b178c92'; -- tocó
update public.forms set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a', position = 1 where id = 'a8b3c48d-0bb6-5846-bd67-fa1081ffd230'; -- barrer
update public.forms set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a', position = 2 where id = '811a85ff-8ed9-5077-953e-45ee27de8c87'; -- barrí
update public.forms set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a', position = 3 where id = '30ae0ada-6894-507a-9b4f-ed7f0f1e484b'; -- barriste
update public.forms set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a', position = 4 where id = 'f077378d-9d64-57fe-8970-2bf6f4eec184'; -- escoba
update public.forms set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a', position = 5 where id = '5ba97059-cca4-5fc1-91ac-9f49064a9233'; -- planchar
update public.forms set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a', position = 6 where id = '59c597ae-2412-532e-90d6-81684c5917c8'; -- planché
update public.forms set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a', position = 7 where id = '30b42e32-0528-57de-9c8b-53a16f90c59e'; -- lavarropas
update public.forms set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a', position = 8 where id = '3403ee34-bcf6-558c-aa14-2a4af8593878'; -- trapo
update public.forms set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a', position = 9 where id = '55b43397-530e-5530-99ab-ea9be6277335'; -- mugre
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '72551223-4a18-57c0-b695-68b063dcdd00';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = 'adf93c3a-e9f4-53d9-b89d-7f819d364905';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '600686f7-eb19-5dd0-99bb-d22da18c2642';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '49397661-08ea-58d8-897c-7c14af11d7e9';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = 'ad417f2b-0c61-57c9-9f4e-fcce27ec33ff';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '7dd52e39-b967-5a11-aa0a-d6cca9bea05f';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '2eeb1404-fd55-5ca6-883c-78b6a9d5cbce';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '00774c79-5f3a-5f16-86ce-5415583a0625';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = 'e14d711c-71f7-5957-9d08-c0dbe93b9f7b';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '1b3702f1-5233-5e89-bd6f-bf817489ae5d';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '5ac55549-8c3b-5eb7-acad-389e8abce9ca';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '23f7c078-46ac-52e8-b2e0-6183ad3378e3';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = 'cc18c13a-26dd-5e63-bb00-587bec059908';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '4cbdd6e4-5758-539d-982f-fb9ed0596083';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '35dbc2d0-9286-5fa8-a0b5-0e2cd4d54ef2';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '0eba15f6-c705-598a-b9b7-e39c2fa5c2b2';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '9259c633-bdb8-536c-b267-409fb0c6b58f';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = 'b9395141-8db6-5144-9fbb-46a340cf7c80';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '3ef17cd6-76d5-53cb-8043-5a43e7409728';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '4071c2f7-9309-5e15-900a-5abe0ceb8cdd';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = 'f6457424-a069-545f-91e4-4cecbb79f06f';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '8d9ca741-7fd7-5aea-829e-e5e53b99f965';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '31f6db36-93b1-569a-8ccc-299e4511a5ff';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '6f5da498-4508-5a8b-ba5f-80061d839f02';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '6d17a732-6ab5-589b-9226-41ba92e43832';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = 'f663515c-e872-524b-8158-3a0920a1836c';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = 'c7608920-676f-594e-afb2-4ce553309d13';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '60b424f9-8e88-5ad5-9379-44955109d1c9';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = 'e188c3a3-c089-525c-81e0-44b91df8b2f6';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = 'b951cc69-bdb2-5850-9558-b875d203aa0c';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '05ae58d7-1242-5e53-8ddf-f6bb835dfe45';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = 'cb1e813d-289d-548a-ba15-0053b910cdbe';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '5fd5f6a2-7594-5289-9861-89c05dc3bd3b';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = 'a1ee2ed2-a8c4-5c10-a001-783ea192cdba';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '3594e0e7-ed07-552d-aa20-c7f6489e037f';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '3b16946e-b861-5779-a734-4a602e1f61ff';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '21f83be2-6137-5ac1-8e15-83f52581da13';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '14c2a943-c9a0-5b1f-b59e-08a014de13a5';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = 'e203b7ad-42b6-5e88-a24b-1de901b8105f';
update public.sentences set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = '2ced8f01-2d90-5fa1-acdc-d8b2a2f6dce9';
update public.tips set unit_id = '3162d1fe-1cae-5208-8e3c-6b43f92afa1a' where id = 'aff1bd39-fd35-5a50-a00c-5f4e71e503d4'; -- El lavarropas

-- de-viaje → de-viaje · ida-y-vuelta
update public.forms set unit_id = '7c33a900-8b22-5a9e-a34e-7c274e6a21b0', position = 1 where id = 'fd0101b0-772b-5106-886d-65ad3d844389'; -- viajé
update public.forms set unit_id = '7c33a900-8b22-5a9e-a34e-7c274e6a21b0', position = 2 where id = '8bf70864-4b6e-5ad9-b661-ac1ab7ec90fb'; -- viajaste
update public.forms set unit_id = '7c33a900-8b22-5a9e-a34e-7c274e6a21b0', position = 3 where id = '3108127b-e016-5148-a5e2-9c9456c5abe5'; -- me fui
update public.forms set unit_id = '7c33a900-8b22-5a9e-a34e-7c274e6a21b0', position = 4 where id = '6b9ebab7-5e13-55fa-97ce-fb7b5f1787a6'; -- te fuiste
update public.forms set unit_id = '7c33a900-8b22-5a9e-a34e-7c274e6a21b0', position = 5 where id = '6145fbc7-90e8-5995-b48a-ce582d43764d'; -- vacaciones
update public.forms set unit_id = '7c33a900-8b22-5a9e-a34e-7c274e6a21b0', position = 6 where id = 'b9cf7a9d-671a-5bd0-b0c8-4fda8e795def'; -- valija
update public.forms set unit_id = '7c33a900-8b22-5a9e-a34e-7c274e6a21b0', position = 7 where id = 'd19d2561-10af-5e94-84b7-6c673d0dfc3f'; -- mar
update public.forms set unit_id = '7c33a900-8b22-5a9e-a34e-7c274e6a21b0', position = 8 where id = 'eac3d593-e2e2-5eda-abf4-731466f341c1'; -- montaña
update public.forms set unit_id = '7c33a900-8b22-5a9e-a34e-7c274e6a21b0', position = 9 where id = '65b386f3-3450-54b8-a5c4-714a6ed107de'; -- Mar del Plata
update public.forms set unit_id = '7c33a900-8b22-5a9e-a34e-7c274e6a21b0', position = 10 where id = 'a4cb1190-501a-5dbc-9266-1daa616201da'; -- Bariloche
update public.forms set unit_id = '7c33a900-8b22-5a9e-a34e-7c274e6a21b0', position = 11 where id = 'f1642425-9dc0-5bd9-b161-e3d3d6316a3b'; -- e
update public.forms set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a', position = 1 where id = 'dc11331c-3e40-518c-9e1b-6116b0326fd6'; -- pasaje
update public.forms set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a', position = 2 where id = '215c55a3-f361-5ec8-b3de-e1ebfea99be0'; -- pasajes
update public.forms set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a', position = 3 where id = 'c27eb0ce-ae4e-52dc-9e75-1bd015c5d911'; -- ida y vuelta
update public.forms set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a', position = 4 where id = 'd9b8e9df-3413-5016-87f9-2f8d60f3081f'; -- micro
update public.forms set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a', position = 5 where id = '361ebeaf-7ee6-5c9d-96fb-a7b648281172'; -- terminal
update public.forms set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a', position = 6 where id = '373807e4-fadb-5ec3-a801-e87bdf44583c'; -- avión
update public.forms set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a', position = 7 where id = '382187de-0a0b-5800-95aa-69c0d95ed3b5'; -- vuelo
update public.forms set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a', position = 8 where id = '9b784ad0-8077-5c3b-90b9-725f1bf42049'; -- reservé
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '2d907c01-f271-5ee2-b383-fa37c60d35aa';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '9d6f65ac-6327-59ee-9b49-7c056f600156';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '92d9b2fc-594d-5bdb-a2d2-cc748ea05bca';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '3072e4cb-ee4e-5185-bf89-19b36a0af929';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '87671024-db85-571a-978a-58ba5dbd61c8';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '34a7b6c7-c2ce-5b10-a9d9-d0973ce84503';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '529594fa-0b56-51eb-ad0d-199e1a2e9aaf';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '1a8fa94c-4769-5042-924f-1a28a5116706';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '4e217742-c724-59e6-94db-c5564f27ea2c';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '288656fe-8ab6-51c2-a497-a93ee35970f6';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '136ba803-25fa-5f8e-b053-915bd30f6bd7';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = 'ea3b78c8-caf1-5011-80ad-f08b8fb3168f';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = 'd87bc7bc-ac4f-58ef-94db-519f3372ce6c';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '17a1f5e3-0995-5e65-a5df-335a7cd0af4d';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '4bd35223-2562-552d-9e8c-babe5a0e4231';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '2f0a9266-14d3-535b-8761-01b69e864307';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '1330759f-a323-57e5-85f6-3a9fd1e89ede';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '7eafe699-f308-53de-b3b9-fd7f4e38fbd9';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '8ccb6e34-eaa3-5b4e-b7ca-fb7c56a01fd5';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = 'd22b0c21-6c3a-59c6-876c-2b0a6e69d65b';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = 'd9bcec02-c3b7-51ce-b92e-90eb6f9eeadf';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = 'd0651fe9-d3e7-5edc-8e6a-a14547720f1b';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '10839398-9ccb-53b0-bcfd-98e539429015';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '8a75a0e5-9c5d-5837-93e3-aeae5556d349';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '2d5fb307-d46d-5fe8-ab2c-6d1a7397e057';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '646deb8e-5be9-5232-aa61-c1ae8cc4e9d8';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '1026d226-3888-57bb-aba3-ccc40382b94f';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = 'e5bb774e-fa90-5603-b18e-7d2d1008cc3f';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '5f53021a-f8fa-5508-b349-6126b980a075';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '051b2636-9dbc-5c28-a0d1-4c0e82ae77df';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '414a6bba-7434-58a1-95da-c8ef132211c8';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '974b6bbc-5421-5bc8-aab0-acd72198ff7d';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '8981e9bd-2ae9-5cb9-a9c3-e22d65fc118d';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '691223ce-3bac-5173-b9c4-cd4ad043606e';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '7c46cd51-e279-58dc-bf1d-f7f24c97cb4e';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '08de3acc-2517-5ab1-a305-d2f44fbe7f2d';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = 'a665c2c7-82a2-5f16-8c1d-89abca248325';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '32f408b1-88c6-56dc-897b-52b367ffc5bf';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '8a52ccf3-a0dc-5e1f-b560-f8bce6b0fe63';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '3b600aef-8a37-5189-89d9-149820f15e6a';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = 'c0aa8073-83c4-597d-b8d2-9b566fbc3823';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '8099f65e-53bd-5df5-a18c-8a303ff64bca';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = 'ff7b2c01-7636-5b5d-a9ca-2588510ae600';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '81e8a390-c7dc-5b41-a8fc-6edff11b585d';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '43cf8d3b-9cfd-506e-be83-088346138d83';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '16091cca-12ef-58d3-9e21-0a7f15bec8bc';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '59b8527c-f6ec-512f-8204-e39073cd6577';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '9d75deba-b24c-5e04-8736-d82d50ae4e16';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '97b89d4e-31e4-5870-af16-4597204f78a9';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = 'd9b6285e-eab3-5c32-ac32-281f80594817';
update public.sentences set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = '0ef587a7-5b1d-52cc-8633-b5008dc1a9ed';
update public.tips set unit_id = '47b6f982-414d-5137-99af-16c1bc6ab98a' where id = 'e6e2d7cb-a37e-547a-b841-bd24476880df'; -- Micro, not colectivo

-- las-vacaciones → las-vacaciones · paseamos-por-las-sierras
update public.units set title_en = 'Tell what you did at the beach and the river', summary_en = 'Alquilamos una carpa' where id = '76cdfd4e-984e-51cf-b109-bac7fe371aa2';
update public.forms set unit_id = '76cdfd4e-984e-51cf-b109-bac7fe371aa2', position = 1 where id = '887a9a3d-5177-5087-9109-007c85cde96b'; -- alquilé
update public.forms set unit_id = '76cdfd4e-984e-51cf-b109-bac7fe371aa2', position = 2 where id = 'f589aa26-9fa2-5d75-8e38-441f0525937c'; -- alquilamos
update public.forms set unit_id = '76cdfd4e-984e-51cf-b109-bac7fe371aa2', position = 3 where id = 'a7e30bd4-3270-575a-be74-f3337b22325c'; -- costa
update public.forms set unit_id = '76cdfd4e-984e-51cf-b109-bac7fe371aa2', position = 4 where id = 'fba83195-f87a-5a63-b981-2cec1b60c6a8'; -- carpa
update public.forms set unit_id = '76cdfd4e-984e-51cf-b109-bac7fe371aa2', position = 5 where id = 'f771d159-7bb8-56e1-9c0f-479e047ab255'; -- arena
update public.forms set unit_id = '76cdfd4e-984e-51cf-b109-bac7fe371aa2', position = 6 where id = 'e91a6428-0b0e-5fc1-b6fb-d9c46e48c7ec'; -- nadé
update public.forms set unit_id = '76cdfd4e-984e-51cf-b109-bac7fe371aa2', position = 7 where id = '981960a1-cbb1-5e96-9105-6fd079eb96d3'; -- nadamos
update public.forms set unit_id = '76cdfd4e-984e-51cf-b109-bac7fe371aa2', position = 8 where id = '1876331a-576b-5b4d-9516-39a13299a95c'; -- nos metimos
update public.forms set unit_id = '76cdfd4e-984e-51cf-b109-bac7fe371aa2', position = 9 where id = '77b0666a-ea1f-563e-bccf-145aef7f2703'; -- te metés
update public.forms set unit_id = '76cdfd4e-984e-51cf-b109-bac7fe371aa2', position = 10 where id = 'cb8b19e0-b748-5002-8bcb-43d555303fec'; -- río
update public.forms set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4', position = 1 where id = 'f3c4ccad-d705-54cd-b913-0373794535b9'; -- viajó
update public.forms set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4', position = 2 where id = '771025fd-d14e-5f5d-a91f-473ff437a2fb'; -- viajaron
update public.forms set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4', position = 3 where id = '5ad93cdc-6611-5423-905e-f44d3e451cab'; -- sierras
update public.forms set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4', position = 4 where id = 'd9079284-2da3-57ed-8cc7-d2c30a7252f2'; -- campo
update public.forms set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4', position = 5 where id = '5325644c-2fa0-5969-9d2a-790d403fba05'; -- paseamos
update public.forms set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4', position = 6 where id = '86716bf4-a266-5322-8a2a-76f64f9e6d0c'; -- sacamos
update public.forms set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4', position = 7 where id = 'e1a2de2b-c45d-5830-a5f3-3406c27ba9fd'; -- llovió
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = 'a6020dbf-3a48-52c7-9572-8b1f3a741f5d';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = 'b6f0130c-a1f9-581b-812a-a1b16128e6a2';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = 'b24c0864-7d8f-5169-bb26-2d86ec6aabe5';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '2c524ad3-1a13-5715-ae40-f3959ff85d01';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '65951579-6522-592b-be63-6157a30d57db';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '4e66d965-45b6-5496-b1bd-ded36016c390';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = 'c145084e-308e-5b7d-8557-6756768746ec';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '67a31a45-308c-5aa5-9578-562773d7c512';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '0b459658-8c77-5803-9c57-55548cfa92de';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '082508b1-f770-539e-a502-7cc8980598a7';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = 'eba4a3b4-aa76-532d-9b9f-80583ab9de82';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '9eaa25f1-e30c-5260-9cde-04cc62ad5bbc';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '6435126d-4039-5221-9bdf-782ba4e2efdb';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '74372b5a-504f-5e84-9baf-9798c1d9787a';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = 'd15f7214-291c-54d9-ac0b-851f39533f01';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '42ec0b5a-173e-5991-8dd5-0dfd28c020b9';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '6f78cbc5-5da2-5dcc-a76e-90f6c81f5ad7';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '024013fd-1a59-50f3-af9b-183faf561bb8';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '23f83aad-06bf-51bc-8719-224d1c17b53e';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '8519aed1-f9d1-57f8-a184-db0e671c12e2';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '15269743-6b60-59df-8e9b-1c417ac7755f';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '6b666b67-c2a4-55ee-81c4-7d6a518b6efd';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '6141a41f-fa29-53fd-89e9-b2984357c5cc';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '66ba44e6-2a4c-5c53-aa61-817facdbe91e';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = 'f52ce046-6fa1-5efe-be24-d2e3862d151e';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '9b5d62c4-47a0-55cb-be2f-c75e29206786';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '093c7d2a-6838-52da-b45d-b56a5587f351';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = 'a0afa4be-016c-5b33-aea8-8e9018c81cc8';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = 'f0546685-7c5e-5dbe-98e9-fb06d39f2504';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '6422762e-6941-5467-b3f9-88a448a74fe5';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '646c1f89-1d10-56fd-b460-989d149b570e';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '778fc59f-8287-56ee-801b-3b54664c97dc';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = 'daf13980-a34c-5edd-a483-6e534a9419fd';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = 'a543b121-a5ce-5aeb-8868-adc5ed0ff800';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = '799a858c-ad3b-50f7-b9ea-c8c08c3311d9';
update public.sentences set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = 'dbedbf5f-0d9b-5ac1-ac00-3a18fa89003c';
update public.tips set unit_id = '6f41c0fe-60e8-529e-b60e-534814ef5fa4' where id = 'bd5cb236-10da-572d-bfd4-d7b1bf5ec6d4'; -- The holiday is a we

-- menos-mal → menos-mal · no-te-puedo-creer
update public.forms set unit_id = '89b3ea96-dbbd-5f0a-8651-0308bd27297d', position = 1 where id = '9b1dfdeb-9e41-5060-a261-6c8ad1f1eefa'; -- me pasó
update public.forms set unit_id = '89b3ea96-dbbd-5f0a-8651-0308bd27297d', position = 2 where id = '73ff442b-bef7-500a-a4dd-dcc3cc5b3910'; -- te pasó
update public.forms set unit_id = '89b3ea96-dbbd-5f0a-8651-0308bd27297d', position = 3 where id = '906e7dbd-d4ef-5e06-a1b7-94389a3e3d14'; -- le pasó
update public.forms set unit_id = '89b3ea96-dbbd-5f0a-8651-0308bd27297d', position = 4 where id = 'b1c607ab-44c5-525c-8201-2a8fc56dbc33'; -- conté
update public.forms set unit_id = '89b3ea96-dbbd-5f0a-8651-0308bd27297d', position = 5 where id = 'f032b62f-4c47-5b4b-afbc-0cdc9104eaf2'; -- contaste
update public.forms set unit_id = '89b3ea96-dbbd-5f0a-8651-0308bd27297d', position = 6 where id = '8a28e519-941d-51d8-96ff-2ad9c50a8db6'; -- contó
update public.forms set unit_id = '89b3ea96-dbbd-5f0a-8651-0308bd27297d', position = 7 where id = '2e35b740-f05c-561b-860c-e972e09e0f29'; -- historia
update public.forms set unit_id = '89b3ea96-dbbd-5f0a-8651-0308bd27297d', position = 8 where id = '7272c206-cd7d-58fa-89c5-271597923163'; -- así que
update public.forms set unit_id = '89b3ea96-dbbd-5f0a-8651-0308bd27297d', position = 9 where id = '4f161329-b880-5a26-bec3-d22c79d39c45'; -- por eso
update public.forms set unit_id = '89b3ea96-dbbd-5f0a-8651-0308bd27297d', position = 10 where id = 'e37e3555-9392-529c-8dc8-9e6e12b97929'; -- enseguida
update public.forms set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b', position = 1 where id = '1fa57de0-0baa-57b6-b0be-6a3405d9aed5'; -- uy
update public.forms set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b', position = 2 where id = 'eaba34cb-0ba9-5f62-bc27-8c64c13bd844'; -- en serio
update public.forms set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b', position = 3 where id = '7632b0c4-aafd-5e8a-a7e9-9746037246f7'; -- no te puedo creer
update public.forms set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b', position = 4 where id = 'c85bccdb-7bbe-5132-8da5-33d772ae9e6b'; -- menos mal
update public.forms set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b', position = 5 where id = 'a2df4219-b9ae-54bd-96ab-b469ff98d328'; -- por fin
update public.forms set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b', position = 6 where id = '0e2d3462-0979-5991-917d-de0593d4891e'; -- un montón
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '795cc930-907c-5965-a580-75561cb89254';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '796b39cc-7d55-5c96-b280-648b0d7e7af6';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = 'e8b82812-25ba-5804-820f-73c642ae5b65';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = 'ec8fab55-375c-5e18-8c27-03f018bc3f95';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = 'e715b5af-5f15-58a5-b663-821d6b15081d';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = 'a42450cf-8fca-5e31-bf56-646eefb51719';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = 'ffd046b4-09f3-5beb-91ee-856c2ef0e0eb';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = 'ec4cde0f-7fa7-560f-9145-41cf96873057';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = 'd49798e2-11b0-5948-9c79-5ae562a068e0';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '95624b7b-0dcc-5e61-93f9-c29de0e8d443';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = 'eae9bb77-1fc4-5f05-a023-2a36123298ee';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '8c0df7e1-f19f-54c5-9b57-ce6c1e86541a';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = 'c6a042d5-49fa-57dc-96dd-e5cab5a6b89f';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = 'a538d920-9dff-5340-a18f-0e3f40f0c17e';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = 'b0dd4b54-c091-5d74-b4fd-c5c367935068';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '8a8cc149-bbc7-58ba-8f7a-1aa1c225a88a';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '9b5127eb-6bc9-5201-9a6e-d02c16b6edbb';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = 'c37ce6fd-1169-54e4-a1b7-894a90981767';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = 'a2954503-bd85-5307-916f-c16ec6d7b10b';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '5a0ceccc-c46a-544b-a412-3a22135a57a4';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '333d7d77-0985-54bc-9c85-a7c60590d24f';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '532cd316-420e-58c9-bf79-531c5e06336d';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '5ae1f09a-d055-5a47-a4b1-d9f85b6a6dc3';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '22f5cb70-f538-5d3d-8bf8-070cf97285f2';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '28124acc-aa1c-599c-b012-07132491eeed';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '8c675a28-aebe-51a4-b97b-14ff93b6b966';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '29214c75-5729-55e1-8904-f347d1e73284';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '5c1b0938-dbc2-5bb8-8568-f8414c6c6e16';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '2fe89f05-3e71-597c-a6f9-9b8bbeb1811e';
update public.sentences set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = '3ba29241-61a1-57da-af07-c46224560c69';
update public.tips set unit_id = '644c10bd-ba6b-5ca1-9d7d-71e35cd38a2b' where id = 'eb59a72a-6a28-5738-a51c-17fb712b380a'; -- ¡Menos mal!

-- contame → contame · que-garron
update public.forms set unit_id = '07ff3e13-7b95-55ab-aab7-ac48151e0d8c', position = 8 where id = '780591f8-2027-5373-995f-b6c0d9a75302'; -- además
update public.forms set unit_id = '07ff3e13-7b95-55ab-aab7-ac48151e0d8c', position = 9 where id = '2574fd76-b18d-50a9-baab-6922c0e0d52b'; -- reí
update public.forms set unit_id = '07ff3e13-7b95-55ab-aab7-ac48151e0d8c', position = 10 where id = 'b80e8e7c-a533-5221-a3c2-bf7a04308105'; -- reímos
update public.forms set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa', position = 1 where id = '519911e7-a878-51df-ac32-b26798d04889'; -- garrón
update public.forms set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa', position = 2 where id = '71f70c37-d339-5c9f-9960-50b79d15d28e'; -- chiste
update public.forms set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa', position = 3 where id = '2c9616ee-1b05-5dc7-9114-0675d09a8cbf'; -- chistes
update public.forms set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa', position = 4 where id = 'e3d0dbea-2113-5689-b172-43942d0a457e'; -- gracioso
update public.forms set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa', position = 5 where id = '79055de5-1da8-5979-b910-b7c7689e4c89'; -- graciosa
update public.forms set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa', position = 6 where id = 'b86dd058-33df-5f5b-9690-61c8f10c7d82'; -- me reí
update public.forms set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa', position = 7 where id = '5cf6d64f-ef27-5bc0-82d1-30e51b04df43'; -- nos reímos
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '1b90c286-bd89-5fe3-b526-1292a40c2d2a';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '04dbb499-63d2-5c07-894a-99725b2eb66e';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '160e13f4-ab72-5e49-87f3-b6e0ffe8c2d1';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '8b3ccc66-d14e-5eb5-afbf-1d4870dc7428';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '9d94205c-dd93-5f1b-9737-de9c8ee73e6d';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '3f3c53f9-6aee-5c51-b0da-4d4c12a40195';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '36422ec8-7d08-5445-b98d-4185564a5ff9';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = 'e0d7fb61-ffde-520f-b1b6-2a123e3b92ca';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = 'afb18a5f-e559-5fb4-918f-e0d035053d9c';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '9c2d93fd-27e8-52e5-bef1-f08425d07e8e';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '0b65786e-1a7e-5cb2-939e-b4381defba80';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '7dd070a5-911b-523b-a1de-542e03b895e5';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '3f37d5fc-e6e8-58ad-89e1-c2e17dd5a274';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = 'd7f69aea-203b-580f-b460-6e102ede8f7c';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '786b6102-e970-5df0-80bc-21fa70f26bd5';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '4cc15194-285f-5a3f-b6a3-7dc6a363e2c3';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '9b02cd01-c624-5545-80d2-5c6b7e31637b';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '7f56d42c-4b21-56ae-ae67-9056a1bb5b97';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '1bddd907-a329-5748-b902-7d606c9be872';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '3473a276-0b15-57da-a8dc-8a47f07e9f6f';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '37e4418a-4e52-5959-83e5-a15998bc222a';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '4a951d72-7b56-53c5-80a8-99d5082779a5';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '6a982e46-970c-5d14-8bdb-70ec356e0733';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = 'dc009998-f6a0-5a7f-ac7a-4dfe8121cd61';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = 'def2606f-0705-54c1-9a04-87ece6b1fe07';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '73704984-1a70-5098-bc47-f3208866c28d';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '67c45004-be9a-5e6b-a01f-19302adbebd3';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '761de3e6-a4ef-5cf6-b469-996ae1bee168';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '8d1f0852-9c56-5757-a87d-16cccf856511';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '2473b989-a27e-56ce-a571-9c223af3230e';
update public.sentences set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = '4b85f812-88ba-5571-b27f-e1286b8ad55e';
update public.tips set unit_id = '5a553dfd-4003-54c5-9002-d04699ce22aa' where id = 'c36061ee-ffa6-50e3-a2e5-06e46a8619e6'; -- ¡Qué garrón!

-- en-la-primaria → en-la-primaria · en-esa-epoca
update public.forms set unit_id = 'dae6ceff-5881-5f5c-a218-3a6317889caf', position = 1 where id = 'd4bcc48b-28c6-533e-a508-afe6bed79ca3'; -- primaria
update public.forms set unit_id = 'dae6ceff-5881-5f5c-a218-3a6317889caf', position = 2 where id = 'c1638ca4-7830-50a0-ae08-f50a1aa3243a'; -- secundaria
update public.forms set unit_id = 'dae6ceff-5881-5f5c-a218-3a6317889caf', position = 3 where id = '16d9207b-a302-592c-9e5a-d17eb157d481'; -- maestro
update public.forms set unit_id = 'dae6ceff-5881-5f5c-a218-3a6317889caf', position = 4 where id = 'a2ba733d-bcd8-51a1-9a57-76ad1629900a'; -- maestra
update public.forms set unit_id = 'dae6ceff-5881-5f5c-a218-3a6317889caf', position = 5 where id = '7cba487b-2d01-586a-9001-689746720fea'; -- recreo
update public.forms set unit_id = 'dae6ceff-5881-5f5c-a218-3a6317889caf', position = 6 where id = 'e08704d0-8598-5c80-8b05-f08d958fa67f'; -- guardapolvo
update public.forms set unit_id = 'dae6ceff-5881-5f5c-a218-3a6317889caf', position = 7 where id = '0124d719-520c-54e5-89b2-464090b064d0'; -- quería
update public.forms set unit_id = 'dae6ceff-5881-5f5c-a218-3a6317889caf', position = 8 where id = '828f4e34-f41a-5806-ab6d-d2a7527ee76b'; -- querías
update public.forms set unit_id = 'dae6ceff-5881-5f5c-a218-3a6317889caf', position = 9 where id = 'e6e686d4-ad28-517a-9589-373766e5d5e1'; -- podía
update public.forms set unit_id = 'dae6ceff-5881-5f5c-a218-3a6317889caf', position = 10 where id = 'df759e1e-aedd-5ae0-be95-732d798bf613'; -- podíamos
update public.forms set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701', position = 1 where id = '7842a8b9-181f-5023-bbcf-96e2d84210f9'; -- época
update public.forms set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701', position = 2 where id = '09a1db9f-90bb-5039-8497-71a18817cb0c'; -- eran
update public.forms set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701', position = 3 where id = 'ef861213-8d6f-536d-8902-3218c360eb0d'; -- tenían
update public.forms set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701', position = 4 where id = '17961439-1f2c-512f-9cb0-d71d90e3804a'; -- teníamos
update public.forms set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701', position = 5 where id = 'df616e9e-ea10-5beb-8fda-9fa83b194b9a'; -- vivían
update public.forms set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701', position = 6 where id = '62a8be77-ede9-501a-b6d4-70ac1029dd6d'; -- vivíamos
update public.forms set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701', position = 7 where id = 'd59a1e0e-e88d-5722-a915-7a2b8d932396'; -- iban
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'a18478e7-7878-59e0-99e7-4b79acddc062';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'a069d70a-4e19-541f-8222-72898bfcd418';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '62682f32-e096-5395-bc8c-1bc7bb2d7764';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '2e8c8bb3-71d2-5a61-8f3d-646040f7758b';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '08aad9c5-6f76-5e19-94d1-f6b5b1dd362f';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'ec6c5641-2b60-5dc5-9ac0-eaace803dfa3';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '649ced9f-3a8f-5edb-b8e5-33981e1d17da';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '626ccbf5-9bd7-5a8b-80eb-486ec880bb00';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '13ca97db-2e7b-541b-95c4-d6a16fe3b138';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '559483c9-9323-5bb3-9536-ab8be46e353f';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'c003769b-eda1-56dd-a377-92c42cbb6ce0';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'c6345687-2ced-5a91-b050-b8d1c0be6859';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'a600f5cc-99d4-5761-8089-29ffa48b258a';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'c8de2624-d960-5c55-910d-428a6384ae52';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '7f969a92-04d7-5043-b51f-933d78863b94';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'c51a0353-a2a3-5aae-9932-bbb8b854abad';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '8d65f8c2-2067-54f6-94c4-4204b966e506';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'f9b1ac06-6fd7-5336-89a3-08e2cb334e15';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'a3d51315-6d18-5eb5-b980-fa714eee9fd6';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '5bf5b7e2-76d8-5bff-8d95-431cccf8a0ef';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '6889e0a1-c6ea-5c22-b607-b04a7147999b';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '1c277e29-2264-58ae-a3a3-58bee72d3681';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '2cd2475e-3827-51e7-a49e-355a56c041fe';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'dca67011-ffe1-5047-8c6e-d40318e23df8';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '9b9942c0-ca30-5eed-950f-91d765f4cb9e';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'dd8d164f-210d-580d-87ed-c9e42e3e543a';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'e062a372-3fdb-587e-a595-6e3ea0433d5e';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '489a6e7c-3be1-53ad-89d2-07d6b99fe318';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'd72bba5a-48dd-506f-8117-18111476e463';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '5a464859-19b1-50ff-8d9d-504cb89d6318';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'be33df70-0e66-5e0b-8845-6be02cff7509';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'c5dafa95-db7b-5fd6-8576-b88a908d458e';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '2312c797-7dea-5453-a256-5a804034d133';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '125fb6d7-0fd7-5760-a682-97c5a5a0c06e';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = 'b1529905-cfb6-5644-af99-29473be83368';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '9577b24f-c8cc-59ae-ab20-f884ff3a540e';
update public.sentences set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '4578ea49-2c27-5b5d-addb-93700d68b87c';
update public.tips set unit_id = '2f4c4edb-9f6b-5165-a6a0-30d33f4d6701' where id = '31d74f55-0c25-5069-92ea-b682ba4134af'; -- Ser, tener, vivir, ir — everyone

-- me-encantaba → me-encantaba · jugaban-a-la-pelota
update public.forms set unit_id = '018363b6-528d-5464-8f6a-575ede7fb4d4', position = 6 where id = '0e653b65-7e12-51e0-a67d-16ea2034731c'; -- veía
update public.forms set unit_id = '018363b6-528d-5464-8f6a-575ede7fb4d4', position = 7 where id = '513abe4f-957b-5026-bcce-890cfd4fdb27'; -- veías
update public.forms set unit_id = '018363b6-528d-5464-8f6a-575ede7fb4d4', position = 8 where id = 'd20676a1-9484-5c41-b43a-6da601e24f62'; -- dibujitos
update public.forms set unit_id = '018363b6-528d-5464-8f6a-575ede7fb4d4', position = 9 where id = '94fb7705-4528-5113-85be-2b59748cbad1'; -- andar
update public.forms set unit_id = '018363b6-528d-5464-8f6a-575ede7fb4d4', position = 10 where id = 'df829ab2-2992-5232-91c0-bcbf7eca39a0'; -- andaba
update public.forms set unit_id = '018363b6-528d-5464-8f6a-575ede7fb4d4', position = 11 where id = '5b3dbdcd-3115-5f35-87ff-dc08706d9ff9'; -- bici
update public.forms set unit_id = '018363b6-528d-5464-8f6a-575ede7fb4d4', position = 12 where id = 'd856ae5d-3b61-50ec-ab97-824de3f650e0'; -- bicis
update public.forms set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3', position = 1 where id = '64018e60-f5a1-57e1-a2bc-4da637503a35'; -- jugaban
update public.forms set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3', position = 2 where id = '59c9f1f7-8f5c-5795-82b0-ca29db731df1'; -- pelota
update public.forms set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3', position = 3 where id = 'ef563b5e-5cea-5766-9390-e46b1dbd2b72'; -- escondidas
update public.forms set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3', position = 4 where id = '029de981-5b12-55f4-9ce6-f5509246e382'; -- hamaca
update public.forms set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3', position = 5 where id = '258148f8-80cc-54ba-a052-81c91707a47b'; -- pasábamos
update public.forms set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3', position = 6 where id = 'a64c5988-9094-54d3-9b79-70fbfdd61ada'; -- dormía
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = 'f101a1d8-f62d-5427-b807-44297304e5bb';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '673957ea-cef8-5d14-8988-ee04532694a7';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '522563c6-40b5-54a4-983b-e29ff985bd27';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '061e4f78-d872-5c7d-8c4f-3ba039e6084c';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '47c0dd09-64ae-5a47-84dc-341901b7d1ee';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '055dfbfd-1278-5d0b-969d-87e980c267ca';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = 'aef8cb37-0747-542c-9054-5c82f445d6b7';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '97551d2a-9da8-5335-b626-7510dad3d951';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '45745b41-b339-506d-a83a-724de9d6b7b3';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '3d823e54-ea7b-532f-b729-b05d3643bef8';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '7d811b79-9052-518b-93df-d0fae3c1a381';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = 'bd1ce768-b41f-55df-b181-0224b6fbfc3b';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '73df3528-5e36-5e39-9e54-60886744bce9';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '3126659e-6b5a-5f7e-b813-1ffabc35bd66';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '8e760962-8f3f-5562-951e-8b4ba27defb8';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = 'cc182071-d6a6-5ade-a7ef-c13a45153555';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = 'd8250c2d-7d16-55b5-93bc-c974850efea9';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = 'a7c7371b-440c-5a23-9a58-53edc228f3ea';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '1ad69677-1ebd-5dff-bc84-22ee0bf500b1';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '0d8a9a24-91dc-59ff-8d51-aea0c933dfa1';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '28f647ca-aa96-5269-ac65-efed850badee';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '13c6a1cd-8bc4-5088-bead-1bfa2a438c98';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '623d467c-df8b-5629-aa3a-79a10e37b5c2';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '5dfeed8a-ea5b-5071-87de-ef4ac2ad71a8';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '70f95133-d86f-51ee-9d24-1e930ae76015';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = 'a86f18d8-8fa6-5407-af17-d375667ea7a3';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = 'b9bfe978-2dbe-527e-b19f-5173284653c4';
update public.sentences set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = '2c9a3ec3-ea9b-5479-9843-f801987e12d6';
update public.tips set unit_id = '246ba33f-6f02-5d75-9dc2-8106eb2741e3' where id = 'df3230f6-6436-5eae-a43d-92ce8264bfcb'; -- -aba, -ía, and ver

-- sono-el-timbre → sono-el-timbre
update public.forms set unit_id = 'a6cc868d-fbe9-5af4-94d5-1396172806b6', position = 1 where id = '5a820f0b-353e-5a88-aa55-c3065f678548'; -- sonó
update public.forms set unit_id = 'a6cc868d-fbe9-5af4-94d5-1396172806b6', position = 2 where id = 'd5a8da11-4277-53a1-b4e9-7aa5ecebf5c0'; -- sonaba
update public.forms set unit_id = 'a6cc868d-fbe9-5af4-94d5-1396172806b6', position = 3 where id = 'fbdccfaa-d628-5fc0-bd8e-5e1a13e06148'; -- sonar
update public.forms set unit_id = 'a6cc868d-fbe9-5af4-94d5-1396172806b6', position = 4 where id = '5e65c9c5-335b-5acc-ac50-bb78346cf3ac'; -- ducha
update public.forms set unit_id = 'a6cc868d-fbe9-5af4-94d5-1396172806b6', position = 5 where id = '69878290-4bc6-5f85-aa61-110c5cf98500'; -- estaban
update public.forms set unit_id = 'a6cc868d-fbe9-5af4-94d5-1396172806b6', position = 6 where id = '31062869-0ff7-51e9-b46b-e5e479f69a9b'; -- entré
update public.forms set unit_id = 'a6cc868d-fbe9-5af4-94d5-1396172806b6', position = 7 where id = '1073f97a-6257-53d9-8352-466f7d4b7569'; -- entró
update public.forms set unit_id = 'a6cc868d-fbe9-5af4-94d5-1396172806b6', position = 8 where id = 'b00f2aeb-8fb2-5aeb-8200-2aca42b5bd3c'; -- entrar
update public.forms set unit_id = 'a6cc868d-fbe9-5af4-94d5-1396172806b6', position = 9 where id = '5ae56f84-fc8f-5182-8125-fdd6bff55111'; -- empezó
update public.forms set unit_id = 'a6cc868d-fbe9-5af4-94d5-1396172806b6', position = 10 where id = '0535977e-2b1f-515d-8d8f-5fe4976b13cb'; -- luz
update public.forms set unit_id = 'a6cc868d-fbe9-5af4-94d5-1396172806b6', position = 11 where id = 'cd632803-a7c5-5d66-9988-78790ed53011'; -- volvía
update public.forms set unit_id = 'a6cc868d-fbe9-5af4-94d5-1396172806b6', position = 12 where id = 'd5b5d178-fb52-56bf-9e84-673fed82cdcf'; -- caminaba
update public.forms set unit_id = 'a6cc868d-fbe9-5af4-94d5-1396172806b6', position = 13 where id = 'cf9bb0ae-7c94-5357-9260-ff600f866dc7'; -- caminando
update public.forms set unit_id = 'a6cc868d-fbe9-5af4-94d5-1396172806b6', position = 14 where id = 'f375f2cf-67ca-5003-98e1-8b3c0f3ce352'; -- cocinaba
update public.forms set unit_id = 'a6cc868d-fbe9-5af4-94d5-1396172806b6', position = 15 where id = '49ed1cb2-9224-5942-b106-95e0f822066d'; -- mojado
update public.forms set unit_id = 'a6cc868d-fbe9-5af4-94d5-1396172806b6', position = 16 where id = 'd52920f8-ece2-554c-ad32-da554abefbb8'; -- mojada

-- la-final → la-final · por-penales
update public.forms set unit_id = '102a20da-507c-5cab-8d54-b9dc250aebb6', position = 6 where id = '77c5e0ea-4333-5712-888b-2409dd764bc8'; -- alargue
update public.forms set unit_id = '102a20da-507c-5cab-8d54-b9dc250aebb6', position = 7 where id = '9bb2e3bd-b50a-5ea9-ada3-eb53201f42cb'; -- campeón
update public.forms set unit_id = '102a20da-507c-5cab-8d54-b9dc250aebb6', position = 8 where id = 'e104c15a-85b9-510b-ada6-3bda422aa140'; -- campeones
update public.forms set unit_id = '102a20da-507c-5cab-8d54-b9dc250aebb6', position = 9 where id = 'e2b6370d-f018-5283-afcd-a06d4fe4bf1f'; -- camiseta
update public.forms set unit_id = '102a20da-507c-5cab-8d54-b9dc250aebb6', position = 10 where id = '047df174-6f6b-5739-9589-5c62a4240b0b'; -- aguante
update public.forms set unit_id = '102a20da-507c-5cab-8d54-b9dc250aebb6', position = 11 where id = 'd8d95aa8-f7c8-54a2-ab57-0a6f34ddeb1c'; -- Mundial
update public.forms set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32', position = 1 where id = 'e2d236a9-7c05-5182-8f4f-36d3b3d1a090'; -- penal
update public.forms set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32', position = 2 where id = '6688cd49-a798-51d9-af4c-319b9571dd53'; -- penales
update public.forms set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32', position = 3 where id = '463ec1f4-4761-5ec1-9e36-af20c2ce8a76'; -- arquero
update public.forms set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32', position = 4 where id = '7a838fbf-cb9c-54cc-8070-30b2459a794f'; -- atajó
update public.forms set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32', position = 5 where id = 'a498a3e8-714f-50e7-8e88-c2fb5fbbaaac'; -- metió
update public.forms set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32', position = 6 where id = '51cc2ac5-6931-5b7b-8869-c64b2ec00b76'; -- golazo
update public.forms set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32', position = 7 where id = '3996dbcb-d458-55f7-b4aa-fb89f1a2df0c'; -- árbitro
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '4e19d342-c9c8-5363-b752-f073d90bee9a';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = 'd541f14f-d462-50e9-a827-90f67e08dc65';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '03137090-2a0c-5ec3-9365-d758ead368a3';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = 'a68f546b-8acc-5dbe-b9b9-3d495e6d02d0';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = 'd030ea88-61cc-529e-97d1-10d4bf0578e1';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '5d440f72-6526-5b54-b629-f488c942610a';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = 'c0f4dd05-f8d4-5087-9898-40de5195725a';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = 'bbe7ea19-2813-55d4-9f54-767157c6a909';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = 'e4bd2478-e5a6-5500-b8b3-4de579705a5c';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '8546eef2-c91d-5790-9780-c5a3ea898271';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '29b7e212-b9ea-5345-b404-4ace8ac53768';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '4cdb9779-697e-5550-b2b4-4bac69d84373';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = 'b034c5d2-db1a-531e-adc8-f71b4a50c524';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = 'e9c73a3d-3af7-571f-b2bb-1c101b24652b';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '9833f41d-d9d1-5ad9-a918-f3194e1b84b9';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '44b2d4f9-925c-5714-988f-6638ab7d3c1e';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '198759dc-2e2c-5403-9ac3-7f456a2ca828';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '35497ce6-6277-5d6a-be13-2879fe9f03e4';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = 'fa74140f-0408-5478-a7f6-4f95e7437cfc';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = 'eb574c25-face-550b-8860-d108b63732bc';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '54df2b90-9939-509c-90f3-e8d4b0fa376e';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '13d97c03-f18f-5911-b07b-04ddcf562bc6';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '1112f2ce-f184-52be-8cf6-293e370e682d';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '898edc1c-74d7-50a0-a7ba-d9b8482abaa7';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = 'e7d6021c-d314-5ea2-a763-d5af404deb62';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = 'e8b1b7e0-3b98-5001-a2de-63e6851e630c';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '302c4ca9-a036-524c-a4da-67dffb439b3b';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '2e6ab084-7b39-5d94-b7d1-211267665584';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = 'b8cdef16-3fae-5dbf-a653-def73740921b';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '60f5aab9-9687-5628-9fe3-7e72e5100c2d';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '0f23e878-f69f-5393-b1b3-54f053052725';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '3419894f-c677-50cd-8fbf-65648812e586';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '532e085f-810c-5c2e-84bc-03a54802c563';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '2e9d41c2-955c-5f64-865b-8f2223f0f0a2';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '4a404c70-014a-5a22-b90e-957463239199';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '392c0085-b6a9-5a58-bd69-5f58fad39cd6';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '95cdddf1-5d9d-529e-af17-9a9cfa4f58d1';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '6ac80e69-7067-5eac-8e6b-2da216dac3ba';
update public.sentences set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = 'aee08aae-9631-51a3-8548-9afc12e41dd6';
update public.tips set unit_id = 'ee392b39-67ab-5776-a398-cd9c0cd89e32' where id = '0543a4d4-e086-5583-a92b-a63cb2d2b3c0'; -- Penales

-- de-que-cuadro-sos → de-que-cuadro-sos · soy-socio-del-club
update public.forms set unit_id = '78c71bbd-ead2-54c0-8b92-98f45101f849', position = 4 where id = '8f7759a3-1e4d-5f0f-b89e-712a0c0ac543'; -- club
update public.forms set unit_id = '78c71bbd-ead2-54c0-8b92-98f45101f849', position = 5 where id = '4394d0d9-8dfb-59bc-bcd8-a303c943c4fe'; -- superclásico
update public.forms set unit_id = '78c71bbd-ead2-54c0-8b92-98f45101f849', position = 6 where id = '78e4ed48-c2ca-5263-9b98-8c512ebf6552'; -- clásico
update public.forms set unit_id = '78c71bbd-ead2-54c0-8b92-98f45101f849', position = 7 where id = '4bace0ba-081e-59fc-80d5-4ab55eea7a60'; -- jugadores
update public.forms set unit_id = '78c71bbd-ead2-54c0-8b92-98f45101f849', position = 8 where id = 'cbde8165-1b83-5164-a9f7-0da6882476aa'; -- jugador
update public.forms set unit_id = '78c71bbd-ead2-54c0-8b92-98f45101f849', position = 9 where id = '0f650941-70d5-542f-b48b-74e56e52dd98'; -- ídolo
update public.forms set unit_id = '78c71bbd-ead2-54c0-8b92-98f45101f849', position = 10 where id = '3c88309c-6294-5aa9-a1bc-aaa703bc8180'; -- Independiente
update public.forms set unit_id = '78c71bbd-ead2-54c0-8b92-98f45101f849', position = 11 where id = 'da944b95-abfd-5b0b-8322-6a24afff525f'; -- San Lorenzo
update public.forms set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829', position = 1 where id = '0ebacc8e-c852-5fb7-9f62-0035032098af'; -- estadio
update public.forms set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829', position = 2 where id = '13b9423a-4666-5afb-82fd-85994b186fdc'; -- socio
update public.forms set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829', position = 3 where id = 'c9b9cc5e-f688-5cdd-8b6c-10e49be626a2'; -- socia
update public.forms set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829', position = 4 where id = '1eeb6498-dc9a-5607-adb8-dccd6a6089f2'; -- de toda la vida
update public.forms set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829', position = 5 where id = 'cc6987e7-3dae-5ce5-9c27-926a733c5490'; -- popular
update public.forms set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829', position = 6 where id = '147d6b53-b968-56d2-b45e-c3400a432cb8'; -- tribuna
update public.forms set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829', position = 7 where id = 'cf5f15f7-691f-5123-92f3-85a5c5eb8b95'; -- hinchada
update public.forms set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829', position = 8 where id = '0d1f0247-c422-5aa1-9569-bcf5badcd40c'; -- cantito
update public.forms set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829', position = 9 where id = '37ddf650-2917-511d-8c06-894a0cf49212'; -- bandera
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '921328d5-3c85-5044-9d6e-ac239165c9f3';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '52d5f23e-d57c-5504-b6ba-51877299411e';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '4a5c7262-3930-5f26-9dfc-5feef83eeb33';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = 'b86e9429-9085-576d-8bc3-d5437b843761';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '79b41696-8ee1-597b-a113-652fb87d3643';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '81a6196a-139c-572c-9717-22ee4a77b775';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '73674311-1648-5256-aae0-87ef666ac30d';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '754a8242-8977-5113-ae40-1df7e43da243';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = 'a66704af-00ec-54e6-8fc9-6c538ba63c36';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '8709980f-a9e6-5b53-8a08-635b27ad7a8f';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = 'be515ed5-a915-5f1e-b884-faf2aba69b01';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '94f9fb2c-9816-5be0-bc6b-b3b0da376be6';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '4a932793-37bb-5cc5-8ddf-064deea4eea0';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '853ebd5a-08bf-5a60-9b68-67784828e1b5';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '71daaa6b-67ff-592f-9675-91ecfabc3944';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '0a11813a-c583-5bc5-917b-86338334dc3f';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '6c875d3b-96a5-5ff0-ae15-55855bbf374b';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '95b60826-8491-5948-8164-071a1b9302f1';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '7636ff53-b3f2-5d1b-ba2c-37e2543c1f98';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '36fcf8df-0ea9-5d60-8352-3d46294d8cf6';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '29da9843-f65e-5e4b-9812-771700fd3361';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '28bca59e-93ab-5c9a-adb3-6e5e79a29805';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '84cdb7c7-7f83-5af3-8cf6-6a0e2893a4b8';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '5fd53f2a-0dae-5f1a-b509-1f4e766bbc15';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = 'f3f54a31-a827-5b6a-b6e2-85d6e897e54a';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '68b28d49-4620-55b9-9050-d0755bd08a9b';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '7d00e089-8810-557e-8652-50b1e99dd75f';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '3a26a0b1-e1db-5dc3-a7a9-3369edc53ea2';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '0c20c366-84b5-508a-b7ab-3a3e5abcefe7';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '96b0ba65-be55-5458-9a9a-e3a6c3aedfb1';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = 'b0d66e64-468a-5b40-8d6d-82dd55c5922a';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '560754b1-b5ee-5685-b3d2-9806ff9311d3';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = 'c68ba3f1-01e6-5fad-996f-a733f7ecc41e';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '1235278c-cc84-548e-8eda-aae18a7fd84f';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '0539af0b-f1e2-57c4-b367-fc76ca635dcb';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = 'b5178bb8-da2c-51a4-a653-38c5e101287c';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '25f8107e-81c7-5856-b03e-2c7a15f1c7e3';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = 'c942348b-0c96-544a-8756-1cf16c9d7f41';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '6561fc7c-3aab-5836-bffd-4027104806c5';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '0fcd3e49-b3f0-5ee8-9c6c-65156d9f9df0';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '6c803007-f1fb-5df0-ac54-d64375923ae6';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = 'e2bb7fb9-0a17-53a7-9f83-44ee351136b2';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '33bfb679-3431-54c4-b4b3-013359cbcd64';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '1e462d20-7341-5387-8afb-9e1deb0e95d0';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '783caaba-d77d-54aa-b5e2-00b37b003433';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '010b4681-58c2-5b28-ac39-a89edff17632';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '295b6d9c-70e4-5626-a9ed-8511a89642ab';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = 'affe4709-6a29-518e-a3fa-deb8582709e2';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '9efa72e7-da36-5da9-85ab-b1ffe0a82ce4';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '9c3020a6-6060-55e4-8701-a405ceaf25bf';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '0ec54f32-25a9-553f-a520-aeab5d821a79';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '62a4cbf5-4a2a-56be-a7ae-7016efbf6855';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '4f2a715f-8fcb-5bd0-86a1-580710f1d50e';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '1152134d-3e12-500b-92df-b87481a26f75';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '380d8a95-6b9f-58b4-82ca-ba37f54a206e';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '86948097-51af-5191-a03b-cae1463a42af';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = 'e09cc38e-fb32-5994-90a2-a9f01c01aa09';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = 'e421007f-3b86-591b-a272-3e089ba8f8d2';
update public.sentences set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = '7fceff46-7dfe-5332-96fc-6c2c12a6bcc1';
update public.tips set unit_id = 'f88d36ba-5cbd-50ac-9ddc-11361bed7829' where id = 'bcc20295-b0f0-5657-8bba-544e8abc8f78'; -- Ser socio

-- en-el-restaurante → en-el-restaurante · con-gas-o-sin-gas
update public.forms set unit_id = '28d6c921-dae2-50d2-b6a0-a5e2423428a6', position = 1 where id = '67a703c8-e62c-5a79-8797-20141b41cffb'; -- restaurante
update public.forms set unit_id = '28d6c921-dae2-50d2-b6a0-a5e2423428a6', position = 6 where id = '9f248d38-a47a-5c47-8126-d04c16380ca9'; -- me recomendás
update public.forms set unit_id = '28d6c921-dae2-50d2-b6a0-a5e2423428a6', position = 7 where id = 'b52768b1-84c3-580d-a03a-21f730a795eb'; -- bife
update public.forms set unit_id = '28d6c921-dae2-50d2-b6a0-a5e2423428a6', position = 8 where id = 'd051245d-a288-5267-a276-37c6263eb695'; -- papas fritas
update public.forms set unit_id = '28d6c921-dae2-50d2-b6a0-a5e2423428a6', position = 9 where id = '05a067bc-fed7-5380-b2b9-f537ac21adbb'; -- flan
update public.forms set unit_id = '28d6c921-dae2-50d2-b6a0-a5e2423428a6', position = 10 where id = 'e5b6285e-ae89-5f02-8788-5c223ba3e6e8'; -- recomendás
update public.forms set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe', position = 1 where id = '982ba558-04e1-5746-b3ad-a9883a34da8c'; -- con gas
update public.forms set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe', position = 2 where id = '3a792b45-3a89-572e-ae36-0eb46048ecdd'; -- sin gas
update public.forms set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe', position = 3 where id = '83e2b6d8-9f75-5d6d-89c7-e4245fb893c9'; -- vino tinto
update public.forms set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe', position = 4 where id = 'a934dfd4-943a-5330-afda-9e2455a0b44a'; -- compartir
update public.forms set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe', position = 5 where id = '7c5cb12f-57c9-5784-9866-91d9576e7e86'; -- propina
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '56c4707f-417b-51ce-bea5-91365add26be';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '353ee484-68fd-5520-a048-b79d7a841f81';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = 'f3ee9b73-1271-5211-9aed-9cd07da045fb';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '2300b782-4e06-5f18-84a9-7a36f1f432d2';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '974db0af-6f60-5fa0-a6f6-6a01faf19f71';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = 'c4051867-0901-5004-bb87-344f7b7d16c3';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = 'e3105086-58b9-5211-bf74-c8d009c847ab';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '822c0240-1a2d-5a94-932d-c25263fe054c';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '48252343-53e3-5434-8118-ff3fa3e1f28d';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '6b0d8fe4-4361-53f3-a26f-0f381c9aaafe';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '6fafd22e-0b73-5d8b-a632-b0453596b5ae';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '3928cf39-dcb6-531a-85cb-7e4a439a7e5a';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '82524313-61a7-5e47-a783-ba49e0a62dfa';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '9c100d70-fd23-5a35-8f1b-f6f5ec59d3e7';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '904adf8c-41df-5845-aa29-544cc6dce154';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '4f1fd74e-ee84-5661-84cf-da74caf57ece';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = 'dedb4a83-6cfa-5612-b4f8-6a3e40d05107';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '0f50a3d8-653e-5c71-87b3-e71222d43b53';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '5bdb528b-9553-5578-aba2-88fd654cb101';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '8b0e33b4-81c7-5c7e-83a5-88d016a87510';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '06c0d788-b58e-516e-86f7-822bb1a2ac95';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = 'c269055a-59b6-5490-9ce6-4affebb59daf';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '2fbf24f2-c3f6-51c9-867b-45d760215123';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '5ca7e6ef-e311-51fa-9352-ffab29206aba';
update public.sentences set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '10715919-4cf8-54a9-b1b8-a6d47c1a47f4';
update public.tips set unit_id = '02a059c1-fa00-5333-b357-ff42075fd5fe' where id = '2910b1f9-2188-52b3-b99b-5ff32f745b64'; -- Propina

-- una-grande-de-muzza → una-grande-de-muzza · soy-vegetariana
update public.forms set unit_id = '42aaa1de-ab7b-5276-9032-91bff95ed818', position = 4 where id = '4d8699e4-696e-5b55-85bd-78bb82791fc2'; -- pizzería
update public.forms set unit_id = '42aaa1de-ab7b-5276-9032-91bff95ed818', position = 5 where id = 'a1589c6d-b397-5c81-827c-90a62785a092'; -- muzza
update public.forms set unit_id = '42aaa1de-ab7b-5276-9032-91bff95ed818', position = 6 where id = '8744ff55-741b-526b-aae5-92613bffa79d'; -- porción
update public.forms set unit_id = '42aaa1de-ab7b-5276-9032-91bff95ed818', position = 7 where id = 'a06cd7d0-39ea-5429-82cd-49b792c907f7'; -- porciones
update public.forms set unit_id = '42aaa1de-ab7b-5276-9032-91bff95ed818', position = 8 where id = '03bd2d04-bc72-5f71-96df-6cb22e5034c8'; -- mitad
update public.forms set unit_id = '42aaa1de-ab7b-5276-9032-91bff95ed818', position = 9 where id = 'e36b5332-1dd9-590a-abb9-2917b3f8c561'; -- para llevar
update public.forms set unit_id = '42aaa1de-ab7b-5276-9032-91bff95ed818', position = 10 where id = 'f1c44de4-6bc4-5161-b350-c3d44e4f3447'; -- delivery
update public.forms set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40', position = 1 where id = '54099e83-e371-51af-838a-7555dc54057d'; -- vegetariano
update public.forms set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40', position = 2 where id = 'ced39f5b-dc70-5857-ae48-1701fd7ffd04'; -- vegetariana
update public.forms set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40', position = 3 where id = '1c10a4d8-7e85-5a24-ad05-d74f090b0201'; -- picante
update public.forms set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40', position = 4 where id = 'b199bd41-202e-500c-a9b6-25c8dd596e94'; -- salado
update public.forms set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40', position = 5 where id = '192b2cf7-4490-5e32-ab1b-e78d583a9d70'; -- salada
update public.forms set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40', position = 6 where id = '246dc625-4d56-5c2b-ac0f-b0fb23dddf34'; -- provoleta
update public.forms set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40', position = 7 where id = '1b95401c-2763-5361-8444-75de3845421d'; -- choripán
update public.forms set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40', position = 8 where id = 'f2ceaacd-7231-58e1-a062-cee116c23ec0'; -- reservar
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '99629cbd-f8f4-5886-977d-0c9bf69ff4bd';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = 'c70e9b32-efa5-5c21-99ca-23707d8d6911';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '03dd75c0-27f0-5c61-b0b9-e48a534e2b93';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = 'e49faadf-5401-58f9-aa3e-b531cefada6f';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = 'acee8466-381c-5bc0-b12e-d9410ac8cb96';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = 'f36830ce-1921-5b11-b85f-a1d14fddbfd4';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = 'dd950cc8-45ce-5054-99c5-33a02336cb36';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '9206953d-c5fc-540e-a84c-fa7244cca98a';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = 'e3e9efdc-f298-58ab-bd41-26c4e2783cfe';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '545eacdd-2977-5513-97bd-0ab916a65325';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '95c28234-fcc7-543b-bbd1-983b78fddd63';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '569fa3f6-ab9a-5ab5-8e94-bde90dd9cade';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '621710ab-4667-559c-b58a-75dad5d80ee4';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '42f5c5d0-a626-5168-95ed-b1d605f69401';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = 'a9b9e959-0c4f-5215-b7d6-0927fc2dab45';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '9165d17d-afca-539b-8848-0efceeaae06f';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '90f50774-3e8d-5827-94c7-25ec2576e8f7';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = 'd6cd1dfd-44e4-54da-beb6-173d5e9210c4';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = 'c220e057-e2ad-597a-bbfd-41b2cc9ed29b';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = 'f457710c-466c-5f27-9303-1550157645e0';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '158e3049-51a7-5703-80ba-740a26dfae74';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '9c070aa9-b82a-5fe6-b13f-91740748db5d';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '015b3bcf-6a81-5a1c-963b-b4bf549a1955';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '4bc88706-9b2c-573b-ae2f-8e7d125863cb';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '2ae2daeb-b3a8-5793-9208-4ffd91d0bfa4';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '5bffd648-84b0-5541-874d-916a2cc057db';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '89e4912e-68b5-5e57-8ba6-c2ccbf24e37d';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = 'f04aa296-990e-555a-9a5a-44b25f3ab3fe';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = 'e2819b98-6d08-58d3-bd4c-2227d1d4551d';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '5473497d-d40c-5520-9623-6183893fb823';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '1b936cda-8a22-5323-8224-92d6b42e8cda';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '1651eba5-f711-5183-bab7-6a498a5975c2';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '1f90f2d2-7b54-50a6-a476-0ef4cbdc577f';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = 'f1d48a71-db96-5049-a586-a1ccdfa605e7';
update public.sentences set unit_id = '81635abd-7a97-5ef3-bcdc-e189da206c40' where id = '0c5ec11d-102b-5fe3-8658-632c13c43517';
insert into public.tips (id, unit_id, title_en, body_md, status) values ('c273802d-5e46-5b75-b333-fa2cb7d31200', '81635abd-7a97-5ef3-bcdc-e189da206c40', 'Salado, picante', '**Salado** means *salty*, and also *savory*, the opposite of sweet: *¿algo dulce o algo salado?* Argentine food is almost never **picante**, so *spicy* here is very mild. If you don''t eat meat, say **soy vegetariano** or **soy vegetariana**.', 'published') on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, unit_id = excluded.unit_id, status = excluded.status;

-- la-parrillada → la-parrillada · bien-cocido
update public.forms set unit_id = '02841028-7fa9-5c47-9159-c4b47cc15cc1', position = 2 where id = '9b52918f-2b50-53f2-9de1-d64f22c5efff'; -- tira de asado
update public.forms set unit_id = '02841028-7fa9-5c47-9159-c4b47cc15cc1', position = 3 where id = '615fa4cf-09ab-528f-9ecb-3a9708d9527d'; -- mollejas
update public.forms set unit_id = '02841028-7fa9-5c47-9159-c4b47cc15cc1', position = 4 where id = '36963ef0-36d5-5dee-ad4e-9110d9cf03d1'; -- chinchulines
update public.forms set unit_id = '02841028-7fa9-5c47-9159-c4b47cc15cc1', position = 7 where id = '95778e6c-8e39-5f21-ac03-9d100a340ed1'; -- ojo de bife
update public.forms set unit_id = '02841028-7fa9-5c47-9159-c4b47cc15cc1', position = 8 where id = '73b0b9af-cb17-54e5-b672-3f4289bd149c'; -- lomo
update public.forms set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd', position = 1 where id = '456950c8-3a35-595b-8156-222c35b09f1e'; -- bien cocido
update public.forms set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd', position = 2 where id = 'e3203b39-0749-5609-ad37-7e71a8b50f8a'; -- vuelta y vuelta
update public.forms set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd', position = 3 where id = 'a0fd2492-6849-5458-b3a0-b243b7f309b2'; -- chimichurri
update public.forms set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd', position = 4 where id = 'bf0d71ec-b230-517b-86f9-a737d3590b30'; -- salsa criolla
update public.forms set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd', position = 5 where id = '9378ea24-0936-55a7-8a10-d6baea3325bb'; -- leña
update public.forms set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd', position = 6 where id = '517dd6ad-a7bd-56e7-9532-cdb73a553a73'; -- cubierto
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '83972c46-4e68-5c04-b6d6-529c34eea895';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'c1554e5d-f092-5eab-b849-15b669bf71fe';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'eee1aad2-4dd7-56ce-9ac5-d77c86569052';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'b3efaf4d-4d10-5afd-b9da-0e4b6844a8dc';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '5c429df1-dbc6-54be-86f4-9c14d7000144';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '3eca3b24-7d8f-5491-b239-e01f20bd9de3';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '7c137c90-13d8-5bf0-87f0-6d911443c7d9';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'd5f88757-bb14-5beb-ace1-fba5ace22be9';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '1c6cecd7-a7ad-5f7d-9fe0-f23839aec256';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '74091527-3526-564c-8f70-18c144779846';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'c1e17ced-3c05-554b-b7bc-4b3feabd588c';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'bdd0b31b-f2ca-55d1-84cd-eba16d5813c8';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '80fb248d-7b44-5e43-9099-360408c79072';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '1f361edc-eb74-5712-9b41-60ac08e775f6';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'c165fb7a-6779-5f32-a813-07f5925a7d2a';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'ce158a34-4125-5036-b7b8-d93c161ccd8d';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'e6aa79b5-7d23-5506-b3c5-4d8c3c795c1c';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '0924bfca-d0aa-5165-a6de-29715e898e9d';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'c888e797-19dd-5613-9d06-b156962d0d0f';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'c07edbf0-04c9-5f2c-88ff-e87a7e6ddfb4';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '14ca4df7-6b4e-563b-8e9f-eb99cef6dfe9';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'e43b5eb0-ccac-5d42-8db6-f4423255d97d';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'ddc925c4-192e-58fd-af32-20f82b1655d9';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '89c19024-3266-5774-af3b-d696785a684f';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'cf45ba49-1075-5547-aa5f-67805e95c9ec';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '64a4817e-8add-5dca-af01-d6eeaada49f1';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '9eb8d483-1f43-5f43-9545-08c66586edbe';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '617ec174-a863-54ac-a9b5-7ee737192321';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'ea1d3de5-88cb-53e0-a4ff-d20e48b96e52';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '6b3e43ad-d874-52f2-8ee8-1f0c1f2c0d6e';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '06bbebd4-1614-5910-85a2-24d9ff3c9379';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'b4df0a4b-7d8c-59f9-86fb-bba6172a4197';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '53f82b12-50bb-50d8-a3ea-d5c7dba4cdc9';
update public.sentences set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '50e2ada8-8500-5f97-b0c7-61eaed5d1526';
update public.tips set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = 'd9075515-9557-5e2e-986b-a39b62161f51'; -- Bien cocido
update public.tips set unit_id = '384ac86b-c136-5718-a7fb-c0ff8ed702bd' where id = '56f2eb46-cd35-5649-9776-16424039e6cd'; -- ¿Y la salsa?

-- llegue-tarde → llegue-tarde · confirmo-en-el-grupo
update public.forms set unit_id = '08e5edec-37ff-59c8-942b-b0fcd4fe251b', position = 8 where id = '4747ca1c-9105-53eb-9b44-13e1c4f5f003'; -- en camino
update public.forms set unit_id = '08e5edec-37ff-59c8-942b-b0fcd4fe251b', position = 9 where id = '7961af4d-2fbd-58a3-845e-3f7716f10749'; -- se me hizo tarde
update public.forms set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e', position = 1 where id = '1545d6b4-5ea6-578d-98f3-9e0f0aa931b5'; -- confirmo
update public.forms set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e', position = 2 where id = '303eb779-83b3-5dd5-9d75-ee488b1d48cb'; -- confirmás
update public.forms set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e', position = 3 where id = 'd21b3b13-92f2-55a1-a3c1-42183aa48a69'; -- grupo
update public.forms set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e', position = 4 where id = 'bc61d0e0-98f7-5d01-93c2-1b6b21d711b5'; -- salida
update public.forms set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e', position = 5 where id = 'dc95cccd-814a-5ec3-b304-61333f5d6384'; -- encontré
update public.forms set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e', position = 6 where id = 'eb24d1a9-5d1e-52ed-8b8e-d778b8e2ea9d'; -- puntual
update public.forms set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e', position = 7 where id = 'd32f4539-56bf-54e9-a15e-f79e5c41695c'; -- puntuales
update public.forms set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e', position = 8 where id = 'f7dd8b25-1bc5-5081-8b5e-47678a46713c'; -- reloj
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = 'ffe5c1c3-54df-5a1f-a4cd-1c81ee41c032';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '3c508869-cd4c-5f7f-9911-72732e9fdbe7';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '8964971a-e8a2-5833-98c0-a5943f303f87';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = 'fc34271d-edbe-50dc-9095-8558b87360f0';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = 'd30cf7c4-20b2-5f13-87e6-189c82b5b8e8';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = 'a246202c-1ac3-55f6-b564-7080702ec58a';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = 'e14b0e8c-9c2e-59dc-bb79-bc07661c598d';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '8348f28a-3a34-5b3f-9afc-433e40d38062';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = 'f2da1fd1-8835-5634-8de2-cd101f91091f';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '7def6090-18af-57a0-8445-f28c7e29a419';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '36f35806-3733-545f-9082-7c4fc07f147c';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '1c0b886f-2785-554e-a024-dbdc3c15ce7f';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '4cd2a8fa-aac4-5107-9eb6-5b0a2a9c3b73';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = 'c9184efe-0262-5ff0-9352-84996bd28187';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '8eec9cc6-6616-5c17-bd87-e57bff982bf2';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = 'f141ecb9-6ca8-56d3-b88c-ecc88caec8f1';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '617cac67-332f-5bc8-897e-c24bec0a3164';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '5b677a99-cae3-5cf9-8bd2-83363615c7a6';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '9c37d9b7-1134-5861-9aef-4d825d4d4b89';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = 'cfcad73c-0cc5-5023-85fd-503da2380c53';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '5d0cdff7-34c9-56bf-a350-0fe21fffb401';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '0dab6374-372a-52c4-b8e3-da2d5808c554';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = 'ab21634c-41fb-5149-ad37-15fb8ef5a8d4';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = 'ef102050-d126-5f47-b985-1ef437a4169f';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '6800702a-2257-58cd-bfa1-6da420ca5211';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = 'e6c8c959-5100-56f6-99ed-12bc92fd9750';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = 'da4872e0-916e-5792-9ecf-25c993edf300';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = 'ef176c26-09a7-5421-8fd2-0d8735881122';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '10c13e43-0a91-5058-a831-1cb23597a2ca';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '98cfb077-cb80-5276-969a-10dc32f9d0cc';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '11ba6e62-17fc-5118-b03f-20d4afabd644';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '63d11b3f-d149-52d5-9463-6e93acd3adff';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '7aaadeaa-cf69-5a8d-8948-551d1356ccf2';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '6761c47b-97dc-5db3-93ae-cb183c2f4cd5';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '5ae84d49-dc92-5a1c-87a4-2ed27a71aba1';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = 'cf255d2b-8502-5274-aafa-e8adde4bd6d9';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = 'c9877821-e62a-5aae-bd38-f63396f49fd7';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '638d5ea0-1c92-5d39-9d07-53bf43a534b6';
update public.sentences set unit_id = '4e59b5b3-960b-5567-9961-d1d9db7bab8e' where id = '8c9f2a90-2a46-5c25-8c0a-7d5fb407bb40';
insert into public.tips (id, unit_id, title_en, body_md, status) values ('55a36cb5-236c-5553-85f2-319f84e67896', '4e59b5b3-960b-5567-9961-d1d9db7bab8e', 'El grupo', 'Every plan lives in **el grupo**, the WhatsApp group. Someone asks **¿confirmás?** — *are you in?* — and you answer **confirmo**. A **salida** is an outing: a night out or a day trip with friends.', 'published') on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, unit_id = excluded.unit_id, status = excluded.status;

-- me-puse-nervioso → me-puse-nervioso · me-dio-verguenza
update public.forms set unit_id = 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', position = 4 where id = '8b7c2ba4-1a0e-5638-bcca-b5d6a6078f69'; -- nerviosos
update public.forms set unit_id = 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', position = 5 where id = 'ace15b74-77df-5fc7-a097-f314c5e96287'; -- celoso
update public.forms set unit_id = 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', position = 6 where id = '16de8e80-a073-567d-95b1-98049c8fb6f8'; -- celosa
update public.forms set unit_id = 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', position = 10 where id = '4a758c0d-9475-546f-9434-4a7083b4d6bc'; -- puse
update public.forms set unit_id = 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', position = 11 where id = '373fbf9b-d0c8-5fae-94a7-0bf4d549e0d9'; -- pusiste
update public.forms set unit_id = 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', position = 12 where id = '713bd536-e8bd-5083-96ea-b62108e305b6'; -- puso
update public.forms set unit_id = 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', position = 13 where id = '9a078942-f356-558f-b60b-75b5d980b4e2'; -- enojé
update public.forms set unit_id = 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', position = 14 where id = '6215440c-4933-5fd1-83c9-645d8b55a878'; -- enojaste
update public.forms set unit_id = 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', position = 15 where id = '4a85a4c1-8fff-5f03-ac61-461dc0cc98f4'; -- enojó
update public.forms set unit_id = 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', position = 16 where id = '5658da5f-c686-5192-9c90-f7e4021e6bd0'; -- asusté
update public.forms set unit_id = 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', position = 17 where id = '777e1106-fcbb-50f3-9fea-f511572862e3'; -- asustaste
update public.forms set unit_id = 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', position = 18 where id = '014480f6-1b39-5630-beb4-4751b8778c97'; -- preocupé
update public.forms set unit_id = 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', position = 19 where id = '0c60c9fd-ddcb-5c68-8904-d0993e5fe82a'; -- preocupó
update public.forms set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04', position = 1 where id = '8f129043-61a1-5546-b3c4-ef9343ede81d'; -- me asusté
update public.forms set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04', position = 2 where id = 'c76e1721-40ac-55e5-9ad7-e3c8bd94d84a'; -- te asustaste
update public.forms set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04', position = 3 where id = 'cac59161-9b9e-5f8a-8268-396b3d2e0820'; -- me preocupé
update public.forms set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04', position = 4 where id = '135d5095-3394-5970-8c4a-b52616ca427a'; -- se preocupó
update public.forms set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04', position = 5 where id = '7f99efe2-bc74-562a-89fa-42b98f437166'; -- vergüenza
update public.forms set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04', position = 6 where id = '866c0258-c5f9-5a62-b904-40afd23a0aab'; -- bronca
update public.forms set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04', position = 7 where id = '0235d3cb-bca8-5c87-8ddb-a73224ece2aa'; -- lástima
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '03cfe6da-d3bc-5212-b2c8-0bf34c4bbb76';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'c27145af-17b5-572e-b61b-4f8d6ba4638f';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '16250405-7d97-5c8c-9cc2-35d2e1442391';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '1ad5f6e0-9ef3-5650-b869-c8d09916a156';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '8a91d653-94ed-5fa7-9347-af0572a5d027';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '2048758b-6a3c-5529-87e3-4a2ba80ca5c1';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '91f54ddf-39c9-533c-9bfb-623690215044';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'b261c0ff-8e4e-58b3-a7d4-29d12df7a444';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '8e2a52f0-c3de-555c-b9a2-32e4b29b4d51';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'd0fc5b26-309b-529b-a261-54a865648e59';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '82c3d93a-6050-5c07-9d84-eea293afe581';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '5e369709-f334-5649-a587-a6ae1f7df1a7';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'e14c7e50-4778-5495-bec4-86201cc9c3a7';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '51ceb6b5-be9e-5877-bf13-ee25df5aa3cb';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '49949c2b-7313-5a04-bb90-8ace42e90b9f';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '70ca9fd0-aa5e-5684-8679-aa60d98e1159';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'a897a70f-633a-57a8-aa92-cc7677ef5550';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'bee9cc47-76a2-588b-b73e-69616dc3eb9d';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '9546d8c3-76dc-5995-bae0-4f67ff38d674';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '6c35b8da-1826-5a1b-b7bf-05d9a7e94ca5';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '2560926e-f758-5e55-be33-c11327cef747';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'be2ed321-7316-5246-9a07-8f16c97767ed';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '3650d3d3-acdc-5e87-94c4-de1dea3487e8';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '781f4f6d-d625-5b46-9bb7-fd895d8e1057';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'bb7d576d-c6e8-553c-bc1f-c23cd58c9e25';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '58cf451c-0319-57d0-8273-47ed7a040770';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '6af50a61-0dfc-5847-81b0-2e7d2b3746cd';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '9b27eb2c-6113-553e-9414-8ad9d07e0811';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'a1e77226-62dd-5c73-9d73-19ea2f4c6561';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'ec47afb3-7a28-5535-8dcb-2c69de76aa44';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'e4bd5626-7144-54ed-b185-5f9045bdb3c8';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '1ea55867-720f-54d9-a955-9fd5dedbb1ee';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'bf2bac0d-d9d9-5d8f-9d39-28cddeb50a9b';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '576532c5-04e1-580b-bba6-81afa0788fdc';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '7060eca6-427a-5272-ae0e-6db8f078a8be';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '1bd4659f-36e9-553b-8e7c-8ddf80bcf3cc';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'b937288b-d2c3-52de-90b0-d7700f169b15';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '1f83fc84-0ac9-53e4-911a-ee0309189682';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'd6a821aa-75ce-55c2-8d1c-19415cc462a0';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'ef73b51d-d361-5230-95da-65f8af6809fc';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'ac3020ed-995d-5ce0-a7af-4dd7c56d8028';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '671be5e6-5560-53c9-808d-d59cf55fec11';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'eb6c1e05-bc3a-5a13-9d59-4cfd896215ac';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '759ef8d0-9010-5dab-8a34-e13554cf7cb9';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'b5e61fb9-0129-5ef4-89f2-142c2f06f468';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = '05f51c07-de8f-592d-991b-3414fd8892bd';
update public.sentences set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'a8941ac1-27bc-5af8-9973-c8fed899def6';
update public.tips set unit_id = '26a9643e-948c-5e98-8425-f79e4b7a7a04' where id = 'b20e2e46-7d03-5dc9-be61-90cfa02a80ea'; -- Me dio miedo

-- me-olvide → me-olvide · me-senti-re-mal
update public.units set title_en = 'Say what went wrong', summary_en = 'Me olvidé de su cumple' where id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161';
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 2 where id = 'c7d589d9-df42-54ed-9700-b0e17d95d9ca'; -- te olvidaste
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 3 where id = 'c7c84714-4a47-5bc7-b79a-c13dfa7d01f5'; -- se olvidó
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 4 where id = '5e5c235b-96d4-5b06-b3e8-5f81fc4f0cd4'; -- nos olvidamos
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 5 where id = '772ed25c-c5ac-56a8-9219-32acece9d5bc'; -- me aburrí
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 6 where id = '8327df72-1369-5bf2-9200-9ba739731373'; -- me enamoré
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 7 where id = '295d6572-2058-5595-b392-3d0df296781d'; -- me calmé
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 8 where id = '8f566a00-2ee6-508d-9f9b-9cbf18476a15'; -- calmate
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 9 where id = 'ae972a0c-3593-53e0-9a09-f981a25b6198'; -- olvidé
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 10 where id = '3aaee2cb-7570-53d2-8333-351465077a61'; -- sentí
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 11 where id = '2dfad763-d62d-559e-84c9-5c50562fab49'; -- olvidaste
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 12 where id = '96dead27-bd63-5dc5-89a8-3ed7791f7dfd'; -- sentiste
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 13 where id = 'e60ceacd-7981-5ed7-9c0e-8bc412f02280'; -- olvidó
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 14 where id = '56d4b0c7-7fe2-5742-a161-4bf18febba48'; -- olvidamos
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 15 where id = '697c420e-d501-5731-b05a-7a89cc71d4cd'; -- pusimos
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 16 where id = '46db7780-90a2-5db3-923d-17bb1f3a0ee3'; -- aburrí
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 17 where id = 'c54c2b8f-8a94-5371-add6-3e724784482d'; -- asustó
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 18 where id = '07f1f1ad-601a-5037-a0fe-da24b8efc1d1'; -- preocupaste
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 19 where id = 'cb0fc4af-27ae-543a-9811-154f5e21a89f'; -- sintió
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 20 where id = '80522109-c454-5700-99bb-14069d710cb4'; -- calmé
update public.forms set unit_id = 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', position = 21 where id = '27f37418-4916-52f0-a855-67287ac6d7cd'; -- enamoré
update public.forms set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c', position = 1 where id = '8fbb5920-cc49-5a05-8fb0-69aaf795f2b7'; -- me sentí
update public.forms set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c', position = 2 where id = 'b3e42175-97b9-5367-a887-dd7c3731a5c4'; -- te sentiste
update public.forms set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c', position = 3 where id = 'd5b78c5e-6976-5fa1-b5a0-387c0179c9de'; -- se sintió
update public.forms set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c', position = 4 where id = '53ff95a5-1626-54eb-b131-c76d35dd0760'; -- nos pusimos
update public.forms set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c', position = 5 where id = '8f2f9deb-6920-548a-a729-4cf5e3ba113d'; -- colorado
update public.forms set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c', position = 6 where id = '2e82b2ae-30cf-59e3-a785-62b20cd5e43d'; -- colorada
update public.forms set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c', position = 7 where id = 'b5b25d89-f896-537f-a3d9-e3513871558b'; -- se asustó
update public.forms set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c', position = 8 where id = '808d56ba-cc9c-5290-9d3b-8ee2a8232fc9'; -- te preocupaste
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '9d0d7382-25fc-5cfb-8009-63df21b6231c';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'a95093fb-eac4-5126-a862-aabd74da5a58';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'bdcb881e-78a0-530d-9861-fc7c395caa5a';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'e4b6905b-5395-5147-8213-6475c684c557';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '76ffa98d-e7df-597a-a1a4-d14f0e0ab29c';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'e894e93e-eeda-5bf8-94e3-5effae939136';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'c35e3af6-cb9e-52a9-9133-08f921eb7212';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '7dada133-6fbd-5d95-9c1b-8f34cd6d9c6e';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '8dc65c6d-128b-5c57-93d2-7d3aa31e7e4f';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '78728472-f1fd-5d08-bef0-2b05ef44f77a';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '9012184b-95df-5df7-9252-d602c60ab5d2';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '7626ac74-7050-5e17-9444-db9dad2f014f';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '471af026-cb9e-5757-a18e-7e4d72cbe961';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'f348c913-2c4f-55ff-b885-bc1e40d1152f';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'b80e0724-7fb5-5066-aa57-1d32c06c1e7e';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '2e7aab6c-7a2e-5bf0-9b0a-94aa60bb173d';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '183e7e38-053e-51a7-9e39-16645ccade0b';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'b0ee1625-2b83-597d-907f-9072487a0e06';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'c00c27e2-a740-586d-889a-d1d0b8e233e4';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '2cf589b5-59e1-503d-818e-45991625c3ba';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'c1471de2-ebeb-5705-96cd-36e272b29800';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'caa646cc-5183-5546-83ce-5c6393f2a0d7';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '44953e9c-2d27-53dc-96de-55725f569226';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '3e08408f-6f53-52d7-a208-b8eac1d37eaf';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'fd9abf47-4eef-5653-8eb6-096f0d62a252';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'a96b8496-de80-536e-a5e3-9932af78721f';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'a35f6c3c-da7a-5778-af09-77dafacc0a03';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '13d1909e-e69d-5205-a063-2d07cbec2dd6';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '29f7f897-3396-500b-9d69-d90bc7a00eeb';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '2d4d7b36-381a-5ddd-95b2-7e3cbeeadcbc';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '9d7b8bd1-b203-500f-9236-e48b17ddb42f';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '9df33dd0-aef7-5ff0-b283-b13df1b120b8';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'bcc4d6a9-4692-5653-92e3-bc6d45e91880';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'e83dc0cd-d0f9-5c17-b284-46bfeb007f50';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '9347d299-7604-5687-ad27-e88787ad0b10';
update public.sentences set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = 'b0119190-6c65-50c9-baec-06aaf29b3c4d';
update public.tips set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '80ff4fcc-3b03-5cec-bc11-61a64e3a76c3'; -- Estaba or me puse?
update public.tips set unit_id = '4eb79153-aa33-555b-9ae7-64893b72fd1c' where id = '6554212c-c2d6-551b-8927-2d403c1af882'; -- Me olvidé, me sentí, nos pusimos

-- la-semana-que-viene → la-semana-que-viene · algun-dia
update public.forms set unit_id = '2902c53a-0143-5823-b423-fd9fe3dc2295', position = 1 where id = 'a8950a14-ae16-5506-88d1-8576ece7eb07'; -- ganas
update public.forms set unit_id = '2902c53a-0143-5823-b423-fd9fe3dc2295', position = 2 where id = '6430dda9-f316-50aa-be17-621a5db58187'; -- que viene
update public.forms set unit_id = '2902c53a-0143-5823-b423-fd9fe3dc2295', position = 3 where id = 'c74fa398-91c5-5b11-8a8a-47b2ba756611'; -- viajamos
update public.forms set unit_id = '2902c53a-0143-5823-b423-fd9fe3dc2295', position = 4 where id = '2f381276-191b-5908-9b20-1f56cab6ddf3'; -- descanso
update public.forms set unit_id = '2902c53a-0143-5823-b423-fd9fe3dc2295', position = 5 where id = '401d14ad-cc6f-583a-b5d5-929e97f0e753'; -- seguro
update public.forms set unit_id = '2902c53a-0143-5823-b423-fd9fe3dc2295', position = 6 where id = '27e66302-891f-5901-8f97-30f55e3ee537'; -- pensamos
update public.forms set unit_id = '2902c53a-0143-5823-b423-fd9fe3dc2295', position = 7 where id = 'c8a04442-c078-5b69-83c1-941c5a408fa0'; -- visitar
update public.forms set unit_id = '2902c53a-0143-5823-b423-fd9fe3dc2295', position = 8 where id = '93b300c6-2feb-57ad-bd03-2e31bf4598ae'; -- anoté
update public.forms set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5', position = 1 where id = 'c6c87950-b68d-596b-9acf-d02ca58c3d76'; -- pronto
update public.forms set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5', position = 2 where id = '0e9a1fef-edca-5673-b410-098d8735b59f'; -- dentro de poco
update public.forms set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5', position = 3 where id = '4cb024f3-fb74-53fe-8622-f21a936aa886'; -- algún día
update public.forms set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5', position = 4 where id = 'e3f35299-3ac2-56cb-b8b3-78a94985677a'; -- fin de año
update public.forms set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5', position = 5 where id = 'd869f259-02c9-565e-a298-01677b2a1984'; -- mudarme
update public.forms set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5', position = 6 where id = '8eea2444-7ffb-5a58-9a69-777bf218623a'; -- juntar
update public.forms set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5', position = 7 where id = '4f57186d-fec1-5a45-bfe7-3c64e5da051e'; -- curso
update public.forms set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5', position = 8 where id = '62e4dd5f-12ca-5ada-9075-9c4a071fd5c4'; -- me anoté
update public.forms set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5', position = 9 where id = 'e8539465-151c-520c-8ee6-b929f8f747a6'; -- anotarme
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'c7626da3-8fce-541a-aef2-415b7661068a';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'cec656a9-ce75-5d16-8f0a-0a1a5ac23211';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'b6dcccd6-2349-5819-8995-1ef5997a79a1';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '14d7addc-24bb-5288-97bb-7aeb2b45a52d';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '9a65f4f2-c4a9-537e-b54e-7f4e35af2fcb';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '3fec1b24-54f5-5cbb-9acb-e82924423a1c';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'bbb0f41d-db24-5a87-aa77-16947dc1b2a0';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'be2920f0-f4d7-5f1a-8285-f753b4121af6';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'd81e5d8b-3dac-5ade-8f53-45ca5fc26ecf';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '761607cf-e33f-5e4a-a5c2-f7ac0bc7a233';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '19b35a21-5f02-5e56-9cbc-2a5ddf034727';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '99db4040-2b31-5fb9-88a5-c7d8fe387eab';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'a9150557-e381-59fb-b430-80ba2680416d';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '43c89293-e7ec-5eb4-ab03-ae9dbb164675';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'e2441c97-8b30-5d0e-a420-0bb603c30fde';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'ea4ba7a3-3996-5a8c-a425-f51fac924b03';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '09b93fc8-9b24-5b4b-adaf-b083f2795920';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '7a817bd0-3480-557b-84eb-6505119925d4';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '57ce3ec2-16a3-5024-992d-20fdb2bc9590';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '37ca8a93-e18f-527d-88ea-75bc10b23596';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '6c57c1e9-5246-5b12-a97b-361a09607be6';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'b0ec04bb-ead4-51d1-bc0d-38ce6ff80a79';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'b4503c5b-127d-5518-af3e-cfeb1a37eb78';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '58b23b71-f5c2-51fb-bfa0-ca505eeb45d2';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'ce924201-bd65-56ca-b889-1a138a359810';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '12d296ba-aca1-5169-bb33-68c0a10fc426';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'cb42c4f1-b234-5a85-8dcc-38a31596b2de';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '04c42d1e-3151-5c91-ac90-3dea833d3f99';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '9050757f-9969-538c-a2ba-3098fb53f8c7';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '3834e02e-66af-5f79-8312-6fd1849446b3';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'cbce500a-66de-5cf8-9ada-a239d1e1e5a2';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '9d2e15f6-6350-529e-8953-4dc862403576';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'db422bae-3894-53d6-905f-3c2308906449';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '4700512a-a184-504b-936e-37a2b272e285';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '49652670-c921-5747-9ffe-3e152ecf5a99';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'f2a1ac98-9f88-5af5-adca-8cd3bff3c365';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '0262fa94-abcb-5db5-ab61-59218209c486';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '41c6e4b6-8d15-5c6c-9b26-c1e9d816feb0';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '6f8d0f79-7560-59b0-9134-c81d0349b893';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '154fd9dc-99e8-5bb9-b204-08cbbcd22e63';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '568daeb2-ccf9-5e66-bcaa-288860572182';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'afc50da2-7864-551b-86c5-9484593544f6';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '02946b39-eb59-58b8-8367-efb30f7edef8';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'e6373856-7f9e-54df-b999-3d3e27f670cb';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'b05a1855-8ff4-556b-ae01-8be86bfc4305';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '12a02bb2-71e5-521c-bb2c-561ab32c37c4';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '4bf879a0-ca36-5ada-9ccd-e39e847d8d11';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '63051360-2c98-55fd-b806-a8ef32762f80';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'a1da88c9-f699-561a-9b5b-652e4309de75';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'd50dc768-0ccb-5459-8e6c-d5e99a5e1df4';
update public.sentences set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = 'd4e493dd-f21c-54cb-945a-a5f44a05035b';
update public.tips set unit_id = '0c101080-c7a6-5fc7-94b1-ef8cf29978c5' where id = '2687eaa7-c8c7-574a-ac6c-804da3aa671d'; -- Voy a tener que

-- acampamos-en-el-sur → acampamos-en-el-sur · la-cordillera
update public.units set title_en = 'Tell a backpacking story', summary_en = 'Acampamos al lado de un lago en el sur' where id = 'ad17a937-2fe2-519e-9f42-86f123c7e38c';
update public.forms set unit_id = 'ad17a937-2fe2-519e-9f42-86f123c7e38c', position = 5 where id = 'eef8d3e4-c70d-59ec-9019-99a78b461908'; -- lago
update public.forms set unit_id = 'ad17a937-2fe2-519e-9f42-86f123c7e38c', position = 6 where id = 'd51a23fc-c991-50bc-a1a4-3e02b01c50b7'; -- lagos
update public.forms set unit_id = 'ad17a937-2fe2-519e-9f42-86f123c7e38c', position = 7 where id = 'd1733475-f3d6-5088-85ed-282f608c73ee'; -- hacer dedo
update public.forms set unit_id = 'ad17a937-2fe2-519e-9f42-86f123c7e38c', position = 8 where id = 'f1e2db96-741c-57d5-8a6d-42f244b62dc1'; -- hicimos dedo
update public.forms set unit_id = 'ad17a937-2fe2-519e-9f42-86f123c7e38c', position = 9 where id = '128175bb-f117-5aec-98ff-ccf56657bcff'; -- mochilero
update public.forms set unit_id = 'ad17a937-2fe2-519e-9f42-86f123c7e38c', position = 10 where id = '5a3182b9-f165-5e45-9027-5467fc95efcc'; -- mochilera
update public.forms set unit_id = 'ad17a937-2fe2-519e-9f42-86f123c7e38c', position = 11 where id = 'a10efa62-6dbc-51a2-8950-3c43fe6313dd'; -- mochileros
update public.forms set unit_id = 'ad17a937-2fe2-519e-9f42-86f123c7e38c', position = 12 where id = 'dc6e8e90-ed98-57a7-ac72-aaf1def98bdb'; -- kilómetro
update public.forms set unit_id = 'ad17a937-2fe2-519e-9f42-86f123c7e38c', position = 13 where id = '47bfaaaa-8285-54b6-ba4f-867a50ad560d'; -- kilómetros
update public.forms set unit_id = 'ad17a937-2fe2-519e-9f42-86f123c7e38c', position = 14 where id = '801dd0fb-ad37-5d88-81da-736507aa7063'; -- Ushuaia
update public.forms set unit_id = 'ad17a937-2fe2-519e-9f42-86f123c7e38c', position = 15 where id = 'ee331306-8b38-5fc3-b542-eb0a0130f326'; -- Jujuy
update public.forms set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a', position = 1 where id = '15a63cf3-7243-5473-8f9a-fa1d88f12819'; -- cordillera
update public.forms set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a', position = 2 where id = 'b47486cd-57d4-5c99-a9ec-acf4fbf18221'; -- nieve
update public.forms set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a', position = 3 where id = '2e6f75c5-256b-538e-a742-f291e1d47e01'; -- valle
update public.forms set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a', position = 4 where id = '6f684d7b-17d4-5029-899b-de7d03180d5f'; -- bodega
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = '0327043e-04cd-5095-89ae-1aa9e8be339e';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = 'f91e9bb0-c179-5c75-bce3-92f0c411ac81';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = '65068a62-4c8c-59cb-87ad-8870d8eba71f';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = '70e6407c-1d31-5ba5-8d2a-ba417a9afbce';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = 'f695e4e4-6e1b-5917-ab7d-527b16721baa';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = '78e21253-4e5a-5d95-950d-12e29392c588';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = 'a880d21d-275b-5a95-9a03-e78a10195517';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = '92d65732-2241-57e8-a13b-53ba2c5092ea';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = '8c7a5d1e-82a1-55e4-be64-b61ed8eda499';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = '353eba00-91aa-54e9-937a-4c2e7a53b0c3';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = '6fed836a-ab83-5433-985d-fe7213d6c572';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = 'eff5f0f5-e96c-5e18-87c6-f894da5bc62f';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = 'de85f8f8-3ef9-5f0b-9ba2-59044e005a19';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = '405e6cfc-e87e-57e0-9e28-61be25ad411f';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = 'a66011bc-f538-507a-ad2f-f1530bae5726';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = 'd81ca5f4-5e1c-51e3-8b1e-2c3d92b730ed';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = '5c9cb639-e7fa-5d0e-936a-04aedcb06ba6';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = 'cb5155b7-473f-55f9-af11-a151fa4ca0eb';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = '5b366f8c-964a-5b70-805e-b9c70149fe4b';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = '65ca765a-2fdb-5d0f-91f4-efefde6b1b1e';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = '11d50781-fa8b-5fbe-a8fa-6427194b127c';
update public.sentences set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = 'e0e77553-9b9e-5ccf-b160-60b4f9b82a61';
update public.tips set unit_id = '55fe7979-1541-598d-af16-798fa8d54c6a' where id = 'b4d85210-f57c-504d-a015-0281e2125c5a'; -- La cordillera

-- el-depto-nuevo → el-depto-nuevo · el-contrato-de-alquiler
update public.units set title_en = 'Move in and set up a new place', summary_en = 'Pintamos el depto nuevo' where id = 'e4a7439f-a626-5e82-abaf-06bc10e30be8';
update public.forms set unit_id = 'e4a7439f-a626-5e82-abaf-06bc10e30be8', position = 2 where id = '896ca234-c063-579d-afe4-aad75bf8de48'; -- extrañaba
update public.forms set unit_id = 'e4a7439f-a626-5e82-abaf-06bc10e30be8', position = 3 where id = '526a4353-6f03-509e-b429-17d26d0c08da'; -- alquilaba
update public.forms set unit_id = 'e4a7439f-a626-5e82-abaf-06bc10e30be8', position = 4 where id = '496ee5b9-6712-54b0-8d1a-a4861a8af291'; -- alquilar
update public.forms set unit_id = 'e4a7439f-a626-5e82-abaf-06bc10e30be8', position = 7 where id = '4d495006-b278-5acd-9d30-6a7720424a03'; -- flete
update public.forms set unit_id = 'e4a7439f-a626-5e82-abaf-06bc10e30be8', position = 8 where id = '03364429-fbc1-54ad-9645-ad2ee6075d42'; -- mueble
update public.forms set unit_id = 'e4a7439f-a626-5e82-abaf-06bc10e30be8', position = 9 where id = 'ce9732fc-04fd-50d8-8d40-dd45aab2b2a9'; -- muebles
update public.forms set unit_id = 'e4a7439f-a626-5e82-abaf-06bc10e30be8', position = 10 where id = '0682ecc7-237e-53f2-a3b3-017f7be98ee0'; -- colchón
update public.forms set unit_id = 'e4a7439f-a626-5e82-abaf-06bc10e30be8', position = 11 where id = '499a86f4-3dbb-59d8-9d4d-cad77e76f262'; -- propio
update public.forms set unit_id = 'e4a7439f-a626-5e82-abaf-06bc10e30be8', position = 12 where id = '19fcce42-a39f-5454-b21a-b21cce95b3ed'; -- propia
update public.forms set unit_id = 'e4a7439f-a626-5e82-abaf-06bc10e30be8', position = 13 where id = '8216474f-375a-5eaf-a7f1-487607a908ce'; -- mudaron
update public.forms set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d', position = 1 where id = '76dd1126-2e75-519b-903c-17e7a2fc4a5a'; -- dueño
update public.forms set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d', position = 2 where id = '07a56876-b609-5849-ae84-d7853c0ced70'; -- dueña
update public.forms set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d', position = 3 where id = '6fbc9d89-4667-51c3-8779-2dceb244eff8'; -- inmobiliaria
update public.forms set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d', position = 4 where id = 'af8a0178-0ef5-5e06-bde3-a4b915ae3d30'; -- alquiler
update public.forms set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d', position = 5 where id = '3556dd85-57a1-57a4-abcb-136dfa366c8f'; -- expensas
update public.forms set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d', position = 6 where id = '06df6c1e-d1b8-5ebd-91a4-b7886a691035'; -- contrato
update public.forms set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d', position = 7 where id = 'ff1eccdc-3b2a-549c-99be-68131e04f000'; -- depósito
update public.forms set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d', position = 8 where id = '3d96b8a6-9f74-59f4-ae38-c17efe4e7e94'; -- garantía
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '73f5c862-2ba9-5d5c-b80d-c65039e6d4eb';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '9405e0bb-ff7c-53af-8f32-dea1a4a5b931';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = 'd2dbab15-3214-51e6-ae51-4ee80ecf0e71';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '60877c27-f53d-5ae0-88b9-42e179d124f6';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '79b04973-38e1-5d45-b8ff-808a64b7cbf1';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = 'fdc98178-0e64-518d-aea1-17480c14b0ff';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '83b74aab-840a-533b-87fa-c532d6d7e58e';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '2c972f6e-e8a9-5061-9fee-5da3fca880fd';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '035a4a63-5977-5ce5-a4cd-127256576356';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '9ed28f10-467e-545d-9f50-b4b98c4150c2';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = 'fb9abeca-3d9d-5e85-ab37-ef4bf5502401';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '2eb8f2f5-75fd-5fa4-bc0a-dbda25aeadcd';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = 'bdcc6ffd-ecb3-5100-a5be-8350a62a60c4';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = 'cb417755-40d6-594a-88a1-df130f0f6eeb';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '68d9031c-dadf-58de-a023-46b3b5a6258e';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '76078d9f-b12d-5aba-8fcd-023d8e12b658';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = 'daf3df23-820a-538e-9a6e-ef5e77eb2ee0';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '81705cbf-ccb2-577a-9a8d-7ac6862255c7';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '4a2a5363-508d-56a6-b435-13a07575130d';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '23127b85-45d4-59e8-9964-812b8d4d8572';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '30dca1ee-c9ba-570d-9453-cf23f6ab3d3b';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = 'd2fa1b48-9820-5404-9ee4-a52b737a6db3';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '53e8f74e-dc61-52ec-80c8-3ddcdba02c1b';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '96931f86-06f9-511c-b08b-fb8a37b39806';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '8ba0f007-c415-5382-8b2e-fa53c4a3f205';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '0bc71d51-fb7e-5466-8166-01dbd00c0dd7';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '4406de0d-9f01-59ee-b2b4-f1bef2973b0a';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '4f22186f-22d1-59a6-bc93-a7672a302c54';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = 'c888dcfc-92bf-5234-9d17-7381acf899c1';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '5693b34f-a3ad-5c2e-a9c0-11afb9cf27ea';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = 'afb743f7-bf32-50c0-b206-e1d9714f63fe';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = '1ac518c9-d530-57c5-bfe6-7c050e584851';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = 'b7f257a8-ddc1-597f-8533-7b600e494e83';
update public.sentences set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = 'a89a168f-e30b-5d92-b64e-d809b7d748e3';
update public.tips set unit_id = 'b693c321-29bd-5b35-939f-d3c0e7563f9d' where id = 'dbad321f-4d32-5c2e-9458-5dbbd5e6decf'; -- Renting a place

-- me-das-una-mano → me-das-una-mano · me-regas-las-plantas
update public.forms set unit_id = '1bb1664d-4c74-5dfd-9001-ae7f0fd897f8', position = 1 where id = '08b2d5b4-7dc2-509b-8df8-f4e1cfe9ee71'; -- una mano
update public.forms set unit_id = '1bb1664d-4c74-5dfd-9001-ae7f0fd897f8', position = 2 where id = 'd3061cae-8385-5a2b-a5e8-7c27c7cc5057'; -- me acompañás
update public.forms set unit_id = '1bb1664d-4c74-5dfd-9001-ae7f0fd897f8', position = 3 where id = 'dda850fc-f301-5087-bb86-5b43d2104880'; -- acompañame
update public.forms set unit_id = '1bb1664d-4c74-5dfd-9001-ae7f0fd897f8', position = 4 where id = 'b168b873-d9f0-5c0d-ae1c-d36a9c630269'; -- nos acompañás
update public.forms set unit_id = '1bb1664d-4c74-5dfd-9001-ae7f0fd897f8', position = 5 where id = '81e615d1-184c-5b1f-aa41-ac4c02f514c6'; -- llevame
update public.forms set unit_id = '1bb1664d-4c74-5dfd-9001-ae7f0fd897f8', position = 6 where id = 'a5bc0c36-7c86-51b7-a86b-ec2c12d0e442'; -- nos llevás
update public.forms set unit_id = '1bb1664d-4c74-5dfd-9001-ae7f0fd897f8', position = 7 where id = 'c5cc25e6-f9f9-5178-9463-02a17387d6cd'; -- un toque
update public.forms set unit_id = '1bb1664d-4c74-5dfd-9001-ae7f0fd897f8', position = 8 where id = '00caffab-c9de-58a0-a711-59fb4fa9dcb2'; -- de paso
update public.forms set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a', position = 1 where id = '9bc152d6-03be-59a4-9aa5-e0b413382864'; -- me cuidás
update public.forms set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a', position = 2 where id = 'e92f758a-7ff9-5371-958f-22a6889b911c'; -- nos cuidás
update public.forms set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a', position = 3 where id = 'cf33d3e5-698b-5d13-9640-5f178b2375ec'; -- me regás
update public.forms set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a', position = 4 where id = 'b86ee0d6-8eb8-56e1-a1b9-890b9360882b'; -- regar
update public.forms set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a', position = 5 where id = 'bd8ff42c-bc4e-52c4-91cc-f1236362bd44'; -- planta
update public.forms set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a', position = 6 where id = '8dfeed80-da65-5c1e-b5bf-e6b21736bda6'; -- plantas
update public.forms set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a', position = 7 where id = '35968119-4cc6-58e8-a6cc-3b13de3adc25'; -- prendé
update public.forms set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a', position = 8 where id = '069942c1-21a6-56cd-9662-433068a3f8a9'; -- apagá
update public.forms set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a', position = 9 where id = '32b38c4e-4fe1-5968-9a0a-598d5ec05a1a'; -- subir
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '8bf701be-3d53-55c7-9389-4bb2cba6ad03';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = 'd79003f4-1164-577d-b2ed-fa104d5721d7';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '3f1a0d79-e0bb-5d27-994e-3f85940959e8';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '0b066c5a-cf35-55d1-872e-f0531653946c';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '094ec642-3100-56de-a913-349a295a4966';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '7d950651-c09e-5678-a7cc-7118bd884e8e';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = 'b72f39d5-479a-52a3-82f9-1fce4f8d3c2d';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '936d01d6-2fe3-5a79-afd2-97ba01700d76';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '8bef2955-2c4e-576c-a177-86131d6fb0f1';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '1539400e-4ad6-5f87-994f-eb825657f7a9';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = 'abd59d38-f81c-5da3-a0e8-b21990dd1a67';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '1c443b44-cc60-543e-b8e3-95412ee56819';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = 'e1c09504-615e-51b8-b73d-ff00e0398b31';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '54f7820c-26f1-5453-a3c2-70965363e1eb';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '8616b854-08dd-5aac-bb39-d789c984fcfe';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = 'a416077a-6625-5eb6-a2fd-f544ef886d1a';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = 'dc136538-b79d-56d3-872e-6609058009c5';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = 'a252d78d-d946-534c-a5b1-00b55850bd6d';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = 'aa42e4de-33d9-5219-bf7a-7da36c9fcd27';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '1744b919-88ef-55c3-a439-6ec685e35a5c';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '190399a3-a862-580c-8ff8-f891db7f048d';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '889f8132-a5d2-5489-ba6b-f43c30e56195';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = 'afb8e965-0b43-5fd2-b53b-7afe9e338e91';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '06d2215b-7e18-58f8-a3d0-e0abdfcdc170';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '5b21854d-9b32-5b97-972b-97b12738ecfe';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '5f79f6c1-32ba-54f3-a703-7f63f19cf6ce';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '74feb4d3-5ed0-51be-9852-c09076fd93b1';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '87316c2f-b466-5adf-8e57-b5a062a1dc66';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = 'ba91c57d-7189-51e3-abba-d31930e70bc1';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '94f9fe89-8f3d-5ce0-ad04-800b728ce694';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '833e6fff-50ef-5523-8e7c-69111e0c6799';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = 'a2c3439e-0891-51d0-b88d-ef8374edf2a0';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '919e905d-5a2d-5b5a-90a0-6034b8cebdb0';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = 'e2bf3a89-42cb-52e7-92b4-a6e6465f95d7';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = '1448723b-0b8e-58b8-8865-0d24c620fd45';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = 'f0f0f777-9f7f-54bc-a1d9-dbac366ff981';
update public.sentences set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = 'ed1cbcf0-cc05-5fb7-b72a-28a561e9f1b0';
update public.tips set unit_id = '48525155-fe71-5ae9-9765-59b334e7b26a' where id = 'db277486-1a0c-5764-957e-645579b22f1a'; -- Prendé, apagá

-- hace-fresquito → hace-fresquito · esta-calentito
update public.units set title_en = 'Make things small and sweet with -ito', summary_en = 'Hace fresquito, pero salió el solcito' where id = '827ff70d-4671-51f6-a0aa-745cfebd058a';
update public.forms set unit_id = '827ff70d-4671-51f6-a0aa-745cfebd058a', position = 9 where id = 'b62773ef-2cdd-5c5c-a6c0-b899ef50bf28'; -- de mi parte
update public.forms set unit_id = '827ff70d-4671-51f6-a0aa-745cfebd058a', position = 10 where id = '48946be4-279b-588a-9065-f5818a97a34e'; -- cuento
update public.forms set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182', position = 1 where id = '41bd8918-5b9a-514f-8233-4ea89e9e2488'; -- calentito
update public.forms set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182', position = 2 where id = '90f8f8e3-75bc-5c9a-a1ad-87ff0543447f'; -- calentita
update public.forms set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182', position = 3 where id = '94c244a9-55a7-5963-9837-f38c50bae661'; -- cortito
update public.forms set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182', position = 4 where id = 'f7722b80-2757-5a42-b218-9aac29fdfbe3'; -- cortita
update public.forms set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182', position = 5 where id = 'ee60c01e-7283-529c-9e3e-d2ec8513618b'; -- igualito
update public.forms set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182', position = 6 where id = '19cbb74d-5e90-5738-91ae-0e8450b0b54e'; -- igualita
update public.forms set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182', position = 7 where id = '7fdb6dbc-9fa6-5f89-b9d7-c1f54a154949'; -- solito
update public.forms set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182', position = 8 where id = '1660d922-9e39-51ff-859f-13d33372ff52'; -- solita
update public.forms set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182', position = 9 where id = 'b5dfa9a7-3a51-5faa-b4b3-159e320a5afd'; -- tempranito
update public.forms set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182', position = 10 where id = '0e770a81-9176-53ee-98b8-f35039d49c29'; -- rapidito
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'ce08b84c-aa4f-5ac3-ba0c-4c69b33227d9';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '7a5121e0-ce1a-5e4b-a0b7-376b74939a70';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '2eb6cc42-45c0-5587-9aec-20711fa56f33';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '550f0707-62ab-5d9c-9794-90a88118601c';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '8a8fda3d-98cd-5671-9d80-2046bbdc80e6';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '5695c440-56b2-53a2-a0fb-3b3def74f605';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '8d668bef-585d-5b1c-b58c-a530c17ddb93';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'a91cce49-aff3-533d-aa29-f1df6e114198';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'f24fe23e-bb06-5a46-8335-ca2ab5e11fcc';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '120545d1-da26-5a23-adda-ddd619d3a48a';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'e0ae36a8-8dd4-51f9-bd13-35df3c423320';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '1bc90b9c-6428-518c-a649-3c95891040cd';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'c2d685c6-eb89-5ac9-a9db-236e26d36a4f';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '189abb29-12b8-5db9-a320-2a89f1c78e10';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'f97493e3-5b02-5cc7-ace2-4366b4db1c36';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '2a18742c-5c50-5acd-a886-3a948d1d5469';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'a98ec3c9-55b6-51fd-ac2a-52f167d3c89a';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '0ad1bd0c-6d3f-58c6-8039-7276b8d51fdd';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'a3a7ac22-0be7-5f37-ba67-66e4bd7ab968';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '79139414-cd5f-5e6f-b595-cb4d7074fc63';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '503457c1-bfe9-58d2-9695-7ca17c266b4f';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'a3cf1b28-74ee-509b-9b18-2578f3e48af3';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '859abfed-22f0-5b93-a326-2165f2c8e92f';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '5a3471d2-4857-5b31-b948-515c2d4fc0a6';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'fd1d6246-4601-54ed-ba06-f2812399023a';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'b62f0677-92cd-559f-976c-6615abf45f55';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '5660c1bc-8050-5f26-a523-73deedd2b900';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '73f9136e-edf6-581f-92cf-487dead9a48e';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'f07033e6-d9b4-5963-8700-ee4c775aed98';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'a7a09828-6caa-5cf9-af32-39e9cd90eee7';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '0304660f-7b28-5c00-9072-89f71da6a101';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'f68c0bcd-f6f3-53d9-91a5-677ec932ac9c';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '0e1245e5-2e48-50ad-bacd-f40f6d614f8d';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '0c99bb58-5268-59d7-8020-810e8d7533fd';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'be5f26d4-4ec8-5933-9f44-2186fc6d2992';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'c59b69cf-4ede-5790-b004-37dcf0ed198c';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '9a3f8664-c949-57dd-8d9c-3fd89cae3797';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '3c53bce8-efeb-56f0-ad29-060f71d08d9b';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '46daa387-1ec5-552d-bb8b-deeaa486d97f';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'd0391f7e-2eb1-5ff2-8481-4e39dc583916';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'b5f705e7-7430-5831-a8a4-a3d10359601c';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'd043152b-2719-5f25-aa4e-861c5d20ab68';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'fbba5aaf-aff4-501f-bf41-97210d825e79';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '0b5632c9-0d77-59e2-8ae1-27ab4bccc4bb';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'ed6a6d7c-8031-5953-acb3-f83d63e5de03';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '916b218b-c42f-5ba6-ae63-c31d805550fb';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '418bf8ae-8894-5b30-925b-d63c1125c3a1';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'ff2f82ea-fbbd-53ea-9fc4-0191b9532b68';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = 'c609b92f-0421-5c8f-9e64-56bfc6b08f51';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '534e6327-440c-54dd-9710-57a2d769132c';
update public.sentences set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '33f586e7-dfc4-5ce4-857e-09a553f1c215';
update public.tips set unit_id = 'ebc1fcfe-c54e-5b88-817e-a2b31ef1b182' where id = '48fa40c1-c5f2-58f5-8669-4ba8e2da759c'; -- -ito on everything

-- a-la-mesa → a-la-mesa · no-se-olviden
update public.forms set unit_id = '796fb7f5-7211-54d8-83dc-d15338978f46', position = 10 where id = '41b1f461-6fce-5141-bdfe-eb0abccb447e'; -- olviden
update public.forms set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d', position = 1 where id = 'eab86de1-7f47-5cf9-ac32-81753c3f01fe'; -- vayan
update public.forms set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d', position = 2 where id = '64ccb0b8-e8ab-5e5c-81ba-1157c377403e'; -- sentándose
update public.forms set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d', position = 3 where id = 'f0738040-366a-5c9c-b07c-48d66898fc84'; -- pasando
update public.forms set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d', position = 4 where id = 'ae55dd66-5985-5022-b152-02e5f47895e6'; -- hagan
update public.forms set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d', position = 5 where id = '6cf6bb65-0cd0-558c-a235-f3e807fe68f3'; -- apúrense
update public.forms set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d', position = 6 where id = 'adde9fb2-4c5c-5513-adf1-3c4e6c71bac0'; -- se olviden
update public.forms set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d', position = 7 where id = '5c25b693-412c-5308-adc7-6b3b5a0b8b06'; -- dejen
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = 'dd903dd0-0e83-5e77-bbbb-07adc25727f7';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '4140d6cd-cd33-578a-ac27-173f0662470f';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '2908a285-4d47-5400-8a08-3440c9bcbeb1';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = 'a47ee1c5-5dbb-5d27-baa4-1d4152179922';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = 'd46d78dd-ef71-5271-8217-597f1484e73a';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = 'fbac0740-1d3d-5330-bcce-8688817fb703';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = 'd63c69ae-6556-5dac-b120-3fc50cad27d7';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '747dbf5c-cd03-57b8-a3fe-7f178a668107';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '95c0e729-7552-5eea-be1a-7f13b3ac95fb';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = 'ec3aa5ba-8b2c-52e2-9db9-dc118b464777';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '3826d13e-57d5-5587-871b-beffa4f729d2';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = 'a1eb72a9-5f36-5e22-8fbb-6c077a88d619';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '0a66c626-3814-5e37-a579-177af84d6e13';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '97c2cd80-df0d-577e-939c-e824eed7acde';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '2a90eb81-afe7-5751-be9b-ff8c05a2b111';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = 'f0d33f60-8a9d-586d-8d40-460ae8d4f1c9';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '3b96c493-42c5-5dae-ade5-2629852c53ae';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '26374456-ea62-579e-bb89-50a25bd6e2f9';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = 'dac1d6ca-c92b-57bb-9ff0-1f889889a01f';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '2804e78a-5ce2-5bac-9b5c-c47497a8aaaa';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = 'cfb5cd2e-0ed5-5038-9fd7-fd9d8b37bb1c';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '8cbfd766-e59c-5dfa-bfa6-dc7d22fd0355';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = 'a0d1a8e0-de49-53c5-a08f-180a0cc818a7';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = 'f617d1d3-cf9b-5318-9b96-e269f512a8da';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '445fe226-02d3-5e28-a1f4-827850d280e0';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = 'cbb5a959-0a0a-5b40-a915-1fdf66ab442b';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = 'c4586638-904d-57fc-9767-4795781753ee';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '9938205f-b672-53cc-882c-dd4b247adeaa';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = 'dcf6bd34-79c0-56bd-a079-f5dada8cb9c2';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = 'df9a468b-c660-5cfe-a148-5b543942f458';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '45ce46a3-007a-5be2-b1d0-53ed347e468d';
update public.sentences set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '0753e3f1-1c40-505f-9cd1-d0d0cc7496d6';
update public.tips set unit_id = 'a8ac41b7-330b-5382-8570-9842da64c60d' where id = '9cca76e8-1bf3-5576-9d7c-c338276503e1'; -- No se olviden

-- migraciones → migraciones · la-precaria
update public.units set title_en = 'Ask at the immigration window', summary_en = 'Una consulta: ¿qué requisitos hay?' where id = 'de1cac02-1435-56ef-9682-17ea2bc59bc4';
update public.forms set unit_id = 'de1cac02-1435-56ef-9682-17ea2bc59bc4', position = 1 where id = 'e96fb10c-44d2-5f72-b370-22afe1aff6a7'; -- residencia
update public.forms set unit_id = 'de1cac02-1435-56ef-9682-17ea2bc59bc4', position = 2 where id = '9c5919ab-1aec-50c9-bc2d-19061b38e040'; -- consulta
update public.forms set unit_id = 'de1cac02-1435-56ef-9682-17ea2bc59bc4', position = 3 where id = 'cf746549-8289-569a-b66f-a89f76d3da4b'; -- ventanilla
update public.forms set unit_id = 'de1cac02-1435-56ef-9682-17ea2bc59bc4', position = 4 where id = 'a54956bb-7346-5bae-91e9-a0a59cd6aaa8'; -- requisito
update public.forms set unit_id = 'de1cac02-1435-56ef-9682-17ea2bc59bc4', position = 5 where id = '94f5bac2-b522-5fc7-81d9-ae92f4ab326c'; -- requisitos
update public.forms set unit_id = 'de1cac02-1435-56ef-9682-17ea2bc59bc4', position = 6 where id = '2bc82293-2e75-5c1f-bb7e-1ae87c4a7297'; -- copia
update public.forms set unit_id = 'de1cac02-1435-56ef-9682-17ea2bc59bc4', position = 7 where id = '987fb384-c335-5f1f-805f-2a638d4d0dd5'; -- original
update public.forms set unit_id = 'de1cac02-1435-56ef-9682-17ea2bc59bc4', position = 8 where id = '863ebf44-c27a-5e08-aa57-efdd88b87e5a'; -- atienden
update public.forms set unit_id = 'de1cac02-1435-56ef-9682-17ea2bc59bc4', position = 9 where id = '810eb458-d47b-5f3c-b439-bbace33be4ae'; -- atendieron
update public.forms set unit_id = 'de1cac02-1435-56ef-9682-17ea2bc59bc4', position = 10 where id = 'f3f2ff4f-b19e-5292-a256-74519daaef03'; -- presentar
update public.forms set unit_id = 'de1cac02-1435-56ef-9682-17ea2bc59bc4', position = 11 where id = '81f708a6-881b-5a71-b2c7-8d449e739c92'; -- presenté
update public.forms set unit_id = 'de1cac02-1435-56ef-9682-17ea2bc59bc4', position = 12 where id = '1979f8ef-9db0-5017-8c30-55eef8c1dfe5'; -- Migraciones
update public.forms set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab', position = 1 where id = 'add1f7e5-f1ab-575e-bab5-93fb45c24aff'; -- antecedentes penales
update public.forms set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab', position = 2 where id = '0d730c16-d154-53ec-a3cd-5ba5f6533877'; -- apostilla
update public.forms set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab', position = 3 where id = '4883a733-3452-5c29-9b2d-29227d0dfc0b'; -- certificado
update public.forms set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab', position = 4 where id = 'a942c8ad-abfd-56ef-b835-f8d824e20e67'; -- domicilio
update public.forms set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab', position = 5 where id = '9819e0f3-a1db-5de6-b4b3-bf427a934b68'; -- precaria
update public.forms set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab', position = 6 where id = '9e4ac6e0-a2a0-55e6-92af-ec778566b159'; -- demora
update public.forms set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab', position = 7 where id = 'a2e24c8d-3bf4-51a8-98cd-c96dbd725b40'; -- demoró
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = 'b5783758-e188-51f8-b117-94e138ec32a0';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = 'd5fcd3bc-6034-5710-a869-2eba4d6ff2d6';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = 'd8602d47-7e11-5723-bf5f-c8785a8d8099';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '2860bd88-37fa-52eb-8aa9-137e60216cb3';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = 'a7fc8ccf-73b6-5226-a57e-0747b0571cd6';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = 'd5e3560b-1438-5c43-b53c-3e0254b79066';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '4ae8c091-8388-58d1-8f79-f65b5c7144e2';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '9a58cb19-852a-5201-83ce-37def18e6894';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = 'f01f01f0-c8fb-54d0-a356-5b251ffe39a6';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '93965f2c-c8f7-52bd-8779-dd9e5d119ceb';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '2d229346-3614-5a69-a831-6a926554149e';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = 'f10941d0-cfc6-5cee-b5d2-c2f0531ef777';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '63b2934b-5db1-5e84-96e3-749df1336a00';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '71275709-cbf0-51ff-8580-8e40fe3a2fde';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '033f6657-9266-580b-86ab-f3b8fbdf7a38';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '7cf5b202-008d-5390-a2d1-f6d8dee75fe8';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '6f39eca3-e6e6-545c-a1fe-fc04099e5094';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '30c9ee4a-7f77-5c9c-ab6a-980bd172d6a8';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '61325382-ebf5-509e-8cd2-fadfee38a1f9';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '75030a61-b72b-5310-88c0-b4867df99ef4';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '6fd74901-7120-506d-b984-1f826d2c77d8';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = 'bd5e51e1-e5b7-5005-959b-03d5fa33738f';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = 'cfe956fc-8d00-53ed-9069-e1a123bc8d46';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '67ed5feb-ded2-5b15-aba6-f5a76251a81b';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '751c80e3-b50f-5c2f-82ac-175de7b480c5';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = 'd5cac53a-5205-5b35-9c53-0a7ceae02d59';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = 'ad977d06-db9f-55ce-adfc-93b8ca76ba08';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = 'faf51bc6-b317-5fe4-b281-41ad74bbbb64';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = 'c21c9e77-0d14-5886-8f21-d587f0582962';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = 'd5510faa-f397-5bdc-8356-0e42d10aa5b8';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = 'b74ea427-71c1-5b46-b72e-6c70eb2fe524';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '71ba52b7-dc2c-5d71-8fbd-7a660cfd5b76';
update public.sentences set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '545c9540-6458-505d-83ce-7fb7ba188adb';
update public.tips set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = 'aed54cfb-0f01-532e-96bf-6fc8ed773310'; -- What Migraciones asks for
update public.tips set unit_id = 'e395759a-dbaa-5616-b61b-f18953a1efab' where id = '0a7f761b-d9c7-516c-b579-5874def00152'; -- ¿Cuánto demora?

-- se-aceptan-tarjetas → se-aceptan-tarjetas · se-prohibe
update public.forms set unit_id = '59c95af3-6785-5037-9294-f36861623e46', position = 1 where id = 'e919552b-010b-574b-86ca-d77fe32b1985'; -- se aceptan
update public.forms set unit_id = '59c95af3-6785-5037-9294-f36861623e46', position = 2 where id = '766f2668-db14-5523-8d93-d8b8e84a5d0d'; -- tarjetas
update public.forms set unit_id = '59c95af3-6785-5037-9294-f36861623e46', position = 3 where id = '23eba761-5788-5235-aff2-d46eb671f721'; -- se hacen
update public.forms set unit_id = '59c95af3-6785-5037-9294-f36861623e46', position = 4 where id = '363d39eb-9204-59ac-a36e-ee5ee082c9e6'; -- hacen
update public.forms set unit_id = '59c95af3-6785-5037-9294-f36861623e46', position = 5 where id = '7dca759e-5740-509a-abf0-567221c74be6'; -- hacemos
update public.forms set unit_id = '59c95af3-6785-5037-9294-f36861623e46', position = 6 where id = 'c8012adc-018e-5841-864a-19dd163ffc9a'; -- envío
update public.forms set unit_id = '59c95af3-6785-5037-9294-f36861623e46', position = 7 where id = '0bc0dd38-4cb4-5df9-a2e7-d8c0a9b150e4'; -- envíos
update public.forms set unit_id = '59c95af3-6785-5037-9294-f36861623e46', position = 8 where id = 'ec6fe017-4fed-5974-9815-24cc26cff938'; -- se arreglan
update public.forms set unit_id = '59c95af3-6785-5037-9294-f36861623e46', position = 9 where id = '0f624703-a955-59ab-8e5b-7a88daedffdb'; -- local
update public.forms set unit_id = '59c95af3-6785-5037-9294-f36861623e46', position = 10 where id = 'f23743d1-6d4b-5ec7-a32a-6fd360439218'; -- atención
update public.forms set unit_id = '59c95af3-6785-5037-9294-f36861623e46', position = 11 where id = '9d4be3d3-7ddf-5c58-916f-6d5661106d01'; -- liquidación
update public.forms set unit_id = '59c95af3-6785-5037-9294-f36861623e46', position = 12 where id = 'bb14883f-07b4-5d53-bf80-92bac8fd56e4'; -- aceptan
update public.forms set unit_id = '59c95af3-6785-5037-9294-f36861623e46', position = 13 where id = '6f8d7a76-0b90-5d29-8879-4c6d01e06ccb'; -- arreglan
update public.forms set unit_id = '59c95af3-6785-5037-9294-f36861623e46', position = 14 where id = '89e09007-0528-5199-80a3-cc27dbda426f'; -- permite
update public.forms set unit_id = '59c95af3-6785-5037-9294-f36861623e46', position = 15 where id = 'dfe1fe70-d9a6-5b80-b13b-14a08ba601a3'; -- permiten
update public.forms set unit_id = '59c95af3-6785-5037-9294-f36861623e46', position = 16 where id = '965a47ac-aec6-56fb-b0c6-3b1b3885f6f6'; -- prohíbe
update public.forms set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8', position = 1 where id = 'ff51f68b-8531-531c-b21e-a6fd70a079f3'; -- se permite
update public.forms set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8', position = 2 where id = 'f78398b6-9177-5431-89ea-570afd6ec759'; -- se permiten
update public.forms set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8', position = 3 where id = '94abfe72-c6f9-57b8-b29f-67d602f90ad3'; -- se prohíbe
update public.forms set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8', position = 4 where id = '3ff49c4a-1698-5189-8f9d-a984f80cb784'; -- se busca
update public.forms set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8', position = 5 where id = 'ea7397a8-f915-5a8a-96d1-7b7995173f59'; -- recompensa
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = '4d804006-723a-540c-bdf1-e372d5654a2b';
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = 'c71d016f-c950-524e-b321-1b114288ec64';
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = 'a15b8b20-44da-534c-9b24-3cf21af44453';
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = '56aca3e7-be90-5f6a-99dc-ecce53516eb3';
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = '8892598d-eff2-5f33-9a2b-a40069606069';
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = '8fd21424-d9c8-5bef-b6cf-3892fe7ec260';
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = '5dbf64b2-ce7d-5454-a4d1-52df1cbda854';
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = '30f977e5-ee58-5c39-bace-c1e54c00a708';
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = '5d154e96-6094-5903-a2ca-af1474578334';
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = 'd18a2a1b-a558-539b-9c44-597b9939050a';
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = '7c5177cf-f5a7-5c7c-852e-4e40c454cf32';
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = '9a442938-c588-566a-b727-d9852a9faf08';
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = '6c59fe09-093e-5c1c-9819-42493ce9681e';
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = 'f737caa9-1ec5-50af-9cc8-70ee2bb193b2';
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = '5ba35527-7485-5420-a788-fecff79c8d6f';
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = '04a6c605-0836-5e18-bfc8-9677a49ebf2f';
update public.sentences set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = '047040e5-c14f-5e28-a45a-45a131df6c7c';
update public.tips set unit_id = '25c8daf3-d19e-5247-b76d-d24a3eeff7a8' where id = '4be9d9ea-b2f7-5b90-8382-a6108a0ffd65'; -- Out loud: ¿se puede?

-- cien-gramos-de-jamon → cien-gramos-de-jamon · estan-maduras
update public.units set title_en = 'Order at the deli counter', summary_en = 'Cien gramos de jamón' where id = '3ea35fe7-87c2-5bc5-a138-ed2124298174';
update public.forms set unit_id = '3ea35fe7-87c2-5bc5-a138-ed2124298174', position = 3 where id = '4cb6d751-0062-5b21-bac3-7403570ff90a'; -- jamón
update public.forms set unit_id = '3ea35fe7-87c2-5bc5-a138-ed2124298174', position = 4 where id = '4f70316d-d837-599b-93a4-83871b451874'; -- feta
update public.forms set unit_id = '3ea35fe7-87c2-5bc5-a138-ed2124298174', position = 5 where id = 'a0a3a359-fe99-5ab3-8237-5fd443d4127a'; -- fetas
update public.forms set unit_id = '3ea35fe7-87c2-5bc5-a138-ed2124298174', position = 6 where id = 'bedf3232-7f46-5fc1-a5f9-41e601fce842'; -- fiambrería
update public.forms set unit_id = '3ea35fe7-87c2-5bc5-a138-ed2124298174', position = 7 where id = 'f626578f-7957-5ac2-8ed3-ee3846ae897c'; -- un cuarto
update public.forms set unit_id = '3ea35fe7-87c2-5bc5-a138-ed2124298174', position = 8 where id = '2498296a-0dec-589a-ac9c-191223bb00fc'; -- cocido
update public.forms set unit_id = '3ea35fe7-87c2-5bc5-a138-ed2124298174', position = 9 where id = '5c4a23a0-16de-5f42-afad-5255808a7bff'; -- cocida
update public.forms set unit_id = '3ea35fe7-87c2-5bc5-a138-ed2124298174', position = 10 where id = '29111bd5-4c86-5df8-8734-8ad1eb497094'; -- crudo
update public.forms set unit_id = '3ea35fe7-87c2-5bc5-a138-ed2124298174', position = 11 where id = '07ab2a17-0eb4-54bc-90cd-370d48b8b20f'; -- litro
update public.forms set unit_id = '3ea35fe7-87c2-5bc5-a138-ed2124298174', position = 12 where id = 'a9662ef3-f01d-57a7-8820-0b80157c8197'; -- algo más
update public.forms set unit_id = '3ea35fe7-87c2-5bc5-a138-ed2124298174', position = 13 where id = '6724bffd-42ee-5da4-8746-4efbcc25e623'; -- nada más
update public.forms set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86', position = 1 where id = '8a8f0467-20ed-5ca8-b101-18a72c67c499'; -- feria
update public.forms set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86', position = 2 where id = '1b0564d5-4bc3-5511-9266-48b59ffd80b1'; -- naranja
update public.forms set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86', position = 3 where id = 'dc216923-614e-5c85-842d-18d5098bdf3b'; -- naranjas
update public.forms set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86', position = 4 where id = 'f6da0668-acb2-5073-9b64-d002d51a61ee'; -- limón
update public.forms set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86', position = 5 where id = 'aaa0f038-ff7c-5568-bd91-59a41bc2c126'; -- limones
update public.forms set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86', position = 6 where id = 'fbff3405-7c8a-59ac-b694-ad5a2a215b19'; -- zanahoria
update public.forms set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86', position = 7 where id = '3b054978-de6a-5d5c-bec3-00f1f6819875'; -- zanahorias
update public.forms set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86', position = 8 where id = '4bd0d4a4-14b1-5b68-9d90-50d1aa589a7d'; -- palta
update public.forms set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86', position = 9 where id = '112320df-c163-5e86-9b66-22dc6645051e'; -- paltas
update public.forms set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86', position = 10 where id = '7573d560-0417-53a9-84b8-37f6e47974cc'; -- frutilla
update public.forms set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86', position = 11 where id = 'db303c14-06e7-5cf8-923a-bee7ee039e85'; -- frutillas
update public.forms set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86', position = 12 where id = 'ff320fb8-d533-56cc-8546-f883e2d4d518'; -- maduro
update public.forms set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86', position = 13 where id = '1ec8ffd7-a4b2-57f7-a3ce-ef20f11a53c5'; -- madura
update public.forms set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86', position = 14 where id = 'ef3e2c08-6dbb-5840-9958-7a64083dafe7'; -- maduras
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'de1e8108-972b-5089-ad23-008ca4efd340';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '7c52589f-e8be-5ffd-a4df-e537edf3124b';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '6f75155d-6cfd-5efc-839c-0c57094332d0';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '868bd527-787f-5641-b6e6-e8f39545a543';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'd3a3933f-cc69-5a81-9605-799bc75e11cd';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '4d9204cf-0102-5cc3-8497-34feabebd142';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '6a288d37-c358-58ea-9aa9-67f5afb766dc';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'e35abb3c-65be-5280-9ccd-89789bb27d01';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '006e20a8-106a-558f-8502-1cd150ee2d8e';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '7f575d2e-d3cf-5fa6-a608-437abd607d7c';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '72ab9977-7d14-57da-91a3-4ccfe6065a59';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '97559fc1-1fe5-5fa9-89f0-e376536108e9';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '2b1d246e-9c46-52ba-b201-92680af6b988';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'aef7fc97-f116-5ace-a7fa-4846c4d9556c';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '1289c3fe-8161-5ba5-a19c-9a318a353155';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '0b7aea6a-d0b1-55c7-a871-1dd6cf8ca3a3';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'fab0703f-c3f6-5f00-9dd3-99495fa07d47';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '7b768109-08a4-5710-9584-06032d49eb7f';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '08eb02c2-0851-5dc5-bb9a-aba1668904ae';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '5171517f-568d-5be0-ba6d-5790a659035f';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '7c277a5f-bc2f-5e70-867a-d38744524f6b';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '37f486bd-aa7f-5b4f-8244-7bd1ed5c67da';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'b8846822-4b20-5ba3-a1d7-51ea48552b8f';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '492497a4-4ed4-5d48-9c98-5599cad735e0';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'b159731c-221d-5e4d-8c83-adf39a16b1e4';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '8d3b7744-a486-5f05-8224-72ae5395ee23';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '819716f0-e3d0-57c6-b87b-735d24c804b7';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '956b7dfc-fec2-5a56-8ce2-c743df4eaac7';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '406335d9-65cd-5713-b6a0-29f63a943cd4';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'a57ff0f3-0a05-581a-beb6-817232ce926b';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '437a5b1b-f799-5e5b-b2d8-4ed6be0c8d68';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '764e9f5c-c573-529b-8b48-78e112142957';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '09db7b7d-3a79-5ffe-ae21-0d3d693616ec';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'a627c7ba-0f18-5a57-9ad7-9ce2cc6a7de7';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '62a213f6-818c-5980-8180-64363f77357c';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'e65a7ec0-d44f-5e97-b8d6-8cc2fba8ce3a';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '943c7b12-ab52-5fe6-addd-a72076ed3d74';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '0ede915c-ac34-534a-bc78-98587fdc6c13';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'e8ccf757-f2d1-5a93-bcbb-f511a87ed69a';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '96d1ac40-2e44-59a3-8896-05bf0844c4e2';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '48bf9092-6aef-566a-becd-b8e3162cf264';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '35428009-de9a-5c4d-8e30-6d2d0a0ade9e';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '4ce3c7a9-8abc-5449-94f9-0e897ffda27a';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '84b6cff4-8303-5d75-9908-cca7186a092c';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '593bac4c-1f93-51f2-a2f4-9f518855c24e';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '4120618c-3789-5155-87e4-36aabf0e6a7c';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '8a62847b-50ed-5d81-bcb8-144fcaf486dc';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '655912d5-132f-58c0-aa1c-cadd067c53ad';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '429ed805-5359-58f0-b21a-40c5aca9d942';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '6817e7a5-9342-51b2-8c7b-c7c94467927c';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'a33a52af-753d-5564-a6b9-12a906593012';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '0ce344ee-91de-56e2-aaeb-8ea400afdc2b';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '222d6995-6b56-54a5-9a4d-1730bf52af35';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '2e7100e2-749e-55ec-bd48-7b265fce7805';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'a186c3b9-fb0f-5530-9812-175577a1864e';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'fd011e04-d7bd-507a-babd-d86aa61d63ee';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'd2be2800-ee53-50b6-862d-17bdbcb0f346';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '45724f52-b246-5ac4-8354-3a99f4e89e30';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '7c173c5d-2cab-5469-9b8a-28e7d06d6690';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'b3ccc841-4f0a-59b5-8a89-479c8335df7b';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '8687eb94-cb47-58f3-8512-57ab1d894df7';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '922c51dd-82a8-5675-9209-bd421f5a6fb7';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'b2418188-ff49-5bb8-acfd-6d93130e4c60';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '4011f5b6-0827-5872-adab-d7dd6d06153a';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = '6c4d9e5a-92ce-5cb3-834b-2a22064cb691';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'da88b46a-fa79-58d5-85e1-59895ecd82ea';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'bb35d6b5-7f8c-5b85-8921-e7f22c20e62e';
update public.sentences set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'a4011833-43ef-5592-89e7-37bd0bad697c';
update public.tips set unit_id = '9dec35e1-a048-5b67-87a0-e936bf8e7e86' where id = 'fbd2133a-6859-5ead-9926-d782de4ed43e'; -- Palta, frutilla

-- me-afanaron → me-afanaron · me-estafaron
update public.units set title_en = 'Say you got robbed', summary_en = 'Me afanaron la billetera' where id = 'e38a0b51-167e-583b-a179-5eafde3573f0';
update public.forms set unit_id = 'e38a0b51-167e-583b-a179-5eafde3573f0', position = 2 where id = '8dab7750-38b2-5ebb-bec7-02128d9cc76f'; -- te robaron
update public.forms set unit_id = 'e38a0b51-167e-583b-a179-5eafde3573f0', position = 3 where id = 'e3882ebc-017c-5643-ad00-cf353ccc8c90'; -- nos robaron
update public.forms set unit_id = 'e38a0b51-167e-583b-a179-5eafde3573f0', position = 4 where id = 'cd3ccf1f-d814-5412-a8dc-fd2bbc38d81d'; -- le robaron
update public.forms set unit_id = 'e38a0b51-167e-583b-a179-5eafde3573f0', position = 5 where id = '0763ff4e-e4dd-5fac-9591-105583fac446'; -- motochorro
update public.forms set unit_id = 'e38a0b51-167e-583b-a179-5eafde3573f0', position = 6 where id = '25eda8b5-2013-5749-9be7-9c6c3bf4c804'; -- me descuidé
update public.forms set unit_id = 'e38a0b51-167e-583b-a179-5eafde3573f0', position = 7 where id = 'bb9db888-53b0-5a7a-b74a-bf86ef292a88'; -- cámara
update public.forms set unit_id = 'e38a0b51-167e-583b-a179-5eafde3573f0', position = 8 where id = '902fd556-ebc0-524e-b91c-0e13d2741ded'; -- cámaras
update public.forms set unit_id = 'e38a0b51-167e-583b-a179-5eafde3573f0', position = 9 where id = '7bc4ef54-8fb1-5918-b819-2bb721f6d059'; -- afanaron
update public.forms set unit_id = 'e38a0b51-167e-583b-a179-5eafde3573f0', position = 10 where id = '90133dd0-b457-56c9-b3ed-412938697a76'; -- estafaron
update public.forms set unit_id = 'e38a0b51-167e-583b-a179-5eafde3573f0', position = 11 where id = '8eea75c5-4e27-5ccc-b6b9-bdfa1d7f607f'; -- descuidé
update public.forms set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b', position = 1 where id = 'd39f0609-6ad8-5d4d-b630-9000dd15904a'; -- me estafaron
update public.forms set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b', position = 2 where id = '1da47234-ebc2-5ef6-a174-3c96a7a6a3ec'; -- estafa
update public.forms set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b', position = 3 where id = 'd11e1d02-d871-5bc2-b977-4eac127ad09b'; -- trucho
update public.forms set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b', position = 4 where id = '57f19d73-eae4-5971-afb6-9e1079fe1410'; -- trucha
update public.forms set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b', position = 5 where id = 'a3651a1a-a3d3-5cdc-955b-dde9612208b4'; -- cuento del tío
update public.forms set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b', position = 6 where id = 'cecbd52b-adee-5aac-a420-152b5441940a'; -- bloquear
update public.forms set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b', position = 7 where id = '65df7cff-6202-5f5b-973f-43cb277d0b17'; -- bloqueá
update public.forms set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b', position = 8 where id = '7bb369d5-2ebb-56e6-b73d-30276477c82d'; -- bloqueé
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '246953f1-83d6-5b2c-8d99-3c2eb8adc0d7';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = 'e07567a4-b8e1-5ef1-8291-609f5503e6bb';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '38f8763c-2b82-55f0-bae5-fe2653d0384c';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = 'd03a3e8e-de31-501e-8e27-cc12d41ed5a0';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '0c2378dd-d23a-59a9-8dfe-10baaf025e8c';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '29a990bf-2afe-5242-8cc1-6617e3c6d6a0';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = 'e356858a-da2c-5985-9224-4dd98126f224';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = 'f1d1d7b5-69ef-55a6-b9c1-f9da8d01c349';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = 'c7f48fa7-262e-5afa-94a2-53cfa357a373';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '04fcd765-4236-598d-a7db-95cdaca52b83';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '208dc358-d956-5101-b82e-fb1072d759bb';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = 'ee1596a3-696e-5836-ae1d-32cd3e6c1345';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '537e6267-557b-5857-91e5-f333e860de5d';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = 'fc1a7ce6-c7a1-5aa4-9355-fc08839b96da';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '0b274213-38d8-5466-9837-534e953f3bf1';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '740ecce2-e034-5177-b740-bd9829515b0a';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = 'c5ed8e20-0bf8-5f96-b8ad-996f2878ec09';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '6276eae0-7c33-5736-9ae3-57fd526f057d';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '5a500b57-664f-5571-8ed8-77c621727bcb';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = 'd14c48c5-6ed5-556b-906b-410fb29d8014';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '8ea29f02-4bbd-54b9-b501-febf3059ac95';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = 'a858d8fd-3488-5fa8-9fb1-bd78448b03da';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = 'b4812881-8819-5685-b420-8923174a1e87';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '4aaf602b-c81c-50d3-ba22-6c005ba18b0b';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '41a2f936-8d6c-5713-b6d2-d2ba917a75df';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '4a72f241-e05c-5cff-92bb-33c1c1f1ac8e';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '5a2da888-d884-5b23-af2d-3cab28382268';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = 'f78c7966-3c61-5b34-af2c-5173a0254b80';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '9a675ce3-0f07-582a-a08e-c68b753d6a05';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '1f1dcdf9-7d69-5c6c-9974-98a2f4602c69';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '4436f29f-aa23-57dd-9076-bed99ddde159';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = 'be24e3f8-eee0-538d-abb5-49cf8d44f65e';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '265ea076-4b81-5f18-a515-811b751522fd';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '2c64a774-3dca-50c7-aeb9-3f031553a0fc';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '79fc193b-76ac-5548-9fd8-e3f46a4c7e3a';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '33e81036-6c0a-5c2e-bd28-ec721bd6b3c6';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '767be534-137a-5521-9558-b548a7e12beb';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '00f28fe1-6158-5fef-bd0f-3e122e137b7d';
update public.sentences set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = 'd4a6e8cc-951f-5fed-83e1-a4ceecef399e';
update public.tips set unit_id = 'f51f4b46-97c3-5fad-84a0-ee1f1be7194b' where id = '68bbdfb3-c560-5eab-a9a4-e53a956ef37d'; -- El cuento del tío

-- la-ruta → la-ruta · tenes-registro
update public.forms set unit_id = 'ed66a36e-5a88-56f2-a2c7-3fdf72291b4e', position = 4 where id = 'dd57d460-4825-5ee6-aa89-4f86dc1923ae'; -- autopista
update public.forms set unit_id = 'ed66a36e-5a88-56f2-a2c7-3fdf72291b4e', position = 5 where id = 'a023c5b4-94b5-5f49-aecd-a295868a59e0'; -- agarramos
update public.forms set unit_id = 'ed66a36e-5a88-56f2-a2c7-3fdf72291b4e', position = 6 where id = '0ac4f533-75fc-5f17-9967-91f0034f75f0'; -- nafta
update public.forms set unit_id = 'ed66a36e-5a88-56f2-a2c7-3fdf72291b4e', position = 7 where id = '696e6ef5-77d3-5fe6-8813-abed1e707eaf'; -- cargá
update public.forms set unit_id = 'ed66a36e-5a88-56f2-a2c7-3fdf72291b4e', position = 8 where id = '62b0c3ef-3ab2-5d18-8087-58e1ce090032'; -- cargué
update public.forms set unit_id = 'ed66a36e-5a88-56f2-a2c7-3fdf72291b4e', position = 9 where id = '80d97627-2f15-5836-a740-02f3cf0ac728'; -- estación de servicio
update public.forms set unit_id = 'ed66a36e-5a88-56f2-a2c7-3fdf72291b4e', position = 11 where id = '98fe20d6-e13a-5939-b550-06055b61ecf0'; -- General Paz
update public.forms set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6', position = 1 where id = '46674902-96e8-5db0-8edd-a82d7349a29b'; -- frenar
update public.forms set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6', position = 2 where id = '55cc5950-a843-592c-989a-527e8e0cd3db'; -- frená
update public.forms set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6', position = 3 where id = '7d0fd0eb-2742-5792-ae63-a201e45b24ef'; -- choqué
update public.forms set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6', position = 4 where id = 'be4dca18-54df-5bbf-bcd8-3737a4628e4e'; -- chocó
update public.forms set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6', position = 5 where id = '49effd7b-70d9-55df-a86c-1d44b6bb3f0d'; -- multa
update public.forms set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6', position = 6 where id = '32e10e08-c2be-5608-90b9-4fd397e4b099'; -- registro
update public.forms set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6', position = 7 where id = '0430989c-dd05-5a59-9ad0-a11d986d7ce8'; -- cochera
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '0d0b0a1c-1880-5748-86db-f5cb950ebb00';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = 'bfdc073e-6a92-5323-bc33-d73e268e7bb4';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '8c419d36-a88e-5f98-993d-f2a6314dc901';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = 'c380fc30-ae75-50fb-b428-ff9dd725f437';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '791797a2-4290-5f8f-aecc-a38ef8253f8a';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '9965f402-0a11-53c5-a946-e2b0cc163e06';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = 'e9c37ddc-c691-539a-a9b0-6ac43edb2bc3';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '7484624e-b07e-56be-9dd9-d2ca414410c1';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '6b890c99-12bb-50e6-a5b5-06741b14128b';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = 'cbc71f19-133e-5be7-b404-a12d452ca10c';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '7b0fa33b-3289-5dd5-b4fc-5fa5db0aec37';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '22d2fa4a-5cad-59a1-a9bb-43186a4464d6';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = 'bf5a5adc-029a-586c-b3dd-bf54373c6146';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '28099b83-7646-5ffe-a6b6-cc1717f3c7b9';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '562b8527-513d-5a81-bf62-e9ca541a1ef4';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '0dbd0385-d1a6-5e2d-a00f-294243330b85';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '0c7aedf1-feb4-57c4-9345-8a619afc4360';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = 'e518376d-4278-5d7f-880c-122a298ff12e';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '124c259e-2ec5-580d-ab95-65902c11fe93';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '793d68e6-3b21-56f4-9e43-3d33d23257ab';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '2e0a5940-1bf6-5603-b763-ff6bba2c0e45';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = 'd92856e1-e889-5db3-8828-39520038181e';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '81f5b312-a9c0-59f5-b8a1-48b70b19f0b4';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '9b5e4eb7-7a5b-525d-85bc-c5cdc5ca24d4';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = 'ce79d14c-2cd3-56e6-8d7a-038eb61641ee';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '1f19a5b8-aaae-599e-b916-80adb9c8a11b';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = 'd6362369-85cf-5abc-93cd-82cece6cce51';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '0a4bd5bb-1a07-5866-8d02-6fb3ad4beb5b';
update public.sentences set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = 'fd43aacb-736a-53ed-ad2d-cabe41317158';
update public.tips set unit_id = '69989cdd-e5b7-598a-a64d-5ebd14d824a6' where id = '9cabde8c-14a1-59c5-afcc-463bd29cbf7f'; -- Papers and parking

-- estamos-de-novios → estamos-de-novios · se-separaron
update public.units set title_en = 'Talk about being in love', summary_en = 'Estamos de novios' where id = '672335a3-bca5-50a9-a61e-0d2d70bcd3c2';
update public.forms set unit_id = '672335a3-bca5-50a9-a61e-0d2d70bcd3c2', position = 2 where id = 'af96cd95-b676-5575-aa26-d72e7090ec55'; -- nos escribimos
update public.forms set unit_id = '672335a3-bca5-50a9-a61e-0d2d70bcd3c2', position = 3 where id = '683521b7-6baf-5b69-a0cc-e3473c23c50c'; -- novios
update public.forms set unit_id = '672335a3-bca5-50a9-a61e-0d2d70bcd3c2', position = 4 where id = '14e8e7d3-454b-51ad-a351-c8e40dae09e3'; -- ex
update public.forms set unit_id = '672335a3-bca5-50a9-a61e-0d2d70bcd3c2', position = 5 where id = '852dc8f3-1956-5ab3-a7b1-5923b4cd5f64'; -- amor
update public.forms set unit_id = '672335a3-bca5-50a9-a61e-0d2d70bcd3c2', position = 6 where id = '9ba89217-543d-5344-be5c-4f9ca5501115'; -- beso
update public.forms set unit_id = '672335a3-bca5-50a9-a61e-0d2d70bcd3c2', position = 7 where id = '20dd7838-85c1-5592-965f-58ed350a3433'; -- te quiero
update public.forms set unit_id = '672335a3-bca5-50a9-a61e-0d2d70bcd3c2', position = 8 where id = 'ad9f763f-04ef-574b-a176-f5ce3040d4cd'; -- te amo
update public.forms set unit_id = '672335a3-bca5-50a9-a61e-0d2d70bcd3c2', position = 9 where id = '914a56d8-623f-561a-810a-8060fd492e32'; -- conocemos
update public.forms set unit_id = '672335a3-bca5-50a9-a61e-0d2d70bcd3c2', position = 10 where id = '38e4af50-0a4c-53c3-9e64-d013cfb6f1d5'; -- separaron
update public.forms set unit_id = '672335a3-bca5-50a9-a61e-0d2d70bcd3c2', position = 11 where id = 'a9dd1b91-2c4f-599c-83c6-db921b8e1c46'; -- pelean
update public.forms set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1', position = 1 where id = 'ff972442-2920-5b42-b8ce-746b22b56364'; -- se pelean
update public.forms set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1', position = 2 where id = 'fdf7fc3b-64ca-525a-8204-8096aacb30b3'; -- se separaron
update public.forms set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1', position = 3 where id = '4474ff88-f5a0-5f64-a25a-9e74e9742388'; -- dejó
update public.forms set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1', position = 4 where id = '051591c6-3aa3-51e9-bd35-39ba249ad910'; -- mentiste
update public.forms set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1', position = 5 where id = '0f6cd7ed-aec0-5ecb-b6a0-2c5d2bbe70bc'; -- mintió
update public.forms set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1', position = 6 where id = '3210799b-d1a2-5db4-8d68-5a4587f1cdf9'; -- confío
update public.forms set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1', position = 7 where id = '3f5f054f-5cf4-57c7-9ba1-4a8592cab12e'; -- confiás
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = 'a29a8fc2-9f3a-591b-939f-73138735ed26';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '9b4c2a05-f8ab-5825-ae6a-272c652404e8';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = 'b235cac8-d1af-5962-9652-6c469f97a5ee';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '6dbcc734-99b0-5c50-a945-5aac08b64073';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '716cb16c-baf7-581a-9ee7-82bb17bf12d6';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '9f5833d5-a727-5bed-b9f3-0b73bff80810';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = 'a5d0e187-bb85-57cc-86f1-c2b99389bdf4';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = 'cf847c27-f530-59e7-b714-5ed2d5e60683';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '2dc8cd6a-5b6b-5c08-8031-c960f7bfd824';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '9b2c4b01-d651-5ea3-82da-2f0da7853ba6';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '20d97718-f4f1-5bd9-840f-029dc74f069e';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '4a103ac7-d2ef-57d8-b8db-36cf90a89662';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '592fb656-9a5e-5b48-8452-a5b49409ef2a';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '354ad548-22ec-56c4-afe3-3c6674cd17ae';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '5a13c720-fb37-54e2-b778-358c490637da';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '136a37bb-8731-54bd-8901-b7bf2de84714';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = 'ae60e86f-b75f-5b53-ba78-ff4a12fa53ec';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = 'e51fa989-b165-56b9-9ecc-613a446945f1';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '934351f0-e366-5f47-8a7d-33c5dbf72466';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '1bc9c9c5-e73c-5477-9608-7285a72b253f';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '9f8e2afe-1a21-5a10-9a69-7f990feac59c';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '4a9d38be-cd95-530f-ad7c-debf5534ed69';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '2ae3b63a-a78e-5466-be2b-8c508f2888b2';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = 'c71b9678-7fd1-5b08-b8a5-9659586a2cc0';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = 'e7ff5cff-1540-5bc5-bf47-50ea01cf5390';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '416a3d91-2bd1-507c-87cc-73c97f0a7c9f';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '0f6f8d28-9533-5368-bd3a-5836f49a629a';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '9d14ad4b-13eb-5463-8909-4847697dc348';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = 'fac2d44c-b829-59f5-9e40-69c1703f590d';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '1e228acc-c075-52e9-82f8-54e446c738d9';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '8bafded5-b951-5440-b603-9538700233b0';
update public.sentences set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = 'c4ffa53c-9d80-5ef4-a9ec-25f9d65fe219';
update public.tips set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '5da4918a-949d-5581-912f-9ba1ea88bde3'; -- Estamos de novios
update public.tips set unit_id = 'b14d8094-379f-5aa2-a965-be325d0ed1c1' where id = '3e1aea26-3240-5b82-8f97-779422c5dfd4'; -- Confiar en

-- no-lo-aguanto → no-lo-aguanto · es-insoportable
update public.units set title_en = 'Say who you get along with', summary_en = 'Tu hermano me cae re bien' where id = '22f748c4-e86a-57f2-8dfc-09a4885d1d24';
update public.forms set unit_id = '22f748c4-e86a-57f2-8dfc-09a4885d1d24', position = 8 where id = 'd97af9d1-1ae7-5777-bcc6-5bd07d3dd685'; -- nos hicimos
update public.forms set unit_id = '22f748c4-e86a-57f2-8dfc-09a4885d1d24', position = 9 where id = '1cf2de8f-58a2-53e0-9a30-13b5a7c75653'; -- química
update public.forms set unit_id = '22f748c4-e86a-57f2-8dfc-09a4885d1d24', position = 10 where id = 'bfd455ba-674a-5780-90a2-9cf412f1e192'; -- amistad
update public.forms set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082', position = 1 where id = 'b4abdc00-6d1e-5727-b25f-527536fb6772'; -- aguanto
update public.forms set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082', position = 2 where id = '949f9d7b-b641-573a-99d9-755840daf3ae'; -- aguantar
update public.forms set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082', position = 3 where id = 'a5fcf80f-8ad8-5d5e-9035-021c31864cfa'; -- insoportable
update public.forms set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082', position = 4 where id = '5444fcba-2595-5de0-bb59-ee1c799f8e89'; -- falso
update public.forms set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082', position = 5 where id = 'e4f133bb-0fd5-51e0-9920-4d566e3fa458'; -- falsa
update public.forms set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082', position = 6 where id = '73407581-948c-5c90-b13e-8f9d5fa41a81'; -- hipócrita
update public.forms set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082', position = 7 where id = 'f9bf00ce-8b97-5d29-9e7c-6dd329863eca'; -- respeto
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '05be1cc3-ab09-5102-b8dd-c632c7633acf';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '9e3803d2-1f0e-5edf-89f1-e6717abc4714';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = 'c7d43526-d54b-54ad-b907-18baa3fc01b7';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '5ea5ea43-ca6a-518f-9d59-2b972b3cf45a';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = 'eab31d58-783c-5801-8acb-47dfd0ce914f';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '3e2ae069-c715-523d-a5c8-0c5f3d7a95fa';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = 'ea35f706-232a-58bc-99cf-6825a2f8bfde';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '6d487e46-48d0-5650-8a79-93f48eee0f9e';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '8fa9a08f-9211-59c3-93c6-62cf57020b0f';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = 'c66b9c93-ed2d-5e01-82e2-7b89460aca55';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '50cd5635-7260-524a-832f-10563fac242a';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '6e893308-1e9e-5188-9f63-075d9d3d78bc';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = 'bb65b56b-f10a-55ee-b3bc-60061d79956a';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = 'df789885-68ab-5d97-baa5-2b94613cb1b7';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '7c2298bc-c3cf-5378-89aa-c5e5ca04e66c';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = 'fdb5f858-0b36-58ef-98fc-24c728c8e03f';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '86f71ebe-e198-56f4-b6b1-ca042ae1be30';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '59ecfe53-e74a-558a-8d5d-4c8c9dab9d4f';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = 'd60a973e-00f3-5462-a7f6-25e5e07c3aef';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = 'c1a8bbe7-8f85-5904-beea-d7b2b2bee216';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '46218269-120f-53fb-ab58-ea1d8ecbaacd';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = 'ce7845c5-9dec-5062-b896-c0d6473d3b26';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = 'c35697ea-e8dd-560c-b216-a4b304d1a5ab';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = 'e01bed14-64b8-5db9-a29e-897ce5b6bfe5';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '4d24dec7-549c-5a3e-b665-8bc177fea0c7';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '2a28bfcf-461c-52ca-aa57-6a87c6a79508';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '6dcc06b9-cf14-52ad-9fb1-a22dda864914';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = 'b4ed8f62-a3a5-5a6f-bea3-67c2909287de';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '8cbc40cd-3655-5ef3-a579-b3360d462af2';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '60ef7e03-73d3-5d78-9a63-c2f1691cc068';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '838084a9-3a31-5a4e-b84e-8f6bf5922760';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '479891b7-faad-59a8-9194-611317065513';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '7fdbf6a9-1d32-5b3d-8993-c27b57223802';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '1a0abd05-4a38-5aca-a0b0-afdef7b74451';
update public.sentences set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = '65ad42af-46f3-50d1-bbe7-eec3c465f5ad';
update public.tips set unit_id = '26d94980-1d61-5f48-98cf-710bf2083082' where id = 'd8cbc098-8879-5b9f-bf4d-675b87f2a096'; -- No lo aguanto

-- donde-estara → donde-estara · capaz-a-lo-mejor
update public.units set title_en = 'Wonder out loud', summary_en = '¿Dónde estará?' where id = '3dd370c2-01fe-54ba-95fc-3c5ef1637eb0';
update public.forms set unit_id = '3dd370c2-01fe-54ba-95fc-3c5ef1637eb0', position = 2 where id = 'c5cf7e0e-a363-5454-bb1b-6f0f7e99dde6'; -- estarán
update public.forms set unit_id = '3dd370c2-01fe-54ba-95fc-3c5ef1637eb0', position = 3 where id = '905cfd2f-3a62-5fc0-b2c9-fc2df8ca0bdd'; -- será
update public.forms set unit_id = '3dd370c2-01fe-54ba-95fc-3c5ef1637eb0', position = 4 where id = '1e4bf859-fff0-5038-842f-17ccdded896f'; -- serán
update public.forms set unit_id = '3dd370c2-01fe-54ba-95fc-3c5ef1637eb0', position = 5 where id = '780294c0-a18e-520c-bc1a-4686562b477b'; -- tendrá
update public.forms set unit_id = '3dd370c2-01fe-54ba-95fc-3c5ef1637eb0', position = 6 where id = '58882b94-f678-5bcb-ad86-f4f1726d7c9f'; -- habrá
update public.forms set unit_id = '3dd370c2-01fe-54ba-95fc-3c5ef1637eb0', position = 7 where id = '8d8f7f65-f48c-5791-8a60-53187aa0430f'; -- hará
update public.forms set unit_id = '3dd370c2-01fe-54ba-95fc-3c5ef1637eb0', position = 8 where id = '406816cc-cec1-5144-9186-3d31ce8af418'; -- vendrá
update public.forms set unit_id = '3dd370c2-01fe-54ba-95fc-3c5ef1637eb0', position = 9 where id = '5ea4806b-8b36-588f-b652-75e756219366'; -- pasará
update public.forms set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418', position = 1 where id = '11a081a4-9532-5b58-be52-12f790b886d5'; -- capaz
update public.forms set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418', position = 2 where id = '798e0833-cc29-5d1c-b5b4-1d15d64b0de3'; -- a lo mejor
update public.forms set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418', position = 3 where id = '16eaee5e-6396-5de0-8d30-52891045ae79'; -- quizás
update public.forms set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418', position = 4 where id = '2d30f727-dae0-5af3-b1ea-ea643d4787b0'; -- probablemente
update public.forms set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418', position = 5 where id = '413ab271-8d5d-5bd3-8868-60339523e75d'; -- seguro que
update public.forms set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418', position = 6 where id = 'e9000712-46a6-5543-981d-b6344f04052c'; -- supongo
update public.forms set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418', position = 7 where id = 'b436a10c-e988-57a5-9716-92c4ba73e2e6'; -- debe
update public.forms set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418', position = 8 where id = '55726014-1f84-5281-b238-11348314aa94'; -- deben
update public.forms set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418', position = 9 where id = 'aa41827a-f685-594d-a928-2ffd69190f04'; -- debés
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '43924822-ca15-56c0-99bb-3fc321b27295';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '5378e5da-e057-5dcc-bff3-6936cec5a841';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'a086cbbf-3c15-56e3-ba4c-1b9c6f34f019';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '3c6cd83c-7cb5-5f8e-af02-1b6c63748354';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '12b17672-ad21-52b0-8c1c-6fb1c248b4a9';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '52e187d2-488d-50e1-bde4-5a8a7d829c27';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '8da852f3-7123-580a-b85e-c87f3784f2e1';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '16b50f6c-1022-56a0-baf0-bfdfb96fe368';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '6c358df0-71c7-5de6-9c25-47f566f09aad';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '180d3d20-e348-5bc9-bf7e-f6d7d99103db';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'ecf623ba-6bf4-5951-8779-90af18bea214';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'c54646c6-5587-5efb-a327-788a5faf1018';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'b08d8efb-f8c6-54a3-bbc2-1647f7cff1ed';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '8a6188eb-4c67-51e8-a471-7221fdcb09e9';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'd664eab0-2d7f-5a95-a672-afb7ca88d122';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'c411304f-7930-5b89-9526-e8f00b118d3d';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '355852e2-da15-5ed5-a100-15975c31de88';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '7c9d47f2-2996-5431-b886-7d37b8e9ce62';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'ccee055f-ecc4-5e28-9710-5884a08429fa';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '03eb8397-b166-5744-98d7-69b8712b424e';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '6ff66a50-75a1-5029-b089-116ec1a59480';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '7cdc84a6-72c0-56d7-8acc-7c88751b80cb';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '1457eb9b-4035-5a33-b37a-e4c032641006';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'd1054c9f-e87b-5d97-8fc1-4f986655553c';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'e6e93e4a-b6a5-54f6-94a1-2306b062fec9';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '047eb309-bbe9-50f9-8868-08727cdb3783';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '257155c1-f9b1-5d34-bdea-79c9c406919e';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '69f67945-dcb2-5d41-a039-8de91a92a7f5';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'ba097735-60dd-523d-8881-dcd686b25187';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '69f54ee6-7d8c-59ac-9ae7-3dc8d2c6aa5e';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'b80227a1-77d6-5307-a1a3-8d8a0126d51a';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '09b019b4-f6e7-5f5d-bd28-56ce849a6d0c';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '5c648efd-6783-5fa4-8635-79ea061bc609';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'f0bd6e5e-7cfc-580e-b182-60cf043a921a';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'ebde14a4-44c2-56d1-bb53-42e2577597a2';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'e13f109b-fa67-5744-b3b7-a9de3f39c841';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '5311e629-2fc2-5233-b023-faa10606fbb0';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'fe721eea-0bcb-5789-a710-54a24ce0b6b0';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'cea88cd8-de67-594a-b0a6-06bb5e5c06f7';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '2ce4391c-eaf9-548f-a039-9b08b1679496';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '9d933442-156b-5c6b-8a90-512640f2c8d1';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'd526ccbd-66dc-55c4-83c6-755cb3dbd6a6';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '52c11d9e-f40a-5faa-802f-27a0e4206fb1';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '6e9d43af-45e0-52d9-bd3a-4bc1079dadbf';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'c3ca202e-2f16-5f1f-9e4e-c8f48dddb3ff';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '72286584-5fdc-536a-89c2-c071e6b65613';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '268b06e8-44a6-5ee4-b656-79c9d46c38ab';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'a93dc6ab-0184-5f69-ab6c-d8972a4e1762';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '3ead2a9e-687a-5247-b30b-272e7ba61a07';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'dbfbd1f1-3dc0-5f5d-a083-da72fc9242f6';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '79255cfc-1a7d-5b72-a0ec-e376e8b7e48b';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '8e8a277a-5a40-5a10-a035-c7615c999bb8';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '9fb1e79d-ff44-5f6f-a680-51e0c53d4a7d';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'e92dda28-22f3-5706-9460-7c386e2a4731';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'd917a13a-1039-53f2-9775-1fff0c115246';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '77c4ec74-3078-5406-88fd-7c050bad2fe3';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '1692da46-74d1-58f3-aeb0-bb4372114852';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'aec23fe0-4408-5b96-bdd1-2b3dde2e07fe';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '85b8b17d-b1ef-52ca-8cce-03c9d19e49ac';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'dffccf8e-914d-5431-b269-acc3e88ce6e0';
update public.sentences set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = 'e9cffc5e-885b-522f-8958-44be5f68382e';
update public.tips set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '6f3c143b-2af0-5c70-b9e2-7435c2b347d4'; -- Capaz, a lo mejor
update public.tips set unit_id = '721f018f-d12b-5bca-a357-d4801ad7c418' where id = '7b5302fb-5521-5119-bbb6-dfeb663b58e8'; -- Debe estar

-- es-medio-vago → es-medio-vago · medio-agrandado
update public.forms set unit_id = 'a56af3ac-cade-5ff7-bdce-38285c0c74e8', position = 12 where id = '603281ac-63fe-5739-8a18-fb6d01b5a581'; -- cara
update public.forms set unit_id = 'a56af3ac-cade-5ff7-bdce-38285c0c74e8', position = 13 where id = '91e19ec4-93ed-51e0-915e-2d21d61b7e7e'; -- tipo
update public.forms set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c', position = 1 where id = 'd4c278e5-b9cf-510b-8327-c7a0ce3ede68'; -- callado
update public.forms set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c', position = 2 where id = '3ee0059f-2bb7-512b-a884-83ea03eaaa53'; -- callada
update public.forms set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c', position = 3 where id = 'd0d9e60d-42eb-5468-9ba3-5f3a8d6e9809'; -- tonto
update public.forms set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c', position = 4 where id = '111c5995-7211-5042-bca8-45dfb003c5fb'; -- tonta
update public.forms set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c', position = 5 where id = '60601bce-38fd-55fe-94f0-b749264a0602'; -- distraído
update public.forms set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c', position = 6 where id = '31f01d5b-4980-5c07-9057-bc29743c852d'; -- distraída
update public.forms set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c', position = 7 where id = '4a783254-250a-582a-89b5-aefd8578bc3c'; -- distraídos
update public.forms set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c', position = 8 where id = '8d271ca8-8087-5d44-9abf-f2995b9e51a9'; -- agrandado
update public.forms set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c', position = 9 where id = 'faab628d-cbe4-59dd-b7d3-5d2b8e89a505'; -- agrandada
update public.forms set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c', position = 10 where id = 'e5ff52d6-2452-592e-8d04-f92f0c64bb63'; -- macanudo
update public.forms set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c', position = 11 where id = 'ec35e6c8-680d-5beb-83fe-44c48d7336fd'; -- macanuda
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '35228880-ea1a-5265-a6bd-69f5b360fc15';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '31952487-8e19-538e-9226-6ebcf002e87c';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'bf9086e0-cecd-5aec-af7a-b215915f7e37';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'c7df1654-1381-5800-b657-5820efaa429c';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '4344507e-c3bf-54fd-b5e4-58b1ee1162a2';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '510e2571-1c31-5783-89c2-98fb82d7e02a';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'de407a3a-7deb-5f0c-9521-dbb331f40f48';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '80fff015-feb8-52e9-a06d-a7cf55adda85';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '0c238219-a0f4-5b5f-8d1d-aad40c2fa961';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '88170908-6b5e-5ce2-b6d2-268a7a36bf8d';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'd60fcc82-a182-54c5-9c44-9f617125c553';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'fde0215c-ca2c-5043-b434-da8ac29e8002';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'd2ff8f78-2390-5616-b2d4-72ab28395bb6';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '4126195c-9faf-5775-b647-d1c864909fbd';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '9eda1734-b467-59cd-bcf9-013c059a2497';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '6d107908-2ae4-563f-a57d-a1198b9c8a9f';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '4d892863-6db1-56a1-ade7-c31ea9a7f436';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '52b544b7-0a47-50f2-ac47-e1a9075c064d';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'b9d1ebd8-ac09-50e5-88a0-937faa0639db';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'c00d7137-fa94-59fa-bfeb-56804d3de772';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '2322348c-dd2b-500f-94df-3f33adfd9e7b';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '75b0b035-843c-51c5-813b-540570f1712c';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'e0c938cb-0a87-5ac3-a777-e17644e90722';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '9c86351b-46a3-5c58-8344-7e6e279eed82';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '8cd9152b-9068-51e6-8ddd-f4614b6ba375';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'c1088fcf-733a-5daa-b62c-8305b9894b8e';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '349672a1-e27d-5768-9199-f2c9ec329340';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'e323f009-fd87-5b43-bbf4-7d7bfc61007f';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '821a8a37-5cbc-51e3-b673-e53306cf380a';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '1f43c3fa-5bb1-5b61-b401-9100f2da54f6';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '25cd77c1-be5c-5738-bf51-c145fc82eb40';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '328458b9-639f-5f25-8b84-1cfbf73f909e';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'fc28f28b-0072-5574-be68-2ff12beca361';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '582295ba-5baf-5819-918d-46d32afe7e3a';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'a3da0eab-231b-536e-b0d3-90d232bfa0f6';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'f76d14d9-8496-546c-9486-5c6abc78cfd8';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '10196d53-0bf5-5f30-8045-0eee345119b5';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '63115c6c-3e96-5c18-bf00-382348e031d5';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '516b4084-8b87-56b7-ab49-7033936459c1';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'f76856c5-cd9b-568e-ab95-f2be0bdb6756';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'be944060-3517-59e3-8ae9-cb360bc68c26';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '9d78d8c7-df6f-56d7-95d6-5ff2f87600a3';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '1659ee83-aaa2-50bd-80f3-1d82d3686d46';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'c993a48a-3bef-5b40-bebd-dc5775564bda';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '34b84b38-538d-5b92-94a5-92e2384795fc';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '8d6f78c2-9e0b-5788-a297-0bd20199bb90';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'e24c3d2d-d308-5fd9-be11-0f435977aa93';
update public.sentences set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = 'e4d81158-e5f4-51c9-833f-5f34989525c5';
update public.tips set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '3cf567c2-f4d8-5988-b290-df55a3a1ea54'; -- The good and the bad
update public.tips set unit_id = '33439d32-5b7f-512a-a1b9-5a120bb5657c' where id = '501983de-04c6-5c67-bc94-ddd15cb1a88c'; -- Plural

-- te-convido-un-mate → te-convido-un-mate · convidame-uno
update public.units set title_en = 'Make mate the right way', summary_en = 'Calentá el agua, no la hiervas' where id = 'da7656d3-0e9b-597b-ac1d-493e481b96f5';
update public.forms set unit_id = 'da7656d3-0e9b-597b-ac1d-493e481b96f5', position = 2 where id = 'eefa33ec-1f1f-549a-bce8-7f676baca272'; -- pava
update public.forms set unit_id = 'da7656d3-0e9b-597b-ac1d-493e481b96f5', position = 3 where id = '5ec74a55-31ec-54c5-930b-d009413e1282'; -- calentar
update public.forms set unit_id = 'da7656d3-0e9b-597b-ac1d-493e481b96f5', position = 4 where id = '68376bcd-ce2e-55c1-b73c-fc5b8169c69d'; -- calentá
update public.forms set unit_id = 'da7656d3-0e9b-597b-ac1d-493e481b96f5', position = 5 where id = '96344ecd-8515-562d-8168-e84f64829243'; -- hervir
update public.forms set unit_id = 'da7656d3-0e9b-597b-ac1d-493e481b96f5', position = 6 where id = '603c24aa-ebd1-5027-9d69-8fe1b89e9eeb'; -- hierve
update public.forms set unit_id = 'da7656d3-0e9b-597b-ac1d-493e481b96f5', position = 7 where id = 'cd4b563c-f1fe-5da5-81cb-1f98c4b3710c'; -- hiervas
update public.forms set unit_id = 'da7656d3-0e9b-597b-ac1d-493e481b96f5', position = 8 where id = 'd3e084b8-5632-5b7f-9276-d5b18157d7aa'; -- lavado
update public.forms set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9', position = 1 where id = 'a9e23d79-7089-56b8-b6dd-735fb16139c6'; -- convido
update public.forms set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9', position = 2 where id = '09df2e1f-807b-538d-bfdc-3a5d069c6c56'; -- convidame
update public.forms set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9', position = 3 where id = 'ef5048ed-e573-5e80-b286-60c9134c5e35'; -- convidás
update public.forms set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9', position = 4 where id = '55b5b767-e495-5060-bb6b-f688bf6d9315'; -- matero
update public.forms set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9', position = 5 where id = '91d5c140-70b6-5a26-bd44-aad9a4242d83'; -- matera
update public.forms set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9', position = 6 where id = '756c18a7-4582-5a2f-9c9f-ff84c2ee2dbd'; -- mate cocido
update public.forms set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9', position = 7 where id = 'c1e89448-c6b9-57f8-a2a9-c48aca009fbc'; -- bizcochitos
update public.forms set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9', position = 8 where id = 'faccc0f3-38a1-5e82-93ef-81f2ac84360c'; -- tortas fritas
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = 'c74280e8-279f-52a2-b625-84aed5eb3915';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '5222be5e-0c74-50fb-b3a4-2e8faf0146e9';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '16fc15fc-8896-5ca2-9a70-3326868fad69';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '8a35662d-8371-50c6-afc2-03e0fdb664fd';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = 'fa0cd707-17e4-5b26-8114-e933a2661cc3';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = 'eb602a3c-6d7c-5a6a-9f79-1146b27855ef';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = 'c67fa151-da3b-547d-bb4b-762c9aa0dc7e';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '001255bc-f29d-5dcf-9f35-2724167f101c';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '10ab92bc-163c-5a0f-b9ac-b3055bde38fb';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = 'f73094eb-4faf-5542-9698-a35b3775ddff';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = 'bb0200e3-602c-5b49-bf39-613aaea1aba5';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '572c4549-b73a-5ff0-880e-f3320b353627';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = 'e520313b-4fdd-5dcb-a2c2-823493d9fbd1';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '9546115d-aecc-52bd-ae88-9ca5ac6aad06';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '40f42f20-c240-5ff6-a0f1-0975a33edb2f';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '82678990-6257-5e41-a416-bf600b701742';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = 'e1c0b9e8-ce37-56e6-b462-da7091a523be';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '2ea51189-5392-5b80-a66d-6d9f89355b10';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = 'cf90e537-4b7a-5016-8fbc-47c1423035c7';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '06f854e4-6768-5c57-8e4b-94cb7727c5a2';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = 'a15769d6-faeb-5904-a851-76b646bbfe9c';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '086638a7-0b6f-59cd-a7ef-cf91d17a8f22';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '98cd97a6-4c6e-55d4-85e1-1e58fe6bc9c9';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '5b166945-1cf8-5568-88de-953642a61e52';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '6ea0a929-088a-597a-aae6-336228be8234';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = 'a4ee6698-7467-5f62-b64e-bb061accaa56';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '11c17a40-590d-5bcf-9dee-124cca29d1d5';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '68775157-8c5e-5af6-b025-c1b383f3fab5';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = 'ead14e27-c505-5d4f-8a47-208f1b9d0e9d';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = 'f6e844bc-f6b1-5e89-bd82-2275f2379671';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '5265e57d-02e3-5d03-834b-20d711871e62';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '28ac9c20-c8ae-57df-bec9-f52cb2357874';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '5857411b-8a91-5c48-b393-0ed8a481710a';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '0de7cba2-85f0-560a-9b09-de67cafad707';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = 'f818aea4-3f15-5cf9-82a7-3f028a776b0e';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '67ffc9e9-57fa-5d8e-a4bc-967ebeaa3fd5';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = 'dcca1881-782e-56be-a878-190720057764';
update public.sentences set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = '2dce2a78-24eb-5bc3-b3be-1ba3cbcfabbf';
update public.tips set unit_id = '735dd55a-837f-5e16-b47f-e365c31146e9' where id = 'a27610da-e63d-5d19-9150-fec8001c9793'; -- ¿Te convido?

-- como-no-dona-rosa → como-no-dona-rosa · te-doy-una-mano
update public.units set title_en = 'Greet your older neighbors', summary_en = 'Cómo no, doña Rosa' where id = 'e46f81c7-cdca-5d51-8738-55a0efa5a020';
update public.forms set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2', position = 1 where id = '9da1a249-23b1-567a-a02f-b6025753cdb3'; -- te doy una mano
update public.forms set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2', position = 2 where id = '94d048db-ee6e-52d8-9f9d-436413017202'; -- dejá
update public.forms set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2', position = 3 where id = '1397e62a-eb61-5724-be04-a1aeaf41df1b'; -- faltaba más
update public.forms set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2', position = 4 where id = '52fdef03-4de8-52ce-a9f1-6712349615c3'; -- no es nada
update public.forms set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2', position = 5 where id = 'f5e0ffa3-f737-5e55-a7a3-fea60a8f830c'; -- querido
update public.forms set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2', position = 6 where id = '30174983-0acd-504f-96c8-3d89f000572e'; -- querida
update public.forms set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2', position = 7 where id = '7cc1d0bb-dd43-5d2a-a918-c4eb7389f4aa'; -- atiende
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '56549a7e-1d20-5b28-ac91-af39a2659626';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = 'b7558848-4c5d-5dfb-adbc-7acc2274cfd3';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = 'bba7156d-f839-5a55-a164-16591bb0070b';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '4fd37520-2ed4-5ba8-b342-a02b63c16ece';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '8ef2e416-8700-519c-8c39-11b3dfec10aa';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = 'c7c50220-f749-58e8-a6d8-bc363875da6a';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '4b96eab1-f5d3-5866-9905-07cf6d018d8b';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '00d7faff-2270-56ed-87b9-aab86cf8ebce';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '3536d5bb-e70e-5ee0-9721-ad2cc807bb1b';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '1a7cf50c-ee48-514a-a6f3-dc88cc450425';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '027f612a-c30b-5851-966b-93d74ed30785';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '0fd761a3-21b9-58ce-84df-9c2d2bc307a5';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '9532e835-4415-5151-8d40-2fc6ef3cc331';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '6670fbb8-a971-50fc-8dbb-11fa238d5328';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '5e5f3611-50f2-5384-b880-77a9b7424865';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '2270e309-4f77-5714-a75d-065443d147cc';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '2adbee0c-b6cb-5d36-bdfd-5dacc6af06b7';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '14261a5a-6f26-5bdb-9001-9f51cd5b097e';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '7e949522-d922-5c79-9619-a3ff89e64f2c';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '13e1a21a-d133-587c-9ee6-c7de6e7ddb01';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '9d7d3c8e-e621-500c-a125-0453e4499adc';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '6ea62cfd-a85b-500f-83b4-46026a765098';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = 'aafefae4-6a01-5baa-9c42-3d7a87ce24f7';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '2ec3a482-8be2-5063-ab9f-cd9e79e30f02';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = 'c29b4bca-e3e3-53a4-8941-af42473f6804';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '3c8f5847-5497-50d3-bb19-c34b8120c706';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '90d65db2-8320-5260-8fc8-982602429a87';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '63abdd3f-10bc-569e-86e5-9485f06c3764';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '5ea1bc4e-0b80-5436-9cf5-46731e121d43';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '586bb2d6-6451-57e4-9e78-a13a4bd66e61';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '4b5bf01a-a29e-589c-b62c-e7e87612bdc7';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '1c92f2d6-2088-5503-859d-ddbd069c7333';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '22d63a9e-1436-54b8-b15d-45a1bb4e8db3';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '6f182c8d-1158-574c-9c05-94a566f666ac';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '428f4c7f-f1be-52f3-a433-f82105fa945e';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '77112005-f008-57b9-9a72-dd0b6a9fef31';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '3c09364e-39ed-5e0b-99e9-54adc9db5f01';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '669f98a7-7fbd-5ed7-a7e3-6f7243dc2404';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = 'abdbd6c5-8118-549a-a7c2-24bcdcfe1b46';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = 'c4ea62fe-1cde-5f87-98a5-da998432b6c0';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '7311463d-fb58-53ad-9344-32317e61a588';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '18a4c67f-1cff-5221-89fa-377b59f6c714';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '2a74f9af-61e0-5e19-8f17-3854b40fc05f';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '675b89f3-8f50-557c-b5e1-bdf3c2f1cf0e';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = 'eea991fc-7636-5f4b-b43c-2bae78b75e14';
update public.sentences set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '70325226-52c9-5f31-86ac-1fb11c7d0f8d';
update public.tips set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '787e171d-c6b2-56b6-bfd5-86c95f58c4b7'; -- Dejá, faltaba más
update public.tips set unit_id = '718a023f-b694-530f-bc51-7f9655440ea2' where id = '21829487-95ad-5825-803c-427aa8104d42'; -- Warm, not formal

-- estas-cambiado → estas-cambiado · ya-no-es-lo-mismo
update public.units set title_en = 'Say how someone has changed', summary_en = '¡Estás cambiado! No te reconocí' where id = '6aa47fcd-c4fb-5d93-9c82-3c5580df654a';
update public.forms set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6', position = 1 where id = '837ffb0e-6fef-5f51-9ab1-d9eee581202e'; -- desapareció
update public.forms set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6', position = 2 where id = 'd16236b8-a3a7-5496-85cc-d665200ab376'; -- desaparecieron
update public.forms set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6', position = 3 where id = 'b3263da8-5878-5d0a-8bb4-9e03477ec6db'; -- torre
update public.forms set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6', position = 4 where id = '1bbe659a-2a8a-5713-932b-66e3811f28e1'; -- torres
update public.forms set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6', position = 5 where id = 'b840b0b7-9062-5342-b634-0b3aeff3ee0f'; -- moderno
update public.forms set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6', position = 6 where id = '16389662-871c-5e2a-b6d1-be7501462789'; -- moderna
update public.forms set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6', position = 7 where id = '586b81fa-2422-5640-a7ef-29b762d23af3'; -- de moda
update public.forms set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6', position = 8 where id = '0b150199-788d-57d1-a466-a112a9cb332d'; -- lo mismo
update public.forms set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6', position = 9 where id = '68bd5f6b-6dda-5979-8829-4386ad96366a'; -- cada vez peor
update public.forms set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6', position = 10 where id = '21ddbf21-e514-54ce-b3ce-2efe39218323'; -- cada vez mejor
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '381bea25-7039-5868-abb0-d545efc47bf4';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'd55ccb70-b10c-56ca-8783-986d822fb9ec';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '62f9072c-5be9-5261-b14e-8d4640ff3934';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '84dd57c6-e745-5371-94fb-fc6ef932a3cd';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '0729941f-4ae8-5f94-a5b6-b8c0e2dde87b';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '908aec65-5e56-51fc-9912-243c156d9c6d';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '8855bc26-9695-5479-a356-664a2853036a';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'ffa15119-b83d-5508-98cd-dc0f34655551';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'f2600c6d-a2b1-5682-8f12-8c37dc3e1d92';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'f750486c-8078-5305-afa6-4d147f34e542';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'fb9eae25-4e29-581b-a44d-784253548d48';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '480ff572-7a8c-5588-90cf-c1099480bf29';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '2e47537d-af68-5e87-ae51-5d2ef015bce6';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '482d63bb-5fd4-597f-a874-676d90a8b966';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '8b0761eb-e9ef-5205-9758-8b3ce9efadf1';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '35420371-3bd8-5a74-9841-debb6a4d156c';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'af229673-dc7f-55d4-acb1-e2e6c08bf1f8';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '245d77c2-0a0c-59fa-868f-021e809e104a';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'e61be273-2777-58dc-910e-5b512f189478';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '5105a08b-efe0-56da-b8a5-cc7825d46c7e';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '1710ced1-e77a-51cc-b4e0-5e1f08ea7af0';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '80c58bd2-af7f-5a49-82d7-f0aecbbbb74a';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'c05b531e-4e7b-5002-89af-383e54c070f8';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '7d882547-3b57-5148-acc2-221ce419729f';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '40170e46-8ec8-59aa-a6c3-352dbcf29f02';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'a8b8bb20-cc6f-50e3-8524-7d37fff125bc';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '875d8f56-ea4b-5789-b1b5-7db8a0e23c87';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'a3a7cf86-4b6f-53ec-8be5-ce78f57ee61d';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '66d56512-4cb4-5f29-9201-72ffdecf9833';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'da627621-498e-59f2-a2e7-c01739e36b37';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '14e089a8-ff05-56c4-b7ba-77eb4a43a765';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '7adade19-d6d6-5e3d-b119-a28f3f877d25';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'ec690a6b-6a5f-5d3b-8a02-56e672ea3bf5';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'd5582cbc-901e-5006-8b87-24bfd58310b4';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '2e04ea39-656d-533a-a4bc-0d41500cc5ec';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '10a8aec5-703f-56a6-8f95-88a79f8b156b';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '7b4ded02-e300-5142-af41-b9e2746cbbec';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '3dcecd2f-2890-52a0-8e29-97a6899e5aef';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '156241df-d2b7-5879-a56e-11341f28690d';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'a0cafa0b-9090-5d7a-886c-c71538304286';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '9247a3a3-477f-5f3e-8388-5616f293b687';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'ccd7af25-9c5b-505b-9213-bfde72b57c3a';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '24b264a5-c339-5f29-bd8a-ad90f388d11c';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'e8f5411f-d89f-5495-a94b-c0b93aa8d4cc';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '0e721693-64cd-5dc1-a358-bd0ae67e0bba';
update public.sentences set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = 'b7385cdd-2895-5881-b952-2c42acfacd23';
update public.tips set unit_id = '4535637a-5874-5100-96b3-53834cfc40c6' where id = '540d8ca7-657a-5701-bb91-0246d4d77115'; -- Cada vez peor, de moda

-- no-me-alcanza → no-me-alcanza · no-llego-a-fin-de-mes
update public.units set title_en = 'Complain about rising bills', summary_en = 'Aumentaron la luz y el gas' where id = '654d7d9b-03de-5cfe-a0f2-0124a144bfcf';
update public.forms set unit_id = '654d7d9b-03de-5cfe-a0f2-0124a144bfcf', position = 4 where id = '27950ac4-f068-50e5-8e69-f66dec99ef9e'; -- gas
update public.forms set unit_id = '654d7d9b-03de-5cfe-a0f2-0124a144bfcf', position = 5 where id = '7ca1ab68-d4eb-5a8f-8c7c-3cb36eb16506'; -- tarifa
update public.forms set unit_id = '654d7d9b-03de-5cfe-a0f2-0124a144bfcf', position = 6 where id = '9eab304a-1944-5ecf-84d1-868e85ae7435'; -- tarifas
update public.forms set unit_id = '654d7d9b-03de-5cfe-a0f2-0124a144bfcf', position = 7 where id = '381c7119-bbb3-56c7-9e90-24fdae10dc3c'; -- servicio
update public.forms set unit_id = '654d7d9b-03de-5cfe-a0f2-0124a144bfcf', position = 8 where id = '8d9b81da-3ed1-5c74-823d-ee9b4e8c1c90'; -- servicios
update public.forms set unit_id = '654d7d9b-03de-5cfe-a0f2-0124a144bfcf', position = 9 where id = 'f0c2ce42-4fd3-5321-b061-57c48e4057a8'; -- remarcaron
update public.forms set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7', position = 1 where id = '06be5240-4b36-5ee9-b0fb-5abe9a5593cf'; -- alcanzó
update public.forms set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7', position = 2 where id = '8786ed19-eb2f-53fd-bb56-44558a7461ae'; -- gasto
update public.forms set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7', position = 3 where id = 'c0db2f12-e695-5abf-9c25-10c045f1b436'; -- gastos
update public.forms set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7', position = 4 where id = 'ec816536-55f0-51a2-b684-86ef8ebad138'; -- llegar a fin de mes
update public.forms set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7', position = 5 where id = 'd85293e4-98fc-5144-8539-0d329050e3c8'; -- llego a fin de mes
update public.forms set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7', position = 6 where id = '4888251b-a059-5478-b35f-68707fddbb43'; -- llegamos a fin de mes
update public.forms set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7', position = 7 where id = '82c8216c-44c2-5727-b147-faecfe4386db'; -- chino
update public.forms set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7', position = 8 where id = '73b98002-41d4-52a0-b9f0-a689b8ecb50b'; -- marca
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '90871e91-dad1-5ab0-9071-1800f7030b88';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '8db3d122-17c7-557f-9429-c61dbf8285ad';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'ad444402-b4d1-5f32-baac-3259a39da77b';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '57efa5fd-ea37-5812-92ff-8f4312bf854a';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '56bcafec-230c-5d7e-806c-01cf3bcf6565';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'e4e1639d-068f-59bc-83ba-51c3bc275ef9';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'f3f6fc65-0b4f-5225-b5d0-025d1ae5de89';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'ac2db954-f36b-58c9-aa4a-46a703eb7b57';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '0c54c87c-f561-5f3c-a50c-b99212c43d1a';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '4a958196-667a-502a-8003-ef93f20e93dc';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '4aae7dcd-27ea-5cc0-9a40-7bf9788dbd8e';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '3e0ac84e-9fc4-5b57-b49a-3c41cb7a02b6';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'a60e7443-5c2a-5e54-97ca-d5b2604ac7fd';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '12499437-f22b-5214-813a-4ffd0071b3bd';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '9809a059-b55c-53f2-874c-5bb7ffb8f6bf';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '5d3b3388-ef35-5fe8-9209-d6a60feccc6a';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '16eb8f33-9200-5d7d-b016-bdef842694ad';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '9b64396d-bef6-5585-b8c4-1e1df79fcdb4';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'a691fba1-03aa-5a87-ad75-da21f04843cb';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'a4330e2e-fb25-5b25-9d85-311425cdf6ae';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '9a73d2d9-c487-56c4-be91-0f6008d4f950';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'a1489086-b844-5d7b-9afa-a37beb5f8859';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'f1063718-395b-501a-b73e-0f456a391a62';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'd5bdf570-d08c-5c5e-b071-2cdc2db50e19';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '2645883b-83ad-5a62-a42e-75877444cc8c';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'b5d4d590-f25d-568c-ac8e-7927efc6cda0';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '687ca153-c747-59fb-b2a6-236298180e0e';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '31294b9b-403d-5c79-929a-86e238fc9a7b';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '3f30eba9-f063-59f3-b5f7-ec8a91a2d82c';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '8828652d-44b5-576f-87c3-42105090c47a';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'aed9b684-85b1-5e3b-8292-eafb34e47360';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '5bd4e116-cbdc-54c3-a05f-3dc3e70c33a7';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'f1e677c5-6496-5ab8-a84b-0a80ba17bca1';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '60edc618-994e-58db-a2e5-dd0f5f6a9440';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'a3e7ea74-8264-5b34-9843-21125ce639ae';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'dff635b3-e49a-5eb4-8a5c-eeeaf426f185';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'dca5c63b-ace4-58de-b911-c7516fc42f0b';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'fd61bfc9-aafd-5ce7-928a-8ddc59e0baa9';
update public.sentences set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = '7409e3f2-4753-5da6-afd5-8f691aac1f97';
update public.tips set unit_id = 'a087036f-18a5-5494-ab25-471c5a6dbdb7' where id = 'b1cb665e-4cc4-5bbe-8c24-c91aed8f3fbd'; -- Llegar a fin de mes

-- para-que-entres → para-que-entres · sin-que-se-escape
update public.forms set unit_id = 'e27cb9dd-52ff-5eed-8b6b-7f5680e6ae7f', position = 1 where id = '3ceed824-49b6-5254-95e9-a8a01a75df52'; -- entres
update public.forms set unit_id = 'e27cb9dd-52ff-5eed-8b6b-7f5680e6ae7f', position = 2 where id = '0a9f7abe-84b6-5da6-919c-5edb8019e721'; -- abras
update public.forms set unit_id = 'e27cb9dd-52ff-5eed-8b6b-7f5680e6ae7f', position = 3 where id = 'ce6e9002-14a7-538c-ad46-7443dac457ba'; -- cierres
update public.forms set unit_id = 'e27cb9dd-52ff-5eed-8b6b-7f5680e6ae7f', position = 4 where id = 'a12efba6-747d-53b9-99af-928e8192cc49'; -- encuentres
update public.forms set unit_id = 'e27cb9dd-52ff-5eed-8b6b-7f5680e6ae7f', position = 5 where id = '709970b2-7e4f-55cc-b17b-e85c9fd22be4'; -- riegues
update public.forms set unit_id = 'e27cb9dd-52ff-5eed-8b6b-7f5680e6ae7f', position = 6 where id = 'c1ce7c76-3a81-5988-a385-0d5d0f5d5878'; -- coma
update public.forms set unit_id = 'e27cb9dd-52ff-5eed-8b6b-7f5680e6ae7f', position = 7 where id = 'e5a3fa33-58ab-5e52-833d-0f28e716e015'; -- escape
update public.forms set unit_id = 'e27cb9dd-52ff-5eed-8b6b-7f5680e6ae7f', position = 8 where id = '565ed3e5-75ac-5934-8d98-cb4a7e8eec5d'; -- escapó
update public.forms set unit_id = 'e27cb9dd-52ff-5eed-8b6b-7f5680e6ae7f', position = 9 where id = '94fce722-5287-5055-9df4-3b661637dfaa'; -- lista
update public.forms set unit_id = 'e27cb9dd-52ff-5eed-8b6b-7f5680e6ae7f', position = 10 where id = 'ab513cae-5cc1-57ee-a41c-7b6b0eab4924'; -- entre
update public.forms set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1', position = 1 where id = '58e4b868-4f13-5f85-86ec-2b420b12b4f0'; -- sin que
update public.forms set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1', position = 2 where id = '05a82355-4fe4-55c9-b9e2-7bc3ee2a754b'; -- se escape
update public.forms set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1', position = 3 where id = '2e053d26-0035-590c-9636-0c0b9dec7f54'; -- se escapó
update public.forms set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1', position = 4 where id = 'b8651e59-cac5-5904-b284-3e85e02877bb'; -- pasa
update public.forms set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1', position = 5 where id = '2cf0513b-1596-5fca-b66e-5252cbeadc20'; -- vea
update public.forms set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1', position = 6 where id = 'fee32431-8685-5ebd-8756-3b14ff16d39e'; -- persiana
update public.forms set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1', position = 7 where id = '15352c5e-bffd-527c-ba66-fd09d0a23547'; -- persianas
update public.forms set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1', position = 8 where id = '92b79727-42e4-5695-bfff-efb17188c3f7'; -- levantá
update public.forms set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1', position = 9 where id = 'f1d8fc3c-6dc1-5a0f-8daf-14e266820f8b'; -- alarma
update public.forms set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1', position = 10 where id = 'e6893f63-3a11-5379-a27e-471872a037f0'; -- clave
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'dbe20e2d-6ed1-593b-b7dd-eecaa34703c7';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '8c652963-6994-537d-9964-303fc63fa4a2';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '58e727a5-4ccf-5a1f-acb5-f4fa78f2c84c';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'e60083e0-7d0b-550f-ba99-4bad6aa8c77f';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'abf28d81-88b9-5699-8d18-55b61fdf4cbe';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '1bb62bf0-d793-5a49-802d-9a10ae892313';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '66dd0a96-8d4e-521e-9bc9-7166fdac7192';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'dc932b84-c7c6-57b8-b711-611358fa5056';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '1a01359b-0190-5308-b2d9-40eb288e003a';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '388f5621-0378-54ef-b897-2ddbe5a0013a';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '559f90e1-5a78-565e-80d3-e294fbd1b8c7';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '9823cc02-6260-56fd-ab02-17363ad8f951';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'c1523789-843b-54eb-8fa9-46c348e611ce';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '735d2f34-7fbc-5637-bb80-e8541a4f9529';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '3c8fb256-1d00-553e-91c7-301abdd58ba9';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'a900f423-43d0-5bcb-b011-ee2bec83b037';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '49ba5b83-b2d7-5416-ac79-1cbe30359d21';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'f92b4cd8-eec2-529f-abc5-c2a6f89227f7';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '7fed5f31-180a-5f25-852c-4ff838123e70';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'd9400963-2d71-5e08-a645-a6992172762d';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'b4c0891a-293a-520f-a86b-0503873d8054';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'c9c03c32-ccee-5bf3-a2cf-58bd5320d7af';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'af66dd83-c04d-5bb4-b2cd-6eb42f4f805f';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'be6f8c57-55e5-583e-9f60-0d3a408d2757';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '12964022-af81-536d-a02f-c26cc3531471';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '60ab4c26-decf-543b-8551-95ac4ab27ff0';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '723f6111-ed5d-59c9-8d05-b3dbec0b2134';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '0a252a15-0414-58e0-86e3-41932b3d6a18';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '65c0eeab-5056-55f8-9ffc-6e6cd3ff8592';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '8a9a6569-d7f9-534e-8129-ea47e5acac81';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'f3b58417-d835-5e54-b651-c0f11597cd4f';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '03cb69de-7b5f-5707-98ae-a7a9ed8dd0ed';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'c17ac37a-2d14-502a-8aea-7797cca67dba';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '6214042d-ec7b-5f0f-8f15-88e34ec8c3d1';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'dd3ab7d7-db1d-50e9-99ce-694fcdce3dbf';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '362b2e4a-c9be-5913-808f-6ce1de14efed';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'b4028add-ab70-5613-ab25-e3613893feb1';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'a5e6bb01-3135-585e-9e97-4a932b438c42';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '9f4c6b50-f68d-547b-96d6-56d7d1e81589';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '908dda41-423f-5335-b9e0-714387dc5dbf';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'e46c41c2-ce0b-5d55-8679-067f84fbf6ed';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'bb15d824-24e4-5617-a135-ba592121b69f';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'db2a758a-e5d4-5bee-85d5-cef254d377e7';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '6af7e7f6-5147-5423-b91b-9bb7a81ecf7a';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '22fefa8a-81f6-5596-b9e4-13786d2f0f2d';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'a05c9fae-3a31-5c3c-adc4-8b0a5a5ea24c';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'c883722b-d3f3-5ff3-9684-e9558c1a7033';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '0119783d-9c03-597f-8dc6-820ba73cdd06';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '9ee3d736-933c-5ed6-827a-d588139c6ed9';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '21da610e-4791-590e-87b4-69cc80df9931';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '2d68a362-785a-5655-893e-6bc96a4b59cb';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '5277cbf5-b181-5002-8c64-ae55b2ff900d';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '9327b16d-33b1-552d-9ee1-554c812c09c2';
update public.sentences set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = 'd4610b00-2956-5cf7-8aca-0ed5e7f278d7';
update public.tips set unit_id = '3bacc45b-3c97-5202-9e1f-0ce034b2f3f1' where id = '4bffbc84-058c-5a8b-8c43-0f0895af71b3'; -- Para que, sin que

-- el-tecnico → el-tecnico · me-lo-podes-arreglar
update public.units set title_en = 'Say what isn''t working', summary_en = 'El aire no anda y hace un calor…' where id = 'd7488f2f-ab30-530b-a0f2-9b26a8cb04ad';
update public.forms set unit_id = 'd7488f2f-ab30-530b-a0f2-9b26a8cb04ad', position = 5 where id = '8021cce1-f5db-5b60-b733-b11233f4d6b7'; -- aire
update public.forms set unit_id = 'd7488f2f-ab30-530b-a0f2-9b26a8cb04ad', position = 6 where id = '4d29f79e-81a4-54a7-b5e7-d952de49baab'; -- ventilador
update public.forms set unit_id = 'd7488f2f-ab30-530b-a0f2-9b26a8cb04ad', position = 7 where id = 'd3843d36-c5ab-5f13-9e5d-fb4920f99dfb'; -- control
update public.forms set unit_id = 'd7488f2f-ab30-530b-a0f2-9b26a8cb04ad', position = 8 where id = '453110d8-c204-5765-8164-845485fbab13'; -- pila
update public.forms set unit_id = 'd7488f2f-ab30-530b-a0f2-9b26a8cb04ad', position = 9 where id = '116834da-5e7a-5deb-8754-e5d7ba1823e7'; -- pilas
update public.forms set unit_id = 'd7488f2f-ab30-530b-a0f2-9b26a8cb04ad', position = 10 where id = '208947fd-be39-58df-875c-27256ff8c1c2'; -- enchufe
update public.forms set unit_id = 'd7488f2f-ab30-530b-a0f2-9b26a8cb04ad', position = 11 where id = '3cd47fbc-ec63-5b35-a9a5-044b27ff04e2'; -- quejamos
update public.forms set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085', position = 1 where id = '2d77ae2f-9393-5e07-8f16-506dd3edbf9c'; -- arreglar
update public.forms set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085', position = 2 where id = '78c639ba-5504-51dc-b59a-f8f9d41b8119'; -- arregló
update public.forms set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085', position = 3 where id = '3adbe2a9-a0f9-5b89-a2bf-69a1a306e2ff'; -- técnico
update public.forms set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085', position = 4 where id = '06adf4bb-5b6d-51cc-a8b3-0ddf8adb4541'; -- electricista
update public.forms set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085', position = 5 where id = '77183661-b9c0-5ceb-b1e3-aaa4737b78ee'; -- arreglo
update public.forms set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085', position = 6 where id = '66e3f89a-ad2a-5dd6-9a15-5a05108b60b8'; -- nos quejamos
update public.forms set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085', position = 7 where id = '6148b3b7-1570-548d-ad83-73e4b85001d9'; -- reclamo
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '7b74ea81-87fe-500a-b618-a948e7e0f0d2';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = 'aede4cd0-6fbc-5d0b-a229-6b099760784e';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '1e3065b7-00e1-5a49-8e62-a1ec8b5f6c82';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '1e55f2e0-7ff1-5a6e-9588-e234c97820e8';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = 'eef0b302-a7f6-5c41-9988-066070e1b83e';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '4f85603e-4405-58bf-9ff6-1b9b4681f27c';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '5b77edea-bf42-573d-a5dc-5bd579faa3fd';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '41b1d1f6-d458-56a4-8dce-5d8bb2aac09c';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '6d4f1720-5f30-568a-99e1-02a76d7c7245';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = 'e899ff78-fd3e-521f-84d0-4ec2d0b982d6';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = 'abf3c3c5-7c07-5537-a21c-c399670557eb';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = 'b9483866-512e-5fe2-80b5-3141d8726f5f';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '91640568-9276-5d9b-af93-70b73b6f06fc';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = 'e0d02c4e-8502-5133-b934-b7f58d931e4e';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '01fdf407-edca-5b7c-8318-b60883ff7c22';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '31189565-5acb-5467-abb6-d753cf57d48a';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '245e8dcd-2a9d-5fd3-95de-f8d7fb9b1d42';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '62f4025d-230b-5eb0-af69-46ccde239937';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = 'd067cec9-f692-50b0-bf24-d2f9743dad8b';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '1e834e42-a0af-5c7a-bad4-720cf70daf61';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = 'd3ad64ad-0f87-53b7-a60d-e511c5a62bc9';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '57942e56-25ae-5a3c-b443-68157d37e6c2';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '143363ab-9881-5b3f-afbd-fb583e049602';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = 'eb2e5d31-3546-5427-ac5f-9c07c03a7af1';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '2fb4b267-6ab1-5706-9233-01e96127c2f1';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '95c58b80-a590-57c7-9128-82cd4fc8e0d1';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '06347b93-bda6-591c-b21e-2b9d09bc40d8';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = 'e9453088-47f0-52cd-98c5-de8a2351cbf2';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '40024258-fa3a-51b0-9504-4ff1b6a59c1d';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '6cd29748-523c-5890-9c2f-d1e26cd3d8a2';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = 'd5626f77-fd28-51d1-904a-dae6e1715ee1';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = 'bd842c4a-8842-58d8-9f0a-393e1228b431';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = '6947943e-1f13-5cd0-a0e3-3c766d53bb57';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = 'c8479cd6-03c9-5fec-9fa3-3a7c991ff1a9';
update public.sentences set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = 'ad71181e-c0e0-55c2-aed2-3b480dfb00de';
update public.tips set unit_id = '98d84c1e-a66b-5142-a19f-c466e738f085' where id = 'c3650361-726d-523a-93eb-fc3114f524cd'; -- Arreglar

-- tenes-razon → tenes-razon · nada-que-ver
update public.units set title_en = 'Ask for an opinion and agree', summary_en = 'Para mí, tenés razón' where id = '35957a48-3965-592b-a5e7-2adfd23edfc0';
update public.forms set unit_id = '35957a48-3965-592b-a5e7-2adfd23edfc0', position = 3 where id = 'ac1b263c-eb8b-5c24-b1a0-8bc62bed3ad0'; -- tema
update public.forms set unit_id = '35957a48-3965-592b-a5e7-2adfd23edfc0', position = 5 where id = '7bcd48ee-d4ef-540f-9fc8-60a9907df07f'; -- totalmente
update public.forms set unit_id = '35957a48-3965-592b-a5e7-2adfd23edfc0', position = 6 where id = 'beac5847-5e48-56ac-8939-d27369f03a7a'; -- sin duda
update public.forms set unit_id = '35957a48-3965-592b-a5e7-2adfd23edfc0', position = 7 where id = '45a9a830-af06-5812-8757-524a4de74bfd'; -- tal cual
update public.forms set unit_id = '35957a48-3965-592b-a5e7-2adfd23edfc0', position = 8 where id = 'f5d1a247-a30b-5f37-a5df-b82312fb1858'; -- coincido
update public.forms set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3', position = 1 where id = 'f5428b92-4491-5868-abe5-9f2f72206d96'; -- al contrario
update public.forms set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3', position = 2 where id = '9c2f280d-0ec2-55b6-b47e-758615428636'; -- nada que ver
update public.forms set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3', position = 3 where id = '1b27266b-4758-5884-8e4f-377acf888dc5'; -- equivocado
update public.forms set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3', position = 4 where id = '1b6e7e8e-af48-5a11-856e-4ed192ad913d'; -- equivocada
update public.forms set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3', position = 5 where id = '059ce8db-bde4-5b14-b012-a8ede4576bab'; -- exagerás
update public.forms set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3', position = 6 where id = '1cb16871-882d-5765-9257-f6b540809bbc'; -- exageres
update public.forms set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3', position = 7 where id = '121944df-7e35-5f68-88d8-c7430a4cda5e'; -- discusión
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '46ed15b9-192d-5b12-a1b9-9cf635d3ab71';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '984c602d-b11b-502f-81b9-2fdfbe47bc1f';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '9dafef53-b26e-5be5-8f57-9eaa9d7cef25';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '6fcbec70-0d99-5f61-8133-4b52a61231f4';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '5f704258-1bf1-56cf-9b51-93f25720b6de';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '87e3aa5c-5a30-5c41-90c7-65310da615e9';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = 'd13d1224-2752-5bf1-848d-7010fc8df567';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = 'd7e22d61-2455-53b8-a039-648c1aa6217c';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '8dc3c00b-14cb-53fc-b0aa-24a8dae683ab';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = 'cf5aad05-ac38-5a06-be5e-d09f21c67ba5';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '48ba387f-b9b4-51fd-838a-d4863ca3b0ed';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '1b3fc670-2a5e-512b-bd07-27f69156da56';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = 'a9cea8fa-f323-55d2-badc-d71ae43b88c4';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '96e39803-12a4-518f-9c81-c175fba94aa6';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '95744137-1a38-5b28-9f3e-e4c99294a7ab';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = 'c9a5019c-b017-5965-a494-8ba4192187dc';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = 'c3747f54-d5d6-550f-a5a5-5835b3b28ba6';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = 'db0ad44f-7541-58a3-80bb-ea737d28395b';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '2a0fad32-0da9-5ca9-ab43-7eb60a92f70b';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '206b7ac0-6f72-52bd-8d0f-8d789e7a26de';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '114e024c-b582-50b3-a043-a7b35644bfc6';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '02da170a-3ac6-5b08-a56a-e6b8fb51206c';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = 'fbab23b6-b5f0-5637-8e37-944ea16fa17a';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = 'c96541e6-4aef-501f-942b-ea5712d3d12c';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '21fddf9f-e9e1-50ce-b0c3-d181a5bcb97e';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '2bb8d235-02e8-5b34-a1ac-b0a204eb38b5';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '3d2a4a1f-3d4d-50c2-8487-3b20df8ea239';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '8b3f119a-2f9b-5491-aec5-20a1bd23c2fb';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = 'c1055bb1-c3bf-5a06-84c0-f52a3b0869a5';
update public.sentences set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = '81685188-61a9-5c48-a3e6-efa0f0adc40c';
update public.tips set unit_id = '3a3f05d1-dc1a-5eae-a5b3-d5ce9ffb2ff3' where id = 'abc22894-4d33-582c-ba69-497c6215889e'; -- Picking a side

-- me-dan-asco → me-dan-asco · me-pico-un-mosquito
update public.forms set unit_id = '36036d7c-a216-5b60-a76c-a59bf988487b', position = 5 where id = '44fab7af-baba-51d0-8fcf-3c724f25f389'; -- risa
update public.forms set unit_id = '36036d7c-a216-5b60-a76c-a59bf988487b', position = 6 where id = '8644e58a-7518-5410-8d63-f96800eb226d'; -- cucaracha
update public.forms set unit_id = '36036d7c-a216-5b60-a76c-a59bf988487b', position = 7 where id = '91f4a1a9-8e64-5ccc-a14b-487fdfd77dc2'; -- cucarachas
update public.forms set unit_id = '36036d7c-a216-5b60-a76c-a59bf988487b', position = 8 where id = '9b2e7175-e734-50cf-b949-1eddfa27dd12'; -- araña
update public.forms set unit_id = '36036d7c-a216-5b60-a76c-a59bf988487b', position = 9 where id = '0bf8ec64-75dd-53c4-a9c8-bfc2d4d08cae'; -- arañas
update public.forms set unit_id = '36036d7c-a216-5b60-a76c-a59bf988487b', position = 10 where id = '0258ce39-9d70-5957-bdb9-a1fae2236700'; -- bicho
update public.forms set unit_id = '36036d7c-a216-5b60-a76c-a59bf988487b', position = 11 where id = '4dc356ea-32fa-5575-9f6e-3e68e1012453'; -- bichos
update public.forms set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8', position = 1 where id = '3b307a2d-3319-5982-88de-30364c63db6a'; -- grité
update public.forms set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8', position = 2 where id = '5ce38b02-9c50-5144-b462-35d0753cffa6'; -- salté
update public.forms set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8', position = 3 where id = 'ddad590b-5240-5ffa-925f-c6423ded08d8'; -- pegué un salto
update public.forms set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8', position = 4 where id = 'dfd3f299-fb5d-5556-bba3-18c0df163687'; -- maté
update public.forms set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8', position = 5 where id = '9effe316-7dca-58de-94aa-510318976abd'; -- vuela
update public.forms set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8', position = 6 where id = 'b764d828-170c-590f-b869-ef2d0220e514'; -- ojota
update public.forms set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8', position = 7 where id = '23b149f3-c746-5aaa-8e30-cb438661663a'; -- ojotas
update public.forms set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8', position = 8 where id = '14028ff6-fc70-5878-b89a-1fb8b1508acc'; -- mosquito
update public.forms set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8', position = 9 where id = 'b0fde69c-8cf1-5088-bc4b-dadb7319111d'; -- mosquitos
update public.forms set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8', position = 10 where id = '928a4d16-f46d-5eda-8747-7187fa2bfe61'; -- picó
update public.forms set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8', position = 11 where id = 'a14d09e8-50fe-5271-ac6e-be5dc4b81598'; -- repelente
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = 'aa6dc119-3c0c-57d6-b1d0-c27d9242275b';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '0011c8c5-aad7-51f9-b662-7ca6e8d3ec12';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '4e1f0326-d70d-59ad-9c8f-922400401275';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '74e63faf-524d-5be3-ad4b-ff4afe8703c3';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '78c2751a-2440-59fe-b6cd-8af941a625a2';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '2d684b82-1bc0-534c-97c1-4a30e6217df7';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '27aafd13-a056-5f6a-a65a-47138fe08a43';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '2716b210-1915-54d9-8ab5-7f026197dbe1';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = 'b83072c9-ca9d-5e72-9a49-c4313ef56e49';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '226701ee-93b5-57a9-8066-868940b1892a';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '812a435a-5eff-5a17-8424-c7e133ca5a8d';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '30b1fcd6-0b39-537f-a8f9-7e070b02d8a0';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '3d6e383f-14f7-56f7-a3b1-034c41780b13';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '69b4ba50-ff6c-5acc-997e-522c63286bf4';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '6681d9b0-6052-527a-b58b-a4c7c7a8c349';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '3ea0dddb-b05b-56ef-8980-d72aede41dfd';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '1c45ee2f-0d7e-544a-ab30-8fd41cd679b9';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '04ecd964-ffd9-59ee-817d-878775fc414b';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = 'ddde5205-441c-5965-b3bc-d51a56009009';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = 'bf135b66-f074-5f9e-a89e-681e19fe5f09';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = 'f3b83ca6-6b7c-552f-afb4-fc6e148d9a99';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = 'b036a208-99ac-518c-a55b-be473d2ca62a';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '098609a4-8c0a-55f4-99cc-acdd3fbc801b';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '44b92652-aaeb-5ecc-be96-58e4160ddfb5';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = 'e177d676-570d-5b4d-85a8-08cab7479ee8';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = 'c9f48d60-36a6-540c-b31a-a13c269513ef';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '74f7e809-f0b1-5fbc-960c-34e5630c1a6a';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '4de35ece-963e-5a73-b505-c789bda8f89b';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '57640fc4-d4eb-5707-bf9c-870c1aed161a';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '4e07eb51-5219-5910-8464-2e940e522dde';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '561e0504-369b-5909-ba84-fe2f6e374a74';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '6551b8ff-2e01-5898-adf4-5def7eb76cc2';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '90a815d9-7339-5e3b-810e-3c0e68cac22d';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '55ca6183-7499-5605-be33-b5a89a08eb92';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '32437b34-3722-5f5f-aa7e-789d3cce3b9c';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '6d9170ec-587c-56cd-8a4e-7ab8a799f8fb';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = 'dc341e19-9c1b-57a0-836c-446c79b34517';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '703d5360-e56b-5339-8815-4e70265d4591';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = 'af0356d2-3ed1-59cb-bc36-cc85459b42c3';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '2e37f4e2-8ee8-5019-ae80-e4c823f7b4e4';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = 'df14fd4b-60ee-5bfa-8fa7-2e3e59abfab5';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '42492464-a2f8-524b-aad4-19fb91815ed9';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '13a76536-f788-5cb6-b111-28296b2eac8e';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '94b3e084-f0f5-5176-bd67-1a93ac34c9e8';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = 'cecee8e6-6944-51f4-9740-e22b7089ad79';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '2942c0e5-57d6-59a7-add6-071883ceb314';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '947887a3-9033-565c-bc9f-7181fcc8dd10';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '0ffc9327-8926-5bfa-85b8-358410287c5b';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '68eff3bd-4a57-5904-9db8-b8fe82256350';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '75ecaa1b-ee26-5f5f-acda-29f60d1f2749';
update public.sentences set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = '0540eeba-8749-5c6b-93c2-4714a8a06a92';
update public.tips set unit_id = 'e372208c-dd62-5207-9c0b-afb1d03958c8' where id = 'f4296b31-e5fc-50a1-a8e5-b7b5d36a9830'; -- The summer visitor

-- no-sabes-lo-que-me-contaron → no-sabes-lo-que-me-contaron · le-metio-los-cuernos
update public.forms set unit_id = '7da0178d-42ee-5e98-aece-77ffbb45dd2d', position = 1 where id = 'b6546bc4-5b01-500f-b65e-7c618bcef308'; -- lo que
update public.forms set unit_id = '7da0178d-42ee-5e98-aece-77ffbb45dd2d', position = 2 where id = '4642091e-bfb3-5511-9ffa-0b1984c03789'; -- chisme
update public.forms set unit_id = '7da0178d-42ee-5e98-aece-77ffbb45dd2d', position = 3 where id = 'e4148294-91a9-5b08-b0e4-97f767466561'; -- chismes
update public.forms set unit_id = '7da0178d-42ee-5e98-aece-77ffbb45dd2d', position = 4 where id = '6eea2320-53ef-5125-8f0c-64c61edf4286'; -- chusmear
update public.forms set unit_id = '7da0178d-42ee-5e98-aece-77ffbb45dd2d', position = 5 where id = 'b828e467-960d-5bd1-8a0a-b71d706f8207'; -- chusma
update public.forms set unit_id = '7da0178d-42ee-5e98-aece-77ffbb45dd2d', position = 6 where id = 'e8f86f2e-bd75-56f1-bf85-d32f257cca4b'; -- no me digas
update public.forms set unit_id = '7da0178d-42ee-5e98-aece-77ffbb45dd2d', position = 7 where id = '4965a11f-2d73-5a37-be6a-739045c5904b'; -- callate
update public.forms set unit_id = '7da0178d-42ee-5e98-aece-77ffbb45dd2d', position = 8 where id = '8cd19b05-81c7-53d8-95c5-299cf8f6e4ca'; -- mirá vos
update public.forms set unit_id = '7da0178d-42ee-5e98-aece-77ffbb45dd2d', position = 9 where id = 'aee33438-75f8-5c32-957f-f6c2ecead8f1'; -- todo el mundo
update public.forms set unit_id = '7da0178d-42ee-5e98-aece-77ffbb45dd2d', position = 10 where id = 'c6aa3b6a-a2c8-5962-9d55-577b88c067e5'; -- cuenta
update public.forms set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b', position = 1 where id = '316ce088-6901-5674-9578-95424099c945'; -- engañó
update public.forms set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b', position = 2 where id = '76c8cbd8-9286-545a-949d-be2048f2af6b'; -- engañaba
update public.forms set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b', position = 3 where id = '83c3bcc1-1cdd-5fa1-abda-1fdd87100724'; -- le metió los cuernos
update public.forms set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b', position = 4 where id = 'd3b2f875-51ea-54f7-9db6-406ef819089a'; -- a escondidas
update public.forms set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b', position = 5 where id = 'a9fa2ded-600b-5683-b436-b2090127133c'; -- sospechaba
update public.forms set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b', position = 6 where id = 'ba0e6b15-9f86-5de2-9d0b-6195e2be9557'; -- descubrió
update public.forms set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b', position = 7 where id = 'da0e568e-16ee-5bab-a4eb-ee21b3c597f3'; -- cortaron
update public.forms set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b', position = 8 where id = '7cdad51e-d83b-5106-b072-ad98603593be'; -- volvieron
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '06a10c76-e86e-5461-bf5e-545d91a5eb53';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = 'd10f35d9-3007-5aec-b7fc-561d9f40554d';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '13705628-23d2-5a98-8215-aef30a1eb4bd';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = 'd06f2cfb-6882-5867-944a-e2652a1e5789';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = 'e4f9cebf-86a2-517e-929c-13acf00a7852';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '87da3418-5acd-5c20-8b25-1a831d22a016';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '18e8af66-79e4-519e-b1a0-3f5174e48676';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = 'ab382e5c-113d-5332-93ea-fa134bced158';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '49a695c0-c845-5da8-b39f-2bc8e047363a';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = 'a053131b-7df8-551b-b80d-d67d97dcc20c';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = 'dfa13909-91f5-5e24-8ba0-8b1a0cfe8a4b';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '39ac9a48-85e2-5a17-a24b-7b2d6c085a6f';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '4d8a4e36-ce02-5e8b-9aa1-9882d58f08b0';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '9b176b12-aa73-5e65-a6fe-f17b2776a2f3';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '1e05904e-9e7e-54d1-85d6-cd6c816b57ee';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '8ebe91e8-294f-5aef-83d8-11728ec6632f';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '7ad2afd3-d2a4-5827-8f86-8b95c4d58de3';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = 'bea5f938-798b-5821-882b-28b8d315ba63';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '2287372d-4b6d-57e6-94d3-74b498ce8dae';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = 'c74329f4-74ad-5484-b7db-8564b00aaf4d';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = 'da28b30a-7dad-5e65-bb43-636afdb4e4c5';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '166a6048-3afc-5321-91b5-21639fdf2b24';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '0263948c-b862-5579-a5b1-7c26d2ec6907';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = 'ebd3181b-52c6-5b59-8d51-b04a08db2a29';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = 'a0bf3f17-f11c-5104-a18a-6aa71db7d6a3';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '9be76be8-0408-510c-af8e-5c9c72129841';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = 'af49d2ad-fad1-54b6-8c3c-5ef74bf51d66';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '1826a607-43e6-512e-a16d-971175b220ba';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = 'c69aa538-1865-5f59-a0a2-366c20f1a500';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '6c62a2b5-9d61-572b-89da-a2f144c0bdaf';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '43d3e28d-1bb7-58a3-9d44-36bc2cefbb94';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '933763a2-0edd-5691-b83c-4d3c654dbf48';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = 'a7e66d6a-63b0-51a8-8cd3-17244f9913e2';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '0da36a5e-307a-516c-b730-bd797bbefe56';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '713f3419-4609-5327-bd61-d79017c0b61b';
update public.sentences set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '379c2f3e-ae5a-5e8e-ad97-722beeb1075f';
update public.tips set unit_id = 'c0a6c7be-1bbb-598c-9113-89ec5c8ceb5b' where id = '026bd560-7714-5c78-9076-aba02a35b1d7'; -- Los cuernos

-- te-doy-la-razon → te-doy-la-razon · no-seas-cabeza-dura
update public.forms set unit_id = '4356c8d2-a33c-5a38-8b20-f4ac90387e6f', position = 3 where id = '297be3b1-a0cb-5072-b504-c353c1b906fe'; -- reconozco
update public.forms set unit_id = '4356c8d2-a33c-5a38-8b20-f4ac90387e6f', position = 4 where id = '71a80d44-1262-527b-b919-c01457db152d'; -- reconocer
update public.forms set unit_id = '4356c8d2-a33c-5a38-8b20-f4ac90387e6f', position = 5 where id = '4dadb5cb-e63d-5dd8-a025-e8cb3c3397f8'; -- te doy la razón
update public.forms set unit_id = '4356c8d2-a33c-5a38-8b20-f4ac90387e6f', position = 6 where id = 'dda89d54-caed-527c-9d63-849b4e132863'; -- en eso
update public.forms set unit_id = '4356c8d2-a33c-5a38-8b20-f4ac90387e6f', position = 7 where id = '8d9ad1fc-19af-57f7-8978-106846ce5b0e'; -- pensándolo bien
update public.forms set unit_id = '4356c8d2-a33c-5a38-8b20-f4ac90387e6f', position = 8 where id = 'e62ec8fb-e1d0-57a3-ace7-04b909518b8e'; -- a ver
update public.forms set unit_id = '4356c8d2-a33c-5a38-8b20-f4ac90387e6f', position = 9 where id = 'd2fb8e55-9af0-526f-ac0b-5344927e7143'; -- cambié
update public.forms set unit_id = '4356c8d2-a33c-5a38-8b20-f4ac90387e6f', position = 10 where id = 'c68a2042-5410-517f-866b-be8c90ff8765'; -- segura
update public.forms set unit_id = '4356c8d2-a33c-5a38-8b20-f4ac90387e6f', position = 11 where id = 'f43453a6-6726-5eed-bf58-b06b288baa09'; -- seguro
update public.forms set unit_id = '4356c8d2-a33c-5a38-8b20-f4ac90387e6f', position = 12 where id = '34db2b00-7832-5c26-819c-6ea044b342ce'; -- equivoqué
update public.forms set unit_id = '4356c8d2-a33c-5a38-8b20-f4ac90387e6f', position = 13 where id = 'e4c84699-ebbe-58e1-9ac7-e5d5833f271a'; -- equivocás
update public.forms set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2', position = 1 where id = '41e1ac46-f2cb-5b3d-a459-3bdf44a11182'; -- discutir
update public.forms set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2', position = 2 where id = 'a49b4756-456c-5b89-86e3-7df5567a8294'; -- discutimos
update public.forms set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2', position = 3 where id = 'c303b4a5-a4ce-5508-b7fd-1dd489d580bc'; -- defendés
update public.forms set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2', position = 4 where id = '0b35694e-ed75-589f-9564-abb5605a73e4'; -- defiendo
update public.forms set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2', position = 5 where id = 'efdeabac-3d70-509c-a59e-5abe60367ed7'; -- punto de vista
update public.forms set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2', position = 6 where id = '818ba556-22b8-535f-bae7-b7ebb2777d24'; -- exagerado
update public.forms set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2', position = 7 where id = '0148323d-4812-5fe4-a63b-e788c571a1c9'; -- exagerada
update public.forms set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2', position = 8 where id = '8908fe1c-0dd0-50e2-abcb-c0f5ccf73607'; -- cabeza dura
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '8d2f410e-001a-58f7-9ca1-7b6a54556bfb';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '1695dcf5-281c-5055-95d6-2a697c933aab';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '59c1b395-46fe-5142-bd1f-090a9e0315e9';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '70403c0b-f051-5d82-93f9-2382c8030920';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '3c95428b-a54f-5a49-83af-c5a27fa9aa08';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '022c5b0c-cab3-5ecc-91f6-794dfad8b84e';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '74e0c907-1e70-5bbb-b91c-7a41dcbcfaa5';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '3976b106-d7b0-55e2-a421-cc2f27f31a8d';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '6cfc4461-08ff-5cd3-93d4-64ad8a71ce07';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = 'bdb9b9fa-0b43-5cb3-8c91-fa17e5208acb';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '263f46f3-fda0-5b4d-882e-f483e500da6a';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = 'f35aee81-465b-5903-a09b-d0c1b2f950b5';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '34b4b856-3b81-51ba-9008-7333d68dac10';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = 'c0b6e9b2-23e6-5bed-ad6c-6358eb1c56ba';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = 'cc4c8678-4e75-53e5-abbf-9e8d5431e590';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '406501f8-c3cf-5e1b-bc30-eefcc7892ce2';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '181496c0-15ee-54e2-bcf3-16b6ae725018';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '6ebb2373-9816-5469-b2df-58345fdf63c5';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '534efb72-6d25-5017-9832-6b677613f9db';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = 'c7a4e04d-8842-5561-94a2-b329b5842008';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '0cfafb2d-6603-5ec4-b074-44ef22d1b456';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = 'afb20186-b9a2-574e-9c4b-50849415175a';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '771f2a13-f7c5-5def-b31c-ef32220c5a23';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '3db099fe-7bd8-5c67-8d56-8691975be288';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = 'ace030eb-b9c7-5d95-ac16-55aed928c1c1';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '0919ae44-cbf2-58b0-a0e2-7dbaa600f09b';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '5bf1e16a-3540-569e-9190-8cf79618e74c';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = 'd2b3c4e1-3fad-5dcc-9cbd-901a396f4b44';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = 'f3992417-c94e-5ceb-a45e-985efdb52ecf';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = 'ed57bb03-57a5-5f03-8840-bfd34e4426c1';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = 'c915593d-cef2-5c73-9087-d314900ccb97';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '5a57e9bf-9fe5-5863-9e40-a76451fa3712';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '5d1e5166-164c-54ca-b78e-f488e8296260';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '9282e159-122b-5877-9de8-14b0139c6847';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = 'a3c039b0-9674-5d57-9fd1-2b3a01ee02f6';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = 'd92cc145-97c6-5089-9bf2-7540f8dc7ea1';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '1e358158-50bc-5ea4-8f0a-cfadbb76fcc5';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '03a7d8a5-46f1-5bc5-a1aa-4edfe0eb82c5';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '430d88b1-6764-56ad-8112-8cfdae4c4c4f';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = 'a67ec330-c1b6-5224-aadd-ac08f1f7c6b8';
update public.sentences set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '3c98f1c6-f382-5d9f-9e7a-594027c97a36';
update public.tips set unit_id = '5dc775c3-bcd1-5435-86f2-b35bc56a96d2' where id = '1257cd1c-a853-5a83-8483-1b544c971a7b'; -- ¡Nada que ver!

-- me-pone-nervioso-que → me-pone-nervioso-que
update public.forms set unit_id = '8ec0010d-66b0-5b69-aadb-eca273e4ae43', position = 3 where id = 'da62266b-c340-551f-8f26-9ac6c706a90e'; -- me alegra
update public.forms set unit_id = '8ec0010d-66b0-5b69-aadb-eca273e4ae43', position = 4 where id = '335fad18-1312-538d-b48e-768cbfd1d547'; -- se olvide
update public.forms set unit_id = '8ec0010d-66b0-5b69-aadb-eca273e4ae43', position = 5 where id = 'ff3eda30-1d23-5917-9ed1-895d52e41c4f'; -- cancelar
update public.forms set unit_id = '8ec0010d-66b0-5b69-aadb-eca273e4ae43', position = 6 where id = 'dac5d3b8-cee8-5a80-b777-3303ec3aa476'; -- cancele
update public.forms set unit_id = '8ec0010d-66b0-5b69-aadb-eca273e4ae43', position = 7 where id = 'e1419c76-2561-53d8-b071-231956d2a42e'; -- canceló
update public.forms set unit_id = '8ec0010d-66b0-5b69-aadb-eca273e4ae43', position = 8 where id = '8b29260d-76de-5a23-88cd-e3b0e2473206'; -- mienta
update public.forms set unit_id = '8ec0010d-66b0-5b69-aadb-eca273e4ae43', position = 9 where id = 'cd2322c2-b833-563d-b223-fda5c8f22e4d'; -- humor
update public.forms set unit_id = '8ec0010d-66b0-5b69-aadb-eca273e4ae43', position = 10 where id = 'f60fd192-6a56-5642-a050-4c2918677f84'; -- a último momento
update public.forms set unit_id = '8ec0010d-66b0-5b69-aadb-eca273e4ae43', position = 11 where id = '43d92786-110e-5f97-a135-d652816c69e6'; -- celos
update public.forms set unit_id = '8ec0010d-66b0-5b69-aadb-eca273e4ae43', position = 12 where id = '81b39c51-ce5c-50fe-9dd7-5533e0a89e9e'; -- colgado
update public.forms set unit_id = '8ec0010d-66b0-5b69-aadb-eca273e4ae43', position = 13 where id = 'e01388c6-e6ba-59e0-a622-3bc546871bdd'; -- colgada
update public.forms set unit_id = '8ec0010d-66b0-5b69-aadb-eca273e4ae43', position = 14 where id = 'f0d1bbc1-2b65-59c3-8a9d-6b24df9a1072'; -- me clavó el visto
update public.forms set unit_id = '8ec0010d-66b0-5b69-aadb-eca273e4ae43', position = 15 where id = '82789278-5e2f-596d-bddb-dca651acc429'; -- enoja
update public.forms set unit_id = '8ec0010d-66b0-5b69-aadb-eca273e4ae43', position = 16 where id = '81c38d60-d568-5dc2-80b1-7f674c56b1eb'; -- alegra

-- deberias-tomarte-unos-dias → deberias-tomarte-unos-dias · animate
update public.units set title_en = 'Tell a stressed friend to take a break', summary_en = 'Deberías tomarte unos días' where id = '504b4319-d4ab-5b42-870b-fea27ef57652';
update public.forms set unit_id = '504b4319-d4ab-5b42-870b-fea27ef57652', position = 5 where id = '437a7dd9-2924-5ec2-8174-ddb94fe159d7'; -- estresado
update public.forms set unit_id = '504b4319-d4ab-5b42-870b-fea27ef57652', position = 6 where id = '3818bf7b-b078-5696-9f41-f0ef935a5308'; -- estresada
update public.forms set unit_id = '504b4319-d4ab-5b42-870b-fea27ef57652', position = 7 where id = 'cd441a7f-dadc-5771-a486-02079ccae66d'; -- quemado
update public.forms set unit_id = '504b4319-d4ab-5b42-870b-fea27ef57652', position = 8 where id = '6465b31a-cfc6-57a4-88f2-053e00e7c467'; -- quemada
update public.forms set unit_id = '504b4319-d4ab-5b42-870b-fea27ef57652', position = 9 where id = 'd8c2eb1b-4b8b-5b63-8fe8-37e454d5a142'; -- franco
update public.forms set unit_id = '504b4319-d4ab-5b42-870b-fea27ef57652', position = 10 where id = '3369d257-0731-582d-afca-42edc38063da'; -- terapia
update public.forms set unit_id = '504b4319-d4ab-5b42-870b-fea27ef57652', position = 11 where id = 'e861a140-0a91-5f3f-99ef-984e7dbd671f'; -- animo
update public.forms set unit_id = '504b4319-d4ab-5b42-870b-fea27ef57652', position = 12 where id = 'c62bbae2-06cb-5f05-84eb-9e1c0c8249c8'; -- sé
update public.forms set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486', position = 1 where id = 'ce842784-9a8a-5270-aebb-8b6b8bad88ac'; -- animate
update public.forms set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486', position = 2 where id = 'b9cda9a7-7615-5c9b-9e2d-f440f3cb18b5'; -- me animo
update public.forms set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486', position = 3 where id = '34c954ce-0c0f-53fd-b2d8-15e0dffaf293'; -- encarar
update public.forms set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486', position = 4 where id = '3af6d347-63b3-5f08-8fc8-b9896e421920'; -- paciencia
update public.forms set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486', position = 5 where id = '315a2151-f470-5ffc-8651-abdaf6774298'; -- sincero
update public.forms set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486', position = 6 where id = '760decc1-606c-5f3e-8d63-20ceb603ab5c'; -- sincera
update public.forms set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486', position = 7 where id = '493fd67f-6f70-5a99-9f35-851130de0056'; -- hacele caso
update public.forms set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486', position = 8 where id = 'afc5e56f-d8f2-5c33-8431-6e3cd7cc96c3'; -- tenerte
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = 'a0182668-0294-5794-992d-5db80e6df1b0';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '23ffcac1-6777-547f-88dc-f0834c7e00a3';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = 'e445c0dc-ae87-56cd-86cd-6f0e5da64074';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '5c34532e-8251-5014-82bd-e22356fab5a3';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '7fc3a6bd-109e-5684-96d8-4a3cd063b029';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = 'cde26fb4-21ca-5a60-89ac-d6bac34ae5a1';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = 'f4187cf4-e3e2-50fd-b576-48658724256d';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '403082f8-e750-5c17-a175-bd01e6e6dcd0';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '317c9a1b-4613-5e36-9b08-39c66c1a60f7';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '0a7d4cbc-aa69-5228-83fc-e0067ee83cec';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '05c153b6-e867-5f5f-baa0-4cee64645799';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '59380328-f6c4-5fa4-8cfc-8fcebc3c55b5';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '3aa6d4c2-74fe-5e73-9d74-673bfc843c4e';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = 'c08f3fd9-268c-56c7-9785-993a4b066518';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '9c36193f-f0eb-5c77-bc9f-f4de7fcdc46f';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '3d92f230-1f99-5e32-a72e-d24d590ff357';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '4b8e850b-e368-5464-bef4-729faefff126';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '1035bafe-5b23-51da-9e3d-3254ffffad3d';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '3d51ab69-afea-5147-9023-6541a29736e9';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = 'f70d3e64-a947-58c0-a186-814f071ca4f4';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '98ad6a16-133d-513c-92d3-30926fd3aec0';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = 'a8c5d567-5fd5-5a0b-88aa-962d701800e6';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '8beb9e00-9fd2-53c1-919b-4e11554ed169';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '4dcc7f48-8ef0-5d1e-89a7-4c649c09ad18';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '74a45b05-4b8a-5f44-b587-270a6882d5cc';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '2ef11b53-eb78-5c53-ba91-81e76afddec5';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '675d8b7b-9d7c-5eb8-97f7-055ea57293ca';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '7da13dac-fa92-505e-978e-bc7fa3c3a29f';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = 'ec4d2fa4-a73a-509e-861b-fe663e8a8420';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '119d31ae-53c4-57ef-abb3-acea315392f0';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '74f29542-adb7-5f1e-82d3-c23c8f39008a';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = 'fdad19ad-9ebc-514d-b618-c5467702e0fa';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '025d59ae-cb70-5fe3-8c54-aceabd842913';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '9c7e4bae-8d22-56b0-8fa6-ffc92c6fa0be';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '1a70b48a-8bcb-505c-a1f4-da2cd2090ee5';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '8f9da7de-7b62-5ad9-978c-1915d8ba72ea';
update public.sentences set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = '657a47bb-40b1-5aa6-8380-309fec1a271c';
update public.tips set unit_id = '38f956d4-9a07-526c-988f-92fc1d00e486' where id = 'ba67d83b-3d37-5a5b-a746-77aba5677455'; -- Estaría bueno que…

-- estoy-al-horno → estoy-al-horno · es-re-rata
update public.units set title_en = 'Say you''re in trouble, barrio style', summary_en = 'Estoy al horno, qué bajón' where id = '9f441bef-17a2-535a-a539-79a16389ad10';
update public.forms set unit_id = '9f441bef-17a2-535a-a539-79a16389ad10', position = 5 where id = 'd06a5ce7-b076-5488-b8b1-58ea1edb0487'; -- en pedo
update public.forms set unit_id = '9f441bef-17a2-535a-a539-79a16389ad10', position = 6 where id = '0f410114-35a1-5b86-a64f-d9ce0e521812'; -- de pedo
update public.forms set unit_id = '9f441bef-17a2-535a-a539-79a16389ad10', position = 7 where id = '5110fc7a-b203-5172-898d-44b26e6e0818'; -- traje
update public.forms set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36', position = 1 where id = 'e2860490-c594-5257-a4f8-60cd674c656d'; -- rata
update public.forms set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36', position = 2 where id = 'b8420931-26b0-503c-b21f-c5eae4131950'; -- careta
update public.forms set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36', position = 3 where id = '951ca01c-0c0b-55aa-848c-9b04adc9c87e'; -- grasa
update public.forms set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36', position = 4 where id = '598f66b7-fb53-5b56-a9b5-b8c15763588c'; -- manija
update public.forms set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36', position = 5 where id = '917d40ef-cbf9-5c5c-9d9c-1870c05c420c'; -- cana
update public.forms set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36', position = 6 where id = '0b541930-bfb5-5433-b1c5-2b7139df12a4'; -- hacer la gamba
update public.forms set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36', position = 7 where id = '5e0bd53d-af8c-5c44-b6b7-b1ab1b99bec6'; -- me hacés la gamba
update public.forms set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36', position = 8 where id = '8568fb86-4f41-53e4-8e30-d527617ac8f0'; -- mandar fruta
update public.forms set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36', position = 9 where id = '899ce56b-e693-5834-af7f-384333661a45'; -- manda fruta
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '8f0c1f40-0f21-5c41-8609-ce43930b6f61';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '3c047b84-b551-5636-8c0d-57dff5a8b53a';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = 'efb957e7-d5f4-5dfc-a7ca-fac35d0fc388';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '804863a8-2046-505f-b0e8-fe9072d54d55';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = 'e4507ace-cfee-5a0a-b900-9af0a6df7a78';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '61cc7f08-d8e0-5ba1-bfa6-1b822c38237a';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = 'bc648b79-725f-50fb-acf0-9b590ee4f542';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '0ec9d7a4-bfc4-5715-9d9e-126573898587';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '6f8fdebd-cf3a-5fe2-aa35-014350e22e7d';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '48cabb93-c9a2-5a53-8f0a-bf7cbff1a823';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = 'b2d36340-997d-5f67-85b8-299dcee7c750';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = 'e28d2e83-63c5-5c5f-9f73-bd582c8cc1d9';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = 'd20cbeb7-db08-524b-8c00-4fb548e5caf9';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '34301cff-dec7-5339-9c35-c9f1003f0f0d';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '2dd6cf6c-c469-56dc-ba00-9cc52a388a7a';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '2a3e6d32-370c-5a45-9675-73eb76061880';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = 'da0208ae-2f87-5ba9-81ac-fd9e120f883f';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '94b044d2-a58e-5ef5-928d-e38c9cd1d1b0';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = 'c3dd54ce-8f3e-5c46-8802-76e2d92ef79e';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '9a1054e2-e5ee-5bd0-a5c5-209e64c92f05';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '5d7d30d3-d9e0-5ea3-bd33-2e34a06481d0';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '08c14c97-81ad-5785-aeb8-983e9dacc51e';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '6044624f-724c-560e-b566-a0cae43886a6';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '12252db3-d47f-5ebf-a99e-4f86bb457a93';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '5cd6a710-e04a-5db8-bd91-f732f5debc2c';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '6950cdda-3847-5761-b0ae-aff436ef9ae3';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '6f25f031-b5b6-5cb9-81fb-5f2569d69a12';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '96c572a5-bd11-5e8b-8f37-ce2e3b994113';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '6bef2165-b666-51f2-92e2-a675cffebc6f';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '0072c085-3cfb-563a-a43f-5e48640aa7b5';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '5fae875f-eac7-5a56-a133-61efe388f701';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = 'e3eea17b-07a7-5af2-ba28-22c8320817e5';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = 'e75ebc29-9ab3-5841-9e3a-41860a2559c3';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '2f6c4aec-61c4-5cbb-b70f-dee34eeee35b';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '7c0a4812-0f66-59a2-9041-3a56d023c7e8';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '6a630bff-9a3b-5f3e-866e-c699194f0b01';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '6a9efd69-e9fb-51c8-aedc-3e0157b8d837';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = 'c82f9da7-2633-517c-b464-ca59fecf7c0c';
update public.sentences set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '680b0bfe-9894-5f01-b0a5-03b747c9ec00';
update public.tips set unit_id = 'b9000e5f-e036-5865-a339-d473b7b47e36' where id = '361c790d-a0af-59b6-8330-323cd924f6a0'; -- Rata, careta, grasa

-- puteadas → puteadas · no-rompas
update public.units set title_en = 'Understand swearing at things', summary_en = '¡Qué cagada, la puta madre!' where id = '4aaf79fa-f71f-5712-8a98-5facae7b4221';
update public.forms set unit_id = '4aaf79fa-f71f-5712-8a98-5facae7b4221', position = 2 where id = 'b59e37b3-f673-5ad6-8029-fa5617667d39'; -- la concha de la lora
update public.forms set unit_id = '4aaf79fa-f71f-5712-8a98-5facae7b4221', position = 3 where id = '00c6c9ee-ebf5-559e-91fd-7d6b2a95e0dd'; -- mierda
update public.forms set unit_id = '4aaf79fa-f71f-5712-8a98-5facae7b4221', position = 4 where id = '0d1e9a27-d208-54fa-a353-9d3f33422208'; -- de mierda
update public.forms set unit_id = '4aaf79fa-f71f-5712-8a98-5facae7b4221', position = 5 where id = '86bc59d9-34b0-54eb-b69c-9f8fea1f6bcc'; -- carajo
update public.forms set unit_id = '4aaf79fa-f71f-5712-8a98-5facae7b4221', position = 6 where id = 'a0bdd469-9855-5168-9358-e10717b105dd'; -- cagada
update public.forms set unit_id = '4aaf79fa-f71f-5712-8a98-5facae7b4221', position = 7 where id = 'a32bb081-13a9-5584-8308-95dc93988f8c'; -- me cagué de risa
update public.forms set unit_id = '4aaf79fa-f71f-5712-8a98-5facae7b4221', position = 8 where id = '2cbaf9f5-3b53-5e6c-8c3d-d1312dcba0ae'; -- boludez
update public.forms set unit_id = '4aaf79fa-f71f-5712-8a98-5facae7b4221', position = 9 where id = '23afa143-35e2-5384-b129-b60cb4fa16d0'; -- me chupa un huevo
update public.forms set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de', position = 1 where id = 'eb59c106-b08c-54e1-b721-2be3bb41ef4b'; -- pelotudo
update public.forms set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de', position = 2 where id = '910ca402-8034-5f28-b00f-1ca1773d2e4a'; -- pelotuda
update public.forms set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de', position = 3 where id = '8516e0dd-2dca-59b8-b4c6-706038fa2a31'; -- forro
update public.forms set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de', position = 4 where id = '7ae598e6-7409-51b9-afff-34963ce87652'; -- forra
update public.forms set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de', position = 5 where id = '825ba3a4-4334-50d1-8b97-82ea9a1f32cf'; -- hinchapelotas
update public.forms set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de', position = 6 where id = '33b9dab3-9b73-5425-830d-449ad331bca7'; -- no rompas las bolas
update public.forms set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de', position = 7 where id = '80aa1589-8356-5c01-9dc3-6ab62e359011'; -- andá a cagar
update public.forms set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de', position = 8 where id = '1b7083cb-29ac-504b-8237-9f18b4d2607b'; -- hijo de puta
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '04b51f60-4b28-59a5-a889-fe02cc478f6b';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '2135787e-600c-5100-81e4-d1651bb18622';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '40b6c181-87c3-50a0-ba51-de082fffc705';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = 'e1574a43-be7e-5940-b8cd-881cc9d33b85';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '0e16b4de-5b32-5c2f-aa2f-4a44cb7a3139';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '347a6f98-30c0-519f-8b3a-7bd2f74f4839';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '97b5845b-3348-5d52-a75d-1838cb547856';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = 'ff298c02-bcd2-5ff5-9845-e62b6df2987c';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '92d81f42-cda1-51dc-870d-350a78d5004c';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '484bb7a8-3aa3-5f52-97bb-4784fcdf7df8';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = 'd7656ee7-972d-5f66-801f-45362797d2f0';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = 'a5016738-7441-524e-bce8-1cfb5ba4ad41';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '11e584c0-ccd2-5fcd-8e8a-1bce0527e351';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '8bbfd378-6f37-55c5-9e99-b3bb0ceb1cdf';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = 'bd5d106e-d723-5a02-8bcd-064da6a60b9b';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '1ebc6206-ff34-533d-88ba-bde51c5ae3cb';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = 'b1e3211e-5e5b-56d3-9298-572ce003e4a4';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '2cb5d1ec-739b-57a2-9d33-3fd64b78aaad';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = 'a75d0606-5b2a-5b79-8491-519b70cbfd84';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = 'bba50ade-7390-5ad2-96ac-0c8b5f1ce9ac';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '214290e5-fbc1-55db-a2f5-bf0d4add23d3';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '0113b22e-b0d1-5e88-af0e-ab8c1d202f83';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '52f33a7a-ae7d-5165-a91e-cf0e0f5570f0';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = 'cc8a6dae-999b-5c69-a23e-765a227e9842';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = 'a1b4dc4e-694d-5f8b-86ab-1e286402d3a4';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '973b26ee-74ae-526d-8db7-ebbcb43fedae';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = 'edd22e1a-ea43-54e2-8afd-8cbe8cc8cf29';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = 'e55316d8-a83d-5c1f-948c-ec01ae45f900';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = 'afb7e6f5-0f9a-508a-984b-9816967a13ac';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '43620684-bc19-5688-8b2b-84b29c88642b';
update public.sentences set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = '5d5d8ce5-3366-5209-9cf2-7c8aa54132b7';
update public.tips set unit_id = '0566378c-49c7-5587-b615-3ca410b2b6de' where id = 'da8de45b-718a-598c-b598-e48991bb7640'; -- Swearing at people

-- te-reenvio-el-archivo → te-reenvio-el-archivo · alguna-duda
update public.units set title_en = 'Send a file by email', summary_en = 'Te reenvío el archivo que me pediste' where id = '38987042-d239-57ac-9bcf-58be792a8609';
update public.forms set unit_id = '38987042-d239-57ac-9bcf-58be792a8609', position = 6 where id = '0b8109b1-5499-52e3-9323-75069c0ccfeb'; -- planilla
update public.forms set unit_id = '38987042-d239-57ac-9bcf-58be792a8609', position = 7 where id = 'c63f0d59-6305-5cf6-aad6-febe2d64b018'; -- link
update public.forms set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f', position = 1 where id = '59ec7f20-1211-51be-bd24-7687bfe7d676'; -- duda
update public.forms set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f', position = 2 where id = '7948ab75-8875-5736-82aa-d7cfc3b6ecfb'; -- dudas
update public.forms set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f', position = 3 where id = '6059b9bc-a713-5a5d-bedd-f0c08a94e4c3'; -- revisar
update public.forms set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f', position = 4 where id = '8f19ae12-85fb-54c2-92c6-7e773ccc39e0'; -- revisé
update public.forms set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f', position = 5 where id = 'a050cbe3-479d-534c-abb3-5670a264adc5'; -- revisá
update public.forms set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f', position = 6 where id = '3eaccde5-2747-5683-90a8-29f9e089f12a'; -- pendiente
update public.forms set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f', position = 7 where id = 'aae0d1f8-2899-5c41-a375-5e0102037bbc'; -- pendientes
update public.forms set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f', position = 8 where id = 'b9672a08-8f24-5922-8eaa-479e43e48b7c'; -- agendar
update public.forms set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f', position = 9 where id = '7436a653-38fb-5e73-8445-5cedcf090515'; -- agendé
update public.forms set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f', position = 10 where id = '3716907d-47d9-5559-b2e2-b9ed5360b853'; -- en copia
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '9660c759-bf22-5b6a-8bcd-c7cac7705ab8';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '8854bd62-8227-52ef-9f2f-329187c72295';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '1bdc178b-16d1-5c8b-bcc7-aacca6dbdf0d';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '4e799eec-d3d6-5b7b-a833-b1c5271bbe67';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'ca76c9d4-2c57-5006-9671-6324f4d5d614';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'd6758973-ce76-5a44-859b-cd2a04214bb4';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'fc9885a0-b376-5ad0-94c7-7c26fe4c31d6';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '1650d675-c2a6-5517-a3b1-f7c1369806bd';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '22e14b73-52af-52ad-8160-ad48859d19ab';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'daead7c9-aa58-57c1-b6b9-5e966c96979b';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'e5bb97e2-8c03-5cda-9000-c763a9302f45';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'db5ef926-79ef-5409-b571-b80699917374';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'da09d92a-b3ba-5b61-b87f-c1be03a0423d';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'e3fd38f6-1ba8-5d8b-80e8-0abf03e1d85e';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '177c14ce-6ef0-5853-a4f5-7d48371413ed';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '25c51c65-0f15-589f-a41d-f4077edbb7a6';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'ed7fc3a4-d25c-55b8-862f-5634e068196f';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'ba04a4e3-c594-531b-bf4f-d40b1bb4928c';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'cd35f7cb-3eff-5bb4-bfd1-7b514ad24c79';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '3585cbc8-1a5e-5c13-b45f-f13d983c1be0';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'c2f2e957-d709-5fc7-aa6b-d8425b327fa3';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '72d67cbd-ead2-5c03-85f6-21df0a617b79';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'ad7bb6e2-4841-5e8e-8bf3-62af403ee57e';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '56f77a8f-39f7-537d-9a23-ecaa256f820f';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'de4b9f16-d3dd-52a7-a631-bedc185f4092';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '5d950e8e-6165-56c2-a112-0d13433a556c';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '1c9b9fdc-6173-59ae-b73a-1c56a894bd42';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'c5db9258-b9cd-5975-9476-7c0d3a1837e3';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'e3245a65-1555-5a9a-8732-f4eebf255db2';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '080b68f6-22a0-54ad-828c-d2c14e5e6bb0';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '733d4510-2882-5e2a-986e-11a7c7379e30';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'f4b26a80-a184-56c7-b633-fd810c5dd60c';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'b1090e0d-7ab5-57e5-9a69-38b0b1f410c9';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '375bd8ab-bdd2-5db9-b2df-0ca8e43752a8';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '0886554b-8240-5429-b571-93ef41a3f8ab';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '60d4fc14-23fa-545a-8b54-39fd953e7945';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'eaff746c-98f0-5205-abad-af5a33998222';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '4265c7bc-8f0b-58bb-838e-2ac4c6115a23';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'a1ee1445-af69-5b9d-a638-ac00648a617a';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '0b56da4c-9ed3-591c-92a5-7f80c5744375';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '20445c9b-6678-52ea-b30b-9dd6c99a5dc3';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'f8a08ddf-115f-56e8-aec5-af96f678e69e';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'cd5b3351-6114-546f-94e4-0e79a6b60506';
update public.sentences set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = 'd22fdb1d-ff57-5836-813f-873ba55f4db4';
update public.tips set unit_id = 'd6a21171-e193-5291-aa1b-0b50fd50bc0f' where id = '4c901404-ced9-54c4-a1c0-b042f20adc93'; -- Cualquier duda…

-- sobre-la-hora → sobre-la-hora · postergaron-la-fecha
update public.units set title_en = 'Hand in work at the last minute', summary_en = 'Entregamos el informe sobre la hora' where id = 'a9fb512f-6297-573c-8d34-be942749040d';
update public.forms set unit_id = 'a9fb512f-6297-573c-8d34-be942749040d', position = 8 where id = '43cc24eb-d399-588f-88a1-01564631b630'; -- sobre la hora
update public.forms set unit_id = '40956104-607c-5e0d-b967-446b478843e7', position = 1 where id = 'c6f4d7af-4b7b-547c-aa29-fed3fcf18496'; -- postergar
update public.forms set unit_id = '40956104-607c-5e0d-b967-446b478843e7', position = 2 where id = '8785e8d2-a70f-56da-a228-dc828ae15aeb'; -- postergaron
update public.forms set unit_id = '40956104-607c-5e0d-b967-446b478843e7', position = 3 where id = '8d8d4063-19bd-5a6b-90f2-64d2709f6196'; -- adelantaron
update public.forms set unit_id = '40956104-607c-5e0d-b967-446b478843e7', position = 4 where id = 'a05fe0c9-ad18-55b0-8d13-7fb6e487b2c9'; -- avanzar
update public.forms set unit_id = '40956104-607c-5e0d-b967-446b478843e7', position = 5 where id = 'c90a65b3-f972-586a-9e77-c2a87f1797fa'; -- avanzaron
update public.forms set unit_id = '40956104-607c-5e0d-b967-446b478843e7', position = 6 where id = '2e98d068-9605-5c66-a3a6-887ddb82e759'; -- horas extra
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '4c133a37-63b5-5c4d-9b68-333c08998704';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '2e59bed9-adba-5c46-93bd-af57de3377e1';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = 'a53e8f28-523b-5885-9a1b-e3807f656c79';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '9a1ca897-3d9f-5a83-b19c-db6bf70ec7f3';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = 'a27c0c7c-1250-59f5-81be-49d7619474ec';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = 'ad48dced-cc14-5a00-8ca9-d9fea94909f5';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '5e412c12-a42d-5699-ba0c-b37545f7569f';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = 'c61b76c0-631b-5f95-af80-fb147b5302cd';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = 'c511684f-3c26-5a92-85bb-56ea3cbdfe77';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = 'a4386bbd-db53-5ecd-8e5c-18f5c739b10c';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = 'fb652796-8593-5ca2-99ae-bab3d435d7e8';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '62eb8030-12fd-54b6-9769-4bbd2f8363d6';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '928ab1d3-c4c0-5b98-bd73-8861b1ea2029';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = 'efd141a2-470b-5b34-9c8f-3351a26773fe';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '3842167a-33e0-5aa1-98cf-ea6551127c17';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '11c611bd-56d9-5b5f-b69f-79780eb6735f';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '7e9c43ca-5795-5519-950c-59b4a0a79bbf';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '4495896d-06d9-51c4-912e-93825af1f05a';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '30e3c7ee-1577-5a15-90da-1e471a893b20';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = 'da3f576e-a433-5b78-9fd5-1eba76f1a295';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '7a63c12a-0d99-56c0-be9e-9b82c1c829ec';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '2579ff57-7d15-5085-915e-e57d74596c22';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '0fa27800-0723-518c-a7b3-f78a8f405fe1';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '90569c6d-60e1-59df-8dbb-8e58d7f19950';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '4de7357d-86e2-507f-9077-8a2bc225d4b5';
update public.sentences set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '2108ebfd-4c4f-5305-acc7-f506ee65d390';
update public.tips set unit_id = '40956104-607c-5e0d-b967-446b478843e7' where id = '667abe18-109e-562c-b974-4938f7888ca3'; -- Entregamos, entregaste

-- me-la-jugue → me-la-jugue · te-las-arreglas
update public.units set title_en = 'Take a risk and say how it went', summary_en = 'Me la jugué y la pifié' where id = '685c49ba-32f9-5e23-acab-d8552fdf4a20';
update public.forms set unit_id = '685c49ba-32f9-5e23-acab-d8552fdf4a20', position = 7 where id = '30596573-c417-5f01-a2e1-b816319f0bed'; -- la pegaste
update public.forms set unit_id = '685c49ba-32f9-5e23-acab-d8552fdf4a20', position = 8 where id = 'c49a3c50-ec8b-576a-bfbd-c8bed139ff04'; -- no la veo
update public.forms set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6', position = 1 where id = '6be7ae89-edaa-5fa1-9f20-f8f71662d590'; -- se la agarró
update public.forms set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6', position = 2 where id = 'b86344be-23ae-5e52-b113-55442e931b62'; -- me las tomo
update public.forms set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6', position = 3 where id = 'ca3b6e11-7251-518b-9227-65c76453374a'; -- te la bancás
update public.forms set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6', position = 4 where id = '742cb9cc-1b8e-5623-af14-1b9fbe6159b0'; -- nos la bancamos
update public.forms set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6', position = 5 where id = '45ffcc2b-d0d3-52f5-9077-70d1dcec0e6c'; -- te las arreglás
update public.forms set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6', position = 6 where id = '19c424cb-ba43-5f22-8279-9ac5617b300c'; -- se las arregla
update public.forms set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6', position = 7 where id = '63fd344d-02e0-5094-8afd-f328011fd822'; -- cortala
update public.forms set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6', position = 8 where id = 'a24cba0d-f213-5f5d-8f97-b35a381dc525'; -- a las apuradas
update public.forms set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6', position = 9 where id = 'ac832f25-a007-5183-b158-bdcdd7529607'; -- a la larga
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'bd9622c2-9303-5731-ae65-5e69085fa1ac';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '3dedf3f2-b700-52d6-9f68-643dc18abc84';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '8a686e4d-e5bf-5040-ba48-d310e37bb200';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '6c7369ff-5bda-531c-b2f1-58d7ac0f4f83';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'e1bebf57-810f-5402-92de-e0cc82983118';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'cf16b65c-23ca-56f4-8744-d249db12a8d3';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '2afe2f03-c0c1-5bed-884b-eab5e4eab78d';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'aa6cc634-0e08-5932-8528-5a8bd3e9cf41';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'adcc80cb-36fb-5f01-8ed5-a5d8a1f28977';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'e68a468c-1f89-593b-9bad-c5f5c5f9e484';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'a094f24e-1801-59fa-a946-9ca35b7328e1';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'dcfba833-9fa4-5e69-812e-38e9826cdc04';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '08c59cc4-4ef6-5fb7-b2eb-62d50672bfb9';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '0eb4322d-55fa-59ee-a72b-052cd8e79f84';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '2c68626b-1eea-5e66-b7b5-b24165296f2d';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'e805ae98-181c-5609-9794-4156e6214684';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '91d6e627-1dc8-571e-8847-cf961db5f357';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'b52d9651-9b6b-5112-b105-95793204e22c';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'ab8ccfcf-666e-5c6b-9786-aa2875f4d1ac';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'c0d35a60-962f-5f04-8423-e0f780f5bd50';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'ff8db670-f525-508c-998a-68097fa06e02';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'd4517aa0-e85e-5e9e-800c-59669b5a2de7';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '55858fbc-839f-5290-9064-254948a65d9a';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'c8d08970-02fc-5425-910c-5272630df4b0';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'ca5a379e-8f57-5d14-8b6c-eab7e5057d49';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '7da32982-3720-5f5e-9866-1b16062f3406';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '5b3f6703-84e8-5f3b-85f9-e75546f4292f';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '75f039d9-fa1d-5e63-9596-714efaf8f081';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '807cf096-2c29-55ac-99ad-7d4d35b7b65f';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '8fc259ae-b3b2-568a-9b84-3cd47a9b9cca';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '2e119ff8-69c9-5bea-bebc-4aa0d9afb973';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '32db36ba-dba1-5cb1-8979-358f20c15653';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'e11546e8-8c05-5669-8e81-40a8e88311b6';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'f2ee66b2-3a11-50ef-a6ce-4eb335038e11';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'b235584d-5e0d-5860-8179-8ea252f6b7f0';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '46c1a300-2c4d-5e1e-af03-029fce985773';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '453d559f-42e4-58fb-b153-0ac8e02b82ff';
update public.sentences set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '5c757953-8d95-5bab-b12e-450a4cc42712';
update public.tips set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = 'd2483fff-67ae-5148-81e8-91d76e90d333'; -- The la stays, the person changes
update public.tips set unit_id = '48ea187a-3f2e-5b93-a8ec-1bec5b4926a6' where id = '64ddc740-cba3-541e-b01d-38bbf52e9139'; -- A las apuradas, a la larga

-- me-pudri → me-pudri · siempre-reniego
update public.units set title_en = 'Say you''ve had enough', summary_en = 'Me pudrí de hacer fila' where id = '4f79112a-7e16-5786-a09f-c3f47eec42c1';
update public.forms set unit_id = '4f79112a-7e16-5786-a09f-c3f47eec42c1', position = 2 where id = '319aa3ba-486b-54ff-9519-dbc523f185d5'; -- me harté
update public.forms set unit_id = '4f79112a-7e16-5786-a09f-c3f47eec42c1', position = 3 where id = 'b01464f8-061d-5def-8964-9107b613cbaf'; -- basta
update public.forms set unit_id = '4f79112a-7e16-5786-a09f-c3f47eec42c1', position = 4 where id = 'b5322ae7-e7d8-56a1-850b-5da082fb74c8'; -- me saca de quicio
update public.forms set unit_id = '4f79112a-7e16-5786-a09f-c3f47eec42c1', position = 5 where id = '0b0e6954-9d96-50b2-b7b5-85561876850d'; -- me saca
update public.forms set unit_id = '4f79112a-7e16-5786-a09f-c3f47eec42c1', position = 6 where id = '70bddb38-92b1-5964-9131-06fa32afe520'; -- pudrí
update public.forms set unit_id = '4f79112a-7e16-5786-a09f-c3f47eec42c1', position = 7 where id = '46c583f8-f2f0-53dd-8b77-bb443ead9594'; -- harté
update public.forms set unit_id = '4f79112a-7e16-5786-a09f-c3f47eec42c1', position = 8 where id = 'e2a7f572-edee-55d2-b1b7-e9ad3c80f395'; -- quejo
update public.forms set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9', position = 1 where id = 'd9fa9fc8-9ea4-598f-9ec7-9eba959a8779'; -- me quejo
update public.forms set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9', position = 2 where id = '9f33b2e6-0f30-5f1e-9158-77c1683e0293'; -- reniego
update public.forms set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9', position = 3 where id = '0bb916c1-fbb0-5b26-85d7-bb81f2c8b790'; -- renegar
update public.forms set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9', position = 4 where id = 'b765a323-be1c-53ef-ba7e-d30ba0602e72'; -- renegando
update public.forms set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9', position = 5 where id = 'c4b35274-cd13-5885-8675-b055872bc03f'; -- agotado
update public.forms set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9', position = 6 where id = '8a799900-27ee-5c55-b897-f11efd362337'; -- agotada
update public.forms set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9', position = 7 where id = '798e5050-59ea-51ec-ac5f-c434bd2922fb'; -- muerto
update public.forms set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9', position = 8 where id = '7a4469b3-24bf-5e82-be2d-a7aafcd00019'; -- muerta
update public.forms set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9', position = 9 where id = '68d7950b-ecd3-5b00-a878-895ca479487c'; -- estrés
update public.forms set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9', position = 10 where id = 'fe9bb14d-61af-58b4-80b0-910987ef5c1f'; -- caos
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '1791182e-dc97-5155-8b13-9489c5f75a16';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '00ca8ec0-1977-5145-8a29-2bdd6c47df5e';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '25d6dff1-ee39-53d7-a4b1-cb75ee33469f';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = 'fdcd310b-30ea-5e5e-9282-6c75922f477a';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '6d2485c5-9fb6-5895-8c6c-f392b5f61df7';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = 'd2f8ffe5-be2d-5b10-90cf-12c6e6b85d79';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = 'ce542b59-315d-53b3-9dd6-f84547d81482';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '223f1ced-22cd-5ef2-b21f-37753c75e09e';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '46dc350b-dd04-5a5b-932a-9acd92f262d5';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '30418bb4-b0e1-55af-addc-418fbe1ca6fc';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '3de3599b-ae62-5d85-ac09-51d804921f6e';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '66409854-1f93-5ef0-9de5-819e0cacee94';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = 'c5947f7e-59c6-56b0-ab09-11ade68bb8b9';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = 'a87dbb81-77bf-5f27-9957-75a3517452c4';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = 'a90d3ba2-5d1b-5f56-b4ad-501b09f2b24e';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = 'b7a38e35-bc0a-5a2e-ba97-044e865c10aa';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '66369af7-cf31-5191-92c8-b64285e4dc8e';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '58392dfb-3c25-5277-b479-2cbf56598ebc';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '9b3f669d-5748-5391-a44c-edfec06d1917';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '88fd25f3-4b18-5c35-a33f-4da6bd7c4302';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '655dbc33-706e-576e-a125-0ce9e9cf63b7';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '6751900b-5d34-5d5b-9579-e29dfedda1ad';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '30ddd890-1ef4-5114-a3ad-496298786ac2';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '01eec39b-dbb3-5c8d-ac27-cacc830d91eb';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '3fa3ffe2-07f9-5f40-a6fe-363d0860b1af';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '083ae637-e5ca-50a0-81d5-7f961bda9579';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = 'ccab448f-433a-5e6d-9009-39ce5586f207';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '76296632-12f4-5686-9328-cf7177efa27c';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '37cd1191-1b99-57f8-aa17-9976342ce3ac';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '42d1ea65-63b7-5d5d-89af-a00b5cf6e916';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '78233d18-068c-5562-8793-b31dec944802';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = 'b852f410-a63b-5beb-a3f6-448cd091bfdf';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = 'a2ef3766-a426-5fef-b133-49cd582ac990';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '0637d7a6-cbdb-57e0-98e4-89b64df233ce';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = 'ee768a5d-790f-5c69-a228-401f06ab720f';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '3434c931-3f52-59cd-ab22-f2f3a8fafad5';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '7a595ebd-399c-5914-a242-8087a1660c53';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '301dbdba-b640-5afd-aa4e-21ef0b8925cd';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '73178410-cc95-5a61-b632-59dcedcb5dd0';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '9b753581-7d20-5f48-ba3f-2e371f33af5c';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '56e1016b-7543-51d7-a945-cfc16e8296c5';
update public.sentences set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = 'f471e930-4006-5cf6-a8dd-832e7d960be4';
update public.tips set unit_id = '3615fe3b-41b9-55ea-a3ec-0232504bccf9' where id = '6f45a3bc-6d31-5a43-8fae-bde8329e1e96'; -- Me quejo, reniego

-- paro-docente → paro-docente · con-normalidad
update public.units set title_en = 'Follow a strike from start to end', summary_en = 'Mañana hay paro docente' where id = '00142c01-014f-53a8-b11d-1cf2bf832643';
update public.forms set unit_id = '00142c01-014f-53a8-b11d-1cf2bf832643', position = 4 where id = '1c0c83e7-2341-5371-a3c6-1cb76468b157'; -- anunció
update public.forms set unit_id = '00142c01-014f-53a8-b11d-1cf2bf832643', position = 5 where id = '782401aa-361e-55cf-be47-9ca686ced03f'; -- anunciaron
update public.forms set unit_id = '00142c01-014f-53a8-b11d-1cf2bf832643', position = 6 where id = 'b8db9da4-9e08-5a9a-90a3-5b053683e48a'; -- hubo
update public.forms set unit_id = '00142c01-014f-53a8-b11d-1cf2bf832643', position = 7 where id = '8842316d-ea1d-5bf7-983b-a054688aa78c'; -- medida de fuerza
update public.forms set unit_id = '00142c01-014f-53a8-b11d-1cf2bf832643', position = 8 where id = '1257c1a8-e65b-5600-9edf-e7e1706b7717'; -- protesta
update public.forms set unit_id = '00142c01-014f-53a8-b11d-1cf2bf832643', position = 9 where id = '1332dd17-5e7e-54dc-8dbe-79be570afd0d'; -- levantaron
update public.forms set unit_id = '00142c01-014f-53a8-b11d-1cf2bf832643', position = 10 where id = '5eb7105d-36a4-565f-a1b4-4b823b051c7d'; -- se levantó
update public.forms set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c', position = 1 where id = '0227f63a-bc4b-555b-872e-03c32b00a989'; -- suspendieron
update public.forms set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c', position = 2 where id = '0de95a87-df85-5ad0-a439-91ac9ce6b5f1'; -- suspendido
update public.forms set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c', position = 3 where id = '959560db-862d-5e61-981a-467e94ca45ef'; -- suspendida
update public.forms set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c', position = 4 where id = '9301bdcf-b8c6-53dc-9efe-e7339cd8c13d'; -- con normalidad
update public.forms set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c', position = 5 where id = '3a4fa6fe-8f09-528d-9967-ff8c9a9cce3b'; -- colectivero
update public.forms set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c', position = 6 where id = '4974591e-1da1-5b62-bef7-becc99d516ec'; -- colectiveros
update public.forms set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c', position = 7 where id = '8da773a0-0766-5b60-b795-ca83941b969b'; -- desvío
update public.forms set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c', position = 8 where id = '52bf8cf4-e7fc-58ff-b749-786b8f8eb68b'; -- desvíos
update public.forms set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c', position = 9 where id = '3c6ffd20-28f8-579f-b116-f570c6109326'; -- embotellamiento
update public.forms set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c', position = 10 where id = '6f1b3eb4-8ead-52f9-9ee6-7362111f1668'; -- apagón
update public.forms set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c', position = 11 where id = 'e4216b7d-08b2-5f03-a203-dac5d0b61ebc'; -- a pie
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '222d0f0c-fa22-5150-b415-00398764bfae';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'd7e4697e-d09c-550e-ab7c-c709170248cc';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '5740331c-54af-5f8f-9410-c0fe099cd8b8';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'ebf2e746-09f7-572b-baec-ffc8c4fa84c1';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'd9ff186e-f1f2-5132-acd4-1f8cea9fccd1';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '26ec2ef4-1ea6-5896-b6bb-4de91f24018a';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '3e94eb5d-82c3-5eb7-ada1-70f9e897b675';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '63035669-cd41-5d7b-ba2f-c2b978b0ff11';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '962bb185-a2ce-587d-a083-d7481ef93d94';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'd5dc1742-5597-5e8c-a8cf-4de71b3e99ff';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '36492986-ca4b-57a0-98a1-e5532744ecdf';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '59e3bb28-3aeb-526c-b080-f60257ed59d8';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '332d039c-a675-50c8-91a0-ac97335a26e6';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '579e0e3a-64f9-5b5f-a80f-b7067c405c5d';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '1fdda350-c349-5451-85bc-c450fe6cbd76';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '2ec8560c-0fc2-58bf-8e17-f1137eaf271e';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '29826626-1801-59da-98fa-192c18ac3542';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '95d5faa3-c399-5d4a-875e-e02fd4753d98';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '5af40c73-3d3c-5e70-8be6-ed153a050e9e';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '9dfe55fb-ecd7-508b-999c-30cee5f90b82';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '2435ab49-a1ad-5ec4-9252-efb3cd210587';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'f22e3665-c548-5be3-86db-876937714c9a';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '379da906-120a-5a3b-903e-bc81165cbb50';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '10a157c2-0b77-595a-bd13-24017eca8992';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '7c642afd-e186-512a-94cb-81743aa72657';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '0642a18e-6ba2-5de1-bcd6-d4bb32248032';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'd8e24f93-cc17-5b59-9ffb-1750a83d57b3';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '7f639f80-b4dd-51d8-aea6-265de7b3518d';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '0fef12bc-5dae-5527-b585-e5e1ee8eda88';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'c7407d59-6994-56f9-a499-fbd2b38edad2';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'ee515cd5-8e45-5a22-b34e-53beeb22149a';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '9f2338cf-1ff2-52eb-8ab1-8bc87def7d6a';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'a850d80e-1e53-5936-8cf5-c49b217550bf';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'c27f6523-03bd-5ee9-91e6-f1b57a279d24';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '0db8df7c-828b-5fe2-a697-a37f3d89cf94';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'f5272aab-5ed0-5303-b56b-431fd555571f';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '4b3511b0-fd24-5e18-b08e-ec8baae77514';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'e0c7aeb1-a642-56a2-8eaa-b551c10d16e8';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '40dcc300-7079-565c-9d26-ca1817564853';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '7cfd39e2-30b9-57cd-b0a0-d5541271dcf0';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '33e641ab-dc7f-507c-8adc-b7730a114ec1';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'bd9e6ffc-5690-5079-9e6d-0fec37feae11';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '606a7d54-ef85-51b0-b223-b4eb7eb01a8e';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'c1285ce6-63a9-5c4e-996e-0c6f7517b495';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'ee0f8f18-f2f2-5107-8abf-593ce15941bb';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '5a85d188-26a2-513f-93e7-434e370178d6';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '73c66c3c-da1d-5798-b5b7-ba69addaeb52';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '75dbfac2-51c9-5d5b-933b-e5910928a57f';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'fbe33dd9-a0e3-565f-bdee-027f7eba3fb1';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '1d5c9afd-5c5f-5544-9356-e9ca0cd6b12b';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'df18289b-0310-5290-9ef7-fdee1d2a9a8f';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '606cd689-ed88-5b1b-aee3-1811f8ffe0ac';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'd7ed9ab7-9af9-5696-bd50-2a4bdd8ffc81';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'de5c7623-eee1-539d-bcdf-1ba03e8d1349';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'f221e7db-5261-565f-9ed7-f8aaea1faa89';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '82fecf40-485a-59ec-8c31-81802bd013af';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '67a7ae22-13fa-5936-a308-f767396f6731';
update public.sentences set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = '123b6b86-0895-503d-8960-1bb7c71d1f0c';
update public.tips set unit_id = '6541e0d7-65ec-5bd1-8e0b-b56f654e875c' where id = 'ee61df72-edc1-551c-8a85-ffd52d0c70ad'; -- Levantaron el paro

-- fue-clausurado → fue-clausurado · hubo-un-incendio
update public.forms set unit_id = 'f02fa743-710e-5e6c-880b-e826a6c0056a', position = 3 where id = '84bfb98a-4d8d-567c-97aa-0c8ac1993fc3'; -- aprobado
update public.forms set unit_id = 'f02fa743-710e-5e6c-880b-e826a6c0056a', position = 4 where id = '83dfa0bb-2504-557c-a0cf-8e806766c652'; -- aprobada
update public.forms set unit_id = 'f02fa743-710e-5e6c-880b-e826a6c0056a', position = 5 where id = '8f8e0c97-1385-5eff-a844-9152c0379a1d'; -- elegido
update public.forms set unit_id = 'f02fa743-710e-5e6c-880b-e826a6c0056a', position = 6 where id = '3e587b69-e1b2-5d58-8da3-ae4eb94f2387'; -- elegida
update public.forms set unit_id = 'f02fa743-710e-5e6c-880b-e826a6c0056a', position = 7 where id = '42771043-218d-5736-b807-bc4b4a881a6a'; -- ley
update public.forms set unit_id = 'f02fa743-710e-5e6c-880b-e826a6c0056a', position = 8 where id = '7f2dc4a8-a647-5a20-85b1-eb01cea0988d'; -- obra
update public.forms set unit_id = '7b211507-68d1-54e4-94d7-a59303701477', position = 1 where id = '0238772c-9092-5836-9411-c19c19ce9157'; -- incendio
update public.forms set unit_id = '7b211507-68d1-54e4-94d7-a59303701477', position = 2 where id = 'c8d7179a-63a9-5be3-81e9-67d75547389e'; -- bombero
update public.forms set unit_id = '7b211507-68d1-54e4-94d7-a59303701477', position = 3 where id = '3f61b2cd-5db4-5797-a29f-00c46ba42821'; -- bomberos
update public.forms set unit_id = '7b211507-68d1-54e4-94d7-a59303701477', position = 4 where id = '5d83ad77-05fe-5332-b698-9ab891b4b03c'; -- herido
update public.forms set unit_id = '7b211507-68d1-54e4-94d7-a59303701477', position = 5 where id = '299e140f-4b60-599f-a8ae-be0e21fbc647'; -- heridos
update public.forms set unit_id = '7b211507-68d1-54e4-94d7-a59303701477', position = 6 where id = 'adba726c-4e9a-5e46-a8e0-4e5dc59e991a'; -- rescatados
update public.forms set unit_id = '7b211507-68d1-54e4-94d7-a59303701477', position = 7 where id = '0f2c53bc-07c7-51e7-870d-0786d46ea421'; -- rescatadas
update public.forms set unit_id = '7b211507-68d1-54e4-94d7-a59303701477', position = 8 where id = '30357209-e251-5a38-83d3-3514394cdbfc'; -- trasladado
update public.forms set unit_id = '7b211507-68d1-54e4-94d7-a59303701477', position = 9 where id = 'daf75243-b14f-58cd-82a6-4d507fd33380'; -- trasladados
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'fb05682c-08c5-525f-9d4a-7f545dab623f';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '2f425f6a-d729-5134-a316-4b2f4ce41ef3';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'db8d11c2-487c-5d87-8288-518be8c79f0f';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'aaf0764f-3bb0-5636-8f57-5f090a0bbcf6';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '324de1a9-231a-5243-a48e-7e6ead4226e6';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'c3e3ad56-17d9-511f-9d45-bf3ec9e69b82';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '00b61954-0cab-57da-99fa-e84e2ffbc9c3';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '39dfac66-154f-52de-b087-c77698b5eeee';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'cce66c43-d466-5686-9e00-c6c1ea4f5544';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'c0205ee9-0419-5b2a-83ad-bee49f571a48';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '164137e1-fadd-5aeb-bb3f-b03ec3392d2a';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'a7d8f2f3-5d7c-5722-84b9-0a9e0f9a5afa';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '0bf1e7ca-9658-526a-b3cd-53438857ba35';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'e10cfdd2-7594-58c0-85f0-5c6b970c249e';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'ba2b44d8-1500-5b5b-8e11-fba6ec2c2e35';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '72a535e6-f04d-5e4a-bb0a-eff3ed46a8fb';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '17c3757e-f0ef-5d1f-979f-e8cc8bbda980';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '64bded04-de01-544d-aa00-1f0f806b3a19';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'de4214ca-2618-5a2f-acb2-7ad298a8ef1d';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'e53fead2-74ef-5ab5-94ab-1abe5bee7661';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'd8109e5d-35dc-5956-ad10-af934ed336e5';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '71ccf5fc-159c-5487-836f-7b506d425223';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '04870ab9-c8cf-5925-9560-4ceebad1ba9e';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '8bf41954-5f79-53d9-97ca-fedefebe845c';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '7be17f21-f1a4-556a-af4a-b287517e38fc';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'f63d7d30-9ca2-5612-99a5-e59f43524c65';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '84bc1a09-3c9e-5368-bfd3-ffba4069108e';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '99edfc48-9997-55a1-b672-110e6dd20fed';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'be7d1cff-5444-5582-b63a-f7003b583be7';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '6bd0a3fd-eca4-542c-8816-b4f4d7d50e75';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '3743d64f-c0ef-50f1-aee4-814e4f43d20d';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '0a9f74d7-aff0-5d29-9092-470385c5d60c';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'b2268759-12fe-52c8-ae3d-f06eec86d9ab';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'c7a53d90-5a0a-5be7-8b97-3df99a140ecf';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '7ce7fdd1-3221-5f92-a629-bb5a91d0b3f5';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '35818202-c392-50ee-8d24-b6acd7624eea';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '62d8eb6e-412d-5b57-925b-84fc77daaa2f';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'd5d0ad50-0f6e-5cd6-bf35-64ba873c99fa';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = 'd1c37ef8-2b30-528a-a8b9-9cdc823444ae';
update public.sentences set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '13d803ff-c843-58cc-b9ca-051798fcfdde';
update public.tips set unit_id = '7b211507-68d1-54e4-94d7-a59303701477' where id = '27c30a60-8fbf-5356-81aa-cc1f86051cbc'; -- Hubo un incendio

-- las-elecciones → las-elecciones · mi-candidata-gano
update public.forms set unit_id = '38d68ef5-9223-5ff2-8954-88f3a9cc0ef3', position = 4 where id = '45fad04d-f988-5d97-b9fa-2993a8c7d6a7'; -- votamos
update public.forms set unit_id = '38d68ef5-9223-5ff2-8954-88f3a9cc0ef3', position = 5 where id = '713bea82-6892-52de-b8e6-0d56b2881c5c'; -- votó
update public.forms set unit_id = '38d68ef5-9223-5ff2-8954-88f3a9cc0ef3', position = 6 where id = '79463fbe-85a4-5bd1-bcf2-e62daa99cc7f'; -- votás
update public.forms set unit_id = '38d68ef5-9223-5ff2-8954-88f3a9cc0ef3', position = 7 where id = 'bb1919a8-41ea-5104-9716-4dd9eeee5f4a'; -- elecciones
update public.forms set unit_id = '38d68ef5-9223-5ff2-8954-88f3a9cc0ef3', position = 8 where id = '4055cf11-611b-55c7-8d80-5a1d41fa938c'; -- voto
update public.forms set unit_id = '38d68ef5-9223-5ff2-8954-88f3a9cc0ef3', position = 9 where id = '6ecf048c-bb2f-5574-bd3f-396c3ef26895'; -- veda
update public.forms set unit_id = '38d68ef5-9223-5ff2-8954-88f3a9cc0ef3', position = 10 where id = '7e381513-cde1-54ce-a89f-d342c2b8916a'; -- llamaron
update public.forms set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c', position = 1 where id = '5f031d82-bdba-5344-b228-97c47d8e3e86'; -- candidato
update public.forms set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c', position = 2 where id = 'f5aa9abd-9e57-5c63-85f7-f7921b99e132'; -- candidata
update public.forms set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c', position = 3 where id = '55e9c7e5-cdc2-5c51-928d-3a87e4d434ee'; -- gobierno
update public.forms set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c', position = 4 where id = '2d1ce407-00f5-5c23-ada8-ad1f59734d6b'; -- presidente
update public.forms set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c', position = 5 where id = '02b2f8dd-8a6a-5897-8064-03fbd66ff380'; -- presidenta
update public.forms set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c', position = 6 where id = 'abc71752-2ec1-5a0e-9ec8-98aaff800589'; -- debate
update public.forms set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c', position = 7 where id = '5fac1d07-4bd0-501d-aa94-950e07176f42'; -- resultados
update public.forms set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c', position = 8 where id = '99bc562b-dd7a-5932-8360-42157fd8f122'; -- resultado
update public.forms set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c', position = 9 where id = '76b93eae-5414-5fcf-9c89-f0e154524296'; -- balotaje
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'fa8b7e9f-55c1-5a4c-82a8-a5c8e65aca35';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'f9d64e74-e32d-56ab-a408-acd50bcb40c8';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '2141e8b1-3f1a-57bc-836d-b1653f646cf4';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '314447f0-17b8-5a4c-bb96-a6caa2f6a3c6';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '74c04601-2fe7-5a30-aa0b-c76d7b529b2a';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '3d8cb1e1-d5cd-5f6b-9733-b44d0097e8ee';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '783033b0-2923-5023-8ddb-c0a9f75d5a80';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'f3d764bf-b211-5978-9982-99f0a70635cf';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'f43ce0ab-65f9-5ae2-baa5-14396c94e5fd';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '6a517d41-07d3-535d-89b2-e207963bdad3';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'f33e64ea-f70b-5c00-bf14-2a4379cdbe37';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '2d7d3407-2955-5a25-add0-6188950547a9';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '88043b24-dca4-576d-9b6f-b7396543d49a';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '4f267091-9f68-5e38-8264-a0edec8428aa';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '8d5fa7fa-25cd-587c-9fa9-be97ab2e2f68';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '901f1265-d369-5b19-bc03-4d134b939c77';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '427f93fc-360d-5e23-aaa8-833f3355a3e7';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '1ffbc5f6-5369-5479-b6c5-d5e7030f9489';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'f8f7e013-adeb-5f3b-81e1-4ff59c16e68c';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'd1fe66d0-d227-561e-b7ac-8a40be800ed7';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '9d0e5151-31f2-57f5-bde9-f26a4c905b7d';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'a95b6322-173c-5f55-9554-99f6ca3a7199';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '4fbe8d06-614d-5103-9459-6cd450462ba9';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '704013cc-6202-5cdd-aaaf-5828f998bce8';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'e1d7ae22-aaaf-5a5e-9f61-b1070a1abd20';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '2dd422f6-282a-5421-99b3-94a2c9967ec0';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'a30c7b23-c70b-512c-baff-a7ff1746664f';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'c7d6dd12-e6aa-5bb7-bf4a-ae9252c29d2e';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '30be4c12-5d51-5132-b65f-257e8b0ff4bf';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'b5df4974-dcfd-5b18-b25f-bc7f434f8cfb';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '5858d6dc-aecf-516a-ae95-8f0c6c2c5e7e';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'b34cdeb0-6a06-5adc-9a5e-e86a30084b7c';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '53b66306-ef6a-531f-aff2-52ad310c624c';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '1749a7d5-c219-57da-ba84-5ec9f6d0b3e1';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '4df9fceb-d03b-5fe7-8c89-4c0d139a07d4';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '974731fa-3188-5480-981e-f1f4bb7f4f26';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'ed629ee3-c757-5a3c-8061-979f2216152f';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'c44b8c0e-5b7e-50e3-8824-83dde0eadcb5';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '38853ae9-cf09-5314-8fc0-6c780bc855f4';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '693002b3-d589-5a1a-85fd-ea2d97ce1223';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '480526a3-efab-5d6f-bea1-fe9d752905b8';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'f0352414-4410-5c1b-9ea9-5434a0230232';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '2e5e2a07-8726-5568-9078-1706990985a3';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'a34b9963-7d6c-53ae-8031-f651398a4f69';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '09dc2c3c-0c70-5977-8178-e960c312e29b';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'e39365ac-adcf-5c97-bf6b-49ae49cfff7c';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'e86394a4-9d7f-55aa-906d-131701ec8e33';
update public.sentences set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = '8de9c8f0-9947-57b3-a2c3-8f87d7ea5586';
update public.tips set unit_id = '7c097208-fa5b-5234-94cf-6a12dbc2625c' where id = 'eac6d092-ac6a-51cb-ad45-36a8a79f1e96'; -- Las elecciones

-- segun-el-diario → segun-el-diario · rumor-o-verso
update public.forms set unit_id = 'd7836b8d-78b8-51ae-8e41-57e6f2d5de34', position = 2 where id = '4d468fdd-4abf-5c63-b274-afc93c52001e'; -- noticiero
update public.forms set unit_id = 'd7836b8d-78b8-51ae-8e41-57e6f2d5de34', position = 3 where id = '1a30d9a9-1b5b-5544-80c0-2c824fa88000'; -- titular
update public.forms set unit_id = 'd7836b8d-78b8-51ae-8e41-57e6f2d5de34', position = 4 where id = '309625a9-5801-5aa3-8637-4c34fa1c6bb2'; -- titulares
update public.forms set unit_id = 'd7836b8d-78b8-51ae-8e41-57e6f2d5de34', position = 5 where id = '74ae6c1e-07d7-57eb-aba1-5ad0566b9b6a'; -- fuente
update public.forms set unit_id = 'd7836b8d-78b8-51ae-8e41-57e6f2d5de34', position = 6 where id = '352aa38d-1284-5794-aae5-f314a93a6d8e'; -- al parecer
update public.forms set unit_id = 'd7836b8d-78b8-51ae-8e41-57e6f2d5de34', position = 7 where id = '2a1cace7-6310-5206-8b9e-587ab97e00eb'; -- supuestamente
update public.forms set unit_id = 'd7836b8d-78b8-51ae-8e41-57e6f2d5de34', position = 8 where id = 'f1ca69e1-5b30-5c26-b680-02e3e119c61f'; -- aparentemente
update public.forms set unit_id = '938640f0-639b-5230-971f-936f57632aa0', position = 1 where id = '8b66912a-4e30-5031-a0a8-da1e8c9cb65e'; -- rumor
update public.forms set unit_id = '938640f0-639b-5230-971f-936f57632aa0', position = 2 where id = 'daa700e3-1ff4-51d6-b50d-ccc640d33175'; -- verso
update public.forms set unit_id = '938640f0-639b-5230-971f-936f57632aa0', position = 3 where id = 'c2bf0695-e5bb-5452-8810-d8563e93e4a8'; -- cadena
update public.forms set unit_id = '938640f0-639b-5230-971f-936f57632aa0', position = 4 where id = '56760a9d-c96b-5fa7-9dc9-1123eae02a47'; -- confirmó
update public.forms set unit_id = '938640f0-639b-5230-971f-936f57632aa0', position = 5 where id = 'c3d1dbfe-0b58-518a-a3f2-b84da2b789cd'; -- confirmaron
update public.forms set unit_id = '938640f0-639b-5230-971f-936f57632aa0', position = 6 where id = '17ce2d5c-6502-5fa6-b953-1d425216f6f1'; -- desmintió
update public.forms set unit_id = '938640f0-639b-5230-971f-936f57632aa0', position = 7 where id = '64043197-59da-5253-b49f-3b41fc22abec'; -- desmintieron
update public.forms set unit_id = '938640f0-639b-5230-971f-936f57632aa0', position = 8 where id = '87bad301-edbe-5d78-aa8c-adc17653305c'; -- oficial
update public.forms set unit_id = '938640f0-639b-5230-971f-936f57632aa0', position = 9 where id = 'ca224971-f15e-5bd7-84a2-d35cf14c5fb4'; -- versión
update public.forms set unit_id = '938640f0-639b-5230-971f-936f57632aa0', position = 10 where id = '6c654f0a-c53a-5cb9-ac25-4c400e2b8298'; -- compartirlo
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '7f843b33-ba83-57e1-bb4e-87cbe3b256fd';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'a9016af7-1c9e-5894-93a3-287ee3e5871b';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'c803c2c5-8126-5b43-91c4-da9407025c3f';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '6fc82027-7da2-52fa-9c24-fba6b8cd034b';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '2afae778-44cd-549d-918f-ab035273d788';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '17b2775f-99ef-5c2a-8855-34abd4d2dec6';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '4e1cf479-5641-50ba-9176-52ffad03869b';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '783974df-b6b4-512e-89ad-b432543c5f26';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'adf54707-3bdd-5742-87e1-983ca9ad78a7';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '12fc41ee-c498-56bd-92fd-3b036c6b81b8';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '95318499-39d9-5c2f-b5c8-897b75682ccb';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '01ce2816-2b8b-5e99-a97a-6ae2f0f3dd25';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '20253c7f-f9a1-5e3e-886f-b7662a1690f3';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'fd08dadc-6434-5ecd-b127-e221cd7014f6';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '0e4a188d-7bc3-5380-92e8-ba984483980c';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '92f0deba-3137-5a1d-9ab6-7afc6852d40f';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '2df16118-718d-56bf-a1ac-a8f19c112a98';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'a12ecb68-dd2d-5c3b-882f-6a2d5589c10a';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'b17b7d2e-2e6b-54be-8909-f20091fc08ec';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '77681ea8-6bec-529e-b7b6-4a59a1b1ad64';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'ae24ad19-d6bf-54b9-a122-feb0d29e3357';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '3cad4a3c-c00b-5a4b-a2b7-d50d9ba64cfd';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'c074d40e-e23b-555d-8aaf-1e0ef025f7c6';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '6701c823-05c5-511c-86d4-ed771d5e2f1a';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'dbbf13aa-8012-5a55-8929-91241efbac3b';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '14f43a3d-4479-5eaf-9076-8b1a404e4294';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '4ffed261-be75-5741-8ba6-3191ddc1c1bb';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '507dd219-c929-5aa1-b6ef-9ed5386dfc46';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '9e69d2db-95d6-53d0-9edf-96230d5c1667';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'e70687c2-d107-5129-afd2-d37096a03396';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'e9d2e841-edf8-5f99-8952-04ffe9e9bb13';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '8b6ceaae-5ce9-5ce7-b405-56af355d038e';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '8504506a-d2d9-57e8-8b7b-d190b6dea6ca';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '9ceafe65-be8e-5f84-b3bf-f09a2c858ad9';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '34f49b5f-c56f-5871-98bb-b04aa67e0d0e';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '4feeff89-f295-5e6a-9977-e476e84474e9';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '0486cc5c-3f28-5104-a6a7-81abe0da6abd';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'd8926566-d294-5999-b278-cfa95d7d1d8f';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '920aaa41-7afa-51e5-a65e-cfe7779ef935';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '4fd72d17-7fa9-5ed7-a507-491b2cc81b8a';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'beaece94-c6ba-53d2-a3ee-68ae6f096e28';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '7ab4fec5-8ae7-50e3-90a7-f74dbd94dc4f';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '8e1441ba-87a5-544d-8565-289ff86d57a4';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '337f8b6d-985b-5f0b-bb0b-8a082849b7b7';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '05be0bef-596d-551a-a7c8-5be0ffe894dc';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'c20735a0-c059-5e5a-8875-38887f508287';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'c8f2dc18-3fa2-5fd0-9c6f-5408f874d4fb';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '67fba673-360d-5de4-8a3b-17285db37399';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '7c33b44b-b436-5dd0-b908-49297bbc28d0';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '015d6474-b894-5192-8538-89b9a7d92d59';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'd208cbb0-37fd-5bb7-b062-86c962753b3c';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'd62c5f1d-4c42-531c-a21a-a8f5e90d54f7';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '31a4428c-bfcc-5a62-9b31-3a5be88dbd83';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '5595f2cc-edf6-55e2-b2d1-174d1890b290';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '68e625f4-271c-5d02-ab5e-5a2272af113d';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '72f8752f-97fe-5af8-8b87-42ef19ec8494';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '2521ee52-f069-5f5e-978d-54a0c80f9a25';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'd1708fd8-dfa7-5b08-8c04-deac82630d58';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '89bb9546-3523-54a6-9476-09f1d2ebbf6a';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '9f6b3ddc-8426-5c87-9d17-a5f27857fa4d';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'b7cca98f-21fa-5c64-bcf3-f5dca07320f9';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '956c2178-3c25-59ba-96ae-d7426bd63d0e';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '2addac41-6a5f-53d3-a1f6-f0cae6d629f3';
update public.sentences set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = 'f763dbb9-2cbf-5966-92d8-5d63dc477d33';
update public.tips set unit_id = '938640f0-639b-5230-971f-936f57632aa0' where id = '3ff85211-a894-5d45-b66e-973838dc3d86'; -- ¿Rumor o verso?

-- lo-lindo-de-la-ciudad → lo-lindo-de-la-ciudad · tiene-sus-cosas
update public.units set title_en = 'Say the good and the bad of the city', summary_en = 'Lo lindo es que siempre hay algo para hacer' where id = 'c18ed3f6-ae4d-50fd-b360-6d7e7d73144c';
update public.forms set unit_id = 'c18ed3f6-ae4d-50fd-b360-6d7e7d73144c', position = 3 where id = 'c060c645-0ac2-5761-87b5-b5f2076f2e4b'; -- lo bueno
update public.forms set unit_id = 'c18ed3f6-ae4d-50fd-b360-6d7e7d73144c', position = 4 where id = '33cf114f-1567-59a4-ab02-9e71dcb263e9'; -- lo malo
update public.forms set unit_id = 'c18ed3f6-ae4d-50fd-b360-6d7e7d73144c', position = 5 where id = 'bc354dbc-e31d-5312-8916-e387f755bb53'; -- lo mejor
update public.forms set unit_id = 'c18ed3f6-ae4d-50fd-b360-6d7e7d73144c', position = 6 where id = '31b4179d-550f-5722-97b1-9f8ab5f5f176'; -- lo peor
update public.forms set unit_id = 'c18ed3f6-ae4d-50fd-b360-6d7e7d73144c', position = 7 where id = '39f19d1b-940d-54a5-b7de-9bb58377e02b'; -- lo difícil
update public.forms set unit_id = 'c18ed3f6-ae4d-50fd-b360-6d7e7d73144c', position = 8 where id = 'c19b6bd5-44a4-59fc-bd0f-c68de6fa4ea4'; -- lo único
update public.forms set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3', position = 1 where id = '7a612021-a496-53a6-b2f5-b0d9577ad459'; -- lo más
update public.forms set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3', position = 2 where id = 'e428f360-21f1-532f-92a3-607cc76118f7'; -- lo que más
update public.forms set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3', position = 3 where id = '9afc072b-9be7-5f59-b084-bdbd7413453e'; -- lo que menos
update public.forms set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3', position = 4 where id = '37a0f086-a50d-5ed9-a73e-fe0fc3eaedbe'; -- tiene sus cosas
update public.forms set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3', position = 5 where id = 'c8a7e936-0f98-572f-b69d-e72f8c805a0b'; -- inseguridad
update public.forms set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3', position = 6 where id = 'c9359d60-ce3e-5471-a2a5-37ead4d32235'; -- costo de vida
update public.forms set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3', position = 7 where id = 'cf9277ff-8d7f-5a38-8122-2bd445b4af81'; -- calidad de vida
update public.forms set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3', position = 8 where id = '32f48c07-1f50-5c25-8ec0-6292a3e12534'; -- a la vez
update public.forms set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3', position = 9 where id = '3d07fcda-4e86-5f42-be23-a6b35c65ec00'; -- comparado con
update public.forms set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3', position = 10 where id = '50dfcf60-f407-5ec9-82bc-b9726419a18a'; -- no hay nada como
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '94f19132-1daa-53b5-b8c2-f2aeb68ad8a2';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '20a54c0f-fe37-555d-a120-d91a4e0ad75a';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '982bf236-a350-52c0-b11d-53830f599f84';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '3cfda42c-07c0-513d-9af8-7ad01426c168';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'b77c1ba5-1be9-5f28-af59-4e2710b02e8f';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'aa7f47a0-b7eb-57df-9b81-55257cbf203e';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '28d847bc-b801-5923-9194-cf073ad18dc5';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '5522f6fd-f7c5-5b83-a758-a96381269737';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'e2f14de7-c9ff-5504-bf5e-ec19edc4912e';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '91168b63-7d34-5e99-8112-a1c543f508cb';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '519763e6-e515-5032-95a7-eec704c411b0';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '4f660657-a18a-5c58-869f-1a1fa3a8b1db';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '7b426a5e-20f4-5181-839a-dc7c769bd491';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'fa2c516d-9e9d-58cd-952a-2869b956d2d3';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '9bcce7ce-8857-5d79-ada0-8336ab42638b';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '3b1dbb4c-ba97-5c02-b3b2-4d97843b4424';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '57da7b99-78cf-5291-a949-697afdf94531';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'e3999343-ad98-5250-85da-1ff7e63c36e7';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '3c095c00-46fb-56ba-b133-c988fa580f7f';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'c5072317-f976-52bc-91cb-012633c16aa7';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '3e7110d9-3d56-5ad6-9077-fdf07645e750';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '60ce3e99-9437-5525-a058-f1594eb18620';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '308eadf6-5f09-54e0-8c87-7ce2511d3932';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'e536b651-0227-5776-995a-c25bccff596b';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '7f97ec55-927d-5df9-b984-bb69015f9f18';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'fd87b127-c4d1-5ec3-bb0c-5071a9cd8c32';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'cf3d32ba-09db-5b98-839c-dc458704e786';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'd5be32be-f3f8-5d02-aab6-7d2b4ee50548';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'f8cc41f6-5117-5f81-b78b-85058f17d95e';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '7fa7ac93-824c-567e-80d0-b0ed9521661f';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '5c31b97e-2df2-5738-aba3-88a3fca7231a';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'da73e066-af90-53f7-82eb-39766833cfe0';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'b005fbdb-f55f-56a1-9293-ced73585d72e';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '8d75a242-9302-5453-885e-010e2cdc4089';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '1b02c34e-69f1-5e74-95d3-812c2e478771';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '4f7b546b-19f1-5388-8114-459daebeaf9f';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '56e165b2-4541-54f0-a82a-edaa81e89d09';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '5dd49c37-6fb4-565d-bcd3-56d0e7b61383';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'f4acb7c5-0dd5-5880-8814-ca455ea64fdd';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '7b2fc7f8-3ef3-5762-bb6e-d05bd49e8601';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '4f615875-a4c2-56f1-96e1-13cf19b6167b';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'c714dec4-24f7-5c5c-a3a8-6e5ace8e5046';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'cb5054ef-9b17-5235-878d-742c6d72cf12';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '7d12c343-cd8b-50b6-a691-4574e46d0ac5';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'fa3068aa-221d-58c5-8671-0a0ab987d265';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'f7a7e6a4-2d39-5d63-9e22-3eb88078a4a8';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'd2375af5-bf98-571f-8c49-d8bdded29f3e';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'd56b6412-946a-5033-a205-80cf3ef89e58';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '9196643a-5c4a-5c67-9bd8-b0b9baeb1644';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '026c9e95-8aaa-5a40-8fb7-b5cf4a5135f4';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'f316179b-3fc7-5c92-bd9a-87b27be53a95';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = '258f05cd-d25f-5b3e-b86b-a3707ee978aa';
update public.sentences set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'ec566a8b-2816-562c-8ba6-a110adfc6239';
update public.tips set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'a1c0dd99-f02a-5bad-9b95-50478e5f3daa'; -- Lo que más, lo más
update public.tips set unit_id = '182789d0-2599-55ab-8391-4d0c4eccd8e3' where id = 'a75b10b9-a779-55fa-ae70-312528aa56c8'; -- Tiene sus cosas

-- no-es-que-no-me-guste → no-es-que-no-me-guste · gracias-por-invitarme
update public.units set title_en = 'Explain why you can''t make it', summary_en = 'No es que no me interese, es que no llego' where id = '5c5f55d2-b389-5e93-94b9-3eb2897e1055';
update public.forms set unit_id = '5c5f55d2-b389-5e93-94b9-3eb2897e1055', position = 1 where id = '7fb8e656-78ca-5486-acc9-5a00aefc798f'; -- interese
update public.forms set unit_id = '5c5f55d2-b389-5e93-94b9-3eb2897e1055', position = 2 where id = '9bdd92ed-598c-54d8-a4a1-48a99a395e2b'; -- importe
update public.forms set unit_id = '5c5f55d2-b389-5e93-94b9-3eb2897e1055', position = 7 where id = 'aeeb7d58-6684-5cbf-ba1d-c2888dde2fc0'; -- compromiso
update public.forms set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03', position = 1 where id = '1188dd05-e305-5f64-8c43-63bd60f1b438'; -- invitación
update public.forms set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03', position = 2 where id = '719141ac-e64d-51ae-a7e3-007d08f24eb6'; -- invitaciones
update public.forms set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03', position = 3 where id = '29c2ef41-99dc-5639-b331-db271d929830'; -- rechazar
update public.forms set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03', position = 4 where id = 'd7394388-9f3c-5674-9849-7c0422b27265'; -- rechacé
update public.forms set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03', position = 5 where id = '7ebbd82a-5f44-517c-b016-fc2b965add0d'; -- decir que no
update public.forms set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03', position = 6 where id = '56959858-fd6d-5e44-9b35-4190b7c477af'; -- quedar mal
update public.forms set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03', position = 7 where id = '53492982-6b14-52ea-b8ea-2b7ac9c0955c'; -- quedo mal
update public.forms set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03', position = 8 where id = 'e0459d34-e394-5423-9062-f7319daf46db'; -- gracias por invitarme
update public.forms set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03', position = 9 where id = '75d7d6fc-5914-5070-89e7-66fcdb8e89b6'; -- la próxima
update public.forms set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03', position = 10 where id = '1bcdac9b-0bb1-564b-a697-8791ced9fe40'; -- otro día
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'a50dbef9-1600-5ce8-bb06-b929d42d01f2';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '0d7cc2f3-6129-569c-9d4e-a464d64ba495';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'adaaf513-2b37-5898-b6f0-69c90b22ae79';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '526a0238-8e8e-5de3-ac8d-c9591f855b7e';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '986ce5d4-334c-505d-9df9-ce0b7c9ded7f';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '10cafd6d-c421-5950-9538-e6e1f1c00763';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '475f855d-2b86-587f-bbdd-457d3a517a72';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '48098500-e158-5850-9dfb-8bb68e7f141e';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '1db0fdbe-519b-56b7-8044-f80c5f5aca3d';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'cb0713a4-0067-555f-a2f0-a11834d3c0ab';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'a37aed27-c7b9-5e58-84a6-507b3087a5d6';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '6e94f1b3-e686-5182-95bf-005ff287e6ab';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'e8fbbb0e-82d8-509c-8d2b-86f9846fe2ca';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '3617b542-7a15-5bfa-82a6-5e1ea82d5036';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'e21c0b28-7deb-5cb5-91f6-6e0020314f95';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '0c0fde12-91c6-5e95-8955-a8a737b93e68';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '5d71d2e1-17cd-5a60-a8db-14aaaa05214e';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'e4cf9390-4bd3-5eb2-9f96-6e11e8253bc5';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'b6430222-6c7f-5079-91d5-ff78c9eb7835';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '591533a5-c74e-5a3e-97cb-31094ceaa6d5';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'e01f7a68-afd8-5e94-83f1-c6e24d1d7d91';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'f69e0512-7381-5f32-9b43-13dde99f12b7';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '78f4c142-8041-5966-a407-ad3a643c5b2f';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'b6e649ab-56c9-57c5-96b4-5652b695126f';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'ee873cdc-3359-54ff-b17f-4a52906e43f0';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '21882980-525e-5ab7-bb2b-bd399371e00e';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '4849120c-f769-57f9-95f3-a270b777be79';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '2e1f1db4-0d3e-5eae-b5de-8d2ea826f082';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '9e38102c-2d16-5e85-b8bb-1fde92ad46aa';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'f4b6f37f-41b0-56f5-ba6d-78f7dfb24441';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'bfc2e9ea-23f2-5d5f-acb9-8ecc709852ee';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '2d77cf97-969e-5407-9bba-3c8b3271e835';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'cc0fe7ab-0709-5ae7-b088-8151c611b8aa';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '1d7f5f1d-6010-5b38-9e55-7c5726bace71';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '04efb597-fc0b-5f9d-98b2-5da8cda047fe';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'ca5cb31b-2666-5348-8ce7-6f63a9b8db46';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'f7e4ac7d-0f4e-5e23-845c-4e47ba12091f';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'e90add84-1f1e-579f-81f6-856866df144e';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'ebcbb910-c1f7-5b8e-bd49-56aa4e953aff';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '83a1f33e-82e5-53db-867e-319924f0d9d7';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '2051ea40-b024-5388-91a4-38bb4e10377f';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'a460911e-c7bf-52e6-bac2-33adac7e1006';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'a53d70f0-eb94-5f5c-a9a9-b1b60d058e82';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'c56fcf1e-bea7-5fbc-8aca-8494f5b9688c';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '083d1bad-87e6-526f-a064-179c3f6b9020';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '4cd221f2-3a7b-5c8c-924d-3d88ac46ad81';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '6326aa33-ae79-5c43-97a8-db0da664b31f';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '82d7dd55-49a2-5e1a-8e00-e3a786d43a50';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '92fc710b-deeb-509a-9c44-ac13f0663df6';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '768bfc1f-816e-549b-b955-457d76acd9bf';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'de2fe07f-0e09-5dbb-9582-9f90b53b6251';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'd5c994e2-49b0-57d0-9ca6-3e62d5b13a2d';
update public.sentences set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = '87f5477d-8e8c-5ac3-bb5a-2e8b37007302';
update public.tips set unit_id = '4a02b83c-2619-593d-8fd6-44d5ffb8aa03' where id = 'cc5e231d-b0ac-5861-be50-d1802854aad9'; -- Saying no without quedar mal

-- si-hubiera-ahorrado → si-hubiera-ahorrado · a-esta-altura
update public.units set title_en = 'Imagine a different past', summary_en = 'Ojalá hubiera ahorrado más' where id = 'd1ef9d43-816d-571d-a8ba-4ba76a09ba2d';
update public.forms set unit_id = 'd1ef9d43-816d-571d-a8ba-4ba76a09ba2d', position = 1 where id = '2c64c429-8772-569c-b8e7-31e85b0be687'; -- ahorrado
update public.forms set unit_id = 'd1ef9d43-816d-571d-a8ba-4ba76a09ba2d', position = 2 where id = '7e9e05ea-238c-5c7f-9fab-5ced943464fe'; -- ahorros
update public.forms set unit_id = 'd1ef9d43-816d-571d-a8ba-4ba76a09ba2d', position = 5 where id = '1561ff4a-daea-51ca-b9d9-85a426be6816'; -- invertido
update public.forms set unit_id = 'd1ef9d43-816d-571d-a8ba-4ba76a09ba2d', position = 6 where id = '9c9fa167-c18c-571d-82aa-24e3a907d58e'; -- aceptado
update public.forms set unit_id = 'd1ef9d43-816d-571d-a8ba-4ba76a09ba2d', position = 7 where id = '1447110b-7ffa-5862-a0dd-598f4bea012e'; -- dejado
update public.forms set unit_id = 'd1ef9d43-816d-571d-a8ba-4ba76a09ba2d', position = 8 where id = '052ed804-ae57-5bc0-abeb-516ea0401c95'; -- aprendido
update public.forms set unit_id = 'd1ef9d43-816d-571d-a8ba-4ba76a09ba2d', position = 9 where id = 'afee414c-10eb-572a-b6b7-01fd1b37f1c5'; -- mudado
update public.forms set unit_id = 'd1ef9d43-816d-571d-a8ba-4ba76a09ba2d', position = 10 where id = 'b884c4e1-3189-5874-a25a-674ad173d671'; -- puesto
update public.forms set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f', position = 1 where id = '752735e3-de4e-5f1c-8e32-929a5e55bcf6'; -- estaríamos
update public.forms set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f', position = 2 where id = '91487a14-aef2-5b4c-8590-471ca12516c5'; -- estarías
update public.forms set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f', position = 3 where id = 'fc09ba4b-1d2b-529a-a5b9-c6f5acea7446'; -- estaría
update public.forms set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f', position = 4 where id = 'a61e38e3-a3c6-589c-a580-19de2879e4ee'; -- serías
update public.forms set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f', position = 5 where id = 'f7037f0a-9270-5543-be5a-981abadac9c9'; -- tendríamos
update public.forms set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f', position = 6 where id = 'e5abf23b-67c6-5029-a031-c9b60075ae7c'; -- sabrías
update public.forms set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f', position = 7 where id = '2ea32e0f-9f33-574a-893b-248444e3fa3b'; -- habría
update public.forms set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f', position = 8 where id = '995571f6-add4-5a48-9aa3-303caf7fdcbf'; -- a esta altura
update public.forms set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f', position = 9 where id = '4cc5e69e-c6a2-508b-a797-c08978c81935'; -- medicina
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'bb2c4cff-4e12-5eaf-a7e0-489bdfd832e7';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'ec9f0021-c0a9-5392-b2ef-922a0b244c76';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '557167c0-a0e7-56d7-8287-ba27a68a9813';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'aa31a0de-1d87-55ae-a313-89db0ad4c9c8';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'cda3a211-5d58-56e2-b0a9-74223f0ee392';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '08682187-de95-530f-af91-f6aa9257eb23';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'da73000d-69ae-5985-9751-ca396e1680fc';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'cce4429d-e622-5bf6-ad33-0dff09ec450e';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'ffaffbab-03fa-59d6-8d39-41624cb8b283';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '2b095453-0a4a-565d-9b0f-8605244f706b';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'd6724d39-47a5-53ea-8fc1-b670d5501fbb';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '5ed7acf8-87d7-5f5e-9997-d6bcef708e96';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '4cd50223-06ed-5aaa-9e21-688e453708b3';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'a488b278-379e-5fe3-9f52-1c18a634028e';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '30e70fcb-a09e-5a76-b501-4e70e04cc66a';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '7b3bc0e2-e146-5628-8d7b-816d5179d94a';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '790c8fd9-0af2-5276-a025-74a83ebe601a';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'c9af9f4d-bf63-5a37-8ff7-bef562ae5834';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '76ec290d-0fe7-5cee-9a9c-af933c3eccf9';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '3f1115cc-13ac-59fa-aab0-afc2373b5eb1';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'c8e762c6-732e-5b5c-a32c-8303b432d8d1';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '8a1e0bcb-da99-5a54-a9aa-edb9546b2dd5';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '9a78a330-dfea-5bdb-af93-0ab5e9b3f66b';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'cb22655c-a779-5ffe-ac9d-1497ed30dc7a';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '6fecf0fb-a9b7-5ac5-a36f-951648056eaf';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '4707e9b8-d346-5ff9-ab06-5603edbba5e8';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '9753feae-f6ea-597b-8288-3b0e4b5898ef';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '81ba97f7-8089-5bf8-a311-cfb62ab3ae64';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '6ef85a3f-0e41-50b5-9e49-e5be4377a06f';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'a04655d9-dfba-5462-a096-564833a0a968';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '76e92675-8bc8-5210-8221-96bd175b438b';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'b3ab7823-f66b-521a-b5ac-db5ad1623274';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '7a4bfd7f-bd27-5fff-b2ed-6eaca60bb543';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '91cc227b-f2a6-5baf-8ecf-b432ce59012a';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'fc0a8fbb-d8b3-5f7c-b74a-5b878edd090e';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '04b9ec78-384a-5000-bdce-c7e47b127931';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '5620eb46-466f-5aea-963b-85dbe4ca47e7';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'a90501e1-895a-57ad-9362-09f2a5f8e255';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'b464ac9a-7911-5cf2-85ed-c8ab1097cbc9';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '80b38590-d38f-5340-a2bd-3250e5d80946';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'a6d5ecd1-c950-52db-9cc2-345bd30129bf';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'c66899b9-3e28-5322-b725-5fe71abe0e43';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '00809cf5-218c-5fd5-94e3-a7758f98965f';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'c39eba42-9c18-5c86-8542-efac768364ce';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'f7fbc4a9-4aa0-5907-9cff-0ff036816ef9';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'd1ab8736-a009-5dad-b9ac-e7f81a56e5ae';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '34aecb11-d73e-5164-82cb-b555717a1903';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '896c5963-05ea-579d-a3fd-1ce0539b17e4';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '6a11d684-8b04-5045-b68b-c5cdc5bcd3a8';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'a23fea29-8cb7-51dc-87ec-5657a7271d4a';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'd98962fe-eb93-5d48-90a5-0e8696dd40a7';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '1c9ae706-6206-5c73-a7d1-a1c67686872f';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '7f68b1d1-975d-5f22-aa59-a9ffeaca5235';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'dbbf8f80-0376-5e81-9754-df4f2b0e96cb';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '465d5e7e-99b6-5a40-a872-dbf7fa8ecad7';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '3c3e09d6-9ee7-5fcb-8cfa-d99e7d9abb23';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '66e25a00-af4e-5098-adac-3b6b65efe691';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'e820e3cc-d3c8-540e-8c59-01f50283773d';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '1b5d2977-898d-588a-a6f0-2d9e0abda988';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'd4c8028d-249e-5711-b1e2-c41096a22051';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'a42411b6-40fc-53cf-a831-e6f0192c159c';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '4b58d14d-0a49-53ed-bb7d-a24ef388dd9b';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '1e3fdeed-0c93-5a99-8941-04b6991a103a';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '3aeb9ecd-0a02-5aca-8042-79308407e672';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '4a2ea026-8a03-5d38-8fb8-a48001595d45';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '4dc7c38c-3e3c-5bf4-b793-5e5c7ec6d737';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '52a51848-618c-5c89-988d-3e206580e1f9';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '77c6a06d-edcb-56f5-854b-bbb73c2954f3';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = '8d67085f-4bf0-5af0-b2c5-bf3e770d5d5e';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'eedee31c-fccd-53f2-8879-f09161416395';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'fd4ea3e3-d30c-5d72-a4a7-2bde943f3f7e';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'becc87a7-6570-539a-b2cc-dab0d3076d46';
update public.sentences set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'c9a96848-7d60-5a39-9812-a9f35e3fb379';
update public.tips set unit_id = '869bb49b-d5fb-55dd-a7e4-f840be1b718f' where id = 'a0157ee6-1047-52d7-bc9d-1f2a42b1f1d5'; -- Then and now

-- me-hubiera-gustado → me-hubiera-gustado · te-lo-perdiste
update public.forms set unit_id = '52f4c57b-461b-5689-bc83-625e8445b0b2', position = 6 where id = '4269383e-4f5b-5f7f-a595-a2f095a86151'; -- meter la pata
update public.forms set unit_id = '52f4c57b-461b-5689-bc83-625e8445b0b2', position = 7 where id = '3c9d9f63-7013-517c-a557-80e8adf045c9'; -- metí la pata
update public.forms set unit_id = '52f4c57b-461b-5689-bc83-625e8445b0b2', position = 8 where id = '97eaa678-a53e-507a-b3cc-b482b62e6ac5'; -- error
update public.forms set unit_id = '52f4c57b-461b-5689-bc83-625e8445b0b2', position = 9 where id = '2ff3724c-7c0f-5587-8a27-ce3cdfaed243'; -- macana
update public.forms set unit_id = '52f4c57b-461b-5689-bc83-625e8445b0b2', position = 10 where id = 'd3be78bd-f758-57d4-8d15-68f75852abef'; -- arrepentís
update public.forms set unit_id = '52f4c57b-461b-5689-bc83-625e8445b0b2', position = 11 where id = '78aabf75-d725-5ec2-be73-b31b09c5964f'; -- arrepintió
update public.forms set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d', position = 1 where id = 'fd10c407-4901-5976-994c-5b125ac2fec9'; -- dejar pasar
update public.forms set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d', position = 2 where id = '076e41da-debe-54a1-8262-12d66de6dd99'; -- dejé pasar
update public.forms set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d', position = 3 where id = 'a7751f38-d463-58ab-ba93-174161632e54'; -- te lo perdiste
update public.forms set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d', position = 4 where id = 'ac62a302-1823-5f63-bd69-cd4f7943cc9e'; -- volver atrás
update public.forms set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d', position = 5 where id = '6e347d34-0080-5771-9241-7a1ede4840f0'; -- lamentablemente
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '93364466-1882-5402-b6d7-c187f3432cfe';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = 'e7d474f1-5b3e-59b1-90ea-e068b722bd80';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '7dbe8ca9-6acf-5eda-8358-9bbb8d92b3da';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '5326a39a-448d-5d9f-ac9e-b4b35822eb05';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '0f4d9ab9-d615-5cad-bc43-296239523925';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = 'bec05ed2-6ade-5f44-95c0-590a0b82cc0f';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '4da1e8b7-c371-5a32-b8e0-eaf1030fe929';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '79515b11-462a-55e0-8932-b99cf23a7936';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '76979c3b-e98f-5614-828e-9b033f68e595';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '267c18d6-1988-5120-b004-2e1ab2211dad';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '31d67ef8-525e-52a6-9229-d4094aea6a18';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = 'fc7abf07-60e5-509a-b5f6-a7777b44f53f';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '94fa8663-ccda-59e5-bca1-b45cdcff4f95';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '75a99afb-4c89-58c1-b9d8-4efccfe0688f';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '7d26d3dd-88b8-579f-9cd9-0bb2ffc4e8b9';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = 'f18dc7d1-bf91-5770-8c5a-8cdfd14f07d7';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = 'a7bf0b2d-f7dc-518f-90dd-e8c6e09790f7';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '22746e55-a7e7-5a0a-be15-c31c8e291c1b';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '113cce28-cc8c-5993-ad45-fe6ae00ead4c';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '34a23d5a-6ec3-5b4b-8367-f366bc6086d4';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = 'c9f0edee-fe90-5e66-b990-d4836595f4d3';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '041b38a8-3573-5f77-a5fa-b665b67fb0b9';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '9178c2f4-d8b9-534a-a93c-cec6045e147e';
update public.sentences set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = 'c307e6da-760e-546e-93a9-f022792d09a7';
update public.tips set unit_id = '2813d7bf-8139-5e36-9d9f-22302486095d' where id = '1d43e9b9-80e9-5f3c-b2cb-a7c32890b5fc'; -- Te lo perdiste

-- lo-que-paso-fue-que → lo-que-paso-fue-que · lo-mio-lo-tuyo
update public.forms set unit_id = '28506229-594f-503e-80d4-5a3a1085320a', position = 3 where id = 'e881de35-209d-59db-9d17-4a0f57da588e'; -- quise decir
update public.forms set unit_id = '28506229-594f-503e-80d4-5a3a1085320a', position = 4 where id = '8f666427-4fa4-5166-b6af-1e4a79537f75'; -- me expresé mal
update public.forms set unit_id = '28506229-594f-503e-80d4-5a3a1085320a', position = 5 where id = '318e0d45-25b0-5ff9-9e12-f05603b7534e'; -- me entendiste mal
update public.forms set unit_id = '28506229-594f-503e-80d4-5a3a1085320a', position = 6 where id = '640694f1-c190-54fe-a293-158972b556a9'; -- malentendido
update public.forms set unit_id = '28506229-594f-503e-80d4-5a3a1085320a', position = 7 where id = 'b43fe0fc-ffaf-5030-b052-78ed626c92e8'; -- en el fondo
update public.forms set unit_id = '5b825335-3059-5af0-96da-761444a1c762', position = 1 where id = 'a34415ac-0ee0-5324-aaec-a36786c73ebf'; -- lo mío
update public.forms set unit_id = '5b825335-3059-5af0-96da-761444a1c762', position = 2 where id = 'fa2f9a2e-e2d9-579e-898f-3017cb5aec55'; -- lo tuyo
update public.forms set unit_id = '5b825335-3059-5af0-96da-761444a1c762', position = 3 where id = 'c02fdb73-31cd-54b4-9099-d9514ecea5fd'; -- lo primero
update public.forms set unit_id = '5b825335-3059-5af0-96da-761444a1c762', position = 4 where id = '81a24cb9-0ee6-5202-8fe0-f25fb20cd732'; -- lo justo
update public.forms set unit_id = '5b825335-3059-5af0-96da-761444a1c762', position = 5 where id = '44641cad-8875-50f3-935b-a04b14d6d48a'; -- lo que sea
update public.forms set unit_id = '5b825335-3059-5af0-96da-761444a1c762', position = 6 where id = '6056462f-9f99-542a-9779-48b3e072c4e2'; -- lo que vos digas
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = 'f4190bce-450a-5be2-9520-e5fa49a091fb';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = '0016a872-4c16-536f-b80d-71c8edd1b9d6';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = '88f5613a-6159-5145-a91b-180f28dd73cb';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = 'd69a9fe3-90d0-5cf5-a457-593a78032610';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = '0d20c4fd-14f1-5621-8d67-93a456f3ec81';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = '6a287fe2-9373-5075-84b4-abfbcd1c0bb9';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = 'c94e4c42-80a6-5656-bd65-e3550bbf6970';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = '1fc25818-8c71-5212-a474-5e91e7c680e4';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = '1b8cca1d-9b2c-5b4d-ac08-09e5c89425f4';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = 'e2b3d466-0593-5e73-b1a7-9d673bae3b36';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = '824bb298-0d11-57f5-b6e8-39bfcaad35f2';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = '0b963dfc-1a0a-5570-88a4-0f1bbf5694c3';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = '563fad65-c2a8-53d4-8c3d-d5bdcc969e37';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = '615004bd-fa83-5542-b2b3-3adb9cea84c8';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = 'c5bc83b2-1af1-513c-a360-33759b6c2f7f';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = 'ad2f9edd-840a-5f8b-b6a4-c897d2eb60f0';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = '6e2c0837-b7fa-5045-b35e-0e01d13fdc70';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = '94579fe9-1c49-5972-88dd-5e35b24e3f51';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = 'd489caa6-fad1-5d07-b4ed-bb055622a5a0';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = '949c17be-3ef1-5c63-ab4a-6f573b60f330';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = 'ad5c82ce-3827-5d45-97be-af47855377a0';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = 'adad294d-7f48-5ce4-9c91-7248462c3e8c';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = '2dddccca-6245-518c-8f48-eb3c9e4d0c92';
update public.sentences set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = '992bc5c1-28ab-584d-8b0a-881669303c31';
update public.tips set unit_id = '5b825335-3059-5af0-96da-761444a1c762' where id = 'e19109d4-b42a-551e-8023-98c286a43783'; -- Lo mío, lo tuyo

-- me-mori-de-risa → me-mori-de-risa · me-hizo-sentir
update public.forms set unit_id = '31b7857e-57f3-5f7b-bcef-b36286ed3425', position = 4 where id = '950f3913-ac79-5769-a732-2049f9b5d49e'; -- me morí de risa
update public.forms set unit_id = '31b7857e-57f3-5f7b-bcef-b36286ed3425', position = 5 where id = '59cc2184-8ac7-5471-b222-27b58c64eb3a'; -- sonreír
update public.forms set unit_id = '31b7857e-57f3-5f7b-bcef-b36286ed3425', position = 6 where id = 'd8b708a7-d14c-5386-b8bb-c4692cd2d23b'; -- sonrisa
update public.forms set unit_id = '31b7857e-57f3-5f7b-bcef-b36286ed3425', position = 7 where id = '2cc990d5-5edc-5565-a4e3-e682c4d13bd0'; -- comedia
update public.forms set unit_id = '31b7857e-57f3-5f7b-bcef-b36286ed3425', position = 8 where id = 'da609bbe-5cb1-56b4-a3ce-80fde5d6246f'; -- sentido del humor
update public.forms set unit_id = '31b7857e-57f3-5f7b-bcef-b36286ed3425', position = 9 where id = '090c9568-11b5-5113-9dc0-cdbe7463ea50'; -- reís
update public.forms set unit_id = '31b7857e-57f3-5f7b-bcef-b36286ed3425', position = 10 where id = 'f932d19d-6318-5be1-a94a-fa4407301a85'; -- rió
update public.forms set unit_id = '31b7857e-57f3-5f7b-bcef-b36286ed3425', position = 11 where id = '5a1df1e0-75b2-56b7-85cd-6da8a24e1b81'; -- ríe
update public.forms set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4', position = 1 where id = '18d6eda7-775a-5f7c-b68a-da544cf9cd69'; -- lloraste
update public.forms set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4', position = 2 where id = '12d3ce8a-883a-5952-bec8-660fe9897b54'; -- llora
update public.forms set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4', position = 3 where id = '3d0e84e1-46ea-5684-b7be-d0580b221f10'; -- lágrima
update public.forms set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4', position = 4 where id = '99e4859e-151a-5abb-8b37-8ae82e4030b8'; -- lágrimas
update public.forms set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4', position = 5 where id = 'a4540faf-56be-5c0e-aa66-8b78e2aceeef'; -- tristeza
update public.forms set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4', position = 6 where id = '42720325-48f8-5368-af15-c292221ea1dd'; -- me hizo sentir
update public.forms set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4', position = 7 where id = '245c41b2-e43f-5c9c-8862-a5b8eabde6e2'; -- escena
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = '0c8b8a05-761f-51a6-b068-eea771c6d587';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = '543d97f5-6f23-541a-b921-ae3c97682bfe';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'cb35a723-a011-5498-9e3b-ba7f079a07e0';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'ed078050-bcf0-5140-a5d6-2056979af48f';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'b27c515d-0488-5f81-943c-016c5c422bd8';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = '41ec81d7-f232-5f60-a438-e267cd733765';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'b49d5eda-3e54-535e-962b-e3e26708592c';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = '8d3df9e1-112d-5178-9931-b57f6e5d7c1c';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = '91df4753-d663-5a8a-9349-2b3226349588';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'b7081246-885b-5b8c-abcd-2048e6b6b01f';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = '106cd0c0-3c8d-5c7b-9095-a14d0904c754';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'e5bc1e99-9597-5ea3-a61c-0cec8751f9e3';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'e5956df1-f67b-58fe-8cec-73eac98cb754';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = '183fa7f6-a52e-5f79-b5db-6b0ff4267427';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'c54a145a-e7d2-5271-9b41-f3076f0d0cec';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'c7401970-6ef3-5178-b9bb-502b9c2f7cd2';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = '7d518b8c-252b-50fd-b3a7-8febd5be68c3';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'aae72b26-2258-5622-8eb8-309c8fe9b4c9';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'f3ecab9f-f31c-545f-9c93-8290ef7b66d9';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'f8479dd2-2852-50f3-89fb-beec55e312d6';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = '0dfe4f6b-4bcb-5b2d-8023-2013169a1103';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'c9a97cd8-10c3-5f18-a064-dedccc6e42f6';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'e16765b4-d3c7-58da-92ba-faa2e46ae04d';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = '49dc5488-5001-5ab4-947e-61fb0ad69acf';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'dedb12a6-a6c5-586f-9438-b5705a28426a';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = '33074d71-fa70-5fdb-bd07-867c67e378a4';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'fa224fb7-84bf-5812-8468-6ee0bc278bc2';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'a18abf7f-fbe4-5aab-ae31-9cd683545805';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'a54d877d-1054-5f56-b233-0ced4b6889ca';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = '195ac659-ea37-5452-9436-b6e9f8e9e727';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'f33f110c-ae4c-5904-9f43-d11df508a3ae';
update public.sentences set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'a41d1714-7255-5768-8903-46c48da92cef';
update public.tips set unit_id = '2ea0b499-ca22-51ca-b2ad-d83cb12dacc4' where id = 'e7e3983a-7d06-54c6-802c-1dea72caffff'; -- Hacer + infinitive, every person

-- se-instalaron-en-la-boca → se-instalaron-en-la-boca · mis-raices
update public.units set title_en = 'Tell how your family got here', summary_en = 'Se escaparon de la guerra y se instalaron acá' where id = '0dacd2e3-2a45-5ad7-a13d-42f6b718c484';
update public.forms set unit_id = '0dacd2e3-2a45-5ad7-a13d-42f6b718c484', position = 2 where id = 'e15770ea-8d5a-5ae4-869f-3c95e7bfa8ee'; -- se instalaron
update public.forms set unit_id = '0dacd2e3-2a45-5ad7-a13d-42f6b718c484', position = 3 where id = 'a2947a42-2d15-5649-9baa-7f0124f108e3'; -- se instaló
update public.forms set unit_id = '0dacd2e3-2a45-5ad7-a13d-42f6b718c484', position = 4 where id = '8ccd2b30-32ba-5f67-8952-e75d43164012'; -- guerra
update public.forms set unit_id = '0dacd2e3-2a45-5ad7-a13d-42f6b718c484', position = 5 where id = '92edc70a-7e8a-5706-92e1-40ff720abd4a'; -- pobreza
update public.forms set unit_id = '0dacd2e3-2a45-5ad7-a13d-42f6b718c484', position = 6 where id = 'd83e32c9-8e72-5cab-a06a-c37cca3086d5'; -- puerto
update public.forms set unit_id = '0dacd2e3-2a45-5ad7-a13d-42f6b718c484', position = 7 where id = 'f7d92c7d-9a53-536b-bf55-aa53d37e2a0e'; -- conventillo
update public.forms set unit_id = '0dacd2e3-2a45-5ad7-a13d-42f6b718c484', position = 8 where id = '9c6cbcc6-ad91-5c29-9dbb-bcdbc7d1129b'; -- escaparon
update public.forms set unit_id = '0dacd2e3-2a45-5ad7-a13d-42f6b718c484', position = 9 where id = 'ee76a3c2-666b-55ca-8736-1a6a0c66f5b5'; -- instalaron
update public.forms set unit_id = '0dacd2e3-2a45-5ad7-a13d-42f6b718c484', position = 10 where id = '5f98f0b9-a2bf-534c-b909-883b27f2bf23'; -- instaló
update public.forms set unit_id = '0dacd2e3-2a45-5ad7-a13d-42f6b718c484', position = 11 where id = 'e2ecabea-8d1e-558d-836b-d91c12da9bd9'; -- Europa
update public.forms set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2', position = 1 where id = '1d94a936-1b73-5bfc-a4fc-095adaf4e8d2'; -- gallego
update public.forms set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2', position = 2 where id = '62c4917c-bee2-5036-a78a-8a13e1623416'; -- gallega
update public.forms set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2', position = 3 where id = 'f62fc20c-d05d-5e3c-86be-1d036dcdc8be'; -- gallegos
update public.forms set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2', position = 4 where id = '3013856f-acb5-59a1-baae-15227f0f7dbf'; -- raíces
update public.forms set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2', position = 5 where id = 'eb481952-3b58-505d-888a-aea600e12fc7'; -- ciudadanía
update public.forms set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2', position = 6 where id = 'eca7ccc1-44bd-5d00-bd22-acf6556cbf2f'; -- mantuvieron
update public.forms set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2', position = 7 where id = '8844c547-88a9-564f-8334-4fd78e19aada'; -- conservaron
update public.forms set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2', position = 8 where id = '7772e6aa-50bc-5f5b-bc24-08025949af88'; -- guardaron
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '72a86a43-ede4-5f6c-b27a-ae10920a82f4';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '2fb72861-9e60-50d5-a51c-745220925480';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '6c818f7f-0975-592d-937d-f9f90fb761cf';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = 'eed96de4-d22e-571b-8214-5ce74ed02174';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '925b2630-674b-53fd-beef-196e642315a1';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '1cf7b738-0f99-518b-ab07-9125da26f9ca';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '0cd6079b-afc7-5468-9597-1153d070c684';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '5ec96e98-8ad2-523c-8eb3-7031931eb832';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = 'b4fc5167-7d9d-5f68-92a0-e00cca4df5e6';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '29b19a61-dd4f-5867-b8ae-53f9ae45e8dd';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '089399b1-da5f-568c-8c1d-235be5907f11';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '3ea8e308-b83d-5da3-9c3d-45fd1ff72b3a';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = 'b28b29d4-0265-5c0d-b582-2b456b3561b0';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = 'a04ab304-ec50-5135-8c4e-5234abe0b885';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '04b237c7-c3db-54ae-b4b6-51299a0637af';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '08c06543-2c92-5689-b075-16264a0c73f6';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = 'fc8f8111-7c75-5c4b-9c8a-02bdaa239faf';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '5334951a-5435-5c14-909c-64c73c69f670';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '368db48d-d0f7-514a-94fd-afcbaa533e65';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '496ae0b2-9f77-5d31-8c47-18dc4081c596';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '3363f585-e629-5c52-a42a-e918324d3fec';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '358abe7b-1a5d-5567-85c4-c746cec4da13';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = 'ec3ce2ed-92b1-550c-abad-72280fedd46f';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = 'bc2b63aa-b91e-5f6d-8152-c681ea4c4032';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '65a16d9c-e26e-574b-85bb-b4bad58c18ad';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = 'd6da9e86-42c2-5a94-8a64-c42b7f814d17';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = 'dff907bb-949d-5ab9-af73-71ad916040e3';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '8ac2534a-96a1-5b4c-bc8a-a4daa795d7ce';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '24eb8657-09c7-5e3d-85af-c06ff670097a';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = 'e8e38a6f-b9c8-516e-8721-87e67931bdc4';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '0d67c000-dce6-5877-b0a1-3c125e4ca20f';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = 'a60942d4-5895-5049-a004-61514eeb7b5a';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '593bf462-6c44-5c34-a68f-4808f7c499db';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = 'f70c6abe-fb7d-519c-b350-dae03e79f082';
update public.sentences set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '9272c440-39e9-57bc-96fa-49499200016b';
update public.tips set unit_id = '15f713ad-4869-53c5-a12a-cbdb4b67bfe2' where id = '69083595-4dc0-5d7d-8816-d2abf4a0f8c7'; -- Gallego y la ciudadanía

-- gracias-por-todo → gracias-por-todo · que-andes-bien
update public.units set title_en = 'Look back on your time here', summary_en = 'Gracias por todo: me siento como en casa' where id = '6da6ead7-b546-54e5-b84f-a16a56ef3f2a';
update public.forms set unit_id = '6da6ead7-b546-54e5-b84f-a16a56ef3f2a', position = 4 where id = '44e60c74-28fc-5a74-9098-4df5ce0f529f'; -- como en casa
update public.forms set unit_id = '6da6ead7-b546-54e5-b84f-a16a56ef3f2a', position = 5 where id = '6e4cc10d-91a1-522c-81b9-4836b3a4303e'; -- de corazón
update public.forms set unit_id = '6da6ead7-b546-54e5-b84f-a16a56ef3f2a', position = 6 where id = 'c2d9949f-70b5-5a85-b3ce-fa50d2a13cb0'; -- gracias por todo
update public.forms set unit_id = '6da6ead7-b546-54e5-b84f-a16a56ef3f2a', position = 7 where id = '6ed6eeab-2a54-5241-a219-191f6df7a7ce'; -- decirles
update public.forms set unit_id = '6da6ead7-b546-54e5-b84f-a16a56ef3f2a', position = 8 where id = 'df04a3ce-dd5e-5679-af23-c92effc781ff'; -- adapté
update public.forms set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500', position = 1 where id = '8b152a0b-4c75-55c3-874a-119a24a3597a'; -- despedida
update public.forms set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500', position = 2 where id = '4dbcc363-1d3f-5d36-91ff-7861aadfb3fb'; -- me despido
update public.forms set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500', position = 3 where id = 'aefd0271-ec75-5e47-8ffd-94cde24fc2da'; -- me despedí
update public.forms set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500', position = 4 where id = 'cb848b85-cd5c-5930-ab93-96de1a331b06'; -- brindemos
update public.forms set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500', position = 5 where id = 'ef1b616a-ff04-5a26-9093-5e747f6bb2cd'; -- brindo
update public.forms set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500', position = 6 where id = '1ec23f8c-df66-57d8-8f06-ebdeb898708e'; -- extrañar
update public.forms set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500', position = 7 where id = 'f85d987a-4f2a-59d3-951e-e0815433842c'; -- fue un placer
update public.forms set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500', position = 8 where id = '2f3dc0df-d494-5a0c-9a0d-cd6eef4da624'; -- hasta la próxima
update public.forms set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500', position = 9 where id = '1d4836eb-e6eb-5c7d-b0ea-ea0df46a5c6d'; -- que andes bien
update public.forms set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500', position = 10 where id = '58136cd5-3b8f-5f14-a3a7-1beb4c9b6dda'; -- seguimos en contacto
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '627c19f0-dbb6-5c28-b1c3-372778ed8924';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '85061a9b-2818-5c3c-b6ca-94494f245655';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'c5d0ae87-87ce-5eec-9e86-6951ed2e95ef';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'f85ecfab-e774-5e72-aa42-faba8bb0b0ba';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '3ce46737-9408-5587-ad9f-f0798994255f';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '95e0b8de-1b0c-5d7d-9e16-edf190f3801c';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '1171dacd-36b4-525e-a242-d0c3600b55bd';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '9cccd13e-f764-56e4-8514-0d9e5523f224';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'fb55b247-169d-576f-a10b-b81855b8e549';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '74625b57-5702-59a2-9cbf-a3994dc49128';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '3797b738-590c-5756-a70e-85c9e8aa4602';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '33203b3b-264b-5aca-8f19-8d3ade25c346';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'ee217a0e-8e4c-5c99-a5f1-63233b0c893f';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '43bf88b6-6260-5243-984b-68f038229df2';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '422571be-597d-59bd-814d-d7c768a0e97c';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '4fe0ad84-e6ed-5405-9314-6e7e2bcbbc5f';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '4bb0fdc5-5088-5198-94fb-9102598eef3f';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'f1db08e3-6c05-5107-9728-523a832bad33';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'ade36b7b-7a73-51be-a45f-1fb7b67d38e1';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '42d0b977-3387-5097-a7cc-3aef26b83345';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '4d2a1344-9459-55df-8b1f-2b28695a0a10';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'bb93b06e-a451-52c7-be5c-69c2423e350c';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '3fd08374-51ad-55bf-ab5d-6fee04922ed1';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '5fb2e0e6-db08-57bb-a2ca-bb11ae36ba5b';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '8bb95c4b-c7f6-5b22-8d08-e32e73a7b8c9';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'bcdf298b-db64-58bc-9232-0f9d8ab4e46a';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '4661183f-31d6-5b98-b2a5-fb015cfbb9ad';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'ee1ac18d-9504-57b4-9c22-d6ee57f11c09';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'f7a05563-6325-5b4d-b391-7380660c8909';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '4c323797-caf5-5de0-8b58-34776a1251bb';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'e1c1c988-403f-5039-a92d-e508b56e703b';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'a842000b-1a09-5603-9579-8f1627d3ca45';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'bf9d7c1c-5a0b-51e1-aca3-78854c8b1a18';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'f42d2359-605b-5c73-a76f-fcdee94f7547';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'aa579224-3eb8-5e66-8dd4-efb6703e17f8';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '09015c1c-46a8-523b-9534-fb6ec9f5842d';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'd77c3a85-bb00-596a-a43d-30672b435b99';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '412cd098-7109-5db2-8e42-4a1c9df7daab';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '08fb3a8d-a70d-57e1-8c30-2b604cc1723c';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '990b416b-d844-5276-89c5-2abd04ac0f0f';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '8bdc9633-4cc3-5d39-8077-40e125341254';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'e8d915d0-af03-599e-a3de-13d67160ed5d';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '7993ba36-1f59-5eea-8ea9-cbb8d757071a';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '804e5b88-9ebe-59e3-a95a-d6c380249fa2';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '6c41ff2a-417d-54f5-9f30-22ce9b68e260';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'ad11183d-3dfe-5a23-8a59-b3e628811bd7';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '6b3667d6-0a65-52fc-85dc-b3173dc1d1eb';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'a7065ba3-4b9f-5b74-ae5a-abf8bc4c2278';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '0a0ffdd2-2255-586e-9a8f-1c3c6c6c5189';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'fe8db84a-c7c1-5b5b-b153-1dc13e2c13ed';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = '91cda70b-3d5b-5df1-93eb-6a8eca760337';
update public.sentences set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'aa7e76f9-4b52-5df7-be39-f45d868ab1de';
update public.tips set unit_id = 'f69a6745-ce7f-5305-aab2-d98304a3b500' where id = 'cf2878f8-b900-509f-b7ce-8ab38a91c757'; -- Brindemos

-- A chat scene written for a unit that has since lost half its words is written again when it is next opened.
delete from public.unit_scenarios where unit_id in ('43405ea2-1cec-5d90-bb61-d884ee8359bb', '5df117af-d5e0-5b71-8caa-6806c47bdff1', '2fa4826d-6276-5a6f-b7a5-e3c2e6dc4f2d', '6575b91f-226c-5859-990c-345608df8e59', 'b60b2d1f-25dc-5ada-9b93-a0afe7bd9a37', 'de1b383d-ef2a-56ab-b9e0-5c76ea55a644', 'e89d1870-c4d1-5692-923d-5e357ae8218e', '470a7647-d7f6-51fe-aa77-1f96cda7ef58', 'f42f6608-6d16-5d0a-bd3f-896cd5fb4d07', '59418fb1-6973-57d9-a75d-e4e21f004b8f', '14b391bd-5db8-50a4-a988-428361e7752a', '8a2211a4-bc2b-5df6-bfd3-ed761ce08c9a', '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', '77e7e28f-74ef-5a8f-b15f-5a5589d48684', 'c72176ae-a8de-5a47-9b37-cf9bdf84de08', '51c29d65-4514-5131-bc0a-f7a48158b1db', '7c33a900-8b22-5a9e-a34e-7c274e6a21b0', '76cdfd4e-984e-51cf-b109-bac7fe371aa2', '89b3ea96-dbbd-5f0a-8651-0308bd27297d', '07ff3e13-7b95-55ab-aab7-ac48151e0d8c', 'dae6ceff-5881-5f5c-a218-3a6317889caf', '018363b6-528d-5464-8f6a-575ede7fb4d4', 'a6cc868d-fbe9-5af4-94d5-1396172806b6', '102a20da-507c-5cab-8d54-b9dc250aebb6', '78c71bbd-ead2-54c0-8b92-98f45101f849', '28d6c921-dae2-50d2-b6a0-a5e2423428a6', '42aaa1de-ab7b-5276-9032-91bff95ed818', '02841028-7fa9-5c47-9159-c4b47cc15cc1', '08e5edec-37ff-59c8-942b-b0fcd4fe251b', 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', 'da8af0c4-83d8-570d-a76d-ba9f8a8d4161', '2902c53a-0143-5823-b423-fd9fe3dc2295', 'ad17a937-2fe2-519e-9f42-86f123c7e38c', 'e4a7439f-a626-5e82-abaf-06bc10e30be8', '1bb1664d-4c74-5dfd-9001-ae7f0fd897f8', '827ff70d-4671-51f6-a0aa-745cfebd058a', '796fb7f5-7211-54d8-83dc-d15338978f46', 'de1cac02-1435-56ef-9682-17ea2bc59bc4', '59c95af3-6785-5037-9294-f36861623e46', '3ea35fe7-87c2-5bc5-a138-ed2124298174', 'e38a0b51-167e-583b-a179-5eafde3573f0', 'ed66a36e-5a88-56f2-a2c7-3fdf72291b4e', '672335a3-bca5-50a9-a61e-0d2d70bcd3c2', '22f748c4-e86a-57f2-8dfc-09a4885d1d24', '3dd370c2-01fe-54ba-95fc-3c5ef1637eb0', 'a56af3ac-cade-5ff7-bdce-38285c0c74e8', 'da7656d3-0e9b-597b-ac1d-493e481b96f5', 'e46f81c7-cdca-5d51-8738-55a0efa5a020', '6aa47fcd-c4fb-5d93-9c82-3c5580df654a', '654d7d9b-03de-5cfe-a0f2-0124a144bfcf', 'e27cb9dd-52ff-5eed-8b6b-7f5680e6ae7f', 'd7488f2f-ab30-530b-a0f2-9b26a8cb04ad', '35957a48-3965-592b-a5e7-2adfd23edfc0', '36036d7c-a216-5b60-a76c-a59bf988487b', '7da0178d-42ee-5e98-aece-77ffbb45dd2d', '4356c8d2-a33c-5a38-8b20-f4ac90387e6f', '8ec0010d-66b0-5b69-aadb-eca273e4ae43', '504b4319-d4ab-5b42-870b-fea27ef57652', '9f441bef-17a2-535a-a539-79a16389ad10', '4aaf79fa-f71f-5712-8a98-5facae7b4221', '38987042-d239-57ac-9bcf-58be792a8609', 'a9fb512f-6297-573c-8d34-be942749040d', '685c49ba-32f9-5e23-acab-d8552fdf4a20', '4f79112a-7e16-5786-a09f-c3f47eec42c1', '00142c01-014f-53a8-b11d-1cf2bf832643', 'f02fa743-710e-5e6c-880b-e826a6c0056a', '38d68ef5-9223-5ff2-8954-88f3a9cc0ef3', 'd7836b8d-78b8-51ae-8e41-57e6f2d5de34', 'c18ed3f6-ae4d-50fd-b360-6d7e7d73144c', '5c5f55d2-b389-5e93-94b9-3eb2897e1055', 'd1ef9d43-816d-571d-a8ba-4ba76a09ba2d', '52f4c57b-461b-5689-bc83-625e8445b0b2', '28506229-594f-503e-80d4-5a3a1085320a', '31b7857e-57f3-5f7b-bcef-b36286ed3425', '0dacd2e3-2a45-5ad7-a13d-42f6b718c484', '6da6ead7-b546-54e5-b84f-a16a56ef3f2a');
