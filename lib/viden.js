// ============================================================================
// /viden — KATALOG OVER GUIDES. Én kilde til URL'er, overskrifter, kategorier,
// intern linking og schema.
//
// ⚠️ EN GUIDE UDEN TEKST BLIVER IKKE PUBLICERET. Feltet `afsnit` er afbryderen:
// er det tomt, er siden `noindex`, den står ikke i /viden-oversigten, den kommer
// ikke i sitemap, og den linkes ikke til fra andre sider. Det er ikke
// overforsigtighed — tomme URL'er er præcis de "tynde sider", opgaven forbyder,
// og de ville skade sitet mere end guiderne gavner.
//
// Konsekvensen er at tingene tænder sig selv: i samme øjeblik en tekst lægges i
// `kortSvar` + `afsnit`, bliver siden indekserbar, dukker op i oversigten, i
// sitemap og i de relaterede links. Ingen flag at huske, intet at glemme.
//
// ⚠️ TEKSTEN SKRIVES IKKE HER. Brødteksten leveres af Jonas og indsættes ORDRET.
// Digt den ikke — kvaliteten af svaret ER hele grunden til at en answer engine
// citerer os frem for en andens side.
//
// ⚠️ ANSWER-FIRST ER EN STRUKTUR, IKKE EN STIL. `kortSvar` skal kunne stå helt
// alene, revet ud af siden, og stadig være et korrekt svar på H1-spørgsmålet.
// Det er den tekst en AI citerer. Kan den ikke stå alene, er den forkert skrevet.
//
// ⚠️ ÉN GUIDE, MANGE SPØRGSMÅL. Relaterede underspørgsmål hører hjemme som H2 i
// den guide de passer til — ikke som en ny næsten-identisk URL. To sider om det
// samme konkurrerer med hinanden og taber begge.
//
// ⚠️ INGEN TÆRSKELVÆRDIER I KRONER. Beløbsgrænserne for udbudspligt ændrer sig,
// og et forældet tal i en guide er værre end intet tal. Der henvises i stedet til
// Konkurrence- og Forbrugerstyrelsen, som er kilden.
//
// ⚠️ "VÆRD AT UNDERSØGE NÆRMERE", IKKE "VÆRD AT BYDE PÅ" (Jonas 25-08-2026).
// Birdly finder matchet; kunden afgør selv efter at have læst udbudsmaterialet.
// Den skelnen er hele forskellen mellem at oplyse og at anbefale.
// ============================================================================

export const VIDEN_KATEGORIER = [
  { key: "find", navn: "Find opgaver" },
  { key: "udbud", navn: "Offentlige udbud" },
  { key: "smaa", navn: "For små virksomheder" },
];

// Kilder genbruges på tværs af guides — ét sted at rette en adresse.
const K_UDBUD = { navn: "Udbud.dk", url: "https://udbud.dk" };
const K_TED = { navn: "EU/TED", url: "https://ted.europa.eu" };
const K_KFST = { navn: "Konkurrence- og Forbrugerstyrelsen", url: "https://kfst.dk" };

/**
 * @typedef Guide
 * @property {string}   slug
 * @property {string}   h1          Spørgsmålet, ordret. H1 = det folk søger på.
 * @property {string}   kategori    Nøgle fra VIDEN_KATEGORIER.
 * @property {string}   title       <title>. Naturlig, ikke keyword-stakket.
 * @property {string}   description Meta description.
 * @property {string=}  kortSvar    Det citerbare svar. TOMT = ikke publiceret.
 * @property {Array=}   afsnit      [{ h2, tekst }]. TOMT = ikke publiceret.
 * @property {string[]} relaterede  Slugs på 2-3 andre guides.
 * @property {string[]} brancher    Slugs på branchesider guiden hører sammen med.
 * @property {Array=}   sporgsmaal  [{ q, a }] til FAQPage-schema. Kun ægte Q&A.
 * @property {string=}  opdateret   ISO-dato. Vises kun når den findes.
 * @property {Array=}   kilder      [{ navn, url }].
 */

