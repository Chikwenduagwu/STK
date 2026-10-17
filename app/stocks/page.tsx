import { ASSETS } from "@/lib/assets/registry";
import { listRecent } from "@/lib/genlayer/client";
import { assetRisk } from "@/lib/genlayer/risk";
import { StocksBrowser } from "@/components/StocksBrowser";
import { PageHeader } from "@/components/ui/server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Stocks" };
export default async function Stocks() {
  const recent = await listRecent(50);
  const rows = ASSETS.map((a) => ({ slug: a.slug, symbol: a.symbol, name: a.name, supported: a.supported, state: recent.status === "ok" ? assetRisk(a, recent.data).state : null }));
  return <div className="stack"><PageHeader title="Stocks" /><StocksBrowser rows={rows} /></div>;
}
