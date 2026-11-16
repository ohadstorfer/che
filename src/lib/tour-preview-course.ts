import { assemble, type Course } from './course';
import type { Lesson, Section, Unit } from './types';

// ---------------------------------------------------------------------------
// The course road as the paywall’s "Learn more" tour shows it: the first two
// units of section 1, as published on 2026-11-16, kept in the bundle so the
// preview draws the Course tab without reading anything. Nothing here is hers:
// she stands on the first lesson with nothing done. If those units are ever
// retitled, copy them again (sections, units and lessons rows, published).
// ---------------------------------------------------------------------------

const section: Section = { cefr: 'A1.1', id: 1, ordinal: 1, slug: 'first-words', title_en: 'First words' };

const unit = (u: Pick<Unit, 'id' | 'ordinal' | 'course_order' | 'slug' | 'title_en' | 'summary_en'>): Unit => ({
  ...u,
  section_id: section.id,
  grammar_focus: [],
  register_max: '',
  status: 'published',
});

const units: Unit[] = [
  unit({
    id: '7acbb453-0fe4-550b-87a1-c81f0f7e4bd3',
    ordinal: 1,
    course_order: 1,
    slug: 'un-cafe-por-favor',
    title_en: 'Order at a café',
    summary_en: 'Un café, por favor',
  }),
  unit({
    id: 'ecf3c9a9-33e3-5e2e-b2b7-aa09f082c128',
    ordinal: 2,
    course_order: 2,
    slug: 'otro-cafe',
    title_en: 'Order another drink and some toast',
    summary_en: 'Otro café y una tostada',
  }),
];

type Row = [unit: number, ordinal: number, kind: Lesson['kind'], title: string, id: string];
const rows: Row[] = [
  [0, 1, 'lesson', 'Lesson 1', 'bd4dc4d0-35c5-5619-9cd0-94fe274c2c1a'],
  [0, 2, 'lesson', 'Lesson 2', 'dbc87a42-a489-5610-85bc-ae962e85d575'],
  [0, 3, 'culture', 'Culture', 'cfda422c-b8b9-4d6f-ad29-9f00c1c02c66'],
  [0, 4, 'lesson', 'Lesson 3', '0bb58808-6701-5a0d-a899-a3a1599ecd32'],
  [0, 5, 'slang', 'Slang', 'c920908d-9cda-430f-bc47-d1445699f591'],
  [0, 6, 'practice', 'Practice', '39fa6adc-8a25-5483-ad63-961d2f5bd581'],
  [0, 7, 'speak', 'Speaking', 'a411b0f9-c6b3-47aa-ba7e-3cc643bf157c'],
  [0, 8, 'review', 'Unit check', '0ec1cf53-1a89-5331-85d0-f4162b940579'],
  [1, 1, 'lesson', 'Lesson 1', '917476fe-ea07-5ecd-937f-444d502efb39'],
  [1, 2, 'lesson', 'Lesson 2', '8f23fd7b-6254-555a-8f01-09687baab3c9'],
  [1, 3, 'culture', 'Culture', 'ee8f1c07-927a-460e-9ba9-da26fcd121a3'],
  [1, 4, 'lesson', 'Lesson 3', '7e318e7a-49b6-551c-aab5-b1eb20f37d80'],
  [1, 5, 'slang', 'Slang', '485cb9bc-a088-478b-a893-d79e2ab310ce'],
  [1, 6, 'practice', 'Practice', 'db492a81-d751-5e28-9679-eeab0a69448f'],
  [1, 7, 'speak', 'Speaking', 'b9dfca64-84b4-4096-864b-1e0c34dd28ec'],
  [1, 8, 'review', 'Unit check', '3f21e632-8a9a-5d7e-aa6a-223e18c72945'],
];

const lessons: Lesson[] = rows.map(([u, ordinal, kind, title_en, id]) => ({
  id,
  unit_id: units[u].id,
  ordinal,
  title_en,
  kind,
  status: 'published',
}));

export const previewCourse: Course = assemble([section], units, lessons, []);
