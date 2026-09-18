"use client";

import { maa } from "./samtykke";
import { hentAnonId } from "./anonId";
import { hentAttribution } from "./attribution";

// ============================================================================
// MODTAGEREN (18-09-2026) — filen havde ingen.
//
// ⚠️ NOTEN NEDENFOR SAGDE DET SELV: "INGEN NETVÆRKSKALD ... Den dag tallet skal
// ligge i basen, kræver det en ændring i det ANDET repo." Den ændring er lavet:
// Edge Function'en `spor` i birdly-admin tager imod og skriver gennem husets
// eneste event-writer. sessionStorage og dataLayer bliver, præcis som før — det
// her er en tredje udgang, ikke en erstatning.
//
// ⚠️ DEN MÅ ALDRIG FORSINKE EN NAVIGATION. `sendBeacon` afleverer i baggrunden
// og overlever at siden lukker — netop det et `fetch` ikke gør, når kunden
// klikker videre i samme øjeblik. Fejler den, prøves der ikke igen: en tabt
// måling er billigere end en kunde der venter.
//
// ⚠️ BROWSEREN MÅ KUN SIGE HVAD REGISTERET TILLADER. Grænsen håndhæves i
// databasen (`birdly_event_types.klient_tilladt`), ikke her. Et navn der ikke
// står der, bliver afvist af serveren — vi kan altså ikke komme til at opfinde
// omsætning ved en tastefejl.
// ============================================================================

