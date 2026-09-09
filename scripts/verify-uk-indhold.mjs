// ============================================================================
// RENDERER DE BRITISKE SIDER FAKTISK DEN TEKST DE HAR?
//
// ⚠️ DEN FINDES FORDI ALLE MINE ANDRE UK-BEVISER MÅLTE DET FORKERTE.
// De talte sektioner, tjekkede at der ikke stod danske tegn, og at CSS-reglerne
// var indlæst. Hver eneste af dem var grøn, mens telefon-mockuppen på
// getbirdly-forsiden stod HELT TOM: `Hero` sendte sin egen ordbogs-skive til
// `SmsTelefon`, som ventede `telefon`-skiven, så komponenten fandt ingen af
// sine nøgler. Ikke dansk. Ikke engelsk. Tom.
//
// Ingen af de gamle vagte kunne se det:
//   · sektions-tællingen  — sektionen VAR der, den var bare tom
//   · "ingen danske tegn" — tom tekst har ingen danske tegn
//   · styling-vagten      — CSS'en var indlæst, der var bare intet at style
//
// Jeg så det på et skærmbillede. Det er ikke en metode der skalerer.
//
// ⚠️ INVARIANTEN: EN SEKTION ER ENTEN HELT DER ELLER HELT VÆK.
// For hver blok i `en.js` gælder: rendrer siden NOGEN af blokkens strenge,
// skal den rendre DEM ALLE. En halvt udfyldt sektion er altid en fejl — enten
// mangler copy'en (og så skal sektionen udelade sig selv, som huset kræver),
// eller også er der en nøgle der ikke bliver læst.
//
//   node scripts/verify-uk-indhold.mjs <base-url>
//
// Exit 0 = ingen halvt udfyldte sektioner.
// ============================================================================
import { en } from "../lib/tekster/en.js";

const BASE = (process.argv[2] || "").replace(/\/+$/, "");
if (!BASE) {
  console.error("brug: node scripts/verify-uk-indhold.mjs <base-url>");
  console.error("  fx  node scripts/verify-uk-indhold.mjs https://www.birdly.dk");
  process.exit(2);
}

// ⚠️ HVER UNDTAGELSE HAR EN GRUND. En blok her er en blok vagten ikke ser på.
const SPRINGES_OVER = new Map([
  ["meta", "Kun i <head> som og:/twitter:-tags, ikke i sidens tekst. Daekkes af " +
           "det direkte meta-tjek i rapporten."],
  ["cta", "Knappernes tekst gaar gennem Cta og staar i markup'en, men de to " +
          "strenge er ogsaa en delmaengde af andre blokke; en egen regel ville " +
          "kun give stoej."],
]);

// ⚠️ ENKELTE STRENGE STAAR MED VILJE IKKE I SIDENS TEKST.
// Listen er per STRENG, ikke per blok - saa resten af blokken stadig maales.
// En blok-undtagelse ville slukke for hele sektionen; det er praecis den
// bagdoer den her vagt blev bygget for at lukke.
const IKKE_I_TEKSTEN = new Map([
  ["Examples of the work we find",
   "aria-label paa chip-listen. Den staar i markup'en som ATTRIBUT, ikke som " +
   "tekst - en skaermlaeser hoerer den, en laeser ser den ikke."],
  ["Show fewer questions",
   "FAQ-foldeknappens ANDEN tilstand. Den findes foerst i DOM'en efter et " +
   "klik; ved foerste visning staar der 'See all questions (N more)'."],
  ["#hvordan", "Anker-ADRESSE, ikke tekst. Den staar i href-attributten."],
  ["#problem", "Anker-adresse. Samme grund."],
  ["£0 today · 14 days free · No long-term lock-in",
   "Hoerer til BETALINGS-trinnet, ikke foerste skaerm. DK viser en trust-raekke " +
   "paa foerste skaerm (st-pre-trust); UK's tilsvarende er ikke bygget endnu - " +
   "flagget til Jonas, ikke skjult her."],
]);

// Strenge der er for korte eller for almindelige til at kunne slaas op
// meningsfuldt (de ville matche tilfaeldigt et sted paa siden).
const forKort = (v) => typeof v !== "string" || v.trim().length < 8;

