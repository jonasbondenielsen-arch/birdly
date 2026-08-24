// ============================================================================
// FAQ PÅ /opret-opgave — ÉN KILDE til både det synlige indhold og FAQPage-schemaet.
//
// ⚠️ DEN BOR I SIT EGET MODUL, IKKE I OpretOpgave.js. Den komponent er "use client",
// og alt hvad et klient-modul eksporterer bliver set som en KLIENT-REFERENCE fra en
// server-komponent — ikke som data. `FAQ.map` fejlede derfor ved prerender af siden
// ("c.FAQ.map is not a function"). Et rent modul uden "use client" kan læses begge
// steder.
//
// ⚠️ SCHEMA OG SIDE SKAL VISE DET SAMME. Google behandler structured data der ikke
// matcher det synlige indhold som en overtrædelse, ikke som spildt arbejde. To
// håndholdte kopier ville drive fra hinanden første gang et svar rettes — derfor
// findes listen ét sted.
//
// ⚠️ AL COPY ER ORDRET FRA DEN GODKENDTE MOCKUP. Skriv den ikke om uden godkendelse.
// ============================================================================

export const FAQ = [
  {
    sp: "Koster det noget at oprette en opgave?",
    sv: "Nej. Det er 100 % gratis for dig at oprette en opgave på Birdly. Du betaler hverken Birdly for at oprette opgaven eller for at blive matchet med virksomheder.",
  },
  {
    sp: "Hvor mange virksomheder får mine oplysninger?",
    // ⚠️ SVARET SKAL SPEJLE SAMTYKKET, ikke marketing-linjen. "Maks. 3" handler om
    // hvem der KONTAKTER hende; beskrivelse og billeder ses af alle matchede, så de
    // kan vurdere opgaven. Skriver vi "kun 3 ser din opgave", modsiger FAQ'en det
    // hun lige har sat kryds i.
    sv: "Din opgavebeskrivelse og eventuelle billeder deles med de virksomheder, der arbejder med din type opgave i dit område, så de kan vurdere den. Dine kontaktoplysninger deles først, når en virksomhed aktivt tager opgaven — og maks. 3 virksomheder får mulighed for at kontakte dig. Derefter lukkes opgaven for flere.",
  },
  {
    sp: "Er jeg forpligtet til at vælge en virksomhed?",
    sv: "Nej. Du bestemmer helt selv, om du vil gå videre med en af de virksomheder, der kontakter dig. Du forpligter dig ikke til noget ved at oprette en opgave.",
  },
  {
    sp: "Hvordan bliver jeg kontaktet?",
    sv: "Virksomhederne kontakter dig direkte på telefon eller mail. Det er dem, der tager fat i dig — du skal ikke ringe rundt selv.",
  },
  {
    sp: "Skal jeg oprette en konto?",
    sv: "Nej. Du skal blot udfylde formularen. Ingen konto, ingen adgangskode, ingen app. Du får et personligt link på SMS, som du bruger til at følge din opgave.",
  },
  {
    sp: "Hvordan retter eller lukker jeg min opgave?",
    sv: "Gennem dit personlige link. Der kan du rette teksten, tilføje billeder og lukke opgaven, når du har fundet den hjælp, du søgte.",
  },
  {
    sp: "Hvad gør I med mine oplysninger?",
    sv: "Vi bruger dine oplysninger til at sende din opgave videre til de virksomheder, der arbejder med den, så de kan kontakte dig. Vi deler dem ikke til andre formål, og oplysningerne på en lukket opgave slettes eller anonymiseres senest 30 dage efter. Læs mere i vores privatlivspolitik.",
  },
];
