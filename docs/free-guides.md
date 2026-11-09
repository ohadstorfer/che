# Guías gratis por comentario ("comment GUIDE")

Un post dice *"Comment GUIDE and I'll send you the free guide"*. Quien comenta recibe un DM con el link, y el comentario recibe una respuesta pública ("Sent! Check your DMs 📩"). La página muestra la guía entera, abierta, con el botón del PDF; al final invita a bajar la app y ofrece (opcional) mandar el PDF por mail.

## Las guías

| Palabra | Guía | Página |
| --- | --- | --- |
| **GUIDE** (o GUIA, SLANG) | The Argentine Slang Pack: las 50 palabras de todos los días | postaspanish.com/free/slang |
| **VOS** | The Vos Cheat Sheet: la regla, los imperativos y los 50 verbos | postaspanish.com/free/vos |
| **LEARN** | How to Learn Argentine Spanish: los 5 pasos del video de YouTube + un plan de 30 días | postaspanish.com/free/learn |

La palabra tiene que ser la idea del comentario: un comentario corto (hasta 3 palabras, sin contar emojis) o la palabra en mayúsculas. Así "GUIDE 🙏" y "vos please" reciben el DM, pero un argentino que escribe "vos sos un capo" no.

## Cómo funciona

- **Páginas y PDFs:** `node scripts/site/build-free.mjs` arma `posta-site/free/` (las 3 páginas, `free.css`, `free.js` y `pdf/*.pdf` con Chrome headless). Para publicar: `aws/deploy-free.sh`. El contenido sale de `docs/argentine/words.yaml`, de `scripts/site/vos.mjs` y del guion de YouTube. Las páginas son `noindex` para no competir con las de SEO.
- **Mail:** `functions/free-guide` guarda el mail en `public.guide_leads` (uno por mail y guía) y manda un solo mail con el PDF (Resend). Es opcional: la guía no se bloquea. Hay que avisar en la página que es un solo mail: no hay link para darse de baja.
- **DMs:** `functions/meta-comments` es el webhook de Meta. Cada comentario se procesa una sola vez (`public.comment_dms`, con dm_ok, reply_ok y el error si hubo). Meta permite un solo DM por comentario, dentro de los 7 días.
- **Métricas:** PostHog recibe `guide_email` y `guide_pdf` con `guide` y `source` (`ig-dm`, `fb-dm`, `email`…).

## Activarlo en Meta (una sola vez)

1. **developers.facebook.com → Posta Scheduler → Casos de uso:** sumá los permisos `pages_messaging`, `pages_manage_metadata`, `pages_manage_engagement`, `instagram_manage_comments` e `instagram_manage_messages`.
2. **Business Suite → Usuarios del sistema:** generá un token nuevo para Posta Scheduler, que no venza nunca, con esos permisos más los que ya tenía (`pages_show_list`, `pages_read_engagement`, `instagram_basic`).
3. Corré `node social/meta-dm-setup.mjs`. Te pide el token y el app secret, suscribe la página y guarda los secrets (`META_DM_TOKEN`, `META_APP_SECRET`, `META_VERIFY_TOKEN`). Al final te muestra lo que hay que pegar.
4. **App → Webhooks:** pegá el Callback URL y el Verify token en "Page" (campo `feed`) y en "Instagram" (campo `comments`).
5. En Instagram: **Configuración → Mensajes → Herramientas conectadas → permitir acceso a los mensajes** (si no, la API no puede mandar DMs).
6. Probá comentando GUIDE desde otra cuenta.

**App Review:** mientras la app está en modo desarrollo, solo reciben DMs las cuentas que tienen un rol en la app (vos, testers). Para que le llegue a cualquiera, Meta tiene que aprobar `instagram_manage_messages`, `instagram_manage_comments` y `pages_messaging` con acceso avanzado (App Review, con un video que muestre el flujo). Eso tarda de días a semanas.

**TikTok y YouTube** no tienen API para mandar DMs. Ahí el post dice "link in bio" (poné postaspanish.com/free/slang en la bio o en /links), o se contesta a mano.

## Para escribir los posts

- Gancho + promesa concreta: *"50 Argentine words you'll hear every day. Comment GUIDE and I'll DM you the free pack."*
- La palabra en mayúsculas en el caption y en el video.
- Los DMs de cuentas que no te siguen caen en "Solicitudes"; la respuesta pública ya lo avisa.
