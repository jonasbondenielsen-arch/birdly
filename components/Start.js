"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "./Logo";
import { fetchCatalog, submitSignup, createSubscriptionSession } from "../lib/catalog";
import { hentKandidater, visResultat } from "../lib/kandidater";
import { PLAN, YEARLY_SAVING, planForInterval, priceText, TRIAL_DAYS } from "../lib/pakke";
import { sporEnGang } from "../lib/pixel";
// ⚠️ ATTRIBUTIONEN SENDES MED SIGNUP (06-09-2026, godkendt af Jonas).
// fangAttribution() har hele tiden kørt i <Maaling> på hver eneste side og lagt
// UTM'erne i sessionStorage — men KUN /opret-opgave (B2C) læste dem igen. Den
// betalende B2B-kunde blev derfor oprettet uden en eneste kampagne-oplysning, og
// spørgsmålet "hvilken annonce købte den her kunde" kunne ikke besvares i basen.
//
// ⚠️ REN TILFØJELSE. signup-funktionen har ALLEREDE taget imod feltet siden den
// blev skrevet (renseAttribution + ATTRIBUTION_NOEGLER i birdly-admin): den
// hvidlister nøglerne, klipper værdierne til 200 tegn og gemmer intet hvis
// objektet er tomt. Der er hverken rørt en gate, en pris eller en hændelse — kun
// et felt der lå ubrugt i den anden ende, som nu bliver udfyldt.
import { hentAttribution } from "../lib/attribution";
// ⚠️ VAERDI_ANKER er den GENERISKE sætning og bruges kun ét sted i funnelen:
// checkoutens højre kolonne. Skærm 7's anker er PERSONLIGT og regnes af kundens
// eget valg — se lib/vaerdiAnker.js. Byt dem aldrig om: den generiske sætning på
// skærm 7 ville smide den personalisering væk, der er hele pointen med skærmen.
import { GARANTI, GARANTI_LINK, VAERDI_ANKER } from "../lib/salgTekst";
import { sporFunnel } from "../lib/ctaSporing";
import { erLoebende, MAANEDSVAERDI, PROJEKTVAERDI, byggAnker, FORBEHOLD, BETINGET_LINJE } from "../lib/vaerdiAnker";
import OpgaveKort from "./salg/OpgaveKort";
import { daTal } from "../lib/opgaveTal";
// ⚠️ forside.css importeres IKKE. Den er nested under `.birdly-home`, så dens
// klasser virker alligevel ikke her — og importen ville kun sende hele forsidens
// CSS med i bundlen uden at gøre noget. start.css bærer det vi bruger.
import "../app/start.css";

// ============================================================================
// /start — den korte onboarding. Fire skærme, ét spørgsmål ad gangen.
//
// ⚠️ DEN GAMLE FUNNEL (/tilmeld) RØRES IKKE. Den bærer alle 14 SEO-links og er
// den eneste beviste vej til betaling. Denne kører ved siden af, så de to kan
// sammenlignes, og CTA'erne flyttes først når denne har vist sig bedre.
//
// ⚠️ INGEN NY SIGNUP. Trin 4 kalder den EKSISTERENDE `signup` Edge Function med
// samme payload-form som /tilmeld. Alle værn ligger dér og er den eneste
// flaskehals der ikke kan omgås: nul-dækning, dublet-CVR/telefon, min>max,
// betal-straks ved opbrugt prøve. Byg aldrig en genvej udenom.
//
// ⚠️ TALLET I TRIN 3 ER ÆGTE. Det kommer fra preview-kandidater, som bruger selve
// match-reglen. Er der 0 i kundens område, vises landstallet SOM landstal — aldrig
// som om det lå i hendes område. Se visResultat() i lib/kandidater.js.
// ============================================================================

// ⚠️ FEM TRIN, IKKE FIRE (02-08-2026). Arbejdsområderne og bredde-valget manglede
// helt: /start sendte fagets fulde kodesæt med `bredde: "alle"` hardkodet. Det gav
// et gyldigt kriterium — men det BREDEST mulige, uden nogen vej ud.
//
// Målt på entreprenør, hele landet:
//   alle områder + "alle"          11 koder → 79 opgaver
//   alle områder + "kun fag"       10 koder → 47
//   kun betonarbejder + "alle"      2 koder → 79   ← samme som at vælge alt
//   kun betonarbejder + "kun fag"   1 kode  →  2
//
// `bredde` er altså hele indsnævringen: med "alle" lægges fagets brede kode på, og
// den alene rammer 79. En betonspecialist fik præcis samme liste som en der laver
// alt — og ville systematisk ramme "for mange opgaver" i fravalgs-widgeten.
//
// Det er sit eget trin frem for at proppes ind i trin 2: et fag som entreprenør har
// 10 underområder, og de + fag + område + beløb på én mobilskærm er ikke ét
// spørgsmål ad gangen længere.
// ============================================================================
// FIRE SYNLIGE ETAPER — ni interne skærme.
//
// ⚠️ "TRIN 1 AF 5 · CVR" ER VÆK, OG DET ER IKKE KOSMETIK. Et tælleværk fortæller
// kunden hvor lang formularen er; en etape fortæller hende hvad hun er i gang
// med. Det første får en funnel til at ligne en blanket fra det offentlige, det
// andet får den til at ligne en opsætning hun er ved at gøre færdig.
//
// ⚠️ INTERNE SKÆRME VISES ALDRIG SOM TAL. Der er ni, og kunden skal ikke vide
// det. Tilføjes eller fjernes en skærm, ændres kun ETAPE-tabellen herunder.
const ETAPER = ["Virksomhed", "Opgaver", "Dine match", "Start Birdly"];

// Skærm → etape (1-indekseret skærm, 0-indekseret etape).
//   1 CVR + bekræftelse                      → Virksomhed
//   2 Hvordan finder I opgaver i dag         → Opgaver
//   3 Fag + arbejdsområder                   → Opgaver
//   4 Område                                 → Opgaver
//   5 Værdi-spørgsmål (fag-afhængigt)        → Opgaver
//   6 Birdly Scan + resultat                 → Dine match
//   7 Værdi-anker + opsummering + risiko     → Dine match
//   8 Plan + kontakt + samtykker             → Start Birdly
//   9 Betaling (kortvindue)                  → Start Birdly
const SKAERM_ETAPE = { 1: 0, 2: 1, 3: 1, 4: 1, 5: 1, 6: 2, 7: 2, 8: 3, 9: 3 };
const SIDSTE_SKAERM = 9;

// Samme SDK-indlæsning som /tilmeld. ⚠️ Bevidst duplikeret frem for at refaktorere
// den live betalingssti midt i en ny funnel: Tilmeld.js er den eneste kanal der
// tager imod penge i dag. Når /start er bevist, lægges de to sammen i én komponent
// — det er noteret som opfølgning, ikke glemt.
function loadReepay() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if (window.Reepay) return resolve(window.Reepay);
    const existing = document.getElementById("reepay-checkout-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Reepay));
      existing.addEventListener("error", () => reject(new Error("Betalingsvinduet kunne ikke indlæses.")));
      return;
    }
    const s = document.createElement("script");
    s.id = "reepay-checkout-js";
    s.src = "https://checkout.reepay.com/checkout.js";
    s.async = true;
    s.onload = () => resolve(window.Reepay);
    s.onerror = () => reject(new Error("Betalingsvinduet kunne ikke indlæses."));
    document.head.appendChild(s);
  });
}

// ============================================================================
// FUNNELENS TOPBJÆLKE — logo og én vej ud. Intet andet.
//
// ⚠️ INGEN HOVEDMENU HERINDE. Brancher, Priser, Viden og Hvorfor Birdly hører
// til på salgssiden, hvor de skaber lyst. I funnelen er hvert menupunkt en
// udgang: kunden er midt i at konfigurere sin overvågning, og et klik på
// "Priser" sender hende ud af flowet for at læse noget hun får at se om to
// skærme alligevel.
//
// ⚠️ MEN HUN ER IKKE FANGET. "Tilbage til Birdly.dk" står der, browserens
// tilbage-knap virker som altid, og der er ingen dialog der forsøger at holde
// på hende. Færre udgange, ikke låste døre.
// ============================================================================
function FunnelTop() {
  return (
    <div className="st-top">
      <Logo height={30} />
      <a className="st-tilbage-link" href="/kom-i-gang">Tilbage til Birdly.dk</a>
    </div>
  );
}

// De fire svar på "hvordan finder I opgaver i dag".
//
// ⚠️ SVARENE TALER IKKE NOGEN NED. "Vi bruger allerede en anden tjeneste" mødes
// med at Birdly ikke behøver erstatte den — det er sandt, og det er stærkere end
// at angribe en konkurrent, som kunden måske selv har valgt med omhu.
const METODER = [
  {
    key: "selv",
    titel: "Vi søger selv",
    under: "Fx på udbudsportaler, websites og andre kilder.",
    svar: "Så kender I arbejdet. Birdly kan holde øje og sortere de irrelevante muligheder fra.",
  },
  {
    key: "netvaerk",
    titel: "Netværk og eksisterende kunder",
    under: "Det meste arbejde kommer gennem relationer.",
    svar: "Netværk er stærkt — men viser kun de muligheder, der når frem til jer.",
  },
  {
    key: "anden",
    titel: "Vi bruger allerede en anden tjeneste",
    under: null,
    svar: "Birdly behøver ikke erstatte det, I allerede bruger. Forskellen er, at relevante match kommer direkte til jer.",
  },
  {
    key: "ingen",
    titel: "Vi leder ikke aktivt efter nye opgaver",
    under: null,
    svar: "Så kan Birdly holde øje uden at ændre jeres hverdag.",
  },
];

// ⚠️ PROJEKTFAGENES BELØB ER DE EKSISTERENDE max_amount-VÆRDIER. De tre tal
// (1 mio., 5 mio., 20 mio.) er præcis dem funnelen altid har sendt til
// match-reglen; kun etiketterne er skrevet om til intervaller, så de læses som
// et valg frem for som et loft. Ændrer du et tal her, ændrer du kundens
// matchkriterium — ikke en tekst.
//
// `garantiUndtaget` markerer de valg hvor handelsbetingelsernes §3.5 sætter
// matchgarantien ud af kraft (loft under 2,5 mio. kr.). Kunden skal advares på
// skærmen, ikke den dag hun beder om refusion.
const PROJEKT_VALG = [
  { key: "u100", label: "Under 100.000 kr.", maks: 1000000, garantiUndtaget: true },
  { key: "100-500", label: "100.000–500.000 kr.", maks: 1000000, garantiUndtaget: true },
  { key: "500-2m", label: "500.000–2 mio. kr.", maks: 5000000, garantiUndtaget: false },
  { key: "2m+", label: "2 mio. kr. og op", maks: null, garantiUndtaget: false },
];

