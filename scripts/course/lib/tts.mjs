// Recording the course: which speaker says what, and the one call that turns a
// line into an mp3.
//
// The vendor is ElevenLabs (docs/course-spec.md §0). Nothing here writes to the
// database or to storage — tts.mjs does that — so every decision below can be
// read and tested on its own.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

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
 * The second man and the second woman: they speak only in a dialogue between
 * two people of the same gender, so they are not in public.voices and never in
 * the rota. Both from the ElevenLabs library, both labelled `argentine`.
 */
export const SECOND_VOICES = {
  male: { id: 'agustin', provider_id: 'ByVRQtaK1WDOvTmP1PKO', model: 'eleven_v4_turbo', gender: 'male' },
  female: { id: 'martina', provider_id: 'oq8K6jJPiW08295EbH2y', model: 'eleven_v4_turbo', gender: 'female' },
};

/** A dialogue's turns, dashes off: "—¿Un café? —Sí, gracias." → two. One line is not a dialogue. */
export function dialogueTurns(text) {
  const turns = text.split('—').map((t) => t.trim()).filter(Boolean);
  return text.trim().startsWith('—') && turns.length >= 2 ? turns : null;
}

/** Who has been cast in which dialogue (docs/dialogue-cast.json), by sentence id. */
export const loadDialogueCast = () =>
  JSON.parse(readFileSync(new URL('../../../docs/dialogue-cast.json', import.meta.url), 'utf8'));

/**
 * The voice of each speaker in a dialogue — two people, so never one voice.
 *
 * `cast` is the reading of the line (docs/dialogue-cast.json): `s1` and `s2` are
 * `m`, `f` or null, null where the text commits that speaker to nothing. A
 * cast read from different words than the sentence has now says nothing — the
 * line was edited since — and is ignored.
 *
 * A man and a woman wherever the text allows it, Tomás and Malena; a man and a
 * man is Tomás and Agustín, a woman and a woman Malena and Martina. Where the
 * text leaves both open, who speaks first is the sentence id's to decide, so it
 * is half and half across the course and the same on every run.
 */
export function castDialogue(id, text, cast, voices) {
  const turns = dialogueTurns(text);
  if (!turns) return null;
  const main = { m: voices.find((v) => v.gender === 'male'), f: voices.find((v) => v.gender === 'female') };
  const other = { m: 'f', f: 'm' };
  let { s1, s2 } = cast?.es === text ? cast : { s1: null, s2: null };
  if (!s1 && !s2) s1 = parseInt(createHash('sha256').update(id).digest('hex').slice(0, 2), 16) % 2 ? 'm' : 'f';
  s1 ??= other[s2];
  s2 ??= other[s1];
  const second = s1 === s2 ? SECOND_VOICES[VOICE_GENDER[s2]] : main[s2];
  // Speakers take turns, so a third line is the first speaker's again.
  return turns.map((_, i) => (i % 2 ? second : main[s1]));
}

/** What a dialogue's clip name says about who speaks in it: "tomas+malena". */
export const castLabel = (speakers) => speakers.map((v) => v.id).join('+');

/**
 * Whether a sentence's clip is the one its casting asks for. A dialogue's
 * casting is in its clip's name, since the row has room for one voice.
 */
export const recordedAs = (row, voice, speakers) =>
  speakers ? (row.audio_path ?? '').includes(`-${castLabel(speakers)}-`) : !row.voice_id || row.voice_id === voice.id;

/**
 * A dialogue as one clip: each turn in its own speaker's voice, end to end. A
 * clip ends on its own breath of silence and the next opens on one, which is
 * the pause between two people.
 */
