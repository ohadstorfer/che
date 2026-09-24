-- Grammar practice and practice lessons (docs/course/grammar-practice.yaml),
-- written by scripts/course/grammar-seed.mjs. 6 lessons, 71 pattern tips.

insert into public.lessons (id, unit_id, ordinal, title_en, kind, status) values
  ('ab2280d8-9a5d-5580-a34e-4a3f672e0516', '74a94584-d79a-55af-920c-e6fa1c59b5ad', 2000, 'Grammar practice', 'practice', 'published'),
  ('85866094-f55b-5966-a553-40d782db958a', 'd1ef9d43-816d-571d-a8ba-4ba76a09ba2d', 2001, 'Grammar practice', 'practice', 'published'),
  ('bbdd577a-10b1-508a-ac14-76c14e75a1a7', 'd1ef9d43-816d-571d-a8ba-4ba76a09ba2d', 2002, 'Grammar practice', 'practice', 'published'),
  ('f981595c-33a3-5b1a-ae6b-28907074f605', 'f925644a-c585-5773-8af3-f9a36c4cd2b0', 2003, 'Grammar practice', 'practice', 'published'),
  ('dbc9b56c-8738-5e33-8945-29dc658087dc', '24efab50-024b-519e-9029-d2d7f4a05a09', 2004, 'Grammar practice', 'practice', 'published'),
  ('2cc84bde-969a-53d8-ba5b-794b695bee2f', '1c04f11a-4feb-5b1d-956b-3661bab59c15', 2005, 'Grammar practice', 'practice', 'published')
on conflict (id) do nothing;

