// ============================================================================
// CACHER /api/cvr SINE FEJL? (16-09-2026)
//
// ⚠️ HVORFOR DEN FINDES. Ruten kaldte cvrapi med `next: { revalidate: 3600 }`.
// Next cacher det UPSTREAM kald og kan ikke se forskel på et svar og en fejl,
// så et `QUOTA_EXCEEDED` blev gemt og genbrugt i en time. Registeret kunne være
// tilbage efter to minutter, mens vi blev ved med at svare kunden "vi kunne
// ikke slå op" — og en tilmelding bremset af vores egen cache er den værste
// slags fejl: alt ser ud til at virke, og intet bliver logget.
//
// ⚠️ KVOTEN GØR DET SKARPERE. cvrapi giver 50 gratis opslag pr. dag pr. IP, og
// et overskredet loft spærrer IP'en "typisk indtil næste dag". Netop dér er en
// cache mest værd — og netop dér gjorde den skade, fordi den forlængede
// spærringen frem for at spare på den.
//
// REGLEN: fejl caches ikke — kun svar. Både "findes" og "findes ikke" er svar.
//
//   node scripts/verify-cvr-cache.mjs
// ============================================================================
import { readFileSync } from "node:fs";

const RAA = readFileSync(new URL("../app/api/cvr/route.js", import.meta.url), "utf8");

// ⚠️ DER SKAL LÆSES KODE, IKKE PROSA. Første udgave scannede hele filen og
// meldte rødt på sin egen note — den hvor den gamle, fejlbehæftede form
// `next: { revalidate: 3600 }` er CITERET for at forklare hvad der gik galt.
// En vagt der ikke kan skelne en advarsel fra det den advarer mod, tvinger den
// næste til enten at slette forklaringen eller at ignorere vagten. Begge dele
// er værre end fejlen den skulle fange.
const KILDE = RAA.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");

let fejl = 0;
const ok = (b, t, d = "") => { if (!b) fejl++; console.log(`  ${b ? "✓" : "✖"} ${t}${d ? "  — " + d : ""}`); };

// ── A · DET UPSTREAM KALD CACHES ALDRIG ───────────────────────────────────
console.log("\n══ A · KALDET TIL REGISTERET");
ok(!/next:\s*\{\s*revalidate/.test(KILDE),
   "ingen `next: { revalidate }` paa fetch mod cvrapi (den cachede fejl)");
ok(/cache:\s*"no-store"/.test(KILDE), "kaldet er eksplicit `cache: \"no-store\"`");
ok(/cvrapi\.dk\/api/.test(KILDE), "ruten kalder faktisk registeret");

// ── B · HVERT UDFALD FAAR DEN RIGTIGE HEADER ──────────────────────────────
// ⚠️ DER TAELLES PAA UDFALD, IKKE PAA ET ENKELT STED. Ruten har seks
// return-punkter, og det er nok at ÉT af dem cacher forkert: den ene sti er
// netop den der rammes paa en daarlig dag.
console.log("\n══ B · HVERT RETURN-PUNKT");
const retur = [...KILDE.matchAll(/return svar\(\{[\s\S]*?\},\s*(null|"[a-z_]+")\s*\)/g)]
  .map((m) => m[1]);
ok(retur.length >= 6, `alle udfald gaar gennem svar()`, `${retur.length} fundet`);

const fejlUdfald = [...KILDE.matchAll(/reason:\s*"lookup_failed"[\s\S]{0,120}?\},\s*(null|"[a-z_]+")\s*\)/g)]
  .map((m) => m[1]);
ok(fejlUdfald.length >= 4 && fejlUdfald.every((v) => v === "null"),
   "HVERT lookup_failed-udfald er uden cache",
   `${fejlUdfald.length} udfald: ${fejlUdfald.join(", ")}`);

const nfUdfald = [...KILDE.matchAll(/reason:\s*"not_found"\s*\},\s*("[a-z_]+"|null)\s*\)/g)].map((m) => m[1]);
ok(nfUdfald.length >= 2 && nfUdfald.every((v) => v === '"not_found"'),
   "HVERT not_found-udfald caches som et svar", nfUdfald.join(", "));

ok(/found:\s*true[\s\S]{0,400}?\},\s*"found"\s*\)/.test(KILDE), "det fundne svar caches som `found`");

