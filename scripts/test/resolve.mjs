import { existsSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), '../..');
const STUB = pathToFileURL(resolvePath(ROOT, 'scripts/test/supabase-stub.mjs')).href;

export async function resolve(specifier, context, next) {
  const fromSrc = context.parentURL?.includes('/src/');
  if (fromSrc && /(^|\/)supabase$/.test(specifier)) return { url: STUB, shortCircuit: true };
  let spec = specifier;
  if (spec.startsWith('@/')) spec = pathToFileURL(resolvePath(ROOT, 'src', spec.slice(2))).href;
  const relative = spec.startsWith('.') || spec.startsWith('file:');
  if (relative && !/\.[cm]?[jt]sx?$|\.json$/.test(spec)) {
    const base = spec.startsWith('file:') ? fileURLToPath(spec) : resolvePath(dirname(fileURLToPath(context.parentURL)), spec);
    for (const ext of ['.ts', '.tsx', '/index.ts']) {
      if (existsSync(base + ext)) return next(pathToFileURL(base + ext).href, context);
    }
  }
  return next(spec, context);
}
