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
-- From the plan: 252 teaching lessons added in 92 units (0 more published from draft),
-- 0 retired, 0 drafts retired, 0 checkpoint lessons converted, 73 unit checks added.
-- Then: npm run course:lessons -- --all
-- ---------------------------------------------------------------------------

create temp table sync_plan (slug text primary key, want int, cap int, new_ids uuid[] not null, review_id uuid not null);
insert into sync_plan (slug, want, cap, new_ids, review_id) values
  ('un-cafe-por-favor', 3, 9, array['e97fa818-c79a-5cc8-adb1-4b6b7793e86e', '8a350f75-412a-54d3-bda9-f113955d34c7']::uuid[], 'f529300c-449e-57eb-bff6-15985a7b43be'::uuid),
  ('otro-cafe', 3, 9, array['385d204f-e16d-5fa5-8142-24b791d58305', '6fb46e8e-e242-5cea-9c95-a421b6f6393a']::uuid[], 'a2f895e6-8b34-5de7-9a8f-ab1892afaed5'::uuid),
  ('una-pizza-y-un-helado', 3, 8, array['f3cb30d0-11fa-5041-bab6-e087397e0a3a', '049cf6b7-a337-5ac4-b4fb-384eba2c462c', '7dea3a3a-6ac3-572f-a77b-029a2a6b9ed5']::uuid[], '3f7bd2ee-591e-5280-982c-a8b53ceeb203'::uuid),
  ('hola-che', 3, 7, array['408fca82-2c1d-5495-905e-68df0fbf3808', '74569a76-8545-5a14-85f9-7b9b1ec3a21d']::uuid[], '075e85a1-b864-5d35-8c4c-54c3b1576a77'::uuid),
  ('soy-sofi', 3, 7, array['b89cbddd-51a9-546e-a65a-99fd82850bfe', 'd8816a4b-53f6-5e9f-89e1-8374d960f223']::uuid[], 'ec360df2-0899-5bc2-9640-26451f94db7d'::uuid),
  ('buen-dia', 4, 11, array['fde2f34d-b8dd-5a9e-8d48-5a7ddbbba4ec', 'a8e407c4-817c-5ed1-9ae5-4c9b4fe3da10']::uuid[], '89fd6d8a-f933-5ecf-9ab9-d7c2df4dd7d4'::uuid),
  ('vos-y-sos', 2, 4, array['d560e316-8158-53c7-9f48-c99625a7c44d', '344d8a10-7f4a-53cc-bd8a-ce42a33fdebb']::uuid[], '42794794-4853-5efa-841e-ab97075b3264'::uuid),
  ('sos-turista', 5, 13, array['1780a325-e30a-54e4-96e1-ae7cb64d8bfd', '6c12b699-b534-5856-bbc4-abb8f66f9776', 'f7d76a93-4fd5-5d04-9cdc-d4560a83570b']::uuid[], 'f912e6d8-8323-5c1a-aa0e-bba81c2a4186'::uuid),
  ('practica-hola', null, null, '{}'::uuid[], '1e6ef9a2-c6e8-5af1-ba35-d517518f44f6'::uuid),
  ('como-te-llamas', 2, 4, array['d7e86544-35c6-567a-904f-14c23609c393', '9240fa05-dd2f-54e2-b98a-6d408ae75154']::uuid[], '7f77271f-5921-5048-8d84-a95e90fe90b5'::uuid),
  ('no-entiendo', 5, 13, array['269e46fc-b362-5a01-b994-660d1ad456d0', '92d8c443-0b31-510a-b526-ffc033aadae5']::uuid[], '022a0f24-a992-5038-a8b9-d0914a82fe85'::uuid),
  ('mas-despacio', 3, 8, array['794fe6b1-a156-5eb8-95c1-8bb63936cd60', '6a6da51a-e0be-5497-bbdf-827bb6ca1695', '1e245eca-e3d4-5c20-b05f-f8c8a1d0d0c2']::uuid[], '1dd2f3fc-976c-5c2a-9f93-8ee3da579ca0'::uuid),
  ('encantado', 3, 8, array['e872d927-c242-5793-b9a4-39f17ece3412', '3f86e92c-59ce-5597-af91-9993b384edf4']::uuid[], 'ee79bcff-9763-52b9-805c-323606cb6f34'::uuid),
  ('de-donde-sos', 2, 2, array['5d64e63e-f027-527f-b5f8-0993ac12bcfe', '6ea1967f-7f14-5c33-8ca5-d40cef3e85e6']::uuid[], '87e05c49-558c-5067-929a-40f98950915d'::uuid),
  ('soy-de-zona-norte', 3, 9, array['be9317a3-ec9f-5e70-b16b-5e696bbea697', '50dec432-4b85-52cd-a4fb-d8cacec20035']::uuid[], '758457fc-9810-5051-bd87-f756b8b5022b'::uuid),
  ('el-y-ella', 2, 5, array['0d1a0d6c-d5b8-5d5d-b72a-fe664dd289e5', 'd3222750-1b0d-5b07-9300-deb47132969f']::uuid[], 'f43d9e3c-68eb-583e-b589-3b6e8d956f91'::uuid),
  ('quien-es', 5, 14, array['c327585f-2548-530c-8887-7173982f0cc2', '606dfddc-91fd-55ad-943e-f45adff0ab56']::uuid[], '6022c2f3-1b83-5f29-bfc4-b411133d390a'::uuid),
  ('practica-quien-es', null, null, '{}'::uuid[], 'd6ddc56d-8a70-5b7e-afa3-b7f2062758cb'::uuid),
  ('argentino-argentina', 4, 10, array['19ace2e0-44c8-5c87-8112-571541340c98', 'ab407fb5-d412-57e0-aed5-5ba87c6af0ec']::uuid[], '2c88a7a8-fc16-5d48-8a0a-d01edb87f222'::uuid),
  ('de-todos-lados', 4, 10, array['3d549283-cc0b-5026-85d6-b0fb1e8d7c93', '60cf7c94-2f8f-5f59-a7cc-4d5cbb44955b']::uuid[], '40be0c5c-ac68-5699-a1cf-8cf869ba5054'::uuid),
  ('ella-es-canadiense', 3, 7, array['195987b8-34c2-5274-a5c8-bb2635fe3919', '669debbc-966f-57aa-a88c-00a3d71012ab']::uuid[], '08dfa42a-a78e-58e4-bef1-de8da8c23af5'::uuid),
  ('la-familia', 6, 16, array['d70d6269-ab5b-5d53-bb7f-a90dae8e07ff', '850b27d9-99ef-56f7-8a7b-91c2f97729ea', 'd400540f-3901-542b-83cd-f1c5914c7746']::uuid[], 'd2d36985-b9fb-5ac5-8b8c-cd4811a46bd5'::uuid),
  ('tios-y-primos', 3, 9, array['e46cf2cf-745f-5bc5-9d36-d9f2c6d289ed', 'a31f9386-6457-56af-9083-ab9cfee8470d']::uuid[], '25fc57a3-56bc-5faf-86ec-58b21581da54'::uuid),
  ('mi-mujer-y-mi-suegra', 3, 8, array['e079241c-059e-5f33-b20b-60d4f4cc3e4a', '90dd08a2-13d5-5d1f-a62d-d8b08ce28286']::uuid[], '11bdf94a-f9b0-585b-9697-a2be2983f266'::uuid),
  ('cuantos-anos-tenes', 4, 12, array['5d091ccb-4752-5924-a396-d887cf09e550', '9d5a3cde-dc49-57b6-af3a-59412e73aa3b']::uuid[], '4eaccfd3-d7c5-58a1-a397-dbc5efceb9b3'::uuid),
  ('tiene-ocho-anos', 2, 6, array['c618a55e-97fa-5271-876b-fefe4e471618', '72e4e50a-ec42-59d5-995d-668979f2e991']::uuid[], '4881e5e5-f900-5ecb-a1fc-92a871fb0583'::uuid),
  ('tengo-veinte-anos', 4, 10, array['2cd70696-1116-542b-845f-89791c8753e0', '119b2119-7860-53ec-b1b8-5876bad0efe2']::uuid[], '860cc30c-2752-5b26-aeab-819c545d627f'::uuid),
  ('treinta-y-cuatro', 4, 10, array['71fe7917-ee45-5137-94b1-ad63932f3bca', 'a030a9cd-9443-5bf1-a55f-9f987cb1ef11']::uuid[], 'a3988a23-3274-5265-8b72-e657b7b1159f'::uuid),
  ('cuarenta-y-cinco', 3, 7, array['d2039cdc-db1b-504d-a947-93b349717358', 'fda6fd22-e333-5bf5-9329-69ace93a35cf']::uuid[], 'd2f3076e-8145-5b85-8561-4116a0914d8e'::uuid),
  ('tengo-hambre', 4, 10, array['1572cfb6-72a1-5b99-9dda-3c2f3d99cee2', '5897edec-2db0-5b9b-820d-737322804b9b', '91fa9df3-a4ff-5c0d-8e48-bf46063e89c5']::uuid[], 'a914fb9d-c41b-5301-8ef7-56889f7fc5d0'::uuid),
  ('practica-tengo-hambre', null, null, '{}'::uuid[], '15e0e8f2-2a89-5ca7-af26-5b03c31f786c'::uuid),
  ('alfajores-y-chicles', 6, 17, array['341b54d7-c67c-5fa9-be1c-e7b5822c6ebd', '1725ead5-3f59-5bff-8655-9aad80673288']::uuid[], '5ec28797-b7cf-508c-8c99-883e8c61eebc'::uuid),
  ('en-el-kiosco', 4, 11, array['3ae7ced5-bd4d-5d37-9449-94dbce373c65', '61527154-cee3-5a35-935a-c59615c9d0b0']::uuid[], '0f85134e-9157-5ec9-a7be-02adc9956cb8'::uuid),
  ('cuanto-cuesta', 5, 14, array['fdcc7922-38e4-51f0-97d9-08436347c681', '0ad0e755-d9d1-5e73-a507-3de48bf3552e']::uuid[], 'ac3bce00-cb3d-5ce0-9681-0ea8e07bed20'::uuid),
  ('cuanto-sale', 4, 12, array['2ac89703-0d98-55cf-8ab3-cf0a02b4f60d', 'f38c9dc5-f0bd-5797-8484-d9fe18964391']::uuid[], '19509e91-68f3-5f7f-b382-7dda6a9f30c6'::uuid),
  ('quinientos-pesos', 3, 9, array['7ddcbab0-8249-5e1f-a9c8-06f6ebe1ce82', '685e2a1c-59a7-5c6b-9668-02dd4c9c88ac']::uuid[], 'd77a59fc-a552-586b-9c16-7f13561391e6'::uuid),
  ('la-gente', 3, 9, array['8ecbb56a-3f57-54c3-8bfb-ba1664c3f1ac', 'ba1ff947-50c3-5ffb-8c42-e24679e327da']::uuid[], '4771bfc2-1c34-5a11-847f-a5411d51591d'::uuid),
  ('altos-y-morochos', 7, 19, array['16cc1d61-ea9f-53f8-8d02-bdc8608df66d', '6cacb397-3f85-5a47-af13-6aa344ae9bd2']::uuid[], '5913f9f4-8d93-5dcf-bf62-83ef79f2e134'::uuid),
  ('casados-y-solteros', 6, 18, array['f16af078-2e82-547e-ae04-7f3d61ff2738', '5a25fa40-89fb-5955-85a4-41eefbe35ee5']::uuid[], 'f54860ba-8c7e-5ba2-aacb-5079dfc5065b'::uuid),
  ('donde-esta', 3, 7, array['f12865bf-dba6-5e16-9583-d2b25ab00e70', 'baa2b7ba-8720-56b2-aaee-c12daffa4934']::uuid[], '320e3c8b-52f2-55dc-b4ef-639db7658928'::uuid),
  ('donde-estan-las-llaves', 4, 12, array['36420624-e1ee-59d6-a3f6-22adf60784d6', '2e7dd544-183d-592c-8d00-6a606ca8c16c']::uuid[], '214ec96d-5d82-5ee4-b87d-b15f489bc4b0'::uuid),
  ('esta-arriba', 5, 13, array['f2bf8875-8c48-53ff-a802-fb5bb1b11388', '5af7d65a-fb7e-5cdb-8830-e0026ed39725', 'fa64a6e6-95d3-56e4-8fb9-b4e6d66ce7a7']::uuid[], '453a3d7a-9aab-552e-9609-181fed9061b3'::uuid),
  ('hay-un-kiosco', 3, 9, array['bc0bbd6a-d150-5820-b179-b6db0f7b926f', '5d4cff92-da34-5fb4-a0da-774f36b5a6f4']::uuid[], 'c910186d-a6a5-5cf6-8981-36eab0d7aa7d'::uuid),
  ('hay-un-tren', 2, 6, array['aedb1037-0d56-59bd-8d1b-ece4f5727677', '73171bdb-2c04-5b7d-968f-77bfdeb06f98']::uuid[], '5890c4ba-b518-5a9b-a23a-c6fad1e9b856'::uuid),
  ('hay-una-plaza', 5, 13, array['e34bb2a0-d63f-5c13-9579-11349ae85e0b', '051d199e-8355-58cf-afe0-cb58af972156', '31a10346-495d-5224-867e-5a79bd58826f', '71f3a495-83ff-5f92-a92f-d017bedc0fc8']::uuid[], 'abdb54cf-cba5-5190-a87f-e37552887261'::uuid),
  ('adonde-vas', 3, 8, array['21221740-1974-56ad-b594-b14c4602cb3a', '0c75383c-cc02-5f2a-8d9a-82ceae5a3876']::uuid[], '0d3a5bfa-4b1b-5788-b308-283c481f33a2'::uuid),
  ('practica-por-aca', null, null, '{}'::uuid[], 'e305ffc4-0a4a-5b4a-843a-e9481f9dfa45'::uuid),
  ('como-estas', 7, 19, array['652e321d-fd71-5b72-bd4f-6e0119247612', 'bbaea887-c68d-5bba-afdf-e88c31868696']::uuid[], 'e24e0d1d-6428-5b15-a19c-90fce10b1477'::uuid),
  ('estoy-medio-nervioso', 6, 16, array['73547326-999e-5740-8d03-fd4596a1bb20', '99af4ed5-9805-5683-9a3c-f288eaf10da0', '95c57bc8-1d85-5e5f-baf2-ca0941a871cf', '0114fc39-62ca-549b-acdf-66a5c8b5924d']::uuid[], '1e67ab44-549f-54b5-b435-d5b131214a46'::uuid),
  ('esta-cerrado', 6, 17, array['9734d4f0-c72e-50be-947e-acb6bf2a1160', 'ffa5ccd9-aa90-5d47-89fd-1f4a0caccae3']::uuid[], 'c6f4f500-5832-5d8f-a299-70ca13eb2175'::uuid),
  ('estas-listo', 5, 13, array['912e02f2-5e61-5584-ad30-906bfaf13790', '7dd91356-2d9a-5b56-8170-283e4d7368f2']::uuid[], 'f2400c2f-7a88-55cf-9b08-4e862bada4ae'::uuid),
  ('que-haces', 5, 13, array['048867a7-561a-554a-8fe3-b54d6b6e31c7', '8397572e-e324-53d8-94f0-340c9e11a890']::uuid[], '75eff695-0b38-50ae-953b-999e04c9d2e0'::uuid),
  ('estudio-a-la-noche', 4, 12, array['818bd435-04f0-5531-a84f-1481a9b4bbb9', '66d2711c-3594-55f3-9c98-70b74d9d3881']::uuid[], 'b8d60fa9-24a7-59a2-adce-a76a0343aa3b'::uuid),
  ('siempre-camino', 3, 8, array['880b2f99-3780-5ad8-affe-368d4f5dfd10', '1feeb402-e275-5d52-a4b1-bfa69a804a81']::uuid[], '02315707-a449-5901-a0c4-97e82f80ac74'::uuid),
  ('practico-castellano', 5, 13, array['f751caca-6d00-58d4-9a53-e1daa7044eb3', 'b5f9cf74-a5f1-524b-9894-c8b74a02fd4c']::uuid[], 'f5e932be-2d07-5807-886c-9e4554c015dd'::uuid),
  ('me-ayudas', 5, 15, array['8fde19bf-ca9a-5232-ae1a-6253dee2113c', '659d9804-53f9-5e79-ada6-df3d49ccbac6']::uuid[], '9d2cef53-f36b-5230-b9c1-ad56aa978f6b'::uuid),
  ('busco-una-palabra', 3, 9, array['1e41a625-64f2-5444-bcfa-95c05e717ac5', 'ee87f8d8-d178-5a8f-8cf4-6f8f4f3ceea4']::uuid[], '8a4cb706-7429-5c53-af3e-07c8f40703e1'::uuid),
  ('hoy-y-manana', 3, 7, array['de34e547-d774-5e52-9a9d-91b04331a24e', '2d1d4ef8-e66e-5c2e-b73d-11e0928af32b']::uuid[], 'cab5d5e1-8a49-577d-9078-20915eaec1a4'::uuid),
  ('mate-y-facturas', 6, 16, array['94b5c4e9-fbde-5711-b232-0954e5973c94', 'ff227aff-7ecc-503f-acc5-c089234bf93b', '28021721-2c01-5757-8759-b8631053b2b3']::uuid[], '9c0e7d49-507a-5670-9ea6-e2f3eaeea10c'::uuid),
  ('nos-gustan-los-fideos', 5, 15, array['cf19337b-cdd7-55b6-b179-b5932a025a34', '486dc8be-539d-57f9-ae00-ad121e297cd1']::uuid[], '467ff9be-209b-5e32-91ad-0625a77aecdf'::uuid),
  ('practica-nos-gusta', null, null, '{}'::uuid[], '82c05224-6c36-54e4-a660-d6538325bf3a'::uuid),
  ('me-traes-un-cafe', 4, 11, array['9d624d61-059c-56f5-82fe-24e48b5a58e8', '33041ca6-e8eb-5869-831e-03d6542ca6e2']::uuid[], 'b7bc93e2-54a1-585d-98d0-2ef7c31c51fd'::uuid),
  ('que-quieren-tomar', 4, 11, array['98da6dff-09ba-5d33-8b88-ace2555e9b18', '29a35978-c667-57e9-84e7-cf118d846d70']::uuid[], 'c288cc37-3ecc-542d-88d9-4af2afd187ca'::uuid),
  ('nos-traes-un-tenedor', 2, 6, array['107951f0-73b5-5831-9d79-25a544695697', '7209f93d-ab9e-5687-b616-e28bafa9f533']::uuid[], '36d5339c-e918-504a-bc8d-77f9b7db12d3'::uuid),
  ('facu-y-laburo', 6, 17, array['2b418c90-a7e0-57b8-b120-8628957844df', 'c9f1e228-0047-5e56-8377-792b45b338d1']::uuid[], 'c0c76f6e-b7db-5130-a054-fac5238cd57a'::uuid),
  ('de-que-laburas', 5, 14, array['2713db32-779f-5c5f-935c-15b20171dda7', 'd40c9baa-f228-57b5-9868-dc8c2e9913b9']::uuid[], '168e715b-3712-56b4-a807-054138d98db2'::uuid),
  ('es-enfermera', 5, 14, array['c601a565-cfdf-587b-910e-a28622d1caba', 'debe070e-6515-597f-80ed-f22afd70ecd1']::uuid[], '44b7b4b1-fe25-5a81-91fb-c2bf66507450'::uuid),
  ('tiene-que-ayudar', 3, 9, array['2c60e743-1f11-5bb9-8ad6-9753887c5d76', '98ebe04e-6c05-5742-afa5-8d81adb6e8fb']::uuid[], 'c1e203f7-b43b-5663-8272-a95bded9258c'::uuid),
  ('comes-vivis', 5, 13, array['4671e4b8-181d-5e12-8b7e-6cd862935a17', '15bda4da-8808-5f35-ae1a-15d2df5a4038']::uuid[], 'f8985c29-2b9f-5975-9ca6-e33d199802a2'::uuid),
  ('leo-y-escribo', 5, 14, array['04deba9b-3984-50de-8564-a8e424b7d7ea', '6d84cc2f-0575-5511-b40a-132842b72ecb']::uuid[], 'a82adfcb-728e-5719-8c94-e19b85ced1fc'::uuid),
  ('vendo-diarios', 5, 14, array['97703b52-a780-550d-8296-06c462f9970a', '3a5bf352-bc83-5a88-a8df-bd3db1e05adb']::uuid[], '80078b8c-960a-5fa2-baa7-8ae3ec69de22'::uuid),
  ('compartimos-todo', 5, 15, array['8c70bb93-930f-5d02-8253-138ac4db297e', '794b7312-0064-55a3-a5f0-a034cec2daf3']::uuid[], 'c78c40ea-b963-5e35-b9ef-6d4821a2614d'::uuid),
  ('practica-el-vecino', null, null, '{}'::uuid[], '1206a6b3-4188-5a48-8e8e-b7ad87f30967'::uuid),
  ('mi-edificio', 3, 9, array['9f53446d-c3c1-5e3f-b8d2-eb1636b6cb3a', '4482ec90-528f-5a52-a5e6-7897153e1c80']::uuid[], 'cd0cb74a-386b-595a-8e60-51754dfb19d9'::uuid),
  ('en-el-primer-piso', 4, 12, array['9cba7c27-ce32-5598-b0e9-b267847bef05', 'd3c073e3-f3fe-575f-8f6c-3417ddf36439', 'f5623b22-9539-51e4-8e3b-7ca74249c80d']::uuid[], 'c9d4bfda-b7d3-5b91-a8ba-1b25fa1d5f7b'::uuid),
  ('mi-casa', 4, 12, array['90cb095f-1caa-53b5-8c58-274bbeedddf9', 'ec642cf6-596d-5ee6-938d-d7dc3d071a7a']::uuid[], '2dc14d58-5264-5bb9-a3ef-dec0296adc05'::uuid),
  ('la-cama-y-el-sillon', 4, 12, array['ad543de4-b693-5fa8-b31f-3043a88bfe53', 'f147c7df-d4cc-57d0-9c4b-604155ebdddc']::uuid[], 'a7e04275-422f-53e2-b1f1-dc17304a80c8'::uuid),
  ('la-hora', 2, 5, array['8341f24f-5fd7-53f6-831b-4be2528ef176', 'b1b56fcc-87ba-5732-990f-da6a4bae2283']::uuid[], '571d3443-21c4-52c8-9cf6-d0ad98014841'::uuid),
  ('los-dias-de-la-semana', 4, 10, array['534db84f-a5b3-5b58-9a87-698862cb3f01', 'fbfec514-06c2-5756-b351-59092e6e5876']::uuid[], '60fb4c02-21cf-5f19-b264-29aa8d8e5932'::uuid),
  ('a-que-hora-abre', 3, 9, array['b2778448-136b-597e-8483-96b8cd4bc9b2', '5f4f4a86-e845-5509-aa4f-875748ff0b93']::uuid[], '7d8cb04a-b392-59c9-91a6-b8f982bc50c6'::uuid),
  ('tengo-una-reserva', 4, 10, array['9f375caf-bb9b-5ba6-ad23-bdb436b4c7eb', '2b867217-63e0-582a-8317-463e63bacbbc']::uuid[], 'd4d28e86-448f-5dcb-90c8-10457075fd9d'::uuid),
  ('esta-incluido', 4, 10, array['493a961a-f084-5120-a25f-213e10a619f7', '8580f6b5-ba13-571a-b296-98a62ded7267', '25a3728a-f244-543a-81bf-069c07e8586a']::uuid[], '9182dde4-81f1-51ef-b7f9-b6135b60a0db'::uuid),
  ('el-barrio', 3, 7, array['6031e86e-e8a6-5df2-900d-57eb770a9d21', '39d4432e-7920-55c4-aa84-c9565430199b']::uuid[], 'a073df44-5700-5ff7-a1b6-6cdf77241f19'::uuid),
  ('esta-enfrente', 3, 7, array['052a36fd-b6d9-5508-9e8c-0215b4317211', '45f75254-8a0a-59f9-b906-5cb927fcd72f']::uuid[], '45ad23b0-821b-5669-8890-72015ed313e2'::uuid),
  ('a-la-vuelta', 3, 7, array['eca1b5a1-e850-5c50-8d3d-69c29fcfe82b', '3712b2d4-a81f-53bd-93b3-be3eadcf773e']::uuid[], '442a6998-dcb7-542e-aa38-41bdfab0564d'::uuid),
  ('la-carniceria', 3, 9, array['074524d0-3677-5ba4-8bf2-ffdb8e1f9838', '1b5751f1-6012-57aa-9132-0e76f351f5be', '18df9933-e11b-5c28-8269-db95fe5dee20']::uuid[], '21f81730-005f-5bb1-bd5f-88585c8e569e'::uuid),
  ('queres-podes-vas', 6, 16, array['3b0d2c8c-70cc-5762-961d-da3cd5e3c4db', 'f2c64dba-4954-51da-82b0-87b195b667e6']::uuid[], '0a13f030-ca47-59cb-bb93-86c5cf20131c'::uuid),
  ('quiero-aprender', 4, 10, array['0fc213db-9562-51a4-be83-4a2bfba52e07', 'd3094e3b-afbb-55cd-a3e9-322126d19aaf']::uuid[], 'a4e6473a-3f47-5da6-87fb-6c00a7ff630d'::uuid),
  ('preferis-salir', 5, 14, array['05809da3-38c6-5098-881f-25809098fbb9', '26c752d4-740f-53bd-95f5-724024ea1370']::uuid[], '99f4fee7-38ef-5be7-a999-f91b8a6f5ea2'::uuid),
  ('vuelvo-temprano', 5, 14, array['0605e3a6-1856-5014-8b88-e5f4104d7449', '51131318-542d-52d1-8d73-66f5343deadc']::uuid[], 'c0be9e75-f6aa-5c48-9ddf-c9956ab469e3'::uuid),
  ('practica-a-la-vuelta', null, null, '{}'::uuid[], 'b9cd3b35-a54a-5d09-8bea-8f3ad27ae9cd'::uuid),
  ('dale-veni', 5, 13, array['a9e372ba-c78b-5f25-b4e6-95dbb7a0871a', 'fe47af11-af22-5888-84cb-7f541a0251c6']::uuid[], '43332f43-3a3b-593c-b3b8-2f1d8fa5f4c6'::uuid),
  ('pasa-toma', 4, 11, array['8257f135-c4eb-55af-914e-c81dc2380707', 'e53295c9-91d3-5e29-87f0-1eb38ae4d94f', '812e7c4a-d87d-5bdb-847d-961318b58bf8']::uuid[], 'f6ebef5d-e5c2-5e17-90cc-58b6df4a2332'::uuid),
  ('segui-derecho', 3, 8, array['fc189d22-68a9-56f9-93d1-7f8a14d88229', '7edec8e0-1dda-5faa-98cf-85da43571535']::uuid[], 'ad784ef9-72cf-5199-8084-98171bc2a94a'::uuid),
  ('dejame-aca', 4, 12, array['0a04172a-6550-5bb8-a921-60de408a75b8', '43484ab8-0c95-5808-adb8-d162cd7c19c2', '138cdbf9-f95a-5b5f-8016-c23088b5967e']::uuid[], '6fd0efd2-24f7-5f73-a43d-a45db1a249af'::uuid),
  ('tomar-el-bondi', 5, 14, array['b1b0c5b6-a538-5174-a768-bf3d0b4d8038', '9184cd91-cea0-5547-9184-d02f3e451028']::uuid[], 'd2b66c02-f1fc-56a7-83ab-5100536855a4'::uuid),
  ('en-taxi', 4, 12, array['9708a744-7023-56e8-ae6c-c7ee73727907', 'b454ecd9-0235-5885-8189-722c217c408d']::uuid[], '54b1ddbb-c557-59be-bcc4-811833b662e2'::uuid),
  ('ayuda', 5, 13, array['8465a842-ea10-5eb4-9176-ed0f5a6372cf', '96354513-1ff7-5fa5-875f-356fdd062b63', '118bd047-3287-56a6-a874-8749a3a2063d']::uuid[], 'bdc0718f-5080-51a7-ba5f-f4e15878234d'::uuid),
  ('este-y-ese', 4, 11, array['c9792e81-a265-50e3-91f1-f9868685063a', '0e2a8dc7-8119-5244-856a-80f1d9fb4704']::uuid[], 'd3d9b6b2-c8d2-5023-b807-8fdf24d4784a'::uuid),
  ('la-campera-nueva', 4, 11, array['5368ebb7-0730-5bce-8f2a-691b6341470b', '5a55dd6b-bf82-5fe2-9727-2b00f7a598b9']::uuid[], '0667524d-4e64-5cc0-9080-5cbd97d51420'::uuid),
  ('es-muy-chico', 4, 11, array['7ebdc300-bec4-546c-a2ee-5a3f6b8f4046', '8a36c703-2df7-5aed-864d-c78ea76f99a6', 'ad5c9b6d-bd4a-5888-89ca-93111c271781']::uuid[], '84be14e8-9067-5558-b727-4ca3c8cec9fc'::uuid),
  ('ropa-y-colores', 4, 12, array['d1e60b8e-4703-5d08-af18-6fe4c8a1b125', 'ede5ba7c-7bcf-53d1-a074-a954a9375cde']::uuid[], '4e1d218e-8d8f-52cc-8583-978b60ee3979'::uuid),
  ('celeste-y-blanco', 4, 10, array['902604a2-ef10-55da-a0c4-a4a919f4598b', '9eefee78-c5d6-584c-8dfd-f6a17d0130d0']::uuid[], '5e6fda20-b297-59a8-9837-664674d48748'::uuid),
  ('este-buzo', 6, 17, array['dd1781a2-a53f-5017-992d-784644010972', '54e7b8d4-918c-5c19-9edb-abffcbd7dd49']::uuid[], 'b8cec90e-67ef-54cd-bc9b-a39136f775de'::uuid),
  ('lo-llevo', 5, 15, array['5e0641f6-9107-5d32-8c7f-31a1656a5db7', '0e6a8877-ced4-5072-be5f-9993eeaa4724']::uuid[], '621d729a-9db4-5140-a5a9-fa655b654039'::uuid),
  ('me-cobras', 6, 16, array['edf46494-6c9d-5e31-916e-4903885181a4', '046af28f-718a-5765-aea1-fb4520ce202b', '7aeda85e-1c5a-53ee-91cf-c808188869a6']::uuid[], '04c4a116-3cab-542f-955d-8943dd77f04f'::uuid),
  ('debito-o-credito', 6, 16, array['c8ce4812-c743-566e-bd8a-59856717d71c', 'cc39fcfd-064d-5c09-885f-46818d377ead', 'bb3ebb25-cee4-5f1f-90dc-228ac862330a']::uuid[], '29ae734b-f445-5b1a-8de4-c4e64ed0f3ef'::uuid),
  ('practica-me-cobras', null, null, '{}'::uuid[], '3900d442-eb47-5ab6-a5c2-368040236050'::uuid),
  ('la-rutina', 5, 13, array['76d0f4c4-ddae-573d-b600-b942596ff6a0', '946312ca-8bd3-5dd7-b7fd-cef329ab885a']::uuid[], 'd4ab38ae-a743-5955-93d0-93e5f84e5983'::uuid),
  ('todos-los-dias', 5, 14, array['1e4e8c81-d261-5527-862b-c7500d2dba93', 'c66157ca-3b18-5b05-9507-ad3c04acaeb7']::uuid[], '47ae93e5-e1b8-51ed-ad59-01ccea0f5695'::uuid),
  ('me-despierto-temprano', 5, 15, array['81c6947a-a1fa-547f-91f7-29a62a45f1f0', '8c0cd270-014f-5a83-846a-80b50b64361f']::uuid[], 'e3e0fd20-d70d-5fd8-8d69-df4ed3481e2a'::uuid),
  ('duermo-la-siesta', 4, 11, array['b88e44ee-a246-5c18-90a6-c5995aa88eef', 'cc612160-2769-5a5f-b7da-04f25bc97a02']::uuid[], 'f6311965-da38-5ec6-a36d-b7a7d14e0c77'::uuid),
  ('que-te-gusta-hacer', 5, 15, array['cede81ab-4fbf-5261-b6dd-b53a87f0e093', '1ef9168e-d1d9-5f1d-a4b8-7bf33fdeb5a2']::uuid[], '30a66d17-7415-5f94-aff8-b7dd4bd8b066'::uuid),
  ('series-y-musica', 5, 14, array['4ccf2064-c8b0-562a-8ec4-5e76fd588420', 'aff3835d-6879-5c3f-8174-f9f179e7bd9c', '09aacce9-8bef-5211-8b42-75f77f23f56c']::uuid[], '493aff87-8dd0-5f9a-a472-c7ef2064c1a2'::uuid),
  ('me-interesa', 4, 12, array['9a8a6f5f-c1ef-54be-a681-24bac753fa32', '760bf683-5d02-57c3-9e9f-df397d3a4280']::uuid[], '704cb8e7-3d4a-5f0f-9cad-3a953b709a4e'::uuid),
  ('me-encanta-viajar', 3, 9, array['76e6c802-13c1-5991-b078-00c201dc9238', '2d733e4e-5d50-5fb7-8fcd-59eedd371ced']::uuid[], 'a91b5edc-2be0-53ed-a97f-97b30fee21eb'::uuid),
  ('pasame-tu-numero', 4, 10, array['cb2de533-18c5-584e-ae1f-781b5ae7e3b0', '2bbf7025-3553-50e3-9b00-7af57c80fa3a']::uuid[], '8a3d7eaa-5a9e-53cd-b401-94a6d0970830'::uuid),
  ('chip-y-datos', 2, 5, array['169093d9-4872-5643-98aa-f6bbb09f4b0e', 'ad1031ab-9251-5ae7-9d4f-217ce92200d1']::uuid[], '41b1dcf2-5b49-596f-ae2d-81cfe82e456b'::uuid),
  ('clima', 3, 7, array['fae0d159-096f-5058-ab24-a49361b48b56', 'df7727be-ec25-5ec3-ae04-29fdc88ed74e']::uuid[], '67ae2388-de83-5d21-a858-a2acc659cfc9'::uuid),
  ('en-verano', 2, 6, array['6a667a91-0de9-5103-8291-483675b47e9d', '35fbce2d-60bd-57aa-88c5-8554b7eb5884']::uuid[], '9b92566b-b76a-5986-ad98-c69d46e6c7a2'::uuid),
  ('en-febrero', 4, 12, array['b3ba0c23-f27a-523b-ac39-2b9c7a492910', '5f135e64-4bb8-5b6c-b8d6-a598441e87d0']::uuid[], '41d9e52b-10c1-5eeb-bdfc-f723ae0c5cd0'::uuid),
  ('mucha-humedad', 3, 9, array['cb285097-a06d-5b19-acc0-e6aa5a2d89ac', '541b337e-67f5-5447-949b-158dad69c0dd']::uuid[], '89142b1d-2d31-5755-bdb7-9f11286e7981'::uuid),
  ('practica-el-clima', null, null, '{}'::uuid[], '32208073-6833-555f-b27b-ece8edcd6168'::uuid),
  ('el-cumple', 3, 9, array['f21361d5-b4df-5670-9a90-a7a2f54f1e23', '1c424994-1c82-57c9-aecd-2f905bd966c1']::uuid[], '6e4cbe05-c301-5e8d-a1c5-2cbeb2d5885a'::uuid),
  ('feliz-cumple', 5, 14, array['e1a31441-cc8f-557d-9744-eb82208f7049', '581f839a-5735-5af8-9b04-fa55dec14605', '7d551ecc-2a86-57e4-a392-b5f3e7b1d275', '4e89757d-0f87-5c24-b4d8-296f137fc6c9', '1eb5dd4f-7357-5747-996a-c0e5101492e5', '2dbd2377-930b-504f-923a-a55a075b1b2d', '5ddaea67-f8a6-5a43-941c-5137241976eb']::uuid[], '7f547358-bd7e-5e91-884a-2cbc55256106'::uuid),
  ('estoy-llegando', 5, 14, array['9affef9e-a010-52d4-8a79-3ea48c859249', 'd2c69025-ffed-52df-a7f2-77c9442eb79f']::uuid[], 'f229b454-3f6d-5534-9549-9e204a760a9d'::uuid),
  ('ahora-y-planes', 4, 11, array['19c83c56-5a60-5059-ac14-50d5e3d32cb2', 'a23a5832-413e-564c-aa36-8d7f2a0cae08']::uuid[], 'd3cab237-50ad-5e65-acb8-6b8519d302b0'::uuid),
  ('que-llevo-al-asado', 3, 9, array['7492d5b1-81cb-54cf-8e1f-65c1e201e56f', '4b451343-a5fa-5f08-bfa9-8796642e8600', '93855bc5-cada-5966-a4f2-ad7e2537f562', '9a4acae3-91fd-5065-90d8-4e02ecaaefa9', '240d42cb-41d0-5b7e-8167-6c9dbc0dc48a']::uuid[], 'c4b6d70e-ae7a-5737-b385-39328b0d2637'::uuid),
  ('que-decis', 4, 10, array['7b29f749-ddd0-5be8-b832-137c8aa4fbc1', '6a7fb862-6556-585b-a55d-ff759ca0c047']::uuid[], '257a2cf2-0608-518a-9fbf-4bfa54c079d4'::uuid),
  ('ayer-labure', 4, 11, array['96a509d0-8df2-5cc4-aa09-a3576f408697', '4aa18fab-3977-5764-9c44-dad1b04eb99f']::uuid[], '841700f3-0b5c-5e38-9e90-2213a759dac4'::uuid),
  ('que-paso-anoche', 4, 11, array['a90e06ee-9e45-5edd-be5e-bcc4a28313b3', '8a5df78c-fb97-5774-a1d5-dadd3f4fe698', 'ebe3cd9c-746b-5c49-bfda-08ef7737b8c7', '01dde0fc-756f-5452-8379-59e62befa14b', 'f727b3f3-48d1-573f-b733-cac2d3a54ca3', 'ea934f26-8f5f-5bd4-a428-8e9ccdd7870c']::uuid[], '0b30bacd-ca06-517e-afc7-69fa0ae47e81'::uuid),
  ('cenamos-afuera', 4, 11, array['c6ea5738-0263-554f-acb9-422c15b95c26', '84be763d-cb1e-5a49-a420-1c2e1ccd0fe6']::uuid[], 'ae7547fe-5c00-598f-9ed2-5214e1cc7f84'::uuid),
  ('llegaron-tarde', 4, 12, array['8531e420-15b9-57d2-b10e-3293ee2bfe8d', '3c9bb065-33d8-5f85-b392-82319b5ca5e1', '7c4525ea-4495-5e5f-af8b-fc9a74091ce1', 'bf906aa2-7839-5e2b-92a3-44fe49850df8', 'bd9d2d9a-4a08-5545-b964-c7e710dc23df', '2848df9e-1c98-510d-a2d1-355f6f4ecd4c']::uuid[], 'bb6a9238-ccfe-518c-a2ee-a4207bd83e71'::uuid),
  ('comi-y-sali', 3, 9, array['1ecd7c30-d7ea-5278-ac12-3980289467e3', 'c86dd20b-46df-5c5c-b6cc-76b95f6e9f2f']::uuid[], '7ef6fc0d-9bf7-54e0-ad28-e3329c93d88e'::uuid),
  ('conoci-a-alguien', 3, 9, array['dd4099d9-0edd-5339-b22f-454c5276797f', '10b71142-0aef-5591-aa39-a1e038253a42', '0de98efa-df6a-5bb8-870b-a0db1b396774', '18bbe1b3-b7a5-5e78-80c8-76ba2fdab23a', '1066a9a9-93af-52c3-8fba-28249b6ea9c2']::uuid[], '27893ccc-f60f-5bc2-a9a0-9e10b31bb916'::uuid),
  ('naci-en', 4, 10, array['b55bae44-0b1d-5ef7-b949-345cb5661d4d', '78ba3ac5-752a-580f-a29f-8b39699f8ec0']::uuid[], 'eab52d36-c0df-565f-b252-fc6ea8ec4b09'::uuid),
  ('volvi-a-buenos-aires', 3, 9, array['77e4d263-2e21-5513-9e78-7ae2aed2466f', '77bbe546-cce9-5e12-84ec-41aaca6cd6b8', '88096eb4-f6f2-553a-819e-939b79f0897e', '0e402d3d-7a4f-5c79-a594-19d71d694933', '704e0471-68b6-595a-a04c-752af0092b5c']::uuid[], 'a900fff1-8de6-5683-b09f-ff40bd8a3787'::uuid),
  ('fui-a-la-cancha', 3, 8, array['abc1fc78-51ca-5e54-bd74-02fd42c22ac1', '1c47c50f-9b18-546e-b9b5-156922b516ed']::uuid[], '31908827-dbb4-55fc-ab9d-6b8743829cbb'::uuid),
  ('como-estuvo', 3, 9, array['d21467db-0e81-5422-8022-0fccdab3c3e4', '8ec464a8-1411-5749-b091-4750b8f7679c', '49307623-0dbc-50b0-8d94-d52612ef306d', 'a3f27c9a-b099-5035-83ff-2c11c6bf5a0a', '66a54cbe-909e-5ff6-9798-9353d16825fa']::uuid[], 'ac41c2ce-7033-5c9b-9109-8dbb8ba39f5e'::uuid),
  ('la-pasamos-barbaro', 3, 9, array['c4703ae6-5e82-5a80-8879-749c2e5befe2', '4b603307-19de-5369-9d98-718b95672bc1']::uuid[], '4a0b36ff-c559-5b0b-af88-0aecc1e0c15a'::uuid),
  ('ganamos-el-partido', 3, 8, array['71a54a91-b618-53f1-a5cb-3e2baca1ddfa', 'b39062b3-e4f0-55ae-9d01-963e14436aba', '197ae813-6da5-5f1e-9428-db1a4e752633', '87768e43-630e-58ef-94c3-89b8cb4ce73b', 'd74210f6-4ad7-5116-8b1a-99827afba201']::uuid[], 'ed12b6e0-cfa5-5e86-b4b9-753a7600e6cc'::uuid),
  ('practica-como-estuvo', null, null, '{}'::uuid[], 'd8c46aaa-a51c-5d66-a70d-5b6dbc2e150a'::uuid),
  ('el-finde', 4, 11, array['a3ebc4a2-a323-57a1-b8d0-18eabf323ee2', '948c2355-223d-5644-a708-b6795f4fb638']::uuid[], '652891cb-7f6d-5ee3-b38d-29753573e2da'::uuid),
  ('no-pude-ir', 3, 9, array['e00a7d69-4021-5e19-9a08-bc7cff29b47f', '8f4f6765-2a36-57dd-a7fb-8ad2b75c4c33', '27db31ff-2fc8-5a6e-aa33-b904429ba65e', '13705cfe-73f8-55db-bc3f-9768b5efdee9', 'efff100d-2d53-584e-afc3-3481522321aa']::uuid[], '7aad5b1a-156f-5a4c-b239-3e6ca7fd9c96'::uuid),
  ('vinieron-todos', 4, 11, array['b8d368ba-7046-5d95-b0be-e98ad64b5346', 'c3435f03-092c-50ac-a3da-1067190260a9']::uuid[], 'c61e9d03-f5aa-5c3c-b7f3-319c5815972b'::uuid),
  ('no-pudieron', 4, 10, array['f983a402-9937-57c2-bbca-6311fc2e6c9f', '0f4713b2-4132-5706-9df4-c3bfadaa68ff', '3453d865-2057-5c22-bca5-4901e79a1d54', '141f37f9-f24f-59d3-88c2-2c801344b2e3', '2ca1872e-566d-5c62-9561-c06a33f2c3af', '4c377ad4-0971-5fb0-bd3b-c399f5fc2425']::uuid[], '5b765d06-9eb4-5672-8396-fbb95fc22903'::uuid),
  ('mas-alto-que', 4, 11, array['e3240970-147b-592a-8bcb-b22dbfc4b623', '876b9cfe-f070-5989-9866-3b0b547458a2']::uuid[], 'd5123adb-60d9-5130-9687-14a398b67b37'::uuid),
  ('el-mas-tranquilo', 5, 15, array['962da091-782c-5ad2-9059-7ca5d1f50088', 'bf7a485b-a36d-5d7c-8425-6fa26610cd47']::uuid[], '6e153821-a864-5e57-9352-9df9340f2723'::uuid),
  ('me-duele', 5, 13, array['1d9b9efa-e39a-5443-8ccf-cc79fb01a914', 'bd615aac-8c43-5297-9a11-c7d3cfad33e0']::uuid[], 'a029e83b-e717-5914-8f75-52b8bde7a6f0'::uuid),
  ('saco-turno', 4, 11, array['ea311b93-9480-52ad-ba8f-ef3767fe2b40', 'e4fa7029-1008-5ad8-81f6-b32443635893', '04dc1e58-9bcf-58e5-8821-57dde916f8d6', 'fcd745cd-afeb-5500-a9a1-e452309f7910', 'a69e070d-98a8-5f22-a851-f6ff3790cea9', '86d9059e-238c-5bc2-aff3-1800eee87a7b']::uuid[], '4c881044-5c30-52ba-b5ca-4bebc3c4b4eb'::uuid),
  ('me-dolio', 4, 12, array['a71f5ef7-6594-5d36-bd20-5d5fd7796016', 'd74ae9d6-ddb9-5581-9887-03b03c5bccf1']::uuid[], '5fa56d14-23f6-5335-9d91-f1ff1cfffd7d'::uuid),
  ('una-pastilla', 3, 8, array['0ba5cebd-7714-5129-a588-fd23d78012b4', '5e0e1682-f9b1-5fd7-9630-0c176b761b01', '49ee19ce-799e-5027-b02c-7fa432a9e51d', 'efcc7d89-dc8f-58db-93cb-e19a8110dec3', '5ecce4ef-36ad-547d-a794-7bf7db0640a5']::uuid[], '8fdc1c9b-98d2-5f65-94e4-457a0e7fee5e'::uuid),
  ('practica-quien-vino', null, null, '{}'::uuid[], 'c6460211-901a-5380-bc10-be9416483f4b'::uuid),
  ('te-llamo', 6, 16, array['f2dd71e7-4dd1-5257-a1ae-81d09a332546', 'be689555-c2ef-54a4-83d6-67da62021703']::uuid[], '534883b0-3ef3-5c42-bdb5-eb3cc907ed67'::uuid),
  ('te-llame', 4, 11, array['fd82f8a3-eb56-56a0-b40f-9c1e7aa8856b', '074eeb02-ef9f-5c68-9aa9-7b55b7ddb587']::uuid[], '9dea8a47-4052-5cad-959d-6263773d301b'::uuid),
  ('te-di-la-llave', 4, 10, array['9c338db6-b529-57ac-a7f5-9bde1ef789c9', '5635bef0-84fe-583b-87c5-1ddf6f791d40', '13ec91aa-dce0-583b-be37-2240195cda97', 'b0f65caa-6429-55da-b37c-9f4020cefa11', 'c590521c-cbd8-54e2-92a6-d76dcdeec73c', '7903cb14-a7f5-5520-9df3-ad9a2e82a516']::uuid[], '675cc903-15a3-5b6a-9987-8de2b57c0f1b'::uuid),
  ('no-se', 2, 6, array['42ce589d-9beb-5d63-9d44-623de526a1f6', '18b52adf-1cbd-5f21-97b6-d9cfb7535df3']::uuid[], '0f0f62d6-7ff3-5b7f-9a97-d179914f59f7'::uuid),
  ('las-tareas', 4, 10, array['f3f8b44e-1642-5d4c-a52c-4d73b2a567b7', '8d57f303-c043-5bce-9137-286653305fc0']::uuid[], '621ab970-7b6c-5e47-bc73-2162de1ff363'::uuid),
  ('limpio-y-ordeno', 3, 8, array['c464c3a6-5a73-5906-af7c-487ffcb3ef79', '8b6fdc07-b2ca-503f-8e3e-75b9d24862df', 'af15f1a2-3e51-50d9-83f6-506c0db52fe1', 'f4c04a0d-53cb-5d0a-902d-1a816a318406', '4bc72295-0856-5f29-9ea6-766aadafa3bd']::uuid[], '05edfd8a-94a2-5f80-8cf4-86ec24e80aaa'::uuid),
  ('quien-lavo', 5, 14, array['5cbad03b-5f7d-578e-841b-1fbf601c64d4', 'a1eabbe1-8171-5b39-b044-dea1c816418e']::uuid[], 'b6a5adde-984f-5ad7-bbd9-b785fbedcf1c'::uuid),
  ('barri-y-planche', 3, 9, array['e105d579-65aa-5ba6-935b-fcf55acc26b5', '6b8e48dc-e608-599e-b326-0c73b02776a9', '552728a8-75ac-5630-bc6a-cb4d8ccf73d5', '36101f05-8807-5ba1-b75f-1068f1bd1fb5', 'c4743669-b641-52b7-bd93-ce0add5be4d5']::uuid[], '8cce6415-42c1-5c73-95f1-6fd5df0c20b3'::uuid),
  ('de-viaje', 3, 8, array['c11d27a3-9a98-5658-8481-1b7b7adf8945', 'db399589-45d5-516a-b28a-93ea5b166c30']::uuid[], '0615a3f4-9889-5ff3-8635-8dea7aa03526'::uuid),
  ('ida-y-vuelta', 3, 8, array['ec2da247-8065-5eb4-8ecc-b539be8a0548', '5ba923f0-9f66-5bad-ac47-307372c83a5e', '37172fcd-aaad-51a8-b51c-14bf26f64cfe', '89c94ecb-cad1-5cd6-ba6e-057ce6e447f5', 'd9936e19-a4b6-52ae-9706-0ca6b340e476']::uuid[], 'bd670e98-51db-596d-8d03-87ad69ec276b'::uuid),
  ('las-vacaciones', 4, 10, array['2925b90a-70dc-5534-8530-c86816e83932', '1d47afd8-87ea-5306-8c58-36964f4239da']::uuid[], '4183f6f7-c4b8-5a09-89ca-c8e0f23882d8'::uuid),
  ('paseamos-por-las-sierras', 3, 7, array['51d0d544-22a2-5148-a318-b2dd15d1c09d', '8c79f151-b321-57fa-b9b2-56701447e13a', '123c2c20-4e32-5346-9af3-a8d67901ae25', '45340657-8187-50d8-b744-29d78579737d', '8bbf5af2-9346-5b9d-91c5-bd4c90b72a27']::uuid[], 'd2f090f9-76d8-552c-90c6-e03744df2fb6'::uuid),
  ('practica-las-vacaciones', null, null, '{}'::uuid[], 'fb7ebb32-f9c4-5bd1-b149-69386bab3693'::uuid),
  ('menos-mal', 4, 10, array['cd9f7fc9-167e-51ca-ab61-d636241759b4', '30ad3811-2822-5f87-8077-53de23e2284e']::uuid[], '78e73eef-77b9-5deb-b88b-81e652a5614d'::uuid),
  ('no-te-puedo-creer', 2, 6, array['26ecf92c-5a4d-5272-b03f-7b899d103bbb', 'aff0bc6b-2f1e-5734-a973-f8ec7ae3e1d5', '2bbcedc1-2e25-516a-92dc-5ed5ea1fd400', '8fa403a3-1567-53f9-86aa-1518ceae9055']::uuid[], '073f6d67-32c9-56d7-aad0-396820cbcf14'::uuid),
  ('contame', 3, 8, array['94317dcd-2101-5426-af17-906a62361ecc', '18f45b64-cc58-5196-8c11-3ce5f0769dfa']::uuid[], '5b73f9a6-ab8d-50f6-b4f2-3a2afe02eaae'::uuid),
  ('que-garron', 3, 7, array['923d3e61-4590-564e-a624-dd0de23e686f', 'c16f29d3-d951-5e25-a067-66e4f4096818', '6b0425ca-a4d4-5665-a145-33b8dc752a7d', '1d6dc9e8-9df1-5f0d-9d0b-c94a78d1dc9d', '11464af1-6db7-5984-bd40-1433c3d79097']::uuid[], '6c9ac9a4-5c82-58d4-82aa-067d7a8b2504'::uuid),
  ('cuando-era-chico', 5, 14, array['d660bcbb-e811-5a47-b90a-bbcc9803b7c8', '648c891f-18a6-5656-ac87-2124a2af98be']::uuid[], '93c7a3f6-084b-5831-bab3-dc3aa14e4dfd'::uuid),
  ('en-la-primaria', 4, 10, array['28442183-c7e7-55bf-bdcc-5894bf7b0466', 'b2a448eb-3579-564a-be43-e338716aaead']::uuid[], '92dc4a11-5ecc-5c5a-8739-0dc6ff0fba16'::uuid),
  ('en-esa-epoca', 3, 7, array['79744d02-dfe0-56a9-84bf-ab7c8cd7fc77', 'b1b9e731-c1e1-57c3-9373-613e707c1ec8', 'ad06064b-8030-5af9-8a42-fb342a158a5e', '24fa9550-3458-5a42-bd79-fec9e2b77184', 'e35e4739-7d6c-5e1e-b50c-c4183ce6c99f']::uuid[], '5aa0f146-f469-5652-970a-1c5ef6669dbd'::uuid),
  ('siempre-jugabamos', 4, 10, array['674cd331-953d-5c3a-8ab5-667999f97da0', '4653006d-42cd-5b11-b8d6-a3a2e30044de']::uuid[], '9aba792b-056c-59ce-955b-705daa5aad50'::uuid),
  ('me-encantaba', 4, 12, array['878e5bd0-d105-5c9d-95bc-31c6acd2c02d', 'b4afb9e1-215a-525e-b359-07d376c67c41']::uuid[], 'a8c7253e-092b-524e-bb5d-9adb196b3229'::uuid),
  ('jugaban-a-la-pelota', 2, 6, array['b039bb05-63c0-5ea4-b4fe-84baf3cb0858', 'aa4f3b74-2f62-5747-ab56-256e3db42ccb', '4320f7ed-01f6-586c-8e95-2cb44638b540', 'ba67ea0f-47e9-5aeb-81bf-b40fab5724c3']::uuid[], '5af7182f-0dfa-5e3a-8caf-135233327d72'::uuid),
  ('estaba-lloviendo', 4, 10, array['d0377476-3943-53dc-9af0-2f2fdbd44ee1', '118949af-e16a-50f1-bdfb-ec3da3ae9e62']::uuid[], '14ce30df-46fc-533e-8251-6ba8321b1e32'::uuid),
  ('sono-el-timbre', 6, 16, array['1c9b2a16-ea4a-50e9-b983-801510241f86', 'b78e3d86-216c-597d-ae28-bb5369e82b77']::uuid[], '9c3ff51e-2d8f-5e29-b45d-88fcb9370e64'::uuid),
  ('practica-en-esa-epoca', null, null, '{}'::uuid[], '524fc421-05d8-5817-96c9-93adaf7dd1d7'::uuid),
  ('el-partido', 4, 10, array['e19f8fe1-3f1e-57cb-987d-866d396652ac', '98383f67-4746-52f5-9947-10ba12471b48']::uuid[], 'faf707c5-c66b-590e-ba2a-1428ad71948c'::uuid),
  ('la-final', 4, 10, array['898ee07b-e217-5dd4-910e-e2583ef2c510', '9f5c764c-8e11-55cd-8333-3e1a8cd0a141']::uuid[], '190e51b3-935a-5283-938e-802c3732cd37'::uuid),
  ('por-penales', 3, 7, array['f2571346-0778-5095-a9ed-d6971e0bb23b', 'd2bf9695-35c9-539c-bf44-84be5388d7b2', '60efa232-1ee9-54ff-ac0b-fe996fb22e24', '1767d294-804f-528f-8393-65b9f4d23251', '6dc2fe5d-5fd3-5838-9131-7beb82968971']::uuid[], '0973a7f6-1628-5704-952a-830a42c0f709'::uuid),
  ('de-que-cuadro-sos', 3, 9, array['401393a5-3beb-5ddf-9014-997e35513817', '5ff95d1b-1545-5807-82f6-9de200a28519']::uuid[], '66e29921-1a4d-568d-8997-ce9b470a220f'::uuid),
  ('soy-socio-del-club', 3, 9, array['831d6758-bd41-538a-a29f-44af52c68001', '5feb3ed5-c841-5fbd-8b95-bc73701b52b3', '4cc116ac-9cc4-514b-b40f-15346955bec9', 'e18ff4f4-6013-545a-8a11-4e186954d16f', 'b66aba46-6ebc-5721-91c0-e934e5e7bfd9']::uuid[], 'ce9b30a1-55ac-531e-90b5-c3adfba64422'::uuid),
  ('en-el-restaurante', 3, 9, array['47df15bf-4268-50e9-b484-1cf1cbbc0cab', 'a2da0ffc-37fb-5f1a-8633-82c8b29f0bd6']::uuid[], 'e66601b5-d920-5c9d-b342-c335b4ce0eb0'::uuid),
  ('con-gas-o-sin-gas', 2, 5, array['555832a1-5442-57e5-b647-d922270510a3', '2dbc694a-c12d-5dc2-a009-549dbc8d731e', 'be580f16-9e2f-5d39-86a8-c9ddcc0e17ed', '18cf3e09-b89d-581d-b6b3-e6b9c39dfbf1']::uuid[], '568537fa-b0cf-56d6-a5d0-b40ce1dedc5b'::uuid),
  ('una-grande-de-muzza', 4, 10, array['dabbfcdb-d862-5308-aba3-3ba1164a915b', '81d5f85f-5e65-5a14-9cdd-3b0a192d6975']::uuid[], '7fa5c59d-876f-5ca8-b6b3-e2ef8d42a1f5'::uuid),
  ('soy-vegetariana', 3, 8, array['014719c0-f794-5968-b335-ea2cb47d1e6b', '266101d6-39e7-5f79-8c54-cec38dd283fb', '9a7d0a07-d8d0-5bdf-9469-d3d72d3817d1', '8c18cae0-3fd9-58a9-8c1c-8ad9539f96d3', '67a22f6e-a36b-5d4c-8100-68755dd9a42b']::uuid[], '35009465-bace-5540-8ada-4301d3c3a271'::uuid),
  ('la-parrilla', 3, 7, array['32b87eb3-a74b-54ee-9337-34848d421ae3', '9e113fed-e842-5989-9065-9eccc5c6d737']::uuid[], '62dcb6fc-628f-52b1-be95-4805564035b9'::uuid),
  ('la-parrillada', 3, 8, array['adc7b779-8aa2-5d04-ad3f-2f72873d1dc9', '7eefec5e-f09e-5b8d-9648-5c4d4f7cb3b6']::uuid[], 'c286ea3c-9c27-5af5-aea0-7fd785d4dfd4'::uuid),
  ('bien-cocido', 2, 6, array['c380bef7-9313-5a01-a0bf-6da32506f368', 'c9cbd65d-3165-5b62-a337-367c1e6e2240', '769ffb08-1454-5b07-8643-31224893c646', 'f286c765-1337-5fd7-ab52-4165e884e111']::uuid[], 'd34870ba-ae88-5d5c-9544-db7d808c5ed8'::uuid),
  ('tipo-ocho', 2, 6, array['7d20fd14-98e1-5197-8b81-545c52f0f488', '8f0430c8-fb4e-5433-95a3-05a94ea4eabb']::uuid[], '10c08a3c-9fff-524c-b653-da78db3725e8'::uuid),
  ('llegue-tarde', 3, 9, array['8fdf9815-9084-5942-920c-56181a6e762e', 'b7710a1c-8934-573f-872d-dbbcaad4570a']::uuid[], '4418450d-d923-5214-b661-23fffea5e7d9'::uuid),
  ('confirmo-en-el-grupo', 3, 8, array['bfa20ccb-98b2-5e1b-86c4-c34e60ed9c1c', 'c180cd38-e9e1-5f35-9a30-176f3d2a4deb', 'ff8358a7-35cd-5c33-92bc-00fa882bb84a', 'c3fe82f5-d03e-5184-b61c-50a90555331b', 'c8a84a96-7058-59b0-8d62-16a0d8cb3961']::uuid[], 'faeed04d-173f-5e11-838b-a097e44a0aa8'::uuid),
  ('las-fiestas', 4, 10, array['b6861e48-80b8-5347-ba47-17d442d988c5', '0792795f-3a1f-5289-a38d-279c8024092a']::uuid[], '0996a2d3-021f-56bc-aa0e-c9beaf6acc2a'::uuid),
  ('en-lo-de-la-abuela', 4, 11, array['45b692a1-de42-5542-9cbb-a558cb6f3388', '6ad327ef-6d4b-525a-ae88-c31a43565328']::uuid[], '0bb5bcf7-6947-5c47-a54f-3a25eaf93e42'::uuid),
  ('practica-la-sobremesa', null, null, '{}'::uuid[], 'b01bef2e-78c0-55ee-9997-10d0a5304ede'::uuid),
  ('me-puse-nervioso', 3, 9, array['295edf5d-4b78-5717-975a-127b3d067982', 'b24242ae-f765-54e6-abbf-5d6c9f7a3014']::uuid[], 'ce04d5b9-bf31-59e5-b01b-5fd39457295c'::uuid),
  ('me-dio-verguenza', 3, 7, array['29a66f04-46a4-5152-b488-4e70c0868a8b', '83714bc5-658e-5621-8579-4a9c6fe8b666', '277bd28b-30f6-5731-88c9-8022356aa8ea', 'a6850535-610e-5bdf-bf4a-1ba4db1f183f', 'bb3fb6a7-9df5-594c-8af1-6ba572f05b24']::uuid[], 'e92937a7-bea2-572b-8676-9925ebafa376'::uuid),
  ('me-olvide', 3, 8, array['b406a13b-12fa-579a-9005-bcbbd7693f0b', '28a5be6c-aff2-5cef-a629-541cd0dfa7e8']::uuid[], 'ec800c61-365e-5d1c-8b90-35fff29ba257'::uuid),
  ('me-senti-re-mal', 3, 8, array['c5d5739b-d0d0-5e47-944b-db4e513d21a5', 'e9514f52-f724-54a0-9d3e-76509a55bc34', 'edf036c2-df06-518d-aced-7954067e8244', '510a2f9a-f416-59a2-8f23-7f3e37757e6b', '1df66f81-eddb-520f-bb4c-7ed9560b5ec4']::uuid[], '8323b0a1-6b86-5617-a469-e268134e951f'::uuid),
  ('la-semana-que-viene', 3, 7, array['c8d5f2a6-c096-59a3-a078-c9d4c04c3db0', '74af5deb-46fa-5796-b01a-4a72800a8480']::uuid[], '7c43e5ad-2889-53d2-b9fe-cf583cd985ae'::uuid),
  ('algun-dia', 3, 9, array['33451fe4-fb8f-5b62-92c8-1a2714afc36b', '64154b43-5991-5a18-a82f-6dbd6d900065', '603c27c1-9024-591c-9d28-c4fd594499f4', '25559d72-341b-586b-845a-a627ca88f4bc', '41da92f6-aa20-5aff-8b4a-f87bf30a3285']::uuid[], '695b1a2f-03db-50a0-971a-6bb48a02d075'::uuid),
  ('recorrer-el-pais', 2, 6, array['397ca411-50a0-50f0-9aa7-0cd8c92aa976', '96742c72-5ecc-5579-b5f8-66a84ea627ad']::uuid[], '8328533d-abdf-52f4-b200-b853f9cb363e'::uuid),
  ('acampamos-en-el-sur', 5, 13, array['6d04edad-03a1-5622-b0f2-70d0afe1c82b', 'a847de2b-df2c-59ee-a09b-d442055b6e78']::uuid[], '4d0bf846-a09b-5a6c-aa00-6d14f6c09a98'::uuid),
  ('la-cordillera', 2, 4, array['0bc4e3e6-1e77-536b-ada4-e910957044e0', '929bda0f-643b-558a-b44e-124e34838e27', '0632eedb-63ed-52ff-b366-6ab41a15234e', '35f79427-48eb-5708-b016-30c6f4df04f6']::uuid[], '57e11d43-40d5-5b32-a2d5-afa69bc76221'::uuid),
  ('me-mude', 4, 10, array['8b01feea-5545-57dc-b9ec-31ae009b2bd3', '8920773d-acd7-53c4-a43a-60abd7ca0284']::uuid[], '2a35ab16-339e-5bad-9b86-6b02c180333c'::uuid),
  ('el-depto-nuevo', 4, 12, array['b495a4d8-e941-5455-afb2-9e3a1dca8671', '45f26856-a0a3-5422-9bec-bc6865c993d6']::uuid[], '8261606b-2d16-5471-8aa0-672175231871'::uuid),
  ('el-contrato-de-alquiler', 3, 8, array['397729a8-bf61-54f2-a8e6-9879ff45f89e', 'b5b2fd5c-e520-5c2f-82c2-4386dbad7426', '5fc8645b-7761-51b4-ba50-1c4d0fe35423', 'a19f8b7e-13c2-5185-826f-fdc09c00bd8a', '75f543e5-e8e6-5132-a2f2-6191d890b2a4']::uuid[], '749ffc3d-5773-52fc-bf8a-2bd93bf15642'::uuid),
  ('practica-antes-y-ahora', null, null, '{}'::uuid[], '57250e0e-3c81-50ce-b9f4-02b59e53b8d2'::uuid),
  ('donde-queda', 3, 7, array['b9b49595-998c-5d30-b1b7-e12d884ee969', '47645263-10f7-509e-b145-db7d7c5e2bb6']::uuid[], 'da6cf969-edf2-5061-9457-4053edaa5028'::uuid),
  ('zona-norte', 3, 8, array['9d31f29c-b1e2-5be3-80cc-2d67a92cbfc6', 'bfa5db1b-5bbf-5081-ba7f-92ba281bd688']::uuid[], '734703e4-e771-5d7f-a24e-4e8093a693fe'::uuid),
  ('las-figuritas', 5, 13, array['82a7fa11-c330-5b67-9284-4dcc9b1f447d', '6e28c286-6b2b-56b1-b2e8-c09d66124a7c']::uuid[], 'f843031f-c39c-5a45-8cc5-d5a3420d1e73'::uuid),
  ('te-acordas', 3, 8, array['80bf96be-ece1-5239-9a19-36f99c301918', 'd097547c-f35a-5834-969f-f11a89d72f3f']::uuid[], '51f44607-4b7e-5aec-b89e-7dfee0531258'::uuid),
  ('me-haces-un-favor', 3, 7, array['8cfa33a6-c90d-5b3e-ba03-48fe7d8658aa', '521de846-79ea-52a7-9b33-870ce9f6d982']::uuid[], '88b79172-0337-5c78-adcf-500dbcf64307'::uuid),
  ('me-das-una-mano', 3, 8, array['4a7bf35a-74d1-577e-abe1-148c7159d1f8', 'ed618e93-eaf5-5a18-9ebf-28e982a729f5']::uuid[], '271ac1dc-c9ea-5f97-8ca0-9ad6e230b70b'::uuid),
  ('me-regas-las-plantas', 3, 9, array['e3e23cca-35b8-585f-aede-fd7e1ee218f3', '79986927-652a-5977-9095-5d7bceb55b59', '89914815-a54c-555b-8e7c-61b8f5174ec1', '2c4ada71-a919-536c-a8c9-82d0002e66e0', '4811bf0f-df1d-52a3-bd84-9b14ad74aa13']::uuid[], '1b0a4925-c993-57b5-b8d1-a391760e9bfc'::uuid),
  ('un-ratito', 3, 9, array['7e44b59c-7d50-5a46-ab0a-66e91cdba883', '378e175d-1590-58ec-9d79-eda8c0c6d896']::uuid[], 'aefc7f2a-98c8-58d9-b40f-0388bf38535c'::uuid),
  ('hace-fresquito', 3, 9, array['506d6a6d-aa0a-5690-9b2c-33ea9dbe3137', '8bb814e3-a907-5919-b3e1-3bc5a48f7736']::uuid[], '344f100a-5374-5bdb-8e67-74d1ecf01cef'::uuid),
  ('esta-calentito', 4, 10, array['266d8024-7d92-5b6e-9a22-05a7420f165f', 'c8cbe4d0-f5ef-5016-8004-25c69ab20317', 'cc2e8007-9dd5-5b8f-9677-0eae58762224', 'c5cce945-878b-5621-bed1-73c5c614eab9', '2c4261ae-e4ef-56ef-bda2-eccd89385c9c', 'd331f290-2d59-5a04-a5d3-99c7dfcc86cd']::uuid[], '0ddf9c01-3b21-58e1-b2b2-4b8b1fe000a8'::uuid),
  ('pasen-pasen', 4, 10, array['949f1e3b-e019-5830-b2ac-0ba7fa07d009', '9879fdb6-3635-5ed5-99ae-1fb6fb30887e']::uuid[], '80795648-12da-5d30-95af-0dba7feaf549'::uuid),
  ('a-la-mesa', 3, 9, array['56094a72-d893-5d86-a5dd-5015a1d26724', '88ad9af6-d1b0-514b-b650-3554428bba72']::uuid[], '2891fe13-2fa1-51df-a214-6e99a71e3177'::uuid),
  ('no-se-olviden', 3, 7, array['8c1ef317-c1bc-5c22-888e-11fe5ce2a0f1', '6a81856d-321f-5850-83f5-e0c41fd164f2', '8a16c1c1-7ce9-5f6d-b6ce-cd3732fb1471', '879e34a9-436e-5996-a900-d3adfaa10c63', '7ce59e5b-830f-5111-9b9b-ab656912a675']::uuid[], '9d7725d3-15d6-5eab-bc35-3e6e829ed212'::uuid),
  ('hay-que', 3, 7, array['dcbfc1a3-b114-5bb9-a667-d54f67289929', '6e0d649a-0321-56af-85ca-f2eef8bf3619']::uuid[], 'efaa45dd-6e3f-588f-953d-769f2325ad1e'::uuid),
  ('hay-que-sacar-turno', 5, 15, array['08880a9c-64b9-5229-80c7-6c0a052bf089', '65948f04-208d-5730-a2f3-9f4409e9c233']::uuid[], '32a624fb-4ca2-50ac-817f-ffedc31b0ae3'::uuid),
  ('el-tramite', 5, 14, array['b7157f37-bbe0-5435-b51c-6771f6fab119', '51d66a62-d19b-54ee-aa61-d7cd18f1df84']::uuid[], '4e4ba967-316c-5633-888e-f946980c7a65'::uuid),
  ('migraciones', 4, 11, array['83b4d055-4134-579b-a89a-138dec658971', '81cdda94-6510-55cd-bb05-e326d8200d0a']::uuid[], 'eacbb9e6-67c8-5e0d-a586-d0644569c747'::uuid),
  ('la-precaria', 3, 7, array['207b1409-e29a-50c4-b802-b7126ff6750e', '07bdb901-a4b8-55dd-ad98-edbd02b38aad', 'd543e674-4803-5c35-be80-2bcfd61b4f39', '0fdd8f29-28f3-5547-9b77-48af3c898f4f', '6d3b0aae-2df9-5589-bd18-b28788e84bfc']::uuid[], '2b1354a0-3044-505a-820d-7246d9c2b47a'::uuid),
  ('se-alquila', 5, 15, array['5e6203a6-0d9d-56de-bced-a4e7c99c9d4e', '6ce6bb10-377d-5e5b-8e1a-52989317c7a8']::uuid[], '32481a6b-f1b3-5c50-a53e-71f51e7267a6'::uuid),
  ('se-aceptan-tarjetas', 4, 11, array['1c9d7e6c-8adc-5875-b4ff-6a9a95f70dbb', '21fadffa-7370-570b-a64d-75c3440d87b7']::uuid[], 'a8d0303c-e564-509c-b0d3-253d00ca09ad'::uuid),
  ('se-prohibe', 2, 5, array['f46ad9bb-3837-52ce-9e76-2557e6c816c0', '73455177-f4ee-5682-8212-e37d7b3d3f33', '88e9268c-0cc8-50af-9f9a-3b92879813e8', 'd70106f1-0e48-52c1-9ef2-cc5fbf59d0bd']::uuid[], 'f49bd372-0b3c-57b3-bbc6-db44bf3263e4'::uuid),
  ('en-la-verduleria', 5, 15, array['535e2de9-d48f-5994-88e5-bee9a992de9a', '9bba4884-9b50-5b53-95e0-4e949cb88888']::uuid[], '25083f69-b517-5f8e-9415-98c93566586f'::uuid),
  ('cien-gramos-de-jamon', 5, 13, array['f77a45c2-e8d0-52f2-86de-bb457e34b5ef', '0243609b-3817-525c-99e9-a91530984bd2']::uuid[], '3091c850-9e79-5b65-8fc3-3b29e8bf607e'::uuid),
  ('estan-maduras', 5, 14, array['5bc3434e-8160-534c-a900-f7860ee5f187', '04c48ada-3171-5988-b246-e2a4aaea1413', '8545c535-1ad7-59bd-aad1-5a257a121993', '04b74c48-73a7-5d5e-9200-25042a92e90d', 'b2bc8ac6-518d-5c36-ba88-fc851d7e6c9b', '99065965-7f82-55da-9c20-afab2a54c977', '74d4c999-8e6c-5508-ad37-e554269bc1e0']::uuid[], '9ee7cc30-d1a5-531b-ae7b-7c90be127001'::uuid),
  ('practica-la-feria', null, null, '{}'::uuid[], 'ceb028a6-f10a-5365-9d49-ad7065743914'::uuid),
  ('el-celu', 3, 9, array['227e0a6e-c5e3-5356-ad53-8d1af9004e7b', '9c553758-8e4f-5eb2-8167-5c90f106efa7']::uuid[], 'ebc0cc2a-8301-51ba-b6f2-39f6eb5deb13'::uuid),
  ('no-tengo-senal', 5, 13, array['7fffeb5f-f760-53b2-a0b2-68512b71ff35', '04fd6aad-f560-5886-a549-6025ffd8e406']::uuid[], '6dcf94d5-443a-550f-b0ca-522655401a7e'::uuid),
  ('me-robaron', 3, 7, array['cbf5c136-00e3-53e1-a77c-4f11271c4491', '5ee18336-368c-5ba3-a69a-f8887c865083']::uuid[], '2c11d42d-d5b8-56a5-80e9-5313d054aaf8'::uuid),
  ('me-afanaron', 3, 8, array['c3cbc01e-ccbb-5c66-907f-3ce6170663de', '67372ea6-bdee-5ffe-8d82-f6bb0a1b80e8']::uuid[], '833bc15b-c8bc-5aa0-8912-447c092cb37f'::uuid),
  ('me-estafaron', 3, 8, array['5c724bc0-acfa-5041-9ae8-241fe54fcb3b', 'b3e1cc2c-1be5-51c2-8669-206693bcc45c', 'b89df1ec-b515-5443-97e3-4d3aab1df30d', '9793618f-3d5d-5f62-8078-fd3f84e8cd1d', 'fd80b879-80f4-5697-a954-0cb73bc7340d']::uuid[], 'a8fcf6f7-647c-516a-8102-08b4c2b3aab0'::uuid),
  ('te-lo-devuelvo', 5, 13, array['90baf6a0-0c61-57f1-8fe8-95342baa38d1', '6ca8ecb3-8714-559e-b957-c05448778129']::uuid[], '203c4d4c-0383-55eb-b798-cb948189030e'::uuid),
  ('te-lo-presto', 4, 10, array['b0970d62-7bb0-5d7d-952b-8b85c5cff7b5', 'd125f1c8-94cc-5b78-8859-ea4fa5258150']::uuid[], 'c8e01b9c-5d1f-52ae-81f3-57d4bd4d3287'::uuid),
  ('laburo-nuevo', 4, 11, array['032dcdba-cc09-5dd7-8b64-0d1bee756d9f', '42fb1b59-a759-53de-86cd-fd1897d654bc']::uuid[], '00e2925f-6d25-5163-bb8c-e1df538ee3f0'::uuid),
  ('me-contrataron', 5, 13, array['905a2ab5-7b37-54fd-ada8-c89624c01093', 'f22e44f2-5276-5b54-94cb-dfb5f2069974']::uuid[], 'a4fca5c5-4169-5e77-9cbe-bd91562b40d8'::uuid),
  ('practica-te-lo-presto', null, null, '{}'::uuid[], '5e767733-3d7e-546a-ab23-6873880381a5'::uuid),
  ('manejar-en-baires', 3, 7, array['c0342244-9952-566a-b8b1-a90b1f96468c', '9fa6fae7-9921-5ea7-9ea4-76d4083f6f59']::uuid[], '03b03c90-88d3-50f2-8a3b-26f3ec9f6583'::uuid),
  ('la-ruta', 4, 10, array['a03dacbc-a1d3-5579-af0f-2364947bd8c3', '81f717f2-48ac-5462-a5c4-a853071ed12e']::uuid[], '1d028588-6e65-545e-adb3-e1f4cd7a2c0e'::uuid),
  ('tenes-registro', 3, 7, array['33f70a77-a108-54a3-a133-05cb27818976', '687c2414-4615-54cc-9055-1756b109c471', 'fd89b3ee-3644-500a-ad7d-79df0eef3659', '1f1139a9-328b-559d-abb4-c30a2867ee74', 'e6945896-425e-5e9b-a32d-40610fb9e160']::uuid[], '50954921-4ae3-5700-a538-d014a9fac276'::uuid),
  ('salir-con-alguien', 4, 10, array['4398d992-caaa-5b87-8301-f220aa78470d', '9a21d1d6-36c5-51bf-b1f8-90368a822400']::uuid[], '92d8370e-efe9-5e34-8f97-e0529a6714b2'::uuid),
  ('estamos-de-novios', 3, 8, array['97738063-c932-56a1-bc0e-e46feb7922cb', '124b487d-6c90-531d-9d25-c949b64156bd']::uuid[], '48bc6175-5962-5ccc-a7ba-731df2f09d83'::uuid),
  ('se-separaron', 3, 7, array['65105793-9cc4-577d-9294-3e16144a0b47', '14299afa-0def-555e-a16e-43680176ef39', 'ee6d4315-12ae-5124-be38-e98fe2e2479d', '1b75616d-9bae-5bdd-aea4-8c1e486eaf2d', 'f8246102-c8b1-5e45-a79d-a2c838fb9bee']::uuid[], '80fb3a66-277a-5bc4-bbfe-8c6890948a5f'::uuid),
  ('me-cae-bien', 2, 6, array['d016e0ae-5cfd-588a-82a1-9a870ddad695', '87b8446e-8c66-573e-b06d-2bef1c6f87ff']::uuid[], '573d7402-91d0-5fd0-aa37-252f32f46a1e'::uuid),
  ('no-lo-aguanto', 4, 10, array['bb051866-e862-54a9-8b6e-6713f8455f97', 'ed89b6db-8809-552a-8e68-f6bb34cdaaf7']::uuid[], '31a86967-94c0-5e72-a7c8-81be886390bf'::uuid),
  ('es-insoportable', 3, 7, array['768f20f3-fa77-5561-8e42-4295046470cc', '5b398f7b-1499-522f-97f8-a69ed5e64066', 'c476fa5c-76df-5f0c-b207-c067a65e770f', '3ec0573c-3da1-5485-ac37-de1c4098e869', 'a7f1d9d0-fb0d-57b2-ac07-77e82f5a0309']::uuid[], '66f8c6d5-0b6c-5880-a54a-762ae1410bd3'::uuid),
  ('se-caso', 5, 13, array['34146182-ab08-556e-8009-aab1807cec06', '8d7604e6-83f6-5e03-b2ff-3caead9fc08c']::uuid[], 'e4466723-3c07-5013-9e6f-2a1d7c558d62'::uuid),
  ('se-recibio', 3, 8, array['0c6bd970-41c2-5609-87c1-a7d9a4b16b86', 'ab5e80df-806d-502b-ba04-76d86d327994']::uuid[], '2f87d5a3-bb27-575d-ae31-ebbf2a3f1e92'::uuid),
  ('donde-estara', 3, 9, array['b8410743-c330-5717-9777-8c391bf5e61c', '6a8bda2b-9eed-599b-997b-0cfaf8fa94b1']::uuid[], '668d6658-30ff-5b66-b412-8b2fab31bf5b'::uuid),
  ('capaz-a-lo-mejor', 3, 9, array['e7ef9c18-93e8-5fb7-953c-d993730530fe', '38a65ecc-2b04-5be3-9f30-ddba09d0c455', 'ee050c1a-f196-51b3-8a6a-1bf80183819c', '170a2010-8785-5cd2-bddf-39156e2b5128', '4fb4540d-4ccb-5fae-b14e-fccff8a50859']::uuid[], 'acf78208-a127-55b1-80ae-3b05bd8a50ec'::uuid),
  ('me-siento-mal', 3, 9, array['58eca0c8-7b4e-568e-b464-0e19ebf4d1bc', '783cba0f-9315-53f8-9c0e-8053d5c9fac3']::uuid[], 'bd0429e7-85d7-5705-a87a-016d703a6bcb'::uuid),
  ('como-se-siente', 4, 11, array['d5938202-d067-5818-a6c8-225eb35e6b25', 'c19db573-26b1-507e-bd7d-0cfd0666f7ca']::uuid[], '7da4f96f-0297-5405-8b84-919117c635c7'::uuid),
  ('practica-a-lo-mejor', null, null, '{}'::uuid[], '14f930f7-6890-59c8-be5d-945d641e4670'::uuid),
  ('sos-un-genio', 4, 11, array['469eab4a-9651-5815-96af-c9dfcf5adae2', '069d96dd-0caa-5229-8381-f276d52df1d3']::uuid[], '9982be58-f349-5653-90c3-98632168905e'::uuid),
  ('te-debo-una', 3, 7, array['85cc3a49-770a-516e-b2cd-e8bad4ee28cd', '903b06cd-61f3-5663-89f2-ba5b50fd069f']::uuid[], '035ceba6-9a05-5fa1-a0cf-147aa003142f'::uuid),
  ('buena-onda', 2, 6, array['d9e48f2f-0cf2-51ce-9997-cd500a4ebc6f', '323b2a8c-9b35-5c2d-9cd2-ead9304f2f3f']::uuid[], '63e1777d-ee1d-5603-ba68-940a78581f6f'::uuid),
  ('es-medio-vago', 4, 11, array['0d513c38-d634-587f-86c4-65148fe4e6b9', '81d83ce3-9375-5a14-997e-8f6ef734923b']::uuid[], '23535316-d511-5f10-8cfd-88b2bdcb25d2'::uuid),
  ('medio-agrandado', 4, 11, array['03b6489c-4e5e-591f-82bd-e96c9c4bd6e6', '7ce2dd28-681c-572b-a68d-4745b8069c4f', '7ba77e1b-ab32-5c0e-8fc5-553d1347dda6', '0beb238d-9c38-5650-9e5a-5c902bb35767', 'dfb8e2aa-1417-5304-b153-8ed816f6d5ca', '0456e9a3-6c26-5462-9a34-ead1acf4f18d']::uuid[], '89b948bf-6e57-574a-b39b-ec88773a190b'::uuid),
  ('quien-ceba', 3, 7, array['98afe63b-0bd8-5a39-84ab-f528f096c6d3', '61f71896-ddcc-5218-a493-de9dfbd616c4']::uuid[], 'b20a789d-73b7-55e4-9617-f0cc75d8f635'::uuid),
  ('te-convido-un-mate', 3, 8, array['2d9f218d-aa38-5c56-b05c-056efc18fdc8', '5684c34f-0599-5267-8cae-66e6c16ea472']::uuid[], 'afa69fb3-dcfa-53f3-96d7-7f16097b47c9'::uuid),
  ('convidame-uno', 3, 8, array['fe958af0-831c-5aa0-a745-2a33e14f7248', 'd29ae816-ffae-572e-898a-da2778cfac57', 'f8e85576-8206-591e-a4f4-42a2fccf1e87', '35759f5c-fb5f-5189-a801-784526a10904', '588beab5-c1f1-5166-90b9-4cc9bf3da61b']::uuid[], 'bb957ec5-8709-5a45-83fb-0c0c87c1ba64'::uuid),
  ('quiero-que-vengas', 4, 10, array['59c2026a-6682-509f-aea3-fb79d34ce114', 'b5279353-a84f-5c2a-9330-7a11b7148dc1']::uuid[], '4018a878-5da1-5e8f-b9fb-2a042195636e'::uuid),
  ('necesito-que-me-ayudes', 4, 11, array['9c6aa06f-544e-542c-b0e7-5c5081672461', '2e67ce94-167e-5556-9c92-fd90026828ee']::uuid[], '9a78aa67-9317-5a82-a5a6-574586ba740d'::uuid),
  ('que-te-vaya-bien', 3, 7, array['25213c2c-a2f2-5b13-a083-9ab91a27cd95', '15a68a44-6972-50a3-9341-4ba7abe56d41']::uuid[], 'ec8ed693-396c-5c08-9882-e2c50bed4e09'::uuid),
  ('que-te-mejores', 4, 10, array['4e98762d-9d7a-56fe-b4c1-b5cb8b608139', 'b326c68c-e938-5f12-9846-a63a43e0de39']::uuid[], 'f8f902b9-92de-5693-8dd8-0627f2fd9d04'::uuid),
  ('cuando-llegues', 4, 11, array['b1fc9cc5-8b7f-5f4e-b8c9-ecc2d67d1824', '23b9bed4-1b06-573d-b256-190ccbde3316']::uuid[], '2baf978a-e299-5e6f-b32e-ef50f9b38630'::uuid),
  ('cuando-vuelvas', 4, 11, array['5eb49908-f028-5531-a2d5-f0750ce1d62e', 'cf2f9ea8-55e8-54c7-89d3-3f4fc6e1241c']::uuid[], '3f7fcd52-79bb-560e-8751-323e526c4181'::uuid),
  ('practica-cuando-vuelvas', null, null, '{}'::uuid[], '18053c60-2ecf-52b1-b87a-6f0d9d0ec6db'::uuid),
  ('no-creo', 2, 5, array['702e8d66-2015-59be-8413-4e229cf8adfd', '9d8ef3b2-cf54-58ed-804c-a0f9154f317c']::uuid[], '2dbc2316-5a2a-5c40-9840-059f4d5f751e'::uuid),
  ('puede-ser-que', 4, 10, array['aff3ae2a-4844-54c4-8c46-6e5ce57d115f', '1151c376-cfd2-5fec-b2b9-47d708395b67']::uuid[], '743b0a6e-640d-5952-a080-4ba5219acdce'::uuid),
  ('no-te-preocupes', 2, 5, array['96d9390b-3b98-51f3-b090-bac4d160f764', 'fb537a3e-95c7-5ccd-997d-4c42682cc769']::uuid[], '70902f53-c469-5d33-8531-6bbd8569b15b'::uuid),
  ('no-seas-asi', 4, 10, array['ad77a442-c7d9-5d50-89d5-c237745f063b', '4f6f08fd-6b50-50b9-b379-3c4c0f382c42']::uuid[], '5e8c16ee-d465-5e78-9e3c-4b342f88b02e'::uuid),
  ('te-recomiendo', 3, 7, array['9cf88151-12c1-505d-bd25-f47fd0ae7462', '1aefc57e-fba0-59cc-be57-cc55614c3c67']::uuid[], '0f9ae2e9-08f4-5e37-888b-2ca0e29fc50b'::uuid),
  ('te-aconsejo', 4, 12, array['c815a8b9-3771-5b12-b545-16730b8e4bb2', 'f027a177-2136-5c49-b26e-a1c0a33105a9']::uuid[], 'c2dbf852-7e1c-5bad-8529-084d57880ea8'::uuid),
  ('practica-te-aconsejo', null, null, '{}'::uuid[], '2c667d6c-9aad-5299-8a4b-36858763def1'::uuid),
  ('que-bueno', 4, 10, array['2bd7dc93-c732-5b0c-98f6-723af4312fb6', '90cf3099-681e-58bc-a53a-dae307302888']::uuid[], '0e954418-8c2b-58d9-98f7-cdb9ef6a87e9'::uuid),
  ('me-preocupa', 3, 7, array['25479b42-aff0-585c-8774-d1467a9c6419', '85a3d3b2-04dc-5d6a-9012-175312dac5cf']::uuid[], 'aeeb77f0-26ad-5a76-a5d2-28a2459d0a70'::uuid),
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
  ('como-no-dona-rosa', 3, 9, array['2530cacd-83ff-508c-80e6-e628edcbe0d3', '80a2ed7e-fdaa-5b6f-ab80-aee2ca55092f']::uuid[], 'c09969a0-e806-5650-ba6c-2f4e7e2f5d18'::uuid),
  ('te-doy-una-mano', 3, 7, array['22308578-da48-5425-888c-a36b95bd5b34', '52a1d542-37c3-5e0c-a7d2-f95b46834f30', 'd353f63f-769e-584a-8eb3-4376c9cdebe3', '2a20156c-184d-5dc3-bde5-2962abdfaf72', '8dee41a5-febb-5728-bf6b-b58663ed26da']::uuid[], '6ab1f47a-a23f-5a93-8d35-d74e4943b33c'::uuid),
  ('practica-si-ganara', null, null, '{}'::uuid[], 'dad83e56-fe6f-5171-895e-20643a803f10'::uuid),
  ('en-cuotas', 2, 4, array['e615660a-e7d3-531a-9ab5-97c673c7472e', '593869f9-a76a-5f6a-8c28-e9d12f5fb254']::uuid[], '16e8b390-53cb-55a1-8796-2ad129ac7f23'::uuid),
  ('a-medias', 4, 10, array['99248567-d458-5b12-8181-4fb335af255b', '17c0ce9f-a93a-58ce-878c-1830b5005ddb']::uuid[], 'e13b5c10-f0f3-58d4-8eb3-f637fb98ac19'::uuid),
  ('dicen-que', 2, 5, array['a3b7428b-7202-5c37-9f6a-5ea99a79972d', 'cbabc31e-ebce-5819-b82e-c8bebcb3ea6d']::uuid[], '0ea36390-326d-5973-8a57-04b090f6dea0'::uuid),
  ('me-contaron', 4, 11, array['37ebcdb2-cb69-5227-b68b-623077fc5cef', 'ab7c200f-8a85-5063-80e7-d8ed09932c4a']::uuid[], 'fe6f1dd3-3955-51d7-b3c8-a4fd0d400f4b'::uuid),
  ('practica-a-medias', null, null, '{}'::uuid[], '2fcf05ae-0e3a-5cf3-a733-e4ed798f42de'::uuid),
  ('cada-vez-mas', 3, 7, array['ba86e930-8cc0-5d19-a348-a6eb21b44fa3', 'b542f1a5-937f-5c56-a7e0-d51de0140239']::uuid[], 'b479284b-3c2c-5bb9-b2fb-cd6d5bb2c07b'::uuid),
  ('estas-cambiado', 3, 9, array['dfdf77d1-f01f-58b9-bb9a-4deaa52772ff', 'a5bd6ae7-c75b-59aa-a672-207c65670a9c']::uuid[], '44aba44b-5207-5c47-89a3-20f5c79d018a'::uuid),
  ('ya-no-es-lo-mismo', 4, 10, array['92e7d580-5ff6-54aa-9f7f-5ca2d002dc37', '32605b87-6bfd-5cef-a3cf-8ec583b8a9a5', 'abcc278e-b647-5839-ac95-a9b8356ea53c', '765c26b0-b26f-57d9-a6a3-0a9f03ba5a0e', '12b03a85-311b-5fea-bd25-82c898271474', '30c4136f-9153-5c29-afe1-a67bebd21a04']::uuid[], 'fe7fd321-8204-53f3-aaf8-66179cfaf62c'::uuid),
  ('todo-aumenta', 4, 12, array['d6c61301-a3f4-5b13-bc38-f0fd6db4a8cd', '75294831-9615-522d-9a75-369996a6a0a0']::uuid[], 'e622038d-483a-5555-80da-881c9c6f34b5'::uuid),
  ('no-me-alcanza', 3, 9, array['9249a2a7-5957-5353-900d-5a268531dd85', 'd3f75ebc-5d04-5095-a28e-15e519c75847']::uuid[], '08b0bcf1-d7e5-5624-b775-efccd6e4efa2'::uuid),
  ('no-llego-a-fin-de-mes', 3, 8, array['8c96ee72-b21d-53af-ab21-7588d8922052', 'eb17e99d-73e0-524b-9f9a-16496fd56610', '8562f3c2-047c-56b9-a9fb-151074c1680a', 'aece1435-c4d6-5b19-b148-1e531f428532', '6a99f86c-b640-57b9-94e4-ddc036d57a32']::uuid[], 'f947c729-83bc-5ab4-944b-c22760f370c2'::uuid),
  ('me-pregunto', 2, 6, array['e8efd496-4fa2-5101-a55e-5b72c39ba866', '833b765a-7238-5b48-8dbd-1d6b78ce235a']::uuid[], 'd54aa2dc-aa2e-5804-8543-3d06de8e979c'::uuid),
  ('me-dijo-que', 4, 10, array['2aa12d22-5cd1-51e3-a63b-7e066e963593', '92a3c8ba-57e1-5d8d-9ca5-5dce86b1932c']::uuid[], '034a9130-0b2e-5b99-8168-a0c18c46920f'::uuid),
  ('practica-me-dijo', null, null, '{}'::uuid[], '745e2a22-e410-508f-8489-36ec24124d48'::uuid),
  ('ponele', 4, 12, array['d3838481-f020-5029-b422-27f9d48ab81c', 'b5acbe0d-652a-576a-ab68-23594cb3e58f']::uuid[], '1d549e86-d03a-519d-9331-cf8e7579a918'::uuid),
  ('se-me-cayo', 3, 7, array['0a9cb4d8-72ff-5520-8aba-a841b49910b9', 'de6f524e-ffa2-5141-8759-419e85f7db87']::uuid[], '1e885f49-aa09-5097-8407-c949eaee9d89'::uuid),
  ('se-me-quemo', 4, 12, array['fd375091-b8cf-525d-a840-bcc67744f94d', 'f272c63d-697b-5b62-aa19-2b3895ed7e0f']::uuid[], '3d4e91b0-029a-5bdb-97af-0bbf6189961d'::uuid),
  ('para-que', 2, 5, array['f42f624f-1c57-5333-bb3c-f976c5b20f99', '68ea3cbe-249f-53f0-8f24-c79b54dad2ba']::uuid[], 'd1319eb8-4863-57f3-9256-64b9136de860'::uuid),
  ('para-que-entres', 2, 6, array['a09e39f7-3f2b-589e-ab83-588225ddfe0c', '619cb298-1bf7-5ce9-bfd1-c65bc35c593a']::uuid[], 'fd458c40-891e-5adb-9835-e72c0be12325'::uuid),
  ('sin-que-se-escape', 4, 10, array['56586204-77e1-5e6f-a891-3c7c2c625c02', '3fb60cef-bd29-5faa-8c2a-793dc22dfbb0', '98ecb3b4-6b3a-5165-8df7-edeba4a89821', '1f16381a-d3b0-5d26-9d09-e5c77ed55819', '54c3b6c3-4aa7-57a1-8fb3-fa22fad6759b', 'e48f0a20-6210-5f5e-9966-bd69978c4172']::uuid[], '4d179a3d-4d28-55ff-8f12-4e433f96b7b6'::uuid),
  ('ya-habia', 4, 10, array['54f13c06-b591-5d1d-aa7c-547bcd7df597', 'f0eb0d66-92fb-5479-a759-ddd6e30f893f']::uuid[], '7b9b94f8-ac02-59e3-aeb0-5f2761d9d76b'::uuid),
  ('nunca-habia', 4, 11, array['0734e742-a5a1-519c-bbcf-76072b5d1b0f', '1f482753-4946-51c9-ad35-5198bc5de005']::uuid[], '879a4e02-105b-5aeb-b631-19e3d00c8a72'::uuid),
  ('practica-nunca-habia', null, null, '{}'::uuid[], 'd927c282-29f5-51b6-98b3-6fb34d65c6d1'::uuid),
  ('no-anda', 2, 6, array['ae5ba816-1b0c-57f2-a76c-766e2c344d5e', '393d71c3-637d-5a81-acd8-e0833b614985']::uuid[], 'b7413ccf-9b74-55d5-b332-24356943cf95'::uuid),
  ('el-tecnico', 4, 10, array['f8dcf6cb-f7b9-50e5-8bd2-0caf80a74379', '22107051-07e2-5c1c-9bb1-4b73a3587029']::uuid[], '8bcb615e-f5f2-5eac-8863-49c20aa2b51c'::uuid),
  ('me-lo-podes-arreglar', 3, 7, array['0a09a1af-27a9-54dd-8d9a-1716df18ced4', '5ab513a8-d936-5e2c-b69e-00534bab9966', '683c5202-935d-51d4-bc6e-685d98ed61a6', '0a25e999-e3dc-5485-83e4-8f88278e93fc', '50032931-d5a4-53a7-8064-07b33e77d844']::uuid[], '8ecf3504-4842-529b-acc3-693c9bf9f512'::uuid),
  ('el-consorcio', 2, 4, array['c9707d09-b19d-5f2a-a860-d04c80ae4b56', '1509a2da-0f39-55f4-96b4-b30cdcabab6e']::uuid[], 'fd06765f-2b54-53cf-97ef-3d4a3d297ca9'::uuid),
  ('se-tapo-la-pileta', 4, 12, array['4e8881b7-18c1-5ba9-a93a-37b5d7de661d', 'a96d7d67-c696-5f6e-ab03-4d1e6a44e0a5']::uuid[], 'f754af37-5f72-59f8-9b2e-64b7299e0cba'::uuid),
  ('de-acuerdo', 2, 5, array['b9469210-85f7-5420-8fa0-e738d3ad4a41', 'db9fb8d6-b38b-5572-8521-70b1919b163e']::uuid[], 'a1b3a9ad-7d8f-5345-92d3-5bd8e45f5695'::uuid),
  ('tenes-razon', 3, 8, array['5ac40196-3b6d-5fd4-9d05-41ee8610876d', '56a8697e-9eae-53c4-bcec-acc864c853f5']::uuid[], '2c39aea3-add4-50ba-a224-7ada1f83fe2c'::uuid),
  ('nada-que-ver', 3, 7, array['fb299c2a-66c1-57c6-9b88-3febacb8d184', '38e67ca8-784a-5c25-8732-bb058d401547', 'd53444a9-f1f2-5356-bd3e-f3ad33e51bd8', '0ff8b53e-4f07-53ce-a52d-956243554939', 'ba33f30d-a009-5e76-be2f-045c71d907e4']::uuid[], '0d62d51c-43b9-5a65-a7d1-1fae8fe558c1'::uuid),
  ('practica-tenes-razon', null, null, '{}'::uuid[], '27b5c81c-22fa-5434-a4a0-4763ea4a551f'::uuid),
  ('el-cajero', 5, 13, array['eab0bb18-6e48-507b-ab32-2bdc49444412', 'cda33c0e-b8b1-5e45-826a-3d22523a0125']::uuid[], '5f1febeb-b69b-5a16-89c0-154fb9544769'::uuid),
  ('que-susto', 4, 11, array['92c73b4c-db7b-5ca5-b871-f6b2bb258609', '7d1eaa14-7ff5-5e95-b662-265a304a6a66']::uuid[], 'd3c7a66d-7ed6-547c-a90a-2d3b87b568d7'::uuid),
  ('me-dan-asco', 4, 11, array['6aa5fa5f-a7cb-5fab-84a9-a4708f1b59dc', '1294de5b-935d-5330-90ba-3180cb903cdb']::uuid[], '5145cc1e-3db3-5f3e-9b18-e05936c61963'::uuid),
  ('me-pico-un-mosquito', 4, 11, array['b38748f7-96b7-5155-90f5-ae1f09e574cb', '908de2cd-2bb7-5711-bc30-0f2f4441ecbc', '01d9f291-dd03-5554-a335-8c6bab95a584', 'f5737215-cdb5-55ef-97bf-953c7dd3009f', '13b9bff5-2f8d-5f81-bdd1-093a70008ccb', 'df3f928f-f5a5-52cc-a2ad-af67457bd147']::uuid[], 'cabbaa2d-d4d3-548a-9da6-42fbdafe6c3c'::uuid),
  ('costumbres', 3, 8, array['556d045c-323c-5f91-bb65-4f251d8f6ef2', '0eecaf91-e1ea-5859-81ca-7d9a6474364b']::uuid[], 'f377857a-8b38-5d24-8cc7-0c0bff2af7d5'::uuid),
  ('se-aplaude-al-asador', 5, 13, array['668b20ae-2f2b-5676-a799-865e3e3c6136', '19177349-05dd-5789-9114-85b96b60f5b4']::uuid[], 'e53295a5-821c-5dd1-960c-b0f36d5bd32f'::uuid),
  ('acabo-de', 5, 13, array['d4652ab6-976b-5126-8c46-210d210bda08', '829b236a-b928-5c7d-bae6-aa6686e76da7']::uuid[], 'aa21c244-a8ff-54e5-a458-fab4723216c3'::uuid),
  ('deje-de-fumar', 4, 12, array['74f03613-2afb-5971-9e79-d7b78d1f6cc0', '4781204d-9932-5756-bd83-5fb04fcea6a7']::uuid[], '59ddd645-25cb-5810-96ba-d67f3928dd1a'::uuid),
  ('practica-un-aplauso', null, null, '{}'::uuid[], 'd4c456bc-af4d-5e0d-87e7-17bd4b48f8ae'::uuid),
  ('no-sabes-lo-que-me-contaron', 3, 9, array['22cea18f-2fd2-5049-9467-9e1157460093', 'ea8c51c0-7314-571c-954f-9e75c32d92e7']::uuid[], '057f2528-37b9-5acc-841b-a1366d65bf2e'::uuid),
  ('le-metio-los-cuernos', 3, 8, array['8a878a06-c241-5908-bfb9-e65d08b7f62e', '59f2358c-c0cb-5373-9e21-4bc487989cd2', 'f4a3dafd-244d-5f03-84d1-fff2a6036a47', '0688c07d-4ff5-5811-936b-e3614f07ac0c', '3008664b-f0ea-55c8-a524-05acb9234b66']::uuid[], 'e87fb9dd-e3a0-556c-95fb-2584fd3c27d4'::uuid),
  ('queria-que-vinieras', 3, 8, array['9fa03886-8935-5e1c-a654-19e3bfc0685f', '225c5501-5309-5a5a-9ac6-d693627e6290']::uuid[], '947ec37b-9bc9-5afe-b994-c4fd52390791'::uuid),
  ('mis-viejos-querian', 5, 15, array['acfb8b81-0cd6-5c6a-b0f6-88d8fbe7c96e', 'ecb58986-e1b6-5878-961c-1a348e643a01']::uuid[], '001eca1e-c99c-54ea-8450-e013a0265461'::uuid),
  ('aunque-llueva', 3, 8, array['ed58f518-c7e8-5e3f-a76b-d2cd23290a50', 'cfcb0667-877a-5f5a-8348-42e7007a7947']::uuid[], '85cdd211-8262-5028-ab5f-e0d482c01756'::uuid),
  ('aunque-no-tenga-ganas', 5, 13, array['34d88033-d01f-5dcf-a5a7-2afc9a735ca2', '627c82a6-5cf7-5c0d-83d2-654067fc5196']::uuid[], 'a43953ff-8e15-5c3d-8e7a-3916aa2b47c2'::uuid),
  ('llevo-dos-anos', 3, 7, array['128a5d7f-2b1b-51ba-81ed-4b16ddd8c569', '95fb1b24-b04c-5760-82fd-652d8248cbc8']::uuid[], '1f917883-798f-53ce-9312-f9ee2bf2121d'::uuid),
  ('llevo-un-ano-aprendiendo', 5, 14, array['6d10e6a4-7df6-5894-9222-d65338e46852', '1766df03-67f8-5fe6-958e-fa53cc14b6cf']::uuid[], '4bcfcb85-dc49-584d-96bc-408ffde3810f'::uuid),
  ('practica-aunque-sea', null, null, '{}'::uuid[], '6c170a10-3f77-550b-a558-03e9916aced4'::uuid),
  ('como-si-nada', 4, 11, array['75adec83-0ede-508b-ba6b-648ec1472723', '11e0f4e8-beea-5606-98eb-f8ed6f588c96']::uuid[], 'eb1b738d-eabd-5b37-a0be-78e92fd1d824'::uuid),
  ('no-te-hagas-el-gil', 5, 13, array['4104b807-6e72-5409-a1bf-80c2cc9c6379', 'b5415a24-a320-5554-a6b9-dc5237e582fc']::uuid[], 'ee2e9111-0349-5ede-be40-d7fff2e2e7b2'::uuid),
  ('el-que-quieras', 3, 8, array['f50f87b4-4e93-5dc7-bda9-b63f8ef6eff4', '6dd0f673-6d08-5b88-94af-772064a77648']::uuid[], '3cac0bc9-f997-5876-a9ae-f235af6bce13'::uuid),
  ('el-de-la-vidriera', 5, 13, array['ecea8f84-b255-5abe-988b-d6c5cc636092', 'a052cb50-9d7d-5aed-b96e-97ddacc18dbc']::uuid[], '4403a6c9-e547-5a39-b7dd-524f9c882902'::uuid),
  ('practica-a-la-mesa', null, null, '{}'::uuid[], '3292d4ca-aa2e-579a-92a0-a217ac1e9f14'::uuid),
  ('si-hubiera-sabido', 3, 7, array['43927ab3-c502-511a-b502-f51678fd5136', 'd17f15d0-3324-5315-ae1c-e1a32f8c8d14']::uuid[], '2c0c2ed2-0ff1-5707-95bc-793183571414'::uuid),
  ('si-hubieramos-salido', 4, 11, array['f7a017c8-6304-5ece-b029-885c58430f50', '17630b0d-4fbd-53a2-9036-4573e361c697']::uuid[], 'f8772d08-855b-5e01-8803-37a5fa936cbe'::uuid),
  ('por-un-lado', 3, 7, array['35bc4cc9-bc02-58bb-b570-c84bb9f49c7d', 'd32ef89f-80b9-5b13-b13f-9c343cc9d665']::uuid[], 'eda956cb-deaf-5d2d-8d26-cef9e8821f85'::uuid),
  ('la-ventaja-es-que', 4, 11, array['2cba39f0-795d-5dd3-ae10-50dce6d440a1', 'babbc01a-d24e-5d50-b389-cccdd717a973']::uuid[], 'd2f12461-7726-55c0-a944-c6862f843063'::uuid),
  ('practica-migraciones', null, null, '{}'::uuid[], '362e3e9e-6696-57a1-989a-a43a8ed915c1'::uuid),
  ('te-doy-la-razon', 4, 11, array['4bb56975-5ef6-57de-a8fd-b0f8b5bfab21', '78e6a75a-f3b6-5a7d-a75b-f4ea7cedcfb4']::uuid[], '279c1fc2-6bd6-5c04-bfc0-8b3e1535bfec'::uuid),
  ('no-seas-cabeza-dura', 3, 8, array['399b93f9-7d73-5ae4-964d-9b81e99f83ab', '4a7fb6c4-1675-5e87-b9ff-eb00198a8381', '46378dde-20af-559a-83e5-8755bc513d63', 'e4326cd4-1063-52b8-9438-2392c518b1ba', '3529085e-66d6-5bb5-9782-0c2e516204d8']::uuid[], '0c06fb15-9ad5-58a5-a8c7-5d81dffd3b11'::uuid),
  ('un-depto-que-tenga', 3, 8, array['b18c2e0a-21f1-504b-bd82-814a66ae355d', '7832cc1d-1ac5-5ef3-91ad-ca1e233c443f']::uuid[], 'bb1f4e7f-285f-5416-af46-80c2325bb684'::uuid),
  ('conoces-a-alguien-que', 5, 13, array['be718e24-040d-558d-8be4-c81b41d7a82d', 'f26eb51a-f0b3-5f81-8c25-ef99389fcb11']::uuid[], '314f6bd2-b3bf-5bf4-af02-9ef8e3158391'::uuid),
  ('me-da-bronca', 2, 4, array['f1c71856-66e6-5ca2-ab5e-4e7be8aa9580', '416eb06d-73f9-5a43-b8f0-6778988d1aa0']::uuid[], 'b11008af-3115-5687-85d7-38c29cb97fe4'::uuid),
  ('me-pone-nervioso-que', 5, 14, array['4f7a1836-753c-5ab1-8b65-5df458fd55c6', 'cf46575a-1a1d-5ccc-8be4-f05a671ae2c8']::uuid[], 'ec286fa5-b80d-5556-90d4-7712fddc4b55'::uuid),
  ('deberias', 3, 8, array['958ceadc-2eed-57fc-b7ed-c6cd8db914b7', 'e29654ac-ff4a-5405-bb26-79093f3a8703']::uuid[], 'e0a9e765-77b3-5b8c-8fab-bc722c941c38'::uuid),
  ('deberias-tomarte-unos-dias', 4, 10, array['01f146ac-3393-563b-9945-1b7834d4cc73', '1a5f42bb-1104-52f8-a4c4-482688a7ebec']::uuid[], '75af2473-9ac6-5df9-9061-93d2437151c0'::uuid),
  ('animate', 3, 8, array['4298df95-05ca-5581-a0c1-7491f2dc51b6', '5ffca71a-3140-505b-8026-545e699210aa', '651d6e2d-d01e-5a17-9740-f0ba6ef78c0e', '4642054d-037f-5859-bd35-6dcd93a346ab', '7a1b5975-20c5-5ebb-bcf0-207f79630e4e']::uuid[], '53e59589-59b7-51ae-bf31-cafcfc31a0d1'::uuid),
  ('practica-alguien-que-sepa', null, null, '{}'::uuid[], 'af688255-36e6-5d73-9ab6-081b6996fdd3'::uuid),
  ('dijo-que-vendria', 4, 11, array['3c87fe85-5c68-54e2-b077-292d264a18a2', 'e0a8e2f2-77d3-5e87-b7cd-a183b3dde023']::uuid[], '3944dd4c-c2f8-59fb-917b-03c3bea221eb'::uuid),
  ('dijo-que-pasaria', 5, 14, array['97c84434-3e15-5319-9a3c-f0d1dfc3c5a6', 'e5730283-d753-552e-8b4f-7cdca109025d']::uuid[], '425256cc-2e26-5890-998c-121b1fe47c86'::uuid),
  ('a-menos-que', 2, 5, array['05680da5-9bc4-5fc5-b624-dfd6a36e9c53', '9f3b4884-27d8-5c2f-8d36-5bb8bd3c71f1']::uuid[], '2b0306c8-2345-5be3-a169-4858d4a7d20d'::uuid),
  ('con-tal-de-que', 5, 14, array['0ef0661f-48b3-5cc0-8b3d-7307300fbf35', 'b26ebc38-1411-5891-b9c8-b4518bf7f438']::uuid[], 'd25b3a9e-d734-55c3-877d-eb124ecd02f9'::uuid),
  ('practica-se-aceptan-tarjetas', null, null, '{}'::uuid[], '6714e94a-0e8c-5e5c-9363-2e56871de2c8'::uuid),
  ('voy-entendiendo', 3, 8, array['34672a30-2fdf-53b0-bc2e-145c450ead15', '3d0b310c-155f-5710-89a0-9fca41e1459d']::uuid[], '2acb783e-9f2a-56eb-99bc-4dbb97835896'::uuid),
  ('ando-buscando', 5, 14, array['8ace3042-5edf-5262-ae47-367bcfc75ec8', 'd112ff33-e650-5fb2-abf6-ff6567f6adc4']::uuid[], '5454dfd1-7835-580e-b1fa-92b2475b9625'::uuid),
  ('practica-no-lo-aguanto', null, null, '{}'::uuid[], 'e7b6d630-e54c-5a46-a3b6-fa4a64aa0d68'::uuid),
  ('que-novedad', 4, 11, array['547e9561-aa32-544c-b805-53e95de80b13', '5e417193-2b48-53d1-9c70-5ade228209fb']::uuid[], '147a45bf-6f37-598e-9738-5fb0bddb344f'::uuid),
  ('ni-ahi', 2, 5, array['70fd7140-7f15-53f7-a677-bcc83a740fe5', '33a962e6-2602-5349-b305-0d29ed69fb09']::uuid[], '151a4a56-0b03-51c2-ae5b-f455f077cded'::uuid),
  ('ese-chabon', 4, 12, array['c96bfd74-7100-5bd4-927a-ebe670e3bfdb', 'fa32306a-26f6-5aa0-9fe0-3e8a4d1f5de1']::uuid[], 'ba53c9d9-d21d-5fa2-8bfb-dcd74df200a7'::uuid),
  ('estoy-al-horno', 2, 6, array['783627b4-8a5a-5b09-a09c-ebdaf3dc91f6', '5b397ed1-9c68-5269-bfd8-f8b0f37d49a6']::uuid[], '27ef64e7-61a7-5d97-9c01-fdb08d36c484'::uuid),
  ('es-re-rata', 3, 9, array['7b268885-4149-5e32-af2b-2b4fad3792de', '04812930-9a7e-5090-9a18-9d4a48d229f9', 'fb987f36-d08a-5932-837f-f3160d8013ab', '83884bae-6e3e-57f2-bf20-37a4eea64605', 'ea1ada89-d374-55ab-8db6-de79ab8fd2b1']::uuid[], '5ea91c01-ea89-50f2-9024-352be9a2a236'::uuid),
  ('puteadas', 3, 9, array['9e9405ef-f8f4-5576-8bd3-c81f2032c548', '833fd983-332c-5dce-8c32-085f0ab6388e']::uuid[], 'ba14bf19-94cc-54d5-bcec-fb3eb593bece'::uuid),
  ('no-rompas', 3, 8, array['f799195a-eac2-553f-b986-390617c4441a', 'bf1f8726-e7b6-5aaa-86ed-35c030a0b58f', '13df68e7-a904-561c-a571-255e37c7bffb', '5680cd4f-5c3f-5faf-92f4-95ec24f11476', 'df1a126d-8a0a-57b3-be77-82e64de522ac']::uuid[], '45bfe166-ad44-50d8-abcf-7dcf5ff9487c'::uuid),
  ('me-estas-cargando', 3, 7, array['9fed22b5-c0f4-5180-8abc-b57b351e1183', 'd54a86e9-9f73-5d45-993e-cd406e1ecdc4']::uuid[], '813d0c53-4622-53ee-9852-f944799d9c62'::uuid),
  ('caiste', 4, 11, array['eb0d74ae-513a-5a1b-bcb4-5aa4ff114a2d', '6ea566b8-742b-567c-8d22-31d91c679c4a']::uuid[], '71d22d11-cbe4-5498-adb0-dd6c3f38aaa7'::uuid),
  ('me-pidio-que', 4, 10, array['967c1a6e-8270-522a-a6ff-51a38e6fb67e', '5ba39675-8f1a-5716-a7a7-7182c364c7c4']::uuid[], '41e47d39-41cd-54b1-b418-bcbff6a86f8d'::uuid),
  ('me-encargo-que', 4, 12, array['442fdac2-3041-57bf-a5ff-03e8118bdcf8', 'ab1688d2-8bbe-5014-8c75-050ab445c4f0']::uuid[], '8e147f48-f18b-5914-ac16-0344c236ef74'::uuid),
  ('me-pregunto-si', 3, 8, array['878ad1bb-49fe-5c94-be37-9b07beba45d4', 'c8a908b0-e9df-57d5-8949-c1546fa6cf95']::uuid[], 'd432d0fe-37c7-5d86-913a-3fc034803e70'::uuid),
  ('fijate-si-tienen', 5, 14, array['e111221c-8ace-5606-8652-03602e95bd3c', '6969a88c-bbe8-5964-9033-1f38314f34db']::uuid[], '8600cf0a-e630-5ea9-a8fa-44e63657ae37'::uuid),
  ('practica-como-no', null, null, '{}'::uuid[], 'd309b386-de06-572b-8f72-8dc3ebebc0e4'::uuid),
  ('cualquier-cosa-avisame', 4, 11, array['00782bd2-d2a4-5995-a568-83a437e616bd', '25dd4020-9327-5371-b65d-0d07b760c452']::uuid[], 'ef8ebd68-9966-5f51-a96a-c2b6cc7fb836'::uuid),
  ('te-reenvio-el-archivo', 3, 7, array['fe6723b0-f88b-5ad7-b59f-887d20f84197', 'b420087a-e47b-5b58-abbf-ceccb778ec94']::uuid[], '068558ce-3817-599e-b756-ab7befa2dac7'::uuid),
  ('alguna-duda', 4, 10, array['1c237b15-4124-5b64-baa4-f9e71b811b2e', '84e3bcf1-ac0c-5766-bc1f-7d75797f9ed2', 'e8307885-3cc4-56b9-a87a-6a876cf7d43a', 'ffd875e9-52a2-545d-80cc-1e05169c30a6', 'df423e4c-80e1-59fc-9e8e-34a0c3cb5abd', '4db6cad2-1e9f-56f4-ac42-db0369dc6ac2']::uuid[], 'bfd559b6-147a-5e1e-95bb-c5aebc4b30d7'::uuid),
  ('la-entrega', 3, 9, array['1e325eb7-1278-5e63-8a42-a9847250cc52', '4518ff08-7f2b-5703-abe9-c2e4eb69e493']::uuid[], '3f6c4ed4-eb6b-57ec-8309-06bf0661fce5'::uuid),
  ('sobre-la-hora', 3, 8, array['ce9050b6-c729-5683-bb9d-f30cc5486b2f', '89323655-f99f-5b3a-9900-1759d3cf78f7']::uuid[], '2243acce-3feb-53c7-9dbc-d46a7f1cbf19'::uuid),
  ('postergaron-la-fecha', 2, 6, array['56ee338d-7e98-51af-8806-469a6bc93ed9', '7e018205-d622-5aba-9a00-e77f7c50fe77', '7767f4ca-09fd-5238-9cc9-6254395338f4', 'afb4e4f3-f518-59a5-90cd-32d1c8aa0e29']::uuid[], '76657021-d78c-56fe-acd9-886fbadaa4a6'::uuid),
  ('merezco-un-aumento', 4, 10, array['2711dc5a-6861-521b-9871-a8297c722277', 'a7a3e76a-1110-5936-afe8-ac4249af1b1a']::uuid[], 'faaae38d-a8b2-565f-acf5-249cb8fdd937'::uuid),
  ('se-merece-el-ascenso', 5, 14, array['b919ad38-0c83-5a0e-9371-1aaa86bb8237', '43475bc8-4aea-586e-95ac-789ef1df05ac']::uuid[], '6851238e-4746-5990-894d-d0a37c35cb32'::uuid),
  ('resulta-que', 2, 5, array['727b0db2-2509-5be3-b80b-fdb1e10c29c8', '559ba867-5282-5650-8ee2-17a3889f7ccd']::uuid[], 'b6f94702-50a2-5dee-99d8-71b941868216'::uuid),
  ('para-colmo', 4, 12, array['6374fecb-d5fa-52d3-9c57-ef79f7091d32', '19873c24-c243-50ea-9784-21db88cd6e9c']::uuid[], '0c74c24c-0a18-53cd-99a3-9ec78d644182'::uuid),
  ('se-la-cree', 2, 6, array['968cc86f-5d70-5317-b5fe-5138bd138eee', '6d6051e2-2fbb-59c4-97ef-c162907ccfdb']::uuid[], '413e69cc-b896-5ad8-b93b-1aae5a0834a6'::uuid),
  ('me-la-jugue', 3, 8, array['20384670-4a37-5177-b391-ce52cb225e2d', 'd57be10b-aac9-5c9c-8a00-01276992bd07']::uuid[], '687a9fc8-ea43-561b-a3de-3f19427d246f'::uuid),
  ('te-las-arreglas', 3, 9, array['0503e83e-d968-54fc-9306-95e8e202584d', '5b755513-bade-5297-98a0-f4c6c25781a2', 'd7a037ac-830d-5a15-aaa2-c09ba7bba0a0', 'e5399381-3f0e-5440-9547-2d0c94015726', '4ab9bd43-8869-5366-8afd-68ba16783d66']::uuid[], '3df59866-a26f-5f8f-96cd-13500ef403d4'::uuid),
  ('practica-me-la-jugue', null, null, '{}'::uuid[], 'c96fab45-a655-5cea-9133-461993d1f530'::uuid),
  ('estoy-podrido', 3, 7, array['60234725-78dd-5967-af85-2e5a93254774', '516df127-78f3-561a-bb81-e4d9061e20b9']::uuid[], 'c0ee90e6-2d2a-580e-b395-2a49a4e23cac'::uuid),
  ('me-pudri', 2, 5, array['abd455a0-9963-55d3-bab9-93817cead3b2', '22e20192-6f8f-5741-889e-bde47cec8006']::uuid[], '8591f698-49d8-598c-8c0b-bd83bbde44be'::uuid),
  ('siempre-reniego', 4, 10, array['0128e3eb-14ca-51a8-b596-5c0326329c19', '3de0448f-5ffd-529c-9271-ba20b183c9a8', 'ec7c0b63-d8a8-5da6-9cd0-ca038c9b4920', '07a12b6d-ff17-5b68-8095-003ef829e3ed', 'dc0d8df3-eb59-5a4c-b83b-6f38161bbecf', '5104493f-cbc3-57db-9f29-b6fdb8526164']::uuid[], '32339858-d01f-580e-b196-9d071430ccce'::uuid),
  ('practica-me-pudri', null, null, '{}'::uuid[], '9d09cbcc-eae2-54c3-b517-200dea359096'::uuid),
  ('como-te-decia', 5, 13, array['a63698aa-3df3-5fc2-85fd-9242b7e28d40', 'e031a274-288c-51d8-b72c-c29546d099d6']::uuid[], '50ccac4d-0807-58d4-9d42-4ffbe1a298ae'::uuid),
  ('te-la-hago-corta', 2, 5, array['2f135629-8ae7-5d1c-897d-4c4bd1186f1c', '1cc8d387-de73-56ac-a531-118571733c76']::uuid[], '0ceebf5e-33ac-51eb-81b6-0a53b6dde9c8'::uuid),
  ('hay-paro', 3, 8, array['00f7b6d9-ea3c-5b74-8f28-14f73423324e', 'bafd4d69-f9bd-5977-a258-38d0f7aa31e9']::uuid[], 'b572da9a-af47-5e7b-81e0-d7a39e98f6c7'::uuid),
  ('paro-docente', 4, 10, array['4e9a2912-edaa-5d02-9aa6-6252c451d7f2', 'fc7ee5b2-bed2-5999-8caf-65661969b43a']::uuid[], 'f1dffc49-cef7-57af-b2f7-0da296e2cc68'::uuid),
  ('con-normalidad', 4, 11, array['163247a3-bfd6-58d2-ba5c-ab3dda640dad', '6602e33a-6111-5262-9c62-6b6b0fbe003c', 'fb04dcc8-c229-547f-9cee-e5f69676fc9d', '077757d0-854c-520f-9ce2-2e71ef289a53', 'e1b59264-05e0-5c7c-8bb2-5972c0ce9cb3', '0f4b8808-ec45-5376-84a9-b24c404f3bba']::uuid[], '635dc5e5-42e5-516b-b51c-cd20197f7f53'::uuid),
  ('fue-construido', 3, 9, array['5e00a170-469d-59e4-ac96-2e321e47c8a3', 'aaeca724-12cb-5c3d-aeac-1f74a9cac808']::uuid[], 'e1aaa55b-0533-5469-92bf-df4e9c1d18f9'::uuid),
  ('fue-clausurado', 3, 8, array['144bb849-1366-5bad-8867-14826571d242', 'f56459bf-7f80-5375-a4c5-2f5ecb15cfb9']::uuid[], '4ab51058-de56-576e-8092-8b0026bf39be'::uuid),
  ('hubo-un-incendio', 3, 9, array['ae551474-d71d-5cc8-a36f-e6379a99d4cd', '754b04e9-be68-55fc-bc97-2b7ebc50b1b4', '93e193dd-0e36-58c1-98c1-a8b65ebfc185', '73048f80-f47b-5aad-b518-a2ba825838cc', '754341ee-ca98-53bc-87be-c43e314cb52a']::uuid[], '01d2ef98-82e0-5b49-90bb-2f4ec4229033'::uuid),
  ('las-elecciones', 3, 9, array['89749385-b385-5bf1-b501-578ac718d098', 'cd767d20-9cee-5211-8578-847315bbf547']::uuid[], 'daa465cc-db0b-5914-ba9a-1eeb088241cf'::uuid),
  ('mi-candidata-gano', 3, 9, array['7bd23cfd-4027-5d35-8541-1a11fd967a95', '5d0ec47a-8e37-5771-92b7-f7291b7e3989', '6854ef0e-eb8f-54ae-8eeb-1af5bf51e71f', '5985e618-dbad-5f04-b71e-13f68b3c567f', 'f4524a84-39f1-58a4-bd77-6b9ac07807b2']::uuid[], '560cf78f-99ca-51d8-8803-26f16c5dc69d'::uuid),
  ('practica-el-cuarto-oscuro', null, null, '{}'::uuid[], '17585547-d7d3-566f-bfef-145e53ce168f'::uuid),
  ('segun-el-diario', 3, 9, array['909baac9-ded4-506f-bc8e-86d94cd18802', '550c84e8-1acb-533e-b27a-1a76447c5720']::uuid[], '7f01ca7b-8bed-58fe-991e-85be5dd9c005'::uuid),
  ('rumor-o-verso', 4, 10, array['55263671-e0cc-5d1b-9ec1-f0c35e164b1f', '3a3a3195-8b38-5f87-bc22-bdef6f88c128', '95a2ee43-6bca-5b1b-8304-41784ae98c90', '4abdd24c-d155-5b15-82f5-4000c7c756cf', '75a34949-625b-5f9f-9b92-aa0a6c2422ae', '917a31e9-193d-5e60-b336-d62fa2ad9b40']::uuid[], 'f5c115ed-c1c9-51c2-a8cd-4b882db63dcd'::uuid),
  ('practica-me-afanaron', null, null, '{}'::uuid[], 'bc1df86d-34be-5efc-aea2-e591a8ebaaa4'::uuid),
  ('el-tango', 3, 7, array['5655fc9f-8ee7-5e37-9275-13352a6929fe', 'df1dc037-d29b-5993-8a8e-f4c27e3bf145']::uuid[], 'a7495f8e-64f2-5c02-b7b6-0817bd8d2446'::uuid),
  ('tocas-la-guitarra', 5, 13, array['9c71fff5-d482-5620-91ea-cc12145e8a76', '38ba5970-bf2b-59ec-8788-80f3a4285d48']::uuid[], '733cd5a2-d7e1-50b6-b0b8-9e4a1679bad5'::uuid),
  ('practica-la-parrillada', null, null, '{}'::uuid[], '754f404f-4829-595f-9a9b-1acbfc5c8d6b'::uuid),
  ('lo-lindo-de-la-ciudad', 3, 8, array['f8532de1-2d67-5760-8063-92c47e0b7e22', '05293851-179c-5898-82f1-8c0e11174978']::uuid[], 'ec78a4cb-895b-53ca-9be5-30511da18da5'::uuid),
  ('tiene-sus-cosas', 4, 10, array['96e8e18b-bf85-5120-b5fe-270f9a53bac7', '64f89e32-1681-543e-a26b-9d07da9ea816', '881fcd0b-c261-511c-a995-148199d2e31b', '116fb363-d510-5816-b2f0-09094c96a6e3', '507bb431-39ea-529f-990e-fa83bee39d2e', 'd54c6c62-0d1e-58be-9f1d-29d344e4c45e']::uuid[], 'c0c098ad-3125-5bb2-8b7a-11fc026afd4c'::uuid),
  ('no-es-que', 2, 4, array['f7721226-582b-51e6-b7ac-a8aea27d41af', 'f52ae593-014d-5484-99e5-4fbdb2e0ce11']::uuid[], 'd238a1ff-b82f-505e-b978-2a75a7eaffa5'::uuid),
  ('no-es-que-no-me-guste', 3, 7, array['7307feb8-0ad8-5208-b90b-2d5ffbce511a', 'b1b0375b-16d7-54d1-bf9d-fb0c8e5b3416']::uuid[], '75c3175e-614e-5281-85da-d05d142098ff'::uuid),
  ('gracias-por-invitarme', 4, 10, array['70266118-953d-59f3-b12f-6ab54336e8ff', 'de1c9134-aa69-5397-b61c-dad9a77b52ad', '09e9968b-19e4-58f0-858b-adf3ed590b71', 'a5ce20b4-b846-5bbf-bf5b-90369d9243dc', 'df5bd910-7155-5547-826d-38096d9ee1db', 'b84c1e2b-a6b8-5538-ae7f-738daa2f7c4e']::uuid[], '0d7d0556-fdb4-54a6-b475-3a3ab315a5eb'::uuid),
  ('si-hubiera-ahorrado', 3, 9, array['9afcf52b-5dd4-566f-8aa1-95eb776f6d36', 'ca1f5f7c-1b0f-5059-90ff-0ea3008472cd']::uuid[], 'b4774a28-2772-562d-ae58-b21c0eff1d07'::uuid),
  ('a-esta-altura', 3, 9, array['44b8873e-9b32-5952-a5ab-0a8e677508c4', '7e60e085-bc4b-59b3-972e-55cf090887dd', '18bdad95-4f1d-57c5-96fe-f8c94aa9d821', 'fc8aacfc-a9bd-5fbb-8434-a8b835327e36', '086b8732-5910-5121-9c9f-9823b91931fc']::uuid[], '9f60bb3a-80d7-5a36-9a67-1ab8b332a021'::uuid),
  ('tendria-que-haber', 3, 9, array['de5dc135-c482-55f1-8bf2-7f479aaa4039', '726a552e-b5ab-5166-9206-7724eb09f531']::uuid[], '23e7a551-3af9-5196-81d6-c85962c1024d'::uuid),
  ('me-hubiera-gustado', 3, 9, array['433133fe-6da9-535c-8dc5-a9f148797c64', 'e3a7ed86-5bb5-53ff-a310-2a4bd2247d9e']::uuid[], 'ca6f664d-d6ab-5d30-83f7-1e0c077374b2'::uuid),
  ('te-lo-perdiste', 2, 5, array['eaf2df19-675a-53d8-831d-2da51e9ece65', '5382da10-bdf7-5200-b407-5f735c051059', '44ca9597-2014-5de0-9b02-a8f24dea5648', '712fe2a8-364c-58b2-a9aa-dab86773a3ab']::uuid[], '6cf25dfb-8493-597a-85fe-620af05bcf30'::uuid),
  ('practica-me-hubiera-gustado', null, null, '{}'::uuid[], 'c1887b5c-c778-50e5-9a6f-72e652f04d93'::uuid),
  ('lo-que-pasa-es-que', 2, 5, array['02f0d2a7-64dd-5c05-9059-b71b94f77f12', '25a0b94d-34c2-52c9-9e2d-9c5a56678bce']::uuid[], 'aad59ed5-ef8e-5704-be75-2993e5423bc4'::uuid),
  ('lo-que-paso-fue-que', 3, 7, array['d5f7d7ac-79ab-5cfc-94b9-750cf23dee0f', '819ba6ce-577d-55fb-a681-e4b285236bd3']::uuid[], '83b5c7f1-71c5-5932-aea0-aa3710c8684f'::uuid),
  ('lo-mio-lo-tuyo', 2, 6, array['af9c8d7d-b3a3-5050-9588-ecf334012e01', '938154b1-6390-5ea0-979f-1239ac4f03e1', '94971a0e-cec5-53c2-a161-40b2963b02c1', 'e07ee2b7-13ec-5a0d-a571-4151cba36576']::uuid[], 'bf03e6dc-99b6-57a3-a39d-6bce82fabf66'::uuid),
  ('como-dice-el-dicho', 2, 6, array['124017e2-1dd1-5170-b9bc-87af6ccd5c47', 'fa9366c4-c0b3-552c-9aae-8cfbdf106045']::uuid[], '27741f8f-77af-54c7-914a-276cf2d58114'::uuid),
  ('cada-loco-con-su-tema', 4, 11, array['fabf6709-3000-5210-b3e0-75386f326868', '57d78235-59d0-5331-a72a-14829a212478']::uuid[], 'b2176f55-2545-5335-a151-508997505c83'::uuid),
  ('practica-cada-loco-con-su-tema', null, null, '{}'::uuid[], '595320a7-9ac0-5031-b87a-e0a0ec3a4931'::uuid),
  ('me-hizo-reir', 3, 7, array['cb244ddc-1627-5906-a0dd-684df1dd8718', '1554207d-1846-5c53-9dc2-3e7690657428']::uuid[], 'd93fec8d-7989-535d-836e-2a36db6a8b94'::uuid),
  ('me-mori-de-risa', 3, 8, array['955c16c7-402c-51a3-865e-a7d95c3bcbe5', 'd94b1a62-7619-55d8-8355-a6f86c1689df']::uuid[], '757d5d0d-64b6-5c32-a9f5-70fc1c063aa4'::uuid),
  ('me-hizo-sentir', 3, 7, array['c9506cc1-adca-5168-9f22-cff1799312d2', '3483c426-7907-5453-a03a-6d23db1dd2b5', '1fc6f891-2fdc-56f3-b9d7-4e5284457c85', 'eb51572d-4c4e-5dd4-a325-528de320ddd5', '188a9504-386b-5c14-ab26-a39c923375ea']::uuid[], 'cc6c3b25-98bb-527d-8e3e-48b6ecc5adc8'::uuid),
  ('cuanto-mas', 2, 4, array['b760dd06-6075-5b05-a563-e7c1b370ae16', 'c720719a-a185-5b63-82ac-a216c85b7260']::uuid[], 'f9e64179-37b8-5992-bb8e-ffffa0c365a1'::uuid),
  ('cuanto-antes-lleguemos', 4, 12, array['2fca3a10-22fc-5341-8085-18978ee09aac', '4ade5c6b-d750-567c-acea-e5542c325288']::uuid[], '4c032021-4c51-551d-b520-323a7a9c7d3a'::uuid),
  ('practica-me-mori-de-risa', null, null, '{}'::uuid[], '4c82177f-44a0-58dc-8a84-e1a4765feab6'::uuid),
  ('sin-ofender', 3, 9, array['4ce66870-83e3-51f6-bf2d-ae2bf562084e', '04e096fa-5303-5496-a03c-bf10fd1c8e00']::uuid[], '4307d60b-cb38-5782-90b8-9896a8e13ec5'::uuid),
  ('no-te-lo-tomes-a-mal', 2, 6, array['3bfcb9cb-d1d3-5803-b3b9-82fb052d4e03', 'fa59b274-0748-5b61-968a-738c1c35d43d']::uuid[], 'ddb39ae4-7aad-5210-b667-046e55637d83'::uuid),
  ('me-cayo-la-ficha', 2, 6, array['8fab619c-537e-530b-ac37-541a500b77a1', 'd5068f13-f6e9-57ce-bc43-292971abc10e']::uuid[], 'f0e4a2f4-1187-586c-9e85-35a7b7c8713f'::uuid),
  ('me-hace-ruido', 4, 11, array['cadb697e-ee79-5421-adf2-fd73164ff7a3', 'c5309507-df36-5cc3-89da-b6f4b7299222']::uuid[], '21345139-a11d-56c2-90c1-8289e2f7dc72'::uuid),
  ('practica-me-hace-ruido', null, null, '{}'::uuid[], '689390f0-1dcf-51ca-b780-be4a6e5de49f'::uuid),
  ('mis-abuelos-italianos', 3, 8, array['258c1b02-2b13-53fd-8cdb-dd6f863da54c', 'a7e53cf1-76cc-5642-bc2b-667712f35b16']::uuid[], '6712edfa-4eed-5161-8e3d-2c05c8f381d0'::uuid),
  ('se-instalaron-en-la-boca', 3, 7, array['6e3b8afa-62ca-5c03-b0df-2f3c6d447057', 'adcdeac9-3636-5ab3-8888-81e7db974100']::uuid[], 'a38045fc-f469-5d58-a2f2-2580dfbfdf1e'::uuid),
  ('mis-raices', 3, 8, array['7aa54cf9-2611-571b-aae6-e48d6cba0752', 'a0dbe317-2749-57ce-a6af-a8a36b1c2720', '009a9432-6c2e-517d-969d-346cf885282a', '2583e064-7a0d-5182-a421-471e6c66b5f6', '14e1e0c1-97e4-5889-b81d-7668e32aff7a']::uuid[], '8146189a-f706-5ffd-8e7e-04d60a60d338'::uuid),
  ('practica-se-instalaron', null, null, '{}'::uuid[], 'deef5a9c-4a8c-55be-bf81-85b504bb3586'::uuid),
  ('me-emocione', 3, 7, array['36be7a88-416f-593c-b0d8-5e2dac56ed52', '55d04726-9bde-5376-9cf5-7ff6b831d3a9']::uuid[], '981876d0-66e9-5759-8326-2da855cfdd28'::uuid),
  ('se-emociono', 5, 13, array['c95fe954-1ac0-51c2-ba6d-798b5b816a21', '2ef858b1-b96a-5e6a-9542-db39568b03ff']::uuid[], '215e82a3-6270-568c-8f36-2fd033d2e9fd'::uuid),
  ('practica-se-emociono', null, null, '{}'::uuid[], 'ecd1fdb8-4fa9-5060-a42b-20cc7680383f'::uuid),
  ('gracias-por-todo', 3, 7, array['bce11c9b-ba07-53d4-a542-4cd2abbaefc0', '465c96b5-03bb-5852-b1ae-802d00acea7f']::uuid[], '72754450-bc68-580e-b30d-69b6d6ff5df4'::uuid),
  ('que-andes-bien', 4, 10, array['8c626bd1-666a-5287-9d68-1ba6fe96852c', '80eb0c83-0c69-5eab-b1d8-e3616077f670', '48522766-8a1b-5b3e-8ef4-cb361cd434e3', 'eed29ccd-e082-5c7c-8844-71754abe5dd0', '2d7fa6ad-df75-5412-9a81-b2c8d025181d', '7c022e80-149a-560c-8d74-a98e3ce0cc69']::uuid[], '270ee376-0302-5f13-8ebc-6fabe82adc4f'::uuid),
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
