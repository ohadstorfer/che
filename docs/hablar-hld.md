# Che — Hablar (speaking) HLD

Status: **draft for discussion**, 2026-09-25 (data flow added the same day). Nothing here is built. Monetization is out of scope
(see `monetization-hld.md`, to be revisited).

A fourth tab where the learner talks out loud with **Pancho**, a porteño who speaks only rioplatense
Spanish with voseo. Turn-based: the learner records, checks the transcript, sends; Pancho answers in
text and audio, fixing mistakes casually inside his reply.

The flow follows what the leading tutors do (Duolingo Video Call / Roleplay, Babbel Speak, Speak,
Langua) and the corrective-feedback research. Sources are in §9.

---

## 1. Decisions

| Topic | Decision |
|---|---|
| Mode | **Turn-based**, not a live call. |
| Content | **Scenarios**, **culture topics**, **free chat**. No goals (removed 2026-09-30): Pancho leads the conversation. |
| Character | **One**: Pancho, using the existing `tomas` ElevenLabs voice. Backstory and avatar: later. |
| Input | **Voice only.** Tap to start, tap to stop. |
| Level | Defaults to the learner's **course level**; they can override it (Easier / My level / Harder). Each level has a strict grammar list (`LEVEL_GRAMMAR`: A1 is present tense only) that the reply, the "better" line, hints and summary phrases all follow. |
| Limit | **1 conversation a day, about 2 minutes** (hard stop 3:00), reset at **local midnight**. The timer counts the whole session and pauses when the app is in the background. |
| Ending | **Pancho decides** when the chat is over and ends his goodbye with a `[FIN]` marker the server strips. He is nudged at 1:40 (or 6 exchanges) and told to close at 2:30 (or 10). |
| Corrections | Pancho recasts the mistake **inside his reply**. The exact fix and its explanation are **always shown under the user's message** (since 2026-09-30), no tap needed. |
| Message tools | User: ✏️ correction + "Explain" · 🪄 better phrasing + **"Decilo"**. Pancho: ▶️ replay · 🐢 slow · 🔤 translate. |
| Tone | **Relaxed porteño.** Understands and explains lunfardo and puteadas, never insults the learner. |
| History | Saved, with an **end-of-chat summary**. |
| Streak | **Opening and closing a chat** counts for the streak/XP. |
| Links | A culture topic has a "Hablá de esto con Pancho" button. |
| Speech-to-text | **Cloud**, forced to Spanish. |
| Placement | New tab **Hablar**, next to Home / Words / Culture. |

---

## 2. The flow

```
Hablar tab ─▶ pick a door ─▶ Brief ─▶ Conversation ─▶ Wrap-up ─▶ Summary
```

### 2.1 Hablar tab
- **Today's chat** card: available / done today (resets at midnight). When it's done: "Volvé mañana"
  plus a link to today's summary.
- **Scenarios** first, then **Culture**, then **Free chat**, then **History**.
- A level chip ("Nivel: el tuyo ▾") that sets the override.

