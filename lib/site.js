// ============================================================================
// SITE_URL — én sandhed om hvilken adresse siden ER.
//
// ⚠️ VÆRTEN SKAL MATCHE DEN DER SVARER 200. birdly.dk svarer 308 og sender videre
// til www.birdly.dk. Stod canonical og sitemap på apex — som de gjorde indtil nu —
// pegede hver eneste URL vi selv udgav på en adresse der omdirigerer. Google får da
// et canonical-tag der udpeger noget andet end det den fik serveret, og resultatet er
// at siden bliver crawlet og lagt til side igen.
//
// Ændres værten (fx hvis apex gøres primær i Vercel), rettes den HER og ingen andre
// steder — det var netop spredningen over fire filer der lod uenigheden opstå.
// ============================================================================
export const SITE_URL = "https://www.birdly.dk";

/** Absolut URL til en sti. abs("/fag/vvs") → "https://www.birdly.dk/fag/vvs" */
export function abs(path = "") {
  return SITE_URL + (path.startsWith("/") ? path : "/" + path);
}
