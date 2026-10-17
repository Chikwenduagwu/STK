"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Star } from "lucide-react";
import type { RiskState } from "@/types";
import { RISK_LABEL } from "@/lib/format";
import { AssetLogo } from "@/components/ui/logo";

export interface StockRow { slug: string; symbol: string; name: string; state: RiskState | null; supported: boolean }
export function StocksBrowser({ rows }: { rows: StockRow[] }) {
  const [q, setQ] = useState(""), [tab, setTab] = useState<"all" | "supported" | "watch">("all"), [watch, setWatch] = useState<string[]>([]);
  useEffect(() => { try { setWatch(JSON.parse(localStorage.getItem("sg-watch") || "[]")); } catch {} }, []);
  const toggle = (s: string) => setWatch((w) => { const n = w.includes(s) ? w.filter((x) => x !== s) : [...w, s]; try { localStorage.setItem("sg-watch", JSON.stringify(n)); } catch {} return n; });
  const list = rows.filter((r) => `${r.symbol} ${r.name}`.toLowerCase().includes(q.toLowerCase()) && (tab === "all" || (tab === "supported" ? r.supported : watch.includes(r.slug))));
  return (<div className="stack">
    <label className="searchbar"><Search size={16} aria-hidden /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search assets..." aria-label="Search assets" /></label>
    <div className="chips">{([["all", "All"], ["supported", "Supported"], ["watch", "My Watchlist"]] as const).map(([k, l]) => <button key={k} data-on={tab === k} onClick={() => setTab(k)}>{l}</button>)}</div>
    {list.length === 0 ? <div className="card muted">{tab === "watch" ? "Your watchlist is empty. Tap the star on a stock to add it." : "No assets match."}</div> :
      <div className="list">{list.map((r) => (<div key={r.slug} className="row"><Link href={`/stocks/${r.slug}`} className="row-link" aria-label={`${r.symbol} details`} />
        <AssetLogo symbol={r.symbol} size={44} />
        <div className="row-main"><strong>{r.symbol}</strong><span className="muted">{r.name}</span>{r.state ? <span className={`tag ${r.state} inline`}>{RISK_LABEL[r.state]}</span> : <span className="tag none inline">Awaiting verification</span>}</div>
        <button className="icon-btn xs star" data-on={watch.includes(r.slug)} aria-pressed={watch.includes(r.slug)} aria-label={`Watch ${r.symbol}`} onClick={() => toggle(r.slug)}><Star size={16} /></button><ChevronRight size={18} className="muted" aria-hidden /></div>))}</div>}
  </div>);
}
