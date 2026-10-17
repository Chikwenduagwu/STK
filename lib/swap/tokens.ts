import { getAddress, type Address } from "viem";
import { ASSETS } from "@/lib/assets/registry";

/** Uniswap v3 deployments on Ethereum mainnet. */
export const UNISWAP = {
  quoterV2: getAddress("0x61fFE014bA17989E743c5F6cB21bF9697530B21e"),
  swapRouter02: getAddress("0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"),
} as const;
export const WETH = getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
export const USDC = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");

export type TokenKind = "native" | "quote" | "stock";
export interface SwapToken {
  symbol: string; name: string; kind: TokenKind;
  /** null for native ETH */
  address: Address | null;
  /** null until read from the token contract (stocks) */
  decimals: number | null;
  slug?: string;
}

export const BASE_TOKENS: SwapToken[] = [
  { symbol: "ETH", name: "Ether", kind: "native", address: null, decimals: 18 },
  { symbol: "WETH", name: "Wrapped Ether", kind: "quote", address: WETH, decimals: 18 },
  { symbol: "USDC", name: "USD Coin", kind: "quote", address: USDC, decimals: 6 },
];
export const STOCK_TOKENS: SwapToken[] = ASSETS.filter((a) => a.supported).map((a) => ({
  symbol: a.symbol, name: a.name, kind: "stock" as const, address: a.address, decimals: null, slug: a.slug,
}));
export const ALL_TOKENS: SwapToken[] = [...BASE_TOKENS, ...STOCK_TOKENS];
export const routeAddress = (t: SwapToken): Address => t.address ?? WETH;