export const GUIDES = [
  // ---------------------------------------------------------------- AFVENTER
  // ⚠️ Guide 1-3 hører til batch 1, som IKKE er leveret. De står med URL, H1 og
  // metadata, så strukturen og de interne relationer er på plads — men uden
  // tekst publiceres de ikke. Læg `kortSvar` + `afsnit` ind, og de tænder selv.
  {
    slug: "find-offentlige-opgaver",
    h1: "Hvordan finder man offentlige opgaver?",
    kategori: "find",
    title: "Hvordan finder man offentlige opgaver? | Birdly",
    description:
      "Sådan finder danske virksomheder offentlige opgaver — hvor de offentliggøres, og hvordan du undgår at bruge timer på at lede.",
    relaterede: ["offentlige-udbud-for-begyndere", "find-opgaver-uden-udbudsportal", "udbud-overvaagning"],
    brancher: ["toemrer", "kloak", "rengoring"],
  },
  {
    slug: "offentlige-opgaver-for-smaa-virksomheder",
    h1: "Kan små virksomheder byde på offentlige opgaver?",
    kategori: "smaa",
    title: "Kan små virksomheder byde på offentlige opgaver? | Birdly",
    description:
      "Ja — og mange gør det. Sådan ser reglerne ud for små og mellemstore virksomheder, og hvor de mindre opgaver findes.",
    relaterede: ["offentlige-udbud-for-begyndere", "find-offentlige-opgaver", "flere-opgaver-til-haandvaerkerfirma"],
    brancher: ["murer", "maler", "elektriker"],
  },
  {
    slug: "flere-opgaver-til-haandvaerkerfirma",
    h1: "Hvordan får man flere opgaver til sit håndværkerfirma?",
    kategori: "find",
    title: "Hvordan får man flere opgaver til sit håndværkerfirma? | Birdly",
    description:
      "De kanaler danske håndværkerfirmaer får opgaver gennem — private kunder, offentlige opgaver og hvad der kræver mindst tid.",
    relaterede: ["private-og-offentlige-opgaver", "find-lokale-opgaver", "offentlige-opgaver-for-smaa-virksomheder"],
    brancher: ["toemrer", "murer", "vvs"],
  },

  // ----------------------------------------------------------------- BATCH 2
  // Tekst leveret af Jonas 25-08-2026 og indsat ORDRET. Skriv den ikke om.
  {
    slug: "offentlige-udbud-for-begyndere",
    h1: "Offentlige udbud for begyndere",
    kategori: "udbud",
    title: "Offentlige udbud for begyndere | Birdly",
    description:
      "En enkel introduktion til offentlige udbud: hvor du finder opgaverne, hvordan du læser kravene, og hvordan din virksomhed kommer i gang.",
    kortSvar:
      "Et offentligt udbud er en opgave eller kontrakt, som en offentlig organisation sender i konkurrence mellem virksomheder. Som virksomhed kan du finde opgaven, læse kravene og afgive tilbud, hvis du opfylder betingelserne.",
    afsnit: [
      {
        h2: "Det korte svar",
        tekst:
          "Kommuner, regioner, staten og andre offentlige organisationer køber løbende varer og ydelser fra private virksomheder. Det kan være alt fra håndværk, anlæg og rengøring til rådgivning, IT og andre serviceydelser. Når en opgave udbydes, beskriver ordregiveren, hvad der skal leveres, hvilke krav virksomheden skal opfylde, og hvordan tilbuddet skal afleveres.",
      },
      {
        h2: "Sådan fungerer det",
        tekst:
          "Processen afhænger af den konkrete opgave, men grundideen er enkel: En offentlig ordregiver har behov for en vare eller ydelse. Opgaven bliver offentliggjort eller sendt i konkurrence efter de regler, der gælder for det konkrete indkøb. Virksomhederne læser materialet og vurderer, om opgaven passer til dem. Hvis den gør, kan virksomheden afgive et tilbud efter de krav og frister, der står i materialet. Ordregiveren vurderer derefter tilbuddene efter de kriterier, der er beskrevet på forhånd.",
      },
      {
        h2: "Hvor finder man offentlige udbud?",
        tekst:
          "Et godt sted at begynde er Udbud.dk. Større udbud, der offentliggøres på EU-niveau, findes også på TED. Derudover kan offentlige ordregivere have information om indkøb og opgaver på deres egne hjemmesider. De aktuelle regler og tærskelværdier kan findes hos Konkurrence- og Forbrugerstyrelsen.",
      },
      {
        h2: "Skal man kunne udbudsreglerne?",
        tekst:
          "Du behøver ikke være udbudsekspert for at begynde at kigge efter offentlige opgaver. Du skal til gengæld læse materialet grundigt, hvis du vælger at afgive tilbud. Krav, dokumentation, tidsfrister og kriterier varierer fra opgave til opgave. Start gerne med opgaver, der passer naturligt til det arbejde, virksomheden allerede udfører.",
      },
      {
        h2: "Er offentlige udbud kun for store virksomheder?",
        tekst:
          "Nej. Virksomhedens størrelse afgør ikke i sig selv, om den kan byde. Det afgørende er kravene i den konkrete opgave. Nogle kontrakter kræver stor kapacitet eller omfattende dokumentation. Andre opgaver kan passe langt bedre til en mindre eller lokal virksomhed. Læs derfor kravene, før du vurderer, om opgaven er for stor.",
      },
      {
        h2: "Hvad betyder det for en mindre virksomhed?",
        tekst:
          "Du behøver ikke begynde med de største og mest komplicerede udbud. Find først opgaver, der passer til dit fag, din kapacitet og det område, du arbejder i. Derefter kan du lære processen gennem konkrete opgaver i stedet for at forsøge at forstå hele udbudssystemet på én gang.",
      },
      {
        h2: "Hvordan kan Birdly hjælpe?",
        tekst:
          "Birdly hjælper med den første del: at opdage opgaverne. Du vælger fag og område, og Birdly holder øje med opgaver, der matcher dine kriterier. Når der kommer et match, får du besked på SMS og mail. Du vurderer selv opgaven og beslutter, om du vil gå videre med den.",
      },
    ],
    kilder: [K_UDBUD, K_KFST, K_TED],
    opdateret: "2026-08-25",
    relaterede: ["find-offentlige-opgaver", "offentlige-opgaver-for-smaa-virksomheder", "udbud-overvaagning"],
    brancher: ["entreprenor", "kloak", "toemrer"],
  },
  {
    slug: "find-opgaver-uden-udbudsportal",
    h1: "Skal man selv holde øje med udbudsportaler?",
    kategori: "udbud",
    title: "Skal man selv holde øje med udbudsportaler? | Birdly",
    description:
      "Nej. Du kan selv følge Udbud.dk, TED og andre kilder, men du kan også få relevante offentlige opgaver sendt direkte til dig.",
    kortSvar:
      "Nej. Du kan selv søge efter offentlige opgaver på blandt andet Udbud.dk og TED, men du behøver ikke kontrollere portalerne løbende. En overvågningstjeneste kan holde øje og give dig besked, når der kommer opgaver, der matcher dine kriterier.",
    afsnit: [
      {
        h2: "Det korte svar",
        tekst:
          "Du kan godt selv holde øje med offentlige opgaver. Udbud.dk og TED er blandt de vigtigste steder at starte. Udfordringen er, at nye opgaver kommer løbende, og at du selv skal søge, sortere og vurdere, hvad der er relevant for din virksomhed. Derfor kan du også vælge at få overvåget markedet og kun få besked om opgaver inden for eksempelvis dit fag og geografiske område.",
      },
      {
        h2: "Sådan fungerer det",
        tekst:
          "Hvis du vil gøre det manuelt, kan du starte på Udbud.dk og TED. Udbud.dk samler danske offentlige udbud, mens TED er EU's database for udbud, der offentliggøres på europæisk niveau. Derudover kan offentlige ordregivere have information om indkøb og opgaver på deres egne hjemmesider. Du skal derfor først finde de relevante kilder og derefter kontrollere dem løbende. Alternativet er udbudsovervågning. Her bliver opgaverne overvåget for dig ud fra bestemte kriterier, og du får besked, når der kommer et match.",
      },
      {
        h2: "Hvor ofte skal man søge?",
        tekst:
          "Det afhænger af dit marked og dit fag. Hvis offentlige opgaver er en vigtig salgskanal for virksomheden, giver det mening at have en fast rutine for at holde øje. Det vigtigste er, at søgningen faktisk bliver gjort. En portal hjælper ikke meget, hvis ingen husker at kontrollere den.",
      },
      {
        h2: "Kan man finde offentlige opgaver gratis?",
        tekst:
          "Ja. Offentlige udbud kan findes gennem offentligt tilgængelige kilder som Udbud.dk og TED. Du betaler derfor ikke nødvendigvis for adgang til selve informationen. Det, en overvågningstjeneste kan hjælpe med, er arbejdet med løbende at holde øje, filtrere og give dig besked.",
      },
      {
        h2: "Hvad betyder det for en mindre virksomhed?",
        tekst:
          "En mindre virksomhed har sjældent en medarbejder, der kun arbejder med at finde nye udbud. Ejeren eller en medarbejder skal typisk passe kunder, tilbud og den daglige drift samtidig. Derfor kan manuel overvågning let blive noget, man gør, når der er tid. Og så kan interessante opgaver blive opdaget sent eller slet ikke. En enkel løsning er at få opgaverne sendt til sig og derefter selv beslutte, hvilke der er værd at undersøge nærmere.",
      },
      {
        h2: "Hvordan kan Birdly hjælpe?",
        tekst:
          "Birdly holder øje med opgaver ud fra de kriterier, du vælger. Du vælger blandt andet fag og geografisk område. Når Birdly finder en opgave, der matcher dine kriterier, får du besked på SMS og mail. Du behøver derfor ikke bruge en udbudsportal som en del af din daglige rutine.",
      },
    ],
    kilder: [K_UDBUD, K_TED],
    opdateret: "2026-08-25",
    relaterede: ["find-offentlige-opgaver", "udbud-overvaagning", "offentlige-udbud-for-begyndere"],
    brancher: ["it", "ingenior", "service"],
  },
  {
    slug: "private-og-offentlige-opgaver",
    h1: "Private eller offentlige opgaver — hvad er forskellen?",
    kategori: "find",
    title: "Private eller offentlige opgaver — hvad er forskellen? | Birdly",
    description:
      "Se forskellen på private og offentlige opgaver, hvor de kommer fra, og hvad din virksomhed skal være opmærksom på.",
    kortSvar:
      "Forskellen handler især om, hvem kunden er, og hvordan opgaven bliver købt. Private kunder bestemmer i høj grad selv, hvordan de vælger en virksomhed, mens offentlige ordregivere skal følge regler for deres indkøb.",
    afsnit: [
      {
        h2: "Det korte svar",
        tekst:
          "En privat opgave kommer fra en privatperson eller virksomhed. En offentlig opgave kommer eksempelvis fra en kommune, region, statslig myndighed eller anden offentlig ordregiver. For virksomheden kan selve arbejdet være næsten det samme. Forskellen ligger ofte i processen frem mod aftalen.",
      },
      {
        h2: "Sådan fungerer det",
        tekst:
          "Ved private opgaver kan kunden eksempelvis kontakte én eller flere virksomheder og bede om et tilbud. Processen kan være forholdsvis enkel: Kunden beskriver opgaven, virksomhederne giver en pris, og kunden vælger. Offentlige indkøb er underlagt regler, der blandt andet skal sikre konkurrence og gennemsigtighed. Derfor vil krav, frister og måden tilbud skal afleveres på ofte være mere formelle.",
      },
      {
        h2: "Er offentlige opgaver mere komplicerede?",
        tekst:
          "Nogle er. Andre er forholdsvis enkle. Der er stor forskel på et stort EU-udbud og en mindre offentlig opgave. Derfor bør du ikke vurdere hele det offentlige marked ud fra de største udbud. Se i stedet på den konkrete opgave og kravene til at deltage.",
      },
      {
        h2: "Hvilken type opgave er bedst?",
        tekst:
          "Der findes ikke ét rigtigt svar. Private opgaver kan være hurtige at gå til og kræve mindre administration. Offentlige opgaver kan være interessante, fordi det offentlige køber mange forskellige varer og ydelser og løbende sender opgaver i markedet. For mange virksomheder giver det mening at have flere kilder til nye opgaver i stedet for kun at være afhængig af én type kunde.",
      },
      {
        h2: "Hvor finder man de forskellige opgaver?",
        tekst:
          "Offentlige udbud kan blandt andet findes på Udbud.dk og TED samt hos de enkelte ordregivere. Private opgaver findes mere spredt. De kan komme gennem virksomhedens eget netværk, Google, anbefalinger, samarbejdspartnere eller tjenester, hvor private kunder opretter opgaver. Birdly kan også indeholde private opgaver, som privatpersoner eller virksomheder opretter direkte.",
      },
      {
        h2: "Hvad betyder det for en mindre virksomhed?",
        tekst:
          "En mindre virksomhed behøver ikke vælge mellem private og offentlige kunder. Det kan være en fordel at se dem som forskellige kilder til arbejde. Hvis ordrebogen normalt kommer fra anbefalinger og private kunder, kan offentlige opgaver være en ekstra kanal. Omvendt kan private opgaver supplere arbejdet for virksomheder, der allerede arbejder med det offentlige.",
      },
      {
        h2: "Hvordan kan Birdly hjælpe?",
        tekst:
          "Birdly kan sende både offentlige og private opgaver, der matcher de kriterier, du har valgt. Du bestemmer selv, hvilke typer opgaver du ønsker. Vil du kun modtage offentlige opgaver, kan private opgaver vælges fra.",
      },
    ],
    kilder: [K_UDBUD, K_KFST, K_TED],
    opdateret: "2026-08-25",
    relaterede: ["flere-opgaver-til-haandvaerkerfirma", "find-lokale-opgaver", "find-offentlige-opgaver"],
    brancher: ["toemrer", "vvs", "rengoring"],
  },
  {
    slug: "find-lokale-opgaver",
    h1: "Hvordan finder man opgaver i sit lokalområde?",
    kategori: "find",
    title: "Hvordan finder man opgaver i sit lokalområde? | Birdly",
    description:
      "Find lokale opgaver gennem anbefalinger, Google, samarbejdspartnere, private kunder og offentlige opgaver i dit område.",
    kortSvar:
      "Lokale opgaver kan komme fra anbefalinger, Google, samarbejdspartnere, private kunder og offentlige ordregivere i området. Den bedste løsning er ofte at bruge flere kanaler og begrænse søgningen til det område, virksomheden faktisk arbejder i.",
    afsnit: [
      {
        h2: "Det korte svar",
        tekst:
          "Start med de steder, hvor lokale kunder allerede leder efter virksomheder. Det kan være Google, anbefalinger, lokale samarbejdspartnere og eksisterende kunder. Men husk også kommuner og andre offentlige organisationer. De køber løbende varer og ydelser fra private virksomheder.",
      },
      {
        h2: "Sådan fungerer det",
        tekst:
          "Hvis din virksomhed arbejder inden for et bestemt område, bør din søgning efter nye opgaver afspejle det. En virksomhed i Holbæk har eksempelvis ikke nødvendigvis glæde af at bruge tid på en mindre opgave i Nordjylland. Derfor giver geografisk filtrering mening. Jo bedre du afgrænser området, desto mindre tid bruger du på muligheder, som virksomheden alligevel ikke ønsker.",
      },
      {
        h2: "Hvor kan man finde lokale private opgaver?",
        tekst:
          "Start med de mest oplagte kanaler: Eksisterende kunder kan give genbestillinger og anbefalinger. En opdateret Google-profil kan hjælpe lokale kunder med at finde virksomheden. Andre virksomheder og håndværkere kan sende arbejde videre, når opgaven ligger uden for deres eget fag eller kapacitet. Private opgavetjenester kan være endnu en kilde. Det vigtigste er ikke at være alle steder. Det er at være synlig de steder, hvor dine kunder faktisk leder.",
      },
      {
        h2: "Hvordan finder man lokale offentlige opgaver?",
        tekst:
          "Offentlige opgaver kan blandt andet findes på Udbud.dk og hos de enkelte offentlige ordregivere. Hvis du kun ønsker arbejde inden for et bestemt område, kan du fokusere overvågningen geografisk. På den måde bliver offentlige opgaver en lokal salgskanal på samme måde som Google, netværk og anbefalinger.",
      },
      {
        h2: "Hvor stort et område bør man vælge?",
        tekst:
          "Det afhænger af opgavetypen. En mindre serviceopgave kan kun være interessant tæt på virksomheden, mens en større entreprise kan retfærdiggøre længere transport. Tænk derfor ikke kun i kilometer. Tænk i, hvor langt virksomheden realistisk vil køre for den type opgave, du leder efter.",
      },
      {
        h2: "Hvad betyder det for en mindre virksomhed?",
        tekst:
          "Lokale opgaver kan være attraktive, fordi transporttid og planlægning ofte bliver enklere. Samtidig kender virksomheden måske allerede området, leverandørerne og de praktiske forhold. Det gør ikke nødvendigvis konkurrencen mindre, men det kan gøre opgaven mere praktisk at udføre.",
      },
      {
        h2: "Hvordan kan Birdly hjælpe?",
        tekst:
          "Når du opretter Birdly, vælger du det geografiske område, du ønsker opgaver fra. Birdly holder derefter øje og sender opgaver, der matcher dine valgte kriterier, direkte på SMS og mail. Du kan dermed fokusere på det område, hvor virksomheden faktisk ønsker at arbejde.",
      },
    ],
    kilder: [K_UDBUD],
    opdateret: "2026-08-25",
    relaterede: ["flere-opgaver-til-haandvaerkerfirma", "private-og-offentlige-opgaver", "udbud-overvaagning"],
    brancher: ["anlaegsgartner", "glarmester", "maler"],
  },
  {
    slug: "udbud-overvaagning",
    h1: "Hvad er udbudsovervågning?",
    kategori: "udbud",
    title: "Hvad er udbudsovervågning? | Birdly",
    description:
      "Udbudsovervågning holder automatisk øje med nye offentlige opgaver og giver dig besked, når en opgave matcher dine valgte kriterier.",
    kortSvar:
      "Udbudsovervågning betyder, at nye offentlige opgaver bliver overvåget ud fra bestemte kriterier, så du ikke selv behøver søge efter dem løbende. Når en opgave matcher eksempelvis dit fag eller område, kan du få besked og selv vurdere, om den er interessant.",
    afsnit: [
      {
        h2: "Det korte svar",
        tekst:
          "Udbudsovervågning erstatter den manuelle rutine med selv at kontrollere udbudsportaler. I stedet fortæller du, hvilke typer opgaver du leder efter. Systemet holder derefter øje og giver dig besked om matches.",
      },
      {
        h2: "Sådan fungerer det",
        tekst:
          "En overvågning kan eksempelvis tage udgangspunkt i fag, opgavetype og geografi. Når nye udbud bliver offentliggjort, sammenholdes de med de valgte kriterier. Matcher en opgave, får virksomheden besked. Det betyder ikke, at opgaven nødvendigvis er værd at byde på. Det vurderer virksomheden selv efter at have læst materialet. Formålet er at gøre det lettere at opdage de muligheder, der er værd at undersøge nærmere.",
      },
      {
        h2: "Hvad er forskellen på en udbudsportal og udbudsovervågning?",
        tekst:
          "En udbudsportal er et sted, hvor du kan finde og søge efter opgaver. Udbudsovervågning handler om at få besked uden selv at udføre den samme søgning igen og igen. De to ting kan godt bruges sammen. Du kan eksempelvis få besked om en opgave gennem en overvågning og derefter åbne den oprindelige udbudsbekendtgørelse for at læse materialet.",
      },
      {
        h2: "Hvem har brug for udbudsovervågning?",
        tekst:
          "Det kan være relevant for virksomheder, der gerne vil arbejde for offentlige kunder, men ikke ønsker at bruge tid på daglige portalsøgninger. Det gælder især virksomheder, hvor ejeren eller medarbejderne har andre hovedopgaver. Hvis du kun meget sjældent leder efter offentlige opgaver, kan manuel søgning være tilstrækkelig. Hvis du derimod vil holde løbende øje, kan overvågning gøre processen enklere.",
      },
      {
        h2: "Kan man stadig selv vælge, hvad man vil byde på?",
        tekst:
          "Ja. Udbudsovervågning finder muligheder. Den beslutter ikke, hvilke kontrakter din virksomhed skal gå efter. Når du får en opgave, bør du stadig læse krav, tidsfrister og udbudsmateriale og vurdere, om opgaven passer til virksomheden.",
      },
      {
        h2: "Hvad betyder det for en mindre virksomhed?",
        tekst:
          "En mindre virksomhed har typisk begrænset tid til administration. Derfor kan automatiseret overvågning være en måde at følge det offentlige marked uden at gøre portalsøgning til endnu en daglig arbejdsopgave. Du får besked og kan derefter hurtigt vælge: Skal vi undersøge denne opgave nærmere eller ej?",
      },
      {
        h2: "Hvordan kan Birdly hjælpe?",
        tekst:
          "Birdly fungerer som en enkel udbudsradar. Du vælger blandt andet fag og geografisk område. Birdly holder øje og sender relevante opgaver direkte på SMS og mail, når de matcher dine kriterier. Der er ingen portal, du skal huske at logge ind i hver dag.",
      },
    ],
    kilder: [K_UDBUD, K_TED],
    opdateret: "2026-08-25",
    relaterede: ["find-opgaver-uden-udbudsportal", "find-offentlige-opgaver", "offentlige-udbud-for-begyndere"],
    brancher: ["entreprenor", "service", "transport"],
  },
];

// ⚠️ AFBRYDEREN. En guide er publiceret når den har BÅDE et kort svar og mindst ét
// afsnit. Halvdelen af en side er ikke en side.
export const erKlar = (g) =>
  Boolean(g && g.kortSvar && String(g.kortSvar).trim() && Array.isArray(g.afsnit) && g.afsnit.length > 0);

export const KLARE_GUIDES = GUIDES.filter(erKlar);

export const getGuide = (slug) => GUIDES.find((g) => g.slug === slug) || null;

// Kategori-navn til visning. Ukendt nøgle giver null frem for at vise nøglen råt.
export const kategoriNavn = (key) =>
  VIDEN_KATEGORIER.find((k) => k.key === key)?.navn || null;
