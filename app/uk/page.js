import Salgsside from "../../components/salg/Salgsside";
import { hentOpgaveTal } from "../../lib/opgaveTal";
import { baseUrl, MARKEDER } from "../../lib/markets";

const GB = MARKEDER.GB;

// ============================================================================
// DET ENGELSKE BIRDLY — getbirdly.co.uk
//
// ⚠️ SAMME KOMPOSITION SOM DANMARK, IKKE EN HAANDPLUKKET LISTE.
// Foerste udgave af den her side satte selv seks sektioner sammen. Den fik
// derfor hverken header, footer eller sticky-CTA, og raekkefoelgen var min
// egen frem for husets. `components/salg/Salgsside.js` ER siden: 19 elementer
// i en dokumenteret psykologisk raekkefoelge, og den raekkefoelge er et
// produktvalg der er begrundet linje for linje i komponenten.
//
// Nu sendes `marked="GB"` ind, og resten foelger af sig selv. Retter nogen
// DK's raekkefoelge, retter de UK's samtidig - det er hele pointen.
//
// ⚠️ SEKTIONER UDEN ENGELSK COPY UDELADER SIG SELV.
// Hver sektion faar `marked` og returnerer null hvis den ikke er oversat
// endnu. Hellere en manglende sektion end en dansk: en dansk saetning paa en
// britisk side er VAERRE end en manglende, for den ser ud som om den hoerer
// til. Naar copy'en kommer, taender sektionen af sig selv - der er ingen
// liste her at huske at opdatere.
//
// ⚠️ EGET STATISK TRAE. `proxy.js` rewriter britiske vaerter hertil, saa
// adressen udadtil er getbirdly.co.uk/. Alternativet - at lade `/` vaelge
// marked pr. request - ville have gjort DEN DANSKE forside dynamisk og kostet
// dens cache.
// ============================================================================

export const metadata = {
  title: "Get more cleaning and service contracts | Birdly",
  description:
    "Birdly finds public and private work that fits your business — and sends new matches straight to your phone.",
  // ⚠️ CANONICAL PEGER PAA getbirdly.co.uk, ikke paa /uk. Stien er intern; det
  // er vaerten kunden ser, og den Google skal indeksere.
  alternates: { canonical: baseUrl("GB") + "/" },
  // ⚠️ INGEN INDEKSERING FOER MARKEDET ER LANCERET. GB er DRAFT: juraen er
  // DRAFT, der er ingen GBP-plan i Frisbii, og flere sektioner mangler endnu
  // deres engelske copy. Et indekseret site i den tilstand ville lokke folk
  // ind paa noget der ikke kan koebes. Fjernes naar pre-live-tjeklisten er
  // groen.
  robots: GB.lanceret ? undefined : { index: false, follow: false },
};

export default async function UkForside() {
  // ⚠️ BEVIS-BJAELKEN ER SLUKKET FOR GB, OG DET ER EN BESLUTNING.
  // Bjaelken er ikke bare tal - den er en AKTIVITETS-PAASTAND ("Birdly is
  // already keeping watch", "2× a day", "new in the last 7 days"). For GB har
  // ingesten koert NUL gange og kilden (FTS) er slukket, saa hver af de
  // paastande er usand i dag.
  //
  // ⚠️ GATEN HAENGER PAA OM MOTOREN KOERER, ikke paa om domaenet svarer.
  // Indtil 09-09-2026 var bjaelken ogsaa beskyttet af at get-opgave-tal
  // svarede DK for en GB-vaert - men den spaerring forsvandt praecis da
  // domaenet blev taendt (migration 0144). `dataLever` baerer nu alene, og det
  // er derfor det flag findes.
  const tal = GB.dataLever ? await hentOpgaveTal("GB", baseUrl("GB")) : null;

  return <Salgsside marked="GB" tal={tal} funnelHref="/uk/start" />;
}
