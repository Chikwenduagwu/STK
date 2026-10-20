import { listRecent } from "@/lib/genlayer/client";
import { assetBySymbol } from "@/lib/genlayer/risk";
import { evaluatePolicy } from "@/lib/policies/engine";
import { titleCase } from "@/lib/format";
import { NotificationsView } from "@/components/NotificationsView";
import { GlProblem, PageHeader } from "@/components/ui/server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications" };
export default async function Notifications() {
  const recent = await listRecent(50);
  return (<div className="stack"><PageHeader title="Notifications" />
    {recent.status !== "ok" ? <GlProblem status={recent.status} message={recent.status === "error" ? recent.message : recent.reason} />
      : <NotificationsView rows={recent.data.filter((r) => r.record.result.eventDetected).map((r) => { const a = assetBySymbol(r.record.asset);
          return { id: r.id, symbol: r.record.asset, slug: a?.slug ?? null, type: titleCase(r.record.result.eventType), severity: r.record.result.severity, detected: true, state: a ? evaluatePolicy(a.policy, r.record.result).state : null }; })} />}</div>);
}
