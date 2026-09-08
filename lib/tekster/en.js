// ============================================================================
// EN-GB — verbatim fra BIRDLY_UK_FULL_SITE_COPY_EN_GB_2026-09-08.md.
//
// ⚠️ OVERSÆT ALDRIG EN DANSK STRENG HERTIL. Copy-filen er sandhedskilden, og
// den siger det selv: en normal britisk virksomhed der taler til en anden —
// ikke et dansk SaaS-site oversat til korrekt engelsk. Mangler en sætning,
// slås den op i filen; findes den ikke der, skrives den ikke her.
//
// ⚠️ en-GB, IKKE en-US. Britisk stavning ("organisation", "recognise").
// ⚠️ "text" / "straight to your phone", ALDRIG "SMS" i marketingtekst.
// ============================================================================

export const en = {
  hero: {
    // §4 HERO. Copy-filen skriver eyebrow i versaler; komponentens CSS sætter
    // selv versalerne, så strengen holdes i almindelig skrift.
    eyebrow: "For cleaning & service firms",
    overskrift: "Get more cleaning and service contracts.",
    overskriftEm: "Without hunting for them.",
    under:
      "Birdly finds public and private work that fits your business — and sends new matches straight to your phone.",
    chips: ["Cleaning", "Window cleaning", "Communal cleaning", "Facilities services", "Commercial cleaning"],
    chipsLabel: "Examples of the work we find",
  },

  bevis: {
    // §4 LIVE DATA STRIP.
    //
    // ⚠️ TALLENE ER BRITISKE, IKKE DANSKE. Copy-filen er utvetydig: "Use UK
    // database values only" og "If UK data is not live yet, hide the numbers
    // rather than showing Danish numbers". Det er muligt netop fordi
    // get-opgave-tal blev market-scopet 08-09-2026 — indtil da ville denne
    // stribe have vist DK+GB blandet sammen.
    overskrift: "Birdly is already keeping watch",
    opdateret: "Last updated",
    aabne: "contracts with an open deadline",
    bydbare: "opportunities we're keeping an eye on",
    nye: "new in the last 7 days",
    // ⚠️ FREKVENSEN ER ET FAKTUM OM MOTOREN, ikke en oversættelse: cron kører
    // to gange dagligt for begge markeder.
    frekvensTal: "2× a day",
    frekvens: "Birdly checks for new work",
  },

  trust: ["14 days free", "No portal", "No long-term lock-in", "Match Guarantee"],

  // ⚠️ IKKE MED ENDNU, OG DET ER MED VILJE:
  //
  // · MATCH GUARANTEE-MIKROTEKSTEN (§4). Copy-filen: "Do not publish this if
  //   UK terms are not final." De britiske vilkår er DRAFT, så den juridiske
  //   formulering skrives ikke her. Chippen "Match Guarantee" står i trust-
  //   rækken som copy-filen foreskriver, men uden det bindende løfte under.
  //
  // · COST OF MISSING IT — EKSEMPELKORTET (§4). Copy-filen bruger
  //   pladsholdere: "around £[EXAMPLE_MONTHLY]/month". Der findes ingen
  //   godkendte britiske tal, og jeg opfinder dem ikke. Sektionen udelades,
  //   indtil Jonas har et rigtigt eksempel — samme regel som DK's
  //   vaerdiAnker.js, hvor hvert tal har en kilde.
};
