#!/usr/bin/env node
// Bundles docs/hablar/scenarios.yaml into the two JSON files that ship it:
// src/lib/hablar.json for the app, and
// supabase/functions/_shared/hablar-content.json for the hablar-* functions.
// Refuses to write if the YAML fails validation.
//
// A line's `audio` is its path in the `audio` bucket once docs/hablar/audio.json
// (written by `npm run hablar:tts`) says it is recorded, and null until then.
//
//   npm run hablar:build
import { writeFileSync } from 'node:fs';

import {
  OUT_APP,
  OUT_FUNCTIONS,
  buildContent,
  loadCultureIds,
  loadManifest,
  loadScenarios,
  recordableLines,
  validate,
} from './lib/content.mjs';

const doc = loadScenarios();
const cultureIds = loadCultureIds();
const errors = validate(doc, { cultureIds });
if (errors.length) {
  console.log(`✗ docs/hablar/scenarios.yaml\n    ${errors.join('\n    ')}`);
  process.exit(1);
}

const content = buildContent(doc, loadManifest(), { cultureIds });
const json = JSON.stringify(content, null, 1) + '\n';
for (const out of [OUT_APP, OUT_FUNCTIONS]) writeFileSync(out, json);

const lines = recordableLines(doc).length;
const lineObjs = [
  ...content.scenarios.flatMap((s) => Object.values(s.versions).flatMap((v) => [v.opener, ...v.key_phrases])),
  ...Object.values(content.openers.free).flat(),
  ...Object.values(content.openers.culture),
];
const recorded = new Set(lineObjs.filter((l) => l.audio).map((l) => l.es)).size;
console.log(`wrote ${OUT_APP} and ${OUT_FUNCTIONS}: ${content.scenarios.length} scenarios, ` +
  `${Object.keys(content.openers.culture).length} culture openers, ${recorded}/${lines} lines with audio`);
