import Forside from "../components/Forside";
import { SITE_URL, abs } from "../lib/site";
import { hentOpgaveTal } from "../lib/opgaveTal";
import { FAQ_SCHEMA } from "../lib/faq";

// Tallene hentes server-side, så de står i HTML'en ved load — ingen blinkende tom bar,
// og Google ser dem. revalidate styres af hentOpgaveTal (10 min).

// ⚠️ RODEN ER HUSETS SEO-FORSIDE — IKKE FUNNELENS INDGANG (03-08-2026).
// Salgssiden lå kortvarigt her; det var forkert. Kæden er:
//
//   organisk / brand-søgning  →  `/` (denne side, forklarer og rangerer)
//   annonce / CTA             →  /kom-i-gang (salgssiden)  →  /start (CVR)  →  betaling
//
// Roden bærer hele forklaringslaget og alle 12 FAQ-svar. Det er dét indhold der
// gør den til den stærkeste URL i huset, og derfor må den ikke skiftes ud med en
// kort konverteringsside. Salgssiden har sin egen adresse og sin egen opgave.
//
// ⚠️ FAQ-TEKSTEN LIGGER I lib/faq.js. Den blev flyttet dertil (ikke ændret,
// verificeret 12 → 12) så salgssidens fire udvalgte spørgsmål læser SAMME svar.
// Kopieret ville de to sæt langsomt drive fra hinanden.

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
      {/* ⚠️ FAQPage hører hjemme HER, ikke på salgssiden. Roden er den eneste side
          med alle 12 spørgsmål, og den eneste der er indekserbar — markup på en
          noindex-side ville ingen se.
          Forvent ikke rige resultater: Google indskrænkede i august 2023
          FAQ-rich-results til myndigheds- og sundhedssites. Markupen hjælper med
          at forstå siden, men køber os ikke plads i søgeresultatet. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <Forside opgaveTal={opgaveTal} />
    </>
  );
}
