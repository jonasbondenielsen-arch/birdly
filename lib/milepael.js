"use client";

import { sporEvent } from "./ctaSporing";

// ============================================================================
// MILEPÆLE PÅ SKÆRM 1 (23-09-2026) — "så hun aldrig feltet, eller så hun det
// og lod være?"
//
// ⚠️ MÅLT HUL, IKKE EN IDÉ. Funnel-auditten fandt ét dominerende tab: 23
// besøgende startede på skærm 1, seks nåede skærm 2. Vi kunne se HVOR de faldt
// fra, men ikke om de overhovedet nåede at få CVR-feltet på skærmen — på mobil
// lå det ~700-800 px nede med et cookiebanner over de nederste ~28 %. Uden det
// her er valget mellem "flyt feltet op" og "skriv en anden overskrift" et gæt.
//
// ⚠️ INTERSECTIONOBSERVER, IKKE EN SCROLL-LYTTER. En scroll-hændelse fyrer
// dusinvis af gange i sekundet; her fyrer hver milepæl PRÆCIS ÉN GANG og
// observatøren kobler sig selv af bagefter. Det er forskellen på at måle en
// tilstand og at aflevere en positionsstrøm — og en positionsstrøm ville
// desuden være et fingeraftryk.
//
// ⚠️ INGEN NY SAMTYKKEGATE. `sporEvent` gater allerede på statistik og lægger
// hændelsen i køen indtil kunden har taget stilling (lib/ctaSporing.js). Lagde
// vi en gate her, ville den kunne komme ud af trit med den rigtige.
//
// ⚠️ VIEWPORT-HØJDEN SENDES I SPAND, ALDRIG PRÆCIST. 812 px er et
// fingeraftryk; "800+" besvarer spørgsmålet "kunne feltet overhovedet være på
// skærmen". Samme princip som `udledKontekst` i Edge Function'en, der læser
// user-agent én gang og kaster den væk.
// ============================================================================

/** Grove spand. Grænserne ligger hvor telefonerne faktisk ligger. */
function viewportSpand() {
  const h = typeof window !== "undefined" ? window.innerHeight : 0;
  if (!h) return "ukendt";
  if (h < 600) return "<600";
  if (h < 700) return "600-699";
  if (h < 800) return "700-799";
  return "800+";
}

const sendt = new Set();

/**
 * Meld en milepæl. Anden og senere gang er et no-op.
 *
 * ⚠️ MODULETS EGEN HUKOMMELSE, IKKE storage. Milepælene hører til ÉT
 * sidebesøg: kommer hun tilbage i morgen, er det en ny chance for at se feltet,
 * og den skal tælles. En nøgle i localStorage ville gøre den anden visning
 * usynlig.
 */
export function milepael(navn) {
  try {
    if (typeof window === "undefined" || sendt.has(navn)) return;
    sendt.add(navn);
    sporEvent("viewport_milestone", navn, { variant: viewportSpand() });
  } catch { /* måling må aldrig vælte siden */ }
}

/**
 * Meld `navn` når `el` bliver synlig — og kobl så af.
 *
 * @returns {() => void} oprydning, til Reacts effekt
 *
 * ⚠️ 50 % SYNLIGT, IKKE ÉN PIXEL. En enkelt pixel i bunden af skærmen betyder
 * ikke at kunden har SET elementet. Halvdelen inde er den tærskel der svarer
 * til "den er på skærmen".
 *
 * ⚠️ FINDES IntersectionObserver IKKE, MÅLES DER INGENTING — og siden virker
 * præcis som før. En reservemåling med scroll-lyttere ville genindføre
 * nøjagtig den støj vi undgår.
 */
export function naarSynlig(el, navn) {
  try {
    if (!el || typeof IntersectionObserver === "undefined") return () => {};
    const io = new IntersectionObserver((poster) => {
      for (const p of poster) {
        if (!p.isIntersecting) continue;
        milepael(navn);
        io.disconnect();
        return;
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  } catch {
    return () => {};
  }
}
