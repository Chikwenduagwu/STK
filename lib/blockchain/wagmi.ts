import { createConfig, fallback, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const custom = process.env.NEXT_PUBLIC_ETH_RPC_URL;

/** Your own RPC (if set) is tried first; free public endpoints back it up so one outage doesn't break balances and quotes. */
const PUBLIC_RPCS = ["https://ethereum-rpc.publicnode.com", "https://eth.llamarpc.com", "https://1rpc.io/eth"];

export const wagmiConfig = createConfig({
  chains: [mainnet],
  ssr: true,
  // EIP-6963 discovery (default) adds every installed browser wallet as its own connector at runtime.
  connectors: [
    injected(),
    coinbaseWallet({ appName: "STK" }),
    ...(wcProjectId ? [walletConnect({ projectId: wcProjectId })] : []),
  ],
  transports: {
    [mainnet.id]: fallback([...(custom ? [http(custom, { batch: true })] : []), ...PUBLIC_RPCS.map((u) => http(u, { batch: true }))], { retryCount: 2 }),
  },
});
