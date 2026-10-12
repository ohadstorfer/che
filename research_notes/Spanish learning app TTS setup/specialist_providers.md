# Specialist / startup TTS providers for Spanish (LatAm, Argentine) — state as of October 2026

Scope: Cartesia, Hume, Inworld, Rime, Deepgram, PlayHT/PlayAI, Fish Audio, MiniMax, Resemble/Chatterbox, LMNT, Speechify, Murf, WellSaid, Neuphonic, Smallest.ai, and open-source models. ElevenLabs, OpenAI, Azure, Google, Amazon are out of scope (they appear only as reference points in third-party rankings).

Reading guide: "(primary)" = fetched from the vendor's own docs/pricing page or the ranking site itself. "(snippet)" = taken from a search-result summary of the page, not fully verified. Vendor latency and benchmark claims are vendor claims unless stated otherwise.

Big status changes the report writer must not miss:
- **Hume is shutting down its TTS and EVI APIs on 13 Nov 2026.** Not a candidate.
- **PlayHT / PlayAI is dead** (Meta acquisition July 2025; all products closed 31 Dec 2025).
- **Cartesia sonic, sonic-2 and sonic-turbo were sunset 1 June 2026.** Current models are Sonic 3.5 (May 2026) and Sonic 3.6 (27 Aug 2026).
- **Rime's lineup is now Coda (May 2026), Mist v3 (Mar 2026), Mist v2.** Arcana is reported retired from the cloud API (Aug 2026, snippet).
- **Inworld's lineup is now Realtime TTS-2 and TTS-2 Flash** (TTS-1.5 Max/Mini are the previous generation).
- **Speechify Simba 3.2 is English-only** for now.

---

## 1. Which support Spanish well, and which offer or can clone a convincing Argentine (rioplatense) accent? Explicit accent/locale controls?

### Takeaway
Only two in-scope providers were confirmed to ship stock Argentine voices: **Rime Coda (3 Argentine voices: abril, cielo, solsticio)** and **Deepgram Aura-2 (1 voice: antonia, es-ar)**. Cartesia Sonic 3.6 is the strongest independently ranked Spanish model and has a `locale`/`accent` control, but an `es-AR` locale could not be confirmed — its documented Spanish locales are Mexican, Colombian and Castilian — so for Cartesia (and Inworld, Fish, MiniMax, Chatterbox) Argentine means cloning a real rioplatense speaker.

