# Hablar en vivo — prototype on ElevenLabs Agents

Status: plan, 2026-10-03. Nothing built yet.

A second way to talk with Pancho, built on ElevenLabs Agents, living next to the
current chat so both can be tried on the same scenes and compared. The current
chat (docs/hablar-hld.md) stays as it is; nothing here changes it.

---

## 1. Why

The current turn is a relay of separate requests: record → upload → speech to
text (~0.6 s) → Claude → text to speech per sentence. After this week's work
(one request per turn, streamed correction) Pancho still starts ~2–3 s after
she stops. Duolingo's Video Call answers in under a second because one live
connection does everything while she speaks.

ElevenLabs Agents gives us that live connection and keeps what makes Pancho
ours: **Claude** (Sonnet 5 is a built-in model) and **the Agustín voice** on
Flash v2.5 (the model ElevenLabs recommends for Argentine Spanish).

## 2. Goal and the comparison

Build it, put it in testers' hands next to the current chat, and decide with
numbers, not impressions.

| Measure | Current chat (baseline) | Pass for the prototype |
|---|---|---|
| End of her speech → Pancho's first sound | ~2–3 s (measure on device) | ≤ 1.2 s typical |
| Her mistakes kept in the transcript (§6.1 test) | Scribe, measured in the same test | ≥ the current chat |
| Correction on screen after she stops | ~1 s (streamed verdict) | ≤ 2 s |
| Pancho slips into tú/usted or Spain words | guard rewrites them | ≤ 1 in 50 replies |
| Cost per 3-minute chat | measure from hablar_usage | known, and acceptable |
| Testers' pick | — | majority prefer it |

If it passes, plan the switch (§9). If not, keep what we learned (turn-taking,
live transcription) for the current chat.

## 3. What she sees

A separate entry, **"En vivo (beta)"**, on the brief screen under Empezar,
shown only to testers (the `tester_premium` flag). Same scenes, same levels,
same daily-chat rules.

