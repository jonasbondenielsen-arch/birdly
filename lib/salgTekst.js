// ============================================================================
// SALGS-COPY — ét sted for de sætninger der går igen på tværs af sider.
//
// ⚠️ HVORFOR DEN HER FIL FINDES. Matchgarantien stod tre steder i huset med tre
// forskellige ordlyd: trin 5 havde den BETINGEDE (60 dage + "inden for de kriterier
// du selv vælger" + link til §3.3), mens /kom-i-gang lovede ubetinget at "finder vi
// ikke et match, koster det dig ikke en krone". Den sidste er ikke dækket af
// handelsbetingelsernes §3.3-3.6, som sætter tre rammer: 60 dage, kundens EGNE
// kriterier, og undtagelser ved snævert beløbsfilter (§3.5) og meget nichepræget
// virksomhed (§3.6).
//
// Et ubetinget markedsføringsløfte side om side med en betinget aftaletekst er
// noget kunden kan holde os op på. Derfor: ÉN kilde, den betingede, overalt.
//
// ⚠️ SKRIV ALDRIG EN GARANTI-SÆTNING I HÅNDEN I EN KOMPONENT. Det var netop den
// spredning der lod de to versioner opstå. Samme regel som lib/pakke.js har for
// beløb — og af samme grund.
//
// ⚠️ ÅBENT SPØRGSMÅL (afventer Jonas, 06-09-2026): §3.5 undtager kunder der har
// sat maksimum under 2,5 mio. kr., og §3.6 undtager meget nicheprægede
// virksomheder. Står de ved magt, dækker garantien muligvis IKKE den lille
// rengøringskunde funnelen er bygget til. Indtil det er afklaret, antyder INGEN
// tekst her at garantien gælder alle — og forbeholdet står altid synligt med et
// link til den fulde ordlyd, så teksten kan skærpes ét sted når svaret kommer.
// ============================================================================

/** Link til den fulde ordlyd. Samme anker som trin 5 allerede bruger. */
export const GARANTI_LINK = "/handelsbetingelser#matchgaranti";

export const GARANTI = {
  // ⚠️ TO FORSKELLIGE TING, OG DE MÅ ALDRIG SMELTE SAMMEN (06-09-2026):
  //   · PRØVEPERIODEN er 14 dage. Den er gratis, og der trækkes 0 kr.
  //   · MATCHGARANTIEN løber 60 dage fra tilmelding og handler om REFUSION af
  //     det der er betalt, hvis vi ikke har sendt en eneste relevant opgave.
  // Skriver man dem sammen ("60 dage gratis"), lover man en prøveperiode der er
  // fire gange længere end den er. Det er en aftaleretlig fælde, og det er den
  // fejl der er nemmest at lave i en kort overskrift. Derfor: overskriften
  // nævner de 14 dage, og de 60 står i `praecis` lige under, hver gang.
  overskrift: "14 dage gratis. Ingen relevante match? Så betaler du ikke.",
  // Den nøjagtige mekanik, ordret efter handelsbetingelserne §3.3-3.4.
  praecis:
    "Matchgaranti: har vi ikke sendt jer mindst én opgave inden for jeres egne " +
    "kriterier senest 60 dage efter tilmelding, refunderer vi det, I har betalt " +
    "for perioden.",
  // Kort form til badges, trust-rækker og punktlister — hvor der ikke er plads til
  // hele sætningen. Ordet alene er ikke et løfte, så det må stå bart.
  kort: "Matchgaranti",
  // Én linje til steder med lidt mere plads end et badge.
  linje: "Matchgaranti: ingen match inden for 60 dage, ingen regning.",
  // Forbeholdet. ⚠️ SKAL FØLGE MED overskriften hver eneste gang den vises.
  forbehold: "Gælder opgaver inden for de kriterier, du selv vælger.",
  linkTekst: "Se betingelserne",
};

/** Ét-sætnings-løftet. Skal kunne forstås på under fem sekunder. */
export const LOEFTE =
  "Birdly finder relevante offentlige og private opgaver til din virksomhed og sender dem direkte på SMS.";

/** Den følelsesmæssige version — bruges som H1 og i afslutninger. */
export const LOEFTE_KORT = "Flere relevante opgaver. Uden selv at lede.";

// ⚠️ ÉN CTA-ORDLYD I HELE HUSET. "Find opgaver nu" står i dag i headeren, på
// forsiden, på /brancher og på alle 36 fag-sider. Nye varianter ("Prøv gratis",
// "Kom i gang") ville splitte det genkendelige klik op i fire ting der ligner
// hinanden. Sekundæren har en ANDEN funktion og skal derfor se anderledes ud.
export const CTA = {
  primaer: "Find opgaver nu",
  sekundaer: "Se hvordan det virker",
};

