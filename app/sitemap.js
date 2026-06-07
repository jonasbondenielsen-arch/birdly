import { BRANCHER } from "../lib/branche";

// Sitemap for Google. Offentlige sider + alle 20 branchesider + samlesiden.
const BASE = "https://birdly.dk";

export default function sitemap() {
  const staticPaths = [
    "",
    "/tilmeld",
    "/brancher",
    "/udbud-for-alle",
    "/betingelser",
    "/handelsbetingelser",
    "/privatlivspolitik",
    "/cookiepolitik",
    "/vilkaar-for-brug",
    "/sikkerhed-og-drift",
    "/underdatabehandlere",
  ];
  const fagPaths = BRANCHER.map((b) => "/fag/" + b.slug);

  return [...staticPaths, ...fagPaths].map((p) => ({
    url: BASE + (p || "/"),
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : p.startsWith("/fag/") || p === "/tilmeld" || p === "/brancher" ? 0.8 : 0.5,
  }));
}
