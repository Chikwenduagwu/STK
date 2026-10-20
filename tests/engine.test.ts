import { describe, expect, it } from "vitest";
import { DEFAULT_POLICY, aggregateRisk, evaluatePolicy } from "../lib/policies/engine";
import type { GenLayerResult } from "../types";

const r = (p: Partial<GenLayerResult>): GenLayerResult => ({
  eventDetected: true, eventType: "REGULATORY", severity: "HIGH", evidenceUrls: [], reasoning: "", ...p,
});

describe("evaluatePolicy", () => {
  it("no event -> LOW", () => {
    expect(evaluatePolicy(DEFAULT_POLICY, r({ eventDetected: false, eventType: "NONE", severity: "NONE" })).state).toBe("LOW");
  });
  it("regulatory HIGH -> HIGH", () => {
    expect(evaluatePolicy(DEFAULT_POLICY, r({})).state).toBe("HIGH");
  });
  it("regulatory LOW -> ELEVATED", () => {
    expect(evaluatePolicy(DEFAULT_POLICY, r({ severity: "LOW" })).state).toBe("ELEVATED");
  });
  it("trading halt of any severity -> CRITICAL", () => {
    expect(evaluatePolicy(DEFAULT_POLICY, r({ eventType: "TRADING_HALT", severity: "LOW" })).state).toBe("CRITICAL");
  });
  it("unmatched event type -> LOW with no rule", () => {
    expect(evaluatePolicy(DEFAULT_POLICY, r({ eventType: "LEGAL" }))).toEqual({ state: "LOW", triggeredRuleId: null });
  });
  it("aggregate takes the highest state", () => {
    expect(aggregateRisk([{ state: "ELEVATED", triggeredRuleId: "a" }, { state: "CRITICAL", triggeredRuleId: "b" }])).toBe("CRITICAL");
  });
});
