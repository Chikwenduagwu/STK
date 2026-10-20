import { beforeEach, describe, expect, it, vi } from "vitest";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const writeContract = vi.fn(async () => "0x" + "ab".repeat(32));
vi.mock("genlayer-js", () => ({ createClient: () => ({ writeContract }), createAccount: () => ({}) }));
vi.mock("genlayer-js/chains", () => ({ studionet: {} }));

import { POST } from "../app/api/evaluate/route";
import { buildMessage } from "../lib/evaluate/auth";

const user = privateKeyToAccount(generatePrivateKey());
async function req(over: Record<string, unknown> = {}, signer = user, claimed = signer) {
  const p = { symbol: "NVDAx", eventType: "REGULATORY", issuedAt: Date.now(), ...over };
  const signature = await signer.signMessage({ message: buildMessage(p as { symbol: string; eventType: string; issuedAt: number }) });
  return new Request("http://x/api/evaluate", { method: "POST", body: JSON.stringify({ ...p, address: claimed.address, signature }) });
}
beforeEach(() => { writeContract.mockClear(); process.env.OPERATOR_PRIVATE_KEY = "0x" + "11".repeat(32); });

describe("POST /api/evaluate", () => {
  it("is disabled without an operator key", async () => { delete process.env.OPERATOR_PRIVATE_KEY; expect((await POST(await req())).status).toBe(503); });
  it("submits a server-built question and registry sources, never client-supplied ones", async () => {
    const res = await POST(await req({ symbol: "NVDAx", eventType: "LEGAL" }, privateKeyToAccount(generatePrivateKey())));
    expect(res.status).toBe(200); expect((await res.json()).hash).toMatch(/^0x[0-9a-f]{64}$/);
    const args = (writeContract.mock.calls[0] as unknown as [{ args: string[] }])[0].args;
    expect(args[0]).toBe("NVDAx"); expect(args[1]).toBe("LEGAL"); expect(args[2]).toContain("NVIDIA");
    expect(JSON.parse(args[3])[0].url).toContain("federalregister.gov");
  });
  it("rate limits repeat requests", async () => { const a = privateKeyToAccount(generatePrivateKey()); await POST(await req({ eventType: "SOLVENCY" }, a)); expect((await POST(await req({ eventType: "SOLVENCY" }, a))).status).toBe(429); });
  it("rejects a signature from a different wallet", async () => {
    const other = privateKeyToAccount(generatePrivateKey());
    expect((await POST(await req({ eventType: "TRADING_HALT" }, other, user))).status).toBe(401); expect(writeContract).not.toHaveBeenCalled();
  });
  it("rejects expired, unknown-asset and unknown-event requests", async () => {
    expect((await POST(await req({ issuedAt: Date.now() - 3_600_000, eventType: "ISSUER_EVENT" }))).status).toBe(400);
    expect((await POST(await req({ symbol: "FAKEx", eventType: "ISSUER_EVENT" }))).status).toBe(400);
    expect((await POST(await req({ eventType: "DROP TABLE" }))).status).toBe(400);
  });
  it("reports a service error instead of crashing when submission fails", async () => {
    writeContract.mockRejectedValueOnce(new Error("insufficient funds"));
    const res = await POST(await req({ symbol: "TSLAx", eventType: "CORPORATE_ACTION" }, privateKeyToAccount(generatePrivateKey())));
    expect(res.status).toBe(502); expect((await res.json()).error).toContain("latest verified result");
  });
});
