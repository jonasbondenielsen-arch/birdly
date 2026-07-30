// ============================================================================
// FEEDBACK-SKEMAET — 9 spørgsmål, ét sted.
//
// Strukturen er bevidst data og ikke markup: Jonas skal kunne finpudse formulering,
// rækkefølge og svarmuligheder uden at nogen rører formularens logik.
//
// ⚠️ SVARENES LABEL GEMMES SAMMEN MED NØGLEN. Omformuleres et svar senere, betyder
// et gammelt svar stadig hvad kunden faktisk læste — ellers ville historiske
// besvarelser stille og roligt blive uforståelige.
//
// ⚠️ INGEN SMILEYS. Almindelige svarkort. Smileys presser svaret mod midten og gør
// det svært at være konkret negativ — og det er præcis den kritik der er værd at få.
//
// SPROG: "opgaver", aldrig "udbud" (brand-sproget).
// ============================================================================

export const SPOERGSMAAL = [
  {
    id: "kanal",
    spm: "Hvor hørte du første gang om Birdly?",
    type: "en",
    svar: [
      ["annonce_meta", "Annonce på Facebook eller Instagram"],
      ["opslag_meta", "Opslag på Facebook eller Instagram"],
      ["google", "Google"],
      ["linkedin", "LinkedIn"],
      ["anbefaling", "Anbefaling fra andre"],
      ["andet", "Et andet sted"],
      ["husker_ikke", "Kan ikke huske"],
    ],
  },
  {
    id: "opstart",
    spm: "Hvor nemt var det at komme i gang?",
    type: "en",
    svar: [
      ["meget_nemt", "Meget nemt"],
      ["nemt", "Nemt"],
      ["midt", "Hverken nemt eller besværligt"],
      ["lidt_besvaerligt", "Lidt besværligt"],
      ["meget_besvaerligt", "Meget besværligt"],
    ],
  },
  {
    id: "vaerd_at_undersoege",
    spm: "Har Birdly vist jer en opgave, der var værd at undersøge?",
    type: "en",
    svar: [
      ["budt", "Ja — vi har budt eller overvejer at byde"],
      ["mindst_en", "Ja, mindst én"],
      ["ikke_endnu", "Ikke endnu"],
      ["ingen_modtaget", "Vi har ikke modtaget nogen opgaver"],
      ["ikke_naaet", "Ikke nået at se dem"],
    ],
  },
  {
    id: "relevans",
    spm: "Hvor godt passer opgaverne til jeres virksomhed?",
    hjaelp: "Det vigtigste spørgsmål for os — det styrer hvad vi sender dig.",
    type: "en",
    svar: [
      ["5", "Meget godt"],
      ["4", "Godt"],
      ["3", "Nogenlunde"],
      ["2", "Ikke særlig godt"],
      ["1", "Slet ikke"],
      ["for_tidligt", "For tidligt at sige"],
    ],
  },
  {
    id: "vaerdi",
    spm: "Hvad giver mest værdi lige nu?",
    hjaelp: "Vælg højst to.",
    type: "flere",
    maks: 2,
    svar: [
      ["opdager", "Vi opdager opgaver, vi ikke havde set"],
      ["sparer_tid", "Det sparer os tid"],
      ["samlet", "Kun de relevante, samlet ét sted"],
      ["besked", "Besked på både mail og SMS"],
      ["forstaa", "Nemmere at forstå hvilke der er interessante"],
      ["skabelon", "Bud-skabelonen"],
      ["for_tidligt", "For tidligt at sige"],
    ],
  },
  {
    id: "irrelevans_aarsag",
    spm: "Når en opgave ikke passer, hvad er så årsagen?",
    hjaelp: "Vælg højst to.",
    type: "flere",
    maks: 2,
    svar: [
      ["forkert_type", "Forkert type opgave"],
      ["forkert_omraade", "Forkert område"],
      ["stoerrelse", "For stor eller for lille"],
      ["krav", "Kravene passer ikke til os"],
      ["frist", "Fristen er for kort"],
      ["kapacitet", "Vi har ikke kapacitet"],
      ["uklar", "Beskrivelsen er uklar"],
      ["ingen_irrelevante", "Vi har ikke fået irrelevante endnu"],
      ["andet", "Andet"],
    ],
  },
  {
    id: "pris_holdning",
    spm: "Hvordan oplever du værdien ved 499 kr. om måneden?",
    type: "en",
    svar: [
      ["klart_vaerdi", "Klart værdien"],
      ["fair_hvis", "Fair, hvis opgaverne fortsat er relevante"],
      ["usikker", "Jeg er ikke sikker endnu"],
      ["hoej", "Den føles høj i forhold til værdien"],
      ["ikke_vaerd", "Endnu ikke 499 kr. værd"],
    ],
  },
  {
    id: "fortsaetter",
    spm: "Hvor sandsynligt er det, at I fortsætter efter prøveperioden?",
    type: "en",
    svar: [
      ["meget", "Meget sandsynligt"],
      ["sandsynligt", "Sandsynligt"],
      ["ved_ikke", "Ved ikke"],
      ["ikke_saerlig", "Ikke særlig sandsynligt"],
      ["slet_ikke", "Slet ikke sandsynligt"],
    ],
  },
  {
    id: "fritekst",
    // Formuleringen skifter efter hvordan kunden har svaret — se spmTekst() nedenfor.
    // En tilfreds kunde og en utilfreds kunde skal ikke stilles samme spørgsmål; det
    // ene inviterer til ros, det andet til konkret kritik vi kan handle på.
    spm: null,
    type: "tekst",
    minLaengde: 20,
    maksLaengde: 500,
    // ⚠️ Ingen forudfyldt tekst og INTET eksempel på en udtalelse. Et eksempel ville
    // forme svaret og gøre det ubrugeligt som feedback — og en formet udtalelse må
    // desuden ikke bruges som markedsføring.
    hint: "Skriv mindst én kort sætning",
  },
];

/**
 * Sidste spørgsmål er dynamisk. Grænsen ligger ved relevans 4-5 OG en positiv
 * fortsættelses-intention: er begge gode, spørger vi hvad der virker; ellers spørger
 * vi hvad der skal ændres. Er relevans "for tidligt", regnes den ikke som positiv —
 * vi ved simpelthen ikke nok endnu.
 */
export function fritekstSpm(svar) {
  const r = svar?.relevans?.key;
  const f = svar?.fortsaetter?.key;
  const positiv = (r === "4" || r === "5") && (f === "meget" || f === "sandsynligt");
  return positiv
    ? "Hvad har Birdly gjort lettere for jer — og hvad kunne gøre det endnu bedre?"
    : "Hvad skal vi ændre, før Birdly bliver værd at fortsætte med?";
}

export function spmTekst(q, svar) {
  return q.id === "fritekst" ? fritekstSpm(svar) : q.spm;
}
