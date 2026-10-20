import { NextResponse } from "next/server";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { GENLAYER } from "@/lib/genlayer/config";
import { mapStatus } from "@/lib/evaluate/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const hash = new URL(req.url).searchParams.get("hash") ?? "";
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) return NextResponse.json({ error: "Invalid transaction hash." }, { status: 400 });
  try {
    const client = createClient({ chain: studionet, endpoint: GENLAYER.rpcUrl });
    const tx = await client.getTransaction({ hash: hash as never });
    return NextResponse.json(mapStatus(tx as { statusName?: string; txExecutionResultName?: string }));
  } catch {
    // The transaction may not be indexed yet right after submission.
    return NextResponse.json(mapStatus(null));
  }
}
