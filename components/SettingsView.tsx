"use client";
import Link from "next/link";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { Bell, ChevronRight, Globe, HelpCircle, Info, ShieldCheck, Wallet } from "lucide-react";
import pkg from "../package.json";
import { ACK_VALUES, NOTIFY_VALUES, usePref } from "@/lib/prefs";
import { shortAddr } from "@/lib/format";
import { useWalletModal } from "@/components/wallet/WalletModal";

function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: readonly (readonly [T, string])[]; onChange: (v: T) => void; label: string }) {
  return <div className="seg" role="group" aria-label={label}>{options.map(([v, l]) => <button key={v} data-on={value === v} onClick={() => onChange(v)}>{l}</button>)}</div>;
}
export function SettingsView() {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect(); const { switchChain } = useSwitchChain(); const { open } = useWalletModal();
  const [notify, setNotify] = usePref("sg-notify", "ALL", NOTIFY_VALUES);
  const [ack, setAck] = usePref("sg-ack", "HIGH", ACK_VALUES);
  const item = (icon: React.ReactNode, title: string, sub: React.ReactNode, end?: React.ReactNode) => <div className="set-row"><span className="ricon">{icon}</span><div className="row-main"><strong>{title}</strong><span className="muted">{sub}</span></div>{end}</div>;
  return (<div className="stack">
    <div className="card list-card">
      {item(<Wallet size={18} />, "Wallet", isConnected ? <span className="mono">{shortAddr(address!)}</span> : "Not connected", isConnected ? <button className="btn sm alt" onClick={() => disconnect()}>Disconnect</button> : <button className="btn sm" onClick={open}>Connect</button>)}
      {item(<Globe size={18} />, "Network", chainId === 1 || !isConnected ? "Ethereum mainnet" : "Unsupported network", isConnected && chainId !== 1 ? <button className="btn sm alt" onClick={() => switchChain({ chainId: 1 })}>Switch</button> : undefined)}</div>
    <div className="card"><div className="set-title"><Bell size={16} /> Notifications</div><p className="muted fine">Choose which alerts to highlight.</p>
      <Seg label="Alert level" value={notify} options={[["ALL", "All"], ["MEDIUM", "Medium and above"], ["HIGH", "High only"]]} onChange={setNotify} /></div>
    <div className="card"><div className="set-title"><ShieldCheck size={16} /> Risk preferences</div><p className="muted fine">Ask for my confirmation before I buy a stock rated at or above:</p>
      <Seg label="Confirmation threshold" value={ack} options={[["HIGH", "High risk"], ["CRITICAL", "Critical risk"]]} onChange={setAck} /><p className="fine">Critical-risk stocks always require confirmation.</p></div>
    <div className="card list-card">
      <Link href="/how-it-works" className="set-row"><span className="ricon"><HelpCircle size={18} /></span><div className="row-main"><strong>Help center</strong><span className="muted">How STK works</span></div><ChevronRight size={18} /></Link>
      {item(<Info size={18} />, "About", `STK version ${pkg.version}`)}</div></div>);
}
