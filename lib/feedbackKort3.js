// ============================================================================
// DET KORTE FEEDBACK-SKEMA — 4 spørgsmål, ét sted.
//
// ⚠️ NØGLEN I BASEN HEDDER STADIG 'kort3'. Den er teknisk og må ALDRIG ændres: den
// står i feedback_svar.skema, i det unikke indeks (kunde, skema) og i afbryderen
// feature_flags.feedback_kort3. Kun den VISTE tekst siger 4.
//
// Samme princip som lib/feedbackSpoergsmaal.js: teksten er data, ikke markup, så
// formuleringen kan finpudses uden at nogen rører formularens logik.
//
// ⚠️ SPØRGSMÅLENE FINDES OGSÅ SERVER-SIDE (supabase/functions/feedback-forlaeng i
// birdly-admin, KORT3_SPOERGSMAAL). Serveren er den autoritative: den gemmer SIN egen
// label sammen med svaret, så en manipuleret klient ikke kan gemme en besvarelse under
// et spørgsmål kunden aldrig så. ÆNDRER DU EN TEKST HER, SKAL DU ÆNDRE DEN DÉR —
// ellers viser siden ét spørgsmål og basen husker et andet. Nøglerne (id) er kontrakten
// mellem de to og må ikke omdøbes.
//
// SPROG: "opgaver", aldrig "udbud". Ingen CPV-koder, ingen "relevant".
// ============================================================================

export const KORT3 = [
  {
    id: "hvordan_fungeret",
    spm: "Hvordan har Birdly fungeret for dig indtil videre?",
    hjaelp: "Skriv frit — kort eller langt, som du har lyst.",
    rows: 6,
  },
  {
    id: "bedst",
    spm: "Hvad fungerer bedst?",
    hjaelp: "Det vi endelig ikke skal lave om.",
    rows: 4,
  },
  {
    id: "bedre",
    spm: "Hvad kunne vi gøre bedre?",
    hjaelp: "Sig det lige ud — det er sådan vi bliver klogere.",
    rows: 4,
  },
  {
    // Tilføjet 13-08-2026. Står SIDST med vilje: de tre første handler om oplevelsen
    // af produktet, dette om beslutningen før den. Stod det først, ville kunden
    // begynde i fortiden og svare de øvrige gennem den ramme.
    id: "hvorfor_proevede",
    spm: "Hvad var den vigtigste grund til, at du prøvede Birdly?",
    hjaelp: "Det hjælper os med at forstå, hvad der betyder mest for jer.",
    rows: 4,
  },
];

export const MAKS_TEGN = 2000;

// ---------------------------------------------------------------------------
// SAMTYKKET
// ---------------------------------------------------------------------------
// ⚠️ IKKE FORHÅNDSAFKRYDSET, og teksten står ordret som godkendt. Det er tilladelsen
// SELV — ikke en tilladelse til at spørge. Ændres ordlyden, ændres rækkevidden af det
// kunden har sagt ja til, og gamle samtykker dækker da noget andet end de nye.
export const SAMTYKKE_TITEL = "Ja, Birdly må dele min anmeldelse.";
export const SAMTYKKE_BROED =
  "Jeg giver Birdly.dk lov til at bruge min anmeldelse — sammen med mit navn og min " +
  "virksomhed — som reference på birdly.dk og i Birdlys markedsføring. Jeg kan altid " +
  "trække tilladelsen tilbage ved at skrive til support@birdly.dk.";

// Står under den deaktiverede knap og forklarer hvorfor den er dæmpet.
export const KNAP_HJAELP =
  "Sæt flueben ovenfor for at sende din anmeldelse og få 7 dages ekstra prøvetid.";

export const NOTE_NEDERST =
  "Dine svar er interne og bruges til at gøre Birdly bedre. Vi deler dem ikke med nogen, " +
  "og vi lægger dem ikke op noget sted uden dit samtykke ovenfor. Vil vi bruge et citat, " +
  "følger vi din tilladelse.";

// ---------------------------------------------------------------------------
// KVITTERINGER — ordret, to varianter
// ---------------------------------------------------------------------------
// Prøvekunden får de 7 dage; den betalende gør ikke, og hendes kvittering må derfor
// ikke love noget om en dato. To tekster, ikke én med et hul i.
// Uden fornavn falder komma-tiltalen væk i stedet for at efterlade et hul ("Tusind
// tak,  — det betyder…"). Sætningen står ellers ordret.
export function kvitteringProeve(navn) {
  return {
    overskrift: `Tusind tak${navn ? ", " + navn : ""} — det betyder mere, end du tror.`,
    afsnit: [
      "Birdly er bygget i tæt samarbejde med de folk, der bruger den hver dag, og din " +
        "anmeldelse er lige blevet en del af det. Vi læser hvert eneste svar.",
      "Som tak har vi lagt 7 ekstra dage til din gratis prøveperiode. Du hører nærmere på mail.",
    ],
  };
}

export function kvitteringBetalende(navn) {
  return {
    overskrift: `Mange tak${navn ? ", " + navn : ""}.`,
    afsnit: [
      "Vi har modtaget din feedback, og det sætter vi kæmpe pris på — vi ønsker at bygge " +
        "det mest simple og unikke produkt til jer kunder over tid.",
    ],
  };
}
