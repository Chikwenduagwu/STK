import Link from "next/link";
import { Activity, BarChart3, ChevronRight, FileText, ShieldCheck } from "lucide-react";
import { ASSETS } from "@/lib/assets/registry";
import { getCount, listRecent } from "@/lib/genlayer/client";
import { assetBySymbol } from "@/lib/genlayer/risk";
import { evaluatePolicy } from "@/lib/policies/engine";
import { titleCase } from "@/lib/format";
import { EventRow, GlProblem, PageHeader } from "@/components/ui/server";
import { CopyButton } from "@/components/ui/client";
import { GENLAYER } from "@/lib/genlayer/config";
import { shortAddr } from "@/lib/format";
export const dynamic = "force-dynamic";
export const metadata = { title: "Overview" };

export default async function Dashboard() {
  const [count, recent] = await Promise.all([getCount(), listRecent(50)]);
  const rows = recent.status === "ok" ? recent.data : [];
  const detected = rows.filter((r) => r.record.result.eventDetected);
  const stats: [string, string | number, string, React.ReactNode][] = [
    ["Supported Assets", ASSETS.filter((a) => a.supported).length, "green", <BarChart3 key="a" size={18} />],
    ["Events Detected", recent.status === "ok" ? detected.length : "N/A", "blue", <Activity key="b" size={18} />],
    ["Active Policies", new Set(ASSETS.map((a) => a.policy.id)).size, "purple", <ShieldCheck key="c" size={18} />],
    ["GenLayer Evaluations", count.status === "ok" ? count.data : "N/A", "orange", <FileText key="d" size={18} />],
  ];
  return (<div className="stack">
    <PageHeader title="Overview" />
    <div className="stat-grid">{stats.map(([label, v, tint, icon], i) => (<div key={label} className={`stat ${tint} reveal`} style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
      <span className="stat-ico">{icon}</span><div className="muted">{label}</div><strong>{v}</strong></div>))}</div>
    <section><div className="sec-head"><h2>Recent Events</h2><Link href="/events" className="link-sm">View All</Link></div>
      {recent.status !== "ok" ? <GlProblem status={recent.status} message={recent.status === "error" ? recent.message : recent.reason} />
        : rows.length === 0 ? <div className="card muted">No verified material events found.</div>
        : <div className="list">{rows.slice(0, 5).map((r) => { const a = assetBySymbol(r.record.asset);
            return <EventRow key={r.id} e={{ id: r.id, symbol: r.record.asset, slug: a?.slug ?? null, type: titleCase(r.record.result.eventType), severity: r.record.result.severity, detected: r.record.result.eventDetected, state: a ? evaluatePolicy(a.policy, r.record.result).state : null }} />; })}</div>}</section>
    <div className="card"><div className="kv"><span className="muted">GenLayer contract ({GENLAYER.network})</span><span className="inline-actions"><span className="mono">{shortAddr(GENLAYER.contractAddress)}</span><CopyButton value={GENLAYER.contractAddress} label="Copy contract address" /></span></div>
      <p className="fine"><a href={GENLAYER.explorerUrl} target="_blank" rel="noreferrer">GenLayer Studio explorer</a> - chain {GENLAYER.chainId}, {GENLAYER.currency}</p></div>
    <Link href="/swap" className="card cta-card"><div><h3>Swap tokenized stocks</h3><p className="muted">Trade through Uniswap with a risk check on every stock.</p></div><ChevronRight size={20} /></Link>
  </div>);
}
