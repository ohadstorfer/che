# How leading language-learning apps capture and transcribe learner speech, and the UX around it (as of October 2026)

Reliability key used below: **[primary]** = company/vendor's own page; **[press]** = news outlet; **[review]** = third-party reviewer or blog; **[competitor]** = review written by a rival app (LanguaTalk reviews Speak/Pingo/Talkpal/Jumpspeak; treat as biased); **[snippet]** = taken from a search-result summary, page not opened in full. Dates are the source's publication date.

## 1. ASR vendor / technology per app, and why some built in-house learner-speech models

### Takeaway
The three apps with the most speech history (Speak, ELSA, Duolingo) plus Babbel and Rosetta Stone say they run their own speech models trained on learner or accented speech, because general ASR is weak on beginner non-native speech; the newer "AI tutor" apps (Praktika, most chat-style apps) run Whisper-family models, sometimes on specialist hosts for speed. For most apps (Pimsleur, Busuu, Memrise, Loora, Talkpal, Jumpspeak, Pingo, Univerbal, Lingopie, Langua) the ASR vendor is simply not published.

### Cited Findings

**Speak**
- Speak built an in-house streaming ASR: a Conformer-CTC model trained with Nvidia NeMo on a "proprietary dataset composed of many thousands of hours of heavily-accented English speech across many native languages from our learners around the globe". Result: >60% WER reduction vs the pre-trained model and 45% better than its previous on-device model. Served with Nvidia Riva + Triton on Kubernetes (GCP), WebSockets client-to-server, gRPC inside. (10 Jun 2024) [primary] — [Speak: Leveling up our core speech recognition](https://www.speak.com/blog/asr-levelup)
- Why in-house: existing systems "struggle to accurately transcribe heavily-accented speech from beginner non-native speakers"; before this Speak had separate iOS/Android systems, small on-device models limited by old phones, and a third-party service that failed on accented speech. (10 Jun 2024) [primary] — [Speak](https://www.speak.com/blog/asr-levelup)
- Planned next steps stated in that post: Spanish and more languages, and "phonemes for pronunciation feedback". (10 Jun 2024) [primary] — [Speak](https://www.speak.com/blog/asr-levelup)
- Speak was a launch partner for OpenAI's Whisper API, citing reduced latency, higher word accuracy, accented speech and code-switching (multi-lingual speech in one utterance) for open-ended conversation. (1 Mar 2023) [primary] — [Speak + OpenAI Speech Recognition](https://www.speak.com/blog/speak-openai-speech-recognition)
- Live Roleplays use OpenAI's Realtime API (speech-to-speech) combined with Speak's own proficiency graph, goals and hints. Speak's own caveat: "speech-to-speech models aren't as good as text models on instruction following, and they're not great yet at more nuanced language learning specific tasks like pronunciation coaching". (1 Oct 2024) [primary] — [Speak: Live Roleplays](https://www.speak.com/blog/live-roleplays)

**Duolingo**
- Duolingo states it has "in-house speech recognition and pronunciation models" (used, in that post, to time words/phonemes for character lip animation). (10 Nov 2022) [primary] — [Duolingo: world character visemes](https://blog.duolingo.com/world-character-visemes/)
- Duolingo's Video Call blog explains prompt structure, memory (after the call the transcript is given to an LLM asking "What important information have we learned about the User?"), and a system nudge to end the call, but discloses nothing on the ASR, turn-taking or LLM vendor. (22 Apr 2025) [primary] — [Duolingo: the AI behind Video Call](https://blog.duolingo.com/ai-and-video-call/)
- Duolingo's privacy policy says voice/audio from speaking features is used to evaluate pronunciation and improve speech recognition, and users can opt out of sharing audio for product improvement in Settings. [snippet of primary policy + third-party policy tracker, undated] — [Duolingo privacy policy](https://www.duolingo.com/privacy); [ConductAtlas tracker](https://conductatlas.com/platform/duolingo/duolingo-privacy-policy/voice-and-audio-data-collection/)
- A complaint-site answer claims Duolingo's Android speaking exercises depend on the Google app for the microphone/recognition. Low reliability, undated. [snippet] — [Sikayetvar/Xolvie](https://www.sikayetvar.com/en/duolingo-us/duolingos-voice-recognition-isnt-working-during-speaking-exercises-how-can-i-fix-this-q-12087)

**ELSA Speak**
- ELSA builds L1-specific acoustic models (for speakers of a given native language learning English) to pinpoint the errors that L1 group typically makes. (Interspeech 2016 paper by CTO Xavier Anguera and CEO Vu Van) [primary/academic] — [ISCA archive](https://www.isca-archive.org/interspeech_2016/anguera16_interspeech.pdf)
- ELSA describes its Voice AI Tutor as "powered by proprietary speech recognition technology and informed by one of the world's largest accented datasets". [snippet, primary blog, date not confirmed] — [ELSA blog](https://blog.elsaspeak.com/en/elsa-voice-ai-tutor-generative-ai/)
- No public documentation names a third-party LLM/ASR provider for ELSA. [snippet, review] — [smallest.ai profile](https://smallest.ai/voice-ai-apps/elsa-speak)

**Praktika**
- Praktika runs an optimized Whisper for transcription on Baseten (TensorRT-LLM C++ executor, in-flight batching). Previous unnamed cloud vendor gave 1,000–1,500 ms; now <300 ms p50, with 50% cost saving. CTO Anton Marin: "A big portion of our latency was speech-to-text." 9 languages, later 16. (undated customer story) [primary vendor] — [Baseten: Praktika](https://www.baseten.co/resources/customers/praktika/)
- Praktika's TTS is ElevenLabs (since early 2024); A/B tests with other TTS dropped metrics; +15% average session length after the voice upgrade. [snippet, primary vendor] — [ElevenLabs: Praktika](https://elevenlabs.io/blog/praktika-scales-immersive-language-learning-with-elevenlabs-tts)

**Babbel**
- Babbel says its speech recognition is trained on "millions of data points from Babbel's own library of audio files", on "both correct and incorrect pronunciations, with different accents or dialects" and low/high voice ranges, compares "thousands of phoneme samples", and is "the first to be tailored specifically to the needs of language learners". Launched on web for English, French, German, Italian, Spanish (Spain) and Latin American Spanish. (21 Nov 2023) [primary] — [Babbel press release](https://www.babbel.com/press/en-us/releases/learn-with-your-own-voice-babbel-launches-two-new-speech-based-features-us)

**Rosetta Stone (TruAccent)**
- TruAccent is Rosetta Stone's proprietary engine; it has a dedicated setting for children's voices and an adjustable sensitivity (strictness) level. [snippet, primary blogs, 2022–2024] — [Rosetta Stone blog](https://blog.rosettastone.com/truaccent-learning-with-rosetta-stone/); [Rosetta Stone education blog](https://educationblog.rosettastone.com/2022/11/instruction-for-independent-language-learners-with-rosetta-stone-for-schools/)

**Others**
- Busuu: "Speaking Practice" (27 Jun 2024) uses "an AI speech recognition tool" that grades sentences and highlights the words needing work; full AI feedback for English and Spanish only. "Conversations" (22 Oct 2024) adds two-way AI dialogues for English and Spanish. No vendor named. [snippet, press release] — [BusinessWire](https://www.businesswire.com/news/home/20240627194750/en/Busuu-Launches-AI-powered-Speaking-Practice-to-Boost-Real-World-Conversation-Skills); [Nasdaq](https://www.nasdaq.com/press-release/busuu-launches-new-ai-conversation-practice-feature-2024-10-22)
- Mondly: Wikipedia states its chatbot used Nuance speech recognition (this dates from the 2016-era chatbot; current status unverified). [snippet] — [Wikipedia: Mondly](https://en.wikipedia.org/wiki/Mondly)
- Memrise MemBot: GPT-based (GPT-3.5, later GPT-4-class) chat where you type or use the microphone; ASR vendor not stated. [snippet, third-party directories] — [agentiada](https://agentiada.com/agents/memrise-membot/)
- Pimsleur Voice Coach: described only as "AI voice recognition"; no vendor found. [snippet, primary FAQ] — [Pimsleur FAQ](https://www.pimsleur.com/pimsleur-faq/)
- Loora: says its recognition is tuned for accented English; no vendor named. [snippet, review] — [practiceme review](https://practiceme.app/vs/loora); [TechCrunch 21 Feb 2024](https://techcrunch.com/2024/02/21/loora-wants-to-leverage-ai-to-teach-english/)
- Langua: "Multiple AI models are available to you for transcribing your speech" (user-selectable); models not named. (undated help guide) [primary] — [Langua help guide](https://support.languatalk.com/article/160-learn-how-to-use-langua-effectively-conversations-help-guide)
- Univerbal (YC W23): founder says only "We're using LLMs and good ol'ML. These systems are never going to be 100% accurate." (30 Jan 2024) [primary, HN] — [Launch HN: Univerbal](https://news.ycombinator.com/item?id=39188760)
- ChatGPT voice / OpenAI: the API now recommends GPT-Transcribe (released 28 Jul 2026) for transcription; realtime speech-to-speech models quoted at ~200–400 ms. [snippet] — [Spokenly on GPT-Transcribe](https://spokenly.app/blog/gpt-transcribe); [MindStudio](https://www.mindstudio.ai/blog/gpt-realtime-voice-models-explained)

### Inferences
- The stated reason for in-house models is the same at Speak, ELSA and Babbel: general ASR is trained on fluent speech and does badly on beginners. Speak's own numbers (60% WER cut from fine-tuning on learner audio) are the strongest public evidence that learner-specific data matters more than model choice.
- Speak uses at least three different speech paths for different jobs: its own streaming model for scripted drills (fast word-by-word feedback), Whisper-class for open conversation, and speech-to-speech for Live Roleplays. The pattern "one ASR does not fit all exercise types" is likely common but only Speak documents it.
- Duolingo's Video Call ASR is undisclosed; that it is in-house is plausible given the 2022 statement but is not confirmed.

### Gaps
- No documented ASR vendor for Duolingo Video Call/Roleplay, Pimsleur, Busuu, Memrise, Loora, Talkpal, Jumpspeak, Pingo, Univerbal, Lingopie, Mondly (current), or the model names behind Langua's selector.
- No evidence found of any of these apps publicly using Deepgram, AssemblyAI or Azure Speech for learner ASR (I searched vendor case studies; only Baseten/Whisper for Praktika and OpenAI for Speak turned up). The OpenAI customer story on Speak returned HTTP 403 and was not read.
- Whether Speak's in-house model now covers Spanish (planned in June 2024) was not confirmed.
- Lingopie: found no reliable source on a speech-input feature.

## 2. Turn-taking UX: tap vs hold vs open mic, not cutting off learners who pause, barge-in

### Takeaway
Being cut off while thinking is the single best-documented failure of open-mic voice for language learners; Duolingo, ChatGPT and Gemini all shipped fixes for it, and Duolingo's fix was a manual tap-to-start / tap-to-finish button. Apps aimed at learners mostly default to manual send and make hands-free auto-send an opt-in, with an explicit warning.

### Cited Findings

**What the apps do**
- Duolingo Video Call: Lily originally interrupted "CONSTANTLY"; Duolingo added a tap-to-speak button — tap once to start, tap again to confirm you are done — letting users "respond in your own time and stopping Lily from interrupting before you've finished". Users still report Lily "doesn't give you time to think", sometimes "doesn't respond at all", and ends calls abruptly; an XP counter now sets when the call wraps up. (4 Oct 2025) [review + user comments] — [duoplanet](https://duoplanet.com/duolingo-video-call/)
- Langua: Call mode is hands-free with interruption ("you can even interrupt"). In normal chat there is an auto-record option (speak "as soon as the button starts pulsing") or a manual record button, a bin button to cancel a recording, and an auto-send option that is "generally best left off unless 100% hands-free is essential" because "if you pause whilst thinking, it may send before you're ready". (undated) [primary] — [Langua help guide](https://support.languatalk.com/article/160-learn-how-to-use-langua-effectively-conversations-help-guide)
- Praktika: fullscreen hands-free mode where "messages send automatically after a pause"; the non-hands-free control is a press-hold-drag button the reviewer found awkward. Univerbal: similar auto-send hands-free option and an intentionally "slower pace". Talkpal: no hands-free mode. Speak: hands-free works for drills/lessons. (updated 25 Sep 2026) [review] — [Lingtuitive](https://lingtuitive.com/blog/best-ai-speaking-apps)
- ChatGPT: standard voice mode let you hold the centre circle so it would not respond until release; Advanced Voice Mode dropped it. On 24 Mar 2025 OpenAI updated AVM so free users can pause without being interrupted and paid users get fewer interruptions. [press] — [TechCrunch](https://techcrunch.com/2025/03/24/openai-says-its-ai-voice-assistant-is-now-better-to-chat-with)
- A July 2026 OpenAI forum thread says hold-to-talk briefly reappeared "in mid-june" and "randomly disappeared", and that interruptions while thinking happen "ALOT learning a language"; OpenAI replied (7 Sep 2026) with "No timeline to share". [user forum] — [OpenAI community](https://community.openai.com/t/chatgpt-live-voice-still-interupts-too-much-what-happened-to-hold-to-talk/1386172)
- Gemini Live: Android update made it "less likely to cut you off mid-sentence if you pause too long" (iOS promised for 2026), and replaced the hold button with a mute button so ambient sound stops interrupting Gemini. (12 Dec 2025) [press] — [Android Police](https://www.androidpolice.com/less-gemini-live-interruptions/). A later "Tap to interrupt" on-screen prompt is reported. [snippet] — [Android Headlines, Sep 2026](https://www.androidheadlines.com/2026/09/google-gemini-live-real-time-translation-ui-update.html)

**State of the art in turn detection (what a builder can use)**
- OpenAI Realtime API offers `server_vad` (threshold, prefix_padding_ms, silence_duration_ms) and `semantic_vad` with `eagerness` low/medium/high/auto; `low` "will let the user take their time to speak"; turn detection can be set to null for push-to-talk. (undated docs) [primary] — [OpenAI realtime VAD guide](https://developers.openai.com/api/docs/guides/realtime-vad)
- LiveKit Turn Detector v1 (17 Jun 2026) works on audio directly, fusing a semantic branch and an acoustic/prosody branch, 14 languages. Reported: 9.9% false cut-offs at 300 ms latency (Deepgram Flux 12.9%), 4.5% at 600 ms; 543 ms mean latency at a 5% false-cut-off target. Vendor's own benchmark. [primary] — [LiveKit blog](https://livekit.com/blog/solving-end-of-turn-detection)
- Deepgram Flux (1 Oct 2025): end-of-turn built into the ASR; `eot_threshold` default 0.7 (range 0.5–0.9), fallback silence timeout 5000 ms; p90 ~1 s, p95 ~1.5 s; `StartOfTurn` event for barge-in; ~30% fewer false interruptions claimed; English only at launch. [primary] — [Deepgram Flux announcement](https://deepgram.com/learn/introducing-flux-conversational-speech-recognition); [Flux config docs](https://developers.deepgram.com/docs/flux/configuration)
- Pipecat Smart Turn v3 (11 Sep 2025): open-source 8 MB audio model (Whisper Tiny base), runs after a VAD such as Silero detects silence, looks at up to 8 s of audio; 23 languages; Spanish accuracy 91.97% (4.48% false positive, 3.55% false negative); 12.6 ms CPU inference. [primary] — [Daily blog](https://www.daily.co/blog/announcing-smart-turn-v3-with-cpu-inference-in-just-12ms/)
- AssemblyAI's guide (30 Sep 2026) names three approaches — manual endpointing, silence detection, semantic endpointing — and ships presets: min_latency (max turn silence 640 ms), balanced (1,280 ms), max_accuracy (2,560 ms). [primary] — [AssemblyAI](https://www.assemblyai.com/blog/turn-detection-endpointing-voice-agent)

### Inferences
- All published turn-detector benchmarks are on fluent (mostly native) speakers. A beginner's mid-sentence pause to recall a word is longer and less prosodically marked than a native speaker's, so the quoted false-cut-off rates (4.5–10%) are probably optimistic for learners. No vendor publishes learner numbers.
- The market converged on the same answer for learners: a manual "I'm done" control (Duolingo's second tap, Langua's send button) as the default or the escape hatch, with auto-send as an opt-in. For a learner app, "patient by default" (semantic VAD at low eagerness, or a long silence cap of ~2.5 s+) plus a visible done button looks like the safest combination.
- Gemini's change from hold to mute shows the second half of the problem: barge-in triggered by background noise, not just premature end-of-turn.

### Gaps
- No app publishes its endpointing values (silence ms, eagerness). No "adjustable patience" slider was found documented in any learner app; Langua's on/off auto-send is the closest.
- How Speak's Live Roleplays, Loora, Pingo, Jumpspeak and Busuu Conversations handle turn end and barge-in is not documented.
- Whether Duolingo's tap-to-speak is now the default for all users or still an experiment is unclear (source is a fan site, Oct 2025).

## 3. Feedback UX: live vs after transcript, editing/re-recording, mis-recognition, English mid-sentence, typed fallback

### Takeaway
Text-first tutors (Langua, Univerbal, Duolingo Roleplay, Memrise) show the transcript before or as it is sent and offer typing as an equal input; call-style products (Duolingo Video Call, ChatGPT, Gemini) show the transcript only after. Only Langua documents a "check the transcript before sending" step and openly invites switching to your native language mid-sentence.

### Cited Findings
- Speak's in-house streaming model gives word-level feedback during scripted drills: ~1.6 s average from prompt to first word feedback, updates "at least every 260 milliseconds", 20% faster than the earlier third-party service. (10 Jun 2024) [primary] — [Speak](https://www.speak.com/blog/asr-levelup)
- Langua: after speaking "you can either hit send or alternatively pause and check what you've said has been transcribed correctly"; bin button cancels a recording; "If you don't know how to say a particular word or sentence, feel free to say it in your native language"; its transcription models "generally understand when you switch languages mid-sentence"; a Text-only mode exists; it advises to "speak in a quiet room and turn recording off when you're not speaking". (undated) [primary] — [Langua help guide](https://support.languatalk.com/article/160-learn-how-to-use-langua-effectively-conversations-help-guide)
- Duolingo Video Call: "After each call, you'll see a transcript showing what you did well and what you could improve on", with translations of Lily's lines. (4 Oct 2025) [review] — [duoplanet](https://duoplanet.com/duolingo-video-call/)
- Duolingo Roleplay: respond "by typing or using speech-to-text"; feedback report at the end. [snippet, reviews] — [duolingoguides](https://duolingoguides.com/duolingo-max/)
- Duolingo lessons: "In many of the writing exercises you see, you also have the option to *speak* your answer instead of typing it!" (9 Feb 2026) [primary] — [Duolingo blog](https://blog.duolingo.com/covering-all-the-bases-duolingos-approach-to-speaking-skills). A user complaint notes the voice-typed text makes odd errors that are easy to miss on a small screen before checking. [snippet, user blog] — [mvanec substack](https://mvanec.substack.com/p/duolingo-annoyances)
- Duolingo lets users disable speaking exercises (those who do are not asked to share speech data). [snippet] — referenced via [Duolingo blog search result](https://blog.duolingo.com/how-were-improving-learning-with-anonymized-speech-data) (page returned 404 when opened; treat as unverified)
- Univerbal: speak or type; HN users praised its "'suggestion' / 'I'm unsure'" help buttons; reported mis-transcription example: "Eu quero ir a assistir ao filme" became "Eu quero ia AA chistian ao filme". (30 Jan 2024) [primary/HN] — [Launch HN](https://news.ycombinator.com/item?id=39188760)
- Mondly's chatbot lets you pick a suggested reply or say your own. [snippet, competitor review] — [Lingopie's Mondly review](https://lingopie.com/blog/mondly-review/)
- Babbel: tap the orange microphone and speak when prompted. (21 Nov 2023) [primary] — [Babbel](https://www.babbel.com/press/en-us/releases/learn-with-your-own-voice-babbel-launches-two-new-speech-based-features-us)

### Inferences
- A pre-send transcript review is the cheapest protection against ASR errors being "corrected" as if they were the learner's errors. It costs speed, which is why call modes drop it.
- Suggested-reply / "I'm unsure" buttons double as the graceful path when recognition fails or the learner is stuck, without needing a "didn't catch that" loop.

### Gaps
- No app was found that shows per-word ASR confidence or marks uncertain words in the transcript.
- No documentation found of how any app words its "didn't catch that" recovery, or how Duolingo/Speak/Praktika treat English inserted mid-sentence.
- Could not verify the current wording/duration of Duolingo's "Can't speak now" option (commonly described as pausing speaking exercises for a while); no primary source located.
- Whether Speak or Praktika allow editing a misheard transcript is not documented.

## 4. Separating "what you said" from "the correction"; verbatim errors; pronunciation scoring vs grammar feedback

### Takeaway
The common pattern is: keep the learner's message as said, and put the correction beside or under it (strikethrough/bold or original-vs-corrected), with pronunciation handled by a separate, usually phoneme-level, system. A real risk is that Whisper-class ASR silently fixes learner grammar, so the "verbatim" transcript is not actually verbatim.

### Cited Findings
- Research: an ACL 2024 paper (Michot et al., submitted 5 Jun 2024) built an "error-preserving" ASR from ~85 hours of grade 4–6 Swiss learners' English, reporting "a much higher error preservation rate than other models"; conventional ASR smooths out learner errors, which defeats corrective feedback. [academic] — [arXiv 2406.03235](https://arxiv.org/abs/2406.03235). A search summary of the paper states Whisper-Large corrects grammar errors into well-formed English. [snippet] — same source.
- Whisper also hallucinates: about 1% of transcriptions in one study contained invented phrases. (2024) [academic, snippet] — [Careless Whisper](https://arxiv.org/html/2402.08021v2)
- Correction display by app: Langua — inline, errors struck through and corrections in bold, with five correction modes in settings; Praktika — bold highlighted words with explanations; Univerbal — bold corrections with grammar-category tags and a "pling" for correct messages; Talkpal — original vs corrected with a grammar explanation (reviewer: harder to scan without highlighting); Speak — "short and easy-to-read corrections". (25 Sep 2026) [review] — [Lingtuitive](https://lingtuitive.com/blog/best-ai-speaking-apps); [Langua help guide](https://support.languatalk.com/article/160-learn-how-to-use-langua-effectively-conversations-help-guide)
- Univerbal makes a corrected version of your sentence that you can then read aloud, highlighting words as you say them. [snippet, third-party] — [videosdk listing](https://www.videosdk.live/ai-apps/univerbal)
- Pronunciation as a separate system: ELSA detects errors at phoneme level with L1-specific models — [ISCA 2016](https://www.isca-archive.org/interspeech_2016/anguera16_interspeech.pdf); Babbel compares phoneme samples — [Babbel, 21 Nov 2023](https://www.babbel.com/press/en-us/releases/learn-with-your-own-voice-babbel-launches-two-new-speech-based-features-us); Busuu grades the sentence and highlights the words to improve — [BusinessWire, 27 Jun 2024](https://www.businesswire.com/news/home/20240627194750/en/Busuu-Launches-AI-powered-Speaking-Practice-to-Boost-Real-World-Conversation-Skills); Speak listed phoneme-level pronunciation feedback as future work — [Speak, 10 Jun 2024](https://www.speak.com/blog/asr-levelup).
- Duolingo moved some speaking grading to phonetics-based matching, so any word/character with similar pronunciation counts as correct (to stop penalising homophones in Chinese/Korean). [snippet, primary] — [Duolingo blog](https://blog.duolingo.com/improving-how-duolingo-teaches-chinese-and-other-languages)
- Speak itself says speech-to-speech models are "not great yet" at pronunciation coaching. (1 Oct 2024) [primary] — [Speak](https://www.speak.com/blog/live-roleplays)
- Talkpal flags a word as mispronounced but does not say what was wrong or how to fix it. [snippet, competitor] — [LanguaTalk's Talkpal review](https://languatalk.com/blog/talkpal-review/)

### Inferences
- Grammar feedback (from the transcript, via an LLM) and pronunciation feedback (from the audio, via a phoneme model) are two pipelines in every app that does both well. Apps that derive both from one Whisper transcript get the "too lenient" reviews in section 5.
- Because general ASR tends to normalise learner speech, an app that wants to correct grammar honestly needs either an error-preserving model, a prompt/decoding setup that discourages normalisation, or a pre-send transcript check by the learner.

### Gaps
- No app documents whether its transcript is verbatim or normalised, or how it prevents ASR from autocorrecting learner errors.
- The exact numbers in the ACL paper (error-preservation rate vs Whisper) were not extracted; only the abstract was read.

## 5. Latency targets, streaming tricks, and user complaints about speech recognition

### Takeaway
The working target for a turn is under about 800 ms–1 s from end of speech to first audio, and the documented ways to get there are streaming ASR, starting the LLM before the turn is confirmed, and streaming TTS. In reviews, the dominant complaint for AI-tutor apps is leniency (wrong speech accepted), and for call-style products it is being cut off.

### Cited Findings

**Latency**
- Praktika's target for transcription alone was <300 ms; its earlier provider took 1,000–1,500 ms. [primary vendor] — [Baseten](https://www.baseten.co/resources/customers/praktika/)
- Speak: with speech-to-speech "our AI tutor now responds as fast or faster than a human partner would" (1 Oct 2024) — [Speak](https://www.speak.com/blog/live-roleplays); drills give first word feedback in ~1.6 s — [Speak, 10 Jun 2024](https://www.speak.com/blog/asr-levelup)
- Deepgram Flux `EagerEndOfTurn` fires 150–250 ms before the confirmed end so the LLM can start speculatively; `TurnResumed` cancels the draft if the user keeps talking; cost is 50–70% more LLM calls. (1 Oct 2025) [primary] — [Deepgram](https://deepgram.com/learn/introducing-flux-conversational-speech-recognition)
- LiveKit's `preemptive_generation=True` starts the LLM on the partial transcript, saving a reported 200–400 ms; a typical budget is VAD 50 + STT 150 + LLM first token 400 + TTS 150 + network 50 = under 800 ms. [snippet, third-party guide 2026] — [FutureAGI](https://futureagi.com/blog/how-to-optimize-livekit-latency-2026/)
- AssemblyAI reports a median 307 ms to final transcript after speech stops for its realtime model. (30 Sep 2026) [primary] — [AssemblyAI](https://www.assemblyai.com/blog/turn-detection-endpointing-voice-agent)
- Univerbal's founder conceded "the lag can be a tad too long", especially for fluent users. (30 Jan 2024) — [HN](https://news.ycombinator.com/item?id=39188760). Langua's latency is "slightly longer" than rivals'. (25 Sep 2026) [review] — [Lingtuitive](https://lingtuitive.com/blog/best-ai-speaking-apps)

**Complaints**
- Too lenient — Speak: "you can mispronounce words or even reverse the word order entirely and still receive a perfect score", creating "a false sense of mastery". [competitor] — [LanguaTalk's Speak review](https://languatalk.com/blog/speak-app-review/). A Spanish learner said 'frijero' was accepted as 'frijol', but too-hard "vivo" was heard as "bebo" and flagged. [snippet, review] — [Lingtuitive Speak review](https://lingtuitive.com/blog/speak-review)
- Too lenient — Pingo: reviewer "intentionally said nonsense syllables and Pingo still praised your effort and continued". [competitor] — [LanguaTalk's Pingo review](https://languatalk.com/blog/pingo-ai-review/)
- Too lenient — Jumpspeak: deliberately mispronounced words still marked correct. [snippet, competitor] — [LanguaTalk's Jumpspeak review](https://languatalk.com/blog/jumpspeak-review/). Talkpal lets pronunciation mistakes slide and sometimes gives wrong grammar feedback. [snippet] — [Test Prep Insight](https://testprepinsight.com/reviews/talkpal-review/)
- Too strict / fails to hear — ELSA: users report repeating the same word clearly and being told it is wrong, and voice not registering even in a quiet room. [snippet, user reviews] — [Trustpilot](https://www.trustpilot.com/review/elsaspeak.com); [Techjockey](https://www.techjockey.com/reviews/elsa-speak)
- Cuts off — Duolingo Video Call ("cuts you off constantly") — [duoplanet, 4 Oct 2025](https://duoplanet.com/duolingo-video-call/); ChatGPT voice — [OpenAI community, Jul 2026](https://community.openai.com/t/chatgpt-live-voice-still-interupts-too-much-what-happened-to-hold-to-talk/1386172)
- Mishears — Univerbal Portuguese example above; Univerbal "would sometimes struggle to register words" — [Lingtuitive](https://lingtuitive.com/blog/best-ai-speaking-apps)
- Wrong corrections — Univerbal told a user the subjunctive of "creer" was "creen" (should be "crean"). (Jan 2024) — [HN](https://news.ycombinator.com/item?id=39188760)

### Inferences
- Leniency is partly a product choice (Duolingo's phonetic matching, Speak's beginner calibration) and partly an ASR artefact: a model biased toward plausible words will hear the expected sentence even when it was not said. Scripted exercises make this worse because the expected text is usually fed to the recogniser.
- Speculative generation is worth less in a learner app than in a call-centre agent: learners pause more, so more drafts get thrown away, and a slightly slower, never-interrupting tutor is the trade users ask for.

### Gaps
- Much of the leniency evidence comes from one competitor (LanguaTalk) reviewing rivals; independent corroboration exists only for Speak (Lingtuitive) and Talkpal (Test Prep Insight).
- Reddit threads (r/languagelearning, r/duolingo, r/Spanish) were not directly readable through search; no direct Reddit quotes are included.
- No app publishes an end-to-end latency figure for its conversation mode (Praktika's 300 ms is ASR only).
- No sourced complaint specifically about hallucinated words in a named learner app was found (only the general Whisper research).

## 6. Accessibility and edge cases: noise, Bluetooth, children/quiet voices, privacy, on-device

### Takeaway
Public material is thin here. The documented items are Rosetta Stone's children's-voice setting and adjustable strictness, Babbel training on high/low voices and regional accents, Gemini's mute button for ambient noise, and Duolingo's opt-out for audio sharing; no app was found making an on-device processing claim for its current conversation features.

### Cited Findings
- Rosetta Stone TruAccent: "one of the only speech engines with a customized setting for children's voices", and sensitivity can be lowered for beginners and raised later. [snippet, primary] — [Rosetta Stone education blog](https://educationblog.rosettastone.com/2022/11/instruction-for-independent-language-learners-with-rosetta-stone-for-schools/)
- Babbel trained on low and high voice ranges and accents including Spanish from Argentina, Colombia and Spain. (21 Nov 2023) [primary; Argentina detail from snippet] — [Babbel](https://www.babbel.com/press/en-us/releases/learn-with-your-own-voice-babbel-launches-two-new-speech-based-features-us)
- Noise: Gemini Live swapped hold for mute so "random ambient sounds" stop interrupting. (12 Dec 2025) — [Android Police](https://www.androidpolice.com/less-gemini-live-interruptions/). Langua tells users to use a quiet room and turn recording off when not speaking. — [Langua help guide](https://support.languatalk.com/article/160-learn-how-to-use-langua-effectively-conversations-help-guide). AssemblyAI recommends its max_accuracy preset (up to 2,560 ms silence) for noisy audio. (30 Sep 2026) — [AssemblyAI](https://www.assemblyai.com/blog/turn-detection-endpointing-voice-agent)
- On-device: Speak used small on-device models before 2024 and moved to a server model because older phones limited model size; the server model beat the on-device one by 45% WER. (10 Jun 2024) — [Speak](https://www.speak.com/blog/asr-levelup). Pipecat Smart Turn (8 MB) and LiveKit v1-mini are designed to run on CPU. — [Daily](https://www.daily.co/blog/announcing-smart-turn-v3-with-cpu-inference-in-just-12ms/); [LiveKit](https://livekit.com/blog/solving-end-of-turn-detection)
- Privacy: Duolingo collects voice/audio from speaking features to evaluate pronunciation and improve speech recognition; users can opt out of sharing audio in Settings; anonymised data may be used to train AI models. [snippet] — [Duolingo privacy policy](https://www.duolingo.com/privacy)
- Duolingo keeps call transcripts to build a per-user memory of facts for later calls. (22 Apr 2025) [primary] — [Duolingo](https://blog.duolingo.com/ai-and-video-call/)

### Inferences
- The industry direction is away from on-device ASR for the main transcript (accuracy on learners wins) while small on-device models are kept for turn detection/VAD, where latency matters and audio need not leave the phone.
- Adjustable strictness (Rosetta Stone) is an old idea that the newer AI apps have not copied, although the "too lenient / too strict" complaints in section 5 suggest demand for it.

### Gaps
- No source found on Bluetooth-headset handling (mic switching, the low-quality call audio profile) in any of these apps.
- No source found on children's or quiet voices beyond Rosetta Stone and Babbel.
- No current on-device processing claim found for any listed app; retention periods for recordings were not found for any app other than Duolingo's general policy language.
- Duolingo's blog post on anonymised speech data appeared in search but the URL returned 404, so its details (e.g. prompt shown after 15 lessons) are unverified.
