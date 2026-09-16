// Lets node's test runner import the app's TypeScript libs as they are written
// for Metro: extensionless relative imports, `@/` paths, and a Supabase client
// that must never load React Native. Pure logic is tested this way; anything
// that actually queries goes through the stub, which returns nothing.
//
//   node --import ./scripts/test/register.mjs --test …
import { register } from 'node:module';

register('./resolve.mjs', import.meta.url);
