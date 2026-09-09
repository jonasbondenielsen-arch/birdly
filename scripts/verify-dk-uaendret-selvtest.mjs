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
];

let fejl = 0;
for (const [navn, muter] of proever) {
  rmSync(T, { recursive: true, force: true });
  mkdirSync(`${T}/foer2`, { recursive: true });
  mkdirSync(`${T}/efter2`, { recursive: true });
  cpSync(`${KILDE}/foer2/forside.html`, `${T}/foer2/forside.html`);
  const raa = readFileSync(`${KILDE}/foer2/forside.html`, "utf8");
  const aendret = muter(raa);
  if (aendret === raa) { console.log(`  ? ${navn}\n      (proeven aendrede intet - moensteret findes ikke i siden)`); continue; }
  writeFileSync(`${T}/efter2/forside.html`, aendret, "utf8");

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
