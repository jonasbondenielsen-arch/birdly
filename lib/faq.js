import { priceText, YEARLY_SAVING, TRIAL_DAYS } from "./pakke";

// =====================================================================
// Birdlys FAQ — ÉN kilde til spørgsmålene og svarene.
//
// ⚠️ TEKSTEN LÅ INLINE I components/Forside.js. Da salgssiden overtog roden
// (03-08-2026) skulle de fire stærkeste spørgsmål med over, og en simpel
// kopiering ville have givet to sæt svar der langsomt drev fra hinanden —
// præcis den fælde CLAUDE.md advarer mod ved match-reglen. Svarene bor derfor
// her, og begge sider læser dem.
//
// ⚠️ SVARENE ER UÆNDREDE fra den oprindelige FAQ. Der er IKKE opfundet nye.
// To rettelser, begge bevidste:
//   * "Får jeg kun relevante opgaver?" → "…opgaver, der matcher mig?" og
//     "dagens relevante opgaver" → "dagens matchende opgaver". Resten af
//     copy'en siger konsekvent "match"; "relevant" var et levn.
//   * Priserne stod med <b> inline i JSX. De er nu almindelig tekst, fordi
//     svaret er en streng — beløbet kommer stadig fra priceText og kan derfor
//     ikke komme i utakt med Frisbii.
//
// ⚠️ HARDKOD ALDRIG ET BELØB HER. priceText/YEARLY_SAVING er eneste kilde
// (CLAUDE.md, "Pris — REGLERNE").
//
// `top: true` markerer de fire der vises udfoldet øverst på salgssiden. De er
// valgt på købstvivl, ikke på nysgerrighed: hvad koster det, binder jeg mig,
// hvordan får jeg opgaverne, og får jeg kun det jeg kan bruge.
// =====================================================================

