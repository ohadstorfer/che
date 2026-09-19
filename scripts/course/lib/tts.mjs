// Recording the course: which speaker says what, and the one call that turns a
// line into an mp3.
//
// The vendor is ElevenLabs (docs/course-spec.md §0). Nothing here writes to the
// database or to storage — tts.mjs does that — so every decision below can be
// read and tested on its own.

const API = 'https://api.elevenlabs.io/v1';

/** The key lives in the project's .env (see .env.example) unless already set. */
export function apiKey() {
  if (!process.env.ELEVENLABS_API_KEY) {
    try {
      process.loadEnvFile(new URL('../../../.env', import.meta.url));
    } catch {
      /* no .env: the check below reports it */
    }
  }
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY is not set — see .env.example');
  return key;
}

/**
 * The verbs after which what follows describes the speaker.
 *
 * `sos` and `es` are deliberately absent: they describe whoever is being spoken
 * to or spoken about, and say nothing about the voice. "¿Vos sos Lucía?" can be
 * asked by anyone.
 */
const FIRST_PERSON = new Set(['soy', 'estoy', 'llamo']);

/**
 * The gender the sentence commits its speaker to, or null if it commits to
 * none.
 *
 * A sentence that introduces its speaker has already cast the part: "Soy
 * Martín" is a man talking, whatever the rota would have picked. The test is
 * the token immediately after a first-person verb — a name, an adjective
 * ("Soy argentina"), a noun, a determiner — and whether that form carries a
 * gender. Only the next token, never a scan of the rest: "Soy de Córdoba" is
 * about a place, and looking further would find one.
 *
 * Merely naming someone is not the same as being them. "Gracias, Sofi" and "Sos
 * Lucía, ¿no?" name a woman and can still be said by either voice, which is why
 * this reads the grammar rather than looking for names anywhere in the line.
 */
export function speakerGender(tokens, formById) {
  const at = (i) => (tokens[i]?.form_ids ?? []).map((id) => formById.get(id)).filter(Boolean);
  for (let i = 0; i < tokens.length - 1; i++) {
    if (!at(i).some((f) => FIRST_PERSON.has(f.form))) continue;
    const gendered = at(i + 1).find((f) => f.features?.gender);
    if (gendered) return gendered.features.gender;
  }
  return null;
}

/**
 * Who says which line.
 *
 * Two passes. Clips whose own text names their speaker's gender go first and
 * get the only voice they can have. Everything else is then handed to whichever
 * voice has said least so far, which both keeps the split even and *absorbs*
 * the pinned ones — four forced lines in a row are paid back by the free ones
 * around them rather than skewing the unit.
 *
 * Deterministic, which matters as much as the balance: the clips are sorted by
 * something that does not move (a word's position in its unit, a sentence's own
 * text), and the caller passes *every* published clip, not just the ones still
 * missing a recording. Otherwise the row that was third yesterday is first
 * today and changes voice on a re-run.
 *
 * `voices` is in a fixed order; the caller sorts it by id so the pairing does
 * not depend on what the database happened to return first.
 */
/**
 * The lexicon says `m`/`f` — the grammarian's spelling, shared with every
 * adjective and noun in the course — while a voice is `male`/`female`, which is
 * about a person. They are the same distinction in two vocabularies, and this
 * is the one place they meet.
 */
const VOICE_GENDER = { m: 'male', f: 'female' };

export function assignVoices(clips, voices) {
  const ordered = [...clips].sort((a, b) => a.sortKey.localeCompare(b.sortKey, 'es'));
  const out = new Map();
  const said = new Map(voices.map((v) => [v.id, 0]));
  const give = (clip, voice) => {
    out.set(clip.id, voice);
    said.set(voice.id, said.get(voice.id) + 1);
  };

  for (const clip of ordered) {
    if (!clip.gender) continue;
    const voice = voices.find((v) => v.gender === VOICE_GENDER[clip.gender]);
    // No voice of that gender is a casting problem, not a reason to stop: it
    // falls through and the line is read by whoever is available.
    if (voice) give(clip, voice);
  }
  for (const clip of ordered) {
    if (out.has(clip.id)) continue;
    give(clip, voices.reduce((a, b) => (said.get(b.id) < said.get(a.id) ? b : a)));
  }
  return out;
}

