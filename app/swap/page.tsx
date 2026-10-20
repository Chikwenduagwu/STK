import { redirect } from "next/navigation";
export default async function SwapRedirect({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const sp = await searchParams; const q = new URLSearchParams();
  if (sp.from) q.set("from", sp.from); if (sp.to) q.set("to", sp.to);
  redirect(q.size ? `/?${q}` : "/");
}
