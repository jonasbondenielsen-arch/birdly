"use client";

import { maa } from "./samtykke";

// ============================================================================
// PRODUKT- OG ADFÆRDSANALYSE (23-09-2026) — PostHog og Clarity, bag samtykket.
//
// ⚠️ DE LÆGGER SIG OVENPÅ, DE ERSTATTER INTET. Birdlys eget event-lag er og
// bliver den autoritative kilde: `account_created`, `payment_method_added`,
// `trial_started`, `trial_cancelled` og abonnementstilstand afgøres i basen af
// databasens egne triggere. PostHog og Clarity er læsere, ikke dommere. Der
// bygges derfor ingen tredje eventmodel her — `tilPostHog()` kaldes fra det ENE
// sted der i forvejen sender husets kanoniske hændelser (lib/ctaSporing.js), så
// taksonomien ikke kan drive fra sig selv.
//
// ⚠️ BEGGE LIGGER BAG `statistik`, IKKE `marketing`. Begge svarer på "hvordan
// bruges siden", som er præcis ordlyden i cookiepolitikkens kategori
// Statistiske. Ingen af dem bruges til annoncering: Clarity får eksplicit
// `ad_Storage: "denied"` med mindre marketing-samtykket OGSÅ er givet, og
// PostHog har ingen annoncefunktion i brug.
//
// ⚠️ UTM'ER SKIFTER IKKE KATEGORI AF DET HER. De læses stadig gennem
// `hentAttribution()`, som returnerer et tomt objekt uden marketing-samtykke
// (lib/attribution.js). Uden marketing følger der altså ingen kampagne med til
// PostHog — automatisk, uden en ekstra betingelse der kunne komme ud af trit.
//
// ⚠️ ALT ER DYNAMISK IMPORTERET. posthog-js må ikke ligge i den første bundle:
// skærm 1 er den skærm 74 % faldt fra, og et analyseværktøj må ikke være det
// der gør den langsommere. Modulet hentes først når samtykket er givet.
//
// ⚠️ MÅ ALDRIG KASTE. En fejl i et analyseværktøj må ikke kunne ramme landing,
// CVR-opslag, onboarding, kontooprettelse, Reepay, betaling, prøve eller
// SMS/mail. Hver eneste indgang herunder er pakket ind.
// ============================================================================

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
// ⚠️ EU-VÆRTEN, IKKE DEN AMERIKANSKE. PostHogs standard i dokumentationen er
// `us.i.posthog.com`; projektet her ligger i EU Cloud (Frankfurt). Sendes data
// til den forkerte region, er det en overførsel ud af EU der ikke er aftalt.
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

// ⚠️ CLARITY-ID'ET ER OFFENTLIGT, ikke en hemmelighed — det står i kildekoden på
// ethvert websted der bruger Clarity. Det må derfor gerne stå her som
// standardværdi, og env-variablen findes så et preview-miljø kan pege et andet
// sted hen. PostHog-tokenet står IKKE her; det skal sættes i env.
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "ymo37vrk62";

const FUNNEL_VERSION = "v2";

let ph = null;          // posthog-js-modulet, når det er hentet
let phIgang = false;    // hindrer to samtidige dynamiske imports

// ============================================================================
// KØ INDTIL SDK'ET ER HENTET (23-09-2026) — MÅLT TAB, IKKE EN TEORI.
//
// ⚠️ PRODUKTIONSMÅLING FØR DENNE KØ: nul capture-kald ved sideindlæsning, selv
// med samtykket allerede gemt. Først da jeg fokuserede CVR-feltet flere
// sekunder senere, kom der ét kald. Årsagen er at `posthog-js` hentes
// dynamisk: `landing`, `headline_visible` og `cvr_visible` fyrer i samme
// øjeblik siden monterer, og der er `ph` stadig null — så de blev tavst
// droppet. Det er præcis toppen af den tragt hele sprintet findes for.
//
// ⚠️ SAMME FEJL SOM HUSET ALLEREDE HAR RETTET ÉN GANG. `lib/ctaSporing.js`
// fik sin egen kø 20-09 af nøjagtig samme grund: alt hvad der måles én gang
// ved mount, tabes hvis modtageren ikke er klar endnu.
//
// ⚠️ TIDEN FØLGER MED FRA DENGANG. Uden den ville hele køen få
// flush-tidspunktet, og rækkefølgen i PostHogs tragt ville være opfundet.
//
// ⚠️ INTET FORLADER BROWSEREN FØR SAMTYKKET. Køen fyldes kun af `tilPostHog()`,
// som selv kræver statistik-samtykke — og den tømmes kun hvis SDK'et blev
// hentet, hvilket også kun sker med samtykke.
// ============================================================================
const PH_KOE = [];
const PH_KOE_MAKS = 40;   // mere end nogen tragt har trin
let phAnonId = null;      // bindes ved flush, så de køede hændelser får rette id

