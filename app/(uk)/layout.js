import "../globals.css";
import Samtykke from "../../components/Samtykke";
import Maaling from "../../components/Maaling";
import { SITE_URL } from "../../lib/site";

// ============================================================================
// ROOT-LAYOUT FOR DET BRITISKE MARKED (15-09-2026).
//
// ⚠️ DEN FINDES FOR ÉN ATTRIBUT: `<html lang="en-GB">`.
//
// Før dette var der ÉT fælles root-layout med `lang="da"`, og de britiske sider
// arvede det. Omvejen var `components/uk/SaetLang.js`, som rettede attributten
// EFTER hydrering — altså kun for en browser, aldrig for en crawler eller for en
// skærmlæser der læser den server-renderede kilde. Noten i den fil kaldte selv
// løsningen halv og pegede på route-groups som den rigtige.
//
// ⚠️ HVORFOR IKKE BARE LÆSE MARKEDET I ÉT LAYOUT? Fordi `headers()` i et layout
// gør HVER rute dynamisk. De danske sider er statisk prerenderede i dag, og den
// pris er for høj for én attribut. Route-groups koster ingenting på runtime: de
// ændrer ikke URL'er, kun hvilket layout en rute får.
//
// ⚠️ DEN ER EN TRO KOPI AF app/(dk)/layout.js PÅ ALT ANDET END SPROG OG
// STANDARD-METADATA. Samme skrifttyper, samme Samtykke (den er selv
// markedsbevidst), samme Maaling. Ét marked må ikke stille og roligt drifte fra
// det andet på chrome ingen har besluttet at ændre.
//
// ⚠️ STANDARD-METADATAEN ER ENGELSK — OG DET RETTER EN FEJL.
// Før arvede de britiske ruter den danske SITE_TITLE. Det var synligt på GB's
// 404-side, som havde titlen "Offentlige og private opgaver direkte på SMS |
// Birdly". Sider med egen metadata (/uk, /uk/start, jura-siderne) overstyrer
// alligevel; det her er kun bunden.
//
// ⚠️ INGEN noindex HER. Den sættes pr. rute (`robots` i hver page.js), fordi
// /uk er gated på GB.lanceret og jura-siderne er DRAFT. Et robots-felt i
// layoutet ville se ud som én beslutning og i virkeligheden overskrive flere.
// ============================================================================
const SITE_TITLE = "Cleaning contracts direct to your phone | Birdly";
const SITE_DESCRIPTION =
  "Birdly finds relevant public cleaning work across the UK and sends the right matches straight to your phone.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "en_GB",
    siteName: "Birdly",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function UkRootLayout({ children }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Samtykke />
        <Maaling />
      </body>
    </html>
  );
}
