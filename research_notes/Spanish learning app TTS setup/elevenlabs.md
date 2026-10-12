# ElevenLabs TTS models and controls (as of 2026-10-10), for an Argentine Spanish learning app

Method note: pages were read through a fetch tool that summarises each page with a small model. Quoted strings are as that tool returned them; they were not re-checked character by character against the live page. Where two official pages disagreed, both are shown. I ran no audio tests; everything about how something *sounds* is from docs or third parties, not from listening.

## 1. Which models exist now: ids, languages, latency, limits, price, discounts

### Takeaway
Eleven v4 (`eleven_v4`) and Eleven v4 Turbo (`eleven_v4_turbo`) exist: they launched 2026-09-28 and are on the official models page. List price is $0.08 / 1K chars (v4) and $0.04 / 1K chars (v4 Turbo), with a 72% launch discount ($0.022 / $0.011) that ends **October 12, 2026** (two days after this note). Turbo v2.5 is now deprecated in favour of Flash v2.5.

### Cited Findings

Model table (official models page):

| Model id | Languages | Latency | Char limit | Status |
|---|---|---|---|---|
| `eleven_v4` | 90+ | not published | 10,000 (~10 min) | current flagship |
| `eleven_v4_turbo` | 90+ | ~100 ms median inference | not stated | current real-time |
| `eleven_v3` | 70+ | not published | 5,000 (~5 min) | previous generation |
| `eleven_v3_conversational` | 70+ | ~280 ms | not stated | previous gen real-time |
| `eleven_multilingual_v2` | 29 | not published | 10,000 | current, API default `model_id` |
| `eleven_flash_v2_5` | 32 | ~75 ms | 40,000 | current, cheapest |
| `eleven_flash_v2` | English only | ~75 ms | 30,000 | current |
| `eleven_turbo_v2_5` / `eleven_turbo_v2` | 32 / EN | — | — | **deprecated**, use Flash equivalents |

