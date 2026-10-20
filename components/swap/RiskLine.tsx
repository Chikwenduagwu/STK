"use client";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { RiskState } from "@/types";
import { EvaluateButton } from "@/components/EvaluateButton";

export interface RiskResp { status: string; state?: RiskState | null; evaluations?: number; latestId?: number; stale?: boolean }
export function useRisk(symbol?: string) {
  return useQuery<RiskResp>({
    queryKey: ["risk", symbol], enabled: !!symbol, staleTime: 30_000, retry: 1,
    queryFn: async () => { const r = await fetch(`/api/risk/${symbol}`); if (!r.ok) throw new Error("risk"); return r.json(); },
  });
}
/** Gate buys when the state meets the user's threshold (default HIGH and above; CRITICAL is always gated). */
export const isGated = (r: RiskResp | undefined, pref: "HIGH" | "CRITICAL" = "HIGH") =>
  r?.status === "ok" && (r.state === "CRITICAL" || (pref === "HIGH" && r.state === "HIGH"));
const LABEL: Record<RiskState, string> = { LOW: "Low risk", ELEVATED: "Medium risk", HIGH: "High risk", CRITICAL: "Critical risk" };

export function RiskLine({ symbol, slug }: { symbol: string; slug?: string }) {
  const { data, isLoading, isError } = useRisk(symbol);
  let icon = <ShieldQuestion size={18} />, body: React.ReactNode, tone = "";
  if (isLoading) body = <span className="skeleton" style={{ width: 160, height: 14 }} />;
  else if (isError || data?.status === "error" || data?.status === "unconfigured") body = <span className="muted">Risk data is temporarily unavailable.</span>;
  else if (data?.state == null) body = <span className="muted">Not evaluated yet. Run the first evaluation.</span>;
  else { tone = data.state; icon = data.state === "HIGH" || data.state === "CRITICAL" ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />;
    body = <><span className={`tag ${data.state}`}>{LABEL[data.state]}</span><span className="muted"> from {data.evaluations} evaluation{data.evaluations === 1 ? "" : "s"}{data.stale ? " (last verified)" : ""}</span></>; }
  return (<div className={`risk-line ${tone}`}><span className="risk-ico">{icon}</span><div><strong>{symbol}</strong><div>{body}</div></div>
    <EvaluateButton symbol={symbol} compact />{slug && <Link href={`/stocks/${slug}`} className="link-sm">Details</Link>}</div>);
}
