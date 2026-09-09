"use client";

import { useEffect, useRef } from "react";
import Cta from "./Cta";
import VaerdiKort from "./VaerdiKort";
import { Flueben } from "./Ikoner";
import { priceText } from "../../lib/pakke";
import { byggAnker } from "../../lib/vaerdiAnker";
import { tekster, t } from "../../lib/tekster";
import { VIND_EN } from "../../lib/salgTekst";
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
export function Vaerdi({ funnelHref, fag = null, valgt = null, marked = "DK" }) {
  const T = tekster(marked).regnestykket;

  // ⚠️ FAGET FØLGER FANEN I BEVIS-SEKTIONEN. Klikker den besøgende "VVS"
  // deroppe, skifter regnestykket hernede med — ellers ser en VVS'er sit eget
  // fag i beviset og en rengøringsaftale som sit eksempel to sektioner senere.
  // En eksplicit `fag`-prop vinder (fag-siderne sætter deres eget og har ingen
  // faner at følge). Se components/salg/FagKontekst.js.
  const { fag: fraKontekst } = useFag("rengoring");
  const brugtFag = fag || fraKontekst;
  // ⚠️ ANKERET ER DANSK INDTIL DER ER GODKENDTE BRITISKE KONTRAKTBELOEB.
  // byggAnker regner paa DKK fra lib/vaerdiAnker.js, og den fil siger selv at
  // et beloeb her SKAL komme fra en rigtig opgave med oplyst vaerdi.
  // GB viser derfor copy-filens beloeb-frie udgave: samme pointe, ingen
  // opdigtet sum, intet dansk tal. De fem GB-rengoeringsopgaver HAR faktisk
  // beloeb i basen (£200k-£4,7 mio.), men de ligger bag paywall-graensen fra
  // 30-07-2026 - se den fulde note i Sektioner.js' ProblemPris.
  const a = marked === "DK" ? byggAnker(brugtFag, valgt) : null;

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
          <span className="sg-kick">{T.kick}</span>
          {/* ⚠️ OVERSKRIFTEN SÆLGER POINTEN, IKKE SPØRGSMÅLET. "Hvad er én fast
              kunde værd?" er en overskrift man skal svare på selv; den her
              siger konklusionen først og lader kortene nedenunder vise
              regnestykket. Fremhævningen ligger på "vinde én". */}
          <h2 className="sg-big">
            {marked === "DK" ? VIND_EN.over : (t(marked, "vaerdi.vindOver") || "")}
            <span className="sg-big-em">
              {marked === "DK" ? VIND_EN.underDel1 : (t(marked, "vaerdi.vindUnder1") || "")}
              <b>{marked === "DK" ? VIND_EN.underDel2 : (t(marked, "vaerdi.vindUnder2") || "")}</b>
            </span>
          </h2>
          <p className="sg-lead">
            {!a
              ? T.lead
              : a.loebende
                ? <>En enkelt god rengøringsaftale kan være mange gange mere værd end et helt års Birdly.</>
                : <>En enkelt god opgave kan være mange gange mere værd end et helt års Birdly.</>}
          </p>
        </div>

        {/* ⚠️ ÉN DELT KOMPONENT. Kortene var før bygget her OG i Start.js med
            hver sit sæt klasser, og derfor stod de justeret forskelligt på
            forsiden og i funnelen. Nu findes markup og styling ét sted —
            components/salg/VaerdiKort.js. */}
        {/* ⚠️ REGNESTYKKE-KORTET RENDERES KUN MED ET AEGTE ANKER. */}
        {a && <VaerdiKort anker={a} />}

        {/* ⚠️ KUN DE TO FORBEHOLD HER. Den betingede afslutning ("Vinder I bare
            én relevant opgave…") stod også her, men sammenligningen bor nu inde
            i det mørke kort — og så sagde de to linjer stort set det samme med
            tyve pixels mellemrum. Forbeholdene bliver: `kilde` siger at beløbet
            er et eksempel, `forbehold` at vi ikke garanterer en vundet opgave.
            Begge er obligatoriske. */}
        {a?.kilde && <p className="sg-forbehold">{a.kilde}</p>}
        {a && <p className="sg-forbehold">{a.forbehold}</p>}

        {/* ══════════════════════════════════════════════════════════════════
            DET STØRRE ANKER — offentlige opgaver.

            ⚠️ INGEN OPDIGTET UDBUDSSUM. Der står "kan være flere hundredetusinde
            kroner" — ikke et konkret beløb, og ikke et eksempel-udbud vi har
            fundet på. Beholdningen svinger, og vi har ingen dokumentation for et
            typisk niveau. Skal der en dag stå et tal her, skal det komme fra en
            RIGTIG opgave i basen med oplyst værdi og være mærket som sådan.

            ⚠️ KUN PÅ LØBENDE FAG. Projektfagene har allerede deres eget anker i
            kortet ovenfor, og to beløbsargumenter i træk ville udvande begge.
            ══════════════════════════════════════════════════════════════════ */}
        {a?.loebende && (
          <div className="sg-stort-anker">
            <span className="sg-kick">Og det kan være langt større</span>
            <h3>Offentlige rengøringsopgaver kan være flere hundredetusinde kroner værd.</h3>
            <p>
              Det kan være rengøring for kommuner, institutioner, boligorganisationer og
              andre offentlige kunder.
            </p>
            <div className="sg-stort-anker-pris">
              <span>Birdly et helt år</span>
              <b>{priceText.yearlyBare}</b>
            </div>
            {/* ⚠️ EN VARIATION, IKKE SAMME SÆTNING IGEN. "I skal bare vinde én"
                står allerede to gange på siden — tidligt i "Det er rigtige
                opgaver" og som overskrift her i regnestykket. Tre gange gør den
                til en talemåde i stedet for et argument. Samme pointe, andre ord. */}
            <p className="sg-stort-anker-slut">
              Én god opgave kan betale et helt års Birdly mange gange hjem.
            </p>
          </div>
        )}

        <div className="sg-cta-row" style={{ justifyContent: "center" }}>
          <Cta href={funnelHref} placering="vaerdi" />
        </div>
      </div>
    </section>
  );
}
