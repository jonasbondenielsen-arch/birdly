import Footer from "../Footer";
import FooterUk from "../uk/FooterUk";
import SalgHeader from "./SalgHeader";
import FagBevis from "./FagBevis";
import StickyCtaMobil from "./StickyCtaMobil";
import { FagProvider } from "./FagKontekst";
import { Vaerdi } from "./VaerdiSektion";
import {
  Hero, BevisBjaelke, RisikoFjernet, RigtigeOpgaver, OffentligeOpgaver,
  Overgang, Problemet, ProblemPris, Loesningen,
  Motoren, SmsDemo, FagVaelgerKort, Kundebevis, IkkePortal, Priser,
  SlutCta, SalgFaq, EfterspoergselsLink,
} from "./Sektioner";
import { tekster, t } from "../../lib/tekster";
import { MARKEDER } from "../../lib/markets";
import { getBrancheByFagKey } from "../../lib/branche";
import { ukSti } from "../../lib/uk/jura";
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
export default function Salgsside({ tal, funnelHref, fag = null, marked = "DK" }) {
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
  // ⚠️ MESSAGE-MATCH ER DK-ONLY INDTIL VIDERE. `getBrancheByFagKey` slaar op i
  // DK's brancheliste, og GB er cleaning-only uden ?fag=-trafik. Uden det her
  // ville en britisk besoegende med ?fag=tomrer faa en DANSK overskrift.
  const b = fag && marked === "DK" ? getBrancheByFagKey(String(fag)) : null;
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

  // ══════════════════════════════════════════════════════════════════════
  // ORDBOGSOPSLAGET SKER HER. HVER GANG.
  //
  // ⚠️ INGEN SEKTION SLÅR SELV OP. components/Forside.js er "use client" og
  // importerer 17 sektioner fra Sektioner.js — læste de ordbogen, fulgte
  // både den danske og den engelske med ned i den DANSKE forsides
  // klient-bundt. Det var det der flyttede forsidens RSC-rækker 09-09-2026,
  // og det er derfor reglen nu er absolut: ordbogen læses på serveren, og
  // sektionen får en færdig `ord`.
  //
  // ⚠️ DK FÅR INGEN `ord`-PROP OVERHOVEDET. Ikke `ord={null}` — en prop på en
  // klient-komponent serialiseres uanset værdi, og `"ord":null` i strømmen
  // er en ændring af DK. Derfor `{...(ord ? { ord } : null)}` hver gang.
  //
  // ⚠️ ET ANDET MARKED FALDER ALDRIG TILBAGE TIL DANSK. Mangler en nøgle, er
  // værdien undefined, og sektionen udelader afsnittet — aldrig en dansk
  // sætning på en britisk side.
  // ══════════════════════════════════════════════════════════════════════
  const O = marked === "DK" ? null : tekster(marked);
  const cta = O?.cta?.primaer;

  // Markedets pris — REGNET, ikke skrevet, og aldrig kurs-konverteret.
  // £59/£590 er Jonas' beslutning, ikke 499 kr. omregnet (lib/markets.js).
  const pris = (() => {
    const pr = O ? MARKEDER[marked]?.pris : null;
    if (!pr) return null;
    const sym = MARKEDER[marked].valutaSymbol;
    return {
      aar: `${sym}${pr.aar}/year`,
      maaned: `${sym}${pr.maaned}/month`,
      // Regnet: 590/12 = 49,17 → "around £49/month".
      prMaaned: `${sym}${Math.round(pr.aar / 12)}/month`,
      spar: `${sym}${pr.maaned * 12 - pr.aar}`,
      // Betal for N måneder, få 12. 590/59 = 10 præcis.
      maanederBetalt: Math.round(pr.aar / pr.maaned),
      proeveDage: pr.proeveDage,
    };
  })();

  // Hver sektions egen pakke. Nøglerne er dem sektionen faktisk læser —
  // står der en her, sektionen ikke bruger, er den død vægt i strømmen.
  const ord = O && {
    hero: { ...O.hero, trust: O.trust, ctaPrimaer: cta, ctaSekundaer: O.cta?.sekundaer, telefon: O.telefon },
    bevis: O.bevis,
    vaerdi: { ...O.vaerdi, ctaPrimaer: cta },
    offentlige: { ...O.offentlige, ctaPrimaer: cta },
    risiko: { ...O.risiko, ctaPrimaer: cta },
    problemet: O.problemet,
    koster: O.koster,
    loesningen: { ...O.loesningen, ctaPrimaer: cta },
    motoren: { ...O.motoren, ctaPrimaer: cta },
    sms: { ...O.sms, telefon: O.telefon },
    portal: O.portal,
    overgang: { ...O.overgang, ctaPrimaer: cta },
    // ⚠️ PRISER LÅNER FRA RISIKO, OG NØGLERNE ER OMDØBT MED VILJE.
    // `priser.overskrift` er sektionens egen; garantiens hedder noget andet,
    // ellers ville den ene stille overskrive den anden. Samme med
    // `ingenBinding`, som findes begge steder med hver sin betydning.
    priser: {
      ...O.priser,
      pris,
      proeveDage: O.risiko?.proeveDage,
      trust3: O.trust?.[2],
      risikoIngenBinding: O.risiko?.punkter?.[0],
      garantiOverskrift: O.risiko?.overskrift,
      garantiPraecis: O.risiko?.garantiPraecis,
      garantiForbehold: O.risiko?.garantiForbehold,
      garantiLink: O.risiko?.garantiLink,
    },
    slut: { ...O.slut, trust: O.trust, ctaPrimaer: cta },
    faq: O.faq && { ...O.faq, ctaPrimaer: cta },
    nav: O.nav,
    // Footeren faar linkene fra nav-blokken: det er de SAMME fire ankre, og to
    // lister ville kunne skride fra hinanden.
    footer: O.footer && {
      ...O.footer,
      punkter: O.nav?.punkter || [],
      // Hub'ens PUBLIKE adresse. Internt hedder den /uk/terms, men proxy'en
      // rewriter getbirdly.co.uk/terms dertil - kunden ser aldrig /uk.
      juraHref: ukSti("/terms"),
      // Note 11: synlig "Report a problem"-vej for private opgaver.
      rapporterHref: ukSti("/report-a-problem"),
      rapporter: O.jura?.rapporter,
      cookieValg: O.jura?.cookieValg,
      cookieHref: ukSti("/cookie-policy"),
    },
  };

  // ⚠️ SAMLET HÉR, IKKE INDE I KOMPONENTEN. Vaerdi er klient-kode; alt hvad
  // den skal bruge fra ordbogen, slås op på serveren og sendes med som data.
  // DK får `null` og dermed præcis de props sektionen havde før ordbogen fandtes.
  const vaerdiOrd =
    marked === "DK"
      ? null
      : {
          kick: O?.regnestykket?.kick,
          lead: O?.regnestykket?.lead,
          vindOver: O?.vaerdi?.vindOver || "",
          vindUnder1: O?.vaerdi?.vindUnder1 || "",
          vindUnder2: O?.vaerdi?.vindUnder2 || "",
          cta,
        };

  return (
    // Provideren deler det valgte fag mellem bevis-fanerne (7) og
    // værdi-ankeret (11). Alt derimellem forbliver server-renderet.
    <FagProvider start={fagNoegle}>
      {/* ⚠️ `lang={undefined}` ER IKKE DET SAMME SOM INGEN `lang`.
          En prop med værdien undefined bliver stadig skrevet ind i
          RSC-strømmen — som "lang":"$undefined" — hvor baseline slet ikke har
          attributten. /kom-i-gang flyttede sig på præcis det, målt 09-09-2026.
          Spreder vi null, findes prop'en ikke. Samme greb som ctaTekst(). */}
      <div className="sg" {...(marked === "DK" ? null : { lang: "en-GB" })}>
        {/* Headeren slår ikke selv op i ordbogen — se noten i SalgHeader.js.
            DK sender ingen tekst og får husets egen CTA. */}
        <SalgHeader
          funnelHref={funnelHref}
          marked={marked}
          {...(cta ? { ctaTekst: cta } : null)}
          {...(ord ? { ord: ord.nav, wordmark: ord.footer?.brand } : null)}
        />

        <Hero funnelHref={funnelHref} overskrift={overskrift} under={under} eyebrow={eyebrow} chips={chips}
              {...(ord ? { ord: ord.hero, sekundaerHref: "#hvordan" } : null)} />
        <BevisBjaelke tal={tal} {...(ord ? { ord: ord.bevis } : null)} />
        {/* ⚠️ DET ØKONOMISKE ARGUMENT LIGGER HØJT. Kold trafik scroller ikke ned
            til en prissektion for at finde ud af hvad en opgave kan være værd. */}
        <RigtigeOpgaver funnelHref={funnelHref} {...(ord ? { ord: ord.vaerdi } : null)} />
        <OffentligeOpgaver funnelHref={funnelHref} {...(ord ? { ord: ord.offentlige } : null)} />
        <RisikoFjernet funnelHref={funnelHref} {...(ord ? { ord: ord.risiko } : null)} />
        <Problemet {...(ord ? { ord: ord.problemet } : null)} />
        <ProblemPris fag={fagNoegle} {...(ord ? { ord: ord.koster } : null)} />
        <Loesningen funnelHref={funnelHref} {...(ord ? { ord: ord.loesningen } : null)} />
        {/* ⚠️ FagBevis ER EN KLIENT-KOMPONENT, og hver prop den får,
            serialiseres ind i RSC-strømmen. `marked="DK"` flyttede altså danske
            sider uden at ændre noget synligt. Sektionen er alligevel kun
            dansk (den venter på FTS), så valget hører hjemme HER på serveren —
            ikke som en prop den selv skal læse. Se noten i Cta.js. */}
        {marked === "DK" && <FagBevis funnelHref={funnelHref} />}
        <Motoren funnelHref={funnelHref} {...(ord ? { ord: ord.motoren } : null)} />
        <SmsDemo fag={fagNoegle} {...(ord ? { ord: ord.sms } : null)} />
        {!ord && <FagVaelgerKort />}
        {/* ⚠️ ORDBOGSOPSLAGET SKER HER, PÅ SERVEREN. Vaerdi er en
            klient-komponent; læste den selv ordbogen, havnede både den danske
            og den engelske ned i klient-bundtet på hver dansk side. `ord` =
            null for DK, og så bruger sektionen husets egne konstanter. */}
        {/* ⚠️ OGSÅ `ord={null}` SERIALISERES — som "ord":null i RSC-strømmen.
            Det er ikke nok at værdien er tom; prop'en må slet ikke findes på DK.
            /kom-i-gang flyttede sig på præcis det. Derfor spread, ikke prop. */}
        <Vaerdi funnelHref={funnelHref} {...(vaerdiOrd ? { ord: vaerdiOrd } : null)} />
        {!ord && <Kundebevis />}
        <IkkePortal {...(ord ? { ord: ord.portal } : null)} />
        <Overgang funnelHref={funnelHref} {...(ord ? { ord: ord.overgang } : null)} />
        <Priser funnelHref={funnelHref} {...(ord ? { ord: ord.priser } : null)} />
        <SlutCta funnelHref={funnelHref} {...(ord ? { ord: ord.slut } : null)} />
        <SalgFaq funnelHref={funnelHref} {...(ord ? { ord: ord.faq } : null)} />
        {!ord && <EfterspoergselsLink />}

        {/* Footeren faar adressen, ikke markedet - se noten i Footer.js.
            DK sender ingenting og faar husets egen footer. */}
        {/* ⚠️ TO FOOTERE, IKKE EN MED EN GREN. Se noten i uk/FooterUk.js:
            en ny importoer af den DELTE Footer aendrede chunk-grupperingen og
            lagde et ekstra <script> paa to danske sider. DK's footer er
            uroert; UK's har sin egen fil. */}
        {O ? (
          <FooterUk supportMail={MARKEDER[marked]?.supportMail} ord={ord.footer} />
        ) : (
          <Footer />
        )}
        {/* Samme regel: DK får NØJAGTIG de props komponenten fik før ordbogen
            fandtes — kun funnelHref. Både teksten og "vis opret-opgave" har
            danske standardværdier inde i komponenten. */}
        <StickyCtaMobil
          funnelHref={funnelHref}
          {...(marked === "DK"
            ? null
            : { tekst: cta, visOpretOpgave: false })}
        />
      </div>
    </FagProvider>
  );
}
