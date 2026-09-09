// ============================================================================
// RENDERER DE DANSKE SIDER TIL EN MAPPE — halvdelen af DK-beviset.
//
// `verify-dk-uaendret.mjs` SAMMENLIGNER to mapper; den fremstiller dem ikke.
// Det blev gjort i hånden 08-09-2026, og en manuel opskrift er ikke et bevis
// man kan gentage. Denne fil er den anden halvdel.
//
//   node scripts/render-dk.mjs <mappe>/foer2
//
// Forudsætter at `npm run build:kun` er kørt og at serveren kører på PORT
// (default 3101). Den starter ikke serveren selv — det gør kalderen, så en
// fejlet build ikke bliver til en tom mappe der ser ud som et bestået bevis.
//
// ⚠️ SIDERNE ER IKKE ET TILFÆLDIGT UDVALG. Det er hver DK-rute der rører
// enten `components/salg/Sektioner` eller `hentOpgaveTal` — altså præcis den
// flade ordbogslaget kan komme til at flytte. En side der ikke bruger nogen af
// delene, kan ikke ændre sig af det arbejde og ville kun give falsk tryghed.
//
// ⚠️ HVER SIDE HENTES TO GANGE, OG KUN DEN ANDEN GEMMES.
// Uden det gav vagten en FALSK ALARM på /kom-i-gang — målt 09-09-2026 ved at
// diffe main mod MAIN SELV: to uafhængige byg af præcis samme kode gav samme
// afvigelse, samme sted (tegn 40555), samme tekst. Altså ikke en ændring.
//
// Årsagen er RSC-flowets modul-preamble (`I[…]`-linjerne): den beskriver hvilke
// klientmoduler serveren har sendt, og den afhænger af hvad PROCESSEN allerede
// har sendt. Første render af en rute får én preamble, næste render af samme
// rute en anden — samme HTML til brugeren, andre bytes. `/tilmeld` er en
// permanent redirect til `/kom-i-gang` (next.config.mjs), så den rute blev
// hentet to gange i samme serverkørsel: én kold, én varm. Vi sammenlignede
// dermed kold mod varm og kaldte det en forskel.
//
// To rettelser, og begge er nødvendige:
//   1. `/tilmeld` er væk fra listen. Den er ikke en side, den er en redirect,
//      og den beviste kun `/kom-i-gang` en ekstra gang.
//   2. Alt hentes én gang FØR vi gemmer, så hver gemt side er en varm render.
// ============================================================================
import { mkdirSync, writeFileSync } from "node:fs";

const UD = process.argv[2];
if (!UD) {
  console.error("brug: node scripts/render-dk.mjs <mappe>");
  process.exit(2);
}
const PORT = process.env.PORT || 3101;

export const SIDER = [
  ["forside", "/"],
  ["hvorfor-birdly", "/hvorfor-birdly"],
  ["kom-i-gang", "/kom-i-gang"],
  ["priser", "/priser"],
  ["sadan-virker-det", "/sadan-virker-det"],
  ["start", "/start"],
  ["brancher", "/brancher"],
  ["udbud-for-alle", "/udbud-for-alle"],
];

mkdirSync(UD, { recursive: true });

// Opvarmning: hver rute renderes én gang uden at blive gemt, så modul-
// registret er mættet inden vi måler. Se noten ovenfor.
for (const [, sti] of SIDER) {
  await fetch(`http://127.0.0.1:${PORT}${sti}`, { headers: { Host: "www.birdly.dk" } }).catch(() => {});
}

let fejl = 0;
for (const [navn, sti] of SIDER) {
  const r = await fetch(`http://127.0.0.1:${PORT}${sti}`, { headers: { Host: "www.birdly.dk" } });
  const html = await r.text();
  if (!r.ok) {
    console.error(`  ✖ ${sti} -> HTTP ${r.status}`);
    fejl++;
    continue;
  }
  // ⚠️ EN TOM ELLER FEJL-SIDE MAA IKKE GEMMES SOM ET BEVIS. To identiske
  // fejlsider ville faa diffen til at melde "identisk".
  if (html.length < 2000) {
    console.error(`  ✖ ${sti} -> kun ${html.length} tegn, ser ikke ud som en side`);
    fejl++;
    continue;
  }
  writeFileSync(`${UD}/${navn}.html`, html, "utf8");
  console.log(`  ✓ ${sti.padEnd(20)} ${String(html.length).padStart(7)} tegn`);
}

if (fejl) {
  console.error(`\n✖ ${fejl} side(r) kunne ikke renderes. Mappen er ubrugelig som bevis.`);
  process.exit(1);
}
console.log(`\n✓ ${SIDER.length} sider gemt i ${UD}`);
