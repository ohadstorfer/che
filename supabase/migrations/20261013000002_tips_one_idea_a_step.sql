-- Tips, one idea a paragraph: each tip is now read a step at a time (tipSteps in
-- src/lib/tip-layout.ts), and a step is a paragraph. 611 bodies are reworded: a blank
-- line where the idea changes, and filler cut. No Spanish is changed, no table,
-- and every bold word is kept. Each update is guarded by the wording it replaces.
-- Before and after: docs/course/review-2026-10-13-tips.md

update public.tips set body_md = $tip$A word ending in a vowel adds **-s**: *galletita → galletitas*. One ending in a consonant adds **-es**: *alfajor → **alfajores***.

With a number, *un* and *una* drop out: *dos paquetes*.

Containers take **de**: *una botella de agua*, *un paquete de chicles*.$tip$, updated_at = now() where id = '1c3decf9-4230-5b82-8977-3554b239262d' and body_md = $tip$A word ending in a vowel adds **-s**: *galletita → galletitas*, *chicle → chicles*. One ending in a consonant adds **-es**: *alfajor → **alfajores***. With a number, *un* and *una* drop out: *dos paquetes*. Containers take **de**: *una botella de agua*, *un paquete de chicles*.$tip$;
update public.tips set body_md = $tip$When someone says *gracias*, answer **de nada**.

*Of course* is **claro**.

When everything is fine or agreed, porteños say **¡joya!**: *¿Todo bien? — ¡Joya!*$tip$, updated_at = now() where id = '73cc59dc-ddb9-5779-b542-a35b9fd331ff' and body_md = $tip$When someone says *gracias*, answer **de nada**. *Of course* is **claro**. And when everything is fine or agreed, porteños say **¡joya!** — *¿Todo bien? — ¡Joya!*$tip$;
update public.tips set body_md = $tip$In Buenos Aires the morning greeting is **buen día**, until lunch.

After that it's **buenas tardes**, and once it's dark **buenas noches** — hello *and* goodbye.

Short for any of them: **buenas**.$tip$, updated_at = now() where id = 'bc1f8253-cff9-5535-923b-d4d417fb4742' and body_md = $tip$In Buenos Aires the morning greeting is **buen día**, until lunch. After that it's **buenas tardes**, and once it's dark **buenas noches** — hello *and* goodbye. Short for any of them: **buenas**.$tip$;
update public.tips set body_md = $tip$The little word in front changes with the person, and so does the verb:

| yo | **me llamo** | my name is |
| vos | **te llamás** | your name is |

The question puts *cómo* first: **¿Cómo te llamás?**

The vos form ends in **-ás**, with the stress on the end.$tip$, updated_at = now() where id = '88e0500d-b041-54ab-ab18-c50d35efe8c0' and body_md = $tip$The little word in front changes with the person, and so does the verb:

| yo | **me llamo** | my name is |
| vos | **te llamás** | your name is |

The question puts *cómo* first: **¿Cómo te llamás?** The vos form ends in **-ás**, with the stress on the end.$tip$;
update public.tips set body_md = $tip$**¿Cuánto sale?** is the everyday Argentine way to ask a price. You can also say **¿cuánto cuesta?**

For more than one thing the verb changes: **¿cuánto salen?**, **¿cuánto cuestan?**$tip$, updated_at = now() where id = '2b07464d-38f9-507b-bfa2-be0acb5aa850' and body_md = $tip$**¿Cuánto sale?** is the everyday Argentine way to ask a price — **¿cuánto cuesta?** works too and means the same. For more than one thing the verb changes: **¿cuánto salen?**, **¿cuánto cuestan?**$tip$;
update public.tips set body_md = $tip$One thousand is just **mil** — never *un mil* — and the word does not change: *Sale mil pesos.*

**Caro** and **barato** end in **-a** for a *la* word: *una gaseosa no es cara*.

**¡Qué caro!** — *How expensive!*$tip$, updated_at = now() where id = 'b29680d4-b383-5aa7-a81f-ac7b3e1b8450' and body_md = $tip$Argentine prices run into the thousands, so you will say **mil** all day. One thousand is just **mil** — never *un mil* — and the word does not change: *Sale mil pesos.* *¿Mil pesos? Es caro.* **Caro** and **barato** end in **-a** for a *la* word: *una gaseosa no es cara*. **¡Qué caro!** — *How expensive!*$tip$;
update public.tips set body_md = $tip$**¿Cuánto sale?** is the everyday Argentine way to ask a price; *¿cuánto cuesta?* works too. Several things **salen** or **cuestan**: *¿cuánto salen las zapatillas?*

*To pay* and *to buy* follow one pattern: **pago**, **pagás**, **paga** and **compro**, **comprás**, **compra**. At the register: *¿tarjeta o efectivo?* — *card or cash?*

**Mangos** is slang for pesos: *no tengo un mango* means *I don't have a peso*.$tip$, updated_at = now() where id = 'fe95866f-3747-5f76-84e6-70b1453b221c' and body_md = $tip$**¿Cuánto sale?** is the everyday Argentine way to ask a price — *¿cuánto cuesta?* works too. Several things **salen** or **cuestan**: *¿cuánto salen las zapatillas?* *To pay* and *to buy* follow one pattern: **pago**, **pagás**, **paga** and **compro**, **comprás**, **compra**. *¿Pagás vos o pago yo?* At the register: *¿tarjeta o efectivo?* — *card or cash?* **Mangos** is slang for pesos: *no tengo un mango* means *I don't have a peso*.$tip$;
update public.tips set body_md = $tip$*Tener* — to have — is how you give your age: Spanish *has* years.
| yo | **tengo** | Tengo veinte años. |
| vos | **tenés** | ¿Cuántos años tenés? |
| él, ella | **tiene** | Tiene doce años. |
The *e* of *tener* becomes *ie* in *tiene* — but never in the vos form: **tenés**.

Before a noun, *uno* is **un**: *tiene un año*.

16 to 19 are **dieci** + the number: *dieciséis*, *diecisiete*.$tip$, updated_at = now() where id = '0f6658b9-f4e9-5a1d-836b-ec6f489940ff' and body_md = $tip$*Tener* — to have — is how you give your age: Spanish *has* years.
| yo | **tengo** | Tengo veinte años. |
| vos | **tenés** | ¿Cuántos años tenés? |
| él, ella | **tiene** | Tiene doce años. |
The *e* of *tener* becomes *ie* in *tiene* — but never in the vos form: **tenés**. Before a noun, *uno* is **un**: *tiene un año*.

16 to 19 are **dieci** + the number: *dieciséis*, *diecisiete*, *dieciocho*, *diecinueve*.$tip$;
update public.tips set body_md = $tip$**Sesenta** (60) and **setenta** (70) are easy to mix up: **sesenta** has the **s** of *six*, **setenta** has the **t** of *seven*.

A round hundred is just **cien** — never *un cien*.$tip$, updated_at = now() where id = 'ae4f4e8b-34af-508d-8cc2-5d3e4564bb87' and body_md = $tip$**Sesenta** (60) and **setenta** (70) are the pair everyone mixes up: **sesenta** has the **s** of *six*, **setenta** has the **t** of *seven*. And a round hundred is just **cien** — never *un cien*.$tip$;
update public.tips set body_md = $tip$Add **-s** after a vowel (*medialuna → medialunas*) and **-es** after a consonant.

The word for "a" disappears: *una empanada*, but *dos empanadas*.

**¿Cuántos?** or **¿cuántas?** matches the thing: *¿cuántas medialunas?*, *¿cuántos abuelos?*$tip$, updated_at = now() where id = '82c92152-1296-5058-b7e1-6deb2183513e' and body_md = $tip$Add **-s** after a vowel (*medialuna → medialunas*) and **-es** after a consonant. The word for "a" disappears: *una empanada*, but *dos empanadas*. **¿Cuántos?** or **¿cuántas?** matches the thing: *¿cuántas medialunas?*, *¿cuántos abuelos?*$tip$;
update public.tips set body_md = $tip$Stuck on a word: **¿cómo se dice…?** — *how do you say…?* — and **¿qué significa?** — *what does it mean?*

Too fast: **¿me repetís?** or **más despacio, por favor**. **No entendí** is *I didn't get that*.

To get patience, say **hablo un poco de castellano**. Argentines call the language *castellano*.$tip$, updated_at = now() where id = '23fd59cf-939b-51f2-9dd8-5626bcb20afa' and body_md = $tip$Stuck on a word: **¿cómo se dice…?** — *how do you say…?* — and **¿qué significa?** — *what does it mean?* Too fast: **¿me repetís?** or **más despacio, por favor**. **No entendí** is *I didn't get that*. And the line that buys you patience: **hablo un poco de castellano** — Argentines call the language *castellano*.$tip$;
update public.tips set body_md = $tip$Spanish has no *'s*. Say the thing, then **de**, then the person: *Juan's teacher* is **profe de Juan**, *Marta's student* is **estudiante de Marta**.

**De** also comes after *un poco*: *un poco de inglés* — *a little English*.$tip$, updated_at = now() where id = '8f1d1346-2aba-5b40-a0f6-366a54fd2257' and body_md = $tip$Spanish has no *'s*. Say the thing, then **de**, then the person: *Juan's teacher* is **profe de Juan**, *Marta's student* is **estudiante de Marta**. **De** also comes after *un poco*: *un poco de inglés* — *a little English*.$tip$;
update public.tips set body_md = $tip$**No entendí** — *I didn't understand* — is for something you just missed: *Perdón, no entendí.* It is the past of *no entiendo*.

For another person, *knows* is **sabe**: *Juan sabe un poco de inglés.*$tip$, updated_at = now() where id = '95b906a1-cab6-5656-9bd4-7597c0a6238b' and body_md = $tip$**No entendí** — *I didn't understand* — is what you say when you missed something just said: *Perdón, no entendí.* It is the past of *no entiendo*. For another person, *knows* is **sabe**: *Juan sabe un poco de inglés.*$tip$;
update public.tips set body_md = $tip$**Encantado** — *delighted* — is what you say when you meet someone. A man says *encantado*, a woman **encantada**.

The reply: **igualmente** — *likewise*.

Day to day, most porteños just say **un gusto** or *mucho gusto*: *Soy Sofi.* — *Un gusto, Sofi.*$tip$, updated_at = now() where id = 'dce725f6-bc10-516a-85c8-df10e2a4e81f' and body_md = $tip$**Encantado** — *delighted* — is what you say when you meet someone, and it matches whoever is speaking: a man says *encantado*, a woman **encantada**. The reply: **igualmente** — *likewise*. Day to day, most porteños just say **un gusto** or *mucho gusto*: *Soy Sofi.* — *Un gusto, Sofi.*$tip$;
update public.tips set body_md = $tip$**¿Cómo andás?** is the everyday porteño *how are you?* The answer is short: *Bien.* or *Todo bien.*

**¿Qué onda?** gets the same answer: *¿Qué onda? — Todo bien.*$tip$, updated_at = now() where id = '710a7b73-0b84-5feb-9047-702bbc766787' and body_md = $tip$**¿Cómo andás?** is the everyday porteño *how are you?* — you will hear it all day. The answer is short: *Bien.* or *Todo bien.* **¿Qué onda?** gets the same answer: *¿Qué onda? — Todo bien.*$tip$;
update public.tips set body_md = $tip$**Che** is how people in Buenos Aires say "hey": *Che, ¿todo bien?*

It comes first, often with a name: *Che, Juan, ¿un mate?*

It's friendly and casual, not for formal moments.$tip$, updated_at = now() where id = '8b938cde-ecea-5e1b-bd22-3219656dc110' and body_md = $tip$**Che** is how people in Buenos Aires get someone's attention — like "hey": *Che, ¿todo bien?* It comes first, often with a name: *Che, Juan, ¿un mate?* It's friendly and casual — not for formal moments.$tip$;
update public.tips set body_md = $tip$Most family words come in pairs:

| man | woman |
| herman**o** | herman**a** |
| hij**o** | hij**a** |
| abuel**o** | abuel**a** |
| novi**o** | novi**a** |
| viej**o** | viej**a** |

**Mi** — *my* — never changes: *mi hermano*, *mi hermana*.

And *papá* ends in *-a* but is a man.$tip$, updated_at = now() where id = 'bae799d6-4a65-5ace-b7f8-6857b92ea0dd' and body_md = $tip$Most family words come in pairs:

| man | woman |
| herman**o** | herman**a** |
| hij**o** | hij**a** |
| abuel**o** | abuel**a** |
| novi**o** | novi**a** |
| viej**o** | viej**a** |

**Mi** — *my* — never changes: *mi hermano*, *mi hermana*. And *papá* ends in *-a* but is a man.$tip$;
update public.tips set body_md = $tip$**Mi viejo** and **mi vieja** — literally "my old one" — are affectionate Argentine words for *my dad* and *my mom*.

Together: **mis viejos** — *my parents*.$tip$, updated_at = now() where id = 'f64b190f-60eb-5b5b-8017-03d0b27f48d1' and body_md = $tip$**Mi viejo** and **mi vieja** — literally "my old one" — are affectionate Argentine words for *my dad* and *my mom*. Together: **mis viejos** — *my parents*.$tip$;
update public.tips set body_md = $tip$Stuck on a word: **¿cómo se dice…?** — *how do you say…?* — and **¿qué significa?** — *what does it mean?*

Too fast: **más despacio, por favor**. To make people slow down and help: **hablo un poco** — *I speak a little*.

Argentines call the language **castellano**.$tip$, updated_at = now() where id = '1f4b9651-418e-5f8c-a3bf-03626d36a760' and body_md = $tip$Stuck on a word: **¿cómo se dice…?** — *how do you say…?* — and **¿qué significa?** — *what does it mean?* Too fast: **más despacio, por favor**. And the line that makes people slow down and help: **hablo un poco** — *I speak a little*. Argentines call the language **castellano**.$tip$;
update public.tips set body_md = $tip$Porteños say **mi mujer** for *my wife* and **mi marido** for *my husband* — two different words, not a pair.

And **bebé** is one word for a baby boy or girl: *un bebé*.$tip$, updated_at = now() where id = 'fe0d5efc-b8e4-5065-82e5-0d79dc803125' and body_md = $tip$Porteños say **mi mujer** for *my wife* and **mi marido** for *my husband* — two different words, not a pair. And **bebé** is one word for a baby boy or girl: *un bebé*.$tip$;
update public.tips set body_md = $tip$The *I* form ends in **-o**: **hablo**, **entiendo**. The vos form is stressed on the end: **hablás**, **entendés**, **repetís**.

One verb is different: *I know* is **sé**, and the vos form is **sabés**.

**Me** (*me*) and **te** (*you*) go before the verb: *No te entiendo. ¿Me entendés?*$tip$, updated_at = now() where id = '3ddb4cb9-dbfd-5829-b717-aec8064fbb90' and body_md = $tip$The *I* form ends in **-o**: **hablo**, **entiendo**. The vos form is stressed on the end: **hablás**, **entendés**, **repetís**. One verb is different: *I know* is just **sé**, and the vos form is **sabés**. **Me** (*me*) and **te** (*you*) go before the verb: *No te entiendo. ¿Me entendés?* *No entiendo. ¿Hablás inglés?* — *No sé.*$tip$;
update public.tips set body_md = $tip$In a café, ask for **tostadas**, not one slice: *Un café y tostadas, por favor.*

**Un tostado** is something else: a toasted ham-and-cheese sandwich.

*Una tostada* is one slice, at home: *¿Otra tostada?*$tip$, updated_at = now() where id = '25308c48-0864-59fd-af07-52c38f3952eb' and body_md = $tip$In a café nobody orders one slice: ask for **tostadas** — *Un café y tostadas, por favor.* **Un tostado** is something else: a toasted ham-and-cheese sandwich, the classic café lunch. *Una tostada* is one slice, at home: *¿Otra tostada?*$tip$;
update public.tips set body_md = $tip$Two forms of *ser* so far: **soy** for yourself, **sos** for the person in front of you. *Soy Lucía, ¿y vos?* — *¿Sos turista?*

The words *yo* and *vos* are optional; the verb already says who.$tip$, updated_at = now() where id = '6620174b-7e7e-5f88-a3b7-17aa03b97032' and body_md = $tip$Two forms of *ser* so far: **soy** for yourself, **sos** for the person in front of you. *Soy Lucía, ¿y vos?* — *¿Sos turista?* The words *yo* and *vos* are optional; the verb already says who.$tip$;
update public.tips set body_md = $tip$**Buen día** in the morning, **buenas tardes** later, **buenas** any time.

To leave: **chau** or **hasta luego**.

After every *gracias*, a **de nada**.$tip$, updated_at = now() where id = 'e2dfe789-76c6-566c-a709-002aaaf789fa' and body_md = $tip$**Buen día** in the morning, **buenas tardes** later, **buenas** any time. To leave: **chau** or **hasta luego**. And after every *gracias*, a **de nada**.$tip$;
update public.tips set body_md = $tip$Words for people follow the person: *mi tío, mi tía*; *brasileño, brasileña*.

A word in *-e* stays put: *canadiense*.

A nationality ending in a consonant adds *-a*, and any accent mark goes: *francés → francesa*, *español → española*.$tip$, updated_at = now() where id = 'd244b49a-e1eb-5cb3-9ae8-b0efee8aa45d' and body_md = $tip$Words for people follow the person: *mi tío, mi tía*; *brasileño, brasileña*. A word in *-e* stays put: *canadiense*. A nationality ending in a consonant adds *-a*, and any accent mark goes: *francés → francesa*, *español → española*.$tip$;
update public.tips set body_md = $tip$**Quién** asks *who*: *¿Quién es él?* The answer drops *él* or *ella*: *Es Martín, un vecino.*

Whose? Use **de**: *una amiga de Juan* — *a friend of Juan's*.

A **pibe** is a young guy, a **piba** a young woman.$tip$, updated_at = now() where id = 'fde51102-e5bd-5f88-9d8d-8656cc371174' and body_md = $tip$**Quién** asks *who*: *¿Quién es él?* The answer drops *él* or *ella*: *Es Martín, un vecino.* Whose? Use **de**: *una amiga de Juan* — *a friend of Juan's*. A **pibe** is a young guy and a **piba** a young woman — very porteño.$tip$;
update public.tips set body_md = $tip$**Disculpá** gets a stranger's attention: *Disculpá, ¿sos Martín?*

**Permiso** is what you say to get past someone, on a full bus or in a doorway.$tip$, updated_at = now() where id = '2ee7b356-9d31-5af9-a191-7b3049f6870d' and body_md = $tip$**Disculpá** gets a stranger's attention: *Disculpá, ¿sos Martín?* **Permiso** is what you say to get past someone, on a full bus or in a doorway.$tip$;
update public.tips set body_md = $tip$**Disculpá** gets a stranger's attention: *Disculpá, ¿sos Martín?*

**Permiso** is what you say to get past someone, on a full bus or in a doorway.$tip$, updated_at = now() where id = '7578114a-b5e4-5947-a129-52894ddcd1f7' and body_md = $tip$**Disculpá** gets a stranger's attention: *Disculpá, ¿sos Martín?* **Permiso** is what you say to get past someone, on a full bus or in a doorway.$tip$;
update public.tips set body_md = $tip$*Ser de* works for a country, a city or one corner of it: **Soy de un pueblo de Córdoba.** **Soy de zona sur.**

*Zona norte*, *zona sur* and *zona oeste* go straight after *de* — no *la*.$tip$, updated_at = now() where id = '365922d8-9f57-5d59-8640-f9a66dff0181' and body_md = $tip$*Ser de* works for a country, a city or one corner of it: **Soy de un pueblo de Córdoba.** **Soy de zona sur.** *Zona norte*, *zona sur* and *zona oeste* go straight after *de* — no *la*.$tip$;
update public.tips set body_md = $tip$Porteños call the city itself **Capital**, to set it apart from the suburbs: *Soy de Capital*.

Not from here at all? **Soy de afuera.**$tip$, updated_at = now() where id = '42534aab-2616-5cd9-8ce8-366b4feba608' and body_md = $tip$Porteños call the city itself **Capital** — *Soy de Capital* — to set it apart from the suburbs around it. Not from here at all? **Soy de afuera.**$tip$;
update public.tips set body_md = $tip$To say who you are, use **soy**: *Soy Sofi.* One word carries "I am".

The word for "I" (**yo**) is usually left out. Add it only to stress or contrast: *Yo soy Martín.*$tip$, updated_at = now() where id = '03c07d66-92a9-54f3-842f-c123a1a62c76' and body_md = $tip$To say who you are, use **soy**: *Soy Sofi.* One word carries "I am". The word for "I" (**yo**) is usually left out; add it only to stress or contrast: *Yo soy Martín.*$tip$;
update public.tips set body_md = $tip$**Once**, **doce**, **trece**, **catorce** and **quince** are words to learn one by one.

After that it is **dieci** plus the number, as one word: *dieciséis*, *diecisiete*.

Then comes **veinte**: *Tengo veinte años.*$tip$, updated_at = now() where id = '95422350-ece0-5505-9a2d-31d2e32773f4' and body_md = $tip$**Once**, **doce**, **trece**, **catorce** and **quince** are words to learn one by one. After that it gets easy: **dieci** plus the number, as one word: *dieciséis*, *diecisiete*. Then comes **veinte**: *Tengo veinte años.*$tip$;
update public.tips set body_md = $tip$With **seis**, **siete**, **ocho**, **nueve** and **diez** you can count to ten. **Cero** is zero.

The number goes before **años**: *Mi hijo tiene ocho años.*$tip$, updated_at = now() where id = 'ce23b5b6-752c-576c-8cfc-9c3e82436936' and body_md = $tip$With **seis**, **siete**, **ocho**, **nueve** and **diez** you can count to ten. **Cero** is zero. The number goes before **años**: *Mi hijo tiene ocho años.*$tip$;
update public.tips set body_md = $tip$From 21 to 29 the number is one word: **veintiuno**, **veintidós**, **veinticinco**.

From **treinta** on it is three words joined by **y**: *Tengo treinta y cuatro años.* The same goes for **cuarenta**, **cincuenta** and up to **noventa**.

Before *años*, **uno** becomes **un**: *veintiún años*, *treinta y un años*.$tip$, updated_at = now() where id = '0a165b34-8a68-50c2-973b-ae40dc128454' and body_md = $tip$From 21 to 29 the number is one word: **veintiuno**, **veintidós**, **veinticinco**. From **treinta** on it is three words joined by **y**: *Tengo treinta y cuatro años.* The same pattern works for **cuarenta**, **cincuenta** and all the way up to **noventa**. Before *años*, **uno** becomes **un**: *veintiún años*, *treinta y un años*.$tip$;
update public.tips set body_md = $tip$The little word matches the thing, not you: **un** té, **un** helado, but **una** torta, **una** pizza.

Learn each new word with its *un* or *una*.

One twist: *agua* takes **un**: *un agua*. It is still an *una* word: *otra agua*.$tip$, updated_at = now() where id = 'fbdb815c-fea1-52ae-84c1-af98b2814484' and body_md = $tip$The little word matches the thing, not you: **un** té, **un** helado, but **una** torta, **una** pizza. Learn each new word with its *un* or *una* and you'll never have to guess. One twist: *agua* takes **un** — *un agua*. It is still an *una* word, though: *otra agua*.$tip$;
update public.tips set body_md = $tip$*Ser* — to be — has a form for each person. So far:

| yo | **soy** | I am |
| vos | **sos** | you are |

Use **vos** with everyone: friends, the waiter, your boss.

A question is the same words with a rising voice: *¿Sos Sofi?*$tip$, updated_at = now() where id = '975cf77f-8610-50b5-bb16-46436594b491' and body_md = $tip$*Ser* — to be — has a form for each person. So far:

| yo | **soy** | I am |
| vos | **sos** | you are |

Use **vos** with everyone: friends, the waiter, your boss. A question is the same words with a rising voice: *¿Sos Sofi?*$tip$;
update public.tips set body_md = $tip$In Argentina the everyday word for "you" is **vos**, and it has its own verb forms: *vos sos* (you are).

You'll hear *tú* in other countries. This course never uses it.$tip$, updated_at = now() where id = 'd6547b7a-4812-57d4-9cbd-00e7db9fd94f' and body_md = $tip$In Argentina the everyday word for "you" is **vos**, and it has its own verb forms: *vos sos* (you are). You'll hear *tú* in other countries. This course never uses it.$tip$;
update public.tips set body_md = $tip$After half past, porteños count down to the next hour: **las ocho menos cuarto** is *7:45*, *las nueve menos diez* is *8:50*.

On the hour exactly: **a las diez en punto**.$tip$, updated_at = now() where id = '73641093-beea-5f10-a08c-70c533d5f13b' and body_md = $tip$After half past, porteños count down to the next hour: **las ocho menos cuarto** is *7:45*, *las nueve menos diez* is *8:50*. On the hour exactly: **a las diez en punto**.$tip$;
update public.tips set body_md = $tip$Opening hours are **desde** … **hasta**: *abre desde las nueve hasta las seis*. Shorter, and more common: *abre **de** nueve **a** seis*.

At twelve it's **el mediodía**, and many small shops **cierran** for a while after it.

With **desde**, Spanish uses the present: *estoy acá desde las ocho* = I've been here since eight.$tip$, updated_at = now() where id = '7782b8c8-3797-5039-896a-6aeac6b65951' and body_md = $tip$Opening hours are **desde** … **hasta**: *abre desde las nueve hasta las seis*. Shorter, and more common: *abre **de** nueve **a** seis*. At twelve it's **el mediodía** — and plenty of small shops **cierran** for a while right after it. With **desde**, Spanish uses the present: *estoy acá desde las ocho* = I've been here since eight.$tip$;
update public.tips set body_md = $tip$Going somewhere takes **a** — *to* — every time: *Voy a la plaza.* English often drops the *to*; Spanish never drops the **a**.

The question word has that **a** built in: **¿adónde vas?** is *where are you going to?*

**A + el** becomes **al**: *voy al kiosco*, but *vas a la estación*.$tip$, updated_at = now() where id = '29afb672-4c8b-59dd-85ee-eef456a2127a' and body_md = $tip$Going somewhere takes **a** — *to* — every time: *Voy a la plaza.* The question word has that **a** built in: **¿adónde vas?** is *where are you going to?* English often drops the *to*; Spanish never drops the **a**. **A + el** becomes **al**: *voy al kiosco*, but *vas a la estación*.$tip$;
update public.tips set body_md = $tip$**Ir** — *to go* — looks nothing like its forms: **voy**, **vas**, **va**, **vamos**, **van**.

One form covers *I go* and *I'm going*: *Voy a la plaza* is both.

On its own, **vamos** also means *let's go*.$tip$, updated_at = now() where id = '6e364ee3-389f-55b3-a895-bd88f35dc318' and body_md = $tip$**Ir** — *to go* — looks nothing like its forms: **voy**, **vas**, **va**, **vamos**, **van**. Spanish uses one form for *I go* and *I'm going*: *Voy a la plaza* is both. And **vamos** on its own also means *let's go*.$tip$;
update public.tips set body_md = $tip$Porteños describe people by the obvious and nobody minds: **morocho** is dark-haired, **rubio** fair, **flaco** thin, **petiso** short.

*Flaco* is even a nickname: *¿Todo bien, flaco?*$tip$, updated_at = now() where id = '7d0417aa-4dc3-51d7-8a9a-5889882ac559' and body_md = $tip$Porteños describe people by the obvious and nobody minds: **morocho** is dark-haired, **rubio** fair, **flaco** thin, **petiso** short. *Flaco* is even a nickname: *¿Todo bien, flaco?*$tip$;
update public.tips set body_md = $tip$Describing more than one person is *ser* plus a word with an *-s*:

| yo | soy alt**o** | soy alt**a** |
| vos | sos rubi**o** | sos rubi**a** |
| él, ella | es flac**o** | es flac**a** |
| nosotros | **somos** alt**os** | **somos** alt**as** |
| ellos, ustedes | **son** moroch**os** | **son** lind**as** |

A mixed group takes *-os*.

A word in *-e* or a consonant just adds *-s* or *-es*: *joven* → **jóvenes**.$tip$, updated_at = now() where id = 'eb578f7a-a37c-5195-8a87-5def223e37d8' and body_md = $tip$Describing more than one person is *ser* plus a word with an *-s*:

| yo | soy alt**o** | soy alt**a** |
| vos | sos rubi**o** | sos rubi**a** |
| él, ella | es flac**o** | es flac**a** |
| nosotros | **somos** alt**os** | **somos** alt**as** |
| ellos, ustedes | **son** moroch**os** | **son** lind**as** |

A mixed group takes *-os*. A word in *-e* or a consonant just adds *-s* or *-es*: *joven* → **jóvenes**.$tip$;
update public.tips set body_md = $tip$**Buscar** is *to look for* — no *for* needed: *busco una palabra*.

**Preguntar** is *to ask* a question: *pregunto dónde está la parada*.

With a person, put **a** in front: *extraño a mi familia*. Only for a specific person: *busco a Sofi*, but *busco una profe*.$tip$, updated_at = now() where id = 'c2a5f3ac-9d60-5f16-b276-32fe3605b2f1' and body_md = $tip$**Buscar** is *to look for* — no *for* needed: *busco una palabra*. **Preguntar** is *to ask* a question: *pregunto dónde está la parada*. With a person, though, put **a** in front: *extraño a mi familia*, *ayudamos a mis abuelos*. Only for a specific person: *busco a Sofi*, but *busco una profe*.$tip$;
update public.tips set body_md = $tip$| | comer | vivir |
| yo | com**o** | viv**o** |
| vos | com**és** | viv**ís** |
| él, ella | com**e** | viv**e** |
| nosotros | com**emos** | viv**imos** |
| ellos, ustedes | com**en** | viv**en** |

-er and -ir are the same except for **vos** and **nosotros**, where each keeps its own vowel.

The present also covers *I'm eating* and a near future: *te escribo a la noche* — I'll write to you tonight.$tip$, updated_at = now() where id = '56d4a95b-8525-5ac4-8df6-3c26ebc33762' and body_md = $tip$| | comer | vivir |
| yo | com**o** | viv**o** |
| vos | com**és** | viv**ís** |
| él, ella | com**e** | viv**e** |
| nosotros | com**emos** | viv**imos** |
| ellos, ustedes | com**en** | viv**en** |

-er and -ir are the same except for **vos** and **nosotros**, where each keeps its own vowel. The present also covers *I'm eating* and a near future: *te escribo a la noche* — I'll write to you tonight.$tip$;
update public.tips set body_md = $tip$Use **estar** for how you are right now: *estoy cansado*, *¿estás nerviosa?*

To ask why: **¿por qué?** — two words. The answer is **porque**, one word: *Porque Sofi está enferma.*$tip$, updated_at = now() where id = '23158cf0-d54a-5955-b50d-bd27fbb6c514' and body_md = $tip$Use **estar** for how you are right now: *estoy cansado*, *¿estás nerviosa?* To ask why: **¿por qué?** — two words. The answer is **porque**, one word: *Porque Sofi está enferma.*$tip$;
update public.tips set body_md = $tip$| yo | estoy | vos | estás |
| él, ella | está | nosotros | **estamos** |
| ellos, ustedes | **están** | | |

The word for the feeling matches the people in number too:

| one man | cansad**o** | one woman | cansad**a** |
| men | cansad**os** | women | cansad**as** |

A word ending in *-e* just adds *-s*: *triste, tristes*. *Feliz* becomes **felices**.

**¿Sos feliz?**, with *ser*, asks about your life in general, not just right now.$tip$, updated_at = now() where id = '5efb235d-d57c-58e4-8155-fd6c834d0300' and body_md = $tip$| yo | estoy | vos | estás |
| él, ella | está | nosotros | **estamos** |
| ellos, ustedes | **están** | | |

The word for the feeling matches the people in number too:

| one man | cansad**o** | one woman | cansad**a** |
| men | cansad**os** | women | cansad**as** |

A word ending in *-e* just adds *-s*: *triste, tristes*. *Feliz* becomes **felices**. **¿Sos feliz?**, with *ser*, asks about your life in general, not just right now.$tip$;
update public.tips set body_md = $tip$**Abrir** and **recibir** are regular: *abro, abrís, abre*; *recibo, recibís, recibe*.

**Recibir a** someone is to have them over: *recibo a mi suegra*.$tip$, updated_at = now() where id = '5f609aca-4b7c-5585-9e3f-2d151bb4c25c' and body_md = $tip$**Abrir** and **recibir** are regular: *abro, abrís, abre*; *recibo, recibís, recibe*. *¿El negocio abre a la noche?* **Recibir a** someone is to have them over: *recibo a mi suegra*.$tip$;
update public.tips set body_md = $tip$-er verbs keep **e** and -ir verbs take **i**, but only for *vos* and *nosotros*: *vend**és**, vend**emos*** but *abr**ís**, abr**imos***.

Everywhere else they match: *vendo, abro*; *lee, comparte*.

*Recibir* and *correr* follow the same pattern.$tip$, updated_at = now() where id = 'ff18c38c-372c-591e-a3e1-3ae0c2d65dfc' and body_md = $tip$-er verbs keep **e** and -ir verbs take **i**, but only for *vos* and *nosotros*: *vend**és**, vend**emos*** but *abr**ís**, abr**imos***. Everywhere else they match: *vendo, abro*; *lee, comparte*; *leen, escriben*. *Recibir* and *correr* follow the same pattern.$tip$;
update public.tips set body_md = $tip$*¿Qué hacés?* is mostly just *hi*. To ask about someone's job, say **¿De qué laburás?** or **¿De qué trabajás?**

The answer takes *de* too: *Laburo de mozo.* Or with *ser*: *Soy abogada.*$tip$, updated_at = now() where id = 'ab90d735-de35-5880-b911-2b8705709877' and body_md = $tip$*¿Qué hacés?* is mostly just *hi*. To ask about someone's job, say **¿De qué laburás?** or **¿De qué trabajás?** The answer takes *de* too: *Laburo de mozo.* Or with *ser*: *Soy abogada.*$tip$;
update public.tips set body_md = $tip$| yo | **estoy** |
| vos | **estás** |
| él, ella | **está** |

Two verbs mean *to be*. **Ser** says who or what something is, and where it's from: *Soy de Rosario.*

**Estar** says where it is right now: *Estoy en Buenos Aires.*$tip$, updated_at = now() where id = '2aa3d8f0-61b1-5ee4-b749-7d81ee01ea5c' and body_md = $tip$| yo | **estoy** |
| vos | **estás** |
| él, ella | **está** |

Two verbs mean *to be*. **Ser** says who or what something is, and where it's from: *Soy de Rosario.* **Estar** says where it is right now: *Estoy en Buenos Aires.*$tip$;
update public.tips set body_md = $tip$The ground floor is **la planta baja**. Above it comes *el **primer** piso* (*primero* loses its *-o* before a noun).

Then **segundo, tercero, cuarto, quinto**. Higher up, people often just say the number: *piso doce*.

On the **timbre**, *4° B* is read **cuarto B**. **Piso** is also the floor you walk on.$tip$, updated_at = now() where id = 'd8622385-5e4a-5495-9a55-b9f96b8c8aeb' and body_md = $tip$The ground floor is **la planta baja**; above it comes *el **primer** piso* (*primero* loses its *-o* before a noun). Then **segundo, tercero, cuarto, quinto**. Higher up, people often just say the number: *piso doce*. On the **timbre**, *4° B* is read **cuarto B**. **Piso** is also the floor you walk on.$tip$;
update public.tips set body_md = $tip$The same rule as *soy profesora*: **es enfermera**, **soy contador** — no *un*, no *una*.

The article only comes back when you add something: *es una periodista argentina*.$tip$, updated_at = now() where id = 'c1c004e5-a9f3-57bb-8d60-abb3553b6823' and body_md = $tip$The same rule as *soy profesora*: **es enfermera**, **soy contador** — no *un*, no *una*. The article only comes back when you add something: *es una periodista argentina*.$tip$;
update public.tips set body_md = $tip$Three words that need nothing after them: **arriba** (up, upstairs), **abajo** (down, downstairs), **adentro** (inside).

*Estoy abajo* is what a porteño texts when they're at your door.

The fourth one is **afuera** — *outside*: *mi auto está afuera*.$tip$, updated_at = now() where id = '0f108707-6528-5552-95c5-9202ab24e0d7' and body_md = $tip$Three words that need nothing after them: **arriba** (up, upstairs), **abajo** (down, downstairs), **adentro** (inside). *Estoy abajo* is what a porteño texts from the street when they're at your door. The fourth one is **afuera** — *outside*: *mi auto está afuera*.$tip$;
update public.tips set body_md = $tip$**Caliente** is for things: *el café está caliente*.

Said about a person it means angry, or something ruder. For yourself use *tengo calor*, and for the weather *hace calor*.$tip$, updated_at = now() where id = '19fdd686-0f86-5a0c-a998-5e353ecd8fd9' and body_md = $tip$**Caliente** is for things: *el café está caliente*. Said about a person it means angry — or something ruder — so for yourself use *tengo calor*, and for the weather *hace calor*.$tip$;
update public.tips set body_md = $tip$**Listo** is *ready*: *¿estás lista?* On its own it closes any deal: *Listo, dale.*

**Apurado** is *in a hurry*.$tip$, updated_at = now() where id = 'fc0b4b4e-f184-5ab8-adcb-2352ae9cdeae' and body_md = $tip$**Listo** is *ready* — *¿estás lista?* — and on its own it closes any deal: *Listo, dale.* **Apurado** is *in a hurry*, the normal state of anyone downtown.$tip$;
update public.tips set body_md = $tip$Porteños say **a la noche** for *at night* or *tonight*: *A la noche estudio inglés.*

**De noche** is at night in general: *laburo de noche* (I work nights).

Literally *what are you doing?*, **¿qué hacés?** is also the everyday *how's it going?*: *Hola, ¿qué hacés?*$tip$, updated_at = now() where id = '9b8de7a7-8ce6-5500-a8ab-a7d35c9c940e' and body_md = $tip$Porteños say **a la noche** for *at night* or *tonight*: *A la noche estudio inglés.* *Hablamos a la noche* — we'll talk tonight. **De noche** is at night in general: *laburo de noche* (I work nights). And **¿qué hacés?** — literally *what are you doing?* — is also the everyday *how's it going?*: *Hola, ¿qué hacés?*$tip$;
update public.tips set body_md = $tip$**Facu** is short for *facultad* — university.

For jobs, Spanish drops the article: **Soy profesora**, not *soy una profesora*.

Jobs change for a woman: *profesor* → **profesora**, *médico* → **médica**, *jefe* → **jefa**.$tip$, updated_at = now() where id = '2375ef12-8a94-5b13-ba9c-dfbfe8356608' and body_md = $tip$**Facu** is short for *facultad* — university. For jobs, Spanish drops the article: **Soy profesora**, not *soy una profesora*. Jobs change for a woman: *profesor* → **profesora**, *médico* → **médica**, *jefe* → **jefa**.$tip$;
update public.tips set body_md = $tip$**Tener que** + an infinitive (the *-ar, -er, -ir* form) is *to have to*: *tengo que laburar* — I have to work.

A different **que** joins two ideas: *tengo una jefa que habla inglés* — a boss who speaks English.$tip$, updated_at = now() where id = 'ae41a407-af9b-5cde-9ad6-f0b967fd6c3a' and body_md = $tip$**Tener que** + an infinitive (the *-ar, -er, -ir* form) is *to have to*: *tengo que laburar* — I have to work; *¿tenés que estudiar?* — do you have to study? A different **que** joins two ideas: *tengo una jefa que habla inglés* — a boss who speaks English.$tip$;
update public.tips set body_md = $tip$| something new | something you already know |
| **Hay** un kiosco. | **El** kiosco **está** en la esquina. |
| **Hay** una parada acá. | **La** parada **está** lejos. |

**Hay** goes with *un, una*, a number or nothing at all, and never changes: *hay dos kioscos*, *¿hay agua?*

**Está** goes with *el, la*.$tip$, updated_at = now() where id = 'ec69da9b-919b-5227-808d-abb58a8beed8' and body_md = $tip$| something new | something you already know |
| **Hay** un kiosco. | **El** kiosco **está** en la esquina. |
| **Hay** una parada acá. | **La** parada **está** lejos. |

**Hay** goes with *un, una*, a number or nothing at all, and never changes: *hay dos kioscos*, *¿hay agua?* **Está** goes with *el, la*.$tip$;
update public.tips set body_md = $tip$| asking | **¿Hay** una estación **por acá**? |
| yes | Sí, **hay** una en la avenida. |
| no | No, acá no **hay** tren. |
| where | La estación **está** a dos cuadras. |

**Por acá** is *around here*.

**Hay** never changes: *hay un bar*, *hay dos plazas*.$tip$, updated_at = now() where id = 'c41cf955-fb7f-5670-b1e2-cc4a2a59f30c' and body_md = $tip$| asking | **¿Hay** una estación **por acá**? |
| yes | Sí, **hay** una en la avenida. |
| no | No, acá no **hay** tren. |
| where | La estación **está** a dos cuadras. |

**Por acá** is *around here*. **Hay** never changes: *hay un bar*, *hay dos plazas*, *hay gente*. $tip$;
update public.tips set body_md = $tip$**Hay** works for things you can't count, too: **hay gente** — there are people.

*Gente* is singular in Spanish: *la gente está en la plaza*.$tip$, updated_at = now() where id = 'b861d84d-53e2-566d-9424-5b40732e4523' and body_md = $tip$**Hay** works for things you can't count, too: **hay gente** — there are people. *Gente* is singular in Spanish: *la gente está en la plaza*.$tip$;
update public.tips set body_md = $tip$**Mañana** on its own is *tomorrow*: *Hoy laburo, mañana no.*

With **la** it is *the morning*, and porteños say **a la mañana** for *in the morning*.

So *tomorrow morning* is **mañana a la mañana**.$tip$, updated_at = now() where id = '11dfb570-d80f-5e13-a3ef-5cfff6079ac5' and body_md = $tip$**Mañana** on its own is *tomorrow*: *Hoy laburo, mañana no.* With **la** it is *the morning*, and porteños say **a la mañana** for *in the morning*. So *tomorrow morning* is **mañana a la mañana**.$tip$;
update public.tips set body_md = $tip$**Tarde** works the same way. **A la tarde** is *in the afternoon*; on its own **tarde** means *late*: *Es tarde.*

Its opposite is **temprano** — *early*: *Es temprano.*$tip$, updated_at = now() where id = '5d601854-1cc7-5d99-961d-5454185bfc90' and body_md = $tip$**Tarde** works the same way. **A la tarde** is *in the afternoon*; on its own **tarde** means *late*: *Es tarde.* Its opposite is **temprano** — *early*: *Es temprano.*$tip$;
update public.tips set body_md = $tip$**Su** is *his*, *her* or *their* (and *your* for *ustedes*). With more than one it is **sus**: *su mamá*, *sus hijos*.

*Our* matches the thing, not the people: **nuestro** papá, **nuestra** familia, **nuestros** abuelos, **nuestras** hermanas.$tip$, updated_at = now() where id = '040623f8-7ca5-5206-8e5c-f178b0d6fbe4' and body_md = $tip$**Su** is *his*, *her* or *their* (and *your* for *ustedes*); with more than one it is **sus**: *su mamá*, *sus hijos*. *Our* matches the thing, not the people: **nuestro** papá, **nuestra** familia, **nuestros** abuelos, **nuestras** hermanas.$tip$;
update public.tips set body_md = $tip$*Es la una* (one o'clock), but *son las dos*. Add **y media** for half past and **y cuarto** for quarter past. Other minutes go the same way: *las siete y veinte*. Past the half hour people often drop the **y**: *las ocho cuarenta*.

To ask: *¿Qué hora es?* or *¿Tenés hora?* *At* a time is **a las**: *¿A qué hora?* — *A las nueve y media.*

After a clock time say **de la mañana / de la tarde / de la noche**: *a las dos de la tarde*. With no clock time: **a la mañana**, *a la tarde*, *a la noche*.$tip$, updated_at = now() where id = '97b6abce-e595-58cb-a895-30319da57ada' and body_md = $tip$*Es la una* (one o'clock), but *son las dos*, *son las siete*. Add **y media** for half past and **y cuarto** for quarter past. Other minutes go the same way: *las siete y veinte*. Past the half hour people often drop the **y**: *las ocho cuarenta*. To ask: *¿Qué hora es?* or *¿Tenés hora?* *At* a time is **a las**: *¿A qué hora?* — *A las nueve y media.* After a clock time say **de la mañana / de la tarde / de la noche**: *a las dos de la tarde*. With no clock time: **a la mañana**, *a la tarde*, *a la noche*.$tip$;
update public.tips set body_md = $tip$These follow *comer* and *vivir*. **Leer** and **aprender** are -er verbs: *leo, leés, lee*. **Escribir** is an -ir verb: *escribo, escribís, escribe*.

Say both vowels in **leés**: *¿Leés muchos libros?*$tip$, updated_at = now() where id = '97723334-1e65-5466-aedf-bd8b97789fae' and body_md = $tip$These follow *comer* and *vivir*. **Leer** and **aprender** are -er verbs: *leo, leés, lee*. **Escribir** is an -ir verb: *escribo, escribís, escribe*. Say both vowels in **leés**: *¿Leés muchos libros?*$tip$;
update public.tips set body_md = $tip$Days take **el** for one day and **los** for every week: *el miércoles laburo* (on Wednesday), *los lunes laburo* (on Mondays). They have no capital letter.

Dates work the same way, with a plain number: *el veintiuno tengo examen*.

**Nos vemos** is *see you*; as a question it makes a plan: *¿Nos vemos el sábado?* — *Should we meet on Saturday?*$tip$, updated_at = now() where id = 'afc27211-febc-5355-9843-5cd952ec9052' and body_md = $tip$Days take **el** for one day and **los** for every week: *el miércoles laburo* (on Wednesday), *los lunes laburo* (on Mondays). They have no capital letter. Dates work the same way, with a plain number: *el veintiuno tengo examen*. **Nos vemos** is *see you*; as a question it makes a plan: *¿Nos vemos el sábado?* — *Should we meet on Saturday?*$tip$;
update public.tips set body_md = $tip$The verb matches the thing you like, not you: *Me **gusta** el mate*, but *Me **gustan** las facturas*.

The little word in front says who likes it: **me**, **te**, **le**.

With a name, add **a** and keep **le**: *A Lucía le gusta el mate.*$tip$, updated_at = now() where id = '1861263d-ed73-5540-a7c8-6bd95804c94e' and body_md = $tip$The verb matches the thing you like, not you: *Me **gusta** el mate*, but *Me **gustan** las facturas*. The little word in front says who likes it: **me**, **te**, **le**. With a name, add **a** and keep **le**: *A Lucía le gusta el mate.*$tip$;
update public.tips set body_md = $tip$Porteños talk **rápido**. Ask: *¿Podés hablar más despacio?* Most people will slow down and **ayudar**.$tip$, updated_at = now() where id = '96e834f8-6753-5479-8174-299e06ce61b8' and body_md = $tip$Porteños talk **rápido**. The line that saves you: *¿Podés hablar más despacio?* — and most people will happily slow down and **ayudar**.$tip$;
update public.tips set body_md = $tip$In Argentina the waiter is **el mozo** (or *la moza*).

To call one over, *perdón* is the gentle way; *¡mozo!* is heard too.

When you're done, ask for **la cuenta**.$tip$, updated_at = now() where id = '5accb3e5-9f5d-571b-b159-856ad4feb161' and body_md = $tip$In Argentina the waiter is **el mozo** (or *la moza*). To call one over, *perdón* is the gentle way; *¡mozo!* is heard too. When you're done, ask for **la cuenta**. $tip$;
update public.tips set body_md = $tip$To order, ask the waiter to bring it: **¿Me traés un café?** — literally "do you bring me a coffee?".

*Quiero un café* works too: **quiero**, **¿querés?** — no *ie* in the vos form.

Or just name it: *Para mí, un té.* Add **por favor**.$tip$, updated_at = now() where id = '6c6949b3-904f-59fe-8a19-085c5f916515' and body_md = $tip$The easy way to order is to ask the waiter to bring it: **¿Me traés un café?** — literally "do you bring me a coffee?". *Quiero un café* works too: **quiero**, **¿querés?** — no *ie* in the vos form. Or just name it: *Para mí, un té.* Add **por favor**.$tip$;
update public.tips set body_md = $tip$Argentines say **depto** for an apartment, **pieza** for a bedroom and **el living** for the living room.

The fridge is **la heladera**.

**Alquilo** on its own means *I rent my place*: *¿Dónde alquilás?*$tip$, updated_at = now() where id = 'f9a1e455-91a4-5b1f-89f4-59d39156345f' and body_md = $tip$Argentines say **depto** for an apartment, **pieza** for a bedroom and **el living** for the living room. The fridge is **la heladera**. **Alquilo** on its own means *I rent my place*: *¿Dónde alquilás?*$tip$;
update public.tips set body_md = $tip$When you just say whether it has one, no *un*: *mi edificio **tiene** ascensor*, *no **tiene** terraza*.

**Hay** for what's there: *en la planta baja **hay** un patio*.$tip$, updated_at = now() where id = '9acb02d2-6b21-5158-ad22-8d29cf9e3a7f' and body_md = $tip$When you just say whether it has one, no *un*: *mi edificio **tiene** ascensor*, *no **tiene** terraza*. **Hay** for what's there: *en la planta baja **hay** un patio*.$tip$;
update public.tips set body_md = $tip$Pasta is **los fideos**, always plural.

Vegetables are **la verdura** or **las verduras** — both are everyday: *no le gusta la verdura*, *me gustan las verduras*.$tip$, updated_at = now() where id = '52a41619-5364-53ac-8a49-0b407622963c' and body_md = $tip$Pasta is **los fideos**, always plural. Vegetables are **la verdura** or **las verduras** — both are everyday: *no le gusta la verdura*, *me gustan las verduras*.$tip$;
update public.tips set body_md = $tip$Jobs take no *un*: **es cocinero**, **soy contadora**.

The word changes for a woman — *cocinera* — except the *-ista* ones: *periodista*.$tip$, updated_at = now() where id = '5cf8649b-a701-532f-ab70-90863e7dfe69' and body_md = $tip$Jobs take no *un*: **es cocinero**, **soy contadora**. The word changes for a woman — *cocinera* — except the *-ista* ones: *periodista*.$tip$;
update public.tips set body_md = $tip$Every *ellos* and *ustedes* form you have ends in **-n**: *quieren, tienen, laburan, viven, escriben*.

*¿Quieren café?* — do you guys want coffee? Hear the *-n* and you know it's more than one.$tip$, updated_at = now() where id = '63ff509a-3d7b-5687-a565-dd402adb7b88' and body_md = $tip$The *ellos* and *ustedes* form of every verb you have ends in **-n**: *quieren, tienen, laburan, viven, escriben*. *¿Quieren café?* — do you guys want coffee? Hear the *-n* and you know it's more than one.$tip$;
update public.tips set body_md = $tip$*Estar* and the describing word after it match the person: *estamos cansad**os***.

An -ar verb takes the person's ending: *practic**amos***.

*Gustar* matches the thing: *nos gust**an** los fideos*.$tip$, updated_at = now() where id = '1f297d17-80f0-51a1-b06f-6a3cab920a9b' and body_md = $tip$*Estar* and the describing word after it match the person: *estamos cansad**os***. An -ar verb takes the person's ending: *practic**amos***. *Gustar* matches the thing: *nos gust**an** los fideos*.$tip$;
update public.tips set body_md = $tip$The little word in front says who likes it: **me**, **te**, **le**, **nos**, **les**.

The verb is only ever *gusta* (one thing) or *gustan* (several): *le gust**a** el pollo*, *me gust**an** las medialunas*.$tip$, updated_at = now() where id = 'a7aca477-d93f-5ae8-8217-3f52071a1d8f' and body_md = $tip$The little word in front says who likes it: **me**, **te**, **le**, **nos**, **les**. The verb is only ever *gusta* (one thing) or *gustan* (several): *le gust**a** el pollo*, *me gust**an** las medialunas*.$tip$;
update public.tips set body_md = $tip$| | practicar | necesitar | ayudar |
| yo | practic**o** | necesit**o** | ayud**o** |
| vos | practic**ás** | necesit**ás** | ayud**ás** |
| él, ella | practic**a** | necesit**a** | ayud**a** |
| nosotros | practic**amos** | necesit**amos** | ayud**amos** |
| ellos, ustedes | practic**an** | necesit**an** | ayud**an** |

*Usar, buscar, preguntar, enseñar* work the same way.

The vos form always carries the accent: *¿Qué buscás?*$tip$, updated_at = now() where id = '88ebae8e-e156-5118-8d26-5cff7986b94b' and body_md = $tip$| | practicar | necesitar | ayudar |
| yo | practic**o** | necesit**o** | ayud**o** |
| vos | practic**ás** | necesit**ás** | ayud**ás** |
| él, ella | practic**a** | necesit**a** | ayud**a** |
| nosotros | practic**amos** | necesit**amos** | ayud**amos** |
| ellos, ustedes | practic**an** | necesit**an** | ayud**an** |

*Usar, buscar, preguntar, enseñar* work the same way. The vos form always carries the accent: *¿Qué buscás?*$tip$;
update public.tips set body_md = $tip$Take off *-ar* and add the ending for the person:

| yo | labur**o** |
| vos | labur**ás** |
| él, ella | labur**a** |
| nosotros | labur**amos** |
| ellos, ustedes | labur**an** |

It works for *hablar, tomar, estudiar, caminar* — every regular -ar verb.

**Hacer** is not an -ar verb, so learn its three forms as they are: **hago**, *hacés, hace*.$tip$, updated_at = now() where id = '3df4bd97-1130-5b76-9ad3-39e06c420e6b' and body_md = $tip$Take off *-ar* and add the ending for the person:

| yo | labur**o** |
| vos | labur**ás** |
| él, ella | labur**a** |
| nosotros | labur**amos** |
| ellos, ustedes | labur**an** |

It works for *hablar, tomar, estudiar, caminar* — every regular -ar verb. **Hacer** is not an -ar verb, so learn its three forms as they are: **hago**, *hacés, hace*.$tip$;
update public.tips set body_md = $tip$**Soda** is fizzy water, served from a siphon in the old cafés. It is not a soft drink — that is **gaseosa**.

On a menu you will see **agua con gas** (sparkling) and **agua sin gas** (still).

A **picada** is a board of cheese and cold cuts to share before dinner.$tip$, updated_at = now() where id = '899d348a-60ee-5d03-bc6d-af23743c92be' and body_md = $tip$**Soda** is fizzy water, still served from a siphon in the old cafés. It is not a soft drink — that is **gaseosa**. On a menu you will see **agua con gas** (sparkling) and **agua sin gas** (still). A **picada** is a board of cheese and cold cuts to share before dinner.$tip$;
update public.tips set body_md = $tip$Ordering for more than one: **queremos** dos cafés. The mozo asks the table **¿qué quieren?**

For someone else: *ella **quiere** un té*.

The *ie* is everywhere except *querés* and *queremos*.$tip$, updated_at = now() where id = 'bce85693-14c0-55df-9f48-e478356528a2' and body_md = $tip$Ordering for more than one: **queremos** dos cafés. The mozo asks the table **¿qué quieren?** And for someone else: *ella **quiere** un té*. The *ie* is everywhere except *querés* and *queremos*.$tip$;
update public.tips set body_md = $tip$**Siempre** (always) and **nunca** (never) go in front of the verb: *siempre camino al laburo*.

With **nunca** there you need no *no*: *nunca tomo café*.$tip$, updated_at = now() where id = 'bb1bfe5d-edac-5c1a-8f0d-d0fe683906a7' and body_md = $tip$**Siempre** (always) and **nunca** (never) go in front of the verb: *siempre camino al laburo*. With **nunca** there you need no *no*: *nunca tomo café*.$tip$;
update public.tips set body_md = $tip$**Buscar** is *to look for*: *tengo que buscar laburo*.

It is also *to pick someone up*: *tengo que buscar a mi hijo*.$tip$, updated_at = now() where id = '3910aabd-7879-56ce-9fd0-298db2aac86c' and body_md = $tip$**Buscar** is *to look for* — *tengo que buscar laburo* — and also *to pick someone up*: *tengo que buscar a mi hijo*, *tienen que buscar a sus hijos*.$tip$;
update public.tips set body_md = $tip$**Negocio** is any shop, not just a business: *el negocio de la esquina*.

Porteños **comparten** everything, from an apartment to a mate.

*Con mi hermano vendemos empanadas* means *my brother and I sell* — two people, not three.$tip$, updated_at = now() where id = '9769b812-efcf-50e2-8dd0-7a43d62e3f1b' and body_md = $tip$**Negocio** is any shop, not just a business: *el negocio de la esquina*. And porteños **comparten** everything, from an apartment to a mate. *Con mi hermano vendemos empanadas* means *my brother and I sell* — two people, not three.$tip$;
update public.tips set body_md = $tip$**A la vuelta** is *around the corner* — on the next street, not this one.

**En la otra vereda** is *across the street*: *la panadería está en la otra vereda*.$tip$, updated_at = now() where id = '157ca385-f181-5461-aaa5-dc24d494945a' and body_md = $tip$**A la vuelta** is *around the corner* — on the next street, not this one. **En la otra vereda** is *across the street*: *la panadería está en la otra vereda*.$tip$;
update public.tips set body_md = $tip$Left and right both take **a la**: **a la derecha**, **a la izquierda**.

To say what something is left or right of, add **de**: *la farmacia está a la derecha del banco*.$tip$, updated_at = now() where id = 'a3090b0a-0804-5173-a69d-b576f39b56f7' and body_md = $tip$Left and right both take **a la**: **a la derecha**, **a la izquierda**. To say what something is left or right of, add **de**: *la farmacia está a la derecha del banco*.$tip$;
update public.tips set body_md = $tip$Learn these two whole. They are in the past, which the course teaches later.

**Me perdí** — *I got lost*; right now you are **perdido** or **perdida**.

**Me robaron** — *I got robbed*: *me robaron el celu*.$tip$, updated_at = now() where id = '00f64f36-241e-5c70-ad23-4d93e605066f' and body_md = $tip$Learn these two whole — they are in the past, which the course teaches later. **Me perdí** — *I got lost*; right now you are **perdido** or **perdida**. **Me robaron** — *I got robbed*: *me robaron el celu*.$tip$;
update public.tips set body_md = $tip$In Buenos Aires **911** is the police and **107** is the ambulance.

In the street, shout **¡ayuda!** and tell someone what to do: **llamá a la policía**, *llamá una ambulancia*. *Es urgente.*$tip$, updated_at = now() where id = '36daec09-756b-57d1-a508-f8ba61fd0b2c' and body_md = $tip$In Buenos Aires **911** is the police and **107** is the ambulance. In the street, shout **¡ayuda!** and tell someone what to do: **llamá a la policía**, *llamá una ambulancia*. *Es urgente.*$tip$;
update public.tips set body_md = $tip$**¡Cuidado!** is *watch out!* — a car, a step, a wet floor.

To get help fast, say what you need: *necesito un médico*, *¿hay un hospital cerca?*$tip$, updated_at = now() where id = 'c61da1fd-3bea-5819-848d-a327403ee480' and body_md = $tip$**¡Cuidado!** is *watch out!* — a car, a step, a wet floor. To get help fast, say what you need: *necesito un médico*, *¿hay un hospital cerca?*$tip$;
update public.tips set body_md = $tip$**Celeste** is the light blue of the flag — for porteños a different color from *azul*: *No son azules, son celestes.*

**Rosa** and **naranja** keep the *-a* for masculine too: *un pantalón rosa*, *un jean naranja*.$tip$, updated_at = now() where id = '53370f9c-ba05-5f62-b511-24a2a447f934' and body_md = $tip$**Celeste** is the light blue of the flag — for porteños a different color from *azul*: *No son azules, son celestes.* **Rosa** and **naranja** keep the *-a* for masculine too: *un pantalón rosa*, *un jean naranja*.$tip$;
update public.tips set body_md = $tip$For a local number you buy a **chip** — a SIM card — at a phone shop or a kiosco. Take your passport: they may ask for it.

Then you load **datos**: *cargar datos*, the same verb as loading the SUBE.

*No tengo datos* means no internet until the next wifi.$tip$, updated_at = now() where id = 'a807dff0-189b-5406-b3c0-73d7d4b65c1f' and body_md = $tip$For a local number you buy a **chip** — a SIM card — at a phone shop or a kiosco (take your passport: they may ask for it), and then you load **datos**: *cargar datos*, the same verb as loading the SUBE. *No tengo datos* means no internet until the next wifi.$tip$;
update public.tips set body_md = $tip$**Hace calor**, **hace frío** — it's hot, it's cold. But **hay sol**, **hay viento**, **está nublado**, and **llueve** alone (for right now you'll also hear *está lloviendo*).

You yourself **tenés frío**. Seasons are flipped: *el verano* runs from late December to March.

**Bárbaro** means *great*, not barbaric: *Hay un sol bárbaro* — it's really sunny.$tip$, updated_at = now() where id = 'd48b1ff9-881c-5010-bbf2-fd3a16bc7729' and body_md = $tip$**Hace calor**, **hace frío** — it's hot, it's cold. But **hay sol**, **hay viento**, **está nublado**, and **llueve** alone (for right now you'll also hear *está lloviendo*). You yourself **tenés frío**. Seasons are flipped: *el verano* runs from late December to March. **Bárbaro** means *great*, not barbaric: *¡Bárbaro!* — Great! *Hay un sol bárbaro* — it's really sunny.$tip$;
update public.tips set body_md = $tip$Take the infinitive, drop the *-r*, and stress the last vowel:

| mirar | **mirá** |
| esperar | **esperá** |
| venir | **vení** |
| andar | **andá** |

A pronoun joins the end, and the accent goes, because the stress doesn't move: *esperá* → **esperame**. *Decir* → **decime**, *sentarse* → **sentate**.

To tell someone to *go*, use **andá** — *ir* has no vos command of its own: *andá al médico*.$tip$, updated_at = now() where id = 'cf20bac1-fd65-59f0-834e-7f80f5a732a5' and body_md = $tip$Take the infinitive, drop the *-r*, and stress the last vowel:

| mirar | **mirá** |
| esperar | **esperá** |
| venir | **vení** |
| andar | **andá** |

A pronoun joins the end, and the accent goes, because the stress doesn't move: *esperá* → **esperame**. *Decir* → **decime**, *sentarse* → **sentate**. To tell someone to *go*, use **andá** — *ir* has no vos command of its own: *andá al médico*.$tip$;
update public.tips set body_md = $tip$The question at every till. With **crédito** comes a second one: *¿en cuántas cuotas?* — how many monthly payments.

*En una cuota* is all at once; **sin interés** means no extra charge.

Not sure they take cards? *¿Puedo pagar con tarjeta?*$tip$, updated_at = now() where id = '5670c80f-9ebc-5f2c-aebb-37ff6ce7e2e2' and body_md = $tip$The question at every till. With **crédito** comes a second one: *¿en cuántas cuotas?* — how many monthly payments. *En una cuota* is all at once; **sin interés** means no extra charge. Not sure they take cards? *¿Puedo pagar con tarjeta?*$tip$;
update public.tips set body_md = $tip$A thousand pesos has a short name: **una luca**, *diez lucas*.

To **cambiar dólares**, first ask the rate: *¿A cuánto está el dólar?*

Cash often gets a better price: *¿Hay descuento en efectivo?*$tip$, updated_at = now() where id = 'b197e033-1ea3-59a5-be8d-e704941efbf5' and body_md = $tip$Prices run to thousands, so a thousand pesos has a short name: **una luca**, *diez lucas*. To **cambiar dólares**, first ask the rate: *¿A cuánto está el dólar?* And cash often gets a better price: *¿Hay descuento en efectivo?*$tip$;
update public.tips set body_md = $tip$Paying by bank transfer is normal, in shops and between friends: **te transfiero**.

You ask for the **alias**, the short name of the other person's account.

Or you scan a **QR** with your phone — most people use the Mercado Pago app for it.$tip$, updated_at = now() where id = 'bea55b21-7ab2-5676-ac8b-6831fc7ad8ee' and body_md = $tip$Paying by bank transfer is normal, in shops and between friends: **te transfiero**. You ask for the **alias**, the short name of the other person's account. Or you scan a **QR** with your phone — most people use the Mercado Pago app for it.$tip$;
update public.tips set body_md = $tip$On the bondi, getting on and off carries a *te* on the end: **subite** (get on), **bajate en la esquina** (get off at the corner).

And **pará** stops anyone: *¡pará, pará!*

In a car, **dejar** is *to drop off*: **dejame acá**, *te dejo en la esquina*.$tip$, updated_at = now() where id = '5c1d67c6-5ad4-5b4f-bfce-ca368b14bf65' and body_md = $tip$On the bondi, getting on and off carries a *te* on the end: **subite** (get on), **bajate en la esquina** (get off at the corner). And **pará** stops anyone: *¡pará, pará!* In a car, **dejar** is *to drop off*: **dejame acá**, *te dejo en la esquina*.$tip$;
update public.tips set body_md = $tip$Porteños give an address as street and number — *Corrientes 1500* — and ask **¿a qué altura?** to know which block. The number goes up about a hundred every **cuadra**.

To ask the way: **¿Cómo llego a la estación?** — *how do I get to the station?*$tip$, updated_at = now() where id = '6b5e4dd1-32f1-5210-99e2-f0e00d40b4cb' and body_md = $tip$Porteños give an address as street and number — *Corrientes 1500* — and ask **¿a qué altura?** to know which block. The number goes up about a hundred every **cuadra**. To ask the way: **¿Cómo llego a la estación?** — *how do I get to the station?*$tip$;
update public.tips set body_md = $tip$**Dormir** stretches like *poder*: **duermo**, but **dormís**.

After lunch, **la siesta** is still sacred in much of the country — less so in Buenos Aires.

Around five comes the fourth meal: to **merendar** — mate or coffee with something sweet.$tip$, updated_at = now() where id = 'c46ddd6d-9641-5450-a73f-0dad03d20e44' and body_md = $tip$**Dormir** stretches like *poder*: **duermo**, but **dormís**. And **la siesta** after lunch is still sacred in much of the country — less so in Buenos Aires. Around five comes the fourth meal: to **merendar** — mate or coffee with something sweet.$tip$;
update public.tips set body_md = $tip$Nobody says the long word: the **supermercado** is just **el súper**.

For fruit and vegetables you go to the **verdulería**, a small shop on almost every block: *Voy a la verdulería.*$tip$, updated_at = now() where id = '422fa950-2149-5481-baf3-bb31ce9e2852' and body_md = $tip$Nobody says the long word: the **supermercado** is just **el súper**. For fruit and vegetables you go to the **verdulería**, a small shop you find on almost every block: *Voy a la verdulería.*$tip$;
update public.tips set body_md = $tip$Months have no capital: **en marzo**, **en diciembre**.

Temperature is **grados**, in Celsius: *35 grados* is very hot (95°F), and *1 grado* is almost freezing. Porteños blame everything on **la humedad**.

With **desde** or **hace** + a time, Spanish uses the present: *vivo acá hace dos meses* — I've been living here for two months.$tip$, updated_at = now() where id = 'f30ace7e-6e7e-53a8-8879-9f8494a8c3ef' and body_md = $tip$Months have no capital: **en marzo**, **en diciembre**. Temperature is **grados**: *hace treinta grados* is a normal January day, and porteños blame everything on **la humedad**. Argentina uses Celsius: *35 grados* is very hot (95°F), and *1 grado* is almost freezing. With **desde** or **hace** + a time, Spanish uses the present: *vivo acá hace dos meses* — I've been living here for two months.$tip$;
update public.tips set body_md = $tip$Porteños give the driver a corner, not a house number: *Voy a Thames y Gorriti.*

Near the end you guide: *acá a la derecha*, **dejame acá**.$tip$, updated_at = now() where id = '591fcf6e-f9e9-552f-aefe-b86b51a8b85e' and body_md = $tip$Porteños give the driver a corner, not a house number: *Voy a Thames y Gorriti.* Near the end you guide: *acá a la derecha*, **dejame acá**, *en la esquina está bien*.$tip$;
update public.tips set body_md = $tip$A taxi is black and yellow. You stop it in the street when the red *libre* sign is lit: *¿Está libre?* A taxi driver is a **tachero**.

A **remis** is a car you book by phone at a fixed price.

Most people now use an app: *pido un auto por la app*.$tip$, updated_at = now() where id = '7e126434-68df-561d-b3c2-e370396414d6' and body_md = $tip$A taxi is black and yellow; you stop it in the street when the red *libre* sign is lit: *¿Está libre?* A **remis** is a car you book by phone at a fixed price. Most people now use an app: *pido un auto por la app*. A taxi driver is a **tachero**.$tip$;
update public.tips set body_md = $tip$With a remis, ask the price before you get in: *¿Cuánto sale hasta el aeropuerto?* In a taxi the meter decides.

Paying cash, people round up: **quedate con el vuelto** — *keep the change*.$tip$, updated_at = now() where id = 'a5722513-f14d-54a4-ad42-967c6daabe18' and body_md = $tip$With a remis, ask the price before you get in: *¿Cuánto sale hasta el aeropuerto?* In a taxi the meter decides. Paying cash, people round up: **quedate con el vuelto** — *keep the change*.$tip$;
update public.tips set body_md = $tip$Argentina is in the south, so the seasons are the other way round.

**El verano** runs from late December to March, and **julio** is the middle of **el invierno**: *En enero hace calor.*

Months have no capital letter.$tip$, updated_at = now() where id = '8836c476-9c61-528f-a283-ae3ef74287f4' and body_md = $tip$Argentina is in the south, so the seasons are the other way round. **El verano** runs from late December to March, and **julio** is the middle of **el invierno**: *En enero hace calor.* Months have no capital letter.$tip$;
update public.tips set body_md = $tip$The adjective copies its noun: *una campera nueva*, *un jean nuevo*. **Grande** has one form for both: *una remera grande*, *las zapatillas grandes*.

Adjectives usually come after the noun, not before as in English.

With *¡Qué…!* both orders work: *¡Qué linda remera!*, *¡Qué campera fea!*$tip$, updated_at = now() where id = '5f0726c3-0c2e-524a-b89f-9832deab7142' and body_md = $tip$The adjective copies its noun: *una campera nueva*, *un jean nuevo*, *los pantalones chicos*. **Grande** has one form for both: *una remera grande*, *las zapatillas grandes*. Adjectives usually come after the noun, not before as in English. With *¡Qué…!* both orders work: *¡Qué linda remera!*, *¡Qué campera fea!*$tip$;
update public.tips set body_md = $tip$**al lado de** (next to), **enfrente de** (across from), **atrás de** (behind), **adelante de** (in front of), **entre** (between).

Careful: *enfrente* is across the street, not *in front*.

Remember *de + el* = *del*: *al lado del kiosco*. With no place after them, drop the *de*: *está enfrente*, *vivo al lado*.$tip$, updated_at = now() where id = 'e9b5fcfc-ba53-5a53-b7c5-cfbebadbf0e4' and body_md = $tip$**al lado de** (next to), **enfrente de** (across from), **atrás de** (behind), **adelante de** (in front of), **entre** (between). Careful: *enfrente* is across the street, not *in front*. Remember *de + el* = *del*: *al lado del kiosco*. With no place after them, drop the *de*: *está enfrente*, *vivo al lado*.$tip$;
update public.tips set body_md = $tip$Ask before you pay: *¿El desayuno está incluido?* *¿Hay wifi?*

An **alquiler temporario** is an apartment you rent for a few days or weeks.$tip$, updated_at = now() where id = 'c584c6c4-0148-5cf4-9a92-48b82350a4e0' and body_md = $tip$Ask before you pay: *¿El desayuno está incluido?* *¿Hay wifi?* *¿Hay toallas?* An **alquiler temporario** is an apartment you rent for a few days or weeks — what the booking apps offer all over Buenos Aires.$tip$;
update public.tips set body_md = $tip$*Amarillo* works like *rojo*: **amarilla, amarillos**.

But **gris** and **marrón** are the same for *el* and *la*: *un buzo gris*, *una campera gris*. They only add *-es* for more than one: *unas zapatillas grises*.$tip$, updated_at = now() where id = '790b188b-f364-5b46-be9e-6e1fe3996e4a' and body_md = $tip$*Amarillo* works like *rojo*: **amarilla, amarillos**. But **gris** and **marrón** are the same for *el* and *la* — *un buzo gris*, *una campera gris* — and only add *-es* for more than one: *unas zapatillas grises*.$tip$;
update public.tips set body_md = $tip$**Este** is *this*, near you; **ese** is *that*, further away.

Both match the noun: **este** café, **esa** mochila, and **estos**, **estas**, **esos**, **esas** for more than one.

*Esa mochila es re linda* — **re** before an adjective is the porteño *really*.$tip$, updated_at = now() where id = 'ccecffed-c0a3-59ba-b6b7-db2c4a7c140d' and body_md = $tip$**Este** is *this*, near you; **ese** is *that*, further away. Both match the noun: **este** café, **esa** mochila, and **estos**, **estas**, **esos**, **esas** for more than one. *Esa mochila es re linda* — **re** before an adjective is the porteño *really*.$tip$;
update public.tips set body_md = $tip$One pair of pants is **un pantalón** — singular: *Mi pantalón es nuevo.* *Los pantalones* works too. The same goes for **un jean**.

And **ropa** — *clothes* — is always singular: *Mi ropa es nueva.*$tip$, updated_at = now() where id = '3780b464-8070-51f5-84a8-d6507d0dfa2e' and body_md = $tip$One pair of pants is **un pantalón** — singular: *Mi pantalón es nuevo.* *Los pantalones* works too. The same goes for **un jean**. And **ropa** — *clothes* — is always singular: *Mi ropa es nueva.*$tip$;
update public.tips set body_md = $tip$Many shops are their product plus **-ería**: *carne* → **carnicería**, *pan* → *panadería*.

The **almacén** is the old corner shop that sells a bit of everything.$tip$, updated_at = now() where id = 'eeed7cdf-3b8e-5dff-9e77-07cb41136b16' and body_md = $tip$Many shops are their product plus **-ería**: *carne* → **carnicería**, *pan* → *panadería*. The **almacén** is the old corner shop that sells a bit of everything.$tip$;
update public.tips set body_md = $tip$These verbs carry a pronoun that matches the person:
| yo | **me** levanto | **me** acuesto |
| vos | **te** levantás | **te** acostás |
| él, ella | **se** levanta | **se** acuesta |
| nosotros | **nos** levantamos | |
The pronoun goes before the verb.

*Acostarse* and *almorzar* change *o → ue*, but not with vos: **me acuesto**, **almuerzo** — **te acostás**, **almorzás**.$tip$, updated_at = now() where id = '8eaa2931-6ddd-51a7-b8ae-6270f3bc71e8' and body_md = $tip$These verbs carry a pronoun that matches the person:
| yo | **me** levanto | **me** acuesto |
| vos | **te** levantás | **te** acostás |
| él, ella | **se** levanta | **se** acuesta |
| nosotros | **nos** levantamos | |
The pronoun goes before the verb. *Acostarse* and *almorzar* change *o → ue*, but not with vos: **me acuesto**, **almuerzo** — **te acostás**, **almorzás**. $tip$;
update public.tips set body_md = $tip$To say how clothes fit, use **me queda**: *Esta camisa me queda bien* — *this shirt fits me well*. *Me queda chico* — *it's too small for me*.$tip$, updated_at = now() where id = '1f894de9-91ad-51fe-8542-9bab3593187c' and body_md = $tip$To say how clothes fit, use **me queda**: *Esta camisa me queda bien* — *this shirt fits me well*. *Me queda chico* — *it's too small for me*. *El vestido me queda grande* — *the dress is too big for me*.$tip$;
update public.tips set body_md = $tip$Your clothing size is your **talle**: *¿Qué talle usás?* (you'll also hear *¿Qué talle sos?*)

Argentine sizes run small, so ask to try it on before you pay: **¿Puedo probarme esto?**$tip$, updated_at = now() where id = '834d42dc-2aa8-5ffa-b50d-ecbf01e319e5' and body_md = $tip$Your clothing size is your **talle**: *¿Qué talle usás?* (you'll also hear *¿Qué talle sos?*) Argentine sizes run small, so ask to try it on before you pay: **¿Puedo probarme esto?**$tip$;
update public.tips set body_md = $tip$Prices in Argentina run to thousands: **dos mil**, **quince mil**, **cien mil** — *mil* never takes an *s*.

A **millón** does: *dos millones*. It takes **de** before the thing: *un millón de pesos*.$tip$, updated_at = now() where id = '34a36300-3e54-5655-a581-5b7afec4a3c2' and body_md = $tip$Prices in Argentina run to thousands: **dos mil**, **quince mil**, **cien mil** — *mil* never takes an *s*. A **millón** does: *dos millones* — and takes **de** before the thing: *un millón de pesos*.$tip$;
update public.tips set body_md = $tip$To pay, you ask them to charge you: **¿me cobrás?**

The change they give back is **el vuelto**; small coins and bills are **cambio**.

**Cobrar** is also *to get paid*: *¿Cuándo cobrás?* — *when do you get paid?*$tip$, updated_at = now() where id = 'cb4863d6-1af9-5447-a5f5-2a898c771f96' and body_md = $tip$To pay, you don't say *I want to pay*: you ask them to charge you — **¿me cobrás?** The change they give back is **el vuelto**; small coins and bills are **cambio**. **Cobrar** is also *to get paid*: *¿Cuándo cobrás?* — *when do you get paid?*$tip$;
update public.tips set body_md = $tip$Waking up and getting up are two verbs: **me despierto** at seven, **me levanto** at seven-thirty.

With vos the stem doesn't change: **te despertás**.

The little word follows the person: *me, te, se, nos* — and **se** again for *ellos*: **se levantan**, **se acuestan**.$tip$, updated_at = now() where id = '63f1c92c-7c0e-5bd6-a215-09afc0414392' and body_md = $tip$Waking up and getting up are two verbs: **me despierto** at seven, **me levanto** at seven-thirty. With vos the stem doesn't change: **te despertás**. The little word follows the person: *me, te, se, nos* — and **se** again for *ellos*: **se levantan**, **se acuestan**.$tip$;
update public.tips set body_md = $tip$*Voy* is where you're going; **me voy** is that you're leaving: *me voy a las ocho*. *¿Te vas?* — *Sí, me voy.*

When someone is slow to leave: **¡Dale, apurate!** — *come on, hurry up!*$tip$, updated_at = now() where id = 'edcf0fa6-099e-5614-a334-06948ab92092' and body_md = $tip$*Voy* is where you're going; **me voy** is that you're leaving: *me voy a las ocho*. *¿Te vas?* — *Sí, me voy.* And when someone is slow to leave: **¡Dale, apurate!** — *come on, hurry up!*$tip$;
update public.tips set body_md = $tip$**Pasear** is to go out with no hurry and no plan: *Los domingos salimos a pasear.*

With a dog it means to walk it: *Voy a pasear al perro.*$tip$, updated_at = now() where id = '62e81a46-87bc-5b3c-824b-72adf9a13b88' and body_md = $tip$**Pasear** is to go out with no hurry and no plan, just to walk around and look: *Los domingos salimos a pasear.* With a dog it means to walk it: *Voy a pasear al perro.*$tip$;
update public.tips set body_md = $tip$The thing liked is the subject; the pronoun says who likes it:
| a mí | **me** gusta nadar | **me** interesa el tenis |
| a vos | **te** gusta viajar | **te** interesan los deportes |
| a él, a ella | **le** gusta cantar | **le** interesa la música |
| a nosotros | **nos** gusta pasear | **nos** encanta la playa |
| a ellos, a ustedes | **les** gusta el fútbol | **les** encantan las series |
With a verb it stays singular: *me gusta nadar y cantar*.

To name the person, put **a** in front and keep **le**: *A mi hermano le gusta nadar.*

**Odiar** is a normal verb: *odio, odiás*.$tip$, updated_at = now() where id = '66c19e01-5dde-5df7-b8e7-53568768b420' and body_md = $tip$The thing liked is the subject; the pronoun says who likes it:
| a mí | **me** gusta nadar | **me** interesa el tenis |
| a vos | **te** gusta viajar | **te** interesan los deportes |
| a él, a ella | **le** gusta cantar | **le** interesa la música |
| a nosotros | **nos** gusta pasear | **nos** encanta la playa |
| a ellos, a ustedes | **les** gusta el fútbol | **les** encantan las series |
With a verb it stays singular: *me gusta nadar y cantar*. To name the person, put **a** in front and keep **le**: *A mi hermano le gusta nadar.* **Odiar** is a normal verb: *odio, odiás*.$tip$;
update public.tips set body_md = $tip$Three short commands: *hacer* gives **hacé**, *poner* gives **poné**, and *dar* gives **dame** — *give me*: *dame otro*.

Never *haz* or *pon* — those belong to another Spanish.$tip$, updated_at = now() where id = 'dc9f86b5-115a-57f2-aeb5-e87bda316574' and body_md = $tip$Three short commands you will hear all day: *hacer* gives **hacé**, *poner* gives **poné**, and *dar* gives **dame** — *give me*: *dame otro*. Never *haz* or *pon* — those belong to another Spanish.$tip$;
update public.tips set body_md = $tip$This is the normal way to ask for someone's number — friendly, not pushy.

They may say **agendame** — *save my number* — and read it out. You answer: *te agendo*.$tip$, updated_at = now() where id = '440071f8-57d1-514e-b230-35edae4c7045' and body_md = $tip$This is the normal way to ask for someone's number — friendly, not pushy. They may say **agendame** — *save my number* — and read it out. You answer: *te agendo*.$tip$;
update public.tips set body_md = $tip$Everything runs on WhatsApp: plans, shops, even the doctor.

**Te escribo** — *I'll text you*; **mandame un mensaje**; **llamame**.

On Instagram: **seguime** — *follow me*.$tip$, updated_at = now() where id = '57dbf66a-6d96-5de2-a203-beadc2a925ee' and body_md = $tip$Everything runs on WhatsApp: plans, shops, even the doctor. **Te escribo** — *I'll text you*; **mandame un mensaje**; **llamame**. On Instagram: **seguime** — *follow me*.$tip$;
update public.tips set body_md = $tip$The word for *that* matches the thing: **esa campera**, **ese buzo**, **esas zapatillas**.

When you point without naming it, **eso** never changes.$tip$, updated_at = now() where id = '034163a3-73bc-5439-b125-61d34a1ecfb1' and body_md = $tip$The word for *that* matches the thing: **esa campera**, **ese buzo**, **esas zapatillas**. When you point without naming it, **eso** never changes.$tip$;
update public.tips set body_md = $tip$The vos command is everywhere in a shop: **mirá**, **fijate**, **esperame**, **tomá** — *tomá, tu vuelto*.

Drop the *-r* and stress the last vowel of the verb: *mirá*, *tomá*.

With *me* or *te* added, the stress stays there: *fijate* (fi-JA-te), *esperame* (es-pe-RA-me).$tip$, updated_at = now() where id = 'a9c6a548-7adb-5fe2-ab0e-9c5cc53eefa8' and body_md = $tip$The vos command is everywhere in a shop: **mirá**, **fijate**, **esperame**, **tomá** — *tomá, tu vuelto*. Drop the *-r* and stress the last vowel of the verb: *mirá*, *tomá*. With *me* or *te* added, the stress stays there: *fijate* (fi-JA-te), *esperame* (es-pe-RA-me).$tip$;
update public.tips set body_md = $tip$More verbs that stretch their stem — but never with vos:
| | preferir | volver | empezar |
| yo | pref**ie**ro | v**ue**lvo | emp**ie**zo |
| vos | **preferís** | **volvés** | **empezás** |
| él, ella | pref**ie**re | v**ue**lve | emp**ie**za |
| ellos | pref**ie**ren | v**ue**lven | emp**ie**zan |
The same as *quiero, querés* and *puedo, podés*. **Nosotros** stays short too: *preferimos, volvemos, empezamos*.

Add an infinitive for the plan: *¿Preferís ir al teatro?*$tip$, updated_at = now() where id = '4dbef0fb-6aa3-5103-be47-ebffcb6a29cd' and body_md = $tip$More verbs that stretch their stem — but never with vos:
| | preferir | volver | empezar |
| yo | pref**ie**ro | v**ue**lvo | emp**ie**zo |
| vos | **preferís** | **volvés** | **empezás** |
| él, ella | pref**ie**re | v**ue**lve | emp**ie**za |
| ellos | pref**ie**ren | v**ue**lven | emp**ie**zan |
The same as *quiero, querés* and *puedo, podés*. **Nosotros** stays short too: *preferimos, volvemos, empezamos*. Add an infinitive for the plan: *¿Preferís ir al teatro?*$tip$;
update public.tips set body_md = $tip$With a verb, **gusta** and **encanta** stay singular, even for two activities: *Me gusta leer y cocinar.*

With things they follow the thing: *Me encanta el fútbol*, *me encantan las series*.

To agree: **A mí también** after a *yes*, **A mí tampoco** after a *no*. With a normal verb it's **yo**: *No bailo.* — *Yo tampoco.*$tip$, updated_at = now() where id = 'f255cb1b-020c-5d3c-bf67-3a14a5b0ebe8' and body_md = $tip$With a verb, **gusta** and **encanta** stay singular, even for two activities: *Me gusta leer y cocinar.* With things they follow the thing: *Me encanta el fútbol*, *me encantan las series*. To agree: **A mí también** after a *yes*, **A mí tampoco** after a *no*. With a normal verb it's **yo**: *No bailo.* — *Yo tampoco.*$tip$;
update public.tips set body_md = $tip$| | querer | poder | ir |
| yo | quiero | puedo | voy |
| vos | **querés** | **podés** | vas |
| él, ella | quiere | puede | va |
| nosotros | **queremos** | **podemos** | vamos |
| ellos, ustedes | quieren | pueden | van |

*e → ie* and *o → ue* everywhere except **vos** and **nosotros**.

*Ir* is its own thing, and takes **a** + place (*a + el* = **al**): *voy al súper*, *voy a la facu*.

**Salir** only bends in *yo*: **salgo**, *salís*, *sale*. Add an infinitive for plans: *¿Querés salir?*$tip$, updated_at = now() where id = '78286e2b-e254-5636-a5a8-883bdf68f891' and body_md = $tip$| | querer | poder | ir |
| yo | quiero | puedo | voy |
| vos | **querés** | **podés** | vas |
| él, ella | quiere | puede | va |
| nosotros | **queremos** | **podemos** | vamos |
| ellos, ustedes | quieren | pueden | van |

*e → ie* and *o → ue* everywhere except **vos** and **nosotros**. *Ir* is its own thing, and takes **a** + place (*a + el* = **al**): *voy al súper*, *voy a la facu*. **Salir** only bends in *yo*: **salgo**, *salís*, *sale*. Add an infinitive for plans: *¿Querés salir?*$tip$;
update public.tips set body_md = $tip$Colors match their noun like any adjective: *un pantalón negro*, *una remera negra*, *zapatillas negras*. The color comes after the noun.

Ones ending in *-e* or a consonant only change for more than one: *verde* → **verdes**, *azul* → **azules**.$tip$, updated_at = now() where id = '14ab3922-a0da-5828-9009-788ce80ae5c3' and body_md = $tip$Colors match their noun like any adjective: *un pantalón negro*, *una remera negra*, *zapatillas negras*. Ones ending in *-e* or a consonant only change for more than one: *verde* → **verdes**, *azul* → **azules**. The color comes after the noun.$tip$;
update public.tips set body_md = $tip$To say *the black one*, drop the noun and keep **el** or **la**: *¿El negro o el azul?* — *the black one or the blue one?* *Quiero la roja* — *I want the red one*.

The same works with *este* and *ese*: *Quiero este* — *I want this one*.$tip$, updated_at = now() where id = '7125b8a8-aecd-5bd7-a7f1-20cf7ffc06fb' and body_md = $tip$To say *the black one*, drop the noun and keep **el** or **la**: *¿El negro o el azul?* — *the black one or the blue one?* *Quiero la roja* — *I want the red one*. The same works with *este* and *ese*: *Quiero este* — *I want this one*.$tip$;
update public.tips set body_md = $tip$Every direction is a vos command: drop the *-r*, stress the last vowel.
| doblar | **doblá** | Doblá a la derecha. |
| cruzar | **cruzá** | Cruzá la avenida. |
| caminar | **caminá** | Caminá dos cuadras. |
| seguir | **seguí** | Seguí derecho. |
| parar | **pará** | ¡Pará! |
*Seguir* says *sigo*, but its command is regular: **seguí**.

With a pronoun it joins the end: *bajarse* → **bajate**, *subirse* → **subite**.$tip$, updated_at = now() where id = 'c51b5304-cbed-5bfd-9bcc-9f415a78066c' and body_md = $tip$Every direction is a vos command: drop the *-r*, stress the last vowel.
| doblar | **doblá** | Doblá a la derecha. |
| cruzar | **cruzá** | Cruzá la avenida. |
| caminar | **caminá** | Caminá dos cuadras. |
| seguir | **seguí** | Seguí derecho. |
| parar | **pará** | ¡Pará! |
*Seguir* says *sigo*, but its command is regular: **seguí**. With a pronoun it joins the end: *bajarse* → **bajate**, *subirse* → **subite**.$tip$;
update public.tips set body_md = $tip$**Peli** is short for **película**: *¿Querés mirar una peli?*

A show with many episodes is a **serie**: *Me encantan las series.*$tip$, updated_at = now() where id = '6111b576-3659-5f58-af3e-6a2191d7b8f4' and body_md = $tip$**Peli** is short for **película**, and it is what people really say: *¿Querés mirar una peli?* A show with many episodes is a **serie**: *Me encantan las series.*$tip$;
update public.tips set body_md = $tip$At the front desk, say **tengo una reserva a nombre de** … and your name.

They will ask for your **pasaporte**.

Staying two nights? *Dos noches.*$tip$, updated_at = now() where id = '52586356-7f20-5175-b293-6a0dd0d21654' and body_md = $tip$At the front desk one line does it: **tengo una reserva a nombre de** … and your name. They will ask for your **pasaporte**. Staying two nights? *Dos noches.*$tip$;
update public.tips set body_md = $tip$**Los sábados** means *on Saturdays* — every Saturday: *Los sábados me levanto tarde.*

*Every day* is **todos los días**, and *once a week* is **una vez por semana**.

**El finde** is the short way to say the weekend.$tip$, updated_at = now() where id = '4e70b774-8231-5c5c-8709-c90d4bbbb4ee' and body_md = $tip$**Los sábados** means *on Saturdays* — every Saturday: *Los sábados me levanto tarde.* *Every day* is **todos los días**, and *once a week* is **una vez por semana**. **El finde** is the short way to say the weekend.$tip$;
update public.tips set body_md = $tip$**Me bajo en la próxima** — *I'm getting off at the next stop*.

Don't know the stop? *¿Cuántas paradas faltan?* or simply *¿Me avisás?*

In the subte, changing lines is a **combinación**, and you wait on the **andén**.$tip$, updated_at = now() where id = '621d77e5-9002-54ab-a910-a40fe5970eb3' and body_md = $tip$**Me bajo en la próxima** — *I'm getting off at the next stop*. Don't know the stop? *¿Cuántas paradas faltan?* or simply *¿Me avisás?* In the subte, changing lines is a **combinación**, and you wait on the **andén**.$tip$;
update public.tips set body_md = $tip$On a colectivo the **boleto** — the fare — depends on how far you go. Tell the driver first (*hasta Palermo*), then tap.

Not sure it's the right bus? *¿Va a Palermo?*$tip$, updated_at = now() where id = 'e03a678a-dcdb-5f01-a285-b2b87d91bb92' and body_md = $tip$On a colectivo the **boleto** — the fare — depends on how far you go, so you tell the driver first (*hasta Palermo*) and then tap. Not sure it's the right bus? *¿Va a Palermo?*$tip$;
update public.tips set body_md = $tip$You can't pay the driver in cash. You tap a **SUBE** card on buses, the subte and trains (many now take a bank card or phone too).

You load it at a kiosco or a subte station: *¿Me cargás la SUBE?* When the **saldo** runs out, load it again.$tip$, updated_at = now() where id = 'f8d95867-18ac-54cd-a860-30ed3a2df254' and body_md = $tip$You can't pay the driver in cash. You tap a **SUBE** card on the reader — on buses, the subte and trains (many now take a bank card or phone too). You load it at a kiosco or a subte station: *¿Me cargás la SUBE?* When the **saldo** runs out, load it again.$tip$;
update public.tips set body_md = $tip$**Pienso** + verb is *I plan to*: *pienso ir al cine*, *¿pensás salir hoy?*

**Creo que** … is *I think that* …: *creo que está cerrado*, *¿creés que abre hoy?*

And **no creo** is *I don't think so*.$tip$, updated_at = now() where id = 'eb18db97-cf2e-5687-a5df-2e4b175166b1' and body_md = $tip$**Pienso** + verb is *I plan to*: *pienso ir al cine*, *¿pensás salir hoy?* **Creo que** … is *I think that* …: *creo que está cerrado*, *¿creés que abre hoy?* And **no creo** is *I don't think so*.$tip$;
update public.tips set body_md = $tip$**El próximo viernes** is *next Friday*, the same as *el viernes que viene*; **el próximo finde** is *next weekend*.

**La próxima** alone is *next time*: *La próxima invito yo.*

**La semana que viene** — *next week* — is the form you will hear most.$tip$, updated_at = now() where id = '54719e83-d9d7-5d73-98e3-8ba760627cc8' and body_md = $tip$**El próximo viernes** is *next Friday* — the same as *el viernes que viene*; **el próximo finde** is *next weekend*. **La próxima** alone is *next time*: *La próxima invito yo.* **La semana que viene** — *next week*, the week that comes — is the form you will hear most.$tip$;
update public.tips set body_md = $tip$Clothes go in the **lavarropas**; to **planchar** them is optional for most porteños.

The floor: **barrer** with the **escoba**, then you **pasás el trapo** — the wet *trapo de piso*.$tip$, updated_at = now() where id = 'aff1bd39-fd35-5a50-a00c-5f4e71e503d4' and body_md = $tip$Clothes go in the **lavarropas**; to **planchar** them is optional for most porteños. The floor: **barrer** with the **escoba**, then you **pasás el trapo** — the wet *trapo de piso*.$tip$;
update public.tips set body_md = $tip$In *yo* the spelling bends to keep the sound: *pagar* → **pagué**, *llegar* → **llegué**.

At the end of the night someone says **pago yo** — and the next day, **ayer pagué yo, hoy te toca a vos**.$tip$, updated_at = now() where id = '9e653eb3-9104-5de6-8e34-10e35edccdc3' and body_md = $tip$In *yo* the spelling bends to keep the sound: *pagar* → **pagué**, *llegar* → **llegué**. At the end of the night someone says **pago yo** — and the next day, **ayer pagué yo, hoy te toca a vos**.$tip$;
update public.tips set body_md = $tip$| | -ar | -er, -ir |
| yo | labur**é** | com**í**, sal**í** |
| vos | labur**aste** | com**iste**, sal**iste** |
| él, ella | labur**ó** | com**ió**, sal**ió** |
| nosotros | labur**amos** | com**imos**, sal**imos** |

-er and -ir share one set of endings.

*Salimos* is both *we go out* and *we went out* — *anoche* or *ayer* tells you which.$tip$, updated_at = now() where id = '0a6e13e7-9116-5535-b2bb-1489efb882aa' and body_md = $tip$| | -ar | -er, -ir |
| yo | labur**é** | com**í**, sal**í** |
| vos | labur**aste** | com**iste**, sal**iste** |
| él, ella | labur**ó** | com**ió**, sal**ió** |
| nosotros | labur**amos** | com**imos**, sal**imos** |
-er and -ir share one set of endings. *Salimos* is both *we go out* and *we went out* — *anoche* or *ayer* tells you which.$tip$;
update public.tips set body_md = $tip$**Saber** is to know a fact or how to do something: *sé dónde vive*.

**Conocer** is to know a person or a place: **conozco a Juan**, *¿conocés Córdoba?*

In the past it changes meaning: **conocí a Juan** — *I met Juan* (for the first time).$tip$, updated_at = now() where id = '79ace8ff-909b-5e0d-b36a-2af4213f3056' and body_md = $tip$**Saber** is to know a fact or how to do something: *sé dónde vive*. **Conocer** is to know a person or a place: **conozco a Juan**, *¿conocés Córdoba?* In the past it changes meaning: **conocí a Juan** — *I met Juan* (for the first time).$tip$;
update public.tips set body_md = $tip$For where you went, porteños mostly say **fui a** or **me fui a**: *me fui a Bariloche*, *¿adónde te fuiste en enero?*

**Viajar** is more about the trip itself: *viajé en micro*, *viajé sola*. *Viajé a Bariloche* is fine too, just less everyday.$tip$, updated_at = now() where id = '5877b8a4-6b4d-5004-858e-e0b6d30d2243' and body_md = $tip$For where you went, porteños mostly say **fui a** or **me fui a**: *me fui a Bariloche*, *¿adónde te fuiste en enero?* **Viajar** is more about the trip itself: *viajé en micro*, *viajé sola*, *viajo mañana*. *Viajé a Bariloche* is fine too, just less everyday.$tip$;
update public.tips set body_md = $tip$Porteños go on **vacaciones** in January and February. Half of Buenos Aires ends up on *la costa* — Mar del Plata, Pinamar.

A small detail: **y** turns into **e** before an *i* sound — *fuimos a la montaña e hizo mucho frío*.$tip$, updated_at = now() where id = 'bd699582-34b8-5eff-8b28-4010c536d54e' and body_md = $tip$Porteños go on **vacaciones** in January and February, and *la costa* — Mar del Plata, Pinamar — is where half of Buenos Aires ends up. A small detail: **y** turns into **e** before an *i* sound — *fuimos a la montaña e hizo mucho frío*.$tip$;
update public.tips set body_md = $tip$Right now: **estar** + the verb in *-ando* (for -ar verbs) or *-iendo* (for -er and -ir): *estoy cocin**ando***, *está escrib**iendo***.

Two to learn by ear: **leyendo**, **durmiendo**.$tip$, updated_at = now() where id = '3983d478-c583-5091-bd8f-2bdf626f07f0' and body_md = $tip$Right now: **estar** + the verb in *-ando* (for -ar verbs) or *-iendo* (for -er and -ir): *estoy cocin**ando***, *está escrib**iendo***. Two to learn by ear: **leyendo**, **durmiendo**.$tip$;
update public.tips set body_md = $tip$Tell a story in order with **primero**, **después**, **al final**: *Primero comimos, después vimos una película.*

**Entonces** is mostly *so*: *No pude ir, entonces vi el partido en casa.*$tip$, updated_at = now() where id = '4ff7f7af-b212-522a-940a-0e3fe1c83e28' and body_md = $tip$Tell a story in order with **primero**, **después**, **al final**: *Primero comimos, después vimos una película.* **Entonces** is mostly *so*: *No pude ir, entonces vi el partido en casa.*$tip$;
update public.tips set body_md = $tip$**Viste** is *you saw*: **¿Viste el partido?** — *Did you see the game?*

Porteños also add **¿viste?** at the end of a sentence to mean *you know?*: *Es re caro, ¿viste?*$tip$, updated_at = now() where id = '9e470499-223a-5382-8475-2b677a8e1fde' and body_md = $tip$**Viste** is *you saw*: **¿Viste el partido?** — *Did you see the game?* Porteños also add **¿viste?** at the end of a sentence to mean *you know?*: *Es re caro, ¿viste?*$tip$;
update public.tips set body_md = $tip$*-ísimo* works on almost anything: **baratísimo**, **lindísima**. Even on *lejos*: **queda lejísimos** — *it's really far away*.

It's Spanish everywhere; the everyday porteño *really* is still **re**: *re lindo*.$tip$, updated_at = now() where id = '56a5e066-372b-51d5-87a3-d9b7c8977270' and body_md = $tip$*-ísimo* works on almost anything: **baratísimo**, **lindísima**, and even on *lejos*: **queda lejísimos** — *it's really far away*. It's Spanish everywhere; the everyday porteño *really* is still **re**: *re lindo*.$tip$;
update public.tips set body_md = $tip$Verbs in *-ar* take **-ando**: **laburando**, **esperando**, **tomando**. Verbs in *-er* and *-ir* take **-iendo**: **comiendo**, **haciendo**.

That ending never changes — only *estar* does: *Estoy comiendo.* *Está tomando un café.*$tip$, updated_at = now() where id = 'f81f6472-4ab5-5b1d-97bd-3ad25b1a3ad1' and body_md = $tip$Verbs in *-ar* take **-ando**: **laburando**, **esperando**, **tomando**. Verbs in *-er* and *-ir* take **-iendo**: **comiendo**, **haciendo**. That ending never changes — only *estar* does: *Estoy comiendo.* *Está tomando un café.*$tip$;
update public.tips set body_md = $tip$**Ya** is *already* or *right now*; **todavía** is *still*: *Todavía estoy laburando.* *Todavía no* is *not yet*.

**Casi** is *almost*.

In Buenos Aires **ya estoy llegando** can mean you are still ten minutes away.$tip$, updated_at = now() where id = 'ffce8d24-cbec-5893-93f5-546baf4d2390' and body_md = $tip$**Ya** is *already* or *right now*; **todavía** is *still*: *Todavía estoy laburando.* *Todavía no* is *not yet*. **Casi** is *almost*. One warning: in Buenos Aires **ya estoy llegando** can mean you are still ten minutes away.$tip$;
update public.tips set body_md = $tip$People shorten *cumpleaños* to **el cumple**: *¡Feliz cumple!*

The verb is **cumplir**, to turn an age: *¿Cuántos años cumplís?* — *Cumplo treinta.*

And *cumplís años el domingo* means your birthday is on Sunday.$tip$, updated_at = now() where id = '9bbe1671-a5b2-58f1-8923-ddd7c5e66973' and body_md = $tip$Nobody says *cumpleaños* in a hurry: it's **el cumple** — *¡Feliz cumple!* The verb is **cumplir**, to turn an age: *¿Cuántos años cumplís?* — *Cumplo treinta.* And *cumplís años el domingo* means your birthday is on Sunday.$tip$;
update public.tips set body_md = $tip$For plans, use **ir a** + a verb: *Vamos a organizar el cumple.* *¿Quién va a preparar el café?*

A little word like *te* or *me* goes before it: **te voy a esperar**, *¿me vas a ayudar?* You will also hear *voy a esperarte*.$tip$, updated_at = now() where id = 'd848ca5a-83f6-5ef0-82e0-4395a0511149' and body_md = $tip$For plans, use **ir a** + a verb: *Vamos a organizar el cumple.* *¿Quién va a preparar el café?* A little word like *te* or *me* goes before it: **te voy a esperar**, *¿me vas a ayudar?* You will also hear *voy a esperarte*.$tip$;
update public.tips set body_md = $tip$**Ganamos** is both *we win* and *we won*; the rest of the sentence tells you which: *Ayer ganamos el partido*.

With **perder** the two are different: *perdemos* is *we lose* and **perdimos** is *we lost*.$tip$, updated_at = now() where id = '09e2149a-d3e7-5a6d-a3ef-53623654ad25' and body_md = $tip$**Ganamos** is both *we win* and *we won*; the rest of the sentence tells you which: *Ayer ganamos el partido*. With **perder** the two are different: *perdemos* is *we lose* and **perdimos** is *we lost*.$tip$;
update public.tips set body_md = $tip$The *colectivo* crosses the city. To go to another city you take the **micro** (the long-distance bus).

You buy the **pasaje** at the terminal or online. A round-trip ticket is **ida y vuelta**.

In Buenos Aires the micros leave from the **terminal** of Retiro. The airports are Ezeiza (international) and Aeroparque (in the city).$tip$, updated_at = now() where id = 'e6e2d7cb-a37e-547a-b841-bd24476880df' and body_md = $tip$The *colectivo* crosses the city; to go to another city you take the **micro** (the long-distance bus). You buy the **pasaje** at the terminal or online. A round-trip ticket is **ida y vuelta**. In Buenos Aires the micros leave from the **terminal** of Retiro, and the airports are Ezeiza (international) and Aeroparque (in the city).$tip$;
update public.tips set body_md = $tip$| | estar | tener | pasarla |
| yo | estuve | tuve | **la pasé** |
| vos | estuviste | tuviste | **la pasaste** |
| él, ella | estuvo | tuvo | **la pasó** |
| nosotros | **estuvimos** | **tuvimos** | **la pasamos** |
| ellos | **estuvieron** | **tuvieron** | **la pasaron** |

*Estar* and *tener* get an odd stem (*estuv-*, *tuv-*) for every person, with no accent. *Pasarla* is regular: **la pasé**, **la pasó** keep the accent.

**¿Cómo estuvo?** — *how was it?* — **Estuvo increíble, la pasamos bárbaro.**$tip$, updated_at = now() where id = '9f882e99-1bc8-5b88-90df-07108c33ca10' and body_md = $tip$| | estar | tener | pasarla |
| yo | estuve | tuve | **la pasé** |
| vos | estuviste | tuviste | **la pasaste** |
| él, ella | estuvo | tuvo | **la pasó** |
| nosotros | **estuvimos** | **tuvimos** | **la pasamos** |
| ellos | **estuvieron** | **tuvieron** | **la pasaron** |
*Estar* and *tener* get an odd stem (*estuv-*, *tuv-*) for every person, with no accent. *Pasarla* is regular: **la pasé**, **la pasó** keep the accent. **¿Cómo estuvo?** — *how was it?* — **Estuvo increíble, la pasamos bárbaro.**$tip$;
update public.tips set body_md = $tip$A porteño doesn't *have fun*, he **la pasa**: **la pasé bárbaro**, **la pasamos re bien**, **¿la pasaste bien?**

The *la* never changes. It's just part of the phrase.$tip$, updated_at = now() where id = 'fc227694-2082-50f7-b840-d1a18ed3162f' and body_md = $tip$A porteño doesn't *have fun*, he **la pasa**: **la pasé bárbaro**, **la pasamos re bien**, **¿la pasaste bien?** The *la* never changes and never means anything — it's just part of the phrase.$tip$;
update public.tips set body_md = $tip$**Me toca a mí** — *it's my turn*. **¿A quién le toca?** — *whose turn is it?*

The chore follows in its basic form (*lavar*, *sacar*, *limpiar*): **te toca lavar los platos**.

Add *a mí* / *a vos* for stress: **hoy te toca a vos**.$tip$, updated_at = now() where id = '35b971dd-87ee-5d40-9e55-ceb3b73004bc' and body_md = $tip$**Me toca a mí** — *it's my turn*. **¿A quién le toca?** — *whose turn is it?* The chore follows in its basic form (*lavar*, *sacar*, *limpiar*): **te toca lavar los platos**. Add *a mí* / *a vos* for stress: **hoy te toca a vos**.$tip$;
update public.tips set body_md = $tip$For a porteño **la costa** is the Atlantic beaches south of the city. There you rent a **carpa** — a beach tent by the day.

The other option is **las sierras** of Córdoba: a **río** instead of the sea.

A **carpa** is also a normal camping tent: *me fui al río con la carpa*.$tip$, updated_at = now() where id = '3e0c5f85-ecd5-5ae1-8b4e-81aea77a6ddc' and body_md = $tip$For a porteño **la costa** is the Atlantic beaches south of the city, where you rent a **carpa** — a beach tent by the day. The other classic is **las sierras** of Córdoba: a **río** instead of the sea. A **carpa** is also a normal camping tent: *me fui al río con la carpa*.$tip$;
update public.tips set body_md = $tip$| | cenar | pagar | llegar |
| yo | cen**é** | pag**ué** | lleg**ué** |
| vos | cen**aste** | pag**aste** | lleg**aste** |
| él, ella | cen**ó** | pag**ó** | lleg**ó** |
| nosotros | cen**amos** | pag**amos** | lleg**amos** |
| ellos, ustedes | cen**aron** | pag**aron** | lleg**aron** |

*-amos* looks like the present, so the time says which: **anoche cenamos afuera**. *-aron* is only ever the past: *hablaron, tomaron*.

In *yo*, *-gar* verbs add a *u* to keep the hard *g*: **pagué**, **llegué**.$tip$, updated_at = now() where id = '7e1f82d2-cee5-5c5a-b728-6c4040631839' and body_md = $tip$| | cenar | pagar | llegar |
| yo | cen**é** | pag**ué** | lleg**ué** |
| vos | cen**aste** | pag**aste** | lleg**aste** |
| él, ella | cen**ó** | pag**ó** | lleg**ó** |
| nosotros | cen**amos** | pag**amos** | lleg**amos** |
| ellos, ustedes | cen**aron** | pag**aron** | lleg**aron** |
*-amos* looks like the present, so the time says which: **anoche cenamos afuera**. *-aron* is only ever the past: *hablaron, tomaron*. In *yo*, *-gar* verbs add a *u* to keep the hard *g*: **pagué**, **llegué**.$tip$;
update public.tips set body_md = $tip$| more than | **más** alto **que** yo |
| less than | **menos** caro **que** |
| as … as | **tan** lindo **como** |
| better, worse | **mejor**, **peor** |
| older, younger | **más grande**, **más chico** |
| really | rico → **riquísimo**, caro → **carísimo** |

The describing word still matches the person: *mi hermana es más alta que yo*.

Say **mejor** for *better*; about a person, **más buena** means *nicer*. **El más chico** is *the youngest*, **el peor** *the worst*.$tip$, updated_at = now() where id = '8413be7f-d993-58d5-87be-fbc6a78cbf25' and body_md = $tip$| more than | **más** alto **que** yo |
| less than | **menos** caro **que** |
| as … as | **tan** lindo **como** |
| better, worse | **mejor**, **peor** |
| older, younger | **más grande**, **más chico** |
| really | rico → **riquísimo**, caro → **carísimo** |
The describing word still matches the person: *mi hermana es más alta que yo*. Say **mejor** for *better*; about a person, **más buena** means *nicer*. **El más chico** is *the youngest*, **el peor** *the worst*.$tip$;
update public.tips set body_md = $tip$*Doler* has a past too, and it keeps its *me*: **me dolió la cabeza** — *my head hurt*; **¿te dolió?**; **a mi viejo le dolió la rodilla**.

When more than one thing hurt, it's **dolieron**, just like *me duelen*: **me dolieron los ojos** — *my eyes hurt*.$tip$, updated_at = now() where id = '1ef9dc5b-0a2c-51f6-8072-8665cac9cd15' and body_md = $tip$*Doler* has a past too, and it stays glued to its *me*: **me dolió la cabeza** — *my head hurt*, **¿te dolió?**, **a mi viejo le dolió la rodilla**. When more than one thing hurt, it's **dolieron**, just like *me duelen*: **me dolieron los ojos** — *my eyes hurt*.$tip$;
update public.tips set body_md = $tip$The thing that hurts is the subject: **me duele la cabeza** — *my head hurts*; **me duelen los pies** — *my feet hurt*.

The *me* says whose, so Spanish uses *la*, not *mi*.

For someone else, name them with *a*: **a Juan le duele la espalda** — *Juan's back hurts*.$tip$, updated_at = now() where id = 'e09dc1af-b15b-5bb4-a301-1cf6109dfb09' and body_md = $tip$The thing that hurts is the subject: **me duele la cabeza** — *my head hurts*, **me duelen los pies** — *my feet hurt*. The *me* says whose, so Spanish uses *la*, not *mi*. For someone else, name them with *a*: **a Juan le duele la espalda** — *Juan's back hurts*.$tip$;
update public.tips set body_md = $tip$Tell your life story with the past you already know: **nací** (*I was born*), **viví**, **volví**.

**Me crié** is *I grew up*, and it always takes **me**: *Nací en Italia, pero me crié en Buenos Aires.* To ask: *¿Te criaste acá?*$tip$, updated_at = now() where id = 'ef4a4d49-d272-5947-9455-4f31401357f9' and body_md = $tip$Tell your life story with the past you already know: **nací** (*I was born*), **viví**, **volví**. **Me crié** is *I grew up*, and it always takes **me**: *Nací en Italia, pero me crié en Buenos Aires.* To ask: *¿Te criaste acá?*$tip$;
update public.tips set body_md = $tip$**No pude** means you wanted to or tried, and it did not happen: *No pude ir al asado*.

**Dije**, **vine** and **pude** have no accent, but **leer** is regular and keeps it: *leí, leíste*.$tip$, updated_at = now() where id = '146ce785-b82f-5bf1-9450-7e1c902d98ba' and body_md = $tip$**No pude** means you wanted to or tried, and it did not happen: *No pude ir al asado*. **Dije**, **vine** and **pude** have no accent, but **leer** is regular and keeps it: *leí, leíste*.$tip$;
update public.tips set body_md = $tip$| | traer | querer | venir | poder |
| yo | traje | quise | vine | pude |
| vos | trajiste | quisiste | viniste | pudiste |
| él, ella | trajo | quiso | vino | pudo |
| nosotros | | | vinimos | pudimos |
| ellos | trajeron | | vinieron | pudieron |

Same endings as *hice*: *-e, -iste, -o, -imos, -ieron*. After a *j*, just *-eron*: **dijeron, trajeron**.

**No vino nadie** — *nobody came*. After the verb, *nadie* still needs the *no*; in front, it doesn't: *nadie trajo hielo*.$tip$, updated_at = now() where id = '717a288c-7ce1-5678-95a9-fb667c3542bc' and body_md = $tip$| | traer | querer | venir | poder |
| yo | traje | quise | vine | pude |
| vos | trajiste | quisiste | viniste | pudiste |
| él, ella | trajo | quiso | vino | pudo |
| nosotros | | | vinimos | pudimos |
| ellos | trajeron | | vinieron | pudieron |
Same endings as *hice*: *-e, -iste, -o, -imos, -ieron* — after a *j*, just *-eron*: **dijeron, trajeron**. **No vino nadie** — *nobody came*: after the verb, *nadie* still needs the *no*; in front, it doesn't: *nadie trajo hielo*.$tip$;
update public.tips set body_md = $tip$**Ni idea** — *no idea* — is the short answer when you don't know: *—¿Dónde está Nico? —Ni idea.*

The full form is **no tengo idea** or **no tengo ni idea**.

To say what about: *Ni idea de dónde está el cargador.*$tip$, updated_at = now() where id = 'c585fa33-b562-55de-93f1-7f619cc3b533' and body_md = $tip$**Ni idea** — *no idea* — is the everyday short answer when you don't know: *—¿Dónde está Nico? —Ni idea.* The full form is **no tengo idea** or **no tengo ni idea**. To say what about: *Ni idea de dónde está el cargador.*$tip$;
update public.tips set body_md = $tip$Holidays are told in *nosotros*: **alquilamos**, **nadamos**, **paseamos**, **sacamos mil fotos**.

The weather that ruined it: **llovió toda la semana**.

In -ar verbs *nosotros* is the same now and in the past: **nadamos** is *we swim* or *we swam*; *ayer* or *en enero* tells you which.$tip$, updated_at = now() where id = 'bd5cb236-10da-572d-bfd4-d7b1bf5ec6d4' and body_md = $tip$Holidays are told in *nosotros*: **alquilamos**, **nadamos**, **paseamos**, **sacamos mil fotos**. And the weather that ruined it: **llovió toda la semana**. In -ar verbs *nosotros* is the same now and in the past: **nadamos** is *we swim* or *we swam*; *ayer* or *en enero* tells you which.$tip$;
update public.tips set body_md = $tip$**Cené, cenaste, cenó, cenamos, cenaron**; **viví, viviste, vivió, vivimos, vivieron**.

Every regular verb takes one of these two sets of endings: -ar verbs go like *cenar*; -er and -ir verbs go like *vivir*.$tip$, updated_at = now() where id = '22eec0b9-282c-5b1e-a1da-ffdac83fdbc5' and body_md = $tip$**Cené, cenaste, cenó, cenamos, cenaron**; **viví, viviste, vivió, vivimos, vivieron**. Two sets of endings, and every regular verb takes one of them: -ar verbs go like *cenar*; -er and -ir verbs go like *vivir*.$tip$;
update public.tips set body_md = $tip$**Cenamos** and **salimos** look the same in the present and the past. They are *we have dinner* or *we had dinner*, *we go out* or *we went out*.

Only -ar and -ir verbs do this; -er verbs change: **comemos** (now), **comimos** (then).

The time word tells you which: **anoche**, **ayer**, **el sábado**.$tip$, updated_at = now() where id = '9f2c679d-71d9-54c9-8c34-e6bc1cf22a1b' and body_md = $tip$**Cenamos** and **salimos** look the same in the present and the past: *we have dinner* or *we had dinner*, *we go out* or *we went out*. Only -ar and -ir verbs do this; -er verbs change: **comemos** (now), **comimos** (then). A porteño never gets lost: **anoche**, **ayer**, **el sábado** — the time word does the work.$tip$;
update public.tips set body_md = $tip$**Me tocó** works like *gustar*: the thing is the subject. With two things it is **me tocaron**: *me tocaron los platos y el baño*.

**Llovió** has no person at all — just *it rained*.$tip$, updated_at = now() where id = 'a160a37a-11e9-53de-a76b-fce48eb65bc8' and body_md = $tip$**Me tocó** works like *gustar*: the thing is the subject, so with two things it is **me tocaron**: *me tocaron los platos y el baño*. **Llovió** has no person at all — just *it rained*.$tip$;
update public.tips set body_md = $tip$English says *I can't see anything*; Spanish just says **no veo nada** — no word for *can*. The same with **ves**: *¿Ves?* is *can you see?*

The double negative is correct Spanish: *no* before the verb, *nada* after it.$tip$, updated_at = now() where id = 'a2908aec-4964-564b-be6f-345aab4ac907' and body_md = $tip$English says *I can't see anything*; Spanish just says **no veo nada** — no word for *can*. The same with **ves**: *¿Ves?* is *can you see?* And the double negative is correct Spanish: *no* before the verb, *nada* after it.$tip$;
update public.tips set body_md = $tip$Like *vengo* and *traigo*, these verbs have an odd *I* form: **digo**, **pongo** and **veo**. With vos they are regular: **decís**, **ponés**, **ves**. *—¿Qué decís? —Yo no digo nada.*

*Decir* also changes **e** to **i** in **dice** and **dicen**.

To tell someone, add **le**: *¿Qué le digo a Ana?*$tip$, updated_at = now() where id = 'ba82ffe4-0152-5484-bf4b-85a5828f972a' and body_md = $tip$Like *vengo* and *traigo*, these verbs have an odd *I* form: **digo**, **pongo** and **veo**. With vos they are regular: **decís**, **ponés**, **ves**. *Decir* also changes **e** to **i** in **dice** and **dicen**. *—¿Qué decís? —Yo no digo nada.* To tell someone, add **le**: *¿Qué le digo a Ana?*$tip$;
update public.tips set body_md = $tip$**Boludo** is common between close friends and an insult to anyone else. Say it only to friends you know well.

**Quilombo** means a mess. It's informal, not rude, but keep it out of formal settings.$tip$, updated_at = now() where id = '01e1a3a8-575e-5121-9fc4-7dd8f47262c1' and body_md = $tip$**Boludo** is common between close friends and an insult to anyone else — say it only to friends you know well. **Quilombo** means a mess; it's informal, not rude, but keep it out of formal settings.$tip$;
update public.tips set body_md = $tip$English *bring* is two verbs here. **Llevar** is to a place where you are not yet: *¿Qué llevo al asado?* **Traer** is to the place where you are now: *¿Podés traer hielo?*

Going to a friend's place, always ask **¿qué llevo?**

**Venir** works like *traer*: on your way to someone, say **ya voy**, not *vengo*.$tip$, updated_at = now() where id = 'd5a4acc0-9d64-5970-8f68-5d4ed9936d96' and body_md = $tip$English *bring* is two verbs here. **Llevar** is to a place where you are not yet: *¿Qué llevo al asado?* **Traer** is to the place where you are now: *¿Podés traer hielo?* Going to a friend's place, always ask **¿qué llevo?** **Venir** works like *traer*: on your way to someone, say **ya voy**, not *vengo*.$tip$;
update public.tips set body_md = $tip$**Hace** + a time is *ago*: **llegué hace una hora** — *I got here an hour ago*; **hablé con Juan hace dos días**.

*Not long ago* is **hace poco**. The question is **¿hace cuánto?** — *how long ago?*$tip$, updated_at = now() where id = 'bd066d7e-c2a1-50d3-8b02-143dea692406' and body_md = $tip$**Hace** + a time is *ago*: **llegué hace una hora** — *I got here an hour ago*; **hablé con Juan hace dos días**. *Not long ago* is **hace poco**, and the question is **¿hace cuánto?** — *how long ago?*$tip$;
update public.tips set body_md = $tip$The turn has a past: **ayer me tocó a mí, hoy te toca a vos**. **¿A quién le tocó?**

Most chores are plain -ar verbs: **lavé, limpiaste, lavó**. *Sacar* changes in *yo*: **saqué** (like *busqué*). *Barrer* is an -er verb: **barrí, barriste**.$tip$, updated_at = now() where id = 'acd8e9ee-2a6d-5a93-a00c-59315ddfc1b2' and body_md = $tip$The turn has a past: **ayer me tocó a mí, hoy te toca a vos**. **¿A quién le tocó?** Most chores are plain -ar verbs: **lavé, limpiaste, lavó**. *Sacar* changes in *yo*: **saqué** (like *busqué*). *Barrer* is an -er verb: **barrí, barriste**.$tip$;
update public.tips set body_md = $tip$You ask for a **turno** (an appointment). The verb is **sacar turno**: *tengo que sacar turno con el médico*.

The **guardia** is the emergency room.

**Estoy engripado** — *I've got the flu*.$tip$, updated_at = now() where id = 'd389c9c5-149a-57c8-b192-f1851fa1b7df' and body_md = $tip$You ask for a **turno** (an appointment), and the verb is **sacar turno**: *tengo que sacar turno con el médico*. The **guardia** is the emergency room. **Estoy engripado** — *I've got the flu* — is what gets you the day off.$tip$;
update public.tips set body_md = $tip$**Dar** has a short past with no accents: **di, diste, dio** — *le di la llave*.

And *buscar* bends in *yo* to keep the hard *c* sound: **busqué** (not *buscé*).

**Buscar** is *to look for* and also *to pick someone up*: *busqué la billetera*, *la busqué a Mica en la estación*.$tip$, updated_at = now() where id = '7fd0a81b-3973-5a9c-8a43-62a122aa7461' and body_md = $tip$**Dar** has a short past with no accents: **di, diste, dio** — *le di la llave*. And *buscar* bends in *yo* to keep the hard *c* sound: **busqué** (not *buscé*). **Buscar** is *to look for* and also *to pick someone up*: *busqué la billetera*, *la busqué a Mica en la estación*.$tip$;
update public.tips set body_md = $tip$Even when you name the person, the **le** stays: **le dije a Juan que no**, **le di la llave a Sofi**, **les mandé las fotos a mis viejos**. English says it once; a porteño says it twice.

With *lo* or *la* next to it, *le* turns into **se**: *¿La foto? Ya se la mandé a Juan.*$tip$, updated_at = now() where id = '89462fe8-f55c-5371-aa23-378aa233d61a' and body_md = $tip$Even when you name the person, the **le** stays: **le dije a Juan que no**, **le di la llave a Sofi**, **les mandé las fotos a mis viejos**. English says it once; a porteño says it twice. With *lo* or *la* next to it, *le* turns into **se**: *¿La foto? Ya se la mandé a Juan.*$tip$;
update public.tips set body_md = $tip$| him, or a masculine thing | **lo**, **los** | ¿El audio? **Lo** mando ahora. |
| her, or a feminine thing | **la**, **las** | ¿La tarjeta? **La** tengo. |
| to him, her, them | **le**, **les** | **Le** doy la llave. |
| me, you, us | **me**, **te**, **nos** | **Te** llamo mañana. |

Before a normal verb: *la tengo*. Stuck to the end of a command, with no accent: **llamame**, **dame**, **mandame**, **prestame**. With a name you often say both: *lo llamo a Juan*.

**Buscar** is *to look for*, and also *to pick someone up*: *te busco a las ocho* = *te paso a buscar*.$tip$, updated_at = now() where id = '863cc68c-e7da-5e85-9141-6c897afcf44b' and body_md = $tip$| him, or a masculine thing | **lo**, **los** | ¿El audio? **Lo** mando ahora. |
| her, or a feminine thing | **la**, **las** | ¿La tarjeta? **La** tengo. |
| to him, her, them | **le**, **les** | **Le** doy la llave. |
| me, you, us | **me**, **te**, **nos** | **Te** llamo mañana. |
Before a normal verb: *la tengo*. With a name you often say both: *lo llamo a Juan*, *les mando un audio a mis viejos*. Stuck to the end of a command, with no accent: **llamame**, **dame**, **mandame**, **prestame**. **Buscar** is *to look for*, and also *to pick someone up*: *te busco a las ocho* = *te paso a buscar*.$tip$;
update public.tips set body_md = $tip$Two pronouns together go person first, thing second: **me lo** mandás, **te la** doy.

And *le* or *les* in front of *lo, la, los, las* turns into **se**: *¿le mandás el audio?* → **¿se lo mandás?**; *le doy la llave* → **se la doy**.$tip$, updated_at = now() where id = 'b1798c9a-9da4-5dde-905f-9db65a0af829' and body_md = $tip$Two pronouns together go person first, thing second: **me lo** mandás, **te la** doy. And *le* or *les* in front of *lo, la, los, las* turns into **se**: *¿le mandás el audio?* → **¿se lo mandás?**; *le doy la llave* → **se la doy**.$tip$;
update public.tips set body_md = $tip$Tell the pharmacist what's wrong: **estoy resfriado**, **tengo alergia**, **me duele el oído**. You leave with **una curita** or **unas pastillas**.

To ask: **¿Tenés algo para la alergia?** — **Necesito algo para la garganta.**

A broken bone is **quebrado**: *tiene el brazo quebrado*. When you hurt yourself: **me lastimé la rodilla**.$tip$, updated_at = now() where id = 'be9c362e-6f84-5899-8e49-6046ba3c3cf3' and body_md = $tip$Half the time the pharmacist is your doctor: **estoy resfriado**, **tengo alergia**, **me duele el oído** — and you leave with **una curita** or **unas pastillas**. To ask: **¿Tenés algo para la alergia?** — **Necesito algo para la garganta.** A broken bone is **quebrado**: *tiene el brazo quebrado*. And when you hurt yourself: **me lastimé la rodilla**.$tip$;
update public.tips set body_md = $tip$Two more with their own stem and no accent: **traje, trajiste, trajo** (brought) and **quise, quisiste, quiso** (wanted, tried).

**Quise** is about one moment: *I wanted to* (and tried). **No quise**: *I didn't want to* (and didn't).

**Quise venir, pero no pude** — *I wanted to come but couldn't*.$tip$, updated_at = now() where id = '38bd929f-9d15-5f91-9679-cd20e1ac26fb' and body_md = $tip$Two more with their own stem and no accent: **traje, trajiste, trajo** (brought) and **quise, quisiste, quiso** (wanted, tried). **Quise** is about one moment: *I wanted to* (and tried). **No quise**: *I didn't want to* (and didn't). **Quise venir, pero no pude** — *I wanted to come but couldn't* — is the porteño apology for a missed asado.$tip$;
update public.tips set body_md = $tip$| | nacer | vivir | volver |
| yo | nac**í** | viv**í** | volv**í** |
| vos | nac**iste** | viv**iste** | volv**iste** |
| él, ella | nac**ió** | viv**ió** | volv**ió** |
| ellos, ustedes | nac**ieron** | viv**ieron** | volv**ieron** |

*Ellos* ends in **-ieron**: *comieron, salieron, vivieron*.

**¿Dónde naciste?** — **Nací en Rosario.** And **no entendí** is the past too.$tip$, updated_at = now() where id = 'faac1c21-798a-562a-8e8f-a3985f710228' and body_md = $tip$| | nacer | vivir | volver |
| yo | nac**í** | viv**í** | volv**í** |
| vos | nac**iste** | viv**iste** | volv**iste** |
| él, ella | nac**ió** | viv**ió** | volv**ió** |
| ellos, ustedes | nac**ieron** | viv**ieron** | volv**ieron** |

*Ellos* ends in **-ieron**: *comieron, salieron, vivieron*. **¿Dónde naciste?** — **Nací en Rosario.** And **no entendí** is the past too.$tip$;
update public.tips set body_md = $tip$On the table: **chimichurri** — oil, garlic, parsley, chili — and **salsa criolla** — onion, tomato, pepper.

The meat is cooked **a la leña** at the good places.$tip$, updated_at = now() where id = '56f2eb46-cd35-5649-9776-16424039e6cd' and body_md = $tip$On the table: **chimichurri** — oil, garlic, parsley, chili — and **salsa criolla** — onion, tomato, pepper. Ketchup is a crime. The meat is cooked **a la leña** at the good places.$tip$;
update public.tips set body_md = $tip$A bife comes jugoso, a punto, or **bien cocido** — *well done*; **vuelta y vuelta** is seared on each side and almost raw inside.

The bill has a line for the **cubierto** — *the cover charge*: the bread and the cutlery.$tip$, updated_at = now() where id = 'd9075515-9557-5e2e-986b-a39b62161f51' and body_md = $tip$A bife comes jugoso, a punto, or **bien cocido** — *well done*; **vuelta y vuelta** is seared on each side and almost raw inside. The bill has a line for the **cubierto** — *the cover charge*: the bread and the cutlery.$tip$;
update public.tips set body_md = $tip$The tip is **la propina**, usually 10 percent and in cash. The bill may also have a small charge per person, the *cubierto*: it is not the tip.

**¿Compartimos?** — *shall we share?* — is how two people order one *bife*.$tip$, updated_at = now() where id = '2910b1f9-2188-52b3-b99b-5ff32f745b64' and body_md = $tip$The tip is **la propina**, usually 10 percent and in cash. The bill may also have a small charge per person, the *cubierto*: it is not the tip. **¿Compartimos?** — *shall we share?* — is how two people order one enormous *bife*.$tip$;
update public.tips set body_md = $tip$Every plan lives in **el grupo**, the WhatsApp group. Someone asks **¿confirmás?** — *are you in?* — and you answer **confirmo**.

A **salida** is an outing: a night out or a day trip with friends.$tip$, updated_at = now() where id = '55a36cb5-236c-5553-85f2-319f84e67896' and body_md = $tip$Every plan lives in **el grupo**, the WhatsApp group. Someone asks **¿confirmás?** — *are you in?* — and you answer **confirmo**. A **salida** is an outing: a night out or a day trip with friends.$tip$;
update public.tips set body_md = $tip$**Contame** opens a story; **de repente** is the twist, **por suerte** the relief, **al final** the end.

**Igual** is *anyway*, *still*: *estoy cansada, pero igual voy*. **O sea** is *I mean* or *so*.

**¿Qué contás?** is a greeting: *what's new?*$tip$, updated_at = now() where id = 'c3ebca78-c01d-5635-ae32-235914cc3de0' and body_md = $tip$**Contame** opens it; **de repente** is the twist, **por suerte** the relief, **al final** the end. **Igual** is *anyway*, *still*: *estoy cansada, pero igual voy*. **O sea** is *I mean* or *so*. **¿Qué contás?** is just a greeting: *what's new?*$tip$;
update public.tips set body_md = $tip$| | ser | tener | vivir | ir |
| yo, él, ella | era | tenía | vivía | iba |
| vos | eras | tenías | vivías | ibas |
| nosotros | éramos | teníamos | vivíamos | íbamos |

This past describes: how things *were*, what you *had*, where you *lived*, what you *used to* do. *Yo* and *él* share one form — the story tells you which.

**De chico** is *as a kid*: **De chico vivía en Rosario.** It changes with the person: **de chica** (a woman), **de chicos** (*we*).$tip$, updated_at = now() where id = '862e703e-1590-5d4a-9240-1b3e1a058369' and body_md = $tip$| | ser | tener | vivir | ir |
| yo, él, ella | era | tenía | vivía | iba |
| vos | eras | tenías | vivías | ibas |
| nosotros | éramos | teníamos | vivíamos | íbamos |
This past describes: how things *were*, what you *had*, where you *lived*, what you *used to* do. *Yo* and *él* share one form — the story tells you which. **De chico** is *as a kid*: **De chico vivía en Rosario.** It changes with the person: **de chica** (a woman), **de chicos** (*we*).$tip$;
update public.tips set body_md = $tip$Porteños mostly say **colegio** for school, primary or secondary: **¿A qué colegio ibas?** — *Iba a un colegio de mi barrio.*

*Escuela* is understood and used too, mostly for state primary schools.$tip$, updated_at = now() where id = 'da883151-76a3-53af-9ca3-7a9fd5825673' and body_md = $tip$Porteños mostly say **colegio** for school, primary or secondary: **¿A qué colegio ibas?** — *Iba a un colegio de mi barrio.* *Escuela* is understood and used too, mostly for state primary schools.$tip$;
update public.tips set body_md = $tip$**Boca** against **River** is **el superclásico**; any other big rivalry game is a **clásico**.

Boca fans are called *bosteros* and River fans *gallinas*. They say it about themselves with pride, but from you it can be an insult.$tip$, updated_at = now() where id = '8f4c23b2-5684-59ec-a311-4cb9e59ce5a6' and body_md = $tip$**Boca** against **River** is **el superclásico**; any other big rivalry game is a **clásico**. Boca fans are called *bosteros* and River fans *gallinas*: they say it about themselves with pride, but from you it can be an insult. Which side you're on, the course leaves to you.$tip$;
update public.tips set body_md = $tip$A team is a **cuadro**, and you inherit it: *Soy de Independiente, el cuadro de mi abuelo.*

To say your team, use **soy de** or **soy hincha de**.

**Hinchar por** is for one game or the national team: *Hincho por la selección.*$tip$, updated_at = now() where id = 'bb6b163b-1fc3-54dd-91e3-016a0d3e09ba' and body_md = $tip$The first question in a new friendship. A team is a **cuadro**, and you inherit it: *Soy de Independiente, el cuadro de mi abuelo.* Answer with **soy de** or **soy hincha de**. **Hinchar por** is for one game or the national team: *Hincho por la selección.*$tip$;
update public.tips set body_md = $tip$Scores are said with **a**: **ganamos dos a uno**, *empatamos cero a cero*.

To score is **hacer un gol**: *Juan hizo dos goles*.

The field, and the whole stadium, is **la cancha**.$tip$, updated_at = now() where id = '92fc2db4-2843-50a2-aab4-fa03169e8b02' and body_md = $tip$Scores are said with **a**: **ganamos dos a uno**, *empatamos cero a cero*. To score is **hacer un gol**: *Juan hizo dos goles*. And the field — and the whole stadium — is **la cancha**.$tip$;
update public.tips set body_md = $tip$**Pido** (I order), **pedís** (you order); in the past **pedí**, **pediste**, and — with an *i* — **pidió**.

To get in: **Una mesa para dos, por favor.** At the table: **¿Me traés la carta?** and, at the end, **la cuenta**.

Water is **con gas** or **sin gas**: *Para tomar, un agua sin gas.*$tip$, updated_at = now() where id = '63f495cd-a71f-55ee-ae30-b4789e91cebd' and body_md = $tip$**Pido** (I order), **pedís** (you order); in the past **pedí**, **pediste**, and — with an *i* — **pidió**. At the table: **¿Me traés la carta?** and, at the end, **la cuenta**. To get in: **Una mesa para dos, por favor.** And water is **con gas** or **sin gas**: *Para tomar, un agua sin gas.*$tip$;
update public.tips set body_md = $tip$School here is **la primaria** (six to twelve) and then **la secundaria**. Each year of primaria is a **grado**: *primer grado*.

In a state primary school everyone wears a white **guardapolvo** over their clothes. The best part of the day is the **recreo**.

In primaria the teacher is **la maestra** or **el maestro**; from secundaria on it is **el profesor**, **la profe**.$tip$, updated_at = now() where id = 'a4adbfa9-faf6-51e4-b4d1-cd956aff9126' and body_md = $tip$School here is **la primaria** (six to twelve) and then **la secundaria**. In a state primary school everyone wears a white **guardapolvo** over their clothes, and the best part of the day is the **recreo**. In primaria the teacher is **la maestra** or **el maestro**; from secundaria on it is **el profesor**, **la profe**. Each year of primaria is a **grado**: *primer grado*.$tip$;
update public.tips set body_md = $tip$Wanting and being able are states, so back then they take the imperfect. **De chico quería ser maestro** — *as a kid I wanted to be a teacher*; **no podía salir solo** — *I wasn't allowed out on my own*.

**En esa época** — *back then* — sets the scene.

At a counter, **quería un cortado** is a polite *I'd like a cortado*. With a person, **querer a** is *to love*: *quería mucho a mi maestra*.$tip$, updated_at = now() where id = 'a54ef42c-739f-54d1-8ea1-e7c82fed10f9' and body_md = $tip$Wanting and being able are states, so back then they take the imperfect: **De chico quería ser maestro** — *as a kid I wanted to be a teacher*; **no podía salir solo** — *I wasn't allowed out on my own*. **En esa época** — *back then* — sets the whole scene. At a counter, **quería un cortado** is just a polite *I'd like a cortado*. With a person, **querer a** is *to love*: *quería mucho a mi maestra*.$tip$;
update public.tips set body_md = $tip$**En lo de mi abuela** — *at my grandma's (place)*; **vamos a lo de Juan** — *let's go to Juan's*.

Sunday lunch there meant **ravioles con tuco**, and a **sobremesa** that ran until the *mate* came out.$tip$, updated_at = now() where id = '32fcb37a-4aa0-51cd-81ec-b1e0bd63b3f5' and body_md = $tip$**En lo de mi abuela** — *at my grandma's (place)*; **vamos a lo de Juan** — *let's go to Juan's*. Sunday lunch there meant **ravioles con tuco**, and a **sobremesa** that ran until the *mate* came out.$tip$;
update public.tips set body_md = $tip$Traditions told from back then are imperfect: **nos juntábamos**, **festejábamos**, **armábamos el arbolito** on the 8th of December.

**Es costumbre…** — *it's the custom to…* — brings them into the present: *Es costumbre juntarnos en Navidad.*$tip$, updated_at = now() where id = 'a080f44e-07bb-51f5-922b-1fe5cf6548e6' and body_md = $tip$Traditions told from back then are imperfect: **nos juntábamos**, **festejábamos**, **armábamos el arbolito** on the 8th of December. **Es costumbre…** — *it's the custom to…* — brings them into the present: *Es costumbre juntarnos en Navidad.*$tip$;
update public.tips set body_md = $tip$**Había** is *there was, there were*; **hacía calor** is *it was hot*.

**Estaba lloviendo** — *it was raining* — puts you in the middle of it; **llovía** says the same, and can also mean *it used to rain*.

**Mientras** — *while* — joins two things going on at once.$tip$, updated_at = now() where id = '636b7821-633f-5fb5-94b1-ae095af46302' and body_md = $tip$**Había** is *there was, there were*; **hacía calor** is *it was hot*. **Estaba lloviendo** — *it was raining* — puts you in the middle of it; **llovía** says the same, and can also mean *it used to rain*. **Mientras** — *while* — joins two things going on at once.$tip$;
update public.tips set body_md = $tip$| | jugar | salir | ver |
| yo, él, ella | jug**aba** | sal**ía** | ve**ía** |
| vos | jug**abas** | sal**ías** | ve**ías** |
| nosotros | jug**ábamos** | sal**íamos** | ve**íamos** |
| ellos, ustedes | jug**aban** | sal**ían** | ve**ían** |

*Ver* keeps its *e*: **veía**.

For TV, **miraba** and **veía** both work; to see a person, only *ver*: **veía a mi abuela**. **Me encantaba andar en bici.**$tip$, updated_at = now() where id = 'df3230f6-6436-5eae-a43d-92ce8264bfcb' and body_md = $tip$| | jugar | salir | ver |
| yo, él, ella | jug**aba** | sal**ía** | ve**ía** |
| vos | jug**abas** | sal**ías** | ve**ías** |
| nosotros | jug**ábamos** | sal**íamos** | ve**íamos** |
| ellos, ustedes | jug**aban** | sal**ían** | ve**ían** |
*Ver* keeps its *e*: **veía**. For TV, **miraba** and **veía** both work; to see a person, only *ver*: **veía a mi abuela**. **Me encantaba andar en bici.**$tip$;
update public.tips set body_md = $tip$The other team is *they*: **ganaron**, **perdieron**, **empataron**.

Yours is usually *we*: **¡salimos campeones!**

About your own team you can say either: **ganamos** (we, the fans) or **ganaron** (they, the players).$tip$, updated_at = now() where id = 'aefc05cf-1bc3-5355-80ac-66c5469787aa' and body_md = $tip$The other team is *they*: **ganaron**, **perdieron**, **empataron**. Yours is usually *we*, from the bar or the sofa: **¡salimos campeones!** About your own team you can say either: **ganamos** (we, the fans) or **ganaron** (they, the players).$tip$;
update public.tips set body_md = $tip$An asado comes in order: first **chorizo** and **morcilla**, the **achuras**, then the cuts — **vacío**, tira de asado.

A **choripán** is a chorizo in bread.$tip$, updated_at = now() where id = '9521c790-bf0b-5537-9298-425b9e6009f7' and body_md = $tip$An asado comes in order: first **chorizo** and **morcilla**, the **achuras**, then the cuts — **vacío**, tira de asado. A **choripán** is a chorizo in bread, the food of every stadium.$tip$;
update public.tips set body_md = $tip$Meat comes **jugosa** — *rare* — **a punto** — *medium* — or well done.

The **parrilla** is both the grill and the restaurant.$tip$, updated_at = now() where id = '95e185c4-bc0b-5a6f-aaf0-369094e37060' and body_md = $tip$Meat comes **jugosa** — *rare* — **a punto** — *medium* — or well done. The **parrilla** is both the grill and the restaurant.$tip$;
update public.tips set body_md = $tip$For the table there's the **parrillada** — *a mixed grill* on its own little grill. It has chorizo, morcilla, **mollejas** — *sweetbreads: a soft gland, not bread* — **chinchulines** and a **tira de asado**.

On your own: a **bife de chorizo** or an **entraña**. The prized cuts are **ojo de bife** and **lomo**.

Start with a **provoleta para compartir**. On the side: *papas fritas* or *ensalada*.$tip$, updated_at = now() where id = '320ccab5-810e-5019-b4e8-625dde6a8ac3' and body_md = $tip$For the table there's the **parrillada** — *a mixed grill* on its own little grill: chorizo, morcilla, **mollejas** — *sweetbreads: a soft gland, not bread* — **chinchulines** and a **tira de asado**. On your own: a **bife de chorizo** or an **entraña**. The classic start is a **provoleta para compartir**; the prized cuts are **ojo de bife** and **lomo**, with *papas fritas* or *ensalada* on the side.$tip$;
update public.tips set body_md = $tip$On the 29th of every month many families eat **ñoquis** with a banknote under the plate, for luck.

A **feriado** is a public holiday, and there are plenty of them.$tip$, updated_at = now() where id = '3b3cb9f8-ec4a-523f-9a40-289a5d60cc43' and body_md = $tip$On the 29th of every month many families eat **ñoquis** with a banknote under the plate, for luck. A **feriado** is a public holiday, and there are plenty of them.$tip$;
update public.tips set body_md = $tip$**Las fiestas** are Christmas and New Year: *¡Felices fiestas!*

**Navidad** falls in the heat and is celebrated the night before, on **Nochebuena** — the 24th.

Dinner is an *asado* or a cold spread. At midnight: **sidra**, **pan dulce** and a **brindis** — *¡salud!* — then fireworks and **Papá Noel**.$tip$, updated_at = now() where id = 'a3d8add9-3af2-5335-9dc3-fda0446ac1a7' and body_md = $tip$**Las fiestas** are Christmas and New Year together: *¡Felices fiestas!* **Navidad** falls in the heat and is celebrated the night before, on **Nochebuena** — the 24th: an *asado* or a cold spread, and at midnight **sidra**, **pan dulce** and a **brindis** — *¡salud!* — before the fireworks and **Papá Noel**.$tip$;
update public.tips set body_md = $tip$*Avisar* in the past is plain -ar: **avisé**, **avisaste**, **avisó**.

The text at eight-forty: **¿Dónde estás? Te esperaba a las ocho.** The answer: **ya salgo**.

Other answers: **estoy llegando** (still ten minutes away); **estoy en camino** — *I'm on my way*; **llego en diez**.$tip$, updated_at = now() where id = '3c539a2a-3a6b-501b-8da7-a0d344dac0f0' and body_md = $tip$*Avisar* in the past is plain -ar: **avisé**, **avisaste**, **avisó**. The text at eight-forty: **¿Dónde estás? Te esperaba a las ocho.** And the answer, always: **ya salgo**. The other classics: **estoy llegando** (still ten minutes away), **estoy en camino** — *I'm on my way* — and **llego en diez**.$tip$;
update public.tips set body_md = $tip$**Tardar** is *to take (time)*: **¿cuánto tardás?** — *how long will you be?*; **el bondi tardó una hora**.

Porteños are rarely **puntuales**, so *tipo ocho* already has the delay built in.$tip$, updated_at = now() where id = '46a3767c-afbc-5de8-b6ed-18d09ef114cb' and body_md = $tip$**Tardar** is *to take (time)*: **¿cuánto tardás?** — *how long will you be?*; **el bondi tardó una hora**. Porteños are rarely **puntuales**, so *tipo ocho* already has the delay built in.$tip$;
update public.tips set body_md = $tip$The other way to say how you felt is **me dio** + the feeling: **me dio miedo** — *it scared me*.

It works with many feelings: *me dio bronca* (it made me angry), *me dio vergüenza* (I was embarrassed), *me dio lástima* (I felt sorry).$tip$, updated_at = now() where id = 'b20e2e46-7d03-5dc9-be61-90cfa02a80ea' and body_md = $tip$The other way to say how you felt is **me dio** + the feeling: **me dio miedo** — *it scared me*. You will hear it with many feelings: *me dio bronca* (it made me angry), *me dio vergüenza* (I was embarrassed), *me dio lástima* (I felt sorry).$tip$;
update public.tips set body_md = $tip$In the past, *gustar* and *encantar* work like any -ar verb: **me gustaba**, **me encantaba** — *I liked*, *I loved*.

Several things take an **-n**: **me gustaban los dibujitos**. The same **-n** makes the *they* form of any verb: **los pibes jugaban a la pelota en la vereda**.$tip$, updated_at = now() where id = '9ec733ad-4e25-5b19-b479-b8f53e3f3e70' and body_md = $tip$In the past, *gustar* and *encantar* work like any -ar verb: **me gustaba**, **me encantaba** — *I liked*, *I loved*. Several things take an **-n**: **me gustaban los dibujitos**. The same **-n** makes the *they* form of any verb: **los pibes jugaban a la pelota en la vereda**.$tip$;
update public.tips set body_md = $tip$Only three verbs break the pattern: *ser* (**era**), *ir* (**iba**) and *ver*, which keeps its *e*: **veía**, **veías**.

Set **antes** against **ahora** and the imperfect does the rest: *antes veía dibujitos, ahora veo series.*$tip$, updated_at = now() where id = 'd89da798-e89a-57e0-8335-8034a0f0ffe4' and body_md = $tip$Only three verbs break the pattern: *ser* (**era**), *ir* (**iba**) and *ver*, which keeps its *e*: **veía**, **veías**. Set **antes** against **ahora** and the imperfect does the rest: *antes veía dibujitos, ahora veo series.*$tip$;
update public.tips set body_md = $tip$**Me olvidé de su cumple** — *I forgot his birthday*. Like *me enojé* it keeps its pronoun, and takes **de** before what you forgot.

Left something behind? No *de*: **me olvidé las llaves en casa**.

For the others: **¿te olvidaste las llaves?**, **se olvidó de llamar**, **nos olvidamos de reservar**. Same shape: **me aburrí**, **me calmé**, **me enamoré**.$tip$, updated_at = now() where id = '964d8d97-0008-5be6-9c6c-5b9aeb6147f7' and body_md = $tip$**Me olvidé de su cumple** — *I forgot his birthday*. Like *me enojé* it keeps its pronoun, and takes **de** before what you forgot. Left something behind? No *de*: **me olvidé las llaves en casa**. For the others: **¿te olvidaste las llaves?**, **se olvidó de llamar**, **nos olvidamos de reservar**. Same shape: **me aburrí**, **me calmé**, **me enamoré** — of Buenos Aires, of course.$tip$;
update public.tips set body_md = $tip$**Estaba nervioso** is how you were; **me puse nervioso** is the moment it hit you. **Me sentí re mal** — *I felt awful* — is one moment too.

For *us*: **nos pusimos contentos**. About someone else: **¿cómo se sintió tu vieja?**

And **me puse colorado** is *I blushed*.$tip$, updated_at = now() where id = '80ff4fcc-3b03-5cec-bc11-61a64e3a76c3' and body_md = $tip$**Estaba nervioso** is how you were; **me puse nervioso** is the moment it hit you. **Me sentí re mal** — *I felt awful* — is one moment too. For *us*: **nos pusimos contentos**; and **me puse colorado** is *I blushed*. About someone else: **¿cómo se sintió tu vieja?**$tip$;
update public.tips set body_md = $tip$When the story ends well, the listener says **¡menos mal!** — *thank goodness!* — and **¡por fin!** when it took forever.

**¿En serio?** keeps you talking: *really?*$tip$, updated_at = now() where id = 'eb59a72a-6a28-5738-a51c-17fb712b380a' and body_md = $tip$When the story ends well, the listener says **¡menos mal!** — *thank goodness!* — and **¡por fin!** when it took forever. **¿En serio?** keeps you talking: *really?*$tip$;
update public.tips set body_md = $tip$A **final** that ends in a tie goes to the **alargue** — *extra time* — and then to **penales**. The **arquero atajó** one and somebody **metió** the last.

**Salir campeón** is *to win the title*.

**¡Aguante!** shows love for your team, win or lose: *¡Aguante Argentina!*$tip$, updated_at = now() where id = '0543a4d4-e086-5583-a92b-a63cb2d2b3c0' and body_md = $tip$A **final** that ends in a tie goes to the **alargue** — *extra time* — and then to **penales**: the **arquero atajó** one and somebody **metió** the last. **Salir campeón** is *to win the title*. **¡Aguante!** shows love for your team, win or lose: *¡Aguante Argentina!*$tip$;
update public.tips set body_md = $tip$**Estaba en la ducha** — the scene; **cuando sonó el timbre** — the event.

If you could add *was …-ing* or *used to* in English, it's the imperfect. If it happened once and ended, it's the preterite.$tip$, updated_at = now() where id = '592b7207-8f86-5875-b8bb-9d2027eff517' and body_md = $tip$**Estaba en la ducha** — the scene; **cuando sonó el timbre** — the event. If you could add *was …-ing* or *used to* in English, it's the imperfect; if it happened once and ended, it's the preterite.$tip$;
update public.tips set body_md = $tip$**Era, eras, éramos, eran**; **tenía, tenías, teníamos, tenían**; **jugaba, jugabas, jugábamos, jugaban**.

One set of endings for *-ar*, one for *-er* and *-ir*, and *yo* and *él* always share.$tip$, updated_at = now() where id = 'b82e3b85-1c79-5d6c-9b43-76d0bec86a2f' and body_md = $tip$**Era, eras, éramos, eran**; **tenía, tenías, teníamos, tenían**; **jugaba, jugabas, jugábamos, jugaban**. One set of endings for *-ar*, one for *-er* and *-ir*, and *yo* and *él* always share.$tip$;
update public.tips set body_md = $tip$The time in a story is always imperfect: **era la una**, **eran las tres**.

The scene keeps going — **no había luz**, **hacía un calor bárbaro** — until something happens: **empezó a llover** and **llegué mojado**.$tip$, updated_at = now() where id = 'c6bd0210-8827-5e7e-99e5-ec0492090bc7' and body_md = $tip$The time in a story is always imperfect: **era la una**, **eran las tres**. The scene keeps going — **no había luz**, **hacía un calor bárbaro** — until something happens: **empezó a llover** and **llegué mojado**.$tip$;
update public.tips set body_md = $tip$To go to **la cancha** you are usually a **socio** — *a member* — of the **club**, and you pay a monthly fee.

The **popular** is the cheap standing section. There the **hinchada** sings its **cantitos** under the **banderas**.$tip$, updated_at = now() where id = 'bcc20295-b0f0-5657-8bba-544e8abc8f78' and body_md = $tip$To go to **la cancha** you are usually a **socio** — *a member* — of the **club**, and you pay a monthly fee. The **popular** is the cheap standing section, where the **hinchada** sings its **cantitos** for ninety minutes under the **banderas**.$tip$;
update public.tips set body_md = $tip$**Salado** means *salty*, and also *savory*, the opposite of sweet: *¿algo dulce o algo salado?*

Argentine food is almost never **picante**, so *spicy* here is very mild.

If you don't eat meat, say **soy vegetariano** or **soy vegetariana**.$tip$, updated_at = now() where id = 'c273802d-5e46-5b75-b333-fa2cb7d31200' and body_md = $tip$**Salado** means *salty*, and also *savory*, the opposite of sweet: *¿algo dulce o algo salado?* Argentine food is almost never **picante**, so *spicy* here is very mild. If you don't eat meat, say **soy vegetariano** or **soy vegetariana**.$tip$;
update public.tips set body_md = $tip$**Avisame** — *let me know*: **dale, avisame mañana**. **Te aviso** — *I'll let you know*.

To meet up: **¿nos encontramos en la esquina?** — *should we meet on the corner?*; **te espero** — *I'll wait for you*.$tip$, updated_at = now() where id = '6e6d5a70-d67b-5f52-aa08-3decebcbcd88' and body_md = $tip$**Avisame** — *let me know*: **dale, avisame mañana**. **Te aviso** — *I'll let you know*. To meet up: **¿nos encontramos en la esquina?** — *should we meet on the corner?* — and **te espero** — *I'll wait for you*.$tip$;
update public.tips set body_md = $tip$**Tipo** before a time is *around*: **tipo ocho** — *around eight*. In Buenos Aires that means eight-fifteen at the earliest.

**En punto** is *on the dot*, and rarer.$tip$, updated_at = now() where id = 'e4c89765-3136-5623-8e35-8eb3d88cd738' and body_md = $tip$**Tipo** before a time is *around*: **tipo ocho** — *around eight*, which in Buenos Aires means eight-fifteen at the earliest. **En punto** is *on the dot*, and rarer.$tip$;
update public.tips set body_md = $tip$The *e* of *pedir* turns into *i* in **pido**, **pide**, and in the past for *él* and *ellos*: **pidió**, **pidieron**.

*Nosotros* keeps its *e*, and **pedimos** is both *we order* and *we ordered*: **anoche pedimos empanadas**.$tip$, updated_at = now() where id = '020df5a2-fd52-5796-ab77-690cad166bff' and body_md = $tip$The *e* of *pedir* turns into *i* in **pido**, **pide**, and in the past for *él* and *ellos*: **pidió**, **pidieron**. *Nosotros* keeps its *e* — and **pedimos** is both *we order* and *we ordered*: **anoche pedimos empanadas**.$tip$;
update public.tips set body_md = $tip$For pizza: **una grande de muzza**, eaten standing up by the **porción**, or **mitad y mitad** for the undecided.

At a parrilla, start with a **provoleta** and a **choripán**.

**Reservé para las diez** — dinner starts late.$tip$, updated_at = now() where id = 'f63133a6-64bd-5ac4-8b7d-bdbc4f0e61d8' and body_md = $tip$Porteño pizza is its own religion: **una grande de muzza**, eaten standing up by the **porción**, or **mitad y mitad** for the undecided. At a parrilla, start with a **provoleta** and a **choripán**. **Reservé para las diez** — dinner starts late.$tip$;
update public.tips set body_md = $tip$**¡Buen provecho!** — *enjoy!* — is said when you serve food, or when you pass people who are eating, even coworkers or strangers. The answer is **gracias**.

When the host says **sírvanse** — *help yourselves* — everybody starts right away.$tip$, updated_at = now() where id = '1a5ebe3a-b4e7-546a-b4ed-cb9dba0344f7' and body_md = $tip$**¡Buen provecho!** — *enjoy!* — is said when you serve food, or when you pass people who are eating, even coworkers or strangers. The answer is **gracias**. And when the host says **sírvanse** — *help yourselves* — everybody starts right away.$tip$;
update public.tips set body_md = $tip$| one person (vos) | more than one (ustedes) |
| probá | **prueben** |
| agarrá | **agarren** |
| tomá | **tomen** |
| no te olvides | **no se olviden** |

-ar verbs **-en**, the rest **-an**. The stem is the *yo* stem: *pruebo* → **prueben**, *hago* → **hagan**, *vengo* → **vengan**. Also **coman**, **hagan** lugar, **vayan**, **dejen**.

**Vayan** + *-ando/-iendo* is *go ahead and start*: **vayan comiendo** — *start eating*. **Dejen de** + verb is *stop*: **dejen de hablar** — *stop talking*.$tip$, updated_at = now() where id = 'a5ed425f-69c3-5b5d-816e-3fc1878a9d27' and body_md = $tip$| one person (vos) | more than one (ustedes) |
| probá | **prueben** |
| agarrá | **agarren** |
| tomá | **tomen** |
| no te olvides | **no se olviden** |

Also **coman**, **hagan** lugar, **vayan**, **dejen**. **Vayan** + *-ando/-iendo* is *go ahead and start*: **vayan comiendo** — *start eating*. -ar verbs **-en**, the rest **-an**. The stem is the *yo* stem: *pruebo* → **prueben**, *hago* → **hagan**, *vengo* → **vengan**. **Dejen de** + verb is *stop*: **dejen de hablar** — *stop talking*.$tip$;
update public.tips set body_md = $tip$Travel stories use the preterite: **acampamos** — *we camped*; **hicimos dedo** — *we hitchhiked*. Also **¿recorriste el norte?**, **mis viejos recorrieron la costa**.

Distances are in **kilómetros**.$tip$, updated_at = now() where id = '22e7eebe-f6ca-564c-96ff-51d87aa19bcf' and body_md = $tip$Travel stories run on the preterite: **acampamos** — *we camped* — **hicimos dedo** — *we hitchhiked* — **¿recorriste el norte?**, **mis viejos recorrieron la costa**. Distances are in **kilómetros**, and in the south there are always more than you thought.$tip$;
update public.tips set body_md = $tip$At the **fiambrería** you buy by weight: **cien gramos de jamón**, cut in **fetas** — *slices*.

The usual order is **un cuarto** — 250 grams: *un cuarto de jamón cocido*.

**Jamón cocido** is plain ham; **jamón crudo** is the cured one.$tip$, updated_at = now() where id = '3d839f10-580b-59a4-ae50-d6b91d794967' and body_md = $tip$At the **fiambrería** you buy by weight: **cien gramos de jamón**, cut in **fetas** — *slices*. The classic order is **un cuarto** — 250 grams: *un cuarto de jamón cocido*. **Jamón cocido** is plain ham; **jamón crudo** is the cured one.$tip$;
update public.tips set body_md = $tip$The vendor always asks **¿algo más?** — *anything else?* You answer **nada más, gracias**, or keep going: **y un kilo de naranjas**.

To ask a price, **¿cuánto sale?** is the everyday way — same as *¿cuánto cuesta?* For things sold by weight you already know **¿a cuánto está?**$tip$, updated_at = now() where id = 'bbf8899a-9326-5028-a470-f2f170b9aab4' and body_md = $tip$The vendor always asks **¿algo más?** — *anything else?* You answer **nada más, gracias**, or keep going: **y un kilo de naranjas**. To ask a price, **¿cuánto sale?** is the everyday way — same as *¿cuánto cuesta?* For things sold by weight you already know **¿a cuánto está?**$tip$;
update public.tips set body_md = $tip$The city is **la Capital** — often with no article: *vivo en Capital*. The ring of towns around it is **el conurbano**.

Palermo, **San Telmo** and **La Boca** are barrios of the Capital: *Palermo está lleno de bares*, *La Boca es re turística*.

Ask any porteño: **¿en qué barrio vivís?**$tip$, updated_at = now() where id = '9b2c23e3-838a-574f-affd-f711c01a05fe' and body_md = $tip$The city is **la Capital** — often with no article: *vivo en Capital*. The ring of towns around it is **el conurbano**. Palermo, **San Telmo** and **La Boca** are barrios of the Capital: *Palermo está lleno de bares*, *La Boca es re turística*. The first question to any porteño: **¿en qué barrio vivís?**$tip$;
update public.tips set body_md = $tip$Remember **queda** for where a place *is*: **¿dónde queda Palermo?**

New here is **me parece** — *I think, it seems to me*: *me parece re caro*.

To ask for an opinion: **¿qué te parece el depto?** — *what do you think of the apartment?*$tip$, updated_at = now() where id = 'f7ca6bf1-8ae1-516b-935e-ab0b2f6dcb07' and body_md = $tip$Remember **queda** for where a place *is*: **¿dónde queda Palermo?** New here is **me parece** — *I think, it seems to me*: *me parece re caro*. To ask for an opinion: **¿qué te parece el depto?** — *what do you think of the apartment?*$tip$;
update public.tips set body_md = $tip$You rent through an **inmobiliaria** or straight from the **dueño**.

Every month you pay the **alquiler** plus the **expensas** — *the building fees*.

To sign the **contrato** you leave a **depósito** and show a **garantía**: someone who answers for you if you don't pay.$tip$, updated_at = now() where id = 'dbad321f-4d32-5c2e-9458-5dbbd5e6decf' and body_md = $tip$You rent through an **inmobiliaria** or straight from the **dueño**. Every month you pay the **alquiler** plus the **expensas** — *the building fees*. To sign the **contrato** you leave a **depósito** and show a **garantía**: someone who answers for you if you don't pay.$tip$;
update public.tips set body_md = $tip$The old place is imperfect, the move is preterite: **antes alquilaba en el centro** — how it was; **me mudé a Palermo** — what happened.

**Extrañaba** is missing something over a period of time: *los primeros meses extrañaba mi barrio*.$tip$, updated_at = now() where id = 'c7afa899-216a-57fc-be0d-9bbb58ad2055' and body_md = $tip$The old place is imperfect, the move is preterite: **antes alquilaba en el centro** — how it was; **me mudé a Palermo** — what happened. **Extrañaba** is missing something over a period of time: *los primeros meses extrañaba mi barrio*.$tip$;
update public.tips set body_md = $tip$A document that has run out is **vencido**: *tengo el pasaporte vencido*.

What comes next: **renovar** — *renew it*; **completar el formulario** — *fill in the form*; **hacer la cola** (or **la fila**) — *stand in line*; **firmar** — *sign*.$tip$, updated_at = now() where id = '69d02752-e744-5eaf-b2d3-5ee433c31092' and body_md = $tip$A document that has run out is **vencido**: *tengo el pasaporte vencido*. What comes next: **renovar** — *renew it*; **completar el formulario** — *fill in the form*; **hacer la cola** (or **la fila**) — *stand in line*; **firmar** — *sign*.$tip$;
update public.tips set body_md = $tip$For almost anything official you first **sacás turno**: you book an appointment online.

You bring the **DNI**, the national ID card. As a foreigner, you use your passport until you get your own DNI.$tip$, updated_at = now() where id = '96bfd871-c811-5edf-8fe3-6f07c3c37007' and body_md = $tip$For almost anything official you first **sacás turno** — you book an appointment online — and you bring the **DNI**, the national ID card, without which nothing happens. As a foreigner, you use your passport until you get your own DNI.$tip$;
update public.tips set body_md = $tip$At the verdulería the price moves, so it's **¿a cuánto está el kilo?** — *how much is it a kilo today?*

You buy **un kilo**, **medio kilo** or **una docena**.$tip$, updated_at = now() where id = '632ffd1b-e406-5c33-ae55-84874e2345f3' and body_md = $tip$At the verdulería the price moves, so it's **¿a cuánto está el kilo?** — *how much is it a kilo today?* You buy **un kilo**, **medio kilo** or **una docena**.$tip$;
update public.tips set body_md = $tip$For produce porteños often use the singular for the whole product: **la papa está cara** — *potatoes are expensive*; **un kilo de cebolla** — *a kilo of onions*.

Fruit that **está verde** is *not ripe* yet (*es verde* is the color).$tip$, updated_at = now() where id = 'a7acb74c-66af-5b76-bee7-4e80edc61c85' and body_md = $tip$For produce porteños often use the singular for the whole product: **la papa está cara** — *potatoes are expensive*; **un kilo de cebolla** — *a kilo of onions*. And fruit that **está verde** is *not ripe* yet (*es verde* is the color).$tip$;
update public.tips set body_md = $tip$Nouns: **una cosita**, **un pedacito**, **un besito**. Adverbs: **tempranito**, **rapidito**.

Adjectives: **calentito** — *nice and warm*; **cortito**; **igualito a su papá**. They agree like any adjective: **una sopa calentita**.

Said to an adult, **solito** — *all by himself* — sounds tender or teasing, so keep it for friends.$tip$, updated_at = now() where id = '48fa40c1-c5f2-58f5-8669-4ba8e2da759c' and body_md = $tip$Nouns: **una cosita**, **un pedacito**, **un besito**. Adjectives: **calentito** — *nice and warm*; **cortito**; **igualito a su papá**; **solito** — *all by himself* (to an adult it sounds tender or teasing, so keep it for friends). Adverbs: **tempranito**, **rapidito**. It agrees like any adjective: **una sopa calentita**.$tip$;
update public.tips set body_md = $tip$Argentina has its own names: **palta** is avocado, **frutilla** is strawberry.

Before you buy, ask **¿están maduras?** — *are they ripe?* The opposite of *madura* is **verde**: **están verdes** — *they are not ripe yet*. (*Es verde* is the color.)$tip$, updated_at = now() where id = 'fbd2133a-6859-5ead-9926-d782de4ed43e' and body_md = $tip$Argentina has its own names: **palta** is avocado, **frutilla** is strawberry. Before you buy, ask **¿están maduras?** — *are they ripe?* The opposite of *madura* is **verde**: **están verdes** — *they are not ripe yet*. (*Es verde* is the color.)$tip$;
update public.tips set body_md = $tip$Words ending in *-r*, *-n*, *-e* take **-cito**: **calor → calorcito**, **café → cafecito**. Short *sol* does too: **solcito**.

Words in *-o* just swap it for **-ito**. A *c* turns *qu*: **fresco → fresquito**; a *z* turns *c*: **pedazo → pedacito**.

Porteños love diminutives for nice weather: **hace fresquito**, **qué lindo calorcito**.$tip$, updated_at = now() where id = '25238004-814b-58f4-824a-ded9fff9bc9e' and body_md = $tip$Words ending in *-r*, *-n*, *-e* take **-cito**: **calor → calorcito**, **café → cafecito**. Short *sol* does too: **solcito**. Words in *-o* just swap it for **-ito**, and a *c* turns *qu*: **fresco → fresquito**; a *z* turns *c*: **pedazo → pedacito**. Porteños love diminutives for nice weather: **hace fresquito**, **qué lindo calorcito**.$tip$;
update public.tips set body_md = $tip$**No hace falta** — *there's no need*.

**Conviene** is the advice: **conviene ir temprano** — *it's best to go early*.$tip$, updated_at = now() where id = '1d2ec980-0806-5da8-bbf4-6621d289bcb9' and body_md = $tip$**No hace falta** — *there's no need*. **Conviene** is the advice: **conviene ir temprano** — *it's best to go early*.$tip$;
update public.tips set body_md = $tip$**Tener que** changes with the person: **tenés que firmar** — *you have to sign*; **tiene que venir ella** — *she has to come*; **tienen que esperar** — *they have to wait*.

**Hay que** stays the same for everyone: **hay que hacer la fila**.$tip$, updated_at = now() where id = '84966d7c-a1bb-545e-b107-22c27cd2689c' and body_md = $tip$**Tener que** changes with the person: **tenés que firmar** — *you have to sign*; **tiene que venir ella** — *she has to come*; **tienen que esperar** — *they have to wait*. **Hay que** stays the same for everyone: **hay que hacer la fila**.$tip$;
update public.tips set body_md = $tip$Nothing happens in Buenos Aires without **sacar turno** — *booking an appointment*, almost always **por internet**.

Then they **piden** things: **te piden una fotocopia**, **completá esto**.$tip$, updated_at = now() where id = 'a1d65681-cd3c-511c-ba20-f092864449fc' and body_md = $tip$Nothing happens in Buenos Aires without **sacar turno** — *booking an appointment*, almost always **por internet**. Then they **piden** things: **te piden una fotocopia**, **completá esto**.$tip$;
update public.tips set body_md = $tip$Drop the *no* and **hace falta** says what's needed: **hace falta una fotocopia**.

**¿Es obligatorio?** — *is it required?* — is a handy question at any counter.$tip$, updated_at = now() where id = 'd621bc2e-5355-512b-b832-644c850667ef' and body_md = $tip$Drop the *no* and **hace falta** says what's needed: **hace falta una fotocopia**. **¿Es obligatorio?** — *is it required?* — is a handy question at any counter.$tip$;
update public.tips set body_md = $tip$The **cordillera** — *the Andes range* — runs down the whole west.

It has **lagos** and **nieve** in the south, **bodegas** — *wineries* — in Mendoza, red **valles** in Jujuy.

A **mochilero** does it all with a backpack and a **carpa** — *a tent*.$tip$, updated_at = now() where id = 'b4d85210-f57c-504d-a015-0281e2125c5a' and body_md = $tip$The **cordillera** — *the Andes range* — runs down the whole west: **lagos** and **nieve** in the south, **bodegas** — *wineries* — in Mendoza, red **valles** in Jujuy. A **mochilero** does it all with a backpack and a **carpa** — *a tent*, down to Ushuaia.$tip$;
update public.tips set body_md = $tip$For paperwork, **demorar** is how long something takes: **¿cuánto demora la residencia?**

For a person or a bus porteños say **tardar**: *Lucía tardó media hora*, *el bondi tardó un montón*.

You **presentás** the papers, and when they **atienden** you, it's over in five minutes.$tip$, updated_at = now() where id = '0a7f761b-d9c7-516c-b579-5874def00152' and body_md = $tip$For paperwork, **demorar** is how long something takes: **¿cuánto demora la residencia?** The honest answer is *depende*. For a person or a bus porteños say **tardar**: *Lucía tardó media hora*, *el bondi tardó un montón*. You **presentás** the papers, and when they finally **atienden** you, it's over in five minutes.$tip$;
update public.tips set body_md = $tip$For the **residencia** you need your **antecedentes penales** — *criminal record certificate* — with the **apostilla**, the stamp that makes a foreign paper valid here.

You also need a **certificado de domicilio** — *proof of address*.

While you wait they give you the **precaria**, a temporary permit you can work and travel with.$tip$, updated_at = now() where id = 'aed54cfb-0f01-532e-96bf-6fc8ed773310' and body_md = $tip$For the **residencia** you need your **antecedentes penales** — *criminal record certificate* — with the **apostilla**, the stamp that makes a foreign paper valid here, and a **certificado de domicilio** — *proof of address*. While you wait they give you the **precaria**, a temporary permit you can already work and travel with.$tip$;
update public.tips set body_md = $tip$**Tengo ganas de ir a la playa** — *I feel like going to the beach*. **Pienso ir** — *I'm planning to go*.

Careful: **pensar** + a verb is *to plan to*, but **pensar que** is *to think that*: *pienso que tenés razón*.$tip$, updated_at = now() where id = '40e8fd4a-7fef-5c78-a666-03e64f6b1eed' and body_md = $tip$**Tengo ganas de ir a la playa** — *I feel like going to the beach*. **Pienso ir** — *I'm planning to go*. Careful: **pensar** + a verb is *to plan to*, but **pensar que** is *to think that*: *pienso que tenés razón*.$tip$;
update public.tips set body_md = $tip$The future is **ir a** + verb: **voy a laburar**, **vamos a comer**.

For a fixed plan the plain present works too: **viajamos el viernes**. *Viajamos* is also *we traveled*: the time word tells you which.

**Que viene** after a time word is *next*: **la semana que viene**, **el año que viene**, **el finde que viene**.$tip$, updated_at = now() where id = 'a5a666cc-13f5-582b-a31d-e3454f6aea44' and body_md = $tip$The future is **ir a** + verb: **voy a laburar**, **vamos a comer**. For a fixed plan the plain present works too: **viajamos el viernes**. *Viajamos* is also *we traveled*: the time word tells you which. **Que viene** after a time word is *next*: **la semana que viene**, **el año que viene**, **el finde que viene**.$tip$;
update public.tips set body_md = $tip$The **calesita** in the plaza, **golosinas** from the kiosco, a **barrilete** on a windy day.

And the **álbum** of **figuritas** you filled for every **Mundial**: **lo llenábamos entre todos** — *we used to fill it together*.$tip$, updated_at = now() where id = '086d52a0-b9ba-519c-bd38-ddf31a31c648' and body_md = $tip$The **calesita** in the plaza, **golosinas** from the kiosco, a **barrilete** on a windy day, and the **álbum** of **figuritas** you filled for every **Mundial** — **lo llenábamos entre todos** — *we used to fill it together*.$tip$;
update public.tips set body_md = $tip$What you remember takes **de**: **mi abuela se acuerda de todo**; **nos acordamos de esa época**.

Before **que** or **cuando**, people usually drop the **de**: *me acuerdo que íbamos a la playa*.

**No me acordaba** — *I'd forgotten* — is imperfect: the not-remembering went on until someone brought it up.$tip$, updated_at = now() where id = 'd68950b1-3362-55bb-81f3-e4f576a91d8e' and body_md = $tip$What you remember takes **de**: **mi abuela se acuerda de todo**; **nos acordamos de esa época**. Before **que** or **cuando**, people usually drop the **de**: *me acuerdo que íbamos a la playa*. **No me acordaba** — *I'd forgotten* — is imperfect: the not-remembering went on until someone brought it up.$tip$;
update public.tips set body_md = $tip$Still a plain question in the present with **me** in front: **¿me acompañás?** — *will you come with me?*; **¿me llevás?** — *can you give me a ride?*; **¿me regás las plantas?** — *can you water my plants?*

Asking for two of you? Swap *me* for **nos**: **¿nos llevás?** — *can you take us?*$tip$, updated_at = now() where id = '795eda4c-1b7a-5a23-97b2-aac4263f8f38' and body_md = $tip$Still a plain question in the present with **me** in front: **¿me acompañás?** — *will you come with me?*; **¿me llevás?** — *can you give me a ride?*; **¿me regás las plantas?** — *can you water my plants?* Asking for two of you? Swap *me* for **nos**: **¿nos llevás?** — *can you take us?*$tip$;
update public.tips set body_md = $tip$**Un toque** is *a sec, a bit*: **esperame un toque**.

**De paso** is *while you're at it*: **de paso, ¿me comprás pan?**$tip$, updated_at = now() where id = 'cc550005-16ab-5bc9-82ad-d31a38137a15' and body_md = $tip$**Un toque** is *a sec, a bit*: **esperame un toque**. **De paso** is *while you're at it*: **de paso, ¿me comprás pan?**$tip$;
update public.tips set body_md = $tip$A porteño asks with a plain question in the present: **¿me pasás la sal?**, **¿me ayudás?** — the *can you* is in the tone.

**¿Podrías…?** is the extra-polite version.

**¿Me pasás…?** and **¿me alcanzás…?** mean the same: *can you pass me…?*$tip$, updated_at = now() where id = 'c5ccfebf-abb5-5c69-b2fb-f5a49cdb5788' and body_md = $tip$A porteño asks with a plain question in the present: **¿me pasás la sal?**, **¿me ayudás?** — the *can you* is in the tone. **¿Podrías…?** is the extra-polite version. **¿Me pasás…?** and **¿me alcanzás…?** mean the same: *can you pass me…?*$tip$;
update public.tips set body_md = $tip$**Me mudé** — *I moved (house)*; **nos mudamos** — *we moved*. It always carries *me/te/se/nos*: **te mudaste**, **se mudó**.

**Mudarse con** is *to move in with*.

The **mudanza** is the move itself.$tip$, updated_at = now() where id = '72734c3b-aa10-5b4c-819d-56584b23250e' and body_md = $tip$**Me mudé** — *I moved (house)*; **nos mudamos** — *we moved*. It always carries *me/te/se/nos*: **te mudaste**, **se mudó**. **Mudarse con** is *to move in with*. The **mudanza** is the move itself, and always a *quilombo* (a mess).$tip$;
update public.tips set body_md = $tip$**Extraño a mi vieja** — *I miss my mom*. A person takes **a**; a thing doesn't: **extraño el mate**.

Not *echar de menos*: that is Spain's, and here nobody says it.$tip$, updated_at = now() where id = 'c9b7d55e-27f0-5b3b-9f11-ed3849a02af0' and body_md = $tip$**Extraño a mi vieja** — *I miss my mom*. A person takes **a**; a thing doesn't: **extraño el mate**. Not *echar de menos*: that is Spain's, and here nobody says it.$tip$;
update public.tips set body_md = $tip$Between friends a bare vos command is polite enough: **prendé la luz**, **apagá la tele**.

With a pronoun it joins the end, like *ayudame*: **acompañame**, **llevame**.$tip$, updated_at = now() where id = 'db277486-1a0c-5764-957e-645579b22f1a' and body_md = $tip$Between friends a bare vos command is polite enough: **prendé la luz**, **apagá la tele**. With a pronoun it joins the end, like *ayudame*: **acompañame**, **llevame**.$tip$;
update public.tips set body_md = $tip$At any **ventanilla**, open with **una consulta** — *a quick question*. Then ask for the **requisitos**, *what they need*.

They'll say **el original y una copia**, and they mean both.$tip$, updated_at = now() where id = '6b3cc89e-06da-5b09-90a5-fb94272d6eb3' and body_md = $tip$At any **ventanilla**, open with **una consulta** — *a quick question* — and ask for the **requisitos**, *what they need*. They'll say **el original y una copia**, and they mean both.$tip$;
update public.tips set body_md = $tip$A porteño host says **pasen, pasen** at the door, **pónganse cómodos**, and **no se preocupen** when you apologize for being late.

**Están en su casa** — *make yourselves at home*.$tip$, updated_at = now() where id = '01a808b3-a1c9-5477-ae3a-bbb29595b2ee' and body_md = $tip$A porteño host says **pasen, pasen** at the door, **pónganse cómodos**, and **no se preocupen** when you apologize for being late. **Están en su casa** — *make yourselves at home*.$tip$;
update public.tips set body_md = $tip$| one person (vos) | more than one (ustedes) |
| pasá | **pasen** |
| esperá | **esperen** |
| vení | **vengan** |
| traé | **traigan** |
| sentate | **siéntense** |
| no te preocupes | **no se preocupen** |

-ar verbs end in **-en**, the rest in **-an**, built on the *yo* form: *vengo* → **vengan**, *traigo* → **traigan**.

The pronoun is **se**, stuck on the end — and then the accent appears: **siéntense, quédense**. After *no* it goes in front: **no se preocupen**.$tip$, updated_at = now() where id = 'f534bcfd-43c6-5d81-a814-89f5071f8271' and body_md = $tip$| one person (vos) | more than one (ustedes) |
| pasá | **pasen** |
| esperá | **esperen** |
| vení | **vengan** |
| traé | **traigan** |
| sentate | **siéntense** |
| no te preocupes | **no se preocupen** |

-ar verbs end in **-en**, the rest in **-an**, built on the *yo* form: *vengo* → **vengan**, *traigo* → **traigan**. The pronoun is **se**, stuck on the end — and then the accent appears: **siéntense, quédense**. After *no* it goes in front: **no se preocupen**.$tip$;
update public.tips set body_md = $tip$The moment a feeling hit, or a thing slipped your mind, is preterite with its pronoun: **me sentí re mal**, **nos pusimos contentos**, **me olvidé de avisarte**.

A thing you left behind takes no *de*: **me olvidé las llaves**.$tip$, updated_at = now() where id = 'dff327fb-93ad-5ef0-b87d-b0b8f5748f57' and body_md = $tip$The moment a feeling hit, or a thing slipped your mind, is preterite with its pronoun: **me sentí re mal**, **me olvidé de avisarte** (a thing you left behind takes no *de*: **me olvidé las llaves**), **nos pusimos contentos**.$tip$;
update public.tips set body_md = $tip$**¿Me acompañás?** — the favor is for me; **¿nos sacás una foto?** — the favor is for us. You ask with a plain present-tense question: no *can you* needed.

**¿Me podrías…?** — *could you…?* — is the more careful version.$tip$, updated_at = now() where id = '4492bbdb-8376-566f-af0c-068e10d3456b' and body_md = $tip$**¿Me acompañás?** — the favor is for me; **¿nos sacás una foto?** — the favor is for us. You ask with a plain present-tense question: no *can you* needed. **¿Me podrías…?** — *could you…?* — is the more careful version.$tip$;
update public.tips set body_md = $tip$**Recorrer** is *to travel around, to go all over*: **recorrimos la Patagonia**.

The road is the **ruta** — *la ruta 40* runs the length of the country.$tip$, updated_at = now() where id = '1cc4dae8-0517-5072-9c8f-c79966f71cc1' and body_md = $tip$**Recorrer** is *to travel around, to go all over*: **recorrimos la Patagonia**. The road is the **ruta** — *la ruta 40* runs the length of the country.$tip$;
update public.tips set body_md = $tip$On the shop door: **horario de atención** — *opening hours*; **abierto / cerrado**; **solo efectivo** — *cash only*; **no funciona** — *out of order*; **liquidación** — *sale*.

In a building: **no se permiten mascotas**, **se prohíbe hacer ruido**.$tip$, updated_at = now() where id = 'af4c1031-7c9c-5fb0-8d8b-5b57bb841bd4' and body_md = $tip$On the shop door: **horario de atención** — *opening hours*; **abierto / cerrado**; **solo efectivo** — *cash only*; **no funciona** — *out of order*; **liquidación** — *sale*. In a building: **no se permiten mascotas**, **se prohíbe hacer ruido**.$tip$;
update public.tips set body_md = $tip$| one thing | more than one |
| **Se busca** perro. | **Se aceptan** tarjetas. |
| **Se permite** fumar en la terraza. | No **se permiten** mascotas. |
| **Se prohíbe** hacer ruido. | **Se hacen** envíos. |

The verb agrees with the thing: one → *se busca*, several → *se arreglan bicis*.

Most real signs just say **Prohibido fumar**; **se prohíbe** is the formal version.$tip$, updated_at = now() where id = 'e9b64ef7-a37a-5cfb-ae67-7f9141722279' and body_md = $tip$| one thing | more than one |
| **Se busca** perro. | **Se aceptan** tarjetas. |
| **Se permite** fumar en la terraza. | No **se permiten** mascotas. |
| **Se prohíbe** hacer ruido. | **Se hacen** envíos. |

The verb agrees with the thing: one → *se busca*, several → *se arreglan bicis*. Most real signs just say **Prohibido fumar**; **se prohíbe** is the formal version.$tip$;
update public.tips set body_md = $tip$On a sign, **se** + verb says what is sold, rented or needed, with nobody named: **se vende** auto, **se alquila** depto, **se necesita** mozo.

For more than one thing, add **n**: **se venden** bicis.

The same **se** asks about rules: **¿se puede fumar acá?** — *can you smoke here?*$tip$, updated_at = now() where id = 'a13868ae-2900-572c-98a0-bf4c01691f94' and body_md = $tip$On a sign, **se** + verb says what is sold, rented or needed, with nobody named: **se vende** auto, **se alquila** depto, **se necesita** mozo. For more than one thing, add **n**: **se venden** bicis. The same **se** asks about rules: **¿se puede fumar acá?** — *can you smoke here?*$tip$;
update public.tips set body_md = $tip$**Se permite** and **se prohíbe** are sign language. Out loud people say **se puede** / **no se puede**: *acá no se puede estacionar*; *¿se puede pagar con tarjeta?*

To ask a shop: **¿hacen envíos?** — *do you deliver?*$tip$, updated_at = now() where id = '4be9d9ea-b2f7-5b90-8382-a6108a0ffd65' and body_md = $tip$**Se permite** and **se prohíbe** are sign language. Out loud people say **se puede** / **no se puede**: *acá no se puede estacionar*; *¿se puede pagar con tarjeta?* And to ask a shop: **¿hacen envíos?** — *do you deliver?*$tip$;
update public.tips set body_md = $tip$You know **me acuerdo** — *I remember*. The moment something comes back is the past: **¡ah, ahora me acordé!**; **¿te acordaste del pan?** — *did you remember the bread?*

To remind someone, use the command: **acordate de las llaves** — *remember the keys*.$tip$, updated_at = now() where id = 'ce04f326-dc62-5b78-b284-566e6fd63f08' and body_md = $tip$You know **me acuerdo** — *I remember*. The moment something comes back is the past: **¡ah, ahora me acordé!**; **¿te acordaste del pan?** — *did you remember the bread?* To remind someone, use the command: **acordate de las llaves** — *remember the keys*.$tip$;
update public.tips set body_md = $tip$**Antes era distinto** — *it used to be different*. **¡Qué épocas!** — *those were the days!*

With *ser* it is a different kind of thing: **el barrio era distinto**. With *estar* it has changed: **estás distinta** — *you look different*.$tip$, updated_at = now() where id = 'f03770e9-f70b-5bf7-9fc5-3507aa771946' and body_md = $tip$**Antes era distinto** — *it used to be different*. **¡Qué épocas!** — *those were the days!* — closes it. With *ser* it is a different kind of thing: **el barrio era distinto**. With *estar* it has changed: **estás distinta** — *you look different*.$tip$;
update public.tips set body_md = $tip$**-ito** makes things small, and requests smaller: **un ratito** — *a little while*; **un cafecito**; **un poquito**. It sounds kind rather than childish.

It softens bad news and favors too: **tengo un problemita**, **una preguntita**.$tip$, updated_at = now() where id = '492ceddb-7a1b-5bbd-9bdf-da57d4115735' and body_md = $tip$**-ito** makes things small, and requests smaller: **un ratito** — *a little while*; **un cafecito**; **un poquito**. It sounds kind rather than childish. It softens bad news and favors too: **tengo un problemita**, **una preguntita**.$tip$;
update public.tips set body_md = $tip$It works on adverbs too: **cerquita** — *close by*; **despacito** — *nice and slow*.

**Chiquito** — *small, little*.

Careful: **hablá más despacito** can mean *slower* or *quieter* — the situation tells you.$tip$, updated_at = now() where id = '9c22a7d9-d890-5e17-a088-75954c74be37' and body_md = $tip$It works on adverbs too: **cerquita** — *close by*; **despacito** — *nice and slow*. **Chiquito** — *small, little*. Careful: **hablá más despacito** can mean *slower* or *quieter* — the situation tells you.$tip$;
update public.tips set body_md = $tip$**Zona norte** is the suburbs north of the General Paz, like San Isidro and Tigre. It is known for money and **árboles**.

The **zona sur** — Avellaneda, Lanús, Quilmes — is generally cheaper.

Inside the Capital, Recoleta and Belgrano are the leafy north; Caballito, Almagro and Villa Crespo sit in the middle.$tip$, updated_at = now() where id = 'ef2f7720-75af-506a-a7fb-1581bde273b9' and body_md = $tip$**Zona norte** — the suburbs north of the General Paz, like San Isidro and Tigre — has a name for money and **árboles**; **zona sur** — Avellaneda, Lanús, Quilmes — is, in general, cheaper. Inside the Capital, Recoleta and Belgrano are the leafy north; Caballito, Almagro and Villa Crespo sit in the middle.$tip$;
update public.tips set body_md = $tip$**Qué pesado** — *what a pain* — for someone who won't let it go. **Divertido** is *fun*, **tímido** *shy*.

For a woman: **pesada**, **divertida**, **tímida**.

With **estar** it is just for now: *Nico está pesado hoy* — *Nico's being annoying today*.$tip$, updated_at = now() where id = '6f623f96-84dd-5f21-953b-3e2e7b40775a' and body_md = $tip$**Qué pesado** — *what a pain* — for someone who won't let it go. **Divertido** is *fun*, **tímido** *shy*. For a woman: **pesada**, **divertida**, **tímida**. With **estar** it is just for now: *Nico está pesado hoy* — *Nico's being annoying today*.$tip$;
update public.tips set body_md = $tip$**Buena onda** is the porteño compliment for a person: easy, warm, *nice*. **Mala onda** is the opposite.

**Buena onda** and **mala onda** never change: *ella es buena onda*.

**Simpático** is narrower — *friendly*, pleasant to talk to — and does change: **simpática**.$tip$, updated_at = now() where id = 'ebd8e8e5-7f3a-581d-ac16-f841077ffb75' and body_md = $tip$**Buena onda** is the porteño compliment for a person: easy, warm, *nice*. **Mala onda** is the opposite. **Buena onda** and **mala onda** never change: *ella es buena onda*. **Simpático** is narrower — *friendly*, pleasant to talk to — and does change: **simpática**.$tip$;
update public.tips set body_md = $tip$**Capaz**, **a lo mejor** and **quizás** all mean *maybe*. Porteños say **capaz** much more than **quizás**.

Also: **seguro que** is *I bet*; **supongo que** is *I guess*; **probablemente** is *probably*.

All take the plain present: **capaz está en la plaza**, **seguro que es Fede**.$tip$, updated_at = now() where id = '6f3c143b-2af0-5c70-b9e2-7435c2b347d4' and body_md = $tip$**Capaz**, **a lo mejor** and **quizás** all mean *maybe*; **seguro que** is *I bet*; **supongo que** is *I guess*; **probablemente** is *probably*. All take the plain present: **capaz está en la plaza**, **seguro que es Fede**. In Buenos Aires you will hear **capaz** much more than **quizás**.$tip$;
update public.tips set body_md = $tip$To guess, porteños mostly say **debe** + infinitive.

So: **debe estar en el laburo** — *he must be at work*; **debe tener cuarenta**; **deben ser las ocho**; to vos, **debés estar cansado** — *you must be tired*.

The future is more for the question: **¿dónde estará?**, **¿qué hora será?**$tip$, updated_at = now() where id = '7b5302fb-5521-5119-bbb6-dfeb663b58e8' and body_md = $tip$To state a guess, porteños mostly say **debe** + infinitive: **debe estar en el laburo** — *he must be at work*; **debe tener cuarenta**; **deben ser las ocho**; to vos, **debés estar cansado** — *you must be tired*. The future is more for the question: **¿dónde estará?**, **¿qué hora será?**$tip$;
update public.tips set body_md = $tip$For someone else it's **se siente**: **mi abuela no se siente bien**.

Where it hurts is **dolor de**: **tengo dolor de cabeza** — *I've got a headache*. Same as **me duele la cabeza**.$tip$, updated_at = now() where id = '0f049b73-270c-5432-ac80-f9307754ce21' and body_md = $tip$For someone else it's **se siente**: **mi abuela no se siente bien**. Where it hurts is **dolor de** — **tengo dolor de cabeza** — *I've got a headache*, the same as **me duele la cabeza**.$tip$;
update public.tips set body_md = $tip$The doctor's order: **tenés que hacer reposo** — *you need bed rest*. And a **jarabe** for the cough.

A plain **resfrío** — *a cold* — needs no doctor, just a **remedio** from the pharmacy.

Anything serious, straight to the **guardia**.$tip$, updated_at = now() where id = 'c2f0319f-90fd-58b6-9103-689c477c4991' and body_md = $tip$The doctor's favorite order: **tenés que hacer reposo** — *you need bed rest*. And a **jarabe** for the cough. A plain **resfrío** — *a cold* — needs no doctor, just a **remedio** from the pharmacy. Anything serious, straight to the **guardia**.$tip$;
update public.tips set body_md = $tip$A **prepaga** is a private health plan. Many pay one, besides the public hospital and the *obra social*.

Once a year: a **chequeo**, an *análisis de* **sangre**, **la presión** and **la vacuna** for the **gripe**.$tip$, updated_at = now() where id = 'edf96564-1272-5295-ac16-0720fe0808d9' and body_md = $tip$Besides the public hospital and the *obra social*, lots of porteños pay a **prepaga** — a private health plan. Once a year: a **chequeo**, an *análisis de* **sangre**, **la presión** and **la vacuna** for the **gripe**.$tip$;
update public.tips set body_md = $tip$**Convidar** is *to offer, to share what's yours*: **¿te convido un mate?**, **convidame uno**.

To ask for one, the question is kinder than the order: **¿me convidás un mate?** *Convidame* is for close friends.

Afternoon **merienda** means mate with **bizcochitos**, or **tortas fritas** when it rains. A **matero** drinks it all day; kids get **mate cocido**, the tea-bag version.$tip$, updated_at = now() where id = 'a27610da-e63d-5d19-9150-fec8001c9793' and body_md = $tip$**Convidar** is *to offer, to share what's yours*: **¿te convido un mate?**, **convidame uno**. Afternoon **merienda** means mate with **bizcochitos**, or **tortas fritas** when it rains. A **matero** drinks it all day; kids get **mate cocido**, the tea-bag version. To ask for one, the question is kinder than the order: **¿me convidás un mate?** *Convidame* is for close friends.$tip$;
update public.tips set body_md = $tip$This future is for wondering: **¿dónde estará?** — *I wonder where he is*.

Same with **¿qué hora será?**, **¿tendrá cargador?**, **¿habrá café?**, **¿qué hará?**, **¿vendrá?**, **¿qué le pasará?**

For *they*, add **n**: **¿dónde estarán?**, **¿de quién serán?** For plans, porteños say *voy a*.$tip$, updated_at = now() where id = 'e5afe1ea-54cb-5ae0-b179-677927fb6451' and body_md = $tip$This future is for wondering: **¿dónde estará?** — *I wonder where he is*. Same with **¿qué hora será?**, **¿tendrá cargador?**, **¿habrá café?**, **¿qué hará?**, **¿vendrá?**, **¿qué le pasará?** For *they*, add **n**: **¿dónde estarán?**, **¿de quién serán?** For plans, porteños say *voy a*.$tip$;
update public.tips set body_md = $tip$The card for the bus and the subte is **la SUBE**. You **cargás** it at a kiosco.

The same verb charges **el celu**, the phone (short for **celular**).

*Celular* is also the phone number: *pasame tu celular* — *give me your number*.$tip$, updated_at = now() where id = '301acde2-7437-5461-8414-6fb73db5b2cc' and body_md = $tip$The card for the bus and the subte is **la SUBE**: you **cargás** it at a kiosco — the same verb as charging **el celu**, the phone (short for **celular**). *Celular* is also the phone number: *pasame tu celular* — *give me your number*.$tip$;
update public.tips set body_md = $tip$**Me quedé sin batería** — *my battery died*, literally *I was left without battery*.

A call, or the power at home, **se cortó** — *it cut out*.

Without *sin*, **quedarse** is *to stay*: *¿te quedaste en casa?*$tip$, updated_at = now() where id = '4e8246f2-31a4-5303-97f3-80f702ceb6f8' and body_md = $tip$**Me quedé sin batería** — *my battery died*, literally *I was left without battery*. A call, or the power at home, **se cortó** — *it cut out*. Without *sin*, **quedarse** is *to stay*: *¿te quedaste en casa?*$tip$;
update public.tips set body_md = $tip$The other end: **no lo aguanto** — *I can't stand him*; **es insoportable**; **es re falso**.

The good end: **nos hicimos amigos** — *we became friends*.

And **hay química** — *there's chemistry* — is mostly said about a couple.$tip$, updated_at = now() where id = 'd8cbc098-8879-5b9f-bf4d-675b87f2a096' and body_md = $tip$The other end: **no lo aguanto** — *I can't stand him*; **es insoportable**; **es re falso**. And the good end: **nos hicimos amigos** — *we became friends*. And **hay química** — *there's chemistry* — is mostly said about a couple.$tip$;
update public.tips set body_md = $tip$With **re** you turn it up: *es re generosa*. With **medio** you turn it down: *es medio vago*, *he's a bit lazy*.

**Medio** never changes: *medio tonta*, *medio serios*.

The verb matters: **es callado** — *he is a quiet guy* — is what he is like. But **está callado** — *he is quiet today* — is how he is right now. Same with **es serio** and **estás serio**.$tip$, updated_at = now() where id = '411110dd-943a-5910-bf5f-9a7c66ad7eef' and body_md = $tip$Porteños grade a person with two little words: **re** turns it up — *es re generosa* — and **medio** turns it down — *es medio vago*, *he's a bit lazy*. **Medio** never changes: *medio tonta*, *medio serios*. And the verb matters: **es callado** — *he is a quiet guy* — is what he is like; **está callado** — *he is quiet today* — is how he is right now. Same with **es serio** and **estás serio**.$tip$;
update public.tips set body_md = $tip$For *each other*: **nos** (*we*), **se** (*they*).

We: **nos conocemos del laburo** — *we know each other from work*; **nos escribimos** — *we write to each other*.

They: **se separaron** — *they split up*; **siempre se pelean** — *they're always fighting*.$tip$, updated_at = now() where id = '59b9932a-0c66-512c-8ceb-29bf2dcbb476' and body_md = $tip$The *each other* verbs take **nos** for *we* and **se** for *they*: **nos conocemos del laburo** — *we know each other from work*; **nos escribimos** — *we write to each other*; **se separaron** — *they split up*; **siempre se pelean** — *they're always fighting*.$tip$;
update public.tips set body_md = $tip$The fast road, with tolls, is **la autopista**. The ordinary road between towns is **la ruta**.

First you **cargás nafta** — *nafta*, never *gasolina* — and on the way you pay the **peaje**. **La General Paz** is the ring road between the Capital and the conurbano.

Porteños *agarran* a road rather than *take* it: **agarrá la ruta**, **¿qué ruta agarramos?**$tip$, updated_at = now() where id = '97e6c524-59bf-5483-b652-95a1e627cae7' and body_md = $tip$Leaving Buenos Aires you take **la autopista** (the fast road, with tolls), then **la ruta** (the ordinary road between towns). First you **cargás nafta** — *nafta*, never *gasolina* — and on the way you pay the **peaje**. **La General Paz** is the ring road between the Capital and the conurbano. Porteños *agarran* a road rather than *take* it: **agarrá la ruta**, **¿qué ruta agarramos?**$tip$;
update public.tips set body_md = $tip$*Manejar* in the past is regular: **manejé**, **¿manejaste vos?**

**Chocar** swaps *c* for *qu* before *é*: **choqué**.

Run a red light and it's **una multa**.$tip$, updated_at = now() where id = 'e29e946c-4a6c-5287-bd02-bb2c355378aa' and body_md = $tip$*Manejar* in the past is regular: **manejé**, **¿manejaste vos?**. **Chocar** swaps *c* for *qu* before *é*: **choqué**. Run a red light and it's **una multa**.$tip$;
update public.tips set body_md = $tip$Buenos Aires is a grid of streets cut by wide **avenidas** — Corrientes, Santa Fe, 9 de Julio.

On an avenida almost every corner has a **semáforo**. Cross when it's green: **cruzá**.$tip$, updated_at = now() where id = '3d16b064-de20-5954-abfd-66692234787d' and body_md = $tip$Buenos Aires is a grid of streets cut by wide **avenidas** — Corrientes, Santa Fe, 9 de Julio. On an avenida almost every corner has a **semáforo**. Cross when it's green: **cruzá**.$tip$;
update public.tips set body_md = $tip$A porteño **maneja** (drives) an *auto*. *Conducir* is only for forms and signs.

Downtown, the **tránsito** is often **imposible**, and so is finding a place to *estacionar* (park).$tip$, updated_at = now() where id = 'bdb46568-61df-5ccc-b7d5-ca48b6e9195b' and body_md = $tip$A porteño **maneja** (drives) an *auto*. *Conducir* is only for forms and signs. Downtown, the **tránsito** is often **imposible**, and so is finding a place to *estacionar* (park).$tip$;
update public.tips set body_md = $tip$Among friends it's **me afanaron** — *they stole it* (slang).

It is also for when you were overcharged: *me afanaron con el taxi* — *the taxi overcharged me*.

The **motochorro** steals from a motorbike. The confession: **me descuidé** — *I wasn't careful*.$tip$, updated_at = now() where id = '9f1b4f75-62bb-5fd3-bfb4-117dc43f4612' and body_md = $tip$Among friends it's **me afanaron** — *they stole it* (slang). It is also what you say when you were overcharged: *me afanaron con el taxi* — *the taxi overcharged me*. The **motochorro** steals from a motorbike. The confession that comes with it: **me descuidé** — *I wasn't careful*.$tip$;
update public.tips set body_md = $tip$**Me cae bien** is *I like him* — as a person, not romantically.

It works like *gustar*: **me cae bien Juan**, **me caen bien tus amigos**.

The first impression: **me cayó mal**.$tip$, updated_at = now() where id = 'f82e6975-3c38-5496-851c-8c594e5884fa' and body_md = $tip$**Me cae bien** is *I like him* — as a person, not romantically. It works like *gustar*: **me cae bien Juan**, **me caen bien tus amigos**. The first impression: **me cayó mal**.$tip$;
update public.tips set body_md = $tip$You send **el currículum**. They ask about your **experiencia** and tell you about the **puesto** — *the position*.

**Pagan bien** — *they pay well*.$tip$, updated_at = now() where id = '3cc9772d-ff26-53c8-bc0e-75e10b409d89' and body_md = $tip$You send **el currículum**; they ask about your **experiencia** and tell you about the **puesto** — *the position*. **Pagan bien** — *they pay well* — is what everyone wants to hear.$tip$;
update public.tips set body_md = $tip$Twice a year, in June and December, the **aguinaldo** arrives — half a month's extra pay. Every job *en blanco* pays it by law.

A **licencia** is *paid leave* for a reason (sick, a new baby, exams).

Your yearly holiday is **vacaciones**.$tip$, updated_at = now() where id = '47214591-3206-5367-b7d5-e48af1764d9e' and body_md = $tip$Twice a year, in June and December, the **aguinaldo** arrives — half a month's extra pay. Every job *en blanco* pays it by law. A **licencia** is *paid leave* for a reason (sick, a new baby, exams). Your yearly holiday is **vacaciones**.$tip$;
update public.tips set body_md = $tip$The rest of the story is third person. So: **consiguió laburo** — *she got a job*; **renunció** — *he quit*.

Nobody says *fue despedido*. It's **lo echaron** — *they fired him*. And **me contrataron** — *they hired me*.$tip$, updated_at = now() where id = '7b3f9683-3acc-59a1-ae9e-57f15db24ae0' and body_md = $tip$The rest of the story is in the third person: **consiguió laburo** — *she got a job*; **renunció** — *he quit*. Nobody says *fue despedido*: it's **lo echaron** — *they fired him* — and **me contrataron** — *they hired me*.$tip$;
update public.tips set body_md = $tip$**Me estafaron** — *I got scammed*. Nobody grabs anything, they trick you.

It can be a fake call from the bank, a **billete trucho**, or the **cuento del tío**: a caller pretends to be a relative or an official and asks for money.

First: **bloqueá la tarjeta**. Then the denuncia. With luck, the street **cámaras** recorded it.$tip$, updated_at = now() where id = '68bbdfb3-c560-5eab-a9a4-e53a956ef37d' and body_md = $tip$**Me estafaron** — *I got scammed* : nobody grabs anything, they trick you. A fake call from the bank, a **billete trucho**, or the **cuento del tío**: a caller pretends to be a relative or an official and asks for money. First thing: **bloqueá la tarjeta**. Then the denuncia; if you're lucky, the street **cámaras** recorded it.$tip$;
update public.tips set body_md = $tip$**Me robaron el celu** — *my phone got stolen*, literally *they stole the phone from me*.

The thief is a **chorro** in lunfardo, a **ladrón** in the news. On the subte it is usually a **punga** — *a pickpocket*.

**Me asaltaron** is worse: they robbed you face to face.$tip$, updated_at = now() where id = '3aedcd83-cbf5-5910-98dc-1008087f4635' and body_md = $tip$**Me robaron el celu** — *my phone got stolen*, literally *they stole the phone from me*. The thief is a **chorro** in lunfardo, a **ladrón** in the news. On the subte it is usually a **punga** — *a pickpocket* — and you notice later. **Me asaltaron** is worse: they robbed you face to face.$tip$;
update public.tips set body_md = $tip$To report it you **hacés la denuncia** at the **comisaría**, or online.

The **policía** rarely finds the phone; the denuncia is for the insurance.

To block the line, call your phone company. In an emergency, call **911**.$tip$, updated_at = now() where id = '65cb8068-013d-5a1a-b19f-d0c054438a29' and body_md = $tip$To report it you **hacés la denuncia** at the **comisaría**, or online. The **policía** rarely finds the phone; the denuncia is for the insurance. To block the line, call your phone company. In an emergency, call **911**.$tip$;
update public.tips set body_md = $tip$**Me siento mal** — *I feel sick*; **¿cómo te sentís?** — *how do you feel?*

The vowel changes with *yo*, not with *vos*: **me siento**, but **te sentís**. *Dormir* does the same: **duermo**, but **dormís**; **dormí** is the past, *I slept*.

On its own, **lo siento** is *I'm sorry*.$tip$, updated_at = now() where id = '1a8b45ec-c528-5164-9c7c-bb147aad29d0' and body_md = $tip$**Me siento mal** — *I feel sick*; **¿cómo te sentís?** — *how do you feel?* The vowel changes with *yo*, not with *vos*: **me siento**, but **te sentís**. *Dormir* does the same: **duermo**, but **dormís**; **dormí** is the past, *I slept*. On its own, **lo siento** is *I'm sorry*.$tip$;
update public.tips set body_md = $tip$Your health insurance is your **obra social**.

The doctor writes a **receta** and you take the **pastillas** **cada ocho horas**.$tip$, updated_at = now() where id = 'f8060d63-4a7a-541b-8eba-bf97588eae8b' and body_md = $tip$Your health insurance is your **obra social**; the doctor writes a **receta** and you take the **pastillas** **cada ocho horas**.$tip$;
update public.tips set body_md = $tip$**Macanudo** is the old-school *great guy*; you will hear it from older people. Under fifty it is **copado** or **piola**.

A woman who is great at what she does: **es una genia**. And **trabajador** is *hard-working*.

**Agrandado** is *full of himself*, **egoísta** *selfish*. The word *egoísta* is the same for him and for her, like *inteligente*.$tip$, updated_at = now() where id = '3cf567c2-f4d8-5988-b290-df55a3a1ea54' and body_md = $tip$**Macanudo** is the old-school *great guy* — you will hear it from older people; under fifty it is **copado** or **piola**, and **es una genia** for a woman who is great at what she does; **trabajador** is *hard-working*. **Agrandado** is *full of himself*, **egoísta** *selfish* — and *egoísta* is the same for him and for her, like *inteligente*.$tip$;
update public.tips set body_md = $tip$A group takes **son** and a plural ending: **son re trabajadores**, **son medio distraídos**. Add **-s**, or **-es** after a consonant.

A mixed group takes the masculine form.$tip$, updated_at = now() where id = '501983de-04c6-5c67-bc94-ddd15cb1a88c' and body_md = $tip$Describe a group with **son** and a plural ending (**-s**, or **-es** after a consonant): **son re trabajadores**, **son medio distraídos**. A mixed group takes the masculine form.$tip$;
update public.tips set body_md = $tip$The whole *gustar* pattern: **le cae bien a mi vieja**, **nos cae re bien**, **¿te caen bien mis amigos?**

The person being liked is the subject: *mis amigos **te caen** bien*.$tip$, updated_at = now() where id = 'f7382eb9-c652-55bb-b9be-c8a982617b85' and body_md = $tip$The whole *gustar* pattern: **le cae bien a mi vieja**, **nos cae re bien**, **¿te caen bien mis amigos?** The person being liked is the subject: *mis amigos **te caen** bien*.$tip$;
update public.tips set body_md = $tip$**No tengo señal** — *no signal*; **me quedé sin datos** — *I ran out of data*.

**¿Tenés wifi?** is the first question at any bar.$tip$, updated_at = now() where id = '524511f8-c321-5aef-8f9b-ac4dc642abad' and body_md = $tip$**No tengo señal** — *no signal*; **me quedé sin datos** — *I ran out of data*. **¿Tenés wifi?** is the first question at any bar.$tip$;
update public.tips set body_md = $tip$Tech orders are plain vos commands: **descargá la app**, **borrá las fotos**.

What you already did is preterite: **la descargué**, **las borré**.

Day to day people say **bajá** or **bajate** for *download*: **bajate la app, es gratis**. *Descargar* is what the screen says.$tip$, updated_at = now() where id = '6d7c070b-81b7-58f0-b526-20ee5f75be8d' and body_md = $tip$Tech orders are plain vos commands: **descargá la app**, **borrá las fotos**. What you already did is preterite: **la descargué**, **las borré**. Day to day people say **bajá** or **bajate** for *download*: **bajate la app, es gratis**. *Descargar* is what the screen says.$tip$;
update public.tips set body_md = $tip$When anything stops working, porteños say it **no anda**: *no anda el wifi*, *no me anda el celu*.

A machine that fails on its own takes **se**: **se apagó** — *it switched off*; **se colgó** — *it froze*.

The fix: **apagalo y prendelo**.$tip$, updated_at = now() where id = 'ecc14597-b02a-597b-bcbf-15a4de418dbf' and body_md = $tip$When anything stops working, porteños say it **no anda**: *no anda el wifi*, *no me anda el celu*. A machine that fails on its own takes **se**: **se apagó** — *it switched off*; **se colgó** — *it froze*. The universal fix: **apagalo y prendelo**.$tip$;
update public.tips set body_md = $tip$**¿Qué le pasará?** wonders; **a lo mejor tiene gripe** guesses; **seguro que está cansado** bets.

The future can guess on its own too: **Sofi estará en el subte** — *Sofi's probably on the subway*.$tip$, updated_at = now() where id = 'dc575731-6236-5ebb-ad27-018912b6ec65' and body_md = $tip$**¿Qué le pasará?** wonders; **a lo mejor tiene gripe** guesses; **seguro que está cansado** bets. The future can guess on its own too: **Sofi estará en el subte** — *Sofi's probably on the subway*.$tip$;
update public.tips set body_md = $tip$One person **ceba**: pours the water from the **termo** and passes the mate around the **ronda**.

You drink it all, through the **bombilla**, and hand it back to the **cebador**, the person who pours.$tip$, updated_at = now() where id = '04747eea-0365-5b79-8ecf-9b0b35b85709' and body_md = $tip$One person **ceba** — pours the water from the **termo** — and passes the mate around the **ronda**. You drink it all, through the **bombilla**, and hand it back to the **cebador**, the person who pours.$tip$;
update public.tips set body_md = $tip$**Estoy saliendo con alguien** — *I'm seeing someone*. When it ends, porteños **cortan**: **cortamos** — *we broke up*.

With a name they say **con Santi cortamos** — *Santi and I broke up*. The same for a fight: **con Sofi nos peleamos**.

**Nos peleamos** is *we fight* and also *we had a fight*.$tip$, updated_at = now() where id = 'dbb9fb4d-69cd-5b88-9d73-7d35bd390442' and body_md = $tip$**Estoy saliendo con alguien** — *I'm seeing someone*. When it ends, porteños **cortan**: **cortamos** — *we broke up*. With a name they say **con Santi cortamos** — *Santi and I broke up* — and the same for a fight: **con Sofi nos peleamos**. **Nos peleamos** is *we fight* and also *we had a fight*.$tip$;
update public.tips set body_md = $tip$**Alguien** is *someone*, **nadie** is *nobody*.

Spanish keeps the *no* as well: **no vino nadie**. If *nadie* comes first, drop the *no*: **nadie me dijo nada**.$tip$, updated_at = now() where id = 'e73a1f00-3237-5fcb-a397-8dbe426556e7' and body_md = $tip$**Alguien** is *someone*, **nadie** is *nobody* — and Spanish keeps the *no* as well: **no vino nadie**. If *nadie* comes first, drop the *no*: **nadie me dijo nada**.$tip$;
update public.tips set body_md = $tip$| Mi prima **se casó** el sábado. | got married |
| **Nos casamos** en marzo. | we got married |
| El bebé **nació** ayer. | was born |
| ¿Dónde **naciste**? | were you born |

**Casarse** takes its pronoun; **nacer** doesn't. **Nos casamos** is also the present: *nos casamos en julio* — *we're getting married in July*.

The wedding is a **casamiento**; the legal one is **por civil**, or just **el civil**. Before it, **se comprometieron** — *they got engaged*; after it, the **luna de miel**.

**Está embarazada** is *she's pregnant*.$tip$, updated_at = now() where id = '28e641b6-4f66-5483-81c2-859687fb0e7f' and body_md = $tip$| Mi prima **se casó** el sábado. | got married |
| **Nos casamos** en marzo. | we got married |
| El bebé **nació** ayer. | was born |
| ¿Dónde **naciste**? | were you born |

**Casarse** takes its pronoun; **nacer** doesn't. **Nos casamos** is also the present: *nos casamos en julio* — *we're getting married in July*. The wedding is a **casamiento**; the legal one is **por civil**, or just **el civil**. Before it, **se comprometieron** — *they got engaged*; after it, the **luna de miel**. **Está embarazada** is *she's pregnant*.$tip$;
update public.tips set body_md = $tip$Life's big steps take the pronoun, like **se casó**. So: **me recibí** — *I graduated*; mi hermano **se recibió** de abogado; mi tía **se jubiló** — *retired*.

Ask **¿de qué te recibiste?** — *what did you graduate in?*

**Se murió** — *died* — is for friends; to the family you say **falleció** — *passed away*.$tip$, updated_at = now() where id = '164a4c51-f39c-5285-b76f-97464dab857a' and body_md = $tip$Life's big steps take the pronoun, like **se casó**: **me recibí** — *I graduated*; mi hermano **se recibió** de abogado; mi tía **se jubiló** — *retired*. Ask **¿de qué te recibiste?** — *what did you graduate in?* **Se murió** — *died* — is for talking among friends; to the family you say **falleció** — *passed away*.$tip$;
update public.tips set body_md = $tip$Going steady is **estar de novios**. The one before is **mi ex**, and a porteño couple calls each other **amor**.

When it ends badly: **me dejó** — *she left me* — or **me mintió** — *he lied to me*.$tip$, updated_at = now() where id = '5da4918a-949d-5581-912f-9ba1ea88bde3' and body_md = $tip$Going steady is **estar de novios**. The one before is **mi ex**, and a porteño couple calls each other **amor**. When it ends badly: **me dejó** — *she left me* — or **me mintió** — *he lied to me*.$tip$;
update public.tips set body_md = $tip$Porteño thanks praise the person: **sos un genio**, **me salvaste** — *you saved me*. To a woman it is always **sos una genia**.

For a present: **¡qué detalle!** — *how thoughtful!* — or **¡te pasaste!** — *this is too much, you did an amazing job!*

Said in an angry voice, the same words mean *you went too far*.$tip$, updated_at = now() where id = '88b903ef-e0f8-5900-86f6-a2d183e36dce' and body_md = $tip$Porteño thanks praise the person: **sos un genio**, **me salvaste** — *you saved me*. To a woman it is always **sos una genia**. For a present: **¡qué detalle!** — *how thoughtful!* — or **¡te pasaste!** — *this is too much, you did an amazing job!* Said in an angry voice, the same words mean *you went too far*.$tip$;
update public.tips set body_md = $tip$The answers: *de nada*, **ni hablar** — *don't mention it* — or **lo hice de onda** — *I did it to be nice*.

**Te agradezco** is warmer and a touch more formal: **te agradezco de verdad**.$tip$, updated_at = now() where id = 'c38f50d3-9623-5a55-a0db-04a1f20fe7a0' and body_md = $tip$The answers: *de nada*, **ni hablar** — *don't mention it* — or **lo hice de onda** — *I did it to be nice*. **Te agradezco** is warmer and a touch more formal: **te agradezco de verdad**.$tip$;
update public.tips set body_md = $tip$For the person who pours: **calentá el agua** in the pava — *heat the water* — but **no la hiervas**. Water that **hierve** burns the yerba.

**Yo cebo**, you drink.

When there's no taste left, **el mate está lavado** — *washed out* — and it's time to change the yerba.$tip$, updated_at = now() where id = '088111ce-f197-57ed-a80c-180b1990da3e' and body_md = $tip$The rules for the person who pours: **calentá el agua** in the pava — *heat the water* — but **no la hiervas**: water that **hierve** burns the yerba. **Yo cebo**, you drink. When there's no taste left, **el mate está lavado** — *washed out* — and it's time to change the yerba.$tip$;
update public.tips set body_md = $tip$The thanks gets bigger, the grammar doesn't change.

**Gracias por todo** — *thanks for everything*; **mil gracias** — *thanks a million*; **gracias otra vez** — *thanks again*.

You already know **un montón**: *gracias un montón*.$tip$, updated_at = now() where id = '85eeb729-9ee3-5ef6-a492-6eadc3ca5fdf' and body_md = $tip$**Gracias por todo** — *thanks for everything*; **mil gracias** — *thanks a million*; **gracias otra vez** — *thanks again*. The thanks gets bigger, the grammar doesn't change. You already know **un montón**: *gracias un montón*.$tip$;
update public.tips set body_md = $tip$**Te debo una** — *I owe you one*. The answer is **de nada**.

**No pasa nada** — *it's fine, no worries* — is the answer to *perdón*.$tip$, updated_at = now() where id = 'e8975dc4-db27-5349-91a4-dd07310d9224' and body_md = $tip$**Te debo una** — *I owe you one*. The answer is **de nada**. **No pasa nada** — *it's fine, no worries* — is the answer to *perdón*.$tip$;
update public.tips set body_md = $tip$On a vos command both pronouns join the end, person first.

The stress gets a written accent: **devolvémelo** — *give it back to me*; **pasámelo** — *send it to me*; **decímelo** — *tell me*.

To him or her, *le* turns into *se* again: **mandáselo**.$tip$, updated_at = now() where id = '018deba2-5088-5d2f-8ff8-700afc326cde' and body_md = $tip$On a vos command both pronouns join the end, person first, and the stress gets a written accent: **devolvémelo** — *give it back to me*; **pasámelo** — *send it to me*; **decímelo** — *tell me*. To him or her, *le* turns into *se* again: **mandáselo**.$tip$;
update public.tips set body_md = $tip$| Te devuelvo **el libro**. | Te **lo** devuelvo. |
| ¿Me dejás **las llaves**? | ¿Me **las** dejás? |
| Le regalé **un libro**. | **Se lo** regalé. |

The person goes first, the thing second. **Lo, la, los, las** match the thing: *el libro* → **lo**, *las llaves* → **las**.

*Le* or *les* before them becomes **se**. Add **a Sofi** to say who: **se la regalé a Sofi**.$tip$, updated_at = now() where id = 'e310bbae-1d4a-5b28-99c7-88edb5d61f8a' and body_md = $tip$| Te devuelvo **el libro**. | Te **lo** devuelvo. |
| ¿Me dejás **las llaves**? | ¿Me **las** dejás? |
| Le regalé **un libro**. | **Se lo** regalé. |

The person goes first, the thing second. **Lo, la, los, las** match the thing: *el libro* → **lo**, *las llaves* → **las**. *Le* or *les* before them becomes **se**; add **a Sofi** to say who: **se la regalé a Sofi**.$tip$;
update public.tips set body_md = $tip$**Te lo paso** is *I'll send it to you* — a number, a photo, a file.

A loan comes back **sin falta** — *for sure* (word for word, *without fail*).$tip$, updated_at = now() where id = 'eac9e910-201e-59a3-84b2-284e5bde2587' and body_md = $tip$**Te lo paso** is *I'll send it to you* — a number, a photo, a file. And a loan comes back **sin falta** — *for sure* (word for word, *without fail*).$tip$;
update public.tips set body_md = $tip$Your driver's license is the **registro**: *¿tenés registro?*

Your own or rented parking space is a **cochera**. A public paid parking lot is an *estacionamiento*.$tip$, updated_at = now() where id = '9cabde8c-14a1-59c5-afcc-463bd29cbf7f' and body_md = $tip$Your driver's license is the **registro** — *¿tenés registro?*. Your own or rented parking space is a **cochera**; a public paid parking lot is an *estacionamiento*.$tip$;
update public.tips set body_md = $tip$**Cuando quieras** — *whenever you like* — leaves an invitation open.

A question with **¿cuándo?** keeps the normal verb: **¿cuándo nos vemos?** A plan with **cuando** doesn't: **cuando nos veamos, te cuento**.$tip$, updated_at = now() where id = 'b8dca299-9d43-5311-998f-70c610f3b72b' and body_md = $tip$**Cuando quieras** — *whenever you like* — leaves an invitation open. A question with **¿cuándo?** keeps the normal verb: **¿cuándo nos vemos?** A plan with **cuando** doesn't: **cuando nos veamos, te cuento**.$tip$;
update public.tips set body_md = $tip$**Hasta que** — *until* — works like *cuando*. Ahead: **hasta que te mudes**. But **hasta que conseguí laburo** is past, so the normal verb.

**Para que** — *so that* — and **antes de que** — *before* — always take the subjunctive: **para que sepas**, **vení antes de que empiece**.

And **que yo sepa** — *as far as I know*.$tip$, updated_at = now() where id = 'cc1eb54f-1d60-5e64-a9c3-fc54886b6765' and body_md = $tip$**Hasta que** — *until* — works like *cuando*: **hasta que te mudes** looks ahead, but **hasta que conseguí laburo** is past, so the normal verb. **Para que** — *so that* — and **antes de que** — *before* — always take the subjunctive: **para que sepas**, **vení antes de que empiece**. And **que yo sepa** — *as far as I know*.$tip$;
update public.tips set body_md = $tip$A goodbye is several. First **bueno, nos hablamos**, **cuidate**, **un beso**, **que descanses**, then another *chau* at the door.

**Un abrazo** — or just **abrazo** — is the usual sign-off, especially between men: **dale, abrazo**; **chau, un abrazo**.$tip$, updated_at = now() where id = 'c5e7d696-e96e-5262-abd7-c802b8a68a8d' and body_md = $tip$A porteño goodbye is several: **bueno, nos hablamos**, **cuidate**, **un beso**, **que descanses** — and then another *chau* at the door. **Un abrazo** — or just **abrazo** — is the usual sign-off, especially between men: **dale, abrazo**; **chau, un abrazo**.$tip$;
update public.tips set body_md = $tip$Money talk goes lunfardo fast: **¿quién garpa?** — *who's paying?*; **¡es un afano!** — *it's a rip-off!*; **berreta** — *cheap, shoddy*.

Food is **el morfi**.$tip$, updated_at = now() where id = '26ece732-f29e-57ba-91a8-f096c21de744' and body_md = $tip$Money talk goes lunfardo fast: **¿quién garpa?** — *who's paying?*; **¡es un afano!** — *it's a rip-off!*; **berreta** — *cheap, shoddy*. And food is **el morfi**.$tip$;
update public.tips set body_md = $tip$People get lunfardo labels. A **chanta** talks big and doesn't deliver. A **cheto** is snobby or upper-class. Someone **piola** is cool and easy-going.

**No me chamuyes** — *don't give me that* — is the subjunctive again.$tip$, updated_at = now() where id = '71152a01-bffa-5a60-a8d2-60677b67413e' and body_md = $tip$People get lunfardo labels: a **chanta** talks big and doesn't deliver, a **cheto** is snobby or upper-class, and someone **piola** is cool and easy-going. **No me chamuyes** — *don't give me that* — is the subjunctive again.$tip$;
update public.tips set body_md = $tip$**¡Qué embole!** — *how boring!* — for a rainy Sunday with nothing to do.

Like all of these: friends, not job interviews.$tip$, updated_at = now() where id = '931d857d-9b5d-5a8a-bb8f-5d48b43e1047' and body_md = $tip$**¡Qué embole!** — *how boring!* — for a rainy Sunday with nothing to do. Like all of these: friends, not job interviews.$tip$;
update public.tips set body_md = $tip$Lunfardo is Buenos Aires slang, born in the port and the tango. Like **morfar** (to eat), **guita** (money), **fiaca** (laziness), **pilcha** (clothes).

Friends, not job interviews. **Guita** and **fiaca** are fine in relaxed talk; **morfar** is rougher: with new people, say *comer*.$tip$, updated_at = now() where id = '3fe61f9b-3382-5a80-b860-0a7c427f3415' and body_md = $tip$Lunfardo is Buenos Aires slang, born in the port and the tango: **morfar** (to eat), **guita** (money), **fiaca** (laziness), **pilcha** (clothes). Friends, not job interviews. **Guita** and **fiaca** are fine in any relaxed talk; **morfar** is rougher: with people you just met, say *comer*.$tip$;
update public.tips set body_md = $tip$**Te banco** — *I'm here for you*; **no lo banco** — *I can't stand him*. One verb, opposite meanings.

It also means *to wait for*: **¿me bancás acá?** — *can you wait for me here?*

For things you often hear **bancarse**: *no me banco el frío* — *I can't stand the cold*.$tip$, updated_at = now() where id = 'e1ff50e4-f00e-575c-a7a6-7c50b9665559' and body_md = $tip$**Te banco** — *I'm here for you*; **no lo banco** — *I can't stand him*. One verb, opposite meanings. It also means *to wait for*: **¿me bancás acá?** — *can you wait for me here?* For things you often hear **bancarse**: *no me banco el frío* — *I can't stand the cold*.$tip$;
update public.tips set body_md = $tip$Any *qué* + reaction + *que* brings the subjunctive.

**¡Qué suerte que vivas cerca!**, **¡qué bueno que estemos todos juntos!** **Estemos** is *we*: **-mos** on the end.

About something already over, porteños just use the past: **¡qué suerte que no llovió!**$tip$, updated_at = now() where id = '74fa9b53-73dc-5c65-939e-c1ab90984cc7' and body_md = $tip$**¡Qué suerte que vivas cerca!**, **¡qué bueno que estemos todos juntos!** Any *qué* + reaction + *que* brings the subjunctive. **Estemos** is *we*: **-mos** on the end. About something already over, porteños just use the past: **¡qué suerte que no llovió!**$tip$;
update public.tips set body_md = $tip$**Ayudar → ayudes**, **esperar → esperes**, **mandar → mandes**, **avisar → avises**.

*Poner* and *traer* keep the *g* of their *yo*: **pongo → pongas**, **traigo → traiga**.

The same form, with **no** in front, tells someone not to: *esperame* — **no me esperes**; *llamame* — **no me llames**. The pronoun jumps to the front.$tip$, updated_at = now() where id = '28a65e19-7a4f-501c-bed5-b872f18ca04c' and body_md = $tip$**Ayudar → ayudes**, **esperar → esperes**, **mandar → mandes**, **avisar → avises**. *Poner* and *traer* keep the *g* of their *yo*: **pongo → pongas**, **traigo → traiga**. The same form, with **no** in front, tells someone not to: *esperame* — **no me esperes**; *llamame* — **no me llames**. The pronoun jumps to the front.$tip$;
update public.tips set body_md = $tip$| | vos | yo, él, ella |
| ayudar | **ayudes** | **ayude** |
| esperar | **esperes** | **espere** |
| poner | **pongas** | **ponga** |
| traer | **traigas** | **traiga** |
| llevar | **lleves** | **lleve** |
| dar | **des** | **dé** |

**Necesito que**, **te pido que**, **prefiero que** and the offer **¿querés que…?** all take the subjunctive: *necesito que me ayudes*, *¿querés que te lleve?*

For *we*: **¿qué querés que hagamos?**$tip$, updated_at = now() where id = '97dca14e-cd84-59a4-a265-0f49870f1689' and body_md = $tip$| | vos | yo, él, ella |
| ayudar | **ayudes** | **ayude** |
| esperar | **esperes** | **espere** |
| poner | **pongas** | **ponga** |
| traer | **traigas** | **traiga** |
| llevar | **lleves** | **lleve** |
| dar | **des** | **dé** |
**Necesito que**, **te pido que**, **prefiero que** and the offer **¿querés que…?** all take the subjunctive: *necesito que me ayudes*, *te pido que me esperes*, *¿querés que te lleve?* For *we*: **¿qué querés que hagamos?**$tip$;
update public.tips set body_md = $tip$The offer is the same pattern turned around: **¿querés que te lleve?** — *do you want me to give you a ride?*

Before an *asado*, the guest asks **¿querés que traiga algo?**

The *yo* form matches *él*: **lleve**, **traiga**, **ponga**.$tip$, updated_at = now() where id = 'c877808b-888c-5895-a77e-cfe7de1b954b' and body_md = $tip$The offer is the same pattern turned around: **¿querés que te lleve?** — *do you want me to give you a ride?*; **¿querés que traiga algo?** — the guest's question before every *asado*. The *yo* form matches *él*: **lleve**, **traiga**, **ponga**.$tip$;
update public.tips set body_md = $tip$Day to day an opinion starts with **para mí**: *para mí, está cerrado* — *if you ask me, it's closed*.

**Para mí que** + a normal verb is a guess: *para mí que hoy llueve*.

And **no me parece que** takes the subjunctive, like *no creo que*: *no me parece que haya mucha gente*.$tip$, updated_at = now() where id = '3720e015-a831-5b88-af8b-2c4948855038' and body_md = $tip$Day to day an opinion starts with **para mí**: *para mí, está cerrado* — *if you ask me, it's closed*. **Para mí que** + a normal verb is a guess: *para mí que hoy llueve*. And **no me parece que** takes the subjunctive, like *no creo que*: *no me parece que haya mucha gente*.$tip$;
update public.tips set body_md = $tip$| No **dejes** el celu en la mesa. | Don't leave your phone on the table. |
| No **saques** la billetera. | Don't take your wallet out. |
| No le **cuentes** a nadie. | Don't tell anyone. |
| No **te vayas**. | Don't go. |
| No **te pongas** nervioso. | Don't get nervous. |
| No **seas** así. | Don't be like that. |

Every *don't* grows from the *yo* of the present: *dejo* → **dejes**, *cuento* → **cuentes**, *saco* → **saques** (the *c* turns *qu* to keep its sound).

*Ser* and *ir* break the rule: **seas**, like *sea*, and **vayas** (*no te vayas*).$tip$, updated_at = now() where id = '709de3f5-ef01-50d6-a9dd-5484e900d103' and body_md = $tip$| No **dejes** el celu en la mesa. | Don't leave your phone on the table. |
| No **saques** la billetera. | Don't take your wallet out. |
| No le **cuentes** a nadie. | Don't tell anyone. |
| No **te vayas**. | Don't go. |
| No **te pongas** nervioso. | Don't get nervous. |
| No **seas** así. | Don't be like that. |
Every *don't* grows from the *yo* of the present: *dejo* → **dejes**, *cuento* → **cuentes**, *saco* → **saques** (the *c* turns *qu* to keep its sound). *Ser* and *ir* break the rule: **seas**, like *sea*, and **vayas** (*no te vayas*).$tip$;
update public.tips set body_md = $tip$With *-se* verbs the pronoun goes in front: *me voy* → **no te vayas**.

Also *me puse nervioso* → **no te pongas nervioso**, *me enojé* → **no te enojes**.

Friends also say **no seas así**.$tip$, updated_at = now() where id = '7fd63f41-d782-569a-9458-af9206b8cc0e' and body_md = $tip$With *-se* verbs the pronoun goes in front: *me voy* → **no te vayas**, *me puse nervioso* → **no te pongas nervioso**, *me enojé* → **no te enojes**. And the one every friend says: **no seas así**.$tip$;
update public.tips set body_md = $tip$| do | don't |
| Vení. | No **vengas**. |
| Andá. | No **vayas**. |
| Decime. | No **me digas**. |
| Tocá. | No **toques**. |
| Olvidate. | No **te olvides**. |

*No* + the subjunctive; the pronoun moves in front: *preocupate* → **no te preocupes**.

In *tocar* → **toques** the *c* turns into *qu* to keep its sound.

**¡No me digas!** on its own shows surprise: *no way!*$tip$, updated_at = now() where id = '6f8ab658-e6d0-5d0b-b29e-924e5fed047b' and body_md = $tip$| do | don't |
| Vení. | No **vengas**. |
| Andá. | No **vayas**. |
| Decime. | No **me digas**. |
| Tocá. | No **toques**. |
| Olvidate. | No **te olvides**. |

*No* + the subjunctive (*tocar* → **toques**: the *c* turns into *qu* to keep its sound), and the pronoun moves in front: *preocupate* → **no te preocupes**. **¡No me digas!** on its own shows surprise: *no way!*$tip$;
update public.tips set body_md = $tip$**No te hagas problema** — *don't worry about it* — answers an apology.

**No te olvides** — *don't forget*. Before a verb add *de* (*no te olvides de llamar*). With a thing, *de* is often dropped (*no te olvides la SUBE*).$tip$, updated_at = now() where id = '8fe89548-6879-50eb-a1b5-202ca80d4885' and body_md = $tip$**No te hagas problema** — *don't worry about it* — is what a porteño says when you apologize. **No te olvides** — *don't forget*: *de* + a verb (*no te olvides de llamar*); with a thing, *de* is often dropped (*no te olvides la SUBE*).$tip$;
update public.tips set body_md = $tip$Wishes and the future share the form. So: **que te diviertas**, **ojalá que ganemos**, **cuando vuelvas**, **hasta que sepa algo**.

So does an open choice: **lo que quieras** — *whatever you want*.$tip$, updated_at = now() where id = 'a2b395ff-2333-5d36-83a5-22f200388a41' and body_md = $tip$Wishes and the future share the form: **que te diviertas**, **ojalá que ganemos**, **cuando vuelvas**, **hasta que sepa algo**. An open choice takes it too: **lo que quieras** — *whatever you want*.$tip$;
update public.tips set body_md = $tip$**No hace falta que** + subjunctive is *you do not need to*: **no hace falta que vengas hoy**.

With a thing, **hace falta** is *we need*: **hace falta pan**.$tip$, updated_at = now() where id = 'cc5c7a5d-f22b-58e3-aa1a-28ffaa4438d9' and body_md = $tip$**No hace falta que** + subjunctive is *you do not need to*: **no hace falta que vengas hoy**. With a thing, **hace falta** is *we need*: **hace falta pan**.$tip$;
update public.tips set body_md = $tip$| | él, ella | ellos |
| ser | sea | **sean** |
| estar | esté | **estén** |
| tener | tenga | **tengan** |
| poder | pueda | **puedan** |
| llegar | llegue | **lleguen** |

For *they*, add **-n**. The same form is *you* for a group: *que tengan buen finde, chicos*.

**Puede ser que** and **es posible que** take the subjunctive like *no creo que*: *puede ser que estén cerrados*.$tip$, updated_at = now() where id = '156c9226-d3ae-5d26-800e-823389b8a664' and body_md = $tip$| | él, ella | ellos |
| ser | sea | **sean** |
| estar | esté | **estén** |
| tener | tenga | **tengan** |
| poder | pueda | **puedan** |
| llegar | llegue | **lleguen** |
For *they*, add **-n**. **Puede ser que** and **es posible que** take the subjunctive like *no creo que*: *puede ser que estén cerrados*. The same form is *you* for a group: *que tengan buen finde, chicos*.$tip$;
update public.tips set body_md = $tip$**Puede ser** — *could be* — is a common *maybe*, like **capaz**.

Add *que* and the subjunctive follows: **puede ser que llueva**, **puede ser que estén cerrados**.

**Es posible que** says the same, a little more carefully.$tip$, updated_at = now() where id = '3f9a94db-3f58-5df2-a5ce-ffab9f03c71e' and body_md = $tip$**Puede ser** — *could be* — is a common *maybe*, like **capaz**. Add *que* and the subjunctive follows: **puede ser que llueva**, **puede ser que estén cerrados**. **Es posible que** says the same, a little more carefully.$tip$;
update public.tips set body_md = $tip$When you are sure, use the normal verb: **seguro que abren**, **creo que viene**.

When you doubt, the subjunctive: **no creo que abran hoy**. Even with the forecast: **el pronóstico es de lluvia, pero no creo que llueva**.$tip$, updated_at = now() where id = 'ec947d91-a8f3-55dd-9486-0b6d2e5c67cb' and body_md = $tip$Sure of it? The normal verb: **seguro que abren**, **creo que viene**. Doubt it, and the subjunctive: **no creo que abran hoy**. Even the forecast gets the treatment: **el pronóstico es de lluvia, pero no creo que llueva**.$tip$;
update public.tips set body_md = $tip$**Novedades** is news about people and plans: **¿hay novedades de Juan?**, **todavía no hay novedades**.

**Noticias** works too, and is also the news on TV; **una noticia** is one piece of news.

Good news gets **¡buenísimo!**; bad news **¡qué mal!**$tip$, updated_at = now() where id = '295c40a8-2ee4-5735-8f87-9204d04bc6a2' and body_md = $tip$**Novedades** is news about people and plans: **¿hay novedades de Juan?**, **todavía no hay novedades**. **Noticias** works too, and is also the news on TV; **una noticia** is one piece of news. Good news gets **¡buenísimo!**; bad news **¡qué mal!**$tip$;
update public.tips set body_md = $tip$| ¡Qué bueno que **estés** acá! | So good you're here! |
| Qué lástima que no **vengas**. | Shame you're not coming. |
| Me molesta que **llegue** tarde. | It bothers me that he's late. |

A reaction to something now or later + **que** → the subjunctive. For something that already happened, the normal past: **¡qué bueno que viniste!**

**Me alegro** on its own: *I'm glad*. With more: **me alegro que** or **me alegro de que** — both are used.$tip$, updated_at = now() where id = '9fa1891b-f569-595e-a9a2-2388d6feb5fd' and body_md = $tip$| ¡Qué bueno que **estés** acá! | So good you're here! |
| Qué lástima que no **vengas**. | Shame you're not coming. |
| Me molesta que **llegue** tarde. | It bothers me that he's late. |

A reaction to something now or later + **que** → the subjunctive. For something that already happened, the normal past: **¡qué bueno que viniste!** **Me alegro** on its own: *I'm glad*. With more: **me alegro que** or **me alegro de que** — both are used.$tip$;
update public.tips set body_md = $tip$**No sabía** — *I didn't know* — is the imperfect: a state. **Me di cuenta** — *I realized* — is the moment you finally understood.

Gossip often opens with **¿Sabías que…?**$tip$, updated_at = now() where id = '6275c34f-71c5-56f0-8a46-1c252791699f' and body_md = $tip$**No sabía** — *I didn't know* — is the imperfect: a state. **Me di cuenta** — *I realized* — is the moment you finally understood. **¿Sabías que…?** opens half the gossip in Buenos Aires.$tip$;
update public.tips set body_md = $tip$The subjunctive follows *quiero que*, *necesito que*, *no hace falta que* and *para que* (so that).

So: **quiero que me expliques** — *I want you to explain it to me*; **no hace falta que entiendas todo** — *you don't need to understand everything*.

And: **mirá el video para que entiendas** — *watch the video so you understand*.$tip$, updated_at = now() where id = 'd16cd641-7bfb-5a9b-9f9c-cea7a142d038' and body_md = $tip$After *quiero que*, *necesito que*, *no hace falta que* and *para que* (so that), the verb takes the subjunctive: **quiero que me expliques** — *I want you to explain it to me*; **no hace falta que entiendas todo** — *you don't need to understand everything*; **mirá el video para que entiendas** — *watch the video so you understand*.$tip$;
update public.tips set body_md = $tip$Before an interview or an exam porteños say **¡éxitos!** or **¡mucha suerte!**

Before a **parcial**, a university exam, they say both.$tip$, updated_at = now() where id = '7d1e7009-9fe1-5c8d-a766-f7661c904b77' and body_md = $tip$Before an interview or an exam porteños say **¡éxitos!** or **¡mucha suerte!** — and before a **parcial**, the university exam everyone dreads, both.$tip$;
update public.tips set body_md = $tip$| Que te mejores. | Get well soon. |
| Que te diviertas. | Have fun. |
| Que lo disfrutes. | Enjoy it. |
| Que cumplas muchos más. | I hope you have many more birthdays. |
| Ojalá que te guste. | I hope you like it. |
| Ojalá que ganemos. | I hope we win. |

The pronoun comes along into the wish: *te mejores*, *te diviertas*. For *we*, **-emos** on *-ar* verbs: *ganar* → **ganemos**.

**Espero que** — *I hope* — works like *ojalá*: *espero que te guste*.$tip$, updated_at = now() where id = '9c1177f1-7ef1-5bf5-8b98-e1a7299d3b21' and body_md = $tip$| Que te mejores. | Get well soon. |
| Que te diviertas. | Have fun. |
| Que lo disfrutes. | Enjoy it. |
| Que cumplas muchos más. | I hope you have many more birthdays. |
| Ojalá que te guste. | I hope you like it. |
| Ojalá que ganemos. | I hope we win. |

The pronoun comes along into the wish: *te mejores*, *te diviertas*. For *we*, **-emos** on *-ar* verbs: *ganar* → **ganemos**. **Espero que** — *I hope* — works like *ojalá*: *espero que te guste*.$tip$;
update public.tips set body_md = $tip$A wish is *que* + the subjunctive: **que te vaya bien** — *good luck, hope it goes well*. Also a friendly goodbye.

The answer to any wish is **gracias, igualmente** — *thanks, you too*.

Afterwards you ask **¿cómo te fue?** — *how did it go?*$tip$, updated_at = now() where id = '5477ef64-8dc9-564c-912e-6162a954a14d' and body_md = $tip$A wish is *que* + the subjunctive: **que te vaya bien** — *good luck, hope it goes well* — is also a friendly goodbye. The answer to any wish is **gracias, igualmente** — *thanks, you too*. Afterwards you ask **¿cómo te fue?** — *how did it go?*$tip$;
update public.tips set body_md = $tip$| Que te vaya bien. | Good luck. |
| Que la pases lindo. | Have a great time. |
| Que tengas buen finde. | Have a good weekend. |
| Ojalá que no llueva. | I hope it doesn't rain. |
| Ojalá salga todo bien. | I hope it all works out. |

A wish is **que** or **ojalá** + the subjunctive. After **ojalá**, *que* is optional: *ojalá que llueva* = *ojalá llueva*.

*Tener → tengas, salir → salga*: the *g* of *tengo, salgo* comes along.$tip$, updated_at = now() where id = 'c0f803fa-9e89-5bb7-a735-344a4b869d1d' and body_md = $tip$| Que te vaya bien. | Good luck. |
| Que la pases lindo. | Have a great time. |
| Que tengas buen finde. | Have a good weekend. |
| Ojalá que no llueva. | I hope it doesn't rain. |
| Ojalá salga todo bien. | I hope it all works out. |

A wish is **que** or **ojalá** + the subjunctive. After **ojalá**, *que* is optional: *ojalá que llueva* = *ojalá llueva*. *Tener → tengas, salir → salga*: the *g* of *tengo, salgo* comes along.$tip$;
update public.tips set body_md = $tip$**Venga**, **vaya**, **haga** are both *I* and *he/she*: *quiere que venga* — *he wants me/him to come*.

Context, or an added **yo** or **él**, tells you who: *quiere que vaya yo*.

On its own, **que** + this form is *let him* or *tell him to*: *dale, que venga*.$tip$, updated_at = now() where id = '2d43e784-4fe7-5b7a-b775-ad9457aa18f4' and body_md = $tip$**Venga**, **vaya**, **haga** are both *I* and *he/she*: *quiere que venga* — *he wants me/him to come*. Context, or an added **yo** or **él**, tells you who: *quiere que vaya yo*. On its own, **que** + this form is *let him* or *tell him to*: *dale, que venga*.$tip$;
update public.tips set body_md = $tip$When you want *someone else* to do something, the second verb changes.

So: **quiero que vengas** — *I want you to come*. This is the **subjunctive**.

**No hace falta que** — *there's no need to* — takes it too: *no hace falta que traigas nada*.$tip$, updated_at = now() where id = '35a38f0f-399c-5fdb-8d3e-6e516a149e18' and body_md = $tip$When you want *someone else* to do something, the second verb changes: **quiero que vengas** — *I want you to come*. This form is the **subjunctive**. **No hace falta que** — *there's no need to* — takes it too: *no hace falta que traigas nada*.$tip$;
update public.tips set body_md = $tip$You announce the exit long before the door: **bueno, me voy yendo** — *well, I'd better get going*.

On the way out, send love to whoever isn't there: **saludos a tu vieja**, **mandale saludos a Juan**.

*Tu vieja* / *tu viejo* is only for friends your age; to anyone else, *saludos a tu mamá*.$tip$, updated_at = now() where id = '17486898-58dd-5c51-8771-a3b2dfd4f7a3' and body_md = $tip$The porteño exit starts long before the door: **bueno, me voy yendo** — *well, I'd better get going* — and then twenty minutes of talk. On the way out, love for whoever isn't there: **saludos a tu vieja**, **mandale saludos a Juan**. *Tu vieja* / *tu viejo* is only for friends your age; to anyone else, *saludos a tu mamá*.$tip$;
update public.tips set body_md = $tip$Goodbye wishes are all *que* + the subjunctive: **que duermas bien**, **que sigas bien**, **que llegues bien**.

On the phone it ends with **besos** and **escribime**.$tip$, updated_at = now() where id = '99d583b4-2e71-54bb-8a89-b0ade3db0930' and body_md = $tip$A goodbye is a string of wishes, all *que* + the subjunctive: **que duermas bien**, **que sigas bien**, **que llegues bien**. On the phone it ends with **besos** and **escribime**.$tip$;
update public.tips set body_md = $tip$**¡Cuidado!** — *careful!* — or the full **tené cuidado**: **tené cuidado con la billetera en el subte**.

The tips that come with it: **no uses el celu en la calle**, **no tomes taxi para todo**, **es mejor que pagues en efectivo**, **te conviene reservar**.$tip$, updated_at = now() where id = 'c25e8bf6-8957-58ac-8fc3-5770ed6b1bef' and body_md = $tip$**¡Cuidado!** — *careful!* — or the full **tené cuidado**: **tené cuidado con la billetera en el subte**. The tips that come with it: **no uses el celu en la calle**, **no tomes taxi para todo**, **es mejor que pagues en efectivo**, **te conviene reservar**.$tip$;
update public.tips set body_md = $tip$| Te aconsejo que **lleves** efectivo. | My advice: bring cash. |
| Conviene que **tomes** el subte. | Best to take the subway. |
| Es mejor que **reserves**. | Better book ahead. |
| Es importante que **uses** la SUBE. | It's important to use your SUBE card. |
| Es mejor que **salgamos** temprano. | We'd better leave early. |

Advice with **que** takes the subjunctive. *-ar* verbs take **e** (*llevar* → **lleves**), the rest **a** (*salgo* → **salgamos**).

In everyday speech the short way wins — no *que*, just the infinitive: *te conviene reservar hoy*, *te recomiendo ir en subte*.$tip$, updated_at = now() where id = 'ccbc17ab-2f02-5887-84a7-3b706a5db8ec' and body_md = $tip$| Te aconsejo que **lleves** efectivo. | My advice: bring cash. |
| Conviene que **tomes** el subte. | Best to take the subway. |
| Es mejor que **reserves**. | Better book ahead. |
| Es importante que **uses** la SUBE. | It's important to use your SUBE card. |
| Es mejor que **salgamos** temprano. | We'd better leave early. |

Advice with **que** takes the subjunctive. In everyday speech the short way wins — no *que*, just the infinitive: *te conviene reservar hoy*, *te conviene tomar el subte*, *te recomiendo ir en subte*. *-ar* verbs take **e** (*llevar* → **lleves**), the rest **a** (*salgo* → **salgamos**).$tip$;
update public.tips set body_md = $tip$**Te debo diez mil pesos** — *I owe you*; **me debés la mitad** — *you owe me half*.

Friends split the bill **a medias**.

A **deuda** is what you owe; if you are short, say **te pago a fin de mes** — when you get paid.$tip$, updated_at = now() where id = '236b1e04-683a-52e4-a177-8cd11208527d' and body_md = $tip$**Te debo diez mil pesos** — *I owe you*; **me debés la mitad** — *you owe me half*. Friends split the bill **a medias**. A **deuda** is what you owe; if you are short, say **te pago a fin de mes** — when you get paid.$tip$;
update public.tips set body_md = $tip$The question at every register. **Crédito** usually means **cuotas**, and the good ones are **sin interés**.

A **caja de ahorro** (*savings account* by name) is really the everyday bank account: your pay arrives there and your debit card uses it.$tip$, updated_at = now() where id = '719de067-63a0-5d5b-9ad3-c29affadaa38' and body_md = $tip$The question at every register. **Crédito** usually means **cuotas**, and the good ones are **sin interés**. A **caja de ahorro** (*savings account* by name) is really the everyday bank account: your pay arrives there and your debit card uses it.$tip$;
update public.tips set body_md = $tip$*No me alcanza* for you is **¿te alcanza?** — *do you have enough?*

**Cobré** — *I got paid*; **¿gastás mucho?**, **¿ahorrás algo?** — vos adds **-ás**.

For everyone at work: **cobramos el lunes** — *we get paid on Monday*.$tip$, updated_at = now() where id = '9a9f029d-8897-58a1-862d-3762db0207f1' and body_md = $tip$*No me alcanza* for you is **¿te alcanza?** — *do you have enough?*. **Cobré** — *I got paid*; **¿gastás mucho?**, **¿ahorrás algo?** — vos adds **-ás**. For everyone at work: **cobramos el lunes** — *we get paid on Monday*.$tip$;
update public.tips set body_md = $tip$**Ya no** is *not anymore*: **ya no vivo ahí**. Porteños say it even more with **no … más**: *no vivo más ahí*.

The opposite is **sigue** — *still*: *sigue roto*, *sigue lloviendo*.

**Cada vez más** — *more and more*: *cada vez más caro*; **cada vez menos** — *less and less*.$tip$, updated_at = now() where id = '29090f79-278c-5890-bf3e-c89cc7947b4a' and body_md = $tip$**Ya no** is *not anymore*: **ya no vivo ahí**. Porteños say it even more with **no … más**: *no vivo más ahí*. The opposite is **sigue** — *still*: *sigue roto*, *sigue lloviendo*. **Cada vez más** — *more and more*: *cada vez más caro*; **cada vez menos** — *less and less*.$tip$;
update public.tips set body_md = $tip$**Crecer** is *to grow* — a city, a kid, a tree: **el barrio creció**, **crecí en Rosario** — *I grew up in Rosario*.

Porteños also say **me crié**: *me crié en Flores* — *I grew up in Flores*.$tip$, updated_at = now() where id = '3b867a4a-8a39-52fc-bdb4-73a4c0c46453' and body_md = $tip$**Crecer** is *to grow* — a city, a kid, a tree: **el barrio creció**, **crecí en Rosario** — *I grew up in Rosario*. Porteños also say **me crié**: *me crié en Flores* — *I grew up in Flores*. $tip$;
update public.tips set body_md = $tip$To say what changed, set **antes** + the *-aba / -ía* past against **ahora** + the present.

So: *antes era tranquilo, ahora hay mucho ruido*; *antes costaba poco, ahora es carísimo*.$tip$, updated_at = now() where id = '529fca7e-837e-5aad-a84f-b68359a3844b' and body_md = $tip$To say how things changed, set **antes** + the *-aba / -ía* past against **ahora** + the present: *antes era tranquilo, ahora hay mucho ruido*; *antes costaba poco, ahora es carísimo*.$tip$;
update public.tips set body_md = $tip$The old neighbor is **don José** or **doña Rosa** — first name, with respect.

A **persona mayor**, a **jubilado**, still gets **vos**, plus a **cómo no** (*of course*).

Say **permiso** when you need to get past; *con permiso* exists, but porteños mostly say just **permiso**. You also **pedís permiso** before going in: *entró sin pedir permiso*.$tip$, updated_at = now() where id = '0da84ce9-08d5-56d5-bf04-81b8a54b1746' and body_md = $tip$The old neighbor is **don José** or **doña Rosa** — first name, with respect. A **persona mayor**, a **jubilado**, still gets **vos**, plus a **cómo no** (*of course*) and a **permiso** when you need to get past — *con permiso* exists, but porteños mostly say just **permiso**, and you **pedís permiso** before going in: *entró sin pedir permiso*.$tip$;
update public.tips set body_md = $tip$**Parece que** — *it seems*, *apparently* — passes on news you are not sure of: **parece que va a llover**.

*Dicen que* does the same for what people say: *dicen que va a llover todo el finde*.

If it turns out to be false, **es mentira**.$tip$, updated_at = now() where id = '60f3cec7-feb6-5d7d-87b3-4b4cee709cc5' and body_md = $tip$**Parece que** — *it seems*, *apparently* — passes on news you are not sure of: **parece que va a llover**. *Dicen que* does the same for what people say: *dicen que va a llover todo el finde*. If it turns out to be false, **es mentira**.$tip$;
update public.tips set body_md = $tip$**No me alcanza** — *I don't have enough* (usually money). Word for word: *it doesn't reach for me*.

**Ahorrar** is to save, **gastar** to spend: **gasté todo el sueldo**.$tip$, updated_at = now() where id = 'b876ba73-9188-5bb8-ab20-2ee24117ccb9' and body_md = $tip$**No me alcanza** — *I don't have enough* (usually money). Word for word: *it doesn't reach for me*. **Ahorrar** is to save, **gastar** to spend: **gasté todo el sueldo**.$tip$;
update public.tips set body_md = $tip$Change, person by person: **cambiaste un montón**, **cambiaron los precios**, **el barrio mejoró**, **el servicio empeoró**.

**Estás cambiado** — *you look different* — agrees like an adjective: *estás cambiada*.$tip$, updated_at = now() where id = '6db7132b-f813-53fa-a327-4f6104bca4c9' and body_md = $tip$Change, person by person: **cambiaste un montón**, **cambiaron los precios**, **el barrio mejoró**, **el servicio empeoró**. **Estás cambiado** — *you look different* — agrees like an adjective: *estás cambiada*.$tip$;
update public.tips set body_md = $tip$News starts with **¿escuchaste…?** or **¿te enteraste?** — *did you hear?*: *¿escuchaste lo de Pablo?*

The answer is **me enteré** — *I found out*: *me enteré ayer*.

A useful piece of news is **un dato**: *gracias por el dato*.$tip$, updated_at = now() where id = '375791dd-270a-541e-90ed-5b241e5fb3d0' and body_md = $tip$News starts with **¿escuchaste…?** or **¿te enteraste?** — *did you hear?*: *¿escuchaste lo de Pablo?* The answer is **me enteré** — *I found out*: *me enteré ayer*. A useful piece of news is **un dato**: *gracias por el dato*.$tip$;
update public.tips set body_md = $tip$Use **me contaron que…** or **me comentaron que…** when several people told you, or you won't say who. So: *me contaron que te mudaste*. For one person: **Mati me comentó que renunció**.

News also travels by *audio*, a WhatsApp voice message.$tip$, updated_at = now() where id = '51b423d8-0511-58d0-8b45-1470af269ac1' and body_md = $tip$When several people told you, or you'd rather not say who, use **me contaron que…** or **me comentaron que…**: *me contaron que te mudaste*. For one person: **Mati me comentó que renunció**. Porteño news travels by word of mouth and by *audio*, a WhatsApp voice message.$tip$;
update public.tips set body_md = $tip$Before you pass it on, ask **¿es cierto?** — *is it true?* **Cierto** changes with the noun: *la noticia es cierta*.

If the answer is **es mentira** — *it's not true* — stop there.

**Lo leyó en las redes** — *she read it on social media* — is not a source.$tip$, updated_at = now() where id = 'f448808c-e949-5196-9800-8ef7088251d6' and body_md = $tip$Before you pass it on, ask **¿es cierto?** — *is it true?* **Cierto** changes with the noun: *la noticia es cierta*. If the answer is **es mentira** — *it's not true* — stop there. **Lo leyó en las redes** — *she read it on social media* — is not a source.$tip$;
update public.tips set body_md = $tip$**Te juro** — *I swear* — is how a porteño vouches for the story: **te juro que me dijo eso**.

A long talk with a friend is **una charla**: **charlé con Sofi**.$tip$, updated_at = now() where id = '8470eb4b-a03c-53fb-8cb4-2718b4e1b17c' and body_md = $tip$**Te juro** — *I swear* — is how a porteño vouches for the story: **te juro que me dijo eso**. A long talk with a friend is **una charla**: **charlé con Sofi**.$tip$;
update public.tips set body_md = $tip$Now the vos side: **¿qué le preguntaste?**, **¿qué le contestaste?** — the same *-aste* as *llamaste*.

And for him or her: **me explicó que…**, **me juró que…**, **me gritó**.$tip$, updated_at = now() where id = 'ac8034cf-361d-549f-8562-a1bbd6af1043' and body_md = $tip$Now the vos side: **¿qué le preguntaste?**, **¿qué le contestaste?** — the same *-aste* as *llamaste*. And for him or her: **me explicó que…**, **me juró que…**, **me gritó**.$tip$;
update public.tips set body_md = $tip$**Me gustaría** — *I'd like* — is *gustar* in the conditional, with the same *me*. Examples: **me gustaría ir**, **¿te gustaría venir?**

**Me encantaría** is the enthusiastic yes. For more than one thing, **-ían**: **nos encantarían unas empanadas**.

To order or offer, porteños say **quería** or **¿querés?**: *¿querés tomar unos mates?*$tip$, updated_at = now() where id = '7fef5512-863f-5d20-a29e-02e373792bb2' and body_md = $tip$**Me gustaría** — *I'd like* — is *gustar* in the conditional, with the same *me*: **me gustaría ir**, **¿te gustaría venir?**. **Me encantaría** is the enthusiastic yes. For more than one thing, **-ían**: **nos encantarían unas empanadas**. To order or offer something day to day, porteños say **quería** or **¿querés?**: *¿querés tomar unos mates?*$tip$;
update public.tips set body_md = $tip$| what she said | what you tell |
| «¿Venís?» | Me preguntó **si venía**. |
| «Sí.» | Le contesté **que sí**. |

The question comes back with **si** — *she asked me if I was coming*; the answer with **que** — *I told her yes*.

What was going on slides into the imperfect: *venís* → **venía**. If it is still true now, the present can stay: *le pregunté si viene*.$tip$, updated_at = now() where id = '52d12bb1-c5ac-5616-9d9f-9d1183ece01e' and body_md = $tip$| what she said | what you tell |
| «¿Venís?» | Me preguntó **si venía**. |
| «Sí.» | Le contesté **que sí**. |
The question comes back with **si** — *she asked me if I was coming*; the answer with **que** — *I told her yes*. What was going on slides into the imperfect: *venís* → **venía**. If it is still true now, the present can stay: *le pregunté si viene*.$tip$;
update public.tips set body_md = $tip$**Llegar a fin de mes** is *to make it to payday*: **no llego a fin de mes**.

When the money runs short: **no me alcanza** — *it's not enough*.

You cut the **gastos**, compare **marcas** at the **chino** (the corner supermarket), and notice when they **remarcaron** everything overnight.$tip$, updated_at = now() where id = 'b1cb665e-4cc4-5bbe-8c24-c91aed8f3fbd' and body_md = $tip$**Llegar a fin de mes** — *to make it to payday* — is the monthly sport: **no llego a fin de mes**. When the money runs short: **no me alcanza** — *it's not enough*. You cut the **gastos**, compare **marcas** at the **chino** (the corner supermarket), and notice when they **remarcaron** everything overnight.$tip$;
update public.tips set body_md = $tip$Bills come in plural, and so do the verbs: **aumentaron la luz y el gas**, **aumentan las tarifas**.

The plural can also be a nameless *they*: **me aumentaron el alquiler** — *they raised my rent*.

Prices that **bajaron**? Nobody remembers. Porteños keep count: *el **boleto** aumentó tres veces este año*.$tip$, updated_at = now() where id = 'da398a9c-7a73-5939-919b-d39bf8d6858f' and body_md = $tip$Bills come in plural, and so do the verbs: **aumentaron la luz y el gas**, **aumentan las tarifas**. The plural can also be a nameless *they*: **me aumentaron el alquiler** — *they raised my rent*. Prices that **bajaron**? Nobody remembers. Porteños keep count: *el **boleto** aumentó tres veces este año*.$tip$;
update public.tips set body_md = $tip$A porteño sentence is full of fillers. First: **ponele** — *let's say*; **digamos** — *sort of*; **qué sé yo** — *I don't know*.

Also **bah** — *well, I mean*: *son las ocho, bah, ponele* — or a shrug, *oh well*.

Most common: **o sea** — *I mean*; **tipo** — *like, around*: *es tipo a las nueve*; and **viste** at the end, for *you know*: *estaba cansado, viste*.$tip$, updated_at = now() where id = '6adce778-5bd3-5ead-8fc5-69d118ef84f7' and body_md = $tip$A porteño sentence breathes through its fillers: **ponele** — *let's say*; **digamos** — *sort of*; **qué sé yo** — *I don't know*; **bah** — *well, I mean*: *son las ocho, bah, ponele* — or a shrug, *oh well*. The ones you will hear most: **o sea** — *I mean*; **tipo** — *like, around*: *es tipo a las nueve*; and **viste** at the end, for *you know*: *estaba cansado, viste*.$tip$;
update public.tips set body_md = $tip$**Por las dudas** — *just in case*; **de última** — *if all else fails*; **si querés** — *if you like*.$tip$, updated_at = now() where id = 'c2f1eb75-56ed-521b-8cf9-2a6ca57325cc' and body_md = $tip$**Por las dudas** — *just in case*; **de última** — *if all else fails*; **si querés** — *if you like*. Say them and you sound like you're from here.$tip$;
update public.tips set body_md = $tip$**¡Más vale!** — *of course!*; **sí o sí** — *no matter what*; **ni loco** — *no way*. A woman says **ni loca**: *¿volver con mi ex? Ni loca.*

Before a verb **más vale** is *you'd better*: **más vale llevar paraguas**, **más vale que llegues temprano** (subjunctive after *que*).

When there's too much going on: **estoy a full** — *I'm really busy*.$tip$, updated_at = now() where id = 'c6b40c9b-6758-5732-b6d5-1a559be96347' and body_md = $tip$**¡Más vale!** — *of course!*; **sí o sí** — *no matter what*; **ni loco** — *no way* — and a woman says **ni loca**: *¿volver con mi ex? Ni loca.* Before a verb **más vale** is *you'd better*: **más vale llevar paraguas**, **más vale que llegues temprano** (subjunctive after *que*). And when there's too much going on: **estoy a full** — *I'm really busy*.$tip$;
update public.tips set body_md = $tip$**Me debés la mitad**, **pagamos a medias**, **¿te alcanza?**

And news between friends: **me contaron que…**, **¿es cierto?**$tip$, updated_at = now() where id = '9346219b-01db-5b68-9ade-830d9f45c8b8' and body_md = $tip$**Me debés la mitad**, **pagamos a medias**, **¿te alcanza?**. And news between friends: **me contaron que…**, **¿es cierto?**$tip$;
update public.tips set body_md = $tip$People: **es medio vago**, **son re trabajadores**. Places: **quedan en zona norte**, **¿te queda cerca?**

**Quedar** is also how clothes fit: **te queda bien**, **te queda chico**.

**Te queda de paso** — *it's on your way*.$tip$, updated_at = now() where id = '8c3c3de9-43f2-5d5d-9b9f-e3f6f455056f' and body_md = $tip$People: **es medio vago**, **son re trabajadores**. Places: **quedan en zona norte**, **¿te queda cerca?** **Quedar** is also how clothes fit: **te queda bien**, **te queda chico**. **Te queda de paso** — *it's on your way*.$tip$;
update public.tips set body_md = $tip$**Si ganara**, **si viviera**, **si tuviéramos**: the *if* half takes *-ra*, the other half *-ía*.

Politely, the *-ía* alone is enough: **¿te molestaría esperar?**$tip$, updated_at = now() where id = 'cc6f4c93-242d-540c-aaa7-7c4d554e7648' and body_md = $tip$**Si ganara**, **si viviera**, **si tuviéramos**: the *if* half takes *-ra*, the other half *-ía*. Politely, the *-ía* alone is enough: **¿te molestaría esperar?**$tip$;
update public.tips set body_md = $tip$The conditional softens a request. So *¿me das una mano?* becomes **¿me darías una mano?**, and *¿me ayudás?* becomes **¿me ayudarías?**

**¿Te molestaría…?** — *would you mind…?* — works like *me gustaría*.

With friends the plain *¿me ayudás?* is already polite; the **-ía** form is for bigger favors or people you don't know.$tip$, updated_at = now() where id = '3119b315-f5ed-5147-b49a-92275496d2ce' and body_md = $tip$The conditional takes the edge off a request: *¿me das una mano?* becomes **¿me darías una mano?**, *¿me ayudás?* becomes **¿me ayudarías?**. **¿Te molestaría…?** — *would you mind…?* — works like *me gustaría*. With friends the plain *¿me ayudás?* is already polite; the **-ía** form is for bigger favors or people you don't know.$tip$;
update public.tips set body_md = $tip$**Podríamos ir al cine** — *we could go to the movies*. **Nos convendría salir temprano** — *we'd better leave early*.

Turning it down: **preferiría ir otro día**.

Saying yes: between friends it is **dale** or **obvio** — **obvio, te ayudo**. **Con gusto** is the formal one, what you hear in a shop.$tip$, updated_at = now() where id = 'a1ed21d8-6f6f-54a3-8bb5-3a6585fe6f0e' and body_md = $tip$**Podríamos ir al cine** — *we could go to the movies*. **Nos convendría salir temprano** — *we'd better leave early*. Turning it down: **preferiría ir otro día**. Saying yes: between friends it is **dale** or **obvio** — **obvio, te ayudo**. **Con gusto** is the formal one, what you hear in a shop.$tip$;
update public.tips set body_md = $tip$Dreaming together: **si tuviéramos plata, iríamos a Bariloche**. The *we* form carries an accent, **tuviéramos**.

Asking a friend: **si pudieras, ¿dónde vivirías?** — *si pudieras* is the vos form.

**Ganar** is *to win* and also *to earn*: *si ganara más* — *if I earned more*.$tip$, updated_at = now() where id = '8ea5b476-7546-5c9b-95a8-649e4b351088' and body_md = $tip$Dreaming together: **si tuviéramos plata, iríamos a Bariloche** — the *we* form carries an accent, **tuviéramos**. Asking a friend: **si pudieras, ¿dónde vivirías?** — *si pudieras* is the vos form. **Ganar** is *to win* and also *to earn*: *si ganara más* — *if I earned more*.$tip$;
update public.tips set body_md = $tip$The **-ra** form (*tuviera*, *pudiera*) comes after *si* (if) and after *ojalá* (I wish). At this level, almost nowhere else.

Mind the difference: **ojalá llueva** — *I hope it rains* (it can happen); **ojalá pudiera ir** — *I wish I could go* (it is not real).$tip$, updated_at = now() where id = '04f23526-26bf-5316-8fb2-a5c912c8462f' and body_md = $tip$You meet the **-ra** form (*tuviera*, *pudiera*) after *si* (if) and after *ojalá* (I wish), and almost nowhere else at this level. Mind the difference: **ojalá llueva** — *I hope it rains* (it can happen); **ojalá pudiera ir** — *I wish I could go* (it is not real).$tip$;
update public.tips set body_md = $tip$Offer help with **te doy una mano**. If they try to carry the bags themselves: **dejá, dejá**.

When they thank you: **no es nada** or **faltaba más** (*don't mention it*).

They may call you **querido** or **querida**.$tip$, updated_at = now() where id = '787e171d-c6b2-56b6-bfd5-86c95f58c4b7' and body_md = $tip$Offer help with **te doy una mano**. If they try to carry the bags themselves: **dejá, dejá**. When they thank you: **no es nada** or **faltaba más** (*don't mention it*). And they may call you **querido** or **querida**.$tip$;
update public.tips set body_md = $tip$Prices **suben** — or **aumentan**, same thing — and, now and then, **bajan**.

**Cobrar** has two meanings. *To charge*: **¿cuánto te cobraron?** — *how much did they charge you?* And *to get paid*: **¿ya cobraste?** — *did you get paid yet?*$tip$, updated_at = now() where id = '8af67e04-9d96-5ada-98ea-78bbea30080c' and body_md = $tip$Prices **suben** — or **aumentan**, same thing — and, now and then, **bajan**. **Cobrar** has two meanings. *To charge*: **¿cuánto te cobraron?** — *how much did they charge you?* And *to get paid*: **¿ya cobraste?** — *did you get paid yet?*$tip$;
update public.tips set body_md = $tip$In Buenos Aires prices **aumentan** so often that it is small talk: *¿viste cómo aumentó el café?*

Your **aumento** — *raise* — never keeps up with the **inflación**.

When something costs too much: **está por las nubes** — *sky-high*; **sale un ojo de la cara** — *it costs a fortune*.$tip$, updated_at = now() where id = 'da454431-0283-5e8b-a68d-ad8b4d5854e7' and body_md = $tip$In Buenos Aires prices **aumentan** so often that it is small talk: *¿viste cómo aumentó el café?* Your **aumento** — *raise* — never keeps up with the **inflación**. When something costs too much: **está por las nubes** — *sky-high*; **sale un ojo de la cara** — *it costs a fortune*.$tip$;
update public.tips set body_md = $tip$Porteños soften a request with **quería**: **quería un turno para mañana**, **te quería pedir algo**.

**Quisiera** — *I would like* — is the formal one, for the phone or an office: **quisiera un turno**. Nobody orders food with it.

To ask a stranger for something, add **no** and the future: **¿no tendrás hora?** — *you wouldn't happen to have the time?*$tip$, updated_at = now() where id = '1d87549c-7542-53ad-8a97-9ed8aef021a6' and body_md = $tip$Day to day porteños soften a request with **quería**: **quería un turno para mañana**, **te quería pedir algo**. **Quisiera** — *I would like* — is the formal one, for the phone or an office: **quisiera un turno**; nobody orders food with it. To ask a stranger for something, add **no** and the future: **¿no tendrás hora?** — *you wouldn't happen to have the time?*$tip$;
update public.tips set body_md = $tip$Porteños say **vos** to almost everyone: the shop owner, a doctor, an old man on the bus.

You may still hear **usted** sometimes, but **vos** is always fine for you.

The politeness lives in the words around it: **disculpá que te moleste**, **perdón por la molestia**, **muy amable**.$tip$, updated_at = now() where id = 'dda7b964-bb56-5e48-bc13-d19abd0fc766' and body_md = $tip$Porteños say **vos** to almost everyone: the shop owner, a doctor, an old man on the bus. You may still hear **usted** sometimes, but **vos** is always fine for you. The politeness lives in the words around it: **disculpá que te moleste**, **perdón por la molestia**, **muy amable**.$tip$;
update public.tips set body_md = $tip$| straight | softer |
| ¿Tenés cambio? | ¿**No tendrás** cambio? |
| ¿Sabés dónde queda? | ¿**No sabrás** dónde queda? |
| Quiero un turno. | **Quisiera** un turno. |
| Perdón. | **Disculpá que te moleste**. |

**No** plus the future turns a question into a gentle one: *you wouldn't happen to…?*

After **disculpá que**, the verb takes the subjunctive: *te moleste*.$tip$, updated_at = now() where id = 'e41cacc8-f196-569f-9838-bdd51d5857fa' and body_md = $tip$| straight | softer |
| ¿Tenés cambio? | ¿**No tendrás** cambio? |
| ¿Sabés dónde queda? | ¿**No sabrás** dónde queda? |
| Quiero un turno. | **Quisiera** un turno. |
| Perdón. | **Disculpá que te moleste**. |

**No** plus the future turns a question into a gentle one: *you wouldn't happen to…?* After **disculpá que**, the verb takes the subjunctive: *te moleste*.$tip$;
update public.tips set body_md = $tip$**Cada vez peor** and **cada vez mejor** — *worse and worse, better and better*.

What's in is **de moda**; what's gone **desapareció**: **desaparecieron los almacenes** — *the corner shops disappeared*. Where the old house stood there's a **torre** — *a high-rise*.

Ya no es **lo mismo** — *it's not the same anymore*.$tip$, updated_at = now() where id = '540d8ca7-657a-5701-bb91-0246d4d77115' and body_md = $tip$**Cada vez peor** and **cada vez mejor** — *worse and worse, better and better*. What's in is **de moda**; what's gone **desapareció**: **desaparecieron los almacenes** — *the corner shops disappeared*, and where the old house stood there's a **torre** — *a high-rise*. Ya no es **lo mismo** — *it's not the same anymore*.$tip$;
update public.tips set body_md = $tip$| | regular | shortened |
| yo, él, ella | hablar**ía**, dejar**ía**, pedir**ía**, volver**ía** | **saldría**, **tendría**, **diría** |
| vos | ir**ías** | **tendrías**, **dirías** |
| with *me* | **me quedaría** | |

**Yo en tu lugar, hablaría con él.** Vos adds **-s**: *¿vos qué le dirías?*

**Tendrías que** is advice too: *tendrías que llamarlo*.$tip$, updated_at = now() where id = 'bacc1caa-284c-580c-9706-11d855c3ab98' and body_md = $tip$| | regular | shortened |
| yo, él, ella | hablar**ía**, dejar**ía**, pedir**ía**, volver**ía** | **saldría**, **tendría**, **diría** |
| vos | ir**ías** | **tendrías**, **dirías** |
| with *me* | **me quedaría** | |

**Yo en tu lugar, hablaría con él.** Vos adds **-s**: *¿vos qué le dirías?* **Tendrías que** is advice too: *tendrías que llamarlo*.$tip$;
update public.tips set body_md = $tip$**Yo en tu lugar** — *in your place, if I were you* — is like *yo que vos*, a little more serious.

The advice after it is still *would*: **yo en tu lugar, hablaría con él**, **yo me quedaría**.$tip$, updated_at = now() where id = 'f09f8f3b-acf3-5ae9-a200-3c92a0932524' and body_md = $tip$**Yo en tu lugar** — *in your place, if I were you* — means the same as *yo que vos*, a little more serious. The advice after it is still *would*: **yo en tu lugar, hablaría con él**, **yo me quedaría**.$tip$;
update public.tips set body_md = $tip$| | regular | shortened |
| yo, él, ella | comprar**ía**, ir**ía** | **tendría**, **podría**, **haría**, **diría** |
| vos | ir**ías** | |

The ending goes on the whole infinitive: *comprar* → **compraría**.

**Yo que vos** + would is advice: *yo que vos, esperaría*. **Tendría que** is *should* — *tendría que ir* — and **podría** is *could*.$tip$, updated_at = now() where id = '0d67de33-b543-5723-80bc-2cdc84c62e99' and body_md = $tip$| | regular | shortened |
| yo, él, ella | comprar**ía**, ir**ía** | **tendría**, **podría**, **haría**, **diría** |
| vos | ir**ías** | |
The ending goes on the whole infinitive: *comprar* → **compraría**. **Yo que vos** + would is advice: *yo que vos, esperaría*. **Tendría que** is *should* — *tendría que ir* — and **podría** is *could*.$tip$;
update public.tips set body_md = $tip$| **Acabo de** llegar. | I just got here. |
| **Suelo** almorzar tarde. | I usually have lunch late. |
| **Volví a** perder las llaves. | I lost my keys again. |

All three take an infinitive.

**Soler** has a past too, **solía** — *solía almorzar tarde* — but *antes almorzaba tarde* says the same.$tip$, updated_at = now() where id = '19d601d6-de61-5a96-92de-c8ebe98b3a8f' and body_md = $tip$| **Acabo de** llegar. | I just got here. |
| **Suelo** almorzar tarde. | I usually have lunch late. |
| **Volví a** perder las llaves. | I lost my keys again. |

All three take an infinitive. **Soler** has a past too, **solía** — *solía almorzar tarde* — but *antes almorzaba tarde* says the same.$tip$;
update public.tips set body_md = $tip$**Acabo de** + infinitive is *I just did it*: **acabo de comer**, **acaba de salir**. Porteños mostly say **recién** + the past instead: **recién llegué**, **recién salió**.

**Volví a** is *I did it again*: **volví a llamar**. Or just **de nuevo** or **otra vez** — *again*.$tip$, updated_at = now() where id = '043bf160-0648-51c6-bec2-2b7afbcb4c4a' and body_md = $tip$**Acabo de** + infinitive is *I just did it*: **acabo de comer**, **acaba de salir**. Porteños mostly say **recién** + the past instead: **recién llegué**, **recién salió** — it means the same. **Volví a** is *I did it again*: **volví a llamar**. Or just **de nuevo** or **otra vez** — *again*.$tip$;
update public.tips set body_md = $tip$**Soler** is *to usually*: **suelo almorzar tarde** — *I usually have lunch late*; **¿solés venir acá?** It only comes with an infinitive.

In speech porteños more often say **generalmente** or **casi siempre**: **generalmente almuerzo tarde**.$tip$, updated_at = now() where id = 'd578e8dc-eaae-5236-b408-a7b053f9755a' and body_md = $tip$**Soler** is *to usually*: **suelo almorzar tarde** — *I usually have lunch late*; **¿solés venir acá?** It only ever comes with an infinitive. In speech porteños more often say **generalmente** or **casi siempre**: **generalmente almuerzo tarde**.$tip$;
update public.tips set body_md = $tip$Nobody arrives on time: **si te dicen a las nueve, llegás a las nueve y media**.

In the mate round **gracias** means *no more for me*: **si decís gracias, no tomás más**.

Men greet each other with a kiss too. And **la propina** is about ten per cent, in cash.$tip$, updated_at = now() where id = 'c7048a9e-3730-5fc1-bced-2284e967b9c4' and body_md = $tip$Nobody arrives on time: **si te dicen a las nueve, llegás a las nueve y media**. In the mate round **gracias** means *no more for me*: **si decís gracias, no tomás más**. Men greet each other with a kiss too. And **la propina** is about ten per cent, in cash.$tip$;
update public.tips set body_md = $tip$**La previa** is the drinks before going out.

After eating comes **la sobremesa**: the long chat at the table.$tip$, updated_at = now() where id = 'd2d06eea-a98e-54f4-9bd4-27bffe69db00' and body_md = $tip$**La previa** is the drinks before going out; **la sobremesa** is the long chat at the table after eating, which nobody cuts short.$tip$;
update public.tips set body_md = $tip$**Estoy de acuerdo** — *I agree*. Disagreeing: **no estoy de acuerdo**, or a flat **para nada** — *not at all*.

In between: **depende** — *it depends*; **en parte** — *partly*.$tip$, updated_at = now() where id = '92568dab-b1e4-5721-9f67-adeec3747987' and body_md = $tip$**Estoy de acuerdo** — *I agree*. Disagreeing: **no estoy de acuerdo**, or a flat **para nada** — *not at all*. In between: **depende** — *it depends*; **en parte** — *partly*.$tip$;
update public.tips set body_md = $tip$Porteños soften an argument with **puede ser, pero…** — *could be, but…*

**Puede ser que** + the subjunctive is *maybe*: **puede ser que tengas razón** — *you might be right*; **puede ser que llueva**.$tip$, updated_at = now() where id = 'b617a7a0-808e-54d7-85f8-735996d78f75' and body_md = $tip$A porteño argues hard and softens it: **puede ser, pero…** — *could be, but…* **Puede ser que** + the subjunctive is *maybe*: **puede ser que tengas razón** — *you might be right*; **puede ser que llueva**.$tip$;
update public.tips set body_md = $tip$**Dejar de** + infinitive is *to stop, to quit*: **dejé de fumar**, **¿dejaste de ir al gimnasio?**, **¡dejá de quejarte!**

Its opposite is **volver a**: **volvió a fumar** — *he started smoking again*.

**Ponerse a** is *to start doing*: **me puse a estudiar** — *I started studying*.$tip$, updated_at = now() where id = '1ff21937-4c97-54d5-9f50-7a6407f83159' and body_md = $tip$**Dejar de** + infinitive is *to stop, to quit*: **dejé de fumar**, **¿dejaste de ir al gimnasio?**, **¡dejá de quejarte!** Its opposite is **volver a**: **volvió a fumar** — *he started smoking again*. **Ponerse a** is *to start doing*: **me puse a estudiar** — *I started studying*.$tip$;
update public.tips set body_md = $tip$**De vez en cuando** is *every now and then*: **fumo de vez en cuando**. **Casi nunca** is *hardly ever*: **casi nunca manejo**.

Both can be a whole answer: *¿Salís mucho? — De vez en cuando.*

Your **rutina** is what you do every day.$tip$, updated_at = now() where id = '559eee63-454f-5ebc-885f-9cdf45705eee' and body_md = $tip$**De vez en cuando** is *every now and then*: **fumo de vez en cuando**. **Casi nunca** is *hardly ever*: **casi nunca manejo**. Both can be a whole answer: *¿Salís mucho? — De vez en cuando.* Your **rutina** is what you do every day.$tip$;
update public.tips set body_md = $tip$The bank has its own accidents: **se me bloqueó la tarjeta**, **se me venció la tarjeta**. Same *se me* as a dropped glass.

How it happens: **puse mal la clave tres veces** — *I entered the wrong PIN three times*.$tip$, updated_at = now() where id = '4b021c65-ffd3-5b07-9dea-dd8581d6491b' and body_md = $tip$The bank has its own accidents: **se me bloqueó la tarjeta**, **se me venció la tarjeta**. Same *se me* as a dropped glass. How it happens: **puse mal la clave tres veces** — *I entered the wrong PIN three times*.$tip$;
update public.tips set body_md = $tip$**Te transfiero** — *I'll transfer it to you*; with vos, **¿me transferís?** Asking for it: **transferime**.

The past: **te transferí**, **¿me transferiste?** — but él changes to **transfirió**.$tip$, updated_at = now() where id = '71a97b7b-6510-5688-b13f-983c17a2d112' and body_md = $tip$**Te transfiero** — *I'll transfer it to you*; with vos, **¿me transferís?** The past: **te transferí**, **¿me transferiste?** — but él changes to **transfirió**. Asking for it: **transferime**.$tip$;
update public.tips set body_md = $tip$The ATM is **el cajero**: **voy al cajero a sacar plata**.

Paying a friend goes by **transferencia** to their **alias** — a few words instead of an account number: **¿a qué alias transferiste?** Then: **¿me mandás el comprobante?**

The **sucursal** is the bank branch; a **comisión** is the fee a cajero charges; **las cuentas** are your bills, or your bank accounts.$tip$, updated_at = now() where id = 'bf96bee5-076e-5167-adb6-ac24c4793a4d' and body_md = $tip$The ATM is **el cajero**: **voy al cajero a sacar plata**. Paying a friend goes by **transferencia** to their **alias** — a few words instead of an account number: **¿a qué alias transferiste?** After it: **¿me mandás el comprobante?** The **sucursal** is the bank branch; a **comisión** is the fee a cajero charges; **las cuentas** are your bills, or your bank accounts.$tip$;
update public.tips set body_md = $tip$Living in a building means paying **expensas** — *the monthly building fees* — to the **consorcio** — *the owners' association*.

The **encargado** is the building caretaker.$tip$, updated_at = now() where id = '91a5e921-8540-53dc-904c-1b0a1d6a8502' and body_md = $tip$Living in a building means paying **expensas** — *the monthly building fees* — to the **consorcio** — *the owners' association*. The **encargado** is the building caretaker, and knows everything.$tip$;
update public.tips set body_md = $tip$The **calefón** heats the water.

When there's a **pérdida** — *a leak* — you call the **plomero** to **arreglar** it.$tip$, updated_at = now() where id = 'd6e4060c-fafa-577a-a626-8cd85c56ee4c' and body_md = $tip$The **calefón** heats the water, and breaks in July. When there's a **pérdida** — *a leak* — you call the **plomero** to **arreglar** it.$tip$;
update public.tips set body_md = $tip$One machine **anda**, two **andan**: **no andan las pilas**. The past is irregular: **ayer anduvo bien** — *it worked fine yesterday*.

**Funciona**, **funcionan** mean the same and are just as common. For *how* something works, only *funcionar*: **¿cómo funciona este control?**$tip$, updated_at = now() where id = '5efffc1b-c968-5b0e-8d8a-6c2df5c0c497' and body_md = $tip$One machine **anda**, two **andan**: **no andan las pilas**. The past is irregular: **ayer anduvo bien** — *it worked fine yesterday*. **Funciona**, **funcionan** mean the same and are just as common. For *how* something works, only *funcionar*: **¿cómo funciona este control?**$tip$;
update public.tips set body_md = $tip$People say **la engañó** — *he cheated on her*. In gossip, more often **le metió los cuernos**, literally *put the horns on*.

**Engañar** is also plain *to trick, to fool*.$tip$, updated_at = now() where id = '026bd560-7714-5c78-9076-aba02a35b1d7' and body_md = $tip$People say **la engañó** — *he cheated on her* — and in gossip even more often **le metió los cuernos**, literally *put the horns on*. **Engañar** is also plain *to trick, to fool*.$tip$;
update public.tips set body_md = $tip$In the story it's the past: **¿te dio miedo?** — **no, me dio risa**.

**Me da vergüenza** — *I'm embarrassed* — is built the same way.$tip$, updated_at = now() where id = 'c9bc18db-a5bf-5ef4-96f8-705e372ec30f' and body_md = $tip$In the story it's the past: **¿te dio miedo?** — **no, me dio risa**. **Me da vergüenza** — *I'm embarrassed* — is built the same way.$tip$;
update public.tips set body_md = $tip$**¿Me lo podés arreglar?** — *can you fix it for me?* After the **técnico** comes: **lo arregló en cinco minutos** — *he fixed it in five minutes*.

If he never comes, **hacés un reclamo** — *you file a complaint* — and **nos quejamos** all summer.

Questions for him: **¿tiene arreglo?** — *can it be fixed?*; **¿cuánto me sale el arreglo?**; **¿cuándo podés venir?**$tip$, updated_at = now() where id = 'c3650361-726d-523a-93eb-fc3114f524cd' and body_md = $tip$**¿Me lo podés arreglar?** — *can you fix it for me?* After the **técnico** comes: **lo arregló en cinco minutos** — *he fixed it in five minutes*. If he never comes, **hacés un reclamo** — *you file a complaint* — and **nos quejamos** all summer. The questions for the técnico: **¿tiene arreglo?** — *can it be fixed?*; **¿cuánto me sale el arreglo?**; **¿cuándo podés venir?**$tip$;
update public.tips set body_md = $tip$A hot night, a **cucaracha** in the kitchen, and it **vuela**: **grité**, **pegué un salto** — more natural than a bare *salté* — and in the end **la maté** with an **ojota**.

The other summer visitor is the **mosquito**: **me picó un mosquito**, so nobody goes out without **repelente**.$tip$, updated_at = now() where id = 'f4296b31-e5fc-50a1-a8e5-b7b5d36a9830' and body_md = $tip$A hot night, a **cucaracha** in the kitchen, and it **vuela**: **grité**, **pegué un salto** — more natural than a bare *salté* — and in the end **la maté** with an **ojota**. Every porteño has this story. The other summer visitor is the **mosquito**: **me picó un mosquito**, so nobody goes out without **repelente**.$tip$;
update public.tips set body_md = $tip$All the way with you: **exacto**, **totalmente**, **obvio**, **sin duda** — and the stiffer **coincido**.

All the way against: **al contrario**, **no creo**, **estás equivocado**.

For the friend who goes too far: **¡no exageres!**$tip$, updated_at = now() where id = 'abc22894-4d33-582c-ba69-497c6215889e' and body_md = $tip$All the way with you: **exacto**, **totalmente**, **obvio**, **sin duda** — and the stiffer **coincido**. All the way against: **al contrario**, **no creo**, **estás equivocado**. And for the friend who goes too far: **¡no exageres!**$tip$;
update public.tips set body_md = $tip$For machines, porteños say **anda** — *it works*: **no anda el wifi**, **¿anda el ascensor?**. *Funciona* means the same and is just as common.

Other ways things fail: **se rompió**, **está roto**, **no prende** — *it won't turn on*; **se colgó** — *it froze*; **pierde agua** — *it's leaking*.$tip$, updated_at = now() where id = '17c1c9e2-7e28-5f37-a171-3f6f56f5e112' and body_md = $tip$For machines, porteños say **anda** — *it works*: **no anda el wifi**, **¿anda el ascensor?**. *Funciona* means the same and is just as common. The other ways things fail: **se rompió**, **está roto**, **no prende** — *it won't turn on*; **se colgó** — *it froze*; **pierde agua** — *it's leaking*.$tip$;
update public.tips set body_md = $tip$**Me quejé** — *I complained*; **¿de qué te quejás?** — *what are you complaining about?*

**Reclamar** is to file a complaint, as with a phone company.$tip$, updated_at = now() where id = 'c011bb73-3d6a-5f36-8017-766c13874cae' and body_md = $tip$**Me quejé** — *I complained*; **¿de qué te quejás?** — *what are you complaining about?* **Reclamar** is to file a complaint, and something you do a lot with a phone company.$tip$;
update public.tips set body_md = $tip$**¡No me digas!** and **¡callate!** both mean *no way!* — between friends *callate* isn't rude. **¡Mirá vos!** is milder: *wow, really?*

By the afternoon **todo el mundo** knows, thanks to the **chusma**: the person who loves gossip.$tip$, updated_at = now() where id = 'cba630fb-166d-5c75-b920-75b35d3ba605' and body_md = $tip$**¡No me digas!** and **¡callate!** both mean *no way!* — between friends *callate* isn't rude. **¡Mirá vos!** is milder: *wow, really?* By the afternoon **todo el mundo** knows, thanks to the **chusma**: the person who loves gossip.$tip$;
update public.tips set body_md = $tip$**Lo que** is *what* when it means *the thing that*: **¿viste lo que pasó?**, **contame lo que pasó**. Every chisme starts with it: **no sabés lo que me contaron** — *you won't believe what they told me*.

A direct question keeps **qué**: *¿qué pasó?*$tip$, updated_at = now() where id = '457aa31e-c947-5f00-b748-3212e6826684' and body_md = $tip$**Lo que** is *what* when it means *the thing that*: **¿viste lo que pasó?**, **contame lo que pasó**. It is how every chisme starts: **no sabés lo que me contaron** — *you won't believe what they told me*. A direct question keeps **qué**: *¿qué pasó?*$tip$;
update public.tips set body_md = $tip$**No me habían avisado** — *nobody had told me*; **ya lo había llamado** — *I'd already called him*.

One more irregular participle: *escribir* → **escrito**.$tip$, updated_at = now() where id = '78c655d8-0b95-51e7-988a-2512b7a21517' and body_md = $tip$**No me habían avisado** — *nobody had told me*; **ya lo había llamado** — *I'd already called him*. One more irregular participle: *escribir* → **escrito**.$tip$;
update public.tips set body_md = $tip$| yo, él, ella | **había** | probado, estado, empezado |
| vos | **habías** | terminado, escuchado |
| nosotros | **habíamos** | llamado, avisado |
| ellos | **habían** | **escrito**, hecho, dicho, visto |

Any participle goes with any person: **habíamos probado**, **habías escrito**.

**Nunca había probado algo así** — never, up to a moment in the past. **Ya habíamos terminado cuando llegaste** — done before the other thing happened.$tip$, updated_at = now() where id = '196e6740-01b2-552c-96a6-cdb74c2a7fbd' and body_md = $tip$| yo, él, ella | **había** | probado, estado, empezado |
| vos | **habías** | terminado, escuchado |
| nosotros | **habíamos** | llamado, avisado |
| ellos | **habían** | **escrito**, hecho, dicho, visto |

Any participle goes with any person: **habíamos probado**, **habías escrito**. **Nunca había probado algo así** — never, up to a moment in the past. **Ya habíamos terminado cuando llegaste** — done before the other thing happened.$tip$;
update public.tips set body_md = $tip$A first time is told with **nunca había** + a participle: **nunca había probado el dulce de leche** — *I'd never tried dulce de leche*.

**Por primera vez** goes with it: **lo probé por primera vez en Buenos Aires**.$tip$, updated_at = now() where id = '480771b2-8828-5a35-80e3-1aaf3ecbf53c' and body_md = $tip$A first time is told with **nunca había** + a participle: **nunca había probado el dulce de leche** — *I'd never tried dulce de leche* (until that day). **Por primera vez** is the other half: **lo probé por primera vez en Buenos Aires**.$tip$;
update public.tips set body_md = $tip$**Antes de que llegue** — *before he gets here* — always takes the subjunctive: it hasn't happened yet.

Same person on both sides: **antes de** + infinitive — *antes de salir*.$tip$, updated_at = now() where id = '6448cf46-bc23-5745-bed1-552fb5525e28' and body_md = $tip$**Antes de que llegue** — *before he gets here* — always takes the subjunctive: it hasn't happened yet. Same person on both sides: **antes de** + infinitive — *antes de salir*.$tip$;
update public.tips set body_md = $tip$The subjunctive keeps the *yo* stem: *cierro* → **cierres**, *encuentro* → **encuentres**, *riego* → **riegues**. The **u** is only spelling: it keeps the *g* hard.

The regular ones just swap the vowel: **entres**, **abras**.$tip$, updated_at = now() where id = '4288460e-6410-5750-b081-94888e8c93b5' and body_md = $tip$The subjunctive keeps the *yo* stem: *cierro* → **cierres**, *encuentro* → **encuentres**, *riego* → **riegues** (the **u** is only spelling: it keeps the *g* hard). The regular ones just swap the vowel: **entres**, **abras**.$tip$;
update public.tips set body_md = $tip$Every instruction is a **para que** + what the *other* person does: **te dejo la llave para que entres**, **para que riegues las plantas**, **para que el gato coma**.

Two people, so the second verb is subjunctive.$tip$, updated_at = now() where id = 'a46e4610-d990-5c01-ae47-62514d73ca07' and body_md = $tip$Going on vacation? Every instruction is a **para que** + what the *other* person does: **te dejo la llave para que entres**, **para que riegues las plantas**, **para que el gato coma**. Two people, so the second verb is subjunctive.$tip$;
update public.tips set body_md = $tip$**Te dejo la llave para que entres** — someone else's action takes the subjunctive.

**Nunca había probado algo así** — one past before another.$tip$, updated_at = now() where id = 'cc050468-4d3f-5e25-acaf-76181112b98c' and body_md = $tip$**Te dejo la llave para que entres** — someone else's action takes the subjunctive. **Nunca había probado algo así** — one past before another.$tip$;
update public.tips set body_md = $tip$The verb agrees with the thing: **se me cayó la taza**, **se me cayeron las llaves**.

The middle word is who it happened to: **se nos acabó el café**.$tip$, updated_at = now() where id = 'ce78c3e8-0bef-5086-a5d6-15b62e2c6fba' and body_md = $tip$The verb agrees with the thing: **se me cayó la taza**, **se me cayeron las llaves**. The middle word is who it happened to: **se nos acabó el café**.$tip$;
update public.tips set body_md = $tip$A thing left behind is **me olvidé**: **me olvidé las llaves**.

Something you did not remember to do is **se me pasó**: **se me pasó llamar a mi vieja** — or **me olvidé de llamar**.$tip$, updated_at = now() where id = '7bc7d559-171b-5d91-a113-cdfdadc81e93' and body_md = $tip$A thing left behind is **me olvidé**: **me olvidé las llaves**. Something you did not remember to do is **se me pasó**: **se me pasó llamar a mi vieja** — or **me olvidé de llamar**.$tip$;
update public.tips set body_md = $tip$*They* in the past: **ganaron**, **perdieron**, **empataron**.

The machine that let you down: **ayer anduvo**, **hoy no anda**.$tip$, updated_at = now() where id = 'd236343e-d2ca-5a28-86e3-f24982d073e2' and body_md = $tip$*They* in the past: **ganaron**, **perdieron**, **empataron**. The machine that let you down: **ayer anduvo**, **hoy no anda**.$tip$;
update public.tips set body_md = $tip$**Para mí**, **me parece que**, **coincido**, **al contrario** — the whole argument. *Opino que* is for TV panels: at the table it is **para mí, el árbitro estuvo mal**.

The line that ends it: **¡no exageres!**

For advice, **tendrías que** — *you should*: **tendrías que ir al médico**.$tip$, updated_at = now() where id = 'd74aeb37-59af-5591-be40-ad3811e93ce1' and body_md = $tip$**Para mí**, **me parece que**, **coincido**, **al contrario** — the whole argument. *Opino que* is for TV panels: at the table it is **para mí, el árbitro estuvo mal**. And the line that ends it: **¡no exageres!** For advice, **tendrías que** — *you should*: **tendrías que ir al médico**.$tip$;
update public.tips set body_md = $tip$**Me da asco la cucaracha**, **me dan asco las cucarachas** — the verb follows the thing.

In the past: **¿te dio miedo?** — **no, me dio risa**.$tip$, updated_at = now() where id = '605b9c23-3a8a-5a4d-bd8c-b8abb585d7f5' and body_md = $tip$**Me da asco la cucaracha**, **me dan asco las cucarachas** — the verb follows the thing. In the past: **¿te dio miedo?** — **no, me dio risa**.$tip$;
update public.tips set body_md = $tip$**Me da miedo** — *it scares me* — works like *gustar*; in a story it's **me dio miedo**.

The reaction afterwards: **¡qué susto!**$tip$, updated_at = now() where id = '94d127e4-2339-5415-98ae-ddd06a03e5e1' and body_md = $tip$**Me da miedo** — *it scares me* — works like *gustar*; in a story it's **me dio miedo**. The reaction afterwards: **¡qué susto!**$tip$;
update public.tips set body_md = $tip$A scare story has its set pieces: **de repente** — *suddenly*; **me pegué un susto** — *I got such a fright*; **salí corriendo** — *I ran off* (more natural than a bare *corrí*).

Then: **casi me muero**; **pensé que era un ladrón**.

The relief: **al final no era nada**.$tip$, updated_at = now() where id = 'c3471351-e02c-588e-853f-cff708c42c38' and body_md = $tip$A scare story has its set pieces: **de repente** — *suddenly*; **me pegué un susto** — *I got such a fright*; **salí corriendo** — *I ran off* (more natural than a bare *corrí*); **casi me muero**; **pensé que era un ladrón**; and the relief: **al final no era nada**.$tip$;
update public.tips set body_md = $tip$| **Se trae** algo. | You bring something. |
| **Se pone** la mesa. | The table gets set. |
| **Se brinda** con todos. | Everyone toasts together. |
| **Se aplaude** al asador. | Everyone applauds the grill master. |

**Se** + the *él* form: no subject, because it's everybody. *Acá se come tarde* works the same way.

As a guest you say **llevar**: **¿qué llevo?** — *what should I bring?* The host, already there, says **traer**: **¿quién trae el vino?**$tip$, updated_at = now() where id = '79c02546-9daf-5168-b348-001f1c21de69' and body_md = $tip$| **Se trae** algo. | You bring something. |
| **Se pone** la mesa. | The table gets set. |
| **Se brinda** con todos. | Everyone toasts together. |
| **Se aplaude** al asador. | Everyone applauds the grill master. |

**Se** + the *él* form: no subject, because it's everybody. *Acá se come tarde* works the same way. As a guest you say **llevar**: **¿qué llevo?** — *what should I bring?* The host, already there, says **traer**: **¿quién trae el vino?**$tip$;
update public.tips set body_md = $tip$When the meat reaches the table, **se aplaude al asador**: *¡un aplauso para el asador!* **Se brinda** with everyone at the table.

Leaving without saying goodbye to each person is **maleducado**.

Also **los ñoquis del 29**: on the 29th of each month people eat gnocchi, with money under the plate for luck.$tip$, updated_at = now() where id = '742f77df-09f7-552b-baff-76369529b3b3' and body_md = $tip$When the meat reaches the table, **se aplaude al asador**: *¡un aplauso para el asador!* **Se brinda** with everyone at the table. Leaving without saying goodbye to each person? Very **maleducado**. And **los ñoquis del 29**: on the 29th of each month people eat gnocchi, with money under the plate for luck.$tip$;
update public.tips set body_md = $tip$Spanish tells accidents as if they happened *to* you: **se me cayó** — *I dropped it*. Nobody is to blame.

More: **se me rompió** — *it broke on me*; **se me pasó** — *I forgot*.$tip$, updated_at = now() where id = '6f7cea1b-f51c-566f-be92-462456d6f490' and body_md = $tip$Spanish tells accidents as if they happened *to* you: **se me cayó** — *I dropped it* (it fell, and it happened to me); **se me rompió** — *it broke on me*; **se me pasó** — *I forgot* (it slipped my mind). Nobody is to blame, which is the point.$tip$;
update public.tips set body_md = $tip$| | one thing | more than one |
| to me | **se me** quemó la comida | **se me** quemaron las tostadas |
| to you | **se te** quemó | **se te** quemaron |
| to us | **se nos** quemó | **se nos** quemaron |

The verb follows the thing: one thing **-ó**, more than one **-aron / -eron**.

The middle word says who it happened to: **se me**, **se te**, **se le**, **se nos**.$tip$, updated_at = now() where id = 'aa612ce1-aae0-5abb-ac0a-dce44906d427' and body_md = $tip$| | one thing | more than one |
| to me | **se me** quemó la comida | **se me** quemaron las tostadas |
| to you | **se te** quemó | **se te** quemaron |
| to us | **se nos** quemó | **se nos** quemaron |

The verb follows the thing: one thing **-ó**, more than one **-aron / -eron**. The middle word says who it happened to: **se me**, **se te**, **se le**, **se nos**.$tip$;
update public.tips set body_md = $tip$**Se me** + verb says it happened *to* you, by accident: **no fue mi culpa, se me cayó** — *it wasn't my fault, I dropped it*.

The excuse for being late: **se me hizo tarde** — *it got late*.$tip$, updated_at = now() where id = '22f82d78-a640-5c67-b204-ef2caa3e3182' and body_md = $tip$**Se me** + verb says it happened *to* you, by accident — you didn't do it on purpose: **no fue mi culpa, se me cayó** — *it wasn't my fault, I dropped it*. And the excuse every porteño has ready when they're late: **se me hizo tarde** — *it got late*.$tip$;
update public.tips set body_md = $tip$Things at home break on their own, with **se**. Nobody did it: it **se rompió**. Like **se tapó el inodoro** — *the toilet's clogged*; **se trabó la puerta** — *the door got stuck*; **se cortó el agua**.

An elevator stuck between floors **se quedó**: *se quedó el ascensor*.

**La pileta** is the swimming pool and also the kitchen sink — **la pileta de la cocina**, or **la bacha**.$tip$, updated_at = now() where id = '5c59e9dc-914b-5172-9d87-3fa83a52e4b9' and body_md = $tip$Things at home break on their own, with **se**: **se tapó el inodoro** — *the toilet's clogged*; **se trabó la puerta** — *the door got stuck* (an elevator stuck between floors **se quedó**: *se quedó el ascensor*); **se cortó el agua**. Nobody did it — it just **se rompió**. **La pileta** is the swimming pool and also the kitchen sink — **la pileta de la cocina**, or **la bacha**.$tip$;
update public.tips set body_md = $tip$Each problem has its person. The **plomero** fixes a **canilla** that **gotea** — *a dripping faucet*; the **gasista**, the calefón; the **encargado**, the **portero eléctrico**.

A **filtración** from the apartment upstairs goes to the **administración** — *the management office*.

A toilet or a faucet that leaks **pierde agua**: **el inodoro pierde agua**.$tip$, updated_at = now() where id = 'e7c5b8b2-bd38-57ba-bd75-9d14c7757dc8' and body_md = $tip$Each problem has its person: the **plomero** for a **canilla** that **gotea** — *a dripping faucet* — the **gasista** for the calefón, the **encargado** for the **portero eléctrico**. A **filtración** from the apartment upstairs goes to the **administración** — *the management office* — and takes months. A toilet or a faucet that leaks **pierde agua**: **el inodoro pierde agua**.$tip$;
update public.tips set body_md = $tip$| yo form | para que… (vos) |
| entro | para que **entres** |
| abro | para que **abras** |
| cierro | para que **cierres** |
| encuentro | para que **encuentres** |
| riego | para que **riegues** |

For *él, ella*: **para que el gato coma**.

**Sin que** and **antes de que** take the same forms: *sin que se escape*, *antes de que vuelva*.$tip$, updated_at = now() where id = '4bffbc84-058c-5a8b-8c43-0f0895af71b3' and body_md = $tip$| yo form | para que… (vos) |
| entro | para que **entres** |
| abro | para que **abras** |
| cierro | para que **cierres** |
| encuentro | para que **encuentres** |
| riego | para que **riegues** |

For *él, ella*: **para que el gato coma**. **Sin que** and **antes de que** take the same forms: *sin que se escape*, *antes de que vuelva*.$tip$;
update public.tips set body_md = $tip$**Opinar** is having a view: **¿vos qué opinás?** — *what do you think?*; **opino lo mismo**.

But **yo opino que…** sounds formal. In daily speech porteños start with **para mí** or **me parece que**: **para mí, depende del tema**; **me parece que tenés razón**.$tip$, updated_at = now() where id = '02a86818-3208-5fb0-9215-3197ea632302' and body_md = $tip$**Opinar** is having a view: **¿vos qué opinás?** — *what do you think?*; **opino lo mismo**. But **yo opino que…** sounds formal, like a TV panel: in daily speech porteños start with **para mí** or **me parece que**: **para mí, depende del tema**; **me parece que tenés razón**.$tip$;
update public.tips set body_md = $tip$One past behind another: **había** + a participle. **Cuando llegué, ya habían comido** — *when I got there, they'd already eaten*.

Yo, él and ella take **había**; vos, **habías**; ellos, **habían**.

Pronouns go in front: **ya se había ido**, **no me habían dicho nada**.$tip$, updated_at = now() where id = '1ce38771-b5cc-5d17-9f00-d8a1112042e5' and body_md = $tip$One past behind another: **había** + a participle. **Cuando llegué, ya habían comido** — *when I got there, they'd already eaten*. Yo, él and ella take **había**; vos, **habías**; ellos, **habían**. Pronouns go in front: **ya se había ido**, **no me habían dicho nada**. *Hecho, dicho, visto* are the irregular ones.$tip$;
update public.tips set body_md = $tip$Porteños close the thought with **igual** — *anyway*: *aunque esté cansada, voy igual*; *gracias igual* — *thanks anyway*.

**De todos modos** says the same but sounds written: *salí de todos modos*.

**A pesar de** takes a noun or an infinitive: *a pesar del frío*.$tip$, updated_at = now() where id = '867bb841-c3ee-5915-a39a-2a142147407f' and body_md = $tip$Porteños close the thought with **igual** — *anyway*: *aunque esté cansada, voy igual*; *gracias igual* — *thanks anyway*. **De todos modos** says the same but sounds written: *salí de todos modos*. **A pesar de** takes a noun or an infinitive: *a pesar del frío*.$tip$;
update public.tips set body_md = $tip$**Servir** is *to be of use*, and it works like *gustar*: **¿te sirven?** — *can you use them?*; **sí, me sirve** — *that works for me*.

Things that are no good **no sirven**: **estas zapatillas no sirven**.$tip$, updated_at = now() where id = '84182bc5-e5a7-57b5-8d02-166ec7841c94' and body_md = $tip$**Servir** is *to be of use*, and it works like *gustar*: **¿te sirven?** — *can you use them?*; **sí, me sirve** — *that works for me*. Things that are no good **no sirven**: **estas zapatillas no sirven**.$tip$;
update public.tips set body_md = $tip$| a fact — normal verb | a maybe — subjunctive |
| Aunque **llueve**, vamos. | Aunque **llueva**, vamos. |
| Aunque **cuesta**, sigo. | Aunque **cueste**, sigo. |
| Aunque **estoy** cansado, voy. | Aunque **esté** cansado, voy. |

Left: it *is* raining. Right: whether or not it rains.

**Igual** at the end — *anyway* — often closes it.$tip$, updated_at = now() where id = '63fad49e-94ca-595b-9a43-f0244cd997ff' and body_md = $tip$| a fact — normal verb | a maybe — subjunctive |
| Aunque **llueve**, vamos. | Aunque **llueva**, vamos. |
| Aunque **cuesta**, sigo. | Aunque **cueste**, sigo. |
| Aunque **estoy** cansado, voy. | Aunque **esté** cansado, voy. |

Left: it *is* raining. Right: whether or not it rains. **Igual** at the end — *anyway* — often closes it.$tip$;
update public.tips set body_md = $tip$**Por más que** — *no matter how much* — is a stronger *aunque*: **por más que me cueste, sigo** — *however hard it is, I keep going*.

A maybe takes the subjunctive, a fact doesn't: *por más que **entreno**, engordo* — I do train; it just doesn't show.$tip$, updated_at = now() where id = '2df58fe2-bf8f-5caa-8c0e-83306081923b' and body_md = $tip$**Por más que** — *no matter how much* — is a stronger *aunque*: **por más que me cueste, sigo** — *however hard it is, I keep going*. A maybe takes the subjunctive, a fact doesn't: *por más que **entreno**, engordo* — I do train; it just doesn't show.$tip$;
update public.tips set body_md = $tip$**Hacerse el** + a describing word is *to act, to play*: **se hace el vivo** — *he acts all clever*; **se hizo el distraído** — *he pretended not to notice*.

For a woman it's **la**: **se hace la tonta**, **se hizo la distraída**.$tip$, updated_at = now() where id = 'cf806c31-8f85-5040-8303-14a57a557a27' and body_md = $tip$**Hacerse el** + a describing word is *to act, to play*: **se hace el vivo** — *he acts all clever*; **se hizo el distraído** — *he pretended not to notice*. For a woman it's **la**: **se hace la tonta**, **se hizo la distraída**.$tip$;
update public.tips set body_md = $tip$| Habla **como si supiera** todo. | He talks as if he knew everything. |
| **Como si fuera** fácil. | As if it were easy. |
| Me saludó **como si nada**. | He said hi as if nothing had happened. |
| ¡**Ni que fuera** tan difícil! | It's not like it's that hard! |

**Ni que…** is a complaint: you are saying the thing is NOT true.

After **como si** and **ni que**, always the *-ra* form, whatever the time.$tip$, updated_at = now() where id = 'd953b996-8823-5ff5-903a-37c8c6ca647c' and body_md = $tip$| Habla **como si supiera** todo. | He talks as if he knew everything. |
| **Como si fuera** fácil. | As if it were easy. |
| Me saludó **como si nada**. | He said hi as if nothing had happened. |
| ¡**Ni que fuera** tan difícil! | It's not like it's that hard! |

**Ni que…** is a complaint: you are saying the thing is NOT true. After **como si** and **ni que**, always the *-ra* form, whatever the time.$tip$;
update public.tips set body_md = $tip$In Buenos Aires you don't google an electrician, you ask around: **¿conocés a alguien de confianza?**

Same for a flatmate: *busco a alguien **ordenado**, que no **fume** y que **comparta** los gastos*.$tip$, updated_at = now() where id = '6fb95bc7-1da0-553b-a397-2e2dd96f139b' and body_md = $tip$In Buenos Aires you don't google an electrician, you ask around: **¿conocés a alguien de confianza?** Same for a flatmate: *busco a alguien **ordenado**, que no **fume** y que **comparta** los gastos*.$tip$;
update public.tips set body_md = $tip$Nobody, nothing, no one at all — always the subjunctive, because it doesn't exist: **no conozco a nadie que hable inglés**, **no hay ningún electricista que venga el domingo**.

**Algún, ningún** drop the *-o* before a masculine noun (*algún bar*, *ningún electricista*); **alguna, ninguna** for feminine ones.$tip$, updated_at = now() where id = '81b69635-bcd8-5379-8829-09a71d6fa8c0' and body_md = $tip$Nobody, nothing, no one at all — always the subjunctive, because it doesn't exist: **no conozco a nadie que hable inglés**, **no hay ningún electricista que venga el domingo**. **Algún, ningún** drop the *-o* before a masculine noun (*algún bar*, *ningún electricista*); **alguna, ninguna** for feminine ones.$tip$;
update public.tips set body_md = $tip$**El de** is also for owners and people. With a name it is *someone's*: **el de Lucía** — *Lucía's*; **las de Santi** — *Santi's*.

With people it is *the guy in, the people from*: **el de rojo** — *the guy in red*; **los de arriba** — *the people upstairs*.$tip$, updated_at = now() where id = 'd4f3c5be-cc6e-55ca-b459-5f8dcfb65deb' and body_md = $tip$**El de** is also for owners and people. With a name it is *someone's*: **el de Lucía** — *Lucía's*; **las de Santi** — *Santi's*. With people it is *the guy in, the people from*: **el de rojo** — *the guy in red*; **los de arriba** — *the people upstairs*.$tip$;
update public.tips set body_md = $tip$| the one + a place or a detail | **el de** la vidriera, **la de** la izquierda |
| the one + a verb | **el que** quieras, **la que** te probaste |
| more than one | **los de** allá, **las que** prefieras |

Not chosen yet, so the subjunctive: **el que elijas**; to a group, **elijan los que quieran**.

Don't mind? **Como quieras.**$tip$, updated_at = now() where id = '320367c4-2d82-5aa0-93f3-620a63ee8a89' and body_md = $tip$| the one + a place or a detail | **el de** la vidriera, **la de** la izquierda |
| the one + a verb | **el que** quieras, **la que** te probaste |
| more than one | **los de** allá, **las que** prefieras |

Not chosen yet, so the subjunctive: **el que elijas**; to a group, **elijan los que quieran**. Don't mind? **Como quieras.**$tip$;
update public.tips set body_md = $tip$To stack up reasons: **además** — *besides* — adds one more; **sobre todo** — *above all* — picks the one that counts: *me gusta, **sobre todo** por la gente*.

Porteños also say **más que nada** — *mainly*.$tip$, updated_at = now() where id = '5ca0fdb9-29ca-51ab-ad72-6fc098d18dd4' and body_md = $tip$To stack up reasons: **además** — *besides* — adds one more; **sobre todo** — *above all* — picks the one that counts: *me gusta, **sobre todo** por la gente*. Porteños also say **más que nada** — *mainly*.$tip$;
update public.tips set body_md = $tip$**Por lo menos** — *at least* — finds the good side: *pagan poco, pero **por lo menos** queda cerca*.

**La verdad** — *honestly* — says what you really think: ***la verdad**, no me conviene*.

**Conviene** works like *gustar*: **me conviene** — *it's better for me*; **te conviene llevar paraguas** — *it's a good idea to take an umbrella*.$tip$, updated_at = now() where id = '65ee37e5-32e4-5795-acaa-8f3a37e6f50c' and body_md = $tip$**Por lo menos** — *at least* — finds the good side: *pagan poco, pero **por lo menos** queda cerca*. **La verdad** — *honestly* — says what you really think: ***la verdad**, no me conviene*. **Conviene** works like *gustar*: **me conviene** — *it's better for me*; **te conviene llevar paraguas** — *it's a good idea to take an umbrella*.$tip$;
update public.tips set body_md = $tip$**Seguir** + *-ando / -iendo* is *still doing* or *keep doing*: **sigo laburando ahí**, **¿seguís viviendo en San Telmo?**

With a noun or adjective it is just *still*: **sigo cansado**, **¿seguís con fiebre?**

**Seguir sin** + infinitive is *still not*: **¿seguís sin fumar?**$tip$, updated_at = now() where id = '75167017-65a6-5a49-9a02-adfb338b796b' and body_md = $tip$**Seguir** + *-ando / -iendo* is *still doing* or *keep doing*: **sigo laburando ahí**, **¿seguís viviendo en San Telmo?** With a noun or adjective it is just *still*: **sigo cansado**, **¿seguís con fiebre?** **Seguir sin** + infinitive is *still not*: **¿seguís sin fumar?**$tip$;
update public.tips set body_md = $tip$**Hace un año que vivo acá** — *I've been living here for a year*: Spanish stays in the present. To ask: **¿hace cuánto que vivís acá?**

**Llevar** + time + *-ando / -iendo* says the same: **llevo un año viviendo acá**. Or just a place: **lleva un año acá**. With **sin**: **llevás tres días sin dormir**.

Day to day porteños say **hace… que**.$tip$, updated_at = now() where id = '28e10253-628a-56be-99ee-ea69b41f5587' and body_md = $tip$**Hace un año que vivo acá** — *I've been living here for a year*: Spanish stays in the present. **Llevar** + time + *-ando / -iendo* says the same: **llevo un año viviendo acá**. Or just a place: **lleva un año acá**. With **sin**: **llevás tres días sin dormir**. To ask: **¿hace cuánto que vivís acá?** Day to day porteños say **hace… que**.$tip$;
update public.tips set body_md = $tip$**Estricto, estricta** is *strict*.

*Para salir tenía que pedir **permiso*** — *to go out I had to ask permission*. *Mi vieja **quería que volviera** temprano* — *my mom wanted me back early*.$tip$, updated_at = now() where id = 'f4e91a43-2aa1-517a-8400-3d242229a9a1' and body_md = $tip$**Estricto, estricta** is *strict*. *Para salir tenía que pedir **permiso*** — *to go out I had to ask permission*. *Mi vieja **quería que volviera** temprano* — *my mom wanted me back early*.$tip$;
update public.tips set body_md = $tip$| ellos (preterite) | yo, él, ella | vos |
| salieron | **saliera** | **salieras** |
| dijeron | **dijera** | **dijeras** |
| fueron | **fuera** | **fueras** |
| vinieron | **viniera** | **vinieras** · ellos **vinieran** |

**Mis viejos querían que estudiara una carrera** — the wish is in the past, so the second verb is too. Swap **-ron** for **-ra** and it works for every verb: *estudiar* → **estudiara, estudiaras**.

**Fuera** is both *ser* and *ir*: *quería que fueras feliz* (be), *quería que fueras al asado* (go).$tip$, updated_at = now() where id = 'dc66155e-5c8e-5a82-97d1-5269d9178812' and body_md = $tip$| ellos (preterite) | yo, él, ella | vos |
| salieron | **saliera** | **salieras** |
| dijeron | **dijera** | **dijeras** |
| fueron | **fuera** | **fueras** |
| vinieron | **viniera** | **vinieras** · ellos **vinieran** |

Swap **-ron** for **-ra** and it works for every verb: *estudiar* → **estudiara, estudiaras**. **Fuera** is both *ser* and *ir*: *quería que fueras feliz* (be), *quería que fueras al asado* (go). **Mis viejos querían que estudiara una carrera** — the wish is in the past, so the second verb is too.$tip$;
update public.tips set body_md = $tip$An argument in Buenos Aires is not a fight: **discutimos** a lot and stay friends.

To reject a point, say **¡nada que ver!** — *not at all!* It can also mean *nothing alike* or *nothing to do with it*.

If the other person won't listen: **no seas cabeza dura** — *don't be so stubborn*.$tip$, updated_at = now() where id = '1257cd1c-a853-5a83-8483-1b544c971a7b' and body_md = $tip$An argument in Buenos Aires is a sport, not a fight: **discutimos** a lot and stay friends. To reject a point, say **¡nada que ver!** — *not at all!* (it can also mean *nothing alike* or *nothing to do with it*). If the other person won't listen: **no seas cabeza dura** — *don't be so stubborn*.$tip$;
update public.tips set body_md = $tip$A **caradura** has no shame: never pays, asks for too much, lies and doesn't feel bad about it.

**¡Qué caradura!** — *you've got some nerve!* Between friends it's often a joke.$tip$, updated_at = now() where id = '8e0594ac-1009-51d2-b934-d91eaaa7f29c' and body_md = $tip$A **caradura** has no shame: never pays, asks for too much, lies and doesn't feel bad about it. **¡Qué caradura!** — *you've got some nerve!* Between friends it's often a joke.$tip$;
update public.tips set body_md = $tip$After **como si** and **ni que**, always the *-ra* form: **como si no pasara nada** — *as if nothing were happening*; **como si no me viera** — *as if he didn't see me*; **¡ni que fueras mi viejo!** — *it's not like you're my dad!*

But **hace como que** takes a normal verb: *hace como que no le importa* — *he acts like he doesn't care*.$tip$, updated_at = now() where id = 'c22a6a2e-e9a5-541b-934c-80c0b380fc22' and body_md = $tip$After **como si** and **ni que**, always the *-ra* form: **como si no pasara nada** — *as if nothing were happening*; **como si no me viera** — *as if he didn't see me*; **¡ni que fueras mi viejo!** — *it's not like you're my dad!* But **hace como que** takes a normal verb: *hace como que no le importa* — *he acts like he doesn't care*.$tip$;
update public.tips set body_md = $tip$**Hacerse el** + a describing word is *to pretend, to act*: **me hice** el distraído — *I pretended not to notice*; **te hacés** el sordo — *you act like you can't hear*; **se hace** el canchero — *he shows off, he acts all cool*.

**No te hagas el gil** — *don't play dumb*.

A woman says **la**: *me hice **la** simpática*.$tip$, updated_at = now() where id = '3e245af1-6d97-5dae-8ef1-7ab6426eb575' and body_md = $tip$**Hacerse el** + a describing word is *to pretend, to act*: **me hice** el distraído — *I pretended not to notice*; **te hacés** el sordo — *you act like you can't hear*; **se hace** el canchero — *he shows off, he acts all cool*. **No te hagas el gil** — *don't play dumb*. A woman says **la**: *me hice **la** simpática*.$tip$;
update public.tips set body_md = $tip$**Por un lado… por otro lado** weighs two sides.

**En cambio** — *but, on the other hand* — sets two people or things against each other: *yo laburo, en cambio él no*.$tip$, updated_at = now() where id = '4cb250cf-f227-501f-aefc-fb7775e2e1ca' and body_md = $tip$**Por un lado… por otro lado** weighs two sides. **En cambio** — *but, on the other hand* — sets two people or things against each other: *yo laburo, en cambio él no*.$tip$;
update public.tips set body_md = $tip$**De hecho** — *in fact* — backs up what you just said: *no es caro; de hecho, es barato*.

**En realidad** — *actually* — corrects it: *en realidad no es tan caro*.

**Por eso** — *that's why*: *está cerca, por eso me gusta*.$tip$, updated_at = now() where id = 'b2d04c3b-a80f-5173-ba94-693c40ae1e39' and body_md = $tip$**De hecho** — *in fact* — backs up what you just said: *no es caro; de hecho, es barato*. **En realidad** — *actually* — corrects it: *en realidad no es tan caro*. **Por eso** — *that's why*: *está cerca, por eso me gusta*.$tip$;
update public.tips set body_md = $tip$To give your view, porteños say **para mí** or **me parece que**: *para mí conviene esperar*; *me parece que es caro*.

**¿Qué opinás?** is the natural question; **opino que…** as an answer sounds stiff.

**No me convence** — *I'm not sure about it* — works like *gustar*.$tip$, updated_at = now() where id = 'd0bec188-cd5e-5f50-8ea4-f2be488d6a42' and body_md = $tip$To give your view, porteños say **para mí** or **me parece que**: *para mí conviene esperar*; *me parece que es caro*. **¿Qué opinás?** is the natural question; **opino que…** as an answer sounds stiff. **No me convence** — *I'm not sure about it* — works like *gustar*.$tip$;
update public.tips set body_md = $tip$**Como si no me viera** — *as if he didn't see me*.

**El de la vidriera** — *the one in the window*; **el que quieras** — *whichever you want*.

And pretending: **te hacés el dormido** — *you're pretending to be asleep*.$tip$, updated_at = now() where id = '3f1a2506-1043-5f7c-8f88-5002421068f6' and body_md = $tip$**Como si no me viera** — *as if he didn't see me*. **El de la vidriera** — *the one in the window*; **el que quieras** — *whichever you want*. And pretending: **te hacés el dormido** — *you're pretending to be asleep*.$tip$;
update public.tips set body_md = $tip$For a group: **coman**, **prueben**, **sírvanse**, **no se olviden**.

The *no* doesn't change the verb, only where the pronoun goes: **siéntense** → **no se sienten**; **sírvanse** → **no se sirvan**.$tip$, updated_at = now() where id = 'd5688bae-b7ba-57fc-b691-b14418254954' and body_md = $tip$For a group: **coman**, **prueben**, **sírvanse**, **no se olviden**. The *no* doesn't change the verb, only where the pronoun goes: **siéntense** → **no se sienten**; **sírvanse** → **no se sirvan**.$tip$;
update public.tips set body_md = $tip$**Hace un año que estudio** says the same as **llevo un año estudiando**.

**Seguimos buscando** — *we're still looking*; **volví a empezar** — *I started again*.$tip$, updated_at = now() where id = '85402fa0-6355-51d2-b439-9abb4c3aa126' and body_md = $tip$**Hace un año que estudio** says the same as **llevo un año estudiando**. **Seguimos buscando** — *we're still looking*; **volví a empezar** — *I started again*.$tip$;
update public.tips set body_md = $tip$**Mis viejos querían que estudiara** — the wish is in the past, so the second verb is too.

**Por más que me cueste** — however hard it is. Something not sure or not real yet takes the subjunctive: *por más que llueva, vamos igual*. A fact takes the normal verb: *por más que ahorro, no me alcanza*.$tip$, updated_at = now() where id = 'df9106c3-5bfc-57cc-b3da-428704d81c8e' and body_md = $tip$**Mis viejos querían que estudiara** — the wish is in the past, so the second verb is too. **Por más que me cueste** — however hard it is. Something not sure or not real yet takes the subjunctive: *por más que llueva, vamos igual*. A fact takes the normal verb: *por más que ahorro, no me alcanza*.$tip$;
update public.tips set body_md = $tip$The second verb follows the first into the past:

| now | then |
| Quiero que **vengas**. | Quería que **vinieras**. |
| Te pido que **llames**. | Te pedí que **llamaras**. |
| Me dice que **espere**. | Me dijo que **esperara**. |

The past subjunctive is the *ellos* past with **-ra**: *vinieron* → **viniera**, *hicieron* → **hiciera**. With vos: **vinieras, hicieras, llamaras**.

The *yo* and *él/ella* forms are the same: **quería que viniera** — *wanted me / him / her to come*.$tip$, updated_at = now() where id = '74f663ec-4803-5ba8-bc3c-f12395829ac5' and body_md = $tip$The second verb follows the first into the past:

| now | then |
| Quiero que **vengas**. | Quería que **vinieras**. |
| Te pido que **llames**. | Te pedí que **llamaras**. |
| Me dice que **espere**. | Me dijo que **esperara**. |

The past subjunctive is the *ellos* past with **-ra**: *vinieron* → **viniera**, *hicieron* → **hiciera**. With vos: **vinieras, hicieras, llamaras**. The *yo* and *él/ella* forms are the same: **quería que viniera** — *wanted me / him / her to come*.$tip$;
update public.tips set body_md = $tip$| yo, él, ella | **hubiera** | sabido, venido, ido |
| vos | **hubieras** | llamado, avisado, pensado |

For what didn't happen, both halves: **Si hubiera sabido, te hubiera avisado.** *If I'd known, I'd have told you.* Compare *si supiera* — if I knew (now).

You will also hear **habría** in the second half: *te habría avisado*. Same meaning.$tip$, updated_at = now() where id = '058b9be3-593b-5386-8f79-4af1d6232d6f' and body_md = $tip$| yo, él, ella | **hubiera** | sabido, venido, ido |
| vos | **hubieras** | llamado, avisado, pensado |

For what didn't happen, both halves: **Si hubiera sabido, te hubiera avisado.** *If I'd known, I'd have told you.* You will also hear **habría** in the second half: *te habría avisado*. Same meaning. Compare *si supiera* — if I knew (now).$tip$;
update public.tips set body_md = $tip$**Hubiera** takes the participles *había* does: **sabido, venido, ido, llamado, dicho, hecho**. **Si hubieras venido** — *if you had come*.

On its own it's *would have*: *yo hubiera dicho que sí*, *I would have said yes*.

Or regret, *should have*: **ojalá hubiera estudiado** — *I wish I'd studied*; **¡me hubieras llamado!** — *you should have called me!*$tip$, updated_at = now() where id = 'ff92a735-5164-5693-b16f-d442465b6dbe' and body_md = $tip$**Hubiera** takes the participles *había* does: **sabido, venido, ido, llamado, dicho, hecho**. **Si hubieras venido** — *if you had come*. On its own it's *would have* — *yo hubiera dicho que sí*, *I would have said yes* — or regret, *should have*: **ojalá hubiera estudiado** — *I wish I'd studied*; **¡me hubieras llamado!** — *you should have called me!*$tip$;
update public.tips set body_md = $tip$-ar verbs take **-ado**, the rest **-ido**: **tomado, reservado, quedado, perdido, conseguido**. *Traer* gives **traído**, with an accent.

*Si hubiera tomado un taxi…*, *si me hubiera quedado en casa…*$tip$, updated_at = now() where id = '70cedfaf-7bda-5824-a31d-da0c4fef72bd' and body_md = $tip$-ar verbs take **-ado**, the rest **-ido**: **tomado, reservado, quedado, perdido, conseguido**. *Traer* gives **traído**, with an accent. *Si hubiera tomado un taxi…*, *si me hubiera quedado en casa…*$tip$;
update public.tips set body_md = $tip$When nobody's to blame: **¡qué mala suerte!**

At Ezeiza, the international airport, the board says the flight is **demorado** — *delayed*.$tip$, updated_at = now() where id = 'd338d3db-f4ad-55cc-8eab-5ce4e8d0c03c' and body_md = $tip$When nobody's to blame: **¡qué mala suerte!** And at Ezeiza, the international airport, the board says what every porteño expects: the flight is **demorado** — *delayed*.$tip$;
update public.tips set body_md = $tip$**A ver** — *let's see* — slows an argument down.

**Pensándolo bien** — *on second thought* — is how you change sides: *pensándolo bien, me convenciste* — *on second thought, you convinced me*.

To heat it up again: **sos un exagerado** — *you're being dramatic*.$tip$, updated_at = now() where id = '3a35b239-66d5-5069-9a26-1a37d49b5555' and body_md = $tip$**A ver** — *let's see* — slows an argument down. **Pensándolo bien** — *on second thought* — is how you change sides: *pensándolo bien, me convenciste* — *on second thought, you convinced me*. To heat it up again: **sos un exagerado** — *you're being dramatic*.$tip$;
update public.tips set body_md = $tip$The hardest words in an argument: **me equivoqué** — *I was wrong*. To a friend: **te equivocás** — *you're wrong*.

To admit it: **reconozco que** tenés razón — *I admit you're right* — or just **te doy la razón** — *you're right*.

**En eso** te doy la razón — *you're right about that* — admits only one point.$tip$, updated_at = now() where id = 'b93ba3b3-6a29-5ed3-a84e-307bfd07bb7b' and body_md = $tip$The hardest words in any argument: **me equivoqué** — *I was wrong*. To a friend: **te equivocás** — *you're wrong*. To admit it: **reconozco que** tenés razón — *I admit you're right* — or just **te doy la razón** — *you're right*. **En eso** te doy la razón — *you're right about that* — admits only one point.$tip$;
update public.tips set body_md = $tip$To rent in Buenos Aires you need a **garantía** — *a guarantor*, usually a relative who owns property: *mi papá me sale de garantía* — *my dad is my guarantor*.

No garantía? Foreigners often pay a **seguro de caución** — *rent guarantee insurance* — or take an **alquiler temporario amoblado** — *a furnished short-term rental*.$tip$, updated_at = now() where id = 'b52a18e2-e627-5862-85be-cadba86191d4' and body_md = $tip$To rent in Buenos Aires you need a **garantía** — *a guarantor*, usually a relative who owns property: *mi papá me sale de garantía* — *my dad is my guarantor*. No garantía? Foreigners often pay a **seguro de caución** — *rent guarantee insurance* — or take an **alquiler temporario amoblado** — *a furnished short-term rental*.$tip$;
update public.tips set body_md = $tip$Unlike *a menos que*, **por si** — *just in case* — keeps the normal verb: **llevá paraguas por si llueve**; *te dejo las llaves por si llegás antes*.

Short version: **por las dudas** — *llevá paraguas, por las dudas*.$tip$, updated_at = now() where id = '68fde42c-f91d-5e04-87d5-3b54e0e196fc' and body_md = $tip$Unlike *a menos que*, **por si** — *just in case* — keeps the normal verb. It's what people say for everyday precautions: **llevá paraguas por si llueve**; *te dejo las llaves por si llegás antes*. Short version: **por las dudas** — *llevá paraguas, por las dudas*.$tip$;
update public.tips set body_md = $tip$With **ir**, it grows bit by bit: **voy conociendo gente**, **el bondi se va llenando**, **me voy acostumbrando al ritmo**.

Careful: in **andá llenando la pava**, *andá* is the command of *ir* (go): *start filling the kettle*.$tip$, updated_at = now() where id = 'bbdfc70e-908b-560e-840e-ba134a2e4dc1' and body_md = $tip$With **ir**, it grows bit by bit: **voy conociendo gente**, **el bondi se va llenando**, **me voy acostumbrando al ritmo**. It's the verb of settling in. Careful: in **andá llenando la pava**, *andá* is the command of *ir* (go): *start filling the kettle*.$tip$;
update public.tips set body_md = $tip$When you say who should do it, use **que** + subjunctive: **estaría bueno que te tomes unos días** — *it'd be good if you took a few days off*. For people in general, the infinitive: *estaría bueno **descansar***.

And the push: **¡animate!** — *go for it!*$tip$, updated_at = now() where id = 'ba67d83b-3d37-5a5b-a746-77aba5677455' and body_md = $tip$When you say who should do it, use **que** + subjunctive: **estaría bueno que te tomes unos días** — *it'd be good if you took a few days off*. For people in general, the infinitive: *estaría bueno **descansar***. And the push: **¡animate!** — *go for it!*$tip$;
update public.tips set body_md = $tip$When someone believes your joke: **¡caíste!** — *got you!* — and **qué inocente** — *you're so easy to trick*.

If they complain too much: **estás exagerando** — *you're overdoing it*.

**Te hacés el vivo** — *you're trying to be clever* — is for someone who tries to take advantage of others.$tip$, updated_at = now() where id = '6044efe3-ab79-5a6e-bf86-377632411a37' and body_md = $tip$When someone believes your joke: **¡caíste!** — *got you!* — and **qué inocente** — *you're so easy to trick*. If they complain too much: **estás exagerando** — *you're overdoing it*. **Te hacés el vivo** — *you're trying to be clever* — is for someone who tries to take advantage of others.$tip$;
update public.tips set body_md = $tip$If someone **se calentó** — *got mad* — or **se ofendió** — *took offense* — the joke went too far. **Se picó**: a game or an argument got heated.

An **apodo** (*nickname*) like **el Gordo** or **el Pelado** is friendly among friends; never use one with someone you just met.$tip$, updated_at = now() where id = 'a3dfd806-54f5-516a-a10e-12f1e87569d8' and body_md = $tip$If someone **se calentó** — *got mad* — or **se ofendió** — *took offense* — the joke went too far. **Se picó**: a game or an argument got heated. An **apodo** (*nickname*) like **el Gordo** or **el Pelado** is friendly among friends; never use one with someone you just met.$tip$;
update public.tips set body_md = $tip$When someone lends you something, the conditions come fast: *te lo presto, con tal de que lo **cuides**, no lo **choques** y me lo **devuelvas entero***.

The warning at the end is **si no** — *otherwise*: *si no, no te presto nada más*.$tip$, updated_at = now() where id = '7d0442f0-ca98-54db-82a0-1b2b8177f436' and body_md = $tip$When someone lends you something, the conditions come fast: *te lo presto, con tal de que lo **cuides**, no lo **choques** y me lo **devuelvas entero***. The warning at the end is **si no** — *otherwise*: *si no, no te presto nada más*.$tip$;
update public.tips set body_md = $tip$| Te lo presto, **con tal de que** me lo **devuelvas**. | on condition that |
| Te lo presto, **salvo que** lo **necesite**. | unless |
| Llevá el auto, **siempre y cuando** no lo **choques**. | as long as |
| Llevá plata **por si** la **necesitás**. | just in case |

Every condition takes the subjunctive, except **por si**.

For *vos*: **devuelvas, rompas, cuides, manejes, choques**.$tip$, updated_at = now() where id = 'a59cf449-d6eb-5aaa-991e-068e5d300711' and body_md = $tip$| Te lo presto, **con tal de que** me lo **devuelvas**. | on condition that |
| Te lo presto, **salvo que** lo **necesite**. | unless |
| Llevá el auto, **siempre y cuando** no lo **choques**. | as long as |
| Llevá plata **por si** la **necesitás**. | just in case |

Every condition takes the subjunctive, except **por si**. For *vos*: **devuelvas, rompas, cuides, manejes, choques**.$tip$;
update public.tips set body_md = $tip$| **Deberías** descansar. | You should rest. |
| **Debería** llamarla. | I should call her. |
| **Estaría bueno** juntarnos. | It'd be nice to get together. |
| **Habría que** avisarle. | We ought to let him know. |

All four can take an infinitive. **Estaría bueno** — the softest porteño suggestion — also takes **que** + subjunctive: *estaría bueno que vengas*.

*Tenés que* is stronger — *you have to*; *deberías* is advice.$tip$, updated_at = now() where id = '4f42bca0-b0c9-54dd-894d-af1e0ddee783' and body_md = $tip$| **Deberías** descansar. | You should rest. |
| **Debería** llamarla. | I should call her. |
| **Estaría bueno** juntarnos. | It'd be nice to get together. |
| **Habría que** avisarle. | We ought to let him know. |

All four can take an infinitive. **Estaría bueno** — the softest porteño suggestion — also takes **que** + subjunctive: *estaría bueno que vengas*. *Tenés que* is stronger — *you have to*; *deberías* is advice.$tip$;
update public.tips set body_md = $tip$Day to day porteños give advice with **tendrías que** more than with *deberías*: **tendrías que descansar**.

Also **yo que vos** — *if I were you*: *yo que vos, iría al médico*.

Or a question: **¿por qué no vas al médico?**$tip$, updated_at = now() where id = 'a03e7504-87dd-5fbd-9224-ddc66e92ab9d' and body_md = $tip$Day to day porteños give advice with **tendrías que** more than with *deberías*: **tendrías que descansar**. Also **yo que vos** — *if I were you*: *yo que vos, iría al médico*; or a question: **¿por qué no vas al médico?**$tip$;
update public.tips set body_md = $tip$To stress a promise, porteños say **me aseguró que…** — *he assured me* — or **me juró que…** — *he swore*.

Then **me puso una excusa** — *he gave me an excuse* — and you learn not to **confiar en** (*trust*) the **mentiroso** (*liar*).$tip$, updated_at = now() where id = '5aaa801b-ae20-5109-886b-c9cff7a1d334' and body_md = $tip$To stress a promise, porteños say **me aseguró que…** — *he assured me* — or **me juró que…** — *he swore*. Then **me puso una excusa** — *he gave me an excuse* — and you learn not to **confiar en** (*trust*) the **mentiroso** (*liar*).$tip$;
update public.tips set body_md = $tip$**Me prometiste que ibas a venir** — *you promised me you'd come* (more careful: *que vendrías*).

The ending: **al final no vino** — *in the end he didn't come*.

If he did, he **cumplió** — *kept his word*: *prometió llamar y cumplió*.$tip$, updated_at = now() where id = '3960dc2b-904b-5a87-9ca3-02e2ae3c3968' and body_md = $tip$**Me prometiste que ibas a venir** — *you promised me you'd come* (more careful: *que vendrías*). And the classic ending: **al final no vino** — *in the end he didn't come*. If he did, he **cumplió** — *kept his word*: *prometió llamar y cumplió*.$tip$;
update public.tips set body_md = $tip$Reporting a promise: «voy» → **dijo que iba a venir**; «te llamo» → **dijo que me iba a llamar**. That is what porteños say day to day.

In writing and in careful speech it goes into *would*: **dijo que vendría**, **dijo que me llamaría** — learn to recognize it.

Even shorter in fast speech: **dijo que me llamaba** — *he said he'd call me*.$tip$, updated_at = now() where id = '89ceed83-6de5-5102-bf3b-75fb12b34e48' and body_md = $tip$Reporting a promise: «voy» → **dijo que iba a venir**; «te llamo» → **dijo que me iba a llamar**. That is what porteños say day to day. In writing and in careful speech the same thing goes into *would*: **dijo que vendría**, **dijo que me llamaría** — learn to recognize it. Even shorter in fast speech: **dijo que me llamaba** — *he said he'd call me*.$tip$;
update public.tips set body_md = $tip$People get labels: a **rata** never pays; a **careta** is fake or uptight (or someone who doesn't drink or party); **grasa** is tacky — fine as a joke about a shirt, rude about a person.

**Estar manija** is to be very excited about something: **estoy manija con el recital**. The **cana** is the police.

A friend who backs you **te hace la gamba**; one who talks nonsense **manda fruta**.$tip$, updated_at = now() where id = '361c790d-a0af-59b6-8330-323cd924f6a0' and body_md = $tip$People get labels: a **rata** never pays; a **careta** is fake or uptight (or someone who doesn't drink or party); **grasa** is tacky (a snobbish word: fine as a joke about a shirt, rude about a person). **Estar manija** is to be very excited about something: **estoy manija con el recital**. The **cana** is the police. A friend who backs you **te hace la gamba**; one who talks nonsense **manda fruta**.$tip$;
update public.tips set body_md = $tip$**Trucho** — *fake, dodgy*: *un billete trucho*.

**Zarpado** — *over the top*, for good or bad.

**Bardo** — *a mess, trouble*: *se armó un bardo*.$tip$, updated_at = now() where id = '18957af7-bb3a-5323-bc5e-df1ed71877d6' and body_md = $tip$**Trucho** — *fake, dodgy*: *un billete trucho*. **Zarpado** — *over the top*, for good or bad. **Bardo** — *a mess, trouble*: *se armó un bardo*.$tip$;
update public.tips set body_md = $tip$A **chabón** is a guy, a **mina** a woman — among friends; both sound rude to strangers.

Someone great at what they do is a **groso**.$tip$, updated_at = now() where id = 'c3c9a208-0a25-593c-a6a9-959dfc978b81' and body_md = $tip$A **chabón** is a guy, a **mina** a woman — among friends; both sound rude to strangers. Someone great at what they do is a **groso**.$tip$;
update public.tips set body_md = $tip$**Estoy al horno** — *I'm in big trouble*. **Qué bajón** — *what a shame*.

**Al pedo** — *for nothing, doing nothing*: **fui al pedo**, **estoy al pedo**.

Other *pedo* phrases, among friends only: **ni en pedo**, the flat *no way*; **estar en pedo** — *to be drunk*; **de pedo** — *by pure luck*: *llegué de pedo*.$tip$, updated_at = now() where id = '1db93231-c31c-5630-a9d7-a5c19c863dd1' and body_md = $tip$**Estoy al horno** — *I'm in big trouble*. **Qué bajón** — *what a shame*. **Al pedo** — *for nothing, doing nothing*: **fui al pedo**, **estoy al pedo**. And the flat *no way*: **ni en pedo**. The other *pedo* phrases: **estar en pedo** — *to be drunk*; **de pedo** — *by pure luck*: *llegué de pedo*. Among friends only.$tip$;
update public.tips set body_md = $tip$| Me da **bronca**. | It makes me mad. |
| Me da **vergüenza**. | I'm embarrassed. |
| Me da **lástima**. | I feel sorry (for him). |
| Me da **igual**. | I don't care. |

The cause follows **que** in the subjunctive: **me da bronca que no avise**.

In the past, **me dio**: *me dio vergüenza*.$tip$, updated_at = now() where id = '94b56b2f-e888-5bb6-a0c1-1ec2a11c8235' and body_md = $tip$| Me da **bronca**. | It makes me mad. |
| Me da **vergüenza**. | I'm embarrassed. |
| Me da **lástima**. | I feel sorry (for him). |
| Me da **igual**. | I don't care. |

The cause follows **que** in the subjunctive: **me da bronca que no avise**. In the past, **me dio**: *me dio vergüenza*.$tip$;
update public.tips set body_md = $tip$**Cargar** someone is *to tease, to joke with someone*: **¿me estás cargando?** — *are you joking with me?*

Porteños **cargan** the people they like.$tip$, updated_at = now() where id = '598bffd2-cea9-5528-8b85-1bec66093ce9' and body_md = $tip$**Cargar** someone is *to tease, to joke with someone*: **¿me estás cargando?** — *are you joking with me?* Porteños **cargan** the people they like; being left alone is the bad sign.$tip$;
update public.tips set body_md = $tip$**Lo dije en joda** — *I said it as a joke*. A **broma** is a prank, or something not said seriously.

**Tomar el pelo** is the same game as cargar: **¿me estás tomando el pelo?** — *are you joking with me?*

**¿Me estás jodiendo?** is very casual: friends only.$tip$, updated_at = now() where id = 'e7590664-dc43-56d6-aa5e-259e9a000d5b' and body_md = $tip$**Lo dije en joda** — *I said it as a joke*. **Tomar el pelo** is the same game as cargar: **¿me estás tomando el pelo?** — *are you joking with me?* **¿Me estás jodiendo?** is very casual: friends only. A **broma** is a prank, or something not said seriously.$tip$;
update public.tips set body_md = $tip$| Me **pone nervioso** que llegue tarde. | It annoys me when he's late. |
| Me **enoja** que me **mienta**. | It makes me angry that he lies to me. |
| Me **alegra** que vengas. | I'm glad you're coming. |
| Me da bronca que **cancele**. | It makes me mad that he cancels. |

Feeling first, then **que** + subjunctive. If it's you doing it, no *que*: *me enoja **llegar** tarde*.

**Nervioso** here is often *annoyed* or *tense*, not only *nervous*.$tip$, updated_at = now() where id = '71b73b1e-ae85-5fc6-9381-abc5a40d2806' and body_md = $tip$| Me **pone nervioso** que llegue tarde. | It annoys me when he's late. |
| Me **enoja** que me **mienta**. | It makes me angry that he lies to me. |
| Me **alegra** que vengas. | I'm glad you're coming. |
| Me da bronca que **cancele**. | It makes me mad that he cancels. |

Feeling first, then **que** + subjunctive. **Nervioso** here is often *annoyed* or *tense*, not only *nervous*. If it's you doing it, no *que*: *me enoja **llegar** tarde*.$tip$;
update public.tips set body_md = $tip$A WhatsApp complaint: **me clavó el visto** — *he read my message and didn't answer*.

The friend who forgets everything is **re colgado**.$tip$, updated_at = now() where id = 'b1156beb-77bd-582d-8612-8edf301649c5' and body_md = $tip$The porteño complaint of the WhatsApp age: **me clavó el visto** — *he read my message and didn't answer*. And the friend who forgets everything is **re colgado**.$tip$;
update public.tips set body_md = $tip$**Ni ahí** — *no way, not even close* — is a strong porteño no, also to a question like **¿estás cansado?**.

**Tal cual** — *exactly* — is how they agree.$tip$, updated_at = now() where id = '8b11e00f-7cc7-55ba-8620-af5bb3193910' and body_md = $tip$**Ni ahí** — *no way, not even close* — is a strong porteño no, also to a question like **¿estás cansado?**. **Tal cual** — *exactly* — is how they agree.$tip$;
update public.tips set body_md = $tip$**Es cualquiera** — *that's nonsense*; **dijo cualquiera** — *he talked nonsense*; **hizo cualquiera** — *he did something stupid*.

**Flasheaste** — *you're imagining things*.

A **¡qué lindo!** can be sincere, or ironic when the rain starts.$tip$, updated_at = now() where id = '6f7a19a0-4270-5d35-a772-7ff0d5c9059c' and body_md = $tip$**Es cualquiera** — *that's nonsense*; **dijo cualquiera** — *he talked nonsense*; **hizo cualquiera** — *he did something stupid*. **Flasheaste** — *you're imagining things*. And a **¡qué lindo!** can be sincere, or ironic when the rain starts.$tip$;
update public.tips set body_md = $tip$These hurt. **Pelotudo** is stronger than *boludo*; only close friends say it as a joke. A **forro** is a nasty person.

An **hinchapelotas** won't stop bothering you: *¡no rompas las bolas!* — often just *¡no rompas!* **Andá a cagar** is *go to hell*: a joke between friends, a fight with a stranger.

**Hijo de puta** is one of the strongest insults — but shouted at a great goal it is admiration.$tip$, updated_at = now() where id = 'da8de45b-718a-598c-b598-e48991bb7640' and body_md = $tip$These hurt. **Pelotudo** is stronger than *boludo*; only close friends say it as a joke. A **forro** is a nasty person. An **hinchapelotas** won't stop bothering you: *¡no rompas las bolas!* — often just *¡no rompas!* **Andá a cagar** is *go to hell*: a joke between friends, a fight with a stranger. **Hijo de puta** is one of the strongest insults — but shouted at a great goal it is admiration.$tip$;
update public.tips set body_md = $tip$**¿Conocés a alguien que arregle bicis?** — don't know if they exist, subjunctive.

**No hay nadie que cocine así** — they don't, subjunctive again.

**Me pone nervioso que cancele** — a feeling about it, subjunctive too.$tip$, updated_at = now() where id = '33981f7b-d27c-5cf1-b072-16d796906004' and body_md = $tip$**¿Conocés a alguien que arregle bicis?** — don't know if they exist, subjunctive. **No hay nadie que cocine así** — they don't, subjunctive again. **Me pone nervioso que cancele** — a feeling about it, subjunctive too.$tip$;
update public.tips set body_md = $tip$**Deberíamos juntarnos**, **deberían pagarte más**, **estaría bueno que te tomes unos días**.

And when they're scared: **¡animate!**$tip$, updated_at = now() where id = 'bfd29eb6-ddb0-522c-86de-48732917857f' and body_md = $tip$**Deberíamos juntarnos**, **deberían pagarte más**, **estaría bueno que te tomes unos días**. And when they're scared: **¡animate!**$tip$;
update public.tips set body_md = $tip$**Ando buscando laburo** — *I've been looking for work*: **ando** + *-ando* is these days.

**Estamos por arrancar** — *we're about to start*.

**Le cae bien a todo el mundo** — *everybody likes him*; **a ese no lo aguanto** — *I can't stand that guy*.$tip$, updated_at = now() where id = '09c42605-395e-554f-8c40-6ffd14be9063' and body_md = $tip$**Ando buscando laburo** — *I've been looking for work*: **ando** + *-ando* is these days. **Estamos por arrancar** — *we're about to start*. **Le cae bien a todo el mundo** — *everybody likes him*; **a ese no lo aguanto** — *I can't stand that guy*.$tip$;
update public.tips set body_md = $tip$The small talk of bills: **aumentaron la luz y el gas** — *electricity and gas went up*; **el boleto subió** — *the fare went up*.

Also **no llego a fin de mes** — *I can't make ends meet*.$tip$, updated_at = now() where id = '97c5fbb3-3689-5121-8618-b57a9378bab5' and body_md = $tip$The small talk of bills: **aumentaron la luz y el gas** — *electricity and gas went up*; **el boleto subió** — *the fare went up*; **no llego a fin de mes** — *I can't make ends meet*: the money runs out before the month does.$tip$;
update public.tips set body_md = $tip$**Con tal de que me lo devuelvas** — *as long as you give it back* — and **salvo que lo necesite** — *unless I need it* — take the subjunctive.

On the door: **se aceptan tarjetas**, **se hacen envíos**.$tip$, updated_at = now() where id = '2d79110f-684e-5df1-978a-1dbfe56b6cc3' and body_md = $tip$**Con tal de que me lo devuelvas** — *as long as you give it back* — and **salvo que lo necesite** — *unless I need it* — take the subjunctive. On the door: **se aceptan tarjetas**, **se hacen envíos**.$tip$;
update public.tips set body_md = $tip$What he swore he'd do, told later — the everyday way: **dijo que iba a pasar**, **me aseguró que me lo iba a devolver**.

More careful, and in writing: **dijo que pasaría**, **me lo devolvería**.

Two have a changed stem: *poner* → **pondría**, *venir* → **vendría**.$tip$, updated_at = now() where id = 'bf2dc98a-75d6-56a8-a981-915fd847826c' and body_md = $tip$What he swore he'd do, told later — the everyday way: **dijo que iba a pasar**, **me aseguró que me lo iba a devolver**. More careful, and in writing: **dijo que pasaría**, **me lo devolvería**. Two have a changed stem: *poner* → **pondría**, *venir* → **vendría**.$tip$;
update public.tips set body_md = $tip$Most swearing is aimed at the situation, not at a person: **¡la puta madre!**, **¡la concha de la lora!**, **¡mierda!**, **¡carajo!**, **¡qué cagada!**

A bad day is *un día de mierda*. **Me chupa un huevo** is *I don't give a shit*.

Two are not insults, just very informal: **una boludez** is something silly or small, and **me cagué de risa** means *I laughed my ass off*.$tip$, updated_at = now() where id = '312fb178-1035-5102-b74c-28c2d9e736b2' and body_md = $tip$Most swearing is aimed at the situation, not at a person: **¡la puta madre!**, **¡la concha de la lora!**, **¡mierda!**, **¡carajo!**, **¡qué cagada!** A bad day is *un día de mierda*. **Me chupa un huevo** is *I don't give a shit*. Two are not insults, just very informal: **una boludez** is something silly or small, and **me cagué de risa** means *I laughed my ass off* — I laughed a lot.$tip$;
update public.tips set body_md = $tip$**Justo** makes a complaint: **justo hoy** — *today of all days*.

And **ya fue** — *forget it, it's done* — closes the subject: *¿no vino? Ya fue.*$tip$, updated_at = now() where id = 'c84b6903-c8d1-568f-89b7-c98c75aef784' and body_md = $tip$**Justo** makes a complaint: **justo hoy** — *today of all days*. And **ya fue** — *forget it, it's done* — closes the subject: *¿no vino? Ya fue.*$tip$;
update public.tips set body_md = $tip$Said slowly, **sí, claro** means *yeah, right*. The **tono** — *tone* — does the work.

**¡Qué novedad!** — *what a surprise* — is for the bondi that's late again; **¡lo que faltaba!** — *that's all we needed* — for the rain on top of it.

The everyday ones: **qué raro**, said flat — *¿llegó tarde? Qué raro.* — and **mirá vos** — *well, look at that*.$tip$, updated_at = now() where id = 'bb2b8f8c-6dae-5623-9c59-9a450c30bb65' and body_md = $tip$Said slowly, **sí, claro** means *yeah, right*. **¡Qué novedad!** — *what a surprise* — is for the bondi that's late again; **¡lo que faltaba!** — *that's all we needed* — for the rain that starts on top of it. The everyday ones: **qué raro**, said flat — *¿llegó tarde? Qué raro.* — and **mirá vos** — *well, look at that*. The **tono** — *tone* — does the work.$tip$;
update public.tips set body_md = $tip$**Ni a palos** — *no way, not a chance*. For a shrug: **dale que va** — *good enough, let's go*.

When something's awful: **está de terror**; when it's perfect: **impecable**.$tip$, updated_at = now() where id = 'e2b47401-0cfc-5d9f-9194-4ecbb72de555' and body_md = $tip$**Ni a palos** — *no way, not a chance*. And for a shrug: **dale que va** — *good enough, let's go*. When something's awful: **está de terror**; when it's perfect: **impecable**.$tip$;
update public.tips set body_md = $tip$**Ir** + *-ando, -iendo* is something happening bit by bit: **voy entendiendo** — *I'm starting to get it*; **se va llenando** — *it's filling up*.

**De a poco** — *little by little* — goes with it.$tip$, updated_at = now() where id = '5ea0dcc7-a99f-5036-9aa2-629ab7f8b899' and body_md = $tip$**Ir** + *-ando, -iendo* is something happening bit by bit: **voy entendiendo** — *I'm starting to get it*; **se va llenando** — *it's filling up*. **De a poco** — *little by little* — goes with it.$tip$;
update public.tips set body_md = $tip$**Cualquier duda, avisame** — *any questions, let me know*. It closes an email.

What's still to do is **pendiente**: **me quedó pendiente el archivo**.

If it needs a meeting, you **agendás** it.$tip$, updated_at = now() where id = '4c901404-ced9-54c4-a1c0-b042f20adc93' and body_md = $tip$**Cualquier duda, avisame** — *any questions, let me know* — closes half the emails in Buenos Aires. What's still to do is **pendiente**: **me quedó pendiente el archivo**. And if it needs a meeting, you **agendás** it.$tip$;
update public.tips set body_md = $tip$A story has signposts: **como te decía** — *like I was saying* — brings it back; **el tema es que** — *the thing is* — gets to the point.

Two more: **a todo esto** — *by the way* — goes off on a side road; **hablando de** jumps to the next story.$tip$, updated_at = now() where id = '3cb8c2d5-f639-5cac-8a91-fecea363b8c9' and body_md = $tip$A porteño story wanders, so it has signposts: **como te decía** — *like I was saying* — brings it back; **el tema es que** — *the thing is* — gets to the point; **a todo esto** — *by the way* — goes off on a side road; **hablando de** jumps to the next story.$tip$;
update public.tips set body_md = $tip$**Y bueno** is a shrug — *oh well, what can you do*: **y bueno, así es**.

**Ah, me olvidaba** — *oh, I almost forgot* — adds the best part at the end.

A story can be **larga** — *long* — or **corta** — *short*.$tip$, updated_at = now() where id = 'c94d2e69-9d48-539a-a1af-33cdcb771363' and body_md = $tip$**Y bueno** is the porteño shrug — *oh well, what can you do*: **y bueno, así es**. **Ah, me olvidaba** — *oh, I almost forgot* — adds the best part at the end. A story can be **larga** — *long* — or **corta** — *short*.$tip$;
update public.tips set body_md = $tip$The porteño sign-off, in emails and out: **cualquier cosa, avisame** — *if anything comes up, let me know*.

A **consulta** is a question you send; a **respuesta**, the reply.$tip$, updated_at = now() where id = '18cdbaf0-af94-565c-b117-e443aa6c4b17' and body_md = $tip$The porteño sign-off, in emails and out of them: **cualquier cosa, avisame** — *if anything comes up, let me know*. A **consulta** is a question you send; a **respuesta**, the reply.$tip$;
update public.tips set body_md = $tip$Most work emails open with **Hola, Juan:** or **Buen día, Sofi:** and close with **Saludos**, **Abrazo** or **Un abrazo**.

**Estimado Juan** / **Estimada Sofi** is the formal exception. So is **quedo atento** (a woman: **quedo atenta**) — *I look forward to your reply*.

**Te adjunto** is *I'm attaching*; **desde ya, gracias** is *thanks in advance*.$tip$, updated_at = now() where id = 'e06c9bfd-3dd2-5980-a26d-595cd6ecb929' and body_md = $tip$Most work emails open with **Hola, Juan:** or **Buen día, Sofi:** and close with **Saludos**, **Abrazo** or **Un abrazo**. **Estimado Juan** / **Estimada Sofi** is the formal exception, and so is **quedo atento** (a woman: **quedo atenta**) — *I look forward to your reply*. **Te adjunto** is *I'm attaching*: *te adjunto mi CV*; **desde ya, gracias** is *thanks in advance*.$tip$;
update public.tips set body_md = $tip$**Estoy harto** — *I'm fed up*; porteños go further: **estoy podrido** — literally *rotten*.

Both take **de** + a thing or infinitive: **harta del tránsito**, **podrido del ruido**, **harta de estudiar**. Same with **me cansé de esperar** — *I got tired of waiting*.

When someone or something else does it: **de que** + subjunctive — *estoy podrido de que el ascensor esté roto*.$tip$, updated_at = now() where id = 'aba5baad-8a36-5ee9-8293-ce942fa3dc14' and body_md = $tip$**Estoy harto** — *I'm fed up*; porteños go further: **estoy podrido** — literally *rotten*. Both take **de** + a thing or an infinitive: **harta del tránsito**, **podrido del ruido**, **harta de estudiar**. Same with **me cansé de esperar** — *I got tired of waiting*. When someone or something else is doing it: **de que** + subjunctive — *estoy podrido de que el ascensor esté roto*.$tip$;
update public.tips set body_md = $tip$Before you go, you check: **fijate si abren el feriado**, **me fijo si hay turno**, **preguntale si tienen stock**.

The **si** is *whether*; the verb after it stays normal.$tip$, updated_at = now() where id = '9435d1b3-0301-576e-85fc-0c503c472aab' and body_md = $tip$Before you cross the city, you check: **fijate si abren el feriado**, **me fijo si hay turno**, **preguntale si tienen stock**. The **si** is *whether*; the verb after it stays normal.$tip$;
update public.tips set body_md = $tip$| the question | asking or telling it |
| «¿Tienen stock?» | **Preguntale si** tienen stock. |
| «¿Abren el feriado?» | **Me fijo si** abren el feriado. |
| «¿Tenés turno?» | **Me preguntaron si** tenía turno. |
| «¿Está disponible?» | No sé **si** está disponible. |

**Si** is *whether*, and the verb after it is normal.

Told later, it moves into the past: *tenés* → *tenía*. If it is still true now, the present is fine too: *me preguntaron si soy argentino*.$tip$, updated_at = now() where id = 'b1075fbe-1362-54f2-9d90-7a83352ec36b' and body_md = $tip$| the question | asking or telling it |
| «¿Tienen stock?» | **Preguntale si** tienen stock. |
| «¿Abren el feriado?» | **Me fijo si** abren el feriado. |
| «¿Tenés turno?» | **Me preguntaron si** tenía turno. |
| «¿Está disponible?» | No sé **si** está disponible. |

**Si** is *whether*, and the verb after it is the normal one. Told later, it moves into the past: *tenés* → *tenía*. If it is still true now, the present is fine too: *me preguntaron si soy argentino*.$tip$;
update public.tips set body_md = $tip$Other persons follow: **nos pidió que llegáramos temprano** — *she asked us to get there early*; **les dijo que trajeran algo** — *he told them to bring something*.

**Encargar** is to give someone an errand: **me encargó que le llevara el pan** — *she asked me to bring her the bread*.$tip$, updated_at = now() where id = '2bf931e1-9673-5e55-aa7e-198aafe4ff0d' and body_md = $tip$The other persons follow: **nos pidió que llegáramos temprano** — *she asked us to get there early*; **les dijo que trajeran algo** — *he told them to bring something*. **Encargar** is to give someone an errand: **me encargó que le llevara el pan** — *she asked me to bring her the bread*.$tip$;
update public.tips set body_md = $tip$Passing on a message ends with who it's from: **saludos de parte de mi vieja**.

An order from home, told later: «Portate bien» → **me dijo que me portara bien**.$tip$, updated_at = now() where id = '69332cd2-1d6f-5d55-9be4-d460fab44716' and body_md = $tip$Passing on a message ends with who it's from: **saludos de parte de mi vieja**. And the classic order from home, told later: «Portate bien» → **me dijo que me portara bien**.$tip$;
update public.tips set body_md = $tip$More verbs take a **la** that points at nothing: **me la juego** — *I'll go for it*; **la rompe** — *she's amazing at it*.

Then **la pifié** — *I blew it* — and its opposite, **la pegaste** — *you got it right*.

**Me las tomo** — *I'm out of here*. And **se la agarró conmigo** — *he took it out on me*. To make someone stop: **¡cortala!** — *cut it out!*$tip$, updated_at = now() where id = '22bb24f8-8694-59d9-9551-1eae8071c382' and body_md = $tip$More verbs that take a **la** pointing at nothing: **me la juego** — *I'll go for it*; **la pifié** — *I blew it* — and its opposite, **la pegaste** — *you got it right*; **la rompe** — *she's amazing at it*; **se la agarró conmigo** — *he took it out on me* (he got angry at me, though it wasn't my fault). **Me las tomo** — *I'm out of here*. And to make someone stop: **¡cortala!** — *cut it out!*$tip$;
update public.tips set body_md = $tip$**Insistió en que fuera** — *she insisted I go*. **Me sugirió que la llamara** — *he suggested I call her*.

As in *me pidió que trajera*, the verb after **que** is past subjunctive (*fuera, llamara*).$tip$, updated_at = now() where id = '31e9d7c0-8868-567b-a709-775f9c735a92' and body_md = $tip$**Insistió en que fuera** — *she insisted I go*. **Me sugirió que la llamara** — *he suggested I call her*. As in *me pidió que trajera*, the verb after **que** is in the past subjunctive (*fuera, llamara*).$tip$;
update public.tips set body_md = $tip$A yes/no question told later uses **si** (*whether*). *¿Venís?* → **me preguntó si venía**; *¿Abre hoy?* → **no sé si abre hoy**.

Normal verb, no subjunctive. Told in the past, it usually moves back: *venís* → *venía*.$tip$, updated_at = now() where id = 'e4034940-c3b8-5953-be43-6edfb0a0421a' and body_md = $tip$A yes/no question told later uses **si** (*whether*): *¿Venís?* → **me preguntó si venía**; *¿Abre hoy?* → **no sé si abre hoy**. The verb is normal, no subjunctive. Told in the past, it usually moves back: *venís* → *venía*.$tip$;
update public.tips set body_md = $tip$**A ver si** is *let's see if*, and often a hope: **a ver si nos juntamos** — *we should get together sometime*.

To find something out, porteños **averiguan**.

After **dudo que**, the verb goes in the subjunctive: **dudo que venga** — *I doubt he'll come*.$tip$, updated_at = now() where id = 'ec1122a7-6b09-5324-b5c9-305542cf61e1' and body_md = $tip$**A ver si** is *let's see if* — and, just as often, a hope: **a ver si nos juntamos** — *we should get together sometime*. To find something out, porteños **averiguan**. After **dudo que**, the verb goes in the subjunctive: **dudo que venga** — *I doubt he'll come*.$tip$;
update public.tips set body_md = $tip$The moment you snap is in the past: **me harté** — *I got fed up*; porteños say **me pudrí**: **me pudrí y me fui**.

Both take **de** + infinitive: **me pudrí de esperar**.

One word: **¡basta!**$tip$, updated_at = now() where id = '7b596798-1504-5e3c-840b-ce62a7046665' and body_md = $tip$The moment you snap is in the past: **me harté** — *I got fed up*; porteños say **me pudrí**: **me pudrí y me fui**. Both take **de** + infinitive: **me pudrí de esperar**. Then one word: **¡basta!**$tip$;
update public.tips set body_md = $tip$| **Me merezco** un aumento. | I deserve a raise. |
| **Me lo merezco.** | I deserve it. |
| **Te lo merecés.** | You deserve it. |
**Merecerse** usually keeps its pronoun in speech; bare *merezco* is correct but more formal.

**Valorar** is *to value*: *en mi laburo no me valoran* — *at my job they don't value me*.$tip$, updated_at = now() where id = '5f8b9622-8605-59be-9a2c-df64d8920c28' and body_md = $tip$| **Me merezco** un aumento. | I deserve a raise. |
| **Me lo merezco.** | I deserve it. |
| **Te lo merecés.** | You deserve it. |
**Merecerse** usually comes with its pronoun in speech: the bare *merezco* is correct but more formal. **Valorar** is *to value*: *en mi laburo no me valoran* — *at my job they don't value me*.$tip$;
update public.tips set body_md = $tip$**Enterarse** for everyone: **nos enteramos tarde** — *we found out late*; **se enteraron todos** — *everybody found out*.

The storyteller adds **¡ni te cuento!** — *you don't even want to know*.$tip$, updated_at = now() where id = '53bd20f9-2fb9-501c-82cb-d4a58c78a952' and body_md = $tip$**Enterarse** for everyone: **nos enteramos tarde** — *we found out late*; **se enteraron todos** — *everybody found out*. The one who tells it best adds **¡ni te cuento!** — *you don't even want to know*.$tip$;
update public.tips set body_md = $tip$The twist arrives **de golpe** — *all of a sudden* — or **de la nada** — *out of nowhere*.

**Para colmo** stacks one more thing on top, like **encima**: **para colmo, llovía**. **Por lo visto** — *apparently* — is for when you weren't there.

When someone loses a job, people say **lo echaron**; **lo despidieron** is the word of the news and of HR.$tip$, updated_at = now() where id = 'c1cd73a8-a9a9-5e11-a3b5-76f0696539c4' and body_md = $tip$The twist arrives **de golpe** — *all of a sudden* — or **de la nada** — *out of nowhere*. **Para colmo** stacks one more thing on top, like **encima**: **para colmo, llovía**. **Por lo visto** — *apparently* — is what you say when you weren't there. When someone loses a job, people say **lo echaron**; **lo despidieron** is the word of the news and of HR.$tip$;
update public.tips set body_md = $tip$The **plazo** moves: they **postergaron la fecha** — *pushed the date back* — or, worse, **la adelantaron**.

Then it's **horas extra** until **entregamos** — *we hand it in* (also *we handed it in*).

The boss asks: **¿ya lo entregaste?**$tip$, updated_at = now() where id = '667abe18-109e-562c-b974-4938f7888ca3' and body_md = $tip$The **plazo** moves: they **postergaron la fecha** — *pushed the date back* — or, worse, **la adelantaron**. Then it's **horas extra** until **entregamos** — *we hand it in* (also *we handed it in*). And the boss asks: **¿ya lo entregaste?**$tip$;
update public.tips set body_md = $tip$Errands told later: **me pidió que comprara pan**, **nos dijo que llegáramos temprano**, **les pidió que trajeran algo**.

A question: **preguntale si tienen stock**.$tip$, updated_at = now() where id = 'd08e315b-8334-5c62-8039-37fca7782609' and body_md = $tip$The errand told later: **me pidió que comprara pan**, **nos dijo que llegáramos temprano**, **les pidió que trajeran algo**. The question: **preguntale si tienen stock**.$tip$;
update public.tips set body_md = $tip$Older neighbors like **don José** and **doña Marta** still get vos, but warmly: **cómo no** — *of course*; **faltaba más** — *of course, don't mention it*.

And **dejá, te doy una mano** — *leave it, I'll give you a hand*.$tip$, updated_at = now() where id = 'e05a6f2c-db31-58b3-91ea-a33abfd335c9' and body_md = $tip$With older neighbors like **don José** and **doña Marta** you still say vos, but warmly: **cómo no** — *of course*; **faltaba más** — *of course, don't mention it*; **dejá, te doy una mano** — *leave it, I'll give you a hand*.$tip$;
update public.tips set body_md = $tip$**Te reenvío el archivo** — *I'm forwarding you the file*; **cualquier duda, avisame** — *any questions, let me know*.

The story: **de golpe** — *all of a sudden*; **para colmo** — *to top it all off*; **por lo visto** — *apparently*.$tip$, updated_at = now() where id = '915c227f-3a59-5eb0-8e94-a3be77cd232d' and body_md = $tip$**Te reenvío el archivo** — *I'm forwarding you the file*; **cualquier duda, avisame** — *any questions, let me know*. And the story: **de golpe** — *all of a sudden*; **para colmo** — *to top it all off*; **por lo visto** — *apparently*.$tip$;
update public.tips set body_md = $tip$**Resulta que** — *it turns out* — is where a story takes its turn.

**Encima** — *on top of that* — makes it worse: **encima, llovía**.

**Total** shrugs it off: **total, nadie se dio cuenta**.$tip$, updated_at = now() where id = 'b09d13bc-f73f-5448-80bf-e1a0406e6cf9' and body_md = $tip$**Resulta que** — *it turns out* — is how a porteño story takes its turn. **Encima** — *on top of that* — makes it worse: **encima, llovía**. **Total** shrugs it off: **total, nadie se dio cuenta**.$tip$;
update public.tips set body_md = $tip$**Me la banco** — *I can handle it*; **se la bancó** — *she put up with it*.

For what you can't stand, drop the **la** and name it: *no me banco este frío* — *I can't stand this cold*; *no me banco a mi jefe* — *I can't stand my boss*.$tip$, updated_at = now() where id = '24f0169c-f457-5099-922f-4a497b84e8df' and body_md = $tip$**Me la banco** — *I can handle it*; **se la bancó** — *she put up with it*. To say you can't stand something, drop the **la** and name it: *no me banco este frío* — *I can't stand this cold*; *no me banco a mi jefe* — *I can't stand my boss*.$tip$;
update public.tips set body_md = $tip$Before you **negociar**, know what you're owed.

A job **en blanco** is *on the books*, with aguinaldo (an extra month's pay) and obra social (health insurance); **en negro** is *off the books*.

With inflation, the regular **ajuste** — *the pay adjustment* — is the first thing you **exigir**.$tip$, updated_at = now() where id = '906103c0-8825-51f0-8f33-0bb01926b4d9' and body_md = $tip$Before you **negociar**, know what you're owed. A job **en blanco** is *on the books*, with aguinaldo (an extra month's pay) and obra social (health insurance); **en negro** is *off the books*. And with inflation, the regular **ajuste** — *the pay adjustment* — is the first thing you **exigir**.$tip$;
update public.tips set body_md = $tip$**Me quejo** — *I complain*; **renegar** is the Argentine *to struggle with something, to grumble*.

For a habit: **siempre reniego con el wifi**. For something going on now: **estoy renegando con el trámite del DNI**.

Someone who's **agotado** is *exhausted*; the **estrés** is why. The traffic? **Un caos**.$tip$, updated_at = now() where id = '6f45a3bc-6d31-5a43-8fae-bde8329e1e96' and body_md = $tip$**Me quejo** — *I complain*; **renegar** is the Argentine *to struggle with something, to grumble*. For a habit: **siempre reniego con el wifi**. For something going on now: **estoy renegando con el trámite del DNI**. Someone who's **agotado** is *exhausted*; the **estrés** is why. And the traffic? **Un caos**.$tip$;
update public.tips set body_md = $tip$**Sobre la hora** — *right at the deadline, at the very last minute*.

First a **borrador** — *a draft* — then you **corregir** it, and only then the **informe** or the **presentación**.

**¿Avanzaron?** — *any progress?*$tip$, updated_at = now() where id = '5b512731-476b-5b5f-8876-82ce3e6b19a4' and body_md = $tip$**Sobre la hora** — *right at the deadline, at the very last minute* — is how most porteño projects get done. First a **borrador** — *a draft* — then you **corregir** it, and only then the **informe** or the **presentación**. **¿Avanzaron?** — *any progress?*$tip$;
update public.tips set body_md = $tip$**Te la hago corta** — *to keep it short*.

**La cuestión es que** — *the point is* — gets to what matters, like **el tema es que**; **en fin** closes it.$tip$, updated_at = now() where id = '534e2bd7-f308-543e-af35-642336a8e744' and body_md = $tip$**Te la hago corta** — *to keep it short* — is usually followed by a long story. **La cuestión es que** — *the point is* — gets to what matters, like **el tema es que**; **en fin** closes it.$tip$;
update public.tips set body_md = $tip$**Y nada** is *so, yeah*: it fills the pause at the end of a story.

**Al toque** — *right away*: **me contestó al toque**.$tip$, updated_at = now() where id = '6fd250c0-fa1b-50b6-b892-4e0ec3d17d95' and body_md = $tip$**Y nada** is the porteño *so, yeah*: it fills the pause at the end of a story. **Al toque** — *right away*: **me contestó al toque**.$tip$;
update public.tips set body_md = $tip$Two fixed phrases: **a las apuradas** — *in a rush* — and **a la larga** — *in the long run*.

Here *las* and *la* are just *the*, not the idiom's *la*: *salí a las apuradas y me olvidé las llaves*.$tip$, updated_at = now() where id = '64ddc740-cba3-541e-b01d-38bbf52e9139' and body_md = $tip$Two fixed phrases to learn whole: **a las apuradas** — *in a rush* — and **a la larga** — *in the long run*. Here *las* and *la* are just *the*, not the idiom's *la*: *salí a las apuradas y me olvidé las llaves*.$tip$;
update public.tips set body_md = $tip$Verbs for the reply: **te reenvío el mail** — *I'm forwarding you the email*; **te paso el link**; **te pongo en copia** — *I'm cc'ing you*.

**Revisé la planilla** — *I went through the spreadsheet*.$tip$, updated_at = now() where id = '0621b05f-4812-5df1-be12-84eb5d8660c1' and body_md = $tip$The reply has its own verbs: **te reenvío el mail** — *I'm forwarding you the email*; **te paso el link**; **te pongo en copia** — *I'm cc'ing you*. **Revisé la planilla** — *I went through the spreadsheet*.$tip$;
update public.tips set body_md = $tip$A past that went differently, and what it would mean now: **si hubiera ahorrado** (then), **ahora tendría un depto** (now).

The first half is **hubiera** + participle; the second, the plain conditional.

**A esta altura** — *by now* — goes in the *now* half: **a esta altura estaría jubilado**.$tip$, updated_at = now() where id = 'a0157ee6-1047-52d7-bc9d-1f2a42b1f1d5' and body_md = $tip$A past that went differently, and what it would mean today: **si hubiera ahorrado** (then), **ahora tendría un depto** (now). The first half is **hubiera** + participle; the second is the plain conditional. **A esta altura** — *by now* — goes in the *now* half: **a esta altura estaría jubilado**.$tip$;
update public.tips set body_md = $tip$The morning after, what still runs: **el subte funciona con normalidad**, or **suspendieron el servicio**.

When the strike ends: **levantaron el paro** or **se levantó el paro**.

**Suspender** is for classes, an exam, a march or a service.$tip$, updated_at = now() where id = 'ee61df72-edc1-551c-8a85-ffd52d0c70ad' and body_md = $tip$The morning after, the question is what still runs: **el subte funciona con normalidad**, or **suspendieron el servicio**. When the strike itself ends, the phrase is **levantaron el paro** or **se levantó el paro**. **Suspender** is for classes, an exam, a march or a service.$tip$;
update public.tips set body_md = $tip$Carlos **Gardel** died in 1935, yet porteños say he **canta mejor cada día**.

A tango's **letra** — *lyrics* — is usually about **nostalgia**: the barrio, the mother, the woman who left.$tip$, updated_at = now() where id = '1b8d8876-164f-505f-a992-fd2a7dad8f99' and body_md = $tip$Carlos **Gardel** died in 1935, and porteños still say he **canta mejor cada día**. A tango's **letra** — *lyrics* — is usually about **nostalgia**: the barrio, the mother, the woman who left.$tip$;
update public.tips set body_md = $tip$**Fue clausurado** is the event — *it got closed down*; **está clausurado** is the result — *it is closed now*.

The ending matches the thing: **el boliche fue clausurado**, **la obra fue clausurada**, **la cancha está clausurada**.$tip$, updated_at = now() where id = '22681126-952e-59e5-97e2-12d780e48738' and body_md = $tip$**Fue clausurado** is the event — *it got closed down*; **está clausurado** is the result — *it is closed now*. The ending agrees with the thing: **el boliche fue clausurado**, **la obra fue clausurada**, **la cancha está clausurada**.$tip$;
update public.tips set body_md = $tip$The news says **fue construido**; in conversation people flip it: *construyeron el puente*, *los detuvieron*.

Or they use **se**: **el puente se inauguró ayer**, **se construyó hace un siglo**.

For the future the news says **será inaugurada** — *will be opened*; people say *la van a inaugurar*.$tip$, updated_at = now() where id = '5f88a88d-8066-58cb-99c8-edeb9d5d9112' and body_md = $tip$The news says **fue construido**; in conversation porteños turn it around: *construyeron el puente*, *los detuvieron*. Or they use **se**: **el puente se inauguró ayer**, **se construyó hace un siglo**. For the future the news says **será inaugurada** — *will be opened*; people say *la van a inaugurar*.$tip$;
update public.tips set body_md = $tip$| El puente **fue construido** hace un siglo. | was built |
| La estación **fue inaugurada** ayer. | was opened |
| Los ladrones **fueron detenidos**. | were arrested |

**Fue** + participle; the participle agrees like an adjective.

**Detenidos** is also a noun: *hay dos detenidos* — *two people were arrested*.$tip$, updated_at = now() where id = 'de7cd7bc-7f0d-588c-bc69-c90f2dc4f004' and body_md = $tip$| El puente **fue construido** hace un siglo. | was built |
| La estación **fue inaugurada** ayer. | was opened |
| Los ladrones **fueron detenidos**. | were arrested |

**Fue** + participle, and the participle agrees like an adjective. **Detenidos** is also a noun: *hay dos detenidos* — *two people were arrested*.$tip$;
update public.tips set body_md = $tip$Nobody wants to **quedar mal** — *look rude*.

So you thank them for the **invitación**, blame a **compromiso** — *other plans* — and leave the door open: **la próxima voy**, **otro día**. If they push: **no insistas, che**.

**Rechazar** needs something after it — *rechacé dos invitaciones* — and sounds formal; day to day people say **decir que no**: *me cuesta decir que no*.$tip$, updated_at = now() where id = 'cc5e231d-b0ac-5861-be50-d1802854aad9' and body_md = $tip$Nobody wants to **quedar mal** — *look rude*. So you thank them for the **invitación**, blame a **compromiso** — *other plans* — and leave the door open: **la próxima voy**, **otro día**. And if they push: **no insistas, che**. **Rechazar** needs something after it — *rechacé dos invitaciones* — and sounds formal; day to day people say **decir que no**: *me cuesta decir que no*.$tip$;
update public.tips set body_md = $tip$A strike is a **paro**: **hay paro de subte**, **paro de colectivos**.

When protesters block a street it's a **piquete** or a **corte**; the street **está cortada**.

A **marcha** is a march.$tip$, updated_at = now() where id = '0c7552f3-e3f0-58fe-a0e2-9b920941566b' and body_md = $tip$A strike is a **paro**: **hay paro de subte**, **paro de colectivos**. When protesters block a street it's a **piquete** or a **corte**, and the street **está cortada**. A **marcha** is a march.$tip$;
update public.tips set body_md = $tip$**Funcionar** is *to work* for things: **el subte no funciona**, **los semáforos no funcionan**.

Day to day, porteños also say **andar**: *el ascensor no anda*.

People *trabajan* or *laburan*.$tip$, updated_at = now() where id = '6ce81526-2ff0-5977-9bbf-fd1e8d406e0b' and body_md = $tip$**Funcionar** is *to work* for things: **el subte no funciona**, **los semáforos no funcionan**. In everyday talk porteños also say **andar**: *el ascensor no anda*. People *trabajan* or *laburan*.$tip$;
update public.tips set body_md = $tip$The news opens with **hubo**: **hubo un incendio**, **hubo un accidente en la avenida**, **hubo dos heridos** — who then **fueron trasladados al hospital**.

At home the same story loses the passive: *trasladaron a los heridos*.$tip$, updated_at = now() where id = '27c30a60-8fbf-5356-81aa-cc1f86051cbc' and body_md = $tip$The news opens with **hubo**: **hubo un incendio**, **hubo un accidente en la avenida**, **hubo dos heridos** — who then **fueron trasladados al hospital**. At the kitchen table the same story loses the passive: *trasladaron a los heridos*.$tip$;
update public.tips set body_md = $tip$Election day is a Sunday, and people ask **¿dónde votás?** — usually at a school near home: **votamos en la misma escuela**.

Your **mesa** is the numbered table where you vote.

Before the vote there is **veda**: campaigning stops 48 hours earlier, and from the night before nobody can sell alcohol.$tip$, updated_at = now() where id = '2a3a2462-0e4e-58df-9bc1-fcf6e909f66e' and body_md = $tip$Election day is a Sunday, and everyone asks **¿dónde votás?** — usually at a school near home: **votamos en la misma escuela**. Your **mesa** is the numbered table where you vote. Before it there is **veda**: campaigning stops 48 hours before the vote, and from the night before nobody can sell alcohol.$tip$;
update public.tips set body_md = $tip$In Argentina voting is **obligatorio** from 18 to 70.

**¿A quién votaste?** is a real question, though many don't answer it. **Votar a** someone: *voté a otro candidato*. **Votar por** works too: *¿por quién votás?*

**Votar en blanco** is to cast a blank vote.$tip$, updated_at = now() where id = '67c1e923-9983-5e50-a6ce-52ff85a6eb09' and body_md = $tip$In Argentina voting is **obligatorio** from 18 to 70. **¿A quién votaste?** is a real question, though many people don't answer it. **Votar a** someone: *voté a otro candidato*. **Votar por** works too: *¿por quién votás?* **Votar en blanco** is to cast a blank vote.$tip$;
update public.tips set body_md = $tip$Put **lo** before an adjective for *the … thing*: **lo lindo** — *the nice thing*, **lo feo** — *the bad part* (same as **lo malo**), **lo único** — *the only thing*.

Add **de** to say of what: **lo peor de Buenos Aires es el tránsito**.

**Lo** never changes: **lo feo son los precios**.$tip$, updated_at = now() where id = '7ae297c7-20ed-5a6a-976d-9efc0c4c19d4' and body_md = $tip$Put **lo** before an adjective to say *the … thing*: **lo lindo** — *the nice thing*, **lo feo** — *the bad part* (same as **lo malo**), **lo único** — *the only thing*. Add **de** to say of what: **lo peor de Buenos Aires es el tránsito**. **Lo** never changes: **lo feo son los precios**.$tip$;
update public.tips set body_md = $tip$**Lo** makes anything *the thing*: **lo tuyo es la cocina** — *your thing is cooking*; **lo mío** — *my thing*; **lo primero** — *the first thing*; **lo justo** — *just enough*.

Giving up an argument: **lo que vos digas** — *whatever you say*.

**Lo que sea** — *whatever, anything*: **comemos lo que sea**.$tip$, updated_at = now() where id = 'e19109d4-b42a-551e-8023-98c286a43783' and body_md = $tip$**Lo** turns anything into *the thing*: **lo tuyo es la cocina** — *your thing is cooking*; **lo mío** — *my thing*; **lo primero** — *the first thing*; **lo justo** — *just enough*. Giving up an argument: **lo que vos digas** — *whatever you say*. **Lo que sea** — *whatever, anything*: **comemos lo que sea**.$tip$;
update public.tips set body_md = $tip$**Lo que pasa es que…** — *the thing is* — explains the real reason.

**Lo raro es que…** — *the weird thing is*; **lo importante es que…** — *what matters is*.

A fact takes the normal verb: **lo importante es que llegaste**. What isn't real yet takes the subjunctive: **lo importante es que la pases bien**.$tip$, updated_at = now() where id = '49e04ee1-475c-5da9-8fc8-72277c9ebf70' and body_md = $tip$**Lo que pasa es que…** — *the thing is* — explains the real reason. **Lo raro es que…** — *the weird thing is*; **lo importante es que…** — *what matters is*. A fact takes the normal verb: **lo importante es que llegaste**. Something not real yet takes the subjunctive: **lo importante es que la pases bien**.$tip$;
update public.tips set body_md = $tip$**Lo de** is *the thing with*: **¿qué pasó con lo de Juan?**

After **a** or **en** it is *someone's place*: **voy a lo de Sofi**, **estamos en lo de mis viejos**.

And **lo de siempre** is *the usual*.$tip$, updated_at = now() where id = 'c6fee335-6750-566b-8494-37dd8682218f' and body_md = $tip$**Lo de** is *the thing with*: **¿qué pasó con lo de Juan?** After **a** or **en** it is *someone's place*: **voy a lo de Sofi**, **estamos en lo de mis viejos**. And **lo de siempre** is *the usual*: at the café, at the bar, in life.$tip$;
update public.tips set body_md = $tip$Tell it in the past: **lo que pasó fue que se cortó la luz**. Say what you meant: **lo que quiero decir es que…**.

You already know **lo que más** — *what… most*: **lo que más me molestó fue eso**.

And **en el fondo** — *deep down* — for the real reason.$tip$, updated_at = now() where id = '83a1fba1-c4e8-509e-834e-ea0696869b8d' and body_md = $tip$Tell it in the past: **lo que pasó fue que se cortó la luz**. Say what you meant: **lo que quiero decir es que…**. You already know **lo que más** — *what… most*: **lo que más me molestó fue eso**. And **en el fondo** — *deep down* — for the real reason under it.$tip$;
update public.tips set body_md = $tip$To clear up is **aclarar**: **quiero aclarar algo**.

Then: **no quise decir eso** — *I didn't mean that*; **me expresé mal** — *I put it badly*; **me entendiste mal** — *you misunderstood me*; **no lo dije por vos** — *I didn't say it about you*.$tip$, updated_at = now() where id = 'a2499f0a-6b22-5381-ac0b-dd40ce7d8572' and body_md = $tip$To clear it up — **aclarar**: **quiero aclarar algo**. Then: **no quise decir eso** — *I didn't mean that*; **me expresé mal** — *I put it badly*; **me entendiste mal** — *you misunderstood me*; **no lo dije por vos** — *I didn't say it about you*.$tip$;
update public.tips set body_md = $tip$**Metí la pata** — *I messed up, I said or did the wrong thing*. More porteño: **me mandé una macana**.

A **macana** is a silly mistake; an **error** is any mistake.

When something goes wrong for someone: **¡qué macana!** — *what a shame!*$tip$, updated_at = now() where id = '54279426-a9ab-597a-90c9-2ebc30ce6253' and body_md = $tip$**Metí la pata** — *I messed up, I said or did the wrong thing*. More porteño: **me mandé una macana**. A **macana** is a silly mistake; an **error** is any mistake. And when something goes wrong for someone: **¡qué macana!** — *what a shame!*$tip$;
update public.tips set body_md = $tip$**Las elecciones** — *the elections* — decide the **gobierno** and the **presidente**.

Before them, the **debate** on TV; after, the **resultados**.

If nobody wins outright there's a **balotaje** — *a runoff*.$tip$, updated_at = now() where id = 'eac6d092-ac6a-51cb-ad45-36a8a79f1e96' and body_md = $tip$**Las elecciones** — *the elections* — decide the **gobierno** and the **presidente**. Before them, the **debate** on TV; after, the **resultados**. If nobody wins outright there's a **balotaje** — *a runoff*. The course stays out of who won: the words, not the opinions.$tip$;
update public.tips set body_md = $tip$After **no es que** any verb goes into the subjunctive. You already know the forms: **sea**, **esté**, **haya**, **tenga**.

*No es que sea caro, es que no tengo plata* — *it's not that it's expensive, I just have no money*. *No es que esté cansado, es que laburo temprano.*$tip$, updated_at = now() where id = 'e4442fba-2d7d-515f-bf95-5182892f4c7e' and body_md = $tip$After **no es que** any verb goes into the subjunctive, and you already know the forms: **sea**, **esté**, **haya**, **tenga**. *No es que sea caro, es que no tengo plata* — *it's not that it's expensive, I just have no money*. *No es que esté cansado, es que laburo temprano.*$tip$;
update public.tips set body_md = $tip$After **no es que**, verbs go subjunctive: **no es que no me interese** — *it's not that I'm not interested*; **no es que no me importe** — *it's not that I don't care*.

Or **no es que me caiga mal** — *it's not that I don't like him*; **no es que no queramos / podamos** — *it's not that we don't want to / can't*.

The real reason takes **es que** + a normal verb: *es que no llego* — *I just can't make it*.$tip$, updated_at = now() where id = '2f545600-080d-50bc-8cb8-ceb5c9b0db7e' and body_md = $tip$After **no es que**, every verb goes subjunctive: **no es que no me interese** — *it's not that I'm not interested*; **no es que no me importe** — *it's not that I don't care*; **no es que me caiga mal** — *it's not that I don't like him*; **no es que no queramos / podamos** — *it's not that we don't want to / can't*. The real reason follows with **es que** + a normal verb: *es que no llego* — *I just can't make it*.$tip$;
update public.tips set body_md = $tip$A strike is named after who stops: **paro docente** — *the teachers*; **paro de colectivos** — the **colectiveros**; **paro general** — everyone.

The **gremio** — *the union* — **anunció un paro**; the news calls it a **medida de fuerza**.$tip$, updated_at = now() where id = '041f794e-e18f-579b-99d7-01a95bf079bd' and body_md = $tip$A strike is named after who stops: **paro docente** — *the teachers*; **paro de colectivos** — the **colectiveros**; **paro general** — everyone. The **gremio** — *the union* — **anunció un paro** for Thursday, and the news calls it a **medida de fuerza**.$tip$;
update public.tips set body_md = $tip$With **me afanaron**, *they* did it and we don't say who: **Me afanaron la billetera**, **me estafaron**.

With **se tapó**, it happened by itself: **se tapó la pileta**, **se trabó el ascensor**.$tip$, updated_at = now() where id = 'cab9d500-1ea5-50a6-b22b-98ddbe3c2137' and body_md = $tip$**Me afanaron la billetera**, **me estafaron**; **se tapó la pileta**, **se trabó el ascensor** — with **me afanaron**, *they* did it and we don't say who; with **se tapó**, it happened by itself and nobody did it.$tip$;
update public.tips set body_md = $tip$Another life: **si hubieras estudiado, ahora serías médico**.

A missed chance: **me hubiera gustado ir**, **tendríamos que haber ido**, **te lo perdiste**.

Alone, **hubieras** + participle is a reproach: **¡hubieras avisado!** — *you should have told me!*$tip$, updated_at = now() where id = '55b97bb7-34ad-5d9c-8a39-e9ca1dff6cbe' and body_md = $tip$Another life: **si hubieras estudiado, ahora serías médico**. A missed chance: **me hubiera gustado ir**, **tendríamos que haber ido**, **te lo perdiste**. And **hubieras** + participle alone is a reproach: **¡hubieras avisado!** — *you should have told me!*$tip$;
update public.tips set body_md = $tip$A **rumor** is just that until someone **confirma** or denies it: **el gobierno desmintió el rumor**.

Before **compartirlo**, ask **¿cuál es la fuente?**

A **cadena** — *a chain message* — with no source is likely **verso** — *made up*.$tip$, updated_at = now() where id = '3ff85211-a894-5d45-b66e-973838dc3d86' and body_md = $tip$A **rumor** is only that until someone **confirma** it, or denies it: **el gobierno desmintió el rumor**. Before **compartirlo**, ask **¿cuál es la fuente?** A **cadena** — *a chain message* — with no source is probably **verso** — *made up*.$tip$;
update public.tips set body_md = $tip$**Según** — *according to* — takes papers and people: **según el diario**, **según mi mamá**, **según Nico**.

**Supuestamente** and **al parecer** keep a distance from what you pass on. **Al parecer** sounds like the news; in chat it's *parece que*.$tip$, updated_at = now() where id = '5c404af7-97bb-5016-95f3-4dbb7f00df17' and body_md = $tip$**Según** — *according to* — takes papers and people: **según el diario**, **según mi mamá**, **según Nico**. **Supuestamente** and **al parecer** keep a distance from what you pass on. **Al parecer** sounds like the news; in chat people say *parece que*.$tip$;
update public.tips set body_md = $tip$**Aparentemente** is the neutral *apparently*: **aparentemente, mañana hay paro**; **por lo visto** is the same.

**Se ve que** is what you conclude from what you see: **se ve que llovió** — *it must have rained*; **se ve que está cerrado**.$tip$, updated_at = now() where id = '6d88948a-49cd-507f-b390-3b282380d755' and body_md = $tip$**Aparentemente** is the neutral *apparently*: **aparentemente, mañana hay paro**; **por lo visto** means the same. **Se ve que** is what you conclude from what you see: **se ve que llovió** — *it must have rained*; **se ve que está cerrado**.$tip$;
update public.tips set body_md = $tip$**Hubiera** changes by person: **hubiera** (I, he, she), **hubieras** (vos), **hubiéramos** (we), **hubieran** (they, you all).

*Si hubieras estudiado medicina, ahora serías médico. Si hubiéramos ahorrado, ahora estaríamos en Bariloche. Si hubieran construido el puente, no habría tanto tránsito.*$tip$, updated_at = now() where id = 'e7e97709-b1ce-5787-93fb-a7735a2015ce' and body_md = $tip$**Hubiera** changes with the person: **hubiera** (I, he, she), **hubieras** (vos), **hubiéramos** (we), **hubieran** (they, you all). *Si hubieras estudiado medicina, ahora serías médico. Si hubiéramos ahorrado, ahora estaríamos en Bariloche. Si hubieran construido el puente, no habría tanto tránsito.*$tip$;
update public.tips set body_md = $tip$**Hubiera** + participle works alone as *would have*: **nunca lo hubiera vendido** — *I'd never have sold it*; **¿lo hubieras vendido?** — *would you have sold it?*

And **ojalá hubiera** + participle is *I wish I had*: **ojalá hubiera ahorrado más**.$tip$, updated_at = now() where id = 'fdea7949-7c65-5ef1-92db-aafc9dc74362' and body_md = $tip$**Hubiera** + participle also works alone as *would have*: **nunca lo hubiera vendido** — *I'd never have sold it*; **¿lo hubieras vendido?** — *would you have sold it?* And **ojalá hubiera** + participle is *I wish I had*: **ojalá hubiera ahorrado más**.$tip$;
update public.tips set body_md = $tip$A chance you let go: **dejé pasar la oportunidad** — *I let the chance go*.

To someone who didn't come: **te lo perdiste** — *you missed out*.

**Lamentablemente** — *unfortunately* — you can't **volver atrás** — *go back* — so drop it with **ya fue**.$tip$, updated_at = now() where id = '1d43e9b9-80e9-5f3c-b2cb-a7c32890b5fc' and body_md = $tip$A chance you let go: **dejé pasar la oportunidad** — *I let the chance go*. To someone who didn't come: **te lo perdiste** — *you missed out*. **Lamentablemente** — *unfortunately* — you can't **volver atrás** — *go back* — so you drop it with **ya fue**.$tip$;
update public.tips set body_md = $tip$**Me arrepiento** — *I regret it*; **me arrepentí** — *I regretted it, I changed my mind*.

For what you did or didn't, **de (no) haber** + participle: **me arrepiento de no haber ido** — *I regret not going*; *no me arrepiento de haber venido*.

An **oportunidad** is a chance; **aprovechar**, to make the most of it: *no aproveché la oportunidad*.$tip$, updated_at = now() where id = '8a29fec5-b96f-5019-8de7-6e3c598a5302' and body_md = $tip$**Me arrepiento** — *I regret it*; **me arrepentí** — *I regretted it, I changed my mind*. With what you did or didn't do, **de (no) haber** + participle: **me arrepiento de no haber ido** — *I regret not going*; *no me arrepiento de haber venido*. An **oportunidad** is a chance; **aprovechar** is to make the most of it: *no aproveché la oportunidad*.$tip$;
update public.tips set body_md = $tip$To say what you love about a place: **lo que más me gusta de Buenos Aires es la noche**. The opposite: **lo que menos me gusta es el ruido**.

And **lo más** + adjective is *the most … thing*: **lo más lindo del barrio es la plaza**.$tip$, updated_at = now() where id = 'a1c0dd99-f02a-5bad-9b95-50478e5f3daa' and body_md = $tip$The most natural way to say what you love about a place: **lo que más me gusta de Buenos Aires es la noche**. The opposite: **lo que menos me gusta es el ruido**. And **lo más** + adjective is *the most … thing*: **lo más lindo del barrio es la plaza**.$tip$;
update public.tips set body_md = $tip$The good and the bad together: **Buenos Aires tiene sus cosas** — *it has its issues*.

Like the **inseguridad** (*crime*) and the **costo de vida** (*cost of living*).

But **a la vez** — *at the same time* — **no hay nada como Buenos Aires**: *there's nothing like it*.$tip$, updated_at = now() where id = 'a75b10b9-a779-55fa-ae70-312528aa56c8' and body_md = $tip$To say the good and the bad together: **Buenos Aires tiene sus cosas** — *it has its issues* — like the **inseguridad** (*crime*) and the **costo de vida** (*cost of living*). But **a la vez** — *at the same time* — **no hay nada como Buenos Aires**: *there's nothing like it*.$tip$;
update public.tips set body_md = $tip$An instrument is **tocar**: **¿tocás la guitarra?**, **mi abuelo tocaba el bandoneón en una orquesta**.

**¿Cantás?** **¿Bailás tango?** At the milonga, **¿bailamos?**$tip$, updated_at = now() where id = '5a5e8f75-3fbb-503c-ab9a-371872ba6b24' and body_md = $tip$An instrument is **tocar**: **¿tocás la guitarra?**, **mi abuelo tocaba el bandoneón en una orquesta**. **¿Cantás?** **¿Bailás tango?** — and at the milonga, **¿bailamos?**$tip$;
update public.tips set body_md = $tip$Porteños grew up on **rock nacional** — *Argentine rock* — sung in Spanish; the provinces on **folclore**; every party ends in **cumbia**.

A **cantante** is a singer; a tango singer is often called a *cantor*.$tip$, updated_at = now() where id = '968d241f-9d2a-5644-9eff-acf620874f77' and body_md = $tip$Porteños grew up on **rock nacional** — *Argentine rock* — sung in Spanish in the stadiums; the provinces on **folclore**; every party ends in **cumbia**. A **cantante** is a singer; a tango singer is often called a *cantor*.$tip$;
update public.tips set body_md = $tip$**Como dice el dicho** — *as the saying goes*. Then one that fits: **cada loco con su tema** — *to each their own*; **no hay dos sin tres** — *there's always a third time*.

And **el que no llora no mama** — *if you don't ask, you don't get*.$tip$, updated_at = now() where id = 'a52eadb9-c139-52a4-b142-3865a13646ae' and body_md = $tip$**Como dice el dicho** — *as the saying goes* — and then the one that fits: **cada loco con su tema** — *to each their own*; **no hay dos sin tres** — *there's always a third time*; **el que no llora no mama** — *if you don't ask, you don't get*.$tip$;
update public.tips set body_md = $tip$**Más vale pájaro en mano que cien volando** — *one sure thing is better than a hundred possible ones*; **a caballo regalado no se le miran los dientes** — *you don't complain about a gift*.

**El que se quema con leche, ve una vaca y llora** — *after a bad experience, you're scared of anything similar*. And **ojos que no ven, corazón que no siente** — *what you don't know can't hurt you*; **del dicho al hecho hay mucho trecho** — *easier said than done*.

For one who complicates everything: **buscarle la quinta pata al gato** — *to look for the cat's fifth leg*. When someone walks in: **hablando del rey de Roma…** — *we were just talking about you*.$tip$, updated_at = now() where id = 'c856ee20-16fd-55e2-88a7-bb617e0c577d' and body_md = $tip$**Más vale pájaro en mano que cien volando** — *one sure thing is better than a hundred possible ones*; **a caballo regalado no se le miran los dientes** — *you don't complain about a gift*; **ojos que no ven, corazón que no siente** — *what you don't know can't hurt you*; **del dicho al hecho hay mucho trecho** — *easier said than done*. **El que se quema con leche, ve una vaca y llora** — *after a bad experience, you're scared of anything similar*. For someone who complicates everything: **buscarle la quinta pata al gato** — *to look for the cat's fifth leg*. And when someone walks in: **hablando del rey de Roma…** — *we were just talking about you*.$tip$;
update public.tips set body_md = $tip$**El que avisa no traiciona** — *don't say I didn't warn you*. You say it while you give the warning. Literally: *the one who warns you doesn't betray you*.

Two more: **sobre gustos no hay nada escrito** — *everyone has their own taste*; **el que quiere celeste, que le cueste** — *if you want something good, you have to work for it*.$tip$, updated_at = now() where id = 'e6b7166a-1ef7-5de5-90cc-d87a7c023771' and body_md = $tip$**El que avisa no traiciona** — *don't say I didn't warn you*. You say it while you give the warning. Literally: *the one who warns you doesn't betray you*. Two more you'll hear in Buenos Aires: **sobre gustos no hay nada escrito** — *everyone has their own taste*; **el que quiere celeste, que le cueste** — *if you want something good, you have to work for it*.$tip$;
update public.tips set body_md = $tip$**Mejor todavía** — *even better*: **¿es gratis? Mejor todavía**; also **mejor así** — *better this way*. *Tanto mejor* is the same but bookish.

To **evitar** the **hora pico**, you go early; the place **se llena** fast; and leaving early, the day **rinde** — *goes further*.

**Ganar tiempo** is *to save time*: **con el subte ganás tiempo**.$tip$, updated_at = now() where id = 'b9bc5c55-0b39-5996-a6ed-71dd17a76fb0' and body_md = $tip$**Mejor todavía** — *even better*: **¿es gratis? Mejor todavía**; also **mejor así** — *better this way*. *Tanto mejor* says the same but sounds bookish. To **evitar** the **hora pico**, you go early; the place **se llena** fast; and leaving early, the day **rinde** — *goes further*. **Ganar tiempo** is *to save time*: **con el subte ganás tiempo**.$tip$;
update public.tips set body_md = $tip$A finished thing takes the preterite: **al principio me costó** — *it was hard at first* — **pero me adapté** — *I adapted*.

How things were takes the imperfect: *al principio era raro*.

Now **me siento como en casa**. Say it **de corazón**.$tip$, updated_at = now() where id = '36794004-344e-51d8-96d4-0a9ba3a15337' and body_md = $tip$Looking back, a finished thing takes the preterite: **al principio me costó** — *it was hard at first* — **pero me adapté** — *I adapted*. How things were takes the imperfect: *al principio era raro*. Now **me siento como en casa**. Say it **de corazón**.$tip$;
update public.tips set body_md = $tip$**Me da cosa** has two uses. Doing something feels awkward: **me da cosa pedirle plata** — *I feel awkward asking him for money*.

Or a thing gives a bad feeling: **ese perro me da cosa** — *that dog makes me uneasy*.

**Me pone mal** — *it makes me sad*. **Me quedé con las ganas** — *I missed out, and I still want to*.$tip$, updated_at = now() where id = '6b55c1f4-870b-5f43-8afa-9decf186dca1' and body_md = $tip$**Me da cosa** has two uses. Doing something feels awkward: **me da cosa pedirle plata** — *I feel awkward asking him for money*. Or a thing gives you a bad feeling: **ese perro me da cosa** — *that dog makes me uneasy*. **Me pone mal** — *it makes me sad*. **Me quedé con las ganas** — *I missed out, and I still want to*.$tip$;
update public.tips set body_md = $tip$**Estoy orgulloso de vos** — *I'm proud of you*. A woman says **orgullosa** and **agradecida**.

**Agradecido** — *grateful*: **estoy muy agradecida**.

Grateful *to* a person: **agradecido con vos**. And *for* a thing: **agradecida por el regalo**.$tip$, updated_at = now() where id = '73a05d53-1c14-5efb-ad11-2e0630cff1d7' and body_md = $tip$**Estoy orgulloso de vos** — *I'm proud of you*. A woman says **orgullosa** and **agradecida**. **Agradecido** — *grateful*: **estoy muy agradecida**. Grateful *to* a person: **agradecido con vos**. Grateful *for* a thing: **agradecida por el regalo**.$tip$;
update public.tips set body_md = $tip$**Emocionarse** is mostly *to be moved, to get emotional* (also *to get excited*): **me emocioné en el casamiento**.

**Se me puso la piel de gallina** — *I got goosebumps*. Also **me dio piel de gallina** — *it gave me goosebumps*.$tip$, updated_at = now() where id = 'cca2ccce-cf17-599f-8925-4e509a09fbef' and body_md = $tip$**Emocionarse** is mostly *to be moved, to get emotional* (it can also mean *to get excited*): **me emocioné en el casamiento**. **Se me puso la piel de gallina** — *I got goosebumps*. Also **me dio piel de gallina** — *it gave me goosebumps*.$tip$;
update public.tips set body_md = $tip$Something does it *to* you: **me dejó pensando** — *it got me thinking*; **me partió el alma** — *it broke my heart*.

You end up frozen: **me quedé helado** — *I froze, I was stunned*. A woman says **me quedé helada**.

The good ones: **me hace bien**, **me da ternura**, and **¡qué alivio!**$tip$, updated_at = now() where id = '0904d601-7430-56cd-9bf0-9e5b17a157e0' and body_md = $tip$Something does it *to* you: **me dejó pensando** — *it got me thinking*; **me partió el alma** — *it broke my heart*. And you end up frozen: **me quedé helado** — *I froze, I was stunned*. A woman says **me quedé helada**. The good ones: **me hace bien**, **me da ternura**, and **¡qué alivio!**$tip$;
update public.tips set body_md = $tip$**Reírse** is *to laugh*: **me río mucho con vos** — *I laugh a lot with you*.

You know **me reí** and **nos reímos**; with *vos* in the past it is **te reíste**: **¿de qué te reíste?**

**Llorar** is *to cry*: **lloré con esa película**.$tip$, updated_at = now() where id = '8845c3ad-88ce-52bb-b23a-7f37ca96a528' and body_md = $tip$**Reírse** is *to laugh*: **me río mucho con vos** — *I laugh a lot with you*. You already know **me reí** and **nos reímos**; with *vos* in the past it is **te reíste**: **¿de qué te reíste?** **Llorar** is *to cry*: **lloré con esa película**.$tip$;
update public.tips set body_md = $tip$**Reírse** with *vos*: **¿de qué te reís?**; with *him*: **se ríe de todo**; in the past, **se rió** — *he laughed*.

For the big laugh: **me morí de risa** — *I died laughing*.

A **comedia** gets a **sonrisa**; a sad scene, **lágrimas** and **tristeza**. **¿Lloraste?** People with **sentido del humor** laugh at themselves.$tip$, updated_at = now() where id = '8b879baa-1e7b-5ea3-9967-18510251f924' and body_md = $tip$**Reírse** with *vos*: **¿de qué te reís?**; with *him*: **se ríe de todo**; in the past, **se rió** — *he laughed*. **¿Lloraste?** For the big laugh: **me morí de risa** — *I died laughing*. A **comedia** gets a **sonrisa**; a sad scene, **lágrimas** and **tristeza**. And people with **sentido del humor** laugh at themselves.$tip$;
update public.tips set body_md = $tip$**Era otra época** — *it was a different time*.

The **inmigrantes** who arrived around 1900 packed into the city's **conventillos** and shaped its tango and accent.$tip$, updated_at = now() where id = '16b0f92c-4d73-5f11-82c9-5202ed211fa0' and body_md = $tip$**Era otra época** — *it was a different time*. The **inmigrantes** who arrived around 1900 packed into the city's **conventillos** and shaped its tango and its accent.$tip$;
update public.tips set body_md = $tip$Many porteños have an **abuelo** or **bisabuelo** who **llegó en barco** from Italy or Spain.

An Italian, or anyone with an Italian surname, is a **tano** or a **tana**: *mi abuelo era tano*.

So porteños talk with their hands and eat ñoquis on the 29th.$tip$, updated_at = now() where id = 'a5efa082-ec6d-55de-8585-829fc1b6a047' and body_md = $tip$Many porteños have an **abuelo** or **bisabuelo** who **llegó en barco** from Italy or Spain. An Italian, or anyone with an Italian surname, is a **tano** or a **tana**: *mi abuelo era tano*. That's why a porteño talks with his hands and eats ñoquis on the 29th.$tip$;
update public.tips set body_md = $tip$In Argentina every Spaniard is a **gallego**, from Galicia or not. It is informal and friendly, but some Spaniards do not like it; the neutral word is **español**.

Half of Buenos Aires is getting Italian or Spanish citizenship — **sacar la ciudadanía**.

Your **raíces** — *roots* — come with a passport.$tip$, updated_at = now() where id = '69083595-4dc0-5d7d-8816-d2abf4a0f8c7' and body_md = $tip$In Argentina every Spaniard is a **gallego**, from Galicia or not. It is informal and friendly, but some Spaniards do not like it; the neutral word is **español**. And the great-grandparents still pay off: half of Buenos Aires is getting Italian or Spanish citizenship — **sacar la ciudadanía**. Your **raíces** — *roots* — come with a passport.$tip$;
update public.tips set body_md = $tip$**Entre nos** — *between you and me* — is where gossip starts.

**Sin querer** — *by accident*: **te pisé sin querer**.$tip$, updated_at = now() where id = '15d2f5ec-cdc6-5240-9c21-970a29b061f5' and body_md = $tip$**Entre nos** — *between you and me* — is where porteño gossip starts. **Sin querer** — *by accident*: **te pisé sin querer**.$tip$;
update public.tips set body_md = $tip$**Lo que pasó fue que**, **lo que quiero decir es que**, **lo tuyo**, **lo que sea**, **en el fondo**.

Three sayings: **cada loco con su tema** — *to each their own*; **no hay dos sin tres** — *there's always a third time*; **hablando del rey de Roma** — *we were just talking about you*.$tip$, updated_at = now() where id = 'b1b445dc-605c-502f-a4b3-fc7a72caf676' and body_md = $tip$**Lo que pasó fue que**, **lo que quiero decir es que**, **lo tuyo**, **lo que sea**, **en el fondo**. And three sayings: **cada loco con su tema** — *to each their own*; **no hay dos sin tres** — *there's always a third time*; **hablando del rey de Roma** — *we were just talking about you*.$tip$;
update public.tips set body_md = $tip$**Me morí de risa**, **¿de qué te reís?**, **me hizo sentir…**, **cuanto antes lleguemos, mejor**.

**A la larga** — *in the long run*: **a la larga, el esfuerzo rinde**.$tip$, updated_at = now() where id = '2195936f-d3dc-5457-874a-d4ff433f78c3' and body_md = $tip$**Me morí de risa**, **¿de qué te reís?**, **me hizo sentir…** — and **cuanto antes lleguemos, mejor**. **A la larga** — *in the long run*: **a la larga, el esfuerzo rinde**.$tip$;
update public.tips set body_md = $tip$Big moments: **se recibió** — *graduated*; **se comprometieron** — *got engaged*; **se jubiló** — *retired*.

The feelings: **se emocionó** — *got emotional*; **me llegó** — *it touched me*.$tip$, updated_at = now() where id = 'd3c1b17e-2938-5068-9e90-ab4c6a0edcec' and body_md = $tip$Big moments: **se recibió** — *graduated*; **se comprometieron** — *got engaged*; **se jubiló** — *retired*. And the feelings: **se emocionó** — *got emotional*; **me llegó** — *it touched me*.$tip$;
update public.tips set body_md = $tip$**Acampamos al lado de un lago**, **hicimos dedo**; **¿te convido un mate?** — but **no hiervas el agua**.

A **carpa** is a camping tent; on the beach in Mar del Plata, also a rented shade tent.$tip$, updated_at = now() where id = '9f9ceb73-2afc-50c6-b957-5e19f23e93c9' and body_md = $tip$**Acampamos al lado de un lago**, **hicimos dedo**; **¿te convido un mate?** — but **no hiervas el agua**. A **carpa** is a camping tent; on the beach in Mar del Plata it is also a rented shade tent.$tip$;
update public.tips set body_md = $tip$A **despedida** — *farewell party* — ends with a toast, a **brindis**: **¡brindemos!**, **brindo por ustedes**, **¡salud!**

Then **gracias por todo**, **fue un placer**, **los voy a extrañar**. Never *adiós*: you say **chau** or **hasta la próxima**.

To leave, people say **bueno, me voy yendo** or **los dejo**; **me despido** sounds like a letter, though *me despedí de todos* — *I said goodbye to everyone* — is fine.$tip$, updated_at = now() where id = 'cf2878f8-b900-509f-b7ce-8ab38a91c757' and body_md = $tip$A porteño **despedida** — *farewell party* — ends with a toast, a **brindis**: **¡brindemos!**, **brindo por ustedes**, **¡salud!** Then **gracias por todo**, **fue un placer**, **los voy a extrañar** — and never *adiós*: you say **chau** or **hasta la próxima**, because here nobody really leaves. To leave, people say **bueno, me voy yendo** or **los dejo**; **me despido** sounds like a letter, though *me despedí de todos* — *I said goodbye to everyone* — is fine.$tip$;
update public.tips set body_md = $tip$**Emocionarse** by person: **me emocioné**, **¿te emocionaste?**, **mi viejo se emocionó**, **nos emocionamos todos**.

It was **emotivo** — *moving* — and **se me hizo un nudo en la garganta** — *I got a lump in my throat*.$tip$, updated_at = now() where id = '17a11c47-ddcf-52c0-865b-41a1aed9e668' and body_md = $tip$**Emocionarse** in every person: **me emocioné**, **¿te emocionaste?**, **mi viejo se emocionó**, **nos emocionamos todos**. It was **emotivo** — *moving* — and **se me hizo un nudo en la garganta** — *I got a lump in my throat*.$tip$;
update public.tips set body_md = $tip$The family story runs in the third person plural: **se escaparon de la guerra**, **se instalaron en un conventillo**, **trabajaron en el puerto**. One person: **se instaló**.

A conventillo is *an old shared house where each poor family rented one room*.

They left **pobreza** behind, **mantuvieron** the language and traditions, and **guardaron** the photos of the ship. *Conservaron* is the same, but written.$tip$, updated_at = now() where id = '4039fa21-f933-5aec-877d-701a109a210b' and body_md = $tip$The family story runs in the third person plural: **se escaparon de la guerra**, **se instalaron en un conventillo** — *an old shared house where each poor family rented one room* — and **trabajaron en el puerto**. One person: **se instaló**. They left **pobreza** behind, **mantuvieron** the language and the traditions, and **guardaron** the photos of the ship. *Conservaron* says the same, but it is a written word.$tip$;
update public.tips set body_md = $tip$Porteños are direct, but soften it first: **sin ofender** — *no offense*; **te lo digo con cariño**; **no es nada personal**.

A **crítica** goes down better that way, above all on a **tema delicado**.$tip$, updated_at = now() where id = '102ea8d0-6e5a-50b1-816d-8bdb9e099e9b' and body_md = $tip$Porteños are direct, but they soften it first: **sin ofender** — *no offense*; **te lo digo con cariño**; **no es nada personal**. A **crítica** goes down better that way, above all on a **tema delicado**.$tip$;
update public.tips set body_md = $tip$**Lograr** — *to manage something hard, to achieve*: **¡lo lograste!** — *you did it!* Your own line: **¡lo logré!** — *I did it!*

Then **felicitaciones** — *congratulations* — or, among friends, just **¡grande!**$tip$, updated_at = now() where id = 'bb475835-3596-5744-abe5-6a802edce685' and body_md = $tip$**Lograr** — *to manage something hard, to achieve*: **¡lo lograste!** — *you did it!* And your own line: **¡lo logré!** — *I did it!* Then **felicitaciones** — *congratulations* — or, among friends, just **¡grande!**$tip$;
