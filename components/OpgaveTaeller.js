import { daTal, rundNed } from "../lib/opgaveTal";

// ============================================================================
// OPGAVE-TÆLLER — slank bar under menuen med det levende tal.
//
// ⚠️ SAMME TAL PÅ ALLE SIDER (besluttet 30-07-2026). Baren viste før branchens eget
// tal på fag-siderne, og det var ærligt men et dårligt salgsargument: en VVS-side der
// siger "7 opgaver" sælger værre end ingen tal, og et fag med 0 i en stille uge ser ud
// som et dødt produkt. Nu viser alle sider hele den bydbare beholdning — det er sandt
// uanset hvilken side man står på, og formuleringen lover ikke at de alle passer til
// netop dit fag.
//
// Server-komponent: ren markup uden tilstand, så den koster ingen JavaScript. Tallene
// hentes server-side og står i HTML'en ved load — ingen blinkende tom bar.
//
// ⚠️ PLACERING: inde i .topstack sammen med headeren (z-index 90), så den følger med
// ned ved scroll UDEN et nyt lag. Samtykke-banner (90) og sticky-CTA (80) sidder begge
// i BUNDEN — ingen kollision.
//
// ⚠️ INTET TAL ⇒ INGEN BAR. Har serveren ikke kunnet hente tal, renderer vi ingenting
// frem for "0 opgaver". Et dødt tal er værre end ingen tæller.
// ============================================================================
// ⚠️ INGEN VARIANTER. Baren så forskellig ud på forsiden og i funnelen, fordi
// stilene lå i forside.css som /tilmeld ikke indlæser. Nu er der ét udseende, ét
// sted (globals.css) — ingen kompakt/stort-varianter der kan drive fra hinanden.
export default function OpgaveTaeller({ tal }) {
  if (typeof tal?.bydbare !== "number") return null;

  return (
    <div className="opgtal">
      <div className="opgtal-inner">
        <span className="opgtal-prik" aria-hidden="true" />
        <span className="opgtal-tekst">
          Vi har netop <b className="opgtal-num">over {daTal(rundNed(tal.bydbare))}</b> opgaver klar til at blive budt på
        </span>
      </div>
    </div>
  );
}
