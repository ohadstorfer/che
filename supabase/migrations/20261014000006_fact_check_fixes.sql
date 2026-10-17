-- Fact-check fixes, 2026-10-14 (owner's call). Tips that stated a rule too
-- strongly or wrongly, two word glosses, and one sentence that said Buenos
-- Aires is pricier than Montevideo (it's the other way round). Each update is
-- guarded by the text it replaces, so a row edited in the admin since is left alone.

-- se-me-quemo · plural of -er/-ir verbs is -ieron, not -eron
update public.tips set body_md = $tip$| | one thing | more than one |
| to me | **se me** quemó la comida | **se me** quemaron las tostadas |
| to you | **se te** quemó | **se te** quemaron |
| to us | **se nos** quemó | **se nos** quemaron |

The verb follows the thing: one thing **-ó** (**-ió** for -er and -ir verbs), more than one **-aron** (**-ieron**): *se me rompió, se me rompieron*.

The middle word says who it happened to: **se me**, **se te**, **se le**, **se nos**.$tip$, updated_at = now() where id = 'aa612ce1-aae0-5abb-ac0a-dce44906d427' and body_md = $tip$| | one thing | more than one |
| to me | **se me** quemó la comida | **se me** quemaron las tostadas |
| to you | **se te** quemó | **se te** quemaron |
| to us | **se nos** quemó | **se nos** quemaron |

The verb follows the thing: one thing **-ó**, more than one **-aron / -eron**.

The middle word says who it happened to: **se me**, **se te**, **se le**, **se nos**.$tip$;
-- no-entiendo · soy is already taught, so sé is not the only I form without -o
update public.tips set body_md = $tip$The *I* form usually ends in **-o**: **hablo**, **entiendo**. The vos form is stressed on the end: **hablás**, **entendés**, **repetís**.

A few verbs are different: you already know **soy**, and *I know* is **sé** (the vos form is **sabés**).

**Me** (*me*) and **te** (*you*) go before the verb: *No te entiendo. ¿Me entendés?*$tip$, updated_at = now() where id = '3ddb4cb9-dbfd-5829-b717-aec8064fbb90' and body_md = $tip$The *I* form ends in **-o**: **hablo**, **entiendo**. The vos form is stressed on the end: **hablás**, **entendés**, **repetís**.

One verb is different: *I know* is **sé**, and the vos form is **sabés**.

**Me** (*me*) and **te** (*you*) go before the verb: *No te entiendo. ¿Me entendés?*$tip$;
-- te-llame · the pronoun can also go on the end after voy a (taught in feliz-cumple)
update public.tips set body_md = $tip$| the thing | ¿El mensaje? **Lo** recibí. | ¿La foto? **La** mandé. |
| the person | ¿A Sofi? **La** llamé ayer. | ¿A Juan? **Lo** vi. |
| to him, her | **Le** di la llave. | **Les** mandé las fotos. |
| me, you | **Te** llamé. | ¿**Me** llamaste? |

With one verb, past or present, it goes before it. A command takes it on the end: **mostrame**, **buscame**. After *voy a* it can go either way: *te voy a llamar*, *voy a llamarte*.$tip$, updated_at = now() where id = '55cd8bcd-631a-514e-9edb-a1999046aafb' and body_md = $tip$| the thing | ¿El mensaje? **Lo** recibí. | ¿La foto? **La** mandé. |
| the person | ¿A Sofi? **La** llamé ayer. | ¿A Juan? **Lo** vi. |
| to him, her | **Le** di la llave. | **Les** mandé las fotos. |
| me, you | **Te** llamé. | ¿**Me** llamaste? |

Before the verb, past or present. Only a command takes it on the end: **mostrame**, **buscame**.$tip$;
-- practica-las-vacaciones · same, drop "always"
update public.tips set body_md = $tip$The pronoun works the same in the past: **¿Las fotos? Ya las mandé.** **¿El video? Lo vi anoche.** **¿A Sofi? La llamé ayer.** Before the verb, as in the present — a command takes it on the end.$tip$, updated_at = now() where id = '41d6e773-f273-597c-b1d9-b84748b48c24' and body_md = $tip$The pronoun works the same in the past: **¿Las fotos? Ya las mandé.** **¿El video? Lo vi anoche.** **¿A Sofi? La llamé ayer.** Before the verb, always — only a command takes it on the end.$tip$;
-- la-precaria · there is no paperwork/people split between demorar and tardar
update public.tips set body_md = $tip$**Demorar** is how long something takes, and Argentines use it for everything: **¿cuánto demora la residencia?**, *el bondi demoró un montón*.

**Tardar** means the same: *Lucía tardó media hora*.

You **presentás** the papers, and when they **atienden** you, it's over in five minutes.$tip$, updated_at = now() where id = '0a7f761b-d9c7-516c-b579-5874def00152' and body_md = $tip$For paperwork, **demorar** is how long something takes: **¿cuánto demora la residencia?**

For a person or a bus porteños say **tardar**: *Lucía tardó media hora*, *el bondi tardó un montón*.

You **presentás** the papers, and when they **atienden** you, it's over in five minutes.$tip$;
-- se-merece-el-ascenso · el ajuste on its own mostly means spending cuts
update public.tips set body_md = $tip$Before you negotiate (**negociar**), know what you're owed.

A job **en blanco** is *on the books*, with aguinaldo (an extra month's pay) and obra social (health insurance); **en negro** is *off the books*.

With inflation, the first thing to demand (**exigir**) is a regular **ajuste por inflación** — *a pay rise to keep up with prices* — or an *aumento*, a raise. Careful: on the news, **el ajuste** on its own means *spending cuts*.$tip$, updated_at = now() where id = '906103c0-8825-51f0-8f33-0bb01926b4d9' and body_md = $tip$Before you negotiate (**negociar**), know what you're owed.

A job **en blanco** is *on the books*, with aguinaldo (an extra month's pay) and obra social (health insurance); **en negro** is *off the books*.

With inflation, the regular **ajuste** — *the pay adjustment* — is the first thing to demand (**exigir**).$tip$;

-- es-muy-chico · chica fell back to the lemma's "kid, boy"
update public.forms set gloss_en = 'small, little; girl' where id = '8ed060a1-dc16-5283-8b9c-2243ed28d658' and gloss_en is null;
update public.forms set gloss_en = 'small, little; kids, boys' where id = 'e8908215-5cc2-55f3-81c3-d771fa54fe15' and gloss_en is null; -- chicos
-- me-cobras · palos fell back to the singular "a million pesos"
update public.forms set gloss_en = 'millions of pesos' where id = 'cb6124ff-e8fb-5bf5-ae79-e897fb685489' and gloss_en is null;

-- tiene-sus-cosas · Montevideo is the pricier city. Same id, so slots and
-- progress carry over; the clip said the old line, so audio_path is cleared
-- and the tokens are redone by course:retokenize, then course:gloss and course:tts.
update public.sentences set
  es = 'Comparado con Montevideo, el costo de vida no es tan alto.',
  en = 'Compared with Montevideo, the cost of living isn''t that high.',
  es_alt = array['El costo de vida no es tan alto comparado con Montevideo.'],
  en_alt = array['Compared to Montevideo, the cost of living isn''t that high.'],
  audio_path = null, updated_at = now()
  where id = 'da73e066-af90-53f7-82eb-39766833cfe0' and es = 'El costo de vida es alto comparado con Montevideo.';
