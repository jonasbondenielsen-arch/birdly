// ============================================================================
// SITE_URL — én sandhed om hvilken adresse siden ER.
//
// ⚠️ VÆRTEN SKAL MATCHE DEN DER SVARER 200. birdly.dk svarer 308 og sender videre
// til www.birdly.dk. Stod canonical og sitemap på apex — som de gjorde indtil nu —
// pegede hver eneste URL vi selv udgav på en adresse der omdirigerer. Google får da
// et canonical-tag der udpeger noget andet end det den fik serveret, og resultatet er
// at siden bliver crawlet og lagt til side igen.
//
// ⚠️ ADRESSEN STÅR IKKE LÆNGERE HER — DEN STÅR I lib/markets.js (07-09-2026,
// multimarket Fase 1). Værdien er nøjagtig den samme; den kommer bare nu fra
// markedsmodellen i stedet for at være skrevet i hånden, så domænet findes ét
// sted den dag der er mere end ét marked. Ændres værten, rettes den i
// `MARKEDER.DK.domaener` — og samtidig i `market_domains` i databasen
// (birdly-admin, migration 0121), som er den autoritative kilde.
//
// ⚠️ DET ER FORTSAT EN KONSTANT, IKKE ET OPSLAG PR. REQUEST. Metadata,
// canonical og sitemap bygges på servertidspunkt; udledte vi værten af den
// indkommende request, ville hver statisk side blive dynamisk og miste sin
// cache. Så længe der kun serveres ét marked, er en konstant både rigtig og
// billigere. Når GB-frontenden kommer (Fase 6), er det HER omlægningen sker —
// `markedForHost()` i lib/markets.js er allerede skrevet til det — og det er en
// bevidst beslutning med SEO-konsekvenser, ikke en detalje der kan smutte med.
// ============================================================================
import { MARKEDER, baseUrl, STANDARD_MARKED } from "./markets";

export const SITE_URL = baseUrl(STANDARD_MARKED);

/** Absolut URL til en sti. abs("/fag/vvs") → "https://www.birdly.dk/fag/vvs" */
export function abs(path = "") {
  return SITE_URL + (path.startsWith("/") ? path : "/" + path);
}

/**
 * Absolut URL i ET BESTEMT marked. Bruges til links i mails og SMS, som skal
 * bygges for det marked kunden hører til. `abs()` har med vilje ikke fået et
 * andet-argument der stiltiende defaulter til Danmark.
 */
export function absForMarked(markedId, path = "") {
  const base = baseUrl(markedId);
  if (!base) return null;
  return base + (path.startsWith("/") ? path : "/" + path);
}

/**
 * Markedet for en indkommende request, læst af headeren middleware sætter.
 *
 * ⚠️ DEN GØR EN SIDE DYNAMISK. `headers()` opter ruten ud af statisk
 * rendering. Brug den KUN på sider der faktisk skal opføre sig forskelligt pr.
 * marked — ikke som en generel hjælper. De statiske sider skal blive statiske.
 *
 * @param {Headers} headers  fra Next' `headers()`
 */
export function markedFraHeaders(headers) {
  return headers?.get?.("x-birdly-marked") || STANDARD_MARKED;
}

/** Base-URL for en request. Se advarslen i markedFraHeaders. */
export function baseUrlFraHeaders(headers) {
  return baseUrl(markedFraHeaders(headers)) || SITE_URL;
}

/**
 * hreflang-alternativer til `metadata.alternates.languages`.
 *
 * ⚠️ KUN AKTIVE MARKEDER. Et hreflang der peger på et domæne der ikke svarer,
 * er ikke neutralt — Google behandler det som en brudt signalkæde og kan lade
 * være med at stole på HELE gruppen, også den danske side. Så længe GB er
 * `aktiv: false`, returnerer funktionen kun DK, og Next udelader en gruppe med
 * ét sprog. Metadata på de danske sider er derfor bit-for-bit uændret.
 *
 * ⚠️ DEN TAGER STIEN, IKKE HELE URL'EN. Samme sti findes på begge domæner —
 * det er hele pointen med hreflang. Skal en side have forskellige stier pr.
 * marked, hører den ikke i denne funktion.
 */
export function hreflangFor(path = "/") {
  const ud = {};
  for (const m of Object.values(MARKEDER)) {
    if (m.aktiv === false) continue;
    const base = baseUrl(m.id);
    if (!base) continue;
    ud[m.locale] = base + (path.startsWith("/") ? path : "/" + path);
  }
  // Én enkelt locale er ikke en hreflang-gruppe — så ville vi udgive et signal
  // om et alternativ der ikke findes.
  return Object.keys(ud).length > 1 ? ud : null;
}
