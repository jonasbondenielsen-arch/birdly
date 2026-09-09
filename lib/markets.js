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

// ⚠️ TO FLAG, IKKE ÉT (Fase A, 08-09-2026). `aktiv` blandede to spørgsmål
// sammen: "kan vi overhovedet servere det her marked?" og "er det gået i
// luften?". Det gik så længe svaret var nej til begge — men UK skal kunne
// bygges og ses på en preview LÆNGE før DNS peges og hreflang tændes.
//
//   serverbar : må renderes. Falsk = værten giver null, og siden findes ikke.
//   lanceret  : er offentligt. Styrer hreflang, indeksering og alt der
//               fortæller omverdenen at markedet findes.
//
// Havde de været ét flag, skulle GB tændes for at kunne testes — og så ville
// `hreflangFor` straks lægge et hreflang mod getbirdly.co.uk ind på HVER dansk
// side, mod et domæne der ikke svarer. Google behandler en brudt signalkæde
// som grund til at mistro hele gruppen, altså også birdly.dk. To flag er ikke
// pedanteri; det er forskellen på at kunne bygge UK uden at røre DK.
export const MARKEDER = {
  DK: {
    id: "DK",
    locale: "da-DK",
    sprog: "da",
    valuta: "DKK",
    valutaSymbol: "kr.",
    telefonKode: "+45",
    navn: "Danmark",
    serverbar: true,
    lanceret: true,
    // Ingesten kører for DK: to kilder, begge aktive, ~232 kørsler. Tallene i
    // bevis-bjælken er levende, og "2× dagligt" er sandt.
    dataLever: true,
    // ⚠️ PRISEN STÅR IKKE HER FOR DK. Den bor i lib/pakke.js, som er husets
    // enekilde og bundet til Frisbii. To steder ville kunne komme til at
    // modsige hinanden, og prisen er netop dét felt hvor det er dyrest.
    pris: null,
    supportMail: "support@birdly.dk",
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

  // ⚠️ GB KAN SERVERES, MEN ER IKKE LANCERET. Sitet bygges og testes på
  // preview; det går først i luften når pre-live-tjeklisten er grøn (UK-plan i
  // Frisbii, Clearhaus' OK på GBP, VAT/reverse-charge, jura gennemgået af en
  // UK-kvalificeret, DNS). Indtil da er `lanceret: false`, og så udelader
  // `hreflangFor` markedet — de danske sider er derfor bit-for-bit uændrede.
  GB: {
    id: "GB",
    locale: "en-GB",
    sprog: "en",
    valuta: "GBP",
    valutaSymbol: "£",
    telefonKode: "+44",
    navn: "United Kingdom",
    // ⚠️ WORDMARK UDEN ".dk". Brandet er Birdly; "get" findes kun i domænet.
    wordmark: "Birdly",
    serverbar: true,
    lanceret: false,
    // ⚠️ TREDJE FLAG, OG DET SVARER PÅ ET TREDJE SPØRGSMÅL (09-09-2026).
    //   serverbar  må siden renderes?
    //   lanceret   er markedet offentligt?
    //   dataLever  KØRER MOTOREN FOR DETTE MARKED?
    //
    // Bevis-bjælken er ikke bare tal — den er en AKTIVITETS-PÅSTAND: "Birdly
    // arbejder allerede", "2× dagligt", "nye de seneste 7 dage". For GB har
    // ingesten kørt NUL gange, og den eneste kilde (FTS) er slukket. Hver af de
    // påstande ville altså være usand for GB i dag.
    //
    // ⚠️ OG SELV DE SANDE TAL FORFALDER. De 301 britiske udbud kom ind i ét
    // engangs-backfill 08-09. "Nye de seneste 7 dage" ville derfor svare 301 —
    // sandt efter bogstavet, misvisende efter meningen — og falde til 0 af sig
    // selv når vinduet passerer, uden at noget var gået galt. "Åben frist" (70)
    // skrumper dag for dag fordi intet kommer ind. En frossen, svindende pulje
    // undersælger produktet OG giver et forkert indtryk på samme tid.
    //
    // ⚠️ HVORFOR ET EGET FLAG OG IKKE BARE `lanceret`. Den dag DNS peges og GB
    // lanceres, ville bjælken tænde af sig selv med frosne tal, hvis den hang på
    // `lanceret`. De to ting er uafhængige: et marked kan være i luften uden at
    // ingesten kører, og det er præcis den tilstand hvor tallene lyver.
    //
    // SÆTTES TIL true NÅR FTS KØRER LIVE FOR GB — ikke før. Så bliver bjælken
    // ægte af sig selv, og DK's kode er den samme hele vejen.
    dataLever: false,
    // ⚠️ RUTE-PRAEFIKSET, OG DET ER IKKE DET SAMME SOM ID'ET.
    // Markedet hedder GB (ISO-landekoden, og den er rigtig), men siderne
    // ligger i app/uk/. Proxy'en udledte praefikset af id'et og rewrite'ede
    // derfor getbirdly.co.uk til /gb - en mappe der ikke findes. HVER side paa
    // det britiske domaene ville have svaret 404 i det sekund DNS pegede.
    // Ingen opdagede det, fordi domaenet endnu ikke er sat op (maalt
    // 09-09-2026: Host: getbirdly.co.uk -> HTTP 404 lokalt).
    // Praefikset staar nu eksplicit i stedet for at blive gaettet.
    sti: "uk",
    // ⚠️ PRISEN ER LÅST OG ALDRIG KURS-KONVERTERET. £59/md. og £590/år er
    // Jonas' beslutning, ikke 499 kr. omregnet. En kurs-konverteret pris ville
    // ændre sig med valutamarkedet og se tilfældig ud — og den ville være
    // forkert i det sekund kursen bevægede sig.
    //
    // ⚠️ EX VAT. UK B2B er reverse-charge; momsen håndteres i checkout, ikke i
    // det viste tal. Samme princip som DK: kunden ser altid ex moms.
    pris: { maaned: 59, aar: 590, exVat: true, proeveDage: 14 },
    // ⚠️ FIRMA-OPSLAG: Companies House, ikke CVR. Opslaget ligger i
    // app/api/company/route.js (server-side, noeglen er ikke NEXT_PUBLIC).
    // (Kommentaren pegede tidligere paa lib/firmaOpslag.js, som aldrig blev
    // skrevet - rettet 09-09-2026 saa henvisningen passer paa noget der findes.)
    firmaOpslag: "companies-house",
    supportMail: "support@getbirdly.co.uk",
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
    if (m.serverbar === false) continue;
    if (m.domaener.some((d) => d.host === h)) return m;
  }
  return null;
}

/** Er markedet gået i luften? Styrer hreflang, indeksering og sitemap. */
export function erLanceret(markedId) {
  return MARKEDER[markedId]?.lanceret === true;
}


/**
 * Markedet for en vært — med en preview-override.
 *
 * ⚠️ OVERRIDEN FINDES FORDI UK IKKE HAR ET DOMÆNE ENDNU. En Vercel-preview
 * ligger på *.vercel.app, som ikke er nogen markeds vært, og uden en vej ind
 * kunne det engelske site slet ikke ses før DNS var peget. Den sættes som
 * env-variabel PÅ PREVIEW-DEPLOYMENTET og findes ikke i produktion.
 *
 * ⚠️ DEN KAN ALDRIG FLYTTE ET LANCERET MARKED. Kender vi værten, vinder
 * værten — punktum. Ellers ville en fejlagtigt sat env-variabel kunne servere
 * engelsk indhold og britiske priser på www.birdly.dk, og det er præcis den
 * fejl der aldrig må kunne ske. Overriden gælder KUN når værten er ukendt.
 *
 * ⚠️ DEN LÆSES IKKE FRA KLIENTEN. Ingen query-parameter, ingen cookie: så
 * ville "hvilket marked er jeg på" være noget den besøgende bestemte.
 */
export function markedForHostMedOverride(host, override) {
  const fraVaert = markedForHost(host);
  if (fraVaert) return fraVaert;
  const o = String(override || "").toUpperCase().trim();
  const m = MARKEDER[o];
  return m && m.serverbar !== false ? m : null;
}