export const FAQ = [
  // ⚠️ DE FIRE FØRSTE HANDLER OM HVAD BIRDLY OVERHOVEDET FINDER (24-08-2026).
  // Birdly leverer nu både offentlige og private opgaver, og det er det første en
  // besøgende skal kunne få svar på — før pris og opsigelse. Stod det længere nede,
  // ville hele FAQ'en læses som om tjenesten kun dækker offentlige udbud.
  //
  // ⚠️ "Kan jeg vælge private opgaver fra?" ER IKKE PYNT. Private opgaver er
  // opt-out (migration 0090 i admin), og fravalget skal kunne findes af den der
  // leder efter det. Svaret peger samme sted som annoncerings-SMS'en og
  // velkomstmailen: opgavesiden under "Rediger". Flytter den knap sig, skal alle
  // tre rettes.
  {
    top: true,
    sp: "Hvilke opgaver finder Birdly?",
    svar:
      "Birdly finder offentlige opgaver fra blandt andet kommuner, regioner, staten og andre offentlige ordregivere. Derudover kan du modtage private opgaver, som privatpersoner og virksomheder opretter direkte på Birdly.",
  },
  {
    top: true,
    sp: "Skal jeg selv søge efter opgaver?",
    svar:
      "Nej. Du vælger fag, geografisk område og opgavetype, og Birdly holder derefter øje for dig. Når en opgave matcher dine kriterier, får du besked på SMS og mail.",
  },
  {
    top: true,
    sp: "Skal jeg logge ind hver dag?",
    svar:
      "Nej. Birdly er lavet, så du ikke behøver sidde i en portal og søge hver dag. Når der kommer en opgave, der matcher dine valgte kriterier, får du besked direkte på SMS og mail.",
  },
  {
    top: true,
    sp: "Kan jeg vælge private opgaver fra?",
    svar:
      "Ja. Du bestemmer selv, hvilke typer opgaver du ønsker at modtage. Hvis du kun vil have offentlige opgaver, kan du vælge private opgaver fra.",
  },
  {
    top: true,
    sp: "Hvad koster det?",
    // ⚠️ ORDLYDEN ER JONAS' (25-08-2026), men TALLENE INTERPOLERES fra lib/pakke.js.
    // Skrevet ud i haanden ville priserne staa to steder, og den dag en pris aendres,
    // ville FAQ'en modsige priskortet paa samme side. Formuleringen er hans; kun
    // kilden til tallene er systemets.
    //
    // ⚠️ AARSRABATTEN ER IKKE LAENGERE NAEVNT HER. Den stod i det gamle svar, men
    // ikke i den leverede tekst. Den staar fortsat paa priskortet ("spar ~X %"),
    // saa oplysningen er ikke vaek fra siden - kun fra dette svar.
    svar: `Birdly koster ${priceText.monthlyLong} eller ${priceText.yearlyLong} ekskl. moms. De første ${TRIAL_DAYS} dage er gratis, og der er ingen binding.`,
  },
  {
    top: true,
    sp: "Hvordan opsiger jeg?",
    svar:
      "Opsigelse hos Birdly er lige så simpelt, som da du meldte dig til. Du finder opsigelsesrubrikken nederst her på siden, og i bunden af alle vores mails er der et direkte link til opsigelse. Og det bedste? Hos os er du en fri fugl — ingen binding, kun 30 dages opsigelse.",
  },
  {
    top: true,
    sp: "Skal jeg logge ind på en platform?",
    svar:
      "Nej — og det er helt bevidst. Der er rigeligt med platforme i forvejen, og vi tror ikke, verden bliver hverken nemmere eller bedre af endnu én. Birdly er det stik modsatte: vi har pakket alt det tekniske væk, så du kun får én konkret besked på sms og mail, når en opgave matcher dig. Hverken mere eller mindre — ingen login, ingen dashboards, intet bøvl.",
  },
  {
    top: true,
    sp: "Får jeg kun opgaver, der matcher mig?",
    svar:
      "Ja. Du vælger selv branche, område og opgavestørrelse. Birdly sender kun opgaver, der matcher dine kriterier.",
  },
  {
    sp: "Hvor mange sms'er får jeg?",
    svar:
      "Vi samler dagens matchende opgaver i én besked, så du får overblik uden unødige notifikationer. Hvor ofte du hører fra os afhænger af, hvor mange matchende opgaver der dukker op i dit område. Er det for meget eller for lidt, kan du altid justere dine kriterier. Og skulle du få nok, stopper du beskederne med det samme ved at svare STOP på en sms.",
  },
  {
    sp: "Hvor hurtigt får jeg besked?",
    svar: "Som regel samme dag, opgaven bliver lagt op. Nogle gange fanger vi også opgaver, der er på vej.",
  },
  {
    sp: "Er der flere pakker at vælge mellem?",
    svar:
      "Nej — der er kun én pakke med alt inkluderet. Du vælger selv, om du vil dække én region eller hele Danmark, og det koster det samme uanset. Ingen tiers, intet tilvalg — bare én simpel pris.",
  },
  {
    sp: "Hvor kommer opgaverne fra?",
    svar:
      "Et udbud er bare en opgave fra en kommune, region eller staten, som private firmaer kan byde på — fra et nyt tag på en skole til rengøring af et rådhus. Vi henter dem fra de officielle kilder: udbud.dk og EU's database TED. Offentlige udbud skal være åbne for alle — så det er helt lovligt. Vi holder også øje med de indkøb, der varsles som forhåndsmeddelelser, før de bliver til et egentligt udbud — så du kan være på forkant, allerede inden opgaven officielt er sendt i udbud.",
  },
  {
    sp: "Kan I også hjælpe os med at byde på opgaver?",
    svar:
      "Ikke endnu — men det er på radaren. Birdly er et nyt produkt på det danske marked, og vores første prioritet har været at gøre det enkelt for danske SMV'er overhovedet at finde de rigtige opgaver. På sigt kigger vi ind i selve det at byde, for vi synes, hele verdenen omkring kommunale og statslige opgaver er for bøvlet og kompleks. Vi tror på, at alle virksomheder skal have lige adgang til at byde på offentlige opgaver — ikke kun dem med en stor tilbudsafdeling.",
  },
  {
    sp: "Hvordan virker bud-skabelonen?",
    svar:
      "Når vi sender dig en opgave, følger der en skabelon med, hvor vi allerede har samlet og forberedt det meste — krav, frister og de formelle ting. Med farver kan du se, hvad vi har udfyldt, og hvad der er dit. Du udfylder din pris og dine referencer og gemmer det hele som pdf.",
  },
  {
    sp: "Laver I tilbuddet for mig?",
    svar:
      "Nej. Skabelonen er en guide og tjekliste, der gør det meste af benarbejdet klar — cirka 70 %. Din pris, dine referencer og din faglige beskrivelse er det, kun du kan udfylde. Vi giver ikke juridisk rådgivning og lover ikke, at du vinder — men vi giver dig et forspring.",
  },
  {
    sp: "Skal jeg selv hente udbudsmaterialet?",
    svar:
      "Ja. Det fulde materiale ligger hos ordregiveren, og vi linker dig direkte derhen, så du slipper for at lede. Hos nogle ordregivere skal du oprette en gratis konto for at hente det — den skal du alligevel bruge for at aflevere dit tilbud.",
  },
];

