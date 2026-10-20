import { PortfolioView } from "@/components/PortfolioView";
import { PageHeader } from "@/components/ui/server";
export const metadata = { title: "Portfolio" };
export default function Page() { return <div className="stack"><PageHeader title="Portfolio" /><PortfolioView /></div>; }
