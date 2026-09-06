"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "./Logo";
import { fetchCatalog, submitSignup, createSubscriptionSession } from "../lib/catalog";
import { hentKandidater, visResultat } from "../lib/kandidater";
import { PLAN, planForInterval, priceText, TRIAL_DAYS } from "../lib/pakke";
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
import { GARANTI, GARANTI_LINK, VAERDI_ANKER } from "../lib/salgTekst";
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
const TRIN = ["CVR", "Fag og område", "Arbejdsområder", "Resultat", "Betaling"];
const ANTAL_TRIN = TRIN.length;

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

  // Trin 1
  const [cvr, setCvr] = useState("");
  const [firma, setFirma] = useState("");
  const [branchekode, setBranchekode] = useState(null);
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
  const fagListe = katalog?.fag || [];
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
  async function tilResultat() {
    setFejl("");
    if (!fagValgt.length) return setFejl("Vælg mindst én branche.");
    if (!fagKoder.length) return setFejl("Vælg mindst ét arbejdsområde — det er dem, vi holder øje med.");
    setHenter(true); setTrin(4);
    const k = await hentKandidater({
      fag_keys: fagValgt,
      cpv_selections: fagKoder,
      bredde,
      region_keys: regionKeys,
      min_amount: null,
      max_amount: maks ? Number(maks) : null,
    });
    setKandidater(k); setHenter(false);
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
        setTrin(5);
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
      setTrin(5);
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

  // ⚠️ priceText er et OBJEKT, ikke en funktion — og det er den eneste kilde til
  // beløbet. Hardkod aldrig en pris her; det var netop derfor tre steder stod med
  // den gamle pris efter en ændring (se CLAUDE.md, "Pris — REGLERNE").
  const pris = priceText[interval];

  // Annulleret betaling: kunden er tilbage, men intet er sket. Vi siger det rent ud
  // frem for at lade hende stå på trin 1 og undre sig.
  const annulleret = betaling === "annulleret";

  if (faerdig) {
    return (
      <main className="st-wrap">
        <div className="st-top"><Logo height={30} /></div>
        <div className="st-kort st-kvit">
          <div className="st-ic">✓</div>
          <h1>Jeres profil er klar.</h1>
          <p>Vi holder øje fra nu af. I får en SMS og en mail, så snart der er en opgave der passer til jer.</p>
          {/* ⚠️ HVAD DER SKER MED PENGENE — SAGT HØJT, MEN UDEN EN DATO.
              Den nye kunde har lige registreret et kort og skal kunne se sort på
              hvidt at der ikke er trukket noget. Vi skriver derimod ALDRIG en
              konkret trækdato her: kvitteringen betyder "Reepay sagde ja til
              kortet", ikke "abonnementet kører" — det afgør webhooken. En dato
              regnet i browseren ville være et gæt, og et gæt om en betaling er
              det værste sted at gætte. */}
          <p className="st-kvit-fin">
            Du har betalt <b>0 kr. i dag</b>. Første betaling sker efter de {TRIAL_DAYS} gratis
            dage, og vi minder dig 3 dage før. Vil du ikke fortsætte, siger du op inden — så
            trækkes der ingenting.
          </p>
        </div>
      </main>
    );
  }

  return (
    /* ⚠️ TRIN 5 SPRÆNGER RAMMEN. .st-wrap er 520px, som passer til de smalle
       trin 1-4 — men to kolonner klemt ned i 520px brækker plan-kortene midt i
       beløbet (målt på skærm 03-09-2026). Modifikatoren giver kun trin 5 den
       fulde bredde; de øvrige trin er urørte. */
    <main className={"st-wrap" + (trin === 5 && !kortloes ? " st-wrap-bred" : "")}>
      <div className="st-top"><Logo height={30} /></div>

      {/* ⚠️ LØFTET SKAL STÅ FØR SPØRGSMÅLENE, ikke først ved kortet. En funnel der
          beder om CVR som det første, uden at gentage hvad man er i gang med, taber
          folk på trin 1 — de har lige forladt en side der lovede 14 dage gratis, og
          her stod pludselig kun et tomt felt. Striben er ren tekst, står på hvert
          trin op til betalingen, og gentager præcis det samme som forsiden og
          checkouten siger. Ingen nedtælling, ingen knaphed.
          ⚠️ IKKE PÅ TRIN 5: dér står det samme i checkoutens egen underoverskrift,
          og to steder ville se ud som to forskellige tilbud. */}
      {trin < 5 && (
        <p className="st-loefte">
          {forvalgtLabel
            /* ⚠️ "opgaver inden for X", IKKE "X-opgaver". Katalogets labels er
               sammensatte ("Tømrer/snedker", "VVS & blikkenslager", "Service &
               vedligehold"), og en bindestreg bagpå gav "vvs & blikkenslager-opgaver".
               Den her form læser naturligt for alle 20 fag uden en eneste særregel. */
            ? <>Vi finder opgaver inden for <b>{forvalgtLabel.toLowerCase()}</b> til jer · {TRIAL_DAYS} dage gratis · 0 kr. i dag</>
            : <>{TRIAL_DAYS} dage gratis · 0 kr. i dag · ingen binding</>}
        </p>
      )}

      <div className="st-bar" aria-label={`Trin ${trin} af ${ANTAL_TRIN}`}>
        <i style={{ width: `${(trin / ANTAL_TRIN) * 100}%` }} />
      </div>
      <p className="st-trin">Trin {trin} af {ANTAL_TRIN} · {TRIN[trin - 1]}</p>

      {annulleret && !fejl && (
        <div className="st-fejl">Betalingen blev afbrudt — der er ikke trukket noget. Du kan prøve igen når du vil.</div>
      )}
      {fejl && <div className="st-fejl">{fejl}</div>}

      {/* ---------------- TRIN 1 — CVR ---------------- */}
      {trin === 1 && (
        <div className="st-kort">
          <h1>Hvad er jeres CVR-nummer?</h1>
          {/* ⚠️ SIG HVORFOR VI SPØRGER. "Så henter vi resten selv" forklarede hvad
              vi gør, ikke hvad hun får ud af det. Et CVR-felt som allerførste
              spørgsmål føles som en kreditvurdering; grunden gør det til
              opsætning. Selve opslaget og gaten bag er urørt. */}
          <p className="st-hj">
            Vi slår jeres virksomhed op, så vi kun sender opgaver, der er relevante for
            jer. Det tager under to minutter at sætte op.
          </p>
          <label className="st-lab" htmlFor="cvr">CVR-nummer</label>
          <input
            id="cvr" className="st-felt" inputMode="numeric" autoComplete="off" maxLength={11}
            value={cvr}
            onChange={(e) => { setCvr(e.target.value); setFirma(""); setOpslagFejl(""); }}
            onBlur={(e) => slaaOp(e.target.value)}
            placeholder="12345678"
          />
          {slaarOp && <p className="st-hj">Slår op…</p>}
          {firma && (
            <div className="st-hit">
              {/* "Fundet:" frem for et bart flueben — bekræftelsen skal læses som
                  en hilsen, ikke som en valideringsmarkering. */}
              ✓ Fundet: <b>{firma}</b>
              {/* ⚠️ KUN når CVR-opslaget FAKTISK gættede. Linjen hang før på valgtFag,
                  altså på ethvert valgt fag — også et der kom fra ?fag= i adressen.
                  Resultatet var at funnelen påstod "ser ud til at være Entreprenør"
                  om en it-virksomhed, fordi linket havde forvalgt entreprenør.
                  Et forkert forvalg er værre end intet: kunden tror det passer og
                  fortsætter med forkert fag. */}
              {gaetFag && fagByKey[gaetFag] && (
                <><br /><span>Ser ud til at være <b>{fagByKey[gaetFag].label_da}</b></span></>
              )}
              {branchekode && !gaetFag && (
                <><br /><span className="st-neutral">Vi kunne ikke se hvilket fag I hører til — vælg det selv på næste trin.</span></>
              )}
            </div>
          )}
          {opslagFejl && <p className="st-hj">{opslagFejl}</p>}
          <button className="btn btn-teal st-bred" onClick={() => { if (cifre(cvr).length !== 8) return setFejl("Skriv et CVR-nummer på 8 cifre."); setFejl(""); setTrin(2); }}>
            Fortsæt →
          </button>
        </div>
      )}

      {/* ---------------- TRIN 2 — FAG + OMRÅDE ---------------- */}
      {trin === 2 && (
        <div className="st-kort">
          <h1>Hvad laver I, og hvor?</h1>
          <p className="st-hj">Det er det, vi holder øje efter. I kan altid ændre det bagefter.</p>

          {/* ⚠️ FLERE BRANCHER SKAL VÆRE SYNLIGT MULIGT. Dropdownen alene fik det til
              at ligne et enten-eller; en entreprenør der også laver kloak kunne ikke
              se at han måtte tage begge. Chips viser hvad der er valgt, og vælgeren
              hedder "Tilføj" så det er tydeligt at man kan lægge flere til. */}
          <span className="st-lab">Jeres brancher</span>
          {fagValgt.length > 0 && (
            <div className="st-chips">
              {fagValgt.map((k) => (
                <span className="st-chip" key={k}>
                  {fagByKey[k]?.label_da || k}
                  <button
                    type="button"
                    aria-label={`Fjern ${fagByKey[k]?.label_da || k}`}
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

          {/* ⚠️ MULTIVALG. En <select> kunne kun bære ét område, men de fleste dækker
              flere landsdele. Afkrydsning frem for dropdown, samme mønster som
              /tilmeld — og samme værdier, så de to funneler ikke kan drive fra
              hinanden. Alle valgte sendes videre; det er regionKeys der går til
              både preview og signup. */}
          <span className="st-lab">Hvor vil I have opgaver?</span>
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

          <label className="st-lab" htmlFor="maks">Største opgave I vil se <span className="st-valgfri">(valgfrit)</span></label>
          <select id="maks" className="st-felt" value={maks} onChange={(e) => setMaks(e.target.value)}>
            <option value="">Alle beløb</option>
            <option value="1000000">Op til 1 mio. kr.</option>
            <option value="5000000">Op til 5 mio. kr.</option>
            <option value="20000000">Op til 20 mio. kr.</option>
          </select>

          <button
            className="btn btn-teal st-bred"
            onClick={() => {
              if (!fagValgt.length) return setFejl("Vælg mindst én branche.");
              // Samme værn som signup ("Vælg mindst én region", 400) — men her, hvor
              // hun kan nå at rette det, frem for som en fejl efter kontaktoplysningerne.
              if (!regionKeys.length) return setFejl("Vælg mindst én landsdel — eller hele Danmark.");
              setFejl(""); setTrin(3);
            }}
          >
            Fortsæt →
          </button>
          <button className="st-tilbage" onClick={() => setTrin(1)}>← Tilbage</button>
        </div>
      )}

      {/* ---------------- TRIN 3 — ARBEJDSOMRÅDER + BREDDE ---------------- */}
      {/* Samme to valg som /tilmeld, samme datakilde (katalogets fag.smal) og samme
          mapping til CPV. Det er dem der bliver til søgekriteriet — ikke pynt. */}
      {trin === 3 && (
        <div className="st-kort">
          <h1>Hvad laver I helt præcis?</h1>
          <p className="st-hj">Kryds det fra I ikke laver. Så slipper I for beskeder om det.</p>
          {/* ⚠️ ÆGTE TAL, IKKE ET SALGSLØFTE. omraader.length er antallet af
              arbejdsområder fagets kodesæt faktisk indeholder, og regionResume er
              kundens eget valg fra trin 2 — begge læses af state, ingen af dem er
              gættet. Linjen bekræfter at der SKER noget mellem to spørgsmål; den
              lover ikke at der findes opgaver. Det tal kommer på næste trin, og
              det kommer fra matchmotoren. */}
          {omraader.length > 0 && (
            <p className="st-fremdrift">
              Birdly holder øje med <b>{omraader.length}</b>{" "}
              {omraader.length === 1 ? "type opgave" : "typer opgaver"} i{" "}
              <b>{regionResume || "jeres område"}</b>.
            </p>
          )}

          {/* ⚠️ BREDDE ØVERST OG ALDRIG FOLDET. Det er den beslutning der flytter
              mest: med "alle" lægges fagets brede kode på, og den alene rammer 79
              opgaver for entreprenør — uanset hvor få områder der er krydset af.
              Målt: kun betonarbejder + "alle" giver 79, + "kun fag" giver 2. */}
          <div className="st-bredde">
            <span className="st-lab" style={{ margin: "0 0 8px" }}>Hvor bredt vil I fange opgaver?</span>
            <label className={"st-radio" + (bredde === "alle" ? " on" : "")}>
              <input type="radio" name="bredde" checked={bredde === "alle"} onChange={() => setBredde("alle")} />
              {/* ⚠️ KUN LABELEN ER ÆNDRET (03-08-2026). Værdien er stadig
                  bredde="alle", forvalget er uændret, og CPV-logikken bag er ikke
                  rørt — den bor i birdly_effective_cpv_for. Teksten beskriver nu
                  hvad valget GØR for kunden frem for hvad det hedder teknisk. */}
              <span><b>Maksimér antallet af opgaver <em>anbefalet</em></b><i>Også de brede entrepriseudbud i jeres fag. Flere match, lidt mere bredt.</i></span>
            </label>
            <label className={"st-radio" + (bredde === "fag" ? " on" : "")}>
              <input type="radio" name="bredde" checked={bredde === "fag"} onChange={() => setBredde("fag")} />
              <span><b>Kun fagentrepriser</b><i>Færre, men kun de præcise områder I har valgt.</i></span>
            </label>
          </div>

          {omraader.length > 0 ? (
            <div className="st-fold">
              {/* Resumé-linjen. Teksten kommer fra omrResume, som læser den ægte
                  state — den kan ikke komme til at sige "alle valgt" om noget andet. */}
              <button
                type="button"
                className={"st-foldknap" + (antalValgt === 0 ? " tom" : "")}
                onClick={() => setAabenOmr((v) => !v)}
                aria-expanded={aabenOmr}
              >
                <span>{omrResume}</span>
                <i>{aabenOmr ? "skjul" : "ret"}</i>
              </button>

              {/* ⚠️ FOLDNING ÆNDRER KUN SYNLIGHED. Afkrydsningerne bor i omraadeValg
                  på komponenten, ikke i disse felter — foldes listen væk, står de
                  valgte områder uændret, og fagKoder (og dermed den effektive
                  CPV-liste) er den samme som hvis listen var åben. */}
              {aabenOmr && (
                <>
                  <div className="st-omrhoved">
                    <span className="st-lab" style={{ margin: 0 }}>Dine arbejdsområder</span>
                    <button type="button" className="st-alle" onClick={() => saetAlle(!alleValgt)}>
                      {alleValgt ? "Fjern alle" : `Tag alle ${valgtFag?.label_da || "områder"} med`}
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
                        {/* ⚠️ Undertitlen vises KUN når den siger noget nyt. For flere
                            områder er kunde_titel og name_da identiske
                            ("Byggemodning"), og så stod ordet to gange under hinanden. */}
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
          ) : (
            <p className="st-hj">Dit fag har ingen underområder — I matches på fagets brede koder.</p>
          )}

          {/* Nul-dæknings-værnet gælder uændret: tilResultat() blokerer på tom liste,
              også når den er foldet. Foldning kan ikke snige en tom søgning forbi. */}
          <button className="btn btn-teal st-bred" onClick={tilResultat}>Fortsæt →</button>
          <button className="st-tilbage" onClick={() => setTrin(2)}>← Tilbage</button>
        </div>
      )}

      {/* ---------------- TRIN 4 — ÆGTE TAL + KONTAKT ---------------- */}
      {trin === 4 && (
        <div className="st-kort">
          {henter ? (
            <><h1>Vi kigger efter…</h1><p className="st-hj">Et øjeblik.</p></>
          ) : (
            <>
              {visResultat(kandidater) === "lokalt" && (
                <>
                  {/* ⚠️ TALLET I OVERSKRIFTEN ER MATCHMOTORENS EGET (03-08-2026).
                      kandidater.i_omraade kommer fra preview-kandidater, som kalder
                      selve match-reglen — det er samme tal som i boksen nedenunder,
                      ikke et andet. Grenen her renderer KUN når visResultat() siger
                      "lokalt", altså når tallet er > 0, så overskriften kan ikke
                      komme til at love noget ved 0. Den ærlige 0-tekst står uændret
                      i "landsplan"- og "intet"-grenene længere nede. */}
                  <h1>Vi fandt allerede {kandidater.i_omraade} {kandidater.i_omraade === 1 ? "opgave" : "opgaver"} til jer.</h1>
                  <div className="st-res">
                    <b>{kandidater.i_omraade}</b>
                    <span>som passer til jeres virksomhed</span>
                  </div>
                </>
              )}

              {/* ⚠️ 0 I OMRÅDET. Landstallet står som landstal og udgiver sig ALDRIG
                  for at være i kundens område — og hun får en handling, ikke en trøst. */}
              {visResultat(kandidater) === "landsplan" && (
                <>
                  <h1>Vi holder øje for jer.</h1>
                  <div className="st-res st-nul">
                    <b>Ingen match i dit område lige nu</b>
                    <span>— men <b>{kandidater.paa_landsplan}</b> i dit fag på landsplan.</span>
                  </div>
                  <p className="st-hj">Prøv at udvide jeres område, eller lad os holde øje — så får I besked, så snart der kommer en.</p>
                  <button className="btn btn-ghost st-bred" onClick={() => setTrin(2)}>Udvid område</button>
                </>
              )}

              {visResultat(kandidater) === "intet" && (
                <>
                  <h1>Vi holder øje for jer.</h1>
                  <p className="st-hj">Der er ikke en opgave i jeres fag lige nu. Så snart der kommer en, får I besked på SMS og mail. I skal ikke gøre noget.</p>
                </>
              )}

              {/* ⚠️ ANGSTEN FJERNES FØR FELTERNE, ikke efter. Her beder vi om navn,
                  mail og mobilnummer — det er første gang kunden afgiver noget
                  personligt, og det er dér tvivlen "koster det her noget nu?"
                  opstår. Sætningen står derfor OVER felterne. Den lover intet nyt:
                  0 kr. i dag og ingen binding er præcis det checkouten siger to
                  klik senere. */}
              <p className="st-tryghed">
                {TRIAL_DAYS} dage gratis · <b>0 kr. i dag</b> · ingen binding · opsig gratis inden
              </p>

              <label className="st-lab" htmlFor="navn">Navn</label>
              <input id="navn" className="st-felt" value={navn} onChange={(e) => setNavn(e.target.value)} autoComplete="name" />

              <label className="st-lab" htmlFor="mail">E-mail</label>
              <input id="mail" className="st-felt" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />

              <label className="st-lab" htmlFor="tlf">Mobilnummer <span className="st-valgfri">(det er her beskeden lander)</span></label>
              <input id="tlf" className="st-felt" inputMode="tel" value={tlf} onChange={(e) => setTlf(e.target.value)} autoComplete="tel" placeholder="12 34 56 78" />

              {/* ⚠️ OPLYSNINGSPLIGT, IKKE ET SAMTYKKE — og derfor bevidst IKKE et
                  flueben. Nye kunder får wants_private_opgaver = true som standard
                  (migration 0090). Opt-out-modellen holder kun, hvis kunden ER blevet
                  oplyst; annonceringen 24-08-2026 lukkede hullet for de eksisterende
                  kunder, og denne linje lukker det for alle fremtidige.

                  ⚠️ ET FLUEBEN HER VILLE GØRE DET TIL ET TILVALG IGEN og dermed vende
                  hele modellen tilbage til opt-in. Hun skal informeres, ikke spørges.

                  ⚠️ DEN STÅR OVER SAMTYKKERNE, ikke under knappen. Oplysningen skal
                  være læst inden hun accepterer — ikke findes bagefter.

                  ⚠️ ORDLYDEN ER JONAS' OG ER INDSAT ORDRET. Skriv den ikke om. Den
                  peger på "Rediger" på opgavesiden, og dét sted skal blive ved med at
                  hedde det — se noten i MineOpgaver.js. */}
              <p className="st-hj" style={{ marginTop: 18 }}>
                Din overvågning inkluderer både offentlige udbud og private opgaver i dit
                fag og område. Du kan til enhver tid fravælge private opgaver under
                &ldquo;Rediger&rdquo; på din opgaveside.
              </p>

              {/* ⚠️ TO SEPARATE SAMTYKKER (Clearhaus-krav). Handelsbetingelser og
                  abonnementsbetingelser skal accepteres hver for sig, så det er
                  tydeligt hvad kunden siger ja til. Begge er PÅKRÆVEDE og gater
                  knappen nedenfor. Samme .st-tjek-klasse som før — den nye er en
                  spejling af den eksisterende, ikke en ny stil. */}
              <label className="st-tjek">
                <input type="checkbox" checked={betingelser} onChange={(e) => setBetingelser(e.target.checked)} />
                <span>Jeg accepterer <a href="/handelsbetingelser" target="_blank" rel="noreferrer">handelsbetingelserne</a> og <a href="/privatlivspolitik" target="_blank" rel="noreferrer">privatlivspolitikken</a>.</span>
              </label>

              <label className="st-tjek">
                <input type="checkbox" checked={abonnement} onChange={(e) => setAbonnement(e.target.checked)} />
                <span>Jeg accepterer <a href="/abonnementsbetingelser" target="_blank" rel="noreferrer">abonnementsbetingelserne</a> — herunder at abonnementet fornyes automatisk, og at mit betalingskort gemmes hos vores betalingsudbyder, indtil jeg siger op.</span>
              </label>

              <button className="btn btn-teal st-bred" onClick={tilBetaling} disabled={arbejder}>
                {arbejder ? "Et øjeblik…" : "Fortsæt →"}
              </button>
              <button className="st-tilbage" onClick={() => setTrin(3)}>← Tilbage</button>
            </>
          )}
        </div>
      )}

      {/* ---------------- TRIN 5 — BETALING ---------------- */}
      {/* ⚠️ KORTLØS BEKRÆFTELSE. Erstatter HELE betalingstrinnet — der er ingen
          plan-vælger, ingen pris og ingen knap til Reepay, fordi der ikke skal
          betales noget. Notebox'en er den samme besked som velkomstmailens, så
          kunden får den både på skærmen og på skrift. */}
      {trin === 5 && kortloes && (
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

      {trin === 5 && !kortloes && (
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
