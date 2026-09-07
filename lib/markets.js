// ============================================================================
// MARKEDER — frontendens spejl af `markets` + `market_domains` i databasen.
//
// ⚠️ HVORFOR DET ER ET SPEJL OG IKKE ET OPSLAG.
// Den offentlige side har kun anon-nøglen, og markeds-tabellerne er lukket bag
// RLS. Skulle en sidevisning kende sit eget domæne, ville den altså skulle
// spørge en Edge Function om det — et netværkskald pr. render, for at få svar
// på noget der ændrer sig et par gange om året. Metadata, canonical, sitemap og
// OG-tags bygges desuden på servertidspunkt; et opslag dér ville gøre statiske
// sider dynamiske og koste dem deres cache.
//
// Samme afvejning som lib/pakke.js, der spejler priserne fra Frisbii: den
// autoritative kilde ligger et andet sted, og vi holder en lille, eksplicit
// kopi tæt på det der skal bruge den.
//
// ⚠️ ÆNDRES ET DOMÆNE, SKAL DET ÆNDRES BEGGE STEDER — her og i
// `market_domains` (birdly-admin, migration 0121). Det er den pris spejlet
// koster, og den skal stå skrevet, ikke opdages.
//
// ⚠️ DK OG GB HAR MODSAT PRIMÆR FORM, OG DET ER MÅLT.
// birdly.dk svarer 308 og sender videre til www.birdly.dk — derfor er DK's
// primære vært www-formen (se noten nederst i denne fil). GB skal ligge på
// apex: getbirdly.co.uk. Skriv derfor aldrig en regel der antager "altid www"
// eller "altid apex" — den primære vært står pr. marked.
//
// ⚠️ GB, IKKE UK. GB er ISO 3166-1 alpha-2 for Storbritannien. "uk" må gerne
// være den offentlige slug; internt hedder markedet GB.
// ============================================================================

export const MARKEDER = {
  DK: {
    id: "DK",
    locale: "da-DK",
    sprog: "da",
    valuta: "DKK",
    telefonKode: "+45",
    navn: "Danmark",
    // Wordmark. UK må IKKE vise ".dk" — brandet er Birdly, og "get" findes kun
    // i domænet. Selve logoet er dog et billede (birdly-logo.svg indeholder et
    // indlejret PNG med teksten brændt ind), så et UK-logo kræver et NYT asset,
    // ikke en kodeændring. Se Fase 6.
    wordmark: "Birdly.dk",
    // Rækkefølgen betyder ingenting; `primaer: true` afgør alt.
    domaener: [
      { host: "www.birdly.dk", primaer: true },
      { host: "birdly.dk", primaer: false },
    ],
  },

  // ⚠️ GB ER IKKE TÆNDT. Rækken findes, så domænemodellen er komplet fra dag
  // ét og ikke skal bygges om når frontenden kommer (Fase 6). `aktiv: false`
  // betyder at intet i huset må servere den — se `markedForHost`, som
  // returnerer null for et slukket marked frem for at falde tilbage på DK.
  // Domænerne er i øvrigt ikke købt endnu.
  GB: {
    id: "GB",
    locale: "en-GB",
    sprog: "en",
    valuta: "GBP",
    telefonKode: "+44",
    navn: "United Kingdom",
    wordmark: "Birdly",
    aktiv: false,
    domaener: [
      { host: "getbirdly.co.uk", primaer: true },
      { host: "www.getbirdly.co.uk", primaer: false },
      { host: "getbirdly.uk", primaer: false },
      { host: "www.getbirdly.uk", primaer: false },
    ],
  },
};

export const STANDARD_MARKED = "DK";

/** Markedets primære vært — den ENESTE der må stå i canonical, sitemap, OG og links. */
export function primaerHost(markedId = STANDARD_MARKED) {
  const m = MARKEDER[markedId];
  if (!m) return null;
  return (m.domaener.find((d) => d.primaer) || m.domaener[0]).host;
}

/** Markedets base-URL, fx "https://www.birdly.dk". */
export function baseUrl(markedId = STANDARD_MARKED) {
  const h = primaerHost(markedId);
  return h ? "https://" + h : null;
}

/**
 * Hostname → marked. `null` hvis værten er ukendt ELLER markedet er slukket.
 *
 * ⚠️ RETURNERER null, IKKE DANMARK. Et ukendt domæne må ikke stiltiende blive
 * til DK — så ville en fejlkonfigureret vært servere danske priser og dansk
 * jura under en adresse ingen har godkendt. Kalderen skal selv tage stilling,
 * og i tvivl er svaret "ingen side", ikke "den danske".
 */
export function markedForHost(host) {
  const h = String(host || "").toLowerCase().split(":")[0].trim();
  if (!h) return null;
  for (const m of Object.values(MARKEDER)) {
    if (m.aktiv === false) continue;
    if (m.domaener.some((d) => d.host === h)) return m;
  }
  return null;
}
