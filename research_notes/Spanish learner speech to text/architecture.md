# Low-latency speech input architecture for an Expo voice-chat app (Supabase Edge + Claude + ElevenLabs), as of October 2026

Context checked in the repo: `expo ~57.0.14`, `expo-audio ~57.0.3`, `react-native 0.86.2`. Notes on reliability: most page reads were done through a summarising fetch tool, so exact parameter defaults should be re-checked against the linked page before coding. Items I could not confirm are marked **(unverified)**.

## 1. Streaming STT capture from React Native / Expo (raw PCM mic chunks)

### Takeaway
The app's existing `expo-audio` (SDK 57) now has a first-party `useAudioStream` hook that delivers raw PCM buffers, so a new native dependency is probably not needed; third-party modules (`@siteed/audio-studio`, `react-native-audio-api`, `expo-stream-audio`) remain the options when you need simultaneous file + PCM capture, built-in interruption handling, or echo cancellation control.

### Cited Findings
- `expo-audio` exposes `useAudioStream(options)`, "a native audio stream for real-time PCM microphone capture", introduced in SDK 57.0.0. Options: `sampleRate` (default 48000; "The actual rate may differ if the hardware cannot deliver it"), `channels` (default 1), `encoding` (`'float32'` default, or `'int16'`), `onBuffer` callback. Buffer carries `data` (ArrayBuffer), actual `sampleRate`, `channels`, `timestamp`. Platforms: Android, iOS, tvOS, Web. Requires `setAudioModeAsync({ allowsRecording: true })` first. — [Expo Audio docs](https://docs.expo.dev/versions/latest/sdk/audio/)
- The Expo docs do not state whether `useAudioStream` can run at the same time as the file recorder (`useAudioRecorder`). — [Expo Audio docs](https://docs.expo.dev/versions/latest/sdk/audio/)
- `@siteed/audio-studio` (formerly `@siteed/expo-audio-studio`, repo `deeeed/audiolab`) supports real-time chunk streaming, configurable 16 kHz mono 16-bit PCM, "simultaneous raw PCM and compressed audio recording", automatic pause/resume on phone-call interruptions with event callbacks, iOS background recording, and a preparation API to remove start-up delay. — [npm @siteed/audio-studio](https://www.npmjs.com/package/@siteed/audio-studio); [Siteed project page](https://siteed.net/projects/expo-audio-studio)
- That library has an open bug report: iOS auto-resume fails in background after the first interruption. — [deeeed/audiolab issue #495](https://github.com/deeeed/audiolab/issues/495)
- `react-native-audio-api` (Software Mansion) `AudioRecorder.onAudioReady` registers a callback that periodically receives raw buffers matching requested `sampleRate`, `bufferLength`, `channelCount`. — [react-native-audio-api AudioRecorder docs](https://docs.swmansion.com/react-native-audio-api/docs/next/inputs/audio-recorder/)
- On Android with `react-native-audio-api`, `androidInputPreset: 'voiceCommunication'` alone does not cancel the app's own playback; platform AEC only references the voice-communication output path, so media-stream playback leaks into the mic. — [react-native-audio-api issue #1254](https://github.com/software-mansion/react-native-audio-api/issues/1254); earlier request for AEC: [issue #464](https://github.com/software-mansion/react-native-audio-api/issues/464)
- `expo-stream-audio` is a small Expo module that streams mic audio as PCM 16-bit mono frames, built as the audio source for realtime STT, and ships an example wired to ElevenLabs Scribe v2 Realtime via `@elevenlabs/client`. — [vLaD1m1r99/expo-stream-audio](https://github.com/vLaD1m1r99/expo-stream-audio)
- Other community modules: `expo-pcm-stream` (AVAudioEngine on iOS, AudioRecord on Android, fixed-size int16 frames via events) — [Yoy0z-maps/expo-pcm-stream](https://github.com/Yoy0z-maps/expo-pcm-stream); `mykin-ai/expo-audio-stream` and forks — [mykin-ai/expo-audio-stream](https://github.com/mykin-ai/expo-audio-stream); Speechmatics' `expo-two-way-audio` — [speechmatics/expo-two-way-audio](https://github.com/speechmatics/expo-two-way-audio)
- iOS pitfall: `AVAudioEngine` changes its input format when a Bluetooth headset connects (e.g. 44.1 kHz to 16 kHz), which causes crashes if the tap format is hard-coded; Bluetooth HFP is limited to 8 kHz or 16 kHz mono. Voice processing cannot be toggled while the engine runs. — [Apple Developer Forums thread 680785](https://developer.apple.com/forums/thread/680785); [Apple Developer Forums AVAudioEngine tag](https://developer.apple.com/forums/tags/avaudioengine)
- iOS pitfall: on iPhone 16e (iOS 18.4.1–18.7.1) the `installTap` callback was reported to stop firing after a phone-call interruption. — [Apple Developer Forums AVAudioSession tag](https://developer.apple.com/forums/tags/avaudiosession)
- ElevenLabs' official client SDKs for realtime Scribe are `@elevenlabs/react` (`useScribe`) and `@elevenlabs/client`; microphone mode uses browser constraints (`echoCancellation`, `noiseSuppression`, `autoGainControl`); React Native is not mentioned in the client-side streaming guide. — [ElevenLabs client-side streaming guide](https://elevenlabs.io/docs/eleven-api/guides/how-to/speech-to-text/realtime/client-side-streaming); [ElevenLabs React SDK](https://elevenlabs.io/docs/eleven-api/resources/libraries/scribe-stt/react-scribe)

### Inferences
- Lowest-change path for this app: `useAudioStream({ sampleRate: 16000, encoding: 'int16', channels: 1 })`, read the *actual* `sampleRate` from each buffer (it may come back 48000 or 44100), and either resample in JS or tell the STT vendor the real rate (ElevenLabs accepts `pcm_48000`/`pcm_44100`; the message carries `sample_rate`).
- Because the ElevenLabs SDK microphone mode relies on browser `getUserMedia`, in React Native the manual mode (`sendAudio` + `commit`) or a hand-written WebSocket is the realistic route. `expo-stream-audio`'s example suggests `@elevenlabs/client` manual mode works in RN, but I did not test it.
- For a tap-to-talk tutor where TTS playback is stopped before recording, echo cancellation matters little. It becomes a real problem only if the mic is open while Pancho speaks (barge-in).
- All of these need a dev build / prebuild in practice; the app already uses one (native targets, widgets), so this is not a new constraint. `expo-audio` itself is in the Expo SDK.
- Never hard-code the input sample rate: Bluetooth headsets force 16 kHz (or 8 kHz) on iOS, and Android devices commonly deliver 44.1/48 kHz.

### Gaps
- Whether `useAudioStream` and `useAudioRecorder` can run concurrently on one mic session (needed for "stream PCM and keep the .m4a") is not documented; needs a device test.
- `useAudioStream` behaviour on interruption (phone call, Siri), in background, and with Bluetooth route changes is not documented on the page I read.
- No reliable source found on `react-native-live-audio-stream` maintenance status in 2026, nor on LiveKit RN SDK / `react-native-webrtc` specifics for this use; not researched in depth. WebRTC stacks give AEC/NS/AGC for free but send Opus to a media server, which implies a LiveKit/Pipecat-style backend rather than a plain STT websocket.

## 2. Transport: direct client-to-vendor websocket with ephemeral tokens vs server proxy; Supabase Edge limits; alternatives

### Takeaway
Every major vendor issues short-lived client tokens, so the standard pattern is: edge function mints a token, the phone opens the websocket straight to the STT vendor. Supabase Edge Functions can hold and relay websockets, but the 150 s (free) / 400 s (paid) wall clock and 2 s CPU limit make them a poor audio relay; use them only to mint tokens and run the LLM turn.

### Cited Findings
- ElevenLabs: single-use tokens are created server-side with `elevenlabs.tokens.singleUse.create("realtime_scribe")`; "A single use token automatically expires after 15 minutes"; passed as the `token` query parameter. — [ElevenLabs client-side streaming guide](https://elevenlabs.io/docs/eleven-api/guides/how-to/speech-to-text/realtime/client-side-streaming); [ElevenLabs realtime API reference](https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime)
- ElevenLabs realtime websocket hosts: `wss://api.elevenlabs.io/v1/speech-to-text/realtime`, plus US, EU, India and Singapore residency hosts. — [ElevenLabs realtime API reference](https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime)
- Deepgram: the token grant endpoint returns a JWT with a default 30-second TTL (`ttl_seconds` configurable) and `usage::write` permission. — [Deepgram token-based auth](https://developers.deepgram.com/reference/auth/tokens/grant)
- AssemblyAI: temporary streaming token with `expires_in_seconds` 1–600; this is a redemption window for opening the websocket and does not cap session length. — [AssemblyAI temporary token docs](https://www.assemblyai.com/docs/streaming/authenticate-with-a-temporary-token); [AssemblyAI API reference](https://www.assemblyai.com/docs/api-reference/streaming/create-temporary-token)
- Soniox: temporary API keys, expiry 1–3600 s, can be restricted to single use and a maximum session duration. — [Soniox create temporary API key](https://soniox.com/docs/api-reference/auth/create_temporary_api_key); [Soniox temporary keys guide](https://soniox.com/docs/guides/temporary-api-keys)
- OpenAI: "Create transcription session" returns a `client_secret` ephemeral token for realtime transcription from clients; models include `gpt-4o-transcribe` and `gpt-4o-mini-transcribe`; WebRTC is recommended for clients and WebSocket for server-to-server. — [OpenAI create transcription session](https://developers.openai.com/api/reference/resources/realtime/subresources/transcription_sessions/methods/create); [OpenAI Realtime guide](https://platform.openai.com/docs/guides/realtime)
- Supabase Edge Functions can host websocket servers (`Deno.upgradeWebSocket`) and open outbound websockets, and the docs name "WebSocket proxy"/relay for OpenAI Realtime as a use case. After upgrade the HTTP request counts as finished, so you must hold an unresolved `EdgeRuntime.waitUntil()` promise until `socket.onclose`. Clients cannot send custom headers, so the JWT must go in the query string or `Sec-WebSocket-Protocol` and be validated by hand. — [Supabase: Handling WebSockets](https://supabase.com/docs/guides/functions/websockets)
- Supabase limits: wall clock 150 s (Free) / 400 s (paid); CPU time 2 s per request (excluding async I/O); memory 256 MB; idle timeout 150 s. — [Supabase Edge Function limits](https://supabase.com/docs/guides/functions/limits)
- The wall-clock limit applies to the whole websocket connection, counted from the upgrade request. — [Supabase discussion #32791](https://github.com/orgs/supabase/discussions/32791); related long-running voice use case: [discussion #33193](https://github.com/orgs/supabase/discussions/33193)
- Users have asked Supabase to raise the 2 s CPU limit. — [Supabase discussion #36678](https://github.com/orgs/supabase/discussions/36678)
- Third-party write-ups report Supabase cold starts averaging about 42 ms (down from 870 ms), P99 under 0.5 s. — [Joshua Berkowitz blog](https://joshuaberkowitz.us/blog/news-1/supabase-edge-functions-persistent-storage-and-lightning-fast-cold-starts-transform-serverless-workflows-563) (secondary source; **unverified** against Supabase's own post)

### Inferences
- Recommended transport for this stack: the client asks an edge function for a single-use Scribe token when the Hablar screen opens (or when the mic button is pressed down), then connects directly to ElevenLabs. Audio never transits Supabase, so the 2 s CPU limit and wall clock are irrelevant to audio.
- Deepgram's 30 s default TTL and ElevenLabs' single-use rule both mean a token per connection; fetch it ahead of the tap (on screen mount or when the previous turn ends) so token minting is off the critical path.
- A per-utterance websocket through Supabase would technically fit in 150–400 s, but base64 decoding and re-framing audio for every chunk eats the 2 s CPU budget and adds a hop; I would not do it.
- If a server-side media pipeline becomes necessary (barge-in, server VAD, full-duplex), the usual homes are LiveKit Agents, Pipecat Cloud, Cloudflare Durable Objects or a Fly machine, not Supabase Edge.

### Gaps
- I did not research Cloudflare Workers/Durable Objects, Fly, LiveKit Cloud or Pipecat Cloud limits and pricing in detail; no cited facts for them here.
- Supabase request-body size limit is not stated on the limits page.
- Whether ElevenLabs single-use tokens can be pre-minted in bulk and what the rate limit on minting is: not found.

## 3. ElevenLabs Scribe v2 Realtime specifics

### Takeaway
Scribe v2 Realtime supports everything the current batch call relies on (forced `language_code`, keyterms, verbatim by default, manual commit), at about 0.12–0.14 s from end of speech to final transcript in independent tests, for $0.39/h vs $0.22/h batch. It is a different model from batch Scribe v2, with a smaller keyterm budget (50 vs 1000) and a documented ~2 s warm-up before the first partial.

### Cited Findings
- Endpoint and query parameters: `model_id=scribe_v2_realtime` (only option), `token`, `audio_format` (`pcm_8000`, `pcm_16000` default, `pcm_22050`, `pcm_24000`, `pcm_44100`, `pcm_48000`, `ulaw_8000`), `language_code` (ISO 639-1/3), `secondary_languages`, `commit_strategy` (`manual`, `vad`, `turn_prediction`), `vad_threshold`, `vad_silence_threshold_secs`, `min_speech_duration_ms`, `min_silence_duration_ms`, `include_timestamps`, `include_language_detection`, `keyterms`, `no_verbatim` (default false, i.e. verbatim is the default), `entity_detection`, `transcript_edit`, `filter_background_audio`, `keepalive_interval_ms` (500–10000), `enable_logging`. — [ElevenLabs realtime API reference](https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime)
- Client message: `input_audio_chunk` with `audio_base_64`, `commit` (boolean), `sample_rate`, and `previous_text` (first chunk only). Only compressed-free input is accepted: PCM or μ-law, no AAC/Opus. — [ElevenLabs realtime API reference](https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime)
- Server messages: `session_started`, `partial_transcript`, `committed_transcript`, `committed_transcript_with_timestamps` (words with `start`, `end`, `logprob`), `committed_transcript_entities`, `edited_transcript`, `warning`. Errors include `commit_throttled`, `session_time_limit_exceeded`, `chunk_size_exceeded`, `insufficient_audio_activity`, `queue_overflow`, `rate_limited`. — [ElevenLabs realtime API reference](https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime)
- Manual commit is the default strategy; VAD commit is recommended for live mic input, with defaults of 1.5 s silence threshold, 0.4 VAD threshold, 100 ms min speech, 100 ms min silence. — [elevenlabs/skills realtime-commit-strategies](https://github.com/elevenlabs/skills/blob/main/speech-to-text/references/realtime-commit-strategies.md)
- "Committing manually several times in a short sequence can degrade model performance"; "Committing every 20-30 seconds is good practice"; transcription "begins after ~2 seconds of audio are sent"; send 0.1–1 s chunks; mono only; 16 kHz recommended; server closes after 15 s without client messages. — [ElevenLabs transcripts and commit strategies guide](https://elevenlabs.io/docs/eleven-api/guides/how-to/speech-to-text/realtime/transcripts-and-commit-strategies)
- Auto-commit without a manual commit: stated as 90 seconds in the ElevenLabs skills repo, but the docs page was summarised to me as "approximately 36 seconds of accumulated audio". — [elevenlabs/skills](https://github.com/elevenlabs/skills/blob/main/speech-to-text/references/realtime-commit-strategies.md); contradicted by [ElevenLabs commit strategies guide](https://elevenlabs.io/docs/eleven-api/guides/how-to/speech-to-text/realtime/transcripts-and-commit-strategies) (**conflict, verify before relying on it**)
- `previous_text` works best under 50 characters and errors if sent after the first chunk. — [ElevenLabs commit strategies guide](https://elevenlabs.io/docs/eleven-api/guides/how-to/speech-to-text/realtime/transcripts-and-commit-strategies)
- Keyterms: realtime supports up to 50 keyterms of 20 characters each; batch supports up to 1000 of 50 characters. Both list Spanish in the "Excellent (≤ 5% WER)" tier. Realtime latency is stated as "~150ms". — [ElevenLabs speech-to-text capabilities](https://elevenlabs.io/docs/overview/capabilities/speech-to-text)
- One aggregator claims keyterm prompting and entity detection "are not available for Scribe v2 Realtime". — [Puter ElevenLabs pricing tutorial](https://developer.puter.com/tutorials/elevenlabs-api-pricing/); contradicted by the official [API reference](https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime) and [capabilities page](https://elevenlabs.io/docs/overview/capabilities/speech-to-text), which I treat as authoritative.
- Pricing: batch Scribe v2 $0.22/h, keyterms +$0.05/h, entity detection +$0.07/h; realtime $0.39/h. — [opentranscription.io analysis](https://opentranscription.io/blog/elevenlabs-scribe-v2.html); [Puter pricing tutorial](https://developer.puter.com/tutorials/elevenlabs-api-pricing/). Artificial Analysis lists realtime at $6.50 per 1000 minutes (= $0.39/h). — [Artificial Analysis AA-WER Streaming](https://artificialanalysis.ai/articles/new-streaming-speech-to-text-benchmark-aa-wer-streaming)
- Launch claims: transcribes "in under 150 ms", next-word and punctuation prediction ("negative latency"), "93.5% accuracy across 30 commonly used European and Asian languages", 90 languages, text conditioning for reconnects. — [ElevenLabs: Introducing Scribe v2 Realtime](https://elevenlabs.io/blog/introducing-scribe-v2-realtime)
- Independent latency/accuracy (English-heavy test sets): Artificial Analysis (1 June 2026) measured Scribe v2 Realtime at 3.64% WER on the first final transcript, 0.14 s after VAD-detected end of speech; 3.65% / 0.13 s for first partial. — [Artificial Analysis AA-WER Streaming](https://artificialanalysis.ai/articles/new-streaming-speech-to-text-benchmark-aa-wer-streaming)
- Coval (rolling 30 days to 10 Oct 2026): time to final segment 123 ms mean (median 116, p95 198), WER 4.4%, but time to first token 2160 ms (24th of 26 models). — [Coval benchmark: Scribe v2 Realtime](https://benchmarks.coval.ai/models/scribe_v2_realtime)
- Batch Scribe v2 accuracy: 2.2–2.3% AA-WER on Artificial Analysis' batch leaderboard. — [opentranscription.io analysis](https://opentranscription.io/blog/elevenlabs-scribe-v2.html)

### Inferences
- Batch (about 2.2–2.3% AA-WER) is more accurate than realtime (about 3.6% AA-WER streaming), but these come from different benchmarks and test sets, so the gap is indicative only. Neither number is for Spanish learners.
- The "~2 s before transcription begins" note and Coval's 2.16 s time-to-first-token agree: partials do not appear in the first two seconds. For learner utterances shorter than 2 s ("Sí, dale"), the stream gives no partial at all and everything hinges on the commit. This must be tested on short utterances before committing to the design.
- For tap-to-stop, use `commit_strategy=manual` and send the last chunk with `commit: true` when the learner taps stop; expect the `committed_transcript` roughly 0.1–0.2 s later (benchmark figures; network round trip on mobile is extra).
- Faithfulness risks specific to realtime: next-word prediction means partials can contain words the learner has not said yet; `transcript_edit` and `no_verbatim` must stay off; with only 50 keyterms of 20 characters, the current keyterm list needs trimming per turn (e.g. the words of the current lesson/prompt).
- Cost: a 10 s utterance costs about $0.0011 realtime vs $0.0006 batch (+$0.00014 keyterms). Running both (hybrid) is about $0.0018 per utterance. Billing granularity for realtime (connected time vs audio time) was not found.

### Gaps
- No published Spanish-specific or non-native-speaker WER for Scribe v2 Realtime vs batch. This is the key unknown for "without losing transcript faithfulness" and needs an in-house A/B on real learner clips.
- Whether realtime normalises/auto-corrects learner errors more than batch at temperature 0 is unknown; realtime has no `temperature` parameter in the reference I read.
- Exact session time limit, concurrency limits per plan, the minimum audio needed before a commit (`commit_throttled` rule), and the true auto-commit threshold (36 s vs 90 s) were not confirmed.
- What `turn_prediction` commit strategy does and whether it supports Spanish: not documented in the pages I read.

## 4. Hybrid patterns

### Takeaway
Three patterns exist: (a) streaming partials for display plus a batch pass for the stored transcript, (b) uploading audio while recording so batch STT can start at stop, (c) speculative LLM start on partials. For tap-to-talk, (a) is easy and safe; (b) is blocked by ElevenLabs batch needing the whole file and by weak request-body streaming in React Native; (c) is what LiveKit does by default and saves a few hundred ms.

### Cited Findings
- LiveKit Agents enables "preemptive generation" by default: the LLM call fires on a stable partial transcript; if the final transcript differs, the speculative response is discarded and regenerated; only the LLM runs speculatively, TTS waits for turn confirmation. One optimisation guide claims 200–400 ms p95 savings. — [Future AGI: optimise LiveKit latency](https://futureagi.com/blog/how-to-optimize-livekit-latency-2026/) (vendor blog, figure **unverified**)
- A documented side effect: speculative turns that write to conversation memory leave junk messages unless run read-only. — [mastra issue #22873](https://github.com/mastra-ai/mastra/issues/22873)
- Pipecat has an open feature request for preemptive speech generation. — [pipecat issue #3321](https://github.com/pipecat-ai/pipecat/issues/3321)
- React Native's built-in `fetch` (XHR-based) does not implement streams. — [facebook/react-native issue #27741](https://github.com/facebook/react-native/issues/27741). `expo/fetch` adds streaming response bodies, with open bugs around cancel on Android. — [expo issue #51199](https://github.com/expo/expo/issues/51199)
- Per the fetch spec, a request with a `ReadableStream` body does not complete until the whole body is uploaded, which is incompatible with duplex streaming. — [whatwg/fetch issue #577](https://github.com/whatwg/fetch/issues/577)
- Soniox states its real-time and async products "run the same model with the same accuracy and features" ($0.12/h vs $0.10/h). — [Soniox pricing](https://soniox.com/pricing)
- `@siteed/audio-studio` can record raw PCM and a compressed file at the same time. — [npm @siteed/audio-studio](https://www.npmjs.com/package/@siteed/audio-studio)

### Inferences
- Pattern A (stream for speed, batch for truth). Stream PCM to Scribe Realtime, show partials, commit on stop tap, start Claude on the committed realtime transcript. In parallel (or only when needed) send the full audio to batch Scribe v2 and store that as the canonical transcript. The hard design question is what happens when the two disagree after the tutor has already replied with a correction. Options: (1) trust realtime for the turn and use batch only for analytics/quality monitoring; (2) gate on confidence, using realtime word `logprob`s (`include_timestamps=true`) and only waiting for batch when confidence is low; (3) always wait for batch, which gives no latency win. Option 2 is the usual compromise.
- Pattern B (upload while recording). ElevenLabs batch takes a complete file, so batch inference cannot start before the last byte regardless of chunking. What can be saved is only the upload time. With a 40–120 kB AAC clip (see section 6) upload is already small, so the gain is tens to low hundreds of ms on good networks. A websocket to your own server that buffers PCM and calls batch at stop is possible but lands on the Supabase relay limits from section 2. Low value for this app.
- Pattern C (speculative LLM). With tap-to-stop there is a cheaper variant: there is no endpointing delay to hide, so speculation only buys the ~0.15 s commit latency plus network. It is worth more if the system later moves to VAD turns. If used, keep speculative runs free of side effects (no DB writes, no streak/XP updates) until the final transcript matches.
- A simpler "prewarm" that is always safe: on mic press, open the STT websocket and send the Claude request prefix so prompt caching is warm; on stop, only the user turn is new.
- A vendor whose realtime and async models are the same (Soniox's claim) removes the need for pattern A entirely, at the cost of switching STT vendor and re-validating verbatim behaviour on learner Spanish.

### Gaps
- No published measurements of pattern A disagreement rates between Scribe v2 Realtime and batch.
- Whether `expo/fetch` in SDK 57 supports streaming *request* bodies on iOS/Android was not confirmed.
- The claim that ElevenLabs batch cannot accept a streamed/chunked upload and start early is my reading of the API shape, not a cited statement.

## 5. Endpointing: tap-to-talk vs VAD and semantic turn detectors

### Takeaway
With tap-to-stop the endpoint is known exactly, so manual commit removes the 0.3–1.5 s that VAD-based agents spend deciding the turn is over; this is the single biggest latency advantage the current UX has. Semantic turn detectors all support Spanish now but are tuned for native fluent speech, and at least one report shows more premature cut-offs in Spanish than English.

### Cited Findings
- ElevenLabs manual commit: you decide when the segment finalises; VAD mode commits after a silence threshold (default 1.5 s). — [elevenlabs/skills commit strategies](https://github.com/elevenlabs/skills/blob/main/speech-to-text/references/realtime-commit-strategies.md)
- Voice-agent budgets typically allot 150–300 ms to VAD and turn-taking. — [The Prompt Bench: latency budgets](https://thepromptbench.com/voice-and-realtime/latency-budgets-for-realtime-voice/) (secondary source)
- Pipecat Smart Turn v3 is an audio-native turn model covering 23 languages including Spanish, with CPU inference around 12 ms. — [Daily: Smart Turn v3](https://www.daily.co/blog/announcing-smart-turn-v3-with-cpu-inference-in-just-12ms/); [pipecat-ai/smart-turn](https://github.com/pipecat-ai/smart-turn)
- Smart Turn v3.1 added human Spanish samples; Spanish accuracy went from 86.7% (v3.0) to 90.1% (8 MB model) and 91.0% (32 MB model). — [Daily: Smart Turn v3.1](https://www.daily.co/blog/improved-accuracy-in-smart-turn-v3-1/)
- A third-party evaluation reports about double the premature-cutoff rate for Spanish vs English callers with Smart Turn v3 on phone audio. — [Evalgent blog](https://www.evalgent.com/blog/pipecat-interruption-strategy-smart-turn) (single source, **unverified**)
- LiveKit's multilingual turn detector supports English, French, Spanish, German, Italian, Portuguese, Dutch, Chinese, Japanese, Korean, Indonesian, Russian, Turkish; it works on STT text, needs about 400 MB RAM and ~25 ms per inference, and runs server-side in the agent. — [LiveKit turn detector docs](https://docs.livekit.io/agents/logic/turns/turn-detector/)
- Deepgram Flux Multilingual (GA 29 April 2026) covers 10 languages including Spanish with model-based end-of-turn, median EOT under 300 ms. — [Deepgram: Flux Multilingual](https://deepgram.com/learn/introducing-flux-multilingual); [SiliconANGLE](https://siliconangle.com/2026/04/29/deepgram-expands-flux-10-languages-mid-call-switching-voice-agents/)
- AssemblyAI Universal-Streaming multilingual covers English, Spanish, French, German, Italian, Portuguese with built-in end-of-turn detection and tunable `end_of_turn_confidence_threshold` / minimum turn silence. — [AssemblyAI multilingual streaming](https://www.assemblyai.com/blog/introducing-multilingual-universal-streaming); [AssemblyAI streaming docs](https://www.assemblyai.com/docs/streaming)
- Soniox's websocket API supports manual finalisation. — [Soniox API reference index](https://soniox.com/docs/api-reference) (detail page returned an error; **unverified** specifics)

### Inferences
- Keep tap-to-stop as the primary endpoint. Language learners pause mid-sentence to search for words, exactly the case where silence VAD and turn models trained on fluent speech cut people off.
- Trailing-audio padding: users often tap stop while the last syllable is still sounding, and the capture pipeline has buffered audio not yet delivered to JS. Keep capturing for roughly 200–300 ms after the tap (or flush the native buffer), send that tail, then send the commit. I found no vendor guidance giving a specific number, so tune it on device; the cost is that the same amount is added to latency.
- If hands-free mode is ever added, client-side Silero VAD only for a "you seem done, tap or keep going" hint is safer than auto-commit; server-side options that fit a Spanish tutor are Scribe `vad` with a long silence threshold or Smart Turn v3.1.
- ElevenLabs' advice to "always set VAD for microphone input" targets continuous sessions; for one short manual-commit utterance per connection, the 15 s inactivity close and auto-commit limits are what matter.

### Gaps
- No evidence on turn-detector accuracy for non-native, hesitant Spanish (L2 learners).
- No documented recommended tail padding before a manual commit for Scribe Realtime.

## 6. Audio format effects on accuracy and latency

### Takeaway
At 64 kbps mono AAC the current upload is already small and well above the bitrates where codecs measurably hurt recognition; format is not where the latency is. Streaming STT wants 16 kHz 16-bit mono PCM, which is 4x larger per second than the current AAC but is sent incrementally, so size stops mattering.

### Cited Findings
- Scribe Realtime accepts only raw PCM (8–48 kHz, 16-bit little-endian) or μ-law 8 kHz; 16 kHz is recommended "for optimal quality/bandwidth balance". — [ElevenLabs commit strategies guide](https://elevenlabs.io/docs/eleven-api/guides/how-to/speech-to-text/realtime/transcripts-and-commit-strategies); [API reference](https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime)
- In an Amazon far-field study, Opus at 16 kbps degraded WER by 12.6% relative vs uncompressed; at 8 kbps performance fell sharply as high-frequency content was lost. — [arXiv 2002.00122](https://arxiv.org/abs/2002.00122); related: [arXiv 2106.07994](https://arxiv.org/abs/2106.07994)
- Bluetooth HFP microphones deliver only 8 kHz or 16 kHz mono. — [Apple Developer Forums AVAudioEngine tag](https://developer.apple.com/forums/tags/avaudioengine)

### Inferences
- Sizes (arithmetic): AAC 64 kbps = 8 kB/s, so 5 s is about 40 kB and 15 s about 120 kB. PCM16 mono 16 kHz = 32 kB/s, so 160 kB and 480 kB; base64 in websocket JSON adds 33% (about 43 kB/s). Opus at 24 kbps would be 3 kB/s (15 kB / 45 kB).
- On a 1 Mbps uplink a 120 kB AAC clip takes about 1 s to upload; on 5 Mbps+ about 0.2 s; plus TLS/connection setup and multipart overhead. So on weak mobile networks the upload, not the 0.6 s STT, can dominate, and streaming during speech removes it. On good Wi-Fi/LTE the saving is closer to 0.1–0.3 s plus the STT time.
- Dropping AAC to 32 kbps mono would halve upload with little expected accuracy cost (the cited degradation appears at 16 kbps and below, on an older ASR system), but I have no modern-model data for AAC specifically, so treat that as a hypothesis to A/B.
- STT models work at 16 kHz internally; sending 44.1/48 kHz PCM only costs bandwidth. Resample to 16 kHz on device when the hardware gives 48 kHz, or declare the true rate.
- PCM streaming at 43 kB/s (base64) is fine on LTE/Wi-Fi but can back up on 2G/poor 3G; keep the recorded file as a fallback path to the existing batch endpoint.

### Gaps
- No study found measuring AAC 64 kbps vs lossless on modern STT (Scribe, Whisper-class) WER; the only hard numbers are for Opus on a 2020 Amazon system.
- No published upload-time measurements for short clips on real mobile networks; the numbers above are computed.
- Whether batch Scribe v2 accepts Opus/WebM uploads and its file-format list were not re-checked in this pass.

## 7. End-to-end latency budgets; speech-to-speech vs cascaded for a tutor

### Takeaway
A tuned cascaded agent lands around 600–800 ms from end of speech to first audio, and after the turn-end decision the largest remaining item is usually LLM time-to-first-token, not STT. Speech-to-speech models are faster and more natural but their transcripts are a side output that may not match the audio, which disqualifies them for a tutor that must show exactly what the learner said.

### Cited Findings
- Target: under 800 ms end-to-end, sub-500 ms for a conversational feel. Per-stage P95 budget: STT 100–300 ms, LLM TTFT 200–600 ms, TTS first audio 150–400 ms, network 20–100 ms, orchestration 20–50 ms. — [Future AGI: measuring voice AI latency](https://futureagi.com/blog/how-to-measure-voice-ai-latency-2026/) (vendor blog)
- Another breakdown for a well-tuned pipeline: 30–80 ms network, 150–300 ms VAD/turn-taking, 150–400 ms LLM TTFT, 100–200 ms TTS time-to-first-audio. — [The Prompt Bench](https://thepromptbench.com/voice-and-realtime/latency-budgets-for-realtime-voice/)
- Streaming lets stages overlap (LLM starts before STT finalises, TTS starts before the LLM finishes), which is how pipelines reach 600–800 ms. — [Retell AI: how real-time voice AI works](https://www.retellai.com/blog/how-real-time-voice-ai-works-stt-llm-tts)
- Streaming STT finals measured after end of speech: Deepgram Flux 0.02 s, Soniox 0.06 s, Deepgram Nova-3 0.057 s, Scribe v2 Realtime 0.14 s, Cartesia Ink-2 0.09–0.21 s, AssemblyAI U3 Realtime Pro 0.47 s (partial). Accuracy on the same test: Scribe 3.64%, Cartesia 3.59–3.66%, Nova-3 6.7%, Flux 7.36%, Soniox 11.9%. — [Artificial Analysis AA-WER Streaming, 1 June 2026](https://artificialanalysis.ai/articles/new-streaming-speech-to-text-benchmark-aa-wer-streaming)
- Coval's ranking differs: AssemblyAI Universal 3.6 at 2.1% WER / 140 ms, Scribe v2 Realtime 4.4% / 123 ms, Nova-3 5.4% / 85 ms, Flux 5.8% / 99 ms. — [Coval benchmark](https://benchmarks.coval.ai/models/scribe_v2_realtime)
- On Spanish, Soniox's own comparison reports 5.3% WER vs 10.1% for Deepgram. — [Soniox vs Deepgram (Spanish)](https://soniox.com/compare/soniox-vs-deepgram/spanish) (vendor-run, **treat as marketing**); this conflicts in spirit with Soniox's 11.9% on the Artificial Analysis English streaming set — [Artificial Analysis](https://artificialanalysis.ai/articles/new-streaming-speech-to-text-benchmark-aa-wer-streaming)
- Cascaded vs speech-to-speech: typical end-to-end 600–1200 ms cascaded vs 300–700 ms S2S; cascaded gives text at every stage, component choice and clean tool/guardrail insertion; S2S gives "audio in and audio out, plus an optional transcript that may not match". — [Soniox wiki: S2S vs pipelines](https://soniox.com/wiki/speech-to-speech-models-vs-pipelines); [Deepgram: S2S vs cascade](https://deepgram.com/learn/speech-to-speech-vs-cascade-voice-agent-architecture); [Future AGI: cascaded vs S2S](https://futureagi.com/blog/cascaded-voice-ai-vs-speech-to-speech-2026/) (all vendor sources with a stake in cascaded pipelines)

### Inferences
- For this app's current flow, estimated time from stop tap to transcript is upload (about 0.1–1 s depending on network) + edge cold/warm start + Scribe batch (about 0.6 s). Streaming with manual commit should cut that to roughly 0.15–0.3 s. That is a saving on the order of 0.5–1.5 s, the largest single win available on the input side.
- After that, the order of likely wins: (1) Claude time-to-first-token (smaller/faster model for the reply, prompt caching, short system prompt, streaming); (2) streaming Claude tokens straight into ElevenLabs TTS (websocket input streaming or sentence-chunked) and starting playback on first audio; (3) keeping connections warm (token pre-mint, websocket open on mic press); (4) region placement so the edge function, Anthropic and ElevenLabs endpoints are close.
- The repo memory notes Hablar already uses "one-request turns, correction-first"; streaming STT changes the first stage only and composes with that.
- Speech-to-speech (OpenAI Realtime, Gemini Live) is a poor fit here: the tutor's value is an exact transcript and corrections tied to it, Claude is the chosen LLM, and Agustín's ElevenLabs voice is a product decision. S2S models also tend to "understand through" learner errors, which is the opposite of what a correction feature needs (inference; no cited test on learner speech).
- Benchmarks disagree on vendor ranking (Soniox and AssemblyAI move a lot between test sets), so no public number substitutes for a test on real Posta learner clips.

### Gaps
- No independent, Spanish-specific streaming STT benchmark found, and nothing on Rioplatense Spanish or L2 learner speech.
- No measured Claude TTFT or ElevenLabs TTS first-audio figures were collected in this pass; the budget numbers are generic industry ranges from vendor blogs.
- Gemini Live and OpenAI Realtime transcript-fidelity behaviour was not researched from primary docs.

## 8. On-device STT as a first pass

### Takeaway
On-device recognition (Apple Speech, Android SpeechRecognizer) can give instant, free partials via `expo-speech-recognition`, with server STT as the source of truth, but it is weak exactly where a tutor needs strength: it auto-corrects toward native-like text, varies by device on Android, and competes for the microphone with your own recorder.

### Cited Findings
- `expo-speech-recognition` (jamsch) wraps iOS `SFSpeechRecognizer`, Android `SpeechRecognizer` and the Web Speech API; it needs a dev build with a config plugin. On-device mode: `requiresOnDeviceRecognition: true`, iOS 17+ fully supported, Android 13+ with a language-model download (`androidTriggerOfflineModelDownload()`). `lang` accepts locales such as `es-AR`/`es-ES`; check with `getSupportedLocales()`. — [jamsch/expo-speech-recognition](https://github.com/jamsch/expo-speech-recognition)
- It can persist the audio it hears (`recordingOptions: { persist: true }`, iOS and Android 13+, WAV) and can transcribe from a file (`audioSource.uri`; 16 kHz PCM WAV or MP3 on iOS). On iOS non-continuous mode stops after 3 s without speech; Android 12 and below lack continuous mode; Android plays unavoidable beeps in default mode unless `continuous` or `persist` is on. — [jamsch/expo-speech-recognition](https://github.com/jamsch/expo-speech-recognition)
- SpeechAnalyzer is Apple's iOS 26 replacement for SFSpeechRecognizer: long-form audio without the 1-minute cap, runs fully on-device. — [Fora Soft: iOS speech recognition in 2026](https://www.forasoft.com/blog/article/speech-recognition-with-neural-networks-on-ios-1621); [Callstack: SpeechAnalyzer with AI SDK](https://www.callstack.com/blog/on-device-speech-transcription-with-apple-speechanalyzer)
- `expo-speech-transcriber` supports SFSpeechRecognizer (iOS 13+), SpeechAnalyzer (iOS 26+) and Android SpeechRecognizer; its SpeechAnalyzer path is for pre-recorded files, iOS only. — [DaveyEke/expo-speech-transcriber](https://github.com/DaveyEke/expo-speech-transcriber)
- One blog says SpeechAnalyzer was "introduced in iOS 17". — [satisfies.dev](https://satisfies.dev/p/speech-to-text-in-expo-in-2026-sfspeechrecognize); contradicted by [Fora Soft](https://www.forasoft.com/blog/article/speech-recognition-with-neural-networks-on-ios-1621) and the [expo-speech-transcriber README](https://github.com/DaveyEke/expo-speech-transcriber), which say iOS 26. I believe iOS 26 is correct.
- The same blog notes Android quality "heavily depends on the device". — [satisfies.dev](https://satisfies.dev/p/speech-to-text-in-expo-in-2026-sfspeechrecognize)
- A 2026 overview of RN speech-to-text options exists and may be useful for the writer. — [Micdrop: Speech to Text in React Native 2026](https://micdrop.dev/blog/speech-to-text-react-native) (not read in full)

### Inferences
- Viable shape: run `expo-speech-recognition` with `persist: true` so one mic session yields both live partials and a WAV file, then send that WAV to batch Scribe v2 for the canonical transcript. This avoids two recorders fighting over the mic, but the WAV (16 kHz PCM, 32 kB/s) is 4x larger than today's AAC, so upload gets slower unless it is transcoded.
- This does not make the *final* transcript faster; it only improves perceived responsiveness. Showing an on-device partial that later changes to a different server transcript is a UX risk in a correction-focused tutor (the learner sees "tengo" then gets corrected for "teno").
- On-device recognisers have language-model priors toward well-formed Spanish and offer no verbatim/keyterm controls comparable to Scribe (iOS has `contextualStrings` only), so they should never be the stored transcript.
- If streaming Scribe Realtime is adopted (section 3), it already provides server-quality partials, which makes an on-device first pass redundant except as an offline/poor-network fallback.

### Gaps
- No data on SpeechAnalyzer or Android on-device accuracy for Spanish (es-AR) or learner speech.
- Whether `expo-speech-recognition` has adopted SpeechAnalyzer for live recognition on iOS 26 was not confirmed.
- WhisperKit and `react-native-executorch` (on-device Whisper) were not researched in this pass: no cited facts on model size, latency, battery or Spanish accuracy on phones.
