import { ShieldAlert } from "lucide-react";
import { DEFAULT_POLICY } from "@/lib/policies/engine";
import { titleCase } from "@/lib/format";
import { PageHeader } from "@/components/ui/server";
import { CopyButton, Tabs } from "@/components/ui/client";
export const metadata = { title: "Risk policy" };
const LABEL = { LOW: "Low", ELEVATED: "Medium", HIGH: "High", CRITICAL: "Critical" } as const;
export default function Policies() {
  const list = (<div className="list">{DEFAULT_POLICY.rules.map((r) => (<div className="row" key={r.id}><span className={`ricon ${r.resultingState}`}><ShieldAlert size={18} /></span>
    <div className="row-main"><strong>{titleCase(r.eventType)}</strong><span className="muted">{r.minSeverity === "ANY" ? "Any severity" : `${titleCase(r.minSeverity)} severity or above`}</span></div><span className={`tag ${r.resultingState}`}>{LABEL[r.resultingState]} risk</span></div>))}
    <div className="row"><span className="ricon LOW"><ShieldAlert size={18} /></span><div className="row-main"><strong>No material event</strong><span className="muted">Any evidence</span></div><span className="tag LOW">Low risk</span></div></div>);
  const settings = (<div className="stack"><div className="card"><h3>How the policy works</h3>
    <p className="muted">GenLayer determines what happened. The policy determines the risk state that follows. A stock&apos;s state is the highest result among its five most recent evaluations.</p>
    <p className="muted" style={{ margin: 0 }}>The policy is fixed and published, so every risk state can be reproduced from its evaluation.</p></div>
    <div className="card inline-actions"><CopyButton value={JSON.stringify(DEFAULT_POLICY, null, 2)} label="Copy policy as JSON" /><span>Copy policy as JSON</span></div></div>);
  return <div className="stack"><PageHeader title="Risk policy" back="/more" /><Tabs variant="seg" tabs={[{ id: "p", label: "Policies", node: list }, { id: "s", label: "About", node: settings }]} /></div>;
}
