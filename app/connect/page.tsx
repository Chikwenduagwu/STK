import { ConnectView } from "@/components/ConnectView";
import { PageHeader } from "@/components/ui/server";
export const metadata = { title: "Connect Wallet" };
export default function Page() { return <div className="stack"><PageHeader title="Connect Wallet" back="/more" /><ConnectView /></div>; }
