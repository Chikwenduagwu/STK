// Prints the contract address created by a GenLayer deploy transaction.
// usage: npm run resolve-address -- 0x<64-hex tx hash>
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { GENLAYER } from "../lib/genlayer/config";
const hash = process.argv[2];
if (!/^0x[0-9a-fA-F]{64}$/.test(hash ?? "")) { console.error("Pass the 66-character deploy transaction hash."); process.exit(1); }
const client = createClient({ chain: studionet, endpoint: GENLAYER.rpcUrl });
const tx = await client.getTransaction({ hash: hash as never });
const addr = (tx as { recipient?: string; to_address?: string }).recipient ?? (tx as { to_address?: string }).to_address;
console.log(addr ? `Contract address: ${addr}` : "No address on this transaction yet. It may still be pending; retry shortly.");
