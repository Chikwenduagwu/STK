import { SwapCard } from "@/components/swap/SwapCard";
import { PageHeader } from "@/components/ui/server";
import { ALL_TOKENS } from "@/lib/swap/tokens";
export const metadata = { title: "Swap" };
export default async function SwapPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const sp = await searchParams;
  const valid = (s?: string) => ALL_TOKENS.find((t) => t.symbol === s)?.symbol;
  return <div className="stack"><PageHeader title="Swap" back="/stocks" /><SwapCard initialFrom={valid(sp.from) ?? "USDC"} initialTo={valid(sp.to) ?? "NVDAx"} /></div>;
}
