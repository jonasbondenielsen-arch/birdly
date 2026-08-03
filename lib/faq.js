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
  {
    top: true,
    sp: "Hvad koster det?",
    svar: `De første ${TRIAL_DAYS} dage er gratis. Derefter koster Birdly ${priceText.monthly} eller ${priceText.yearly} (ekskl. moms) — alt inkluderet. Vælger du årligt, sparer du ~${YEARLY_SAVING.pct} % (svarer til ${YEARLY_SAVING.months} måneder gratis). Ingen binding.`,
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
