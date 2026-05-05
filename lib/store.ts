import { create } from "zustand";
import {
  StorageKeys,
  getJSON,
  setJSON,
  clearAll as clearAllStorage,
} from "./storage";
import {
  emptyStreak,
  recordSessionCompletion,
  reconcileStreak,
  todayLocalISO,
} from "./streak";
import { supabase, supabaseConfigured } from "./supabase";
import {
  getCurrentUser,
  signOut as authSignOut,
  subscribeToAuthChanges,
  type AuthUser,
} from "./auth";
import type {
  GenerateResponse,
  SessionRecord,
  Settings,
  StreakState,
} from "@/types/exercise";

const defaultSettings: Settings = {
  reminderTime: "08:00",
  notificationsEnabled: true,
  displayName: "",
};

type StoreState = {
  hydrated: boolean;
  userId: string | null;
  user: AuthUser | null;
  authError: string | null;
  streak: StreakState;
  settings: Settings;
  sessions: SessionRecord[];
  recentPrompts: string[];
  hydrate: () => Promise<void>;
  saveSession: (
    prompt: string,
    data: GenerateResponse
  ) => Promise<SessionRecord>;
  recordResult: (
    sessionId: string,
    correct: number,
    total: number
  ) => Promise<{
    isFirstToday: boolean;
    bumped: boolean;
    streak: StreakState;
  }>;
  setSettings: (next: Partial<Settings>) => Promise<Settings>;
  resetStreak: () => Promise<void>;
  clearAll: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  signOutAndReset: () => Promise<void>;
};

export const useStore = create<StoreState>((set, get) => ({
  hydrated: false,
  userId: null,
  user: null,
  authError: null,
  streak: emptyStreak,
  settings: defaultSettings,
  sessions: [],
  recentPrompts: [],

  hydrate: async () => {
    const [localStreak, localSettings, localSessions, localPrompts] =
      await Promise.all([
        getJSON<StreakState>(StorageKeys.streak),
        getJSON<Settings>(StorageKeys.settings),
        getJSON<SessionRecord[]>(StorageKeys.sessions),
        getJSON<string[]>(StorageKeys.prompts),
      ]);

    set({
      streak: reconcileStreak(localStreak ?? emptyStreak),
      settings: { ...defaultSettings, ...(localSettings ?? {}) },
      sessions: localSessions ?? [],
      recentPrompts: localPrompts ?? [],
    });

    let authError: string | null = null;
    let user: AuthUser | null = null;
    if (supabaseConfigured()) {
      user = await getCurrentUser();
    } else {
      authError = "supabase-not-configured";
    }
    const userId = user?.id ?? null;
    set({ userId, user, authError });

    if (userId) {
      await pullRemote(set, get);
    }

    if (!authSubscribed) {
      authSubscribed = true;
      subscribeToAuthChanges(async (nextUser) => {
        const wasUserId = get().userId;
        set({ userId: nextUser?.id ?? null, user: nextUser });
        if (nextUser?.id && nextUser.id !== wasUserId) {
          await pullRemote(set, get);
        }
      });
    }

    set({ hydrated: true });
  },

  saveSession: async (prompt, data) => {
    const id = newUuid();
    const record: SessionRecord = {
      id,
      topic: data.topic,
      prompt,
      data,
      createdAt: new Date().toISOString(),
    };
    const sessions = [record, ...get().sessions].slice(0, 50);
    const recentPrompts = [
      prompt,
      ...get().recentPrompts.filter((p) => p !== prompt),
    ].slice(0, 10);
    set({ sessions, recentPrompts });

    void Promise.all([
      setJSON(StorageKeys.sessions, sessions),
      setJSON(StorageKeys.prompts, recentPrompts),
    ]).catch((e) => console.warn("[che] persist sessions:", e));

    const userId = get().userId;
    if (userId) {
      void supabase
        .from("sessions")
        .insert({
          id,
          user_id: userId,
          topic: data.topic,
          prompt,
          data: data as unknown as Record<string, unknown>,
        })
        .then(({ error }) => {
          if (error) console.warn("[che] sessions insert:", error.message);
        });
    }

    return record;
  },

  recordResult: async (sessionId, correct, total) => {
    const sessions = get().sessions.map((s) =>
      s.id === sessionId ? { ...s, lastResult: { correct, total } } : s
    );
    set({ sessions });
    await setJSON(StorageKeys.sessions, sessions);

    const today = todayLocalISO();
    const userId = get().userId;

    if (userId) {
      const { data: rpcRow, error } = await supabase.rpc("bump_streak", {
        p_today: today,
      });
      if (!error && rpcRow) {
        const remote: StreakState = {
          currentStreak: rpcRow.current_streak,
          longestStreak: rpcRow.longest_streak,
          lastPracticeDate: rpcRow.last_practice_date,
        };
        const prev = get().streak;
        set({ streak: remote });
        await setJSON(StorageKeys.streak, remote);

        const { error: upErr } = await supabase
          .from("sessions")
          .update({ last_correct: correct, last_total: total })
          .eq("id", sessionId)
          .eq("user_id", userId);
        if (upErr) console.warn("[che] sessions update:", upErr.message);

        const isFirstToday = prev.lastPracticeDate !== today;
        const bumped = remote.currentStreak > prev.currentStreak;
        return { isFirstToday, bumped, streak: remote };
      }
      console.warn("[che] bump_streak failed, falling back local:", error?.message);
    }

    const { state, isFirstToday, bumped } = recordSessionCompletion(
      get().streak
    );
    set({ streak: state });
    await setJSON(StorageKeys.streak, state);
    return { isFirstToday, bumped, streak: state };
  },

  setSettings: async (next) => {
    const merged = { ...get().settings, ...next };
    set({ settings: merged });
    await setJSON(StorageKeys.settings, merged);

    const userId = get().userId;
    if (userId && next.displayName !== undefined) {
      await supabase
        .from("profiles")
        .upsert(
          { user_id: userId, display_name: merged.displayName || null },
          { onConflict: "user_id" }
        )
        .then(({ error }) => {
          if (error) console.warn("[che] profile upsert:", error.message);
        });
    }
    return merged;
  },

  resetStreak: async () => {
    set({ streak: emptyStreak });
    await setJSON(StorageKeys.streak, emptyStreak);
    const userId = get().userId;
    if (userId) {
      await supabase
        .from("streaks")
        .upsert({
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_practice_date: null,
        });
    }
  },

  clearAll: async () => {
    const userId = get().userId;
    set({
      streak: emptyStreak,
      settings: defaultSettings,
      sessions: [],
      recentPrompts: [],
    });
    await clearAllStorage();
    if (userId) {
      await Promise.all([
        supabase.from("sessions").delete().eq("user_id", userId),
        supabase.from("streaks").delete().eq("user_id", userId),
        supabase
          .from("push_subscriptions")
          .update({ notifications_enabled: false })
          .eq("user_id", userId),
      ]);
    }
  },

  refreshUser: async () => {
    const user = await getCurrentUser();
    set({ user, userId: user?.id ?? null });
    return user;
  },

  signOutAndReset: async () => {
    await authSignOut();
    set({
      userId: null,
      user: null,
      authError: null,
      streak: emptyStreak,
      settings: defaultSettings,
      sessions: [],
      recentPrompts: [],
    });
    await clearAllStorage();
  },
}));

