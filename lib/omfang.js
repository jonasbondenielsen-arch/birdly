// ============================================================================
// OPGAVENS OMFANG — én kilde til båndene.
//
// Vises tre steder (formularen, virksomhedens opgave-side, opretterens liste), og
// teksterne SKAL være ens: virksomheden skal se nøjagtig det bånd opretteren valgte,
// ikke en omskrivning der lyder anderledes.
//
// ⚠️ KODEN ER STABIL, TEKSTEN ER IKKE. `key` gemmes i basen og indgår i
// event-loggen; `label` og `interval` må omformuleres. Skift aldrig en key.
//
// ⚠️ INTERVALLERNE ER OPRETTERENS EGET SKØN, ikke et tilbud. Teksten til
// virksomheden må aldrig få dem til at lyde som et budget hun kan regne med.
// ============================================================================

export const OMFANG = [
  { key: "mindre", label: "Mindre opgave", interval: "0–25.000 kr." },
  { key: "mellem", label: "Mellem opgave", interval: "25.000–100.000 kr." },
  { key: "stor", label: "Stor opgave", interval: "100.000 kr. og op" },
  // ⚠️ EN RIGTIG VÆRDI, ikke "intet svar". At en privatperson ikke ved hvad et nyt tag
  // koster, er information i sig selv — og den skal virksomheden kunne se, frem for at
  // gætte på hvorfor feltet er tomt.
  { key: "ved_ikke", label: "Det ved jeg ikke", interval: "" },
];

const VED = Object.fromEntries(OMFANG.map((o) => [o.key, o]));

// Til virksomheden: "Mellem opgave (25.000–100.000 kr.)".
export function omfangTekst(key) {
  const o = VED[key];
  if (!o) return null;
  return o.interval ? `${o.label} (${o.interval})` : o.label;
}
