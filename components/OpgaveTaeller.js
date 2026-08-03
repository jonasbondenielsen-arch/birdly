import { daTal, fmtOpdateret } from "../lib/opgaveTal";

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
// ⚠️ PRÆCIST TAL, OG SAMME FELT SOM SALGSSIDEN (03-08-2026).
//
// Baren viste `bydbare` rundet ned med "over" foran: "over 400". Salgssidens
// live-boks viste `bydbare_aabne`: 338. To felter, to tal, samme site — en besøgende
// der gik fra forsiden til funnelen så beholdningen skrumpe med en fjerdedel uden
// forklaring. Begge læser nu `bydbare_aabne`: opgaver med ÅBEN FRIST lige nu.
//
// Det er også det ærligste af de to. `bydbare` tæller alt af bydbar type, også dem
// hvis frist er udløbet — dem kan man ikke byde på, og sætningen her lover netop at
// de er "klar til at blive budt på".
//
// ⚠️ INGEN AFRUNDING MERE. `rundNed` fandtes fordi "over X" skulle blive ved med at
// være sandt mellem to cache-opdateringer. Med et præcist tal OG et synligt
// opdateringstidspunkt er der intet at dække over: tallet var sandt da vi hentede
// det, og der står hvornår det var.
export default function OpgaveTaeller({ tal }) {
  if (typeof tal?.bydbare_aabne !== "number") return null;
  const n = tal.bydbare_aabne;
  const opdateret = fmtOpdateret(tal.sidst_opdateret);

  return (
    <div className="opgtal">
      <div className="opgtal-inner">
        <span className="opgtal-prik" aria-hidden="true" />
        <span className="opgtal-tekst">
          Vi har netop <b className="opgtal-num">{daTal(n)}</b> {n === 1 ? "opgave" : "opgaver"} klar til at blive budt på
        </span>
        {/* Ægte tidspunkt for seneste hentning — aldrig klientens ur. Mangler det,
            står linjen der slet ikke; et tal uden dato er bedre end en dato vi har
            fundet på. Egen span frem for en linje under, så barens højde er uændret:
            på mobil wrapper .opgtal-inner den selv ned som sin egen linje. */}
        {opdateret && <span className="opgtal-opd">Opdateret {opdateret}</span>}
      </div>
    </div>
  );
}
