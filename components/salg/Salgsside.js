import Footer from "../Footer";
import SalgHeader from "./SalgHeader";
import FagBevis from "./FagBevis";
import StickyCtaMobil from "./StickyCtaMobil";
import { FagProvider } from "./FagKontekst";
import { Vaerdi } from "./VaerdiSektion";
import {
  Hero, BevisBjaelke, RisikoFjernet, Problemet, ProblemPris, Loesningen,
  Motoren, SmsDemo, FagVaelgerKort, Kundebevis, IkkePortal, Priser,
  SlutCta, SalgFaq, EfterspoergselsLink,
} from "./Sektioner";
import { getBrancheByFagKey } from "../../lib/branche";
import "../../app/salg.css";

// ============================================================================
// SALGSSIDEN — /kom-i-gang. Funnelens indgang og Meta-annoncernes landingsside.
//
//   annonce / husets CTA / de 36 fag-sider  →  DENNE side  →  /start  →  betaling
//
// ⚠️ DEN ER IKKE HUSETS FORSIDE. Roden (`/`) er SEO-siden og bærer alle
// FAQ-svarene, FAQPage-schemaet og forklaringslaget. Denne er noindex og fri til
// at blive optimeret rent på konvertering — men copy'en er DEN SAMME, fordi
// begge sider bruger sektionerne i components/salg/. To sæt tekst ville betyde
// at en besøgende fra Google og en fra Facebook fik hvert sit løfte.
//
// ══════════════════════════════════════════════════════════════════════════
// RÆKKEFØLGEN — den psykologiske arkitektur, ikke en indholdsfortegnelse:
//
//   1  RESULTAT              hero
//   2  LEVENDE BEVIS         bevis-bjælke (ægte tal)
//   3  RISIKO FJERNET        14 dage gratis + matchgaranti
//   4  PROBLEMET             tre nøgterne kort
//   5  HVAD DET KAN KOSTE    mærket eksempel på en aftales årsværdi
//   6  LØSNINGEN             "Birdly leder. I får besked."
//   7  ÆGTE OPGAVE-BEVIS     fag-faner med rigtige tal og opgaver
//   8  SÅDAN VIRKER DET      tre trin + én resultat-linje
//   9  PRODUKT-BEVIS         SMS'en
//  10  FAG-VÆLGER            hvert fag skal kunne se sig selv
//  11  ØKONOMISK VÆRDI       sammenligningen, ved beslutningen
//  12  FORSKELLEN            "Endnu en portal? Nej tak."
//  13  PRISER                året som hovedtilbud
//  14  RESULTAT IGEN         navy afslutning
//  15  FAQ                   seks synlige
//
// ⚠️ RISIKOEN LIGGER TIDLIGT (3), OG DET ER MED VILJE. Kold trafik fra Meta har
// ikke besluttet sig for at læse videre; "14 dage gratis, 0 kr. i dag" fjerner
// grunden til at lukke fanen, før argumentet overhovedet er begyndt. Den står
// også ved prisen, hvor den besvarer en anden indvending.
//
// ⚠️ 5 OG 11 ER IKKE DEN SAMME SEKTION. 5 er en OMKOSTNING ("den opgave I ikke
// ser") og nævner ikke prisen; 11 er SAMMENLIGNINGEN med abonnementet og står
// dér hvor kunden er ved at tage stilling. Slås de sammen, mister man enten
// problemets tyngde eller prisens kontekst.
//
// ⚠️ CTA-KADENCEN. Knappen står efter hero, risiko, løsning, bevis, motor,
// værdi, priser, slut og FAQ — altid lige efter et argument er landet. IKKE en
// knap hver 100 px: en CTA uden et argument foran sig er støj, og støj lærer
// øjet at springe knappen over.
// ══════════════════════════════════════════════════════════════════════════
export default function Salgsside({ tal, funnelHref, fag = null }) {
  // ---------------------------------------------------------------------
  // MESSAGE-MATCH. Kommer en besøgende fra en rengørings-annonce
  // (?fag=rengoring), skal overskriften, beviset, SMS-eksemplet og regnestykket
  // alle tale om rengøring — ellers bruger hun det første sekund på at oversætte
  // en generisk side til sin egen situation.
  //
  // ⚠️ INGEN CLOAKING. Det er den SAMME side med den samme pris, det samme
  // produkt og de samme betingelser; kun overskriften, det forvalgte fag og
  // regne-eksemplet skifter. Er faget ukendt, står den generiske version — vi
  // opfinder ALDRIG et fagnavn ud af en parameter, for så ville en tilfældig
  // streng i adressen kunne skrive vores overskrift.
  //
  // ⚠️ Opslaget sker på fagKey, ikke slug. Det er fagKey annoncerne og
  // fag-siderne fører videre (?fag=tomrer, ikke ?fag=toemrer).
  // ---------------------------------------------------------------------
  const b = fag ? getBrancheByFagKey(String(fag)) : null;
  // Ukendt fag ⇒ rengøring, som er den nuværende primære målgruppe.
  const fagNoegle = b ? b.fagKey : "rengoring";

  // ══════════════════════════════════════════════════════════════════════════
  // OVERSKRIFTEN FØLGER ANNONCEN, IKKE OMVENDT.
  //
  //   ingen ?fag=        → "Få flere rengørings- og serviceopgaver."
  //   ?fag=rengoring     → "Få flere rengøringsopgaver."
  //   ?fag=service       → "Få flere serviceopgaver."
  //   ?fag=<andet fag>   → "Få flere opgaver til <fagets folk>."
  //
  // ⚠️ HVORFOR RENGØRING OG SERVICE HAR HVER SIN. Den generiske overskrift
  // nævner dem begge, og en rengøringsejer der kommer fra en annonce om
  // rengøring skal ikke selv skulle plukke sit eget ord ud af en opremsning.
  // De øvrige 18 fag falder tilbage på nounPlural, som læser naturligt for
  // dem alle ("til tømrere", "til vognmænd").
  //
  // ⚠️ INGEN CLOAKING. Samme side, samme pris, samme produkt, samme
  // betingelser — kun overskriften, det forvalgte fag og regne-eksemplet
  // skifter. Er faget ukendt, står den generiske version.
  // ══════════════════════════════════════════════════════════════════════════
  const SAERLIGE = {
    rengoring: {
      h1: <>Få flere rengøringsopgaver.</>,
      under: "Birdly finder offentlige og private rengøringsopgaver, der passer til jeres virksomhed — og sender nye match direkte på SMS og mail.",
      chips: ["Erhvervsrengøring", "Vinduespolering", "Trappevask", "Fast rengøring"],
      eyebrow: "For rengøringsvirksomheder",
    },
    service: {
      h1: <>Få flere serviceopgaver.</>,
      under: "Birdly finder offentlige og private serviceopgaver, der passer til jeres virksomhed — og sender nye match direkte på SMS og mail.",
      chips: ["Ejendomsservice", "Vedligehold", "Serviceaftaler", "Drift og tilsyn"],
      eyebrow: "For servicevirksomheder",
    },
  };
  const saerlig = b ? SAERLIGE[b.fagKey] : null;

  const overskrift = saerlig ? saerlig.h1 : b ? <>Få flere opgaver til {b.nounPlural}.</> : null;
  // ⚠️ nounPlural, IKKE `arbejde`. Feltet `arbejde` er sat sammen til brødtekst
  // ("tømrer- og snedkerarbejde") og bliver kluntet i en kort sætning.
  const under = saerlig
    ? saerlig.under
    : b
      ? `Birdly finder offentlige og private opgaver til ${b.nounPlural} — og sender dem direkte på SMS og mail.`
      : null;
  const eyebrow = saerlig ? saerlig.eyebrow : b ? `For ${b.nounPlural}` : undefined;
  // ⚠️ CHIPS KUN HVOR DE ER SANDE. De fem standard-chips er rengørings- og
  // serviceområder; på en tømrer- eller VVS-hero ville de være ord fra en anden
  // branche, og så gør de det modsatte af at skabe genkendelse. Derfor: eget sæt
  // til rengøring og service, ingen chips til de øvrige fag.
  const chips = saerlig ? saerlig.chips : b ? [] : undefined;

  return (
    // Provideren deler det valgte fag mellem bevis-fanerne (7) og
    // værdi-ankeret (11). Alt derimellem forbliver server-renderet.
    <FagProvider start={fagNoegle}>
      <div className="sg">
        <SalgHeader funnelHref={funnelHref} />

        <Hero funnelHref={funnelHref} overskrift={overskrift} under={under} eyebrow={eyebrow} chips={chips} />
        <BevisBjaelke tal={tal} />
        <RisikoFjernet funnelHref={funnelHref} />
        <Problemet />
        <ProblemPris fag={fagNoegle} />
        <Loesningen funnelHref={funnelHref} />
        <FagBevis funnelHref={funnelHref} />
        <Motoren funnelHref={funnelHref} />
        <SmsDemo fag={fagNoegle} />
        <FagVaelgerKort />
        <Vaerdi funnelHref={funnelHref} />
        <Kundebevis />
        <IkkePortal />
        <Priser funnelHref={funnelHref} />
        <SlutCta funnelHref={funnelHref} />
        <SalgFaq funnelHref={funnelHref} />
        <EfterspoergselsLink />

        <Footer />
        <StickyCtaMobil funnelHref={funnelHref} />
      </div>
    </FagProvider>
  );
}
