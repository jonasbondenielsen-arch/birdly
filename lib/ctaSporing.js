"use client";

// ============================================================================
// INTERN CTA-SPORING — hvilken knap blev trykket, og hvor.
//
// ⚠️ DEN SENDER INGENTING TIL META. Godkendt af Jonas 06-09-2026 med præcis den
// begrænsning: PageView, Lead og StartTrial er de tre Meta-hændelser huset har,
// de er dubletsikrede pr. kunde (lib/pixel.js), og Meta optimerer på ANTAL. En
// fjerde hændelse — eller en ekstra affyring af en af de tre — ville lære
// algoritmen at trafik konverterer bedre end den gør. Derfor rører denne fil
// hverken fbq eller lib/pixel.js.
//
// Hvad den så er til: drop-off-analyse. Vi kan i dag se at nogen tilmeldte sig,
// men ikke HVILKEN af de otte CTA'er på siden der bar dem ind i funnelen. Uden
// det er "flyt knappen op" og "skriv en anden overskrift" gætværk.
//
// TO UDGANGE, begge harmløse hvis modtageren ikke findes:
//   1. sessionStorage — sidste og første CTA i besøget. Læsbart af funnelen og
//      af en support-medarbejder i konsollen. Samme levetid som attributionen
//      (lib/attribution.js): ét besøg, ikke evigt.
//   2. window.dataLayer — hvis der en dag sættes en GTM-container op, ligger
//      hændelserne der allerede. Findes den ikke, oprettes et almindeligt array,
//      og intet forlader browseren.
//
// ⚠️ INGEN NETVÆRKSKALD. Ingen egen tabel, intet endpoint. Den dag tallet skal
// ligge i basen, kræver det en ny nøgle i signup-funktionens hvidliste
// (ATTRIBUTION_NOEGLER i birdly-admin) — og det er en ændring i det ANDET repo,
// som ikke er lavet her.
//
// ⚠️ MÅ ALDRIG KASTE. En måling er aldrig vigtigere end at kunden kommer videre.
// Hele kroppen er pakket ind, og kalderen får aldrig en fejl at forholde sig til.
// ============================================================================

const NOEGLE = "birdly_cta";

/**
 * Registrér et klik på en primær/sekundær CTA.
 *
 * @param {string} placering  Hvor knappen sad — "hero", "priser-aar", "faq" osv.
 *                            Kort, stabil, kebab-case. Den skal kunne genkendes
 *                            om et halvt år.
 * @param {string} maal       Hvor den fører hen ("/kom-i-gang", "/start").
 */
export function sporCta(placering, maal) {
  try {
    if (typeof window === "undefined") return;
    const nu = new Date().toISOString();

    // ⚠️ FØRSTE OG SIDSTE, IKKE EN LISTE. En liste ville vokse ubegrænset i en
    // lang session og skulle beskæres et sted; to felter besvarer spørgsmålet
    // ("hvad fik hende ind, hvad fik hende videre") uden at kunne løbe løbsk.
    let gemt = {};
    try {
      const raa = window.sessionStorage.getItem(NOEGLE);
      if (raa) gemt = JSON.parse(raa) || {};
    } catch { /* privat browsing — så er der bare ingen historik */ }

    const opdateret = {
      ...gemt,
      // Første berøring vinder, som i attributionen: det er den knap der
      // faktisk overbeviste, ikke den sidste hun tilfældigvis ramte.
      ...(gemt.foerste ? {} : { foerste: placering, foerste_ts: nu }),
      sidste: placering,
      sidste_ts: nu,
      sidste_maal: maal || null,
    };

    try {
      window.sessionStorage.setItem(NOEGLE, JSON.stringify(opdateret));
    } catch { /* kvote eller privat browsing — hændelsen tabes, siden virker */ }

    // GTM-kompatibel push. Uden container er dette et almindeligt array i
    // hukommelsen som ingen læser — altså et no-op, ikke en afsendelse.
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "birdly_cta", cta_placering: placering, cta_maal: maal || null });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[CTA] ${placering} → ${maal || "?"}`);
    }
  } catch { /* måling må aldrig vælte siden */ }
}

/** Hvad vi ved om besøgets CTA-vej. Tomt objekt hvis intet er trykket. */
export function hentCta() {
  try {
    if (typeof window === "undefined") return {};
    const raa = window.sessionStorage.getItem(NOEGLE);
    return raa ? JSON.parse(raa) || {} : {};
  } catch {
    return {};
  }
}

// ============================================================================
// FUNNEL-HÆNDELSER — hvor langt kom kunden, og hvor faldt hun fra.
//
// ⚠️ DE RØRER IKKE META. Huset har præcis tre Meta-hændelser — PageView, Lead og
// StartTrial — og de er dubletsikrede pr. kunde i lib/pixel.js. Meta optimerer på
// ANTAL, så en fjerde hændelse eller en ekstra affyring af en af de tre ville
// lære algoritmen at trafikken konverterer bedre end den gør, og så køber den
// mere af den. Derfor: samme to harmløse udgange som sporCta — sessionStorage og
// window.dataLayer — og intet netværkskald.
//
// ⚠️ TrialActivated FYRES IKKE HERFRA. Prøven er først aktiveret når kortet er
// bundet, og dét afgør Frisbii-webhooken. Den eksisterende StartTrial-pixel
// (Start.js, ved retur på ?betaling=ok) er og bliver det ene sted den slags
// måles. En "TrialActivated" her ville tælle folk der nåede knappen, ikke folk
// der blev kunder.
//
// ⚠️ MÅ ALDRIG KASTE. En måling er aldrig vigtigere end at kunden kommer videre.
// ============================================================================

const FUNNEL_NOEGLE = "birdly_funnel";

export function sporFunnel(navn, data = {}) {
  try {
    if (typeof window === "undefined") return;

    // Hændelsesnavnene gemmes i besøgets egen liste, så et supportkald kan
    // besvare "hvor langt nåede hun" uden at skulle bygge en rapport.
    try {
      const raa = window.sessionStorage.getItem(FUNNEL_NOEGLE);
      const liste = raa ? JSON.parse(raa) || [] : [];
      // Loft på 40: en session kan ikke fylde ubegrænset, og ingen funnel har
      // flere end en håndfuld skridt.
      if (liste.length < 40) {
        liste.push({ e: navn, t: new Date().toISOString() });
        window.sessionStorage.setItem(FUNNEL_NOEGLE, JSON.stringify(liste));
      }
    } catch { /* privat browsing — så er der bare ingen historik */ }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: navn, ...data });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[Funnel] ${navn}`, data);
    }
  } catch { /* måling må aldrig vælte funnelen */ }
}
