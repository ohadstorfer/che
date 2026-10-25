# Posta — video and post formats

The formats we make for Instagram, TikTok and YouTube Shorts. Each one ends on the app.

## Live

| Format | What it is | How it's made |
|---|---|---|
| **Can you understand <celeb>?** | A real clip of a famous Argentinian (Messi, Milei, Susana…): plain, then slow with each word lit and explained, then once more at full speed. | Skill `posta-celeb-video`. Files: `posta-videos/celeb-*`. |
| **Day N of Understanding Argentinians** | Same as above, with ordinary people and memes (a kid, an inspector, Julio, a dad), plus the AI host Martina. | Skill `posta-celeb-video` + `social/host-clip.mjs`. |
| **Versus (Pancho)** | Two Pancho capybaras side by side, each saying his word for the same thing (TÚ tienes vs VOS tenés). | Skill `posta-versus-video`. |
| **Pancho explains** | Pancho explains one topic: texting, puteadas, voseo, asado, fútbol, mate, money, che… | `posta-videos/01-texting.mp4` … `10-che.mp4`. |
| **Carousels / slideshows** | Swipeable images: word lists, slang, culture. | Canva and the "Posta carousels" canvas (https://claude.ai/artifact/SPLbCypu9LuCSFQaMa6ajt). |
| **Stop saying X, say Y** (carousel) | The Drake carousel (6 rows: everyday, food, vos, small talk, city, home) with a "Stop saying these" cover + STOP sign. Inside slides and ending unchanged. | `social/carousels/stop-saying/`: `cover.dc.html` (template), `rows.json` (fields: top, bottom, topic), `node gen.mjs <out>`. Covers are `SS-G1…G6` on the canvas's Drake page. |

## Approved, to make later (frames ready, videos not made yet)

Approved by the user on 2026-10-22 ("los amo"). Storyboards are on the Posta carousels canvas. To turn one into a video: AI girl clip (paid, needs OK) + screen recording of the app screen named on the frame + render.

### Crying hook (10 reels)

The simplest one. Frame 1 (0–3 s): the AI girl crying, the hook as a caption ("After 3 years of learning Spanish, it's my first day in Argentina and I can't understand anything"). Frame 2 (3–8 s): a quick demo of the app with one line on top. Only the hook changes, plus what she does, the app line and which screen to record.

`social/reels/crying-hook/`: `hooks.json` (10 hooks), `python3 gen.py <out>` draws the frames for the canvas page "Crying hook (10)".

## Planned (not built yet)

### AI UGC reaction + app demo

An AI-made "real person" (an English-speaking learner, not Argentinian) reacts on camera with a relatable line, then a screen recording of the app.

- **0–2 s:** her face + the hook on screen (laughing or frustrated).
- **2–6 s:** the app: the Pancho call (Hablar), VOS vs TÚ, slang cards or culture cards.
- **End:** "Comment **CHE** (or **SUEGRA**) and I'll send you the app" → needs an auto-DM tool (ManyChat or similar).
- Same app footage under 5–6 different hooks; keep the best one.

Inspiration: mae.spanish, "3 years of studying Spanish and I just find this now… like wtf 😭".

**Main theme: the Argentine boyfriend and his family.** Hooks to test first:

- "I'm meeting my Argentine boyfriend's parents in 2 weeks and I only know 'hola' 😭"
- "POV: your first asado with his family and everyone talks at once" (show Pancho fast, then 🐢)
- "My boyfriend calls me 'gorda' and I almost broke up with him. Turns out it's sweet 🥲"

More boyfriend hooks: his mom says "qué linda, nena"; don't use "usted" with his mom; the 5-hour Sunday lunch; being offered mate; grandma asking "¿para cuándo los nenes?"; understanding his mom's voice notes; football arguments; first Argentine Christmas at 35 °C; general ones ("3 years of Spanish, landed in Buenos Aires, understood NOTHING", "Duolingo taught me 'autobús', here it's bondi").

### Viral formulas (approved 2026-10-22, storyboarded as reels, to make later)

All of these are **reels** (9:16), never carousels. Each is storyboarded frame by frame on the "Viral formulas" page of the Posta carousels canvas: frame 1 = ~3 s of the AI girl with the hook as a caption, then the content, then the app, then the shared ending ("Comment CHE and I'll send you the app").

Comments (the algorithm pushes them):
- **Guess the meaning:** "What does *estar al horno* mean? Answer in the comments before I tell you." Pancho reveals it at the end.
- **Only 1% understand this audio:** a very fast Argentine audio, "did you get it?", then the app's 🐢 slow mode.

Shares:
- **Words you can NOT say in Argentina:** *coger*, *concha*, *pico*: normal elsewhere, rude here.
- **Spanish class vs Buenos Aires:** a two-character skit. "¿Cómo estás?" vs "¿Qué onda, todo bien?".
- **Nobody: / Argentines:** memes on trending audios (e.g. Argentines saying goodbye for 45 minutes).

Saves:
- **Stop saying X, say Y:** "Stop saying *¿cómo estás?* in Argentina, say *¿todo bien?*" (Fluently's formula).
- **Carousel: Argentine WhatsApp dictionary:** *dale, ndea, bldo, tqm*.

Series:
- **Day N of learning Argentine Spanish for my boyfriend:** the AI UGC girl as a daily series, getting better each day.
- **Translating my Argentine boyfriend's texts:** a made-up chat screenshot, decoded line by line.

Dropped: Pancho replies to comments (not chosen for now).
