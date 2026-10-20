import Link from "next/link";
import { Activity, BarChart3, ChevronRight, FileText, ShieldCheck } from "lucide-react";
import { ASSETS } from "@/lib/assets/registry";
import { getCount, listRecent } from "@/lib/genlayer/client";
import { assetBySymbol } from "@/lib/genlayer/risk";
import { evaluatePolicy } from "@/lib/policies/engine";
import { shortAddr, titleCase } from "@/lib/format";
import { EventRow, GlProblem, PageHeader } from "@/components/ui/server";
import { CopyButton } from "@/components/ui/client";
import { CountUp } from "@/components/ui/countup";
import { GENLAYER } from "@/lib/genlayer/config";
export const dynamic = "force-dynamic";
export const metadata = { title: "Overview" };

export default async function Dashboard() {
  const [count, recent] = await Promise.all([getCount(), listRecent(50)]);
  const rows = recent.status === "ok" ? recent.data : [];
  const detected = rows.filter((r) => r.record.result.eventDetected).length;
  const stats: [string, number | string, string, React.ReactNode][] = [
    ["Supported assets", ASSETS.filter((a) => a.supported).length, "yellow", <BarChart3 key="a" size={18} />],
    ["Events detected", recent.status === "ok" ? detected : "N/A", "red", <Activity key="b" size={18} />],
    ["Active policies", new Set(ASSETS.map((a) => a.policy.id)).size, "black", <ShieldCheck key="c" size={18} />],
    ["Evaluations", count.status === "ok" ? count.data : "N/A", "green", <FileText key="d" size={18} />],
  ];
  return (<div className="stack">
    <PageHeader title="Overview" />
    <div className="stat-grid">{stats.map(([label, v, tint, icon]) => (<div key={label} className={`stat ${tint}`}>
      <span className="stat-ico">{icon}</span><div className="muted">{label}</div><strong><CountUp value={v} /></strong></div>))}</div>
    <section><div className="sec-head"><h2>Recent evaluations</h2><Link href="/events" className="link-sm">View all</Link></div>
      {recent.status !== "ok" ? <GlProblem status={recent.status} message={recent.status === "error" ? recent.message : undefined} />
        : rows.length === 0 ? <div className="card muted">No evaluations yet. Run the first one from the swap screen button.</div>
        : <div className="list">{rows.slice(0, 5).map((r) => { const a = assetBySymbol(r.record.asset);
            return <EventRow key={r.id} e={{ id: r.id, symbol: r.record.asset, slug: a?.slug ?? null, type: titleCase(r.record.result.eventType), severity: r.record.result.severity, detected: r.record.result.eventDetected, state: a ? evaluatePolicy(a.policy, r.record.result).state : null }} />; })}</div>}</section>
    <div className="card"><div className="kv"><span className="muted">GenLayer contract</span><span className="inline-actions"><span className="mono">{shortAddr(GENLAYER.contractAddress)}</span><CopyButton value={GENLAYER.contractAddress} label="Copy contract address" /></span></div>
      <p className="fine"><a href={GENLAYER.explorerUrl} target="_blank" rel="noreferrer">View on the GenLayer Studio explorer</a></p></div>
    <Link href="/" className="card cta-card"><div><h3>Start swapping</h3><p>Trade tokenized stocks with a risk check on every asset.</p></div><ChevronRight size={20} /></Link>
  </div>);
}
