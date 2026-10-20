import { getAddress } from "viem";
import type { Asset } from "@/types/domain";
import { DEFAULT_POLICY } from "@/lib/policies/engine";

const make = (a: Omit<Asset, "company" | "explorerUrl" | "uniswapUrl" | "chainId" | "chainName" | "address" | "issuer" | "mechanism" | "supported" | "verificationNote" | "policy"> & { address: string }): Asset => {
  const address = getAddress(a.address); // throws on invalid / bad-checksum addresses
  return {
    ...a, company: a.symbol === "TSLAx" ? "Tesla" : "NVIDIA", address, chainId: 1, chainName: "Ethereum",
    issuer: "Backed Assets (JE) Limited (xStocks)",
    mechanism: "Issuer-backed ERC-20 tokenized equity (xStocks), 1:1 backed per issuer",
    explorerUrl: `https://etherscan.io/token/${address}`,
    uniswapUrl: `https://app.uniswap.org/explore/tokens/ethereum/${address.toLowerCase()}`,
    supported: true,
    verificationNote: "Address matched across Uniswap, Etherscan and exchange listings. Confirm against the issuer's published address list before relying on it.",
    policy: DEFAULT_POLICY,
  };
};


/**
 * Sources the contract fetches. GenLayer's page fetcher cannot declare a user agent, so sites behind bot protection
 * (sec.gov, ir.tesla.com) return 403. Many validators fetch at once, so rate-limited APIs (e.g. GDELT, 1 request per 5s) return 429.
 * The Federal Register API serves automated requests and is an official government source.
 */
const sourcesFor = (company: string) => [
  { label: `Federal Register: ${company}`, url: `https://www.federalregister.gov/api/v1/documents.json?conditions%5Bterm%5D=${encodeURIComponent(company)}&order=newest&per_page=10`, category: "REGULATOR" as const },
];

export const ASSETS: Asset[] = [
  make({ symbol: "TSLAx", slug: "tslax", name: "Tesla xStock", underlying: "Tesla, Inc. (TSLA)",
    address: "0x8aD3c73F833d3F9A523aB01476625F269aEB7Cf0", officialUrl: "https://xstocks.fi",
    sources: sourcesFor("Tesla") }),
  make({ symbol: "NVDAx", slug: "nvdax", name: "NVIDIA xStock", underlying: "NVIDIA Corporation (NVDA)",
    address: "0xc845b2894dBddd03858fd2D643B4eF725fE0849d", officialUrl: "https://xstocks.fi",
    sources: sourcesFor("NVIDIA") }),
];
export const getAsset = (slug: string) => ASSETS.find((a) => a.slug === slug && a.supported);
export const getAssetBySymbol = (s: string) => ASSETS.find((a) => a.symbol === s);
