import Link from "next/link";
import { ArrowDown, ArrowRight, Box, FileText, Globe, Hexagon, ShieldCheck, User } from "lucide-react";
const NODES = [[Globe, "Public Information"], [Hexagon, "GenLayer"], [FileText, "Semantic Evaluation"], [ShieldCheck, "Risk Policy"], [Box, "Onchain State"], [User, "User Action"]] as const;
export default function Welcome() {
  return (<div className="welcome stack">
    <section className="reveal"><h1 className="display">Real-world events. Decentralized judgment. Onchain risk intelligence.</h1>
      <p className="muted lead">STK uses GenLayer to evaluate public evidence about tokenized stocks and translate material real-world events into transparent, programmable risk states.</p>
      <div className="cta-stack"><Link href="/stocks" className="btn block">Explore Stocks</Link><Link href="/how-it-works" className="btn block alt">How It Works</Link></div></section>
    <section className="flow reveal" style={{ "--d": "120ms" } as React.CSSProperties} aria-label="Architecture">
      {NODES.map(([I, label], i) => (<div className="flow-node" key={label} style={{ "--i": i } as React.CSSProperties}>
        <span className="flow-ico"><I size={22} aria-hidden /></span><span>{label}</span>
        {i < 5 && <span className={`flow-arrow ${i === 2 ? "down" : ""}`} aria-hidden>{i === 2 ? <ArrowDown size={16} /> : <ArrowRight size={16} />}</span>}</div>))}
    </section></div>);
}
