import StartUk from "../../../components/uk/StartUk";
import SaetLang from "../../../components/uk/SaetLang";
import { katalogFor } from "../../../lib/katalogFor";
import { hentOpgaveTal } from "../../../lib/opgaveTal";
import { baseUrl, MARKEDER } from "../../../lib/markets";
import { hreflangFor } from "../../../lib/site";

const GB = MARKEDER.GB;

// ============================================================================
// /uk/start — DEN BRITISKE FUNNEL.
//
// ⚠️ FØR DEN FANDTES, VAR UK-FORSIDEN EN TRAGT UDEN BUND: alle seks CTA'er
// pegede på `/uk/start`, og ruten eksisterede ikke.
//
// ⚠️ KATALOGET HENTES PÅ SERVEREN, IKKE I BROWSEREN. `lib/catalog.js`'
// `fetchCatalog()` sender intet markedssignal, og på en preview ville
// Edge Function'en derfor svare DK — altså Danmarks 21 fag og danske regioner
// under engelsk overskrift. Se noten i lib/katalogFor.js.
//
// ⚠️ NOINDEX, som DK's /start. Et firmanummer-felt er ikke en landingsside.
// Indgangen er salgssiden; det her er flowet BAG CTA'en. Og GB er DRAFT.
// ============================================================================

// ⚠️ CANONICAL MANGLEDE HELT (15-09-2026). /uk og /uk/terms havde en; /uk/start
// havde ingen. Siden serveres paa getbirdly.co.uk/start via proxy'en, saa uden
// canonical er der to adresser til samme side (birdly.dk/uk/start og
// getbirdly.co.uk/start) og ingen af dem udpeget. `ukAbs` bygger den paa
// GB-vaerten, ikke paa den danske - metadataBase er DK's.
//
// ⚠️ hreflang KOMMER FRA hreflangFor, IKKE SKREVET I HAANDEN. Den er gated paa
// `lanceret`, saa den returnerer null saa laenge GB er DRAFT - og Next udelader
// feltet. Den dag GB taendes, taendes hreflang samme sted for begge markeder.
export const metadata = {
  title: "Get started | Birdly",
  description:
    "Tell Birdly what you do. We'll look for relevant public work across the UK.",
  alternates: {
    canonical: baseUrl("GB") + "/start",
    languages: hreflangFor("/start") || undefined,
  },
  robots: { index: false, follow: false },
};

// ⚠️ LUK-GATEN SENDES SOM EN PROP, IKKE IMPORTERET I KOMPONENTEN.
// StartUk er en klientkomponent, og en ny importør af lib/markets ville lægge
// markedsmodellen i klientbundtet — præcis den slags chunk-ændring der før har
// flyttet danske sider uden at noget synligt ændrede sig. Serveren kender
// allerede GB; den sender bare svaret med.
export default async function UkStart() {
  const katalog = await katalogFor("GB");
  // ⚠️ KUN NAAR MOTOREN LEVERER. Samme gate som /uk's bevis-bjaelke: er
  // dataLever false, hentes der intet, `tal` er null, og stats-boksen staar der
  // slet ikke. Den dag GB's ingest koerer af sig selv, taender boksen sig selv.
  const tal = GB.dataLever ? await hentOpgaveTal("GB", baseUrl("GB")) : null;

  // ⚠️ INGEN FUNNEL UDEN BRITISKE DATA. Kan vi ikke få GB's katalog, viser vi
  // ikke en formular med danske fag og danske regioner — vi siger det ligeud.
  // Det er den samme regel som bevis-bjælken: hellere ingenting end noget der
  // ser rigtigt ud og er forkert.
  if (!katalog) {
    return (
      <div className="st" lang="en-GB">
        <div className="st-wrap">
          <div className="st-kort">
            <p className="st-fejl">
              We can&apos;t start your setup right now. Please try again in a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SaetLang lang="en-GB" />
      <StartUk
      katalog={katalog}
      pris={GB.pris}
      hjem={baseUrl("GB") || "/uk"}
      aaben={GB.lanceret === true}
        tal={tal}
      />
    </>
  );
}
