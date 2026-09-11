import StartUk from "../../../components/uk/StartUk";
import { katalogFor } from "../../../lib/katalogFor";
import { baseUrl, MARKEDER } from "../../../lib/markets";

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

export const metadata = {
  title: "Get started | Birdly",
  description:
    "Tell Birdly what you do. We'll look for relevant public and private work across the UK.",
  robots: { index: false, follow: false },
};

// ⚠️ LUK-GATEN SENDES SOM EN PROP, IKKE IMPORTERET I KOMPONENTEN.
// StartUk er en klientkomponent, og en ny importør af lib/markets ville lægge
// markedsmodellen i klientbundtet — præcis den slags chunk-ændring der før har
// flyttet danske sider uden at noget synligt ændrede sig. Serveren kender
// allerede GB; den sender bare svaret med.
export default async function UkStart() {
  const katalog = await katalogFor("GB");

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
    <StartUk
      katalog={katalog}
      pris={GB.pris}
      hjem={baseUrl("GB") || "/uk"}
      aaben={GB.lanceret === true}
    />
  );
}
