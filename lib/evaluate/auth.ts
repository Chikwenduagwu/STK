import { verifyMessage, type Address, type Hex } from "viem";

export const MAX_SKEW_MS = 5 * 60_000;
export const buildMessage = (p: { symbol: string; eventType: string; issuedAt: number }) =>
  `STK evaluation request\nAsset: ${p.symbol}\nEvent: ${p.eventType}\nIssued: ${p.issuedAt}`;

export function isFresh(issuedAt: number, now = Date.now()) { return Number.isFinite(issuedAt) && Math.abs(now - issuedAt) <= MAX_SKEW_MS; }

export async function verifyRequest(a: { address: Address; signature: Hex; symbol: string; eventType: string; issuedAt: number }): Promise<boolean> {
  try { return await verifyMessage({ address: a.address, message: buildMessage(a), signature: a.signature }); } catch { return false; }
}

/** Best-effort in-memory limiter (per server instance). Serverless instances don't share memory, so this slows abuse rather than guaranteeing a cap. */
export class RateLimiter {
  private hits = new Map<string, number[]>();
  constructor(private windowMs: number, private max: number) {}
  take(key: string, now = Date.now()): boolean {
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (recent.length >= this.max) { this.hits.set(key, recent); return false; }
    recent.push(now); this.hits.set(key, recent);
    if (this.hits.size > 5000) for (const [k, v] of this.hits) if (v.every((t) => now - t >= this.windowMs)) this.hits.delete(k);
    return true;
  }
}
