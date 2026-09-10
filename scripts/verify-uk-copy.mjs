// ============================================================================
// STÅR HVER ENGELSK STRENG FAKTISK I COPY-FILEN?
//
// ⚠️ DEN FINDES FORDI "VERBATIM" ELLERS ER ET LØFTE, IKKE EN EGENSKAB.
// `en.js` skal være ordret fra BIRDLY_UK_FULL_SITE_COPY_EN_GB_2026-09-08.md.
// Copy-filen siger det selv: "A normal British business talking to another
// normal British business" — ikke et dansk site oversat til korrekt engelsk.
// Men ingenting HINDRER nogen i at skrive en sætning der bare lyder rigtig, og
// forskellen kan man ikke se i en kodegennemgang. Den her vagt kan.
//
//   node scripts/verify-uk-copy.mjs [sti/til/copy-filen.md]
//
// Uden argument ledes der efter filen i ~/Downloads og i repo-roden.
//
// ⚠️ DEN SAMMENLIGNER PÅ NORMALISERET TEKST, ikke byte for byte. Copy-filen er
// markdown: den samme sætning står med **fed**, som "# overskrift" og delt over
// to linjer. Det er formatering, ikke ordlyd. Vi normaliserer markdown-støj og
// blanktegn væk i BEGGE ender og sammenligner ordene. Alt andet ville melde
// fejl på en stjerne.
//
// ⚠️ NOGLE STRENGE ER MED VILJE IKKE I COPY-FILEN. De står i UNDTAGET nedenfor,
// hver med en grund. En udokumenteret undtagelse er en bagdør.
//
// Exit 0 = hver engelsk streng kan findes i copy-filen.
// ============================================================================
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const KANDIDATER = [
  process.argv[2],
  join(homedir(), "Downloads", "BIRDLY_UK_FULL_SITE_COPY_EN_GB_2026-09-08.md"),
  "BIRDLY_UK_FULL_SITE_COPY_EN_GB_2026-09-08.md",
].filter(Boolean);

const sti = KANDIDATER.find((s) => existsSync(s));
if (!sti) {
  console.error("✖ Copy-filen blev ikke fundet. Proevede:");
  for (const k of KANDIDATER) console.error("   " + k);
  console.error("  Giv stien som argument: node scripts/verify-uk-copy.mjs <fil.md>");
  process.exit(2);
}