export async function synthesizeDialogue({ text, speakers, key, fetchImpl = fetch }) {
  let cost = 0;
  const clips = [];
  for (const [i, turn] of dialogueTurns(text).entries()) {
    const take = await synthesize({ text: turn, voice: speakers[i], key, fetchImpl });
    cost += take.cost;
    clips.push(take.mp3);
  }
  return { mp3: joinMp3(clips), cost };
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

const VOICE_SETTINGS = { stability: 0.85, similarity_boost: 0.85, style: 0, use_speaker_boost: true };

/**
 * One clip, as mp3 bytes.
 *
 * The model is the voice's own (`voices.model`): `eleven_v4_turbo`, which holds
 * the voices' accent where the v2 turbo and flash models traded it away.
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
  if (needsSentence(text)) return cutFromSentence({ text, voice, key, fetchImpl });
  let best = null;
  let cost = 0;
  for (const body of takes(text)) {
    const res = await fetchImpl(`${API}/text-to-speech/${voice.provider_id}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({
        ...body,
        model_id: voice.model,
        voice_settings: VOICE_SETTINGS,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`elevenlabs ${res.status}: ${detail.slice(0, 300)}`);
    }
    cost += Number(res.headers.get('character-cost')) || 0;
    const mp3 = Buffer.from(await res.arrayBuffer());
    if (!best || mp3.length > best.length) best = mp3;
    if (best.length >= MIN_BYTES) break;
  }
  return { mp3: best, cost };
}

/**
 * The shortest clip that can be a word: 0.7 s at 128 kbps. The shortest real
 * ones in the course ("él", "de", "una") are just over it.
 */
export const MIN_BYTES = 11000;

/**
 * The shortest a clip of this text can be and still be speech. A word cut out
 * of a sentence has no silence around it, so "ya" is a quarter of a second and
 * right.
 */
export const minBytes = (text) => (needsSentence(text) ? 4000 : MIN_BYTES);

/**
 * The ways to ask for a line, in the order they are tried.
 *
 * `eleven_v4_turbo` answers a few dozen words with a fifth of a second of
 * nothing, the same way every time: "inglés", "tono", "música", "audio",
 * "guitarra", "río", "te". Most are words about sound, and inside the carrier
 * the model seems to take them as a direction rather than a line. A clip
 * shorter than a word can be is asked for again — capitalised, which is enough
 * for nearly all of them, and then with no carrier, which has never failed —
 * and the longest take is kept. A normal line stops at the first.
 */
function takes(text) {
  const line = spoken(text);
  const capital = line.charAt(0).toLocaleUpperCase('es') + line.slice(1);
  return [
    { text: line, ...CARRIER },
    ...(capital === line ? [] : [{ text: capital, ...CARRIER }]),
    { text: capital },
  ];
}

/**
 * A word on its own whose `ll` or `y` is the rioplatense "sh".
 *
 * Said alone, the model reads these the way most of the Spanish-speaking world
 * does: "llame" with a soft y, "vaya" like "vaia". Neither the carrier context,
 * nor the larger model, nor IPA, nor spelling it "shame" changes that. Inside a
 * spoken sentence the same voice says "shame" every time — so these words are
 * recorded in one and cut out of it.
 */
export const needsSentence = (text) => !/\s/.test(text.trim()) && /ll|y[aeiouáéíóúü]/i.test(text);

/**
 * The colon is what makes the word cuttable. Without it "dijo ella" is said in
 * one breath and the clip opens on the end of "dijo"; with it there is a
 * quarter of a second of silence before the word, and the comma leaves as much
 * after. Ending the sentence at the word instead leaves more, and loses the sh
 * one time in ten.
 */
const SENTENCE = ['Ella dijo: ', ', y listo.'];

/** What is kept either side of the word's own timings, in seconds: silence, both. */
const LEAD = 0.08;
const TAIL = 0.12;

async function cutFromSentence({ text, voice, key, fetchImpl }) {
  const word = text.trim().replace(/^[¡¿]+|[.!?…,]+$/g, '');
  const res = await fetchImpl(`${API}/text-to-speech/${voice.provider_id}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ text: `${SENTENCE[0]}${word}${SENTENCE[1]}`, model_id: voice.model, voice_settings: VOICE_SETTINGS }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`elevenlabs ${res.status}: ${detail.slice(0, 300)}`);
  }
  const cost = Number(res.headers.get('character-cost')) || 0;
  const { audio_base64, alignment } = await res.json();
  const at = alignment.characters.join('').indexOf(word, SENTENCE[0].length - 1);
  if (at < 0) throw new Error(`"${word}" is not in the timings of its own sentence`);
  const from = alignment.character_start_times_seconds[at] - LEAD;
  const to = alignment.character_end_times_seconds[at + word.length - 1] + TAIL;
  return { mp3: cutMp3(Buffer.from(audio_base64, 'base64'), from, to), cost };
}

/** A frame of 44.1 kHz MPEG-1 Layer III is 1152 samples. */
const FRAME_SECONDS = 1152 / 44100;
const BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];

/**
 * The stretch of an mp3 between two times, without decoding it.
 *
 * An mp3 is a row of frames that each stand nearly alone, so the cut is made
 * between frames and nothing is encoded a second time. "Nearly": a frame may
 * keep some of its data in the one before it, which is why the cut starts a
 * frame early — that frame is there to be borrowed from, and a decoder that
 * cannot use it plays it as silence. The cut is good to a frame, 26 ms, and the
 * margins around the word are wider than that.
 */
export function cutMp3(mp3, from, to) {
  const frames = framesOf(mp3);
  const first = Math.max(0, Math.floor(from / FRAME_SECONDS) - 1);
  const last = Math.min(frames.length, Math.ceil(to / FRAME_SECONDS) + 1);
  return Buffer.concat(frames.slice(first, last));
}

/**
 * Clips one after the other, as one mp3.
 *
 * The same frames, end to end — which is all an mp3 is once the tag in front
 * and the encoder's note are gone. The note matters most: it counts the frames
 * of the clip it came from, and a player that trusts it stops at the end of the
 * first speaker.
 */
export const joinMp3 = (clips) => Buffer.concat(clips.flatMap(framesOf));

/** An mp3's sound frames: the ID3 tag in front and the encoder's note left out. */
function framesOf(mp3) {
  let at = 0;
  if (mp3.subarray(0, 3).toString('latin1') === 'ID3')
    at = 10 + ((mp3[6] & 0x7f) << 21 | (mp3[7] & 0x7f) << 14 | (mp3[8] & 0x7f) << 7 | (mp3[9] & 0x7f));
  const frames = [];
  while (at + 4 <= mp3.length) {
    if (mp3[at] !== 0xff || (mp3[at + 1] & 0xfe) !== 0xfa) {
      at++;
      continue;
    }
    const kbps = BITRATES[mp3[at + 2] >> 4];
    if (!kbps || ((mp3[at + 2] >> 2) & 3) !== 0) throw new Error('not a 44.1 kHz mp3');
    const size = Math.floor((144000 * kbps) / 44100) + ((mp3[at + 2] >> 1) & 1);
    const frame = mp3.subarray(at, at + size);
    // The encoder's own note about the file, which is not sound.
    const note = frames.length === 0 && /Xing|Info/.test(frame.subarray(0, 48).toString('latin1'));
    if (!note) frames.push(frame);
    at += size;
  }
  return frames;
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
