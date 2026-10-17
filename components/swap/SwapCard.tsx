"use client";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useBalance, usePublicClient, useReadContract, useReadContracts, useSwitchChain, useWriteContract } from "wagmi";
import { encodeFunctionData, formatUnits, type Address } from "viem";
import { ArrowDownUp, Check, ChevronDown, Settings2 } from "lucide-react";
import { erc20Abi } from "@/lib/blockchain/erc20";
import { routerAbi } from "@/lib/swap/abi";
import { formatAmount, minAmountOut, parseAmount, SLIPPAGE_OPTIONS_BPS } from "@/lib/swap/math";
import { fetchBestQuote } from "@/lib/swap/quote";
import { ALL_TOKENS, BASE_TOKENS, routeAddress, STOCK_TOKENS, UNISWAP, type SwapToken } from "@/lib/swap/tokens";
import { TokenBadge, TokenModal } from "./TokenModal";
import { isGated, RiskLine, useRisk } from "./RiskLine";
import { useWalletModal } from "@/components/wallet/WalletModal";
import { ACK_VALUES, usePref } from "@/lib/prefs";

type Phase = "idle" | "approving" | "swapping" | "confirming" | "success";

function useTokens() {
  const q = useReadContracts({
    allowFailure: true, query: { staleTime: Infinity, retry: 3 },
    contracts: STOCK_TOKENS.map((t) => ({ chainId: 1, address: t.address!, abi: erc20Abi, functionName: "decimals" }) as const),
  });
  const tokens = useMemo<SwapToken[]>(() => [...BASE_TOKENS, ...STOCK_TOKENS.map((t, i) => {
    const r = q.data?.[i]; return { ...t, decimals: r?.status === "success" ? Number(r.result) : null };
  })], [q.data]);
  const failed = q.isError || (q.data?.some((r) => r.status === "failure") ?? false);
  return { tokens, failed, retry: () => q.refetch() };
}

function useTokenBalance(t: SwapToken | undefined, owner?: Address) {
  const native = useBalance({ address: owner, chainId: 1, query: { enabled: !!owner && t?.kind === "native" } });
  const erc = useReadContract({ chainId: 1, address: t?.address ?? undefined, abi: erc20Abi, functionName: "balanceOf", args: [owner as Address], query: { enabled: !!owner && !!t?.address } });
  const value = t?.kind === "native" ? native.data?.value : (erc.data as bigint | undefined);
  return { value, refetch: () => (t?.kind === "native" ? native.refetch() : erc.refetch()) };
}

const friendly = (e: unknown) => {
  const m = e instanceof Error ? (("shortMessage" in e && typeof e.shortMessage === "string" ? e.shortMessage : e.message)) : "Something went wrong";
  return /rejected|denied/i.test(m) ? "Transaction rejected in wallet." : m.slice(0, 180);
};

