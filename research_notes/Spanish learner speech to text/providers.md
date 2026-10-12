# Speech-to-text providers and models for Spanish learner speech (as of 10 Oct 2026)

Scope: short (2–15 s) Spanish lines spoken by English-speaking learners into a phone, React Native / Expo app.

Reading notes for the writer:
- **[primary]** = provider doc / pricing page / paper fetched directly. **[secondary]** = aggregator or search-result summary, not confirmed on a primary page; treat as unverified.
- The model line-up changed a lot in 2026. Names in the brief that are now superseded: OpenAI `gpt-4o-transcribe` → `gpt-transcribe` / `gpt-live-transcribe` (29 Jul 2026); AssemblyAI Universal-3 Pro / Slam-1 → Universal-3.5 Pro (async) and Universal-3.6 Pro Realtime (Slam-1 deprecated); Azure MAI-Transcribe-1 → MAI-Transcribe-1.5 / 2 / 2-Streaming; Google adds Gemini 3.5 Transcribe (+ `-live`); ElevenLabs docs no longer list Scribe v1; Soniox is on v5; Gladia on Solaria-3; Speechmatics adds Melia 1.
- My web search budget ran out before I could cover every provider equally. Thin coverage: Amazon Transcribe, Google pricing, Azure prices, Gladia docs, NVIDIA hosted endpoints, Android on-device details, WhisperKit. These are flagged under Gaps.

## 1. Spanish accuracy (WER on Spanish benchmarks, accented / non-native speech, short utterances, es-AR)

### Takeaway
On clean read Spanish (FLEURS) every serious model is in a 2–3.5 % WER band, so benchmark WER does not separate them; the differences show up on harder audio (Common Voice Spanish: 3.9 % to 15.9 %) and nobody publishes numbers for non-native Spanish or 2–15 s learner utterances. Only Azure offers a real `es-AR` locale; all the LLM-style models take plain `es`, and I found no evidence that locale choice changes accuracy.

### Cited Findings