function flushPostHog() {
  try {
    if (!ph || !PH_KOE.length) return;
    if (phAnonId) bindAnonId(phAnonId);
    // ⚠️ TØM FØR AFSENDELSE. Kaster `capture` midt i løkken, må en hændelse
    // ikke kunne blive sendt to gange ved næste flush.
    const udestaaende = PH_KOE.splice(0, PH_KOE.length);
    for (const e of udestaaende) {
      ph.capture(e.navn, { ...e.props, klient_tid: e.tid }, { timestamp: new Date(e.tid) });
    }
  } catch { /* måling må aldrig vælte siden */ }
}

// ── HUSETS EVENTS → POSTHOGS TAKSONOMI ─────────────────────────────────────
//
// ⚠️ EN OVERSÆTTELSE, IKKE ET NYT REGISTER. Nøglen er husets egen
// (eventnavn + trin), værdien er det navn funnelen i PostHog bygges på. Står en
// hændelse ikke her, sendes den ikke videre — så en ny intern måling ikke
// pr. automatik havner hos en tredjepart.
//
// ⚠️ TRINNAVNENE ER 0173-NAVNENE. `metode`, `fag` og `kontakt-og-plan` er de
// rettede navne; de gamle (`fag` på metodeskærmen osv.) findes kun i historiske
// rækker og skal ikke oversættes her.
const POSTHOG_NAVN = {
  "landing_page_view": "landing",

  "viewport_milestone:overskrift-set": "headline_visible",
  "viewport_milestone:cvr-felt-set": "cvr_visible",
  "viewport_milestone:cvr-felt-fokus": "cvr_focused",

  "onboarding_step_completed:CVRStarted": "cvr_submitted",
  "onboarding_step_viewed:foerste-scan": "first_scan_viewed",
  "onboarding_step_completed:CurrentMethodSelected": "method_completed",
  // ⚠️ `profession_completed` HAR INGEN EGEN HUSHÆNDELSE. Fagvalget afsluttes
  // ikke med et eget kald; kunden går bare videre til områdeskærmen. At nå
  // `omraade` ER altså beviset for at faget blev valgt. Det er en udledning, og
  // den står her frem for i en rapport, hvor ingen ville kunne se den.
  "onboarding_step_viewed:omraade": "profession_completed",
  "onboarding_step_completed:PreferencesCompleted": "area_completed",
  "onboarding_step_completed:BirdlyScanCompleted": "birdly_scan_viewed",
  "onboarding_step_completed:ValueAnchorViewed": "value_anchor_viewed",
  "onboarding_step_viewed:kontakt-og-plan": "plan_reached",
  "payment_method_started:CheckoutStarted": "payment_reached",

  // ⚠️ IKKE ET TRAGTTRIN, MEN ET VAERDI-OEJEBLIK. Den maaler at kunden faktisk
  // saa konkrete opgaver - ikke bare et tal - og den ligger derfor ved siden af
  // `first_scan_viewed`, ikke i stedet for. Baseline forbliver sammenlignelig.
  "onboarding_step_viewed:match-eksempler": "match_examples_viewed",
};

/** Grov enhedsklasse. ⚠️ Ingen versioner, ingen fuld user-agent — se `spor`. */
function enhed() {
  try {
    if (typeof window === "undefined") return "ukendt";
    const b = window.innerWidth;
    return b < 768 ? "mobil" : b < 1024 ? "tablet" : "desktop";
  } catch { return "ukendt"; }
}