The call screen:
- Pancho (the carpincho) large at the top. His state shows on him: listening,
  thinking, talking (from the SDK's mode events). This also hides the short
  wait, like Lily's thinking face.
- The thread below, same bubbles as the current chat: her line as soon as it
  is transcribed, the correction under it, Pancho's reply as he says it.
- **Tap-to-speak** (default): the mic is muted until she taps; tap again and
  her turn is over. A switch in ⋮ tries **open mic** (the turn-taking model
  decides when she's done) for the comparison.
- Hint and Type work as today (Type sends text with `sendUserMessage`).
- End → the same summary screen.

No ▶ / 🐢 / EN on Pancho's lines in the prototype: the audio isn't stored per
line. (EN can come back later with the existing translate call.)

## 4. How it works

```
 brief ──► hablar-live-start (edge) ──► ElevenLabs: conversation token
                 │ creates the conversations row, builds Pancho's prompt
                 ▼
 phone ◄══ WebRTC (LiveKit) ══► ElevenLabs Agent "Pancho"
   │        her audio in, Agustín's voice out, transcripts both ways
   │                               └─► Claude Sonnet 5 (built-in)
   │ each final transcript of hers
   ▼
 hablar-live-feedback (edge) ──► Claude: the same streamed correction
                 │
 end ──► hablar-end (edge, extended) ──► pulls the transcript from
                 ElevenLabs, stores the turns, writes the summary
```

### 4.1 The agent (configured once, as code)
- One agent, "Pancho (prototype)", kept in the repo as config (ElevenLabs
  "agents as code" CLI), not clicked together in the dashboard.
- LLM: Claude Sonnet 5, built-in. Prompt: `PERSONA` + `sessionBlock()` from
  `_shared/hablar-prompt.ts`, sent per call as an override, so one prompt
  source serves both chats. Minus the parts that don't apply live (the
  `[FIN]` marker becomes ending the call, see §4.4).
- Voice: Agustín (`ByVRQtaK1WDOvTmP1PKO`), Flash v2.5, stability 0.6,
  speed from `TALK_SPEED` for the level.
- Speech to text: language `es`, keyterms from `sttKeyterms()` (scene words
  plus voseo forms), so the same words are favoured as in the current chat.
- First message: the scene's opener text (Pancho says it live; the
  pre-recorded clips aren't used here).
- Max call length: the chat's time limit plus grace, enforced by ElevenLabs
  too, so a phone left open can't run up minutes.

### 4.2 `hablar-live-start` (new edge function)
- Same checks as `hablar-start`: signed-in user, daily limit, entitlement.
  Creates the `conversations` row with `channel = 'live'`.
- Asks ElevenLabs for a WebRTC **conversation token** for the private agent
  (the API key never reaches the phone).
- Returns: token, overrides (prompt, first message, voice speed, keyterms),
  deadline.

### 4.3 The phone
- `@elevenlabs/react-native` + LiveKit WebRTC. Needs a **new dev build**:
  native modules, so not Expo Go, and not an over-the-air update.
- Screen `src/app/hablar-live.tsx`; wiring in `src/lib/hablar-live.ts`
  (same rule as today: screens never build requests).
- Tap-to-speak with `setMuted(false/true)`. On mute we also send
  `sendUserActivity()` while she's still speaking, so Pancho doesn't jump in.
- `onMessage` gives her final transcript → shown in the thread, sent to
  `hablar-live-feedback`. `onAgentChatResponsePart` streams Pancho's text.
- Timer as today: display only; the server and the agent's max length decide.

### 4.4 Corrections and the end
- `hablar-live-feedback`: takes `{session_id, text, pancho_before}`, runs the
  existing `streamedStructured` feedback call, streams back the early verdict
  and the full feedback. Same prompt and schema as the current chat, so the
  corrections can be compared directly.
- Ending: Pancho can't send `[FIN]` into a voice call. He ends with a client
  tool `end_call` the agent calls when the scene closes; the app hangs up
  after his goodbye. Time-up: the app sends a contextual update ("time's up,
  say goodbye") at the deadline.
- `hablar-end` (extended for `channel = 'live'`): fetches the conversation's
  transcript from ElevenLabs by its id, stores it as `conversation_turns`
  (with the feedback the app already got), then builds the summary as today.

### 4.5 What we lose on purpose (prototype only)
- **The rioplatense guard.** Pancho's reply goes straight from Claude to the
  voice; nothing can rewrite a sentence in between. We rely on the prompt and
  count slips from the stored transcripts with `offendingWords()`. If slips
  are too frequent, the fix is ElevenLabs' **custom LLM** option: they call
  our own OpenAI-compatible endpoint, which runs Claude and the guard. That is
  phase 2, not the prototype.
- Per-line audio for ▶ / 🐢 (see §3).

## 5. Cost — and does tap-to-speak stop the clock?

**No.** ElevenLabs bills the minutes the call is connected (about $0.08 per
minute, on every plan), not the seconds anyone speaks. Muting the mic between
taps only stops sending audio; the call stays open and the minutes keep
counting. The one break: stretches of silence over 10 seconds are billed at
5% of the rate, so long thinking pauses cost almost nothing, but the usual
short gaps are billed in full. The only way to really stop the clock would be
hanging up between turns, which brings back the connection wait we're trying
to remove.

On top of the minutes: Claude tokens at Anthropic's price (passed through by
ElevenLabs, no markup), plus our own correction call per line, as today.

Rough guess for a 3-minute chat: ~$0.24 in minutes + a few cents of Claude.
The prototype measures the real number per chat (ElevenLabs reports minutes
and LLM cost per conversation) next to the current chat's cost from
`hablar_usage`.

## 6. Risks, and how the prototype checks them

### 6.1 Does their speech to text keep her mistakes? (blocking)
The current design's rule (hld §4.11): if the transcript quietly fixes "yo
tiene" to "yo tengo", the correction has nothing to correct. Their recognizer
is built for agents, where fixing is a feature. **First task, before any UI:**
the same ~30 clips with deliberate errors, through both recognizers, count the
errors that survive. If theirs fixes far more, the prototype still runs, but
corrections come from a second transcription of her audio (Scribe on the
recording ElevenLabs keeps), and we measure what that costs in speed.

### 6.2 Open mic cuts learners off
Learners pause mid-sentence to think. Tap-to-speak is the default for this
reason; open mic is only there to compare.

### 6.3 The voice is a library voice
Agustín belongs to someone else's library listing and could be removed. Add it
to the account ("Add to My Voices") before testers use it.

### 6.4 Native build
LiveKit and WebRTC need a new native build. The web build (PWA) can use
`@elevenlabs/react` instead, but phones are the target; web is not tested in
the prototype.

## 7. Steps

| # | Step | Size |
|---|---|---|
| 0 | Mistake-survival test (§6.1) on both recognizers | ½ day |
| 1 | Agent as code: prompt override, Agustín, keyterms, max length, `end_call` tool | ½ day |
| 2 | `hablar-live-start` + `channel` column | ½ day |
| 3 | Dev build with `@elevenlabs/react-native` + LiveKit | ½ day |
| 4 | `hablar-live.tsx`: call, tap-to-speak, thread, Pancho states | 1–2 days |
| 5 | `hablar-live-feedback` + corrections in the thread | ½ day |
| 6 | `hablar-end` for live chats: transcript → turns → summary | ½ day |
| 7 | Measuring: latency per turn on device, cost per chat, slips; tester form | ½ day |
| 8 | Testers try both on the same scenes; read the numbers | 1 week |

Step 0 decides whether step 5 needs the second transcription. Steps 1–2 and 3
can run in parallel.

## 8. Open questions
- Which testers, and how many chats each before we decide?
- Does the live chat count as the day's chat, or is it extra while in beta?
  (Proposed: it counts, so the comparison reflects real use.)
- Corrections during the call, or only in the summary like Duolingo? The
  prototype shows them during the call (that is Posta's difference); a
  switch can hide them for the comparison.

## 9. If it wins
Plan the switch separately: the custom-LLM endpoint with the guard, per-line
audio for ▶ / 🐢, web support, re-recording nothing (openers are spoken live),
and retiring hablar-transcribe / hablar-reply once no build uses them.

## Sources
- ElevenAgents overview — https://elevenlabs.io/docs/eleven-agents/overview
- React SDK (events, mute, overrides) — https://elevenlabs.io/docs/eleven-agents/libraries/react
- React Native SDK / Expo guide — https://elevenlabs.io/docs/eleven-agents/guides/integrations/expo-react-native
- LLM options (Claude models) — https://elevenlabs.io/docs/eleven-agents/customization/llm
- Custom LLM — https://elevenlabs.io/docs/eleven-agents/customization/llm/custom-llm
- Pricing and the silence discount — https://www.cloudzero.com/blog/elevenlabs-pricing/
- Flash v2.5 for Argentine Spanish — https://elevenlabs.io/blog/meet-flash
