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
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { UK_JURA, hubKort, aabnePladsholdere } from "../lib/uk/jura.js";
import { TRIAL_DAYS, TRIAL_DAYS_FOER, PROEVE7_FRA_DATO_EN, VARSEL_DAGE } from "../lib/pakke.js";

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

// ⚠️ PRØVELÆNGDEN: 14 → 7 (Jonas, 14-09-2026).
//
// ⚠️ BYGGET AF lib/pakke.js, IKKE SKREVET AF. Erstatningsteksten herunder
// interpolerer TRIAL_DAYS og ikrafttrædelsesdatoen. Det betyder at vagten
// FEJLER hvis nogen sætter prøven til 5 dage i koden uden også at rette den
// britiske betingelsestekst — og det er den rigtige opførsel. En juridisk tekst
// må ikke følge en konstant af sig selv (så kunne et talskift ændre et løfte
// uden at nogen læste sætningen igen), men den må heller ikke stille og
// roligt komme til at sige noget andet end det vi opkræver efter. Vagten er
// stedet hvor de to tvinges til at mødes.
//
// ⚠️ OVERSKRIFTEN MISTER SIT TAL. Pakken skrev "## 2. 14-day free trial".
// En overskrift med et tal i skal rettes hver gang vilkåret ændrer sig, og
// bliver glemt; teksten under siger nu tallet — to gange, med dato.
//
// ⚠️ PAKKEFILEN SELV ER IKKE RETTET. Den er stadig sandhedskilden for alt
// andet, og afvigelsen står her som én dokumenteret beslutning. Skal pakken
// opdateres permanent, er det Jonas' kald sammen med UK-juristen.
const PROEVE_TC_PAKKEN =
  "### 3.3\nNew Customers receive a 14-day free trial, subject to the Subscription Terms.";
const PROEVE_TC_NU =
  `### 3.3\nNew Customers receive a ${TRIAL_DAYS}-day free trial, subject to the Subscription Terms.`;

// ⚠️ VARSLET: PAKKEN LOVER 3 DAGE OG EN SMS — BEGGE DELE ER USANDE NU.
// Betalingsvarslet blev 15-09-2026 flyttet til 2 dage foer proeveslut og gjort
// MAIL-ONLY (SMS'en fjernet fra reminder-stien). En jurapakke der lover en SMS
// vi ikke sender, er et loefte vi bryder hver gang. Substitutionen staar her,
// saa afvigelsen fra pakken er dokumenteret ET sted og vagten stadig beviser
// resten ordret. Tallet kommer fra VARSEL_DAGE, saa teksten ikke kan skride
// fra motoren igen.
const VARSEL_PAKKEN =
  "Birdly intends to send an email approximately 3 days before the trial becomes paid, and usually a text as well.";
const VARSEL_NU =
  `Birdly intends to send an email approximately ${VARSEL_DAGE} days before the trial becomes paid.`;

// ⚠️ KATEGORIEN "FUNCTIONAL" ER FJERNET (15-09-2026, Jonas).
// Pakken beskriver fire kategorier. Maalt 15-09: INGEN kode laeser
// maa("funktionel") - hverken paa DK eller GB - og der blev aldrig sat en
// funktionel cookie. En kategori man kan give eller naegte samtykke til, men
// som ikke findes, er en usandhed i et dokument hvis hele formaal er at vaere
// sandt. Den er fjernet fra banner OG politik paa begge markeder i samme
// aendring, saa de to ikke kan drive fra hinanden.
//
// ⚠️ "Analytics" BLEV STAAENDE - og det er en ANDEN sag. Dér ER der noget
// (birdly_funnel via ctaSporing); den er bare blevet gated bag samtykket
// samme dag. Se lib/ctaSporing.js.
const FUNKTIONEL_PAKKEN =
  "### Functional\nOptional preferences not strictly necessary.\n\n";
const FUNKTIONEL_NU = "";

const PROEVE_ST_PAKKEN =
  "## 2. 14-day free trial\n\n" +
  "New Customers receive a 14-day free trial beginning on sign-up. No Subscription fee is charged during the trial.\n\n" +
  "If you cancel before the trial ends:\n" +
  "- no Subscription fee is charged; and\n" +
  "- the Subscription ends when the 14-day trial expires.";
const PROEVE_ST_NU =
  "## 2. Free trial\n\n" +
  `New Customers receive a ${TRIAL_DAYS}-day free trial beginning on sign-up. No Subscription fee is charged during the trial.\n\n` +
  "If you cancel before the trial ends:\n" +
  "- no Subscription fee is charged; and\n" +
  "- the Subscription ends when the free trial expires.";

