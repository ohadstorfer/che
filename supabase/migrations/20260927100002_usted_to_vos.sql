-- Argentina says vos to everyone, so the course stops teaching usted.
-- Units 282 (slug "usted", kept because every id hangs off it) and 283 now
-- teach politeness in vos; the usted forms, their sentences and the usted
-- sentences elsewhere are retired. New words: 20260927100001.

-- 1. Units
update public.units set
  title_en = 'Ask a stranger politely',
  summary_en = 'Disculpá que te moleste, ¿no tendrás cambio?',
  grammar_focus = '{cortesia,futuro.cortesia,subjuntivo.disculpa-que}'
where slug = 'usted';

update public.units set
  summary_en = 'Cómo no, doña Rosa, te doy una mano',
  grammar_focus = '{cortesia,imperativo.vos}'
where slug = 'como-no-dona-rosa';

update public.units set
  title_en = 'Practice: requests, questions and asking nicely',
  grammar_focus = '{repaso.discurso-referido,repaso.cortesia}'
where slug = 'practica-me-pidio';

update public.units set grammar_focus = '{repaso.discurso-referido,repaso.cortesia}'
where slug = 'practica-como-no';

-- Review lists: swap the usted words for the new ones, same place in the list.
update public.units u set review_form_ids = (
  select array_agg(coalesce(r.new_id, x.id) order by x.ord)
  from unnest(u.review_form_ids) with ordinality x(id, ord)
  left join (values
    ((select id from public.forms where form = 'usted' and unit_id = (select id from public.units where slug = 'usted')), 'cb118049-3f64-5a75-b9b5-30bea82f4c0e'::uuid),
    ((select id from public.forms where form = 'disculpe' and unit_id = (select id from public.units where slug = 'usted')), '896d756f-a78e-5bc7-b295-be48c7e051fe'::uuid),
    ((select id from public.forms where form = 'espere' and unit_id = (select id from public.units where slug = 'como-no-dona-rosa')), '9da1a249-23b1-567a-a02f-b6025753cdb3'::uuid),
    ((select id from public.forms where form = 'dígame' and unit_id = (select id from public.units where slug = 'como-no-dona-rosa')), '1397e62a-eb61-5724-be04-a1aeaf41df1b'::uuid)
  ) r(old_id, new_id) on r.old_id = x.id
)
where slug in ('practica-me-pidio', 'practica-como-no');

update public.units set review_form_ids = array_replace(review_form_ids,
  (select id from public.forms where form = 'usted' and unit_id = (select id from public.units where slug = 'usted')),
  'c2da3c66-e4dc-525e-a6bc-51a4b0685600'::uuid)
where slug = 'practica-resulta-que';

-- 2. Tips (same ids, so the same places in the units)
update public.tips set status = 'published', title_en = 'Polite, still vos', body_md =
'Porteños say **vos** to everyone: the shop owner, a doctor, an old man on the bus. The politeness lives in the words around it: **disculpá que te moleste**, **perdón por la molestia**, **muy amable**.'
where id = 'dda7b964-bb56-5e48-bc13-d19abd0fc766';

update public.tips set title_en = 'Quisiera, ¿no tendrás…?', body_md =
'The politest way to ask is **quisiera** — *I''d like*: **quisiera un turno**. To ask a stranger for something, add **no** and the future: **¿no tendrás hora?** — *you wouldn''t have the time?*'
where id = '1d87549c-7542-53ad-8a97-9ed8aef021a6';

update public.tips set title_en = 'Softening a request', body_md =
'| straight | softer |
| ¿Tenés cambio? | ¿**No tendrás** cambio? |
| ¿Sabés dónde queda? | ¿**No sabrás** dónde queda? |
| Quiero un turno. | **Quisiera** un turno. |
| Perdón. | **Disculpá que te moleste**. |

**No** plus the future turns a question into a gentle one: *you wouldn''t happen to…?* After **disculpá que**, the verb takes the subjunctive: *te moleste*.'
where id = 'e41cacc8-f196-569f-9838-bdd51d5857fa';

update public.tips set body_md =
'The old neighbor is **don José** or **doña Rosa** — first name, with respect. A **persona mayor**, a **jubilado**, still gets **vos**, plus a **cómo no** (*of course*) and a **con permiso** as you squeeze past.'
where id = '0da84ce9-08d5-56d5-bf04-81b8a54b1746';

