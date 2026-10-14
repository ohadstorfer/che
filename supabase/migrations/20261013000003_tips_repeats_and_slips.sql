-- Tips: repeats and slips found in the 2026-10-13 review (docs/course/review-2026-10-13-tips-fixes.md).
-- Where two tips in one unit, or in neighbouring units, said the same thing,
-- the repeat is cut from one of them and what only it said is kept. Each
-- update is guarded by the wording it replaces.

-- clima · Weather with hacer: seasons are the next unit's whole tip
update public.tips set title_en = $tip$Weather with hacer$tip$, body_md = $tip$**Hace calor**, **hace frío** — it's hot, it's cold. But **hay sol**, **hay viento**, **está nublado**, and **llueve** alone (for right now you'll also hear *está lloviendo*).

You yourself **tenés frío**.

**Bárbaro** means *great*, not barbaric: *Hay un sol bárbaro* — it's really sunny.$tip$, updated_at = now() where id = 'd48b1ff9-881c-5010-bbf2-fd3a16bc7729' and body_md = $tip$**Hace calor**, **hace frío** — it's hot, it's cold. But **hay sol**, **hay viento**, **está nublado**, and **llueve** alone (for right now you'll also hear *está lloviendo*).

You yourself **tenés frío**. Seasons are flipped: *el verano* runs from late December to March.

**Bárbaro** means *great*, not barbaric: *Hay un sol bárbaro* — it's really sunny.$tip$;
-- en-verano · Seasons are flipped: months without capitals is taught with the months, next unit
update public.tips set title_en = $tip$Seasons are flipped$tip$, body_md = $tip$Argentina is in the south, so the seasons are the other way round.

**El verano** runs from late December to March, and **julio** is the middle of **el invierno**: *En enero hace calor.*$tip$, updated_at = now() where id = '8836c476-9c61-528f-a283-ae3ef74287f4' and body_md = $tip$Argentina is in the south, so the seasons are the other way round.

**El verano** runs from late December to March, and **julio** is the middle of **el invierno**: *En enero hace calor.*

Months have no capital letter.$tip$;
-- me-puse-nervioso · Me puse, me enojé: ponerse + feeling is the unit's other tip
update public.tips set title_en = $tip$Me puse, me enojé$tip$, body_md = $tip$| | ponerse | enojarse |
| yo | **me puse** | **me enojé** |
| vos | **te pusiste** | **te enojaste** |
| él, ella | **se puso** | **se enojó** |

The pronoun stays in the past.$tip$, updated_at = now() where id = '27cf7ef4-754e-5b11-b0be-c8d19ba3767d' and body_md = $tip$| | ponerse | enojarse |
| yo | **me puse** | **me enojé** |
| vos | **te pusiste** | **te enojaste** |
| él, ella | **se puso** | **se enojó** |

The pronoun stays in the past. **Ponerse** + a feeling is *to get*: *me puse nervioso* — *I got nervous*.$tip$;
-- me-puse-nervioso · Ponerse: to get (a feeling): gloss said "was happy" in the tip that teaches "got"
update public.tips set title_en = $tip$Ponerse: to get (a feeling)$tip$, body_md = $tip$**Me puse nervioso** — *I got nervous*; **se puso contenta** — *she got happy*. The feeling changes, so it's *ponerse*, in the preterite.$tip$, updated_at = now() where id = 'c6f60906-d59e-542e-8047-b8fad681b872' and body_md = $tip$**Me puse nervioso** — *I got nervous*; **se puso contenta** — *she was happy* (word for word: she got happy). The feeling changes, so it's *ponerse*, in the preterite.$tip$;
-- sono-el-timbre · Going on, then it happened: estaba + -ando is the unit's next tip
update public.tips set title_en = $tip$Going on, then it happened$tip$, body_md = $tip$| going on — imperfect | then — preterite |
| **Estaba** en la ducha | cuando **sonó** el timbre. |
| **Volvía** a casa | cuando **empezó** a llover. |
| **Eran** las tres y no **había** luz | cuando **entró** Juan. |$tip$, updated_at = now() where id = 'a390b00d-73fa-51cf-9cca-48c5c5775ea8' and body_md = $tip$| going on — imperfect | then — preterite |
| **Estaba** en la ducha | cuando **sonó** el timbre. |
| **Volvía** a casa | cuando **empezó** a llover. |
| **Eran** las tres y no **había** luz | cuando **entró** Juan. |