-- New lessons sit before each unit's check. Shifted out of the way first,
-- because (unit_id, ordinal) is unique at every step.
update public.lessons set ordinal = ordinal + 5000 where unit_id in ('aea4c640-a7bd-5aba-8ce2-5c2f493637a3', 'd35a777a-0a33-5ede-8fb9-39d0107d41f6', '481ae401-6c6e-53d7-9683-853d0cbed672', '70dda450-3825-5ea7-88fd-296775bc426c', '9a649d54-c14a-56da-8701-c4783ad9a159', 'b28a06e8-ef82-54f0-bbf4-5314e84a7ece', '3cc8b1a1-6314-5a4f-be82-b713ea584203', '71481540-7f7c-5939-9d96-ee76d80128b9', 'e4dc651e-4fd9-5ba8-8e83-1c8a4131e09e', 'eda0d38b-9df5-5bba-9665-c300309be0fa', 'c5c43fc3-949b-5f6c-99b4-c6da645e7d7f', 'b95d926c-3168-53bd-88bd-c02c868d1119', '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', '1974689a-177e-55c9-b4b1-69fba40389f0', '740b6205-cb92-54dc-806f-96cc347f8ee0', '3376ea65-8afe-56be-bae8-b5d06b46c9cd', '441e2e5b-f704-511a-9e55-ef9613425ce8', '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', '2fa4826d-6276-5a6f-b7a5-e3c2e6dc4f2d', 'b60b2d1f-25dc-5ada-9b93-a0afe7bd9a37', 'e89d1870-c4d1-5692-923d-5e357ae8218e', 'f42f6608-6d16-5d0a-bd3f-896cd5fb4d07', 'fd0afb5a-c86b-5339-b28f-31f5431f400a', '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', '8f8a4c97-4077-5352-b040-a22de57f1b7e', '38114afb-c035-5ae5-956f-723c4f408a0d', '520a3c73-f830-5ea8-bb7f-36b6b5a53614', 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', '776b15fe-c6a5-5aae-8876-404d392e0546', '3dd370c2-01fe-54ba-95fc-3c5ef1637eb0', '74698b58-c87a-5870-a6dd-a6652b6da393', '186b6b78-c334-5c53-9675-d7e5ca16b5b4', '5f6c9abe-859a-5d19-853a-7dc6bcce9c99', '8c4c452e-c6f6-5f26-a9a5-ded2342f7c9f', '52c51646-b698-5749-ae7b-d554ab2e0240', '063d369c-847e-57b8-8451-b9c4049a1d9e', '36b953db-b59d-5c37-8572-47afd0081c48', '465d788e-db67-5a57-8f4e-96306374e29c', 'ce343377-a0c2-5201-9ff4-824789e73e89', 'aa46af4e-1c1b-50ae-b8c1-03167cabaecc', 'ae52684a-c28b-5318-92e0-5d1cc5ac5cf1', '6dc81d68-66ed-5adc-a6d9-ebdfac00662e', 'c640ea33-8098-56b9-85a3-15f539f2ece2', 'd7e9f660-01d8-5d0f-9136-9a85a20fc33b', '59b48665-2d47-587e-b406-84d2800c4161', '21206ba6-6522-5849-be52-419e7d6d1007', 'dd303fe0-52c5-5e61-97ae-1903616e625c', 'c7b4cc13-41a1-57bf-b8f9-9c5a2ef4fb1b', 'e31d82b3-e9e2-52bc-bd88-e52c7b53a764', 'b3d7d4fe-8ba0-58f9-8d0e-38b9aaf3707f', 'aaafb4dd-18af-5b10-be4f-33a46f2cba0e', 'c9686bb1-fe4a-58d4-b91f-601bade129fa', 'fc31544c-c615-5722-9494-5a728b6cf9be', '731a6e56-3586-5647-a6ab-12df3dec98b6', '0323848f-596e-579a-a7dd-1904e93c1f32', '109ff419-4504-54fc-a4e6-0f7e45175049', '30394d47-559d-52eb-9c24-d6a8bbaeba36', 'c5abd659-9dd6-54e9-9e4f-6e906e375953', '8a547039-7fc7-5382-9c3a-9b48a4102289', 'd8c13ac1-8ec0-5db3-adbe-39834eed0ff9', 'f71fcde3-a7e0-5429-864a-cef0a28a9a3f', 'c64cedd2-5987-5859-b94d-77231e8c5eaa', '17f201ba-038f-5447-a92b-ea8274de3421', 'f46f9df0-afdf-5c8c-95be-a4b002904a9d', '7768d3dd-52a9-55e1-be73-c2b2153fdb64', 'e5014ed4-167a-55b0-8e66-43bd2ee4e434', '74a94584-d79a-55af-920c-e6fa1c59b5ad', 'd1ef9d43-816d-571d-a8ba-4ba76a09ba2d', 'f925644a-c585-5773-8af3-f9a36c4cd2b0', '24efab50-024b-519e-9029-d2d7f4a05a09', '1c04f11a-4feb-5b1d-956b-3661bab59c15') and status <> 'retired';
update public.lessons l set ordinal = v.ordinal from (values
  ('c03b87c0-f6ab-50f8-849f-94487beab103'::uuid, 1),
  ('4d940c0a-29f1-55c3-b924-a1a6336d4d6e'::uuid, 2),
  ('ed62ce1d-6382-52bf-8812-90022494e11d'::uuid, 3),
  ('e2db61fd-8888-54e0-ab90-589875859804'::uuid, 4),
  ('070ada9f-6377-5bfe-a5fe-b223e3e41ba7'::uuid, 5),
  ('4ae51956-00c8-5757-ac80-5650f19501cd'::uuid, 1),
  ('4aa43051-0245-53e8-99da-28eda21eebe0'::uuid, 2),
  ('803e624d-1d8a-55ed-91b9-d5d21d318b9f'::uuid, 3),
  ('74de071d-2ea8-52ac-8a61-49481265ab1f'::uuid, 4),
  ('e83291f0-55e8-5e0f-87b6-abb99c917726'::uuid, 5),
  ('6028c04e-3389-5d91-a1f2-1c3741bbe469'::uuid, 1),
  ('d2732154-ad4b-5383-b969-faa7e7283f63'::uuid, 2),
  ('1929aac3-3c55-569c-b60f-65a17d6e9d4a'::uuid, 3),
  ('182428d1-673e-5678-a4e5-4fa51faa8778'::uuid, 4),
  ('e2e741ec-339b-56f5-8bcb-11d956d72896'::uuid, 5),
  ('15f0f59e-6eb7-5c45-a488-e1f262ed6ed2'::uuid, 1),
  ('8c7f1ae2-1d42-5458-9e3d-c1c4ef798723'::uuid, 2),
  ('a9b91672-7367-541c-931e-9ba21713b6f1'::uuid, 3),
  ('0ef60964-bb17-510a-b311-2278794ffe9f'::uuid, 4),
  ('b1b8ddc8-0992-5a73-87a3-a363ce3c4cb1'::uuid, 5),
  ('317ce182-9eb1-5d07-b9b9-c16444755185'::uuid, 6),
  ('60b6bf7c-cc61-5fd2-bfc5-e22727512615'::uuid, 7),
  ('b9baf03f-a094-5ec1-8db2-3b31f85fdb7a'::uuid, 1),
  ('ba387837-43d3-5255-887d-fcbc8d4af62c'::uuid, 2),
  ('108f0098-3e6a-5048-8be8-412803cf59da'::uuid, 3),
  ('6dbf11d4-2b0c-51ba-b555-336493e04597'::uuid, 4),
  ('3b926d44-28a6-5ef9-b1e0-bccb0d0a9a4c'::uuid, 5),
  ('6b8aa624-7ee1-5649-9b64-8be694ddfb39'::uuid, 6),
  ('d67e13ad-e092-51f5-b630-9087c893c28b'::uuid, 7),
  ('e093cf35-6944-5744-9d3c-807b1f07fc06'::uuid, 8),
  ('7215a36b-68f8-57c0-a894-0c4e8195c3d1'::uuid, 1),
  ('fdfa3831-029a-515d-abd1-6e3eb4173ce3'::uuid, 2),
  ('4bbf709b-9e41-5278-aa7d-dc53af792c4c'::uuid, 3),
  ('c637fbc6-8ab4-50fd-85dc-4e8f11eb796f'::uuid, 4),
  ('6b3d7b93-faf3-5d5a-9981-bd1b0f016012'::uuid, 5),
  ('b1f71ff2-c65e-51aa-b785-b97f262221b0'::uuid, 6),
  ('0f852559-0e7f-534a-956f-1b78340a152c'::uuid, 7),
  ('01c93554-f120-5230-b86b-2102ff21ece9'::uuid, 8),
  ('c42eb6ec-4721-5df6-b1a5-de6f9abd762d'::uuid, 9),
  ('b5a03ecf-78bf-5538-a9eb-86be924d9492'::uuid, 10),
  ('8c018edf-4b99-55ba-b1c2-1dca3a8d28d1'::uuid, 11),
  ('44832339-25d8-5790-949b-4f8da07475d1'::uuid, 12),
  ('56c65711-fd2b-5367-b616-b2502e5d299f'::uuid, 1),
  ('ee04cd64-1ae3-5e1f-be3c-b022e9147e20'::uuid, 2),
  ('71948571-23f6-5e0c-9958-958283692393'::uuid, 3),
  ('afad9f3a-9810-58dd-8993-95d9c4595b9b'::uuid, 4),
  ('1999c908-9f46-570b-a1dd-a140504b11e9'::uuid, 5),
  ('aa45383c-f04e-511e-90a7-9a8acbf24fd3'::uuid, 6),
  ('cb4c1307-0e59-589e-befc-e495274c7f50'::uuid, 1),
  ('c5ef7d1e-7984-51ed-abbb-07eebeef3e9f'::uuid, 2),
  ('25d422a3-20db-5465-adde-b34866003d4e'::uuid, 3),
  ('8321e109-52f9-5812-8d03-cd95ace38622'::uuid, 4),
  ('ee69fb28-f74f-5413-bda8-7ddc075c944a'::uuid, 5),
  ('b6e5d03d-d173-56b7-b358-c1b49aa1004e'::uuid, 6),
  ('144d9428-4029-5ebf-95af-47eb8ddc298d'::uuid, 1),
  ('6eccc1d5-25c0-5c5d-b2fe-bfa7916ef6f9'::uuid, 2),
  ('5057564e-d895-55f1-830b-d80bee63259f'::uuid, 3),
  ('6c8130fd-e8fe-5ab8-ba2d-3ba00ca133c4'::uuid, 4),
  ('5691cb4e-ba62-5514-bdf0-82a4553cf496'::uuid, 5),
  ('18fa4804-c923-5ae9-bd4e-b9e66060e0d1'::uuid, 6),
  ('ae253815-3b67-550b-8e9b-dcb7e16b3a9d'::uuid, 1),
  ('3d181c21-6e77-5201-812a-49eec966dd34'::uuid, 2),
  ('7a54d331-f013-5a16-9913-2b452ac72e36'::uuid, 3),
  ('08d47074-98e8-5a44-9014-2f0aa36d6b18'::uuid, 4),
  ('63bf7c6a-6e08-5c01-9706-aaff269a7313'::uuid, 5),
  ('7ecc25d5-d965-5dd0-b967-c3e69135eeb1'::uuid, 6),
  ('a9cd7dc8-1c59-57fc-b4f5-e046ea1bd3f9'::uuid, 7),
  ('4fa494c3-66d8-5859-a25e-d961e5ec9b0b'::uuid, 8),
  ('ce7cd9bb-a60f-5e5a-abd1-7dde36b30844'::uuid, 9),
  ('ed8bd52e-b680-5ef9-acf7-86c11ff8412f'::uuid, 10),
  ('7e814319-93dc-51a5-8452-8fe3a91b62ca'::uuid, 11),
  ('b8ef553e-d1a7-5f28-86db-6896a54c126c'::uuid, 12),
  ('59a0852c-5906-55fd-8db3-f5cb877b72f1'::uuid, 13),
  ('2bf95be5-5f8f-5ae0-9a0b-52d0b69f0df2'::uuid, 1),
  ('218a2dd4-c33b-53d2-8b5c-746449105ad0'::uuid, 2),
  ('bca1f69d-0fea-50ba-82de-4393f580eb2e'::uuid, 3),
  ('7f736c5b-ff82-53c9-947b-57f9a5a4e4c1'::uuid, 4),
  ('8cb19fe4-c9b3-51a0-ab83-daa32f65578d'::uuid, 5),
  ('8d624bad-9e34-5390-97af-6a29171b2554'::uuid, 6),
  ('3733d49c-4293-5126-b091-4dc31ae934af'::uuid, 7),
  ('876cf5f4-89ce-5839-98b1-265b24264169'::uuid, 8),
  ('174d2b12-c281-5388-b8e5-6cd3b13c4c3f'::uuid, 9),
  ('de4b51d2-b543-5f7a-a513-b94779063e49'::uuid, 10),
  ('195af764-f442-531d-8f02-0eaaeac8a7d0'::uuid, 11),
  ('4246665d-44a9-52c1-ae38-045a429c97c8'::uuid, 12),
  ('7ac090ed-67f9-5f51-b119-eec7b1159117'::uuid, 13),
  ('bf4c2ec1-7d34-5d98-9cff-ff2dd483aa8b'::uuid, 14),
  ('4fe48ced-2d81-5ae9-a067-85f96bc6ea51'::uuid, 15),
  ('69c16851-49fd-5681-9016-0085dc07762f'::uuid, 16),
  ('d4138fbf-e466-5329-b5a8-9bd30821b753'::uuid, 17),
  ('b7597d74-ee62-528c-ada5-46551e782f65'::uuid, 1),
  ('41d7dae3-b943-5991-9c72-bb7f4a0f72a9'::uuid, 2),
  ('516e40cf-4ed3-5c66-8200-dfeef930beb4'::uuid, 3),
  ('578be95e-5c6f-59a2-886b-51247d8b4cde'::uuid, 4),
  ('a12eb442-be6c-5adc-8efe-b8acd249f3b0'::uuid, 5),
  ('e4f574f5-09ea-5d9d-a002-fa97f3f7d48d'::uuid, 6),
  ('2abf4016-73bc-59c7-8c14-4463a07ce10d'::uuid, 7),
  ('4101cbb6-d7f5-5f41-baf1-77a65f90e8db'::uuid, 1),
  ('707555fe-f9bf-5f4b-9e8c-5b6f98b1fe07'::uuid, 2),
  ('1321b69a-04b2-5385-a1d5-aa84757de55a'::uuid, 3),
  ('7a5bb576-200d-5af9-99bd-4280a59b7fb0'::uuid, 4),
  ('4d55e7c4-1039-5bbd-b1f6-411cec2333e3'::uuid, 5),
  ('88d60e47-9ba9-5dcf-84d8-744665a899c3'::uuid, 6),
  ('c770a175-bf15-5e18-b461-5cc4f2e7b3b6'::uuid, 7),
  ('79ff741a-bc70-512a-84af-598cf24f4b78'::uuid, 8),
  ('a4a6597e-2f02-516a-90ac-fdeb93fbb959'::uuid, 9),
  ('fa9f9d54-2a0f-572a-8160-b412f91aa977'::uuid, 10),
  ('83c056ff-f905-5ea7-a812-158210643291'::uuid, 11),
  ('d135c5ff-7b9d-57e1-8c6c-f306e6593806'::uuid, 12),
  ('7f981d73-73be-5374-b96a-7030460bbb34'::uuid, 1),
  ('75bc0e5e-f292-5c3c-a74f-368a8e0982c9'::uuid, 2),
  ('8dc543a6-aa1a-5c90-86b3-34a8b64d5e3f'::uuid, 3),
  ('0d172675-91c0-52c0-8586-48e980adbed1'::uuid, 4),
  ('28b392c0-8f81-5362-8223-82098593194b'::uuid, 5),
  ('0c60b847-737e-5ece-bd4e-b5fed6a6b7da'::uuid, 6),
  ('0b922fda-a1d3-5d94-bf9a-71a9d754ca6c'::uuid, 7),
  ('55aeb256-af0e-5333-98fb-d5db5f356bc3'::uuid, 8),
  ('20ef2620-c3c2-55c1-bd53-f4804ff75258'::uuid, 9),
  ('e1a9f452-1957-5701-9985-5ce20d7d3530'::uuid, 10),
  ('fc52b3f1-8142-5d45-9e8c-758e5a24c552'::uuid, 11),
  ('f23d4047-01ae-5ec0-84e8-ecfc21d3f97d'::uuid, 12),
  ('e1009dd1-56f2-5cb2-b4ce-d444ec46a084'::uuid, 13),
  ('7350d58c-e926-5969-9234-5283a1410406'::uuid, 1),
  ('0df9c888-3623-5ae9-a3c5-77f678cc0b9e'::uuid, 2),
  ('b3eb03d5-9148-51eb-ac32-274f8ecb23fc'::uuid, 3),
  ('3fc97831-edd1-5b5c-992a-371d4529117d'::uuid, 4),
  ('13dc071a-ee8b-575d-b7a7-dd5f44952796'::uuid, 5),
  ('a9d69f19-f2fa-5ee3-bb0d-78f51a34faa6'::uuid, 6),
  ('b2e8a93c-0a9d-5bd5-b9c6-83b74153a32a'::uuid, 7),
  ('3b26196b-2fc1-5e31-8286-4f05d1fe4a47'::uuid, 8),
  ('3fdf35ed-3419-5cdc-b116-9dbce907afea'::uuid, 9),
  ('15423308-e36e-5f91-ad92-18f23e5aac7c'::uuid, 10),
  ('26407821-82d9-5b74-9404-2afb584d99da'::uuid, 11),
  ('0ff701e7-0c83-5cba-9d39-79e8674f0010'::uuid, 12),
  ('556f7fe7-f63f-5631-a1c5-5ec78ddf6ee0'::uuid, 1),
  ('60481c8a-d759-5082-847a-828eb761473a'::uuid, 2),
  ('ed3445b3-3af3-54d0-ac71-a292a4c713b2'::uuid, 3),
  ('b01cabd4-0548-5883-bdcd-16483d679bc7'::uuid, 4),
  ('cda348a9-2203-56eb-8d94-327a6479089a'::uuid, 5),
  ('6669c4f9-3587-5bbd-8dd9-c49b06b577a2'::uuid, 6),
  ('90c735e5-44f5-592b-9cc3-2064c23b25da'::uuid, 7),
  ('bb2b8ff1-2298-50ab-8f13-4a3427949b2f'::uuid, 8),
  ('195317e8-cf55-5288-a0a4-eee4ecc36903'::uuid, 9),
  ('1a6a8984-803f-56d0-9e1c-9e832d322504'::uuid, 1),
  ('83cfff58-49e4-5b88-a7c7-874dd10a50e6'::uuid, 2),
  ('4211e794-06c4-580a-b4cc-48fa494a6af4'::uuid, 3),
  ('7171de3b-bdb5-558a-8b2a-8b9e66292978'::uuid, 4),
  ('7102013d-d558-59c5-bc58-52fc1cf9ed9b'::uuid, 5),
  ('5973b32f-aeae-5b95-bf9c-c28cd854ac36'::uuid, 6),
  ('4b8c3463-ac71-5234-8e59-8f9b7ed801e4'::uuid, 7),
  ('a7dd8480-5763-54b2-adba-01e178023d57'::uuid, 8),
  ('611caf17-1b9b-57bb-97ce-efd8db07cfe5'::uuid, 9),
  ('b3426dff-8daf-52ee-bbb9-4952a015c7b5'::uuid, 10),
  ('75048472-0e09-55b7-b0ed-ec68b7f87e81'::uuid, 11),
  ('275a0dc1-bd4e-553d-add5-5e7d41cbd84a'::uuid, 1),
  ('0196f255-b06f-5181-8da4-90b1bd8ea783'::uuid, 2),
  ('58c1e475-882a-5a44-a6d1-7f72d34770a1'::uuid, 3),
  ('98a692e5-ee4e-5443-ad27-af9902d91a44'::uuid, 4),
  ('140c6ed7-83bb-57e0-875e-d0eb2e074c35'::uuid, 5),
  ('3551bb9d-d055-57e2-bc60-819a753e0324'::uuid, 6),
  ('8311260e-0332-5b07-9f73-0633db5e72c4'::uuid, 7),
  ('170cafce-4d44-5436-9f82-a7cdd1fcad8c'::uuid, 8),
  ('6fafcb95-8a6e-5d3b-8408-e504c32e08fc'::uuid, 9),
  ('23713a61-5659-548b-9d9d-c5fb4a49a875'::uuid, 10),
  ('1d5c1191-7fc0-531f-9fbd-dfd9617750fb'::uuid, 11),
  ('1608fb17-713c-566b-85b0-ae133fcdfaa2'::uuid, 1),
  ('c77c73ae-660a-5a61-9beb-f210849cf48e'::uuid, 2),
  ('2f41d1fe-5c40-5eb1-ade3-eb7f23301263'::uuid, 3),
  ('d01364a3-b31d-5420-982a-83d0d4feb2ad'::uuid, 4),
  ('8b23f9b8-82e4-50cb-8c1a-33d4cf470ab4'::uuid, 5),
  ('39075fbb-4402-516d-a3b6-f1e622995b15'::uuid, 6),
  ('f5070908-82fa-5d07-9713-f4b2215ced41'::uuid, 7),
  ('eb7d5f5f-bc40-5716-814b-9c2944b84d0b'::uuid, 8),
  ('db7c9665-2845-54ac-8d48-77408c945bf9'::uuid, 9),
  ('b74fcfbd-4082-5b39-bd80-c2d9898d83dc'::uuid, 10),
  ('18953cf0-33f1-52dc-ba99-4715dbd8cb27'::uuid, 11),
  ('e7681552-22bd-5470-a549-85630ab157d7'::uuid, 12),
  ('3f1e586d-6ffd-509a-a1c5-a58e1610d24f'::uuid, 13),
  ('767010cd-d3c8-55a4-8910-8cd8dc07dcec'::uuid, 1),
  ('1f257647-9e84-5727-a04d-fb88feb1c2bd'::uuid, 2),
  ('d2386d78-d5e8-51ac-be23-de967f90f7b7'::uuid, 3),
  ('2d3130b0-7b48-5413-84d0-b9312e6d1c8a'::uuid, 4),
  ('dd103db3-4ce9-5e79-ad63-f1b0bb0cbdbc'::uuid, 5),
  ('da1e8ad0-0943-5d4e-989e-6e019ffcbe40'::uuid, 6),
  ('94bb3b5c-bbec-5c07-a5c3-210a5fa4b9c5'::uuid, 7),
  ('40fd11c5-3212-5b8a-8a12-8ce865d40a34'::uuid, 8),
  ('b0819e6f-7ba2-5f64-b4a1-549f810eb159'::uuid, 9),
  ('11ccc516-966c-51cb-b3c5-b5eb9d990276'::uuid, 10),
  ('0b0c56c1-5e57-534c-b139-8f221a967f9c'::uuid, 11),
  ('1af62498-3f24-5d56-9ee8-b824e1c073bd'::uuid, 1),
  ('784eee3a-5007-5631-b998-74a9d11aeece'::uuid, 2),
  ('b9725f99-264d-55eb-b9e6-7ce8c796a9aa'::uuid, 3),
  ('5a74d77d-87b8-5c57-8986-9b8ffe2e1e91'::uuid, 4),
  ('b097d3c5-2adb-5cbb-9ffb-4fe7662d07f5'::uuid, 5),
  ('6d0c2dc7-7353-5b4b-b2bc-1b8d1a76cb80'::uuid, 6),
  ('ddfec5cb-0db2-51cf-940b-476f634db70b'::uuid, 7),
  ('7eb7c404-7eee-58ad-a3c1-d90232ff3a0c'::uuid, 8),
  ('36a285c4-082a-5a63-ae5e-86292b7c0e6f'::uuid, 9),
  ('609b1123-9021-5d21-a072-9be74bf1360b'::uuid, 10),
  ('71c68290-b9e8-5f47-8824-fc68b21cd22a'::uuid, 1),
  ('0477d699-f31d-5d7b-98b4-2c7f91583369'::uuid, 2),
  ('65c1cde0-6d12-5351-b7af-a6c90587078e'::uuid, 3),
  ('46bad6be-2670-55b3-bf28-d8aa970680f3'::uuid, 4),
  ('3e219191-a503-58e8-9bc8-82e0b965cfed'::uuid, 5),
  ('98638575-c5ee-52e5-a5de-dd0b0a83eee1'::uuid, 6),
  ('967043ed-46df-57b7-9405-e96d6e040e2a'::uuid, 7),
  ('4a4246c3-0bfa-59bf-95bf-e4cf43e17d5b'::uuid, 8),
  ('4db65264-f02b-5294-8ab4-f207caa2a032'::uuid, 9),
  ('94e08a36-a103-5dc8-bbc3-deef1351c20a'::uuid, 10),
  ('cbb4fd35-fcc4-5bbe-a174-158e94cb8513'::uuid, 11),
  ('4e3d521a-b085-5d07-a17f-5538fa1c0ce9'::uuid, 1),
  ('9c662db1-a997-519a-9a4f-91ab3041fbe4'::uuid, 2),
  ('1bfbf035-784c-5cb4-8678-da394f1ff39f'::uuid, 3),
  ('ad94ab3e-f940-5089-94e0-5126f04e0561'::uuid, 4),
  ('b75c2402-5551-5fc4-b9cf-1ef61da17946'::uuid, 5),
  ('7ee3b82c-e680-5914-8c22-7906bea358ca'::uuid, 6),
  ('11aecfc9-92cb-5a83-a80d-298b4b475009'::uuid, 7),
  ('cb63824a-23b8-5ad4-83c4-9655e72379d0'::uuid, 8),
  ('7b6f7a40-3a4a-5619-a60a-aee61aa2d37d'::uuid, 9),
  ('af151f9f-25ff-5244-b6c5-0240e00cfb98'::uuid, 10),
  ('c6c993ec-17b2-5eb6-9d8a-5d2a2e7bfe66'::uuid, 11),
  ('18ef4107-cfe6-5ec7-abe9-23d1b27ea16d'::uuid, 1),
  ('00a99802-4694-5a31-8794-1f98b809f670'::uuid, 2),
  ('c96e232b-177d-5582-bc2e-7b783a56e8ad'::uuid, 3),
  ('e74b0334-757f-50a4-858f-02175ec239b2'::uuid, 4),
  ('814ab3b0-f687-5eb0-b44d-c883a6419e56'::uuid, 5),
  ('506c97d4-4f44-5fc2-be26-c8ac7b658236'::uuid, 6),
  ('404d2b42-41dd-53d0-a175-3830ef4e7e26'::uuid, 7),
  ('08cca4d6-6a44-5411-8598-d39d32a2670a'::uuid, 8),
  ('7fdb1f14-c8d2-5308-a6c0-0fe0d7ec3ae5'::uuid, 9),
  ('37348bf6-8fb8-5c5e-8c26-7cb971bc8f1d'::uuid, 10),
  ('0ab87afa-2279-54bd-8d79-f659c4244766'::uuid, 11),
  ('cc5abbec-ec33-53f1-a1c8-158cac4740cd'::uuid, 12),
  ('64455074-bde2-5842-b9c3-965f89612dd2'::uuid, 1),
  ('f3e5200f-3d02-54b1-95e0-e069fcbc399e'::uuid, 2),
  ('c6703c9e-bcb4-538c-b3c0-52795285b919'::uuid, 3),
  ('886a522b-f601-5a2b-adfa-775f372f4259'::uuid, 4),
  ('198c7949-c22a-58b7-8fb2-f9f03941dc3a'::uuid, 5),
  ('5b35a043-f9c3-5209-bd5c-856b2938f6ee'::uuid, 6),
  ('d700bdc0-1b54-553d-b84a-22a06f8cea5d'::uuid, 7),
  ('24449c9c-66b5-5586-96ba-68f400faaab7'::uuid, 8),
  ('327c0a8c-6853-5438-8e93-9c67b8138535'::uuid, 9),
  ('53a43f66-5270-5aa8-83b0-47f0a334c486'::uuid, 10),
  ('76310330-bcc0-5b2e-9e05-774292de14af'::uuid, 1),
  ('fcfdc796-8a06-531d-b447-1d840e714999'::uuid, 2),
  ('47d0581f-0309-5ef1-9ac4-b2c7b1cfc047'::uuid, 3),
  ('cc06a168-4625-5887-8f38-ebcc441337cd'::uuid, 4),
  ('b81f16be-62ac-54e8-85ea-b0b1eeb9261c'::uuid, 5),
  ('b1f92fc2-1ff9-5a7a-8fc7-0ee579a4e7b6'::uuid, 6),
  ('a3ae1231-1bb9-5e91-9a0c-316d67d971c4'::uuid, 7),
  ('97cdf9f6-72be-557a-b3b9-ce78cb1d21bb'::uuid, 8),
  ('7190c4f9-3889-582e-a4b2-360f68b3c925'::uuid, 9),
  ('dba3503b-82cc-5a01-a269-5d32954aa9fc'::uuid, 1),
  ('fabccae2-58aa-5d38-b121-995ab7c61f1d'::uuid, 2),
  ('44b12c94-4eda-5701-994c-c18035394d9c'::uuid, 3),
  ('1e3e4052-f6d6-5404-8005-332598f963f5'::uuid, 4),
  ('72281efc-4125-5ac1-8a09-fc777e5da0cd'::uuid, 5),
  ('40932ba2-2ec4-54a9-8240-d0dfd32b1aa2'::uuid, 6),
  ('be512035-bab4-5806-9c08-5684d8f3b0c6'::uuid, 7),
  ('3b1f693c-5ef9-54d8-9556-767ab916e480'::uuid, 8),
  ('6a363c61-bc01-5b3c-9dcc-31851393202a'::uuid, 9),
  ('7bfec9fa-9042-5ce1-8d0c-eb8724104750'::uuid, 1),
  ('99d995d2-2c8f-533b-96f5-7fb94b2aba00'::uuid, 2),
  ('2b5b870a-f8a8-5942-9a2e-1a259a9994e6'::uuid, 3),
  ('5c2463dd-c201-59b3-8d86-f1db2b744856'::uuid, 4),
  ('b2cee788-5d2e-57a6-b646-5d1df1ffd0ce'::uuid, 5),
  ('f7d85a66-fb8c-5249-9628-eb7ce4725391'::uuid, 6),
  ('659c4e4a-87b1-5924-8e5c-718207124c7d'::uuid, 7),
  ('af934dc4-a7d8-5e27-96ba-9cb68987ba43'::uuid, 8),
  ('39906684-1b5e-5302-8c5f-36de12c6ddc3'::uuid, 9),
  ('218743bc-71b7-5b7a-8d27-2dbd247cae63'::uuid, 10),
  ('a0b161c0-f80b-524f-901a-ce5fba3d5ed9'::uuid, 1),
  ('514f0ba2-04f7-5c14-92a9-8a59c2ff4f28'::uuid, 2),
  ('884b3f60-ccda-54dd-8f36-84bfd6cf1540'::uuid, 3),
  ('e2e0df52-64c6-5397-a6d9-b6c6540615d7'::uuid, 4),
  ('e97f6ae4-d30a-5bac-ae61-3ba7ccbc8938'::uuid, 5),
  ('6433f27d-4e93-53ac-8a8f-f92125740c52'::uuid, 6),
  ('564dd247-65cb-53e5-8b29-81165c7eadcd'::uuid, 7),
  ('7b577543-1a67-54d6-a4d2-3fca62a8ef4f'::uuid, 8),
  ('f64662ef-3ca3-5973-bcc6-699c8bd4902b'::uuid, 9),
  ('3c93762c-07d2-558d-a826-3731a58cd9ca'::uuid, 10),
  ('24f4103d-5fbd-5100-b9b6-bcfe0e26f2ed'::uuid, 11),
  ('8f8b8433-bca0-5219-ae93-96a7b7faed8c'::uuid, 1),
  ('dc4feda6-4e3c-519c-a38d-808f39da0284'::uuid, 2),
  ('e3639580-92aa-5dda-8356-e66963d333d6'::uuid, 3),
  ('164af3a1-cfd4-577b-8ebb-9b36bf77ba9f'::uuid, 4),
  ('fea9e5d8-7856-523e-9609-ab8eb5f7ca69'::uuid, 5),
  ('7faaccf9-1823-5c8f-b486-cabf1766e1b9'::uuid, 6),
  ('52369e6b-5204-5268-bf18-364f8012bc5d'::uuid, 7),
  ('008ce725-1040-53ed-a290-4bd5da20c3cd'::uuid, 1),
  ('b0e397c9-bf33-5f39-b248-3f04aa09bc4e'::uuid, 2),
  ('3b2ebc7d-9a67-5b6b-80b4-5bcc19772bd2'::uuid, 3),
  ('54c1770f-897e-5f93-a85c-ac520ff9eae9'::uuid, 4),
  ('15e0d419-9fdc-5317-8d3d-703d05dd808f'::uuid, 5),
  ('16bf356d-25e1-5f96-b0e2-476650504164'::uuid, 6),
  ('24bc3c5d-f4a6-52cc-a3c9-6d7f7fb5842e'::uuid, 7),
  ('56cd38e1-5e58-5aeb-b874-7850ab07141d'::uuid, 8),
  ('1d70fa53-ddbb-52bf-b289-7df56b14363a'::uuid, 9),
  ('3f643ec6-46d6-58af-b6f5-2b86dc7a59a4'::uuid, 1),
  ('d931471c-6dd6-573b-8c13-f2b6330073e5'::uuid, 2),
  ('e044c584-9592-5647-a34f-b6b3dfdd01e7'::uuid, 3),
  ('fa600465-74dd-5cac-b002-d4fbb0d219d3'::uuid, 4),
  ('3879fa3e-7bc2-535b-bda3-54b515599d14'::uuid, 5),
  ('0535cddb-d1d6-5150-bf9d-9a2ebf58313d'::uuid, 6),
  ('b0690dae-ee57-5926-b77d-333149b6f56f'::uuid, 7),
  ('6368e771-317e-5e99-8c54-89f1a2724a2c'::uuid, 8),
  ('42f96089-1bdd-550b-aa94-bfed8ab5648e'::uuid, 1),
  ('0f1a69a8-6fd6-50a2-a1e9-36db37df84b7'::uuid, 2),
  ('0d8bcbd4-f1c9-5388-84d9-79addca43480'::uuid, 3),
  ('a6401d61-d1c2-5cb5-938f-65a715459bf3'::uuid, 4),
  ('c70f4e78-0d73-5e1d-af1e-26533a6d33f2'::uuid, 5),
  ('aef705cb-f2c6-5366-8638-92e5a57cb84c'::uuid, 6),
  ('e4ae1335-0d5a-5f6b-b1f6-a863950d77f8'::uuid, 7),
  ('bbc014fc-8f5a-5267-8970-8eb4c383d4bc'::uuid, 8),
  ('4f280b5b-f20d-58cd-9be0-fee784d4f34c'::uuid, 9),
  ('2d88255d-4ef7-535e-b5f2-84f4b2bb470d'::uuid, 10),
  ('fef7e7f1-b72e-5d15-8ed1-93255e53dcdc'::uuid, 11),
  ('714ba255-908b-5cb0-ae7e-7b35672e0dfa'::uuid, 1),
  ('52f07d2b-4127-5717-9b7b-a8cfcd224248'::uuid, 2),
  ('5d1b78d6-8fe4-5397-9c0d-457574054a90'::uuid, 3),
  ('c2638b5c-892f-51ca-8390-b366b63ce845'::uuid, 4),
  ('0bfbbc8a-bf10-5ab5-8413-2813df38fc13'::uuid, 5),
  ('8942cb1d-e680-50ab-83ae-da648287d7bc'::uuid, 6),
  ('f3b14057-baf2-5a03-80fe-f6139266d0c7'::uuid, 7),
  ('8b5e5faa-5fc8-5fed-89fc-101dfc1f14d4'::uuid, 8),
  ('3642fc2c-334d-5e5b-94cf-3e4568bd4c09'::uuid, 9),
  ('70136c4a-65b3-5d52-86a8-5c2f29b6f289'::uuid, 1),
  ('83722c46-6b6b-5b7b-805d-1296b383fa85'::uuid, 2),
  ('a355d162-7ec3-582d-888c-52afbbcac09b'::uuid, 3),
  ('fff28407-61a1-5852-aeaa-9334d81cc616'::uuid, 4),
  ('971090a2-aec9-52cc-8d36-b91cd374290c'::uuid, 5),
  ('80244e69-27d4-537b-af44-989e123990be'::uuid, 6),
  ('51fc8bd6-137f-5bd0-962a-c991c14b7ff8'::uuid, 7),
  ('197b62be-9bdf-5d92-9275-adbf9480b9b6'::uuid, 8),
  ('52125c57-d497-566f-a5e1-b8b95baf830c'::uuid, 1),
  ('21282ac3-bfee-5374-bd1e-4d07df9de675'::uuid, 2),
  ('5cdeecfe-680a-515a-af75-30fab1229a10'::uuid, 3),
  ('d32585d7-a30d-500d-bde4-adfbcfe34789'::uuid, 4),
  ('1318d247-acc0-5bc6-b8f4-e78739c62c72'::uuid, 5),
  ('f64425b8-77ac-5f75-951f-fca7d7348df9'::uuid, 6),
  ('147e90a9-ce86-5c47-8a20-188f7e58f14f'::uuid, 7),
  ('3dd66333-c503-5181-95af-ed3c4985713e'::uuid, 8),
  ('78aeea75-5125-5488-b3f2-d47a6e65492b'::uuid, 9),
  ('5f2a67eb-9337-5449-b024-4936921c1c6e'::uuid, 1),
  ('9da32ba6-70c9-5062-a41c-40c26dafdb0f'::uuid, 2),
  ('0ed8136e-acdc-552c-81d4-f51a195c5c12'::uuid, 3),
  ('601b72e5-8fe7-5945-8eb5-0b7e1bb6518e'::uuid, 4),
  ('4445164f-eb35-50b7-9807-c0c12a9bfb19'::uuid, 5),
  ('70bebaf4-b998-5a97-90ab-863b509b1c9c'::uuid, 6),
  ('cb387d29-83cb-5e8b-a3e2-6d20932ca189'::uuid, 7),
  ('f107624d-fbe9-5a19-83ee-1a27fade75ed'::uuid, 1),
  ('cac63f60-09f9-55c9-8cd5-54c1992d13c2'::uuid, 2),
  ('2e884a37-127c-5b43-aeed-75c9d8139002'::uuid, 3),
  ('dd368142-4a6f-5bfc-b859-c1af26bf97e2'::uuid, 4),
  ('6bcdeba9-ee97-5f73-a497-f6037eac8e6a'::uuid, 5),
  ('6be83562-88c3-5921-9927-2b637bfc31fc'::uuid, 6),
  ('4dd63858-d357-5ee6-8cf6-13b947c2849e'::uuid, 7),
  ('2fa7de20-c164-5331-a216-14594ed496c8'::uuid, 8),
  ('b931c3d7-1cf7-5f33-b548-a1aa90c6f08e'::uuid, 1),
  ('9596b1fe-f47e-5edc-918b-8211bf965990'::uuid, 2),
  ('d77d233f-eba7-5e6b-8331-271884f627ba'::uuid, 3),
  ('ce022c3d-9779-585e-8424-0574021ddd4d'::uuid, 4),
  ('d12cc452-0034-5160-8bd1-e093029f5db6'::uuid, 5),
  ('db834500-fcbe-5c24-a9f0-f98130963554'::uuid, 6),
  ('797a74fd-6aa9-5d6e-b15a-550aa1cc6cd8'::uuid, 7),
  ('e9e72485-1d19-5e00-83ac-af3e3b8cf0b7'::uuid, 8),
  ('34c1ff0d-202d-5779-a894-db0213214cf7'::uuid, 9),
  ('57498b2c-bf47-5d44-b36d-2063badebcce'::uuid, 1),
  ('d0941de3-30a0-585b-9a6f-495c8fe8b806'::uuid, 2),
  ('e7dce1fb-ff12-5cd9-a9ba-6933f50aec7c'::uuid, 3),
  ('bd0deaee-f2f1-51df-9a69-513bf978d437'::uuid, 4),
  ('0a65fc18-4fbd-527f-96bd-7a87f473b0a0'::uuid, 5),
  ('140c933c-abd7-5011-a414-4dacd93dfefc'::uuid, 6),
  ('14352238-9614-597a-8048-b85ed65f4ecb'::uuid, 7),
  ('b760e447-6a20-55bb-84e9-5fdc99d61777'::uuid, 1),
  ('84cdaf2b-e8d2-5943-9df1-dfd8923a2386'::uuid, 2),
  ('0b938e22-5cd1-5299-b800-e2f313793d9b'::uuid, 3),
  ('1133fea5-9aaa-52ae-9faf-13e8559a4b82'::uuid, 4),
  ('ea839a5d-7ee2-5100-907d-e400a2581993'::uuid, 5),
  ('59ed1783-ef9c-5c50-8cdb-114faebce45d'::uuid, 6),
  ('c5f43740-f908-5d40-942b-1a1c5e9dff6c'::uuid, 7),
  ('0f1f5685-4f2e-5aae-b047-704582d7e1c8'::uuid, 8),
  ('84890fa5-6ff3-540b-b023-ebea83d4e074'::uuid, 1),
  ('08cbd9ac-d647-5238-a931-00c27684d54a'::uuid, 2),
  ('dace464a-a536-5e10-91a7-dcbe2adfe357'::uuid, 3),
  ('4d0e1fa9-c33b-5957-b46e-26c2b02277b0'::uuid, 4),
  ('060664dc-b4a2-5bfd-87fa-1a66316f281f'::uuid, 5),
  ('0a4e9471-76fe-5a83-abcf-533503a42367'::uuid, 6),
  ('5887c923-0151-5f00-8c01-2c87b74d8257'::uuid, 7),
  ('701071c8-11a6-5c06-b701-a299b28ebf0e'::uuid, 8),
  ('19e853e8-c4b8-5907-a301-3f7605225377'::uuid, 1),
  ('67bc3025-36ed-5457-93bc-a642a98e4562'::uuid, 2),
  ('da642ccf-4114-5382-935e-ff36b9464a1e'::uuid, 3),
  ('9383bd4b-3393-5f61-a779-e878c10c5b10'::uuid, 4),
  ('b0491a6e-eb08-5873-a070-13ecd09ffb9e'::uuid, 5),
  ('56dcc87a-c510-5624-9824-fa0306add442'::uuid, 6),
  ('2af58932-a549-5a38-be9c-06fe61f5f13c'::uuid, 7),
  ('0adb9077-99ac-53f3-8a37-6bf401b2d315'::uuid, 8),
  ('785e8979-ecb9-56c5-bacd-5d0614fbd3ee'::uuid, 9),
  ('d885ee06-8b99-5a68-a2af-66d55fbc5cab'::uuid, 1),
  ('5cf948c8-9639-5818-9e51-831716da17bf'::uuid, 2),
  ('4afefc2f-edbb-5dc2-9130-b9844222937b'::uuid, 3),
  ('29802b51-bb4f-547d-8a77-b14a6f305a3b'::uuid, 4),
  ('b9831063-e0c3-572a-9481-5d7f06629a5b'::uuid, 5),
  ('7bdd77cc-6b65-5c01-9cec-0660ed6e1551'::uuid, 6),
  ('db90f627-a91c-579e-8736-c2ee7f02e686'::uuid, 7),
  ('4be3cbec-dc93-5270-ac38-9a94e20a3676'::uuid, 1),
  ('d9f50e30-d080-5659-a764-13d6eb4e7712'::uuid, 2),
  ('fbcfb43d-a6a2-59c0-9a85-26dff5879145'::uuid, 3),
  ('5be89d21-e042-5abe-9f7a-d3c8ed1de908'::uuid, 4),
  ('2faa7665-073c-59ab-a61c-bf2b8f8c7c82'::uuid, 5),
  ('fff8312c-0cba-543e-8d22-a0c31545329d'::uuid, 6),
  ('a0ecf94b-409c-5d6c-bfbd-93546530c20d'::uuid, 7),
  ('d0277604-c7e1-5013-be69-49c53cddc899'::uuid, 8),
  ('2ac07cf7-4018-5fcb-b019-0c8ba9a0ed08'::uuid, 9),
  ('b1fed780-8a95-5a17-a4b1-26954b060a1f'::uuid, 1),
  ('dac19912-20d6-56a4-9eaf-99ec76b3c4ca'::uuid, 2),
  ('d0659acd-fb0c-55aa-a4fd-53c59a3da616'::uuid, 3),
  ('1f648ccb-10bf-58bc-bdf1-bd2dc35bfe1e'::uuid, 4),
  ('53793208-103d-5ff9-bfbd-ff5d7925280c'::uuid, 5),
  ('aa79bf4c-4b37-55fc-aec4-92ff0ef1cc35'::uuid, 6),
  ('f97f561c-b4c1-5a16-a334-2d706f84f4b9'::uuid, 7),
  ('7855bfaf-b221-5237-9a01-0c0c5f475c79'::uuid, 1),
  ('369da857-f4ce-5deb-be74-012d0e634e00'::uuid, 2),
  ('b0ffb302-a22f-566b-b2ed-acba9b4d7780'::uuid, 3),
  ('99c909bf-8aa9-5fb3-95d3-af569474a88d'::uuid, 4),
  ('5378a76e-3fcc-5635-a605-3a837d8e873f'::uuid, 5),
  ('68c1033a-edef-5566-b9ca-a388ee120e96'::uuid, 6),
  ('febebc53-19b0-54f8-861f-5f82ca1bd31b'::uuid, 7),
  ('caf92dc0-d8e0-57c7-af15-808498a663d0'::uuid, 8),
  ('460e7686-cd6f-5f6b-955d-ff809f97d8da'::uuid, 9),
  ('c867ffd7-a107-579c-8e10-c3402f09155d'::uuid, 1),
  ('1d1b7e93-0ece-5283-bdc5-9ce404b1b256'::uuid, 2),
  ('e57258aa-e5a4-5eaf-b147-23efb2a5b892'::uuid, 3),
  ('07c314b5-5ed0-500f-85c7-94c969d4d30b'::uuid, 4),
  ('626d6f1f-60b6-5702-938d-369c2f9521b8'::uuid, 5),
  ('d603343d-3d53-5a6f-b239-9c386ffd6608'::uuid, 6),
  ('f5cf9618-4b91-5903-b468-3da8446cb7d4'::uuid, 7),
  ('53ae1935-feda-52e4-b971-594b1204c892'::uuid, 8),
  ('f8eeea3b-026b-52e7-8c52-601a8e1803f6'::uuid, 9),
  ('c36f1fb0-b40b-5e3b-84ff-89c27ef80438'::uuid, 10),
  ('7b7125ef-bb74-5e8b-94f2-8b4d26f9ac49'::uuid, 1),
  ('03aa8b94-578d-5f61-b5ad-38eec0a85643'::uuid, 2),
  ('3146b113-e5b6-5138-86c8-7f709e3c3b1f'::uuid, 3),
  ('e04072f9-388f-55fc-bad2-0a32455734f8'::uuid, 4),
  ('0d5b78d8-6399-58f5-83a0-a29342b8660b'::uuid, 5),
  ('450c9d7b-4964-5b61-8c5f-d4257b62957a'::uuid, 6),
  ('73f7b8c5-932a-5333-abe5-c445b041554e'::uuid, 7),
  ('beb7b218-2910-553d-a910-f1c67d9daa6d'::uuid, 8),
  ('3fab15f2-d596-5a4b-a839-a739188e73a7'::uuid, 9),
  ('364a4ab1-6bfb-5366-9777-d829b9c8aca3'::uuid, 1),
  ('0949244b-280f-5986-a4e6-d9cb4e487ac0'::uuid, 2),
  ('3d1d27cc-a648-574f-b1cf-e57094bfcc44'::uuid, 3),
  ('b0cdf9f2-f0b5-546b-9858-7afbef916420'::uuid, 4),
  ('bf00b26c-1ad5-58cd-a165-c59cb6f2e1a8'::uuid, 5),
  ('190e8627-9dbb-59cb-a37a-ac2b67e3319d'::uuid, 6),
  ('e5518658-fe5c-518a-98bc-8dca0ae4e4a6'::uuid, 7),
  ('cf879706-7b7e-5695-a580-26f7f7ac9668'::uuid, 8),
  ('c616abb9-9cb3-5172-8305-1fcb33503ecd'::uuid, 9),
  ('92142ef5-0a09-56f2-be86-2dc5da998bd8'::uuid, 1),
  ('1d4c5191-b7c8-5a03-99ca-42714cd1fdda'::uuid, 2),
  ('9778fdbb-2959-543f-8f02-87a3358d4e83'::uuid, 3),
  ('6b4adc3e-d9c5-537d-b55b-1c5e1522a8d7'::uuid, 4),
  ('399a3390-6337-5b82-9aff-ee9f13fbdfdc'::uuid, 5),
  ('0ba058c6-35c8-5f6e-a723-4e1371d865a6'::uuid, 6),
  ('0c6dd222-34de-5161-b7bc-30e11d8c01b1'::uuid, 7),
  ('ab7c50f2-933d-5193-a692-aa43e4209181'::uuid, 8),
  ('18d1705b-df54-58a9-83ef-689ccc0194aa'::uuid, 1),
  ('40c2d7c1-0436-54e6-b9f8-4be319dfd8ea'::uuid, 2),
  ('fff44c23-88f5-517b-8258-332223270d93'::uuid, 3),
  ('2948f184-0bb3-553a-b904-c3c51372eb8e'::uuid, 4),
  ('9130aad9-600f-5747-99f1-c854245f3ca0'::uuid, 5),
  ('2abadf64-1aca-5cdb-92e2-957c390ff8bf'::uuid, 6),
  ('487c76b1-d1e0-5047-884c-3ef452582a7b'::uuid, 7),
  ('eb329e05-209f-54c0-a0f5-8a6e527d7d9a'::uuid, 8),
  ('9b40bc21-32bf-547b-97ff-156d9485179c'::uuid, 9),
  ('3fcd14c0-7485-5134-ac14-fe902c89b468'::uuid, 1),
  ('4b14047a-ac1e-5f8f-9433-e42b998b81da'::uuid, 2),
  ('57697b20-bd47-5de9-9ab1-bab9255d0039'::uuid, 3),
  ('32d332e7-df81-5dac-8ead-f35a50f2c131'::uuid, 4),
  ('450bffa3-1b32-550d-8a96-2a97f48929e7'::uuid, 5),
  ('990b362e-5357-56f6-9ce8-64f3324eb00a'::uuid, 6),
  ('f7427688-3ad2-5eca-934e-9a2488720d65'::uuid, 7),
  ('c98c1c63-6fd0-5c4f-b452-96c4d4e434f4'::uuid, 1),
  ('263f3e1f-b615-5d96-8dd6-e72c0c779f78'::uuid, 2),
  ('f9a8ce11-b685-5382-a6c3-60ed2ec80992'::uuid, 3),
  ('ac896868-3efd-5610-9f1b-dd4e899a75ba'::uuid, 4),
  ('85b8013d-79de-50be-849e-f5254e9d8391'::uuid, 5),
  ('04aef80e-d753-5cec-891f-f7afab704bd6'::uuid, 6),
  ('ed54763c-3ed5-5ff6-8fd2-18fb813eea0c'::uuid, 7),
  ('73d636b8-522a-5290-a3e6-5493dfec0781'::uuid, 1),
  ('1bf1c5f3-b902-53ee-8ed6-7e1d40ef9934'::uuid, 2),
  ('e2ec5305-45ec-5195-8c2f-3ec608cda7f4'::uuid, 3),
  ('72b86dd8-590c-5ea4-b74f-6da273078004'::uuid, 4),
  ('de63f30e-c6f2-502e-b9a7-2ba28ca13d5c'::uuid, 5),
  ('623ef3b9-09e9-57c5-a5dd-e6b9791668df'::uuid, 6),
  ('40120699-a56b-5e28-91fb-fabe075897fb'::uuid, 7),
  ('e579b4f5-8b10-5284-9be9-fb0deabdd9b2'::uuid, 8),
  ('b9ff9bd3-e1f1-5b36-a8b0-9d322b8568c7'::uuid, 1),
  ('b5bbd26b-cf59-58d5-a9c2-d43b9116b801'::uuid, 2),
  ('07ef9ea9-974f-51eb-bfbe-2c3bac23e355'::uuid, 3),
  ('d3fabcf2-6467-5c42-b7bc-1c5049b6456c'::uuid, 4),
  ('2e29e78e-c25e-5277-ba67-fdfdfa866908'::uuid, 5),
  ('38073cd2-af80-5e94-ac90-e313cbfa05d6'::uuid, 6),
  ('d54f0f27-dc18-59f0-8fd2-66ffba875d5e'::uuid, 1),
  ('d90d3403-d0f2-5c20-b0ae-7e889862d724'::uuid, 2),
  ('6c5714e2-6006-514b-b392-d4953c7d0f7c'::uuid, 3),
  ('4cbe2121-63ad-51ef-b22f-2710f7017768'::uuid, 4),
  ('c4967790-af09-5efa-93e4-eaf0802c4132'::uuid, 5),
  ('863f2ead-b7df-5088-958b-53c14ea39a60'::uuid, 6),
  ('130e52bc-1c1f-5224-b3fa-8d4059757d7a'::uuid, 7),
  ('27819219-2d1c-5c18-a72d-7bf9a452b0e1'::uuid, 1),
  ('cf1a99cf-3586-5345-a706-419cb19d2de2'::uuid, 2),
  ('57ec31cb-7276-55fe-b2ed-f31a5c83935d'::uuid, 3),
  ('976d6df6-59a7-5b8b-ac27-93259d2ef084'::uuid, 4),
  ('9d157f28-4550-54b4-a20c-78e2eeee2b9a'::uuid, 5),
  ('cf33fc7c-04ba-5463-a3eb-831545856028'::uuid, 6),
  ('eea76169-6230-5ba3-9432-5eb91b101562'::uuid, 7),
  ('39803eda-779f-521f-b78f-b49dd74639ef'::uuid, 1),
  ('2665e89b-efc8-5408-b5c8-1789a03cbe3d'::uuid, 2),
  ('161f5fbe-da5c-5f9d-bec9-12258fbc5230'::uuid, 3),
  ('4152bb42-0b4e-5422-bc37-3f274c8b35b9'::uuid, 4),
  ('d0cda451-6206-59d0-a0b6-28998b84f1d2'::uuid, 5),
  ('b0c71533-0305-57e6-a6d7-3a5713496bf8'::uuid, 6),
  ('e2de0439-8c17-5f23-98b8-d0f40eb2b0b8'::uuid, 7),
  ('c8ceb16e-e3d8-5aca-9500-f2decb635a49'::uuid, 8),
  ('0ad4daf7-2e63-5afa-99d8-1eb2a8f86ade'::uuid, 9),
  ('65bbe70d-6378-533e-8275-e2881e097777'::uuid, 1),
  ('a9300b48-4fd4-5ec6-ad5d-a19975e761ec'::uuid, 2),
  ('554aae77-03d5-5e40-ba92-eb65046de185'::uuid, 3),
  ('dced17b4-0113-5b38-b4e1-fb862d266f6b'::uuid, 4),
  ('29ccf160-7f63-536b-bbe0-5bd905e49402'::uuid, 5),
  ('2bdc1da2-0ef4-5557-98bd-634436381213'::uuid, 6),
  ('04ebf5ce-320c-58e3-9557-e068b35fd402'::uuid, 7),
  ('6e5585d4-9991-5622-8828-2f26a52e1980'::uuid, 1),
  ('875c2cf2-d781-5d26-9c00-56b5e6dffc72'::uuid, 2),
  ('01c3c00c-d83b-515b-a1dc-d0e568e61cdb'::uuid, 3),
  ('dae8d3a4-ff69-5cfb-b603-78ceaaa7c277'::uuid, 4),
  ('9333fef1-d1aa-5a04-8a46-3baed1d561c9'::uuid, 5),
  ('616d3f5f-8e6d-5c60-9191-93745ee1e0c6'::uuid, 6),
  ('43cca2cb-f56a-510a-9e6e-ce6543fb8806'::uuid, 7),
  ('f4ac9606-ee84-5b02-a2b1-1ab1d7490be4'::uuid, 1),
  ('15694182-22e8-5737-87dd-d22868738321'::uuid, 2),
  ('5afbf2ba-418b-56a4-a93b-b40ba85750cb'::uuid, 3),
  ('58262ddf-49fe-51ab-9d2e-2901260403ba'::uuid, 4),
  ('cb553efe-c12d-5bd6-b1ad-80e91b5dcc56'::uuid, 5),
  ('1a4b5e68-3bb7-5cbf-866d-c899b5eb923b'::uuid, 6),
  ('461ca7df-efbb-5349-b943-8bfeb4b8188c'::uuid, 7),
  ('049b3dfa-9620-588f-98db-993f1ea85190'::uuid, 1),
  ('6ec446fc-5534-5916-b840-1b3d450b99ac'::uuid, 2),
  ('de6f1b41-3375-5274-a616-2fb3ffd57938'::uuid, 3),
  ('bfe34f56-cfb0-5a21-b146-817700c9b55a'::uuid, 4),
  ('64db3f3c-f995-5b5d-9ae8-ebfa49f7ce16'::uuid, 5),
  ('212f0645-6356-59c3-9f9a-d778a6ee3796'::uuid, 6),
  ('e614012e-a3f8-5e5c-882e-5734613e53da'::uuid, 7),
  ('0c3b2476-f637-5715-beba-95caa076af83'::uuid, 1),
  ('f154ba29-52b5-58c6-8081-0a7caa5a5a54'::uuid, 2),
  ('6dbd3ab6-5eb8-5a7b-ab4d-14eb6fa4e39f'::uuid, 3),
  ('4cb309a6-e268-5445-92ac-2bb0b73968e7'::uuid, 4),
  ('cdad779e-093c-536c-897f-a81a6bcb9bd1'::uuid, 5),
  ('c9291cd4-2b41-50e5-ab63-b3eed5ac204d'::uuid, 6),
  ('1b96058e-8ca9-5468-a665-f923fbc0e167'::uuid, 7),
  ('966ac6c7-0090-547c-8774-8d33551599f8'::uuid, 1),
  ('d4009b99-1101-53f2-a7f7-895a8a515883'::uuid, 2),
  ('00b0c746-c2fc-5da8-86c8-e35e3eac446e'::uuid, 3),
  ('e9c90d1e-cefa-531f-8d38-cdde96cd9c85'::uuid, 4),
  ('298ca767-c28e-56da-aac7-37d3e41fcacf'::uuid, 5),
  ('36043b98-1e13-5d87-be5d-5ce8517454f1'::uuid, 6),
  ('6b9a8c3f-b55c-5e80-878c-7922afdfc9eb'::uuid, 7),
  ('411e1bd3-b76f-5ece-85b6-99aedc8282e3'::uuid, 1),
  ('ce73fa83-fb7f-5407-b636-b355fa831176'::uuid, 2),
  ('5668877d-a021-54fe-925e-2ad7efee366e'::uuid, 3),
  ('d99a799f-1f9f-5987-a4db-80669f8a018f'::uuid, 4),
  ('6444426c-1c3b-5fab-88e0-55e1fd109134'::uuid, 5),
  ('38fb23ae-2376-5f17-bfac-0f19d80d0004'::uuid, 6),
  ('2a7bb3f0-6082-5c29-b726-c32b48432a62'::uuid, 1),
  ('4cd853aa-ee39-5f1a-8c54-2a37005a3bcf'::uuid, 2),
  ('ab2280d8-9a5d-5580-a34e-4a3f672e0516'::uuid, 3),
  ('d98dcee2-b667-566a-9606-028e44df4ba2'::uuid, 4),
  ('9087b1a6-a025-5bcf-94ac-b34fe466246e'::uuid, 5),
  ('9d0a695b-ad25-5297-b9c8-7b1fba4753c5'::uuid, 6),
  ('b983ba8c-c75b-5b61-b45c-c46872b46e46'::uuid, 1),
  ('495523fc-db59-54a0-840f-1741deb03c4a'::uuid, 2),
  ('85866094-f55b-5966-a553-40d782db958a'::uuid, 3),
  ('bbdd577a-10b1-508a-ac14-76c14e75a1a7'::uuid, 4),
  ('4d02456b-8246-57bc-80e2-c4d663a21945'::uuid, 5),
  ('aaf31bcc-e094-59f5-a5a4-eb992a92fbb7'::uuid, 6),
  ('8e26c100-3c9a-5807-90ed-cdbcc2436974'::uuid, 7),
  ('200d72e4-e393-5cdc-a8e7-6d621f6391a3'::uuid, 1),
  ('db33a902-1bf7-5efa-90de-f84fbe999532'::uuid, 2),
  ('92f21d01-3aa4-5028-bbc0-ed998df39764'::uuid, 3),
  ('f981595c-33a3-5b1a-ae6b-28907074f605'::uuid, 4),
  ('6c8f0a38-59af-5060-a4c7-d2b1662723ae'::uuid, 5),
  ('1a4cbaab-577f-5e98-9ed3-11bf0049f3c2'::uuid, 6),
  ('4ddca94b-a071-5b40-b5d4-6bdcd9f36f66'::uuid, 7),
  ('da90c6cc-1cd5-5e11-86f7-f33ea1b8140e'::uuid, 1),
  ('0d6bfa78-b49c-5951-8e88-295a5eb5af86'::uuid, 2),
  ('97d2a6f9-f3d2-55cc-a248-df777e6c0575'::uuid, 3),
  ('dbc9b56c-8738-5e33-8945-29dc658087dc'::uuid, 4),
  ('f8624432-e8eb-518c-9f74-dc2976e3a2e0'::uuid, 5),
  ('756a4f44-8ce3-587f-b0d4-bd823b205015'::uuid, 6),
  ('83a4cb97-2e5a-541b-ad15-d38b3e0ad777'::uuid, 7),
  ('84307c32-4ef8-5ac5-bae0-a21d670bc388'::uuid, 1),
  ('87ba7c70-ed09-53e1-b105-2b288cc2a2a6'::uuid, 2),
  ('2cc84bde-969a-53d8-ba5b-794b695bee2f'::uuid, 3),
  ('5119309c-17f8-5a26-98cf-2fb53b331c63'::uuid, 4),
  ('54a46522-179f-5e50-8fac-69fe816cefe6'::uuid, 5),
  ('ab350215-5f7b-5f70-a6d5-90461633065e'::uuid, 6)
) as v(id, ordinal) where l.id = v.id;

insert into public.tips (id, unit_id, title_en, body_md, status) values
  ('975cf77f-8610-50b5-bb16-46436594b491', 'aea4c640-a7bd-5aba-8ce2-5c2f493637a3', 'Soy, sos', '*Ser* — to be — has a form for each person. So far:

| yo | **soy** | I am |
| vos | **sos** | you are |

Use **vos** with everyone: friends, the waiter, your boss. A question is the same words with a rising voice: *¿Sos Sofi?*', 'published'),
  ('88e0500d-b041-54ab-ab18-c50d35efe8c0', 'd35a777a-0a33-5ede-8fb9-39d0107d41f6', 'Me llamo, te llamás', 'The little word in front changes with the person, and so does the verb:

| yo | **me llamo** | my name is |
| vos | **te llamás** | your name is |

The question puts *cómo* first: **¿Cómo te llamás?** The vos form ends in **-ás**, with the stress on the end.', 'published'),
  ('03fc2a95-8aca-5aee-8293-e0768e0f0df9', '481ae401-6c6e-53d7-9683-853d0cbed672', 'Soy, sos, es', 'Three people, three forms of *ser*:

| yo | **soy** |
| vos | **sos** |
| él, ella | **es** |

The verb already tells you who, so the pronoun is usually dropped: *Es de Rosario* — he''s (or she''s) from Rosario.', 'published'),
  ('7abff288-01b8-54a6-8a7f-927e966091f0', '70dda450-3825-5ea7-88fd-296775bc426c', 'The word matches the person', 'Words that describe someone change for a man or a woman:

| a man | a woman |
| argentin**o** | argentin**a** |
| uruguay**o** | uruguay**a** |
| porteñ**o** | porteñ**a** |
| ingl**és** | ingl**esa** |

*-o* becomes *-a*. A word ending in a consonant adds *-a*, and *inglés* loses its accent: **inglesa**.', 'published'),
  ('bae799d6-4a65-5ace-b7f8-6857b92ea0dd', '9a649d54-c14a-56da-8701-c4783ad9a159', 'Hermano, hermana', 'Most family words come in pairs:

| man | woman |
| herman**o** | herman**a** |
| hij**o** | hij**a** |
| abuel**o** | abuel**a** |
| novi**o** | novi**a** |
| viej**o** | viej**a** |

**Mi** — *my* — never changes: *mi hermano*, *mi hermana*. And *papá* ends in *-a* but is a man.', 'published'),
  ('0f6658b9-f4e9-5a1d-836b-ec6f489940ff', 'b28a06e8-ef82-54f0-bbf4-5314e84a7ece', 'Tengo, tenés, tiene', '*Tener* — to have — is how you give your age:

| yo | **tengo** | Tengo veinte años. |
| vos | **tenés** | ¿Cuántos años tenés? |
| él, ella | **tiene** | Tiene doce años. |

The *e* of *tener* becomes *ie* in *tiene* — but never in the vos form: **tenés**.', 'published'),
  ('b2428c50-74e4-5567-b8f0-403bb337d00d', '3cc8b1a1-6314-5a4f-be82-b713ea584203', 'Ser and tener, all of them', 'With *nosotros* and *ellos*, both verbs are complete:

| | ser | tener |
| yo | soy | tengo |
| vos | sos | tenés |
| él, ella | es | tiene |
| nosotros | **somos** | **tenemos** |
| ellos, ustedes | **son** | **tienen** |

**Ustedes** — *you all* — uses the *ellos* form. Argentina never uses *vosotros*.', 'published'),
  ('2aa3d8f0-61b1-5ee4-b749-7d81ee01ea5c', '71481540-7f7c-5939-9d96-ee76d80128b9', 'Estar, and ser or estar', '| yo | **estoy** |
| vos | **estás** |
| él, ella | **está** |

Two verbs mean *to be*. **Ser** says who or what something is, and where it''s from: *Soy de Rosario.* **Estar** says where it is right now: *Estoy en el centro.*', 'published'),
  ('ec69da9b-919b-5227-808d-abb58a8beed8', 'e4dc651e-4fd9-5ba8-8e83-1c8a4131e09e', 'Hay or está', '| something new | something you already know |
| **Hay** un kiosco. | **El** kiosco **está** en la esquina. |
| **Hay** una parada acá. | **La** parada **está** lejos. |

**Hay** goes with *un, una* or a number, and never changes: *hay dos subtes*. **Está** goes with *el, la*.', 'published'),
  ('5efb235d-d57c-58e4-8155-fd6c834d0300', 'eda0d38b-9df5-5bba-9665-c300309be0fa', 'Estar, and four endings', '| yo | estoy | vos | estás |
| él, ella | está | nosotros | **estamos** |
| ellos, ustedes | **están** | | |

The word for the feeling matches the people in number too:

| one man | cansad**o** | one woman | cansad**a** |
| men | cansad**os** | women | cansad**as** |

A word ending in *-e* just adds *-s*: *triste, tristes*. *Feliz* becomes **felices**.', 'published'),
  ('3df4bd97-1130-5b76-9ad3-39e06c420e6b', 'c5c43fc3-949b-5f6c-99b4-c6da645e7d7f', 'Every -ar verb', 'Take off *-ar* and add the ending for the person:

| yo | labur**o** |
| vos | labur**ás** |
| él, ella | labur**a** |
| nosotros | labur**amos** |
| ellos, ustedes | labur**an** |

It works for *hablar, tomar, estudiar, caminar* — every regular -ar verb. **Hacer** is irregular in *yo*: **hago**, *hacés, hace*.', 'published'),
  ('1861263d-ed73-5540-a7c8-6bd95804c94e', 'b95d926c-3168-53bd-88bd-c02c868d1119', 'Gusta or gustan', 'The verb matches the thing you like, not you:

| one thing | more than one |
| Me **gusta** el mate. | Me **gustan** las facturas. |
| ¿Te **gusta** la milanesa? | ¿Te **gustan** los mates? |

**Me** — to me, **te** — to you, **le** — to him or her. For emphasis, add *a mí*: *A mí me gusta amargo.*', 'published'),
  ('ae41a407-af9b-5cde-9ad6-f0b967fd6c3a', '6f572b83-5cbe-528d-bcdf-bbfc32e2b19c', 'Tener que, and jobs', '**Tener que** + an infinitive — the *-ar, -er, -ir* form — is *to have to*:

| Tengo que laburar. | I have to work. |
| ¿Tenés que estudiar? | Do you have to study? |

Jobs change for a woman: *profesor* → **profesora**, *médico* → **médica**, *jefe* → **jefa**. And no *un, una*: **Soy abogada.**', 'published'),
  ('56d4a95b-8525-5ac4-8df6-3c26ebc33762', '1974689a-177e-55c9-b4b1-69fba40389f0', 'Every -er and -ir verb', '| | comer | vivir |
| yo | com**o** | viv**o** |
| vos | com**és** | viv**ís** |
| él, ella | com**e** | viv**e** |
| nosotros | com**emos** | viv**imos** |
| ellos, ustedes | com**en** | viv**en** |

-er and -ir are the same except for **vos** and **nosotros**, where each keeps its own vowel.', 'published'),
  ('78286e2b-e254-5636-a5a8-883bdf68f891', '740b6205-cb92-54dc-806f-96cc347f8ee0', 'Querer, poder, ir', '| | querer | poder | ir |
| yo | quiero | puedo | voy |
| vos | **querés** | **podés** | vas |
| él, ella | quiere | puede | va |
| nosotros | **queremos** | **podemos** | vamos |
| ellos | quieren | pueden | van |

*e → ie* and *o → ue* everywhere except **vos** and **nosotros**. *Ir* is its own thing. Add an infinitive for plans: *¿Querés salir?*', 'published'),
  ('cf20bac1-fd65-59f0-834e-7f80f5a732a5', '3376ea65-8afe-56be-bae8-b5d06b46c9cd', 'How a vos command is made', 'Take the infinitive, drop the *-r*, and stress the last vowel:

| mirar | **mirá** |
| esperar | **esperá** |
| venir | **vení** |
| andar | **andá** |

A pronoun joins the end, and the accent goes, because the stress doesn''t move: *esperá* → **esperame**. *Decir* → **decime**, *sentarse* → **sentate**.', 'published'),
  ('8eaa2931-6ddd-51a7-b8ae-6270f3bc71e8', '441e2e5b-f704-511a-9e55-ef9613425ce8', 'Me levanto, te levantás', 'These verbs carry a pronoun that matches the person:

| yo | **me** levanto | **me** acuesto |
| vos | **te** levantás | **te** acostás |
| él, ella | **se** levanta | **se** acuesta |
| nosotros | **nos** levantamos | |

The pronoun goes before the verb. *Acostarse* changes *o → ue*, but not with vos: **te acostás**.', 'published'),
  ('f255cb1b-020c-5d3c-bf67-3a14a5b0ebe8', '2d151075-cd8d-51b2-9e1c-bf5a34e4ef1b', 'Me gusta + doing something', 'With a verb, *gusta* stays singular, even for two activities:

| Me gusta bailar. | Me gusta leer y cocinar. |
| Me encanta el fútbol. | Me encantan las series. |

Agreeing: **A mí también** after a *yes*, **A mí tampoco** after a *no*.', 'published'),
  ('25c6c8c9-38b7-5842-bed3-2abc54ab4404', '2fa4826d-6276-5a6f-b7a5-e3c2e6dc4f2d', 'Present or past: the stress', '| | now | yesterday |
| yo | labur**o** | labur**é** |
| vos | labur**ás** | labur**aste** |
| él, ella | labur**a** | labur**ó** |

*Laburo* is *I work*; **laburó** is *he worked*. Only the stress, and the accent that marks it, tells them apart. Every regular -ar verb works like this: *hablé, llegaste, compró*.', 'published'),
  ('0a6e13e7-9116-5535-b2bb-1489efb882aa', 'b60b2d1f-25dc-5ada-9b93-a0afe7bd9a37', 'The past of -er and -ir', '| | -ar | -er, -ir |
| yo | labur**é** | com**í**, sal**í** |
| vos | labur**aste** | com**iste**, sal**iste** |
| él, ella | labur**ó** | com**ió**, sal**ió** |
| nosotros | | com**imos**, sal**imos** |

-er and -ir share one set of endings. *Salimos* is both *we go out* and *we went out* — *anoche* or *ayer* tells you which.', 'published'),
  ('064798bc-ef12-56bf-a592-3c29d6a78677', 'e89d1870-c4d1-5692-923d-5e357ae8218e', 'Fui, estuve, tuve', '| | ir, ser | estar | tener |
| yo | **fui** | **estuve** | **tuve** |
| vos | **fuiste** | **estuviste** | **tuviste** |
| él, ella | **fue** | **estuvo** | **tuvo** |
| nosotros | **fuimos** | | |
| ellos | **fueron** | | |

No accents here. *Fui a la cancha* is *went*; *fue bárbaro* is *was*.', 'published'),
  ('318d0b7a-680c-503c-9bd5-22439af48493', 'f42f6608-6d16-5d0a-bd3f-896cd5fb4d07', 'The irregular past', '| | hacer | ver | decir | venir | poder |
| yo | hice | vi | dije | vine | pude |
| vos | hiciste | viste | dijiste | viniste | pudiste |
| él, ella | hizo | vio | dijo | | |

A new stem, then *-e, -iste, -o* — with no accent. Tell the story in order with **primero**, **entonces**, **al final**.', 'published'),
  ('8413be7f-d993-58d5-87be-fbc6a78cbf25', 'fd0afb5a-c86b-5339-b28f-31f5431f400a', 'Comparing', '| more than | **más** alto **que** yo |
| less than | **menos** caro **que** |
| as … as | **tan** lindo **como** |
| better, worse | **mejor**, **peor** |
| older, younger | **más grande**, **más chico** |
| very, very | rico → **riquísimo**, caro → **carísimo** |

The describing word still matches the person: *mi hermana es más alta que yo*.', 'published'),
  ('863cc68c-e7da-5e85-9141-6c897afcf44b', '9230420b-8a48-5c4b-b9d9-b7dc3c12bb5d', 'Lo, la, le — where they go', '| the thing, masculine | **lo**, **los** | ¿El audio? **Lo** mando ahora. |
| the thing, feminine | **la**, **las** | ¿La tarjeta? **La** tengo. |
| to him, her, them | **le**, **les** | **Le** doy la llave. |
| me, you | **me**, **te** | **Te** llamo mañana. |

Before a normal verb: *la tengo*. Stuck to the end of a command: **llamame**, **dame**, **mandame**.', 'published'),
  ('862e703e-1590-5d4a-9240-1b3e1a058369', '8f8a4c97-4077-5352-b040-a22de57f1b7e', 'Era, tenía, vivía, iba', '| | ser | tener | vivir | ir |
| yo, él, ella | era | tenía | vivía | iba |
| vos | eras | tenías | vivías | ibas |
| nosotros | éramos | | | íbamos |

This past describes: how things *were*, what you *had*, where you *lived*. *Yo* and *él* share one form. **Cuando era chico vivía en Rosario.**', 'published'),
  ('f3fcc919-1f27-58f9-a544-0c038db923b8', '38114afb-c035-5ae5-956f-723c4f408a0d', '-aba and -ía', '| | -ar | -er, -ir |
| yo, él, ella | jug**aba** | com**ía** |
| vos | jug**abas** | com**ías** |
| nosotros | jug**ábamos** | sal**íamos** |

Every verb but *ser, ir* and *ver* follows this. It''s the *used to* of English: **Los sábados jugábamos a la pelota.**', 'published'),
  ('a5c70944-071c-57eb-92e8-7a784b3f8d17', '520a3c73-f830-5ea8-bb7f-36b6b5a53614', 'The scene and what happened', '| the scene — imperfect | what happened — preterite |
| **Estaba** en el subte | cuando me **llamó** Sofi. |
| **Llovía** mucho | y **llegué** tarde. |
| **Había** mucha gente | y no **pude** entrar. |

Ask: was it going on, or did it happen? Going on → *-aba, -ía*. Happened, and finished → the preterite.', 'published'),
  ('27cf7ef4-754e-5b11-b0be-c8d19ba3767d', 'a6c406c0-0103-5fcc-9871-5e1bc85a3833', 'Me puse, me enojé', '| | ponerse | enojarse |
| yo | **me puse** | **me enojé** |
| vos | **te pusiste** | **te enojaste** |
| él, ella | **se puso** | **se enojó** |

The pronoun stays in the past. **Ponerse** + a feeling is *to get*: *me puse nervioso* — *I got nervous*.', 'published'),
  ('e310bbae-1d4a-5b28-99c7-88edb5d61f8a', '776b15fe-c6a5-5aae-8876-404d392e0546', 'Te lo, se lo', '| Te devuelvo **el libro**. | Te **lo** devuelvo. |
| ¿Me dejás **las llaves**? | ¿Me **las** dejás? |
| Le regalé **un libro**. | **Se lo** regalé. |

The person goes first, the thing second. *Le* or *les* before *lo, la* becomes **se**.', 'published'),
  ('e5afe1ea-54cb-5ae0-b179-677927fb6451', '3dd370c2-01fe-54ba-95fc-3c5ef1637eb0', 'The future of guessing', '| ser | **será** | ¿Qué hora será? |
| estar | **estará** | Estará en el laburo. |
| tener | **tendrá** | Tendrá treinta años. |
| haber | **habrá** | Habrá mucha gente. |

For plans, porteños say *voy a*. This future is for wondering and guessing: *I wonder…*, *he''s probably…*', 'published'),
  ('664a9c32-cfa5-5895-bef6-bdd6dd08a3a7', '74698b58-c87a-5870-a6dd-a6652b6da393', 'How the subjunctive is made', 'Start from the *yo* of the present and swap the vowel: *-ar* verbs take **e**, the rest take **a**.

| yo (now) | vos | yo, él, ella |
| llamo | **llames** | **llame** |
| vengo | **vengas** | **venga** |
| hago | **hagas** | **haga** |
| traigo | **traigas** | **traiga** |
| voy | **vayas** | **vaya** |

*Ir* is the odd one out. It follows **quiero que**: *quiero que vengas*.', 'published'),
  ('c0f803fa-9e89-5bb7-a735-344a4b869d1d', '186b6b78-c334-5c53-9675-d7e5ca16b5b4', 'Wishes', '| Que te vaya bien. | Good luck. |
| Que la pases lindo. | Have a great time. |
| Que tengas buen finde. | Have a good weekend. |
| Ojalá que no llueva. | I hope it doesn''t rain. |
| Ojalá salga todo bien. | I hope it all works out. |

A wish is **que** or **ojalá** + the subjunctive. *Tener → tengas, salir → salga*: the *g* of *tengo, salgo* comes along.', 'published'),
  ('171a6d8d-679c-55b8-b92c-e530ad368f85', '5f6c9abe-859a-5d19-853a-7dc6bcce9c99', 'Cuando: always, or not yet', '| a habit — normal verb | not yet — subjunctive |
| Cuando **llego**, tomo mate. | Avisame cuando **llegues**. |
| Cuando **termino**, salgo. | Cuando **termines**, llamame. |

About the future, *cuando* and **apenas** take the subjunctive: *apenas puedas*.', 'published'),
  ('3f5fdfb3-5d97-5bf9-9a8d-b28e644991b8', '8c4c452e-c6f6-5f26-a9a5-ded2342f7c9f', 'Creo que, no creo que', '| Creo que **es** así. | No creo que **sea** así. |
| Creo que **está** en casa. | No creo que **esté** en casa. |
| Creo que **tiene** razón. | No creo que **tenga** razón. |
| Creo que **hay** tiempo. | No creo que **haya** tiempo. |

Sure → the normal verb. Doubting → the subjunctive.', 'published'),
  ('6f8ab658-e6d0-5d0b-b29e-924e5fed047b', '52c51646-b698-5749-ae7b-d554ab2e0240', 'Do, and don''t', '| do | don''t |
| Vení. | No **vengas**. |
| Andá. | No **vayas**. |
| Decime. | No **me digas**. |
| Tocá. | No **toques**. |
| Olvidate. | No **te olvides**. |

*No* + the subjunctive, and the pronoun moves in front: *preocupate* → **no te preocupes**.', 'published'),
  ('1ad3b9a3-a6f5-5bfe-ac8d-ececc0294b5e', '063d369c-847e-57b8-8451-b9c4049a1d9e', 'Advice: probá, or que pruebes', '| straight out | softer |
| Probá el flan. | Te recomiendo que **pruebes** el flan. |
| Pedí un taxi. | Es mejor que **pidas** un taxi. |

**Te recomiendo que** and **es mejor que** take the subjunctive. *Probar* → **pruebes**, *pedir* → **pidas**.', 'published'),
  ('9fa1891b-f569-595e-a9a2-2388d6feb5fd', '36b953db-b59d-5c37-8572-47afd0081c48', 'Reacting', '| ¡Qué bueno que **estés** acá! | So good you''re here! |
| Qué lástima que no **vengas**. | Shame you''re not coming. |
| Me molesta que **llegue** tarde. | It bugs me he''s late. |

A reaction to something + **que** → the subjunctive. **Me alegro** on its own: *I''m glad*.', 'published'),
  ('0d67de33-b543-5723-80bc-2cdc84c62e99', '465d788e-db67-5a57-8f4e-96306374e29c', 'Would: -ía', '| | regular | shortened |
| yo, él, ella | comprar**ía**, ir**ía** | **tendría**, **podría**, **haría**, **diría** |
| vos | ir**ías** | |

The ending goes on the whole infinitive: *comprar* → **compraría**. **Yo que vos** + would is advice: *yo que vos, esperaría*.', 'published'),
  ('9188a5b3-38d2-5778-9e5a-e804df27b256', 'ce343377-a0c2-5201-9ff4-824789e73e89', 'Si tuviera, viajaría', 'The *if* half has its own form. Take the *ellos* past and swap **-ron** for **-ra**:

| tuvie-ron | **tuviera** |
| fue-ron | **fuera** |
| pudie-ron | **pudiera** |
| estuvie-ron | **estuviera** |

Then the other half takes *would*: **si tuviera tiempo, viajaría**. With vos: *si tuvieras*, *¿qué harías?*', 'published'),
  ('52d12bb1-c5ac-5616-9d9f-9d1183ece01e', 'aa46af4e-1c1b-50ae-b8c1-03167cabaecc', 'Telling what someone said', '| what she said | what you tell |
| «¿Venís?» | Me preguntó **si venía**. |
| «Sí.» | Le contesté **que sí**. |

The question comes back with **si**; what was going on slides into the imperfect: *venís* → **venía**.', 'published'),
  ('0ae8a455-b5ec-5603-9920-7d5ea5055cc5', 'ae52684a-c28b-5318-92e0-5d1cc5ac5cf1', 'Se me, se te, se le', '| to me | **se me** cayó | I dropped it |
| to you | **se te** cayó | you dropped it |
| to him, her | **se le** cayó | he dropped it |

Same with *rompió, perdió, olvidó*: **se me olvidó** — *I forgot*. The middle word says who it happened to.', 'published'),
  ('c3db5128-fa8a-560f-886b-8a3374977ee4', '6dc81d68-66ed-5adc-a6d9-ebdfac00662e', 'Para, para que', '| same person — infinitive | someone else — subjunctive |
| Estudio **para aprender**. | Te lo explico **para que entiendas**. |
| | Te lo mando **para que lo leas**. |
| | Avisame **antes de que** llegue. |

**Antes de que** always takes the subjunctive: it hasn''t happened yet.', 'published'),
  ('1ce38771-b5cc-5d17-9f00-d8a1112042e5', 'c640ea33-8098-56b9-85a3-15f539f2ece2', 'Había + -ado, -ido', '| yo, él, ella | **había** | comido, llegado, salido |
| vos | **habías** | hecho, dicho, visto |
| ellos | **habían** | |

One past behind another: **Cuando llegué, ya habían comido.** *Hecho, dicho, visto* are the irregular ones.', 'published'),
  ('32a7da73-8fdd-5644-bd69-bcf70ac27e64', 'd7e9f660-01d8-5d0f-9136-9a85a20fc33b', 'Se: what people do', '| Acá **se cena** tarde. | People eat late here. |
| **Se saluda** con un beso. | You greet with a kiss. |

**Se** + the *él* form talks about everyone in general, no one in particular.', 'published'),
  ('74f663ec-4803-5ba8-bc3c-f12395829ac5', '59b48665-2d47-587e-b406-84d2800c4161', 'Quería que vinieras', 'The second verb follows the first into the past:

| now | then |
| Quiero que **vengas**. | Quería que **vinieras**. |
| Te pido que **llames**. | Te pedí que **llamaras**. |
| Me dice que **espere**. | Me dijo que **esperara**. |

The past subjunctive is the *ellos* past with **-ra**: *vinieron* → **viniera**, *hicieron* → **hiciera**. With vos: **vinieras, hicieras, llamaras**.', 'published'),
  ('63fad49e-94ca-595b-9a43-f0244cd997ff', '21206ba6-6522-5849-be52-419e7d6d1007', 'Aunque + fact, aunque + maybe', '| a fact — normal verb | a maybe — subjunctive |
| Aunque **llueve**, vamos. | Aunque **llueva**, vamos. |
| Aunque **cuesta**, sigo. | Aunque **cueste**, sigo. |
| Aunque **querés**, no podés. | Aunque no **quieras**, tenés que ir. |

Left: it *is* raining. Right: whether or not it rains. **Igual** at the end — *anyway* — often closes it.', 'published'),
  ('75167017-65a6-5a49-9a02-adfb338b796b', 'dd303fe0-52c5-5e61-97ae-1903616e625c', 'How long: llevar, hace, seguir', '| Llevo dos años **viviendo** acá. | I''ve been living here for two years. |
| Hace dos años que **vivo** acá. | (the same) |
| **Sigo** laburando ahí. | I still work there. |
| **Dejé de** fumar. | I quit smoking. |
| **Volvió a** llamar. | He called again. |

English *have been …ing* is the present in Spanish. **Llevar** + time + *-ando, -iendo*.', 'published'),
  ('f534bcfd-43c6-5d81-a814-89f5071f8271', 'c7b4cc13-41a1-57bf-b8f9-9c5a2ef4fb1b', 'Commands for ustedes', '| one person (vos) | more than one (ustedes) |
| pasá | **pasen** |
| esperá | **esperen** |
| vení | **vengan** |
| traé | **traigan** |
| sentate | **siéntense** |
| no te preocupes | **no se preocupen** |

-ar verbs end in **-en**, the rest in **-an**. The pronoun is **se**, stuck on the end — and then the accent appears: **siéntense, quédense**.', 'published'),
  ('d953b996-8823-5ff5-903a-37c8c6ca647c', 'e31d82b3-e9e2-52bc-bd88-e52c7b53a764', 'Como si + past subjunctive', '| Habla **como si supiera** todo. | He talks as if he knew everything. |
| **Como si fuera** fácil. | As if it were easy. |
| Me saludó **como si nada**. | He said hi as if nothing had happened. |
| ¡**Ni que fuera** tan difícil! | It''s not like it''s that hard! |

After **como si** and **ni que**, always the *-ra* form, whatever the time.', 'published'),
  ('c50b38dc-9380-5d27-a868-9efdcb14249d', 'b3d7d4fe-8ba0-58f9-8d0e-38b9aaf3707f', 'El que, la que, donde', '| a masculine thing | **el que** quieras |
| a feminine thing | **la que** está en la esquina |
| more than one | **los que** vinieron, **las que** prefieras |
| a place | el bar **donde** nos conocimos |

It matches what it stands for. *El que quieras* — whichever you want — takes the subjunctive: you haven''t chosen yet.', 'published'),
  ('058b9be3-593b-5386-8f79-4af1d6232d6f', 'aaafb4dd-18af-5b10-be4f-33a46f2cba0e', 'Si hubiera + participle', '| yo, él, ella | **hubiera** | sabido, venido, ido |
| vos | **hubieras** | llamado, avisado, pensado |

For what didn''t happen, both halves: **Si hubiera sabido, te hubiera avisado.** *If I''d known, I''d have told you.* Compare *si supiera* — if I knew (now).', 'published'),
  ('25ec7ca7-ffbe-58e9-a822-1d3a5b621634', 'c9686bb1-fe4a-58d4-b91f-601bade129fa', 'Que tenga, or que tiene', '| not found yet — subjunctive | already found — normal verb |
| Busco un depto que **tenga** balcón. | Encontré un depto que **tiene** balcón. |
| Busco algo que **quede** cerca. | Vivo en un depto que **queda** cerca. |
| ¿Hay un dueño que **acepte** mascotas? | Mi dueño **acepta** mascotas. |

If it might not even exist, the verb after **que** goes into the subjunctive.', 'published'),
  ('94b56b2f-e888-5bb6-a0c1-1ec2a11c8235', 'fc31544c-c615-5722-9494-5a728b6cf9be', 'Me da + a feeling', '| Me da **bronca**. | It makes me mad. |
| Me da **vergüenza**. | I''m embarrassed. |
| Me da **lástima**. | I feel sorry (for him). |
| Me da **igual**. | I don''t care. |

The cause follows **que** in the subjunctive: **me da bronca que no avise**. In the past, **me dio**: *me dio vergüenza*.', 'published'),
  ('4f42bca0-b0c9-54dd-894d-af1e0ddee783', '731a6e56-3586-5647-a6ab-12df3dec98b6', 'Soft advice', '| **Deberías** descansar. | You should rest. |
| **Debería** llamarla. | I should call her. |
| **Estaría bueno** juntarnos. | It''d be nice to get together. |
| **Habría que** avisarle. | We ought to let him know. |

All four take an infinitive. *Tenés que* is an order; *deberías* is advice.', 'published'),
  ('081f428b-6a76-50d8-a333-81ee65fd2e25', '0323848f-596e-579a-a7dd-1904e93c1f32', 'What he said he''d do', '| what he said | what you tell |
| «Voy.» | Dijo que **iría**. |
| «Vengo mañana.» | Dijo que **vendría** mañana. |
| «Te llamo.» | Dijo que me **llamaría**. |

A promise told later goes into *would*. Just as porteño: **dijo que iba a venir**.', 'published'),
  ('ad441301-b7f3-5214-8c27-dce2ef10ed38', '109ff419-4504-54fc-a4e6-0f7e45175049', 'Conditions', '| Voy, **a menos que llueva**. | unless |
| Voy, **siempre y cuando vengas**. | as long as |
| Llamame **en caso de que haya** un problema. | in case |
| Llevá paraguas **por si llueve**. | just in case |

The first three take the subjunctive. **Por si** is the exception: normal verb.', 'published'),
  ('a13868ae-2900-572c-98a0-bf4c01691f94', '30394d47-559d-52eb-9c24-d6a8bbaeba36', 'Se + verb on a sign', '| one thing | more than one |
| **Se vende** auto. | **Se venden** bicis. |
| **Se alquila** depto. | |
| **Se necesita** mozo. | |

**Se** + the *él* form, or the *ellos* form for plurals. Nobody is named: it''s what''s being sold, rented, needed.', 'published'),
  ('8256fe17-7a93-50ce-b2db-6e21f135e747', 'c5abd659-9dd6-54e9-9e4f-6e906e375953', 'Ir + -ando, estar por', '| **Voy entendiendo.** | I''m starting to get it. |
| **Vas aprendiendo** de a poco. | You''re learning bit by bit. |
| **Estoy por** salir. | I''m about to leave. |
| **Está por** llover. | It''s about to rain. |

**Ir** + gerund is change in progress; **estar por** + infinitive is what''s about to happen.', 'published'),
  ('517cd65f-1087-5ff5-8411-77ce8bbef80f', '8a547039-7fc7-5382-9c3a-9b48a4102289', 'A request, told later', '| what she said | what you tell |
| «Traeme algo.» | Me pidió que le **trajera** algo. |
| «Esperen.» | Nos dijo que **esperáramos**. |
| «Dejalo acá.» | Me pidió que lo **dejara** acá. |
| «Vení.» | Quería que **viniera**. |

A request or an order told later takes the past subjunctive after **que**. News doesn''t: *dijo que venía*.', 'published'),
  ('e4034940-c3b8-5953-be43-6edfb0a0421a', 'd8c13ac1-8ec0-5db3-adbe-39834eed0ff9', 'Si = whether', '| «¿Venís?» | Me preguntó **si** venía. |
| «¿Abre hoy?» | No sé **si** abre hoy. |
| | **A ver si** nos juntamos. |

A yes-or-no question told later hangs on **si**, with the normal verb.', 'published'),
  ('e41cacc8-f196-569f-9838-bdd51d5857fa', 'f71fcde3-a7e0-5429-864a-cef0a28a9a3f', 'Vos and usted', '| vos | usted |
| ¿Vos sos el dueño? | ¿**Usted** es el dueño? |
| Pasá. | **Pase**. |
| Sentate. | **Siéntese**. |
| Disculpá. | **Disculpe**. |

Usted takes the *él* form. **Quisiera** — *I''d like* — works with both.', 'published'),
  ('8ace68aa-92e5-5adc-9c3b-a04781c0f380', 'c64cedd2-5987-5859-b94d-77231e8c5eaa', 'A la that points at nothing', '| **Se la cree.** | He''s full of himself. |
| **Me la banco.** | I can handle it. |
| **Se la bancó.** | She put up with it. |
| **Me las arreglo.** | I get by. |
| **La tenés clara.** | You know your stuff. |

The *la* stays *la* whoever you''re talking about; only the verb and the first pronoun change.', 'published'),
  ('19d601d6-de61-5a96-92de-c8ebe98b3a8f', '17f201ba-038f-5447-a92b-ea8274de3421', 'Just, usually, again', '| **Acabo de** llegar. | I just got here. |
| **Suelo** almorzar tarde. | I usually have lunch late. |
| **Volví a** perder las llaves. | I lost my keys again. |

All three take an infinitive. **Soler** has no past you''ll need: *antes almorzaba tarde* does the job.', 'published'),
  ('de7cd7bc-7f0d-588c-bc69-c90f2dc4f004', 'f46f9df0-afdf-5c8c-95be-a4b002904a9d', 'The passive of the news', '| El puente **fue construido** hace un siglo. | was built |
| La estación **fue inaugurada** ayer. | was opened |
| Los chorros **fueron detenidos**. | were arrested |

**Fue** + participle, and the participle agrees like an adjective. In conversation: *construyeron el puente*.', 'published'),
  ('64100870-cfc7-57cb-877d-35ee7ebe456f', '7768d3dd-52a9-55e1-be73-c2b2153fdb64', 'They, whoever they are', '| **Me robaron** el celu. | My phone got stolen. |
| ¿Cuánto te **cobraron**? | How much did they charge you? |
| **Dicen** que mañana llueve. | They say it''ll rain tomorrow. |

The *ellos* form with nobody named is how Spanish says *it got done*: no one to blame, or no one worth naming.', 'published'),
  ('45734591-aa5f-52b7-bd71-165c7e2e5b2b', 'e5014ed4-167a-55b0-8e66-43bd2ee4e434', 'Lo + adjective', '| **Lo bueno** es la gente. | The good thing is the people. |
| **Lo malo** es el tránsito. | The bad thing is the traffic. |
| **Lo mejor** fue el asado. | The best part was the asado. |
| **Lo peor** es el calor. | The worst part is the heat. |

**Lo** + adjective makes *the … thing*. It never changes: *lo bueno*, even of a plural.', 'published'),
  ('ebf70b0b-7f6a-5e96-b746-54f804c3c99b', '74a94584-d79a-55af-920c-e6fa1c59b5ad', 'No es que…, es que…', '| **No es que** no **quiera**, | It''s not that I don''t want to, |
| **es que** no puedo. | it''s just that I can''t. |
| **No es que** no **tengamos** ganas. | It''s not that we don''t feel like it. |

The reason you deny takes the subjunctive; the real one, after **es que**, the normal verb.', 'published'),
  ('c3264f00-8549-57e6-b10c-df7f596d789c', 'd1ef9d43-816d-571d-a8ba-4ba76a09ba2d', 'Then, and what it means now', '| if (then) | now |
| Si **hubiera ahorrado**, | ahora **tendría** un depto. |
| Si **hubiéramos** salido antes, | ya **estaríamos** ahí. |
| Si **hubiera aceptado**, | ahora **sería** otra cosa. |

*Hubiera* + participle for the past that didn''t happen; the plain conditional for today.', 'published'),
  ('04312d09-ee63-5a2e-aa3d-bac2d25e0910', 'f925644a-c585-5773-8af3-f9a36c4cd2b0', 'Should have', '| **Tendría que haber** ido. | I should have gone. |
| **Tendrías que haber** avisado. | You should have let us know. |
| **Me arrepiento.** | I regret it. |

**Tendría que haber** + participle: the porteño regret. Never *he debido*.', 'published'),
  ('c84bee89-18a2-5614-8727-17bcdb37c13c', '24efab50-024b-519e-9029-d2d7f4a05a09', 'Hacer + infinitive', '| **Me hizo reír.** | It made me laugh. |
| **Me hizo llorar.** | It made me cry. |
| **Me hace acordar** a vos. | It reminds me of you. |

**Hacer** + infinitive is *to make someone do it*. The person goes in front: **me**, **te**, **nos**.', 'published'),
  ('1d9ab98d-f6c7-53f6-94dd-02c03d8f55a8', '1c04f11a-4feb-5b1d-956b-3661bab59c15', 'The more…', '| **Cuanto más** practicás, | The more you practice, |
| mejor hablás. | the better you speak. |
| Avisame **cuanto antes**. | Let me know as soon as you can. |

**Cuanto más** + one thing, then the other with **más**, **menos**, **mejor**.', 'published')
on conflict (id) do update set title_en = excluded.title_en, body_md = excluded.body_md, status = excluded.status;

-- A learner already past a unit keeps her place: its new lessons count as done.
insert into public.lesson_progress (user_id, lesson_id, score, passed, passed_by)
select distinct p.user_id, n.id, 100, true, 'placement'
from public.lesson_progress p
join public.lessons pl on pl.id = p.lesson_id
join public.units pu on pu.id = pl.unit_id
join public.lessons n on n.id in ('ab2280d8-9a5d-5580-a34e-4a3f672e0516', '85866094-f55b-5966-a553-40d782db958a', 'bbdd577a-10b1-508a-ac14-76c14e75a1a7', 'f981595c-33a3-5b1a-ae6b-28907074f605', 'dbc9b56c-8738-5e33-8945-29dc658087dc', '2cc84bde-969a-53d8-ba5b-794b695bee2f')
join public.units nu on nu.id = n.unit_id
where pu.course_order > nu.course_order or (pl.unit_id = n.unit_id and pl.kind = 'review')
on conflict (user_id, lesson_id) do nothing;

-- Review logs refused every mode added after the first schema: the tile and
-- typed gaps and the tile meaning were never logged.
alter table public.review_logs drop constraint if exists review_logs_mode_check;
alter table public.review_logs add constraint review_logs_mode_check check (mode in (
  'flashcard', 'multiple_choice', 'listen', 'typing', 'matching', 'word_build', 'true_false',
  'listen_build', 'sentence_intro', 'sentence_meaning', 'sentence_meaning_tiles', 'sentence_gap',
  'sentence_gap_tiles', 'sentence_gap_typed', 'sentence_build', 'sentence_listen'));