- The table above, including ids, language counts, latency and limits; latency figures exclude application and network latency — [ElevenLabs models](https://elevenlabs.io/docs/overview/models)
- Turbo v2.5 / Turbo v2 are deprecated, described as functionally equivalent to Flash with Flash having lower latency on average; no removal date is given — [ElevenLabs models](https://elevenlabs.io/docs/overview/models)
- Eleven v4 and v4 Turbo were released 2026-09-28; v4 Turbo became the default conversational model, replacing Flash v2 — [ElevenLabs changelog](https://elevenlabs.io/docs/changelog)
- v4 is described as "Our most emotionally rich, expressive speech synthesis model"; v4 Turbo as "Our most expressive, real-time speech synthesis model" with "Median inference latency of ~100ms" — [ElevenLabs models](https://elevenlabs.io/docs/overview/models)
- Third-party figures for v4 Turbo: ~100 ms median inference, ~150 ms median time-to-first-speech; v4 (non-Turbo) latency not disclosed — [cellcog](https://cellcog.ai/blog/eleven-v4/), [DataNorth](https://datanorth.ai/news/elevenlabs-releases-eleven-v4-and-eleven-v4-turbo)
- v4 tops Artificial Analysis Speech Arena at Elo 1319 (Cartesia Sonic 3.6: 1276) — [cellcog](https://cellcog.ai/blog/eleven-v4/)
- API price per 1K characters: v4 $0.022 (regular $0.08); v4 Turbo $0.011 (regular $0.04); v3 $0.08; v3 Conversational $0.04; Multilingual v2 $0.08; Flash/Turbo $0.04. "72% off until Oct 12" applies to v4 and v4 Turbo — [ElevenLabs API pricing](https://elevenlabs.io/pricing/api)
- Discount window reported as September 28 – October 12, 2026 — [cellcog](https://cellcog.ai/blog/eleven-v4/)
- Plans: Starter $6/mo, Creator $22/mo, Pro $99/mo, Scale $299/mo, Business $990/mo — [ElevenLabs API pricing](https://elevenlabs.io/pricing/api)
- Regional TTFB expectations (Flash): North America / Europe / SE Asia 100–150 ms; South Asia / NE Asia 150–200 ms — [Latency optimization](https://elevenlabs.io/docs/eleven-api/guides/how-to/best-practices/latency-optimization)
- Output formats: mp3 (22.05–44.1 kHz, 32–192 kbps), pcm 8–48 kHz, opus 48 kHz 32–192 kbps, ulaw/alaw 8 kHz, wav variants. MP3 192 kbps needs Creator+; 44.1 kHz PCM/WAV needs Pro+ — [TTS convert](https://elevenlabs.io/docs/api-reference/text-to-speech/convert), [TTS stream](https://elevenlabs.io/docs/api-reference/text-to-speech/stream)

### Inferences
- At list price v4 costs the same as Multilingual v2 and v3 ($0.08), and v4 Turbo the same as Flash v2.5 ($0.04). So after Oct 12 the choice between generations is about quality and controls, not price.
- A large batch run on v4 before the end of Oct 12 would cost about 27.5% of the normal price. For scale: 1M characters is $22 on v4 now versus $80 after (arithmetic from the published rates).
- No South America region is listed in the latency table, so users in Argentina should expect more network latency than the quoted figures.

### Gaps
- Could not confirm whether the discount end is start or end of day Oct 12, or which timezone.
- Character limit for `eleven_v4_turbo` is not stated on the models page.
- Credit multipliers per model (credits per character on subscription plans) were not shown on the pages read; only dollar-per-1K prices.
- The language count for v4 is "90+" on the models page but came back as "99+" from the v4 capability page — unresolved.
- No removal date found for the deprecated Turbo models.
- Concurrency limits per plan were not found.

## 2. Recommended model for Spanish and Argentine accent; how accent is determined; does `language_code` help

### Takeaway
ElevenLabs has no Argentine-specific model or language option; the accent comes from the **voice**. A voice sourced from an Argentine speaker keeps its accent when generating Spanish. `language_code` enforces language and text normalization, not regional accent, and is ignored by Multilingual v2.

### Cited Findings
- v4 / v4 Turbo list Spanish as "Spanish, LatAm (spa)"; Multilingual v2 lists "Spanish (Spain, Mexico)". No Argentina variant is listed for any model — [ElevenLabs models](https://elevenlabs.io/docs/overview/models)
- General recommendations: quality → `eleven_v4` or `eleven_multilingual_v2`; low latency → `eleven_v4_turbo`; agents → v4 Turbo, Flash v2.5, Flash v2 or Multilingual v2. No Spanish-specific recommendation is given — [ElevenLabs models](https://elevenlabs.io/docs/overview/models)
- v4 accent rule: "When the language you're generating matches the language of your reference voice, the original accent is preserved exactly as before." When it differs, v4 produces native-sounding target-language speech instead of carrying the voice's accent over — [Eleven v4 docs](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/eleven-v4)
- A toggle for that cross-language behaviour is described as research with no timeline; `[strong X accent]` tags are experimental with mixed results — [oguzhan.co v4 review](https://www.oguzhan.co/elevenlabs-v4-review-best-practices/), [Best practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)
- `language_code`: "Language code (ISO 639-1) used to enforce a language for the model and text normalization. If the model does not support the provided language code, it will be ignored. This parameter is not supported for multilingual_v2 models." — [TTS stream](https://elevenlabs.io/docs/api-reference/text-to-speech/stream)
- Official troubleshooting: the model "can sometimes switch languages or accents throughout a single generation, especially if that generation is longer"; fixes are a voice cloned in the target language and keeping text under 800–900 characters — [Troubleshooting](https://elevenlabs.io/docs/eleven-creative/troubleshooting)
- Multilingual models occasionally mispronounce words "that also appear in other languages" — [Troubleshooting](https://elevenlabs.io/docs/eleven-creative/troubleshooting)
- Competitor article (Deepgram, treat as biased): default voices carry English bias regardless of `language_code`; pick native Voice Library voices filtered by language and accent, or use PVC; cites "11" read as "eleven" instead of "once" in Spanish — [Deepgram](https://deepgram.com/learn/elevenlabs-languages-vs-accents-support)
- Voice Library can be filtered by language and accent — [Voice Library docs](https://elevenlabs.io/docs/eleven-creative/voices/voice-library)

### Inferences
- `language_code` is ISO 639-1 (two letters), so the useful value is `es`. It cannot express Argentina. A search snippet mentioned `es-AR`, but that appears to come from the Dubbing API's BCP-47 `source_language`/`target_language`, not TTS — unconfirmed for TTS.
- For single words that are spelled the same in English or Portuguese ("no", "final", "sale", "once"), `language_code: "es"` on Flash v2.5 / v4 is the documented way to stop the model guessing the wrong language. This is the strongest reason to prefer a model that honours it over Multilingual v2 for word-level audio.
- For an Argentine voice speaking Spanish, v4's accent rule should keep rioplatense features (same language as source). Risk case: a voice whose source language is tagged differently.

### Gaps
- No official statement on which model is best for Spanish, or any Argentine-specific quality claim.
- Whether "Spanish, LatAm" on v4 biases a neutral voice toward Mexican-style pronunciation (e.g. "ll/y" not as "sh", aspirated "s") was not documented and not tested.
- Whether `eleven_v4` / `eleven_v4_turbo` honour `language_code` is not stated on the v4 page; a third party says it forces normalization on v4.

## 3. Pronunciation accuracy and stability: hallucinations, short inputs, normalization, seed, context params, settings

### Takeaway
No model is deterministic: `seed` is best effort only. Docs say short inputs are less stable and that Style above 0 causes mispronunciation and extra sounds. I found no solid public reports quantifying word swaps in Spanish, so output verification (see section 8) is the safe design.

### Cited Findings
- `seed` (0–4294967295): "our system will make a best effort to sample deterministically... Determinism is not guaranteed." — [TTS stream](https://elevenlabs.io/docs/api-reference/text-to-speech/stream)
- Voice settings defaults: stability 0.5, similarity_boost 0.75, style 0, use_speaker_boost true, speed 1.0 — [TTS convert](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)
- Stability "determines how stable the voice is and the randomness between each generation" — [TTS convert](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)
- Style exaggeration can cause "instability, including inconsistent speed, mispronunciation" and extra sounds; keep at 0 if issues occur — [Troubleshooting](https://elevenlabs.io/docs/eleven-creative/troubleshooting)
- Corrupt speech is described as rare but unpredictable; the fix is to regenerate — [Troubleshooting](https://elevenlabs.io/docs/eleven-creative/troubleshooting)
- "Short phrases can sometimes sound abrupt or inconsistent"; a full sentence gives more stable results (said about Voice Design preview text) — [Voice Design docs](https://elevenlabs.io/docs/eleven-creative/voices/voice-design)
- v4 uses only Stability and Similarity; "Style and Speed sliders are not available" and "SSML is not supported" — [Eleven v4 docs](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/eleven-v4)
- Changelog (Sept 28) adds a `similarity` setting (0–1, default 0.75) and continuity params `previous_text`, `future_text`, `previous_request_ids`, `next_request_ids` — [Changelog](https://elevenlabs.io/docs/changelog)
- `previous_text` / `next_text` give surrounding text to improve continuity; `previous_request_ids` / `next_request_ids` take max 3 ids — [TTS convert](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)
- "Request stitching is not available for the `eleven_v3` model." Request ids must be no older than two hours — [Request stitching guide](https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/request-stitching)
- `apply_text_normalization`: `auto` (default), `on`, `off` — [TTS convert](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)
- Conflict on normalization defaults: models page says "By default, normalization is disabled for Flash v2.5 to maintain the low latency" and enabling it is Enterprise-only — [Models](https://elevenlabs.io/docs/overview/models); best-practices says normalization is "enabled by default for all TTS models" — [Best practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)
- "The Multilingual v2 model does a better job of normalizing numbers" (phone numbers, dates) — [Models](https://elevenlabs.io/docs/overview/models)
- Official advice for numbers/symbols/acronyms: write them out as words in the target language — [Troubleshooting](https://elevenlabs.io/docs/eleven-creative/troubleshooting)
- `apply_language_text_normalization` is Japanese only — [TTS convert](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)
- Multilingual v2 is described by third parties as the most stable on long-form — [search result summary of models page](https://elevenlabs.io/docs/overview/models)

### Inferences
- For a language app, spell out every number in Spanish before sending ("once", not "11"). This removes dependence on per-model normalization and on the conflicting defaults above, and lets `apply_text_normalization: "off"` be used safely.
- Most repeatable recipe from the docs: higher stability, style 0, fixed seed, `language_code: "es"`, numbers spelled out. Still not guaranteed identical between runs.
- For single words, `previous_text` / `next_text` (e.g. a carrier sentence) is the documented lever to give context without the context being spoken; whether it reduces single-word errors is not documented.
- Multilingual v2 is the older, less expressive, more predictable model; v3/v4 are tag-driven and more variable. That points to v2-family or v4 with high stability for drill audio, but this is reasoning, not a tested result.

### Gaps
- Found no reliable Reddit / GitHub / HN reports specifically about hallucinated or swapped Spanish words, or about single-word failures. Searches returned only vendor docs and competitor marketing.
- Whether v4 supports request stitching and `seed` is not explicit (changelog suggests continuity params arrived with v4; unconfirmed).
- No published error rates for any model.
- No documented minimum input length for v4 non-Turbo.

## 4. Speed control

### Takeaway
`speed` ranges 0.7–1.2 (default 1.0). Docs conflict on whether it works on v4. For truly slow, clear speech the documented options are pauses (break tags on v2 models; ellipses/punctuation on v3/v4) and pacing tags on v3/v4, which ElevenLabs itself calls imperfect.

### Cited Findings
- Speed: default 1.0, minimum 0.7, maximum 1.2; "Extreme values may affect the quality of the generated speech" — [Best practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)
- Conflict: the best-practices page says speed is available on v4/v3 via site and API — [Best practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices); the v4 page says "Style and Speed sliders are not available" — [Eleven v4 docs](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/eleven-v4)
- Third-party guide suggests `[slowly]` or `[rushed]` tags as the replacement for the removed speed slider on v4; ElevenLabs says tags are "not perfect yet" — [oguzhan.co](https://www.oguzhan.co/elevenlabs-v4-review-best-practices/), citing [Morphic guide](https://morphic.com/resources/how-to/eleven-v4-guide)
- `<break time="x.xs" />` gives pauses up to 3 s; too many break tags cause speed-ups, noise and artifacts — [Best practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)
- "Eleven v4 and Eleven v3 do not support SSML break tags"; use ellipses, capitalization, punctuation instead — [Best practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)

### Inferences
- 0.7 is the hard floor, about 30% slower. Anything slower ("word... by... word" learner speed) has to come from inserted pauses, a naturally slow voice, or slowing the file after generation in the app's audio player.
- Because of the conflict, test `voice_settings.speed` on `eleven_v4` / `eleven_v4_turbo` with one request before relying on it.

### Gaps
- No source describes how 0.7 actually sounds in Spanish; not tested here.
- `[slowly]` is not in the official tag list I retrieved; it is third-party advice.

## 5. Prosody control: punctuation, audio tags, SSML, pronunciation dictionaries

### Takeaway
v2-family models take SSML break tags; v3/v4 take bracketed audio tags and punctuation, not SSML. For Spanish, phoneme-level control is only available on `eleven_v4` (inline `/IPA/` or dictionary phonemes); every other model needs alias (respelling) rules.

### Cited Findings
- Audio tags (v3/v4): `[laughs]`, `[whispers]`, `[sighs]`, `[sarcastic]`, `[excited]`, `[crying]`, `[snorts]`, `[mischievously]`; sound effects `[applause]` etc.; experimental `[strong X accent]`, `[sings]` — [Best practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)
- "Tags land more reliably when the delivery exists in the voice's training data"; results differ per voice — [Best practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)
- "Punctuation significantly affects delivery in v4": ellipses add pauses, capitals add emphasis — [Best practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)
- SSML phoneme tags: "only compatible with the `eleven_flash_v2` model" (English only), CMU Arpabet or IPA, one word per tag — [Best practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)
- v4 native IPA: wrap in forward slashes, e.g. `/ˌbaɪoʊˈkemɪstri/`; consistency varies by voice, test first — [Best practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)
- "Pronunciation dictionary phoneme tags only work with eleven_v4, eleven_flash_v2 and eleven_v3 models." Others: "use alias tags instead" — [Pronunciation dictionaries guide](https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/pronunciation-dictionaries)
- "If you want to use IPA and CMU pronunciations in languages other than English, you will have to switch to the eleven_v4 model." — [Pronunciation dictionaries guide](https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/pronunciation-dictionaries)
- Dictionaries: .PLS or TXT, alias or phoneme rules, case-sensitive, first match wins, max 3 dictionaries per request — [Best practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices), [TTS convert](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)

### Inferences
- On Flash v2.5 and Multilingual v2, fixing a Spanish word means an alias respelling (e.g. writing a word the way it should sound). On v4, IPA is possible in Spanish, which matters for rioplatense sounds like "ll/y" as [ʃ]/[ʒ].
- Emotion tags like `[excited]` fit the live chat character on v4 Turbo; they are a risk for drill audio because any unspoken bracket text that leaks would be read aloud on non-v3/v4 models.

### Gaps
- `[curious]` and `[slowly]` are not in the retrieved official list; v3/v4 accept free-form tags but reliability is per voice.
- v3 stability modes (Creative / Natural / Robust) and v3 short-prompt warnings were not on the current best-practices page as retrieved.

## 6. Voices: types, licensing, removal rules, Argentine voices

### Takeaway
Voice Library (community) voices are other people's Professional Voice Clones and can be withdrawn. A notice period (30 days–2 years) is optional and set by the owner; without one, removal is immediate. Only a voice you own (IVC, PVC, or Voice Design) is safe from removal.

### Cited Findings
- "The Voice Library is a marketplace where our community can share Professional Voice Clones"; IVC and Voice Design voices cannot be shared there — [Voice Library docs](https://elevenlabs.io/docs/eleven-creative/voices/voice-library)
- Notice period: 30 days minimum, 2 years maximum, set by the owner. On removal the voice leaves the Library immediately but stays usable through the notice period for users who saved or used it; they get email and in-app notice — [Voice Library docs](https://elevenlabs.io/docs/eleven-creative/voices/voice-library), [Help: notice period](https://help.elevenlabs.io/hc/en-us/articles/33533163659921-What-is-a-notice-period)
- Without a notice period, removal is immediate. A voice you delete during its notice period cannot be re-saved — [Voice Library docs](https://elevenlabs.io/docs/eleven-creative/voices/voice-library)
- Using a voice records its notice period on your account even if not saved to My Voices — [Help: notice period](https://help.elevenlabs.io/hc/en-us/articles/33533163659921-What-is-a-notice-period) (via search summary; direct fetch returned 403)
- Live Moderation: requests to that voice are checked for prohibited content and it "may introduce extra latency". Library filters include notice period and live-moderation status — [Voice Library docs](https://elevenlabs.io/docs/eleven-creative/voices/voice-library)
- "Voice Library voices are not available via the API to free tier users." Saved library voices do not use custom voice slots — [Voice Library docs](https://elevenlabs.io/docs/eleven-creative/voices/voice-library)
- Latency by voice type: default, synthetic (designed) and IVC voices are fastest; PVC slower — [Latency optimization](https://elevenlabs.io/docs/eleven-api/guides/how-to/best-practices/latency-optimization)
- v4: "Professional Voice Clones are fully supported again" (weak on v3); IVC can reach high fidelity from 10 seconds of audio — [oguzhan.co](https://www.oguzhan.co/elevenlabs-v4-review-best-practices/), [DataNorth](https://datanorth.ai/news/elevenlabs-releases-eleven-v4-and-eleven-v4-turbo)
- `use_pvc_as_ivc` lets a PVC run as its IVC version "to reduce latency or improve expressiveness" (Text to Dialogue) — [Changelog](https://elevenlabs.io/docs/changelog)
- IVC wants 1–2 minutes of clean audio; PVC 30+ minutes — [Troubleshooting](https://elevenlabs.io/docs/eleven-creative/troubleshooting)
- Argentine voices listed by a third-party catalogue: Agustín (male, Buenos Aires accent), Malena (young female, rioplatense), Melanie (female, Argentinian), Maxi_Argames (young male), Beto (voice id `ukupJ4zdf9bo1Py6MiO6`) — [json2video catalogue](https://json2video.com/ai-voices/elevenlabs/languages/spanish/), [Beto page](https://json2video.com/ai-voices/elevenlabs/voices/ukupJ4zdf9bo1Py6MiO6/)

### Inferences
- For any library voice the app depends on (including the Agustín voice), check its notice period and live-moderation flag in the Library filters now. A voice with no notice period can vanish with zero warning.
- Batch audio already generated is unaffected by removal; the exposure is the live chat and any future regeneration, which would then be in a different voice from stored clips.
- The durable option is a PVC or IVC of a hired Argentine speaker with a written release. PVC adds latency for live chat; the IVC version is faster.

### Gaps
- Commercial-use terms per plan and for library voices were not on the pages read (the pricing page did not list licence tiers). Needs a direct read of the Terms and the Voice Library Addendum.
- Current notice period and live-moderation status of specific Argentine voices are only visible inside the logged-in Library.
- Could not verify that the third-party list of Argentine voices is still live in October 2026.
- Whether a Voice Design voice can be reliably prompted to a rioplatense accent is undocumented.

## 7. Streaming options for sentence-by-sentence synthesis

### Takeaway
When the whole sentence is known up front, ElevenLabs itself points to plain HTTP streaming (`/stream`) rather than websockets. Websockets are for text arriving in pieces, and they buffer short inputs unless flushed.

### Cited Findings
- HTTP streaming returns audio progressively, reducing time to first byte — [Latency optimization](https://elevenlabs.io/docs/eleven-api/guides/how-to/best-practices/latency-optimization)
- Websocket input streaming is best when "the input text is being streamed or generated in chunks" and "may not be the best choice when the entire input text is available upfront" — [Websocket stream-input](https://elevenlabs.io/docs/api-reference/text-to-speech/v-1-text-to-speech-voice-id-stream-input)
- Websocket `chunk_length_schedule` default `[120, 160, 250, 290]`: no audio until 120 characters are received, unless `flush` is sent or `auto_mode` is on. `inactivity_timeout` default 20 s, max 180 s. Returns alignment data — [Websocket stream-input](https://elevenlabs.io/docs/api-reference/text-to-speech/v-1-text-to-speech-voice-id-stream-input)
- `auto_mode: true` "automatically handles generation triggers" — [Latency optimization](https://elevenlabs.io/docs/eleven-api/guides/how-to/best-practices/latency-optimization)
- v4 Turbo: "The server waits for roughly 40 characters and 8 words before it starts generating"; send `flush` for short replies — [oguzhan.co](https://www.oguzhan.co/elevenlabs-v4-review-best-practices/) (attributed to ElevenLabs)
- v4 Turbo is exposed via a "Text to Dialogue websocket"; websocket support for v4 Turbo dialogue was added Sept 28 — [Models](https://elevenlabs.io/docs/overview/models), [Changelog](https://elevenlabs.io/docs/changelog)
- `optimize_streaming_latency` (0–4) is deprecated; level 4 also turns the text normalizer off — [TTS convert](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)
- Multi-context websocket now emits `is_final_audio_for_turn` after every buffered byte including MP3 and Opus (Aug 31, 2026) — [Changelog](https://elevenlabs.io/docs/changelog)
- Higher-quality output formats can add latency; a US-only base URL `api.us.elevenlabs.io` exists; EU, India and Singapore servers also exist — [Latency optimization](https://elevenlabs.io/docs/eleven-api/guides/how-to/best-practices/latency-optimization), [With-timestamps reference](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps)

### Inferences
- One sentence per request maps cleanly to `POST /v1/text-to-speech/{voice_id}/stream` with Flash v2.5 or v4 Turbo. Many Spanish sentences are under 40 characters / 8 words, so on a websocket they would stall without `flush`.
- Do not use `optimize_streaming_latency`: deprecated and it can disable normalization.

### Gaps
- Whether `eleven_v4_turbo` works on the plain HTTP `/stream` endpoint or only through the Text to Dialogue websocket is not clear from the docs retrieved. Must be tested.
- Whether the classic `stream-input` websocket accepts v3/v4 ids was not stated.

## 8. Timestamps and forced alignment

### Takeaway
Two tools exist: TTS with character-level timestamps (returned with the audio), and a separate Forced Alignment endpoint that aligns any audio to given text and returns per-word loss scores, usable as an automatic check that the audio matches the text.

### Cited Findings
- `POST /v1/text-to-speech/{voice_id}/with-timestamps` returns `audio_base64`, `alignment` and `normalized_alignment`, each with `characters`, `character_start_times_seconds`, `character_end_times_seconds` — [With-timestamps reference](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps)
- It accepts the same options as normal TTS: seed, pronunciation dictionaries (max 3), stitching ids, text normalization, voice settings including speed — [With-timestamps reference](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps)
- Websocket streaming also returns `Alignment` and `NormalizedAlignment` objects — [Websocket stream-input](https://elevenlabs.io/docs/api-reference/text-to-speech/v-1-text-to-speech-voice-id-stream-input)
- Forced Alignment: multipart upload of audio file (under 1 GB, all major formats) plus text; returns characters with times, words with start/end and a loss score, and an overall average loss. Diarization not supported — [Forced alignment reference](https://elevenlabs.io/docs/api-reference/forced-alignment/create)

### Inferences
- Karaoke highlighting: use `with-timestamps` at generation time and group characters into words in app code (timings are per character, not per word).
- `normalized_alignment` shows the text the model actually read after normalization, so a mismatch with the input flags a number or symbol that was expanded.
- Verifying output: a high word loss from Forced Alignment suggests a missing or wrong word. A stronger check is running speech-to-text (ElevenLabs `scribe_v2` is the current STT id per the models page) and comparing transcripts — [Models](https://elevenlabs.io/docs/overview/models).

### Gaps
- Timestamps return the *input* characters with timings; they do not prove the model said those words. No doc states how alignment behaves when a word is hallucinated.
- Forced Alignment pricing, supported languages (Spanish assumed, not confirmed) and duration limits were not on the page.
- Whether `with-timestamps` works with `eleven_v4` / `eleven_v4_turbo` was not stated; the stream-with-timestamps variant was not documented in what I retrieved.
- No documented loss-score threshold for "bad" audio.