**Estaba** + *-ando, -iendo* is right in the middle of it: *estaba durmiendo cuando sonó el celu.*$tip$;
-- el-tramite · Sacar turno: sacar turno is the tip of the unit before; this one is about the DNI
update public.tips set title_en = $tip$El DNI$tip$, body_md = $tip$For almost anything official you bring the **DNI**, the national ID card.

As a foreigner, you use your passport until you get your own DNI.$tip$, updated_at = now() where id = '96bfd871-c811-5edf-8fe3-6f07c3c37007' and body_md = $tip$For almost anything official you first **sacás turno**: you book an appointment online.

You bring the **DNI**, the national ID card. As a foreigner, you use your passport until you get your own DNI.$tip$;
-- te-di-la-llave · Di, busqué: the two meanings of buscar were explained two units back
update public.tips set title_en = $tip$Di, busqué$tip$, body_md = $tip$**Dar** has a short past with no accents: **di, diste, dio** — *le di la llave*.

And *buscar* bends in *yo* to keep the hard *c* sound: **busqué** (not *buscé*): *busqué la billetera*, *la busqué a Mica en la estación*.$tip$, updated_at = now() where id = '7fd0a81b-3973-5a9c-8a43-62a122aa7461' and body_md = $tip$**Dar** has a short past with no accents: **di, diste, dio** — *le di la llave*.

And *buscar* bends in *yo* to keep the hard *c* sound: **busqué** (not *buscé*).

**Buscar** is *to look for* and also *to pick someone up*: *busqué la billetera*, *la busqué a Mica en la estación*.$tip$;
-- en-la-verduleria · La papa, la cebolla: verde for unripe is taught two units later, with madura
update public.tips set title_en = $tip$La papa, la cebolla$tip$, body_md = $tip$For produce porteños often use the singular for the whole product: **la papa está cara** — *potatoes are expensive*; **un kilo de cebolla** — *a kilo of onions*.$tip$, updated_at = now() where id = 'a7acb74c-66af-5b76-bee7-4e80edc61c85' and body_md = $tip$For produce porteños often use the singular for the whole product: **la papa está cara** — *potatoes are expensive*; **un kilo de cebolla** — *a kilo of onions*.

Fruit that **está verde** is *not ripe* yet (*es verde* is the color).$tip$;
-- llegaron-tarde · The -ar past for everyone: the pagué, llegué spelling is the tip of the unit before, and the table shows it
update public.tips set title_en = $tip$The -ar past for everyone$tip$, body_md = $tip$| | cenar | pagar | llegar |
| yo | cen**é** | pag**ué** | lleg**ué** |
| vos | cen**aste** | pag**aste** | lleg**aste** |
| él, ella | cen**ó** | pag**ó** | lleg**ó** |
| nosotros | cen**amos** | pag**amos** | lleg**amos** |
| ellos, ustedes | cen**aron** | pag**aron** | lleg**aron** |

*-amos* looks like the present, so the time says which: **anoche cenamos afuera**. *-aron* is only ever the past: *hablaron, tomaron*.$tip$, updated_at = now() where id = '7e1f82d2-cee5-5c5a-b728-6c4040631839' and body_md = $tip$| | cenar | pagar | llegar |
| yo | cen**é** | pag**ué** | lleg**ué** |
| vos | cen**aste** | pag**aste** | lleg**aste** |
| él, ella | cen**ó** | pag**ó** | lleg**ó** |
| nosotros | cen**amos** | pag**amos** | lleg**amos** |
| ellos, ustedes | cen**aron** | pag**aron** | lleg**aron** |

*-amos* looks like the present, so the time says which: **anoche cenamos afuera**. *-aron* is only ever the past: *hablaron, tomaron*.

In *yo*, *-gar* verbs add a *u* to keep the hard *g*: **pagué**, **llegué**.$tip$;
-- me-gustaria · Me gustaría: ordering with quería is the unit's other tip
update public.tips set title_en = $tip$Me gustaría$tip$, body_md = $tip$**Me gustaría** — *I'd like* — is *gustar* in the conditional, with the same *me*. Examples: **me gustaría ir**, **¿te gustaría venir?**

