import Footer from "../../components/Footer";
import SalgHeader from "../../components/salg/SalgHeader";
import { Priser, RisikoFjernet, SalgFaq, SlutCta, BevisBjaelke } from "../../components/salg/Sektioner";
import { Vaerdi } from "../../components/salg/VaerdiSektion";
import { hentOpgaveTal } from "../../lib/opgaveTal";
import { medQuery } from "../../lib/funnelLink";
import { abs } from "../../lib/site";
import { priceText } from "../../lib/pakke";
import "../salg.css";

// ============================================================================
// /priser — NY, INDEKSERBAR SIDE (06-09-2026, godkendt af Jonas).
//
// ⚠️ EGEN SØGEINTENTION, IKKE EN KOPI AF RODEN. Folk søger "hvad koster
// udbudsovervågning" og "pris udbudsservice" — det er en anden hensigt end
// "find offentlige opgaver", som roden dækker. Derfor er den indekserbar og har
// sin egen canonical; havde den blot gentaget rodens salgstekst, ville de to
// konkurrere om de samme ord uden at vinde et nyt.
//
// ⚠️ /hvorfor-birdly og /sadan-virker-det er til gengæld NOINDEX. De siger det
// samme som rodens egne afsnit og ville kannibalisere den. Forskellen er ikke
// vilkårlig: prisen har et selvstændigt søgeord, forklaringerne har ikke.
//
// ⚠️ BELØB KOMMER FRA lib/pakke.js. Hverken title, description eller Offer
// nedenfor må skrive et tal i hånden — så ville et prisskift efterlade
// søgeresultatet med den gamle pris, og dét er dyrere end en forkert side:
// Google viser den i dagevis.
// ============================================================================
export const metadata = {
  title: `Hvad koster Birdly? ${priceText.perMonthBoth} ekskl. moms | Birdly`,
  description:
    `Birdly koster ${priceText.monthlyLong} eller ${priceText.yearlyLong} ekskl. moms. 14 dages gratis prøve, ingen binding og matchgaranti. Se hvad der er inkluderet.`,
  alternates: { canonical: "/priser" },
  openGraph: {
    title: "Hvad koster Birdly? | Birdly",
    description: `Én pakke med alt inkluderet: ${priceText.perMonthBoth} ekskl. moms. 14 dages gratis prøve.`,
    type: "website",
    locale: "da_DK",
    siteName: "Birdly",
    url: abs("/priser"),
  },
};

// Brødkrumme, som fag-siderne allerede har. Den giver "Birdly › Priser" i
// søgeresultatet frem for en bar URL, og den fortæller Google at siden hører til
// under roden frem for at ligge løsrevet.
const BROEDKRUMME = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Forside", item: abs("/") },
    { "@type": "ListItem", position: 2, name: "Priser", item: abs("/priser") },
  ],
};

export default async function Page({ searchParams }) {
  const sp = (await searchParams) || {};
  const funnelHref = medQuery("/kom-i-gang", sp);
  const tal = await hentOpgaveTal();

  return (
    <div className="sg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BROEDKRUMME) }} />
      <SalgHeader funnelHref={funnelHref} />

      {/* RESULTAT FØRST — også på en prisside. ⚠️ Overskriften sælger ikke
          prisen, den sælger forholdet mellem pris og udbytte. En prisside der
          leder med "499 kr." beder om en beslutning før den har givet en grund. */}
      <section className="sg-hero">
        <div className="sg-wrap sg-midt">
          <span className="sg-pill">Priser</span>
          <h1>Én relevant opgave kan gøre prisen på Birdly meget lille.</h1>
          <p className="sg-lead">
            Én pakke med alt inkluderet — {priceText.perMonthBoth} ekskl. moms. Samme
            indhold uanset om I dækker én landsdel eller hele Danmark.
          </p>
        </div>
      </section>

      <BevisBjaelke tal={tal} />
      <Vaerdi funnelHref={funnelHref} />
      <RisikoFjernet funnelHref={funnelHref} />
      <Priser funnelHref={funnelHref} />
      <SalgFaq funnelHref={funnelHref} />
      <SlutCta funnelHref={funnelHref} />

      <Footer />
    </div>
  );
}
