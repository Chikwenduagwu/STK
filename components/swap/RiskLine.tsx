"use client";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { RiskState } from "@/types";

export interface RiskResp { status: string; state?: RiskState | null; evaluations?: number; latestId?: number }
export function useRisk(symbol?: string) {
  return useQuery<RiskResp>({
    queryKey: ["risk", symbol], enabled: !!symbol, staleTime: 60_000, retry: false,
    queryFn: async () => { const r = await fetch(`/api/risk/${symbol}`); if (!r.ok) throw new Error("risk"); return r.json(); },
  });
}
/** Gate buys when the state meets the user's threshold (default HIGH and above; CRITICAL is always gated). */
export const isGated = (r: RiskResp | undefined, pref: "HIGH" | "CRITICAL" = "HIGH") =>
  r?.status === "ok" && (r.state === "CRITICAL" || (pref === "HIGH" && r.state === "HIGH"));

export function RiskLine({ symbol, slug }: { symbol: string; slug?: string }) {
  const { data, isLoading, isError } = useRisk(symbol);
  let icon = <ShieldQuestion size={18} />, body: React.ReactNode;
  if (isLoading) body = <span className="skeleton" style={{ width: 160, height: 14 }} />;
  else if (isError || data?.status === "error") body = <span className="muted">Risk evaluation unavailable</span>;
  else if (data?.status === "unconfigured") body = <span className="muted">Risk evaluation not configured</span>;
  else if (data?.state == null) body = <span className="muted">Awaiting verification. No GenLayer evaluation yet.</span>;
  else { icon = isGated(data, "HIGH") ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />;
    body = <><span className={`tag ${data.state}`}>{data.state}</span><span className="muted"> from {data.evaluations} GenLayer evaluation{data.evaluations === 1 ? "" : "s"}</span></>; }
  return (<div className="risk-line"><span className="risk-ico">{icon}</span><div><strong>{symbol} risk</strong><div>{body}</div></div>
    {slug && <Link href={`/stocks/${slug}`} className="link-sm">Details</Link>}</div>);
}
