import { ASSET_LOGOS } from "@/lib/logos";

/** Token / company logo. Falls back to a monogram only for assets without a registered mark. */
export function AssetLogo({ symbol, size = 40 }: { symbol: string; size?: number }) {
  const l = ASSET_LOGOS[symbol];
  if (!l) return <span className="alogo fallback" style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden>{symbol.slice(0, 1)}</span>;
  const inner = l.bg ? Math.round(size * 0.58) : size;
  // eslint-disable-next-line @next/next/no-img-element
  return <span className="alogo" style={{ width: size, height: size, background: l.bg }} aria-hidden><img src={l.src} alt="" width={inner} height={inner} /></span>;
}
