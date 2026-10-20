export type Phase = "queued" | "running" | "done" | "failed";
export interface EvalStatus { phase: Phase; step: 0 | 1 | 2 | 3; label: string; reason?: string }
export const STEPS = ["Request submitted", "Validators reviewing the evidence", "Consensus reached", "Result recorded"] as const;

interface TxLike { statusName?: string; txExecutionResultName?: string }
const RUNNING = new Set(["PROPOSING", "COMMITTING", "REVEALING", "APPEAL_REVEALING", "APPEAL_COMMITTING"]);
const DECIDED = new Set(["ACCEPTED", "FINALIZED", "READY_TO_FINALIZE"]);
const DEAD = new Set(["UNDETERMINED", "CANCELED", "VALIDATORS_TIMEOUT", "LEADER_TIMEOUT"]);

export function mapStatus(tx: TxLike | null | undefined): EvalStatus {
  if (!tx || !tx.statusName || tx.statusName === "UNINITIALIZED" || tx.statusName === "PENDING") return { phase: "queued", step: 0, label: STEPS[0] };
  if (RUNNING.has(tx.statusName)) return { phase: "running", step: 1, label: STEPS[1] };
  if (DECIDED.has(tx.statusName)) {
    if (tx.txExecutionResultName === "FINISHED_WITH_RETURN") return { phase: "done", step: 3, label: STEPS[3] };
    return { phase: "failed", step: 2, label: "Evaluation did not complete", reason: "The evidence sources could not be evaluated. A source may have been unavailable or blocked automated access." };
  }
  if (DEAD.has(tx.statusName)) return { phase: "failed", step: 2, label: "Evaluation did not complete", reason: "Validators could not reach a decision in time." };
  return { phase: "running", step: 1, label: STEPS[1] };
}
