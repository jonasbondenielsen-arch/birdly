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
};
