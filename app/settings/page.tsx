import { SettingsView } from "@/components/SettingsView";
import { PageHeader } from "@/components/ui/server";
export const metadata = { title: "Settings" };
export default function Page() { return <div className="stack"><PageHeader title="Settings" back="/more" /><SettingsView /></div>; }
