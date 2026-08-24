import Link from "next/link";

// ============================================================================
// MINIMAL FOOTER TIL /opret-opgave — B2C.
//
// ⚠️ DEN ALMINDELIGE FOOTER MÅ IKKE STÅ HER. Den linker til "Priser", som viser
// Birdlys B2B-abonnement på 499 kr./md. En privatperson der lige har læst "100 %
// gratis" og så klikker "Priser", tror at det gratis gjaldt noget andet — og går.
// Samme problem med "For dit fag", "Opgaver er for alle" og "Hvorfor Birdly": de
// fører alle ind i virksomheds-funnelen.
//
// ⚠️ INGEN SOCIALE IKONER. Den almindelige footer har [FACEBOOK-URL],
// [INSTAGRAM-URL], [GOOGLE-ANMELDELSER-URL] og [TRUSTPILOT-URL] stående som
// PLACEHOLDERE — de er døde links. Et dødt ikon på en side der skal skabe tillid er
// værre end intet ikon. De kommer med igen den dag profilerne findes.
//
// ⚠️ "Birdly.dk", ALDRIG "Birdly ApS". Der findes ikke et ApS; virksomheden er
// personligt ejet, og at opfinde en selskabsform i en footer er en oplysning om
// juridisk identitet der ikke passer. c/o-linjen er den Clearhaus har bedt om.
//
// ⚠️ INGEN GADEADRESSE HER. Den bor i handelsbetingelserne, som der linkes til.
// ============================================================================
export default function FooterB2C() {
  return (
    <footer className="foot-b2c">
      <div className="foot-b2c-inner">
        <div className="foot-b2c-navn">Birdly.dk</div>
        <div className="foot-b2c-linje">CVR 35764283 · c/o Jonas Bonde Nielsen</div>
        <div className="foot-b2c-linje">
          <a href="mailto:support@birdly.dk">support@birdly.dk</a>
        </div>
        <div className="foot-b2c-links">
          <Link href="/betingelser-private-opgaver">Betingelser for private opgaver</Link>
          <span aria-hidden="true">·</span>
          <Link href="/privatlivspolitik">Privatlivspolitik</Link>
        </div>
        <div className="foot-b2c-copy">© 2026 Birdly.dk</div>
      </div>
    </footer>
  );
}
