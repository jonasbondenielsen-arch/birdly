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
  // Overskrift. ⚠️ BETINGET. Den tidligere "Ingen relevante match? Så betaler du
  // ikke." lovede uden 60-dages-rammen og uden kriterie-forbeholdet.
  overskrift: "Får du ingen match inden for 60 dage, betaler du ikke en krone.",
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
export const VAERDI_ANKER =
  "Én vundet opgave kan betale et helt års Birdly mange gange hjem.";
export const VAERDI_UNDER =
  "Der skal ikke mange opgaver til, før regnestykket giver mening.";

// ⚠️ EJER-SÆTNINGEN. Går igen flere steder og skal blive stående (CLAUDE.md,
// "Sprog og SEO"). Gentages bevidst — den er husets korteste forklaring.
export const EJER_LINJE =
  "Du fortæller os, hvilke opgaver du leder efter. Vi holder øje. Du får besked.";
