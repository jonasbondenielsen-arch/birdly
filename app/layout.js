import "./globals.css";
import Samtykke from "../components/Samtykke";
import Maaling from "../components/Maaling";
import { SITE_URL } from "../lib/site";

// Standard-metadata for hele sitet (undersider med egen title/description
// overstyrer disse). metadataBase gør og:image/relative URL'er absolutte.
// ⚠️ "offentlige" BLIVER STÅENDE — der TILFØJES kun. Sitet rangerer på præcis den
// term, og en title uden den ville koste den placering uden at vinde en ny. Men
// Birdly leverer nu også private opgaver, og en title der kun siger "offentlige"
// beskriver ikke længere produktet. Derfor begge dele, i den rækkefølge Google
// allerede kender.
//
// ⚠️ FORSIDEN FORBLIVER B2B. /opret-opgave har sin egen B2C-title og sin egen
// selv-refererende canonical — de to sider målretter hver sin søgeintention og må
// ikke konkurrere. Se app/opret-opgave/page.js.
const SITE_TITLE = "Offentlige og private opgaver direkte på SMS | Birdly";
const SITE_DESCRIPTION =
  "Få besked, når der er en opgave, der passer til dit fag og dit område — fra kommuner, regioner og staten, eller direkte fra private kunder. Birdly sender dig en SMS — gratis i 14 dage.";

export const metadata = {
  // ⚠️ SKAL være den vært der svarer 200. apex omdirigerer til www, så canonical og
  // OG-URL'er pegede før på en adresse der sender videre. Kilden er lib/site.js.
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "da_DK",
    siteName: "Birdly",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="da">
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
        {/* Ligger i layoutet, ikke pr. side: samtykket gælder hele domænet, og en
            besøgende kan lande hvor som helst. Renderer sig selv væk når der er
            taget stilling. */}
        <Samtykke />
        <Maaling />
      </body>
    </html>
  );
}
