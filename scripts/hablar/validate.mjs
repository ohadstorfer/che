#!/usr/bin/env node
// Checks docs/hablar/scenarios.yaml: the schema, and the course's rioplatense
// rules over every Spanish field (see validate() in lib/content.mjs).
//
//   npm run hablar:validate [-- path/to/scenarios.yaml]
import { SCENARIOS, loadCultureIds, loadScenarios, recordableLines, validate } from './lib/content.mjs';

const path = process.argv[2] ?? SCENARIOS;
const doc = loadScenarios(path);
const errors = validate(doc, { cultureIds: loadCultureIds() });
if (errors.length) {
  console.log(`✗ ${path}`);
  for (const e of errors) console.log(`    ${e}`);
  process.exit(1);
}
const culture = Object.keys(doc.openers.culture).length;
console.log(
  `✓ ${path} — ${doc.scenarios.length} scenarios, ${culture} culture openers, ` +
    `${recordableLines(doc).length} lines to record`,
);
