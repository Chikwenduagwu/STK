import { createConfig, fallback, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

/** Reads go through our own /api/rpc proxy (server picks a working RPC); direct public RPCs are only a last resort. */
const proxyUrl = typeof window !== "undefined" ? `${window.location.origin}/api/rpc` : "http://localhost:3000/api/rpc";
const DIRECT = ["https://ethereum-rpc.publicnode.com", "https://eth.llamarpc.com"];

export const wagmiConfig = createConfig({
  chains: [mainnet],
  ssr: true,
  // EIP-6963 discovery (default) adds every installed browser wallet as its own connector at runtime.
  connectors: [
    injected(),
    coinbaseWallet({ appName: "STK" }),
    ...(wcProjectId ? [walletConnect({ projectId: wcProjectId })] : []),
  ],
  transports: { [mainnet.id]: fallback([http(proxyUrl, { batch: true }), ...DIRECT.map((u) => http(u, { batch: true }))], { retryCount: 1 }) },
});
