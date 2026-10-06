// ============================================================================
// VERIFIKATION — SAMTYKKE-HÆNDELSEN SKAL KUNNE KNYTTES TIL KUNDEN (06-10-2026)
//
// ⚠️ DEN RETTEDE FEJL: `maalSamtykke` LÆSTE anon_id og oprettede det aldrig.
// Ved det første ja fandtes id'et ikke endnu — det skabes bagefter af
// Maaling.js — så hændelsen gik ud uden id. Målt i produktionen: 215 af 224
// consent_recorded uden visitor_id, NUL på en ægte besøgende, og dermed
// birdly_marketing_samtykke() = false for alle 66 kunder.
//
// ⚠️ DEN KØRER DEN RIGTIGE KODE. Hele modulgrafen importeres og funktionen
// KALDES med et falsk window. En vagt der kun greb efter "hentAnonId" i
// kildeteksten ville være grøn selv hvis cyklussen
// samtykkeMaaling → anonId → samtykke → samtykkeMaaling gjorde bindingen
// undefined ved kald — og det er netop den risiko den gamle note advarede om.
//
// ⚠️ OG DEN PRØVER DET FARLIGE: at et NEJ skulle kunne skabe et id. Det er
// den regel der ikke må ryge med i rettelsen.
//
//   node --import ./scripts/esm-loader.mjs scripts/verify-samtykke-id.mjs
// ============================================================================

let fejl = 0;
const ok = (b, t, d = "") => {
  console.log(`  ${b ? "✓" : "✖"} ${t}${d ? "  — " + d : ""}`);
  if (!b) fejl++;
};

