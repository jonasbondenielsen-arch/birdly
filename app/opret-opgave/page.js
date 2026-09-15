import OpretOpgave from "../../components/OpretOpgave";
import { FAQ } from "../../lib/opretOpgaveFaq";
import FooterB2C from "../../components/FooterB2C";
import { SITE_URL, abs } from "../../lib/site";

// ============================================================================
// /opret-opgave — B2C-funnelen. SEO'en her er BEVIDST ADSKILT FRA FORSIDEN.
//
// ⚠️ TO SIDER, TO SØGEINTENTIONER. birdly.dk sælger udbudsovervågning til
// VIRKSOMHEDER ("få besked om offentlige udbud i dit fag"). Denne side henvender sig
// til en PRIVATPERSON der søger "find håndværker". Deler de title og beskrivelse,
// konkurrerer de om de samme søgninger og vinder ingen af dem — og en privatperson
// der lander på et B2B-snippet klikker ikke.
//
// ⚠️ INTET OM OFFENTLIGE UDBUD I BESKRIVELSEN. Ikke fordi det er hemmeligt, men
// fordi det er den anden sides produkt. En privatperson der læser "offentlige udbud"
// i snippet'et tror hun er landet forkert.
//
// ⚠️ "op til 3 virksomheder i dit område", ALDRIG "relevante virksomheder". Det
// sidste antyder en screening vi ikke laver, og reglen gælder også her i snippet og
// OG — ikke kun i sidens egen tekst.
//
// ⚠️ SELV-REFERERENDE CANONICAL. Peger den på forsiden, fortæller vi Google at denne
// side ikke skal indekseres selvstændigt, og hele B2C-sporet forsvinder. Ingen
// kryds-canonical mellem de to sider i nogen retning.
// ============================================================================

// ⚠️ ABSOLUT URL PÅ SAMME VÆRT SOM CANONICAL. En relativ sti virker ikke til Open
// Graph — Facebook, LinkedIn og SMS-previews henter billedet fra en anden kontekst
// end siden og kan ikke opløse "/og-opret-opgave.png". abs() bygger den ud fra
// lib/site.js, som også leverer canonical og og:url, så de tre ALDRIG kan komme til
// at pege på hver sin vært (www vs. apex). Skrevet i hånden ville de kunne det.
const OG_BILLEDE = abs("/og-opret-opgave.png");

const B2C_TITLE = "Find håndværker – opret din opgave gratis | Birdly";
const B2C_BESKRIVELSE =
  "Skal du bruge en håndværker eller anden hjælp? Opret din opgave gratis, så matcher " +
  "Birdly dig med op til 3 virksomheder i dit område. Ingen konto, uforpligtende.";

export const metadata = {
  title: B2C_TITLE,
  description: B2C_BESKRIVELSE,
  alternates: { canonical: SITE_URL + "/opret-opgave" },
  openGraph: {
    title: B2C_TITLE,
    description: B2C_BESKRIVELSE,
    url: SITE_URL + "/opret-opgave",
    type: "website",
    locale: "da_DK",
    siteName: "Birdly",
    // ⚠️ ÉT BILLEDE, IKKE FLERE. Ligger der to og:image-tags, vælger Facebook selv,
    // og previewet kan skifte mellem dem uden varsel. Sitet har intet default
    // OG-billede i app/layout.js, så dette er det eneste på siden.
    //
    // ⚠️ MÅLENE STÅR EKSPLICIT (2400x1260, ratio 1,91:1). Uden width/height henter
    // Facebook billedet ned og måler det selv, og indtil da vises previewet uden
    // billede — netop den første gang linket deles, hvor det betyder mest.
    images: [{
      url: OG_BILLEDE,
      secureUrl: OG_BILLEDE,
      type: "image/png",
      width: 2400,
      height: 1260,
      alt: "Birdly.dk - Opret din opgave gratis",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: B2C_TITLE,
    description: B2C_BESKRIVELSE,
    images: [OG_BILLEDE],
  },

  // ⚠️ NOINDEX ER FJERNET 24-08-2026, efter at distributionen er bevist live: opgave
  // -> fan-out-SMS til virksomhederne -> accept -> virksomhederne synlige på kundens
  // side. Betingelsen for at aabne var netop, at en besoegende ikke maa kunne oprette
  // en opgave der ikke naar ud til nogen. Saet den ikke tilbage uden grund - siden er
  // nu maalet for betalt trafik.
};

// ⚠️ BYGGET AF SIDENS EGEN FAQ-LISTE (lib/opretOpgaveFaq.js). Structured data der ikke
// matcher det synlige indhold er en overtrædelse af Googles retningslinjer, ikke bare
// spildt arbejde — derfor ÉN kilde, importeret, aldrig en kopi. Listen ligger i et rent
// modul netop for at kunne læses både her og i klient-komponenten.
function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((q) => ({
      "@type": "Question",
      name: q.sp,
      acceptedAnswer: { "@type": "Answer", text: q.sv },
    })),
  };
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema()) }}
      />
      <OpretOpgave />
      {/* ⚠️ B2C-FOOTER, ikke den almindelige. Se noten i FooterB2C.js — den
          normale linker til "Priser" med B2B-abonnementet på 499 kr./md. */}
      <FooterB2C />
    </>
  );
}
