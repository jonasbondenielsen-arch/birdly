import "./globals.css";

// Standard-metadata for hele sitet (undersider med egen title/description
// overstyrer disse). metadataBase gør og:image/relative URL'er absolutte.
const SITE_TITLE = "Offentlige opgaver direkte på SMS | Birdly";
const SITE_DESCRIPTION =
  "Få besked, når kommuner, regioner og staten har en opgave, der passer til dit fag og dit område. Birdly sender dig en SMS — gratis i 14 dage.";

export const metadata = {
  metadataBase: new URL("https://birdly.dk"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "da_DK",
    siteName: "Birdly",
    url: "https://birdly.dk",
  },
  twitter: {
    card: "summary",
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
      <body>{children}</body>
    </html>
  );
}
