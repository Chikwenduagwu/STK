import type { RiskState } from "@/types";
/** Future onchain actions implement ExecutableAction. Today only advisory actions exist; nothing is executed. */
export interface Action { id: string; label: string; kind: "advisory" | "onchain"; minState: RiskState }
export interface ExecutableAction extends Action { kind: "onchain"; execute(): Promise<{ txHash: `0x${string}` }> }
const ORDER: RiskState[] = ["LOW", "ELEVATED", "HIGH", "CRITICAL"];
export const ACTIONS: Action[] = [{ id: "review", label: "Review position", kind: "advisory", minState: "HIGH" }];
export const availableActions = (s: RiskState) => ACTIONS.filter((a) => ORDER.indexOf(s) >= ORDER.indexOf(a.minState));
