"use client";
import { useState } from "react";
import type { EventRowData } from "@/types/domain";
import { severityGroup } from "@/lib/format";
import { EventRow } from "@/components/ui/server";
export function EventsBrowser({ rows }: { rows: EventRowData[] }) {
  const [f, setF] = useState<"all" | "high" | "medium" | "low">("all");
  const list = rows.filter((r) => f === "all" || (r.detected ? severityGroup(r.severity) : "low") === f);
  return (<div className="stack"><div className="chips">{(["all", "high", "medium", "low"] as const).map((k) => <button key={k} data-on={f === k} data-k={k} onClick={() => setF(k)}>{k[0].toUpperCase() + k.slice(1)}</button>)}</div>
    {list.length === 0 ? <div className="card muted">No verified material events found.</div> : <div className="list">{list.map((e) => <EventRow key={e.id} e={e} />)}</div>}</div>);
}
