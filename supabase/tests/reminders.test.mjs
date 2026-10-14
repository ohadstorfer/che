// The reminder policy the send-reminder function runs, under node: when a
// learner is due one, which kind, and how the words are chosen.
//
//   npm run reminders:test
import assert from 'node:assert/strict';
import { test } from 'node:test';

const { decide, score, localParts, TEMPLATES, FAREWELL, FAREWELL_DAY } = await import(
  '../functions/_shared/reminder-policy.ts'
);

const TZ = 'America/Argentina/Buenos_Aires'; // UTC-3, no daylight saving
/** A moment given as Buenos Aires wall time. */
const at = (date, time) => new Date(`${date}T${time}:00-03:00`);
const iso = (date, time) => at(date, time).toISOString();

/** Practised on the 13th at 19:00, with a 5-day streak. Today is the 14th. */
const learner = (over = {}) => ({
  timezone: TZ,
  anchorAt: iso('2026-10-01', '12:00'),
  streak: 5,
  lastPracticeDate: '2026-10-13',
  lastCompletedAt: iso('2026-10-13', '19:00'),
  lastRoundStartedAt: iso('2026-10-13', '18:55'),
  recent: [],
  ...over,
});
const sent = (slot, template, date, time) => ({ slot, template, sent_at: iso(date, time), local_date: date });
const skip = (l, date, time) => decide(l, at(date, time)).skip;
const slot = (l, date, time) => decide(l, at(date, time)).send?.slot;

test('the routine reminder goes out half an hour before the time she practised last', () => {
  assert.equal(skip(learner(), '2026-10-14', '08:00'), 'before-habit-time');
  assert.equal(skip(learner(), '2026-10-14', '18:15'), 'before-habit-time');
  assert.equal(slot(learner(), '2026-10-14', '18:30'), 'routine');
  assert.equal(slot(learner(), '2026-10-14', '20:00'), 'routine');
});

test('never before 08:00 or after 21:00, whatever her habit', () => {
  const owl = learner({ lastCompletedAt: iso('2026-10-13', '23:40') });
  assert.equal(skip(owl, '2026-10-14', '20:45'), 'before-habit-time');
  assert.equal(slot(owl, '2026-10-14', '21:00'), 'routine');
  const lark = learner({ lastCompletedAt: iso('2026-10-13', '05:30') });
  assert.equal(skip(lark, '2026-10-14', '07:45'), 'before-habit-time');
  assert.equal(slot(lark, '2026-10-14', '08:00'), 'routine');
});

test('nothing once she has practised today, or while she is in a round', () => {
  assert.equal(skip(learner({ lastPracticeDate: '2026-10-14' }), '2026-10-14', '18:30'), 'done-today');
  assert.equal(skip(learner({ lastPracticeDate: '2026-10-15' }), '2026-10-14', '18:30'), 'done-today');
  const playing = learner({ lastRoundStartedAt: iso('2026-10-14', '18:20') });
  assert.equal(skip(playing, '2026-10-14', '18:30'), 'in-a-round');
});

test('at most two a day: one routine, then one save in the evening for a live streak', () => {
  const afterRoutine = learner({ recent: [sent('routine', 'mate', '2026-10-14', '18:30')] });
  assert.equal(skip(afterRoutine, '2026-10-14', '18:45'), 'throttled');
  assert.equal(skip(afterRoutine, '2026-10-14', '20:30'), 'nothing-due');
  const save = decide(afterRoutine, at('2026-10-14', '21:00')).send;
  assert.equal(save.slot, 'save');
  assert.match(save.body, /5-day streak/);

  const afterBoth = learner({ recent: [...afterRoutine.recent, sent('save', save.template, '2026-10-14', '21:00')] });
  for (const time of ['21:15', '22:45', '23:30']) assert.equal(decide(afterBoth, at('2026-10-14', time)).send, undefined);
});

test('the save waits 90 minutes after a late routine, and is not sent past 23:00', () => {
  const late = learner({ recent: [sent('routine', 'mate', '2026-10-14', '21:00')] });
  assert.equal(skip(late, '2026-10-14', '22:15'), 'throttled');
  assert.equal(slot(late, '2026-10-14', '22:30'), 'save');
  assert.equal(skip(late, '2026-10-14', '23:00'), 'nothing-due');
});

test('no save without a streak to save', () => {
  const none = learner({ streak: 0, recent: [sent('routine', 'mate', '2026-10-14', '18:30')] });
  assert.equal(skip(none, '2026-10-14', '21:30'), 'nothing-due');
});

test('the longer she stays away the fewer she gets, then a farewell, then silence', () => {
  const days = [];
  for (let d = 14; d <= 31; d++) {
    const date = `2026-10-${d}`;
    const out = [];
    for (let h = 8; h < 24; h++) {
      const l = learner({ recent: out.map((o) => sent(o.slot, o.template, date, o.time)) });
      const time = `${String(h).padStart(2, '0')}:00`;
      const send = decide(l, at(date, time)).send;
      if (send) out.push({ ...send, time });
    }
    days.push(out.map((o) => (o.template === FAREWELL ? FAREWELL : o.slot)).join('+'));
  }
  assert.deepEqual(days.slice(0, 9), [
    'routine+save', // day 1: the streak is still alive
    'routine', 'routine', 'routine',
    '', 'routine', '',
    FAREWELL,
    '',
  ]);
  assert.ok(days.slice(9).every((d) => d === ''));
  assert.equal(skip(learner(), '2026-10-22', '19:00'), 'gone-quiet');
  assert.equal(FAREWELL_DAY, 8);
});

