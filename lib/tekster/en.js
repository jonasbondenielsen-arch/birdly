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

  // §4 HERO, "Primary CTA" og "Secondary CTA".
  // ⚠️ PILEN STÅR IKKE HER. Copy-filen skriver "Find contracts now →", men
  // pilen er et element i komponenten (`<span aria-hidden>`), ikke en del af
  // ordlyden. Skrev vi den ind i strengen, ville en skærmlæser læse den op og
  // knappen ville have to pile den dag designet får sin egen.
  cta: {
    primaer: "Find contracts now",
    sekundaer: "See how it works",
  },

  // §4 HERO → "PHONE MOCK-UP".
  //
  // ⚠️ BIRMINGHAM, IKKE ROSKILDE — og det er ikke pynt. Telefonen står midt i
  // hero'en, og et dansk stednavn dér fortæller en britisk besøgende at sitet
  // ikke er til hende, før hun når at læse en eneste sætning.
  //
  // ⚠️ "text", ALDRIG "SMS". Copy-filens sprogregel: britiske virksomheder
  // siger "text", og "SMS" lyder teknisk-europæisk.
  telefon: {
    nu: "now",
    titel: "New contract match",
    fag: "Cleaning",
    sted: "Birmingham",
    hvad: "Office cleaning contract",
    fristLabel: "Deadline: ",
    frist: "18 Sep",
    link: "View contract →",
    stop: "Reply STOP to opt out",
    kvittering:
      "No searching. No logging in. No keeping tabs on tender portals. We'll send the next one when it comes up.",
    note: "Example message. This is what a match looks like when it lands.",
  },

  // §4 WHY BIRDLY / PROBLEM — afsnittet "THE PROBLEM" med de tre kort.
  //
  // ⚠️ DEN ØVERSTE DEL AF "WHY BIRDLY" ER IKKE MED HER. Copy-filen har en hero
  // ("Spend your time doing the work. / Not looking for it.") FØR de tre kort;
  // i DK's opbygning hører den til ejer-sætningen og ikke til Problemet-
  // sektionen. Den flyttes ikke ind her bare fordi den står i samme afsnit i
  // copy-filen — så ville den britiske forside få en sektion den danske ikke
  // har, og de to ville holde op med at være samme side på to sprog.
  problemet: {
    kick: "The problem",
    overskrift: "The work is out there.",
    overskrift2: "Finding the right bits is the problem.",
    kort: [
      {
        titel: "We find the ones that fit.",
        tekst: "We cut out the noise and find work that actually makes sense for your business.",
      },
      {
        titel: "Straight to you.",
        tekst: "No daily trawling through tender portals. When something fits, you'll hear from us.",
      },
      {
        titel: "The big firms shouldn't get the whole pitch.",
        tekst: "Public contracts are for smaller firms too. Birdly makes it easier to get in the game.",
      },
    ],
    // Copy-filen kalder den "Optional payoff if existing design has a slot".
    // Designet HAR den plads (`sg-afslut`), så den er med.
    afslut: "More relevant work. Less hunting. More business.",
  },

  // §4 HOW IT WORKS.
  motoren: {
    kick: "How it works",
    overskrift: "Tell us once what you're looking for.",
    overskrift2: "Birdly does the rest.",
    trin: [
      {
        nr: "01",
        titel: "Tell us what you want",
        tekst: "Choose your trade, area and the size of contract you want to hear about.",
      },
      {
        nr: "02",
        titel: "Birdly keeps an eye out",
        tekst: "We find relevant public and private work and filter out the rest.",
      },
      {
        nr: "03",
        titel: "Get the message",
        tekst: "When something fits, you'll get it by text and email.",
      },
    ],
    // Copy-filen: "Your criteria → Birdly keeps watch → text to your phone".
    // ⚠️ Pilene er markup i komponenten, ikke tekst — se noten ved `cta`.
    flow: ["Your criteria", "Birdly keeps watch", "text to your phone"],
    resultatlinje: "Then you only do something when the contract is actually worth a look.",
    afslut: "No daily searching. No portal. No noise.",
  },

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
