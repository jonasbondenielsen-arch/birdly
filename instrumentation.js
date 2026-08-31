// ============================================================================
// SERVER-SIDE FEJLFANGST — Next kalder onRequestError ved enhver fejl under
// server-rendering eller i en route handler.
//
// ⚠️ DET ER PRÆCIS HER SAMLESIDE-500'EN VILLE VÆRE FANGET. `omfangTekst is not
// defined` kastede under server-rendering; kunden så en fejlside, og ingen andre
// så noget som helst i 5 dage. Med den her hook havde Jonas fået én mail samme
// minut, første gang det skete.
//
// ⚠️ HOOKEN MAA ALDRIG KASTE. Kaster den, fejler requesten et nyt sted, og den
// oprindelige fejl bliver skjult bag en anden. Derfor try/catch om alt.
//
// ⚠️ KUN RUTE OG BESKED SENDES VIDERE. `request` indeholder headers og
// query-parametre; intet af det maa ud af huset.
// ============================================================================

export async function register() {
  // Ingen opstartsarbejde. Funktionen skal findes, for at Next indlæser filen
  // og dermed registrerer onRequestError nedenfor.
}

export async function onRequestError(fejl, request) {
  try {
    const { rapporterFejl } = await import("./lib/fejlrapport.js");
    rapporterFejl(fejl, { rute: request?.path || null, kilde: "server" });
  } catch {
    /* se noten oeverst */
  }
}
