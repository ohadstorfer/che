# Big-cloud and OpenAI TTS for Spanish / Argentine Spanish (as of 2026-10-10)

Scope: Microsoft Azure Speech, Google Cloud TTS / Gemini TTS, Amazon Polly, OpenAI. Use cases: (1) low-latency sentence-by-sentence synthesis in live chat, (2) batch generation of thousands of isolated words and short sentences.

Reading note: "primary" = vendor docs fetched this session. "secondary" = blogs/aggregators, flagged. Anything marked UNVERIFIED was not confirmed against a primary source.

---

## Q1. Which providers have a genuine Argentine Spanish voice, how authentic is it, and can accent be steered by prompt?

### Takeaway
Azure is the only one of the four with catalogued, locale-trained es-AR voices in a classic deterministic engine (`es-AR-ElenaNeural`, `es-AR-TomasNeural`); Google's newest Gemini 3.8 TTS catalogue reportedly carries 53 voices tagged "Argentina Spanish", while Polly, Google Cloud TTS classic tiers, Chirp 3 HD and OpenAI have no Argentine voice. Prompt-based accent steering (OpenAI `instructions`, Gemini style prompts) is documented as a feature but independent reports describe it as inconsistent, and I found no rigorous native-speaker evaluation of any of these voices for sheísmo / s-aspiration / voseo intonation.

### Cited Findings

