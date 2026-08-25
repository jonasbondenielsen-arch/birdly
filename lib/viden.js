// ============================================================================
// /viden — KATALOG OVER GUIDES. Én kilde til URL'er, overskrifter, kategorier,
// intern linking og schema.
//
// ⚠️ EN GUIDE UDEN TEKST BLIVER IKKE PUBLICERET. Feltet `afsnit` er afbryderen:
// er det tomt, er siden `noindex`, den står ikke i /viden-oversigten, den kommer
// ikke i sitemap, og den linkes ikke til fra andre sider. Det er ikke
// overforsigtighed — 8 tomme URL'er er præcis de "tynde sider", hele opgaven
// forbyder, og de ville skade sitet mere end de otte guides gavner.
//
// Konsekvensen er at tingene tænder sig selv: i samme øjeblik Jonas' tekst
// lægges i `afsnit`, bliver siden indekserbar, dukker op i oversigten og i
// sitemap. Ingen flag at huske, intet at glemme.
//
// ⚠️ TEKSTEN SKRIVES IKKE HER. Overskrifter og struktur er aftalt; brødteksten
// leveres af Jonas. Digt den ikke — kvaliteten af svaret ER hele grunden til at
// en answer engine citerer os frem for en andens side.
//
// ⚠️ ANSWER-FIRST ER EN STRUKTUR, IKKE EN STIL. `kortSvar` skal kunne stå helt
// alene, revet ud af siden, og stadig være et korrekt svar på H1-spørgsmålet.
// Det er den tekst en AI citerer. Kan den ikke stå alene, er den forkert skrevet.
//
// ⚠️ ÉN GUIDE, MANGE SPØRGSMÅL. Relaterede underspørgsmål hører hjemme som H2 i
// den guide de passer til — ikke som en ny næsten-identisk URL. To sider om det
// samme konkurrerer med hinanden og taber begge.
// ============================================================================

export const VIDEN_KATEGORIER = [
  { key: "find", navn: "Find opgaver" },
  { key: "udbud", navn: "Offentlige udbud" },
  { key: "smaa", navn: "For små virksomheder" },
];

/**
 * @typedef Guide
 * @property {string}   slug
 * @property {string}   h1          Spørgsmålet, ordret. H1 = det folk søger på.
 * @property {string}   kategori    Nøgle fra VIDEN_KATEGORIER.
 * @property {string}   title       <title>. Naturlig, ikke keyword-stakket.
 * @property {string}   description Meta description.
 * @property {string=}  kortSvar    Det citerbare svar. TOMT = ikke publiceret.
 * @property {Array=}   afsnit      [{ h2, tekst }]. TOMT = ikke publiceret.
 * @property {string[]} relaterede  Slugs på 2-3 andre guides.
 * @property {string[]} brancher    Slugs på branchesider guiden hører sammen med.
 * @property {Array=}   sporgsmaal  [{ q, a }] til FAQPage-schema. Kun ægte Q&A.
 * @property {string=}  opdateret   ISO-dato. Vises kun når den findes.
 */

