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

  // ⚠️ HER STÅR KUN DE STRENGE DER FAKTISK STOD INLINE I KOMPONENTEN.
  // Overskrifterne i de tre sektioner herunder kommer fra `lib/salgTekst.js`
  // (STOERRELSE_LINJE, VIND_EN, OFFENTLIGE), og Danmark læser dem STADIG
  // derfra — se `hus()` i Sektioner.js. De er med vilje IKKE kopieret hertil:
  // en kopi ville skulle holdes ens med husets kilde i hånden, og CLAUDE.md er
  // skarp på at salgTekst er enekilden. Kun ordbogen for ANDRE markeder bærer
  // dem, og der findes ingen dansk kopi der kan skride.
  vaerdi: {
    kick: "Det er rigtige opgaver",
    lead: "Birdly finder relevante offentlige og private opgaver til jer. I vælger selv, hvilke I vil byde på.",
  },

  offentlige: {
    kick: "Offentlige opgaver",
    trin: ["Birdly finder opgaven", "I får den på SMS", "I vælger, om I vil byde"],
  },

  overgang: {
    overskrift: "De opgaver er der allerede.",
    // ⚠️ MELLEMRUMMENE I ENDERNE HØRER TIL. Sætningen var delt af et <b> midt
    // inde i sig selv, og de to tekstnoder bar hver sit mellemrum.
    stor1: "Spørgsmålet er bare, om I ",
    stor2: "ser dem",
    stor3: " — og byder på dem.",
  },

  portal: {
    kick: "Forskellen",
    overskrift: "Endnu en portal?",
    overskrift2: "Nej tak.",
    gammel: {
      titel: "Den gamle måde",
      under: "En almindelig udbudstjeneste",
      punkter: ["Log ind", "Søg", "Vælg filtre", "Gennemgå opgaver", "Læs", "Sortér", "Gentag"],
    },
    ny: {
      titel: "Birdly",
      under: "Jeres kriterier, én gang",
      // ⚠️ HANDLINGERNE ER BIRDLYS, IKKE KUNDENS. Venstre side er syv ting
      // kunden selv skal gøre; her gør Birdly tre af fire. Det ER hele
      // sammenligningen — ikke at vi har flere funktioner.
      punkter: [
        "Birdly holder øje",
        "Birdly finder relevante opgaver",
        "I får dem direkte på SMS",
        "I vælger, hvilke I vil gå videre med",
      ],
    },
    payoff: "I leder ikke. Birdly gør.",
    // ⚠️ EJER-SÆTNINGEN STÅR IKKE HER. Den kommer fra EJER_LINJE i
    // salgTekst.js, og CLAUDE.md siger den skal blive stående ordret to steder.
    // En kopi hertil ville være et tredje sted den kunne skride fra.
    afslut:
      "Birdly er ikke lavet til at give jer mere software. Det er lavet til at give jer relevante opgaver.",
  },

  slut: {
    overskrift: "Den næste relevante opgave findes måske allerede.",
    under: "Lad Birdly holde øje for jer.",
  },

  loesningen: {
    kick: "Løsningen",
    overskrift: "Birdly leder.",
    // ⚠️ ANDEN HALVDEL STÅR I ET <span> MED EGEN FARVE. To nøgler, fordi der
    // er et <br /> og en farve imellem — ikke fordi sætningen er delt.
    overskrift2: "I får besked.",
    punkter: [
      "Jeres fag",
      "Jeres område",
      "Jeres ønskede opgavestørrelse",
      "Private og offentlige muligheder",
    ],
    lead: "Når noget passer, sender Birdly det direkte på SMS og mail.",
    afslut: "Mindre søgning. Flere relevante muligheder.",
  },

  sms: {
    kick: "Beskeden",
    // ⚠️ OVERSKRIFTEN OG DE TO LINJER KOMMER FRA salgTekst.js FOR DANMARK
    // (SMS_LINJE, SMS_UNDER, IKKE_HOLDE_OEJE). De står IKKE her — se `hus()`
    // i Sektioner.js. Kun det der stod inline i komponenten bor i ordbogen.
    lead1: "Birdly finder automatisk relevante offentlige og private opgaver til jeres virksomhed.",
    punkter: ["Kort resumé", "Frist", "Direkte link", "Bud-skabelon hvor relevant"],
    // Telefonens eksempel i DEN her sektion (SmsDemo) — ikke hero'ens.
    telefonTitel: "Nyt Birdly-match",
    telefonFrist: "18/09",
  },

  priser: {
    kick: "Én pakke. Alt inkluderet.",
    overskrift: "Prøv gratis. Behold Birdly, hvis det giver mening.",
    badge: "Bedst værdi",
    planNavn: "Årligt",
    // ⚠️ SELVE BELØBENE STÅR IKKE HER. De kommer fra lib/pakke.js, som er
    // husets enekilde og bundet til Frisbii. CLAUDE.md: hardkod ALDRIG et
    // beløb i en komponent — og en kopi i ordbogen ville være præcis det.
    punkter: [
      "Offentlige + private opgaver",
      "SMS + mail ved match",
      "Alle relevante kriterier",
    ],
    maanedSpm: "Foretrækker I månedlig betaling?",
    ctaMaaned: "Vælg månedsbetaling",
    ingenBinding: "ingen binding",
  },

  risiko: {
    kick: "Prøv det uden risiko",
    // ⚠️ OVERSKRIFTEN ER GARANTI.overskrift FRA salgTekst.js. Den står ikke
    // her: garanti-tekst har ÉN kilde, og CLAUDE.md er skarp på det.
    lead: "Se først, hvad Birdly finder til jeres virksomhed. 0 kr. i dag.",
    // ⚠️ FØRSTE PUNKT BYGGES AF TRIAL_DAYS ("{n} dage gratis"), fordi tallet
    // kommer fra lib/pakke.js. Derfor står kun de tre faste her.
    punkter: ["Ingen binding", "Ingen portal", "Opsætning på få minutter"],
  },
};
