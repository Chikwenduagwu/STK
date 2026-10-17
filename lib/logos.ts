/** Real brand marks, stored in /public/logos. `bg` is a CSS variable for glyph-only marks that sit on a colored disc. */
export interface LogoSpec { src: string; bg?: string }
export const ASSET_LOGOS: Record<string, LogoSpec> = {
  NVDAx: { src: "/logos/nvidia.svg", bg: "var(--nv)" },
  TSLAx: { src: "/logos/tesla.svg", bg: "var(--ts)" },
  ETH: { src: "/logos/eth.svg", bg: "var(--eth)" },
  WETH: { src: "/logos/weth.svg", bg: "var(--eth)" },
  USDC: { src: "/logos/usdc.svg" },
};
export const WALLET_LOGOS: Record<string, string> = {
  metamask: "/logos/metamask.svg", walletconnect: "/logos/walletconnect.svg", coinbase: "/logos/coinbase.svg", rabby: "/logos/rabby.svg",
};