const LAAST = [
  ["[UK_MONTHLY_PRICE]", "59"],
  ["[UK_ANNUAL_PRICE]", "590"],
  ["support@birdly.dk", "support@getbirdly.co.uk"],
  [AFSNIT2_PAKKEN, AFSNIT2_NU],
  [PROEVE_TC_PAKKEN, PROEVE_TC_NU],
  [PROEVE_ST_PAKKEN, PROEVE_ST_NU],
  [FUNKTIONEL_PAKKEN, FUNKTIONEL_NU],

  // C · DPA'ens revisionsadgang: skriftligt/fjernadgang foerst, fysisk kun
  //     hvis det ikke raekker. Klausulen tillod i praksis et fysisk besoeg som
  //     foerste skridt, og det er ude af proportion for et enkeltmandsfirma.
  ["If insufficient, Customer may request an audit.",
   "If insufficient, Customer may request an audit. An audit is carried out by written response or remote access as the default. An on-site audit may take place only where that is not sufficient, and must be given reasonable notice, take place during normal business hours and be at the Customer's cost."],
  // F(a) · Politikken sagde kun "cookies". Maalt: de eneste egentlige cookies
  //        er Metas; alt vores eget ligger i browserens lokale lagring.
  ["Birdly uses cookies/similar technologies to make the site work, remember choices, understand performance where you consent, and measure/optimise marketing where you consent.",
   "Birdly uses cookies/similar technologies to make the site work, remember choices, understand performance where you consent, and measure/optimise marketing where you consent.\n\nThe rules are the same for cookies and for browser storage, and \"cookies\" below covers both. It is worth knowing that your cookie choice and your progress through sign-up are kept in browser storage rather than in a cookie, so clearing cookies alone does not clear them. The only true cookies Birdly sets are Meta's (`_fbp` and `_fbc`), and only after you accept Marketing."],
  // ══ DE 14 TILPASNINGER (Jonas 15-09-2026) ══
  // Pakken blev skrevet 08-09, foer disse beslutninger faldt. Hver afvigelse
  // staar her - EET sted - saa vagten stadig beviser at alt ANDET er ordret.
  // 3 · DK §8.4 har et loft paa 5.000 DKK. UK faar samme loft i GBP, rundet OP
  //      saa det britiske aldrig bliver lavere end det danske.
  ["subject to an overall maximum of the GBP equivalent of DKK 5,000 calculated at the exchange rate applicable on the date the claim arose.\n\n**Optional before launch:** replace with a fixed GBP cap if Jonas chooses one.",
   "subject to an overall maximum of £600."],
  // 13 · Matchgarantien har ingen beloebsgraense. Spoergsmaalet blev fjernet fra
  //      funnelen 14-09; max_amount er altid null for nye kunder.
  ["that falls within the criteria you selected, including the relevant trade/service, geography and contract-size criteria.",
   "that falls within the criteria you selected — your trade/service and your geography."],
  // 13 · ... og selve beloebsklausulen ud.
  ["### 4.4 — Contract-size condition\nThe Match Guarantee only applies if your contract-size settings meet the **minimum guarantee threshold clearly shown in Birdly during sign-up/settings**.\n\nIf you deliberately restrict your settings below that threshold, you may still use Birdly, but the Match Guarantee does not apply.\n\n",
   ""],
  // 6 · "Verify ..." var en instruks til skribenten, der stod som kundevendt tekst.
  ["| Resend | Transactional/system email | EU/US depending on service | Verify DPF/SCC/UK Addendum or other safeguard |",
   "| Resend | Transactional/system email | EU/US depending on service | UK Addendum to the EU SCCs, or another approved safeguard |"],
  // 4 · Regimet navngivet frem for omskrevet.
  ["For processing subject to UK GDPR, Birdly also complies with applicable UK data protection rules.",
   "For processing subject to UK GDPR, Birdly also complies with the UK GDPR and the Data Protection Act 2018."],
  // 10 · Sprogklausul. Fandtes ikke i pakken.
  ["### Severability\nIf part is held invalid/unenforceable, the rest continues.",
   "### Language\nThese Terms are provided in English. For UK Customers, the English version is the governing version.\n\n### Severability\nIf part is held invalid/unenforceable, the rest continues."],
  // ⚠️ BESPARELSEN: pakken sagde "If annual billing gives a stated saving, the
  // saving shown must match the actual prices" - en instruks til skribenten,
  // ikke en oplysning til kunden, og den stod som gaeldende betingelsestekst.
  // Tallene er pakkens egne: 59x12 = 708 mod 590 = 118 sparet.
  ["If annual billing gives a stated saving, the saving shown must match the actual prices.",
   "The annual plan is £590 + VAT where applicable, against £708 for twelve months paid monthly — a saving of £118. You pay for ten months and get twelve."],
  [VARSEL_PAKKEN, VARSEL_NU],
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
    // ⚠️ TAELLES PAA DET KUNDEN SER, IKKE PAA KILDEN (15-09-2026).
    // Kilden BEHOLDER sine pladsholdere med vilje, saa sammenligningen ovenfor
    // kan vaere ordret mod pakkefilen. Men "uudfyldte placeholders" skal
    // beskrive den FAERDIGE side - ellers melder vagten 21 launch-blokkere paa
    // sider hvor der ikke staar en eneste.
    const aabneListe = aabnePladsholdere(side.md);
    const aabne = aabneListe.length;
    console.log(
      `  ✓ ${side.rute.padEnd(28)} ${String(krop.length).padStart(6)} tegn` +
        (aabne ? `   ${aabne} uudfyldt(e): ${aabneListe.join(", ")}` : "")
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

// ══ DEN ELLEVTE SIDE: HUB'EN ══
//
// ⚠️ HUB'EN SLAP FORBI TO GANGE I SAMME RUNDE (15-09-2026). Først som ni kort
// mod otte, derefter som et DRAFT-banner der blev stående efter at alle 21
// pladsholdere var udfyldt — og hub'en er den side Clearhaus åbner først.
//
// ⚠️ ÅRSAGEN VAR DEN SAMME BEGGE GANGE: hub'en er ikke et DOKUMENT, så den
// faldt uden for enhver tælling der løb over UK_JURA's md-tekster. En vagt der
// måler ti sider på et sted med elleve, er grøn af den forkerte grund.
//
// ⚠️ DER MÅLES PÅ KILDEN, IKKE PÅ ET RENDERET SVAR. Et banner der er udkommenteret
// eller gated forkert, ville stadig kunne stå i HTML'en på en anden build. Her
// bevises at BEGGE steder spørger juraErDraft() — altså at hub og dokument ikke
// KAN komme til at sige hver sit.
{
  console.log("\nDEN ELLEVTE SIDE — HUB'EN");
  // ⚠️ SCANNER ALLE UK-FILER, IKKE EN HAANDHOLDT LISTE. Tre gange i samme
  // runde slap en side forbi, fordi taellingen loeb over UK_JURA eller over to
  // navngivne filer: hub'ens kort, hub'ens banner og til sidst
  // /report-a-problem. En vagt med en liste beskytter kun listen.
  const ukFiler = [];
  (function gaa(p) {
    for (const n of readdirSync(p)) {
      const sti = join(p, n);
      if (statSync(sti).isDirectory()) { gaa(sti); continue; }
      if (/\.jsx?$/.test(n)) ukFiler.push(sti);
    }
  })(fileURLToPath(new URL("../app/uk", import.meta.url)));
  (function gaa(p) {
    for (const n of readdirSync(p)) {
      const sti = join(p, n);
      if (statSync(sti).isDirectory()) { gaa(sti); continue; }
      if (/\.jsx?$/.test(n)) ukFiler.push(sti);
    }
  })(fileURLToPath(new URL("../components/uk", import.meta.url)));

  let medBanner = 0;
  for (const sti of ukFiler) {
    const kilde = readFileSync(sti, "utf8");
    if (!kilde.includes('className="uk-jura-draft"')) continue;
    medBanner++;
    const gated = /\{\s*\(?[^}]*(juraErDraft\(\)|side\.draft|antalAabne)[^}]*\)?\s*&&\s*\(/.test(kilde);
    const navn = sti.replace(/\\/g, "/").split("/").slice(-3).join("/");
    if (gated) console.log(`  ✓ ${navn}: banneret er gated paa jura-status`);
    else { console.log(`  ✖ ${navn}: DRAFT-banner UDEN gate - det ville staa uanset`); fejl++; }
  }
  console.log(`  → ${ukFiler.length} UK-filer scannet, ${medBanner} med banner`);

  // Kortene skal daekke hvert dokument, og hub'en selv er ikke et dokument.
  const dokumenter = UK_JURA.filter((x) => x.rute !== "/terms").length;
  const kort = hubKort().length;
  if (kort === dokumenter) console.log(`  ✓ hub'en har ${kort} kort til ${dokumenter} dokumenter`);
  else { console.log(`  ✖ hub'en har ${kort} kort til ${dokumenter} dokumenter`); fejl++; }
}

const aabneIalt = UK_JURA.reduce((n, s) => n + aabnePladsholdere(s.md).length, 0);
console.log(
  fejl
    ? `\n✖ ${fejl} side(r) er ikke laengere ordret som i pakken.`
    : `\n✓ Alle ${UK_JURA.length} sider staar ordret som i pakken.` +
        `\n  ${aabneIalt} uudfyldte placeholder(e) tilbage — launch-blokkere, se rapporten.`
);
process.exitCode = fejl ? 1 : 0;