const SPOR_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/spor`
  : null;

// ⚠️ HUSETS NAVNE ER TRINNET, IKKE EVENTTYPEN. `CVRStarted` og
// `BusinessIdentified` er to trin i den SAMME hændelse ("et trin blev
// fuldført"). Én eventtype pr. trin ville give fjorten typer der alle betyder
// det samme, og enhver tragt skulle kende dem alle. Derfor: kanonisk type +
// husets navn i `step`.
const TYPE_FOR = {
  FunnelStarted: "onboarding_started",
  CheckoutStarted: "payment_method_started",
};

/**
 * Send en KANONISK hændelse direkte, med et valgfrit trin.
 *
 * ⚠️ TO INDGANGE MED VILJE. `sporFunnel` bærer husets fjorten danske navne og
 * oversætter dem; den her er til de hændelser der ER kanoniske i forvejen —
 * landingen, "trin vist" og en validering der spærrede. Presses de gennem
 * oversættelsen, ville et `landing_page_view` blive til et onboarding-trin med
 * sig selv som trinnavn.
 */
export function sporEvent(type, step = null, props = {}) {
  try {
    if (typeof window === "undefined") return;
    if (!maa("statistik")) return;
    send(type, { step, props });
    if (process.env.NODE_ENV !== "production") console.log(`[Funnel] ${type}`, step || "", props);
  } catch { /* måling må aldrig vælte siden */ }
}

/** Oversætter klientens attributionsnøgler til sessionens felter. */
function attributionTilServer() {
  const a = hentAttribution(); // tom uden marketing-samtykke — se lib/attribution.js
  const ud = {};
  const flyt = { utm_source: "source", utm_medium: "medium", utm_campaign: "campaign", landing: "landing_path" };
  for (const [fra, til] of Object.entries(flyt)) if (a[fra]) ud[til] = a[fra];
  for (const n of ["utm_content", "utm_term", "campaign_id", "adset_id", "ad_id"]) if (a[n]) ud[n] = a[n];
  // ⚠️ fbclid ER ET KLIK-ID, ikke en kilde. Serveren har ét felt for den slags
  // med en type ved siden af, så fbclid og gclid ikke skal have hver sin kolonne.
  if (a.fbclid) { ud.click_id = a.fbclid; ud.click_id_kind = "fbclid"; }

  // ⚠️ `_fbp`/`_fbc` FINDES KUN NÅR PIXELEN ER INDLÆST, og den indlæses kun med
  // marketing-samtykke (components/Maaling.js). Gaten er altså allerede reel;
  // betingelsen her gør den synlig frem for underforstået.
  if (maa("marketing") && typeof document !== "undefined") {
    for (const navn of ["_fbp", "_fbc"]) {
      const m = document.cookie.match(new RegExp("(?:^|; )" + navn + "=([^;]*)"));
      if (m) ud[navn.slice(1)] = decodeURIComponent(m[1]).slice(0, 200);
    }
  }
  if (typeof document !== "undefined" && document.referrer) {
    // Kun værten, ikke hele URL'en: en henvisende adresse kan bære en søgestreng.
    try { ud.referrer = new URL(document.referrer).hostname.slice(0, 100); } catch { /* ugyldig */ }
  }
  return ud;
}

/**
 * Sender én hændelse til Birdlys eget event-lag.
 * ⚠️ Kaldes KUN fra sporCta/sporFunnel, som allerede har tjekket samtykket.
 */
function send(event, { step = null, props = {} } = {}) {
  try {
    if (!SPOR_URL) return;
    const anon_id = hentAnonId();
    if (!anon_id) return; // intet samtykke ⇒ intet id ⇒ ingenting sendes

    const krop = JSON.stringify({
      anon_id,
      event,
      step,
      path: window.location.pathname.slice(0, 200),
      props,
      attribution: attributionTilServer(),
    });

    // ⚠️ sendBeacon FØRST, fetch SOM RESERVE. Beacon findes ikke i alle ældre
    // browsere, og `keepalive` gør det samme for fetch: leveringen overlever at
    // fanen lukkes.
    const blob = new Blob([krop], { type: "application/json" });
    if (navigator.sendBeacon && navigator.sendBeacon(SPOR_URL, blob)) return;
    fetch(SPOR_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: krop, keepalive: true })
      .catch(() => { /* en tabt måling er ikke en fejl kunden skal mærke */ });
  } catch { /* måling må aldrig vælte siden */ }
}

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
    // Samme kategori og samme grund som sporFunnel nedenfor.
    if (!maa("statistik")) return;
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

    // ⚠️ TREDJE UDGANG (18-09-2026): Birdlys eget event-lag. Placeringen er det
    // eneste der gemmes — ikke knappens tekst, ikke hvad kunden havde skrevet.
    send("cta_clicked", { props: { sted: String(placering || "").slice(0, 60) } });

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

// ============================================================================
// ⚠️ BAG STATISTIK-SAMTYKKET (15-09-2026, Jonas).
//
// ⚠️ MÅLT FØRST: DEN NÅEDE ALDRIG SUPPORT. Noten ovenfor siger at listen findes
// "så et supportkald kan besvare hvor langt hun nåede". Det kunne den aldrig:
// der er intet netværkskald i filen, og `window.dataLayer` har ingen forbruger
// — kun en kommentar om en GTM-container der aldrig blev sat op. Rækken blev
// skrevet til kundens EGEN sessionStorage og døde med fanen. Formålet var
// altså ikke opfyldt af den kode der påberåbte sig det.
//
// ⚠️ HVORFOR GATE FREM FOR SLET. Kategorien "Statistik" står i begge
// cookiepolitikker, og frafaldsmåling ligger allerede i køen (E1). Sletter vi
// koden nu, bygges den igen om to uger, og så skal juraen laves om igen. Gatet
// er kategorien sand fra i dag, og E1 lander uden at røre et juridisk dokument.
//
// ⚠️ MÅLINGEN MÅ STADIG ALDRIG STOPPE KUNDEN. Afviser hun statistik, sker der
// ingenting — funnelen kører videre præcis som før. Det er derfor gaten står
// HER og ikke hos kalderne: der er fjorten af dem, og ét glemt sted ville
// betyde at vi målte uden samtykke.
// ============================================================================
export function sporFunnel(navn, data = {}) {
  try {
    if (typeof window === "undefined") return;
    if (!maa("statistik")) return;

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

    // ⚠️ TREDJE UDGANG (18-09-2026). Ukendte navne sendes som et fuldført trin
    // med navnet i `step` — så en ny hændelse i funnelen bliver målt fra den dag
    // den skrives, uden at nogen skal huske at rette to filer. Er navnet
    // meningsløst, afviser serveren det; den beslutning ligger i registeret.
    send(TYPE_FOR[navn] || "onboarding_step_completed", { step: navn, props: data });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[Funnel] ${navn}`, data);
    }
  } catch { /* måling må aldrig vælte funnelen */ }
}