// ============================================================================
// POSTHOG
// ============================================================================

/**
 * Hent og initialisér PostHog. Kaldes KUN med statistik-samtykke.
 *
 * ⚠️ AUTOCAPTURE ER SLUKKET, OG DET ER IKKE en indstilling — det er værnet.
 * Autocapture sender klik med elementernes TEKST. På /start betyder det
 * knaptekster, labels og potentielt indhold fra kundens egne felter. Huset
 * sender sine egne, navngivne hændelser; alt andet er en lækage der ikke kan
 * kaldes tilbage.
 *
 * ⚠️ SESSION REPLAY ER SLUKKET HER MED VILJE. Clarity er husets adfærdslag
 * (arkitekturen: PostHog = produktanalyse, Clarity = optagelser og heatmaps).
 * To optagelser af den samme kunde ville fordoble privatlivsfladen uden at
 * besvare et eneste nyt spørgsmål.
 *
 * ⚠️ `person_profiles: "identified_only"` OG VI KALDER ALDRIG identify().
 * Dermed oprettes der ingen personprofiler overhovedet. Kunden er en
 * pseudonym distinct_id og intet andet.
 */
async function startPostHog() {
  if (!POSTHOG_KEY || ph || phIgang) return;
  phIgang = true;
  try {
    const modul = await import("posthog-js");
    const p = modul.default || modul.posthog;
    p.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // Husets egne hændelser er de eneste der sendes.
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      // Clarity er optagelseslaget — se noten ovenfor.
      disable_session_recording: true,
      // ⚠️ SURVEYS SLUKKES (23-09-2026). Produktionsmålingen viste at PostHog
      // hentede `surveys.js` af sig selv. Surveys kan RENDERE UI på siden —
      // altså et fremmed produkt der kan lægge en popup midt i funnelen, på
      // den skærm 74 % i forvejen falder fra. Et analyseværktøj må se på, ikke
      // blande sig.
      disable_surveys: true,
      // ⚠️ INGEN COOKIE PÅ TVÆRS AF UNDERDOMÆNER. admin.birdly.dk er en anden
      // flade med rigtige kundedata; den skal ikke dele et analyse-id med den
      // offentlige side.
      cross_subdomain_cookie: false,
      person_profiles: "identified_only",
      // ⚠️ SIDSTE VÆRN. Skulle en property alligevel slippe med, fjernes de
      // navne der kunne bære persondata, før de forlader browseren.
      property_denylist: ["$ip", "email", "mail", "telefon", "phone", "navn", "name", "cvr"],
      // ⚠️ IP'EN SKAL IKKE GEMMES. PostHog udleder geografi af den; vi har
      // ikke brug for det, og en IP er en personoplysning.
      ip: false,
    });
    ph = p;
    // ⚠️ FLUSH STRAKS. Alt der naaede at fyre mens importen loeb, ligger i koeen.
    flushPostHog();
  } catch {
    // ⚠️ ET FEJLET ANALYSEVÆRKTØJ ER IKKE EN FEJL KUNDEN SKAL MÆRKE.
    ph = null;
  } finally {
    phIgang = false;
  }
}

/** Trækkes samtykket tilbage: stop afsendelse og ryd op. */
function stopPostHog() {
  try {
    if (!ph) return;
    ph.opt_out_capturing();
    // ⚠️ reset() SMIDER distinct_id OG COOKIEN VÆK. Uden den ville et id fra
    // før tilbagetrækningen ligge og vente på næste gang samtykket gives, og de
    // to perioder ville blive knyttet sammen til én person.
    ph.reset(true);
  } catch { /* intet at rydde */ }
}

/**
 * Spejl én kanonisk hushændelse til PostHog.
 *
 * ⚠️ KALDES FRA lib/ctaSporing.js' `send()` — det ene sted der i forvejen
 * sender alt. En ekstra kaldevej ville være begyndelsen på en tredje eventmodel.
 *
 * @param {string} event  husets eventnavn
 * @param {string|null} step  husets trinnavn (0173-navnene)
 * @param {object} attribution  allerede samtykkefiltreret, se lib/ctaSporing.js
 */
