"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useConnect } from "wagmi";
import { ExternalLink, Wallet, X } from "lucide-react";
import { buildWalletOptions, type WalletOption } from "@/lib/wallet/options";
import { WALLET_LOGOS } from "@/lib/logos";

const Ctx = createContext<{ open: () => void }>({ open: () => {} });
export const useWalletModal = () => useContext(Ctx);

export function WalletList({ onDone }: { onDone?: () => void }) {
  const { connectors, connectAsync, isPending, variables } = useConnect();
  const [env, setEnv] = useState({ hasEthereum: false, isMobile: false, host: "" });
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setEnv({
    hasEthereum: typeof (window as unknown as { ethereum?: unknown }).ethereum !== "undefined",
    isMobile: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent), host: location.host,
  }), []);
  const options = buildWalletOptions({ ...env, connectors: connectors.map((c) => ({ id: c.id, name: c.name, type: c.type, icon: c.icon })) });

  async function pick(o: WalletOption) {
    if (o.action.kind !== "connect") return;
    const connector = connectors.find((c) => c.id === (o.action as { connectorId: string }).connectorId);
    if (!connector) { setError("That wallet isn't available in this browser."); return; }
    setError(null);
    try { await connectAsync({ connector, chainId: 1 }); onDone?.(); }
    catch (e) {
      const m = e instanceof Error ? e.message : "";
      setError(/rejected|denied|closed/i.test(m) ? "The connection request was cancelled." : m.slice(0, 160) || "Could not connect.");
    }
  }
  const row = (o: WalletOption) => {
    const a = o.action;
    const inner = (<>
      {(() => { const src = o.icon ?? WALLET_LOGOS[o.key]; return src ? <img src={src} alt="" width={36} height={36} className="w-ico" /> : <span className="w-ico mono-ico">{o.name[0]}</span>; })()}
      <span className="w-name">{o.name}</span>
      {a.kind === "link" && <span className="pill">{a.label} <ExternalLink size={12} aria-hidden /></span>}
      {a.kind === "unavailable" && <span className="pill">{a.reason}</span>}
      {a.kind === "connect" && isPending && variables?.connector && "id" in variables.connector && variables.connector.id === a.connectorId && <span className="spin" aria-hidden />}
    </>);
    return a.kind === "link"
      ? <a key={o.key} className="wallet-row" href={a.href} target="_blank" rel="noreferrer">{inner}</a>
      : <button key={o.key} className="wallet-row" disabled={a.kind === "unavailable" || isPending} onClick={() => pick(o)}>{inner}</button>;
  };
  return (<div className="wallet-list">{options.map(row)}
    {error && <p className="err" role="alert">{error}</p>}
    <a className="link-sm center" href="https://ethereum.org/wallets/find-wallet/" target="_blank" rel="noreferrer">I don&apos;t have a wallet</a></div>);
}

export function WalletModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const openIt = useCallback(() => setOpen(true), []);
  useEffect(() => {
    if (!open) return; const k = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [open, close]);
  return (<Ctx.Provider value={{ open: openIt }}>{children}
    {open && <div className="overlay" onMouseDown={close}><div className="sheet" role="dialog" aria-modal="true" aria-label="Connect wallet" onMouseDown={(e) => e.stopPropagation()}>
      <div className="sheet-head"><h3><Wallet size={18} aria-hidden /> Connect a wallet</h3><button className="icon-btn" onClick={close} aria-label="Close"><X size={18} /></button></div>
      <WalletList onDone={close} /></div></div>}</Ctx.Provider>);
}
