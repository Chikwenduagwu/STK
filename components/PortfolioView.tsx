"use client";
import Link from "next/link";
import { useAccount, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { Wallet } from "lucide-react";
import { ASSETS } from "@/lib/assets/registry";
import { erc20Abi } from "@/lib/blockchain/erc20";
import { shortAddr } from "@/lib/format";
import { useWalletModal } from "@/components/wallet/WalletModal";
import { Tabs } from "@/components/ui/client";
import { AssetLogo } from "@/components/ui/logo";

export function PortfolioView() {
  const { address, isConnected } = useAccount();
  const { open } = useWalletModal();
  const { data, isLoading, isError, refetch } = useReadContracts({
    allowFailure: true, query: { enabled: isConnected },
    contracts: ASSETS.flatMap((a) => [
      { chainId: 1, address: a.address, abi: erc20Abi, functionName: "balanceOf", args: [address!] } as const,
      { chainId: 1, address: a.address, abi: erc20Abi, functionName: "decimals" } as const]),
  });
  if (!isConnected) return (<div className="state-card tall"><span className="state-ico"><Wallet size={28} /></span><h3>No position detected</h3>
    <p className="muted">Connect your wallet to view your onchain stock positions.</p><button className="btn block" onClick={open}>Connect Wallet</button></div>);
  const rows = ASSETS.map((a, i) => { const b = data?.[i * 2], d = data?.[i * 2 + 1];
    if (!b || !d || b.status !== "success" || d.status !== "success") return { a, ok: false as const };
    return { a, ok: true as const, raw: b.result as bigint, text: formatUnits(b.result as bigint, Number(d.result)) }; });
  const held = rows.filter((r) => r.ok && r.raw > 0n);
  const holdings = isLoading ? <div className="skeleton block-skel" /> : isError || !data ? (<div className="state-card"><h3>Balances unavailable</h3><button className="btn block" onClick={() => refetch()}>Retry</button></div>) : (<div className="stack">
    {held.length > 0 && <div className="list">{held.map((r) => r.ok && (<Link key={r.a.slug} href={`/stocks/${r.a.slug}`} className="row"><AssetLogo symbol={r.a.symbol} size={44} />
      <div className="row-main"><strong>{r.a.symbol}</strong><span className="muted">{r.a.name}</span></div><div className="row-end"><strong>{Number(r.text).toLocaleString(undefined, { maximumFractionDigits: 6 })}</strong><span className="muted">Value n/a</span></div></Link>))}</div>}
    {held.length === 0 && rows.every((r) => r.ok) && <div className="card"><strong>No position detected</strong><p className="muted">We couldn&apos;t find any supported tokens in your wallet.</p></div>}
    {rows.some((r) => !r.ok) && <p className="fine">Some balances could not be read.</p>}
    <p className="fine">Valuation is not shown because no verified price source is configured.</p></div>);
  return (<div className="stack"><div className="card wallet-chip"><span className="state-ico sm"><Wallet size={18} /></span><div><span className="mono">{shortAddr(address!)}</span><div className="ok-text">Connected</div></div></div>
    <Tabs variant="pill" tabs={[{ id: "h", label: "Holdings", node: holdings }, { id: "hist", label: "History", node: <div className="state-card"><h3>History unavailable</h3><p className="muted">No transaction indexer is configured, so past activity can&apos;t be shown.</p></div> }]} /></div>);
}
