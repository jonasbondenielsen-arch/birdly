// ============================================================================
// FAG-SØGNING — et rent UI-lag oven på den FASTE fag-liste.
//
// ⚠️ DER OPSTÅR ALDRIG ET NYT FAG HER. Søgefeltet finder kun frem til de nøgler
// kataloget allerede har (tomrer, murer, …). Fagene er bundet til Fag→CPV-mapningen
// og dermed til matchmotoren; et fritekst-fag ville blive gemt på opgaven og aldrig
// matche noget som helst. Vælger brugeren et forslag, gemmes fagets KODE — aldrig
// hendes søgetekst.
//
// ⚠️ DER FINDES IKKE ET "TAGARBEJDE"-FAG, og det skal der heller ikke. "tag" er et
// ALIAS der peger på eksisterende fag. Fristelsen til at oprette et fag fordi et
// søgeord mangler, er præcis det der ville sprænge taksonomien — tilføj i stedet
// ordet til ALIAS nedenfor.
//
// ⚠️ PRIVATE STAVER FORKERT, OG DE KENDER IKKE VORES FAGBETEGNELSER. En kvinde med et
// utæt tag søger "tag", ikke "Tømrer/snedker". En mand med en stoppet afløb søger
// "kloak" eller "afløb" eller "rør". Uden aliaslaget ville de begge få nul resultater
// og forlade siden — og det er den dyreste fejl på en betalt landingsside.
//
// ⚠️ INGEN TUNG DEPENDENCY. 21 fag og et par hundrede alias-ord søges hurtigere i en
// løkke end noget bibliotek kan indlæses. Meta-trafik er mobil; hvert kilobyte er
// ventetid før hun kan skrive.
// ============================================================================

// Alias → fag-nøgler. Ét ord kan pege på flere fag; så vises de begge, og hun vælger.
//
// ⚠️ SKRIV ORDENE SOM FOLK SKRIVER DEM, ikke som de staves korrekt. "tomrer" uden ø
// står her med vilje — normaliseringen fjerner ø, men listen skal også kunne rumme
// ord der ikke ER stavefejl, bare hverdagssprog ("vindue", "hæk", "flytte").
const ALIAS = {
  tomrer: ["tag", "tagarbejde", "nyt tag", "tagrende", "spær", "loft", "gulv", "trægulv", "parket",
           "terrasse", "carport", "skur", "udestue", "dør", "døre", "vindue", "vinduer", "køkken",
           "snedker", "tømrerarbejde", "trappe", "indretning", "væg", "vægge", "isolering", "træ"],
  murer: ["mur", "murværk", "fliser", "flisearbejde", "badeværelse", "bad", "puds", "pudsning",
          "beton", "sokkel", "skorsten", "brolægning", "fuger", "klinker", "tegl"],
  maler: ["male", "maling", "malerarbejde", "spartle", "spartling", "tapet", "tapetsering",
          "facademaling", "træværk", "lakering"],
  vvs: ["vand", "rør", "rørlægger", "blikkenslager", "vandhane", "toilet", "wc", "radiator",
        "varme", "varmepumpe", "fjernvarme", "vandskade", "utæt", "afløb", "vaskemaskine",
        "opvaskemaskine", "brusekabine", "sanitet"],
  elektriker: ["el", "elarbejde", "strøm", "stikkontakt", "kontakt", "lampe", "lys", "belysning",
               "tavle", "eltavle", "ladestander", "elbil", "solceller", "sikring", "installation"],
  entreprenor: ["anlæg", "gravearbejde", "grave", "fundament", "nedrivning", "jordarbejde",
                "udgravning", "støbning", "tilbygning", "totalentreprise", "byggeri", "renovering"],
  kloak: ["afløb", "kloakering", "stoppet", "faskine", "dræn", "dræning", "brønd", "septik",
          "spuling", "rotter i kloak"],
  // "vindue"/"vinduer" staar BEGGE steder med vilje: en raadden karm er toemrerens,
  // en knust rude er glarmesterens, og kunden ved ikke hvilken hun har. Begge vises,
  // og hun vaelger - det er bedre end at gaette paa hendes vegne.
  glarmester: ["glas", "rude", "ruder", "termorude", "vinduesglas", "vindue", "vinduer",
               "spejl", "glasparti", "punkteret", "knust"],
  rengoring: ["reng", "rengor", "gøre rent", "hovedrengøring", "flytterengøring", "vinduespudsning",
              "pudse vinduer", "clean", "cleaning", "rens", "erhvervsrengøring"],
  affald: ["skrald", "container", "bortskaffelse", "genbrug", "miljø", "asbest", "oprydning",
           "storskrald", "deponi"],
  anlaegsgartner: ["have", "haven", "græs", "græsslåning", "hæk", "hækklipning", "træfældning",
                   "beskæring", "belægning", "fliser i haven", "gartner", "beplantning", "ukrudt",
                   "anlægsgartner", "grønt"],
  transport: ["flytning", "flytte", "flyttefirma", "vognmand", "kørsel", "levering", "fragt",
              "lastbil", "kran", "transport"],
  arkitekt: ["tegning", "tegninger", "byggetilladelse", "projektering", "skitse", "arkitekttegning"],
  ingenior: ["rådgiver", "rådgivning", "statiker", "beregning", "konstruktion", "ingeniørarbejde",
             "energimærke", "tilstandsrapport"],
  it: ["computer", "pc", "netværk", "wifi", "hjemmeside", "web", "software", "programmering",
       "it-support", "server", "app"],
  service: ["vedligehold", "vedligeholdelse", "reparation", "reparere", "service", "eftersyn",
            "montering", "opsætning", "handyman", "altmuligmand", "småopgaver"],
  forretningsservice: ["revisor", "regnskab", "bogholder", "bogføring", "advokat", "jura",
                       "juridisk", "årsregnskab", "moms", "skat"],
  catering: ["mad", "catering", "forplejning", "frokost", "fest", "selskab", "kok", "buffet"],
  mobler: ["møbler", "inventar", "reol", "bord", "stole", "skab", "garderobe", "møbelmontering",
           "specialmøbler"],
  vagt: ["vagt", "sikring", "alarm", "overvågning", "kamera", "tyverisikring", "adgangskontrol", "låse"],
  skadedyr: ["rotter", "rotte", "mus", "skadedyr", "hveps", "hvepsebo", "insekter", "møl",
             "skadedyrsbekæmpelse", "borebiller"],
};

