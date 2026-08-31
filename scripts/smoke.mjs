// ============================================================================
// SMOKE-TESTS — de tre kundevendte ruter der skal virke, hver gang.
//
// ⚠️ HVORFOR DE FINDES. 31-08-2026 laa samlesiden doed med HTTP 500 i 5 dage for
// 12 kunder, fordi en import manglede. Ingen opdagede det, fordi ingenting
// kiggede. Det her er den ting der kigger.
//
// ⚠️ DE KOERER PAA EN FAST FIXTUR (migration 0111), aldrig paa en rigtig kunde.
// Kontaktoplysningerne i fixturet er opdigtede - "TESTPERSON-IKKE-EKSISTERENDE"
// og "+4500000000" - netop saa PII-vagten kan lede efter dem uden at der er
// rigtig PII i CI-loggen.
//
// ⚠️ INGEN BROWSER. Samlesiden og /o/ server-renderes, saa deres indhold staar i
// HTML'en; teaser-gaten haandhaeves i edge-funktionen, saa den maales bedst
// direkte paa svaret. En Playwright-koersel ville tilfoeje minutter og en
// afhaengighed uden at maale noget, HTTP ikke allerede fanger her.
//
//   node scripts/smoke.mjs                       # mod produktion
//   BASE=http://localhost:3000 node scripts/smoke.mjs
// ============================================================================

const BASE = process.env.BASE || "https://www.birdly.dk";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fixturet fra migration 0111. Faste vaerdier - de maa aldrig blive dynamiske,
// for saa maaler testen ogsaa om fixturet blev fundet.
const LIST_TOKEN = "bd3b2c3a1d143fdbb1de3e0ee50ece13bdeb7891b9ece97b";
const SHARE_TOKEN = "7e57000000b1";
const TEASER_TOKEN = "7e57000000c1";
const FIKTIV_NAVN = "TESTPERSON-IKKE-EKSISTERENDE";
const FIKTIV_TLF = "+4500000000";
const FIKTIV_TLF_BAR = "4500000000";

let fejl = 0;
const ok = (navn) => console.log(`  OK    ${navn}`);
const fejlet = (navn, hvorfor) => { fejl++; console.log(`  FEJL  ${navn}\n        ${hvorfor}`); };

async function hent(sti) {
  const r = await fetch(`${BASE}${sti}`, { redirect: "manual" });
  return { status: r.status, html: await r.text().catch(() => "") };
}

async function fnKald(body) {
  if (!SUPABASE_URL || !ANON) return null;
  const r = await fetch(`${SUPABASE_URL}/functions/v1/privat-opgave`, {
    method: "POST",
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: r.status, tekst: await r.text().catch(() => "") };
}

console.log(`Smoke-test mod ${BASE}\n`);

// -------------------------------------------------------- 1. SAMLESIDEN
// Den fejl vi rent faktisk havde: 500 paa hele siden.
{
  const navn = "samlesiden svarer 200";
  const r = await hent(`/mine-opgaver/${LIST_TOKEN}`);
  if (r.status !== 200) fejlet(navn, `fik HTTP ${r.status}`);
  else ok(navn);

  // ⚠️ 200 ER IKKE NOK. En side der svarer 200 med et tomt overblik, ville
  // bestaa den foerste test og stadig vaere ubrugelig for kunden. Derfor
  // maales det at privat-opgave-kortet faktisk er tegnet.
  const navn2 = "privat-opgave-kortet rendrer";
  if (r.status !== 200) fejlet(navn2, "sprunget over - siden svarede ikke 200");
  else if (!r.html.includes("Privat opgave")) fejlet(navn2, 'HTML indeholder ikke "Privat opgave"');
  else ok(navn2);
}

// -------------------------------------------------------- 2. OPGAVESIDEN /o/
{
  const navn = "/o/[token] svarer 200";
  const r = await hent(`/o/${SHARE_TOKEN}`);
  if (r.status !== 200) fejlet(navn, `fik HTTP ${r.status}`); else ok(navn);
}

// -------------------------------------------------------- 3. TEASEREN /t/
{
  const navn = "/t/[token] svarer 200";
  const r = await hent(`/t/${TEASER_TOKEN}`);
  if (r.status !== 200) fejlet(navn, `fik HTTP ${r.status}`); else ok(navn);

  // ⚠️ PII-VAGTEN. Siden henter selv sit indhold, saa HTML'en alene beviser
  // ingenting - den er tom for data uanset hvad. Gaten haandhaeves i
  // edge-funktionen, og det er DER den skal maales.
  const navn2 = "teaser-svaret indeholder ingen PII";
  const svar = await fnKald({ action: "teaser", token: TEASER_TOKEN });
  if (!svar) {
    fejlet(navn2, "NEXT_PUBLIC_SUPABASE_URL/ANON_KEY mangler - vagten kunne ikke koere");
  } else {
    const laek = [];
    if (svar.tekst.includes(FIKTIV_NAVN)) laek.push("kontaktnavn");
    if (svar.tekst.includes(FIKTIV_TLF) || svar.tekst.includes(FIKTIV_TLF_BAR)) laek.push("telefonnummer");
    // Feltet maa slet ikke findes - ikke engang som null. Findes det, er der
    // en gren der kan komme til at fylde det ud.
    try {
      const d = JSON.parse(svar.tekst);
      if ("kontakt" in d) laek.push('feltet "kontakt" findes i svaret');
    } catch { /* uparsbart svar fanges af status-tjekket nedenfor */ }
    if (laek.length) fejlet(navn2, `LAEKKER: ${laek.join(", ")}`);
    else ok(navn2);
  }

  // Og at ruten overhovedet svarede fornuftigt.
  const navn3 = "teaser-ruten svarer med en opgave";
  if (!svar) fejlet(navn3, "kunne ikke kalde funktionen");
  else if (svar.status !== 200 || !svar.tekst.includes('"opgave"')) {
    fejlet(navn3, `status ${svar.status}, svar: ${svar.tekst.slice(0, 120)}`);
  } else ok(navn3);
}

// -------------------------------------------- 4. GATEN PAA DEN ALMINDELIGE SIDE
// ⚠️ FIXTURET HAR INGEN TAGET PLADS, saa /o/ skal svare uden kontakt. Skulle
// den en dag begynde at udlevere den alligevel, er det praecis den fejl der
// koster os en privatpersons telefonnummer.
{
  const navn = "/o/ udleverer ikke kontakt uden en taget plads";
  const svar = await fnKald({ action: "lead", token: SHARE_TOKEN });
  if (!svar) fejlet(navn, "kunne ikke kalde funktionen");
  else if (svar.tekst.includes(FIKTIV_TLF_BAR) || svar.tekst.includes(FIKTIV_NAVN)) {
    fejlet(navn, "LAEKKER kontaktoplysninger uden plads");
  } else ok(navn);
}

console.log(`\n${fejl === 0 ? "Alle tests bestod." : `${fejl} test(s) FEJLEDE.`}`);
process.exit(fejl === 0 ? 0 : 1);
