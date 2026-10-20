import { NextResponse } from "next/server";
import { forward, validate } from "@/lib/rpc/proxy";

export const dynamic = "force-dynamic";

/** Read-only Ethereum JSON-RPC proxy (allowlisted methods). Wallet transactions go through the user's wallet, not here. */
export async function POST(req: Request) {
  const text = await req.text();
  if (text.length > 100_000) return NextResponse.json({ error: "payload too large" }, { status: 413 });
  let payload: unknown;
  try { payload = JSON.parse(text); } catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }
  const v = validate(payload);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const r = await forward(payload);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 502 });
  return NextResponse.json(r.body, { headers: { "cache-control": "no-store" } });
}
