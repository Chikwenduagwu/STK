import type { RiskState } from "@/types";
export const titleCase = (s: string) => s.toLowerCase().split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
export const RISK_LABEL: Record<RiskState, string> = { LOW: "Low Risk", ELEVATED: "Medium Risk", HIGH: "High Risk", CRITICAL: "Critical Risk" };
export type SeverityGroup = "high" | "medium" | "low";
export const severityGroup = (sev: string): SeverityGroup => (sev === "HIGH" || sev === "CRITICAL" ? "high" : sev === "MEDIUM" ? "medium" : "low");
export const shortAddr = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;