const cifre = (s) => String(s || "").replace(/\D/g, "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Telefon → +45XXXXXXXX. Samme antagelse som funnelen og signup: et 8-cifret
// dansk nummer uden landekode får +45.
function tilE164(raa) {
  const d = cifre(raa);
  if (!d) return null;
  if (d.length === 8) return "+45" + d;
  if (d.startsWith("45") && d.length === 10) return "+" + d;
  if (d.startsWith("0045")) return "+" + d.slice(2);
  return d.length >= 8 ? "+" + d : null;
}

export default function Start({ startFag = null, startRegion = null, betaling = null }) {
  // ⚠️ RETUR FRA REEPAY. Den hostede checkout forlader vores side, så al state er
  // væk når kunden kommer tilbage — derfor afgøres kvitteringen af URL'en, ikke af
  // hukommelsen. `ok` viser kvitteringen; `annulleret` sender hende tilbage i
  // flowet uden at påstå at noget lykkedes.
  //
  // ⚠️ KVITTERINGEN ER IKKE AKTIVERINGEN. accept_url betyder "Reepay sagde ja til
  // kortet", ikke "abonnementet kører". Det afgør `subscription_created`-webhooken,
  // som den altid har gjort. Vi lover derfor kun at vi holder øje — ikke at der er
  // trukket eller oprettet noget bestemt.
  const [trin, setTrin] = useState(1);
  const [katalog, setKatalog] = useState(null);
  const [fejl, setFejl] = useState("");
  const [arbejder, setArbejder] = useState(false);

  // Skærm 1 — virksomhed
  const [cvr, setCvr] = useState("");
  const [firma, setFirma] = useState("");
  const [branchekode, setBranchekode] = useState(null);
  // ⚠️ ADRESSE OG BRANCHETEKST BRUGES KUN TIL BEKRÆFTELSEN ("Er det jer?").
  // De sendes IKKE med i signup — payloaden er uændret. De kommer fra samme
  // /api/cvr-svar som firmanavnet, og de er der udelukkende for at kunden kan
  // genkende sin egen virksomhed frem for at skulle stole på et navn alene.
  const [adresse, setAdresse] = useState(null);
  const [branchetekst, setBranchetekst] = useState(null);
  // Har kunden bekræftet "Ja, det er os"? Skærm 1 har to tilstande.
  const [bekraeftet, setBekraeftet] = useState(false);

  // Skærm 2 — hvordan finder I opgaver i dag. ⚠️ DIAGNOSE, IKKE ET KRITERIUM.
  // Svaret bruges til ÉN kontekstsætning på skærmen og til opsummeringen. Det
  // sendes ikke til signup og påvirker ikke matchning med et komma.
  const [metode, setMetode] = useState(null);

  // Skærm 5 — værdi-spørgsmålet. ⚠️ ANKER, IKKE FILTER for løbende fag.
  // For projektfag ER det kundens max_amount (se `maks`); for rengøring og
  // service er månedsværdien udelukkende det tal vi regner sammenligningen på.
  // Blandes de to sammen, filtrerer vi kundens opgaver efter et beløb hun troede
  // var en illustration.
  const [vaerdiValg, setVaerdiValg] = useState(null);

  // Pre-funnelens bevis. ⚠️ SAMME KALD SOM RESTEN AF HUSET
  // (preview-kandidater → birdly_match_candidates_for). Hentes én gang når
  // kataloget er der, på det fag adressen peger på — eller rengøring, som er
  // den nuværende primære målgruppe. Fejler det, står sektionen der slet ikke;
  // vi viser ALDRIG en opgave fra et andet fag for at have noget at vise.
  const [preBevis, setPreBevis] = useState(null);

  // Skærm 6 — selve scanningen. Kort overgang, så resultatet ikke bare "popper".
  const [scanner, setScanner] = useState(false);
  const [slaarOp, setSlaarOp] = useState(false);
  const [opslagFejl, setOpslagFejl] = useState("");

  // Trin 2 — FLERE brancher. Datalaget kunne det hele tiden (signup tager fag_keys
  // som array), men UI'et viste kun én dropdown, så ingen kunne se at en
  // entreprenør også kunne tage kloak med. Nu chips + "tilføj branche", som
  // /tilmeld altid har haft.
  // ⚠️ TOM START, IKKE startFag DIREKTE. Forvalget sættes først når kataloget er
  // hentet og værdien er valideret — se effekten længere nede. Sattes den her, kunne
  // en opdigtet ?fag= lande i chippen som rå nøgle og blokere trin 3 uden forklaring.
  const [fagValgt, setFagValgt] = useState([]);
  const [gaetFag, setGaetFag] = useState(null); // hvad CVR-opslaget pegede på
  // ⚠️ FLERE LANDSDELE (03-08-2026). Området var en <select> og kunne derfor kun bære
  // ét valg — men en håndværker dækker sjældent præcis én region: Sjælland +
  // Hovedstaden er den almindelige kombination, ikke undtagelsen. /tilmeld har altid
  // haft afkrydsning, og HELE serversiden kunne det i forvejen: både signup og
  // preview-kandidater slår regionerne op med `.in("region_key", region_keys)` og
  // lægger deres NUTS-koder sammen. Det var kun UI'et der begrænsede kunden.
  const [regionValg, setRegionValg] = useState({}); // { [region_key]: true }
  // "hele_dk" er sin EGEN nøgle i region_nuts_map — ikke en optælling af de fem.
  // Derfor er den et selvstændigt valg der udelukker de andre, præcis som i /tilmeld.
  const [heleDk, setHeleDk] = useState(true);
  const [maks, setMaks] = useState("");

  // Trin 3 — arbejdsområder + bredde. Samme to valg som /tilmeld, samme datakilde
  // (katalogets fag.smal) og samme mapping til CPV. Ingen opfundne værdier.
  const [omraadeValg, setOmraadeValg] = useState({}); // { [cpv]: true }
  // "Alle brede opgaver" er default og anbefalet — samme forvalg som /tilmeld.
  const [bredde, setBredde] = useState("alle");
  // ⚠️ KUN SYNLIGHED. Listen er foldet som standard, fordi den hyppigste handling
  // er "bare fortsæt" og trin 3 ellers blev 2,1 skærme høj på mobil med Fortsæt
  // under folden. Afkrydsningerne bor i omraadeValg og røres IKKE af at folde —
  // fagKoder regnes af samme state uanset om listen er synlig.
  const [aabenOmr, setAabenOmr] = useState(false);

  // Trin 3
  const [kandidater, setKandidater] = useState(null);
  const [henter, setHenter] = useState(false);
  const [navn, setNavn] = useState("");
  const [email, setEmail] = useState("");
  const [tlf, setTlf] = useState("");

  // Trin 4
  const [betingelser, setBetingelser] = useState(false);
  // Abonnementsbetingelserne er et SELVSTÆNDIGT samtykke (Clearhaus-krav) — ikke
  // en del af handelsbetingelserne. Begge skal være sat, før man kan fortsætte.
  const [abonnement, setAbonnement] = useState(false);
  // År er forvalgt og anbefalet (spar ~17 %) — men BEGGE skal kunne vælges frit.
  // ⚠️ ÅRSPLANEN ER DEFAULT, og det er et KOMMERCIELT valg (Jonas 03-09-2026).
  // Den plan der står valgt, er den de fleste ender med, og den følger med ved
  // oprettelsen på trin 4. Året er det bedste tilbud — betal for 10 måneder, få
  // 12 — så det er dét, forvalget skal pege på. Mockup'ens "Måned som default"
  // var derfor en visuel detalje, ikke en beslutning.
  const [interval, setInterval_] = useState("yearly");
  // Hvilket interval der lige nu hentes en ny session til (null = ingen). Bærer
  // knappens "Skifter…"-tilstand, så et klik der tager tid ser levende ud.
  const [skifter, setSkifter] = useState(null);
  // Løbenummer pr. plan-skift. Klikker kunden År→Måned→År hurtigt, kommer svarene
  // tilbage i vilkårlig rækkefølge; uden det her kunne et LANGSOMT svar fra et
  // fortrudt valg lande til sidst og binde betalingen til den forkerte plan.
  const skiftNr = useRef(0);
  const [sessionId, setSessionId] = useState(null);
  const [oprettetId, setOprettetId] = useState(null);
  const [udenProeve, setUdenProeve] = useState(false);
  const [faerdig, setFaerdig] = useState(betaling === "ok");

  // ⚠️ META-HÆNDELSER (06-08-2026). Kun to, og begge kun én gang pr. kunde.
  //
  // spor() i lib/pixel.js gater allerede på marketing-samtykket OG på at fbq
  // faktisk er indlæst — den logik er urørt. sporEnGang() lægger dubletværnet
  // ovenpå. Der fyres intet før samtykke, fordi pixel'en slet ikke er indlæst før da.
  //
  // content_category = kundens valgte branche. Det er dét Meta kan optimere på;
  // plan-intervallet siger intet om hvem hun er. Uden fag falder vi tilbage til
  // intervallet frem for at sende en tom streng.
  const pixelParams = () => ({
    content_name: "Birdly 14 dages prøve",
    content_category: fagValgt.length ? fagValgt.join(",") : interval,
    currency: "DKK",
    value: 0,
  });

  // ⚠️ FRISBII-RETUREN HAR INGEN STATE. Kunden forlader siden til
  // checkout.reepay.com og kommer tilbage på ?betaling=ok med alt nulstillet —
  // oprettetId er væk. Uden id kan dubletnøglen ikke være pr. kunde, og et reload
  // på kvitteringen ville sende StartTrial igen. Derfor lægges id'et i
  // localStorage lige FØR omdirigeringen og læses tilbage ved returen.
  const STASH = "birdly_px_paavej";

  useEffect(() => { fetchCatalog().then(setKatalog).catch(() => setKatalog({ fag: [], regions: [] })); }, []);

  // ⚠️ ÉN GANG PR. INDLÆSNING, og kun internt. Se lib/ctaSporing.js: den her
  // hændelse rører ikke Meta, og den må ikke gøre det — PageView fyres allerede
  // af pixlen bag samtykket, og en dublet ville forurene optimeringen.
  useEffect(() => { sporFunnel("FunnelStarted", { fag: startFag || null }); }, [startFag]);


  // ⚠️ STARTTRIAL VED RETUR FRA FRISBII. Kører kun når kunden faktisk kommer
  // tilbage på ?betaling=ok — altså efter en gennemført betaling. Ikke ved
  // ?betaling=annulleret, og ikke ved en sidevisning uden parameteren.
  //
  // ⚠️ ACCEPTERET UNØJAGTIGHED: accept_url betyder "Reepay sagde ja til kortet",
  // ikke "webhooken har aktiveret abonnementet". Men prøven ER startet — den blev
  // sat af create_signup ved tilmeldingen — så betingelsen "de 14 dage er reelt
  // begyndt" er opfyldt. Det er det tætteste klientsiden kan komme; at vente på
  // webhooken ville kræve en server-side pixel (Conversions API).
  //
  // ⚠️ IKKE FOR uden_proeve-KUNDER. En genkommende kunde der har brugt sin gratis
  // prøve får no_trial hos Frisbii og trækkes med det samme. Hun starter ingen
  // prøve, og en StartTrial ville lære Meta at lede efter den forkerte hændelse.
  useEffect(() => {
    if (betaling !== "ok") return;
    let stash = null;
    try {
      const r = window.localStorage.getItem(STASH);
      if (r) stash = JSON.parse(r);
      window.localStorage.removeItem(STASH);
    } catch { /* ingen stash — så kan én-gang ikke garanteres, og vi springer over */ }
    if (!stash?.id || stash.udenProeve) return;
    sporEnGang(`starttrial_${stash.id}`, "StartTrial", {
      content_name: "Birdly 14 dages prøve",
      content_category: Array.isArray(stash.fag) && stash.fag.length ? stash.fag.join(",") : stash.interval || "",
      currency: "DKK",
      value: 0,
    });
  }, [betaling]);

  // ⚠️ FORVALG FRA fag×geo-SIDERNE (03-08-2026). De 36 /fag/-sider er nu husets
  // eneste CTA-mål, og de sender BÅDE ?fag= og ?region= — fx
  // /start?fag=tomrer&region=nordjylland fra "Tømreropgaver i Nordjylland".
  //
  // ⚠️ ?region= MANGLEDE. /start læste kun ?fag=, så en kunde fra en fag×geo-side
  // landede på "Hele Danmark" og fik et bredere kriterium end den side hun kom fra
  // lovede. /tilmeld har altid forstået begge — havde vi bare flyttet knapperne,
  // var halvdelen af landingssidernes pointe faldet på gulvet.
  //
  // ⚠️ VALIDERET MOD KATALOGET, som i /tilmeld. Værdierne kommer fra en URL og er
  // derfor kundens input, ikke vores data. Findes de ikke i kataloget, ignoreres de
  // stille — en manipuleret adresse må ikke kunne sætte et fag eller et område der
  // ikke eksisterer. Region-slug og region_key er samme streng (lib/regioner.js),
  // så der er ingen oversættelse der kan drive fra hinanden.
  useEffect(() => {
    if (!katalog) return;
    if (startFag && (katalog.fag || []).some((f) => f.key === startFag)) {
      setFagValgt((s) => (s.length ? s : [startFag]));
    }
    if (startRegion && (katalog.regions || []).some((r) => r.key === startRegion)) {
      setHeleDk(false);
      setRegionValg({ [startRegion]: true });
    }
  }, [katalog, startFag, startRegion]);

  // ⚠️ KORTLØS ONBOARDING (05-08-2026, midlertidig). Flaget kommer fra get-catalog,
  // fordi funnelen kun har anon-nøglen og ikke selv kan læse feature_flags.
  // Tændt ⇒ trin 5 viser en bekræftelsesside i stedet for kortbetaling; kunden får
  // fuld prøve og fanges ved udløb af sweepet i birdly-admin.
  //
  // ⚠️ Fejler kataloget, er katalog null og kortloes false — altså NORMAL
  // kortbetaling. Fejler LUKKET, samme retning som erTaendt server-side: en
  // netværksfejl må aldrig kunne give nogen gratis adgang.
  // ⚠️ PREVIEW-ONLY OMGÅELSE, så betalingstrinnet kan ses uden at slukke det DELTE
  // feature-flag. kortloes_onboarding gælder produktionen også; slukkes det for at
  // kigge, møder enhver ny kunde i det vindue et kortformular bygget på TEST-nøgler
  // mens indløseraftalen ikke er godkendt. Det er ikke en risiko der er værd at løbe
  // for et kig.
  //
  // ⚠️ DØD I PRODUKTION. VERCEL_ENV er "production" på det rigtige domæne, og så
  // findes flaget ikke — parameteren kan ikke bruges af nogen udefra. Den virker kun
  // på preview- og udviklings-deployments.
  //
  // Fjern den gerne når betalingstrinnet er live; indtil da er den den eneste måde at
  // se trin 5 på uden at røre produktionen.
  const maaOmgaa = process.env.NEXT_PUBLIC_VERCEL_ENV !== "production";
  const tvingBetaling =
    maaOmgaa && typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("vis") === "betaling";
  const kortloes = katalog?.kortloes_onboarding === true && !tvingBetaling;

  // ⚠️ MESSAGE-MATCH. Kommer kunden fra en rengørings-annonce (?fag=rengoring),
  // skal funnelen sige "rengøring" med det samme — ellers bruger hun det første
  // sekund på at afgøre om hun er landet det rigtige sted.
  //
  // ⚠️ LABELEN KOMMER FRA KATALOGET, ikke fra adressen. Vi skriver ALDRIG en
  // rå ?fag=-værdi ud på skærmen: så kunne hvem som helst sætte vores overskrift
  // ved at hænge en streng på URL'en. Findes nøglen ikke i kataloget, står den
  // generiske tekst — samme regel som forvalget selv (se effekten ovenfor).
  //
  // ⚠️ lib/branche.js importeres BEVIDST IKKE her. Den bærer alle 20 fags FAQ,
  // eksempler og brødtekst og ville lægge sig i funnelens klient-bundle for ét
  // ords skyld. Kataloget er allerede hentet.
  // ⚠️ useMemo, IKKE `katalog?.fag || []` DIREKTE — OG DET ER EN FEJLRETTELSE,
  // IKKE PYNT (fundet 06-09-2026, fejlen er ældre end denne omskrivning).
  //
  // `|| []` skabte et NYT array ved hver eneste render så længe kataloget endnu
  // ikke var hentet. Kæden derfra:
  //   nyt fagListe → nyt fagByKey → nyt omraader → effekten nedenfor kører →
  //   setOmraadeValg({}) med et nyt objekt → ny render → forfra.
  // Resultatet var "Maximum update depth exceeded" i konsollen ved hver
  // indlæsning af /start, og en løkke der kørte til fetchCatalog svarede.
  //
  // Den var usynlig for kunden — funnelen så rigtig ud — men den brændte CPU på
  // hver eneste besøgendes telefon i det sekund hvor førstehåndsindtrykket
  // dannes, og den skjulte enhver anden advarsel i konsollen bag sig.
  //
  // Med en memo er referencen stabil så længe `katalog` er den samme, også når
  // den er null. Så kører effekten én gang pr. faktisk ændring, som den skal.
  const fagListe = useMemo(() => katalog?.fag || [], [katalog]);
  const fagByKey = useMemo(
    () => Object.fromEntries(fagListe.map((f) => [f.key, f])),
    [fagListe]
  );
  const valgtFag = fagByKey[fagValgt[0]] || null;
  const forvalgtLabel =
    startFag && fagByKey[startFag] ? fagByKey[startFag].label_da : null;

  // ⚠️ "hele_dk" filtreres FRA listen. Den er sin egen række i region_nuts_map, så
  // returnerer kataloget den, ville den stå to gange — én som afkrydsning og én som
  // det brede valg — og de to ville kunne krydses af samtidig.
  const regionListe = (katalog?.regions || []).filter((r) => r.key !== "hele_dk");
  const valgteRegioner = Object.keys(regionValg).filter((k) => regionValg[k]);
  // Det der faktisk sendes til match og signup. Ét sted, så preview og oprettelse
  // ALDRIG kan komme til at regne på hver sit område.
  const regionKeys = heleDk ? ["hele_dk"] : valgteRegioner;
  const regionResume = heleDk
    ? "Hele Danmark"
    : valgteRegioner.length === 0
      ? null
      : valgteRegioner.map((k) => regionListe.find((r) => r.key === k)?.label_da || k).join(", ");

  // At krydse en landsdel af slår "hele landet" fra — ellers ville kunden tro hun
  // havde indsnævret, mens kriteriet stadig var hele DK.
  function toggleRegion(key) {
    setHeleDk(false);
    setRegionValg((s) => ({ ...s, [key]: !s[key] }));
  }

  // ⚠️ UNION af ALLE valgte branchers underområder — ikke kun den første. Vælger
  // kunden entreprenør + kloak, skal begge fags koder med, præcis som /tilmeld gør.
  // Dedupliceret på cpv, fordi to fag kan dele en kode.
  const omraader = useMemo(() => {
    const set = new Map();
    for (const k of fagValgt) for (const a of fagByKey[k]?.smal || []) if (a.cpv && !set.has(a.cpv)) set.set(a.cpv, a);
    return [...set.values()];
  }, [fagValgt, fagByKey]);

  // ⚠️ KODERNE SKAL MED. Sender vi kun fag_keys, får de 13 fag uden bred kode
  // effektive_koder=0 og dermed 0 opgaver — ikke fordi der intet er, men fordi
  // intet var valgt. Det er kundens afkrydsninger der bliver til cpv_selections.
  const fagKoder = useMemo(
    () => omraader.map((a) => a.cpv).filter((c) => c && omraadeValg[c]),
    [omraader, omraadeValg]
  );

  // Når faget skifter, krydses ALLE fagets områder af. Bevidst forvalg: det svarer
  // til "Tag alle X-områder med" i /tilmeld og gør at en kunde der bare trykker
  // videre får et gyldigt, bredt kriterium frem for et tomt. Hun kan fravælge —
  // og det er netop dét valg der manglede.
  useEffect(() => {
    const n = {};
    for (const a of omraader) if (a.cpv) n[a.cpv] = true;
    setOmraadeValg(n);
  }, [omraader]);

  const antalValgt = fagKoder.length;
  const alleValgt = omraader.length > 0 && antalValgt === omraader.length;
  function saetAlle(paa) {
    const n = {};
    for (const a of omraader) if (a.cpv) n[a.cpv] = paa;
    setOmraadeValg(n);
  }

  // ⚠️ Teksten læses AF state, ikke antaget. Står der "alle valgt" mens kunden har
  // fjernet tre, lyver resuméet om det hun faktisk har valgt — og hun opdager det
  // først når beskederne ikke passer.
  const omrResume =
    omraader.length === 0
      ? null
      : antalValgt === 0
        ? "Ingen valgt — vælg mindst ét"
        : alleValgt
          ? `Alle ${omraader.length} arbejdsområder er valgt`
          : `${antalValgt} af ${omraader.length} arbejdsområder valgt`;

  // ---- Trin 1: CVR-opslag ----
  async function slaaOp(vaerdi) {
    const d = cifre(vaerdi);
    if (d.length !== 8) return;
    setSlaarOp(true); setOpslagFejl("");
    try {
      const r = await fetch(`/api/cvr?cvr=${d}`).then((x) => x.json());
      if (r?.name) {
        setFirma(r.name);
        setBranchekode(r.branchekode || null);
        // Kun til visning på bekræftelsen. Felterne kommer fra samme svar og
        // gemmes ikke nogen steder.
        setAdresse([r.address, [r.zipcode, r.city].filter(Boolean).join(" ")].filter(Boolean).join(", ") || null);
        setBranchetekst(r.industridesc || null);
        // Branchekoden gætter faget, så trin 2 bliver en bekræftelse frem for et valg.
        // Gætter den forkert, retter kunden det selv — derfor er det kun et forvalg.
        // ⚠️ branchekode_fag giver en LISTE af fag-nøgler, ikke én. Vi tager den
        // første som forvalg; resten står i dropdownen.
        const gaet = (katalog?.branchekode_fag || {})[r.branchekode];
        const foerste = Array.isArray(gaet) ? gaet[0] : gaet;
        // ⚠️ Gættet gemmes særskilt, så UI'et kan skelne "CVR'et pegede på dette fag"
        // fra "et fag var valgt i forvejen". Uden den skelnen påstod vi at opslaget
        // havde fundet et fag, som i virkeligheden kom fra ?fag= i adressen.
        setGaetFag(foerste || null);
        // Branchekoder uden mapping (fx 582900 "Anden udgivelse af software") giver
        // INTET forvalg. Vi dækker håndværks- og byggefag; at tvinge et byggefag på
        // en it-virksomhed ville sende hende videre med et kriterium der aldrig
        // matcher hendes arbejde.
        if (foerste && fagValgt.length === 0) setFagValgt([foerste]);
      } else if (r?.reason === "not_found") {
        // ⚠️ SIG DET HER, IKKE FØRST PÅ TRIN 4. Serveren afviser et CVR der ikke
        // findes (gate 1 i signup), og gør vi ikke kunden opmærksom nu, udfylder hun
        // fire trin til ingen verden nytte. Beskeden er bevidst konkret: "vi kunne
        // ikke finde firmaet" lyder som vores problem, og så retter ingen tallet.
        // ⚠️ VENLIG, KONKRET OG IKKE SPÆRRENDE. Feltet er stadig åbent, og hun kan
        // rette og prøve igen med det samme — det er signup der afviser, ikke
        // denne tekst. "Vi kunne ikke finde firmaet" ville lyde som vores problem,
        // og så retter ingen tallet.
        setOpslagFejl("Vi kan ikke finde et firma med det CVR-nummer. Prøv at tjekke tallet en ekstra gang — så er I videre om et øjeblik.");
      } else {
        // Opslaget fejlede — det er VORES problem, ikke kundens, og serveren lader
        // hende igennem. Så må teksten heller ikke antyde at hun har tastet forkert.
        setOpslagFejl("Vi kunne ikke slå CVR op lige nu. Du kan fortsætte alligevel.");
      }
    } catch {
      setOpslagFejl("Vi kunne ikke slå CVR op lige nu. Du kan fortsætte alligevel.");
    } finally { setSlaarOp(false); }
  }

  // ---- Trin 3 → 4: hent det ægte tal ----
  // ⚠️ Tallet regnes på den FULDE effektive liste — kundens afkrydsede områder OG
  // hendes bredde-valg. Regnede vi før hun havde valgt, ville trin 4 vise et tal
  // der ikke svarer til det hun får.
  // ---- BIRDLY SCAN: skærm 5 → 6 ----
  //
  // ⚠️ SAMME KALD SOM FØR, samme kriterier, samme Edge Function. Det eneste nye
  // er `med_eksempler`, som beder om op til tre AF DE SAMME opgaver tallet er
  // regnet på — og en kort overgang, så resultatet ikke bare popper op.
  //
  // ⚠️ OVERGANGEN ER 1,1 SEKUND OG DEN LYVER IKKE. Der står hvad vi rent faktisk
  // slår op på (fag, område, størrelse). Ingen "scanner 4 millioner databaser",
  // ingen falsk AI-animation — kaldet tager reelt et øjeblik, og det er dét
  // øjeblik der vises.
  async function tilResultat() {
    setFejl("");
    if (!fagValgt.length) return setFejl("Vælg mindst én branche.");
    if (!fagKoder.length) return setFejl("Vælg mindst ét arbejdsområde — det er dem, vi holder øje med.");
    sporFunnel("PreferencesCompleted", { fag: fagValgt.join(","), omraade: regionKeys.join(",") });

    setHenter(true);
    setScanner(true);
    setTrin(6);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const [k] = await Promise.all([
      hentKandidater({
        fag_keys: fagValgt,
        cpv_selections: fagKoder,
        bredde,
        region_keys: regionKeys,
        min_amount: null,
        max_amount: maks ? Number(maks) : null,
        med_eksempler: true,
      }),
      // Kører PARALLELT med opslaget, ikke oveni. Svarer serveren på 900 ms, har
      // kunden set overgangen i 1,1 s i alt — ikke 2. Vi lægger aldrig ventetid
      // til for effektens skyld.
      new Promise((r) => setTimeout(r, 1100)),
    ]);

    setKandidater(k);
    setHenter(false);
    setScanner(false);

    const tilstand = visResultat(k);
    sporFunnel("BirdlyScanCompleted", { antal: k?.i_omraade || 0, tilstand });
    sporFunnel(tilstand === "intet" || !(k?.i_omraade > 0) ? "BirdlyScanZeroMatches" : "BirdlyScanHasMatches", {
      antal: k?.i_omraade || 0,
    });
  }

  // ---- Trin 4 → 5: opret kunden + betalingssession ----
  async function tilBetaling() {
    setFejl("");
    if (!navn.trim()) return setFejl("Skriv dit navn.");
    if (!EMAIL_RE.test(email.trim())) return setFejl("Skriv en gyldig e-mail.");
    if (!tilE164(tlf)) return setFejl("Skriv et gyldigt telefonnummer.");
    if (!betingelser) return setFejl("Sæt flueben i handelsbetingelserne for at fortsætte.");
    if (!abonnement) return setFejl("Sæt flueben i abonnementsbetingelserne for at fortsætte.");
    if (arbejder) return;
    setArbejder(true);
    try {
      let id = oprettetId;
      // ⚠️ Lokal variabel, ikke state: setUdenProeve er asynkron, og den FØRSTE
      // session for en genkommende kunde ville ellers blive oprettet MED gratis
      // prøve — præcis det misbrug værnet skal forhindre. Samme greb som /tilmeld.
      let udenProeveNu = udenProeve;
      if (!id) {
        const r = await submitSignup({
          company_name: firma.trim() || null,
          cvr: cifre(cvr),
          contact_name: navn.trim(),
          email: email.trim(),
          phone: tilE164(tlf),
          fag_keys: fagValgt,
          cpv_selections: fagKoder,
          bredde,
          region_keys: regionKeys,
          min_amount: null,
          max_amount: maks ? Number(maks) : null,
          notify_email: true,
          notify_sms: true,
          marketing_consent: false,
          terms_accepted: true,
          cvr_branchekode: branchekode,
          package: planForInterval(interval),
          // Tomt objekt for organisk trafik — serveren gemmer da ingenting, så
          // en kunde uden kampagne ser præcis ud som før.
          attribution: hentAttribution(),
          // Markerer kunden i signup_data. Serveren gemmer den kun når den er sat,
          // og det eneste den kan udløse er en varslingsmail og en lukning ved
          // prøveudløb — aldrig adgang, aldrig penge, aldrig en gratis periode.
          ...(kortloes ? { kortloes: true } : {}),
        });
        id = r.id;
        setOprettetId(id);
        if (r.uden_proeve) { udenProeveNu = true; setUdenProeve(true); }

          // ⚠️ LEAD FYRER HER — ikke ved klik og ikke ved klient-validering.
          // Serveren har netop accepteret kontaktoplysninger OG virksomhedsdata og
          // givet os et id tilbage. Først dér VED vi at data var gyldige: klientens
          // validering kan omgås, signup-værnene kan ikke (dublet-CVR/telefon,
          // nul-dækning, min>max). Et mislykket kald kaster og når aldrig hertil.
          //
          // Ligger inde i `if (!id)`, så en kunde der går tilbage til trin 4 og
          // frem igen ikke fyrer en Lead til.
          sporEnGang(`lead_${id}`, "Lead", pixelParams());
      }
      // ⚠️ KORTLØS: INGEN FRISBII-SESSION. Kunden er allerede oprettet med
      // status='trial' og 14 dage (create_signup, migration 0010) — der mangler
      // intet for at hun kan bruge produktet. Velkomsten fyres af signup-funktionen,
      // fordi Frisbii-webhooken aldrig kommer for hende.
      if (kortloes) {
        // ⚠️ STARTTRIAL FOR KORTLØSE FYRER HER. Alle tre betingelser er opfyldt:
        // onboardingen er gennemført (dette ER sidste trin — der er ingen betaling),
        // kunden er oprettet (vi har id'et fra signup), og prøven KØRER:
        // create_signup sætter trial_ends_at = now() + 14 dage i samme transaktion
        // som rækken (migration 0010). Der er intet at vente på.
        //
        // Står efter submitSignup, så et fejlet kald aldrig kan udløse den.
        if (!udenProeveNu) sporEnGang(`starttrial_${id}`, "StartTrial", pixelParams());
        setTrin(9);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const { session_id } = await createSubscriptionSession({
        subscriber_id: id,
        email: email.trim(),
        contact_name: navn.trim(),
        phone: tilE164(tlf),
        billing: interval,
        reuse_customer: false,
        retur: "start",
        uden_proeve: udenProeveNu,
      });
      setSessionId(session_id);
      sporFunnel("CheckoutStarted", { interval });
      setTrin(9);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      // Værnene i signup svarer med almindeligt dansk — vis det ordret frem for at
      // oversætte det til noget mere generelt. "Vælg mindst ét arbejdsområde" og
      // "dette CVR er allerede oprettet" er begge beskeder kunden kan handle på.
      setFejl(e.message || "Noget gik galt. Prøv igen, eller skriv til support@birdly.dk.");
    } finally { setArbejder(false); }
  }

  // ⚠️ PLAN-SKIFT PÅ TRIN 5. Knapperne var `disabled={!!sessionId}` — og da
  // sessionId ALTID er sat når man når trin 5, var begge permanent låst. Kunden
  // kunne ikke vælge måned.
  //
  // Årsagen til låsen var reel nok: sessionen hos Frisbii er bundet til ét
  // plan-handle, så skifter kunden interval, skal sessionen gen-oprettes — ellers
  // betaler hun for den forkerte plan. Samme greb som /tilmelds changeBilling:
  // reuse_customer=true, fordi kunden allerede findes hos Frisbii.
  // ⚠️ FRYSNINGEN (03-08-2026): `setBetalingAaben(false)` stod stadig her efter at
  // overlayet blev fjernet — en funktion der ikke længere fandtes. Linjen lå FØR
  // try-blokken, så ReferenceError'en blev aldrig fanget, og `finally` blev aldrig
  // nået. `arbejder` var netop sat til true linjen inden og blev der for evigt:
  // begge plan-knapper og "Start min gratis prøve" var `disabled` resten af besøget.
  //
  // Kun Måned ramte det. År er forvalgt, så klikket returnerede på `nyt === interval`
  // og nåede aldrig linjen — derfor så det ud som en fejl i månedsvejen frem for
  // en efterladt reference.
  //
  // Læringen: en død kald-reference i en event-handler er ikke en synlig fejl, den
  // er en frossen knap. Ryd altid state-sætterne med, når du fjerner det de styrede.
  async function skiftInterval(nyt) {
    if (nyt === interval || !oprettetId) return;
    const mit = ++skiftNr.current;
    // Markering og pris skifter STRAKS — kunden skal se at vi hørte klikket, længe
    // før Frisbii svarer. Det er sandt: `interval` ER hendes valg nu.
    setInterval_(nyt);
    setFejl("");
    setSkifter(nyt);
    // Sessionen hos Frisbii er bundet til ét plan-handle. Den gamle ryddes derfor
    // med det samme, så betalingsknappen ikke kan nå at åbne den forkerte plan.
    setSessionId(null);
    try {
      const { session_id } = await createSubscriptionSession({
        subscriber_id: oprettetId,
        email: email.trim(),
        contact_name: navn.trim(),
        phone: tilE164(tlf),
        billing: nyt,
        reuse_customer: true,
        retur: "start",
        uden_proeve: udenProeve,
      });
      if (mit !== skiftNr.current) return; // overhalet af et nyere klik — det vinder
      setSessionId(session_id);
    } catch {
      if (mit !== skiftNr.current) return;
      setFejl("Kunne ikke skifte plan. Prøv igen, eller skriv til support@birdly.dk.");
    } finally {
      // ⚠️ Kun det NYESTE skift må rydde tilstanden. Ellers slukker et forældet svar
      // spinneren mens det aktuelle skift stadig kører.
      if (mit === skiftNr.current) setSkifter(null);
    }
  }

  // ⚠️ REEPAYS EGEN HOSTEDE CHECKOUT (03-08-2026). Vi har prøvet to egne
  // indpakninger: en 520px embedded div (kunden scrollede inde i iframen for at nå
  // CVC-feltet) og et selvbygget fuldskærms-overlay (vores geometri var korrekt, men
  // Reepay renderede blankt i den nestede ramme). Begge var forsøg på at eje et
  // layout vi ikke skal eje.
  //
  // WindowSubscription gør præcis ét — bekræftet ved at læse checkout.js:
  //   window.location.href = "https://checkout.reepay.com#/subscription/" + id
  // Reepay ejer hele siden: kortfelter, betalingsmetoder, højde, responsivitet. Der
  // findes ingen container hos os at klemme noget i, så fejlen kan ikke opstå igen.
  //
  // Kortdata rører aldrig vores side — det er Reepays PCI-felter på deres domæne.
  //
  // Ingen event-handlers her: siden forlades, så Accept/Cancel kommer tilbage som
  // accept_url/cancel_url (→ /start?betaling=ok|annulleret, hvidlistet server-side).
  // Aktiveringen er og bliver webhookens ansvar, ikke redirect'ens.
  function aabnBetaling() {
    if (!sessionId || arbejder) return;
    // ⚠️ SAMTYKKET GATER OGSÅ HER (Clearhaus, 21-08-2026). Uden dette tjek ville
    // fluebenene ved prisen være pynt: kunden kunne fjerne krydset og alligevel
    // sendes til betaling.
    if (!betingelser) return setFejl("Sæt flueben i handelsbetingelserne for at fortsætte.");
    if (!abonnement) return setFejl("Sæt flueben i abonnementsbetingelserne for at fortsætte.");
    setFejl("");
    // Se noten ved STASH: siden forlades helt, så id'et skal med over på den anden
    // side for at dubletnøglen kan være pr. kunde.
    try {
      window.localStorage.setItem(STASH, JSON.stringify({ id: oprettetId, udenProeve, fag: fagValgt, interval }));
    } catch { /* privat browsing — StartTrial springes over, hellere end en dublet */ }
    // ⚠️ RULLET TILBAGE TIL REDIRECT (03-09-2026). Den indlejrede checkout
    // blev proevet live og oprettede abonnementer UDEN kort: fem abonnementer stod i
    // "pending" med nul gemte betalingsmetoder, og kunden fik "betalingen kunne ikke
    // gennemfoeres" efter en godkendt MitID. WindowSubscription er den variant der
    // beviseligt gemmer kortet og aktiverer abonnementet. Roeres ikke igen, foer det
    // modsatte er vist i test-mode.
    loadReepay()
      .then((Reepay) => { new Reepay.WindowSubscription(sessionId); })
      .catch((e) => setFejl(e.message));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // AFLEDTE VÆRDIER TIL SKÆRMENE. Alt herunder er REGNET af state — ingen af
  // dem er gemt, og ingen af dem kan komme i utakt med det kunden har valgt.
  // ══════════════════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════════════════
  // PRE-FUNNELENS AFLEDTE VÆRDIER
  // ══════════════════════════════════════════════════════════════════════════

  // Faget pre-funnelen taler om: adressens ?fag= hvis det findes i kataloget,
  // ellers rengøring. ⚠️ ALDRIG den rå parameter — den styrer både overskrift
  // og regnestykke, og en tilfældig streng må ikke kunne skrive nogen af dem.
  const preFag = startFag && fagByKey[startFag] ? startFag : "rengoring";
  const preAnker = byggAnker(preFag, null);
  const preFagOrd = forvalgtLabel ? forvalgtLabel.toLowerCase() + "sopgaver" : "opgaver";

  // Trade-specifik overskrift. Læses af kataloget, som alt andet.
  const preOverskrift = forvalgtLabel
    ? <>Få flere opgaver inden for {forvalgtLabel.toLowerCase()}.</>
    : <>Få flere relevante opgaver.</>;

// ⚠️ HENTES ÉN GANG, OG KUN PÅ SKÆRM 1. Beviset hører til i pre-funnelen; er
  // kunden kommet videre, er kaldet spildt båndbredde på en telefon. Fejler det,
  // sættes intet, og sektionen renderer sig væk — se noten ved preBevis.
  useEffect(() => {
    if (!katalog || trin !== 1 || preBevis) return;
    const f = fagByKey[preFag];
    if (!f) return;
    let levende = true;
    const koder = (f.smal || []).map((a) => a.cpv).filter(Boolean);
    hentKandidater({
      fag_keys: [preFag],
      cpv_selections: koder,
      bredde: "alle",
      region_keys: ["hele_dk"],
      min_amount: null,
      max_amount: null,
      med_eksempler: true,
    }).then((k) => {
      if (!levende) return;
      const antal = k?.i_omraade || 0;
      setPreBevis({ antal, eksempler: k?.eksempler || [] });
      if (antal > 0) sporFunnel("PrefunnelProofViewed", { fag: preFag, antal });
    });
    return () => { levende = false; };
  }, [katalog, trin, preBevis, fagByKey, preFag]);

  // Skærm → etape. Ukendt skærm falder til første etape frem for at kaste.
  const etape = SKAERM_ETAPE[trin] ?? 0;

  // Er kundens FØRSTE fag et løbende-aftale-fag (rengøring, service …)? Det
  // afgør hvilket værdi-spørgsmål hun får, og hvilket regnestykke ankeret laver.
  // ⚠️ Første fag, ikke "et af dem": en virksomhed der laver både rengøring og
  // entreprenørarbejde skal have ÉT spørgsmål, ikke to modstridende.
  const loebendeFag = erLoebende(fagValgt[0]);

  // Valgmulighederne på skærm 5. For løbende fag er de rene ankre (ingen maks);
  // for projektfag bærer de kundens faktiske max_amount.
  const vaerdiListe = loebendeFag
    ? MAANEDSVAERDI.map((v) => ({ ...v, maks: null, garantiUndtaget: false }))
    : PROJEKT_VALG;
  const vaerdiLabel = vaerdiListe.find((v) => v.key === vaerdiValg)?.label || null;

  // Ankeret regnes af kundens EGET valg. Uden et valg falder byggAnker tilbage
  // på standard-eksemplet — se lib/vaerdiAnker.js.
  const anker = byggAnker(fagValgt[0] || "rengoring", vaerdiValg);

  const prMaaned = Math.round(PLAN.yearly / 12).toLocaleString("da-DK");

  // Fagnavne som tekst. Læses af kataloget, aldrig af den rå ?fag=-værdi.
  const fagResume = fagValgt.length
    ? fagValgt.map((k) => fagByKey[k]?.label_da || k).join(", ")
    : null;

  // "Rengøring · Sjælland · 5.000–10.000 kr." — kundens egne valg, sat sammen.
  // Tomme led udelades, så linjen aldrig ender med en løs prik.
  const kontekstLinje = [fagResume, regionResume, vaerdiLabel].filter(Boolean).join(" · ");

  // ⚠️ HAR VI ET MATCH? visResultat() er den eneste dommer — den skelner mellem
  // "der er noget i området", "der er kun noget på landsplan" og "vi ved det
  // ikke". Et rå `i_omraade > 0` ville vise et resultat selv når opslaget
  // fejlede og alle tal er nul.
  const harMatch = !!kandidater && visResultat(kandidater) === "lokalt" && kandidater.i_omraade > 0;
  const eksempler = kandidater?.eksempler || [];

  // ⚠️ priceText er et OBJEKT, ikke en funktion — og det er den eneste kilde til
  // beløbet. Hardkod aldrig en pris her; det var netop derfor tre steder stod med
  // den gamle pris efter en ændring (se CLAUDE.md, "Pris — REGLERNE").
  const pris = priceText[interval];

  // Annulleret betaling: kunden er tilbage, men intet er sket. Vi siger det rent ud
  // frem for at lade hende stå på trin 1 og undre sig.
  const annulleret = betaling === "annulleret";

  // ══════════════════════════════════════════════════════════════════════════
  // AKTIVERING — den sidste skærm, og den første gang produktet gør noget.
  //
  // ⚠️ IKKE "TAK FOR DIN TILMELDING". Det er en kvittering for en handel; her
  // skal kunden se at TJENESTEN er begyndt. Forskellen er hele forskellen på et
  // køb der føles afsluttet og et produkt der føles i gang.
  //
  // ⚠️ KVITTERINGEN ER IKKE AKTIVERINGEN, TEKNISK SET. accept_url betyder
  // "Reepay sagde ja til kortet", ikke "abonnementet kører" — det afgør
  // webhooken. Derfor lover vi kun at vi holder øje, og vi skriver ALDRIG en
  // konkret trækdato regnet i browseren.
  //
  // ⚠️ FIRMANAVNET KAN VÆRE VÆK. Kunden har været forbi checkout.reepay.com, så
  // al state er nulstillet ved returen. Er `firma` tom, står den generiske
  // sætning — vi finder ALDRIG på et navn.
  //
  // ⚠️ INGEN "VI HAR ALLEREDE FUNDET 3 MULIGHEDER" HER. Kandidat-tallet levede i
  // hukommelsen før betalingen og er væk efter returen fra Reepay. At vise et
  // tal her ville kræve et nyt opslag på kriterier vi ikke længere har — og et
  // gæt om hvor mange match kunden har, er præcis den slags påstand der ikke må
  // stå på siden. Kunden får sine match på SMS og mail, som lovet.
  // ══════════════════════════════════════════════════════════════════════════
  if (faerdig) {
    return (
      <main className="st-wrap">
        <FunnelTop />
        <div className="st-kort st-kvit">
          <div className="st-ic">✓</div>
          <h1>Birdly er i gang.</h1>
          <p>
            {firma
              ? <>Vi holder nu øje med relevante opgaver for <b>{firma}</b>.</>
              : <>Vi holder øje fra nu af.</>}
          </p>

          {/* Det næste kunden kommer til at se, vist én gang her så hun ved hvad
              hun skal kigge efter. ⚠️ MÆRKET SOM EKSEMPEL — det er ikke et match. */}
          <div className="st-aktiv-sms">
            <div className="st-aktiv-sms-hd">Nyt Birdly-match</div>
            <div className="st-aktiv-sms-krop">
              Rengøring · Roskilde<br />
              Fast rengøringsaftale<br />
              Frist 18/09<br />
              <span className="st-aktiv-lnk">Se opgaven →</span>
            </div>
            <div className="st-aktiv-sms-fin">Eksempel på en besked</div>
          </div>

          <p className="st-hj">
            Fremover får I nye relevante match direkte på SMS og mail. I skal ikke
            logge ind eller søge efter noget.
          </p>

          <p className="st-kvit-fin">
            Du har betalt <b>0 kr. i dag</b>. Første betaling sker efter de {TRIAL_DAYS} gratis
            dage, og vi minder dig 3 dage før. Vil du ikke fortsætte, siger du op inden — så
            trækkes der ingenting.
          </p>
        </div>
      </main>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FUNNELEN — ni skærme, fire synlige etaper.
  //
  // ⚠️ DEN MÅ IKKE LIGNE FORSIDEN. Forsiden skaber lyst og har navigation,
  // sektioner og bevis i bredden. Funnelen lukker: ét spørgsmål ad gangen, ingen
  // menu, ingen udgange ud over browserens egen. Samme designsystem — samme
  // tokens, samme knapper, samme typografi — men ikke samme sidestruktur.
  // Genbrug derfor ALDRIG en hel forsidesektion herinde.
  //
  // ⚠️ BACKEND-KONTRAKTEN ER UÆNDRET. Rækkefølgen submitSignup →
  // createSubscriptionSession → Reepay er den samme, samtykkerne gater stadig,
  // CVR-gaten og afventer_kort ligger stadig server-side. Det her er
  // udelukkende rækkefølge, copy og personalisering.
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <main className={"st-wrap" + (trin === 9 && !kortloes ? " st-wrap-bred" : "") + (trin >= 6 && trin <= 8 ? " st-wrap-mellem" : "")}>
      <FunnelTop />

      {/* FIRE ETAPER, ingen "trin 3 af 9" — se noten ved ETAPER. */}
      <ol className="st-etaper" aria-label={"Etape " + (etape + 1) + " af " + ETAPER.length + ": " + ETAPER[etape]}>
        {ETAPER.map((e, i) => (
          <li key={e} className={i < etape ? "gjort" : i === etape ? "nu" : ""}>
            <span className="st-etape-prik" aria-hidden="true">{i < etape ? "✓" : i + 1}</span>
            <span className="st-etape-navn">{e}</span>
          </li>
        ))}
      </ol>

      {annulleret && !fejl && (
        <div className="st-fejl">Betalingen blev afbrudt — der er ikke trukket noget. Du kan prøve igen når du vil.</div>
      )}
      {fejl && <div className="st-fejl">{fejl}</div>}

      {/* ═══════════════ SKÆRM 1 — PRE-FUNNEL + VIRKSOMHEDEN ═══════════════
          ⚠️ CVR-GATEN ER SERVER-SIDE OG URØRT. /api/cvr advarer venligt her, men
          det er signup der afviser et CVR der ikke findes. Feltet spærrer aldrig
          kunden — hun skal kunne rette og prøve igen. */}
      {trin === 1 && !bekraeftet && (
        <>
      {/* ══════════════════════════════════════════════════════════════════════
          PRE-FUNNEL — SALG TIL KOLD TRAFIK (skærm 1)

          ⚠️ HVORFOR DEN FINDES. Mange lander her direkte fra Meta uden nogensinde
          at have set birdly.dk. De kender ikke produktet, prisen, garantien eller
          os. Et bart CVR-felt beder dem om at identificere deres virksomhed for
          en tjeneste de ikke ved hvad er — og det er dét, en funnel der "ligner
          en tilmeldingsformular" koster.

          ⚠️ CVR-FELTET STÅR ØVERST, IKKE NEDERST. Trafik der kommer fra
          /kom-i-gang HAR set argumentet og skal ikke scrolle gennem det igen for
          at komme i gang. Kold trafik scroller videre og finder bevis, regnestykke
          og problem/løsning nedenunder — med en knap der fører tilbage til feltet.
          Begge grupper får den korteste vej.

          ⚠️ DEN LÅNER IKKE FORSIDENS SEKTIONER. Samme designsystem — samme
          tokens, samme knapper — men funnelens eget, kompakte formsprog (st-).
          Klistrede vi forsidens .sg-sektioner ind her, ville /start blive en
          kopi af den side kunden lige har forladt, og det er præcis dét den ikke
          må være.

          ⚠️ 2-4 MOBILSKÆRME, IKKE 20. Vi kondenserer Hyros' arkitektur; vi
          kopierer ikke deres længde.
          ══════════════════════════════════════════════════════════════════════ */}

      {/* ---- A1 · RESULTAT ---- */}
      <div className="st-pre-hero">
        <span className="st-pre-pill">Opgaver til danske virksomheder</span>
        <h1>
          {preOverskrift}
          <span className="st-pre-em">Uden selv at lede.</span>
        </h1>
        <p className="st-pre-sub">
          Birdly finder relevante private og offentlige opgaver og sender nye match
          direkte på SMS og mail.
        </p>
        <ul className="st-pre-trust">
          <li><span>✓</span> {TRIAL_DAYS} dage gratis</li>
          <li><span>✓</span> 0 kr. i dag</li>
          <li><span>✓</span> Ingen binding</li>
          <li><span>✓</span> {GARANTI.kort}</li>
        </ul>
      </div>

      {/* ---- A5 · CVR (står højt, se noten ovenfor) ---- */}
      <div className="st-kort" id="cvr-kort">
        <h2 className="st-pre-h2">Se hvad Birdly kan finde til jer.</h2>
        <p className="st-hj">
          {forvalgtLabel
            ? <>Start med CVR-nummeret. Så finder vi virksomheden og tilpasser Birdly til <b>{forvalgtLabel.toLowerCase()}</b> og jeres område.</>
            : <>Start med CVR-nummeret. Så finder vi virksomheden og tilpasser Birdly til jeres fag og område.</>}
        </p>
        <label className="st-lab" htmlFor="cvr">CVR-nummer</label>
        <input
          id="cvr" className="st-felt" inputMode="numeric" autoComplete="off" maxLength={11}
          value={cvr}
          onChange={(e) => { setCvr(e.target.value); setFirma(""); setAdresse(null); setBranchetekst(null); setBekraeftet(false); setOpslagFejl(""); }}
          onBlur={(e) => slaaOp(e.target.value)}
          placeholder="12345678"
        />
        {slaarOp && <p className="st-hj">Slår op…</p>}
        {opslagFejl && <p className="st-hj">{opslagFejl}</p>}

        <button
          className="btn btn-teal st-bred"
          onClick={async () => {
            if (cifre(cvr).length !== 8) return setFejl("Skriv et CVR-nummer på 8 cifre.");
            setFejl("");
            sporFunnel("CVRStarted");
            if (!firma) await slaaOp(cvr);
            setBekraeftet(true);
            sporFunnel("BusinessIdentified");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Find min virksomhed →
        </button>
        {/* ⚠️ SÆTNINGEN ER SAND, OG DET ER DERFOR DEN MÅ STÅ. Kortet bindes
            først på skærm 9; alt før det er opsætning og et opslag. Ændrer den
            rækkefølge sig nogensinde, skal linjen væk samme dag. */}
        <p className="st-under-knap">
          0 kr. i dag · {TRIAL_DAYS} dage gratis · I skal ikke registrere kort endnu
        </p>
      </div>

      {/* ---- A2 · ÆGTE BEVIS ----
          ⚠️ TALLET OG OPGAVERNE ER ÆGTE ELLER FRAVÆRENDE. Samme kald som
          resten af huset (preview-kandidater → birdly_match_candidates_for).
          Er der intet, står der intet — vi falder ALDRIG tilbage på en opgave
          fra et andet fag for at have noget at vise. */}
      {preBevis && preBevis.antal > 0 && (
        <div className="st-pre-sek">
          <span className="st-pre-kick">Birdly arbejder allerede</span>
          <p className="st-pre-tal">
            <b>{daTal(preBevis.antal)}</b> {preFagOrd} som Birdly holder øje med lige nu
          </p>
          {preBevis.eksempler.length > 0 && (
            <div className="st-opgaver">
              {preBevis.eksempler.slice(0, 3).map((n, i) => (
                <OpgaveKort key={i} opgave={n} />
              ))}
            </div>
          )}
          <p className="st-pre-fin">
            Det er den slags opgaver, Birdly kan holde øje med for jer.
          </p>
        </div>
      )}

      {/* ---- A3 · ØKONOMISK VÆRDI ----
          ⚠️ SAMMENLIGNING, IKKE AFKAST. To beløb ved siden af hinanden og et
          forbehold der siger rent ud at vi ikke garanterer en vundet opgave.
          Reglen bor i lib/vaerdiAnker.js — læs den før du ændrer en sætning. */}
      <div className="st-pre-sek">
        <span className="st-pre-kick">Regnestykket</span>
        <h2 className="st-pre-h2">
          {preAnker.loebende ? "Hvad er én fast kunde værd?" : "Hvad er én opgave værd?"}
        </h2>

        {/* ⚠️ SAMME EKSEMPEL SOM FORSIDEN. Scenariet og beløbene kommer fra
            STANDARD_RENGOERING i lib/vaerdiAnker.js — ét sted, alle sider. Et
            tal der skifter mellem landingssiden og funnelen får kunden til at
            holde op med at tro på begge. */}
        <div className="st-anker">
          <div className="st-anker-boks">
            {/* ⚠️ KORT BADGE I FUNNELEN, IKKE FORSIDENS LANGE.
                Ankerets kort er tre kolonner i en 520px-spalte, altså ~230px
                brede. Den fulde label ("Eksempel · Fast erhvervsrengøring") er
                ~244px og stak 14px ud over kortkanten — målt. Badget siger
                derfor kun "Eksempel" her, og selve eksemplet står som en linje
                inde i kortet. Samme oplysning, geometri der holder. */}
            <span className="st-badge">Eksempel</span>
            <div className="st-anker-navn">{preAnker.navn}</div>
            {preAnker.scenarie.length > 0 && (
              <ul className="st-scenarie">
                {preAnker.scenarie.map((linje) => <li key={linje}>{linje}</li>)}
              </ul>
            )}
            {preAnker.loebende ? (
              <>
                <div className="st-anker-tal">{preAnker.maaned}</div>
                <div className="st-anker-lig">=</div>
                <div className="st-anker-aar">{preAnker.aar}</div>
              </>
            ) : (
              <div className="st-anker-tal">{preAnker.opgave}</div>
            )}
          </div>
          <div className="st-anker-vs" aria-hidden="true">mod</div>
          <div className="st-anker-boks st-anker-pris">
            <span className="st-badge st-badge-lys">Faktisk pris</span>
            <div className="st-anker-navn">Birdly et helt år</div>
            <div className="st-anker-tal">{priceText.yearlyBare}</div>
            <div className="st-anker-aar">ekskl. moms</div>
          </div>
        </div>

        {preAnker.forhold && (
          <p className="st-anker-linje">
            {preAnker.loebende
              ? <>En aftale i den størrelse har en årlig værdi på <b>{preAnker.forhold.tekst}</b> Birdlys årspris.</>
              : <>Et helt års Birdly svarer til <b>{preAnker.andel}</b> af værdien på en opgave i den størrelse.</>}
          </p>
        )}
        {preAnker.kilde && <p className="st-forbehold">{preAnker.kilde}</p>}
        <p className="st-forbehold">{FORBEHOLD}</p>
      </div>

      {/* ---- A4 · PROBLEM → LØSNING ---- */}
      <div className="st-pre-sek">
        <span className="st-pre-kick">Problemet</span>
        <h2 className="st-pre-h2">Den opgave, I ikke ser,<br />kan I heller ikke byde på.</h2>
        <p className="st-hj">
          Muligheder ligger forskellige steder, og det meste er ikke relevant.
        </p>

        <div className="st-fix-boks">
          <span className="st-pre-kick" style={{ color: "var(--teal)" }}>Løsningen</span>
          <h3>Birdly leder. I får besked.</h3>
          <ul>
            <li><span>✓</span> Jeres fag</li>
            <li><span>✓</span> Jeres område</li>
            <li><span>✓</span> Jeres ønskede opgavestørrelse</li>
            <li><span>✓</span> Private og offentlige muligheder</li>
          </ul>
          <p>→ direkte på SMS og mail</p>
        </div>

        <button
          className="btn btn-teal st-bred"
          onClick={() => {
            const el = document.getElementById("cvr");
            if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus({ preventScroll: true }); }
          }}
        >
          Find mine opgaver →
        </button>
        <p className="st-under-knap">0 kr. i dag · {TRIAL_DAYS} dage gratis</p>
      </div>
        </>
      )}

      {trin === 1 && bekraeftet && (
        <div className="st-kort">
          <h1>Er det jer?</h1>
          {firma ? (
            <div className="st-firmakort">
              <b>{firma}</b>
              {branchetekst && <span>{branchetekst}</span>}
              {adresse && <span>{adresse}</span>}
              <span>CVR {cifre(cvr)}</span>
            </div>
          ) : (
            /* Opslaget fejlede eller fandt intet. ⚠️ VI LADER HENDE FORTSÆTTE —
               det er signup der afgør, ikke denne skærm. Se noten i slaaOp. */
            <div className="st-firmakort st-firmakort-tom">
              <b>CVR {cifre(cvr)}</b>
              <span>Vi kunne ikke hente virksomhedens navn lige nu. I kan fortsætte alligevel.</span>
            </div>
          )}
          {gaetFag && fagByKey[gaetFag] && (
            <p className="st-hj">Ser ud til at være <b>{fagByKey[gaetFag].label_da}</b>. I retter det på næste skridt.</p>
          )}
          <button className="btn btn-teal st-bred" onClick={() => { setTrin(2); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            Ja, fortsæt →
          </button>
          <button className="st-tilbage" onClick={() => setBekraeftet(false)}>Nej, søg igen</button>
        </div>
      )}

      {/* ═══════════════ SKÆRM 2 — HVORDAN FINDER I OPGAVER I DAG ═══════════════
          ⚠️ DIAGNOSE, IKKE ET KRITERIUM. Svaret sendes ikke til signup og påvirker
          ikke matchning med et komma. Det gør to ting: det får kunden til at sætte
          ord på sin egen situation, og det lader os svare på præcis den situation
          med én sætning.
          ⚠️ INGEN ANGREB PÅ KONKURRENTER. Svaret til "vi bruger allerede en anden
          tjeneste" siger at Birdly ikke behøver erstatte den. Det er både sandt og
          stærkere end at tale nogen ned. */}
      {trin === 2 && (
        <div className="st-kort">
          <h1>Hvordan finder I typisk nye opgaver i dag?</h1>
          <p className="st-hj">Så kan Birdly vise, hvor vi faktisk kan gøre en forskel.</p>

          <div className="st-valgkort">
            {METODER.map((m) => (
              <button
                key={m.key}
                type="button"
                className={"st-valgkort-item" + (metode === m.key ? " on" : "")}
                aria-pressed={metode === m.key}
                onClick={() => { setMetode(m.key); sporFunnel("CurrentMethodSelected", { metode: m.key }); }}
              >
                <b>{m.titel}</b>
                {m.under && <i>{m.under}</i>}
              </button>
            ))}
          </div>

          {metode && <p className="st-svar">{METODER.find((m) => m.key === metode)?.svar}</p>}

          <button
            className="btn btn-teal st-bred"
            disabled={!metode}
            onClick={() => { setTrin(3); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          >
            Fortsæt →
          </button>
          <button className="st-tilbage" onClick={() => setTrin(1)}>← Tilbage</button>
        </div>
      )}

      {/* ═══════════════ SKÆRM 3 — HVILKE OPGAVER ═══════════════
          Fag + arbejdsområder + bredde. ⚠️ DET ER DE ÆGTE MATCHKRITERIER:
          fag_keys og cpv_selections går til match-reglen. Datakilden er
          katalogets fag.smal — ingen opfundne kategorier. */}
      {trin === 3 && (
        <div className="st-kort">
          <h1>Hvilke opgaver vil I gerne have flere af?</h1>
          <p className="st-hj">Vælg ét eller flere fag. I kan altid ændre det bagefter.</p>

          <span className="st-lab">Jeres brancher</span>
          {fagValgt.length > 0 && (
            <div className="st-chips">
              {fagValgt.map((k) => (
                <span className="st-chip" key={k}>
                  {fagByKey[k]?.label_da || k}
                  <button
                    type="button"
                    aria-label={"Fjern " + (fagByKey[k]?.label_da || k)}
                    onClick={() => setFagValgt((s) => s.filter((x) => x !== k))}
                  >×</button>
                </span>
              ))}
            </div>
          )}
          <select
            className="st-felt"
            value=""
            onChange={(e) => {
              const v = e.target.value;
              if (v && !fagValgt.includes(v)) setFagValgt((s) => [...s, v]);
            }}
          >
            <option value="">
              {fagValgt.length ? "+ Tilføj en branche mere…" : "Vælg jeres branche…"}
            </option>
            {fagListe.filter((f) => !fagValgt.includes(f.key)).map((f) => (
              <option key={f.key} value={f.key}>{f.label_da}</option>
            ))}
          </select>
          {fagValgt.length > 1 && (
            <p className="st-hj">Vi holder øje med opgaver i alle {fagValgt.length} brancher.</p>
          )}

          {/* ⚠️ BREDDE ØVERST OG ALDRIG FOLDET. Det er den beslutning der flytter
              mest: med "alle" lægges fagets brede kode på, og den alene rammer 79
              opgaver for entreprenør — uanset hvor få områder der er krydset af.
              Målt: kun betonarbejder + "alle" giver 79, + "kun fag" giver 2. */}
          {fagValgt.length > 0 && (
            <div className="st-bredde">
              <span className="st-lab" style={{ margin: "0 0 8px" }}>Hvor bredt vil I fange opgaver?</span>
              <label className={"st-radio" + (bredde === "alle" ? " on" : "")}>
                <input type="radio" name="bredde" checked={bredde === "alle"} onChange={() => setBredde("alle")} />
                <span><b>Maksimér antallet af opgaver <em>anbefalet</em></b><i>Også de brede entrepriseudbud i jeres fag. Flere match, lidt mere bredt.</i></span>
              </label>
              <label className={"st-radio" + (bredde === "fag" ? " on" : "")}>
                <input type="radio" name="bredde" checked={bredde === "fag"} onChange={() => setBredde("fag")} />
                <span><b>Kun fagentrepriser</b><i>Færre, men kun de præcise områder I har valgt.</i></span>
              </label>
            </div>
          )}

          {omraader.length > 0 ? (
            <div className="st-fold">
              <button
                type="button"
                className={"st-foldknap" + (antalValgt === 0 ? " tom" : "")}
                onClick={() => setAabenOmr((v) => !v)}
                aria-expanded={aabenOmr}
              >
                <span>{omrResume}</span>
                <i>{aabenOmr ? "skjul" : "ret"}</i>
              </button>

              {/* ⚠️ FOLDNING ÆNDRER KUN SYNLIGHED. Afkrydsningerne bor i
                  omraadeValg på komponenten, ikke i disse felter — foldes listen
                  væk, står de valgte områder uændret, og fagKoder (og dermed den
                  effektive CPV-liste) er den samme som hvis listen var åben. */}
              {aabenOmr && (
                <>
                  <div className="st-omrhoved">
                    <span className="st-lab" style={{ margin: 0 }}>Dine arbejdsområder</span>
                    <button type="button" className="st-alle" onClick={() => saetAlle(!alleValgt)}>
                      {alleValgt ? "Fjern alle" : "Tag alle " + (valgtFag?.label_da || "områder") + " med"}
                    </button>
                  </div>
                  <div className="st-omr">
                    {omraader.map((a) => (
                      <label key={a.cpv} className={"st-omrk" + (omraadeValg[a.cpv] ? " on" : "")}>
                        <input
                          type="checkbox"
                          checked={!!omraadeValg[a.cpv]}
                          onChange={() => setOmraadeValg((s) => ({ ...s, [a.cpv]: !s[a.cpv] }))}
                        />
                        <span>
                          <b>{a.kunde_titel || a.name_da}</b>
                          {a.name_da && a.kunde_titel && a.name_da !== a.kunde_titel && <i>{a.name_da}</i>}
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : fagValgt.length > 0 ? (
            <p className="st-hj">Dit fag har ingen underområder — I matches på fagets brede koder.</p>
          ) : null}

          <button
            className="btn btn-teal st-bred"
            onClick={() => {
              if (!fagValgt.length) return setFejl("Vælg mindst én branche.");
              setFejl(""); setTrin(4); window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Fortsæt →
          </button>
          <button className="st-tilbage" onClick={() => setTrin(2)}>← Tilbage</button>
        </div>
      )}

      {/* ═══════════════ SKÆRM 4 — OMRÅDE ═══════════════
          ⚠️ SAMME GEOGRAFI SOM PRODUKTET HAR. Landsdelene kommer fra kataloget
          (region_nuts_map), og "hele_dk" er sin EGEN nøgle — ikke en optælling af
          de fem. Der er ikke opfundet hverken kommuner eller radius: findes det
          ikke i matchningen, spørger vi ikke om det. */}
      {trin === 4 && (
        <div className="st-kort">
          <h1>Hvor vil I have opgaver?</h1>
          <p className="st-hj">Vælg hele landet eller de landsdele, I dækker.</p>

          <div className="st-omr">
            <label className={"st-omrk" + (heleDk ? " on" : "")}>
              <input
                type="checkbox"
                checked={heleDk}
                onChange={() => { setHeleDk(true); setRegionValg({}); }}
              />
              <span><b>Hele Danmark</b><i>Få opgaver fra hele Danmark. Prisen ændrer sig ikke.</i></span>
            </label>
            {regionListe.map((r) => (
              <label key={r.key} className={"st-omrk" + (!heleDk && regionValg[r.key] ? " on" : "")}>
                <input
                  type="checkbox"
                  checked={!heleDk && !!regionValg[r.key]}
                  onChange={() => toggleRegion(r.key)}
                />
                <span><b>{r.label_da}</b></span>
              </label>
            ))}
          </div>
          {!heleDk && valgteRegioner.length > 1 && (
            <p className="st-hj">Vi holder øje i alle {valgteRegioner.length} landsdele: {regionResume}.</p>
          )}

          {/* ═══ OFFENTLIGE OG PRIVATE OPGAVER ═══
              ⚠️ DET ER OPLYSNING, IKKE ET VALG — OG DET ER MED VILJE.
              wants_private_opgaver står på `true` som standard i basen
              (birdly-admin, migration 0090), og signup tager IKKE imod feltet:
              fravalget sker bagefter under "Rediger" på kundens opgaveside.
              En vælger her ville derfor være en knap der ikke gør noget — værre
              end ingen knap, fordi kunden tror hun har taget stilling.
              ⚠️ ORDLYDEN ER JONAS' OG STÅR ORDRET. Den er oplysningspligten der
              holder opt-out-modellen lovlig; skriv den ikke om. */}
          <div className="st-info">
            <b>I får både offentlige og private opgaver</b>
            <p>
              Din overvågning inkluderer både offentlige udbud og private opgaver i dit
              fag og område. Du kan til enhver tid fravælge private opgaver under
              &ldquo;Rediger&rdquo; på din opgaveside.
            </p>
          </div>

          <button
            className="btn btn-teal st-bred"
            onClick={() => {
              if (!regionKeys.length) return setFejl("Vælg mindst én landsdel — eller hele Danmark.");
              setFejl(""); setTrin(5); window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Fortsæt →
          </button>
          <button className="st-tilbage" onClick={() => setTrin(3)}>← Tilbage</button>
        </div>
      )}

      {/* ═══════════════ SKÆRM 5 — VÆRDI ═══════════════
          ⚠️ TO FORSKELLIGE SPØRGSMÅL, OG DE GØR IKKE DET SAMME:
            · PROJEKTFAG (tømrer, VVS, entreprenør …): svaret ER kundens
              max_amount og går til match-reglen. Det filtrerer.
            · LØBENDE FAG (rengøring, service …): svaret er UDELUKKENDE ankeret
              vi regner sammenligningen på. Det sendes ikke til signup og
              filtrerer intet — en månedlig aftaleværdi er ikke det samme som en
              udbudssum, og at bruge den som beløbsfilter ville skære opgaver væk
              på et tal kunden troede var en illustration.
          Se lib/vaerdiAnker.js. Blandes de to sammen, filtrerer vi forkert. */}
      {trin === 5 && (
        <div className="st-kort">
          {loebendeFag ? (
            <>
              <h1>Hvad er en god fast kunde værd for jer pr. måned?</h1>
              <p className="st-hj">Det bruger vi kun til at vise jer regnestykket bagefter.</p>
            </>
          ) : (
            <>
              <h1>Hvilken størrelse opgaver er interessante?</h1>
              <p className="st-hj">Så sorterer Birdly de opgaver fra, der er for store eller for små.</p>
            </>
          )}

          <div className="st-valgkort st-valgkort-2">
            {vaerdiListe.map((v) => (
              <button
                key={v.key}
                type="button"
                className={"st-valgkort-item" + (vaerdiValg === v.key ? " on" : "")}
                aria-pressed={vaerdiValg === v.key}
                onClick={() => {
                  setVaerdiValg(v.key);
                  // ⚠️ KUN PROJEKTFAG SÆTTER max_amount. Se noten ovenfor.
                  if (!loebendeFag) setMaks(v.maks == null ? "" : String(v.maks));
                }}
              >
                <b>{v.label}</b>
              </button>
            ))}
          </div>

          {/* ⚠️ §3.5-ADVARSLEN. Handelsbetingelserne undtager matchgarantien hvis
              kunden afgrænser opgavestørrelsen til under 2,5 mio. kr. Vælger hun
              et snævert loft, skal hun kunne se det HER — ikke opdage det den dag
              hun beder om refusion. */}
          {!loebendeFag && vaerdiValg && vaerdiListe.find((v) => v.key === vaerdiValg)?.garantiUndtaget && (
            <p className="st-advarsel">
              Bemærk: vælger I et loft under 2,5 mio. kr., gælder matchgarantien ikke.
              I kan stadig bruge Birdly på helt normale vilkår.{" "}
              <a href={GARANTI_LINK} target="_blank" rel="noreferrer">Se betingelserne</a>
            </p>
          )}

          <button
            className="btn btn-teal st-bred"
            disabled={!vaerdiValg}
            onClick={tilResultat}
          >
            Find mine opgaver →
          </button>
          <button className="st-tilbage" onClick={() => setTrin(4)}>← Tilbage</button>
        </div>
      )}

      {/* ═══════════════ SKÆRM 6 — BIRDLY SCAN ═══════════════
          ⚠️ OVERGANGEN LYVER IKKE. Der står præcis hvad vi slår op på, og de tre
          flueben er kundens EGNE valg. Ingen "scanner 4 millioner databaser",
          ingen AI-animation. Opslaget tager reelt et øjeblik, og det er dét
          øjeblik der vises — se noten ved tilResultat(). */}
      {trin === 6 && (scanner || henter) && (
        <div className="st-kort st-scan">
          <div className="st-scan-ring" aria-hidden="true" />
          <h1>Birdly leder efter opgaver, der matcher jer…</h1>
          <ul className="st-scan-liste">
            <li><span>✓</span> Fag: {fagResume || "valgt"}</li>
            <li><span>✓</span> Område: {regionResume || "valgt"}</li>
            <li><span>✓</span> Størrelse: {vaerdiLabel || "valgt"}</li>
          </ul>
        </div>
      )}

      {trin === 6 && !scanner && !henter && (
        <div className="st-kort st-resultat">
          {harMatch ? (
            <>
              <h1>Vi fandt opgaver, der passer til jer.</h1>
              <p className="st-kontekst">{kontekstLinje}</p>

              {/* ⚠️ TALLET ER MATCHMOTORENS EGET. kandidater.i_omraade kommer fra
                  preview-kandidater, som kalder birdly_match_candidates_for —
                  altså selve match-reglen. Det er samme tal kunden bagefter
                  matches på, ikke et estimat. */}
              <div className="st-res">
                <b>{kandidater.i_omraade}</b>
                <span>
                  {kandidater.i_omraade === 1 ? "aktiv mulighed matcher" : "aktive muligheder matcher"} jeres valg
                </span>
              </div>

              {/* ⚠️ ÆGTE OPGAVER, ELLER INGEN KORT. Kortene kommer fra det SAMME
                  kandidatsæt som tallet — ikke fra en anden forespørgsel, og
                  aldrig fra et andet fag eller en anden landsdel. Mangler
                  eksemplerne (den additive udgave af preview-kandidater er ikke
                  rullet ud endnu), viser vi tallet uden kort. Vi fylder ALDRIG
                  hullet med noget irrelevant. */}
              {eksempler.length > 0 && (
                <div className="st-opgaver">
                  {eksempler.map((n, i) => (
                    <OpgaveKort key={i} opgave={n} omraade={regionResume} />
                  ))}
                </div>
              )}

              <p className="st-bevis-tekst">
                Det er den slags opgaver, Birdly kan holde øje med for jer. I skal ikke
                selv finde dem — når en ny mulighed matcher, får I den direkte på SMS og mail.
              </p>

              <button className="btn btn-teal st-bred" onClick={() => { sporFunnel("ValueAnchorViewed"); setTrin(7); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                Ja — hold øje for mig →
              </button>
            </>
          ) : (
            /* ⚠️ NUL ER ET LOVLIGT SVAR, OG VI PYNTER IKKE PÅ DET. Et nichefag i
               en stille uge har legitimt 0. Vi opfinder ingen kort, og vi viser
               ALDRIG landstallet som om det lå i kundens område — men vi nævner
               det som dét det er, hvis der er noget. */
            <>
              <h1>Der er ingen aktive opgaver, der matcher præcis lige nu.</h1>
              <p className="st-hj">
                Det er netop derfor Birdly holder øje. Når en relevant mulighed dukker op,
                får I besked på SMS og mail.
              </p>
              {kandidater?.paa_landsplan > 0 && (
                <p className="st-hj">
                  Der er <b>{kandidater.paa_landsplan}</b> i jeres fag på landsplan — prøv
                  eventuelt at udvide området.
                </p>
              )}
              <button className="btn btn-teal st-bred" onClick={() => { sporFunnel("ValueAnchorViewed"); setTrin(7); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                Start overvågning →
              </button>
              <button className="btn btn-ghost st-bred" onClick={() => setTrin(4)}>Udvid mine kriterier</button>
            </>
          )}
          <button className="st-tilbage" onClick={() => setTrin(5)}>← Tilbage</button>
        </div>
      )}

      {/* ═══════════════ SKÆRM 7 — VÆRDI, OPSUMMERING OG RISIKO ═══════════════
          ⚠️ SAMMENLIGNING, IKKE AFKAST. Vi stiller to beløb op mod hinanden og
          skriver rent ud at vi ikke garanterer en vundet opgave. Reglen og alle
          tal bor i lib/vaerdiAnker.js — læs noten dér før du ændrer en sætning.
          Der må ALDRIG stå "Birdly giver X× igen" eller "du tjener pengene hjem". */}
      {trin === 7 && (
        <div className="st-kort">
          <h1>{anker.loebende ? "Hvad er én fast aftale værd?" : "Hvad er én opgave værd?"}</h1>

          <div className="st-anker">
            <div className="st-anker-boks">
              {/* ⚠️ HER ER TALLET KUNDENS EGET, ikke husets standard-eksempel:
                  hun har selv valgt intervallet på skærm 5. Derfor står der
                  "Eksempel" og ikke scenariet med kontoret i København — vi ved
                  intet om hendes lokaler. Se byggAnker i lib/vaerdiAnker.js. */}
              <span className="st-badge">{anker.maerkat}</span>
              {anker.loebende ? (
                <>
                  <div className="st-anker-navn">En aftale på</div>
                  <div className="st-anker-tal">{anker.maaned}</div>
                  <div className="st-anker-lig">=</div>
                  <div className="st-anker-aar">{anker.aar}</div>
                </>
              ) : (
                <>
                  <div className="st-anker-navn">En opgave til</div>
                  <div className="st-anker-tal">{anker.opgave}</div>
                </>
              )}
            </div>
            <div className="st-anker-vs" aria-hidden="true">mod</div>
            <div className="st-anker-boks st-anker-pris">
              <span className="st-badge st-badge-lys">Faktisk pris</span>
              <div className="st-anker-navn">Birdly et helt år</div>
              <div className="st-anker-tal">{priceText.yearlyBare}</div>
              <div className="st-anker-aar">ekskl. moms</div>
            </div>
          </div>

          {anker.forhold && (
            <p className="st-anker-linje">
              {anker.loebende
                ? <>En aftale i den størrelse har en årlig værdi på <b>{anker.forhold.tekst}</b> Birdlys årspris.</>
                : <>Et helt års Birdly svarer til <b>{anker.andel}</b> af værdien på en opgave i den størrelse.</>}
            </p>
          )}

          {/* ⚠️ FORBEHOLDET ER OBLIGATORISK OG STÅR LIGE UNDER TALLET. Uden det
              læses forholdet som et løfte om udbytte. Flyt det aldrig ned under
              knappen, og gør det aldrig mindre end her. */}
          <p className="st-forbehold">{FORBEHOLD}</p>
          <p className="st-hj">{BETINGET_LINJE}</p>

          {/* ═══ DET HAR I FORTALT OS ═══ */}
          <div className="st-opsum">
            <h2>Det har I fortalt os</h2>
            <dl>
              {firma && <div><dt>Virksomhed</dt><dd>{firma}</dd></div>}
              {metode && <div><dt>Finder opgaver i dag</dt><dd>{METODER.find((m) => m.key === metode)?.titel}</dd></div>}
              {fagResume && <div><dt>Leder efter</dt><dd>{fagResume}</dd></div>}
              {regionResume && <div><dt>Område</dt><dd>{regionResume}</dd></div>}
              {vaerdiLabel && <div><dt>{loebendeFag ? "Værdi pr. måned" : "Opgavestørrelse"}</dt><dd>{vaerdiLabel}</dd></div>}
              <div><dt>Opgavetyper</dt><dd>Offentlige + private</dd></div>
              {harMatch && <div><dt>Aktive match</dt><dd>{kandidater.i_omraade}</dd></div>}
            </dl>
            <p className="st-opsum-fin">Birdly holder øje med det her automatisk.</p>
          </div>

          {/* ═══ RISIKOEN ═══ */}
          <div className="st-risiko">
            <span className="st-risiko-kick">Prøv det først</span>
            <div className="st-risiko-tal">0 kr. i dag</div>
            <ul>
              <li><span>✓</span> {TRIAL_DAYS} dage gratis</li>
              <li><span>✓</span> Ingen binding</li>
              <li><span>✓</span> Ingen portal</li>
              <li><span>✓</span> {GARANTI.kort}</li>
            </ul>
            <p className="st-risiko-fin">
              {GARANTI.praecis} {GARANTI.forbehold}{" "}
              <a href={GARANTI_LINK} target="_blank" rel="noreferrer">{GARANTI.linkTekst}</a>
            </p>
          </div>

          <button className="btn btn-teal st-bred" onClick={() => { setTrin(8); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            Vælg plan →
          </button>
          <button className="st-tilbage" onClick={() => setTrin(6)}>← Tilbage</button>
        </div>
      )}

      {/* ═══════════════ SKÆRM 8 — PLAN, KONTAKT OG SAMTYKKER ═══════════════
          ⚠️ HER LIGGER SIGNUP-KALDET, OG RÆKKEFØLGEN ER URØRLIG:
          submitSignup → createSubscriptionSession → kortvindue. Knappen kalder
          det EKSISTERENDE tilBetaling(), som har alle værn: dublet-CVR/telefon,
          nul-dækning, betal-straks ved opbrugt prøve, og de to samtykker.
          Byg aldrig en genvej udenom.
          ⚠️ SAMTYKKERNE ER PÅKRÆVEDE HER. Trin 4 opretter kunden med
          terms_accepted: true — fjernes krydset her, registrerer vi en accept
          hun ikke har givet. */}
      {trin === 8 && (
        <div className="st-kort">
          <h1>Lad Birdly holde øje for jer.</h1>

          <div className="st-plan-hero">
            <span className="st-plan-badge">Bedst værdi</span>
            <div className="st-plan-navn">Årligt abonnement</div>
            <div className="st-plan-pris">{priceText.yearly}</div>
            <div className="st-plan-under">ekskl. moms · ca. {prMaaned} kr./md.</div>
            <div className="st-plan-spar">
              Betal for 10 måneder — få 12. Spar {YEARLY_SAVING.amount.toLocaleString("da-DK")} kr.
            </div>
            <ul className="st-plan-liste">
              <li><span>✓</span> {TRIAL_DAYS} dage gratis</li>
              <li><span>✓</span> Offentlige + private opgaver</li>
              <li><span>✓</span> SMS + mail ved match</li>
              <li><span>✓</span> Jeres egne kriterier</li>
              <li><span>✓</span> {GARANTI.kort}</li>
              <li><span>✓</span> Ingen binding</li>
            </ul>
          </div>

          {/* ⚠️ MÅNEDEN SKJULES ALDRIG. Året er anbefalingen, men en kunde der vil
              betale månedligt skal kunne se det uden at lede. Ingen mørke mønstre. */}
          <div className="st-maanedsvalg">
            <span>Foretrækker I månedlig betaling?</span>
            <button
              type="button"
              className={"st-maanedsknap" + (interval === "monthly" ? " on" : "")}
              aria-pressed={interval === "monthly"}
              onClick={() => { setInterval_(interval === "monthly" ? "yearly" : "monthly"); sporFunnel("PlanSelected", { interval: interval === "monthly" ? "yearly" : "monthly" }); }}
            >
              {interval === "monthly"
                ? "Månedsbetaling valgt — " + priceText.monthly
                : "Vælg månedsbetaling — " + priceText.monthly}
            </button>
          </div>

          <span className="st-lab" style={{ marginTop: 26 }}>Hvor skal beskederne sendes hen?</span>

          <label className="st-lab" htmlFor="navn">Navn</label>
          <input id="navn" className="st-felt" value={navn} onChange={(e) => setNavn(e.target.value)} autoComplete="name" />

          <label className="st-lab" htmlFor="mail">E-mail</label>
          <input id="mail" className="st-felt" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />

          <label className="st-lab" htmlFor="tlf">Mobilnummer <span className="st-valgfri">(det er her beskeden lander)</span></label>
          <input id="tlf" className="st-felt" inputMode="tel" value={tlf} onChange={(e) => setTlf(e.target.value)} autoComplete="tel" placeholder="12 34 56 78" />

          {/* ⚠️ OPLYSNINGSPLIGT, IKKE ET SAMTYKKE — og derfor bevidst IKKE et
              flueben. Nye kunder får wants_private_opgaver = true som standard
              (migration 0090). Opt-out-modellen holder kun hvis kunden ER blevet
              oplyst. Et flueben her ville gøre det til et tilvalg igen og vende
              hele modellen tilbage til opt-in.
              ⚠️ ORDLYDEN ER JONAS' OG ER INDSAT ORDRET. Skriv den ikke om. */}
          <p className="st-hj" style={{ marginTop: 18 }}>
            Din overvågning inkluderer både offentlige udbud og private opgaver i dit
            fag og område. Du kan til enhver tid fravælge private opgaver under
            &ldquo;Rediger&rdquo; på din opgaveside.
          </p>

          {/* ⚠️ TO SEPARATE SAMTYKKER (Clearhaus-krav). Handelsbetingelser og
              abonnementsbetingelser skal accepteres hver for sig. Begge er
              PÅKRÆVEDE og gater knappen nedenfor. */}
          <label className="st-tjek">
            <input type="checkbox" checked={betingelser} onChange={(e) => setBetingelser(e.target.checked)} />
            <span>Jeg accepterer <a href="/handelsbetingelser" target="_blank" rel="noreferrer">handelsbetingelserne</a> og <a href="/privatlivspolitik" target="_blank" rel="noreferrer">privatlivspolitikken</a>.</span>
          </label>

          <label className="st-tjek">
            <input type="checkbox" checked={abonnement} onChange={(e) => setAbonnement(e.target.checked)} />
            <span>Jeg accepterer <a href="/abonnementsbetingelser" target="_blank" rel="noreferrer">abonnementsbetingelserne</a> — herunder at abonnementet fornyes automatisk, og at mit betalingskort gemmes hos vores betalingsudbyder, indtil jeg siger op.</span>
          </label>

          <button className="btn btn-teal st-bred" onClick={tilBetaling} disabled={arbejder}>
            {arbejder ? "Et øjeblik…" : "Start min overvågning →"}
          </button>
          <p className="st-under-knap">0 kr. trækkes i dag · {TRIAL_DAYS} dage gratis · opsig gratis inden</p>
          <button className="st-tilbage" onClick={() => setTrin(7)}>← Tilbage</button>
        </div>
      )}

      {trin === 9 && kortloes && (
        <div className="st-kort st-kvit">
          <div className="st-ic">✓</div>
          <h1>Velkommen til Birdly!</h1>
          <p className="st-hj">
            Du er i gang — helt gratis de næste {TRIAL_DAYS} dage. Vi scanner hele Danmark to gange
            i døgnet og sender dig besked på SMS og mail, så snart der er en opgave, der passer til jer.
          </p>
          <div className="st-note">
            <b>Sådan fortsætter du efter prøven</b>
            <p>
              2 dage før din prøve udløber sender vi dig et betalingslink på SMS og mail. Vil du
              fortsætte, tilføjer du bare dit kort med ét klik — vil du ikke, sker der ingenting,
              og du bliver ikke opkrævet.
            </p>
          </div>
        </div>
      )}

      {trin === 9 && !kortloes && (
        /* ══════════════════════════════════════════════════════════════════════
           CHECKOUT I TO KOLONNER (03-09-2026). Venstre = handlingen, højre =
           konteksten. På mobil stables de, og de to lange infobokse foldes
           sammen — se .ck-acc i start.css.

           ⚠️ TEKSTERNE ER UÆNDREDE. Ordlyden om sælger, ydelse, betaling,
           fornyelse og opsigelse skal stemme ORDRET med
           /checkout-forhaandsvisning, som Clearhaus har fået forelagt. Kun
           layoutet er nyt; ændrer du en formulering her, skal den anden side
           følge med.

           ⚠️ INGEN "DINE OPLYSNINGER"-FELTER. Mockup'en viser mail og telefon
           som inputs, men på trin 5 ER tilmeldingen allerede sendt (trin 4
           opretter kunden). Redigerbare felter her ville se ud som om de kunne
           ændre noget — og de kunne ikke.
           ══════════════════════════════════════════════════════════════════════ */
        <div className="ck-wrap">

          {/* ─────────────────────────── VENSTRE: handlingen ─────────────────── */}
          <section className="ck-panel ck-action">
            <h1>Færdiggør din tilmelding</h1>
            <p className="ck-sub">
              {udenProeve
                ? <>Abonnementet starter i dag · <b>{pris} ekskl. moms</b></>
                : <>{TRIAL_DAYS} dages gratis prøve · du betaler <b>0 kr. i dag</b></>}
            </p>

            <span className="ck-label">Vælg abonnement</span>
            {/* ⚠️ PRISEN STÅR PÅ BEGGE KORT. "0 kr. i dag" er hovedbudskabet, men
                det svarer ikke på hvad det koster BAGEFTER — og det er dét man
                vælger imellem.
                ⚠️ Tallene kommer fra priceText, aldrig skrevet i hånden. Præcis den
                hardkodning efterlod tre steder med den gamle pris (CLAUDE.md). */}
            <div className="ck-plans">
              {[
                // ⚠️ BART BELØB HER, ikke priceText. priceText.monthly ER "499 kr./md."
                // — sat sammen med enheden nedenfor blev der "499 kr./md. /md. ekskl.
                // moms" på skærmen. Tallet kommer stadig fra pakke.js, aldrig fra hånden.
                // ⚠️ NOTEN PÅ ÅRSKORTET SIGER NU HVAD BESPARELSEN ER, ikke bare at
                // den findes. "spar ~17 %" er en procent man skal regne på; "betal
                // for 10 mdr. — få 12" er det samme tal som en sætning man kan
                // forstå på et halvt sekund. Det er bogstaveligt sandt: 4.990 ÷ 499
                // er præcis 10. Månedsprisen ved årsbetaling regnes af PLAN, aldrig
                // skrevet i hånden.
                ["monthly", "Måned", `${PLAN.monthly.toLocaleString("da-DK")} kr.`, "/md. ekskl. moms", "ingen binding"],
                ["yearly", "År", `${PLAN.yearly.toLocaleString("da-DK")} kr.`, "/år ekskl. moms",
                  `betal for 10 mdr. — få 12 · ca. ${Math.round(PLAN.yearly / 12).toLocaleString("da-DK")} kr./md.`],
              ].map(([k, l, beloeb, enhed, note]) => (
                <button
                  key={k}
                  type="button"
                  className={"ck-plan" + (interval === k ? " on" : "")}
                  onClick={() => skiftInterval(k)}
                  aria-pressed={interval === k}
                >
                  {/* ⚠️ ALDRIG disabled. Låsen var netop fejlen: knapperne stod
                      `disabled={arbejder}`, og da `arbejder` hang fast, var
                      planvalget dødt. Et skift der tager tid får en tekst. */}
                  <span className="ck-p-top">
                    <span className="ck-p-name">{l}</span>
                    {interval === k && <span className="ck-tick">✓</span>}
                  </span>
                  <span className="ck-p-linje">
                    <span className="ck-p-price">{beloeb}</span>{" "}
                    <span className="ck-p-unit">{enhed}</span>
                  </span>
                  <span className="ck-p-note">{skifter === k ? "skifter…" : note}</span>
                </button>
              ))}
            </div>

            <span className="ck-label">Betaling</span>
            {/* ⚠️ WALLETS OG KORTFELTER TEGNES AF REEPAY, ikke af os. Hvilke der
                vises afhænger af enhed, browser og hvad der er slået til på
                kontoen — Apple Pay findes fx kun på Apple-enheder. Byggede vi
                vores egne knapper, ville vi tilbyde noget kunden ikke kan bruge. */}
            <p className="ck-betalingshint">
              Kort, Apple&nbsp;Pay, Google&nbsp;Pay og MobilePay — du sendes til
              Reepays sikre betalingsside, når du trykker nedenfor.
            </p>

            {/* ⚠️ SAMME STATE SOM TRIN 4, ikke en ny afkrydsning. `betingelser` og
                `abonnement` er de samme variabler, så fluebenene står afkrydsede
                når hun når hertil: INGEN ekstra friktion.
                ⚠️ IKKE FLYTTET FRA TRIN 4 — GENTAGET. Trin 4 opretter kunden med
                terms_accepted: true og starter prøveperioden; fjernede vi krydset
                dér, ville vi registrere en accept hun ikke havde givet. */}
            <label className="st-tjek">
              <input type="checkbox" checked={betingelser} onChange={(e) => setBetingelser(e.target.checked)} />
              <span>Jeg accepterer <a href="/handelsbetingelser" target="_blank" rel="noreferrer">handelsbetingelserne</a> og <a href="/privatlivspolitik" target="_blank" rel="noreferrer">privatlivspolitikken</a>.</span>
            </label>
            <label className="st-tjek">
              <input type="checkbox" checked={abonnement} onChange={(e) => setAbonnement(e.target.checked)} />
              <span>Jeg accepterer <a href="/abonnementsbetingelser" target="_blank" rel="noreferrer">abonnementsbetingelserne</a> — herunder at abonnementet fornyes automatisk, og at mit betalingskort gemmes hos vores betalingsudbyder, indtil jeg siger op.</span>
            </label>

            <button className="ck-cta" onClick={aabnBetaling} disabled={!sessionId || arbejder}>
              {skifter ? "Skifter plan…" : arbejder ? "Et øjeblik…"
                : udenProeve ? "Gå til betaling" : `Start ${TRIAL_DAYS} dages gratis prøve`}
            </button>

            {!udenProeve && (
              <div className="ck-reassure">
                {/* ⚠️ FØRSTE TO SÆTNINGER ER UÆNDREDE. De skal stemme med
                    /checkout-forhaandsvisning, som Clearhaus har fået forelagt.
                    Kun den sidste er ny, og den påstår intet nyt: at man kan
                    opsige inden prøven udløber uden at betale, følger direkte af
                    "0 kr. i dag" og af abonnementsbetingelserne. */}
                <b>0 kr. trækkes i dag.</b> Første betaling sker efter prøveperioden —
                vi minder dig 3 dage før. Du kan sige op gratis inden.
              </div>
            )}

            {/* 1 — SÆLGER (Clearhaus). Kortindehaveren skal kunne se HVEM hun betaler,
                dér hvor beslutningen træffes. */}
            <div className="ck-saelger">
              <b>Birdly.dk</b>
              CVR 35764283 · Fjordvej 4, 4300 Holbæk, Danmark<br />
              support@birdly.dk
            </div>
          </section>

          {/* ─────────────────────────── HØJRE: konteksten ───────────────────── */}
          <aside className="ck-info">

            {/* 2 — HVAD HUN KØBER. */}
            <details className="ck-card ck-acc">
              <summary><span className="ck-ic">📋</span> Hvad abonnementet giver adgang til <span className="ck-chev">▾</span></summary>
              <div className="ck-acc-body">
                <p>
                  Birdly overvåger danske offentlige udbud og sender dig besked, når der er en
                  opgave, der passer til dit fag, dit område og din opgavestørrelse. Du får
                  beskeder på SMS og e-mail, adgang til din personlige opgaveliste med alle dine
                  matches, og en bud-skabelon til de opgaver, du vil byde på.
                </p>
                <p className="ck-fin">Digital abonnementstjeneste. Leveres straks ved oprettelse.</p>
              </div>
            </details>

            {/* 3, 6 og 7 — STARTDATO + VARIGHED, FREKVENS, OPSIGELSE.
                ⚠️ Pris OG frekvens følger den valgte plan. Skifter hun til månedlig,
                skifter både beløbet og "hver måned" med — ellers ville teksten love
                noget andet end knappen ved siden af. */}
            <details className="ck-card ck-acc">
              <summary><span className="ck-ic">💳</span> Sådan fungerer betalingen <span className="ck-chev">▾</span></summary>
              <div className="ck-acc-body">
                {udenProeve ? (
                  <p>
                    Abonnementet starter <b>i dag</b> og fornyes automatisk til <b>{pris} ekskl. moms</b>{" "}
                    {interval === "yearly" ? "hvert år" : "hver måned"}, <b>indtil du opsiger</b>. Du kan
                    til enhver tid opsige med virkning fra næste betalingsperiode.
                  </p>
                ) : (
                  <p>
                    Abonnementet starter <b>i dag</b> med <b>{TRIAL_DAYS} dages gratis prøveperiode</b>.
                    Du betaler <b>0 kr. i dag</b>. 3 dage før prøveperioden udløber, sender vi dig en
                    påmindelse. Herefter fortsætter medlemskabet automatisk til <b>{pris} ekskl. moms</b>{" "}
                    og fornyes løbende {interval === "yearly" ? "hvert år" : "hver måned"},{" "}
                    <b>indtil du opsiger</b>. Du kan til enhver tid opsige med virkning fra næste
                    betalingsperiode.
                  </p>
                )}
                {/* ⚠️ FORTRYDELSESRET OG REFUSION STÅR I HVER SIT DOKUMENT — refusion i
                    abonnementsbetingelserne §4.4, fortrydelsesretten i handelsbetingelserne
                    §1.3. Derfor links til BEGGE. "Ingen fortrydelsesret" står positivt: det
                    er ikke en mangel, men et faktum om aftaletypen (B2B). */}
                <p className="ck-fin">
                  Birdly sælges udelukkende til erhvervsdrivende. Da der er tale om et erhvervskøb,
                  gælder der ingen forbrugerfortrydelsesret. En abonnementsperiode, der allerede er
                  påbegyndt og betalt, refunderes ikke.
                </p>
                <div className="ck-links">
                  <a href="/abonnementsbetingelser" target="_blank" rel="noreferrer">Opsigelses- og refusionsvilkår</a>
                  <a href="/handelsbetingelser" target="_blank" rel="noreferrer">Handels- og leveringsbetingelser</a>
                </div>
              </div>
            </details>

            {/* ⚠️ MATCHGARANTIEN ER ET EKSISTERENDE LØFTE, ikke en ny påstand — den
                står på forsiden og i FAQ'en, og stod også i det gamle trin 5. */}
            {/* ⚠️ GARANTIEN HAR BETINGELSER, OG DE SKAL VÆRE ÉT KLIK VÆK.
                Løftet stod før helt ubetinget her, mens handelsbetingelserne
                §3.3-3.6 sætter rammer: 60 dage, dine egne kriterier, og ikke ved
                et snævert beløbsfilter eller en meget nichepræget virksomhed.
                Et ubetinget markedsføringsløfte side om side med en betinget
                aftaletekst er ikke bare uryddeligt — det er noget kunden kan
                holde os op på. Derfor står forbeholdet kort, og linket fører til
                den fulde ordlyd. */}
            {/* ⚠️ VÆRDI-ANKERET ER BETINGET OG STÅR ALENE. "kan betale … mange
                gange hjem" — aldrig "du tjener pengene hjem", aldrig et beløb,
                aldrig et løfte om at vinde. Sætningen kommer fra lib/salgTekst.js,
                samme kilde som forsiden og priskortene, så den ikke kan blive
                skærpet ét sted uden at nogen opdager det. */}
            <div className="ck-card ck-anker">
              <p>{VAERDI_ANKER}</p>
            </div>

            {/* ⚠️ GARANTIEN LÆSES NU FRA lib/salgTekst.js. Teksten er ORDRET den
                samme som før — det var netop DENNE formulering (60 dage + "inden
                for de kriterier du selv vælger" + link til §3.3) der blev valgt
                som husets ene rigtige, og resten af sitet er rettet ind efter
                den. At den nu kommer fra en konstant betyder at en fremtidig
                ændring rammer alle steder på én gang, i stedet for at efterlade
                checkouten med den gamle. */}
            <div className="ck-card ck-garanti">
              <h3><span className="ck-ic">✅</span> {GARANTI.kort}</h3>
              <p>{GARANTI.overskrift}</p>
              <p className="ck-garanti-fin">
                {GARANTI.forbehold}{" "}
                <a href={GARANTI_LINK} target="_blank" rel="noreferrer">
                  {GARANTI.linkTekst}
                </a>
              </p>
            </div>
          </aside>
        </div>
      )}



    </main>
  );
}
