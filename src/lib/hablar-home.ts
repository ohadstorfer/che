import { type Band, type ConversationRow, getDefaultLevel, history, latestConversation } from './hablar';
import { chatsUsed } from './premium';

// ---------------------------------------------------------------------------
// What the Speaking tab reads before it can draw its top card: her latest
// chat, the ones before it, how many free chats she has used and her level.
// Kept from the last read — or read ahead, while she is still on Course — so
// the tab opens on the real card instead of an empty one. Reads only: closing
// a chat left open on an earlier day stays with the tab itself.
// ---------------------------------------------------------------------------

export interface HablarHome {
  latest: ConversationRow | null;
  past: ConversationRow[];
  /** Free chats used so far; null when she isn't on the free tier. */
  used: number | null;
  level: Band;
}

let last: { key: string; value: HablarHome } | null = null;

const keyOf = (userId: string, limited: boolean) => `${userId}:${limited}`;

export function peekHablarHome(userId: string | undefined, limited: boolean): HablarHome | null {
  return userId && last?.key === keyOf(userId, limited) ? last.value : null;
}

export async function loadHablarHome(userId: string, limited: boolean): Promise<HablarHome> {
  const [latest, past, used, level] = await Promise.all([
    latestConversation().catch(() => null),
    history().catch(() => []),
    limited ? chatsUsed(userId).catch(() => null) : Promise.resolve(null),
    getDefaultLevel().catch((): Band => 'A1'),
  ]);
  const value = { latest, past, used, level };
  last = { key: keyOf(userId, limited), value };
  return value;
}

/** After a stale chat is closed, the kept copy must not offer it again. */
export function forgetHablarLatest() {
  if (last) last = { ...last, value: { ...last.value, latest: null } };
}