### Cited Findings
**Cartesia**
- Sonic 3.6 supports 44 languages including Spanish (`es`); docs claim it "pronounces words and phrases the way a local would" (primary) — [Cartesia docs: Sonic 3.6](https://docs.cartesia.ai/build-with-cartesia/tts-models/latest)
- Localization works by setting `locale` or `language` on the request (never both); the voice speaks in one of the accents it supports; if a voice lacks the requested accent it falls back to its original accent; a voice supports at most 10 accents; the per-voice accent list is in the Get Voice endpoint's `accents` field (primary) — [Cartesia docs: Multilingual voices](https://docs.cartesia.ai/build-with-cartesia/capability-guides/localize-voices)
- 2026 changelog: `locale` (e.g. `en-GB`, `es-MX`, `hi-IN`), `accent`, and `normalization` can be set independently; Spanish locales referenced are Mexican, Colombian and Castilian; no complete list given (primary) — [Cartesia changelog 2026](https://docs.cartesia.ai/changelog/2026)
- Cartesia's Spanish marketing page shows only Castilian (Darío, Iria; es-ES) and Mexican (Ximena, Ramón) voices; no Argentine voice mentioned (primary) — [Cartesia Spanish page](https://www.cartesia.ai/languages/spanish)
- Real-world accent bug (June 2026): Sonic 3.5 via Retell pronounced "jornada" and "virtual" with English phonetics because Retell sent generic `language="es"` rather than `es-MX`; suggested fix was a regional locale / native LatAm voices; unresolved as of 29 June 2026 — [Retell community thread](https://community.retellai.com/t/cartesia-tts-spanish-voice-pronunciation-bug-english-accent-applied-to-spanish-words/3125)

**Rime**
- Coda has 48 Spanish voices out of 287, across 12 regional varieties: Argentine 3 (`abril` F adult, `cielo` F adult "a warm Argentine Spanish voice, calm and easy to listen to", `solsticio` M young adult "warm Argentine Spanish voice, calm and steady"), Mexican 8, Colombian 6, Spain 4, Chilean 4, Peruvian 4, Puerto Rican 4, Venezuelan 2, US-Spanish 2, Ecuadorian 1, Dominican 1, Cuban 1 (primary; counts as extracted by the fetch tool, which do not sum exactly to 48 — treat counts as approximate) — [Rime docs: Coda voices](https://docs.rime.ai/docs/voices-coda)
- Coda covers 9 languages, Mist v3 and Mist v2 cover 4 (English, French, German, Spanish) (primary) — [Rime docs: Models](https://docs.rime.ai/docs/models)

**Deepgram Aura-2**
- Spanish voices by accent: Mexican (sirio, estrella, javier, luciano, olivia, valerio), Peninsular (nestor, carina, alvaro, diana, agustina, silvia), Colombian (celeste, gloria), Latin American es-419 (aquila, selena), **Argentine es-ar (antonia — "Approachable, Enthusiastic, Friendly, Natural, Professional")**. Five voices code-switch English/Spanish (Aquila, Carina, Diana, Javier, Selena) (primary) — [Deepgram docs: Voices and languages](https://developers.deepgram.com/docs/tts-models)

**Inworld**
- Realtime TTS-2 / TTS-2 Flash: "200+ languages with cross-lingual cloning", Spanish supported (primary) — [Inworld TTS](https://inworld.ai/tts)
- Inworld warns instant cloning "may not perform well for less common voices, such as children's voices or unique accents" and recommends professional cloning there (primary) — [Inworld docs: Voice cloning](https://docs.inworld.ai/docs/tts/voice-cloning)

**Hume**
- Octave 1 supports English and Spanish; Octave 2 (preview) supports 11 languages. TTS API sunsets 13 Nov 2026 (primary) — [Hume TTS overview](https://dev.hume.ai/docs/text-to-speech-tts/overview); [Hume changelog](https://dev.hume.ai/changelog)

**Fish Audio**
- S2.1 Pro supports 83 languages including Spanish; cloning works across all of them (primary) — [Fish Audio blog](https://fish.audio/blog/s2-1-pro-free-api/)
- Spanish is classed as a "Tier 2" language for S2 (with Korean, Portuguese, Arabic, Russian, French, German) (snippet) — [Fish Audio S2](https://fish.audio/s2/)

**MiniMax**
- Speech 2.8 Turbo and HD support 40+ languages including Spanish (snippet) — [OpenRouter: Speech 2.8 HD](https://openrouter.ai/minimax/speech-2.8-hd)

**Smallest.ai**
- Lightning v3.1: 217 voices across 12 trained languages, Spanish is one of them (the only non-Indic one besides English); no Spanish regional accent info in the model card (primary) — [Smallest docs: Lightning v3.1](https://docs.smallest.ai/models/model-cards/text-to-speech/lightning-v-3-1)
- 11 Spanish voices in the catalog (snippet) — [Vapi Humanness Index: Lightning v3.1](https://humannessindex.vapi.ai/models/smallestai-lightning-v31)

**Resemble / Chatterbox (open source)**
- Chatterbox Multilingual V3 (500M params, 23+ languages) plus a "Single Language Pack" of dedicated finetunes, including **Latin American Spanish (es-mx-latam)** and Spain Spanish (primary) — [Chatterbox GitHub](https://github.com/resemble-ai/chatterbox); [HF: Chatterbox-Multilingual-es-mx-latam](https://huggingface.co/ResembleAI/Chatterbox-Multilingual-es-mx-latam)
- No Argentine-specific pack; LatAm pack is "optimized for Spanish as spoken in Latin America and Mexico" (snippet of model card) — [HF: Chatterbox-Multilingual-es-mx-latam](https://huggingface.co/ResembleAI/Chatterbox-Multilingual-es-mx-latam)
- Docs note the reference clip should match the language tag; cross-language references may transfer accent (primary) — [Chatterbox GitHub](https://github.com/resemble-ai/chatterbox)

**Others**
- Speechify Simba 3.2 is "for new English builds"; other languages are on the roadmap (snippet) — [Speechify: best TTS providers 2026](https://speechify.ai/blog/best-tts-providers-2026-comparison)
- WellSaid supports Spanish for Spain and Mexico only among its regional variants (snippet) — [WellSaid](https://www.wellsaid.io/)
- Kokoro-82M ships 54 voices across 8 languages including Spanish; third-party listings show only two Spanish voices (Alex, Dora) (snippet) — [localaimaster Kokoro setup](https://localaimaster.com/blog/kokoro-tts-local-setup); [tts.ai Kokoro voices](https://tts.ai/voices/kokoro/)
- PlayHT: API offline since ~26 July 2025; everything closed 31 Dec 2025; voice clones deleted, no export (snippet, multiple consistent sources) — [Infrabase: PlayHT](https://infrabase.ai/audio/playht); [Inworld migration guide](https://inworld.ai/resources/migrate-from-playht)

### Inferences
- For a ready-made Argentine voice without cloning, the shortlist is Rime Coda (3 voices, both genders) and Deepgram Aura-2 (1 female voice). Neither was found in any independent Spanish quality ranking, so they need a listening test by a native.
- For the highest-rated Spanish quality (Cartesia), Argentine almost certainly requires a clone of a rioplatense speaker, and requests should carry a regional locale rather than bare `es`. Whether `es-AR` exists is the single most valuable thing to check (call Get Voice on a cloned voice, or try the locale).
- Rioplatense features (sheísmo, aspirated s, voseo stress like "tenés", "decime") are carried mostly by the voice/reference audio, not by a locale flag; a clone from clean Argentine audio in the same language is the most reliable path with any provider.
- Generic "Latin American / es-419" voices (Deepgram aquila/selena, Chatterbox LatAm pack defaults) will sound Mexican-neutral, not Argentine.

### Gaps
- Could not confirm whether Cartesia has an `es-AR` locale or any Argentine stock voice (voice library needs login; docs list is incomplete).
- No info found on Argentine voices for Inworld, Fish Audio (community voice library likely has some, unverified), MiniMax, Smallest, Murf, LMNT, Neuphonic, Resemble's hosted catalog.
- Murf Falcon, LMNT, Neuphonic Spanish support/accents not verified at all (only price/latency snippets found).
- No independent listening test of rioplatense accent quality for any provider was found.

---

## 2. Pronunciation accuracy / determinism: WER, hallucination, very short inputs, custom pronunciation / phoneme input

### Takeaway
Spanish WER for the leading commercial models is around 0.4–1.2% on the MiniMax multilingual test set, i.e. good on full sentences, but no benchmark covers isolated single words — the known weak spot of LLM-style TTS. Phoneme-level control is uneven: Rime Mist v2 has inline phonemes and custom pronunciation but Coda and Mist v3 do not; Cartesia and Smallest have pronunciation dictionaries; Inworld lists custom pronunciation.

### Cited Findings
- MiniMax multilingual test set, Spanish WER (April 2026, run by Gradium, a vendor, with Qwen3-ASR): Gradium 0.40%, ElevenLabs Flash v2.5 0.99%, Cartesia Sonic-3 1.19% (averages over five languages 1.11% / 1.52% / 1.56%) — [Gradium WER benchmark 2026](https://gradium.ai/content/tts-wer-benchmark-2026)
- MiniMax's own paper: MiniMax-Speech Spanish WER 1.029 vs ElevenLabs Multilingual v2 1.084, on a 24-language test set of 100 sentences per language (vendor paper; snippet) — [MiniMax-Speech arXiv](https://arxiv.org/pdf/2505.07916)
- Coval continuous English WER board, 8 Sep 2026 snapshot: Soniox RT v2 4.0%, Eleven v3 Conversational 4.3%, Gradium 4.9%, Cartesia Sonic 3.6 5.3%; a search snippet of the same page adds Inworld TTS-2 4.5%, Fish S2.1 Pro 4.7%, Inworld TTS-2 Flash 5.3%. English only; one model's reading moved 4.81%–6.18% within five days, so single-day snapshots are unreliable — [Gradium WER benchmark 2026](https://gradium.ai/content/tts-wer-benchmark-2026)
- "Hard-case" test (Aug 2026; 500 sentences, five languages, native raters; numbers, emails, phone numbers): pass rates Gradium 81.0%, Cartesia Sonic 3.6 75.1%, Eleven v3 65.4% (vendor-run) — [Gradium WER benchmark 2026](https://gradium.ai/content/tts-wer-benchmark-2026)
- The same source cautions that WER depends as much on the ASR model and text normalizer as on the TTS, so figures from two benchmarks cannot be compared — [Gradium WER benchmark 2026](https://gradium.ai/content/tts-wer-benchmark-2026)
- Single-word failure is a documented class of problem for LLM-based TTS: for extremely short inputs such models "usually synthesize words that don't exist in the input" (RALL-E paper on VALL-E-style models; snippet) — [RALL-E arXiv](https://arxiv.org/pdf/2404.03204)
- A vocabulary-app repo fixed TTS "prompt hallucination" on standalone words (e.g. the word "audio" read as a direction) by quoting the input text; this was with a prompt-steered model (Google) but shows the failure mode for word lists (snippet) — [carmex/vocab PR #6](https://github.com/carmex/vocab/pull/6)
- Chatterbox docs note short texts or certain prompts can produce unwanted continuation (primary) — [Chatterbox GitHub](https://github.com/resemble-ai/chatterbox)
- Rime feature matrix (primary): custom pronunciation — Coda no, Mist v3 no, Mist v2 yes; inline phonemes — Coda no, Mist v3 no, Mist v2 yes; custom pauses — Coda no, Mist v3 yes, Mist v2 yes — [Rime docs: Models](https://docs.rime.ai/docs/models)
- Cartesia has pronunciation dictionaries (access control added July 2026; case-insensitive matching by default since Sept 2026) (primary) — [Cartesia changelog 2026](https://docs.cartesia.ai/changelog/2026)
- Cartesia `normalization` is a separate per-request control alongside locale and accent (primary) — [Cartesia changelog 2026](https://docs.cartesia.ai/changelog/2026)
- Inworld TTS-2 lists custom pronunciation support (primary, no detail) — [Inworld TTS](https://inworld.ai/tts)
- Smallest Lightning v3.1 has custom pronunciation dictionaries; recommends native script and chunks of max 250 characters (primary) — [Smallest docs: Lightning v3.1](https://docs.smallest.ai/models/model-cards/text-to-speech/lightning-v-3-1)
- Hugging Face Open TTS Leaderboard (launched Sept 2026) measures WER/CER with Qwen3 ASR; English WER leaders are Kokoro-82M, Supertone supertonic-3 and fishaudio/s2-pro; some models (higgs-tts-3-4b, VoxCPM2) get better WER when a reference clip is provided — [HF blog: Open TTS Leaderboard](https://huggingface.co/blog/open-tts-leaderboard)
- Academic finding: non-autoregressive models (F5-TTS, MaskGCT) showed more hallucination/omission errors than autoregressive ones (CosyVoice2, FishSpeech) in one intelligibility study (snippet) — [SP-MCQA arXiv](https://arxiv.org/pdf/2510.26190)

### Inferences
- Sentence-level Spanish accuracy is effectively solved among top models (about 1 wrong word per 100–250). The risk for this app is elsewhere: isolated words, where no model publishes numbers, and where generative models can add sounds, pick odd intonation, or apply English phonetics to ambiguous spellings ("virtual", "idea", "no").
- For thousands of batch items, the safe design is generate → transcribe back with ASR → auto-flag mismatches and too-short/too-long clips → regenerate. This matters more than which top-tier model is picked. (The project already has a repair step for too-short clips.)
- Always send a regional Spanish locale and, where offered, pin a seed/low temperature for determinism; none of the fetched docs confirmed a seed parameter.
- If phoneme-exact control of single words is essential, Rime Mist v2 is the only in-scope model confirmed to accept inline phonemes — but whether its phoneme alphabet covers Spanish was not verified.

### Gaps
- No single-word or short-input benchmark for any provider in any language.
- No per-language (Spanish) WER found for Sonic 3.6, Inworld TTS-2, Rime Coda, Deepgram Aura-2, Fish S2.1, Smallest, or Chatterbox.
- Cartesia's custom-pronunciation doc page is behind a login redirect; IPA/phoneme syntax and Spanish coverage not verified.
- No seed/determinism parameter confirmed for any provider.
- Inworld custom-pronunciation mechanism (IPA? which languages?) not verified.

---

## 3. Speed control and slow-speech quality; emotion/prosody controls; ¿? ¡! intonation

### Takeaway
Explicit speed ranges were confirmed for Cartesia (0.6–1.5, "guidance, not a strict multiplier") and Inworld TTS-2 (0.5×–1.5×); Rime and Hume also expose speed. Cartesia's emotion tags are English-only and its professional voice clones do not accept request-time speed, which is a real constraint for a slow-speech learning mode.

### Cited Findings
- Cartesia: `speed` 0.6–1.5 (any float); "Sonic treats speed as guidance, not a strict multiplier"; `volume` 0.5–2.0; 60+ emotions (beta), work best when matching transcript; **emotion tags "supported only for English"**; speed/volume/emotion also available as inline SSML tags; `[laughter]` tag; **Professional Voice Clones don't support request-time speed adjustments**; results vary by voice, length and punctuation (primary) — [Cartesia docs: volume, speed, emotion](https://docs.cartesia.ai/build-with-cartesia/sonic-3/volume-speed-emotion)
- Cartesia Sonic 3.6: pause length adapts to sentence context; written disfluencies ("uhm") produce a thinking pace (primary) — [Cartesia docs: Sonic 3.6](https://docs.cartesia.ai/build-with-cartesia/tts-models/latest)
- Inworld TTS-2: speed 0.5×–1.5×; natural-language steering in brackets plus six non-verbal cues (laugh, breathe, etc.) (primary) — [Inworld TTS](https://inworld.ai/tts)
- Rime: speed control on Coda, Mist v3 and Mist v2; custom pauses on Mist v3/v2 but not Coda (primary) — [Rime docs: Models](https://docs.rime.ai/docs/models)
- Hume Octave: speed via utterance parameters; acting instructions "coming soon" for Octave 2 (moot given sunset) (primary) — [Hume TTS overview](https://dev.hume.ai/docs/text-to-speech-tts/overview)
- Chatterbox: `exaggeration` (default 0.5) and `cfg_weight` (default 0.5; ~0.3 slows/improves pacing); no direct speed parameter described (primary) — [Chatterbox GitHub](https://github.com/resemble-ai/chatterbox)
- Smallest Lightning v3.1 self-reported ratings: naturalness 3.25/5, intonation 3.22/5 (vendor's own test vs 8 competitors) — [Smallest docs: Lightning v3.1](https://docs.smallest.ai/models/model-cards/text-to-speech/lightning-v-3-1)

### Inferences
- With Cartesia, slow speech on a cloned Argentine voice must use an instant clone (or inline SSML if it works on PVCs — unverified), or be produced by post-processing (time-stretch) — a design constraint worth testing early.
- Because speed is "guidance" on generative models, a requested 0.6 will not reliably give exactly 60% tempo; for a consistent "slow" button, generating once and time-stretching, or generating a dedicated slow take in batch and checking duration, is more predictable.
- Emotion controls are of little use in Spanish on Cartesia (English-only); Inworld's bracketed steering claims language-agnostic use but was not verified for Spanish.

### Gaps
- No source — vendor or independent — evaluates the quality of slowed Spanish speech (artifacts, unnatural vowel lengthening) for any provider.
- No source addresses how any of these models handle Spanish inverted punctuation (¿? ¡!) or question intonation on short phrases. This must be tested by ear.
- Speed ranges for Deepgram Aura-2, Fish, MiniMax, Smallest not confirmed.

---

## 4. Latency (time to first audio), streaming protocols, word timestamps

### Takeaway
All realtime-focused vendors claim well under 250 ms to first audio; the only non-vendor numbers found put Cartesia at roughly 166–190 ms real-world versus a sub-90 ms claim, and Smallest at 420 ms measured versus ~200 ms claimed. Word timestamps are confirmed for Cartesia, Inworld (word/character/phoneme/viseme), Rime Coda only, Hume, and Smallest.

### Cited Findings
- Cartesia: vendor claims "first audio in under 90ms" (primary) — [Cartesia Spanish page](https://www.cartesia.ai/languages/spanish); third-party write-up says real-world latency is about 166–190 ms and the sub-90 ms figure is model latency only (snippet) — [invideo: Cartesia Sonic 3 and 3.5](https://invideo.io/blog/cartesia-sonic-ai-voice/)
- Cartesia timestamps exist; in Sonic 3.5 "timestamps behave slightly differently" (beginning-of-word markers changed; end-of-word largely unchanged) (primary) — [Cartesia changelog 2026](https://docs.cartesia.ai/changelog/2026)
- Inworld: TTS-2 "<100ms" time-to-first-byte at P99; TTS-2 Flash "25ms" at P99 (vendor claims); timestamps for word, character, phoneme and viseme add ~100 ms latency (primary) — [Inworld TTS](https://inworld.ai/tts)
- Rime: Coda sub-100 ms model latency on GPU engine plus 25–50 ms network; Mist v3 ~37 ms P50 time to first audio; Mist v2 ~175 ms median; HTTP and WebSocket streaming on all; **word-level timestamps on Coda only** (primary, vendor figures) — [Rime docs: Models](https://docs.rime.ai/docs/models)
- Hume: Octave 1 ~200 ms, Octave 2 ~100 ms (excluding network); HTTP streaming, bidirectional WebSocket, and non-streaming; phoneme/word timestamps (primary) — [Hume TTS overview](https://dev.hume.ai/docs/text-to-speech-tts/overview)
- Fish Audio S2.1 Pro: ~90 ms time to first audio on standard API calls (vendor); the free tier has no latency guarantee (primary) — [Fish Audio blog](https://fish.audio/blog/s2-1-pro-free-api/)
- Smallest Lightning v3.1: 200 ms TTFB claimed; HTTP SSE and WebSocket streaming; word-level timestamps (primary) — [Smallest docs: Lightning v3.1](https://docs.smallest.ai/models/model-cards/text-to-speech/lightning-v-3-1); Vapi's index measured 420 ms (snippet) — [Vapi Humanness Index](https://humannessindex.vapi.ai/models/smallestai-lightning-v31)
- Murf Falcon: model latency under 55 ms, time to first audio sub-130 ms (vendor; snippet) — [Murf Falcon](https://murf.ai/falcon)
- LMNT: ~140 ms TTFB (snippet, third-party list) — [texttolab: best TTS API](https://texttolab.com/blog/best-text-to-speech-api)
- WellSaid: ~500 ms per 30 characters, i.e. not a realtime option (snippet) — [Deepgram: best TTS APIs](https://deepgram.com/learn/best-text-to-speech-apis-2026)
- HF Open TTS Leaderboard measures time-to-first-audio for open models; kyutai/pocket-tts leads on both GPU and CPU — [HF blog: Open TTS Leaderboard](https://huggingface.co/blog/open-tts-leaderboard)

### Inferences
- For sentence-by-sentence live chat, any of Cartesia, Inworld TTS-2/Flash, Rime Coda/Mist v3, or Deepgram Aura-2 is fast enough; network distance from Argentina/the edge function region will likely dominate over the model differences vendors advertise.
- If word highlighting/karaoke is wanted with an Argentine stock voice, Rime Coda is the only confirmed combination (Argentine voices + word timestamps). Deepgram timestamps not confirmed.

### Gaps
- Artificial Analysis's leaderboard pages fetched showed no latency data; no independent like-for-like TTFA table for late-2026 models was found.
- Deepgram Aura-2 latency, streaming protocols and timestamp support not confirmed from the page fetched.
- MiniMax latency/streaming/timestamps not verified (docs URL 404).
- No latency measurements from South America for any provider.

---

## 5. Price per 1M characters, plan structure, commercial licensing

### Takeaway
Prices cluster between about $15 and $50 per 1M characters: Fish (~$15), Smallest (~$14.5–19.5), Inworld TTS-2 Flash ($15) and TTS-2 ($25), Deepgram Aura-2 ($30), Rime Mist v3 ($30) / Coda ($50), Cartesia (~$37–50 by plan), MiniMax ($60 Turbo / $100 HD). A one-off batch of a few million characters costs tens to low hundreds of dollars on any of them, so price should not drive the batch choice.

### Cited Findings
- Cartesia plans (primary): Free $0 / 20K credits; Pro $5 / 100K (adds commercial license and instant cloning); Startup $49 / 1.25M (2 professional clone slots); Scale $299 / 8M (4 PVC slots); Enterprise custom. 1 credit = 1 character of TTS; PVC generation also 1 credit/char and PVC training is free — [Cartesia pricing](https://cartesia.ai/pricing)
- Artificial Analysis lists Sonic 3 / 3.5 / 3.6 at $49.0 per 1M characters — [AA Controlled Voice leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard/controlled-voice)
- Inworld (primary): TTS-2 from $25 per 1M on-demand, down to $5 at enterprise scale; TTS-2 Flash from $15, below $5 at enterprise scale — [Inworld TTS](https://inworld.ai/tts). Artificial Analysis lists Realtime TTS-2 at $20.8 and TTS-2 Flash at $10.4 — [AA Controlled Voice leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard/controlled-voice). (Discrepancy: AA figures are lower than list on-demand price, probably plan-blended.)
- Rime (primary): Starter is pay-as-you-go, $0.03 per 1K chars for Mist v3 ($30/1M) and $0.05 per 1K for Coda ($50/1M); 20 concurrent generations; 600+ voices; Enterprise adds volume discounts, unlimited concurrency, unlimited custom voice cloning, on-prem/VPC. The page states both "3,000 complimentary minutes" and "~800 minutes free" — internally inconsistent — [Rime pricing](https://www.rime.ai/pricing)
- Deepgram Aura-2: $0.030 per 1K characters pay-as-you-go ($30/1M), $0.027 on Growth (annual prepay); all voices at one rate; $200 free credit (snippet) — [Cekura: Deepgram pricing](https://www.cekura.ai/blogs/deepgram-pricing); [texttolab: Deepgram pricing](https://texttolab.com/blog/deepgram-pricing)
- Fish Audio: s2-pro API $15 per 1M UTF-8 bytes (note: bytes, so accented Spanish letters and ¿¡ count as 2) (snippet) — [Smallest blog on Fish pricing](https://smallest.ai/blog/fish-audio-pricing-plans-api-billing-commercial-use-in-2026). Free API model `s2.1-pro-free` under a Fair Use Policy, no SLA or latency guarantee; products with over $1M annual revenue must contact Fish first (primary) — [Fish Audio blog](https://fish.audio/blog/s2-1-pro-free-api/)
- MiniMax: Speech 2.8 HD $100 per 1M characters, Turbo $60 (snippet; matches AA table) — [OpenRouter: Speech 2.8 HD](https://openrouter.ai/minimax/speech-2.8-hd); [AA Controlled Voice leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard/controlled-voice)
- Smallest Lightning v3.1: ~$14.50 per 1M pay-as-you-go; v3.1 Pro tier ~$19.50 per 1M (snippet) — [Smallest pricing](https://smallest.ai/pricing); AA lists Lightning v3.1 at $25.0 — [AA Controlled Voice leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard/controlled-voice) (conflict)
- Speechify Simba 3.2: from $10 per 1M, $6 at Scale tier; AA estimate $6.6 (English only) (snippet) — [Speechify: best TTS providers 2026](https://speechify.ai/blog/best-tts-providers-2026-comparison)
- Hume Octave subscription tiers (moot): Free 10K chars, $3 / 30K, $10 / 100K, $50 / 500K, $150 / 2M (snippet) — [texttolab: Hume review](https://texttolab.com/blog/hume-ai-review)
- Others, third-party snippets only: LMNT $43.60 per 1M; Neuphonic $17.60 per 1M; Murf $30 per 1M; Resemble "Chatterbox HD" $40 per 1M — [silma.ai price comparison Aug 2026](https://silma.ai/blog/text-to-speech-price-comparison-august-2026) (exact source page among the search results not confirmed)
- AA-listed prices for other models: Chatterbox (hosted) $25.0; Higgs Audio V3 $15.0; XTTS v2 $40.4; Voxtral TTS $16.0; Soniox RT v2 $14.2 — [AA Controlled Voice leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard/controlled-voice)

### Inferences
- Effective Cartesia cost computed from the plan table: Pro $50/1M, Startup ~$39/1M, Scale ~$37/1M (the "$65/1M overage" figure the fetch tool produced is not reliable).
- Example batch: 10,000 items averaging 30 characters = 300K characters = roughly $4.50 (Fish/Smallest) to $15 (Cartesia/Rime Coda) to $30 (MiniMax HD). Even with 3× regeneration this is trivial; live-chat volume is the real cost driver.
- For live chat at, say, 1M characters/month, the spread is about $15 (Inworld Flash, Fish) to $50 (Rime Coda, Cartesia Pro).
- Cartesia's commercial license starts at the $5 Pro plan; Rime and Deepgram are pay-as-you-go with commercial use implied by business API terms (not explicitly verified).

### Gaps
- Explicit commercial-use / output-ownership wording not verified for Inworld, Rime, Deepgram, MiniMax, Smallest.
- Deepgram and MiniMax prices come from third-party pages, not the vendors' own pricing pages.
- Murf, LMNT, Neuphonic, Resemble, WellSaid plan structures not verified.
- Fish Audio's paid tiers with SLA were not priced in the page fetched.

---

## 6. Voice cloning: instant vs professional, minimum audio, consent, cross-lingual accent retention

### Takeaway
Instant cloning from 3–30 seconds is standard (Inworld 3–30 s, Smallest 5–15 s, Chatterbox ~10 s, Hume 15 s); professional cloning needs 30–45+ minutes (Inworld 30+ min, Smallest 45+ min) and Cartesia includes PVC slots from the $49 plan with free training. Vendors themselves warn that instant clones handle unusual accents less well and that accent follows the reference audio, so an Argentine clone should be made from Argentine Spanish audio, not from another language.

### Cited Findings
- Cartesia: instant cloning from Pro ($5); professional voice cloning on Startup (2 slots) and Scale (4 slots); PVC training free, generation 1 credit/char (primary) — [Cartesia pricing](https://cartesia.ai/pricing)
- Cartesia: since Sept 2026 PVCs are auto-trained across all eligible models, keeping voice identity through model upgrades; PVC on Sonic 3.5 since June 2026; earlier, existing PVCs did not transfer to new model versions (primary) — [Cartesia changelog 2026](https://docs.cartesia.ai/changelog/2026)
- Cartesia: PVCs do not support request-time speed adjustment (primary) — [Cartesia docs: volume, speed, emotion](https://docs.cartesia.ai/build-with-cartesia/sonic-3/volume-speed-emotion)
- Inworld: instant cloning needs as little as 3 s, max 30 s, longer is better; professional cloning uses a larger sample set with asynchronous training and gives "a more similar, stable voice clone"; instant "may not perform well for less common voices, such as children's voices or unique accents" (primary) — [Inworld docs: Voice cloning](https://docs.inworld.ai/docs/tts/voice-cloning). Marketing page says instant 5–15 s and professional 30+ minutes of clean audio (primary) — [Inworld TTS](https://inworld.ai/tts)
- Hume: clone from as little as 15 s; when a clone speaks another language, "Octave 2 predicts the speaker's accent" (primary/snippet; moot) — [Hume Octave 2 launch](https://www.hume.ai/blog/octave-2-launch)
- Smallest: instant clone from 5–15 s; professional clone from 45+ minutes (snippet) — [Smallest docs: Lightning v3.1](https://docs.smallest.ai/models/model-cards/text-to-speech/lightning-v-3-1)
- Fish Audio: reference-audio cloning in all 83 languages, included in the free tier (primary) — [Fish Audio blog](https://fish.audio/blog/s2-1-pro-free-api/)
- Rime: custom voice cloning is an Enterprise feature ("unlimited custom voice cloning") (primary) — [Rime pricing](https://www.rime.ai/pricing)
- Chatterbox: zero-shot cloning from ~10 s reference (5 s per third-party); reference should match the target language or accent transfers; all output carries Perth watermark (primary) — [Chatterbox GitHub](https://github.com/resemble-ai/chatterbox)
- Artificial Analysis Controlled Voice Arena is itself a cloning test: every model is evaluated on the same 8 cloned voices (primary description via AA post) — [AA on X](https://x.com/ArtificialAnlys/status/2074886571166462405?lang=en)
- HF Open TTS Leaderboard reports speaker similarity (WavLM cosine) for open models — [HF blog: Open TTS Leaderboard](https://huggingface.co/blog/open-tts-leaderboard)

### Inferences
- Because AA's Controlled Voice rankings are measured on cloned voices, Cartesia's lead there (and in Spanish) is direct evidence that its cloned voices sound good — relevant for the "clone an Argentine speaker" route.
- Practical recipe: record or license 30–60 minutes of a consenting rioplatense speaker; make an instant clone first on two or three providers (Cartesia, Inworld, Fish) from a clean 15–30 s excerpt; move to a professional clone only on the winner. Keep the raw recording so the voice can be rebuilt elsewhere — PlayHT users lost all clones with no export, and Hume users are about to.
- The same clone should serve both live chat and batch so the voice is consistent across the app.

### Gaps
- Consent/verification requirements (voice-owner statements, read-aloud verification) not confirmed for any provider — the one article comparing consent checks was blocked (403).
- No measured data on how well any provider retains a rioplatense accent in a clone, instant or professional.
- Cartesia PVC minimum audio length not found.
- Whether Deepgram Aura-2 offers any cloning: not found.

---

## 7. Independent rankings: Artificial Analysis, TTS Arena v2, Spanish-specific evaluations

### Takeaway
Artificial Analysis launched multilingual Controlled Voice leaderboards (including Spanish) in 2026, and Cartesia's Sonic family leads 8 of 9 languages with Sonic 3.6 first in 7 — Spanish is reported among those. In English, Sonic 3.6 is 4th on Provider Voice (Elo 1284) and 6th on Controlled Voice (1142), Inworld Realtime TTS-2 is 5th on Controlled Voice (1145); Rime, Deepgram and Hume do not appear on the Controlled Voice board at all.

### Cited Findings
- AA announced Multilingual TTS Arena leaderboards for 9 languages beyond English (Japanese, Chinese, Hindi, Spanish, German, French, Portuguese, Vietnamese, Arabic), noting performance "varies significantly across languages" (post title only; body blocked) — [AA on X](https://x.com/ArtificialAnlys/status/2102490340678856997)
- Cartesia's Sonic family leads 8 of the 9 new language leaderboards; Sonic 3.6 is #1 in 7 languages and Sonic 3.5 leads Portuguese (search snippet of AA page) — [AA TTS leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard)
- Vendor claim: "91% win rate in Spanish against the next closest competitor" in blind tests with native speakers (Cartesia marketing; snippet; unverified and not an AA figure) — [Cartesia Sonic](https://www.cartesia.ai/sonic)
- AA Provider Voice Arena (English), top 5: Eleven v4 Turbo 1327 ($40/1M), Eleven v4 1323 ($80), Qwen-Audio-3.1-TTS-Plus 1298 ($19.3), **Sonic 3.6 1284 ($49)**, Gemini 3.8 Flash TTS 1272 ($16.5) (primary) — [AA Provider Voice leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard/provider-voice)
- AA Controlled Voice Arena (English, 42 models, same 8 cloned voices), in-scope entries (primary): 5 Realtime TTS-2 (Inworld) 1145; 6 Sonic 3.6 1142; 8 Sonic 3.5 1119; 9 Simba 3.2 1089; 12 Realtime TTS-2 Flash 1072; 19 MiniMax Speech 2.8 Turbo 1022; 20 Speech 2.8 HD 1021; 23 Fish Audio S2.1 Pro 1014; 25 Fish S2 Pro 1005; 33 Higgs Audio V3 960; 34 Sonic 3 947; 37 Chatterbox 933; 40 Smallest Lightning v3.1 887; 41 XTTS v2 833; 42 OpenVoice v2 812. Top of board: HeyGen Voice 1201, Qwen-Audio-3.1-TTS-Plus 1187, Eleven v4 Turbo 1168, Eleven v4 1162 — [AA Controlled Voice leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard/controlled-voice)
- Sonic 3.6 briefly held #1 on both AA arenas at launch (Aug 2026), ahead of Simba 3.2 and Qwen-Audio-3.0-TTS-Plus, before the Eleven v4 / HeyGen / Qwen 3.1 entries — [AA on X](https://x.com/ArtificialAnlys/status/2089400880688976062); [MarkTechPost](https://www.marktechpost.com/2026/08/18/cartesia-ships-sonic-3-6-a-streaming-tts-model-that-now-leads-both-artificial-analysis-speech-arenas/)
- Hugging Face launched an objective Open TTS Leaderboard (Sept 2026; WER/CER via Qwen3 ASR, speed, speaker similarity). Languages named: English, Chinese, Japanese, Korean; multilingual leaders k2-fsa/OmniVoice, fishaudio/s2-pro, Fun-CosyVoice3-0.5B. Spanish coverage not stated — [HF blog: Open TTS Leaderboard](https://huggingface.co/blog/open-tts-leaderboard)
- TTS Arena v2 on Hugging Face still exists as a vote-based English arena (the original is labelled "Legacy") — [HF blog: Open TTS Leaderboard](https://huggingface.co/blog/open-tts-leaderboard); [TTS Arena Legacy space](https://huggingface.co/spaces/TTS-AGI/TTS-Arena)
- Spanish WER comparisons: see section 2 (Gradium 0.40%, Eleven Flash v2.5 0.99%, Sonic-3 1.19%; MiniMax 1.029 vs Eleven Multilingual v2 1.084) — [Gradium WER benchmark 2026](https://gradium.ai/content/tts-wer-benchmark-2026); [MiniMax-Speech arXiv](https://arxiv.org/pdf/2505.07916)
- Coval argues vendor benchmarks are unreliable and runs a continuous independent board (English) — [Coval: best TTS providers 2026](https://www.coval.ai/blog/best-text-to-speech-providers-in-2026-how-to-choose-(and-why-vendor-benchmarks-lie)/)

### Inferences
- The jump from Sonic 3 (Elo 947, rank 34) to Sonic 3.6 (1142, rank 6) on the same board shows how fast this moves; any pre-mid-2026 opinion of Cartesia's quality (including Sonic 2 / turbo) is obsolete.
- Among in-scope specialists, the quality tier on independent boards is: Cartesia Sonic 3.6 and Inworld Realtime TTS-2 at the top, then Inworld Flash, then MiniMax 2.8 and Fish S2.1 roughly level, with open-source Chatterbox and XTTS clearly lower. All of this is English except the (partially verified) multilingual result.
- Arena rankings measure pleasantness/naturalness of sentences, not correctness of isolated words or dialect fidelity — a rioplatense listening test is still needed.

### Gaps
- The actual AA Spanish leaderboard table (ranks, Elo, which models were included) could not be retrieved — the Spanish URL guess 404'd and the announcement body was blocked. "Sonic 3.6 is #1 in Spanish" is therefore supported only by the 7-of-9 statement plus vendor marketing; the two languages Sonic 3.6 does not lead are Portuguese (Sonic 3.5) and one unidentified language.
- Current TTS Arena v2 rankings not retrieved.
- No Spanish-dialect-specific (LatAm vs Spain, let alone Argentine) evaluation exists in any source found.
- Rime Coda, Deepgram Aura-2 have no independent quality ranking in anything retrieved.

---

## 8. Viability of self-hosting an open-source model for Spanish batch generation

### Takeaway
Self-hosting is viable but not obviously worthwhile: the best commercially usable option for Spanish is Chatterbox Multilingual V3 with its dedicated Latin American Spanish finetune (MIT licence, zero-shot cloning), yet Chatterbox ranks 37th of 42 on AA's cloned-voice board (Elo 933 vs 1142 for Sonic 3.6), and the hosted batch cost it would replace is only tens of dollars. Several stronger open models are blocked by non-commercial licences.

### Cited Findings
- Chatterbox (Resemble): MIT licence; models Turbo (350M, English only), Nano (110M, English only, CPU 3× realtime), Multilingual V3 (500M, 23+ languages), and a Single Language Pack with Latin American Spanish and Spain Spanish finetunes; ~10 s reference clip; `exaggeration` and `cfg_weight` controls; Perth watermark on all output; short texts may produce unwanted continuation (primary) — [Chatterbox GitHub](https://github.com/resemble-ai/chatterbox); [HF: es-mx-latam](https://huggingface.co/ResembleAI/Chatterbox-Multilingual-es-mx-latam)
- Chatterbox on AA Controlled Voice: Elo 933, rank 37 of 42; XTTS v2 833 (rank 41); Higgs Audio V3 960 (rank 33) (primary) — [AA Controlled Voice leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard/controlled-voice)
- Kokoro-82M: Apache 2.0, 82M parameters, 54 voices across 8 languages including Spanish; leads English WER on the HF Open TTS Leaderboard; no voice cloning (fixed voicepacks) — [HF blog: Open TTS Leaderboard](https://huggingface.co/blog/open-tts-leaderboard); [localaimaster Kokoro setup](https://localaimaster.com/blog/kokoro-tts-local-setup)
- Kokoro Spanish: third-party listings show two Spanish voices (Alex, Dora) (snippet) — [tts.ai Kokoro voices](https://tts.ai/voices/kokoro/)
- XTTS v2: code MPL-2.0 but weights under the Coqui Public Model License, non-commercial only; Coqui shut down Jan 2024 so no commercial licence can be bought; Spanish is one of its better languages (snippet) — [promptquorum: XTTS licence](https://www.promptquorum.com/power-local-llm/local-tts-voice-cloning-piper-coqui-xtts)
- F5-TTS: MIT code, but the common released weights are CC BY-NC 4.0 (snippet) — [pinggy: best open-source TTS 2026](https://pinggy.io/blog/best_open_source_self_hosted_text_to_speech_models/)
- Open Fish Speech weights: CC-BY-NC-SA 4.0; Fish Audio S2 Pro weights under the "Fish Audio Research License" — free for research/non-commercial, commercial use needs a separate licence (snippet) — [texttolab: open-source TTS](https://texttolab.com/blog/open-source-text-to-speech); [Fish Audio S2](https://fish.audio/s2/)
- Higgs Audio V3: 100+ languages, non-commercial licence; VibeVoice 7B weights reported as CC-BY-NC non-commercial (snippet from third-party roundups; conflicts with my prior understanding that VibeVoice was MIT — verify on the model card) — [pinggy](https://pinggy.io/blog/best_open_source_self_hosted_text_to_speech_models/)
- Orpheus 3B: Apache-licensed code, multilingual family includes Spanish; one roundup says weights "inherit Llama-family licensing constraints" while another calls it commercial-safe (conflict; snippet) — [pinggy](https://pinggy.io/blog/best_open_source_self_hosted_text_to_speech_models/); [texttolab: open-source TTS](https://texttolab.com/blog/open-source-text-to-speech)
- HF Open TTS Leaderboard multilingual leaders among open models: k2-fsa/OmniVoice, fishaudio/s2-pro, Fun-CosyVoice3-0.5B-2512; cloning-capable models noted: bosonai/higgs-tts-3-4b, openbmb/VoxCPM2 — [HF blog: Open TTS Leaderboard](https://huggingface.co/blog/open-tts-leaderboard)
- Fish S2.1 Pro throughput: over 8,000 tokens/s on a single H200 (vendor) — [Fish Audio blog](https://fish.audio/blog/s2-1-pro-free-api/)

### Inferences
- Licence filter for a commercial app leaves: Kokoro (Apache; no cloning, so no Argentine voice), Chatterbox (MIT; cloning; LatAm Spanish finetune), possibly Orpheus (licence wording disputed), plus newer candidates named on the HF board (OmniVoice, CosyVoice3, VoxCPM2) whose licences and Spanish quality were not checked. XTTS, F5-TTS weights, Fish open weights, Higgs, and (reportedly) VibeVoice are out for commercial use.
- The only self-hosted route to a consistent Argentine voice is Chatterbox LatAm-Spanish + an Argentine reference clip. Quality gap versus Cartesia/Inworld is large on the independent board, and short-text continuation is a documented issue — exactly the single-word case.
- Economics do not favour self-hosting for batch: the whole word/sentence library costs roughly $5–$30 on a hosted API (section 5), less than the engineering time to stand up a GPU pipeline. Self-hosting only makes sense for unlimited regeneration experiments or as insurance against vendor shutdowns (two in-scope vendors have shut down in 15 months).
- Sesame CSM was not covered by any source retrieved.

### Gaps
- No Spanish-specific quality or WER numbers for any open-source model (Kokoro Spanish, Chatterbox LatAm pack, Orpheus Spanish, OmniVoice, CosyVoice3).
- Kokoro's Spanish uses a rule-based phonemizer in my prior knowledge (espeak-style), which would make single-word pronunciation deterministic — not confirmed by any source here.
- Sesame CSM, VibeVoice and Orpheus Spanish support and current licences not verified from primary model cards.
- No data on GPU cost / real-time factor for Chatterbox Multilingual V3.

---

## Cross-cutting summary for the report writer (inferences, built from the cited findings above)

| Provider (current model) | Argentine stock voice | Independent quality signal | Live latency (vendor) | Word timestamps | Phoneme / pronunciation control | List price per 1M chars | Status risk |
|---|---|---|---|---|---|---|---|
| Cartesia Sonic 3.6 | Not confirmed (MX, CO, ES locales documented) | AA: #4 Provider Voice, #6 Controlled Voice; leads most multilingual boards | <90 ms claimed, ~166–190 ms reported | Yes | Pronunciation dictionaries | ~$37–50 | Old models retired on a 4-month notice |
| Inworld Realtime TTS-2 / Flash | Not found | AA Controlled Voice #5 / #12 | <100 ms / 25 ms P99 claimed | Yes (word, char, phoneme, viseme) | "Custom pronunciation" (unverified detail) | $25 / $15 | — |
| Rime Coda | **Yes, 3 (abril, cielo, solsticio)** | None found | <100 ms + network | Yes (Coda only) | None on Coda/Mist v3; phonemes on Mist v2 | $50 (Mist v3 $30) | Arcana retired in 2026 |
| Deepgram Aura-2 | **Yes, 1 (antonia)** | None found | Not verified | Not verified | Not verified | $30 | — |
| Fish Audio S2.1 Pro | Not found (clone) | AA Controlled Voice #23 | ~90 ms claimed | Not verified | Not verified | ~$15 per 1M bytes; free tier | — |
| MiniMax Speech 2.8 | Not found (clone) | AA #19–20; Spanish WER ~1.03 (own paper) | Not verified | Not verified | Not verified | $60 / $100 | — |
| Smallest Lightning v3.1 | Not found | AA #40 of 42 | 200 ms claimed, 420 ms measured | Yes | Dictionaries | ~$14.5–25 | — |
| Chatterbox ML V3 (self-host) | Clone only (LatAm finetune) | AA #37 of 42 | n/a | No | No | GPU cost | MIT, safe |
| Hume Octave | — | — | — | — | — | — | **API ends 13 Nov 2026** |
| PlayHT | — | — | — | — | — | — | **Shut down** |
| Speechify Simba 3.2 | — (English only) | AA #9 | — | — | — | $6–10 | — |
