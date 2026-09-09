// ============================================================================
// STÅR HVER ENGELSK STRENG FAKTISK I COPY-FILEN?
//
// ⚠️ DEN FINDES FORDI "VERBATIM" ELLERS ER ET LØFTE, IKKE EN EGENSKAB.
// `en.js` skal være ordret fra BIRDLY_UK_FULL_SITE_COPY_EN_GB_2026-09-08.md.
// Copy-filen siger det selv: "A normal British business talking to another
// normal British business" — ikke et dansk site oversat til korrekt engelsk.
// Men ingenting HINDRER nogen i at skrive en sætning der bare lyder rigtig, og
// forskellen kan man ikke se i en kodegennemgang. Den her vagt kan.
//
//   node scripts/verify-uk-copy.mjs [sti/til/copy-filen.md]
//
// Uden argument ledes der efter filen i ~/Downloads og i repo-roden.
//
// ⚠️ DEN SAMMENLIGNER PÅ NORMALISERET TEKST, ikke byte for byte. Copy-filen er
// markdown: den samme sætning står med **fed**, som "# overskrift" og delt over
// to linjer. Det er formatering, ikke ordlyd. Vi normaliserer markdown-støj og
// blanktegn væk i BEGGE ender og sammenligner ordene. Alt andet ville melde
// fejl på en stjerne.
//
// ⚠️ NOGLE STRENGE ER MED VILJE IKKE I COPY-FILEN. De står i UNDTAGET nedenfor,
// hver med en grund. En udokumenteret undtagelse er en bagdør.
//
// Exit 0 = hver engelsk streng kan findes i copy-filen.
// ============================================================================
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const KANDIDATER = [
  process.argv[2],
  join(homedir(), "Downloads", "BIRDLY_UK_FULL_SITE_COPY_EN_GB_2026-09-08.md"),
  "BIRDLY_UK_FULL_SITE_COPY_EN_GB_2026-09-08.md",
].filter(Boolean);

const sti = KANDIDATER.find((s) => existsSync(s));
if (!sti) {
  console.error("✖ Copy-filen blev ikke fundet. Proevede:");
  for (const k of KANDIDATER) console.error("   " + k);
  console.error("  Giv stien som argument: node scripts/verify-uk-copy.mjs <fil.md>");
  process.exit(2);
}

// ⚠️ NORMALISERINGEN SKAL VÆRE DEN SAMME I BEGGE ENDER, ellers sammenligner vi
// to forskellige ting. Typografiske tegn foldes til deres almindelige
// modstykker, fordi markdown og JS-strenge ikke altid bruger de samme.
const norm = (s) =>
  String(s)
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/ /g, " ")
    .replace(/[*_#>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const KILDE = norm(readFileSync(sti, "utf8"));

// ⚠️ HVER UNDTAGELSE HAR EN GRUND. Uden grunden er listen bare et sted at
// gemme det der ikke passede.
// ⚠️ COPY-FILEN ER IKKE DEN ENESTE GODKENDTE KILDE — MEN DEN ANDEN SKAL
// NAVNGIVES. Jonas skriver undertiden ordlyd direkte i en brief, og den er lige
// så godkendt som filen. Forskellen er at filen kan slås op af enhver, mens en
// brief kun findes i samtalen. Derfor står ordlyden HER med sin kilde, så den
// ikke bare forsvinder ind i koden som noget nogen "vist" har godkendt.
//
// ⚠️ DEN HER LISTE ER IKKE ET STED AT PARKERE TEKST MAN SELV HAR SKREVET.
// Står en streng her uden at Jonas har skrevet den ordret, er den smuglet ind.
const FRA_BRIEF = new Map([
  ["Don't have a company number?",
   "Jonas' brief 09-09-2026: 'under firmanummer-feltet en boks \"Don't have a " +
   "company number?\"'. Copy-filen §26 siger kun HVAD der skal ske (\"Do not force " +
   "Companies House registration. Provide a suitable alternate path\") - ikke hvad der skal staa."],
  ["Continue as a cleaning business",
   "Jonas' brief 09-09-2026: 'Erstat den med en simpel bekraeftelse (\"Continue as " +
   "a cleaning business\")'. Erstatter copy-filens trade-picker, som ikke giver " +
   "mening med eet fag."],
]);

const UNDTAGET = new Map([
  ["chipslabel", "Skjult aria-label, ikke synlig copy. Copy-filen lister kun chippene selv."],
  ["opdateret", "Feltnavn i live-striben; copy-filen skriver 'Last updated' som label uden kolon."],
  ["frekvenstal", "Faktum om motoren (cron 2x dagligt), ikke en saetning fra copy-filen."],
  ["frekvens", "Samme som frekvenstal."],
  ["nr", "Trinnumre 01/02/03 - tal, ikke ordlyd."],
]);

const { en } = await import("../lib/tekster/en.js").catch(() => import("./lib/tekster/en.js"));

const fladt = [];
(function gaa(o, sti) {
  if (typeof o === "string") return fladt.push([sti, o]);
  if (Array.isArray(o)) return o.forEach((v, i) => gaa(v, `${sti}[${i}]`));
  if (o && typeof o === "object") return Object.entries(o).forEach(([k, v]) => gaa(v, sti ? `${sti}.${k}` : k));
})(en, "");

let fejl = 0, ok = 0, sprunget = 0, fraBrief = 0;
for (const [noegle, vaerdi] of fladt) {
  const sidste = noegle.split(".").pop().replace(/\[\d+\]$/, "").toLowerCase();
  if (UNDTAGET.has(sidste)) {
    sprunget++;
    continue;
  }
  if (KILDE.includes(norm(vaerdi))) {
    ok++;
    continue;
  }
  if (FRA_BRIEF.has(vaerdi)) {
    fraBrief++;
    continue;
  }
  fejl++;
  console.log(`✖ ${noegle}`);
  console.log(`    ikke fundet i copy-filen: ${JSON.stringify(vaerdi)}`);
}

console.log(`\ncopy-fil: ${sti}`);
console.log(`strenge: ${fladt.length}   i copy-filen: ${ok}   fra brief: ${fraBrief}   undtaget: ${sprunget}   MANGLER: ${fejl}`);
for (const [t, kilde] of FRA_BRIEF) console.log(`  · fra brief: ${JSON.stringify(t)}
      ${kilde}`);
if (fejl) {
  console.error("\n✖ En eller flere engelske strenge staar ikke i copy-filen.");
  console.error("  Enten er den skrevet frit - og saa skal den slaas op i filen i stedet -");
  console.error("  eller ogsaa er den en bevidst undtagelse og hoerer til i UNDTAGET med en grund.");
  process.exit(1);
}
console.log("\n✓ Hver engelsk streng staar i copy-filen.");