/**
 * The text as it should be read aloud.
 *
 * A single word arrives without punctuation, and ElevenLabs reads a bare word
 * fast and flat — which is the opposite of what a learner hearing it for the
 * first time needs. A full stop makes it a complete utterance and it lands.
 * A line that already ends in punctuation is left exactly as written: the
 * question marks are what carry rioplatense intonation.
 */
export function spoken(text) {
  return /[.!?…]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`;
}

/**
 * Spanish either side of a word, which the model reads for context and never
 * says out loud.
 *
 * A short clip carries no language of its own. "mate" alone is a perfectly good
 * English word, so the model read it as one — and it is not about mate: `no`,
 * `van`, `con`, `sin`, `papa`, `sale`, `come` and `ten` are all waiting to go
 * the same way. Worse, a short clip does not give the model enough to settle
 * into the cloned speaker at all: "¿Jugo o agua?" came back in a voice that was
 * not Malena.
 *
 * This first went in for single words only, on the reasoning that a sentence is
 * its own context. That is true of a long sentence and false of a short one,
 * and a beginners' course is nothing but short sentences — unit 1 runs from 13
 * to 25 characters. So there is no kind test and no length threshold to tune:
 * every clip is made the same way.
 *
 * It is free. `previous_text` and `next_text` are context, not content: the
 * response's `character-cost` is identical with and without them, and nothing
 * here reaches the learner's ear.
 *
 * The carrier ends in a full stop before the clip begins, so the clip starts at
 * a sentence boundary and keeps its own intonation instead of inheriting the
 * melody of a phrase it was dropped into.
 */
export const CARRIER = {
  previous_text: 'Estamos aprendiendo español. ',
  next_text: ' Vamos a escucharla otra vez.',
};

/**
 * One clip, as mp3 bytes.
 *
 * `eleven_multilingual_v2` is the model that speaks the voices' own accent;
 * the turbo and flash models trade that away for latency this job does not
 * care about — nothing here is live, the clip is heard days later off a CDN.
 *
 * The settings favour being understood over sounding interesting: style at zero
 * so nothing is performed, speaker boost on for a phone speaker in a noisy
 * room, and stability high. Stability is what holds the clip to the voice it is
 * supposed to be — the looser setting let short lines drift off Malena
 * altogether. It costs some expressiveness, which a vocabulary clip can afford.
 *
 * Returns the clip and what ElevenLabs actually billed for it, which is not the
 * character count: the API reports it per request, and it is the only honest
 * figure to plan a recording budget from.
 */
export async function synthesize({ text, voice, key, fetchImpl = fetch }) {
  const res = await fetchImpl(`${API}/text-to-speech/${voice.provider_id}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({
      text: spoken(text),
      model_id: voice.model,
      ...CARRIER,
      voice_settings: { stability: 0.85, similarity_boost: 0.85, style: 0, use_speaker_boost: true },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`elevenlabs ${res.status}: ${detail.slice(0, 300)}`);
  }
  return {
    mp3: Buffer.from(await res.arrayBuffer()),
    cost: Number(res.headers.get('character-cost')) || 0,
  };
}

/**
 * Where a clip lives in the `audio` bucket.
 *
 * `cards/` and `sentences/` are the folders the app already records into
 * (uploadAudio in src/lib/audio.ts). The name carries the speaker and a stamp
 * because the bucket is served with a year of cache: a re-recorded line has to
 * arrive under a name no browser has seen, or half the learners keep the old
 * one forever.
 */
export const clipPath = (kind, id, voiceId, stamp = Date.now()) =>
  `${kind === 'form' ? 'cards' : 'sentences'}/${id}-${voiceId}-${stamp}.mp3`;
