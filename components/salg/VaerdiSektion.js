"use client";

import { useEffect, useRef } from "react";
import Cta from "./Cta";
import { Flueben } from "./Ikoner";
import { PLAN, priceText } from "../../lib/pakke";
import { byggAnker } from "../../lib/vaerdiAnker";
import { useFag } from "./FagKontekst";
import { sporFunnel } from "../../lib/ctaSporing";

// ============================================================================
// ØKONOMISK VÆRDI — egen fil, og det er ikke tilfældigt.
//
// Sektionen skal kunne læse det fag den besøgende har valgt i fanerne længere
// oppe, og det kræver en klient-komponent. Lå den i Sektioner.js sammen med de
// øvrige, ville HELE den fil blive klient-bundtet — problem, motor, portal,
// priser og FAQ ville alle koste JavaScript hos kunden uden at have brug for
// det. Nu er det kun den ene sektion der gør.
// ============================================================================

// -------------------------------------------------- 6 · ØKONOMISK VÆRDI

/**
 * Sammenligningen mellem hvad en opgave kan være værd og hvad Birdly koster.
 *
 * ⚠️ DET ER EN SAMMENLIGNING, IKKE ET AFKAST. Vi siger aldrig at kunden tjener
 * noget, får noget igen eller opnår et forhold — vi stiller to beløb ved siden
 * af hinanden og skriver rent ud at vi ikke garanterer en vundet opgave.
 * Reglen og alle tal bor i lib/vaerdiAnker.js; læs noten dér før du ændrer
 * en formulering.
 *
 * ⚠️ BELØBENE ER MÆRKEDE EKSEMPLER. Vi har ingen data på hvad kundens opgaver
 * er værd, og vi påstår det ikke. "Eksempel"-mærkatet står på selve kortet, ikke
 * som småtryk nedenunder.
 *
 * ⚠️ ERSTATTER "365 DAGE vs. 4.990 KR." Det gamle anker sammenlignede en
 * tidsperiode med en pris, og det svarer ikke på spørgsmålet kunden faktisk
 * stiller: hvad kan det her være værd for MIG. Et beløb mod et beløb gør.
 *
 * @param {string} fag  fagnøgle — afgør om ankeret er en løbende aftale
 *                      (rengøring/service) eller et enkeltprojekt.
 */
