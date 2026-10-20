import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "STK", short_name: "STK", description: "Swap tokenized stocks with onchain risk intelligence.", start_url: "/", display: "standalone", background_color: "#ffffff", theme_color: "#ffffff", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] };
}
