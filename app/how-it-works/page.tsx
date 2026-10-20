import { ArrowDown, Box, FileText, Globe, Hexagon, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/server";
export const metadata = { title: "How it works" };
const STEPS = [
  [Globe, "Public information", "Official filings, regulator notices and company announcements."],
  [Hexagon, "GenLayer validators", "Independent validators fetch the evidence and each reach their own judgment."],
  [FileText, "Semantic evaluation", "They agree on a structured result: whether the event occurred, its type and its severity."],
  [ShieldCheck, "Risk policy", "A transparent, deterministic policy maps the event to Low, Medium, High or Critical risk."],
  [Box, "Onchain state", "The risk state is recorded onchain and shown before every swap."],
] as const;
export default function How() {
  return (<div className="stack"><PageHeader title="How it works" back="/more" />
    <ol className="steps">{STEPS.map(([I, t, d], i) => (<li key={t}><span className="flow-ico"><I size={20} aria-hidden /></span><div><strong>{i + 1}. {t}</strong><p className="muted">{d}</p></div>{i < 4 && <ArrowDown className="step-arrow" size={16} aria-hidden />}</li>))}</ol>
    <div className="card"><h3>Why not an ordinary smart contract?</h3><p className="muted">A standard smart contract is deterministic: every node must compute the same result from the same inputs, so it cannot read a web page or judge what an announcement means. GenLayer lets validators fetch evidence and apply language-model judgment, then requires them to agree under an equivalence rule before a result is accepted.</p>
      <p className="muted" style={{ margin: 0 }}>STK does not predict prices. It reports whether specified real-world events occurred and what the configured policy says about them.</p></div></div>);
}
