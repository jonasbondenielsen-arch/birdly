"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { sporCta } from "../../lib/ctaSporing";
import { CTA } from "../../lib/salgTekst";

// ============================================================================
// STICKY CTA — kun mobil, kun efter hero'en er scrollet forbi.
//
// ⚠️ HVORFOR KUN MOBIL. På desktop står header-knappen altid synlig øverst;
// en ekstra fast bjælke ville være den samme handling to gange på samme skærm.
// På en telefon forsvinder headeren derimod op af skærmen, og så er der
// ingenting at trykke på før næste sektions CTA.
//
// ⚠️ HVORFOR IKKE FRA TOPPEN. Vises den over hero'en, dækker den præcis den
// knap den skulle erstatte — og en besøgende der lige er landet, har endnu ikke
// fået en grund til at trykke. Den kommer først når hero'en er passeret.
//
// ⚠️ ÉN HANDLING, IKKE FEM. Primær knap plus ét diskret link til prisen. En
// bjælke med flere valg er en menu, ikke en CTA, og den stjæler klik fra sig selv.
//
// ⚠️ DEN MÅ IKKE DÆKKE NOGET. Sektionerne får ekstra bundpadding via
// `body.har-sticky` i salg.css, så sidste linje aldrig gemmer sig bag bjælken.
// Samtykke-banneret ligger på z-index 90; denne er 70 og skubbes op af den
// højde banneret selv melder ud (--samtykke-h). Vi gætter ikke på højden.
// ============================================================================
export default function StickyCtaMobil({ funnelHref }) {
  const [vis, setVis] = useState(false);

  useEffect(() => {
    // Tærsklen er én skærmhøjde: dét er hero'en på stort set alle telefoner, og
    // den følger enheden frem for et hårdkodet pixeltal.
    const graense = () => Math.max(320, window.innerHeight * 0.85);
    let sidst = false;

    const paaScroll = () => {
      const nu = window.scrollY > graense();
      // Sæt kun state når værdien FAKTISK skifter. Uden det her ville hver
      // eneste scroll-hændelse udløse en render på en telefon.
      if (nu !== sidst) {
        sidst = nu;
        setVis(nu);
      }
    };

    paaScroll();
    window.addEventListener("scroll", paaScroll, { passive: true });
    document.body.classList.add("har-sticky");
    return () => {
      window.removeEventListener("scroll", paaScroll);
      document.body.classList.remove("har-sticky");
    };
  }, []);

  return (
    <div className={"sg-sticky" + (vis ? " vis" : "")} aria-hidden={!vis}>
      <Link
        href={funnelHref}
        className="sg-btn sg-btn-teal"
        tabIndex={vis ? 0 : -1}
        onClick={() => sporCta("sticky-mobil", funnelHref)}
      >
        {CTA.primaer} <span aria-hidden="true">→</span>
      </Link>
      <a href="#priser" className="sg-sticky-pris" tabIndex={vis ? 0 : -1}>Pris</a>
    </div>
  );
}
