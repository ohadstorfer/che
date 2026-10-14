import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Dimensions, Platform } from 'react-native';

import { startGuest } from './guest';
import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Feedback: one chat per tester with the team (migration 20261014000002).
//
// The floating bubble (components/feedback.tsx) asks `feedbackAccess` whether
// it should show at all and how many replies are unread; the sheet reads and
// writes the thread here. Screenshots go to the private `feedback` bucket
// under her id and come back as signed URLs. After every write the app asks
// `feedback-notify` to push it to the other side.
//
// Before she has an account (the start of onboarding), sending makes her the
// same guest onboarding would have made a little later (guest.ts), so the
// thread and its replies are hers from the first message.
// ---------------------------------------------------------------------------

export type FeedbackMode = 'off' | 'everyone' | 'testers';

export interface FeedbackMessage {
  id: string;
  user_id: string;
  from_staff: boolean;
  body: string;
  /** Storage paths in the `feedback` bucket. */
  images: string[];
  context: FeedbackContext | null;
  created_at: string;
}

export interface FeedbackContext {
  route?: string;
  app?: string;
  platform?: string;
  os?: string;
  device?: string;
  screen?: string;
}

/** An image about to be sent: a local file (native) or a blob/data URL (web). */
export interface Attachment {
  uri: string;
  width: number;
  height: number;
  /** The screenshot taken when the bubble was pressed, as opposed to one from her photos. */
  auto?: boolean;
}

export const MAX_IMAGES = 4;
const BUCKET = 'feedback';

export async function feedbackAccess(): Promise<{ open: boolean; unread: number }> {
  try {
    const { data, error } = await supabase.rpc('feedback_access');
    if (error || !data) return { open: false, unread: 0 };
    const a = data as { open?: boolean; unread?: number };
    return { open: !!a.open, unread: a.unread ?? 0 };
  } catch {
    return { open: false, unread: 0 };
  }
}

export async function loadThread(userId: string): Promise<FeedbackMessage[]> {
  const { data, error } = await supabase
    .from('feedback_messages')
    .select('id, user_id, from_staff, body, images, context, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as FeedbackMessage[];
}

/** Signed URLs for screenshots, cached for as long as they stay good. */
const signed = new Map<string, { url: string; until: number }>();
const SIGN_SECONDS = 60 * 60;

export async function imageUrls(paths: string[]): Promise<Map<string, string>> {
  const now = Date.now();
  const missing = [...new Set(paths)].filter((p) => !((signed.get(p)?.until ?? 0) > now + 60_000));
  if (missing.length) {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(missing, SIGN_SECONDS);
    for (const row of data ?? []) {
      if (row.path && row.signedUrl) signed.set(row.path, { url: row.signedUrl, until: now + SIGN_SECONDS * 1000 });
    }
  }
  return new Map(paths.flatMap((p) => (signed.has(p) ? [[p, signed.get(p)!.url] as const] : [])));
}

export function feedbackContext(route: string): FeedbackContext {
  const { width, height } = Dimensions.get('window');
  return {
    route,
    app: Constants.expoConfig?.version ?? undefined,
    platform: Platform.OS,
    os: Platform.OS === 'web' ? undefined : `${Device.osName ?? Platform.OS} ${Device.osVersion ?? Platform.Version}`,
    device: Device.modelName ?? undefined,
    screen: `${Math.round(width)}×${Math.round(height)}`,
  };
}

async function upload(userId: string, a: Attachment): Promise<string> {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${userId}/${id}.jpg`;
  let body: Blob | Uint8Array;
  if (Platform.OS === 'web') {
    body = await (await fetch(a.uri)).blob();
  } else {
    const { File } = await import('expo-file-system');
    body = await new File(a.uri).bytes();
  }
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, { contentType: 'image/jpeg', upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

/** Ask for the push to the other side; a failed push never fails the message. */
function notify(id: string) {
  supabase.functions.invoke('feedback-notify', { body: { id } }).catch(() => {});
}

/** A tester's message into her own thread. Returns the stored row. */
export async function sendFeedback(body: string, attachments: Attachment[], context: FeedbackContext): Promise<FeedbackMessage> {
  if (!(await startGuest())) throw new Error('Could not connect. Check your internet and try again.');
  const { data: s } = await supabase.auth.getSession();
  const userId = s.session?.user.id;
  if (!userId) throw new Error('Could not connect. Check your internet and try again.');
  const images = await Promise.all(attachments.slice(0, MAX_IMAGES).map((a) => upload(userId, a)));
  const { data, error } = await supabase
    .from('feedback_messages')
    .insert({ user_id: userId, author_id: userId, body: body.trim(), images, context })
    .select('id, user_id, from_staff, body, images, context, created_at')
    .single();
  if (error) throw new Error(error.message);
  notify(data.id);
  return data as FeedbackMessage;
}

export async function markFeedbackRead() {
  await supabase.rpc('feedback_mark_read');
}

// --- the admin side -----------------------------------------------------------

export interface InboxThread {
  user_id: string;
  name: string | null;
  email: string | null;
  anonymous: boolean;
  tester: boolean;
  last_message_at: string;
  last_from_staff: boolean;
  preview: string;
  unread: number;
}

export interface FeedbackPerson {
  user_id: string;
  name: string | null;
  email: string | null;
  anonymous: boolean;
  /** 'auto' or 'admin' when she is a tester; null when she isn't. */
  tester: 'auto' | 'admin' | null;
}

export const personLabel = (p: { name: string | null; email: string | null; anonymous: boolean; user_id: string }) =>
  p.name || p.email || (p.anonymous ? `Guest ${p.user_id.slice(0, 6)}` : p.user_id.slice(0, 8));

export async function loadInbox(): Promise<InboxThread[]> {
  const { data, error } = await supabase.rpc('feedback_inbox');
  if (error) throw new Error(error.message);
  return (data ?? []) as InboxThread[];
}

export async function loadFeedbackMode(): Promise<FeedbackMode> {
  const { data } = await supabase.from('feedback_settings').select('mode').maybeSingle();
  return ((data?.mode as FeedbackMode) ?? 'off');
}

export async function setFeedbackMode(mode: FeedbackMode) {
  const { error } = await supabase
    .from('feedback_settings')
    .update({ mode, updated_at: new Date().toISOString() })
    .eq('id', true);
  if (error) throw new Error(error.message);
}

/** Testers, or with a search any user by email, name or id. */
export async function findPeople(q?: string): Promise<FeedbackPerson[]> {
  const { data, error } = await supabase.rpc('feedback_people', { q: q ?? null });
  if (error) throw new Error(error.message);
  return (data ?? []) as FeedbackPerson[];
}

export async function setTester(userId: string, on: boolean) {
  const { error } = on
    ? await supabase.from('feedback_testers').upsert({ user_id: userId, source: 'admin' }, { ignoreDuplicates: true })
    : await supabase.from('feedback_testers').delete().eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export async function sendReply(userId: string, body: string): Promise<FeedbackMessage> {
  const { data: s } = await supabase.auth.getSession();
  const me = s.session?.user.id;
  if (!me) throw new Error('not signed in');
  const { data, error } = await supabase
    .from('feedback_messages')
    .insert({ user_id: userId, author_id: me, from_staff: true, body: body.trim(), images: [] })
    .select('id, user_id, from_staff, body, images, context, created_at')
    .single();
  if (error) throw new Error(error.message);
  notify(data.id);
  return data as FeedbackMessage;
}

export async function markThreadRead(userId: string) {
  await supabase.rpc('feedback_mark_read_staff', { p_user: userId });
}
