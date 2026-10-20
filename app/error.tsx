"use client";
import { AlertTriangle } from "lucide-react";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (<div className="state-card tall"><span className="state-ico"><AlertTriangle size={28} /></span><h3>Something went wrong</h3><p>We couldn&apos;t load this page. Please try again.</p><button className="btn block" onClick={reset}>Try again</button></div>);
}
