// ============================================================================
// ER DANMARK UAENDRET? (UK-udrulningen, Fase A)
//
// ⚠️ DEN SAMMENLIGNER RENDERET HTML, IKKE KODE. En kode-diff viser hvad jeg
// AENDREDE; denne viser hvad BRUGEREN faar. Da de danske strenge blev flyttet
// til ordbogslaget, var hele pointen at outputtet skulle vaere identisk - og
// det kan kun bevises paa outputtet.
//
// Sådan bruges den:
//   1. byg og start paa main, gem siderne i <mappe>/foer2
//   2. byg og start paa grenen, gem de samme sider i <mappe>/efter2
//   3. node scripts/verify-dk-uaendret.mjs <mappe>
//
// ⚠️ DEN FANGEDE TO AEGTE FEJL 08-09-2026, som ingen kode-laesning ville have
// set: en tavs ReferenceError der fik hele bevis-bjaelken til at forsvinde fra
// fire sider, og en aendret React-hydreringsmarkoer (<!-- -->) fordi to
// tekstnoder var blevet til een. Begge saa uskyldige ud i kildekoden.
//
// Exit 0 = hver side er byte-identisk naar bygge-stoej er normaliseret vaek.
// ============================================================================
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SC = process.argv[2];

// ⚠️ KUN BYGGE-STOEJ OG TID NORMALISERES. Build-ID og chunk-hashes er unikke
// pr. byg, og live-stribens tidsstempel er hentetidspunktet. Alt andet skal
// vaere identisk - normaliserer man mere, beviser diffen mindre.
const norm = (s) =>
  s
    .replace(/\\"b\\":\\"[A-Za-z0-9_-]{15,}\\"/g, "BUILDID")
    .replace(/\/_next\/static\/chunks\/[A-Za-z0-9_.-]+/g, "CHUNK")
    .replace(/\/_next\/static\/[A-Za-z0-9_-]{15,}\//g, "/_next/static/BUILD/")
    // ⚠️ KUN SELVE TIDSSTEMPLET, ikke "alt efter ordet opdateret". Foerste
    // udgave var graadig og aad forskellige maengder tekst i de to filer - saa
    // meldte den forskel hvor der ingen var. En normaliser der er for bred,
    // skjuler ikke stoej; den skaber den.
    .replace(/<p class="sg-bevis-opd">[^<]*<\/p>/g, "TIDSSTEMPEL")
    .replace(/opdateret\\":\\"[^\\]*/g, "TIDSSTEMPEL");

let ens = 0, afvig = 0;
for (const f of readdirSync(join(SC, "foer2"))) {
  const a = norm(readFileSync(join(SC, "foer2", f), "utf8"));
  const b = norm(readFileSync(join(SC, "efter2", f), "utf8"));
  const n = f.replace(".html", "").padEnd(22);
  if (a === b) { console.log("  ✓ " + n + "identisk"); ens++; continue; }
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  console.log("  ✖ " + n + "AFVIGER ved tegn " + i);
  console.log("      FOER : " + JSON.stringify(a.slice(Math.max(0, i - 50), i + 80)));
  console.log("      EFTER: " + JSON.stringify(b.slice(Math.max(0, i - 50), i + 80)));
  afvig++;
}
console.log(`\nidentiske: ${ens}   afvigende: ${afvig}`);
process.exit(afvig ? 1 : 0);
