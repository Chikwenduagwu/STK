"use client";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { SwapToken } from "@/lib/swap/tokens";
import { AssetLogo } from "@/components/ui/logo";

export function TokenBadge({ t, size = 32 }: { t: SwapToken; size?: number }) {
  return <AssetLogo symbol={t.symbol} size={size} />;
}

export function TokenModal({ open, tokens, disabled, onClose, onPick }: {
  open: boolean; tokens: SwapToken[]; disabled?: (t: SwapToken) => boolean; onClose: () => void; onPick: (t: SwapToken) => void;
}) {
  const [q, setQ] = useState(""); const ref = useRef<HTMLInputElement>(null);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => { if (open) { setQ(""); ref.current?.focus(); } }, [open]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [open]);
  if (!open) return null;
  const list = tokens.filter((t) => `${t.symbol} ${t.name}`.toLowerCase().includes(q.toLowerCase()));
  const group = (kind: SwapToken["kind"][], title: string) => {
    const items = list.filter((t) => kind.includes(t.kind)); if (!items.length) return null;
    return (<div key={title}><div className="sheet-group">{title}</div>{items.map((t) => (
      <button key={t.symbol} className="tok-row" disabled={disabled?.(t)} onClick={() => onPick(t)}>
        <TokenBadge t={t} /><span className="tok-meta"><strong>{t.symbol}</strong><span className="muted">{t.name}</span></span>
        {t.kind === "stock" && <span className="pill">Tokenized stock</span>}
      </button>))}</div>);
  };
  return (<div className="overlay" onMouseDown={onClose}>
    <div className="sheet" role="dialog" aria-modal="true" aria-label="Select a token" onMouseDown={(e) => e.stopPropagation()}>
      <div className="sheet-head"><h3>Select a token</h3><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
      <label className="search"><Search size={16} aria-hidden /><input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or symbol" /></label>
      <div className="sheet-list">{group(["stock"], "Stocks")}{group(["native", "quote"], "Tokens")}{list.length === 0 && <p className="muted" style={{ padding: "1rem" }}>No tokens found.</p>}</div>
    </div></div>);
}
