// Operator script: submits an evaluation to the deployed contract. Needs OPERATOR_PRIVATE_KEY (GenLayer account with gas).
import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { GENLAYER } from "../lib/genlayer/config";
import { ASSETS, getAssetBySymbol } from "../lib/assets/registry";
const [symbol, eventType, ...q] = process.argv.slice(2);
const asset = symbol && getAssetBySymbol(symbol);
if (!asset || !eventType || q.length === 0) { console.error('usage: npm run evaluate -- NVDAx REGULATORY "Has ... within the last 90 days?"'); console.error("assets:", ASSETS.map((a) => a.symbol).join(", ")); process.exit(1); }
const key = process.env.OPERATOR_PRIVATE_KEY, address = GENLAYER.contractAddress;
if (!key) { console.error("Set OPERATOR_PRIVATE_KEY (a Studio account private key)"); process.exit(1); }
const client = createClient({ chain: studionet, endpoint: GENLAYER.rpcUrl, account: createAccount(key as `0x${string}`) });
const hash = await client.writeContract({ address: address as `0x${string}`, functionName: "evaluate_asset_event", args: [asset.symbol, eventType, q.join(" "), JSON.stringify(asset.sources.map(({ url, category }) => ({ url, category })))], value: 0n });
console.log("submitted", hash);
console.log(await client.waitForTransactionReceipt({ hash, retries: 60, interval: 5000 }));