// ⚠️ NORMALISERINGEN SKAL VÆRE DEN SAMME I BEGGE ENDER, ellers sammenligner vi
// to forskellige ting. Typografiske tegn foldes til deres almindelige
// modstykker, fordi markdown og JS-strenge ikke altid bruger de samme.
const norm = (s) =>
  String(s)
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/ /g, " ")
    .replace(/[*_#>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const KILDE = norm(readFileSync(sti, "utf8"));

// ⚠️ HVER UNDTAGELSE HAR EN GRUND. Uden grunden er listen bare et sted at
// gemme det der ikke passede.
// ⚠️ COPY-FILEN ER IKKE DEN ENESTE GODKENDTE KILDE — MEN DEN ANDEN SKAL
// NAVNGIVES. Jonas skriver undertiden ordlyd direkte i en brief, og den er lige
// så godkendt som filen. Forskellen er at filen kan slås op af enhver, mens en
// brief kun findes i samtalen. Derfor står ordlyden HER med sin kilde, så den
// ikke bare forsvinder ind i koden som noget nogen "vist" har godkendt.
//
// ⚠️ DEN HER LISTE ER IKKE ET STED AT PARKERE TEKST MAN SELV HAR SKREVET.
// Står en streng her uden at Jonas har skrevet den ordret, er den smuglet ind.
const FRA_BRIEF = new Map([
  ["Don't have a company number?",
   "Jonas' brief 09-09-2026: 'under firmanummer-feltet en boks \"Don't have a " +
   "company number?\"'. Copy-filen §26 siger kun HVAD der skal ske (\"Do not force " +
   "Companies House registration. Provide a suitable alternate path\") - ikke hvad der skal staa."],
  ["Continue as a cleaning business",
   "Jonas' brief 09-09-2026: 'Erstat den med en simpel bekraeftelse (\"Continue as " +
   "a cleaning business\")'. Erstatter copy-filens trade-picker, som ikke giver " +
   "mening med eet fag."],

  // ── Companies House-gatens tre svar. Jonas' brief 09-09-2026, punkt 1. ──
  // Asymmetrien er DK's: vi ved hvornaar formatet er forkert, vi ved hvornaar
  // nummeret ikke findes - og naar VI fejler, lukker vi igennem.
  ["That doesn't look like a UK company number. It's usually 8 digits (like 01234567), or two letters and six digits (like SC123456).",
   "Jonas' brief 09-09-2026, punkt 1: 'Ugyldigt format (klient-side, gaa ikke videre - bed om rettelse)'."],
  ["We couldn't find that company on Companies House. Double-check the number — or if you don't have a company number, carry on as a cleaning business.",
   "Jonas' brief 09-09-2026, punkt 1: 'Gyldigt format, ikke fundet paa CH (blokér nummer-stien, men tilbyd cleaning-vejen)'."],
  ["We couldn't check that just now — no problem, carry on.",
   "Jonas' brief 09-09-2026, punkt 1: 'Opslag fejler (CH-API-fejl) -> luk igennem (asymmetri som DK)'."],
  ["This company looks dissolved on Companies House. If you're still trading, carry on as a cleaning business.",
   "Jonas' brief 09-09-2026, punkt 2: 'Dissolved - rettet (min modsigelse fjernet). Ikke \"choose your trade\" " +
   "(picker'en er droppet). I stedet advar-men-tillad -> cleaning-vejen'."],

  // ── §26's supporting-linje MED Jonas' rettelse. ──
  ["Tell Birdly what you do. We'll look for relevant public and private work across the UK and send the right matches straight to your phone.",
   "Copy-filen §26's supporting-linje, med Jonas' rettelse 09-09-2026 punkt 3: " +
   "'\"across England\" -> \"across the UK\". Vores 12 regioner daekker Skotland/Wales/NI, " +
   "saa \"England\" alene er usandt.' Resten af saetningen er filens egen."],

  // ── FAQ'ens datakilde-svar MED Jonas' geografi-afklaring. ──
  // ⚠️ SAMME RETTELSE SOM §26's supporting-linje, og af samme grund. Filen
  // aabner svaret "For England, Birdly uses...". Jonas 09-09-2026: "brug 'the
  // UK', ikke 'England' ... Find a Tender daekker Skotland/Wales/NI". Lod vi
  // sidens EGEN kildeforklaring sige "For England", ville den modsige
  // funnelens "across the UK" tre klik vaek. Resten af svaret er filens eget,
  // ordret - ogsaa de to afsnit, der her er slaaet sammen til eet svar.
  ["For the UK, Birdly uses official public procurement data, with Find a Tender as the main central source for new Procurement Act notices. We can also use other official and buyer sources where needed. The tender documents and submission itself may sit on a separate e-tender portal, and Birdly links you back to the original source. The raw notices are public. Birdly's job is to do the watching, filtering and matching so you don't have to.",
   "Copy-filen §25's datakilde-svar, med Jonas' rettelse 09-09-2026: " +
   "'brug \"the UK\", ikke \"England\"'. Kun de tre foerste ord er aendret; " +
   "resten staar ordret i filen."],

  // ── §30's homepage-description MED samme geografi-rettelse. ──
  ["Birdly finds relevant public and private cleaning work across the UK and sends the right matches straight to your phone. 14 days free.",
   "Copy-filen §30's homepage-description, med Jonas' rettelse 09-09-2026: " +
   "'\"across England\" -> \"across the UK\"'. Bruges som og:description og " +
   "twitter:description paa /uk, saa et delt link ikke viser den arvede danske."],

  // ── Footerens juridiske firmalinje. ──
  // ⚠️ IKKE MARKETING - OG IKKE COPY-FILENS. Filen naegter bevidst at skrive
  // den: "Do not show the Danish CVR/address blindly as if it is a UK company
  // ... Confirm with legal/accounting advice before publication."
  // Ordlyden kommer fra Jonas' brief 09-09-2026 og fra jura-pakkens note 3,
  // ordret: den siger at Birdly DRIVES AF det danske selskab, og antyder
  // dermed netop ikke et britisk.
  ["Birdly is operated by Birdly.dk, CVR no. 35764283, Denmark.",
   "Jonas' brief 09-09-2026: 'Base-linje: \"Birdly is operated by Birdly.dk, " +
   "CVR no. 35764283, Denmark.\"' - identisk med jura-pakkens note 3."],

  // ── GBP-baandene. Jonas' brief 09-09-2026, punkt 4. ──
  // ⚠️ IKKE BARE ETIKETTER. Taersklerne bindes til max_amount i match-reglen,
  // praecis som DK's baand. Aendrer nogen et tal her, aendrer de hvad kunden
  // faar - ikke hvordan det staar skrevet.
  ["Under £25,000",
   "Jonas' brief 09-09-2026, punkt 4: 'Under £25,000 · £25,000-£100,000 · £100,000-£500,000 · £500,000+'."],
  ["£25,000–£100,000",
   "Jonas' brief 09-09-2026, punkt 4 - samme baand-liste."],
  ["£100,000–£500,000",
   "Jonas' brief 09-09-2026, punkt 4 - samme baand-liste."],
  ["£500,000+",
   "Jonas' brief 09-09-2026, punkt 4 - samme baand-liste."],
]);

const UNDTAGET = new Map([
  ["chipslabel", "Skjult aria-label, ikke synlig copy. Copy-filen lister kun chippene selv."],
  ["opdateret", "Feltnavn i live-striben; copy-filen skriver 'Last updated' som label uden kolon."],
  ["frekvenstal", "Faktum om motoren (cron 2x dagligt), ikke en saetning fra copy-filen."],
  ["frekvens", "Samme som frekvenstal."],
  ["nr", "Trinnumre 01/02/03 - tal, ikke ordlyd."],
  ["key", "Interne noegler (fx baand-id'er som 'u25k'), ikke synlig tekst. De maa " +
          "ALDRIG vises til en kunde - etiketten staar ved siden af i 'label'."],

  // ── FAQ'ens foldeknap. UI-chrome, ikke salgscopy. ──
  // ⚠️ GODKENDT AF JONAS 09-09-2026 som "funktionel UI ... bare naturligt
  // britisk engelsk". De staar her alligevel, saa det bliver ved med at vaere
  // synligt at de ikke kommer fra copy-filen. Copy-filen beskriver ikke at FAQ'en foldes - foldningen er
  // husets egen loesning (lib/faq.js: seks synlige, resten foldet men stadig i
  // HTML'en saa den kan crawles), og filen har derfor ingen ordlyd til knappen.
  // Alternativet var at vise alle fjorten spoergsmaal og lade FAQ'en blive
  // sidens hoejeste sektion - praecis det DK foldede sig ud af 06-09-2026.
  // Skal Jonas rette dem, er det tre strenge i en.js' faq-blok.
  ["mereprefix", "FAQ'ens foldeknap: 'See all questions'. UI-chrome, ikke copy - " +
                 "copy-filen beskriver ikke foldningen. Skrevet af CC, flagget til Jonas 09-09-2026."],
  ["meresuffix", "FAQ'ens foldeknap: ordet 'more' i '(8 more)'. Samme grund som mereprefix."],
  ["skjul", "FAQ'ens foldeknap i aaben tilstand: 'Show fewer questions'. Samme grund som mereprefix."],

  // ── Funnelens etape-indikator. ──
  // ⚠️ DE STAAR HER NETOP FORDI DE VILLE PASSERE VED ET TILFAELDE.
  // Vagten spoerger `KILDE.includes(...)`, og "company" og "work" staar
  // hundrede steder i copy-filen. De ville altsaa blive godkendt som
  // "fundet i filen" uden at filen nogensinde har foreslaaet dem som
  // etape-navne. En streng der bestaar ved et sammentraef, er ikke bevist.
  //
  // Godkendt af Jonas 09-09-2026 som funktionel UI (samme kategori som
  // FAQ-foldeknappen). Ordforraadet er filens eget - "Company" fra "Company
  // number"/"Company name", "Contracts" fra "What size of contracts" -
  // og "Start Birdly" er husets egen etape, ordret som DK's fjerde.
  // Vil Jonas have andre navne, er det tre strenge i en.js' funnel-blok.
  ["etaper", "Funnelens tre etape-navne (Company / Contracts / Start Birdly). " +
             "Copy-filen har ingen etape-navne; huset kraever navngivne etaper " +
             "frem for 'Step 3 of 6' (se noten i components/Start.js)."],
  ["etapeord", "Skjult skaermlaeser-label: ordet 'Stage' i 'Stage 2 of 3'. UI-chrome."],
  ["etapeaf", "Skjult skaermlaeser-label: ordet 'of'. UI-chrome."],

  // ── Nav- og footer-ankre. ──
  // Href'erne er ADRESSER (#hvordan, #priser), ikke tekst. De staar i
  // Sektioner.js som id'er og deles med DK; copy-filen har naturligvis ingen
  // URL'er. Etiketterne ved siden af ER fra filen (§27) og tjekkes normalt.
  ["href", "Anker-adresse (#hvordan, #priser, #problem, #faq), ikke synlig tekst."],
  ["jurahref", "Rute til jura-hub'en (/terms), ikke synlig tekst."],

  // ── Juraside-chrome. ──
  // ⚠️ DET ER IKKE JURA-TEKST. Selve juraen kommer ordret fra
  // jura-pakken via lib/uk/jura.js og tjekkes af scripts/verify-uk-jura.mjs.
  // De her fire strenge er sidens ramme - DRAFT-banner og en tilbage-linje -
  // og copy-filen daekker ikke juraside overhovedet.
  ["tilbage", "Juraside-navigation: 'All terms & policies'. Ramme, ikke jura."],
  ["draftitel", "DRAFT-bannerets overskrift. Ramme, ikke jura."],
  ["drafttitel", "DRAFT-bannerets overskrift. Ramme, ikke jura."],
  ["draftbrod", "DRAFT-bannerets forklaring. Ramme, ikke jura."],
  ["todolabel", "DRAFT-bannerets etiket foran de uudfyldte placeholders."],
  ["rapporter", "Jura-pakkens note 11: 'Add a visible Report a problem route'. " +
                "Notens egen ordlyd; selve indholdet er Private Job Terms §12."],
  ["rapporterhref", "Rute, ikke synlig tekst."],
  ["rapporterlink", "Navigation videre til de fulde Private Job Terms. Ramme, ikke jura."],

  // ── Cookie-bannerets knapper. ──
  // ⚠️ Copy-filen §29 skriver banner-teksten og de to link-navne, men om
  // knapperne kun: "Buttons should use standard UK consent wording" - en
  // instruks, ikke ordlyd. De seks strenge er derfor britisk standardsprog
  // skrevet af CC, samme kategori som FAQ-foldeknappen.
  ["tilpas", "Cookie-banner: 'Customise'. UI-chrome, se §29."],
  ["kunnoedvendige", "Cookie-banner: 'Necessary only'. UI-chrome."],
  ["accepteralle", "Cookie-banner: 'Accept all'. UI-chrome."],
  ["gem", "Cookie-banner: 'Save my choices'. UI-chrome."],
  ["altidaktiv", "Cookie-banner: ' · always on' ved den laaste kategori. UI-chrome."],
  ["regionlabel", "Skjult aria-label paa banneret. Ikke synlig copy."],
]);

const { en } = await import("../lib/tekster/en.js").catch(() => import("./lib/tekster/en.js"));

const fladt = [];
(function gaa(o, sti) {
  if (typeof o === "string") return fladt.push([sti, o]);
  if (Array.isArray(o)) return o.forEach((v, i) => gaa(v, `${sti}[${i}]`));
  if (o && typeof o === "object") return Object.entries(o).forEach(([k, v]) => gaa(v, sti ? `${sti}.${k}` : k));
})(en, "");

let fejl = 0, ok = 0, sprunget = 0, fraBrief = 0;
for (const [noegle, vaerdi] of fladt) {
  const sidste = noegle.split(".").pop().replace(/\[\d+\]$/, "").toLowerCase();
  if (UNDTAGET.has(sidste)) {
    sprunget++;
    continue;
  }
  if (KILDE.includes(norm(vaerdi))) {
    ok++;
    continue;
  }
  if (FRA_BRIEF.has(vaerdi)) {
    fraBrief++;
    continue;
  }
  fejl++;
  console.log(`✖ ${noegle}`);
  console.log(`    ikke fundet i copy-filen: ${JSON.stringify(vaerdi)}`);
}

console.log(`\ncopy-fil: ${sti}`);
console.log(`strenge: ${fladt.length}   i copy-filen: ${ok}   fra brief: ${fraBrief}   undtaget: ${sprunget}   MANGLER: ${fejl}`);
for (const [t, kilde] of FRA_BRIEF) console.log(`  · fra brief: ${JSON.stringify(t)}
      ${kilde}`);
if (fejl) {
  console.error("\n✖ En eller flere engelske strenge staar ikke i copy-filen.");
  console.error("  Enten er den skrevet frit - og saa skal den slaas op i filen i stedet -");
  console.error("  eller ogsaa er den en bevidst undtagelse og hoerer til i UNDTAGET med en grund.");
  process.exit(1);
}
console.log("\n✓ Hver engelsk streng staar i copy-filen.");
