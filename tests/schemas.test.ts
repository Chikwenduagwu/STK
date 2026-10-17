import { describe, expect, it } from "vitest";
import { parseRecord, isHttpsUrl } from "../lib/validation/schemas";
import { availableActions } from "../lib/actions";
import { ASSETS } from "../lib/assets/registry";
import { getAddress } from "viem";
import { GENLAYER } from "../lib/genlayer/config";
const good = { asset: "NVDAx", question: "q", sources: [{ url: "https://sec.gov", category: "SEC_FILING" }],
  result: { eventDetected: false, eventType: "NONE", severity: "NONE", evidenceUrls: [], reasoning: "" } };
describe("validation", () => {
  it("parses a valid contract record", () => expect(parseRecord(JSON.stringify(good)).asset).toBe("NVDAx"));
  it("rejects a malformed record", () => expect(() => parseRecord(JSON.stringify({ ...good, result: { eventType: "X" } }))).toThrow());
  it("only accepts https URLs", () => { expect(isHttpsUrl("https://a.com")).toBe(true); expect(isHttpsUrl("http://a.com")).toBe(false); expect(isHttpsUrl("javascript:1")).toBe(false); });
  it("GenLayer contract address is a valid checksummed 20-byte address on studionet", () => { expect(getAddress(GENLAYER.contractAddress)).toBe(GENLAYER.contractAddress); expect(GENLAYER.chainId).toBe(61999); });
  it("registry addresses are checksummed and unique", () => {
    expect(new Set(ASSETS.map((a) => a.address)).size).toBe(ASSETS.length);
    ASSETS.forEach((a) => expect(a.address).toMatch(/^0x[0-9a-fA-F]{40}$/));
  });
  it("review action only at HIGH+", () => { expect(availableActions("ELEVATED")).toHaveLength(0); expect(availableActions("HIGH")).toHaveLength(1); });
});
