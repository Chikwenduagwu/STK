# STK

Swap tokenized stocks on Ethereum with an onchain risk check. Swaps execute on Uniswap v3. Risk states come from a
GenLayer Intelligent Contract that evaluates public evidence about the issuer, mapped to LOW / ELEVATED / HIGH / CRITICAL
by an explicit, deterministic policy.

- **Swap**: USDC / WETH / ETH to and from TSLAx and NVDAx (xStocks). Quotes come from Uniswap's QuoterV2 across all fee tiers
  and two-hop routes via WETH/USDC; execution goes through SwapRouter02 with slippage and a 20 minute deadline.
- **Risk guard**: buying a stock rated HIGH or CRITICAL requires an explicit acknowledgement.
- **Wallets**: MetaMask, Rabby, Coinbase Wallet and any EIP-6963 browser wallet; WalletConnect when a project ID is set. On a phone browser with no wallet, MetaMask opens via deep link.
- **Screens**: splash, welcome, overview, stocks, stock detail, swap, portfolio, events, event detail, evidence, risk policy, how it works, notifications, settings, connect wallet. Mobile-first with a bottom tab bar; light and dark themes.

## Stack
Next.js (App Router), TypeScript, wagmi + viem, TanStack Query, Zod, genlayer-js. No database; no paid APIs.

## Setup
```bash
npm install
cp .env.example .env.local
npm test && npm run build && npm run dev
```

### 1. GenLayer contract (already linked)
The app is wired to the Studio deployment in `lib/genlayer/config.ts` (network, chain ID 61999, RPC, contract address, explorer).
To point at a different deployment, edit that one file. To redeploy the contract, upload `contracts/genlayer/stockguard.py` in GenLayer Studio
(do not paste it) and validate first with `pip install genvm-linter && genvm-lint check contracts/genlayer/stockguard.py`.
`npm run resolve-address -- <deployTxHash>` prints the contract address for a deploy transaction.

### 2. Publish evaluations
```bash
OPERATOR_PRIVATE_KEY=0x... npm run evaluate -- NVDAx REGULATORY "Has NVIDIA or a regulator publicly announced a material regulatory investigation of NVIDIA in the last 90 days?"
```
Use a Studio account (fund it with the faucet in the Studio account selector). The key is only for this CLI script; never add it to Vercel or any `NEXT_PUBLIC_` variable.

### 3. Deploy the app
Import the repo into Vercel (Next.js preset). No GenLayer variables are needed. Set `NEXT_PUBLIC_ETH_RPC_URL` (use a dedicated RPC; a quote fans out to about 16 calls and public endpoints rate-limit). Optionally set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (free at cloud.reown.com) to enable WalletConnect.

## Notes and limits
- Swaps need an existing Uniswap v3 pool. If none exists for a pair, the UI says "No Uniswap v3 route found". v4-only liquidity is not routed.
- Token addresses (`lib/assets/registry.ts`) were matched across Uniswap, Etherscan and exchange listings; confirm them against the issuer's list. Decimals are read onchain.
- Issuer terms may restrict who can hold tokenized stocks; a restricted transfer will revert.
- Prices and portfolio valuation are intentionally absent (no verified price source). Policies are static configuration.
- Not audited. Test with small amounts first.
