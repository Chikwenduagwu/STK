import { notFound } from "next/navigation";
import Link from "next/link";
import { getEvaluation, listRecent } from "@/lib/genlayer/client";
import { assetBySymbol, riskAround } from "@/lib/genlayer/risk";
import { evaluatePolicy } from "@/lib/policies/engine";
import { titleCase } from "@/lib/format";
import { GlProblem, Logo, PageHeader, RiskTag } from "@/components/ui/server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Event details" };

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [r, recent] = await Promise.all([getEvaluation(id), listRecent(50)]);
  if (r.status !== "ok") return <div className="stack"><PageHeader title="Event Details" back="/events" /><GlProblem status={r.status} message={r.status === "error" ? r.message : r.reason} /></div>;
  if (!r.data) notFound();
  const rec = r.data, res = rec.result, asset = assetBySymbol(rec.asset);
  const outcome = asset ? evaluatePolicy(asset.policy, res) : null;
  const ctx = asset && recent.status === "ok" ? riskAround(asset, recent.data, id) : null;
  const kv = (k: string, v: React.ReactNode) => <div className="kv"><span className="muted">{k}</span><span>{v}</span></div>;
  return (<div className="stack">
    <PageHeader title="Event Details" back="/events" />
    <div className="hero-row"><Logo symbol={rec.asset} slug={asset?.slug} size={48} /><div><h2>{rec.asset}</h2>
      <span className="inline-actions"><span className="tag none">{res.eventDetected ? res.eventType : "NO EVENT"}</span>{outcome && <RiskTag state={outcome.state} />}</span></div></div>
    <div className="card">{kv("Event ID", `EVT-${String(id).padStart(6, "0")}`)}{kv("Detected", <span className="muted">Not recorded by contract</span>)}
      {kv("Status", <span className="tag LOW">Evaluated on GenLayer</span>)}
      {kv("Previous Risk", ctx ? (ctx.before ? <RiskTag state={ctx.before} /> : <span className="muted">No prior evaluation</span>) : <span className="muted">Data unavailable</span>)}
      {kv("New Risk", ctx ? <RiskTag state={ctx.after} /> : outcome ? <RiskTag state={outcome.state} /> : "Unavailable")}
      {kv("Policy triggered", outcome?.triggeredRuleId ?? "None")}</div>
    <div className="card"><h3>GenLayer Result</h3><p>{res.eventDetected ? `${titleCase(res.eventType)} event, ${res.severity.toLowerCase()} severity.` : "No material event detected."} {res.reasoning}</p>
      <p className="fine">Validator vote details are not exposed here; inspect the transaction on GenLayer for consensus data.</p></div>
    <Link href={`/events/${id}/evidence`} className="btn block">View Evidence</Link></div>);
}
