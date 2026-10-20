import { describe, expect, it } from "vitest";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { buildMessage, isFresh, RateLimiter, verifyRequest } from "../lib/evaluate/auth";
import { buildQuestion, EVENT_OPTIONS, isEventType } from "../lib/evaluate/templates";
import { mapStatus } from "../lib/evaluate/status";
import { EVENT_TYPES } from "../types";

describe("evaluation templates", () => {
  it("has a label and question for every event type", () => {
    expect(EVENT_OPTIONS.map((o) => o.type).sort()).toEqual([...EVENT_TYPES].sort());
    for (const t of EVENT_TYPES) expect(buildQuestion("Tesla", t)).toContain("Tesla");
  });
  it("rejects unknown event types", () => { expect(isEventType("REGULATORY")).toBe(true); expect(isEventType("DROP TABLE")).toBe(false); });
});
describe("evaluation auth", () => {
  const acct = privateKeyToAccount(generatePrivateKey());
  const p = { symbol: "NVDAx", eventType: "REGULATORY", issuedAt: 1_700_000_000_000 };
  it("accepts a valid wallet signature and rejects tampering or another signer", async () => {
    const signature = await acct.signMessage({ message: buildMessage(p) });
    expect(await verifyRequest({ address: acct.address, signature, ...p })).toBe(true);
    expect(await verifyRequest({ address: acct.address, signature, ...p, symbol: "TSLAx" })).toBe(false);
    const other = privateKeyToAccount(generatePrivateKey());
    expect(await verifyRequest({ address: other.address, signature, ...p })).toBe(false);
  });
  it("rejects garbage signatures without throwing", async () => { expect(await verifyRequest({ address: acct.address, signature: "0x12", ...p })).toBe(false); });
  it("enforces a time window", () => { expect(isFresh(1000, 1000 + 60_000)).toBe(true); expect(isFresh(1000, 1000 + 10 * 60_000)).toBe(false); expect(isFresh(NaN)).toBe(false); });
  it("rate limits per key and recovers after the window", () => {
    const r = new RateLimiter(1000, 1);
    expect(r.take("a", 0)).toBe(true); expect(r.take("a", 500)).toBe(false); expect(r.take("b", 500)).toBe(true); expect(r.take("a", 1500)).toBe(true);
  });
});
describe("evaluation status mapping", () => {
  it("maps lifecycle states", () => {
    expect(mapStatus(null).phase).toBe("queued");
    expect(mapStatus({ statusName: "PENDING" }).phase).toBe("queued");
    expect(mapStatus({ statusName: "COMMITTING" }).phase).toBe("running");
    expect(mapStatus({ statusName: "ACCEPTED", txExecutionResultName: "FINISHED_WITH_RETURN" }).phase).toBe("done");
  });
  it("treats a finalized rollback as a failure", () => {
    const s = mapStatus({ statusName: "FINALIZED", txExecutionResultName: "FINISHED_WITH_ERROR" });
    expect(s.phase).toBe("failed"); expect(s.reason).toBeTruthy();
  });
  it("treats timeouts and cancellations as failures", () => { expect(mapStatus({ statusName: "CANCELED" }).phase).toBe("failed"); expect(mapStatus({ statusName: "LEADER_TIMEOUT" }).phase).toBe("failed"); });
});
