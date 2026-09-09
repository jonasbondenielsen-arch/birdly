// ============================================================================
// ER UK-SIDERNES STYLING FAKTISK INDLÆST?
//
// ⚠️ DEN FINDES FORDI ALLE MINE ANDRE BEVISER MÅLTE INDHOLD.
// HTML-diff, curl, linjetælling, "ingen danske tegn" — hver eneste så på
// TEKST. `/uk` gik i luften uden `import "../salg.css"` og stod fuldstændig
// ustylet: chips som punktopstilling, telefon-mockuppen som løs tekst,
// overskriften løbet sammen. Ikke ét tegn af indholdet var forkert, så intet
// af mit apparat kunne se det. Jonas så det på et sekund.
//
// ⚠️ OG FØRSTE UDGAVE AF DEN HER VAGT VAR OGSÅ FORKERT — på to måder:
//   1. Den sammenlignede stylesheet-LISTER med DK og krævede en delmængde.
//      Men en dansk side har også sin EGEN side-CSS, som UK hverken har eller
//      skal have. Reglen gav falske fejl på en side der var helt i orden.
//   2. Kørt mod et SSO-beskyttet preview meldte den BESTÅET — fordi hver
//      forespørgsel blev sendt til Vercels login, og alle sider derfor så
//      "ens" ud. En vagt der består på en redirect er værre end ingen vagt.
//
// Derfor spørger den nu om det der faktisk betyder noget: FINDES REGLEN FOR
// DE KLASSER SIDEN BRUGER, i en af de stylesheets siden henter? Det er
// robust over for hash-navne, over for at CSS deles op, og over for at DK
// har sin egen ekstra CSS.
//
//   node scripts/verify-uk-styling.mjs http://127.0.0.1:3130
//
// Exit 0 = hver UK-side har reglerne for sine egne komponenter indlæst.
// Exit 2 = kunne ikke afgøre det (fx login-væg). IKKE det samme som bestået.
// ============================================================================

const BASE = (process.argv[2] || "").replace(/\/+$/, "");
if (!BASE) {
  console.error("brug: node scripts/verify-uk-styling.mjs <base-url>");
  process.exit(2);
}

// Side → klasser der SKAL have en regel et sted i sidens egen CSS.
// Valgt som de bærende elementer: er de ustylede, er siden brudt.
const KRAV = [
  ["/uk", [".sg-hero", ".sg-chips", ".sg-bevis", ".sg-kort"], "salgs-sektionerne"],
  ["/uk/start", [".st-wrap", ".st-kort", ".st-felt", ".st-omrk"], "funnelen"],
];

async function hentSide(sti) {
  const r = await fetch(`${BASE}${sti}`, { redirect: "follow" });
  const html = await r.text();
  // ⚠️ EN LOGIN-VÆG ER IKKE ET SVAR. Uden det her ville vagten bestå mod
  // ethvert beskyttet preview - se noten ovenfor.
  if (/vercel\.com\/sso-api|Authentication Required|_vercel_sso/i.test(html) || /sso/i.test(r.url)) {
    return { uafklaret: "siden er bag en login-vaeg (SSO) - kan ikke afgoeres" };
  }
  if (!r.ok) return { uafklaret: `HTTP ${r.status}` };
  return { html };
}

let fejl = 0, uafklaret = 0;
console.log(`UK-STYLING mod ${BASE}\n`);

for (const [sti, klasser, hvad] of KRAV) {
  const s = await hentSide(sti);
  if (s.uafklaret) {
    console.log(`  ? ${sti}  (${hvad})\n      ${s.uafklaret}`);
    uafklaret++;
    continue;
  }

  const cssStier = [...s.html.matchAll(/href="([^"]*\.css[^"]*)"/g)]
    .map((m) => m[1])
    .filter((f) => !/^https?:/.test(f));

  let alCss = "";
  for (const c of cssStier) {
    const r = await fetch(`${BASE}${c.startsWith("/") ? "" : "/"}${c}`);
    if (r.ok) alCss += await r.text();
  }

  const mangler = klasser.filter((k) => !alCss.includes(k));
  const ok = mangler.length === 0 && cssStier.length > 0;
  if (!ok) fejl++;
  console.log(`  ${ok ? "✓" : "✖"} ${sti}  (${hvad})`);
  console.log(`      ${cssStier.length} stylesheet(s), ${alCss.length} tegn CSS`);
  if (!ok) {
    console.log(`      ✖ INGEN REGEL FOR: ${mangler.join(" ")}`);
    console.log("        Klasserne bruges i markup'en, men der findes ingen styling for dem.");
    console.log("        Sandsynligvis en manglende `import \"...css\"` i ruten.");
    console.log("        ⚠️ Siden vil se HELT KORREKT ud i en HTML-diff.");
  }
}

console.log("");
if (uafklaret) {
  console.error(`? ${uafklaret} side(r) kunne ikke afgoeres. Det er IKKE det samme som bestaaet.`);
  process.exitCode = 2;
} else if (fejl) {
  console.error(`✖ ${fejl} UK-side(r) mangler styling. Siden RENDERER, men den ser forkert ud.`);
  process.exitCode = 1;
} else {
  console.log("✓ Hver UK-side har reglerne for sine egne komponenter indlaest.");
}
