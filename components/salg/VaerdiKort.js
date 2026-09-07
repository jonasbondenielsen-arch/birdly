import { PLAN, priceText } from "../../lib/pakke";
import "../../app/vaerdikort.css";

// ============================================================================
// VÆRDI-ANKERET — de to sammenligningskort. ÉN komponent, alle steder.
//
// ⚠️ HVORFOR DEN FINDES. Kortene var bygget TO gange: én gang i forsidens
// VaerdiSektion.js med `.sg-vaerdi-*`-klasser, og én gang i funnelens Start.js
// med `.st-anker-*`. To implementeringer af det samme kort betyder at de driver
// fra hinanden — og det gjorde de: den ene centrerede sit indhold lodret, den
// anden ikke, og badge-offset og padding stod skrevet to steder med hver sin
// værdi. Resultatet var at boksene stod justeret forskelligt på forsiden og i
// funnelen.
//
// Nu findes markup OG styling ét sted. Der er ikke længere et sted hvor man KAN
// style dem forskelligt.
//
// BRUGES AF:
//   · components/salg/VaerdiSektion.js  → forsiden, /kom-i-gang, /priser og de
//                                          36 fag-sider (økonomisk værdi)
//   · components/Start.js               → pre-funnelens anker (skærm 1) OG det
//                                          personlige anker (skærm 7)
//
// ⚠️ REN PRÆSENTATION. Ingen hooks, ingen state, ingen dataopslag. Den får et
// færdigt anker fra lib/vaerdiAnker.js og tegner det. Regnestykket, forbeholdene
// og reglen om at vi ALDRIG lover et afkast bor dér — ikke her.
//
// ⚠️ SAMMENLIGNING, IKKE AFKAST. Teksten siger at en KONTRAKTVÆRDI svarer til
// et antal gange en ABONNEMENTSPRIS. Der må aldrig stå "ROI", "afkast" eller at
// pengene kommer retur. Læs noten i lib/vaerdiAnker.js før du rører en sætning.
// ============================================================================

/**
 * @param {object}  anker   resultatet af byggAnker() — bærer alle beløb og tekster
 * @param {boolean} taet    tættere typografi til funnelens smalle spalte.
 *                          ⚠️ ÆNDRER KUN SKRIFTSTØRRELSER. Padding, badge-offset
 *                          og justering er fælles og må ikke variere.
 */
export default function VaerdiKort({ anker: a, taet = false }) {
  if (!a) return null;
  // ⚠️ REGNET, IKKE SKREVET: 4.990 / 12 = 415,83 → "ca. 416 kr./md.". Et
  // håndskrevet tal ville stå forkert dagen efter en prisændring.
  const prMaaned = Math.round(PLAN.yearly / 12).toLocaleString("da-DK");

  return (
    <div className={"va" + (taet ? " va--taet" : "")}>
      {/* ─────────────── VENSTRE: eksemplet ─────────────── */}
      <div className="va-kort">
        {/* ⚠️ KORT BADGE. Navnet står som kortets første linje — et langt badge
            ved siden af et kort badge læses som skævt, uanset placeringen. */}
        <span className="va-badge">{a.maerkat}</span>
        <div className="va-navn">{a.navn}</div>

        {/* Scenariet gør tallet konkret nok til at kunden kan holde det op mod
            sin egen hverdag. Det står kun på husets standard-eksempel — har hun
            selv valgt et interval, ville det være vores antagelse om hendes
            forretning. */}
        {a.scenarie?.length > 0 && (
          <ul className="va-scenarie">
            {a.scenarie.map((linje) => <li key={linje}>{linje}</li>)}
          </ul>
        )}

        {a.loebende ? (
          <>
            <div className="va-tal">{a.maaned}</div>
            <div className="va-lig" aria-hidden="true">=</div>
            <div className="va-aar">{a.aar}</div>
          </>
        ) : (
          <div className="va-tal">{a.opgave}</div>
        )}
      </div>

      <div className="va-mod" aria-hidden="true">mod</div>

      {/* ─────────────── HØJRE: Birdly ───────────────
          ⚠️ HELE SAMMENLIGNINGEN BOR HER. Stod forholdstallet under kortene,
          blev det læst som en fodnote; man skal kunne forstå sektionen uden at
          læse noget under kortene. */}
      <div className="va-kort va-kort--birdly">
        <span className="va-badge va-badge--lys">Birdly</span>
        <div className="va-navn">Birdly et helt år</div>
        <div className="va-tal">{priceText.yearlyBare}</div>
        <div className="va-aar">ekskl. moms</div>
        <div className="va-md">ca. {prMaaned} kr./md.</div>

        {(a.forhold || a.andel) && (
          <div className="va-sml">
            {a.loebende ? (
              <>
                <span className="va-sml-over">Én fast aftale i denne størrelse svarer til</span>
                <span className="va-sml-tal">{a.forhold.tekst}</span>
                <span className="va-sml-under">Birdlys årspris</span>
              </>
            ) : (
              <>
                <span className="va-sml-over">Et helt års Birdly svarer til</span>
                <span className="va-sml-tal">{a.andel}</span>
                <span className="va-sml-under">af værdien på en opgave i den størrelse</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
