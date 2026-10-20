import type { GenLayerResult, PolicyOutcome, RiskPolicy, RiskState, Severity } from "../../types";

const SEV: Record<Severity, number> = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
const STATE: Record<RiskState, number> = { LOW: 0, ELEVATED: 1, HIGH: 2, CRITICAL: 3 };

/** Deterministic: the highest state among matching rules wins; ties go to the earliest rule. */
export function evaluatePolicy(policy: RiskPolicy, result: GenLayerResult): PolicyOutcome {
  if (!result.eventDetected || result.eventType === "NONE") {
    return { state: "LOW", triggeredRuleId: null };
  }
  let best: PolicyOutcome = { state: "LOW", triggeredRuleId: null };
  for (const rule of policy.rules) {
    if (rule.eventType !== result.eventType) continue;
    if (rule.minSeverity !== "ANY" && SEV[result.severity] < SEV[rule.minSeverity]) continue;
    if (best.triggeredRuleId === null || STATE[rule.resultingState] > STATE[best.state]) {
      best = { state: rule.resultingState, triggeredRuleId: rule.id };
    }
  }
  return best;
}

export function aggregateRisk(outcomes: PolicyOutcome[]): RiskState {
  return outcomes.reduce<RiskState>((a, o) => (STATE[o.state] > STATE[a] ? o.state : a), "LOW");
}

/** Starting point only; policies are meant to be edited per asset. */
export const DEFAULT_POLICY: RiskPolicy = {
  id: "default-v1",
  name: "Default policy",
  rules: [
    { id: "halt-any", eventType: "TRADING_HALT", minSeverity: "ANY", resultingState: "CRITICAL" },
    { id: "reg-high", eventType: "REGULATORY", minSeverity: "HIGH", resultingState: "HIGH", action: "Review position" },
    { id: "reg-med", eventType: "REGULATORY", minSeverity: "LOW", resultingState: "ELEVATED" },
    { id: "redeem-any", eventType: "REDEMPTION", minSeverity: "MEDIUM", resultingState: "HIGH" },
    { id: "solv-any", eventType: "SOLVENCY", minSeverity: "MEDIUM", resultingState: "CRITICAL" },
  ],
};
