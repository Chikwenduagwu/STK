import { NextResponse } from "next/server";
import { getAssetBySymbol } from "@/lib/assets/registry";
import { listRecent } from "@/lib/genlayer/client";
import { aggregateRisk, evaluatePolicy } from "@/lib/policies/engine";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const asset = getAssetBySymbol((await params).symbol);
  if (!asset) return NextResponse.json({ status: "not_found" }, { status: 404 });
  const recent = await listRecent(50, { fresh: new URL(req.url).searchParams.get("fresh") === "1" });
  if (recent.status !== "ok") return NextResponse.json({ status: recent.status, message: (recent.status === "error" ? recent.message : recent.reason)?.slice(0, 200) });
  const mine = recent.data.filter((e) => e.record.asset === asset.symbol);
  if (mine.length === 0) return NextResponse.json({ status: "ok", state: null, evaluations: 0, stale: recent.stale === true });
  const state = aggregateRisk(mine.slice(0, 5).map((e) => evaluatePolicy(asset.policy, e.record.result)));
  const l = mine[0].record.result;
  return NextResponse.json({ status: "ok", state, evaluations: mine.length, latestId: mine[0].id, stale: recent.stale === true, latest: { detected: l.eventDetected, eventType: l.eventType, severity: l.severity } });
}
