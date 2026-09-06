import Footer from "../../components/Footer";
import SalgHeader from "../../components/salg/SalgHeader";
import FagBevis from "../../components/salg/FagBevis";
import { Motoren, SmsDemo, RisikoFjernet, SlutCta, SalgFaq, BevisBjaelke } from "../../components/salg/Sektioner";
import { hentOpgaveTal } from "../../lib/opgaveTal";
import { medQuery } from "../../lib/funnelLink";
import "../salg.css";

// ============================================================================
// /sadan-virker-det — STØTTESIDE, NOINDEX (06-09-2026, godkendt af Jonas).
//
// Samme begrundelse som /hvorfor-birdly: indholdet svarer til rodens eget
// "Fra besvær til besked"-afsnit, og to indekserede sider om hvordan Birdly
// virker ville konkurrere om de samme ord. `follow: true`.
//
// ⚠️ DEN ER MÅLET FOR DEN SEKUNDÆRE CTA. "Se hvordan det virker" står ved siden
// af den primære knap i hero'en — og en sekundær CTA skal føre til en
// FORKLARING, ikke til et anker længere nede på samme side. Et anker føles som
// om knappen ikke virkede.
// ============================================================================
export const metadata = {
  title: "Sådan virker Birdly | Birdly",
  description:
    "Fra ny opgave til din telefon: du vælger fag og område én gang, Birdly holder øje, og du får besked på SMS og mail når noget passer.",
  robots: { index: false, follow: true },
};

export default async function Page({ searchParams }) {
  const sp = (await searchParams) || {};
  const funnelHref = medQuery("/kom-i-gang", sp);
  const tal = await hentOpgaveTal();

  return (
    <div className="sg">
      <SalgHeader funnelHref={funnelHref} />

      <section className="sg-hero">
        <div className="sg-wrap sg-midt">
          <span className="sg-pill">Sådan virker det</span>
          <h1>Fra ny opgave<br /><span className="sg-em">til din telefon.</span></h1>
          <p className="sg-lead">
            En opgave dukker op. Birdly matcher den mod jeres kriterier. Passer den, får I
            en besked. I vurderer selv, om den er interessant.
          </p>
        </div>
      </section>

      <Motoren funnelHref={funnelHref} />
      <SmsDemo />
      {/* Beviset hører til her: efter forklaringen af motoren, hvor spørgsmålet
          "ja, men finder den så noget til MIT fag?" står stærkest. */}
      <FagBevis funnelHref={funnelHref} seneste={tal?.seneste || []} />
      <BevisBjaelke tal={tal} />
      <RisikoFjernet funnelHref={funnelHref} />
      <SalgFaq funnelHref={funnelHref} />
      <SlutCta funnelHref={funnelHref} />

      <Footer />
    </div>
  );
}
