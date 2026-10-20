import { NextResponse } from "next/server";
import { getCount } from "@/lib/genlayer/client";
import { GENLAYER } from "@/lib/genlayer/config";
import { forward } from "@/lib/rpc/proxy";

export const dynamic = "force-dynamic";

/** Diagnostic: shows whether the server can reach the GenLayer RPC and read the contract. Contains no secrets. */
export async function GET() {
  let rpc: { reachable: boolean; chainId?: string; error?: string };
  try {
    const r = await fetch(GENLAYER.rpcUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }), signal: AbortSignal.timeout(8000) });
    const j = (await r.json()) as { result?: string };
    rpc = { reachable: r.ok, chainId: j.result };
  } catch (e) { rpc = { reachable: false, error: e instanceof Error ? e.message.slice(0, 200) : "request failed" }; }
  const eth = await forward({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] });
  const count = await getCount();
  return NextResponse.json({
    ethereum: eth.ok ? { ok: true, upstream: eth.upstream } : { ok: false, error: eth.error },
    rpcUrl: GENLAYER.rpcUrl, contract: GENLAYER.contractAddress, expectedChainId: GENLAYER.chainId, rpc,
    count: count.status === "ok" ? { ok: true, value: count.data } : { ok: false, detail: count.status === "error" ? count.message.slice(0, 300) : count.reason },
  });
}
