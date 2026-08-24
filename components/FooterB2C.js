import Link from "next/link";
import { BirdMark } from "./Logo";

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
// juridisk identitet der ikke passer.
//
// ⚠️ HVERKEN GADEADRESSE ELLER "c/o Jonas Bonde Nielsen" HER. Begge dele bor i
// handelsbetingelserne, hvor Clearhaus' krav om c/o er opfyldt — verificeret live
// 24-08-2026, to steder i dokumentet (§1.2 og kontaktafsnittet). Footeren linker
// derhen. Fjern det ALDRIG fra betingelserne; dér er det et krav, her er det støj.
//
// ⚠️ NAVY-BAGGRUND MED SAMME TOKEN SOM TOPBAREN (var(--navy)), ikke en hex-værdi
// der ligner. To steder med hver sin kopi af den samme farve driver fra hinanden
// første gang nogen justerer den ene.
//
// ⚠️ ORDMÆRKET ER TOPBARENS, ikke en ny styling. Samme BirdMark + samme .oo-mark/
// .oo-dk-klasser, så de to ender af siden er identiske. Det fulde logo i /public er
// tegnet til LYSE baggrunde og forsvinder næsten på navy — derfor mærket plus tekst,
// præcis som i headeren.
// ============================================================================
export default function FooterB2C() {
  return (
    <footer className="foot-b2c">
      <div className="foot-b2c-inner">
        <Link href="/" className="oo-mark foot-b2c-mark" aria-label="Birdly forside">
          <BirdMark size={26} />
          <span>Birdly<span className="oo-dk">.dk</span></span>
        </Link>
        <div className="foot-b2c-linje">CVR 35764283</div>
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
