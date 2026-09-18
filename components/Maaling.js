"use client";

import { useEffect } from "react";
import { fangAttribution } from "../lib/attribution";
import { indlaesPixel, fjernPixel } from "../lib/pixel";
import { maa } from "../lib/samtykke";
import { sporEvent } from "../lib/ctaSporing";
import { ryddAnonId } from "../lib/anonId";

// Bindeleddet mellem samtykket og målingen. Ligger i layoutet, så attributionen fanges
// uanset hvilken side annoncen peger på — kampagner lander lige så ofte på /fag/toemrer
// som på forsiden.
//
// Attributionen fanges ved landing (UTM'er er ikke persondata), mens pixel'en først
// indlæses når marketing-samtykket er givet. Derfor to forskellige betingelser i samme
// komponent — ikke en forglemmelse.
export default function Maaling() {
  useEffect(() => {
    // ⚠️ ÉN GANG PR. BESØG, IKKE PR. SIDESKIFT. Layoutet monteres én gang ved
    // fuld indlæsning og overlever klient-navigation — og det er præcis det
    // "landing" betyder: den side annoncen bar hende ind på. Et event pr.
    // sideskift ville gøre tragtens øverste tal til sidevisninger.
    let landingSendt = false;

    const kør = () => {
      fangAttribution(); // fanger også fbclid, men kun hvis samtykket nu tillader det
      if (maa("marketing")) indlaesPixel();
      else fjernPixel();

      // ⚠️ EFTER fangAttribution(), ikke før: landingen skal bære den kampagne
      // der lige er læst ud af adresselinjen. Omvendt rækkefølge ville give
      // første hændelse i besøget en tom attribution — og det er netop den
      // hændelse hele kampagnemålingen hænger på.
      if (maa("statistik")) {
        if (!landingSendt) { sporEvent("landing_page_view"); landingSendt = true; }
      } else {
        // ⚠️ TRÆKKES SAMTYKKET TILBAGE, SKAL ID'ET VÆK. Ellers ville et id fra
        // før tilbagetrækningen ligge og vente på næste gang samtykket gives, og
        // de to perioder ville blive knyttet sammen til én person.
        ryddAnonId();
      }
    };
    kør();
    // Samme hændelse som banneret udsender — så pixel'en tændes i samme øjeblik kunden
    // trykker "Accepter alle", uden en genindlæsning.
    window.addEventListener("birdly-samtykke", kør);
    return () => window.removeEventListener("birdly-samtykke", kør);
  }, []);

  return null;
}
