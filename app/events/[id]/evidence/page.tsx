import { notFound } from "next/navigation";
import { ExternalLink, FileText } from "lucide-react";
import { getEvaluation } from "@/lib/genlayer/client";
import { assetBySymbol } from "@/lib/genlayer/risk";
import { evaluatePolicy } from "@/lib/policies/engine";
import { isHttpsUrl } from "@/lib/validation/schemas";
import { titleCase } from "@/lib/format";
import { GlProblem, PageHeader } from "@/components/ui/server";
import { Tabs } from "@/components/ui/client";
export const dynamic = "force-dynamic";
export const metadata = { title: "Evidence" };

export default async function Evidence({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const r = await getEvaluation(id);
  if (r.status !== "ok") return <div className="stack"><PageHeader title="Evidence" back={`/events/${id}`} /><GlProblem status={r.status} message={r.status === "error" ? r.message : r.reason} /></div>;
  if (!r.data) notFound();
  const rec = r.data, res = rec.result, asset = assetBySymbol(rec.asset), out = asset ? evaluatePolicy(asset.policy, res) : null;
  const rule = asset?.policy.rules.find((x) => x.id === out?.triggeredRuleId);
  const sources = (<div className="list">{rec.sources.map((s) => { const cited = res.evidenceUrls.includes(s.url);
    return (<div className="row" key={s.url}><span className="ricon none"><FileText size={18} /></span><div className="row-main"><strong>{titleCase(s.category)}</strong>
      {isHttpsUrl(s.url) ? <a className="mono ext" href={s.url} target="_blank" rel="noreferrer">{s.url} <ExternalLink size={12} /></a> : <span className="muted">Invalid URL</span>}</div>
      <span className={`tag ${cited ? "LOW" : "none"}`}>{cited ? "Cited" : "Considered"}</span></div>); })}
    <p className="fine">Page excerpts and retrieval times are not stored onchain. Open a source to review the original.</p></div>);
  const analysis = (<div className="stack"><div className="card"><h3>Validator summary</h3><p>{res.reasoning || "No summary was recorded for this evaluation."}</p></div>
    <div className={`risk-box why ${out?.state ?? "none"}`}><div><strong>Why {out?.state ?? "this state"}?</strong>
      <p>{rule ? `The evaluated sources indicate a ${titleCase(res.eventType).toLowerCase()} event of ${res.severity.toLowerCase()} severity. The configured policy rule "${rule.id}" maps this to ${rule.resultingState}.` : "No policy rule was triggered, so the stock stays at its baseline Low risk state."}</p></div></div></div>);
  return <div className="stack"><PageHeader title="Evidence" back={`/events/${id}`} /><Tabs variant="seg" tabs={[{ id: "s", label: "Sources", node: sources }, { id: "a", label: "Analysis", node: analysis }]} /></div>;
}
