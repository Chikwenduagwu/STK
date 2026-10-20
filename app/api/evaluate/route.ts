import { NextResponse } from "next/server";
import { z } from "zod";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { getAddress, type Hex } from "viem";
import { getAssetBySymbol } from "@/lib/assets/registry";
import { GENLAYER } from "@/lib/genlayer/config";
import { buildQuestion, isEventType } from "@/lib/evaluate/templates";
import { isFresh, RateLimiter, verifyRequest } from "@/lib/evaluate/auth";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const body = z.object({
  symbol: z.string().max(16), eventType: z.string().max(32), issuedAt: z.number().int(),
  address: z.string().regex(/^0x[0-9a-fA-F]{40}$/), signature: z.string().regex(/^0x[0-9a-fA-F]{130,}$/),
});
const perAddress = new RateLimiter(120_000, 1), perTopic = new RateLimiter(60_000, 1), global = new RateLimiter(3_600_000, 30);
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const raw = process.env.OPERATOR_PRIVATE_KEY?.trim();
  const key = raw ? (raw.startsWith("0x") ? raw : `0x${raw}`) : "";
  if (!/^0x[0-9a-fA-F]{64}$/.test(key)) return fail("Evaluations are not enabled right now.", 503);

  let parsed: z.infer<typeof body>;
  try { parsed = body.parse(await req.json()); } catch { return fail("Invalid request.", 400); }
  const asset = getAssetBySymbol(parsed.symbol);
  if (!asset || !asset.supported || !isEventType(parsed.eventType)) return fail("Unsupported asset or event type.", 400);
  if (!isFresh(parsed.issuedAt)) return fail("This request expired. Please try again.", 400);
  const address = getAddress(parsed.address);
  if (!(await verifyRequest({ address, signature: parsed.signature as Hex, symbol: parsed.symbol, eventType: parsed.eventType, issuedAt: parsed.issuedAt })))
    return fail("Signature could not be verified. Smart-contract wallets are not supported yet.", 401);
  if (!perAddress.take(address) || !perTopic.take(`${asset.symbol}:${parsed.eventType}`) || !global.take("all"))
    return fail("An evaluation was requested very recently. Please wait a moment and try again.", 429);

  try {
    const client = createClient({ chain: studionet, endpoint: GENLAYER.rpcUrl, account: createAccount(key as Hex) });
    const hash = await client.writeContract({
      address: GENLAYER.contractAddress, functionName: "evaluate_asset_event", value: 0n,
      args: [asset.symbol, parsed.eventType, buildQuestion(asset.company, parsed.eventType), JSON.stringify(asset.sources.map(({ url, category }) => ({ url, category })))],
    });
    return NextResponse.json({ hash });
  } catch {
    return fail("The evaluation service is temporarily unavailable. The latest verified result is still shown.", 502);
  }
}
