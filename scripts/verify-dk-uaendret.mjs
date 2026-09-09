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
    // ⚠️ `[\s\S]*?` OG IKKE `[^<]*` — OG DET ER EN RETTELSE, IKKE EN SMAGSSAG.
    // React indsætter en hydreringsmarkør `<!-- -->` mellem to nabo-tekstnoder,
    // og den står MIDT i det her element:
    //   <p class="sg-bevis-opd">Sidst opdateret <!-- -->9. sep. kl. 11:00</p>
    // `[^<]*` stopper ved det første `<`, så mønsteret matchede aldrig, og
    // tidsstemplet blev aldrig normaliseret. Det opdagedes først 09-09-2026,
    // da de to byg landede på hver sin side af en ingest-kørsel og fik hvert
    // sit klokkeslæt. Indtil da havde begge byg tilfældigvis SAMME tidsstempel,
    // så normaliseringen havde aldrig haft noget at lave — den så ud til at
    // virke, fordi den aldrig blev brugt.
    .replace(/<p class="sg-bevis-opd">[\s\S]*?<\/p>/g, "TIDSSTEMPEL")
    .replace(/opdateret\\":\\"[^\\]*/g, "TIDSSTEMPEL")
    // ⚠️ LIVE-STRIBENS TAL ER TIDSAFHÆNGIGE — IKKE KODEAFHÆNGIGE.
    // Målt 09-09-2026: to byg få minutter fra hinanden gav 401 mod 397 i
    // "opgaver med åben frist". Ikke en ændring: FIRE danske frister udløb
    // kl. 08:00 UTC, og de to byg lå på hver sin side af det. Tallet tæller
    // `deadline > now()` og falder derfor af sig selv, hele dagen.
    //
    // Tidsstemplet blev normaliseret fra starten af præcis samme grund. Tallene
    // kommer fra SAMME kald og er lige så tidsafhængige — de manglede bare.
    //
    // ⚠️ KUN TALLENE, ALDRIG STRUKTUREN. Kortene, etiketterne ("opgaver med
    // åben frist") og hele bjælkens markup sammenlignes uændret. Derfor fanger
    // vagten stadig den fejl den blev bygget for: at bevis-bjælken FORSVINDER
    // fra en dansk side, som den gjorde 08-09-2026. Et forsvundet kort er en
    // forsvundet `sg-bevis-kort`-div, ikke et ændret tal.
    //
    // ⚠️ EN BREDERE NORMALISERING VILLE VÆRE FARLIG. Blankede vi alle tal på
    // siden, ville vi også skjule priser og garanti-tal. Her rammes kun
    // `sg-tal` inde i bevis-bjælken og live-svarets egen payload.
    .replace(/<div class="sg-tal">[^<]*<\/div>/g, "LIVETAL")
    // ⚠️ SAMME TAL, TRE FORMER — OG JEG FANGEDE KUN ÉN.
    // Live-tallene står ikke kun som HTML. De står OGSÅ som React-props inde i
    // RSC-strømmen, og `/start` har sin helt egen markup til dem:
    //
    //   HTML      <div class="sg-tal">401</div>              ← fanget fra starten
    //   RSC-props {"className":"sg-tal","children":"401"}    ← slap forbi
    //   /start    <div class="st-stat"><b>401</b>…           ← slap forbi
    //
    // Opdaget 09-09-2026: fire sider afveg på 401 mod 400, fordi ÉN frist
    // udløb mellem de to byg. Det var ikke en ændring — det var uret.
    //
    // ⚠️ KUN RENE CIFRE I st-stat. Samme boks rummer også "2×"
    // ("opdateres dagligt"), og DET er en konstant, ikke et live-tal. Ville vi
    // også blanke den, kunne "2×" blive til "3×" uden at nogen opdagede det.
    .replace(/\\"className\\":\\"sg-tal\\",\\"children\\":\\"\d+\\"/g, "LIVETAL")
    .replace(/<div class="st-stat"><b>\d+<\/b>/g, "LIVETAL")
    .replace(/\\"(alle|bydbare|bydbare_aabne|nye_7_dage)\\":\d+/g, "LIVETAL")
    // `seneste` er de tre nyeste udbuds titler og hentetidspunkter — de skifter
    // når motoren henter noget nyt, altså to gange dagligt.
    .replace(/\\"seneste\\":\[[\s\S]*?\]/g, "LIVESENESTE");

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
