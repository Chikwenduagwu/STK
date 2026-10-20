import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getAsset } from "@/lib/assets/registry";
import { listRecent } from "@/lib/genlayer/client";
import { assetRisk } from "@/lib/genlayer/risk";
import { evaluatePolicy } from "@/lib/policies/engine";
import { availableActions } from "@/lib/actions";
import { shortAddr, titleCase } from "@/lib/format";
import { EmptyState, EventRow, GlProblem, Logo, PageHeader, RiskIcon } from "@/components/ui/server";
import { CopyButton, OnchainDecimals, Tabs } from "@/components/ui/client";
import { EvaluateButton } from "@/components/EvaluateButton";
export const dynamic = "force-dynamic";

export default async function StockPage({ params }: { params: Promise<{ asset: string }> }) {
  const a = getAsset((await params).asset); if (!a) notFound();
  const recent = await listRecent(50);
  const risk = recent.status === "ok" ? assetRisk(a, recent.data) : null;
  const mine = recent.status === "ok" ? recent.data.filter((r) => r.record.asset === a.symbol) : [];
  const kv = (k: string, v: React.ReactNode) => <div className="kv"><span className="muted">{k}</span><span>{v}</span></div>;
  const overview = (<div className="card">
    {kv("Network", a.chainName)}
    {kv("Contract", <span className="inline-actions"><span className="mono">{shortAddr(a.address)}</span><CopyButton value={a.address} label="Copy contract address" /></span>)}
    {kv("Issuer", a.issuer)}{kv("Underlying", a.underlying)}
    {kv("Decimals", <OnchainDecimals address={a.address} />)}
    {kv("Explorer", <a className="ext" href={a.explorerUrl} target="_blank" rel="noreferrer">Etherscan <ExternalLink size={12} /></a>)}
    {kv("Issuer website", <a className="ext" href={a.officialUrl} target="_blank" rel="noreferrer">{new URL(a.officialUrl).host} <ExternalLink size={12} /></a>)}
    <p className="fine">{a.verificationNote}</p></div>);
  const events = recent.status !== "ok" ? <GlProblem status={recent.status} message={recent.status === "error" ? recent.message : recent.reason} />
    : mine.length === 0 ? <EmptyState title="No evaluations yet"><p>Run the first evaluation to set a risk state for this stock.</p></EmptyState>
    : <div className="list">{mine.map((r) => <EventRow key={r.id} e={{ id: r.id, symbol: a.symbol, slug: a.slug, type: titleCase(r.record.result.eventType), severity: r.record.result.severity, detected: r.record.result.eventDetected, state: evaluatePolicy(a.policy, r.record.result).state }} />)}</div>;
  const evidence = (<div className="list">{a.sources.map((s) => (<a key={s.url} className="row" href={s.url} target="_blank" rel="noreferrer">
    <div className="row-main"><strong>{s.label}</strong><span className="muted">{s.category.replace("_", " ").toLowerCase()}</span><span className="mono muted">{s.url}</span></div><ExternalLink size={16} className="muted" /></a>))}</div>);
  const policy = (<div className="list">{a.policy.rules.map((r) => <div className="row" key={r.id}><div className="row-main"><strong>{titleCase(r.eventType)}</strong><span className="muted">{r.minSeverity === "ANY" ? "Any severity" : `${titleCase(r.minSeverity)} or above`}</span></div><span className={`tag ${r.resultingState}`}>{r.resultingState}</span></div>)}</div>);
  return (<div className="stack">
    <PageHeader title={a.symbol} back="/stocks" />
    <div className="hero-row"><Logo symbol={a.symbol} slug={a.slug} size={56} /><div><h2>{a.symbol}</h2><span className="muted">{a.name}</span></div></div>
    <div className={`risk-box ${risk?.state ?? "none"}`}><RiskIcon state={risk?.state ?? null} size={22} />
      <div><span className="muted">Current risk state</span><strong>{recent.status !== "ok" ? "Unavailable" : risk?.state ? ({ LOW: "Low risk", ELEVATED: "Medium risk", HIGH: "High risk", CRITICAL: "Critical risk" } as const)[risk.state] : "Not yet evaluated"}</strong></div>
      {risk?.state && availableActions(risk.state).map((x) => <span key={x.id} className="pill">{x.label}</span>)}<EvaluateButton symbol={a.symbol} /></div>
    <Tabs tabs={[{ id: "ov", label: "Overview", node: overview }, { id: "ev", label: "Evaluations", node: events }, { id: "evd", label: "Sources", node: evidence }, { id: "pol", label: "Policy", node: policy }]} />
    <div className="cta-stack"><Link href={`/?to=${a.symbol}`} className="btn block">Swap {a.symbol}</Link><a className="btn block alt" href={a.uniswapUrl} target="_blank" rel="noreferrer">View on Uniswap</a></div>
  </div>);
}