// ⚠️ Æ/Ø/Å FOLDES, OG DET ER IKKE KOSMETIK. Hun skriver "tomrer" på et mobiltastatur
// i hast, eller "graes" fordi æ sidder et andet sted. Uden foldningen giver begge nul
// resultater. Bindestreger og mellemrum ryger med, så "el-arbejde" og "el arbejde"
// finder det samme.
export function normaliser(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
    .replace(/[^a-z0-9]/g, "");
}

// ⚠️ EN ANDEN FOLDNING ER NØDVENDIG, og det er ikke overflod. Med ø→oe bliver
// "tømrer" til "toemrer" — og så finder "tom" ingenting, selv om det er præcis hvad
// et menneske skriver når ø'et er besværligt på mobilen. Her foldes ø→o, æ→a, å→a,
// så "tømrer" også kendes som "tomrer". Begge former prøves; den ene fanger
// "toemrer", den anden "tomrer", og tilsammen dækker de hvordan folk faktisk taster.
export function normaliserFlad(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/æ/g, "a").replace(/ø/g, "o").replace(/å/g, "a")
    .replace(/[^a-z0-9]/g, "");
}

// Levenshtein med tidligt stop. Vi behøver kun at vide OM afstanden er lille — ikke
// præcis hvor stor den er — så løkken afbrydes når den er håbløs.
function afstand(a, b, maks) {
  if (Math.abs(a.length - b.length) > maks) return maks + 1;
  let forrige = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const naavaerende = [i];
    let bedste = i;
    for (let j = 1; j <= b.length; j++) {
      const pris = a[i - 1] === b[j - 1] ? 0 : 1;
      naavaerende[j] = Math.min(forrige[j] + 1, naavaerende[j - 1] + 1, forrige[j - 1] + pris);
      if (naavaerende[j] < bedste) bedste = naavaerende[j];
    }
    if (bedste > maks) return maks + 1;
    forrige = naavaerende;
  }
  return forrige[b.length];
}

