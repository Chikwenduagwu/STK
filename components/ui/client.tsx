"use client";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, RotateCw } from "lucide-react";
import { useReadContract } from "wagmi";
import { erc20Abi } from "@/lib/blockchain/erc20";
import type { Address } from "viem";

export function Tabs({ tabs, variant = "line" }: { tabs: { id: string; label: string; node: ReactNode }[]; variant?: "line" | "pill" | "seg" }) {
  const [on, setOn] = useState(tabs[0].id);
  return (<div><div className={`tabs ${variant}`} role="tablist">{tabs.map((t) => (
    <button key={t.id} role="tab" aria-selected={on === t.id} data-on={on === t.id} onClick={() => setOn(t.id)}>{t.label}</button>))}</div>
    <div role="tabpanel" key={on} className="tabpanel">{tabs.find((t) => t.id === on)?.node}</div></div>);
}
export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return <button className="icon-btn xs" aria-label={label} onClick={async () => { try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1500); } catch {} }}>{done ? <Check size={14} /> : <Copy size={14} />}</button>;
}
export function RetryButton() {
  const router = useRouter();
  return <button className="btn block" onClick={() => router.refresh()}><RotateCw size={16} aria-hidden /> Retry</button>;
}
export function OnchainDecimals({ address }: { address: Address }) {
  const { data, isLoading, isError } = useReadContract({ chainId: 1, address, abi: erc20Abi, functionName: "decimals" });
  return <>{isLoading ? <span className="skeleton" style={{ width: 28, height: 14 }} /> : isError || data == null ? "Data unavailable" : String(data)}</>;
}
