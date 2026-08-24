import OpretOpgave from "../../components/OpretOpgave";
import { FAQ } from "../../lib/opretOpgaveFaq";
import FooterB2C from "../../components/FooterB2C";
import { SITE_URL } from "../../lib/site";

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
  },
  twitter: { card: "summary_large_image", title: B2C_TITLE, description: B2C_BESKRIVELSE },

  // ⚠️ TÆNDES AF JONAS, IKKE AF EN UDRULNING. Fjern hele robots-linjen for at gøre
  // siden indekserbar. Siden må først findes i Google når den rigtige distribution
  // er bevist live — ellers lander de første besøgende i et tomt rum.
  // Knappen i navigationen er et SEPARAT håndtag (NEXT_PUBLIC_OPRET_OPGAVE, se
  // lib/opretOpgave.js), så siden kan være åben uden at være i søgeresultater.
  robots: { index: false, follow: false },
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
