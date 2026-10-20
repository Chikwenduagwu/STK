export interface ConnectorInfo { id: string; name: string; type: string; icon?: string }
export type WalletAction =
  | { kind: "connect"; connectorId: string }
  | { kind: "link"; href: string; label: string }
  | { kind: "unavailable"; reason: string };
export interface WalletOption { key: string; name: string; icon?: string; action: WalletAction }
export interface OptionsInput { connectors: ConnectorInfo[]; hasEthereum: boolean; isMobile: boolean; host: string }

/** EIP-6963 wallets surface as injected connectors whose id is the wallet's rdns (not the generic "injected"). */
const discovered = (cs: ConnectorInfo[]) => cs.filter((c) => c.type === "injected" && c.id !== "injected");
const find = (cs: ConnectorInfo[], needle: string) => discovered(cs).find((c) => c.id.toLowerCase().includes(needle));

export function buildWalletOptions({ connectors, hasEthereum, isMobile, host }: OptionsInput): WalletOption[] {
  const out: WalletOption[] = [];
  const used = new Set<string>();
  const generic = connectors.find((c) => c.id === "injected");

  const mm = find(connectors, "metamask");
  if (mm) { used.add(mm.id); out.push({ key: "metamask", name: "MetaMask", icon: mm.icon, action: { kind: "connect", connectorId: mm.id } }); }
  else if (hasEthereum && generic) out.push({ key: "metamask", name: "MetaMask", action: { kind: "connect", connectorId: generic.id } });
  else if (isMobile) out.push({ key: "metamask", name: "MetaMask", action: { kind: "link", href: `https://metamask.app.link/dapp/${host}`, label: "Open in app" } });
  else out.push({ key: "metamask", name: "MetaMask", action: { kind: "link", href: "https://metamask.io/download", label: "Install" } });

  const wc = connectors.find((c) => c.id === "walletConnect");
  out.push({ key: "walletconnect", name: "WalletConnect",
    action: wc ? { kind: "connect", connectorId: wc.id } : { kind: "unavailable", reason: "Not configured" } });

  const cb = find(connectors, "coinbase");
  const cbSdk = connectors.find((c) => c.id === "coinbaseWalletSDK");
  if (cb) used.add(cb.id);
  const cbPick = cb ?? cbSdk;
  out.push({ key: "coinbase", name: "Coinbase Wallet", icon: cb?.icon,
    action: cbPick ? { kind: "connect", connectorId: cbPick.id } : { kind: "link", href: "https://www.coinbase.com/wallet", label: "Install" } });

  const rabby = find(connectors, "rabby");
  if (rabby) { used.add(rabby.id); out.push({ key: "rabby", name: "Rabby Wallet", icon: rabby.icon, action: { kind: "connect", connectorId: rabby.id } }); }
  else out.push({ key: "rabby", name: "Rabby Wallet", action: { kind: "link", href: "https://rabby.io", label: "Install" } });

  for (const c of discovered(connectors)) {
    if (used.has(c.id)) continue;
    out.push({ key: c.id, name: c.name, icon: c.icon, action: { kind: "connect", connectorId: c.id } });
  }
  // A wallet injected without EIP-6963 support and not already offered as MetaMask.
  if (hasEthereum && generic && !out.some((o) => o.action.kind === "connect" && o.action.connectorId === generic.id))
    out.push({ key: "browser", name: "Browser wallet", action: { kind: "connect", connectorId: generic.id } });
  return out;
}
