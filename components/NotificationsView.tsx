"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { Info } from "lucide-react";
import type { EventRowData } from "@/types/domain";
import { severityGroup, shortAddr } from "@/lib/format";
import { EventRow } from "@/components/ui/server";
export function NotificationsView({ rows }: { rows: EventRowData[] }) {
  const [f, setF] = useState<"all" | "high" | "medium" | "low">("all");
  const { address, isConnected } = useAccount();
  const list = rows.filter((r) => f === "all" || severityGroup(r.severity) === f);
  return (<div className="stack"><div className="chips">{(["all", "high", "medium", "low"] as const).map((k) => <button key={k} data-on={f === k} data-k={k} onClick={() => setF(k)}>{k[0].toUpperCase() + k.slice(1)}</button>)}</div>
    <div className="list">{list.map((e) => <EventRow key={e.id} e={e} />)}
      {f === "all" && isConnected && <div className="row"><span className="ricon none"><Info size={18} /></span><div className="row-main"><strong>System</strong><span className="muted">Wallet connected</span><span className="meta">{shortAddr(address!)}</span></div><span className="tag none">Info</span></div>}</div>
    {list.length === 0 && !(f === "all" && isConnected) && <div className="card muted">No notifications yet.</div>}
    <p className="fine">Alerts appear here when a new evaluation detects an event. Push and email delivery are not available yet.</p></div>);
}