### 2.2 Brief (before speaking)
All the tutors studied show this. It removes the "what do I say?" freeze.
- **Scenario**: one line of setting ("Estás en un kiosco de Palermo…"), **2–3 goals** ("Pedí un
  alfajor", "Preguntá cuánto sale", "Pagá con transferencia"), and **3–4 key phrases** with ▶️.
- **Culture**: the topic title and 3 key words from that culture section.
- **Free chat**: no goals, just "Pancho te va a hacer preguntas. Hablá de lo que quieras."
- One button: **Empezar**. The 5:00 timer starts here.

### 2.3 Conversation
- **Pancho speaks first**, with a level-appropriate opening line. Openers are pre-recorded (§4.3), so
  it plays at once.
- **Goals strip** under the header (scenarios only): goals tick off as Claude reports them done.
- **One turn**:
  1. Tap 🎙️ → record (max 45 s) → tap to stop.
  2. Client check: too short (< 0.6 s) or too quiet → "No te escuché" and nothing is sent.
  3. The **transcript shows as a draft bubble** with **Enviar** and **Grabar de nuevo**. This matters:
     accented speech gets misheard, and silence can come back as invented text.
  4. Send → "Pancho está pensando…" → his reply streams in, and audio starts on the first sentence.
  5. The correction badge fills a moment later (a separate, parallel call, §3.2).
- **💡 Hint**, in levels: first a Spanish starter ("Quiero un…"), tap again for a full suggested
  reply, tap again for its English meaning. Reading a hint aloud is still speaking. If hints are used
  2 turns in a row, Pancho simplifies.
- **"¿Cómo?"**: the learner can just say it (or tap ▶️/🐢). Pancho rephrases more simply, as a person
  would.
- **English slips** are fine: Pancho answers with the Spanish version in his reply ("Ah, ¿querés
  *pagar con tarjeta*? Dale…").

### 2.4 Wrap-up
- At **4:30**, or once all goals are done, the server tells Pancho to close. He finishes the topic and
  says goodbye in character ("Bueno, me tengo que ir, ¡nos vemos!"). This is Duolingo's "whisper"
  pattern.
- At 5:00 the mic locks after the turn in flight. The learner can also end early from ⋮ (it still
  counts, per the streak rule).

### 2.5 Summary
Generic summaries are the top complaint about these apps, so keep it concrete and short:
- **Goals**: ✓ / ✗ for each (scenarios).
- **Top 3 corrections**: what you said → better, each with ▶️ and **Decilo**.
- **Phrases worth keeping**: 3–5 from Pancho's replies or the "better" versions.
- **What went well**: one line, specific ("Usaste bien *querés* y *tenés*").
- **Streak / XP** animation, then back to the tab.

The full transcript stays under History.

---

## 3. Feedback rules

### 3.1 How Pancho corrects
From the research: recasts inside the conversation are gentle and last well. Explicit correction
works better short-term. Prompting the learner to fix the error themselves ("Decilo") beats both. We
use all three, in layers:

| Layer | When | What |
|---|---|---|
| Recast in Pancho's reply | During the chat, **max one per turn** | Pancho says the right form naturally and keeps talking. |
| Badge on the user's message | Tap, any time | Strike-through diff + "Explain" (explicit). |
| Decilo | Optional, in the sheet and the summary | The learner says the fixed version again. Never blocks the chat. |

**Which error gets the one recast**, in order:
1. Errors that block meaning.
2. The course's target structures at the learner's level (voseo verb forms, gender and agreement).
3. Everything else goes only to the badge and the summary.

**Rioplatense leniency**: *tú* forms are recast to *vos*, and never counted as an error at A1. Don't
penalise pronunciation of *ll/y* (the text never sees it anyway).

### 3.2 Two calls per turn
1. **Reply call** (streamed): Pancho's reply, with the recast included. Returned first.
2. **Feedback call** (in parallel, structured): `{ has_error, corrected, spans, why_en, better, goals_done }`.
   It fills the badge (with the "Explain" text already inside), the 🪄 sheet and the goals strip
   about a second later.

Details in §4.5.

The reply never waits for grading.

---

## 4. Data flow

The PWA is the primary platform (`src/lib/audio.ts`: MediaRecorder recording, Safari → `audio/mp4`
AAC, Chrome → `audio/webm` Opus). Native comes second; the differences are in §4.8.

### 4.1 Principles
- **The server builds every prompt.** The client sends only ids (`session_id`, `turn_id`), never
  prompt text. The same pattern as `explain-answer`.
- **The server keeps the transcript.** `reply` takes a `turn_id` and uses the text *it* transcribed.
  A typed line (the keyboard next to the mic, added 2026-09-29) goes through `hablar-transcribe` as
  `text` instead of `audio` and is stored the same way, so `reply` still never takes text from the client.
- **The server clock decides.** The daily limit, the deadline and the wrap-up are all computed on the
  server. The client timer is only a display.
- **Stream what the learner waits for; save everything else in the background.** Replies stream as
  SSE. Storage uploads, turn rows and usage logs go in `EdgeRuntime.waitUntil`.
- **Anything we can pre-record, we pre-record.** Openers and key phrases are made offline with the
  course TTS script, so a chat starts instantly and costs nothing.

### 4.2 Pieces

```
Client (PWA)                Edge functions (Deno)              Vendors / Supabase
────────────                ─────────────────────              ──────────────────
Hablar tab ───────────────▶ hablar-start      (JSON)
Mic ── blob ──────────────▶ hablar-transcribe (multipart→JSON) ─▶ ElevenLabs Scribe v2
Enviar ───────────────────▶ hablar-reply      (SSE)          ─┬▶ Claude (stream)  → reply
                                                              ├▶ Claude (schema)  → feedback
                                                              └▶ ElevenLabs TTS (per sentence)
💡 / 🔤 ──────────────────▶ hablar-assist     (JSON)          ─▶ Claude (schema)
Decilo ─────────────────────▶ hablar-transcribe (purpose=dilo)  ─▶ Scribe, compared on the server
Volver / time up ─────────▶ hablar-end        (JSON)          ─▶ Claude (schema) → summary
                                    │
                                    └──waitUntil──▶ Storage `hablar` bucket · Postgres rows · usage log
```

Five functions, all shaped like `explain-answer` (they check the caller's JWT, then use a
service-role client). The Anthropic, ElevenLabs and service-role keys live only in function secrets.

### 4.3 `hablar-start`: open the chat
**In:** `{ kind, topic_id?, level_override? }` → **Out:** `{ session_id, deadline_at, opener: { text, text_en, audio_url }, goals, key_phrases }`

1. Check the JWT → `user_id`. Read `profiles.timezone` → `local_date`.
2. Insert the `conversations` row. The unique `(user_id, local_date)` key rejects a second chat that
   day → 409 `{ done_today, summary_id }`.
3. Resolve the level: `override ?? level of the learner's current course section`.
4. Pick the opener from the bundled scenario (or the free-chat / culture pool for that level). It is
   **pre-recorded**, so there's no Claude or TTS call. Its text is written in as turn 0.
5. Return. The 5:00 starts from `started_at` on the server.

### 4.4 `hablar-transcribe`: speech → text
**In:** multipart `{ audio blob, session_id, turn_id, purpose: 'turn' | 'dilo', target? }` → **Out:** `{ text }` or `{ status: 'ok'|'almost'|'again', text }`

1. JWT → session owner. `now < deadline + 30 s` (grace for the turn in flight). `turn_id` already
   exists → return its stored text (idempotent retry).
2. Reject a body over 1.5 MB (≈ 45 s of audio). The client already drops clips < 0.6 s or silent.
3. Send the **bytes as they are** to Scribe (no transcoding; both mp4/AAC and webm/Opus are accepted):
   `model_id=scribe_v2, language_code=es, tag_audio_events=false, no_verbatim=false,
   temperature=0, keyterms=[scenario phrases + voseo forms at this level]` (no `enable_logging=false`: zero-retention mode is Enterprise-only and returns 403).
4. Empty text, or a known silence hallucination ("gracias por ver…") → `{ text: '' }`, and the client
   says "No te escuché".
5. **purpose=turn:** insert the user turn as a **draft** (`text`, `audio_path`, `status='draft'`)
   and return the text for the confirm bubble. A re-record replaces the draft for the same `turn_id`.
   **purpose=dilo:** normalize both texts (the `answerKey` from `explain-answer`) and compare with
   `target`: equal → ok, one word off → almost, otherwise again. No Claude call.
6. `waitUntil`: upload the blob to `hablar/{user_id}/{session_id}/{turn_id}.{m4a|webm}` and log usage
   (audio seconds).

### 4.5 `hablar-reply`: the turn (SSE)
**In:** `{ session_id, turn_id }` (after Enviar) → **Out:** an SSE stream over a POST `fetch`

```
event: text      data: {"seq":0,"delta":"Jaja, "}
event: audio     data: {"seq":0,"mp3":"<base64>"}        ← one per sentence, in order
event: feedback  data: {"has_error":true,"corrected":"…","spans":[…],"why_en":"…","better":"…","goals_done":["pay"]}
event: done      data: {"turn_id":"…","wrap_up":false,"ended":false}
event: error     data: {"stage":"claude|tts","retry":true}
```

1. JWT, owner, draft turn exists. Turn already `final` → replay the stored result as one burst.
2. **Deadline logic:** `elapsed = now − started_at − paused_seconds` (the client reports pauses,
   and the total is capped at 15 min of real time). `elapsed ≥ 4:30` or all goals done →
   `wrap_up = true`. `elapsed ≥ 5:00` after this turn → `ended = true`.
3. Mark the user turn `final`. Load the history (at most the last 20 turns; a 5-minute chat fits).
4. Start two Claude calls **in parallel**:
   - **Reply** (streamed): cached system prompt (§4.6) + history, plus a one-line note at the end when
     `wrap_up` ("Cerrá la charla en esta respuesta, despedite"). Max 40 words.
   - **Feedback** (non-streamed, structured output): the learner's line + the goals + the level →
     `{ has_error, corrected, spans, why_en, better, goals_done }`. `why_en` is the
     "Explain" text, so tapping Explain costs no extra call.
5. **Sentence pipe**, as reply deltas arrive:
   - Send `text` events straight away.
   - Buffer until a sentence end (`. ! ? …` followed by a space, keeping `¿¡` and abbreviations
     together; force a cut at 200 chars).
   - Run the **rioplatense guard** (§4.9) on the finished sentence.
   - Send it to ElevenLabs `/stream` (Flash v2.5 or Multilingual v2, decided in Phase 0), `mp3_44100_128`,
     with `previous_text` for continuous prosody. Several sentences may be in TTS at once, but
     `audio` events are **sent in order** by `seq`.
6. Send `feedback` whenever it resolves (usually before the second sentence's audio). Then `done`.
7. `waitUntil`: insert the Pancho turn (text, feedback on the user turn, `goals_done` merged into the
   session), join the sentence mp3s into one file → `hablar/…/{turn_id}-tomas.mp3`, and log usage
   (input, output and cached tokens, TTS characters).

**If the client drops mid-stream**, the work continues under `waitUntil` and the turn is saved. On
reconnect the client calls `reply` again with the same `turn_id` and gets the stored turn (step 1).

### 4.6 Prompt layout and caching
```
system (cached, ≥ 1,024 tokens or it silently won't cache):
  [persona: Pancho, porteño, voseo, relaxed-but-kind rules, safety]
  [feedback policy: one recast per turn, the priority order in §3.1]
  [level block: CEFR band, tenses taught, word list]           ← stable per session
  [scenario / culture block: setting, goals, key phrases]      ← stable per session
messages: history … + latest user line (+ wrap-up note)
```
5-minute cache TTL: each turn refreshes it, and a chat never idles that long. The feedback call has
its own cached prefix. The reply and feedback calls are kept apart because structured output changes
the cache key. Check `cache_read_input_tokens` in the usage log.

### 4.7 `hablar-assist` and `hablar-end`
- **assist** `{ session_id, kind: 'hint'|'translate', turn_id? }`
  - hint → one structured call returning `{ starter, full, full_en }`. The client reveals them in
    levels. Max 3 per chat (counted on the session).
  - translate → the English of a Pancho turn, **cached on the turn row** (`text_en`), so a second tap
    is free. Openers come with their English pre-written.
- **end** `{ session_id, reason: 'user'|'time' }`, idempotent:
  1. Close the session (`ended_at`).
  2. Build the summary from **stored data**: goals from the session row, and the top 3 corrections
     picked from the feedback already on the turns, with no re-grading. One structured call adds
     "phrases worth keeping" + "what went well".
  3. `bump_streak(local_date)` and XP.
  4. Save `summary` jsonb and return it.
  - **App killed mid-chat:** the next time the Hablar tab opens and finds an unclosed session, it
    calls `end` itself. If that happens on a later local day, the streak isn't bumped for the old day
    (`bump_streak` works on today).

### 4.8 Client transport and playback
- **Transport:** `supabase.functions.invoke` can't stream, so `hablar-reply` is a direct
  `fetch(POST)` to the function URL with the JWT, reading `response.body.getReader()` and parsing
  SSE by hand. The other functions use `invoke`.
- **Web playback (the risky part):**
  - Create or resume one `AudioContext` **inside the Enviar tap**.
  - The existing `setAudioSession('playback')` helper already handles Safari's silent switch.
  - For each `audio` event: `decodeAudioData(mp3)` → schedule it right after the previous buffer
    ends. No MediaSource: support is spotty on iOS.
  - 🐢: `playbackRate = 0.75` on replay from the stored file.
  - ▶️: signed URL of `{turn_id}-tomas.mp3` (short TTL).
- **Native (later):** `expo/fetch` supports `getReader()`. Write each sentence to a temp file and
  queue them in `expo-audio`.
- **Timer:** display only. It pauses on `visibilitychange: hidden` and sends `paused_seconds` with
  the next request.

### 4.9 Rioplatense guard
The same idea as `explain-answer`'s check, applied to whole sentences: `TUTEO` / `REGIONAL` from
`_shared/rioplatense.ts`, with a new `offendingWords(text)` that scans all words, not just italics.
- On a hit, that sentence is regenerated once (a small non-streamed call: "rewrite with vos") before
  TTS.
- If it still fails, the sentence is sent anyway and logged. A stalled chat is worse than one slip.

### 4.10 Latency budget (target: first audio ≤ 2 s after Enviar)

| Step | Target |
|---|---|
| Enviar → function (warm) | 100–200 ms |
| Claude first sentence (cached prompt) | 600–900 ms |
| TTS first chunk (Flash v2.5) | 150–400 ms |
| Download + decode + play | 100–200 ms |

Transcription (~1–2 s, unverified) happens **before** Enviar, while the learner reads the confirm
bubble, so it isn't counted here.

### 4.11 STT must keep the mistakes (Phase 0 gate)
Scribe transcribes verbatim, but ASR leans toward correct Spanish, so some learner errors may be
quietly fixed. Before any UI: record ~30 clips with deliberate errors ("un manzana", "yo tiene",
tú forms) in non-native accents, and measure how many errors survive, with and without `keyterms`.
Run the same test to A/B **Flash v2.5 vs Multilingual v2** for Pancho's rioplatense prosody.

---

## 5. Data

```sql
conversations (
  id uuid pk, user_id uuid, local_date date,   -- unique (user_id, local_date)
  kind text, topic_id text null, level text,
  started_at timestamptz, ended_at timestamptz null,
  paused_seconds int default 0, hints_used smallint default 0,
  goals_done text[] default '{}',
  summary jsonb null
)

conversation_turns (
  id uuid pk,                       -- = client turn_id (idempotency key)
  conversation_id uuid, idx int,
  role text,                        -- 'user' | 'tomas'
  status text,                      -- user turns: 'draft' → 'final'
  text text, text_en text null,
  audio_path text null,
  feedback jsonb null,              -- on user turns
  created_at timestamptz
)

hablar_usage (                      -- cost per call, written in waitUntil
  id bigserial, conversation_id uuid, turn_id uuid null,
  provider text, model text, stage text,     -- 'stt'|'reply'|'feedback'|'hint'|'translate'|'summary'|'tts'|'guard'
  input_tokens int, output_tokens int, cache_read_tokens int,
  audio_seconds real, tts_chars int, ms int, created_at timestamptz
)
```

- **RLS:** owners `select` their own conversations and turns. There are no client writes; only
  functions write.
- **Storage:** a private bucket `hablar`, with paths `{user_id}/{session_id}/…`. The read policy is
  `(storage.foldername(name))[1] = auth.uid()::text`. Playback uses signed URLs.
- **Retention:** a pg_cron job deletes recordings older than 30 days through the Storage API. The
  transcripts stay.
- **Static content:** scenarios, openers, key phrases and their audio are authored in YAML, recorded
  by a `hablar:tts` script (like `course:tts`, in the `tomas` voice), and bundled as JSON.

## 6. Scenarios (v1)

Authored like culture: `docs/hablar/scenarios.yaml` → validated → bundled JSON. Each has an id,
setting, Pancho's role, 2–3 goals, 3–4 key phrases, a level range and an opening line. The first
eight follow the course's own A1 topics, so a learner can use what they just studied:

| # | Scenario | Pancho is… | Goals (example) | From |
|---|---|---|---|---|
| 1 | **Café** | the mozo | order a café con leche and medialunas · ask for the check | A1.1 |
| 2 | **Kiosco** | the kiosquero | ask for an alfajor · ask the price · pay | A1.1 |
| 3 | **Conocer a alguien** | a guy at a party | say your name · where you're from · what you do | A1.1–A1.2 |
| 4 | **Verdulería** | the verdulero | ask for fruit by the kilo · ask what it costs | A1.2–A1.3 |
| 5 | **Perdido en el barrio** | a neighbour | ask where a place is · understand left/right | A1.3 |
| 6 | **Colectivo** | a passenger | ask which bus goes somewhere · ask about the SUBE | A1.3 |
| 7 | **Planes para el finde** | a friend | propose a plan · agree on a time | A1.3 |
| 8 | **Parrilla** | the mozo | order meat and a drink · ask for a recommendation | A2 |

Mate, asado and fútbol are left to the Culture door, which already has that content.

---

## 7. Safety and tone

Relaxed porteño: he explains puteadas and lunfardo and laughs along, but never insults the learner.
Hard limits: no sexual content, no hate, no real-world advice beyond chit-chat. Off-topic questions
get a short in-character redirect. Any message can be flagged from ⋮.

---

## 8. Phases

**Phase 0: gates** (§4.11). STT keeps learners' errors; pick the TTS model; check the web audio
playback on iOS Safari (silent switch, autoplay) with a throwaway page.

**v1**
- Hablar tab, brief, conversation, wrap-up, summary, history
- `hablar-start / transcribe / reply / assist / end`, SSE reply + per-sentence TTS, parallel feedback,
  rioplatense guard, usage log, recording retention job
- Scenario YAML + validator + `hablar:tts` for openers and key phrases
- Recast + badge + Explain, better phrasing + Decilo, replay / slow / translate, graded 💡 hint
- 8 scenarios, culture door, free chat, level override, streak on open+close

**v2**
- Memory across chats: facts about the learner, recurring mistakes, used in later chats and summaries
- Summary phrases → Words hub / review queue; mistakes → grammar practice
- More scenarios, one per unit

---

## 9. Research notes: where it disagrees with the decisions

Kept as decided, listed here so the trade-offs are on record:

- **1 chat a day.** The apps allow retrying a scenario, and repetition is where immediate feedback
  pays off. Possible later: the daily chat counts for the streak, retries don't.
- **Voice only.** Reversed 2026-09-29: a keyboard sits next to the mic. The apps keep a keyboard fallback for mic denied, noisy places, accessibility and
  repeated STT failures. At minimum we need a clear screen for "mic permission denied".
- **Streak on open+close.** Others require some number of learner turns; ours is easier to game.
  That's accepted for now.

Sources:
- Babbel Speak: https://www.babbel.com/press/en-us/releases/babbel-speak
- Speak Live Roleplays: https://www.speak.com/blog/live-roleplays
- Duolingo Video Call design: https://blog.duolingo.com/ai-and-video-call/
- Duolingo Video Call research report: https://blog.duolingo.com/video-call-research-report
- Langua conversation guide: https://support.languatalk.com/article/160-learn-how-to-use-langua-effectively-conversations-help-guide
- Li 2010, meta-analysis of corrective feedback: https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1467-9922.2010.00561.x
- Lyster & Saito 2010, prompts vs recasts
- Li, Zhu & Ellis 2016, immediate vs delayed feedback: https://onlinelibrary.wiley.com/doi/abs/10.1111/modl.12315
- Turn-taking and VAD with pauses: https://docs.livekit.io/agents/logic/turns/
- Whisper hallucinations on silence: https://github.com/openai/whisper/discussions/1873
- STT on non-native speech (LearnerVoice): https://arxiv.org/html/2407.04280
- Supabase function limits: https://supabase.com/docs/guides/functions/limits
- Supabase background tasks (waitUntil): https://supabase.com/docs/guides/functions/background-tasks
- Supabase + ElevenLabs streaming example: https://supabase.com/docs/guides/functions/examples/elevenlabs-generate-speech-stream
- `functions.invoke` can't stream: https://github.com/supabase/functions-js/issues/67
- ElevenLabs STT: https://elevenlabs.io/docs/api-reference/speech-to-text/convert
- ElevenLabs TTS stream + latency: https://elevenlabs.io/docs/api-reference/text-to-speech/stream · https://elevenlabs.io/docs/eleven-api/guides/how-to/best-practices/latency-optimization
- Claude prompt caching: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- Claude structured outputs: https://platform.claude.com/docs/en/build-with-claude/structured-outputs
- Safari 17.1 ManagedMediaSource: https://webkit.org/blog/14735/webkit-features-in-safari-17-1/