// ── ET FALSK BROWSERMILJØ ───────────────────────────────────────────────────
// ⚠️ localStorage ER EN RIGTIG LILLE BUTIK, ikke en stub der svarer null.
// Rettelsen handler om en SKRIVNING; en stub uden hukommelse ville ikke kunne
// se forskel på "skabte et id" og "gjorde ingenting".
function nytMiljoe() {
  const butik = new Map();
  const sendt = [];
  globalThis.window = {
    localStorage: {
      getItem: (k) => (butik.has(k) ? butik.get(k) : null),
      setItem: (k, v) => butik.set(k, String(v)),
      removeItem: (k) => butik.delete(k),
    },
    sessionStorage: {
      getItem: () => null, setItem: () => {}, removeItem: () => {},
    },
    location: { pathname: "/start", search: "", href: "https://www.birdly.dk/start" },
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  globalThis.document = { cookie: "" };
  // ⚠️ `navigator` ER READ-ONLY I NODE 24 (kun en getter paa globalThis), saa
  // en almindelig tildeling kaster. defineProperty er den eneste vej ind.
  // ⚠️ sendBeacon RETURNERER false, saa koden falder ned i fetch-grenen og vi
  // kan laese kroppen. Begge grene sender samme JSON.
  Object.defineProperty(globalThis, "navigator", {
    value: { sendBeacon: () => false },
    configurable: true,
    writable: true,
  });
  globalThis.fetch = (url, opt) => {
    sendt.push(JSON.parse(opt.body));
    return Promise.resolve({ ok: true });
  };
  globalThis.Blob = class { constructor() {} };
  return { butik, sendt };
}

const NOEGLE_SAMTYKKE = "birdly_samtykke";
const NOEGLE_ID = "birdly_anon";
const gemValg = (butik, valg) =>
  butik.set(NOEGLE_SAMTYKKE, JSON.stringify({ version: 1, valg, tid: new Date().toISOString() }));

// ⚠️ SPOR_URL LÆSES PÅ MODUL-NIVEAU, så den skal stå FØR importen. Uden den
// returnerer maalSamtykke tavst på sin første linje, og hele filen ville være
// grøn på nul hændelser. Adressen kaldes aldrig — fetch er stubbet ovenfor —
// men den skal findes.
process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://vagt.invalid";

// Importeres ÉN gang — modulerne er statefulde nok til at en frisk import pr.
// test ville skjule en cyklus-fejl der kun rammer første evaluering.
const { maalSamtykke } = await import("../lib/samtykkeMaaling.js");
const { hentAnonId } = await import("../lib/anonId.js");

// ── 1 · JA TIL STATISTIK SKABER ET ID, OG HÆNDELSEN BÆRER DET ──────────────
console.log("\n1 · JA TIL STATISTIK ⇒ FORBINDELIG HAENDELSE");
{
  const { butik, sendt } = nytMiljoe();
  gemValg(butik, { statistik: true, marketing: true });
  ok(butik.get(NOEGLE_ID) === undefined, "udgangspunkt: der findes INTET id");

  maalSamtykke({ statistik: true, marketing: true }, "valgt");

  const id = butik.get(NOEGLE_ID);
  ok(typeof id === "string" && /^b[0-9a-f]{32}$/.test(id),
     "⚠️ id'et BLEV skabt, og det har husets form", id || "MANGLER");
  ok(sendt.length === 1, "praecis én haendelse sendt", String(sendt.length));
  ok(sendt[0]?.event === "consent_recorded", "og det er consent_recorded", sendt[0]?.event);
  ok(sendt[0]?.anon_id === id,
     "⚠️ HAENDELSEN BAERER ID'ET — det var hele fejlen", sendt[0]?.anon_id || "INTET ID MED");
  ok(sendt[0]?.props?.statistik === true && sendt[0]?.props?.marketing === true,
     "og begge svar foelger med");
}

// ── 2 · NEJ TIL STATISTIK SKABER ALDRIG ET ID ──────────────────────────────
// ⚠️ DEN VIGTIGSTE PROEVE I FILEN. Rettelsen gjorde funktionen skabende; her
// bevises at den kun er det ved et ja.
console.log("\n2 · NEJ TIL STATISTIK ⇒ INTET ID, HVERKEN SKABT ELLER SENDT");
{
  const { butik, sendt } = nytMiljoe();
  gemValg(butik, { statistik: false, marketing: false });

  maalSamtykke({ statistik: false, marketing: false }, "valgt");

  ok(butik.get(NOEGLE_ID) === undefined,
     "⚠️ INTET id blev skabt af et nej", butik.get(NOEGLE_ID) || "ingen");
  ok(sendt.length === 1, "nejet maales stadig — ellers er afvisningsraten ukendt");
  ok(!("anon_id" in (sendt[0] || {})),
     "⚠️ og haendelsen baerer INTET id", JSON.stringify(sendt[0]?.anon_id));
  ok(sendt[0]?.props?.statistik === false, "props siger nej til statistik");
}

// ── 2b · NEJ TIL STATISTIK, JA TIL MARKETING ───────────────────────────────
// ⚠️ DEN KOMBINATION ER MULIG I BANNERET, og den er fælden: et ja et andet
// sted må ikke kunne åbne for id'et.
console.log("\n2b · NEJ TIL STATISTIK MEN JA TIL MARKETING ⇒ STADIG INTET ID");
{
  const { butik, sendt } = nytMiljoe();
  gemValg(butik, { statistik: false, marketing: true });
  maalSamtykke({ statistik: false, marketing: true }, "valgt");
  ok(butik.get(NOEGLE_ID) === undefined, "intet id skabt");
  ok(!("anon_id" in (sendt[0] || {})), "intet id sendt");
}

// ── 3 · NULSTILLING SKABER HELLER ALDRIG ET ID ─────────────────────────────
// `nulstilSamtykke()` kalder maalSamtykke(INTET, "nulstillet"). En tilbage-
// kaldelse må ikke være det der giver hende et nyt id at blive målt med.
console.log("\n3 · TILBAGEKALDELSE ⇒ INTET NYT ID");
{
  const { butik, sendt } = nytMiljoe();
  maalSamtykke({ statistik: false, marketing: false }, "nulstillet");
  ok(butik.get(NOEGLE_ID) === undefined, "intet id skabt ved nulstilling");
  ok(sendt[0]?.props?.tilstand === "nulstillet", "tilstanden foelger med", sendt[0]?.props?.tilstand);
}

// ── 4 · ET EKSISTERENDE ID GENBRUGES, DER SKABES IKKE ET NYT ───────────────
// ⚠️ ELLERS VILLE HVERT SAMTYKKESKIFT STARTE EN NY PERSON, og den samme
// besøgende ville optræde som to i tragten.
console.log("\n4 · ET EKSISTERENDE ID GENBRUGES");
{
  const { butik, sendt } = nytMiljoe();
  gemValg(butik, { statistik: true, marketing: false });
  butik.set(NOEGLE_ID, "b" + "a".repeat(32));
  maalSamtykke({ statistik: true, marketing: false }, "valgt");
  ok(butik.get(NOEGLE_ID) === "b" + "a".repeat(32), "id'et er uaendret");
  ok(sendt[0]?.anon_id === "b" + "a".repeat(32), "og haendelsen baerer det samme");
}

// ── 5 · CYKLUSSEN ER DOED ──────────────────────────────────────────────────
// ⚠️ DEN GAMLE NOTE ADVAREDE MOD IMPORTEN: samtykkeMaaling → anonId →
// samtykke → samtykkeMaaling. §1 beviser allerede at bindingen virker ved
// kald; her siges det eksplicit, saa en fremtidig laeser ved at det ER proevet.
console.log("\n5 · IMPORT-CYKLUSSEN BRYDER IKKE BINDINGEN");
{
  const { butik } = nytMiljoe();
  gemValg(butik, { statistik: true, marketing: true });
  ok(typeof hentAnonId === "function", "hentAnonId er bundet ved kaldetidspunkt");
  const id = hentAnonId();
  ok(typeof id === "string" && /^b[0-9a-f]{32}$/.test(id),
     "og den svarer gennem hele cyklussen", id || "null");
}

// ── 6 · MARKETING-REGLEN ER IKKE RØRT ──────────────────────────────────────
// ⚠️ ID'ET ER STATISTIK. Meta må stadig kun røres med MARKETING-samtykke, og
// den regel bor ét sted: components/Maaling.js (pixlen) og
// meta_konverteringer_i_koe (serveren). Rettelsen må ikke have flyttet den.
console.log("\n6 · META KRAEVER STADIG MARKETING-SAMTYKKE");
{
  const { readFileSync } = await import("node:fs");
  const maaling = readFileSync("components/Maaling.js", "utf8");
  const sm = readFileSync("lib/samtykkeMaaling.js", "utf8");
  ok(/if \(maa\("marketing"\)\) indlaesPixel\(\);/.test(maaling),
     "pixlen indlaeses stadig KUN paa marketing-samtykke");
  ok(/else fjernPixel\(\);/.test(maaling), "og fjernes uden");
  ok(!/fbq|indlaesPixel|pixel/i.test(sm),
     "⚠️ samtykkeMaaling roerer ikke Meta overhovedet");
  // ⚠️ OG DEN MAA IKKE VAERE BLEVET EN BAGDOER: id'et sendes kun til husets
  // eget `spor`-endepunkt, aldrig videre.
  const urler = sm.match(/https?:\/\/[^\s"'`]+/g) || [];
  ok(urler.length === 0, "ingen hardkodede eksterne adresser", urler.join(", ") || "0");
  ok(/functions\/v1\/spor/.test(sm), "kun husets eget spor-endepunkt");
}

// ── 7 · ATTRIBUTIONEN ER IKKE RØRT ─────────────────────────────────────────
// ⚠️ ID'ET MAA IKKE VAERE HAVNET I ATTRIBUTIONEN. De to ligger bag HVERT sit
// samtykke; blandes de, mister enhver der siger nej til annoncemaaling
// halvdelen af tragten — og `markedsforing/ai-trafik` ville begynde at taelle
// organiske tilmeldinger som kampagnetrafik.
console.log("\n7 · ATTRIBUTION OG ID ER STADIG ADSKILT");
{
  const { readFileSync } = await import("node:fs");
  const attr = readFileSync("lib/attribution.js", "utf8");
  ok(!/anon_id|hentAnonId|birdly_anon/.test(attr), "attribution.js kender ikke id'et");
  ok(/maa\("marketing"\)/.test(attr), "og den gater stadig paa marketing");
}

// ── 8 · INGEN PII I HAENDELSEN ─────────────────────────────────────────────
console.log("\n8 · HAENDELSEN BAERER INTET PERSONHENFOERBART");
{
  const { butik, sendt } = nytMiljoe();
  gemValg(butik, { statistik: true, marketing: true });
  maalSamtykke({ statistik: true, marketing: true }, "valgt");
  // ⚠️ EN TOM HAENDELSE MAA IKKE GIVE EN GROEN §8. Uden den her ville
  // "ingen cvr i kroppen" vaere sandt om `undefined`.
  ok(sendt.length === 1, "der ER en haendelse at undersoege", String(sendt.length));
  const h = sendt[0] || { props: {} };
  const krop = JSON.stringify(h);
  const tilladte = ["event", "anon_id", "handling_id", "path", "props"];
  ok(Object.keys(h).every((k) => tilladte.includes(k)),
     "kun de fem tilladte felter", Object.keys(h).join(", "));
  ok(Object.keys(h.props || {}).every((k) => ["marketing", "statistik", "tilstand"].includes(k)),
     "og props har kun de tre svar", Object.keys(h.props || {}).join(", "));
  for (const pii of ["cvr", "email", "mail", "telefon", "phone", "navn", "firma", "adresse"]) {
    ok(!new RegExp(`"${pii}"`, "i").test(krop), `ingen ${pii}`);
  }
  // ⚠️ NEGATIV PROEVE paa selve PII-udtrykket, saa §8 ikke er groen af
  // ingenting.
  ok(/"email"/i.test(`{"email":"a@b.dk"}`), "og proeven kan faelde en mail");
}

console.log(`\n${fejl === 0 ? "GROEN" : "ROED"} — ${fejl} fejl`);
process.exitCode = fejl === 0 ? 0 : 1;
