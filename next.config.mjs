/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // ⚠️ ÉN FUNNEL (03-08-2026). /start er nu husets eneste tilmeldingsvej, og
      // alle 16 CTA'er peger derpå. /tilmeld må ikke gå død: den har stået i
      // sitemap'et, er indekseret, og kan være delt i mails og annoncer.
      //
      // 301 (permanent) frem for 302, fordi en permanent omdirigering FLYTTER
      // sidens optjente placeringer over på /start. En midlertidig ville lade
      // Google blive ved med at vise den gamle adresse — og så ville vi have to
      // sider om det samme, hvilket er præcis dét vi fjerner her.
      //
      // Query'en følger med af sig selv i Next: /tilmeld?fag=tomrer&region=nordjylland
      // lander som /start?fag=tomrer&region=nordjylland, så forvalget fra
      // fag×geo-siderne overlever springet. Uden det ville et gammelt link tabe
      // både fag og område.
      { source: "/tilmeld", destination: "/start", permanent: true },
    ];
  },
};

export default nextConfig;
