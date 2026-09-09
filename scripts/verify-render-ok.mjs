// ============================================================================
// RENDERER HVER SIDE UDEN AT KASTE?
//
// ⚠️ DEN FINDES FORDI "BYTE-IDENTISK" IKKE BETYDER "VIRKER".
// 09-09-2026 kastede fire danske sider en server-fejl i produktion —
// "Cannot read properties of null (reading 'ctaPrimaer')" på /priser,
// /sadan-virker-det, /hvorfor-birdly og /kom-i-gang. `SalgFaq` læste
// `T.ctaPrimaer` hvor `T` var `ord`, og `ord` er `null` på dansk.
//
// Ingen af de stående vagte kunne se det:
//   · DK-diffen sammenlignede de sider den KUNNE hente — en side der
//     svarer 500 har ingen HTML at være uenig om
//   · UK-indholdsvagten ser kun på /uk
//   · styling-vagten henter to sider
//
// Det er det TREDJE hul i træk af samme slags, og de tre hænger sammen:
//   1. vagten målte et FORÆLDET build          (render-dk.mjs nægter nu)
//   2. vagten så en TOM sektion som grøn       (verify-uk-indhold.mjs)
//   3. vagten så en KASTENDE side som fraværende (den her fil)
// Hver gang har fejlen været usynlig for det vagten faktisk målte.
//
// ⚠️ EN SIDE DER CRASHER SKAL FÆLDE BEVISET. Derfor kræves tre ting af
// hver rute, ikke bare status:
//   · HTTP 200 (efter redirects)
//   · ingen Next-fejlside i kroppen
//   · et minimum af indhold — en fejlside er kort, og en tom side der
//     svarer 200 er stadig i stykker
//
//   node scripts/verify-render-ok.mjs <base-url>
//
// Exit 0 = hver rute svarer 200 med rigtigt indhold.
// ============================================================================

const BASE = (process.argv[2] || "").replace(/\/+$/, "");
if (!BASE) {
  console.error("brug: node scripts/verify-render-ok.mjs <base-url>");
  console.error("  fx  node scripts/verify-render-ok.mjs https://www.birdly.dk");
  process.exit(2);
}

// ⚠️ LISTEN ER SPRÆNGRADIUS, IKKE ET UDPLUK.
// Hver rute her deler mindst én af de komponenter der blev lagt om til
// ordbogslaget (Sektioner, Salgsside, Forside, Start, StartUk, BrancheSide).
// Røres en af dem, kan hver af de her sider gå i stykker — og fire af dem
// GJORDE det, uden at noget bevis fangede det.
//
// ⚠️ FAG-SIDERNE ER MED MED VILJE. components/BrancheSide.js importerer
// RisikoFjernet, ProblemPris, Loesningen, FagBevis og Vaerdi. Da ordbogen
// blev stubbet i et diagnostisk byg, var det netop /fag/… der faldt først.
// Tre stikprøver er nok: de tyve sider er den samme komponent med andre data.
const RUTER = [
  // ── DK, salgsfladen ──
  ["/", "forside (Forside.js)"],
  ["/priser", "Priser + SalgFaq"],
  ["/sadan-virker-det", "Motoren + SmsDemo + SalgFaq"],
  ["/hvorfor-birdly", "IkkePortal + Problemet + SalgFaq"],
  ["/kom-i-gang", "hele Salgsside"],
  ["/brancher", "brancheshelf"],
  ["/udbud-for-alle", "støtteside"],
  // ── DK, funnelen ──
  ["/start", "funnelen (Start.js)"],
  ["/tilmeld", "redirect ind i funnelen"],
  // ── DK, fag-siderne (BrancheSide) ──
  ["/fag/toemrer", "BrancheSide"],
  ["/fag/murer", "BrancheSide"],
  ["/fag/maler", "BrancheSide"],
  // ── UK ──
  ["/uk", "Salgsside marked=GB"],
  ["/uk/start", "StartUk"],
];

// ⚠️ FEJLFRASERNE SOEGES I DEN VISTE TEKST, IKKE I KILDEN.
// Foerste udgave scannede raa HTML og faldt paa ALLE fjorten ruter - ogsaa
// dem jeg lige havde set svare 200 med fuldt indhold. Frasen "This page
// could not be found" staar nemlig i RSC-stroemmen paa en hvilken som helst
// side, fordi 404-siden er en del af rute-trae'et. En vagt der raaber falsk
// alarm bliver slaaet fra lige saa hurtigt som en der sover - saa <script>
// fjernes foerst, og saa er frasen kun tilbage hvis den faktisk VISES.
const FEJLSPOR = [
  "Application error: a server-side exception has occurred",
  "This page could not be found",
  "500: Internal Server Error",
];

// En fejlside er kort. En rigtig side har en <main>, en <section> eller en
// <footer> — mindst ét af dem, plus et gulv på antal tegn.
const GULV = 5000;

let fejl = 0;
console.log(`RENDER-TJEK mod ${BASE}\n`);

for (const [sti, hvad] of RUTER) {
  let svar, html;
  try {
    svar = await fetch(BASE + sti, { redirect: "follow" });
    html = await svar.text();
  } catch (e) {
    console.log(`  ✖ ${sti.padEnd(20)} kunne ikke hentes: ${e.message}`);
    fejl++;
    continue;
  }

  const problemer = [];
  if (svar.status !== 200) problemer.push(`HTTP ${svar.status}`);
  const vist = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  for (const spor of FEJLSPOR) if (vist.includes(spor)) problemer.push(`fejlside: "${spor.slice(0, 40)}"`);
  if (html.length < GULV) problemer.push(`kun ${html.length} tegn (gulv ${GULV})`);
  if (!/<main|<section|<footer/i.test(html)) problemer.push("ingen <main>/<section>/<footer>");

  if (problemer.length === 0) {
    console.log(`  ✓ ${sti.padEnd(20)} ${String(html.length).padStart(7)} tegn   ${hvad}`);
    continue;
  }
  console.log(`  ✖ ${sti.padEnd(20)} ${hvad}`);
  for (const p of problemer) console.log(`        ${p}`);
  fejl++;
}

console.log(
  fejl
    ? `\n✖ ${fejl} rute(r) renderer ikke rent. Beviset er faldet.`
    : `\n✓ Alle ${RUTER.length} ruter svarer 200 med indhold.`
);
process.exitCode = fejl ? 1 : 0;
