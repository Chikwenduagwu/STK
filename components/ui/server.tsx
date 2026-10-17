import Link from "next/link";
import { AlertTriangle, ArrowLeft, Inbox, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import type { RiskState } from "@/types";
import { RISK_LABEL } from "@/lib/format";
import { RetryButton } from "./client";
import { AssetLogo } from "./logo";

export function PageHeader({ title, back, right }: { title: string; back?: string; right?: React.ReactNode }) {
  return <div className="page-head">{back && <Link href={back} className="back" aria-label="Back"><ArrowLeft size={20} /></Link>}<h1>{title}</h1><div className="ph-right">{right}</div></div>;
}
export const Logo = ({ symbol, size = 44 }: { symbol: string; slug?: string | null; size?: number }) => <AssetLogo symbol={symbol} size={size} />;
export const RiskTag = ({ state }: { state: RiskState | null }) =>
  state ? <span className={`tag ${state}`}>{RISK_LABEL[state]}</span> : <span className="tag none">Awaiting</span>;
export function RiskIcon({ state, size = 18 }: { state: RiskState | null; size?: number }) {
  const I = state === "HIGH" || state === "CRITICAL" ? ShieldAlert : state ? ShieldCheck : ShieldQuestion;
  return <span className={`ricon ${state ?? "none"}`}><I size={size} aria-hidden /></span>;
}
export function EmptyState({ icon, title, children }: { icon?: React.ReactNode; title: string; children?: React.ReactNode }) {
  return <div className="state-card">{<span className="state-ico">{icon ?? <Inbox size={26} />}</span>}<h3>{title}</h3>{children}</div>;
}
export function GlProblem({ status, message }: { status: "unconfigured" | "error"; message?: string }) {
  return status === "unconfigured"
    ? <EmptyState icon={<AlertTriangle size={26} />} title="GenLayer not configured"><p className="muted">{message ?? "Set the contract address in lib/genlayer/config.ts."} No data is shown until a contract is connected.</p></EmptyState>
    : <EmptyState icon={<AlertTriangle size={26} />} title="GenLayer evaluation unavailable"><p className="muted">We couldn&apos;t fetch the latest evaluation from GenLayer. {message ? `(${message.slice(0, 120)})` : ""}</p><RetryButton /></EmptyState>;
}
export function EventRow({ e }: { e: import("@/types/domain").EventRowData }) {
  return (<Link href={`/events/${e.id}`} className="row">
    <RiskIcon state={e.detected ? e.state : null} />
    <div className="row-main"><strong>{e.symbol}</strong><span className="muted">{e.detected ? `${e.type} - ${e.severity.toLowerCase()}` : "No material event"}</span>
      <span className="meta">Evaluation #{e.id}</span></div>
    <div className="row-end">{e.detected ? <RiskTag state={e.state} /> : <span className="tag LOW">No event</span>}</div></Link>);
}