**Azure**
- es-AR has exactly two standard voices: `es-AR-ElenaNeural` (female) and `es-AR-TomasNeural` (male). No DragonHD variant, no multilingual variant, no speaking styles/roles for es-AR. — [Azure language support (TTS tab)](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)
- Spanish DragonHD voices exist only for es-ES (`es-ES-Ximena:DragonHDLatestNeural`, `es-ES-Tristan:DragonHDLatestNeural`) and es-MX (`es-MX-Ximena:…`, `es-MX-Tristan:…`) per the language table; the HD-voices page itself lists only the two es-ES ones. — [Azure language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts); [Azure HD voices](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/high-definition-voices)
- Spanish multilingual voices: es-ES Arabella/Isidora/Tristan/Ximena `MultilingualNeural`, es-MX Dalia/Jorge `MultilingualNeural`. None for es-AR. — [Azure language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)
- Multilingual voices can use `<lang xml:lang>` "to adjust the speaking accent of each language to set preferred accent such as British accent (`en-GB`) for English". Whether `es-AR` is an accepted/effective accent value was not confirmed. — [Azure SSML voice doc](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice)
- Dragon HD Omni is documented as "700+ voices", "Includes most of the previous voices", named by appending `:DragonHDOmniLatestNeural` to any voice (example given: `de-DE-Conrad:DragonHDOmniLatestNeural`). — [Azure HD voices](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/high-definition-voices); contradicted by a Microsoft external-staff moderator answer dated 2026-05-19: "DragonHDOmniLatestNeural voices are currently available only for a limited set of locales, primarily: en-US, selected zh-CN voices" (German had 0 Omni voices in eastus2/germanywestcentral/swedencentral) — [Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/5895454/azure-speech-voice-live-missing-dragonhdomnilatest)
- Authenticity claims for Elena are only from reseller marketing: described as handling voseo and having "Italian-influenced Argentinian intonation". Low-reliability source (a TTS reseller's landing page). — [SpeechGen es-AR page](https://speechgen.io/en/tts-spanish-argentina/)

**Google**
- Chirp 3 HD Spanish locales: only `es-ES` and `es-US`. No es-419, no es-AR. — [Chirp 3 HD docs](https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd)
- Gemini-TTS on Cloud TTS / Vertex lists Spanish as `es-ES`, `es-419` (Latin America), `es-MX`. No es-AR, no es-US. Models listed there: `gemini-3.1-flash-tts-preview`, `gemini-2.5-flash-tts`, `gemini-2.5-flash-lite-preview-tts`, `gemini-2.5-pro-tts`. — [Cloud Gemini-TTS docs](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts)
- Google documents accent steering: "Using natural language prompts, you can adapt the delivery within the conversation by steering it to adopt specific accents and produce a range of tones and expressions." — [Cloud Gemini-TTS docs](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts)
- Gemini API (ai.google.dev) now lists `gemini-3.8-flash-tts` ("over 130 languages") and `gemini-3.8-flash-lite-tts` ("over 100 languages"), with Voice design and Voice replication producing persistent `voice_…` IDs (1-year TTL, extended per use) or stateless `voicekey_…` keys (7-day TTL); max 200 custom voices per project. The language table lists just "Spanish" with no regional codes. — [Gemini API speech generation](https://ai.google.dev/gemini-api/docs/speech-generation)
- A developer's field notes on Gemini 3.8 TTS (GitHub issue in unicef/adt-studio): `GET /v1beta/voices` returns "1300 voices across 21 pages" with `accent`, `region_code`, `persona`, `gender`, `pitch` metadata; "53 voices carry `accent: 'Argentina Spanish'`"; language codes are "Honoured...but not validated (accepts `xx-YY`)". Single third-party source, not a Google doc. — [unicef/adt-studio #926](https://github.com/unicef/adt-studio/issues/926)
- Same project, earlier Gemini 2.5 TTS: prompted with "Habla en espanol rioplatense de Uruguay (Montevideo), no mexicano ni castellano peninsular"; reported voice identity changing (male/female) between sentences or runs, and "no stable alternative within the Gemini Developer API" for consistent voice. — [unicef/adt-studio #846](https://github.com/unicef/adt-studio/issues/846)
- Cloud TTS "Supported voices" page fetch returned only a truncated subset (es-ES and es-MX Standard), with no es-AR entries seen. — [Google supported voices](https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types)

**Amazon Polly**
- Spanish voices are es-ES (Conchita, Lucia, Alba, Enrique, Sergio, Raúl), es-MX (Mia, Andrés), es-US (Lupe, Penélope, Miguel, Pedro). No Argentine voice in the full voice table. — [Polly available voices](https://docs.aws.amazon.com/polly/latest/dg/available-voices.html)
- Generative Spanish voices: es-MX Andrés/Mía, es-ES Lucia/Sergio, es-US Lupe/Pedro. Long-form Spanish: es-ES Alba and Raúl only. — [Polly generative voices](https://docs.aws.amazon.com/polly/latest/dg/generative-voices.html); [Polly available voices](https://docs.aws.amazon.com/polly/latest/dg/available-voices.html)

**OpenAI**
- No locale-specific voices: 13 built-in voices (alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer, verse, marin, cedar), "voices being optimized for English"; "For best quality, we recommend using `marin` or `cedar`." — [OpenAI TTS guide](https://developers.openai.com/api/docs/guides/text-to-speech)
- `instructions` can steer "Accent, Emotional range, Intonation, Impressions, Speed of speech, Tone, Whispering" (gpt-4o-mini-tts only; not tts-1/tts-1-hd). — [OpenAI TTS guide](https://developers.openai.com/api/docs/guides/text-to-speech)
- Community reports that instruction-following is unreliable: a forum thread states the model after an update "doesn't follow TTS instructions most of the time", and advice that "Accents can be tricky with TTS models". Search-snippet level; thread not read in full. — [OpenAI community: voice instruction](https://community.openai.com/t/voice-instruction-with-gpt-4o-mini-tts/1372075); [OpenAI community: speed and unnatural voice](https://community.openai.com/t/gpt-4o-mini-tts-speed-and-unnatural-voice/1371831)
- Secondary blog claim: "some non-English languages or uncommon accents may retain hints of the model's default characteristics." — [PromptLayer blog](https://blog.promptlayer.com/gpt-4o-mini-tts-steerable-low-cost-speech-via-simple-apis/)

### Inferences
- For a guaranteed, repeatable rioplatense accent from a big cloud, Azure `es-AR-ElenaNeural`/`TomasNeural` are the only catalogued option that is both locale-trained and a classic (non-LLM) engine. They are the older "Neural" tier, so expect less expressive prosody than HD/LLM voices.
- Gemini 3.8 TTS is the most promising big-cloud route to a modern-sounding Argentine voice (tagged voices rather than prompt-only steering), but the evidence is one developer's notes plus Google's generic "100+ languages and dialects" claim. It launched very recently (reported 2026-09-23 by a secondary source, [shattered.io](https://shattered.io/gemini-3-8-flash-tts-voice-design-2026/), UNVERIFIED against Google's own announcement).
- With OpenAI and older Gemini models, an Argentine accent exists only as a prompt-level request, which means it can drift per request. That is a real risk for a learning app where the accent is the product.
- Polly is effectively out for Argentine content: nearest is es-US/es-MX.

### Gaps
- No independent, native-speaker evaluation found for any engine's sheísmo ("ll/y" as [ʃ]/[ʒ]), s-aspiration, or voseo stress (e.g. "tenés", "querés"). All authenticity statements found are marketing copy. This needs an in-house listening test.
- Could not confirm whether `es-AR-Elena:DragonHDOmniLatestNeural` actually resolves in the API today. Docs imply yes; Microsoft Q&A (May 2026) implies no. Test with the voices list endpoint.
- Could not confirm whether Azure multilingual voices accept `<lang xml:lang="es-AR">` and produce a rioplatense accent.
- The Gemini 3.8 "Argentina Spanish" voice count comes from one GitHub issue; Google's own voice catalogue page was not located.
- No source found on OpenAI Realtime API (`gpt-realtime-2.x`) accent behaviour in Spanish.

---

## Q2. Pronunciation accuracy and determinism: LLM-based engines vs classic neural engines; isolated single words

### Takeaway
LLM/token-based engines (gpt-4o-mini-tts, Gemini TTS, Polly Generative, Azure Dragon HD) are documented or reported to vary between runs and occasionally deviate from the text, with vendors themselves warning about it (AWS explicitly, Azure via "slight variations in each output"). Classic neural engines (Azure Neural, Polly Neural, Google Neural2/WaveNet) use a text-analyzer to phoneme pipeline and are the safe choice for dictionary-style word audio.

### Cited Findings
- Azure describes its classic/custom neural pipeline as text analyzer → phoneme sequence → neural acoustic model → vocoder, i.e. pronunciation is fixed by a front end rather than sampled. — [Azure custom voice overview](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/custom-neural-voice)
- Azure HD voices: "introduce slight variations in each output to enhance realism"; a `temperature` parameter (0–1, default 1.0 for DragonHD; Omni default 0.7, range 0.3–1.0, plus `top_p`, `top_k`, `cfg_scale`) controls randomness; "Less randomness yields more stable results". — [Azure HD voices](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/high-definition-voices)
- Azure HD `enhancePronunciation=true` parameter exists for proper nouns/acronyms/ambiguous words, but Microsoft says "Results might vary depending on language, voice, and input text. For deterministic pronunciation control, SSML pronunciation elements remain the recommended approach." — [Azure HD voices](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/high-definition-voices)
- Polly Generative is "a billion-parameter transformer that converts raw text into speech codes". AWS warns: "In the unlikely event of model hallucination… an imposed emergency stop mechanism is in place… the model has the potential to hallucinate, usually at the end of the sentence"; it "might end up cutting a word during a generation step, thus rendering half the word"; "This safety feature reduces but does not eliminate the risk… Do not assume complete protection against hallucinated speech output." — [Polly generative voices](https://docs.aws.amazon.com/polly/latest/dg/generative-voices.html)
- Polly Generative voices can also change over time: "any updates to the training data and the model could result in slight variations to the way the voices sound". — [Polly generative voices](https://docs.aws.amazon.com/polly/latest/dg/generative-voices.html)
- gpt-4o-mini-tts user reports (Mar–Apr 2025, English text, original snapshot): "inconsistent loudness within a single narration", "unexpected, prolonged silences lasting 10–60 seconds, usually towards the end", "portions of previously narrated text frequently repeat unexpectedly", final sentences skipped. Reported as "more prevalent with large text input. Smaller text input reduces the issues." No OpenAI staff reply in thread. — [OpenAI community thread](https://community.openai.com/t/gpt-4o-mini-tts-issues-volume-fluctuations-silence-repetition-distortion/1150897)
- A newer default snapshot exists: `gpt-4o-mini-tts-2025-12-15` (previous: `gpt-4o-mini-tts-2025-03-20`); max input 2,000 tokens. — [OpenAI model page](https://developers.openai.com/api/docs/models/gpt-4o-mini-tts)
- Secondary claim of "a 10 percent hallucination rate where the spoken output deviates from the input text" in "independent testing in early 2026". Surfaced via search summary only; original test not located. UNVERIFIED. — [PromptLayer blog](https://blog.promptlayer.com/gpt-4o-mini-tts-steerable-low-cost-speech-via-simple-apis/)
- Gemini 2.5 TTS: with `temperature` 0.0 or 0.4 and fixed seed "every call fails—4 out of 4" ("Gemini TTS response did not include audio data"); generation succeeds only "From `1.0` upward"; failed attempts still consume tokens. — [unicef/adt-studio #846](https://github.com/unicef/adt-studio/issues/846)
- Gemini 3.8 TTS (same developer): at temperature 1.0 with seed 42, "bit-identical audio on 2 of 3 test lines"; still intermittent "`finish_reason=OTHER`, no audio" requiring retries; silent truncation observed ("2500 chars → 76 s when ~160 s was expected"). — [unicef/adt-studio #926](https://github.com/unicef/adt-studio/issues/926)
- Gemini-TTS documented hard limits: text ≤ 4,000 bytes, prompt ≤ 4,000 bytes, output ~655 s, beyond which "the audio is truncated". — [Cloud Gemini-TTS docs](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts)
- Chirp 3 HD: developer reports of "a second or so of very garbled audio" occasionally when using pause markup, and of a `<phoneme>` tag's inner text being spoken instead of its `ph` attribute. Search-snippet level. — [Google developer forum](https://discuss.google.dev/t/chirp-3-voices-output-garbled-words-on-markup/245346); [GitHub PR notes](https://github.com/Slimmmmy/espanol-benidorm/pull/3)

### Inferences
- For batch generation of thousands of isolated words, classic engines are the lower-risk default: same input gives the same audio, there is a phoneme/lexicon escape hatch, and no sampling. LLM-based engines need an automatic verification pass (ASR round-trip or duration sanity check) plus retries, which the unicef project ended up doing with Whisper.
- Very short inputs (single words) are the weakest case for LLM-based TTS: little context to anchor language and accent, so language misidentification and odd prosody are plausible. This is reasoned from architecture, not from a cited test.
- The long-input failure mode of gpt-4o-mini-tts matters less here, since both app use cases are short sentences.

### Gaps
- No published word-error-rate or substitution-rate figures specific to Spanish for any of these engines.
- No evidence either way on whether the Dec-2025 gpt-4o-mini-tts snapshot fixed the 2025 repetition/silence issues.
- No documented hallucination statement from Google for Chirp 3 HD.
- No systematic test of single-word quality found for any engine; needs an in-house test on a sample (e.g. 200 words incl. "lluvia", "yo", "calle", "vos tenés", "más o menos").

---

## Q3. SSML support per engine

### Takeaway
Full SSML (prosody, break, phoneme, lexicon, lang, bookmark, viseme) is only on the classic tiers; every newer LLM-style tier drops part of it, most importantly `<prosody>` on Azure HD and all SSML on OpenAI.

### Cited Findings

**Azure**
- Non-HD neural voices support "the full set of SSML"; HD voices support "a subset of SSML elements". — [Azure HD voices](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/high-definition-voices)
- DragonHD: supports `<voice>`, `<lang>`, `<phoneme>`, `<lexicon>` ("only supports alias"), `<say-as>`, `<sub>`, `<break>`, `<p>`, `<s>`. Does NOT support `<prosody>` (pitch/contour/range/rate/volume), `<emphasis>`, `<mstts:express-as>`, `<bookmark>`, `<mstts:silence>`, `<mstts:viseme>`, `<mstts:audioduration>`, `<audio>`. — [Azure HD voices](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/high-definition-voices)
- Dragon HD Omni: adds `<mstts:express-as>` and word boundary events, but drops `<phoneme>` and `<break>`; `<prosody>` still unsupported; `<lexicon>` alias-only. — [Azure HD voices](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/high-definition-voices)
- HD style tags (e.g. `[excited]`, `slow`, `fast`) — "Styles are available on all English content for all voices"; i.e. not documented for Spanish text. — [Azure HD voices](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/high-definition-voices)
- Phonetic alphabets: es-ES supports `sapi` and `ipa`; es-MX has IPA tables only; es-AR has no dedicated section in the phonetic-sets page. es-ES SAPI set lacks `β`, `ð`, `ɣ`. — [Azure SSML phonetic sets](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-ssml-phonetic-sets)
- es-AR voices have no speaking styles or roles. — [Azure language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)

**Google**
- Chirp 3 HD: docs say SSML tags `<speak>`, `<say-as>`, `<p>`, `<s>`, `<phoneme>`, `<sub>`, `<break>`, `<audio>`, `<prosody>`, `<voice>` are supported "for synchronous requests", but "SSML tags are not currently supported for streaming requests." Also has its own pace parameter, pause control and custom pronunciations (available for es-ES and es-US). — [Chirp 3 HD docs](https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd); contradicted by the voice-types overview, which still says Chirp 3 HD "doesn't support SSML input, speaking rate and pitch-audio parameters" — [Google voice types](https://docs.cloud.google.com/text-to-speech/docs/voice-types). The Chirp 3 HD page is the more specific and likely newer one.
- Studio voices "support SSML, except for the following tags: `<mark>`, `<emphasis>`, `<prosody pitch>`, and `<lang>`". Neural2, WaveNet, Standard support SSML. — [Google voice types](https://docs.cloud.google.com/text-to-speech/docs/voice-types)
- Gemini-TTS: no SSML mentioned; control is via natural-language prompt plus inline markup tags (preview) such as `[sigh]`, `[laughing]`, `[whispering]`, `[extremely fast]`, and pause tags. Gemini 3.8 uses `speech_metadata.style` for sustained delivery attributes. — [Cloud Gemini-TTS docs](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts); [Gemini API speech generation](https://ai.google.dev/gemini-api/docs/speech-generation)

**Amazon Polly** (per-engine table)
- `<break>`, `<lang>`, `<p>`, `<s>`, `<sub>`, `<w>`: full on Neural, Long-form, Generative.
- `<phoneme>`: full on Neural and Long-form, partial on Generative. `<mark>`: full on Neural/Long-form, partial on Generative.
- `<prosody>`: partial on all three. `<emphasis>`, `amazon:max-duration`, auto-breaths, whisper, soft phonation, vocal-tract-length: not available on any non-Standard engine.
- Newscaster style: select neural voices only. "If you use unsupported SSML tags in standard, neural, or long-form format, you will get an error."
- All from — [Polly supported SSML tags](https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html)

**OpenAI**
- No SSML mentioned anywhere in the TTS guide; control is the `instructions` free-text field (gpt-4o-mini-tts). — [OpenAI TTS guide](https://developers.openai.com/api/docs/guides/text-to-speech)

### Inferences
- If the app needs phoneme-level fixes (e.g. forcing [ʃ] in a word, or fixing a mispronounced slang term), viable engines are Azure Neural (full SSML + lexicon), Azure DragonHD (phoneme yes), Polly Neural, Google Neural2/WaveNet, and Chirp 3 HD custom pronunciations (but only for es-ES/es-US voices). OpenAI and Gemini offer only respelling the text.
- Because the es-AR phone set is undocumented on Azure's phonetic-sets page, IPA is the safe alphabet to try for es-AR voices; behaviour needs testing.

### Gaps
- Whether IPA `<phoneme>` works reliably with `es-AR-ElenaNeural` and which symbols are accepted: not documented.
- Details of Polly's "partial availability" for `<prosody>` on Neural/Generative (historically: rate and volume yes, pitch no) were not re-verified this session.
- Google's general SSML page did not give a per-voice-type matrix; timepoint (`<mark>`) support per tier beyond Studio's exclusion is unconfirmed.

---

## Q4. Speed control and quality of slow speech (rate 0.7–0.8)

### Takeaway
All four vendors expose some rate control, but on the newest tiers it is either absent (Azure HD has no `<prosody>`) or prompt-based and non-numeric (OpenAI, Gemini); I found no source that evaluates slow-speech audio quality or says whether rate is model-level or time-stretching.

### Cited Findings
- Azure classic neural: `<prosody rate>` "should be within `0.5` to `2` times the original audio"; accepts multiplier, percentage, or named values (`x-slow` = 0.5, `slow` = 0.64, `medium` = 1). Can be applied "at the word or sentence level". — [Azure SSML voice doc](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice)
- Azure DragonHD / Omni: `<prosody>` not supported. Omni's only speed lever is `cfg_scale` (1.0–2.0; lower = "Slower speech with less contextual alignment") plus `slow`/`fast` style tags, which are documented for English content. — [Azure HD voices](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/high-definition-voices)
- Chirp 3 HD: "The pace parameter lets you slow down or speed up the speech, with values ranging from 0.25x (very slow) to 2x (very fast)." — [Chirp 3 HD docs](https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd)
- Gemini TTS: pace via prompt/style (e.g. `"speaking rapidly"`, `[extremely fast]` tag). No numeric rate. — [Gemini API speech generation](https://ai.google.dev/gemini-api/docs/speech-generation); [Cloud Gemini-TTS docs](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts)
- OpenAI: "Speed of speech" is listed as something `instructions` can control; the current TTS guide does not document a numeric `speed` parameter. — [OpenAI TTS guide](https://developers.openai.com/api/docs/guides/text-to-speech)
- A community thread titled "Gpt-4o-mini-tts speed and unnatural voice" exists, indicating speed control complaints; content not read in full. — [OpenAI community](https://community.openai.com/t/gpt-4o-mini-tts-speed-and-unnatural-voice/1371831)
- Polly: `<prosody>` (volume, rate, pitch) is "Partial availability" on Neural, Long-form and Generative. — [Polly supported SSML tags](https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html)

### Inferences
- A reliable numeric slow mode (e.g. 0.75x for learners) is available on Azure Neural (incl. es-AR voices), Chirp 3 HD (`pace`), Polly Neural, and Google Neural2. On OpenAI and Gemini it is best-effort prompting, so the "slow" button would not be repeatable.
- Fallback for engines without rate control: generate at normal speed and time-stretch client-side (pitch-preserving playback rate), accepting artifacts. For a learning app, a model-level rate on a classic engine is likely cleaner; this is untested here.

### Gaps
- No source states whether Azure/Google/Polly implement rate at the acoustic-model (duration predictor) level or as post-hoc time-stretch, nor any listening comparison at 0.7–0.8x. Needs an in-house A/B.
- Whether the legacy OpenAI numeric `speed` (0.25–4.0) parameter still applies to tts-1/tts-1-hd and is ignored by gpt-4o-mini-tts: not confirmed from current docs.
- Google `speakingRate` range for Neural2/WaveNet not confirmed this session.

---

## Q5. Latency, streaming APIs, word-level timestamps / visemes / speech marks

### Takeaway
Classic neural voices are the fastest (roughly 100 ms to first audio in one independent phonebot benchmark), HD/LLM voices are several times slower, and word timing data is available on Azure (Neural and Omni) and Polly non-generative engines but not on Polly Generative, Azure DragonHD, or OpenAI.

### Cited Findings
- Microsoft's own table: latency "Less than 300 ms" for both Azure Speech HD voices and non-HD voices; "Greater than 500 ms" for Azure OpenAI HD voices. HD voices are "Real-time only" (no batch synthesis API); non-HD support real-time and batch, and can be deployed in containers/embedded. — [Azure HD voices](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/high-definition-voices)
- Independent benchmark (BotFriends, 2025-04-25, German voices, 3 runs averaged, ms; short / long / multiple messages): Azure Neural 104.71 / 135.52 / 113.13; Azure MultilingualNeural 120.00 / 153.34 / 163.00; Azure DragonHDLatestNeural 356.00 / 403.84 / 342.61; Google Neural 101.17 / 133.50 / 82.67; Google WaveNet 324.04 / 951.12 / 210.37; Google Chirp 614.12 / 3436.52 / 525.82. Conclusion: "The neural voices of both providers outperform premium 'HD' models such as Chirp and DragonHD in terms of speed." Old (18 months) and German-only. — [BotFriends TTS latency report](https://botfriends.de/en/blog/tts-latency-benchmark-2025-google-vs-microsoft-voices-fuer-phonebots/)
- Secondary 2026 round-ups give inconsistent time-to-first-audio figures: gpt-4o-mini-tts ~200 ms, ~300–600 ms, or 4,752 ms depending on source; Chirp 3 HD ~200 ms, 250–400 ms, or 886 ms. From search summaries of several blogs; treat as unreliable. — [futureagi.com](https://futureagi.com/blog/best-text-to-speech-providers-2026/); [tomodahinata.com](https://tomodahinata.com/en/blog/qwen-tts-vs-elevenlabs-openai-google-azure-tts-comparison); [yixscout.com](https://yixscout.com/resources/columns/low-latency-tts-api)
- Artificial Analysis: Polly Standard is the fastest model it tracks at "1,369.5 characters per second"; top quality is a non-big-cloud model (Eleven v4 Turbo, Quality Elo 1327). Its pronunciation-robustness methodology is English. Rankings for the four vendors' models were not retrievable. — [Artificial Analysis TTS](https://artificialanalysis.ai/text-to-speech)
- Streaming: Chirp 3 HD supports `streaming_synthesize` (text streaming in, audio out), but without SSML. — [Chirp 3 HD docs](https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd)
- Streaming: Gemini-TTS supports multi-request/multi-response streaming on Cloud TTS and unidirectional streaming on Vertex; Gemini API streaming returns raw 16-bit PCM, 24 kHz mono. — [Cloud Gemini-TTS docs](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts); [Gemini API speech generation](https://ai.google.dev/gemini-api/docs/speech-generation)
- Streaming: OpenAI Speech API supports "realtime audio streaming using chunk transfer encoding"; "we recommend using `wav` or `pcm` as the response format" for lowest latency. — [OpenAI TTS guide](https://developers.openai.com/api/docs/guides/text-to-speech)
- Streaming: Polly Generative has a Bidirectional Streaming API (`StartSpeechSynthesisStream`) in selected regions; note London, Canada Central and Zurich do not carry the Spanish generative voices. — [Polly generative voices](https://docs.aws.amazon.com/polly/latest/dg/generative-voices.html)
- Word timing, Azure: Dragon HD Omni "supports word boundary events" (Text, AudioOffset, TextOffset). DragonHD does not support `<bookmark>` or `<mstts:viseme>`. Classic neural has the full SSML set incl. bookmark and viseme elements. — [Azure HD voices](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/high-definition-voices)
- Word timing, Polly: for Generative, "Support for generating speech marks is currently not available." Speech-marks requests on other engines are billed per character like synthesis. — [Polly generative voices](https://docs.aws.amazon.com/polly/latest/dg/generative-voices.html); [Polly pricing](https://aws.amazon.com/polly/pricing/)
- Word timing, Google: Studio voices do not support `<mark>` (so no timepoints). — [Google voice types](https://docs.cloud.google.com/text-to-speech/docs/voice-types)
- Word timing, OpenAI: nothing about timestamps in the TTS guide. — [OpenAI TTS guide](https://developers.openai.com/api/docs/guides/text-to-speech)

### Inferences
- For the live chat use case, Azure Neural es-AR voices combine the lowest latency class with word boundary events (useful for karaoke-style highlighting) and a real Argentine voice. HD/LLM tiers add roughly 200–500 ms or more.
- For batch use case, Azure HD's "real-time only" restriction just means looping over the real-time API; not a blocker for short items but rate limits apply.
- Word-level highlighting with OpenAI or Gemini audio would need a forced-alignment/ASR pass afterwards.

### Gaps
- No current (2026), independent, like-for-like time-to-first-byte measurement across all four vendors; Coval's benchmark page did not render data. Measure from the app's actual region (Supabase edge location) before deciding.
- No latency data for Gemini 3.8 Flash / Flash-Lite TTS or for the Dec-2025 gpt-4o-mini-tts snapshot.
- Whether Chirp 3 HD or Gemini TTS return any word timings: not documented in the pages read.
- Whether word boundary events are confirmed specifically for `es-AR-ElenaNeural` (expected yes for all classic neural voices, not explicitly verified).

---

## Q6. Pricing per 1M characters and free tiers

### Takeaway
Classic neural tiers cluster at $15–16 per 1M characters across Azure, Google and Polly; premium tiers run $22–30 (Polly Long-form $100); token-priced LLM TTS (gpt-4o-mini-tts, Gemini 3.8) works out roughly comparable or cheaper per character, with Gemini offering a 50% batch discount and a free tier.

### Cited Findings

**Azure** (official pricing page returned placeholders, so numbers below are secondary)
- Free tier F0: "0.5 million characters free per month" for neural. Price rows exist for Neural / Neural HD Flash, Neural HD, "MAI-Voice", custom voice synthesis, training, endpoint hosting, personal voice; values rendered as "$-". — [Azure Speech pricing](https://azure.microsoft.com/en-us/pricing/details/speech/)
- Secondary (article dated 2026-09-01, not directly citing Microsoft): prebuilt Neural "$16 per million characters"; Neural HD "$22/1M characters (dropped from $30 in March 2026)"; Custom Neural "$24/1M standard, $48/1M HD"; training "$52 per compute hour, capped at $936 per training session"; endpoint hosting "$4.04 per model per hour"; commitment tiers bringing effective rates to $12.00 / $9.60 / $7.50 per 1M. UNVERIFIED against Microsoft. Another aggregator says Neural is $15/1M. — [texttolab.com](https://texttolab.com/blog/azure-text-to-speech-pricing)

**Google Cloud TTS** (official page truncated on fetch; numbers below are from aggregator search summary)
- Standard $4/1M; WaveNet and Neural2 $16/1M; Studio $30/1M; Chirp 3 HD $30/1M. Free monthly: 4M chars Standard/WaveNet-class, 1M chars for premium tiers (sources disagree on which bucket WaveNet falls in). UNVERIFIED against Google. — [costbench.com](https://costbench.com/software/ai-voice-tools/google-cloud-text-to-speech/); official page: [Google TTS pricing](https://cloud.google.com/text-to-speech/pricing)

**Gemini TTS (Gemini API, primary)**
- `gemini-3.8-flash-tts`: input "$0.50 (text) through December 31, 2026. $1.00 (text) starting January 1, 2027"; output "$9.00 (audio) through December 31, 2026. $18.00 (audio) starting January 1, 2027" per 1M tokens. Free tier available. Batch 50% off.
- `gemini-3.8-flash-lite-tts`: input $0.50 → $1.00; output $6.00 → $12.00 (same dates). Free tier available. Batch 50% off.
- `gemini-3.1-flash-tts-preview`: $1.00 in / $20.00 out; no free tier. `gemini-2.5-flash-preview-tts`: $0.50 / $10.00; free tier. `gemini-2.5-pro-preview-tts`: $1.00 / $20.00; no free tier.
- Audio is "25 tokens per second of audio".
- All from — [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)

**Amazon Polly (primary)**
- Standard $4.00, Neural $16.00, Long-Form $100.00, Generative $30.00 per 1M characters.
- Free tier: Standard 5M chars/month; Neural 1M chars/month (first 12 months); Long-Form 500K (first 12 months); Generative 100K (first 12 months).
- Speech marks are billed by characters at the same rate as synthesis.
- All from — [Polly pricing](https://aws.amazon.com/polly/pricing/)

**OpenAI (primary)**
- `gpt-4o-mini-tts`: $0.60 per 1M text input tokens, $12.00 per 1M audio output tokens. `tts-1`: $15.00 / 1M characters. `tts-1-hd`: $30.00 / 1M characters.
- Realtime/audio models (per 1M audio tokens, in/out): `gpt-realtime-2.1` $32/$64; `gpt-realtime-2.1-mini` $10/$20; `gpt-realtime-2` $32/$64; `gpt-realtime-1.5` $32/$64; `gpt-realtime-mini` $10/$20; `gpt-audio` $32/$64; `gpt-audio-mini` $10/$20; `gpt-audio-1.5` $32/$64.
- No free tier mentioned.
- All from — [OpenAI pricing](https://developers.openai.com/api/docs/pricing)
- The TTS guide still lists only three speech-endpoint models: `gpt-4o-mini-tts` (newest), `tts-1`, `tts-1-hd`. — [OpenAI TTS guide](https://developers.openai.com/api/docs/guides/text-to-speech)

### Inferences
- Gemini 3.8 per-character estimate (my arithmetic, assuming ~15 characters per second of Spanish speech, so 1M chars ≈ 66,700 s ≈ 1.67M audio tokens): Flash ≈ $15/1M chars now, ≈ $30 from 2027-01-01; Flash-Lite ≈ $10 now, ≈ $20 from 2027; batch halves these. Isolated words carry proportionally more silence, so real cost per character will be higher. The scheduled doubling on 2027-01-01 matters for budgeting.
- gpt-4o-mini-tts per-character cost depends on OpenAI's audio tokens-per-second, which I did not confirm this session; OpenAI has historically quoted about $0.015 per minute, which would be roughly $15–17 per 1M characters. Treat as approximate.
- Scale check: a course of, say, 20,000 items averaging 30 characters is 600K characters, i.e. about $10 on a $16/1M tier and within or near the monthly free tier of Azure (500K) or Google. Batch cost is negligible on every vendor; the choice should be driven by accent and accuracy, not price.
- Live chat cost scales with usage: 1M characters is roughly 18–20 hours of speech, about $16 on classic tiers.

### Gaps
- Official Azure numbers (Neural, HD, Omni, HD Flash, MAI-Voice, personal voice) could not be read from the pricing page; the $16 vs $15 and the March-2026 HD cut to $22 are from secondary sources.
- Official Google Cloud TTS table (incl. Instant Custom Voice and Cloud-side Gemini-TTS rates) could not be read.
- OpenAI audio tokens-per-minute for gpt-4o-mini-tts not confirmed.

---

## Q7. Custom voice options and requirements

### Takeaway
All vendors gate custom voices behind sales/eligibility approval and a recorded consent statement from the speaker; none is self-serve for a small app, with Gemini 3.8's voice design/replication being the lightest-weight path documented.

### Cited Findings
- Azure: "Custom voice access is limited based on eligibility and usage criteria. Request access on the intake form." Professional voice requires "a recording of the voice talent's consent statement" before fine-tuning, studio-quality training data, training, then deployment to a custom endpoint. — [Azure custom voice overview](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/custom-neural-voice)
- Azure personal voice: pricing page lists synthesis per 1M characters, "Voice creation: Free", and storage per 1,000 voice profiles per month. HD voices do not support `<mstts:ttsembedding>` (personal voice speaker profile). — [Azure Speech pricing](https://azure.microsoft.com/en-us/pricing/details/speech/); [Azure HD voices](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/high-definition-voices)
- Azure custom costs (secondary, UNVERIFIED): synthesis $24/1M (standard) or $48/1M (HD), training $52/compute hour capped at $936, endpoint hosting $4.04 per model-hour (about $2,909/month if always on). — [texttolab.com](https://texttolab.com/blog/azure-text-to-speech-pricing)
- Google Chirp 3 Instant Custom Voice: "Access to Instant Custom Voice is restricted to allow-listed users. To request access, contact a member of the sales team." Must use Google's provided consent statement in your language. Reference audio "as close to 10 seconds as possible", single channel. Spanish locales supported: `es-US`, `es-ES` only. en-US keys can also synthesize in es-US and es-ES. Supports streaming, pace control, pause tags, custom pronunciations. Limit: 10 voice cloning keys per minute per project. — [Chirp 3 Instant Custom Voice](https://docs.cloud.google.com/text-to-speech/docs/chirp3-instant-custom-voice)
- Gemini 3.8 TTS: Voice design (describe a voice in natural language) and Voice replication, returning `voice_…` IDs (1-year TTL, extended per use) or `voicekey_…` (7-day TTL); max 200 custom voices per project. — [Gemini API speech generation](https://ai.google.dev/gemini-api/docs/speech-generation)
- OpenAI: "Custom voices are limited to eligible customers. Contact our sales team to learn more." Consent recording must read one exact provided phrase ("Any divergence from the script will lead to a failure"); consent phrases exist in 16 languages incl. Spanish; "The audio samples must be 30 seconds or less"; "At most 20 voices can be created per organization." Usable with the TTS API, Realtime API and Chat Completions audio. — [OpenAI custom voices guide](https://developers.openai.com/api/docs/guides/custom-voices)
- OpenAI usage policy requires "a clear disclosure to end users that the TTS voice they are hearing is AI-generated and not a human voice." — [OpenAI TTS guide](https://developers.openai.com/api/docs/guides/text-to-speech)
- Amazon Polly: Brand Voice is a custom engagement with AWS ("build a custom voice for your brand persona"); no self-serve cloning. — [Polly available voices](https://docs.aws.amazon.com/polly/latest/dg/available-voices.html)

### Inferences
- A custom Argentine voice cloned from a real porteño speaker is technically possible on Azure (professional voice), OpenAI and Gemini 3.8, but Azure and OpenAI require approval, and Azure's always-on endpoint hosting cost is far out of proportion for a small app.
- Google Instant Custom Voice would produce a cloned timbre speaking with an es-US/es-ES model, so it is unlikely to preserve rioplatense phonology. Reasoned from the locale list, not tested.
- Voice cloning's accent fidelity generally comes from the reference speaker plus the base model's knowledge of the dialect; whether an OpenAI or Gemini clone of an Argentine speaker keeps sheísmo and s-aspiration is untested.

### Gaps
- Whether Gemini 3.8 voice replication is gated, and its consent rules: not found in the page read.
- Azure professional voice minimum data size and whether es-AR is a supported custom-voice training locale: not confirmed.
- Whether Azure personal voice can output es-AR-accented speech: not confirmed.

---

## Cross-cutting summary for the two use cases (inferences only)

- Live chat, sentence-by-sentence: Azure `es-AR-ElenaNeural` / `es-AR-TomasNeural` are the only big-cloud voices that are simultaneously catalogued Argentine, deterministic, low-latency class (~100–150 ms in the one independent benchmark of Azure Neural), full SSML with numeric rate 0.5–2x, and word boundary events. Their weakness is being the older, less expressive tier with no styles.
- Batch words and short sentences: same Azure voices are the safest for exact reading; Gemini 3.8 Flash(-Lite) TTS with an "Argentina Spanish"-tagged voice is the candidate for more natural-sounding output, at the cost of needing automatic verification, retries, and tolerance for a very new model whose price doubles on 2027-01-01.
- OpenAI gpt-4o-mini-tts: no Argentine voice, accent only by prompt, no SSML, no timestamps; weakest fit for accent-critical content.
- Polly: no Argentine voice; not a fit.
- Everything about accent authenticity needs a native-ear listening test; no credible published evaluation exists.
