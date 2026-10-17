import { getAddress } from "viem";
import type { Asset } from "@/types/domain";
import { DEFAULT_POLICY } from "@/lib/policies/engine";

const make = (a: Omit<Asset, "explorerUrl" | "uniswapUrl" | "chainId" | "chainName" | "address" | "issuer" | "mechanism" | "supported" | "verificationNote" | "policy"> & { address: string }): Asset => {
  const address = getAddress(a.address); // throws on invalid / bad-checksum addresses
  return {
    ...a, address, chainId: 1, chainName: "Ethereum",
    issuer: "Backed Assets (JE) Limited (xStocks)",
    mechanism: "Issuer-backed ERC-20 tokenized equity (xStocks), 1:1 backed per issuer",
    explorerUrl: `https://etherscan.io/token/${address}`,
    uniswapUrl: `https://app.uniswap.org/explore/tokens/ethereum/${address.toLowerCase()}`,
    supported: true,
    verificationNote: "Address matched across Uniswap, Etherscan and exchange listings. Confirm against the issuer's published address list before relying on it.",
    policy: DEFAULT_POLICY,
  };
};

export const ASSETS: Asset[] = [
  make({ symbol: "TSLAx", slug: "tslax", name: "Tesla xStock", underlying: "Tesla, Inc. (TSLA)",
    address: "0x8aD3c73F833d3F9A523aB01476625F269aEB7Cf0", officialUrl: "https://xstocks.fi",
    sources: [
      { label: "Tesla Investor Relations", url: "https://ir.tesla.com/", category: "ISSUER_IR" },
      { label: "SEC EDGAR - Tesla filings", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=8-K", category: "SEC_FILING" },
    ] }),
  make({ symbol: "NVDAx", slug: "nvdax", name: "NVIDIA xStock", underlying: "NVIDIA Corporation (NVDA)",
    address: "0xc845b2894dBddd03858fd2D643B4eF725fE0849d", officialUrl: "https://xstocks.fi",
    sources: [
      { label: "NVIDIA Investor Relations", url: "https://investor.nvidia.com/", category: "ISSUER_IR" },
      { label: "SEC EDGAR - NVIDIA filings", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001045810&type=8-K", category: "SEC_FILING" },
    ] }),
];
export const getAsset = (slug: string) => ASSETS.find((a) => a.slug === slug && a.supported);
export const getAssetBySymbol = (s: string) => ASSETS.find((a) => a.symbol === s);
