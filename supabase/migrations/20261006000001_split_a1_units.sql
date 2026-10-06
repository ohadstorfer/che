-- ---------------------------------------------------------------------------
-- Units too big for the fixed shape are split (scripts/course/split-units.mjs,
-- from docs/course/splits.yaml): 40 units become 83.
-- The first part keeps the unit: its id, its lessons, what a learner did in it.
-- Each later part is a new unit right after it, with the words named for it,
-- the sentences that use those words (2093 move), and its tips.
-- 413 forms move. Nothing is deleted.
-- Then: course:sync-lessons (the new units' lessons), course:extras, course:lessons -- --all.
-- ---------------------------------------------------------------------------

create temporary table reorder_units (id uuid, section_id smallint, ordinal smallint, course_order smallint, old_order smallint) on commit drop;
insert into reorder_units values
  ('cc27542c-c983-52aa-88c4-8fe075eb0a0f'::uuid, 1, 4, 4, 3),
  ('1f792bd1-c22b-5919-b21f-f22c96ecef14'::uuid, 1, 6, 6, 4),
  ('aea4c640-a7bd-5aba-8ce2-5c2f493637a3'::uuid, 1, 7, 7, 5),
  ('8ee9449f-672c-5e88-91cb-6db07525f370'::uuid, 1, 8, 8, 6),
  ('c5846290-e8b5-5d22-8910-aae061dcf004'::uuid, 1, 9, 9, 7),
  ('d35a777a-0a33-5ede-8fb9-39d0107d41f6'::uuid, 1, 10, 10, 8),
  ('9f62a065-778e-5620-b8e5-de9e6f8c2907'::uuid, 1, 11, 11, 9),
  ('eba40ebe-93cf-52fb-a853-9a2836300617'::uuid, 1, 13, 13, 10),
  ('7c5e7c59-5c44-52e3-9900-449c03934359'::uuid, 1, 14, 14, 11),
  ('b900b7fe-a570-5688-8aa9-d35d025c5c42'::uuid, 1, 15, 15, 12),
  ('481ae401-6c6e-53d7-9683-853d0cbed672'::uuid, 1, 16, 16, 13),
  ('d5d88ab0-8bb3-5ef0-9e7c-8c83d78b32ae'::uuid, 1, 17, 17, 14),
  ('d3b8a1a7-a655-577c-8297-f7f1ff9d08cd'::uuid, 1, 18, 18, 15),
  ('70dda450-3825-5ea7-88fd-296775bc426c'::uuid, 1, 19, 19, 16),
  ('9a6d16d1-11b7-53bd-b0b9-676b76d00eb2'::uuid, 1, 20, 20, 17),
  ('9a649d54-c14a-56da-8701-c4783ad9a159'::uuid, 1, 22, 22, 18),
  ('d8b23128-fa60-5c82-9370-1cad2fff44fc'::uuid, 1, 23, 23, 19),
  ('b28a06e8-ef82-54f0-bbf4-5314e84a7ece'::uuid, 1, 25, 25, 20),
  ('5bf591c3-3ee8-5b3a-a7b6-4b774ad64dc0'::uuid, 1, 28, 28, 21),
  ('a48206a5-01f1-5f99-a064-2112a1860df7'::uuid, 1, 30, 30, 22),
  ('57ee5db8-0033-56bd-b766-c351ed945cfb'::uuid, 1, 31, 31, 23),
  ('bc934576-e1db-5554-93e2-cec9b7738349'::uuid, 1, 32, 32, 24),
  ('f1fa7454-72a3-546d-8f72-4aab149bbbbe'::uuid, 1, 33, 33, 25),
  ('3bfdac76-f836-5268-91f3-0dbfa1c26018'::uuid, 1, 34, 34, 26),
  ('d8cb78a0-5a7d-5c09-9f7f-9e905e0d2e59'::uuid, 1, 35, 35, 27),
  ('3cc8b1a1-6314-5a4f-be82-b713ea584203'::uuid, 2, 1, 37, 28),
  ('fd0199e1-0dc9-5704-8917-1613531c1778'::uuid, 2, 2, 38, 29),
  ('71481540-7f7c-5939-9d96-ee76d80128b9'::uuid, 2, 4, 40, 30),
  ('9c3ea7c9-a129-5157-b092-804da692c36c'::uuid, 2, 5, 41, 31),
  ('e4dc651e-4fd9-5ba8-8e83-1c8a4131e09e'::uuid, 2, 7, 43, 32),
  ('6d6f0271-451e-511a-ae75-885699df6981'::uuid, 2, 8, 44, 33),
  ('bde97495-163d-56bd-a579-b524910edfcc'::uuid, 2, 10, 46, 34),
  ('edbefa4a-ecf6-5ba9-8f18-56b44e86a423'::uuid, 2, 11, 47, 35),
  ('eda0d38b-9df5-5bba-9665-c300309be0fa'::uuid, 2, 12, 48, 36),
  ('ef2cae6b-ed9c-5d4b-9d7e-7c65c58dbea5'::uuid, 2, 14, 50, 37),
  ('c5c43fc3-949b-5f6c-99b4-c6da645e7d7f'::uuid, 2, 16, 52, 38),
  ('7f39f4c5-591c-51f7-9f82-ca7f7a1cfb2b'::uuid, 2, 19, 55, 39),
  ('525526ce-1e8d-5672-88f4-02259c8e4533'::uuid, 2, 22, 58, 40),
  ('b95d926c-3168-53bd-88bd-c02c868d1119'::uuid, 2, 23, 59, 41),
  ('5269d1e2-0b24-51b5-b272-6da95a4cc1b0'::uuid, 2, 24, 60, 42),
  ('3c53d5f7-3d49-5265-8058-ba19fab0b788'::uuid, 2, 25, 61, 43),
  ('a2eec2e1-5a4c-5372-a1e8-7ac3076576e6'::uuid, 2, 26, 62, 44),
  ('62bf976e-3f47-5cc9-b8bb-82f1b5c654b2'::uuid, 2, 27, 63, 45),
  ('6f572b83-5cbe-528d-bcdf-bbfc32e2b19c'::uuid, 2, 29, 65, 46),
  ('feb8548b-0ed1-59d1-b3d8-a983690a21d1'::uuid, 2, 31, 67, 47),
  ('1974689a-177e-55c9-b4b1-69fba40389f0'::uuid, 2, 33, 69, 48),
  ('a47573dd-a997-5b77-acd6-3b206415f578'::uuid, 2, 35, 71, 49),
  ('7530c631-f8fc-54fb-a160-bf7d158f1f86'::uuid, 2, 37, 73, 50),
  ('9ed0dbbb-2500-5957-b946-27d34bce9614'::uuid, 2, 38, 74, 51),
  ('c7cbf578-23ab-5875-9a1c-8104be80ad3e'::uuid, 2, 40, 76, 52),
  ('61a56ded-546a-5ad6-a8ac-310375bed4ac'::uuid, 2, 42, 78, 53),
  ('2a79010a-154d-5c32-ade0-ded3031c92e1'::uuid, 2, 44, 80, 54),
  ('bf7b8307-3d3a-57b2-9e3b-06bca38b4ef1'::uuid, 3, 1, 81, 55),
  ('be613042-6935-5185-bf3a-fa4dc33eca15'::uuid, 3, 3, 83, 56),
  ('8b9e9239-cc97-56ec-b263-606f0591c15b'::uuid, 3, 5, 85, 57),
  ('740b6205-cb92-54dc-806f-96cc347f8ee0'::uuid, 3, 7, 87, 58),
  ('ba4a74c0-9dbd-5b9f-9f9c-e2c7ec49c749'::uuid, 3, 9, 89, 59),
  ('b31e1b41-4887-5a80-bbf5-d83e7f8d4fac'::uuid, 3, 11, 91, 60),
  ('3376ea65-8afe-56be-bae8-b5d06b46c9cd'::uuid, 3, 12, 92, 61),
  ('714e2bff-95e1-5d03-96ef-a779c76932b7'::uuid, 3, 14, 94, 62),
  ('4db2a92e-ad85-5b0f-88e2-71629dbf00d2'::uuid, 3, 16, 96, 63),
  ('d9917aa3-1a7b-5287-9437-9c652db27797'::uuid, 3, 17, 97, 64),
  ('72bb9993-19e7-5dad-bdc7-78b4161e7045'::uuid, 3, 18, 98, 65),
  ('26b3f81c-f349-5b38-817b-731bbac652cf'::uuid, 3, 19, 99, 66),
  ('70cf9841-8e17-590c-9fd0-503d47b7b3e1'::uuid, 3, 20, 100, 67),
  ('13fec277-30b8-5bdb-9718-e682351abfd9'::uuid, 3, 22, 102, 68),
  ('b3f216c5-d105-552a-b3f1-254cee4747b1'::uuid, 3, 24, 104, 69),
  ('5f7fde3f-e53e-535b-a6d1-271ba38c2576'::uuid, 3, 26, 106, 70),
  ('c15b7bfe-bc72-5bf8-a990-5ba1799a2d79'::uuid, 3, 27, 107, 71),
  ('b5b78e79-835c-570f-ad79-3070ec337571'::uuid, 3, 28, 108, 72),
  ('441e2e5b-f704-511a-9e55-ef9613425ce8'::uuid, 3, 29, 109, 73),
  ('86e40753-5eaa-5ab6-b540-6a6f01c756b5'::uuid, 3, 31, 111, 74),
  ('2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b'::uuid, 3, 33, 113, 75),
  ('1638cb53-0a6f-5b5b-a432-fa433a73461e'::uuid, 3, 35, 115, 76),
  ('fa7ef0ed-4de1-5b37-9c23-1d5747ae531d'::uuid, 3, 37, 117, 77),
  ('2c5ceb94-a924-5797-9279-29476c698177'::uuid, 3, 39, 119, 78),
  ('bd710c94-4059-585f-a6ad-448e21cec02f'::uuid, 3, 41, 121, 79),
  ('b10158d0-15cf-5719-a422-9a15ca8305ff'::uuid, 3, 43, 123, 80),
  ('43405ea2-1cec-5d90-bb61-d884ee8359bb'::uuid, 4, 1, 124, 81),
  ('694523fc-5d19-5d81-8e08-6083c35d7d25'::uuid, 4, 2, 125, 82),
  ('5df117af-d5e0-5b71-8caa-6806c47bdff1'::uuid, 4, 3, 126, 83),
  ('59190ff0-c3f5-5d61-bd69-5db02edca9fd'::uuid, 4, 4, 127, 84),
  ('2fa4826d-6276-5a6f-b7a5-e3c2e6dc4f2d'::uuid, 4, 5, 128, 85),
  ('6575b91f-226c-5859-990c-345608df8e59'::uuid, 4, 6, 129, 86),
  ('b60b2d1f-25dc-5ada-9b93-a0afe7bd9a37'::uuid, 4, 7, 130, 87),
  ('de1b383d-ef2a-56ab-b9e0-5c76ea55a644'::uuid, 4, 8, 131, 88),
  ('e89d1870-c4d1-5692-923d-5e357ae8218e'::uuid, 4, 9, 132, 89),
  ('470a7647-d7f6-51fe-aa77-1f96cda7ef58'::uuid, 4, 10, 133, 90),
  ('c2f6a80b-fb62-5345-93bf-172376f29688'::uuid, 4, 11, 134, 91),
  ('f42f6608-6d16-5d0a-bd3f-896cd5fb4d07'::uuid, 4, 12, 135, 92),
  ('59418fb1-6973-57d9-a75d-e4e21f004b8f'::uuid, 4, 13, 136, 93),
  ('fd0afb5a-c86b-5339-b28f-31f5431f400a'::uuid, 4, 14, 137, 94),
  ('fa694c27-06c1-5cf3-b5c7-d369f495abbf'::uuid, 4, 15, 138, 95),
  ('14b391bd-5db8-50a4-a988-428361e7752a'::uuid, 4, 16, 139, 96),
  ('8a2211a4-bc2b-5df6-bfd3-ed761ce08c9a'::uuid, 4, 17, 140, 97),
  ('06235159-d29d-5425-954f-4a61a73fe1f4'::uuid, 4, 18, 141, 98),
  ('9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d'::uuid, 4, 19, 142, 99),
  ('77e7e28f-74ef-5a8f-b15f-5a5589d48684'::uuid, 4, 20, 143, 100),
  ('e21ddcb1-102b-5c87-a018-55c861cdbe47'::uuid, 4, 21, 144, 101),
  ('c72176ae-a8de-5a47-9b37-cf9bdf84de08'::uuid, 4, 22, 145, 102),
  ('51c29d65-4514-5131-bc0a-f7a48158b1db'::uuid, 4, 23, 146, 103),
  ('7c33a900-8b22-5a9e-a34e-7c274e6a21b0'::uuid, 4, 24, 147, 104),
  ('76cdfd4e-984e-51cf-b109-bac7fe371aa2'::uuid, 4, 25, 148, 105),
  ('4147926b-4f4c-5a4e-83c2-d3a82772d8e7'::uuid, 4, 26, 149, 106),
  ('89b3ea96-dbbd-5f0a-8651-0308bd27297d'::uuid, 5, 1, 150, 107),
  ('07ff3e13-7b95-55ab-aab7-ac48151e0d8c'::uuid, 5, 2, 151, 108),
  ('8f8a4c97-4077-5352-b040-a22de57f1b7e'::uuid, 5, 3, 152, 109),
  ('dae6ceff-5881-5f5c-a218-3a6317889caf'::uuid, 5, 4, 153, 110),
  ('38114afb-c035-5ae5-956f-723c4f408a0d'::uuid, 5, 5, 154, 111),
  ('018363b6-528d-5464-8f6a-575ede7fb4d4'::uuid, 5, 6, 155, 112),
  ('520a3c73-f830-5ea8-bb7f-36b6b5a53614'::uuid, 5, 7, 156, 113),
  ('a6cc868d-fbe9-5af4-94d5-1396172806b6'::uuid, 5, 8, 157, 114),
  ('3daf878e-35b0-55b7-8541-2ed16c89f822'::uuid, 5, 9, 158, 115),
  ('7354baf3-9248-50f2-a9bc-c31acadd98fa'::uuid, 5, 10, 159, 116),
  ('102a20da-507c-5cab-8d54-b9dc250aebb6'::uuid, 5, 11, 160, 117),
  ('78c71bbd-ead2-54c0-8b92-98f45101f849'::uuid, 5, 12, 161, 118),
  ('28d6c921-dae2-50d2-b6a0-a5e2423428a6'::uuid, 5, 13, 162, 119),
  ('42aaa1de-ab7b-5276-9032-91bff95ed818'::uuid, 5, 14, 163, 120),
  ('ccf7b1e1-a499-5013-99b2-4830d04fca71'::uuid, 5, 15, 164, 121),
  ('02841028-7fa9-5c47-9159-c4b47cc15cc1'::uuid, 5, 16, 165, 122),
  ('f901adf3-4ac4-5208-8cac-9261ab754144'::uuid, 5, 17, 166, 123),
  ('08e5edec-37ff-59c8-942b-b0fcd4fe251b'::uuid, 5, 18, 167, 124),
  ('364e1a73-f26c-5d78-9757-4d096939ebda'::uuid, 5, 19, 168, 125),
  ('9c4215a1-3276-5ea1-9982-970e15e17072'::uuid, 5, 20, 169, 126),
  ('3f5edc68-b41a-525a-8c80-1dd31a54500b'::uuid, 5, 21, 170, 127),
  ('a6c406c0-0103-5fcc-9871-5e1bc85a3833'::uuid, 5, 22, 171, 128),
  ('da8af0c4-83d8-570d-a76d-ba9f8a8d4161'::uuid, 5, 23, 172, 129),
  ('2902c53a-0143-5823-b423-fd9fe3dc2295'::uuid, 6, 1, 173, 130),
  ('6d5e1fa5-986d-5b45-a406-035e7c99c15c'::uuid, 6, 2, 174, 131),
  ('ad17a937-2fe2-519e-9f42-86f123c7e38c'::uuid, 6, 3, 175, 132),
  ('f2432d21-cbd5-5f7f-aec5-c958b3d7f626'::uuid, 6, 4, 176, 133),
  ('e4a7439f-a626-5e82-abaf-06bc10e30be8'::uuid, 6, 5, 177, 134),
  ('ab5b06cb-0463-5884-9c6f-bc21a5b345d8'::uuid, 6, 6, 178, 135),
  ('754cc69f-e7cf-5e64-ba22-2679bc1f609e'::uuid, 6, 7, 179, 136),
  ('4e77d43e-13ea-5b40-9c1e-dafbe4fd7210'::uuid, 6, 8, 180, 137),
  ('d738540e-3203-5d07-9f0f-01184e8346b0'::uuid, 6, 9, 181, 138),
  ('b2e41f0e-04f0-5a3b-94eb-850cd2d57575'::uuid, 6, 10, 182, 139),
  ('dc485e04-124e-516d-9061-98a2d00f4d57'::uuid, 6, 11, 183, 140),
  ('1bb1664d-4c74-5dfd-9001-ae7f0fd897f8'::uuid, 6, 12, 184, 141),
  ('35edaab3-b8c0-58db-8415-f52edb278a7e'::uuid, 6, 13, 185, 142),
  ('827ff70d-4671-51f6-a0aa-745cfebd058a'::uuid, 6, 14, 186, 143),
  ('c7b4cc13-41a1-57bf-b8f9-9c5a2ef4fb1b'::uuid, 6, 15, 187, 144),
  ('796fb7f5-7211-54d8-83dc-d15338978f46'::uuid, 6, 16, 188, 145),
  ('afdaff40-37c8-56af-ae39-78f1ed48e97e'::uuid, 6, 17, 189, 146),
  ('c0772c39-c5d2-5576-a853-6b67b734fca4'::uuid, 6, 18, 190, 147),
  ('53eebe4b-3a77-563a-84b1-b0ae2a42641c'::uuid, 6, 19, 191, 148),
  ('de1cac02-1435-56ef-9682-17ea2bc59bc4'::uuid, 6, 20, 192, 149),
  ('30394d47-559d-52eb-9c24-d6a8bbaeba36'::uuid, 6, 21, 193, 150),
  ('59c95af3-6785-5037-9294-f36861623e46'::uuid, 6, 22, 194, 151),
  ('e7976a3a-80b3-505d-abc8-858bd6a92a90'::uuid, 6, 23, 195, 152),
  ('3ea35fe7-87c2-5bc5-a138-ed2124298174'::uuid, 6, 24, 196, 153),
  ('3714140a-6ac1-56cd-a67b-a1c55a28970b'::uuid, 6, 25, 197, 154),
  ('a921ed27-35b4-5222-9699-d8dd343c1f79'::uuid, 7, 1, 198, 155),
  ('533e4252-0503-516b-9b3f-fcc7fad29ce1'::uuid, 7, 2, 199, 156),
  ('7768d3dd-52a9-55e1-be73-c2b2153fdb64'::uuid, 7, 3, 200, 157),
  ('e38a0b51-167e-583b-a179-5eafde3573f0'::uuid, 7, 4, 201, 158),
  ('776b15fe-c6a5-5aae-8876-404d392e0546'::uuid, 7, 5, 202, 159),
  ('c7ff7e62-3fed-5f39-9dbd-9ed081d41b0c'::uuid, 7, 6, 203, 160),
  ('d585de30-5927-5cbf-a88a-fc998547f793'::uuid, 7, 7, 204, 161),
  ('d674935a-006a-5328-9d83-767165ba5c5a'::uuid, 7, 8, 205, 162),
  ('3aec2726-7aa4-581b-ab9a-b36725c94e5c'::uuid, 7, 9, 206, 163),
  ('a973933b-ccb4-5f7d-9210-9a063ab4ed00'::uuid, 7, 10, 207, 164),
  ('ed66a36e-5a88-56f2-a2c7-3fdf72291b4e'::uuid, 7, 11, 208, 165),
  ('770b6d5f-bd8c-5c17-a05f-4721faaa1706'::uuid, 7, 12, 209, 166),
  ('672335a3-bca5-50a9-a61e-0d2d70bcd3c2'::uuid, 7, 13, 210, 167),
  ('48134c2e-dbea-5e66-9343-0b82457b9fc1'::uuid, 7, 14, 211, 168),
  ('22f748c4-e86a-57f2-8dfc-09a4885d1d24'::uuid, 7, 15, 212, 169),
  ('35da2974-7119-59d7-bdf3-d14bdf042064'::uuid, 7, 16, 213, 170),
  ('06821d8b-7d2f-5276-b374-2844bb3b99d6'::uuid, 7, 17, 214, 171),
  ('3dd370c2-01fe-54ba-95fc-3c5ef1637eb0'::uuid, 7, 18, 215, 172),
  ('5ec6a727-4a91-5545-9e35-7f858d66ced1'::uuid, 7, 19, 216, 173),
  ('1a2ffa4b-843c-5a51-a395-8402da85268f'::uuid, 7, 20, 217, 174),
  ('2dc6362b-360e-5e66-9d76-2c5e8662af80'::uuid, 7, 21, 218, 175),
  ('7a4e0aad-1065-50e6-bfec-a76b27e0ed9a'::uuid, 7, 22, 219, 176),
  ('6ec21cf5-83ce-55f4-a07c-355a8fb995bb'::uuid, 7, 23, 220, 177),
  ('fa24b60d-3716-5754-bf36-9f5a6843d7bb'::uuid, 7, 24, 221, 178),
  ('a56af3ac-cade-5ff7-bdce-38285c0c74e8'::uuid, 7, 25, 222, 179),
  ('5572cf90-36cf-55e2-824b-80f995d2d968'::uuid, 7, 26, 223, 180),
  ('da7656d3-0e9b-597b-ac1d-493e481b96f5'::uuid, 7, 27, 224, 181),
  ('74698b58-c87a-5870-a6dd-a6652b6da393'::uuid, 8, 1, 225, 182),
  ('26521f59-c2c1-5009-ac6b-a7a2e20a4244'::uuid, 8, 2, 226, 183),
  ('186b6b78-c334-5c53-9675-d7e5ca16b5b4'::uuid, 8, 3, 227, 184),
  ('1c051416-1a0d-564f-bb98-d523f047c49e'::uuid, 8, 4, 228, 185),
  ('5f6c9abe-859a-5d19-853a-7dc6bcce9c99'::uuid, 8, 5, 229, 186),
  ('54074d45-5916-5f81-b9e2-24977fe7b3b0'::uuid, 8, 6, 230, 187),
  ('f93505a1-733d-5810-85e8-c9d6ead98847'::uuid, 8, 7, 231, 188),
  ('8c4c452e-c6f6-5f26-a9a5-ded2342f7c9f'::uuid, 8, 8, 232, 189),
  ('5f67ad55-d966-5850-bf7c-244e5934bef7'::uuid, 8, 9, 233, 190),
  ('52c51646-b698-5749-ae7b-d554ab2e0240'::uuid, 8, 10, 234, 191),
  ('a52f663a-3fe2-5627-a250-4d1da0344831'::uuid, 8, 11, 235, 192),
  ('063d369c-847e-57b8-8451-b9c4049a1d9e'::uuid, 8, 12, 236, 193),
  ('d7a7375d-a258-5d7a-ae1c-44811ac8b58d'::uuid, 8, 13, 237, 194),
  ('ea336760-e828-5137-b3c0-b527db54dc8f'::uuid, 8, 14, 238, 195),
  ('36b953db-b59d-5c37-8572-47afd0081c48'::uuid, 8, 15, 239, 196),
  ('166d8cfb-d95b-581c-aaa6-c1689dc3d072'::uuid, 8, 16, 240, 197),
  ('644dde8f-bffc-57c9-b92e-ec8b078e378c'::uuid, 8, 17, 241, 198),
  ('39867eb4-c78d-5533-9fa6-0c4b2813b9c0'::uuid, 8, 18, 242, 199),
  ('41ef8c3c-f27f-547c-8272-9823215b809f'::uuid, 8, 19, 243, 200),
  ('c0b981e8-bc40-5a7f-a5cd-1aeb1aeedf2f'::uuid, 8, 20, 244, 201),
  ('7709eac2-d5bb-5169-aee7-0ed05c8b866e'::uuid, 8, 21, 245, 202),
  ('20b6357e-6e5d-58e3-814d-c7acd27bedc2'::uuid, 8, 22, 246, 203),
  ('465d788e-db67-5a57-8f4e-96306374e29c'::uuid, 9, 1, 247, 204),
  ('4090ef74-4ded-5132-9a43-cb791fd75c1f'::uuid, 9, 2, 248, 205),
  ('ce343377-a0c2-5201-9ff4-824789e73e89'::uuid, 9, 3, 249, 206),
  ('22657b95-75bd-59a7-a1f7-c21e5df3a6a5'::uuid, 9, 4, 250, 207),
  ('41b8c894-067c-540c-88b8-1a334f63f9e2'::uuid, 9, 5, 251, 208),
  ('7713400b-1007-558d-b717-ac7b02078eed'::uuid, 9, 6, 252, 209),
  ('f71fcde3-a7e0-5429-864a-cef0a28a9a3f'::uuid, 9, 7, 253, 210),
  ('e46f81c7-cdca-5d51-8738-55a0efa5a020'::uuid, 9, 8, 254, 211),
  ('54b42859-ce39-5f29-baa3-7a9aaff0d480'::uuid, 9, 9, 255, 212),
  ('72e14160-96c0-535c-9819-8ab194bd82cc'::uuid, 9, 10, 256, 213),
  ('97d7588e-37ef-5171-9640-6d51b0ac06ba'::uuid, 9, 11, 257, 214),
  ('2fb39a77-4405-52e0-83ee-a83f56d744ad'::uuid, 9, 12, 258, 215),
  ('4093ca08-4709-5a01-b09b-4fd1624d96cf'::uuid, 9, 13, 259, 216),
  ('949c47b5-e244-52bc-9153-03f632f3e5b8'::uuid, 9, 14, 260, 217),
  ('b27a8863-2d09-52bd-992f-2a73710c019d'::uuid, 9, 15, 261, 218),
  ('6aa47fcd-c4fb-5d93-9c82-3c5580df654a'::uuid, 9, 16, 262, 219),
  ('7f76ec46-2ddd-507d-8073-89a5df445d05'::uuid, 9, 17, 263, 220),
  ('654d7d9b-03de-5cfe-a0f2-0124a144bfcf'::uuid, 9, 18, 264, 221),
  ('aa46af4e-1c1b-50ae-b8c1-03167cabaecc'::uuid, 9, 19, 265, 222),
  ('ce25b1d0-ee42-5039-a068-263c69e918ce'::uuid, 9, 20, 266, 223),
  ('b2645ccd-6674-5c14-b607-432b9778545a'::uuid, 9, 21, 267, 224),
  ('ad8fbd77-4b75-55d5-9322-1d952fd8511c'::uuid, 9, 22, 268, 225),
  ('ae52684a-c28b-5318-92e0-5d1cc5ac5cf1'::uuid, 10, 1, 269, 226),
  ('cf3f5063-9758-597c-a509-2476bd48db2d'::uuid, 10, 2, 270, 227),
  ('6dc81d68-66ed-5adc-a6d9-ebdfac00662e'::uuid, 10, 3, 271, 228),
  ('e27cb9dd-52ff-5eed-8b6b-7f5680e6ae7f'::uuid, 10, 4, 272, 229),
  ('c640ea33-8098-56b9-85a3-15f539f2ece2'::uuid, 10, 5, 273, 230),
  ('24068540-4ffd-5c2c-86cb-1c89c0f669d6'::uuid, 10, 6, 274, 231),
  ('2fd57a10-eb7b-5c55-9f86-fd2716e2ed87'::uuid, 10, 7, 275, 232),
  ('98bdf26a-6fb0-57ec-80b0-092e57969285'::uuid, 10, 8, 276, 233),
  ('d7488f2f-ab30-530b-a0f2-9b26a8cb04ad'::uuid, 10, 9, 277, 234),
  ('0549fd4c-6be5-5e51-a1f6-4520eabebe83'::uuid, 10, 10, 278, 235),
  ('6a58e148-25f1-55f5-9568-c47c2c011c1e'::uuid, 10, 11, 279, 236),
  ('5fa3a1dc-bfbe-5b52-a8fb-880e0f0b7173'::uuid, 10, 12, 280, 237),
  ('35957a48-3965-592b-a5e7-2adfd23edfc0'::uuid, 10, 13, 281, 238),
  ('a5ca9719-6dfc-5ebe-8ce3-339422b185b5'::uuid, 10, 14, 282, 239),
  ('577ff67b-76f7-513b-adca-5871bbb950dc'::uuid, 10, 15, 283, 240),
  ('20eecfc9-6b84-54ae-aedc-1c389863baf9'::uuid, 10, 16, 284, 241),
  ('36036d7c-a216-5b60-a76c-a59bf988487b'::uuid, 10, 17, 285, 242),
  ('d7e9f660-01d8-5d0f-9136-9a85a20fc33b'::uuid, 10, 18, 286, 243),
  ('4cba4d7d-a414-57c7-9ed9-cbf8046345e2'::uuid, 10, 19, 287, 244),
  ('17f201ba-038f-5447-a92b-ea8274de3421'::uuid, 10, 20, 288, 245),
  ('a3c55aeb-a257-5eb2-ac90-fc258b138c7e'::uuid, 10, 21, 289, 246),
  ('4092e026-b5b7-5725-9f9e-564fc956c0e4'::uuid, 10, 22, 290, 247),
  ('7da0178d-42ee-5e98-aece-77ffbb45dd2d'::uuid, 10, 23, 291, 248),
  ('59b48665-2d47-587e-b406-84d2800c4161'::uuid, 11, 1, 292, 249),
  ('68cbb710-d119-5f34-a613-de8835c78c69'::uuid, 11, 2, 293, 250),
  ('21206ba6-6522-5849-be52-419e7d6d1007'::uuid, 11, 3, 294, 251),
  ('345642d1-7c5d-58fc-936d-78082196d9c0'::uuid, 11, 4, 295, 252),
  ('dd303fe0-52c5-5e61-97ae-1903616e625c'::uuid, 11, 5, 296, 253),
  ('558006ff-a18d-5fc9-ae98-edf66c5a28dc'::uuid, 11, 6, 297, 254),
  ('ea7df981-3c2b-53d4-96e1-cee2e5d5bd8e'::uuid, 11, 7, 298, 255),
  ('e31d82b3-e9e2-52bc-bd88-e52c7b53a764'::uuid, 11, 8, 299, 256),
  ('e3ba7db9-0794-5f78-95a6-dbd6a3e616be'::uuid, 11, 9, 300, 257),
  ('b3d7d4fe-8ba0-58f9-8d0e-38b9aaf3707f'::uuid, 11, 10, 301, 258),
  ('68c86280-614b-5223-b263-aed0f05b7b3c'::uuid, 11, 11, 302, 259),
  ('79cfb639-7996-5ed9-85ae-f73c0cf69e58'::uuid, 11, 12, 303, 260),
  ('aaafb4dd-18af-5b10-be4f-33a46f2cba0e'::uuid, 11, 13, 304, 261),
  ('d2d1e75f-f8c3-5507-9e3a-6019ac0c40a0'::uuid, 11, 14, 305, 262),
  ('9cd92c11-142e-5820-ac05-2ba0eb3f623c'::uuid, 11, 15, 306, 263),
  ('eedc812b-9def-5602-bd94-b8fc7ba8e7b6'::uuid, 11, 16, 307, 264),
  ('4a9c7846-0bb3-5a60-94df-2f6897d2a8dc'::uuid, 11, 17, 308, 265),
  ('4356c8d2-a33c-5a38-8b20-f4ac90387e6f'::uuid, 11, 18, 309, 266),
  ('c9686bb1-fe4a-58d4-b91f-601bade129fa'::uuid, 11, 19, 310, 267),
  ('1c8ca38f-494c-5a2e-bfa5-7e72e5d84a3e'::uuid, 11, 20, 311, 268),
  ('fc31544c-c615-5722-9494-5a728b6cf9be'::uuid, 12, 1, 312, 269),
  ('8ec0010d-66b0-5b69-aadb-eca273e4ae43'::uuid, 12, 2, 313, 270),
  ('731a6e56-3586-5647-a6ab-12df3dec98b6'::uuid, 12, 3, 314, 271),
  ('504b4319-d4ab-5b42-870b-fea27ef57652'::uuid, 12, 4, 315, 272),
  ('c1f2d5a6-e52b-5745-80dc-1ef79ac0846a'::uuid, 12, 5, 316, 273),
  ('0323848f-596e-579a-a7dd-1904e93c1f32'::uuid, 12, 6, 317, 274),
  ('73fd97d5-bdd1-55a6-889b-4ba0e1f184ca'::uuid, 12, 7, 318, 275),
  ('109ff419-4504-54fc-a4e6-0f7e45175049'::uuid, 12, 8, 319, 276),
  ('54b1d14e-7e6a-5640-a4f9-881b68a6d24f'::uuid, 12, 9, 320, 277),
  ('bcdc9d4e-84a9-5981-aa9d-14009abf363a'::uuid, 12, 10, 321, 278),
  ('c5abd659-9dd6-54e9-9e4f-6e906e375953'::uuid, 12, 11, 322, 279),
  ('74e55bc5-1757-5c97-bd67-5353fb4b592e'::uuid, 12, 12, 323, 280),
  ('80bd27a8-6356-5caa-9a38-661a03999602'::uuid, 12, 13, 324, 281),
  ('6c74bbe5-52cb-545d-bcf5-384fc0d1138b'::uuid, 12, 14, 325, 282),
  ('0e125e12-ab8c-5bfd-8a5d-6ae28790e249'::uuid, 12, 15, 326, 283),
  ('e0efacaf-93a3-521c-850d-fda4909c6796'::uuid, 12, 16, 327, 284),
  ('9f441bef-17a2-535a-a539-79a16389ad10'::uuid, 12, 17, 328, 285),
  ('4aaf79fa-f71f-5712-8a98-5facae7b4221'::uuid, 12, 18, 329, 286),
  ('cc075128-b483-5ba0-a24a-485bd1dc71fa'::uuid, 12, 19, 330, 287),
  ('08db04c7-6430-585e-8d87-f26f0376c7ad'::uuid, 12, 20, 331, 288),
  ('8a547039-7fc7-5382-9c3a-9b48a4102289'::uuid, 13, 1, 332, 289),
  ('06d1371f-27e8-5be1-a3df-a530cc9eefe3'::uuid, 13, 2, 333, 290),
  ('d8c13ac1-8ec0-5db3-adbe-39834eed0ff9'::uuid, 13, 3, 334, 291),
  ('c03bcd83-1ed7-5fb6-a4e9-dae2cd690f4b'::uuid, 13, 4, 335, 292),
  ('8615c579-1ee7-516d-8329-85243ee4db53'::uuid, 13, 5, 336, 293),
  ('68a6baaa-9e78-5479-aa65-63d51bc89b74'::uuid, 13, 6, 337, 294),
  ('38987042-d239-57ac-9bcf-58be792a8609'::uuid, 13, 7, 338, 295),
  ('e3884c35-d0b6-5d6d-9e7f-b4b1308c5981'::uuid, 13, 8, 339, 296),
  ('a9fb512f-6297-573c-8d34-be942749040d'::uuid, 13, 9, 340, 297),
  ('80d9fccd-c824-5946-8cce-04ecc42e570d'::uuid, 13, 10, 341, 298),
  ('112b1b4f-7388-538e-9734-dab36a241ad2'::uuid, 13, 11, 342, 299),
  ('9236841b-51b6-5a51-a400-9cf40915ec4e'::uuid, 13, 12, 343, 300),
  ('1e64d895-153a-5af6-b41e-45c6b9da78d4'::uuid, 13, 13, 344, 301),
  ('c64cedd2-5987-5859-b94d-77231e8c5eaa'::uuid, 13, 14, 345, 302),
  ('685c49ba-32f9-5e23-acab-d8552fdf4a20'::uuid, 13, 15, 346, 303),
  ('8fd78797-231c-5920-8d41-337bed37a7a9'::uuid, 13, 16, 347, 304),
  ('f89dd37e-bd2f-5d8b-baac-6f770fe4838c'::uuid, 13, 17, 348, 305),
  ('4f79112a-7e16-5786-a09f-c3f47eec42c1'::uuid, 13, 18, 349, 306),
  ('06acaaed-73cd-553d-a457-b534da4c99d0'::uuid, 13, 19, 350, 307),
  ('976c0600-48a2-5a5a-9ddb-85af02f42f69'::uuid, 13, 20, 351, 308),
  ('05427875-acf1-52fc-b7b9-15150a0edca2'::uuid, 13, 21, 352, 309),
  ('4619994d-18cb-57a3-aa86-ef5fd9551f1b'::uuid, 14, 1, 353, 310),
  ('00142c01-014f-53a8-b11d-1cf2bf832643'::uuid, 14, 2, 354, 311),
  ('f46f9df0-afdf-5c8c-95be-a4b002904a9d'::uuid, 14, 3, 355, 312),
  ('f02fa743-710e-5e6c-880b-e826a6c0056a'::uuid, 14, 4, 356, 313),
  ('38d68ef5-9223-5ff2-8954-88f3a9cc0ef3'::uuid, 14, 5, 357, 314),
  ('498e2179-7921-5c4c-8aa0-add0a77bf455'::uuid, 14, 6, 358, 315),
  ('d7836b8d-78b8-51ae-8e41-57e6f2d5de34'::uuid, 14, 7, 359, 316),
  ('e4860d3e-3ee3-5fc4-8b35-41209dd58a5e'::uuid, 14, 8, 360, 317),
  ('b612f887-6567-5b36-b3d8-71b680908d0e'::uuid, 14, 9, 361, 318),
  ('85347a66-3161-5a8d-9251-44225d44ad33'::uuid, 14, 10, 362, 319),
  ('013dc4ab-e838-53ac-ac0a-48d708431761'::uuid, 14, 11, 363, 320),
  ('c18ed3f6-ae4d-50fd-b360-6d7e7d73144c'::uuid, 14, 12, 364, 321),
  ('74a94584-d79a-55af-920c-e6fa1c59b5ad'::uuid, 14, 13, 365, 322),
  ('5c5f55d2-b389-5e93-94b9-3eb2897e1055'::uuid, 14, 14, 366, 323),
  ('d1ef9d43-816d-571d-a8ba-4ba76a09ba2d'::uuid, 14, 15, 367, 324),
  ('f925644a-c585-5773-8af3-f9a36c4cd2b0'::uuid, 14, 16, 368, 325),
  ('52f4c57b-461b-5689-bc83-625e8445b0b2'::uuid, 14, 17, 369, 326),
  ('8096e043-1d54-5521-ac96-7cdb39c6e872'::uuid, 14, 18, 370, 327),
  ('1a2a791f-b759-5930-8cdd-2829e879ce31'::uuid, 14, 19, 371, 328),
  ('28506229-594f-503e-80d4-5a3a1085320a'::uuid, 14, 20, 372, 329),
  ('4023fc2a-56e8-5980-bada-adc3306da091'::uuid, 15, 1, 373, 330),
  ('e3d036c1-9bf7-582a-8fdc-04202411acae'::uuid, 15, 2, 374, 331),
  ('aca6a7bd-05eb-5bcb-a0c0-02cd6ba77040'::uuid, 15, 3, 375, 332),
  ('24efab50-024b-519e-9029-d2d7f4a05a09'::uuid, 15, 4, 376, 333),
  ('31b7857e-57f3-5f7b-bcef-b36286ed3425'::uuid, 15, 5, 377, 334),
  ('1c04f11a-4feb-5b1d-956b-3661bab59c15'::uuid, 15, 6, 378, 335),
  ('d750cc27-0380-5a63-ae57-c94ac17315e5'::uuid, 15, 7, 379, 336),
  ('7957b305-bc76-56e8-b615-86768419c16d'::uuid, 15, 8, 380, 337),
  ('a36e5278-67e4-5dc0-b0ec-7e8440a51419'::uuid, 15, 9, 381, 338),
  ('58c98ce0-5227-5f11-bf08-49d656a7808b'::uuid, 15, 10, 382, 339),
  ('f1fe8414-a662-5131-9e76-a258572724ea'::uuid, 15, 11, 383, 340),
  ('d8bc6075-554e-5b94-9a5b-df5e1686741a'::uuid, 15, 12, 384, 341),
  ('512c0d0a-584d-5403-9bcf-d9c74d8ceb43'::uuid, 15, 13, 385, 342),
  ('cf4d6a07-a4c5-5761-9bad-5a84df508105'::uuid, 15, 14, 386, 343),
  ('0dacd2e3-2a45-5ad7-a13d-42f6b718c484'::uuid, 15, 15, 387, 344),
  ('7213df53-3f20-5649-8b69-0dacbe10f0d7'::uuid, 15, 16, 388, 345),
  ('a25229c0-af37-50d8-86db-83c809276632'::uuid, 15, 17, 389, 346),
  ('132415fc-1b04-527c-a000-1361223954c5'::uuid, 15, 18, 390, 347),
  ('5ebbe531-b8e4-58e6-9eb8-b9340f28458c'::uuid, 15, 19, 391, 348),
  ('6da6ead7-b546-54e5-b84f-a16a56ef3f2a'::uuid, 15, 20, 392, 349),
  ('c1be6404-2a36-51f7-8d0f-43b1a6d26250'::uuid, 15, 21, 393, 350);

-- Through a free range first: ordinals and course places are unique.
update public.units u set ordinal = 20000 + r.course_order, course_order = 20000 + r.course_order from reorder_units r where u.id = r.id;
update public.units u set section_id = r.section_id, ordinal = r.ordinal, course_order = r.course_order from reorder_units r where u.id = r.id;

-- A placement or jump test is remembered as a course place: the same unit's
-- new place, and for a unit that was split, its last part.
update public.profiles p set placed_through = coalesce((
  select m.course_order from (values
    (1, 1), (2, 3), (3, 5), (4, 6), (5, 7), (6, 8), (7, 9), (8, 10), (9, 12), (10, 13), (11, 14), (12, 15), (13, 16), (14, 17), (15, 18), (16, 19), (17, 21), (18, 22), (19, 24), (20, 27), (21, 29), (22, 30), (23, 31), (24, 32), (25, 33), (26, 34), (27, 36), (28, 37), (29, 39), (30, 40), (31, 42), (32, 43), (33, 45), (34, 46), (35, 47), (36, 49), (37, 51), (38, 54), (39, 57), (40, 58), (41, 59), (42, 60), (43, 61), (44, 62), (45, 64), (46, 66), (47, 68), (48, 70), (49, 72), (50, 73), (51, 75), (52, 77), (53, 79), (54, 80), (55, 82), (56, 84), (57, 86), (58, 88), (59, 90), (60, 91), (61, 93), (62, 95), (63, 96), (64, 97), (65, 98), (66, 99), (67, 101), (68, 103), (69, 105), (70, 106), (71, 107), (72, 108), (73, 110), (74, 112), (75, 114), (76, 116), (77, 118), (78, 120), (79, 122), (80, 123), (81, 124), (82, 125), (83, 126), (84, 127), (85, 128), (86, 129), (87, 130), (88, 131), (89, 132), (90, 133), (91, 134), (92, 135), (93, 136), (94, 137), (95, 138), (96, 139), (97, 140), (98, 141), (99, 142), (100, 143), (101, 144), (102, 145), (103, 146), (104, 147), (105, 148), (106, 149), (107, 150), (108, 151), (109, 152), (110, 153), (111, 154), (112, 155), (113, 156), (114, 157), (115, 158), (116, 159), (117, 160), (118, 161), (119, 162), (120, 163), (121, 164), (122, 165), (123, 166), (124, 167), (125, 168), (126, 169), (127, 170), (128, 171), (129, 172), (130, 173), (131, 174), (132, 175), (133, 176), (134, 177), (135, 178), (136, 179), (137, 180), (138, 181), (139, 182), (140, 183), (141, 184), (142, 185), (143, 186), (144, 187), (145, 188), (146, 189), (147, 190), (148, 191), (149, 192), (150, 193), (151, 194), (152, 195), (153, 196), (154, 197), (155, 198), (156, 199), (157, 200), (158, 201), (159, 202), (160, 203), (161, 204), (162, 205), (163, 206), (164, 207), (165, 208), (166, 209), (167, 210), (168, 211), (169, 212), (170, 213), (171, 214), (172, 215), (173, 216), (174, 217), (175, 218), (176, 219), (177, 220), (178, 221), (179, 222), (180, 223), (181, 224), (182, 225), (183, 226), (184, 227), (185, 228), (186, 229), (187, 230), (188, 231), (189, 232), (190, 233), (191, 234), (192, 235), (193, 236), (194, 237), (195, 238), (196, 239), (197, 240), (198, 241), (199, 242), (200, 243), (201, 244), (202, 245), (203, 246), (204, 247), (205, 248), (206, 249), (207, 250), (208, 251), (209, 252), (210, 253), (211, 254), (212, 255), (213, 256), (214, 257), (215, 258), (216, 259), (217, 260), (218, 261), (219, 262), (220, 263), (221, 264), (222, 265), (223, 266), (224, 267), (225, 268), (226, 269), (227, 270), (228, 271), (229, 272), (230, 273), (231, 274), (232, 275), (233, 276), (234, 277), (235, 278), (236, 279), (237, 280), (238, 281), (239, 282), (240, 283), (241, 284), (242, 285), (243, 286), (244, 287), (245, 288), (246, 289), (247, 290), (248, 291), (249, 292), (250, 293), (251, 294), (252, 295), (253, 296), (254, 297), (255, 298), (256, 299), (257, 300), (258, 301), (259, 302), (260, 303), (261, 304), (262, 305), (263, 306), (264, 307), (265, 308), (266, 309), (267, 310), (268, 311), (269, 312), (270, 313), (271, 314), (272, 315), (273, 316), (274, 317), (275, 318), (276, 319), (277, 320), (278, 321), (279, 322), (280, 323), (281, 324), (282, 325), (283, 326), (284, 327), (285, 328), (286, 329), (287, 330), (288, 331), (289, 332), (290, 333), (291, 334), (292, 335), (293, 336), (294, 337), (295, 338), (296, 339), (297, 340), (298, 341), (299, 342), (300, 343), (301, 344), (302, 345), (303, 346), (304, 347), (305, 348), (306, 349), (307, 350), (308, 351), (309, 352), (310, 353), (311, 354), (312, 355), (313, 356), (314, 357), (315, 358), (316, 359), (317, 360), (318, 361), (319, 362), (320, 363), (321, 364), (322, 365), (323, 366), (324, 367), (325, 368), (326, 369), (327, 370), (328, 371), (329, 372), (330, 373), (331, 374), (332, 375), (333, 376), (334, 377), (335, 378), (336, 379), (337, 380), (338, 381), (339, 382), (340, 383), (341, 384), (342, 385), (343, 386), (344, 387), (345, 388), (346, 389), (347, 390), (348, 391), (349, 392), (350, 393)
  ) as m (old_order, course_order)
  where m.old_order <= p.placed_through order by m.old_order desc limit 1
), 0)
where p.placed_through > 0;

-- The new units, in the places just made for them.
insert into public.units (id, section_id, ordinal, course_order, slug, title_en, summary_en, grammar_focus, register_max, review_form_ids, status) values
  ('c21af30e-a032-559c-88d9-f21ba6218c44', 1, 3, 3, 'una-pizza-y-un-helado', 'Order something to eat', 'Una pizza y un helado', array['pedido.por-favor', 'articulo.indefinido', 'conj.y-o']::text[], 'informal', '{}'::uuid[], 'published'),
  ('e551cc4a-51f8-5bc3-b622-f282574765c7', 1, 5, 5, 'soy-sofi', 'Say yes, no and who you are', 'Sí, soy Sofi. Dale, chau', array['saludos', 'ser.pres.1sg']::text[], 'informal', '{}'::uuid[], 'published'),
  ('51f741ad-8b30-5f88-b276-def598972e00', 1, 12, 12, 'mas-despacio', 'Ask people to repeat and explain', '¿Me repetís más despacio?', array['pres.1sg-2sg.vos', 'frases.supervivencia']::text[], 'informal', '{}'::uuid[], 'published'),
  ('52ed28b8-cddf-5e92-90d1-b6bd340958b9', 1, 21, 21, 'ella-es-canadiense', 'Say who is American, Canadian or Australian', 'Ella es canadiense, él es yanqui', array['adj.nacionalidad.genero', 'adj.invariable.-e']::text[], 'informal', '{}'::uuid[], 'published'),
  ('a06ab1ae-046c-5512-a08a-396115a61ceb', 1, 24, 24, 'mi-mujer-y-mi-suegra', 'Talk about your wife, husband and in-laws', 'Mi marido, mi suegra y mi gato', array['sustantivo.genero', 'posesivo.mi']::text[], 'informal', '{}'::uuid[], 'published'),
  ('717c6f22-cf0f-5b8c-a62b-d957e4a78b8d', 1, 26, 26, 'tiene-ocho-anos', 'Count to ten', 'Mi hijo tiene ocho años', array['tener.pres.1sg-3sg', 'numeros.0-20']::text[], 'informal', '{}'::uuid[], 'published'),
  ('9252c22b-b649-5c44-bdc0-38dfde8810fe', 1, 27, 27, 'tengo-veinte-anos', 'Count to twenty', 'Tengo veinte años', array['tener.pres.1sg-3sg', 'numeros.0-20']::text[], 'informal', '{}'::uuid[], 'published'),
  ('884d830f-ece7-555e-88ae-6dc226d8a7ac', 1, 29, 29, 'cuarenta-y-cinco', 'Count to a hundred', 'Mi papá tiene sesenta y dos años', array['numeros.21-100', 'tener.pres.1sg-3sg']::text[], 'informal', '{}'::uuid[], 'published'),
  ('632a31fa-437b-5d17-aac0-2954c405c53d', 1, 36, 36, 'quinientos-pesos', 'Say prices in the hundreds', 'Sale quinientos pesos', array['cuanto-sale', 'costar.pres.3', 'numeros.100-1000']::text[], 'informal', '{}'::uuid[], 'published'),
  ('741ce538-2218-5d5d-91bc-5c18673ea36b', 2, 3, 39, 'casados-y-solteros', 'Say who is nice, married or single', 'Mis hermanos son lindos y solteros', array['pron.sujeto.plural', 'ser.pres.1pl-3pl', 'tener.pres.1pl-3pl', 'posesivo.su', 'adj.descripcion']::text[], 'informal', '{}'::uuid[], 'published'),
  ('f131167d-74ca-532f-ad07-9ef1151c8126', 2, 6, 42, 'esta-arriba', 'Say where it is and whose it is', 'El cargador está arriba', array['estar.pres.1sg-3sg', 'estar.ubicacion', 'articulo.definido', 'estar.pres.3pl']::text[], 'informal', '{}'::uuid[], 'published'),
  ('0f358a4c-271a-566d-86bb-31d354f25ed3', 2, 9, 45, 'hay-una-plaza', 'Find places around the city', 'Hay gente en la plaza', array['hay', 'contraccion.del-al']::text[], 'informal', '{}'::uuid[], 'published'),
  ('d675862c-ac12-54e4-85c4-179b61dd611b', 2, 13, 49, 'estoy-medio-nervioso', 'Say you''re so-so, or what''s wrong', 'Más o menos, estoy medio nervioso', array['estar.estado', 'estar.pres.1pl-3pl', 'adj.estado.genero', 'porque', 'medio.atenuador']::text[], 'informal', '{}'::uuid[], 'published'),
  ('77c9f78f-f685-5342-80f1-882f6214d26c', 2, 15, 51, 'estas-listo', 'Say you''re ready or in a hurry', '¿Estás lista? Estoy apurado', array['estar.estado', 'estar.pres.1pl-3pl', 'adj.estado.genero', 'porque', 'medio.atenuador']::text[], 'informal', '{}'::uuid[], 'published'),
  ('a99fdaee-854e-5578-a225-0be8f8707003', 2, 17, 53, 'estudio-a-la-noche', 'Say what you do at night', 'A la noche estudio y tomo mate', array['verbos.-ar.pres', 'hacer.pres.1sg-3sg', 'a-la-noche']::text[], 'informal', '{}'::uuid[], 'published'),
  ('5d92fa15-6159-59d1-956f-2f12e01f68a4', 2, 18, 54, 'siempre-camino', 'Say what you always or never do', 'Siempre camino, nunca tomo taxi', array['verbos.-ar.pres', 'hacer.pres.1sg-3sg', 'a-la-noche']::text[], 'informal', '{}'::uuid[], 'published'),
  ('7e447ea4-e9fd-5b18-869e-4e8e339a4471', 2, 20, 56, 'me-ayudas', 'Ask for help with your castellano', '¿Me ayudás? Necesito una palabra', array['verbos.-ar.pres', 'hacer.pres.1sg-3sg', 'a-la-noche']::text[], 'informal', '{}'::uuid[], 'published'),
  ('681a4e9c-3a53-593e-b652-3850e662c361', 2, 21, 57, 'busco-una-palabra', 'Say what you look for, teach and miss', 'Busco una palabra. Extraño a mi familia', array['verbos.-ar.pres', 'hacer.pres.1sg-3sg', 'a-la-noche']::text[], 'informal', '{}'::uuid[], 'published'),
  ('223dc7bc-90fe-5775-823d-a6fcbbd82470', 2, 28, 64, 'nos-traes-un-tenedor', 'Ask for what''s missing on the table', '¿Nos traés un tenedor y un cuchillo?', array['querer.pres.1sg-2sg.pedido', 'traer.pres.2sg.vos.pedido', 'para', 'sin', 'querer.pres.1pl-3pl']::text[], 'informal', '{}'::uuid[], 'published'),
  ('211fdb30-d72f-5e40-b24d-d68e70926a6e', 2, 30, 66, 'de-que-laburas', 'Talk about your job', '¿De qué laburás? Soy abogada', array['tener-que.infinitivo', 'ser.profesion.sin-articulo', 'sustantivos.profesion.genero']::text[], 'informal', '{}'::uuid[], 'published'),
  ('3e3ccc45-b587-5d81-a947-274b5db0a275', 2, 32, 68, 'tiene-que-ayudar', 'Say what people have to do at work', 'Es psicóloga, tiene que ayudar', array['tener-que.infinitivo', 'ser.profesion.sin-articulo', 'sustantivos.profesion.genero']::text[], 'informal', '{}'::uuid[], 'published'),
  ('f818513a-baa5-5936-8787-c52431cb8500', 2, 34, 70, 'leo-y-escribo', 'Read, write and learn', 'Leo libros y aprendo castellano', array['verbos.-er.pres', 'verbos.-ir.pres']::text[], 'informal', '{}'::uuid[], 'published'),
  ('14c7ae1b-3ee3-5f76-a20e-27a98696aedd', 2, 36, 72, 'compartimos-todo', 'Say what you share, get and send', 'Recibo mails y comparto mi departamento', array['verbos.-er.pres', 'verbos.-ir.pres']::text[], 'informal', '{}'::uuid[], 'published'),
  ('2e2a044c-5472-5ddf-acde-589af0463ea6', 2, 39, 75, 'en-el-primer-piso', 'Say which floor, and what''s wrong', 'El encargado vive en el primer piso', array['hay.casa', 'tener.casa', 'alquilar.pres', 'sustantivos.casa']::text[], 'informal', '{}'::uuid[], 'published'),
  ('2f523c7c-b359-5520-957a-9183d6737801', 2, 41, 77, 'la-cama-y-el-sillon', 'Say what''s in each room', 'En el living hay un sillón y dos sillas', array['hay.casa', 'tener.casa', 'alquilar.pres', 'sustantivos.casa']::text[], 'informal', '{}'::uuid[], 'published'),
  ('eb1a9154-e834-553f-8943-88e868c4bee5', 2, 43, 79, 'los-dias-de-la-semana', 'Name the days of the week', 'Nos vemos el lunes', array['hora.es-la-son-las', 'hora.y-media-y-cuarto', 'numeros.21-100', 'dias.semana']::text[], 'informal', '{}'::uuid[], 'published'),
  ('e998e287-4207-51e1-ba01-09091a2b85fc', 3, 2, 82, 'esta-incluido', 'Ask what''s included in your room', '¿El desayuno está incluido?', array['tener.pres.1sg', 'hay', 'a-nombre-de']::text[], 'informal', '{}'::uuid[], 'published'),
  ('8d60a210-8649-54cd-a8f6-984af85f3bef', 3, 4, 84, 'esta-enfrente', 'Say where things are in the barrio', 'La farmacia está enfrente, al lado del banco', array['preposiciones.lugar', 'al-lado-de', 'enfrente-de', 'entre']::text[], 'informal', '{}'::uuid[], 'published'),
  ('090e52a6-3031-557c-a379-8e4f51c85210', 3, 6, 86, 'la-carniceria', 'Find the shops you need', 'La carnicería está al lado del almacén', array['preposiciones.lugar', 'al-lado-de', 'enfrente-de', 'entre', 'a-la-derecha']::text[], 'informal', '{}'::uuid[], 'published'),
  ('5158ead4-5cf4-5602-89cf-455a5e2cae47', 3, 8, 88, 'quiero-aprender', 'Say what you want to learn, be and know', 'Quiero aprender castellano', array['querer.pres', 'poder.pres', 'ir.pres', 'ir-a.lugar', 'salir.pres']::text[], 'informal', '{}'::uuid[], 'published'),
  ('8bd4758c-e5e7-519b-81dc-943f039eb918', 3, 10, 90, 'vuelvo-temprano', 'Say when you start and when you''re back', 'Mañana empiezo temprano, pienso volver a las once', array['querer.pres', 'poder.pres', 'ir.pres', 'ir-a.lugar', 'salir.pres', 'diptongo.e-ie.o-ue']::text[], 'informal', '{}'::uuid[], 'published'),
  ('926f5a00-a817-519b-b1cb-262cba133230', 3, 13, 93, 'pasa-toma', 'Have a friend over', 'Pasá, hago unos mates', array['imperativo.vos.afirmativo', 'enclitico.me-te']::text[], 'informal', '{}'::uuid[], 'published'),
  ('593694b8-2f07-51bc-8f15-01e7164b3acf', 3, 15, 95, 'dejame-aca', 'Ask the way and get dropped off', '¿Cómo llego? Dejame en la esquina', array['imperativo.vos.afirmativo', 'enclitico.me-te']::text[], 'informal', '{}'::uuid[], 'published'),
  ('99d56ffd-246b-508a-9a51-8aa1416c782f', 3, 21, 101, 'es-muy-chico', 'Say if clothes are too big or too small', 'Esta remera es muy chica', array['adj.concordancia', 'ser.descripcion']::text[], 'informal', '{}'::uuid[], 'published'),
  ('f5535aa9-849e-5d16-895b-b35fa4bffc31', 3, 23, 103, 'celeste-y-blanco', 'Name more colors', 'Celeste y blanco, verde y rosa', array['adj.concordancia', 'ser.descripcion', 'demostrativos.este-ese', 're.intensificador']::text[], 'informal', '{}'::uuid[], 'published'),
  ('cceba8fd-7ed0-56b1-bf8f-0a93b51de75e', 3, 25, 105, 'lo-llevo', 'Shop for clothes', '¿Puedo probarme esto? Lo llevo', array['adj.concordancia', 'ser.descripcion', 'demostrativos.este-ese', 're.intensificador', 'demostrativos.neutro']::text[], 'informal', '{}'::uuid[], 'published'),
  ('5bef8de9-49b6-594e-886d-f69932c48b54', 3, 30, 110, 'todos-los-dias', 'Say when and how often', 'Los sábados ceno tarde', array['reflexivos.pres', 'antes-despues', 'los-sabados']::text[], 'informal', '{}'::uuid[], 'published'),
  ('3ab24c7c-be52-57ac-8cc6-880c6f6c2656', 3, 32, 112, 'duermo-la-siesta', 'Talk about sleep, siesta and merienda', 'A veces duermo la siesta', array['reflexivos.pres', 'antes-despues', 'los-sabados', 'frecuencia']::text[], 'informal', '{}'::uuid[], 'published'),
  ('c81d99ce-50d0-5b0d-be27-f9f4b78bab14', 3, 34, 114, 'series-y-musica', 'Say what you like doing at home', 'Me gusta cocinar y mirar series', array['gustar.infinitivo', 'encantar', 'tambien-tampoco']::text[], 'informal', '{}'::uuid[], 'published'),
  ('96938299-528b-5b4c-b8c5-903baa5a8369', 3, 36, 116, 'me-encanta-viajar', 'Say what you love doing on vacation', 'Me encanta viajar, a él le gusta nadar', array['gustar.infinitivo', 'encantar', 'tambien-tampoco', 'gustar.le-nos-les']::text[], 'informal', '{}'::uuid[], 'published'),
  ('632e501f-edbf-5df4-9a01-5a58adf4dc50', 3, 38, 118, 'chip-y-datos', 'Get a SIM and spell out your email', 'Necesito un chip con datos', array['enclitico.me-te', 'imperativo.vos.afirmativo']::text[], 'informal', '{}'::uuid[], 'published'),
  ('c0e53cf5-14c3-5b5c-8453-39c37c55e074', 3, 40, 120, 'en-verano', 'Talk about the seasons', 'En enero es verano y hace calor', array['hace-calor-frio', 'esta-nublado', 'llueve', 'estaciones']::text[], 'informal', '{}'::uuid[], 'published'),
  ('813f2461-1b4f-5417-a797-80ccac16827d', 3, 42, 122, 'mucha-humedad', 'Talk about the heat and the date', 'En febrero hay mucha humedad', array['hace-calor-frio', 'esta-nublado', 'llueve', 'estaciones', 'meses']::text[], 'informal', '{}'::uuid[], 'published')
on conflict (id) do nothing;

-- otro-cafe → otro-cafe · una-pizza-y-un-helado
update public.units set title_en = 'Order another drink and some toast', summary_en = 'Otro café y una tostada' where id = 'ecf3c9a9-33e3-5e2e-b2b7-aa09f082c128';
update public.forms set unit_id = 'ecf3c9a9-33e3-5e2e-b2b7-aa09f082c128', position = 7 where id = '1b3b7ecb-2575-55bf-96b4-8d0e6999b663'; -- tostada
update public.forms set unit_id = 'ecf3c9a9-33e3-5e2e-b2b7-aa09f082c128', position = 8 where id = 'c2d5a465-c03a-51a3-b24e-26b577623136'; -- tostadas
update public.forms set unit_id = 'ecf3c9a9-33e3-5e2e-b2b7-aa09f082c128', position = 9 where id = 'f674ed42-32b8-5724-a2f5-43e4f08bd5d5'; -- tostado
update public.forms set unit_id = 'ecf3c9a9-33e3-5e2e-b2b7-aa09f082c128', position = 10 where id = '4afcaf35-36ac-5c14-bbea-ad2b37631363'; -- u
update public.forms set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44', position = 1 where id = '5f5a8007-82c8-58a5-ad50-4981d8ac1258'; -- pan
update public.forms set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44', position = 2 where id = 'e22d6ca8-f902-5e5c-b803-a8b6f9a8dd78'; -- sándwich
update public.forms set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44', position = 3 where id = '7b4f83d2-056b-50a1-a705-c50086486426'; -- pizza
update public.forms set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44', position = 4 where id = '41ec3fdc-9097-52d8-8109-689f95bde562'; -- helado
update public.forms set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44', position = 5 where id = '35ba7c21-461f-589e-a45b-8308f92530da'; -- torta
update public.forms set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44', position = 6 where id = '41e0dac1-e480-59a8-a68e-a08fc6d2423b'; -- comida
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = 'c1c16639-e10b-5deb-a5eb-732483f52659';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '4d59194e-00c6-5bf0-a1d6-6c436449dc18';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '3d25b961-2979-5fc4-98b3-fb88dcaf29f6';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '94752a3e-4524-5c1d-b497-1c01d8ec192a';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = 'b83c1351-6894-54c2-afdd-10302c059e42';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '055f8d81-736a-5674-a436-641ae8bc1898';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '6fccfc4d-58fd-52bb-934c-d5d7b053531d';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '23519559-006d-546d-9335-2e48183488f1';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = 'e4e15d4b-99b0-5240-a1e5-53ee2dcfa5ba';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = 'faf3677f-a14b-5d1a-aa82-3c60eeddf822';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '1ba76a1c-dc70-53b1-8d7d-f203b3c5f944';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = 'eec23d4c-fd1e-5eea-9399-d65d6a9372b4';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = 'c97b9a5e-5e1c-543a-a01d-84ee778f4ae8';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '05099708-e991-5b14-86b8-866f02d72f16';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '49da022b-8f80-53bb-abcd-fe82df434d78';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '6dd55595-a672-5ea4-bd32-d5c6b0a65e50';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = 'e11c12c7-c6b3-5367-b94f-e39d73e6408f';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '94869b88-fd7b-5ff6-8e5b-845db00a8a30';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '043c294e-dc9e-565d-943b-8860e6e15ad8';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = 'e1ebb83a-5653-50a3-adf7-6cb86e3adbeb';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '30262d67-370b-589e-8ef9-f3efac786999';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = 'ae60c5df-6337-5881-a1be-2f186eebe848';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = 'd1f6a125-5382-57e9-abf0-482811832d1d';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '6306fa36-149f-5535-b09f-180a4f211e4f';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '69c24158-e1d9-5501-a1c8-be03fc773589';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = 'd7c4cca0-b9e6-5066-b4a6-27c0811a0be5';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '3fe86fb6-90fa-59e3-9c08-8950909c25bd';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '26709032-c057-5623-bbde-19b85cd0bfcd';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '819b4f4f-80de-5f68-abc2-698714f3cf3d';
update public.sentences set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = '5d16c512-a94a-5981-a21d-49a5ddd0b753';
update public.tips set unit_id = 'c21af30e-a032-559c-88d9-f21ba6218c44' where id = 'fbdb815c-fea1-52ae-84c1-af98b2814484'; -- Un or una

-- hola-che → hola-che · soy-sofi
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 2 where id = '91232a84-b055-5e03-8ed2-651c79f5b376'; -- che
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 3 where id = 'd108cd6e-fae2-5ab6-bfeb-054b01041ee6'; -- todo bien
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 4 where id = 'e9cbde0c-a5ec-5577-b4dd-d98a2cdbc7d8'; -- qué onda
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 5 where id = '29eded5c-4d3e-5ecb-bc7b-87744378cc64'; -- cómo andás
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 8 where id = 'e987c76e-fff4-5bb1-8495-2897a6baa97d'; -- Sofi
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 9 where id = 'a0c76088-db09-545c-9b35-a28ec314414d'; -- Juan
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 10 where id = '4b3d9c85-07c4-572b-9723-8de6a728af94'; -- Martín
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 11 where id = 'ef9adde3-0a4b-5455-bfad-0d70b236e93f'; -- Lucía
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 12 where id = '3dfed415-c09f-5c72-84f6-47f13fe54405'; -- Nico
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 13 where id = '06e3ee33-4221-5d61-bb23-62347baeef3c'; -- Fede
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 14 where id = '140266d1-06f6-5ce4-9be6-eab3dbdbc772'; -- Mati
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 15 where id = 'd1c572e1-6fa8-5cd9-b407-391a8871762a'; -- Pablo
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 16 where id = 'fec44cf4-d1bd-584c-a4b4-a705207d77e4'; -- Diego
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 17 where id = '15434277-addc-5782-9d76-432820ba64a2'; -- Santi
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 18 where id = '4a689b58-a8f4-5574-b6b4-f78d38269097'; -- Cami
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 19 where id = '036dd23b-0baf-5adf-8b08-ab2cbdaa61fb'; -- Juli
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 20 where id = 'e04deac3-5570-5018-8202-0af9dbca4604'; -- Mica
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 21 where id = 'c86a9c72-5ebf-55ff-a307-e24c5c54e16e'; -- Belén
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 22 where id = '0dbf6020-7d89-5742-b893-0c9ac266c047'; -- Rocío
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 23 where id = '6731b9a6-2dd4-507f-99da-2342bfdd4ca2'; -- Ana
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 24 where id = '21a66bc7-8334-5cc4-8446-eeb2a1e6fd6a'; -- José
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 25 where id = 'ddcbdcfd-00c9-5ff6-afa3-524fcef95a0e'; -- Carlos
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 26 where id = 'fdb364f3-9ed7-5436-b7df-fb287737ab74'; -- Raúl
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 27 where id = 'e333e319-afd1-5bb6-ac90-37d85b8eaa79'; -- Marta
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 28 where id = 'b404a223-22d3-5263-85e1-dc82faf9b75c'; -- Elena
update public.forms set unit_id = 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', position = 29 where id = 'b16a02a5-eef7-58d1-b7d7-c04228cd0f0b'; -- Susana
update public.forms set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7', position = 1 where id = '191fd126-be91-54fb-8848-9f3aa180ca5d'; -- sí
update public.forms set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7', position = 2 where id = '0de01ef6-29bb-557a-a7e2-f6c1110d951b'; -- no
update public.forms set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7', position = 3 where id = '0bfd7395-526c-589d-8619-1794b0f8fc11'; -- yo
update public.forms set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7', position = 4 where id = '7bad7209-3158-537f-98a7-d94d162d56e9'; -- soy
update public.forms set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7', position = 5 where id = '1ba6168d-09bd-509b-bbc8-765e8806ba16'; -- dale
update public.forms set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7', position = 6 where id = '770fb250-ae00-510b-8a63-ea9277702843'; -- bueno
update public.forms set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7', position = 7 where id = '16df9c18-3edc-5405-8f9e-b7d5c3ec1103'; -- chau
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '82aae391-c42e-5040-986f-698c6261d414';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '0c6e3148-d3fe-541b-9a21-517bfd8b7412';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = 'be45b7fe-3a53-5445-932b-d237855acd67';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '9cb199b6-96fa-5c86-8a5f-94a0d61b3d36';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '28f9f0e1-99db-5d49-93ad-f165d9b6a56c';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = 'c61fdedd-3e12-5770-a2d6-3168f752dbe3';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '876908ac-68f3-5c35-a71a-f07d5aca0f87';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = 'd49a0542-5858-5645-b250-79e5e9130d98';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = 'b65498d1-369d-5baa-b6be-70c018304d80';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = 'da58266e-6714-5777-9a62-32a024ad3739';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '2d03a391-e99b-5cce-bf78-022955e656da';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = 'a8194c57-fccc-5d91-ac23-63e4a6fada38';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '2149cc59-4308-581a-be24-172a7eac6700';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = 'e9dfb1b4-669f-5ada-b5ba-b9061f6e1d74';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '929e7bb6-b506-5874-8824-2eb1ca4092df';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '4e07e0e2-13ca-5166-8bb6-22852f93e677';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '71d8aedb-ca65-50cf-ae25-e5e7ab4df50a';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '8b414c29-2270-513d-9a7d-c7c60673c970';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = 'f7ba5953-ae2f-5eb5-9d81-f282bb1566e7';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '1200d3ac-b8e0-57f1-b522-e34ab06a3703';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '8ca1aa94-8899-56f3-9246-6ed9fe06fdb1';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '6d1b0a3a-2b98-5a6a-a361-abd23f1eac9c';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '2177a806-74c6-5bdd-98ec-aca3b0126561';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = 'feaa89a1-6b9e-5bb4-82f9-7a8ddd94eae3';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '722ef4ba-7c41-5c0b-a071-cdc590a78d48';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = 'ac2cf255-f388-51c6-a0a1-ed796b1965d3';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '51e736f0-d7b2-5889-a185-58e641a0ca46';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '4796f3e2-ec89-5bd9-b5ef-d07269761800';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '56768073-4b62-5b75-bb16-f50b5c9abee4';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '235b8253-e682-5abb-b1d8-1974efbc1b14';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '5120cbc5-9319-5266-b540-976490be8d9e';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '26224075-8934-5b2c-8d29-20a217b280e5';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = 'fa1c2f39-963a-562b-97e0-18b732aae6fa';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '02ae0012-1f4d-5618-ab75-618edf66284e';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '76e47818-5750-5966-9a1a-e71de6ef6691';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '0cc3df1b-b244-502a-bc5b-d8f1ba6e0c5a';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '27e04db1-70ed-5823-a8e2-322104f21379';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = 'd0d1a08d-3e37-5356-990d-134fc9940293';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '4e615e68-69ae-57aa-96fc-63ca8b67583e';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '4a28c391-80de-5c47-836f-d64e344e778d';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '2aa1191b-ba7b-556e-acc4-b05f7bd94e79';
update public.sentences set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '812c164a-5f81-5aa4-b71f-c284ba73bb4d';
update public.tips set unit_id = 'e551cc4a-51f8-5bc3-b622-f282574765c7' where id = '03c07d66-92a9-54f3-842f-c123a1a62c76'; -- Soy

-- no-entiendo → no-entiendo · mas-despacio
update public.forms set unit_id = '9f62a065-778e-5620-b8e5-de9e6f8c2907', position = 9 where id = 'e657f1ae-ea6c-534f-ab82-4c588ff4c310'; -- poco
update public.forms set unit_id = '9f62a065-778e-5620-b8e5-de9e6f8c2907', position = 10 where id = 'dba1c634-0bcd-545e-a72f-f73f1ca47180'; -- repetís
update public.forms set unit_id = '51f741ad-8b30-5f88-b276-def598972e00', position = 1 where id = 'bc260843-41a2-537d-847f-782817c58d02'; -- más
update public.forms set unit_id = '51f741ad-8b30-5f88-b276-def598972e00', position = 2 where id = '179c5fbd-23a6-541b-856c-166a65464785'; -- despacio
update public.forms set unit_id = '51f741ad-8b30-5f88-b276-def598972e00', position = 3 where id = 'b50f42f6-2f5d-5711-a506-2a02bfb5f875'; -- me repetís
update public.forms set unit_id = '51f741ad-8b30-5f88-b276-def598972e00', position = 4 where id = 'bacd3417-72d8-527e-9373-e589af0609dd'; -- cómo se dice
update public.forms set unit_id = '51f741ad-8b30-5f88-b276-def598972e00', position = 5 where id = 'f562cddd-d50a-5293-83c4-35764a00a7cf'; -- qué
update public.forms set unit_id = '51f741ad-8b30-5f88-b276-def598972e00', position = 6 where id = '362f0833-932c-58c6-82d5-420b9b9940fe'; -- significa
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = 'c77279bb-bfd1-5ef4-8633-676a2618c772';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '8dcc2295-3de0-5bbe-a7e3-1850ecc93474';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '5f13412b-1dcb-5786-aefd-ea09742859bc';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = 'b49b418a-dfbe-52da-8026-93bb0e58fa26';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '432812f6-c0db-5e3e-b188-4bac3985d5b7';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = 'dc8fb840-61a6-58e7-921c-c41f2654aa4d';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '79bdb7de-bf79-5976-8ef8-c3aff24eb56d';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '9fa52b0b-3026-553e-add2-a0e3c742ba25';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '716758da-fe0f-582e-89cc-b7d079323102';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '10702e93-126b-546f-b47f-72a192b6ccce';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = 'c8bfe9de-46ba-531f-a146-6451940e97fa';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = 'd3f9b821-c241-5e55-b9be-6a561d108426';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = 'd8fc6856-8e2a-5d3e-aed5-83dee0884f02';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = 'ea2d811c-00ec-5193-b587-39a464e503fb';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = 'ec47fd3e-d28e-5050-9f86-fbfd060bc7fe';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '677fdf56-8f4f-597d-9911-6f260c8ca46c';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = 'c0ec29bc-1d34-5559-b501-afa810a680dc';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = 'f7e10d39-af37-5678-9785-79ccfd90942a';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '1895d113-0f90-5e90-ae0a-579f3583e026';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '1a48995f-159f-56f6-a941-782e825c799d';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = 'bf6001f6-076d-5e8b-a4d2-3136abbc8d9e';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '0a76a13c-fb02-5685-8ac7-6f248b749e35';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '256e4628-330e-51bb-a488-f41144b94cbb';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '34a6f1bc-fbd9-586f-bcb2-9c0336d9b7e1';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '677c274a-b6ab-5e4e-867c-7c4ec7f75493';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = 'b44fa944-2247-5915-93dd-0125d3a8d083';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '3e3ad15e-63de-59fd-80b6-266f2bac26c2';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '454e70e3-3bdf-5590-8912-38dcd75f170b';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '6f6db565-ab31-5a1c-8655-5ed8c8f020a5';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '5deaf111-20d4-5b85-9f68-a621c3b31bc5';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = 'e9e152d1-5ec7-5c6b-bf25-940cdc5d5230';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = 'b5634c25-d3f6-52bd-a606-3af0fe839b14';
update public.sentences set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = 'd2d5765e-b4f8-5b03-9908-5f249d84a9a8';
update public.tips set unit_id = '51f741ad-8b30-5f88-b276-def598972e00' where id = '1f4b9651-418e-5f8c-a3bf-03626d36a760'; -- Ask for help

-- de-todos-lados → de-todos-lados · ella-es-canadiense
update public.units set title_en = 'Meet people from everywhere', summary_en = 'Él es brasileño, ella es francesa' where id = '9a6d16d1-11b7-53bd-b0b9-676b76d00eb2';
update public.forms set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9', position = 1 where id = '3d28c4d2-8499-59e1-9d7e-fca62f20d5df'; -- estadounidense
update public.forms set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9', position = 2 where id = 'c7bfcc29-c54d-5ee1-9619-e675d4ea7cbe'; -- canadiense
update public.forms set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9', position = 3 where id = 'af876fa2-562f-55df-b4ee-7a03ab2c1a39'; -- australiano
update public.forms set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9', position = 4 where id = '0c08572e-bff0-5e58-b299-96c1c8fdc781'; -- australiana
update public.forms set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9', position = 5 where id = '23e31e8a-4d18-5ff0-b5dd-ab4deeea6502'; -- yanqui
update public.forms set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9', position = 6 where id = 'e0089177-6642-546e-9435-e55d360e9164'; -- paraguayo
update public.forms set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9', position = 7 where id = 'e52b1107-e3a0-5315-b49f-1a7bbae8af87'; -- paraguaya
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '6e72c867-ed0c-58eb-800a-8d669925b5eb';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '100b0862-276b-504f-be6e-12812d268bd8';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = 'f8a59f46-422d-58f3-b44a-769d81568966';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '0195f91b-46c8-5025-9963-7a7c06f529a7';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '13093272-e8d6-5417-9cbd-ce85b0810fa3';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '42bfd3e0-5fb1-5790-87b0-840cb0efc572';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = 'a70e540d-8d9a-5d87-94c9-9cc3e34d86f9';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = 'ddcea319-8246-5bd0-8977-328cb205536d';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = 'e58ff4b7-68ca-51fe-b96a-61ab0f511303';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '37f57351-363f-5404-b8b1-c749fd0860ca';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '59887fd1-e426-5495-9ee0-d44375cb00da';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = 'b76bb062-cb9d-5831-901c-e6d026ea8d3c';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '9977ee54-7ff7-53aa-bd5c-5c8492aca6b5';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '2510a181-951d-5646-a9b8-e6ee5cdf253b';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = 'cda008fc-2051-5ec3-8a64-b13227c676d1';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = 'aae98c60-7a0a-54b7-a03d-55f551ee2c56';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '4559f978-5865-51a4-a05c-97552954b9b6';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '985c037c-c5cf-56b5-bf03-91e3e2720830';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = 'bf95627e-fb5a-5ae0-8116-fb89c429df54';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '720e9273-0515-5f94-8a50-257aa5d566f8';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '20b12e16-38be-55d5-a4cf-6a15228d43bb';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '62be4905-2f6f-5d3d-ab65-c24c4eb46744';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '235edff7-11b4-58d8-96ba-9fb687b9e08f';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '253a89c8-5699-5397-8386-cc0b95c8b71a';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '30cfb70d-2115-5ac0-9ea3-4c5f36748ab5';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '93383429-d1bf-5098-aa00-3f6d11dff295';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = '86da695b-670b-566e-9178-756a28cee805';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = 'a1c4a08c-020b-541f-a3ee-6abe947d7976';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = 'df936213-e34e-5946-8f49-65ffa83ced1e';
update public.sentences set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = 'e196e792-80b8-5a13-b92a-ae5f4c251353';
update public.tips set unit_id = '52ed28b8-cddf-5e92-90d1-b6bd340958b9' where id = 'afd99159-1ede-599a-b6f1-a58bd49520a1'; -- Small letters

-- tios-y-primos → tios-y-primos · mi-mujer-y-mi-suegra
update public.units set title_en = 'Talk about the whole family', summary_en = 'Mi tía, mi primo, mi sobrina' where id = 'd8b23128-fa60-5c82-9370-1cad2fff44fc';
update public.forms set unit_id = 'd8b23128-fa60-5c82-9370-1cad2fff44fc', position = 9 where id = 'af29aa68-c393-515e-8171-99a9fc15f62a'; -- bebé
update public.forms set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb', position = 1 where id = '5dc8e4e0-6333-53e8-b9f6-d39c20545063'; -- mujer
update public.forms set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb', position = 2 where id = '03eb0374-ac2b-5d14-850b-426e76d542f1'; -- marido
update public.forms set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb', position = 3 where id = '165aca76-f5a6-590d-8599-4abac8f03a38'; -- suegro
update public.forms set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb', position = 4 where id = '7307a5b7-d2b1-5781-90bc-1da0c4e8d623'; -- suegra
update public.forms set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb', position = 5 where id = 'f9dc080d-c204-5d7a-93a0-e6a70bc496cf'; -- cuñado
update public.forms set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb', position = 6 where id = '99c78eea-a646-53ef-9435-4d7486c1b149'; -- cuñada
update public.forms set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb', position = 7 where id = '781ba670-6cf9-579d-86f2-36d5bffac0de'; -- gato
update public.forms set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb', position = 8 where id = '77eabb71-5958-5012-86c3-59f55609788b'; -- gata
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '624129ca-865c-541f-ac16-ebe635232f81';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '9e26adee-ad69-537e-8c69-9cb136b77b3f';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'afc6ef6c-8cf1-55fd-8adf-ea24a784b3ca';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '6aab2c72-8a93-59e4-b1ab-0179d612cac2';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'c07b292b-e45c-516b-a30c-a7c2b2fc2c36';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'caf15b1b-18a4-5585-987b-503df2fda7df';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'f0c4c46f-aef5-5de4-a93b-2d92123fb399';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '28c246a6-fab4-5f6a-b980-2236c353993b';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '54bb3662-02b6-508a-bc91-03d92fa1fcc7';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'a189efad-3179-5d3a-b217-779da2acdcbf';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'b0f18694-f773-577b-9b87-63c8603bbe0c';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '432f616e-03e9-5e6a-bc30-02359c3d8c58';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '354fb364-7a0a-583f-bd9d-781ba2f1cea3';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '7ff16052-8964-579e-8a3d-42b0a12ac06a';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '8cb1057d-447b-52f7-80dd-a175a497b9a9';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '027ba81a-9e0c-540d-b24f-9123b85ce8c1';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'a32c403e-acc0-5203-b933-27edbdd8e9e8';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '8d322fa1-4143-5f13-9905-d3d305112949';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '8163f498-dbcf-56d4-91a6-633326878340';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'd22f03c2-c7ba-5d4d-b4c4-f5dad8559b53';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'ac745ea0-69d4-574e-b8ba-e39699624c47';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '8b6195d8-6666-5ff5-b029-9339ca4eabb5';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'e1ec6727-04c0-50c0-adf4-51945f2a2345';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '6fe80289-fcf2-527b-8e26-361967e9213b';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '8d0586ff-0188-5d45-9013-f00bcd26af78';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'ed2667d0-545f-5779-8791-8030112820b6';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '7207ad02-b98f-5b70-aba0-f2e85706b9a3';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'acacb910-38bb-53d3-b9e5-20751f84578f';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'ad599d08-15b1-5697-a9c8-00e3a4c433fe';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '745b77ea-5036-581a-9328-6a6d4f52107d';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'f617bcbf-58d1-528e-9d8a-1a4b242d99c4';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '3e604e84-3181-5a02-b217-dc2fa56114fd';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '4204c807-5989-5434-a2e2-f6c04f3fa3ba';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '86f980ea-69cd-5f4b-af6f-d805581d8574';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '18c114da-da49-50ab-be7f-f9c09cb911d0';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '246f2075-4979-54a8-ac69-f18244284bfe';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '3dba52d2-3e51-500d-bc7f-219247ac11ff';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'fffd4a43-d6cd-5c3c-8727-ceb0a35f8985';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '0d7db255-1a5c-52ff-b04f-f8a3c7e46fa8';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'f00137ee-ff0c-5450-8fc1-6a0888152c0b';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '30add704-8632-5d32-8fcc-50262eccaaeb';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'bb7b7ab6-4c8f-5ca7-8b4d-c4f3237c5a23';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'e029fc3f-2a75-5086-9bd6-4f03335daf27';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = '997fd268-e79d-5d13-852f-51f79a3e30ee';
update public.sentences set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'f8fa3467-ab27-5091-8e2d-3e8602db8d74';
update public.tips set unit_id = 'a06ab1ae-046c-5512-a08a-396115a61ceb' where id = 'fe0d5efc-b8e4-5065-82e5-0d79dc803125'; -- Mi mujer, mi marido

-- cuantos-anos-tenes → cuantos-anos-tenes · tiene-ocho-anos · tengo-veinte-anos
update public.units set title_en = 'Ask how old someone is', summary_en = '¿Cuántos años tenés?' where id = 'b28a06e8-ef82-54f0-bbf4-5314e84a7ece';
update public.forms set unit_id = 'b28a06e8-ef82-54f0-bbf4-5314e84a7ece', position = 7 where id = 'dcd9a8b8-969f-5540-94a1-3d66620dfdb4'; -- uno
update public.forms set unit_id = 'b28a06e8-ef82-54f0-bbf4-5314e84a7ece', position = 8 where id = '087f71fc-d3d5-5c44-8e4d-570e675cd056'; -- dos
update public.forms set unit_id = 'b28a06e8-ef82-54f0-bbf4-5314e84a7ece', position = 9 where id = '605e8daf-6abd-564b-8d3c-79d1f98c952e'; -- tres
update public.forms set unit_id = 'b28a06e8-ef82-54f0-bbf4-5314e84a7ece', position = 10 where id = '6c376868-60dd-5e1b-ac91-65e3e46e4eed'; -- cuatro
update public.forms set unit_id = 'b28a06e8-ef82-54f0-bbf4-5314e84a7ece', position = 11 where id = 'ada611d4-ceb3-5a36-b012-4257fb9ade58'; -- cinco
update public.forms set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d', position = 1 where id = 'f43f47cf-21b2-54ea-aa31-055ea1b7a3fe'; -- seis
update public.forms set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d', position = 2 where id = 'd1948761-2083-5d17-978c-6ae81a7f6307'; -- siete
update public.forms set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d', position = 3 where id = '6ab1bab9-505c-5f5f-83f8-44e0be2d2529'; -- ocho
update public.forms set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d', position = 4 where id = 'a72b1a24-4424-5533-8ad0-48585bc9f1bd'; -- nueve
update public.forms set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d', position = 5 where id = '3768ad72-3f75-590d-9240-7a765d91b19f'; -- diez
update public.forms set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d', position = 6 where id = 'faa639cc-45d7-580b-9b17-194f5c70134d'; -- cero
update public.forms set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe', position = 1 where id = '8d063d51-06ec-5ef3-974a-08a0f4cc0bf3'; -- once
update public.forms set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe', position = 2 where id = '6a4f6470-520d-5652-9623-b0b66f2b7812'; -- doce
update public.forms set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe', position = 3 where id = '8baf584d-ce5f-54c7-ae2c-16c8f46ad431'; -- trece
update public.forms set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe', position = 4 where id = '05984bc4-233f-51c0-a8f1-425ba1ab053d'; -- catorce
update public.forms set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe', position = 5 where id = '1cc90313-16f6-5727-b8e6-af727238ee21'; -- quince
update public.forms set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe', position = 6 where id = 'daab0cf6-783e-5c13-8dc0-5bcb7b5dfac8'; -- dieciséis
update public.forms set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe', position = 7 where id = 'c15e2450-8f73-54f2-aa05-616737e80b34'; -- diecisiete
update public.forms set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe', position = 8 where id = '99a81166-c990-5bd3-bb79-44d5e70abe49'; -- dieciocho
update public.forms set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe', position = 9 where id = '15ab1ef6-1e7c-592b-a866-f212bd2b6a61'; -- diecinueve
update public.forms set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe', position = 10 where id = '42a55e00-4f0c-556c-8524-7386cfbafc43'; -- veinte
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = 'ea30070e-dbba-5e7a-b137-37eca581f300';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'c5efb613-3df1-567d-a1a6-b217bf9e4d87';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '7afdbe03-cb63-58aa-bdff-ab1cf2bc54db';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '8f3eb958-ee43-51a9-a52c-2097b088e6af';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '4819026b-a656-5541-9594-555421476596';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '61560cac-bae7-561b-b55d-24d66d30c979';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '5e3fa2f4-6139-50f4-a064-addb46785602';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = 'c76a3fac-a157-5fce-a926-bb63b572f4fd';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '2b02fd4c-11ee-5e33-955a-b1fc32aefe4e';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '521ce225-10f3-55c1-8aca-21e321e8cc8c';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '01431a00-cb7d-52fe-ad69-646ea4d49471';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '10a14177-faae-5267-aaef-0ae07458e726';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '894d798e-5999-579b-9978-ddc3dfe0d0d6';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'd90472fa-ada9-5f08-9a2a-7328b9bf41e3';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '6d2c9606-641b-5f0e-9b88-f55a19138999';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'a417eac8-0a5f-58c3-8b2d-6e0e174efa84';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '405694dc-77a9-5617-b8f3-07ce00fe4c5b';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'ae2d590a-ff2e-5433-a32f-25b892f7eb6a';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'efe7e59c-f973-5ca5-8c33-e63f1ec285eb';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '8a18ed64-2bfd-5213-82b1-68bdcc10dcba';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '1e26f9c6-ff82-5780-b585-29dcdbf93a46';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'd50afb17-8132-5518-96b7-d8ae31f5fce0';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'edaa4186-de65-539c-a26d-e26942110115';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '867352b3-9c89-56d9-835f-7a9c632ac207';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'e280bd06-064f-5bd8-927b-ceecdd5509bc';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '928c9757-e5ae-5c8c-a252-cb3101b01f9a';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '1795bd35-2238-5cf4-b572-ae41e8dc8689';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '5a5c8f1d-4c25-5a72-a16f-bf88cfb720a6';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '6bc9605d-e266-5018-ace5-35482fda3c41';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '21e36a27-aa20-5d13-afe0-5958ad202386';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '9c529ad5-49c0-5c1d-aae9-03128dc2b1d4';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '8a89e168-7388-5fee-b223-1932ded6d59f';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '9d367b98-7028-5721-ab0a-389a37392a28';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '4f975aa9-11c2-5ce1-8619-a55fcaf0b640';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '79f180bb-038e-5afc-9227-0b23823cf668';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '985f37c9-8a97-5230-a4ce-a3cb684e7ffb';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '3e7abf05-031c-5492-9c0e-dc603414ba83';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '06fcdfe0-3bb6-54f2-91a3-d1074a12d095';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '160466fb-b228-55b7-bcd2-d91b100819de';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '3fb6742c-1316-516f-9bb9-75efdd90e477';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '4e4a2b0e-bfa1-56d4-9556-5928dbae8b42';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '35ffdc40-c18b-53ea-a02e-7e190547faa5';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'c0e2e18a-779b-5c18-81f1-e3a83f1cd4e4';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '570f460c-4b8d-5a62-9266-ef9b300de774';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '69296c5a-e5c6-5c89-9086-2bf344aed139';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '73447b92-d791-55f9-9b55-0341032146e7';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '724b6b5c-7d50-5fc3-ae28-4b098001249c';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = 'e07367ba-3e99-5f01-bb72-b3181df90c20';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '0aeeaa74-99ce-530b-b65f-38bc58e44968';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '85b6b447-3031-5943-8238-4dfbece038d9';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '87d476e2-0f66-5c7f-a3e9-e5d9d86783cf';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'be8c00f1-585d-518a-870e-beb8b199f9df';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = 'e5b7241a-98c1-5da9-97ca-f4191c21a620';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '2d93a7eb-2245-5566-b27b-ca9e65ba854d';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '9c1d0411-724d-5629-a891-4705ba505ff0';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '940aeba6-691e-55a7-8b3b-caac2b5685cc';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '958b0ae9-380c-550e-9cc4-714728931983';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'b9d89f24-0075-5960-906b-97bbebf867c9';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = 'e43d7080-b91f-5aa2-9b9a-7b0cbb4183a8';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = 'f4a5b854-fd1a-5b94-8bd3-6170e9472cca';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '8590d3b6-1bb4-55d7-b98b-c84dc6705e6c';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '736a0d8a-25e9-57c2-93bc-7259aefc02c2';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '29195bfe-08a9-5552-a886-f4f15ce8c7d7';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'a2d2f6a0-ea3e-577d-9a04-319b9eb098a3';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = 'a577696f-ae41-58d7-b2fd-7ad0099d0657';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '823337d0-3a1b-505b-9545-9593e2e9e185';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '15de5c36-f2ab-5e73-8212-20759d3c6add';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'bdbaccf7-0adf-5159-85e7-96c78095001e';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = 'aa977ee1-7014-56fb-80ee-889d6086cfb9';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '9b8c6c38-99fd-5427-b987-65790f15da5d';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '1b3edd07-fdb9-5986-9288-a74f0646cd12';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '13b0e353-aabd-5155-856d-6ab5b05262b9';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '12f3b1c7-d829-5596-ada4-6c52ca3e2891';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '7f8e65aa-2ecb-5e2b-803c-ff38526db221';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '47d4db0f-613f-51fb-a48e-8a310c245a88';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '19a773f1-63aa-5f37-b967-651df950e75e';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '248615e1-132b-5091-aaef-1388892007d0';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '2c94d5b8-f402-58b6-82e5-54ff3ee44529';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = 'a4898681-28ab-5722-ac9a-32b8e2ea838c';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '142eae77-1fe9-578e-b20b-bfd6be8923af';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = 'ea465bf7-1dbb-55fc-9720-d35b99c81868';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '2c8c6477-302a-5ea6-b90a-317dffba5e44';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '22575865-a5a6-5100-bb57-216a69df0c64';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = 'b565a6b7-d307-546d-b91b-0a0841017987';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '3faa16bb-b5d1-5f05-84d9-a161f9a3f41a';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '51a15ac1-6a03-597f-98fe-2607cb2c64f9';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '7e3eed90-c2d6-597e-88ce-18956b136d6b';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '959dbbb4-4ef1-5811-87d5-cbbd63ec1b75';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'b8d87254-214d-57ef-8bd0-6549cdf303ed';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '5ba58186-837a-5525-8c5f-f370847cc3a1';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'e167bda2-09d3-5416-a1db-ce2da1331089';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '211c6629-0d17-5064-9009-8f82816e545f';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'dfec00cc-c143-5a54-b35f-78177f33ccbf';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '62424824-1dc9-5eb2-a0d9-5a9c89592f9d';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'd1f520a9-5709-581b-aebc-a1e794acb863';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '6e2ba356-614c-5041-9627-adf65aea2a34';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '2eacc53d-534b-5690-9125-521576332bf4';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '0ee95beb-a7a4-5332-bdcb-f479154b9e03';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '5da96d40-0b05-570e-8e5f-5ab5dc08c729';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'b841c102-f0ed-5a84-be4f-8d591269032a';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '33001462-3206-5514-91f1-32f305465171';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '75f56b7d-bffc-520d-bf8c-b9a51e59fc4b';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '6fcb916d-eeb7-51a4-8bb5-5cf18a184b2a';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = 'f8c94a7f-877a-5031-8605-6ab40c86e424';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '851b2840-fbb6-504a-98d3-fd24b03d0f7d';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '13782222-c883-5832-85ac-6cabb7949bda';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '594c88a1-2489-524c-bc82-7cd6f424ac48';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '1932faf5-245a-5906-a5d5-d23049c4636d';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '5b023700-4e5f-5dff-b476-1797e1563159';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '7dea6cc9-bf6e-5ac5-852d-0410317c3ac6';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '058886f1-d06d-509c-89cd-868ec6de20b2';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'f7cebda5-b40d-5b52-ad0c-a479a983d814';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'd55d2a56-93fa-518d-86c3-f19f296c0364';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '4f093fb3-c9a5-5bd3-bfb1-ab2352d4e550';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '7522cff1-20f8-5ebe-bbcd-6e6db9cfd241';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '1ebc4d17-5f4e-53de-a041-8cf1cb852433';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '0e0e3087-734e-5e30-a149-e417b3036f84';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'f550cfff-33d4-52b7-be4d-5101c0d048f8';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '0be4e847-c580-55c4-b3c2-1c956e11920b';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '8f72feff-9a09-53d5-abb0-77c0b1d6d90e';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '09007841-0d6b-5b55-925b-f2377d7c5954';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '49a94888-4dc1-5f2b-b248-106cb048290b';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '9302a40b-c522-5708-b236-72a31d5bf41c';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '99a11a3e-6604-5cb6-b6be-ddd0a5f64a4a';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '1aaa6209-c546-5bd1-ac7a-cc8711ab0cd5';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'f9e0fdb4-97fb-54c5-af97-764a1d63ed09';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '2abba2ab-7334-5e8b-9895-858543bb01d6';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'ee5a0c0e-5d01-55a4-9a17-0a045556c84d';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '8fd65e20-b703-5a1f-88af-e8712e6ae8c7';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = 'b90e385c-d2c0-5021-bd8d-41d816b3d1b4';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '5efe6a2b-8790-5ed2-badf-a9cee00e9c8f';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'dc296ff8-50b4-5c0e-8d16-5963ce8acf3e';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = '57f86ebd-bd7d-58a3-9ec3-79f941675203';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'c755b67d-7f48-576e-8516-8275f07eb3f9';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'c37f1e57-10cd-5f80-b934-6a44a50faa8a';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '764e36b4-7b0a-5d42-8186-e0b99c63cda2';
update public.sentences set unit_id = '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d' where id = '20c8b749-e200-5b2f-9234-2cf6c126921c';
update public.sentences set unit_id = '9252c22b-b649-5c44-bdc0-38dfde8810fe' where id = 'e7b28e36-6687-5342-b548-38e3555676ea';
insert into public.tips (id, unit_id, title_en, body_md, status) values ('ce23b5b6-752c-576c-8cfc-9c3e82436936', '717c6f22-cf0f-5b8c-a62b-d957e4a78b8d', 'Cero to diez', 'With **seis**, **siete**, **ocho**, **nueve** and **diez** you can count to ten. **Cero** is zero. The number goes before **años**: *Mi hijo tiene ocho años.*', 'published') on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, unit_id = excluded.unit_id, status = excluded.status;
insert into public.tips (id, unit_id, title_en, body_md, status) values ('95422350-ece0-5505-9a2d-31d2e32773f4', '9252c22b-b649-5c44-bdc0-38dfde8810fe', 'Eleven to twenty', '**Once**, **doce**, **trece**, **catorce** and **quince** are words to learn one by one. After that it gets easy: **dieci** plus the number, as one word: *dieciséis*, *diecisiete*. Then comes **veinte**: *Tengo veinte años.*', 'published') on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, unit_id = excluded.unit_id, status = excluded.status;

-- treinta-y-cuatro → treinta-y-cuatro · cuarenta-y-cinco
update public.units set title_en = 'Count from twenty-one to thirty-nine', summary_en = 'Tengo treinta y cuatro años' where id = '5bf591c3-3ee8-5b3a-a7b6-4b774ad64dc0';
update public.forms set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac', position = 1 where id = '4ba5e52a-60a6-5d36-b920-8f2297cbe3ba'; -- cuarenta
update public.forms set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac', position = 2 where id = 'bb296e24-e942-5f3d-a8c3-7e25eda6d267'; -- cincuenta
update public.forms set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac', position = 3 where id = '40d7592a-557a-5c44-9194-a4b36ab2a967'; -- sesenta
update public.forms set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac', position = 4 where id = 'e9839865-4fb0-58cc-9fe2-bf7dae3b7e54'; -- setenta
update public.forms set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac', position = 5 where id = '13693459-81b2-51b2-aa9f-b89d887c5013'; -- ochenta
update public.forms set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac', position = 6 where id = 'ad289208-07cb-58ca-a0d5-ae7f87174e86'; -- noventa
update public.forms set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac', position = 7 where id = '6897246d-7395-5994-ba9a-55a235fb7b47'; -- cien
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = '7b2fb53c-abb1-5910-85ff-efe583b62c4d';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = 'ba3966ce-6f5d-5f59-9e47-c597421cb548';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = '42b6f378-0dae-5813-aafb-b326c1d06f13';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = '377e6e61-1646-513c-9f54-7e5d6069b6b3';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = 'c29fba7c-2317-5998-ba47-1d4b1bd8e338';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = '606cc1e2-6daa-5e5f-a752-1764a6773fb7';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = '61f36180-8f05-56c0-96e0-78d2a2edfd3a';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = 'cfa3bd4e-c462-5e12-a05a-48094bb43043';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = '3bc6864e-1d1f-5b96-99d1-9c0a22a35060';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = 'e010c2e4-1335-5127-9979-ef0ec630c2ba';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = '4d93a2c5-e8c7-579c-89bd-18096e8c1708';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = '14917213-c30d-584a-a4fd-271b51cdd1d8';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = 'a4b3ecdb-8645-5a36-8dd3-8bcd12665308';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = 'e49a9de0-cda2-5f96-8c3d-e3e5cf76e849';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = '968c2dac-8d56-55a1-b346-ae9d3107b480';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = '1b950c38-9324-5a66-9c07-bbb852a6764d';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = '4940b8a0-3e2f-5a9a-bc30-6597520d9cf9';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = '80f5abf8-7e5e-581c-91b1-5b6b13979d37';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = '2cf91616-a324-5a48-903d-c78a031221b9';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = '4571789e-cb98-5ecd-a92e-ed787507abb4';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = 'fced1c18-a899-5f89-9061-c8534e827a2e';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = '2dd808aa-ce63-5cf3-913e-554be66babe2';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = '411f4fad-4263-5a32-9a16-663805129dc0';
update public.sentences set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = 'f3cbb56e-1ee4-5f80-b761-5f1571137697';
update public.tips set unit_id = '884d830f-ece7-555e-88ae-6dc226d8a7ac' where id = 'ae4f4e8b-34af-508d-8cc2-5d3e4564bb87'; -- Sesenta or setenta?

-- cuanto-sale → cuanto-sale · quinientos-pesos
update public.forms set unit_id = 'd8cb78a0-5a7d-5c09-9f7f-9e905e0d2e59', position = 1 where id = '35f4d814-766f-5cdf-a34f-4c33d7f1c2b1'; -- pago
update public.forms set unit_id = 'd8cb78a0-5a7d-5c09-9f7f-9e905e0d2e59', position = 2 where id = '75bb1592-4893-55e8-a181-93b950981b6f'; -- pagás
update public.forms set unit_id = 'd8cb78a0-5a7d-5c09-9f7f-9e905e0d2e59', position = 3 where id = '26a5a8cd-b1c6-5140-b6c6-cf2804f5047f'; -- paga
update public.forms set unit_id = 'd8cb78a0-5a7d-5c09-9f7f-9e905e0d2e59', position = 4 where id = '94332f93-1064-506e-a4bf-77b3e333d7d9'; -- pagar
update public.forms set unit_id = 'd8cb78a0-5a7d-5c09-9f7f-9e905e0d2e59', position = 5 where id = '3a347cba-05b1-519a-9254-30a4ec4641c6'; -- compro
update public.forms set unit_id = 'd8cb78a0-5a7d-5c09-9f7f-9e905e0d2e59', position = 6 where id = 'c5a24754-2153-52f9-ba79-d1db87b24cca'; -- comprás
update public.forms set unit_id = 'd8cb78a0-5a7d-5c09-9f7f-9e905e0d2e59', position = 7 where id = 'eb699f31-d940-50a3-b9cf-1b9d57330d42'; -- compra
update public.forms set unit_id = 'd8cb78a0-5a7d-5c09-9f7f-9e905e0d2e59', position = 8 where id = '1b349bc2-5895-5047-a40c-f0d4da1bd12c'; -- comprar
update public.forms set unit_id = 'd8cb78a0-5a7d-5c09-9f7f-9e905e0d2e59', position = 9 where id = '5a4a6b40-b465-573b-a4fb-c67168d6f613'; -- efectivo
update public.forms set unit_id = 'd8cb78a0-5a7d-5c09-9f7f-9e905e0d2e59', position = 10 where id = '002e13bf-e65d-570b-b032-37e8fd36be61'; -- tarjeta
update public.forms set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d', position = 1 where id = '446aeebf-fa32-54c1-8bf3-e952abc823eb'; -- ciento
update public.forms set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d', position = 2 where id = '826bd421-dbea-5967-b5bc-a8ebdcb5ef3b'; -- doscientos
update public.forms set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d', position = 3 where id = '752bc042-b242-5f0a-bf6c-86eaccd4abeb'; -- trescientos
update public.forms set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d', position = 4 where id = '462406e0-b3a2-5c86-bf15-c0d95290c866'; -- cuatrocientos
update public.forms set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d', position = 5 where id = '0f719f6c-d4d6-5491-8128-8629e1159615'; -- quinientos
update public.forms set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d', position = 6 where id = 'a2ca46aa-3b7c-5970-a2d0-76a4f1669493'; -- seiscientos
update public.forms set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d', position = 7 where id = 'dcdd0a06-0665-5c55-beb5-1670a7481ac4'; -- setecientos
update public.forms set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d', position = 8 where id = '66a28b9a-caf6-5f6d-8b16-51738b517331'; -- ochocientos
update public.forms set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d', position = 9 where id = '4325a9ba-e63d-52d5-b712-1ec94ce50d92'; -- novecientos
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = 'ed8f69ff-10e9-5324-8192-ac827a6939a8';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = 'a41959a9-03f4-5503-9405-183ea303d824';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '00d9976c-4cc5-5faf-9a10-3fac19dae8a7';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '1f9b1d5b-9aff-5f88-89e0-59a5e4d2dfac';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '311065fc-d8f4-5bfa-b983-2c7c3dd961a3';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '1e8df66d-d61b-5a09-8c7b-1444d9adeec0';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '5989276e-034e-5215-86f4-73dbd98a6c7d';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '033cd3a8-1fe7-5f24-b7ce-37e089ce8276';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '69d4a258-bef0-5cec-8d06-c9a6a97a3936';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '3cd20cf1-582f-5985-9572-36fd85e2e07d';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '6d884510-7917-5045-9d69-ee97033338dd';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = 'd70b4fc9-cc13-5d9d-bb68-25bf0bba184f';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = 'c58c98c0-2ec1-5545-9212-539c1d404445';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '41a39ea7-7fb3-5db9-9488-16b0dee1c3e2';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = 'f2c9ffb7-440d-5854-8906-71829b53a208';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '7f7ead2e-bfa2-5374-b69f-8c21c997718e';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = 'ee768261-b42f-595e-b89b-2b768e070325';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = 'dd654608-9eb7-5080-a3c2-16958bfa12d4';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '1b1b2f49-3bc8-5ce6-bf1b-b40057905b7f';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '1c1c53a3-7c4c-52b5-9a68-cc6a32bda720';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '1654373f-63b0-5afa-bdbb-178a180394bb';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '49da7d85-22e9-5534-bf02-8790f79db63e';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = 'c7153d6b-8a21-553b-8c70-40d4d78af81c';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '1cf8b8e4-68c8-5beb-8aba-c7e6c338af1c';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '571b9a9a-5f04-5873-80f2-aa2952d02bec';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '5b7076bb-e8b5-5b02-b9e4-b766e1a0ed89';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = 'a020a885-422f-5ed6-aba3-103913a93ac7';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '1e98eaed-dab3-5e65-8200-afa18b8df113';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '71fd0bd5-bc5a-5bca-98b3-70ffe812458f';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '39cff266-bb2b-5c1c-9337-54ca46f135fc';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = 'efe6d1b5-345d-5f94-a8e1-f088922eff79';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = 'a41aad23-a364-5ebb-8926-ed8403fb5502';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = 'aa834374-0d45-5e3d-8185-cec88dd6a86e';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '720577c1-454c-5ef0-88fc-4e1c9f78258a';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = 'aee03f0f-feac-545d-9902-ec9fb2c28ef6';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = 'f45c9d43-6107-5e2d-9520-6a402a5af73a';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = 'e3961369-70a6-56a1-91dd-db08201dcc14';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '6c217369-e6e9-5fd9-9b4a-e503f15f59e9';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = 'ec9f1b6d-03cd-569c-a604-29e08b455b0a';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '9c2d5375-c8e7-5309-89c0-703943e398e7';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '8599e5ca-4203-53da-a858-7d9a24bb7b8f';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '31504eab-96ea-50ea-b677-ba97aab0c23b';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '42584bf6-8184-5c64-96c8-d0f3fb43b297';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '6798c58c-1d21-578c-8cb0-735127d45f56';
update public.sentences set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '2c677c27-efcd-5f55-ac74-1c8f5f4979bc';
update public.tips set unit_id = '632a31fa-437b-5d17-aac0-2954c405c53d' where id = '72bc32f0-4554-576e-abf0-f8df528f118b'; -- Hundreds

-- altos-y-morochos → altos-y-morochos · casados-y-solteros
update public.forms set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b', position = 1 where id = 'b1cf7a5a-6ce8-50c2-99dd-29c58148974b'; -- lindo
update public.forms set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b', position = 2 where id = '2b6c5b60-827a-5acb-bf7c-6d1b359776f4'; -- linda
update public.forms set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b', position = 3 where id = 'ca77225a-744f-5dfe-8ea9-e30e2c8cd320'; -- lindos
update public.forms set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b', position = 4 where id = '777f3df4-c3d9-5229-baf2-6466a310adb4'; -- lindas
update public.forms set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b', position = 5 where id = '5078f455-93b0-530f-8646-2f376ea7271b'; -- simpático
update public.forms set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b', position = 6 where id = '2a7ca65f-eb12-5804-adf8-f9f5c75fd2ee'; -- simpática
update public.forms set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b', position = 7 where id = '89335adc-9925-50ba-9ac2-f18a71910c70'; -- simpáticos
update public.forms set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b', position = 8 where id = 'ad5041f5-3d16-5b9d-8891-0f0372e21eaf'; -- casado
update public.forms set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b', position = 9 where id = '009b7c9b-bb13-53f9-9819-69b5d5f6e53e'; -- casada
update public.forms set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b', position = 10 where id = '5fa4fb86-b243-548a-93a9-cb87b54ee0b6'; -- casados
update public.forms set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b', position = 11 where id = 'b52ee274-4b02-5f29-865e-b54e128b1bd5'; -- soltero
update public.forms set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b', position = 12 where id = '6a777628-24e0-54e7-8032-a7324956e145'; -- soltera
update public.forms set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b', position = 13 where id = '1caeb928-e6c5-5241-bf26-ddf2816f4ba2'; -- solteros
update public.forms set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b', position = 14 where id = '3222adac-28a4-54f6-9aa2-541917231355'; -- mellizo
update public.forms set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b', position = 15 where id = '6984d40b-9c1c-532d-9e1b-9ef4e445a331'; -- melliza
update public.forms set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b', position = 16 where id = '1e0a2985-4841-550a-845b-960ae49da6d8'; -- mellizos
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'c3190aaf-bcd1-562a-9855-79b9a687b811';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '943bb414-e1da-57a4-a45b-f278a6b7bb8e';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '375d4c7f-2df2-59dd-8f52-f5648b2b9995';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'f762f1b5-7787-55c7-86ab-8696badf883f';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '7cf07762-d6d9-5023-a8ff-6ef6978b3e94';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '14dfd95d-65ab-548a-90d8-c8d37cd1f211';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '617e9bc9-e794-5e77-bfdc-4791de3092c5';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'cb9c1684-b8e6-5b75-8208-e3e5de29ec64';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '783c3547-1ca0-5045-b5c6-3329b5b5aace';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '4bbee6a9-8ac1-57ea-b2c9-ca1f9c1ea9cb';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '942ea039-e25f-5075-a98c-88b15f8c5e30';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '7817e90d-689a-57e0-b56a-de9fb2f32a7f';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '453825c3-2380-504e-be61-1fc1512ddcaa';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'c24ef0e4-c92d-5ae2-bd0b-e8ac74edb5a0';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '9776494e-b489-5663-9479-b25a6b50804b';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '437fe648-f60c-5b74-b50e-e1584fc67f02';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'd26300dc-cc96-5f18-844d-12b34c33cce0';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'f2e024bc-5dee-50cb-b364-f1392cdd1786';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'c1344301-b4e4-5cc3-b8a2-63687f58e220';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '1723ab01-cbad-57f6-8a0d-775b5cc1b134';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '697c7f41-84fb-5ee6-8047-8f881247dad6';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '01c87c7f-c1a7-5ce4-ba09-14f5e9bb7773';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '82dac744-a2dd-5890-af19-3692e3218af2';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '8be92a97-33e4-5e75-8a1d-f17af6235944';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'c48fe5a2-9fdd-5105-90b6-9f67ae1e3c3b';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '27f342ea-5169-557e-8026-d337700fdc7b';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '2c81f41e-43b9-50be-89c1-2c7d9f87718b';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '3141226a-0d92-57dd-b18a-b73f3617591b';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '38962601-aad7-5201-a7bc-2722bd4bcf4d';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'fd420527-7782-5b37-ab32-ea5291e1cf4f';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '910d2369-5cb1-5a81-bc70-8e2991a1d3d2';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '0d68a910-c1c5-5ded-b84a-11c3482a5ba5';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '0428320a-851a-58d4-b05d-ee95195e2158';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'e977a1ef-0a1e-55c0-9b75-3492dce34a4f';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'c246c671-5826-549e-9147-9af050e411dc';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '45df6158-2916-508d-b094-2ee0e1d9ac30';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '4e0cdba6-967e-57b0-ba46-5c733d6f9ed2';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '52f0caf1-a754-5248-86c4-81daae310034';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '5ca9efb0-0158-5ab6-8336-22dfdf9ceb76';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '5cd50fc6-759b-56da-8319-f8fcbfe19518';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '8293bb64-73cf-5f99-89be-389eca89da1e';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '7378d47f-c3cc-50a1-a4e4-2f50d5838fbb';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '8b81275e-97f3-5a49-8911-91cb9026346f';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '9494bdd3-0cd2-57c3-a8e0-025df61d7139';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'ac39d686-4ea3-5a4f-9779-937e462a709a';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'c5f40b19-84b7-52c3-b0db-400fe88e23a2';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'e0a20472-8739-50c9-9413-1d5eb52b3609';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'fb270375-ac0e-58b7-9aa0-15787d5d03b0';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'c8f68431-a442-52d8-a211-72a6aa6d61d7';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'b8cc0060-7840-5777-8067-64f63fdb7f9e';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '3a815b27-358f-5ecf-b3c9-d318a63b786d';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '24b58f3e-a813-573f-b502-60998fe189d8';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'bcc2be71-eb71-5450-b378-cfd12479d124';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '71040d94-e105-5db1-946d-8d9b3eef4a57';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '5b0d2354-43ff-58e9-8b40-ccb608b558c2';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'b80306b7-3f0e-5c55-88e7-58f9a179c1be';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '51ee2d61-e6c1-53cc-9ce2-f90e7a6b3138';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '0c9ec9a9-6928-5e80-9905-9904c71938dc';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'f3de97d5-7c59-530f-b9a0-1b3be56ce4a0';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '0e672014-f43e-5fbe-b19a-5b4ba623f33f';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '1e69b1db-aeee-5b98-825f-9454972bcfbb';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '146f44fe-247f-5086-88d6-176c4cdddba5';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'bd2f2360-e806-5d3d-9126-461e2e40c2c6';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'ddd91d86-d69e-5890-a1f9-48003cc22265';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'addde2cb-fa67-58a4-9d01-31463d1450ff';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'ad194d93-77e5-59f3-a746-992dd19cf14f';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '772d442d-6173-5d58-88ea-36c5891554bc';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '87ac9fb7-2546-5da1-bcbf-0c240a1d71a7';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '6bfc91f8-9bdf-5bc2-8d14-e33939bf00cc';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'd06df876-dd1b-5a56-8d77-3a7c3899b05f';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '0c2db1df-8788-5d88-83d0-91624b1ba64c';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '192ea2b5-83a9-59e2-b337-cd3756146688';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '11cb3843-df49-5f24-ba95-567b20ed39d5';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '22fbe629-982a-57c9-bec2-078a0b148cfa';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '3df19078-70b8-54a9-bf82-ac0523e18c63';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '874ce169-c95a-5793-a19e-72a552e23c8b';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'd3a210d6-fd2f-513c-9f63-68aba63f98ff';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'e0f9a087-1cc5-59e6-8ed7-d4ca7b4c2090';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'bb4a10e2-34e7-58b5-9d6d-9e1d08036f94';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '4a09198a-09f2-52ab-851a-29eccbcf1173';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '989c0720-eacf-5637-bf70-ae2c470d9e0b';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '13bb0b3e-78cc-5da3-9ab6-f625e950256b';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'cfe22e7e-744f-555a-a188-63d6bb9dba26';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'bb28d14d-a1de-552e-968e-48dd8ade2307';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '8753fe8e-42da-5cd6-bfc3-239958e530c5';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '4e942c1c-5688-5ebf-8409-9e8395934e55';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'a54c99bf-c975-5f86-8cce-3de583a4279a';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '1443238a-0317-5a8e-9919-9735cb3360c1';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '5997ed10-e218-5571-89f9-bac3373ea9cb';
update public.sentences set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = 'ee5b1b94-12f9-5c42-b4ff-14a884ecd22e';
update public.tips set unit_id = '741ce538-2218-5d5d-91bc-5c18673ea36b' where id = '4a1d6bf6-aed0-55e3-83e7-5fe81b444a4e'; -- Soy soltero, son casados

-- donde-estan-las-llaves → donde-estan-las-llaves · esta-arriba
update public.forms set unit_id = '9c3ea7c9-a129-5157-b092-804da692c36c', position = 4 where id = '0d9f5237-71c2-509b-92c3-144972dbb3be'; -- anteojos
update public.forms set unit_id = '9c3ea7c9-a129-5157-b092-804da692c36c', position = 5 where id = 'ff09c108-4f98-5f1f-b943-02afebdcb509'; -- llave
update public.forms set unit_id = '9c3ea7c9-a129-5157-b092-804da692c36c', position = 6 where id = '999b86a2-3304-5104-8f4f-e608ce2a5813'; -- llaves
update public.forms set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126', position = 1 where id = '0475c597-3873-57c4-9f0f-d5db7e636933'; -- auto
update public.forms set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126', position = 2 where id = 'eaf62dca-5644-5581-812c-20f475a65a32'; -- cargador
update public.forms set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126', position = 3 where id = 'cd7cf048-69ff-5584-aac8-a2182ed521b9'; -- cargadores
update public.forms set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126', position = 4 where id = '6e76c84e-5a64-576f-8a6e-3ffc3441f877'; -- arriba
update public.forms set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126', position = 5 where id = '81bb7d7e-13c2-57d0-9942-bda70c0ed134'; -- abajo
update public.forms set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126', position = 6 where id = '75b5a377-5dde-5e88-b623-61065cdb5dfd'; -- adentro
update public.forms set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126', position = 7 where id = 'a80694bf-f2e2-5e70-93f5-5419cf4df11e'; -- mío
update public.forms set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126', position = 8 where id = '6a79cbd9-4c4a-5d60-a404-03b1d76a3f9b'; -- mía
update public.forms set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126', position = 9 where id = 'a9135a3d-e641-5c55-ae7b-9f9a48421f93'; -- tuyo
update public.forms set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126', position = 10 where id = 'f0ae10a7-1a92-5b1f-9ae4-05ece9d0adb0'; -- tuya
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'ab34100d-a9d2-5004-a542-41d80ce65305';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'f21750c8-edb5-5069-8175-51476b707ae0';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '6d293b64-aeb4-593e-b9b7-83a1d01f76ed';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'f23be4e2-7a64-5961-a5ec-d48cb56f59aa';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'f734669a-98b7-53ef-a71b-211625f404c1';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '5de476c5-68d5-56c7-b5d1-60e6686c6134';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '54c87a8a-cfff-535a-ac52-a90da84067e7';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '252647b8-2215-58e7-a3fc-f44ce795b482';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '0fe6bdd0-91b5-502d-a80d-7bec92a02266';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'd76c5ab5-432c-56ec-b5c1-826ed7c6e3e8';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'b5addee5-a853-5f8e-996e-ecddd349840a';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'c12f0960-87e8-5080-b495-7885842d29d0';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '9757fe6f-685a-5378-ad66-1a5551248fb9';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '5f23e0c3-3c75-5245-95c2-c503f81bdf0b';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '0c2fd707-1b29-5ae7-b443-fd738cf48038';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '282c1a1a-77d6-5200-8a3f-26f029996d1f';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '7260d805-eede-5470-9e63-e72ff3c5b21d';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '91fcff6c-9a8c-5149-9ab7-75a5f143007f';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '92db1ab4-e78b-5495-9fea-bc9dca9d87b4';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '56178758-c0e4-5d70-aebd-2e1b47a50e1c';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'b524ba1c-8a03-53fc-91ea-2e09c0de2d74';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '136f232c-6669-5c4d-942c-f7a2e920a7f8';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '93153ab2-fe72-506e-9a57-cec354951f8b';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '3fe3e682-9ded-5627-a9b2-b41270446b15';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'dbe691bc-6060-5604-9524-5c99a68d09fe';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'c625eece-c44b-54c2-8d74-e6eca4181125';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '348d715e-171b-56c8-9107-1e389edd1cb9';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '441bf951-1b52-5137-a496-55b597e68e29';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'b21c466c-aabd-5908-a995-d5f186afbe14';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'bb580c74-f24d-5d6c-a654-a988711f40da';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '415ddddf-cade-5cbd-b2b5-6a4875bd291a';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '5b18614b-46a4-5dd6-8f39-5a06707e3c3e';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '941ac065-0533-5038-8046-2da6cbe38ba8';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '1a905ff3-1607-528b-81ca-a01bee19faa2';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '8efb5609-21cf-5559-a154-d429c9e9df9b';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '42c2279b-7987-580a-8520-045d9dda04a7';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'cba71586-2012-5c8a-9fe6-7d92aafbd286';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'bd35234c-6f42-5bb3-b180-5130f856a09d';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '362d6add-cdb2-5197-b803-dd6545738eb4';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '6f70601c-a756-5ccc-98d9-4c2d380836fe';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'ae1419f9-3242-579c-aa01-79cb0def051d';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'ad8bcfd8-bb06-5173-bf19-83e7d49fcc36';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = 'c77b0d24-d050-5d58-a9c3-9f40da30e0c0';
update public.sentences set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '103adf1a-e3ae-54eb-8f09-878a8fb34391';
update public.tips set unit_id = 'f131167d-74ca-532f-ad07-9ef1151c8126' where id = '0f108707-6528-5552-95c5-9202ab24e0d7'; -- Arriba, abajo, adentro

-- hay-un-tren → hay-un-tren · hay-una-plaza
update public.units set title_en = 'Find a train or a taxi', summary_en = '¿Hay una estación por acá?' where id = '6d6f0271-451e-511a-ae75-885699df6981';
update public.forms set unit_id = '6d6f0271-451e-511a-ae75-885699df6981', position = 6 where id = 'c6afea0e-fbc1-57b7-ba94-09357438226e'; -- por acá
update public.forms set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3', position = 1 where id = 'b19e32aa-7150-5ba8-b75a-e456d029ae76'; -- plaza
update public.forms set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3', position = 2 where id = 'fc9854a8-b1f6-59bd-ae98-552006de2a4b'; -- parque
update public.forms set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3', position = 3 where id = '0617ed74-74bd-5690-b95f-b2d0f38ecd9d'; -- hospital
update public.forms set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3', position = 4 where id = 'ceaecb8e-77b8-5fb5-8f3d-638c2e24fc53'; -- bar
update public.forms set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3', position = 5 where id = '4864e6e9-d47a-5045-b989-a2087e5f204a'; -- gente
update public.forms set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3', position = 6 where id = '84e01c84-d379-5aa4-b892-d09f0101d1a0'; -- malo
update public.forms set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3', position = 7 where id = '1af9aebe-bae2-5b69-b3e7-6ecb7a49d64b'; -- mala
update public.forms set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3', position = 8 where id = '18d35451-6a07-5b36-a307-eb1148588098'; -- buena
update public.forms set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3', position = 9 where id = '95814ad2-fe55-57d9-89bb-524c29e92a5b'; -- buenos
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '6dc5c2bf-208d-5587-be70-170b6265b6f0';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '69a0bd0e-4666-5b4c-aff2-2f4c518cba05';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '4d6c7679-0719-5ee8-8d58-7abd88f2aa28';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = 'd4f4d24a-34be-509b-8bf5-81de08d2fa80';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '7f0b0a81-a998-5d70-993f-5bf07bd40473';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = 'd0d1d1b4-50ee-5b0c-b511-e578ae32cc61';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '52d991cb-65ff-5917-b18f-d5a2de421d89';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '53103363-1e14-50f9-ae8c-e3e7fd00f1b4';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '203927ff-5557-5bbe-9906-7c2f41731e5e';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = 'cc86513a-9771-5e51-88b6-ba9aace16b87';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = 'cb353778-0494-5395-aba1-9dd5199b1ffa';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = 'ced333f1-9b2a-564e-bcbd-1bff4d5048f4';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = 'aca5d2de-817b-5a7f-bdb2-1251f15d1351';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '5417ac86-647c-58c1-b1f3-c7ef8afccfb4';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = 'b287b168-c095-5eff-b2c9-91186844228f';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '19a3c772-657e-52c6-83b6-49684f2d1780';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '4d3f7137-023f-5dad-82fc-fcbfb68208cc';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '226318d3-1f0c-5aba-af6f-c4046176c8c7';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '8d781fa3-95de-561a-a0e5-d4bb98d85dcf';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '2e69ae05-fba5-559f-93cc-3805fdda72fc';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '4c8d04be-142b-5b73-a5b9-4edf701760fc';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = 'be405bef-c9cd-58a7-8feb-d93bfbb4fae8';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '0bd358a0-1c31-5958-a519-6fd56fa7c042';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '993d4af9-d40e-591b-a9cf-7b4485e5a8e8';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = 'c736ac21-62aa-55e3-885a-7f193f7bae8a';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '5734a33c-cad5-5cf4-94c8-35fa51023ce9';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '69a7f6af-14d4-5ab4-80d7-5e6a0fcfdf55';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = 'a180848b-5202-5140-b437-232364207f9a';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '940fb4b8-71d1-592a-a81d-dd0c7ba51cd4';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '00dc1db5-4e8d-5553-a4ac-59cf8059f619';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '360f81fe-d6c5-5b24-ab29-a2a7a154cb87';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '6212984f-e7ea-5165-8938-f1df319a8fb4';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '1048da2b-f4cb-5372-b05e-f2103e24cbcb';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '65b224ff-f724-5c7d-b4bc-069bc11c4c79';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '902ec4ff-2d64-5fd8-b88f-633ff41a103d';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '5c6b6b60-1ffa-50df-9e20-a90ad9aedce8';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '5a5a5117-fa9a-5c72-bc13-321e9a45990d';
update public.sentences set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = 'ad93f1a4-d344-5e46-9443-28c38b7c7210';
update public.tips set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = '6c4ee507-763d-5871-85e7-e0fdacd5e974'; -- Al parque, del subte
update public.tips set unit_id = '0f358a4c-271a-566d-86bb-31d354f25ed3' where id = 'b861d84d-53e2-566d-9424-5b40732e4523'; -- Hay gente

-- como-estas → como-estas · estoy-medio-nervioso
update public.units set title_en = 'Say how you feel, and why', summary_en = '¿Cómo estás?' where id = 'eda0d38b-9df5-5bba-9665-c300309be0fa';
update public.forms set unit_id = 'eda0d38b-9df5-5bba-9665-c300309be0fa', position = 2 where id = 'f08a5a8d-67c5-588d-8d18-62885a8852cf'; -- cansado
update public.forms set unit_id = 'eda0d38b-9df5-5bba-9665-c300309be0fa', position = 3 where id = '7a1518bf-b9f4-5102-aba7-25d6a55943a1'; -- cansada
update public.forms set unit_id = 'eda0d38b-9df5-5bba-9665-c300309be0fa', position = 4 where id = '9a2e2c14-e12b-523b-80d9-4619d8db3f75'; -- cansados
update public.forms set unit_id = 'eda0d38b-9df5-5bba-9665-c300309be0fa', position = 5 where id = 'f5ddea51-7cd8-5efb-9e71-a9f52175d896'; -- cansadas
update public.forms set unit_id = 'eda0d38b-9df5-5bba-9665-c300309be0fa', position = 6 where id = 'b8217db2-78da-551e-93f1-03469a888948'; -- contento
update public.forms set unit_id = 'eda0d38b-9df5-5bba-9665-c300309be0fa', position = 7 where id = '1dc12af6-adf8-5b51-8877-6aaaf33ef768'; -- contenta
update public.forms set unit_id = 'eda0d38b-9df5-5bba-9665-c300309be0fa', position = 8 where id = '7809e2eb-0cfa-55d3-a5bd-ff8ca8319fc1'; -- contentos
update public.forms set unit_id = 'eda0d38b-9df5-5bba-9665-c300309be0fa', position = 9 where id = '738e2a4a-32b1-51e1-9196-3374149562af'; -- triste
update public.forms set unit_id = 'eda0d38b-9df5-5bba-9665-c300309be0fa', position = 10 where id = '73f7f027-f438-51ed-800e-a6e9d6691578'; -- tristes
update public.forms set unit_id = 'eda0d38b-9df5-5bba-9665-c300309be0fa', position = 11 where id = 'd93a643b-e2a1-5869-9981-44bf2a42703d'; -- tranqui
update public.forms set unit_id = 'eda0d38b-9df5-5bba-9665-c300309be0fa', position = 12 where id = 'a6494de2-d0d5-5970-8f6e-3d6c7e7e17cb'; -- feliz
update public.forms set unit_id = 'eda0d38b-9df5-5bba-9665-c300309be0fa', position = 13 where id = '25642227-f4b4-5f7e-ad09-37b2d6f0ee30'; -- felices
update public.forms set unit_id = 'eda0d38b-9df5-5bba-9665-c300309be0fa', position = 14 where id = '039949e8-aa88-5eb4-b0c3-3075132e261c'; -- por qué
update public.forms set unit_id = 'eda0d38b-9df5-5bba-9665-c300309be0fa', position = 15 where id = '40af6127-af42-5d18-b58a-15fcbd485b41'; -- porque
update public.forms set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b', position = 1 where id = '6c7acfab-6e00-5f22-bc83-74acb0bc0c6f'; -- más o menos
update public.forms set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b', position = 2 where id = 'ffdc4752-5049-5f75-b927-7a6e572f6109'; -- medio
update public.forms set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b', position = 3 where id = '0408c73a-ee68-5db8-ba35-79203c48f133'; -- nervioso
update public.forms set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b', position = 4 where id = '220d9872-c52e-5b9c-8dc9-2449b7a39883'; -- nerviosa
update public.forms set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b', position = 5 where id = '3277cf05-2f2f-51df-b718-7bd8e1ef9c34'; -- aburrido
update public.forms set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b', position = 6 where id = '2277feb1-b028-57af-9a5c-de59fbfebb32'; -- aburrida
update public.forms set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b', position = 7 where id = '2b5071f0-2b29-5621-97ff-8f555e9c2320'; -- enojado
update public.forms set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b', position = 8 where id = 'cf21f6ec-fd00-53b0-bb19-696cbbbc6b39'; -- enojada
update public.forms set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b', position = 9 where id = '7ada3c7f-b555-5376-bf55-7a27b92a490e'; -- ocupado
update public.forms set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b', position = 10 where id = '7c023ab0-9443-5765-99ac-1fa5166f96b2'; -- ocupada
update public.forms set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b', position = 11 where id = 'c87e71f7-c483-5783-a4c3-3a72831d9f8e'; -- enfermo
update public.forms set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b', position = 12 where id = 'ef603a38-cdf5-5c7b-b47b-07a683700157'; -- enferma
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = 'c550f3f2-7fd1-5bff-9d6e-72b858538f71';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '514aebc3-d513-50c9-92b2-219f0b912ed1';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '1ff819c9-5d38-5201-9740-a716c8c09635';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = 'a99e9887-fc7b-5e2e-b80a-733b3ded613b';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = 'e7677005-e47a-5eb5-bd7d-eab2f2b34587';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '904080c4-8452-5807-9712-f15cd8e02faa';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '45660f22-5c13-57bf-9edd-7e5470be6362';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '4021c416-da34-5f3e-b524-0f1c6851aa23';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '324bd35b-ff98-5e8e-84ab-134e8d55a27f';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '27790453-facd-5e8e-87e1-31ae7b8a1959';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '6d7e709e-3b6d-56d8-b19a-e008c3cbb0c1';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '9cf23ecb-c481-5446-9eba-24a05fbb5673';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '22bf7cc2-77ab-5f5e-92bb-fb4a2a563132';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '98522253-ef53-5f23-aba3-c422e92b297f';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '31120858-2305-5ee7-9fc8-3022892ec4dc';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '57de09a4-32b2-5859-b66d-0f64a8670651';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '7175da19-9af1-5106-9f0c-3711d8803ee1';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '2fed8315-4953-5390-949d-01670656a74f';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '0993aefb-1aa5-59cc-ab78-853b648311dc';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '70d3ae60-06a0-5f33-bb44-f129a94803c8';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '794ad8ee-1bbf-52b6-aae0-46fbc95c36c5';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = 'c5d87fce-7f1a-5f2b-9f37-177a6a377199';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = 'c5c633e7-2b92-50ca-85e1-84560fc9bbba';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '6090e435-7c1b-5cbd-ae26-909bc7263549';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '1252e5de-41e6-5334-8c33-2fb4158f2c5b';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = 'eaea14d3-0691-5151-9834-55a94901cd11';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '259aa85b-30e6-52e8-a438-0a4c79ba7a14';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '42b046a9-d82d-5584-93ec-243f70ee163b';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '3f448d33-6edb-5634-a939-62763d0fcab6';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '8f99b0d6-0e42-5cd6-bdcc-74ce87d8cd61';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = 'c5e94de4-d2e2-54b9-9ecd-cd1dd7b1b3d7';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '96e06675-91c1-5dd6-8014-c9ab12656600';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '3d7708d2-1935-5750-aeb4-28da90ee0944';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '5423141c-247d-598a-a780-76b9488a803c';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '1ebd3920-a1e4-5c2b-9456-82dc5a23b9c1';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = 'cfe74bb8-0d53-534f-9944-d12def27a38e';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = 'ede2f784-f69b-5fc3-b3d5-49bbcdb1c18d';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = 'd69d43c2-1b06-50dd-b0fd-2698f2a7aaea';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '98334b26-dd97-517f-901e-dc507f770553';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = 'cfa952d2-93d9-5730-9adb-7dbadac604be';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '0378dc94-7f07-5e27-9643-2caa7e70ac23';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '044de748-c048-58bc-b8c8-a71eb863ee60';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '0728eea2-321c-53b3-8001-6beba4bb5881';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '0dce2ab1-87c9-5c4e-b466-4a9c5d307ab9';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '1bb44e56-e32f-5430-9967-f3ae91607ab1';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '1befe2c8-24cf-5f9e-8f5b-8495683aab83';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '1f45c6ec-ce4e-51d0-a3ff-5100833d8228';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '202a3fcc-e2b0-5b58-855d-a88240763577';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '2b153fea-6acd-5e9e-9668-f6678d01e585';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '34eb7e60-64c2-56c7-a61d-fae7d7e57aab';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '4a4cd8d5-cdc5-512a-b881-f90606f5a449';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '769ae2d4-47e4-5a0d-aac9-7cae961d2c1f';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '866e1310-d3f0-5f22-bd96-65bbcc7c1576';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '1070af57-c7ed-5dd1-8dc6-84088f7fc838';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '5d1bee1a-97ef-5da7-9de6-9b7201df7ee6';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '7d217df0-32a5-5d63-a465-55b407481073';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = 'b1428e09-144b-5e3a-a8ab-07b19d0f6f1e';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = 'bd47b5b9-9a7b-5dcc-8294-b376afa14b49';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '32626b39-fe9b-58a2-b499-b7ba6bb91d0c';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = 'b677c429-086a-5d7e-bb08-dd739f0c8aa9';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '1d84cb41-8ba2-5266-8dc7-28c4196c9ad5';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = 'de479b95-90c9-5b3c-b974-23b70a7b40df';
update public.sentences set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = '7e6f1ad9-d519-5866-8de7-d21dee25fca1';
update public.tips set unit_id = 'd675862c-ac12-54e4-85c4-179b61dd611b' where id = 'bdbf4ab9-d5f6-592a-8ac8-00a6005e0f02'; -- Medio

-- esta-cerrado → esta-cerrado · estas-listo
update public.forms set unit_id = 'ef2cae6b-ed9c-5d4b-9d7e-7c65c58dbea5', position = 10 where id = '4590eb9c-6e31-5fd0-8156-f29adbe48e55'; -- libre
update public.forms set unit_id = 'ef2cae6b-ed9c-5d4b-9d7e-7c65c58dbea5', position = 11 where id = 'da66aefa-deb6-5e26-834f-bb59eba22f63'; -- libres
update public.forms set unit_id = 'ef2cae6b-ed9c-5d4b-9d7e-7c65c58dbea5', position = 12 where id = '15d288ab-3d57-5c8a-8267-087af11d877a'; -- sucio
update public.forms set unit_id = 'ef2cae6b-ed9c-5d4b-9d7e-7c65c58dbea5', position = 13 where id = '2502f2a7-60ef-5b4e-961d-9c7d0a7fa35a'; -- sucia
update public.forms set unit_id = 'ef2cae6b-ed9c-5d4b-9d7e-7c65c58dbea5', position = 14 where id = '9713874e-9122-5359-a6ac-359a0d521b64'; -- sucios
update public.forms set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c', position = 1 where id = '05279f5c-392f-5d48-bfc6-c2747c4cba18'; -- listo
update public.forms set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c', position = 2 where id = 'c63b169a-bbea-5aa3-b467-cf91dcd5524e'; -- lista
update public.forms set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c', position = 3 where id = 'a3ea62d2-7aa6-5faa-8952-c1e4124fadaa'; -- listos
update public.forms set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c', position = 4 where id = '8e5e2cc4-afa9-5cec-935c-c1dfbeb4e258'; -- apurado
update public.forms set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c', position = 5 where id = 'b41da28d-139b-5eea-b85d-7e289d8b5993'; -- apurada
update public.forms set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c', position = 6 where id = '708bb550-f9c1-5d23-bf1b-09773fc3301b'; -- apurados
update public.forms set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c', position = 7 where id = '55c4e988-0351-552b-8128-8c915561473b'; -- preocupado
update public.forms set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c', position = 8 where id = 'eb1dbf06-e474-5695-aad7-3f395a5c8520'; -- preocupada
update public.forms set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c', position = 9 where id = 'a73b6ce6-2157-5a4f-8e7a-65062a36372c'; -- preocupados
update public.forms set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c', position = 10 where id = '85de25fd-452c-5907-b39b-710c519fa633'; -- roto
update public.forms set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c', position = 11 where id = '2bd2d665-c2d4-5c08-9cf7-f97f6f9d86c4'; -- rota
update public.forms set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c', position = 12 where id = '85854b0d-c3d7-5647-995d-960a8f9efec3'; -- caliente
update public.forms set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c', position = 13 where id = 'a57c6eb6-138e-55b7-ab30-faa787602b89'; -- calientes
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '39f4adb1-0dad-5377-91e7-4a2f37367873';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '2f733bb1-16f1-5371-a209-429f19debb86';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '27983276-b4f6-5260-a4be-8d476705bf7d';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'e3adf157-010f-5d57-ab02-ed3b4f396da2';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'fc68b759-f44e-5211-8b2d-b6e4212dd175';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '83217a04-1955-5a1d-89cf-bf6ea4b99a3b';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'd9b455eb-92b2-5281-8c7b-6910e981d8c8';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'a49703dd-f95d-5296-9adf-c63e7a1c8931';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'd54a5e98-7d89-55e7-9c67-3bc0586ab065';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '3581e6fc-f510-5dc7-a942-1fb339b9d13d';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'd6b469af-4eaf-577d-8e04-1a6567efe8bc';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '6b6ef2a8-fec1-58d8-a941-e4ddd61aef81';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '2691f0af-5c9c-5490-aea4-521fbcb3c12a';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'a5809d4c-3b43-5ff6-8e29-849b3156aa39';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'aba91689-0184-50c1-b1d6-57bdb2ef7862';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'dfe19f74-6705-5345-9ecb-3b14d523fc79';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'a93d4656-8871-507f-b428-196b6a9ec18c';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '116be404-eb4c-5f99-bdb9-5b2dd8953c8a';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'cc9d0ea1-35e7-50ff-bf66-ae5b45a0d3d3';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'ed7c8e29-971a-5da3-8352-894a80feac27';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '838851d3-b548-594d-8971-835a22981193';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '8079460c-054a-5f7c-8c51-c2d464819c23';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'db460ba6-2cbd-5607-b8ad-ffdbcde5b3ec';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '53d05e5b-c625-564c-87cf-dade950e94b1';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'e0e58176-f9b7-50cf-a89b-ea3173d72f36';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '292999a4-36a1-56c3-9255-7425af592ad0';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'e5e5a5fe-db57-59a2-908f-e0e81df3fc42';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '20b8eaf3-6243-5901-977a-eac72aa2aa62';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'bb668460-9387-5246-af9b-6ca4597acc67';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'b8e7ddc9-08e2-51ef-af64-cb74ae2e5d85';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '28f97b6b-e4bf-5d51-94ba-3623b3b01423';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'ac9896b1-4371-512f-8a3d-34f1db8172da';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'ca3e0f10-3aac-598d-8a14-2b510c09221a';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '5f498e8c-6237-5919-9192-a958bf2d0b2b';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'cef803a9-df4b-553b-b787-e41a99ee137f';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '6e6b66e4-22ed-509f-8fb9-87d6eec8f8eb';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '629937eb-21af-5024-b66e-bbf0fb2dd43f';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'bbe43e23-31d3-5756-b299-f4be0deb25a3';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'cd8df481-6408-54ac-bf34-c0ae8aa8971c';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'de58f828-6319-5094-96b0-fbf60a46eb47';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'f2a380a8-2cf2-5ef5-847b-bac2a14db51f';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '5a913d59-c499-5563-9aa8-51c604974bdf';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '08f82860-9594-552f-9090-e3ba189ae79a';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '37d6cccc-ae87-5005-9d12-9cf8e116c787';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '9546397d-5cca-5dcf-9a8d-1267a1026e05';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '212da361-a11f-5e18-871a-586ebe532d4a';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'c5c5b105-5ba0-5d07-8a2e-57e3e24717d0';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'b6fe0356-9841-5312-9995-27fe0938b2bd';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'a17e5ab9-97c1-55c4-8ed6-9bf944c52af9';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'b46c4c8f-07d3-5b04-b000-72072a76ea83';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '8142535b-f4ec-5c7c-a52d-22d9e2fdd383';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'e803c113-f1d1-58df-8292-98ee489b0d0d';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'daca167d-94b7-52cb-ba8f-27220aadd32f';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '70ef531c-aa52-5a78-a05e-9f7753eb0d8e';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'ac5fdfe6-932b-5908-b205-28930f901fdb';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'c28cc327-06b0-5a15-b6a1-3b1ab7f60e44';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '33d6c4b7-21cf-5104-a283-4dd61ea82fe9';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'cd9717f2-299a-56cf-8201-5afcb5c54fb4';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'b2e78594-5f3e-554e-8b0c-949ee18d9172';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'd2c30617-41f2-53fe-82a8-d1ffd3e4500e';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'aa72d5c6-e994-5158-b94f-c5a4737861d2';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'd115256a-f0d4-5229-ac6e-eadb25fc6028';
update public.sentences set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '27366be7-26c0-5585-b9c9-f7c10a5cdc16';
update public.tips set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = 'fc0b4b4e-f184-5ab8-adcb-2352ae9cdeae'; -- ¿Listo? Listo.
update public.tips set unit_id = '77c9f78f-f685-5342-80f1-882f6214d26c' where id = '19fdd686-0f86-5a0c-a998-5e353ecd8fd9'; -- Caliente

-- que-haces → que-haces · estudio-a-la-noche · siempre-camino
update public.forms set unit_id = 'c5c43fc3-949b-5f6c-99b4-c6da645e7d7f', position = 9 where id = 'b408b435-d02a-5f67-927a-15275ab4e4f4'; -- centro
update public.forms set unit_id = 'c5c43fc3-949b-5f6c-99b4-c6da645e7d7f', position = 10 where id = 'bbf0a7c0-ac78-5526-90fd-f8c6f8444bc9'; -- hago
update public.forms set unit_id = 'c5c43fc3-949b-5f6c-99b4-c6da645e7d7f', position = 11 where id = '6dd870c5-bcf7-543f-92d4-4b596d46edfa'; -- hacés
update public.forms set unit_id = 'c5c43fc3-949b-5f6c-99b4-c6da645e7d7f', position = 12 where id = '229a2ee1-b1c9-5416-b88f-ffc0d8b5331a'; -- hace
update public.forms set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003', position = 1 where id = '1d3de860-5571-512b-b174-fbbad9da4126'; -- estudio
update public.forms set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003', position = 2 where id = '59aadc27-da32-50cd-957b-dc1c704a63d1'; -- estudiás
update public.forms set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003', position = 3 where id = '8893d64d-2782-5e83-bf34-4bca9a1cc020'; -- estudia
update public.forms set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003', position = 4 where id = '1e50a09a-5735-5533-931a-44dd8bd61c80'; -- estudiamos
update public.forms set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003', position = 5 where id = 'e2967f7f-5173-58f8-9a12-292998dbee16'; -- estudian
update public.forms set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003', position = 6 where id = '64609644-11e7-5af2-8b9d-dcda0500090e'; -- tomo
update public.forms set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003', position = 7 where id = '6a2b3dbe-f84a-5f18-9311-d53d92c10a7e'; -- tomás
update public.forms set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003', position = 8 where id = '04b375df-f022-5149-8636-4362537bece7'; -- toma
update public.forms set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003', position = 9 where id = '219b8eef-f50a-59b0-aa1c-8d9157b14dc8'; -- tomamos
update public.forms set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003', position = 10 where id = 'aa03809c-934e-569a-b392-1ca0ed43e623'; -- toman
update public.forms set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003', position = 11 where id = '69ba0c9b-8cf0-50a2-87c1-124487e21cd4'; -- noche
update public.forms set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4', position = 1 where id = '049f968f-4e71-5594-85d9-5957a527150c'; -- camino
update public.forms set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4', position = 2 where id = '438145b2-3644-5efe-b9b3-eb61c82c72e0'; -- caminás
update public.forms set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4', position = 3 where id = '7e0f0e21-d913-5c37-a920-ef28402efcd3'; -- camina
update public.forms set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4', position = 4 where id = 'ddfed08b-8234-57ca-987c-e967f62b1621'; -- siempre
update public.forms set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4', position = 5 where id = '7a49a769-4468-575e-83c9-ee44b8f728c6'; -- habla
update public.forms set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4', position = 6 where id = 'c5ff2257-671e-54c0-b27f-d5024b15bf60'; -- hablamos
update public.forms set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4', position = 7 where id = '126272fa-f123-5191-a26d-74f0a5cf11d9'; -- hablan
update public.forms set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4', position = 8 where id = '5e5eea94-652f-5c5c-a648-d2dff565368e'; -- nunca
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '5e2726b7-1533-5ded-ab79-a9957382d6ec';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '27e1fde8-8387-5f82-96b7-5dc7dd23c3cf';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '4a8f6226-f2d6-5d51-aa55-106ac8db0802';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '65138b09-e1b5-5311-be29-fb5a750c7e1b';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '76e5191d-11a0-52ec-ac85-1ab0011c5e25';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = 'a5310375-0211-5f81-bda2-82d8500db9b5';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = 'de8959d5-394d-5242-9cdb-b5a2af62a59b';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = 'f5667315-2c93-549e-9270-445e45b7a7a4';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '9b6ec85a-2018-5786-88e6-c03d1fdf5bc2';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = 'd5c88c13-052f-543c-9e1c-230f0f1a2adf';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '9a2f661b-f441-557e-bc65-501d23e2be2a';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '99e1f737-4467-5c23-a952-f6a47187818c';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '615c7b15-4b87-5430-9a4b-0b54c0d487d4';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '4c1c92e6-e9a7-5e23-bf43-7d8bc87c958c';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '78f6e286-05d3-52a9-8d25-5214a48e5921';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = 'a0edde5e-5bac-5710-98f4-a73b3c7dbfdb';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'd188f470-f875-54a6-b8a1-860f563bfc41';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '8c20e26a-4a75-58b3-8f00-397eed135904';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'fc2268d2-10a1-5ff6-bae4-79dae8e9995b';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'c8240159-7c42-58a1-aec4-d050af8ccfee';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'c079ad13-4606-5b64-93e3-e187a56c144f';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'f9121fe1-1411-5117-a486-ebbcebaca681';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '318d960a-aa6a-5aea-9cb9-75b16d3e1a07';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '9c0d4ccc-c6c2-52dd-b9b0-0443e38c6e2c';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '8b38e777-c9f4-5552-bcc8-b6f78790a909';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '5fafe552-5b23-5901-a6e7-2cfe15a02125';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '958a619e-62a4-54fc-a86c-cbebcb8cc7d2';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '7b429747-4a6e-5978-8505-89aaf2636816';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = 'fc2e9f52-5cb7-5e4c-a35a-cf5c881b29c7';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '19df1497-01f5-5add-8b86-b610a83ac1f7';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '42949554-eca7-51db-a778-6697dbfabfc2';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = 'b92c43d2-f2bf-542c-b3c2-ababa4808857';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '366ebafa-0e97-52fd-8726-352609091610';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '48f8a22b-8d6c-50cd-88ac-cd35fd1b4bd4';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '445adf27-3a3d-5a9a-9c92-0e6eb5f2a44e';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '3a54b733-6c81-5814-8424-7ddcdff6d566';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '73d3f0e3-e114-5934-9518-a346303cfe4a';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '889f2e75-48a9-5453-8344-61d9a7cc58a6';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '7760a41b-9fda-5c21-a964-1bf89905d7c2';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '9c815c18-3e7e-573a-b8f6-a1a493fd46fa';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'e214a1d7-1ede-538b-8693-db8607762fdc';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '6accbeea-dae2-5e7e-b5d3-322dc90fb628';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'aa0c800b-efa8-5b61-92ca-5fd700b09562';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '6e0525a1-c46f-5793-a309-7fe1f307b2f5';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '8a622acb-7abf-58c8-94d7-3915eae7c4dc';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '9fe9bddc-a48c-5053-a018-d88e7c8024ae';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '10ee405f-bb73-5ad2-9efa-2bd90bc880c9';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '015d676d-b7ba-52f0-a63d-544433a32f7b';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '118ffd76-e3f4-59e7-9b88-c117ec9ea0cc';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '448c39d2-1a33-51e3-87a4-2723f6255bfb';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '42cebf07-4c2f-5a73-b109-e5521daed3ee';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '4c51437d-8f69-5503-aca2-64bc8fee4368';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '4ffef86a-51b0-5446-9b9b-8b8a058af922';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '5cacf207-8b88-5ec8-bed1-51c908c96260';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '9e5b1120-8ab9-5144-a430-9cc3cf4e11e1';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'd1e34c2a-3326-5368-a0d2-194349157aa2';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '68a97a9b-28d7-5c0c-b89f-feb6f21bb2df';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '91f0cf52-46ff-5d24-bcd1-6aaae9160159';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '050d2716-ee0d-5c26-b6d4-5e9e623595e5';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'c37186cf-e8e1-5421-8d76-84ab7a6d2bf6';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '615baa82-88e9-54c4-a861-664646b9749d';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '334955f5-ead2-5af0-8af1-b170a659c83a';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'e61614f7-ca55-5386-b50e-f4e64b39f386';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '7f2e35a1-b595-565f-a5f2-ba62502d9d20';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = 'cf4b3471-0df2-5a7f-95e1-a2c1b0e068f1';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '7e7c25ae-b887-51c5-9e99-64ae7033cad2';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'a9d2f362-3225-5f37-9b7b-6f13674b0a4c';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'fbd4e67c-7640-5ddd-9f3c-fa2891a9aecf';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '35248767-fa8d-5f15-8cd6-cc8c14d6e6ea';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = 'dc7cda41-eaa6-57e7-aca9-6bc5ca79884f';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '9cb25f28-c1c9-5d9c-989c-7226b53436b3';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'dfed9a65-883b-57bd-9c4e-68056c68518f';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '9009f288-4462-503e-94b1-6cc80781ade8';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '9795ab63-fecd-52ca-a570-0744905a2c8f';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '22c8b34a-1518-5fce-bd2a-4d1e482d00ee';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '925290ac-14a5-5773-b2a7-2ba97a7e6b24';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '959d6f36-6fc7-57d5-a3ba-0736af33ffcb';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = 'cb03f502-eb9b-54c1-85d2-7d207f26fe0b';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '03419896-40d1-5e56-b952-ed7cbfdfbc12';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '3d4f61aa-e3c2-581f-80b1-d80f2d692bc6';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '6b4b19ed-efb4-57be-aa98-66780f05f4cd';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = '7005cecf-db7b-5627-9ceb-e1e740e26128';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '82032cce-a667-5ebb-bc2c-441f9d100cfe';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '60679f01-fd88-5ca9-a04b-8c2ab9f6fbe6';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '882df5c1-8db9-52f8-a903-2baeafc2690a';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'f4fe1fe1-637c-523c-8b9b-a48ed676cdfc';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'b7be10d9-9c1c-51b3-bd42-a08af4e7a645';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = 'c9f22ee5-98f9-522a-9456-cfd36b368a94';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '4f3b52bd-ae0a-5805-98e9-d95d33ea4477';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'e3fc6b23-4a25-504e-a73a-cd89e6280eb8';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = 'd02baade-ef2b-546c-afcc-b9040931750c';
update public.sentences set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = 'dcf2fde9-9f74-5d6f-b714-09da2815b86d';
update public.sentences set unit_id = '5d92fa15-6159-59d1-956f-2f12e01f68a4' where id = 'e2a90b18-3896-573f-8531-e7525dc408ce';
update public.tips set unit_id = 'a99fdaee-854e-5578-a225-0be8f8707003' where id = '9b8de7a7-8ce6-5500-a8ab-a7d35c9c940e'; -- A la noche, ¿qué hacés?
insert into public.tips (id, unit_id, title_en, body_md, status) values ('bb1bfe5d-edac-5c1a-8f0d-d0fe683906a7', '5d92fa15-6159-59d1-956f-2f12e01f68a4', 'Siempre, nunca', '**Siempre** (always) and **nunca** (never) go in front of the verb: *siempre camino al laburo*. With **nunca** there you need no *no*: *nunca tomo café*.', 'published') on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, unit_id = excluded.unit_id, status = excluded.status;

-- practico-castellano → practico-castellano · me-ayudas · busco-una-palabra
update public.units set title_en = 'Talk about learning castellano', summary_en = 'Practico castellano con mi vecina' where id = '7f39f4c5-591c-51f7-9f82-ca7f7a1cfb2b';
update public.forms set unit_id = '7f39f4c5-591c-51f7-9f82-ca7f7a1cfb2b', position = 6 where id = '01397295-4ac4-54ba-82ee-12ccdecb4a3d'; -- uso
update public.forms set unit_id = '7f39f4c5-591c-51f7-9f82-ca7f7a1cfb2b', position = 7 where id = 'ae523e23-72cf-53e3-b8ec-b5d1bce6d1e8'; -- usás
update public.forms set unit_id = '7f39f4c5-591c-51f7-9f82-ca7f7a1cfb2b', position = 8 where id = 'a1cf43da-95ef-57ee-b86d-26b5fd2679dd'; -- usa
update public.forms set unit_id = '7f39f4c5-591c-51f7-9f82-ca7f7a1cfb2b', position = 9 where id = '4c996d85-8998-5c03-9cde-278a7ea5fa70'; -- usan
update public.forms set unit_id = '7f39f4c5-591c-51f7-9f82-ca7f7a1cfb2b', position = 10 where id = '0da3115d-2ffb-580a-8b99-b6a49f727870'; -- palabra
update public.forms set unit_id = '7f39f4c5-591c-51f7-9f82-ca7f7a1cfb2b', position = 11 where id = 'c2b6162a-57c3-5833-9b5b-cb09c86fd330'; -- palabras
update public.forms set unit_id = '7f39f4c5-591c-51f7-9f82-ca7f7a1cfb2b', position = 12 where id = '8a8e0431-3fcf-5a49-9c7b-0ba35641de62'; -- idioma
update public.forms set unit_id = '7f39f4c5-591c-51f7-9f82-ca7f7a1cfb2b', position = 13 where id = 'c81f3a6b-c580-5a9c-a532-3ded2453f0f7'; -- idiomas
update public.forms set unit_id = '7f39f4c5-591c-51f7-9f82-ca7f7a1cfb2b', position = 14 where id = '2dcaac25-a192-54ee-9cea-205a42452962'; -- ayudás
update public.forms set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471', position = 1 where id = 'c44e01cb-62ea-5640-8eb6-66e3d19533d9'; -- necesito
update public.forms set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471', position = 2 where id = 'cb480956-69d0-5225-83e5-c1f8f2c86b80'; -- necesitás
update public.forms set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471', position = 3 where id = 'e7a340f9-603e-59ed-8968-f84bad953e2b'; -- necesita
update public.forms set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471', position = 4 where id = '95ee9b6c-f1b0-5b27-b9bc-10a7c2871ce3'; -- necesitamos
update public.forms set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471', position = 5 where id = '69076bd4-97b7-55bb-90d9-f670f6eabcec'; -- necesitan
update public.forms set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471', position = 6 where id = 'fab70ddf-1cfc-55bc-a13d-c6c69da84c71'; -- ayudo
update public.forms set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471', position = 7 where id = '0d6492d2-b459-5120-a855-0dd8c1853703'; -- ayuda
update public.forms set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471', position = 8 where id = '5d38009f-1b5c-504a-b2de-c4b067edd3cc'; -- me ayudás
update public.forms set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471', position = 9 where id = '5a1365ef-f014-525e-8950-2ef1aae801fc'; -- ayudamos
update public.forms set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471', position = 10 where id = 'e920c01a-e008-5627-9115-f31549710fe7'; -- ayudan
update public.forms set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471', position = 11 where id = '13555b26-0643-54fb-a8c7-de761e7a6e9d'; -- pregunto
update public.forms set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471', position = 12 where id = '3674024b-ef5b-57ce-b3f6-d55aec0f08c2'; -- preguntás
update public.forms set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471', position = 13 where id = '33b055a9-a073-5693-bd8b-6ddad2f4eb72'; -- pregunta
update public.forms set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471', position = 14 where id = '2870d862-f4b4-5a49-9964-c0fb2da6cf9c'; -- rápido
update public.forms set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361', position = 1 where id = 'dd2d1587-7485-595e-a94a-a11e1ba95dbd'; -- busco
update public.forms set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361', position = 2 where id = 'd416d753-b1f2-55ca-b290-5942af68ceec'; -- buscás
update public.forms set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361', position = 3 where id = '55ac7e02-391f-5a6c-9610-d16eb190b236'; -- busca
update public.forms set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361', position = 4 where id = '82ee46b5-6f09-559e-8fcf-ec68bac3ae37'; -- enseño
update public.forms set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361', position = 5 where id = 'ce1a2a71-0122-5837-aa46-7e586a81c251'; -- enseñás
update public.forms set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361', position = 6 where id = 'c150cbf3-a117-5d8d-acab-4b24acb32ad5'; -- enseña
update public.forms set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361', position = 7 where id = '8ba32b18-afc3-5381-92a2-ce577c046b50'; -- extraño
update public.forms set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361', position = 8 where id = 'bbe0213a-265d-57b4-840c-ee03254f22c1'; -- extrañás
update public.forms set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361', position = 9 where id = 'c791a3c0-7194-5a6b-810d-22ac3b4f3ad4'; -- extraña
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '1798ba9d-e5d1-582f-9029-b033928b68e5';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '25c80167-2fe2-53a3-a2aa-8c29fcbca40b';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'dc5effbf-1d30-5932-b7e9-e68d16f49d9c';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '66a90b8e-5020-5b7e-9ec9-132b62fb63cc';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'fd7e13f3-cf0d-5543-9175-0b37f06d3ada';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '3a69f322-1446-5d8b-a4ae-9cb27bdd7ebf';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '6f768923-90d8-5c60-a7ce-4f5ac8154769';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'a2b0b43e-3125-5bfd-8ee4-731a9a42d4f9';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '3f7be9e7-2dff-5cd0-8b3b-dd17fad9e6f0';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '8be7b986-0fd9-5160-af0a-7d0408a237c4';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '5c24d3fc-1b1d-5c05-b74d-29ca9107c4da';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '6743d82e-0013-583b-9d39-6368b8fede5c';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'f189d35b-54b2-5f41-81b3-ff15a75fab58';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '2a56e470-90d8-5737-8816-1bd2894b4aec';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = 'd3e39aaa-529b-563d-ad8f-3ee76513dd84';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'e1290fae-c306-50f5-82bb-f8d67cdedd70';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '4e38e72c-c18e-50b8-a0d0-2b98944c248c';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'ca17badb-6d8e-5512-af5b-2eefa8a00509';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '7f6909b8-00db-5ed9-81fc-a311e3c01ad6';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'efce49d4-119d-5758-b6a3-887d40198301';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '38cdd3fb-9cef-5800-a329-ff2cba494a9d';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'f1ca5ae4-4cce-5f4a-b1dc-39abe54cae14';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '39ca7573-4173-5802-a9ae-f14afd9da424';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = 'c4fb62b8-eb5b-509f-972d-4b0b0bb16b3c';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = 'a36ae254-2936-5814-b598-4b662d0e3dc3';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '55c80aab-6ad1-5034-9676-27e18e5457d4';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'dddd47d2-b41f-5996-8fa4-67c5779a8d71';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '704bd6d9-2324-59cc-a7aa-027e74372989';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '5da577fa-82f4-587a-ae14-8d9379012811';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = 'b4ca0318-284e-543c-836b-9d20fb9f2afe';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '4ea7a2c6-383c-5c91-a99f-8783ea5a8c06';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '7080c156-a953-58d0-af1b-e0d759145a0d';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '0c559c5d-e964-5c11-979d-11940f4883f3';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '64b58b96-692b-5c66-93e0-d8825ffd831b';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '7a357ac5-4806-5cc9-977c-10eab804cfb3';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'abca8fb3-34a2-539b-8d2d-b5d5df8a8a9d';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '5278a511-08f3-515e-8b88-730629a67259';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'f90f2398-3f55-56d9-b776-6c4292340f7a';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = 'e2aecf77-e7aa-5232-8690-02c523c5efcf';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'cad92e47-1824-552c-af3e-ed7a21059d58';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'daaa1ce5-3655-58be-ab4b-3f5781aaface';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'e7eebd4c-0764-5d77-92fb-ebabaed3f426';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '5f33adc0-0cf1-58d5-b421-200dd927e73b';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '0a44a3d8-c49e-51cb-ac4b-05a98211310c';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = 'e1370413-e14e-501d-b081-d7dab4d0f9f2';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '9769bb89-1904-5f41-9a61-0160a180c142';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = 'a2fe29e5-5a5b-5528-a5ec-65b9cddf9c01';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '5d258867-6407-59ca-a64a-9aa38c3d6ce9';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '55710570-9ccc-5cd6-9568-fc6d9739de3e';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '864bc67e-e550-5814-8984-b94715856b6c';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '61d9c8d6-11ab-5bb6-a10a-b00885e3a35c';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'd5f2e43d-d2df-595c-bc01-78a7293ed1a6';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '7f0aacdd-925b-513b-a8ab-ca16c2aa07d9';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '2ef6cfc3-9f29-573d-892b-7506d9ca1111';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'e888fb9e-7760-57ea-99cd-15fc730b3649';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '16d70778-fb88-56bf-80b1-7c5b5aa8d1e4';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '51bf362c-bf7a-586e-bd7f-2e3fe7a70522';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '7a63d843-236d-596a-a4e1-e87368469e98';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '248c5f6a-52c9-5684-93f3-ff112f0a69dd';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '08b05e44-856b-5a16-bd77-726d80ab7013';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'b8a5c50b-685a-5a10-8e95-c006e4a2ee3c';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '4e58d357-9733-5aa5-9648-74d94cf567dd';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '3a8a884b-e0ca-5409-bbca-8c2b7b8ca27b';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '45251a51-8de6-53b8-a97b-6fd8a2d17f7e';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '52391baa-f874-5a0c-a6e6-235e22689566';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '31cd46bf-76c0-5634-ba2c-c363c6792e67';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '56ab87d4-0588-56e4-9db9-c97f24152e71';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'edb3b564-c95e-5099-8fb3-1c70f4f10a14';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '3a109492-7784-5919-a3fc-f3cef02f9bdb';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '4800bf84-e252-5908-973a-293fdc40b783';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '25d11f10-0940-59d5-b129-10b924f58ab2';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '69653624-f7ea-507b-b981-3deca17cc088';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '932f31f6-4f9a-5338-8faf-05eba173816f';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '07dbd63e-6996-5134-85aa-9253ba085ce3';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = 'baf0635a-3fed-5f27-9859-bc1da845b908';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'a9b147fc-47df-51d6-8738-bd0f4b56c7b9';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'da15f852-00d0-5f5d-ad1a-8afb1cf5a695';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '2a812761-ef27-56f0-bc94-69943cba1780';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '8a7dfe20-e398-575b-812b-23b9ff7ba29c';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '59c2399b-f765-5058-b5d5-a6958d43cf77';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'e517ebff-d168-5161-ad99-0246427805e1';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'a573e851-202c-53f5-9267-fc80492dc092';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = 'faf0ccd6-f112-5502-b35b-5791bd4cb1b6';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'c00f4698-654b-5689-bd32-f0c0aba0e02d';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'a1a1e4c4-b082-5634-83e2-e3045073b0d4';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '6a3fcbde-65ff-59ae-87ee-12b0d80e1ca3';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'e1420e68-f82e-5d80-9273-93dae62c8183';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '986f820e-fd76-5ee9-a2fa-4ae7a623f2a2';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '05c02a40-5a81-554e-9aaa-410d43aa8347';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '02f233de-b2f6-5381-9982-6b45f28c0690';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '76b429c5-c017-51a9-947b-e0f8612fbe72';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = 'ec8bbe36-3ad2-5371-8467-1d31abf726f8';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '1e74b64b-c107-5843-91e0-6d721972a2ee';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '8c9d8c0a-e612-579b-9551-6dc93b4fa49b';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = 'dbe62209-9013-5fee-a5f7-6b0ad4df44c8';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'bb30421f-b4a9-525d-bda0-3b677751be2c';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '4876e463-c6a7-5d0b-8382-b3627a7a8ee6';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '16b13e0c-877f-5e8d-ae23-27db068e09ed';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'f3e608b5-022c-5654-89e6-316f22608d45';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '0b3d0614-0696-59fa-9dc9-cd6fef043cb5';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '2eaf4920-eb25-5539-a43a-564d9bbb01c5';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'd06648d4-abd3-53e1-a324-336de45700dc';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = 'd9195a9e-6bc3-5dfa-86b8-e81400d6677d';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '93b91baa-29d0-56c0-877b-6b854f792086';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'f7f42990-e6d7-51e8-839b-cb79b82ca36e';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'cd847da6-f1cb-5c91-b013-b7a472b744b8';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '5290fd7d-1653-5663-bace-e36e17f72206';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'd008adf9-fa4a-5b83-a0dd-f871ee04082d';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '72d1e1d7-cbc3-5866-a93a-765901f8e41b';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '8a7e1595-3481-54f5-af03-da4b515354f8';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '9bfcdafa-0990-5132-8fa3-69371cab5d04';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '75b0845a-09f9-5613-a6b3-8d74faf90cd7';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'ebd9c3b9-b2ff-5910-8760-f1b086870bf6';
update public.sentences set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = '5d684311-0540-539c-8919-d9ad3f481d36';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '36a8af77-a027-5cee-8c7b-3b93dc2d46c0';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '492be363-e142-57f4-bea8-3c35e3551caf';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '133c6325-dd61-5f70-9525-a31f0f39288a';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'f7bdedc4-45b9-5d6e-a0a5-08220ac1de8d';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '05c21b7a-189d-5258-b435-e31af66b8136';
update public.sentences set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = 'e82678bb-6885-5ef2-8ef1-8348d39c7ac4';
update public.tips set unit_id = '7e447ea4-e9fd-5b18-869e-4e8e339a4471' where id = '96e834f8-6753-5479-8174-299e06ce61b8'; -- Más despacio
update public.tips set unit_id = '681a4e9c-3a53-593e-b652-3850e662c361' where id = 'c2a5f3ac-9d60-5f16-b276-32fe3605b2f1'; -- Buscar, and personal a

-- que-quieren-tomar → que-quieren-tomar · nos-traes-un-tenedor
update public.forms set unit_id = '62bf976e-3f47-5cc9-b8bb-82f1b5c654b2', position = 4 where id = '8c5437be-7d42-5707-aaad-0f3dda0d290f'; -- mesa
update public.forms set unit_id = '62bf976e-3f47-5cc9-b8bb-82f1b5c654b2', position = 6 where id = '1f892bac-f452-5d76-8125-da27d298ba12'; -- vasos
update public.forms set unit_id = '62bf976e-3f47-5cc9-b8bb-82f1b5c654b2', position = 10 where id = '5dcdec0c-03a2-50df-9219-11a1f7f26ca7'; -- sal
update public.forms set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470', position = 1 where id = 'd3e0f2f8-310c-52f9-a336-3b8470cdca16'; -- plato
update public.forms set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470', position = 2 where id = '971d1a86-cd31-5d89-ac16-f6132e790588'; -- cuchillo
update public.forms set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470', position = 3 where id = '2936cfcd-8ecc-5c72-a150-3a5ad71b6311'; -- tenedor
update public.forms set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470', position = 4 where id = '1b204f06-d812-54cd-8d15-ab7f3a67a6bd'; -- cuchara
update public.forms set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470', position = 5 where id = 'da70491f-b97a-51a6-ac05-c0187fcf00ad'; -- cucharita
update public.forms set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470', position = 6 where id = '15258fab-2c32-5ff2-993e-f86139ac0244'; -- servilleta
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = '08bdc55d-8d66-576a-b8db-d9609e3568f4';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = '90196756-3c70-5e28-9072-bcc6becebdaf';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = '1cafaa97-f6da-5119-bdc6-e44b8b13184d';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = '5913e120-7b4d-502a-a299-72236a13599f';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = '03e6d23d-2120-5550-aae9-ad986ad49c31';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = '89a8daab-18bc-5a3f-9cb8-fefa4d0691d7';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = 'ed799f8c-3a65-5edb-a399-1a2dbacc85bb';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = 'e1514f0b-2a0e-5a58-9704-e443ca2b16b7';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = '928366c5-a444-59f7-be4b-4568d7813abc';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = '28700034-514e-55c1-a9a8-efc9098fedd8';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = '5a465485-53ef-543e-9e51-91b7d41380f0';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = 'a45a7059-7d5a-5791-947e-e173849acfb3';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = '0e0fe1e3-e46d-5d03-a138-cee6fe2be60a';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = '859ef7ee-eabd-5074-8abd-ddab7dd61ac3';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = 'e808652e-bf00-5bcf-b9b2-a25e6a14298d';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = 'a06e9a2c-e226-5065-96cc-dc454e195e68';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = '41f60d91-2489-5c97-abcd-f9a29169435b';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = 'eb00affd-bf22-5ab7-b629-8aa7293986f9';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = 'df7e4898-f130-56c9-915a-1336eb66f081';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = 'e704e136-0b1c-558e-98dc-2c6bcf7aac10';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = '3d4d7f4a-8ac1-5925-be76-5278a2b729b4';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = '59379ccc-737e-561d-80d3-a12f6c269f36';
update public.sentences set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = '2a80ab7d-59c0-5e50-a859-afb303b92340';
update public.tips set unit_id = '223dc7bc-90fe-5775-823d-a6fcbbd82470' where id = 'a45d118b-9ee3-50d8-8429-249547ef9eb7'; -- ¿Nos traés…?

-- facu-y-laburo → facu-y-laburo · de-que-laburas
update public.units set title_en = 'Talk about your studies', summary_en = 'Tengo que estudiar para la facu' where id = '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c';
update public.forms set unit_id = '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', position = 1 where id = '267db4cd-41de-5617-b541-71734df04ba0'; -- facultad
update public.forms set unit_id = '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', position = 2 where id = '2282d07b-a84b-5a76-bc18-f14ccd171d5f'; -- facu
update public.forms set unit_id = '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', position = 3 where id = '456975a1-9716-5c87-a0e1-1695530a869d'; -- tarea
update public.forms set unit_id = '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', position = 4 where id = '1094526a-fd3e-5bbd-8b8b-cc9fdb12c035'; -- estudiar
update public.forms set unit_id = '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', position = 5 where id = 'e67ad8be-1e2e-5bcc-a959-096437aeeb20'; -- examen
update public.forms set unit_id = '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', position = 6 where id = 'a52d85e9-46ce-55ce-afa8-c0fb42c3314e'; -- exámenes
update public.forms set unit_id = '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', position = 7 where id = '9e8daf03-8497-5092-8115-9bcc95355c1a'; -- materia
update public.forms set unit_id = '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', position = 8 where id = 'a962f0db-cbfe-5b2b-b598-410280323d31'; -- materias
update public.forms set unit_id = '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', position = 9 where id = '16d59f37-7c8d-5671-b985-5b96aef9f266'; -- clase
update public.forms set unit_id = '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', position = 10 where id = '69ef9abe-6055-5e70-b511-f2710c7e4b8f'; -- clases
update public.forms set unit_id = '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', position = 11 where id = '21beef10-e5c9-5735-be35-59c12ae655c1'; -- profesor
update public.forms set unit_id = '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', position = 12 where id = '1403b19f-f6d0-5e69-9cd5-fd2f890424b6'; -- profesora
update public.forms set unit_id = '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', position = 13 where id = '52174788-de1a-520e-9908-54b04189465d'; -- profesores
update public.forms set unit_id = '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', position = 14 where id = '44bd9db4-03ae-5b9d-85ed-10829cb2342c'; -- que
update public.forms set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e', position = 1 where id = '74dd3041-9720-51be-bda8-09e01a34b060'; -- laburar
update public.forms set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e', position = 2 where id = '788fa25e-b7d2-5b60-abca-3c3bcb31458f'; -- laburo
update public.forms set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e', position = 3 where id = '5a119168-d563-55b3-a20e-c490432e299f'; -- oficina
update public.forms set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e', position = 4 where id = 'a5448845-5067-5d70-91dd-8255feba8742'; -- reunión
update public.forms set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e', position = 5 where id = '210d5ed7-085a-54d6-850f-3adde4865285'; -- jefe
update public.forms set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e', position = 6 where id = 'a15e3ba3-1bf3-5e62-9229-1927df4576a8'; -- jefa
update public.forms set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e', position = 7 where id = 'ef68f9eb-435b-5e12-93f7-7cdd58690731'; -- compañero
update public.forms set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e', position = 8 where id = 'fb29248b-a623-56d2-8155-255e40650f9e'; -- compañera
update public.forms set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e', position = 9 where id = 'b0282628-50e0-5ac2-ab4c-e3e6dad9ac82'; -- compañeros
update public.forms set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e', position = 10 where id = 'a8ec6777-0a05-504f-967b-05e12cdae199'; -- trabajar
update public.forms set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e', position = 11 where id = '93507abd-b731-500e-9b42-394a16d652f0'; -- médico
update public.forms set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e', position = 12 where id = '7a79aa10-ec0a-5f60-976b-0c31d4552e65'; -- médica
update public.forms set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e', position = 13 where id = '8d1f3cda-7b3b-55ee-b303-c6c92338d41a'; -- abogado
update public.forms set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e', position = 14 where id = '403f63ca-c30c-597d-a99d-57e67bc9f014'; -- abogada
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '7c8d3ab1-2811-58df-adfc-146f9489607c';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '3818374a-6b2b-58a0-ae18-0bf173e69cbe';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '2438f399-2e66-5c78-90ba-e71e9b5a3042';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '77044950-4a10-5da3-83fe-3809780df2c0';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '55bb6b73-273c-5c6f-9520-725e690fcd8b';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '728ccaf0-8d96-5f65-90b9-122fb5994a58';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'bebb4441-670c-557f-982c-6891af7d96c1';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '718b348c-639a-55bd-9654-01ed34d01fcf';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '3089fa58-d5f7-5717-8031-934835383c9c';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'c7f6c758-43fd-5b3c-b7e7-fedd06b553fb';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'ca8e38d7-20dc-58df-ac79-332815b6748b';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'dbee7aa2-25c6-5f83-afce-2f2d4f8e6421';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'f194bf8a-3376-504b-9baf-af8495d4a72e';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'db88dc8b-4207-5f46-aa4c-26d9de11b8aa';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'd3dce1ff-d251-54b1-9858-10414e06d7b7';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '3d39f007-37b7-5cf7-b6d4-ed57ace21f72';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '7491ecf2-9a04-56b6-bbc1-7cc4a0a41710';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'f1c547eb-ddfc-5e84-833b-545284ae49ae';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'f1534214-3ce9-56c2-9fe5-ddac77f4f76a';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'ec20c9bb-5239-5db5-8c14-e01b7754b3de';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'c663c8a8-f299-5477-a880-946a4a9ea086';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'c881ec17-282b-5985-b2cd-2aa730a7f682';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'd3726b01-853e-5799-8871-51f9970cf968';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '241761f0-208a-5cd7-9ada-696dfa61d255';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '3cae77be-28ed-5a43-8735-faaba3cdd805';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '6bbaae41-ceb1-52f5-96b6-dae8141c0806';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '7343292e-2e7a-540e-9686-89cafadac6da';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'a2981417-78ba-5a97-a596-e839b852c8eb';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'e7bce885-8173-5467-96de-7878d2f6d814';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '306aabaf-7209-5008-bb7a-b5492e363581';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '7528d51a-dd2e-5f36-bb00-1e11aa4009e0';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '2b1f4cd1-6e95-5f49-b98f-491fcb21721a';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '21c55d11-6b93-5255-8c3d-f3f6f97a7068';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'e5135e43-68ab-568e-b3f9-3ab0bc654b41';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '93ce0781-6174-5cf5-962d-cde3b4394838';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '57fe5058-3320-5a95-96f6-bc484629ba45';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '83d4e031-d25d-5145-8fa0-c26f3971fbbe';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '645b2005-9bad-592e-866f-f2685b76385c';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'f709b687-ebea-53d6-a227-94eb518a6c56';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '38d8f04a-d322-5a5c-9bfa-51774a382fea';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'cd960d1e-20cf-550e-97c0-7a90123514be';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '3d42b4eb-17f9-5cba-abe9-1d23646db99e';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '2b3de18a-ca57-5fc5-a5a1-e9b769e61a66';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '49607ca2-2714-5fbc-a201-5dbe4f1d3b12';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '4e66181c-a64f-5b4f-91bf-a31ae0b5b19a';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'ee4f5530-ec44-5f73-bd45-5d595ca42125';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '8b03b8fc-4e99-53c5-b60e-d28d605f0e8a';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'ae440977-6a19-5c28-b13b-7318e5e1129a';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '147a2077-dfb4-52f1-a02f-80ae6949e778';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '070a5a09-6800-5474-97f2-ae7461c5d9a2';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'beb9c8ec-64a1-55b0-84e5-5e51055e5b3c';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'e12d1976-31ab-5f59-ada7-c6763e513015';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'e16d257a-279a-5be8-8add-7dba6a7d57aa';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '72c6ac22-f6d1-5d58-a0bb-3136b8b72790';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'b9c670ac-f601-53ae-b0bf-95ae1968a020';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '170b5e6a-d518-59e3-9bf1-36eecfcca0a3';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '33fba3be-40d6-5b8c-9df3-265cc1bc26fa';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'd630c71e-39e2-50cc-8cbd-e8c4728419bc';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '96e15cf8-d143-50b0-aa1f-384ce33e9f95';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'fda6a8d6-5ae7-5010-be11-b8b17917bcc9';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'bc74d2d0-2795-57c0-9136-5532f60f3714';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '61984ada-1d2e-5bef-bad6-b7643cb39388';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '06c79ca1-82e6-5604-9df1-7d41195306c6';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '149a0453-6c34-59ef-ac60-3a34b6ed44ba';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '62bebf4d-5835-573d-ba2b-ebce11bf7124';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '48819f40-9506-5d4a-8ba1-90c4ffdc6bfe';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'f669e44d-9659-591b-b4ed-c8544265b845';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'e087b17c-92e4-5425-931e-ea29bfd2b614';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '4838c026-a39c-558d-9c25-b0f9d719831d';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'a51a8ae2-5423-5277-88d9-efecbfd4990e';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'e4d40e08-9cb9-50f0-b16f-b18ce48fbd97';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '65d197bc-a396-5f4d-8ca4-ebb87fe13618';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '3bf274b2-d44b-566c-9e59-b4978fdfa2f4';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'c95c3354-034b-5107-a1a0-41a84c2f12a0';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '1de87644-ddea-5512-8346-b4fbc02ae717';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'db677272-2367-5e04-9dcf-94865f632f24';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '6b9bd28f-c136-5d68-aaf1-3641eb475174';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '261cb45a-b6c4-5ea0-8fae-ee7e378c0157';
update public.sentences set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = '4dee6b07-b62e-57b4-a27b-834e4b77162d';
update public.tips set unit_id = '211fdb30-d72f-5e40-b24d-d68e70926a6e' where id = 'ab90d735-de35-5880-b911-2b8705709877'; -- ¿De qué laburás?

-- es-enfermera → es-enfermera · tiene-que-ayudar
update public.forms set unit_id = 'feb8548b-0ed1-59d1-b3d8-a983690a21d1', position = 8 where id = 'de1d9a23-f0c5-58fe-a3d9-fb46c369d85c'; -- empresa
update public.forms set unit_id = 'feb8548b-0ed1-59d1-b3d8-a983690a21d1', position = 9 where id = '311adfa6-8fa8-54ab-b15b-9781acb23ad2'; -- periodista
update public.forms set unit_id = 'feb8548b-0ed1-59d1-b3d8-a983690a21d1', position = 10 where id = '77917834-0e0d-51c0-8e05-649acb213f2b'; -- cocinero
update public.forms set unit_id = 'feb8548b-0ed1-59d1-b3d8-a983690a21d1', position = 11 where id = 'c405f975-ffa0-55ad-8539-f81f3577b26e'; -- cocinera
update public.forms set unit_id = 'feb8548b-0ed1-59d1-b3d8-a983690a21d1', position = 12 where id = '42c5c576-dab4-597b-8a18-f629892fd444'; -- cocineros
update public.forms set unit_id = 'feb8548b-0ed1-59d1-b3d8-a983690a21d1', position = 13 where id = '143f56d5-496b-5ec6-aae9-120ab9963b9e'; -- vendedor
update public.forms set unit_id = 'feb8548b-0ed1-59d1-b3d8-a983690a21d1', position = 14 where id = '03405e06-59e9-502c-b414-330d95621417'; -- vendedora
update public.forms set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275', position = 1 where id = '3d11ce92-d4de-54a5-a990-235603d3de41'; -- contador
update public.forms set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275', position = 2 where id = 'd03753b7-ee11-5cdc-99bc-97631fda8346'; -- contadora
update public.forms set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275', position = 3 where id = '5a761776-01f7-598e-9472-5bb1fde2d6d3'; -- psicólogo
update public.forms set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275', position = 4 where id = 'f153e85f-c706-5603-b095-d3bbdaa0113d'; -- psicóloga
update public.forms set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275', position = 5 where id = 'a07f7fcb-90cb-5827-82b8-9a7750bac328'; -- policía
update public.forms set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275', position = 6 where id = '878eb292-1542-503f-98ba-8f3d20f24b3c'; -- persona
update public.forms set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275', position = 7 where id = '5682ba3c-20c0-540e-8264-2765266e243d'; -- buscar
update public.forms set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275', position = 8 where id = 'e90aabd5-4ea5-5087-bd04-32248c9ee29f'; -- ayudar
update public.forms set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275', position = 9 where id = '8871fc63-b91d-517b-8242-8e0c005553fd'; -- practicar
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'c544bc99-1230-53bd-bd46-cdb019e176ff';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '332c3345-e05e-5a50-a494-3dc0154d1e90';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'ef7d157c-3443-5085-ac2a-2293bc2dbc5d';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '9b401ad3-9f8d-504e-9c77-c5ddd677a3d6';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '88f66204-0dad-5906-bb7c-1b70db6edeae';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'a38c8911-1e6c-5879-b9d0-668c80a1374e';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '716f9af3-f1b5-5884-888e-e89a8b064485';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'f070ab49-b913-5640-ad72-a1ee0c407f87';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'df8e1ebf-f671-5a76-8f7d-4bd05217488c';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'f43afc7d-40eb-597e-8a5f-d0736e5bdd70';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'ec9d971a-c673-5a6e-9371-3cc6e8354db8';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'ff340c1f-8a9b-505a-a679-e1abca6b1e6e';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '8eaca4c5-4d41-5898-9cac-6ed64fd4fb8a';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'd771634e-312b-527d-b0e7-d73ac93adeb5';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'dd4b21c6-0c74-5395-a4c0-6488c218d6c1';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'c5c6b5a1-eb0d-5738-93d8-f3d4debe5c79';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'd43ebe17-6918-5e4f-8680-8d25f6607929';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '82302f26-2209-5705-9c75-b257c0a7f309';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'a13ac4bd-f238-5874-b4c7-96fa7e519edc';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '58bd11b0-9943-56c3-b365-25cd6e8e3102';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '86be004f-e741-5088-a04b-e1bec5d230c6';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '679f3d09-e179-5059-bdb5-a3fb107199c2';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '93933711-ba71-5d88-9833-eb9f6971ace5';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'd41fbe00-4b03-5886-a261-0d73644f7a01';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'efc4453b-76fe-578b-9edc-1f8a59b6bcb2';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '96b8be1e-8249-5663-842a-e3d7931f229e';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '45ae2f47-8090-558e-ab17-67e3c81cd675';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '5bb2abee-2ddc-5272-9a18-5064c6577a75';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '765c4776-4897-529d-b03e-f2ca1d989eda';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '8e159989-710a-5d8a-a4b0-1a341852c1da';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'fa51d67a-d723-5189-bc35-ecc0a6d31df6';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '2e951549-c8ba-5ad9-b4c8-d00ddcda7cf6';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '0725a0fd-1d47-539b-be88-f2e7432cff35';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'e67d00bb-99eb-595c-9fd2-1794c78009be';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '09e3d6d3-5164-5249-bd07-cf7ac34a5c2a';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '1dd34745-44d8-5752-b01d-58ac1cf336ce';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'e024cfca-7210-5314-aad7-33aa649111c6';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'd6322503-98d1-539c-a093-534f5a7bf0f4';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '72cf3ddf-80cd-5bfe-bdfa-0acfe3098d0e';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'cdc3f007-a816-527a-a76b-7a355140cf15';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '6c8386d4-9620-53c4-ad6b-95169ab6bd95';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '8e264630-b875-5a75-ab06-a0689e1372e4';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '9c5f89db-1dc0-5a0f-84d5-1fa6bb850164';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '2493ca42-6ea6-544e-8189-a80f80bf69a5';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'e0fc412b-8e52-5b5a-8b16-affb60528847';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = 'bfb91dc0-9ed0-5dad-bfa4-dffa4721c535';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '707c183f-7971-536e-b2ce-103fce6a1f51';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '0b89610a-6c7d-53c5-a763-507696eac914';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '07a0ee3f-d340-518c-9c1f-4ed6bd02902b';
update public.sentences set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '896000cf-be2f-55d3-88be-7082534b0914';
update public.tips set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '3910aabd-7879-56ce-9fd0-298db2aac86c'; -- Buscar
update public.tips set unit_id = '3e3ccc45-b587-5d81-a947-274b5db0a275' where id = '4c58f6d8-63be-595e-abec-599eea09eb64'; -- Every person has to

-- comes-vivis → comes-vivis · leo-y-escribo
update public.units set title_en = 'Say where you live and eat', summary_en = 'Comés, vivís' where id = '1974689a-177e-55c9-b4b1-69fba40389f0';
update public.forms set unit_id = '1974689a-177e-55c9-b4b1-69fba40389f0', position = 11 where id = '04757ff4-9e47-5218-ac9c-49ecba379f5f'; -- solo
update public.forms set unit_id = '1974689a-177e-55c9-b4b1-69fba40389f0', position = 12 where id = '888300a5-221f-50be-9662-94ed68059628'; -- sola
update public.forms set unit_id = '1974689a-177e-55c9-b4b1-69fba40389f0', position = 13 where id = '495074e6-1b5c-5ebc-bcee-a994621cf821'; -- departamento
update public.forms set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500', position = 1 where id = '84e92e76-9481-5326-b2dd-72277e50b90c'; -- leo
update public.forms set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500', position = 2 where id = 'f4006dfa-f855-5d11-ae1a-8f08ac8bcafd'; -- leés
update public.forms set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500', position = 3 where id = '34043943-a27b-553f-b673-9dc668010c38'; -- lee
update public.forms set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500', position = 4 where id = '0fc54c48-c22f-58ee-a90d-1fd37fc6a762'; -- libro
update public.forms set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500', position = 5 where id = '0dd57a14-c86f-5c6a-bf06-01e1bb3f84af'; -- libros
update public.forms set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500', position = 6 where id = 'eb0a7b38-5436-566f-bb5d-034e256c7b40'; -- escribo
update public.forms set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500', position = 7 where id = '0c4c6812-a83c-5801-9e15-e60946b1ff08'; -- escribís
update public.forms set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500', position = 8 where id = '3f064930-e7b6-5dcf-84d9-05109978a175'; -- escribe
update public.forms set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500', position = 9 where id = '82ccf352-dfa0-5575-b864-c0a323bc4cc9'; -- mensaje
update public.forms set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500', position = 10 where id = 'e892fc38-ebb3-5ca0-b3b5-7d731dc1f2f6'; -- aprendo
update public.forms set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500', position = 11 where id = '2164a078-066a-519f-974f-044a3e5957e0'; -- aprendés
update public.forms set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500', position = 12 where id = 'db3a45ff-dbe2-5f88-9919-489e9a3479a2'; -- aprende
update public.forms set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500', position = 13 where id = 'a4abda9b-bb23-5a06-b40f-5216f21e88e5'; -- aprendemos
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '8f976a30-4d6b-5f67-8187-70b74de54cf5';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '8a2760eb-3e4a-57e4-8b60-2ff7cc835e65';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'cd1df8ab-6382-50de-bbf5-a47cfd708f07';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '96c13791-ec48-596d-a04b-4d6bc1b2e942';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'f1b02d90-9ddb-583c-b46b-edf265df975c';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'e8326269-34e1-5674-b9ae-8b83235cbdab';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'd3e99233-7df2-51e7-ab94-44ad39af8e91';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '2b50fac0-ae11-54c8-98db-20221fe2b2c9';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '6ec35d8b-0623-5efe-9835-24b40a4b680f';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '9c2bae6b-3619-538d-a2d8-a14ed324b4fa';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'd6e174f4-e6da-5d9b-95ed-d42703e418eb';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'bffbaa1a-66d6-5345-872c-f95f38fce56f';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '2c611960-9932-5305-b37b-31bc1639c26a';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '416f4877-cc36-538f-9d69-b648036bd714';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '163f9529-d4cb-5b44-8adc-80cc68762ac3';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '0a1d4442-8bd2-5bc0-8c21-86c0ec411b9d';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'f7220174-5670-5a4e-ae36-929c322212e3';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '1e940460-95cb-553c-8247-c310ca3f98b8';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'b0b17a9e-7f74-5525-abb5-e3d05c61935f';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'da246286-af9a-5ea5-a36c-5af861c6cae6';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'cfd2b375-97e0-5dd3-8ae0-0557e5e247a0';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '62b71af8-e806-53ce-a972-afa6fb091e03';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '8d3d1f70-21b5-5e15-b2f5-294a63d0502c';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '018529e0-637c-529e-a1ca-69f159a8f560';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'f31ce5dd-5644-5e97-91a2-660316609e6e';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '3f975af4-895f-5ca0-b042-8b871307dd6a';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '3a6241cb-7df3-56dc-8737-bb7ad22db435';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '23cfc5b7-259a-547d-98b6-c7625a6e87c3';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '4eb09488-ec0d-5bf2-a19b-07adb2dbe746';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '374159c0-0c0d-54fc-a18d-f715344df222';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '63e1893e-20bd-541e-b9d1-754e7b78f8db';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '5cba15dc-d8e3-5305-9131-d3e4d95eaafd';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'b9d5d300-8b9e-5afe-8ef1-24764134dbd5';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'cb837f08-f43f-536c-8724-411e7a1db29b';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'c208fef5-5fe0-5083-a020-65f899287d9d';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '31773c87-84b6-565a-b19d-144946d08776';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '61d967d6-19ef-5e2e-810f-249ab9d0d025';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '98bb77c7-decd-5c7d-883d-5a4e01da1913';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '0444ef39-1e4e-5246-9126-1f8dae236d0d';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'efbcbc75-4bf0-5606-b044-103ef03a454f';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'ea078e45-8690-5d73-b3ca-fba5abb92019';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '195e449b-b784-5c0f-8b28-923f1f66695e';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '9c97fd2e-e1e7-5190-8853-35e5ab65a2b3';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'ea9e5d17-2076-5c4b-8d21-5f5a4573ae3b';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '4b23aaae-437f-5f55-9f84-5b9ec432e9df';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '8994145c-1a1c-52fe-906c-d3245c40fd50';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'be145594-a4e5-5187-9902-f1c6a0c6f106';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '736160d9-ff92-55d6-8902-0f877c1441b5';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '29121898-2f18-5c2f-a277-bece52d2573f';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'd4308ebc-6e0c-5608-b2f5-f8e2cf99ad66';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'f3f4cdb3-f881-552b-8f30-1340ed88e6d9';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'a7463fc6-7c13-515f-a58c-b8572cb5e039';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '2dc056f9-8a0f-5472-96da-f3ded8c970f8';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'd9b9fb1f-de99-50e1-a446-058e62ebc890';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '2baf6874-86ef-5668-a224-95e8b9644b20';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '758c8358-4c0a-5a83-b184-73ffda765be0';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '268fdfc0-5370-5d11-9eb4-2c890a11b7d1';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '4f1c7fec-ba31-5e63-9963-f05ef415b4f6';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'f0ff7fbc-09d3-5762-9830-6437e83497af';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = 'e514142e-87df-52e2-a97e-1a1d9d4b5e38';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '92f19e6f-bfcd-5b90-ad5c-5b2ba6978a52';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '90a287a5-19e1-55ce-87af-b2597ac1f1b0';
update public.sentences set unit_id = 'f818513a-baa5-5936-8787-c52431cb8500' where id = '07f67617-68e3-58f5-ae14-09f4b53a3bfb';
insert into public.tips (id, unit_id, title_en, body_md, status) values ('97723334-1e65-5466-aedf-bd8b97789fae', 'f818513a-baa5-5936-8787-c52431cb8500', 'Leés, escribís', 'These follow *comer* and *vivir*. **Leer** and **aprender** are -er verbs: *leo, leés, lee*. **Escribir** is an -ir verb: *escribo, escribís, escribe*. Say both vowels in **leés**: *¿Leés muchos libros?*', 'published') on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, unit_id = excluded.unit_id, status = excluded.status;

-- vendo-diarios → vendo-diarios · compartimos-todo
update public.forms set unit_id = 'a47573dd-a997-5b77-acd6-3b206415f578', position = 4 where id = '7614ced3-af95-5645-8dde-3b40896c346b'; -- diario
update public.forms set unit_id = 'a47573dd-a997-5b77-acd6-3b206415f578', position = 5 where id = '6633fc91-abec-5fde-9434-44978fa08654'; -- diarios
update public.forms set unit_id = 'a47573dd-a997-5b77-acd6-3b206415f578', position = 6 where id = '582e4187-4136-5645-9a13-c15247b949e6'; -- abro
update public.forms set unit_id = 'a47573dd-a997-5b77-acd6-3b206415f578', position = 7 where id = 'b75af42e-77b0-5b8e-88a3-3e5e4f747f3d'; -- abrís
update public.forms set unit_id = 'a47573dd-a997-5b77-acd6-3b206415f578', position = 8 where id = 'da819b85-50a8-539c-8f41-d85604ac7b7c'; -- abre
update public.forms set unit_id = 'a47573dd-a997-5b77-acd6-3b206415f578', position = 9 where id = '37c1bbad-c97f-529a-ba6f-97986d7e3a8a'; -- negocio
update public.forms set unit_id = 'a47573dd-a997-5b77-acd6-3b206415f578', position = 10 where id = '59ae363e-dcbd-548b-9e36-8b645102593a'; -- pibes
update public.forms set unit_id = 'a47573dd-a997-5b77-acd6-3b206415f578', position = 11 where id = 'fd9096ac-f5d4-538f-b7b2-79c6b1a47f28'; -- leemos
update public.forms set unit_id = 'a47573dd-a997-5b77-acd6-3b206415f578', position = 12 where id = 'ff457c5b-1b02-5050-b360-35133e9c2556'; -- leen
update public.forms set unit_id = 'a47573dd-a997-5b77-acd6-3b206415f578', position = 13 where id = 'e92be462-d226-509b-9226-81dda10ae0e0'; -- revista
update public.forms set unit_id = 'a47573dd-a997-5b77-acd6-3b206415f578', position = 14 where id = 'b1410b6a-5638-5fe7-803a-32fc5510e3d5'; -- revistas
update public.forms set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd', position = 1 where id = '9817ccc7-8a5c-58be-b6da-ae207eb7b81b'; -- comparto
update public.forms set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd', position = 2 where id = 'db8417dd-d7e7-50d3-b8c4-63507cc880e4'; -- compartís
update public.forms set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd', position = 3 where id = 'ff56b702-90c7-568d-a6ab-fb8d1c3505bd'; -- comparte
update public.forms set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd', position = 4 where id = '894586d9-cf67-5f30-8047-7316df084ded'; -- compartimos
update public.forms set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd', position = 5 where id = 'b5597b31-8bb4-5336-92be-579eb14f59cc'; -- comparten
update public.forms set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd', position = 6 where id = 'f65e386d-449a-53a7-80cb-900def2f4d27'; -- recibo
update public.forms set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd', position = 7 where id = '398b9892-cdcc-5181-8a09-d3e58c856740'; -- recibís
update public.forms set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd', position = 8 where id = '0cc14093-14e3-55e3-8ec7-3d09eabece95'; -- recibe
update public.forms set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd', position = 9 where id = '0f060264-3749-5f61-b4da-e9d8c257dd4b'; -- mail
update public.forms set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd', position = 10 where id = 'ce158e8b-e216-5891-a003-022092eb7d16'; -- mails
update public.forms set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd', position = 11 where id = '2cc25bf5-84f3-5855-8405-6cf08352a44a'; -- corro
update public.forms set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd', position = 12 where id = '43e8463f-7f69-5551-bd2e-393ccfc937f7'; -- corrés
update public.forms set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd', position = 13 where id = 'cbb2199a-2368-50c5-b779-b9639bc945cd'; -- corre
update public.forms set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd', position = 14 where id = '1ad38ee5-524f-52b9-8cd0-236f3c2ec374'; -- escribimos
update public.forms set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd', position = 15 where id = '53729f6a-027a-554e-b695-7e5ff77ece4a'; -- escriben
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'fe321256-911e-5700-93d8-d32544306383';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '8dc8025c-3bde-5190-9507-eae3663cfc17';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'a410d34c-0897-59a2-bf61-621d36625c68';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '2cffdd88-f6a8-5b30-a9d5-fc2120c9195c';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'dd18f51f-a598-58d7-b0a9-34ac1413d570';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '7c2603f3-ca5e-5a04-b480-b35c2a0f586a';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '52016e04-999d-5c6c-a169-645272fab8b9';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '890333e3-f08b-5e59-aeb5-c9d28245eadd';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'bb15c4cc-ff7b-54b0-b4fc-d91a37c1bcad';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'ff79507b-6eef-5b45-b4b7-9110628e2942';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '3585eb1f-373f-51cb-bf8b-4ea7120b9f27';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '1bb22844-5254-57cd-bfd4-0c377aec8e53';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '00d8dfd8-e231-589a-a6b8-dc438e4a534e';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'd45d85b1-29ce-5b80-b5c3-df3ded22bca6';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '660a8adb-bb39-5e22-8c38-aed5c9f01ae4';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '072f9850-0a89-5e0d-bdec-f93dae64f206';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '8687fc9a-1627-5bb6-b6f4-58e0ca33a2aa';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'e79cac32-9f15-5eae-b7dc-2de0b2bc766c';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'ba0a9429-bb1a-5bc9-91e0-ab49ec55c25c';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '3dab5fdb-de29-53fd-ae75-016831517db0';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '1203b481-ebef-57cb-a7bf-e7e46b820989';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'eafefaa7-e48c-58ea-8dc8-fe6a292e0ad9';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '94f30ad1-b776-5815-be92-d415a496a8c8';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '05f7d052-88e6-534f-af6c-6830285468d0';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '241dfa38-1b71-5090-81d2-ca5ff25474f7';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '9fdd0d21-7182-5c37-aa46-999ff7848598';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'e830db9d-a159-5522-b529-d307bcb9bd37';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'c0185559-73cb-5739-9552-e78c7c00e082';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'c24e1cdd-5c87-5a50-b32e-073ecf177fc9';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'a804cf16-7a95-5750-ad14-9d2811fbf33a';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '27f115c5-02e4-5a68-8c14-3d042764de26';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '1cfe9414-ca37-5c3f-b4a9-9518774610e4';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'a2ff4673-983e-5211-9b2d-614c9df082ee';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '3ba0fa6c-04ab-56f4-8105-aa244e9320a1';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '1e66a66e-f4c5-52d3-a0b5-ad9894ba6a15';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '67186c7a-95ed-5ae8-9aaf-53c2a2a87b0e';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '1cc63a69-bd3e-546d-8715-ce148de4a967';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'f11c2fbd-9d25-5a93-a6b8-8c19a7341e18';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '775d3af5-d33e-5415-8280-c47d4dda1390';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '37e60a4f-f814-55c4-a442-1f6b3f52ac10';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'c8f93bc8-4a06-55fb-b31d-d7afcbd59a41';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'a1cb0829-0336-5096-9572-145670bec80e';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '3f60708a-62d5-5896-a0ea-ab097ae53d4f';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '0e7bba80-b369-5211-9ae0-40fcf91db31e';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '3b46677b-a065-58fa-9203-92b0e7eda1ef';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'fad0a9f2-e126-5e61-bb7f-3d3c71ca77f4';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '1496cdf5-73cc-55ea-a264-b818d7b08134';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'c677e2ba-4464-56c4-b6d1-403192570a62';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '5ba23277-802f-5621-a832-2772d94d2a14';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '7a8ef6ac-52c6-529c-9b00-81418e750d2f';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '719d1b6e-86f0-564e-b822-2f140c683c1d';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '5e337e45-a38a-5d04-bdc2-752848597059';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '7d970d59-671a-5017-8247-8f6fc546f0c1';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '13dff565-88c8-5ee6-8d80-0510e99df90d';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '584b8aba-2ed4-50c2-98e7-b497bb1c0bfe';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '5823b0b7-2684-5c25-992a-ac9a12cecf43';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'fb6d0f45-fb8a-5b26-b902-e27c50136a81';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'ed28582a-b9d1-549f-958d-5c42c85b9487';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'cbbcddd7-8e9a-5e95-8443-189aa7e2c952';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'ff288354-50b5-53be-9932-23a612ab4d71';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '4e3eae9a-8cf3-5b1b-93a8-6d078f19b9e4';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '59c958f7-7e4b-5643-a6dc-7d770329bd62';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '593fcb5a-14dd-5f34-80e7-7190466d2e65';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '8e5fd3eb-f8f9-5501-bb70-cb360d95c357';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'b507b2c6-4c9a-539c-9cee-ccf2f5be5b37';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '74b3d62e-bc12-5313-b2af-e7625bdbe33d';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '1f91a7fb-f298-540c-886b-b94d778a0918';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '5929eff7-4aac-5c06-9186-c634a21a6767';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '5a4b0ba7-0156-5d2c-bdc3-ccd780c0a779';
update public.sentences set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '5b3eaa52-b4ad-54b8-bad1-3a6a0d2e6de0';
update public.tips set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = '5f609aca-4b7c-5585-9e3f-2d151bb4c25c'; -- Abre, recibe
update public.tips set unit_id = '14c7ae1b-3ee3-5f76-a20e-27a98696aedd' where id = 'ff18c38c-372c-591e-a3e1-3ae0c2d65dfc'; -- -er and -ir: different only in vos and nosotros

-- mi-edificio → mi-edificio · en-el-primer-piso
update public.forms set unit_id = '9ed0dbbb-2500-5957-b946-27d34bce9614', position = 10 where id = 'a875b218-835c-57d2-a529-fbc1d78e0366'; -- cuarto
update public.forms set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6', position = 1 where id = 'b684bc3b-e569-5629-a514-6c96b18bfd64'; -- primero
update public.forms set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6', position = 2 where id = '5d1ea8dd-c2fc-5de1-8825-a84a1d483872'; -- primer
update public.forms set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6', position = 3 where id = '1d9a6c33-45bb-58cf-9da9-d08984e36421'; -- segundo
update public.forms set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6', position = 4 where id = 'b33fca87-d83e-556f-8d84-8f262196f11c'; -- tercero
update public.forms set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6', position = 5 where id = '7bca6c2a-5c8c-50e0-b881-5dfd66aff9b8'; -- quinto
update public.forms set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6', position = 6 where id = 'c6cc2dd6-b70f-5312-9846-847bfadecee8'; -- encargado
update public.forms set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6', position = 7 where id = '61007ca6-bbae-500e-ab02-3810a67cf530'; -- encargada
update public.forms set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6', position = 8 where id = 'a5aebf88-94dc-5f0c-8c87-b2a3a0ca36f4'; -- ruido
update public.forms set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6', position = 9 where id = '4fdce2e8-b614-574e-a1dc-1b205a17baaa'; -- problema
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'e38ecaa8-41e0-5191-b1bb-f3766285973e';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '0c8628e6-32e1-5083-b81d-fca190140cfe';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'abdba540-8536-5007-9eb0-175a669ed785';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'a36040c8-497e-5eae-8f75-8498652df851';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '1f087309-ba2a-5269-ab24-c8497959c6a2';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '1d94a274-35e6-5e46-8e6a-f727866fc0de';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '65dc5c73-c471-5207-9f95-fa5056c37007';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '0b11238d-7b4e-5807-a073-58796cc5052b';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'f60220ec-03f0-5cc1-891e-418991fe2d95';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '8476195d-e549-55e8-977f-7df3184f2beb';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'a46a8d7b-29e8-5ba6-88c2-503d3d3702ad';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '36795fae-247e-5522-80be-db8df20bf017';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'a1b1041f-df31-5f61-a4a4-3e06c77deef3';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '19a9bb22-c376-5d50-9402-95074fe8cba5';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'cdcbb311-7467-5764-aa16-b8d0b9d5a18e';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '8192993f-b9fb-5a6a-9a4d-e0a4b3f1f9ad';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '363f9239-b5f0-5950-a7f5-db756431c8c9';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '50e01706-bab7-53e6-8837-62d4a8356d16';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '03c99a86-3cd1-57ca-a0a4-8d729c890f71';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '7044f89b-75cb-5e58-9446-93d58aed2ed0';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'c4ab71ed-ff98-5b99-a283-aee1fb0ac928';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '6c72422d-ee57-5eca-ae26-a46115bef0a5';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '02eee2d3-0eb8-50cb-9725-19a42ce61e19';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '8d287e92-b19c-57a1-9895-adb2ed9f9b33';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '4f784581-3736-52e0-b8b2-c15e91b6d96c';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'cd677b1c-9201-5d72-b4e2-9c93bb292f9f';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'd1770341-8a8d-5d8b-8195-fd3b63c1a3a6';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'efd18a67-6458-555d-b3a3-6552ffd4b16a';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '5d3718d2-a6cd-5253-93b4-f2cc3a9c8b91';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'd7a8997e-8dea-510d-b5ff-5726a874ba23';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '71d55399-c4ed-54fe-8845-99a64501dbd3';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '5b628ff9-5ae3-5239-b5e3-e74b4197e7ce';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '65a2217c-6c31-5901-a9b1-e3c7af672c3e';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '8b35889c-f1d2-571d-982e-08e69b2b8968';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'bd33a9c7-d471-55d2-98f0-85f47aab7fd2';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = '0ebab8f2-9d90-59d9-86da-e75096418786';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'df55084a-2c3e-5f24-a50b-c60bc7d77ac7';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'c1990ede-50f1-5149-a56d-381dd4b83646';
update public.sentences set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'ca428961-20ee-5f65-bf1d-36f8fd245b69';
update public.tips set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'd8622385-5e4a-5495-9a55-b9f96b8c8aeb'; -- Planta baja y pisos
update public.tips set unit_id = '2e2a044c-5472-5ddf-acde-589af0463ea6' where id = 'c538de60-17a3-5573-95d5-96e0be486781'; -- El encargado

-- mi-casa → mi-casa · la-cama-y-el-sillon
update public.forms set unit_id = 'c7cbf578-23ab-5875-9a1c-8104be80ad3e', position = 5 where id = 'd756a64b-850f-553e-af76-299ba557a497'; -- ambiente
update public.forms set unit_id = 'c7cbf578-23ab-5875-9a1c-8104be80ad3e', position = 6 where id = 'c0ea5123-a887-5d75-8459-5587b701425f'; -- ambientes
update public.forms set unit_id = 'c7cbf578-23ab-5875-9a1c-8104be80ad3e', position = 7 where id = 'a3415391-a463-56b4-a6d6-7a965ecaad22'; -- pieza
update public.forms set unit_id = 'c7cbf578-23ab-5875-9a1c-8104be80ad3e', position = 8 where id = 'bdf71561-4d31-55fb-abe3-4fef76d5a4d8'; -- piezas
update public.forms set unit_id = '2f523c7c-b359-5520-957a-9183d6737801', position = 1 where id = '4c6f34be-e304-5ffd-897a-8809e67bd3b0'; -- ventana
update public.forms set unit_id = '2f523c7c-b359-5520-957a-9183d6737801', position = 2 where id = '446f63cd-14cb-5350-b31d-1b5e5fec089b'; -- ventanas
update public.forms set unit_id = '2f523c7c-b359-5520-957a-9183d6737801', position = 3 where id = '785a4625-3913-5445-aa6d-5ca2ad3561b6'; -- puerta
update public.forms set unit_id = '2f523c7c-b359-5520-957a-9183d6737801', position = 4 where id = '671a26ff-665d-54f0-84a9-955ba5f72c12'; -- silla
update public.forms set unit_id = '2f523c7c-b359-5520-957a-9183d6737801', position = 5 where id = 'a58d4a20-6b77-529b-803d-223d6a0ab97c'; -- sillas
update public.forms set unit_id = '2f523c7c-b359-5520-957a-9183d6737801', position = 6 where id = 'cd223b69-b941-561c-86ff-86b49f27f3c2'; -- sillón
update public.forms set unit_id = '2f523c7c-b359-5520-957a-9183d6737801', position = 7 where id = 'dd37d83e-cff3-55ed-a07e-3c526fa24ab7'; -- cama
update public.forms set unit_id = '2f523c7c-b359-5520-957a-9183d6737801', position = 8 where id = 'ae7aaaa0-8b9b-59f1-af7b-e5c4b49cc563'; -- heladera
update public.forms set unit_id = '2f523c7c-b359-5520-957a-9183d6737801', position = 9 where id = '2ae9f8ea-1866-5e2d-8571-a5381eac1daf'; -- cosa
update public.forms set unit_id = '2f523c7c-b359-5520-957a-9183d6737801', position = 10 where id = '319c56ba-1a4e-5b73-a657-ccd1aac4c464'; -- cosas
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'c534af9c-e25b-565d-a096-1ab06849af19';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'f62b4ff9-7f21-57ab-9ba0-7bad017809ed';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '03060b7a-6d70-5455-9c3c-5553786e3787';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '0221c123-aeb8-5b15-bfb7-0211ed76adbe';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'c840dc72-d9a1-55eb-a4cf-7925184fc24e';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '9df19e09-b9b7-549c-b247-f200ece8870c';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'ef4ba61a-7b12-5981-83be-e1fa3313c1ad';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'fe38625b-23a4-5f9d-af79-e062c474d0f2';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'be8555ff-9a89-514d-80b9-e97badd102c2';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'fceb9c17-ab4c-547d-bb6c-810ea75d8fc7';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '17eb8c3e-f0fd-54ed-b14b-4b933d8f5e2e';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '558e34de-c339-547a-a9e2-ea160d7a2319';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '7d5b39a8-277b-5caf-8413-0e275aa039cf';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'dc45d7d5-366a-53dc-a609-4692f94aacf3';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'ac5e089b-4da3-5526-a42b-664cc05f0b3c';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '91c5df5e-dbba-5e52-8c9b-7b2aa63b1b96';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '682d7fa4-ff32-55a4-937b-ca5f6d3041bd';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'e6346537-3038-5b61-944b-b5e0509d2c20';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '99b43ab5-9599-5b09-bd21-4adbeadc8021';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'ad5b7423-77cd-5eea-8bbe-2ba0c694270a';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '02d885b9-ff66-5743-ab4c-d8e056f58317';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '75e7d333-dde1-5e76-a4be-51156610e73f';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '241b9a7a-01c0-56fd-9759-d07816628165';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '9b307d22-2e15-5c41-8995-aa85fb518372';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '4567cf55-aae9-5213-9c26-2fea9474535f';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'ace9a193-cd86-530f-a3c1-3d054a7e80da';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'cdc83962-9d0d-5e4e-b8ab-3f68f5adab34';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '90aac8d0-56fe-533e-94ab-ad70524d9e57';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '678c80ee-1183-5c03-8332-6704d38c51ac';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'cc7b8dca-4cab-5593-a5f0-6d11258fc644';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '1d7d1722-b47b-5ed6-b24f-c7aff050db38';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '361ad522-c0fe-5839-a3d4-ef71fa7f79b8';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'c7e50517-4a88-5e3d-a622-6b7df8b61a26';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '9bb2b2d3-3443-5928-98d9-86a7cf0f7096';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'bb46c910-574f-5a45-a30a-68555ca11ce0';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '025b2d11-c9e4-55c1-9117-9975cab5f54a';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '28c2696a-f4ca-5d43-ba5f-cc27df2437e0';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '4bb9292a-4fd6-5610-a9a0-32c6c7aa37d3';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '5a3d8900-ef7b-5163-bdee-1afb3812d96b';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '61f1faf3-8b5c-5377-bb93-ad596b85e95f';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '6fa02450-0675-536f-a728-b590acb2b371';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '497bcc92-95a8-5841-8c24-bae69d678e70';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '06f25ca4-48b1-5e39-8f8d-30ffcbfd499c';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '3f2f4667-59a3-53a0-b0b8-de0d0d543bfb';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'f5548626-8d6d-56f1-920a-a087621f1b22';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '22a99e8e-eb54-5368-beb9-3d4231aa36a3';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '1e81560e-2e8f-51c0-bfd8-e122b19c3a49';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = '3534df8e-3a01-52a6-aa97-98967620ef44';
update public.sentences set unit_id = '2f523c7c-b359-5520-957a-9183d6737801' where id = 'adab436a-d4f3-58d0-bfd7-5e5e49dfc238';
insert into public.tips (id, unit_id, title_en, body_md, status) values ('9c63129c-aa4c-5616-ba0b-7c1a66ea034e', '2f523c7c-b359-5520-957a-9183d6737801', 'Silla, sillón', 'A **silla** is a chair. A **sillón** is the big soft one: an armchair or a sofa. *En el living hay un sillón y dos sillas.*', 'published') on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, unit_id = excluded.unit_id, status = excluded.status;

-- la-hora → la-hora · los-dias-de-la-semana
update public.forms set unit_id = '61a56ded-546a-5ad6-a8ac-310375bed4ac', position = 5 where id = '0481e436-8275-572d-a73e-7ae4483941ad'; -- nos vemos
update public.forms set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5', position = 1 where id = '38ad4404-00b7-532e-8d0d-c368a0c45fd1'; -- día
update public.forms set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5', position = 2 where id = '186bfd97-6ee9-5709-8e3b-d26a6ce974b5'; -- días
update public.forms set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5', position = 3 where id = 'c8941827-bb3e-51ee-b4d1-bf842c43355e'; -- semana
update public.forms set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5', position = 4 where id = 'b4cbb4e9-59c0-5ba3-932a-15ba7b366c38'; -- lunes
update public.forms set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5', position = 5 where id = 'c34b9177-ddff-5d3d-a74a-b586f51908dd'; -- martes
update public.forms set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5', position = 6 where id = '8e315c80-175d-52fa-9fae-07cd32f1e78b'; -- miércoles
update public.forms set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5', position = 7 where id = '7ef7ac7d-a6ec-521b-bcc8-57d5a9a153f2'; -- jueves
update public.forms set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5', position = 8 where id = '7217ada7-ed38-5f9e-807b-b4145bf8d6f8'; -- viernes
update public.forms set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5', position = 9 where id = '7c00177f-dc2b-583d-acc2-95fde9ad0d3a'; -- sábado
update public.forms set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5', position = 10 where id = '0875cef3-dfa7-5550-8654-b867e045b8c6'; -- domingo
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '2534fabc-1341-50f6-89ee-4e1b014980cf';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'daac4bd0-88af-5e25-b4b7-2978ccebf2e0';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'aa2d8805-a665-5baf-96ab-e747e899c277';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'd545ffe0-2fba-5a70-9877-d5e2b3591f97';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'a0dcc0bb-c5f0-5883-a6cd-cdcf2a93f3b5';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '21c5d6a4-9e12-56ba-ad91-c36eb8d4a78b';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'a00a35e9-32d4-56fe-875c-0c0482e2d223';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'c645e64f-4b87-57a5-8467-3ae8214fe4f2';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '089b2a85-fa05-5fac-ae92-170c260ad9d0';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'e2ee00fb-2c61-54e7-be09-83e4503b0971';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'ce238759-2cb2-52e2-bcf1-885d72fd9f61';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'aa1b386b-65a6-5d5a-ad23-92c857ea7696';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '27e953e2-28bc-5d23-9c12-fbe44045bd67';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'c8fa5f63-9a44-5dd5-9a51-b73c460c77be';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'bde328f6-f252-59c3-9808-ded379a77b01';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '218ddc4b-f6ba-5919-a895-979da693bd90';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'fad0be23-8d5a-5cc7-a75b-5f2cd031f96b';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '07b74292-2e68-51df-9148-118f4b9ca530';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'cbbe1d44-03e6-557b-a1b5-ccb248ab6524';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'df3c6f2d-eb86-5668-af90-06ddc62088ba';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '15c03cd0-7309-5df7-9563-04118d2cf403';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'dfdab19c-e5b7-5503-8e6b-c116f6603376';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'f23cc1c0-9234-5a0d-bb93-999845c46768';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'cd66b95a-d002-5681-97a9-8b3e30146ce1';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'e944e260-0b7a-5c95-b9cf-435ca7974f77';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'edfd6d5f-603c-5bf3-aff6-2aaa3c784485';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'e399a348-42b5-5676-9296-4521ecf81801';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '20538073-4956-5d13-9934-b0436507237e';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '98e94a59-c280-5735-adbf-56a62b45d76b';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'c260eb78-f64b-5f73-90de-2b19b52393ab';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '9668ab2b-0b77-5567-81a3-207633a6eddc';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'fc2e3b0d-8827-52b2-9ff4-e96f75f4ed42';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '4d8129de-1e8c-5568-b496-5eeb7c3614c5';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '3e171a25-529a-5510-a237-41d0250df1fa';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '8ea634e5-580b-5018-8a45-aefc2d0c6998';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '3f98bf00-78ff-544b-99dc-9c51eb80d60c';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '43665ec4-f2ff-592a-a7a5-0789b42ab792';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '4967e51e-9cdb-51f1-8807-e42ef7235600';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '0dd57d15-804c-59af-a727-455133f01aef';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'f071cfe6-50c8-5fec-a148-c824b6c040c9';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'aa6c1b7f-1395-51af-8077-4bb855c49edb';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '31f24ada-6110-5208-8c76-0f1012f185f8';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '908f5b48-5ef3-559a-b760-16a8b9b67e75';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '0f460295-b5ce-55c0-b486-60d83ece4435';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '75092d31-1dad-5f30-b7e2-a960894982fc';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'e30d96cf-18d9-5e6d-bf16-a6529e29db9d';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'c007ea72-e99d-506e-886d-bc7de47d2b9f';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '80e8faf6-d514-59fa-9314-99e55f22edbf';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'a4146858-7a33-5834-a2c6-7694e3bd00e1';
update public.sentences set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = '7ed3811d-0cea-50ce-a627-b69f2659ab52';
update public.tips set unit_id = 'eb1a9154-e834-553f-8943-88e868c4bee5' where id = 'afc27211-febc-5355-9843-5cd952ec9052'; -- El lunes, los lunes

-- tengo-una-reserva → tengo-una-reserva · esta-incluido
update public.forms set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc', position = 1 where id = 'd13fdc36-301d-5f45-a6de-555ce85c20f1'; -- desayuno
update public.forms set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc', position = 2 where id = 'cab70178-425c-5d51-b5a1-bcc2669b2444'; -- incluido
update public.forms set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc', position = 3 where id = 'be2ef995-a323-5c8d-bce8-4d3006e32658'; -- incluida
update public.forms set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc', position = 4 where id = '562907df-67a9-52a5-aac7-97ea2a83476e'; -- toalla
update public.forms set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc', position = 5 where id = 'edc16f03-84dc-5a15-b9c2-4642e71ac677'; -- toallas
update public.forms set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc', position = 6 where id = '7c579b4d-3aec-55df-bb52-58ad9496eb94'; -- wifi
update public.forms set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc', position = 7 where id = '72afe252-2efa-54fd-b782-836c3bb3ad01'; -- habitación compartida
update public.forms set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc', position = 8 where id = '18ae5099-5c7b-5dde-86cf-4274fb4ea484'; -- habitación privada
update public.forms set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc', position = 9 where id = '733e8014-0b2e-5f14-a1d1-8016a1fb65fe'; -- alquiler temporario
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '723e1f96-7598-58a9-806d-f24a9fa6c131';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '2958be65-2212-559c-b72d-5203e768e971';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '52413fde-6a5a-5314-b12e-f8208b74c0e3';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = 'ef6d422f-4c5a-5e40-9250-7f40a64e1faa';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = 'adbb8a43-c57d-582d-a216-369184b2f7ab';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '94ea48e7-ec4d-50c8-8bfd-760257b7baee';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '9de122c4-21fb-58fb-990c-26c4643d9887';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '64f7d550-a722-5255-9906-161e7a9e405b';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = 'aa7fad56-64cd-5f03-bb5f-345b102c482d';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = 'e5b5d744-f69f-5cd6-a4d8-7b021c82b96a';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '369dcc85-9578-5668-ba4f-cf89d24d6931';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '26dc5008-f1d4-54e8-974b-981314cf4133';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '5c48b211-1e88-56c5-9064-b0b7137709bf';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '1c294725-0e5b-50e2-950e-ee26741ec6b6';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '1482c223-a071-58be-83aa-5209d36ef9c6';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = 'af87bf03-5ca7-5695-aff4-5cf4a1223096';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = 'cce2d39d-d059-58c3-ab2f-13bec8218a3a';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '2e4c5bed-6d19-505d-b445-f16b85ef33ed';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = 'c542ca7d-7ff2-5043-94d6-4f42ea6b9e83';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = 'd8e855de-b4e5-5e1c-a522-e2b65faf9f57';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = 'd5d7ef0b-399e-530a-abf9-2e3b0ecf88cc';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = 'a6ec7002-8da7-5f32-a075-5a15fdd66daa';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '8a7709c1-86e7-5733-8cda-30662548824e';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '12cbd51f-c7d9-5ac3-b6e0-488d52b70ea0';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '71a7f28d-eb5e-5331-bdfd-3c2dc64e7a22';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = 'a7dfd3ca-c1db-570f-9e51-38b9e365f8f9';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '5fe7c4a6-e5b3-544a-86f3-e3e241a59bc8';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = 'e6e50ca1-9168-578f-96a0-803c4c8c261f';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = 'd985514a-8dba-51ca-a577-6a37eb81b624';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '117d49de-2b58-5ef3-a1a9-09604b1b34ad';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '4183d2ae-be29-5894-8c89-26c551c7fdb4';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '4f394542-b040-56a0-941e-1847599a6ce4';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '19df2327-87ab-591c-90ba-dd2f1ebe2450';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '2d4bebe8-715d-5f34-9186-b57708ed2803';
update public.sentences set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = '7d7307f5-204e-5ff2-b66a-eb2b60a23cfe';
update public.tips set unit_id = 'e998e287-4207-51e1-ba01-09091a2b85fc' where id = 'c584c6c4-0148-5cf4-9a92-48b82350a4e0'; -- ¿Está incluido?

-- el-barrio → el-barrio · esta-enfrente
update public.units set title_en = 'Name the places in your barrio', summary_en = 'La panadería y la farmacia del barrio' where id = 'be613042-6935-5185-bf3a-fa4dc33eca15';
update public.forms set unit_id = 'be613042-6935-5185-bf3a-fa4dc33eca15', position = 8 where id = '90e84be5-2e02-5855-b5fa-d711cf3dad43'; -- entre
update public.forms set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef', position = 1 where id = 'a75f8f89-9a67-53c3-8c71-83934d9e0563'; -- banco
update public.forms set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef', position = 2 where id = 'a6eac0ed-2aaf-53c5-89a3-dcbcfcf7f800'; -- lado
update public.forms set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef', position = 3 where id = '412c1101-09e3-5fa9-87c7-da0d1e803efa'; -- enfrente
update public.forms set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef', position = 4 where id = '251a078b-2e96-53e2-90ab-c51fc586cda8'; -- atrás
update public.forms set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef', position = 5 where id = 'b181aa35-3169-5ac2-888c-8d266994dd18'; -- adelante
update public.forms set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef', position = 6 where id = 'b11d91c7-2349-5b53-84bb-7f395473eb86'; -- muchos
update public.forms set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef', position = 7 where id = 'bf3aefd5-78e6-5456-985b-78045c8b4b89'; -- muchas
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = 'bd27bcec-3f83-5830-a817-8d8934cc5471';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = 'dab68258-b6af-5812-9e13-0760950caa63';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '15c5e512-a730-562b-adb5-4dc1803a20ed';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '42fec8ae-5a9f-5059-94b4-ac225d00bc08';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = 'd5e8af50-4669-5aa6-8ab7-f5df39c34cc0';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '5ab3d341-01f2-5759-8f05-3c6a6571cde4';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '5b4f13f9-89b9-5469-ba2b-4558de64383d';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '75fa2a26-7310-5556-8c1b-be260df51fe0';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = 'a37789c2-dcb1-53c1-83d0-6866a26c3994';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '9d2e2ae5-7961-5680-b87c-2a6b7249faac';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '27512423-9417-5ca5-9e67-839fa04f2476';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = 'b716ab74-b648-58ef-88f2-5122efd9535c';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '03965b63-af3f-5665-bc40-43c97be19678';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '7a936685-0564-5606-909f-d6717baea48a';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '069eea26-a03d-56e9-b575-25d0d72c92c4';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = 'f458738a-f7a1-5f95-b71d-286825cb6da4';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = 'a09561d6-1d17-56cc-b34a-683e92553a55';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '676c859e-f032-5bbd-a7d0-ecdea05253fb';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = 'cdea0e8b-6e7e-592f-aa50-e5ce848b0457';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = 'cce46296-c80d-56de-a4b3-eff9e284b43d';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '020316ac-7456-50b0-b668-2c4a6370a2c9';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '0cb43567-8e1c-5945-82db-aae20c4d7027';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '496fe06a-dfc4-5e28-bfb0-2f9a696cd9a6';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = 'ce3f1939-a13c-57e0-a0ae-f5a8376db3cc';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '7a42c3ab-91dc-5c38-a213-c833f532f1d4';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = 'f5e62d62-a8b1-5c1a-a1db-f3f62ac958c4';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '66fb1289-b0bf-57bf-a79e-eb895bd82a7b';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '437ae75a-b871-522a-873d-3b1bfd614018';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '1a59af02-5273-5ec8-8a2b-945b4fed1a4c';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '80fe11ed-df26-51e3-be61-0a7dcf20ba03';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '6a084068-86f7-5e3a-8d4c-1ae7d061787e';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '8741e7ca-50ea-599f-87a9-6238134081e0';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = '860be239-95ba-5f9c-9d21-b6a67e689f50';
update public.sentences set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = 'c49e0016-1147-5ad3-b4c8-bae88a317944';
insert into public.tips (id, unit_id, title_en, body_md, status) values ('422fa950-2149-5481-baf3-bb31ce9e2852', 'be613042-6935-5185-bf3a-fa4dc33eca15', 'Súper, verdulería', 'Nobody says the long word: the **supermercado** is just **el súper**. For fruit and vegetables you go to the **verdulería**, a small shop you find on almost every block: *Voy a la verdulería.*', 'published') on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, unit_id = excluded.unit_id, status = excluded.status;
update public.tips set unit_id = '8d60a210-8649-54cd-a8f6-984af85f3bef' where id = 'e9b5fcfc-ba53-5a53-b7c5-cfbebadbf0e4'; -- Where things are

-- a-la-vuelta → a-la-vuelta · la-carniceria
update public.forms set unit_id = '8b9e9239-cc97-56ec-b263-606f0591c15b', position = 5 where id = 'f9c0caa3-7606-5efb-85c2-34ece7c1aa61'; -- queda
update public.forms set unit_id = '8b9e9239-cc97-56ec-b263-606f0591c15b', position = 6 where id = '6032c36f-3ec7-5c9f-a50c-c58f9243dc66'; -- quedan
update public.forms set unit_id = '8b9e9239-cc97-56ec-b263-606f0591c15b', position = 7 where id = '79fd484a-d703-5752-bf1b-24c30768bf33'; -- lugar
update public.forms set unit_id = '8b9e9239-cc97-56ec-b263-606f0591c15b', position = 8 where id = '22b3a537-7a0a-58d6-853b-c5c2cb857345'; -- por
update public.forms set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210', position = 1 where id = '121598bd-ae4c-523f-8ff7-4c715a229f8a'; -- carnicería
update public.forms set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210', position = 2 where id = '6a87cc04-d019-5367-9c66-4dba5279947d'; -- almacén
update public.forms set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210', position = 3 where id = '1cf81fe9-9824-5f11-a7a6-94fc18eebb11'; -- ferretería
update public.forms set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210', position = 4 where id = 'd9e32a6f-7d4a-51f3-9051-471922729b62'; -- peluquería
update public.forms set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210', position = 5 where id = 'fd9c5493-5632-5704-97e3-5f7bfe43fad2'; -- lavadero
update public.forms set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210', position = 6 where id = '8ab81990-f737-5007-9ba4-eba8af9f0ba6'; -- librería
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'f8dc2a6e-4099-55ae-b022-d04fd7d55936';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = '94bf455e-236d-5815-8b05-eb47aaab980b';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'b5432652-b903-559e-96d2-4a49181bb326';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = '99d400b6-1337-53a1-978f-1ac0c200083f';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'a17235df-7826-58c5-ba13-89d2ce2bb856';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'd39f5e5e-2364-5ec9-871a-fc1e879ee52f';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'b9ea0168-e5b9-50fa-b5e9-0b79bd85c549';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'a0cae6be-02ab-5041-85de-43e21f5fba6c';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = '0720644e-d63a-5df1-863c-f4d30b539864';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'd9624e29-3868-5de8-b70e-46576d2e1023';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = '114e6adf-d463-56d8-9fb7-40a302dad1d9';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'dbd84f92-dbc0-5355-81ef-64a989473b9a';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = '6921c1f2-0d98-5149-a8c3-81f1c1547ec0';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'f5d3cd45-4f1c-5820-892a-cb6407f8aaab';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = '46890159-3575-5c32-9b81-8c27a4fa9688';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = '0fc88100-98e4-50e6-9c8c-cdcf10731b2f';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'e0eba981-642a-5e03-ad7a-7f27b940734d';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'f0847ea2-28e1-5fcb-9111-5dbcacd0749c';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = '65714b2f-8380-5794-b082-3c511f103131';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = '2b6da9a6-8416-5d36-bdb2-0f82fb320059';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'f2e67931-2465-5e0f-ba0d-e0518d3f5335';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = '1e9e728a-5664-50f3-8b11-f43dddd958c9';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'd8b1600b-0fd1-554a-bbb3-4a267a01a5fc';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'c6876cf3-c5e8-542d-81d4-2e7e6fa07a4f';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'b65b51f0-3800-5526-b1cf-df528dabdc36';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = '7950977c-3ae5-5191-b622-6b9ea310d0d7';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'd22bb7e5-8c04-5a07-be16-024207044dd7';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = '4e47deea-2d65-5b16-8c3f-c4302f0078d1';
update public.sentences set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'd68717ea-1b16-5046-ac39-548a96bc5015';
update public.tips set unit_id = '090e52a6-3031-557c-a379-8e4f51c85210' where id = 'eeed7cdf-3b8e-5dff-9e77-07cb41136b16'; -- The shops of a barrio

-- queres-podes-vas → queres-podes-vas · quiero-aprender
update public.forms set unit_id = '740b6205-cb92-54dc-806f-96cc347f8ee0', position = 1 where id = 'c48e6e77-ae50-51b9-b468-45a4afd5bec4'; -- puedo
update public.forms set unit_id = '740b6205-cb92-54dc-806f-96cc347f8ee0', position = 2 where id = '22a744a3-5009-5c6a-b052-dd0387426f29'; -- podés
update public.forms set unit_id = '740b6205-cb92-54dc-806f-96cc347f8ee0', position = 3 where id = '04cb33bb-a7e7-573d-a067-220df77da818'; -- puede
update public.forms set unit_id = '740b6205-cb92-54dc-806f-96cc347f8ee0', position = 4 where id = '00d9b733-8a9b-57d0-9f21-e5543c94c69a'; -- podemos
update public.forms set unit_id = '740b6205-cb92-54dc-806f-96cc347f8ee0', position = 5 where id = '861838af-2674-521f-9d59-adc451045f0a'; -- pueden
update public.forms set unit_id = '740b6205-cb92-54dc-806f-96cc347f8ee0', position = 6 where id = 'bb58191b-40ee-5dc8-87ae-3319ef2d3d57'; -- hablar
update public.forms set unit_id = '740b6205-cb92-54dc-806f-96cc347f8ee0', position = 7 where id = 'fe76395d-caca-5253-9785-40dad3fc8679'; -- salir
update public.forms set unit_id = '740b6205-cb92-54dc-806f-96cc347f8ee0', position = 8 where id = 'e9a0f5e5-1381-5ac7-801a-76cc37b4848e'; -- salgo
update public.forms set unit_id = '740b6205-cb92-54dc-806f-96cc347f8ee0', position = 9 where id = '2b7c22e5-c09c-54d9-a613-872cba25698e'; -- salís
update public.forms set unit_id = '740b6205-cb92-54dc-806f-96cc347f8ee0', position = 10 where id = '6f72147c-8393-560e-b1f9-0190dbe8f8ed'; -- salimos
update public.forms set unit_id = '740b6205-cb92-54dc-806f-96cc347f8ee0', position = 11 where id = '09c46931-1410-5a8e-ad24-f3191eb8728b'; -- boliche
update public.forms set unit_id = '740b6205-cb92-54dc-806f-96cc347f8ee0', position = 12 where id = 'cb52e998-78c9-548d-ad6b-3a6450d2f052'; -- cine
update public.forms set unit_id = '740b6205-cb92-54dc-806f-96cc347f8ee0', position = 13 where id = '283fc0bf-1537-5afe-8c46-bef1e58979be'; -- hacer
update public.forms set unit_id = '740b6205-cb92-54dc-806f-96cc347f8ee0', position = 14 where id = '976750b9-651d-588a-a81a-fa8fc5f3b60b'; -- comer
update public.forms set unit_id = '740b6205-cb92-54dc-806f-96cc347f8ee0', position = 15 where id = 'efd8c9fd-836e-57f0-bb9c-f9f70d6e6570'; -- ver
update public.forms set unit_id = '740b6205-cb92-54dc-806f-96cc347f8ee0', position = 16 where id = '62272393-a8d2-56bb-805c-4f6502f85265'; -- conmigo
update public.forms set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47', position = 1 where id = '4e127e76-890e-5f02-a135-7273cd027a21'; -- tener
update public.forms set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47', position = 2 where id = '341dfa9c-9daa-5cd4-8e2e-e463d9acd017'; -- ser
update public.forms set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47', position = 3 where id = '08ca46a1-c284-5828-afac-f80a58aa9372'; -- vivir
update public.forms set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47', position = 4 where id = '18de39a8-543e-56a5-8294-a41b4e1351eb'; -- aprender
update public.forms set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47', position = 5 where id = '6b7db714-a7d3-59d2-b464-6b3f32934f78'; -- estar
update public.forms set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47', position = 6 where id = 'e6900f56-2c63-5aed-a202-5bb09bf3761d'; -- escribir
update public.forms set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47', position = 7 where id = 'fb85e909-3c1b-544f-9bc6-e38dee3dfacc'; -- entender
update public.forms set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47', position = 8 where id = '2c3267b0-22ae-548d-ba38-647bd6de495c'; -- abrir
update public.forms set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47', position = 9 where id = '48ea8cd6-ac98-5724-bc7a-04e7a338cab9'; -- saber
update public.forms set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47', position = 10 where id = '4cc0b18c-a8a9-50a2-b7c4-9caeb2576cdd'; -- si
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '46c6361b-c2b9-53f0-bd31-1895646d4664';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'c14b7216-fadd-5070-b870-015bf5eeb51d';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '6a8d3627-ac18-55fc-a858-3d41b6277c6a';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '55835b31-e61f-50c6-9d58-df9e1db02b0b';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '144c7981-a3eb-5256-a18b-b7daacb432c9';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '4aabf951-b190-5cdc-940f-a265f10d795a';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'ec170613-aaf3-59f5-b0b7-394bd99c8c6e';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '65550ccb-c1f1-5b92-91a9-d4522862e0ba';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '51c9288f-12da-5d09-817f-ad89cc5612f1';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '5c3d9dbc-dac4-51b6-a974-20d85759aae5';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '31e8ecc2-861b-5a3d-a109-5820029252f8';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'c2fbd3cf-4ba1-54b9-9d08-35009c397f2b';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '7bd407c1-74e4-554a-921e-288f778fc00b';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'd48b539d-3635-53a7-906d-4eb3cddc48ab';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '2432150b-0e63-5712-b327-c870ab899340';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '36fab4e8-2411-5296-9966-1b7be682163a';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '1ed0655d-f38e-5052-9b26-8afb836e86ef';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'db9ba0a8-b686-58cd-a503-22cd181c5044';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '4118ece1-d47a-5947-a3fe-6df04e0a7e18';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '323a8573-8dbf-5658-b09e-35021f020323';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '4bd1cdcd-d646-576a-8704-fae1f419b7c1';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '9b3d0d30-63f2-53ea-911d-a3a7a98b3bfe';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'd51b7214-be8c-57fa-86bf-1264f2d92317';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'db81004e-083f-5353-a88a-751fc2cf868c';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'f6b7bfea-ff09-5911-a3f5-a558cec7fed3';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'e0a03b7d-d832-582d-8b43-276e82856756';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '80dfd865-8683-5f0e-b413-dd2f06376c87';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'db654077-f505-5796-85e4-fd3396e95ee8';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '2b8faf54-d413-57db-a69c-967d37201d7b';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'd078272c-c2a9-5497-ac2d-19e1c8a923a8';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'fd85762c-116c-5472-b311-7ed5bea02ba2';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '58df2613-e44f-5d0c-a55d-8d828162d315';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '8e48e16b-efef-5fb5-b5d3-c7fe24deacea';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'edcf5a33-c52b-5a82-94d1-f11e6946f706';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '80aa666d-be7e-5cf6-ac7c-c37c06351cef';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'cb7ea7ae-ac47-5163-aeef-c1d700d9f008';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'f6110b0a-6577-5ef7-b218-ff7441583d7f';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '96e18f94-b250-5b9a-80d3-c8398d8dfa13';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '6b5acd2a-6aec-567f-a3a6-a0c28da44a68';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '8ccadcd3-76e8-5f77-9422-8db2df80056b';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '90e1be92-4db2-5727-858e-013af61b83b1';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '500d8ebd-33e0-5259-9fd7-83bc64c91cf3';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'b851208d-ec07-5f8d-9873-3687651bb951';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '4c170eb5-2bd7-51d0-8d0a-f0e0d6df9af7';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = 'f636358f-9546-53cd-8082-e674e0487d6a';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '52f9f6bd-6f6b-5b0b-bba0-55f5ba4a7fd0';
update public.sentences set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '3deb95f4-b86b-561f-8d90-d6f49f0473c9';
update public.tips set unit_id = '5158ead4-5cf4-5602-89cf-455a5e2cae47' where id = '0b24bf7e-8636-5794-a6d8-1bad55a811a2'; -- Si

-- preferis-salir → preferis-salir · vuelvo-temprano
update public.forms set unit_id = 'ba4a74c0-9dbd-5b9f-9f9c-e2c7ec49c749', position = 4 where id = '74782c7e-594e-5d56-9857-0fa9c9f15500'; -- teatro
update public.forms set unit_id = 'ba4a74c0-9dbd-5b9f-9f9c-e2c7ec49c749', position = 5 where id = 'b8fde527-c1b7-5aa2-ad26-acb68c2065dc'; -- museo
update public.forms set unit_id = 'ba4a74c0-9dbd-5b9f-9f9c-e2c7ec49c749', position = 6 where id = '867a1a9f-6d2a-5f64-9bc9-51891bbb7e0e'; -- fiesta
update public.forms set unit_id = 'ba4a74c0-9dbd-5b9f-9f9c-e2c7ec49c749', position = 7 where id = '38facbbd-f5b4-5433-9631-2262d85453d5'; -- fiestas
update public.forms set unit_id = 'ba4a74c0-9dbd-5b9f-9f9c-e2c7ec49c749', position = 8 where id = '83b13623-0925-58d5-8e79-7a630ef15e0b'; -- entrada
update public.forms set unit_id = 'ba4a74c0-9dbd-5b9f-9f9c-e2c7ec49c749', position = 9 where id = 'e198adca-9134-5b94-a91c-13e7c83ec304'; -- entradas
update public.forms set unit_id = 'ba4a74c0-9dbd-5b9f-9f9c-e2c7ec49c749', position = 10 where id = '6da64442-f431-5947-9e92-63d00683210e'; -- pileta
update public.forms set unit_id = 'ba4a74c0-9dbd-5b9f-9f9c-e2c7ec49c749', position = 11 where id = 'e4cc9b9c-cfc3-55d4-b56c-fce31209787d'; -- juntos
update public.forms set unit_id = 'ba4a74c0-9dbd-5b9f-9f9c-e2c7ec49c749', position = 12 where id = '0d2b1fbb-7145-580c-8382-7b3e3d1643cd'; -- juntas
update public.forms set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918', position = 1 where id = '0985d8bd-3748-5a75-a0ad-f39ec14dc8cf'; -- vuelvo
update public.forms set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918', position = 2 where id = '560dee08-6e15-530d-b57b-4d80de14374f'; -- volvés
update public.forms set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918', position = 3 where id = '5cee4979-af12-50bd-b4d5-1bc687a72d5d'; -- vuelve
update public.forms set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918', position = 4 where id = '318beb64-4395-522a-97e6-ffc6cbe9d752'; -- volver
update public.forms set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918', position = 5 where id = '7851009d-6999-5910-832c-0304a40bb079'; -- empiezo
update public.forms set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918', position = 6 where id = '7505dd35-d79c-5111-8045-3c76b5093a38'; -- empezás
update public.forms set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918', position = 7 where id = '7f3d29d2-875a-5eb5-905a-9a1df12eb19b'; -- empieza
update public.forms set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918', position = 8 where id = '40b6c332-cd41-54f6-b500-81828dc8c4dc'; -- empiezan
update public.forms set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918', position = 9 where id = 'c0da2895-a85b-5348-a537-9dc7126feca8'; -- empezar
update public.forms set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918', position = 10 where id = '466b1e3a-2a10-52b9-ab98-53ae81443c99'; -- pienso
update public.forms set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918', position = 11 where id = '4da25e42-244f-56a8-8415-3375dd44ff5c'; -- pensás
update public.forms set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918', position = 12 where id = '3d22ad09-201f-52a7-bef7-01bde1699a83'; -- piensa
update public.forms set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918', position = 13 where id = 'f44e7ae0-33fa-5921-b778-d474cfab120d'; -- creo
update public.forms set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918', position = 14 where id = 'daaf7871-6257-5db1-b67b-56b78d71905f'; -- creés
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '0c07e896-766b-5ea0-882e-13d541159c46';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '0980dff1-bbc0-532a-a137-60756b446463';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'a2799167-5f29-5ada-a61b-6a1d0aed3467';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'ed29d63f-aab6-5a64-a708-19a01cba5cd4';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '957fe08a-6fa4-559e-ad74-532b18345d60';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '1a9a0744-b302-58ad-a37b-5fd15f4811a8';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '53593344-f247-5543-8ca2-f6d261dc15ec';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '747b27c8-df81-5d41-8b98-e193f0711099';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '31113ed5-a714-5401-88fb-42a9696dcee2';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '8bcb71e0-c284-54ab-a3c6-b17ff8aece32';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '60c8cf08-b0af-51c2-8f89-00aaaf2938c8';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '31256996-a70f-574e-ab04-7c65fc3b15c6';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '1685fb48-de1b-5036-9a57-33ad6f7f4087';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'ceac56c7-11fe-56f1-96ee-68d25931fb12';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'e3aa892a-c2b1-518d-8437-46c77d3d51c3';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'b0251f76-8b54-5e6f-b7ae-e79e68870ca6';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '5d961fdd-7049-59b2-95e5-cb8f6af21a33';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'cb6a5f29-4a01-5995-901b-1b90fedc3020';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'eac509f1-3f5d-5877-8979-2c1dbe9b3102';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'dce9686e-571a-5383-a4da-45039fc4435b';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'e034e6ea-d043-579c-9144-2f4562643fe7';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'c03b0e21-a9a5-5a60-b264-7afc1859f278';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'c13471aa-6135-572a-87b3-dce22a1bde6f';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '3df76fdd-e051-5a4a-a230-c16da7907737';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '979803f2-2f74-5897-bd71-d60ee47bca78';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'ffd22a2d-a256-5f06-846e-d452fd0018d4';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'ca50f7b3-731f-501a-bf92-4a3fa4c6741c';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'd511bf92-ebf8-5fdb-ace4-bca3676e6bcb';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '533657e7-6e47-5f73-af7c-363736432caf';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '2985e841-8712-5334-87b0-0661c68b3bfa';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '34987649-e046-57f1-ac59-f8ec1453d187';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '33df3b17-8bad-5eed-ad21-d1d0afb3a29b';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '0903720e-235f-5ef2-95ef-46ed6d2feb8f';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '94e8011a-47de-5c3e-9a4e-e3e2f82e543f';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '2d85a1e8-cb17-5868-b77a-19085910188f';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '8e107f8d-9ff1-5d76-9eea-7c33d357d047';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'd0a8828f-b743-560b-ae1f-240759eb8035';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '9cc2bdc7-dd56-5f65-a724-5f991b7bd0a7';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'ca594ab5-a6c0-5c19-9122-ced35d8f350c';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'e68e44d4-fc75-5a50-838d-fd994bea474b';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'b00e8071-462f-5c12-96ce-7ac48fb53622';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '0bcde808-9da3-5fc7-ab82-8f446ce38728';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'f305342f-6e8e-501c-befb-1e74dc81e860';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'e8cd972f-35f0-5623-98a8-bffe7960e343';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '9fb9ff5a-0cab-562d-ab7c-23131c437b16';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'c333be33-5430-5e11-9c8a-eb7b064597cd';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'd4f97f50-5f92-50be-8a00-08a30156bfa1';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'ec8c4fdb-ea3f-54fd-b836-c2c951dbdd0f';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '29164baa-cf6e-53b2-9a7d-032152acf8ec';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'af690cc8-73d1-5497-a542-f626811bbf7f';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '88c82797-a37c-5bea-8834-80b22bf41871';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '635d86a2-42a9-5de8-8b48-54a7b2609ee3';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '9ff7784e-bf1e-5cf2-a8e6-de9cc39b18fd';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'f6a77392-ef1c-514f-9793-a17f8bdae4d3';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'f6f06e9d-174a-5d19-a49d-bfb932417fec';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '22f33aea-5509-51a5-8339-2c70e0b37626';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '92159ff8-80e4-5d35-82a9-beb0b4e4e0fc';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'fe30dbbf-3c84-5a1e-ae34-b4462f088e16';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '316b50a0-e6ce-5b52-ad59-176c5d9f3743';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '49af796b-5429-5cbc-bf15-a0c6b3292008';
update public.sentences set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = '46447c48-da48-5408-9e0f-c50723858528';
update public.tips set unit_id = '8bd4758c-e5e7-519b-81dc-943f039eb918' where id = 'eb18db97-cf2e-5687-a5df-2e4b175166b1'; -- Pienso ir, creo que…

-- dale-veni → dale-veni · pasa-toma
update public.forms set unit_id = '3376ea65-8afe-56be-bae8-b5d06b46c9cd', position = 4 where id = 'ffbe185f-b79a-5cd1-a375-bb1c6fc9733a'; -- escuchá
update public.forms set unit_id = '3376ea65-8afe-56be-bae8-b5d06b46c9cd', position = 5 where id = '032de494-62d9-5a2c-989a-2712eb696050'; -- hablá
update public.forms set unit_id = '3376ea65-8afe-56be-bae8-b5d06b46c9cd', position = 6 where id = '3e2e231e-bad3-5a47-92ef-b243c1fe5376'; -- decime
update public.forms set unit_id = '3376ea65-8afe-56be-bae8-b5d06b46c9cd', position = 8 where id = 'a982503d-3241-507c-b908-d369e1332050'; -- andá
update public.forms set unit_id = '3376ea65-8afe-56be-bae8-b5d06b46c9cd', position = 9 where id = 'ad84274c-ee70-5250-84b1-c28cdca73307'; -- esperá
update public.forms set unit_id = '3376ea65-8afe-56be-bae8-b5d06b46c9cd', position = 10 where id = '84f32356-29ba-5c79-945e-877a823ea534'; -- esperame
update public.forms set unit_id = '3376ea65-8afe-56be-bae8-b5d06b46c9cd', position = 12 where id = '718c9740-a3f6-5ee4-9290-891f0d77b4d4'; -- sentate
update public.forms set unit_id = '3376ea65-8afe-56be-bae8-b5d06b46c9cd', position = 13 where id = '61c0a872-85a3-52fb-b3fb-053f5000c844'; -- fijate
update public.forms set unit_id = '926f5a00-a817-519b-b1cb-262cba133230', position = 1 where id = '638c8479-3d09-5c90-bec4-244878d1df86'; -- pasá
update public.forms set unit_id = '926f5a00-a817-519b-b1cb-262cba133230', position = 2 where id = '1f9b2710-b71a-5e4e-b4a1-814a7d0a9d03'; -- pasar
update public.forms set unit_id = '926f5a00-a817-519b-b1cb-262cba133230', position = 3 where id = 'efa22c7f-41d6-50c2-8510-2dd734839639'; -- tomá
update public.forms set unit_id = '926f5a00-a817-519b-b1cb-262cba133230', position = 4 where id = '81873ef2-a7c4-55c3-942b-a3733183012a'; -- mates
update public.forms set unit_id = '926f5a00-a817-519b-b1cb-262cba133230', position = 5 where id = 'f246d6af-1336-5ba7-95ad-d779633ca68b'; -- momento
update public.forms set unit_id = '926f5a00-a817-519b-b1cb-262cba133230', position = 6 where id = 'e0682e82-d786-5f60-85ab-ff8f6e6ab9d5'; -- así
update public.forms set unit_id = '926f5a00-a817-519b-b1cb-262cba133230', position = 7 where id = '9490e655-1378-518e-8333-408949e792b7'; -- dame
update public.forms set unit_id = '926f5a00-a817-519b-b1cb-262cba133230', position = 8 where id = '802d689c-4bda-5d5e-897e-37c1d32439c9'; -- hacé
update public.forms set unit_id = '926f5a00-a817-519b-b1cb-262cba133230', position = 9 where id = '00cad462-3f66-594e-9b12-bd593f3170f7'; -- poné
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '9acf549e-5193-588c-b7a8-1cf312faecb6';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'b3f8a6cb-643c-5423-a3f4-f9f59e90eec9';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '2d9cdd45-afe9-5b1b-84cd-fa7b89f82c75';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '5a844507-25e9-5ffd-9deb-740b3a1b86d2';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '21d4e9e7-ad32-5391-b9a2-bc42b5902b2b';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'ab6f08d0-070e-55ad-968d-4372b5edd48f';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'd0b2e3af-7f0b-5a0d-9763-3b520411edee';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '912743f1-cd18-53ec-9676-00e01a9f5b75';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'e77715ad-d59f-5be7-b285-2ee8b422a9d2';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'de5a3030-67cd-5820-80d3-36faab44264a';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '5f0c2514-f109-533e-9aa2-dcc9c7c9c899';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '5cdcfee7-169e-5903-9639-f5056cfe0bb3';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'd828e946-d828-551e-aa9f-bf395635701c';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '020a9f0e-1b0c-59d4-824e-04320e99935d';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'b430029a-a4eb-5c5c-8869-caa700312b0a';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'cd51f6aa-b382-5725-bb87-1d616350e1d3';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'aaaad56e-ac50-547d-80f0-43e9afa2c32d';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '30696b3b-c2c6-55f0-9e45-9ab9cfe40965';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'dc177a21-b4e1-5cf0-a555-1fbdd87977fe';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'dc25113c-b485-57af-b183-0678a96734dc';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '6b259a45-ad02-5870-b547-0c78caf3eb83';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'ff0fe640-cf1d-5742-b935-3174ac6656fb';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'b8fdc240-1a9a-5992-87c9-1b03b8042cf4';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '14fe3264-eb5a-5011-8fa1-053b740ba10c';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '6604d1ff-750c-51c3-b85e-5039fb9a6f3e';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '909d81e2-d53a-5308-aa99-7d1cc1c48629';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'c8860d6f-317c-51f6-b1dc-d904be4a0e03';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'aea65e35-ff46-53c7-b592-e04a36e20d48';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'e7b7c9dc-02d2-5692-8b9b-8db8079d1d04';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '297c83ff-0f42-5e31-b33c-7580d402600b';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'e24428d5-2757-5f03-808e-55e004af7636';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '94cf778e-8b39-50ac-809d-00f7ada6da92';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '951150df-d2b7-59ed-803e-ff49e7fa62f5';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '96f34217-ef51-5231-8445-9be1c7291903';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '98a13038-d070-5b99-82cb-dc4ea21e2546';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'bc21ce93-ff02-5dd3-bab3-30ec1ebfd41d';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '61255909-6c21-5245-ba4d-8c237da45b82';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '2467a808-4b8f-59a2-98c8-8c6acd0abdd0';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '5bf5f6b8-9414-5a0a-a0e0-051974176244';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '2a850d6d-60ec-5dec-85b4-0d657e3d9e4c';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'a658ed52-42f0-5d1b-942d-62c7e251a1a5';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '6e3691d4-a1b3-5b07-9bb5-6890668a2ed2';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '54969ef2-afc1-5e0e-8a30-0c6ac83e85d6';
update public.sentences set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = '52159ec2-c2dd-544f-bb64-e3b1f7461c37';
update public.tips set unit_id = '926f5a00-a817-519b-b1cb-262cba133230' where id = 'dc9f86b5-115a-57f2-aeb5-e87bda316574'; -- The short ones

-- segui-derecho → segui-derecho · dejame-aca
update public.forms set unit_id = '714e2bff-95e1-5d03-96ef-a779c76932b7', position = 2 where id = '6bd246fa-6aae-5571-9e8a-094b67209a63'; -- derecho
update public.forms set unit_id = '714e2bff-95e1-5d03-96ef-a779c76932b7', position = 3 where id = '2ed7b9ed-c8b6-5d38-a91e-bf772b8cf97c'; -- doblá
update public.forms set unit_id = '714e2bff-95e1-5d03-96ef-a779c76932b7', position = 4 where id = '5cd3441f-8db9-5357-98cc-95d8536062cc'; -- cruzá
update public.forms set unit_id = '714e2bff-95e1-5d03-96ef-a779c76932b7', position = 5 where id = '3674cf57-4553-547c-a597-465a1224ee49'; -- cruzar
update public.forms set unit_id = '714e2bff-95e1-5d03-96ef-a779c76932b7', position = 6 where id = '1323d1d1-9312-55cc-a6c9-3601826d2e4e'; -- caminá
update public.forms set unit_id = '714e2bff-95e1-5d03-96ef-a779c76932b7', position = 7 where id = '0742da54-9467-5ff8-aeb7-21e3b77fbb77'; -- preguntá
update public.forms set unit_id = '714e2bff-95e1-5d03-96ef-a779c76932b7', position = 8 where id = '69aef7e7-8882-5105-b427-0c501e2236d3'; -- pará
update public.forms set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf', position = 1 where id = 'f8070b42-7471-56b0-a3b3-c819d101f2dc'; -- bajate
update public.forms set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf', position = 2 where id = '58bc6fc1-4945-550c-a783-a5c22d5e1ff3'; -- subite
update public.forms set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf', position = 3 where id = 'be3d3385-5e53-5f3b-af19-e31e8cdc3dea'; -- dejo
update public.forms set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf', position = 4 where id = '476c1f5f-3b91-5e4b-9a4a-bdd4e2913adf'; -- dejás
update public.forms set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf', position = 5 where id = '4ab3d9a6-e1d4-5d55-b264-528e7e1ce7b5'; -- dejame
update public.forms set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf', position = 6 where id = '4484c76d-4a3c-5ec9-b864-82b7f53ce234'; -- llego
update public.forms set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf', position = 7 where id = '7dba56aa-be41-5bd2-948a-dbf13471f104'; -- dirección
update public.forms set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf', position = 8 where id = '286f0378-dff8-56e2-b765-80228289e59e'; -- número
update public.forms set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf', position = 9 where id = '8d521844-8afb-5970-80a9-090a0fb64227'; -- altura
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '3f92dbc3-d7e4-5ccb-87bf-f77c24e8448f';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '3b041435-6833-5776-b946-08175e8a48d0';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = 'f77b75f4-0097-50a6-90d6-2fc7ae23658d';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = 'fb908576-08ac-51bf-902e-166d3696d55c';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '7b44af1f-1ad6-562a-9e6a-46867b5ca715';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '3eff1e0d-18df-5f83-9476-65ec0dbe9b05';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '4da11ec9-e750-597a-95f2-bb73adcf7b49';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = 'ed440861-972e-5a62-b6e3-7d5dfd65e511';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '71e55cef-de3d-599e-9b80-7adbcbacb5f6';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '9b4ebb55-2915-502f-9be2-4614f3421b37';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '170ed854-a6c6-5c81-80fd-62bde8024b7a';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '4575bf78-959c-5bdb-89ca-cba43f2c7bd9';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = 'c464591a-38c4-5edd-9cc6-b0e21fb564b3';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = 'de310fd9-0a6f-5b86-94d7-aa2154577783';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = 'bfdde9bf-adb7-5897-adbe-7189c2fd00a6';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = 'b86c3bcb-d7b2-574a-8e7b-1814d15c2341';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '9dcd1f34-e46a-5e9f-9774-aa421f72b2e7';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = 'c2f261bc-3a82-5a04-a708-f74d8479be69';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = 'd4c90ea7-5878-5bcf-a1c2-1f5a7de4949a';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = 'df62790e-47ef-5679-bb51-728912e5d96d';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '00b6bbd1-91a3-5827-a36b-8ba8a7bb87c2';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '2cc16917-5bb9-5d4d-8b3d-301024b8e920';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = 'f10e2ace-c437-5107-8ff9-04fdc22d9162';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '7a1f0221-90d0-5f2d-9cf3-6543c27db994';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '729ceb7d-927b-51e0-a43e-410bbc0e413b';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '96785b43-c355-5679-b967-209d806bce4c';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '46e1278e-a0fa-5072-865b-6f98f26a9206';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '9632aa7c-2429-5d9a-8206-31061a956422';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = 'ff14c7d2-a717-5bbb-87ff-f5ebef43c98a';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '123ee3e4-46cc-5ca0-950c-f55da61927cf';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '1fb6f6dd-c4d8-5b7a-9b71-32ce6bd853b1';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = 'fe6d7510-96d4-558e-b967-b386af8e45d4';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '49ac0a69-0d95-5e43-9707-546019a9de5f';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '9186b922-2fc3-522c-aa4d-d686f85dcde6';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = 'df5113fa-093c-5a38-8bda-93a171dae6a8';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = 'b3491aa5-ce7f-57d1-847f-aeec5bc6eabc';
update public.sentences set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '419c9f7d-da19-5960-9852-bb8ec0d0cf56';
update public.tips set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '5c1d67c6-5ad4-5b4f-bfce-ca368b14bf65'; -- Bajate, subite
update public.tips set unit_id = '593694b8-2f07-51bc-8f15-01e7164b3acf' where id = '6b5e4dd1-32f1-5210-99e2-f0e00d40b4cb'; -- ¿A qué altura?

-- la-campera-nueva → la-campera-nueva · es-muy-chico
update public.forms set unit_id = '70cf9841-8e17-590c-9fd0-503d47b7b3e1', position = 9 where id = '458961b0-a232-5059-bfc8-6ff90d514421'; -- nuevo
update public.forms set unit_id = '70cf9841-8e17-590c-9fd0-503d47b7b3e1', position = 10 where id = '986f22d9-9e2a-5d3b-9ed1-bed30b43f497'; -- nueva
update public.forms set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f', position = 1 where id = '64ad3fe1-ac1d-59c3-b58b-6d7391742422'; -- ropa
update public.forms set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f', position = 2 where id = '7b67bee1-a991-5c06-b1bd-92ddd01e0e9d'; -- grande
update public.forms set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f', position = 3 where id = '1f8dc9fe-a371-5587-a443-5499834b5c7c'; -- grandes
update public.forms set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f', position = 4 where id = '917e6ca1-7923-5051-8b0e-fdced2fa2d6f'; -- chico
update public.forms set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f', position = 5 where id = '8ed060a1-dc16-5283-8b9c-2243ed28d658'; -- chica
update public.forms set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f', position = 6 where id = 'e8908215-5cc2-55f3-81c3-d771fa54fe15'; -- chicos
update public.forms set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f', position = 7 where id = '8e0923c5-3a9c-58a4-8e79-8e745c2331d3'; -- feo
update public.forms set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f', position = 8 where id = '83164bd5-1e5d-51df-8af0-aa01ea0e91fc'; -- fea
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = 'a15b3df3-84e3-54ed-a1f4-9e1b3f537862';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '3fb40b75-8fdb-5214-bbc8-66de59bf3567';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '4a1fd07c-7314-561b-bb33-7f85ab2848a1';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '51436e05-06c3-54fd-af0c-377d3d77994a';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '3bc481c1-0cc5-5374-844c-9212c5269c8b';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '4514b309-8ddb-5f5d-ab86-16d7007094d9';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '360225fd-8b55-59ca-864a-46713674b851';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = 'd694e240-7365-5d84-9e26-26dbe7d644ec';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '07268658-7592-566b-a278-59b289e411d5';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '138f31d8-4798-5f9a-b7fd-902323fb69f7';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '1a34d811-cae9-5751-a399-55a3f2d63f26';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = 'caa755fb-fc10-565a-bc21-dc44052bb339';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = 'd71c2f42-9ba2-575e-8330-5ef0e2074afb';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = 'e1de173a-06ef-5b1b-b943-523a2522d5a1';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '2eeefa14-d097-5807-ad2f-385e815efa25';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '6a090f55-9784-5fb9-b974-a4288861b9a4';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '07575ab3-92ab-510e-a599-b4694b6be483';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '27efad18-d65d-585f-a7ef-ab8a39faee9b';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '503c4eac-adde-5908-be1b-c0d92ddf6959';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '790bc43f-1d5a-5a76-a964-bcdad150e6b7';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '1e16c226-7f49-55df-85a8-f2ae32bf9210';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = 'a12f599b-bec2-56f8-af31-ab76e32d520d';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '708bf9e0-f60e-5860-8d2f-984d982b3b9a';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '5ccee2de-681b-50f8-8288-fce0d072c48e';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = 'a97fb730-573b-530d-b6d8-984be7ee2aa4';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = 'bd6f13a2-fb11-5ffb-9072-f0f3f20ee1fd';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '7b38b4ee-836e-5f87-accf-3fe81354aa52';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '441689e1-1045-5122-9a18-2849b0b7e667';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '504d3fb0-47b9-5864-b3d0-ce815e200001';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '5e0210ab-f486-5eea-9ca7-426020aa7b44';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '77602d88-1938-554a-8d62-43ec388bc1ef';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '82cb0776-d5b0-50d3-8a6f-c7c52d0289ed';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '8f26b60b-300f-5eec-acc4-743a31d9d79d';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = 'bf5ed7bf-18c2-5a1f-a814-e70a6b617311';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = 'c789a057-2aca-5e11-95f0-790bce549048';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = 'caa65abe-5524-5b36-aaa4-9cd94cfeea8a';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = 'f6a0d8d9-9239-56a0-b429-54a6cf0ebe58';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = 'f6f36d28-2ab0-5a88-9752-b0512100f2f1';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = 'ffea7fdf-d774-5229-a2e5-4e237f499425';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '1828aa0c-e8f0-5a2a-9e89-a1ab4a616984';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '2ac56233-afda-5869-bf8b-ce9d072fe592';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '220c94ba-89d9-583a-80ea-451a38c5b181';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '682fb732-4558-5d35-acd1-358187aaca38';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '4119637c-ea9c-51c1-a26e-0c4351802360';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '167123d3-8615-5697-a599-55d6918fc0de';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = 'f5b55504-eb33-58dd-ba75-05102d315585';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '5d7b78d6-d974-555c-870a-f0f251170b2c';
update public.sentences set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '5a7699ad-644d-5862-b959-7c6173cbaed7';
update public.tips set unit_id = '99d56ffd-246b-508a-9a51-8aa1416c782f' where id = '5f0726c3-0c2e-524a-b89f-9832deab7142'; -- Nuevo, nueva

-- ropa-y-colores → ropa-y-colores · celeste-y-blanco
update public.forms set unit_id = '13fec277-30b8-5bdb-9718-e682351abfd9', position = 1 where id = '609a55b9-4e9d-5a72-8520-ce17e937dd86'; -- color
update public.forms set unit_id = '13fec277-30b8-5bdb-9718-e682351abfd9', position = 2 where id = '6b2dbdc0-407e-5c39-adde-98352fd5f7a0'; -- colores
update public.forms set unit_id = '13fec277-30b8-5bdb-9718-e682351abfd9', position = 3 where id = 'e563aeca-4261-5e9c-9d25-842334fbed5e'; -- azul
update public.forms set unit_id = '13fec277-30b8-5bdb-9718-e682351abfd9', position = 4 where id = '4146aca4-9f7e-5187-9616-c94e2ee76780'; -- azules
update public.forms set unit_id = '13fec277-30b8-5bdb-9718-e682351abfd9', position = 5 where id = '596bff35-a0a6-5d39-89c2-a4990e712bdf'; -- rojo
update public.forms set unit_id = '13fec277-30b8-5bdb-9718-e682351abfd9', position = 6 where id = 'f122b32c-97cf-51a2-900e-2120a3161a33'; -- roja
update public.forms set unit_id = '13fec277-30b8-5bdb-9718-e682351abfd9', position = 7 where id = 'c71368bf-785f-5aa3-8706-ad334b7aa14d'; -- rojos
update public.forms set unit_id = '13fec277-30b8-5bdb-9718-e682351abfd9', position = 8 where id = '67ea9400-4317-56a8-ad6e-c45f8e5c52ab'; -- rojas
update public.forms set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31', position = 1 where id = '5a0ac8ca-b9a7-592b-9b5d-b1ef45032419'; -- blanco
update public.forms set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31', position = 2 where id = 'b2c02410-517e-5e83-8823-16a52c15e81a'; -- blanca
update public.forms set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31', position = 3 where id = 'ea5ed26b-5d39-51af-9729-79e14d695244'; -- blancos
update public.forms set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31', position = 4 where id = '0865d68b-cb73-5859-b350-4867560bb0f4'; -- blancas
update public.forms set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31', position = 5 where id = '25e12d0a-2520-5960-b9d8-5bde7f11742c'; -- verde
update public.forms set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31', position = 6 where id = '2b86f1cd-9ff3-5f34-bedc-711fd7c46505'; -- verdes
update public.forms set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31', position = 7 where id = 'a20daff5-e988-5837-8bc9-a063eecac0a1'; -- celeste
update public.forms set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31', position = 8 where id = '4d9bbb97-6c71-50b9-9918-ae7da1206d3f'; -- celestes
update public.forms set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31', position = 9 where id = '2d6d7347-4b75-599d-92f4-1e815c311964'; -- rosa
update public.forms set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31', position = 10 where id = '04760bad-b814-5a3c-ad00-3b4db7040470'; -- naranja
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'f095c0ef-4743-5db1-8238-9aab08cf520e';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '04bea076-cf96-50e1-ac4f-ad1e41b3d05f';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '8781f45f-2695-5dca-9dbc-0ac1e616a8bc';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'c1fe793c-689a-5c7d-a608-845392379e34';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '15da2908-113b-502d-b422-6adef492957a';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '327ed58a-3b54-5d1a-9a00-401174b5b615';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '9ec80345-41b4-5d23-98fe-27011ef5460a';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'a2b04fa4-fd40-525e-9f56-58e777ca55bc';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '943817e7-fdb9-52c3-bb3a-4097dd309e24';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '08d4c7f8-7472-57e6-809a-3c78530da4b1';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '091106c3-cbc9-5fb2-9500-096bf7b5ca20';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '1e489129-fc8b-5d10-a381-721018ce330c';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '9389e765-45fe-5358-a103-91944c7d9c05';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '2d33022f-c95a-506a-b0cc-8ee259a02253';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'e264f2bc-94d3-5d04-95d3-8bccecb64316';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '11a7c579-078d-5e22-b3b8-622479bf6a6b';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'e6875a2f-a28a-57d1-9cbd-ccea29f9afa6';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '87263e74-8268-53c2-be88-19e08fd64e2a';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'c26bfd50-ea79-5f46-9154-26070a84a676';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'da4de71e-bac5-5f1c-9661-b9cca38a78e9';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '576a0b9c-123c-5eea-a4b1-f00be4bb2ac9';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '7721b7ca-c252-5330-a3a7-bfd4c175c738';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '19aa9805-21ea-55bb-af52-a1dd9587433b';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '3a2083be-1fe2-544d-a009-e794eea01d1f';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '8466d716-b54a-5a34-b8b3-138df61e43a9';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'f015dbb9-2bec-55d5-a8ac-a5472249bd99';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '4610dc91-862b-563f-9760-7f7b7fa34332';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'e79428d9-0589-5e2a-a4db-2b2719d90a21';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '88b730e9-d534-590c-bd07-597a668a9e21';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '243a82f6-53cc-593b-a117-025ba6463a9f';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'e4e97ec9-57ea-51a8-872b-91009e001b2b';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '08542d8d-7952-5acc-96db-33afa68fc2a7';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'df508a2a-a051-5031-999f-eafad9d26f38';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '71e351d4-56c7-5b75-b619-05121c75b08a';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '6f1a5cea-98a1-59e8-852d-a20941757b83';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'e888215d-9f91-509a-bc9e-7d343f944637';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '762c3309-9851-59f5-82f1-25a8b12f1d31';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '81c8fc7e-d32d-52c0-8fc2-5bfcc65cd6b5';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'db024666-6323-5aaf-bc4e-6be0e285e8f8';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '59a9288c-918d-5995-b5ee-a1f845895b54';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '2f12cb8b-b6e0-5779-90cb-757070209fb0';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'e8aeb228-e306-5a02-b959-ac0567e89440';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '427daede-a84c-541e-a663-7fd7f9504bb5';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '558353e2-f40b-5674-bbe7-2b4bcc65a939';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '9e6f29b2-c53d-555f-aca2-273d493b6df0';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '7d82f7ec-ba7b-558f-a171-2fcdc812b815';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '09d6488b-4caf-5ddb-89fe-4140e0d598ff';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '9bd922e3-17cb-5664-96a7-948f49b3712d';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '0f23e117-69b9-5285-91b7-c2a83defb304';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '9a61f376-6f89-5321-925b-ae9a4b7492e9';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '512bb563-0430-5823-bb5a-65dd03542e1a';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '30bf2749-4bf9-51b5-bd3d-947472a74ed4';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '9170d4bf-1ffa-5919-9933-cd6d6eafbff1';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'dc956e26-1058-5fc9-b05f-b50b680b4be9';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '661a3ac0-7062-5b47-b41a-f1ae504b0161';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'feee2c5b-c9c5-5a5f-bf49-08d0617c7044';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '26df4969-1313-55df-b46d-cc7d86003fc9';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'cb3b040e-1883-5fbc-8dc7-0ca3212901a5';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '7c80699b-7f31-5c5e-8adc-5038af1476a7';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '7aaa37d8-e33c-5532-ac99-8420df184659';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '3380eed5-7ea0-5d2b-9f78-c60c3f7edbe7';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'e75a8b9e-0f4c-5c5a-94cf-c3bcd86423db';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'fc464e13-21ad-566d-a237-a61cfab6e45b';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'b63d1bef-97ab-574e-a359-03c54f1400a2';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '2e6df514-ffa3-5f53-b17f-969c5894f573';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '5d713759-17b5-5859-97fe-d880303ec9a6';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'c6e9619a-71c3-53bb-9471-9e53fe99b8f9';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '0356300f-6a4e-5dc7-8cd5-028a178c4d2b';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'c00dbfaa-adb9-5f61-804c-a9b4ae212b7b';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'd9613055-4f4e-5779-85d9-5c37ed8b0126';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = 'be8e6d30-1233-531c-9b3b-22aa963687d2';
update public.sentences set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '7aee5a7b-d3a5-5aef-93fa-4b2a9af105fc';
update public.tips set unit_id = 'f5535aa9-849e-5d16-895b-b35fa4bffc31' where id = '53370f9c-ba05-5f62-b511-24a2a447f934'; -- Celeste, rosa, naranja

-- este-buzo → este-buzo · lo-llevo
update public.units set title_en = 'Name more clothes and colors', summary_en = 'Un buzo gris y una camisa amarilla' where id = 'b3f216c5-d105-552a-b3f1-254cee4747b1';
update public.forms set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e', position = 1 where id = '6969ca1c-2ad5-5bf5-9c86-b7bf2f104ff3'; -- cómodo
update public.forms set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e', position = 2 where id = '651e4bc8-c05e-58b3-baf7-967034c150c5'; -- cómoda
update public.forms set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e', position = 3 where id = 'd04ef862-5ebb-5946-b368-868d267ab7eb'; -- cómodos
update public.forms set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e', position = 4 where id = '3f37fa97-8082-552a-b0cf-13b96d3ad48f'; -- cómodas
update public.forms set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e', position = 5 where id = 'd2d26d26-92a8-56c1-a429-39fc102f6803'; -- cuál
update public.forms set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e', position = 6 where id = '284df7df-86d3-53ad-88db-58692ef69ed4'; -- cuáles
update public.forms set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e', position = 7 where id = '5cf816d9-c126-5f1a-a720-6cdaf59c12e6'; -- talle
update public.forms set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e', position = 8 where id = '3c074cf3-6040-59d5-a25d-d986271181cb'; -- probarme
update public.forms set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e', position = 9 where id = 'a974d264-c100-59c2-8e38-dbabc8115210'; -- probar
update public.forms set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e', position = 10 where id = 'efdb50f3-1c5f-5fc7-a6bb-a6f6402d7d48'; -- probador
update public.forms set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e', position = 11 where id = '6e887719-65ff-5fab-a30d-d51e19ed17f7'; -- me queda
update public.forms set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e', position = 12 where id = '51303a34-8b2d-563f-ac4c-bd6fb8040485'; -- lo llevo
update public.forms set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e', position = 13 where id = '912bde55-6645-5bf5-b3e5-e9fce2a3a8b4'; -- la llevo
update public.forms set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e', position = 14 where id = '799912da-ff03-589f-bcef-09ad76f8f410'; -- solo estoy mirando
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'c26d1a7b-03e4-5016-94c0-3c7252cd6a7d';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '18adf35b-ece4-5e57-877f-68a87b66cf18';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'acc58fdc-a0b7-5779-ad3c-68871348ceb8';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'ba051271-ef74-5d51-a119-f17c97e9f619';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '74a9052f-0063-56b8-8296-b8321918559b';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'd557da4a-0b43-5d23-aa5b-9f33e5670293';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'e1cd31d8-bd78-576e-a253-a6847143fad6';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'c7ca5020-9a05-58bc-946a-39cf90c577a0';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '54627767-8ecc-5659-afde-3c529aca3046';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'c17c227a-422d-53e8-a7db-cbfaab0bddc8';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '1d674685-9d7c-5534-bfa9-cfa0abc31cbe';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '4d505c21-94d3-5b7b-9f9b-d24c143dc0a6';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '8b6ab14b-e042-57ed-9cb7-4630413d38e8';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'c974411c-d312-5805-a1b1-e0641fd5b8bd';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '8920f1c5-ff94-52bc-ad3d-ab33339e4686';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'f0689af0-acc2-5a27-9ac1-8ed43cf07526';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'ef28c44b-2326-5842-a8bf-d81b54ae525c';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '6c095f88-f484-5cac-8013-ed5e10f4f9e9';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '5a5ad058-60a8-5d86-8614-f9be8bfb794f';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '5fed6679-3143-59f9-b15b-e99a0c33e623';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'bacfed00-285e-5e60-af2b-126608fc8c8e';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'ec896ff6-2a88-59d4-8c62-5d7d02c3fb0f';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '32473f2b-2457-55ac-92aa-39fbf64385be';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'fb241556-e776-5694-aeb4-fdf353fab9ae';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '5ba04a0c-635c-5bd8-949d-56cc65e7ec18';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '5861703b-48ea-577e-a8fd-5623372c5622';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'bf49b8b9-b746-5c12-9e02-0fa382fb7a78';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '8483e41b-cce2-5c05-af93-fa06aa88f577';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'd7611c78-82fa-5319-be9a-217713247f4f';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '303ebf86-3e28-5d49-97f4-6b83623afe1e';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '0c282ec9-370a-5aa6-ab86-74df4fb4673d';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '76a5aeec-90eb-5ee6-95ab-0ba34c013181';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '44d3ed79-b603-518c-9a12-6c24cc0de886';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '60d0caec-abb2-54ea-83ff-a8f335d3f7bd';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '048e7f46-4fb3-582a-8e5d-8f33b4463b36';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'a2c6d1dc-7369-585a-b19b-058b1abc470a';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '56f430b2-fcc5-50b0-a14b-18e96aa4acc6';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '607167ed-2401-56f6-ac00-fdb7fb1b2ad3';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '91cb41b4-77bc-5d73-a0de-3d70cc8f67b8';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '26970076-f6db-58f6-8398-68a8a679bc56';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '23d26b0f-b297-5221-8a96-87fcfe2024ec';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '9e05b584-9ed1-5828-9180-e9e4ff1a67f1';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'd8819c2b-549c-537b-a101-3c98df9b255f';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'd0cbf01b-dd22-5af4-8c07-bd8e61e89531';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'b3fc0b73-2657-514d-9be9-a4c3c134f8f9';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '7eff3763-6dd1-5fd8-aa57-7d12703ce816';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'a0508998-45f0-5b32-ae24-3656026bec6c';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'd2ac1cfe-1e3d-5bb1-90bb-4f9b8589b5b3';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '13078466-603d-537d-8425-4931a7d3d03c';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'aa2e22a2-0813-5c54-8da0-0811ba1b3ca0';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '33dc1d41-e9b1-50df-af9a-4c18255e851d';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'b5008ff3-5c5c-5314-8cf9-3ef5f3550f8b';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '2b9c1ea0-300c-501b-94e3-ed58080cec1f';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '0a00488d-b59a-59ee-a531-a1b0ce40e564';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'cdf38286-2cf5-578c-afd5-8d11303f0a53';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'eb565945-336f-56fd-9378-151204d7cd77';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '19e83e01-43f8-52dd-96a0-7bb2f364663e';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'c67735bf-18ec-58ee-9be0-57cbce854179';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'c17ce3ca-5d32-5d30-9e49-768d38b6f958';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'b211a2a2-294c-522f-997d-6e0614b35ef6';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '0a3f8243-07e2-550b-99e7-72a3d0dd954c';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '13da2d67-4ddd-5819-b8cb-cbc4d21d1e3e';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '241312e7-9afb-5d19-9527-ed454d50af00';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '7fcf1580-e553-5d78-a439-402b335a8bd8';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'd6a8359f-774d-5f4c-b2e8-609ed3d429d9';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'e7b177b7-6ac9-5685-a328-1347676b0ad7';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '608abec7-08c0-5431-8076-dbc9c678a682';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '6e4c0258-d3d3-5808-96c6-3273e05b41ff';
update public.sentences set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = 'a2ad9df2-20cd-5be4-ab11-daae5c160553';
update public.tips set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '1f894de9-91ad-51fe-8542-9bab3593187c'; -- Me queda bien
update public.tips set unit_id = 'cceba8fd-7ed0-56b1-bf8f-0a93b51de75e' where id = '834d42dc-2aa8-5ffa-b50d-ecbf01e319e5'; -- Talle

-- la-rutina → la-rutina · todos-los-dias
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 1 where id = '66c87f87-7220-54ba-ae85-b1cf34cc38c3'; -- me levanto
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 2 where id = '9f0971b6-277a-51fa-82b3-e73e30df141b'; -- te levantás
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 3 where id = '760eea97-4e6c-53a9-9281-74c4219f739c'; -- se levanta
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 4 where id = '3313381b-d51b-5e4b-9817-85d74d0335c8'; -- nos levantamos
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 5 where id = 'f7509368-ee33-592d-ac70-eed8d502e037'; -- me acuesto
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 6 where id = '991188ae-a056-55a0-8a9e-6d761455d745'; -- te acostás
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 7 where id = '439ba985-7c7c-5554-ad06-5b6a5b847b3a'; -- se acuesta
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 8 where id = '1712d004-9a3f-5321-928d-c00832b6b07b'; -- me baño
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 9 where id = '61563d84-d7a3-573a-bcf8-37c1a8dc345b'; -- te bañás
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 10 where id = '5df13f06-ff9e-5779-a2ec-cf097ea70535'; -- desayuno
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 11 where id = 'f53cde60-88bb-5982-bdc7-7aeafb27bac7'; -- desayunás
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 12 where id = '7e4d390a-7de3-5251-ab7c-547aa5bf012a'; -- almuerzo
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 13 where id = 'f78c47d0-1b8e-5561-a054-f631a23277ed'; -- almorzás
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 14 where id = 'dc013b91-5cc8-5e47-968e-97d94a1ea077'; -- levanto
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 15 where id = 'fd8a3a9e-a1b2-52fd-800a-3da63aa8ce2e'; -- levantás
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 16 where id = '5c37bc4a-a8a4-526b-9ef3-c14faa5a6f9c'; -- levanta
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 17 where id = '1a4d96c1-340c-5096-a7cb-eaa54f63bcd7'; -- levantamos
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 18 where id = 'd4d682d8-0232-5a7e-9844-ddb22d7e0007'; -- acuesto
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 19 where id = 'bf400955-1ef2-5f06-9170-4504cf718a6d'; -- acostás
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 20 where id = '66aee40a-62ac-5f3c-9519-24085d8a888a'; -- acuesta
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 21 where id = '3be01419-1ee3-542a-a0c2-1729ff910131'; -- baño
update public.forms set unit_id = '441e2e5b-f704-511a-9e55-ef9613425ce8', position = 22 where id = '956352e2-b61e-53a2-b913-16f3f43ffa46'; -- bañás
update public.forms set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54', position = 1 where id = '7354bc6c-e0b7-5a6b-a1a5-569397b54807'; -- ceno
update public.forms set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54', position = 2 where id = 'dd03b871-0d53-59a9-999f-98be1ae78b11'; -- cenás
update public.forms set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54', position = 3 where id = 'f077196b-0352-5000-81bc-14197658412b'; -- antes
update public.forms set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54', position = 4 where id = 'acbd1c31-36cb-55e9-a5bf-ff19787a5774'; -- después
update public.forms set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54', position = 5 where id = '8524ff5e-96f8-5471-96de-0b19c475d606'; -- finde
update public.forms set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54', position = 6 where id = '1c7a79a0-5954-5457-97a4-b2d92325405f'; -- sábados
update public.forms set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54', position = 7 where id = '23f5f8f3-3593-593d-acc5-3d85a8c84a47'; -- domingos
update public.forms set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54', position = 8 where id = '85bf89ab-4d0e-5c7d-8598-6033f6735660'; -- vez
update public.forms set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54', position = 9 where id = '7d56001e-9a72-578f-9640-9ee9d17b4399'; -- veces
update public.forms set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54', position = 10 where id = '24c78870-e8d1-5181-beb0-828446f88ead'; -- todos
update public.forms set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54', position = 11 where id = 'bd34335e-9f91-5757-8764-2d48a54876b9'; -- todas
update public.forms set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54', position = 12 where id = 'ae4f1b78-13e4-5218-a59b-499e52a073e0'; -- todo
update public.forms set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54', position = 13 where id = '95455d34-e0b1-5c3d-afbd-7e2ac0c1b914'; -- toda
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'b83b86a7-27ac-552b-9401-a482435e4437';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '5fb6afae-ea38-5570-8585-27e1d808ff02';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'c7733f3c-28b5-5fe7-a2be-ea6c24dc4583';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'a0f77dd4-ff44-5eff-a7c4-87b769ea808d';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'a140cb7c-9082-5c8c-9653-e4e2ca0ab5a9';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '622cde4c-ebf1-5926-a02b-c905594a943b';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '9598633a-4ed2-561b-8340-95bf1f9780fa';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '6b15d942-a753-56a4-8839-1dcaa261077f';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '0375700b-c8e8-5c21-851a-88745ca21617';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'ec093a0a-da40-56d3-b762-14c73cc96743';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '412ed236-6f4b-51b7-9573-aadd255e3016';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '57806db6-1b17-5421-b630-b76b5b803aa8';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'ea27adf3-2229-5161-a988-347ea92b3604';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'a5d34a68-504f-59a6-8de9-9cea6ffc4998';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '5709d4f7-6cd9-5cf7-9593-3086caad217d';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'dd2745e8-5062-5d86-a84d-d35ec902eeab';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '94d1cd7b-546e-55b0-aea4-8e4ad3f9f13a';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '45ced48a-1a6c-5221-a443-63c83b5922a1';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '06c76a3c-d685-59b9-8f5d-92a415e2b429';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'f46101ef-8bff-58b3-b890-a17ff1f924d7';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'b89db0a7-e776-5f0a-9687-db4bc59dfad8';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '1b22e1db-34a7-508a-88eb-2df0f5d71786';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'a8d7a04f-a73e-5afc-ab7c-e56616dbc9ed';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '1c6d0ed9-aa77-5e80-b094-7bf8363200ef';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '3f04c32c-690b-56b1-abc5-a4e979c64239';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '6c62e85d-ae29-51a9-8dec-b8d13557df6c';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '9c98cc4c-c23d-5a7c-90f4-1d055ffa63ae';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '37b02d32-782d-5538-be18-ac00b0a32fc7';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '64162186-b57b-56fc-b7d0-f31afa587b79';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'bba26013-68ae-54ea-9405-f55d3cad8304';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'ca883277-961c-5cb3-85a3-724a036c0032';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '8b2fff17-4163-5cd8-83d8-4759d8a55ae1';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '572698f6-f172-59d9-9c97-ae63482dfb45';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'ddd114b6-630a-5fcd-98d6-0244606b3721';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'fea3d9a6-10cc-5461-84a1-27a62fae6aea';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'e4953c18-d372-5d9c-b72f-3e2b4d681ca7';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '20627739-2ff0-5123-ae99-eacfd9b86f65';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'bd8008c5-93b9-55b0-a215-d6d06a26ee1e';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'dc01465e-8ebf-56bf-8e61-3b1b0ee14b37';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'fae64066-d50a-54d1-8ffb-029968eb1f1b';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'bd47ebc7-5e17-5013-bbaa-c247ec396dcf';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'c4fcbeba-a9ce-5249-a71b-ba78adb4236e';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '7ba844b9-1e1c-57c8-9dfa-1bc701ba82c4';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '0afde428-ea20-5577-b530-0f5630c54219';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'b19b403d-fd41-5203-8c8e-da8ba33ddd93';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'c929bda1-15f9-51c6-b657-dc165e7d1db7';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '96542e50-64ab-5cd7-9355-f8be504a22cc';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '64091258-f2f9-5d72-b6c3-02b18163fe4e';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '893cdd88-c70a-5883-8668-b55bc3b31ade';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '367fcfdc-fad4-5d04-a950-07309daa8129';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'bbf59713-75e0-55e4-b90f-3f89e32157d9';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '0d1492ae-f95f-52b9-b1f1-d05e0d74d28b';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '1612cb1c-919d-579b-a772-322445e1c15a';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '280cde2e-ada2-5220-87cf-ab7505b42cf5';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '3223761b-9576-59ca-9e9a-caa8bf118de9';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '9074d621-5bba-5975-9c9a-a7224431f9bd';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'a613650b-1d36-569a-b2b4-119c1b2b1512';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'fd7f9e6e-d591-52ba-9a2d-7abae363a9aa';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'fbeb85e7-7078-5875-bd48-5f320ba4e4b1';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'd4c3d7c5-b20b-545d-880f-fea23686d810';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = '5dd6f19d-442a-505b-827d-19b318ea325f';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'b7201aba-87fb-533d-a8ab-43fbf5647cf1';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'e0cadddf-a00d-5973-ba59-7a0bd6f7f46d';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'eef6ba93-feb8-5a3f-846d-92bd11f91a87';
update public.sentences set unit_id = '5bef8de9-49b6-594e-886d-f69932c48b54' where id = 'bda73132-259e-5bee-8beb-4112c7759811';
insert into public.tips (id, unit_id, title_en, body_md, status) values ('4e70b774-8231-5c5c-8709-c90d4bbbb4ee', '5bef8de9-49b6-594e-886d-f69932c48b54', 'Los sábados, todos los días', '**Los sábados** means *on Saturdays* — every Saturday: *Los sábados me levanto tarde.* *Every day* is **todos los días**, and *once a week* is **una vez por semana**. **El finde** is the short way to say the weekend.', 'published') on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, unit_id = excluded.unit_id, status = excluded.status;

-- me-despierto-temprano → me-despierto-temprano · duermo-la-siesta
update public.units set title_en = 'Wake up, get ready and go', summary_en = 'Me despierto temprano, me cambio y me voy' where id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5';
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 4 where id = '7e2bbfb0-0516-512c-b81d-4d5862237650'; -- se levantan
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 5 where id = 'f1520dc4-a019-5e58-b0e1-074fb234ee37'; -- nos acostamos
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 6 where id = 'c244e92a-52c6-5436-9fbd-504680203e18'; -- se acuestan
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 7 where id = '4cb44bbe-d73e-513c-bb5c-2bae0e3b5576'; -- despertador
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 8 where id = 'adfc0104-62d2-5dad-af1c-ce39445e3e42'; -- me cambio
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 9 where id = '56a9937a-171a-5c68-aaa8-563ac6ac613b'; -- me voy
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 10 where id = '5aed8c29-9dda-51c3-bdd7-7c60c38f4102'; -- te vas
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 11 where id = 'f9644a7c-9e65-5b18-9527-df57263414b5'; -- se va
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 12 where id = 'a8285a9b-223b-54b3-afd9-ebb97c5342f3'; -- me apuro
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 13 where id = '11fb0616-c36b-52b2-b142-b8b0c8bee4ed'; -- te apurás
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 14 where id = '233862a9-6dd0-56b2-aa24-96f241966c9a'; -- apurate
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 15 where id = '53a1d67a-a18b-5cc9-8bdf-af17b0fb1cb5'; -- despierto
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 16 where id = 'a8921157-7f8e-5763-80ae-d678dc8080c4'; -- despertás
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 17 where id = '5372a947-df63-5581-b530-94be530f292c'; -- despierta
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 18 where id = '849d33ad-eb4a-5b0d-bfdb-3b49daa5693f'; -- levantan
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 19 where id = 'ce7285ee-b53b-5969-b388-feb50aeb8d13'; -- acostamos
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 20 where id = '0965d816-90a8-5aa9-86b4-9da97d388526'; -- acuestan
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 21 where id = '41939e0f-7e25-5203-80d9-1456d864ab69'; -- apuro
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 22 where id = 'c2ec15ed-9438-5846-ad48-fdbbd51358f7'; -- apurás
update public.forms set unit_id = '86e40753-5eaa-5ab6-b540-6a6f01c756b5', position = 23 where id = '2dfc6b78-4e0b-58cf-995b-b1d6e8e635ad'; -- cambio
update public.forms set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656', position = 1 where id = '10397a81-0a56-567e-9ff0-d67a97c34e0f'; -- duermo
update public.forms set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656', position = 2 where id = '94996d66-4344-5d0c-843f-a7db5efbd4cf'; -- dormís
update public.forms set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656', position = 3 where id = 'd1e638fb-ddd5-5b09-a8c5-474488ed5615'; -- dormir
update public.forms set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656', position = 4 where id = '78d8eb6e-3774-5f1e-a238-1309648d0e26'; -- madrugar
update public.forms set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656', position = 5 where id = '578602bd-2eb7-5511-8ce5-9f1b378ef1bf'; -- madrugo
update public.forms set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656', position = 6 where id = 'b00d0b91-681f-5f4e-8aa1-6c659830f1ae'; -- siesta
update public.forms set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656', position = 7 where id = '94541d15-5951-5653-b577-f3cde5aa6782'; -- a veces
update public.forms set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656', position = 8 where id = 'b3341ac1-d13d-551c-a4d5-6e7a3f8e9251'; -- generalmente
update public.forms set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656', position = 9 where id = '2b9fef39-95b4-50e4-b110-cb490e0b8fb8'; -- merendar
update public.forms set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656', position = 10 where id = 'a7ff6355-b460-5200-8f44-f5818fd28101'; -- meriendo
update public.forms set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656', position = 11 where id = '6dbb5c51-14cb-524e-8b2d-0ba331755bb3'; -- merienda
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '6a5a1563-38cf-5478-a1e6-6f5d1fc1bd15';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '45cc4b71-cd89-59c0-bf0d-eac1208ea0af';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '30422984-e7d2-5e86-8728-7ff106f04adb';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'a3fd234e-86af-575f-865f-23670d3198e7';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '28aae956-87db-513a-94a9-2ced02b9e413';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '34c87b07-1528-5844-bc63-d6d46e77ab84';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '8dd6dc9b-de8e-5fc5-9d1b-56675f9be662';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'a53af778-b7e6-5860-9c26-c1bbfdf0db30';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '6d7ca4c5-99b3-5656-8395-5f9f22e90bc9';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '0ff74e94-68a6-549b-b4c9-4ffa043ac70f';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'b5f6e7d1-daee-5d9f-b1e6-fc04b0a067c8';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '9684bdd4-ff29-5737-8c12-7028d31071a7';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'e3774f29-34f2-5b97-98b1-109ad6ed6e55';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '871357fc-66d2-506b-b02c-dd2905780b91';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '2cdf3b5f-4af4-5de4-8883-1e8b70ad313a';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '91d1e8aa-22f1-56f8-a9c0-3decfbcc9cab';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '36bfa5ad-f024-5bdc-842f-bb41283d0db6';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'cb21bbca-3574-51c1-8497-ad5bb43764da';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'ffab2997-774e-5ea1-8f88-ea9582eb3528';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '5fc36262-d9e1-5dea-860a-ebb6e631c75e';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'f7290778-1412-511b-b611-5968ec2fb6e4';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '8dec7d99-ef71-50dd-9064-2c0242c4c047';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'b75a76c9-a89e-561f-943b-d02f5830629c';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '8df3dd72-421c-5366-80c6-b5f759e07ff3';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '0cb0e3cf-6e04-5a10-9143-77f1f0b86b7c';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '32224fd3-fd40-5cb9-a011-0a394e76dff0';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '9976437a-13e5-50f5-b5e4-e5f1fefe622b';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'f46060a9-af5b-5757-881f-5b26665810c2';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'cd393d18-c06d-5ad0-9386-961788a99752';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '0f0f2853-329d-5b44-a03e-2e1a47bf1552';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'ed64ef41-4d22-5574-b490-da74a6d70c8c';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'd1dd6051-1cf2-542a-87b9-8dfb18da7bfc';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '70cbef95-f42c-5624-9cd3-9c1bd5cf393e';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '7da456e0-3400-525d-a11b-5f2a224cad6d';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '81588bee-aa11-5982-b3a8-75ea5fad6587';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '0b4fa535-8ed1-53b0-93c1-67ae118cc8d8';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '0c290d6b-cb58-5510-b01f-7c30e78a2b88';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'b7556de2-7292-53d1-acca-9def8b88ab6e';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'ec46d6fd-4bd3-5a4d-befd-7197c056ca1c';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'fe636532-915f-5f5c-b8c0-1eb5e22b2d9e';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '4e5a688b-8990-511c-9e23-e394e19f3944';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '7f9a8c76-a914-56d8-86bb-44bdd645a7ae';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '00e285b8-d9af-5a96-a1b2-817bd3c9b92f';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '3aac45bf-d572-5c23-bbf7-e269155be3cd';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'df161f9f-9ef6-5eb0-94ad-92bcc1e29b5b';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '3f80ff5c-7339-5271-bc34-81a89f1e2219';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '65348246-55e0-5ffe-9ed4-5e01b9d20bac';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'a1d83b9e-f45f-5427-8ad0-cfb82d9a45b8';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = '81e2db22-e3d5-5fb2-8dcd-a025cdb7033e';
update public.sentences set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'c7140d46-2e8d-5871-bdcb-91a2e6c5c142';
update public.tips set unit_id = '3ab24c7c-be52-57ac-8cc6-880c6f6c2656' where id = 'c46ddd6d-9641-5450-a73f-0dad03d20e44'; -- La siesta

-- que-te-gusta-hacer → que-te-gusta-hacer · series-y-musica
update public.forms set unit_id = '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', position = 3 where id = 'd89acf41-17b5-5e54-a610-b2b74df2129f'; -- fútbol
update public.forms set unit_id = '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', position = 4 where id = '05354d07-aaaa-582a-b3f0-bc1ec356d7af'; -- cancha
update public.forms set unit_id = '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', position = 5 where id = '86dcd3f0-8717-5752-b219-c7c1aeb87f3b'; -- amigos
update public.forms set unit_id = '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', position = 6 where id = '8764d7e5-b75f-5314-a6ee-a6793a6b0b0c'; -- amigas
update public.forms set unit_id = '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', position = 7 where id = '3a88754b-296a-56e1-ad0b-5ae8ab3a3736'; -- nos juntamos
update public.forms set unit_id = '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', position = 8 where id = '8867761c-2969-52db-bb60-35561af06b39'; -- aviso
update public.forms set unit_id = '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', position = 9 where id = '8e8826c8-2c7a-5875-99c7-2fcdd0e35c5c'; -- avisame
update public.forms set unit_id = '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', position = 10 where id = 'b337ff6f-1f0a-5728-b891-44851a8b0085'; -- jugar
update public.forms set unit_id = '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', position = 11 where id = '01d895e6-d37b-5095-afa6-2c1a2d210768'; -- juego
update public.forms set unit_id = '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', position = 12 where id = 'a043beaa-cff1-53eb-abd9-887cc31edcda'; -- jugás
update public.forms set unit_id = '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', position = 13 where id = '13928e97-3b6e-5bbb-a56d-8d9ef9c0b28c'; -- bailar
update public.forms set unit_id = '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', position = 14 where id = '3a42de21-f6b4-5ed7-8f76-07eaf2ed0c44'; -- bailo
update public.forms set unit_id = '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', position = 15 where id = '8551cddf-9d8d-5bd3-8ad1-7469b1d5bdd5'; -- juntamos
update public.forms set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14', position = 1 where id = 'e84c83f8-e947-5469-bb7e-eef2275af774'; -- cocinar
update public.forms set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14', position = 2 where id = 'd17d6c3d-ae3d-5517-b0c0-21aff3bc00cd'; -- cocino
update public.forms set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14', position = 3 where id = '9e449a90-61c6-5625-90f3-aff66e884be8'; -- mirar
update public.forms set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14', position = 4 where id = 'c99e46b3-0c6d-5edb-b7d1-b526adb0b151'; -- leer
update public.forms set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14', position = 5 where id = '6d5ea47f-ee75-5e7a-a15f-9b500dfb922a'; -- serie
update public.forms set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14', position = 6 where id = 'b2869f4c-010c-5a11-afd2-1b8ff7cda438'; -- escuchar
update public.forms set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14', position = 7 where id = '1ba61278-e551-5d45-97fb-191905f47cc8'; -- escucho
update public.forms set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14', position = 8 where id = 'ac4bb78e-536d-51ac-abd9-1c06e2ce3104'; -- escuchás
update public.forms set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14', position = 9 where id = 'b8cb6676-0f52-5fa5-afb9-b26945af4247'; -- película
update public.forms set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14', position = 10 where id = '0d7d2982-d23b-5af2-ac97-ce7d035e6b76'; -- música
update public.forms set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14', position = 11 where id = '494731fb-c4ee-57e2-95e4-1ba660212aa7'; -- peli
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '1d74445e-6e7e-5578-b43c-7c2133966b97';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '1d1b0a28-6a53-5bc2-9255-f29e9861c811';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '55658adc-37be-55ed-903d-cb9745f7ac60';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '592ff3b3-0bdd-5108-b7bf-1fed6ee7959e';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '1c122ee1-843c-5dc9-b282-daa9ddaf12f2';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '57091294-f8af-50a0-9fd0-475ddf7fc106';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '0dbb449f-48a3-58c5-bb94-d80f136946c4';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '4ab2ec62-eb30-5801-8926-d97dcc9c14a2';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '4a3dbd74-79fd-50c7-95c4-45e49fbcbfd5';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '99517f26-0aa1-5913-97c0-21135fa46d9f';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '8e8fdeb8-421d-5838-8e4b-235076015852';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '0bd6c63a-7275-5d50-acab-863305fb2db1';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = 'f63d835a-5fd2-5fa5-ac38-82284b37bf9a';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '114c3608-d03c-5b46-b87c-70c8c10c58e0';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '83de3633-b3d5-5b2d-8834-e8447bca1aae';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '58b7d4fb-4d03-5e21-b240-c02a42251d14';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '159bf772-0375-504c-a1e0-aaadd5c6b649';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = 'f3242840-616b-516d-aff4-79ea2dee0c03';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '2885a3dd-56ea-5e87-8542-db385d04fc51';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '0d1fde90-6aa2-5381-a45c-7d2f829d74fa';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = 'adc6d6df-2095-5b8f-b071-8e016effb711';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '36228d98-998b-5284-b61b-1740e3b25f10';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = 'f9530259-216f-538f-984d-56539549283b';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = 'aa540a20-835b-56fd-8ac7-4c02e5b0f767';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '33c743ae-60d7-58bd-b509-5b7eaf1e18e3';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '9f52b238-fd70-531b-97f9-074dba48448b';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '3215a01d-bc69-5866-b14c-419464ce1b3f';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '934d2d43-47df-55c5-9194-59cc11b01a39';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '508cd508-cd5c-529a-bd6b-58e7093cf6ae';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '5b38a1b5-1a4d-5f9f-a935-667a55027348';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '00a82c61-0fcd-5d36-804e-f8da8df4ac4f';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '456c940e-069f-5884-afb6-47a8678a4ebe';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = 'b54320ac-46ce-59b7-b5d2-9f2c5f8cf077';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '25ac458f-eaf8-5e9f-a05b-36e169241a7f';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '1c676250-7e71-5c02-85e7-25ddc5deeecb';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = 'eef002d7-8646-50fd-b6fb-db3e7e34988f';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '05ec68ef-3f1f-57fc-88d9-23de29b52ded';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = 'f4f9db53-5f05-5f19-aca7-0f4610ce33ea';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '46af0c8a-c8a0-52c8-9786-cc9715ec2460';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '7fe1a6ba-1a28-54ee-94f4-42113955ef2f';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '970a0b22-5eda-52f2-8d6f-ab6189ef173f';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = 'dffe1b65-dbf1-5aa8-8fea-562d3380cdb2';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '91f5bc2d-8919-564c-96f9-5cfb41231f86';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = 'eb15afac-56b4-5be0-8e1b-5228283d59f2';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = 'aac0e32f-3d99-5574-b93b-34b7632f3b40';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '03c15ef6-677b-5854-b756-b3731b6b742f';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = 'e2c3e8aa-837b-5cda-bc22-d95373e7b611';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = 'c50bf337-cfd5-55dc-bb30-c58f5f9223ec';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '85ed041b-3621-5113-a58e-e09fd87997ca';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '43b18874-55e7-59cc-9df6-57b7717d7192';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = 'b662e862-6a6f-5f0d-b56d-761b483db2f7';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '294d6e81-60ca-5247-98db-fb1ef57df31c';
update public.sentences set unit_id = 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14' where id = '904fbd04-37db-5e30-a5ca-890fd635edf2';
insert into public.tips (id, unit_id, title_en, body_md, status) values ('6111b576-3659-5f58-af3e-6a2191d7b8f4', 'c81d99ce-50d0-5b0d-be27-f9f4b78bab14', 'Una peli', '**Peli** is short for **película**, and it is what people really say: *¿Querés mirar una peli?* A show with many episodes is a **serie**: *Me encantan las series.*', 'published') on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, unit_id = excluded.unit_id, status = excluded.status;

-- me-interesa → me-interesa · me-encanta-viajar
update public.units set title_en = 'Say what interests you and what you hate', summary_en = 'Me interesa el tenis, odio el gimnasio' where id = '1638cb53-0a6f-5b5b-a432-fa433a73461e';
update public.forms set unit_id = '1638cb53-0a6f-5b5b-a432-fa433a73461e', position = 5 where id = '6c2136c0-040c-5ba7-8495-da499d861c6e'; -- deporte
update public.forms set unit_id = '1638cb53-0a6f-5b5b-a432-fa433a73461e', position = 6 where id = '2ef2afe8-c4c4-512f-9d38-73dbb74b40e4'; -- deportes
update public.forms set unit_id = '1638cb53-0a6f-5b5b-a432-fa433a73461e', position = 7 where id = '1e189ff7-785f-55fe-90d1-7da255720f89'; -- tenis
update public.forms set unit_id = '1638cb53-0a6f-5b5b-a432-fa433a73461e', position = 8 where id = '83b9c4ea-6759-57c9-873c-f0432a81bf8a'; -- gimnasio
update public.forms set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369', position = 1 where id = '05c6adde-ee14-578c-8a5f-07ac837ca79e'; -- viajar
update public.forms set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369', position = 2 where id = '97e00410-427b-51f2-a5cd-a740bb854600'; -- viajo
update public.forms set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369', position = 3 where id = '6f293023-b7c0-5d8d-845e-4bd10fcf8ef1'; -- viajás
update public.forms set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369', position = 4 where id = 'a9df1d6a-58ea-583b-a77b-47967bd7131f'; -- nadar
update public.forms set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369', position = 5 where id = 'a22b7c74-ee65-5155-9aed-1dfd75e1f517'; -- cantar
update public.forms set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369', position = 6 where id = '66fd7388-c4b8-5e6f-b747-350c4ba61097'; -- canta
update public.forms set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369', position = 7 where id = '1b0256fb-857f-5269-8e62-74617bcfaa4e'; -- pasear
update public.forms set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369', position = 8 where id = 'ba6a293a-4268-5bac-aa29-62d3305c7888'; -- playa
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = '541c3a38-3dbb-58f1-aa3c-f86e1aa150d3';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = '09550306-23f5-5167-b023-34b7050ca560';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = '0607602a-9668-5326-8bdf-19ff2984a503';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'b7e65e15-6f4a-5fb1-90d3-0d5c3c2d1852';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'b2304702-2922-5e70-b5fb-1112d13d47cc';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'dcdd8561-985b-5509-9a3c-6a724c978779';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'b9bf8aed-060d-5e77-853d-3a260a289cac';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = '6bd233ba-3188-5f45-aa92-aaea8257e267';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = '0d1e9bb9-7425-5600-a43f-c5ecff0c4612';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'be7f25db-3d52-513c-9417-4300d3aa3986';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = '38617c41-fecb-5d36-8f90-727d003f079d';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = '0df94083-593e-54fc-9e8d-8129321973e9';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = '7315cce0-1961-5f69-89be-07ef015ce1f1';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'f1c3823b-becd-5531-8686-9b99828e2b09';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'ba236fd3-cca1-551d-b622-74c9d2d7d64e';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'd969b8d0-704d-50bc-bba6-3f702560c251';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = '1e69a785-96f3-5ebd-9de3-e86cc9ac8daa';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'aaa9c1cc-0360-5709-98de-ead4ddcc9f4c';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = '161c954e-54ce-53a4-a0f1-f8f1b2b938c7';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'd09a22e6-9a09-5a3d-a9f8-de80c4ab30aa';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'c8b62a0b-727a-5418-8df7-27dcd750f037';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'ee120f92-49cb-58f2-8e15-1f01f4beeca5';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = '1cf4b5b4-ebd4-59ed-8675-9463ea3e68c7';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'b13248a6-f506-5c03-b09e-08dcc7343bdb';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = '9305a1a7-bd6a-5c8d-9127-594757cd73ad';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'e407437d-d155-5332-917e-86ca0ad35517';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = '4c2b2c68-dcc7-52e9-a823-9198c0480627';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = '5878ac21-1ad7-5cd6-a784-fc86937b04d1';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'e1b5e44d-be3d-5821-b5e9-c09364671a56';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'cd0a985c-8957-527c-8f06-e1fbf4f0f256';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'f8dd259c-76b2-574c-a817-8897c5dbd6a9';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = '1a693a6e-64ab-58c7-b5b8-6b6be4f9de2c';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'df46ad8d-30db-5bde-b9a6-4e19801d1ac3';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = '35fde69c-17e3-52e3-98e9-2eba34f734df';
update public.sentences set unit_id = '96938299-528b-5b4c-b8c5-903baa5a8369' where id = 'b683b86e-b7de-55e4-9aba-6d16bb0ea8d8';
insert into public.tips (id, unit_id, title_en, body_md, status) values ('62e81a46-87bc-5b3c-824b-72adf9a13b88', '96938299-528b-5b4c-b8c5-903baa5a8369', 'Salir a pasear', '**Pasear** is to go out with no hurry and no plan, just to walk around and look: *Los domingos salimos a pasear.* With a dog it means to walk it: *Voy a pasear al perro.*', 'published') on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, unit_id = excluded.unit_id, status = excluded.status;

-- pasame-tu-numero → pasame-tu-numero · chip-y-datos
update public.forms set unit_id = 'fa7ef0ed-4de1-5b37-9c23-1d5747ae531d', position = 2 where id = 'bb45d94f-7884-5876-9979-f766b512ea18'; -- me pasás
update public.forms set unit_id = 'fa7ef0ed-4de1-5b37-9c23-1d5747ae531d', position = 3 where id = '39b8dd84-2283-5bb7-8ce0-c745445832dc'; -- pasame
update public.forms set unit_id = 'fa7ef0ed-4de1-5b37-9c23-1d5747ae531d', position = 4 where id = '3d6f620d-1582-5305-9ae0-5adb54c2274b'; -- agendame
update public.forms set unit_id = 'fa7ef0ed-4de1-5b37-9c23-1d5747ae531d', position = 5 where id = 'd78d7bdf-43a9-5e35-b055-2a594e4d97ce'; -- agendo
update public.forms set unit_id = 'fa7ef0ed-4de1-5b37-9c23-1d5747ae531d', position = 6 where id = 'abb68c55-6a9d-5aca-86ed-9dd24b3387a3'; -- mando
update public.forms set unit_id = 'fa7ef0ed-4de1-5b37-9c23-1d5747ae531d', position = 7 where id = '6d1af423-7b0b-5380-8075-ac90f85c6e9b'; -- mandame
update public.forms set unit_id = 'fa7ef0ed-4de1-5b37-9c23-1d5747ae531d', position = 8 where id = '2a7ccce2-ca16-5891-a21b-683d94ed3c8c'; -- llamame
update public.forms set unit_id = 'fa7ef0ed-4de1-5b37-9c23-1d5747ae531d', position = 9 where id = 'e07ccbfb-c659-59e3-aeab-8d2193cb9e74'; -- seguime
update public.forms set unit_id = 'fa7ef0ed-4de1-5b37-9c23-1d5747ae531d', position = 10 where id = 'e65d6474-c5a7-59fd-9c24-231a52390e11'; -- audio
update public.forms set unit_id = 'fa7ef0ed-4de1-5b37-9c23-1d5747ae531d', position = 11 where id = '82ed10a0-7126-5875-836e-44692c573826'; -- WhatsApp
update public.forms set unit_id = 'fa7ef0ed-4de1-5b37-9c23-1d5747ae531d', position = 12 where id = '01fe91be-d363-5c3c-b996-2496f52169dd'; -- pasás
update public.forms set unit_id = 'fa7ef0ed-4de1-5b37-9c23-1d5747ae531d', position = 13 where id = '84bdd77f-6515-5b2a-b31e-24fb34db97fe'; -- Instagram
update public.forms set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50', position = 1 where id = '300412bb-afb8-55f9-9033-3380f6b20ee0'; -- chip
update public.forms set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50', position = 2 where id = '144ba7ad-2e7f-5556-8d7d-80383161ac32'; -- datos
update public.forms set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50', position = 3 where id = '25bb0f25-2a37-5054-a6fb-d2da5547cf9c'; -- arroba
update public.forms set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50', position = 4 where id = '7008d87b-5201-5577-84a3-e2f47dcbbf09'; -- punto com
update public.forms set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50', position = 5 where id = '0b9616c7-43e0-5f79-aeec-3d2680df49bd'; -- cómo se escribe
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = 'f272d6d1-9926-593b-b0e0-5048497cf271';
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = '7a985c2b-ed2a-5f0b-872c-04015cc2f1f7';
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = '8391c904-e0bd-59bf-9544-b0dbe0d250e4';
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = 'fab6f3fc-7e8b-52b0-b45d-862c5889f494';
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = '9a37ae5f-98e9-5f84-81d0-c5489f24a1cc';
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = 'df35cca2-60f9-5f03-bfdd-101c994c072c';
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = 'a289fdd5-5560-52e1-bb6c-f2b156ad13dc';
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = '422b876f-35eb-5df1-942f-7824ccaffe22';
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = 'e5ceda1c-d4eb-590e-92f7-62767b70d53c';
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = 'd9da878c-e9be-526c-8289-516f4ed91bc1';
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = '036a3d25-d17e-5c72-9f26-1ac15fa63070';
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = '15858989-6f26-5eb6-9225-a043869f4d1f';
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = '871b73be-7caf-5414-a37e-567c36c9d036';
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = 'c89c8de7-764d-53a6-b76b-4dd3859d9523';
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = '4ed1792a-41b0-5b49-934a-eba1d7720077';
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = '58f92fac-b745-5965-b92e-fdb6f0da5625';
update public.sentences set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = '483617c0-1c69-59c0-b1d7-69348aaf3e19';
update public.tips set unit_id = '632e501f-edbf-5df4-9a01-5a58adf4dc50' where id = 'a807dff0-189b-5406-b3c0-73d7d4b65c1f'; -- Chip y datos

-- clima → clima · en-verano
update public.forms set unit_id = '2c5ceb94-a924-5797-9279-29476c698177', position = 1 where id = '9fc8af53-cf07-5a7f-91ca-f65f3fad1166'; -- sol
update public.forms set unit_id = '2c5ceb94-a924-5797-9279-29476c698177', position = 2 where id = 'cb341fdd-2729-5779-bee2-688ef145d641'; -- viento
update public.forms set unit_id = '2c5ceb94-a924-5797-9279-29476c698177', position = 3 where id = '3b92bfbb-e0bc-5452-80cd-51c797c76502'; -- lluvia
update public.forms set unit_id = '2c5ceb94-a924-5797-9279-29476c698177', position = 4 where id = '25f0fe39-6433-5223-8190-e066c40cd0a8'; -- nublado
update public.forms set unit_id = '2c5ceb94-a924-5797-9279-29476c698177', position = 5 where id = 'e6cf03bf-a3db-5e62-bbf2-d40b0a0e41b7'; -- llueve
update public.forms set unit_id = '2c5ceb94-a924-5797-9279-29476c698177', position = 6 where id = 'ee894a6f-7ee5-5ffd-9690-eb615a2bfe27'; -- paraguas
update public.forms set unit_id = '2c5ceb94-a924-5797-9279-29476c698177', position = 7 where id = 'fca51ebd-492c-5b77-8d6f-260af5c582c6'; -- bárbaro
update public.forms set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074', position = 1 where id = '56c4481d-590d-5db7-a586-a8321c1b7244'; -- verano
update public.forms set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074', position = 2 where id = '544fb016-2d77-5413-98e7-0cc2c75eed28'; -- invierno
update public.forms set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074', position = 3 where id = '38793b11-58f5-50a0-9c7c-0333c73633fb'; -- otoño
update public.forms set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074', position = 4 where id = '62c902b8-ad9f-58d6-8515-2931056ece22'; -- primavera
update public.forms set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074', position = 5 where id = '26182b85-9a7a-52dd-b0ef-1c75a40e9728'; -- enero
update public.forms set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074', position = 6 where id = '1cf2afb4-25fa-50eb-904d-0b0ff10a9054'; -- julio
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = 'a7e9a3bd-92e0-5da1-87db-51f9a184ae1a';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = 'eee3e49e-4715-519a-9ced-c1d02ca2145f';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = 'aabda24b-7b31-52b5-9016-a687bb4bafce';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = 'ac09455d-ac63-5a31-8c3c-835d517abb67';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = '95d6df13-8bdb-53e2-ad56-eeda15a7c4ad';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = '8cb03e7d-d166-5edc-9a56-f53bb7e65231';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = 'ad4b7745-c418-55ca-a6e9-e13fb4003a1f';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = '66f97bc8-5e5b-5d06-b5a3-d7e78bd7d9f8';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = 'dc1b191e-d157-5ec0-8fb1-906f7476f6c2';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = 'a9f8cdc5-7a23-58c5-b7ea-29db01196915';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = 'f3a968fa-f933-59a3-b092-46503b99b626';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = 'f98d1e38-4f2c-5f58-9188-6a19c31e8dc8';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = '196f270a-4383-5ad1-b7c7-c8690de1a4af';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = '01f405ad-1bd1-5069-b6f8-41b7dd2ec4a9';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = '4c7c2409-eac8-5617-86e7-cb9693f4241a';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = 'dfa269df-7004-526d-a83b-963ba760995e';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = '8dfa2ee0-cf46-5205-bc85-c0514f0f3bda';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = '4e815e66-04ee-59c2-a5a7-a2593fd044b6';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = '99f8c53d-72ff-51a4-a327-e3b0fb3b010d';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = '690cbf33-cdc9-5e12-a977-3378326e8b0a';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = '53928044-0c95-56cc-9f38-7171d8b05f96';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = '4b9f888c-a201-574a-bba8-cbc97f44f66a';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = '796a3178-7960-53b4-91c1-26ad58da53a3';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = '3e492bf8-bfd7-5c6c-95b3-b208b62ead94';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = '373425f8-f961-5f3e-b1fa-4ebd478adcd1';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = '3e294894-09aa-5264-86d6-d24f56e6a68c';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = 'a4acbb4f-5deb-58a5-80f1-aabb89de7f94';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = 'a6f9379f-80ec-5ac4-ac7d-c41fcddefbcf';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = 'ebe970e8-68fa-556c-8952-4f0123002822';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = 'c98ae3d3-49d7-5783-a65a-05c6bd180ddb';
update public.sentences set unit_id = 'c0e53cf5-14c3-5b5c-8453-39c37c55e074' where id = 'd9a060aa-7ad8-526e-a3cc-96ea66bfea1f';
insert into public.tips (id, unit_id, title_en, body_md, status) values ('8836c476-9c61-528f-a283-ae3ef74287f4', 'c0e53cf5-14c3-5b5c-8453-39c37c55e074', 'Seasons are flipped', 'Argentina is in the south, so the seasons are the other way round. **El verano** runs from late December to March, and **julio** is the middle of **el invierno**: *En enero hace calor.* Months have no capital letter.', 'published') on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, unit_id = excluded.unit_id, status = excluded.status;

-- en-febrero → en-febrero · mucha-humedad
update public.units set title_en = 'Say the months of the year', summary_en = 'En febrero, en marzo, en abril' where id = 'bd710c94-4059-585f-a6ad-448e21cec02f';
update public.forms set unit_id = 'bd710c94-4059-585f-a6ad-448e21cec02f', position = 1 where id = 'e04d6c19-3517-5f2c-9f0f-ec5dc676b360'; -- mes
update public.forms set unit_id = 'bd710c94-4059-585f-a6ad-448e21cec02f', position = 2 where id = '14cc4fd9-560b-5efa-afdd-bf3d835ae3f4'; -- meses
update public.forms set unit_id = 'bd710c94-4059-585f-a6ad-448e21cec02f', position = 3 where id = '5f091e31-c5ae-5191-b7d8-b0cfc64acb8b'; -- febrero
update public.forms set unit_id = 'bd710c94-4059-585f-a6ad-448e21cec02f', position = 4 where id = 'd8d9862d-9b69-5dd5-9007-877f7d99dcb0'; -- marzo
update public.forms set unit_id = 'bd710c94-4059-585f-a6ad-448e21cec02f', position = 5 where id = 'fe1698e0-f5b3-5953-8521-99d396bcd909'; -- abril
update public.forms set unit_id = 'bd710c94-4059-585f-a6ad-448e21cec02f', position = 6 where id = '019d6933-5dae-51cb-97e3-4bb2efcd0c04'; -- mayo
update public.forms set unit_id = 'bd710c94-4059-585f-a6ad-448e21cec02f', position = 7 where id = '22e95070-bb94-535e-ae14-7522e8ed8245'; -- junio
update public.forms set unit_id = 'bd710c94-4059-585f-a6ad-448e21cec02f', position = 8 where id = 'f5c65d75-321f-59a8-8236-bf28a0fce961'; -- agosto
update public.forms set unit_id = 'bd710c94-4059-585f-a6ad-448e21cec02f', position = 9 where id = 'e9328c44-fd04-5835-b707-13f47a8f3075'; -- septiembre
update public.forms set unit_id = 'bd710c94-4059-585f-a6ad-448e21cec02f', position = 10 where id = '7a8c979e-973e-5a23-8964-2afd42a22e7e'; -- octubre
update public.forms set unit_id = 'bd710c94-4059-585f-a6ad-448e21cec02f', position = 11 where id = '96f544b8-425f-536f-9e34-a538e6a80c35'; -- noviembre
update public.forms set unit_id = 'bd710c94-4059-585f-a6ad-448e21cec02f', position = 12 where id = '1dfb40d4-8d3d-5e21-88dd-bb2d0e871427'; -- diciembre
update public.forms set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d', position = 1 where id = '96dafc25-1e82-547f-bd3d-37b79fd426ed'; -- mucho
update public.forms set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d', position = 2 where id = 'a44be1e4-d367-514d-8519-a36f36d85354'; -- mucha
update public.forms set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d', position = 3 where id = '668f1872-ba53-54a7-9a0f-75f4a1a62e5e'; -- humedad
update public.forms set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d', position = 4 where id = 'd6bf3222-51d6-5fbc-9249-c831ed32c055'; -- grado
update public.forms set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d', position = 5 where id = '271b0b65-9311-5b74-923a-7cd7c25a8125'; -- grados
update public.forms set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d', position = 6 where id = 'b3b6a45e-4c9c-5892-960a-fc621afdf41e'; -- tormenta
update public.forms set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d', position = 7 where id = '4cf7221a-c967-5240-9f11-eb45b789f883'; -- último
update public.forms set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d', position = 8 where id = '25026f09-5c1f-55e6-81c0-2b815be86544'; -- última
update public.forms set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d', position = 9 where id = '11c68893-1f9c-59f0-8a4e-93a7c5832f97'; -- fecha
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '408d2651-4086-5913-849e-8ee32e0af7f0';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = 'f0a631e6-2853-55db-9b98-52647e4da7de';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '4280b368-a25c-5291-9315-138aa00a7755';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '17faab1c-e765-5ccc-9346-e81436548118';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '0e9ed315-05ea-5d71-955a-53797d7fe8cf';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '21bd4165-4951-55ed-9746-2b86ac374143';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '24b67c29-2583-5d45-9521-f0d0eabc7eae';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '45abe4f3-86f5-5e8c-b6d8-9f516e5a00c1';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '900e6f83-a372-517b-b7dd-99d249ba4403';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '6109d326-1603-5f09-9d7d-18c497e1aa83';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '371240a8-3258-5919-b97c-534bcfda7369';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '7799c8c2-e657-5195-a27e-3c1dcfd81f76';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '6bb9b783-053d-58d6-8ed3-57beeac39ed5';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '640cfa36-cf1e-5192-aacd-31beaccda622';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = 'de0878ee-25cb-5203-8443-3a3033dc6732';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '4a34fdbe-97f1-5a15-b4a0-b3e5aa8e2fca';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '11ab5f9c-133e-5aa2-bb23-5b9693381b99';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '4a622e76-ee25-5308-a8ee-c99efdf2ed23';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = 'd57e0ed7-7b5b-5970-bbaf-d7d7343f3816';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = 'b1509da0-a165-5ae4-a698-2dc64c3ee675';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '66bb96e6-d080-5307-a156-b57b103ea5d2';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '1a9513df-b545-5ac2-87d8-b6c70fe43a96';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '4dedd3f4-f483-507a-a69b-5b21bd8a65fa';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '5543d914-ed73-5e63-855d-64c9c58f496d';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '7c2f3bf7-19f9-53a7-b2ca-513a4c4bcd26';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '78df34e3-7fd7-51e4-8f08-a1756c0aa257';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = 'bc7d7bbb-a959-566d-903d-26a28f417129';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = 'bb4bee3c-04f4-5a2b-b1de-6cfc96ac162c';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '43f772b9-6853-5652-bf79-a54365c6a684';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = 'cd1e445b-3e0a-5226-9e65-a248ff71f957';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = 'fcf89a64-3fa0-56ef-b32e-a9aad1e74e10';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '1dd85715-71c7-5cbf-8987-af7d10af3071';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '291306be-4b11-56ea-b277-e630c7c2958d';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '5a4959dd-cca7-56a0-af7d-beea47c60024';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '8da6f520-933e-56a4-8f4c-e619751b4467';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = 'cae30863-1291-5c0a-b95b-8e77c5b4b956';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = 'b81b70ce-3c9b-57a3-a27a-a7dcb025d00c';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '1fa139ed-3f45-57df-904c-8df54e14b80b';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = 'fadd666e-9820-52e4-bd78-eb3a118169c4';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = 'bd7304f0-9e90-582c-acd4-7468b8a0e82c';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '68171104-4a5c-5f24-bb46-8babf68ff9d7';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = '4d58bef8-69c5-5026-9eef-4217710b294b';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = 'dd8d174a-5146-516d-8180-141b901512aa';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = 'ff1bcd9f-caff-5d3b-94f5-9233b90a9dbd';
update public.sentences set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = 'acfd0882-d1db-53c0-83fc-c0d5af1ca2ec';
update public.tips set unit_id = '813f2461-1b4f-5417-a797-80ccac16827d' where id = 'e01853b2-a9b3-54dc-99d3-0a41ce6b109a'; -- Mucho calor, mucha humedad

-- A chat scene written for a unit that has since lost half its words is written again when it is next opened.
delete from public.unit_scenarios where unit_id in ('ecf3c9a9-33e3-5e2e-b2b7-aa09f082c128', 'cc27542c-c983-52aa-88c4-8fe075eb0a0f', '9f62a065-778e-5620-b8e5-de9e6f8c2907', '9a6d16d1-11b7-53bd-b0b9-676b76d00eb2', 'd8b23128-fa60-5c82-9370-1cad2fff44fc', 'b28a06e8-ef82-54f0-bbf4-5314e84a7ece', '5bf591c3-3ee8-5b3a-a7b6-4b774ad64dc0', 'd8cb78a0-5a7d-5c09-9f7f-9e905e0d2e59', 'fd0199e1-0dc9-5704-8917-1613531c1778', '9c3ea7c9-a129-5157-b092-804da692c36c', '6d6f0271-451e-511a-ae75-885699df6981', 'eda0d38b-9df5-5bba-9665-c300309be0fa', 'ef2cae6b-ed9c-5d4b-9d7e-7c65c58dbea5', 'c5c43fc3-949b-5f6c-99b4-c6da645e7d7f', '7f39f4c5-591c-51f7-9f82-ca7f7a1cfb2b', '62bf976e-3f47-5cc9-b8bb-82f1b5c654b2', '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', 'feb8548b-0ed1-59d1-b3d8-a983690a21d1', '1974689a-177e-55c9-b4b1-69fba40389f0', 'a47573dd-a997-5b77-acd6-3b206415f578', '9ed0dbbb-2500-5957-b946-27d34bce9614', 'c7cbf578-23ab-5875-9a1c-8104be80ad3e', '61a56ded-546a-5ad6-a8ac-310375bed4ac', 'bf7b8307-3d3a-57b2-9e3b-06bca38b4ef1', 'be613042-6935-5185-bf3a-fa4dc33eca15', '8b9e9239-cc97-56ec-b263-606f0591c15b', '740b6205-cb92-54dc-806f-96cc347f8ee0', 'ba4a74c0-9dbd-5b9f-9f9c-e2c7ec49c749', '3376ea65-8afe-56be-bae8-b5d06b46c9cd', '714e2bff-95e1-5d03-96ef-a779c76932b7', '70cf9841-8e17-590c-9fd0-503d47b7b3e1', '13fec277-30b8-5bdb-9718-e682351abfd9', 'b3f216c5-d105-552a-b3f1-254cee4747b1', '441e2e5b-f704-511a-9e55-ef9613425ce8', '86e40753-5eaa-5ab6-b540-6a6f01c756b5', '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', '1638cb53-0a6f-5b5b-a432-fa433a73461e', 'fa7ef0ed-4de1-5b37-9c23-1d5747ae531d', '2c5ceb94-a924-5797-9279-29476c698177', 'bd710c94-4059-585f-a6ad-448e21cec02f');
