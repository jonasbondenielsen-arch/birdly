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
// ⚠️ BEGGE SIDER SKAL VAERE RENDERET FRA ET FRISKT BYG. scripts/render-dk.mjs
// naegter at maale paa et foraeldet .next - se noten dér. Vagten var GROEN TRE
// GANGE PAA EN REGRESSION 09-09-2026, fordi serveren koerte et byg der var
// aeldre end kildefilerne.
//
// ⚠️ DEN FANGEDE TO AEGTE FEJL 08-09-2026, som ingen kode-laesning ville have
// set: en tavs ReferenceError der fik hele bevis-bjaelken til at forsvinde fra
// fire sider, og en aendret React-hydreringsmarkoer (<!-- -->) fordi to
// tekstnoder var blevet til een. Begge saa uskyldige ud i kildekoden.
//
// ════════════════════════════════════════════════════════════════════════════
// TO SAMMENLIGNINGER, IKKE EN — OG HVORFOR (09-09-2026)
//
// Siden bestaar af to ting: den HTML browseren viser, og RSC-strømmen
// (`self.__next_f.push(...)`) som React hydrerer med. De skal maales
// FORSKELLIGT, fordi kun den ene er deterministisk:
//
//   1. SYNLIG HTML  — sammenlignes BYTE FOR BYTE. Det er den brugeren ser.
//   2. RSC-STRØMMEN — sammenlignes som INDHOLD, ikke som raekkefoelge.
//
// Hvorfor punkt 2 er loesnet: Next.js tildeler hver raekke i stroemmen et
// hex-id, og tildelingen er IKKE stabil mellem to byg af SAMME kildekode.
// Maalt med en kontrolproeve: 9dc2ccd bygget paa ny, sammenlignet med den
// GEMTE render af 9dc2ccd, gav praecis samme "afvigelse" ved tegn 68934 -
// Next.js' egen IconMark og sidens modul havde byttet raekke-id. Samme sæt
// klient-referencer, samme indhold, anden nummerering.
//
// En vagt der melder forskel paa to identiske commits er ubrugelig: den vaenner
// een til at se roedt og gaa videre. Derfor sammenlignes stroemmens raekker som
// et MULTISÆT efter at id-praefikset er strippet.
//
// ⚠️ OG DET ER PRAECIS SAA MEGET DER ER LOESNET. Raekkernes INDHOLD
// sammenlignes uaendret - en aendret prop, en aendret tekst, en tilfoejet
// eller fjernet klient-komponent giver stadig roedt. Klient-referencernes
// saet sammenlignes desuden EKSPLICIT, saa en forsvundet komponent ikke kan
// gemme sig. scripts/verify-dk-uaendret-selvtest.mjs beviser begge dele.
//
// Exit 0 = synlig HTML byte-identisk OG stroemmens indhold identisk.
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
    .replace(/"b":"[A-Za-z0-9_-]{15,}"/g, "BUILDID")
    .replace(/\/_next\/static\/chunks\/[A-Za-z0-9_.-]+/g, "CHUNK")
    .replace(/\/_next\/static\/[A-Za-z0-9_-]{15,}\//g, "/_next/static/BUILD/")
    // ⚠️ VERCELS DEPLOYMENT-ID. Den findes KUN paa et deployet site, ikke i et
    // lokalt byg, og den er unik pr. deployment - noejagtig som Next's build-id
    // ovenfor. Uden den her kan vagten ikke maale mod PRODUKTION, og det er
    // netop dér beviset betyder mest: et lokalt byg beviser hvad koden goer,
    // produktionen beviser hvad kunden faar.
    // To former: `data-dpl-id="dpl_…"` paa <html> og `?dpl=dpl_…` paa aktiver.
    .replace(/ data-dpl-id="dpl_[A-Za-z0-9]+"/g, "")
    .replace(/\?dpl=dpl_[A-Za-z0-9]+/g, "")
    .replace(/\\"dpl_[A-Za-z0-9]+\\"/g, "DPL")
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
    // ⚠️ SAMME FELT, AFKODET FORM. RSC-stroemmen bliver JSON-afkodet foer den
    // sammenlignes, saa `\"opdateret\":\"…\"` staar dér som `"opdateret":"…"`.
    // Moensteret ovenfor ramte kun den escapede form i raa HTML, og
    // kontrolproeven (9dc2ccd mod sig selv) faldt derfor paa hentetidspunktet
    // - to byg to timer fra hinanden. Det er tid, ikke kode.
    .replace(/"(sidst_)?opdateret":"[^"]*"/g, "TIDSSTEMPEL")
    // ⚠️ LIVE-STRIBENS TAL ER TIDSAFHÆNGIGE — IKKE KODEAFHÆNGIGE.
    // Målt 09-09-2026: to byg få minutter fra hinanden gav 401 mod 397 i
    // "opgaver med åben frist". Ikke en ændring: FIRE danske frister udløb
    // kl. 08:00 UTC, og de to byg lå på hver sin side af det. Tallet tæller
    // `deadline > now()` og falder derfor af sig selv, hele dagen.
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
    //   HTML      <div class="sg-tal">401</div>              ← fanget fra starten
    //   RSC-props {"className":"sg-tal","children":"401"}    ← slap forbi
    //   /start    <div class="st-stat"><b>401</b>…           ← slap forbi
    //
    // ⚠️ KUN RENE CIFRE I st-stat. Samme boks rummer også "2×"
    // ("opdateres dagligt"), og DET er en konstant, ikke et live-tal. Ville vi
    // også blanke den, kunne "2×" blive til "3×" uden at nogen opdagede det.
    .replace(/\\"className\\":\\"sg-tal\\",\\"children\\":\\"\d+\\"/g, "LIVETAL")
    .replace(/"className":"sg-tal","children":"\d+"/g, "LIVETAL")
    .replace(/<div class="st-stat"><b>\d+<\/b>/g, "LIVETAL")
    .replace(/\\"(alle|bydbare|bydbare_aabne|nye_7_dage)\\":\d+/g, "LIVETAL")
    .replace(/"(alle|bydbare|bydbare_aabne|nye_7_dage)":\d+/g, "LIVETAL")
    // `seneste` er de tre nyeste udbuds titler og hentetidspunkter — de skifter
    // når motoren henter noget nyt, altså to gange dagligt.
    .replace(/\\"seneste\\":\[[\s\S]*?\]/g, "LIVESENESTE")
    .replace(/"seneste":\[[\s\S]*?\]/g, "LIVESENESTE");

// ── RSC-strømmen ud af HTML'en ───────────────────────────────────────────
// Hver push er et JSON-strengliteral; de skal samles og afkodes, fordi EN
// raekke godt kan vaere delt over to pushes. Det var netop dét der snoed en
// tidligere maaling: et regex der krævede raekkeskift og id i samme push,
// fandt kun de raekker der tilfaeldigvis laa samlet.
const PUSH = /<script>self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)<\/script>/g;

