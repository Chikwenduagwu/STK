import { ConnectView } from "@/components/ConnectView";
import { PageHeader } from "@/components/ui/server";
export const metadata = { title: "Connect wallet" };
export default function Page() { return <div className="stack"><PageHeader title="Connect wallet" back="/more" /><p className="muted">Choose a wallet to connect. STK never takes custody of your funds.</p><ConnectView /></div>; }
