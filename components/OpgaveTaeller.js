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
// forklaring. Baren, salgssiden og fag-siderne læser nu ALLE `bydbare`.
//
// `bydbare` = hele den bydbare beholdning, også udbud hvis frist er passeret. Det
// er derfor sætningen hedder "vi holder øje med" og ikke "klar til at blive budt
// på" — teksten skal være sand om hvert eneste tal den dækker.
//
// ⚠️ Feltet er dansk-filtreret i get-opgave-tal siden 03-08-2026. Uden det stod der
// 455 i stedet for 446, altså 9 udenlandske udbud ingen dansk kunde kan bruge.
//
// ⚠️ INGEN AFRUNDING MERE. `rundNed` fandtes fordi "over X" skulle blive ved med at
// være sandt mellem to cache-opdateringer. Med et præcist tal OG et synligt
// opdateringstidspunkt er der intet at dække over: tallet var sandt da vi hentede
// det, og der står hvornår det var.
export default function OpgaveTaeller({ tal }) {
  if (typeof tal?.bydbare !== "number") return null;
  const n = tal.bydbare;
  const opdateret = fmtOpdateret(tal.sidst_opdateret);

  return (
    <div className="opgtal">
      <div className="opgtal-inner">
        <span className="opgtal-prik" aria-hidden="true" />
        {/* ⚠️ TEKSTEN FULGTE MED TALLET (03-08-2026). Baren sagde "klar til at blive
            budt på", hvilket passede til bydbare_aabne (kun åben frist). `bydbare`
            tæller hele beholdningen — også udbud hvis frist er passeret — og om dem
            ville "klar til at blive budt på" være usandt. "Vi holder øje med" er
            sandt om alle, og er den formulering fag-siderne allerede bruger. */}
        {/* ⚠️ TALLET DÆKKER KUN DE OFFENTLIGE, OG DET SKAL DET BLIVE VED MED.
            Birdly leverer nu også private opgaver, men der er ~0 af dem i dag.
            Lægges de sammen — eller opfindes der et privat tal — er baren ikke
            længere sand om noget som helst, og den er hele sidens eneste
            beviselige tal. Private nævnes derfor som en MULIGHED uden tal, indtil
            antallet kan måles troværdigt. */}
        <span className="opgtal-tekst">
          Vi holder øje med <b className="opgtal-num">{daTal(n)}</b> offentlige {n === 1 ? "opgave" : "opgaver"}
          <span className="opgtal-privat"> — og nu også private opgaver</span>
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
