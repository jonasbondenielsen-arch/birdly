import "./globals.css";

export const metadata = {
  title: "Birdly — offentlige udbud direkte på SMS",
  description:
    "Birdly matcher din virksomhed med relevante, konkrete offentlige udbud og sender én SMS og én kort mail. Ingen login. Ingen spam. Ingen sælgere.",
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
