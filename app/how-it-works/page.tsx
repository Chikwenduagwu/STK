import { ArrowDown, Box, FileText, Globe, Hexagon, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/server";
export const metadata = { title: "How It Works" };
const STEPS = [[Globe, "Public Information", "News, filings, announcements and other public web sources."], [Hexagon, "GenLayer", "Intelligent Contracts fetch the evidence and use multiple validators to reach consensus."],
  [FileText, "Semantic Evaluation", "Structured output: was the specified event detected, what type, how severe."], [ShieldCheck, "Risk Policy", "A deterministic policy maps the event to LOW, ELEVATED, HIGH or CRITICAL."], [Box, "Onchain State / Action", "The resulting state informs swaps and future protocol actions."]] as const;
export default function How() {
  return (<div className="stack"><PageHeader title="How It Works" back="/more" />
    <ol className="steps">{STEPS.map(([I, t, d], i) => (<li key={t} className="reveal" style={{ "--d": `${i * 70}ms` } as React.CSSProperties}><span className="flow-ico"><I size={20} aria-hidden /></span><div><strong>{i + 1}. {t}</strong><p className="muted">{d}</p></div>{i < 4 && <ArrowDown className="step-arrow" size={16} aria-hidden />}</li>))}</ol>
    <div className="card"><h3>Why not a normal smart contract?</h3><p className="muted">A deterministic contract can&apos;t read a web page or judge what an announcement means: every node must compute the same result from the same inputs. GenLayer lets validators fetch evidence and run a language model, then agree on the result under an equivalence rule. STK never predicts prices.</p></div></div>);
}
