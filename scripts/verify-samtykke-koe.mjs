// ============================================================================
// SAMTYKKE-KØEN — tabes en hændelse, der sker før kunden tager stilling?
//
// ⚠️ DEN KØRER DEN RIGTIGE lib/ctaSporing.js, ikke en kopi. Browser-miljøet
// efterlignes (window, localStorage, navigator, fetch), og hver afsendelse
// opsnappes i stedet for at forlade maskinen. Et mock af modulet ville bevise
// at mocket virker.
//
// ⚠️ HVORFOR DEN FINDES. En rigtig Meta-besøgende landede 07:54:37 og
// gennemførte fem trin — men `onboarding_started` og trin 1 manglede, fordi de
// fyrer ved mount, før hun nåede banneret. Fejlen kostede den vigtigste
// hændelse i tragten for enhver førstegangsbesøgende.
//
// ⚠️ DEN RØRER HVERKEN DATABASE, PRODUKTION ELLER RIGTIGE KUNDER. Intet
// netværkskald slipper ud; `fetch` og `sendBeacon` er fanget.
//
//   node --import ./scripts/esm-loader.mjs scripts/verify-samtykke-koe.mjs
// ============================================================================

let fejl = 0;
const ok = (b, t, d = "") => { if (!b) fejl++; console.log(`  ${b ? "✓" : "✖"} ${t}${d ? "  — " + d : ""}`); };

// ── Browser-miljøet ────────────────────────────────────────────────────────
const sendt = [];            // alt der ville forlade browseren
const lager = new Map();     // localStorage
let samtykke = null;         // hvad banneret har gemt

const lyttere = {};
globalThis.window = {
  location: { pathname: "/start", search: "", hostname: "www.birdly.dk" },
  localStorage: {
    getItem: (k) => (k === "birdly_samtykke" ? samtykke : lager.get(k) ?? null),
    setItem: (k, v) => lager.set(k, v),
    removeItem: (k) => lager.delete(k),
  },
  sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  addEventListener: (n, f) => { (lyttere[n] ||= []).push(f); },
  removeEventListener: () => {},
  dispatchEvent: (e) => { for (const f of lyttere[e.type] || []) f(e); return true; },
};
globalThis.localStorage = window.localStorage;
globalThis.sessionStorage = window.sessionStorage;
globalThis.document = { cookie: "", referrer: "" };
// ⚠️ `navigator` ER READ-ONLY I NODE 24 — den kan ikke tildeles, kun
// redefineres. sendBeacon RETURNERER true, praecis som i en rigtig browser: den
// melder "sat i koe", ikke "leveret". Det var netop den semantik der skjulte
// CORS-fejlen, og testen skal derfor efterligne den.
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: { sendBeacon: (url, blob) => { sendt.push({ via: "beacon", url, body: blob.__krop }); return true; } },
});
globalThis.Blob = class { constructor(dele) { this.__krop = dele.join(""); } };
globalThis.fetch = (url, o) => { sendt.push({ via: "fetch", url, body: o?.body }); return Promise.resolve({ ok: true }); };
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";

const giv = (valg) => {
  samtykke = JSON.stringify({ version: 1, valg: { noedvendige: true, ...valg }, tid: new Date().toISOString() });
  window.dispatchEvent({ type: "birdly-samtykke", detail: valg });
};
const nulstil = () => { samtykke = null; sendt.length = 0; lager.clear(); };
// ⚠️ EN FRISK SIDEINDLAESNING — kaldes KUN lige foer en ny import. Hver import
// registrerer sin egen lytter paa det FAELLES window; uden at rydde dem ville en
// tidligere sektions ikke-flushede koe blive sendt med, naar en senere sektion
// giver samtykke — og maalingen ville vaere af testen, ikke af koden.
// ⚠️ MAA IKKE BRUGES i sektioner der lever paa top-level-importen: saa fjerner
// den netop den lytter, der skal bevise flushet.
const friskSide = () => { nulstil(); lyttere["birdly-samtykke"] = []; };
const kroppe = () => sendt.map((s) => JSON.parse(s.body));

// ⚠️ MODULET IMPORTERES FØRST NU — dets lytter registreres ved import, og
// miljøet skal stå klar inden.
const { sporEvent, sporFunnel, sporCta } = await import("../lib/ctaSporing.js");

// ── A · SAMTYKKE ALLEREDE GIVET VED MOUNT ──────────────────────────────────
console.log("\n══ A · SAMTYKKET LÅ DER I FORVEJEN");
nulstil();
samtykke = JSON.stringify({ version: 1, valg: { noedvendige: true, statistik: true }, tid: new Date().toISOString() });
sporEvent("landing_page_view");
ok(sendt.length === 1, "hændelsen sendes med det samme", `${sendt.length}`);
ok(kroppe()[0]?.event === "landing_page_view", "og med rigtigt navn");
ok(!kroppe()[0]?.occurred_at, "uden occurred_at — serveren bruger sin egen tid");

// ── B · INTET SAMTYKKE ENDNU ───────────────────────────────────────────────
console.log("\n══ B · KUNDEN HAR IKKE TAGET STILLING");
nulstil();
sporEvent("landing_page_view");
sporFunnel("FunnelStarted", { fag: null });
sporEvent("onboarding_step_viewed", "cvr", { trin_nr: 1 });
ok(sendt.length === 0, "INTET forlod browseren", `${sendt.length} kald`);
ok(lager.size === 0, "og intet blev persisteret lokalt", `${lager.size} nøgler`);

