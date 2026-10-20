import "server-only";
import { ASSETS } from "@/lib/assets/registry";
import { aggregateRisk, evaluatePolicy } from "@/lib/policies/engine";
import type { RiskState } from "@/types";
import type { EvaluationRecord } from "@/lib/validation/schemas";
import type { Asset } from "@/types/domain";

export interface Row { id: number; record: EvaluationRecord }
const WINDOW = 5;

/** Asset risk = highest policy state among its WINDOW most recent evaluations (rows are newest first). */
export function assetRisk(asset: Asset, rows: Row[]): { state: RiskState | null; count: number } {
  const mine = rows.filter((r) => r.record.asset === asset.symbol);
  if (!mine.length) return { state: null, count: 0 };
  return { state: aggregateRisk(mine.slice(0, WINDOW).map((r) => evaluatePolicy(asset.policy, r.record.result))), count: mine.length };
}

/** Risk state of an asset as of (and including) evaluation `id`, and just before it. */
export function riskAround(asset: Asset, rows: Row[], id: number): { before: RiskState | null; after: RiskState } {
  const upTo = rows.filter((r) => r.id <= id), prior = rows.filter((r) => r.id < id);
  return { before: assetRisk(asset, prior).state, after: assetRisk(asset, upTo).state ?? "LOW" };
}
export const assetBySymbol = (s: string) => ASSETS.find((a) => a.symbol === s);
