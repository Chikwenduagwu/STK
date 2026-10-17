"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, Home, MoreHorizontal, Wallet } from "lucide-react";
const TOP = [["/dashboard", "Home"], ["/stocks", "Stocks"], ["/swap", "Swap"], ["/events", "Events"], ["/portfolio", "Portfolio"], ["/more", "More"]] as const;
const MORE = ["/more", "/notifications", "/settings", "/policies", "/how-it-works", "/connect"];
const group = (p: string) => p.startsWith("/dashboard") ? "/dashboard" : p.startsWith("/stocks") || p.startsWith("/swap") ? "/stocks" : p.startsWith("/events") ? "/events" : p.startsWith("/portfolio") ? "/portfolio" : MORE.some((m) => p.startsWith(m)) ? "/more" : "";
export function TopNav() {
  const p = usePathname();
  return <nav className="topnav" aria-label="Primary">{TOP.map(([h, l]) => <Link key={h} href={h} aria-current={(h === "/swap" ? p.startsWith("/swap") : group(p) === h && !p.startsWith("/swap")) ? "page" : undefined}>{l}</Link>)}</nav>;
}
export function BottomTabs() {
  const g = group(usePathname());
  const T = [["/dashboard", "Home", Home], ["/stocks", "Stocks", BarChart3], ["/events", "Events", Activity], ["/portfolio", "Portfolio", Wallet], ["/more", "More", MoreHorizontal]] as const;
  return <nav className="tabbar" aria-label="Main">{T.map(([h, l, I]) => <Link key={h} href={h} aria-current={g === h ? "page" : undefined}><I size={22} aria-hidden /><span>{l}</span></Link>)}</nav>;
}
