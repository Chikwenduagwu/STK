"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useSignMessage } from "wagmi";
import { Check, RefreshCw, ShieldAlert, X } from "lucide-react";
import { getAssetBySymbol } from "@/lib/assets/registry";
import { buildMessage } from "@/lib/evaluate/auth";
import { buildQuestion, EVENT_OPTIONS } from "@/lib/evaluate/templates";
import { STEPS, type EvalStatus } from "@/lib/evaluate/status";
import { RISK_LABEL, titleCase } from "@/lib/format";
import type { EventType, RiskState } from "@/types";
import { useWalletModal } from "@/components/wallet/WalletModal";
import type { RiskResp } from "@/components/swap/RiskLine";

type Phase = "form" | "signing" | "submitting" | "tracking" | "done" | "failed";
type Latest = RiskResp & { latest?: { detected: boolean; eventType: string; severity: string } };

function LatestVerified({ symbol, data }: { symbol: string; data: Latest | null }) {
  if (!data || data.status !== "ok") return <div className="fallback-card"><strong>Latest verified result</strong><p className="muted fine">Earlier results are temporarily unavailable.</p></div>;
  if (data.state == null) return <div className="fallback-card"><strong>Latest verified result</strong><p className="muted fine">No earlier evaluation exists for {symbol} yet.</p></div>;
  return (<div className="fallback-card"><div className="row-head"><strong>Latest verified result</strong><span className={`tag ${data.state}`}>{RISK_LABEL[data.state as RiskState]}</span></div>
    <p className="fine" style={{ margin: 0 }}>{data.latest?.detected ? `${titleCase(data.latest.eventType)}, ${data.latest.severity.toLowerCase()} severity. ` : "No material event. "}
      Based on evaluation #{data.latestId}{data.stale ? " (cached)" : ""}. <Link href={`/events/${data.latestId}`}>View evidence</Link></p></div>);
}

export function EvaluateButton({ symbol, compact = false }: { symbol: string; compact?: boolean }) {
  const asset = getAssetBySymbol(symbol);
  const router = useRouter(), qc = useQueryClient();
  const { address, isConnected } = useAccount(), { signMessageAsync } = useSignMessage(), { open: openWallet } = useWalletModal();
  const [open, setOpen] = useState(false), [phase, setPhase] = useState<Phase>("form");
  const [eventType, setEventType] = useState<EventType>("REGULATORY");
  const [hash, setHash] = useState<string | null>(null), [status, setStatus] = useState<EvalStatus | null>(null);
  const [error, setError] = useState<string | null>(null), [latest, setLatest] = useState<Latest | null>(null);

  const loadLatest = useCallback(async (fresh = false) => {
    try { const r = await fetch(`/api/risk/${symbol}${fresh ? "?fresh=1" : ""}`); const j = (await r.json()) as Latest; setLatest(j); return j; } catch { setLatest(null); return null; }
  }, [symbol]);

  useEffect(() => { if (open) void loadLatest(); }, [open, loadLatest]);

  // Poll the evaluation until validators decide.
  useEffect(() => {
    if (phase !== "tracking" || !hash) return;
    let stop = false; const started = Date.now();
    const tick = async () => {
      if (stop) return;
      try {
        const r = await fetch(`/api/evaluate/status?hash=${hash}`); const s = (await r.json()) as EvalStatus; if (stop) return; setStatus(s);
        if (s.phase === "done") {
          const fresh = await loadLatest(true);
          await qc.invalidateQueries({ queryKey: ["risk", symbol] }); router.refresh();
          if (fresh) setPhase("done"); else setPhase("done"); return;
        }
        if (s.phase === "failed") { setError(s.reason ?? "The evaluation did not complete."); await loadLatest(); setPhase("failed"); return; }
      } catch { /* transient; keep polling */ }
      if (Date.now() - started > 8 * 60_000) { setError("The evaluation is taking longer than expected."); await loadLatest(); setPhase("failed"); return; }
      setTimeout(tick, 4000);
    };
    const id = setTimeout(tick, 2500); return () => { stop = true; clearTimeout(id); };
  }, [phase, hash, symbol, qc, router, loadLatest]);

  if (!asset) return null;
  const question = buildQuestion(asset.company, eventType);

  async function start() {
    if (!isConnected || !address) { openWallet(); return; }
    setError(null); setPhase("signing");
    const issuedAt = Date.now();
    let signature: string;
    try { signature = await signMessageAsync({ message: buildMessage({ symbol, eventType, issuedAt }) }); }
    catch { setPhase("form"); setError("The signature request was cancelled. No evaluation was started."); return; }
    setPhase("submitting");
    try {
      const res = await fetch("/api/evaluate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ symbol, eventType, issuedAt, address, signature }) });
      const j = (await res.json()) as { hash?: string; error?: string };
      if (!res.ok || !j.hash) { setError(j.error ?? "Could not start the evaluation."); await loadLatest(); setPhase("failed"); return; }
      setHash(j.hash); setStatus(null); setPhase("tracking");
    } catch { setError("Could not reach the evaluation service."); await loadLatest(); setPhase("failed"); }
  }
  function reset() { setPhase("form"); setHash(null); setStatus(null); setError(null); }
  const step = status?.step ?? 0;

  return (<>
    <button className="btn sm accent" onClick={() => setOpen(true)}><RefreshCw size={14} aria-hidden /> {compact ? "Evaluate" : "Run new evaluation"}</button>
    {open && <div className="overlay" onMouseDown={() => setOpen(false)}><div className="sheet" role="dialog" aria-modal="true" aria-label={`Evaluate ${symbol}`} onMouseDown={(e) => e.stopPropagation()}>
      <div className="sheet-head"><h3>Evaluate {symbol}</h3><button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button></div>

      {(phase === "form" || phase === "signing" || phase === "submitting") && (<>
        <p className="muted" style={{ margin: ".5rem 0 0" }}>Ask GenLayer validators to review public evidence and update {symbol}&apos;s risk state. This takes one to three minutes and costs you no gas.</p>
        <div className="ev-options" role="radiogroup" aria-label="Event type">{EVENT_OPTIONS.map((o) => (
          <button key={o.type} role="radio" aria-checked={eventType === o.type} data-on={eventType === o.type} className="ev-opt" onClick={() => setEventType(o.type)} disabled={phase !== "form"}><strong>{o.label}</strong><span>{o.hint}</span></button>))}</div>
        <div className="ev-q">{question}</div>
        <p className="ev-src">Sources: {asset.sources.map((s) => s.label).join(", ")}</p>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="cta" onClick={start} disabled={phase !== "form"}>{phase !== "form" && <span className="spin" aria-hidden />}
          {!isConnected ? "Connect wallet to continue" : phase === "signing" ? "Confirm the signature in your wallet" : phase === "submitting" ? "Starting evaluation..." : "Sign and start evaluation"}</button>
        <p className="fine">Your signature only authorizes this request. It does not move funds.</p>
        {error && <LatestVerified symbol={symbol} data={latest} />}</>)}

      {phase === "tracking" && (<>
        <p className="muted" style={{ margin: ".5rem 0 0" }}>Evaluating {symbol}. You can close this window; the risk state updates when the result is recorded.</p>
        <div className="progress" aria-live="polite">{STEPS.map((s, i) => <div key={s} className="pstep" data-s={i < step ? "done" : i === step ? "active" : "todo"}><span className="dot" />{s}</div>)}</div>
        <div className="pbar" aria-hidden><i /></div></>)}

      {phase === "done" && (<div className="success"><span className="check"><Check size={30} /></span><h3>Evaluation complete</h3>
        <p className="muted">{symbol} is now rated {latest?.state ? RISK_LABEL[latest.state as RiskState] : "updated"}.</p>
        {latest?.latestId != null && <Link className="link-sm" href={`/events/${latest.latestId}`}>View evidence</Link>}
        <button className="cta" onClick={() => { setOpen(false); reset(); }}>Back to swap</button></div>)}

      {phase === "failed" && (<>
        <div className="risk-box HIGH" style={{ marginTop: ".75rem" }}><ShieldAlert size={22} aria-hidden /><div><strong style={{ fontSize: "1rem" }}>New evaluation didn&apos;t complete</strong><span className="muted">{error}</span></div></div>
        <LatestVerified symbol={symbol} data={latest} />
        <p className="fine">Your swap isn&apos;t affected. The latest verified result above remains in effect.</p>
        <button className="cta" onClick={reset}>Try again</button></>)}
    </div></div>}
  </>);
}
