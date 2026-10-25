# Posta: plan de SEO y GEO (Google + agentes de IA)

Fecha: 2026-10-25. Complementa [aso.md](aso.md), que ya cubre el SEO dentro de las stores (nombre, subtítulo, keywords). Este documento cubre la web (postaspanish.com) y todo lo que hace que Google, ChatGPT, Claude, Gemini, Perplexity y Copilot recomienden Posta.

## 1. La idea en una frase

**GEO es SEO + que te mencionen en otros lados.** Google dice que para AI Overviews / AI Mode no hay nada especial: es el mismo SEO de siempre ([Google](https://developers.google.com/search/docs/appearance/ai-features)). Los chatbots recomiendan las apps que ven en listas de "best apps", Reddit, YouTube y las stores. Así que hay dos motores:

1. **Contenido propio** en la web que conteste las preguntas que la gente hace ("what does boludo mean", "vos conjugation", "best app for Argentine Spanish").
2. **Menciones de terceros**: Reddit, YouTube, blogs, listas, directorios, prensa.

## 2. Diagnóstico de hoy

**Ya está bien (no tocar):**
- Title y description con keywords ("Learn Argentine Spanish: Slang, Vos & Lunfardo").
- Canonical, Open Graph, Twitter cards, favicon.
- Schema JSON-LD: Organization, WebSite, MobileApplication y FAQPage.
- HTML estático en S3/CloudFront: los crawlers de IA no ejecutan bien JavaScript, y acá no hace falta.
- robots.txt permite todo; GPTBot y ClaudeBot reciben 200. Hay sitemap.

**Falta:**
| # | Problema | Por qué importa |
|---|---|---|
| 1 | **La web tiene una sola página de contenido** (la landing). | Solo puede rankear para "argentinian spanish app". No hay nada para las miles de búsquedas de slang, voseo, cultura. Es el hueco más grande. |
| 2 | No está verificada en **Google Search Console** ni en **Bing Webmaster Tools**. | Sin eso no sabés qué búsquedas te traen, y Bing alimenta Copilot y (en parte) ChatGPT. |
| 3 | El schema de la Organización no tiene **`sameAs`** (Instagram, TikTok, YouTube, App Store, Play). | Así Google y los LLM entienden que "Posta" la app = @postaspanish = la ficha de la store. "Posta" solo es ambiguo (apps de correo). |
| 4 | `apple-itunes-app` con id `0000000000` comentado; no hay links reales a las stores. | Se arregla el día del lanzamiento. |
| 5 | La web no tiene analytics. | No vas a ver el tráfico que llega desde chatgpt.com, perplexity.ai, etc. |
| 6 | No hay `llms.txt`. | Menor: el 97% de esos archivos no recibe ni una visita de bots ([Ahrefs vía PPC Land](https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/)). Se hace en 10 minutos y listo. |

**El hallazgo clave: el nicho está vacío también en Google y en la IA.** Buscando "best app to learn Argentinian Spanish" aparecen Porteño Spanish (un diccionario viejo), Mergeek, y páginas de vendedores (Talkpal, SpeakShark) que arman listas donde ellos salen primeros. En r/Spanish la respuesta típica es "no existe una app para eso". No hay ningún contenido serio y neutral. El primero que lo publique se queda con la respuesta.

## 3. Fase 0: el día del lanzamiento (1 día de trabajo)

1. **Google Search Console**: verificar por DNS, mandar el sitemap.
2. **Bing Webmaster Tools**: importar desde Search Console (es un click), mandar el sitemap, activar **IndexNow** (avisa a Bing al instante cuando cambia una página). Bing tiene un reporte de "AI Performance" con las citas en Copilot.
3. **robots.txt**: dejar explícitos los bots de búsqueda de IA (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Claude-SearchBot`, `Google-Extended`, `Bingbot`) con `Allow: /`. Hoy ya pasan, pero así nadie los bloquea por error con una regla de CloudFront/WAF.
4. **Schema**: agregar `sameAs` con todas las cuentas y las dos fichas de store; `downloadUrl` / `installUrl` en MobileApplication; `aggregateRating` **solo** cuando haya ratings reales en las stores.
5. **Links a las stores** en la landing + descomentar `apple-itunes-app` con el id real.
6. **Analytics liviano** en la web (Plausible, o PostHog si entra en el plan gratis) para ver referrers de IA.
7. `llms.txt` corto: qué es Posta, para quién, links a las stores y a las guías. Sin expectativas.
8. **Mismo nombre en todos lados**: "Posta: Argentinian Spanish" (o "Posta Argentinian Spanish"). Nunca "Posta" solo en bios y descripciones.

## 4. Fase 1: contenido en la web (semanas 1–8) — el motor principal

Posta ya tiene el contenido en la base: 899 palabras de slang con glosas en inglés y frases de ejemplo, conjugaciones de vos, clases de cultura. Hay que convertirlo en páginas HTML estáticas, generadas por un script desde Supabase hacia `posta-site/`.

### 4.1 Diccionario de slang: `/slang/<palabra>`
Una página por palabra. Búsquedas objetivo: "boludo meaning", "what does che mean", "laburo in english", "qué significa quilombo".
Cada página: significado en inglés simple, cuándo se usa y cuándo **no** (registro, si es grosero), 2–3 frases de ejemplo de la app, palabras relacionadas, de dónde viene si lo sabemos, y un CTA a la app.

**Ojo con la política de Google de "scaled content abuse"**: 899 páginas flacas hechas en masa pueden hundir todo el sitio. Empezar con **las 100 palabras más buscadas** (medir con autocomplete / Search Console), que cada página sea realmente útil y distinta, y sumar de a tandas según lo que rinda.

### 4.2 Voseo: `/vos/<verbo>`
"tener vos form", "vos conjugation of ser", "vos sos vs tú eres". Tabla de conjugación (presente, imperativo, pretérito), frases de ejemplo, y los errores típicos. Empezar con los 50 verbos más comunes. Más una página pilar: "What is voseo? The complete guide".

### 4.3 Guías pilares (8–10 artículos largos)
Cada una contesta una pregunta grande, con datos y ejemplos propios:
- Argentine Spanish vs Mexican Spanish vs Spain Spanish (tabla de diferencias)
- What is Rioplatense Spanish? / What is lunfardo? (50 palabras que se usan hoy)
- Argentine Spanish pronunciation: el sonido "sh" (yo, calle, llave)
- Spanish for moving to Buenos Aires (frases para el alquiler, el banco, el médico)
- Argentine Spanish for travelers: 40 phrases
- Talking to your Argentine partner's family (nono/nona, mate, asado)
- Argentine insults and words you should never say
- **"Best apps to learn Argentinian Spanish (2026)"**: una lista honesta que incluya a la competencia (Porteño Spanish, Mergeek, italki con tutores argentinos, Dreaming Spanish con contenido argentino) y a Posta. Los LLM citan mucho este formato de lista; si la única lista seria del nicho es la tuya, sos la fuente.
- "Posta vs Duolingo for Argentine Spanish" (honesta: Duolingo enseña tú; para qué sirve cada una).

### 4.4 Cultura: `/culture/<tema>`
Las clases de cultura (mate, asado, fútbol, colectivo…) como artículos cortos con su arte.

### 4.5 Cómo escribir para que la IA te cite (aplica a todo)
- Títulos H2 en forma de pregunta, y **justo abajo una respuesta directa de 2–3 frases**. Después el detalle.
- Tablas, listas y números concretos ("899 slang words", "the 10 most used vos verbs").
- Fecha de "Updated" visible y real; revisar las guías cada 3 meses (la IA prefiere contenido fresco).
- Autor y "About": quién hace Posta y por qué. No inventar credenciales (ej: no decir que lo revisaron nativos si no pasó).
- Links internos: cada palabra linkea a la guía de lunfardo, cada verbo a la guía de voseo, todo al CTA.
- Schema por tipo: `DefinedTerm` para palabras, `Article` para guías, `FAQPage` donde haya preguntas, `BreadcrumbList`.
- Todo en HTML de texto (no meter las respuestas en imágenes o en JS).

## 5. Fase 2: dónde publicar (afuera de la web)

Esto es lo que más pesa para que ChatGPT/Gemini/Perplexity te recomienden. Reddit y YouTube son las dos fuentes más citadas por la IA en 2026 ([Search Engine Land](https://searchengineland.com/ai-search-engines-cite-reddit-youtube-and-linkedin-most-study-473138), [Adweek](https://www.adweek.com/media/youtube-reddit-ai-search-engine-citations/)); Perplexity y AI Overviews citan sobre todo YouTube.

| Dónde | Qué hacer | Prioridad |
|---|---|---|
| **Stores (App Store / Play)** | Ya está el plan en aso.md. Sumar: pedir rating dentro de la app (falta `expo-store-review`). Los ratings ayudan en la store y los LLM los mencionan. | Alta |
| **Reddit**: r/Spanish, r/learnspanish, r/languagelearning, r/argentina, r/BuenosAires, r/expats, r/digitalnomad | Contestar de verdad hilos existentes ("app for Argentinian Spanish?"), aclarar siempre que sos el creador, respetar las reglas de autopromoción de cada sub. Posts útiles (ej: "50 lunfardo words I wish I knew"). Nada de cuentas falsas. | Alta |
| **YouTube** (@postaspanishapp) | Además de los Shorts, videos de 3–8 min con títulos que son búsquedas ("Argentine slang you'll hear in Buenos Aires"). Descripción completa con link a la guía. La IA lee los títulos, descripciones y transcripciones. | Alta |
| **Blogs de Argentina / expats / viajes** (Ecela Spanish, expatsba, bento.travel, blogs de Buenos Aires) | Pedir que agreguen Posta a sus listas de apps, ofrecer un código de descuento para sus lectores. | Alta |
| **Listas de "best Spanish apps"** (Migaku, etc.) | Mail corto al autor pidiendo inclusión en la sección de "dialectos". | Media |
| **Prensa argentina** (Infobae, La Nación, Clarín, Página/12, TN) | Una historia: "una app enseña lunfardo y voseo a extranjeros, con un carpincho". A los medios argentinos les encanta. Da links muy fuertes y hace que la IA "conozca" la marca. | Media-alta |
| **Directorios de lanzamiento**: Product Hunt, AlternativeTo (como alternativa a Duolingo / Porteño Spanish), BetaList, Indie Hackers, Uneed, Peerlist | 10–20 buenos, no 100 de spam ([dev.to](https://dev.to/alexcloudstar/where-to-list-your-indie-product-and-what-to-skip-56gi)). Product Hunt el mismo día que el lanzamiento. | Media |
| **Grupos de Facebook / WhatsApp de expats en Buenos Aires** | Participar y compartir las guías útiles, no solo el link de la app. | Media |
| **Podcasts y newsletters de idiomas** | Ofrecerte como invitado ("cómo se aprende el español argentino"). | Baja (después) |
| **Wikipedia** | No crear artículo de Posta (no tiene relevancia todavía y lo borran). | No |

## 6. Fase 3: medir (cada mes)

1. **Search Console**: búsquedas, clicks, páginas que crecen. Hay un reporte de AI Overviews / AI Mode.
2. **Bing Webmaster → AI Performance**: citas en Copilot.
3. **Analytics de la web**: visitas con referrer chatgpt.com, perplexity.ai, gemini.google.com, claude.ai, copilot.
4. **Prueba manual de prompts** (gratis, 20 minutos por mes): preguntarle a ChatGPT, Claude, Gemini, Perplexity y Google AI Mode:
   - best app to learn Argentinian Spanish
   - how to learn Argentine slang
   - app to learn vos / voseo
   - learn Spanish before moving to Buenos Aires
   - Duolingo alternative for Argentine Spanish
   - what does boludo mean
   Anotar si aparece Posta y qué fuente cita. Se puede sumar como fila mensual en el dashboard de marketing. Herramientas pagas (Peec, Profound, Otterly) no hacen falta todavía.

## 7. Qué NO hacer
- Comprar links o reseñas, cuentas falsas en Reddit.
- Publicar las 899 palabras de golpe con texto flaco generado en masa.
- Esconder texto "para la IA" o meter listas de keywords.
- Contar con `llms.txt` como palanca.
- Inventar datos, ratings o credenciales en el schema o en las guías.

## 8. Orden recomendado

| Semana | Qué |
|---|---|
| Lanzamiento | Fase 0 completa + Product Hunt + AlternativeTo |
| 1–2 | Script que genera páginas desde Supabase; primeras 100 palabras de slang + 50 verbos de vos |
| 2–4 | 4 guías pilares (incluida la lista "best apps") + primeros posts útiles en Reddit |
| 4–8 | Resto de las guías, cultura, videos largos de YouTube, mails a blogs y prensa |
| Cada mes | Medir (sección 6), sumar palabras que rinden, actualizar fechas |

## Fuentes
- Google: [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) · [Search Engine Land sobre la guía de Google](https://searchengineland.com/google-publishes-guide-on-optimizing-for-generative-ai-features-477671)
- GEO en general: [Wikipedia: Generative engine optimization](https://en.wikipedia.org/wiki/Generative_engine_optimization) · [Frase](https://www.frase.io/blog/what-is-generative-engine-optimization-geo)
- Fuentes que cita la IA: [Search Engine Land (Peec AI, 30M fuentes)](https://searchengineland.com/ai-search-engines-cite-reddit-youtube-and-linkedin-most-study-473138) · [Adweek](https://www.adweek.com/media/youtube-reddit-ai-search-engine-citations/) · [Orbit Media](https://www.orbitmedia.com/blog/ai-citation-sources/)
- llms.txt: [PPC Land / Ahrefs](https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/)
- Bing / ChatGPT: [eseospace: qué está confirmado y qué no](https://eseospace.com/blog/bing-webmaster-tools-indexnow-ai-search/)
- Directorios: [dev.to](https://dev.to/alexcloudstar/where-to-list-your-indie-product-and-what-to-skip-56gi) · [Screenhance](https://screenhance.com/blog/where-to-launch-your-app-2026)
- Competencia en resultados: búsqueda "best app to learn Argentinian Spanish" (2026-10-25): Porteño Spanish, Mergeek, Talkpal, SpeakShark.