function del(html) {
  let stroem = "";
  const synlig = html.replace(PUSH, (_, lit) => {
    stroem += JSON.parse(lit);
    return "";
  });
  return { synlig, stroem };
}

// ⚠️ ID'ERNE OMDOEBES, DE BLANKES IKKE — OG FORSKELLEN ER HELE POINTEN.
//
// Raekkerne peger paa hinanden: "$L12" betyder "her staar raekke 12". Strippede
// vi bare praefikset, ville krydshenvisningerne stadig baere de ustabile id'er,
// og kontrolproeven ville stadig melde forskel. Blankede vi ALLE id'er til det
// samme tegn, kunne en raekke komme til at pege et andet sted hen uden at nogen
// saa det.
//
// I stedet faar hver raekke et KANONISK navn udledt af sit eget INDHOLD:
// raekkerne sorteres efter indhold (med id'erne midlertidigt blanket), og
// nummer 0, 1, 2 ... bliver det nye navn. To byg af samme kildekode giver
// dermed samme navne, mens en aendret raekke rykker sig i sorteringen og
// bliver synlig.
function kanonisk(stroem) {
  const raa = stroem.split("\n").filter((l) => l.length > 0);
  const delt = raa.map((l) => {
    const m = l.match(/^([0-9a-f]+):([\s\S]*)$/);
    return m ? { id: m[1], krop: m[2] } : { id: null, krop: l };
  });
  // Sorteringsnoegle: indholdet med alle id-henvisninger blanket, saa to byg
  // sorterer ens selv naar nummereringen er forskellig.
  const blank = (t) => norm(t).replace(/\$L?[0-9a-f]+/g, "$REF");
  const orden = delt
    .map((r, i) => ({ i, noegle: blank(r.krop) }))
    .sort((a, b) => (a.noegle < b.noegle ? -1 : a.noegle > b.noegle ? 1 : a.i - b.i));

  const navn = new Map();
  orden.forEach((o, plads) => {
    const id = delt[o.i].id;
    if (id !== null && !navn.has(id)) navn.set(id, `R${plads}`);
  });

  const omdoeb = (t) =>
    t.replace(/\$(L?)([0-9a-f]+)/g, (hel, L, id) => (navn.has(id) ? `$${L}${navn.get(id)}` : hel));

  return orden
    .map((o) => {
      const r = delt[o.i];
      return (r.id === null ? "" : `${navn.get(r.id)}:`) + omdoeb(norm(r.krop));
    })
    .join("\n");
}

