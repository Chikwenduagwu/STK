/** Ethereum JSON-RPC forwarding used by /api/rpc. Server-side so the browser never talks to third-party RPCs directly. */
export const ALLOWED_METHODS = new Set([
  "eth_call", "eth_getBalance", "eth_chainId", "eth_blockNumber", "eth_getBlockByNumber", "eth_getTransactionReceipt",
  "eth_getTransactionByHash", "eth_estimateGas", "eth_gasPrice", "eth_maxPriorityFeePerGas", "eth_feeHistory", "eth_getCode",
  "eth_getTransactionCount", "net_version",
]);
const PUBLIC_RPCS = ["https://ethereum-rpc.publicnode.com", "https://eth.llamarpc.com", "https://1rpc.io/eth", "https://eth.drpc.org"];
const MAX_BATCH = 100;

export const upstreams = (): string[] => [process.env.ETH_RPC_URL, ...PUBLIC_RPCS].filter((u): u is string => !!u && /^https:\/\//.test(u));

type Call = { jsonrpc: "2.0"; id: unknown; method: string; params?: unknown[] };
export function validate(payload: unknown): { ok: true } | { ok: false; error: string } {
  const calls = Array.isArray(payload) ? payload : [payload];
  if (calls.length === 0 || calls.length > MAX_BATCH) return { ok: false, error: "invalid batch size" };
  for (const c of calls as Call[]) {
    if (!c || typeof c !== "object" || c.jsonrpc !== "2.0" || typeof c.method !== "string") return { ok: false, error: "invalid request" };
    if (!ALLOWED_METHODS.has(c.method)) return { ok: false, error: `method not allowed: ${c.method}` };
    if (c.params !== undefined && !Array.isArray(c.params)) return { ok: false, error: "invalid params" };
  }
  return { ok: true };
}

const rateLimited = (j: unknown) => {
  const items = Array.isArray(j) ? j : [j];
  return items.some((x) => x && typeof x === "object" && "error" in x && [-32005, -32097, 429].includes(Number((x as { error?: { code?: number } }).error?.code)));
};

export async function forward(payload: unknown, urls: string[] = upstreams(), fetchImpl: typeof fetch = fetch): Promise<{ ok: true; body: unknown; upstream: string } | { ok: false; error: string }> {
  let last = "no upstream configured";
  for (const url of urls) {
    try {
      const res = await fetchImpl(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(8000) });
      if (!res.ok) { last = `${new URL(url).host} returned ${res.status}`; continue; }
      const body = await res.json();
      if (rateLimited(body)) { last = `${new URL(url).host} rate limited`; continue; }
      return { ok: true, body, upstream: new URL(url).host };
    } catch (e) { last = `${new URL(url).host}: ${e instanceof Error ? e.message.slice(0, 80) : "failed"}`; }
  }
  return { ok: false, error: last };
}
