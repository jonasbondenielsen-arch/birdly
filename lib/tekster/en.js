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

  // §4 VALUE / REAL WORK.
  vaerdi: {
    kick: "Real contracts. Real money.",
    // ⚠️ COPY-FILENS EGEN RESERVE, IKKE DENS HOVEDFORSLAG — og det er filens
    // eget valg, ikke mit. Den skriver "A cleaning contract can be worth
    // hundreds of thousands of pounds" og tilføjer straks: "Do not state this
    // unless current UK data supports this ... Preferred if proof is not yet
    // ready: One good cleaning contract can be worth serious money."
    // Der findes ingen godkendte britiske tal, så reserven er den rigtige.
    // ⚠️ Skift den ALDRIG til det store tal uden at have kilden i hånden.
    stoerrelse: "One good cleaning contract can be worth serious money.",
    lead: "Birdly finds relevant public and private cleaning work. You decide which contracts are worth going for.",
    vindOver: "You don't need to win lots.",
    // Fremhaevningen ligger paa de sidste ord, som i DK. Delene samles til
    // "You just need to win one."
    vindUnder1: "You just need to ",
    vindUnder2: "win one.",
  },

  // §4 PUBLIC CONTRACTS FOR SMALL FIRMS.
  offentlige: {
    kick: "Public contracts",
    overskrift: "Public contracts aren't just for the big cleaning firms.",
    brod:
      "And they don't have to be a nightmare. Councils, schools, academy trusts, housing associations and other public bodies put cleaning and service work out to tender all the time — in all sorts of sizes.",
    // ⚠️ "We text you", ikke "We SMS you". Copy-filens sprogregel.
    trin: ["Birdly finds it", "We text you", "You decide if it's worth going for"],
    rolle1: "Birdly finds the relevant ones.",
    rolle2: "You pick the ones worth going for.",
  },

  // §4 DIFFERENCE / OLD WAY VS BIRDLY → "Final headline" og "Supporting".
  // Den mørke overgang er DK's plads til præcis den pointe.
  overgang: {
    overskrift: "Those contracts are already out there.",
    stor1: "The only question is whether you ",
    stor2: "see them in time",
    stor3: " — and decide to go for them.",
  },

  // §4 DIFFERENCE / OLD WAY VS BIRDLY.
  portal: {
    kick: "The difference",
    overskrift: "Another tender portal?",
    overskrift2: "No thanks.",
    gammel: {
      titel: "The old way",
      under: "A typical tender service",
      punkter: ["Log in", "Search", "Set filters", "Open opportunities", "Read", "Sort", "Repeat"],
    },
    ny: {
      titel: "Birdly",
      under: "Tell us once",
      punkter: [
        "Birdly keeps an eye out",
        "Birdly finds relevant work",
        "It lands straight on your phone",
        "You pick the ones worth going for",
      ],
    },
    // Copy-filens "Strong line" staar paa to linjer; DK's payoff er een linje,
    // saa de to saetninger samles her.
    payoff: "You don't go looking. Birdly does.",
    // ⚠️ EJER-SAETNINGEN. DK laeser den fra EJER_LINJE i salgTekst.js; her er
    // copy-filens britiske udgave ("Body" under samme afsnit). Den er ikke en
    // oversaettelse af den danske - den er filens egen.
    ejerLinje: "Tell us what sort of work you want. We keep watch. You get the message.",
    afslut: "Birdly isn't here to give you more software. It's here to give you relevant work.",
  },

  // §26 START / ONBOARDING CTA COPY.
  //
  // ⚠️ UK ER ET RENT CLEANING-PRODUKT (beslutning 09-09-2026). `rengoring` er
  // det eneste GB-fag med ægte match-data, så det er det eneste vi kan tilbyde
  // ærligt. Derfor er der INGEN fagvælger i funnelen: faget er implicit, og en
  // vælger med ét valg ville være en formular der lader som om den spørger.
  // Vælgeren er fast-follow den dag GB får flere fag.
  //
  // ⚠️ COPY-FILENS §26 SIGER "across England". VORES REGIONER DÆKKER MERE:
  // Scotland, Wales og Northern Ireland er med i de 12. Den linje er derfor
  // ikke skrevet af her — se noten i rapporten. Der står i stedet det de 12
  // regioner faktisk dækker.
  funnel: {
    // §26, ordret.
    eyebrow: "For cleaning & service firms",
    overskrift: "Find contracts that fit your business.",
    // ⚠️ "across the UK", IKKE §26's "across England". Vores 12 regioner
    // dækker Scotland, Wales og Northern Ireland, så "England" alene ville
    // være usandt. Rettelsen er Jonas' (brief 09-09-2026).
    under:
      "Tell Birdly what you do. We'll look for relevant public and private work across the UK and send the right matches straight to your phone.",
    intro: "Let's see what Birdly can find for you.",
    trust: "£0 today · 14 days free · No long-term lock-in",
    cta: "Show me relevant contracts",
    tilbage: "Back",

    firma: {
      // §26's terminologi. Etiketten ER spørgsmålet.
      label: "Company number",
      // ⚠️ ASYMMETRIEN, SOM I DK's CVR-GATE:
      //   ugyldigt format  → stop, bed om rettelse (vi ved den er forkert)
      //   ikke fundet      → blokér nummer-stien, men tilbyd cleaning-vejen
      //   opslag fejler    → LUK IGENNEM. Vores fejl må aldrig spærre en
      //                      rigtig virksomhed ude midt i en tilmelding.
      ugyldig:
        "That doesn't look like a UK company number. It's usually 8 digits (like 01234567), or two letters and six digits (like SC123456).",
      ikkeFundet:
        "We couldn't find that company on Companies House. Double-check the number — or if you don't have a company number, carry on as a cleaning business.",
      opslagFejlede: "We couldn't check that just now — no problem, carry on.",
      // ⚠️ ADVAR-MEN-TILLAD. Et opløst selskab kan ikke vinde en kontrakt, men
      // den der stod bag handler måske videre. Vi lukker ingen ægte
      // rengøringsvirksomhed ude — vi siger sandheden og lader hende gå videre.
      oploest:
        "This company looks dissolved on Companies House. If you're still trading, carry on as a cleaning business.",
      udenNummer: "Don't have a company number?",
      soleTrader: "Continue as a cleaning business",
    },

    omraade: {
      label: "Areas you cover",
      postnummer: "Postcode",
    },

    // ⚠️ BÅNDENE ER ET MATCHKRITERIUM, IKKE EN OVERSÆTTELSE.
    // Tærsklerne bindes til `max_amount` i match-reglen præcis som DK's.
    // Ændrer du et tal her, ændrer du hvad kunden får — ikke en etiket.
    stoerrelse: {
      label: "What size of contracts are you interested in?",
      baand: [
        { key: "u25k", label: "Under £25,000" },
        { key: "25k-100k", label: "£25,000–£100,000" },
        { key: "100k-500k", label: "£100,000–£500,000" },
        { key: "500k+", label: "£500,000+" },
      ],
    },

    type: {
      offentlig: "Public contracts",
      privat: "Private jobs",
      begge: "Both",
    },

    kontakt: {
      firmanavn: "Company name",
      email: "Email",
      mobil: "Mobile number",
      mobilHjaelp: "We'll text this number when something fits",
    },

    betaling: {
      foersteBetaling: "Your first payment date",
      exVat: "ex VAT",
    },
  },

  // §4 FINAL CTA.
  slut: {
    overskrift: "Your next good contract might already be out there.",
    under: "Let Birdly keep an eye out for you.",
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