export function Vaerdi({ funnelHref, fag = null, valgt = null }) {
  // ⚠️ FAGET FØLGER FANEN I BEVIS-SEKTIONEN. Klikker den besøgende "VVS"
  // deroppe, skifter regnestykket hernede med — ellers ser en VVS'er sit eget
  // fag i beviset og en rengøringsaftale som sit eksempel to sektioner senere.
  // En eksplicit `fag`-prop vinder (fag-siderne sætter deres eget og har ingen
  // faner at følge). Se components/salg/FagKontekst.js.
  const { fag: fraKontekst } = useFag("rengoring");
  const brugtFag = fag || fraKontekst;
  const a = byggAnker(brugtFag, valgt);
  // ⚠️ REGNET, IKKE SKREVET: 4.990 / 12 = 415,83 → "ca. 416 kr./md.". Et
  // håndskrevet tal ville stå forkert dagen efter en prisændring.
  const prMaaned = Math.round(PLAN.yearly / 12).toLocaleString("da-DK");

  // ⚠️ INTERN HÆNDELSE, ingen Meta. Fortæller om ankeret faktisk blev SET —
  // det er sidens stærkeste argument, og vi skal kunne se om folk når ned til det.
  //
  // ⚠️ DEN FYRER PÅ SYNLIGHED, IKKE PÅ RENDER. Sektionen ligger langt nede;
  // fyrede den ved montering, ville hver eneste sidevisning tælle som "set", og
  // tallet ville måle indlæsninger frem for opmærksomhed. Et måletal med et
  // forkert navn er værre end intet måletal — den næste der læser rapporten,
  // tror den betyder noget den ikke gør.
  //
  // ⚠️ ÉN GANG PR. SIDEVISNING. `sendt` forhindrer at et fag-skift eller en
  // scroll frem og tilbage tæller igen.
  const ref = useRef(null);
  const sendt = useRef(false);
  useEffect(() => {
    const el = ref.current;
    // Ingen IntersectionObserver (meget gamle browsere): så springer vi
    // målingen over. Den må aldrig stå i vejen for at sektionen vises.
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (poster) => {
        if (sendt.current) return;
        if (poster.some((p) => p.isIntersecting)) {
          sendt.current = true;
          sporFunnel("ValueAnchorViewed", { fag: brugtFag, sted: "forside" });
          obs.disconnect();
        }
      },
      // 40 % synlig: nok til at beløbene rent faktisk har været på skærmen,
      // ikke bare sektionens øverste kant.
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [brugtFag]);

  return (
    <section className="sg-sek sg-graa" id="vaerdi" ref={ref}>
      <div className="sg-wrap">
        <div className="sg-midt">
          <span className="sg-kick">Regnestykket</span>
          <h2 className="sg-big">
            {a.loebende ? "Hvad er én fast kunde værd?" : "Hvad er én opgave værd?"}
          </h2>
          <p className="sg-lead">
            Birdly koster {priceText.yearlyBare} ekskl. moms for et helt år.
          </p>
        </div>

        <div className="sg-vaerdi">
          {/* ═══════════════ VENSTRE — EKSEMPLET ═══════════════
              ⚠️ BADGET HEDDER KUN "EKSEMPEL". Det bar før hele labelen
              ("EKSEMPEL · FAST ERHVERVSRENGØRING"), og et 320px badge ved siden
              af et 90px badge læses som skævt, selv når de er pixel-identisk
              placeret. Navnet står nu som kortets første linje, hvor det hører
              hjemme. Begge badges er nu korte og sammenlignelige. */}
          <div className="sg-vaerdi-boks">
            <span className="sg-badge">Eksempel</span>
            <div className="sg-vaerdi-navn">{a.navn}</div>
            {/* Scenariet gør tallet konkret nok til at kunden kan holde det op
                mod sin egen hverdag. Det står kun på husets standard-eksempel —
                har hun selv valgt et interval, ville det være vores antagelse
                om hendes forretning. */}
            {a.scenarie.length > 0 && (
              <ul className="sg-scenarie">
                {a.scenarie.map((linje) => <li key={linje}>{linje}</li>)}
              </ul>
            )}
            {a.loebende ? (
              <>
                <div className="sg-tal">{a.maaned}</div>
                {/* ⚠️ LIGHEDSTEGNET ER DÆMPET MED VILJE. Hierarkiet er
                    månedsbeløb → årsbeløb; et stort "=" imellem stjal
                    opmærksomhed fra begge tal. */}
                <div className="sg-vaerdi-lig" aria-hidden="true">=</div>
                <div className="sg-vaerdi-aar">{a.aar}</div>
              </>
            ) : (
              <div className="sg-tal">{a.opgave}</div>
            )}
          </div>

          <div className="sg-vaerdi-vs" aria-hidden="true">mod</div>

          {/* ═══════════════ HØJRE — BIRDLY ═══════════════
              ⚠️ HELE SAMMENLIGNINGEN BOR HER. Kortet bar før kun prisen og så
              tomt ud ved siden af eksemplet; forholdstallet stod som en løs
              linje under kortene, hvor det blev læst som en fodnote. Nu er
              pointen inde i kortet, hvor prisen er — man skal kunne forstå
              sektionen uden at læse noget under kortene.

              ⚠️ SAMMENLIGNING, IKKE AFKAST. "svarer til ca. 24× Birdlys
              årspris" beskriver forholdet mellem en kontraktværdi og en
              abonnementspris. "24× ROI", "24× afkast" eller "Birdly giver 24×"
              ville sige noget om penge der kommer retur — og det er præcis den
              påstand vi ikke må fremsætte. Se lib/vaerdiAnker.js. */}
          <div className="sg-vaerdi-boks sg-pris-side">
            <span className="sg-badge sg-badge-lys">Birdly</span>
            <div className="sg-vaerdi-navn">Birdly et helt år</div>
            <div className="sg-tal">{priceText.yearlyBare}</div>
            <div className="sg-vaerdi-aar">ekskl. moms</div>
            <div className="sg-pris-md">ca. {prMaaned} kr./md.</div>

            {(a.forhold || a.andel) && (
              <div className="sg-pris-sammenlign">
                {a.loebende ? (
                  <>
                    <span className="sg-sml-over">Én fast aftale i denne størrelse svarer til</span>
                    <span className="sg-sml-tal">{a.forhold.tekst}</span>
                    <span className="sg-sml-under">Birdlys årspris</span>
                  </>
                ) : (
                  <>
                    <span className="sg-sml-over">Et helt års Birdly svarer til</span>
                    <span className="sg-sml-tal">{a.andel}</span>
                    <span className="sg-sml-under">af værdien på en opgave i den størrelse</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ⚠️ KUN DE TO FORBEHOLD HER. Den betingede afslutning ("Vinder I bare
            én relevant opgave…") stod også her, men sammenligningen bor nu inde
            i det mørke kort — og så sagde de to linjer stort set det samme med
            tyve pixels mellemrum. Forbeholdene bliver: `kilde` siger at beløbet
            er et eksempel, `forbehold` at vi ikke garanterer en vundet opgave.
            Begge er obligatoriske. */}
        {a.kilde && <p className="sg-forbehold">{a.kilde}</p>}
        <p className="sg-forbehold">{a.forbehold}</p>

        <div className="sg-cta-row" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="vaerdi" />
        </div>
      </div>
    </section>
  );
}