**Spanish-specific WER, independent or cross-vendor tables**
- FLEURS Spanish WER, from Mistral's Voxtral Realtime paper (Table 7): Voxtral Mini Transcribe V2 2.63; Whisper (large-v3) 2.81; Scribe v2 Realtime 3.23; GPT-4o mini Transcribe (realtime API) 3.41; Voxtral Realtime 4.59 @240 ms delay, 3.31 @480 ms, 2.98 @960 ms, 2.71 @2400 ms. [primary, but a vendor paper] — [Voxtral Realtime, arXiv 2602.11298](https://arxiv.org/pdf/2602.11298)
- Mozilla Common Voice Spanish WER, same paper (Table 8): Voxtral Mini Transcribe V2 3.93; GPT-4o mini Transcribe 5.54; Whisper 5.66; Scribe v2 Realtime 15.93; Voxtral Realtime 9.05 @240 ms, 6.05 @480 ms, 5.12 @960 ms. Scribe v2 Realtime is far worse than its FLEURS score on every Common Voice language in this table (avg 20.85 vs 8.34). [primary, vendor paper] — [arXiv 2602.11298](https://arxiv.org/pdf/2602.11298)
- FLEURS Spanish WER from Microsoft's MAI-Transcribe-1 model card (2 Apr 2026), read by me from a small chart image so treat the digits as approximate: GPT-Transcribe 2.0; MAI-Transcribe-1 2.2; Gemini 3.1 Flash 2.4; Scribe v2 2.7; Whisper large-v3 2.8. 25-language averages: MAI-Transcribe-1 3.86, GPT-Transcribe 4.17, Scribe v2 4.32, Gemini 3.1 Flash 4.89, Whisper 7.60. [primary, vendor] — [MAI-Transcribe-1 Model Card](https://microsoft.ai/pdf/MAI-Transcribe-1-Model-Card.pdf)
- Earlier Voxtral paper, FLEURS Spanish (search summary, not re-read): GPT-4o mini Transcribe 2.58; Voxtral Small 2.72; Voxtral Mini Transcribe 2.75; Whisper large-v3 2.81; Scribe (v1) 3.13; Gemini 2.5 Flash 3.17; Voxtral Mini 3.52. [secondary] — [Voxtral, arXiv 2507.13264](https://arxiv.org/pdf/2507.13264)
- Open ASR Leaderboard multilingual track, Spanish: NVIDIA Canary 1B v2 3.25 %; Whisper large-v3 3.65 %; Parakeet TDT 0.6B v3 3.73 %. A second figure set in the same search results gives Parakeet v3 3.5 % vs Whisper large-v3 3.1 % for Spanish (different test set mix). [secondary] — [Open ASR Leaderboard paper](https://arxiv.org/html/2510.06961v4); [Canary-1B-v2 / Parakeet-TDT-0.6B-v3 paper](https://arxiv.org/html/2509.14128v1)
- Moonshine v2 Spanish on-device streaming models: Small Streaming 4.91 % WER on FLEURS Spanish and 4.95 % on Multilingual LibriSpeech Spanish; Tiny Streaming 6.2 %. [secondary] — [moonshine-streaming-small-es](https://huggingface.co/moonshine-ai/moonshine-streaming-small-es)
- ElevenLabs places Spanish in its "Excellent" tier, defined as ≤5 % WER. [primary] — [ElevenLabs STT docs](https://elevenlabs.io/docs/overview/capabilities/speech-to-text)
- Deepgram reports Nova-3 Spanish streaming WER improved 21.4 % relative to Nova-2 (no absolute Spanish WER found). [secondary, vendor] — [Deepgram Nova-3 Spanish/French/Portuguese](https://deepgram.com/learn/deepgram-expands-nova-3-with-spanish-french-and-portuguese-support)
- Whisper: one write-up cites 2.0 % Spanish WER on standard benchmarks vs 7.2 % on Common Voice Spanish. [secondary] — [vexascribe Whisper benchmark](https://vexascribe.com/how-accurate-is-whisper)
- Gemini 3.5 Transcribe: Google-reported multilingual FLEURS 5.04 % (file) and 5.50 % (live); no Spanish-only figure. [secondary] — [eesel on Gemini 3.5 Transcribe](https://www.eesel.ai/blog/gemini-3-5-transcribe)
- Soniox publishes no Spanish WER on its Spanish page or benchmarks page; its public benchmark is English-only "semantic WER" on 1,000 samples from `pipecat-ai/smart-turn-data-v3.1-train` (Aug 2026). [primary] — [Soniox benchmarks](https://soniox.com/benchmarks); [Soniox Spanish](https://soniox.com/speech-to-text/spanish)

**Artificial Analysis (English-only, but the main independent ranking)**
- AA-WER v2 is English: AA-AgentTalk 50 %, VoxPopuli-Cleaned 25 %, Earnings22-Cleaned 25 %. It says nothing direct about Spanish. — [AA non-streaming leaderboard](https://artificialanalysis.ai/speech-to-text/non-streaming)
- Non-streaming AA-WER (lower is better), selected: Fun-Realtime-ASR-preview (Alibaba) 1.7; StepAudio 3 ASR 1.7; MAI-Transcribe-2 2.0; Scribe v2 2.2; Grok Voice Transcribe 2.0 2.3; MAI-Transcribe-1.5 2.4; Smallest Pulse Pro 2.4; Gemini 3.5 Transcribe 2.6; Voxtral Small 2.8; AssemblyAI Universal-3 Pro 3.1; Gladia Solaria-3 3.2; GPT Transcribe 3.3; Voxtral Mini Transcribe 2 3.6; Soniox v5 Async 3.8; AssemblyAI Universal 3.8; GPT-4o Transcribe 4.0; Speechmatics Enhanced 4.0; Amazon Transcribe 4.1; Whisper large-v2 (OpenAI) 4.1; Chirp 3 4.3; Canary Qwen 2.5B 4.3; GPT-4o Mini Transcribe 4.5; Parakeet TDT 0.6B v3 4.5; Whisper large-v3-turbo (Groq) 4.6; Speechmatics Melia 4.9; Deepgram Nova-3 5.2. — [AA non-streaming leaderboard](https://artificialanalysis.ai/speech-to-text/non-streaming)
- Microsoft says MAI-Transcribe-2-Streaming (1 Oct 2026) ranks no. 1 on Artificial Analysis for both final and partial transcripts; third-party coverage puts it at 2.5 % WER. — [Microsoft AI](https://microsoft.ai/news/our-first-streaming-transcription-model/); [secondary: MarkTechPost](https://www.marktechpost.com/2026/10/02/microsoft-ai-releases-mai-transcribe-2-streaming-1-real-time-speech-to-text-model-on-artificial-analysis/)
- Groq's own docs list much higher WERs for its hosted Whisper: large-v3 10.3 %, large-v3-turbo 12 % (test set not stated in what I read). — [Groq STT docs](https://console.groq.com/docs/speech-to-text)

**Non-native / accented speech**
- Non-native *English* study, five ASR systems, speakers from six L1s (incl. Spanish): Whisper and AssemblyAI best on read speech at about 5.4–5.6 % match error rate; best system on spontaneous speech 6.3 %; disfluency handling varied a lot between systems. — [arXiv 2503.06924](https://arxiv.org/abs/2503.06924)
- A Swedish L1-vs-L2 study found WER on common ASR services roughly doubles for L2 speakers on read sentences. [secondary] — [arXiv 2405.13379](https://arxiv.org/pdf/2405.13379)
- Whisper large-v2 on read speech from learners of French: mean WER 13.2 %. Whisper on non-native Dutch children: 75.2 % accuracy read, 66.2 % dialogue. [secondary] — [ScienceDirect, elicited imitation](https://www.sciencedirect.com/science/article/pii/S2772766125000187)
- OpenAI says `gpt-transcribe` / `gpt-live-transcribe` are more accurate "across accents and languages, including for short phrases, numbers, specialized terminology" and noisy speech; no numbers given. [vendor claim] — [OpenAI community announcement](https://community.openai.com/t/gpt-live-transcribe-and-gpt-transcribe-two-new-transcription-models-in-the-api/1388318)

**Locale support for Argentine Spanish**
- Azure AI Speech: `es-AR` is supported for real-time STT, fast transcription and phrase lists, alongside 21 other Spanish locales (es-US, es-ES, es-MX, es-UY, es-CL …). Custom speech for es-AR is text/pronunciation only (no audio + transcript training, unlike es-ES/es-MX). Pronunciation assessment exists only for `es-ES` and `es-MX`. MAI-Transcribe 1.5 / 2 take generic `es`. — [Azure language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=stt)
- Google Chirp 3: Spanish locales are `es-ES` and `es-US` (GA) and `es-MX` (preview); no `es-AR` or `es-419` listed. — [Chirp 3 docs](https://docs.cloud.google.com/speech-to-text/docs/models/chirp-3)
- Deepgram Nova-3: `es` and `es-419` only. — [Deepgram models & languages](https://developers.deepgram.com/docs/models-languages-overview)
- Apple SpeechTranscriber (iOS 26): reported supported Spanish locales are es_CL, es_ES, es_MX, es_US; es_AR is not in the list (42 locales / 22 languages as of Aug 2026). [secondary] — [Anton Gubarenko, SpeechAnalyzer guide](https://antongubarenko.substack.com/p/ios-26-speechanalyzer-guide)
- Speechmatics: a single `es` pack described as covering Spain, US, Mexico, Colombia, Argentina, Venezuela, Chile and Peru accents. — [Speechmatics languages](https://docs.speechmatics.com/speech-to-text/languages)
- OpenAI `gpt-transcribe` accepts ISO 639-1 codes (e.g. `es`); regional variants are only documented for Chinese. — [OpenAI speech-to-text guide](https://developers.openai.com/api/docs/guides/speech-to-text)
- ElevenLabs realtime takes `language_code` in ISO 639-1 / 639-3 (no regional variants). — [ElevenLabs realtime API reference](https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime)

### Inferences
- FLEURS Spanish is saturated (2.0–3.4 % for all leading models), so it cannot be used to pick a provider for this app. Common Voice Spanish (crowd-sourced, varied mics and accents, short read sentences) is the closest public proxy for phone-recorded learner lines, and there the spread is 4× (3.9 % → 15.9 %).
- Scribe v2 **Realtime**'s Common Voice result (15.93 % Spanish) is a warning sign for short, noisy, phone-quality clips, though it comes from a competitor's paper (Feb 2026) and may reflect how the realtime API was driven. Batch Scribe v2 was not in that table.
- Non-native speech should be assumed to cost roughly 1.5–2× the native WER, based on L2 studies in other languages. No study I found measures L2 Spanish.
- es-AR locale probably matters little for English-speaking learners: their accent is English-influenced, not rioplatense. Where it could matter is vocabulary (voseo forms like "tenés", "querés", "decime", and lunfardo), which a keyterm / phrase list handles better than a locale code. This is my reasoning, not a tested result.
- For a learner app a model with a strong language model is double-edged: low WER partly comes from "fixing" what was said. Benchmarks reward that; a pronunciation / grammar checker is hurt by it (see section 3).

### Gaps
- No published WER for non-native (L2) Spanish for any provider. Needs an in-house test set of real learner recordings.
- No Spanish-only WER found for: `gpt-transcribe` / `gpt-live-transcribe` (other than the MAI chart), Deepgram Nova-3 / Flux multilingual, AssemblyAI Universal-3.5 / 3.6 Pro, Soniox v5, Gladia Solaria-3, Speechmatics, Amazon Transcribe, Chirp 3, Gemini 3.5 Transcribe, MAI-Transcribe-2, Apple SpeechTranscriber, Android on-device.
- No benchmark isolates 2–15 s utterances or single-word answers.
- No source compares es-AR vs es-ES/es-US locale accuracy on the same audio.
- I could not read the Artificial Analysis streaming table (page renders client-side).

## 2. Batch vs streaming (partials for Spanish, latency to final, endpointing, time for a 5–10 s batch clip)

### Takeaway
Almost every provider now streams Spanish with partial results; the practical differences are how fast the final arrives after speech ends (roughly 130–300 ms where a number is published) and whether you can force the final yourself (push-to-talk), which matters more than semantic turn detection for a "hold to speak one line" exercise. I found no measured timings for batch requests on 5–10 s clips.

### Cited Findings

**Streaming with partials, Spanish supported**
- ElevenLabs Scribe v2 Realtime: ~150 ms latency claim, 90+ languages; emits `partial_transcript` then `committed_transcript`; commit strategies `manual` (default), `vad`, and `turn_prediction` (listed in the API reference only; the cookbook describes only manual and VAD). VAD example values: silence threshold 1.5 s, VAD threshold 0.4, min speech 100 ms, min silence 100 ms. Manual mode auto-commits after about 36 s of audio. — [ElevenLabs realtime API reference](https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime); [commit strategies cookbook](https://elevenlabs.io/docs/eleven-api/guides/cookbooks/speech-to-text/realtime/transcripts-and-commit-strategies)
- OpenAI `gpt-live-transcribe`: realtime deltas over WebSocket or WebRTC; `transcription.delay` setting (minimal / low / medium / high / xhigh) trades latency against WER; `turn_detection` must be `null` for transcription sessions (no server VAD / semantic VAD), so the client ends the turn with `input_audio_buffer.commit`. `gpt-transcribe` can also be used in a realtime session to transcribe committed turns. — [OpenAI realtime transcription guide](https://developers.openai.com/api/docs/guides/realtime-transcription)
- OpenAI file endpoint: `stream=true` on `gpt-transcribe`, `gpt-4o-transcribe`, `gpt-4o-mini-transcribe` returns `transcript.text.delta` events for an already-recorded file; `whisper-1` does not stream. — [OpenAI speech-to-text guide](https://developers.openai.com/api/docs/guides/speech-to-text)
- Deepgram Flux: `flux-general-multi` covers Spanish (10 languages) on `/v2/listen`; model-integrated turn detection with events StartOfTurn, EagerEndOfTurn, TurnResumed, EndOfTurn, Update; `eot_threshold` 0.5–1.0 (default 0.7), `eager_eot_threshold` 0.3–0.9, `eot_timeout_ms` 500–60000 (default 5000); "~260 ms end-of-turn detection"; accuracy described as "Nova-3 level"; best fed 80 ms chunks at 16 kHz. — [Deepgram Flux quickstart](https://developers.deepgram.com/docs/flux/quickstart)
- Deepgram Nova-3 streaming supports Spanish (`es`, `es-419`) and `multi`. — [Deepgram models & languages](https://developers.deepgram.com/docs/models-languages-overview)
- AssemblyAI Universal-3.6 Pro Realtime (32 languages, Spanish included) and Universal-Streaming Multilingual (EN, ES, DE, FR, PT, IT). Turn detection: `min_turn_silence` 128 ms (min_latency / balanced) or 512 ms (max_accuracy); `max_turn_silence` 640 / 1280 / 2560 ms; `vad_threshold` default 0.2; `interruption_delay` 0 or 500 ms before the first partial; partials roughly every second plus at pauses; finals arrive formatted; a `ForceEndpoint` message ends the turn immediately. — [AssemblyAI model selection](https://www.assemblyai.com/docs/streaming/select-the-speech-model); [AssemblyAI turn detection](https://www.assemblyai.com/docs/streaming/turn-detection)
- Soniox `stt-rt-v5`: non-final and final tokens streamed continuously, semantic endpoint detection with `max_endpoint_delay_ms`, manual finalization; "sub-200 ms streaming latency" claim. — [Soniox models](https://soniox.com/docs/stt/models); [Soniox Spanish](https://soniox.com/speech-to-text/spanish)
- Speechmatics realtime: partials + finals + EndOfUtterance at silence gaps; `ForceEndOfUtterance` returns the final in about 250 ms (network dependent). Melia 1 is batch only. [secondary] — [Speechmatics article](https://www.speechmatics.com/company/articles-and-news/you-cant-hurry-love-but-you-can-hurry-final-transcripts); [Speechmatics pricing](https://www.speechmatics.com/pricing)
- Gladia Solaria-1: published 103 ms partial and 270 ms final latency; no separate Solaria-3 figure found. [secondary, vendor blog] — [Gladia blog](https://www.gladia.io/blog/best-real-time-stt-models-for-meeting-assistants-2026)
- Microsoft MAI-Transcribe-2-Streaming (public preview, 1 Oct 2026): first partials "just over 100 ms" after audio, 60 languages with automatic language detection; third-party coverage reports the final 0.13 s after speech ends. Microsoft's docs call it a preview "without a service-level agreement" and "not recommended for production workloads". — [Microsoft AI](https://microsoft.ai/news/our-first-streaming-transcription-model/); [secondary: beri.net](https://www.beri.net/article/microsoft-mai-transcribe-2-streaming-real-time-stt-wer-pricing-preview-no-sla-vs-gemini-transcribe-grok)
- Azure AI Speech classic real-time STT supports all 22 Spanish locales incl. es-AR. — [Azure language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=stt)
- Google Chirp 3 supports `StreamingRecognize` plus sync and batch. Gemini 3.5 Transcribe has a streaming sibling `gemini-3.5-transcribe-live` on the Live API, 10 minutes per session. — [Chirp 3 docs](https://docs.cloud.google.com/speech-to-text/docs/models/chirp-3); [secondary: eesel](https://www.eesel.ai/blog/gemini-3-5-transcribe)
- Mistral Voxtral Realtime: streaming, "configurable latency down to sub-200 ms", 13 languages incl. Spanish, open weights (4B params, Apache 2.0). Accuracy depends strongly on the delay chosen (Spanish FLEURS 4.59 % at 240 ms vs 2.98 % at 960 ms). — [Mistral STT docs](https://docs.mistral.ai/capabilities/audio/speech_to_text/); [arXiv 2602.11298](https://arxiv.org/pdf/2602.11298)

**Batch only / no live streaming**
- MAI-Transcribe-1: no real-time, diarization or context biasing at launch (Apr 2026). — [MAI-Transcribe-1 Model Card](https://microsoft.ai/pdf/MAI-Transcribe-1-Model-Card.pdf)
- Groq Whisper: file endpoint only in the docs I read; no streaming mentioned. — [Groq STT docs](https://console.groq.com/docs/speech-to-text)

**How Artificial Analysis measures streaming latency**
- Latency clock starts at the SileroVAD-detected end of speech and measures time to first partial and to final separately; models with forced endpointing are sent an endpoint request at that moment. — [AA streaming leaderboard](https://artificialanalysis.ai/speech-to-text/streaming)

**Batch throughput (speed factor = audio seconds per wall-clock second, measured on AA's files, not on 5–10 s clips)**
- Deepgram Nova-3 662×; Parakeet TDT v3 (Together) 446×; MAI-Transcribe-2 315×; Speechmatics Melia 181×; Universal-3 Pro 107×; Whisper large-v3-turbo on Groq 92×; Gemini 3.5 Transcribe 89×; MAI-Transcribe-1.5 78×; Scribe v2 67×; GPT Transcribe 55×; GPT-4o Mini Transcribe 54×; Soniox v5 Async 43×; GPT-4o Transcribe 37×; Chirp 3 30×; Amazon Transcribe 30×. — [AA non-streaming leaderboard](https://artificialanalysis.ai/speech-to-text/non-streaming)

### Inferences
- For "learner taps, says one line, releases", manual commit / forced endpoint is the right control: ElevenLabs `commit`, OpenAI `input_audio_buffer.commit`, AssemblyAI `ForceEndpoint`, Speechmatics `ForceEndOfUtterance`, Soniox manual finalization. This removes the 0.5–1.5 s of silence a VAD needs before it finalizes, and avoids cutting off learners who pause mid-sentence to think.
- Automatic endpointing is risky for learners: they pause longer and more often than native speakers, so thresholds tuned for voice agents (e.g. AssemblyAI 128–1280 ms, Flux default 0.7) will end turns early. If auto-endpointing is used, start with long silence limits.
- Even the slowest batch model above (30×) needs about 0.3 s of compute for a 10 s clip, so for 5–10 s clips total time should be dominated by upload, queueing and connection setup rather than inference. Expect well under ~1–2 s on the fast providers; this is an estimate from speed factors, not a measurement.
- Streaming buys two things here: live partial text while the learner speaks, and a final that arrives ~150–300 ms after release instead of after an upload. If the UI does not show live words, batch on a fast provider is simpler and cheaper.

### Gaps
- No source measured end-to-end time for a 5–10 s batch request from a phone for any provider. Needs a quick bench.
- No published time-to-final for ElevenLabs manual commit, OpenAI `gpt-live-transcribe` commit, or Soniox manual finalize.
- No independent comparison of end-of-turn detection quality on Spanish, let alone on hesitant learner speech.
- Amazon Transcribe streaming behaviour and Chirp 3 streaming latency not researched.

## 3. Controls (language forcing, keyterms / prompts and whether they bias output, temperature, verbatim, disfluencies, timestamps, confidence, audio events, code-switching)

### Takeaway
All providers let you force Spanish; the meaningful differences are per-word confidence (ElevenLabs realtime, Soniox, Deepgram, Apple and Whisper-family expose something; OpenAI's new models and Chirp 3 do not), strict-language options, and how aggressively prompts or keyterms pull the transcript toward expected words. For a learner app that biasing is a real hazard: feeding the target sentence as a prompt can make the model "hear" the correct line when the learner said something else.

### Cited Findings

**Per-provider control surface**
- ElevenLabs Scribe v2 (batch): keyterm prompting (up to 1000 terms, 50 chars each), word-level timestamps, entity detection, diarization, "no verbatim" mode that strips fillers and disfluencies, audio event tagging, transcript editing by instruction. — [ElevenLabs STT docs](https://elevenlabs.io/docs/overview/capabilities/speech-to-text)
- ElevenLabs Scribe v2 Realtime: `language_code`, `secondary_languages`, `keyterms` ("the model is biased towards"), `previous_text` context on the first chunk, `no_verbatim`, `include_timestamps` (word timestamps with a per-word confidence / logprob in `committed_transcript_with_timestamps`), `include_language_detection`, `filter_background_audio`, PCM 8–48 kHz or µ-law, single-use `token` auth for clients. — [ElevenLabs realtime API reference](https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime)
- OpenAI `gpt-transcribe` / `gpt-4o-transcribe`: `prompt`, `languages`, `keywords`, `stream`. Word/segment timestamps (`timestamp_granularities`, `verbose_json`) exist only on `whisper-1`, whose prompt is capped at 224 tokens. Files up to 25 MB. — [OpenAI speech-to-text guide](https://developers.openai.com/api/docs/guides/speech-to-text)
- OpenAI `gpt-live-transcribe`: `transcription.prompt`, `transcription.keywords`, `transcription.languages`, `transcription.delay`; docs state no word-level timestamps, speaker labels or confidence scores. — [OpenAI realtime transcription guide](https://developers.openai.com/api/docs/guides/realtime-transcription)
- OpenAI `gpt-4o-transcribe` could return token log-probabilities via `include=["logprobs"]`. [secondary] — [opentranscription.io profile](https://opentranscription.io/blog/gpt-4o-transcribe.html)
- OpenAI reports context helps: on its Context Aware ASR benchmark, `gpt-live-transcribe` semantic accuracy rose from 38.5 % to 44.6 % with free-form context. [vendor claim, secondary] — [OpenAI community announcement](https://community.openai.com/t/gpt-live-transcribe-and-gpt-transcribe-two-new-transcription-models-in-the-api/1388318)
- Deepgram: Nova-3 keyterm prompting (paid add-on); Flux `keyterm` and, on `flux-general-multi`, `language_hint` to bias toward given languages; word-level timestamps. — [Deepgram Flux quickstart](https://developers.deepgram.com/docs/flux/quickstart); [Deepgram pricing](https://deepgram.com/pricing)
- AssemblyAI streaming: `prompt` (natural-language context) and `keyterms_prompt` (max 100 terms, 50 chars each) on universal-3-6-pro, universal-3-5-pro and both Universal-Streaming models; both can be changed mid-session via `UpdateConfiguration`; language set with `language_codes`. Prompts cannot control formatting or verbatim behaviour in streaming. — [AssemblyAI prompting and keyterms](https://www.assemblyai.com/docs/streaming/prompting-and-keyterms)
- Soniox v5: language hints plus strict language-hint enforcement, context (general / text / terms), token-level confidence and timestamps, language identification, speaker diarization. — [Soniox models](https://soniox.com/docs/stt/models)
- Google Chirp 3: speech adaptation (biasing), built-in denoiser, `language_codes=["auto"]`, diarization, utterance-level timestamps; word-level timestamps and word-level confidence are **not** supported. — [Chirp 3 docs](https://docs.cloud.google.com/speech-to-text/docs/models/chirp-3)
- Gemini 3.5 Transcribe: word-level timestamps, diarization, custom vocabulary, 85+ languages; 1 hour max audio (30 min with timestamps / diarization). [secondary] — [eesel](https://www.eesel.ai/blog/gemini-3-5-transcribe)
- Azure AI Speech: phrase lists on every Spanish locale; pronunciation assessment only on es-ES and es-MX. MAI-Transcribe-2-Streaming is reported to add diarization, word timestamps and keyword biasing. — [Azure language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=stt); [secondary: datanorth](https://datanorth.ai/news/microsoft-releases-mai-transcribe-2-streaming)
- Mistral Voxtral Mini Transcribe V2: language, context biasing, temperature, word-level timestamps, diarization, audio up to 3 hours. — [Mistral STT docs](https://docs.mistral.ai/capabilities/audio/speech_to_text/)
- Groq Whisper: `language`, `prompt`, `temperature` (0–1), word / segment timestamps, and `verbose_json` metadata `avg_logprob`, `no_speech_prob`, `compression_ratio`. — [Groq STT docs](https://console.groq.com/docs/speech-to-text)
- Speechmatics: `es` pack, and a Spanish–English bilingual pack `{"language":"es","domain":"bilingual-en"}` on Standard / Enhanced. — [Speechmatics languages](https://docs.speechmatics.com/speech-to-text/languages)
- Amazon Transcribe: custom vocabularies; custom language models billed extra. [secondary] — [brasstranscripts](https://brasstranscripts.com/blog/aws-transcribe-pricing-per-minute-2025-better-alternative)

**Does boosting bias output toward expected words?**
- AssemblyAI's own docs: start without prompting; adding many keyterms, especially common words, "could lead to overcorrections and hallucinations", while the model "is trained to stay grounded in the audio". — [AssemblyAI prompting and keyterms](https://www.assemblyai.com/docs/streaming/prompting-and-keyterms)
- OpenAI forum reports: `gpt-4o-transcribe` sometimes returns a final transcript that exactly replicates the configured prompt, mostly when the audio contains no speech. — [OpenAI community thread](https://community.openai.com/t/gpt-4o-transcribe-why-does-the-final-output-sometimes-exactly-replicate-the-configured-prompt/1226877/3)
- Research framing: biasing trades entity recall against false alarms; commercial phrase / keyterm interfaces carry a false-positive trade-off that Google documents explicitly. [secondary] — [arXiv 2512.21828](https://arxiv.org/pdf/2512.21828); [arXiv 2601.15397](https://arxiv.org/html/2601.15397v1)
- A preregistered ablation found no detectable WER change from prompt-level context on a production oral-history corpus. [secondary, title-level only] — [arXiv 2608.28875](https://arxiv.org/pdf/2608.28875)

**Code-switching (English + Spanish in one utterance)**
- AssemblyAI Universal-3.6 Pro: "native code switching" across 32 languages (Pro models only). — [AssemblyAI model selection](https://www.assemblyai.com/docs/streaming/select-the-speech-model)
- Deepgram Nova-3 `multi` and `flux-general-multi` cover English + Spanish in one stream. — [Deepgram models & languages](https://developers.deepgram.com/docs/models-languages-overview)
- Soniox: automatic language identification and switching mid-audio. — [Soniox Spanish](https://soniox.com/speech-to-text/spanish)
- ElevenLabs realtime: `secondary_languages` and language detection in results. — [ElevenLabs realtime API reference](https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime)
- Speechmatics: es + en bilingual pack; Melia 1 switches languages automatically (batch only). — [Speechmatics languages](https://docs.speechmatics.com/speech-to-text/languages)
- Gladia: code-switching included in base price across 100+ languages. [secondary, vendor] — [Gladia pricing blog](https://www.gladia.io/blog/deepgram-pricing)
- Gemini 3.5 Transcribe and MAI-Transcribe-2-Streaming: auto language detection with mid-session mixing. [secondary] — [eesel](https://www.eesel.ai/blog/gemini-3-5-transcribe); [Microsoft AI](https://microsoft.ai/news/our-first-streaming-transcription-model/)
- Published code-switching benchmark numbers I found cover German–English (Nova-3 5.0 % WER), not Spanish–English. [secondary] — [arXiv 2605.19069](https://arxiv.org/pdf/2605.19069)

### Inferences
- Two different product needs pull in opposite directions. To *recognise what the learner meant* (free speaking with Pancho), prompts / keyterms with the lesson vocabulary help. To *judge whether they said the line correctly* (repeat-after-me), any prompt containing the target sentence risks false "correct" results. A safe pattern: no target text in the prompt for graded exercises, at most a short neutral vocabulary list, then compare transcript to target in app code using per-word confidence where available.
- Forcing `es` stops English misdetection on short clips, but with a strict Spanish-only setting an English word the learner blurts ("um, how do you say…") will be rendered as Spanish-sounding nonsense. If the app needs to detect "learner fell back to English", use a bilingual / multi mode (Nova-3 `multi`, Flux multi with hints, Speechmatics es+en, ElevenLabs `secondary_languages`, Soniox hints without strict) instead.
- Verbatim matters for learners: cleaned modes (ElevenLabs `no_verbatim`, AssemblyAI's formatted finals) hide hesitations, repetitions and self-corrections that a tutor may want to see. Keep verbatim on if feedback uses them.
- Per-word confidence is the most useful control for "which word did they mispronounce". On the cloud side it is documented for ElevenLabs realtime and Soniox; Groq Whisper gives only segment-level `avg_logprob`; OpenAI's 2026 models give none. Only Azure offers true pronunciation scoring, and only for es-ES / es-MX.

### Gaps
- No vendor documents how strongly keyterms bias toward a *full expected sentence*; needs an adversarial test (say a wrong word, prompt with the right one).
- Temperature: only documented for Groq Whisper and Voxtral in what I read; not confirmed for ElevenLabs, Deepgram, AssemblyAI, Soniox, `gpt-transcribe`.
- Whether `gpt-transcribe` (2026) still supports `include=["logprobs"]` was not confirmed on a primary page.
- Deepgram per-word confidence, filler-word and endpointing parameters for Nova-3 Spanish were not confirmed on the pages I fetched.
- Audio event tagging beyond ElevenLabs not researched.
- Azure pronunciation assessment details for Spanish (phoneme scores, unscripted mode) not researched; search budget ran out.

## 4. Behaviour on silence / noise and on one-word utterances

### Takeaway
Hallucinating a stock phrase on silence is a well-documented Whisper-family problem and is worst on exactly this app's input: nearly silent 2–3 s clips. The newer LLM-style models largely fix the "thanks for watching" failure but have their own (echoing the prompt back on no-speech audio); I found no vendor or independent data on one-word Spanish answers like "sí", "no", "dale".

### Cited Findings
- Whisper invents sentences such as "Thank you for watching" / "Please subscribe" on silent audio; the commonly given cause is training on ~680k hours of web audio where silence coincided with video outros. — [openai/whisper discussion #1606](https://github.com/openai/whisper/discussions/1606); [secondary: MetaWhisp](https://metawhisp.com/blog/whisper-hallucination-silence-fix/)
- A documented test (Apr 2026) of six problem files: `whisper-1` repeated "Thank you for watching" 69 times in a 27-minute meeting and hallucinated on a nearly silent 2.7 s clip; triggers named were long silences, ~16 kbps low-bitrate audio, and 2–3 s recordings. `gpt-4o-transcribe` produced no hallucinations on the same six files. Single author, Japanese audio, small sample. — [zenn.dev write-up](https://zenn.dev/daishiro/articles/whisper-hallucination-gpt4o-transcribe?locale=en)
- `gpt-4o-transcribe` failure modes reported by developers: returns the configured prompt verbatim when audio has noise but no speech; drops segments around pauses; hallucinates on noise-only chunks with `chunking_strategy="auto"`. — [OpenAI community: prompt replicated](https://community.openai.com/t/gpt-4o-transcribe-why-does-the-final-output-sometimes-exactly-replicate-the-configured-prompt/1226877/3); [OpenAI community: paused audio](https://community.openai.com/t/gpt-4o-transcribe-inconsistent-with-paused-audio-drops-segments/1316119)
- Groq's Whisper endpoint returns `no_speech_prob`, `avg_logprob` and `compression_ratio` per segment, which can be used to discard silent or looping outputs. — [Groq STT docs](https://console.groq.com/docs/speech-to-text)
- AssemblyAI streaming emits a `SpeechStarted` event that, per its docs, noise alone will not trigger. — [AssemblyAI turn detection](https://www.assemblyai.com/docs/streaming/turn-detection)
- ElevenLabs realtime exposes `min_speech_duration_ms` (example 100 ms), `vad_threshold` and `filter_background_audio`. — [ElevenLabs realtime API reference](https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime); [commit strategies cookbook](https://elevenlabs.io/docs/eleven-api/guides/cookbooks/speech-to-text/realtime/transcripts-and-commit-strategies)
- Chirp 3 has a built-in denoiser. — [Chirp 3 docs](https://docs.cloud.google.com/speech-to-text/docs/models/chirp-3)
- OpenAI states the July 2026 models are more accurate on "short phrases" and loud background noise (no data). [vendor claim] — [OpenAI community announcement](https://community.openai.com/t/gpt-live-transcribe-and-gpt-transcribe-two-new-transcription-models-in-the-api/1388318)
- whisper.rn bundles Silero VAD for speech-segment detection on device. — [whisper.rn](https://github.com/mybigday/whisper.rn)

### Inferences
- The Spanish "Gracias por ver el video" / "Subtítulos…" outputs are the same mechanism as the English ones; I did not find a source quoting the Spanish phrase specifically, so cite it as the Spanish form of a documented pattern, not as a sourced example.
- Anything Whisper-based (whisper-1, Groq large-v3 / turbo, whisper.rn, react-native-executorch, WhisperKit) needs a guard for this app: client-side VAD / energy gate before sending, reject on high `no_speech_prob` or low `avg_logprob`, and a blocklist of known stock phrases.
- Prompted LLM transcribers add a new risk for graded exercises: on a silent or noise-only clip they may return the prompt. If the prompt contains the target line, a learner who says nothing could be marked correct. Never put the expected answer in the prompt, and always gate on detected speech.
- One-word answers give the model almost no acoustic or linguistic context, so short-utterance errors (e.g. "sí" vs "si", "dale" vs "vale") are likely across providers. A constrained keyterm list for the handful of expected answers is the natural mitigation, with the bias caveat from section 3.
- A minimum-speech setting matters in the other direction too: "sí" can be ~150–250 ms, so VAD minimum-duration and pre-roll must be short enough not to drop it.

### Gaps
- No data, vendor or independent, on single-word Spanish utterance accuracy for any provider.
- No documented silence / noise behaviour for Scribe v2, Nova-3 / Flux, Universal-3.x, Soniox v5, `gpt-transcribe`, MAI-Transcribe-2, Gemini 3.5 Transcribe, Apple SpeechTranscriber.
- No sourced instance of the exact Spanish hallucination strings.

## 5. Price, free tiers, rate limits, regions, data retention

### Takeaway
Cloud STT is cheap for this use: about $0.04–$0.75 per audio hour batch and $0.12–$1.02 per hour streaming, so 10 s of speech costs between roughly $0.0001 and $0.003. Per-request minimums (Groq bills at least 10 s) and add-ons (keyterms) matter more than headline rates on short clips, and zero-retention terms vary from self-serve (AssemblyAI streaming, Deepgram at a price, Soniox by default) to enterprise-only (OpenAI, ElevenLabs).

### Cited Findings

**List prices (USD; pay-as-you-go unless noted)**

| Provider / model | Batch | Streaming | Source |
|---|---|---|---|
| Groq Whisper large-v3-turbo | $0.04/hr (min. billed 10 s per request) | n/a | [Groq docs](https://console.groq.com/docs/speech-to-text) |
| Groq Whisper large-v3 | $0.111/hr | n/a | [Groq docs](https://console.groq.com/docs/speech-to-text) |
| Soniox v5 | $0.10/hr | $0.12/hr | [Soniox Spanish](https://soniox.com/speech-to-text/spanish) |
| Speechmatics | Melia 1 $0.129/hr; Standard $0.24/hr; Enhanced $0.40/hr | Standard $0.24/hr; Enhanced $0.43/hr (cut from $0.56 in Jul 2026) | [secondary: Speechmatics pricing](https://www.speechmatics.com/pricing), [usagepricing](https://www.usagepricing.com/blueprint/activity/speechmatics-2026-07-06-realtime-stt-price-cut) |
| AssemblyAI | Universal-2 $0.15/hr; Universal-3.5 Pro $0.21/hr (+$0.05/hr keyterms) | Universal-Streaming Multilingual $0.15/hr (keyterms included); Universal-3.6 Pro Realtime $0.45/hr (keyterms included) | [AssemblyAI pricing](https://www.assemblyai.com/pricing) |
| OpenAI gpt-4o-mini-transcribe | $0.003/min ($0.18/hr) | — | [OpenAI pricing](https://developers.openai.com/api/docs/pricing) |
| ElevenLabs Scribe v2 | $0.22/hr (+$0.05/hr keyterms) | Scribe v2 Realtime $0.39/hr (+$0.08/hr keyterms) | [ElevenLabs API pricing](https://elevenlabs.io/pricing/api) |
| Deepgram Nova-3 | mono $0.0043/min ($0.26/hr); multi $0.0052/min | mono $0.0048/min ($0.29/hr); multi $0.0058/min ($0.35/hr); keyterms +$0.0013/min | [Deepgram pricing](https://deepgram.com/pricing) |
| Deepgram Flux | — | English $0.0065/min (promo); Multilingual $0.0078/min ($0.47/hr) | [Deepgram pricing](https://deepgram.com/pricing) |
| OpenAI gpt-transcribe | $0.0045/min ($0.27/hr) | — | [OpenAI pricing](https://developers.openai.com/api/docs/pricing) |
| OpenAI gpt-4o-transcribe / whisper-1 | $0.006/min ($0.36/hr) | — | [OpenAI pricing](https://developers.openai.com/api/docs/pricing) |
| OpenAI gpt-live-transcribe / gpt-realtime-whisper | — | $0.017/min ($1.02/hr) | [OpenAI pricing](https://developers.openai.com/api/docs/pricing) |
| Microsoft MAI-Transcribe-1 | $0.36/hr (launch price, Apr 2026) | — | [MAI model card](https://microsoft.ai/pdf/MAI-Transcribe-1-Model-Card.pdf) |
| Microsoft MAI-Transcribe-2 / 1.5 | $1.67 / $6.00 per 1000 min ($0.10 / $0.36 per hr) per AA | 2-Streaming $0.54/hr introductory through end of 2026 | [AA leaderboard](https://artificialanalysis.ai/speech-to-text/non-streaming); [Microsoft AI](https://microsoft.ai/news/our-first-streaming-transcription-model/) |
| Google Gemini 3.5 Transcribe | ~$0.005/min ($0.30/hr) | `-live` ~$0.009/min ($0.54/hr) | [secondary: eesel](https://www.eesel.ai/blog/gemini-3-5-transcribe) |
| Google Chirp 3 | $16 per 1000 min ($0.96/hr) per AA | not confirmed | [AA leaderboard](https://artificialanalysis.ai/speech-to-text/non-streaming) |
| Mistral Voxtral Mini Transcribe 2 / Voxtral Small | $3.00 / $4.00 per 1000 min ($0.18 / $0.24 per hr) per AA | Voxtral Realtime price not found | [AA leaderboard](https://artificialanalysis.ai/speech-to-text/non-streaming) |
| Amazon Transcribe | $6.00 per 1000 min per AA; secondary sources quote $0.024/min tier 1 falling to $0.0078/min at 5M+ min (sources conflict with another quoting $0.006/min batch, $0.01/min streaming) | see left | [AA leaderboard](https://artificialanalysis.ai/speech-to-text/non-streaming); [secondary: brasstranscripts](https://brasstranscripts.com/blog/aws-transcribe-pricing-per-minute-2025-better-alternative) |
| Gladia (Solaria) | $0.61/hr self-serve; $0.50/hr scaling | $0.75/hr self-serve; $0.55/hr scaling; all features included | [secondary, vendor blog](https://www.gladia.io/blog/deepgram-pricing) |
| NVIDIA Parakeet TDT 0.6B v3 (Together AI) | $1.50 per 1000 min ($0.09/hr) per AA | — | [AA leaderboard](https://artificialanalysis.ai/speech-to-text/non-streaming) |

- The Deepgram search summary also quotes a "regular" Nova-3 multilingual rate of $0.0092/min versus $0.0058 "current", and one source says opting out of Deepgram's model-improvement program forfeits a 50 % discount built into list rates. Treat the Deepgram prices above as conditional on staying opted in. [secondary] — [convertaudiototext](https://convertaudiototext.com/blog/deepgram-nova-3-explained); [humla.team](https://humla.team/blog/deepgram-data-retention-policy)

**Free tiers and limits**
- ElevenLabs free plan: 4.5 h Scribe v2 and 2.5 h Scribe v2 Realtime per month; Starter 27 h / 15 h; Creator 100 h / 56 h. — [ElevenLabs API pricing](https://elevenlabs.io/pricing/api)
- Deepgram: $200 free credit on signup; concurrency 50 REST and 150 WebSocket on pay-as-you-go (225 WebSocket on Growth). — [Deepgram pricing](https://deepgram.com/pricing)
- AssemblyAI: $50 free credits; new streaming sessions limited to 5 per minute on free and 100 per minute on pay-as-you-go. — [AssemblyAI pricing](https://www.assemblyai.com/pricing)
- Speechmatics free tier: 3,000 min/month (1,200 real-time + 1,800 batch). [secondary] — [getpulsesignal](https://getpulsesignal.com/pricing/speechmatics)
- Azure Speech F0: 5 audio hours of real-time transcription free per month. — [Azure Speech pricing](https://azure.microsoft.com/en-us/pricing/details/speech/)
- Groq: file size 25 MB on free tier, 100 MB on dev tier. — [Groq docs](https://console.groq.com/docs/speech-to-text)
- OpenAI file endpoint: 25 MB per file; `gpt-4o-transcribe` reported to cap at 1400 s per call. — [OpenAI speech-to-text guide](https://developers.openai.com/api/docs/guides/speech-to-text); [zenn.dev](https://zenn.dev/daishiro/articles/whisper-hallucination-gpt4o-transcribe?locale=en)

**Regions**
- MAI-Transcribe-1 launched pointing at East US and West US only. Chirp 3 is in the `us` and `eu` multi-regions. — [MAI model card](https://microsoft.ai/pdf/MAI-Transcribe-1-Model-Card.pdf); [Chirp 3 docs](https://docs.cloud.google.com/speech-to-text/docs/models/chirp-3)
- Soniox documents regional deployment / data-residency options; AssemblyAI documents streaming endpoints and data zones. — [Soniox data residency](https://soniox.com/docs/data-residency); [AssemblyAI endpoints and data zones](https://www.assemblyai.com/docs/streaming/endpoints-and-data-zones)

**Data retention / privacy**
- ElevenLabs: `enable_logging=false` turns on zero-retention mode, enterprise only. — [ElevenLabs realtime API reference](https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime)
- OpenAI: `/v1/audio/transcriptions` is Zero Data Retention eligible, but ZDR is for approved enterprise customers via sales, not a self-serve toggle. [secondary summary of the primary page] — [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data)
- Deepgram: `mip_opt_out=true` on each request keeps audio and transcripts only for the duration of processing. — [Deepgram Model Improvement Program](https://developers.deepgram.com/docs/the-deepgram-model-improvement-partnership-program)
- AssemblyAI: if opted out of model training, streaming has zero retention of audio and transcripts (metadata kept for billing); controls are self-serve at no extra cost. — [AssemblyAI data retention](https://www.assemblyai.com/docs/data-retention-and-model-training); [AssemblyAI data controls](https://www.assemblyai.com/docs/data-controls)
- Soniox: no training on customer audio; audio / transcripts not stored unless a storage feature is used; async files auto-deleted after 30 days. — [Soniox security and privacy](https://soniox.com/docs/security-and-privacy)
- Mistral: Voxtral supports on-prem / private cloud deployment; a ZDR help article exists (not read). — [Mistral STT docs](https://docs.mistral.ai/capabilities/audio/speech_to_text/); [Mistral ZDR help](https://help.mistral.ai/en/articles/347612-can-i-activate-zero-data-retention-zdr)

### Inferences
- Cost is not a deciding factor at early scale. Example: 1,000 daily users × 3 minutes of speech = 50 h/day ≈ 1,500 h/month: about $60 on Groq turbo (if clips are ≥10 s), $180 on Soniox realtime, $225 on AssemblyAI multilingual streaming, $585 on Scribe v2 Realtime, $700 on Flux multilingual, $1,530 on `gpt-live-transcribe`. (Arithmetic on the list prices above.)
- Groq's 10 s minimum billing means a 3 s clip costs like a 10 s clip, roughly tripling the effective rate for short lines; still the cheapest listed.
- Streaming sessions are usually billed on connection / audio time. Opening a socket per exercise and closing it promptly avoids paying for idle silence; check each provider's billing unit before designing a long-lived socket.
- Learner voice recordings are personal data (and the app may have minors). Providers with self-serve no-retention (AssemblyAI streaming opt-out, Soniox default, Deepgram opt-out) are easier to ship with than those needing an enterprise contract.

### Gaps
- Could not read actual numbers from the Google Cloud STT or Azure Speech pricing pages (rendered client-side). Azure real-time / fast transcription and Chirp 3 streaming prices are unconfirmed.
- Amazon Transcribe pricing sources conflict; AWS's own page not read.
- Rate limits (requests per minute) for OpenAI, ElevenLabs STT concurrency by plan, Soniox, Groq per-model limits: not found.
- Soniox, Gladia and Speechmatics free-tier details not confirmed on primary pages.
- Mistral Voxtral Realtime API price not found.

## 6. React Native / Expo integration and on-device feasibility

### Takeaway
There is no turnkey Expo path for streaming mic audio to a cloud STT: you capture PCM with a native audio module in a development build and push it over a WebSocket (or WebRTC for OpenAI), using a short-lived token minted by your backend. On-device is feasible and free but uneven: iOS 26's SpeechTranscriber is strong but has no es-AR locale and needs a bridge, Android's recogniser varies by device, and bundled models (Whisper small, Parakeet v3, Moonshine Spanish) cost hundreds of MB.

### Cited Findings

**Cloud streaming from RN**
- RN has no built-in transport for streaming STT: the app must resample to 16 kHz mono, frame audio into millisecond chunks, handle VAD and socket reconnection itself. Audio capture options: `react-native-audio-api` (`AudioRecorder` delivering float32 frames) and `expo-audio` (`useAudioStream()` returning float32 or int16 buffers at a configurable sample rate); both need a development build. Older `react-native-live-audio-stream` and `react-native-audio-record` were last published in 2021 and 2019. — [Micdrop: Speech to Text in React Native, 2026](https://micdrop.dev/blog/speech-to-text-react-native)
- ElevenLabs realtime: WebSocket, base64 PCM chunks (`audio_base_64`), 8–48 kHz PCM (default `pcm_16000`), single-use `token` query parameter for client-side auth. — [ElevenLabs realtime API reference](https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime)
- OpenAI realtime transcription: WebSocket (intended for server-side pipelines) or WebRTC (client audio); audio sent as base64 PCM via `input_audio_buffer.append`, 24 kHz `audio/pcm`. — [OpenAI realtime transcription guide](https://developers.openai.com/api/docs/guides/realtime-transcription)
- Deepgram Flux: WebSocket on `/v2/listen`; accepts linear16, opus, ogg-opus, µ-law etc.; recommends 80 ms chunks at 16 kHz. — [Deepgram Flux quickstart](https://developers.deepgram.com/docs/flux/quickstart)
- AssemblyAI: WebSocket streaming with a temporary-token endpoint for clients. — [AssemblyAI streaming token API](https://www.assemblyai.com/docs/streaming/api-spec/generate-streaming-token)
- Soniox: temporary API keys supported for client connections. — [Soniox models](https://soniox.com/docs/stt/models)

**System recognisers**
- `expo-speech-recognition` wraps iOS `SFSpeechRecognizer` and Android `SpeechRecognizer`; needs a development build (not Expo Go); options include `interimResults`, `contextualStrings`, `requiresOnDeviceRecognition`, and `androidTriggerOfflineModelDownload()`; word confidence and timing on iOS 17+ and on Android 14+ with on-device recognition; continuous mode needs Android 13+; no mention of iOS 26 SpeechAnalyzer. Supported locales are device-dependent (`getSupportedLocales()`). — [expo-speech-recognition](https://github.com/jamsch/expo-speech-recognition)
- Offline with the system recogniser: iOS 17+, Android 13+ after the user downloads a language model. Platforms return different transcripts for the same audio. Android plays a hard-coded beep on recognition start / stop that needs workarounds. `@react-native-voice/voice` has been archived since May 2022 and points to `expo-speech-recognition`. — [Micdrop](https://micdrop.dev/blog/speech-to-text-react-native)
- Android: `createOnDeviceSpeechRecognizer()` throws `UnsupportedOperationException` if no on-device service exists; check `isOnDeviceRecognitionAvailable()`. — [Android SpeechRecognizer reference](https://developer.android.com/reference/android/speech/SpeechRecognizer)

**Apple SpeechAnalyzer / SpeechTranscriber (iOS 26)**
- New API in iOS 26 replacing `SFSpeechRecognizer`; fully on-device; models are system-managed downloads stored outside the app bundle (no app-size cost); modules include `SpeechTranscriber` and `SpeechDetector` (voice activity). — [addpipe: SpeechAnalyzer API](https://blog.addpipe.com/apple-speechanalyzer-api/); [Callstack](https://www.callstack.com/blog/on-device-speech-transcription-with-apple-speechanalyzer)
- From RN: `@react-native-ai/apple` exposes it through the AI SDK's `experimental_transcribe`, with `NativeAppleSpeech.prepare()` to pre-download assets; defaults to the device's primary language, ISO 639-1 codes selectable. The article covers file transcription; it does not show live partial results. — [Callstack](https://www.callstack.com/blog/on-device-speech-transcription-with-apple-speechanalyzer)
- Speed: 34-minute file in 45 s vs 1 min 41 s for Whisper large-v3 (2.2× faster). — [Callstack](https://www.callstack.com/blog/on-device-speech-transcription-with-apple-speechanalyzer)
- Accuracy, English LibriSpeech only (5,559 utterances, M2 Pro): SpeechAnalyzer 2.12 % clean / 4.56 % noisy; Whisper Small 3.74 / 7.95; Whisper Base 5.42 / 12.51; Whisper Tiny 7.88 / 17.04; legacy SFSpeechRecognizer 9.02 / 16.25. No Spanish, no accented speech, no sub-3 s utterances tested. — [Lyonesse benchmark](https://lyonesse.app/blog/apple-speech-api-benchmark.html)
- Spanish locales reported for `SpeechTranscriber.supportedLocales`: es_CL, es_ES, es_MX, es_US. [secondary] — [Anton Gubarenko](https://antongubarenko.substack.com/p/ios-26-speechanalyzer-guide)
- Another community package, `expo-speech-transcriber`, wraps Apple's Speech framework and Android SpeechRecognizer for on-device transcription. (Not evaluated.) — [expo-speech-transcriber](https://github.com/DaveyEke/expo-speech-transcriber)

**Bundled / downloaded models**
- `whisper.rn`: bindings to whisper.cpp plus NVIDIA Parakeet TDT 0.6B v3 (English + 24 European languages); Silero VAD; realtime transcriber with auto-slicing; Metal on iOS, Core ML encoder on iOS 15+, experimental Hexagon NPU on Snapdragon 8 Gen 1+; Expo needs prebuild. Parakeet sizes: q4_0 ~356 MB, q4_k ~416 MB, q8_0 ~669 MB, f16 ~1.26 GB. MIT licence. — [whisper.rn](https://github.com/mybigday/whisper.rn)
- `react-native-executorch` (`useSpeechToText`): Whisper tiny / base / small in English-only and multilingual variants, and Moonshine; sizes Tiny 151 MB, Base 290.6 MB, Small 968 MB; 375–410 MB RAM on iPhone 17 Pro / OnePlus 12; needs a dev build. A latency figure of 89 ms (iPhone 17 Pro) to 403 ms (iPhone SE 3) "for 30 seconds audio" is quoted but looks too low for full decoding and may be encoder-only; unverified. One search summary says the exported Whisper is English-only, which conflicts with the multilingual variants listed; unresolved. — [Micdrop](https://micdrop.dev/blog/speech-to-text-react-native); [react-native-executorch docs](https://docs.swmansion.com/react-native-executorch/docs/0.4.x/natural-language-processing/useSpeechToText)
- The RN packager refuses files above 2 GB, so Whisper large (2.9 GB) cannot be bundled; use quantised weights or a runtime download. — [Micdrop](https://micdrop.dev/blog/speech-to-text-react-native)
- Moonshine v2 (Feb 2026): Spanish streaming models exist (tiny, small, base; ONNX builds via sherpa-onnx); latency reported as low as ~50 ms on consumer hardware; MIT licence by default. [secondary] — [moonshine-v2 repo](https://github.com/moonshine-ai/moonshine-v2); [sherpa-onnx Moonshine](https://k2-fsa.github.io/sherpa/onnx/moonshine/index.html)
- Voxtral Realtime weights are open (Apache 2.0) but 4B parameters. — [Mistral STT docs](https://docs.mistral.ai/capabilities/audio/speech_to_text/)

### Inferences
- Lowest-effort cloud path for this app's "one short line" pattern: record with `expo-audio`, upload the finished clip to your own edge function, call a fast batch model (keeps the API key off the device, no socket code). Add streaming only where live partial text is part of the experience (Hablar with Pancho).
- For streaming, WebSocket + base64 PCM at 16 kHz works with ElevenLabs, Deepgram, AssemblyAI, Soniox and Speechmatics using the same client capture code; only the message envelope differs. OpenAI at 24 kHz and with WebRTC as the client-side route is the odd one out.
- All realistic on-device and streaming options require an Expo development build / prebuild; none work in Expo Go.
- On-device as the primary recogniser is weak for this product: results differ between iOS and Android for the same audio, es-AR is missing on iOS 26, Android quality depends on the installed Google speech service, and neither platform's Spanish accuracy is published. It is a reasonable offline fallback.
- Best on-device candidates for Spanish by published numbers: Parakeet TDT v3 via whisper.rn (≈3.5–3.7 % Spanish on the Open ASR multilingual track, 356 MB+ download) and Moonshine small Spanish (4.91 % FLEURS, streaming-capable, much smaller, but would need a custom native / ONNX integration). Whisper small multilingual is the fallback at 968 MB with the silence-hallucination caveat.
- Voxtral Realtime at 4B parameters is not a phone model in practice.

### Gaps
- WhisperKit: no React Native binding or Spanish data found in this pass.
- Android on-device Spanish: which Spanish language packs exist, their accuracy and behaviour offline were not found.
- Apple SpeechTranscriber: Apple's own doc page did not render, so live "volatile" partial results, per-word confidence attributes, and custom-vocabulary support are unconfirmed here; the es_AR omission rests on one secondary source.
- Whether `expo-speech-recognition` or `@react-native-ai/apple` supports live streaming through SpeechAnalyzer (rather than file transcription) is unconfirmed.
- No measured on-device latency for a 5–10 s Spanish clip on mid-range Android phones.
- No evidence gathered on RN WebRTC (`react-native-webrtc`) with OpenAI transcription sessions specifically.