**Me encantaría** is the enthusiastic yes. For more than one thing, **-ían**: **nos encantarían unas empanadas**.$tip$, updated_at = now() where id = '7fef5512-863f-5d20-a29e-02e373792bb2' and body_md = $tip$**Me gustaría** — *I'd like* — is *gustar* in the conditional, with the same *me*. Examples: **me gustaría ir**, **¿te gustaría venir?**

**Me encantaría** is the enthusiastic yes. For more than one thing, **-ían**: **nos encantarían unas empanadas**.

To order or offer, porteños say **quería** or **¿querés?**: *¿querés tomar unos mates?*$tip$;
-- que-bueno · Me molesta: the sentence is in the unit's table
update public.tips set title_en = $tip$Me molesta$tip$, body_md = $tip$*Molestar* works like *gustar*: **me molesta** — *it bothers me*.$tip$, updated_at = now() where id = '98da0042-49a1-5c74-930f-a2b3272b71a6' and body_md = $tip$**Me molesta que llegue tarde** — *it bothers me that he's late*. *Molestar* works like *gustar*.$tip$;
-- me-preocupa · Qué suerte que: both examples are in the unit's table
update public.tips set title_en = $tip$Qué suerte que$tip$, body_md = $tip$Any *qué* + reaction + *que* brings the subjunctive.

**Estemos** is *we*: **-mos** on the end.

About something already over, porteños just use the past: **¡qué suerte que no llovió!**$tip$, updated_at = now() where id = '74fa9b53-73dc-5c65-939e-c1ab90984cc7' and body_md = $tip$Any *qué* + reaction + *que* brings the subjunctive.

**¡Qué suerte que vivas cerca!**, **¡qué bueno que estemos todos juntos!** **Estemos** is *we*: **-mos** on the end.

About something already over, porteños just use the past: **¡qué suerte que no llovió!**$tip$;
-- te-doy-una-mano · Dejá, faltaba más: the exchanges are in the unit's table; this keeps what the table lacks
update public.tips set title_en = $tip$Dejá, faltaba más$tip$, body_md = $tip$**No es nada** and **faltaba más** both mean *don't mention it*.

They may call you **querido** or **querida**.$tip$, updated_at = now() where id = '787e171d-c6b2-56b6-bfd5-86c95f58c4b7' and body_md = $tip$Offer help with **te doy una mano**. If they try to carry the bags themselves: **dejá, dejá**.

