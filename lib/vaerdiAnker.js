import { PLAN } from "./pakke";

// ============================================================================
// VÆRDI-ANKERET — sammenligningen mellem hvad en opgave kan være værd og hvad
// Birdly koster.
//
// ⚠️ DEN VIGTIGSTE REGEL I HELE FILEN, OG DEN ER ET PRODUKTPRINCIP:
// BIRDLY GARANTERER ALDRIG AT KUNDEN VINDER EN OPGAVE.
//
// Derfor må der ALDRIG stå:
//   · "Birdly giver 19× i afkast"        (afkast forudsætter en gevinst)
//   · "Du tjener pengene hjem"           (udbytteløfte)
//   · "Ét match betaler abonnementet"    (samme løfte, pakket ind)
//   · "ROI", "investering der forrentes" (samme, på engelsk)
//
// Det vi SANDT kan vise er en betinget sammenligning:
//   HVIS kunden vinder én opgave i den størrelse hun selv har valgt,
//   SÅ er den opgaves værdi mange gange årsprisen på Birdly.
//
// Forskellen er hele forskellen. Tallet beskriver en KONTRAKTVÆRDI holdt op mod
// en ABONNEMENTSPRIS — ikke et afkast, ikke en gevinst, ikke et løfte. Hver
// eneste tekst herunder er formuleret sådan, og `forbehold` skal med hver gang
// et forhold vises.
//
// ⚠️ ALLE BELØB ER MÆRKET SOM EKSEMPLER. Vi ved ikke hvad kundens opgaver er
// værd, og vi påstår det ikke. Tallene er realistiske størrelsesordener valgt
// så de kan genkendes af en dansk SMV — ikke målinger, ikke gennemsnit fra
// vores data, ikke noget vi kan dokumentere. Derfor bærer hver visning ordet
// "Eksempel", og derfor står de her i én fil frem for spredt ud i JSX.
//
// ⚠️ ÅRSPRISEN KOMMER FRA lib/pakke.js. Hardkod den aldrig — en prisændring
// skal flytte forholdstallet automatisk, ellers står siden med et regnestykke
// der ikke passer til den pris kunden betaler.
// ============================================================================

/** Fag hvor forretningen er tilbagevendende aftaler frem for enkeltprojekter. */
const LOEBENDE = new Set([
  "rengoring", "service", "vagt", "affald", "catering", "transport", "forretningsservice",
]);

export function erLoebende(fagKey) {
  return LOEBENDE.has(String(fagKey || ""));
}

// ===========================================================================
// HUSETS STANDARD-EKSEMPEL FOR RENGØRING (06-09-2026)
//
// ⚠️ ÉT EKSEMPEL, ÉT STED, ALLE SIDER. Forsiden, fag-siderne, pre-funnelen og
// prissiden viste før hver sin variant af "en rengøringsaftale". Når tallet
// skifter mellem to sektioner på samme rejse, holder kunden op med at tro på
// begge. Derfor bor scenariet her, og alle generiske visninger læser det.
//
// ⚠️ DET ER ET EKSEMPEL, IKKE EN GENNEMSNITSPRIS. Vi har ingen data på hvad
// dansk erhvervsrengøring koster, og vi påstår det ikke. `kilde` skal med hver
// gang tallet vises — "vejledende markedspriser" er præcis så stærkt et udsagn
// som vi kan stå inde for, og svagere end "gennemsnittet er".
//
// ⚠️ SCENARIET ER EN DEL AF ÆRLIGHEDEN. "10.000 kr./md." alene er et tal ude af
// kontekst; "100–200 m² kontor i København, rengøring 3× om ugen" er noget en
// rengøringsejer kan holde op mod sin egen hverdag og selv vurdere.
// ===========================================================================
export const STANDARD_RENGOERING = {
  navn: "Fast erhvervsrengøring",
  scenarie: ["100–200 m² kontor · København", "Rengøring 3× om ugen"],
  maaned: 10000,
  kilde: "Eksempel baseret på vejledende markedspriser.",
};

