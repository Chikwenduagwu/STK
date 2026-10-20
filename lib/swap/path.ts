import { encodePacked, type Address, type Hex } from "viem";
import { USDC, WETH } from "./tokens";

const DIRECT_FEES = [100, 500, 3000, 10000] as const;
const HOP_FEES_A = [500, 3000, 10000] as const;
const HOP_FEES_B = [500, 3000] as const;

export interface Route { tokens: Address[]; fees: number[] }

export function encodePath({ tokens, fees }: Route): Hex {
  if (tokens.length !== fees.length + 1) throw new Error("path shape mismatch");
  const types: ("address" | "uint24")[] = [];
  const values: (Address | number)[] = [];
  tokens.forEach((t, i) => { types.push("address"); values.push(t); if (i < fees.length) { types.push("uint24"); values.push(fees[i]); } });
  return encodePacked(types, values);
}

/** Direct pools across fee tiers, plus two-hop routes through WETH or USDC. */
export function candidateRoutes(a: Address, b: Address): Route[] {
  if (a === b) return [];
  const routes: Route[] = DIRECT_FEES.map((f) => ({ tokens: [a, b], fees: [f] }));
  for (const mid of [WETH, USDC]) {
    if (mid === a || mid === b) continue;
    for (const f1 of HOP_FEES_A) for (const f2 of HOP_FEES_B) routes.push({ tokens: [a, mid, b], fees: [f1, f2] });
  }
  return routes;
}
