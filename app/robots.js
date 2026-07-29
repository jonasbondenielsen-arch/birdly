import { SITE_URL } from "../lib/site";

// ============================================================================
// robots.txt — fandtes ikke (404) indtil nu.
//
// Den blokerede ingenting, men den er Googles FØRSTE stop, og det er dér man peger
// på sit sitemap. Uden robots.txt, uden Search Console og uden backlinks havde
// Google ingen anledning til at finde siden overhovedet. Sitemap'et lå der — ingen
// havde bare fortalt nogen om det.
//
// ⚠️ TOKEN-SIDERNE SPÆRRES IKKE HER, OG DET ER MED VILJE. De bærer allerede
// `noindex, nofollow` i deres eget metadata, hvilket er det stærke værn: Disallow i
// robots.txt forhindrer crawl, men IKKE indeksering — en URL der linkes udefra kan
// stadig havne i søgeresultatet som en bar adresse, og så har vi udstillet at
// token'et findes. Værre endnu: er siden spærret for crawl, kan Google ikke LÆSE
// vores noindex. De to ting trækker hver sin vej, og noindex vinder.
// ============================================================================
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