update public.tips set status = 'published', title_en = 'Dejá, faltaba más', body_md =
'Offer help with **te doy una mano**. If they try to carry the bags themselves: **dejá, dejá**. When they thank you: **no es nada** or **faltaba más** (*don''t mention it*). And they may call you **querido** or **querida**.'
where id = '787e171d-c6b2-56b6-bfd5-86c95f58c4b7';

update public.tips set title_en = 'Warm, not formal', body_md =
'| they say | you answer |
| ¿Me ayudás con las bolsas? | **Cómo no**, **te doy una mano**. |
| Gracias, querido. | **No es nada.** / **Faltaba más.** |
| No, no, yo puedo. | **Dejá, dejá**, que te las llevo. |

Respect for **don José** and **doña Rosa** comes from the tone, not from usted.'
where id = '21829487-95ad-5825-803c-427aa8104d42';

update public.tips set title_en = 'Asking nicely', body_md =
'**Disculpá que te moleste**, **¿no tendrás…?**, **quisiera** — polite without leaving vos.'
where id = '91a09edc-d241-50cf-8f47-268ab52bfee5';

update public.tips set title_en = 'Cómo no, faltaba más', body_md =
'With **don José** and **doña Rosa**: **te doy una mano**, **dejá**, **cómo no**, **faltaba más** — vos, said warmly.'
where id = 'e05a6f2c-db31-58b3-91ea-a33abfd335c9';

-- 3. Sentences: every one that uses an usted form, plus usted address the
-- forms don't show (¿Tiene cambio?, Le agradezco, Estimado señor, le…).
create temp table usted_forms on commit drop as
select f.id from public.forms f join public.units u on u.id = f.unit_id
where (u.slug = 'usted' and f.form in ('disculpe', 'usted', 'pase', 'siéntese'))
   or (u.slug = 'como-no-dona-rosa' and f.form in ('mire', 'firme', 'espere', 'dígame', 'tome', 'perdone'));

update public.sentences s set status = 'retired'
where s.status <> 'retired' and (
  s.target_form_id in (select id from usted_forms)
  or exists (select 1 from jsonb_array_elements(s.tokens) t, jsonb_array_elements_text(t->'form_ids') x
             where x::uuid in (select id from usted_forms))
  or s.id in (
    '04bfe671-c522-5fe1-931d-eddcb12d34a4',
    'e73786db-14cd-55bd-98c0-6c3eac0f6d37',
    'c3027013-cc82-5563-bc69-b4508805caa5',
    'bd9115fc-fcfc-5877-bf6a-36f9bce7c548',
    '426967a5-73d0-581e-9ce5-40f69835f79c',
    '1facfe11-7f77-5247-ad3c-adcc89408cc7',
    '5df02b30-381e-51a4-a193-2398587d3643',
    '9c7941a2-9b1a-50dc-be93-8fc1d2734c91',
    'e2dd96fd-329d-5fc7-a02c-d4cbaa31d8f9',
    '4d0adad8-cf4d-54d3-b6f9-9300cd83118b',
    'c2221c8a-1b6b-58ad-aaaa-153a09d18218',
    '8525b027-637e-5144-9484-0090e8d69077',
    '0e06f65f-6da7-5ac7-bf1d-ba83c344f593',
    '367574a5-c36f-5793-aaaa-65085712fdc9',
    '46617c33-ec20-56a0-939d-9a7811f575db',
    'adf44189-7068-5d21-b051-5c5658ef1b97',
    'ae526999-9bb2-5787-9e95-f4806c472c1d',
    '0be461bb-746c-5467-9445-7384b1157515',
    '6977586a-c87d-59dc-9963-e6898781ce97',
    '06507d79-5b32-53f2-bc06-7990ee009a1b',
    'ee465034-91a4-56a2-bfbb-3598684819fc',
    '912183f8-e838-5f74-9f22-0c488c1a0d91',
    '382c3fc5-72ac-5ebc-90df-9f1e7fb86f54',
    '8c978cb6-e2b9-5e17-bee1-d68d29cb9f47',
    'd254fdf9-9b1c-5a3b-8546-5a185f630a90',
    '267f9fce-cc14-596c-a313-5b07d7fec551',
    '6c2bba75-bf89-515b-bc43-5018a2330cbb'
  ));

-- 4. The forms, and the usted lemma
update public.forms set status = 'retired' where id in (select id from usted_forms);
update public.lemmas set status = 'retired' where lemma = 'usted' and pos = 'pron';
