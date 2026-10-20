import type { Address, PublicClient } from "viem";
import { quoterAbi } from "./abi";
import { pickBest } from "./math";
import { candidateRoutes, encodePath, type Route } from "./path";
import { UNISWAP } from "./tokens";

export interface Quote { route: Route; path: `0x${string}`; amountOut: bigint; gasEstimate: bigint }

/** Quotes every candidate route against Uniswap's QuoterV2 and returns the best one, or null if no pool exists. */
export async function fetchBestQuote(client: PublicClient, tokenIn: Address, tokenOut: Address, amountIn: bigint): Promise<Quote | null> {
  const routes = candidateRoutes(tokenIn, tokenOut);
  const settled = await Promise.allSettled(routes.map(async (route) => {
    const path = encodePath(route);
    const { result } = await client.simulateContract({ address: UNISWAP.quoterV2, abi: quoterAbi, functionName: "quoteExactInput", args: [path, amountIn] });
    return { route, path, amountOut: result[0], gasEstimate: result[3] } satisfies Quote;
  }));
  const ok = settled.flatMap((s) => (s.status === "fulfilled" && s.value.amountOut > 0n ? [s.value] : []));
  // If every call failed for a non-"no pool" reason (e.g. RPC down), surface it rather than reporting "no route".
  if (ok.length === 0 && settled.every((s) => s.status === "rejected" && /fetch|network|timeout|429|rate/i.test(String(s.reason)))) {
    throw new Error("RPC unavailable");
  }
  return pickBest(ok);
}
