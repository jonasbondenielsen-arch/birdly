// ============================================================================
// STÅR JURA-TEKSTEN STADIG ORDRET SOM I PAKKEN?
//
// ⚠️ DEN FINDES FORDI JURA ER DET ENESTE STED HVOR EN "FORBEDRING" ER EN FEJL.
// Marketing-copy kan omformuleres af en der mener det godt. En betingelse kan
// ikke: teksten er gennemgået som en HELHED, og en enkelt ændret sætning kan
// flytte et ansvar uden at nogen opdager det. lib/uk/jura.js er klippet ud af
// pakken af et script — men intet forhindrer nogen i at rette en linje bagefter.
// Den her vagt gør.
//
// ⚠️ DEN SAMMENLIGNER MOD KILDEN, IKKE MOD EN KOPI. Pakken er sandhedskilden.
// Ligger den ikke på maskinen, fejler vagten med exit 2 — den melder ALDRIG
// grønt bare fordi den ikke kunne finde noget at sammenligne med. Det var
// præcis sådan DK-beviset var grønt på et forældet build.
//
//   node scripts/verify-uk-jura.mjs [sti/til/BIRDLY_UK_LEGAL_PACK.md]
//
// ⚠️ DE TO PRISER ER DEN ENESTE TILLADTE AFVIGELSE. Jonas har låst £59/£590,
// og de er sat ind i stedet for [UK_MONTHLY_PRICE]/[UK_ANNUAL_PRICE].
// Vagten regner derfor den samme substitution ind i kilden før den sammenligner.
// Alt andet skal være tegn for tegn.
// ============================================================================
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { UK_JURA, hubKort } from "../lib/uk/jura.js";

const KANDIDATER = [
  process.argv[2],
  join(homedir(), "Downloads", "BIRDLY_UK_LEGAL_PACK_2026-09-08.md"),
  "BIRDLY_UK_LEGAL_PACK_2026-09-08.md",
].filter(Boolean);

const sti = KANDIDATER.find((s) => existsSync(s));
if (!sti) {
  console.error("✖ Jura-pakken blev ikke fundet. Proevede:");
  for (const k of KANDIDATER) console.error("   " + k);
  process.exit(2);
}

// ⚠️ PLACEHOLDEREN HOLDER TALLET, IKKE VALUTATEGNET. Pakken skriver selv
// "£[UK_MONTHLY_PRICE]", saa en substitution til "£59" gav "££59" — fire steder
// i renderet produktion (Terms & Conditions §3.2 og Subscription Terms §1).
// Rettet 11-09-2026: der indsaettes nu kun tallet, og pakkens eget £ staar
// tilbage praecis hvor det altid har staaet.
//
// ⚠️ SUPPORT-ADRESSEN ER JONAS' BESLUTNING, IKKE EN RETTELSE AF PAKKEN.
// Pakken blev skrevet med support@birdly.dk. Jonas' UK-brief (11-09-2026) goer
// support@getbirdly.co.uk til den primaere britiske adresse paa ALLE britiske
// sider, jura inklusive — og MARKEDER.GB.supportMail sagde det allerede.
// Substitutionen staar her frem for at blive rettet i teksten, saa
// sammenligningen mod kilden bliver ved med at vaere tegn for tegn: pakken er
// stadig sandhedskilden, og afvigelsen er een dokumenteret linje i stedet for
// atten usporede haandrettelser.
// ⚠️ UK-REPRAESENTANTEN: JONAS HAR BESLUTTET AT DER IKKE UDPEGES EN (11-09-2026).
// Pakken efterlod fire placeholders og en redaktoer-note ("DO NOT PUBLISH WITH
// PLACEHOLDERS") midt i en offentlig privatlivspolitik. De to ting der IKKE maa
// ske, er at opfinde en repraesentant og at lade som om spoergsmaalet ikke
// findes. Ordlyden herunder er derfor den sande, minimale: den siger at ingen
// er udpeget, og den PAASTAAR INGEN undtagelses-begrundelse — hvilken
// undtagelse der maatte gaelde, er UK-juristens kald foer launch, ikke vores.
//
// ⚠️ KONTAKT-AFSNITTETS "UK representative:"-linje fjernes HELT, ikke blot dens
// vaerdi. En etiket uden indhold er en lovet oplysning der mangler; §2 svarer nu
// paa spoergsmaalet direkte.
//
// ⚠️ STAAR HER OG IKKE SOM EN HAANDRETTELSE, af samme grund som de oevrige:
// pakken bliver ved med at vaere sandhedskilden, og afvigelsen er een
// dokumenteret beslutning man kan finde, i stedet for en stille tekstaendring.
const AFSNIT2_PAKKEN =
  "## 2. UK representative\n\n" +
  "Where Article 27 UK GDPR requires Birdly to appoint a representative in the UK, Birdly's representative is:\n\n" +
  "**[UK_REPRESENTATIVE_NAME]**  \n[UK_REPRESENTATIVE_ADDRESS]  \n[UK_REPRESENTATIVE_EMAIL]\n\n" +
  "**DO NOT PUBLISH WITH PLACEHOLDERS.** If specialist advice confirms an exemption, replace with reviewed wording.";
