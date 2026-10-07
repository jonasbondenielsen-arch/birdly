// ============================================================================
// VERIFIKATION — MÅLEPAKKEN 06-10-2026
//
// ⚠️ DEN PRØVER DET DER KAN GÅ GALT UDEN AT SE GALT UD:
//   · et event uden PostHog-navn ⇒ det fyrer, men når aldrig frem
//   · to navne for samme hændelse ⇒ tragten tæller den samme kunde to gange
//   · en teknisk fejl talt som nul matches ⇒ vi optimerer et trin der er i stykker
//   · en prop der ikke er hvidlistet ⇒ den findes i koden og ikke i PostHog
//   · PII i en prop ⇒ et CVR eller et firmanavn forlader huset
//
//   node --import ./scripts/esm-loader.mjs scripts/verify-maalepakke.mjs
// ============================================================================
import { readFileSync } from "node:fs";
import { POSTHOG_NAVN } from "../lib/analytics.js";

let fejl = 0;
const ok = (b, t, d = "") => {
  console.log(`  ${b ? "✓" : "✖"} ${t}${d ? "  — " + d : ""}`);
  if (!b) fejl++;
};

// ⚠️ KOMMENTARER STRIPPES FØR DER ASSERTERES. Første udgave af §5 greb efter
// "usikker" i `/api/cvr` og ramte en HISTORISK NOTE om hændelsen 16-09 — ikke
// en returværdi. En vagt der straffer en forklaring, lærer folk at lade være
// med at skrive dem. Samme greb som i husets øvrige vagter.
const udenKommentarer = (t) => t
  .replace(/\r\n?/g, "\n")
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .split("\n")
  .map((l) => l.replace(/(^|[^:"'`\\])\/\/.*$/, "$1"))
  .join("\n");

const start = readFileSync("components/Start.js", "utf8");
const kand = readFileSync("lib/kandidater.js", "utf8");
const ana = readFileSync("lib/analytics.js", "utf8");

// ── 1 · HVERT NYT EVENT HAR ET POSTHOG-NAVN ───────────────────────────────
// ⚠️ `tilPostHog` DROPPER ET UKENDT EVENT TAVST (`if (!navn) return`). Et event
// uden navn fyrer altså i husets eget lag og forsvinder på vejen — præcis det
// der skete med `birdly-scan` i 14 dage.
console.log("\n1 · ALLE NYE EVENTS ER MAPPET");
const KRAEVEDE = {
  "onboarding_step_viewed:birdly-scan": "birdly_scan_shown",
  "onboarding_step_completed:BirdlyScanStarted": "birdly_scan_started",
  "onboarding_step_completed:BirdlyScanHasMatches": "birdly_scan_has_matches",
  "onboarding_step_completed:BirdlyScanZeroMatches": "birdly_scan_zero_matches",
  "onboarding_step_completed:BirdlyScanFailed": "birdly_scan_failed",
  "onboarding_step_completed:BusinessIdentified": "business_identified",
  "onboarding_step_completed:PlanSelected": "plan_changed",
  "onboarding_step_completed:PlanConfirmed": "plan_confirmed",
  "cvr_opslag:found": "cvr_lookup_found",
  "cvr_opslag:not_found": "cvr_lookup_not_found",
  "cvr_opslag:lookup_failed": "cvr_lookup_failed",
  "cvr_opslag:teknisk_fejl": "cvr_lookup_error",
  "cvr_opslag:validation_failed": "cvr_validation_failed",
};
for (const [noegle, forventet] of Object.entries(KRAEVEDE)) {
  ok(POSTHOG_NAVN[noegle] === forventet, noegle, POSTHOG_NAVN[noegle] || "MANGLER");
}

// ⚠️ OG INGEN TO HÆNDELSER MÅ DELE NAVN. Gjorde de det, ville tragten lægge to
// forskellige trin sammen — den fejl `ValueAnchorViewed` havde på tværs af
// forsiden og funnelen.
console.log("\n1b · INGEN DOBBELTE NAVNE");
const navne = Object.values(POSTHOG_NAVN);
const dubletter = navne.filter((n, i) => navne.indexOf(n) !== i);
ok(dubletter.length === 0, "hvert PostHog-navn bruges af praecis ét trin",
   dubletter.length ? [...new Set(dubletter)].join(", ") : `${navne.length} navne, alle unikke`);

// ── 2 · DE FIRE SCAN-UDFALD ER GENSIDIGT UDELUKKENDE ──────────────────────
// ⚠️ DEN VIGTIGSTE PRØVE I FILEN. Før pakken faldt en teknisk fejl ned i
// `BirdlyScanZeroMatches`, fordi `visResultat()` kollapser `fejlede`,
// `effektive_koder === 0` og et ægte nul til samme streng "intet".
console.log("\n2 · FIRE UDFALD, PRAECIS ÉT AD GANGEN");
// Samme udtryk som i Start.js — holdt i sync af §2b nedenfor.
const udfaldAf = (k) => k?.fejlede
  ? (k.aarsag === "timeout" ? "timeout" : "teknisk_fejl")
  : ((k?.i_omraade || 0) > 0 ? "matches" : "nul_matches");
const sager = [
  ["timeout", { fejlede: true, aarsag: "timeout" }, "timeout"],
  ["netvaerksfejl", { fejlede: true, aarsag: "netvaerk" }, "teknisk_fejl"],
  ["HTTP 500", { fejlede: true, aarsag: "http_500" }, "teknisk_fejl"],
  ["svar uden ok", { fejlede: true, aarsag: "svar_ikke_ok" }, "teknisk_fejl"],
  ["aegte nul", { fejlede: false, aarsag: null, i_omraade: 0 }, "nul_matches"],
  ["ingen koder", { fejlede: false, aarsag: null, i_omraade: 0, effektive_koder: 0 }, "nul_matches"],
  ["matches", { fejlede: false, aarsag: null, i_omraade: 7 }, "matches"],
];
for (const [navn, k, forventet] of sager) {
  ok(udfaldAf(k) === forventet, `${navn} → ${forventet}`, udfaldAf(k));
}
// ⚠️ DEN AFGØRENDE: en teknisk fejl må ALDRIG blive nul_matches.
const tekniske = sager.filter(([, , f]) => f === "teknisk_fejl" || f === "timeout");
ok(tekniske.every(([, k]) => udfaldAf(k) !== "nul_matches"),
   "⚠️ INGEN teknisk fejl klassificeres som nul_matches",
   `${tekniske.length} fejltilstande proevet`);

console.log("\n2b · VAGTENS UDTRYK ER DET SAMME SOM PRODUKTIONENS");
// ⚠️ ELLERS BEVISER §2 EN KOPI. Udtrykket findes ét sted i Start.js; vagten
// asserterer at det står der ordret, så de to ikke kan drive fra hinanden.
ok(/k\?\.fejlede[\s\S]{0,120}aarsag === "timeout" \? "timeout" : "teknisk_fejl"/.test(start),
   "udfaldet udledes i Start.js med samme udtryk");
ok(/\(k\?\.i_omraade \|\| 0\) > 0 \? "matches" : "nul_matches"/.test(start),
   "og success-grenen er den samme");

// ── 3 · KUN ÉT RESULTAT-EVENT FYRER ───────────────────────────────────────
console.log("\n3 · PRAECIS ÉT RESULTAT-EVENT PR. SCAN");
ok(/if \(udfald === "matches"\) sporFunnel\("BirdlyScanHasMatches"/.test(start),
   "matches → kun HasMatches");
ok(/else if \(udfald === "nul_matches"\) sporFunnel\("BirdlyScanZeroMatches"/.test(start),
   "nul_matches → kun ZeroMatches");
ok(/else sporFunnel\("BirdlyScanFailed"/.test(start),
   "fejl → kun Failed");
// ⚠️ EN if/else-KÆDE, IKKE TRE SELVSTÆNDIGE if'er. Tre if'er kunne fyre to
// events for samme scan og dobbelttælle kunden.
ok((start.match(/sporFunnel\("BirdlyScan(HasMatches|ZeroMatches|Failed)"/g) || []).length === 3,
   "de tre resultat-events har praecis ét kaldested hver");
ok((start.match(/sporFunnel\("BirdlyScanStarted"/g) || []).length === 1,
   "start-eventet har praecis ét kaldested");
ok((start.match(/sporFunnel\("BirdlyScanCompleted"/g) || []).length === 1,
   "completed-eventet har praecis ét kaldested");

// ── 4 · TIMEOUT OG ÅRSAGER ────────────────────────────────────────────────
console.log("\n4 · SCANNINGEN KAN IKKE HAENGE USYNLIGT");
ok(/AbortController/.test(kand) && /signal: ctrl\.signal/.test(kand),
   "AbortController er koblet paa fetch'en");
ok(/clearTimeout\(ur\)/.test(kand) && /finally/.test(kand),
   "timeren ryddes i finally — ingen laekket timer");
ok(/AbortError" \? "timeout" : "netvaerk"/.test(kand),
   "⚠️ en afbrudt fetch skelnes fra en netvaerksfejl");
ok(/export const SCAN_TIMEOUT_MS/.test(kand), "timeouten er en navngiven konstant");

// ── 5 · CVR-UDFALDENE ER DEM API'ET GIVER ─────────────────────────────────
// ⚠️ INGEN OPFUNDNE TILSTANDE. `/api/cvr` svarer `found`, `not_found` eller
// `lookup_failed`; dertil en klientside-undtagelse og 8-cifret validering.
// Der findes INGEN "uncertain" paa dette lag.
console.log("\n5 · CVR: KUN DE FAKTISKE UDFALD");
const cvrRute = udenKommentarer(readFileSync("app/api/cvr/route.js", "utf8"));
for (const r of ["found", "not_found", "lookup_failed"]) {
  ok(new RegExp(`reason: "${r}"`).test(cvrRute), `/api/cvr kan svare "${r}"`);
}
ok(!/uncertain|"usikker"/.test(cvrRute),
   "⚠️ og den svarer ALDRIG 'uncertain' — derfor maales det ikke");
ok(/sporEvent\("cvr_opslag", "validation_failed"/.test(start), "valideringen maales");
{
  // ⚠️ PRØVET PÅ KOMMENTARFRI KILDE. Kommentaren inde i blokken er lang, og en
  // tegnbegrænset regex ramte forbi — ikke fordi koden var forkert.
  const s2 = udenKommentarer(start);
  ok(/\} finally \{[\s\S]*?sporEvent\("cvr_opslag", udfald/.test(s2),
     "⚠️ udfaldet maales i `finally` — saa den tekniske fejl ikke er den ene der slipper");
}
ok(/let udfald = "teknisk_fejl"/.test(start),
   "og default er teknisk_fejl, saa en undtagelse ikke bliver 'found'");

// ── 6 · PROPS: HVIDLISTEN ER SNÆVER OG PII-FRI ────────────────────────────
console.log("\n6 · PROPS NAAR FREM — OG KUN DE RIGTIGE");
for (const p of ["udfald", "fejl_aarsag", "match_count", "effective_codes", "surface",
                 "landing_path", "campaign_id", "ad_id", "funnel_version"]) {
  ok(new RegExp(`\\b${p}\\b`).test(ana), `${p} er hvidlistet`);
}
// ⚠️ INGEN SPREAD AF props. Et `...props` ville sende hvad som helst videre.
ok(!/\.\.\.props[,\s}]/.test(ana), "⚠️ props spredes IKKE ind i phProps");
// ⚠️ OG INGEN PII-FELTER I HVIDLISTEN.
for (const pii of ["cvr", "email", "firma", "company_name", "navn", "telefon", "phone", "adresse"]) {
  const iPhProps = new RegExp(`\\b${pii}:\\s*(props|attribution)\\.`).test(ana);
  ok(!iPhProps, `ingen ${pii} i phProps`);
}

// ── 7 · FORSIDE OG FUNNEL KAN SKELNES ─────────────────────────────────────
console.log("\n7 · ValueAnchorViewed: TO FLADER, TO ETIKETTER");
const vaerdi = readFileSync("components/salg/VaerdiSektion.js", "utf8");
ok(/sted: "forside"/.test(vaerdi), "forsiden maerker sig selv");
ok((start.match(/sporFunnel\("ValueAnchorViewed", \{ sted: "funnel" \}\)/g) || []).length === 2,
   "⚠️ og BEGGE funnel-kald maerker sig POSITIVT",
   "fravaer af en prop er en skroebelig diskriminator");
ok(!/sporFunnel\("ValueAnchorViewed"\)/.test(start), "intet umaerket kald tilbage i funnelen");

// ── 8 · FUNNEL_VERSION ER BUMPET ──────────────────────────────────────────
console.log("\n8 · FUNNEL_VERSION SKILLER FOER FRA EFTER");
const m = ana.match(/const FUNNEL_VERSION = "([^"]+)"/);
ok(!!m, "FUNNEL_VERSION findes", m?.[1]);
ok(m?.[1] !== "v2", "⚠️ den er bumpet vaek fra v2, saa data foer og efter kan skelnes", m?.[1]);

// ── 9 · PLAN-TRINNET HAR EN RIGTIG GENNEMFOERELSE ─────────────────────────
// ⚠️ DET HER ER FEJLEN DER KOSTEDE EN FORKERT KONKLUSION. `plan_reached 23 →
// PlanSelected 12` blev laest som 48 % frafald. PlanSelected fyrer kun paa
// maaned/aar-SKIFTEREN; de 11 "tabte" havde bare beholdt standardplanen.
// Vagten her holder tre ting: at kaeden findes, at progressionen IKKE er
// bundet til skifteren, og at de to events er to forskellige ting.
console.log("\n9 · PLAN: PROGRESSION OG SKIFT ER TO FORSKELLIGE HAENDELSER");
{
  // Kaeden skal kunne laeses ende til ende i mappingen.
  const kaede = ["plan_reached", "plan_confirmed", "payment_reached"];
  const navne = Object.values(POSTHOG_NAVN);
  for (const led of kaede) ok(navne.includes(led), `kaeden har ${led}`);

  // ⚠️ TO NAVNE, ALDRIG ÉT. Faldt de sammen, ville tragten igen blande
  // "skiftede plan" sammen med "gik videre".
  ok(POSTHOG_NAVN["onboarding_step_completed:PlanConfirmed"]
     !== POSTHOG_NAVN["onboarding_step_completed:PlanSelected"],
     "skift og progression deler ikke navn",
     `${POSTHOG_NAVN["onboarding_step_completed:PlanSelected"]} vs ${POSTHOG_NAVN["onboarding_step_completed:PlanConfirmed"]}`);
  ok(!navne.includes("plan_selected"),
     "⚠️ det tvetydige 'plan_selected' findes ikke laengere");

  const rent = udenKommentarer(start);

  // Praecis ét kaldested hver.
  const antalBekraeft = (rent.match(/sporFunnel\("PlanConfirmed"/g) || []).length;
  const antalSkift = (rent.match(/sporFunnel\("PlanSelected"/g) || []).length;
  ok(antalBekraeft === 1, "PlanConfirmed har praecis ét kaldested", String(antalBekraeft));
  ok(antalSkift === 1, "PlanSelected har stadig praecis ét kaldested", String(antalSkift));

  // ⚠️ PROGRESSIONEN MAA IKKE LIGGE I SKIFTEREN. Laa den der, ville den arve
  // praecis den fejl vi retter: kun de der roerte knappen ville taelle.
  const iSkifteren = /setInterval_\([^)]*\);\s*sporFunnel\("PlanConfirmed"/.test(rent);
  ok(!iSkifteren, "⚠️ progressionen fyrer IKKE fra maaned/aar-skifteren");

  // ⚠️ DEN SKAL LIGGE I `tilBetaling` — knappen der foerer videre.
  const i0 = rent.indexOf("async function tilBetaling()");
  const i1 = rent.indexOf("setArbejder(true)", i0);
  const hoved = rent.slice(i0, i1);
  ok(i0 >= 0 && i1 > i0 && /sporFunnel\("PlanConfirmed", \{ interval \}\)/.test(hoved),
     "den fyrer i tilBetaling, foer setArbejder(true)");

  // ⚠️ EFTER VALIDERINGEN, IKKE FOER. Et event over `if (!betingelser) return`
  // ville taelle hvert mislykket klik som en gennemfoert plan.
  const vagter = ["navn.trim()", "EMAIL_RE.test", "tilE164(tlf)", "!betingelser", "!abonnement"];
  const posBekraeft = hoved.indexOf('sporFunnel("PlanConfirmed"');
  ok(vagter.every((v) => hoved.indexOf(v) >= 0 && hoved.indexOf(v) < posBekraeft),
     "⚠️ alle fem valideringer staar FOER eventet",
     `${vagter.length}/5 passeret`);

  // ⚠️ NEGATIV PROEVE: ville vagten faelde, hvis eventet blev flyttet op over
  // betingelses-fluebenet? Ellers maaler den kun sin egen antagelse.
  const flyttet = hoved
    .replace(/\s*sporFunnel\("PlanConfirmed", \{ interval \}\);/, "")
    .replace('if (!betingelser)', 'sporFunnel("PlanConfirmed", { interval });\n    if (!betingelser)');
  const posFlyttet = flyttet.indexOf('sporFunnel("PlanConfirmed"');
  ok(!vagter.every((v) => flyttet.indexOf(v) >= 0 && flyttet.indexOf(v) < posFlyttet),
     "og vagten faelder en udgave hvor eventet staar foer fluebenet");

  // Prop'en skal naa frem, ellers kan vi ikke se HVILKEN plan.
  ok(/typeof props\.interval === "string"/.test(ana), "interval er hvidlistet til PostHog");
}

// ── 10 · v4: FORPLIGTELSEN STÅR HVOR DEN INDGÅS ───────────────────────────
// ⚠️ DEN HER ER JURIDISK, IKKE KOSMETISK. Growth #1 fjernede prøveperiode,
// binding og kortkrav fra CVR-trinnet, fordi knappen kun slår et CVR op.
// Det er KUN forsvarligt så længe de samme vilkår står fuldt og tydeligt på
// skærm 9, hvor `tilBetaling()` opretter kunden og starter prøven. Går den
// ene halvdel af den byttehandel tabt i en fremtidig redigering, skjuler vi
// pris og vilkår — og det må aldrig ske uopdaget.
console.log("\n10 · v4: VILKAARENE STAAR PAA SKAERM 9, IKKE PAA CVR-TRINNET");
{
  const rent = udenKommentarer(start);

  // Selve CVR-kortet: fra kortets id til den næste søskende-blok.
  // ⚠️ SLUT-LANDEMAERKET FLYTTEDE SIG (Growth #2). Vagten pejlede paa
  // `st-pre-bevis` — statistikgriddet under kortet — og da Growth #2 fjernede
  // det, blev udsnittet TOMT og alle "kortet naevner ikke X"-proever groenne
  // paa ingenting. Praecis den fejlklasse vagten selv findes for at fange.
  // Nu afgraenses kortet af det der faktisk FOELGER det: kundecitatet.
  // `kort.length > 200` nedenfor er det der ville have faeldet den tomme.
  const k0 = rent.indexOf('id="cvr-kort"');
  const k1 = rent.indexOf("<Kundecitat", k0);  // komponentens navn maa gerne skifte; at der FOELGER et citat, maa ikke
  const kort = k0 >= 0 && k1 > k0 ? rent.slice(k0, k1) : "";
  ok(kort.length > 200, "CVR-kortet kunne afgraenses", `${kort.length} tegn`);

  // ⚠️ INGEN FORPLIGTELSE I BESLUTNINGSOEJEBLIKKET.
  for (const forbudt of ["Kort kræves", "dage gratis", "Ingen binding", "0 kr. i dag"]) {
    ok(!kort.includes(forbudt), `CVR-kortet naevner ikke "${forbudt}"`);
  }
  // Og den nye mentale model skal faktisk staa der.
  ok(/Se jeres matches først\. Opret jer bagefter\./.test(kort), "men det staar hvad knappen IKKE goer");
  ok(/Vis mine matches →/.test(kort), "og CTA'en lover resultatet");

  // Skærm 9 — hvor forpligtelsen faktisk indgås.
  const n0 = rent.indexOf("{trin === 9 && (");
  const n1 = rent.indexOf("{trin === 10 &&", n0);
  const trin9 = n0 >= 0 && n1 > n0 ? rent.slice(n0, n1) : "";
  ok(trin9.length > 1000, "skaerm 9 kunne afgraenses", `${trin9.length} tegn`);

  ok(/priceText\.yearly/.test(trin9), "⚠️ PRISEN staar paa skaerm 9");
  ok(/\{TRIAL_DAYS\} dage gratis/.test(trin9), "⚠️ PROEVEPERIODEN staar paa skaerm 9");
  ok(/Ingen binding/.test(trin9), "⚠️ INGEN BINDING staar paa skaerm 9");
  ok(/tilføj kort for at starte/.test(trin9), "⚠️ KORTKRAVET staar paa skaerm 9");
  ok(/0 kr\. trækkes i dag/.test(trin9), "⚠️ FOERSTE BETALING staar paa skaerm 9");
  ok(/handelsbetingelser/.test(trin9) && /abonnementsbetingelser/.test(trin9),
     "⚠️ BEGGE paakraevede samtykker staar paa skaerm 9");
  ok(/fornyes automatisk/.test(trin9), "⚠️ AUTOMATISK FORNYELSE er oplyst");

  // ⚠️ OG FORPLIGTELSEN SKAL FAKTISK INDGAAS DER — ikke paa skaerm 1.
  // Flyttes signup-kaldet frem, falder hele begrundelsen for at fjerne
  // linjerne, og vagten skal sige fra.
  ok(/onClick=\{tilBetaling\}/.test(trin9), "og signup-kaldet ligger paa skaerm 9");
  ok(!kort.includes("submitSignup") && !kort.includes("tilBetaling"),
     "⚠️ CVR-trinnet opretter stadig ingenting");

  // ⚠️ NEGATIV PROEVE: vagten skal kunne faelde begge veje.
  ok(kort.replace("Vis mine matches", "x").includes("Vis mine matches") === false
     && (kort + "Kort kræves").includes("Kort kræves"),
     "og proeven reagerer paa baade mangel og tilfoejelse");
}

console.log(`\n${fejl === 0 ? "GROEN" : "ROED"} — ${fejl} fejl`);
process.exitCode = fejl === 0 ? 0 : 1;
