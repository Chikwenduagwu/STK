import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Bell } from "lucide-react";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { WalletButton } from "@/components/WalletButton";
import { BottomTabs, TopNav } from "@/components/Nav";

export const metadata: Metadata = {
  title: { default: "STK | Swap tokenized stocks with risk intelligence", template: "%s | STK" },
  description: "Swap tokenized stocks on Ethereum with a live risk state from decentralized GenLayer validators that review public evidence.",
  applicationName: "STK",
  openGraph: { title: "STK", description: "Real-world events. Decentralized judgment. Onchain risk intelligence.", type: "website", siteName: "STK" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#ffffff" };
const boot = `try{var d=document.documentElement;if(sessionStorage.getItem('sg-splash'))d.dataset.splash='done';else sessionStorage.setItem('sg-splash','1')}catch(e){document.documentElement.dataset.splash='done'}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: boot }} /></head><body>
    <div className="splash" aria-hidden><div className="splash-in"><b>STK</b><small>Real-world events. Decentralized judgment.<br />Onchain risk intelligence.</small></div></div>
    <Providers>
      <header className="app-head"><div className="app-head-in">
        <Link href="/" className="brand" aria-label="STK home">STK</Link>
        <TopNav />
        <div className="tools"><WalletButton compact /><Link href="/notifications" className="icon-btn" aria-label="Notifications"><Bell size={18} /></Link></div></div></header>
      <main className="app-main">{children}
        <footer className="legal">STK provides informational and protocol-level risk intelligence. It does not provide investment advice, guarantee asset performance, or represent ownership rights in underlying securities.</footer></main>
      <BottomTabs />
    </Providers></body></html>);
}
