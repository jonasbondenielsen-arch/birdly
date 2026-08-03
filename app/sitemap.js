import { BRANCHER } from "../lib/branche";
import { alleFagGeo } from "../lib/regioner";
import { SITE_URL } from "../lib/site";

// Sitemap for Google. Offentlige sider + alle 20 branchesider + samlesiden.
// Værten kommer fra lib/site.js, så sitemap og canonical ALDRIG kan pege forskellige
// steder hen — de 31 URL'er her pegede før på apex, som omdirigerer.
const BASE = SITE_URL;

export default function sitemap() {
  const staticPaths = [
    // ⚠️ RODEN ER HUSETS KANONISKE FORSIDE (03-08-2026). Den bærer hele
    // forklaringslaget og alle tolv FAQ-svar — det er den Google skal vise.
    //
    // ⚠️ TRE ADRESSER STÅR BEVIDST IKKE HER, og ingen af dem er en forglemmelse:
    //   /kom-i-gang  salgssiden. Landingsside for betalt trafik og noindex: den
    //                sælger det samme til den samme søgende som roden, og fire af
    //                dens FAQ-svar er ordret rodens. Indekseret ville den
    //                konkurrere med netop den side den skal føde.
    //   /start       CVR-funnelen. Flowet BAG CTA'en, ikke en landingsside.
    //                Stod den her, ville vi bede Google indeksere et CVR-felt.
    //   /tilmeld     omdirigerer permanent til salgssiden. En 301'et URL hører
    //                ikke hjemme i et sitemap — den svarer "flyt videre".
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