const afkod = (s) =>
  s
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&amp;|&#38;/g, "&")
    .replace(/&nbsp;|&#160;| /g, " ")
    .replace(/&middot;/g, "·")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"');

const norm = (s) => afkod(s).replace(/\s+/g, " ");

// ⚠️ DEN SAMMENLIGNER RENDERET TEKST, IKKE RAA HTML - OG DET ER EN RETTELSE.
// Foerste udgave soegte i HTML-kilden. Det virkede paa salgssiden, hvor hver
// saetning ligger i eet element, men faldt paa funnelen: dér er en saetning
// delt af <span>, <br/> og React's <!-- -->, saa strengen findes aldrig som
// sammenhaengende tekst i kilden. Vagten meldte fire manglende strenge der
// stod paa skaermen - og en vagt der raaber falsk alarm, bliver slaaet fra
// lige saa hurtigt som en der sover.
//
// <script> og <style> fjernes FOERST: RSC-stroemmen indeholder de samme
// saetninger som JSON, og de ville faa vagten til at godkende tekst der
// aldrig blev vist.
const tekstAf = (html) =>
  norm(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );

// ⚠️ TO SIDER, TO REGLER — OG DET ER IKKE EN SLÆKKELSE.
//
// Salgssiden er statisk: hver sektion rendres færdig i ét hug, og så gælder
// alt-eller-intet. Funnelen er et FLERTRINS-FORLØB — fejlbeskeder, trin 2 og 3
// og kvitteringen findes først efter at nogen har klikket. At kræve dem på
// første visning ville være at kræve noget forkert, og en vagt der kræver
// noget forkert, bliver slået fra.
//
// Funnelen tjekkes derfor på det der SKAL stå ved første visning. Det fanger
// stadig præcis den fejl der blev fundet på telefonen: en side der rendrer sin
// ramme uden sit indhold.
const SIDER = [
  { sti: "/uk", regel: "alt-eller-intet",
    blokke: ["hero", "bevis", "trust", "telefon", "problemet", "motoren", "vaerdi",
             "offentlige", "overgang", "portal", "slut", "loesningen", "sms",
             "koster", "regnestykket", "priser", "risiko", "faq",
             "nav", "footer"] },
  { sti: "/uk/start", regel: "skal-findes",
    skal: [
      en.funnel?.eyebrow,
      en.funnel?.overskrift,
      en.funnel?.under,
      en.funnel?.cta,
      en.funnel?.trust,
    ].filter(Boolean) },
];

let fejl = 0;
for (const side of SIDER) {
  const { sti } = side;
  const svar = await fetch(BASE + sti, { redirect: "follow" });
  const html = tekstAf(await svar.text());
  console.log(`\n${sti}  (HTTP ${svar.status}, ${html.length} tegn)`);
  if (svar.status !== 200) { console.log("  ✖ siden svarer ikke 200"); fejl++; continue; }

  if (side.regel === "skal-findes") {
    const skal = side.skal.filter((v) => !IKKE_I_TEKSTEN.has(v));
    const mangler = skal.filter((v) => !html.includes(norm(v)));
    if (mangler.length === 0) {
      console.log(`  ✓ foerste visning  ${skal.length}/${skal.length}`);
    } else {
      console.log(`  ✖ foerste visning  ${skal.length - mangler.length}/${skal.length}`);
      for (const m of mangler) console.log(`        mangler: ${JSON.stringify(m.slice(0, 90))}`);
      fejl++;
    }
    continue;
  }

  for (const navn of side.blokke) {
    if (SPRINGES_OVER.has(navn)) continue;
    const blok = en[navn];
    if (blok === undefined) continue;

    const strenge = [];
    (function gaa(o) {
      if (typeof o === "string") { if (!forKort(o)) strenge.push(o); return; }
      if (Array.isArray(o)) return o.forEach(gaa);
      if (o && typeof o === "object") return Object.values(o).forEach(gaa);
    })(blok);
    const maalte = strenge.filter((v) => !IKKE_I_TEKSTEN.has(v));
    if (maalte.length === 0) continue;

    const fundet = maalte.filter((v) => html.includes(norm(v)));
    const mangler = maalte.filter((v) => !html.includes(norm(v)));

    if (fundet.length === 0) {
      // Sektionen udelader sig selv - det er husets regel, ikke en fejl.
      console.log(`  · ${navn.padEnd(14)} ikke paa siden (${maalte.length} strenge) - sektionen udelader sig selv`);
      continue;
    }
    if (mangler.length === 0) {
      console.log(`  ✓ ${navn.padEnd(14)} ${fundet.length}/${maalte.length}`);
      continue;
    }
    console.log(`  ✖ ${navn.padEnd(14)} ${fundet.length}/${maalte.length} - HALVT UDFYLDT`);
    for (const m of mangler.slice(0, 6)) console.log(`        mangler: ${JSON.stringify(m.slice(0, 90))}`);
    if (mangler.length > 6) console.log(`        ... og ${mangler.length - 6} mere`);
    fejl++;
  }
}

console.log(fejl ? `\n✖ ${fejl} blok(ke) er halvt udfyldt.` : "\n✓ Ingen halvt udfyldte sektioner.");
process.exitCode = fejl ? 1 : 0;
