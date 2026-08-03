import NyForside from "../components/NyForside";
import { SITE_URL, abs } from "../lib/site";
import { hentOpgaveTal } from "../lib/opgaveTal";

// Tallene hentes server-side, så de står i HTML'en ved load — ingen blinkende tom bar,
// og Google ser dem. revalidate styres af hentOpgaveTal (10 min).

// ⚠️ SALGSSIDEN ER NU FORSIDEN (03-08-2026). Roden viste den gamle Forside, og
// husets knapper pegede direkte på /start — så kunden landede i "indtast CVR" uden
// nogensinde at have set hvad hun købte. Rækkefølgen er nu:
//
//   Meta-annonce / organisk / undersides-CTA  →  `/` (sælger)  →  /start (CVR-funnel)
//
// ⚠️ METADATA OG STRUCTURED DATA ER BEVIDST URØRT. Det er dem der bærer brand- og
// SEO-signalerne på husets vigtigste URL; kun det synlige indhold er skiftet ud.
// Havde vi skiftet begge dele på én gang, ville et fald i placeringer ikke kunne
// henføres til hverken indholdet eller mærkningen.
//
// ⚠️ components/Forside.js ER IKKE SLETTET. Den er ~3× så indholdsrig som salgssiden
// (613 mod 221 linjer) og bar hele FAQ- og forklaringslaget. Den står urørt i repoet,
// så sektioner kan hentes tilbage hvis roden taber terræn. Se noten i rapporten.

export const metadata = {
  title: "Offentlige opgaver direkte på SMS | Birdly",
  description:
    "Få besked, når kommuner, regioner og staten har en opgave, der passer til dit fag og dit område. Birdly sender dig en SMS — gratis i 14 dage.",
  // Forsiden manglede canonical HELT — den vigtigste side var den svagest mærkede på
  // hele sitet, mens undersiderne havde deres i orden.
  alternates: { canonical: "/" },
};

// Organization + WebSite. To ting Google bruger dem til: at forstå at birdly.dk ER en
// virksomhed med et navn og en kontaktadresse (knowledge panel, brand-søgninger), og at
// koble domænet til navnet "Birdly" frem for at gætte. CVR og adresse er de samme som i
// footeren og handelsbetingelserne — de må aldrig kunne stå forskelligt tre steder.
const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Birdly",
  url: SITE_URL,
  logo: abs("/icon.svg"),
  email: "hello@birdly.dk",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Fjordvej 4",
    postalCode: "4300",
    addressLocality: "Holbæk",
    addressCountry: "DK",
  },
  identifier: { "@type": "PropertyValue", name: "CVR", value: "35764283" },
  areaServed: { "@type": "Country", name: "Danmark" },
};

const WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Birdly",
  url: SITE_URL,
  inLanguage: "da-DK",
};

// ?fag= / ?region= sættes af de 36 /fag/-siders CTA og føres videre til /start.
// Salgssiden validerer dem ikke — det gør /start mod kataloget, så der kun findes
// ÉT sted hvor de bliver troet på.
export default async function Page({ searchParams }) {
  const { fag = null, region = null } = (await searchParams) || {};
  const opgaveTal = await hentOpgaveTal();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE) }} />
      <NyForside tal={opgaveTal} fag={fag} region={region} />
    </>
  );
}
