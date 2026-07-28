"use client";

import { useEffect } from "react";
import { fangAttribution } from "../lib/attribution";
import { indlaesPixel, fjernPixel } from "../lib/pixel";
import { maa } from "../lib/samtykke";

// Bindeleddet mellem samtykket og målingen. Ligger i layoutet, så attributionen fanges
// uanset hvilken side annoncen peger på — kampagner lander lige så ofte på /fag/toemrer
// som på forsiden.
//
// Attributionen fanges ved landing (UTM'er er ikke persondata), mens pixel'en først
// indlæses når marketing-samtykket er givet. Derfor to forskellige betingelser i samme
// komponent — ikke en forglemmelse.
export default function Maaling() {
  useEffect(() => {
    const kør = () => {
      fangAttribution(); // fanger også fbclid, men kun hvis samtykket nu tillader det
      if (maa("marketing")) indlaesPixel();
      else fjernPixel();
    };
    kør();
    // Samme hændelse som banneret udsender — så pixel'en tændes i samme øjeblik kunden
    // trykker "Accepter alle", uden en genindlæsning.
    window.addEventListener("birdly-samtykke", kør);
    return () => window.removeEventListener("birdly-samtykke", kør);
  }, []);

  return null;
}