// ⚠️ RÆKKEFØLGEN ER PRIORITETEN: exact → prefix → alias → fuzzy. Et lavere tal er
// bedre. Uden den ville "el" liste Elektriker under Affald/miljø, fordi "deponi"
// tilfældigvis indeholder bogstaverne.
const POINT = { exact: 0, prefix: 1, alias_exact: 2, alias_prefix: 3, indeholder: 4, fuzzy: 5 };

/**
 * @param {string} soegetekst
 * @param {Array<{key:string,label_da?:string,label?:string}>} fagListe  fra kataloget
 * @param {string[]} alleredeValgt  nøgler der ikke skal foreslås igen
 * @param {number} maks
 * @returns {Array} de bedste fag, uændrede objekter fra fagListe
 */
export function soegFag(soegetekst, fagListe, alleredeValgt = [], maks = 6) {
  // ⚠️ FLERE ORD SØGES OGSÅ HVER FOR SIG. Normaliseringen fjerner mellemrum, så
  // "knust rude" bliver til "knustrude" og rammer ingenting — men hun skriver
  // sjældent ét ord. Derfor: prøv hele strengen først (den er mest præcis), og
  // suppler med de enkelte ord i den rækkefølge de står.
  const ord = String(soegetekst || "").trim().split(/\s+/).filter((o) => o.length >= 2);
  if (ord.length > 1) {
    const set = new Map();
    for (const t of [soegetekst, ...ord]) {
      for (const f of soegEt(t, fagListe, alleredeValgt, maks)) {
        if (!set.has(f.key)) set.set(f.key, f);
      }
      if (set.size >= maks) break;
    }
    return [...set.values()].slice(0, maks);
  }
  return soegEt(soegetekst, fagListe, alleredeValgt, maks);
}

function soegEt(soegetekst, fagListe, alleredeValgt = [], maks = 6) {
  const q = normaliser(soegetekst);
  const qf = normaliserFlad(soegetekst);
  if (!q) return [];
  const valgt = new Set(alleredeValgt);
  const traef = [];

  for (const fag of fagListe || []) {
    if (valgt.has(fag.key)) continue;
    const raa = fag.label_da || fag.label || fag.key;
    const navn = normaliser(raa);
    const navnF = normaliserFlad(raa);
    let point = null;

    if (navn === q || navnF === qf) point = POINT.exact;
    else if (navn.startsWith(q) || navnF.startsWith(qf)) point = POINT.prefix;

    if (point === null) {
      for (const ord of ALIAS[fag.key] || []) {
        const a = normaliser(ord);
        const af = normaliserFlad(ord);
        if (a === q || af === qf) { point = POINT.alias_exact; break; }
        if (a.startsWith(q) || af.startsWith(qf)) { point = Math.min(point ?? 99, POINT.alias_prefix); }
      }
    }
    // "indeholder" fanger sammensatte fagnavne: "blik" i "vvsblikkenslager".
    // ⚠️ KRÆVER MINDST 3 TEGN. Med to ville "it" ramme hvert eneste fagnavn der
    // indeholder de bogstaver, og listen ville se tilfældig ud.
    if (point === null && q.length >= 3 && (navn.includes(q) || navnF.includes(qf))) point = POINT.indeholder;

    // Fuzzy til sidst, og kun på ord af en vis længde: på korte ord er én
    // bogstavfejls afstand så stor en andel at alt ligner alt.
    if (point === null && q.length >= 4) {
      const grænse = q.length >= 6 ? 2 : 1;
      if (afstand(q, navn.slice(0, q.length + grænse), grænse) <= grænse) point = POINT.fuzzy;
      else {
        for (const ord of ALIAS[fag.key] || []) {
          const a = normaliser(ord);
          if (a.length < 4) continue;
          if (afstand(q, a, grænse) <= grænse) { point = POINT.fuzzy; break; }
        }
      }
    }

    if (point !== null) traef.push({ fag, point });
  }

  traef.sort((a, b) => a.point - b.point || (a.fag.label_da || "").localeCompare(b.fag.label_da || "", "da"));
  return traef.slice(0, maks).map((t) => t.fag);
}
