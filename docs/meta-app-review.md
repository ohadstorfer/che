# App Review de Meta: Posta Scheduler

Pedido de acceso avanzado para que el DM de las guías gratis (comment GUIDE / VOS / LEARN) le llegue a cualquiera que comente, no solo a las cuentas con rol en la app. Desde el 2026-11-09 la app es **Tech Provider** (no se puede volver atrás). Meta revisa la app entera, así que entran también los permisos del programador de posts.

Formulario: developers.facebook.com → Posta Scheduler → Revisar → Revisión de la app.

## Lo que falta y quién lo hace

| Paso | Quién |
| --- | --- |
| Verificación del negocio (PICAWAVE, LLC, documentos de la empresa) | Vos |
| Video de pantalla (abajo el guion) | Vos lo grabás, yo lo subo |
| Llamadas de prueba a la API (tardan hasta 24 h en aparecer) | Ya hechas con la prueba del 2026-11-09; las que falten, yo |
| Textos de cada permiso, tratamiento de datos, instrucciones para revisores | Yo, en el formulario |
| `pages_read_user_content`: Meta lo pide para `pages_manage_engagement` | Yo lo sumo |
| Enviar | Vos me das el OK |

## Guion del video (uno solo, sirve para todos los permisos)

Grabá la pantalla de la compu (QuickTime → Nueva grabación de pantalla), 1–2 minutos, en inglés o sin voz:

