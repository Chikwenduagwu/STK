import "server-only";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { parseRecord, type EvaluationRecord } from "@/lib/validation/schemas";

import { GENLAYER } from "./config";

export type Loaded<T> = { status: "ok"; data: T } | { status: "unconfigured"; reason?: string } | { status: "error"; message: string };

function setup() {
  const client = createClient({ chain: studionet, endpoint: GENLAYER.rpcUrl });
  return { client, address: GENLAYER.contractAddress as `0x${string}` };
}

export async function getCount(): Promise<Loaded<number>> {
  const s = setup();
  try { return { status: "ok", data: Number(await s.client.readContract({ address: s.address, functionName: "get_count", args: [] })) }; }
  catch (e) { return { status: "error", message: e instanceof Error ? e.message : "read failed" }; }
}

export async function getEvaluation(id: number): Promise<Loaded<EvaluationRecord | null>> {
  const s = setup();
  if (!Number.isInteger(id) || id < 0) return { status: "ok", data: null };
  try {
    const raw = await s.client.readContract({ address: s.address, functionName: "get_evaluation", args: [String(id)] });
    return { status: "ok", data: typeof raw === "string" && raw ? parseRecord(raw) : null };
  } catch (e) { return { status: "error", message: e instanceof Error ? e.message : "read failed" }; }
}

type Rows = { id: number; record: EvaluationRecord }[];
const TTL_MS = 30_000;
const cache = new Map<number, { at: number; value: Loaded<Rows> }>();

/** Most recent evaluations first. Successful reads are cached per instance for 30s to avoid N RPC calls per request. */
export async function listRecent(limit = 25): Promise<Loaded<Rows>> {
  const hit = cache.get(limit);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  const value = await listRecentUncached(limit);
  if (value.status === "ok") cache.set(limit, { at: Date.now(), value });
  return value;
}

async function listRecentUncached(limit: number): Promise<Loaded<Rows>> {
  const c = await getCount(); if (c.status !== "ok") return c;
  const ids = Array.from({ length: Math.min(limit, c.data) }, (_, i) => c.data - 1 - i);
  const rows = await Promise.all(ids.map(async (id) => ({ id, r: await getEvaluation(id) })));
  const bad = rows.find((x) => x.r.status === "error");
  if (bad && bad.r.status === "error") return { status: "error", message: bad.r.message };
  return { status: "ok", data: rows.flatMap((x) => (x.r.status === "ok" && x.r.data ? [{ id: x.id, record: x.r.data }] : [])) };
}
