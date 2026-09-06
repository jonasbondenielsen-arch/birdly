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
// RÆKKEFØLGEN (Hyros-logikken, aftalt 06-09-2026):
//   1 hero · 2 bevis · 3 risiko · 4 problem · 5 motor · 6 fag-bevis · 7 sms
//   8 værdi · 9 kundebevis (renderer sig væk) · 10 ikke-portal · 11 priser
//   12 slut-CTA · 13 FAQ
//
// ⚠️ CTA-KADENCEN ER BEVIDST. Knappen står efter hero, risiko, motor, fag-bevis,
// værdi, priser, slut og FAQ — otte gange, altid dér hvor et argument lige er
// landet. IKKE en knap hver 100 px: en CTA uden et argument foran sig er støj,
// og støj lærer øjet at springe knappen over.
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
      <RisikoFjernet funnelHref={funnelHref} />
      <Problemet />
      <Motoren funnelHref={funnelHref} />
      {/* ⚠️ Klient-komponent: den kalder preview-kandidater ved klik. Alt andet
          på siden er server-renderet, så det er den eneste JavaScript der
          hentes ud over CTA-sporingen. */}
      <FagBevis funnelHref={funnelHref} seneste={tal?.seneste || []} />
      <SmsDemo />
      <Vaerdi funnelHref={funnelHref} />
      <Kundebevis />
      <IkkePortal />
      <Priser funnelHref={funnelHref} />
      <SlutCta funnelHref={funnelHref} />
      <SalgFaq funnelHref={funnelHref} />
      <EfterspoergselsLink />

      <Footer />
    </div>
  );
}
