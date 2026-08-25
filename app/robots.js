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
// ⚠️ OAI-SearchBot STÅR EKSPLICIT, SELVOM "*" ALLEREDE TILLADER DEN. Wildcarden
// dækker den teknisk, men en eksplicit regel gør beslutningen læsbar: den dag nogen
// strammer "*" til noget snævrere, følger søge-crawleren ikke med i faldet uden at
// nogen tager stilling. Token-navnet er verificeret mod OpenAIs egen dokumentation
// 25-08-2026 (developers.openai.com/api/docs/bots).
//
// ⚠️ OAI-SearchBot ER SØGNING, IKKE TRÆNING. Den henter sider, så ChatGPT Search kan
// vise og citere dem — det er discovery, og det er dét vi vil have.
//
// ⚠️ GPTBot ER TILLADT — BESLUTTET AF JONAS 25-08-2026. Den henter til
// MODELTRÆNING, hvilket er et andet spørgsmål end at blive fundet i en søgning, og
// derfor er den sin egen regel: skal træning en dag frabedes, ændres kun denne linje
// til `disallow: "/"`, uden at søge-crawleren rører sig.
//
// Reglen stod ikke her før. Wildcarden tillod den allerede, så adfærden er uændret —
// men nu er tilladelsen et valg nogen har truffet frem for en bivirkning af "*".
//
// ⚠️ ChatGPT-User er brugerudløst (nogen beder ChatGPT om at åbne birdly.dk) og
// respekterer ifølge OpenAI ikke nødvendigvis robots.txt. Den kan derfor hverken
// tillades eller spærres herfra — den er nævnt så ingen leder forgæves.
export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
