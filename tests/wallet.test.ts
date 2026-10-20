import { describe, expect, it } from "vitest";
import { buildWalletOptions, type ConnectorInfo } from "../lib/wallet/options";
const base: ConnectorInfo[] = [{ id: "injected", name: "Injected", type: "injected" }, { id: "coinbaseWalletSDK", name: "Coinbase Wallet", type: "coinbaseWallet" }];
const by = (o: ReturnType<typeof buildWalletOptions>, k: string) => o.find((x) => x.key === k)!;
describe("buildWalletOptions", () => {
  it("desktop with no wallet: install links, coinbase SDK usable, walletconnect not configured", () => {
    const o = buildWalletOptions({ connectors: base, hasEthereum: false, isMobile: false, host: "x.app" });
    expect(by(o, "metamask").action).toMatchObject({ kind: "link", href: "https://metamask.io/download" });
    expect(by(o, "coinbase").action).toEqual({ kind: "connect", connectorId: "coinbaseWalletSDK" });
    expect(by(o, "walletconnect").action.kind).toBe("unavailable");
    expect(by(o, "rabby").action.kind).toBe("link");
  });
  it("mobile browser without a wallet deep-links into the MetaMask app", () => {
    const o = buildWalletOptions({ connectors: base, hasEthereum: false, isMobile: true, host: "stockguard.vercel.app" });
    expect(by(o, "metamask").action).toMatchObject({ kind: "link", href: "https://metamask.app.link/dapp/stockguard.vercel.app" });
  });
  it("wallet in-app browser (window.ethereum, no 6963) connects through the injected connector", () => {
    const o = buildWalletOptions({ connectors: base, hasEthereum: true, isMobile: true, host: "x" });
    expect(by(o, "metamask").action).toEqual({ kind: "connect", connectorId: "injected" });
  });
  it("uses EIP-6963 discovered wallets and lists unknown ones", () => {
    const cs = [...base, { id: "io.metamask", name: "MetaMask", type: "injected", icon: "data:x" }, { id: "io.rabby", name: "Rabby", type: "injected" }, { id: "app.phantom", name: "Phantom", type: "injected" }];
    const o = buildWalletOptions({ connectors: cs, hasEthereum: true, isMobile: false, host: "x" });
    expect(by(o, "metamask").action).toEqual({ kind: "connect", connectorId: "io.metamask" });
    expect(by(o, "rabby").action).toEqual({ kind: "connect", connectorId: "io.rabby" });
    expect(by(o, "app.phantom").action).toEqual({ kind: "connect", connectorId: "app.phantom" });
  });
  it("enables WalletConnect when its connector exists", () => {
    const o = buildWalletOptions({ connectors: [...base, { id: "walletConnect", name: "WalletConnect", type: "walletConnect" }], hasEthereum: false, isMobile: true, host: "x" });
    expect(by(o, "walletconnect").action).toEqual({ kind: "connect", connectorId: "walletConnect" });
  });
});
