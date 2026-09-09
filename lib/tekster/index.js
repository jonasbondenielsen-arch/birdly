// ============================================================================
// TEKST PR. MARKED — ordbogslaget bag det engelske site (UK Fase A, del 2).
//
// ⚠️ DANMARK ER IDENTISK *BY CONSTRUCTION*, IKKE VED OMHU.
// `da.js` indeholder præcis de strenge der stod inline i komponenterne — byte
// for byte, hårde mellemrum og tankestreger inklusive. Komponenten slår op i
// stedet for at have teksten i sig; slår den op i DK-ordbogen, kommer nøjagtig
// den samme streng ud. DK kan derfor ikke flytte sig ved et uheld, og det er
// bevist med en renderet-HTML-diff, ikke med en gennemlæsning.
//
// ⚠️ ENGELSK ER IKKE EN OVERSÆTTELSE. `en.js` er verbatim fra
// BIRDLY_UK_FULL_SITE_COPY_EN_GB_2026-09-08.md, som selv siger det:
// "A normal British business talking to another normal British business" —
// ikke et dansk SaaS-site oversat til korrekt engelsk. Skriv aldrig en engelsk
// streng ved at oversætte den danske; slå den op i copy-filen.
//
// ⚠️ MANGLER EN NØGLE PÅ ET MARKED, FALDER DEN **IKKE** TILBAGE TIL DANSK.
// En dansk sætning på en britisk side er værre end en manglende: den ser ud
// som om den hører til. `t()` returnerer null, og komponenten skal selv
// udelade afsnittet. Samme princip som regionsnavnene i admin: hellere
// ingenting end noget forkert.
// ============================================================================
import { da } from "./da";
import { en } from "./en";

const ORDBOEGER = { DK: da, GB: en };

export const STANDARD = "DK";

/** Hele ordbogen for et marked. Ukendt marked → dansk (kun DK findes i dag). */
export function tekster(marked = STANDARD) {
  return ORDBOEGER[marked] || ORDBOEGER[STANDARD];
}

/**
 * Én nøgle, med sti: t(marked, "hero.overskrift").
 * Findes den ikke, returneres null — ALDRIG den danske streng.
 */
export function t(marked, sti) {
  const ord = tekster(marked);
  let v = ord;
  for (const del of String(sti).split(".")) {
    if (v == null || typeof v !== "object") return null;
    v = v[del];
  }
  return v === undefined ? null : v;
}
