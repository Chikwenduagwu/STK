import Link from "next/link";
import { Bell, ChevronRight, HelpCircle, LayoutDashboard, Settings, ShieldCheck, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/server";
export const metadata = { title: "More" };
const ITEMS = [
  [LayoutDashboard, "Overview", "/dashboard", "Platform statistics and recent evaluations"],
  [Bell, "Notifications", "/notifications", "Alerts from new evaluations"],
  [ShieldCheck, "Risk policy", "/policies", "How events map to risk states"],
  [Wallet, "Connect wallet", "/connect", "Choose a wallet to connect"],
  [Settings, "Settings", "/settings", "Wallet, network and preferences"],
  [HelpCircle, "How it works", "/how-it-works", "The process behind every risk state"],
] as const;
export default function More() {
  return <div className="stack"><PageHeader title="More" /><div className="list">{ITEMS.map(([I, t, h, d]) => (<Link key={h} href={h} className="row"><span className="ricon"><I size={18} /></span><div className="row-main"><strong>{t}</strong><span className="muted">{d}</span></div><ChevronRight size={18} /></Link>))}</div></div>;
}
