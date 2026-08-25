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
// ⚠️ GPTBot ER IKKE NÆVNT HER, OG DET ER EN BEVIDST IKKE-BESLUTNING (Jonas 25-08).
// GPTBot henter til modeltræning, og det er et andet spørgsmål end at blive fundet.
// MEN: fordi "*" tillader alt, HAR GPTBot adgang i dag. At undlade at nævne den er
// altså ikke det samme som at holde den ude. Skal træning frabedes, kræver det en
// EKSPLICIT { userAgent: "GPTBot", disallow: "/" } — ikke bare tavshed.
//
// ⚠️ ChatGPT-User er brugerudløst (nogen beder ChatGPT om at åbne birdly.dk) og
// respekterer ifølge OpenAI ikke nødvendigvis robots.txt. Den kan derfor hverken
// tillades eller spærres herfra — den er nævnt så ingen leder forgæves.
export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
