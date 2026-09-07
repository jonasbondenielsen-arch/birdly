import Footer from "../../components/Footer";
import SalgHeader from "../../components/salg/SalgHeader";
import { IkkePortal, Problemet, RisikoFjernet, SlutCta, SalgFaq } from "../../components/salg/Sektioner";
import { medQuery } from "../../lib/funnelLink";
import { EJER_LINJE } from "../../lib/salgTekst";
import "../salg.css";

// ============================================================================
// /hvorfor-birdly — STØTTESIDE, NOINDEX (06-09-2026, godkendt af Jonas).
//
// ⚠️ NOINDEX ER ET VALG, IKKE EN FORGLEMMELSE. Siden siger det samme som rodens
// eget "Derfor er Birdly anderledes"-afsnit, til den samme søgende. Var den
// indekserbar, ville vi selv sætte den op mod den side den skal føde — og roden
// har hele forklaringslaget og alle tolv FAQ-svar bag sig.
//
// Hvad den så er til: et sted at pege hen fra menuen, fra annoncer og fra en
// mail, når nogen spørger "hvorfor jer og ikke en portal". `follow: true`, så
// linkene herfra stadig tæller — det er kun indekseringen vi siger nej til.
//
// Vil vi senere have organisk trafik direkte herpå, kræver det at siden får sit
// EGET indhold og sit eget søgeord. Ikke bare at flaget vendes.
// ============================================================================
export const metadata = {
  title: "Hvorfor Birdly? | Birdly",
  description:
    "Brug tiden på arbejdet, ikke på at finde det. Se forskellen på selv at lede efter opgaver og at få dem sendt, når de passer.",
  robots: { index: false, follow: true },
};

export default async function Page({ searchParams }) {
  const sp = (await searchParams) || {};
  const funnelHref = medQuery("/kom-i-gang", sp);

  return (
    <div className="sg">
      <SalgHeader funnelHref={funnelHref} />

      <section className="sg-hero">
        <div className="sg-wrap sg-midt">
          <span className="sg-pill">Hvorfor Birdly</span>
          <h1>Brug tiden på arbejdet.<br /><span className="sg-em">Ikke på at finde det.</span></h1>
          <p className="sg-lead">{EJER_LINJE}</p>
        </div>
      </section>

      {/* ⚠️ SAMMENLIGNINGEN HANDLER OM TID, RELEVANS OG ENKELHED — ikke om
          features. En feature-tabel ville invitere til at blive slået på antal
          felter; det her handler om hvad man slipper for. */}
      <Problemet />
      <IkkePortal />
      <RisikoFjernet funnelHref={funnelHref} />
      <SalgFaq funnelHref={funnelHref} />
      <SlutCta funnelHref={funnelHref} />

      <Footer />
    </div>
  );
}
