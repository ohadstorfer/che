// TEMPORARY edge function: writes the unit chat scenes no learner has opened
// yet, in batches, so the first learner doesn't wait on (or fail at) it.
// Two steps, so every scene is reviewed before its opener is recorded:
//   { mode: "write", items: [{ unit_id, level }] } → the scenes, text only, nothing kept
//   { mode: "keep",  items: [{ unit_id, level, scenario }] } → opener recorded, scene kept
// Called with the anon key (verify_jwt stays on) and guarded by a one-off token (its SHA-256
// below). Delete the function once the backfill is done.

import { json } from "../_shared/cors.ts";
import { keepUnitScene, writeUnitScene } from "../_shared/hablar-unit.ts";
import {
  type Band,
  BANDS,
  hablarEnv,
  type Scenario,
  serviceClient,
} from "../_shared/hablar.ts";

const TOKEN_SHA256 =
  "236aedf1305a7fe3947ee899b328a982b4467247adf41f5e6bcbe6df10640fe3";

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type Item = { unit_id: string; level: Band; scenario?: Scenario };

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "POST only" }, { status: 405 });
  }
  if (
    await sha256(req.headers.get("x-backfill-token") ?? "") !== TOKEN_SHA256
  ) {
    return json({ error: "forbidden" }, { status: 403 });
  }
  const env = hablarEnv();
  if (!env) {
    return json({ error: "function is not configured" }, { status: 500 });
  }
  const db = serviceClient(env);

  const body = await req.json().catch(() => null) as {
    mode?: string;
    items?: Item[];
  } | null;
  const items = (body?.items ?? []).filter((i) =>
    typeof i?.unit_id === "string" && BANDS.includes(i.level)
  );
  if (
    !["write", "keep"].includes(body?.mode ?? "") || !items.length ||
    items.length > 12
  ) {
    return json({ error: "mode write|keep and 1–12 items" }, { status: 400 });
  }

  const results = await Promise.all(items.map(async (item) => {
    const t0 = Date.now();
    try {
      const { data: kept } = await db.from("unit_scenarios").select("unit_id")
        .eq("unit_id", item.unit_id).eq("level", item.level).maybeSingle();
      if (kept) return { ...item, scenario: undefined, status: "already_kept" };
      const { data: unit } = await db.from("units").select("id, title_en").eq(
        "id",
        item.unit_id,
      ).maybeSingle();
      if (!unit) return { ...item, scenario: undefined, status: "no_unit" };
      if (body!.mode === "write") {
        const scenario = await writeUnitScene(db, env, unit, item.level);
        return {
          ...item,
          scenario,
          status: scenario ? "written" : "not_written",
          ms: Date.now() - t0,
        };
      }
      if (
        !item.scenario?.opener?.es || item.scenario.id !== item.unit_id ||
        item.scenario.band !== item.level
      ) {
        return { ...item, scenario: undefined, status: "bad_scenario" };
      }
      const scene = await keepUnitScene(
        db,
        env,
        unit,
        item.level,
        item.scenario,
      );
      // A scene without its recording isn't kept here: it is taken back out,
      // to be kept again on a retry.
      if (!scene.opener.audio) {
        await db.from("unit_scenarios").delete().eq("unit_id", item.unit_id)
          .eq("level", item.level).is("scenario->opener->>audio", null);
        return { unit_id: item.unit_id, level: item.level, status: "tts_failed" };
      }
      return {
        unit_id: item.unit_id,
        level: item.level,
        status: "kept",
        audio: scene.opener.audio,
        ms: Date.now() - t0,
      };
    } catch (err) {
      return {
        ...item,
        scenario: undefined,
        status: "error",
        error: String(err),
      };
    }
  }));
  return json({ results });
});
