import { describe, expect, it } from "vitest";
import { getAddress } from "viem";
import { candidateRoutes, encodePath } from "../lib/swap/path";
import { formatAmount, minAmountOut, parseAmount, pickBest } from "../lib/swap/math";
import { USDC, WETH } from "../lib/swap/tokens";
import { ASSETS } from "../lib/assets/registry";

describe("swap path", () => {
  it("encodes a single hop as 20+3+20 bytes", () => {
    const p = encodePath({ tokens: [USDC, ASSETS[0].address], fees: [3000] });
    expect((p.length - 2) / 2).toBe(43);
    expect(p.toLowerCase()).toContain("000bb8"); // 3000
  });
  it("encodes two hops as 20+3+20+3+20 bytes", () => {
    expect((encodePath({ tokens: [USDC, WETH, ASSETS[0].address], fees: [500, 3000] }).length - 2) / 2).toBe(66);
  });
  it("rejects mismatched shapes", () => expect(() => encodePath({ tokens: [USDC, WETH], fees: [] })).toThrow());
  it("builds direct and hop candidates, skipping the endpoints as hops", () => {
    const r = candidateRoutes(USDC, ASSETS[0].address);
    expect(r.filter((x) => x.tokens.length === 2)).toHaveLength(4);
    expect(r.filter((x) => x.tokens.length === 3).every((x) => x.tokens[1] === WETH)).toBe(true);
    expect(candidateRoutes(USDC, USDC)).toEqual([]);
  });
});
describe("swap math", () => {
  it("applies slippage with integer math", () => { expect(minAmountOut(1000n, 50)).toBe(995n); expect(() => minAmountOut(1n, 10_000)).toThrow(); });
  it("parses amounts strictly", () => {
    expect(parseAmount("1.5", 6)).toBe(1_500_000n);
    expect(parseAmount("0", 6)).toBeNull(); expect(parseAmount("", 6)).toBeNull(); expect(parseAmount("1.1234567", 6)).toBeNull();
    expect(parseAmount("abc", 6)).toBeNull(); expect(parseAmount("-1", 6)).toBeNull();
  });
  it("formats and trims", () => { expect(formatAmount(1_500_000n, 6)).toBe("1.5"); expect(formatAmount(2_000_000n, 6)).toBe("2"); });
  it("picks the highest output", () => expect(pickBest([{ amountOut: 1n }, { amountOut: 9n }, { amountOut: 5n }])?.amountOut).toBe(9n));
  it("returns null when empty", () => expect(pickBest([])).toBeNull());
});
describe("uniswap addresses", () => { it("are valid checksums", () => { expect(getAddress(WETH)).toBe(WETH); expect(getAddress(USDC)).toBe(USDC); }); });
