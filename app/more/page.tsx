import Link from "next/link";
import { Bell, ChevronRight, HelpCircle, Settings, ShieldCheck, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/server";
export const metadata = { title: "More" };
const ITEMS = [[Bell, "Notifications", "/notifications", "Alerts from GenLayer evaluations"], [ShieldCheck, "Risk Policy", "/policies", "How events map to risk states"], [Wallet, "Connect Wallet", "/connect", "Choose a wallet"],
  [Settings, "Settings", "/settings", "Wallet, network, preferences"], [HelpCircle, "How It Works", "/how-it-works", "The architecture, step by step"]] as const;
export default function More() {
  return <div className="stack"><PageHeader title="More" /><div className="list">{ITEMS.map(([I, t, h, d]) => (<Link key={h} href={h} className="row"><span className="ricon none"><I size={18} /></span><div className="row-main"><strong>{t}</strong><span className="muted">{d}</span></div><ChevronRight size={18} className="muted" /></Link>))}</div></div>;
}
