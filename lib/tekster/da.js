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



  // ⚠️ HER STÅR KUN DE STRENGE DER FAKTISK STOD INLINE I KOMPONENTEN.
  // Overskrifterne i de tre sektioner herunder kommer fra `lib/salgTekst.js`
  // (STOERRELSE_LINJE, VIND_EN, OFFENTLIGE), og Danmark læser dem STADIG
  // derfra — se `hus()` i Sektioner.js. De er med vilje IKKE kopieret hertil:
  // en kopi ville skulle holdes ens med husets kilde i hånden, og CLAUDE.md er
  // skarp på at salgTekst er enekilden. Kun ordbogen for ANDRE markeder bærer
  // dem, og der findes ingen dansk kopi der kan skride.








  regnestykket: {
    kick: "Regnestykket",
  },


};