test('a frozen streak is named after a missed day, and never as something to save', () => {
  const bodies = new Set();
  for (let i = 0; i < 200; i++) bodies.add(decide(learner(), at('2026-10-15', '18:30'), new Map(), Math.random).send.body);
  assert.ok([...bodies].some((b) => /5-day streak is frozen/.test(b)));
  assert.ok([...bodies].every((b) => !/Keep your|Same time as yesterday/.test(b)));
});

test('reminders on but no round yet: nothing on the first day, a first-round message after', () => {
  const fresh = learner({
    anchorAt: iso('2026-10-14', '14:00'), streak: 0, lastPracticeDate: null, lastCompletedAt: null, lastRoundStartedAt: null,
  });
  assert.equal(skip(fresh, '2026-10-14', '14:15'), 'first-day');
  assert.equal(skip(fresh, '2026-10-15', '13:00'), 'before-habit-time');
  const send = decide(fresh, at('2026-10-15', '13:30')).send;
  assert.ok(['first_round', 'first_real'].includes(send.template));
  assert.equal(skip(fresh, '2026-10-15', '21:30'), 'nothing-due'); // window over, no streak to save
});

test('the day and the hour are hers, not the server\'s', () => {
  // 23:30 UTC on the 14th is 08:30 on the 15th in Tokyo.
  assert.deepEqual(localParts('Asia/Tokyo', new Date('2026-10-14T23:30:00Z')), { date: '2026-10-15', minutes: 510 });
  assert.deepEqual(localParts('Not/AZone', new Date('2026-10-14T23:30:00Z')), { date: '2026-10-14', minutes: 1410 });
});

test('a template she just got is all but ruled out; one from a month ago is back in play', () => {
  const count = (recent) => {
    let seq = 0;
    const random = () => ((seq += 0.6180339887) % 1);
    const seen = {};
    for (let i = 0; i < 2000; i++) {
      const { template } = decide(learner({ recent }), at('2026-10-14', '18:30'), new Map(), random).send;
      seen[template] = (seen[template] ?? 0) + 1;
    }
    return seen;
  };
  const fresh = count([]);
  const eligible = Object.keys(fresh);
  assert.ok(eligible.length >= 6);
  for (const id of eligible) assert.ok(Math.abs(fresh[id] - 2000 / eligible.length) < 40, `${id}: ${fresh[id]}`);

  const yesterday = count([sent('routine', 'mate', '2026-10-13', '12:00')]);
  assert.ok((yesterday.mate ?? 0) < 10);
  const lastMonth = count([sent('routine', 'mate', '2026-09-04', '12:00')]);
  assert.ok(lastMonth.mate > 2000 / eligible.length / 3);
});

test('a template only earns a preference once the evidence clears its own noise', () => {
  assert.equal(score(undefined), 0);
  // 4 of 20 against 10 of 100: twice the rate, but it could be luck.
  assert.equal(score({ chosen: 20, chosenWon: 4, passed: 100, passedWon: 10 }), 0);
  // The same rates over a few thousand sends are not luck.
  const better = score({ chosen: 4000, chosenWon: 800, passed: 20000, passedWon: 2000 });
  assert.ok(better > 0.5);
  const worse = score({ chosen: 4000, chosenWon: 200, passed: 20000, passedWon: 2000 });
  assert.ok(worse < -0.2);

  const stats = new Map([['mate', { chosen: 4000, chosenWon: 800, passed: 20000, passedWon: 2000 }]]);
  let seq = 0;
  const random = () => ((seq += 0.6180339887) % 1);
  const share = (recent) => {
    let n = 0;
    for (let i = 0; i < 1000; i++) {
      if (decide(learner({ recent }), at('2026-10-14', '18:30'), stats, random).send.template === 'mate') n++;
    }
    return n / 1000;
  };
  // Proven and not seen lately, it wins nearly every time; sent yesterday, it
  // is one among equals again, so she doesn't read the same line every day.
  assert.ok(share([]) > 0.98);
  const repeat = share([sent('routine', 'mate', '2026-10-13', '18:30')]);
  assert.ok(repeat > 0.05 && repeat < 0.35, String(repeat));
});

test('every template has its own id and something to say', () => {
  assert.equal(new Set(TEMPLATES.map((t) => t.id)).size, TEMPLATES.length);
  for (const t of TEMPLATES) assert.ok(t.body({ streak: 5, idle: 1, practised: true }).length > 10);
});

test('on a comeback day, one round in, the evening save asks for the second', () => {
  const comeback = learner({ streak: 1, banked: 22, lastPracticeDate: '2026-10-14', lastCompletedAt: iso('2026-10-14', '12:00') });
  assert.equal(skip(comeback, '2026-10-14', '18:30'), 'recovering');
  const save = decide(comeback, at('2026-10-14', '21:00')).send;
  assert.equal(save.slot, 'save');
  assert.ok(save.template.startsWith('recover_'));
  assert.match(save.body, /22-day/);
  const after = learner({ ...comeback, recent: [sent('save', save.template, '2026-10-14', '21:00')] });
  assert.equal(skip(after, '2026-10-14', '22:45'), 'recovering');
  assert.equal(skip(comeback, '2026-10-14', '23:00'), 'recovering');
});

test('a run left banked from an earlier day is no reason to remind', () => {
  // Only one round on the comeback day: the next day the banked run is gone.
  const lapsed = learner({ streak: 1, banked: 22, lastPracticeDate: '2026-10-13' });
  const save = decide(lapsed, at('2026-10-14', '21:00')).send;
  assert.ok(!save || !save.template.startsWith('recover_'));
  assert.equal(skip(learner({ banked: 0, lastPracticeDate: '2026-10-14' }), '2026-10-14', '21:00'), 'done-today');
});