1. **Publicar:** mostrá el programador (la cola de social-queue o un post ya publicado por la app en Instagram y en la página de Facebook) → cubre `pages_manage_posts`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`, `instagram_basic`, `business_management`.
2. **Comentario → DM:** desde otra cuenta (con rol en la app), comentá **GUIDE** en un post de @postaspanish.
3. Mostrá la **respuesta pública** debajo del comentario ("Sent! Check your DMs") → `instagram_manage_comments`, `pages_manage_engagement`.
4. Mostrá el **DM** que llegó con el link → `instagram_manage_messages`, `pages_messaging`, `pages_manage_metadata` (webhook).
5. Tocá el link: se abre postaspanish.com/free/slang con la guía.
6. Repetí 2–4 en la página de Facebook (comentario → DM en Messenger).

## Textos por permiso (inglés, como los pide Meta)

**instagram_manage_comments**
Posta (postaspanish.com) is a language-learning app. On our own Instagram account, @postaspanish, our posts invite people to comment a keyword (GUIDE, VOS or LEARN) to receive a free study guide. Our server receives the comment through the Instagram comments webhook, checks whether it contains one of these keywords, and replies to that comment publicly ("Sent! Check your DMs") so the person knows to look in their inbox. We only read and reply to comments on our own account's media. We do not delete or hide comments, and we store only the comment ID, the keyword and whether the reply was sent, so that each comment is answered once.

**instagram_manage_messages**
When someone comments a keyword (GUIDE, VOS or LEARN) on a post of our own Instagram account, @postaspanish, our server sends that person a single private reply to the comment (Instagram's private replies) with a link to the free guide they asked for on postaspanish.com. It is one message per comment, sent only because the person asked for it in their comment, within the 7-day window. We do not send marketing messages and we do not read or store other conversations.

**pages_messaging**
Same flow as on Instagram, for our own Facebook Page, "Posta: Argentinian Spanish". When someone comments a keyword (GUIDE, VOS or LEARN) on one of our Page's posts, our server sends one private reply to that comment in Messenger with the link to the free guide they requested. It is one message per comment and only in response to that comment. No promotional or unsolicited messages are sent.
*Reproducir:* comment "GUIDE" on any post of facebook.com/postaspanish (or our Instagram @postaspanish) from a test account with a role in the app; within seconds you receive a Messenger/Instagram DM with a link to postaspanish.com/free/slang and a public reply under the comment.

**pages_manage_metadata**
We use this permission to subscribe our app to the webhooks of our own Facebook Page ("feed" field) and of its connected Instagram account ("comments" field). This is how our server learns that someone commented a keyword asking for a free guide, so it can send them the guide. We do not change any other Page settings.

**pages_manage_engagement**
When someone comments a keyword (GUIDE, VOS or LEARN) on a post of our own Facebook Page, our app replies to that comment publicly ("Sent! Check your inbox") so the person knows the guide was sent privately. We only reply to comments on our own Page's posts; we do not like, edit or delete other people's content.

**pages_read_user_content**
Required for pages_manage_engagement. We read the text of comments left on our own Page's posts only to check whether they contain a keyword asking for a free guide (GUIDE, VOS or LEARN). We keep only the comment ID, the keyword and whether our reply was sent.

**pages_manage_posts**
Our app publishes our own content (short educational videos and images about Argentine Spanish) to our own Facebook Page, "Posta: Argentinian Spanish", on a schedule we set (about 3 posts a day). Only our team uses the app and it only publishes to the Page our business owns.

**instagram_content_publish**
Our app publishes our own educational reels and image carousels about Argentine Spanish to our own Instagram professional account, @postaspanish, on a schedule we set. Only our team uses the app and it only publishes to the account our business owns.

**instagram_basic**
We read the basic profile and the media list of our own Instagram account, @postaspanish, to confirm which account we publish to, to check that scheduled posts went live, and to know which post a comment belongs to when we send the requested guide.

**pages_show_list**
We use it to find our own Facebook Page, "Posta: Argentinian Spanish", among the Pages our business manages, so the app publishes and answers comments on the right Page.

**pages_read_engagement**
We read our own Page's posts and their comment IDs to confirm scheduled posts were published and to answer comments that ask for a free guide on the right post.

**business_management**
Our app runs with a system user of our own business portfolio, "Posta: Learn Argentine Spanish". We use business_management only to access the Page and Instagram account that this business owns. We do not manage other businesses' assets.

## Instrucciones para revisores

Posta Scheduler is an internal tool of Posta (postaspanish.com), a language-learning app. It is not used by other businesses: it runs on our server with a system user of our own business portfolio and only acts on our own Facebook Page ("Posta: Argentinian Spanish") and our own Instagram account (@postaspanish). There is no login screen for third parties.

What it does:
1. Publishes our own educational posts to our Page and Instagram on a schedule.
2. When someone comments GUIDE, VOS or LEARN on one of our posts, it replies to the comment publicly and sends one private reply with a link to the free guide (postaspanish.com/free/slang, /free/vos, /free/learn).

To test: comment "GUIDE" on any recent post of instagram.com/postaspanish or facebook.com/postaspanish. You will get a public reply and a DM with the link within seconds. (Until approval this only works for accounts with a role in the app; we can add your test account as a tester.)

## Tratamiento de datos (respuestas sugeridas, confirmalas vos)

- **¿Encargados del tratamiento con acceso a los datos de la plataforma?** Sí: **Supabase, Inc.** (base de datos y funciones del servidor, donde se guardan el ID del comentario, el ID y el nombre de quien comentó, y los tokens de Meta como secrets). Los servidores de Supabase corren en AWS.
- **Responsable de los datos:** PICAWAVE, LLC. **País:** Estados Unidos.
- **¿Diste datos a autoridades por seguridad nacional en los últimos 12 meses?** No.
- **Procesos ante pedidos de autoridades:** sugerido "Política de minimización de datos" (guardamos lo mínimo). Marcá solo lo que de verdad hagan; si no hay ninguno formal, "Ninguna de las anteriores".

## Estado al 2026-11-09

- Tech Provider: sí (irreversible).
- Descripciones cargadas en los 12 permisos (`pages_read_user_content` sumado por `pages_manage_engagement`). `pages_messaging` tiene también los pasos para reproducir.
- Falta: verificación del negocio, video (uno, subido a cada permiso), tildar "Confirmo que cumpliré con el uso permitido" en cada permiso, tratamiento de datos, instrucciones para revisores (texto arriba), llamadas de prueba que Meta aún no cuente (hasta 24 h), y enviar.
