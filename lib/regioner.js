// ============================================================================
// REGIONER til fag×geo-siderne.
//
// slug er æ/ø-fri som fag-slugs, og den er MED VILJE identisk med region_key i
// databasen — så CTA'ens ?region= kan sendes direkte videre til funnelen uden en
// oversættelsestabel der kan komme til at pege forkert.
//
// praep findes fordi dansk ikke er konsekvent: det hedder "i Hovedstaden" men "på
// Sjælland". Uden den ville hver anden overskrift lyde forkert, og en side der lyder
// maskinskrevet er præcis dét vi ikke vil have.
// ============================================================================
export const REGIONER = [
  {
    slug: "hovedstaden", navn: "Hovedstaden", praep: "i",
    kommuner: "København, Frederiksberg, Gentofte, Gladsaxe, Hvidovre og resten af hovedstadsområdet",
    naerhed: "Regionen har landets tætteste koncentration af kommuner, og der er derfor flest opgaver her.",
  },
  {
    slug: "sjaelland", navn: "Sjælland", praep: "på",
    kommuner: "Roskilde, Køge, Næstved, Holbæk, Slagelse og resten af Region Sjælland",
    naerhed: "Afstandene er korte, så mange firmaer her byder både på Sjælland og i hovedstadsområdet.",
  },
  {
    slug: "syddanmark", navn: "Syddanmark", praep: "i",
    kommuner: "Odense, Esbjerg, Kolding, Vejle, Sønderborg og resten af Region Syddanmark",
    naerhed: "Regionen dækker både Fyn og Sønderjylland, så opgaverne er spredt over et stort område.",
  },
  {
    slug: "midtjylland", navn: "Midtjylland", praep: "i",
    kommuner: "Aarhus, Randers, Herning, Horsens, Silkeborg og resten af Region Midtjylland",
    naerhed: "Aarhus og oplandet står for en stor del af opgaverne, men de mindre kommuner udbyder også løbende.",
  },
  {
    slug: "nordjylland", navn: "Nordjylland", praep: "i",
    kommuner: "Aalborg, Hjørring, Frederikshavn, Thisted, Mariagerfjord og resten af Region Nordjylland",
    naerhed: "Færre kommuner end i resten af landet, men til gengæld er der ofte mindre konkurrence om opgaverne.",
  },
];

export function getRegion(slug) {
  return REGIONER.find((r) => r.slug === slug) || null;
}

// ============================================================================
// DE 16 KOMBINATIONER — og hvorfor der ikke er 100.
//
// Målt 29-07-2026 på 50 dages data (9/6-28/7, 423 bydbare udbud), kun på de SMALLE
// fagspecifikke CPV-koder. De brede byggekoder er bevidst holdt ude: otte byggefag
// deler dem, og med dem gav VVS og Maler nøjagtig de samme 37 udbud i Hovedstaden.
// Havde vi bygget på hele CPV-sættet, ville 40 af siderne have vist identisk indhold.
//
// Kriteriet er GENNEMSTRØMNING, ikke et øjebliksbillede: en side skal have nyt
// indhold hver måned, ellers står den tom det meste af året.
//   Entreprenør/anlæg  31,8 udbud/md  → ~6,4 pr. region → alle 5 regioner
//   Ingeniør/rådgiver  23,3 udbud/md  → ~4,7 pr. region → alle 5 regioner
//   Resten             <14 udbud/md   → kun Hovedstaden, som bærer ~40 % af volumen
//
// Maler har ÉT bydbart udbud på smalle koder i 50 dage. En Maler-side pr. region
// ville være tom elleve måneder om året — derfor er den ikke med.
// ============================================================================
export const FAG_GEO = [
  { fag: "entreprenor", regioner: ["hovedstaden", "sjaelland", "syddanmark", "midtjylland", "nordjylland"] },
  { fag: "ingenior", regioner: ["hovedstaden", "sjaelland", "syddanmark", "midtjylland", "nordjylland"] },
  { fag: "it", regioner: ["hovedstaden"] },
  { fag: "service", regioner: ["hovedstaden"] },
  { fag: "forretningsservice", regioner: ["hovedstaden"] },
  { fag: "elektriker", regioner: ["hovedstaden"] },
  { fag: "affald", regioner: ["hovedstaden"] },
  { fag: "vvs", regioner: ["hovedstaden"] },
];

/** Alle gyldige {fag, region}-par — én kilde til ruter, sitemap og interne links. */
export function alleFagGeo() {
  return FAG_GEO.flatMap((f) => f.regioner.map((r) => ({ fag: f.fag, region: r })));
}

/** Regioner vi har bygget en side for til et givet fag. Tom liste = ingen. */
export function regionerForFag(fagSlug) {
  const f = FAG_GEO.find((x) => x.fag === fagSlug);
  return f ? f.regioner.map(getRegion).filter(Boolean) : [];
}