export function tilPostHog(event, step, attribution = {}, props = {}) {
  try {
    // ⚠️ SAMTYKKET FOERST, ALTID. Koeen maa aldrig fyldes uden lov.
    if (!maa("statistik")) return;
    const navn = POSTHOG_NAVN[`${event}:${step}`] || POSTHOG_NAVN[event];
    if (!navn) return; // ikke en funnel-hændelse — sendes ikke videre

    const props = {
      funnel_version: FUNNEL_VERSION,
      device_type: enhed(),
      current_step: step || null,
      // ⚠️ KUN DET DER ALLEREDE ER SAMTYKKEFILTRERET. `attribution` kommer fra
      // `attributionTilServer()`, som er tom uden marketing-samtykke. Der er
      // derfor ingen UTM'er her for den der har sagt nej — uden at vi skal
      // huske en ekstra betingelse.
      traffic_source: attribution.source || null,
      utm_source: attribution.source || null,
      utm_medium: attribution.medium || null,
      utm_campaign: attribution.campaign || null,
      utm_content: attribution.utm_content || null,
      utm_term: attribution.utm_term || null,
      // ⚠️ KUN ET ANTAL, OG KUN NAAR DET FINDES. `match_examples_viewed` er den
      // eneste haendelse der baerer noget fra selve udbudsdataene - og det er
      // taellingen, intet andet. Ingen titel, koeber, frist, beloeb eller id.
      ...(typeof props.antal === "number" ? { example_count: props.antal } : {}),
    };

    // ⚠️ ER SDK'ET IKKE HENTET ENDNU, UDSKYDES HAENDELSEN — den tabes ikke.
    // Se noten ved PH_KOE: uden det her forsvandt tragtens tre foerste trin.
    if (!ph) {
      if (PH_KOE.length < PH_KOE_MAKS) PH_KOE.push({ navn, props, tid: new Date().toISOString() });
      return;
    }
    ph.capture(navn, props);
  } catch { /* måling må aldrig vælte siden */ }
}

/**
 * Bind PostHogs distinct_id til Birdlys eget pseudonyme id.
 *
 * ⚠️ anon_id ER DET RIGTIGE ID AT BRUGE. Det er tilfældigt, aldrig udledt af
 * mail, CVR eller IP (lib/anonId.js), og det findes kun med statistik-samtykke.
 * Det er dermed husets egen, allerede godkendte pseudonyme identifikator — og
 * det er det der gør at en autoritativ server-hændelse senere kan lande i den
 * SAMME tragt som browserens.
 *
 * ⚠️ IKKE identify(). `identify()` opretter en personprofil hos PostHog;
 * `register()` sætter blot id'et på hændelserne. Vi har ikke brug for profilen.
 */
export function bindAnonId(anonId) {
  try {
    if (!anonId) return;
    // ⚠️ GEMMES OGSAA NAAR SDK'ET MANGLER, saa de koeede haendelser kan bindes
    // til den rigtige besoegende naar koeen toemmes.
    phAnonId = anonId;
    if (!ph) return;
    if (ph.get_distinct_id() !== anonId) ph.identify(anonId);
  } catch { /* uden binding er tragten blot mindre sammenhængende */ }
}

// ============================================================================
// MICROSOFT CLARITY
// ============================================================================

/**
 * ⚠️ SCRIPTET LÆGGES FØRST I DOM'EN EFTER SAMTYKKET — samme rækkefølge som
 * Meta-pixlen (lib/pixel.js). Clarity kører nemlig videre UDEN cookies hvis
 * samtykket mangler ("no-consent mode", Microsofts egen dokumentation), altså
 * indsamler den stadig. At loade scriptet og bagefter sige nej ville derfor
 * være en behandling uden hjemmel, ikke bare en overflødig cookie.
 */
