import Link from "next/link";
import { SearchX } from "lucide-react";
export default function NotFound() {
  return (<div className="state-card tall"><span className="state-ico"><SearchX size={28} /></span><h3>Page not found</h3><p>The page you&apos;re looking for doesn&apos;t exist or has moved.</p><Link href="/" className="btn block">Back to swap</Link></div>);
}