export function SwapCard({ initialFrom = "USDC", initialTo = "NVDAx" }: { initialFrom?: string; initialTo?: string }) {
  const { tokens, failed: tokensFailed, retry: retryTokens } = useTokens();
  const { address, isConnected, chainId } = useAccount();
  const { open: openWallet } = useWalletModal();
  const [ackPref] = usePref("sg-ack", "HIGH", ACK_VALUES);
  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const client = usePublicClient({ chainId: 1 });

  const [fromSym, setFromSym] = useState(initialFrom), [toSym, setToSym] = useState(initialTo);
  const [amount, setAmount] = useState(""), [debounced, setDebounced] = useState("");
  const [slippage, setSlippage] = useState<number>(50), [showSettings, setShowSettings] = useState(false);
  const [picker, setPicker] = useState<null | "from" | "to">(null);
  const [phase, setPhase] = useState<Phase>("idle"), [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null), [ack, setAck] = useState(false);
  const [flip, setFlip] = useState(0);

  const from = tokens.find((t) => t.symbol === fromSym), to = tokens.find((t) => t.symbol === toSym);
  useEffect(() => { const id = setTimeout(() => setDebounced(amount), 350); return () => clearTimeout(id); }, [amount]);
  useEffect(() => setAck(false), [toSym]);

  const amountIn = from?.decimals != null ? parseAmount(debounced, from.decimals) : null;
  const fromBal = useTokenBalance(from, address), toBal = useTokenBalance(to, address);
  const samePair = !!from && !!to && routeAddress(from) === routeAddress(to);

  const quote = useQuery({
    queryKey: ["quote", from?.symbol, to?.symbol, amountIn?.toString()], retry: false, staleTime: 10_000, refetchInterval: 15_000,
    enabled: !!client && !!from && !!to && amountIn != null && to.decimals != null && !samePair,
    queryFn: () => fetchBestQuote(client!, routeAddress(from!), routeAddress(to!), amountIn!),
  });
  const allowance = useReadContract({ chainId: 1, address: from?.address ?? undefined, abi: erc20Abi, functionName: "allowance", args: [address as Address, UNISWAP.swapRouter02], query: { enabled: !!address && !!from?.address } });

  const riskTo = useRisk(to?.kind === "stock" ? to.symbol : undefined);
  const gated = to?.kind === "stock" && isGated(riskTo.data, ackPref);
  const q = quote.data, typing = amount !== debounced;
  const needsApproval = !!from?.address && amountIn != null && ((allowance.data as bigint | undefined) ?? 0n) < amountIn;
  const busy = phase === "approving" || phase === "swapping" || phase === "confirming";

  const rate = q && amountIn && from?.decimals != null && to?.decimals != null
    ? Number(formatUnits(q.amountOut, to.decimals)) / Number(formatUnits(amountIn, from.decimals)) : null;
  const routeLabel = q ? q.route.tokens.map((a, i) => ALL_TOKENS.find((t) => t.address === a)?.symbol ?? (i === 0 && from ? from.symbol : "?")).map((s, i) => i === 0 ? s : `${(q.route.fees[i - 1] / 10000).toString()}% ${s}`).join(" > ") : "";

  function pick(side: "from" | "to", t: SwapToken) {
    const other = side === "from" ? toSym : fromSym;
    if (t.symbol === other) { setFromSym(toSym); setToSym(fromSym === "ETH" ? "WETH" : fromSym); } else side === "from" ? setFromSym(t.symbol) : setToSym(t.symbol);
    setPicker(null); setAmount(""); setDebounced("");
  }
  function flipSides() {
    setFlip((n) => n + 1); setFromSym(toSym); setToSym(fromSym === "ETH" ? "WETH" : fromSym); setAmount(""); setDebounced("");
  }
  function reset() { setPhase("idle"); setHash(null); setAmount(""); setDebounced(""); setError(null); }

  async function run() {
    if (!client || !from || !to || !q || !amountIn || !address) return;
    setError(null);
    try {
      if (from.address && needsApproval) {
        setPhase("approving");
        const h = await writeContractAsync({ address: from.address, abi: erc20Abi, functionName: "approve", args: [UNISWAP.swapRouter02, amountIn] });
        await client.waitForTransactionReceipt({ hash: h }); await allowance.refetch();
      }
      setPhase("swapping");
      const inner = encodeFunctionData({ abi: routerAbi, functionName: "exactInput", args: [{ path: q.path, recipient: address, amountIn, amountOutMinimum: minAmountOut(q.amountOut, slippage) }] });
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
      const h = await writeContractAsync({ address: UNISWAP.swapRouter02, abi: routerAbi, functionName: "multicall", args: [deadline, [inner]], value: from.kind === "native" ? amountIn : 0n });
      setHash(h); setPhase("confirming");
      const r = await client.waitForTransactionReceipt({ hash: h });
      if (r.status !== "success") throw new Error("Transaction reverted onchain");
      setPhase("success"); fromBal.refetch(); toBal.refetch();
    } catch (e) { setPhase("idle"); setError(friendly(e)); }
  }

  const insufficient = amountIn != null && fromBal.value != null && amountIn > fromBal.value;
  let cta: { label: string; disabled: boolean; onClick?: () => void } = { label: "Swap", disabled: true };
  if (!isConnected) cta = { label: "Connect wallet", disabled: false, onClick: openWallet };
  else if (chainId !== 1) cta = { label: "Switch to Ethereum", disabled: false, onClick: () => switchChain({ chainId: 1 }) };
  else if (samePair) cta.label = "Choose two different assets";
  else if (!amount) cta.label = "Enter an amount";
  else if (from?.decimals == null || to?.decimals == null) cta = tokensFailed ? { label: "Token info unavailable. Tap to retry", disabled: false, onClick: () => retryTokens() } : { label: "Loading token info", disabled: true };
  else if (!amountIn) cta.label = typing ? "Enter an amount" : "Invalid amount";
  else if (insufficient) cta.label = `Insufficient ${from.symbol}`;
  else if (typing || quote.isLoading) cta.label = "Finding best route";
  else if (quote.isError) cta.label = "Quote unavailable. Retry";
  else if (!q) cta.label = "No Uniswap v3 route found";
  else if (gated && !ack) cta.label = "Acknowledge risk to continue";
  else if (phase === "approving") cta.label = `Approve ${from.symbol} in wallet`;
  else if (phase === "swapping") cta.label = "Confirm swap in wallet";
  else if (phase === "confirming") cta.label = "Waiting for confirmation";
  else cta = { label: needsApproval ? `Approve ${from.symbol} and swap` : "Swap", disabled: false, onClick: run };
  if (quote.isError && !typing && amountIn && !insufficient) cta = { ...cta, disabled: false, onClick: () => quote.refetch() };
  if (busy) cta.disabled = true;

  return (<div className="swap-shell reveal" style={{ "--d": "80ms" } as React.CSSProperties}>
    <div className="swap-wrap"><div className="swap-card">
      <div className="swap-head"><h2>Trade <span className="pill">Ethereum mainnet</span></h2>
        <button className="icon-btn" aria-label="Slippage settings" aria-expanded={showSettings} onClick={() => setShowSettings((s) => !s)}><Settings2 size={18} /></button></div>
      {showSettings && <div className="settings"><span className="muted">Max slippage</span><div className="seg">{SLIPPAGE_OPTIONS_BPS.map((b) => <button key={b} data-on={slippage === b} onClick={() => setSlippage(b)}>{b / 100}%</button>)}</div></div>}

      {phase === "success" ? (<div className="success"><span className="check"><Check size={28} /></span><h3>Swap complete</h3>
        <p className="muted">Your transaction was confirmed on Ethereum.</p>
        {hash && <a className="link-sm" href={`https://etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer">View on Etherscan</a>}
        <button className="cta" onClick={reset}>New swap</button></div>) : (<>
        <div className="field"><div className="field-top"><span className="muted">From</span>
          {fromBal.value != null && from?.decimals != null && <span className="muted">Balance: {formatAmount(fromBal.value, from.decimals)} <button className="max-btn" onClick={() => setAmount(formatUnits(from.kind === "native" && fromBal.value! > 2n * 10n ** 15n ? fromBal.value! - 10n ** 15n : fromBal.value!, from.decimals!))}>MAX</button></span>}</div>
          <div className="field-row"><input className="amount" inputMode="decimal" placeholder="0" aria-label="Amount to pay" value={amount} onChange={(e) => setAmount(e.target.value.replace(",", "."))} disabled={busy} />
            <button className="token-btn" onClick={() => setPicker("from")} disabled={busy}>{from && <TokenBadge t={from} size={24} />}{from?.symbol ?? "Select"}<ChevronDown size={16} /></button></div></div>
        <div className="flip-wrap"><button className="flip" aria-label="Reverse pair" onClick={flipSides} disabled={busy} style={{ transform: `rotate(${flip * 180}deg)` }}><ArrowDownUp size={18} /></button></div>
        <div className="field"><div className="field-top"><span className="muted">To</span>
          {toBal.value != null && to?.decimals != null && <span className="muted">Balance: {formatAmount(toBal.value, to.decimals)}</span>}</div>
          <div className="field-row">{(typing || quote.isFetching) && amountIn && !q ? <span className="skeleton amount-skel" /> : <output className="amount out" aria-live="polite">{q && to?.decimals != null ? formatAmount(q.amountOut, to.decimals) : "0"}</output>}
            <button className="token-btn" onClick={() => setPicker("to")} disabled={busy}>{to && <TokenBadge t={to} size={24} />}{to?.symbol ?? "Select"}<ChevronDown size={16} /></button></div></div>

        {q && to?.decimals != null && rate != null && (<dl className="details">
          <div><dt>Rate</dt><dd>1 {from?.symbol} = {rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {to.symbol}</dd></div>
          <div><dt>Min. received ({slippage / 100}%)</dt><dd>{formatAmount(minAmountOut(q.amountOut, slippage), to.decimals)} {to.symbol}</dd></div>
          <div><dt>Route</dt><dd className="route">{routeLabel}</dd></div>
          <div><dt>Estimated gas</dt><dd>{q.gasEstimate.toString()} units</dd></div></dl>)}

        {to?.kind === "stock" && <RiskLine symbol={to.symbol} slug={to.slug} />}
        {from?.kind === "stock" && <RiskLine symbol={from.symbol} slug={from.slug} />}
        {gated && <label className="ack"><input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} /><span>This asset is currently rated {riskTo.data?.state} by its risk policy. I understand and want to continue.</span></label>}
        {error && <p className="err" role="alert">{error}</p>}
        <button className="cta" disabled={cta.disabled} onClick={cta.onClick}>{busy && <span className="spin" aria-hidden />}{cta.label}</button>
        <p className="fine">Swaps execute on Uniswap v3 on Ethereum. Issuer terms may restrict who can hold tokenized stocks. Informational risk data only; not investment advice.</p></>)}
    </div></div>
    <TokenModal open={picker !== null} tokens={tokens} onClose={() => setPicker(null)}
      disabled={(t) => picker === "to" && t.kind === "native"} onPick={(t) => pick(picker!, t)} />
  </div>);
}
