// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: "0x1111111111111111111111111111111111111111", isConnected: true }),
  useSignMessage: () => ({ signMessageAsync: async () => "0x" + "ab".repeat(65) }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/components/wallet/WalletModal", () => ({ useWalletModal: () => ({ open: vi.fn() }) }));

import { EvaluateButton } from "../components/EvaluateButton";

const RISK = { status: "ok", state: "LOW", evaluations: 1, latestId: 0, stale: false, latest: { detected: false, eventType: "NONE", severity: "NONE" } };
function mockFetch(evaluate: () => Response) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => (String(url).startsWith("/api/risk") ? new Response(JSON.stringify(RISK)) : evaluate())));
}
const ui = () => render(<QueryClientProvider client={new QueryClient()}><EvaluateButton symbol="NVDAx" /></QueryClientProvider>);

describe("evaluation fallback to the previous verified result", () => {
  beforeEach(() => vi.useRealTimers());
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it("shows the latest verified evaluation when the service rejects a new one", async () => {
    mockFetch(() => new Response(JSON.stringify({ error: "The evaluation service is temporarily unavailable. The latest verified result is still shown." }), { status: 502 }));
    ui(); fireEvent.click(screen.getByRole("button", { name: /run new evaluation/i }));
    fireEvent.click(await screen.findByRole("button", { name: /sign and start evaluation/i }));
    expect(await screen.findByText(/didn.t complete/i)).toBeTruthy();
    await waitFor(() => expect(screen.getByText("Latest verified result")).toBeTruthy());
    expect(screen.getAllByText(/low risk/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/evaluation #0/i)).toBeTruthy();
    expect(screen.getByText(/swap isn.t affected/i)).toBeTruthy();
  });

  it("offers a retry after a failure", async () => {
    mockFetch(() => new Response(JSON.stringify({ error: "x" }), { status: 429 }));
    ui(); fireEvent.click(screen.getByRole("button", { name: /run new evaluation/i }));
    fireEvent.click(await screen.findByRole("button", { name: /sign and start evaluation/i }));
    fireEvent.click(await screen.findByRole("button", { name: /try again/i }));
    expect(await screen.findByRole("button", { name: /sign and start evaluation/i })).toBeTruthy();
  });
});