let authSubscribed = false;

async function pullRemote(
  set: (partial: Partial<StoreState>) => void,
  get: () => StoreState
): Promise<void> {
  const userId = get().userId;
  if (!userId) return;

  const [streakRes, sessionsRes, profileRes, subRes] = await Promise.all([
    supabase.from("streaks").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("push_subscriptions")
      .select("reminder_time,notifications_enabled")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const next: Partial<StoreState> = {};

  if (streakRes.data) {
    const remote: StreakState = {
      currentStreak: streakRes.data.current_streak,
      longestStreak: streakRes.data.longest_streak,
      lastPracticeDate: streakRes.data.last_practice_date,
    };
    next.streak = reconcileStreak(remote);
    await setJSON(StorageKeys.streak, next.streak);
  }

  if (sessionsRes.data && sessionsRes.data.length > 0) {
    const remote: SessionRecord[] = sessionsRes.data.map((row) => ({
      id: row.id,
      topic: row.topic ?? "",
      prompt: row.prompt,
      data: row.data as unknown as GenerateResponse,
      createdAt: row.created_at,
      lastResult:
        row.last_correct != null && row.last_total != null
          ? { correct: row.last_correct, total: row.last_total }
          : undefined,
    }));
    next.sessions = remote;
    next.recentPrompts = uniq(remote.map((r) => r.prompt)).slice(0, 10);
    await Promise.all([
      setJSON(StorageKeys.sessions, remote),
      setJSON(StorageKeys.prompts, next.recentPrompts),
    ]);
  }

  const mergedSettings: Settings = {
    ...get().settings,
    ...(profileRes.data?.display_name
      ? { displayName: profileRes.data.display_name }
      : {}),
    ...(subRes.data
      ? {
          reminderTime: subRes.data.reminder_time,
          notificationsEnabled: subRes.data.notifications_enabled,
        }
      : {}),
  };
  next.settings = mergedSettings;
  await setJSON(StorageKeys.settings, mergedSettings);

  set(next);
}

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

function newUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function findSession(id: string): SessionRecord | undefined {
  return useStore.getState().sessions.find((s) => s.id === id);
}
