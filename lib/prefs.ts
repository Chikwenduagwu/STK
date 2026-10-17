"use client";
import { useCallback, useEffect, useState } from "react";
/** Small localStorage-backed preference hook. Safe when storage is unavailable. */
export function usePref<T extends string>(key: string, fallback: T, allowed: readonly T[]): [T, (v: T) => void] {
  const [v, setV] = useState<T>(fallback);
  useEffect(() => { try { const s = localStorage.getItem(key) as T | null; if (s && allowed.includes(s)) setV(s); } catch {} }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = useCallback((n: T) => { setV(n); try { localStorage.setItem(key, n); } catch {} }, [key]);
  return [v, set];
}
export const ACK_VALUES = ["HIGH", "CRITICAL"] as const;
export const NOTIFY_VALUES = ["ALL", "MEDIUM", "HIGH"] as const;
