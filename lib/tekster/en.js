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

    // ── FUNNELENS FREMDRIFT ──
    //
    // ⚠️ NAVNGIVNE ETAPER, ALDRIG "Step 3 of 6". Husets regel staar i
    // components/Start.js: "Et taelleværk fortaeller kunden hvor lang
    // formularen er; en etape fortaeller hende hvad hun er i gang med. Det
    // foerste faar en funnel til at ligne en blanket fra det offentlige."
    // DK fjernede taelleværket 06-09-2026 - UK skal ikke genindfoere det.
    //
    // ⚠️ DE TRE NAVNE ER SKREVET AF CC, IKKE HENTET I COPY-FILEN.
    // Filen har ingen etape-navne. De staar derfor i UNDTAGET i
    // scripts/verify-uk-copy.mjs med den grund, saa det bliver ved med at
    // vaere synligt. Ordforraadet er filens eget: "Company" fra "Company
    // number"/"Company name", "Work" fra "relevant public and private work",
    // og "Start Birdly" er husets egen (DK's fjerde etape hedder det samme).
    //
    // ⚠️ TRE ETAPER, IKKE DK's FIRE. DK's tredje hedder "Dine match" og
    // daekker en skaerm der VISER match. Den skaerm findes ikke i den britiske
    // funnel, og en etape uden indhold ville vaere et loefte om et trin der
    // aldrig kommer.
    // ⚠️ "Contracts", ikke "Work" - Jonas' polish 09-09-2026:
    // konsistens med resten af UK-copy'en ("cleaning and service contracts",
    // "What size of contracts", "Public contracts"). Etapen daekker omraade,
    // stoerrelse og type, og alle tre spoerger om KONTRAKTER.
    etaper: ["Company", "Contracts", "Start Birdly"],
    // Skjult label til skaermlaesere. Chrome, ikke salgscopy.
    etapeOrd: "Stage",
    etapeAf: "of",

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

  // §4 THE SOLUTION.
  loesningen: {
    kick: "The simple bit",
    overskrift: "Birdly does the looking.",
    overskrift2: "You get the message.",
    punkter: [
      "Your line of work",
      "Your area",
      "The contract sizes you want",
      "Public and private work",
    ],
    lead: "When something fits, Birdly sends it straight to your phone and email.",
    afslut: "Less searching. More relevant work.",
  },

  // §4 MESSAGE SECTION.
  //
  // ⚠️ "your phone" / "text", ALDRIG "SMS". Copy-filens sprogregel: britiske
  // virksomheder siger "text", og "SMS" lyder teknisk-europæisk.
  sms: {
    kick: "The message",
    // DK henter de her tre fra salgTekst.js; GB har dem fra copy-filen.
    // ⚠️ EEN STRENG, IKKE TO. Copy-filen skriver overskriften paa to linjer,
    // men DK renderer den som EEN tekstnode uden <br />. Deles den her, faar
    // den britiske side en anden nodestruktur end den danske - og saa er det
    // ikke laengere samme komponent.
    linje: "Relevant contracts. Straight to your phone.",
    lead1: "Birdly automatically finds public and private work that fits your business.",
    lead2: "When something looks right, we'll let you know.",
    ikkeHoldeOeje: "You don't need to keep an eye on Birdly. Birdly keeps an eye out for you.",
    punkter: ["Short summary", "Deadline", "Direct link", "Bid template where relevant"],
    // ⚠️ TELEFONENS EKSEMPEL I DEN HER SEKTION. Hero'ens står under `telefon`.
    // Begge er opdigtede illustrationer, mærket som eksempel i komponenten.
    telefonTitel: "New contract match",
    telefonFrist: "18 Sep",
  },

  // §4 COST OF MISSING IT.
  //
  // ⚠️ UDEN BELØB, OG DET ER HUSETS EGEN REGEL — ikke en mangel.
  // vaerdiAnker.js: "INGEN OPDIGTET UDBUDSSUM ... skal komme fra en RIGTIG
  // opgave i basen med oplyst værdi og være mærket som sådan."
  // ⚠️ DE FEM GB-RENGØRINGSOPGAVER HAR faktisk beløb (£200k–£4,7 mio.), men
  // den offentlige side kan ikke læse `notices` (RLS spærrer anon), og
  // get-opgave-tal returnerer bevidst KUN titel, køber og tidspunkt — det er
  // paywall-grænsen fra 30-07-2026. At vise et beløb her er derfor en
  // produktbeslutning, ikke en teknikalitet. Copy-filen har den beløbsfrie
  // udgave, og den er sand uanset.
  koster: {
    kick: "What missing one can cost",
    overskrift: "You can't bid for the contract",
    overskrift2: "you never saw.",
    lead: "One decent recurring cleaning contract can be worth many times the cost of a full year of Birdly.",
    // ⚠️ INGEN TABT-OMSÆTNING-PÅSTAND. Vi siger ikke at kunden ville have
    // vundet opgaven — kun at man ikke kan byde på det man ikke ser.
    forbehold: "Birdly doesn't promise you'll win the contract. We make sure you see the relevant opportunities in time to decide.",
  },

  // §4 THE NUMBERS / VALUE COMPARISON — ogsaa uden beløb, samme grund.
  regnestykket: {
    kick: "The numbers",
    lead: "One good recurring cleaning contract can be worth many times a full year of Birdly.",
  },

  // §4 PRICING BLOCK + §11 PLAN CARD.
  //
  // ⚠️ BELØBENE STÅR IKKE HER — DE REGNES. Copy-filen bruger pladsholdere
  // (£[UK_ANNUAL_PRICE], £[SAVING], [X] months), og Jonas har besluttet
  // tallene: £59/md. og £590/år ex VAT. De kommer fra MARKEDER.GB.pris og
  // regnes i komponenten, præcis som DK regner sine af lib/pakke.js. Et
  // håndskrevet tal ville stå forkert dagen efter en prisændring.
  //
  // ⚠️ COPY-FILEN SIGER "Do not publish prices until UK pricing is confirmed".
  // De ER bekræftet af Jonas. Men der findes stadig INGEN GBP-plan i Frisbii,
  // så prisen kan ikke opkræves endnu — GB er noindex og kommercielt lukket,
  // og kort-gaten stopper. Frisbii er den autoritative kilde; markets.js er
  // et spejl, som lib/pakke.js er det for DK.
  priser: {
    kick: "One plan. Everything included.",
    overskrift: "Try it free. Keep Birdly if it earns its keep.",
    badge: "Best value",
    planNavn: "Annual",
    exVat: "ex VAT",
    omkring: "around",
    punkter: [
      "Public + private work",
      "Text + email when something matches",
      "All matching criteria",
    ],
    ctaAar: "Start 14 days free",
    vaerdiAnker: "Win one decent contract and Birdly's price can look pretty small.",
    maanedSpm: "Prefer monthly?",
    ctaMaaned: "Choose monthly",
    ingenBinding: "no long-term lock-in",
  },

  // §4 RISK REVERSAL.
  //
  // ⚠️ MATCH GUARANTEE-MIKROTEKSTEN ER MED NU (Jonas 09-09-2026): garantien er
  // et rigtigt UK-løfte, præcis som DK, og er ikke gated på færdig jura.
  // Copy-filen kalder den selv "Working marketing version".
  // ⚠️ LINKET peger på en britisk betingelses-side der endnu er DRAFT. Det er
  // bevidst: teksten må vises, men den skal kunne slås op.
  risiko: {
    kick: "Try it without the risk",
    overskrift: "14 days free. No relevant matches? You don't pay.",
    lead: "See what Birdly can find for your business first. £0 today.",
    // ⚠️ FOERSTE PUNKT STAAR FOR SIG. DK bygger det af TRIAL_DAYS fra
    // lib/pakke.js ("14 dage gratis"); GB har det som een streng fra
    // copy-filens trust points, saa tallet ikke skal formateres to steder.
    proeveDage: "14 days free",
    punkter: ["No long-term lock-in", "No portal", "Set up in minutes"],
    garantiPraecis:
      "Match Guarantee: if we haven't sent you at least one opportunity that fits the criteria you chose within 60 days of signing up, we'll refund what you paid for that period.",
    garantiForbehold: "Terms apply.",
    garantiLink: "See the terms",
  },

  // §25 FAQ — FULL UK VERSION.
  //
  // ⚠️ HVERT SVAR ER ORDRET FRA COPY-FILEN. Ikke oversat fra DK's lib/faq.js —
  // slået op i BIRDLY_UK_FULL_SITE_COPY_EN_GB_2026-09-08.md, i to afsnit:
  // filens egen "§25 FAQ — FULL UK VERSION" og dens "PRICING FAQ" (§11).
  // Hvor de to overlapper, er PRICING-udgaven valgt: den er skrevet til
  // salgssiden og svarer på købstvivlen, ikke bare på spørgsmålet.
  //
  // ⚠️ ET SPØRGSMÅL FINDES HER KUN HVIS FILEN GIVER ET FÆRDIGT SVAR.
  // Filen svarer flere steder implementeringen i stedet for kunden — "Use the
  // actual UK notice period/terms once approved", "Use the actual UK
  // checkout/provider flow". Det er en instruks, ikke copy. De spørgsmål er
  // UDELADT frem for at få en sætning jeg selv har skrevet. Fire er ude:
  //   · "How do I cancel?"           instruks: britisk opsigelsesvarsel ikke godkendt.
  //   · "When is my card charged?"   instruks: britisk checkout ikke bygget — GB er kommercielt lukket.
  //   · "How many texts will I get?" instruks: skal matche den britiske notify-strategi, som ikke kører endnu.
  //   · "What does it cost?"         instruks: "Use confirmed UK pricing only" — prisen står i priser-sektionen.
  //
  // ⚠️ DATAKILDE-SVARET ER MED NU. Det stod som det femte udeladte, fordi
  // filen åbner det med "For England". Jonas afklarede geografien 09-09-2026:
  // det skal sige "the UK". Resten af svaret er filens eget, ordret.
  //
  // ⚠️ TO SVAR ER FILENS BETINGEDE UDGAVE, VALGT PÅ ET FAKTUM — IKKE ET SKØN:
  //   · "Are there different plans?" — filen: "If the UK launches with one plan:
  //     No. One plan, everything included." GB har ét produkt med to
  //     betalingsintervaller (markets.js GB.pris), og priser-sektionen siger
  //     allerede "One plan. Everything included." Betingelsen er opfyldt.
  //   · "Can Birdly help us with the bid itself?" — filen giver to udgaver, "if
  //     bid template is live" og "if not". Der findes ingen britisk
  //     bud-skabelon-rute (kun /uk og /uk/start). "Not yet" er den sande.
  faq: {
    // "FAQ" er filens eget ord for sektionen (footer-linklisten i §27 og
    // overskrifterne "CLEANING FAQ" / "PRICING FAQ").
    kick: "FAQ",
    overskrift: "The questions you're probably thinking right now.",

    // ⚠️ FOLDEKNAPPENS ETIKETTER ER UI-CHROME, IKKE SALGSCOPY — de står i
    // UNDTAGET i scripts/verify-uk-copy.mjs med den grund. Copy-filen beskriver
    // ikke at FAQ'en foldes; foldningen er husets egen løsning (se noten i
    // lib/faq.js: seks synlige, resten foldet men stadig i HTML'en, så de kan
    // crawles).
    merePrefix: "See all questions",
    mereSuffix: "more",
    skjul: "Show fewer questions",

    // ── DE SEKS SYNLIGE. Samme princip som DK's SALG_SYNLIGE: det er de
    //    FAKTISKE købstvivl, ikke detaljer man leder efter bagefter.
    top: [
      {
        sp: "What sort of work does Birdly find?",
        svar: "Birdly finds public-sector contracts from buyers such as councils, schools, academy trusts, housing associations, NHS bodies, government organisations and other public buyers. It can also include private jobs posted directly on Birdly.",
      },
      {
        sp: "Is Birdly for small firms?",
        svar: "Yes. That's who we built it for. Sole traders and small teams can use Birdly just as much as larger firms. You choose the contract sizes and areas that make sense for you.",
      },
      {
        sp: "Do I have to search for work myself?",
        svar: "No. Choose your services, area and preferred contract size. Birdly keeps an eye out. When something fits, you'll get a text and email.",
      },
      {
        sp: "Is there a Birdly platform I need to log into?",
        svar: "No — deliberately. There are enough platforms already. Birdly keeps the technical bit out of the way and sends you a clear message when something fits. No dashboard routine. No daily searching.",
      },
      {
        sp: "What happens after the 14-day free trial?",
        // ⚠️ FILENS SIDSTE SÆTNING ER IKKE MED: "Show the exact first billing
        // date clearly in checkout" er en instruks til checkout, ikke et svar
        // til kunden — og GB har ingen checkout endnu.
        svar: "£0 today. If you cancel before the free trial ends, you won't be charged. If you keep Birdly, your chosen monthly or annual plan starts after the trial.",
      },
      {
        sp: "How does the Match Guarantee work?",
        // ⚠️ ORDRET DEN SAMME SÆTNING SOM risiko.garantiPraecis OVENFOR.
        // Filens FAQ-post siger kun "Use the approved UK legal wording only" —
        // og den godkendte ordlyd står i filens EGEN RISK REVERSAL-sektion, som
        // Jonas godkendte 09-09-2026, og som allerede vises på SAMME side. At
        // lade FAQ'en tie om et løfte siden giver ti sektioner længere oppe
        // ville være underligere end at gentage det.
        // ÆNDRER DU DEN ENE, ÆNDR DEN ANDEN.
        svar: "Match Guarantee: if we haven't sent you at least one opportunity that fits the criteria you chose within 60 days of signing up, we'll refund what you paid for that period. Terms apply.",
      },
    ],

    // ── RESTEN. Foldet, men ALDRIG fjernet fra HTML'en: det er husets eneste
    //    sted med den fulde forklaring, og den skal kunne crawles.
    rest: [
      {
        sp: "Do I need to log in every day?",
        svar: "No. Birdly is deliberately built so you don't have another portal to remember. The relevant work comes to you.",
      },
      {
        sp: "Can I turn private jobs off?",
        svar: "Yes. Choose public contracts, private jobs or both.",
      },
      {
        sp: "Will I only get work that matches me?",
        svar: "Yes. Your services, area and contract-size preferences drive the matches.",
      },
      {
        sp: "How quickly do I hear about something?",
        // ⚠️ FILENS ANDEN SÆTNING ER EN INSTRUKS ("Use wording that matches the
        // actual UK ingestion frequency") og er ikke med. Filen vælger selv den
        // svage form frem for et løfte motoren ikke kan holde — og GB's motor
        // kører ikke endnu (markets.js: dataLever: false).
        svar: "Usually as soon as Birdly processes a new relevant notice.",
      },
      {
        sp: "Are there different plans?",
        svar: "No. One plan, everything included. No tiers and no paid add-ons just to unlock basic matching.",
      },
      {
        sp: "Can Birdly help us with the bid itself?",
        svar: "Not yet. First we want to make finding the right contracts stupidly simple. Bid support is on the roadmap.",
      },
      {
        sp: "Where does the public contract data come from?",
        // ⚠️ "For the UK", IKKE copy-filens "For England". Jonas' beslutning
        // 09-09-2026: de 12 regioner og Find a Tender dækker Skotland, Wales
        // og Nordirland, og funnelen siger allerede "across the UK". Lod vi
        // sidens EGEN kildeforklaring sige "For England", ville de to modsige
        // hinanden tre klik fra hinanden. Resten af svaret er filens eget,
        // ordret — se FRA_BRIEF i scripts/verify-uk-copy.mjs.
        //
        // ⚠️ FILENS TO AFSNIT ER SLÅET SAMMEN TIL ÉT. Det er en
        // formateringsbeslutning, ikke en omskrivning: FaqListe renderer ét
        // svar pr. spørgsmål, og begge sætninger står ordret.
        svar: "For the UK, Birdly uses official public procurement data, with Find a Tender as the main central source for new Procurement Act notices. We can also use other official and buyer sources where needed. The tender documents and submission itself may sit on a separate e-tender portal, and Birdly links you back to the original source. The raw notices are public. Birdly's job is to do the watching, filtering and matching so you don't have to.",
      },
      {
        sp: "Does Birdly write the tender for me?",
        svar: "No. Birdly can help organise the information, but it doesn't replace your judgement or write a guaranteed winning bid. You are responsible for checking the official documents and submitting the final response.",
      },
      {
        sp: "Do I still need the official tender documents?",
        svar: "Yes. Birdly gives you the useful summary and direct link, but the buyer's official tender documents are the source of truth. You may need to create a free supplier account on the buyer's tender portal to download documents or submit your bid.",
      },
    ],
  },

  // §30 SEO / META LANGUAGE.
  //
  // ⚠️ DE HER TO STRENGE FINDES FORDI /uk ARVEDE RODLAYOUTETS DANSKE
  // OG-TAGS. Et delt link til den britiske side viste "Offentlige og private
  // opgaver direkte paa SMS | Birdly" med dansk brødtekst - maalt 09-09-2026.
  // Sidens `title` og `robots` var rigtige hele tiden; det var kun
  // Open Graph og Twitter der faldt igennem.
  //
  // ⚠️ "across the UK", IKKE copy-filens "across England". Jonas'
  // afklaring 09-09-2026, samme som i funnelen og i FAQ'ens datakilde-svar.
  //
  // ⚠️ INGEN OG-BILLEDE ENDNU. Det danske billede siger "offentlige
  // opgaver direkte paa SMS" med dansk tekst brændt ind, og et britisk
  // findes ikke. Hellere intet billede end et dansk - se pre-live-tjeklisten.
  meta: {
    ogBeskrivelse:
      "Birdly finds relevant public and private cleaning work across the UK and sends the right matches straight to your phone. 14 days free.",
    ogSite: "Birdly",
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