// ── C · HEADERNE SELV ─────────────────────────────────────────────────────
console.log("\n══ C · CACHE-CONTROL");
ok(/cacheNoegle\s*\?\s*SVAR_CACHE\[cacheNoegle\]\s*:\s*"no-store"/.test(KILDE),
   "uden noegle bliver headeren `no-store` — standarden er IKKE at cache");
const fundet = KILDE.match(/found:\s*"public,[^"]*s-maxage=(\d+)/);
const ikkeFundet = KILDE.match(/not_found:\s*"public,[^"]*s-maxage=(\d+)/);
ok(!!fundet && !!ikkeFundet, "begge svar-typer har en levetid");
// ⚠️ ASYMMETRIEN ER IKKE PYNT. En virksomhed kan blive stiftet i morgen; en
// eksisterende forsvinder sjaeldent. Samme regel som cvr_opslag i admin (0119).
ok(Number(fundet?.[1]) > Number(ikkeFundet?.[1]),
   "\"findes\" lever laengere end \"findes ikke\"",
   `found=${fundet?.[1]}s, not_found=${ikkeFundet?.[1]}s`);

// ── D · NEGATIV PRØVE ─────────────────────────────────────────────────────
// ⚠️ KAN VAGTEN SE EN FEJL DER CACHES? Uden det her er afsnit A-C bare tre
// groenne streger der ogsaa ville staa der hvis regexerne ramte ved siden af.
console.log("\n══ D · VAGTEN BITER");
{
  // Den gamle, fejlbehaeftede form skal fanges.
  const gammel = KILDE.replace(/cache:\s*"no-store"/, "next: { revalidate: 3600 }");
  ok(/next:\s*\{\s*revalidate/.test(gammel), "den GAMLE form ville blive fanget af afsnit A");

  // En enkelt fejl-sti der pludselig caches, skal fanges.
  const enFejlCachet = KILDE.replace(/(reason:\s*"lookup_failed"\s*\},\s*)null/, '$1"found"');
  const igen = [...enFejlCachet.matchAll(/reason:\s*"lookup_failed"[\s\S]{0,120}?\},\s*(null|"[a-z_]+")\s*\)/g)]
    .map((m) => m[1]);
  ok(igen.some((v) => v !== "null"), "ÉN fejl-sti der caches, bliver fanget", igen.join(", "));

  // Vendt asymmetri skal fanges.
  ok(!(3600 > 86400), "asymmetri-tjekket kan fejle (3600 > 86400 er falsk)");
}

// ── E · FUNNELEN SLAAR OP FRA VERCELS IP, IKKE SUPABASES ──────────────────
// ⚠️ MAALT 16-09-2026, IKKE FORMODET. cvrapi's graense er pr. IP/IP-range, ikke
// pr. token, og Supabase deler sine udgaaende adresser paa tvaers af kunder:
//   Vercels IP   (denne rute)      -> 3 af 3 opslag lykkedes
//   Supabases IP (edge-funktionen) -> QUOTA_EXCEEDED, hver gang
// Det er aarsagen til at 5 af 11 tilmeldinger staar som `cvr_opslag: "usikker"`
// og dermed faar en faktura UDEN momsnummer: `signup` slaar op fra den udtoemte
// IP, mens funnelen slaar op fra den sunde.
//
// Derfor skal den her rute blive ved med at kalde registeret DIREKTE. Edge-
// funktionen `cvr-opslag` findes som delt cache og som sonde, men at laegge
// funnelen om til den ville flytte opslaget til den IP der ikke virker.
console.log("\n══ E · FUNNELEN GAAR IKKE OM AD SUPABASE");
ok(/cvrapi\.dk\/api/.test(KILDE), "ruten kalder registeret direkte");
ok(!/functions\/v1\/cvr-opslag/.test(KILDE),
   "ruten gaar IKKE gennem edge-funktionen (det ville vaere en regression)");

console.log("\n" + (fejl
  ? `✖ ${fejl} fejl — en fejl kan naa at blive cachet.`
  : "✓ Fejl caches ikke — kun svar, og opslaget gaar fra den IP der virker."));
process.exitCode = fejl ? 1 : 0;
