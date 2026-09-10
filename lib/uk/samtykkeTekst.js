// ============================================================================
// COOKIE-BANNERETS ENGELSKE TEKST.
//
// ⚠️ EGEN LILLE FIL, IKKE lib/tekster/en.js — OG DET ER MÅLT, IKKE SMAG.
// Banneret ligger i ROD-LAYOUTET, altså på hver eneste side. Importerede det
// ordbogen, ville både den danske og den engelske ordbog havne i klient-
// bundtet på hver eneste danske side — det værst tænkelige sted. Filen her
// har derfor NUL imports.
//
// ⚠️ KATEGORI-TEKSTERNE ER IKKE MINE. De står ordret i cookie-politikkens
// §4 (jura-pakken), og de er den samme tekst kunden læser hvis hun klikker
// videre. Ændres de dér, skal de ændres her — scripts/verify-uk-samtykke.mjs
// beviser at de stadig er ens.
//
// ⚠️ KNAPPERNE ER UI-CHROME. Copy-filen §29 skriver banner-teksten og de to
// link-navne, men siger om knapperne kun "Buttons should use standard UK
// consent wording" — altså en instruks, ikke ordlyd. De fem knap-strenge er
// derfor skrevet af CC i britisk standardsprog og står i UNDTAGET i
// scripts/verify-uk-copy.mjs. Samme kategori som FAQ-foldeknappen.
// ============================================================================

export const SAMTYKKE_EN = {
  // Copy-filen §29, "Plain version" — ordret.
  brod:
    "We use cookies to make the site work and — if you say yes — to see whether our ads are reaching the right people. You're in control.",
  // Copy-filen §29, "Links: Cookie Policy · Privacy Policy".
  cookieLink: "Cookie Policy",
  privatlivLink: "Privacy Policy",

  // UI-chrome — se noten øverst.
  tilpas: "Customise",
  skjul: "Hide options",
  kunNoedvendige: "Necessary only",
  accepterAlle: "Accept all",
  gem: "Save my choices",
  // Skjult regions-label. Stod paa dansk ("Samtykke til cookies") ogsaa paa den
  // britiske side - en skaermlaeser laeste altsaa dansk op midt i en engelsk
  // side. Fundet fordi find-vaerktoejet viste labelen 10-09-2026.
  regionLabel: "Cookie consent",
  altidAktiv: " · always on",

  // ⚠️ ORDRET FRA COOKIE-POLITIKKENS §4. De tre id'er er husets egne
  // (lib/samtykke.js); teksten er pakkens.
  //
  // ⚠️ POLITIKKEN HAR FIRE KATEGORIER, BANNERET HAR TRE. Politikken beskriver
  // også "Functional — Optional preferences not strictly necessary", som
  // banneret ikke tilbyder at vælge. Det er en uoverensstemmelse mellem
  // dokumentet og implementeringen, ikke noget jeg kan skrive mig ud af.
  // Flagget til Jonas sammen med de øvrige launch-blokkere.
  kategorier: {
    noedvendige: {
      navn: "Necessary",
      tekst: "Site security, navigation, required forms/sessions and remembering cookie choice.",
    },
    statistik: {
      navn: "Analytics",
      tekst: "Understanding website use and improving navigation, design, conversion and performance.",
    },
    marketing: {
      navn: "Marketing",
      tekst: "Advertising measurement, attribution, audience building and remarketing, including Meta where used.",
    },
  },
};

// ⚠️ MARKEDET AFGØRES I BROWSEREN, OG DET ER ET VALG.
// Banneret renderer intet på serveren (`vis` sættes først i useEffect), så der
// er ingen server-render at tage markedet fra. Alternativet — at læse
// x-birdly-marked i rod-layoutet — ville kræve headers() og gøre HVER dansk
// side dynamisk. Den pris er alt for høj for en cookie-bjælke.
//
// ⚠️ VÆRTSNAVNENE STÅR DESVÆRRE TO STEDER. lib/markets.js er den rigtige
// kilde, men den må ikke importeres her (se noten øverst). Duplikeringen er
// bevidst og snæver: kun "getbirdly" og /uk-præfikset, ikke hele markedslisten.
// Tilføjes et tredje marked, skal det her genbesøges — derfor står det her og
// ikke gemt inde i komponenten.
export function ukKontekst() {
  if (typeof window === "undefined") return null;
  const vaert = window.location.hostname || "";
  const sti = window.location.pathname || "";
  const paaUkSti = sti === "/uk" || sti.startsWith("/uk/");
  if (!vaert.includes("getbirdly") && !paaUkSti) return null;
  // På det britiske domæne er juraen på /cookie-policy; på et dansk domæne
  // ligger den britiske side under /uk/cookie-policy. Linket skal virke begge
  // steder — ellers har vi bygget et dødt link ind i selve samtykket.
  const praefiks = paaUkSti ? "/uk" : "";
  return {
    t: SAMTYKKE_EN,
    cookieHref: praefiks + "/cookie-policy",
    privatlivHref: praefiks + "/privacy-policy",
  };
}
