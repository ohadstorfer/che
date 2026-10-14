import type { Attachment } from './feedback';

// The web has no way to photograph the page it is on without a library that
// re-draws the whole DOM; testers there attach a screenshot from their files.
// The phones capture for real (screen-capture.native.ts).

export async function captureCurrentScreen(): Promise<Attachment | null> {
  return null;
}
