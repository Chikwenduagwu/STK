export const EVENT_TYPES = ["REGULATORY","CORPORATE_ACTION","TRADING_HALT","ISSUER_EVENT","LEGAL","SOLVENCY","REDEMPTION","MATERIAL_ANNOUNCEMENT"] as const;
export type EventType = (typeof EVENT_TYPES)[number];
export type Severity = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RiskState = "LOW" | "ELEVATED" | "HIGH" | "CRITICAL";
export type SourceCategory = "ISSUER_IR" | "REGULATOR" | "SEC_FILING" | "SECONDARY";

/** Parsed output of the contract's get_evaluation(...).result */
export interface GenLayerResult {
  eventDetected: boolean;
  eventType: EventType | "NONE";
  severity: Severity;
  evidenceUrls: string[];
  reasoning: string;
}

export interface PolicyRule {
  id: string;
  eventType: EventType;
  /** minimum severity that triggers the rule; "ANY" matches every detected event */
  minSeverity: Severity | "ANY";
  resultingState: RiskState;
  action?: string;
}
export interface RiskPolicy { id: string; name: string; rules: PolicyRule[] }
export interface PolicyOutcome { state: RiskState; triggeredRuleId: string | null }