const AFSNIT2_NU =
  "## 2. UK representative\n\n" +
  "Birdly has not appointed a representative in the United Kingdom under Article 27 UK GDPR.\n\n" +
  "If you have a question about how Birdly handles your personal information, contact support@getbirdly.co.uk.";

const LAAST = [
  ["[UK_MONTHLY_PRICE]", "59"],
  ["[UK_ANNUAL_PRICE]", "590"],
  ["support@birdly.dk", "support@getbirdly.co.uk"],
  [AFSNIT2_PAKKEN, AFSNIT2_NU],
  ["\n\nUK representative: `[UK_REPRESENTATIVE_DETAILS]`", ""],
];

const STOP = "# IMPLEMENTATION NOTES FOR CLAUDE CODE";
let raa = readFileSync(sti, "utf8");
raa = raa.slice(0, raa.indexOf(STOP));
for (const [fra, til] of LAAST) raa = raa.split(fra).join(til);

// Normalisering: kun linjeskift-form og afsluttende blanktegn. Ordlyden
// sammenlignes tegn for tegn — ikke "cirka ens".
const norm = (s) => s.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim();
const KILDE = norm(raa);

let fejl = 0;
console.log(`JURA-TJEK mod ${sti}\n`);

for (const side of UK_JURA) {
  const krop = norm(side.md);
  if (KILDE.includes(krop)) {
    const aabne = side.aabne.length;
    console.log(
      `  ✓ ${side.rute.padEnd(28)} ${String(krop.length).padStart(6)} tegn` +
        (aabne ? `   ${aabne} uudfyldt(e): ${side.aabne.join(", ")}` : "")
    );
    continue;
  }
  // Find første afvigende tegn, så det er til at rette — ikke bare "afviger".
  let i = 0;
  const kandidat = KILDE.slice(KILDE.indexOf(krop.slice(0, 60)));
  while (i < krop.length && krop[i] === kandidat[i]) i++;
  console.log(`  ✖ ${side.rute.padEnd(28)} AFVIGER FRA PAKKEN ved tegn ${i}`);
  console.log(`      I KODEN : ${JSON.stringify(krop.slice(Math.max(0, i - 40), i + 60))}`);
  console.log(`      I PAKKEN: ${JSON.stringify(kandidat.slice(Math.max(0, i - 40), i + 60))}`);
  fejl++;
}

// ══ DAEKNING: HVERT DOKUMENT SKAL HAVE SIN PLADS PAA HUB'EN ══
//
// ⚠️ EN FORAELDRELOES JURASIDE ER VAERRE END EN DER MANGLER. Findes
// /uk/data-processing-agreement, men linker hverken hub eller footer til den,
// har vi et dokument der er "offentliggjort" og alligevel usynligt - og
// ingen opdager det, for siden svarer 200. Render-vagten ville vaere groen.
//
// Omvendt: et kort der peger paa en rute vi ikke har, er et doedt link i
// selve betingelses-oversigten.
console.log("\nHUB-DAEKNING");
const kort = hubKort();
const iHub = new Set(kort.map((k) => k.rute));
const dokumenter = UK_JURA.filter((s) => s.rute !== "/terms");

for (const d of dokumenter) {
  if (iHub.has(d.rute)) console.log(`  ✓ ${d.rute.padEnd(28)} har et kort`);
  else { console.log(`  ✖ ${d.rute.padEnd(28)} MANGLER paa hub'en - foraeldreloes side`); fejl++; }
}
for (const k of kort) {
  if (!k.rute) { console.log(`  ✖ kortet "${k.titel}" er ikke parret med en rute`); fejl++; continue; }
  if (!UK_JURA.some((s) => s.rute === k.rute)) {
    console.log(`  ✖ kortet "${k.titel}" peger paa ${k.rute} - den rute findes ikke`);
    fejl++;
  }
  if (!k.titel || !k.beskrivelse || !k.knap) {
    console.log(`  ✖ kortet ${k.rute} mangler titel/beskrivelse/knap`);
    fejl++;
  }
}
console.log(`  → ${kort.length} kort, ${dokumenter.length} dokumenter`);

const aabneIalt = UK_JURA.reduce((n, s) => n + s.aabne.length, 0);
console.log(
  fejl
    ? `\n✖ ${fejl} side(r) er ikke laengere ordret som i pakken.`
    : `\n✓ Alle ${UK_JURA.length} sider staar ordret som i pakken.` +
        `\n  ${aabneIalt} uudfyldte placeholder(e) tilbage — launch-blokkere, se rapporten.`
);
process.exitCode = fejl ? 1 : 0;
