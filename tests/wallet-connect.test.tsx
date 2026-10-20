// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createConfig, http, useAccount, WagmiProvider } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletList } from "../components/wallet/WalletModal";

const ADDR = "0x1111111111111111111111111111111111111111";
function stubProvider() {
  (window as unknown as { ethereum: unknown }).ethereum = {
    request: async ({ method }: { method: string }) => {
      if (method === "eth_requestAccounts" || method === "eth_accounts") return [ADDR];
      if (method === "eth_chainId") return "0x1";
      return null;
    }, on() {}, removeListener() {},
  };
}
function Probe() { const { address, isConnected } = useAccount(); return <div data-testid="state">{isConnected ? address : "disconnected"}</div>; }

describe("wallet connect flow", () => {
  afterEach(() => { cleanup(); delete (window as unknown as { ethereum?: unknown }).ethereum; });
  it("connects through a browser-injected wallet when the MetaMask row is clicked", async () => {
    stubProvider();
    const config = createConfig({ chains: [mainnet], connectors: [injected()], transports: { [mainnet.id]: http("http://localhost:1") }, multiInjectedProviderDiscovery: false });
    render(<WagmiProvider config={config}><QueryClientProvider client={new QueryClient()}><Probe /><WalletList /></QueryClientProvider></WagmiProvider>);
    fireEvent.click(await screen.findByRole("button", { name: /MetaMask/i }));
    await waitFor(() => expect(screen.getByTestId("state").textContent?.toLowerCase()).toBe(ADDR));
  });
  it("shows an install link (not a dead button) when no wallet is present on desktop", async () => {
    const config = createConfig({ chains: [mainnet], connectors: [injected()], transports: { [mainnet.id]: http("http://localhost:1") }, multiInjectedProviderDiscovery: false });
    render(<WagmiProvider config={config}><QueryClientProvider client={new QueryClient()}><WalletList /></QueryClientProvider></WagmiProvider>);
    const link = await screen.findByRole("link", { name: /MetaMask/i });
    expect(link.getAttribute("href")).toContain("metamask");
  });
});