export const GUIDES = [
  {
    slug: "find-offentlige-opgaver",
    h1: "Hvordan finder man offentlige opgaver?",
    kategori: "find",
    title: "Hvordan finder man offentlige opgaver? | Birdly",
    description:
      "Sådan finder danske virksomheder offentlige opgaver — hvor de offentliggøres, og hvordan du undgår at bruge timer på at lede.",
    relaterede: ["offentlige-udbud-for-begyndere", "find-opgaver-uden-udbudsportal", "udbud-overvaagning"],
    brancher: ["toemrer", "kloak", "rengoring"],
  },
  {
    slug: "offentlige-opgaver-for-smaa-virksomheder",
    h1: "Kan små virksomheder byde på offentlige opgaver?",
    kategori: "smaa",
    title: "Kan små virksomheder byde på offentlige opgaver? | Birdly",
    description:
      "Ja — og mange gør det. Sådan ser reglerne ud for små og mellemstore virksomheder, og hvor de mindre opgaver findes.",
    relaterede: ["offentlige-udbud-for-begyndere", "find-offentlige-opgaver", "flere-opgaver-til-haandvaerkerfirma"],
    brancher: ["murer", "maler", "elektriker"],
  },
  {
    slug: "flere-opgaver-til-haandvaerkerfirma",
    h1: "Hvordan får man flere opgaver til sit håndværkerfirma?",
    kategori: "find",
    title: "Hvordan får man flere opgaver til sit håndværkerfirma? | Birdly",
    description:
      "De kanaler danske håndværkerfirmaer får opgaver gennem — private kunder, offentlige opgaver og hvad der kræver mindst tid.",
    relaterede: ["private-og-offentlige-opgaver", "find-lokale-opgaver", "offentlige-opgaver-for-smaa-virksomheder"],
    brancher: ["toemrer", "murer", "vvs"],
  },
  {
    slug: "offentlige-udbud-for-begyndere",
    h1: "Offentlige udbud for begyndere",
    kategori: "udbud",
    title: "Offentlige udbud for begyndere | Birdly",
    description:
      "Hvad et offentligt udbud er, hvordan processen ser ud, og hvad du skal bruge for at byde første gang.",
    relaterede: ["offentlige-opgaver-for-smaa-virksomheder", "find-offentlige-opgaver", "udbud-overvaagning"],
    brancher: ["entreprenor", "kloak", "toemrer"],
  },
  {
    slug: "find-opgaver-uden-udbudsportal",
    h1: "Skal man selv holde øje med udbudsportaler?",
    kategori: "udbud",
    title: "Skal man selv holde øje med udbudsportaler? | Birdly",
    description:
      "Hvad det koster i tid at følge udbudsportaler selv, og hvilke alternativer der findes for en mindre virksomhed.",
    relaterede: ["udbud-overvaagning", "find-offentlige-opgaver", "offentlige-udbud-for-begyndere"],
    brancher: ["it", "ingenior", "service"],
  },
  {
    slug: "private-og-offentlige-opgaver",
    h1: "Private eller offentlige opgaver — hvad er forskellen?",
    kategori: "find",
    title: "Private eller offentlige opgaver — hvad er forskellen? | Birdly",
    description:
      "Forskellen på en privat kundes opgave og et offentligt udbud: krav, proces, størrelse og hvad der passer til hvilken virksomhed.",
    relaterede: ["flere-opgaver-til-haandvaerkerfirma", "offentlige-udbud-for-begyndere", "find-lokale-opgaver"],
    brancher: ["toemrer", "vvs", "rengoring"],
  },
  {
    slug: "find-lokale-opgaver",
    h1: "Hvordan finder man opgaver i sit lokalområde?",
    kategori: "find",
    title: "Hvordan finder man opgaver i sit lokalområde? | Birdly",
    description:
      "Sådan afgrænser du din søgning geografisk, så du kun bruger tid på opgaver, du reelt kan køre ud til.",
    relaterede: ["flere-opgaver-til-haandvaerkerfirma", "find-offentlige-opgaver", "private-og-offentlige-opgaver"],
    brancher: ["anlaegsgartner", "glarmester", "maler"],
  },
  {
    slug: "udbud-overvaagning",
    h1: "Hvad er udbudsovervågning?",
    kategori: "udbud",
    title: "Hvad er udbudsovervågning? | Birdly",
    description:
      "Hvad udbudsovervågning dækker over, hvad det typisk koster, og hvornår det giver mening for en mindre virksomhed.",
    relaterede: ["find-opgaver-uden-udbudsportal", "find-offentlige-opgaver", "offentlige-udbud-for-begyndere"],
    brancher: ["entreprenor", "service", "transport"],
  },
];

// ⚠️ AFBRYDEREN. En guide er publiceret når den har BÅDE et kort svar og mindst ét
// afsnit. Halvdelen af en side er ikke en side.
export const erKlar = (g) =>
  Boolean(g && g.kortSvar && String(g.kortSvar).trim() && Array.isArray(g.afsnit) && g.afsnit.length > 0);

export const KLARE_GUIDES = GUIDES.filter(erKlar);

export const getGuide = (slug) => GUIDES.find((g) => g.slug === slug) || null;

// Kategori-navn til visning. Ukendt nøgle giver null frem for at vise nøglen råt.
export const kategoriNavn = (key) =>
  VIDEN_KATEGORIER.find((k) => k.key === key)?.navn || null;
