// ============================================================================
// FANGER VAGTEN STADIG NOGET? — selvtest af verify-dk-uaendret.
//
// ⚠️ DEN FINDES FORDI JEG LOESNEDE EN NORMALISERING.
// Live-stribens tal er tidsafhaengige: to byg faa minutter fra hinanden gav
// 401 mod 397 i "opgaver med aaben frist", fordi FIRE danske frister udloeb
// kl. 08:00 UTC imellem dem. Tallene blev derfor blanket i normaliseringen.
//
// Men hver gang man loesner en vagt, flytter man graensen mellem "stoej" og
// "aendring" - og man kan komme til at flytte den for langt. En vagt der ikke
// laengere kan fejle, er ikke en vagt. Den her fil beviser at graensen sidder
// rigtigt: den LAVER fem aegte aendringer og kraever at hver enkelt opdages.
//
// Proeve 1 er ikke tilfaeldig: at bevis-bjaelken forsvinder tavst fra danske
// sider er praecis den fejl der SKETE 08-09-2026, og som vagten blev bygget
// for at fange.
//
//   node scripts/verify-dk-uaendret-selvtest.mjs <mappe med foer2/forside.html>
//
// Exit 0 = hver aegte aendring blev opdaget.
// ============================================================================
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const KILDE = process.argv[2];
if (!KILDE) {
  console.error("brug: node scripts/verify-dk-uaendret-selvtest.mjs <mappe>");
  console.error("  mappen skal indeholde foer2/forside.html fra en render-dk-koersel.");
  process.exit(2);
}
const HER = dirname(fileURLToPath(import.meta.url));
const VAGT = resolve(HER, "verify-dk-uaendret.mjs");
const T = resolve(KILDE, "_selvtest");

const proever = [
  ["bevis-bjaelken FORSVINDER helt (fejlen fra 08-09-2026)",
   (s) => s.replace(/<section class="sg-bevis">[\s\S]*?<\/section>/, "")],
  ["EET bevis-kort fjernes",
   (s) => s.replace(/<div class="sg-bevis-kort">[\s\S]*?<\/div>\s*<\/div>/, "")],
  ["en ETIKET aendres (opgaver med aaben frist -> noget andet)",
   (s) => s.replace("opgaver med åben frist", "opgaver med aaben frist")],
  ["en SALGSSAETNING aendres",
   (s) => s.replace("Birdly arbejder allerede", "Birdly arbejder maaske")],
  ["et PRISTAL aendres (maa ALDRIG normaliseres vaek)",
   (s) => s.replace(/499/g, "599")],

  // ⚠️ HVER GANG NORMALISERINGEN LØSNES, SKAL DEN HER LISTE VOKSE.
  // 09-09-2026 blev to former mere blanket: live-tallene som React-props i
  // RSC-strømmen, og `/start`s egen `st-stat`-markup. De tre prøver herunder
  // findes fordi de former nu er usynlige for diffen — og så skal det bevises
  // at det kun er TALLENE der er usynlige, ikke teksten omkring dem.
  ["sg-tal: ETIKETTEN aendres (tallet er blanket, teksten er ikke)",
   (s) => s.replace("nye de seneste 7 dage", "nye de sidste 7 dage")],
  ["st-stat: ETIKETTEN aendres",
   (s) => s.replace("åbne opgaver lige nu", "aabne opgaver lige nu")],
  // "2×" staar i SAMME boks som live-tallene, men den er en KONSTANT.
  // Blankede vi den med, kunne "2×" blive til "3×" uden at nogen saa det.
  ["st-stat: KONSTANTEN 2x aendres (den er IKKE et live-tal)",
   (s) => s.replace("<b>2×</b>", "<b>3×</b>")],

  // ⚠️ 09-09-2026: RSC-STRØMMEN SAMMENLIGNES NU SOM INDHOLD, IKKE SOM
  // RÆKKEFØLGE. Next.js tildeler ikke raekke-id'er deterministisk mellem to
  // byg af samme kildekode - bevist med en kontrolproeve paa 9dc2ccd mod sig
  // selv. Det er den stoerste loesning vagten har faaet, og derfor de tre
  // proever herunder: de beviser at det KUN er nummereringen der er blevet
  // usynlig, ikke indholdet.
  //
  // En raekke-id-ombytning maa IKKE fange (det er stoejen vi tilgav), men alt
  // andet i stroemmen skal stadig give roedt.
  // ⚠️ NETOP DEN HER FORM VAR DEN AEGTE REGRESSION 09-09-2026: `marked="DK"`
  // blev sendt som prop til en klient-komponent og landede i stroemmen paa
  // hver eneste danske side. Proeven beviser at en prop-vaerdi i stroemmen
  // stadig giver roedt efter at nummereringen blev tilgivet.
  ["RSC: en PROP-VAERDI aendres (stroemmens indhold skal stadig sammenlignes)",
   (s) => s.replace('\\"marked\\":\\"DK\\"', '\\"marked\\":\\"GB\\"')],
  ["RSC: en KLIENT-REFERENCE forsvinder (en komponent er faldet ud)",
   (s) => s.replace(/\\n[0-9a-f]+:I\[\d+,\[[^\]]*\],\\"IconMark\\"\]/, "")],
  // ⚠️ HVER GANG EN NORMALISERING LOESNES, VOKSER LISTEN. 10-09-2026
  // blev bevis-stribens tidsstempel blanket i en fjerde form (RSC-stroemmens
  // to soeskende-noder). Proeven her beviser at det kun er TIDSPUNKTET der
  // blev usynligt - etiketten ved siden af sammenlignes stadig.
  ["RSC: 'Sidst opdateret'-ETIKETTEN aendres (tidspunktet er blanket, teksten er ikke)",
   (s) => s.replace(/Sidst opdateret /g, "Sidst opdat. ")],
  ["RSC: en TEKST i stroemmen aendres",
   (s) => s.replace('\\"Hvilke opgaver finder Birdly?\\"', '\\"Hvilke opgaver finder I?\\"')],
];

let fejl = 0;
for (const [navn, muter] of proever) {
  rmSync(T, { recursive: true, force: true });
  mkdirSync(`${T}/foer2`, { recursive: true });
  mkdirSync(`${T}/efter2`, { recursive: true });
  // ⚠️ MOD BEGGE SIDER. Forsiden bærer `sg-tal`, `/start` bærer `st-stat` —
  // en prøve der kun så på forsiden ville aldrig nå /start's egne former.
  let ramte = false;
  for (const side of ["forside", "start"]) {
    const raa = readFileSync(`${KILDE}/foer2/${side}.html`, "utf8");
    const aendret = muter(raa);
    cpSync(`${KILDE}/foer2/${side}.html`, `${T}/foer2/${side}.html`);
    writeFileSync(`${T}/efter2/${side}.html`, aendret, "utf8");
    if (aendret !== raa) ramte = true;
  }
  if (!ramte) { console.log(`  ? ${navn}\n      (proeven aendrede intet — moensteret findes ikke)`); continue; }

  let opdaget = false;
  try {
    execFileSync("node", [VAGT, T], { encoding: "utf8" });
  } catch { opdaget = true; }
  console.log(`  ${opdaget ? "✓" : "✖"} ${navn}${opdaget ? "" : "   <<< VAGTEN ER BLIND"}`);
  if (!opdaget) fejl++;
}
rmSync(T, { recursive: true, force: true });
console.log(fejl ? `\n✖ Vagten overser ${fejl} aegte aendring(er).` : "\n✓ Vagten fanger stadig hver aegte aendring.");
process.exitCode = fejl ? 1 : 0;
