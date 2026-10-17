import type { RiskPolicy, SourceCategory } from "./index";
export interface EvidenceSource { label: string; url: string; category: SourceCategory }
export interface Asset {
  symbol: string; slug: string; name: string; underlying: string;
  chainId: 1; chainName: "Ethereum"; address: `0x${string}`;
  issuer: string; mechanism: string; officialUrl: string; explorerUrl: string; uniswapUrl: string;
  supported: boolean; verificationNote: string;
  sources: EvidenceSource[]; policy: RiskPolicy;
}
export interface PortfolioPosition { symbol: string; raw: bigint; decimals: number; }

import type { RiskState } from "./index";
export interface EventRowData { id: number; symbol: string; slug: string | null; type: string; severity: string; detected: boolean; state: RiskState | null }