// Klient-referencerne: modul + eksportnavn. De sammenlignes EKSPLICIT, saa en
// forsvundet eller tilfoejet klient-komponent ikke kan gemme sig i et multisæt.
function klientRef(stroem) {
  const ud = [];
  for (const l of stroem.split("\n")) {
    const m = l.match(/^[0-9a-f]+:I(\[.*)$/);
    if (!m) continue;
    try {
      const a = JSON.parse(m[1]);
      ud.push(`${a[0]}#${a[2] ?? "?"}`);
    } catch {
      ud.push(l.slice(0, 60));
    }
  }
  return ud.sort();
}

function visForskel(a, b, hvad) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  console.log(`      ${hvad} afviger ved tegn ${i}`);
  console.log("      FOER : " + JSON.stringify(a.slice(Math.max(0, i - 50), i + 80)));
  console.log("      EFTER: " + JSON.stringify(b.slice(Math.max(0, i - 50), i + 80)));
}

let ens = 0, afvig = 0;
for (const f of readdirSync(join(SC, "foer2"))) {
  const A = del(readFileSync(join(SC, "foer2", f), "utf8"));
  const B = del(readFileSync(join(SC, "efter2", f), "utf8"));
  const n = f.replace(".html", "").padEnd(22);

  const aSyn = norm(A.synlig), bSyn = norm(B.synlig);
  const aRef = klientRef(A.stroem).join("\n"), bRef = klientRef(B.stroem).join("\n");
  const aRk = kanonisk(A.stroem), bRk = kanonisk(B.stroem);

  const fejl = [];
  if (aSyn !== bSyn) fejl.push(["SYNLIG HTML", aSyn, bSyn]);
  if (aRef !== bRef) fejl.push(["KLIENT-REFERENCER", aRef, bRef]);
  if (aRk !== bRk) fejl.push(["RSC-INDHOLD", aRk, bRk]);

  if (fejl.length === 0) { console.log("  ✓ " + n + "identisk"); ens++; continue; }
  console.log("  ✖ " + n + "AFVIGER");
  for (const [hvad, a, b] of fejl) visForskel(a, b, hvad);
  afvig++;
}
console.log(`\nidentiske: ${ens}   afvigende: ${afvig}`);
process.exit(afvig ? 1 : 0);
