import { describe, expect, it, vi } from "vitest";
import { forward, validate } from "../lib/rpc/proxy";
const call = (method: string) => ({ jsonrpc: "2.0", id: 1, method, params: [] });
const res = (body: unknown, status = 200) => ({ ok: status < 400, status, json: async () => body }) as Response;
describe("rpc proxy", () => {
  it("allows read methods, including batches", () => { expect(validate(call("eth_call")).ok).toBe(true); expect(validate([call("eth_getBalance"), call("eth_blockNumber")]).ok).toBe(true); });
  it("rejects anything that can send or sign", () => {
    expect(validate(call("eth_sendRawTransaction")).ok).toBe(false); expect(validate(call("eth_sendTransaction")).ok).toBe(false);
    expect(validate([call("eth_call"), call("personal_sign")]).ok).toBe(false);
  });
  it("rejects malformed and oversized requests", () => { expect(validate({}).ok).toBe(false); expect(validate([]).ok).toBe(false); expect(validate(Array(101).fill(call("eth_call"))).ok).toBe(false); });
  it("falls through failing, rate-limited and unreachable upstreams to a working one", async () => {
    const f = vi.fn()
      .mockResolvedValueOnce(res({}, 503))
      .mockResolvedValueOnce(res({ jsonrpc: "2.0", id: 1, error: { code: -32005, message: "limit" } }))
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(res({ jsonrpc: "2.0", id: 1, result: "0x10" }));
    const r = await forward(call("eth_blockNumber"), ["https://a.test", "https://b.test", "https://c.test", "https://d.test"], f as unknown as typeof fetch);
    expect(r).toMatchObject({ ok: true, upstream: "d.test" });
  });
  it("reports the last failure when every upstream fails", async () => {
    const f = vi.fn().mockResolvedValue(res({}, 500));
    const r = await forward(call("eth_call"), ["https://a.test"], f as unknown as typeof fetch);
    expect(r.ok).toBe(false);
  });
});