export const FAQ_TOP = FAQ.filter((f) => f.top);
export const FAQ_RESTEN = FAQ.filter((f) => !f.top);

// FAQPage-markup til Google. Dækker ALLE spørgsmål, ikke kun de fire — også dem
// der ligger foldet sammen, for de står i HTML'en og er lige så gyldige svar.
//
// ⚠️ FORVENT IKKE RIGE RESULTATER AF DEN. Google indskrænkede i august 2023
// FAQ-rich-results til anerkendte myndigheds- og sundhedssites; et B2B-SaaS får
// dem ikke. Markupen er stadig gyldig og hjælper med at forstå siden (og læses af
// AI-svartjenester), men den køber os ikke plads i søgeresultatet. Sælg den
// aldrig ind som andet.
export const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.sp,
    acceptedAnswer: { "@type": "Answer", text: f.svar },
  })),
};

// =====================================================================
// KONVERTERINGS-FAQ — salgssidens spørgsmål, i indvendings-rækkefølge.
//
// ⚠️ EGEN LISTE, IKKE FLERE PUNKTER I `FAQ`. Roden viser FAQ (de tolv) og bygger
// FAQPage-schemaet af præcis dem. Lagde vi de fem nye ind i samme array, ville
// rodens FAQ-sektion og dens structured data ændre sig som bivirkning af en
// ændring på salgssiden — og rodens SEO-lag skal stå urørt (Jonas 06-09-2026).
//
// ⚠️ INGEN KOPIEREDE SVAR. De seks spørgsmål der allerede findes, slås op i FAQ
// ved deres `sp`. Skrev vi dem af, ville de to sæt langsomt komme til at sige
// noget forskelligt om pris og opsigelse — og kunden ville opdage det på det
// værste tidspunkt. Findes et opslag ikke (fordi nogen har omdøbt et spørgsmål),
// springes punktet over frem for at rendere et tomt svar.
//
// ⚠️ DE FEM NYE ER FAKTUELLE, IKKE SALGSTALE. Hvert svar kan holdes op mod
// handelsbetingelserne (§3.3-3.6 om garantien, §5 om opsigelse) eller mod
// Frisbii-planen (14 dages fast prøve, træk på dag 15). Beløb interpoleres fra
// lib/pakke.js — hardkod aldrig et tal her.
// =====================================================================
const KONVERTERING = [
  {
    sp: "Er Birdly også til små virksomheder?",
    // ⚠️ INGEN LOVNING OM AT MAN VINDER. Vi siger hvad der er sandt om ADGANGEN:
    // offentlige opgaver skal være åbne for alle, og der findes små opgaver.
    // "Små virksomheder vinder også" ville være en påstand vi ikke kan belægge.
    svar:
      "Ja. Birdly er bygget til helt almindelige danske virksomheder — også enkeltmandsvirksomheder og små hold. Offentlige opgaver skal være åbne for alle, og der er langt flere små og mellemstore opgaver end store. Du vælger selv, hvor store opgaver du vil høre om, så du ikke får beskeder om noget, der er for stort til jer.",
  },
  {
    sp: `Hvad sker der efter de ${TRIAL_DAYS} gratis dage?`,
    svar: `Prøveperioden er ${TRIAL_DAYS} dage, og du betaler 0 kr. i dag. Vi sender dig en påmindelse 3 dage før den udløber. Vil du ikke fortsætte, siger du op inden — så bliver der ikke trukket noget. Gør du ingenting, fortsætter abonnementet automatisk til ${priceText.monthlyLong} eller ${priceText.yearlyLong} ekskl. moms, alt efter hvad du valgte.`,
  },
  {
    sp: "Hvornår bliver mit kort trukket?",
    // ⚠️ "DAG 15" ER IKKE ET GÆT. Prøven er 14 dage fast på begge Frisbii-planer
    // (trial_interval_length: 14, fixed_trial_days: true, verificeret 06-09-2026),
    // så første træk falder dagen efter. Ændres prøvelængden i Frisbii, skal
    // TRIAL_DAYS og denne sætning følge med.
    svar: `Der trækkes 0 kr., når du registrerer kortet. Første betaling sker dagen efter prøveperioden slutter — altså på dag ${TRIAL_DAYS + 1} — og kun hvis du ikke har sagt op inden. Kortet gemmes hos vores betalingsudbyder Frisbii, så de løbende betalinger kan gennemføres; Birdly ser aldrig dit fulde kortnummer.`,
  },
  {
    sp: "Hvordan fungerer matchgarantien?",
    // ⚠️ ORDLYDEN FØLGER §3.3-3.6 OG MÅ IKKE GØRES MERE GENERØS. De to
    // undtagelser (snævert beløbsfilter, meget nichepræget virksomhed) står med,
    // fordi et ubetinget løfte her ville modsige den aftale kunden skriver under
    // på to klik senere. Se også lib/salgTekst.js.
    svar:
      "Har vi ikke sendt dig mindst én opgave inden for 60 dage fra din tilmelding — inden for de kriterier, du selv har valgt — refunderer vi det, du har betalt for perioden. Du skriver bare til support@birdly.dk. Garantien gælder ikke, hvis du har afgrænset opgavestørrelsen meget snævert, eller hvis din virksomhed er så specialiseret, at den type opgaver reelt ikke udbydes i Danmark. Den fulde ordlyd står i handelsbetingelserne §3.3-3.6.",
  },
  {
    sp: `Hvorfor koster årsplanen ${priceText.yearlyBare}?`,
    // ⚠️ TALLENE REGNES, IKKE SKRIVES. 4.990 ÷ 499 er præcis 10, så "betal for 10
    // måneder, få 12" er bogstaveligt sandt — ikke en afrunding. YEARLY_SAVING
    // bærer beløbet og procenten, så de aldrig kan komme i utakt med priserne.
    svar: `Fordi du betaler for 10 måneder og får 12. ${priceText.monthlyLong} gange 12 er ${YEARLY_SAVING.monthlyTotal.toLocaleString("da-DK")} kr.; årsplanen koster ${priceText.yearlyLong}. Du sparer ${YEARLY_SAVING.amount.toLocaleString("da-DK")} kr. om året — cirka ${YEARLY_SAVING.pct} %. Alle priser er ekskl. moms, og indholdet er præcis det samme på de to planer.`,
  },
];

// Rækkefølgen på salgssiden: indvendinger først, pris og betaling til sidst.
// ⚠️ STRENGENE SKAL MATCHE `sp` I FAQ ORDRET. Gør de ikke det, forsvinder
// punktet stille — derfor filtreres der på Boolean til sidst, så en tastefejl
// giver en manglende linje frem for et tomt kort med et spørgsmålstegn.
const SALG_ORDEN = [
  "Hvilke opgaver finder Birdly?",
  "Skal jeg selv søge efter opgaver?",
  "Skal jeg logge ind på en platform?",
  "Er Birdly også til små virksomheder?",
  "Kan jeg vælge private opgaver fra?",
  "Hvor hurtigt får jeg besked?",
  `Hvad sker der efter de ${TRIAL_DAYS} gratis dage?`,
  "Hvornår bliver mit kort trukket?",
  "Hvordan fungerer matchgarantien?",
  "Hvordan opsiger jeg?",
  `Hvorfor koster årsplanen ${priceText.yearlyBare}?`,
];

const ALLE = [...FAQ, ...KONVERTERING];

export const FAQ_SALG = SALG_ORDEN
  .map((sp) => ALLE.find((f) => f.sp === sp))
  .filter(Boolean);
