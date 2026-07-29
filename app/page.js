import Forside from "../components/Forside";
import { SITE_URL, abs } from "../lib/site";
import { hentOpgaveTal } from "../lib/opgaveTal";

// Tallene hentes server-side, så de står i HTML'en ved load — ingen blinkende tom bar,
// og Google ser dem. revalidate styres af hentOpgaveTal (10 min).

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

export default async function Page() {
  const opgaveTal = await hentOpgaveTal();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE) }} />
      <Forside opgaveTal={opgaveTal} />
    </>
  );
}
