import { SwapCard } from "@/components/swap/SwapCard";
import { ALL_TOKENS } from "@/lib/swap/tokens";

const FEATURES = [
  ["f1", "Public evidence", "Validators read official public sources for each stock, not social media or rumours."],
  ["f2", "Decentralized judgment", "Multiple independent validators must agree before a result is recorded onchain."],
  ["f3", "Risk before you trade", "Every stock shows a clear risk state, and high-risk buys need your explicit confirmation."],
] as const;

export default async function Home({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const sp = await searchParams;
  const valid = (s?: string) => ALL_TOKENS.find((t) => t.symbol === s)?.symbol;
  return (<>
    <section className="hero reveal"><span className="kicker">Tokenized stocks on Ethereum</span>
      <h1>Swap tokenized stocks with risk intelligence built in.</h1>
      <p>Every stock on STK carries a live risk state from decentralized validators that review public evidence. Check it, refresh it, then trade.</p></section>
    <SwapCard initialFrom={valid(sp.from) ?? "USDC"} initialTo={valid(sp.to) ?? "NVDAx"} />
    <section className="feature-grid" aria-label="How STK protects your trade">{FEATURES.map(([k, t, d], i) => (
      <div key={k} className={`feature ${k}`}><span className="num">{i + 1}</span><h3>{t}</h3><p>{d}</p></div>))}</section>
  </>);
}
