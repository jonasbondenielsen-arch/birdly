import { BRANCHER } from "../lib/branche";
import { alleFagGeo } from "../lib/regioner";
import { SITE_URL } from "../lib/site";

// Sitemap for Google. Offentlige sider + alle 20 branchesider + samlesiden.
// Værten kommer fra lib/site.js, så sitemap og canonical ALDRIG kan pege forskellige
// steder hen — de 31 URL'er her pegede før på apex, som omdirigerer.
const BASE = SITE_URL;

export default function sitemap() {
  const staticPaths = [
    // ⚠️ RODEN ER DEN KANONISKE INDGANG (03-08-2026). Salgssiden bor her, og det er
    // den Google skal vise. Hverken /tilmeld eller /ny står i listen: begge
    // omdirigerer permanent hertil, og en 301'et URL hører ikke hjemme i et sitemap
    // — den ville bede Google indeksere noget der svarer "flyt videre".
    //
    // ⚠️ /start STÅR HELLER IKKE HER, og det er ikke en forglemmelse. Den er flowet
    // BAG CTA'en, ikke en landingsside; den er noindex. Stod den her, ville vi bede
    // Google indeksere et CVR-felt og sende folk uden om hele salgssiden.
    "",
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
  // De 16 fag×geo-sider. Samme kilde som ruterne, så sitemap og virkelighed ikke
  // kan komme til at pege hver sin vej.
  const geoPaths = alleFagGeo().map(({ fag, region }) => `/fag/${fag}/${region}`);

  return [...staticPaths, ...fagPaths, ...geoPaths].map((p) => ({
    url: BASE + (p || "/"),
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : p.startsWith("/fag/") || p === "/brancher" ? 0.8 : 0.5,
  }));
}