When they thank you: **no es nada** or **faltaba más** (*don't mention it*).

They may call you **querido** or **querida**.$tip$;
-- necesito-que-me-ayudes · Necesito que, ¿querés que…?: the offer has its own tip in the unit
update public.tips set title_en = $tip$Necesito que, ¿querés que…?$tip$, body_md = $tip$| | vos | yo, él, ella |
| ayudar | **ayudes** | **ayude** |
| esperar | **esperes** | **espere** |
| poner | **pongas** | **ponga** |
| traer | **traigas** | **traiga** |
| llevar | **lleves** | **lleve** |
| dar | **des** | **dé** |

**Necesito que**, **te pido que** and **prefiero que** all take the subjunctive: *necesito que me ayudes*.

For *we*: **¿qué querés que hagamos?**$tip$, updated_at = now() where id = '97dca14e-cd84-59a4-a265-0f49870f1689' and body_md = $tip$| | vos | yo, él, ella |
| ayudar | **ayudes** | **ayude** |
| esperar | **esperes** | **espere** |
| poner | **pongas** | **ponga** |
| traer | **traigas** | **traiga** |
| llevar | **lleves** | **lleve** |
| dar | **des** | **dé** |

**Necesito que**, **te pido que**, **prefiero que** and the offer **¿querés que…?** all take the subjunctive: *necesito que me ayudes*, *¿querés que te lleve?*

For *we*: **¿qué querés que hagamos?**$tip$;
-- puede-ser-que · Puede ser que, for them: puede ser que is the unit's other tip, with the same example
update public.tips set title_en = $tip$Puede ser que, for them$tip$, body_md = $tip$| | él, ella | ellos |
| ser | sea | **sean** |
| estar | esté | **estén** |
| tener | tenga | **tengan** |
| poder | pueda | **puedan** |
| llegar | llegue | **lleguen** |

For *they*, add **-n**. The same form is *you* for a group: *que tengan buen finde, chicos*.$tip$, updated_at = now() where id = '156c9226-d3ae-5d26-800e-823389b8a664' and body_md = $tip$| | él, ella | ellos |
| ser | sea | **sean** |
| estar | esté | **estén** |
| tener | tenga | **tengan** |
| poder | pueda | **puedan** |
| llegar | llegue | **lleguen** |

For *they*, add **-n**. The same form is *you* for a group: *que tengan buen finde, chicos*.

**Puede ser que** and **es posible que** take the subjunctive like *no creo que*: *puede ser que estén cerrados*.$tip$;
-- yo-en-tu-lugar · Yo en tu lugar: the same example is in the unit's table tip
update public.tips set title_en = $tip$Yo en tu lugar$tip$, body_md = $tip$**Yo en tu lugar** — *in your place, if I were you* — is like *yo que vos*, a little more serious.

The advice after it is still *would*: **yo me quedaría**.$tip$, updated_at = now() where id = 'f09f8f3b-acf3-5ae9-a200-3c92a0932524' and body_md = $tip$**Yo en tu lugar** — *in your place, if I were you* — is like *yo que vos*, a little more serious.

The advice after it is still *would*: **yo en tu lugar, hablaría con él**, **yo me quedaría**.$tip$;
-- es-un-afano · Qué embole: said in the tip of the unit before
update public.tips set title_en = $tip$Qué embole$tip$, body_md = $tip$**¡Qué embole!** — *how boring!* — for a rainy Sunday with nothing to do.$tip$, updated_at = now() where id = '931d857d-9b5d-5a8a-bb8f-5d48b43e1047' and body_md = $tip$**¡Qué embole!** — *how boring!* — for a rainy Sunday with nothing to do.

Like all of these: friends, not job interviews.$tip$;
-- no-es-que · No es que sea: the rule is in the unit's table tip
update public.tips set title_en = $tip$No es que sea$tip$, body_md = $tip$You already know the forms: **sea**, **esté**, **haya**, **tenga**.

*No es que sea caro, es que no tengo plata* — *it's not that it's expensive, I just have no money*. *No es que esté cansado, es que laburo temprano.*$tip$, updated_at = now() where id = 'e4442fba-2d7d-515f-bf95-5182892f4c7e' and body_md = $tip$After **no es que** any verb goes into the subjunctive. You already know the forms: **sea**, **esté**, **haya**, **tenga**.

*No es que sea caro, es que no tengo plata* — *it's not that it's expensive, I just have no money*. *No es que esté cansado, es que laburo temprano.*$tip$;
-- no-es-que-no-me-guste · No es que…, es que…: same title as the tip of the unit before
update public.tips set title_en = $tip$No es que no me importe$tip$, body_md = $tip$After **no es que**, verbs go subjunctive: **no es que no me interese** — *it's not that I'm not interested*; **no es que no me importe** — *it's not that I don't care*.

Or **no es que me caiga mal** — *it's not that I don't like him*; **no es que no queramos / podamos** — *it's not that we don't want to / can't*.

The real reason takes **es que** + a normal verb: *es que no llego* — *I just can't make it*.$tip$, updated_at = now() where id = '2f545600-080d-50bc-8cb8-ceb5c9b0db7e' and body_md = $tip$After **no es que**, verbs go subjunctive: **no es que no me interese** — *it's not that I'm not interested*; **no es que no me importe** — *it's not that I don't care*.

Or **no es que me caiga mal** — *it's not that I don't like him*; **no es que no queramos / podamos** — *it's not that we don't want to / can't*.

The real reason takes **es que** + a normal verb: *es que no llego* — *I just can't make it*.$tip$;
-- practica-el-cuarto-oscuro · Paro docente, hubo un apagón: the title named a phrase the tip does not have
update public.tips set title_en = $tip$Paro docente, hubo desvíos$tip$, body_md = $tip$**Paro docente**, **suspendieron las clases**, **hubo desvíos** — and the city **a pie**.$tip$, updated_at = now() where id = 'a7707333-9bed-5180-8835-8a8805c92044' and body_md = $tip$**Paro docente**, **suspendieron las clases**, **hubo desvíos** — and the city **a pie**.$tip$;
-- sobre-la-hora · Sobre la hora: a Spanish infinitive used as an English verb
update public.tips set title_en = $tip$Sobre la hora$tip$, body_md = $tip$**Sobre la hora** — *right at the deadline, at the very last minute*.

First a **borrador** — *a draft*. Then you correct it (**corregir**), and only then the **informe** or the **presentación**.

**¿Avanzaron?** — *any progress?*$tip$, updated_at = now() where id = '5b512731-476b-5b5f-8876-82ce3e6b19a4' and body_md = $tip$**Sobre la hora** — *right at the deadline, at the very last minute*.

First a **borrador** — *a draft* — then you **corregir** it, and only then the **informe** or the **presentación**.

**¿Avanzaron?** — *any progress?*$tip$;
-- se-merece-el-ascenso · En blanco, en negro: Spanish infinitives used as English verbs
update public.tips set title_en = $tip$En blanco, en negro$tip$, body_md = $tip$Before you negotiate (**negociar**), know what you're owed.

A job **en blanco** is *on the books*, with aguinaldo (an extra month's pay) and obra social (health insurance); **en negro** is *off the books*.

With inflation, the regular **ajuste** — *the pay adjustment* — is the first thing to demand (**exigir**).$tip$, updated_at = now() where id = '906103c0-8825-51f0-8f33-0bb01926b4d9' and body_md = $tip$Before you **negociar**, know what you're owed.

A job **en blanco** is *on the books*, with aguinaldo (an extra month's pay) and obra social (health insurance); **en negro** is *off the books*.

With inflation, the regular **ajuste** — *the pay adjustment* — is the first thing you **exigir**.$tip$;
-- la-parrilla · El asado: the one cut left unmarked
update public.tips set title_en = $tip$El asado$tip$, body_md = $tip$An asado comes in order: first **chorizo** and **morcilla**, the **achuras**, then the cuts — **vacío**, **tira de asado**.

A **choripán** is a chorizo in bread.$tip$, updated_at = now() where id = '9521c790-bf0b-5537-9298-425b9e6009f7' and body_md = $tip$An asado comes in order: first **chorizo** and **morcilla**, the **achuras**, then the cuts — **vacío**, tira de asado.

A **choripán** is a chorizo in bread.$tip$;
-- no-anda · No anda: doubled punctuation
update public.tips set title_en = $tip$No anda$tip$, body_md = $tip$For machines, porteños say **anda** — *it works*: **no anda el wifi**, **¿anda el ascensor?** *Funciona* means the same and is just as common.

Other ways things fail: **se rompió**, **está roto**, **no prende** — *it won't turn on*; **se colgó** — *it froze*; **pierde agua** — *it's leaking*.$tip$, updated_at = now() where id = '17c1c9e2-7e28-5f37-a171-3f6f56f5e112' and body_md = $tip$For machines, porteños say **anda** — *it works*: **no anda el wifi**, **¿anda el ascensor?**. *Funciona* means the same and is just as common.

Other ways things fail: **se rompió**, **está roto**, **no prende** — *it won't turn on*; **se colgó** — *it froze*; **pierde agua** — *it's leaking*.$tip$;
-- ni-ahi · Ni ahí: doubled punctuation
update public.tips set title_en = $tip$Ni ahí$tip$, body_md = $tip$**Ni ahí** — *no way, not even close* — is a strong porteño no, also to a question like **¿estás cansado?**

**Tal cual** — *exactly* — is how they agree.$tip$, updated_at = now() where id = '8b11e00f-7cc7-55ba-8620-af5bb3193910' and body_md = $tip$**Ni ahí** — *no way, not even close* — is a strong porteño no, also to a question like **¿estás cansado?**.

**Tal cual** — *exactly* — is how they agree.$tip$;
-- sos-turista had "Disculpá, permiso" twice: a draft the lesson pointed at, so the
-- lesson showed no tip, and a published copy no lesson used. The lesson now
-- points at the published one and the draft is retired.
update public.lesson_slots set tip_id = '7578114a-b5e4-5947-a129-52894ddcd1f7' where tip_id = '2ee7b356-9d31-5af9-a191-7b3049f6870d';
update public.tips set status = 'retired', updated_at = now() where id = '2ee7b356-9d31-5af9-a191-7b3049f6870d' and status = 'draft';
