"use client";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { LogOut, Wallet } from "lucide-react";
import { useWalletModal } from "@/components/wallet/WalletModal";
export function WalletButton({ compact = false }: { compact?: boolean }) {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { open } = useWalletModal();
  if (!isConnected) return <button className="btn sm" onClick={open}><Wallet size={15} aria-hidden /> {compact ? "Connect" : "Connect Wallet"}</button>;
  return (<>
    {chainId !== 1 && <button className="btn sm alt" onClick={() => switchChain({ chainId: 1 })}>Switch network</button>}
    <button className="btn sm alt" onClick={() => disconnect()} aria-label="Disconnect wallet"><span className="mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span><LogOut size={14} aria-hidden /></button></>);
}
