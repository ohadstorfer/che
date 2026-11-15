-- Infinitive first: a verb's infinitive is taught before its conjugated forms in the same unit.
-- Tester feedback (2026-10-29): compro/comprás/compra came before comprar.
-- 1. forms.position: the infinitive takes its verb's first slot; other words keep theirs.
update public.forms set position = 3 where id = '2f891751-9844-589e-a351-fadb49973a26'; -- pedir 4->3
update public.forms set position = 4 where id = '46d5be7a-7fee-5b97-a1e7-9d0d398e3a48'; -- pido 3->4
update public.forms set position = 1 where id = 'fbdccfaa-d628-5fc0-bd8e-5e1a13e06148'; -- sonar 3->1
update public.forms set position = 2 where id = '5a820f0b-353e-5a88-aa55-c3065f678548'; -- sonó 1->2
update public.forms set position = 3 where id = 'd5a8da11-4277-53a1-b4e9-7aa5ecebf5c0'; -- sonaba 2->3
update public.forms set position = 1 where id = 'b50dcf31-cb33-5ce5-b70f-f08de2f7a680'; -- conocer 5->1
update public.forms set position = 2 where id = 'ee416ee4-dfa5-56ce-9649-634e9411d7d1'; -- conozco 1->2
update public.forms set position = 3 where id = '1cef621a-b696-512b-b222-036a48b7b5cb'; -- conocés 2->3
update public.forms set position = 4 where id = 'f5645b2f-459b-52aa-b8a1-60f8870626fb'; -- conocí 3->4
update public.forms set position = 5 where id = '6e4dd65f-9f2a-53b0-af6e-c2e45abefe1c'; -- conociste 4->5
update public.forms set position = 2 where id = '250a4c57-0ebb-5965-b85e-44f613945856'; -- venir 3->2
update public.forms set position = 3 where id = 'b925be67-772d-5a2b-a48d-14de67554e75'; -- vení 2->3
update public.forms set position = 2 where id = 'c9cbc3ba-7859-5fcb-ab53-ca176bb3f5b5'; -- cargar 4->2
update public.forms set position = 3 where id = '0c36052e-5fd6-5fc1-8c18-8e0904d6b425'; -- cargo 2->3
update public.forms set position = 4 where id = '8174c46b-5d5f-5306-9fa6-0922f1a72ada'; -- cargás 3->4
update public.forms set position = 1 where id = '454192d4-9ddf-529b-9842-37997c8f4f8d'; -- llamar 4->1
update public.forms set position = 2 where id = '926532fe-1930-5fed-9eeb-104f14a0d8f1'; -- llamo 1->2
update public.forms set position = 3 where id = '7122213f-274b-58fa-bedb-5cae70fd8c88'; -- llamás 2->3
update public.forms set position = 4 where id = 'bd2667ff-84fb-57d4-b9d0-b65c819f4aa8'; -- llama 3->4
update public.forms set position = 1 where id = '94332f93-1064-506e-a4bf-77b3e333d7d9'; -- pagar 4->1
update public.forms set position = 2 where id = '35f4d814-766f-5cdf-a34f-4c33d7f1c2b1'; -- pago 1->2
update public.forms set position = 3 where id = '75bb1592-4893-55e8-a181-93b950981b6f'; -- pagás 2->3
update public.forms set position = 4 where id = '26a5a8cd-b1c6-5140-b6c6-cf2804f5047f'; -- paga 3->4
update public.forms set position = 5 where id = '1b349bc2-5895-5047-a40c-f0d4da1bd12c'; -- comprar 8->5
update public.forms set position = 6 where id = '3a347cba-05b1-519a-9254-30a4ec4641c6'; -- compro 5->6
update public.forms set position = 7 where id = 'c5a24754-2153-52f9-ba79-d1db87b24cca'; -- comprás 6->7
update public.forms set position = 8 where id = 'eb699f31-d940-50a3-b9cf-1b9d57330d42'; -- compra 7->8
update public.forms set position = 1 where id = '5645fadc-eabf-55dc-a13a-2cc9425d00ef'; -- lavar 3->1
update public.forms set position = 2 where id = '4b63c62f-85e0-5b56-a4ce-c35eb516690a'; -- lavo 1->2
update public.forms set position = 3 where id = '6bc5d1cb-5266-5b2c-8a07-dfdc2f9aa15e'; -- lavás 2->3
update public.forms set position = 1 where id = '1d6fe6d1-fb6c-5966-9728-a0546176dfe6'; -- limpiar 3->1
update public.forms set position = 2 where id = 'e6c15d68-8ed4-5ffd-9b44-46e616d97712'; -- limpio 1->2
update public.forms set position = 3 where id = '3a852cc7-bfea-5e3e-a3da-f1273809e44e'; -- limpiás 2->3
update public.forms set position = 6 where id = 'b4d5fdb1-75e6-5685-8270-8351ea23daee'; -- ordenar 7->6
update public.forms set position = 7 where id = 'adc6d2b9-2656-5a6c-bb18-19ceaa3ccc79'; -- ordeno 6->7
update public.forms set position = 1 where id = '09c7e4c4-61e3-5f3d-8e02-9e725eadeebe'; -- festejar 2->1
update public.forms set position = 2 where id = 'a8bc0074-f2d0-532b-9701-8cdb97e824b7'; -- festejamos 1->2
update public.forms set position = 1 where id = '17cb9b91-2a41-572b-bc79-692a91e04b04'; -- juntarnos 3->1
update public.forms set position = 2 where id = '9ba0a3e7-6210-58bd-af1a-8df0624f360c'; -- nos juntábamos 1->2
update public.forms set position = 3 where id = '36887f5e-577a-5ab9-aeaf-1537ce8b3a6b'; -- juntábamos 2->3
update public.forms set position = 8 where id = '1548ad50-02d3-54ae-b349-b5a6962d83c0'; -- cumplir 9->8
update public.forms set position = 9 where id = 'f05aae0e-1a56-5e92-94a1-4db41ee1230b'; -- cumplió 8->9
update public.forms set position = 1 where id = '260bb194-e27d-545a-9cd3-951953d72831'; -- manejar 3->1
update public.forms set position = 2 where id = '57b382b9-ae8c-5cb7-a04b-454c1a37bfcb'; -- manejo 1->2
update public.forms set position = 3 where id = '4c011e6f-9575-5eca-a097-a176b3a68c23'; -- manejás 2->3
update public.forms set position = 1 where id = '58cf5022-cc59-54a6-9f79-b467b8fd98dc'; -- saludar 2->1
update public.forms set position = 2 where id = '61028a86-bd53-567e-b6b9-af295c78200e'; -- saluda 1->2
update public.forms set position = 5 where id = 'c0da2895-a85b-5348-a537-9dc7126feca8'; -- empezar 9->5
update public.forms set position = 6 where id = '7851009d-6999-5910-832c-0304a40bb079'; -- empiezo 5->6
update public.forms set position = 7 where id = '7505dd35-d79c-5111-8045-3c76b5093a38'; -- empezás 6->7
update public.forms set position = 8 where id = '7f3d29d2-875a-5eb5-905a-9a1df12eb19b'; -- empieza 7->8
update public.forms set position = 9 where id = '40b6c332-cd41-54f6-b500-81828dc8c4dc'; -- empiezan 8->9
update public.forms set position = 4 where id = '630745ed-7e16-5a43-9895-a801d86382dc'; -- ahorrar 5->4
update public.forms set position = 5 where id = 'b5913838-d632-543d-925a-387335ce5034'; -- ahorro 4->5
update public.forms set position = 1 where id = '318beb64-4395-522a-97e6-ffc6cbe9d752'; -- volver 4->1
update public.forms set position = 2 where id = '0985d8bd-3748-5a75-a0ad-f39ec14dc8cf'; -- vuelvo 1->2
update public.forms set position = 3 where id = '560dee08-6e15-530d-b57b-4d80de14374f'; -- volvés 2->3
update public.forms set position = 4 where id = '5cee4979-af12-50bd-b4d5-1bc687a72d5d'; -- vuelve 3->4
update public.forms set position = 9 where id = 'fbc5d133-8d7d-5e32-869d-a1f28a78962b'; -- esperar 11->9
update public.forms set position = 10 where id = 'ad84274c-ee70-5250-84b1-c28cdca73307'; -- esperá 9->10
update public.forms set position = 11 where id = '84f32356-29ba-5c79-945e-877a823ea534'; -- esperame 10->11
update public.forms set position = 1 where id = 'c6dc5176-6a91-5309-b0d1-e3d53a5d569d'; -- lograr 2->1
update public.forms set position = 2 where id = '4501a7d6-13c7-5b41-8a05-4aaeae68296d'; -- lograste 1->2
update public.forms set position = 6 where id = 'b00f2aeb-8fb2-5aeb-8200-2aca42b5bd3c'; -- entrar 8->6
update public.forms set position = 7 where id = '31062869-0ff7-51e9-b46b-e5e479f69a9b'; -- entré 6->7
update public.forms set position = 8 where id = '1073f97a-6257-53d9-8352-466f7d4b7569'; -- entró 7->8
update public.forms set position = 1 where id = '4d95dc7c-64cc-560d-83ff-0c1c41bd22b7'; -- llegar 3->1
update public.forms set position = 2 where id = '8f9dc959-b527-58cb-938b-204ca635388c'; -- llegás 1->2
update public.forms set position = 3 where id = '86c70cce-3e45-56a0-8f81-2e370712224e'; -- llega 2->3
update public.forms set position = 6 where id = '49c6b8bc-0fd4-5f58-97bc-9672955fcda0'; -- decir 7->6
update public.forms set position = 7 where id = '3e2e231e-bad3-5a47-92ef-b243c1fe5376'; -- decime 6->7
update public.forms set position = 8 where id = 'e8539465-151c-520c-8ee6-b929f8f747a6'; -- anotarme 9->8
update public.forms set position = 9 where id = '62e4dd5f-12ca-5ada-9075-9c4a071fd5c4'; -- me anoté 8->9
update public.forms set position = 5 where id = 'ad8822fd-a42e-55d1-8506-2f8a352643f9'; -- pintar 6->5
update public.forms set position = 6 where id = '5e4a7ecf-0e62-55c6-a034-135e6cec8969'; -- pintamos 5->6
update public.forms set position = 9 where id = '0ecf9450-df66-5944-bb42-652e3bd9c801'; -- aclarar 10->9
update public.forms set position = 10 where id = '962a3b44-0606-5ed4-a327-246bc926d799'; -- aclaró 9->10
update public.forms set position = 3 where id = '496ee5b9-6712-54b0-8d1a-a4861a8af291'; -- alquilar 4->3
update public.forms set position = 4 where id = '526a4353-6f03-509e-b429-17d26d0c08da'; -- alquilaba 3->4
update public.forms set position = 8 where id = 'a014bd76-ee34-5416-b3dc-6c80777c63a0'; -- encargar 9->8
update public.forms set position = 9 where id = '3f27cceb-2b2e-5793-bc75-f1e37139bf02'; -- encargó 8->9
update public.forms set position = 10 where id = '2a74c65e-040c-5417-b03b-267fbbfcc2d0'; -- aparecer 11->10
update public.forms set position = 11 where id = 'e86babdb-7eef-556f-b3dd-0140478fb1c8'; -- apareció 10->11
update public.forms set position = 3 where id = 'b86ee0d6-8eb8-56e1-a1b9-890b9360882b'; -- regar 4->3
update public.forms set position = 4 where id = 'cf33d3e5-698b-5d13-9640-5f178b2375ec'; -- me regás 3->4
update public.forms set position = 1 where id = '1f9b2710-b71a-5e4e-b4a1-814a7d0a9d03'; -- pasar 2->1
update public.forms set position = 2 where id = '638c8479-3d09-5c90-bec4-244878d1df86'; -- pasá 1->2
update public.forms set position = 4 where id = '3674cf57-4553-547c-a597-465a1224ee49'; -- cruzar 5->4
update public.forms set position = 5 where id = '5cd3441f-8db9-5357-98cc-95d8536062cc'; -- cruzá 4->5
update public.forms set position = 1 where id = 'd1e638fb-ddd5-5b09-a8c5-474488ed5615'; -- dormir 3->1
update public.forms set position = 2 where id = '10397a81-0a56-567e-9ff0-d67a97c34e0f'; -- duermo 1->2
update public.forms set position = 3 where id = '94996d66-4344-5d0c-843f-a7db5efbd4cf'; -- dormís 2->3
update public.forms set position = 2 where id = '0bb916c1-fbb0-5b26-85d7-bb81f2c8b790'; -- renegar 3->2
update public.forms set position = 3 where id = '9f33b2e6-0f30-5f1e-9158-77c1683e0293'; -- reniego 2->3
update public.forms set position = 1 where id = '99ef5c68-1fe1-5f4d-ab9e-b8473b5aae12'; -- aplaudir 2->1
update public.forms set position = 2 where id = 'be812d1b-4a7c-53bb-a5b3-8d45d8b88504'; -- aplaude 1->2
update public.forms set position = 7 where id = 'cd8e475f-e3b9-5501-9737-a5f0db79f9bc'; -- agarrar 9->7
update public.forms set position = 8 where id = 'dc1dae5b-d242-51e1-9f71-0256358a9651'; -- agarren 7->8
update public.forms set position = 9 where id = 'c23b310b-3105-5924-ad70-f7992099ae5e'; -- agarrá 8->9
update public.forms set position = 1 where id = '949f9d7b-b641-573a-99d9-755840daf3ae'; -- aguantar 2->1
update public.forms set position = 2 where id = 'b4abdc00-6d1e-5727-b25f-527536fb6772'; -- aguanto 1->2
update public.forms set position = 3 where id = '71a80d44-1262-527b-b919-c01457db152d'; -- reconocer 4->3
update public.forms set position = 4 where id = '297be3b1-a0cb-5072-b504-c353c1b906fe'; -- reconozco 3->4
update public.forms set position = 5 where id = '8f1d4368-a05c-59ec-9793-86791026af56'; -- disfrutar 6->5
update public.forms set position = 6 where id = 'db845829-6d5a-5f28-825a-c57088d3b0c4'; -- disfrutes 5->6
update public.forms set position = 3 where id = 'a5f077c0-57d3-5af7-be08-8faa75f6f5a6'; -- terminar 5->3
update public.forms set position = 4 where id = '3b1d99e6-e55b-5d91-908f-245a6bfc0fc8'; -- termino 3->4
update public.forms set position = 5 where id = 'aadf3d4b-32ec-5489-830a-626383a81625'; -- terminás 4->5
-- 2. lesson_slots: the infinitive's teach + its own drills move in front of its first sibling.
update public.lesson_slots set ordinal = ordinal + 1000 where lesson_id in ('75b54b14-369a-56b7-b57e-11ff991553f7', 'a76d8ee3-0419-55d8-9967-9036894d28d9', 'dd4099d9-0edd-5339-b22f-454c5276797f', '556f7fe7-f63f-5631-a1c5-5ec78ddf6ee0', '40af29f4-3540-54a5-bc3f-e77a24a4e3f3', '18ef4107-cfe6-5ec7-abe9-23d1b27ea16d', '80b35cb7-96af-56c5-ba8b-c54a0d07d13b', '19cbbf1e-5415-5497-9713-9307e8a14485', '9e04c03b-75c2-5933-b9c1-1ff044c94174', 'c464c3a6-5a73-5906-af7c-487ffcb3ef79', 'af15f1a2-3e51-50d9-83f6-506c0db52fe1', '3c6432ce-e0cd-54e0-8c56-d90b61cbcfc0', '38442d6e-aeac-50d8-b6d8-6a58b71ea02d', 'e2ec5305-45ec-5195-8c2f-3ec608cda7f4', 'eb1ec986-e0ef-549b-b2a5-c7fee30071ad', 'd885ee06-8b99-5a68-a2af-66d55fbc5cab', '6e7c6d01-3592-5358-aaae-d6ebef4c4bbd', '7f08f2ce-0e5e-50c1-949c-c28e8385754e', '5a7e8b17-3eeb-5ee5-965a-54aecb5cd15d', 'ed3445b3-3af3-54d0-ac71-a292a4c713b2', '92f16d04-a17a-5b6b-a29b-27c671c253cc', '85a3a2aa-a41f-5cca-a4d3-b63bc01ae815', '61a33fe0-12f4-5acc-8a68-106d6f7c7795', '60481c8a-d759-5082-847a-828eb761473a', '603c27c1-9024-591c-9d28-c4fd594499f4', '1bb37634-d555-5d09-a314-b49c839a0bba', '161f5fbe-da5c-5f9d-bec9-12258fbc5230', '26bf6bff-0413-5051-80a1-48fcb920c9a1', '1be171be-1f63-5129-bd50-e5bf4071e124', '2d617cc3-9be4-575a-ad6b-32ce23857e52', '79986927-652a-5977-9095-5d7bceb55b59', 'ebe194be-ff43-5917-90b2-b64bccb104a0', '4a1a9399-3cdc-5fb8-a802-3d78ded20b2b', '387e01fb-d160-5457-922a-bcf213303a15', '0128e3eb-14ca-51a8-b596-5c0326329c19', '760551ef-a245-56fb-94b8-b3d603237dad', '99dea4f6-087a-5c1e-b784-be545c9e3a02', '768f20f3-fa77-5561-8e42-4295046470cc', 'f2e6eb44-d02e-5c70-bc17-8ff29e1c7124', '180692f6-87e4-58eb-ab0c-870025daee55', '0f1a69a8-6fd6-50a2-a1e9-36db37df84b7');
update public.lesson_slots set ordinal = 1 where id = 'd22b6d81-2581-463a-9158-07f03085ee50';
update public.lesson_slots set ordinal = 2 where id = '68a24491-3aaa-4b21-a126-367505a7be02';
update public.lesson_slots set ordinal = 3 where id = '0f0eab1a-5940-4343-b201-867651108f97';
update public.lesson_slots set ordinal = 4 where id = '725ef34b-cd02-45c6-ad33-452a0e852ce7';
update public.lesson_slots set ordinal = 7 where id = '34aad7f5-26b5-4a67-ac1a-bddebbbfbe81';
update public.lesson_slots set ordinal = 8 where id = '0d2215ba-9719-4593-98fd-001cda372d32';
update public.lesson_slots set ordinal = 9 where id = '171223e0-5574-4746-ab8e-45dd798b895d';
update public.lesson_slots set ordinal = 5 where id = 'c3d19ba7-5de4-417e-9e8a-07ca787cb67e';
update public.lesson_slots set ordinal = 6 where id = '6ebabe01-a363-4309-97ed-5b61dfd06b6a';
update public.lesson_slots set ordinal = 10 where id = 'e98c402b-b0cb-42e6-a196-f29b9a19ceb8';
update public.lesson_slots set ordinal = 11 where id = '92c984c0-38a7-45d0-af0d-505498220865';
update public.lesson_slots set ordinal = 12 where id = '4c30fe7b-98e4-44f0-9293-2599efb4a141';
update public.lesson_slots set ordinal = 13 where id = 'e31f83d6-af7c-4f0b-a89c-d7bea1e772b3';
update public.lesson_slots set ordinal = 1 where id = '2aab378d-10bc-4b17-9bf1-892e440a3c9c';
update public.lesson_slots set ordinal = 2 where id = '76c741f6-2081-48ed-8e13-0ec19ac5b337';
update public.lesson_slots set ordinal = 6 where id = '24c4abf9-b23c-40cd-af32-74133a62ba2c';
update public.lesson_slots set ordinal = 7 where id = '9cdac0dd-692f-4845-a220-1c115612961e';
update public.lesson_slots set ordinal = 8 where id = 'c55397bc-51f8-421b-ae3c-7154cc465ee7';
update public.lesson_slots set ordinal = 9 where id = 'e92e400c-4d46-49a4-8f9b-1ccd0a852415';
update public.lesson_slots set ordinal = 3 where id = 'ca097bc5-5cd1-452e-89cc-513e8345865b';
update public.lesson_slots set ordinal = 4 where id = '46002c1c-92c7-4a8e-a451-ef8b3649a76e';
update public.lesson_slots set ordinal = 5 where id = '428a201b-815e-4a4d-98e4-d5135b62a4e2';
update public.lesson_slots set ordinal = 10 where id = 'f03db7c8-4d6c-4167-8233-e203661cd900';
update public.lesson_slots set ordinal = 11 where id = '37d98f8b-363f-4268-8f54-bc4479471823';
update public.lesson_slots set ordinal = 12 where id = '087cf9e7-3b72-46db-89e6-bce0cc6d036d';
update public.lesson_slots set ordinal = 13 where id = '2330af2b-9635-4128-ae4e-9327ff718555';
update public.lesson_slots set ordinal = 14 where id = 'a6042f20-0d4d-4740-9a31-362895c7d77e';
update public.lesson_slots set ordinal = 1 where id = 'adfaad0d-1f3c-4499-9b67-d23f2a59d8a4';
update public.lesson_slots set ordinal = 4 where id = '60b0ad2e-986c-4914-b56d-d44528cf3028';
update public.lesson_slots set ordinal = 5 where id = 'b07912d9-e55c-4d69-bd5c-0f024b4a1f96';
update public.lesson_slots set ordinal = 6 where id = '3861c969-743b-49f8-ad74-921afd746edf';
update public.lesson_slots set ordinal = 7 where id = '60231d65-25af-4b20-a745-c73aac8ce459';
update public.lesson_slots set ordinal = 8 where id = 'ac5fcaa8-8bc5-4170-9c2c-170ea1dcd7f6';
update public.lesson_slots set ordinal = 9 where id = '68016239-a8f1-473e-8de4-78f9f5124ff2';
update public.lesson_slots set ordinal = 10 where id = 'b1ff32c3-e32d-41cb-ae00-21df68e9cc59';
update public.lesson_slots set ordinal = 11 where id = '711ccc36-2f7f-4a19-8c36-fc971c39def0';
update public.lesson_slots set ordinal = 12 where id = '216d1afe-fa77-4d04-80e5-90c416b15510';
update public.lesson_slots set ordinal = 2 where id = '57e88544-e492-4b2f-af3b-93c5fb492b81';
update public.lesson_slots set ordinal = 3 where id = '7b468014-a85c-4aee-b89d-745e5e4b0e8a';
update public.lesson_slots set ordinal = 13 where id = 'b5aca44f-2191-47b4-a1c9-48e08c475a5d';
update public.lesson_slots set ordinal = 14 where id = '36f67e8d-8806-4a1a-ad20-2ca465a51a42';
update public.lesson_slots set ordinal = 15 where id = 'b8901812-1cb9-44a1-98e6-11f343664fb9';
update public.lesson_slots set ordinal = 1 where id = '9f684295-3201-4b38-aab9-0d2ae1111174';
update public.lesson_slots set ordinal = 2 where id = 'de6d2f68-707b-4861-8d5b-66d79ae0cdb9';
update public.lesson_slots set ordinal = 3 where id = 'af91a07f-13d2-4f5e-9f4f-d3bf037899af';
update public.lesson_slots set ordinal = 4 where id = 'c90d7d28-9df0-4083-9415-c617af142e9f';
update public.lesson_slots set ordinal = 7 where id = 'b62c1d98-a7f6-482f-ac16-b89bb6e1464f';
update public.lesson_slots set ordinal = 8 where id = '21b8d0b7-882c-4b8a-b658-c8644675b893';
update public.lesson_slots set ordinal = 9 where id = '85149f2b-cde6-429b-b52b-788175230bd7';
update public.lesson_slots set ordinal = 5 where id = '1d7e43fe-0f5d-4698-bbc1-273fffa4b054';
update public.lesson_slots set ordinal = 6 where id = '8a94b3e9-62fb-4ff3-8270-6bcfe500cd20';
update public.lesson_slots set ordinal = 10 where id = '8299cd7f-396f-4ac7-b1db-be642fae0a46';
update public.lesson_slots set ordinal = 11 where id = '5323741e-22c4-4fdb-9ceb-6b63fd91361d';
update public.lesson_slots set ordinal = 12 where id = '4a5b6fbf-8c9f-4f77-b3de-6889e2c5d0ba';
update public.lesson_slots set ordinal = 13 where id = 'c99f5cb6-9663-4926-9dbb-1b516deec352';
update public.lesson_slots set ordinal = 1 where id = 'c4b63c5d-888a-48c7-b35a-2688fd87fe65';
update public.lesson_slots set ordinal = 4 where id = 'd5e6d67c-016c-43ed-ad69-3cb5bdcd36b1';
update public.lesson_slots set ordinal = 5 where id = 'ba341b83-914f-4923-9293-5b4ad709767c';
update public.lesson_slots set ordinal = 6 where id = '8829aec6-e58f-45db-a56d-83bb7136d82e';
update public.lesson_slots set ordinal = 7 where id = '215315de-6cbe-4933-8fa4-f1d25a06d6cc';
update public.lesson_slots set ordinal = 2 where id = '16d88cfe-8070-4856-bcef-d32e99d07c4b';
update public.lesson_slots set ordinal = 3 where id = 'efb55705-79b5-4690-8f6b-450f68e69229';
update public.lesson_slots set ordinal = 8 where id = 'ba0c73cb-79cc-48e4-87e0-07037a73e3e0';
update public.lesson_slots set ordinal = 9 where id = '4befd339-7319-4329-8d85-c62ea43d8e6a';
update public.lesson_slots set ordinal = 10 where id = '10b4ea60-b72f-4c88-ad25-ae07cf978a53';
update public.lesson_slots set ordinal = 11 where id = '516b06ee-a43c-4b32-b324-8ab5d857ea7a';
update public.lesson_slots set ordinal = 12 where id = 'fb843b7a-cc93-48e0-b427-5971fbfffe30';
update public.lesson_slots set ordinal = 13 where id = '11d4645e-f75b-420a-a972-1d48a54a0a81';
update public.lesson_slots set ordinal = 1 where id = '73105dd7-ed98-4083-9c40-f159cba32c06';
update public.lesson_slots set ordinal = 2 where id = 'a67ab237-144f-4f5f-b2fd-3b8ac5553cd5';
update public.lesson_slots set ordinal = 5 where id = 'b0a6110f-ca01-4250-9a6c-bb156b941154';
update public.lesson_slots set ordinal = 6 where id = '7707cc43-611e-4a99-ac83-269e6f688682';
update public.lesson_slots set ordinal = 7 where id = '03cb49db-39b3-45d9-ac07-8ae305053609';
update public.lesson_slots set ordinal = 8 where id = 'cf3ccf6b-1ce2-4251-94ee-321fe9bb0592';
update public.lesson_slots set ordinal = 9 where id = '146b4ec4-d17d-4ff0-a9a3-d63c8bb4129d';
update public.lesson_slots set ordinal = 10 where id = 'f27043ff-89cc-42ae-8923-c04c9a4fea8e';
update public.lesson_slots set ordinal = 3 where id = '3c0eabd7-0d4e-459a-bdb9-420c2537ebf6';
update public.lesson_slots set ordinal = 4 where id = '1e94227f-b2a2-4e6a-8bb9-946d4808b710';
update public.lesson_slots set ordinal = 11 where id = '8f753ce2-d07c-4230-9f7c-690cd4f3fd28';
update public.lesson_slots set ordinal = 12 where id = '6fe8cc91-e966-4299-998c-22f2e403917f';
update public.lesson_slots set ordinal = 13 where id = '52ef72f8-6257-4fb5-b180-faa25b43175d';
update public.lesson_slots set ordinal = 14 where id = 'edf64399-fafc-4f88-b092-e5e2c2b2454e';
update public.lesson_slots set ordinal = 15 where id = 'cb606b88-813b-4d1c-a840-9757e67cd291';
update public.lesson_slots set ordinal = 16 where id = '28e7f0c6-9a96-4b49-8587-089ca4b0e0ee';
update public.lesson_slots set ordinal = 1 where id = 'f0a66b68-4c06-4218-a91e-205dc4f643c1';
update public.lesson_slots set ordinal = 4 where id = '188fcd55-1eea-47f5-bd06-d89d5772ec9d';
update public.lesson_slots set ordinal = 5 where id = 'e1afbc39-3529-4de5-b516-653a281a3ddc';
update public.lesson_slots set ordinal = 6 where id = '419b907b-c8e1-476b-a8a3-347df3cd13e1';
update public.lesson_slots set ordinal = 7 where id = '630964bc-7df1-4c81-95c8-16327bf7394f';
update public.lesson_slots set ordinal = 8 where id = '85dea47d-eb03-4569-b23e-89669aa9f739';
update public.lesson_slots set ordinal = 9 where id = 'e6e32572-4255-4282-b56f-a7256897c2c3';
update public.lesson_slots set ordinal = 10 where id = 'eb798687-d122-4cdd-8f15-9cf4344d26cd';
update public.lesson_slots set ordinal = 2 where id = 'cced7cb6-33d7-42df-81f2-7da5fe420a0a';
update public.lesson_slots set ordinal = 3 where id = '66c221cc-3aaa-4586-bf2c-138e260815a4';
update public.lesson_slots set ordinal = 11 where id = '399bd285-f1ef-4078-9762-46f1372badc3';
update public.lesson_slots set ordinal = 12 where id = '2f92976c-0ae1-42b9-ac44-746695ac5282';
update public.lesson_slots set ordinal = 13 where id = '1b18bda6-669f-45ec-816f-4950b8a5d5c9';
update public.lesson_slots set ordinal = 14 where id = 'f7d62165-a2c6-4759-b0fc-fb4ae6c15acf';
update public.lesson_slots set ordinal = 15 where id = '0b8b3797-c34f-4440-85ff-e00b839b36cc';
update public.lesson_slots set ordinal = 3 where id = 'a76e5e29-c6c7-4dbc-9f25-c207897353a7';
update public.lesson_slots set ordinal = 4 where id = '06299bf3-f81a-4557-9429-c7d308e52584';
update public.lesson_slots set ordinal = 5 where id = '85d4ca32-d5a3-435d-af60-54235daf722e';
update public.lesson_slots set ordinal = 6 where id = '26ec8bdb-6402-48c2-959a-cd3dbbbd0c77';
update public.lesson_slots set ordinal = 7 where id = '74e955f5-2826-4208-9fd5-4f3ca95bfc23';
update public.lesson_slots set ordinal = 8 where id = '53efec94-a3f1-48a1-b78d-a8ded9d7cc3c';
update public.lesson_slots set ordinal = 9 where id = '1a1183be-df7c-426f-9319-e2e336ff9f95';
update public.lesson_slots set ordinal = 1 where id = '6ce4c015-7c76-468a-a1a5-9cad50a079b6';
update public.lesson_slots set ordinal = 2 where id = '47450bd8-3523-4a76-81ee-f120338478d0';
update public.lesson_slots set ordinal = 10 where id = 'dd5e6c18-4f93-4598-8cdd-a23c14b75b1f';
update public.lesson_slots set ordinal = 11 where id = 'e4ae8883-e0e9-4cfd-b5d3-8fee85520138';
update public.lesson_slots set ordinal = 12 where id = '4bb8d9b0-8e32-4c55-98b3-1c2588da002d';
update public.lesson_slots set ordinal = 13 where id = 'f0c9e27b-d799-40e8-aeba-4611f3526650';
update public.lesson_slots set ordinal = 14 where id = 'fdf9851c-3f50-4786-92ed-f47d7daf71b2';
update public.lesson_slots set ordinal = 1 where id = 'e0a907fa-e69d-4742-896f-297db41ae1c0';
update public.lesson_slots set ordinal = 4 where id = 'af65bcad-5e97-4058-a5cb-57ce3b59992f';
update public.lesson_slots set ordinal = 5 where id = 'c7304301-0648-4686-b696-0befc4b0ab90';
update public.lesson_slots set ordinal = 6 where id = '581f94fa-a393-4aec-bbc3-75907127aaf0';
update public.lesson_slots set ordinal = 7 where id = 'ee362bb1-2cda-4135-ab63-f780a4aa2925';
update public.lesson_slots set ordinal = 8 where id = '2862ea86-0587-4a55-92ba-6e4d4de5ee26';
update public.lesson_slots set ordinal = 2 where id = '59c133ad-0b74-494d-97d5-9cc5c851dc2f';
update public.lesson_slots set ordinal = 3 where id = '5fc43f2f-9305-4634-9013-3804e134e578';
update public.lesson_slots set ordinal = 9 where id = '3081d18b-9b8f-4091-9b9d-ab13e1ee5580';
update public.lesson_slots set ordinal = 10 where id = '587c49e1-2c05-4fa2-bdd4-92d8b436caf8';
update public.lesson_slots set ordinal = 11 where id = '1aad0f7b-d770-4576-a1b4-4e815ebf2650';
update public.lesson_slots set ordinal = 12 where id = '39126747-fadd-4c42-917c-07a3b2bfc96f';
update public.lesson_slots set ordinal = 13 where id = '835bafc3-b702-43e6-91ac-90118ff2e25b';
update public.lesson_slots set ordinal = 14 where id = '56e9ac01-561d-4acd-8e4e-f43a7be7bd0b';
update public.lesson_slots set ordinal = 1 where id = 'cf5c2e60-5408-462a-9469-fe1214881ef7';
update public.lesson_slots set ordinal = 4 where id = 'c4909e35-e51c-4146-ad68-a0ab5ab74a38';
update public.lesson_slots set ordinal = 5 where id = 'e74a8e84-2ef9-475d-ad70-06f8917f03fe';
update public.lesson_slots set ordinal = 6 where id = '1d07c422-ec52-4743-b134-dd2d262d012f';
update public.lesson_slots set ordinal = 7 where id = '3279f299-fd9e-43e6-adcd-1897834bf208';
update public.lesson_slots set ordinal = 8 where id = '82f551fa-b11e-4925-9f7c-cca3cbb56d74';
update public.lesson_slots set ordinal = 2 where id = '83cf04ed-f383-4c7b-befe-2c0869916542';
update public.lesson_slots set ordinal = 3 where id = '9bfa4607-5426-483a-96eb-8bc58eeda8c2';
update public.lesson_slots set ordinal = 9 where id = '4e03e153-e1b5-4bb9-8249-f788dbbe0691';
update public.lesson_slots set ordinal = 10 where id = '06915a11-afef-4115-9337-0b06c046653f';
update public.lesson_slots set ordinal = 11 where id = 'bd7f404b-f1ee-4d9e-a6c4-fdec879870b3';
update public.lesson_slots set ordinal = 12 where id = '0452ff7f-01be-4ee9-b3ac-d068448ab6e2';
update public.lesson_slots set ordinal = 13 where id = '78bef977-5e77-4304-ba97-a59aa926819d';
update public.lesson_slots set ordinal = 14 where id = 'fbb9c563-766d-4519-80b3-e5b3f4bb9add';
update public.lesson_slots set ordinal = 1 where id = '4f74a910-32c1-4d0a-ac17-7703cbdd4ba5';
update public.lesson_slots set ordinal = 4 where id = '96aab45c-ce6e-4e50-bd35-cc2d2cb91e16';
update public.lesson_slots set ordinal = 5 where id = '865ccf2c-ae2d-46ab-a7c5-9989595a57db';
update public.lesson_slots set ordinal = 6 where id = '18069c28-77f9-49d6-ac00-37477d844882';
update public.lesson_slots set ordinal = 2 where id = 'ff50f1e7-3807-4e74-8e93-4b928b6c8ed1';
update public.lesson_slots set ordinal = 3 where id = '156ab8bb-0926-4272-9c1a-056be334ad63';
update public.lesson_slots set ordinal = 7 where id = '7a06ce87-46ea-4843-bf2c-55f2971711a3';
update public.lesson_slots set ordinal = 8 where id = 'c791da36-0473-431f-8fb7-6782f52983e3';
update public.lesson_slots set ordinal = 9 where id = '0e4f207c-57c3-4540-a915-90fe4805ca14';
update public.lesson_slots set ordinal = 10 where id = '15a00290-184f-43d7-8e23-202b68cb00e9';
update public.lesson_slots set ordinal = 11 where id = 'ec76ae23-f6b4-4b77-9509-320ad1481383';
update public.lesson_slots set ordinal = 12 where id = '54d93cb2-3c93-4697-8c44-6bd2aefc8c7e';
update public.lesson_slots set ordinal = 13 where id = 'bdecc82c-9aac-480f-a023-74366206460b';
update public.lesson_slots set ordinal = 1 where id = 'ac63777c-eb4e-4ce0-8984-5e0b138645cf';
update public.lesson_slots set ordinal = 4 where id = '6104baca-3442-446a-8caf-d4d0e39c7e5c';
update public.lesson_slots set ordinal = 5 where id = 'b1020292-84b6-4fd2-8a94-b367e2703450';
update public.lesson_slots set ordinal = 6 where id = '8a394f42-aaa1-495f-b65d-23e77d61ee61';
update public.lesson_slots set ordinal = 2 where id = '6d970689-8a8f-4e16-9f05-09b945ff2dcd';
update public.lesson_slots set ordinal = 3 where id = '792e232d-792f-4522-9df7-fc961fcd1333';
update public.lesson_slots set ordinal = 7 where id = '9a2ba329-b8f9-4b85-b9ba-91138b137b0d';
update public.lesson_slots set ordinal = 8 where id = '9cab061c-1d7d-49de-9ce3-2890cddecb3e';
update public.lesson_slots set ordinal = 9 where id = '80b1ae09-3dba-4957-b419-e8da246a2d99';
update public.lesson_slots set ordinal = 10 where id = 'd4a89ad8-8a73-4a7f-bfb3-20f400e06645';
update public.lesson_slots set ordinal = 11 where id = '9b79ba67-e126-429a-a336-da5348629f9e';
update public.lesson_slots set ordinal = 12 where id = '291ba567-cc16-414a-bd3e-3ec020f11a59';
update public.lesson_slots set ordinal = 13 where id = 'a087773d-f7b4-43d0-9096-d1f23da52762';
update public.lesson_slots set ordinal = 1 where id = '2ce00b0b-2d3f-409f-b083-bfd52099e75c';
update public.lesson_slots set ordinal = 4 where id = 'f92d4d42-4a28-4786-bd83-b878e5b14869';
update public.lesson_slots set ordinal = 5 where id = 'b3d77e5a-dc26-428e-aa7f-97fdcdb8493f';
update public.lesson_slots set ordinal = 2 where id = '40d38878-fcab-424e-a8c6-3a049ce95ff8';
update public.lesson_slots set ordinal = 3 where id = 'd924d535-4f7c-4e07-b3ad-15468594791d';
update public.lesson_slots set ordinal = 6 where id = '5d7081e3-9614-41e4-b011-23beb7e9b9b6';
update public.lesson_slots set ordinal = 7 where id = '36e8fa8a-d513-4dc6-ac2a-d14bb5b4a06d';
update public.lesson_slots set ordinal = 8 where id = '515b3109-1b78-4771-abf6-eb25fb2f7fbc';
update public.lesson_slots set ordinal = 9 where id = 'b2f28b1d-bb64-4287-ad90-ef60fa699dab';
update public.lesson_slots set ordinal = 10 where id = '13d3f577-c831-4837-8665-ff22b1a3eea4';
update public.lesson_slots set ordinal = 11 where id = '39b5d593-1945-475d-b1d1-cb4c995fe216';
update public.lesson_slots set ordinal = 12 where id = '5cbf1c59-e683-41f6-ab49-716dfbb2e0a6';
update public.lesson_slots set ordinal = 13 where id = '37d8d96a-357c-4c4b-9760-ba3b0ffa5d40';
update public.lesson_slots set ordinal = 14 where id = '99e0f636-41ca-4d27-9cda-359e32569f00';
update public.lesson_slots set ordinal = 15 where id = 'c53ad959-6c8a-426e-9d9f-426cfad7bb22';
update public.lesson_slots set ordinal = 1 where id = '64d401cf-17dd-4c14-b008-7f5905d04d51';
update public.lesson_slots set ordinal = 2 where id = '37fe93d4-0ded-45d6-8e5b-b73674443554';
update public.lesson_slots set ordinal = 3 where id = '7502b6c2-4150-42b8-995e-aef611197b73';
update public.lesson_slots set ordinal = 6 where id = 'c7726f27-6c5a-4f2c-adb9-c639249dc0aa';
update public.lesson_slots set ordinal = 7 where id = '49921a80-3c0d-4be4-9b00-fd2d26b6156b';
update public.lesson_slots set ordinal = 4 where id = '61e52c86-aa0f-4242-b26d-39badaacf7fc';
update public.lesson_slots set ordinal = 5 where id = 'cf78eebc-22d7-4ff5-a2f0-469c2893818a';
update public.lesson_slots set ordinal = 8 where id = '07395791-f3b5-4c8e-a9a2-e9698b39c9a6';
update public.lesson_slots set ordinal = 9 where id = 'a54d7d98-eada-4fe0-a48b-c376e8b1ea4e';
update public.lesson_slots set ordinal = 10 where id = '0963216e-e559-44da-985a-b6663357aa42';
update public.lesson_slots set ordinal = 11 where id = '33a93a0d-2040-499b-bbd7-8c4d13733597';
update public.lesson_slots set ordinal = 12 where id = 'b725b2e9-bdef-4ade-b451-96ec9462d416';
update public.lesson_slots set ordinal = 13 where id = '37037afd-d2f9-48dd-9062-ce9957b265dd';
update public.lesson_slots set ordinal = 14 where id = '023cad25-28bd-4c0b-aff9-9116e663d6d0';
update public.lesson_slots set ordinal = 3 where id = '38068a12-2f3c-4541-8bf8-4de95054ee31';
update public.lesson_slots set ordinal = 4 where id = 'ab6b987e-e6a8-4074-9964-f29d1bcbbbd8';
update public.lesson_slots set ordinal = 5 where id = '57e44b7e-4001-4ac6-8928-537c80987c1e';
update public.lesson_slots set ordinal = 6 where id = 'ddc289e4-9265-4d9f-b085-95def80e8ae9';
update public.lesson_slots set ordinal = 7 where id = '53945b9d-5b01-4242-b641-a985e3f0c37c';
update public.lesson_slots set ordinal = 1 where id = '19c40e89-e849-4a16-9498-aec8757b37c7';
update public.lesson_slots set ordinal = 2 where id = '898a9bb2-4c7b-41c7-8ff3-f73881741746';
update public.lesson_slots set ordinal = 8 where id = '28d28d69-0dc7-449b-8050-fd3fcc5b290d';
update public.lesson_slots set ordinal = 9 where id = 'a2dda0f1-655d-4878-97af-2dd7455cd8b5';
update public.lesson_slots set ordinal = 10 where id = '121ca8bc-149e-48e0-87ff-beeae77f4efb';
update public.lesson_slots set ordinal = 11 where id = '79d1432f-aeb4-4d2b-991a-c9c633887b5c';
update public.lesson_slots set ordinal = 12 where id = '8fd68888-54a7-4df8-af93-1ab74f45e012';
update public.lesson_slots set ordinal = 13 where id = 'a8269220-0e73-4df6-a9ec-a4537a154f37';
update public.lesson_slots set ordinal = 1 where id = '8a79e0fb-e592-4910-a9fa-9f31447f664e';
update public.lesson_slots set ordinal = 4 where id = '4d7852d8-0945-4f50-a614-e8fd000020b2';
update public.lesson_slots set ordinal = 5 where id = '062b4b18-89b2-4bb5-833b-9c780a220cd4';
update public.lesson_slots set ordinal = 6 where id = '5dbbba0b-2e13-4bbe-a02d-86f5f1d1ee01';
update public.lesson_slots set ordinal = 2 where id = 'a50eda2d-a1f1-4870-b297-1042b4323e75';
update public.lesson_slots set ordinal = 3 where id = '24c58b64-8796-4902-b641-9eb65935fea2';
update public.lesson_slots set ordinal = 7 where id = '6097b531-0b6d-4908-99a9-ec197ed985d5';
update public.lesson_slots set ordinal = 8 where id = '57a1ad8d-b815-49bd-941d-7b631c4b219e';
update public.lesson_slots set ordinal = 9 where id = 'ba778a11-de0e-4975-9ea6-33959ecacb5f';
update public.lesson_slots set ordinal = 10 where id = 'bb4cd770-0332-4a37-b0c9-41481a2bcbae';
update public.lesson_slots set ordinal = 11 where id = '7c9c4f71-a6e2-418b-ac64-2bcb3e76e848';
update public.lesson_slots set ordinal = 12 where id = '47b2e925-490a-4f6a-8bcb-a8627daf8e6d';
update public.lesson_slots set ordinal = 13 where id = 'b4fd6495-6fa5-49ee-a063-1a886998ff0d';
update public.lesson_slots set ordinal = 14 where id = 'ab533665-dded-4707-8253-6c61391d03fc';
update public.lesson_slots set ordinal = 3 where id = 'a279a3ec-99c7-42a4-9e3f-f1e1deb20276';
update public.lesson_slots set ordinal = 4 where id = 'd96f6c71-e7c7-47e7-810e-0c9d2bd602dd';
update public.lesson_slots set ordinal = 5 where id = '7340cc7e-6b91-4966-8043-fa730df4170d';
update public.lesson_slots set ordinal = 6 where id = '8e987d4b-fb19-4cee-a264-210427e9ff11';
update public.lesson_slots set ordinal = 7 where id = '549b09e2-4cfb-4ada-8c57-60b40c06055c';
update public.lesson_slots set ordinal = 8 where id = '62815f74-e349-4e4f-95f6-a2c99cfca07f';
update public.lesson_slots set ordinal = 9 where id = '6132d6df-fb06-426b-af06-461a11664c83';
update public.lesson_slots set ordinal = 10 where id = '022e5c4f-f921-4bed-865f-b00af998d047';
update public.lesson_slots set ordinal = 11 where id = '66ef6a2b-851e-47e2-aa23-8918ddfb66a3';
update public.lesson_slots set ordinal = 1 where id = '48f2208e-6cd8-4a51-83c8-0020bd5c66f9';
update public.lesson_slots set ordinal = 2 where id = 'b27cdef9-8b03-4cfc-806c-e7d26aa84ee0';
update public.lesson_slots set ordinal = 12 where id = '7d599c6f-2def-4ef8-96b2-01323574c9c5';
update public.lesson_slots set ordinal = 13 where id = '2eb13b96-b1cc-4952-8535-373bd571931b';
update public.lesson_slots set ordinal = 14 where id = '8b8c4653-98c0-4ee4-a724-e0da18768d81';
update public.lesson_slots set ordinal = 15 where id = 'a6f27263-9e50-411b-afbd-dad74c1e9583';
update public.lesson_slots set ordinal = 1 where id = 'b3689a1e-6922-4cb0-be82-cf7f5b137246';
update public.lesson_slots set ordinal = 4 where id = 'ead738ad-8a15-4dd5-aa3c-d8271e1b937d';
update public.lesson_slots set ordinal = 5 where id = '12ea51f8-4545-4507-87c5-90589e13d501';
update public.lesson_slots set ordinal = 6 where id = 'aaafa3a4-0d60-4cf9-ac40-c69123805765';
update public.lesson_slots set ordinal = 2 where id = '3e471ff6-6943-4dba-837e-0378fb773890';
update public.lesson_slots set ordinal = 3 where id = '4d10740e-a6ae-48b0-9ba5-e11def96059d';
update public.lesson_slots set ordinal = 7 where id = 'fe787db1-6f01-4f45-9f09-f60028935e88';
update public.lesson_slots set ordinal = 8 where id = '68dfa7b4-4b1b-4116-8dc0-9c121cee39c1';
update public.lesson_slots set ordinal = 9 where id = 'ba796402-98c1-4659-ad36-5605085d9752';
update public.lesson_slots set ordinal = 10 where id = 'dbfbfe82-df70-462f-9f4c-9f1a39bd6030';
update public.lesson_slots set ordinal = 11 where id = 'a1bf8228-f8ad-451b-9d44-12d269a426d2';
update public.lesson_slots set ordinal = 12 where id = '330cd256-7932-4213-a322-2a8669d83c8d';
update public.lesson_slots set ordinal = 13 where id = '5d259794-81a0-44ef-afd8-e65a5c70def1';
update public.lesson_slots set ordinal = 3 where id = 'b9f73d4e-d398-4298-a252-e0b97f726a74';
update public.lesson_slots set ordinal = 4 where id = '178efa06-b55d-414a-99aa-35f8fed9ba9f';
update public.lesson_slots set ordinal = 5 where id = 'c8966c17-f635-4864-888e-3168c10581be';
update public.lesson_slots set ordinal = 6 where id = '3c339de5-e233-4cbe-afc9-5ea75d805a43';
update public.lesson_slots set ordinal = 7 where id = 'f6d31623-bfbb-4425-94cc-30f06335a472';
update public.lesson_slots set ordinal = 8 where id = '97b5830b-f4b1-496e-82aa-edd59c101514';
update public.lesson_slots set ordinal = 9 where id = '02d0ee81-4061-45fb-ad22-bbe359ec9f11';
update public.lesson_slots set ordinal = 1 where id = '9c1d9347-cec0-4cb7-a2db-c1345294f170';
update public.lesson_slots set ordinal = 2 where id = 'f8fc5fe0-a6d7-4161-9b04-2471b1abd41c';
update public.lesson_slots set ordinal = 10 where id = '7e8127db-09af-4dcd-8005-b2d56c897dfe';
update public.lesson_slots set ordinal = 11 where id = 'c0932bc7-8d18-45da-9fef-0f1c200c8f86';
update public.lesson_slots set ordinal = 12 where id = 'd36701d5-843b-4022-b5a5-07a544a79215';
update public.lesson_slots set ordinal = 13 where id = '3b4efea3-19cc-4a5b-9c1e-3833c6ee78a8';
update public.lesson_slots set ordinal = 14 where id = '2b4e2f3e-4cab-4761-9641-506b9631ac83';
update public.lesson_slots set ordinal = 15 where id = '618f1caf-a241-4920-b204-cd3e39f4dfc3';
update public.lesson_slots set ordinal = 3 where id = '671b823c-963f-45a7-99b2-9382ecbdd426';
update public.lesson_slots set ordinal = 4 where id = '3f246a42-0321-400c-8f47-5cf1944623bf';
update public.lesson_slots set ordinal = 5 where id = 'bfe5b8cd-3e7f-42ea-9ba3-9fa21bba6ac1';
update public.lesson_slots set ordinal = 6 where id = 'bdcca910-cf40-455b-8bdb-c3658f1277d1';
update public.lesson_slots set ordinal = 7 where id = '5debce23-a137-4f97-adf7-9e7968db28b3';
update public.lesson_slots set ordinal = 1 where id = '0801a713-cd12-4624-977a-a27626151c37';
update public.lesson_slots set ordinal = 2 where id = '6f1d6191-21de-4a10-97c7-4d3904ca8e58';
update public.lesson_slots set ordinal = 8 where id = 'f8a0e62c-81ed-456e-8d8c-826c8aedfdc6';
update public.lesson_slots set ordinal = 9 where id = '35a5dd2c-07ce-4260-8aa8-357404ca8e50';
update public.lesson_slots set ordinal = 10 where id = '25fdda3b-e252-490d-9d85-d7af863a3be1';
update public.lesson_slots set ordinal = 11 where id = '7b0bebe3-8666-4ca4-8820-3be2970af401';
update public.lesson_slots set ordinal = 12 where id = '1c96a461-3db8-4c91-9fe6-cba3df08c2cf';
update public.lesson_slots set ordinal = 13 where id = 'ccf49442-3ed4-4e4f-a4d0-afde1239ade0';
update public.lesson_slots set ordinal = 1 where id = '167b918e-4411-4988-8b06-2554a129dc96';
update public.lesson_slots set ordinal = 4 where id = '3daf2d4b-0ed5-4d8f-9798-1e0981f605be';
update public.lesson_slots set ordinal = 5 where id = 'c0560d7a-324a-42e0-a05b-e166bcb35456';
update public.lesson_slots set ordinal = 6 where id = '9b1d6735-a43a-4e7f-b5dc-4d12bb7b20a6';
update public.lesson_slots set ordinal = 2 where id = 'f637f394-4d6f-46e7-b522-aac748922cd6';
update public.lesson_slots set ordinal = 3 where id = '9236efa2-52a1-4c2f-aaab-d51158e03fa8';
update public.lesson_slots set ordinal = 7 where id = '2f1b89fc-416a-4d6e-8ad8-20233193a7a4';
update public.lesson_slots set ordinal = 8 where id = '652ef2a5-22bc-4e93-8d47-5e5a1e5c6825';
update public.lesson_slots set ordinal = 9 where id = '8aa0dd04-dcce-440b-948d-153b616d82b5';
update public.lesson_slots set ordinal = 10 where id = 'fd547bce-f251-420b-b975-f07de678ef4f';
update public.lesson_slots set ordinal = 11 where id = '870a8e65-3fe2-47b0-86e1-45f0529d44c3';
update public.lesson_slots set ordinal = 12 where id = 'e2c650fe-db18-4903-a142-d1f2354e1127';
update public.lesson_slots set ordinal = 13 where id = '5cd95147-b7f1-48bf-9401-9ec6c0c8fe2a';
update public.lesson_slots set ordinal = 14 where id = '7994c4a6-0d81-4164-94f9-ad74041b4071';
update public.lesson_slots set ordinal = 1 where id = 'bd7e1cc6-42ab-45f6-b58e-a74d029400e2';
update public.lesson_slots set ordinal = 4 where id = 'f3c46182-5298-4712-b123-f8c8eb5fc021';
update public.lesson_slots set ordinal = 5 where id = '474a1aad-5b05-4cf8-afb7-8867b1cdcb82';
update public.lesson_slots set ordinal = 6 where id = '91a52a29-c210-4a09-bf5a-b21b43940b78';
update public.lesson_slots set ordinal = 7 where id = '949c9907-bda2-47dd-ac91-38897aca05db';
update public.lesson_slots set ordinal = 8 where id = 'c962fa58-430e-409a-913a-e9a2a27d3a7e';
update public.lesson_slots set ordinal = 2 where id = '6c3a2316-94e5-49df-996f-98b89d33477a';
update public.lesson_slots set ordinal = 3 where id = '818c0710-46ef-4da9-ab2d-08da5c8a5747';
update public.lesson_slots set ordinal = 9 where id = '7cee94a9-4015-4da3-91fc-baf0608bc44b';
update public.lesson_slots set ordinal = 10 where id = 'c5f25f17-a72a-4fac-bd9d-76f8ed307e4f';
update public.lesson_slots set ordinal = 11 where id = '7719beb5-4951-461d-8a4f-79544477abe9';
update public.lesson_slots set ordinal = 12 where id = '7280293d-3c46-49fd-b43d-a413a648d75b';
update public.lesson_slots set ordinal = 13 where id = '72923f18-b925-4c07-8f0f-45b7de4aec99';
update public.lesson_slots set ordinal = 14 where id = '498f621d-00a3-4d6f-8864-4b3753250217';
update public.lesson_slots set ordinal = 1 where id = 'a0ca1703-bfcc-46f7-aa14-99045d8a1877';
update public.lesson_slots set ordinal = 4 where id = '0dd5dedd-4451-4d7f-8ac0-4b00afa52715';
update public.lesson_slots set ordinal = 5 where id = 'fcfc054a-afed-48c2-b35e-c1cfca0b3b5c';
update public.lesson_slots set ordinal = 6 where id = '0db6bfba-c3bd-4ee8-b0da-c6943a14d737';
update public.lesson_slots set ordinal = 7 where id = 'c7268252-6323-4d91-84cd-19c4ca5de088';
update public.lesson_slots set ordinal = 2 where id = 'a7decaad-8e65-4b03-a128-9e9e5ec20d4a';
update public.lesson_slots set ordinal = 3 where id = 'a203d0aa-b497-40c8-99d8-87c2c2f167f4';
update public.lesson_slots set ordinal = 8 where id = '44f2eba1-e406-4c34-bd29-c3c48d7f3bc3';
update public.lesson_slots set ordinal = 9 where id = 'f97e3dd5-c1d6-479a-8ab6-abaab1a169ef';
update public.lesson_slots set ordinal = 10 where id = 'f1c9a028-cfbc-4ae8-adbf-3ac289aceb36';
update public.lesson_slots set ordinal = 11 where id = '83e9a429-abd3-4a66-aadb-20c1e796214a';
update public.lesson_slots set ordinal = 12 where id = 'a3d461d4-5c10-4811-83dc-4a68a3fe15ba';
update public.lesson_slots set ordinal = 13 where id = '6872f787-e0f9-4044-8261-14498e0b4f03';
update public.lesson_slots set ordinal = 14 where id = 'c8b3589a-7f91-4a4c-9c31-7fe124091107';
update public.lesson_slots set ordinal = 15 where id = '987a753b-2aa6-40d8-99f1-a53b9dc089cb';
update public.lesson_slots set ordinal = 16 where id = '6ef2cf5a-e4b0-468b-8b2b-d714b1ca3cd6';
update public.lesson_slots set ordinal = 1 where id = '4917d97e-e032-41e3-9f18-bd6a1fd43f7f';
update public.lesson_slots set ordinal = 2 where id = '5dd5f4c0-daed-4f8d-82c3-575bf375e30e';
update public.lesson_slots set ordinal = 5 where id = 'd37cb203-66c6-4b42-bfaf-a946b9177b0b';
update public.lesson_slots set ordinal = 6 where id = '30b22600-b2d2-4352-8358-668a7f1b3719';
update public.lesson_slots set ordinal = 7 where id = 'ecd2d676-b7bd-4d15-bb18-0ed7c423163e';
update public.lesson_slots set ordinal = 3 where id = '1e9f53b0-7bf2-435e-b0d3-a1a17dd95c49';
update public.lesson_slots set ordinal = 4 where id = '415f3e1c-4b62-4098-91e2-3acff488002c';
update public.lesson_slots set ordinal = 8 where id = '4dc92311-4b58-4faa-ab32-57d204a46b4b';
update public.lesson_slots set ordinal = 9 where id = 'dbd3e35f-f574-4e8f-9b60-03e2b1b2eff5';
update public.lesson_slots set ordinal = 10 where id = '3a5212b3-0b97-41a2-ba69-fc9e8b7e5f8b';
update public.lesson_slots set ordinal = 11 where id = '66f2745b-4628-4b1a-bee5-c2b5c72f09ff';
update public.lesson_slots set ordinal = 12 where id = '44ec167e-3496-4311-976a-ddc35b1f9d0e';
update public.lesson_slots set ordinal = 13 where id = 'e2e8c62f-e815-4335-933f-5e58378b9539';
update public.lesson_slots set ordinal = 1 where id = '7ead4218-1a13-40b1-bb94-c5e19a30455c';
update public.lesson_slots set ordinal = 2 where id = '34910c0b-8408-4c73-b692-cc5afbc3cf55';
update public.lesson_slots set ordinal = 3 where id = 'dd372a07-b34f-4791-98b5-2b1d673c5ea5';
update public.lesson_slots set ordinal = 6 where id = '5c92dd62-c8ba-402f-9541-0d0dbb7fca71';
update public.lesson_slots set ordinal = 7 where id = '8e5b9f00-3ca2-48a6-aa87-051e3cbd3972';
update public.lesson_slots set ordinal = 8 where id = 'fcc69c76-dc49-4943-bd40-83f9667bea04';
update public.lesson_slots set ordinal = 4 where id = 'e0afc903-2e2b-4e82-a81f-0af54af2cf5f';
update public.lesson_slots set ordinal = 5 where id = 'bf19f054-cee8-4ae7-b1d0-2e9c8eee5b69';
update public.lesson_slots set ordinal = 9 where id = '052ac1ec-fd00-48eb-9f90-9dbdfe049629';
update public.lesson_slots set ordinal = 10 where id = '672e9ffa-3977-412a-bb81-ddd93661d2ea';
update public.lesson_slots set ordinal = 11 where id = '90104c0f-9045-48f6-918c-85e4f2e9b466';
update public.lesson_slots set ordinal = 12 where id = '3f10efbc-e20d-4681-98ac-9c900384a971';
update public.lesson_slots set ordinal = 13 where id = '18d6631a-b4a2-4716-b689-d46c975f4305';
update public.lesson_slots set ordinal = 3 where id = '383fcd52-1e27-4671-93ee-ef1e17bffc5e';
update public.lesson_slots set ordinal = 4 where id = 'f97b03f8-0a40-4eec-b827-17fd9a9dd81e';
update public.lesson_slots set ordinal = 5 where id = '1b61200f-c987-4ccf-9925-e065ab3a5a93';
update public.lesson_slots set ordinal = 1 where id = '7a97480d-240b-47b8-b0a5-c4e7d5eddf84';
update public.lesson_slots set ordinal = 2 where id = '3567140c-ee3e-4aed-88e7-da7d2d708f47';
update public.lesson_slots set ordinal = 6 where id = '7a494dd1-2048-4e08-8503-e59f31932bae';
update public.lesson_slots set ordinal = 7 where id = 'dea45d36-ab6e-43cb-9e8c-e70ab0b8d1cc';
update public.lesson_slots set ordinal = 8 where id = 'bc2c3d9a-4a63-4b69-9957-ee747a9766cc';
update public.lesson_slots set ordinal = 9 where id = '8c2d2a76-b09c-4b4a-ab78-15fdc9fa2c9f';
update public.lesson_slots set ordinal = 10 where id = 'c27065c4-965d-436a-8f26-deee5768edde';
update public.lesson_slots set ordinal = 11 where id = '3e1c014c-8f43-41e9-9390-a6b1375922fa';
update public.lesson_slots set ordinal = 12 where id = '75fbe07d-95ae-4d3b-b1c7-46139ba637c0';
update public.lesson_slots set ordinal = 13 where id = '35d89f11-ff8b-442f-b0f5-3ec76e636369';
update public.lesson_slots set ordinal = 1 where id = '911ef0c9-ca8a-43f6-9de6-c6f04592d6b2';
update public.lesson_slots set ordinal = 2 where id = 'c356fd07-e9fb-49b3-84cf-029e624903c5';
update public.lesson_slots set ordinal = 3 where id = '350215a7-c71f-492d-aef9-270fa2875bea';
update public.lesson_slots set ordinal = 4 where id = '8d585a28-8004-45cc-8f7a-5b711ca0ab26';
update public.lesson_slots set ordinal = 5 where id = '2665365c-8a1a-4da6-b45c-07a72b5ff3ca';
update public.lesson_slots set ordinal = 8 where id = 'c761c29e-b4e5-4154-a287-eda4ecf30e1c';
update public.lesson_slots set ordinal = 9 where id = '5282c53c-23cd-46a1-b639-ee8ed66f286f';
update public.lesson_slots set ordinal = 6 where id = 'bb90dc11-040b-4153-8b87-948d50955de5';
update public.lesson_slots set ordinal = 7 where id = 'a584d368-85f4-4de8-bf61-a5dde3259d8c';
update public.lesson_slots set ordinal = 10 where id = 'bf277fcf-c2f6-4d9c-8966-7a8da37d6750';
update public.lesson_slots set ordinal = 11 where id = '3ab4daef-17c7-424b-b525-67bec8d95503';
update public.lesson_slots set ordinal = 12 where id = 'ed19ef77-2db3-4cb7-a405-27fa919c5c7e';
update public.lesson_slots set ordinal = 13 where id = 'c117b53e-be33-4bd7-8054-419e081342ef';
update public.lesson_slots set ordinal = 1 where id = '14cc006f-2ea0-431b-b264-3317624ed15e';
update public.lesson_slots set ordinal = 2 where id = '759070d3-9f84-43aa-8528-7587a874a380';
update public.lesson_slots set ordinal = 3 where id = '15c9c66b-a1ab-4cc7-b8ab-3114cd8f6392';
update public.lesson_slots set ordinal = 4 where id = '019b849d-27cf-41c9-ae3b-d57d5ea93ede';
update public.lesson_slots set ordinal = 5 where id = '56b57fb4-77a7-40e4-a452-1adafa82f381';
update public.lesson_slots set ordinal = 8 where id = '47d67f77-e31b-45ed-81a3-4568ee692f1e';
update public.lesson_slots set ordinal = 9 where id = '1f4023ac-819e-4e16-a4d8-100816dfba7d';
update public.lesson_slots set ordinal = 6 where id = 'ea3cb5c5-428a-4911-8cc9-56e7f3b674c1';
update public.lesson_slots set ordinal = 7 where id = '35f9594b-e505-481c-acf2-77368855da9c';
update public.lesson_slots set ordinal = 10 where id = 'bfe1d6d1-72a8-4f9c-a4eb-04513d426292';
update public.lesson_slots set ordinal = 11 where id = '02060fcb-3591-451a-b7a1-7a674abb070c';
update public.lesson_slots set ordinal = 12 where id = '52196ef4-1c64-499a-8e57-871dc53776cd';
update public.lesson_slots set ordinal = 13 where id = '0148c90f-fa56-4216-bd6d-7db1b5a03d30';
update public.lesson_slots set ordinal = 14 where id = 'df99ff9d-1ea5-4002-a7dc-d71e23cf6b82';
update public.lesson_slots set ordinal = 15 where id = 'bf894eb8-ef59-4352-a7fe-f0183713d386';
update public.lesson_slots set ordinal = 1 where id = 'b2a62b5b-92d7-4f6e-8b40-3758b13df008';
update public.lesson_slots set ordinal = 2 where id = '965c33fc-de60-453e-8109-0ab30ecc2799';
update public.lesson_slots set ordinal = 3 where id = 'a360b0a0-d685-4c6c-b9a2-17d81ad5e2d4';
update public.lesson_slots set ordinal = 4 where id = '9cdcf095-1df5-4b09-a0bb-9dd65464d75c';
update public.lesson_slots set ordinal = 5 where id = '05aa0a2b-24f8-4294-8a72-0684af966404';
update public.lesson_slots set ordinal = 6 where id = '1910c55d-b120-4a25-9242-19a3fe00d11a';
update public.lesson_slots set ordinal = 9 where id = 'd19b6dfb-113b-425d-aaea-ca3348c93869';
update public.lesson_slots set ordinal = 10 where id = '168f5154-770e-4ab9-b8d3-fd6ce028b647';
update public.lesson_slots set ordinal = 11 where id = '4e24f799-9851-4a11-8f30-d76204685802';
update public.lesson_slots set ordinal = 7 where id = 'b0549c8d-8e7b-4b7e-976f-dea919dde252';
update public.lesson_slots set ordinal = 8 where id = '95f81dc3-58fe-4379-ba06-206f3133e682';
update public.lesson_slots set ordinal = 12 where id = '49b782b4-9391-47c6-9508-a01afbbd28a7';
update public.lesson_slots set ordinal = 13 where id = '20183028-7790-4074-826d-63effe5fb66a';
update public.lesson_slots set ordinal = 14 where id = '7cf05e7b-51fc-4ad8-9580-d916c0f60e27';
update public.lesson_slots set ordinal = 15 where id = 'a205c3b7-17d8-4015-b5d3-cda21a2be2b2';
update public.lesson_slots set ordinal = 3 where id = 'af04c790-aed5-4a77-9805-e2d3a2d7b46e';
update public.lesson_slots set ordinal = 4 where id = '83a49926-900e-4217-af85-71d97cb893e7';
update public.lesson_slots set ordinal = 1 where id = '0cbcbe58-2e7c-4d2e-9042-9bdd1a7e09cf';
update public.lesson_slots set ordinal = 2 where id = 'ae9b9c19-5c0d-4d90-a2ae-42152f4b4313';
update public.lesson_slots set ordinal = 5 where id = 'c1f2010b-fce8-4c92-8196-d41a88607c71';
update public.lesson_slots set ordinal = 6 where id = '2712d0a5-8114-4e68-8ab6-c90d6325622c';
update public.lesson_slots set ordinal = 7 where id = '7e70025c-0436-4ba1-8ab6-b86fe52c70c3';
update public.lesson_slots set ordinal = 8 where id = 'a5eecf5b-cfbc-4ef7-94b0-cdf36e37b2e3';
update public.lesson_slots set ordinal = 9 where id = '614dd90f-d3d2-4986-82a0-7f60a2818e80';
update public.lesson_slots set ordinal = 10 where id = '4f9ec7b1-5f61-42da-b22c-9d5fcd08e0a4';
update public.lesson_slots set ordinal = 11 where id = '188760e2-7cfe-4fe5-ae63-7e4b6dabdba6';
update public.lesson_slots set ordinal = 12 where id = '2875290e-dbf0-478a-ac49-5eabba7a40af';
update public.lesson_slots set ordinal = 13 where id = 'fc94cf93-8c8b-4c4a-a42c-306c9e564daa';
update public.lesson_slots set ordinal = 1 where id = 'a1311e69-a7a0-413c-8c2d-a7cef79535d6';
update public.lesson_slots set ordinal = 4 where id = 'ce9be946-f895-4cd2-b811-d39a27e1e07f';
update public.lesson_slots set ordinal = 5 where id = '451cc05e-11cb-435a-9b63-513783067e77';
update public.lesson_slots set ordinal = 6 where id = 'bf847554-6408-41bc-bac5-eac8e114835c';
update public.lesson_slots set ordinal = 2 where id = '8a33efbb-7e48-4ccc-b493-9034a6615565';
update public.lesson_slots set ordinal = 3 where id = '0071dfdc-2375-4b8b-a72b-abb3866e5636';
update public.lesson_slots set ordinal = 7 where id = 'b77bcdf9-8a8a-4769-a0e6-4da02f62ac5b';
update public.lesson_slots set ordinal = 8 where id = 'dbf30db2-7466-43fd-a2cd-d6d073edfbcb';
update public.lesson_slots set ordinal = 9 where id = 'a4857bd2-e111-489f-a21a-63c784789e18';
update public.lesson_slots set ordinal = 10 where id = '8f4cceeb-9873-496d-b938-a49b262aee2a';
update public.lesson_slots set ordinal = 11 where id = '0fc1f06f-517b-438b-aac7-ee6221ccd032';
update public.lesson_slots set ordinal = 12 where id = 'ae0134d4-28d9-4d95-a620-b5a49a410924';
update public.lesson_slots set ordinal = 3 where id = 'f29501bf-e256-4a45-b5d6-34598f2bf9c9';
update public.lesson_slots set ordinal = 4 where id = '1319986f-2018-47ac-a9fd-fe04d61b4738';
update public.lesson_slots set ordinal = 5 where id = 'ac4cecca-1026-4d9c-83fb-aed4b82aa541';
update public.lesson_slots set ordinal = 1 where id = '2b4e6aa2-600d-48c8-b942-d7f9ffe2f5ea';
update public.lesson_slots set ordinal = 2 where id = 'ccb8c527-c226-40ef-9001-b6ce2e810bf0';
update public.lesson_slots set ordinal = 6 where id = 'be8ee67e-43b6-4638-8b7f-7c1550e42288';
update public.lesson_slots set ordinal = 7 where id = 'd61b3180-f7dc-484b-b4b5-8984774c17eb';
update public.lesson_slots set ordinal = 8 where id = '19b69592-bfd1-45a7-82f0-9c661ca41ac6';
update public.lesson_slots set ordinal = 9 where id = 'aec8172f-ece8-4ef9-a817-d27849d05bbb';
update public.lesson_slots set ordinal = 10 where id = '04e39dc6-ea49-4a4e-b681-3869e6a74842';
update public.lesson_slots set ordinal = 11 where id = '4b74d33b-eea4-4477-af0d-57fd9dc81505';
update public.lesson_slots set ordinal = 12 where id = '809500fa-adc4-47c5-a67e-1fb0d504633b';
update public.lesson_slots set ordinal = 13 where id = '62486ff2-f887-4ccc-b509-ed7a346bf7bc';
update public.lesson_slots set ordinal = 14 where id = 'cf44390a-718b-426a-8658-30163aaae330';
update public.lesson_slots set ordinal = 15 where id = '33f812a1-ae8a-48d0-8e7f-a090dc87ce7e';
update public.lesson_slots set ordinal = 1 where id = 'b0b4ef4a-245d-4009-9f34-85c565306847';
update public.lesson_slots set ordinal = 2 where id = '66ba6593-b947-4459-b0e6-96de4d178c2a';
update public.lesson_slots set ordinal = 3 where id = 'ac7fefd7-8d89-4107-b384-0960fb47a1a1';
update public.lesson_slots set ordinal = 6 where id = 'dcb4a46a-2c38-4aa3-a15c-1c5314e973b9';
update public.lesson_slots set ordinal = 7 where id = 'b444cea8-9289-46b5-a45b-245227bcae01';
update public.lesson_slots set ordinal = 8 where id = '2822bea3-0fcf-4cf3-b264-e75e2430634e';
update public.lesson_slots set ordinal = 4 where id = '95341099-0438-4005-a7a0-47a83fe21f6f';
update public.lesson_slots set ordinal = 5 where id = 'ac261093-3f64-447c-9f85-25050ee1be02';
update public.lesson_slots set ordinal = 9 where id = 'a302d452-b470-4568-9a56-03115ffc9d64';
update public.lesson_slots set ordinal = 10 where id = '79ac0732-65de-47a5-9231-b30d459493aa';
update public.lesson_slots set ordinal = 11 where id = 'ed788346-a086-4884-a8b8-da6f1d3632e4';
update public.lesson_slots set ordinal = 12 where id = '7d799938-80cb-4e14-bd81-7767b3f3b8c4';
update public.lesson_slots set ordinal = 13 where id = '6cde648c-4a1b-4330-bc0a-6e029766b499';
update public.lesson_slots set ordinal = 1 where id = '04be3f63-4f36-426e-bd68-1a3125f0fe24';
update public.lesson_slots set ordinal = 4 where id = 'b711f2af-a26b-4383-9cfc-3887f828abb2';
update public.lesson_slots set ordinal = 5 where id = 'f4ff5ff7-80c7-40b7-94da-29ae7a32667e';
update public.lesson_slots set ordinal = 6 where id = 'fe0c9431-da9b-4dee-bf9d-88b3001ce173';
update public.lesson_slots set ordinal = 7 where id = 'f40aa47f-9617-4e87-ae90-4aa32182583d';
update public.lesson_slots set ordinal = 8 where id = 'a9429577-fb2c-458f-ad35-66b1257caff5';
update public.lesson_slots set ordinal = 2 where id = 'dfefb923-9b55-453d-b602-64cc595232e1';
update public.lesson_slots set ordinal = 3 where id = '16e554ca-908e-403f-8656-e16cf51adf03';
update public.lesson_slots set ordinal = 9 where id = 'c922c37b-38cc-4e65-8d8e-214b8f9d605e';
update public.lesson_slots set ordinal = 10 where id = '2b8c6acd-79c1-4189-94a1-e491cbb5f491';
update public.lesson_slots set ordinal = 11 where id = '1ef27ce6-00a4-44c0-84ee-0629f7f75ad2';
update public.lesson_slots set ordinal = 12 where id = '74cc952a-8f02-49aa-aefc-fa1bef12bf41';
update public.lesson_slots set ordinal = 13 where id = '5e51576f-9069-4918-a1af-469a94c49eb4';
update public.lesson_slots set ordinal = 1 where id = 'fea339f3-666d-49ee-a9e2-539b81fc1669';
update public.lesson_slots set ordinal = 2 where id = '87744b62-ab66-4fc6-b662-4b8440328776';
update public.lesson_slots set ordinal = 3 where id = 'c89d537f-98a6-474c-9f20-f9f66faf512f';
update public.lesson_slots set ordinal = 6 where id = 'a6e7eb7b-85cc-4fc1-be43-e3127436217f';
update public.lesson_slots set ordinal = 7 where id = '9a6ca55a-55cf-4369-a253-07e0ae5977a6';
update public.lesson_slots set ordinal = 8 where id = '26c360af-01f2-49ba-a6b4-00c13b391370';
update public.lesson_slots set ordinal = 4 where id = '4506915f-3c78-430a-9654-7fe34484f6b4';
update public.lesson_slots set ordinal = 5 where id = '801ca674-8442-48e1-8cba-cc77148b8234';
update public.lesson_slots set ordinal = 9 where id = '8b4c87e9-e8ff-4b6d-90f4-7b50abcb62bc';
update public.lesson_slots set ordinal = 10 where id = '9ab33e39-a6e3-4030-8b13-b21987d560c0';
update public.lesson_slots set ordinal = 11 where id = '8a66e9f9-b276-4086-b1ac-8de854148b04';
update public.lesson_slots set ordinal = 12 where id = 'aec23fb1-c001-4e52-8b56-5fe2d3880cb9';
update public.lesson_slots set ordinal = 13 where id = '9939156b-457e-4001-8e8a-874c0d1b3839';
update public.lesson_slots set ordinal = 14 where id = 'e09404fa-1a68-40f6-bbcc-a8a4270815a1';
update public.lesson_slots set ordinal = 15 where id = 'd471bc71-3d3c-4014-8134-2d374bb3f4a0';
update public.lesson_slots set ordinal = 1 where id = '7ad2a287-98a9-4c8d-a5ba-32abb5bf9d30';
update public.lesson_slots set ordinal = 2 where id = '798e6b5a-fa23-4d00-9af1-4d19877404b7';
update public.lesson_slots set ordinal = 5 where id = 'bf71cb8a-1774-42a9-bc74-5ccc4d0805d7';
update public.lesson_slots set ordinal = 6 where id = '034f10f6-a626-4c88-8ec1-c275f64dd98d';
update public.lesson_slots set ordinal = 3 where id = '6823448b-07cf-432b-a234-723a2411d0fb';
update public.lesson_slots set ordinal = 4 where id = '30d7b6c3-6816-4605-8585-c9c25c131e5b';
update public.lesson_slots set ordinal = 7 where id = '5f19aeee-7144-457a-95fa-695ce37d3575';
update public.lesson_slots set ordinal = 8 where id = '5a9936e7-836f-426d-8296-492f2fcd41fd';
update public.lesson_slots set ordinal = 9 where id = '6f41ea4d-d749-44d9-92c4-f768b614727f';
update public.lesson_slots set ordinal = 10 where id = '1f378740-de12-4470-8e78-13af395fb502';
update public.lesson_slots set ordinal = 11 where id = '097c9430-805e-4fe4-a498-e3319b4671bb';
update public.lesson_slots set ordinal = 12 where id = 'b0b6f2ca-4c86-491a-b1eb-19b302bd0136';
update public.lesson_slots set ordinal = 13 where id = '17af54ff-7102-4356-9b11-a1bce371f277';
update public.lesson_slots set ordinal = 1 where id = '6d9733b6-00ab-48b8-92f5-2f4e89f3b472';
update public.lesson_slots set ordinal = 2 where id = '447185df-e6d6-407d-9cdd-cf83e98d12ae';
update public.lesson_slots set ordinal = 5 where id = 'e31c1626-f2e4-42ea-9e00-45ef59e72a25';
update public.lesson_slots set ordinal = 6 where id = '7eb0eebc-8ff3-4513-b7ab-6763b4f170b6';
update public.lesson_slots set ordinal = 7 where id = 'd89b8787-3bbb-4ebe-8819-941579a6cd61';
update public.lesson_slots set ordinal = 8 where id = '221e9530-050b-4a51-a8e9-a4b843e02cb4';
update public.lesson_slots set ordinal = 9 where id = '0bc00e33-9169-42b8-91e7-ac5ab7888e64';
update public.lesson_slots set ordinal = 3 where id = 'edf4cdfd-9c6f-4122-a5d4-bfd6b1416a68';
update public.lesson_slots set ordinal = 4 where id = 'e81d39f2-33a1-44f9-bc6b-774cdd42b250';
update public.lesson_slots set ordinal = 10 where id = '372b65ca-30be-4243-9aac-ef50e3ef909d';
update public.lesson_slots set ordinal = 11 where id = '2f55dee5-130e-4754-9911-bb5b891b24d2';
update public.lesson_slots set ordinal = 12 where id = 'b450a210-e399-459b-aad2-97701aac1541';
update public.lesson_slots set ordinal = 13 where id = '70bf3351-9942-4c20-bcb5-7f568b5611de';
update public.lesson_slots set ordinal = 14 where id = '628a51b3-c2b8-4924-acf0-8ecf81cf1dc5';
update public.lesson_slots set ordinal = 1 where id = '8a4cb3cb-aac4-4abe-87bc-9bb84f8a7a3c';
update public.lesson_slots set ordinal = 4 where id = 'd968f296-291c-4ab5-b086-2a5940165dd0';
update public.lesson_slots set ordinal = 5 where id = 'bebeb6e7-5586-4ecd-82d0-b9843c281cd2';
update public.lesson_slots set ordinal = 6 where id = '5c1d4342-ecbb-4692-af81-f1e23cd3bffc';
update public.lesson_slots set ordinal = 2 where id = '613815a4-8f30-4f84-aa23-d621a5f54855';
update public.lesson_slots set ordinal = 3 where id = 'c656673c-3378-44fc-88ff-042a61549b9a';
update public.lesson_slots set ordinal = 7 where id = '0a9ee5f0-b441-4ba5-8e67-f5bf4d20cce4';
update public.lesson_slots set ordinal = 8 where id = '708ff294-1038-4aeb-b773-ffafeccba05b';
update public.lesson_slots set ordinal = 9 where id = 'e0e331a8-642c-41a2-a9ac-081c634e1110';
update public.lesson_slots set ordinal = 10 where id = 'd3e43c84-b7c9-43e3-ab01-69e26b183388';
update public.lesson_slots set ordinal = 11 where id = '83e67713-6036-4a8a-80b8-efb3e1101287';
update public.lesson_slots set ordinal = 12 where id = 'ad4b1595-a0aa-4d1f-ad06-974e4ea8b2ea';
update public.lesson_slots set ordinal = 1 where id = 'e69cce0d-a501-44c2-b51a-df03254bd3ef';
update public.lesson_slots set ordinal = 2 where id = 'bd182346-fc79-4741-a197-8c6612e95237';
update public.lesson_slots set ordinal = 3 where id = '0e5f1348-1971-428b-ae69-e5d1597a3269';
update public.lesson_slots set ordinal = 4 where id = '162015cc-a836-44e7-8220-03d627994be0';
update public.lesson_slots set ordinal = 5 where id = '6b45c505-36a4-4682-92fa-affbe9c9fd20';
update public.lesson_slots set ordinal = 6 where id = '82577cfd-ac81-43b5-9d26-d20a6ec82026';
update public.lesson_slots set ordinal = 9 where id = 'b030cccb-3156-4669-8d00-576164f23158';
update public.lesson_slots set ordinal = 10 where id = '8e0bdca5-662c-4d3c-aefd-e7036d61a7e5';
update public.lesson_slots set ordinal = 7 where id = '9fbacf2b-05ea-45d2-8b06-225d79673355';
update public.lesson_slots set ordinal = 8 where id = '2c8de511-1925-4645-bf65-70be5bf2ba43';
update public.lesson_slots set ordinal = 11 where id = 'b16057a1-6140-49d7-b1a9-4a93741df16d';
update public.lesson_slots set ordinal = 12 where id = 'd70cd0d0-83bd-4880-bf45-bbd720f1d6f0';
update public.lesson_slots set ordinal = 13 where id = 'e36fc9b9-73b5-48ef-bf70-6e875a267ebd';
update public.lesson_slots set ordinal = 14 where id = '553b1020-b7e5-4975-93bc-215061675a7b';
update public.lesson_slots set ordinal = 15 where id = '0afc27ac-37b7-4504-9d3c-bfc0ec4e7e57';
update public.lesson_slots set ordinal = 3 where id = '1d13471e-7378-4d56-bf84-e19e8ab38d15';
update public.lesson_slots set ordinal = 4 where id = 'c9609ce7-01a9-4996-b916-705a1d06bae4';
update public.lesson_slots set ordinal = 5 where id = 'c5782e18-02ba-48a2-979c-ce6c27f01745';
update public.lesson_slots set ordinal = 1 where id = '50620263-62ae-47ee-b995-144602753bd4';
update public.lesson_slots set ordinal = 2 where id = '790a538b-114a-4567-bfc9-70698b492c60';
update public.lesson_slots set ordinal = 6 where id = 'f62a4a2e-f352-4ab9-bfb0-4eae79d2b0c9';
update public.lesson_slots set ordinal = 7 where id = 'f2d2b314-667b-4182-bae1-8a3719c9f90d';
update public.lesson_slots set ordinal = 8 where id = '9656debe-48cf-41cd-9a15-d006edc9aeec';
update public.lesson_slots set ordinal = 9 where id = '3cb8a8e4-4de9-4b00-8776-ea0e991bb226';
update public.lesson_slots set ordinal = 10 where id = '3a283f0a-86fd-4dc7-a36a-457f48a0eff4';
update public.lesson_slots set ordinal = 11 where id = '35934bc1-618b-49e1-98c1-cddd475f3faa';
update public.lesson_slots set ordinal = 12 where id = 'cc7e500f-ce8b-40eb-986f-af67e1fba02b';
update public.lesson_slots set ordinal = 13 where id = 'da52467a-da21-407b-a342-978ecead3a50';
update public.lesson_slots set ordinal = 14 where id = '41481727-3cc1-440b-b4a9-badebb2d1739';
update public.lesson_slots set ordinal = 3 where id = 'ac4b0b2c-ad6c-4792-81cc-a6d5b20d9ab0';
update public.lesson_slots set ordinal = 4 where id = '1649fb5b-562e-41a4-bf71-64ca4119a723';
update public.lesson_slots set ordinal = 5 where id = '3558ab44-a440-4d83-9b07-c194833caf0a';
update public.lesson_slots set ordinal = 6 where id = '89d93b86-4af9-4013-9e75-a7c7cd1b976d';
update public.lesson_slots set ordinal = 7 where id = 'b7418ad1-3490-4844-b15e-215a1c7c897d';
update public.lesson_slots set ordinal = 1 where id = '29e18745-a2ef-42db-b593-7913710973f6';
update public.lesson_slots set ordinal = 2 where id = '62e9e408-1fad-427c-8a2e-0a61915b6bd4';
update public.lesson_slots set ordinal = 8 where id = '7a0a18dd-f710-4526-b222-796f97839974';
update public.lesson_slots set ordinal = 9 where id = 'afa603b1-d27f-4eb7-9904-37dcab7ec112';
update public.lesson_slots set ordinal = 10 where id = '56386646-4b83-461c-962a-960987478fb3';
update public.lesson_slots set ordinal = 11 where id = '85409bc1-0398-4813-8a6c-4a60e70dba33';
update public.lesson_slots set ordinal = 12 where id = '8ab30a10-873a-4b91-b4ef-9c64c4eb5033';
update public.lesson_slots set ordinal = 13 where id = '3da453fd-3f5b-4161-b452-413b8d6dc9e7';
update public.lesson_slots set ordinal = 14 where id = '2e7f3405-ea48-4cbe-b338-8e6968564a6a';
update public.lesson_slots set ordinal = 15 where id = '8bc2ce45-c7e8-461b-b2cc-11d0f4c95ada';
