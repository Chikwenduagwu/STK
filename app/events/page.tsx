import { listRecent } from "@/lib/genlayer/client";
import { assetBySymbol } from "@/lib/genlayer/risk";
import { evaluatePolicy } from "@/lib/policies/engine";
import { titleCase } from "@/lib/format";
import { EventsBrowser } from "@/components/EventsBrowser";
import { GlProblem, PageHeader } from "@/components/ui/server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Events" };
export default async function Events() {
  const recent = await listRecent(50);
  return (<div className="stack"><PageHeader title="Events" />
    {recent.status !== "ok" ? <GlProblem status={recent.status} message={recent.status === "error" ? recent.message : recent.reason} />
      : <EventsBrowser rows={recent.data.map((r) => { const a = assetBySymbol(r.record.asset);
          return { id: r.id, symbol: r.record.asset, slug: a?.slug ?? null, type: titleCase(r.record.result.eventType), severity: r.record.result.severity, detected: r.record.result.eventDetected, state: a ? evaluatePolicy(a.policy, r.record.result).state : null }; })} />}</div>);
}
