import { ShieldAlert } from "lucide-react";
import { DEFAULT_POLICY } from "@/lib/policies/engine";
import { titleCase } from "@/lib/format";
import { PageHeader } from "@/components/ui/server";
import { CopyButton, Tabs } from "@/components/ui/client";
export const metadata = { title: "Risk Policy" };
export default function Policies() {
  const list = (<div className="list">{DEFAULT_POLICY.rules.map((r) => (<div className="row" key={r.id}><span className={`ricon ${r.resultingState}`}><ShieldAlert size={18} /></span>
    <div className="row-main"><strong>{r.eventType}</strong><span className="muted">{r.minSeverity === "ANY" ? "Any Severity" : `${titleCase(r.minSeverity)}+ Severity`}</span><span className={`ok-text ${r.resultingState}`}>{"->"} {titleCase(r.resultingState)} Risk</span></div></div>))}
    <div className="row"><span className="ricon LOW"><ShieldAlert size={18} /></span><div className="row-main"><strong>NO_MATERIAL_EVENT</strong><span className="muted">Any Severity</span><span className="ok-text LOW">{"->"} Low Risk</span></div></div></div>);
  const settings = (<div className="stack"><div className="card"><h3>How policies work</h3>
    <p className="muted">GenLayer determines what happened. The policy determines what STK does with it. An asset&apos;s state is the highest policy state among its five most recent evaluations.</p>
    <p className="muted">Policies are code-defined (<span className="mono">lib/policies/engine.ts</span>) so they are deterministic and reviewable.</p></div>
    <div className="card inline-actions"><CopyButton value={JSON.stringify(DEFAULT_POLICY, null, 2)} label="Copy policy JSON" /><span>Copy policy as JSON</span></div></div>);
  return <div className="stack"><PageHeader title="Risk Policy" back="/more" /><Tabs variant="seg" tabs={[{ id: "p", label: "Policies", node: list }, { id: "s", label: "Settings", node: settings }]} /></div>;
}
