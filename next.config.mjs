/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // ⚠️ ÉN INDGANG: SALGSSIDEN PÅ RODEN (03-08-2026). Kæden er
      //   annonce / organisk / undersides-CTA → `/` (sælger) → /start (CVR-funnel).
      //
      // Begge gamle adresser samles derfor på `/`, ikke på /start. Sendte vi dem
      // direkte ind i funnelen, ville de springe hele salgsarbejdet over og lande
      // på "indtast CVR" — og et gammelt, delt link ville konvertere dårligere end
      // en ny besøgende.
      //
      // 301/308 (permanent) frem for midlertidig, fordi placeringerne SKAL flytte
      // med over på salgssiden. En midlertidig ville lade Google blive ved med at
      // vise de gamle adresser, og så havde vi tre sider om det samme.
      //
      // Query'en følger med af sig selv i Next: /tilmeld?fag=tomrer&region=nordjylland
      // lander som /?fag=tomrer&region=nordjylland, hvor salgssiden fører den videre
      // til /start. Forvalget fra fag×geo-siderne overlever altså hele kæden.
      { source: "/tilmeld", destination: "/", permanent: true },

      // /ny var salgssidens midlertidige adresse mens den kørte ved siden af den
      // gamle forside. Indholdet bor nu på roden; ruten er fjernet, så den peger
      // hjem frem for at give 404 til alt der er delt undervejs.
      { source: "/ny", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
