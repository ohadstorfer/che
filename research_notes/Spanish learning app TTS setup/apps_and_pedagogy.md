# How language-learning apps produce audio, and what research says about synthetic speech for learners (as of October 2026)

Reading notes for the report writer:
- "Documented" = stated by the company, its vendor, or a peer-reviewed paper that I opened. "Snippet only" = I saw it in a search-result summary but the page itself returned 403 or was not opened; treat with more caution.
- Vendor choices change fast. Every finding carries the date of its source.
- Researcher tool budget was exceeded (about 60 calls), so remaining holes are listed under Gaps rather than chased further.

---

## A1. Duolingo: how are lesson audio, character voices, slow ("turtle") audio, Video Call with Lily, and DuoRadio produced?

### Takeaway
Duolingo's lesson audio is synthetic, not recorded line by line: stock Amazon Polly voices by 2017, then custom per-character neural voices built with Microsoft Azure Custom Neural Voice from actor recordings (2021–2023), with ElevenLabs named as a supplier for some content in 2026. Video Call with Lily runs on OpenAI's voice-conversational GPT-4o; how the turtle audio is generated is not publicly documented.

### Cited Findings

**Lesson audio and stock TTS (2017)**
- May 12, 2017: Duolingo taught 25 languages across 69 courses and used TTS for lesson audio. It ran six A/B experiments comparing Amazon Polly voices against its previous TTS provider (English, Italian, Portuguese, German, Swedish, Dutch) and Polly won all six, so Polly was adopted for most languages while "some languages still use the original provider". Learners said the new voices "sounded more natural, were more pleasant to hear, and made fewer pronunciation mistakes". — [AWS ML blog, 2017](https://aws.amazon.com/blogs/machine-learning/powering-language-learning-on-duolingo-with-amazon-polly)
- Same post: Duolingo offers slow-speed versions for listening exercises "geared toward beginner learners, who still find it difficult to grasp phonemes", and pronunciation errors can be corrected with SSML. — [AWS ML blog, 2017](https://aws.amazon.com/blogs/machine-learning/powering-language-learning-on-duolingo-with-amazon-polly)
- The A/B metric was learning/engagement outcome per voice, and a male Dutch voice beat a female alternative, which the team read as overall voice quality mattering more than voice gender. — [AWS ML blog, 2017](https://aws.amazon.com/blogs/machine-learning/powering-language-learning-on-duolingo-with-amazon-polly)

**Custom character voices (2021–2023)**
- Aug 23, 2021: Duolingo announced custom TTS voices for nine characters, initially in English, Spanish, French, German and Japanese. "We used machine learning to build state-of-the-art text-to-speech voices." Casting the English voices alone "took many months of reviewing auditions". — [Duolingo blog, 2021](https://blog.duolingo.com/character-voices)
- Recording scripts were designed for coverage: "We carefully designed the sentences for the recordings to cover all the contexts we'd need for our lessons." Language experts and engineers "worked together to give the system hints or correct the speech when necessary." — [Duolingo blog, 2021](https://blog.duolingo.com/character-voices)
- Prosody was an explicit target: "We also worked to push the limits of the technology to get the right delivery — intonation, rate, and pausing", with question intonation called out as differing by question type. — [Duolingo blog, 2021](https://blog.duolingo.com/character-voices)
- After choosing each character's English performer, Duolingo looked for similar voices in Spanish, French, German and Japanese; the stated purpose included exposing learners to a variety of voices (ages, genders, backgrounds). — [Voicebot.ai, Aug 27, 2021](https://voicebot.ai/2021/08/27/duolingo-adds-custom-characters-voices-upgrades-voice-ai/)
- Feb 23, 2023: Microsoft confirmed the vendor. Duolingo used Custom Neural Voice in Azure; about 6,000 sentences were recorded for representative course material; flagship voices were built in 5 languages and then extended cross-lingually to roughly 10. Kevin Lenzo (Speech Lab lead): "Microsoft had some of the best technology and experience with text-to-speech, so we decided to partner with them" and "Once we had our high-quality flagship voices in five languages, we could almost double the number of languages". — [Microsoft for Startups blog, 2023](https://www.microsoft.com/en-us/startups/blog/duolingo-makes-learning-language-fun-with-help-from-ai/)

**Post-processing of TTS with in-house speech models (2022)**
- Nov 10, 2022: for lip-sync, "we generate the speech, run it through our in-house speech recognition and pronunciation models, and get the timing for each word and phoneme"; each sound maps to one of 20+ visemes per character. The pipeline had to cover "more than 40 languages across more than 100 courses, each containing thousands of sentences". — [Duolingo blog, 2022](https://blog.duolingo.com/world-character-visemes/)
- Same post on QC: "we built up the tools and processes not only to generate the material, but to audit and correct it when we need to". — [Duolingo blog, 2022](https://blog.duolingo.com/world-character-visemes/)

**ElevenLabs (2026)**
- Feb 4, 2026: ElevenLabs' Series D post says "Brands like Duolingo, NVIDIA and TIME use ElevenCreative to create and localize content for global audiences." — [ElevenLabs blog, 2026](https://elevenlabs.io/blog/series-d)

**Slow / turtle audio**
- May 5, 2026: Duolingo describes the turtle button only functionally — learners can "hear the language slowed down, and replay the words and sentences as many times as you need". No method is given. — [Duolingo blog, 2026](https://blog.duolingo.com/covering-all-the-bases-duolingos-approach-to-listening-skills/)
- A third-party review describes the turtle output as the sentence "more slowly, with pauses between words", and notes that TTS audio is easier to slow down without warping than recordings. — [All Language Resources review](https://www.alllanguageresources.com/duolingo-review/) (snippet only; reviewer observation, not company statement)

**Video Call with Lily (Duolingo Max)**
- Sept 2024 launch coverage describes Video Call as an OpenAI-powered feature for Max subscribers. — [Tech Brew, Sept 25, 2024](https://www.techbrew.com/stories/2024/09/25/duolingo-debuts-ai-video-chats)
- A June 2025 Duolingo research report states Video Call "uses voice-based conversational AI provided by GPT-4o at the time of the study from OpenAI". — [Duolingo whitepaper, 2025](https://duolingo-papers.s3.amazonaws.com/reports/Duolingo_whitepaper_language_video_call_improves_speaking_2025.pdf) (snippet only; PDF returned 403)
- Lily's mouth shapes, expressions and camera moves are driven in real time by Rive's state machine. — [Rive CEO Guido Rosso on X, Mar 2025](https://x.com/guidorosso/status/1904374664388018403) (snippet only)
- Apr 22, 2025: Duolingo's own write-up covers prompt structure only (Opener, First Question generated in a separate "Conversation Prep" step, Conversation, Closer; a "List of Facts" memory extracted from transcripts; instructions to "speak at the correct level" by CEFR). It names no model and no TTS, and does not discuss latency. — [Duolingo blog, 2025](https://blog.duolingo.com/ai-and-video-call/); independent summary noting the same omissions: [ZenML LLMOps database](https://www.zenml.io/llmops-database/structured-llm-conversations-for-language-learning-video-calls)

**DuoRadio**
- March 2025 (as summarised by a third party from a Duolingo blog post): scripts are generated and filtered by LLMs (naturalness, grammaticality, coherence, fit to learning criteria), then voiced with TTS and deployed with "zero human intervention post-initiation"; reported growth from 300 to 15,000+ episodes, 2 to 25+ courses, 100K to 5.5M daily users, with a claimed 99% cost reduction. — [ZenML LLMOps database, 2025](https://www.zenml.io/llmops-database/scaling-audio-content-generation-with-llms-and-tts-for-language-learning)

### Inferences
- The turtle audio is very likely a separate synthesis (or a word-spaced render) rather than a time-stretch of the normal clip: a stretch cannot insert pauses between words, and the 2017 post talks about "slow-speed versions" as distinct assets. This is inference from described behaviour, not a documented fact.
- Duolingo's stack is layered by date, not replaced wholesale: stock cloud TTS for long-tail languages, Azure custom voices for characters in major languages, a speech-to-speech model for live conversation. The ElevenLabs wording ("create and localize content") does not say it is used for in-lesson audio; it could be marketing or video content.
- Duolingo's documented QC is: coverage-designed recording scripts, expert "hints" (most likely lexicon/SSML overrides), in-house ASR and pronunciation models run over every generated clip (documented for timing; plausibly reused for checking), and tooling to audit and correct. The DuoRadio description shows LLM checks on text but no stated automatic check on the audio.

### Gaps
- No public statement on whether turtle audio is synthesized separately, at what rate, or with what pause length.
- No public statement on which TTS voices Video Call uses beyond "GPT-4o voice-based conversational AI", or on its latency.
- I could not confirm the claim on one aggregator site that "every voice learners hear in the Duolingo app" is AI-synthesized ([aitrace.org](https://www.aitrace.org/company/duolingo/practice/252bb450-4213-4bd6-bc61-55e75a91f19a)); Duolingo's own posts do not make that universal claim. A forum post saying current MP3s are made with Azure is also unverified ([duome forum](https://forum.duome.eu/viewtopic.php?t=2107)).
- Nothing found on Duolingo's handling of Latin American vs Peninsular Spanish voices, or any Argentine voice.
- The whitepaper and Tech Brew items were not opened directly; the GPT-4o attribution rests on search snippets of Duolingo's own report.

---

## A2. Babbel, Busuu, Pimsleur, Memrise, Rosetta Stone, Mondly, Lingopie: human recordings or TTS?

### Takeaway
The older course-based apps still present human native-speaker recordings as their core audio and as a selling point; AI voice appears only in their newer conversation features, and none of them names a TTS vendor publicly.

### Cited Findings
- Babbel (page read Oct 2026): "Lessons are created by Babbel's in-house team of linguists and educators and are voiced by native speakers." Guided conversations are "voiced by real speakers". — [Babbel, How Babbel Works](https://www.babbel.com/how-babbel-works)
- Babbel Speak, an AI voice conversation partner, launched Sept 16, 2025 for "European or Mexican Spanish", French, German and Italian; scenarios are written by language experts and "brought to life" by AI. No voice vendor is named. — [Babbel press release, 2025](https://www.babbel.com/press/en-us/releases/babbel-speak) (snippet only)
- Babbel's speech recognition was trained on "millions of data points from Babbel's own library of audio files", including correct and incorrect pronunciations and different accents "like Spanish from Argentina, Colombia or Spain". — [Babbel press release](https://www.babbel.com/press/en-us/releases/learn-with-your-own-voice-babbel-launches-two-new-speech-based-features-us) (snippet only)
- Busuu's "Speaking Practice" pairs AI speech recognition and feedback with videos of native speakers; "Busuu Conversations" (AI role-play) is offered for English and Spanish. — [Training Industry press release](https://trainingindustry.com/press-release/professional-development/busuu-launches-ai-powered-speaking-practice-to-boost-real-world-conversation-skills/); [Busuu blog](https://blog.busuu.com/new-conversations-release/) (snippets only)
- Pimsleur lessons use an English narrator plus two native speakers, with native voice actors speaking at an easier-to-follow speed; its AI feature (Voice Coach) is pronunciation feedback against native speakers, not generated speech. — [All Language Resources review](https://www.alllanguageresources.com/pimsleur/); [Pimsleur blog](https://www.pimsleur.com/blog/from-zero-to-fluent/) (snippets only)
- Rosetta Stone's TruAccent compares learner speech "with millions of examples from native speakers"; reviews describe its audio as native-speaker recordings. — [Rosetta Stone blog](https://blog.rosettastone.com/truaccent-learning-with-rosetta-stone/) (snippet only)
- Memrise's differentiator remains short videos of real native speakers; MemBot, its AI partner, was built on GPT-3 and later described as GPT-3.5-powered, with text or voice conversation. — [Memrise blog](https://www.memrise.com/blog/introducing-membot); [Language App Guide review, 2026](https://languageappguide.com/app-reviews/memrise-review/) (snippets only)

### Inferences
- For these companies, human audio is a legacy asset already paid for, so there is little pressure to disclose or replace it; AI voice is confined to open-ended conversation, where pre-recording is impossible.
- Babbel explicitly labelling a "Mexican Spanish" option, and training ASR on Argentine speech, shows regional variety is treated as a product feature even by incumbents — but only for the largest varieties.

### Gaps
- No engineering blog, job post or vendor story found naming the TTS used in Babbel Speak, Busuu Conversations or MemBot voice mode.
- No reliable documentation found for Mondly or Lingopie audio sourcing. (Lingopie is built on native TV content, so its main audio is the original soundtrack; this is from a third-party review, not a company statement.)
- I did not find how any of these apps implement slow playback. Reviewers imply recorded audio is harder to slow without artefacts, but no company statement was found.
- Most items in this section are from search snippets of company pages rather than pages I opened.

---

## A3. AI-tutor apps (Speak, Praktika, Langua, Talkpal, ELSA, Loora, Jumpspeak, Univerbal, Pingo): which TTS, and how do they get low latency?

### Takeaway
Two architectures are documented: a pipeline of fast ASR + LLM + a commercial streaming TTS (Praktika: Whisper on Baseten + OpenAI GPT + ElevenLabs; Talkpal: Inworld TTS), and a single speech-to-speech model that removes the TTS step (Speak's Live Roleplays and Duolingo's Video Call, both on OpenAI). Most other apps disclose nothing.

### Cited Findings

**Speak**
- Oct 1, 2024: Speak's Live Roleplays run on OpenAI's Realtime API with GPT-4o speech-to-speech. The earlier approach was "transcribing the learner's speech, running it through a text-based LLM workflow, and then synthesizing the AI character's speech", which "introduced significant lag and error". With speech-to-speech the tutor can respond "as fast or faster than a human partner would". — [Speak blog, 2024](https://www.speak.com/blog/live-roleplays)
- Speak states the trade-off: "speech-to-speech models aren't as good as text models on instruction following" and are "not great yet at more nuanced language learning specific tasks like pronunciation coaching and feedback". — [Speak blog, 2024](https://www.speak.com/blog/live-roleplays)
- Speak builds its own speech recognition: a fine-tuned Conformer-CTC streaming model for English, because general ASR struggles with heavily accented beginner speech. — [Speak blog](https://www.speak.com/blog/asr-levelup) (snippet only)
- OpenAI led/backed Speak's $78M round in Dec 2024. — [SiliconANGLE, Dec 10, 2024](https://siliconangle.com/2024/12/10/openai-backs-78m-round-ai-language-learning-startup-speak/)

**Praktika**
- ElevenLabs case study (page dated Mar 1, 2024 by the fetch tool, though the text refers to growth "since partnering in early 2024", so it was probably updated later): each premium avatar uses ElevenLabs TTS; languages listed are English, Spanish, French, Japanese, Korean, German, Portuguese, Italian; voice usage tripled with 5x peaks; average session length rose 15% after the voice upgrade. Built-in code-switching/multilingual output let Praktika teach beginners partly in their native language. No model name or latency figure is given. — [ElevenLabs blog](https://elevenlabs.io/blog/praktika-scales-immersive-language-learning-with-elevenlabs-tts)
- Transcription runs on an optimized Whisper hosted by Baseten (TensorRT-based runtime, in-flight batching): p50 latency under 300 ms, down from 1,000–1,500 ms, with 50% cost savings. — [Baseten customer story](https://www.baseten.co/resources/customers/praktika/)
- OpenAI's customer story says Praktika moved from early davinci models to GPT-3.5 and found GPT-4.1 the best fit in internal evaluations. — [OpenAI, Inside Praktika](https://openai.com/index/praktika/) (snippet only; page returned 403)
- Praktika raised $35.5M in May 2024 for avatar-based tutoring. — [TechCrunch, May 22, 2024](https://techcrunch.com/2024/05/22/praktika-raises-35-5m-to-use-ai-avatars-to-make-learning-languages-feel-more-natural/)

**Talkpal**
- Inworld's vendor page (2026) says Talkpal (5 million learners, 57 languages) switched to Inworld Realtime TTS and within four weeks saw a 40% TTS cost reduction, 7% more voice-feature usage and a 4% retention lift. Co-founder: "We chose Inworld because of its low latency, high-quality output, multilingual support and competitive pricing." The previous provider is not named. — [Inworld, 2026](https://inworld.ai/resources/best-voice-ai-for-language-learning-apps)

**Langua / LanguaTalk**
- Langua advertises "Human-like AI voices cloned from real native speakers", "Multiple native dialects to fit your preferences (depends on language)", an AI that "can speak slower for you", faster audio for intermediates, and a hands-free call mode. No vendor, model or latency is disclosed. — [LanguaTalk](https://languatalk.com/try-langua)

**Vendor latency claims used in this market (vendor/third-party figures, not app-measured)**
- OpenAI Realtime API time-to-first-byte is about 500 ms for US clients, against an often-cited 800 ms voice-to-voice target. — [Latent Space, Realtime API manual](https://www.latent.space/p/realtime-api) (snippet only)
- A comparison article puts Cartesia at 40–100 ms time-to-first-byte and ElevenLabs at 75–300 ms. — [Murf comparison, 2026](https://murf.ai/blog/cartesia-vs-elevenlabs) (snippet only; competitor-authored)

### Inferences
- Low latency in the pipeline design comes from three places that are each documented somewhere: a self-hosted or specially hosted fast ASR (Praktika/Baseten), a mid-size fast LLM (GPT-4.1 class), and a streaming low-latency TTS tier. Speech-to-speech removes two hops but gives up exact control of wording and pronunciation, which Speak itself flags.
- For a product whose audio is fixed course content (words, sentences), none of this latency work applies: audio can be generated offline with the highest-quality, slowest model and checked before release. The live-tutor stack matters only for a conversation feature.
- Talkpal's switch shows price and latency, not just voice quality, drive vendor choice at scale; expect vendor churn.

### Gaps
- No documented TTS vendor found for Speak's scripted lessons, ELSA, Loora, Jumpspeak, Univerbal or Pingo. Searches returned only review listicles.
- Langua's "cloned from native speakers" claim is marketing copy; which cloning vendor is used is not stated (ElevenLabs is a common guess but I found no source).
- No Cartesia, Hume or Deepgram customer story for a named language-learning app was found.
- No app publishes its own end-to-end voice latency apart from Praktika's ASR number.

---

## A4. Which apps offer Argentine / rioplatense Spanish, and how do they source audio? How are regional accents handled generally?

### Takeaway
I found no major app with a verified rioplatense course; incumbents split Spanish only into Spain vs "Latin American" (Babbel adds Mexican). Argentine-specific learning material is mostly from small teacher-led sites, and Argentine TTS voices exist at cloud vendors, so the space is open.

### Cited Findings
- A 2026 comparison of Spanish listening apps concludes that no major app in its comparison should be treated as a verified rioplatense course and advises checking individual speakers and clips; Pimsleur's "Latin American" label does not make it a Mexican or rioplatense course; Babbel is the clearest pick for an explicitly labelled Mexican course but stops at A2. — [Languavibe, 2026](https://languavibe.com/spanish-listening-apps/) (snippet only; page did not render when fetched)
- Babbel Speak offers "European or Mexican Spanish". — [Babbel press release, 2025](https://www.babbel.com/press/en-us/releases/babbel-speak) (snippet only)
- Langua offers "multiple native dialects ... (depends on language)" but its page does not list which Spanish dialects. — [LanguaTalk](https://languatalk.com/try-langua)
- Argentine-specific resources found are teacher-led or content sites rather than apps with a full course, e.g. Easy Argentine Spanish (voseo, lunfardo). — [Easy Argentine Spanish](https://easyargentinespanish.com/) (snippet only)
- A TTS reseller advertises two es-AR neural voices (one female, one male) with voseo and sheísmo; these appear to be resold cloud voices. — [SpeechGen](https://speechgen.io/en/tts-spanish-argentina/) (snippet only; vendor marketing)
- ElevenLabs' Praktika story credits out-of-the-box multilingual and code-switching voices for letting the app expand languages without new recordings. — [ElevenLabs blog](https://elevenlabs.io/blog/praktika-scales-immersive-language-learning-with-elevenlabs-tts)

### Inferences
- Because no large competitor ships a rioplatense course, there is no industry precedent to copy for Argentine audio sourcing; the choice is between a handful of stock es-AR cloud voices, a cloned Argentine speaker (the Langua/Duolingo pattern applied to one accent), or human recordings.
- The Duolingo pattern (cast one native actor per character, record a few thousand coverage sentences, build a custom voice) is the documented way to get a consistent regional accent at scale; multilingual "any-accent" models are documented for breadth (Praktika), not for accent fidelity.

### Gaps
- I could not open the one comparison that addresses rioplatense directly, so its claim is snippet-level.
- No source found on how well current multilingual TTS models hold a rioplatense accent (sheísmo, aspiration of s, voseo stress) — this needs listening tests, and belongs to the vendor-evaluation part of the research.
- Whether Langua, Talkpal or Praktika offer an Argentine voice option is not documented.

---

## B1. Do learners learn as well from TTS as from human recordings (comprehension, pronunciation, vocabulary, attitudes)?

### Takeaway
In controlled studies learners understand and notice language forms from good TTS about as well as from a human voice, and TTS practice improves pronunciation; the consistent penalty is in rated naturalness. Most of this evidence predates today's neural voices, and there is very little direct evidence on long-term vocabulary retention from TTS vs human audio.

### Cited Findings
- Bione & Cardoso (2020), 29 Brazilian EFL learners, TTS voice "Julie" (NeoSpeech) vs a matched human speaker at matched tempo: no significant difference in story comprehension (TTS M = 4.57 vs human M = 4.74 out of 6, p = .147), in sentence dictation (medians 59.65% vs 55.05%, p = .878), or in hearing past-tense -ed (medians 76% vs 85%, p = .083). Comprehensibility ratings were similar; naturalness ratings were unfavourable for TTS. — [Language Learning & Technology 24(1), 2020](https://scholarspace.manoa.hawaii.edu/server/api/core/bitstreams/54f66cfe-2240-41a9-8c61-54a2396388fa/content)
- Cardoso, Smith & Garcia Fuentes (2015), 56 university students in Montreal: TTS samples were rated significantly lower than human on comprehensibility, naturalness, accuracy and intelligibility, yet TTS still scored above 80% on all but naturalness, and listeners perceived the -ed allomorphs equally well from either source. — summarised in [Bione & Cardoso 2020](https://scholarspace.manoa.hawaii.edu/server/api/core/bitstreams/54f66cfe-2240-41a9-8c61-54a2396388fa/content)
- Older studies were mixed: Delogu et al. (1998) found synthetic speech more demanding (slower responses, lower comprehension) with the gap shrinking after exposure; Bailly (2003) found better shadowing with human input; Kang et al. (2008) found no comprehension difference. — reviewed in [Bione & Cardoso 2020](https://scholarspace.manoa.hawaii.edu/server/api/core/bitstreams/54f66cfe-2240-41a9-8c61-54a2396388fa/content)
- Liakin, Cardoso & Liakina (2017, Computer Assisted Language Learning 30(3–4)): L2 French learners doing self-directed practice with mobile TTS significantly improved production of liaison; awareness and perception showed no change because of ceiling effects. — [ERIC summary of follow-up work](https://files.eric.ed.gov/fulltext/ED625258.pdf) (snippet only)
- Al-Shami & Cardoso (2025): 30 Kuwaiti ESL learners trained for four weeks with TTS; both the single-voice and multi-voice groups improved phonological awareness of -ed, and the multi-voice group got significantly better comprehensibility and accentedness ratings from teachers. — [Canadian Journal of Applied Linguistics 28(3), Dec 2025](https://journals.lib.unb.ca/index.php/CJAL/article/view/35910)
- Testing evidence: an ETS study (Choi, 2022) gave 653 test takers 13 listening items in two versions, human voice actor vs synthetic speech, and found "remarkably comparable performance". — [ETS Research Report Series, 2022](https://onlinelibrary.wiley.com/doi/abs/10.1002/ets2.12347) (snippet only; page returned 403)
- Counter-evidence with younger listeners: a 2025 study found 11–13-year-old children scored higher on listening comprehension with a human voice than with TTS, and rated the human voice as more pleasant and easier to understand. — [Educational Psychology, 2025](https://www.tandfonline.com/doi/full/10.1080/01443410.2024.2446778) (snippet only; this is L1 children, not adult L2 learners)
- Attitudes: in a 2025 pilot with Quebec French, listeners held generally positive attitudes to AI-generated speech and found it relatively easy to understand once filled pauses, repetitions and reformulations were removed from the text (n = 7). — [Canadian Journal of Applied Linguistics 28(3), Dec 2025](https://journals.lib.unb.ca/index.php/CJAL/article/view/35677)
- Engagement data from industry: Duolingo's 2017 A/B tests showed better voices changed learner outcomes enough to switch vendors; Praktika reported +15% session length after a voice upgrade. — [AWS ML blog, 2017](https://aws.amazon.com/blogs/machine-learning/powering-language-learning-on-duolingo-with-amazon-polly); [ElevenLabs blog](https://elevenlabs.io/blog/praktika-scales-immersive-language-learning-with-elevenlabs-tts)
- An ongoing University of Maryland/ETS-funded study (announced Mar 25, 2025; 400+ TOEFL Junior takers) is testing whether AI voices change listening-item difficulty; no results were published in the announcement. — [UMD SLLC, 2025](https://sllc.umd.edu/news/exploring-ai-generated-speech-language-assessment)

### Inferences
- The peer-reviewed "TTS is about as good" findings used pre-neural or early-neural voices (NeoSpeech Julie, mobile OS voices). Current neural voices are more natural, so the comprehension parity result should hold at least as well, and the naturalness penalty should be smaller — but that is extrapolation; I found no large adult-L2 study on 2024–2026 neural voices with learning outcomes.
- Intelligibility parity is established for sentence and story listening. It does not establish that a TTS voice gives a correct pronunciation model for every single word; the academic studies do not test rare words, homographs or regional accent accuracy.
- Voice quality seems to matter more for engagement (session length, preference) than for measured comprehension.

### Gaps
- No direct study found comparing vocabulary retention (delayed tests) for words learned from neural TTS vs human recordings.
- No study found on learners of Spanish specifically, or on regional-accent TTS for learners.
- A 2026 Computer Assisted Language Learning article on TTS in elicited imitation looked relevant but returned 403 and is not summarised here: [CALL 2026](https://www.tandfonline.com/doi/full/10.1080/09588221.2026.2737122).
- The ETS and children's studies are reported from snippets only.

---

## B2. What does research say about slowed speech for beginners (rates, natural slow speech vs stretched audio, pauses vs slower articulation, rate by CEFR level)?

### Takeaway
Fast speech (around 200 wpm and above) clearly hurts lower-level learners and moderate slowing helps, but very slow speech adds little; pauses at phrase boundaries and naturally produced "learner-directed" speech help more than mechanically stretching normal speech. CEFR gives only qualitative rate guidance, no numbers.

### Cited Findings

**Rates**
- Griffiths (1990): 15 lower-intermediate Japanese EFL adults; rates defined as 100 wpm slow, 150 average, 200 fast. Scores at slow and average were significantly higher than at fast, with no significant difference between slow and average. — reviewed in [Chiu & Chen 2023, English Language Teaching 16(7)](https://pdfs.semanticscholar.org/aefa/12304504e1b362d5b1e04d98f131af445cb3.pdf)
- Griffiths (1992): rates of 128, 188 and 250 wpm; scores at the slow rate were significantly higher than at both the average and fast rates. — reviewed in [Chiu & Chen 2023](https://pdfs.semanticscholar.org/aefa/12304504e1b362d5b1e04d98f131af445cb3.pdf)
- Chiu & Chen (2023): 66 Taiwanese junior-high EFL learners; baseline test at 116 wpm (the rate set by Taiwan's GEPT elementary test). Slowing to 98 wpm helped comprehension; slowing to 58 wpm made no significant difference. — [English Language Teaching 16(7), 2023](https://pdfs.semanticscholar.org/aefa/12304504e1b362d5b1e04d98f131af445cb3.pdf)
- Zhao (1997, Applied Linguistics 18(1)): when learners could control the speech rate themselves, comprehension improved, and they achieved it by slowing the speech down. — [Semantic Scholar record](https://www.semanticscholar.org/paper/The-Effects-of-Listeners'-Control-of-Speech-Rate-on-Zhao/3520835f0e0339e37c2a91b25b19de83bd9a0ef1) (snippet only)
- Reference points for "normal": Tauroza & Allison (1990) measured British English at about 160 wpm for radio monologue, 190 for interviews and 210 for conversation; "slow" was below about 3.17 syllables/s and "fast" above about 5.33. — [Wikipedia, Speech tempo](https://en.wikipedia.org/wiki/Speech_tempo) and secondary citations (snippet only)
- L2 Spanish: Medina, Socarrás & Krishnamurti (2020, Modern Language Journal 104), 31 English-speaking learners in upper-level Spanish, 32 sentences crossing normal/fast rate with short/long length. Sentence length and oral proficiency predicted comprehension; faster speech hurt higher-proficiency listeners only, because lower-proficiency listeners scored low at both rates; high proficiency offset the cost of longer sentences. — [Modern Language Journal, 2020](https://onlinelibrary.wiley.com/doi/abs/10.1111/modl.12639) (snippet only)

**Pauses vs mechanical slowing**
- Blau (1991 conference paper, building on Blau 1990 TESOL Quarterly), Study 1: 61 Puerto Rican students heard monologues at "normal" rate (about 200 wpm), with 3-second blank pauses inserted on average every 23 words at sentence/clause/phrase boundaries (overall about 150 wpm), or with the same pauses filled with hesitation markers (about 142 wpm). Segments between pauses kept the normal rate. Both paused versions were understood significantly better than normal; filled pauses slightly more than blank. — [Blau, ERIC ED340234](https://files.eric.ed.gov/fulltext/ED340234.pdf)
- Blau Study 2: 48 Japanese students, adding a mechanically slowed version (VSC Soundpacer, about 185 wpm). Only the filled-pause version beat normal; blank-pause, mechanically slowed and normal did not differ. Blau concludes: "Mechanical slowing proved again in the present study not to be a useful modification to input." She also reports from her earlier work that the effect of mechanical slowing "became more negative" as proficiency rose. — [Blau, ERIC ED340234](https://files.eric.ed.gov/fulltext/ED340234.pdf)
- Blau notes Griffiths's slow and average versions (100–150 wpm) were themselves "slowed by means of pauses, mostly at clause boundaries", and that Griffiths (1991) favoured slowing by pauses. — [Blau, ERIC ED340234](https://files.eric.ed.gov/fulltext/ED340234.pdf)

**Natural slow speech vs stretched audio**
- Piazza et al. (2025, Imaging Neuroscience): 25 Spanish-L1 learners of English (mid-low proficiency) heard native-directed speech, naturally produced speech accommodated to L2 listeners (slower, clearer), and native-directed speech artificially slowed by time-warping to the same pace. The naturally accommodated speech improved comprehension and cortical encoding at acoustic, phonological and semantic levels; artificially slowed speech changed acoustic encoding only. Authors: accommodation helps "beyond what can be achieved by simply speaking slowly". — [Imaging Neuroscience, 2025 (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12319891/)

**CEFR**
- CEFR listening descriptors specify rate only qualitatively. A1: "Can follow speech that is very slow and carefully articulated, with long pauses for him/her to assimilate meaning." A2: "provided speech is clearly and slowly articulated"; recorded passages "delivered slowly and clearly". B1: "clearly articulated in a generally familiar accent"; recordings "delivered relatively slowly and clearly". B2: "standard dialect at normal speed". — [CEFR scales (Council of Europe, reproduced by Macmillan)](https://api.macmillanenglish.com/fileadmin/user_upload/Blog_and_Resources/Blogs_and_articles/CEFR-all-scales-and-all-skills.pdf)
- Learner speaking (not listening) rates by level, for scale: B2 learners averaged 118 wpm (SD 22), C1 142 wpm (SD 20), native speakers 174 wpm (SD 34). — [University of Birmingham corpus conference paper, 2017](https://www.birmingham.ac.uk/Documents/college-artslaw/corpus/conference-archives/2017/general/paper229.pdf) (snippet only)

### Inferences
- A workable reading of the numbers for beginners: aim for roughly 100–130 wpm for A1–A2 sentence audio, and do not go far below about 100 wpm for connected speech, since 58 wpm and 100-vs-150 comparisons showed no added benefit. These studies are on English; Spanish has more syllables per word, so the equivalent wpm will be somewhat lower and syllables per second is the safer unit. The conversion is my inference, not a cited figure.
- Three converging results (Blau, Griffiths, Piazza) say the helpful kind of "slow" is clearer articulation plus pauses at phrase boundaries, not a uniform stretch of fast speech. For TTS this argues for synthesizing a genuinely slower, clearer rendition (or inserting phrase-boundary breaks) rather than time-stretching the normal clip.
- Blau's mechanical-slowing condition only went from about 200 to about 185 wpm, so it is weak evidence against stretching in general; Piazza et al. (matched pace, modern time-warping) is the stronger evidence.
- Zhao's learner-control result supports keeping a slow button the learner chooses to press, rather than slowing everything by default.
- Duolingo-style word-by-word turtle audio has no direct research support in what I found: it breaks sentence prosody, and the literature favours pauses at phrase boundaries. It may still help beginners segment words; that is untested here.

### Gaps
- No official numeric speech-rate guidance by CEFR level exists in the CEFR itself; a search snippet claiming "A1 60 wpm, A2 80, B1 100" had no traceable source and appears to describe learner speaking rates, so I excluded it. Likewise a claim that graded readers use 100–120 wpm at A2 came from a test-prep blog only.
- No study found on rate thresholds for L2 Spanish beginners specifically, or on single-word vs sentence slowing.
- No study found comparing TTS-native slow rendering against time-stretched TTS for learners.
- Griffiths, Zhao, Tauroza & Allison and Medina are reported from secondary summaries, not the original papers.

---

## B3. Does voice variability (multiple talkers, HVPT) beat a single voice?

### Takeaway
Multiple voices are a reasonable default but the benefit is smaller and less certain than the classic literature suggests: it shows up mainly for generalising to new speakers, for pronunciation detail (stress), and for more advanced learners; a large replication found no advantage over a single talker.

### Cited Findings
- A 2025 meta-analysis of 79 HVPT studies (Studies in Second Language Acquisition): overall perception gains g = 0.92 (within-participant) and g = 0.67 (between-participant), about 14 percentage points on trained items and 13 on untrained; gains were retained at delayed test (g = −0.08 change). Number of talkers was a significant moderator only in interaction with proficiency: higher-proficiency learners benefited from more talkers, lower-proficiency learners did not. Gains plateaued after about 400 minutes of training. — [SSLA meta-analysis, 2025](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/high-variability-phonetic-training-hvpt-a-metaanalysis-of-l2-perceptual-training-studies/6ABB8C1F32D88D53EA8D05A4565E76F6)
- Zhang, Cheng & Zhang (2021), first meta-analysis of multi- vs single-talker training (18 studies): a small advantage for multiple talkers, clearest for generalisation to new talkers and for retention; the authors stress heterogeneity and limitations. Search summaries give inconsistent effect sizes (one says g = 0.46 immediate, dropping to −0.04 after outlier removal, with 0.72 for new-talker generalisation and 1.09 for retention; another says 0.28, 0.36 and 1.09), so exact values need checking against the paper. — [JSLHR, 2021](https://doi.org/10.1044/2021_jslhr-21-00181) (snippet only)
- Brekelmans, Lavan, Saito, Clayards & Wonnacott (2022), a large-scale replication of the classic Lively, Logan & Pisoni design: listeners learned in both conditions and there was no difference between multi-talker and single-talker training. — [Journal of Memory and Language 126, 2022](https://ora.ox.ac.uk/objects/uuid:6d460df2-e4c8-48bc-b3ff-af4fa5c749f1) (snippet only)
- Vocabulary: Barcroft & Sommers found adults recalled new L2 words better when each was heard from six talkers than from three, and three better than one; translation accuracy and speed were better after multi-talker learning. Studies with children have not found the advantage. — [Applied Psycholinguistics](https://www.cambridge.org/core/journals/applied-psycholinguistics/article/abs/indexical-information-encoding-difficulty-and-second-language-vocabulary-learning/2E438AA3E47876B02B192BB105981136); [review of input variability and age](https://www.researchgate.net/publication/333906167_The_role_of_input_variability_and_learner_age_in_second_language_vocabulary_learning) (snippets only)
- Uchihara, Webb, Saito & Trofimovich (2021): 80 Japanese EFL learners met 40 words three or six times, with or without talker variability. Frequency of exposure consistently improved recall of spoken forms; talker variability was "more closely related to the enhancement of word stress accuracy". — [Studies in Second Language Acquisition, 2021](https://www.paveltrofimovich.ca/wp-content/uploads/2022/01/Uchihara_et_al_2021.pdf)
- TTS as the source of variability: Al-Shami & Cardoso (2025) found multi-voice TTS training gave better teacher-rated comprehensibility and accentedness than single-voice TTS, with equal gains in phonological awareness. — [CJAL 28(3), 2025](https://journals.lib.unb.ca/index.php/CJAL/article/view/35910)
- Industry practice: Duolingo gave nine characters distinct voices partly to expose learners to varied voices; its 2017 tests found voice quality outweighed gender preference. — [Voicebot.ai, 2021](https://voicebot.ai/2021/08/27/duolingo-adds-custom-characters-voices-upgrades-voice-ai/); [AWS ML blog, 2017](https://aws.amazon.com/blogs/machine-learning/powering-language-learning-on-duolingo-with-amazon-polly)

### Inferences
- For beginners, repetition count matters more than number of voices (Uchihara; the meta-analysis moderator). A small cast of two to four good voices gives most of the plausible benefit; many voices is not a priority at A1.
- A voice's accuracy and quality should rank above variety: a second voice that mispronounces or drifts in accent is a net loss. This follows from combining the weak variability effect with the quality effect in Duolingo's tests; it is not a tested claim.
- Synthetic voices can deliver the variability benefit (one small study), which makes multi-voice cheap with TTS.

### Gaps
- Most variability research concerns phoneme contrasts in English or Mandarin tones; little on Spanish or on whole-sentence listening.
- Brekelmans, Zhang and Barcroft & Sommers details come from snippets; effect sizes for Zhang et al. conflict across summaries.
- The SSLA 2025 meta-analysis authors were not captured in my fetch.

---

## B4. How important are accurate prosody and exact pronunciation of single-word models?

### Takeaway
Direct learner research on this is thin; the available evidence says prosody carries comprehension and that isolated words and homographs are a known weak spot of TTS engines, so single-word clips are where synthetic audio most needs checking.

### Cited Findings
- Duolingo treated delivery as part of teaching: it worked "to get the right delivery — intonation, rate, and pausing", noting that question intonation in English varies by question type. — [Duolingo blog, 2021](https://blog.duolingo.com/character-voices)
- Research on prosody and listening (L1 children and adults) reports that intonation affects comprehension and recall. — [Educational Psychology, 2025](https://www.tandfonline.com/doi/full/10.1080/01443410.2024.2446778); [Cogent Psychology, 2025](https://www.tandfonline.com/doi/full/10.1080/23311908.2025.2576785) (snippets only)
- Naturally accommodated speech (which includes prosodic and articulatory changes, not just tempo) improved L2 comprehension and phonological encoding over tempo-matched stretched speech. — [Piazza et al. 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12319891/)
- Talker variability improved learners' word-stress accuracy in new vocabulary, i.e. the audio model shapes suprasegmental accuracy of what learners later say. — [Uchihara et al. 2021](https://www.paveltrofimovich.ca/wp-content/uploads/2022/01/Uchihara_et_al_2021.pdf)
- TTS engines can mispronounce single-word inputs: a 2026 Microsoft Q&A thread documents inconsistent pronunciation for single-word SSML requests in one Azure neural voice. — [Microsoft Q&A](https://learn.microsoft.com/en-in/answers/questions/5882278/tts-pronunciation-issue-with-uppercase-letters-in) (snippet only)
- Heteronyms/homographs are described as one of the hardest problems for grapheme-to-phoneme conversion; a model with BERT embeddings reached about 94% homograph accuracy. — [arXiv 2302.14523](https://arxiv.org/pdf/2302.14523); [arXiv 2505.12973](https://arxiv.org/pdf/2505.12973) (snippets only)
- Newer token-based neural TTS models do not all honour SSML phoneme tags; some support a subset, some ignore it or use custom dictionaries instead. — [Soniox pronunciation-control guide](https://soniox.com/wiki/pronunciation-control-ssml) (snippet only)

### Inferences
- Spanish spelling is close to phonemic, so true homograph errors are rarer than in English; the likelier single-word failures are wrong stress on unaccented or ambiguous forms, language misidentification of a lone word (read as English or Portuguese), clipped or over-short clips, and unnatural list-like or question-like intonation on an isolated word. This is reasoning from how TTS behaves, not a cited study.
- Since learners copy stress and rhythm from the model, a wrong stress in a vocabulary clip is a teaching error, whereas slightly flat sentence prosody is only a quality issue. Checking effort should therefore concentrate on isolated words and short phrases.

### Gaps
- No study found that measures how TTS mispronunciations in word models affect learner pronunciation or retention.
- No published error rates for single-word synthesis in Spanish for current models.
- No study found on synthesizing a word in a carrier sentence and cutting it out vs synthesizing it alone.

---

## C. What quality-control practices for TTS output are publicly described (ASR round-trip, human sampling, lexicons, homographs, isolated words)?

### Takeaway
The documented toolkit is: coverage-designed scripts and expert overrides at the source (Duolingo), automatic transcription of each clip with a best-of-N retry, phoneme-level checks where pronunciation matters, a pronunciation lexicon, and human listening for releases. ASR round-trip catches gross failures cheaply but both over-flags and misses fine pronunciation errors.

### Cited Findings
- ASR round-trip is the common protocol: synthesize, transcribe (for example with Whisper), and compute word or character error rate against the input text. — [PashtoTTS-Bench, arXiv 2605.26978](https://arxiv.org/html/2605.26978) (snippet only)
- Best-of-N with ASR verification: a June 2026 paper (Asaria, Salomone & Gandhi) generates several candidates, transcribes each, and keeps a passing one; catastrophic failures (silence, early termination, repetition or hallucinated content) fell to zero at N = 2 on LibriSpeech and N = 4 on hard prompts, across four codec-TTS systems. A summary gives the failure thresholds as a dropout (ASR returns one word or fewer) or WER above 0.5. — [arXiv 2606.18323](https://arxiv.org/abs/2606.18323)
- Limits of round-trip: a Sept 10, 2026 vendor article says ASR round-trip produces false-alarm rates of 21–34% across ASR systems when used to judge pronunciation, because the recogniser makes its own errors, and that word error rate misses mispronunciations that still transcribe correctly. It recommends a phoneme-level Pronunciation Error Rate, PER = (substitutions + deletions + insertions) / reference phonemes, via alignment against expected phonemes. — [Deepgram, 2026](https://deepgram.com/learn/per-new-standard-measuring-tts-accuracy) (vendor article citing ACL Anthology research I did not open)
- Same article: human Mean Opinion Score panels are kept for major releases because they are "impractical for continuous integration", and teams should build "custom pronunciation dictionaries covering 100-1,000+ core domain terms", validated against the W3C Pronunciation Lexicon Specification. — [Deepgram, 2026](https://deepgram.com/learn/per-new-standard-measuring-tts-accuracy)
- Duolingo's documented practice: recording scripts designed to cover lesson contexts; experts giving the system "hints" or correcting speech; every clip passed through in-house speech recognition and pronunciation models for word and phoneme timing; tools "to audit and correct"; SSML to fix pronunciation errors; and A/B testing of voices on learner outcomes before adoption. — [Duolingo blog, 2021](https://blog.duolingo.com/character-voices); [Duolingo blog, 2022](https://blog.duolingo.com/world-character-visemes/); [AWS ML blog, 2017](https://aws.amazon.com/blogs/machine-learning/powering-language-learning-on-duolingo-with-amazon-polly)
- Duolingo's DuoRadio pipeline checks generated scripts with LLM evaluators before TTS and then publishes without human intervention. — [ZenML LLMOps database, 2025](https://www.zenml.io/llmops-database/scaling-audio-content-generation-with-llms-and-tts-for-language-learning)
- SSML phoneme tags can override heteronym pronunciations, but support varies in newer neural models. — [Soniox guide](https://soniox.com/wiki/pronunciation-control-ssml) (snippet only)

### Inferences
- A layered check fits course audio: (1) cheap ASR round-trip on every clip to catch truncation, wrong words, wrong language and garbage; (2) duration sanity limits per character or syllable, which catch clipped and over-long clips that ASR passes; (3) forced-alignment or phoneme-level check, or simply human listening, for isolated words where ASR is least reliable (a lone word gives the recogniser no context, so false alarms and misses both rise); (4) human review of a sample plus everything flagged.
- A recogniser tuned to standard Spanish may "correct" an accent error or flag a legitimate rioplatense feature, so round-trip cannot verify accent fidelity; that needs a native listener.
- Regenerating and picking the best of several takes is cheap for offline course audio and is the single most effective documented fix for random failures.

### Gaps
- No language-learning company other than Duolingo publicly describes its audio QC, and Duolingo gives no numbers (error rates, sample sizes, share of clips human-reviewed).
- The 21–34% false-alarm figure comes from a vendor blog summarising research I did not verify at source.
- Nothing found on QC specifically for isolated-word clips or for regional-accent consistency.
