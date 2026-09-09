// ============================================================================
// DANSKE STRENGE — kopieret BYTE FOR BYTE fra komponenterne.
//
// ⚠️ RET ALDRIG EN STRENG HER "MENS DU ER I GANG". Filen findes for at DK kan
// bevises uændret; en forbedret formulering her er en ændring af det live
// danske site, og den hører til sin egen opgave med sin egen godkendelse.
//
// ⚠️ HÅRDE MELLEMRUM OG TANKESTREGER ER MEDTAGET MED VILJE. Hero'ens
// "rengørings- og" har et hårdt mellemrum, fordi linjen ellers brækkede
// efter bindestregen og blev læst som et delt ord. Erstattes det med et
// almindeligt mellemrum, ser diffen ens ud i en terminal og forskellig i en
// browser.
// ============================================================================

export const da = {
  hero: {
    eyebrow: "For rengørings- & servicevirksomheder",
    //   = hårdt mellemrum. Se noten øverst.
    // ⚠️ HAARDT MELLEMRUM, skrevet som kode med vilje. I komponenten
    // stod der `&nbsp;`. Skrev jeg et almindeligt mellemrum her, ville de to
    // strenge se ENS ud i en diff og FORSKELLIGE i browseren, hvor linjen igen
    // ville braekke efter bindestregen. Et usynligt tegn skal skrives synligt.
    overskrift: "Få flere rengørings- og serviceopgaver.",
    overskriftEm: "Uden selv at lede.",
    under:
      "Birdly finder offentlige og private opgaver, der passer til jeres virksomhed — og sender nye match direkte på SMS.",
    chips: ["Rengøring", "Vinduespolering", "Trappevask", "Ejendomsservice", "Erhvervsrengøring"],
    chipsLabel: "Eksempler på opgavetyper",
  },

  bevis: {
    overskrift: "Birdly arbejder allerede",
    opdateret: "Sidst opdateret",
    // Etiketterne under hvert tal i bevis-bjælken.
    aabne: "opgaver med åben frist",
    bydbare: "opgaver vi holder øje med",
    nye: "nye de seneste 7 dage",
    frekvensTal: "2× dagligt",
    frekvens: "opdaterer Birdly",
  },

  // ⚠️ CTA'EN LIGGER STADIG I lib/salgTekst.js FOR DANMARK. Den står her IKKE
  // for at flytte den, men fordi Cta-komponenten skal kunne slå den op pr.
  // marked. DK-vejen i komponenten bruger `CTA` uændret; denne nøgle bliver
  // aldrig læst med marked "DK". Værdierne er kopieret hertil alligevel, så
  // filen kan læses som en fuld ordbog og ikke som en halv.
  cta: {
    primaer: "Find opgaver nu",
    sekundaer: "Se hvordan det virker",
  },

  // ⚠️ TEKSTEN I TELEFONEN ER OPDIGTET, OG DET SKAL DEN VÆRE. Beskeden er en
  // illustration af hvad kunden modtager — ikke en opgave der findes lige nu.
  // Noten under telefonen siger det, og den må aldrig fjernes; uden den er en
  // illustration blevet til en påstand.
  telefon: {
    nu: "nu",
    titel: "Nyt opgavematch",
    fag: "Rengøring",
    sted: "Roskilde",
    hvad: "Fast rengøringsaftale",
    // ⚠️ MELLEMRUMMET EFTER KOLON HØRER TIL STRENGEN. I komponenten stod der
    // `Frist: {frist}` — literalen bar selv sit mellemrum.
    fristLabel: "Frist: ",
    frist: "18. sept.",
    link: "Se opgaven →",
    stop: "Svar STOP for at afmelde",
    // ⚠️ ÉN LINJE. I komponenten stod de to sætninger på hver sin kodelinje,
    // men JSX folder linjeskiftet til ét mellemrum — så det er én tekstnode.
    kvittering: "Du skal ikke søge, logge ind eller holde øje. Vi sender den næste, når den kommer.",
    note: "Eksempel på en besked. Sådan ser et match ud, når det lander.",
  },

  problemet: {
    kick: "Problemet",
    // ⚠️ TO NØGLER, FORDI DER STÅR ET <br /> IMELLEM. Slås de sammen til én
    // streng med et linjeskift, forsvinder linjebruddet i HTML.
    overskrift: "Opgaverne er der.",
    overskrift2: "Problemet er at finde de rigtige.",
    kort: [
      {
        titel: "Vi finder de rigtige.",
        tekst: "Vi sorterer støjen fra og finder de opgaver, der faktisk passer til jer.",
      },
      {
        titel: "Vi sender dem direkte til jer.",
        tekst: "Ingen daglig jagt i udbudsportaler. Når noget passer, får I besked.",
      },
      {
        titel: "De store skal ikke have det hele.",
        tekst:
          "Offentlige kontrakter er også for mindre virksomheder. Birdly gør det lettere at komme med i spillet.",
      },
    ],
    afslut: "Flere relevante opgaver. Mindre jagt. Mere forretning.",
  },

  motoren: {
    kick: "Sådan virker det",
    overskrift: "Du fortæller os én gang, hvad I leder efter.",
    overskrift2: "Birdly gør resten.",
    trin: [
      {
        nr: "01",
        titel: "Fortæl hvad I vil have",
        tekst: "Vælg fag, område og størrelsen på de opgaver, I vil høre om.",
      },
      {
        nr: "02",
        titel: "Birdly holder øje",
        tekst: "Vi finder relevante offentlige og private muligheder og sorterer resten fra.",
      },
      {
        nr: "03",
        titel: "Få besked",
        tekst: "Når noget passer, får I det direkte på SMS og mail.",
      },
    ],
    flow: ["Jeres kriterier", "Birdly holder øje", "SMS til jer"],
    resultatlinje: "Og så gør I kun noget, når opgaven er interessant.",
    afslut: "Ingen daglig søgning. Ingen portal. Ingen støj.",
  },
};
