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

// ---------------------------------------------------------------------------
// LØBENDE AFTALER (rengøring, service, vagt …): månedsværdi × 12.
//
// Intervallerne er dem funnelen spørger med. `ref` er det tal vi regner på, og
// den ligger bevidst i den NEDRE ende af intervallet — runder vi opad, pynter
// vi på sammenligningen, og så er den ikke længere et ærligt eksempel.
// ---------------------------------------------------------------------------
export const MAANEDSVAERDI = [
  { key: "u5", label: "Under 5.000 kr.", ref: 4000 },
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
  // Uden et valg bruges standard-eksemplet: 8.000 kr./md. for løbende aftaler
  // (rengøring er den nuværende primære målgruppe) og 100.000 kr. for projekter.
  const fald = loebende ? liste[1] : liste[1];
  const p = liste.find((x) => x.key === valgt) || fald;

  if (loebende) {
    const aar = p.ref * 12;
    return {
      loebende: true,
      maerkat: "Eksempel",
      maaned: `${kr(p.ref)} kr./md.`,
      aar: `${kr(aar)} kr./år`,
      aarTal: aar,
      opgave: null,
      forhold: forhold(aar),
      andel: null,
      forbehold: FORBEHOLD,
      label: p.label,
    };
  }

  return {
    loebende: false,
    maerkat: "Eksempel",
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
