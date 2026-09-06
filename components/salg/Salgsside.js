import Footer from "../Footer";
import SalgHeader from "./SalgHeader";
import FagBevis from "./FagBevis";
import {
  Hero, BevisBjaelke, RisikoFjernet, Problemet, Motoren, SmsDemo,
  Vaerdi, Kundebevis, IkkePortal, Priser, SlutCta, SalgFaq, EfterspoergselsLink,
} from "./Sektioner";
import { getBrancheByFagKey } from "../../lib/branche";
import "../../app/salg.css";

// ============================================================================
// SALGSSIDEN — /kom-i-gang. Funnelens indgang og Meta-annoncernes landingsside.
//
//   annonce / husets CTA / de 36 fag-sider  →  DENNE side  →  /start  →  betaling
//
// ⚠️ DEN ER IKKE HUSETS FORSIDE. Roden (`/`) er SEO-siden og bærer alle tolv
// FAQ-svar, FAQPage-schemaet og forklaringslaget. Denne er noindex og fri til at
// blive optimeret rent på konvertering — men copy'en er DEN SAMME, fordi begge
// sider bruger sektionerne i components/salg/Sektioner.js. To sæt tekst ville
// betyde at en besøgende fra Google og en fra Facebook fik hvert sit løfte.
//
// RÆKKEFØLGEN (06-09-2026):
//   RESULTAT → PROBLEM → BEVIS → MOTOR → ØKONOMISK VÆRDI → RISIKO → TILBUD → CTA
//   1 hero · 2 bevis-bjælke · 3 problem · 4 fag-bevis · 5 motor · 6 sms
//   7 værdi · 8 kundebevis (renderer sig væk) · 9 ikke-portal · 10 risiko
//   11 priser · 12 slut-CTA · 13 FAQ
//
// ⚠️ RISIKOEN LIGGER LIGE FØR PRISEN, ikke øverst. Den er svaret på den
// indvending der opstår i det øjeblik et beløb bliver nævnt — står den før
// kunden overhovedet ved hvad tingen koster, besvarer den et spørgsmål hun
// ikke har stillet endnu, og så fylder den bare.
//
// ⚠️ CTA-KADENCEN ER BEVIDST. Knappen står efter hero, fag-bevis, motor, værdi,
// risiko, priser, slut og FAQ — altid dér hvor et argument lige er landet.
// IKKE en knap hver 100 px: en CTA uden et argument foran sig er støj, og støj
// lærer øjet at springe knappen over.
// ============================================================================
export default function Salgsside({ tal, funnelHref, fag = null }) {
  // ---------------------------------------------------------------------
  // MESSAGE-MATCH. Kommer en besøgende fra en rengørings-annonce
  // (?fag=rengoring), skal overskriften tale om rengøring — ellers bruger hun
  // det første sekund på at afgøre om hun er landet det rigtige sted.
  //
  // ⚠️ INGEN CLOAKING. Det er den SAMME side med den samme pris, det samme
  // produkt og de samme betingelser; kun ét ord i overskriften og én linje
  // undertekst skifter. Er faget ukendt, står den generiske version — vi
  // opfinder ALDRIG et fagnavn ud af en parameter, for så ville en tilfældig
  // streng i adressen kunne skrive vores overskrift.
  //
  // ⚠️ Opslaget sker på fagKey, ikke slug. Det er fagKey annoncerne og
  // fag-siderne fører videre (?fag=tomrer, ikke ?fag=toemrer).
  // ---------------------------------------------------------------------
  const b = fag ? getBrancheByFagKey(String(fag)) : null;
  // ⚠️ KUN EN VALIDERET NØGLE. Er faget ukendt, falder værdi-ankeret tilbage på
  // rengøring (den nuværende primære målgruppe) frem for at bruge en rå streng
  // fra adresselinjen til at vælge regnestykke.
  const fagNoegle = b ? b.fagKey : "rengoring";
  const overskrift = b ? <>Få flere opgaver til {b.nounPlural}.</> : null;
  // ⚠️ nounPlural, IKKE `arbejde`. Feltet `arbejde` er sat sammen til brødtekst
  // ("tømrer- og snedkerarbejde") og bliver kluntet i en kort sætning. nounPlural
  // er skrevet til netop den her slags overskrift og læser naturligt for alle 20
  // fag: "til tømrere", "til rengøringsfirmaer", "til vognmænd".
  const under = b
    ? `Birdly finder offentlige og private opgaver til ${b.nounPlural} — og sender nye match direkte på SMS og mail.`
    : null;

  return (
    <div className="sg">
      <SalgHeader funnelHref={funnelHref} />

      <Hero funnelHref={funnelHref} overskrift={overskrift} under={under} />
      <BevisBjaelke tal={tal} />
      <Problemet />
      {/* ⚠️ BEVISET LIGGER FØR MOTOREN. Rækkefølgen er RESULTAT → PROBLEM →
          BEVIS → MOTOR → VÆRDI → RISIKO → TILBUD → CTA: den besøgende skal se AT
          der findes opgaver til hendes fag, før hun får forklaret HVORDAN vi
          finder dem. Omvendt rækkefølge beder hende tro på en mekanik hun endnu
          ikke har nogen grund til at interessere sig for.
          Klient-komponent: den kalder preview-kandidater. */}
      <FagBevis funnelHref={funnelHref} />
      <Motoren funnelHref={funnelHref} />
      <SmsDemo />
      {/* Værdi-ankeret bruger rengørings-eksemplet som standard — det er den
          nuværende primære målgruppe. Kommer den besøgende fra en anden
          fag-annonce, følger ankeret med. */}
      <Vaerdi funnelHref={funnelHref} fag={fagNoegle} />
      <Kundebevis />
      <IkkePortal />
      <RisikoFjernet funnelHref={funnelHref} />
      <Priser funnelHref={funnelHref} />
      <SlutCta funnelHref={funnelHref} />
      <SalgFaq funnelHref={funnelHref} />
      <EfterspoergselsLink />

      <Footer />
    </div>
  );
}
