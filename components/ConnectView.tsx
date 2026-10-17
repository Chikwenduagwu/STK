"use client";
import { useRouter } from "next/navigation";
import { WalletList } from "@/components/wallet/WalletModal";
export function ConnectView() { const r = useRouter(); return <WalletList onDone={() => r.back()} />; }