function startClarity() {
  if (typeof window === "undefined" || !CLARITY_ID) return;
  if (window.clarity) return;
  try {
    // Microsofts egen stub, skrevet ud frem for indsat som rå HTML.
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
    s.id = "birdly-clarity";
    document.head.appendChild(s);
  } catch { /* uden Clarity mister vi en optagelse, ikke en kunde */ }
}

/**
 * Fortæl Clarity hvad kunden har sagt ja til.
 *
 * ⚠️ TO SIGNALER, IKKE ÉT. Clarity skelner `analytics_Storage` fra
 * `ad_Storage`, og det passer præcis på husets to kategorier. Statistik åbner
 * analysen; annoncelageret åbnes KUN hvis marketing også er givet. Sendte vi ét
 * samlet ja, ville et statistik-samtykke også blive læst som et annoncesamtykke.
 *
 * ⚠️ BEGGE STAVEMÅDER SENDES. Microsofts egen dokumentation er ikke enig med
 * sig selv: API-tabellen skriver `ad_Storage`/`analytics_Storage`, mens
 * verifikations-eksemplet logger `ad_storage`/`analytics_storage`. Rammer vi
 * forkert, falder Clarity tilbage til no-consent mode — altså den SIKRE side,
 * men også den ubrugelige. Begge nøgler koster intet og fjerner gætteriet.
 */
function clarityConsent(statistik, marketing) {
  try {
    if (typeof window === "undefined" || typeof window.clarity !== "function") return;
    const a = statistik ? "granted" : "denied";
    const ad = marketing ? "granted" : "denied";
    window.clarity("consentv2", {
      ad_Storage: ad, analytics_Storage: a,
      ad_storage: ad, analytics_storage: a,
    });
  } catch { /* uden signal bliver Clarity i no-consent mode — den sikre side */ }
}

/**
 * ⚠️ `clarity("consent", false)` SLETTER COOKIERNE og starter forfra uden dem.
 * Microsofts dokumentation: den rydder `_clck`/`_clsk` og holder op med at
 * spore indtil et nyt samtykke. At "huske et nej" uden at rydde er ikke et
 * tilbagekaldt samtykke.
 */
function stopClarity() {
  try {
    if (typeof window !== "undefined" && typeof window.clarity === "function") {
      window.clarity("consent", false);
    }
  } catch { /* intet at rydde */ }
}

/**
 * Privatlivssikre dimensioner til Clarity.
 *
 * ⚠️ INGEN PII, INGEN RÅ ABONNENT-UUID, INGEN fbclid. Fire grove dimensioner
 * der gør en optagelse søgbar ("vis mig mobilbrugere fra Meta der faldt fra på
 * skærm 1") uden at pege på et menneske.
 */
export function clarityKontekst(step, attribution = {}) {
  try {
    if (typeof window === "undefined" || typeof window.clarity !== "function") return;
    if (!maa("statistik")) return;
    window.clarity("set", "funnel_version", FUNNEL_VERSION);
    window.clarity("set", "device_type", enhed());
    if (step) window.clarity("set", "current_step", String(step).slice(0, 40));
    if (attribution.source) window.clarity("set", "traffic_source", String(attribution.source).slice(0, 40));
  } catch { /* en manglende dimension er ikke en fejl */ }
}

// ============================================================================
// ÉN INDGANG, STYRET AF SAMTYKKET
// ============================================================================

/**
 * Tænd eller sluk begge værktøjer efter det aktuelle samtykke.
 * Kaldes fra components/Maaling.js — ved montering og ved hvert samtykkeskift.
 */
export function synkroniserAnalytics() {
  try {
    if (typeof window === "undefined") return;
    const statistik = maa("statistik");
    const marketing = maa("marketing");

    if (statistik) {
      startPostHog();
      startClarity();
      // ⚠️ SIGNALET SENDES OGSÅ NÅR SCRIPTET LIGE ER LAGT IND. Stubben køer
      // kaldet indtil scriptet er hentet, så rækkefølgen holder.
      clarityConsent(true, marketing);
    } else {
      stopPostHog();
      stopClarity();
      clarityConsent(false, false);
    }
  } catch { /* måling må aldrig vælte siden */ }
}
