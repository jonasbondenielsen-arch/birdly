/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // ⚠️ /tilmeld PEGER PÅ SALGSSIDEN, IKKE PÅ RODEN (03-08-2026).
      //
      // Adressen bar én bestemt hensigt: "jeg vil melde mig til". Sendte vi den
      // hjem til forsiden, ville vi tage en besøgende der allerede havde besluttet
      // sig og stille hende tilbage i starten af forklaringen. Salgssiden er
      // funnelens indgang og det korteste ærlige spring til /start.
      //
      // ⚠️ PRISEN, SAGT HØJT: målet er noindex, så de placeringer /tilmeld havde
      // optjent, flytter ikke med nogen steder. Det er accepteret — /tilmeld var
      // ÉN side, og dens søgeord overlappede rodens, som nu har hele
      // forklaringslaget og alle tolv FAQ-svar tilbage. Vægter du placeringerne
      // højere end hensigten, er `destination: "/"` den ene linje der skal ændres.
      //
      // Query'en følger med af sig selv i Next:
      // /tilmeld?fag=tomrer&region=nordjylland → /kom-i-gang?fag=tomrer&region=nordjylland,
      // hvor salgssiden fører den videre til /start. Forvalget overlever hele kæden.
      { source: "/tilmeld", destination: "/kom-i-gang", permanent: true },

      // /ny var salgssidens arbejdstitel mens den kørte forsøgsvis ved siden af
      // forsiden. Siden har nu et navn der siger hvad den gør; den gamle adresse
      // peger derhen frem for at give 404 til alt der er delt undervejs.
      { source: "/ny", destination: "/kom-i-gang", permanent: true },
    ];
  },
};

export default nextConfig;
