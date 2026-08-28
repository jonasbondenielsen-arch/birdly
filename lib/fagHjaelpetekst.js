// ============================================================================
// FAG-SPECIFIK HJAELPETEKST VED BESKRIVELSESFELTET (Jonas 28-08-2026).
//
// ⚠️ DEN STAAR, DEN FORSVINDER IKKE. Teksten er en synlig linje UNDER labelen -
// ikke en placeholder. En placeholder forsvinder i det oejeblik kunden begynder
// at skrive, altsaa praecis naar hun har brug for at vide hvad vi spoerger om.
//
// ⚠️ DERFOR STAAR FAGET FOERST I FORMULAREN NU. Hjaelpeteksten kan kun tilpasses
// faget hvis faget er valgt foerst; raekkefoelgen "vaelg fag -> beskriv opgaven"
// er ikke kosmetik, den er forudsaetningen for denne fil.
//
// ⚠️ COPY-REGLEN GAELDER HER OGSAA. Ingen "de rette" eller "relevante"
// virksomheder - Birdly matcher paa fag og omraade og screener ikke nogen.
// "Jo mere konkret, jo bedre match" handler om match-praecision (rigtigt fag,
// rigtige detaljer), ikke om at vaelge virksomheder fra.
//
// SAADAN TILFOEJER DU ET FAG: skriv én linje i TEKSTER med fagets key. Intet
// andet skal roeres - komponenten slaar bare op.
// ============================================================================

const GENERISK =
  "Beskriv kort opgaven — omfang, sted og hvornår. Jo mere konkret, jo bedre match.";

const TEKSTER = {
  rengoring:
    "Beskriv kort: er det kontor, klinik e.l.? Og hvilket interval ønskes " +
    "(fx ugentligt, hver 14. dag)? Jo mere konkret, jo bedre match.",
};

/**
 * ⚠️ ÉN LINJE, ALDRIG FLERE. Har kunden valgt flere fag, ville to hjaelpetekster
 * modsige hinanden i tone og laengde og gøre feltet tungere end det er. Er der
 * praecis ét fag med en egen tekst, bruges den; ellers den generiske.
 *
 * @param {string[]} fagKeys  de valgte fag-keys
 * @returns {string}
 */
export function fagHjaelpetekst(fagKeys) {
  const valgte = (fagKeys || []).filter(Boolean);
  if (valgte.length !== 1) return GENERISK;
  return TEKSTER[valgte[0]] || GENERISK;
}
