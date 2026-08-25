import { BRANCHER } from "../lib/branche";
import { alleFagGeo } from "../lib/regioner";
import { SITE_URL } from "../lib/site";
import { KLARE_GUIDES } from "../lib/viden";

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
    // ⚠️ B2C-FUNNELEN. Egen soegeintention ("find haandvaerker"), egen title og egen
    // selv-refererende canonical - se app/opret-opgave/page.js. Den konkurrerer
    // derfor ikke med roden, som er B2B.
    //
    // ⚠️ DEN STAAR HER FOER NOINDEX ER FJERNET, og det er med vilje: sitemap og
    // noindex trækker ikke hver sin vej. Et sitemap er en INVITATION til at crawle,
    // og Google SKAL kunne crawle siden for overhovedet at laese vores noindex.
    // Saa laenge robots-blokken staar i page.js, bliver den ikke indekseret; den dag
    // blokken fjernes, er siden allerede annonceret og bliver fundet med det samme.
    "/opret-opgave",
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
  // ⚠️ KUN PUBLICEREDE GUIDES. En URL i sitemap er en invitation til at crawle;
  // peger den paa en tom eller noindex-side, bruger vi crawl-budget paa at vise
  // ingenting. Er ingen guides klar, ryger /viden-forsiden ogsaa ud - den er
  // noindex indtil da (se app/viden/page.js).
  const videnPaths = KLARE_GUIDES.length
    ? ["/viden", ...KLARE_GUIDES.map((g) => "/viden/" + g.slug)]
    : [];
  // De 16 fag×geo-sider. Samme kilde som ruterne, så sitemap og virkelighed ikke
  // kan komme til at pege hver sin vej.
  const geoPaths = alleFagGeo().map(({ fag, region }) => `/fag/${fag}/${region}`);

  return [...staticPaths, ...videnPaths, ...fagPaths, ...geoPaths].map((p) => ({
    url: BASE + (p || "/"),
    changeFrequency: p === "" ? "daily" : "weekly",
    priority:
      p === "" ? 1
      : p === "/opret-opgave" ? 0.9
      : p === "/viden" ? 0.7
      : p.startsWith("/viden/") ? 0.6
      : p.startsWith("/fag/") || p === "/brancher" ? 0.8
      : 0.5,
  }));
}