// ---------------------------------------------------------------------------
// LØBENDE AFTALER (rengøring, service, vagt …): månedsværdi × 12.
//
// ⚠️ DE HER TAL ER KUNDENS EGNE, IKKE STANDARD-EKSEMPLET. Intervallerne er dem
// funnelen spørger med, og `ref` er det tal vi regner på, når hun HAR valgt et
// interval. Den ligger bevidst i den nedre halvdel — runder vi opad, pynter vi
// på sammenligningen med et beløb hun ikke har bekræftet.
//
// Har hun ikke valgt noget (forside, fag-side, pre-funnel), bruges
// STANDARD_RENGOERING i stedet. De to må ikke smelte sammen: det ene er hendes
// tal, det andet er vores eksempel.
// ---------------------------------------------------------------------------
export const MAANEDSVAERDI = [
  { key: "u5", label: "Under 5.000 kr.", ref: 4000 },
  // ⚠️ 8.000 ER BEVIDST IKKE 10.000. Har kunden selv sagt "5.000-10.000", regner
  // vi i den øvre MIDTE af hendes interval, ikke på loftet — loftet ville pynte
  // med et beløb hun ikke har bekræftet. Konsekvensen er at tallet kan FALDE i
  // forhold til husets standard-eksempel (10.000), og det er korrekt: hun har
  // netop fortalt os at hendes aftaler er mindre end eksemplet.
  { key: "5-10", label: "5.000–10.000 kr.", ref: 8000 },
  { key: "10-25", label: "10.000–25.000 kr.", ref: 15000 },
  // ⚠️ 25.000, IKKE ET TAL MIDT I ET ÅBENT INTERVAL. "25.000 og op" har ingen
  // øvre grænse, og et gæt på 30.000 ville pynte på sammenligningen med et beløb
  // kunden aldrig har nævnt. Vi regner på intervallets NEDRE kant — det er det
  // eneste tal hun faktisk har bekræftet.
  { key: "25+", label: "25.000 kr. og op", ref: 25000 },
];

// ---------------------------------------------------------------------------
// PROJEKTFAG (tømrer, VVS, elektriker, entreprenør …): en enkelt opgaves værdi.
//
// ⚠️ DE HER TAL ER IKKE ET MATCHKRITERIUM. Kundens faktiske filter er
// `max_amount` i funnelen, som går til match-reglen. Det her er udelukkende
// eksemplet vi regner sammenligningen på. Blandes de to sammen, kommer vi til
// at filtrere kundens opgaver efter et tal hun troede var en illustration.
// ---------------------------------------------------------------------------
export const PROJEKTVAERDI = [
  { key: "u100", label: "Under 100.000 kr.", ref: 75000 },
  { key: "100-500", label: "100.000–500.000 kr.", ref: 100000 },
  { key: "500-2m", label: "500.000–2 mio. kr.", ref: 500000 },
  { key: "2m+", label: "2 mio. kr. og op", ref: 2000000 },
];

const kr = (n) => Math.round(n).toLocaleString("da-DK");

/**
 * Forholdet mellem en opgaves værdi og Birdlys årspris.
 *
 * ⚠️ AFRUNDING DER ALDRIG PYNTER. Under 10 gange vises én decimal (4,2×), fordi
 * "ca. 4×" af 4,2 lyder mindre præcist end det er. Over 10 rundes til hele tal.
 * Vi runder ALDRIG op til et pænere tal — 19,24 bliver til 19, ikke 20.
 */
export function forhold(vaerdiPrAar) {
  const raat = vaerdiPrAar / PLAN.yearly;
  if (!isFinite(raat) || raat <= 0) return null;
  const tal = raat < 10 ? Math.floor(raat * 10) / 10 : Math.floor(raat);
  return {
    tal,
    tekst: `ca. ${tal.toLocaleString("da-DK")}×`,
  };
}

/**
 * Hvor lille en del af opgavens værdi et helt års Birdly udgør.
 * Bruges til projektfag: "under 5 % af værdien på en opgave til 100.000 kr."
 *
 * ⚠️ RUNDES OP, ikke ned — det er den konservative retning når tallet skal
 * læses som "højst så meget". 4,99 % bliver til "under 5 %", aldrig "ca. 4 %".
 */
