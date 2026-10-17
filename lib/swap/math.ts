import { formatUnits, parseUnits } from "viem";

export const SLIPPAGE_OPTIONS_BPS = [10, 50, 100] as const;

export function minAmountOut(amountOut: bigint, slippageBps: number): bigint {
  if (slippageBps < 0 || slippageBps >= 10_000) throw new Error("invalid slippage");
  return (amountOut * BigInt(10_000 - slippageBps)) / 10_000n;
}

/** Returns null for empty / invalid / zero / over-precise input. */
export function parseAmount(input: string, decimals: number): bigint | null {
  const s = input.trim();
  if (!/^\d*\.?\d*$/.test(s) || s === "" || s === ".") return null;
  const frac = s.split(".")[1] ?? "";
  if (frac.length > decimals) return null;
  try { const v = parseUnits(s, decimals); return v > 0n ? v : null; } catch { return null; }
}

export function formatAmount(raw: bigint, decimals: number, maxFrac = 6): string {
  const s = formatUnits(raw, decimals);
  const [i, f = ""] = s.split(".");
  const trimmed = f.slice(0, maxFrac).replace(/0+$/, "");
  return trimmed ? `${i}.${trimmed}` : i;
}

export function pickBest<T extends { amountOut: bigint }>(quotes: T[]): T | null {
  return quotes.reduce<T | null>((best, q) => (!best || q.amountOut > best.amountOut ? q : best), null);
}
