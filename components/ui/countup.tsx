"use client";
import { useEffect, useState } from "react";
/** Animates integers from 0; non-numeric values (e.g. "N/A") render as-is. Respects reduced-motion. */
export function CountUp({ value }: { value: number | string }) {
  const target = typeof value === "number" ? value : null;
  const [n, setN] = useState(0);
  useEffect(() => {
    if (target == null) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || target === 0) { setN(target); return; }
    let raf = 0; const t0 = performance.now(), dur = 800;
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / dur); setN(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [target]);
  return <>{target == null ? value : n}</>;
}