// Trust-rækken under hero og CTA'er. ⚠️ "Ingen portal" er sandt: kunden får sin
// egen opgaveside på et token-link, uden login og uden at skulle søge. Det er
// ikke en portal hun skal holde øje med — den holder øje for hende.
export const TRUST = [
  "14 dage gratis",
  "Ingen portal",
  "Ingen binding",
  GARANTI.kort,
];

// ⚠️ VÆRDI-SPROGET ER BETINGET, ALTID. Vi lover ALDRIG en vundet opgave, en
// omsætning eller en kontraktværdi — vi viser regnestykket og lader kunden regne.
// "Du tjener pengene hjem" er et udbytteløfte og må aldrig stå nogen steder.
// ⚠️ "GØRE PRISEN LILLE I SAMMENLIGNING", IKKE "BETALE HJEM". Den gamle ordlyd
// ("kan betale et helt års Birdly mange gange hjem") beskrev et UDBYTTE — altså
// at pengene kommer retur. Det er præcis den påstand vi ikke må fremsætte, uanset
// hvor mange "kan" der står foran. Den nye sammenligner to beløb og lader kunden
// selv drage slutningen. Se lib/vaerdiAnker.js for hele reglen.
export const VAERDI_ANKER =
  "Én vundet opgave kan gøre prisen på Birdly meget lille i sammenligning.";
export const VAERDI_UNDER =
  "Der skal ikke mange opgaver til, før regnestykket giver mening.";

// ⚠️ EJER-SÆTNINGEN. Går igen flere steder og skal blive stående (CLAUDE.md,
// "Sprog og SEO"). Gentages bevidst — den er husets korteste forklaring.
export const EJER_LINJE =
  "Du fortæller os, hvilke opgaver du leder efter. Vi holder øje. Du får besked.";

// ============================================================================
// DE GENNEMGÅENDE SÆTNINGER (07-09-2026)
//
// ⚠️ HVORFOR DE BOR HER. Tre budskaber skal gå igen på tværs af forside,
// fag-sider og funnel. Skrives de i hånden hvert sted, driver de fra hinanden —
// og netop disse tre er dem der bærer hele det økonomiske argument. Ét sted.
//
// ⚠️ VARIÉR, GENTAG IKKE ORDRET. Det samme budskab fem gange med de samme ord
// læses som en skabelon, ikke som et argument. Derfor findes flere formuleringer
// af den samme pointe herunder — brug forskellige i forskellige sektioner.
// ============================================================================

// ⚠️ DET ER IKKE ET LØFTE OM AT VINDE. Sætningen siger at der ikke skal MANGE
// vundne opgaver til, før årsprisen er lille i sammenligning — ikke at kunden
// vinder én. Den må ALDRIG stå sammen med noget der antyder en garanti, og den
// må aldrig omskrives til "I vinder én".
export const VIND_EN = {
  over: "I skal ikke vinde mange.",
  under: "I skal bare vinde én.",
  // Fremhævningen ligger på de to sidste ord — se .sg-vind i salg.css.
  underDel1: "I skal bare ",
  underDel2: "vinde én.",
};

// Variationer af samme pointe. Brug forskellige steder, aldrig to gange på
// samme skærm.
export const VAERDI_VARIANTER = [
  "Én god opgave kan betale et helt års Birdly mange gange hjem.",
  "De opgaver er der allerede. Spørgsmålet er bare, om I ser dem.",
  "En enkelt god rengøringsaftale kan være mange gange mere værd end et helt års Birdly.",
];

// ⚠️ "KAN VÆRE", ALDRIG "ER". Vi ved ikke hvad den enkelte opgave er værd, og
// beholdningen svinger. "Kan være" er sandt; "er" ville være en påstand om data
// vi ikke har.
export const STOERRELSE_LINJE =
  "En rengøringsopgave kan være flere hundredetusinde kroner værd.";

// Fjerner frygten for at offentlige opgaver kun er for de store.
// ⚠️ VI PÅSTÅR IKKE AT ALT ER NEMT. Der står at det ikke BEHØVER være bøvlet,
// og at opgaverne kommer i forskellige størrelser. Begge dele er sande.
export const OFFENTLIGE = {
  overskrift: "Offentlige opgaver er også for mindre virksomheder.",
  brod: "Det behøver ikke være bøvlet. Der kommer løbende rengørings- og serviceopgaver i forskellige størrelser.",
  rolle1: "Birdly finder dem.",
  rolle2: "I vælger, hvilke I vil byde på.",
};

// SMS er produktoplevelsen. ⚠️ SMS FØRST, mail sekundært — det er beskeden på
// telefonen kunden faktisk mærker, og det er dét der gør Birdly til noget andet
// end en portal man skal huske at logge ind på.
export const SMS_LINJE = "Relevante opgaver. Direkte på SMS.";
export const SMS_UNDER = "Når noget passer, får I besked.";
export const IKKE_HOLDE_OEJE =
  "I behøver ikke holde øje med Birdly. Birdly holder øje for jer.";
