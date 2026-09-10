// ============================================================================
// SIGER COOKIE-BANNERET DET SAMME SOM COOKIE-POLITIKKEN?
//
// ⚠️ DEN FINDES FORDI DE TO KAN SKRIDE FRA HINANDEN I TAVSHED.
// Banneret beskriver tre kategorier; cookie-politikkens §4 beskriver de samme
// med sin egen ordlyd. Teksten i banneret ER politikkens — kopieret derind, så
// den besøgende læser det samme uanset hvor hun klikker. Rettes §4 i pakken,
// skal banneret følge med, og INTET ANDET end den her vagt ville opdage det.
//
// ⚠️ DEN TJEKKER OGSÅ AT ID'ERNE MATCHER. Banneret slår kategoriteksten op på
// husets egne id'er (lib/samtykke.js). Rammer et opslag ved siden af, falder
// komponenten tilbage til DANSK — altså en dansk kategori midt i et engelsk
// banner. Det ville ingen anden vagt se: siden renderer fint, teksten er bare
// på det forkerte sprog.
//
//   node scripts/verify-uk-samtykke.mjs
// ============================================================================
import { KATEGORIER } from "../lib/samtykke.js";
import { SAMTYKKE_EN } from "../lib/uk/samtykkeTekst.js";
import { UK_JURA } from "../lib/uk/jura.js";

const politik = UK_JURA.find((s) => s.rute === "/cookie-policy");
if (!politik) {
  console.error("✖ /cookie-policy findes ikke i lib/uk/jura.js");
  process.exit(2);
}

let fejl = 0;
console.log("COOKIE-BANNER mod cookie-politikkens \u00a74\n");

for (const k of KATEGORIER) {
  const en = SAMTYKKE_EN.kategorier[k.id];
  if (!en) {
    console.log(`  \u2716 ${k.id.padEnd(14)} mangler engelsk tekst \u2014 banneret ville vise DANSK`);
    fejl++;
    continue;
  }
  const iPolitik = politik.md.includes(en.tekst);
  const navnIPolitik = politik.md.includes(`### ${en.navn}`);
  if (iPolitik && navnIPolitik) {
    console.log(`  \u2713 ${k.id.padEnd(14)} "${en.navn}" \u2014 ordret som i \u00a74`);
    continue;
  }
  console.log(`  \u2716 ${k.id.padEnd(14)} "${en.navn}" afviger fra cookie-politikken`);
  if (!navnIPolitik) console.log(`        politikken har ingen "### ${en.navn}"`);
  if (!iPolitik) console.log(`        beskrivelsen findes ikke i \u00a74: ${JSON.stringify(en.tekst.slice(0, 70))}`);
  fejl++;
}

console.log(
  fejl
    ? `\n\u2716 ${fejl} kategori(er) siger ikke det samme som politikken.`
    : `\n\u2713 Alle ${KATEGORIER.length} kategorier staar ordret som i cookie-politikkens \u00a74.`
);
process.exitCode = fejl ? 1 : 0;