// ── C · HUN ACCEPTERER BAGEFTER ────────────────────────────────────────────
console.log("\n══ C · SAMTYKKET GIVES EFTER MOUNT");
// ⚠️ ET SEKUNDS PAUSE, saa flush-tidspunktet er maalbart forskelligt fra
// koe-tidspunktet. Uden den falder begge i samme millisekund, og testen ville
// ikke kunne se forskel paa "bevaret tid" og "flush-tid".
await new Promise((r) => setTimeout(r, 1100));
const flushTid = new Date().toISOString();
giv({ statistik: true });
ok(sendt.length === 3, "hele køen blev sendt", `${sendt.length} af 3`);
const k = kroppe();
ok(k.every((x) => !!x.occurred_at), "hver bærer sin egen occurred_at");
ok(k.every((x) => x.occurred_at < flushTid), "og den er FRA FØR flushet — ikke flush-tidspunktet",
   `${k[0]?.occurred_at?.slice(11, 23)} < ${flushTid.slice(11, 23)}`);

// ── D · RÆKKEFØLGE OG OVERSÆTTELSE ─────────────────────────────────────────
console.log("\n══ D · RÆKKEFØLGE OG KANONISKE NAVNE");
ok(k[0].event === "landing_page_view" && k[1].event === "onboarding_started" && k[2].event === "onboarding_step_viewed",
   "rækkefølgen er bevaret", k.map((x) => x.event).join(" → "));
ok(k[1].step === "FunnelStarted", "husets navn oversat til kanonisk type + step", `${k[1].event}/${k[1].step}`);
ok(k.every((x, i) => i === 0 || x.occurred_at >= k[i - 1].occurred_at), "tiderne er ikke-faldende");

// ── E · SAMTYKKE-HÆNDELSEN GENTAGES ────────────────────────────────────────
console.log("\n══ E · BANNERET UDSENDER SIN HÆNDELSE IGEN");
const foer = sendt.length;
giv({ statistik: true });
giv({ statistik: true });
ok(sendt.length === foer, "ingen dubletter", `${foer} → ${sendt.length}`);

// ── F · HUN AFVISER STATISTIK ──────────────────────────────────────────────
console.log("\n══ F · STATISTIK AFVISES");
friskSide();
const { sporEvent: sporEvent2 } = await import(`../lib/ctaSporing.js?nej=${Date.now()}`);
sporEvent2("landing_page_view");
sporEvent2("cta_clicked");
ok(sendt.length === 0, "køet, intet sendt");
giv({ statistik: false, marketing: true });
ok(sendt.length === 0, "og et NEJ sender stadig intet", `${sendt.length}`);

// ── G · HUN FORLADER SIDEN UDEN AT SVARE ───────────────────────────────────
console.log("\n══ G · FANEN LUKKES UDEN SVAR");
friskSide();
const { sporEvent: sporEvent3 } = await import(`../lib/ctaSporing.js?vaek=${Date.now()}`);
sporEvent3("landing_page_view");
ok(sendt.length === 0, "intet sendt");
ok(lager.size === 0, "intet i localStorage — køen dør med fanen");

// ── H · INGEN REGRESSION FOR EN KENDT BESØGENDE ────────────────────────────
console.log("\n══ H · GENBESØG MED GEMT SAMTYKKE");
friskSide();
samtykke = JSON.stringify({ version: 1, valg: { noedvendige: true, statistik: true }, tid: new Date().toISOString() });
const { sporEvent: sporEvent4, sporCta: sporCta4, sporFunnel: sporFunnel4 } = await import(`../lib/ctaSporing.js?igen=${Date.now()}`);
sporEvent4("landing_page_view");
sporCta4("hero", "/start");
sporFunnel4("CVRStarted", {});
ok(sendt.length === 3, "alle tre indgange sender direkte som før", `${sendt.length}`);
ok(kroppe().every((x) => !x.occurred_at), "og ingen af dem bærer occurred_at");
ok(kroppe()[1]?.props?.sted === "hero", "CTA'ens placering følger med");

// ── I · IDENTITET OG ATTRIBUTION PÅ KØEDE HÆNDELSER ────────────────────────
console.log("\n══ I · ANON_ID, STI OG ATTRIBUTION OVERLEVER KØEN");
friskSide();
const { sporEvent: sporEvent5 } = await import(`../lib/ctaSporing.js?attr=${Date.now()}`);
window.location.pathname = "/kom-i-gang";
sporEvent5("landing_page_view");
window.location.pathname = "/start"; // kunden navigerer videre FØR hun svarer
giv({ statistik: true });
const kk = kroppe()[0];
ok(/^b[0-9a-f]{32}$/.test(kk?.anon_id || ""), "anon_id er dannet og har husets form", kk?.anon_id?.slice(0, 9));
ok(kk?.path === "/kom-i-gang", "stien er DEN FRA DENGANG, ikke den hun står på nu", kk?.path);
ok(typeof kk?.attribution === "object", "attributionsobjektet er med");

console.log("\n" + (fejl
  ? `✖ ${fejl} fejl — køen holder ikke.`
  : "✓ Køen holder: intet før samtykke, intet persisteret, alt flushet én gang med sin egen tid."));
process.exitCode = fejl ? 1 : 0;