export function andelPct(opgaveVaerdi) {
  if (!opgaveVaerdi || opgaveVaerdi <= 0) return null;
  const pct = (PLAN.yearly / opgaveVaerdi) * 100;
  if (pct < 1) return "under 1 %";
  return `under ${Math.ceil(pct)} %`;
}

/**
 * Færdigt anker til visning.
 *
 * @param {string} fagKey   kundens fag (afgør løbende vs. projekt)
 * @param {string} [valgt]  nøglen fra MAANEDSVAERDI/PROJEKTVAERDI hvis hun har valgt
 * @returns {{loebende, maaned, aar, opgave, forhold, andel, forbehold, maerkat}}
 */
export function byggAnker(fagKey, valgt = null) {
  const loebende = erLoebende(fagKey);
  const liste = loebende ? MAANEDSVAERDI : PROJEKTVAERDI;

  if (loebende) {
    // ⚠️ TO KILDER, OG DE MÅ IKKE BLANDES:
    //   · har kunden valgt et interval  → HENDES tal (MAANEDSVAERDI)
    //   · har hun ikke                  → husets STANDARD-EKSEMPEL
    // Det første er personligt og skal blive inden for det hun har bekræftet;
    // det andet er vores illustration og skal være det SAMME overalt.
    const valgtInterval = liste.find((x) => x.key === valgt);
    const maanedTal = valgtInterval ? valgtInterval.ref : STANDARD_RENGOERING.maaned;
    const aar = maanedTal * 12;

    return {
      loebende: true,
      maerkat: "Eksempel",
      // Scenariet følger kun standard-eksemplet. Har kunden selv valgt et
      // interval, ville "100–200 m² kontor i København" være vores antagelse
      // om hendes forretning — og det ved vi intet om.
      navn: valgtInterval ? "Fast aftale" : STANDARD_RENGOERING.navn,
      // ⚠️ FÆRDIG BADGE-TEKST, ét sted. "Eksempel" alene siger ikke hvad
      // eksemplet ER, og et separat navn under badget sagde det samme to gange.
      // Har kunden selv valgt et interval, står der kun "Eksempel" — vi ved
      // intet om hvilken slags aftale hun tænker på.
      badge: valgtInterval ? "Eksempel" : `Eksempel · ${STANDARD_RENGOERING.navn}`,
      scenarie: valgtInterval ? [] : STANDARD_RENGOERING.scenarie,
      kilde: valgtInterval ? null : STANDARD_RENGOERING.kilde,
      maaned: `ca. ${kr(maanedTal)} kr./md.`,
      aar: `ca. ${kr(aar)} kr./år`,
      aarTal: aar,
      opgave: null,
      forhold: forhold(aar),
      andel: null,
      forbehold: FORBEHOLD,
      label: valgtInterval ? valgtInterval.label : null,
    };
  }

  const p = liste.find((x) => x.key === valgt) || liste[1];

  return {
    loebende: false,
    maerkat: "Eksempel",
    badge: "Eksempel",
    navn: "Én relevant opgave",
    scenarie: [],
    kilde: null,
    maaned: null,
    aar: null,
    aarTal: p.ref,
    opgave: `${kr(p.ref)} kr.`,
    forhold: forhold(p.ref),
    andel: andelPct(p.ref),
    forbehold: FORBEHOLD,
    label: p.label,
  };
}

// ⚠️ FORBEHOLDET SKAL MED HVER GANG ET FORHOLDSTAL VISES. Det er ikke
// småtryk-pynt: uden det læses "ca. 19×" som et løfte om udbytte, og dét er
// præcis den påstand vi ikke må fremsætte. Teksten står her, så den ikke kan
// blive glemt ét sted eller skrevet om til noget blødere et andet.
export const FORBEHOLD =
  "Birdly garanterer ikke, at I vinder opgaven. Vi sørger for, at I opdager de relevante muligheder.";

/** Betinget afslutning under ankeret — aldrig et udsagn om at kunden tjener. */
export const BETINGET_LINJE =
  "Vinder I bare én relevant opgave i løbet af året, kan prisen på Birdly være meget lille i sammenligning.";
