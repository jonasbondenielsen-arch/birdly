"use client";

import { nulstilSamtykke } from "../lib/samtykke";

// "Skift dit valg" i footeren. Egen lille klient-komponent, så Footer selv kan blive
// ved med at være en server-komponent — det er kun dette ene klik der har brug for
// browseren.
//
// Et samtykke der ikke kan trækkes tilbage lige så let som det blev givet, er ikke
// gyldigt (ePrivacy/GDPR). Derfor står linket permanent i footeren og ikke gemt inde
// i en politik-tekst: nulstillingen rydder Metas cookies OG viser banneret igen, så
// brugeren reelt kan fortryde — ikke bare få at vide at hun kunne have valgt anderledes.
export default function SamtykkeLink() {
  return (
    <button type="button" className="fsamtykke" onClick={() => nulstilSamtykke()}>
      Skift dit cookievalg
    </button>
  );
}
